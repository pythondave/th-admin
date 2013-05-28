var app = angular.module('app', ['ui.bootstrap', 'ngMockE2E', 'ngResource', 'ui.compat']);

app.run(function($rootScope) {
  //global data
  $rootScope.postConfig = { "headers": { "Content-Type": "application/x-www-form-urlencoded" } };

  //create some new generic underscore methods
  _.mixin({ //ref: http://underscorejs.org/#mixin
    compare: function(a, b) { //compares a and b and returns 1 (a first), -1 (b first) or 0 (equal)
      if (a === undefined && b === undefined) return 0;
      if (a === undefined) return -1;
      if (b === undefined) return 1;
      return (a>b?1:(b>a?-1:0));
    },
    deep: function (o, path) { // extracts a value from a nested object using a string path
      //ref: https://gist.github.com/furf/3208381
      // usage: _.deep({ a: { b: { c: { d: ['e', 'f', 'g'] }, 'a.b.c.d[2]'); ==> 'g
      var keys = path.replace(/\[(["']?)([^\1]+?)\1?\]/g, '.$2').replace(/^\./, '').split('.');
      var i = 0, n = keys.length;
      while ((o = o[keys[i++]]) && i < n) {}
      return i < n ? void 0 : o;
    },
    deepCompare: function(o1, o2, path) { //compares 2 deep values (see 'compare' and 'deep')
      return _.compare(_.deep(o1, path), _.deep(o2, path));
    },
    arrayOfValues: function(o) { //returns an array of object values; o: any object (non-circular)
      //can be useful for generic text-search on a an object
      var a = [];
      function traverse(o) {
        for (var i in o) {
          if (typeof o[i] === 'object') { traverse(o[i]); } else { a.push(o[i]); }
        }
      }
      traverse(o);
      return a;
    },
    objectify: function(x, newPropertyName) { //converts x to an object if it isn't one already
      newPropertyName = newPropertyName || 'val';
      if (typeof x === 'object') { return x; } else { var o = {}; o[newPropertyName] = x; return o; }
    },
    objectifyAll: function(arr, newPropertyName) { //'objectifies' all items of an array
      return _.map(arr, function(item) { return _(item).objectify(newPropertyName); });
    },
    addUniqueId: function(o) { //adds a uniqueId to o
      o.id = _.uniqueId();
      return o;
    },
    addUniqueIds: function(arr, newPropertyName) {
      return _.map(arr, function(item) { return _(item).addUniqueId(newPropertyName); });
    }
  });
});

//navbar (top menu)
app.controller('NavBarCtrl', function($scope, $state) {
  $scope.navBarUrl = "shared/navBar.html";
  $scope.menuItems = [
    { name: 'teachers', title: 'Teachers' },
    { name: 'jobs', title: 'Jobs' },
    { name: 'applications', title: 'Applications' }
  ];
  $scope.$on('$stateChangeSuccess', function() {
    $scope.activeMenuItem = $state.current.name;
  });
});

//states (routes) - ref: https://github.com/angular-ui/ui-router
app.config(function($stateProvider) {
  $stateProvider
    .state('teachers', {
      url: '/teachers',
      views: {
        'left': { templateUrl: 'teachers/menu.html', controller: 'TeachersMenuCtrl' },
        'main': { templateUrl: 'teachers/default.html', controller: 'TeachersCtrl' }
      }
    })
    .state('jobs', {
      url: '/jobs',
      views: {
        'left': { templateUrl: 'jobs/menu.html', controller: 'JobsMenuCtrl' },
        'main': { templateUrl: 'jobs/default.html', controller: 'JobsCtrl' }
      }
    })
    .state('job', {
      url: '/jobs/:jobId',
      views: {
        'left': { templateUrl: 'jobs/jobMenu.html', controller: 'JobMenuCtrl' },
        'main': { templateUrl: 'jobs/job.html', controller: 'JobCtrl' }
      }
    })
    .state('applications', {
      url: '/applications',
      views: {
        'left': { templateUrl: 'applications/menu.html', controller: 'ApplicationsMenuCtrl' },
        'main': { templateUrl: 'applications/default.html', controller: 'ApplicationsCtrl' }
      }
    });
});

// keyboard events
app.controller('KeyboardEventCtrl', function($scope, $state) {
  var ctrlIsDown, altIsDown;
  $scope.$on('keydown', function(e, keyCode) {
    if (keyCode === 17) ctrlIsDown = true;
    if (keyCode === 18) altIsDown = true;
    if (ctrlIsDown && altIsDown) {
      if (keyCode == 49 || keyCode == 84) { $state.transitionTo('teachers'); } //1 or t
      if (keyCode == 50 || keyCode == 74) { $state.transitionTo('jobs'); } //2 or j
      if (keyCode == 51 || keyCode == 65) { $state.transitionTo('applications'); } //3 or a
    }
  });
  $scope.$on('keyup', function(e, keyCode) {
    if (keyCode === 17) ctrlIsDown = false;
    if (keyCode === 18) altIsDown = false;
  });
});
