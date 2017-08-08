import {setInterval} from "timers";
import {ConfigReader} from "./lib/ConfigReader";
import * as config from './config/config';
import {SMSCStat} from "./lib/SMSCStat";
import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as os from 'os';
import {NewrelicClient} from "./lib/NewrelicClient";



class NewrelicPlugin {

    config: any;
    version: number;
    constructor(config: any) {
        this.config = config;

    }

    start() {

        let configReader = new ConfigReader();
        let client = new NewrelicClient(this.config.guid, this.config.license);


        configReader.getConfigs(this.config.basedir, this.config.filters)
            .then(gws => {

                let statReaders: SMSCStat[] = [];
                _.each(gws, gw => {
                    statReaders.push(new SMSCStat(gw.name, gw.host, gw.admin_port, gw.admin_password));
                })


                let sentMessages = {};


                setInterval(() => {

                    let msg:any = {};
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
                            metrics['Component/' + this.config.prefix + statReader.name+"/storeSize[count/second]"] = statReader.getQueueLength();
                            metrics['Component/' + this.config.prefix + statReader.name+"/onlineBinds[count/second]"] = statReader.getOnlineBinds();

                            let currentSent = statReader.getSent();
                            metrics['Component/' + this.config.prefix + statReader.name+"/sentMessages[count/second]"] = currentSent - (sentMessages[statReader.name] || 0 );

                            sentMessages[statReader.name] = currentSent;

                            components.push({
                                name: statReader.name,
                                guid: this.config.guid,
                                duration: this.config.run_interval/1000,
                                metrics: metrics
                            })

                        })

                        msg.components = components;
                        client.send(msg)
                            .catch(err => {
                                console.log(err);
                            })
                    })
                    .catch(err => {
                        console.log(err);
                    })

                }, this.config.run_interval)

            })
    }
}



let plugin = new NewrelicPlugin(config);
plugin.start();