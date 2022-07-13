import redis
import requests
import os
import re
from time import sleep, perf_counter
from itertools import zip_longest
from concurrent.futures import ThreadPoolExecutor

datadog_token = os.environ.get('DATADOG_TOKEN')
run = True

try:
    client = redis.StrictRedis(host='localhost', port=6379, db=0, charset="utf-8", decode_responses=True)
    print("Log formatter is connected")
except:
    print("Error: Could not connect to Redis")

def postRecord(chunk):
    r = requests.post(
        "https://agent-http-intake.logs.datadoghq.com/api/v2/logs",
        data=chunk,
        headers={"Content-Type": "application/json","DD-API-KEY": datadog_token}
    )
    return r

def callback():
    for keybatch in batcher(client.scan_iter('POST-*'),10):
        print('Posting records - ',*keybatch)
        x = 0
        chunks = client.get(*keybatch).split('\n')
        start = perf_counter()
        with ThreadPoolExecutor() as executor:
            while x < 10:
                executor.submit(postRecord, chunks[x])
                x += 1

        client.delete(*keybatch)
        finish = perf_counter()
        print(f"It took round({finish-start},2) second(s) to finish.")

def batcher(iterable, n):
    args = [iter(iterable)]
    return zip_longest(*args)

def main():
    print("Log formatting service started")
    #keys = client.keys('PRE-*')
    while run == True:
        try:
            callback()
            #time.sleep(1)
        except KeyboardInterrupt:
            break
    
main()
