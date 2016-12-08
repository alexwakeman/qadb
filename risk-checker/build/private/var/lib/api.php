<?php

$apikey = 'OYTNBXPJ';
$server = 'http://v1.syndication.nhschoices.nhs.uk';
$apipath = '/services/types/stitestingandtreatment/';
$search_range = 100; // Search range in km.

libxml_use_internal_errors(true); // Some of the NHS markup is known to cause errors - we explicitly want to swallow them.

require_once(dirname(__FILE__).'/logging.php');
require_once(dirname(__FILE__).'/cache.php');


/**
 * Get questions
 *
 * @param string $query

 *
 * @return string Data from URL.
 */
function getQuestions($query) {
	
	$url = "http://localhost:9028/search";

	
	$get = array();
	$get['searchType'] = "topK";
	$get['q'] = $query;
	


	$data = curl_get($url,$get);
	return $data;
}
/**
 * Get answer
 *
 * @param string $url to request
 * @param array $post values to send
 * @param array $options for cURL
 *
 * @return string Data from URL.
 */
function getAnswer($id) {
	
	session_write_close();
	$url = "http://localhost:9028/search";
	//$url = "http://" . $_SERVER['HTTP_HOST'] . "/search";
	
	$get = array();

	$get['docid'] = $id;
	

	

	$data = curl_get($url,$get);
	return $data;
}

/**
 * Send a POST request using cURL
 *
 * @param string $url to request
 * @param array $post values to send
 * @param array $options for cURL
 *
 * @return string Data from URL.
 */
function curl_post($url, array $post = NULL, array $options = array()) {
  global $log;
  $defaults = array(
      CURLOPT_POST => 1,
      CURLOPT_HEADER => 0,
      CURLOPT_URL => $url,
      CURLOPT_FRESH_CONNECT => 1,
      CURLOPT_RETURNTRANSFER => 1, // Return the content rather than dumping to output.
      CURLOPT_FORBID_REUSE => 1,
      CURLOPT_TIMEOUT => 100,
      CURLOPT_POSTFIELDS => http_build_query($post),
      CURLOPT_FOLLOWLOCATION => 1, // Follow redirects.
  );

  $log->log(4, "Posting data to $url");

  $ch = curl_init();
  curl_setopt_array($ch, ($options + $defaults));
  if(!$result = curl_exec($ch)) {
    $log->log(1, sprintf('Curl error from API: %s', curl_error($ch)));
    trigger_error(curl_error($ch));
  }
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if(in_array($code, array(404, 400))) {
    $result = false;
    $log->log(2, sprintf('Error code %d returned from API.', $code));
  } elseif (200 > $code or $code >= 299) {
    // Non valid response.
    $log->log(1, sprintf('Error code %d returned from API.', $code));
    error($code);
  }
  return $result;
}

/**
 * Send a GET request using cURL
 *
 * @param string $url to request
 * @param array $get values to send
 * @param array $options for cURL
 *
 * @return string Data from URL.
 */
function curl_get($url, array $get = NULL, array $options = array()) {

  global $log;
  $defaults = array(
      CURLOPT_URL => $url. (strpos($url, '?') === FALSE ? '?' : ''). http_build_query($get),
      CURLOPT_HEADER => 0,
      CURLOPT_RETURNTRANSFER => TRUE,
      CURLOPT_TIMEOUT => 10,
      CURLOPT_FOLLOWLOCATION => 1,
  );
  $log->log(4, "Getting data from $url");


  $ch = curl_init();
  curl_setopt_array($ch, ($options + $defaults));
  if(!$result = curl_exec($ch)) {
    $log->log(1, sprintf('Curl error from API: %s', curl_error($ch)));
    trigger_error(curl_error($ch));
  }
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);

  curl_close($ch);
  if(in_array($code, array(404, 400))) {
    $result = false;
    $log->log(2, sprintf('Error code %d returned from API.', $code));
  } elseif (200 > $code or $code >= 299) {
    // Non valid response.
    $log->log(1, sprintf('Error code %d returned from API.', $code));
    error($code);
  }
  return $result;
}

/**
 * Parse query string parameters out into an array.
 *
 * @param string $params List of parameters to parse.
 *
 * @return array List of param => value
 */
function parseParams($params) {
  $params  = html_entity_decode($params);
  $params  = explode('&', $params);
  $result = array();
  foreach($params as $param) {
    $param = explode('=', $param);
    $result[$param[0]] = $param[1];
  }
  return $result;
}

/**
 * Remove unwanted items from an HREF.
 *
 * @param string $href Source data to sanitise.
 *
 * @return string Sanitised data.
 */
