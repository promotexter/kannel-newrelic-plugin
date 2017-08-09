import * as chai from 'chai';
import * as _ from 'lodash';
import * as sinon from 'sinon';
import * as request from 'request';
import {NewrelicClient} from "../lib/NewrelicClient";

let assert = chai.assert;



describe('NewrelicClient', function() {
    describe('send', function() {
        it('should send the correct params', function(done) {

            let client = new NewrelicClient('guid', 'xxxvvv');
            sinon.spy(client, 'request');

            let arg = {
                method: "POST",
                headers: {
                'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-License-Key': 'xxxvvv'
                },
                body: JSON.stringify({x: 'x', y: 'y'})

            };

            client.send({x: 'x', y: 'y'});


            let args = client.request.getCall(0).args[0];


            assert.equal(args.url, 'https://platform-api.newrelic.com/platform/v1/metrics');
            assert.equal(args.headers['X-License-Key'], 'xxxvvv');
            assert.equal(args.body, JSON.stringify({x: 'x', y: 'y'}));
            done();
        });
    })
})