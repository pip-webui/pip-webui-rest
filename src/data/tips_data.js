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
        this.$get = function (pipRest, $stateParams, pipDataModel) {

            return {
                partyId: pipRest.partyId,

                readTips: function (params, transaction, successCallback, errorCallback) {
                    params.resource = 'tips';

                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    params.item.search = $stateParams.search;
                    params.item.tags = $stateParams.search;

                    params.item.party_id = pipRest.partyId($stateParams);
                    params.item.take = PAGE_SIZE;
                    params.item.paging = 1;

                    pipDataModel.page(
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
