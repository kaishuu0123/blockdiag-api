FROM python:3.6.5-alpine

ADD . /app

WORKDIR /app
RUN apk add --update gcc linux-headers build-base zlib-dev jpeg-dev && rm -rf /var/cache/apk/*
RUN pip install -r requirements.txt

EXPOSE 8000
CMD python server.py
