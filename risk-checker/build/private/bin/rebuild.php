<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Bring in the new header and footer.
ob_start(); // Swallow output.
#require dirname(__FILE__).'/c4-templates.php';
$output = ob_get_clean();

// Working directories.
$src = dirname(__FILE__).'/../src/html';
$dest = dirname(__FILE__).'/../../public';

// Source files.
$files = glob($src.'/*.php');


foreach ($files as $filepath) {
  // Reset the variables used for the menu otherwise we have a scope clash.
  $res_clinc = false;
  $res_sti = false;
  $res_videos = false;

  // Get the filename out of the path.
  preg_match('/.*\/(.*)\.php$/', $filepath, $matches);
  $filename = $matches[1];

  // Get the content of the build pages and output it as static HTML
  ob_start();
  require $filepath;
  $output = ob_get_clean();
  file_put_contents($dest.'/'.$filename.'.html', $output);
}

echo 'PHP build of HTML complete'

?>