app.factory('applicationsService', function($http, $q, $rootScope, listService) {
  //initialise
  var o = {};
  o.current = {};
  o.list = new listService.List(null);
  o.list.filteredData = null;
  o.list.setSortOrderPaths(['job.subject', 'job.schoolName', '-dateApplied', 'teacher.fullname']);

  //get data
  o.getAndSetData = function(options) {
    o.list.setData([]); //instantly clear current data
    var getDataFromServer = $http.post($rootScope.config.requests.urls.applications, options, $rootScope.config.postConfig);
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
              (!values.schoolName || o.job.schoolName === values.schoolName) &&
              (!values.country || o.job.country === values.country) &&
              (!values.subject || o.job.subject === values.subject) &&
              (!values.position || o.job.position === values.position));
    }).value();
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
    var postToServer = $http.post($rootScope.config.requests.urls.processApplication, $.param(dataToPost), $rootScope.config.postConfig);
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
      { name: 'isAccepted', path: 'dateAccepted' },
      { name: 'numRejected', path: 'dateRejected' }
    ];
    paths = paths || defaultPaths;
    _(paths).each(function(path) {
      if ( typeof path === 'string') path = { name: path, path: path };
      totals[path.name] = o.list.count(path.path);
    }).value();
    return totals;
  };

  return o;
});

app.factory('applicationService', function() {
  var o = {};

  o.statuses = {
    applied: { title: 'Applied', shortTitle: 'A', dateField: 'dateApplied', bitField: 'isApplied' },
    putForward: { title: 'Put foward', shortTitle: 'PF', dateField: 'datePutForward', bitField: 'isPutForward' },
    shortlisted: { title: 'Shortlisted', shortTitle: 'S', dateField: 'dateShortlisted', bitField: 'isShortlisted' },
    interviewed: { title: 'Interviewed', shortTitle: 'I', dateField: 'dateInterviewed', bitField: 'isInterviewed' },
    offerMade: { title: 'Offer Made', shortTitle: 'OM', dateField: 'dateOfferMade', bitField: 'isOfferMade' },
    accepted: { title: 'Accepted', shortTitle: 'A', dateField: 'dateAccepted', bitField: 'isAccepted' },
    rejected: { title: 'Rejected', shortTitle: 'R', dateField: 'dateRejected', bitField: 'isRejected' }
  };

  return o;
});
