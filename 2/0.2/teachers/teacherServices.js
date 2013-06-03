app.factory('teachersService', function($http, $q, $rootScope, listService) {
  var o = {};

  o.processByIndex = function(index, status) { //returns a promise
    var candidate = o.list.data[index];
    var dataToPost = { teacherId: candidate.id };
    if (status === 1) dataToPost.isApproved = true;
    if (status === -1) dataToPost.isDeclined = true;
    candidate.processing = true; //candidate given this flag while waiting for any processing

    var removeFromList = function() { o.removeByIndex(index); };
    var stopProcessing = function() { candidate.processing = false; };
    var error = function() { stopProcessing(); return $q.reject(); }; //re-throw any server error

    var postToServer = $http.post($rootScope.config.requests.urls.processTeacher, $.param(dataToPost), $rootScope.config.postConfig);
    return postToServer.then(removeFromList).then(stopProcessing, error);
  };

  o.removeByIndex = function(index) {
    o.list.data.splice(index, 1);
  };

  var getDataFromServer = $http.post($rootScope.config.requests.urls.teachers, { isApproved: false, isDeclined: false }, $rootScope.config.postConfig);
  var setData = function(response) { o.list = new listService.List(response.data.teachers); };
  o.getAndSetData = getDataFromServer.then(setData);

  return o;
});
