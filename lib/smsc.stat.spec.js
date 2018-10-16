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
const smsc_stat_1 = require("./smsc.stat");
var nock = require('nock');
var Bluebird = require('bluebird');
var fs = require('fs');
Bluebird.promisifyAll(fs);
describe('SMSCStat', () => {
    describe("getXMLFromURL", () => {
        it("should load xml from url", () => __awaiter(this, void 0, void 0, function* () {
            nock('http://localhost')
                .get('/my.xml')
                .reply(200, '<>xml</>');
            let statter = new smsc_stat_1.SMSCStatCollector();
            expect(yield statter.getXMLFromURL('http://localhost/my.xml')).toBe('<>xml</>');
        }));
    });
    describe("getStats", () => {
        it("should load xml from url", () => __awaiter(this, void 0, void 0, function* () {
            nock('http://localhost')
                .get('/my.xml')
                .reply(200, yield fs.readFileAsync('test/smsc.xml'));
            let statter = new smsc_stat_1.SMSCStatCollector();
            let stats = yield statter.getStats('http://localhost/my.xml');
            expect(stats.smsOutboundRate).toBe(9.47);
            expect(stats.smsInboundRate).toBe(1.27);
            expect(stats.dlrInboundRate).toBe(18.73);
            expect(stats.dlrOutboundRate).toBe(1.32);
            expect(stats.queueLength).toBe(15);
            expect(stats.bindsOnline).toBe(8);
            expect(stats.sent).toBe(240716);
        }));
    });
});
//# sourceMappingURL=smsc.stat.spec.js.map