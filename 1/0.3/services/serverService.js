// *** IMPORTANT ***
//This file should be included in the PROTOTYPE ONLY.
//In theory it acts as the server in the absence of the server. It is a mock server.
// *** ********* ***

app.factory('delayResponseInterceptor', function($q, $timeout) {
  //Can be used to delay all mock responses by a typical (and occasionally atypical) random amount, or fail entirely at a certain rate
  var config = { //configure special values for particular requests here
    //delayLengthMultiplier: standard random server response delay will be multiplied by this (e.g. for requests which are normally longer, say)
    //errorRate: 0: no errors; 1 error every time;
    attributeDefaults: { delayLengthMultiplier: 1, errorRate: 0 }, //these will be used if no specific value is found
    '/admin/service/candidates-to-process': { delayLengthMultiplier: 2 }, //will takes twice as long (on average)
    '/admin/service/process-candidate': { delayLengthMultiplier: 4, errorRate: 0.2 }
  };
  var getConfigValue = function(requestUrl, attributeName, defaultValue) { //use to ease the process of getting config values
    defaultValue = defaultValue || config.attributeDefaults[attributeName];
    if (!config[requestUrl]) return defaultValue;
    if (!config[requestUrl][attributeName]) return defaultValue;
    return config[requestUrl][attributeName];
  };
  var randomLogNormalValue = function(mu, sigma) { //server responses can be roughly modelled by a lognormal distribution
    var z1 = Math.sqrt(-2 * Math.log(1.0 - Math.random())) * Math.sin(2 * Math.PI * Math.random());
    return Math.exp(mu + sigma * z1);
  };
  var getStandardRandomServerResponseDelayLength = function() { //returns a random integer
    return Math.round(1000*randomLogNormalValue(-1.2, 0.5)); //typically 100-1000, occasionally 50-100 or 1000-1700
  };
  var logSampleStandardRandomServerResponseDelayLengths = function(n) { //used for experimentally working out good values for mu and sigma
    var a = [];
    for (var i=0; i<100; i++) {
      a.push(getStandardRandomServerResponseDelayLength());
    }
    a.sort(function(a, b) { return a-b; });
    console.log(a);
  };
  var getRandomServerResponseDelayLengthForRequestUrl = function(requestUrl) { //return a ramdom delay for a given request
    var delayLengthMultiplier = getConfigValue(requestUrl, 'delayLengthMultiplier');
    var delay = getStandardRandomServerResponseDelayLength() * delayLengthMultiplier;
    return delay;
  };
  var delay = function(lengthInMilliSeconds) { //promise which resolves after a delay
    var deferred = $q.defer();
    $timeout(deferred.resolve, lengthInMilliSeconds);
    return deferred.promise;
  };
  var delayedHttpRequest = function(httpRequest) { //takes an httpRequest promise and returns it, delayed by an amount appropriate for that request type
    //note that we need to resolve the httpRequest twice - once to get the url (to get related config values), and then again after the delay
    var responseInfo;
    var getResponseInfo = function(response) {
      responseInfo = response;
      return httpRequest; //use the same promise
    };
    var delayForRandomDuration = function() {
      var delayLength = getRandomServerResponseDelayLengthForRequestUrl(responseInfo.config.url);
      return delay(delayLength);
    };
    var getHttpRequest = function() {
      var errorRate = getConfigValue(responseInfo.config.url, 'errorRate');
      if (Math.random() < errorRate) { return $q.reject(); } //randomly error according to the errorRate
      return httpRequest;
    };
    return httpRequest.then(getResponseInfo).then(delayForRandomDuration).then(getHttpRequest);
  };

  return delayedHttpRequest;
});

//add the above factory to the responseInterceptors - this gets called during every http request
app.config(function($httpProvider) {
  $httpProvider.responseInterceptors.unshift('delayResponseInterceptor');
});

//set dummy server responses to posts and gets
app.run(function($httpBackend, $resource, $q, $timeout) {
  //url rule: all lower case, words separated with a hyphen
  $httpBackend.whenGET(/partials\/.*.html/).passThrough();
  $httpBackend.whenPOST('/admin/service/process-candidate').respond(200, 'processed'); //dummy response
  $httpBackend.whenPOST('/admin/service/candidates-to-process').respond(200, { //dummy response
    "users": [
      {
        "id": 1,
        "fullname": "Alexis Toye",
        "url": "/teachers/1234554"
      },
      {
        "id": 2,
        "fullname": "Alex Reynolds",
        "url": "/teachers/1234555"
      },
      {
        "id": 3,
        "fullname": "Ryan Randall",
        "url": "/teachers/1234554"
      },
      {
        "id": 4,
        "fullname": "Otto Villarin",
        "url": "/teachers/1234556"
      },
      { "id": "21", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "22", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "23", "fullname": "Jennifer Smithe Blogson", "url": "/teachers/1234556" },
      { "id": "24", "fullname": "Joe Bloggs", "url": "/teachers/1234556" },
      { "id": "25", "fullname": "Philip Blogs", "url": "/teachers/1234556" },
      { "id": "26", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "27", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "28", "fullname": "Joe with a bizarrely long name", "url": "/teachers/1234556" },
      { "id": "29", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "121", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "122", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "123", "fullname": "Jennifer Smithe Blogson", "url": "/teachers/1234556" },
      { "id": "124", "fullname": "Joe Bloggs", "url": "/teachers/1234556" },
      { "id": "125", "fullname": "Philip Blogs", "url": "/teachers/1234556" },
      { "id": "126", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "127", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "128", "fullname": "Joe with a bizarrely long name", "url": "/teachers/1234556" },
      { "id": "129", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "221", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "222", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "223", "fullname": "Jennifer Smithe Blogson", "url": "/teachers/1234556" },
      { "id": "224", "fullname": "Joe Bloggs", "url": "/teachers/1234556" },
      { "id": "225", "fullname": "Philip Blogs", "url": "/teachers/1234556" },
      { "id": "226", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "227", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "228", "fullname": "Joe with a bizarrely long name", "url": "/teachers/1234556" },
      { "id": "229", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "321", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "322", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "323", "fullname": "Jennifer Smithe Blogson", "url": "/teachers/1234556" },
      { "id": "324", "fullname": "Joe Bloggs", "url": "/teachers/1234556" },
      { "id": "325", "fullname": "Philip Blogs", "url": "/teachers/1234556" },
      { "id": "326", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "327", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "328", "fullname": "Joe with a bizarrely long name", "url": "/teachers/1234556" },
      { "id": "329", "fullname": "Jenny Blogs", "url": "/teachers/1234556" }
    ]
  });
});
