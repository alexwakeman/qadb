/**
* Equal sized columns
* @extends jQuery
*
* Sets the vertical height of elements to be the same.
*
* @param {Boolean} [abort=false] If true then the resize won't run.
*/
$.fn.vjustify = function (abort) {
  var max_height = 0,
      css_height = 'min-height',
      css_reset = '0';
  if (abort) {
    return;
  }
  if (typeof document.body.style.minHeight === 'undefined') {
    css_height = 'height';
    css_reset = 'auto';
  }
  this.each(function (){
    $(this).css({css_height: css_reset});
    // HACK: This has a +1 in it to try and get buttons  with very different sized content to line up a bit better at some screen widths.
    max_height = Math.max($(this).height() + 1, max_height);
  });
  this.each(function (){
    $(this).css(css_height, max_height + 'px');
  });
};
