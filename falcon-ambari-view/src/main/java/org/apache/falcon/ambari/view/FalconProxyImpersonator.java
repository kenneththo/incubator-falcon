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

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.*;

import org.apache.ambari.view.*;

public class FalconProxyImpersonator {

  ViewContext viewContext;

  private static final String SERVICE_URI_PROP = "falcon.service.uri";
  private static final String DEFAULT_SERVICE_URI = "http://sandbox.hortonworks.com:15000";
  private static final String USER_NAME = "user.name";

  private static final String GET_METHOD = "GET";
  private static final String POST_METHOD = "POST";
  private static final String DELETE_METHOD = "DELETE";

  private static final String FALCON_ERROR = "<result><status>FAILED</status>";
  private static final String ENTITY_DEFINITION = "/entities/list/";

  @Inject
  public FalconProxyImpersonator(ViewContext viewContext) {
    this.viewContext = viewContext;
  }

  @GET
  @Path("/")
  public Response setUser(@Context HttpHeaders headers, @Context UriInfo ui) {
    String result;
    try {
      result = viewContext.getUsername();
      return Response.ok(result).type(defineType(result)).build();
    } catch (Exception ex) {
      ex.printStackTrace();
      result = ex.toString();
      return Response.status(Response.Status.BAD_REQUEST).entity(result).build();
    }
  }

  @GET
  @Path("/{path: .*}")
  public Response getUsage(@Context HttpHeaders headers, @Context UriInfo ui) {
    String result;
    try {
      String serviceURI = buildURI(ui);
      return consumeService(headers, serviceURI, GET_METHOD, null);
    } catch (Exception ex) {
      ex.printStackTrace();
      result = ex.toString();
      return Response.status(Response.Status.BAD_REQUEST).entity(result).build();
    }
  }

  @POST
  @Path("/{path: .*}")
  public Response handlePost(String xml, @Context HttpHeaders headers, @Context UriInfo ui)
      throws IOException {
    String result;
    try {
      String serviceURI = buildURI(ui);
      return consumeService(headers, serviceURI, POST_METHOD, xml);
    } catch (Exception ex) {
      ex.printStackTrace();
      result = ex.toString();
      return Response.status(Response.Status.BAD_REQUEST).entity(result).build();
    }
  }

  @DELETE
  @Path("/{path: .*}")
  public Response handleDelete(@Context HttpHeaders headers, @Context UriInfo ui) throws IOException {
    String result;
    try {
      String serviceURI = buildURI(ui);
      return consumeService(headers, serviceURI, DELETE_METHOD, null);
    } catch (Exception ex) {
      ex.printStackTrace();
      result = ex.toString();
      return Response.status(Response.Status.BAD_REQUEST).entity(result).build();
    }
  }

