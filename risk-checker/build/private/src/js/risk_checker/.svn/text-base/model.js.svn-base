window.EMBARRASSING_BODIES = (function (module, $) {
  "use_strict";

  module.RISK_CHECKER = (function (module, submodule, $) {

      /**
       * Stores the application state.
       *
       * The question data is stored at the bottom of this module.
       */
      submodule.MODEL = (function (module, submodule, component, $) {

        /**
         * Store of question => answer.
         *
         */
        var answers = {};

        /**
         * Maps scores to answer risk levels.
         */
        var scores = {
          'none': 0,
          'low': 2,
          'medium': 5,
          'high': 10,
          'xhigh': 1000
        };

        /**
         * Class for representing a Question.
         */
        var Question = function (data) {
          module.log('RISK_CHECKER.MODEL.Question initialising');

          // We need to work with a copy of the question to prevent modification of the original.
          var question = $.extend(true, {}, data);

          // Set the right question for the STI check status.
          if (!question.hasOwnProperty('question')) {
            if (component.isChecked()) {
              question.question = question.question_checked;
            } else  {
              question.question = question.question_unchecked;
            }
          }

          // Sets the progress.
          if (question.id < 1) {
            question.progress = false;
          } else {
            // No native length property on objects.
            var length = 0;
            $.each(component.getQuestions(), function(i) {
              length += 1;
            });
            question.progress = {
              'current': progress,
              'total': length
            };
          }

          /**
           * Returns an answer by its index.
           */
          question.getAnswer = function (index) {
          module.log('RISK_CHECKER.MODEL.Question ' + question.id + ' attempting get answer: ' + index);
            if (!question.answers.hasOwnProperty(index)) {
              throw new RangeError('Answer out of range: '+ index);
            }
            return question.answers[index];
          };

          return question;
        };

        /**
         * Respondent's gender - 0 => male, 1 => female.
         */
        component.getGender = function() {
          if (answers.hasOwnProperty(0)) {
            return answers[0];
          } else {
            return 0;
          }
        };

        /**
         * Has the respondent had an STI check.
         */
        component.isChecked = function() {
          if (answers.hasOwnProperty(2)) {
            return !(answers[2]);
          } else {
            return false;
          }
        };

        /**
         * Which question are we on?
         */
        var progress = 1;

        /**
         * Move to a new question.
         */
        component.setProgress = function (new_progress) {
          module.log('RISK_CHECKER.MODEL attempting to move to:' + progress);
          new_progress = parseInt(new_progress, 10);
          if (isNaN(new_progress)) {
            new_progress = 0;
          }
          try {
            component.getQuestion(new_progress);
          } catch (ex) {
            if (ex instanceof RangeError) {
              new_progress = 0;
            }
          }
          if (new_progress === progress) {
            // We're not actually moving.
            return;
          }
          progress = new_progress;
          // Render the new state.
          submodule.VIEW.renderQuestion(component.getQuestion());
        };

        /**
         * Register that the questionnaire is finished so that going
         * back to the last question will trigger a state change.
         */
        component.setFinished = function () {
          progress = 'finished';
        };

        /**
         * Exposes the progress as read only.
         */
        component.getProgress = function () {
          return progress;
        };

        /**
         * List of questions.
         */
        component.getQuestions = function () {
          if (component.getGender()) {
            qs = $.extend(true, {}, questions, female_questions);
          } else {
            qs = $.extend(true, {}, questions, male_questions);
          }
          return qs;
        };

        /**
         * Retrieve a question - defaults to the current question.
         */
        component.getQuestion = function (index) {
          module.log('RISK_CHECKER.MODEL attempting get question: ' + index);
          index = index || progress;
          var qs = component.getQuestions();
          if (!qs.hasOwnProperty(index)) {
            throw new RangeError('Question out of range: '+ index);
          }
          return new Question(qs[index]);
        };

        /**
         * Sets the answer to the current question.
         */
        component.setAnswer = function (answer) {
          var question = component.getQuestion();
          // Ensure we don't have answers for future questions hanging round if we've gone back.
          $.each(answers, function(q, a) {
            if (q >= question.id) {
              delete answers[q];
            }
          });
          answers[question.id] = question.getAnswer(answer).id;
        };

        /**
         * Calculates the score for the answered questions.
         */
        component.getScore = function () {
          module.log('RISK_CHECKER.MODEL calculating score.');
          var score = 0;
          $.each(answers, function (question, answer) {
            score += scores[component.getQuestion(question).getAnswer(answer).score];
          });
          return score;
        };

        /**
         * Turns a score into a risk level.
         */
        component.getRiskLevel = function () {
          var score = component.getScore(),
              last_data;

          module.log('RISK_CHECKER.MODEL calculating level.');
          $.each(risk_levels, function (i, data) {
            last_data = data;
            if (score <= data.score) {
              module.log('RISK_CHECKER.MODEL selected level ' + data.level + ' at score ' + score);
              return false;
            }
          });
          return $.extend(true, {}, last_data); // Send a copy to avoid the original being modified.s
        };

        /**
         * Gets data to be passed to the analytics.
         */
        component.getAnalytics = function () {
          if (answers.hasOwnProperty(0) && answers.hasOwnProperty(1)) {
            return 'gen_' + answers[0] + ':rl_' + component.getRiskLevel().id + ':age_' + answers[1];
          } else {
            // Don't have enough data for analytics.
            return false;
          }
        };

        /**
         * Initialise the model.
         */
        component.init = function () {
          module.log('RISK_CHECKER.MODEL initialising.');
          progress = null;
          component.setProgress(0);
        };

        /**
         * Questions common to all respondents.
         */
        var questions = {
          0: {
            "id": 0,
            "why": [
              "No identifiable personal data is collected when you complete the My RiskChecker questionnaire on this Website and your answers are completely anonymous. Channel 4 will use your answers to store information on your age bracket, gender and risk level, but this data will be anonymised and it will be impossible to identify individual respondents. This data may be used anonymously in the Embarrassing Bodies programme, website and/or social media accounts."
            ],
            "question": "Are you...",
            "answers": [
              {
                "id": 0,
                "text": "Male",
                "score": "none",
                "next": 1
              },
              {
                "id": 1,
                "text": "Female",
                "score": "none",
                "next": 1
              }
            ]
          },
          2: {
            "id": 2,
            "question": "Have you ever received a clean bill of health following an STI (sexually transmitted infection) test administered by a medical professional?",
            "why": [
              "This question is needed to determine which subsequent questions are relevant to you."
            ],
            "answers": [
              {
                "id": 0,
                "text": "Yes",
                "score": "none",
                "next": 3
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 3
              }
            ]
          }
        };


        /**
         * Questions for male respondents.
         */
        var male_questions = {
          1: {
            "id": 1,
            "question": "How old are you?",
            "why": [
              "No identifiable personal data is collected when you complete the My RiskChecker questionnaire on this Website and your answers are completely anonymous. Channel 4 will use your answers to store information on your age bracket, gender and risk level, but this data will be anonymised and it will be impossible to identify individual respondents. This data may be used anonymously in the Embarrassing Bodies programme, website and/or social media accounts."
            ],
            "answers": [
              {
                "id": 0,
                "text": "13-15",
                "score": "none",
                "next": 2
              },
              {
                "id": 1,
                "text": "16-24",
                "score": "none",
                "next": 2
              },
              {
                "id": 2,
                "text": "25-34",
                "score": "none",
                "next": 2
              },
              {
                "id": 3,
                "text": "35-44",
                "score": "none",
                "next": 2
              },
              {
                "id": 4,
                "text": "45-59",
                "score": "none",
                "next": 2
              },
              {
                "id": 5,
                "text": "Over 60",
                "score": "none",
                "next": 2
              }
            ]
          },
          3: {
            "id": 3,
            "question_checked": "Since your last clear STI test, have you had oral, vaginal or anal sexual contact with anyone?",
            "question_unchecked": "Have you had oral, vaginal or anal sexual contact with anyone?",
            "why": [
              "This question is needed to determine which subsequent questions are relevant to you."
            ],
            "answers": [
              {
                "id": 0,
                "text": "Yes",
                "score": "none",
                "next": 4
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 11
              }
            ]
          },
          4: {
            "id": 4,
            "question_checked": "Was all of the sexual contact since your last clear STI test part of a monogamous relationship, i.e. with  one exclusive partner?",
            "question_unchecked": "Was all of the sexual contact part of a monogamous relationship, i.e. with  one exclusive partner?",
            "why": [
              "Your risk of having an STI is not eliminated, but it may be reduced, if all of your sexual activity has been within a monogamous relationship."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "none",
                "next": 5
              },
              {
                "id": 1,
                "text": "No",
                "score": "medium",
                "next": 6
              }
            ]
          },
          5: {
            "id": 5,
            "question": "Is your current relationship with another man, or a woman who has previously had sex with a gay or bisexual man?",
            "why": [
              "Although many lifestyle factors affect your STI risk, incidences of certain STIs are proportionally higher among sexually active homosexual men than the overall population at large. Certain sexual practices, such as anal sex, are more conductive to the transmission of STIs than others."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "high",
                "next": 8
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 8
              }
            ]
          },
          6: {
            "id": 6,
            "question_checked": "Since your last clear STI test, have you had oral or anal sexual contact with another man?",
            "question_unchecked": "Have you had oral or anal sexual contact with another man?",
            "why": [
              "Although many lifestyle factors affect your STI risk, incidences of certain STIs are proportionally higher among sexually active homosexual men than the overall population at large. Certain sexual practices, such as anal sex, are more conductive to the transmission of STIs than others."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes, multiple men",
                "score": "high",
                "next": 7
              },
              {
                "id": 1,
                "text": "Yes, just one man",
                "score": "medium",
                "next":7
              },
              {
                "id": 2,
                "text": "No",
                "score": "none",
                "next":7
              }
            ]
          },
          7: {
            "id": 7,
            "question_checked": "Since your last clear STI test, have you had oral, anal or vaginal sexual contact with a woman?",
            "question_unchecked": "Have you had oral, anal or vaginal sexual contact with a woman?",
            "why": [
              "Knowing about your sexual activity is essential in evaluating your STI risk level."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes, multiple women",
                "score": "medium",
                "next": 8
              },
              {
                "id": 1,
                "text": "Yes, just one woman",
                "score": "low",
                "next":8
              },
              {
                "id": 2,
                "text": "No",
                "score": "none",
                "next":8
              }
            ]
          },
          8: {
            "id": 8,
            "question_checked": "Since your last clear STI test, have you always used condoms during oral, anal and vaginal sex?",
            "question_unchecked": "Have you always used condoms during oral, anal and vaginal sex?",
            "why": [
              "Knowing about your attitude towards condoms and dental dams is essential in evaluating your STI risk level."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes, when having vaginal or anal sex, but not oral sex",
                "score": "medium",
                "next": 9
              },
              {
                "id": 1,
                "text": "Yes, when having oral, vaginal or anal sex",
                "score": "none",
                "next":9
              },
              {
                "id": 2,
                "text": "No, I rarely or never use condoms",
                "score": "high",
                "next":9
              }
            ]
          },
          9: {
            "id": 9,
            "question_checked": "Since your last clear STI test, to the best of your knowledge have you had any sexual contact with a person who has been diagnosed with an STI, or was displaying STI-like symptoms? These symptoms could include:",
            "question_unchecked": "To the best of your knowledge have you had any sexual contact with a person who has been diagnosed with an STI, or was displaying STI-like symptoms? These symptoms could include:",
            "why": [
              "If you have any sexual contact with somebody with any of these symptoms or a diagnosed STI, your risk level is increased."
            ],
            "list": [
              "Discharge from the penis, anus or vagina",
              "Lumps, sores or a rash in the genital area",
              "Vaginal bleeding after sex"
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "xhigh",
                "next": 10
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 10
              }
            ]
          },
          10: {
            "id": 10,
            "question_checked": "Since your last clear STI test, to the best of your knowledge have you or anybody you've had sex with ever been a sex worker?",
            "question_unchecked": "To the best of your knowledge have you or anybody you've had sex with ever been a sex worker?",
            "why": [
              "Being a sex worker yourself or engaging in sexual contact with a sex worker is a significant factor in assessing your STI risk level."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "xhigh",
                "next": 11
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 11
              }
            ]
          },
          11: {
            "id": 11,
            "question_checked": "Since your last clear STI test, have you injected recreational drugs, or had any form of sexual contact with  somebody who has?",
            "question_unchecked": "Have you injected recreational drugs, or had any form of sexual contact with  somebody who has?",
            "why": [
              "People who have injected any kind of recreational drug are at significantly increased risk. Sharing needles with other people significantly increases your risk of being infected with an STI."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "xhigh",
                "next": 12
              },
              {
                "id": 1,
                "text": "Not sure",
                "score": "medium",
                "next": 12
              },
              {
                "id": 2,
                "text": "No",
                "score": "none",
                "next": 12
              }
            ]
          },
          12: {
            "id": 12,
            "question": "Are you currently suffering any of the following symptoms?",
            "why": [
              "Any one of these symptoms is a significant indicator that an STI may be present."
            ],
            "list": [
              "Discharge from the penis or anus",
              "Burning when passing urine",
              "Lumps or sores on the penis",
              "A genital rash"
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "xhigh",
                "next": 'end'
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 'end'
              }
            ]
          }
        };

        /**
         * Questions for female respondents.
         */
        var female_questions = {
          1: {
            "id": 1,
            "question": "How old are you?",
            "why": [
              "Totally anonymised age, gender and risk level data is being collected for possible use in Embarrassing Bodies on TV and/or online. It will be impossible to identify any individual user, or to associate any data with any particular individual. The data is being collected to help indicate trends across the UK."
            ],
            "answers": [
              {
                "id": 0,
                "text": "13-15",
                "score": "none",
                "next": 2
              },
              {
                "id": 1,
                "text": "16-24",
                "score": "none",
                "next": 2
              },
              {
                "id": 2,
                "text": "25-34",
                "score": "none",
                "next": 2
              },
              {
                "id": 3,
                "text": "35-44",
                "score": "none",
                "next": 2
              },
              {
                "id": 4,
                "text": "45-59",
                "score": "none",
                "next": 2
              },
              {
                "id": 5,
                "text": "Over 60",
                "score": "none",
                "next": 2
              }
            ]
          },
          3: {
            "id": 3,
            "question_checked": "Since your last clear STI test, have you had oral, vaginal or anal sexual contact with anyone?",
            "question_unchecked": "Have you had oral, vaginal or anal sexual contact with anyone?",
            "why": [
              "This question is needed to determine which subsequent questions are relevant to you."
            ],
            "answers": [
              {
                "id": 0,
                "text": "Yes",
                "score": "none",
                "next": 4
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 12
              }
            ]
          },
          4: {
            "id": 4,
            "question_checked": "Was all of the sexual contact since your last clear STI test part of a monogamous relationship, i.e. with one exclusive partner?",
            "question_unchecked": "Was all of the sexual contact part of a monogamous relationship, i.e. with one exclusive partner?",
            "why": [
              "Your risk of having an STI is not eliminated, but it may be reduced, if all of your sexual activity has been within a monogamous relationship."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "none",
                "next": 5
              },
              {
                "id": 1,
                "text": "No",
                "score": "medium",
                "next": 6
              }
            ]
          },
          5: {
            "id": 5,
            "question": "To the best of your knowledge, is your current relationship with a man who has previously had sex with other men, or a woman who has previously had sex with a gay or bisexual man?",
            "why": [
              "Although many lifestyle factors affect your STI risk, incidences of certain STIs are proportionally higher among sexually active homosexual men than the overall population at large. Certain sexual practices, such as anal sex, are more conductive to the transmission of STIs than others. "
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "high",
                "next": 8
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 8
              }
            ]
          },
          6: {
            "id": 6,
            "question_checked": "Since your last clear STI test, have you had unprotected (condomless) sexual contact with a gay or bisexual man?",
            "question_unchecked": "Have you had unprotected (condomless) sexual contact with a gay or bisexual man?",
            "why": [
              "Although many lifestyle factors affect your STI risk, incidences of certain STIs are proportionally higher among sexually active homosexual men than the overall population at large. Certain sexual practices, such as anal sex, are more conductive to the transmission of STIs than others. "
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "xhigh",
                "next": 7
              },
              {
                "id": 1,
                "text": "Not sure",
                "score": "medium",
                "next":7
              },
              {
                "id": 2,
                "text": "No",
                "score": "none",
                "next":7
              }
            ]
          },
          7: {
            "id": 7,
            "question_checked": "Since your last clear STI test, have you had unprotected (condomless) sexual contact with a straight man?",
            "question_unchecked": "Have you had unprotected (condomless) sexual contact with a straight man?",
            "why": [
              "Condomless sexual contact with another person may significantly affect your STI risk level."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "high",
                "next": 8
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next":8
              }
            ]
          },
          8: {
            "id": 8,
            "question_checked": "Since your last clear STI test, have you always used a condom during sexual contact with a man, or a dental dam during sexual contact with a girl?",
            "question_unchecked": "Have you always used a condom during sexual contact with a man, or a dental dam during sexual contact with a girl?",
            "why": [
              "Knowing about your attitude towards condoms and dental dams is essential in evaluating your STI risk level."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes, when having vaginal or anal sex, but not for oral sex",
                "score": "medium",
                "next": 9
              },
              {
                "id": 1,
                "text": "Yes, when having oral, vaginal or anal sex",
                "score": "none",
                "next":9
              },
              {
                "id": 2,
                "text": "No, I rarely or never use condoms or dental dams",
                "score": "high",
                "next":9
              }
            ]
          },
          9: {
            "id": 9,
            "question_checked": "Since your last clear STI test, have you had unprotected genital-on-genital or oral-on-genital sexual contact, or shared sex toys, with anybody else?",
            "question_unchecked": "Have you had unprotected genital-on-genital or oral-on-genital sexual contact, or shared sex toys, with anybody else?",
            "why": [
              "STIs can be spread through skin-to-skin contact or an exchange of bodily fluids. "
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "high",
                "next": 10
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next":10
              }
            ]
          },
          10: {
            "id": 10,
            "question_checked": "Since your last clear STI test, to the best of your knowledge have you had any sexual contact with a person who has been diagnosed with an STI, or was displaying STI-like symptoms?  These symptoms could include:",
            "question_unchecked": "To the best of your knowledge have you had any sexual contact with a person who has been diagnosed with an STI, or was displaying STI-like symptoms?  These symptoms could include:",
            "why": [
              "If you have any sexual contact with somebody with any of these symptoms or a diagnosed STI, your risk level is increased."
            ],
            "list": [
              "Discharge from the penis, anus or vagina",
              "Lumps, sores or a rash in the genital area",
              "Vaginal bleeding after sex"
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "xhigh",
                "next": 11
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next":11
              }
            ]
          },
          11: {
            "id": 11,
            "question_checked": "Since your last clear STI test, to the best of your knowledge have you or anybody you've had sex with ever been a sex worker?",
            "question_unchecked": "To the best of your knowledge have you or anybody you've had sex with ever been a sex worker?",
            "why": [
              "Being a sex worker yourself or engaging in sexual contact with a sex worker is a significant factor in assessing your STI risk level."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "xhigh",
                "next": 12
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 12
              }
            ]
          },
          12: {
            "id": 12,
            "question_checked": "Since your last clear STI test, have you injected recreational drugs, or had any form of sexual contact with somebody who has?",
            "question_unchecked": "Have you injected recreational drugs, or had any form of sexual contact with somebody who has?",
            "why": [
              "People who have injected any kind of recreational drug are at significantly increased risk. Sharing needles with other people significantly increases your risk of being infected with an STI."
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "xhigh",
                "next": 13
              },
              {
                "id": 1,
                "text": "Not sure",
                "score": "medium",
                "next": 13
              },
              {
                "id": 2,
                "text": "No",
                "score": "none",
                "next": 13
              }
            ]
          },
          13: {
            "id": 13,
            "question": "Are you currently suffering any of the following symptoms?",
            "why": [
              "Any one of these symptoms is a significant indicator that an STI may be present."
            ],
            "list": [
              "Unusual vaginal discharge",
              "Lumps or sores on the vagina",
              "Bleeding after sex",
              "Itching or discomfort of the vulva or vagina",
              "Lower abdominal or pelvic pain during sex",
              "Any kind of genital rash",
              "Bleeding between periods",
              "A burning sensation while urinating"
            ],
            "answers":  [
              {
                "id": 0,
                "text": "Yes",
                "score": "xhigh",
                "next": 'end'
              },
              {
                "id": 1,
                "text": "No",
                "score": "none",
                "next": 'end'
              }
            ]
          }
        };

        /**
         * Risk level data.
         *
         * This must be an array in increasing score order.
         */
        var risk_levels = [
          {
            "score": 9,
            "id": 0,
            "level": "Low",
            "slug": "low",
            "text": {
              "main": [
                "Based on your RiskChecker answers, it would appear that your risk of carrying a sexually transmitted infection (STI) is low. Well done on being generally responsible in your sexual behaviour. However, low risk doesn't mean no risk. It can't do any harm to get yourself along to a GUM clinic every now and then, particularly when you have a new sexual partner. You'll find details of how to locate a nearby clinic on the next screen. You can pick up some free condoms while you're there, and put them to good use. Keep practicing safe sex - after all, why dice with disease when there's no need to?",
                "Remember, always reassess your risk level when you have a new sexual partner, and make sure you're both screened for STIs.",
                "When you click the 'close test' button, all data related to your answers in the RiskChecker should delete automatically. However it's possible for your device to be set up to override these settings, so you may wish to manually clear your browsing data after use to be sure."
              ],
              "reduce_risk": [
                "Condoms, condoms and more condoms. They're literally lifesavers, and significantly reduce your risk of contracting almost every STI out there. In some cases, the risk is virtually eliminated. Use condoms for vaginal, anal AND oral sex. And in case you needed any more reasons, steer clear of injecting recreational drugs."
              ]
            }
          },
          {
            "score": 19,
            "id": 1,
            "level": "Medium",
            "slug": "medium",
            "text": {
              "main": [
                "Based on your RiskChecker answers, there's a chance you could be currently infected with an STI (sexually transmitted infection). It would be a good move to use the GUM clinic finder on the next screen, visit your local clinic and get checked out. It won't hurt but it might save you from all kinds of unpleasant STIs, some of which could cause serious long-term health problems for you and your sexual partner(s). You can pick up some free condoms while you're there, and then it's just a matter of using them - every time.",
                "While you seem to be generally responsible in your sexual behaviour, you can still do more to protect yourself. Why dice with disease when there's no need to? And remember to always reassess your risk level when you have a new sexual partner, and make sure you're both screened for STIs.",
                "When you click the 'close test' button, all data related to the RiskChecker should delete automatically from your browsing history. However it's possible for your device to be set up to override these settings, so you may wish to manually clear your browsing data after use to be sure."
              ],
              "reduce_risk": [
                "Condoms, condoms and more condoms. They're literally lifesavers, and significantly reduce your risk of contracting almost every STI out there. In some cases, the risk is virtually eliminated. Use condoms for vaginal, anal AND oral sex. And in case you needed any more reasons, steer clear of injecting recreational drugs."
              ]
            }
          },
          {
            "score": 30,
            "id": 2,
            "level": "High",
            "slug": "high",
            "text": {
              "main": [
                "Based on your RiskChecker answers, there's a strong chance you might have something unsavoury lurking in your genitals. On the next screen you can find your nearest GUM clinic, and you are strongly recommended to arrange a visit soon. Tests are quick, free and might make a huge difference to your health - and the health of your partner(s). You can pick up some free condoms while you're there, and then it’s simply about using them - every time. Often sexually transmitted infections (STIs) display no outward signs, but that doesn't mean you're not infected. Get yourself checked, and you'll really need to be more careful in future",
                  "Remember, always reassess your risk level when you have a new sexual partner, and make sure you're both screened for STIs.",
                  "When you click the 'close test' button, all data related to your answers in the RiskChecker should delete automatically. However it's possible for your device to be set up to override these settings, so you may wish to manually clear your browsing data after use to be sure."
              ],
              "reduce_risk": [
                "Condoms, condoms and more condoms. They're literally lifesavers, and significantly reduce your risk of contracting almost every STI out there. In some cases, the risk is virtually eliminated. Use condoms for vaginal, anal AND oral sex. And in case you needed any more reasons, steer clear of injecting recreational drugs."
              ]
            }
          },
          {
            "score": 100000000000000000, // Very high value.
            "id": 3,
            "slug": "xhigh",
            "level": "Very High",
            "text": {
              "main": [
                "Based on your RiskChecker answers, there's a strong chance you could currently be infected with an STI (sexually transmitted infection).  You are strongly advised to go to the next screen and use the GUM clinic finder to locate a sexual health centre near you. Remember, STIs often display no outward signs, but that doesn't mean you're not infected. By not going to get tested you're risking long-term damage to your own health, as well as the health of your sexual partner(s). Go along for a test as soon as possible, and you really need to be more careful in future. You can pick up some free condoms while you're there - make sure you use them next time!",
                "Remember, always reassess your risk level when you have a new sexual partner, and make sure you're both screened for STIs.",
                "When you click the 'close test' button, all data related to your answers in the RiskChecker should delete automatically. However it's possible for your device to be set up to override these settings, so you may wish to manually clear your browsing data after use to be sure."
              ],
              "reduce_risk": [
                "Condoms, condoms and more condoms. They're literally lifesavers, and significantly reduce your risk of contracting almost every STI out there. In some cases, the risk is virtually eliminated. Use condoms for vaginal, anal AND oral sex. And in case you needed any more reasons, steer clear of injecting recreational drugs."
              ]
            }
          }
        ];

        return component;

      }(module, submodule, submodule.MODEL || {}, $));

    return submodule;

  }(module, module.RISK_CHECKER || {}, $));

  return module;

}(window.EMBARRASSING_BODIES || {}, window.jQuery));
