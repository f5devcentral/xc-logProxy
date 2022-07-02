import redis
import asyncio
# from formatWorker import *
import os
from threading import Timer

try:
    client = redis.Redis(host='localhost', port=6379, db=0)
    print("Log formatter is connected")
except:
    print("Error: Could not connect to Redis")

#misc regex
regex1 = '<14'
regex2 = '2 - '
regex3 = '\\'
regex4 = ':"{"'
regex5 = '}"'

def count(str, find, err):
    if err:
        print(err['message'])
    return len(str.split(find)) - 1

#Modify payload to normalize JSON format
def formatPayload(payload):
    while ( count(payload, regex1) > 0):
        payload = payload.replace(payload.substring(payload.index(regex1),payload.index(regex2)+3),'' )

    payload = payload.replace(regex3,'' )
    payload = payload.replace(regex4,':{"' )
    payload = payload.replace(regex5,'}' )
    payload = payload.replace(' ','' )
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
    fmtPayload(result)

#Second parameter of client.keys()
def keysCallback(err, keys):
    if err: return print(err)
    #Iterate through keys and log records
    for i in range(len(keys)):
        current = client.get(keys[i])
        if current != "" or current['result']:
            client.get(keys[i], getCallback)
            deleteRecord(keys[i])   
    
run = True

def main(err=None):
    if err:
        print(err['message'])
    print("Log formatting service started")
    if run == True:
        Timer(3,  client.keys("PRE-*", keysCallback))
    
main()