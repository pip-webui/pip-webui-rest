/**
 * @file Session data model
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipSessionData', ['pipRest', 'pipSessionCache']);

    thisModule.provider('pipSessionData', function() {

        this.readUserResolver = /* @ngInject */ readUserResolver;
        this.readPartyResolver = /* @ngInject */ readPartyResolver;
        this.readConnectionResolver = /* @ngInject */ readConnectionResolver;
        this.readSettingsResolver = /* @ngInject */ readSettingsResolver;

        this.readSessionsUserResolver = /* @ngInject */ readSessionsUserResolver;
        this.readSessionIdResolver = /* @ngInject */ readSessionIdResolver;

        this.$get = function($rootScope, $stateParams, pipRest, pipDataModel) {
            return {
                getSessionId: getSessionId,
                removeSession: removeSession,
                readSessionsUser: function (params, successCallback, errorCallback) {
                    params.resource = 'userSessions';
                    params.item = params.item || {};
                    params.item.party_id = $stateParams.id;
                    params.party_id = $stateParams.id;
                    return pipDataModel.readOne(params, successCallback, errorCallback);

                }
            };

            function getSessionId(pipSession){
                return function () {
                    return pipSession.sessionId();
                };
            };

            function removeSession(transaction, session, successCallback, errorCallback) {
                var tid = transaction.begin('REMOVING');
                if (!tid) return;

                pipRest.userSessions().remove(
                    {
                        id: session.id,
                        party_id: $stateParams.id
                    },
                    function (removedSession) {
                        if (transaction.aborted(tid)) return;
                        else transaction.end();

                        if (successCallback) successCallback(removedSession);
                    },
                    function (error) {
                        transaction.end(error);
                        if (errorCallback) errorCallback(error);
                    }
                );
            };
            
        };
        //--------------

        function readUserResolver(pipSessionCache) {
            return pipSessionCache.readUser();                             
        };

        function readPartyResolver(pipSessionCache, $stateParams) {
            return pipSessionCache.readParty($stateParams);
        };

        function readConnectionResolver(pipSessionCache, $stateParams) {
            return pipSessionCache.readConnection($stateParams);
        };

        function readSettingsResolver(pipSessionCache) {
            return pipSessionCache.readSettings();                             
        };

        function readSessionsUserResolver($stateParams, pipRest, $rootScope) {
            return pipRest.userSessions().query({
                party_id: $stateParams.id
            }).$promise;
        };

        function readSessionIdResolver($stateParams, pipSession) {
            return pipSession.sessionId();
        };
        
    });

})();
