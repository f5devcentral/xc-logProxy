/*  
 Create Listening server - receive alerts from F5 Distributed Cloud Services log receivers 
*/
const net = require('net');
const https = require('https');
const http = require('http');
const crypto = require("crypto");
const redis = require("redis");
const fs = require('fs');

// Create and configure a Redis client.
const client = redis.createClient(); 

//Set Listener values
const listenerIP =  '0.0.0.0';
const port = process.env.LISTEN_PORT;
const protocol = process.env.PROTOCOL;
let chunks = [];

function count(str, find) {
    return (str.split(find)).length - 1;
};

//Establish connection to Redis container
client.on("connect", function() {
});

function postRecords(records){
    var id = crypto.randomBytes(4).toString('hex');
    //Post record ID and record to Redis
    client.set(id, records);
    console.log('Records posted to - ' + id)
}

function main() {
    console.log('The proxy server is listening on port ' + port + '...\n');
    
        switch(protocol) {
            //Create Listening server - F5DCS will connect to this endpoint
            case "tcp":
                var server = net.createServer(function(socket) {
                    socket.on('data', (chunk) => {
                        chunks.push(chunk);
                    });
                    socket.end();
                    chunks = Buffer.concat(chunks).toString();
                    postRecords(chunks);
                    chunks = [];
                    // Start tcp listener
                    console.log("Starting TCP alert processor...\n")

                }).listen(port, listenerIP);
                break;
            case "https":
                options = {
                    key: fs.readFileSync('key.pem'),
                    cert: fs.readFileSync('cert.pem')
                };
                    
                https.createServer(options, function (request, response) {
                    const { headers, method, url } = request;
                    request.on('error', (err) => {
                        console.error(err);   
                    }).on('data', (chunk) => {
                        chunks.push(chunk);
                    }).on('end', () => {
                        chunks = Buffer.concat(chunks).toString();
                        response.end();
                        postRecords(chunks);
                        chunks = [];
                    });
                
                    // Start listener
                    console.log("Starting HTTPS alert processor...\n")
                
                }).listen(port, listenerIP);
                break;
            case "http":
                http.createServer((request, response) => {
                    const { headers, method, url } = request;
                    request.on('error', (err) => {
                        console.error(err);   
                    }).on('data', (chunk) => {
                        chunks.push(chunk);
                    }).on('end', () => {
                        chunks = Buffer.concat(chunks).toString();
                        response.end();
                        postRecords(chunks);
                        chunks = [];
                    });
                
                    // Start listener
                    console.log("Starting HTTP alert processor...\n")
                
                }).listen(port, listenerIP);
                break;
        }
};
main();