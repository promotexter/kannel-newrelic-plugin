import {SmscStatcollectionAgent} from "./smsc.statcollection.agent";
import * as Bluebird from 'bluebird';
var fs =  require('fs');
var nock = require('nock');
Bluebird.promisifyAll(fs);


describe("SMSCStatCollectionAgent", () => {
    describe("getSMSCS",  () => {
        it("should return the correct number of smsc", async () => {

            process.env.SMSCS = 'test/urls.test.txt';


            let collectionAgent = new SmscStatcollectionAgent();
            let smscs = await collectionAgent.getSMSCS();

            expect(smscs.length).toBe(2);
            expect(smscs[0].name).toBe('tata');
            expect(smscs[1].adminURL).toBe('http://google.com');

        })

    })


    describe("poll",  () => {
        it("should poll and get the correct stats", async () => {

            nock('http://localhost')
                .get('/my.xml')
                .reply(200, await fs.readFileAsync('test/smsc.xml'));


            let statSender = {
                add: jest.fn(async () => {
                    return null;
                })
            };


            let collectionAgent = new SmscStatcollectionAgent();
            (<any>collectionAgent.reporter) = statSender;
            await collectionAgent.poll({
                name: 'tata',
                adminURL: 'http://localhost/my.xml'
            });


            expect(statSender.add).toHaveBeenCalledTimes(2);
            expect(statSender.add.mock.calls[0][0]).toBe('gallium.kannel.sms');
            expect(statSender.add.mock.calls[0][1]).toEqual({"queued": 15, "sent": 240716});


            expect(statSender.add.mock.calls[1][0]).toBe('gallium.kannel.binds');
            expect(statSender.add.mock.calls[1][1]).toEqual({"bindsOnline": 8});

        })

    })
});