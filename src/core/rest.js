/**
 * @file PipServices Rest API
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo:
 * - Separate application and administrative APIs
 */

(function () {
    'use strict';

    var thisModule = angular.module('pipRest', [
        'ngResource',
        'pipRest.Enums', 'pipRest.Access',
        'pipRest.Session', 'pipRest.State'
    ]);

    thisModule.provider('pipRest', function ($httpProvider) {
        var serverUrl = '';
        var serverUrlFixed = false;
        var api = [];
        this.addApi = addApi;

        function addApi(extension) {
            for (var request in extension) {
                api[request] = extension[request];
            }
        };

        // Set default API version
        //$httpProvider.defaults.headers.common['api-version'] = '1.0';

        this.version = function (newVersion) {
            if (newVersion)
                $httpProvider.defaults.headers.common['api-version'] = newVersion;
            return $httpProvider.defaults.headers.common['api-version'];
        };

        this.serverUrlFixed = function (value) {
            if (value === true || value === 'on')
                serverUrlFixed = value;
            return serverUrlFixed;
        };

        this.serverUrl = function (newServerUrl) {
            if (newServerUrl)
                serverUrl = newServerUrl;
            return newServerUrl;
        };

        this.$get = function ($rootScope, $http, $resource, $stateParams) {

            function createResource(url, path, paramDefaults, actions) {
                url = url || serverUrl;
                return $resource(url + path, paramDefaults, actions);
            };

            function createOperation(url, path) {
                url = url || serverUrl;
                return $resource(url + path, {},
                    {
                        call: {method: 'POST'}
                    }
                );
            };

            function createCollection(url, path, paramDefaults) {
                url = url || serverUrl;
                return $resource(url + path,
                    paramDefaults || {id: '@id'},
                    {
                        update: {method: 'PUT'}
                    }
                );
            };

            function createPagedCollection(url, path, paramDefaults) {
                url = url || serverUrl;
                return $resource(url + path,
                    paramDefaults || {id: '@id'},
                    {
                        page: {method: 'GET', isArray: false},
                        update: {method: 'PUT'}
                    }
                );
            };

            function createPartyCollection(url, path, paramDefaults) {
                return createPagedCollection(url, path, paramDefaults ||
                    {
                        id: '@id',
                        party_id: '@party_id'
                    }
                );
            };

            var restApi = {
                
                version: function (newVersion) {
                    if (newVersion)
                        $httpProvider.defaults.headers.common['api-version'] = newVersion;
                    return $httpProvider.defaults.headers.common['api-version'];
                },

                serverUrl: function (newServerUrl) {
                    if (newServerUrl) {
                        serverUrl = newServerUrl;
                    }
                    return serverUrl;
                },

                userId: function () {
                    return $http.defaults.headers.common['user-id'];
                },

                serverUrlFixed: function () {
                    return serverUrlFixed;
                },

                sessionId: function () {
                    return $http.defaults.headers.common['session-id'];
                },

                // Used in routing
                partyId: function () {
                    if($stateParams) {
                        return $stateParams.party_id || $http.defaults.headers.common['user-id'];
                    }
                    else {
                        return $http.defaults.headers.common['user-id'];
                    }                    
                },

                about: function (url) {
                    return createResource(url, '/api/about');
                },

                session: function (userId, sessionId) {
                    $http.defaults.headers.common['session-id'] = sessionId;
                    $http.defaults.headers.common['user-id'] = userId;
                },

                signin: function (url) {
                    return createOperation(url, '/api/signin');
                },

                signout: function (url) {
                    return createOperation(url, '/api/signout');
                },

                signup: function (url) {
                    return createOperation(url, '/api/signup');
                },

                recoverPassword: function (url) {
                    return createOperation(url, '/api/recover_password');
                },

                resetPassword: function (url) {
                    return createOperation(url, '/api/reset_password');
                },

                changePassword: function (url) {
                    return createOperation(url, '/api/change_password');
                },

                requestEmailVerification: function (url) {
                    return createCollection(url, '/api/users/:party_id/resend_email_verification');
                },

                verifyEmail: function (url) {
                    return createOperation(url, '/api/verify_email');
                },

                signupValidate: function (url) {
                    return createOperation(url, '/api/signup_validate');
                },

                users: function (url) {
                    return createPagedCollection(url, '/api/users/:id');
                },

                currentUser: function (url) {
                    return createResource(url, '/api/users/current',
                        {},
                        {
                            get: {method: 'GET', isArray: false}
                        }
                    );
                },

                userSessions: function (url) {
                    return createPartyCollection(url, '/api/users/:party_id/sessions/:id');
                },

                parties: function (url) {
                    return createPagedCollection(url, '/api/parties/:id');
                },

                partySettings: function (url) {
                    return createPartyCollection(url, '/api/parties/:party_id/settings');
                },

                serverActivities: function (url) {
                    return createPagedCollection(url, '/api/servers/activities/:id');
                },

                guides: function (url) {
                    return createPagedCollection(url, '/api/guides/:id');
                },

                tips: function (url) {
                    return createPagedCollection(url, '/api/tips/:id');
                },

                image_sets: function (url) {
                    return createPagedCollection(url, '/api/image_sets/:id');
                },

                images: function (url) {
                    return createPagedCollection(url, '/api/images/search');
                },

                feedbacks: function (url) {
                    return createPartyCollection(url, '/api/feedbacks/:id');
                },

                announces: function (url) {
                    return createPagedCollection(url, '/api/announcements/:id');
                },

                // for testing
                //--------------

                createResource: createResource,
                createOperation: createOperation,
                createCollection: createCollection,
                createPagedCollection: createPagedCollection,
                createPartyCollection: createPartyCollection

            };

            function addApi() {
                for (var call in api) {
                    restApi[call] = api[call];
                }
            };

            addApi();


            return restApi;
        };
    });

})();
