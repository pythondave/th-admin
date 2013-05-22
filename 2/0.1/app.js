var app = angular.module('app', ['ui.bootstrap', 'ngMockE2E', 'ngResource', 'ui.compat']);

// *** WIP - ref: http://plnkr.co/edit/mCt85P?p=preview
app.directive('keyboardEvent', function() {
  return function($scope, $elem, attr) {
    $elem.bind('keydown', function(e) {
      e.stopPropagation();
      $scope.$apply(function() { $scope.$emit('keydown', e.which);});
    });
    $elem.bind('keypress', function(e) {
      e.stopPropagation();
      $scope.$apply(function() { $scope.$emit('keypress', e.which); });
    });
    $elem.bind('keyup', function(e) {
      e.stopPropagation();
      $scope.$apply(function() { $scope.$emit('keyup', e.which); });
    });
  };
});

//states (routes) - ref: https://github.com/angular-ui/ui-router
app.config(function($stateProvider) {
  $stateProvider
    .state('teachers', {
      url: '/teachers',
      views: {
        'left': { templateUrl: 'partials/teachers/menu.html', controller: 'TeachersMenuCtrl' },
        'main': { templateUrl: 'partials/teachers/default.html', controller: 'TeachersCtrl' }
      }
    })
    .state('jobs', {
      url: '/jobs',
      views: {
        'left': { templateUrl: 'partials/jobs/menu.html', controller: 'JobsMenuCtrl' },
        'main': { templateUrl: 'partials/jobs/default.html', controller: 'JobsCtrl' }
      }
    })
    .state('applications', {
      url: '/applications',
      views: {
        'left': { templateUrl: 'partials/applications/menu.html', controller: 'ApplicationsMenuCtrl' },
        'main': { templateUrl: 'partials/applications/default.html', controller: 'ApplicationsCtrl' }
      }
    });
});

// *** WIP
app.controller('KeyboardEventCtrl', function($scope, $state) {
  $scope.ctrlAlt = 0;
  $scope.$on('keydown', function(e, keyCode) {
    if (keyCode == 18 || keyCode == 17) { $scope.ctrlAlt += keyCode; }
    if ($scope.ctrlAlt === 0) return;
    if (keyCode == 49 || keyCode == 84) { $state.transitionTo('teachers'); } //1 or t
    if (keyCode == 50 || keyCode == 74) { $state.transitionTo('jobs'); } //2 or j
    if (keyCode == 51 || keyCode == 65) { $state.transitionTo('applications'); } //3 or a
  });
  $scope.$on('keyup', function(e, keyCode) {
    if (keyCode == 17 || keyCode == 18) { $scope.ctrlAlt = 0; }
  });
});

//top/navbar
app.controller('NavBarCtrl', function($scope, $state) {
  $scope.navBarUrl = "partials/navBar.html";
  $scope.menuItems = [
    { name: 'teachers', title: 'Teachers' },
    { name: 'jobs', title: 'Jobs' },
    { name: 'applications', title: 'Applications' }
  ];
  $scope.$on('$stateChangeSuccess', function() {
    $scope.activeMenuItem = $state.current.name;
  });
});

//teachers
app.controller('TeachersMenuCtrl', function($scope, positionsService) {
  $scope.positions = positionsService.list;
});

app.controller('TeachersCtrl', function($scope, listService, candidatesService) {
  candidatesService.getAndSetData.then(function() {
    $scope.candidates = candidatesService.data;
  });
  $scope.alerts = new listService.List();

  $scope.process = function(index, status) {
    var candidate = candidatesService.data[index];
    var processByIndex = candidatesService.processByIndex(index, status); //promise
    var alert = {};

    var setProcessedMessage = function() { //promise success
      alert.message = (status === 1 ? 'Approved ' : 'Declined ') + candidate.fullname;
      alert.type = (status === 1 ? 'success' : 'error');
      alert.duration = 5000;
    };

    var setSevereErrorMessage = function() { //promise error
      alert.message = 'Error: Unable to process ' + candidate.fullname;
      alert.type = 'severe-error';
      alert.duration = 30000;
    };

    var displayMessage = function() {
      $scope.alerts.addAndRemoveAfterDelay(alert, true, alert.duration);
    };

    processByIndex.then(setProcessedMessage, setSevereErrorMessage).then(displayMessage);
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.removeByIndex(index);
  };
});

//jobs
app.controller('JobsMenuCtrl', function($scope, positionsService) {
});

app.controller('JobsCtrl', function($scope, listService, jobsService) {
  jobsService.getAndSetData.then(function() {
    $scope.jobs = jobsService.data;
  });
});

//applications
app.controller('ApplicationsMenuCtrl', function($scope, positionsService) {
});

app.controller('ApplicationsCtrl', function($scope, listService, applicationsService) {
  applicationsService.getAndSetData.then(function() {
    $scope.applications = applicationsService.data;
  });
  $scope.alerts = new listService.List();

  var previousSort = { asc: true };
  $scope.sort = function(name) { //*** WIP - move to service
    var asc = (name == previousSort.name ? !previousSort.asc : true);
    $scope.applications.sort(function(a1, a2) {
      var test = (a1.teacher.score < a2.teacher.score);
      return (asc ? test : !test);
    });
    previousSort = { name: name, asc: asc };
  };

  $scope.process = function(index, status) {
    var application = applicationsService.data[index];
    var processByIndex = applicationsService.processByIndex(index, status); //promise
    var alert = {};

    var setProcessedMessage = function() { //promise success
      alert.message = (status === 1 ? 'Put forward ' : 'Declined ') + application.fullname + ' - ' + application.subject;
      alert.type = (status === 1 ? 'success' : 'error');
      alert.duration = 5000;
    };

    var setSevereErrorMessage = function() { //promise error
      alert.message = 'Error: Unable to process ' + application.fullname;
      alert.type = 'severe-error';
      alert.duration = 30000;
    };

    var displayMessage = function() {
      $scope.alerts.addAndRemoveAfterDelay(alert, true, alert.duration);
    };

    processByIndex.then(setProcessedMessage, setSevereErrorMessage).then(displayMessage);
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.removeByIndex(index);
  };
});
