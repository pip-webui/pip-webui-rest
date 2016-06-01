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
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.tips().query().$promise;
            };
        };

        this.readTipResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.tips().get({
                    id: $stateParams.id
                }).$promise;
            };
        };

        // CRUD operations and other business methods
        this.$get = function (pipRest, $stateParams, pipDataModel, pipTipsCache) {

            return {
                partyId: pipRest.partyId,

                createQuoteCache: function (params, successCallback, errorCallback) {
                    params.resource = 'quotes';
                    params.item.party_id = pipRest.partyId($stateParams);
                    
                    pipDataModel.create(
                        params,
                        pipQuotesCache.onQuoteCreate(params, successCallback),
                        errorCallback
                    );
                },

// todo update after optimization rezolver
                readTipsCache: function (params, transaction, successCallback, errorCallback) {
                    params.resource = 'tips';

                    params.item.search = $stateParams.search;
                    params.item.tags = $stateParams.search;
                    params.item.party_id = pipRest.partyId($stateParams);
                    return pipTipsCache.readTips(params, successCallback, errorCallback);
                },

                createTipCache: function (params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    params.item.party_id = pipRest.partyId($stateParams);
                    
                    pipDataModel.create(
                        params,
                        pipTipsCache.onTipCreate(params, successCallback),
                        errorCallback
                    );
                },
                
                createTipWithFilesCache: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
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

                updateTipCache: function (params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    params.item.party_id = pipRest.partyId($stateParams);
                    pipDataModel.update(
                        params,
                        pipTipsCache.onTipUpdate(params, successCallback),
                        errorCallback
                    );
                },
                
                updateTipWithFilesCache: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
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

                deleteTipCache: function(params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    pipDataModel.remove(params, pipTipsCache.onTipDelete(params, successCallback), errorCallback);
                },

// todo delete after optimization resolver
                readTips: function (params, transaction, successCallback, errorCallback) {
                    params.resource = 'tips';

                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    params.item.search = $stateParams.search;
                    params.item.tags = $stateParams.search;

                    params.item.party_id = pipRest.partyId($stateParams);
                    params.item.take = PAGE_SIZE;
                    params.item.paging = 1;

                    return pipDataModel.page(
                        params,
                        successCallback,
                        errorCallback
                    );
                },

                updateTip: function (params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    pipDataModel.update(
                        params,
                        successCallback,
                        errorCallback
                    );
                },

                createTip: function (params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    pipDataModel.create(
                        params,
                        successCallback,
                        errorCallback
                    );
                },

                createTipWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'tips';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        pipDataModel.create(
                            params,
                            successCallback,
                            errorCallback
                        );
                    });
                },

                updateTipWithFiles: function(params, successCallback, errorCallback) {
                    params.skipTransactionEnd = true;
                    pipDataModel.saveFiles(params, function() {
                        params.resource = 'tips';
                        params.skipTransactionBegin = true;
                        params.skipTransactionEnd = false;
                        pipDataModel.update(
                            params,
                            successCallback,
                            errorCallback
                        );
                    });
                },

                deleteTip: function(params, successCallback, errorCallback) {
                    params.resource = 'tips';
                    pipDataModel.remove(params, successCallback, errorCallback);
                }
            }
        };
    });

})();
