/**
 * @file User access permissions service
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipRest.Access', ['pipUtils', 'pipRest.Enums']);

    thisModule.factory('pipAccess', function (pipUtils, pipEnums) {

        function defaultAccess(account) {
            // Clone and set default values
            var user = _.defaults(
                {
                    // Fix id
                    id: account.id || account._id,
                    party_id: null,
                    party_name: null,
                    type: null,
                    owner: false,
                    manager: false,
                    contributor: false,
                    share_level: pipEnums.SHARE_LEVEL.WORLD
                },
                account
            );
    
            delete user._id;
    
            return user;
        };
    
        function fixAccess(user) {
            // Owner acts as his own manager
            user.manager = user.manager || user.owner;
    
            // Manager has contributor rights
            user.contributor = user.contributor || user.manager;
    
            // Managers and contributors can access at private level
            if (user.contributor)
                user.share_level = pipEnums.SHARE_LEVEL.PRIVATE;
    
            return user;
        }
    
        function overrideAccess(user, access) {
            // Copy over override
            user.party_id = access.party_id;
            user.party_name = access.party_name;
            user.type = access.type;
            user.owner = !!access.owner;
            user.manager = !!access.manager;
            user.contributor = !!access.contributor;
            user.share_level = access.share_level || pipEnums.SHARE_LEVEL.WORLD;
    
            // Party can be set as an object
            if (access.party) {
                user.party_id = access.party.id || access.party._id;
                user.party_name = access.party.name;
            }
    
            // Make access settings consistent and return
            return fixAccess(user);
        };
    
        function asOwner(account) {
            // Skip if no account set
            if (account == null) return undefined;
    
            // Construct default user
            var user = defaultAccess(account);
    
            // Set owner access rights
            user.party_id = user.id;
            user.party_name = user.name;
            user.type = null;
            user.owner = true;
            user.manager = true;
            user.contributor = true;
            user.share_level = pipEnums.SHARE_LEVEL.PRIVATE;
    
            return user;
        };
    
        function toParty(account, party) {
            // Skip if no account set
            if (account == null) return undefined;
    
            // If no party set then assume owner access
            if (party == null) return asOwner(account);
    
            var 
                userId = account.id || account._id,
                partyId = party.id || party._id || party,
                partyName = party.name || account.name;
    
            // If user and party are the same then
            if (userId == partyId) return asOwner(account);
    
            // Set default values
            var user = defaultAccess(account);
            user.party_id = partyId;
            user.party_name = partyName;
    
            // Identify maximum access level
            _.each(user.party_access, function (access) {
                if (pipUtils.equalObjectIds(partyId, access.party_id)) {
                    user.party_name = access.party_name;
                    user.type = access.type;
                    user.manager = user.manager || access.manager;
                    user.contributor = user.contributor || access.contributor;
                    user.share_level = Math.max(user.share_level, access.share_level);
                }
            });
    
            // Make access settings consistent and return
            return fixAccess(user);
        };
    
        // Can be used for testing
        function override(account, access) {
            // Skip if no account set
            if (account == null) return undefined;
    
            // Set default values
            var user = defaultAccess(account);
    
            // If no override return plain user
            if (access) overrideAccess(user, access);
    
            return user;
        };
    
        // Can be used for testing
        function toPartyWithOverride(account, party, access) {
            var user = toParty(account, party);
    
            // If no override return plain user
            if (access) overrideAccess(user, access);
    
            return user;
        };
        
        return {
            asOwner: asOwner,
            toParty: toParty,
            override: override,
            toPartyWithOverride: toPartyWithOverride
        };
    });

})();
