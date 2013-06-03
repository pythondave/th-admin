//version 0.1
//a helper service for working with lists (i.e. array structures)

app.factory('listService', function($timeout) {
  var listService = {};
  listService.List = function(arr, type) {
    //type:- missing: standard array; 1: arr items assigned to val property, and an id property is added
    //list constructor function
    //a list is like an array with methods - the array is list.data
    //we can use this rather than changing the Array prototype
    //*** TODO: make more use of lodash, abstract more things out
    arr = arr || [];
    var o = {};
    o.type = type;

    //basic functions
    o.getRandomIndex = function() { return _.random(0, o.data.length); };
    o.each = function(f) { return _(o.data).each(f).value(); };

    //adding properties
    o.addProperty = function(property, values) {
      o.each(function(item, index) {
        item[property] = values[index];
      });
      return o;
    };

    //activation and deactivation
    o.deactivateAll = function() {
      return o.each(function(item) { delete item.active; });
    };
    o.activateByIndex = function(index) {
      o.deactivateAll();
      o.data[index].active = true;
      return o;
    };
    o.activateRandom = function() {
      return o.activateByIndex(o.getRandomIndex());
    };
    o.getActive = function() {
      _(o.data).find(function(item) { return item.active; }).value();
    };
    o.val = function() { //syntactic sugar for getActive().val
      return o.getActive().val;
    };

    //adding and removing
    o.setData = function(arr) {
      o.data = arr;
      o.filteredData = arr;
      o.sort();
    };

    o.add = function(item, position) {
      if (typeof position == 'boolean') { position = (position ? o.data.length : 0); }
      o.latestId++;
      item.id = o.latestId;
      o.data.splice(position, 0, item);
      return o;
    };
    o.removeByIndex = function(index) {
      o.data.splice(index, 1);
      return o;
    };
    var removeById = function(arr, id) {
      if (!arr) return;
      for (var i=arr.length-1; i>=0; i--) {
        var item = arr[i];
        if (!item) return;
        if (item.id == id) {
          arr.splice(i, 1);
          break;
        }
      }
      return o;
    };
    o.removeById = function(id) {
      removeById(o.data, id);
      removeById(o.filteredData, id);
    };
    o.delayedRemoveById = function(id, ms) {
      $timeout(function() { o.removeById(id); }, ms);
    };
    o.addAndRemoveAfterDelay = function(item, position, ms) {
      o.add(item, position);
      o.delayedRemoveById(o.latestId, ms);
      return o;
    };

    //sorting
    var sortOrderPaths; // = [undefined, 'job.subject', 'job.school', '-date', 'teacher.fullname'];
    o.setSortOrderPaths = function(newSortOrderPaths) {
      sortOrderPaths = newSortOrderPaths.slice();
      sortOrderPaths.unshift(undefined); //sortOrderPaths[0] reserved for variable to be passed to sort function
    };
    o.sort = function(path) {
      //sorts o.data using sortOrderPaths (so they should be set first)
      //could be much more efficient for certain use cases - improve if this becomes noticable

      if (!path) path = sortOrderPaths[1]; //use first default sort if none specified
      if (path === sortOrderPaths[0]) path = '-' + path; //need to invert
      if (path.slice(0, 2) === '--') path = path.slice(2); //double-negative
      sortOrderPaths[0] = path; //we've figured out what the first sort path should really be
      o.filteredData.sort(function(a1, a2) {
        for (var i = 0; i < sortOrderPaths.length; i++) {
          var p = sortOrderPaths[i], d = 1;
          if (p.slice(0, 1) === '-') { p = p.slice(1); d = -1; } //inverted
          var x = d*_.deepCompare(a1, a2, p);
          if (x !== 0) { return x; }
        }
        return 0;
      });
    };

    //grouping / summarising
    var summarise = function(arr, path) { //generic - consider moving
      //returns a new array of objects which summarise the data at 'path' in arr
      return _(arr)
        .groupBy(function(item){ return _(item).deep(path).value(); })
        .map(function(value, key) { return { val: key, count: value.length, name: key + ' (' + value.length + ')' }; })
        .sortBy(function(o) { return o.val; })
        .value();
    };
    var sum = function(arr, path) { //generic - consider moving
      //returns the sum of values at 'path' in arr
      return _.reduce(arr, function(tally, item) { return tally + _(item).deep(path).value(); }, 0);
    };
    var count = function(arr, path) { //generic - consider moving
      //returns the count of values at 'path' in arr
      return _.reduce(arr, function(tally, item) { return tally + (_(item).deep(path).value() ? 1 : 0); }, 0);
    };
    o.summarise = function(path) {
      return summarise(o.data, path);
    };
    o.sum = function(path) {
      return sum(o.filteredData, path);
    };
    o.count = function(path) {
      return count(o.filteredData, path);
    };

    //filtering

    //indexing

    //initialisation
    o.data = [];
    o.latestId = -1; //*** WIP
    o.init = function() {
      for (var i=0; i<arr.length; i++) {
        o.latestId++;
        var val = arr[i];
        o.data[i] = (o.type === 1, { id: o.latestId, val: val }, val);
        o.filteredData = o.data;
      }
    };
    o.init();
    return o;
  };
  return listService;
});