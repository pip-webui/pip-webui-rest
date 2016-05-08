/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appRestServices.Cache', []);

    thisModule.controller('CacheController',
        function($scope) {

            $scope.processing = false;

            return ;


        }
    );

    thisModule.controller('SettingsCacheController',
        function($scope, $rootScope, pipTestDataSet, pipSessionCache, pipSettingsData, pipSession) {

            $scope.titleArray = ['', 'Settings loaded', 'Actual data', 'Settings1', 'Settings2', 'Cash cleared'];

            $scope.processing = false;
            $scope.titleIndex = 0;
            $scope.settigsCacheLoaded = false;

            $scope.settings1 = _.cloneDeep(pipTestDataSet.SETTINGS1);
            $scope.settings2 = _.cloneDeep(pipTestDataSet.SETTINGS2);

            $scope.showedObject = {};

            $scope.showSettingsCache = showSettingsCache;
            $scope.loadSettingsCache = loadSettingsCache;
            $scope.showSettings1 = showSettings1;
            $scope.showSettings2 = showSettings2;
            $scope.saveToCacheSettings1 = saveToCacheSettings1;
            $scope.saveToCacheSettings2 = saveToCacheSettings2;
            $scope.resetSettings = resetSettings;
            $scope.clearSettingsCache = clearSettingsCache;
            $scope.saveSettings = saveSettings;

            return ;

            function showSettingsCache() {
                $scope.showedObject = $scope.settings || {};
                $scope.titleIndex = 1;
            };

            function clearSettingsCache() {
                pipSessionCache.clear();
                $scope.showedObject = {};
                $scope.settings = {};
                $scope.titleIndex = 5;
            };

            function loadSettingsCache() {
                $scope.processing = true;
                pipSessionCache.readSettings(
                    function(settings) {
                        $scope.settings = settings;
                        // for recover
                        $scope.storedSettings = _.cloneDeep(settings);
                        $scope.settigsCacheLoaded = true;
                        showSettingsCache();
                        $scope.processing = false;
                    },
                    function(error) {
                        console.log('error: ', error);
                    }
                );
            };

            function showSettings1() {
                $scope.showedObject = $scope.settings1 || {};
                $scope.titleIndex = 2;
            };

            function showSettings2() {
                $scope.showedObject = $scope.settings2 || {};
                $scope.titleIndex = 3;
            };

            function saveToCacheSettings1() {
                $scope.processing = true;

                var keys, //= 'visions',
                    settings = keys ? _.pick($scope.settings1, keys) : $scope.settings1;
                settings.party_id = pipSession.userId();

                pipSessionCache.onSettingsUpdate(
                    settings,
                    function(result) {
                        $scope.settings = result;
                        $scope.showedObject = result;
                        // for recover
                        $scope.settigsCacheLoaded = true;
                        $scope.titleIndex = 1;
                        $scope.processing = false;
                    }
                );
            };

            function saveToCacheSettings2() {
                $scope.processing = true;

                var keys, // = 'goals',
                    settings = keys ? _.pick($scope.settings2, keys) : $scope.settings2;
                settings.party_id = pipSession.userId();

                pipSessionCache.onSettingsUpdate(
                    settings,
                    function(result) {
                        $scope.settings = result;
                        $scope.settigsCacheLoaded = true;
                        saveSettings();
                        $scope.processing = false;
                    }
                );
            };

            function saveSettings() {
                $scope.processing = true;
                pipSettingsData.saveSettings(
                    $scope.settings,
                    null,
                    function(setting){
                        $scope.processing = false;
                        showSettingsCache();
                    },
                    function (error) {
                        $scope.processing = false;
                    }
                );
            };

            function resetSettings() {
                $scope.settings = {};
                saveSettings();
            };

        }
    );

})();
