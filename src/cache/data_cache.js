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

        this.$get = function ($q, pipDataModel) {
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
                if (data != null) {
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
                if (params.item.paging == 1) {
                    // console.log('paging params', params)
                    pipDataModel['page'](
                        params,
                        function (data) {
                            // data = data.data;
                            // console.log('data', data)
                            // Store data in cache and return
                            store(name, data.data, params);
                            if (filter) data.data = filter(data.data);
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
                } else {
                    pipDataModel[params.singleResult ? 'readOne' : 'read'](
                        params,
                        function (data) {
                            // Store data in cache and return
                            params.singleResult ?
                                updateItem(name, data, params) :
                                store(name, data, params);
                            if (filter) data = filter(data);
                            deferred.resolve(data);

                            // console.log('***** Loaded from server ' + name, data);

                            if (successCallback) successCallback(data);
                        },
                        function (err) {
                            // Return error
                            console.log('***** FAILED to load from server ' + name);
                            deferred.reject(err);
                            if (errorCallback) errorCallback(err);
                        }
                    );
                }

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

        };
        //-----------------------

        function timeout(newTimeout) {
            if (newTimeout) {
                CACHE_TIMEOUT = newTimeout;
            }
            return CACHE_TIMEOUT;
        };
    });
})();

