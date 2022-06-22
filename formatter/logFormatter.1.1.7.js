//Import modules
const redis = require("redis");
const crypto = require('crypto');
const path = require('path');
const { fork } = require('child_process');

// Create and configure a Redis client.
const client = redis.createClient(); 

//misc regex
const regex1 = '<14>';
const regex2 = '-';
const regex3 = '\\';
const regex4 = ':"{"';
const regex5 = '}"';

const regex6 = '/<.*{/';

function count(str, find, err) {
    if (err) {
        console.log(err.message);
    };    
    return (str.split(find)).length - 1;
};

client.on("connect", function() {
    console.log("Log formatter is connected");
});

// Function to delete key for posted record
function deleteRecord (key, err) {
    if (err) {
        //console.log(err.message);
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

function postRecords(records){
    var id = crypto.randomBytes(4).toString('hex');
    //Post record ID and record to Redis
    client.set('POST-'+ id, records);
    console.log('Events formatted - ' + id)
};

function main (err) {
    if (err) {
        console.log(err.message);
    }      
    console.log('Log formatting service started');
    setInterval(() => {
        client.keys('PRE-*', function (err, keys) {
            if (err) return console.log(err);
            //iterate through keys and log records
            for(var i = 0, len = keys.length; i < len; i++) {
                if (client.get(keys[i]) != "" | client.get(keys[i]).result != null ) {
                    client.get(keys[i], function (err, result) {
                        if (err) {
                            console.log(err);
                            throw error;
                        }
                        const childProcess = fork(path.join(__dirname, 'logformat'));
                        childProcess.on('message', (message) => {
                            postRecords(message);
                          });
                        childProcess.send(result);

                    });
                    deleteRecord(keys[i]);
                };
            };
        });
    },3000);
};
main();