/**
 * @file Feedbacks data model
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipFeedbacksData', ['pipRest', 'pipDataModel']);

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

        this.$get = function($stateParams, pipRest, pipDataModel) {
            return {

                sendFeedback: function(params, successCallback, errorCallback) {
                    params.resource = 'feedbacks';
                    pipDataModel.create(params, successCallback, errorCallback);
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
