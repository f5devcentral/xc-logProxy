//misc regex
const regex1 = '<14';
const regex2 = '2 - ';
const regex3 = '\\';
const regex4 = ':"{"';
const regex5 = '}"';

function count(str, find, err) {
    if (err) {
        console.log(err.message);
    };    
    return (str.split(find)).length - 1;
};

// Modify payload to normalize JSON format
function formatPayload(payload) {
    while ( count(payload, regex1) > 0){payload = payload.replace(payload.substring(payload.indexOf(regex1),payload.indexOf(regex2)+3),'' )};
    payload = payload.replaceAll(regex3,'' );
    payload = payload.replaceAll(regex4,':{"' );
    payload = payload.replaceAll(regex5,'}' );
    payload = payload.replaceAll(' ','' );
    return payload;
};

process.on('message', (message) => {
    process.send(formatPayload(message));
  });