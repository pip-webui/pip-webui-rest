/**
 * @file Registration of all data modules
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    angular.module('pipData', [
		'pipDataModel',
		'pipDataCache',
       
        'pipSessionData',
    ]);
    
})();