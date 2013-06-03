//Jobs
app.controller('JobsMenuCtrl', function($scope, schoolNamesService, countriesService, subjectsService, positionsService, jobsService) {
  //get and set data
  jobsService.getAndSetData({});
  schoolNamesService.getAndSetData();
  countriesService.getAndSetData();
  subjectsService.getAndSetData();
  positionsService.getAndSetData();

  /* *** TODO: create and use a filters service - to help better organise & simplify the code in this controller
  $scope.filters = [
    { name: 'schoolName', listName: 'schoolNames', service: 'schoolNamesService', label: 'School' },
    { name: 'country', listName: 'countries', service: 'countriesService', label: 'Country' },
    { name: 'subject', listName: 'subjects', service: 'subjectsService', label: 'Subjects' },
    { name: 'position', listName: 'positions', service: 'positionsService', label: 'Positions' }
  ];
  */

  //refine (work with the data we already have - i.e. no need to get data from the server)
  var refine = function() { jobsService.filter(getFilterRefineValues()); };
  var getFilterRefineValues = function() {
    var o = { search: $scope.search };
    if ($scope.schoolName && $scope.schoolName.type === 'Refine') o.schoolName = $scope.schoolName.val;
    if ($scope.country && $scope.country.type === 'Refine') o.country = $scope.country.val;
    if ($scope.subject && $scope.subject.type === 'Refine') o.subject = $scope.subject.val;
    if ($scope.position && $scope.position.type === 'Refine') o.position = $scope.position.val;
    return o;
  };

  //search (get data from the server)
  var search = function() { jobsService.getAndSetData(getFilterSearchValues()); };
  var getFilterSearchValues = function(propertyName) {
    var o = {};
    if ($scope.schoolName && $scope.schoolName.type === 'Search') o.schoolName = $scope.schoolName.val;
    if ($scope.country && $scope.country.type === 'Search') o.country = $scope.country.val;
    if ($scope.subject && $scope.subject.type === 'Search') o.subject = $scope.subject.val;
    if ($scope.position && $scope.position.type === 'Search') o.position = $scope.position.val;
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
  $scope.$watch('position', function() { filterChanged.apply(this, arguments); });

  //update filters
  var updateFilter = function(name, searchList, refineList, includeRefine) { //name = name of the data object used for the filter
    if (!$scope[name]) { //not initiated => add search options
      $scope[name] = [ undefined ];
      _.each(searchList, function(item) { $scope[name].push({ name: item.name, val: item.name, type: 'Search' }); });
    } else { //initiated => remove refine options
      _.rejectInPlace($scope[name], function(item) { return item && item.type === 'Refine'; });
    }
    if (includeRefine) { //refine options needed => add refine options at index 1 (so the groups are ordered correctly)
      _.each(refineList, function(item, index) { $scope[name].splice(index+1, 0, { name: item.name, val: item.val, type: 'Refine' }); });
    }
  };

  //data set event
  var isSet = function() {
    return (schoolNamesService.isSet && countriesService.isSet && subjectsService.isSet && positionsService.isSet && jobsService.isSet);
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
    if ($scope.position && $scope.position.type === 'Refine') $scope.position = undefined;

    updateFilter('schoolNames', schoolNamesService.list.data, jobsService.list.summarise('schoolName'), includeRefine && !$scope.schoolName);
    updateFilter('countries', countriesService.list.data, jobsService.list.summarise('country'), includeRefine && !$scope.country);
    updateFilter('subjects', subjectsService.list.data, jobsService.list.summarise('subject'), includeRefine && !$scope.subject);
    updateFilter('positions', positionsService.list.data, jobsService.list.summarise('position'), includeRefine && !$scope.position);
  });
});

app.controller('JobsCtrl', function($scope, jobsService) {
  $scope.sort = jobsService.list.sort;

  //headers
  var standardHeaders = { applied: 'Applied', putForward: 'Put forward', shortlisted: 'Shortlisted', interviewed: 'Interviewed', offersMade: 'Offers made', accepted: 'Accepted', rejected: 'Rejected' };
  var compactHeaders = { applied: 'A', putForward: 'PF', shortlisted: 'S', interviewed: 'I', offersMade: 'OM', accepted: 'A', rejected: 'R' };
  $scope.$watch('useCompactHeaders', function(value) {
    $scope.header = ( value ? compactHeaders : standardHeaders );
    $scope.header.tips = ( value ? standardHeaders : undefined );
  });

  var getFields = function(requestParams) {
    var fields = {}, i = 0;
    if (!requestParams.subject) { fields.subject = { index: i }; i++; }
    if (!requestParams.position) { fields.position = { index: i }; i++; }
    if (!requestParams.schoolName) { fields.schoolName = { index: i }; i++; }
    if (!requestParams.country) { fields.country = { index: i }; i++; }
    fields.count = i;
    return fields;
  };

  $scope.$on('jobsChanged', function(e) {
    $scope.fields = getFields(jobsService.requestParams);
    $scope.unrefinedJobs = jobsService.list.data;
    $scope.jobs = jobsService.list.filteredData;
    $scope.totals = jobsService.getTotals();
  });
});

