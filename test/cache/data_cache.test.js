'use strict';

//var
//    data_set = require('../test/data_set.test.js');

// define users
/*
 var
 ADMIN_USER = {},
 MANAGER_USER = {
 'name': 'manager_user',
 'email': 'test2piplife@mail.ru',
 'language': 'en',
 'pwd_fail_count': 0,
 'pwd_last_fail': null,
 'paid': false,
 'admin': false,
 'party_access': [
 {
 'share_level': 0,
 'type': 'partner',
 'party_name': 'Bill Tester',
 'party_id': '55f20e7b4b0c570c4b1f12e0',
 'contributor': false,
 'manager': false,
 'id': '55f716315b46fab820dd8df3'
 },
 {
 'share_level': 0,
 'type': 'partner',
 'party_name': 'emptyUser',
 'party_id': 'user_id00000000000000001',
 'contributor': false,
 'manager': false,
 'id': '55f716315b46fab820dd8de4'
 }
 ],
 'sessions': [
 {
 'address': '109.254.67.37',
 'client': 'chrome',
 'platform': 'windows 6.3',
 'last_req': '2015-11-19T13:57:12.723Z',
 'opened': '2015-11-19T13:57:12.723Z',
 'id': 'session_id00000000000002'
 }, {
 'address': '176.8.157.60',
 'client': 'chrome',
 'platform': 'windows 6.3',
 'last_req': '2015-11-19T17:22:11.791Z',
 'opened': '2015-11-19T17:22:11.791Z',
 'id': 'session_id00000000000003'
 }
 ],
 'signin': '2015-11-19T17:22:11.688Z',
 'signup': '2015-09-10T20:56:08.025Z',
 'active': true,
 'lock': false,
 'email_ver': false,
 'id': 'user_id00000000000000002',
 'last_session_id': 'session_id00000000000003'
 },

 PARTNER_USER = {},
 EMPTY_USER = {
 'pwd_last_fail': null,
 'pwd_fail_count': 0,
 'name': 'emptyUser',
 'email': 'emptyUser@test.ru',
 'language': 'en',
 'paid': false,
 'admin': false,
 'party_access': [],
 'sessions': [
 {
 'address': '176.8.157.60',
 'client': 'chrome',
 'platform': 'windows 6.3',
 'last_req': '2015-11-19T17:34:42.019Z',
 'opened': '2015-11-19T17:34:42.019Z',
 'id': 'session_id00000000000001'
 }
 ],
 'signin': '2015-11-19T17:34:41.934Z',
 'signup': '2015-11-19T17:34:41.721Z',
 'active': true,
 'lock': false,
 'email_ver': false,
 'id': 'user_id00000000000000001',
 'last_session_id': 'session_id00000000000001'
 };

 var USERS = [];

 // define party
 var PARTIES = [
 {
 'name': 'emptyUser',
 'email': 'emptyUser@test.ru',
 'type': 'person',
 'join': 'approve',
 'updated': '2015-11-19T17:34:41.204Z',
 'created': '2015-11-19T17:34:41.204Z',
 'id': 'user_id00000000000000001'
 },
 {
 'name': 'manager_user',
 'email': 'test2piplife@mail.ru',
 'type': 'person',
 'join': 'approve',
 'updated': '2015-11-19T17:34:41.204Z',
 'created': '2015-11-19T17:34:41.204Z',
 'id': 'user_id00000000000000002'
 }
 ];
*/

 // define goals
var GOALS = [
    {
        'title': 'My goal2',
        'type': 'goal',
        'creator_id': 'user_id00000000000000001',
        'creator_name': 'emptyUser',
        'contribs': [
            {
                'from_id': 'goal_id00000000000000001',
                'party_id': 'user_id00000000000000001',
                'party_name': 'emptyUser',
                'accept': 'accepted',
                'role': ''
            }
        ],
        'tags': [],
        'id': 'goal_id00000000000000001'
    },
    {
        'title': 'My goal2',
        'type': 'goal',
        'creator_id': 'user_id00000000000000001',
        'creator_name': 'emptyUser',
        'contribs': [
            {
                'from_id': 'goal_id00000000000000002',
                'party_id': 'user_id00000000000000001',
                'party_name': 'emptyUser',
                'accept': 'accepted',
                'role': ''
            }
        ],
        'tags': [],
        'id': 'goal_id00000000000000002'
    }
];

var GOAL_ITEM = {
    'title': 'My goal3',
    'type': 'goal',
    'creator_id': 'user_id00000000000000001',
    'creator_name': 'emptyUser',
    'contribs': [
        {
            'from_id': 'goal_id00000000000000003',
            'party_id': 'user_id00000000000000001',
            'party_name': 'emptyUser',
            'accept': 'accepted',
            'role': ''
        }
    ],
    'tags': [],
    'id': 'goal_id00000000000000003'
};

