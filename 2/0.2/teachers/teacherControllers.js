app.controller('TeachersMenuCtrl', function($scope) {
});

app.controller('TeachersCtrl', function($scope, listService, teachersService) {
  teachersService.getAndSetData.then(function() {
    $scope.candidates = teachersService.list.data;
  });
  $scope.alerts = new listService.List(null);

  $scope.process = function(index, status) {
    var candidate = teachersService.list.data[index];
    var processByIndex = teachersService.processByIndex(index, status); //promise
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