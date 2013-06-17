app.factory('schoolNamesService', function($http, config, listService) {
  var o = {};
  var getDataFromServer = $http.post(config.requests.urls.schoolNames, null, config.postConfig);
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function(response) {
      o.list.setData(response.data.schoolNames);
    };
    return getDataFromServer.then(setData);
  };

  return o;
});