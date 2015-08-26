'use strict';

describe('Widget', function() {

    //mock Application to allow us to inject our own dependencies
    beforeEach(angular.mock.module('chell-widget'));
    // tests start here

    it('just a dummy test', function() {
        var state = false;
        expect(state).toBe(false);
    });
});