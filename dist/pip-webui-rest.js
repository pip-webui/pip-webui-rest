/**
 * @file Announces data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipAnnouncesCache', ['pipAnnouncesData']);

    thisModule.service('pipAnnouncesCache',
        ['pipEnums', 'pipDataCache', 'pipTagsCache', function (pipEnums, pipDataCache, pipTagsCache) {

            return {
                readAnnounces: readAnnounces,
                onAnnounceCreate: onAnnounceCreate,
                onAnnounceUpdate: onAnnounceUpdate,
                onAnnounceDelete: onAnnounceDelete                
            };

            function readAnnounces(params, successCallback, errorCallback) {
                params = params || {};
                params.resource = 'announces';
                params.item = params.item || {};

                return pipDataCache.retrieveOrLoad(params, successCallback, errorCallback);
            }
            
            function onAnnounceCreate(params, successCallback) {
                return pipDataCache.addDecorator(
                    'announces', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            }

            function onAnnounceUpdate(params, successCallback) {
                return pipDataCache.updateDecorator(
                    'announces', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            }

            function onAnnounceDelete(params, successCallback) {
                return pipDataCache.removeDecorator('announces', params, successCallback);
            }
                        
        }]
    );

})();


/**
 * @file Global application data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipDataCache', ['pipDataModel']);

    thisModule.provider('pipDataCache', function () {
        var
            CACHE_TIMEOUT = 5 * 60000, // 5 mins or make it configurable
            cache = {};

        this.timeout = timeout;

        this.$get = ['$q', 'pipDataModel', function ($q, pipDataModel) {
            return {
                timeout: timeout,

                clear: clear,
                retrieve: retrieve,
                retrieveOrLoad: retrieveOrLoad,
                store: store,
                storePermanent: storePermanent,
                remove: remove,
                removeItem: removeItem,
                removeDecorator: removeDecorator,

                // OBSOLETE - will be removed
                addDecorator: addDecorator,
                updateDecorator: updateDecorator,
            };
            //-------------

            // Converts a string value into a numeric hash code
            function hash(data) {
                var filteredData = {};

                // Filter only the generic parameters that can be relevant to the query
                if(data != null) {
                    filteredData.item = data.item;
                    filteredData.party_id = data.party_id;
                    filteredData.search = data.search;
                    filteredData.paging = data.paging;
                    filteredData.take = data.take;
                    filteredData.skip = data.skip;
                }

                filteredData = angular.toJson(filteredData);
                var h = 0, i, chr, len;
                if (filteredData == null || filteredData.length === 0) return h;
                for (i = 0, len = filteredData.length; i < len; i++) {
                    chr = filteredData.charCodeAt(i);
                    h = ((h << 5) - h) + chr;
                    h |= 0; // Convert to 32bit integer
                }
                return h;
            };

            // Generates parameterized key
            function generateKey(name, params) {
                var h = hash(params);
                return name + (h != 0 ? '_' + h : '');
            };

            // Clear the cache, globally or selectively
            function clear(name) {
                if (name == null) {
                    cache = {};
                    console.log('****** Invalidated cache');
                } else {
                    for (var key in cache) {
                        if (key == name || key.startsWith(name + '_')) {
                            console.log('****** Invalidated cache ' + key);
                            delete cache[key];
                        }
                    }
                }
            };

            // Try to retrieve collection from the cache
            function retrieve(name, params) {
                if (name == null) throw new Error('name cannot be null');
                if (name == '') throw new Error('name cannot be empty');

                var key = generateKey(name, params);
                var holder = cache[key];
                if (holder == null) return null;

                // If expired then cleanup and return null
                if (holder.expire
                    && _.now() - holder.expire > CACHE_TIMEOUT) {
                    delete cache[key];
                    return null;
                }

                return holder.data;
            };

            // Store collection into the cache
            function store(name, data, params) {
                if (name == null) throw new Error('name cannot be null');
                if (name == '') throw new Error('name cannot be empty');

                cache[generateKey(name, params)] = {
                    expire: _.now(),
                    data: data
                };
            };

            // Store collection into the cache without expiration
            function storePermanent(name, data, params) {
                if (name == null) throw new Error('name cannot be null');
                if (name == '') throw new Error('name cannot be empty');

                cache[generateKey(name, params)] = {
                    expire: null,
                    data: data
                };
            };

            // Remove collection from the cache
            function remove(name, params) {
                if (name == null) throw new Error('name cannot be null');
                if (name == '') throw new Error('name cannot be empty');

                delete cache[generateKey(name, params)];
            };

            function updateItem(name, item, params) {
                if (name == null) throw new Error('name cannot be null');
                if (item == null) return;

                var data = retrieve(name, params);

                if (data != null) {
                    var isAdded = false;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id == item.id) {
                            data[i] = item;
                            isAdded = true;
                            return;
                        }
                    }
                    if (!isAdded) data.push(item);
                    store(name, data, params);
                }
            };

            // Tries to retrieve collection from the cache, otherwise load it from server
            function retrieveOrLoad(params, successCallback, errorCallback) {
                if (params == null) throw new Error('params cannot be null');
                // todo add check params?

                var name = (params.cache || params.resource);

                // Retrieve data from cache
                var filter = params.filter,
                    force = !!params.force,
                    result = !force ? retrieve(name, params) : null,
                    deferred = $q.defer();

                // Return result if it exists
                if (result) {
                    console.log('***** Loaded from cache ' + name, result);
                    if (filter) result = filter(result);
                    if (successCallback) successCallback(result);
                    deferred.resolve(result);
                    return deferred.promise;
                }

                // Load data from server
                pipDataModel[params.singleResult ? 'readOne' : 'read'](
                    params,
                    function (data) {
                        // Store data in cache and return
                        params.singleResult ?
                            updateItem(name, data, params) :
                            store(name, data, params);
                        if (filter) data = filter(data);
                        deferred.resolve(data);

                        console.log('***** Loaded from server ' + name, data);

                        if (successCallback) successCallback(data);
                    },
                    function (err) {
                        // Return error
                        console.log('***** FAILED to load from server ' + name);
                        deferred.reject(err);
                        if (errorCallback) errorCallback(err);
                    }
                );

                // Return deferred object
                return deferred.promise;
            };

            function removeItem(name, item) {
                if (name == null) throw new Error('name cannot be null');
                if (item == null) return;

                for (var key in cache) {
                    if (key == name || key.startsWith(name + '_')) {
                        var data = cache[key].data;
                        if (angular.isArray(data)) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].id == item.id) {
                                    data.splice(i, 1);
                                    i--;
                                }
                            }
                        }
                    }
                }
            };

            function removeDecorator(resource, params, successCallback) {
                return function (item) {
                    removeItem(resource, params);
                    if (successCallback) successCallback(item);
                };
            };

            function updateDecorator(resource, params, successCallback) {
                return function (item) {
                    for (var key in cache) {
                        if (key == resource || key.startsWith(resource + '_')) {
                            var data = cache[key].data;
                            if (angular.isArray(data)) {
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i].id == item.id) {
                                        data[i] = item;
                                    }
                                }
                            }
                        }
                    }

                    if (successCallback) successCallback(item);
                };
            };

            // OBSOLETE - WILL BE REMOVED ONCE CODE IS REFACTORED
            function addDecorator(resource, params, successCallback) {
                return function (item) {
                    if (!params || !params.notClearedCache) clear(resource);
                    if (successCallback) successCallback(item);
                };
            };

        }];
        //-----------------------

        function timeout(newTimeout) {
            if (newTimeout) {
                CACHE_TIMEOUT = newTimeout;
            }
            return CACHE_TIMEOUT;
        };
    });
})();


/**
 * @file Guides data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipGuidesCache', ['pipGuidesData']);

    thisModule.service('pipGuidesCache',
        ['pipEnums', 'pipDataCache', 'pipTagsCache', function (pipEnums, pipDataCache, pipTagsCache) {

            return {
                readGuides: readGuides,
                onGuideCreate: onGuideCreate,
                onGuideUpdate: onGuideUpdate,
                onGuideDelete: onGuideDelete                
            };

            function readGuides(params, successCallback, errorCallback) {
                params = params || {};
                params.resource = 'guides';
                params.item = params.item || {};

                return pipDataCache.retrieveOrLoad(params, successCallback, errorCallback);
            };
            
            function onGuideCreate(params, successCallback) {
                return pipDataCache.addDecorator(
                    'guides', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            };

            function onGuideUpdate(params, successCallback) {
                return pipDataCache.updateDecorator(
                    'guides', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            };

            function onGuideDelete(params, successCallback) {
                return pipDataCache.removeDecorator('guides', params, successCallback);
            };
                        
        }]
    );

})();


/**
 * @file Session data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipSessionCache', ['pipCore', 'pipRest', 'pipDataCache']);

    thisModule.run(['$rootScope', 'pipSessionCache', function ($rootScope, pipSessionCache) {
        $rootScope.$on('pipSessionOpened', pipSessionCache.init);
        $rootScope.$on('pipSessionClosed', pipSessionCache.clear);
    }]);

    thisModule.service('pipSessionCache',
        ['$rootScope', '$stateParams', '$q', 'pipTranslate', 'pipRest', 'localStorageService', 'pipAccess', 'pipEnums', 'pipSession', 'pipDataCache', function ($rootScope, $stateParams, $q, pipTranslate, pipRest, localStorageService,
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
                        throw new Error('Unexpected error: issues in opening session');

                    if (successCallback) successCallback(user);
                    var deferred = $q.defer();
                    deferred.resolve(user);
                    return deferred.promise;
                }

                // Read user from server
                return pipRest.users().get(
                    {id: userId},
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
                    var deferred = $q.defer();
                    deferred.resolve(party);
                    return deferred.promise;
                }

                // Read party from server
                return pipRest.parties().get(
                    {id: partyId},
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
                    var deferred = $q.defer();
                    deferred.resolve(connection);
                    return deferred.promise;
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
                    var deferred = $q.defer();
                    deferred.resolve(settings);
                    return deferred.promise;
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
            };
        }]
    );

})();
/**
 * @file Tags data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipTagsCache', ['pipUtils', 'pipDataCache']);

    thisModule.service('pipTagsCache',
        ['pipTags', 'pipDataCache', function(pipTags, pipDataCache) {
            return {
                readTags: readTags,
                // Todo: Add updateTags method
                onTagsUpdate: onTagsUpdate,
                tagsUpdateDecorator: tagsUpdateDecorator
            };
			//------------------------------

            function tagsUpdate(params, item) {
                // Extract tag from updated entity
                var tags = item ? pipTags.extractTags(item) : [];
                if (tags.length == 0) return;

                var cacheName = 'partyTags';
                if (params && params.party_id !== null && params.party_id !== undefined)
                    cacheName = cacheName + '_' + params.party_id;
                else if (params && params.item && params.item.party_id !== null && params.item.party_id !== undefined)
                    cacheName = cacheName + '_' + params.item.party_id;

                // Todo: this is a wrong way to get party_id (contributor) from entities
                var data = pipDataCache.retrieve(cacheName);

                // If tags are stored
                if (data) {
                    _.each(tags, function(tag) {
                        // Find if tag already exists
                        var t = _.find(data.tags, function(t) {
                            return pipTags.equalTags(t.tag, tag);
                        });

                        // Otherwise add a new tag
                        if (t) {
                            t.tag = tag;
                            t.count = t.count + 1;
                            t.used = new Date();
                        } else {
                            if (!data.tags)
                                data.tags = [];
								
                            data.tags.push({
                                tag: tag,
                                count: 1,
                                used: new Date()
                            });
                        }
                    });
                    pipDataCache.store(cacheName, data);
                }
            };

            function tagsUpdateDecorator(params, successCallback) {
                return function(item) {
                    tagsUpdate(params, item);

                    if (successCallback) successCallback(item);
                };
            };

			function readTags(params, successCallback, errorCallback) {
				params.resource = 'partyTags';
				params.singleResult = true;

				return pipDataCache.retrieveOrLoad(params, successCallback, errorCallback);
			};

			// Todo: Add updateTags method

			function onTagsUpdate(params, successCallback) {
				return tagsUpdateDecorator(params, successCallback);
			};
        }]
    );

})();


/**
 * @file Tips data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipTipsCache', ['pipTipsData']);

    thisModule.service('pipTipsCache',
        ['pipEnums', 'pipDataCache', 'pipTagsCache', function (pipEnums, pipDataCache, pipTagsCache) {

            return {
                readTips: readTips,
                onTipCreate: onTipCreate,
                onTipUpdate: onTipUpdate,
                onTipDelete: onTipDelete                
            };

            function readTips(params, successCallback, errorCallback) {
                params = params || {};
                params.resource = 'tips';
                params.item = params.item || {};

                return pipDataCache.retrieveOrLoad(params, successCallback, errorCallback);
            };
            
            function onTipCreate(params, successCallback) {
                return pipDataCache.addDecorator(
                    'tips', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            };

            function onTipUpdate(params, successCallback) {
                return pipDataCache.updateDecorator(
                    'tips', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            };

            function onTipDelete(params, successCallback) {
                return pipDataCache.removeDecorator('tips', params, successCallback);
            };
                        
        }]
    );

})();


/**
 * @file User access permissions service
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipRest.Access', ['pipUtils', 'pipRest.Enums']);

    thisModule.factory('pipAccess', ['pipUtils', 'pipEnums', function (pipUtils, pipEnums) {

        function defaultAccess(account) {
            // Clone and set default values
            var user = _.defaults(
                {
                    // Fix id
                    id: account.id || account._id,
                    party_id: null,
                    party_name: null,
                    type: null,
                    owner: false,
                    manager: false,
                    contributor: false,
                    share_level: pipEnums.SHARE_LEVEL.WORLD
                },
                account
            );
    
            delete user._id;
    
            return user;
        };
    
        function fixAccess(user) {
            // Owner acts as his own manager
            user.manager = user.manager || user.owner;
    
            // Manager has contributor rights
            user.contributor = user.contributor || user.manager;
    
            // Managers and contributors can access at private level
            if (user.contributor)
                user.share_level = pipEnums.SHARE_LEVEL.PRIVATE;
    
            return user;
        }
    
        function overrideAccess(user, access) {
            // Copy over override
            user.party_id = access.party_id;
            user.party_name = access.party_name;
            user.type = access.type;
            user.owner = !!access.owner;
            user.manager = !!access.manager;
            user.contributor = !!access.contributor;
            user.share_level = access.share_level || pipEnums.SHARE_LEVEL.WORLD;
    
            // Party can be set as an object
            if (access.party) {
                user.party_id = access.party.id || access.party._id;
                user.party_name = access.party.name;
            }
    
            // Make access settings consistent and return
            return fixAccess(user);
        };
    
        function asOwner(account) {
            // Skip if no account set
            if (account == null) return undefined;
    
            // Construct default user
            var user = defaultAccess(account);
    
            // Set owner access rights
            user.party_id = user.id;
            user.party_name = user.name;
            user.type = null;
            user.owner = true;
            user.manager = true;
            user.contributor = true;
            user.share_level = pipEnums.SHARE_LEVEL.PRIVATE;
    
            return user;
        };
    
        function toParty(account, party) {
            // Skip if no account set
            if (account == null) return undefined;
    
            // If no party set then assume owner access
            if (party == null) return asOwner(account);
    
            var 
                userId = account.id || account._id,
                partyId = party.id || party._id || party,
                partyName = party.name || account.name;
    
            // If user and party are the same then
            if (userId == partyId) return asOwner(account);
    
            // Set default values
            var user = defaultAccess(account);
            user.party_id = partyId;
            user.party_name = partyName;
    
            // Identify maximum access level
            _.each(user.party_access, function (access) {
                if (pipUtils.equalObjectIds(partyId, access.party_id)) {
                    user.party_name = access.party_name;
                    user.type = access.type;
                    user.manager = user.manager || access.manager;
                    user.contributor = user.contributor || access.contributor;
                    user.share_level = Math.max(user.share_level, access.share_level);
                }
            });
    
            // Make access settings consistent and return
            return fixAccess(user);
        };
    
        // Can be used for testing
        function override(account, access) {
            // Skip if no account set
            if (account == null) return undefined;
    
            // Set default values
            var user = defaultAccess(account);
    
            // If no override return plain user
            if (access) overrideAccess(user, access);
    
            return user;
        };
    
        // Can be used for testing
        function toPartyWithOverride(account, party, access) {
            var user = toParty(account, party);
    
            // If no override return plain user
            if (access) overrideAccess(user, access);
    
            return user;
        };
        
        return {
            asOwner: asOwner,
            toParty: toParty,
            override: override,
            toPartyWithOverride: toPartyWithOverride
        };
    }]);

})();

/**
 * @file Application secure router
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global angular */
 
