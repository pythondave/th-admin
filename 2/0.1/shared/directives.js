app.directive('keyboardEvent', function() { // *** WIP - ref: http://plnkr.co/edit/mCt85P?p=preview
  return function($scope, $elem, attr) {
    $elem.bind('keydown', function(e) {
      e.stopPropagation();
      $scope.$apply(function() { $scope.$emit('keydown', e.which);});
    });
    $elem.bind('keypress', function(e) {
      e.stopPropagation();
      $scope.$apply(function() { $scope.$emit('keypress', e.which); });
    });
    $elem.bind('keyup', function(e) {
      e.stopPropagation();
      $scope.$apply(function() { $scope.$emit('keyup', e.which); });
    });
  };
});
