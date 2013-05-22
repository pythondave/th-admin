app.factory('applicationsService', function($http, $q) {
  var o = {};
  var postConfig = { "headers": { "Content-Type": "application/x-www-form-urlencoded" } };

  o.processByIndex = function(index, status) { //returns a promise
    var application = o.data[index];
    var dataToPost = { teacher: application.id, status: status };
    application.processing = true; //application given this flag while waiting for any processing

    var removeFromList = function() { o.removeByIndex(index); };
    var stopProcessing = function() { application.processing = false; };
    var error = function() { stopProcessing(); return $q.reject(); }; //re-throw any server error

    var postToServer = $http.post('/admin/service/process-application', $.param(dataToPost), postConfig);
    return postToServer.then(removeFromList).then(stopProcessing, error);
  };

  o.removeByIndex = function(index) {
    o.data.splice(index, 1);
  };

  var getDataFromServer = $http.post('/admin/service/applications', null, postConfig);
  var setData = function(response) { o.data = response.data.applications; return o.data; };
  o.getAndSetData = getDataFromServer.then(setData);

  return o;
});
