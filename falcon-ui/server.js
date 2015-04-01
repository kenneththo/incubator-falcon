(function () {
  "use strict";

  var bodyParser = require('body-parser'),
    express = require('express'),
    mockData = require('./express-data/mockData.js'),
    chartData = require('./express-data/chartData.js'),
    server = express(),
    PORT = 3000;

  server.use('/', express.static(__dirname + '/dist'));
  server.use(bodyParser());
  server.use(function (req, res, next) {
    if (req.is('text/*')) {
      req.text = '';
      req.setEncoding('utf8');
      req.on('data', function (chunk) { req.text += chunk; });
      req.on('end', next);
    } else {
      next();
    }
  });

  function searchByName(name, list){
    var result = [];
    var index = 0;
    for(var i=0; i<list.length; i++){
      //if(list[i].name === name){
      if(list[i].name.indexOf(name) !== -1){
        result[index++] = list[i];
      }
    }
    return result;
  }

  function searchTag(tag, list){
    var result = [];
    var index = 0;
    for(var j=0; j<list.length; j++){
      for(var k=0; k<list[j].list.tag.length; k++){
        if(list[j].list.tag[k].indexOf(tag) !== -1){
            result[index++] = list[j];
          break;
        }
      }
    }
    return result;
  }

  function searchByTags(tags, list){
    var arrTags = tags.split(",");
    var result = list;
    for(var i=0; i<arrTags.length; i++){
      result = searchTag(arrTags[i], result);
    }
    return result;
  }

  function searchInstancesByDate(type, date, list){
    var result = [];
    var index = 0;
    for(var i=0; i<list.length; i++){
      var actualDate = new Date(list[i][type]);
      if(date <= actualDate){
        result[index++] = list[i];
      }
    }
    return result;
  }

  function searchInstancesByStatus(status, list){
    var result = [];
    var index = 0;
    for(var i=0; i<list.length; i++){
      if(list[i].status === status){
        result[index++] = list[i];
      }
    }
    return result;
  }

  server.get('/api/entities/list/:type', function (req, res) {

    var type = req.params.type;
    var name = req.query.nameseq === undefined ? "" : req.query.nameseq;
    var tags = req.query.tagkey === undefined ? "" : req.query.tagkey;
    var offset = parseInt(req.query.offset === undefined ? 0 : req.query.offset);
    var numResults = parseInt(req.query.numResults === undefined ? 10 : req.query.numResults);

    var paginated = {};
    paginated.entity = [];

    //if(type === "all"){
    if(type === "schedulable"){
      paginated.entity = paginated.entity.concat(mockData.entitiesList.feed.entity,
          mockData.entitiesList.process.entity);
    }else{
      paginated.entity = paginated.entity.concat(mockData.entitiesList[type].entity);
    }

    if(tags !== "" && name !== "" && name !== "*"){
      //console.log("Search by name " + name + " & tags " + tags);
      paginated.entity = searchByName(name, paginated.entity);
      paginated.entity = searchByTags(tags, paginated.entity);
      paginated.totalResults = paginated.entity.length;
      paginated.entity = paginated.entity.slice(offset, offset+numResults);
    }else if(tags !== ""){
      //console.log("Search by tags " + tags);
      paginated.entity = searchByTags(tags, paginated.entity);
      paginated.totalResults = paginated.entity.length;
      paginated.entity = paginated.entity.slice(offset, offset+numResults);
    }else if(name !== ""){
      //console.log("Search by name " + name);
      paginated.entity = searchByName(name, paginated.entity);
      paginated.totalResults = paginated.entity.length;
      paginated.entity = paginated.entity.slice(offset, offset+numResults);
    }else{
      //console.log("Search all type:"+type);
      paginated.totalResults = paginated.entity.length;
      paginated.entity = paginated.entity.slice(offset, offset+numResults);
    }
    //console.log("totalResults: " + paginated.totalResults);
    res.json(paginated);
  });

  server.get('/api/entities/definition/:type/:name', function(req, res) {
    var type = req.params.type.toUpperCase(),
      name = req.params.name;
    if (mockData.definitions[type][name]) {
      console.log(mockData.definitions[type][name]);
      res.send(200, mockData.definitions[type][name]);
    } else {
      res.send(404, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><result><status>FAILED</status><message>(' + type + ') '+ name +' not found.</message><requestId>586fffcd-10c1-4975-8dda-4b34a712f2f4</requestId></result>');
    }
  });

  server.post('/api/entities/submit/:type', function (req, res) {
    var type = req.params.type.toUpperCase(),
      text = req.text,
      name,
      tags,
      indexInArray,
      responseSuccessMessage,
      responseFailedMessage,
      initialIndexName = text.indexOf("name") + 6,
      finalIndexName = getFinalIndexOfName(),
      initialIndexTags = text.indexOf("<tags>")+6,
      finalIndexTags = text.indexOf("</tags>"),
      i;
    function getFinalIndexOfName () {
      for (i = initialIndexName; i < text.length; i++) {
        if (text[i] === '"' || text[i] === "'") {
          return i;
        }
      }
    }
    name = text.slice(initialIndexName, finalIndexName);
    tags = text.slice(initialIndexTags, finalIndexTags);
    tags = tags.split(",");
    responseSuccessMessage = {"status": "SUCCEEDED", "message": "default/successful (" + type + ") " + name + "\n\n","requestId":"default/546cbe05-2cb3-4e5c-8e7a-b1559d866c99\n"};
    responseFailedMessage = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><result><status>FAILED</status><message>(' + type + ') '+ name +' already registered with configuration store. Can\'t be submitted again. Try removing before submitting.</message><requestId>586fffcd-10c1-4975-8dda-4b34a712f2f4</requestId></result>';

    if(name.length < 3) { res.send(404, responseFailedMessage); return; }

    if (!mockData.definitions[type][name]) {
      mockData.definitions[type][name] = text;
      mockData.entitiesList[type.toLowerCase()].entity.push(
        {"type": type, "name": name, "status": "SUBMITTED", "list":{"tag":tags}}
      );
      res.send(200, responseSuccessMessage);
    } else {
      res.send(404, responseFailedMessage);
    }
  });

  server.post('/api/entities/schedule/:type/:name', function (req, res) {
    var type = req.params.type.toLowerCase(),
      name = req.params.name,
      indexInArray = mockData.findByNameInList(type, name),
      responseMessage = {
        "status": "SUCCEEDED",
        "message": "default/" + name + "(" + type + ") scheduled successfully\n",
        "requestId": "default/546cbe05-2cb3-4e5c-8e7a-b1559d866c99\n"
      };
    mockData.entitiesList[type].entity[indexInArray].status = "RUNNING";
    res.json(200, responseMessage);
  });

  server.post('/api/entities/suspend/:type/:name', function (req, res) {
    var type = req.params.type.toLowerCase(),
      name = req.params.name,
      indexInArray = mockData.findByNameInList(type, name),
      responseMessage = {
        "status": "SUCCEEDED",
        "message": "default/" + name + "(" + type + ") suspended successfully\n",
        "requestId": "default/546cbe05-2cb3-4e5c-8e7a-b1559d866c99\n"
      };
    mockData.entitiesList[type].entity[indexInArray].status = "SUSPENDED";
    res.json(200, responseMessage);
  });

  server.post('/api/entities/resume/:type/:name', function (req, res) {
    var type = req.params.type.toLowerCase(),
      name = req.params.name,
      indexInArray = mockData.findByNameInList(type, name),
      responseMessage = {
        "status": "SUCCEEDED",
        "message": "default/" + name + "(" + type + ") resumed successfully\n",
        "requestId": "default/546cbe05-2cb3-4e5c-8e7a-b1559d866c99\n"
      };
    mockData.entitiesList[type].entity[indexInArray].status = "RUNNING";
    res.json(200, responseMessage);
  });

  server.delete('/api/entities/delete/:type/:name', function (req, res) {
    var type = req.params.type,
      name = req.params.name,
      responseMessage = {
        "status": "SUCCEEDED",
        "message": "falcon/default/" + name + "(" + type + ")removed successfully (KILLED in ENGINE)\n\n",
        "requestId": "falcon/default/13015853-8e40-4923-9d32-6d01053c31c6\n\n"
      },
      indexInArray = mockData.findByNameInList(type, name);
    mockData.entitiesList[type].entity.splice(indexInArray, 1);
    res.json(200, responseMessage);
  });

  server.get('/api/instance/list/:type/:name', function(req, res) {
    var type = req.params.type.toUpperCase(),
        name = req.params.name,
        start = req.query.start === undefined ? "" : req.query.start,
        end = req.query.end === undefined ? "" : req.query.end,
        status = req.query.filterBy === undefined ? "" : req.query.filterBy.substring(7),
        numResults = parseInt(req.query.numResults === undefined ? 5 : req.query.numResults),
        offset = parseInt(req.query.offset === undefined ? 0 : req.query.offset),
        responseMessage = {
          "instances": [],
          "requestId": "falcon/default/13015853-8e40-4923-9d32-6d01053c31c6\n\n",
          "message": "default\/STATUS\n",
          "status": "SUCCEEDED"
        };

    var instances = [];
    instances = instances.concat(mockData.instancesList[type]);

    if(status !== ""){
      instances = searchInstancesByStatus(status, instances);
    }
    //if(start !== ""){
    //  start = new Date(start);
    //  instances = searchInstancesByDate("startTime", start, instances);
    //}
    //if(end !== ""){
    //  end = new Date(end);
    //  instances = searchInstancesByDate("endTime", end, instances);
    //}

    responseMessage.instances = instances;

    var paginated = responseMessage;
    paginated.instances = paginated.instances.slice(offset, offset+numResults);
    res.json(paginated);
  });

  server.post('/api/instance/suspend/:type/:name', function (req, res) {
    var type = req.params.type.toUpperCase(),
        name = req.params.name,
        start = req.query.start,
        end = req.query.end,
        indexInArray = mockData.findByStartEnd(type, start, end),
        responseMessage = {
          "status": "SUCCEEDED",
          "message": "default/" + name + "(" + type + ") start:" + start + " end: " + end + "suspended successfully\n",
          "requestId": "default/546cbe05-2cb3-4e5c-8e7a-b1559d866c99\n"
        };
    mockData.instancesList[type][indexInArray].status = "SUSPENDED";
    res.json(200, responseMessage);
  });

  server.post('/api/instance/resume/:type/:name', function (req, res) {
    var type = req.params.type.toUpperCase(),
        name = req.params.name,
        start = req.query.start,
        end = req.query.end,
        indexInArray = mockData.findByStartEnd(type, start, end),
        responseMessage = {
          "status": "SUCCEEDED",
          "message": "default/" + name + "(" + type + ") start:" + start + " end: " + end + "resumed successfully\n",
          "requestId": "default/546cbe05-2cb3-4e5c-8e7a-b1559d866c99\n"
        };
    mockData.instancesList[type][indexInArray].status = "RUNNING";
    res.json(200, responseMessage);
  });

  server.post('/api/instance/rerun/:type/:name', function (req, res) {
    var type = req.params.type.toUpperCase(),
        name = req.params.name,
        start = req.query.start,
        end = req.query.end,
        indexInArray = mockData.findByStartEnd(type, start, end),
        responseMessage = {
          "status": "SUCCEEDED",
          "message": "default/" + name + "(" + type + ") start:" + start + " end: " + end + "resumed successfully\n",
          "requestId": "default/546cbe05-2cb3-4e5c-8e7a-b1559d866c99\n"
        };
    mockData.instancesList[type][indexInArray].status = "RUNNING";
    res.json(200, responseMessage);
  });

  server.post('/api/instance/kill/:type/:name', function (req, res) {
    var type = req.params.type.toUpperCase(),
        name = req.params.name,
        start = req.query.start,
        end = req.query.end,
        indexInArray = mockData.findByStartEnd(type, start, end),
        responseMessage = {
          "status": "SUCCEEDED",
          "message": "default/" + name + "(" + type + ") start:" + start + " end: " + end + "killed successfully\n",
          "requestId": "default/546cbe05-2cb3-4e5c-8e7a-b1559d866c99\n"
        };
    mockData.instancesList[type][indexInArray].status = "KILLED";
    res.json(200, responseMessage);
  });

  server.get('/api/entities/dependencies/:type/:name', function (req, res) {
    var type = req.params.type.toUpperCase(),
        name = req.params.name;
    res.json(200, mockData.entityDependencies);
  });

  server.get('/api/metadata/lineage/vertices', function (req, res) {
    res.json(200, mockData.vertices);
  });

  server.get('/api/metadata/lineage/vertices/:id/:direction', function (req, res) {
    var id = req.params.id,
        direction = req.params.direction,
        response = "";
    if(id === "40108" && direction === "bothE"){
      response = mockData.verticesDirection[0];
    }else if(id === "40108" && direction === "both"){
      response = mockData.verticesDirection[1];
    }else if(id === "40012" && direction === "bothE"){
      response = mockData.verticesDirection[2];
    }else if(id === "40016" && direction === "bothE"){
      response = mockData.verticesDirection[3];
    }
    res.json(200, response);
  });

  server.get('/api/metadata/lineage/properties/:id', function (req, res) {
    var type = req.params.id;
    res.json(200, mockData.verticesProps);
  });


  /*server.post('/api/entities/prepareAndSubmitRecipe', function (req, res) {
    var file = req.text,
      responseMessage = {
        "requestId": "default\/d72a41f7-6420-487b-8199-62d66e492e35\n",
        "message": "default\/Submit successful (recipe)\n",
        "status": "SUCCEEDED"
      };
    console.log(file);
    res.json(200, responseMessage);
  });*/
  /*
   *
   * CHART
   *
   */

  server.get('/api/instance/summary/:type/:mode', function(req, res) {

    var type = req.params.type,
        mode = req.params.mode,
        from = req.query.start,
        fromDate = new Date(from.slice(0,4), (from.slice(5,7)-1), from.slice(8,10), 0, 0, 0),
        response,
        selectedArray;

    if (mode === 'hourly') {
      response = {"summary": [],"requestId":"23c44f3f-f528-4a94-bc0e-f95019729b42","message":"date not found","status":"FAILED"}
      chartData[type + 'Hours'].forEach(function (item) {
        item.summary.forEach(function (date) {
          var currentDate = new Date(
            date.startTime.slice(0,4),
            (date.startTime.slice(5,7) - 1),
            date.startTime.slice(8,10), 0, 0, 0
          );
          if (fromDate >= currentDate && fromDate <= currentDate) {
            response = item;
            return;
          }

        });
      });
      if (response.status === 'SUCCEEDED') {
        res.send(200, response);
      } else {
        res.send(404, response);
      }
    } else if (mode === 'daily') {
      response = {"summary": [],"requestId":"23c44f3f-f528-4a94-bc0e-f95019729b42","message":"date range not found","status":"FAILED"}

      chartData[type + 'Days'].forEach(function (item) {
        item.summary.forEach(function (date, index) {
          var currentDate = new Date(
            date.startTime.slice(0,4),
            (date.startTime.slice(5,7) - 1),
            date.startTime.slice(8,10), 0, 0, 0
          );

          if (fromDate >= currentDate && fromDate <= currentDate) {
            if (index + 14 < item.summary.length) {
              selectedArray = item.summary.slice(index, (index + 14));
              response = {"summary": selectedArray,"requestId":"23c44f3f-f528-4a94-bc0e-f95019729b42","message":"default\\/STATUS\\n","status":"SUCCEEDED"};
              return;
            }
          }

        });
      });

      if (response.status === 'SUCCEEDED') {
        res.send(200, response);
      } else {
        res.send(404, response);
      }

    } else {
      console.log('error');
    }

  });

  server.get('/api/entities/top/:entityType', function(req, res) {
    var type = req.params.entityType,
        start = req.query.start,
        end = req.query.end,
        from = new Date(start.slice(0,4), (start.slice(5,7)-1), start.slice(8,10), 0, 0, 0),
        to = new Date(end.slice(0,4), (end.slice(5,7)-1), end.slice(8,10), 0, 0, 0),
        objectToGive = Math.floor(Math.random() * 2),
        response;

    response = chartData.topEntities[objectToGive];

    chartData.topEntities.forEach(function (item) {
      //console.log(item);
    });

    if (response.status === 'SUCCEEDED') {
      res.send(200, response);
    } else {
      res.send(404, response);
    }

  });

  server.listen(PORT, function () {
    console.log('Dev server listening on port ' + PORT);
  });

}());
