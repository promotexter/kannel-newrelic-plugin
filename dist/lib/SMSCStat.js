"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml2js = require("xml2js");
const fs = require("fs");
const _ = require("lodash");
const request = require("request");
const Promise = require("bluebird");
class SMSCStat {
    constructor(name, host, port, password) {
        this.name = name;
        this.host = host;
        this.port = port;
        this.password = password;
        this.request = request;
    }
    loadStats() {
        return new Promise((resolve, reject) => {
            this.request({
                url: 'http://' + this.host + ':' + this.port + '/status.xml?password=' + this.password,
                timeout: 3000
            }, (err, res, body) => {
                if (err) {
                    resolve(false);
                }
                else {
                    this.loadXML(body)
                        .then(() => {
                        resolve();
                    })
                        .catch(err => {
                        resolve(false);
                    });
                }
            });
        });
    }
    loadXML(data) {
        return new Promise((resolve, reject) => {
            xml2js.parseString(data.toString(), (err, result) => {
                if (err) {
                    this.stats = null;
                    reject(err);
                }
                else {
                    this.stats = result;
                    resolve(true);
                }
            });
        });
    }
    loadXMLFile(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.loadXML(data.toString())
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }
    getQueueLength() {
        if (!this.stats) {
            return 1;
        }
        if (this.stats.gateway.sms[0].storesize[0] == 0) {
            return 1;
        }
        return this.stats.gateway.sms[0].storesize[0];
    }
    getSent() {
        if (!this.stats) {
            return 0;
        }
        return this.stats.gateway.sms[0].sent[0].total[0];
    }
    getOnlineBinds() {
        if (!this.stats) {
            return 0;
        }
        let smscs = this.stats.gateway.smscs[0].smsc;
        let online = 0;
        _.each(smscs, (smsc, key) => {
            let status = smsc.status[0].match(/online/);
            if (status) {
                online++;
            }
        });
        return online;
    }
}
exports.SMSCStat = SMSCStat;
