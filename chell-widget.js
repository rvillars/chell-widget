'use strict';
// Source: build/locale-en.js
try {
  angular.module('translations');
} catch (e) {
  angular.module('translations', ['pascalprecht.translate']);
}

angular.module('translations').config(['$translateProvider',
  function ($translateProvider) {
    $translateProvider.translations('en', {});
    $translateProvider.preferredLanguage('en');
  }
]);
;// Source: build/module.js
var chellWidgetProvider = angular.module('chell-widget.provider', []);
var chellWidget = angular.module('chell-widget', [
    'templates-chell-widget',
    'chell-widget.provider',
    'underscore',
    'angular-underscore',
    'ui.bootstrap',
    'translations'
  ]).value('rowTemplate', '<widget-dashboard-row row="row" widget-model="widgetModel" options="options" edit-mode="editMode" ng-repeat="row in column.rows" />').value('columnTemplate', '<widget-dashboard-column column="column" widget-model="widgetModel" options="options" edit-mode="editMode" ng-repeat="column in row.columns" />');;// Source: build/models.js
var chellWidget = angular.module('chell-widget');;// Source: build/controllers.js
var chellWidget = angular.module('chell-widget');;// Source: build/provider.js
var chellWidgetProvider = angular.module('chell-widget.provider');
chellWidgetProvider.provider('dashboard', function () {
  var widgets = {};
  var widgetsPath = '';
  var structures = {};
  var messageTemplate = '<div class="alert alert-danger">{}</div>';
  var loadingTemplate = '<div class="progress progress-striped active">\n<div class="progress-bar" role="progressbar" style="width: 100%">\n<span class="sr-only">loading ...</span>\n</div>\n</div>';
  this.widget = function (name, widget) {
    var w = angular.extend({ reload: false }, widget);
    if (w.edit) {
      var edit = { reload: true };
      angular.extend(edit, w.edit);
      w.edit = edit;
    }
    widgets[name] = w;
    return this;
  };
  this.widgetsPath = function (path) {
    widgetsPath = path;
    return this;
  };
  this.structure = function (name, structure) {
    structures[name] = structure;
    return this;
  };
  this.messageTemplate = function (template) {
    messageTemplate = template;
    return this;
  };
  this.loadingTemplate = function (template) {
    loadingTemplate = template;
    return this;
  };
  this.$get = function () {
    var cid = 0;
    return {
      widgets: widgets,
      widgetsPath: widgetsPath,
      structures: structures,
      messageTemplate: messageTemplate,
      loadingTemplate: loadingTemplate,
      id: function () {
        return ++cid;
      }
    };
  };
});;// Source: build/structures.js
angular.module('chell-widget.structures', ['chell-widget']).config([
  'dashboardProvider',
  function (dashboardProvider) {
    dashboardProvider.structure('6-6', {
      rows: [{
          columns: [
            { styleClass: 'col-md-6' },
            { styleClass: 'col-md-6' }
          ]
        }]
    }).structure('4-8', {
      rows: [{
          columns: [
            {
              styleClass: 'col-md-4',
              widgets: []
            },
            {
              styleClass: 'col-md-8',
              widgets: []
            }
          ]
        }]
    }).structure('12/4-4-4', {
      rows: [
        { columns: [{ styleClass: 'col-md-12' }] },
        {
          columns: [
            { styleClass: 'col-md-4' },
            { styleClass: 'col-md-4' },
            { styleClass: 'col-md-4' }
          ]
        }
      ]
    }).structure('4-4-4/12', {
      rows: [
        {
          columns: [
            { styleClass: 'col-md-4' },
            { styleClass: 'col-md-4' },
            { styleClass: 'col-md-4' }
          ]
        },
        { columns: [{ styleClass: 'col-md-12' }] }
      ]
    }).structure('12/6-6', {
      rows: [
        { columns: [{ styleClass: 'col-md-12' }] },
        {
          columns: [
            { styleClass: 'col-md-6' },
            { styleClass: 'col-md-6' }
          ]
        }
      ]
    }).structure('6-6/12', {
      rows: [
        {
          columns: [
            { styleClass: 'col-md-6' },
            { styleClass: 'col-md-6' }
          ]
        },
        { columns: [{ styleClass: 'col-md-12' }] }
      ]
    }).structure('12/6-6/12', {
      rows: [
        { columns: [{ styleClass: 'col-md-12' }] },
        {
          columns: [
            { styleClass: 'col-md-6' },
            { styleClass: 'col-md-6' }
          ]
        },
        { columns: [{ styleClass: 'col-md-12' }] }
      ]
    }).structure('3-9 (12/6-6)', {
      rows: [{
          columns: [
            { styleClass: 'col-md-3' },
            {
              styleClass: 'col-md-9',
              rows: [
                { columns: [{ styleClass: 'col-md-12' }] },
                {
                  columns: [
                    { styleClass: 'col-md-6' },
                    { styleClass: 'col-md-6' }
                  ]
                }
              ]
            }
          ]
        }]
    });
  }
]);;// Source: build/directives/column.js
var chellWidget = angular.module('chell-widget');
chellWidget.directive('widgetDashboardColumn', [
  '$log',
  '$compile',
  'rowTemplate',
  'dashboard',
  function ($log, $compile, rowTemplate, dashboard) {
    function moveWidgetInColumn($scope, column, evt) {
      var widgets = column.widgets;
      $scope.$apply(function () {
        widgets.splice(evt.newIndex, 0, widgets.splice(evt.oldIndex, 1)[0]);
      });
    }
    function findWidget(column, index) {
      var widget = null;
      for (var i = 0; i < column.widgets.length; i++) {
        var w = column.widgets[i];
        if (w.wid === index) {
          widget = w;
          break;
        }
      }
      return widget;
    }
    function findColumn(model, index) {
      var column = null;
      for (var i = 0; i < model.rows.length; i++) {
        var r = model.rows[i];
        for (var j = 0; j < r.columns.length; j++) {
          var c = r.columns[j];
          if (c.cid === index) {
            column = c;
            break;
          } else if (c.rows) {
            column = findColumn(c, index);
          }
        }
        if (column) {
          break;
        }
      }
      return column;
    }
    function getId(el) {
      var id = el.getAttribute('widget-id');
      return id ? parseInt(id) : -1;
    }
    function addWidgetToColumn($scope, model, targetColumn, evt) {
      var cid = getId(evt.from);
      var sourceColumn = findColumn(model, cid);
      if (sourceColumn) {
        var wid = getId(evt.item);
        var widget = findWidget(sourceColumn, wid);
        if (widget) {
          $scope.$apply(function () {
            if (!targetColumn.widgets) {
              targetColumn.widgets = [];
            }
            targetColumn.widgets.splice(evt.newIndex, 0, widget);
          });
        } else {
          $log.warn('could not find widget with id ' + wid);
        }
      } else {
        $log.warn('could not find column with id ' + cid);
      }
    }
    function removeWidgetFromColumn($scope, column, evt) {
      $scope.$apply(function () {
        column.widgets.splice(evt.oldIndex, 1);
      });
    }
    function applySortable($scope, $element, model, column) {
      var el = $element[0];
      var sortable = Sortable.create(el, {
          group: 'widgets',
          handle: '.widget-move',
          ghostClass: 'placeholder',
          animation: 150,
          onAdd: function (evt) {
            addWidgetToColumn($scope, model, column, evt);
          },
          onRemove: function (evt) {
            removeWidgetFromColumn($scope, column, evt);
          },
          onUpdate: function (evt) {
            moveWidgetInColumn($scope, column, evt);
          }
        });
      $element.on('$destroy', function () {
        sortable.destroy();
      });
    }
    return {
      restrict: 'E',
      replace: true,
      scope: {
        column: '=',
        editMode: '=',
        widgetModel: '=',
        options: '='
      },
      templateUrl: 'templates/dashboard-column.tpl.html',
      link: function ($scope, $element) {
        var col = $scope.column;
        if (!col.cid) {
          col.cid = dashboard.id();
        }
        if (angular.isDefined(col.rows) && angular.isArray(col.rows)) {
          $compile(rowTemplate)($scope, function (cloned) {
            $element.append(cloned);
          });
        } else {
          applySortable($scope, $element, $scope.widgetModel, col);
        }
      }
    };
  }
]);;// Source: build/directives/dashboard.js
var chellWidget = angular.module('chell-widget');
chellWidget.directive('widgetDashboard', [
  '$rootScope',
  '$log',
  '$modal',
  'dashboard',
  function ($rootScope, $log, $modal, dashboard) {
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
    function fillStructure(root, columns, counter) {
      counter = counter || 0;
      if (angular.isDefined(root.rows)) {
        angular.forEach(root.rows, function (row) {
          angular.forEach(row.columns, function (column) {
            if (!column.widgets) {
              column.widgets = [];
            }
            if (angular.isDefined(columns[counter])) {
              if (!angular.isDefined(column.rows)) {
                copyWidgets(columns[counter], column);
                counter++;
              }
            }
            counter = fillStructure(column, columns, counter);
          });
        });
      }
      return counter;
    }
    function readColumns(root, columns) {
      columns = columns || [];
      if (angular.isDefined(root.rows)) {
        angular.forEach(root.rows, function (row) {
          angular.forEach(row.columns, function (col) {
            columns.push(col);
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
      controller: [
        '$scope',
        function ($scope) {
          var model = {};
          var structure = {};
          var widgetFilter = null;
          var structureName = {};
          var name = $scope.name;
          $scope.$watch('widgetModel', function (oldVal, newVal) {
            if (newVal !== null || oldVal === null && newVal === null) {
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
                  model.title = '\xa0';
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
            $rootScope.$broadcast('widgetDashboardCollapseExapand', { collapseExpandStatus: collapseExpandStatus });
          };
          $scope.cancelEditMode = function () {
            $scope.editMode = false;
            $scope.modelCopy = angular.copy($scope.modelCopy, $scope.widgetModel);
            $rootScope.$broadcast('widgetDashboardEditsCancelled');
          };
          $scope.editDashboardDialog = function () {
            var editDashboardScope = $scope.$new();
            editDashboardScope.copy = { title: model.title };
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
              model.title = editDashboardScope.copy.title;
              instance.close();
              editDashboardScope.$destroy();
            };
          };
          $scope.resetDashboard = function () {
            $rootScope.$broadcast('widgetDashboardReset', name);
          };
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
              instance.close();
              addScope.$destroy();
            };
            addScope.closeDialog = function () {
              instance.close();
              addScope.$destroy();
            };
          };
        }
      ],
      link: function ($scope, $element, $attr) {
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
  }
]);;// Source: build/directives/row.js
var chellWidget = angular.module('chell-widget');
chellWidget.directive('widgetDashboardRow', [
  '$compile',
  'columnTemplate',
  function ($compile, columnTemplate) {
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
          $compile(columnTemplate)($scope, function (cloned) {
            $element.append(cloned);
          });
        }
      }
    };
  }
]);;// Source: build/directives/widget-content.js
var chellWidget = angular.module('chell-widget');
chellWidget.directive('widgetContent', [
  '$log',
  '$q',
  '$sce',
  '$http',
  '$templateCache',
  '$compile',
  '$controller',
  '$injector',
  'dashboard',
  function ($log, $q, $sce, $http, $templateCache, $compile, $controller, $injector, dashboard) {
    function parseUrl(url) {
      var parsedUrl = url;
      if (url.indexOf('{widgetsPath}') >= 0) {
        parsedUrl = url.replace('{widgetsPath}', dashboard.widgetsPath).replace('//', '/');
        if (parsedUrl.indexOf('/') === 0) {
          parsedUrl = parsedUrl.substring(1);
        }
      }
      return parsedUrl;
    }
    function getTemplate(widget) {
      var deferred = $q.defer();
      if (widget.template) {
        deferred.resolve(widget.template);
      } else if (widget.templateUrl) {
        var tpl = $templateCache.get(widget.templateUrl);
        if (tpl) {
          deferred.resolve(tpl);
        } else {
          var url = $sce.getTrustedResourceUrl(parseUrl(widget.templateUrl));
          $http.get(url).success(function (response) {
            $templateCache.put(widget.templateUrl, response);
            deferred.resolve(response);
          }).error(function () {
            deferred.reject('could not load template');
          });
        }
      }
      return deferred.promise;
    }
    function compileWidget($scope, $element, currentScope) {
      var model = $scope.model;
      var content = $scope.content;
      $element.html(dashboard.loadingTemplate);
      var templateScope = $scope.$new();
      if (!model.config) {
        model.config = {};
      }
      templateScope.config = model.config;
      var base = {
          $scope: templateScope,
          widget: model,
          config: model.config
        };
      var resolvers = {};
      resolvers.$tpl = getTemplate(content);
      if (content.resolve) {
        angular.forEach(content.resolve, function (promise, key) {
          if (angular.isString(promise)) {
            resolvers[key] = $injector.get(promise);
          } else {
            resolvers[key] = $injector.invoke(promise, promise, base);
          }
        });
      }
      $q.all(resolvers).then(function (locals) {
        angular.extend(locals, base);
        var template = locals.$tpl;
        $element.html(template);
        if (content.controller) {
          var templateCtrl = $controller(content.controller, locals);
          if (content.controllerAs) {
            templateScope[content.controllerAs] = templateCtrl;
          }
          $element.children().data('$ngControllerController', templateCtrl);
        }
        $compile($element.contents())(templateScope);
      }, function (reason) {
        var msg = 'Could not resolve all promises';
        if (reason) {
          msg += ': ' + reason;
        }
        $log.warn(msg);
        $element.html(dashboard.messageTemplate.replace(/{}/g, msg));
      });
      if (currentScope) {
        currentScope.$destroy();
      }
      return templateScope;
    }
    return {
      replace: true,
      restrict: 'EA',
      transclude: false,
      scope: {
        model: '=',
        content: '='
      },
      link: function ($scope, $element) {
        var currentScope = compileWidget($scope, $element, null);
        $scope.$on('widgetConfigChanged', function () {
          currentScope = compileWidget($scope, $element, currentScope);
        });
        $scope.$on('widgetReload', function () {
          currentScope = compileWidget($scope, $element, currentScope);
        });
      }
    };
  }
]);;// Source: build/directives/widget.js
var chellWidget = angular.module('chell-widget');
chellWidget.directive('widget', [
  '$log',
  '$modal',
  'dashboard',
  function ($log, $modal, dashboard) {
    function preLink($scope) {
      var definition = $scope.definition;
      if (definition) {
        var w = dashboard.widgets[definition.type];
        if (w) {
          if (!definition.title) {
            definition.title = w.title;
          }
          if (!definition.titleTemplateUrl) {
            definition.titleTemplateUrl = 'templates/widget-title.tpl.html';
          }
          if (!definition.wid) {
            definition.wid = dashboard.id();
          }
          $scope.widget = angular.copy(w);
          var config = definition.config;
          if (config) {
            if (angular.isString(config)) {
              config = angular.fromJson(config);
            }
          } else {
            config = {};
          }
          $scope.config = config;
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
        $scope.reload = function () {
          $scope.$broadcast('widgetReload');
        };
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
      controller: [
        '$scope',
        function ($scope) {
          $scope.$on('widgetDashboardCollapseExapand', function (event, args) {
            $scope.widgetState.isCollapsed = args.collapseExpandStatus;
            $scope.widgetState.isFullscreen = false;
          });
        }
      ],
      compile: function compile() {
        return {
          pre: preLink,
          post: postLink
        };
      }
    };
  }
]);;// Source: build/widgets/iframe/iframe.js
angular.module('chell-widget.iframe', ['chell-widget.provider']).config([
  'dashboardProvider',
  function (dashboardProvider) {
    dashboardProvider.widget('iframe', {
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
      edit: { templateUrl: 'widgets/iframe/edit.tpl.html' }
    });
  }
]).controller('iframeController', [
  '$scope',
  '$sce',
  'config',
  function ($scope, $sce, config) {
    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };
  }
]);;// Source: build/widgets/randommsg.js
angular.module('chell-widget.randommsg', ['chell-widget.provider']).config([
  'dashboardProvider',
  function (dashboardProvider) {
    dashboardProvider.widget('randommsg', {
      title: 'Random Message',
      description: 'Display a random quote of Douglas Adams',
      templateUrl: 'templates/view.tpl.html',
      controller: 'randommsgCtrl'
    });
  }
]).service('randommsgService', function () {
  var msgs = [
      'There is a theory which states that if ever anyone discovers exactly what the Universe is for and why it is here, it will instantly disappear and be replaced by something even more bizarre and inexplicable. There is another theory which states that this has already happened.',
      'Many were increasingly of the opinion that they\u2019d all made a big mistake in coming down from the trees in the first place. And some said that even the trees had been a bad move, and that no one should ever have left the oceans.',
      '\u201cMy doctor says that I have a malformed public-duty gland and a natural deficiency in moral fibre,\u201d Ford muttered to himself, \u201cand that I am therefore excused from saving Universes.\u201d',
      'The ships hung in the sky in much the same way that bricks don\u2019t.',
      '\u201cYou know,\u201d said Arthur, \u201cit\u2019s at times like this, when I\u2019m trapped in a Vogon airlock with a man from Betelgeuse, and about to die of asphyxiation in deep space that I really wish I\u2019d listened to what my mother told me when I was young.\u201d',
      '\u201cWhy, what did she tell you?\u201d',
      '\u201cI don\u2019t know, I didn\u2019t listen.\u201d',
      '\u201cSpace,\u201d it says, \u201cis big. Really big. You just won\u2019t believe how vastly, hugely, mindbogglingly big it is. I mean, you may think it\u2019s a long way down the road to the chemist\u2019s, but that\u2019s just peanuts to space.\u201d',
      '\u201cFunny,\u201d he intoned funereally, \u201chow just when you think life can\u2019t possibly get any worse it suddenly does.\u201d',
      'Isn\u2019t it enough to see that a garden is beautiful without having to believe that there are fairies at the bottom of it too?',
      'A common mistake that people make when trying to design something completely foolproof is to underestimate the ingenuity of complete fools.',
      'Curiously enough, the only thing that went through the mind of the bowl of petunias as it fell was Oh no, not again. Many people have speculated that if we knew exactly why the bowl of petunias had thought that we would know a lot more about the nature of the Universe than we do now.',
      'The reason why it was published in the form of a micro sub meson electronic component is that if it were printed in normal book form, an interstellar hitchhiker would require several inconveniently large buildings to carry it around in.',
      'For instance, on the planet Earth, man had always assumed that he was more intelligent than dolphins because he had achieved so much \u2014 the wheel, New York, wars and so on \u2014 whilst all the dolphins had ever done was muck about in the water having a good time. But conversely, the dolphins had always believed that they were far more intelligent than man \u2014 for precisely the same reasons.',
      'The last ever dolphin message was misinterpreted as a surprisingly sophisticated attempt to do a double-backwards-somersault through a hoop whilst whistling the \u2018Star Spangled Banner\u2019, but in fact the message was this: So long and thanks for all the fish.',
      'The chances of finding out what\u2019s really going on in the universe are so remote, the only thing to do is hang the sense of it and keep yourself occupied.',
      '\u201cListen, three eyes,\u201d he said, \u201cdon\u2019t you try to outweird me, I get stranger things than you free with my breakfast cereal.\u201d',
      '\u201cForty-two,\u201d said Deep Thought, with infinite majesty and calm.',
      'Not unnaturally, many elevators imbued with intelligence and precognition became terribly frustrated with the mindless business of going up and down, up and down, experimented briefly with the notion of going sideways, as a sort of existential protest, demanded participation in the decision-making process and finally took to squatting in basements sulking.',
      'The Total Perspective Vortex derives its picture of the whole Universe on the principle of extrapolated matter analyses.To explain \u2014 since every piece of matter in the Universe is in some way affected by every other piece of matter in the Universe, it is in theory possible to extrapolate the whole of creation \u2014 every sun, every planet, their orbits, their composition and their economic and social history from, say, one small piece of fairy cake. The man who invented the Total Perspective Vortex did so basically in order to annoy his wife.',
      '\u201cShee, you guys are so unhip it\u2019s a wonder your bums don\u2019t fall off.\u201d',
      'It is known that there are an infinite number of worlds, simply because there is an infinite amount of space for them to be in. However, not every one of them is inhabited. Therefore, there must be a finite number of inhabited worlds. Any finite number divided by infinity is as near to nothing as makes no odds, so the average population of all the planets in the Universe can be said to be zero. From this it follows that the population of the whole Universe is also zero, and that any people you may meet from time to time are merely the products of a deranged imagination.',
      'The disadvantages involved in pulling lots of black sticky slime from out of the ground where it had been safely hidden out of harm\u2019s way, turning it into tar to cover the land with, smoke to fill the air with and pouring the rest into the sea, all seemed to outweigh the advantages of being able to get more quickly from one place to another.',
      'Make it totally clear that this gun has a right end and a wrong end. Make it totally clear to anyone standing at the wrong end that things are going badly for them. If that means sticking all sort of spikes and prongs and blackened bits all over it then so be it. This is not a gun for hanging over the fireplace or sticking in the umbrella stand, it is a gun for going out and making people miserable with.',
      'It is a well known fact that those people who most want to rule people are, ipso facto, those least suited to do it. To summarize the summary: anyone who is capable of getting themselves made President should on no account be allowed to do the job.',
      '\u201cSince we decided a few weeks ago to adopt the leaf as legal tender, we have, of course, all become immensely rich.\u201d',
      'In the end, it was the Sunday afternoons he couldn\u2019t cope with, and that terrible listlessness that starts to set in about 2:55, when you know you\u2019ve taken all the baths that you can usefully take that day, that however hard you stare at any given paragraph in the newspaper you will never actually read it, or use the revolutionary new pruning technique it describes, and that as you stare at the clock the hands will move relentlessly on to four o\u2019clock, and you will enter the long dark teatime of the soul.',
      'He gazed keenly into the distance and looked as if he would quite like the wind to blow his hair back dramatically at that point, but the wind was busy fooling around with some leaves a little way off.',
      '\u201cHe was staring at the instruments with the air of one who is trying to convert Fahrenheit to centigrade in his head while his house is burning down.\u201d',
      'There is a moment in every dawn when light floats, there is the possibility of magic. Creation holds its breath.',
      '\u201cYou may not instantly see why I bring the subject up, but that is because my mind works so phenomenally fast, and I am at a rough estimate thirty billion times more intelligent than you. Let me give you an example. Think of a number, any number.\u201d\n\u201cEr, five,\u201d said the mattress.\n\u201cWrong,\u201d said Marvin. \u201cYou see?\u201d',
      'There is an art, it says, or rather, a knack to flying. The knack lies in learning how to throw yourself at the ground and miss.',
      'It is a mistake to think you can solve any major problems just with potatoes.',
      'He hoped and prayed that there wasn\u2019t an afterlife. Then he realized there was a contradiction involved here and merely hoped that there wasn\u2019t an afterlife.',
      'Eskimos had over two hundred different words for snow, without which their conversation would probably have got very monotonous. So they would distinguish between thin snow and thick snow, light snow and heavy snow, sludgy snow, brittle snow, snow that came in flurries, snow that came in drifts, snow that came in on the bottom of your neighbor\u2019s boots all over your nice clean igloo floor, the snows of winter, the snows of spring, the snows you remember from your childhood that were so much better than any of your modern snow, fine snow, feathery snow, hill snow, valley snow, snow that falls in the morning, snow that falls at night, snow that falls all of a sudden just when you were going out fishing, and snow that despite all your efforts to train them, the huskies have pissed on.',
      'The storm had now definitely abated, and what thunder there was now grumbled over more distant hills, like a man saying \u201cAnd another thing\u2026\u201d twenty minutes after admitting he\u2019s lost the argument.',
      'He was wrong to think he could now forget that the big, hard, oily, dirty, rainbow-hung Earth on which he lived was a microscopic dot on a microscopic dot lost in the unimaginable infinity of the Universe.',
      '\u201cIt seemed to me,\u201d said Wonko the Sane, \u201cthat any civilization that had so far lost its head as to need to include a set of detailed instructions for use in a packet of toothpicks, was no longer a civilization in which I could live and stay sane.\u201d',
      '\u201cNothing travels faster than the speed of light with the possible exception of bad news, which obeys its own special laws.\u201d',
      'The last time anybody made a list of the top hundred character attributes of New Yorkers, common sense snuck in at number 79.',
      'Protect me from knowing what I don\u2019t need to know. Protect me from even knowing that there are things to know that I don\u2019t know. Protect me from knowing that I decided not to know about the things that I decided not to know about. Amen.',
      'All you really need to know for the moment is that the universe is a lot more complicated than you might think, even if you start from a position of thinking it\u2019s pretty damn complicated in the first place.',
      'In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move.',
      'Don\u2019t Panic.'
    ];
  return {
    get: function () {
      return {
        text: msgs[Math.floor(Math.random() * msgs.length)],
        author: 'Douglas Adams'
      };
    }
  };
}).controller('randommsgCtrl', [
  '$scope',
  'randommsgService',
  function ($scope, randommsgService) {
    $scope.msg = randommsgService.get();
  }
]);;// Source: build/widgets/randommsg/randommsg.js
angular.module('chell-widget.randommsg', ['chell-widget.provider']).config([
  'dashboardProvider',
  function (dashboardProvider) {
    dashboardProvider.widget('randommsg', {
      title: 'Random Message',
      description: 'Display a random quote of Douglas Adams',
      templateUrl: 'widgets/randommsg/view.tpl.html',
      controller: 'randommsgCtrl'
    });
  }
]).service('randommsgService', function () {
  var msgs = [
      'There is a theory which states that if ever anyone discovers exactly what the Universe is for and why it is here, it will instantly disappear and be replaced by something even more bizarre and inexplicable. There is another theory which states that this has already happened.',
      'Many were increasingly of the opinion that they\u2019d all made a big mistake in coming down from the trees in the first place. And some said that even the trees had been a bad move, and that no one should ever have left the oceans.',
      '\u201cMy doctor says that I have a malformed public-duty gland and a natural deficiency in moral fibre,\u201d Ford muttered to himself, \u201cand that I am therefore excused from saving Universes.\u201d',
      'The ships hung in the sky in much the same way that bricks don\u2019t.',
      '\u201cYou know,\u201d said Arthur, \u201cit\u2019s at times like this, when I\u2019m trapped in a Vogon airlock with a man from Betelgeuse, and about to die of asphyxiation in deep space that I really wish I\u2019d listened to what my mother told me when I was young.\u201d',
      '\u201cWhy, what did she tell you?\u201d',
      '\u201cI don\u2019t know, I didn\u2019t listen.\u201d',
      '\u201cSpace,\u201d it says, \u201cis big. Really big. You just won\u2019t believe how vastly, hugely, mindbogglingly big it is. I mean, you may think it\u2019s a long way down the road to the chemist\u2019s, but that\u2019s just peanuts to space.\u201d',
      '\u201cFunny,\u201d he intoned funereally, \u201chow just when you think life can\u2019t possibly get any worse it suddenly does.\u201d',
      'Isn\u2019t it enough to see that a garden is beautiful without having to believe that there are fairies at the bottom of it too?',
      'A common mistake that people make when trying to design something completely foolproof is to underestimate the ingenuity of complete fools.',
      'Curiously enough, the only thing that went through the mind of the bowl of petunias as it fell was Oh no, not again. Many people have speculated that if we knew exactly why the bowl of petunias had thought that we would know a lot more about the nature of the Universe than we do now.',
      'The reason why it was published in the form of a micro sub meson electronic component is that if it were printed in normal book form, an interstellar hitchhiker would require several inconveniently large buildings to carry it around in.',
      'For instance, on the planet Earth, man had always assumed that he was more intelligent than dolphins because he had achieved so much \u2014 the wheel, New York, wars and so on \u2014 whilst all the dolphins had ever done was muck about in the water having a good time. But conversely, the dolphins had always believed that they were far more intelligent than man \u2014 for precisely the same reasons.',
      'The last ever dolphin message was misinterpreted as a surprisingly sophisticated attempt to do a double-backwards-somersault through a hoop whilst whistling the \u2018Star Spangled Banner\u2019, but in fact the message was this: So long and thanks for all the fish.',
      'The chances of finding out what\u2019s really going on in the universe are so remote, the only thing to do is hang the sense of it and keep yourself occupied.',
      '\u201cListen, three eyes,\u201d he said, \u201cdon\u2019t you try to outweird me, I get stranger things than you free with my breakfast cereal.\u201d',
      '\u201cForty-two,\u201d said Deep Thought, with infinite majesty and calm.',
      'Not unnaturally, many elevators imbued with intelligence and precognition became terribly frustrated with the mindless business of going up and down, up and down, experimented briefly with the notion of going sideways, as a sort of existential protest, demanded participation in the decision-making process and finally took to squatting in basements sulking.',
      'The Total Perspective Vortex derives its picture of the whole Universe on the principle of extrapolated matter analyses.To explain \u2014 since every piece of matter in the Universe is in some way affected by every other piece of matter in the Universe, it is in theory possible to extrapolate the whole of creation \u2014 every sun, every planet, their orbits, their composition and their economic and social history from, say, one small piece of fairy cake. The man who invented the Total Perspective Vortex did so basically in order to annoy his wife.',
      '\u201cShee, you guys are so unhip it\u2019s a wonder your bums don\u2019t fall off.\u201d',
      'It is known that there are an infinite number of worlds, simply because there is an infinite amount of space for them to be in. However, not every one of them is inhabited. Therefore, there must be a finite number of inhabited worlds. Any finite number divided by infinity is as near to nothing as makes no odds, so the average population of all the planets in the Universe can be said to be zero. From this it follows that the population of the whole Universe is also zero, and that any people you may meet from time to time are merely the products of a deranged imagination.',
      'The disadvantages involved in pulling lots of black sticky slime from out of the ground where it had been safely hidden out of harm\u2019s way, turning it into tar to cover the land with, smoke to fill the air with and pouring the rest into the sea, all seemed to outweigh the advantages of being able to get more quickly from one place to another.',
      'Make it totally clear that this gun has a right end and a wrong end. Make it totally clear to anyone standing at the wrong end that things are going badly for them. If that means sticking all sort of spikes and prongs and blackened bits all over it then so be it. This is not a gun for hanging over the fireplace or sticking in the umbrella stand, it is a gun for going out and making people miserable with.',
      'It is a well known fact that those people who most want to rule people are, ipso facto, those least suited to do it. To summarize the summary: anyone who is capable of getting themselves made President should on no account be allowed to do the job.',
      '\u201cSince we decided a few weeks ago to adopt the leaf as legal tender, we have, of course, all become immensely rich.\u201d',
      'In the end, it was the Sunday afternoons he couldn\u2019t cope with, and that terrible listlessness that starts to set in about 2:55, when you know you\u2019ve taken all the baths that you can usefully take that day, that however hard you stare at any given paragraph in the newspaper you will never actually read it, or use the revolutionary new pruning technique it describes, and that as you stare at the clock the hands will move relentlessly on to four o\u2019clock, and you will enter the long dark teatime of the soul.',
      'He gazed keenly into the distance and looked as if he would quite like the wind to blow his hair back dramatically at that point, but the wind was busy fooling around with some leaves a little way off.',
      '\u201cHe was staring at the instruments with the air of one who is trying to convert Fahrenheit to centigrade in his head while his house is burning down.\u201d',
      'There is a moment in every dawn when light floats, there is the possibility of magic. Creation holds its breath.',
      '\u201cYou may not instantly see why I bring the subject up, but that is because my mind works so phenomenally fast, and I am at a rough estimate thirty billion times more intelligent than you. Let me give you an example. Think of a number, any number.\u201d\n\u201cEr, five,\u201d said the mattress.\n\u201cWrong,\u201d said Marvin. \u201cYou see?\u201d',
      'There is an art, it says, or rather, a knack to flying. The knack lies in learning how to throw yourself at the ground and miss.',
      'It is a mistake to think you can solve any major problems just with potatoes.',
      'He hoped and prayed that there wasn\u2019t an afterlife. Then he realized there was a contradiction involved here and merely hoped that there wasn\u2019t an afterlife.',
      'Eskimos had over two hundred different words for snow, without which their conversation would probably have got very monotonous. So they would distinguish between thin snow and thick snow, light snow and heavy snow, sludgy snow, brittle snow, snow that came in flurries, snow that came in drifts, snow that came in on the bottom of your neighbor\u2019s boots all over your nice clean igloo floor, the snows of winter, the snows of spring, the snows you remember from your childhood that were so much better than any of your modern snow, fine snow, feathery snow, hill snow, valley snow, snow that falls in the morning, snow that falls at night, snow that falls all of a sudden just when you were going out fishing, and snow that despite all your efforts to train them, the huskies have pissed on.',
      'The storm had now definitely abated, and what thunder there was now grumbled over more distant hills, like a man saying \u201cAnd another thing\u2026\u201d twenty minutes after admitting he\u2019s lost the argument.',
      'He was wrong to think he could now forget that the big, hard, oily, dirty, rainbow-hung Earth on which he lived was a microscopic dot on a microscopic dot lost in the unimaginable infinity of the Universe.',
      '\u201cIt seemed to me,\u201d said Wonko the Sane, \u201cthat any civilization that had so far lost its head as to need to include a set of detailed instructions for use in a packet of toothpicks, was no longer a civilization in which I could live and stay sane.\u201d',
      '\u201cNothing travels faster than the speed of light with the possible exception of bad news, which obeys its own special laws.\u201d',
      'The last time anybody made a list of the top hundred character attributes of New Yorkers, common sense snuck in at number 79.',
      'Protect me from knowing what I don\u2019t need to know. Protect me from even knowing that there are things to know that I don\u2019t know. Protect me from knowing that I decided not to know about the things that I decided not to know about. Amen.',
      'All you really need to know for the moment is that the universe is a lot more complicated than you might think, even if you start from a position of thinking it\u2019s pretty damn complicated in the first place.',
      'In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move.',
      'Don\u2019t Panic.'
    ];
  return {
    get: function () {
      return {
        text: msgs[Math.floor(Math.random() * msgs.length)],
        author: 'Douglas Adams'
      };
    }
  };
}).controller('randommsgCtrl', [
  '$scope',
  'randommsgService',
  function ($scope, randommsgService) {
    $scope.msg = randommsgService.get();
  }
]);;// Source: build/templates.js
angular.module('templates-chell-widget', ['templates/dashboard-column.tpl.html', 'templates/dashboard-edit.tpl.html', 'templates/dashboard-row.tpl.html', 'templates/dashboard-title.tpl.html', 'templates/dashboard.tpl.html', 'templates/widget-add.tpl.html', 'templates/widget-edit.tpl.html', 'templates/widget-title.tpl.html', 'templates/widget.tpl.html', 'widgets/iframe/edit.tpl.html', 'widgets/iframe/view.tpl.html', 'widgets/randommsg/view.tpl.html']);

angular.module("templates/dashboard-column.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/dashboard-column.tpl.html",
    "<div widget-id=\"{{column.cid}}\" class=\"column\" ng-class=\"column.styleClass\" ng-model=\"column.widgets\">\n" +
    "    <widget ng-repeat=\"definition in column.widgets\"\n" +
    "                definition=\"definition\"\n" +
    "                column=\"column\"\n" +
    "                edit-mode=\"editMode\"\n" +
    "                options=\"options\"\n" +
    "                widget-state=\"widgetState\"\n" +
    "    />\n" +
    "    <!-- If present, a new row will be injected here -->\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/dashboard-edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/dashboard-edit.tpl.html",
    "<div class=\"modal-header\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"closeDialog()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\">Edit Dashboard</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <form role=\"form\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"dashboardTitle\">Title</label>\n" +
    "      <input type=\"text\" class=\"form-control\" id=\"dashboardTitle\" ng-model=\"copy.title\" required=\"\">\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label>Structure</label>\n" +
    "      <div class=\"radio\" ng-repeat=\"(key, structure) in structures\">\n" +
    "        <label>\n" +
    "          <input type=\"radio\" value=\"{{key}}\" ng-model=\"model.structure\" ng-change=\"changeStructure(key, structure)\"> {{key}}\n" +
    "        </label>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-primary\" ng-click=\"closeDialog()\">Close</button>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/dashboard-row.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/dashboard-row.tpl.html",
    "<div class=\"row\" ng-class=\"row.styleClass\">\n" +
    "    <!-- column template injected here -->\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/dashboard-title.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/dashboard-title.tpl.html",
    "<div style=\"font-size: 16px;\" class=\"pull-right\">\n" +
    "    <a href=\"\" ng-if=\"editMode\" title=\"add new widget\" ng-click=\"addWidgetDialog()\">\n" +
    "        <i class=\"glyphicon glyphicon-plus-sign\"></i>\n" +
    "    </a>\n" +
    "    <a href=\"\" ng-if=\"editMode\" title=\"edit dashboard\" ng-click=\"editDashboardDialog()\">\n" +
    "        <i class=\"glyphicon glyphicon-cog\"></i>\n" +
    "    </a>\n" +
    "    <a href=\"\" ng-if=\"editMode\" title=\"reset dashboard\" ng-click=\"resetDashboard()\">\n" +
    "        <i class=\"glyphicon glyphicon-repeat\"></i>\n" +
    "    </a>\n" +
    "    <a href=\"\" ng-if=\"options.editable\" title=\"{{editMode ? 'save changes' : 'enable edit mode'}}\"\n" +
    "       ng-click=\"toggleEditMode()\">\n" +
    "        <i class=\"glyphicon\" x-ng-class=\"{'glyphicon-edit' : !editMode, 'glyphicon-ok' : editMode}\"></i>\n" +
    "    </a>\n" +
    "    <a href=\"\" ng-if=\"editMode\" title=\"undo changes\" ng-click=\"cancelEditMode()\">\n" +
    "        <i class=\"glyphicon glyphicon-remove widget-flip\"></i>\n" +
    "    </a>\n" +
    "</div>\n" +
    "<h4>\n" +
    "    {{model.title}}\n" +
    "</h4>\n" +
    "\n" +
    "");
}]);

angular.module("templates/dashboard.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/dashboard.tpl.html",
    "<div class=\"dashboard-container\">\n" +
    "\n" +
    "  <div ng-include src=\"model.titleTemplateUrl\"></div>\n" +
    "  <div class=\"dashboard\" x-ng-class=\"{'edit' : editMode}\">\n" +
    "    <widget-dashboard-row row=\"row\"\n" +
    "                       widget-model=\"model\"\n" +
    "                       options=\"options\"\n" +
    "                       ng-repeat=\"row in model.rows\"\n" +
    "                       edit-mode=\"editMode\"\n" +
    "    />\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/widget-add.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/widget-add.tpl.html",
    "<div class=\"modal-header\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"closeDialog()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\">Add new widget</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <div style=\"display: inline-block;\">\n" +
    "    <dl class=\"dl-horizontal\">\n" +
    "      <dt ng-repeat-start=\"(key, widget) in widgets\">\n" +
    "        <a href=\"\" ng-click=\"addWidget(key)\">\n" +
    "          {{widget.title}}\n" +
    "        </a>      \n" +
    "      </dt>\n" +
    "      <dd ng-repeat-end ng-if=\"widget.description\">\n" +
    "        {{widget.description}}\n" +
    "      </dd>\n" +
    "    </dl>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-primary\" ng-click=\"closeDialog()\">Close</button>\n" +
    "</div>");
}]);

