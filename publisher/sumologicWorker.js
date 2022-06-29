const https = require('https');
const {
    Worker,
    isMainThread,
    parentPort,
    workerData,
  } = require('worker_threads');


function sumologic( fmtPayload, err) {
    if (err) throw err;
    let counter=0;
    sumoURL = process.env.SUMO_URL
    sumoHost = sumoURL.substring(sumoURL.indexOf('://')+ 3,sumoURL.indexOf('.com')+ 4)
    sumoPath = sumoURL.substring(sumoURL.indexOf('.com')+ 4,sumoURL.length)

    //Disaggregate payload into individual records for processing
    payloadArray = fmtPayload.split('\n');
    payloadArray.forEach(element => {
        element = element.trim();
        if (element.length > 1) {
            counter++;
            element = element.replace('{','{"ddsource":"f5dcs_logproxy","host":"f5dcs",');
            //Set Connection options
            options = {
                hostname: sumoHost,
                rejectUnauthorized: false,
                port: 443,
                path: sumoPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': element.length
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

            // submit payload to Datdog
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
    const result = sumologic(workerData);
    parentPort.postMessage(result);
    //process.exit(0);
  }