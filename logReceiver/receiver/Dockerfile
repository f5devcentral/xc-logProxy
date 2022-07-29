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
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_18.x  | bash -
RUN apt-get -y install nodejs
WORKDIR /usr/app
COPY ./ ./
RUN npm install net crypto redis@3.1.2
RUN apt clean
RUN openssl genrsa -out key.pem
RUN openssl req -new -key key.pem -passin pass: -subj "/C=US/ST=…/L=.../O=.../OU=.../CN=.../emailAddress=..." -out csr.pem
RUN openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
RUN rm csr.pem
# Copy logReceiver.js script and config file then start logReceiverProxy
COPY logReceiver.1.1.7.js /usr/app/logReceiver.js
CMD ["node", "logReceiver.js"]