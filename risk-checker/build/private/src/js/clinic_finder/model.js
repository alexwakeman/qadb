window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.CLINIC_FINDER = (function (module, submodule, $) {

      submodule.MODEL = (function (module, submodule, component, $) {
        // This is a very basic postcode search - not perfect but should be good enough for what we need here.
        var half_postcode = /([A-Z]{1,2}[0-9]{1,2}[A-Z]?)/,
            full_postcode = /([A-Z]{1,2}[0-9]{1,2}[A-Z]?)\s?([0-9]{1,2}[A-Z]{1,2})/;

        // Last result from search so we can recreate it when going back in time.
        var last_result = {
          'text': '',
          'result': []
        };

        /**
         * Stores a result for later use and caches the first item.
         *
         * @param {string} text Search text.
         * @param {array} result Result of search.
         */
        var setLastResult = function (text, result) {
          last_result.text = text;
          last_result.result= result;
          if (result.length) {
            // Pre-emptive cache of the top result.
            component.getClinic(result[0].id, false);
          }
        };

        /**
         * Gets the last search result.
         *
         * @returns {array} Result of last search.
         */
        component.getResult = function () {
          return $.extend(true, {}, last_result); // Return a copy to prevent modification.
        };


        // Current location.
        var location = {
          'latitude': null,
          'longitude': null
        };
        // Last known location.
        var last_location = {
          'latitude': null,
          'longitude': null
        };

        component.location_timeout = false; // Did we timeout looking for the location?

        /**
         * Handler for location found by geolocation API.
         */
        var locationFound = function (position) {
          component.location_timeout = false;
          setLocation(position.coords);
          last_location = $.extend(true, {}, location);
          submodule.VIEW.locationUpdate();
          submodule.VIEW.validForm(!$('input.invalid').length || submodule.MODEL.getLocation());
        };

        /**
         * Handler for location error from geolocation API.
         */
        var locationError = function () {
          component.clearLocation();
          submodule.VIEW.locationError();
          submodule.VIEW.validForm(!$('input.invalid').length || submodule.MODEL.getLocation());
        };

        /**
         * Find the current location - either from cached known info or from the location API.
         */
        component.findLocation = function () {
          if (!component.getLocation()) {
            if (last_location.latitude !== null && last_location.longitude !== null) {
              location = $.extend(true, {}, last_location);
            } else {
              navigator.geolocation.getCurrentPosition(locationFound, locationError);
              return;
            }
          }
          submodule.VIEW.locationUpdate();
          submodule.VIEW.validForm(!$('input.invalid').length || submodule.MODEL.getLocation());
        };

        /**
         * Store the current location as internal variable.
         *
         * @param {object} coords Location coordinates.
         */
        var setLocation = function (coords) {
          var latitude = parseFloat(coords.latitude);
          if (!isNaN(latitude)) {
            location.latitude = latitude;
          }
          var longitude = parseFloat(coords.longitude);
          if (!isNaN(longitude)) {
            location.longitude = longitude;
          }
        };

        /**
         * Get the current location from internal variable.
         *
         * @returns {object|boolean} Current location or false if not set.
         */
        component.getLocation = function () {
          if (location.latitude !== null && location.longitude !== null) {
            return $.extend(true, {}, location);
          } else {
            return false;
          }
        };

        /**
         * Clear the current location from internal variable.
         *
         * This clears the working copy of the location - there will be a copy cached in last_location for future use.
         */
        component.clearLocation = function () {
          location = {
            'latitude': null,
            'longitude': null
          };
          submodule.VIEW.locationUpdate();
          submodule.VIEW.validForm(submodule.CONTROLLER.validateForm());
        };

        // Cache of clinic data, keyed by clinic id.
        var clinics = {};

        /**
         * Stores a clinic in the cache.
         *
         * @param {number} id ID of clinic.
         * @param {object} data Data representation of the clinic.
         */
        var setClinic = function (id, data) {
          clinics[id] = data;
        };

        /**
         * Is a string a post code?
         *
         * @param {string} search_text Text to check.
         *
         * @return {string|bool} Normalised post code if found, false if not found.
         */

        component._isPostCode = function (search_text) {
          var search_text_upper = search_text.toUpperCase();

          var match = search_text_upper.match(full_postcode);
          if (match !== null) {
            return match[1] + match[2];
          }
          match = search_text_upper.match(half_postcode);
          if (match !== null) {
            return match[1];
          }
          return false;
        };

        /**
         * Process the result of a place name search.
         *
         * This should be a list of places that matched the search term.
         *
         * @param {string} text Search term.
         * @param {array} result List of places matching search.
         */
        var processPlaceResult = function (text, result) {
          var data = {};
          data.search_text = text;
          data.results = result;
          submodule.VIEW.renderPlaces(text, result);
        };

        /**
         * Process the result of a postcode or location search.
         *
         * This should be a list of clinics near the postcode or location.
         *
         * @param {string} text Search term.
         * @param {array} result List of clinics near the postcode or location.
         */
        var processResult = function (text, result) {
          if (result.length) {
            setLastResult(text, result);
            window.location.hash = 'results';
          } else {
            // Show a search error for no results found.
            submodule.VIEW.renderPlaces(text, result);
          }
        };

        /**
         * Get the results for a known location.
         *
         * @param {string} text Search term.
         * @param {string} text Location URL as passed back from the API.
         */
        component.getPlaceResults = function (text, url) {
          submodule.VIEW.showLoading();
          $.ajax('/nhs/', {
            'data': {
              'place': url
            },
            'dataType': 'json',
            'success': function (result) {
              setLastResult(text, result);
              window.location.hash = 'results';
            },
            'error': function () {
              submodule.VIEW.renderError();
            },
            'complete': function () {
              submodule.VIEW.hideLoading();
            }
          });
        };

        /**
         * Gets a clinic either from the cache or the server.
         *
         * @param {number} id ID of the clinic.
         * @param {boolean} interactive Is this an interactive fetch or is this just to cache the data?
         *
         * @returns {object} Data representation of the clinic.
         */
        component.getClinic = function (id, interactive) {
          if (typeof interactive === 'undefined') {
            interactive = true;
          }
          if (clinics.hasOwnProperty(id)) {
            // Clinic is cached.
            if (interactive) {
              submodule.VIEW.renderClinic(clinics[id]);
            }
          } else {
            // Get data from the server.
            if (interactive) {
              submodule.VIEW.showLoading();
            }
            $.ajax('/nhs/', {
              'data': {
                'clinic': id
              },
              'dataType': 'json',
              'success': function (result) {
                setClinic(id, result);
                if (interactive) {
                  submodule.VIEW.renderClinic(clinics[id]);
                }
              },
              'error': function () {
                submodule.VIEW.renderError();
              },
              'complete': function () {
                submodule.VIEW.hideLoading();
              }
            });
          }
        };

        /**
         * Perform a search using the API.
         *
         * This will try and guess if it's a postcode search and select the appropriate path accordingly.
         *
         * @param {string} search_text Search term.
         */
        component.search = function (search_text) {
          var data = { 'search': search_text },
              success_callback = processPlaceResult;

          var postcode_search = component._isPostCode(search_text);
          if (postcode_search) {
            data = { 'postcode': postcode_search };
            success_callback = processResult;
          }

          submodule.VIEW.showLoading();
          $.ajax('/nhs/', {
            'data': data,
            'dataType': 'json',
            'success': function (result) {
              success_callback.call(null, search_text, result);
            },
            'error': function () {
              submodule.VIEW.renderError();
            },
            'complete': function () {
              submodule.VIEW.hideLoading();
            }
          });
        };

        /**
         * Perform a location based search using the API.
         */
        component.searchLocation = function () {
          var data = {
            'lat': location.latitude,
            'long': location.longitude
          };
          submodule.VIEW.showLoading();
          $.ajax('/nhs/', {
            'data': data,
            'dataType': 'json',
            'success': function (result) {
              processResult('your location', result);
            },
            'error': function () {
              submodule.VIEW.renderError();
            },
            'complete': function () {
              submodule.VIEW.hideLoading();
            }
          });
        };

        return component;

      }(module, submodule, submodule.MODEL || {}, $));

    return submodule;

  }(module, module.CLINIC_FINDER || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
