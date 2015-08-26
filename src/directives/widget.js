'use strict';

var chellWidget = angular.module('chell-widget');

chellWidget.directive('widget', function ($log, $modal, dashboard) {

    function preLink($scope) {
        var definition = $scope.definition;
        if (definition) {
            var w = dashboard.widgets[definition.type];
            if (w) {
                // pass title
                if (!definition.title) {
                    definition.title = w.title;
                }

                if (!definition.titleTemplateUrl) {
                    definition.titleTemplateUrl = 'templates/widget-title.tpl.html';
                }

                // set id for sortable
                if (!definition.wid) {
                    definition.wid = dashboard.id();
                }

                // pass copy of widget to scope
                $scope.widget = angular.copy(w);

                // create config object
                var config = definition.config;
                if (config) {
                    if (angular.isString(config)) {
                        config = angular.fromJson(config);
                    }
                } else {
                    config = {};
                }

                // pass config to scope
                $scope.config = config;

                // collapse exposed $scope.widgetState property
                if (!$scope.widgetState) {
                    $scope.widgetState = {};
                    $scope.widgetState.isCollapsed = false;
                    $scope.widgetState.isFullscreen = false;
                }

            } else {
                $log.warn('could not find widget ' + definition.type);
            }
        } else {
            $log.debug('definition not specified, widget was probably removed');
        }
    }

    function postLink($scope, $element) {
        var definition = $scope.definition;
        if (definition) {
            // bind close function
            $scope.close = function () {
                var column = $scope.col;
                if (column) {
                    var index = column.widgets.indexOf(definition);
                    if (index >= 0) {
                        column.widgets.splice(index, 1);
                    }
                }
                $element.remove();
            };

            // bind reload function
            $scope.reload = function () {
                $scope.$broadcast('widgetReload');
            };

            // bind edit function
            $scope.edit = function () {
                var editScope = $scope.$new();
                editScope.definition = angular.copy(definition);
                var opts = {
                    scope: editScope,
                    templateUrl: 'templates/widget-edit.tpl.html',
                    backdrop: 'static'
                };

                var instance = $modal.open(opts);
                editScope.closeDialog = function () {
                    instance.close();
                    editScope.$destroy();

                    var widget = $scope.widget;
                    if (widget.edit && widget.edit.reload) {
                        // reload content after edit dialog is closed
                        $scope.$broadcast('widgetConfigChanged');
                    }
                };
                editScope.saveDialog = function () {
                    definition.title = editScope.definition.title;
                    definition.height = editScope.definition.height;
                    angular.extend(definition.config, editScope.definition.config);
                    editScope.closeDialog();
                };
            };
        } else {
            $log.debug('widget not found');
        }
    }

    return {
        replace: true,
        restrict: 'EA',
        transclude: false,
        templateUrl: 'templates/widget.tpl.html',
        scope: {
            definition: '=',
            col: '=column',
            editMode: '=',
            options: '=',
            widgetState: '='
        },

        controller: function ($scope) {

            $scope.$on('widgetDashboardCollapseExapand', function (event, args) {
                $scope.widgetState.isCollapsed = args.collapseExpandStatus;
                $scope.widgetState.isFullscreen = false;
            });

        },

        compile: function compile() {

            /**
             * use pre link, because link of widget-content
             * is executed before post link widget
             */
            return {
                pre: preLink,
                post: postLink
            };
        }
    };

});
