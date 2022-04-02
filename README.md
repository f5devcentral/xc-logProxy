F5 Distributed Cloud Services - Log Receiver Proxy
============================================================================

The F5DCS Log Receiver Proxy solution creates a intermediary service for an F5DCS logreceiver The log proxy provides:

   .. image:: module1/images/lab_layout.png
    - **Log Re-formatting** The F5DCS log receiver currently delivers logs in 

<img src="images/logreceiver.png" width=75% height=75% alt="Flowers">


   
   - **F5 BIG-IP(s)** providing L4/L7 ADC Services
   - **F5 Declarative Onboarding**, (DO) and **Application Services 3 Extension**, (AS3) to deploy to configure BIG-IP application services
   - **F5 Telemetry Streaming**, (TS) to stream telemetry data to a third party analytics provider
   - **GitHub Actions** for workflow automation 
   - **Azure** public cloud for application hosting
   - **Hashicorp Terraform** and **Consul** for infrastructure provisioning, service discovery and event logging
   - **Elastic ELK Stack**, (integrated with BIG-IP(s) via TS) for monitoring and alerting
   - **Locust.io** for load generation

#. Deploy a cloud-based application, along with related infrastructure. 

#. Manage autoscaling operations via a centralized ADPM environment and a third party analytics provider, (Elastic ELK stack) for
   monitoring/alerting.

Expected time to complete: **2 hours**

