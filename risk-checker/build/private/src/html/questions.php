<?php
  $title = 'My RiskChecker';
  $page_id = 'risk_checker';
?>
<?php include(dirname(__FILE__).'/_template/head.html') ?>
<div class="frame health-question">
	<div class="ask-question">
		<h2>Got a sexual health question?</h2>
		<p>Start typing a phrase or keyword in this search box for a clear and frank answer...</p>
		<p>When you start typing, a list of possible questions will appear below the search box. Choose the most
			relevant question. If no relevant question appears, you can <a href="./submit-question.html">submit a new
				one</a>.</p>
		<form>
			<div class="search-box">
				<input type="text" placeholder="Type phrase/keyword" name="question-input" class="input search"/><a href="./" class="btn search-btn">Search</a>
			</div>

			<ul id="question-suggest-list" class="hidden">

				<li class="question-template"><a href=""></a></li>
				<li class="submit-it"><a href="./submit-question.html">Can't find a suitable question and answer?<br/>Submit
					your question here</a></li>
			</ul>
		</form>
		<div class="automated-service">
			<h2>Automated Service</h2>
			<p>This is an automated service. You are searching a resource of the most commonly asked sexual health
				questions and related answers. Your question will be matched with the closest available answer. If no
				suitable match is available, you can <a href="./submit-question.html">submit a question</a> and an answer
				may be added to the database in the future.</p>
		</div>
	</div>
	<ul class="buttons">
		<li><a href="./" class="btn">Not taken the test?</a></li>
	</ul>

	<div class="js-disabled">
		<p>In order to ask a question you will need to enable JavaScript.</p>
		<p>Instructions on how to do this in a number of browsers can be found at <a
				href="http://www.enable-javascript.com/" rel="external">www.enable-javascript.com</a>.</p>
	</div><!-- .js-disabled -->
</div><!-- .frame -->
<?php include(dirname(__FILE__).'/_template/foot.html') ?>
