// Kick off the module.
$(document).ready(window.EMBARRASSING_BODIES.init);

// Load in the apps a separate entities if present.
$(document).ready(function () {
  if ($('#risk_checker').length) {
    $.ajax({
      url: './js/risk_checker.js?_=' + window.ebrc_build_number,
      dataType: 'script',
      cache: true,
      success: function() {
        window.EMBARRASSING_BODIES.RISK_CHECKER.CONTROLLER.init('risk_checker');
      }
    });
  }
  if ($('#clinic_finder').length) {
    $.ajax({
      url: './js/clinic_finder.js?_=' + window.ebrc_build_number,
      dataType: 'script',
      cache: true,
      success: function() {
        window.EMBARRASSING_BODIES.CLINIC_FINDER.CONTROLLER.init('clinic_finder');
      }
    });
  }
});
