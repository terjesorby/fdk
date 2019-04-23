/*
 * Copyright 2016 Red Hat, Inc. and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package no.fdk.keycloak.user;

import org.jboss.logging.Logger;
import org.keycloak.component.ComponentModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.storage.UserStorageProviderFactory;

import javax.naming.InitialContext;

/**
 * @author <a href="mailto:bill@burkecentral.com">Bill Burke</a>
 * @version $Revision: 1 $
 */
public class RestUserStorageProviderFactory implements UserStorageProviderFactory<RestUserStorageProvider> {
    private static final Logger logger = Logger.getLogger(RestUserStorageProviderFactory.class);

    @Override
    public RestUserStorageProvider create(KeycloakSession session, ComponentModel model) {
        return new RestUserStorageProvider(session,model);
    }

    @Override
    public String getId() { return "user-storage-rest"; }

    @Override
    public String getHelpText() {
        return "User storage rest provider";
    }

    @Override
    public void close() {
        logger.info("<<<<<< Closing factory");

    }
}