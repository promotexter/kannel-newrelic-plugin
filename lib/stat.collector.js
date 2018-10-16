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
const _ = require("lodash");
const influx = require("influx");
const os = require("os");
const moment = require("moment");
require('dotenv').config();
class StatCollector {
    constructor() {
        this.points = [];
        this.pointsAggregated = {};
        let connectionString = process.env.INFLUXDB_STRING;
        this.influx = new influx.InfluxDB(connectionString);
        this.run();
    }
    static getInstance() {
        if (!StatCollector.instance) {
            StatCollector.instance = new StatCollector();
        }
        return StatCollector.instance;
    }
    static stopInstance() {
        StatCollector.instance.stop();
    }
    run() {
        this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            if (this.ready)
                yield this.reportMeasurements();
        }), 1000);
        return this.influx.getDatabaseNames()
            .then(names => {
            let DBNAME = process.env.INFLUXDB_STRING.split('/').pop();
            console.log('names.indexOf(process.env.INFLUXDB_DATABASE_NAME)', names.indexOf(DBNAME));
            if (names.indexOf(DBNAME) === -1) {
                console.log('create database', DBNAME);
                return this.influx.createDatabase(DBNAME);
            }
        })
            .then(() => {
            this.ready = true;
        });
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            return true;
        }
        else {
            return false;
        }
    }
    createKeyFromMeasurement(m) {
        let mClone = _.clone(m);
        mClone.timestamp = moment(mClone.timestamp).format('YYYYMMDDHHmmss');
        delete mClone.fields;
        return JSON.stringify(mClone);
    }
    prepMeasurement(m) {
        _.each(m.fields, (v, k) => {
            m.fields[k + "_min"] = v < Number.MAX_SAFE_INTEGER ? v : Number.MAX_SAFE_INTEGER;
            m.fields[k + "_max"] = v;
            m.fields[k + "_sum"] = v;
            m.fields[k + "_count"] = 1;
            m.fields[k + "_average"] = v;
        });
        return m;
    }
    pushAndAggregate(m) {
        let key = this.createKeyFromMeasurement(m);
        if (this.pointsAggregated[key]) {
            _.each(m.fields, (v, k) => {
                this.pointsAggregated[key].fields[k + "_min"] = this.pointsAggregated[key].fields[k + "_min"] < v ? this.pointsAggregated[key].fields[k + "_min"] : v;
                this.pointsAggregated[key].fields[k + "_max"] = this.pointsAggregated[key].fields[k + "_max"] > v ? this.pointsAggregated[key].fields[k + "_max"] : v;
                this.pointsAggregated[key].fields[k + "_sum"] = this.pointsAggregated[key].fields[k + "_sum"] + v;
                this.pointsAggregated[key].fields[k + "_count"] = this.pointsAggregated[key].fields[k + "_count"] + 1;
                this.pointsAggregated[key].fields[k + "_average"] = this.pointsAggregated[key].fields[k + "_sum"] / this.pointsAggregated[key].fields[k + "_count"];
            });
        }
        else {
            this.pointsAggregated[key] = this.prepMeasurement(m);
        }
    }
    add(measurement, values, additionalTags, timestamp) {
        let defaultTags = { host: os.hostname() };
        let m = {
            measurement: measurement,
            tags: _.merge(defaultTags, additionalTags),
            fields: values,
            timestamp: timestamp || new Date()
        };
        this.points.push(m);
    }
    addOrionHealth(source, destination, success) {
        this.add('orion.health', {
            success: success ? 1 : 0,
            error: success ? 0 : 1,
        }, {
            source: source,
            destination: destination,
            region: process.env.AWS_REGION
        });
    }
    reportMeasurements() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.points.length) {
                let measurements = this.points.splice(0, Math.min(this.points.length, 10000));
                _.each(measurements, (m) => {
                    this.pushAndAggregate(m);
                });
                // console.log('writing measurements', (<any>Object).values(this.pointsAggregated));
                try {
                    yield this.influx.writePoints(Object.values(this.pointsAggregated));
                    this.pointsAggregated = {};
                }
                catch (e) {
                    console.log('failed reporting measurements', e.message);
                }
            }
        });
    }
}
exports.StatCollector = StatCollector;
//# sourceMappingURL=stat.collector.js.map