//Job
app.controller('JobMenuCtrl', function($scope) {
});

app.controller('JobCtrl', function($scope, $stateParams, $dialog, applicationsService, listService, applicationService) {
  applicationsService.getAndSetData({ jobId: $stateParams.jobId });
  $scope.sort = applicationsService.list.sort;
  applicationsService.list.setSortOrderPaths(['-datePutForward', 'teacher.fullname']);

  //scores
  var scoreMapping = function(score, outOf) { //*** WIP - move to a service
    outOf = outOf || 10;
    if (score/outOf >= 0.8) return 'success';
    if (score/outOf >= 0.5) return 'warning';
    if (score/outOf >= 0) return 'important';
  };
  var badgeClass = function(score, outOf) { //*** WIP - move to a service
    var x = scoreMapping(score, outOf);
    return ( x ? 'badge-' + x : '');
  };
  $scope.scores = [];
  for (var i = 0; i <= 10; i++) {
    $scope.scores.push({ hoverClass: scoreMapping(i, 10)+'-hover' });
  }

  $scope.$on('applicationsChanged', function(e) {
    $scope.applications = applicationsService.list.filteredData;
    _($scope.applications).each(function(a) {
      a.badgeClass = badgeClass(a.score, 10);
      a.daysSincePutForward = (new Date() - new Date(a.datePutForward))/1000/60/60/24;
    }).value();
    $scope.totals = applicationsService.getTotals();
  });

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
  $scope.process = function(application, propertyName, newPropertyValue, additionalOptions) {
    //*** TODO: can be simplified
    additionalOptions = additionalOptions || {};
    var dataToPost = additionalOptions.additionalDataToPost || {}; dataToPost[propertyName] = newPropertyValue;
    var process = applicationsService.process(application, dataToPost, { removeFromList: false }); //promise
    var alert = {};

    var label = application.teacher.fullname;
    var success = function() {
      setProcessedMessage();
      if (propertyName === 'score') {
        application.score = newPropertyValue;
        application.badgeClass = badgeClass(newPropertyValue, 10);
      } else if (propertyName === 'adminNote') {
      } else {
        var dateField = additionalOptions.field.dateField;
        if (!newPropertyValue) { delete application[dateField]; } else { application[dateField] = (new Date()).toISOString(); }
      }
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


  $scope.toggleField = function(application, fieldName) {
    applicationService.application = application;
    applicationService.field = applicationService.statuses[fieldName];
    var isTicked = !!application[applicationService.field.dateField];
    var opts = { backdrop: true, keyboard: true, backdropFade: true, backdropClick: true };

    var afterClose = function(response) {
      if (!response.doIt) return;
      var additionalDataToPost = (response.sendMessage ? { message: response.message } : undefined );
      var additionalOptions = { additionalDataToPost: additionalDataToPost, field: applicationService.field };
      $scope.process(application, applicationService.field.bitField, !isTicked, additionalOptions);
    };

    if (isTicked) _.extend(opts, { templateUrl: 'jobs/job/untickField.html', controller: 'UntickJobFieldController' });
    if (!isTicked)  _.extend(opts, { templateUrl: 'jobs/job/tickField.html', controller: 'TickJobFieldController' });
    $dialog.dialog(opts).open().then(afterClose);
  };
  $scope.closeAlert = function(index) {
    $scope.alerts.removeByIndex(index);
  };
});


app.controller('TickJobFieldController', function($scope, dialog, applicationService, messageTemplateService){
  $scope.application = applicationService.application;
  $scope.field = applicationService.field;

  ///set message (get the template)
  var setMessage = function() {
    var fullname = $scope.application.teacher.fullname;
    $scope.message = messageTemplateService.replacePlaceholder(messageTemplateService.text, 'fullname', fullname);
  };
  var type = 'jobTick' + applicationService.field['title'].replace(' ', '');
  messageTemplateService.getAndSetData({ type: type }).then(setMessage);

  $scope.close = function(doIt) {
    var o = { source: 'tick', field: $scope.field, doIt: doIt };
    if (doIt) o.sendMessage = $scope.sendMessage;
    if (doIt && o.sendMessage) o.message = $scope.message;
    dialog.close(o);
  };
});

app.controller('UntickJobFieldController', function($scope, dialog, applicationService){
  $scope.application = applicationService.application;
  $scope.field = applicationService.field;

  $scope.close = function(doIt) {
    var o = { source: 'untick', field: $scope.field, doIt: doIt };
    dialog.close(o);
  };
});