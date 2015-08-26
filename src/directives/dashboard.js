'use strict';

var chellWidget = angular.module('chell-widget');

chellWidget.directive('widgetDashboard', function ($rootScope, $log, $modal, dashboard) {

    function stringToBoolean(string) {
        switch (angular.isDefined(string) ? string.toLowerCase() : null) {
            case 'true':
            case 'yes':
            case '1':
                return true;
            case 'false':
            case 'no':
            case '0':
            case null:
                return false;
            default:
                return Boolean(string);
        }
    }

    function copyWidgets(source, target) {
        if (source.widgets && source.widgets.length > 0) {
            var w = source.widgets.shift();
            while (w) {
                target.widgets.push(w);
                w = source.widgets.shift();
            }
        }
    }

    /**
     * Copy widget from old columns to the new model
     * @param object root the model
     * @param array of columns
     * @param counter
     */
    function fillStructure(root, columns, counter) {
        counter = counter || 0;

        if (angular.isDefined(root.rows)) {
            angular.forEach(root.rows, function (row) {
                angular.forEach(row.columns, function (column) {
                    // if the widgets prop doesn't exist, create a new array for it.
                    // this allows ui.sortable to do it's thing without error
                    if (!column.widgets) {
                        column.widgets = [];
                    }

                    // if a column exist at the counter index, copy over the column
                    if (angular.isDefined(columns[counter])) {
                        // do not add widgets to a column, which uses nested rows
                        if (!angular.isDefined(column.rows)) {
                            copyWidgets(columns[counter], column);
                            counter++;
                        }
                    }

                    // run fillStructure again for any sub rows/columns
                    counter = fillStructure(column, columns, counter);
                });
            });
        }
        return counter;
    }

    /**
     * Read Columns: recursively searches an object for the 'columns' property
     * @param object model
     * @param array  an array of existing columns; used when recursion happens
     */
    function readColumns(root, columns) {
        columns = columns || [];

        if (angular.isDefined(root.rows)) {
            angular.forEach(root.rows, function (row) {
                angular.forEach(row.columns, function (col) {
                    columns.push(col);
                    // keep reading columns until we can't any more
                    readColumns(col, columns);
                });
            });
        }

        return columns;
    }

    function changeStructure(model, structure) {
        var columns = readColumns(model);
        var counter = 0;

        model.rows = angular.copy(structure.rows);

        while (counter < columns.length) {
            counter = fillStructure(model, columns, counter);
        }
    }

    function createConfiguration(type) {
        var cfg = {};
        var config = dashboard.widgets[type].config;
        if (config) {
            cfg = angular.copy(config);
        }
        return cfg;
    }

    /**
     * Find first widget column in model.
     *
     * @param dashboard model
     */
    function findFirstWidgetColumn(model) {
        var column = null;
        if (!angular.isArray(model.rows)) {
            $log.error('model does not have any rows');
            return null;
        }
        for (var i = 0; i < model.rows.length; i++) {
            var row = model.rows[i];
            if (angular.isArray(row.columns)) {
                for (var j = 0; j < row.columns.length; j++) {
                    var col = row.columns[j];
                    if (!col.rows) {
                        column = col;
                        break;
                    }
                }
            }
            if (column) {
                break;
            }
        }
        return column;
    }

    /**
     * Adds the widget to first column of the model.
     *
     * @param dashboard model
     * @param widget to add to model
     */
    function addNewWidgetToModel(model, widget) {
        if (model) {
            var column = findFirstWidgetColumn(model);
            if (column) {
                if (!column.widgets) {
                    column.widgets = [];
                }
                column.widgets.unshift(widget);
            } else {
                $log.error('could not find first widget column');
            }
        } else {
            $log.error('model is undefined');
        }
    }

    return {
        replace: true,
        restrict: 'EA',
        transclude: false,
        scope: {
            structure: '@',
            name: '@',
            collapsible: '@',
            editable: '@',
            maximizable: '@',
            widgetModel: '=',
            widgetFilter: '='
        },
        controller: function ($scope) {
            var model = {};
            var structure = {};
            var widgetFilter = null;
            var structureName = {};
            var name = $scope.name;

            // Watching for changes on widgetModel
            $scope.$watch('widgetModel', function (oldVal, newVal) {
                // has model changed or is the model attribute not set
                if (newVal !== null || (oldVal === null && newVal === null)) {
                    model = $scope.widgetModel;
                    widgetFilter = $scope.widgetFilter;
                    if (!model || !model.rows) {
                        structureName = $scope.structure;
                        structure = dashboard.structures[structureName];
                        if (structure) {
                            if (model) {
                                model.rows = angular.copy(structure).rows;
                            } else {
                                model = angular.copy(structure);
                            }
                            model.structure = structureName;
                        } else {
                            $log.error('could not find structure ' + structureName);
                        }
                    }

                    if (model) {
                        if (!model.title) {
                            model.title = 'Dashboard';
                        }
                        if (!model.titleTemplateUrl) {
                            model.titleTemplateUrl = 'templates/dashboard-title.tpl.html';
                        }
                        $scope.model = model;
                    } else {
                        $log.error('could not find or create model');
                    }
                }
            }, true);

            // edit mode
            $scope.editMode = false;
            $scope.editClass = '';

            $scope.toggleEditMode = function () {
                $scope.editMode = !$scope.editMode;
                if ($scope.editMode) {
                    $scope.modelCopy = angular.copy($scope.widgetModel, {});
                }

                if (!$scope.editMode) {
                    $rootScope.$broadcast('widgetDashboardChanged', name, model);
                }
            };

            $scope.collapseAll = function (collapseExpandStatus) {
                $rootScope.$broadcast('widgetDashboardCollapseExapand', {collapseExpandStatus: collapseExpandStatus});
            };

            $scope.cancelEditMode = function () {
                $scope.editMode = false;
                $scope.modelCopy = angular.copy($scope.modelCopy, $scope.widgetModel);
                $rootScope.$broadcast('widgetDashboardEditsCancelled');
            };

            // edit dashboard settings
            $scope.editDashboardDialog = function () {
                var editDashboardScope = $scope.$new();
                // create a copy of the title, to avoid changing the title to
                // "dashboard" if the field is empty
                editDashboardScope.copy = {
                    title: model.title
                };
                editDashboardScope.structures = dashboard.structures;
                var instance = $modal.open({
                    scope: editDashboardScope,
                    templateUrl: 'templates/dashboard-edit.tpl.html',
                    backdrop: 'static'
                });
                $scope.changeStructure = function (name, structure) {
                    $log.info('change structure to ' + name);
                    changeStructure(model, structure);
                };
                editDashboardScope.closeDialog = function () {
                    // copy the new title back to the model
                    model.title = editDashboardScope.copy.title;
                    // close modal and destroy the scope
                    instance.close();
                    editDashboardScope.$destroy();
                };
            };

            // reset dashboard settings
            $scope.resetDashboard = function () {
                $rootScope.$broadcast('widgetDashboardReset', name);
            };

            // add widget dialog
            $scope.addWidgetDialog = function () {
                var addScope = $scope.$new();
                var model = $scope.model;
                var widgets;
                if (angular.isFunction(widgetFilter)) {
                    widgets = {};
                    angular.forEach(dashboard.widgets, function (widget, type) {
                        if (widgetFilter(widget, type, model)) {
                            widgets[type] = widget;
                        }
                    });
                } else {
                    widgets = dashboard.widgets;
                }
                addScope.widgets = widgets;
                var opts = {
                    scope: addScope,
                    templateUrl: 'templates/widget-add.tpl.html',
                    backdrop: 'static'
                };
                var instance = $modal.open(opts);
                addScope.addWidget = function (widget) {
                    var w = {
                        type: widget,
                        config: createConfiguration(widget)
                    };
                    addNewWidgetToModel(model, w);
                    $rootScope.$broadcast('widgetAdded', name, model, w);
                    // close and destroy
                    instance.close();
                    addScope.$destroy();
                };
                addScope.closeDialog = function () {
                    // close and destroy
                    instance.close();
                    addScope.$destroy();
                };
            };
        },
        link: function ($scope, $element, $attr) {
            // pass options to scope
            var options = {
                name: $attr.name,
                editable: true,
                maximizable: stringToBoolean($attr.maximizable),
                collapsible: stringToBoolean($attr.collapsible)
            };
            if (angular.isDefined($attr.editable)) {
                options.editable = stringToBoolean($attr.editable);
            }
            $scope.options = options;
        },
        templateUrl: 'templates/dashboard.tpl.html'
    };
});