// define areas
var AREAS = [
    {
        'type': 'category',
        'creator_id': 'user_id00000000000000001',
        'creator_name': 'emptyUser',
        'title': 'Personal',
        'contribs': [
            {
                'from_id': 'area_id0000000000000001',
                'party_id': 'user_id00000000000000001',
                'party_name': 'emptyUser',
                'accept': 'accepted'
            }
        ],
        'tags': [],
        'id': 'area_id0000000000000001'
    },
    {
        'type': 'category',
        'creator_id': 'user_id00000000000000001',
        'creator_name': 'emptyUser',
        'title': 'Health',
        'contribs': [
            {
                'from_id': 'area_id0000000000000002',
                'party_id': 'user_id00000000000000001',
                'party_name': 'emptyUser',
                'accept': 'accepted'
            }
        ],
        'tags': [],
        'id': 'area_id0000000000000002'
    }
];

// define connections

// define groups

// define tags

// define some function and get goal, area, ... for choose user

describe('data cache', function () {
    'use strict';

    var dataModel,
        dataCache;

    function resetCache(dataCache) {
        dataCache.clear();
        dataCache.timeout(5 * 60000);
    }

    beforeEach(module('pipDataCache'));
    beforeEach(inject(function (pipDataCache) {
        dataCache = pipDataCache;
    }));
    beforeEach(inject(function (pipDataCache, pipDataModel) {
        dataCache = pipDataCache;
        dataModel = pipDataModel;
    }));

    it('should be define functions', function () {
        expect(dataModel).to.isDefined;
        expect(dataCache).to.isDefined;
        expect(dataCache.clear).to.isDefined;
        expect(dataCache.timeout).to.isDefined;
        expect(dataCache.retrieve).to.isDefined;
        expect(dataCache.retrieveOrLoad).to.isDefined;
        expect(dataCache.storePermanent).to.isDefined;
        expect(dataCache.remove).to.isDefined;
        expect(dataCache.addItem).to.isDefined;
        expect(dataCache.updateItem).to.isDefined;
        expect(dataCache.removeItem).to.isDefined;
        expect(dataCache.addDecorator).to.isDefined;
        expect(dataCache.updateDecorator).to.isDefined;
        expect(dataCache.removeDecorator).to.isDefined;
    });

    describe('should be check starting parameter', function () {

        it('should be clearing cache', function () {
            expect(dataModel).to.isDefined;
            expect(dataCache.clear).to.isDefined;
            expect(dataCache.retrieve).to.isDefined;
            expect(dataCache.store).to.isDefined;
        });

        it('should be set timeout for cache', function () {
            expect(dataCache.timeout).to.isDefined;
            expect(dataCache.timeout()).to.equal(5 * 60000);
            expect(dataCache.timeout(60000)).to.equal(60000);

            resetCache(dataCache);
            expect(dataCache.timeout()).to.equal(5 * 60000);
        });

    });

    describe('should be store and retrieve collection into the cache', function () {
        var someData = 'GOALS',
            storedData = null;

        it('should be empty cache', function () {
            // no collection
            expect(dataCache.retrieve(someData)).to.be.null;
        });

        it('should be store and read collection', function () {
            dataCache.store(someData, GOALS);
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.isDefined;
            expect(storedData).to.be.not.null;
            expect(storedData).to.be.an('array');
            expect(storedData).to.be.deep.equal(GOALS);
        });

        it('should be store and retrieve empty collection', function () {
            // store empty collection
            dataCache.store(someData, []);
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.isDefined;
            expect(storedData).to.be.not.null;
            expect(storedData).to.be.an('array');
            expect(storedData).to.have.lengthOf(0);
        });
        
        it('should be expired collection', function () {
            // Making the data in the cache immediately outdated
            dataCache.timeout(-1);
            expect(dataCache.timeout(-1)).to.equal(-1);
            // save collection
            dataCache.store(someData, GOALS);
            // try read collection
            storedData = dataCache.retrieve(someData);
            // collection is outdated, null returned
            expect(storedData).to.be.null;
            resetCache(dataCache);
        });
    });
    
    describe('should be permanent store collection to the cache', function () {
        var someData = 'GOALS',
            storedData = null;

        it('should be read permanent collection', function () {
            // Making the data in the cache immediately outdated
            dataCache.timeout(-1);
            expect(dataCache.timeout(-1)).to.equal(-1);
            // save collection
            dataCache.storePermanent(someData, GOALS);
            // try read collection
            storedData = dataCache.retrieve(someData);
            // collection is not outdated
            expect(storedData).to.be.not.null;
            resetCache(dataCache);
        });

    });

    describe('should be remove collection to the cache', function () {
        var someData = 'GOALS',
            storedData = null;

        it('should be remove stored collection', function () {
            // Making the data in the cache immediately outdated
            // save collection
            dataCache.store(someData, GOALS);
            // try read collection
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;
            expect(storedData).to.deep.equal(GOALS);
            // remove data
            dataCache.remove(someData);
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.null;
        });

        it('should be remove stored permanent collection', function () {
            // Making the data in the cache immediately outdated
            // save collection
            dataCache.storePermanent(someData, GOALS);
            // try read collection
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;
            expect(storedData).to.deep.equal(GOALS);
            // remove data
            dataCache.remove(someData);
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.null;

            resetCache(dataCache);
        });

    });

    describe('should be retrieve data from the cache, otherwise load it from server', function () {
        var someData = 'goals',
            storedData = null,
            sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should be retrieve data from cache without filter', function () {
            var successCallback = sinon.spy(),
                result;

            dataCache.store(someData, GOALS);
            result = dataCache.retrieveOrLoad({
                cache: someData,
                filter: null,
                force: false
            }, successCallback);
            // check successCallback is called
            expect(successCallback.called).to.be.true;
            // check result defined
            expect(result).to.isDefined;
            // check result equal loading data
            expect(result).to.deep.equal(GOALS);
        });

        it('should be retrieve data from cache with filter', function () {
            var successCallback = sinon.spy(),
                result;

            dataCache.store(someData, GOALS);
            result = dataCache.retrieveOrLoad({
                cache: someData,
                filter: function (collection) {
                    return _.filter(collection, {id: 'goal_id00000000000000001'});
                },
                force: false
            }, successCallback);
            // check successCallback is called
            expect(successCallback.called).to.be.true;
            // check result defined
            expect(result).to.isDefined;
            // check result
            expect(result).to.have.lengthOf(1);
        });

        it('should be retrieve empty data from cache with filter', function () {
            var successCallback = sinon.spy(),
                result;

            dataCache.store(someData, GOALS);
            result = dataCache.retrieveOrLoad({
                cache: someData,
                filter: function (collection) {
                    return _.filter(collection, {id: 'goal_id00000000000000005'}); // do not present in cache data
                },
                force: false
            }, successCallback);
            // check successCallback is called
            expect(successCallback.called).to.be.true;
            // check result defined
            expect(result).to.isDefined;
            // check result
            expect(result).to.have.lengthOf(0);
        });

        it('should be retrieve data from server, when the data is not in cache (!singleResult operation). ',
            function () {
                resetCache(dataCache);
                var dataFromServer = [],
                    result,
                    successCallback = sinon.spy();

                // подготавливаем данные, которые будут симулировать возврат данных с сервера
                dataFromServer.push(GOALS[0]);
                // когда будет выполнет метод dataModel.read,
                // будет вызван его аргумент №1 successCallback с параметром  dataFromServer
                sandbox.stub(dataModel, 'read').callsArgWith(1, dataFromServer);
                // sandbox.stub(dataModel, 'readOne').returns(GOALS[0]);

                // cache пуст
                storedData = dataCache.retrieve(someData);
                expect(storedData).to.be.null;

                result = dataCache.retrieveOrLoad({
                    cache: someData,
                    filter: null,
                    force: false,
                    singleResult: false // read operation
                }, successCallback, null);

                dataModel.read.callsArg(1, dataFromServer);

                // проверяем, что считанные данные записаны в кеш
                storedData = dataCache.retrieve(someData);
                expect(storedData).to.be.not.null;
                expect(storedData).to.be.an('array');
                expect(storedData).to.deep.equal(dataFromServer);
            });

        it('should be retrieve data from server, when force is true (!singleResult operation).', function () {
            resetCache(dataCache);
            var dataFromServer = [],
                result,
                successCallback = sinon.spy();

            // save collection
            dataCache.store(someData, GOALS);
            // подготавливаем данные, которые будут симулировать возврат данных с сервера
            dataFromServer.push(GOALS[0]);
            // когда будет выполнет метод dataModel.read,
            // будет вызван его аргумент №1 successCallback с параметром  dataFromServer
            sandbox.stub(dataModel, 'read').callsArgWith(1, dataFromServer);

            // cache пуст
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;

            result = dataCache.retrieveOrLoad({
                cache: someData,
                filter: null,
                force: true,
                singleResult: false // read operation
            }, successCallback, null);

            dataModel.read.callsArg(1, dataFromServer);

            // проверяем, что считанные данные записаны в кеш
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;
            expect(storedData).to.be.an('array');
            expect(storedData).to.deep.equal(dataFromServer);
        });

    });

    describe('should be add Item to the cache', function () {
        var someData = 'GOALS',
            storedData = null,
            item,
            collection;

        it('should be add new Item to not empty nameSpace', function () {
            resetCache(dataCache);
            // prepare testing data
            item = GOAL_ITEM;
            collection = _.cloneDeep(GOALS);
            collection.push(GOAL_ITEM);

            dataCache.store(someData, collection);
            // try read save item
            dataCache.addItem(someData, null, item);

            // read collection from nameSpace and check added item
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;
            expect(collection).to.have.lengthOf(storedData.length);
            expect(storedData).to.deep.equal(collection);
        });

        it('should be add new Item to the empty nameSpace', function () {
            resetCache(dataCache);
            // prepare testing data
            item = GOAL_ITEM;

            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.null;
            // try add item to the empty nameSpace
            dataCache.addItem(someData, null, item);

            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.null;
        });

        it('should be add exist Item', function () {
            resetCache(dataCache);
            // prepare testing data
            item = GOAL_ITEM;
            collection = _.cloneDeep(GOALS);
            collection.push(GOAL_ITEM);

            dataCache.store(someData, collection);
            // try read save item
            dataCache.addItem(someData, null, item);

            // read collection from nameSpace and check added item
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;
        });

    });

    describe('should be update Item in the cache', function () {
        var someData = 'GOALS',
            storedData = null,
            item,
            collection;

        it('should be update Item in not empty nameSpace', function () {
            resetCache(dataCache);
            // prepare testing data
            item = _.cloneDeep(GOAL_ITEM);
            item.title = '1';
            collection = _.cloneDeep(GOALS);
            collection.push(GOAL_ITEM);

            dataCache.store(someData, collection);
            // try read save item
            dataCache.updateItem(someData, null, item);

            // read collection from nameSpace and
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;
            expect(storedData).to.have.lengthOf(collection.length);

            // check updated item
            var updatedItem = _.find(storedData, {id: item.id});
            expect(updatedItem).to.be.not.null;
            expect(updatedItem.title).to.equal('1');
        });

        it('should be updated non existing Item in not empty nameSpace', function () {
            resetCache(dataCache);
            // prepare testing data
            item = _.cloneDeep(GOAL_ITEM);
            collection = _.cloneDeep(GOALS);
            item.title = '1';

            expect(collection).to.have.lengthOf(2);
            dataCache.store(someData, collection);

            // try read update item
            dataCache.updateItem(someData, null, item);

            // read collection from nameSpace and
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;
            expect(storedData).to.have.lengthOf(3);

            // check updated item
            var updatedItem = _.find(storedData, {id: item.id});
            expect(updatedItem).to.be.not.null;
            expect(updatedItem.title).to.equal('1');
        });

        it('should be update Item in empty nameSpace', function () {
            resetCache(dataCache);
            // prepare testing data
            item = GOAL_ITEM;

            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.null;
            // try add item to the empty nameSpace
            dataCache.updateItem(someData, null, item);
            
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.null;
        });

    });

    describe('should be remove Item from the cache', function () {
        var someData = 'GOALS',
            storedData = null,
            item,
            collection;

        it('should be remove existing Item from nameSpace', function () {
            resetCache(dataCache);
            // prepare testing data
            item = _.cloneDeep(GOAL_ITEM);
            item.title = '1';
            collection = _.cloneDeep(GOALS);
            collection.push(GOAL_ITEM);

            dataCache.store(someData, collection);
            // try read save item
            dataCache.removeItem(someData, null, item);

            // read collection from nameSpace and
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;
            expect(storedData).to.have.lengthOf(2);

            // check removed item
            var updatedItem = _.find(storedData, {id: item.id});
            
            expect(updatedItem).to.isUndefined;
        });

        it('should be remove non existing Item from nameSpace', function () {
            resetCache(dataCache);
            // prepare testing data
            item = _.cloneDeep(GOAL_ITEM);
            item.title = '1';
            collection = _.cloneDeep(GOALS);

            dataCache.store(someData, collection);
            // try read save item
            dataCache.removeItem(someData, null, item);

            // read collection from nameSpace and
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.not.null;
            expect(storedData).to.have.lengthOf(2);

            // check removed item
            var updatedItem = _.find(storedData, {id: item.id});
            
            expect(updatedItem).to.isUndefined;
        });

        it('should be remove Item from non existing nameSpace', function () {
            resetCache(dataCache);
            // prepare testing data
            item = _.cloneDeep(GOAL_ITEM);

            // try read save item
            dataCache.removeItem(someData, null, item);

            // read collection from nameSpace and
            storedData = dataCache.retrieve(someData);
            expect(storedData).to.be.null;
        });

    });

});
