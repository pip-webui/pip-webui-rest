/**
 * @file Feedbacks data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipFeedbacksCache', ['pipFeedbacksData']);

    thisModule.service('pipFeedbacksCache',
        function (pipEnums, pipDataCache, pipTagsCache) {

            return {
                readFeedbacks: readFeedbacks,
                onFeedbackCreate: onFeedbackCreate,
                onFeedbackUpdate: onFeedbackUpdate,
                onFeedbackDelete: onFeedbackDelete                
            };

            function readFeedbacks(params, successCallback, errorCallback) {
                params = params || {};
                params.resource = 'feedbacks';
                params.item = params.item || {};

                return pipDataCache.retrieveOrLoad(params, successCallback, errorCallback);
            };
            
            function onFeedbackCreate(params, successCallback) {
                return pipDataCache.addDecorator(
                    'feedbacks', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            };

            function onFeedbackUpdate(params, successCallback) {
                return pipDataCache.updateDecorator(
                    'feedbacks', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            };

            function onFeedbackDelete(params, successCallback) {
                return pipDataCache.removeDecorator('feedbacks', params, successCallback);
            };
                        
        }
    );

})();

