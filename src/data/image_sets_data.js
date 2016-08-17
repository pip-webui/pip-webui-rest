/**
 * @file Image sets data model
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global angular */
 
(function () {
    'use strict';
    
    var thisModule = angular.module('pipImageSetsData', ['pipRest', 'pipDataModel', 'pipImageSetsCache']);

    thisModule.provider('pipImageSetsData', function () {
        var PAGE_SIZE = 15;

        // Read all image sets
        this.readImageSetsResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.image_sets().get({
                    paging: 1,
                    skip: 0,
                    take: PAGE_SIZE,
                    search: $stateParams.search,
                    //tags: $stateParams.search
                }).$promise;
            };
        };

        this.readImageSetResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.image_sets().get({
                    id: $stateParams.id
                }).$promise;
            };
        };

        // CRUD operations and other business methods
        this.$get = function (pipRest, $stateParams, pipDataModel, pipImageSetsCache) {

            return {
                partyId: pipRest.partyId,

                readImageSets: function (params, transaction, successCallback, errorCallback) {
                    params.resource = 'image_sets';

                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    
                    params.item = params.item || {};
                    params.item.skip = params.item.skip || 0;
                    params.item.search = $stateParams.search || params.item.search;
                   // params.item.tags = $stateParams.search || params.item.search;
                    params.item.party_id = pipRest.partyId($stateParams);
                    params.item.take = PAGE_SIZE;
                    params.item.paging = 1;

                    return pipDataModel.page(
                        params,
                        successCallback,
                        errorCallback
                    );
                },

                readImageSet: function (params, successCallback, errorCallback) {
                    params.resource = 'image_sets';
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    params.item.id = params.item.id || $stateParams.id;
                    return pipDataModel.readOne(params, pipImageSetsCache.onImageSetUpdate(params, successCallback), errorCallback);
                },

                updateImageSet: function (params, successCallback, errorCallback) {
                    params.resource = 'image_sets';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    return pipDataModel.update(
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
                        pipImageSetsCache.onImageSetCreate(params, successCallback),
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
                            pipImageSetsCache.onImageSetCreate(params, successCallback),
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
        };
    });

})();
