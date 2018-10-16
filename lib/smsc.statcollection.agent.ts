import {StatCollector} from "./stat.collector";

let fs = require('fs');
import * as Bluebird from 'bluebird';
Bluebird.promisifyAll(fs);
import * as _ from 'lodash';
import {SMSCStatCollector} from "./smsc.stat";



export interface SMSC {
    name: string,
    adminURL: string;
}

export class SmscStatcollectionAgent {

    smscs: SMSC[];
    statter: SMSCStatCollector;
    reporter: StatCollector;

    constructor() {
        this.statter = new SMSCStatCollector();
        this.reporter = StatCollector.getInstance();
    }

    init() {
        setInterval(async () => {
            this.smscs = await this.getSMSCS();
        }, parseInt(process.env.SMSCS_UPDATE_INTERVAL) || 60000)
    }

    start() {
        setInterval(() => {
            _.each(this.smscs, async (smsc) => {
                await this.poll(smsc);
            });
        }, parseInt(process.env.POLL_INTERVAL) || 10000)
    }

    async poll(smsc: SMSC) {

        let stats = await this.statter.getStats(smsc.adminURL);

        this.reporter.add('gallium.kannel.sms', {
            queued: stats.queueLength,
            sent: stats.sent,
            outboundRate: stats.smsOutboundRate,
            inboundRate: stats.smsInboundRate
        },
        {
            route: smsc.name
        });

        this.reporter.add('gallium.kannel.dlr', {
            outboundRate: stats.dlrOutboundRate,
            inboundRate: stats.dlrInboundRate
        },
        {
            route: smsc.name
        });

        this.reporter.add('gallium.kannel.binds', {
            bindsOnline: stats.bindsOnline,
        },
        {
            route: smsc.name
        });

    }

    async getSMSCS(): Promise<SMSC[]> {
        let smsc_file = process.env.SMSCS;

        let parts = (await fs.readFileAsync(smsc_file)).toString().split("\n");

        let smscs = [];
        _.each(parts, (line) => {

            let split = line.split(',');

            smscs.push({
                name: split[0],
                adminURL: split[1]
            });
        });

        return smscs;
    }

}