(function () {
    'use strict';
    
    var thisModule = angular.module('pipRest.State', ['pipState', 'pipRest.Session', 'pipRest.Access', 'pipSessionCache']);

    thisModule.config(
        ['$locationProvider', '$httpProvider', function($locationProvider, $httpProvider) {
            // Attach interceptor to react on unauthorized errors
            $httpProvider.interceptors.push('pipAuthHttpResponseInterceptor');
        }]
    );

    thisModule.run(
        ['$rootScope', 'pipState', 'pipSession', 'pipAuthState', function($rootScope, pipState, pipSession, pipAuthState) {

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

        }]
    );

    thisModule.factory('pipAuthHttpResponseInterceptor',
        ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
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
                        
                            if (!$rootScope.$user || !$rootScope.$party)
                                $rootScope.$emit('pipNoConnectionError', {
                                error: rejection
                                });

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
        }]
    );

    thisModule.provider('pipAuthState', ['pipStateProvider', function(pipStateProvider) {
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

        this.$get = ['pipState', function (pipState) {            
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
        }];

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

    }]);

})();
/**
 * @file Rest API enumerations service
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipRest.Enums', []);

    thisModule.factory('pipEnums', function () {

        var enums = {};
    
        // Converts enumeration values to string array
        function enumToArray(obj) {
            var result = [];
    
            for (var key in obj)
                if (obj.hasOwnProperty(key))
                    result.push(obj[key]);

            return result;
        };
    
        enums.SHARE_LEVEL = {
            WORLD: 0, // Everyone
            OUTER: 1, // Familiar
            INNER: 2, // Trusted
            PRIVATE: 3 // Private
        };
    
        enums.URGENCY = {
            LOW: 1,
            NORMAL: 500,
            HIGH: 1000,
            MIN: 0,
            MAX: 1000
        };
        enums.URGENCIES = enumToArray(enums.URGENCY);
    
        enums.IMPORTANCE = {
            LOW: 1,
            NORMAL: 500,
            HIGH: 1000,
            MIN: 0,
            MAX: 1000
        };
        enums.IMPORTANCES = enumToArray(enums.IMPORTANCE);
    
        enums.CONFIDENTIALITY = {
            PUBLIC: 0, // No sharing restrictions level - ANY, groups = yes, parties = yes
            SENSITIVE: 1, // No public sharing - level >= OUTER, groups = yes, parties = yes
            CLASSIFIED: 2, // Only selected parties - level = PRIVATE, groups = yes, parties = yes
            SECRET: 3 // No sharing - level = PRIVATE, groups = no, parties = no
        };
        enums.CONFIDENTIALITIES = enumToArray(enums.CONFIDENTIALITY);
    
        enums.LEVEL = {
            NONE: 0,
            LOW: 1,
            LOW_MEDIUM: 250,
            MEDIUM: 500,
            MEDIUM_HIGH: 750,
            HIGH: 1000,
            MIN: 0,
            MAX: 1000
        };
    
        enums.LANGUAGE = {
            ENGLISH: 'en',
            SPANISH: 'es',
            PORTUGUESE: 'pt',
            FRENCH: 'fr',
            GERMAN: 'de',
            RUSSIAN: 'ru'
        };
        enums.LANGUAGES = enumToArray(enums.LANGUAGE);
    
        enums.STAT_TYPE = {
            DAILY: 'daily',
            MONTHLY: 'monthly',
            YEARLY: 'yearly',
            TOTAL: 'total'
        };
        enums.STAT_TYPES = enumToArray(enums.STAT_TYPE);
    
        enums.STAT_BATCH_OPERATION = {
            RECORD_SYSTEM_STATS: 'record system stats',
            RECORD_PARTY_STATS: 'record party stats'
        };
    
        enums.SERVER_TYPE = {
            REALTIME_DB: 'r/t db master',
            HISTORIAN_DB: 'db slave',
            ANALYTICS: 'analytics',
            BUSINESS_LOGIC: 'business logic',
            REST_API: 'rest api',
            STATIC_CONTENT: 'static content',
            BACKUP_STORAGE: 'backup storage'
        };
        enums.SERVER_TYPES = enumToArray(enums.SERVER_TYPE);
    
        enums.SYSTEM_LOG_TYPE = {
            INFO: 'info',
            STOP: 'stop',
            START: 'start',
            RESTART: 'restart',
            UPGRADE: 'upgrade',
            MAINTENANCE: 'maintenance',
            WARNING: 'warning',
            ERROR: 'error'
        };
        enums.SYSTEM_LOG_TYPES = enumToArray(enums.SYSTEM_LOG_TYPE);
    
        enums.ACTIVITY_TYPE = {
            SIGNUP: 'signup',
            SIGNIN: 'signin',
            PASSWORD_CHANGED: 'password changed',
            PWD_RECOVERED: 'pwd recovered',
            EMAIL_VERIFIED: 'email verified',
            SETTINGS_CHANGED: 'settings changed',
            PARTNERED: 'partnered',
            TEAMED_UP: 'teamed up',
            FOLLOWED: 'followed',
            DISCONNECTED: 'disconnected',
            CREATED: 'created',
            UPDATED: 'updated',
            DELETED: 'deleted',
            ACCEPTED: 'accepted',
            REJECTED: 'rejected',
            JOINED: 'joined',
            COMPLETED: 'completed',
            CANCELED: 'canceled',
            PROGRESS: 'progress',
            POSTED: 'posted',
            BUZZED: 'buzzed',
            COMMENTED: 'commented',
            CHEERED: 'cheered',
            BOOED: 'booed'
        };
        enums.ACTIVITY_TYPES = enumToArray(enums.ACTIVITY_TYPE);
    
        enums.REFERENCE_TYPE = {
            PARTY: 'party',
            CONNECTION: 'connection',
            CONTACT: 'contact',
            MESSAGE: 'message',
            NOTE: 'note',
            AREA: 'area',
            GOAL: 'goal',
            EVENT: 'event',
            VISION: 'vision',
            COLLAGE: 'collage',
            POST: 'post',
            SUPPORT_CASE: 'support case',
            ANNOUNCE: 'announce',
            IMAGE_SET: 'image set',
            FEEDBACK: 'feedback',
            GUIDE: 'guide'
        };
        enums.REFERENCE_TYPES = enumToArray(enums.REFERENCE_TYPE);
    
        enums.CONTENT_TYPE = {
            TEXT: 'text',
            CHECKLIST: 'checklist',
            LOCATION: 'location',
            TIME: 'time',
            PICTURES: 'pictures',
            DOCUMENTS: 'documents'
        };
        enums.CONTENT_TYPES = enumToArray(enums.CONTENT_TYPE);
    
        enums.PARTY_TYPE = {
            PERSON: 'person',
            TEAM: 'team',
            AGENT: 'agent'
        };
        enums.PARTY_TYPES = enumToArray(enums.PARTY_TYPE);
    
        enums.GENDER = {
            MALE: 'male',
            FEMALE: 'female',
            NOT_SPECIFIED: 'n/s'
        };
        enums.GENDERS = enumToArray(enums.GENDER);
    
        enums.VISION_TYPE = {
            OVERALL: 'overall',
            ROLE: 'role',
            MODEL: 'model',
            TIME: 'time'
        };
        enums.VISION_TYPES = enumToArray(enums.VISION_TYPE);
    
        enums.AREA_TYPE = {
            CATEGORY: 'category',
            AREA: 'area'
        };
        enums.AREA_TYPES = enumToArray(enums.AREA_TYPE);
    
        enums.GOAL_TYPE = {
            GOAL: 'goal',
            OBJECTIVE: 'objective',
            DREAM: 'dream',
            //ASPIRATION: 'aspiration',
            ACCOMPLISHMENT: 'accomplishment',
            //CHORE: 'chore',
            //HABIT: 'habit',
            TASK: 'task',
            ROUTINE: 'routine'
        };
        enums.GOAL_TYPES = enumToArray(enums.GOAL_TYPE);
    
        enums.PROCESS_NODE = {
            START: 'start',
            END: 'end',
            EVENT: 'event',
            AWAIT: 'await',
            DECISION: 'decision',
            ACTIVITY: 'activity'
        };
        enums.PROCESS_NODES = enumToArray(enums.PROCESS_NODE);
    
        enums.CALCULATION_METHOD = {
            LAST_VALUE: 'last value',
            SUM: 'sum',
            MAX: 'max',
            MIN: 'min',
            AVERAGE: 'average'
        };
        enums.CALCULATION_METHODS = enumToArray(enums.CALCULATION_METHOD);
    
        enums.EXECUTION_STATUS = {
            NEW: 'new',
            ASSIGNED: 'assigned',
            IN_PROGRESS: 'in progress',
            VERIFYING: 'verifying',
            ON_HOLD: 'on hold',
            CANCELED: 'canceled',
            COMPLETED: 'completed'
        };
        enums.EXECUTION_STATUSES = enumToArray(enums.EXECUTION_STATUS);
    
        enums.CONTRIBUTOR_ROLE = {
            UNDEFINED: 'undefined',
            RESPONSIBLE: 'responsible',
            ACCOUNTABLE: 'accountable',
            CONSULTED: 'consulted',
            INFORMED: 'informed'
        };
        enums.CONSTRIBUTOR_ROLES = enumToArray(enums.CONTRIBUTOR_ROLE);
    
        enums.ACCEPTANCE = {
            JOINED: 'joined',
            INVITED: 'invited',
            ACCEPTED: 'accepted'
            //REJECTED: 'rejected'
        };
        enums.ACCEPTANCES = enumToArray(enums.ACCEPTANCE);
    
        enums.ACCEPT_ACTION = {
            INVITE: 'invite',
            JOIN: 'join',
            ACCEPT: 'accept',
            REJECT: 'reject'
        };
        enums.ACCEPT_ACTIONS = enumToArray(enums.ACCEPT_ACTION);
    
        enums.JOIN_METHOD = {
            INVITE: 'invite',
            APPROVE: 'approve',
            OPEN: 'open'
        };
        enums.JOIN_METHODS = enumToArray(enums.JOIN_METHOD);
    
        enums.SKILL_LEVEL = {
            NOVICE: 'novice',
            INTERMEDIATE: 'intermediate',
            ADVANCED: 'advanced',
            EXPERT: 'expert'
        };
        enums.SKILL_LEVELS = enumToArray(enums.SKILL_LEVEL);
    
        enums.FEEDBACK_TYPE = {
            SUPPORT: 'support',
            TEAM: 'team',
            MEETUP: 'meetup',
            COPYRIGHT: 'copyright',
            BUSINESS: 'business',
            ADVERTISEMENT: 'ad'
        };
        enums.FEEDBACK_TYPES = enumToArray(enums.FEEDBACK_TYPE);
    
        enums.NOTE_CATEGORY = {
            GENERAL: 'general',
            UNFINISHED: 'unfinished',
            ULTIMATE_TODO: 'ultimate todo'
        };
        enums.NOTE_CATEGORIES = enumToArray(enums.NOTE_CATEGORY);
    
        enums.CONNECTION_TYPE = {
            PARTNER: 'partner',
            MEMBER: 'member',
            FOLLOW: 'follow',
            AUTOMATION: 'automation'
        };
        enums.CONNECTION_TYPES = enumToArray(enums.CONNECTION_TYPE);
    
        enums.EVENT_TYPE = {
            INSTANCE: 'instance',
            RECURRENCE: 'recurrence',
            AUTO_INSTANCE: 'auto',
            TIME_ENTRY: 'time entry'
        };
        enums.EVENT_TYPES = enumToArray(enums.EVENT_TYPE);
    
        enums.EVENT_CATEGORY = {
            DAILY: 'daily',
            WEEKLY: 'weekly',
            MONTHLY: 'monthly',
            YEARLY: 'yearly'
            //    COULDDO: 'coulddo'
        };
        enums.EVENT_CATEGORIES = enumToArray(enums.EVENT_CATEGORY);
    
        enums.COMMENT_TYPE = {
            BUZZ: 'buzz',
            CHEER: 'cheer',
            BOO: 'boo',
            COMMENT: 'comment'
        };
        enums.COMMENT_TYPES = enumToArray(enums.COMMENT_TYPE);
    
        enums.POST_TYPE = {
            INFO: 'info',
            QUESTION: 'question',
            ISSUE: 'issue',
            REPORT: 'report',
            FORECAST: 'forecast'
        };
        enums.POST_TYPES = enumToArray(enums.POST_TYPE);
    
        enums.MESSAGE_TYPE = {
            REGULAR: 'regular',
            EMAIL: 'email',
            INVITATION: 'invitation'
        };
        enums.MESSAGE_TYPES = enumToArray(enums.MESSAGE_TYPE);
    
        enums.NOTIFICATION_TYPE = {
            GREETING: 'greeting',
            MESSAGE: 'message',
    
            PARTNER_INVITE: 'partner invite',
            PARTNER_RESPONSE_ACCEPTED: 'partner response accepted',
            PARTNER_RESPONSE_REJECTED: 'partner response rejected',
            PARTNER_JOINED: 'partner joined',
            MEMBER_INVITE: 'member invite',
            MEMBER_REQUEST: 'member request',
            MEMBER_RESPONSE_ACCEPTED: 'member response accepted',
            MEMBER_RESPONSE_REJECTED: 'member response rejected',
            MEMBER_JOINED: 'member joined',
            FOLLOWER_JOINED: 'follower joined',
    
            ENTITY_REQUEST: 'entity request',
            ENTITY_REQUEST_ACCEPTED: 'entity request accepted',
            ENTITY_REQUEST_REJECTED: 'entity request rejected',
            ENTITY_INVITE: 'entity invite',
            ENTITY_INVITE_ACCEPTED: 'entity invite accepted',
            ENTITY_INVITE_REJECTED: 'entity invite rejected',
            ENTITY_JOINED: 'entity joined',
    
            VERIFY_EMAIL: 'verify email',
            COMPLETE_PROFILE: 'complete profile'
        };
        enums.NOTIFICATION_TYPES = enumToArray(enums.NOTIFICATION_TYPE);
    
        enums.NOTIFICATION_BATCH_OPERATION = {
            CREATE: 'create',
            REPLY: 'reply',
            CLOSE: 'close',
            DELETE: 'delete'
        };
    
        enums.SUPPORT_CASE_CATEGORY = {
            ACCOUNT: 'account',
            BILLING: 'billing',
            TECHNICAL: 'technical',
            GENERAL: 'general'
        };
        enums.SUPPORT_CASE_CATEGORIES = enumToArray(enums.SUPPORT_CASE_CATEGORY);
    
        enums.ANNOUNCE_TYPE = {
            APP: 'app',
            EMAIL: 'email',
            APP_AND_EMAIL: 'app and email'
        };
        enums.ANNOUNCE_TYPES = enumToArray(enums.ANNOUNCE_TYPE);
    
        enums.ANNOUNCE_CATEGORY = {
            GENERAL: 'general',
            MAINTENANCE: 'maintenance',
            NEW_RELEASE: 'new release',
            SURVEY: 'survey'
        };
        enums.ANNOUNCE_CATEGORIES = enumToArray(enums.ANNOUNCE_CATEGORY);
    
        enums.GUIDE_TYPE = {
            INTRO: 'intro',
            TOPIC: 'topic',
            CONTEXT: 'context',
            TIP: 'tip',
            NEW_RELEASE: 'new release'
        };
        enums.GUIDE_TYPES = enumToArray(enums.GUIDE_TYPE);
    
        enums.EMAIL_TYPE = {
            HOME: 'home',
            WORK: 'work',
            OTHER: 'other'
        };
        enums.EMAIL_TYPES = enumToArray(enums.EMAIL_TYPE);
    
        enums.ADDRESS_TYPE = {
            HOME: 'home',
            WORK: 'work',
            OTHER: 'other'
        };
        enums.ADDRESS_TYPES = enumToArray(enums.ADDRESS_TYPE);
    
        enums.ADDRESS_TYPE = {
            HOME: 'home',
            WORK: 'work',
            OTHER: 'other'
        };
        enums.ADDRESS_TYPES = enumToArray(enums.ADDRESS_TYPE);
    
        enums.PHONE_TYPE = {
            MOBILE: 'mobile',
            WORK: 'work',
            HOME: 'home',
            MAIN: 'main',
            WORK_FAX: 'work fax',
            HOME_FAX: 'home fax',
            OTHER: 'other'
        };
        enums.PHONE_TYPES = enumToArray(enums.PHONE_TYPE);
    
        enums.MESSANGER_TYPE = {
            SKYPE: 'skype',
            GOOGLE_TALK: 'google talk',
            AIM: 'aim',
            YAHOO: 'yahoo',
            QQ: 'qq',
            MSN: 'msn',
            ICQ: 'icq',
            JABBER: 'jabber',
            OTHER: 'other'
        };
        enums.MESSANGER_TYPES = enumToArray(enums.MESSANGER_TYPE);
    
        enums.WEB_ADDRESS_TYPE = {
            PROFILE: 'profile',
            BLOG: 'blog',
            HOME_PAGE: 'home page',
            WORK: 'work',
            PORTFOLIO: 'portfolio',
            OTHER: 'other'
        };
        enums.WEB_ADDRESS_TYPES = enumToArray(enums.WEB_ADDRESS_TYPE);
    
        enums.DASHBOARD_TILE_SIZE = {
            SMALL: 'small',
            WIDE: 'wide',
            LARGE: 'large'
        };
        enums.DASHBOARD_TILE_SIZES = enumToArray(enums.DASHBOARD_TILE_SIZE);

        return enums;
    });
    
})();

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

    thisModule.provider('pipRest', ['$httpProvider', function ($httpProvider) {
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
        $httpProvider.defaults.headers.common['api-version'] = '1.0';


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

        this.$get = ['$rootScope', '$http', '$resource', function ($rootScope, $http, $resource) {

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
                partyId: function ($stateParams) {
                    return $stateParams.party_id || $http.defaults.headers.common['user-id'];
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
        }];
    }]);

})();

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
        ['$rootScope', '$http', 'localStorageService', '$cookieStore', 'pipRest', 'pipTimer', function ($rootScope, $http, localStorageService, $cookieStore, pipRest, pipTimer) {
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
                pipTimer.start();
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
        }]
    );

})();
/**
 * @file Announces data model
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global angular */
 
