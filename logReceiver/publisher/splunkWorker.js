const https = require('https');
const {
    Worker,
    isMainThread,
    parentPort,
    workerData,
  } = require('worker_threads');


function splunk( payload, err) {
    if (err) throw err;
    let counter = 0;
    //Disaggregate payload into individual records for processing
    payloadArray = payload.split('\n');
    payloadArray.forEach(element => {
        element = element.trim();
        if (element.length > 1) {
        counter++;
        element = element.replace('{','{"ddsource":"f5dcs_logproxy",');
        element = element + '"}'
        //Set Connection options
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
            })

            // submit payload to Splunk
            req.write(element.trim());
            req.end();
        };
    });
    return counter;
};

if (isMainThread) {
    module.exports = (n) =>
      new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: n,
        });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
  } else {
    const result = splunk(workerData);
    parentPort.postMessage(result);
    //process.exit(0);
  }
