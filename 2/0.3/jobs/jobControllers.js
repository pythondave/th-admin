//Jobs
app.controller('JobsMenuCtrl', function($scope, schoolNamesService, countriesService, subjectsService, rolesService, jobsService) {
  //get and set data
  jobsService.list.setSortOrderPaths(['dateCreated']);

  jobsService.getAndSetData({ type: 'current' });
  schoolNamesService.getAndSetData();
  countriesService.getAndSetData();
  subjectsService.getAndSetData();
  rolesService.getAndSetData();

  /* *** TODO: create and use a filters service - to help better organise & simplify the code in this controller
  $scope.filters = [
    { name: 'schoolName', listName: 'schoolNames', service: 'schoolNamesService', label: 'School' },
    { name: 'country', listName: 'countries', service: 'countriesService', label: 'Country' },
    { name: 'subject', listName: 'subjects', service: 'subjectsService', label: 'Subjects' },
    { name: 'role', listName: 'roles', service: 'rolesService', label: 'Positions' }
  ];
  */

  //refine (work with the data we already have - i.e. no need to get data from the server)
  var refine = function() { jobsService.filter(getFilterRefineValues()); };
  var getFilterRefineValues = function() {
    var o = { search: $scope.search };
    if ($scope.schoolName && $scope.schoolName.type === 'Refine') o.schoolName = $scope.schoolName.val;
    if ($scope.country && $scope.country.type === 'Refine') o.country = $scope.country.val;
    if ($scope.subject && $scope.subject.type === 'Refine') o.subject = $scope.subject.val;
    if ($scope.role && $scope.role.type === 'Refine') o.role = $scope.role.val;
    return o;
  };

  //search (get data from the server)
  var search = function() { jobsService.getAndSetData(getFilterSearchValues()); };
  var getFilterSearchValues = function() {
    var o = {};
    if ($scope.schoolName && $scope.schoolName.type === 'Search') o.schoolName = $scope.schoolName.val;
    if ($scope.country && $scope.country.type === 'Search') o.countryId = $scope.country.id;
    if ($scope.subject && $scope.subject.type === 'Search') o.subjectId = $scope.subject.id;
    if ($scope.role && $scope.role.type === 'Search') o.roleId = $scope.role.id;
    o.type = jobsService.dataPosted.type;
    return o;
  };

  //filter change event
  var filterChanged = function(newValue, oldValue) {
    if (newValue===oldValue) return; //no filter change
    if (!newValue && oldValue && oldValue.type === 'Refine') { refine(); return; } //blanked a refine => 'refine'
    if (newValue && newValue.type === 'Refine') { refine(); return; } //selected a 'refine'
    search(); //we must need to 'search' (i.e. get data from the server)
  };

  $scope.$watch('search', function(newValue, oldValue) { if (newValue!==oldValue) refine(); });
  $scope.$watch('schoolName', function() { filterChanged.apply(this, arguments); });
  $scope.$watch('country', function() { filterChanged.apply(this, arguments); });
  $scope.$watch('subject', function() { filterChanged.apply(this, arguments); });
  $scope.$watch('role', function() { filterChanged.apply(this, arguments); });

  //update filters
  var updateFilter = function(name, searchList, refineList, includeRefine) { //name = name of the data object used for the filter
    if (!$scope[name]) { //not initiated => add search options
      $scope[name] = [ undefined ];
      _.each(searchList, function(item) { $scope[name].push({ id: item.id, name: item.name, val: item.name, type: 'Search' }); });
    } else { //initiated => remove refine options
      _.rejectInPlace($scope[name], function(item) { return item && item.type === 'Refine'; });
    }
    if (includeRefine) { //refine options needed => add refine options at index 1 (so the groups are ordered correctly)
      _.each(refineList, function(item, index) { $scope[name].splice(index+1, 0, { id: item.id, name: item.name, val: item.val, type: 'Refine' }); });
    }
  };

  //data set event
  var isSet = function() {
    return (schoolNamesService.isSet && countriesService.isSet && subjectsService.isSet && rolesService.isSet && jobsService.isSet);
  };
  $scope.$watch(isSet, function(isSet) {
    if (!isSet) return;

    //once all data is set... update the filters
    var includeRefine = (jobsService.list.data.length < 200); //don't include refine options if we have 200 rows or more

    //clear any refine selections
    $scope.search = undefined;
    if ($scope.schoolName && $scope.schoolName.type === 'Refine') $scope.schoolName = undefined;
    if ($scope.country && $scope.country.type === 'Refine') $scope.country = undefined;
    if ($scope.subject && $scope.subject.type === 'Refine') $scope.subject = undefined;
    if ($scope.role && $scope.role.type === 'Refine') $scope.role = undefined;

    updateFilter('schoolNames', schoolNamesService.list.data, jobsService.list.summarise('schoolName'), includeRefine && !$scope.schoolName);
    updateFilter('countries', countriesService.list.data, jobsService.list.summarise('country'), includeRefine && !$scope.country);
    updateFilter('subjects', subjectsService.list.data, jobsService.list.summarise('subject'), includeRefine && !$scope.subject);
    updateFilter('roles', rolesService.list.data, jobsService.list.summarise('role'), includeRefine && !$scope.role);
  });
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
    if (!dataPosted.subject) { fields.subject = { index: i }; i++; }
    if (!dataPosted.role) { fields.role = { index: i }; i++; }
    if (!dataPosted.schoolName) { fields.schoolName = { index: i }; i++; }
    if (!dataPosted.country) { fields.country = { index: i }; i++; }
    fields.count = i;
    return fields;
  };

  $scope.$on('jobsChanged', function(e) {
    $scope.fields = getFields(jobsService.dataPosted);
    $scope.unrefinedJobs = jobsService.list.data;
    $scope.jobs = jobsService.list.filteredData;
    $scope.totals = jobsService.getTotals();
  });
});

