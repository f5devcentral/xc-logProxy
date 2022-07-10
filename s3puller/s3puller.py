# Import required modules
import os
import redis
import tarfile
import boto3
import io
import time
import gzip
import requests
import aiohttp
import asyncio


access_key_id = os.environ.get('AWS_ACCESS_KEY_ID')
secret_access_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
datadog_token = os.environ.get('DATADOG_TOKEN')
bucket_name = os.environ.get('BUCKET_NAME')
count = 0

# boto3.resource also supports region_name
s3_resource = boto3.resource('s3',
    aws_access_key_id = access_key_id,
    aws_secret_access_key = secret_access_key
)

try:
    client = redis.StrictRedis(host='localhost', port=6379, db=0, charset="utf-8", decode_responses=True)
    print("S3 puller is connected")
    run = True
except:
    print("Error: Could not connect to Redis")
    run = False

def datadog_push(content):
    datadog_endpoint = 'https://http-intake.logs.datadoghq.com/api/v2/logs'
    contentarray = content.split('\n')
    for i in range(len(contentarray)):
        result = datadog_push(str(contentarray[i]))
        id = os.urandom(4).hex()
        #Post record ID and record to Redis
        print("Events formatted - " + id)
        client.set('POST-'+id, content)
        #payload = payload.replace('{','{"ddsource":"f5dcs_logproxy",');
        x = requests.post( datadog_endpoint, data = result, headers = {'Content-Length': str(len(payload)), 'Content-Type': 'application/json','DD-API-KEY': datadog_token})
    return(x)

def datadog_publish(content):
    contentarray = content.split('\n')
    datadog_endpoint = 'https://http-intake.logs.datadoghq.com/api/v2/logs'
    async def get(datadog_endpoint):
    async with aiohttp.ClientSesion() as session:
        i = 0
        async with session.post(url, json=contentarray[])
            i++d
            return response
    loop = asyncio.get_event_loop()

    multiple_requests = [get("http://your-website.com") for _ in range(10)]

    results = loop.run_until_complete(asyncio.gather(*multiple_requests))

    print("Results: %s" % results)

def s3_puller():
    s3_bucket_name = bucket_name
    s3_bucket = s3_resource.Bucket(s3_bucket_name)
    for obj in s3_bucket.objects.all():
        s3_object = s3_resource.Object(s3_bucket_name, obj.key)
        
        keyname = str(obj.key)
        filename = keyname[keyname.rindex('/')+1:]
        
        s3_object.download_file(filename)

        with gzip.open(filename, 'rb') as ip:
            with io.TextIOWrapper(ip, encoding='utf-8') as decoder:
                # Let's read the content using read()
                content = decoder.read()
                #print(content)
                result = datadog_push(content)
                #print(result)
            
        # Delete S3 file and local temp file    
        s3_object.delete()
        if os.path.exists(filename):
            os.remove(filename)
        
def main():
    print("S3 puller service started")
    while run == True:
        try:
            print('Pulling now....')
            s3_puller()
            time.sleep(3)
        except KeyboardInterrupt:
            break
main()