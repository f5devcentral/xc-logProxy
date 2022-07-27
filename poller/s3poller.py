
# Import required modules
import os
import boto3
import io
import time
import gzip
import requests

access_key_id = os.environ.get('AWS_ACCESS_KEY_ID')
secret_access_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
datadog_token = os.environ.get('DATADOG_TOKEN')
bucket_name = os.environ.get('BUCKET_NAME')
pub_count = os.environ.get('PUB_COUNT')
splunk_host = os.environ.get('SPLUNK_HOST')
splunk_hec = os.environ.get('SPLUNK_HEC')
analytic_provider = os.environ.get('ANALYTIC_PROVIDER')
sumo_url = os.environ.get('SUMO_URL')

run = True

# boto3.resource also supports region_name
s3_resource = boto3.resource('s3',
    aws_access_key_id = access_key_id,
    aws_secret_access_key = secret_access_key
)


def s3_puller():
    count = 0
    s3_bucket_name = bucket_name
    s3_bucket = s3_resource.Bucket(s3_bucket_name)
    for obj in s3_bucket.objects.all():
        if (count >= int(pub_count)):
            count = 1
        else: 
            count += 1
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
                    r = requests.post(
                        "https://http-intake.logs.datadoghq.com/api/v2/logs",
                        data = gzip.compress(payload.encode('utf-8')),
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
            time.sleep(6)
        except KeyboardInterrupt:
            break
main()