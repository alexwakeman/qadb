window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

 window.EMBARRASSING_BODIES = (function (module, submodule, $) {

      /**
       * All changes to the DOM are done in this module.
       */
      submodule.VIEW = (function (module, submodule, component, $) {

        var fade_speed = 'normal'; // How fast should the fade effects run?

        var introduction = ''; // Used to hold the content of the introduction for later use.

        // Pre-compiled Mustache templates.
        var templates = {
          'button': Mustache.compile('<button aria-labelledby="question-text" class="btn answer" data-answer="{{ id }}">{{ text }}</button>'),
          'answer': Mustache.compile('<li>{{ &button }}</li>'),
          'paragraph': Mustache.compile('<p>{{ text }}</p>'),
          'reduce_risk': Mustache.compile('<div class="reduce_risk"><h2>How to Reduce Your Risk</h2>{{ &content }}</div>'),
          'answers': Mustache.compile('<ul class="buttons two-column answers">{{ &answers }}</ul>'),
          'progress': Mustache.compile('<div class="progress"><span class="progress-caption">Your progress:</span> {{ &status }}<ol aria-hidden="true">{{ &progress }}</ol></div>'),
          'progress_status': Mustache.compile('<span class="hide">You are on step {{ current }} of {{ total }}</span>'),
          'progress_item': Mustache.compile('<li>&bull;</li>'),
          'progress_item_current': Mustache.compile('<li class="current"><span>&bull;</span></li>'),
          'question': Mustache.compile('<h1 id="question-text" class="question medium-text" data-question="{{ id }}">{{ question }}</h1>'),
          'question_list': Mustache.compile('<ul class="question-list">{{ &list }}</ul>'),
          'question_text': Mustache.compile('<p>{{ text }}</p>'),
          'question_list_item': Mustache.compile('<li>{{ item }}</li>'),
          'question_why': Mustache.compile('<div class="why-asked"><a href="#" class="why-question">Why am I being asked this question?</a><div class="why-answer">{{ &answer }}</div></div>'),
          'question_wrapper': Mustache.compile('<div class="question">{{ &question }}</div>'),
          'finish': Mustache.compile('<h1 class="hide">Results</h1><p>Thanks for your answers. Now it\'s time to get your personalised STI Risk Report&hellip;</p><ul class="buttons"><li><a href="#result" class="btn btn-nav finish">My RiskChecker Report</a></li>'),
          'risk_level': Mustache.compile('<div class="level-{{ slug }}"><div class="content"><h1>Risk Level: {{ level }}</h1>{{ &content }}<ul class="buttons"><li><a class="btn btn-nav" href="./resources.html">Close test and go to resources</a></li></ul></content></div>'),
          'risk_level_bg_cache': Mustache.compile('<div class="risk-level"></div>')
        };

        // Splash screen introduction to the app.
        var splash_screen = $('.splash-screen'),
            splash_screen_timeout = 1; // Time to show the splash screen (seconds).

        /**
         * Clears the splash screen.
         */
        var clearSpashScreen = function () {
          module.log('RISK_CHECKER.VIEW clearing splash screen.');
          if (!splash_screen.is(':visible')) {
            return;
          }
          splash_screen_timer = window.clearTimeout(splash_screen_timer);
          // Animate the screen clearing.
          splash_screen.fadeOut(fade_speed, function () {
            $('.post-splash').fadeIn(fade_speed, function () {
              splash_screen.remove();
              $('#cache').html(templates.risk_level_bg_cache());
            });
          });
        };

        var splash_screen_timer; // Holder for the splash screen timeout.
        /**
         * Set the handers for clearing the splash screen.
         */
        var splashScreen = function () {
          splash_screen.one('click', clearSpashScreen);
          splash_screen_timer = window.setTimeout(clearSpashScreen, splash_screen_timeout * 1000);
        };

        /**
         * Transitions between content views.
         *
         * @param {string} content New content to show in the app region.
         * @param {string} content_class Class to be added to #content. (optional)
         * @param {function} callback Function to be run on completion.
         */
        var transition = function (content, content_class, callback) {
          module.log('RISK_CHECKER.VIEW transitioning content');
          if (typeof callback !== 'function') {
            callback = function() {};
          } else if (typeof content_class === 'function') {
            callback = content_class;
            content_class = '';
          }
          content_class = content_class || '';
          $('#cache').empty();
          submodule.region.fadeOut(fade_speed, function () {
            $('#content').attr('class', content_class);
            submodule.region.html(content);
            module.INTERFACE.buttonHeights();
            $(window).scrollTop(0);
            submodule.region.delay(125).fadeIn(fade_speed, callback);
          });
        };

        /**
         * Renders a question from an model question object.
         *
         * @param {object} MODEL.Question instance.
         */
        component.renderQuestion = function (question) {
          module.log('RISK_CHECKER.VIEW rendering question: ' + question.id);
          var content = '',
              answers = '';
          if (question.progress) {
            var progress = '',
                status = templates.progress_status(question.progress);
            for (var i = 1; i < question.progress.total; i += 1) {
              if (i === question.progress.current) {
                progress += templates.progress_item_current();
              } else {
                progress += templates.progress_item();
              }
            }
            content += templates.progress({ 'status': status, 'progress': progress });
          }
          if (question.hasOwnProperty('paragraphs')) {
            $.each(question.paragraphs, function (i, text) {
              content += templates.question_text({ 'text': text });
            });
          }
          content += templates.question(question);
          if (question.hasOwnProperty('list')) {
            var list = '';
            $.each(question.list, function (i, item) {
              list += templates.question_list_item({ 'item': item });
            });
            content += templates.question_list({ 'list': list });
          }
          if (question.hasOwnProperty('why')) {
            var answer = '';
            $.each(question.why, function (i, text) {
              answer += templates.paragraph({ 'text': text });
            });
            content += templates.question_why({ 'answer': answer });
          }
          $.each(question.answers, function (i, answer) {
            answers += templates.answer({ 'button': templates.button(answer) });
          });
          content += templates.answers({ 'answers': answers });
          content = templates.question_wrapper({ 'question': content });
          transition(content);
        };

        /**
         * Renders the end of test/ get your result action.
         */
        component.renderEnd = function() {
          transition(templates.finish());
        };

        /**
         * Renders the risk level that resulted from the answers.
         */
        component.renderRiskLevel = function () {
          module.log('RISK_CHECKER.VIEW rendering risk level');
          var risk_level = $.extend(true, {}, submodule.MODEL.getRiskLevel());

          risk_level.content = '';

          $.each(risk_level.text.main, function (i, text) {
            risk_level.content += templates.paragraph({ 'text': text });
          });
          if (risk_level.text.hasOwnProperty('reduce_risk')) {
            var reduce_risk = '';
            $.each(risk_level.text.reduce_risk, function (i, text) {
              reduce_risk += templates.paragraph({ 'text': text });
            });
            risk_level.content += templates.reduce_risk({ 'content': reduce_risk });
          }

          transition(templates.risk_level(risk_level), 'risk-level');
        };

        /**
         * Shows the answer to 'why am I being asked this question?'
         */
        component.whyAnswer = function (element) {
          element.fadeOut(fade_speed, function () {
            element.siblings('.why-answer').fadeIn(fade_speed);
          });
        };

        /**
         * Shows the introduction if we're going back in the history.
         */
        component.renderIntroduction = function () {
          transition(introduction);
        };

        /**
         * Initialise the view.
         */
        component.init = function () {
          module.log('RISK_CHECKER.VIEW initialising.');
          // Set a wrapper round the app that has at least the height of the splash screen.
          submodule.region.wrap($('<div/>').css({ 'min-height': submodule.region.height() }));
          introduction = $('#introduction').outerHTML(); // Save this for later use.
          splashScreen();
        };

        return component;

      }(module, submodule, submodule.VIEW || {}, $));

    return submodule;

  }(module, module.RISK_CHECKER || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
