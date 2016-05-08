'use strict';

suite('pipRest httpBackend query', function() {
    var serverUrl = 'http://alpha.pipservices.net';

    var $httpBackend,
        requestHandler,
        pipRest;

    suiteSetup(function() {
        module('pipRest.State');

        inject(function ($injector, _pipRest_) {
            pipRest = _pipRest_;
            $httpBackend = $injector.get('$httpBackend');
        });

    });

    suiteTeardown(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    test('Signin should be return user', function(done) {
        requestHandler = $httpBackend.when('POST', serverUrl + '/api/signin')
            .respond({name: "Boy", email: 'stas@test.ru' , language: "en", pwd_fail_count: 0, pwd_last_fail: null});


        pipRest.signin('').call(
            {
                email: 'stas@test.ru',
                password: '123456'
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

