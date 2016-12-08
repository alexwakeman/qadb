window.EMBARRASSING_BODIES = (function (module, $) {
	'use_strict';

	$.support.cors = true;
	$.ajaxSetup({
		error: function (xhr) {
			console.log('ERROR : Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
		}
	});

	$('.ask-question form').submit(function (evt) {
		evt.preventDefault();
		performSearch();
	});

	$('a.btn.search-btn').click(function (evt) {
		evt.preventDefault();
		performSearch();
	});

	$('input[name="question-input"]').on('keyup', function () {
		var input = $(this).val();
		var questionSuggestList = $('#question-suggest-list');

		if (input.length > 0) {
			$.when(suggest(input)).done(function (result) {
				applyResultsList(result.data, questionSuggestList);
			});
		} else {
			questionSuggestList.find('.suggest').remove();
			questionSuggestList.addClass('hidden');
		}
	});

	function performSearch() {
		var term = $('input[name="question-input"]').val();
		var questionSuggestList = $('#question-suggest-list');
		$.when(search(term)).done(function (result) {
			applyResultsList(result.data.qaResults, questionSuggestList);
		});
	}

	function applyResultsList(results, questionSuggestList) {
		var template, id, question, entry, questions = [],
			input = $('input[name="question-input"]').val(),
			inputWords = input.split(' ');
		questionSuggestList.find('.suggest').remove();
		// highlight the user's input in the suggest list
		for (var i = 0; i < results.length; i++) {
			entry = results[i];
			id = entry._id;
			question = entry.question;
			inputWords.forEach(function(word) {
				var matchRegEx = new RegExp(word, 'i')
				question = question.replace(matchRegEx, '<span class="keyword">' + word + '</span>');
			});

			template = $('.question-template').clone();
			template.removeClass('question-template').addClass('suggest');
			template.find('a').prop('href', './answer-question.html#' + id).html(question);
			questions[i] = template;
		}
		questionSuggestList.removeClass('hidden').prepend(questions);
	}

	if (window.location.hash) {
		var id = window.location.hash.substring(1);
		$('.loading').removeClass('hidden');
		$.when(fetchAnswer(id)).done(function (result) {
			$('.loading').addClass('hidden');
			$('#question-title').html(result.data.question);
			$('#answer-p').html(result.data.answer);
		});
	}


	$('#ask-question-form').submit(function () {
		var question = $('textarea[name="question-txt"]').val();
		$('#submit-question').addClass('hidden');
		$('#question-feedback').removeClass('hidden');

		return false;
	});


	function suggest(input) {
		return $.ajax({
			url: '/api/suggest/' + input,
			dataType: 'json'
		});
	}

	function fetchAnswer(id) {
		return $.ajax({
			url: '/api/qa/' + id,
			dataType: 'json'
		});
	}

	function search(term) {
		return $.ajax({
			url: '/api/search/' + term + '/1',
			dataType: 'json'
		});
	}

	return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
