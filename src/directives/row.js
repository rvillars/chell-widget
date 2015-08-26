'use strict';

var chellWidget = angular.module('chell-widget');

chellWidget.directive('widgetDashboardRow', function ($compile, columnTemplate) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        row: '=',
        widgetModel: '=',
        editMode: '=',
        options: '='
      },
      templateUrl: 'templates/dashboard-row.tpl.html',
      link: function ($scope, $element) {
        if (angular.isDefined($scope.row.columns) && angular.isArray($scope.row.columns)) {
          $compile(columnTemplate)($scope, function(cloned) {
            $element.append(cloned);
          });
        }
      }
    };
  });
