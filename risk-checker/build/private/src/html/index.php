<?php
  $title = 'My RiskChecker';
  $page_id = 'risk_checker';
?>
<?php include(dirname(__FILE__).'/_template/head.html') ?>
<div class="frame">
	<div class="js-enabled">
		<div id="risk_checker">
			<div class="post-splash">
				<div class="introduction" id="introduction">
					<h1 class="c4 highlight">Welcome to My RiskChecker</h1>
					<p class="large-text">Answer a few quick questions and you'll get a personalised STI Risk Report.
						You'll also get clear information about the Sexually Transmitted Infections you're at risk of
						catching, how to avoid them and what to do if you've already got one.</p>
					<p class="large-text">For each question, select the answer that is most applicable to you.</p>
					<ul class="buttons">
						<li>
							<button class="btn start">
								<span class="medium-text">Start RiskChecker</span><br />
								<span class="small-text">And Accept Terms &amp; Conditions</span>
							</button>
						</li>
					</ul>
					<ul class="buttons">
						<li>
							<a class="btn btn-nav btn-secondary" href="./resources.html">
								<span class="medium-text">More Resources</span><br />
								<span class="small-text">Ask a sex question, find a clinic, learn more about STIs</span>
							</a>
						</li>
						 <li><a class="btn btn-nav btn-tertiary" href="./questions.html">Ask a Sexual Health Question</a></li>
					</ul>
					<p><a class="terms" href="./terms-and-conditions.html" rel="modal">Terms and conditions</a></p>
					<div class="disclaimer">
						<h2>Disclaimer:</h2>
						<p>The information provided within the My RiskChecker web application (the "Website"), including
							videos, photographs and any NHS Choices medical information, is for informational or
							educational purposes only and is not a substitute for professional medical care by a
							qualified doctor or other qualified healthcare professional. While we aim to ensure that
							information is accurate, we do not warrant that any information included within this Website
							is correct or will meet your health or medical requirements. This Website does not provide
							any medical or diagnostic services so you should always check with a health professional if
							you have any concerns about your health.</p>
						<p>The risk level you receive at the end of the My RiskChecker application is only an indication
							based on your answers. If you have any concerns, you should always visit your GP or GUM
							clinic.</p>
					</div>
				</div><!-- .introduction -->
			</div>
			<div class="splash-screen">
				Loading...
			</div><!-- .splash-screen -->
		</div><!-- #risk-checker -->
	</div><!-- .js-enabled -->
	<div class="js-disabled">
		<p>In order to use My RiskChecker you will need to enable JavaScript.</p>
		<p>Instructions on how to do this in a number of browsers can be found at <a
				href="http://www.enable-javascript.com/" rel="external">www.enable-javascript.com</a>.</p>
		<p>You can still access our resources to learn more about STIs.</p>
		<ul class="buttons">
			<li><a href="./resources.html" class="btn btn-nav">Resources</a></li>
		</ul>
	</div><!-- .js-disabled -->
	<p class="low-js-show">Your browser has limited JavaScript support and you may encounter problems running the
		questionnaire.</p>
</div><!-- .frame -->
<?php include(dirname(__FILE__).'/_template/foot.html') ?>
