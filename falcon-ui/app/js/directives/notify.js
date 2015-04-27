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
//(function () {
//  'use strict';
//
//  var module = angular.module('cgNotify', ['app.services.falcon', 'app.services.validation']);
//
//  module.factory('notify', [ "$timeout", function ($timeout) {
//
//    var notify = function(notification){
//
//      switch (notification.type){
//        case "success": {
//          $.notify({
//            // options
//            icon: 'glyphicon glyphicon glyphicon-ok',
//            message: notification.message
//          },{
//            // settings
//            type: 'success',
//            mouse_over: 'pause',
//            animate: {
//              enter: 'animated fadeInDown',
//              exit: 'animated fadeOutDown'
//            }
//          });
//          break;
//        } case "error": {
//          $.notify({
//            // options
//            icon: 'glyphicon glyphicon-warning-sign',
//            message: notification.message
//          },{
//            // settings
//            type: 'danger',
//            mouse_over: 'pause',
//            animate: {
//              enter: 'animated fadeInDown',
//              exit: 'animated fadeOutDown'
//            }
//          });
//          break;
//        } case "cancel": {
//          $.notify({
//            // options
//            icon: 'glyphicon glyphicon-warning-sign',
//            message: notification.message
//          },{
//            // settings
//            newest_on_top: true,
//            type: 'warning',
//            mouse_over: 'pause',
//            animate: {
//              enter: 'animated fadeInDown',
//              exit: 'animated fadeOutDown'
//            }
//          });
//          break;
//        } case "warning": default: {
//          $.notify({
//            // options
//            icon: 'glyphicon glyphicon-warning-sign',
//            message: notification.message
//          },{
//            // settings
//            type: 'warning',
//            mouse_over: 'pause',
//            animate: {
//              enter: 'animated fadeInDown',
//              exit: 'animated fadeOutDown'
//            }
//          });
//          break;
//        }
//
//      }
//
//    };
//
//    return notify;
//
//  }]);
//
//}());

