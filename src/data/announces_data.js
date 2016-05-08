/**
 * @file Announces data model
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global angular */
 
(function () {
    'use strict';

    var thisModule = angular.module('pipAnnouncesData', ['pipRest', 'pipDataModel']);

    thisModule.provider('pipAnnouncesData', function () {

        // Read all announces
        this.readAnnouncesResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest, pipEnums) {
                return pipRest.announces().query().$promise;
            };
        };

        this.readCompletedAnnouncesResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest, pipEnums) {
                return pipRest.announces().query( {
                        status: pipEnums.EXECUTION_STATUS.COMPLETED
                    }
                ).$promise;
            };
        };

        this.readAnnounceResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.announces().get({
                    id: $stateParams.id
                }).$promise;
            };
        };

        // CRUD operations and other business methods
        this.$get = function (pipRest, $stateParams, pipDataModel) {
            return {
                partyId: pipRest.partyId,

                updateAnnounce: function (params, successCallback, errorCallback) {
                    params.resource = 'announces';
                    params.skipTransactionBegin = true;
                    params.skipTransactionEnd = false;
                    pipDataModel.update(
                        params,
                        successCallback,
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
                            successCallback,
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
                            successCallback,
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
                        successCallback,
                        errorCallback
                    );
                },

                deleteAnnounce: function(params, successCallback, errorCallback) {
                    params.resource = 'announces';
                    pipDataModel.remove(params, successCallback, errorCallback);
                }
            }
        };
    });

})();