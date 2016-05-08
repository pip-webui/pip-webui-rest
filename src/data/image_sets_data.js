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
        this.$get = function (pipRest, $stateParams, pipDataModel) {

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
        };
    });

})();
