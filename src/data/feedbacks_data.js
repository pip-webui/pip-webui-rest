/**
 * @file Feedbacks data model
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipFeedbacksData', ['pipRest', 'pipDataModel', 'pipFeedbacksCache']);

    thisModule.provider('pipFeedbacksData', function() {

        this.readFeedbacksResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.feedbacks().query().$promise;
            };
        };

        this.readFeedbackResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.feedbacks().get({
                    id: $stateParams.id
                }).$promise;
            };
        };

        this.$get = function($stateParams, pipRest, pipDataModel, pipFeedbacksCache) {
            return {

                sendFeedback: function(params, successCallback, errorCallback) {
                    params.resource = 'feedbacks';
                    pipDataModel.create(params, successCallback, errorCallback);
                },

                readFeedbacks: function (params, successCallback, errorCallback) {
                    params.resource = 'feedbacks';
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    
                    return pipFeedbacksCache.readFeedbacks(params, successCallback, errorCallback);
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
        };
    });

})();
