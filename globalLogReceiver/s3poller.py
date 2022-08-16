
# Import required modules
import os, sys, stat
import boto3
import io
import time
import gzip
#import requests
import urllib3

http = urllib3.PoolManager()

access_key_id = "AKIATU2JBUC6VBHDH3OH"
secret_access_key = "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"
datadog_token = "7b3937e27be3fbcb7265f0d10d20289f"
bucket_name = "glc-logbucket"
#splunk_host = ""
#splunk_hec = "*****************"
analytic_provider = "datadog"
sumo_url = ""

run = True

# boto3.resource also supports region_name
s3_resource = boto3.resource('s3',
    aws_access_key_id = access_key_id,
    aws_secret_access_key = secret_access_key
)


def s3_puller():
    s3_bucket_name = bucket_name
    s3_bucket = s3_resource.Bucket(s3_bucket_name)
    for obj in s3_bucket.objects.all():
        s3_object = s3_resource.Object(s3_bucket_name, obj.key)
        
        keyname = str(obj.key)
        filename = keyname[keyname.rindex('/')+1:]
        
        s3_object.download_file(filename)
        # Delete S3 file    
        s3_object.delete()

        with gzip.open(filename, 'rb') as ip:
            with io.TextIOWrapper(ip, encoding='utf-8') as decoder:

                # Let's read the content using read()
                content = decoder.read()
                chunks = content.split('\n')
                    
                if analytic_provider == "datadog":
                    x = len(chunks)
                    i = 0
                    payload = "["
                    while i < x:
                        payload = payload + chunks[i].replace('{', '{"ddsource": "f5dcs_global_logreceiver",', 1)
                        if (i + 1 < x):
                            payload = payload + ","
                        i = i + 1
                    payload = payload + "]"
                    #print(payload)
                    r = http.request(
                        "POST",
                        "https://http-intake.logs.datadoghq.com/api/v2/logs",
                        body = gzip.compress(payload.encode('utf-8')),
                        headers = {"Content-Type":"application/json", "DD-API-KEY": datadog_token, "Content-Encoding": "gzip"}
                    )
                elif analytic_provider == "splunk":
                    x = len(chunks)
                    i = 0
                    payload = "["
                    while i < x:
                        payload = payload + chunks[i]
                        if (i + 1 < x):
                            payload = payload + ","
                        i = i + 1
                    payload = payload + "]"
                    #print(payload)
                    destHost = "https://" + splunk_host + ":8088/services/collector/raw"
                    r = requests.post(
                        destHost,
                        data = gzip.compress(payload.encode('utf-8')),
                        headers = {"Content-Type":"application/json",   "Authorization": "Splunk " + splunk_hec, "Content-Encoding": "gzip"},
                        verify = False
                    )
                elif analytic_provider == "sumologic":
                    x = len(chunks)
                    i = 0
                    payload = "["
                    while i < x:
                        payload = payload + chunks[i]
                        if (i + 1 < x):
                            payload = payload + ","
                        i = i + 1
                    payload = payload + "]"
                    #print(payload)

                    r = requests.post(
                        sumo_url,
                        data = gzip.compress(payload.encode('utf-8')),
                        headers = {"Content-Type":"application/json",   "Authorization": "Splunk " + splunk_hec, "Content-Encoding": "gzip"},
                        verify = False
                    )
                print(r)
                print("File - " + filename + ' processed')

        #Delete local temp file 
        if os.path.exists(filename):
            os.remove(filename)
        
def main():
    print("S3 poller service started")
    while run == True:
        try:
            print('Pulling now....')
            s3_puller()
            run == True
            time.sleep(6)
        except KeyboardInterrupt:
            break
main()