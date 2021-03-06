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

package org.apache.falcon.entity.store;

import org.apache.commons.codec.CharEncoding;
import org.apache.falcon.FalconException;
import org.apache.falcon.entity.v0.AccessControlList;
import org.apache.falcon.entity.v0.Entity;
import org.apache.falcon.entity.v0.EntityType;
import org.apache.falcon.hadoop.HadoopClientFactory;
import org.apache.falcon.service.ConfigurationChangeListener;
import org.apache.falcon.service.FalconService;
import org.apache.falcon.util.ReflectionUtils;
import org.apache.falcon.util.StartupProperties;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.fs.permission.FsAction;
import org.apache.hadoop.fs.permission.FsPermission;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.bind.JAXBException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Persistent store for falcon entities.
 */
public final class ConfigurationStore implements FalconService {

    private static final EntityType[] ENTITY_LOAD_ORDER = new EntityType[] {
        EntityType.CLUSTER, EntityType.FEED, EntityType.PROCESS, };

    private static final Logger LOG = LoggerFactory.getLogger(ConfigurationStore.class);
    private static final Logger AUDIT = LoggerFactory.getLogger("AUDIT");
    private static final String UTF_8 = CharEncoding.UTF_8;

    private static final FsPermission STORE_PERMISSION =
            new FsPermission(FsAction.ALL, FsAction.NONE, FsAction.NONE);

    private Set<ConfigurationChangeListener> listeners = new LinkedHashSet<ConfigurationChangeListener>();

    private ThreadLocal<Entity> updatesInProgress = new ThreadLocal<Entity>();

    private final Map<EntityType, ConcurrentHashMap<String, Entity>> dictionary
        = new HashMap<EntityType, ConcurrentHashMap<String, Entity>>();

    private static final Entity NULL = new Entity() {
        @Override
        public String getName() {
            return "NULL";
        }

        @Override
        public AccessControlList getACL() {
            return null;
        }
    };

    private static final ConfigurationStore STORE = new ConfigurationStore();

    public static ConfigurationStore get() {
        return STORE;
    }

    private final FileSystem fs;
    private final Path storePath;

    private ConfigurationStore() {
        for (EntityType type : EntityType.values()) {
            dictionary.put(type, new ConcurrentHashMap<String, Entity>());
        }

        String uri = StartupProperties.get().getProperty("config.store.uri");
        storePath = new Path(uri);
        fs = initializeFileSystem();
    }

    /**
     * Falcon owns this dir on HDFS which no one has permissions to read.
     *
     * @return FileSystem handle
     */
    private FileSystem initializeFileSystem() {
        try {
            FileSystem fileSystem =
                    HadoopClientFactory.get().createFalconFileSystem(storePath.toUri());
            if (!fileSystem.exists(storePath)) {
                LOG.info("Creating configuration store directory: {}", storePath);
                // set permissions so config store dir is owned by falcon alone
                HadoopClientFactory.mkdirs(fileSystem, storePath, STORE_PERMISSION);
            }

            return fileSystem;
        } catch (Exception e) {
            throw new RuntimeException("Unable to bring up config store for path: " + storePath, e);
        }
    }

    @Override
    public void init() throws FalconException {
        String listenerClassNames = StartupProperties.get().
                getProperty("configstore.listeners", "org.apache.falcon.entity.v0.EntityGraph");
        for (String listenerClassName : listenerClassNames.split(",")) {
            listenerClassName = listenerClassName.trim();
            if (listenerClassName.isEmpty()) {
                continue;
            }
            ConfigurationChangeListener listener = ReflectionUtils.getInstanceByClassName(listenerClassName);
            registerListener(listener);
        }

        try {
            for (EntityType type : ENTITY_LOAD_ORDER) {
                ConcurrentHashMap<String, Entity> entityMap = dictionary.get(type);
                FileStatus[] files = fs.globStatus(new Path(storePath, type.name() + Path.SEPARATOR + "*"));
                if (files != null) {
                    for (FileStatus file : files) {
                        String fileName = file.getPath().getName();
                        String encodedEntityName = fileName.substring(0, fileName.length() - 4); // drop
                        // ".xml"
                        String entityName = URLDecoder.decode(encodedEntityName, UTF_8);
                        Entity entity = restore(type, entityName);
                        entityMap.put(entityName, entity);
                        onReload(entity);
                    }
                }
            }
        } catch (IOException e) {
            throw new FalconException("Unable to restore configurations", e);
        }
    }

