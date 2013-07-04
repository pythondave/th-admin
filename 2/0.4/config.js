app.config(function($httpProvider) {
  $httpProvider.defaults.transformRequest = function(data) { //see https://github.com/pythondave/th-admin/issues/11
    var actualRequestData = (data === undefined ? undefined : $.param(data));
    //console.log(data, actualRequestData);
    return actualRequestData;
  };
});

app.value('config', function() {
  var o = {};

  var requestUrlRoot = '/admin/service/';
  o.requests = {
    postConfig: { "headers": { "Content-Type": "application/x-www-form-urlencoded" } }
  };
  o.requests.urls = {
    //teachers
      teachers: requestUrlRoot + 'teachers',
      processTeacher: requestUrlRoot + 'process-teacher',

    //jobs
      jobs: requestUrlRoot + 'jobs',
      job: requestUrlRoot + 'job',

    //applications
      applications: requestUrlRoot + 'applications',
      addApplication: requestUrlRoot + 'add-application',
      processApplication: requestUrlRoot + 'process-application',

    //settings
      setting: requestUrlRoot + 'setting',
      processSetting: requestUrlRoot + 'process-setting',

    //shared
      basicLists: requestUrlRoot + 'basic-lists',
      schoolNames: requestUrlRoot + 'school-names'
  };
  return o;
}());