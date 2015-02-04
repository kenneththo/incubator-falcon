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

  var module = angular.module('validation-module', []);

  module.factory('ValidationSvc', ["$window", function ($window) {
    var checkMessages = {
        name: {
          patternInvalid: "The name has an invalid format.",
          unavailable: "The name you choosed is not available",
          empty: "You need to specify a name"
        },
        url: {
          empty: "You need to provide a URL",
          patternInvalid: "The URL has an invalid format. "
        },
        description: {
          empty: "You need to provide a description",
          patternInvalid: "The Description has an invalid format. "
        },
        path: {
          empty: "You need to provide a path",
          patternInvalid: "The Path has an invalid format. "
        },
        key: {
          empty: "You need to provide a key",
          patternInvalid: "The Key has an invalid format. "
        },
        value: {
          empty: "You need to provide a value",
          patternInvalid: "The Value has an invalid format. "
        },
        location: {
          empty: "You need to provide a  location",
          patternInvalid: "The Location has an invalid format. "
        },
        provider: {
          empty: "You need to provide a provider",
          patternInvalid: "The provider has an invalid format. "
        },
        permission: {
          empty: "You need to provide a Permission",
          patternInvalid: "The Permission has an invalid format. "
        },
        cluster: { empty: "You need to select a cluster" },

        date: {
          empty: "You need to select a start date",
          patternInvalid: "The start Date has an invalid format. "
        },
        number: {
          empty: "You need to provide a number",
          patternInvalid: "The number needs to be one or two digits "
        },
        allocationNumber: {
          empty: "You need to provide a number",
          patternInvalid: "The number you provided is invalid "
        },
        option: { empty: "You need to select an option" },
        user: {
          empty: "Please enter your user name.",
          patternInvalid: "The User has an invalid format."
        },
        password: {
          empty: "Please enter your password.",
          patternInvalid: "The Password has an invalid format."
        },
        user_password: {
          invalid: "The user/password you have entered is invalid."
        },
        email: {
          patternInvalid: "The email is invalid."
        }

      },
      checkPatterns = {
        name: new RegExp("^[a-zA-Z0-9]{1,39}$"),
        alpha: new RegExp("^([a-zA-Z0-9]){1,100}$"),
        osPath: new RegExp("^[^\\0 ]+$"),
        url: new RegExp("^[^\\0 ]+\\.[a-zA-Z0-9]{1,3}$"),
        number: new RegExp("^([0-9]){1,40}$"),
        twoDigits: new RegExp("^([0-9]){1,2}$"),
        email: new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"),
        unixPermissions: new RegExp("^((([0-7]){1,4})|(\\*))$"),
        id: new RegExp("^(([a-zA-Z]([\\-a-zA-Z0-9])*){1,39})$"),
        freeText: new RegExp("^([\\sa-zA-Z0-9]){1,40}$"),

        password: new RegExp("^(([a-zA-Z]([\\-a-zA-Z0-9])*){1,39})$"),
        

        commaSeparated: new RegExp("^[a-zA-Z0-9,]{1,80}$"),
        unixId: new RegExp("^([a-z_][a-z0-9-_\\.\\-]{0,30})$"),





        tableUri: new RegExp("^[^\\0]+$"),
        versionNumbers: new RegExp("^[0-9]{1,2}\\.[0-9]{1,2}\\.[0-9]{1,2}$"),
      };

    function acceptOnlyNumber(evt) {
      var theEvent = evt || $window.event,
        key = theEvent.keyCode || theEvent.which,
        BACKSPACE = 8,
        DEL = 46,
        ENTER = 13,
        ARROW_KEYS = {left: 37, right: 39},
        TAB = 9,
        ctrlKey = 17,
        vKey = 86,
        cKey = 67,
        regex = /[0-9]|\./;

      if (key === ctrlKey ||
          key === vKey ||
          key === cKey ||
          key === BACKSPACE ||
          key === DEL ||
          key === ARROW_KEYS.left ||
          key === ARROW_KEYS.right ||
          key === TAB || key === ENTER) {
        return true;
      }

      key = String.fromCharCode(key);

      if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) { theEvent.preventDefault(); }
      }
    }
    function acceptNoSpaces(evt) {
      var theEvent = evt || $window.event,
        key = theEvent.keyCode || theEvent.which,
        SPACE = 32;

      if (key === SPACE) {
        theEvent.returnValue = false;
        theEvent.preventDefault();
        return false;
      }
    }

    return {
      messages: checkMessages,
      patterns: checkPatterns,
      show: false,
      nameAvailable: true,
      acceptOnlyNumber: acceptOnlyNumber,
      acceptNoSpaces: acceptNoSpaces
    };

  }]);
}());





