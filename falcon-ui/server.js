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

  server.get('/api/entities/list/:type', function (req, res) {
    var type = req.params.type;
    var offset = parseInt(req.query.offset === undefined ? 0 : req.query.offset);
    var numResults = parseInt(req.query.numResults === undefined ? 10 : req.query.numResults);
    var paginated = mockData.entitiesList[type];
    paginated.entity = paginated.entity.slice(offset, offset+numResults);
    res.json(paginated);
  });

  server.get('/api/entities/definition/:type/:name', function(req, res) {
    var type = req.params.type.toUpperCase(),
      name = req.params.name;
    if (mockData.definitions[type][name]) {
      res.send(200, mockData.definitions[type][name]);
    } else {
      res.send(404, "not found");
    }
  });

  server.post('/api/entities/submit/:type', function (req, res) {
    var type = req.params.type.toUpperCase(),
      text = req.text,
      name,
      indexInArray,
      responseSuccessMessage,
      responseFailedMessage,
      initialIndex = text.indexOf("name") + 6,
      finalIndex = getFinalIndexOfName(),
      i;
    function getFinalIndexOfName () {
      for (i = initialIndex; i < text.length; i++) {
        if (text[i] === '"' || text[i] === "'") {
          return i;
        }
      }
    }
    name = text.slice(initialIndex, finalIndex);
    responseSuccessMessage = {"status": "SUCCEEDED", "message": "default/successful (" + type + ") " + name + "\n\n","requestId":"default/546cbe05-2cb3-4e5c-8e7a-b1559d866c99\n"};
    responseFailedMessage = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><result><status>FAILED</status><message>(' + type + ') '+ name +' already registered with configuration store. Can\'t be submitted again. Try removing before submitting.</message><requestId>586fffcd-10c1-4975-8dda-4b34a712f2f4</requestId></result>';

    if(name.length < 3) { res.send(404, responseFailedMessage); return; }

    if (!mockData.definitions[type][name]) {
      mockData.definitions[type][name] = text;
      mockData.entitiesList[type.toLowerCase()].entity.push(
        {"type": type, "name": name, "status": "SUBMITTED"}
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
        responseMessage = {
          "instances": mockData.instancesList[type],
          "requestId": "falcon/default/13015853-8e40-4923-9d32-6d01053c31c6\n\n",
          "message": "default\/STATUS\n",
          "status": "SUCCEEDED"
        };
    res.json(responseMessage);
  });




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

    }
    else {
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

    console.log(objectToGive);

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
