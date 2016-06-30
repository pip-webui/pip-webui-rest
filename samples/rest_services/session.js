/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appRestServices.Session', []);

    thisModule.controller('SessionController',
        function ($scope, $rootScope, pipRest, pipSession, pipTestAccount) {

            $scope.serverUrl = pipTestAccount.getServerUrl();
            $scope.sampleAccount = pipTestAccount.getSamplerAccount();

            $scope.processing = false;

            $scope.signIn = signIn;
            $scope.signOut = signOut;
            $scope.userState = pipSession.opened() ? 'SignIn' : 'SignOut';

            return;
            // -----------------------------------------------------------------------------------------------------

            function signIn() {
                $scope.processing = true;

                pipSession.signin(
                    {
                        serverUrl: $scope.serverUrl,
                        email: $scope.sampleAccount.email,
                        password: $scope.sampleAccount.password
                    },
                    function (user) {
                        $scope.processing = false;
                    },
                    function (/* error*/) {
                        // console.log(error);
                        $scope.processing = false;
                    }
                );
            }

            function signOut() {
                $scope.processing = true;

                pipSession.signout(
                    function (/* error*/) {
                        // console.log(error);
                        $scope.processing = false;
                    }
                );
            }
        }
    );

})();
