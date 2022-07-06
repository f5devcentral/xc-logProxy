#Download base image python 3.9
FROM python:3.9


# LABEL about the custom image
LABEL maintainer="g.coward@f5.com"
LABEL version="0.2"
LABEL description="Custom image for F5DCS logReceiverProxy - publisher"


# Set display port as an environment variable
ENV DISPLAY=:99

WORKDIR  /usr/app

RUN pip install redis 

# Copy logPublisher.js script and config file then start logReceiverProxy
COPY pypublisher.1.0.py /usr/app/pypublisher.py

CMD [ "python", "pypublisher.py" ]
