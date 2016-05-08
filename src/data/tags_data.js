/**
 * @file Tags data model
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipTagsData', ['pipRest' , 'pipDataModel', 'pipTagsCache']);

    thisModule.provider('pipTagsData', function() {
        
        this.readTagsResolver = function() {
            return /* @ngInject */ function($stateParams, pipRest, pipTagsCache) {
                return pipTagsCache.readTags({
                    item: { party_id: pipRest.partyId($stateParams) }
                });
            };
        };

        this.$get = function($stateParams, $state, pipRest, pipDataModel, pipTagsCache) {
            return {
                partyId: pipRest.partyId,
                
                readTags: function(params, successCallback, errorCallback) {
                    pipTagsCache.readTags(params, successCallback, errorCallback);
                }
            }
        };
    });

})();
