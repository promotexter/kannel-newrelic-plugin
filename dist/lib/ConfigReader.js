"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Promise = require("bluebird");
const read = require("recursive-readdir");
const path = require("path");
class ConfigReader {
    constructor() {
    }
    getRawConfig(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.toString());
                }
            });
        });
    }
    getConfig(file) {
        return this.getRawConfig(file)
            .then(conf => {
            let c = {
                name: '',
                host: 'localhost',
                admin_port: 0
            };
            c.admin_port = parseInt(conf.match(/admin-port.*?(\d+)/)[1]);
            c.name = path.dirname(file).split(path.sep).pop();
            c.admin_password = conf.match(/admin-password\s*=\s*"*(.*?)"/)[1];
            return c;
        });
    }
    getRawConfigs(basedir) {
        throw new Error("Unimplemented");
    }
    getConfigs(basedir, filter) {
        return new Promise((resolve, reject) => {
            read(basedir, filter, (err, files) => {
                Promise.map(files, (f) => {
                    return this.getConfig(f);
                })
                    .then(configs => {
                    resolve(configs);
                })
                    .catch(err => {
                    reject(err);
                });
            });
        });
    }
}
exports.ConfigReader = ConfigReader;
