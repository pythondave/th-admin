app.controller('TeachersMenuCtrl', function($scope, positionsService) {
});

app.controller('TeachersCtrl', function($scope, listService, candidatesService) {
  candidatesService.getAndSetData.then(function() {
    $scope.candidates = candidatesService.list.data;
  });
  $scope.alerts = new listService.List(null);

  $scope.process = function(index, status) {
    var candidate = candidatesService.list.data[index];
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