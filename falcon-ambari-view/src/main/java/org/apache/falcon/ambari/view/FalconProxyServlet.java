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
package org.apache.falcon.ambari.view;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;

import javax.inject.Inject;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.UriBuilder;
import javax.ws.rs.core.UriInfo;

import org.apache.ambari.view.ViewContext;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;

public class FalconProxyServlet {

	@Inject
	ViewContext context;

	private static final String SERVICE_URI_PROP = "falcon.service.uri";
	private static final String DEFAULT_SERVICE_URI = "http://127.0.0.1:15000";
	private static final String USER_NAME = "user.name";

	private static final String GET_METHOD = "GET";
	private static final String POST_METHOD = "POST";
	private static final String DELETE_METHOD = "DELETE";
	
	private static final String FALCON_ERROR = "<result><status>FAILED</status>";

	@GET
	@Path("/")
	@Produces(MediaType.TEXT_PLAIN)
	public Response setUser(@Context HttpHeaders headers, @Context UriInfo ui) {
		String result;
		try {
			result = context.getUsername();
			return Response.ok(result).type(defineType(result)).build();
		} catch (Exception ex) {
			ex.printStackTrace();
			result = ex.toString();
			return Response.status(Status.BAD_REQUEST).entity(result).build();
		}
	}
	
	@GET
	@Path("/{path: .*}")
	@Produces(MediaType.TEXT_PLAIN)
	public Response getUsage(@Context HttpHeaders headers, @Context UriInfo ui) {
		String result;
		try {
			String serviceURI = buildURI(ui);
			result = consumeService(serviceURI, GET_METHOD, null);
			return Response.ok(result).type(defineType(result)).build();
		} catch (Exception ex) {
			ex.printStackTrace();
			result = ex.toString();
			return Response.status(Status.BAD_REQUEST).entity(result).build();
		}
	}

	@POST
	@Path("/{path: .*}")
	@Produces(MediaType.TEXT_PLAIN)
	public Response handlePost(String xml, @Context UriInfo ui)
			throws IOException {
		String result;
		try {
			String serviceURI = buildURI(ui);
			result = consumeService(serviceURI, POST_METHOD, xml);
			if(result.contains(FALCON_ERROR)){
				return Response.status(Status.BAD_REQUEST).entity(result).type(defineType(result)).build();
			}
			return Response.ok(result).type(defineType(result)).build();
		} catch (Exception ex) {
			ex.printStackTrace();
			result = ex.toString();
			return Response.status(Status.BAD_REQUEST).entity(result).build();
		}
	}

	@DELETE
	@Path("/{path: .*}")
	@Produces(MediaType.TEXT_PLAIN)
	public Response handleDelete(@Context UriInfo ui) throws IOException {
		String result;
		try {
			String serviceURI = buildURI(ui);
			result = consumeService(serviceURI, DELETE_METHOD, null);
			return Response.ok(result).type(defineType(result)).build();
		} catch (Exception ex) {
			ex.printStackTrace();
			result = ex.toString();
			return Response.status(Status.BAD_REQUEST).entity(result).build();
		}
	}

	private String buildURI(UriInfo ui) {

		String uiURI = ui.getAbsolutePath().getPath();
		int index = uiURI.indexOf("proxy/") + 5;
		uiURI = uiURI.substring(index);

		String serviceURI = context.getProperties().get(SERVICE_URI_PROP) != null ? context
				.getProperties().get(SERVICE_URI_PROP) : DEFAULT_SERVICE_URI;
		serviceURI += uiURI;

		MultivaluedMap<String, String> parameters = ui.getQueryParameters();
		Iterator<String> it = parameters.keySet().iterator();
		int i = 0;
		while (it.hasNext()) {
			String key = it.next();
			List<String> values = parameters.get(key);
			Iterator<String> it2 = values.iterator();
			if (i == 0) {
				serviceURI += "?" + key + "=" + it2.next();
			} else {
				serviceURI += "&" + key + "=" + it2.next();
			}
			i++;
		}
		return serviceURI;
	}

	public String consumeService(String urlToRead, String method, String xml) {
		ClientConfig config = new DefaultClientConfig();
		Client client = Client.create(config);
		WebResource service = client.resource(UriBuilder.fromUri(urlToRead)
				.build());
		ClientResponse response;
		if (method.equals(POST_METHOD)) {
			response = service.accept(MediaType.APPLICATION_JSON).post(
					ClientResponse.class, xml);
		} else if (method.equals(DELETE_METHOD)) {
			response = service.accept(MediaType.APPLICATION_JSON).delete(
					ClientResponse.class);
		} else {
			response = service.accept(MediaType.APPLICATION_JSON).get(
					ClientResponse.class);
		}
		return response.getEntity(String.class);
	}
	
	private String defineType(String response){
		if(response.startsWith("{")){
//			return MediaType.APPLICATION_JSON;
			return MediaType.TEXT_PLAIN;
		}else if(response.startsWith("<")){
			return MediaType.TEXT_XML;
		}else{
			return MediaType.TEXT_PLAIN;
		}
	}

}
