//Jobs
//Note: the jobs page does not refresh when you come back to it (by design).

app.factory('jobsFilterService', function(countriesService, FilterService) {
  var o = new FilterService();

  o.filters = [
    { name: 'search', type: 'text' },
    { name: 'subject', type: '1fromMany', searchField: 'subjectId', listName: 'subjects', service: 'subjectsService', label: 'Subjects' },
    { name: 'role', type: '1fromMany', searchField: 'roleId', listName: 'roles', service: 'rolesService', label: 'Positions' },
    { name: 'schoolName', type: '1fromMany', searchField: 'schoolName', listName: 'schoolNames', service: 'schoolNamesService', label: 'School' },
    { name: 'country', type: '1fromMany', searchField: 'countryId', listName: 'countries', service: 'countriesService', label: 'Country' }
  ];
  o.createSyntacticSugar();

  return o;
});

app.controller('JobsMenuCtrl', function($scope, $q, schoolNamesService, countriesService, subjectsService, rolesService, jobsService, jobsFilterService) {
  $scope.filters = jobsFilterService;

  var refine = function() { jobsService.filter(jobsFilterService.getRefineVals()); }; //call when need to refine local data based on the filters

  var search = function() { //call when need to get data from the server
    var dataToPost = jobsFilterService.getSearchIds();
    dataToPost.type = jobsService.dataPosted.type;
    jobsService.getAndSetData(dataToPost).then(setFilters);
  };

  //filter change events
  $scope.$watch('filters.search.val', function(newValue, oldValue) { if (newValue!==oldValue) refine(); });
  $scope.$watch('filters.subject.val', function() { filterChanged.apply(this, arguments); }, true);
  $scope.$watch('filters.role.val', function() { filterChanged.apply(this, arguments); }, true);
  $scope.$watch('filters.schoolName.val', function() { filterChanged.apply(this, arguments); }, true);
  $scope.$watch('filters.country.val', function() { filterChanged.apply(this, arguments); }, true);

  var filterChanged = function(newValue, oldValue) {
    var changeType = jobsFilterService.getChangeType(newValue, oldValue);
    if (changeType === 'Refine') { refine(); }
    if (changeType === 'Search') { search(); }
  };

  //set filters (take data from various services and pass it to the filter service)
  var setFilters = function() {
    jobsFilterService.includeRefine = (jobsService.list.data.length < 200); //don't include refine options if we have 200 rows or more
    jobsFilterService.search.val = undefined;
    jobsFilterService.setFilter('subject', subjectsService.list.data, jobsService.list.summarise('subject'));
    jobsFilterService.setFilter('role', rolesService.list.data, jobsService.list.summarise('role'));
    jobsFilterService.setFilter('schoolName', schoolNamesService.list.data, jobsService.list.summarise('schoolName'));
    jobsFilterService.setFilter('country', countriesService.list.data, jobsService.list.summarise('country'));
  };

  //get and set data (first run only)
  if (!jobsService.jobsMenuCtrlRanPreviously) {
    jobsService.list.setSortOrderPaths(['dateCreated']);
    $q.all([ //load all the data then set the filters
      jobsService.getAndSetData({ type: 'cumulative' }),
      subjectsService.getAndSetData(),
      rolesService.getAndSetData(),
      schoolNamesService.getAndSetData(),
      countriesService.getAndSetData()]).then(setFilters);
  }

  jobsService.jobsMenuCtrlRanPreviously = true; //set for next time
});

app.controller('JobsCtrl', function($scope, jobsService) {
  $scope.sort = jobsService.list.sort;

  //headers
  var standardHeaders = { applied: 'Applied', putForward: 'Put forward', shortlisted: 'Shortlisted', interviewed: 'Interviewed', offersMade: 'Offers made', accepted: 'Accepted', rejected: 'Rejected' };
  var compactHeaders = { applied: 'A', putForward: 'PF', shortlisted: 'S', interviewed: 'I', offersMade: 'OM', accepted: 'A', rejected: 'R' };

  $scope.$watch('compact', function(value) {
    $scope.header = ( value ? compactHeaders : standardHeaders );
    $scope.header.tips = ( value ? standardHeaders : undefined );
  });

  $scope.$watch('cumulative', function(newValue, oldValue) {
    if (newValue === oldValue) return;
    var dataToPost = _.clone(jobsService.dataPosted);
    dataToPost.type = (newValue ? 'cumulative' : 'current');
    jobsService.getAndSetData(dataToPost);
  });

  var getFields = function(dataPosted) {
    var fields = {}, i = 0;
    if (!dataPosted.subjectId) { fields.subject = { index: i }; i++; }
    if (!dataPosted.roleId) { fields.role = { index: i }; i++; }
    if (!dataPosted.schoolName) { fields.schoolName = { index: i }; i++; }
    if (!dataPosted.countryId) { fields.country = { index: i }; i++; }
    fields.count = i;
    return fields;
  };

  var setScopeValues = function() {
    $scope.fields = getFields(jobsService.dataPosted);
    $scope.unrefinedJobs = jobsService.list.data;
    $scope.jobs = jobsService.list.filteredData;
    $scope.totals = jobsService.getTotals();
  };

  $scope.$on('jobsChanged', function(e) { setScopeValues(); });
  if (jobsService.jobsCtrlRanPreviously) setScopeValues(); //don't call on first run to aviod running twice

  jobsService.jobsCtrlRanPreviously = true; //set for next time
});


