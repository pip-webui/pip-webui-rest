/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appRestServices.Rest', []);

    thisModule.controller('RestController',
        function ($scope, pipRest, pipTestAccount) {

            $scope.serverUrl = pipTestAccount.getServerUrl();
            $scope.sampleAccount = pipTestAccount.getSamplerAccount();

            $scope.output = '';
            $scope.processing = false;

            var writeLine = function (line) {
                    $scope.output += line + '<br/>';
                },
                processError = function (error) {
                    writeLine(angular.toJson(error, true));
                    $scope.processing = false;
                };

            $scope.onSignin = function () {
                if (!$scope.sampleAccount.email || !$scope.sampleAccount.password) {
                    return;
                }

                $scope.processing = true;

                pipRest.signin().call(
                    {
                        email: $scope.sampleAccount.email,
                        password: $scope.sampleAccount.password
                    },
                    function (user) {
                        writeLine('Connected to ' + $scope.serverUrl);

                        if (user !== null) {
                            pipRest.session(user.id, user.last_session_id);
                            writeLine('User Id: ' + user.id + ' Session Id: ' + user.last_session_id);
                        }

                        $scope.processing = false;
                    },
                    processError
                );
            };

            $scope.onSignout = function () {
                $scope.processing = true;

                var disconnected = function () {
                    writeLine('Disconnected from server');
                    $scope.processing = false;
                };

                pipRest.signout().call({}, disconnected);
            };

            $scope.onAbout = function () {
                pipRest.about($scope.serverUrl).get({},
                    function (about) {
                        writeLine(angular.toJson(about, true));
                        $scope.processing = false;
                    },
                    processError
                );
            };

            $scope.onClearOutput = function () {
                $scope.output = '';
            };
        }
    );

})();
