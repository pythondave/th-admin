app.factory('teachersService', function($rootScope, $http, $q, config, listService, teacherService) {
  var o = {};

  o.process = function(teacher, dataToPost) { //returns a promise
    var removeFromList = function() { o.removeById(teacher.id); }; //success callback
    return teacherService.process(teacher, dataToPost, removeFromList);
  };

  //refine
  o.refine = function(values) {
    if (!o.list) return;
    var re = new RegExp(values.refineText, 'i');
    o.list.filteredData = _(o.list.data).filter(function(o) { //*** TODO refactor 'filter' to 'refine'
      return ((!values.refineText || re.test(_.arrayOfValues(o).join('|')))); //*** TODO: consider making this an indexed value within listService        
    }).value();
    $rootScope.$broadcast('teachersRefined'); //more than one controller needs to know
  };

  o.removeById = function(id) {
    o.list.removeById(id);
    $rootScope.$broadcast('applicationsChanged');
  };

  var getDataFromServer = $http.post(config.requests.urls.teachers, { statusId: 3 }, config.postConfig);
  var setData = function(response) { o.list = new listService.List(response.data.teachers); };
  o.getAndSetData = getDataFromServer.then(setData);

  return o;
});

app.factory('teacherService', function($http, $q, config) {
  var o = {};

  o.process = function(teacher, dataToPost, successCallback) { //returns a promise
    teacher.processing = true; //teacher given this flag while waiting for any processing
    dataToPost = _.extend({ teacherId: teacher.id }, dataToPost);

    var stopProcessing = function() { teacher.processing = false; };
    var error = function() { stopProcessing(); return $q.reject(); }; //re-throw any server error

    var postToServer = $http.post(config.requests.urls.processTeacher, $.param(dataToPost), config.postConfig);
    return postToServer.then(successCallback).then(stopProcessing, error);
  };

  return o;
});

app.factory('teacherStatusesService', function() {
  var o = {};
  o.statuses = {
    1: { title: 'Joined', shortTitle: 'J' },
    2: { title: '80% Complete', shortTitle: '80%' },
    3: { title: 'Pending Approval', shortTitle: 'PA' },
    4: { title: 'Approved', shortTitle: 'A', alertType: 'success' },
    5: { title: 'Declined', shortTitle: 'D', alertType: 'error' }
  };
  return o;
});
