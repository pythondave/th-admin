app.factory('subjectsService', function($http, $rootScope, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var getDataFromServer = $http.post($rootScope.config.requests.urls.subjects, null, $rootScope.config.postConfig);
    var setData = function(response) {
      o.list.setData(response.data.subjects);
      o.isSet = true;
    };
    return getDataFromServer.then(setData);
  };

  return o;
});