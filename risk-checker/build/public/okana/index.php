<?php

header('Content-type: application/json');

require_once(dirname(__FILE__).'/../../private/lib/api.php');

/**
 * Handles returning an HTTP error code and exiting.
 *
 * @param $code {integer} HTTP error code
 */
function error($code) {
  $code = (int) $code;
  switch ($code) {
    case 400:
      $description = 'Bad Request';
      break;
    case 404:
      $description = 'Not Found';
      break;
    case 405:
      $description = 'Method Not Allowed';
      break;
    default:
      $description = 'Server Error';
  }
  header("HTTP/1.1 $code $description");
  exit();
}


/**
 * Handles PHP errors "gracefully".
 */
function shutdown_handler() {
  if (count(error_get_last())) {
    //error(500);
  }
}
register_shutdown_function('shutdown_handler');


if (isset($_GET['q'])) {
  $data = getQuestions($_GET['q']);
}
if (isset($_GET['id'])) {
  $data = getAnswer($_GET['id']);
}


if (!isset($data)) {
  error(400);
}

echo $data;