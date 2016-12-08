window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.CLINIC_FINDER = (function (module, submodule, $) {

      submodule.VIEW = (function (module, submodule, component, $) {

        var app_title = ''; // Holder for app title.

        // Pre-compiled Mustache templates.
        var templates = {
          'search': Mustache.compile('{{ &title }}<form><div class="location-found"><label for="search-term" class="hide">Enter Postcode or town</label><input data-error="Please enter a search term" id="search-term" name="search-term" class="validate input" type="text" placeholder="Enter postcode or town"/></div>{{ &geolocation }}<ul class="buttons"><li><input type="submit" value="Search" class="btn search disabled"/></li></ul></form><div class="search-results"><div id="search-results"></div></div>'),
          'places': Mustache.compile('<h2>Places matching "{{ search_text }}"</h2><ol class="places results medium-text">{{ &list }}</ol>'),
          'places_none': Mustache.compile('<h2>No places matched your search, please try again</h2>'),
          'places_result': Mustache.compile('<li><a href="#" data-url="{{ url }}" class="place-result">{{ text }}</a></li>'),
          'results': Mustache.compile('<h1>Results for <span class="highlight">STI testing and treatment</span> near <span class="highlight">{{ text }}</span></h1><ol class="results medium-text">{{ &list }}</ol>'),
          'results_result': Mustache.compile('<li><a href="#" data-id="{{ id }}" class="results-result">{{ name }}</a> <span class="result-distance">{{ distance }} miles away<span></li>'),
          'clinic': Mustache.compile('<h1>{{ name }}</h1><div class="map"><div id="osmap"></div></div><div class="information"><dl><dt>Address</dt><dd><ol class="address">{{ &address }}</ol></dd><dt>Telephone</dt><dd>{{ telephone }}</dd><dt>GP Referral Required</dt><dd>{{ gp_referral }}</dd></dl><div class="non-core">{{ &non_core }}</div></div><p><a href="{{ original }}" rel="external">View on the NHS choices website</a></p>'),
          'error': Mustache.compile('<h1>Sorry, there has been a problem with the search.</h1><p>Please try a different search or come back again later.</p>'),
          'search_again': Mustache.compile('<ul class="buttons"><li><button class="btn restart">Search again</button></li></ul>'),
          'field_error': Mustache.compile('<div class="error-message">{{ error }}</div>'),
          'geolocation': Mustache.compile('<div class="geolocation"><h2 class="location-found x-large-text">or</h2><p>This works on most devices, mobile and desktop, depending on how settings are configured.</p><p><a href="#" class="btn btn-nav geolocate find">{{ button }}</a></p><h2 class="location-found x-large-text">then</h2></div>'),
          'geolocation_find': Mustache.compile('Find your current location'),
          'geolocation_found': Mustache.compile('Using your current location'),
          'geolocation_fail': Mustache.compile('Unable to get your location'),
          'geolocation_thinking': Mustache.compile('Finding your location<span class="thinking"></span>'),
          'geolocation_clear': Mustache.compile('<button class="clear-location">Clear location</button>')
        };

        var fade_speed = 'normal'; // How fast should the fade effects run?

        /**
         * Transitions between content views.
         *
         * @param {jQuery DOM object} target Area to transition.
         * @param {string} content New content to show in the app region.
         * @param {string} content_class Class to be added to #content. (optional)
         * @param {function} callback Function to be run on completion.
         */
        var transition = function (target, content, content_class, callback) {
          module.log('RISK_CHECKER.VIEW transitioning content in ' + target.attr('id'));
          if (typeof callback !== 'function') {
            callback = function() {};
          } else if (typeof content_class === 'function') {
            callback = content_class;
            content_class = '';
          }
          content_class = content_class || '';
          target.fadeOut(fade_speed, function () {
            module.INTERFACE.resetFocus();
            $('#content').attr('class', content_class);
            target.html(content);
            module.INTERFACE.buttonHeights();
            module.INTERFACE.externalLinks();
            if (target.attr('id') === submodule.region.attr('id')) {
              $(window).scrollTop(0);
            } else {
              $(window).scrollTop(submodule.region.offset().top);
            }
            target.delay(125).fadeIn(fade_speed, callback);
          });
        };

        /**
         * Render a map into the page.
         *
         * @param {object} location Latitude, longitude pair.
         * @param {string} target_id Selector for DOM element into which to insert the map.
         */
        var renderMap = function (location, target_id) {
          if (typeof OpenLayers === 'undefined') {
            return;
          }
          target_id = target_id || 'osmap';

          var target = $('#' + target_id);
          target.css({ 'height': target.width() * 3 / 4 }); // Set the aspect ratio of the map.

          // Build the map.
          var map = new OpenLayers.Map({
            'div': target_id,
            'theme': '/css/osmap.css'
          });
          map.addLayer(new OpenLayers.Layer.OSM());
          // Location of clinic.
          var long_lat = new OpenLayers.LonLat(location.long, location.lat).transform(
            new OpenLayers.Projection('EPSG:4326'), // transform from WGS 1984
            map.getProjectionObject() // to the projection used by the map.
          );
          var zoom = 15;
          map.setCenter (long_lat, zoom);

          // Add in the clinic place marker.
          var markers = new OpenLayers.Layer.Markers('Markers');
          markers.addMarker(new OpenLayers.Marker(long_lat));
          map.addLayer(markers);
        };

        // Holder for loading screen timer.
        var loading_timer;

        /**
         * Shows the loading screen.
         */
        component.showLoading = function() {
          if (!loading_timer) {
            loading_timer = window.setTimeout(function () {
              $('.loading').fadeIn('fast');
            }, 500);
          }
        };

        /**
         * Hides the loading screen.
         */
        component.hideLoading = function() {
          $('.loading').fadeOut('fast');
          loading_timer = window.clearTimeout(loading_timer);
        };

        /**
         * Render the results of the last search.
         */
        component.renderResults = function () {
          var content = '',
              list = '';
          $.each(submodule.MODEL.getResult().result, function(i, result) {
            list += templates.results_result(result);
          });
          content += templates.results({'text': submodule.MODEL.getResult().text, 'list': list });
          content += templates.search_again();
          transition(submodule.region, content);
        };

        /**
         * Render a error message for the search text box.
         */
        component.searchError = function (target) {
          if (!target.hasClass('invalid')) {
            target.addClass('invalid');
            target.after(templates.field_error({ 'error': target.data('error') }));
          }
        };

        /**
         * Clears the search error message.
         */
        component.clearSearchError = function (target) {
          target.removeClass('invalid');
          target.siblings('.error-message').remove();
        };

        /**
         * Sets the validation status UI for the entire form.
         *
         * @param {boolean} valid Is the form in a valid state?
         */
        component.validForm = function (valid) {
          if (valid) {
            submodule.region.find('input[type=submit]').removeClass('disabled');
          } else {
            submodule.region.find('input[type=submit]').addClass('disabled');
          }
        };

        /**
         * Renders the search form.
         */
        component.renderSearch = function () {
          component.hideLoading();
          var geolocation = '',
              button = templates.geolocation_find;
          if (submodule.MODEL.getLocation()) {
            button = templates.geolocation_found;
          }
          if ($('html').hasClass('geolocation')) {
            geolocation = templates.geolocation({ 'button': button });
          }
          transition(submodule.region, templates.search({ 'title': app_title, 'geolocation': geolocation }), 'centre', function () {
            if (submodule.MODEL.getLocation()) {
              component.locationUpdate();
            }
            if (!module.POLYFILL.placeholders) {
              submodule.region.find('input').trigger('blur');
            }
          });
        };

        /**
         * Renders a list of places that matched the search.
         *
         * @param {string} text Search term.
         * @param {array} data List of places matching search.
         */
        component.renderPlaces = function (text, data) {
          var content = '',
              results = '';
          if (data.length) {
            $.each(data, function(i, result) {
              results += templates.places_result(result);
            });
            content += templates.places({ 'search_text': text, 'list': results });
          } else {
            content = templates.places_none();
          }
          var search_results = $('#search-results');
          transition(search_results, content, 'centre', function() {
            $(window).scrollTop(search_results.offset().top - 100);
          });
        };

        /**
         * Renders a clinic.
         *
         * @param {object} data Representation of clinic data.
         */
        component.renderClinic = function (data) {
          var content = templates.clinic(data);
          content += templates.search_again();
          transition(submodule.region, content, function () {
            if (data.location) {
              // Render the map - it seems to need a delay.
              window.setTimeout(function () {
                renderMap(data.location);
              }, 500);
            }
          });
        };

        /**
         * Show a generic error message.
         */
        component.renderError = function () {
          var content = templates.error();
          content += templates.search_again();
          transition(submodule.region, content);
        };


        var thinking_interval, // Animates the waiting message.
            thinking_timeout; // Timeout for location data not being returned from geolocation API.
        /**
         * Updates the UI state when we are trying to find the location.
         */
        component.locationFinding = function () {
          var btn = submodule.region.find('.btn.geolocate');
          btn.html(templates.geolocation_thinking()).removeClass('disabled find');
          var thinking = btn.find('.thinking');
          thinking_interval = window.setInterval(function () {
            var len = thinking.text().length + 1,
                throbber = '';
            if (len > 6) {
              len = 0;
            }
            for (var i = 1; i <= len; i += 1) {
                throbber += '.';
            }
            thinking.text(throbber);
          }, 500);
          thinking_timeout = window.setTimeout(function () {
            submodule.MODEL.location_timeout = true;
            component.locationError();
          }, 30 * 1000);
        };

        /**
         * Updates the UI state to reflect the location being updated.
         */
        component.locationUpdate = function () {
          thinking_interval = window.clearInterval(thinking_interval);
          thinking_timeout = window.clearTimeout(thinking_timeout);
          if (submodule.MODEL.getLocation() && !submodule.MODEL.location_timeout) {
            submodule.region.find('.btn.geolocate').html(templates.geolocation_found()).removeClass('disabled find').after(templates.geolocation_clear());
            submodule.region.find('.location-found').slideUp();
          } else {
            submodule.region.find('.btn.geolocate').html(templates.geolocation_find()).addClass('find');
            submodule.region.find('.clear-location').remove();
            submodule.region.find('.location-found').slideDown();
          }
          component.validForm(submodule.CONTROLLER.validateForm());
        };

        /**
         * Sets the UI state when there was an error getting the location.
         */
        component.locationError = function () {
          thinking_interval = window.clearInterval(thinking_interval);
          thinking_timeout = window.clearTimeout(thinking_timeout);
          submodule.region.find('.btn.geolocate').html(templates.geolocation_fail()).addClass('disabled');
          submodule.region.find('.clear-location').remove();
          submodule.region.find('.location-found').slideDown();
          component.validForm(submodule.CONTROLLER.validateForm());
        };

        /**
         * Initialise the application.
         */
        component.init = function () {
          app_title = $('#app_title').outerHTML();

          var min_height = '20em';
          if ($('html').hasClass('geolocation')) {
            min_height = '30em';
          }
          min_height = { 'min-height': min_height };

          submodule.region.wrap($('<div/>').css(min_height));
          $('.loading').css(min_height);
          component.renderSearch();
          // Lazy load the Open Street Map library.
          $.ajax({
            'url': './js/OpenLayers.js',
            'dataType': 'script',
            'cache': true
          });
        };

        return component;

      }(module, submodule, submodule.VIEW || {}, $));

    return submodule;

  }(module, module.CLINIC_FINDER || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
