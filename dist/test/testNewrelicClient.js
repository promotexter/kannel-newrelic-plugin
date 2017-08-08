"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const sinon = require("sinon");
const NewrelicClient_1 = require("../lib/NewrelicClient");
let assert = chai.assert;
describe('NewrelicClient', function () {
    describe('send', function () {
        it('should send the correct params', function (done) {
            let client = new NewrelicClient_1.NewrelicClient('guid', 'xxxvvv');
            sinon.spy(client, 'request');
            let arg = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-License-Key': 'xxxvvv'
                },
                body: JSON.stringify({ x: 'x', y: 'y' })
            };
            client.send({ x: 'x', y: 'y' });
            let args = client.request.getCall(0).args[0];
            assert.equal(args.url, 'https://platform-api.newrelic.com/platform/v1/metrics');
            assert.equal(args.headers['X-License-Key'], 'xxxvvv');
            assert.equal(args.body, JSON.stringify({ x: 'x', y: 'y' }));
            done();
        });
    });
});