    public void registerListener(ConfigurationChangeListener listener) {
        listeners.add(listener);
    }

    public void unregisterListener(ConfigurationChangeListener listener) {
        listeners.remove(listener);
    }

    /**
     * @param type   - EntityType that need to be published
     * @param entity - Reference to the Entity Object
     * @throws FalconException
     */
    public synchronized void publish(EntityType type, Entity entity) throws FalconException {
        try {
            if (get(type, entity.getName()) == null) {
                persist(type, entity);
                onAdd(entity);
                dictionary.get(type).put(entity.getName(), entity);
            } else {
                throw new EntityAlreadyExistsException(
                        entity.toShortString() + " already registered with configuration store. "
                                + "Can't be submitted again. Try removing before submitting.");
            }
        } catch (IOException e) {
            throw new StoreAccessException(e);
        }
        AUDIT.info(type + "/" + entity.getName() + " is published into config store");
    }

    private synchronized void updateInternal(EntityType type, Entity entity) throws FalconException {
        try {
            if (get(type, entity.getName()) != null) {
                persist(type, entity);
                ConcurrentHashMap<String, Entity> entityMap = dictionary.get(type);
                Entity oldEntity = entityMap.get(entity.getName());
                onChange(oldEntity, entity);
                entityMap.put(entity.getName(), entity);
            } else {
                throw new FalconException(entity.toShortString() + " doesn't exist");
            }
        } catch (IOException e) {
            throw new StoreAccessException(e);
        }
        AUDIT.info(type + "/" + entity.getName() + " is replaced into config store");
    }

    public synchronized void update(EntityType type, Entity entity) throws FalconException {
        if (updatesInProgress.get() == entity) {
            updateInternal(type, entity);
        } else {
            throw new FalconException(entity.toShortString() + " is not initialized for update");
        }
    }

    private void onAdd(Entity entity) throws FalconException {
        for (ConfigurationChangeListener listener : listeners) {
            listener.onAdd(entity);
        }
    }

    private void onChange(Entity oldEntity, Entity newEntity) throws FalconException {
        for (ConfigurationChangeListener listener : listeners) {
            listener.onChange(oldEntity, newEntity);
        }
    }

    private void onReload(Entity entity) throws FalconException {
        for (ConfigurationChangeListener listener : listeners) {
            listener.onReload(entity);
        }
    }

    public synchronized void initiateUpdate(Entity entity) throws FalconException {
        if (get(entity.getEntityType(), entity.getName()) == null || updatesInProgress.get() != null) {
            throw new FalconException(
                    "An update for " + entity.toShortString() + " is already in progress or doesn't exist");
        }
        updatesInProgress.set(entity);
    }

    /**
     * @param type - Entity type that is being retrieved
     * @param name - Name as it appears in the entity xml definition
     * @param <T>  - Actual Entity object type
     * @return - Entity object from internal dictionary, If the object is not
     *         loaded in memory yet, it will retrieve it from persistent store
     *         just in time. On startup all the entities will be added to the
     *         dictionary with null reference.
     * @throws FalconException
     */
    @SuppressWarnings("unchecked")
    public <T extends Entity> T get(EntityType type, String name) throws FalconException {
        ConcurrentHashMap<String, Entity> entityMap = dictionary.get(type);
        if (entityMap.containsKey(name)) {
            if (updatesInProgress.get() != null && updatesInProgress.get().getEntityType() == type
                    && updatesInProgress.get().getName().equals(name)) {
                return (T) updatesInProgress.get();
            }
            T entity = (T) entityMap.get(name);
            if (entity == NULL) { // Object equality being checked
                try {
                    entity = this.restore(type, name);
                } catch (IOException e) {
                    throw new StoreAccessException(e);
                }
                entityMap.put(name, entity);
                return entity;
            } else {
                return entity;
            }
        } else {
            return null;
        }
    }

