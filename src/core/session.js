/**
 * @file Session service for PipServices Rest API
 * @copyright Digital Living Software Corp. 2014-2016
 */

(function () {
    'use strict';

    var thisModule = angular.module('pipRest.Session', ['ngCookies', 'pipRest']);

    thisModule.run(['pipSession', function(pipSession) {
        // Reload session to avoid signin
        pipSession.reopen();
    }]);

    thisModule.factory('pipSession', 
        function ($rootScope, $http, localStorageService, $cookieStore, pipRest, pipTimer) {
            var 
                currentOperation = undefined,
                sessionId, userId, serverUrl;

            return {
                opened: opened,
                userId: getUserId,
                sessionId: getSessionId,
                serverUrl: getServerUrl,

                lastUsedEmail: lastUsedEmail,
                //lastUsedPassword: lastUsedPassword,
                usedServers: usedServers,
                usedServerUrls: usedServerUrls,

                signin: signin,
                abort: abort,
                signout: signout,

                open: open,
                close: close,
                reopen: reopen
            };
            //-----------------------

            // Session Ids
            //---------------

            function getUserId() {
                return userId;
            };

            function getSessionId() {
                return sessionId;  
            };

            function getServerUrl() {
                return serverUrl || localStorageService.get('serverUrl');
            };

            function opened() {
                var isOpened = (sessionId !== '' && sessionId !== null && sessionId !== undefined) &&
                    (userId !== '' && userId !== null && userId !== undefined) &&
                    (serverUrl !== '' && serverUrl !== null && serverUrl !== undefined);

                return isOpened;
            };

            // Saved connection settings
            //----------------------------
            
            function lastUsedEmail(serverUrl) {
                var servers = localStorageService.get('servers');
                if (servers && servers[serverUrl]) {
                    return servers[serverUrl].email;
                }
                return undefined;
            };

            function usedServers() {
                return localStorageService.get('servers') || {};
            };

            function usedServerUrls() {
                var 
                    servers = localStorageService.get('servers'),
                    serverUrls = [], serverUrl;
                        
                for (var prop in servers) {
                    if (servers.hasOwnProperty(prop)) {
                        serverUrl = servers[prop].serverUrl;
                        if (serverUrl) {
                            serverUrls.push(serverUrl);
                        }
                    }
                }

                return serverUrls;
            };

            // Session management
            //---------------------

            function signin(params, successCallback, errorCallback) {
                var 
                    serverUrl = params.serverUrl,
                    email = params.email,
                    password = params.password,
                    remember = params.remember,
                    adminOnly = !!params.adminOnly,
                    thisOperation = new Date().getTime();

                currentOperation = thisOperation;

                $http.defaults.headers.common['session-id'] = undefined;
                $http.defaults.headers.common['user-id'] = undefined;
                $http.defaults.headers.common['account-id'] = undefined;

                pipRest.signin(serverUrl).call(
                    { 
                        email: email, 
                        password: password,
                        remember: remember
                    },
                    function(user) {
                        if (currentOperation != thisOperation) {
                            return;
                        } else {
                            currentOperation = undefined;

                            if (adminOnly && !user.admin) {
                                errorCallback('ERROR_ADMIN_ONLY_ACCESS');
                            } else {
                                open(serverUrl, user, remember);
                                $rootScope.$broadcast('pipAutoPullChanges');
                                successCallback(user);
                            }
                        }
                    }, 
                    function(error) {
                        if (currentOperation != thisOperation) {
                            return;
                        } else {
                            currentOperation = undefined;
                            errorCallback(error);   
                        }
                    }
                );
            };

            function signup(params, successCallback, errorCallback) {
                var 
                    serverUrl = params.serverUrl,
                    name = params.name,
                    email = params.email,
                    password = params.password,
                    language = params.language,
                    remember = false,
                    thisOperation = new Date().getTime();

                pipRest.signup(serverUrl).call(
                    {
                        name: name,
                        email: email,
                        password: password,
                        language: language
                    },
                    function(user) {
                        if (currentOperation != thisOperation) {
                            return;
                        } else {
                            currentOperation = undefined;

                            open(serverUrl, user, remember);
                            successCallback(user);
                        }
                    }, 
                    function(error) {
                        if (currentOperation != thisOperation) {
                            return;
                        } else {
                            currentOperation = undefined;
                            errorCallback(error);   
                        }
                    }
                );
            };

            function abort() {
                currentOperation = undefined;
            };

            function signout(callback) {
                if (opened()) {
                    pipRest.signout().call({}, callback, callback);
                }

                close();
            };

            function open(currentServerUrl, user, remember) {
                sessionId = user.last_session_id;
                userId = user.id;
                serverUrl = currentServerUrl;

                // Set default headers for subsequent HTTP requests
                $http.defaults.headers.common['session-id'] = sessionId;
                $http.defaults.headers.common['user-id'] = userId;

                // Save ids into local storage
                if (remember) {
                    var servers = localStorageService.get('servers') || {};
                    servers[serverUrl] = {
                        serverUrl: serverUrl,
                        email: user.email
                    };
                    localStorageService.set('servers', servers);

                    localStorageService.set('sessionId', sessionId);
                    localStorageService.set('userId', userId);
                    localStorageService.set('serverUrl', serverUrl);
                }

                // Save into session id to retain the connection while browser is running
                // Remove from cookie store
                $cookieStore.put('user-id', userId);
                $cookieStore.put('session-id', sessionId);
                $cookieStore.put('server-url', serverUrl);

                // Save context parameters do not save
                if (!pipRest.serverUrlFixed()) pipRest.serverUrl(serverUrl);
                
                // Send broadcast
                // saveSession data
                $rootScope.$emit(
                    'pipSessionOpened', 
                    { 
                        serverUrl: serverUrl,
                        sessionId: sessionId,
                        userId: userId,
                        user: user
                    }
                );
                pipTimer.start();
            };

            function reopen() {
                userId = $cookieStore.get('user-id') || localStorageService.get('userId');
                sessionId = $cookieStore.get('session-id') || localStorageService.get('sessionId');
                serverUrl = $cookieStore.get('server-url') || localStorageService.get('serverUrl');

                // Set default headers for subsequent HTTP requests
                $http.defaults.headers.common['session-id'] = sessionId;
                $http.defaults.headers.common['user-id'] = userId;

                if (!pipRest.serverUrlFixed() || !pipRest.serverUrl()) pipRest.serverUrl(serverUrl);
                $rootScope.$serverUrl = pipRest.serverUrl();
                // Send broadcast
                $rootScope.$emit(
                    'pipSessionOpened', 
                    { 
                        serverUrl: serverUrl,
                        sessionId: sessionId,
                        userId: userId
                    }
                );

            };

            function close() {
                sessionId = undefined;
                userId = undefined;
                        
                // Unset default headers for subsequent HTTP requests
                $http.defaults.headers.common['session-id'] = undefined;
                $http.defaults.headers.common['user-id'] = undefined;

                // Remove ids into local storage
                localStorageService.remove('userId');
                localStorageService.remove('sessionId');

                // Remove from cookie store
                $cookieStore.remove('user-id');
                $cookieStore.remove('session-id');

                // RemoveToastMessages
                pipTimer.stop();

                // Send broadcast
                // RemoveToastMessages
                $rootScope.$emit('pipSessionClosed');
            };
        }
    );

})();