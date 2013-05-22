app.factory('positionsService', function($http) {
  var o = {};
  var postConfig = { "headers": { "Content-Type": "application/x-www-form-urlencoded" } };

  var getDataFromServer = $http.post('positions', null, postConfig);
  var setData = function(response) { o.data = response.data.positions; return o.data; };
  o.getAndSetData = getDataFromServer.then(setData);

  return o;
});