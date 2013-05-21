app.factory('candidatesService', function($http) {
  var o = {};

  o.approveByIndex = function(index) {
    var candidate = o.data[index];
    var postData = { id: candidate.id };
    $http.post('candidates/approveCandidate', postData).success(function(response) {
      o.removeByIndex(index);
    });
  };
  
  o.declineByIndex = function(index) {
    var candidate = o.data[index];
    var postData = { id: candidate.id };
    $http.post('candidates/declineCandidate', postData).success(function(response) {
      o.removeByIndex(index);
    });
  };

  o.removeByIndex = function(index) {
    o.data.splice(index, 1);
  };
  
  o.list = $http.get('candidates').then(function(response) {
    o.data = response.data.users;
    return o.data;
  });
  
  return o;
});