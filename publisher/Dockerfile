#Download base image ubuntu 20.04
FROM ubuntu:20.04

# LABEL about the custom image
LABEL maintainer="g.coward@f5.com"
LABEL version="0.1"
LABEL description="Custom image for F5DCS logReceiverProxy - publisher"

# Disable Prompt During Packages Installation
ARG DEBIAN_FRONTEND=noninteractive

# Update Ubuntu Software repository
RUN apt update
RUN apt install -y npm
RUN apt install -y nodejs
RUN npm install https redis@3.1.2 flat query-string
RUN apt clean

# Copy logPublisher.js script and config file then start logReceiverProxy
COPY logPublisher.js /logPublisher.js
ENTRYPOINT ["node", "logPublisher.js"]
