#Download base image ubuntu 20.04
FROM ubuntu:20.04

# LABEL about the custom image
LABEL maintainer="g.coward@f5.com"
LABEL version="0.1"
LABEL description="Custom image for F5DCS logReceiverProxy - reciever"

# Disable Prompt During Packages Installation
ARG DEBIAN_FRONTEND=noninteractive

# Update Ubuntu Software repository
RUN apt update
RUN apt install -y npm
RUN apt install -y nodejs
RUN npm install net crypto redis@3.1.2
RUN apt clean

# Copy logReceiver.js script and config file then start logReceiverProxy
COPY logReceiver.1.2.0.js /logReceiver.js
CMD ["node", "logReceiver.js"]

# Expose Port for the Application 
EXPOSE 30601

