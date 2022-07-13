import redis
import os
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
regex7 = ':[]'

def count(string, find):
    return len(string.split(find))

#Modify payload to normalize JSON format
def formatPayload(payload):
    
    while count(payload,regex1) > 0:
        try:
            payload = payload.replace(payload[payload.index(regex1):payload.index(regex2)+len(regex2)-1], '')
        except:
            pass
        try:
            payload = payload.replace(payload[payload.index(regex1):payload.index(regex6)+len(regex6)-1], '')
        except:
            return payload

    while count(payload,regex3) > 0:
        payload = payload.replace(regex3,'' )

    while count(payload,regex4) > 0:
        payload = payload.replace(regex4,':{"' )

    while count(payload,regex5) > 0:
        payload = payload.replace(regex5,'}' )
        
    while count(payload,regex7) > 0:
        payload = payload.replace(regex7,'' )
        return payload

    return payload

run = True

def callback():
    for keybatch in batcher(client.scan_iter('PRE-*'),500):
        print('Formatting batch - ',*keybatch)
        payload = formatPayload(client.get(*keybatch))
        id = os.urandom(4).hex()
        client.set('POST-'+id, payload)
        client.delete(*keybatch)

def batcher(iterable, n):
    args = [iter(iterable)]
    return zip_longest(*args)

def main():
    print("Log formatting service started")
    #keys = client.keys('PRE-*')
    while run == True:
        try:
            callback()
            time.sleep(3)
        except KeyboardInterrupt:
            break
    
main()
