// Import the filesystem module
const https = require('https');
const redis = require("redis");
const path = require('path');
const datadogWorker = require('./datadogWorker');
const splunkWorker = require('./splunkWorker');
const sumologicWorker = require('./sumologicWorker');
const workerpool = require('workerpool');
const pool = workerpool.pool();

const provider = process.env.ANALYTIC_PROVIDER.toLocaleLowerCase();

let counter = 0;
// Create and configure a Redis client.
const client = redis.createClient(); 

client.on("connect", function() {
    console.log("Log publisher is connected");
});

async function splunk( fmtPayload, err) {
    if (err) throw err;
    const result = await splunkWorker(fmtPayload);
    counter = counter + result;
    console.log(counter + ' total records posted');
};

async function datadog(fmtPayload, err) {
    if (err) throw err;
    const result = await datadogWorker(fmtPayload);
    counter = counter + result;
    console.log(counter + ' total records posted');
};

async function sumologic( fmtPayload, err) {
    if (err) throw err;
    const result = await sumologicWorker(fmtPayload);
    counter = counter + result;
    console.log(counter + ' total records posted');
};

function deleteRecord (key, err) {
    if (err) {
        console.log(err.message);
    }
    client.del(key, function(err, response) {
        if (response == 1) {
            console.log(key + " deleted successfully!")
        } else{
            console.log("Cannot delete")
            main();
        }
    })
};

 function main (err) {
    if (err) {
        console.log(err.message);
    }      
    console.log('Starting the log monitoring service');
    setInterval(() => {
        client.keys('POST-*', function (err, keys) {
            if (err) return console.log(err);
            //iterate through keys and log records
            if (keys.length > 2) {
                length = 2
            } else {
                length = keys.length
            }
            for(var i = 0, len = length; i < len; i++) {
                if (client.get(keys[i]) != "" | client.get(keys[i]).result != null ) {
                    client.get(keys[i], function (err, result) {
                        if (err) {
                            console.log(err);
                            throw error;
                        }
                        //Post Records to provider
                        if (result != null) {
                            switch(process.env.ANALYTIC_PROVIDER.toLocaleLowerCase()) {
                                case "splunk":
                                    console.log('Splunk has been selected.');
                                    pool.exec(splunk,[result]);
                                    break;
                                case "datadog":
                                    console.log('Datadog has been selected.');
                                    pool.exec(datadog,[result]);
                                    break;
                                case "sumologic":
                                    console.log('Sumologic has been selected.');
                                    pool.exec(sumologic,[result]);
                                    break;
                            }
                        }
                    });
                    pool.exec(deleteRecord,[keys[i]]);
                };
            };
        });
    },10000);
};


main(); 
