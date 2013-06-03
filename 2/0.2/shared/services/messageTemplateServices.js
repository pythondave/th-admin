app.factory('messageTemplateService', function($http, $rootScope) {
  var o = {};

  //get data
  o.getAndSetData = function(dataToPost) {
    var getDataFromServer = $http.post($rootScope.config.requests.urls.messageTemplate, dataToPost, $rootScope.config.postConfig);
    var setData = function(response) {
      o.text = response.data.text;
      o.isSet = true;
    };
    return getDataFromServer.then(setData);
  };

  o.replacePlaceholder = function(text, placeholderName, replaceValue) {
    return text.replace(new RegExp('\\[\\[' + placeholderName + ']]', 'g'), replaceValue);
  };

  return o;
});