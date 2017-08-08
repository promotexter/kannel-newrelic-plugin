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
                url: 'http://' + this.host + ':' + this.port + '/status.xml?password=' + this.password
            }, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.loadXML(body);
                    resolve(true);
                }
            });
        });
    }
    loadXML(data) {
        return new Promise((resolve, reject) => {
            xml2js.parseString(data.toString(), (err, result) => {
                if (err) {
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
        return this.stats.gateway.sms[0].storesize[0];
    }
    getSent() {
        return this.stats.gateway.sms[0].sent[0].total[0];
    }
    getOnlineBinds() {
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
