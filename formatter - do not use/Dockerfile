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
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x  | bash -
RUN apt-get -y install nodejs
WORKDIR /usr/app
COPY ./ ./
RUN npm install https redis@3.1.2
RUN apt clean

# Copy logPublisher.js script and config file then start logReceiverProxy
COPY logFormatter.1.1.8.js /usr/app/logFormatter.js
COPY formatWorker.js /usr/app/formatWorker.js

ENTRYPOINT ["node", "logFormatter.js"]