(function () {
    'use strict';

    var thisModule = angular.module('pipAnnouncesData', ['pipRest', 'pipDataModel', 'pipAnnouncesCache']);

    thisModule.provider('pipAnnouncesData', function () {

        // Read all announces
        this.readAnnouncesResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', 'pipEnums', function ($stateParams, pipRest, pipEnums) {
                return pipRest.announces().query().$promise;
            }];
        };

        this.readCompletedAnnouncesResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', 'pipEnums', function ($stateParams, pipRest, pipEnums) {
                return pipRest.announces().query( {
                        status: pipEnums.EXECUTION_STATUS.COMPLETED
                    }
                ).$promise;
            }];
        };

        this.readAnnounceResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.announces().get({
                    id: $stateParams.id
                }).$promise;
            }];
        };

        // CRUD operations and other business methods
        this.$get = ['pipRest', '$stateParams', 'pipDataModel', 'pipAnnouncesCache', function (pipRest, $stateParams, pipDataModel, pipAnnouncesCache) {
            return {
                partyId: pipRest.partyId,
                readAnnounces: function (params, successCallback, errorCallback) {
                    params.resource = 'announces';
                    params.item = params.item || {};
                    params.item.search = $stateParams.search;
                    params.item.tags = $stateParams.search;
                    params.item.party_id = pipRest.partyId($stateParams);
                    return pipAnnouncesCache.readAnnounces(params, successCallback, errorCallback);
                },

                updateAnnounce: function (params, successCallback, errorCallback) {
                    params.resource = 'announces';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    pipDataModel.update(
                        params,
                        pipAnnouncesCache.onAnnounceCreate(params, successCallback),
                        errorCallback
                    );
                },
                
                updateAnnounceWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'announces';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        pipDataModel.update(
                            params,
                            pipAnnouncesCache.onAnnounceUpdate(params, successCallback),
                            errorCallback
                        );
                    });
                },

                createAnnounceWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'announces';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        pipDataModel.create(
                            params,
                            pipAnnouncesCache.onAnnounceCreate(params, successCallback),
                            errorCallback
                        );
                    });
                },
                
                createAnnounce: function (params, successCallback, errorCallback) {
                    params.resource = 'announces';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    pipDataModel.create(
                        params,
                        pipAnnouncesCache.onAnnounceCreate(params, successCallback),
                        errorCallback
                    );
                },

                deleteAnnounce: function(params, successCallback, errorCallback) {
                    params.resource = 'announces';
                    pipDataModel.remove(params, pipAnnouncesCache.onAnnounceDelete(params, successCallback), errorCallback);
                }
            }
        }];
    });

})();
/**
 * @file Registration of all data modules
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    angular.module('pipData', [
		'pipDataModel',
		'pipDataCache',
        
        'pipUsersData',
        'pipSettingsData',
        'pipSessionData',
        'pipTagsData',

        'pipAnnouncesData',
        'pipFeedbacksData',
        'pipImageSetsData',

        'pipTipsCache',
        'pipTipsData',

        'pipGuidesCache',
        'pipGuidesData'
    ]);
    
})();
/**
 * @file Application abstract data model
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular, _, async */

