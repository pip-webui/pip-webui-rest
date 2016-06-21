'use strict';

describe('pipEnums', function () {
    var pipEnums;

    beforeEach(module('pipRest.Enums'));

    beforeEach(inject(function(_pipEnums_) {
        pipEnums = _pipEnums_;
    }));



    it('SHARE_LEVEL', function () {
        assert.isDefined(pipEnums.SHARE_LEVEL);
    });

    it('GENDER', function () {
        assert.isDefined(pipEnums.GENDER);

        assert.isDefined(pipEnums.GENDERS);
        assert.lengthOf(pipEnums.GENDERS, 3);
        assert.include(pipEnums.GENDERS, 'male');
        assert.include(pipEnums.GENDERS, 'female');
        assert.include(pipEnums.GENDERS, 'n/s');

    });
});
