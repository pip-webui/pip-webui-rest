'use strict';

suite('pipRest', function () {

    var $httpBackend, pipRest;

    //suiteSetup(module('pipRest'));

    setup(module('pipRest'));

    setup(inject(function(_pipRest_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        pipRest = _pipRest_;
    }));


    suiteTeardown(function() {
        //$httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    suite('pipRest, general functions', function () {
        test('should be able value of serverUrl', function (done) {
            assert.isDefined(pipRest.serverUrl());
            assert.equal(pipRest.serverUrl(), 'http://alpha.pipservices.net');
            //pipRest.serverUrl(null);
            //assert.isNull(pipRest.serverUrl());
            done();
        });

        test('should be able version', function (done) {
            assert.isDefined(pipRest.version());
            assert.equal(pipRest.version(), '1.0');
            pipRest.version('2.0');
            assert.equal(pipRest.version(), '2.0');
            done();
        });

        test('should be able creation functions', function (done) {
            assert.isDefined(pipRest.createResource());
            assert.isDefined(pipRest.createOperation());
            assert.isDefined(pipRest.createCollection());
            assert.isDefined(pipRest.createPagedCollection());
            assert.isDefined(pipRest.createPartyCollection());

            done();
        });

        test('userId', function (done) {
            pipRest.session(null, null); // set userId = null
            assert.isNull(pipRest.userId());
            pipRest.session('111', null); // set userId = null
            assert.equal(pipRest.userId(), '111');
            pipRest.session(); // set userId = null
            assert.isUndefined(pipRest.userId());

            done();
        });

        test('sessionId', function (done) {
            pipRest.session(null, null); // set sessionId = null
            assert.isNull(pipRest.sessionId());
            pipRest.session(null, '111');
            assert.equal(pipRest.sessionId(), '111');
            pipRest.session();
            assert.isUndefined(pipRest.sessionId());
            done();
        });

        test('partyId', function (done) {
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

    suite('pipRest, landing functions', function () {

        test('about', function (done) {
            var res = pipRest.about('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('signin', function (done) {
            var res = pipRest.signin('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('signout', function (done) {
            var res = pipRest.signout('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('signup', function (done) {
            var res = pipRest.signup('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('recoverPassword', function (done) {
            var res = pipRest.recoverPassword('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('resetPassword', function (done) {
            var res = pipRest.resetPassword('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('changePassword', function (done) {
            var res = pipRest.changePassword('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('requestEmailVerification', function (done) {
            var res = pipRest.requestEmailVerification('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('verifyEmail', function (done) {
            var res = pipRest.verifyEmail('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('signupValidate', function (done) {
            var res = pipRest.signupValidate('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest, users and parties functions', function () {

        test('users', function (done) {
            var res = pipRest.users('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('currentUser', function (done) {
            var res = pipRest.currentUser('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('userSessions', function (done) {
            var res = pipRest.userSessions('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('parties', function (done) {
            var res = pipRest.parties('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('signupValidate', function (done) {
            var res = pipRest.signupValidate('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('inviteParty', function (done) {
            var res = pipRest.inviteParty('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('partyActivities', function (done) {
            var res = pipRest.partyActivities('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('partySettings', function (done) {
            var res = pipRest.partySettings('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('partyTags', function (done) {
            var res = pipRest.partyTags('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest, activities functions', function () {

        test('serverActivities', function (done) {
            var res = pipRest.serverActivities('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: connections, partners, members, following and followers functions', function () {

        test('connectionBlocks', function (done) {
            var res = pipRest.connectionBlocks('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('connectionSuggestions', function (done) {
            var res = pipRest.connectionSuggestions('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('connections', function (done) {
            var res = pipRest.connections('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('partners', function (done) {
            var res = pipRest.partners('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('acceptPartner', function (done) {
            var res = pipRest.acceptPartner('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('members', function (done) {
            var res = pipRest.members('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('acceptMember', function (done) {
            var res = pipRest.acceptMember('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('following', function (done) {
            var res = pipRest.following('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('followers', function (done) {
            var res = pipRest.followers('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: groups, contacts  functions', function () {

        test('groups', function (done) {
            var res = pipRest.groups('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('contacts', function (done) {
            var res = pipRest.contacts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('getOwnContacts', function (done) {
            var res = pipRest.getOwnContacts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('quotes', function (done) {
            var res = pipRest.quotes('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('randomQuote', function (done) {
            var res = pipRest.randomQuote('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: guides functions', function () {

        test('guides', function (done) {
            var res = pipRest.guides('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });
    });

    suite('pipRest: images functions', function () {

        test('image_sets', function (done) {
            var res = pipRest.image_sets('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('images', function (done) {
            var res = pipRest.images('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest, notes functions', function () {

        test('notes', function (done) {
            var res = pipRest.notes('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('noteContribManage', function (done) {
            var res = pipRest.noteContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest, feedbacks functions', function () {

        test('feedbacks', function (done) {
            var res = pipRest.feedbacks('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest, news and feeds functions', function () {

        test('feeds', function (done) {
            var res = pipRest.feeds('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('publicPosts', function (done) {
            var res = pipRest.publicPosts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('posts', function (done) {
            var res = pipRest.posts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('allFeedPosts', function (done) {
            var res = pipRest.allFeedPosts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('feedPosts', function (done) {
            var res = pipRest.feedPosts('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('postComments', function (done) {
            var res = pipRest.postComments('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('postCheers', function (done) {
            var res = pipRest.postCheers('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('postBoos', function (done) {
            var res = pipRest.postBoos('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: events functions', function () {

        test('events', function (done) {
            var res = pipRest.events('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('acceptEvent', function (done) {
            var res = pipRest.acceptEvent('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('rejectEvent', function (done) {
            var res = pipRest.rejectEvent('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('eventContribManage', function (done) {
            var res = pipRest.eventContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: visions functions', function () {

        test('visions', function (done) {
            var res = pipRest.visions('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('acceptVision', function (done) {
            var res = pipRest.acceptVision('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('visionContribManage', function (done) {
            var res = pipRest.visionContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: messages functions', function () {

        test('messages', function (done) {
            var res = pipRest.messages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('receivedMessages', function (done) {
            var res = pipRest.receivedMessages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('receivedManagedMessages', function (done) {
            var res = pipRest.receivedManagedMessages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('sentMessages', function (done) {
            var res = pipRest.sentMessages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('viewMessage', function (done) {
            var res = pipRest.viewMessage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('sentManagedMessages', function (done) {
            var res = pipRest.sentManagedMessages('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: notifications functions', function () {

        test('notifications', function (done) {
            var res = pipRest.notifications('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('managedNotifications', function (done) {
            var res = pipRest.managedNotifications('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: areas functions', function () {

        test('areas', function (done) {
            var res = pipRest.areas('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('acceptArea', function (done) {
            var res = pipRest.acceptArea('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('rejectArea', function (done) {
            var res = pipRest.rejectArea('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('areaContribManage', function (done) {
            var res = pipRest.areaContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: goals functions', function () {

        test('goals', function (done) {
            var res = pipRest.goals('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('acceptGoal', function (done) {
            var res = pipRest.acceptGoal('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('rejectGoal', function (done) {
            var res = pipRest.rejectGoal('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('goalContribManage', function (done) {
            var res = pipRest.goalContribManage('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: support cases functions', function () {

        test('partySupportCases', function (done) {
            var res = pipRest.partySupportCases('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

        test('supportCases', function (done) {
            var res = pipRest.supportCases('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: announces functions', function () {

        test('announces', function (done) {
            var res = pipRest.announces('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

    suite('pipRest: stats functions', function () {

        test('stats', function (done) {
            var res = pipRest.stats('');
            assert.isDefined(res);
            assert.isDefined(res.get);
            done();
        });

    });

});