function sanitiseHref($href) {
  global $server, $apikey, $apipath;
  $components = parse_url($href);
  $params = parseParams($components['query']);

  // Remove query string parameters.
  unset($params['apikey']);
  unset($params['range']);

  $path = $components['path'];
  // Take out the api path.
  $path = preg_replace('/' . preg_quote($apipath, '/') . '/', '', $path);

  return $path . '?' . http_build_query($params);
}

/**
 * Turn data from a list of locations from the API into an array.
 *
 * @param string $source_data HTML data to parse.
 *
 * @return array Data normalised into an array.
 */
function parseLocationList($source_data) {
  $dom_doc = new DOMDocument();
  $dom_doc->loadHTML($source_data);

  // Find the .services <ul>
  $finder = new DomXPath($dom_doc);
  $service = $finder->query("//ul[contains(concat(' ', normalize-space(@class), ' '), ' services ')]")->item(0);

  $result = array();
  foreach($service->getElementsByTagName('li') as $list_item) {
    foreach($list_item->getElementsByTagName('dl') as $clinic) {
      $data = array();

      // We need the definitions in an array we can match to the terms.
      $definitions = array();
      foreach ($clinic->getElementsByTagName('dd') as $definition) {
        $definitions[] = $definition;
      }
      // Extract the definition for the terms we want.
      foreach($clinic->getElementsByTagName('dt') as $i => $term) {
        switch ($term->textContent) {
          case 'Deliverer Name:':
            $data['name'] = $definitions[$i]->textContent;
            break;
          case 'Service Type:':
            $data['id'] = (int) sanitiseHref($definitions[$i]->getElementsByTagName('a')->item(0)->getAttribute('href'));
            break;
          case 'Distance (km):':
            $data['distance'] = round(((float) $definitions[$i]->textContent) * 5 / 8, 2); // Convert km -> miles.
            break;
        }
      }
      $result[] = $data;
    }
  }
  return $result;
}

/**
 * Turn a DOMDocument fragment back into HTML.
 *
 * @param DOMElement $dom_element Document fragment
 *
 * @return string HTML representation of fragment.
 */
function domToHtml($dom_element) {
  $tmp_dom = new DOMDocument();
  $tmp_dom->appendChild($tmp_dom->importNode($dom_element, true));
  return $tmp_dom->saveHTML();
}

/**
 * Parses a long/lat <dl> into a keyed array.
 *
 * @param DOMElement $dl Representation of <dl> containing lat/long pair.
 *
 * @return array Array keyed with lat/long.
 */
function parseLongLat($dl) {
  $data = array(
    'long' => 0,
    'lat' => 0,
  );
  $definitions = array();
  foreach ($dl->getElementsByTagName('dd') as $definition) {
    $definitions[] = $definition;
  }
  foreach($dl->getElementsByTagName('dt') as $i => $term) {
    switch ($term->textContent) {
      case 'Longitude (degrees):':
        $data['long'] = (float) $definitions[$i]->textContent;
        break;
      case 'Latitude (degrees):':
        $data['lat'] = (float) $definitions[$i]->textContent;
        break;
    }
  }
  return $data;
}


/**
 * Gets data from the API by the place name.
 *
 * Is the search function.
 *
 * @param string $place_name Search term.
 *
 * @return array List of places that match the search..
 */
function getByPlaceName($place_name) {
  global $server, $apikey, $apipath, $search_range;

  $key = sprintf('placename::%s', $place_name);
  $result = cache_get($key);

  if (!$result) {
    $options = array(
      'placeName' => $place_name,
      'range' => $search_range,
    );
    $source_data = curl_post($server . $apipath . "place?apikey=$apikey", $options);

    $result = array();
    if ($source_data) {
      $dom_doc = new DOMDocument();
      $dom_doc->loadHTML($source_data);
      $links = $dom_doc->getElementById('links')->getElementsByTagName('a');
      foreach($links as $link) {
        $result[] = array(
          'text' => $link->textContent,
          // The URL is the API URL to lookup to retrieve the list of clinics.
          'url' => urlencode(sanitiseHref($link->getAttribute('href'))),
        );
      }
    }
    cache_set($key, $result);
  }

  return $result;
}

/**
 * Get a list of clinics near a postcode.
 *
 * @param string $postcode Postcode on which to search.
 *
 * @return array List of clinics suitable for serialising.
 */
