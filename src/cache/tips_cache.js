/**
 * @file Tips data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipTipsCache', ['pipTipsData']);

    thisModule.service('pipTipsCache',
        function (pipEnums, pipDataCache) {

            return {
                readTips: readTips,
                onTipCreate: onTipCreate,
                onTipUpdate: onTipUpdate,
                onTipDelete: onTipDelete                
            };

            function readTips(params, successCallback, errorCallback) {
                params = params || {};
                params.resource = 'tips';
                params.item = params.item || {};

                return pipDataCache.retrieveOrLoad(params, successCallback, errorCallback);
            };
            
            function onTipCreate(params, successCallback) {
                return pipDataCache.addDecorator(
                    'tips', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            };

            function onTipUpdate(params, successCallback) {
                return pipDataCache.updateDecorator(
                    'tips', params,
                    pipTagsCache.tagsUpdateDecorator(params, successCallback)
                );
            };

            function onTipDelete(params, successCallback) {
                return pipDataCache.removeDecorator('tips', params, successCallback);
            };
                        
        }
    );

})();

