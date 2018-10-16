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
const stat_collector_1 = require("./stat.collector");
let fs = require('fs');
const Bluebird = require("bluebird");
Bluebird.promisifyAll(fs);
const _ = require("lodash");
const smsc_stat_1 = require("./smsc.stat");
class SmscStatcollectionAgent {
    constructor() {
        this.statter = new smsc_stat_1.SMSCStatCollector();
        this.reporter = stat_collector_1.StatCollector.getInstance();
    }
    init() {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            this.smscs = yield this.getSMSCS();
        }), parseInt(process.env.SMSCS_UPDATE_INTERVAL) || 60000);
    }
    start() {
        setInterval(() => {
            _.each(this.smscs, (smsc) => __awaiter(this, void 0, void 0, function* () {
                yield this.poll(smsc);
            }));
        }, parseInt(process.env.POLL_INTERVAL) || 10000);
    }
    poll(smsc) {
        return __awaiter(this, void 0, void 0, function* () {
            let stats = yield this.statter.getStats(smsc.adminURL);
            this.reporter.add('gallium.kannel.sms', {
                queued: stats.queueLength,
                sent: stats.sent,
                outboundRate: stats.smsOutboundRate,
                inboundRate: stats.smsInboundRate
            }, {
                route: smsc.name
            });
            this.reporter.add('gallium.kannel.dlr', {
                outboundRate: stats.dlrOutboundRate,
                inboundRate: stats.dlrInboundRate
            }, {
                route: smsc.name
            });
            this.reporter.add('gallium.kannel.binds', {
                bindsOnline: stats.bindsOnline,
            }, {
                route: smsc.name
            });
        });
    }
    getSMSCS() {
        return __awaiter(this, void 0, void 0, function* () {
            let smsc_file = process.env.SMSCS;
            let parts = (yield fs.readFileAsync(smsc_file)).toString().split("\n");
            let smscs = [];
            _.each(parts, (line) => {
                let split = line.split(',');
                smscs.push({
                    name: split[0],
                    adminURL: split[1]
                });
            });
            return smscs;
        });
    }
}
exports.SmscStatcollectionAgent = SmscStatcollectionAgent;
//# sourceMappingURL=smsc.statcollection.agent.js.map