    public Collection<String> getEntities(EntityType type) {
        return Collections.unmodifiableCollection(dictionary.get(type).keySet());
    }

    /**
     * Remove an entity which is already stored in the config store.
     *
     * @param type - Entity type being removed
     * @param name - Name of the entity object being removed
     * @return - True is remove is successful, false if request entity doesn't
     *         exist
     * @throws FalconException
     */
    public synchronized boolean remove(EntityType type, String name) throws FalconException {
        Map<String, Entity> entityMap = dictionary.get(type);
        if (entityMap.containsKey(name)) {
            try {
                archive(type, name);
                Entity entity = entityMap.get(name);
                onRemove(entity);
                entityMap.remove(name);
            } catch (IOException e) {
                throw new StoreAccessException(e);
            }
            AUDIT.info(type + " " + name + " is removed from config store");
            return true;
        }
        return false;
    }

    private void onRemove(Entity entity) throws FalconException {
        for (ConfigurationChangeListener listener : listeners) {
            listener.onRemove(entity);
        }
    }

    /**
     * @param type   - Entity type that is to be stored into persistent storage
     * @param entity - entity to persist. JAXB Annotated entity will be marshalled
     *               to the persistent store. The convention used for storing the
     *               object:: PROP(config.store.uri)/{entitytype}/{entityname}.xml
     * @throws java.io.IOException If any error in accessing the storage
     * @throws FalconException
     */
    private void persist(EntityType type, Entity entity) throws IOException, FalconException {
        OutputStream out = fs
                .create(new Path(storePath,
                        type + Path.SEPARATOR + URLEncoder.encode(entity.getName(), UTF_8) + ".xml"));
        try {
            type.getMarshaller().marshal(entity, out);
            LOG.info("Persisted configuration {}/{}", type, entity.getName());
        } catch (JAXBException e) {
            LOG.error("Unable to serialize the entity object {}/{}", type, entity.getName(), e);
            throw new StoreAccessException("Unable to serialize the entity object " + type + "/" + entity.getName(), e);
        } finally {
            out.close();
        }
    }

    /**
     * Archive removed configuration in the persistent store.
     *
     * @param type - Entity type to archive
     * @param name - name
     * @throws IOException If any error in accessing the storage
     */
    private void archive(EntityType type, String name) throws IOException {
        Path archivePath = new Path(storePath, "archive" + Path.SEPARATOR + type);
        HadoopClientFactory.mkdirs(fs, archivePath, STORE_PERMISSION);
        fs.rename(new Path(storePath, type + Path.SEPARATOR + URLEncoder.encode(name, UTF_8) + ".xml"),
                new Path(archivePath, URLEncoder.encode(name, UTF_8) + "." + System.currentTimeMillis()));
        LOG.info("Archived configuration {}/{}", type, name);
    }

    /**
     * @param type - Entity type to restore from persistent store
     * @param name - Name of the entity to restore.
     * @param <T>  - Actual entity object type
     * @return - De-serialized entity object restored from persistent store
     * @throws IOException     If any error in accessing the storage
     * @throws FalconException
     */
    @SuppressWarnings("unchecked")
    private synchronized <T extends Entity> T restore(EntityType type, String name)
        throws IOException, FalconException {

        InputStream in = fs.open(new Path(storePath, type + Path.SEPARATOR + URLEncoder.encode(name, UTF_8) + ".xml"));
        try {
            return (T) type.getUnmarshaller().unmarshal(in);
        } catch (JAXBException e) {
            throw new StoreAccessException("Unable to un-marshall xml definition for " + type + "/" + name, e);
        } finally {
            in.close();
            LOG.info("Restored configuration {}/{}", type, name);
        }
    }

    public void cleanupUpdateInit() {
        updatesInProgress.set(null);
    }

    @Override
    public String getName() {
        return this.getClass().getName();
    }

    @Override
    public void destroy() {
    }
}
