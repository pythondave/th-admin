var app = angular.module('app', ['ui.bootstrap', 'ngMockE2E', 'ngResource']);

app.run(function(config) {
  config.serverSpeedMultiplierOverride = 0;
});

app.controller('mainController', function($scope, config, $http) {
  config.requests.serverSpeedMultiplier = 0;
  var x = { a: [ { b:1, c:2 }, { c:3, d:4 }, { c:5, e:"test" },
                 { f: { g: 6 } },
                 { f: { g: 7, h: 8 } } //, 9, 's' => for later
               ] };
  /*
  { a: [ { b:1, c:2 }, { c:3, d:4 }, { c:5, e:"test", b:7 } ] };
  { a: [{ b:{ type: 'integer', min: 1, max: 1 },
          c:{ type: 'integer', min: 2, max: 2 },
        },
        { c:{ type: 'integer', min: 3, max: 3 },
          d:{ type: 'integer', min: 4, max: 4 },
        },
        { c:{ type: 'integer', min: 5, max: 5 },
          e:{ type: 'string', minLength: 4, maxLength: 4 },
          b:{ type: 'integer', min: 7, max: 7 },
        }
       ] };
  { a: [ { b:{ type: 'integer', min: 1, max: 7, required: false },
           c:{ type: 'integer', min: 2, max: 5 },
           d:{ type: 'integer', min: 4, max: 4, required: false },
           e:{ type: 'integer', minLength: 4, maxLength: 4, required: false }
        ] };
  */
  /*
  { a: [ { b:1, c:2 }, { c:3, d:4 }, { c:5, e:"test" },
         { f: { g:6 } },
         { f: { g:7, h:8 } }
  [ { a:'array' }, { 'a/b':1 }, { 'a/c':2 }, { 'a/c':3 }, { 'a/d':4 }, { 'a/c':5 }, { 'a/e':"test" },
    { 'a/f':'object' }, { 'a/f/g':6 }, { 'a/f':'object' }, { 'a/f/g':7 }, { 'a/f/h':8 } ]
  [ { a:'array' }, { 'a/b':1 }, { 'a/c':[2,3,5] }, { 'a/d':4 }, { 'a/e':"test" },
    { 'a/f':['object','object']  }, { 'a/f/g':[6,7] }, { 'a/f/h':8 } ];
  { a: [] };
  { a: [ { b:1 }, { c:[2,3,5] }, { d:4 }, { e:"test" }, { f: { g:[6,7], h:8 } } ] };
  //var q = { a: [ { b:{ type: 'integer', ... }} }, { c:[2,3,5] }, { d:4 }, { e:"test" }, { f: { g:[6,7], h:8 } } ] };
  */
  var summariseObject2 = function(o) {
    var results = {};
    var traverse = function(o, fn, options) {
      //traverses a javascript object
      if (typeof o !== 'object') return o;
      options = options || {};
      var evaluateWhen = options.evaluateWhen || function(item) { return typeof item !== 'object'; };
      var path = options.path || [];
      if (!_.isArray(options.parent) && options.propertyName) path.push(options.propertyName);
      for (var p in o) {
        var childOptions = { evaluateWhen: evaluateWhen, path: _.clone(path), parent: o, propertyName: p };
        if (typeof o[p] === 'object') { o[p] = traverse(o[p], fn, childOptions); } //depth first
        if (evaluateWhen(o[p])) { o[p] = fn(o[p], childOptions); }
      }
      return o;
    };
    var getLeafValues = function(o) {
      //returns a list of leaf values of o, together with their paths
      //note that each path can have more than one value
      var values = [];
      var addValue = function(v, options) {
        values.push({ path: options.path.join('/') + '/' + options.propertyName, val: v });
      };
      traverse(_.cloneDeep(o), addValue, function(item) { return _.isArray(item) || typeof item !== 'object'; });
      return values;
    };
    var groupBy = function(collection, callback, thisArg, fnPush) {
      //generic extension to lodash groupBy - pushes the result of a function so can be something other than 'value'
      var result = {};
      callback = _.createCallback(callback, thisArg);
      fnPush = fnPush || function(v) { return v; };

      _.forEach(collection, function(value, key, collection) {
        key = String(callback(value, key, collection));
        (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(fnPush(value));
      });
      return result;
    };
    var getPathValues = function(leafValues) {
      //returns the paths of leafValues, each with a list of corresponding values
      return groupBy(leafValues, function(item) { return item.path; }, undefined, function(item) { return item.val; });
    };
    var summariseArray = function(a) {
      //returns a summary of an array
      var o = { count: a.length };
      o.type = _(a).map(function(item) { return typeof item; }).uniq().value()[0];
      if (o.type === 'number') { o.min = _.min(a); o.max = _.max(a); }
      if (o.type === 'string') {
        o.minLength = _.reduce(a, function (best, x) { return x.length < best ? x.length : best; }, a[0].length);
        o.maxLength = _.reduce(a, function (best, x) { return x.length > best ? x.length : best; }, 0);
      }
      return o;
    };
    var getPathSummaries = function(pathValues) {
      //returns a summary of each path in pathValues
      o = _.cloneDeep(pathValues);
      for (var p in o) { o[p] = summariseArray(o[p]); }
      return o;
    };
    results.leafValues = getLeafValues(o);
    results.pathValues = getPathValues(results.leafValues);
    results.pathSummaries = getPathSummaries(results.pathValues);
    results.wip = { 'hello': 'world' };
    return results;
  };

  var summariseObject = function(o) {
    o = _.cloneDeep(o);
    var traverse = function(o, fn, evaluateWhen) {
      evaluateWhen = evaluateWhen || function(item) { return typeof item !== 'object'; };
      for (var p in o) {
        if (typeof o[p] === 'object') o[p] = traverse(o[p], fn, evaluateWhen); //depth first
        if (evaluateWhen(o[p])) o[p] = fn(o[p]);
      }
      return o;
    };
    var getPropertyDescriptionObject = function(v) {
      var o = { type: typeof v };
      if (typeof v === 'number') { o.min = v; o.max = v; }
      if (typeof v === 'string') { o.minLength = v.length; o.maxLength = v.length; }
      return o;
    };
    var mergeTwoPropertyDescriptionObjects = function(x, y) {
      var o;
      if (!x) { o = y; o.required = false; }
      if (!y) { o = x; o.required = false; }

      if (x && y) {
        var type = (x.type === y.type ? x.type : 'TODO');
        type = type || 'TODO';
        o = { type: type };
        if (!x.type && !y.type) o = x;
        if (type === 'number') {
          o.min = (x.min<y.min ? x.min : y.min);
          o.max = (x.max>y.max ? x.max : y.max);
        }
        if (type === 'string') {
          o.minLength = (x.minLength<y.minLength ? x.minLength : y.minLength);
          o.maxLength = (x.maxLength>y.maxLength ? x.maxLength : y.maxLength);
        }
      }
      return o;
    };
    var mergePropertyDescriptionObjects = function(v) {
      //v: value, a: array, o: object, i: item, p: property
      if (!_.isArray(v)) return v;
      var a = v;
      if (a.length === 1) return v;
      var o = _.reduce(a, function(result, item) {
        for (var p in result) {
          result[p] = mergeTwoPropertyDescriptionObjects(result[p], item[p]);
        }
        for (p in item) {
          result[p] = mergeTwoPropertyDescriptionObjects(result[p], item[p]);
        }
        return result;
      });
      return [o];
    };
    var isPropertyDescriptionObject = function (v) {
      if (v === undefined) return false;
      return !!v.type; //*** could return false positives
    };
    var stringifyPropertyDescriptionObject = function (pdo) {
      return JSON.stringify(pdo).replace(/,"/g, ', ').replace(/"/g, '');
    };
    o = traverse(o, getPropertyDescriptionObject);
    o = traverse(o, mergePropertyDescriptionObjects, function(item) { return _.isArray(item); }); //*** TODO: get this working for nested objects
    //o = traverse(o, stringifyPropertyDescriptionObject, function(item) { return isPropertyDescriptionObject(item); });
    return o;
  };
  $scope.json = x;
  _.assign($scope, summariseObject2(x));

  $scope.processRequest = function() {
    $scope.json = undefined;
    if (!$scope.request) return;

    var dataToPost = ( $scope.query ? $scope.query.dataToPost : undefined);
    var getDataFromServer = $http.post($scope.request.url, dataToPost, config.postConfig);
    var processResponse = function(response) {
      $scope.json = response.data;
      $scope.keys = (typeof response.data === 'object' ? Object.keys(response.data) : undefined);
      _.assign($scope, summariseObject2(response.data));
    };
    return getDataFromServer.then(processResponse);
  };

  $scope.useCases = [
    { title: 'All' },
    { group: 'Admin', title: 'All' },
    { id: 1, group: 'Admin', title: 'Create an application', notes: 'AKA add a candidate to a job',
        demos: ['/jobs/123?add-candidate']
    },
    { id: 2, group: 'Admin', title: 'View a list of job applications' },
    { id: 3, group: 'Admin', title: 'Assign a score to a candidate' }
  ];


  var requestUrlRoot = '/admin/service/';
  $scope.requests = [
    {
      group: 'Teachers',
      url: requestUrlRoot + 'teachers',
      description: 'Get an array of teachers',
      sprintAdded: 1, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: { statusId: 3 },
          description: 'Teachers pending approval - i.e. candidates to review'
        },
        {
          dataToPost: { search: 't', statusId: 4, limit: 5 },
          description: 'Teachers matching "t" who have statusId 4 (approved)'
        },
        {
          dataToPost: { search: 'te', statusId: 4, limit: 5 },
          description: 'Teachers matching "te" who have statusId 4 (approved)'
        },
        {
          dataToPost: { search: 'ter', statusId: 4, limit: 5 },
          description: 'Teachers matching "ter" who have statusId 4 (approved)'
        }
      ]
    },
    {
      group: 'Teachers',
      url: requestUrlRoot + 'process-teacher',
      description: 'Make a change to a teacher',
      sprintAdded: 1, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: { teacherId: 123, statusId: 4 },
          description: 'Change the status of a teacher to "Approved"'
        },
        {
          dataToPost: { teacherId: 123, statusId: 5 },
          description: 'Change the status of a teacher to "Declined"'
        },
        {
          dataToPost: { teacherId: 123, score: 7 },
          description: 'Assign a score to a teacher',
          useCaseIds: [3]
        }
      ]
    },
    {
      group: 'Jobs',
      url: requestUrlRoot + 'jobs',
      description: 'Get an array of jobs - can filter in various ways. If >200 jobs, returns first 200 jobs ordered by reverse creation date.',
      sprintAdded: 2, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: undefined,
          description: 'No parameters. Note the 200 max.'
        },
        {
          dataToPost: { type: 'cumulative' },
          description: 'Use implied status history in counts, rather than only current status.'
        },
        {
          dataToPost: { type: 'current' },
          description: 'The same as with type not being there (i.e. "current" is the default).'
        },
        {
          dataToPost: { schoolName: 'Ecole de Dave' },
          description: 'Filter by school name'
        },
        {
          dataToPost: { schoolName: 'Ecole de Dave', type: 'cumulative' },
          description: 'Filter by school name; use implied status history in counts'
        },
        {
          dataToPost: { countryId: 123 }, //country: 'United Kingdom'
          description: 'Filter by country'
        },
        {
          dataToPost: { subjectId: 234 }, //subject: 'Maths'
          description: 'Filter by subject'
        },
        {
          dataToPost: { roleId: 345 }, //role: 'Teacher'
          description: 'Filter by role'
        },
        {
          dataToPost: { schoolName: 'Ecole de Dave', countryId: 123 },
          description: 'Filter by school name and country'
        },
        {
          dataToPost: { schoolName: 'Ecole de Dave', countryId: 123, subjectId: 234 },
          description: 'Filter by school name and country and subject'
        },
        {
          dataToPost: { schoolName: 'Ecole de Dave', countryId: 123, subjectId: 234, roleId: 345 },
          description: 'Filter by school name and country and subject and role'
        },
        {
          dataToPost: { schoolName: 'Ecole de Dave', subjectId: 234 },
          description: 'Filter by school name and subject'
        },
        {
          dataToPost: { countryId: 123, roleId: 345 },
          description: 'Filter by country and role'
        }
      ]
    },
    {
      group: 'Jobs',
      url: requestUrlRoot + 'job',
      description: 'Get data relating to a job',
      sprintAdded: 2, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: { jobId: 123 },
          description: 'With a particular jobId'
        }
      ]
    },
    {
      group: 'Applications',
      url: requestUrlRoot + 'applications',
      description: 'Get an array of applications',
      sprintAdded: 2, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: { statusId: 1 },
          description: 'All applications whose status is "applied" (i.e. not yet put forward or declined)'
        },
        {
          dataToPost: { jobId: 123,  statusIds: [2, 4, 5, 6, 7, 8] },
          description: 'All applications for a job where the statusId is in the list'
        }
      ]
    },
    {
      group: 'Applications',
      url: requestUrlRoot + 'add-application',
      description: 'Add an application (a combination of job and teacher)',
      sprintAdded: 2, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: { jobId: 123, teacherId: 234 },
          description: 'Simplest possible add'
        }
      ],
      useCaseIds: [1]
    },
    {
      group: 'Applications',
      url: requestUrlRoot + 'process-application',
      description: 'Make a change to an application',
      sprintAdded: 2, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: { applicationId: 123, statusId: 123 },
          description: 'Changes the status of an application'
        },
        {
          dataToPost: { applicationId: 123, statusId: 123, message: 'This is a message...' },
          description: 'Changes the status of an application and sends the message'
        }
      ]
    },
    {
      group: 'Settings',
      url: requestUrlRoot + 'setting',
      description: 'Get data relating to a setting',
      sprintAdded: 2, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: { settingName: 'nameOfSetting' },
          description: 'Gets data relating to "nameOfSetting"'
        }
      ]
    },
    {
      group: 'Settings',
      url: requestUrlRoot + 'process-setting',
      description: 'Make a change to a setting',
      sprintAdded: 2, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: { name: 'settingName', value: 'New value of the setting with this name.' },
          description: 'Update the value of a setting'
        }
      ]
    },
    {
      group: 'Shared',
      url: requestUrlRoot + 'school-names',
      description: 'Get an array of school names. Important: Two schools can have the same name, so this is NOT an array of schools.',
      sprintAdded: 2, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: undefined,
          description: 'No parameters'
        }
      ]
    },
    {
      group: 'Shared',
      url: requestUrlRoot + 'basic-lists',
      description: 'Get several arrays of basic lists. These lists are relatively static. Recently added: teacherStatuses, jobStatuses, applicationStatuses, settings. POTENTIAL ISSUE: roles has 3 x Unspecified?',
      sprintAdded: 2, sprintLastUpdated: 2,
      queries: [
        {
          dataToPost: undefined,
          description: 'No parameters'
        }
      ]
    }
  ];
});