//Job
app.controller('JobMenuCtrl', function($scope, $timeout, $window, $dialog, $stateParams, applicationsService) {
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
});

app.controller('JobCtrl', function($scope, $stateParams, $dialog, applicationsService, listService, scoresService, applicationStatusesService) {
  applicationsService.getAndSetData({ jobId: $stateParams.jobId, statusIds: [2, 4, 5, 6, 7, 8] });
  $scope.sort = applicationsService.list.sort;
  applicationsService.list.setSortOrderPaths(['-datePutForward', 'teacher.fullName']);
  $scope.statuses = applicationStatusesService.statuses;
  $scope.scores = scoresService.scores;

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
  $scope.alerts = new listService.List();
  $scope.processWithThrottle = function(application, propertyName, newPropertyValue, processInterval) {
    $scope.processData = { application: application, propertyName: propertyName, newPropertyValue: newPropertyValue };
    if (!application.dirty) {
      $scope.debounceFunction = _.debounce(function() {
        var d = $scope.processData;
        $scope.process(d.application, d.propertyName, d.newPropertyValue);
        d.application.dirty = false;
      }, 2000);
    }
    application.dirty = true;
    $scope.debounceFunction();
  };
  $scope.process = function(application, propertyName, newPropertyValue, additionalDataToPost) {
    //*** TODO: can be simplified
    var dataToPost = additionalDataToPost || {}; dataToPost[propertyName] = newPropertyValue;
    var process = applicationsService.process(application, dataToPost, { removeFromList: false }); //promise
    var alert = {};

    var label = application.teacher.fullName;
    var success = function() {
      setProcessedMessage();
      if (propertyName === 'score') { //change score
        application.score = newPropertyValue;
      } else if (propertyName === 'statusId') { //change status
        application.previousStatusId = application.statusId;
        application.statusId = applicationStatusesService.newStatus.id;
        application.statusDate = (new Date()).toISOString();
      }
      setDerivedData();
    };
    var setProcessedMessage = function() { //promise success
      alert.message = 'Updated ' + label;
      alert.type = 'success';
      alert.duration = 2000;
    };
    var setSevereErrorMessage = function() { //promise error
      alert.message = 'Error: Unable to update ' + label;
      alert.type = 'severe-error';
      alert.duration = 10000;
    };

    var displayMessage = function() {
      $scope.alerts.addAndRemoveAfterDelay(alert, true, alert.duration);
    };

    process.then(success, setSevereErrorMessage).then(displayMessage);
  };

  $scope.getStatusClass = function(application, status) {
    return 'status-type' + applicationStatusesService.getStatusChangeType(application.statusId, status.id);
  };

  $scope.changeStatus = function(application, newStatus) {
    applicationStatusesService.setStatusChangeData(application, newStatus);
    if (application.statusId === newStatus.id) return;

    var opts = { backdrop: true, keyboard: true, backdropFade: true, backdropClick: false };
    opts = _.extend(opts, { templateUrl: 'jobs/job/changeApplicationStatus.html?a', controller: 'changeApplicationStatusController' });

    var afterClose = function(response) {
      if (!response || !response.doIt) return;
      var additionalDataToPost = (response.sendMessage ? { message: response.message } : undefined );
      $scope.process(application, 'statusId', applicationStatusesService.newStatus.id, additionalDataToPost);
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

  //set message (get the template)
  var setMessage = function() {
    var fullName = $scope.application.teacher.fullName;
    $scope.message = settingService.replacePlaceholder(settingService.value, 'fullName', fullName);
  };
  settingService.getAndSetData($scope.newStatus.messageTemplate).then(setMessage);

  $scope.close = function(doIt) {
    var o = { doIt: doIt };
    if (doIt) o.sendMessage = $scope.sendMessage;
    if (doIt && o.sendMessage) o.message = $scope.message;
    dialog.close(o);
  };
});

app.controller('JobAddCandidateController', function($scope, $rootScope, dialog, $http, limitToFilter){
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
    var dataToPost = { statusId: 4, search: search, limit: 5 };
    return $http.post($rootScope.config.requests.urls.teachers, dataToPost, $rootScope.config.postConfig)
                .then(function(response){ return response.data.teachers; });
  };
});