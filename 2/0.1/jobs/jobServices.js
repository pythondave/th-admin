app.factory('jobsService', function($http, $rootScope, listService) {
  //initialise
  var o = {};
  o.list = new listService.List();
  o.list.setSortOrderPaths(['subject', 'position']);

  //get data
  o.getAndSetData = function(school) {
    if (!school) return;
    var getDataFromServer = $http.post('/admin/service/jobs', { schoolId: school.id }, $rootScope.postConfig);
    var setData = function(response) {
      o.list.setData(response.data.jobs);
      $rootScope.$broadcast('jobsChanged'); //more than one controller needs to know
    };
    return getDataFromServer.then(setData);
  };

  //filter
  o.filter = function(values) {
    if (!o.list) return;
    var re = new RegExp(values.search, 'i');
    o.list.filteredData = _(o.list.data).filter(function(o) {
      return ((!values.search || re.test(_.arrayOfValues(o).join('|'))) &&
              (!values.school || o.school === values.school) &&
              (!values.subject || o.subject === values.subject) &&
              (!values.position || o.position === values.position));
    });
    $rootScope.$broadcast('jobsChanged');
  };

  //totals
  o.getTotals = function() {
    var totals = {};
    var paths = ['applied', 'putForward', 'shortlisted', 'interviewed', 'offersMade', 'accepted', 'rejected'];
    _(paths).each(function(path) { totals[path] = o.list.sum(path); });
    return totals;
  };

  return o;
});
