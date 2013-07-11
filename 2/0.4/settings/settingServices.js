//*** See also settingsService in basicListServices

app.factory('settingService', function($http, $q, configService) {
  //initialise
  var o = {};

  //get setting value
  o.getAndSetData = function(settingName) {
    var options = { settingName: settingName };
    var getDataFromServer = $http.post(configService.requests.urls.setting, options, configService.requests.postConfig);
    var setData = function(response) { o.value = response.data.value; };
    return getDataFromServer.then(setData);
  };

  //process
  o.process = function(dataToPost) { //returns a promise
    var postToServer = $http.post(configService.requests.urls.processSetting, dataToPost, configService.requests.postConfig);
    var getResponse = function(response) { }; //do something here if needed
    return postToServer.then(getResponse);
  };

  o.replacePlaceholder = function(text, placeholderName, replaceValue) {
    return text.replace(new RegExp('\\[\\[' + placeholderName + ']]', 'g'), replaceValue);
  };

  return o;
});