(function () {
    'use strict';

    var thisModule = angular.module('pipDataModel', ['pipUtils', 'pipRest']);

    thisModule.provider('pipDataModel', function() {
        
        this.$get = ['$stateParams', 'pipCollections', 'pipRest', function($stateParams, pipCollections, pipRest) {

            var api = [];
            
            for (var call in pipRest) {
                api[call] = pipRest[call];
            }

            // function extendApi(extension) {
            //     for (var call in extension) {
            //         api[call] = extension[call];
            //     }
            // }

            // Execute request to REST API
            function executeCurl(params, successCallback, errorCallback) {
                var t = params.transaction, tid;

                if (t && !params.skipTransactionBegin) {
                    tid = params.transactionId = t.begin(
                        params.transactionOperation || 'PROCESSING'
                    );
                    if (!tid) return;
                }

                return api[params.resource]()[params.operation](
                    params.item,
                    function (result) {
                        if (t && tid && t.aborted(tid)) return;
                        if (t && !params.skipTransactionEnd) t.end();
                        if (successCallback) successCallback(result);
                    },
                    function (error) {
                        if (t) t.end(error);
                        if (errorCallback) errorCallback(error);
                    }
                );
            };

            // Create an object and add it to object collection
            function createCurl(params, successCallback, errorCallback) {
                params.transactionOperation = params.transactionOperation || 'SAVING';
                params.operation = params.operation || 'save';
                
                return executeCurl(
                    params,
                    function(result) {
                        if (params.itemCollection)
                            params.itemCollection.push(result);

                        if (successCallback) successCallback(result);
                    },
                    function(error){
                        if (errorCallback) errorCallback(error);
                    }
                );
            };

            // Update an object and replace it in object collection
            function updateCurl(params, successCallback, errorCallback) {
                params.transactionOperation = params.transactionOperation || 'SAVING';
                params.operation = params.operation || 'update';

                return  executeCurl(
                    params,
                    function(result) {
                        if (params.itemCollection)
                            pipCollections.replaceBy(params.itemCollection, 'id', result.id, result);

                        if (successCallback) successCallback(result);
                    },
                    errorCallback
                );
            };

            // Update an object and remove it from object collection
            function deleteCurl(params, successCallback, errorCallback) {
                params.transactionOperation = params.transactionOperation || 'SAVING';
                params.operation = params.operation || 'remove';

                return executeCurl(
                    params,
                    function(result) {
                        if (params.itemCollection)
                            _.remove(params.itemCollection, {id: result.id || (params.object || {}).id || (params.item || {}).id});

                        if (successCallback) successCallback(result);
                    },
                    errorCallback
                );
            };

            // Read a collection of objects
            function readCurl(params, successCallback, errorCallback) {
                params.transactionOperation = params.transactionOperation || 'READING';
                params.operation = params.operation || 'query';

                return executeCurl(
                    params,
                    function(result) {
                        if (successCallback) successCallback(result);
                    },
                    errorCallback
                );
            };

            // Read a single object and add it into collection
            function readOneCurl(params, successCallback, errorCallback) {
                params.transactionOperation = params.transactionOperation || 'READING';
                params.operation = params.operation || 'page';

                return executeCurl(
                    params,
                    function(result) {
                        if (params.itemCollection && result) {
                            var index = _.findIndex(params.itemCollection, {id: result.id});
                            if (index >= 0) params.itemCollection[index] = result;
                            else params.itemCollection.push(result);
                        }

                        if (successCallback) successCallback(result);
                    },
                    errorCallback
                );
            };

            // Read a page and add results into object collection
            function pageCurl(params, successCallback, errorCallback) {
                params.transactionOperation = params.transactionOperation || 'READING';
                params.operation = params.operation || 'page';

                return executeCurl(
                    params,
                    function(result) {
                        if (params.itemCollection && result.data) {
                            for (var i = 0; i < result.data.length; i++)
                                params.itemCollection.push(result.data[i]);
                        }

                        if (successCallback) successCallback(result);
                    },
                    errorCallback
                );
            };

            // Save picture and document files
            function saveFilesCurl(params, successCallback, errorCallback) {
                var t = params.transaction, tid;

                // Start transaction if necessary
                if (t && !params.skipTransactionBegin) {
                    tid = params.transactionId = t.begin(
                        params.transactionOperation || 'SAVING'
                    );
                    if (!tid) return;
                }

//------------------

                var uploadFiles = [{
                    pictures: params.pictures,
                    documents: params.documents
                }];

                // from content
                if (params.item && params.item.content ) {
                    var saveResult = true;
                    async.eachSeries(_.union(params.item.content, uploadFiles),
                        function (obj, callback) {
                            // не выбран - пропускаем этот item  || нет этого события action
                            if ( !obj.pictures && !obj.documents ) {
                                callback();
                            } else {
                                if (obj.pictures) {
                                    // Save pictures first
                                    obj.pictures.save(
                                        function () {
                                            if (t && tid && t.aborted(tid)) {
                                                saveResult =  false;
                                                callback('aborted');
                                            }
                                            // Save documents second
                                            if (obj.documents) {
                                                obj.documents.save(
                                                    function () {
                                                        if (t && tid && t.aborted(tid)) {
                                                            saveResult =  false;
                                                            callback('aborted');
                                                        }
                                                        callback();
                                                    },
                                                    function (error) {
                                                        saveResult =  false;
                                                        callback(error);
                                                    }
                                                );
                                            } else {
                                                callback();
                                            }
                                        },
                                        function (error) {
                                            saveResult =  false;
                                            callback(error);
                                        }
                                    );
                                } else {
                                    if (obj.documents) {
                                        // Save documents first
                                        obj.documents.save(
                                            function () {
                                                if (t && tid && t.aborted(tid)) {
                                                    saveResult = false;
                                                    callback('aborted');
                                                }
                                                callback();
                                            },
                                            function (error) {
                                                saveResult = false;
                                                callback(error);
                                            }
                                        );
                                    }
                                }
                            }
                        },
                        function (error) {
                            if (!error && saveResult) {
                                // удаляем ненужные объекты перед сохранением
                                // вызываем колбек
                                if (t & !params.skipTransactionEnd) t.end();
                                _.each(params.item.content, function(item){
                                    delete item.pictures;
                                    delete item.documents;
                                });
                                if (successCallback) successCallback();
                            } else {
                                // вызываем ошибочный колбек
                                if (t) t.end(error);
                                if (errorCallback) {
                                    errorCallback(error);
                                }
                            }
                        }
                    );
                } else {
                    if (params.pictures) {
                        // Save pictures first
                        params.pictures.save(
                            function () {
                                if (t && tid && t.aborted(tid)) return;

                                // Save documents second
                                if (params.documents) {
                                    params.documents.save(
                                        function () {
                                            if (t && tid && t.aborted(tid)) return;
                                            // Do everything else
                                            if (t & !params.skipTransactionEnd) t.end();
                                            if (successCallback) successCallback();
                                        },
                                        function (error) {
                                            if (t) t.end(error);
                                            if (errorCallback) errorCallback(error);
                                        }
                                    );
                                } else {
                                    // Do everything else
                                    if (t & !params.skipTransactionEnd) t.end();
                                    if (successCallback) successCallback();
                                }
                            },
                            function (error) {
                                if (t) t.end(error);
                                if (errorCallback) errorCallback(error);
                            }
                        );
                    } else if (params.documents) {
                        // Save documents first
                        params.documents.save(
                            function () {
                                if (t && tid && t.aborted(tid)) return;
                                // Do everything else
                                if (t & !params.skipTransactionEnd) t.end();
                                if (successCallback) successCallback();
                            },
                            function (error) {
                                if (t) t.end(error);
                                if (errorCallback) errorCallback(error);
                            }
                        );
                    } else {
                        // Do everything else
                        if (t & !params.skipTransactionEnd) t.end();
                        if (successCallback) successCallback();
                    }
                }
            };

            // Abort transaction with file upload
            function abortFilesCurl(params) {
                if (params.pictures) 
                    params.pictures.abort();
                if (params.documents)
                    params.documents.abort();
                    if (params.transaction)
                    params.transaction.abort();  
            };

            return {
                // extendApi: extendApi,

                // Executing transactional requests to server
                execute: executeCurl,

                // Creating an object
                create: createCurl,

                // Updating an object
                update: updateCurl,
                save: updateCurl,

                // Deleting an object
                'delete': deleteCurl,
                remove: deleteCurl,

                // Reading objects
                read: readCurl,
                query: readCurl,

                // Reading a single object
                readOne: readOneCurl,
                get: readOneCurl,

                // Reading paginated results
                page: pageCurl,
                readPage: pageCurl,
                queryPage: pageCurl,

                // Saving files to file store
                saveFiles: saveFilesCurl,
                abortFiles: abortFilesCurl
            }
        }];
    });

})();

