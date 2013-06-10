app.controller('TeachersMenuCtrl', function($scope, teachersService) {
  $scope.$watch('refine', function(newValue) {
    teachersService.refine({ refineText: $scope.refine });
  });
});

app.controller('TeachersCtrl', function($scope, listService, teachersService, teacherStatusesService) {
  $scope.$on('teachersRefined', function(e) {
    $scope.teachers = teachersService.list.filteredData;
  });

  teachersService.getAndSetData.then(function() {
    $scope.teachers = teachersService.list.data;
  });
  $scope.alerts = new listService.List(null);

  $scope.process = function(teacher, statusId) {
    var status = teacherStatusesService.statuses[statusId];
    var dataToPost = { teacherId: teacher.id, statusId: statusId };
    var process = teachersService.process(teacher, dataToPost); //promise
    var alert = {};

    var setProcessedMessage = function() { //promise success
      alert.message = status.title + teacher.fullName;
      alert.type = status.alertType;
      alert.duration = 5000;
    };

    var setSevereErrorMessage = function() { //promise error
      alert.message = 'Error: Unable to process ' + teacher.fullName;
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