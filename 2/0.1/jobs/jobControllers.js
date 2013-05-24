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

  $scope.$on('jobsChanged', function(e) {
    $scope.jobs = jobsService.list.filteredData;
    $scope.totals = jobsService.getTotals();
  });
});
