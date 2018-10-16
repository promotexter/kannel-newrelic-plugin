import * as xml2js from 'xml2js';
import * as Bluebird from 'bluebird';
import * as _ from 'lodash'
import request = require('request-promise');
Bluebird.promisifyAll(xml2js);
// import * as Promise from 'bluebird';

export interface SMSCStat {
    smsOutboundRate: number;
    smsInboundRate: number;
    dlrOutboundRate: number;
    dlrInboundRate: number;
    bindsOnline: number;
    queueLength: number;
    sent: number;
}

export class SMSCStatCollector {

    stats: any;
    request: any;
    name: string;
    url: string;

    constructor() {
        this.request = request;
    }

    async loadXML(data: string): Promise<any> {
        return await (<any>xml2js).parseStringAsync(data.toString());
    }

    async getXMLFromURL(url:string): Promise<any> {
        let res = await this.request({
            url: url,
            timeout: 3000
        });

        return res;
    }
    async getStats(url: string): Promise<SMSCStat> {
        let xml:any = await this.getXMLFromURL(url);
        let stats = await this.loadXML(xml);
        return {
            smsOutboundRate: this.getSmsOutboundRate(stats),
            smsInboundRate: this.getSmsInboundRate(stats),
            dlrOutboundRate: this.getDlrOutboundRate(stats),
            dlrInboundRate: this.getDlrInboundRate(stats),
            bindsOnline: this.getOnlineBinds(stats),
            queueLength: this.getQueueLength(stats),
            sent: this.getSent(stats)
        }
    }


    getSmsOutboundRate(stats: any):number {
        if(!stats) {
            return 0;
        }

        let res = stats.gateway.sms[0].outbound[0].split(',')[0];

        return parseFloat(res);

    }

    getSmsInboundRate(stats: any):number {

        if(!stats) {
            return 0;
        }

        let res = stats.gateway.sms[0].inbound[0].split(',')[0];

        return parseFloat(res);

    }

    getDlrOutboundRate(stats: any):number {
        if(!stats) {
            return 0;
        }

        let res = stats.gateway.dlr[0].outbound[0].split(',')[0];

        return parseFloat(res);

    }

    getDlrInboundRate(stats: any):number {
        if(!stats) {
            return 0;
        }

        let res = stats.gateway.dlr[0].inbound[0].split(',')[0];

        return parseFloat(res);

    }



    getQueueLength(stats:any): number  {
        if(!stats) {
           return 1;
        }

        if(stats.gateway.sms[0].storesize[0] == 0) {
            return 0;
        }
        return parseInt(stats.gateway.sms[0].storesize[0]);
    }

    getSent(stats: any): number {
        if(!stats) {
            return 0;
        }
        return parseInt(stats.gateway.sms[0].sent[0].total[0]);
    }

    getOnlineBinds(stats:any): number {
        if(!stats) {
            return 0;
        }
        let smscs = stats.gateway.smscs[0].smsc;
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