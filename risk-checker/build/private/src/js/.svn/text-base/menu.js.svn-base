window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.MENU = (function (module, submodule, $) {

    var menu_bar = $('.menu-bar'),
        menu_enabled = !!(menu_bar.length);

    /**
     * Inserts control for and handles the show/hide of the menu.
     */
    var menuControl = function() {
      // Start by injecting the UI elements.
      var menu_toggle = $('<a href="#" class="menu-toggle sprite"><span class="hide">Show</span> Menu</a>'),
          expandable = $('.expandable');

      expandable.wrapInner('<div class="expandable-content" style="display:none;"/>').append('<div class="overhang"/>');

      // Now we need to handle interactions with the menu toggle switch.
      menu_toggle.on('click', function(e) {
        e.preventDefault();

        var expandable = $(this).parents('.menu').find('.expandable'),
            expandable_content = expandable.find('.expandable-content'),
            overhang = expandable.find('.overhang');

        if (expandable.is(':visible')) {
          // Slide the menu up.
          expandable_content.slideUp('normal', function() {
            // Now the menu is slid up we can hide the shadow.
            overhang.slideUp(10, function() {
              // Hide the expander completely.
              expandable.hide(1);
              $(e.target).html('<span class="hide">Show</span> Menu');
            });
          });
        } else {
          // Slide the menu down, start by showing the (visibly empty) expander.
          expandable.show(1, function() {
            // Now show the shadow so the menu has a shadow as it's dropping.
            overhang.slideDown(10, function () {
              // Slide down the menu.
              expandable_content.slideDown('normal', function() {
                $(e.target).html('Close <span class="hide">menu</span>');
              });
            });
          });
        }
      });
      menu_bar.append(menu_toggle);
    };

    if (menu_enabled) {
      module.register(menuControl);
    }

    return submodule;
  }(module, module.MENU || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
