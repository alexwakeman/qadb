window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.VIDEO = (function (module, submodule, $) {

    /**
     * Resize the the videos and then initiate the Brightcove player.
     *
     * The BC player seems to set hard widths so we can't resize using CSS.
     */
    var init = function () {
      var video = $('.video');
          loading = video.find('.loading');
      if (!video.length) {
        return;
      }
      var width = video.width();
      var height = width * (3/4); // Assume a 4:3 aspect ratio.
      video.css({'min-height': height}); // Put in a placeholder height to reduce vertical jump on video load.
      loading.css({'min-height': height});
      video.find('param[name=width]').attr('value', width);
      video.find('param[name=height]').attr('value', height);
      // Bring in the BC script and kick off the players.
      $.ajax({
        'url': 'http://admin.brightcove.com/js/BrightcoveExperiences.js',
        'dataType': 'script',
        'cache': true,
        'success': function () {
          if (typeof brightcove.createExperiences === 'function') {
            brightcove.createExperiences();
          }
        },
        'error': function () {
          module.log('VIDEO Brightcove script failed to load. Fatal error.');
        }
      });

      // Prevents jump when the content is removed.
      var load_notice = $('.load-notice');
      load_notice.css({'min-height': load_notice.height() });

    };
    module.register(init);

    /**
     * Clears the notice about load time when all videos have loaded.
     */
    var clearNotice = function () {
      if (!$('.video .loading').length) {
        $('.load-notice p').fadeOut();
      }
    };

    /**
     * Handler for when the Brightcode player loads.
     */
    submodule.templateLoad = function (experience) {
      var loading = $('#' + experience).parents('.video').find('.loading');
      loading.remove();
      clearNotice();
    };

    /**
     * Handler for when the Brightcove player fails to load.
     */
    submodule.templateError = function (error) {
      // We get information in a different format and DOM is changed so have to convert.
      submodule.templateLoad('_container' + error.info);
    };


    return submodule;
  }(module, module.VIDEO || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
