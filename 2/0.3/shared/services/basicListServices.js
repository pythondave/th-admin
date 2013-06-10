//*** TODO - refactor (there's a lot of duplication here)

app.service('basicListsService', function($q, $http, $rootScope, listService) {
  var o = {};
  var getDataFromServer = $http.post($rootScope.config.requests.urls.basicLists, null, $rootScope.config.postConfig);
  var setData = function(response) { o.basicLists = response; };
  o.getAndSetData = function() { return getDataFromServer.then(setData); };

  return o;
});

app.factory('countriesService', function(basicListsService, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function() {
      o.list.setData(basicListsService.basicLists.data.countries);
      o.isSet = true;
    };
    return basicListsService.getAndSetData().then(setData);
  };

  return o;
});

app.factory('subjectsService', function(basicListsService, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function() {
      o.list.setData(basicListsService.basicLists.data.subjects);
      o.isSet = true;
    };
    return basicListsService.getAndSetData().then(setData);
  };

  return o;
});

app.factory('rolesService', function(basicListsService, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function() {
      o.list.setData(basicListsService.basicLists.data.roles);
      o.isSet = true;
    };
    return basicListsService.getAndSetData().then(setData);
  };

  return o;
});

app.factory('settingsService', function(basicListsService, listService) {
  var o = {};
  o.list = new listService.List();

  //get data
  o.getAndSetData = function() {
    o.list.setSortOrderPaths(['name']);
    var setData = function() {
      o.list.setData(basicListsService.basicLists.data.settings);
      o.isSet = true;
    };
    return basicListsService.getAndSetData().then(setData);
  };

  return o;
});