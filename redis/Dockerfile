#Download base image ubuntu 20.04
FROM redis

# LABEL about the custom image
LABEL maintainer="g.coward@f5.com"
LABEL version="0.1"
LABEL description="Custom image for F5DCS logReceiverProxy - reciever"

# Add in custom redis conf
COPY redis.conf /data/redis.conf
CMD [ "redis-server", "/data/redis.conf" ]