window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.CLINIC_FINDER = (function (module, submodule, $) {

      submodule.CONTROLLER = (function (module, submodule, component, $) {

        var region = 'clinic_finder'; // ID for area to use for the app.

        /**
         * Handles the search form.
         */
        var handleSearch = function (e) {
          e.preventDefault();

          var inputs = submodule.region.find('.validate');
          component.validateForm();
          if (!$(this).hasClass('disabled')) {
            if (submodule.MODEL.getLocation()) {
              submodule.MODEL.searchLocation();
            } else {
              submodule.MODEL.search($.trim(submodule.region.find('#search-term').val()));
            }
          }
        };

        /**
         * Validates the form.
         */
        component.validateForm = function () {
          submodule.region.find('.validate').each(function () {
            validate($(this));
          });
          return (!$('input.invalid').length || submodule.MODEL.getLocation());
        };

        /**
         * Validates an individual field.
         */
        var validate = function (target) {
          if (!$.trim(target.val())) {
            submodule.VIEW.searchError(target);
          } else {
            submodule.VIEW.clearSearchError(target);
          }
        };

        /**
         * Handler for validating a field on an event.
         */
        var handleInlineValidation = function (e) {
          validate($(e.target));
          submodule.VIEW.validForm(component.validateForm());
        };

        /**
         * Handles requesting geolocation information.
         */
        var handleGeolocate = function (e) {
          e.preventDefault();
          submodule.VIEW.locationFinding();
          submodule.MODEL.findLocation();
        };

        /**
         * Handles clearing the current geolocation information.
         */
        var handleClearLocation = function (e) {
          e.preventDefault();
          submodule.MODEL.clearLocation();
          submodule.VIEW.validForm(component.validateForm());
        };

        /**
         * Handles selecting a result from the list of place names.
         */
        var handlePlaceResult = function (e) {
          e.preventDefault();
          submodule.MODEL.getPlaceResults($(this).text(), $(this).data('url'));
        };

        /**
         * Handles selecting an individual clinic.
         */
        var handleResultsResult = function (e) {
          e.preventDefault();
          window.location.hash = 'clinic:' + $(this).data('id');
        };

        /**
         * Handles restarting the search process.
         */
        var handleRestart = function (e) {
          e.preventDefault();
          var hash = window.location.hash;
          window.location.hash = 'search';
          if (hash === '#search') {
            $(window).trigger('hashchange');
          }
        };

        /**
         * This moves us between states and supports the back button.
         *
         * This is essentially our router.
         */
        var handleHashChange = function () {
          module.log('RISK_CHECKER.CONTROLLER hashchange being handled.');
          var hash = window.location.hash;
          if (hash === '' || hash === '#search') {
            submodule.VIEW.renderSearch();
            return;
          }
          if (hash === '#results') {
            submodule.VIEW.renderResults();
          }
          var test = /^#clinic:(\d+)$/.exec(hash);
          if (test !== null) {
            var clinic = parseInt(test[1], 10);
            submodule.MODEL.getClinic(clinic);
            return;
          }
        };

        /**
         * Initialise the application.
         */
        component.init = function (selector) {
          selector = selector || 'clinic_finder';
          submodule.region = $('#' +  selector);
          if (!submodule.region.length) {
            return; // Target doesn't exist so don't run.
          }

          module.log('CLINIC_FINDER.CONTROLLER initialising.');

          // Start by making sure the hash is in a known safe state.
          if (window.location.hash) {
            window.location.hash = '';
          }

          // module.POLYFILL will have put in support for this if it's not present.
          $(window).on('hashchange', handleHashChange);

          // Set up the UI event handlers.
          submodule.region.on('click', '.search', handleSearch);
          submodule.region.on('submit', 'form', handleSearch);
          submodule.region.on('click', '.place-result', handlePlaceResult);
          submodule.region.on('click', '.results-result', handleResultsResult);
          submodule.region.on('click', '.restart', handleRestart);
          submodule.region.on('keyup', '.validate', handleInlineValidation);
          submodule.region.on('click', '.geolocate.find', handleGeolocate);
          submodule.region.on('click', '.clear-location', handleClearLocation);

          // Start the view.
          submodule.VIEW.init();
        };

        return component;

      }(module, submodule, submodule.CONTROLLER || {}, $));

    return submodule;

  }(module, module.CLINIC_FINDER || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
