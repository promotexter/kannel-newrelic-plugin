require('dotenv').config();
import {SmscStatcollectionAgent} from "./lib/smsc.statcollection.agent";


var fn = async function() {
    let monitor = new SmscStatcollectionAgent();

    await monitor.init();
    await monitor.start();
};

fn();
