app.factory('schoolNamesService', function($http, $rootScope, listService) {
  var o = {};
  var getDataFromServer = $http.post($rootScope.config.requests.urls.schoolNames, null, $rootScope.config.postConfig);
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function(response) {
      o.list.setData(response.data.schoolNames);
      o.isSet = true;
    };
    return getDataFromServer.then(setData);
  };

  return o;
});