  private String buildURI(UriInfo ui) {

    String uiURI = ui.getAbsolutePath().getPath();
    int index = uiURI.indexOf("proxy/") + 5;
    uiURI = uiURI.substring(index);

    String serviceURI = viewContext.getProperties().get(SERVICE_URI_PROP) != null ? viewContext
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

//	public Response consumeService(String urlToRead, String method, String xml) throws Exception {
//
//		Response response;
//		ImpersonatorResponse impResponse;
//
//		this.impersonator = viewContext.getHttpImpersonator();
//		this.impersonatorSetting = viewContext.getImpersonatorSetting();
//		Map<String, List<String>> headers = new HashMap<String, List<String>>();
//
//		headers.put(this.impersonator.FALCON_AMBARI_VIEW, new ArrayList<String>() {{add("YES"); }} );
//
//		if (method.equals(POST_METHOD)) {
//			headers.put("Accept", new ArrayList<String>() {{add(MediaType.APPLICATION_JSON); }} );
//			headers.put("Content-type", new ArrayList<String>() {{add("text/xml"); }} );
//			impResponse = this.impersonator.requestURL(urlToRead, POST_METHOD, headers, xml, this.impersonatorSetting);
//		} else if (method.equals(DELETE_METHOD)) {
//			headers.put("Accept", new ArrayList<String>() {{add(MediaType.APPLICATION_JSON); }} );
//			impResponse = this.impersonator.requestURL(urlToRead, DELETE_METHOD, headers, null, this.impersonatorSetting);
//		} else {
//			headers = checkIfDefinition(urlToRead, headers);
//			impResponse = this.impersonator.requestURL(urlToRead, GET_METHOD, headers, null, this.impersonatorSetting);
//		}
//
//		if(Response.Status.OK.getStatusCode() == impResponse.getResponseCode() && impResponse.getResponse().contains(FALCON_ERROR)){
//			response = Response.status(Response.Status.BAD_REQUEST).entity(impResponse.getResponse()).type(MediaType.TEXT_PLAIN).build();
//		}else{
//			Response.Status status = Response.Status.fromStatusCode(impResponse.getResponseCode());
//			return Response.status(status).entity(impResponse.getResponse()).type(defineType(impResponse.getResponse())).build();
//		}
//
//		return response;
//	}

  public Response consumeService(HttpHeaders headers, String urlToRead, String method, String xml) throws Exception {

    Response response;

    URLStreamProvider streamProvider = viewContext.getURLStreamProvider();
    String name = viewContext.getUsername();
//    Map<String, String> headers = Collections.singletonMap("user.name", name);
    Map<String, String> newHeaders = new HashMap();
    newHeaders.put("user.name", name);
    InputStream stream;

    if (method.equals(POST_METHOD)) {
      newHeaders.put("Accept", MediaType.APPLICATION_JSON);
      newHeaders.put("Content-type", "text/xml");
      stream = streamProvider.readFrom(urlToRead, method, xml, newHeaders);
    } else if (method.equals(DELETE_METHOD)) {
      newHeaders.put("Accept", MediaType.APPLICATION_JSON);
      stream = streamProvider.readFrom(urlToRead, method, null, newHeaders);
    } else {
      newHeaders = checkIfDefinition(urlToRead, newHeaders);
      stream = streamProvider.readFrom(urlToRead, method, null, newHeaders);
    }

    String sresponse = getStringFromInputStream(stream);


//		if(Response.Status.OK.getStatusCode() == impResponse.getResponseCode() && impResponse.getResponse().contains(FALCON_ERROR)){
//			response = Response.status(Response.Status.BAD_REQUEST).entity(impResponse.getResponse()).type(MediaType.TEXT_PLAIN).build();
//		}else{
//			Response.Status status = Response.Status.fromStatusCode(impResponse.getResponseCode());
//			return Response.status(status).entity(impResponse.getResponse()).type(defineType(impResponse.getResponse())).build();
//		}

    if(sresponse.contains(FALCON_ERROR) || sresponse.contains(Response.Status.BAD_REQUEST.name())){
      response = Response.status(Response.Status.BAD_REQUEST).entity(sresponse).type(MediaType.TEXT_PLAIN).build();
    }else{
//      Response.Status status = Response.Status.fromStatusCode(impResponse.getResponseCode());
      return Response.status(Response.Status.OK).entity(sresponse).type(defineType(sresponse)).build();
    }

    return response;
  }

  private String getStringFromInputStream(InputStream is) {

    BufferedReader br = null;
    StringBuilder sb = new StringBuilder();

    String line;
    try {
      br = new BufferedReader(new InputStreamReader(is));
      while ((line = br.readLine()) != null) {
        sb.append(line);
      }
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if (br != null) {
        try {
          br.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }

    return sb.toString();

  }

  private String defineType(String response) {
    if (response.startsWith("{")) {
//			return MediaType.APPLICATION_JSON;
      return MediaType.TEXT_PLAIN;
    } else if (response.startsWith("<")) {
      return MediaType.TEXT_XML;
//			return MediaType.APPLICATION_JSON;
//			return MediaType.TEXT_PLAIN;
    } else {
      return MediaType.TEXT_PLAIN;
    }
  }

  private Map<String, String> checkIfDefinition(String urlToRead, Map<String, String> headers) throws Exception {
    if (urlToRead.contains(ENTITY_DEFINITION)) {
//			headers.put("Accept", new ArrayList<String>() {{add(MediaType.APPLICATION_JSON); }} );
      headers.put("Accept", MediaType.APPLICATION_JSON);
    }
    return headers;
  }

  public static String appendCookie(String cookies, String newCookie) {
    if (cookies == null || cookies.length() == 0) {
      return newCookie;
    }
    return cookies + "; " + newCookie;
  }

  private Map<String, Object> setCookies(Map<String, Object> headers, Map<String, Cookie> cookies){

    return headers;
  }

}
