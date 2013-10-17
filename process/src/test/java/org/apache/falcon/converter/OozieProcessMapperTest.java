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

package org.apache.falcon.converter;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.Unmarshaller;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;

import org.apache.falcon.FalconException;
import org.apache.falcon.Tag;
import org.apache.falcon.cluster.util.EmbeddedCluster;
import org.apache.falcon.entity.CatalogStorage;
import org.apache.falcon.entity.ClusterHelper;
import org.apache.falcon.entity.EntityUtil;
import org.apache.falcon.entity.FeedHelper;
import org.apache.falcon.entity.Storage;
import org.apache.falcon.entity.store.ConfigurationStore;
import org.apache.falcon.entity.v0.EntityType;
import org.apache.falcon.entity.v0.Frequency;
import org.apache.falcon.entity.v0.SchemaHelper;
import org.apache.falcon.entity.v0.cluster.Cluster;
import org.apache.falcon.entity.v0.cluster.Interfacetype;
import org.apache.falcon.entity.v0.feed.Feed;
import org.apache.falcon.entity.v0.feed.LocationType;
import org.apache.falcon.entity.v0.process.Input;
import org.apache.falcon.entity.v0.process.Output;
import org.apache.falcon.entity.v0.process.Process;
import org.apache.falcon.entity.v0.process.Validity;
import org.apache.falcon.oozie.bundle.BUNDLEAPP;
import org.apache.falcon.oozie.coordinator.CONFIGURATION;
import org.apache.falcon.oozie.coordinator.CONFIGURATION.Property;
import org.apache.falcon.oozie.coordinator.COORDINATORAPP;
import org.apache.falcon.oozie.coordinator.SYNCDATASET;
import org.apache.falcon.oozie.workflow.ACTION;
import org.apache.falcon.oozie.workflow.DECISION;
import org.apache.falcon.oozie.workflow.WORKFLOWAPP;
import org.apache.falcon.util.StartupProperties;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Test for the Falcon entities mapping into Oozie artifacts.
 */
public class OozieProcessMapperTest extends AbstractTestBase {

    private String hdfsUrl;
    private FileSystem fs;

    @BeforeClass
    public void setUpDFS() throws Exception {
        EmbeddedCluster cluster = EmbeddedCluster.newCluster("testCluster");
        Configuration conf = cluster.getConf();
        hdfsUrl = conf.get("fs.default.name");
    }

    @BeforeMethod
    public void setUp() throws Exception {
        super.setup();

        ConfigurationStore store = ConfigurationStore.get();
        Cluster cluster = store.get(EntityType.CLUSTER, "corp");
        ClusterHelper.getInterface(cluster, Interfacetype.WRITE).setEndpoint(hdfsUrl);
        ClusterHelper.getInterface(cluster, Interfacetype.REGISTRY).setEndpoint("thrift://localhost:49083");
        fs = new Path(hdfsUrl).getFileSystem(new Configuration());
        fs.create(new Path(ClusterHelper.getLocation(cluster, "working"), "libext/PROCESS/ext.jar")).close();

        Process process = store.get(EntityType.PROCESS, "clicksummary");
        Path wfpath = new Path(process.getWorkflow().getPath());
        assert new Path(hdfsUrl).getFileSystem(new Configuration()).mkdirs(wfpath);
    }

