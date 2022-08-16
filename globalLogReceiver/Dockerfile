#Download base image python 3.9
FROM python:3.9

RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1001 ubuntu
USER ubuntu
WORKDIR /home/ubuntu

# LABEL about the custom image
LABEL maintainer="g.coward@f5.com"
LABEL version="0.2"
LABEL description="Custom image for F5DCS Global Log Receiver s3puller"


# Set display port as an environment variable
ENV DISPLAY=:99

RUN pip install boto3
RUN pip install requests

# Copy logPublisher.js script and config file then start logReceiverProxy
COPY s3poller.py /usr/app/s3poller.py

CMD [ "python", "s3poller.py" ]
