window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.FONTS = (function (module, submodule, $) {

    // Config for web font loader.
    window.WebFontConfig = {
      custom: {
        families: ['c4headlineregular']
      },
      active: module.INTERFACE.buttonHeights // The font changes the height of the buttons.
    };

    /**
     * Bring in the font loader script (self initialising).
     */
    var init = function () {
      $.ajax({
        'url': './js/webfont.js?_=' + window.ebrc_build_number,
        'dataType': 'script',
        'cache': true
      });
    };
    init(); // Don't wait for DOM ready.

    return submodule;
  }(module, module.FONTS || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
