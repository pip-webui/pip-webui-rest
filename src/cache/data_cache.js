/**
 * @file Global application data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipDataCache', ['pipDataModel']);

    thisModule.provider('pipDataCache', function() {
        var 
            CACHE_TIMEOUT = 5 * 60000, // 5 mins or make it configurable
            cache = {};
            
        this.timeout = timeout;
            
        this.$get = function($q, pipDataModel) {
            return {
                timeout: timeout,
                
                clear: clear,
                retrieve: retrieve,
                retrieveOrLoad: retrieveOrLoad,
                store: store,
                storePermanent: storePermanent,
                remove: remove,

                addItem: addItem,
                updateItem: updateItem,
                removeItem: removeItem,
                
                addDecorator: addDecorator,
                updateDecorator: updateDecorator,
                removeDecorator: removeDecorator
            };
            //-------------
            
            // Clear the entire cache
            function clear() {
                cache = {};
            };

            // Try to retrieve collection from the cache
            function retrieve(name) {
                if (name == null) throw new Error('name cannot be null');
                if (name == '') throw new Error('name cannot be empty');

                var holder = cache[name];
                if (holder == null) return null;

                // If expired then cleanup and return null
                if (holder.expire 
                    && _.now() - holder.expire > CACHE_TIMEOUT) {
                    delete cache[name];
                    return null;
                }

                return holder.data;
            };

            // Store collection into the cache
            function store(name, data) {
                if (name == null) throw new Error('name cannot be null');
                if (name == '') throw new Error('name cannot be empty');

                cache[name] = {
                    expire: _.now(),
                    data: data
                };
            };

            // Store collection into the cache without expiration
            function storePermanent(name, data) {
                if (name == null) throw new Error('name cannot be null');
                if (name == '') throw new Error('name cannot be empty');

                cache[name] = {
                    expire: null,
                    data: data
                };
            };

            // Remove collection from the cache
            function remove(name) {
                if (name == null) throw new Error('name cannot be null');
                if (name == '') throw new Error('name cannot be empty');

                delete cache[name];
            };

            // Tries to retrieve collection from the cache, otherwise load it from server
            function retrieveOrLoad(params, successCallback, errorCallback) {
                if (params == null) throw new Error('params cannot be null');
                // todo add check params?

                var name = (params.cache || params.resource);
                if (params && params.party_id !== null && params.party_id !== undefined)
                    name = name + '_' + params.party_id;
                else if (params && params.item && params.item.party_id !== null && params.item.party_id !== undefined)
                    name = name + '_' + params.item.party_id;

                // Retrieve data from cache
                var filter = params.filter,
                    force = !!params.force,
                    result = !force ? retrieve(name) : null;

                // Return result if it exists
                if (result) {
                    //console.log('***** Loaded from cache ' + name);
                    //console.log(result);
                    if (filter) result = filter(result);
                    if (successCallback) successCallback(result);
                    return result;
                }

                // Create deferred
                var deferred = $q.defer();

                // Load data from server
                pipDataModel[params.singleResult ? 'readOne' : 'read'](
                    params, 
                    function (data) {
                        // Store data in cache and return
                        params.singleResult ? updateItem(name,data) : store(name, data);
                        if (filter) data = filter(data);
                        deferred.resolve(data);

                    //console.log('***** Loaded from server ' + name);
                    //console.log(data);

                        if (successCallback) successCallback(data);
                    },
                    function (err) {
                        // Return error
                        deferred.reject(err);
                        if (errorCallback) errorCallback(err);
                    }
                );

                // Return deferred object
                return deferred.promise;
            };

            // todo if item exist in nameSpace?
            function addItem(name, params, item) {
                if (name == null) throw new Error('name cannot be null');
                if (item == null) return;

                var data = retrieve(name);

                if (data == null)  data = []; // todo maybe reload cache data?
                var index = -1;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == item.id) {
                        index = i;
                        break;
                    }
                }
                if (index == -1) data.push(item);
                else data[i] = item;
                store(name, data);
            };

            function addDecorator(resource, params, successCallback) {
                return function(item) {
                    var  nameId, name;
                    if (params && params.party_id) nameId = '_' + params.party_id;
                    else if (params && params.item && params && params.item.party_id) nameId = '_' + params.item.party_id;
                        name = resource + nameId;

                    updateItem(name, params, item);

                    if (successCallback) successCallback(item);
                };
            };

            function updateItem(name, params, item) {
                if (name == null) throw new Error('name cannot be null');
                if (item == null) return;

                var data = retrieve(name);

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
                    store(name, data);
                }
            };

            function updateDecorator(resource, params, successCallback) {
                return function(item) {
                    var  nameId, name;
                    if (params && params.party_id) nameId = '_' + params.party_id;
                    else if (params && params.item && params && params.item.party_id) nameId = '_' + params.item.party_id;
                    name = resource + nameId;

                    updateItem(name, params, item);

                    if (successCallback) successCallback(item);
                };
            };

            function removeItem(name, params, item) {
                if (name == null) throw new Error('name cannot be null');
                if (item == null) return;

                var data = retrieve(name);

                if (data == null) return;

                // delete item
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == item.id) {
                        data.splice(i, 1);
                        i--;
                    }
                }
                store(name, data);
            };

            function removeDecorator(resource, params, successCallback) {
                return function(item) {
                    var  nameId, name;
                    if (params && params.party_id) nameId = '_' + params.party_id;
                    else if (params && params.item && params && params.item.party_id) nameId = '_' + params.item.party_id;
                    name = resource + nameId;

                        removeItem(name, params, params.item);
                    if (successCallback) successCallback(item);
                };
            };

        };
        //-----------------------

        function timeout(newTimeout) {
            if (newTimeout)
                CACHE_TIMEOUT = newTimeout;
            return CACHE_TIMEOUT;  
        };
        
    });

})();

