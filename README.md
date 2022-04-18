F5 Distributed Cloud Services - Log Receiver Proxy
============================================================================

The F5DCS LogProxy solution creates a intermediary service for an F5DCS logreceiver The proxy provides:

**Log formatting** The F5DCS log receiver currently delivers logs in RFC5424 format excusivley, (refer to image below).  While this may work for some analytics implementations others, (including Splunk), will need to utilize either an additional third-party add-on or customized parser to analyze and model log entries.  The F5DCS LogProxy receives log entries and re-formats them into easily to consume JSON. This enables for simplified integration with analtyics vendors.

**Enhanced Log Delivery Security**  The F5DCS log receiver offers limited configurability, (*protocol, hostname/IP, and destination port*).  The configuration options available may be sufficient for connections to analytics provider hosted locally and the log recevier supports TLS for transpot security to remote connections.  However, it does not provide a means for authentication to remote anayltics endpoints.  For access authentication to most remote services such as Datadog or to Splunk, (*over HTTPS*), the log receiver(s) will require an intermediary device. 

The LogProxy service, (*hosted locally*) inserts the appropriate[^1] authentication and securely proxies log streaming over either HTTPS, HTTP, or TCP.

<img src="images/logreceiver.png" width=100% height=75% alt="Flowers">

**Required Input Variables** Depending upon the analytics provider utilized, the following input variables are required to be set.  These can be set using either via a Kubernetes configMap, (*example section included in the deploy.yml file*) or using the included *docker-compose.yml* file.

 - **splunk_host**: The Splunk hostname/IP address associated with the [HTTP Event collector](https://docs.splunk.com/Documentation/SplunkCloud/latest/Data/HECExamples) endpoint, *ex: '206.124.134.22'*.  The default HEC port of 8088 w/https is assumed.
 - **splunk_hec**: The [Splunk HEC token](https://docs.splunk.com/Documentation/SplunkCloud/8.2.2201/Config/ManageHECtokens), *ex: 'b5dasdcsd62-02d4-474d-80b5-b25ba198ecb'*.
 - **datadog_token**: The [Datadog API key](https://docs.datadoghq.com/account_management/api-app-keys/), *ex: '507c4941231231215e37asdfsadd16'*. 
 - **analytic_provider**:  Specify which analytics vendor to redirect logs towards; select either '*splunk*' or '*datadog*'.
 - **protocol**: Specify either '*tcp*', '*http*', or '*https*' for the log proxy listening endpoint.
 - **listen_port**: The LogProxy listening port, *ex: '30601'.  This is the port to be specified in the F5DCS LogReceiver configuration.

 In addition, the included deployment file for k8s (*deploy.yml*) deploys the pod, configMap, and service.  You will still need to expose the service that it may be reachable from the F5DCS logReceiver.

[^1]: The LogProxy currently supports connections to Splunk Enterprise using the [Splunk HTTP Event Collector](https://docs.splunk.com/Documentation/Splunk/8.2.6/Data/UsetheHTTPEventCollector) (HEC) and to Datadog via the [logging endpoint](https://docs.datadoghq.com/api/latest/logs/#send-logs).
   
