F5 Distributed Cloud Services - Log Receiver Proxy
============================================================================

The F5DCS LogProxy solution creates a intermediary service for an F5DCS logreceiver The proxy provides:

**Log formatting** The F5DCS log receiver currently delivers logs in RFC5424 format excusivley, (refer to image below).  While this may work for some analytics implementations others, (including Splunk), will need to utilize either an additional third-party add-on or customized parser to analyze and model log entries.  The F5DCS LogProxy receives log entries and re-formats them into easily to consume JSON. This enables for simplified integration with analtyics vendors.

**Enhanced Log Delivery Security**  The F5DCS log receiver offers limited configurability, (*protocol, hostname/IP, and destination port*).  The configuration options available may be sufficient for connections to analytics provider hosted locally and the log recevier supports TLS for transpot security to remote connections.  However, it does not provide a means for authentication to remote anayltics endpoints.  For access authentication to most remote services such as Datadog or to Splunk, (*over HTTPS*), the log receiver(s) will require an intermediary device. 

The LogProxy service, (*hosted locally*) inserts the apporpriate[^1] authentication token and securely proxies log streaming over HTTPS.

<img src="images/logreceiver.png" width=100% height=75% alt="Flowers">

[^1]: The LogProxy currently supports connections to Splunk Enterprise using the [Splunk HTTP Event Collector](https://docs.splunk.com/Documentation/Splunk/8.2.6/Data/UsetheHTTPEventCollector) (HEC) and to Datadog via the [logging endpoint](https://docs.datadoghq.com/api/latest/logs/#send-logs).
   