angular.module("templates/widget-edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/widget-edit.tpl.html",
    "<div class=\"modal-header\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"closeDialog()\" aria-hidden=\"true\">&times;</button>\n" +
    "  <h4 class=\"modal-title\">{{widget.title}}</h4>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "  <form role=\"form\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"widgetTitle\">Title</label>\n" +
    "      <input type=\"text\" class=\"form-control\" id=\"widgetTitle\" ng-model=\"definition.title\" placeholder=\"Enter title\" required=\"\">\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"widgetHeight\">Height</label>\n" +
    "      <input type=\"text\" class=\"form-control\" id=\"widgetHeight\" ng-model=\"definition.height\" placeholder=\"auto\" required=\"\">\n" +
    "    </div>\n" +
    "  </form>\n" +
    "  <div ng-if=\"widget.edit\">\n" +
    "    <widget-content model=\"definition\" content=\"widget.edit\" />\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button type=\"button\" class=\"btn btn-default\" ng-click=\"closeDialog()\">Cancel</button>\n" +
    "  <button type=\"button\" class=\"btn btn-primary\" ng-click=\"saveDialog()\">Apply</button>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/widget-title.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/widget-title.tpl.html",
    "<h3 class=\"panel-title\">\n" +
    "    {{definition.title}}\n" +
    "    <span class=\"pull-right\">\n" +
    "        <a href=\"\" title=\"reload widget content\" ng-if=\"widget.reload\" ng-click=\"reload()\">\n" +
    "            <i class=\"glyphicon glyphicon-refresh\"></i>\n" +
    "        </a>\n" +
    "        <!-- change widget location -->\n" +
    "        <a href=\"\" title=\"change widget location\" class=\"widget-move\" ng-if=\"editMode\">\n" +
    "            <i class=\"glyphicon glyphicon-move\"></i>\n" +
    "        </a>\n" +
    "        <!-- open edit mode -->\n" +
    "        <a href=\"\" title=\"edit widget configuration\" ng-click=\"edit()\" ng-if=\"editMode\">\n" +
    "            <i class=\"glyphicon glyphicon-cog\"></i>\n" +
    "        </a>\n" +
    "        <!-- Borderless -->\n" +
    "        <a href=\"\" title=\"borderless widget\"\n" +
    "           ng-show=\"options.maximizable && !widgetState.isFullscreen && !widgetState.isCollapsed && !config.borderless\"\n" +
    "           ng-if=\"editMode\"\n" +
    "           ng-click=\"config.borderless = true\">\n" +
    "            <i class=\"glyphicon glyphicon-retweet\"></i>\n" +
    "        </a>\n" +
    "        <a href=\"\" title=\"borderless widget\"\n" +
    "           ng-show=\"options.maximizable && !widgetState.isFullscreen && !widgetState.isCollapsed && config.borderless\"\n" +
    "           ng-if=\"editMode\"\n" +
    "           ng-click=\"config.borderless = false\">\n" +
    "            <i class=\"glyphicon glyphicon-retweet text-muted\"></i>\n" +
    "        </a>\n" +
    "        <!-- fullscreen -->\n" +
    "        <a href=\"\" title=\"fullscreen widget\"\n" +
    "           ng-show=\"options.maximizable && !widgetState.isFullscreen && !widgetState.isCollapsed\"\n" +
    "           ng-if=\"!editMode\"\n" +
    "           ng-click=\"widgetState.isFullscreen = !widgetState.isFullscreen\">\n" +
    "            <i class=\"glyphicon glyphicon-fullscreen\"></i>\n" +
    "        </a>\n" +
    "        <!-- normal -->\n" +
    "        <a href=\"\" title=\"normal widget\" ng-show=\"options.maximizable && widgetState.isFullscreen\"\n" +
    "           ng-click=\"widgetState.isFullscreen = !widgetState.isFullscreen\">\n" +
    "            <i class=\"glyphicon glyphicon-resize-small\"></i>\n" +
    "        </a>\n" +
    "        <!-- collapse -->\n" +
    "        <a href=\"\" title=\"collapse widget\"\n" +
    "           ng-show=\"options.collapsible && !widgetState.isCollapsed && !widgetState.isFullscreen\"\n" +
    "           ng-if=\"!editMode\"\n" +
    "           ng-click=\"widgetState.isCollapsed = !widgetState.isCollapsed\">\n" +
    "            <i class=\"glyphicon glyphicon-minus\"></i>\n" +
    "        </a>\n" +
    "        <!-- expand -->\n" +
    "        <a href=\"\" title=\"expand widget\" ng-show=\"options.collapsible && widgetState.isCollapsed\"\n" +
    "           ng-click=\"widgetState.isCollapsed = !widgetState.isCollapsed\">\n" +
    "            <i class=\"glyphicon glyphicon-plus\"></i>\n" +
    "        </a>\n" +
    "        <!-- remove widget -->\n" +
    "        <a href=\"\" title=\"remove widget\" ng-click=\"close()\" ng-if=\"editMode\">\n" +
    "            <i class=\"glyphicon glyphicon-remove\"></i>\n" +
    "        </a>\n" +
    "    </span>\n" +
    "</h3>");
}]);

