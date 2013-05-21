//version 0.1
//a helper service for 

app.factory('listService', function($timeout) {
  var listService = {};
  listService.List = function(arr) {
    //list constructor function
    //a list is like an array with methods
    //each item of the array is expected to: 1) be an object, 2) have an id property, 3) have a val property
    arr = arr || [];
    var o = {};
    
    //basic functions
    o.getRandomIndex = function() {
      return Math.floor(Math.random() * o.list.length);
    };
    o.iterate = function(f) {
      for (var i=0; i<o.list.length; i++) {
        f(o.list[i], i);
      }
      return o;
    };

    //adding properties
    o.addProperty = function(property, values) {
      o.iterate(function(item, index) {
        item[property] = values[index];
      });
      return o;
    };

    //activation and deactivation
    o.deactivateAll = function() {
      o.iterate(function(item) {delete item.active});
      return o;
    };
    o.activateByIndex = function(index) {
      o.deactivateAll();
      o.list[index].active = true;
      return o;
    };
    o.activateRandom = function() {
      return o.activateByIndex(o.getRandomIndex());
    };
    o.getActive = function() {
      for (var i=0; i<o.list.length; i++) {
        if (o.list[i].active) return o.list[i];
      }
    };
    o.val = function() { //syntactic sugar for getActive().val
      return o.getActive().val;
    };
    
    //adding and removing
    o.add = function(item, position) {
      if (typeof position == 'boolean') { position = (position ? o.list.length : 0) }
      o.latestId++;
      item.id = o.latestId;
      o.list.splice(position, 0, item);
      return o;
    };
    o.removeByIndex = function(index) {
      o.list.splice(index, 1);
      return o;
    };
    o.removeById = function(id) {
      for (var i=o.list.length-1; i>=0; i--) {
        var item = o.list[i];
        if (!item) return;
        if (item.id == id) {
          o.list.splice(i, 1);
          break;
        }
      }
      return o;
    };
    o.delayedRemoveById = function(id, ms) {
      $timeout(function() { o.removeById(id); }, ms);
    };
    o.addAndRemoveAfterDelay = function(item, position, ms) {
      o.add(item, position);
      o.delayedRemoveById(o.latestId, ms);
      return o;
    };

    //initialisation
    o.list = [];
    o.latestId = -1; //*** WIP
    o.init = function() {
      for (var i=0; i<arr.length; i++) {
        o.latestId++;
        var val = arr[i];
        o.list[i] = { id: o.latestId, val: val };
      }
    };
    o.init();
    return o;
  };
  return listService;
});