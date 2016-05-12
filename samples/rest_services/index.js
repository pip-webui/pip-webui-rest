/* global angular */

(function () {
    'use strict';

    var content = [
        { title: 'Authentication', state: 'auth', url: '/auth', controller: 'AuthController', templateUrl: 'auth.html' },
        { title: 'Rest', state: 'rest', url: '/rest', controller: 'RestController', templateUrl: 'rest.html' },
        { title: 'Session', state: 'session', url: '/session', controller: 'SessionController', templateUrl: 'session.html' },
        { title: 'Cache', state: 'cache', url: '/cache', controller: 'CacheController', templateUrl: 'cache.html' }
    ];

    var thisModule = angular.module('appRestServices', 
        [
            // 3rd Party Modules
            'ui.router', 'ui.utils', 'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
            'ngMaterial', 'wu.masonry', 'LocalStorageModule', 'angularFileUpload', 'ngAnimate', 
			'pipCore', 'pipRest', 'pipData', 'pipSessionCache',
            'pipWebuiTests',
            // Sample Application Modules
            'appRestServices.Rest',  'appRestServices.Session',  'appRestServices.Auth',  'appRestServices.Cache'

        ]
    );

    thisModule.config(function (pipTranslateProvider, $stateProvider, $urlRouterProvider) {

            // String translations
            pipTranslateProvider.translations('en', {
                'APPLICATION_TITLE': 'WebUI Sampler',

                'blue': 'Blue Theme',
                'green': 'Green Theme',
                'pink': 'Pink Theme',
                'grey': 'Grey Theme'
            });

            pipTranslateProvider.translations('ru', {
                'APPLICATION_TITLE': 'WebUI Демонстратор',

                'blue': 'Голубая тема',
                'green': 'Зеленая тема',
                'pink': 'Розовая тема',
                'grey': 'Серая тема'
            });

            for (var i = 0; i < content.length; i++) {
                var contentItem = content[i];
                $stateProvider.state(contentItem.state, contentItem);
            }
                
            $urlRouterProvider.otherwise('/translate');
        } 
    );

    thisModule.controller('AppController', 
        function ($scope, $rootScope, $state, $mdSidenav, pipTranslate, pipSession, pipRest, pipTestAccount) {
            $scope.languages = ['en', 'ru'];
            $scope.themes = ['blue', 'green', 'pink', 'grey'];

            $scope.serverUrl = pipTestAccount.getServerUrl();
            $scope.sampleAccount = pipTestAccount.getSamplerAccount();

            $scope.selected = {
                theme: 'blue',
                tab: 0  
            };

            $scope.content = content;
            $scope.menuOpened = false;

            $scope.onLanguageClick = onLanguageClick;
            $scope.onThemeClick = onThemeClick;
            $scope.onSwitchPage = onSwitchPage;
            $scope.onToggleMenu = onToggleMenu;
            $scope.isActiveState = isActiveState;


                // Update page after language changed
            $rootScope.$on('languageChanged', function(event) {
                console.log('Reloading...');
                console.log($state.current);
                console.log($state.params);

                $state.reload();
            });

            // Update page after theme changed
            $rootScope.$on('themeChanged', function(event) {
                $state.reload();
            });

            // Connect to server
            openConnection();

            return;

            function onLanguageClick(language) {
                pipTranslate.use(language);
            };

            function onThemeClick(theme) {
                $rootScope.$theme = theme;
            };

            function onSwitchPage(state) {
                $mdSidenav('left').close();
                $state.go(state);
            };
            
            function onToggleMenu() {
                $mdSidenav('left').toggle();
            };
                        
            function isActiveState(state) {
                return $state.current.name == state;  
            };

            function openConnection() {
                pipSession.signin(
                    {
                        serverUrl: $scope.serverUrl,
                        email: $scope.sampleAccount.email,
                        password: $scope.sampleAccount.password
                    },
                    function(user) {
                       // pipToasts.showNotification('Signed in as ' + user.name, ['ok'])
                    },
                    function(err) {
                        console.error(err);
                        
                        if (err && err.status == 400
                            && err.data && err.data.code == 1106) {
                            
                            pipRest.signup($scope.serverUrl).call(
                                {
                                    name: $scope.sampleAccount.name,
                                    email: $scope.sampleAccount.email,
                                    password: $scope.sampleAccount.password,
                                    language: $scope.sampleAccount.language
                                },
                                function (user) {
                                    pipSession.open($scope.serverUrl, user, false);
                                  //  pipToasts.showNotification('Signed up as ' + user.name, ['ok'])
                                },
                                function (error) {
                                   // pipToasts.showError('Failed to signed in');
                                }
                            );
                        } else {
                           // pipToasts.showError('Failed to signed in');
                        }
                    }
                );
            };

        }
    );

})();
