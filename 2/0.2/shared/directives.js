app.directive('keyboardEvent', function () { // *** WIP - ref: http://plnkr.co/edit/mCt85P?p=preview
  return function ($scope, $elem, attr) {
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

app.directive('simpleTooltip', function ($compile) {
//the angular-ui tooltip was causing many digest cycles, so I created this simpler version for the purposes needed here
  return {
    restrict: 'A',
    scope: '=',
    controller: function ($scope, $element) {
      var c, p = $element; //child and parent elements
      var getElementPosition = function(el) {
        return { t: el.offset().top, l: el.offset().left, w: el.prop('offsetWidth'), h: el.prop('offsetHeight') };
      };
      var addTooltip = function () {
        var tooltipText = $element.attr('simple-tooltip');
        if (!tooltipText) return;
        var html = '<div class="tooltip top in" style="white-space: normal"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + tooltipText + '</div></div>';
        c = $compile(html)($scope);
        $element.prepend(c);
        var pPos = getElementPosition(p), cPos = getElementPosition(c);
        var css = { display: 'block',  top: (pPos.t-cPos.h)+'px', left: (pPos.l+(pPos.w-cPos.w)/2)+'px' };
        c.css(css);
      };
      var removeTooltip = function () { if (c) c.remove(); };
      $element.bind( 'mouseenter', function() { addTooltip(); });
      $element.bind( 'mouseleave', function() { removeTooltip(); });
    }
  };
});