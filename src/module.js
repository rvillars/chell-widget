'use strict';

var chellWidgetProvider = angular.module('chell-widget.provider', []);

var chellWidget = angular.module('chell-widget', [
    'templates-chell-widget',
    'chell-widget.provider',
    'underscore',
    'angular-underscore',
    'ui.bootstrap',
    'translations'
])
    .value('rowTemplate', '<widget-dashboard-row row="row" widget-model="widgetModel" options="options" edit-mode="editMode" ng-repeat="row in column.rows" />')
    .value('columnTemplate', '<widget-dashboard-column column="column" widget-model="widgetModel" options="options" edit-mode="editMode" ng-repeat="column in row.columns" />');