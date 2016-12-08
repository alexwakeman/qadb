window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.INTERFACE = (function (module, submodule, $) {

    /**
     * Sets the button rows to equal heights to preserve table style layout.
     */
    submodule.buttonHeights = function () {
      var row = 0,
          row_items,
          buttons = $('.two-column');
      buttons.each (function (i) {
        var buttons_width = buttons.width();
        $(this).find('li').each(function (j) {
          if ($(this).width() < buttons_width) {
            // We're in a two column layout.
            $(this).addClass('row-' + row);
            if (j%2) {
              row += 1;
            }
          }
        });
      });
      for (var i = 0; i < row; i += 1) {
        row_items = $('.row-' + i);
        row_items.vjustify();
      }
    };
    module.register(submodule.buttonHeights);
    module.registerLoad(submodule.buttonHeights); // Images loading can change button heights.
    module.registerResize(submodule.buttonHeights); // Buttons change height on resize.

    /**
     * Remove the non-js content from the DOM.
     */
    var clearNonJS = function () {
      $('.js-disabled').remove();
    };
    module.register(clearNonJS);

    /**
     * Loads images based on viewport size.
     */
    var lazyLoadImages = function () {
      $('div.lazy-image').each(function() {
        if ($(this).is(':visible')) {
          var img = $('<img/>');
          img.attr('src', $(this).data('src')).attr('alt', $(this).data('alt')).attr('class', $(this).attr('class')).attr('title', $(this).data('title'));
          $(this).before(img);
          $(this).remove();
        }
      });
    };
    module.register(lazyLoadImages);
    module.registerResize(lazyLoadImages);

    /**
     * Shows a modal window with remote content.
     */
    submodule.modal = function () {
      if ($('html').hasClass('low-js')) {
        // Don't use the modal if JS support is poor - it causes problems.
        return;
      }

      // Set up the modal in the page.
      $('body').append('<div id="modal_window" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modal-title" aria-hidden="true"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">Close ×</button></div><div class="modal-body"></div></div>');

      // Handle the modal show.
      var modal_window = $('#modal_window');
      $(document).on('click', 'a[rel=modal]', function (e) {
        e.preventDefault();
        var scroll_position = $(window).scrollTop(); // Where did we start in the window.
        var return_position = false; // Should we return to the start position?

        // Build and show the modal.
        modal_window.modal({
          'remote': $(this).attr('href') + '?_=' + window.ebrc_build_number + ' #modal-target' // Get remote content from the link.
        }).on('hidden', function () {
          if (return_position) {
            // Return to where we were.
            $(window).scrollTop(scroll_position);
          }
        }).on('show', function () {
          if (modal_window.css('position') === 'absolute') {
            // We will need to return to where we were.
            return_position = true;
            // Jump to the top of the modal.
            $(window).scrollTop(modal_window.offset().top);
          }
        }).modal('show');

      });
    };
    module.register(submodule.modal);

    /**
     * Handles external links opening in a new window.
     */
    submodule.externalLinks = function () {
      var external_links = $('a[rel=external]');
      if (!external_links.length) {
        return;
      }
      external_links.each(function () {
        if (!$(this).attr('target')) {
          $(this).attr('title', 'This link opens in a new window.').attr('target', '_blank');
          if (!$(this).hasClass('btn')) {
            $(this).css({ 'white-space': 'nowrap' }).append('<span class="hide"> This link opens in a new window.</span><span class="sprite external-icon"></sprite>');
          }
        }
      });
    };
    module.register(submodule.externalLinks);

    return submodule;
  }(module, module.INTERFACE || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
