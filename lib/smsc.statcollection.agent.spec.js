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
const smsc_statcollection_agent_1 = require("./smsc.statcollection.agent");
const Bluebird = require("bluebird");
var fs = require('fs');
var nock = require('nock');
Bluebird.promisifyAll(fs);
describe("SMSCStatCollectionAgent", () => {
    describe("getSMSCS", () => {
        it("should return the correct number of smsc", () => __awaiter(this, void 0, void 0, function* () {
            process.env.SMSCS = 'test/urls.test.txt';
            let collectionAgent = new smsc_statcollection_agent_1.SmscStatcollectionAgent();
            let smscs = yield collectionAgent.getSMSCS();
            expect(smscs.length).toBe(2);
            expect(smscs[0].name).toBe('tata');
            expect(smscs[1].adminURL).toBe('http://google.com');
        }));
    });
    describe("poll", () => {
        it("should poll and get the correct stats", () => __awaiter(this, void 0, void 0, function* () {
            nock('http://localhost')
                .get('/my.xml')
                .reply(200, yield fs.readFileAsync('test/smsc.xml'));
            let statSender = {
                add: jest.fn(() => __awaiter(this, void 0, void 0, function* () {
                    return null;
                }))
            };
            let collectionAgent = new smsc_statcollection_agent_1.SmscStatcollectionAgent();
            collectionAgent.reporter = statSender;
            yield collectionAgent.poll({
                name: 'tata',
                adminURL: 'http://localhost/my.xml'
            });
            expect(statSender.add).toHaveBeenCalledTimes(2);
            expect(statSender.add.mock.calls[0][0]).toBe('gallium.kannel.sms');
            expect(statSender.add.mock.calls[0][1]).toEqual({ "queued": 15, "sent": 240716 });
            expect(statSender.add.mock.calls[1][0]).toBe('gallium.kannel.binds');
            expect(statSender.add.mock.calls[1][1]).toEqual({ "bindsOnline": 8 });
        }));
    });
});
//# sourceMappingURL=smsc.statcollection.agent.spec.js.map