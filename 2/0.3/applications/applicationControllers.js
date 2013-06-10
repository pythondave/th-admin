app.controller('ApplicationsMenuCtrl', function($scope, applicationsService) {

  var addProperty = function(arr, name, value) { _.each(arr, function(item) { item[name] = value; }); return arr; };

  $scope.$on('applicationsChanged', function(e) {
    $scope.schoolNames = addProperty(applicationsService.list.summarise('job.schoolName'), 'type', 'Refine');
    $scope.countries = addProperty(applicationsService.list.summarise('job.country'), 'type', 'Refine');
    $scope.subjects = addProperty(applicationsService.list.summarise('job.subject'), 'type', 'Refine');
    $scope.roles = addProperty(applicationsService.list.summarise('job.role'), 'type', 'Refine');
  });
  var getValues = function() {
    return { schoolName: $scope.schoolName, country: $scope.country, subject: $scope.subject,
             role: $scope.role, search: $scope.search };
  };
  $scope.$watch(getValues, function(values) { applicationsService.refine(values); }, true);
});

app.controller('ApplicationsCtrl', function($scope, listService, applicationsService) {
  applicationsService.getAndSetData({ statusId: 1 });
  $scope.sort = applicationsService.list.sort;

  $scope.$on('applicationsChanged', function(e) {
    $scope.applications = applicationsService.list.filteredData;
  });

  $scope.badgeClass = function(score, outOf) { //*** WIP - will probably move to a service once discussed
    outOf = outOf || 10;
    if (score/outOf >= 0.8) return 'badge-success';
    if (score/outOf >= 0.5) return 'badge-warning';
    if (score/outOf >= 0) return 'badge-important';
    return '';
  };

  //processing
  $scope.alerts = new listService.List();
  $scope.process = function(application, putForward) {
    var dataToPost = (putForward ? { statusId: 2 } : { statusId: 3 });
    var process = applicationsService.process(application, dataToPost, { removeFromList: true }); //promise
    var alert = {};

    var label = application.teacher.fullName + ' - ' + application.job.subject;
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
