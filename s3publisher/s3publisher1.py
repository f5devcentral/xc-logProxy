import asyncio
import aiohttp
import argparse
import os
parser = argparse.ArgumentParser(description='Build Script for RayGun')
parser.add_argument('-host', help="url host of the site")
parser.add_argument('-folder', help="folder which needs to be updated")
parser.add_argument('-url', help="raygun url")
args = vars(parser.parse_args())
async def send_file(path, f_name):
   file_url = os.path.join(path, f_name)
   url = args['url']
   async with aiohttp.ClientSession() as session:
      _url = args['host'] + file_url[2:]
      print (_url.replace('\\','/'))
      async with  session.post(url, data ={
            'url': _url.replace('\\','/'),
            'file': open(file_url, 'rb')
      }) as response:
            data = await response.text()
            print (data)
futures = []
for path, subddir, files in os.walk(args['folder']):
     for f_name in files:
           futures.append(send_file(path, f_name))
loop = asyncio.get_event_loop()
loop.run_until_complete(asyncio.wait(futures))