/**
 * @file Feedbacks data model
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipFeedbacksData', ['pipRest', 'pipDataModel']);

    thisModule.provider('pipFeedbacksData', function() {

        this.readFeedbacksResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.feedbacks().query().$promise;
            }];
        };

        this.readFeedbackResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.feedbacks().get({
                    id: $stateParams.id
                }).$promise;
            }];
        };

        this.$get = ['$stateParams', 'pipRest', 'pipDataModel', function($stateParams, pipRest, pipDataModel) {
            return {

                sendFeedback: function(params, successCallback, errorCallback) {
                    params.resource = 'feedbacks';
                    pipDataModel.create(params, successCallback, errorCallback);
                },

                createFeedbackWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'feedbacks';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        pipDataModel.create(params, successCallback, errorCallback);
                    });
                },

                updateFeedback: function (params, successCallback, errorCallback) {
                    params.resource = 'feedbacks';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    pipDataModel.update(
                        params,
                        successCallback,
                        errorCallback
                    );
                },

                deleteFeedback: function(params, successCallback, errorCallback) {
                    params.resource = 'feedbacks';
                    pipDataModel.remove(params, successCallback, errorCallback);
                }
            };
        }];
    });

})();

/**
 * @file Guides data model
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global angular */
 
(function () {
    'use strict';

    var thisModule = angular.module('pipGuidesData', ['pipRest', 'pipDataModel']);

    thisModule.provider('pipGuidesData', function () {
        var PAGE_SIZE = 5;

        // Read all guides
        this.readGuidesResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.guides().query().$promise;
            }];
        };
        
        this.readIntroGuidesResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.guides().query({
                        type: 'intro',
                        status : 'completed'
                }).$promise;
            }];
        };

        this.readGuideResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.guides().get({
                    id: $stateParams.id || '55bf23d3bb22aa175c3e498e'
                }).$promise;
            }];
        };

        // CRUD operations and other business methods
        this.$get = ['pipRest', '$stateParams', 'pipDataModel', 'pipGuidesCache', function (pipRest, $stateParams, pipDataModel, pipGuidesCache) {
            return {
                partyId: pipRest.partyId,

                readGuides: function(params, successCallback, errorCallback) {
                    params.resource = 'guides';
                    params.party_id = pipRest.partyId($stateParams);
                    return pipGuidesCache.readGuides(params, successCallback, errorCallback);
                },

                readIntroGuides: function(params, successCallback, errorCallback) {
                    params.resource = 'guides';
                    params.party_id = pipRest.partyId($stateParams);
                    params.type = 'intro';
                    params.status = 'completed';
                    return pipGuidesCache.readGuides(params, successCallback, errorCallback);
                },

                readGuide: function (params, successCallback, errorCallback) {
                    params.resource = 'guides';
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    params.item.id = params.item.id || $stateParams.id;
                    return pipDataModel.readOne(params, pipGuidesCache.onGuideUpdate(params, successCallback), errorCallback);
                },

                createGuide: function (params, successCallback, errorCallback) {
                    params.resource =  'guides';
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    pipDataModel.create(
                        params,
                        pipGuidesCache.onGuideCreate(params, successCallback),
                        errorCallback
                    );
                },

                createGuideWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'guides';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        pipDataModel.create(
                            params,
                            pipGuidesCache.onGuideCreate(params, successCallback),
                            errorCallback
                        );
                    });
                },

                updateGuide: function (params, successCallback, errorCallback) {
                    params.resource = 'guides';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    pipDataModel.update(
                        params,
                        pipGuidesCache.onGuideUpdate(params, successCallback),
                        errorCallback
                    );
                },
                
                updateGuideWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'guides';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        pipDataModel.update(
                            params,
                            pipGuidesCache.onGuideUpdate(params, successCallback),
                            errorCallback
                        );
                    });
                },

                
                deleteGuide: function(params, successCallback, errorCallback) {
                    params.resource = 'guides';
                    pipDataModel.remove(params, pipGuidesCache.onGuideDelete(params, successCallback),  errorCallback);
                }

            }
        }];
    });

})();
/**
 * @file Image sets data model
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global angular */
 
