import * as chai from 'chai';
import {ConfigReader, SMSCConfig} from "../lib/ConfigReader";
import * as _ from 'lodash';
let assert = chai.assert;



describe('ConfigReader', function() {
    describe('getConfigs', function() {

        it('getConfigs', function(done) {

            let configReader = new ConfigReader();
            configReader.getConfigs(__dirname + '/../../src/test/configs',[])
                .then(smscs => {
                    assert.equal(smscs.length, 2);

                    let tmp = {};
                    _.each(smscs, smsc => {
                        tmp[smsc.name] = smsc;
                    });

                    assert.isNotNull(tmp['nexmo']);
                    assert.equal((<SMSCConfig> tmp["nexmo"]).admin_port, 17700);
                    assert.equal((<SMSCConfig> tmp["tata-pre"]).admin_port, 35313);
                    done();
                })
                .catch(err => {
                    done(err);
                })
        });
    })
    describe('getRawConfig', function() {

        it('getRawConfig', function(done) {

            let configReader = new ConfigReader();
            configReader.getRawConfig(__dirname + '/../../src/test/configs/nexmo/file.conf')
                .then(conf => {
                    assert.isNotNull(conf.match(/core/));
                    done();
                })
                .catch(err => {
                    done(err);
                })
        });
    })

    describe('getConfig', function() {

        it('getConfig', function(done) {

            let configReader = new ConfigReader();
            configReader.getConfig(__dirname + '/../../src/test/configs/nexmo/file.conf')
                .then(conf => {
                    assert.equal(conf.name, "nexmo");
                    assert.equal(conf.admin_port, 17700);
                    assert.equal(conf.admin_password, 'ptSupp23$');
                    done();
                })
                .catch(err => {
                    done(err);
                })
        });
    })
});