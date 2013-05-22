app.factory('jobsService', function($http, $q) {
  var o = {};
  var postConfig = { "headers": { "Content-Type": "application/x-www-form-urlencoded" } };

  o.processByIndex = function(index, status) { //returns a promise
    var candidate = o.data[index];
    var dataToPost = { teacher: candidate.id, status: status };
    candidate.processing = true; //candidate given this flag while waiting for any processing

    var removeFromList = function() { o.removeByIndex(index); };
    var stopProcessing = function() { candidate.processing = false; };
    var error = function() { stopProcessing(); return $q.reject(); }; //re-throw any server error

    var postToServer = $http.post('/admin/service/process-candidate', $.param(dataToPost), postConfig);
    return postToServer.then(removeFromList).then(stopProcessing, error);
  };

  o.removeByIndex = function(index) {
    o.data.splice(index, 1);
  };

  var getDataFromServer = $http.post('/admin/service/candidates-to-process', null, postConfig);
  var setData = function(response) { o.data = response.data.users; return o.data; };
  o.getAndSetData = getDataFromServer.then(setData);

  return o;
});