angular.module("templates/widget.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/widget.tpl.html",
    "<div widget-id=\"{{definition.wid}}\" widget-type=\"{{definition.type}}\"\n" +
    "     ng-class=\"{'widget-fullscreen': widgetState.isFullscreen, 'widget-borderless': config.borderless, 'view-mode': !editMode}\"\n" +
    "     class=\"widget panel panel-default\">\n" +
    "    <div class=\"panel-heading clearfix\">\n" +
    "        <div ng-include src=\"definition.titleTemplateUrl\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"panel-body\" collapse=\"widgetState.isCollapsed\">\n" +
    "        <div style=\"height: {{widgetState.isFullscreen ? '100%' : definition.height}};\">\n" +
    "            <widget-content model=\"definition\" content=\"widget\"/>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("widgets/iframe/edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/iframe/edit.tpl.html",
    "<div>\n" +
    "    <fieldset>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label for=\"inputSrc\">iFrame URL</label>\n" +
    "            <input class=\"form-control\" id=\"inputSrc\" ng-model=\"config.iFrameSrc\">\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label for=\"inputWidth\">iFrame Width</label>\n" +
    "            <input class=\"form-control\" id=\"inputWidth\" ng-model=\"config.iFrameWidth\">\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label for=\"inputHeight\">iFrame Height</label>\n" +
    "            <input class=\"form-control\" id=\"inputHeight\" ng-model=\"config.iFrameHeight\">\n" +
    "        </div>\n" +
    "    </fieldset>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("widgets/iframe/view.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/iframe/view.tpl.html",
    "<div class=\"iframe\" style=\"height: {{config.iFrameHeight}}\">\n" +
    "  <iframe ng-src=\"{{trustSrc(config.iFrameSrc)}}\" width=\"{{config.iFrameWidth}}\" scrolling=\"auto\" border=\"0\" frameborder=\"0\"></iframe>\n" +
    "</div>");
}]);

angular.module("widgets/randommsg/view.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("widgets/randommsg/view.tpl.html",
    "<blockquote>\n" +
    "  <p>{{msg.text}}</p>\n" +
    "  <small>{{msg.author}}</small>\n" +
    "</blockquote>");
}]);