//Job
app.controller('JobMenuCtrl', function($scope, $timeout, $window, $dialog, $stateParams, applicationsService, $location) {
  $scope.back = function() { $timeout(function() { $window.history.back(); }); };

  $scope.addCandidate = function() {
    var opts = { backdrop: true, keyboard: true, backdropFade: true, backdropClick: true };

    var afterClose = function(response) {
      if (!response || !response.doIt) return;
      applicationsService.addApplication({ jobId: $stateParams.jobId, teacherId: response.teacher.id });
    };

    _.extend(opts, { templateUrl: 'jobs/job/addCandidate.html?c', controller: 'JobAddCandidateController' });
    $dialog.dialog(opts).open().then(afterClose);
  };

  if ($location.search()['add-candidate']) $scope.addCandidate();
});

app.controller('JobCtrl', function($scope, $stateParams, $dialog, jobService, applicationsService, applicationService, scoresService, applicationStatusesService, alertService, teacherService) {
  applicationsService.getAndSetData({ jobId: $stateParams.jobId, statusIds: "2,4,5,6,7,8" });


  applicationsService.list.setSortOrderPaths(['-datePutForward', 'teacher.fullName']);
  $scope.statuses = applicationStatusesService.statuses;
  $scope.scores = scoresService.scores;

  $scope.sort = function(path) { //custom sort function *** TODO refactor so custom sorts can be used in listService (or perhaps so arrays can be referenced within paths (e.g. 'cumulativeMap[7]'))
    if (typeof path === 'number') {
      var p = (path === applicationsService.list.customSortPath ? -path : path), d = (p<0 ? -1 : 1);
      applicationsService.list.customSortPath = p; //save the latest sort
      applicationsService.list.filteredData.sort(function(a1, a2) {
        var x = d*_.compare(a2.cumulativeMap[path-1], a1.cumulativeMap[path-1]);
        return (x !== 0 ? x : _.compare(a2.datePutForward, a1.datePutForward));
      });
      return;
    }
    applicationsService.list.sort(path);
  };

  jobService.getAndSetData({ jobId: $stateParams.jobId }).then(function(response) {
    $scope.job = jobService.job;
  });

  $scope.$on('applicationsChanged', function(e) {
    $scope.applications = applicationsService.list.filteredData;
    setDerivedData();
  });

  var setDerivedData = function() {
    applicationsService.setDerivedData();
    $scope.totals = applicationsService.getTotals();
    $scope.cumulativeTotals = applicationsService.getCumulativeTotals();
  };

  //processing
  $scope.alerts = alertService.config({ success: { message: 'Updated {{fullName}}' }, error: { message: 'Error: Unable to update {{fullName}}' } });

  $scope.processWithThrottle = function(application, dataToPost, processInterval) {
    $scope.processData = { application: application, dataToPost: dataToPost };
    if (!application.dirty) {
      $scope.debounceFunction = _.debounce(function() {
        var d = $scope.processData;
        $scope.processTeacher(d.application.teacher, d.dataToPost); //currently only used to process a teacher's adminNote
        d.application.dirty = false;
      }, 2000);
    }
    application.dirty = true;
    $scope.debounceFunction();
  };

  $scope.processStatusChange = function(application, statusId) { //, statusChangeMessage  TEMPORARY HIDE - see https://github.com/pythondave/th-admin/issues/6
    //*** TODO: move some of this up to one or more services (e.g. applicationService and/or applicationStatusesService)
    var dataToPost = { statusId: statusId };
    //if (statusChangeMessage) dataToPost.message = statusChangeMessage;  TEMPORARY HIDE - see https://github.com/pythondave/th-admin/issues/6
    var process = applicationService.process(application, dataToPost); //promise

    //retrieve status change info from service; *** TODO: consider whether the newer applicationService is a better place for this now
    var previousStatus = applicationStatusesService.currentStatus;
    var newStatus = applicationStatusesService.newStatus;

    var success = function() {
      application.previousStatusId = previousStatus.id;
      application.statusId = newStatus.id;
      application.statusDate = (new Date()).toISOString();
      setDerivedData();
    };

    var message = 'Changed {{fullName}}\'s status from {{previousStatus}} to {{newStatus}}';
    var variables = { fullName: application.teacher.fullName, success: { message: message },
                      previousStatus: previousStatus.title, newStatus: newStatus.title };
    alertService.setVariables(variables);
    process.then(success).then(alertService.success, alertService.error);
  };

  $scope.processTeacher = function(teacher, dataToPost) {
    var process = teacherService.process(teacher, dataToPost);
    var setLocals = function() {
      if (dataToPost.score !== undefined) {
        teacher.score = dataToPost.score;
        applicationsService.setDerivedData();
      }
    };
    var message;
    if (dataToPost.score !== undefined) message = 'Updated {{fullName}}\'s score to {{score}}';
    if (dataToPost.adminNote !== undefined) message = 'Updated {{fullName}}\'s admin note';
    alertService.setVariables({ fullName: teacher.fullName, score: dataToPost.score, success: { message: message } });
    process.then(setLocals).then(alertService.success, alertService.error);
  };

  $scope.getStatusClass = function(application, status) {
    return 'status-type' + applicationStatusesService.getStatusChangeType(application.statusId, status.id);
  };

  $scope.changeStatus = function(application, newStatus) {
    applicationStatusesService.setStatusChangeData(application, newStatus);
    if (application.statusId === newStatus.id) return;

    var opts = { backdrop: true, keyboard: true, backdropFade: true, backdropClick: false };
    opts = _.extend(opts, { templateUrl: 'jobs/job/changeApplicationStatus.html?c', controller: 'changeApplicationStatusController' });

    var afterClose = function(response) {
      if (!response || !response.doIt) return;
      //var message = (response.sendMessage ? response.message : undefined );  TEMPORARY HIDE - see https://github.com/pythondave/th-admin/issues/6
      $scope.processStatusChange(application, applicationStatusesService.newStatus.id); //, message  TEMPORARY HIDE - see https://github.com/pythondave/th-admin/issues/6
    };

    $dialog.dialog(opts).open().then(afterClose);
  };
  $scope.closeAlert = function(index) {
    $scope.alerts.removeByIndex(index);
  };
});