(function () {
    'use strict';
    
    var thisModule = angular.module('pipImageSetsData', ['pipRest', 'pipDataModel']);

    thisModule.provider('pipImageSetsData', function () {
        var PAGE_SIZE = 15;

        // Read all image sets
        this.readImageSetsResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.image_sets().get({
                    paging: 1,
                    skip: 0,
                    take: PAGE_SIZE,
                    search: $stateParams.search,
                    //tags: $stateParams.search
                }).$promise;
            }];
        };

        this.readImageSetResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.image_sets().get({
                    id: $stateParams.id
                }).$promise;
            }];
        };

        // CRUD operations and other business methods
        this.$get = ['pipRest', '$stateParams', 'pipDataModel', function (pipRest, $stateParams, pipDataModel) {

            return {
                partyId: pipRest.partyId,

                readImageSets: function (params, transaction, successCallback, errorCallback) {
                    params.resource = 'image_sets';

                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    params.item.search = $stateParams.search || params.item.search;
                   // params.item.tags = $stateParams.search || params.item.search;

                    params.item.party_id = pipRest.partyId($stateParams);
                    params.item.take = PAGE_SIZE;
                    params.item.paging = 1;

                    pipDataModel.page(
                        params,
                        successCallback,
                        errorCallback
                    );
                },

                updateImageSet: function (params, successCallback, errorCallback) {
                    params.resource = 'image_sets';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    pipDataModel.update(
                        params,
                        successCallback,
                        errorCallback
                    );
                },

                createImageSet: function (params, successCallback, errorCallback) {
                    params.resource = 'image_sets';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    pipDataModel.create(
                        params,
                        successCallback,
                        errorCallback
                    );
                },

                createImageSetWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'image_sets';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        pipDataModel.create(
                            params,
                            successCallback,
                            errorCallback
                        );
                    });
                },

                updateImageSetWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'image_sets';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        pipDataModel.update(
                            params,
                            successCallback,
                            errorCallback
                        );
                    });
                },

                deleteImageSet: function(params, successCallback, errorCallback) {
                    params.resource = 'image_sets';
                    pipDataModel.remove(params, successCallback, errorCallback);
                }
            }
        }];
    });

})();

