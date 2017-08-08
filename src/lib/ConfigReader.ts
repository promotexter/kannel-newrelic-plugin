import * as fs from 'fs';
import * as Promise from 'bluebird';
import {basename} from "path";
import * as _ from 'lodash';
import * as read from 'recursive-readdir';


export interface SMSCConfig {
    name: string,
    admin_port: number,
    host?: string,
    admin_password?: string
}

export class ConfigReader {

    constructor() {
    }

    getRawConfig(file): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(data.toString());
                }
            });
        });
    }

    getConfig(file): Promise<SMSCConfig> {
        return this.getRawConfig(file)
            .then(conf => {
                let c:SMSCConfig = {
                    name: '',
                    host: 'localhost',
                    admin_port: 0
                };

                c.admin_port = parseInt(conf.match(/admin-port.*?(\d+)/)[1]);
                    c.name = conf.match(/smsbox-id\s*=\s*"*(.*?)"/)[1];
                c.admin_password = conf.match(/admin-password\s*=\s*"*(.*?)"/)[1];
                return c;
            })

    }
    getRawConfigs(basedir: string): Promise<string[]> {
        throw new Error("Unimplemented");
    }
    getConfigs(basedir: string, filter: string[]): Promise<SMSCConfig[]>{
        return new Promise<SMSCConfig[]>((resolve, reject) => {
            read(basedir, filter, (err, files) => {
                Promise.map(files, (f) => {
                    return this.getConfig(f);
                })
                .then(configs => {
                    resolve(configs);
                })
                .catch(err => {
                    reject(err);
                })
            })
        });
    }
}