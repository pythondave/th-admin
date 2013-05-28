//Jobs
app.controller('JobsMenuCtrl', function($scope, schoolsService, jobsService) {
  schoolsService.getAndSetData().then(function() {
    $scope.schools = schoolsService.list.data;
    $scope.school = $scope.schools[0];
  });

  $scope.$on('jobsChanged', function(e) {
    $scope.subjects = jobsService.list.summarise('subject');
    $scope.positions = jobsService.list.summarise('position');
  });

  //filter change
  var getValues = function() {
    return { subject: $scope.subject, position: $scope.position, search: $scope.search };
  };
  $scope.$watch(getValues, function(values) { jobsService.filter(values); }, true);

  //school change
  $scope.$watch('school', function(school) {
    jobsService.getAndSetData(school);
  });
});

app.controller('JobsCtrl', function($scope, jobsService) {
  $scope.sort = jobsService.list.sort;
  $scope.totals = {};

  //headers
  var standardHeaders = { applied: 'Applied', putForward: 'Put forward', shortlisted: 'Shortlisted', interviewed: 'Interviewed', offersMade: 'Offers made', accepted: 'Accepted', rejected: 'Rejected' };
  var compactHeaders = { applied: 'A', putForward: 'PF', shortlisted: 'S', interviewed: 'I', offersMade: 'OM', accepted: 'A', rejected: 'R' };
  $scope.$watch('useCompactHeaders', function(value) {
    $scope.header = ( value ? compactHeaders : standardHeaders );
    $scope.header.tips = ( value ? standardHeaders : undefined );
  });

  $scope.$on('jobsChanged', function(e) {
    $scope.jobs = jobsService.list.filteredData;
    $scope.totals = jobsService.getTotals();
  });
});

//Job
app.controller('JobMenuCtrl', function($scope, jobService) {
  $scope.$on('jobsChanged', function(e) {
  });
});

app.controller('JobCtrl', function($scope, $stateParams, jobService, applicationsService, listService) {
  applicationsService.getAndSetData({ jobId: $stateParams.jobId });
  $scope.sort = applicationsService.list.sort;
  applicationsService.list.setSortOrderPaths(['-datePutForward', 'teacher.fullname']);

  //scores
  var scoreMapping = function(score, outOf) { //*** WIP - move to a service
    outOf = outOf || 10;
    if (score/outOf > 0.8) return 'success';
    if (score/outOf > 0.6) return 'warning';
    if (score/outOf > 0.3) return 'info';
    if (score/outOf >= 0) return 'important';
  };
  var badgeClass = function(score, outOf) { //*** WIP - move to a service
    var x = scoreMapping(score, outOf);
    return ( x ? 'badge-' + x : '');
  };
  $scope.scores = [];
  for (var i = 0; i <= 10; i++) {
    $scope.scores.push({ hoverClass: scoreMapping(i, 10)+'-hover' });
  }

  $scope.$on('applicationsChanged', function(e) {
    $scope.applications = applicationsService.list.filteredData;
    _($scope.applications).each(function(a) {
      a.badgeClass = badgeClass(a.score, 10);
      a.daysSincePutForward = (new Date() - new Date(a.datePutForward))/1000/60/60/24;
    });
    $scope.totals = applicationsService.getTotals();
  });

  $scope.$on('jobChanged', function(e) {
    $scope.jobs = jobService.list.filteredData;
  });

  //processing
  $scope.alerts = new listService.List();
  $scope.processWithThrottle = function(application, propertyName, newPropertyValue, processInterval) {
    $scope.processData = { application: application, propertyName: propertyName, newPropertyValue: newPropertyValue };
    if (!application.dirty) {
      $scope.debounceFunction = _.debounce(function() {
        var d = $scope.processData;
        $scope.process(d.application, d.propertyName, d.newPropertyValue);
        d.application.dirty = false;
      }, 2000);
    }
    application.dirty = true;
    $scope.debounceFunction();
  };
  $scope.process = function(application, propertyName, newPropertyValue) {
    var hasValue = !!application[propertyName];
    var dataToPost = {}; dataToPost[propertyName] = newPropertyValue;
    var process = applicationsService.process(application, dataToPost, { removeFromList: false }); //promise
    var alert = {};

    var label = application.teacher.fullname;
    var success = function() {
      setProcessedMessage();
      if (propertyName === 'score') {
        application.score = newPropertyValue;
        application.badgeClass = badgeClass(newPropertyValue, 10);
      } else if (propertyName === 'adminNote') {
      } else {
        if (!newPropertyValue) { delete application[propertyName]; } else { application[propertyName] = (new Date()).toISOString(); }
      }
    };
    var setProcessedMessage = function() { //promise success
      alert.message = 'Updated ' + label;
      alert.type = 'success';
      alert.duration = 2000;
    };
    var setSevereErrorMessage = function() { //promise error
      alert.message = 'Error: Unable to update ' + label;
      alert.type = 'severe-error';
      alert.duration = 10000;
    };

    var displayMessage = function() {
      $scope.alerts.addAndRemoveAfterDelay(alert, true, alert.duration);
    };

    process.then(success, setSevereErrorMessage).then(displayMessage);
  };
  $scope.toggle = function(application, propertyName) { $scope.process(application, propertyName, !application[propertyName]); };
  $scope.closeAlert = function(index) {
    $scope.alerts.removeByIndex(index);
  };
});
