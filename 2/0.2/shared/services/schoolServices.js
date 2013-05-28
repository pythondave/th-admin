app.factory('schoolsService', function($http, $rootScope, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var getDataFromServer = $http.post('/admin/service/schools', null, $rootScope.postConfig);
    var setData = function(response) {
      o.list.setData(response.data.schools);
    };
    return getDataFromServer.then(setData);
  };

  return o;
});