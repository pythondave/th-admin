app.controller('ApplicationsMenuCtrl', function($scope, applicationsService) {
  $scope.$on('applicationsChanged', function(e) {
    $scope.schools = applicationsService.list.summarise('job.school');
    $scope.subjects = applicationsService.list.summarise('job.subject');
    $scope.positions = applicationsService.list.summarise('job.position');
  });
  var getValues = function() {
    return { school: $scope.school, subject: $scope.subject, position: $scope.position, search: $scope.search };
  };
  $scope.$watch(getValues, function(values) { applicationsService.filter(values); }, true);
});

app.controller('ApplicationsCtrl', function($scope, listService, applicationsService) {
  applicationsService.getAndSetData();
  $scope.sort = applicationsService.list.sort;

  $scope.$on('applicationsChanged', function(e) {
    $scope.applications = applicationsService.list.filteredData;
  });

  $scope.badgeClass = function(score, outOf) { //*** WIP - will probably move to a service once discussed
    outOf = outOf || 10;
    if (score/outOf > 0.8) return 'badge-success';
    if (score/outOf > 0.6) return 'badge-warning';
    if (score/outOf > 0.3) return 'badge-info';
    if (score/outOf >= 0) return 'badge-important';
    return '';
  };

  //processing
  $scope.alerts = new listService.List();
  $scope.process = function(application, putForward) {
    var dataToPost = { putForward: putForward };
    var process = applicationsService.process(application, dataToPost, { removeFromList: true }); //promise
    var alert = {};

    var label = application.teacher.fullname + ' - ' + application.job.subject;
    var setProcessedMessage = function() { //promise success
      alert.message = (putForward ? 'Put forward ' : 'Declined ') + label;
      alert.type = (putForward ? 'success' : 'error');
      alert.duration = 5000;
    };
    var setSevereErrorMessage = function() { //promise error
      alert.message = 'Error: Unable to process ' + label;
      alert.type = 'severe-error';
      alert.duration = 30000;
    };

    var displayMessage = function() {
      $scope.alerts.addAndRemoveAfterDelay(alert, true, alert.duration);
    };

    process.then(setProcessedMessage, setSevereErrorMessage).then(displayMessage);
  };
  $scope.closeAlert = function(index) {
    $scope.alerts.removeByIndex(index);
  };
});
