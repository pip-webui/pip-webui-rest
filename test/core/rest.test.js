'use strict';

describe('pipRest', function () {

    var $httpBackend, pipRest;

    //beforeEach(module('pipRest'));

    beforeEach(module('pipRest'));

    beforeEach(inject(function(_pipRest_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        pipRest = _pipRest_;
    }));


    afterEach(function() {
        //$httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('pipRest, general functions', function () {
        it('should be able value of serverUrl', function (done) {
            assert.isDefined(pipRest.serverUrl());
            assert.equal(pipRest.serverUrl(), 'http://alpha.pipservices.net');
            //pipRest.serverUrl(null);
            //assert.isNull(pipRest.serverUrl());
            done();
        });

        it('should be able version', function (done) {
            assert.isDefined(pipRest.version());
            assert.equal(pipRest.version(), '1.0');
            pipRest.version('2.0');
            assert.equal(pipRest.version(), '2.0');
            done();
        });

        it('should be able creation functions', function (done) {
            assert.isDefined(pipRest.createResource());
            assert.isDefined(pipRest.createOperation());
            assert.isDefined(pipRest.createCollection());
            assert.isDefined(pipRest.createPagedCollection());
            assert.isDefined(pipRest.createPartyCollection());

            done();
        });

        it('userId', function (done) {
            pipRest.session(null, null); // set userId = null
            assert.isNull(pipRest.userId());
            pipRest.session('111', null); // set userId = null
            assert.equal(pipRest.userId(), '111');
            pipRest.session(); // set userId = null
            assert.isUndefined(pipRest.userId());

            done();
        });

        it('sessionId', function (done) {
            pipRest.session(null, null); // set sessionId = null
            assert.isNull(pipRest.sessionId());
            pipRest.session(null, '111');
            assert.equal(pipRest.sessionId(), '111');
            pipRest.session();
            assert.isUndefined(pipRest.sessionId());
            done();
        });

        it('partyId', function (done) {
            pipRest.session(null, null); // set sessionId = null
            assert.isNull(pipRest.partyId({}));
            assert.equal(pipRest.partyId({party_id: 111}), 111);
            pipRest.session(222, null); // set sessionId = null
            assert.equal(pipRest.partyId({}), 222);
            assert.equal(pipRest.partyId({party_id: 111}), 111);
            assert.equal(pipRest.partyId({id: 111}), 222);
            done();
        });

    });

    describe('pipRest, landing functions', function () {

        it('about', function (done) {
            var res = pipRest.about('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('signin', function (done) {
            var res = pipRest.signin('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('signout', function (done) {
            var res = pipRest.signout('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('signup', function (done) {
            var res = pipRest.signup('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('recoverPassword', function (done) {
            var res = pipRest.recoverPassword('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('resetPassword', function (done) {
            var res = pipRest.resetPassword('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('changePassword', function (done) {
            var res = pipRest.changePassword('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('requestEmailVerification', function (done) {
            var res = pipRest.requestEmailVerification('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('verifyEmail', function (done) {
            var res = pipRest.verifyEmail('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('signupValidate', function (done) {
            var res = pipRest.signupValidate('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest, users and parties functions', function () {

        it('users', function (done) {
            var res = pipRest.users('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('currentUser', function (done) {
            var res = pipRest.currentUser('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('userSessions', function (done) {
            var res = pipRest.userSessions('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('parties', function (done) {
            var res = pipRest.parties('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('signupValidate', function (done) {
            var res = pipRest.signupValidate('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('inviteParty', function (done) {
            var res = pipRest.inviteParty('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('partyActivities', function (done) {
            var res = pipRest.partyActivities('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('partySettings', function (done) {
            var res = pipRest.partySettings('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('partyTags', function (done) {
            var res = pipRest.partyTags('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest, activities functions', function () {

        it('serverActivities', function (done) {
            var res = pipRest.serverActivities('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: connections, partners, members, following and followers functions', function () {

        it('connectionBlocks', function (done) {
            var res = pipRest.connectionBlocks('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('connectionSuggestions', function (done) {
            var res = pipRest.connectionSuggestions('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('connections', function (done) {
            var res = pipRest.connections('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('partners', function (done) {
            var res = pipRest.partners('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('acceptPartner', function (done) {
            var res = pipRest.acceptPartner('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('members', function (done) {
            var res = pipRest.members('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('acceptMember', function (done) {
            var res = pipRest.acceptMember('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('following', function (done) {
            var res = pipRest.following('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('followers', function (done) {
            var res = pipRest.followers('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: groups, contacts  functions', function () {

        it('groups', function (done) {
            var res = pipRest.groups('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('contacts', function (done) {
            var res = pipRest.contacts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('getOwnContacts', function (done) {
            var res = pipRest.getOwnContacts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('quotes', function (done) {
            var res = pipRest.quotes('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('randomQuote', function (done) {
            var res = pipRest.randomQuote('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: guides functions', function () {

        it('guides', function (done) {
            var res = pipRest.guides('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });
    });

    describe('pipRest: images functions', function () {

        it('image_sets', function (done) {
            var res = pipRest.image_sets('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('images', function (done) {
            var res = pipRest.images('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest, notes functions', function () {

        it('notes', function (done) {
            var res = pipRest.notes('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('noteContribManage', function (done) {
            var res = pipRest.noteContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest, feedbacks functions', function () {

        it('feedbacks', function (done) {
            var res = pipRest.feedbacks('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest, news and feeds functions', function () {

        it('feeds', function (done) {
            var res = pipRest.feeds('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('publicPosts', function (done) {
            var res = pipRest.publicPosts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('posts', function (done) {
            var res = pipRest.posts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('allFeedPosts', function (done) {
            var res = pipRest.allFeedPosts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('feedPosts', function (done) {
            var res = pipRest.feedPosts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('postComments', function (done) {
            var res = pipRest.postComments('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('postCheers', function (done) {
            var res = pipRest.postCheers('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('postBoos', function (done) {
            var res = pipRest.postBoos('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: events functions', function () {

        it('events', function (done) {
            var res = pipRest.events('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('acceptEvent', function (done) {
            var res = pipRest.acceptEvent('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('rejectEvent', function (done) {
            var res = pipRest.rejectEvent('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('eventContribManage', function (done) {
            var res = pipRest.eventContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: visions functions', function () {

        it('visions', function (done) {
            var res = pipRest.visions('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('acceptVision', function (done) {
            var res = pipRest.acceptVision('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('visionContribManage', function (done) {
            var res = pipRest.visionContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: messages functions', function () {

        it('messages', function (done) {
            var res = pipRest.messages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('receivedMessages', function (done) {
            var res = pipRest.receivedMessages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('receivedManagedMessages', function (done) {
            var res = pipRest.receivedManagedMessages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('sentMessages', function (done) {
            var res = pipRest.sentMessages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('viewMessage', function (done) {
            var res = pipRest.viewMessage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('sentManagedMessages', function (done) {
            var res = pipRest.sentManagedMessages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: notifications functions', function () {

        it('notifications', function (done) {
            var res = pipRest.notifications('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('managedNotifications', function (done) {
            var res = pipRest.managedNotifications('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: areas functions', function () {

        it('areas', function (done) {
            var res = pipRest.areas('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('acceptArea', function (done) {
            var res = pipRest.acceptArea('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('rejectArea', function (done) {
            var res = pipRest.rejectArea('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('areaContribManage', function (done) {
            var res = pipRest.areaContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: goals functions', function () {

        it('goals', function (done) {
            var res = pipRest.goals('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('acceptGoal', function (done) {
            var res = pipRest.acceptGoal('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('rejectGoal', function (done) {
            var res = pipRest.rejectGoal('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('goalContribManage', function (done) {
            var res = pipRest.goalContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: support cases functions', function () {

        it('partySupportCases', function (done) {
            var res = pipRest.partySupportCases('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        it('supportCases', function (done) {
            var res = pipRest.supportCases('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: announces functions', function () {

        it('announces', function (done) {
            var res = pipRest.announces('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    describe('pipRest: stats functions', function () {

        it('stats', function (done) {
            var res = pipRest.stats('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

});
