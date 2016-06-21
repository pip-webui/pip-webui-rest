'use strict';

describe('pipAccess', function () {
    var
        pipEnums, pipAccess, 
        ACCOUNT1 = {
            _id: 1,
            name: 'User 1',
            admin: false,
            paid: true,
            party_access: [
                {
                    party_id: 2,
                    party_name: 'User 2',
                    manager: true,
                    contributor: false,
                    share_level: 2
                }
            ]
        },
        ACCOUNT2 = {
            _id: 2,
            name: 'User 2'
        },
        ACCOUNT3 = {
            _id: 3,
            name: 'User 3'
        };

    beforeEach(module('ui.router'));
    beforeEach(module('pipRest.Enums'));
    beforeEach(module('pipRest.Access'));

    beforeEach(inject(function($injector) {
       pipEnums = $injector.get('pipEnums');
       pipAccess = $injector.get('pipAccess');       
    }));


    it('define owner access', function (done) {
        var user1 = pipAccess.asOwner(ACCOUNT1);

        assert.equal(user1.id, ACCOUNT1._id);
        assert.equal(user1.name, ACCOUNT1.name);
        assert.isUndefined(user1._id);
        assert.isFalse(user1.admin);
        assert.isTrue(user1.paid);
        assert.equal(user1.party_id, user1.id);
        assert.equal(user1.party_name, user1.name);
        assert.isTrue(user1.owner);
        assert.isTrue(user1.manager);
        assert.isTrue(user1.contributor);
        assert.equal(user1.share_level, pipEnums.SHARE_LEVEL.PRIVATE);

        done();
    });

    it('define party access', function (done) {
        var user1 = pipAccess.toParty(ACCOUNT1, ACCOUNT2);

        assert.equal(user1.id, ACCOUNT1._id);
        assert.equal(user1.name, ACCOUNT1.name);
        assert.isUndefined(user1._id);
        assert.isFalse(user1.admin);
        assert.isTrue(user1.paid);
        assert.equal(user1.party_id, ACCOUNT2._id);
        assert.equal(user1.party_name, ACCOUNT2.name);
        assert.isFalse(user1.owner);
        assert.isTrue(user1.manager);
        assert.isTrue(user1.contributor);
        assert.equal(user1.share_level, pipEnums.SHARE_LEVEL.PRIVATE);

        done();
    });

    it('override access', function (done) {
        var user1 = pipAccess.override(
            ACCOUNT1, 
            {
                party: ACCOUNT2,
                owner: false,
                manager: false,
                contributor: false,
                share_level: pipEnums.SHARE_LEVEL.INNER
            }
        );

        assert.equal(user1.id, ACCOUNT1._id);
        assert.equal(user1.name, ACCOUNT1.name);
        assert.isUndefined(user1._id);
        assert.isFalse(user1.admin);
        assert.isTrue(user1.paid);
        assert.equal(user1.party_id, ACCOUNT2._id);
        assert.equal(user1.party_name, ACCOUNT2.name);
        assert.isFalse(user1.owner);
        assert.isFalse(user1.manager);
        assert.isFalse(user1.contributor);
        assert.equal(user1.share_level, pipEnums.SHARE_LEVEL.INNER);

        done();
    });

    it('define party access with override', function (done) {
        var user1 = pipAccess.toPartyWithOverride(ACCOUNT1, ACCOUNT2, {
            party: ACCOUNT3,
            owner: false,
            manager: false,
            contributor: false,
            share_level: pipEnums.SHARE_LEVEL.INNER
        });

        assert.equal(user1.id, ACCOUNT1._id);
        assert.equal(user1.name, ACCOUNT1.name);
        assert.isUndefined(user1._id);
        assert.isFalse(user1.admin);
        assert.isTrue(user1.paid);
        assert.equal(user1.party_id, ACCOUNT3._id);
        assert.equal(user1.party_name, ACCOUNT3.name);
        assert.isFalse(user1.owner);
        assert.isFalse(user1.manager);
        assert.isFalse(user1.contributor);
        assert.equal(user1.share_level, pipEnums.SHARE_LEVEL.INNER);

        done();
    });
});
