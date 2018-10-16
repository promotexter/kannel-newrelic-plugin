"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const xml2js = require("xml2js");
const Bluebird = require("bluebird");
const _ = require("lodash");
const request = require("request-promise");
Bluebird.promisifyAll(xml2js);
class SMSCStatCollector {
    constructor() {
        this.request = request;
    }
    loadXML(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield xml2js.parseStringAsync(data.toString());
        });
    }
    getXMLFromURL(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.request({
                url: url,
                timeout: 3000
            });
            return res;
        });
    }
    getStats(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let xml = yield this.getXMLFromURL(url);
            let stats = yield this.loadXML(xml);
            return {
                smsOutboundRate: this.getSmsOutboundRate(stats),
                smsInboundRate: this.getSmsInboundRate(stats),
                dlrOutboundRate: this.getDlrOutboundRate(stats),
                dlrInboundRate: this.getDlrInboundRate(stats),
                bindsOnline: this.getOnlineBinds(stats),
                queueLength: this.getQueueLength(stats),
                sent: this.getSent(stats)
            };
        });
    }
    getSmsOutboundRate(stats) {
        if (!stats) {
            return 0;
        }
        let res = stats.gateway.sms[0].outbound[0].split(',')[0];
        return parseFloat(res);
    }
    getSmsInboundRate(stats) {
        if (!stats) {
            return 0;
        }
        let res = stats.gateway.sms[0].inbound[0].split(',')[0];
        return parseFloat(res);
    }
    getDlrOutboundRate(stats) {
        if (!stats) {
            return 0;
        }
        let res = stats.gateway.dlr[0].outbound[0].split(',')[0];
        return parseFloat(res);
    }
    getDlrInboundRate(stats) {
        if (!stats) {
            return 0;
        }
        let res = stats.gateway.dlr[0].inbound[0].split(',')[0];
        return parseFloat(res);
    }
    getQueueLength(stats) {
        if (!stats) {
            return 1;
        }
        if (stats.gateway.sms[0].storesize[0] == 0) {
            return 0;
        }
        return parseInt(stats.gateway.sms[0].storesize[0]);
    }
    getSent(stats) {
        if (!stats) {
            return 0;
        }
        return parseInt(stats.gateway.sms[0].sent[0].total[0]);
    }
    getOnlineBinds(stats) {
        if (!stats) {
            return 0;
        }
        let smscs = stats.gateway.smscs[0].smsc;
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
exports.SMSCStatCollector = SMSCStatCollector;
//# sourceMappingURL=smsc.stat.js.map