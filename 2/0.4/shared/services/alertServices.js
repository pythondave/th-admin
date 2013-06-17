app.factory('alertService', function(listService) {
  //provides a simple list which can be used to alerts the user

  var o = {};
  var successDefaults = { message: 'Success: Request successful', type: 'success', duration: 5000 };
  var errorDefaults = { message: 'Error: Unable to process', type: 'severe-error', duration: 30000 };
  var defaults = { success: successDefaults, error: errorDefaults };
  var settings = _.clone(defaults);

  //setup
  o.list = new listService.List(null);
  o.data = o.list.data;

  o.config = function(configSettings) {
    _.assign(settings.success, configSettings.success);
    _.assign(settings.error, configSettings.error);
    return this;
  };

  o.setVariables = function(variables) {
    o.variables = variables;
    o.config(variables);
  };

  o.success = function() {
    var message = _.template(settings.success.message, o.variables);
    var item = { message: message, type: settings.success.type };
    o.list.addAndRemoveAfterDelay(item, true, settings.success.duration);
  };

  o.error = function() {
    var message = _.template(settings.error.message, o.variables);
    var item = { message: message, type: settings.error.type };
    o.list.addAndRemoveAfterDelay(item, true, settings.error.duration);
  };

  o.removeByIndex = function(index) { o.list.removeByIndex(index); };

  return o;
});
