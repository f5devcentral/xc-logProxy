#Download base image ubuntu 20.04
FROM ubuntu:20.04

# LABEL about the custom image
LABEL maintainer="g.coward@f5.com"
LABEL version="0.1"
LABEL description="Custom image for F5DCS logReceiverProxy - reciever"

WORKDIR /usr/app
COPY ./ ./

RUN apt update
RUN apt-get -y install redis

# Add in custom redis conf
COPY redis.conf /usr/app/redis.conf
CMD [ "redis-server", "redis.conf" ]