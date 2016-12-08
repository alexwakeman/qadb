<?php

$cache_location = dirname(__FILE__).'/../var/cache';
$cache_prefix = 'nhs-api';
$cache_lifetime = 60 * 60 * 24 * 2; // Two days

function _get_filename($key) {
  global $cache_location, $cache_prefix;
  $key = sprintf('%s--%s', $cache_prefix, md5($key));
  return sprintf('%s/%s', $cache_location, $key);
}

function cache_get($key) {
  global $cache_lifetime, $log;
  $value = false;
  $filename = _get_filename($key);
  if (file_exists($filename)) {
    $cached = file_get_contents($filename);
    if ($cached) {
      $data = unserialize($cached);
      if (time() < $data['expiry']) {
        // Data is still within lifetime.
        $value = $data['data'];
        $log->log(4, "Retrieved data for $key from cache");
        //$log->log(4, sprintf("data was: %s", var_export($data, true)));
      } else {
        // Data has expired.
        $log->log(4, "Expiring $key from cache");
        unlink($filename); // Remove the cache item.
      }
    }
  }
  return $value;
}

function cache_set($key, $data, $ttl = null) {
  global $cache_lifetime, $log;
  if ($ttl === null) {
    $ttl = $cache_lifetime;
  }
  $filename = _get_filename($key);
  $data = array(
    'data' => $data,
    'expiry' => time() + $cache_lifetime,
  );
  if (file_put_contents($filename, serialize($data))) {
    $log->log(4, "Set data for $key into cache");
    return $data;
  }
}
