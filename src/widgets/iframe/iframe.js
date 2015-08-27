'use strict';

angular.module('chell-widget.iframe', ['chell-widget.provider'])
    .config(function (dashboardProvider) {
        dashboardProvider
            .widget('iframe', {
                title: 'iFrame',
                description: 'Displays arbitrary web content in an iframe',
                templateUrl: 'widgets/iframe/view.tpl.html',
                controller: 'iframeController',
                controllerAs: 'iframe',
                config: {
                    iFrameSrc: '',
                    iFrameHeight: '100%',
                    iFrameWidth: '100%'
                },
                edit: {
                    templateUrl: 'widgets/iframe/edit.tpl.html'
                }
            });
    })
    .controller('iframeController', function ($scope, $sce, config) {
        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };
    });
