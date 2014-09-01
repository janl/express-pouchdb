var fs = require('fs');
var defaults = require('./couch_config_defaults');

module.exports = function() {
  var file = './.config.json';

  var read_config = function() {
    if (fs.exists(file)) {
      return JSON.parse(fs.readFileSync(file));
    }
    return {};
  }

  var subscriptions = {};

  var flush = function() {
    fs.writeFileSync(file, JSON.stringify(config));
  };

  var config = read_config();

  return {
    get: function(section, key) {
      if (config[section] && config[section][key]) {
        return config[section][key];
      } else {
        // fall back on defaults
        if (defaults[section][key]) {
          return defaults[section][key];
        } else {
          return undefined;
        }
      }
    },

    set: function(section, key, value) {
      var previous_value = undefined;
      if (!config[section]) {
        config[section] = {};
      } else {
        previous_value = config[section][key];
      }
      config[section][key] = value;
      console.log('set %s/%s to %s', section, key, value);
      // run event handlers
      if(subscriptions[section][key]) {
        subscriptions[section][key]();
        console.log('called callbacks');
      }

      flush();
      return previous_value;
    },

    delete: function(section, key) {
      var previous_value = undefined;
      if (!config[section]) {
        config[section] = {};
      } else {
        previous_value = config[section][key];
      }
      delete config[section][key];
      flush();
      return previous_value;
    },

    on: function(section, key, callback) {
      if(!subscriptions[section]) {
        subscriptions[section] = {};
      }
      subscriptions[section][key] = callback;
    }
  }
};
