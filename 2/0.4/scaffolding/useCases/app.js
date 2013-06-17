var app = angular.module('app', ['ui.bootstrap']);

app.controller('mainController', function($scope) {

  $scope.useCases = [
    { id: 1, group: 'Admin', title: 'create an application',
      notes: 'AKA add a candidate to a job',
      demos: ['/jobs/123?add-candidate']
    },
    { id: 2, group: 'Admin', title: 'view a list of job applications',
      notes: '',
      demos: ['/jobs/123']
    },
    { id: 3, group: 'Admin', title: 'assign a score to a candidate',
      notes: '',
      demos: ['/jobs/123?assign-score-to-candidate']
    },
    { id: 4, group: 'Admin', title: 'assign a score to an application',
      notes: '',
      demos: ['/jobs/123?assign-score-to-application']
    },
    { id: 5, group: 'Admin', title: 'change the status of an application',
      notes: 'to... shortlisted, interviewed, offer made, accepted or rejected',
      demos: ['/jobs/123?change-status-of-application']
    },
    { id: 6, group: 'Admin', title: 'add an admin note to an application',
      notes: '',
      demos: ['/jobs/123?add-admin-note-to-application']
    },
    { id: 7, group: 'Admin', title: '...',
      notes: '*** We should expand this to include all use cases actually covered ***'
    }
  ];

  $scope.useCase = $scope.useCases[0];
});
