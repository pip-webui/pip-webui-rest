/**
 * @file Tags data cache
 * @copyright Digital Living Software Corp. 2014-2016
 */

/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipTagsCache', ['pipUtils', 'pipDataCache']);

    thisModule.service('pipTagsCache',
        function(pipTags, pipDataCache) {
            return {
                readTags: readTags,
                // Todo: Add updateTags method
                onTagsUpdate: onTagsUpdate,
                tagsUpdateDecorator: tagsUpdateDecorator
            };
			//------------------------------

            function tagsUpdate(params, item) {
                // Extract tag from updated entity
                var tags = item ? pipTags.extractTags(item) : [];
                if (tags.length == 0) return;

                var cacheName = 'partyTags';
                if (params && params.party_id !== null && params.party_id !== undefined)
                    cacheName = cacheName + '_' + params.party_id;
                else if (params && params.item && params.item.party_id !== null && params.item.party_id !== undefined)
                    cacheName = cacheName + '_' + params.item.party_id;

                // Todo: this is a wrong way to get party_id (contributor) from entities
                var data = pipDataCache.retrieve(cacheName);

                // If tags are stored
                if (data) {
                    _.each(tags, function(tag) {
                        // Find if tag already exists
                        var t = _.find(data.tags, function(t) {
                            return pipTags.equalTags(t.tag, tag);
                        });

                        // Otherwise add a new tag
                        if (t) {
                            t.tag = tag;
                            t.count = t.count + 1;
                            t.used = new Date();
                        } else {
                            if (!data.tags)
                                data.tags = [];
								
                            data.tags.push({
                                tag: tag,
                                count: 1,
                                used: new Date()
                            });
                        }
                    });
                    pipDataCache.store(cacheName, data);
                }
            };

            function tagsUpdateDecorator(params, successCallback) {
                return function(item) {
                    tagsUpdate(params, item);

                    if (successCallback) successCallback(item);
                };
            };

			function readTags(params, successCallback, errorCallback) {
				params.resource = 'partyTags';
				params.singleResult = true;

				return pipDataCache.retrieveOrLoad(params, successCallback, errorCallback);
			};

			// Todo: Add updateTags method

			function onTagsUpdate(params, successCallback) {
				return tagsUpdateDecorator(params, successCallback);
			};
        }
    );

})();

