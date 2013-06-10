app.run(function($rootScope) {

  //global config data
  var requestUrlRoot = '/admin/service/';
  $rootScope.config = {};
  $rootScope.config.requests = {
    postConfig: { "headers": { "Content-Type": "application/x-www-form-urlencoded" } }
  };
  $rootScope.config.requests.urls = {
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
});