    public void testDefCoordMap(Process process, COORDINATORAPP coord) throws Exception {
        assertEquals("FALCON_PROCESS_DEFAULT_" + process.getName(), coord.getName());
        Validity processValidity = process.getClusters().getClusters().get(0).getValidity();
        assertEquals(SchemaHelper.formatDateUTC(processValidity.getStart()), coord.getStart());
        assertEquals(SchemaHelper.formatDateUTC(processValidity.getEnd()), coord.getEnd());
        assertEquals("${coord:" + process.getFrequency().toString() + "}", coord.getFrequency());
        assertEquals(process.getTimezone().getID(), coord.getTimezone());

        assertEquals(process.getParallel() + "", coord.getControls().getConcurrency());
        assertEquals(process.getOrder().name(), coord.getControls().getExecution());

        assertEquals(process.getInputs().getInputs().get(0).getName(),
                coord.getInputEvents().getDataIn().get(0).getName());
        assertEquals(process.getInputs().getInputs().get(0).getName(),
                coord.getInputEvents().getDataIn().get(0).getDataset());
        assertEquals("${" + process.getInputs().getInputs().get(0).getStart() + "}",
                coord.getInputEvents().getDataIn().get(0).getStartInstance());
        assertEquals("${" + process.getInputs().getInputs().get(0).getEnd() + "}",
                coord.getInputEvents().getDataIn().get(0).getEndInstance());

        assertEquals(process.getInputs().getInputs().get(1).getName(),
                coord.getInputEvents().getDataIn().get(1).getName());
        assertEquals(process.getInputs().getInputs().get(1).getName(),
                coord.getInputEvents().getDataIn().get(1).getDataset());
        assertEquals("${" + process.getInputs().getInputs().get(1).getStart() + "}",
                coord.getInputEvents().getDataIn().get(1).getStartInstance());
        assertEquals("${" + process.getInputs().getInputs().get(1).getEnd() + "}",
                coord.getInputEvents().getDataIn().get(1).getEndInstance());

        assertEquals(process.getOutputs().getOutputs().get(0).getName() + "stats",
                coord.getOutputEvents().getDataOut().get(1).getName());
        assertEquals(process.getOutputs().getOutputs().get(0).getName() + "meta",
                coord.getOutputEvents().getDataOut().get(2).getName());
        assertEquals(process.getOutputs().getOutputs().get(0).getName() + "tmp",
                coord.getOutputEvents().getDataOut().get(3).getName());

        assertEquals(process.getOutputs().getOutputs().get(0).getName(),
                coord.getOutputEvents().getDataOut().get(0).getName());
        assertEquals("${" + process.getOutputs().getOutputs().get(0).getInstance() + "}",
                coord.getOutputEvents().getDataOut().get(0).getInstance());
        assertEquals(process.getOutputs().getOutputs().get(0).getName(),
                coord.getOutputEvents().getDataOut().get(0).getDataset());

        assertEquals(6, coord.getDatasets().getDatasetOrAsyncDataset().size());

        ConfigurationStore store = ConfigurationStore.get();
        Feed feed = store.get(EntityType.FEED, process.getInputs().getInputs().get(0).getFeed());
        SYNCDATASET ds = (SYNCDATASET) coord.getDatasets().getDatasetOrAsyncDataset().get(0);

        final org.apache.falcon.entity.v0.feed.Cluster feedCluster = feed.getClusters().getClusters().get(0);
        assertEquals(SchemaHelper.formatDateUTC(feedCluster.getValidity().getStart()), ds.getInitialInstance());
        assertEquals(feed.getTimezone().getID(), ds.getTimezone());
        assertEquals("${coord:" + feed.getFrequency().toString() + "}", ds.getFrequency());
        assertEquals("", ds.getDoneFlag());
        assertEquals(ds.getUriTemplate(),
                FeedHelper.createStorage(feedCluster, feed).getUriTemplate(LocationType.DATA));

        HashMap<String, String> props = new HashMap<String, String>();
        for (Property prop : coord.getAction().getWorkflow().getConfiguration().getProperty()) {
            props.put(prop.getName(), prop.getValue());
        }
        assertEquals(props.get("mapred.job.priority"), "LOW");
        Assert.assertEquals(props.get("falconFeedStorageType"), Storage.TYPE.FILESYSTEM.name());

        assertLibExtensions(coord);
    }

    @Test
    public void testBundle() throws Exception {
        String path = StartupProperties.get().getProperty("system.lib.location");
        if (!new File(path).exists()) {
            Assert.assertTrue(new File(path).mkdirs());
        }
        Process process = ConfigurationStore.get().get(EntityType.PROCESS, "clicksummary");

        WORKFLOWAPP parentWorkflow = initializeProcessMapper(process, "12", "360");
        testParentWorkflow(process, parentWorkflow);
    }

