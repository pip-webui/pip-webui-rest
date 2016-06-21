'use strict';

describe('pipAuthState', function () {
    var pipAuthState, $httpProviderIt, $httpBackend;

    beforeEach(function() {
        module('pipRest.State', function($httpProvider) {
            $httpProviderIt = $httpProvider;
        });

        inject(function (_pipAuthState_, _$httpBackend_) {
            pipAuthState = _pipAuthState_;
            $httpBackend = _$httpBackend_;
        });
    });

    it('should add interceptor', function(done) {
        assert.isDefined($httpProviderIt.interceptors);
        assert.isTrue($httpProviderIt.interceptors.indexOf('pipAuthHttpResponseInterceptor') > -1);

        done();
    });

    it('should have pipAuthState be defined', function(done) {
        assert.isDefined(pipAuthState);

        done();
    });

});

describe('$on event functions', function() {
    var $rootScope,
        pipState,
        pipSession,
        pipAuthState;
    var sandbox;

    beforeEach(function() {
        module('pipRest.State');

        inject(function (_pipState_, _$rootScope_, _pipSession_, _pipAuthState_) {
            $rootScope = _$rootScope_;
            pipState = _pipState_;
            pipSession = _pipSession_;
            pipAuthState = _pipAuthState_;
        });

    });

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should be go to signin when unauthorized redirect', function(done) {
        sandbox.stub(pipSession, "close");
        sandbox.stub(pipAuthState, "goToSignin");

        $rootScope.$broadcast('pipUnauthorizedRedirect', {});

        sinon.assert.calledOnce(pipSession.close);
        sinon.assert.calledOnce(pipAuthState.goToSignin);
        sinon.assert.calledWithExactly(pipAuthState.goToSignin, {});
        done();
    });

    //it('should be redirect on $stateChangeStart ', function(done) {
    //    sandbox.stub(pipAuthState, "redirect").returns(true);
    //    sandbox.stub(pipSession, "opened");
    //
    //    $rootScope.$broadcast('$stateChangeStart', {event: null, toState: {auth: true}});
    //
    //    sinon.assert.calledOnce(pipAuthState.redirect);
    //    //sinon.assert.callCount(pipSession.opened, 0);
    //    done();
    //});


});

describe('pipAuthHttpResponseInterceptor', function() {
    var AuthInterceptor,
        $rootScope,
        $q,
        $location;

    beforeEach(function() {
        module('pipRest.State');

        inject(function (pipAuthHttpResponseInterceptor, _$rootScope_, _$q_, _$location_) {
            AuthInterceptor = pipAuthHttpResponseInterceptor;
            $rootScope = _$rootScope_;
            $q = _$q_;
            $location = _$location_;
        });
    });

    it('should be defined functions', function(done) {
        assert.isDefined(AuthInterceptor.response);
        assert.isFunction(AuthInterceptor.response);

        assert.isDefined(AuthInterceptor.responseError);
        assert.isFunction(AuthInterceptor.responseError);

        done();
    });

});
