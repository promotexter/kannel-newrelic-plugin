import * as _ from 'lodash';
import * as influx from 'influx';
import * as os from 'os';
import {IClusterConfig} from "influx";
import moment = require("moment");
require('dotenv').config();

export interface StatCollectorMeasurement {
    measurement: string;
    tags: any,
    fields: any,
    timestamp: Date
}

export class StatCollector {
    private static instance: StatCollector;

    points: StatCollectorMeasurement[];
    pointsAggregated: any;
    influx: influx.InfluxDB;
    interval: any;
    private ready: boolean;

    private constructor() {
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
        this.interval = setInterval(async () => {
            if (this.ready)
                await this.reportMeasurements();
        }, 1000);

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
        } else {
            return false;
        }
    }


    createKeyFromMeasurement(m) {
        let mClone = _.clone(m);
        mClone.timestamp = moment(mClone.timestamp).format('YYYYMMDDHHmmss');
        delete mClone.fields;
        return JSON.stringify(mClone);
    }

    prepMeasurement(m:StatCollectorMeasurement): StatCollectorMeasurement {
        _.each(m.fields, (v, k) => {
            m.fields[k + "_min"] = v < Number.MAX_SAFE_INTEGER ? v : Number.MAX_SAFE_INTEGER;
            m.fields[k + "_max"] = v;
            m.fields[k + "_sum"] = v;
            m.fields[k + "_count"] = 1;
            m.fields[k + "_average"] = v;
        });
        return m;
    }
    pushAndAggregate(m: StatCollectorMeasurement): void {
        let key = this.createKeyFromMeasurement(m);
        if(this.pointsAggregated[key]) {
            _.each(m.fields, (v, k) => {
                this.pointsAggregated[key].fields[k + "_min"] = this.pointsAggregated[key].fields[k + "_min"] < v ? this.pointsAggregated[key].fields[k + "_min"]: v;
                this.pointsAggregated[key].fields[k + "_max"] = this.pointsAggregated[key].fields[k + "_max"] > v ? this.pointsAggregated[key].fields[k + "_max"]: v;
                this.pointsAggregated[key].fields[k + "_sum"] = this.pointsAggregated[key].fields[k + "_sum"]  + v;
                this.pointsAggregated[key].fields[k + "_count"] = this.pointsAggregated[key].fields[k + "_count"] + 1;
                this.pointsAggregated[key].fields[k + "_average"] = this.pointsAggregated[key].fields[k + "_sum"]/this.pointsAggregated[key].fields[k + "_count"]
            })
        } else {
            this.pointsAggregated[key] = this.prepMeasurement(m);
        }
    }

    add(measurement: string, values: any, additionalTags?: any, timestamp?: Date) {
        let defaultTags = {host: os.hostname()};

        let m: StatCollectorMeasurement = {
            measurement: measurement,
            tags: _.merge(defaultTags, additionalTags),
            fields: values,
            timestamp: timestamp || new Date()
        };

        this.points.push(m);
    }

    addOrionHealth(source: string, destination: string, success: boolean) {
        this.add('orion.health', {
            success: success ? 1: 0,
            error: success ? 0 : 1,
        }, {
            source: source,
            destination: destination,
            region: process.env.AWS_REGION
        });
    }

    async reportMeasurements(): Promise<void>{
        if (this.points.length)
        {
            let measurements = this.points.splice(0, Math.min(this.points.length, 10000));
            _.each(measurements, (m) => {
                this.pushAndAggregate(m);
            });

            // console.log('writing measurements', (<any>Object).values(this.pointsAggregated));

            try {
                await this.influx.writePoints((<any>Object).values(this.pointsAggregated));
                this.pointsAggregated = {};

            } catch (e) {
                console.log('failed reporting measurements', e.message);
            }


        }
    }
}