    @Test
    public void testBundle1() throws Exception {
        Process process = ConfigurationStore.get().get(EntityType.PROCESS, "clicksummary");
        process.setFrequency(Frequency.fromString("minutes(1)"));
        process.setTimeout(Frequency.fromString("minutes(15)"));

        WORKFLOWAPP parentWorkflow = initializeProcessMapper(process, "30", "15");
        testParentWorkflow(process, parentWorkflow);
    }

    @Test
    public void testPigProcessMapper() throws Exception {
        Process process = ConfigurationStore.get().get(EntityType.PROCESS, "pig-process");
        Assert.assertEquals("pig", process.getWorkflow().getEngine().value());

        WORKFLOWAPP parentWorkflow = initializeProcessMapper(process, "12", "360");
        testParentWorkflow(process, parentWorkflow);

        List<Object> decisionOrForkOrJoin = parentWorkflow.getDecisionOrForkOrJoin();

        ACTION pigAction = (ACTION) decisionOrForkOrJoin.get(3);
        Assert.assertEquals("user-pig-job", pigAction.getName());
        Assert.assertEquals("${nameNode}/apps/pig/id.pig", pigAction.getPig().getScript());
        Assert.assertEquals(Collections.EMPTY_LIST, pigAction.getPig().getArchive());

        ACTION oozieAction = (ACTION) decisionOrForkOrJoin.get(4);
        Assert.assertEquals("user-oozie-workflow", oozieAction.getName());
        Assert.assertEquals("#USER_WF_PATH#", oozieAction.getSubWorkflow().getAppPath());
    }

    @Test
    public void testProcessMapperForTableStorage() throws Exception {
        URL resource = this.getClass().getResource("/config/feed/hive-table-feed.xml");
        Feed inFeed = (Feed) EntityType.FEED.getUnmarshaller().unmarshal(resource);
        ConfigurationStore.get().publish(EntityType.FEED, inFeed);

        resource = this.getClass().getResource("/config/feed/hive-table-feed-out.xml");
        Feed outFeed = (Feed) EntityType.FEED.getUnmarshaller().unmarshal(resource);
        ConfigurationStore.get().publish(EntityType.FEED, outFeed);

        resource = this.getClass().getResource("/config/process/process-table.xml");
        Process process = (Process) EntityType.PROCESS.getUnmarshaller().unmarshal(resource);
        ConfigurationStore.get().publish(EntityType.PROCESS, process);

        Cluster cluster = ConfigurationStore.get().get(EntityType.CLUSTER, "corp");
        OozieProcessMapper mapper = new OozieProcessMapper(process);
        Path bundlePath = new Path("/", EntityUtil.getStagingPath(process));
        mapper.map(cluster, bundlePath);
        assertTrue(fs.exists(bundlePath));

        BUNDLEAPP bundle = getBundle(bundlePath);
        assertEquals(EntityUtil.getWorkflowName(process).toString(), bundle.getName());
        assertEquals(1, bundle.getCoordinator().size());
        assertEquals(EntityUtil.getWorkflowName(Tag.DEFAULT, process).toString(),
                bundle.getCoordinator().get(0).getName());
        String coordPath = bundle.getCoordinator().get(0).getAppPath().replace("${nameNode}", "");

        COORDINATORAPP coord = getCoordinator(new Path(coordPath));
        CONFIGURATION conf = coord.getAction().getWorkflow().getConfiguration();
        List<Property> properties = conf.getProperty();

        Map<String, String> expected = getExpectedProperties(inFeed, outFeed, process, cluster);

        for (Property property : properties) {
            if (expected.containsKey(property.getName())) {
                Assert.assertEquals(property.getValue(), expected.get(property.getName()));
            }
        }
    }

