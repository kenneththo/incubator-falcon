/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  function findByNameInList(type, name) {
    var i;
    for (i = 0; i < entitiesList[type].entity.length; i++) {
      if (entitiesList[type].entity[i]["name"] === name) {
        return i;
      }
    }
  };

  function findByStartEnd(type, start, end) {
    for (var i = 0; i < instancesList[type].length; i++) {
      if (instancesList[type][i].startTime === start && instancesList[type][i].endTime === end) {
        return i;
      }
    }
  };

  var entitiesList = {
    cluster : {
      "entity":[
        {"type":"cluster","name":"completeCluster","status":"SUBMITTED","list":{"tag":["uruguay=mvd","argentina=bsas","mexico=mex", "usa=was"]}},
        {"type":"cluster","name":"primaryCluster","status":"SUBMITTED"}
      ]
    },
    feed: {
      "entity":[
        {"type":"FEED","name":"feedOne","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feedTwo","status":"RUNNING","list":{"tag":["owner=USMarketing","classification=Secure","externalSource=USProdEmailServers","externalTarget=BITools"]}},
        {"type":"FEED","name":"feedTree","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feedFour","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feedFive","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feedSix","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feedSeven","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feedEight","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feedNine","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feedTen","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed11","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed12","status":"RUNNING","list":{"tag":["owner=USMarketing","classification=Secure"]}},
        {"type":"FEED","name":"feed13","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed14","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed15","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed16","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed17","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed18","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed19","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed20","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed21","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed22","status":"RUNNING","list":{"tag":["owner=USMarketing"]}},
        {"type":"FEED","name":"feed23","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed24","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed25","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed26","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed27","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed28","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed29","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed30","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed31","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed32","status":"RUNNING","list":{"tag":["owner=USMarketing"]}},
        {"type":"FEED","name":"feed33","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed34","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed35","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed36","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed37","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed38","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed39","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed40","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed41","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed42","status":"RUNNING","list":{"tag":["owner=USMarketing"]}},
        {"type":"FEED","name":"feed43","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed44","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed45","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed46","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed47","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed48","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed49","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed50","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed51","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed52","status":"RUNNING","list":{"tag":["owner=USMarketing"]}},
        {"type":"FEED","name":"feed53","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed54","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed55","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed56","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed57","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed58","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed59","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed60","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed61","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}},
        {"type":"FEED","name":"feed62","status":"RUNNING","list":{"tag":["owner=USMarketing"]}},
        {"type":"FEED","name":"feed63","status":"SUBMITTED","list":{"tag":["externalSystem=USWestEmailServers","classification=secure"]}}
      ]
    },
    process:{"entity":[
      {"type":"process","name":"processOne","status":"SUBMITTED","list":{"tag":["pipeline=churnAnalysisDataPipeline","owner=ETLGroup","montevideo=mvd"]}},
      {"type":"process","name":"processTwo","status":"SUBMITTED","list":{"tag":["pipeline=churnAnalysisDataPipeline","owner=ETLGroup","externalSystem=USWestEmailServers"]}}]
    },
    dataset:{"entity":[
      {"type":"dataset","name":"datasetOne","status":"SUBMITTED","list":{"tag":["pipeline=churnAnalysisDataPipeline","owner=ETLGroup","montevideo=mvd"]}},
      {"type":"dataset","name":"datasetTwo","status":"SUBMITTED","list":{"tag":["pipeline=churnAnalysisDataPipeline","owner=ETLGroup","externalSystem=USWestEmailServers"]}},
      {"type":"dataset","name":"datasetTree","status":"SUBMITTED","list":{"tag":["pipeline=churnAnalysisDataPipeline","owner=ETLGroup","montevideo=mvd"]}},
      {"type":"dataset","name":"datasetFour","status":"SUBMITTED","list":{"tag":["pipeline=churnAnalysisDataPipeline","owner=ETLGroup","externalSystem=USWestEmailServers"]}}]
    }
  },
    definitions = {
      CLUSTER: {
        completeCluster : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<cluster name="completeCluster" description="desc" colo="colo" xmlns="uri:falcon:cluster:0.1">' +
            '<tags>uruguay=mvd,argentina=bsas</tags>' +
            '<interfaces>' +
              '<interface type="readonly" endpoint="hftp://sandbox.hortonworks.com:50070" version="2.2.0"/>' +
              '<interface type="write" endpoint="hdfs://sandbox.hortonworks.com:8020" version="2.2.0"/>' +
              '<interface type="execute" endpoint="sandbox.hortonworks.com:8050" version="2.2.0"/>' +
              '<interface type="workflow" endpoint="http://sandbox.hortonworks.com:11000/oozie/" version="4.0.0"/>' +
              '<interface type="messaging" endpoint="tcp://sandbox.hortonworks.com:61616?daemon=true" version="5.1.6"/>' +
              '<interface type="registry" endpoint="thrift://localhost:9083" version="0.11.0"/>' +
            '</interfaces>' +
            '<locations>' +
              '<location name="staging" path="/apps/falcon/backupCluster/staging"/>' +
              '<location name="temp" path="/tmp"/>' +
              '<location name="working" path="/apps/falcon/backupCluster/working"/>' +
            '</locations>' +
            '<ACL owner="ambari-qa" group="users" permission="0755"/>' +
            '<properties>' +
              '<property name="this" value="property"/>' +
            '</properties>' +
          '</cluster>',
        primaryCluster: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<cluster name="primaryCluster" description="oregonHadoopCluster" colo="USWestOregon" xmlns="uri:falcon:cluster:0.1">' +
            '<interfaces>' +
              '<interface type="readonly" endpoint="hftp://sandbox.hortonworks.com:50070" version="2.2.0"/>' +
              '<interface type="write" endpoint="hdfs://sandbox.hortonworks.com:8020" version="2.2.0"/>' +
              '<interface type="execute" endpoint="sandbox.hortonworks.com:8050" version="2.2.0"/>' +
              '<interface type="workflow" endpoint="http://sandbox.hortonworks.com:11000/oozie/" version="4.0.0"/>' +
              '<interface type="messaging" endpoint="tcp://sandbox.hortonworks.com:61616?daemon=true" version="5.1.6"/>' +
            '</interfaces>' +
            '<locations>' +
              '<location name="staging" path="/apps/falcon/primaryCluster/staging"/>' +
              '<location name="temp" path="/tmp"/>' +
              '<location name="working" path="/apps/falcon/primaryCluster/working"/>' +
            '</locations>' +
          '</cluster>'
      },
      FEED: {
        feedOne: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<feed name="feedOne" description="Raw customer email feed" xmlns="uri:falcon:feed:0.1">' +
            '<tags>externalSystem=USWestEmailServers,classification=secure</tags>' +
            '<frequency>hours(1)</frequency>' +
            '<timezone>UTC</timezone>' +
            '<late-arrival cut-off="hours(4)"/>' +
            '<clusters>' +
              '<cluster name="primaryCluster" type="source">' +
                '<validity start="2014-02-28T00:00Z" end="2016-04-01T00:00Z"/>' +
                '<retention limit="days(90)" action="delete"/>' +
                '<locations>' +
                  '<location type="data" path="/"/>' +
                  '<location type="stats" path="/"/>' +
                  '<location type="meta" path="/"/>' +
                '</locations>' +
              '</cluster>' +
            '</clusters>' +
            '<locations>' +
              '<location type="data" path="hdfs://sandbox.hortonworks.com:8020/"/>' +
              '<location type="stats" path="/none"/>' +
              '<location type="meta" path="/none"/>' +
            '</locations>' +
            '<ACL owner="ambari-qa" group="users" permission="0755"/>' +
            '<schema location="/none" provider="none"/>' +
            '<properties>' +
              '<property name="queueName" value="default"/>' +
              '<property name="jobPriority" value="NORMAL"/>' +
              '<property name="timeout" value="hours(1)"/>' +
              '<property name="parallel" value="3"/>' +
              '<property name="maxMaps" value="8"/>' +
              '<property name="mapBandwidthKB" value="1024"/>' +
            '</properties>' +
          '</feed>',
        feedTwo: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<feed name="feedTwo" description="Cleansed customer emails" xmlns="uri:falcon:feed:0.1">' +
            '<tags>owner=USMarketing,classification=Secure,externalSource=USProdEmailServers,externalTarget=BITools</tags>' +
            '<groups>churnAnalysisDataPipeline</groups>' +
            '<frequency>hours(1)</frequency>' +
            '<timezone>UTC</timezone>' +
            '<clusters>' +
              '<cluster name="primaryCluster" type="source">' +
                '<validity start="2014-02-28T00:00Z" end="2016-04-01T00:00Z"/>' +
                '<retention limit="days(90)" action="delete"/>' +
                '<locations>' +
                  '<location type="data" path="/user/ambari-qa/falcon/demo/primary/processed/enron/${YEAR}-${MONTH}-${DAY}-${HOUR}"/>' +
                '</locations>' +
              '</cluster>' +
              '<cluster name="backupCluster" type="target">' +
                '<validity start="2014-02-28T00:00Z" end="2016-04-01T00:00Z"/>' +
                '<retention limit="months(36)" action="delete"/>' +
                '<locations>' +
                  '<location type="data" path="/falcon/demo/bcp/processed/enron/${YEAR}-${MONTH}-${DAY}-${HOUR}"/>' +
                '</locations>' +
              '</cluster>' +
            '</clusters>' +
            '<locations>' +
              '<location type="data" path="/user/ambari-qa/falcon/demo/processed/enron/${YEAR}-${MONTH}-${DAY}-${HOUR}"/>' +
            '</locations>' +
            '<ACL owner="ambari-qa" group="users" permission="0755"/>' +
            '<schema location="/none" provider="none"/>' +
            '<properties>' +
              '<property name="queueName" value="default"/>' +
              '<property name="jobPriority" value="NORMAL"/>' +
              '<property name="timeout" value="hours(1)"/>' +
              '<property name="parallel" value="3"/>' +
              '<property name="maxMaps" value="8"/>' +
              '<property name="mapBandwidthKB" value="1024"/>' +
            '</properties>' +
          '</feed>'
      },
      PROCESS: {
        processOne: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<process name="processOne" xmlns="uri:falcon:process:0.1">' +
            '<tags>pipeline=churnAnalysisDataPipeline,owner=ETLGroup,montevideo=mvd</tags>' +
            '<clusters>' +
              '<cluster name="primaryCluster">' +
                '<validity start="2014-02-28T00:00Z" end="2016-04-01T00:00Z"/>' +
              '</cluster>' +
            '</clusters>' +
            '<parallel>1</parallel>' +
            '<order>FIFO</order>' +
            '<frequency>hours(1)</frequency>' +
            '<timezone>GMT-12:00</timezone>' +
            '<inputs>' +
              '<input name="input" feed="rawEmailFeed" start="now(0,0)" end="now(0,0)"/>' +
            '</inputs>' +
            '<outputs>' +
              '<output name="output" feed="cleansedEmailFeed" instance="now(0,0)"/>' +
            '</outputs>' +
            '<workflow name="emailCleanseWorkflow2" version="pig-0.10.0" engine="pig" path="/user/ambari-qa/falcon/demo/apps/pig/id.pig"/>' +
            '<retry policy="periodic" delay="minutes(15)" attempts="3"/>' +
          '</process>',
        processTwo: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<process name="processTwo" xmlns="uri:falcon:process:0.1">' +
            '<tags>pipeline=churnAnalysisDataPipeline,owner=ETLGroup,externalSystem=USWestEmailServers</tags>' +
            '<clusters>' +
              '<cluster name="primaryCluster">' +
                '<validity start="2014-02-28T00:00Z" end="2016-03-31T00:00Z"/>' +
              '</cluster>' +
            '</clusters>' +
            '<parallel>1</parallel>' +
            '<order>FIFO</order>' +
            '<frequency>hours(1)</frequency>' +
            '<timezone>UTC</timezone>' +
            '<outputs>' +
              '<output name="output" feed="rawEmailFeed" instance="now(0,0)"/>' +
            '</outputs>' +
            '<workflow name="emailIngestWorkflow" version="2.0.0" engine="oozie" path="/user/ambari-qa/falcon/demo/apps/ingest/fs"/>' +
            '<retry policy="periodic" delay="minutes(15)" attempts="3"/>' +
          '</process>'
        }
    },
    instancesList = {
      FEED: [
        {
          "details": "",
          "endTime": "2013-10-21T14:40:26-07:00",
          "startTime": "2013-10-21T14:39:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933395-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-01T07:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "RUNNING",
          "instance": "2012-04-02T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUSPENDED",
          "instance": "2012-04-03T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "KILLED",
          "instance": "2012-04-04T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-05T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-06T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-07T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-08T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-09T08:00Z"
        },{
          "details": "",
          "endTime": "2013-10-21T14:40:26-07:00",
          "startTime": "2013-10-21T14:39:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933395-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-10T07:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "RUNNING",
          "instance": "2012-04-11T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUSPENDED",
          "instance": "2012-04-12T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "KILLED",
          "instance": "2012-04-13T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-14T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-15T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-16T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-17T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-18T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-19T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-20T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-21T08:00Z"
        }, {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-22T08:00Z"
        }
      ],
      PROCESS: [
        {
          "details": "",
          "endTime": "2013-10-21T14:40:26-07:00",
          "startTime": "2013-10-21T14:39:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933395-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-03T07:00Z"
        },
        {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-03T08:00Z"
        }
      ],
      DATASET: [
        {
          "details": "",
          "endTime": "2013-10-21T14:40:26-07:00",
          "startTime": "2013-10-21T14:39:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933395-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-03T07:00Z"
        },
        {
          "details": "",
          "endTime": "2013-10-21T14:42:26-07:00",
          "startTime": "2013-10-21T14:41:56-07:00",
          "cluster": "primary-cluster",
          "logFile": "http:\/\/localhost:11000\/oozie?job=0000070-131021115933397-oozie-rgau-W",
          "status": "SUCCEEDED",
          "instance": "2012-04-03T08:00Z"
        }
      ]
    },
    entityDependencies = {
      "entity": [
        {
          "name": "SampleInput",
          "type": "feed",
          "tag": ["Input"]
          //"list": {"tag": ["Input"]}
        },
        {
          "name": "SampleOutput",
          "type": "feed",
          "tag": ["Output"]
          //"list": {"tag": ["Output"]}
        },
        {
          "name": "primary-cluster",
          "type": "cluster"
        }
      ]
    },
    vertices = {
      "results": [
        {
          "timestamp":"2014-04-21T20:55Z",
          "name":"sampleIngestProcess",
          "type":"process-instance",
          "version":"2.0.0",
          "_id":4,
          "_type":"vertex"
        }
      ],
      "totalSize": 1
    },
    verticesDirection = {
      "results":[
        {
          "_id":"Q5V-4-5g",
          "_type":"edge",
          "_outV":4,
          "_inV":8,
          "_label":"output"
        }
      ],
      "totalSize":1
    },
    verticesProps = {
      "results":
      {
        "timestamp":"2014-04-25T22:20Z",
        "name":"local",
        "type":"cluster-entity"
      },
      "totalSize":3
    };

  exports.findByNameInList = findByNameInList;
  exports.findByStartEnd = findByStartEnd;
  exports.entitiesList = entitiesList;
  exports.definitions = definitions;
  exports.instancesList = instancesList;
  exports.entityDependencies = entityDependencies;
  exports.vertices = vertices;
  exports.verticesDirection = verticesDirection;
  exports.verticesProps = verticesProps;

})();