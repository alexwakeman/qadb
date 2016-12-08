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
    error(500);
  }
}
register_shutdown_function('shutdown_handler');


if (isset($_GET['search'])) {
  $data = getByPlaceName($_GET['search']);
}
if (isset($_GET['postcode'])) {
  $data = getByPostcode($_GET['postcode']);
}
if (isset($_GET['place'])) {
  $data = getPlaceData(urldecode($_GET['place']));
}
if (isset($_GET['lat']) and isset($_GET['long'])) {
  $data = getByLocation($_GET['lat'], $_GET['long']);
}
if (isset($_GET['clinic'])) {
  $data = getClinic($_GET['clinic']);
}

if (!isset($data)) {
  error(400);
}

print(json_encode($data));

