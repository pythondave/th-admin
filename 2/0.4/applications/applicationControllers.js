app.controller('ApplicationsMenuCtrl', function($scope, applicationsService) {

  $scope.$on('applicationsChanged', function(e) {
    //populate all filters (currently used for refine only, not for searching)
    $scope.schoolNames = _.addProperty(applicationsService.list.summarise('job.schoolName'), 'type', 'Refine');
    $scope.countries = _.addProperty(applicationsService.list.summarise('job.country'), 'type', 'Refine');
    $scope.subjects = _.addProperty(applicationsService.list.summarise('job.subject'), 'type', 'Refine');
    $scope.roles = _.addProperty(applicationsService.list.summarise('job.role'), 'type', 'Refine');
  });

  var getValues = function() { //watch all of these and refine if anything changes
    return { schoolName: $scope.schoolName, country: $scope.country, subject: $scope.subject,
             role: $scope.role, search: $scope.search };
  };
  $scope.$watch(getValues, function(values) { applicationsService.refine(values); }, true);
});

app.controller('ApplicationsCtrl', function($scope, applicationsService, scoresService, alertService, applicationStatusesService) {
  applicationsService.getAndSetData({ statusIds: '1' }); //applications with status of 'Applied' (i.e. not yet 'Put forward' or 'Declined')
  $scope.sort = applicationsService.list.sort;
  $scope.badgeClass = scoresService.badgeClass;

  $scope.$on('applicationsChanged', function() {
    $scope.applications = applicationsService.list.filteredData;
  });

  $scope.alerts = alertService.config({ success: { message: '{{status}} {{fullName}} - {{subject}}' }, error: { message: 'Error: Unable to process {{fullName}} - {{subject}}' } });

  $scope.process = function(application, statusId) {
    var process = applicationsService.process(application, { statusId: statusId }, { removeFromList: true }); //promise
    var status = applicationStatusesService.getStatusById(statusId);

    alertService.setVariables({ success: { type: status.alertType }, status: status.title, fullName: application.teacher.fullName, subject: application.job.subject });
    process.then(alertService.success, alertService.error);
  };
});