app.controller('changeApplicationStatusController', function($scope, dialog, applicationStatusesService, settingService){
  $scope.application = applicationStatusesService.application;
  $scope.newStatus = applicationStatusesService.newStatus;
  $scope.currentStatus = applicationStatusesService.currentStatus;
  $scope.statusChangeType = applicationStatusesService.statusChangeType;

  /* TEMPORARY HIDE - see https://github.com/pythondave/th-admin/issues/6
  //set message (get the template)
  var setMessage = function() {
    var fullName = $scope.application.teacher.fullName;
    $scope.message = settingService.replacePlaceholder(settingService.value, 'fullName', fullName);
  };
  settingService.getAndSetData($scope.newStatus.messageTemplate).then(setMessage);
  */

  $scope.close = function(doIt) {
    var o = { doIt: doIt };
    /* TEMPORARY HIDE - see https://github.com/pythondave/th-admin/issues/6
    if (doIt) o.sendMessage = $scope.sendMessage;
    if (doIt && o.sendMessage) o.message = $scope.message;
    */
    dialog.close(o);
  };
});

app.controller('JobAddCandidateController', function($scope, configService, dialog, $http, $stateParams){
  $scope.close = function(doIt) {
    var o = { doIt: doIt, teacher: $scope.teacher };
    dialog.close(o);
  };

  $scope.$watch('search', function(value) {
    if (value === undefined) return;
    $scope.teacher = undefined;
    if (_.isObject(value)) { $scope.teacher = value; $scope.search = undefined; }
  });

  $scope.teachers = function(search) {
    var dataToPost = { statusIds: '1', search: search, limit: 5, excludeJobId: $stateParams.jobId };
    return $http.post(configService.requests.urls.teachers, dataToPost, configService.requests.postConfig)
                .then(function(response){ return response.data.teachers; });
  };
});