/**
 * @file Users data model
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipUsersData', ['pipRest']);

    thisModule.provider('pipUsersData', function () {

        this.readUsersResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.users().page({
                    party_id: $stateParams.id,
                    paging: $stateParams.paging || 1,
                    skip: $stateParams.skip || 0,
                    take: $stateParams.take || 15
                }).$promise;
            };
        };

        this.readUserResolver = function () {
            return /* @ngInject */ function ($stateParams, pipRest) {
                return pipRest.users().get({
                    id: $stateParams.id,
                    party_id: pipRest.partyId($stateParams)
                }).$promise;

            };
        };

        this.readActivitiesUserResolver = /* @ngInject */
            function ($stateParams, pipRest, $rootScope) {
                return pipRest.partyActivities().page({
                    party_id: $rootScope.$user.id,
                    paging: 1,
                    skip: 0,
                    take: 25
                }).$promise;
            };

        // CRUD operations and other business methods
        this.$get = function (pipRest, $stateParams, pipDataModel) {   
            return {
                partyId: pipRest.partyId,

                readUsers: function (params, transaction, successCallback, errorCallback) {
                    return pipRest.users().page(
                        {
                            party_id: pipRest.partyId($stateParams),
                            paging: 1,
                            skip: params.start || params.item.skip || 0,
                            search: params.item.search ,
                            active: params.item.active,
                            paid: params.item.paid,
                            admin: params.item.admin,
                            take: 15
                        },
                        function (pagedUsers) {
                            if (successCallback) successCallback(pagedUsers);
                        },
                        function (error) {
                            errorCallback(error);
                        }
                    );
                },

                readUser: function (params, successCallback, errorCallback) {
                    params.resource = 'users';
                    params.item = params.item || {};
                    params.item.party_id = pipRest.partyId($stateParams);
                    params.item.id = params.item.id || $stateParams.id;
                    return pipDataModel.readOne(params, successCallback, errorCallback);
                },
                
                updateUser: function (item, transaction, successCallback, errorCallback) {
                    pipRest.users().update(
                        item.item,
                        function (updatedItem) {
                            if (successCallback) successCallback(updatedItem);
                        },
                        function (error) {
                            errorCallback(error);
                        }
                    );
                }

            }
        };
    });

})();