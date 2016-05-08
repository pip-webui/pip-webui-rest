/**
 * @file Session data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipSessionCache', ['pipCore', 'pipRest', 'pipDataCache']);

    thisModule.run(function($rootScope, pipSessionCache) {
        $rootScope.$on('pipSessionOpened', pipSessionCache.init);
        $rootScope.$on('pipSessionClosed', pipSessionCache.clear);
    });

    thisModule.service('pipSessionCache',
        function($rootScope, $stateParams, pipTranslate, pipRest, localStorageService,
            pipAccess, pipEnums, pipSession, pipDataCache) {
                        
            return {
                init: init,
                clear: clear,
                
                readUser: readUser,
				readParty: readParty,
				readConnection: readConnection,
                
                readSettings: readSettings,
                onSettingsUpdate: onSettingsUpdate
            };
            //-------------

            function init(event, data) {
                if (data == null)
                    throw new Error('Unexpected error: issues in openning session');
                
                clear();
                if (data.serverUrl) $rootScope.$serverUrl = data.serverUrl;
                storeUser(data.user, null);
            };

            function clear() {
                // Clear data cache
                pipDataCache.clear();
                
                // Clear global variables
                delete $rootScope.$user;
                delete $rootScope.$party;
                delete $rootScope.$serverUrl;
                delete $rootScope.$connection;
                delete $rootScope.$settings;
            };

            function updateUserRights(user, party) {
                // Get parameters from cache if they are not defined
                user = user || pipDataCache.retrieve('user');
                party = party || pipDataCache.retrieve('party');
                
                // Exit if user is not defined
                if (user == null) return;

                // Update user access rights
                if (party == null) 
                    user = pipAccess.asOwner(user);
                else if (user.id == party.id)
                    user = pipAccess.asOwner(user);
                else 
                    user = pipAccess.toParty(user, party);
                    
                // Save user with new rights back to cache
                pipDataCache.storePermanent('user', user);
                $rootScope.$user = user;
            };

            function storeUserTheme(user) {
                if (!user) return;
                var userTheme = user.theme || 'blue';

                if (user && $rootScope.$party) {
                    if ($rootScope.$party.id == user.id) userTheme = user.theme;
                    else userTheme = 'navy';
                }

                $rootScope.$theme = userTheme;
                localStorageService.set('theme', userTheme);
            };

            function storeUser(user) {
                if (user == null) return;                  

                pipDataCache.storePermanent('user', user);
                $rootScope.$user = user;
                storeUserTheme(user);
                
                // Activate user language
                pipTranslate.use(user.language, false, true);
                updateUserRights(user, null);
            };

            function readUser(successCallback, errorCallback) {
                // Avoid broken session
                if (!pipSession.opened()) 
                    throw new Error('User is not authenticated.');
    
                var 
                    userId = pipSession.userId(),
                    user = pipDataCache.retrieve('user');
    
                // Return user from cache    
                if (user) {
                    if (user.id != userId)
                        throw new Error('Unexpected error: issues in openning session');
                        
                    if (successCallback) successCallback(user);
                        
                    return user;
                }
    
                // Read user from server
                return pipRest.users().get(
                    { id: userId }, 
                    function (user) {
                        // Double check
                        if (user.id != userId) 
                            user == null;

                        storeUser(user);

                        if (successCallback) successCallback(use);
                    },
                    errorCallback
                ).$promise;
            };

            function readParty(stateParams, successCallback, errorCallback) {
                // Avoid broken session
                if (!pipSession.opened())
                    throw new Error('User is not authenticated.');

                var
                    userId = pipSession.userId(),
                    partyId = stateParams.party_id || userId,
                    party = pipDataCache.retrieve('party');

                // Skip if party already retrieved
                if (party && party.id == partyId) {
                    $rootScope.$party = party;

                    storeUserTheme($rootScope.$user);

                    if (successCallback) successCallback(party);
                    return party;
                }

                // Read party from server
                return pipRest.parties().get(
                    { id: partyId },
                    function (party) {
                        updateUserRights(null, party);
                        pipDataCache.storePermanent('party', party);
                        $rootScope.$party = party;

                        storeUserTheme($rootScope.$user);

                        if (successCallback) successCallback(party);
                    },
                    errorCallback
                ).$promise;
            };

            function readConnection(stateParams, successCallback, errorCallback) {
                // Avoid broken session
                if (!pipSession.opened()) 
                    throw new Error('User is not authenticated.');
    
                var 
                    userId = pipSession.userId(),
                    partyId = stateParams.party_id || userId,
                    connection = pipDataCache.retrieve('connection');

                // Clear connection it does not match user or party
                if (connection 
                    && (connection.party_id != userId
                    || connection.to_party_id != partyId)) {
                    connection = null;
                    pipDataCache.remove('connection');
                    delete $rootScope.$connection;
                }
    
                // For owner connection is not defined
                if (userId == partyId) {
                    if (successCallback) successCallback(connection);
                        
                    return connection;
                }
        
                // Read connection from server
                return pipRest.connections().query(
                    { 
                        party_id: userId, 
                        to_party_id: partyId, 
                        accept: pipEnums.ACCEPTANCE.ACCEPTED 
                    }, 
                    function (connections) {
                        // There are shall not be more than one active connection
                        if (connections && connections.length > 0) 
                            connection = connections[0];                            
                        else connection = null;

                        pipDataCache.storePermanent('connection', connection);
                        $rootScope.$connection = connection;
                                                                                        
                        if (successCallback) successCallback(connection);
                    },
                    errorCallback
                ).$promise;
            };

            function readSettings(successCallback, errorCallback) {
                // Avoid broken session
                if (!pipSession.opened())
                    throw new Error('User is not authenticated.');
                var
                    userId = pipSession.userId(),
                    settings = pipDataCache.retrieve('settings' + '_' + userId);

                if (settings) {
                    if (successCallback) successCallback(settings);

                    return settings;
                }

                // Read settings from server
                return pipRest.partySettings().get(
                    {
                        party_id: userId
                    },
                    function (settings) {
                        settings = settings || {};
                        pipDataCache.storePermanent('settings' + '_' + userId, settings);
                        $rootScope.$settings = settings;

                        if (successCallback) successCallback(settings);
                    },
                    errorCallback
                ).$promise;
            };

            function onSettingsUpdate(item, successCallback) {
                // return function(item) {
                if (item == null) return;

                var userId = pipSession.userId(),
                    settings = pipDataCache.retrieve('settings' + '_' + userId);

                // If tags are stored
                if (settings) {
                    settings = _.extend(settings, item);
                    pipDataCache.storePermanent('settings' + '_' + userId, settings);
                    $rootScope.$settings = settings;
                }

                if (successCallback) successCallback(item);
                //  };
            };

        }
    );

})();