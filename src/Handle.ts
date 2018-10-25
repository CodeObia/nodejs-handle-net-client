
import axios from 'axios';
import { Base64 } from 'js-base64';
const cmd = require('node-cmd');
const cryptoRandomString = require('crypto-random-string');
export class Handle {
    private prefix: string;
    private userPrefix: string;
    private user: string;
    private sessionId: string;
    private nonce: string;
    private keyPath: string;
    private ServerURL: string;
    private log: boolean;
    private index: string;
    private adminHandle: string;
    private config() {
        return {
            headers: {
                Authorization: `Handle sessionId="${this.sessionId}"`
            }
        }
    }
    constructor(ServerURL: string, userPrefix: string, keyPath: string, log: boolean = false) {

        if (!ServerURL || !userPrefix || !keyPath)
            throw new Error("ServerURL and  userPrefix && keyPath are requerd");


        this.userPrefix = userPrefix;
        this.ServerURL = ServerURL;
        this.keyPath = keyPath


        this.index = this.userPrefix.split(":")[0];
        this.user = this.userPrefix.split("/")[0];
        this.prefix = this.userPrefix.split("/")[1];
        this.adminHandle = this.userPrefix.split(":")[1];
        this.log = log;
         this.MakeSession()
    }

    private MakeSession() {
        this.nonce = Base64.encode(cryptoRandomString(16));
        let ServerURL = this.ServerURL;
        return new Promise((resolve, reject) => {
            axios.post(ServerURL + '/api/sessions').then((res) => {
                this.sessionId = res.data.sessionId;
                if (this.log)
                    console.log('session has been generated', this.sessionId);
                cmd.get(
                    "{ echo '" + res.data.nonce + "' | base64 -D ; echo '" + this.nonce + "' | base64 -D ; } | openssl sha256 -sign " + this.keyPath + "  | base64",
                    (err: any, signature: any, std: any) => {
                        if (err)
                            console.error(err);
                        if (this.log && std)
                            console.log(std);
                        if (this.log)
                            console.log('signature hase been generated', signature);

                        axios.put(ServerURL + '/api/sessions/this', {}, {
                            headers: {
                                Authorization: 'Handle sessionId="' + this.sessionId + '",id="' + this.user + '/' + this.prefix + '",type="HS_PUBKEY",cnonce="' + this.nonce + '",alg="SHA256",signature="' + signature.trim() + '"'
                            }
                        }
                        ).then((authorization) => {
                            if (this.log && authorization.data.authenticated)
                                console.log('Session has been authenticated', this.sessionId)
                            resolve()
                        }).catch(e => console.error(e.message));
                    }
                );
            }).catch((e) => {
                console.error(e.message)
            })
        });
    }
    deleteHandle(ID: string) {
        let $this = this;
        return new Promise((resolve, reject) => {
            Handles();
            function Handles() {
                axios.delete($this.ServerURL + '/api/handles/' + $this.prefix + '/' + ID, $this.config()).then((resp) => {
                    if (resp.data.responseCode == 1)
                        resolve(resp.data);
                }).catch((e) => {
                    if (e.response.data.responseCode == 402 || e.response.status == 401) {
                        if ($this.log)
                            console.log('generating new session')
                        $this.MakeSession().then(d => Handles())
                    } else
                        reject(e.message)
                });
            }
        });
    }
    newHandle(url: string) {
        let $this = this;
        return new Promise((resolve, reject) => {
            Handles();
            function Handles() {
                let ID = cryptoRandomString(6);
                axios.put($this.ServerURL + '/api/handles/' + $this.prefix + '/' + ID + "?overwrite=false", [
                    {
                        "index": 100,
                        "type": "HS_ADMIN",
                        "data": {
                            "format": "admin",
                            "value": {
                                "handle": $this.adminHandle,
                                "index": $this.index,
                                "permissions": "111111111111",
                                "legacyByteLength": true
                            }
                        }
                    },
                    {
                        "index": 1,
                        "type": "URL",
                        "data": {
                            "format": "string",
                            "value": url
                        },
                    }], $this.config()).then((resp) => {
                        if (resp.data.responseCode == 1)
                            resolve({ url: url, ID: ID, handle: resp.data.handle });
                    }).catch((e) => {

                        if (e.response.data.responseCode == 402 || e.response.status == 401) {
                            if ($this.log)
                                console.log('generating new session')
                            $this.MakeSession().then(d => Handles())
                        } else if (e.response.data.responseCode == 101) {
                            if ($this.log)
                                console.log('generating new ID')
                            Handles()
                        } else
                            reject(e.message)
                    });
            }
        });
    }

    listHandles() {
        let $this = this;
        return new Promise((resolve, reject) => {
            getHandles();
            function getHandles() {
                axios.get($this.ServerURL + '/api/handles?prefix=' + $this.prefix, {
                    headers: {
                        Authorization: `Handle sessionId="${$this.sessionId}"`
                    }
                }).then((resp) => {
                    resolve(resp.data);
                }).catch((e) => {
                    if (e.response.data.responseCode == 402) {
                        if ($this.log)
                            console.log('generating new session')
                        $this.MakeSession().then(d => getHandles())
                    } else
                        reject(e.message)
                });
            }
        });
    }
}

