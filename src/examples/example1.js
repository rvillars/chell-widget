/*jshint globalstrict: true*/
'use strict';

var chellWidgetExample1 = angular.module('chell-widget-example1', [
    'chell-widget',
    'chell-widget.provider',
    'chell-widget.structures',
    'ngMockE2E',
    'LocalStorageModule',
    'chell-widget.randommsg',
    'chell-widget.iframe'
]);

chellWidgetExample1.config(function (dashboardProvider, localStorageServiceProvider) {
    dashboardProvider.widgetsPath('widgets/');
    localStorageServiceProvider.setPrefix('chell-widget');
});

chellWidgetExample1.controller('ExampleWidgetController', function ($scope, localStorageService) {
    var name = 'sample-01';
    var model = localStorageService.get(name);

    var initmodel = {
        title: 'Dashboard',
        structure: '4-4-4/12',
        rows: [{
            columns: [{
                styleClass: 'col-md-4',
                widgets: [{
                    type: 'randommsg',
                    config: {},
                    title: 'Widget 1'
                }, {
                    type: 'randommsg',
                    config: {},
                    title: 'Widget 2'
                }]
            }, {
                styleClass: 'col-md-4',
                widgets: [{
                    type: 'randommsg',
                    config: {},
                    title: 'Widget 3'
                }, {
                    type: 'randommsg',
                    config: {},
                    title: 'Widget 4'
                }]
            }, {
                styleClass: 'col-md-4',
                widgets: [{
                    type: 'iframe',
                    config: {
                        iFrameSrc: 'http://www.example.com',
                        iFrameWidth: '100%',
                        iFrameHeight: '100%'
                    },
                    title: 'iFrame Widget 1'
                }, {
                    type: 'randommsg',
                    config: {},
                    title: 'Widget 6'
                }]
            }]
        }, {
            columns: [{
                styleClass: 'col-md-12',
                widgets: [{
                    type: 'iframe',
                    height: '400px',
                    config: {
                        iFrameSrc: 'http://www.example.com',
                        iFrameWidth: '100%',
                        iFrameHeight: '100%'
                    },
                    title: 'iFrame Widget 2'
                }]
            }]
        }]
    };

    if (!model) {
        // set default model for demo purposes
        model = initmodel;
    }
    $scope.name = name;
    $scope.model = model;
    $scope.collapsible = true;
    $scope.maximizable = true;

    $scope.$on('widgetDashboardChanged', function (event, name, model) {
        localStorageService.set(name, model);
    });

    $scope.$on('widgetDashboardReset', function (event, name) {
        $scope.model = initmodel;
    });
});

chellWidgetExample1.run(function run($httpBackend) {
    $httpBackend.whenGET(/.*/).passThrough();
    $httpBackend.whenPOST(/.*/).passThrough();
    $httpBackend.whenPUT(/.*/).passThrough();
    $httpBackend.whenDELETE(/.*/).passThrough();
});