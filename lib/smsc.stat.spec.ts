import {SMSCStatCollector} from './smsc.stat';
var nock = require('nock');
var Bluebird = require('bluebird');

var fs =  require('fs');
Bluebird.promisifyAll(fs);


describe('SMSCStat', () => {

    describe("getXMLFromURL", () => {
        it("should load xml from url", async () => {
            nock('http://localhost')
                .get('/my.xml')
                .reply(200, '<>xml</>');

            let statter = new SMSCStatCollector();
            expect(await statter.getXMLFromURL('http://localhost/my.xml')).toBe('<>xml</>');
        })
    });


    describe("getStats", () => {
        it("should load xml from url", async () => {
            nock('http://localhost')
                .get('/my.xml')
                .reply(200, await fs.readFileAsync('test/smsc.xml'));

            let statter = new SMSCStatCollector();
            let stats = await statter.getStats('http://localhost/my.xml')


            expect(stats.smsOutboundRate).toBe(9.47);
            expect(stats.smsInboundRate).toBe(1.27);
            expect(stats.dlrInboundRate).toBe(18.73);
            expect(stats.dlrOutboundRate).toBe(1.32);
            expect(stats.queueLength).toBe(15);
            expect(stats.bindsOnline).toBe(8);
            expect(stats.sent).toBe(240716);
        })

    })
});
