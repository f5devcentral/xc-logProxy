//Import modules
const redis = require("redis");
const crypto = require('crypto');
const path = require('path');
const formatWorker = require('./formatWorker');

// Create and configure a Redis client.
const client = redis.createClient(); 

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

async function fmtPayload(payload, err) {
    if (err) throw err;
    const result = await formatWorker(payload);

    var id = crypto.randomBytes(4).toString('hex');
    //Post record ID and record to Redis
    client.set('POST-'+ id, result);
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
                        fmtPayload(result);    
                    });
                    deleteRecord(keys[i]);
                };
            };
        });
    },3000);
};
main();