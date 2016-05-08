/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appRestServices.Auth', ['pipTranslate', 'pipRest']);

    thisModule.config(
        function(pipTranslateProvider, pipAuthStateProvider) {

            // Configure module routes
            pipAuthStateProvider
                .state('signin', {
                    url: '/signin',
                    controller: 'SigninController',
                    templateUrl: 'auth.html',
                    params: {
                        toState: '',
                        toParams: ''
                    },
                    auth: false
                })
                .state('first_page', {
                    url: '/auth/first',
                    controller: 'FirstAuthController',
                    templateUrl: 'auth.html',
                    params: {
                        name: 'name',
                        url: 'http://www.rambler.ru'
                    },
                    auth: true
                })
                .state('second_page', {
                    url: '/auth/second',
                    controller: 'SecondAuthController',
                    templateUrl: 'auth.html',
                    auth: true
                });

            // Set translation strings for the module
            pipTranslateProvider.translations('en', {

            });

            pipTranslateProvider.translations('ru', {

            });

            pipAuthStateProvider.unauthorizedState('signin');
            pipAuthStateProvider.authorizedState('auth');
            pipAuthStateProvider.signinState('signin');

        }
    );


    thisModule.controller('AuthController',
        function($scope, $rootScope, pipRest, pipSession) {

            $scope.page = "AuthController";
            $scope.processing = false;

            $scope.signOut = signOut;
            $scope.userState = pipSession.opened() ? 'SignIn': 'SignOut';

            return ;

            function signOut() {
                $scope.processing = true;

                pipSession.signout(
                    function(error) {
                        console.log(error);
                        $scope.processing = false;
                    }
                );
            };

        }
    );

    thisModule.controller('SigninController',
        function($scope, $rootScope, pipRest, pipSession, pipTestAccount, pipAuthState, $state) {

            $scope.page = "SigninController";
            $scope.processing = false;

            $scope.serverUrl = pipTestAccount.getServerUrl();
            $scope.sampleAccount = pipTestAccount.getSamplerAccount();

            $scope.processing = false;

            $scope.signIn = signIn;
            $scope.userState = pipSession.opened() ? 'SignIn': 'SignOut';

            return ;

            function signIn() {
                $scope.processing = true;

                pipSession.signin(
                    {
                        serverUrl: $scope.serverUrl,
                        email: $scope.sampleAccount.email,
                        password: $scope.sampleAccount.password
                    },
                    function(user) {
                        $scope.processing = false;
                        if (pipAuthState.params.toState) {
                            $state.go(pipAuthState.params.toState, pipAuthState.params.toParams);
                        } else {
                            // Todo: This hack shall not be here!! Remove it
                            pipAuthState.goToAuthorized();
                        }
                    },
                    function(error) {
                        console.log(error);
                        $scope.processing = false;
                    }
                );
            };



        }
    );

    thisModule.controller('FirstAuthController',
        function($scope, $state) {

            $scope.page = "FirstAuthController";
            $scope.processing = false;

            return ;

        }
    );


    thisModule.controller('SecondAuthController',
        function($scope, $state, $rootScope, pipRest, pipSession) {

            $scope.page = "SecondAuthController";
            $scope.processing = false;

            $scope.expired = expired;
            $scope.goToFirst = goToFirst;
            $scope.onGetNotes = onGetNotes;

            return ;

            function expired() {
                $scope.processing = true;
                pipSession.signout(
                    function(error) {
                        console.log(error);
                        $scope.processing = false;
                    }
                );
            };

            function goToFirst() {
                $state.go('first_page', {
                    name: 'new name',
                    url: $scope.expired
                });
            };

            function onGetNotes() {
                pipRest.notes().query(
                    {
                        party_id: pipRest.userId()
                    },
                    function(notes) {
                        $scope.processing = false;
                    },
                    function (error) {
                        console.log(error);
                        $scope.processing = false;
                    }
                );
            };

        }
    );


})();
