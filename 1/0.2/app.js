var app = angular.module('app', ['ui.bootstrap', 'ngMockE2E', 'ngResource']);

app.controller('MainCtrl', function($scope, $httpBackend, listService, candidatesService) {
  $scope.candidates = candidatesService.list;
  $scope.alerts = new listService.List();

  $scope.navBarUrl = "partials/navBar.html";
  $scope.leftSectionUrl = "partials/leftSection.html";
  $scope.mainUrl = "partials/candidates.html";

  $scope.approve = function(index) {
    var candidate = candidatesService.data[index];
    var alert = { message: 'Approved ' + candidate.fullname, type: 'success' };
    $scope.alerts.addAndRemoveAfterDelay(alert, true, 5000);
    candidatesService.approveByIndex(index);
  };

  $scope.decline = function(index) {
    var candidate = candidatesService.data[index];
    var item = { message: 'Declined ' + candidate.fullname, type: 'error' };
    $scope.alerts.addAndRemoveAfterDelay(item, true, 5000);
    candidatesService.declineByIndex(index);
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.removeByIndex(index);
  };
});
