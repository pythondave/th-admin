app.factory('FilterService', function() { //returns a constructor function
  //note: there are 2 types of filtering:
  //  1.  "refine" filtering - work with the data we already have - i.e. no need to get data from the server
  //  2.  "search" filtering - get data from the server

  var o = {};

  o.filters = [];

  o.createSyntacticSugar = function() { //create some syntactic sugar (e.g. o.search = o.filters[0])
    _.each(o.filters, function(filter, index) { o[filter.name] = o.filters[index]; });
  };

  o.getFilterByName = function(name) {
    return _.find(o.filters, function(item) { return item.name === name; });
  };

  o.removeRefine = function(filter) {
    _.rejectInPlace(filter.data, function(item) { return item && item.type === 'Refine'; });
  };

  o.addRefine = function(filter, refineList) { //add refine options at index 1 (so the groups are ordered correctly)
    if (!o.includeRefine) return;
    _.each(refineList, function(item, index) { filter.data.splice(index+1, 0, { id: item.id, name: item.name, val: item.val, type: 'Refine' }); });
  };

  o.refreshRefine = function(filter, refineList) {
    if (filter.val && filter.val.type === 'Refine') filter.val = undefined; //remove if filter is a refine
    o.removeRefine(filter);
    if (!(filter.val && filter.val.type === 'Search')) o.addRefine(filter, refineList); //add if search filter not selected
  };

  o.addSearch = function(filter, searchList) {
    _.each(searchList, function(item) { filter.data.push({ id: item.id || item.name, name: item.name, val: item.id || item.name, type: 'Search' }); });
  };

  o.setFilter = function(filterName, searchList, refineList) { //name = name of the data object used for the filter
    var filter = o.getFilterByName(filterName);
    if (!filter.val) { //need to initialise filter
      filter.data = [ undefined ];
      o.addRefine(filter, refineList);
      o.addSearch(filter, searchList);
    } else {
      o.refreshRefine(filter, refineList);
    }
  };

  o.getValues = function(valType, fieldName, property) {
    var x = {};
    _.each(o.filters, function(f) {
      if (f.type === 'text' && valType === 'Refine' && f.val) { x[f.name] = f.val; }
      if ((f.val && f.val.type) === valType) { x[f[fieldName]] = f.val[property]; }
    });
    return x;
  };

  o.getSearchIds = function() { return o.getValues('Search', 'searchField', 'id'); };
  o.getRefineVals = function() { return o.getValues('Refine', 'name', 'val'); };

  o.getChangeType = function(newFilterValue, oldFilterValue) {
    if (newFilterValue === oldFilterValue) return; //no filter change
    if (!newFilterValue && oldFilterValue && oldFilterValue.type === 'Refine') { return 'Refine'; } //blanked a refine => 'refine'
    if (newFilterValue && newFilterValue.type === 'Refine') { return 'Refine'; } //selected a 'refine'
    return 'Search'; //we must need to 'search' (i.e. get data from the server)
  };

  return function() { return o; };
});
