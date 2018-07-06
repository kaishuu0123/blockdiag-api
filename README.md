# blockdiag-api

## Demo

* https://blockdiag-api.com/

## Use docker-compose

```shell
$ docker-compose build app
$ docker-compose up
```

## API Reference

* endpoint: `/api/v1/<diagram type (actdiag or blockdiag ...)>`
* http method: `POST`
* http header: `Content-Type: application/json;`
* JSON payload
    ```javascript
    {
      "source": "<diagram syntax>"
    }
    ```
* example curl command
    ```shell
    $ curl -XPOST \
       -H 'Content-Type: application/json' \
       -d '{ "source": "blockdiag {\n  A -> B; \n B -> C; \n}" }' \
       http://localhost:8000/api/v1/blockdiag
    ```

## Development

* python 3.6.5
* Node.js v8.11.2
* npm v5.6.0

### Server Side

```shell
$ pip install -r requirements.txt
$ python server.py
```

### Client Side

```shell
$ cd ui-src
$ npm install
$ npm run start
```
