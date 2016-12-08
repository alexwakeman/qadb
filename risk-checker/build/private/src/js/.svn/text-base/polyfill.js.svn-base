// Polyfills for missing browser support.

window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.POLYFILL = (function (module, submodule, $) {

    /**
     * Fires the hash change event for browsers that don't support it natively.
     */
    function HashBangPoll() {
        var hashbang_timer,
            last_hash = document.location.hash;
        function checkHash() {
          if (document.location.hash !== last_hash) {
            last_hash = document.location.hash;
            $(window).trigger('hashchange');
          }
        }
        this.start = function () {
          hashbang_timer = window.setInterval(checkHash, 125);
        };
        this.stop = function () {
          hashbang_timer = window.clearInterval(hashbang_timer);
        };
        return this;
    }

    if ('onhashchange' in window === false) {
      // Spoof the hashchange for dumb browsers.  IE - I'm talking to you here.
      hashbang_poll = new HashBangPoll();
      hashbang_poll.start();
    }

    /**
     * Outer HTML polyfill for browsers that don't support it.
     * @extends jQuery
     *
     * @returns {String} Full HTML for element including the element itself.
     */
    $.fn.outerHTML = function () {
      var content;
      if (!$(this).length) {
        return '';
      }
      if ('outerHTML' in $(this)[0]) {
        return $(this)[0].outerHTML;
      } else {
        content = $(this).wrap('<div></div>').parent().html();
        $(this).unwrap();
        return content;
      }
    };


    /**
     * Helper for feature detection.  Does an element support an attribute?
     *
     * @param {String} element Name of element to check for support.
     * @param {String} attribute Name of attribute to check for support in element.
     *
     * @returns {Boolean} Is support for this attribute present for this element in this engine?
     */
    submodule.elementSupportsAttribute = function (element, attribute) {
      var test_element = document.createElement(element);
      return !!(attribute in test_element);
    };

    /**
     * Polyfill for placeholder support.
     *
     * @return {Boolean} Was native support present?
     */
    submodule.placeholders = (function () {
      if (submodule.elementSupportsAttribute('input', 'placeholder')) {
        return true;
      } else {
        // Polyfil for placeholder text.
        $(document).on('blur', 'input', function () {
          var placeholder = $(this).attr('placeholder');
          if (placeholder) {
            if($(this).val() === '') {
              $(this).addClass('placeholder').val(placeholder);
            }
          }
        }).on('focus', 'input', function () {
          var placeholder = $(this).attr('placeholder');
          if (placeholder) {
            if($(this).val() === placeholder) {
              $(this).val('').removeClass('placeholder');
            }
          }
        }).find('input').trigger('blur');
        return false;
      }
    }());

    return submodule;

  }(module, module.POLYFILL || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
