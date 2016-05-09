/**
 * @file Application abstract data model
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular, _, async */

(function () {
    'use strict';

    var thisModule = angular.module('pipDataModel', ['pipUtils', 'pipRest']);

    thisModule.provider('pipDataModel', function() {
        this.$get = function($stateParams, pipCollections, pipRest) {

            var api = [];

            for (var call in pipRest) {
                api[call] = pipRest[call];
            }

            function extendApi(extension) {
                for (var call in extension) {
                    api[call] = extension[call];
                }
            }

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
                extendApi: extendApi,

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
        };
    });

})();
