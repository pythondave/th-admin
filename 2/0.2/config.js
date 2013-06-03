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
    processApplication: requestUrlRoot + 'process-application',

    //shared
    schoolNames: requestUrlRoot + 'schoolNames',
    countries: requestUrlRoot + 'countries',
    subjects: requestUrlRoot + 'subjects',
    positions: requestUrlRoot + 'positions',
    messageTemplate: requestUrlRoot + 'messageTemplate'
  };
});