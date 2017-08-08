import * as chai from 'chai';
import {SMSCStat} from '../lib/SMSCStat';
import * as sinon from 'sinon';

let assert = chai.assert;

describe('SMSCStat', function() {
    describe('loadStats', function() {
        it('try to load stats from url', function(done) {
            let smscStat = new SMSCStat('test', 'localhost', 8080, 'test');
            sinon.stub(smscStat, 'request').onCall(0).returns("<test></test>");
            // sinon.stub(smscStat, 'loadStats').onCall(0).returns(Promise.resolve());

            smscStat.loadStats()
            let args = smscStat.request.getCall(0).args[0];
            assert.equal('http://localhost:8080/status.xml?password=test', args.url);
            done();

        })
    })
    describe('load', function() {
        it('must be able to load xml file from path', function(done) {
            let smscStat = new SMSCStat('test', 'localhost', 8080, 'test');
            smscStat.loadXMLFile(__dirname + '/../../src/test/test.xml')
                .then(status => {
                    assert.equal(status, true);
                    done();
                })
                .catch(err => {
                    done(err);
                })
        });

        it('fail when file does not exists', function(done) {
            let smscStat = new SMSCStat('test', 'localhost', 8080, 'test');
            smscStat.loadXMLFile(__dirname + '/../../src/test/test.xmlx')
                .then(status => {
                    done(new Error('did not fail when loading non existing file'));
                })
                .catch(err => {
                    done();
                })
        });
    });
    describe('getSent', function() {
      it('sent transactions for each smsc', function(done) {
          let smscStat = new SMSCStat('test', 'localhost', 8080, 'test');
          smscStat.loadXMLFile(__dirname + '/../../src/test/test.xml')
              .then(() => {
                let sent = smscStat.getSent();
                assert.equal(sent, 15400);
                done();
              })
              .catch(err => {
                  done(err);
              })
      })
    })
    describe('getQueueLength', function() {
        it('get current queue length', function(done) {
            let smscStat = new SMSCStat('test', 'localhost', 8080, 'test');
            smscStat.loadXMLFile(__dirname + '/../../src/test/test.xml')
                .then(() => {
                    let sent = smscStat.getQueueLength();
                    assert.equal(sent, 0);
                    done();
                })
                .catch(err => {
                    done(err);
                })
        })
    })
    describe('getOnlineBinds', function() {
        it('get current queue length', function(done) {
            let smscStat = new SMSCStat('test', 'localhost', 8080, 'test');
            smscStat.loadXMLFile(__dirname + '/../../src/test/test.xml')
                .then(() => {
                    let sent = smscStat.getOnlineBinds();
                    assert.equal(sent, 3);
                    done();
                })
                .catch(err => {
                    done(err);
                })
        })
    })
})