    private Map<String, String> getExpectedProperties(Feed inFeed, Feed outFeed, Process process,
                                                      Cluster cluster) throws FalconException {
        Map<String, String> expected = new HashMap<String, String>();
        for (Input input : process.getInputs().getInputs()) {
            CatalogStorage storage = (CatalogStorage) FeedHelper.createStorage(cluster, inFeed);
            propagateStorageProperties(input.getName(), storage, expected);
        }

        for (Output output : process.getOutputs().getOutputs()) {
            CatalogStorage storage = (CatalogStorage) FeedHelper.createStorage(cluster, outFeed);
            propagateStorageProperties(output.getName(), storage, expected);
        }

        return expected;
    }

    private void propagateStorageProperties(String feedName, CatalogStorage tableStorage,
                                            Map<String, String> props) {
        String prefix = "falcon_" + feedName;
        props.put(prefix + "_storage_type", tableStorage.getType().name());
        props.put(prefix + "_catalog_url", tableStorage.getCatalogUrl());
        props.put(prefix + "_database", tableStorage.getDatabase());
        props.put(prefix + "_table", tableStorage.getTable());

        if (prefix.equals("input")) {
            props.put(prefix + "_partition_filter_pig", "${coord:dataInPartitionFilter('input', 'pig')}");
            props.put(prefix + "_partition_filter_hive", "${coord:dataInPartitionFilter('input', 'hive')}");
            props.put(prefix + "_partition_filter_java", "${coord:dataInPartitionFilter('input', 'java')}");
        } else if (prefix.equals("output")) {
            props.put(prefix + "_dataout_partitions", "${coord:dataOutPartitions('output')}");
        }
    }

    private void assertLibExtensions(COORDINATORAPP coord) throws Exception {
        String wfPath = coord.getAction().getWorkflow().getAppPath().replace("${nameNode}", "");
        JAXBContext jaxbContext = JAXBContext.newInstance(WORKFLOWAPP.class);
        WORKFLOWAPP wf = ((JAXBElement<WORKFLOWAPP>) jaxbContext.createUnmarshaller().unmarshal(
                fs.open(new Path(wfPath, "workflow.xml")))).getValue();
        List<Object> actions = wf.getDecisionOrForkOrJoin();
        for (Object obj : actions) {
            if (!(obj instanceof ACTION)) {
                continue;
            }
            ACTION action = (ACTION) obj;
            List<String> files = null;
            if (action.getJava() != null) {
                files = action.getJava().getFile();
            } else if (action.getPig() != null) {
                files = action.getPig().getFile();
            } else if (action.getMapReduce() != null) {
                files = action.getMapReduce().getFile();
            }
            if (files != null) {
                Assert.assertTrue(files.get(files.size() - 1)
                        .endsWith("/projects/falcon/working/libext/PROCESS/ext.jar"));
            }
        }
    }

    private WORKFLOWAPP initializeProcessMapper(Process process, String throttle, String timeout)
        throws Exception {
        Cluster cluster = ConfigurationStore.get().get(EntityType.CLUSTER, "corp");
        OozieProcessMapper mapper = new OozieProcessMapper(process);
        Path bundlePath = new Path("/", EntityUtil.getStagingPath(process));
        mapper.map(cluster, bundlePath);
        assertTrue(fs.exists(bundlePath));

        BUNDLEAPP bundle = getBundle(bundlePath);
        assertEquals(EntityUtil.getWorkflowName(process).toString(), bundle.getName());
        assertEquals(1, bundle.getCoordinator().size());
        assertEquals(EntityUtil.getWorkflowName(Tag.DEFAULT, process).toString(),
                bundle.getCoordinator().get(0).getName());
        String coordPath = bundle.getCoordinator().get(0).getAppPath().replace("${nameNode}", "");

        COORDINATORAPP coord = getCoordinator(new Path(coordPath));
        testDefCoordMap(process, coord);
        assertEquals(coord.getControls().getThrottle(), throttle);
        assertEquals(coord.getControls().getTimeout(), timeout);

        String wfPath = coord.getAction().getWorkflow().getAppPath().replace("${nameNode}", "");
        return getParentWorkflow(new Path(wfPath));
    }

