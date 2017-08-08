import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as _ from 'lodash'
import request = require('request');
import * as Promise from 'bluebird';

export class SMSCStat {

    stats: any;
    host: string;
    port: number;
    password: string;
    request: any;
    name: string;

    constructor(name: string, host: string, port: number, password: string) {
        this.name = name;
        this.host = host;
        this.port = port;
        this.password = password;
        this.request = request;
    }
    loadStats(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.request({
                url: 'http://' + this.host + ':' + this.port + '/status.xml?password=' + this.password
            }, (err, res, body) => {
                if(err) {
                    reject(err);
                } else {
                    this.loadXML(body);
                    resolve(true);
                }
            })
        });

    }

    loadXML(data: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            xml2js.parseString(data.toString(), (err, result) => {
                if(err) {
                    reject(err);
                } else {
                    this.stats  = result;
                    resolve(true);
                }
            })
        });
    }
    loadXMLFile(filename: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if(err) {
                    reject(err);
                } else {
                    this.loadXML(data.toString())
                        .then(resolve)
                        .catch(reject)
                }
            })
        });
    }

    getQueueLength(): number  {
        return this.stats.gateway.sms[0].storesize[0];
    }

    getSent(): number {
        return this.stats.gateway.sms[0].sent[0].total[0];
    }

    getOnlineBinds(): number {
        let smscs = this.stats.gateway.smscs[0].smsc;
        let online = 0;
        _.each(smscs, (smsc, key) => {
            let status = smsc.status[0].match(/online/);
            if(status) {
                online++;
            }
        });
        return online;
    }
}