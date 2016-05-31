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
                    params = params || {};
                    params.item = params.item || {};
                    if(params.item.party_id == null) {
                        params.item.party_id = pipRest.partyId($stateParams);
                    }
                    return pipTagsCache.readTags(params, successCallback, errorCallback);
                }
            }
        };
    });

})();
