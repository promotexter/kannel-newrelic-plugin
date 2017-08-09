import request = require('request');
import * as Promise from 'bluebird';

export class NewrelicClient {
    license: string;
    url: string;
    request: request;

    constructor(guid:string, license: string) {
        this.url = 'https://platform-api.newrelic.com/platform/v1/metrics';
        this.license = license;
        this.request = request;
    }

    send(msg: any):Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            var msgString = JSON.stringify(msg);


            this.request({
                url: this.url,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-License-Key': this.license
                },
                body: msgString
            }, function (err, httpResponse, body) {
                if (!err) {
                    if(httpResponse.statusCode >= 300) {
                        reject(new Error('Response from newrelic: ' + body));
                    } else {
                        console.log('Newrelic Response: ', body);
                        resolve();
                    }
                } else {
                    reject(err);
                }
            });
        });

    }
}
