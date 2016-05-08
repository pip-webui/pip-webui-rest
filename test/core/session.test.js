'use strict';

suite('pipAuthHttpResponseInterceptor', function() {
    var serverUrl = 'http://alpha.pipservices.net';

    var
        $http,
        localStorageService,
        $cookieStore,
        $httpBackend,
        $rootScope,
        requestHandler,
        pipSession,
        pipRest,
        testDataSet;

    setup(function() {
        module('pipRest.State');
        module('test.DataSet');

        inject(function (_$http_, $injector, _$rootScope_, _localStorageService_, _$cookieStore_,
                         _pipSession_, _pipRest_, _testDataSet_) {
            $http = _$http_;
            localStorageService = _localStorageService_;
            $cookieStore = _$cookieStore_;
            $rootScope = _$rootScope_;
            pipSession = _pipSession_;
            pipRest = _pipRest_;
            testDataSet = _testDataSet_;

            $httpBackend = $injector.get('$httpBackend');
        });
    });

    test('should be defined functions', function(done) {
        assert.isDefined(pipSession.opened);
        assert.isDefined(pipSession.userId);
        assert.isDefined(pipSession.sessionId);
        assert.isDefined(pipSession.serverUrl);
        assert.isDefined(pipSession.lastUsedEmail);
        assert.isDefined(pipSession.lastUsedPassword);
        assert.isDefined(pipSession.usedServers);
        assert.isDefined(pipSession.usedServerUrls);
        assert.isDefined(pipSession.signin);
        assert.isDefined(pipSession.abort);
        assert.isDefined(pipSession.signout);
        assert.isDefined(pipSession.open);
        assert.isDefined(pipSession.close);
        assert.isDefined(pipSession.reopen);
        done();
    });

    suite('should be open session', function() {
        var sandbox;

        suiteSetup(function() {
            sandbox = sinon.sandbox.create();
        });

        suiteTeardown(function() {
            sandbox.restore();
        });

        test.only('should be open session, user date is not remember ', function(done) {
            sandbox.stub($rootScope, "$broadcast");
            //stub.onFirstCall().returns(true); ???
            var user = testDataSet.getUser(),
                serverUrl = testDataSet.getServerUrl(),
                password = testDataSet.getUserPassword();

            pipSession.open(serverUrl, user, password, false);

            assert.equal(pipSession.userId(), user.id);
            assert.equal(pipSession.sessionId(), user.last_session_id);
            assert.equal($http.defaults.headers.common['session-id'], user.last_session_id);
            assert.equal($http.defaults.headers.common['user-id'], user.id);


            assert.equal($cookieStore.get('user-id'), user.id);
            assert.equal($cookieStore.get('session-id'), user.last_session_id);
            assert.equal($cookieStore.get('server-url'), serverUrl);

            done();
        });

    });

    test('should be signin', function(done) {
        requestHandler = $httpBackend.when('POST', serverUrl + '/api/signin')
            .respond({name: "Boy", email: 'stas@test.ru' , language: "en", pwd_fail_count: 0, pwd_last_fail: null});


        pipSession.signin(
            {
                serverUrl: serverUrl,
                email: 'stas@test.ru',
                password: '123456',
                remember: false,
                adminOnly: false
            },
            function(result) {
                assert.isTrue(true);
                assert.isDefined(result);
                assert.equal(result.name, 'Boy');
                assert.equal(result.email, 'stas@test.ru');
                assert.equal(result.pwd_fail_count, 0);

            },
            function(error) {
                assert.isFalse(false);
            }
        );

        $httpBackend.flush();

        done();
    });

});

