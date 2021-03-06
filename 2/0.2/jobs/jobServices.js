app.factory('jobsService', function($http, $rootScope, listService) {
  //initialise
  var o = {};
  o.list = new listService.List();
  o.list.setSortOrderPaths(['subject', 'position']);

  //get data
  o.getAndSetData = function(options) {
    o.list.setData([]); //instantly clear current data
    o.isSet = false;
    o.requestParams = options;
    var getDataFromServer = $http.post($rootScope.config.requests.urls.jobs, options, $rootScope.config.postConfig);
    var setData = function(response) {
      o.list.setData(response.data.jobs);
      o.isSet = true;
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
              (!values.schoolName || o.schoolName === values.schoolName) &&
              (!values.country || o.country === values.country) &&
              (!values.subject || o.subject === values.subject) &&
              (!values.position || o.position === values.position));
    }).value();
    $rootScope.$broadcast('jobsChanged');
  };

  //totals
  o.getTotals = function(paths) {
    var totals = {};
    paths = paths || ['numApplied', 'numPutForward', 'numShortlisted', 'numInterviewed', 'numOffersMade', 'isAccepted', 'numRejected'];
    _(paths).each(function(path) { totals[path] = o.list.sum(path); }).value();
    return totals;
  };

  return o;
});

app.factory('jobService', function($http, $rootScope, listService) {
  //*** not yet required

  //initialise
  var o = {};

  //get data
  o.getAndSetData = function(jobId) {
    if (!jobId) return;
    var getDataFromServer = $http.post($rootScope.config.requests.urls.job, { jobId: jobId }, $rootScope.config.postConfig);
    var setData = function(response) {
    };
    return getDataFromServer.then(setData);
  };

  return o;
});
