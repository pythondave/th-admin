app.factory('schoolNamesService', function($http, configService, listService) {
  var o = {};
  var getDataFromServer = $http.post(configService.requests.urls.schoolNames, undefined, configService.requests.postConfig);
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