(function () {
  'use strict';

  angular.module('cgNotify', []).factory('notify',['$timeout','$http','$compile','$templateCache','$rootScope', "$state",
    function($timeout,$http,$compile,$templateCache,$rootScope,$state){

      var startTop = 10;
      var verticalSpacing = 15;
      var defaultDuration = 5000;
      var defaultTemplateUrl = 'angular-notify.html';
      var position = 'center';
      var container = document.body;
      var maximumOpen = 0;

      var messageElements = [];
      var openNotificationsScope = [];

      var notify = function(args){

        if (typeof args !== 'object'){
          args = {message:args};
        }

        args.duration = args.duration ? args.duration : defaultDuration;
        args.templateUrl = args.templateUrl ? args.templateUrl : defaultTemplateUrl;
        args.container = args.container ? args.container : container;
        args.classes = args.classes ? args.classes : '';

        var scope = args.scope ? args.scope.$new() : $rootScope.$new();
        scope.$position = args.position ? args.position : position;

        scope.$message = args.message;
        scope.$state = args.state;
        scope.$type = args.type;
        scope.$messageTemplate = args.messageTemplate;

        switch (args.type){
          case "success":{
            scope.$icon = "glyphicon-ok"
            scope.$classes = "alert alert-success";
            break;
          } case "error":{
            scope.$icon = "glyphicon-warning-sign"
            scope.$classes = "alert alert-danger";
            break;
          } case "cancel": case "warning": default:{
            scope.$icon = "glyphicon-warning-sign"
            scope.$classes = "alert alert-warning";
            break;
          }
        }

        if (maximumOpen > 0) {
          var numToClose = (openNotificationsScope.length + 1) - maximumOpen;
          for (var i = 0; i < numToClose; i++) {
            openNotificationsScope[i].$close();
          }
        }

        $http.get(args.templateUrl,{cache: $templateCache}).success(function(template){

          var templateElement = $compile(template)(scope);
          templateElement.bind('webkitTransitionEnd oTransitionEnd otransitionend transitionend msTransitionEnd', function(e){
            if (e.propertyName === 'opacity' || e.currentTarget.style.opacity === 0 ||
                (e.originalEvent && e.originalEvent.propertyName === 'opacity')){

              templateElement.remove();
              messageElements.splice(messageElements.indexOf(templateElement),1);
              openNotificationsScope.splice(openNotificationsScope.indexOf(scope),1);
              layoutMessages();
            }
          });

          if (args.messageTemplate){
            var messageTemplateElement;
            for (var i = 0; i < templateElement.children().length; i ++){
              if (angular.element(templateElement.children()[i]).hasClass('cg-notify-message-template')){
                messageTemplateElement = angular.element(templateElement.children()[i]);
                break;
              }
            }
            if (messageTemplateElement){
              messageTemplateElement.append($compile(args.messageTemplate)(scope));
            } else {
              throw new Error('cgNotify could not find the .cg-notify-message-template element in '+args.templateUrl+'.');
            }
          }

          angular.element(args.container).append(templateElement);
          messageElements.push(templateElement);

          if (scope.$position === 'center'){
            $timeout(function(){
              scope.$centerMargin = '-' + (templateElement[0].offsetWidth /2) + 'px';
            });
          }

          scope.$close = function(){
            templateElement.css('opacity',0).attr('data-closing','true');
            layoutMessages();
          };

          scope.restore = function () {
            //console.log(status);
            $state.go(scope.$state);
            //$scope.closeAlert(index);
          };

          var layoutMessages = function(){
            var j = 0;
            var currentY = startTop;
            for(var i = messageElements.length - 1; i >= 0; i --){
              var shadowHeight = 10;
              var element = messageElements[i];
              var height = element[0].offsetHeight;
              var top = currentY + height + shadowHeight;
              if (element.attr('data-closing')){
                top += 20;
              } else {
                currentY += height + verticalSpacing;
              }
              element.css('top',top + 'px').css('margin-top','-' + (height+shadowHeight) + 'px').css('visibility','visible');
              j ++;
            }
          };

          $timeout(function(){
            layoutMessages();
          });

          if (args.duration > 0){
            $timeout(function(){
              scope.$close();
            },args.duration);
          }

        }).error(function(data){
          throw new Error('Template specified for cgNotify ('+args.templateUrl+') could not be loaded. ' + data);
        });

        var retVal = {};

        retVal.close = function(){
          if (scope.$close){
            scope.$close();
          }
        };

        Object.defineProperty(retVal,'message',{
          get: function(){
            return scope.$message;
          },
          set: function(val){
            scope.$message = val;
          }
        });

        openNotificationsScope.push(scope);

        return retVal;

      };

      notify.config = function(args){
        startTop = !angular.isUndefined(args.startTop) ? args.startTop : startTop;
        verticalSpacing = !angular.isUndefined(args.verticalSpacing) ? args.verticalSpacing : verticalSpacing;
        defaultDuration = !angular.isUndefined(args.duration) ? args.duration : defaultDuration;
        defaultTemplateUrl = args.templateUrl ? args.templateUrl : defaultTemplateUrl;
        position = !angular.isUndefined(args.position) ? args.position : position;
        container = args.container ? args.container : container;
        maximumOpen = args.maximumOpen ? args.maximumOpen : maximumOpen;
      };

      notify.closeAll = function(){
        for(var i = messageElements.length - 1; i >= 0; i --){
          var element = messageElements[i];
          element.css('opacity',0);
        }
      };

      return notify;
    }
  ]);

  angular.module('cgNotify').run(['$templateCache', function($templateCache) {
    'use strict';

    $templateCache.put('angular-notify.html',
        "<div class=\"cg-notify-message\" ng-class=\"[$classes, \n" +
        "    $position === 'center' ? 'cg-notify-message-center' : '',\n" +
        "    $position === 'left' ? 'cg-notify-message-left' : '',\n" +
        "    $position === 'right' ? 'cg-notify-message-right' : '']\"\n" +
        "    ng-style=\"{'margin-left': $centerMargin}\">\n" +
        "\n" +
        "    <div ng-show=\"!$messageTemplate\" class=\"row\">\n" +
        "      <div class=\"col-md-2\">\n" +
        "        <span class=\"glyphicon glyphicon-info-sign\"></span>\n" +
        "      </div>\n" +
        "      <div class=\"col-md-22\">\n" +
        "        {{ $message }} \n" +
        "        <a ng-if=\"$type == 'cancel'\" ng-click=\"restore()\">UNDO</a> \n" +
        "      </div>\n" +
        "    </div>\n" +
        "\n" +
        "    <div ng-show=\"$messageTemplate\" class=\"cg-notify-message-template\">\n" +
        "        \n" +
        "    </div>\n" +
        "\n" +
        "    <button type=\"button\" class=\"cg-notify-close\" ng-click=\"$close()\">\n" +
        "        <span aria-hidden=\"true\">&times;</span>\n" +
        "        <span class=\"cg-notify-sr-only\">Close</span>\n" +
        "    </button>\n" +
        "\n" +
        "</div>"
    );

  }]);

}());