app.controller('SettingsMenuCtrl', function() { });

app.controller('SettingsCtrl', function($scope, settingsService, settingService) {
  settingsService.getAndSetData().then(function() {
    $scope.settings = settingsService.list.data;
  });

  $scope.$watch('settingName', function(value) {
    $scope.dirty = undefined;
    if (!value) return;
    settingService.getAndSetData(value).then(function() {
      $scope.settingValue = settingService.value;
    });
  });

  $scope.process = function() {
    var dataToPost = { name: $scope.settingName, value: $scope.settingValue };
    $scope.processing = true;
    settingService.process(dataToPost).then(function() {
      $scope.processing = false;
      $scope.dirty = false;
    });
  };
});