function getByPostcode($postcode) {
  global $server, $apikey, $apipath, $log, $search_range;

  $key = sprintf('postcode::%s', $postcode);
  $result = cache_get($key);

  if ($result === false) {
    $options = array(
      'postcode' => $postcode,
      'range' => $search_range,
    );
    $source_data = curl_post($server . $apipath . "postcode?apikey=$apikey", $options);

    if ($source_data) {
      $result = parseLocationList($source_data);
    } else {
      $result = array();
    }
    cache_set($key, $result);
  }
  return $result;
}

/**
 * Get a list of clinics near a known place.
 *
 * @param string $url API URL to lookup.
 *
 * @return array List of clinics suitable for serialising.
 */
function getPlaceData($url) {
  global $server, $apikey, $apipath, $search_range;

  $key = sprintf('placedata::%s', $url);
  $result = cache_get($key);

  if (!$result) {
    $options = array(
      'range' => $search_range,
      'apikey' => $apikey,
    );

    list($path, $params) = explode('?', $url);
    $path = str_replace('.', '', $path); // There will be no '.' in the path so prevent ../ traversal.

    $source_data = curl_get($server . $apipath . $path . '?'. $params, $options);

    if ($source_data) {
      $result = parseLocationList($source_data);
    } else {
      $result = array();
    }
    cache_set($key, $result);
  }
  return $result;
}

function getByLocation($lat, $long) {
  global $server, $apikey, $apipath, $search_range;

  $key = sprintf('locationdata::%s::%s', $lat, $long);
  $result = cache_get($key);

  if (!$result) {
    $options = array(
      'range' => $search_range,
      'apikey' => $apikey,
      'latitude' => $lat,
      'longitude' => $long,
    );

    $source_data = curl_get($server . $apipath . '/location', $options);

    if ($source_data) {
      $result = parseLocationList($source_data);
    } else {
      $result = array();
    }
    cache_set($key, $result);
  }
  return $result;
}

/**
 * Retrieve a clinic by its ID.
 *
 * @param integer $id Clinic ID.
 *
 * @return array Structured data in key => value pairs.
 */
function getClinic($id) {
  global $server, $apikey, $apipath;
  $id = (int) $id;

  $key = sprintf('clinic::%s', $id);
  $result = cache_get($key);

  if (!$result) {
    $options = array(
      'apikey' => $apikey,
    );

    $source_data = curl_get($server . $apipath . '/'. $id, $options);
    $result = array();
    if ($source_data) {
      $result= array(
        'name' => '',
        'address' => '',
        'original' => '',
        'website' =>  '',
        'telephone' => '',
        'gp_referral' => 'No',
        'non_core' => '',
        'location' => array('lat' => 0, 'long' => 0),
      );
      $dom_doc = new DOMDocument();
      $dom_doc->loadHTML($source_data); // Known to contain bad markup.
      $result['name'] = $dom_doc->getElementsByTagName('h2')->item(0)->textContent;

      // Find the address list
      $finder = new DomXPath($dom_doc);
      $address = $finder->query("//ul[contains(concat(' ', normalize-space(@class), ' '), ' address ')]")->item(0)->getElementsByTagName('li');
      $tmp_dom = new DOMDocument();
      foreach ($address as $line) {
        $tmp_dom->appendChild($tmp_dom->importNode($line, true));
      }
      $result['address'] = $tmp_dom->saveHTML();

      $result['original'] = $dom_doc->getElementById('original')->getAttribute('href'); // Original URL

      // The main data is stored in a <dl>
      foreach ($dom_doc->getElementsByTagName('dl') as $data) {

        // We need the definitions in an array we can match to the terms.
        $definitions = array();
        foreach ($data->getElementsByTagName('dd') as $definition) {
          $definitions[] = $definition;
        }
        // Extract the definition for the terms we want.
        foreach($data->getElementsByTagName('dt') as $i => $term) {
          switch ($term->textContent) {
            case 'Website URL:':
              $result['website'] = domToHtml($definitions[$i]->getElementsByTagName('a')->item(0));
              break;
            case 'Telephone:':
              $result['telephone'] = $definitions[$i]->textContent;
              break;
            case 'Gp referral Required:':
              $referral = 'No';
              if (strtolower($definitions[$i]->textContent) === 'true') {
                $referral = 'Yes';
              }
              $result['gp_referral'] = $referral;
              break;
            case 'GenericSDNonCoreElements':
              $result['non_core'] = domToHtml($definitions[$i]->getElementsByTagName('dl')->item(0));
              break;
            case 'Geographic coordinates:':
              $result['location'] = parseLongLat($definitions[$i]->getElementsByTagName('dl')->item(0));
              break;
          }
        }
      }
    }
    cache_set($key, $result);
  }
  return $result;
}

