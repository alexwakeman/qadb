// Loosely based on jQuery's DOM ready.
window.EMBARRASSING_BODIES = (function (module, $) {
  var resistry = [], // List of functions to be run.
      is_initialised = false; // Are we already initialised?
  /**
   * Registers a function to be run when the module is complete.
   *
   * If the module is already initialised the function will run immediately.
   *
   * @param funct {Function} Function to be run when module is initialised.
   */
  module.register = function (funct) {
    if (typeof funct === 'function') {
      if (is_initialised) {
        funct.call();
      } else {
        resistry.push(funct);
      }
    }
  };

  /**
   * Runs all functions in the registry.
   */
  module.init = function () {
    $.each(resistry, function(i, funct) {
      funct.call();
    });
    is_initialised = true;
  };


  var resize_registry = []; // Functions to be run on resize.
  /**
   * Registers a function to be run on re-size.
   *
   * @param funct {Function} Function to be run when window is resized.
   */
   module.registerResize = function (funct) {
    if (typeof funct === 'function') {
      resize_registry.push(funct);
    }
  };


  /**
   * Handles running registered functions on the resize event.
   *
   * Adds a delay to prevent them constantly firing whilst being resized.
   */
  var resizeHander = function() {
    var resize_timer; // Used to set a delay on the resize callback.
    $(window).resize(function () {
      var delay = 250;
      if (resize_timer) {
        resize_timer = window.clearTimeout(resize_timer);
      }
      resize_timer = window.setTimeout(function () {
        $.each(resize_registry, function(i, funct) {
          funct.call();
        });
      }, delay);
    });
  };

  module.register(resizeHander);

  var load_registry = [], // Functions to be run on resize.
      is_loaded = false; // Has window.onload already run?
  /**
   * Registers a function to be run on load.
   *
   * @param funct {Function} Function to be run when the document is loaded.
   */
   module.registerLoad = function (funct) {
    if (typeof funct === 'function') {
      if (is_loaded) {
        funct.call();
      } else {
        load_registry.push(funct);
      }
    }
  };

  /**
   * Handles running registered functions on load.
   */
  $(window).load(function () {
    window.setTimeout(function () {
      $.each(load_registry, function(i, funct) {
        funct.call();
      });
      is_loaded = true;
    }, 1); // Detach from the load event to allow it to complete.
  });

  module.log_entries = []; // Provide a globally visible log.
  /**
   * Add a message to the log.
   *
   * @param message {String} Message to be logged.
   * @param console {Boolean} Should this also be echoed to the console?
   */
  module.log = function (mesage, echo) {
    if (typeof echo === 'undefined') {
      echo = false;
    }
    module.log_entries.push(mesage);
    if (echo) {
      console.log(mesage);
    }
  };

  return module;
}(window.EMBARRASSING_BODIES || {}, window.jQuery));

// Swallow errors if console.log isn't defined.
if (typeof console === 'undefined' && typeof console === 'undefined') {
  window.EMBARRASSING_BODIES.log('Taking over console.log');
  console = {
    log: function(message) {
      window.EMBARRASSING_BODIES.log(message, false);
    }
  };
}
