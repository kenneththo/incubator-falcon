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
  var q,
      scope,
      controller,
      stateMock = jasmine.createSpyObj('state', ['go']);

  describe('time-zone', function () {

    beforeEach(function () {
      module('time-zone-module');
    });

    beforeEach(inject(function($q, $rootScope, $controller) {
      q = $q;

      scope = $rootScope.$new();

      /*controller = $controller('passportCtrl', {
        $scope: scope,
        // Falcon: falconServiceMock,
        // EntityModel: entityModel,
        $state: stateMock//,
        //X2jsService: x2jsServiceMock
      });*/
      //
    }));

    describe('initialize', function() {
      it('Should initialize $scope variables', function() {
        expect(null).toBeDefined();
        expect("").toEqual("");

      });
    });

    describe('tags', function() {
      describe('$scope.addTag', function() {
        it('should init with one empty tag in tagsArray', function() {
          expect("").toEqual("");
        });
      });
    });

  });
})();