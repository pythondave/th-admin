app.factory('scoresService', function() {
  //useful for displaying a mark out of 10 (etc.) for something (e.g. a teacher by admin or an application by a school)
  var o = {};
  o.scoreMapping = function(score, outOf) {
    outOf = outOf || 10;
    if (score/outOf >= 0.8) return 'success';
    if (score/outOf >= 0.5) return 'warning';
    if (score/outOf >= 0) return 'important';
  };
  o.badgeClass = function(score, outOf) {
    if (score === undefined) return;
    var x = o.scoreMapping(score, outOf);
    return ( x ? 'badge-' + x : '');
  };
  o.scores = [];
  for (var i=0; i<=10; i++) {
    o.scores.push({ hoverClass: o.scoreMapping(i, 10)+'-hover' });
  }
  return o;
});
