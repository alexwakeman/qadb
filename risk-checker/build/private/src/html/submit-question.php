<?php
  $title = 'My RiskChecker';
  $page_id = 'risk_checker';
?>
<?php include(dirname(__FILE__).'/_template/head.html') ?>
<div class="frame health-question">
	<div id="submit-question">
		<h1>Submit a question</h1>
		<p>Can't find the question and answer you need? Suggest a question using the submission tool below.</p>
		<p>Please make your question general so it is also useful to others. Questions with specific personal details cannot be answered.</p>
		<p><a href="./what-happens-question.html">What happens to my question?</a></p>
		<form id="ask-question-form">
			<textarea placeholder="Type your sexual health question" name="question-txt" class="textarea" maxlength="255" id="ask-question-text"></textarea>
			<ul class="buttons">
				<li><input type="submit" value="Submit My Question" class="btn ga-track" data-ebrc-track-type="submit" data-ebrc-track-event="question" data-ebrc-track-source="#ask-question-text"/></li>
			</ul>
		</form>
	</div>
	<div id="question-feedback" class="hidden">
		<h2>Thanks for your question</h2>
		<p>Submitted questions are reviewed periodically by a panel of sexual health professionals. If a submitted question is not currently answered by this service, an answer may be provided and added to the database. It is not possible to enter into correspondence, nor to notify a user that an answer to their question has been provided. This service is for informational or educational purposes only and is not a substitute for professional medical care by a qualified doctor or other qualified healthcare professional. <a href="/what-happens-question.html">Read more about what happens to submitted questions</a>.</p>
		<ul class="buttons">
			<li><a href="/" class="btn">Take The Test</a></li>
			<li><a href="./questions.html" class="btn">Search Again</a></li>
		</ul>
	</div>
</div><!-- .frame -->
<?php include(dirname(__FILE__).'/_template/foot.html') ?>