/**
 * @file Session data model
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipSessionData', ['pipRest', 'pipSessionCache']);

    thisModule.provider('pipSessionData', function() {

        readUserResolver.$inject = ['pipSessionCache'];
        readPartyResolver.$inject = ['pipSessionCache', '$stateParams'];
        readConnectionResolver.$inject = ['pipSessionCache', '$stateParams'];
        readSettingsResolver.$inject = ['pipSessionCache'];
        readSessionsUserResolver.$inject = ['$stateParams', 'pipRest', '$rootScope'];
        readSessionIdResolver.$inject = ['$stateParams', 'pipSession'];
        this.readUserResolver = /* @ngInject */ readUserResolver;
        this.readPartyResolver = /* @ngInject */ readPartyResolver;
        this.readConnectionResolver = /* @ngInject */ readConnectionResolver;
        this.readSettingsResolver = /* @ngInject */ readSettingsResolver;

        this.readSessionsUserResolver = /* @ngInject */ readSessionsUserResolver;
        this.readSessionIdResolver = /* @ngInject */ readSessionIdResolver;

        this.$get = ['$rootScope', '$stateParams', 'pipRest', function($rootScope, $stateParams, pipRest) {
            return {
                getSessionId: getSessionId,
                removeSession: removeSession
            };

            function getSessionId(pipSession){
                return function () {
                    return pipSession.sessionId();
                };
            };

            function removeSession(transaction, session, successCallback, errorCallback) {
                var tid = transaction.begin('REMOVING');
                if (!tid) return;

                pipRest.userSessions().remove(
                    {
                        id: session.id,
                        party_id: $stateParams.id
                    },
                    function (removedSession) {
                        if (transaction.aborted(tid)) return;
                        else transaction.end();

                        if (successCallback) successCallback(removedSession);
                    },
                    function (error) {
                        transaction.end(error);
                        if (errorCallback) errorCallback(error);
                    }
                );
            };
            
        }];
        //--------------

        function readUserResolver(pipSessionCache) {
            return pipSessionCache.readUser();                             
        };

        function readPartyResolver(pipSessionCache, $stateParams) {
            return pipSessionCache.readParty($stateParams);
        };

        function readConnectionResolver(pipSessionCache, $stateParams) {
            return pipSessionCache.readConnection($stateParams);
        };

        function readSettingsResolver(pipSessionCache) {
            return pipSessionCache.readSettings();                             
        };

        function readSessionsUserResolver($stateParams, pipRest, $rootScope) {
            return pipRest.userSessions().query({
                party_id: $stateParams.id
            }).$promise;
        };

        function readSessionIdResolver($stateParams, pipSession) {
            return pipSession.sessionId();
        };
        
    });

})();

