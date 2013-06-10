app.factory('applicationsService', function($http, $q, $rootScope, applicationStatusesService, scoresService, listService) {
  //initialise
  var o = {};
  o.current = {};
  o.list = new listService.List(null);
  o.list.filteredData = null;
  o.list.setSortOrderPaths(['-job.subject', 'job.schoolName', '-dateApplied', 'teacher.fullName']);

  //get data
  o.getAndSetData = function(dataToPost) {
    o.list.setData([]); //instantly clear current data
    var getDataFromServer = $http.post($rootScope.config.requests.urls.applications, dataToPost, $rootScope.config.postConfig);
    var setData = function(response) {
      o.list.setData(response.data.applications);
      o.setDerivedData();
      $rootScope.$broadcast('applicationsChanged'); //more than one controller needs to know
    };
    getDataFromServer.then(setData);
  };

  o.setDerivedData = function() {
    _(o.list.data).each(function(a) { //calculate and add a cumulativeMap property to each application
      a.badgeClass = scoresService.badgeClass(a.score, 10);
      a.teacher.badgeClass = scoresService.badgeClass(a.teacher.score, 10);
      if (a.datePutForward) a.daysSincePutForward = (new Date() - new Date(a.datePutForward))/1000/60/60/24;
      if (a.dateApplied) a.daysSinceApplied = (new Date() - new Date(a.dateApplied))/1000/60/60/24;
      a.cumulativeMap = applicationStatusesService.getCumulativeMap(a.statusId, a.previousStatusId);
    });
  };

  o.addApplication = function(dataToPost) {
    var addApplicationToServer = $http.post($rootScope.config.requests.urls.addApplication, dataToPost, $rootScope.config.postConfig);
    var setLocalData = function(response) {
      o.list.data.push(response.data.application);
      o.setDerivedData();
      $rootScope.$broadcast('applicationsChanged'); //more than one controller needs to know
    };
    addApplicationToServer.then(setLocalData);
  };

  //refine
  o.refine = function(values) {
    if (!o.list) return;
    var re = new RegExp(values.search, 'i');
    o.list.filteredData = _(o.list.data).filter(function(o) { //*** TODO refactor 'filter' to 'refine'
      return ((!values.search || re.test(_.arrayOfValues(o).join('|'))) && //*** TODO: consider making this an indexed value within listService
              (!values.schoolName || o.job.schoolName === values.schoolName) &&
              (!values.country || o.job.country === values.country) &&
              (!values.subject || o.job.subject === values.subject) &&
              (!values.role || o.job.role === values.role));
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
  o.getCumulativeTotals = function() {
    var totals = _(o.list.data).reduce(function(cumulative, application) {
      for (var i=0;i<8;i++) { cumulative[i] = cumulative[i]+application.cumulativeMap[i]; }
      return cumulative;
    }, [0,0,0,0,0,0,0,0]);
    return totals;
  };

  o.getTotals = function() {
    var totals = _(o.list.data).reduce(function(cumulative, application) {
      cumulative[application.statusId-1]++;
      return cumulative;
    }, [0,0,0,0,0,0,0,0]);
    return totals;
  };

  return o;
});

app.factory('applicationStatusesService', function() {
  var o = {};

  //populate statuses object
  o.statuses = [
    { id: 1, title: 'Applied', shortTitle: 'A' },
    { id: 2, title: 'Put foward', shortTitle: 'PF' },
    { id: 3, title: 'Declined', shortTitle: 'D' },
    { id: 4, title: 'Shortlisted', shortTitle: 'S' },
    { id: 5, title: 'Interviewed', shortTitle: 'I' },
    { id: 6, title: 'Offer made', shortTitle: 'OM' },
    { id: 7, title: 'Accepted', shortTitle: 'A' },
    { id: 8, title: 'Rejected', shortTitle: 'R' }
  ];
  var cumulativeMaps = [
    [1,0,0,0,0,0,0,0], [1,1,0,0,0,0,0,0], [1,0,1,0,0,0,0,0], [1,1,0,1,0,0,0,0],
    [1,1,0,1,1,0,0,0], [1,1,0,1,1,1,0,0], [1,1,0,1,1,1,1,0]
  ];
  var cumulativeMapForStatusId8 = function(previousStatusId) {
    var x = _.clone(cumulativeMaps[previousStatusId-1]); x[6] = 0; x[7] = 1; return x;
  };
  _(o.statuses).each(function(item) { //add additional status properties
    item.titleCase = _.toTitleCase(item.title); //Title Case
    item.pascalCase = _.toPascalCase(item.title); //PascalCase
    item.camelCase = _.toCamelCase(item.title); //camelCase
    if (item.id>3) item.postPF = true; //postPF
    item.messageTemplate = 'applicationStatusTo' + item.pascalCase + 'MessageTemplate'; //messageTemplate
    item.cumulativeMap = (item.id < 8 ? cumulativeMaps[item.id-1] : cumulativeMapForStatusId8); //cumulativeMap
  });

  //status functions
  o.getStatusById = function (statusId) {
    return o.statuses[statusId-1];
      //_.find(o.statuses, function(item) { return item.id === statusId; });
  };

  o.getCumulativeMap = function(statusId, previousStatusId) {
    if (!statusId) return;
    var map = o.getStatusById(statusId).cumulativeMap;
    return (typeof map === 'function' ? map(previousStatusId) : map);
  };

  //status changes
  o.statusChanges = [
    { fromId: 1, toId: 2, type: 1 }, //type 1 => ideal (steps in right order and next to each other)
    { fromId: 1, toId: 3, type: 1 },
    { fromId: 2, toId: 3, type: 1 },
    { fromId: 2, toId: 4, type: 1 },
    { fromId: 2, toId: 5, type: 2 }, //type 2 => with skips (steps in right order but not next to each other)
    { fromId: 2, toId: 6, type: 2 },
    { fromId: 2, toId: 7, type: 2 },
    { fromId: 3, toId: 4, type: 2 },
    { fromId: 3, toId: 5, type: 2 },
    { fromId: 3, toId: 6, type: 2 },
    { fromId: 3, toId: 7, type: 2 },
    { fromId: 4, toId: 5, type: 1 },
    { fromId: 4, toId: 6, type: 2 },
    { fromId: 4, toId: 7, type: 2 },
    { fromId: 5, toId: 6, type: 1 },
    { fromId: 5, toId: 7, type: 2 },
    { fromId: 6, toId: 7, type: 1 },
    { fromId: 2, toId: 8, type: 1 },
    { fromId: 4, toId: 8, type: 1 },
    { fromId: 5, toId: 8, type: 1 },
    { fromId: 6, toId: 8, type: 1 } //anything not in this list is type 3 => (steps not in the right order, therefore there could be implications)
  ];

  o.getStatusChangeType = function (fromId, toId) {
    if (fromId === toId) return;
    var item = _.find(o.statusChanges, function(item) { return item.fromId === fromId && item.toId === toId; });
    return (item ? item.type : 3);
  };

  o.setStatusChangeData = function(application, newStatus) {
    o.application = application;
    o.currentStatus = o.getStatusById(application.statusId);
    o.newStatus = newStatus;
    o.statusChangeType = o.getStatusChangeType(o.currentStatus.id, newStatus.id);
  };

  return o;
});

app.factory('scoresService', function() {
  var o = {};
  o.scoreMapping = function(score, outOf) {
    outOf = outOf || 10;
    if (score/outOf >= 0.8) return 'success';
    if (score/outOf >= 0.5) return 'warning';
    if (score/outOf >= 0) return 'important';
  };
  o.badgeClass = function(score, outOf) {
    var x = o.scoreMapping(score, outOf);
    return ( x ? 'badge-' + x : '');
  };
  o.scores = [];
  for (var i=0; i<=10; i++) {
    o.scores.push({ hoverClass: o.scoreMapping(i, 10)+'-hover' });
  }
  return o;
});
