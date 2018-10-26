# Nodejs handle.net client

Handle.net rest api client with  Challenge-Response Request from Client to Server Authentication

Note: this still experimental repository its not tested on production
## Install

```javascript
$ npm install --save nodejs-handle-net-client
```


## Usage

### Javascript

```javascript
var Handle = require("nodejs-handle-net-client").Handle
```

## TypeScript

```javascript
import  Handle  from 'nodejs-handle-net-client';
```

## SYNOPSIS


```javascript

    var handleClient = new Handle('https:localhost:8000', '300:0.NA/prefix', 'privetkey.pem',true);

    // list all handles 
    handleClient.listHandles().then(d => console.log(d)).catch(e=>console.log(e));;
    // delete handle 
    handleClient.deleteHandle('1234').then(d => console.log(d)).catch(e=>console.log(e));
    // add new handle with value of URL
    handleClient.newHandle('URL').then((d) => console.log(d)).catch(e=>console.log(e));

```

