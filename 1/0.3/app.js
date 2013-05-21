var app = angular.module('app', ['ui.bootstrap', 'ngMockE2E', 'ngResource']);

app.controller('MainCtrl', function($scope, $httpBackend, $q, $timeout, listService, candidatesService) {
  $scope.candidates = candidatesService.list;
  $scope.alerts = new listService.List();

  $scope.navBarUrl = "partials/navBar.html";
  $scope.leftSectionUrl = "partials/leftSection.html";
  $scope.mainUrl = "partials/candidates.html";

  $scope.process = function(index, status) {
    var candidate = candidatesService.data[index];
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
