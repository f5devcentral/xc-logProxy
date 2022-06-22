const https = require('https');

function datadog( payload, err) {
    if (err) throw err;

    //Disaggregate payload into individual records for processing
    payloadArray = payload.split('\n');
    payloadArray.forEach(element => {
        element = element.trim();
        if (element.length > 1) {

            element = element.replace('{','{"ddsource":"f5dcs_logproxy","host":"f5dcs",');
            //Set Connection options
            options = {
                hostname: 'http-intake.logs.datadoghq.com',
                rejectUnauthorized: false,
                port: 443,
                path: '/api/v2/logs',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': element.length,
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
                console.log('The client has disconnected...\n');
            })

            // submit payload to Datdog
            req.write(element.trim());
            req.end();
        };
    });
    return "posted";
};

process.on('message', (message) => {
    process.send(datadog(message));
  });