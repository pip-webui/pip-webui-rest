/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appRestServices.Entry', []);

    thisModule.controller('EntryController',
        function($scope, pipRest) {

            $scope.processing = false;

        }
    );

})();
