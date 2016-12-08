
window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.INTERFACE = (function (module, submodule, $) {
    /**
     * Adds the hook for focus highlight.
     */
    var keyboardHook = function () {
      $(document).one('keydown', function (e) {
        if (e.target.nodeName.toLowerCase() === 'input' && e.which !== 9) {
          // Don't run on input fields unless tab.
          keyboardHook();
        } else {
          $('html').addClass('keyboard');
        }
      });
    };
    module.registerLoad(keyboardHook);

    submodule.resetFocus = function () {
      $('html').removeClass('keyboard');
      keyboardHook();
    };

    return submodule;
  }(module, module.INTERFACE || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
