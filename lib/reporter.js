var util = require('util');
var events = require('events');
var request = require('sync-request');

exports = module.exports = SlackReporter;

function SlackReporter(options) {

    var passes = 0;
    var failures = 0;
    var failedTests = [];

    this.on('test:pass', function(test) {
        passes++;
    });

    this.on('test:fail', function(test, err) {
        failures++;
        failedTests.push(test);
    });

    this.on('end', function() {

        var attachments = [];
        var fields = [];

        fields.push({
            title : options.reporterOptions.message,
            value : passes + ' of ' + (passes + failedTests.length) + ' tests have passed',
            short : false
        });

        attachments.push({
            fallback : options.reporterOptions.message,
            pretext: null,
            color: "good",
            fields: fields,
        });

        if (failedTests.length > 0) {

            var fields = [];

            failedTests.forEach(function(failedTest) {

                fields.push({
                    title : failedTest.title,
                    value : failedTest.err.message,
                    short : false
                });

            });

            attachments.push({
                fallback : options.reporterOptions.message,
                pretext: null,
                color: "danger",
                fields: fields,
            });

        }

        request('POST', options.reporterOptions.slackHook, {
            json: {
                channel: options.reporterOptions.channel,
                username : options.reporterOptions.username,
                attachments : attachments
            }
        });

    });
};

util.inherits(SlackReporter, events.EventEmitter);