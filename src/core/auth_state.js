/**
 * @file Application secure router
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global angular */
 
(function () {
    'use strict';
    
    var thisModule = angular.module('pipRest.State', ['pipState', 'pipRest.Session', 'pipRest.Access', 'pipSessionCache']);

    thisModule.config(
        function($locationProvider, $httpProvider) {
            // Attach interceptor to react on unauthorized errors
            $httpProvider.interceptors.push('pipAuthHttpResponseInterceptor');
        }
    );

    thisModule.run(
        function($rootScope, pipState, pipSession, pipAuthState) {

            // Intercept routes
            $rootScope.$on('$stateChangeStart', stateChangeStart);
            // Process unauthorized access error
            $rootScope.$on('pipUnauthorizedRedirect', unauthorizedRedirect);
            // Handle other errors
            $rootScope.$on('pipMaintenanceError', maintenanceError);
            $rootScope.$on('pipNoConnectionError', noConnectionError);
            $rootScope.$on('pipMissingRouteError', missingRouteError);
            $rootScope.$on('pipUnknownError', unknownError);

            function stateChangeStart(event, toState, toParams, fromState, fromParams) {
                // Implement redirect mechanism
                if (pipAuthState.redirect(event, toState, toParams, $rootScope)) {
                    return;
                }

                // todo apply in all tool
                // If user is not authorized then switch to signin
                if ((toState.auth  || toState.auth === undefined) && !pipSession.opened()) {
                    event.preventDefault();

                    var redirectTo = pipState.href(toState.name, toParams);

                    // Remove hashtag
                    if (redirectTo.length > 0 && redirectTo[0] == '#') {
                        redirectTo = redirectTo.substring(1);
                    }

                    pipAuthState.goToSignin({ redirect_to: redirectTo, toState: toState, toParams: toParams});

                    return;
                }

                // Signout and move to unauthorized page
                if (toState.name == pipAuthState.signoutState()) {
                    event.preventDefault();
                    pipSession.signout();
                    pipAuthState.goToUnauthorized({});
                    return;
                }

                // Move user to authorized page
                if (toState.name == pipAuthState.unauthorizedState()
                    && pipSession.opened()) {

                    event.preventDefault();
                    pipAuthState.goToAuthorized({});
                    return;
                }
            }

            function unauthorizedRedirect(event, params) {
                pipSession.close();
                pipAuthState.goToSignin(params);
            }

            function maintenanceError(event, params) {
                pipAuthState.goToErrors('errors_maintenance', params);
            }

            function noConnectionError(event, params) {
                pipAuthState.goToErrors('errors_no_connection', params);
            }

            function missingRouteError(event, params) {
                pipAuthState.goToErrors('errors_missing_route', params);
            }

            function unknownError(event, params) {
                pipAuthState.goToErrors('errors_unknown', params);
            }

        }
    );

    thisModule.factory('pipAuthHttpResponseInterceptor',
        function ($q, $location, $rootScope) {
            return {
                response: function (response) {
                    // When server sends Non-authenticated response
                    if (response.status === 401) {
                        console.error("Response 401");
                    }                    
                    return response || $q.when(response);
                },
                
                responseError: function (rejection) {


                    var toState = $rootScope.$state && $rootScope.$state.name ? $rootScope.$state.name : null,
                        toParams = $rootScope.$state && $rootScope.$state.params ? $rootScope.$state.params : null;
                    // When server sends Non-authenticated response
                    switch (rejection.status) {
                        case 401:
                        case 440:
                            console.error("Response Error 401", rejection);
                            // Redirect to unauthorized state
                            $rootScope.$emit('pipUnauthorizedRedirect', {
                                redirect_to:  toState && toParams && toParams.redirect_to ? '': $location.url(),
                                toState: toState,
                                toParams: toParams
                            });

                            break;
                        case 503:
                             //available (maintenance)
                            $rootScope.$emit('pipMaintenanceError', {
                                error: rejection
                            });

                            console.error("errors_maintenance", rejection);
                            break;
                        case -1:
                            //$rootScope.$emit('pipNoConnectionError', {
                            //    error: rejection
                            //});

                            console.error("errors_no_connection", rejection);
                            break;
                        default:
                            // unhandled error (internal)
                            //var code = rejection.code || (rejection.data || {}).code || null;
                            //
                            //// if not our server error generate errorEvent
                            //if (!code) {
                            //    $rootScope.$emit('pipUnknownError', {
                            //        error: rejection
                            //    });
                            //}

                            console.error("errors_unknown", rejection);
                            break;
                    }

                    return $q.reject(rejection);
                }
            }
        }
    );

    thisModule.provider('pipAuthState', function(pipStateProvider) {
        // Configuration of redirected states
        userResolver.$inject = ['pipSessionCache'];
        partyResolver.$inject = ['pipSessionCache', '$stateParams'];
        connectionResolver.$inject = ['pipSessionCache', '$stateParams'];
        settingsResolver.$inject = ['pipSessionCache'];
        var 
            signinState = null,
            signoutState = null,
            authorizedState = '/',
            unauthorizedState = '/';

        this.signinState = setSigninState;
        this.signoutState = setSignoutState;
        this.authorizedState = setAuthorizedState;
        this.unauthorizedState = setUnauthorizedState;

        this.redirect = pipStateProvider.redirect;
        this.state = stateOverride;

        this.$get = function (pipState) {            
            pipState.signinState = function() { return signinState; };
            pipState.signoutState = function() { return signoutState; };
            pipState.authorizedState = function() { return authorizedState; };            
            pipState.unauthorizedState = function() { return unauthorizedState; };
            
            pipState.goToErrors = function(toState, params) {
                if (toState == null)
                    throw new Error('Error state was not defined');

                pipState.go(toState, params);
            };

            pipState.goToSignin = function(params) {
                if (signinState == null)
                    throw new Error('Signin state was not defined');

                pipState.go(signinState, params);
            };

            pipState.goToSignout = function(params) {
                if (signoutState == null)
                    throw new Error('Signout state was not defined');
                    
                pipState.go(signoutState, params);  
            };

            pipState.goToAuthorized = function(params) {
                if (authorizedState == null)
                    throw new Error('Authorized state was not defined');
                                        
                pipState.go(authorizedState, params);
            };

            pipState.goToUnauthorized = function(params) {
                if (unauthorizedState == null)
                    throw new Error('Unauthorized state was not defined');
                    
                pipState.go(unauthorizedState, params);  
            };

            return pipState;
        };

        return;        
        //--------------------------------

        function setSigninState(newSigninState) {
            if (newSigninState)
                signinState = newSigninState;
            return signinState;
        }

        function setSignoutState(newSignoutState) {
            if (newSignoutState)
                signoutState = newSignoutState;
            return signoutState;
        }

        function setAuthorizedState(newAuthorizedState) {
            if (newAuthorizedState)
                authorizedState = newAuthorizedState;
            return authorizedState;
        }

        function setUnauthorizedState(newUnauthorizedState) {
            if (newUnauthorizedState)
                unauthorizedState = newUnauthorizedState;
            return unauthorizedState;
        }

        // Overriding state configuration in ui-router to add auth resolves
        function stateOverride(stateName, stateConfig) {
            if (stateName == null)
                throw new Error('stateName cannot be null');
            if (stateConfig == null)
                throw new Error('stateConfig cannot be null');

            // todo apply in all tool
            if (stateConfig.auth || stateConfig.authenticate) {
                stateConfig.resolve = stateConfig.resolve || {};

                stateConfig.resolve.user = /* @ngInject */ userResolver;
                stateConfig.resolve.party = /* @ngInject */ partyResolver;
                stateConfig.resolve.connection = /* @ngInject */ connectionResolver;
                stateConfig.resolve.setting = /* @ngInject */ settingsResolver;
            }    

            pipStateProvider.state(stateName, stateConfig);

            return this;
        }

        function userResolver(pipSessionCache) {
            return pipSessionCache.readUser();
        }

        function partyResolver(pipSessionCache, $stateParams) {
            return pipSessionCache.readParty($stateParams);
        }

        function connectionResolver(pipSessionCache, $stateParams) {
            return pipSessionCache.readConnection($stateParams);
        }

        function settingsResolver(pipSessionCache) {
            return pipSessionCache.readSettings();
        }

    });

})();