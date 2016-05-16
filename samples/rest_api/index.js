/* global angular */

(function () {
    'use strict';

    var content = [
        { title: 'Areas', state: 'auth', url: '/areas', controller: 'AreasController', templateUrl: 'areas.html' },
        { title: 'Goals', state: 'rest', url: '/goals', controller: 'GoalsController', templateUrl: 'goals.html' },
        { title: 'Entry', state: 'entry', url: '/entry', controller: 'EntryController', templateUrl: 'entry.html' }
    ];

    var thisModule = angular.module('appRestServices',
        [
            // 3rd Party Modules
            'ui.router', 'ui.utils', 'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
            'ngMaterial', 'wu.masonry', 'LocalStorageModule', 'angularFileUpload', 'ngAnimate',
            'pipCore', 'pipRest', 'pipData', 'pipSessionCache',
            'appRestServices.Areas',  'appRestServices.Goals', 'appRestServices.Entry'
        ]
    );

    thisModule.config(function (pipTranslateProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider) {

//             $mdThemingProvider.theme('blue')
//                 .primaryPalette('blue')
//                 .accentPalette('green');
// 
//             $mdThemingProvider.theme('pink')
//                 .primaryPalette('pink')
//                 .accentPalette('orange');
// 
//             $mdThemingProvider.theme('green')
//                 .primaryPalette('green')
//                 .accentPalette('purple');
// 
//             $mdThemingProvider.theme('grey')
//                 .primaryPalette('grey')
//                 .accentPalette('yellow');
// 
//             $mdThemingProvider.setDefaultTheme('blue');

            // String translations
            pipTranslateProvider.translations('en', {
                'APPLICATION_TITLE': 'WebUI Sampler',

                'blue': 'Blue Theme',
                'green': 'Green Theme',
                'pink': 'Pink Theme',
                'grey': 'Grey Theme'
            });

            pipTranslateProvider.translations('ru', {
                'APPLICATION_TITLE': 'WebUI пример',

                'blue': 'Голубая тема',
                'green': 'Зелёная тема',
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
        function ($scope, $rootScope, $state, $mdSidenav, pipTranslate, pipSession, pipRest) {
            $scope.languages = ['en', 'ru'];
            $scope.themes = ['blue', 'green', 'pink', 'grey'];

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
            }

            function onThemeClick(theme) {
                $rootScope.$theme = theme;
            }

            function onSwitchPage(state) {
                $mdSidenav('left').close();
                $state.go(state);
            }

            function onToggleMenu() {
                $mdSidenav('left').toggle();
            }

            function isActiveState(state) {
                return $state.current.name == state;
            }

            function openConnection() {
                var
                    serverUrl = 'http://alpha.pipservices.net',
                    name = 'Sampler User',
                    email = 'sampler@digitallivingsoftware.com',
                    password = 'test123';

                pipSession.signin(
                    {
                        serverUrl: serverUrl,
                        email: email,
                        password: password
                    },
                    function(user) {
                        //pipToasts.showNotification('Signed in as ' + user.name, ['ok'])
                    },
                    function(err) {
                        console.log(err);

                        // Todo: Fix error handling on server to throw meaningful errors
                        if (err && err.status == 400
                            && err.data && err.data.code == 1106) {

                            pipRest.signup(serverUrl).call(
                                {
                                    name: name,
                                    email: email,
                                    password: password,
                                    language: 'en'
                                },
                                function (user) {
                                    pipSession.open(serverUrl, user, password, false);
                                   // pipToasts.showNotification('Signed up as ' + user.name, ['ok'])
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
            }

        }
    );

})();