    public void testParentWorkflow(Process process, WORKFLOWAPP parentWorkflow) {
        Assert.assertEquals(EntityUtil.getWorkflowName(Tag.DEFAULT, process).toString(), parentWorkflow.getName());

        List<Object> decisionOrForkOrJoin = parentWorkflow.getDecisionOrForkOrJoin();
        Assert.assertEquals("should-record", ((DECISION) decisionOrForkOrJoin.get(0)).getName());
        Assert.assertEquals("recordsize", ((ACTION) decisionOrForkOrJoin.get(1)).getName());
        Assert.assertEquals("user-workflow", ((DECISION) decisionOrForkOrJoin.get(2)).getName());
        Assert.assertEquals("succeeded-post-processing", ((ACTION) decisionOrForkOrJoin.get(5)).getName());
        Assert.assertEquals("failed-post-processing", ((ACTION) decisionOrForkOrJoin.get(6)).getName());
    }

    private COORDINATORAPP getCoordinator(Path path) throws Exception {
        String bundleStr = readFile(path);

        Unmarshaller unmarshaller = JAXBContext.newInstance(COORDINATORAPP.class).createUnmarshaller();
        SchemaFactory schemaFactory = SchemaFactory.newInstance("http://www.w3.org/2001/XMLSchema");
        Schema schema = schemaFactory.newSchema(this.getClass().getResource("/oozie-coordinator-0.3.xsd"));
        unmarshaller.setSchema(schema);
        JAXBElement<COORDINATORAPP> jaxbBundle = unmarshaller.unmarshal(
                new StreamSource(new ByteArrayInputStream(bundleStr.trim().getBytes())), COORDINATORAPP.class);
        return jaxbBundle.getValue();
    }

    private WORKFLOWAPP getParentWorkflow(Path path) throws Exception {
        String workflow = readFile(new Path(path, "workflow.xml"));

        Unmarshaller unmarshaller = JAXBContext.newInstance(WORKFLOWAPP.class).createUnmarshaller();
        SchemaFactory schemaFactory = SchemaFactory.newInstance("http://www.w3.org/2001/XMLSchema");
        Schema schema = schemaFactory.newSchema(this.getClass().getResource("/oozie-workflow-0.3.xsd"));
        unmarshaller.setSchema(schema);
        JAXBElement<WORKFLOWAPP> jaxbWorkflow = unmarshaller.unmarshal(
                new StreamSource(new ByteArrayInputStream(workflow.trim().getBytes())), WORKFLOWAPP.class);
        return jaxbWorkflow.getValue();
    }

    private BUNDLEAPP getBundle(Path path) throws Exception {
        String bundleStr = readFile(new Path(path, "bundle.xml"));

        Unmarshaller unmarshaller = JAXBContext.newInstance(BUNDLEAPP.class).createUnmarshaller();
        SchemaFactory schemaFactory = SchemaFactory.newInstance("http://www.w3.org/2001/XMLSchema");
        Schema schema = schemaFactory.newSchema(this.getClass().getResource("/oozie-bundle-0.1.xsd"));
        unmarshaller.setSchema(schema);
        JAXBElement<BUNDLEAPP> jaxbBundle = unmarshaller.unmarshal(
                new StreamSource(new ByteArrayInputStream(bundleStr.trim().getBytes())), BUNDLEAPP.class);
        return jaxbBundle.getValue();
    }

    private String readFile(Path path) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(fs.open(path)));
        String line;
        StringBuilder contents = new StringBuilder();
        while ((line = reader.readLine()) != null) {
            contents.append(line);
        }
        return contents.toString();
    }

    @Override
    @AfterClass
    public void cleanup() throws Exception {
        super.cleanup();
        ConfigurationStore.get().remove(EntityType.PROCESS, "table-process");
        ConfigurationStore.get().remove(EntityType.FEED, "clicks-raw-table");
        ConfigurationStore.get().remove(EntityType.FEED, "clicks-summary-table");
    }
}
