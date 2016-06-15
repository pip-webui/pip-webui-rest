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
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.guides().query().$promise;
            };
        };
        
        this.readIntroGuidesResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.guides().query({
                        type: 'intro',
                        status : 'completed'
                }).$promise;
            };
        };

        this.readGuideResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.guides().get({
                    id: $stateParams.id || '55bf23d3bb22aa175c3e498e'
                }).$promise;
            };
        };

        // CRUD operations and other business methods
        this.$get = function (pipRest, $stateParams, pipDataModel, pipGuidesCache) {
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
        };
    });

})();