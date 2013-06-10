//*** See also settingsService in basicListServices

app.factory('settingService', function($http, $q, $rootScope) {
  //initialise
  var o = {};

  //get setting value
  o.getAndSetData = function(settingName) {
    var options = { settingName: settingName };
    var getDataFromServer = $http.post($rootScope.config.requests.urls.setting, options, $rootScope.config.postConfig);
    var setData = function(response) { o.value = response.data.value; };
    return getDataFromServer.then(setData);
  };

  //process
  o.process = function(dataToPost) { //returns a promise
    var postToServer = $http.post($rootScope.config.requests.urls.processSetting, $.param(dataToPost), $rootScope.config.postConfig);
    var getResponse = function(response) { }; //do something here if needed
    return postToServer.then(getResponse);
  };

  o.replacePlaceholder = function(text, placeholderName, replaceValue) {
    return text.replace(new RegExp('\\[\\[' + placeholderName + ']]', 'g'), replaceValue);
  };

  return o;
});
