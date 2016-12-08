<?php
  $title = 'My RiskChecker';
  $page_id = 'risk_checker';
?>
<?php include(dirname(__FILE__).'/_template/head.html') ?>
<div class="frame health-question">
	<div class="loading hidden"><img src="./img/loading.gif" alt="loading"/></div>
	<h2 id="question-title"></h2>

	<div class="answer">
		<p id="answer-p"></p>
	</div>

	<ul class="buttons">
		<li>If you are concerned, contact your doctor or search for your<br>local sexual health clinic using <a href="./clinic-finder.html">this tool</a>.</li>
		<li><a href="./resources.html" class="btn ga-track" data-ebrc-track-type="link" data-ebrc-track-event="click" data-ebrc-track-data="thanks">Thanks, This Answered My Question</a></li>
		<li><a href="./questions.html" class="ga-track" data-ebrc-track-type="link" data-ebrc-track-event="click" data-ebrc-track-data="search again">This didn't answer my question. Search again</a></li>
	</ul>
</div><!-- .frame -->
<?php include(dirname(__FILE__).'/_template/foot.html') ?>
