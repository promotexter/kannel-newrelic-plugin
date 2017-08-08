"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timers_1 = require("timers");
const ConfigReader_1 = require("./lib/ConfigReader");
const config = require("./config/config");
const SMSCStat_1 = require("./lib/SMSCStat");
const _ = require("lodash");
const Promise = require("bluebird");
const os = require("os");
const NewrelicClient_1 = require("./lib/NewrelicClient");
class NewrelicPlugin {
    constructor(config) {
        this.config = config;
    }
    start() {
        let configReader = new ConfigReader_1.ConfigReader();
        let client = new NewrelicClient_1.NewrelicClient(this.config.guid, this.config.license);
        configReader.getConfigs(this.config.basedir, this.config.filters)
            .then(gws => {
            let statReaders = [];
            _.each(gws, gw => {
                statReaders.push(new SMSCStat_1.SMSCStat(gw.name, gw.host, gw.admin_port, gw.admin_password));
            });
            let sentMessages = {};
            timers_1.setInterval(() => {
                let msg = {};
                let agent = {
                    host: os.hostname(),
                    version: 1.0
                };
                msg.agent = agent;
                Promise.map(statReaders, statReader => {
                    return statReader.loadStats();
                })
                    .then(stats => {
                    let queueLength = 0;
                    let onlineBinds = 0;
                    let components = [];
                    _.each(statReaders, statReader => {
                        let metrics = {};
                        metrics['Component/' + this.config.prefix + statReader.name + "/storeSize[count/second]"] = statReader.getQueueLength();
                        metrics['Component/' + this.config.prefix + statReader.name + "/onlineBinds[count/second]"] = statReader.getOnlineBinds();
                        let currentSent = statReader.getSent();
                        metrics['Component/' + this.config.prefix + statReader.name + "/sentMessages[count/second]"] = currentSent - (sentMessages[statReader.name] || 0);
                        sentMessages[statReader.name] = currentSent;
                        components.push({
                            name: statReader.name,
                            guid: this.config.guid,
                            duration: this.config.run_interval / 1000,
                            metrics: metrics
                        });
                    });
                    msg.components = components;
                    client.send(msg)
                        .catch(err => {
                        console.log(err);
                    });
                })
                    .catch(err => {
                    console.log(err);
                });
            }, this.config.run_interval);
        });
    }
}
let plugin = new NewrelicPlugin(config);
plugin.start();
