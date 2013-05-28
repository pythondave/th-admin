app.factory('applicationsService', function($http, $q, $rootScope, listService) {
  //initialise
  var o = {};
  o.list = new listService.List(null);
  o.list.filteredData = null;
  o.list.setSortOrderPaths(['job.subject', 'job.school', '-dateApplied', 'teacher.fullname']);
  var postConfig = { "headers": { "Content-Type": "application/x-www-form-urlencoded" } };

  //get data
  o.getAndSetData = function(options) {
    o.list.setData([]); //instantly clear current data
    var getDataFromServer = $http.post('/admin/service/applications', options, postConfig);
    var setData = function(response) {
      o.list.setData(response.data.applications);
      $rootScope.$broadcast('applicationsChanged'); //more than one controller needs to know
    };
    getDataFromServer.then(setData);
  };

  //filter
  o.filter = function(values) {
    if (!o.list) return;
    var re = new RegExp(values.search, 'i');
    o.list.filteredData = _(o.list.data).filter(function(o) {
      return ((!values.search || re.test(_.arrayOfValues(o).join('|'))) && //*** TODO: consider making this an indexed value within listService
              (!values.school || o.job.school === values.school) &&
              (!values.subject || o.job.subject === values.subject) &&
              (!values.position || o.job.position === values.position));
    });
    $rootScope.$broadcast('applicationsChanged');
  };

  //remove
  o.removeById = function(id) {
    o.list.removeById(id);
    $rootScope.$broadcast('applicationsChanged');
  };

  //process
  o.process = function(application, dataToPost, additionalOptions) { //returns a promise
    additionalOptions = additionalOptions || {};
    application.processing = true; //application given this flag while waiting for any processing
    dataToPost = _.extend({ applicationId: application.id }, dataToPost);
    var postToServer = $http.post('/admin/service/process-application', $.param(dataToPost), postConfig);
    var getResponse = function(response) { }; //do something here if needed
    var removeFromList = function() { if (additionalOptions.removeFromList) o.removeById(application.id); };
    var stopProcessing = function() { application.processing = false; };
    var error = function() { stopProcessing(); return $q.reject(); }; //re-throw any server error

    return postToServer.then(getResponse).then(removeFromList).then(stopProcessing, error);
  };

  //totals
  o.getTotals = function(paths) {
    var totals = {};
    var defaultPaths = [
      { name: 'numApplied', path: 'dateApplied' },
      { name: 'numPutForward', path: 'datePutForward' },
      { name: 'numShortlisted', path: 'dateShortlisted' },
      { name: 'numInterviewed', path: 'dateInterviewed' },
      { name: 'numOffersMade', path: 'dateOfferMade' },
      { name: 'numAccepted', path: 'dateAccepted' },
      { name: 'numRejected', path: 'dateRejected' }
    ];
    paths = paths || defaultPaths;
    _(paths).each(function(path) {
      if ( typeof path === 'string') path = { name: path, path: path };
      totals[path.name] = o.list.count(path.path);
    });
    return totals;
  };

  return o;
});
