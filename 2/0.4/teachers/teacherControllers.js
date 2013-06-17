app.controller('TeachersMenuCtrl', function($scope, teachersService) {
  $scope.$watch('refine', function(newValue) {
    teachersService.refine({ refineText: $scope.refine });
  });
});

app.controller('TeachersCtrl', function($scope, listService, teachersService, teacherStatusesService, alertService) {
  teachersService.getAndSetData.then(function() {
    $scope.teachers = teachersService.list.data;
  });

  $scope.$on('teachersRefined', function(e) {
    $scope.teachers = teachersService.list.filteredData;
  });

  $scope.alerts = alertService.config({ success: { message: '{{status}} {{fullName}}' }, error: { message: 'Error: Unable to process {{fullName}}' } });

  $scope.process = function(teacher, statusId) {
    var status = teacherStatusesService.statuses[statusId];
    alertService.setVariables({ success: { type: status.alertType }, status: status.title, fullName: teacher.fullName });
    teachersService.process(teacher, { statusId: statusId }).then(alertService.success, alertService.error);
  };
});