/**
 * @file Settings data model
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo Rewrite, use cached settings, remove unrelated methods
 */

/* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipSettingsData', ['pipRest', 'pipSessionData', 'pipSessionCache', 'pipDataModel']);

    thisModule.provider('pipSettingsData', ['pipSessionDataProvider', function (pipSessionDataProvider) {

        this.readSettingsResolver = pipSessionDataProvider.readSettingsResolver;

        this.$get = ['$rootScope', '$stateParams', 'pipRest', 'pipSessionCache', 'pipSession', 'pipDataModel', function ($rootScope, $stateParams, pipRest, pipSessionCache, pipSession, pipDataModel) {
            return {
                // Saving generic settings
                saveSettings: saveSettings,
                readSettings: readSettings,
                reReadSettings: reReadSettings

            };

            function readSettings(successCallback, errorCallback) {
                return pipSessionCache.readSettings(successCallback, errorCallback)
            };

            // force read settings from server and update cache
            function reReadSettings(successCallback, errorCallback) {
                return pipRest.partySettings().get(
                    {
                        party_id: pipSession.userId()
                    },
                    function (settings) {
                        settings = settings || {};
                        pipSessionCache.onSettingsUpdate(settings);
                        if (successCallback) successCallback(settings);
                    },
                    errorCallback
                ).$promise;
            };

            function saveSettings(settings, keys, successCallback, errorCallback) {
                // Extract specific keys
                settings = keys ? _.pick(settings, keys) : settings;
                settings.party_id = pipSession.userId();
                var oldSettings = _.cloneDeep($rootScope.$settings);
                pipSessionCache.onSettingsUpdate(settings);

                var params = {};
                params.resource = 'partySettings';
                params.item = settings;
                params.item.creator_id = pipSession.userId();

                pipDataModel.create(
                    params,
                    successCallback,
                    function (error) {
                        pipSessionCache.onSettingsUpdate(oldSettings);

                        if (errorCallback) errorCallback(error);
                    }
                );
            };
        }];
    }]);

})();

/**
 * @file Tags data model
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipTagsData', ['pipRest' , 'pipDataModel', 'pipTagsCache']);

    thisModule.provider('pipTagsData', function() {
        
        this.readTagsResolver = function() {
            return /* @ngInject */ ['$stateParams', 'pipRest', 'pipTagsCache', function($stateParams, pipRest, pipTagsCache) {
                return pipTagsCache.readTags({
                    item: { party_id: pipRest.partyId($stateParams) }
                });
            }];
        };

        this.$get = ['$stateParams', '$state', 'pipRest', 'pipDataModel', 'pipTagsCache', function($stateParams, $state, pipRest, pipDataModel, pipTagsCache) {
            return {
                partyId: pipRest.partyId,
                
                readTags: function(params, successCallback, errorCallback) {
                    params = params || {};
                    params.item = params.item || {};
                    if(params.item.party_id == null) {
                        params.item.party_id = pipRest.partyId($stateParams);
                    }
                    return pipTagsCache.readTags(params, successCallback, errorCallback);
                }
            }
        }];
    });

})();

/**
 * @file Tips data model
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipTipsData', ['pipRest', 'pipDataModel']);

    thisModule.provider('pipTipsData', function () {
        var PAGE_SIZE = 100;

        // Read all tips
        this.readTipsResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.tips().query().$promise;
            }];
        };

        this.readTipResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.tips().get({
                    id: $stateParams.id
                }).$promise;
            }];
        };

        // CRUD operations and other business methods
        this.$get = ['pipRest', '$stateParams', 'pipDataModel', 'pipTipsCache', function (pipRest, $stateParams, pipDataModel, pipTipsCache) {

            return {
                partyId: pipRest.partyId,

// todo update after optimization rezolver
                readTips: function (params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    params.item = params.item || {};
                    params.item.search = $stateParams.search;
                    params.item.tags = $stateParams.search;
                    params.item.party_id = pipRest.partyId($stateParams);
                    return pipTipsCache.readTips(params, successCallback, errorCallback);
                },

                readTip: function (params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    params.item.id = params.item.id || $stateParams.id;
                    return pipDataModel.readOne(params, pipTipsCache.onTipsUpdate(params, successCallback), errorCallback);
                },

                createTip: function (params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    pipDataModel.create(
                        params,
                        pipTipsCache.onTipCreate(params, successCallback),
                        errorCallback
                    );
                },
                
                createTipWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'tips';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        
                        params.item.party_id = pipRest.partyId($stateParams);
                        pipDataModel.create(
                            params,
                            pipTipsCache.onTipCreate(params, successCallback),
                            errorCallback
                        );
                    }, errorCallback);
                },

                updateTip: function (params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    pipDataModel.update(
                        params,
                        pipTipsCache.onTipUpdate(params, successCallback),
                        errorCallback
                    );
                },
                
                updateTipWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'tips';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        
                        params.item.party_id = pipRest.partyId($stateParams);
                        pipDataModel.update(
                            params,
                            pipTipsCache.onTipUpdate(params, successCallback),
                            errorCallback
                        );
                    });
                },

                deleteTip: function(params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    pipDataModel.remove(params, pipTipsCache.onTipDelete(params, successCallback), errorCallback);
                }
            }
        }];
    });

})();

/**
 * @file Users data model
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipUsersData', ['pipRest']);

    thisModule.provider('pipUsersData', function () {

        this.readUsersResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.users().page({
                    party_id: $stateParams.id,
                    paging: $stateParams.paging || 1,
                    skip: $stateParams.skip || 0,
                    take: $stateParams.take || 15
                }).$promise;
            }];
        };

        this.readUserResolver = function () {
            return /* @ngInject */ ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
                return pipRest.users().get({
                    id: $stateParams.id,
                    party_id: pipRest.partyId($stateParams)
                }).$promise;

            }];
        };

        this.readActivitiesUserResolver = /* @ngInject */
            ['$stateParams', 'pipRest', '$rootScope', function ($stateParams, pipRest, $rootScope) {
                return pipRest.partyActivities().page({
                    party_id: $rootScope.$user.id,
                    paging: 1,
                    skip: 0,
                    take: 25
                }).$promise;
            }];

        // CRUD operations and other business methods
        this.$get = ['pipRest', '$stateParams', function (pipRest, $stateParams) {   
            return {
                partyId: pipRest.partyId,

                readUsers: function (params, transaction, successCallback, errorCallback) {
                    pipRest.users().page(
                        {
                            party_id: pipRest.partyId($stateParams),
                            paging: 1,
                            skip: params.start,
                            search: params.item.search ,
                            active: params.item.active,
                            paid: params.item.paid,
                            admin: params.item.admin,
                            take: 15
                        },
                        function (pagedUsers) {
                            if (successCallback) successCallback(pagedUsers);
                        },
                        function (error) {
                            errorCallback(error);
                        }
                    );
                },
                
                updateUser: function (item, transaction, successCallback, errorCallback) {
                    pipRest.users().update(
                        item.item,
                        function (updatedItem) {
                            if (successCallback) successCallback(updatedItem);
                        },
                        function (error) {
                            errorCallback(error);
                        }
                    );
                }

            }
        }];
    });

})();
//# sourceMappingURL=pip-webui-rest.js.map
