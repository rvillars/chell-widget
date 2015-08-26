'use strict';

describe('Widget', function() {

    //mock Application to allow us to inject our own dependencies
    beforeEach(angular.mock.module('chell-widget'));
    // tests start here

    it('should fetch list of content', inject(function(Widget) {
        Widget.query().then(function(widget) {
            expect(widget.length).toBe(2);
        });
    }));
});