window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.RISK_CHECKER = (function (module, submodule, $) {

      /**
       * Controller for the application - handles all interaction.
       */
      submodule.CONTROLLER = (function (module, submodule, component, $) {

        var region = 'risk_checker'; // ID for area to use for the app.

        /**
         * Deal with an answer being selected.
         */
        var handleAnswer = function (e) {
          module.log('RISK_CHECKER.CONTROLLER answer being handled.');
          e.preventDefault();
          var answer = $(this).data('answer');
          submodule.MODEL.setAnswer(answer);
          var next_question = submodule.MODEL.getQuestion().answers[answer].next;
          // Trigger the router.
          if (next_question === 'end') {
            // Send the analytics data.
            module.ANALYTICS.track('results', submodule.MODEL.getAnalytics());
            window.location.hash = 'end';
          } else {
            window.location.hash = 'q-' + next_question;
          }
        };

        /**
         * Entry point into the questionnaire.
         */
        var handleStart = function (e) {
          module.log('RISK_CHECKER.CONTROLLER starting questionnaire.');
          e.preventDefault();
          submodule.MODEL.init();
          window.location.hash = 'q-' + submodule.MODEL.getQuestion().id;
        };

        /**
         * This moves us between questions and supports the back button.
         *
         * This is essentially our router.
         */
        var handleHashChange = function () {
          module.log('RISK_CHECKER.CONTROLLER hashchange being handled.');
          var hash = window.location.hash;
          if (hash === '') {
            submodule.VIEW.renderIntroduction();
            return;
          }
          if (hash === '#end') {
            submodule.MODEL.setFinished();
            submodule.VIEW.renderEnd();
            return;
          }
          if (hash === '#result') {
            // Any result will be be the same in the browser history.
            submodule.VIEW.renderRiskLevel();
            return;
          }
          var test = /^#q-(\d+)$/.exec(hash);
          if (test !== null) {
            if (parseInt(test[1], 10) === 0) { // Result from a regex is a string.
              submodule.MODEL.init();
            } else {
              submodule.MODEL.setProgress(test[1]);
            }
            return;
          }
        };

        /**
         * Finish the questionnaire.
         */
        var handleFinish = function () {
          submodule.MODEL.setFinished();
          window.location.hash = 'result';
        };

        /**
         * Show the terms and conditions.
         */
        var handleTerms = function (e) {
          e.preventDefault();
          module.ANALYTICS.track('ts-and-cs');
          submodule.VIEW.renderTermsAndConditions($(this).attr('href'));
        };

        /**
         * Why am I being asked this question UI.
         */
        var handleWhyQuestion = function(e) {
          e.preventDefault();
          submodule.VIEW.whyAnswer($(this));
        };

        /**
         * Initialise the application.
         */
        component.init = function (selector) {
          selector = selector || 'risk_checker';
          submodule.region = $('#' +  selector);
          if (!submodule.region.length) {
            return; // Target doesn't exist so don't run.
          }

          module.log('RISK_CHECKER.CONTROLLER initialising.');

          // Start by making sure the hash is in a known safe state.
          if (window.location.hash) {
            window.location.hash = '';
          }

          // module.POLYFILL will have put in support for this if it's not present.
          $(window).on('hashchange', handleHashChange);

          // Set up the UI event handlers.
          submodule.region.on('click', '.start', handleStart);
          submodule.region.on('click', '.answer', handleAnswer);
          submodule.region.on('click', '.finish', handleFinish);
          submodule.region.on('click', '.why-question', handleWhyQuestion);

          // Start the view.
          submodule.VIEW.init();
        };

        return component;

      }(module, submodule, submodule.CONTROLLER || {}, $));

    return submodule;

  }(module, module.RISK_CHECKER || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));

