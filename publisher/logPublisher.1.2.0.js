// Import the filesystem module
const https = require('https');
const redis = require("redis");

const provider = process.env.ANALYTIC_PROVIDER.toLocaleLowerCase();

//misc regex
const regex1 = '<';
const regex2 = '2 - ';
const regex3 = '\\';
const regex4 = ':"{"';
const regex5 = '}"';

// Create and configure a Redis client.
const client = redis.createClient(); 

function count(str, find, err) {
    if (err) {
        console.log(err.message);
    };    
    return (str.split(find)).length - 1;
};

function formatPayload(payload) {
    while ( count(payload, regex1) > 0) 
        {payload = payload.replace(payload.substring(payload.indexOf(regex1),payload.indexOf(regex2)+3),'' )};
    while ( count(payload, regex3) > 0) 
        {payload = payload.replace(regex3,'' )};
    while ( count(payload, regex4) > 0) 
        {payload = payload.replace(regex4,':{"' )};
    while ( count(payload, regex5) > 0) 
        {payload = payload.replace(regex5,'}' )};
    while ( count(payload, ' ') > 0) 
        {payload = payload.replace(' ','' )};
    return payload;
}

client.on("connect", function() {
    console.log("You are now connected");
});

async function splunk( fmtPayload, err) {
    if (err) throw err;

    payloadArray = fmtPayload.split('\n');
    payloadArray.forEach(element => {
        element = element.trim();  
        options = {
            hostname: process.env.SPLUNK_HOST,
            rejectUnauthorized: false,
            port: 8088,
            path: '/services/collector/raw', 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': element.length,
                'Authorization': 'Splunk ' + process.env.SPLUNK_HEC,
                'Connection': 'keep-alive'
            }
        }

        const req = https.request(options, res => {
            console.log(`Record posted with a statusCode of: ${res.statusCode}`);
            res.on('data', d => {
            })
        })
 
        // handle connectivity errors 
        req.on('error', error => {
            console.log('The client has disconnected...\n');
            main();
        })

        // submit payload via webhook to Splunk
        req.write(element.trim());
        //req.end();
    });
};

async function datadog( fmtPayload, err) {
    if (err) throw err;

    payloadArray = fmtPayload.split('\n');
    payloadArray.forEach(element => {
        element = element.trim();
        if (element.length > 1) {
            newelement = element.replace('{','{"ddsource":"f5dcs_logproxy","host":"f5dcs",');
            options = {
                hostname: 'http-intake.logs.datadoghq.com',
                rejectUnauthorized: false,
                port: 443,
                path: '/api/v2/logs',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': newelement.length,
                    'DD-API-KEY': process.env.DATADOG_TOKEN
                }
            }

            const req = https.request(options, res => {
                console.log(`Record posted with a statusCode of: ${res.statusCode}`);
                res.on('data', d => {
                })
            })

            // handle connectivity errors 
            req.on('error', error => {
                //throw error;
                console.log('The client has disconnected...\n');
                main();
            })

            // submit payload via webhook to
            req.write(newelement.trim());
            req.end();
        };
    });
};

// Function to delete key for posted record
 function deleteRecord (key, err) {
    if (err) {
        console.log(err.message);
    }
    client.del(key, function(err, response) {
        if (response == 1) {
           //console.log("Deleted Successfully!")
        } else{
         console.log("Cannot delete")
         main();
        }
     })
};   

// Function to get current filenames in logs directory
 function main (err) {
    if (err) {
        console.log(err.message);
    }      
    console.log('Starting the log monitoring service');
    setInterval(() => {
        client.keys('*', function (err, keys) {
            if (err) return console.log(err);
            //iterate through keys and post records
            for(var i = 0, len = keys.length; i < len; i++) {
                if (client.get(keys[i]) != "" | client.get(keys[i]).result != null ) {
                    client.get(keys[i], function (err, result) {
                        if (err) {
                            console.log(err);
                            throw error;
                        }
                        if (result != null) {
                            switch(provider) {
                                case "splunk":
                                    console.log('Splunk has been selected.');
                                    splunk(formatPayload(result));
                                case "datadog":
                                    console.log('Datadog has been selected.');
                                    datadog(formatPayload(result));
                            }
                        }
                    });
                    deleteRecord(keys[i]);
                };
            };
        });
    },1000);
};

main(); 