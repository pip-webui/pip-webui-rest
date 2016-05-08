/**
 * @file Settings data model
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo Rewrite, use cached settings, remove unrelated methods
 */

/* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipSettingsData', ['pipRest', 'pipSessionData', 'pipSessionCache', 'pipDataModel']);

    thisModule.provider('pipSettingsData', function(pipSessionDataProvider) {

        this.readSettingsResolver = pipSessionDataProvider.readSettingsResolver;

        this.$get = function($rootScope, $stateParams, pipRest, pipSessionCache, pipSession, pipDataModel) {
            return {
                // Saving generic settings
                saveSettings: saveSettings,

                readSettings: readSettings,

                reReadSettings: reReadSettings

            };

            function readSettings(successCallback, errorCallback) {
                pipSessionCache.readSettings(successCallback, errorCallback)
            };

            // force read settings from server and update cache
            function reReadSettings(successCallback, errorCallback) {
                pipRest.partySettings().get(
                    {
                        party_id: pipSession.userId()
                    },
                    function (settings) {
                        settings = settings || {};
                        pipSessionCache.onSettingsUpdate(settings);
                        if (successCallback) successCallback(settings);
                    },
                    errorCallback
                );
            };

            function saveSettings(settings, keys, successCallback, errorCallback) {
                // Extract specific keys
                settings = keys ? _.pick(settings, keys) : settings;
                settings.party_id = pipSession.userId();
                var oldSettings = _.cloneDeep($rootScope.$settings);
                pipSessionCache.onSettingsUpdate(settings);

                var params = {};
                params.resource = 'partySettings';
                params.item = settings;
                params.item.creator_id = pipSession.userId();

                pipDataModel.create(
                    params,
                    successCallback,
                    function(error) {
                        pipSessionCache.onSettingsUpdate(oldSettings);

                        if (errorCallback) errorCallback(error);
                    }
                );
            };
        };
    });

})();
