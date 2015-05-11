Falcon-ui
=========

Web UI to manage feeds, clusters and processes with the falcon REST API


Before starting
===============

NodeJs , npm, Grunt must be installed in the local pc.

- From git root cd to /falcon-ui

- npm install (this will install all the app related node modules)


To clone the repository
===============================
git clone https://github.com/kenneththo/incubator-falcon.git
git checkout falcon-ambari-view-V2.0


To deploy to the sandbox (v2-2)
===============================

1. Deploy ambari view in order to generate falcon-ambari-view-0.7-incubating-SNAPSHOT.jar:
	1.1 cd falcon-ui
	1.2 grunt ambariview
	1.3 cd ..
	1.4 cd falcon-ambari-view
	1.5 mvn clean install 
	1.6 falcon-ambari-view-0.7-incubating-SNAPSHOT.jar will be generated inside the taget directory

2. Upload falcon-ambari-view-0.7-incubating-SNAPSHOT.jar to /var/lib/ambari-server/resources/views/
3. Restart ambari server
4. Go to ambari admin -> Manage Ambari -> Falcon Ambari View -> Create Instance
5. Enter the API URL in the falcon.service.uri property

Important!
Security/Kerberos must be enabled, otherwise the services will ask for user.name param
