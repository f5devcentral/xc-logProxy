// Import the filesystem module
const https = require('https');
const redis = require("redis");
const flatten = require('flat').flatten;

destHost = 'http-intake.logs.datadoghq.com';
destPath = '/api/v2/logs';
destPort = 443;
destAuth = 'DD-API-KEY 1cc47665f22c079b9dcdbf112a69d965' //+ process.env.DATADOG_TOKEN;

async function postRecords( parsedChunk, err) {
    if (err) throw err;
    //Post modified records to analytic provider
    const options = {
        hostname: destHost,
        rejectUnauthorized: false,
        port: destPort,
        path: destPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            //'Content-Length': newString.length,
            'Authorization': destAuth,
            'Connection': 'keep-alive'
        }
    }
    
    const req2 = https.request(options, res2 => {
        console.log(`statusCode: ${res2.statusCode}`);
        res2.on('data', d => {
        })
    })
 
    // handle connectivity errors 
    req2.on('error', error => {
        console.log('The client has disconnected...\n');
        main();
    })

    // submit payload via webhook to Splunk
    req2.write();
    console.log('record has been transmitted.');
    req2.end();
};

postRecords({
    "namespace": "g-coward",
    "waf_rule_hit_count": "0",
    "rtt_upstream_seconds": "0.008000",
    "latitude": "46.059400",
    "method": "GET",
    "tag": "svcfw.obelixd.apiaccess",
    "rtt_downstream_seconds": "0.030000",
    "_syslog_severity": 6,
    "envoy_action": "allow",
    "cluster_name": "glc-lab-cluster-f5-bd-rwaldxii",
    "site": "glc-lab-cluster",
    "tenant": "f5-bd-rwaldxii",
    "stream": "svcfw",
    "hostname": "master-0",
    "time_to_last_upstream_tx_byte": 0.00314572,
    "x_forwarded_for": "68.189.131.110",
    "original_authority": "voltce.aserracorp.com",
    "dst_ip": "NOT-APPLICABLE",
    "country": "US",
    "tls_cipher_suite": "VERSION_UNSPECIFIED/TLS_NULL_WITH_NULL_NULL",
    "req_size": "717",
    "original_path": "/",
    "time_to_last_upstream_rx_byte": 0.003741068,
    "duration_with_no_data_tx_delay": "0.001253",
    "src_port": "63826",
    "vh_name": "ves-io-http-loadbalancer-glc-test-lb",
    "dst_port": "80",
    "longitude": "-118.336100",
    "tls_version": "VERSION_UNSPECIFIED",
    "region": "WA",
    "time_to_last_downstream_tx_byte": 0.00439252,
    "city": "Walla Walla",
    "time_to_first_downstream_tx_byte": 0.004388486,
    "browser_type": "Chrome",
    "network": "68.189.128.0",
    "time_to_first_upstream_rx_byte": 0.003740869,
    "sample_rate": "1.000000",
    "time": "2022-03-28T23:09:53.748Z",
    "rsp_code_class": "3xx",
    "req_path": "/",
    "api_endpoint": "{\"collapsed_url\":\"UNKNOWN\",\"method\":\"GET\"}",
    "dst_instance": "STATIC",
    "rsp_code_details": "via_upstream",
    "src_instance": "US",
    "authority": "voltce.aserracorp.com",
    "tls_fingerprint": "UNKNOWN",
    "duration_with_data_tx_delay": "0.001257",
    "req_body": "",
    "connection_state": "CLOSED",
    "response_flags": "",
    "vh_type": "HTTP-LOAD-BALANCER",
    "policy_hits": {
      "policy_hits": []
    },
    "src_ip": "68.189.131.110",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.83 Safari/537.36",
    "node_id": "envoy_0",
    "app_type": "g-coward",
    "proxy_type": "http",
    "scheme": "http",
    "time_to_first_upstream_tx_byte": 0.003135542,
    "src_site": "glc-lab-cluster",
    "severity": "info",
    "sni": "",
    "connected_time": "2022-03-28T23:09:53.430389527Z",
    "terminated_time": "2022-03-28T23:09:53.435620459Z",
    "asn": "CHARTER-20115(20115)",
    "dst_site": "glc-lab-cluster",
    "req_params": "",
    "req_headers": "null",
    "rsp_size": "223",
    "req_id": "f282cd42-4c86-4fd8-8d57-f90e43e1c9a5",
    "user": "IP-68.189.131.110",
    "app": "obelix",
    "http_version": "",
    "rsp_code": "304",
    "messageid": "dea91c9a-beed-4561-67af-ab4112426b1f",
    "dst": "S:172.16.60.111",
    "_visitor_id": "fa3900721a793f93651c8ec3f465d748",
    "device_type": "Mac",
    "src": "N:site-local-vn",
    "kubernetes": {
      "pod_name": "obelix-p8779",
      "labels": {
        "app": "obelix"
      },
      "host": "master-0",
      "container_name": "obelix",
      "namespace_name": "ves-system",
      "pod_id": "ee0fcca1-8ea9-4e70-bfa7-3d5f6ce10363"
    }
  });
  