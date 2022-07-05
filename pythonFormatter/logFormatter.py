import redis
#import asyncio
# from formatWorker import *
import os
# from threading import Timer
import re
import time
from itertools import zip_longest


try:
    client = redis.StrictRedis(host='localhost', port=6379, db=0, charset="utf-8", decode_responses=True)
    print("Log formatter is connected")
except:
    print("Error: Could not connect to Redis")

#misc regex
regex1 = "<14"
regex2 = '2 - '
regex3 = '\\'
regex4 = ':"{"'
regex5 = '}"'
regex6 = '7 - '
regex7 = '{"ddsource"'

def count(string, find):
    # print(string)
    #print(len(string.split(find)) - 1)
    return len(string.split(find))

#Modify payload to normalize JSON format
def formatPayload(payload):
    print("start")
    #print(payload[:75])

    # print(payload.index(regex2))
    # print(type(str(regex1)), type(str(payload[:4])))
    # print(regex1, payload[:3])
    # print(payload[payload.index(regex1):payload.index(regex2)+3])
    #try:
    #    payload = payload.replace(payload[payload.index(regex1):payload.index(regex2)+3],'')
    #except:
    #    print("Nope")
        
    #try:
        #payload = payload[70:]
        #payload.replace(payload[payload.index(regex1):payload.index(regex7)+len(regex7)],'')
    #except:
    #    print("Double nope")
    
    #hile ( count(payload, regex1) > 0){payload = payload.replace(payload.substring(payload.indexOf(regex1),payload.indexOf(regex2)+3),'' 
    while count(payload, regex1) > 0:
        try:
            payload = payload.replace(payload[payload.index(regex1):payload.index(regex2)+len(regex2)-1], '')   
        except:
            pass
        try:
            payload = payload.replace(payload[payload.index(regex1):payload.index(regex6)+len(regex6)-1], '')
        except:
            #print("OH SHIT")
            return payload

    payload = payload.replace(regex3,'' )
    payload = payload.replace(regex4,':{"' )
    payload = payload.replace(regex5,'}' )
    payload = payload.replace(' ','' )

    if payload.slice(-1) != '}':
        payload = payload + '"}'

    print("end")
    #print(payload[:75])

    return payload

#Second parameter of client.delete()
def deleteCallback(err, response):
    if response == 1:
        print("Delete Successfully")
    else:
        print("Cannot delete")
        main()


def deleteRecord(key, err):
    if err:
        print(err['message'])

    client.delete(key, deleteCallback)

#Async version of fmtPayload
# async def fmtPayload(payload, err):
#     if err: raise err
#     result = await formatPayload(payload)

#     id = os.urandom(4).hex()
#     #Post record ID and record to Redis
#     client.set('POST-'+id, result)
#     print("Events formatted - " + id)


def fmtPayload(payload, err):
    if err: raise err
    result = formatPayload(payload)

    id = os.urandom(4).hex()
    #Post record ID and record to Redis
    client.set('POST-'+id, result)
    print("Events formatted - " + id)

#Second parameter of client.get()
def getCallback(err, result):
    if err:
        print(err)
        raise ValueError(err['message'])
    return fmtPayload(result)

#Second parameter of client.keys()
def keysCallback(err, keys):
    # print("test")
    if err: return err
    #Iterate through keys and log records
    for i in range(len(keys)):
        current = client.get(keys[i])
        if current != "" or current['result']:
            client.get(keys[i], getCallback)
            deleteRecord(keys[i])   
    
run = True

def callbackTest():
    # print("hey")

    # client.keys("PRE-*", keysCallback(err, keys))
    # in batches of 500 delete keys matching user:*
    for keybatch in batcher(client.scan_iter('PRE-*'),500):
        print(*keybatch)
        test = formatPayload(client.get(*keybatch))
        id = os.urandom(4).hex()
        client.set('POST-'+id, test)
        client.delete(*keybatch)

def batcher(iterable, n):
    args = [iter(iterable)]
    return zip_longest(*args)

def main():
    print("Log formatting service started")
    keys = client.keys('PRE-*')
    #print(keys)
    while run == True:
        try:
            callbackTest()
            time.sleep(3)
        except KeyboardInterrupt:
            break
    
main()