#Download base image python 3.9
FROM python:3.9


# LABEL about the custom image
LABEL maintainer="g.coward@f5.com"
LABEL version="0.2"
LABEL description="Custom image for F5DCS logReceiverProxy - s3puller"


# Set display port as an environment variable
ENV DISPLAY=:99

WORKDIR  /usr/app

RUN pip install redis 
RUN pip install boto3
RUN pip install requests

# Copy logPublisher.js script and config file then start logReceiverProxy
COPY s3puller.py /usr/app/s3puller.py

CMD [ "python", "s3puller.py" ]
