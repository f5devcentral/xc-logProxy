/*  
 Create Listening server - receive alerts from F5 Distributed Cloud Services log receivers 
*/
const net = require('net');
const crypto = require("crypto");
const redis = require("redis");


// Create and configure a Redis client.
const client = redis.createClient({
    host: 'redis-server',
    port: 6379
  }); 
  
//Import in Values
const listenerIP =  '0.0.0.0';
const port = 601;

let chunks = [];

function count(str, find) {
    return (str.split(find)).length - 1;
};

//Establish connection to Redis
client.on("connect", function() {
});

function main() {
    console.log('The proxy server is listening on port ' + port + '...\n');
    var server = net.createServer(function(socket) {
        socket.on('data', (chunk) => {
            chunks.push(chunk);
        });
        socket.end();
        var id = crypto.randomBytes(4).toString('hex');
        var parsedChunk = Buffer.concat(chunks).toString();
        client.set(id, parsedChunk);
        chunks = [];
        console.log('Records posted to - ' + id)

    }).listen(port, listenerIP);
};

main();