app.run(function($rootScope) {
  //create some new generic underscore methods
  _.mixin({ //ref: http://underscorejs.org/#mixin
    compare: function(a, b) { //compares a and b and returns 1 (a first), -1 (b first) or 0 (equal)
      if (a === undefined && b === undefined) return 0;
      if (a === undefined) return -1;
      if (b === undefined) return 1;
      return (a>b?1:(b>a?-1:0));
    },
    deep: function (o, path) { // extracts a value from a nested object using a string path
      //ref: https://gist.github.com/furf/3208381
      // usage: _.deep({ a: { b: { c: { d: ['e', 'f', 'g'] }, 'a.b.c.d[2]'); ==> 'g
      var keys = path.replace(/\[(["']?)([^\1]+?)\1?\]/g, '.$2').replace(/^\./, '').split('.');
      var i = 0, n = keys.length;
      while ((o = o[keys[i++]]) && i < n) {}
      return i < n ? void 0 : o;
    },
    deepCompare: function(o1, o2, path) { //compares 2 deep values (see 'compare' and 'deep')
      return _.compare(_.deep(o1, path), _.deep(o2, path));
    },
    arrayOfValues: function(o) { //returns an array of object values; o: any object (non-circular)
      //can be useful for generic text-search on a an object
      var a = [];
      function traverse(o) {
        for (var i in o) {
          if (typeof o[i] === 'object') { traverse(o[i]); } else { a.push(o[i]); }
        }
      }
      traverse(o);
      return a;
    },
    objectify: function(x, newPropertyName) { //converts x to an object if it isn't one already
      newPropertyName = newPropertyName || 'val';
      if (typeof x === 'object') { return x; } else { var o = {}; o[newPropertyName] = x; return o; }
    },
    objectifyAll: function(arr, newPropertyName) { //'objectifies' all items of an array
      return _.map(arr, function(item) { return _(item).objectify(newPropertyName).value(); });
    },
    addUniqueId: function(o) { //adds a uniqueId to o
      o.id = _.uniqueId();
      return o;
    },
    addUniqueIds: function(arr, newPropertyName) {
      return _.map(arr, function(item) { return _(item).addUniqueId(newPropertyName).value(); });
    },
    firstDefined: function() { return _.find(arguments, function(x) { return !_.isUndefined(x); }); }
  });
});
