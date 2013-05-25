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

app.controller('JobCtrl', function($scope, $stateParams, jobService, applicationsService) {
  applicationsService.getAndSetData({ jobId: $stateParams.jobId });
  $scope.sort = applicationsService.list.sort;
  applicationsService.list.setSortOrderPaths(['-teacher.datePutForward', 'teacher.fullname']);

  $scope.$on('applicationsChanged', function(e) {
    $scope.applications = applicationsService.list.filteredData;
    _($scope.applications).each(function(a) {
      a.teacher.daysSincePutForward = (new Date() - new Date(a.teacher.datePutForward))/1000/60/60/24;
    });
    $scope.totals = applicationsService.getTotals();
  });

  $scope.badgeClass = function(score, outOf) { //*** WIP - will probably move to a service once discussed
    outOf = outOf || 10;
    if (score/outOf > 0.8) return 'badge-success';
    if (score/outOf > 0.6) return 'badge-warning';
    if (score/outOf > 0.3) return 'badge-info';
    if (score/outOf >= 0) return 'badge-important';
    return '';
  };

  $scope.$on('jobChanged', function(e) {
    $scope.jobs = jobService.list.filteredData;
  });
});
