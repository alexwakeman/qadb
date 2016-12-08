<?php

$settings = array(
  'logging' => array( // Logging settings.
    'level' => 1, // 0 => None, 1 => Error, 2 => Warn, 3 => Notice, 4 => Debug (Debug will produce A LOT of output.
    'location' => dirname(__FILE__).'/../var/log', // Base directory for log files - no trailing /
    'filename_base' => 'eb-risk-checker', // Base filename for log files
  ),
);

/**
 * Abstraction class for logging.
 */
class Logging {
  /**
   * @var $filename {string} Name of log file on system.
   */
  protected $filename;
  /**
   * @var $level {integer} Maximum level of error to log.
   */
  protected $level;
  /**
   * @var $levels {array} Error level ID => Name mapping.
   */
  protected $levels = array(
    0 => 'NONE',
    1 => 'ERROR',
    2 => 'WARN',
    3 => 'NOTICE',
    4 => 'DEBUG',
  );

  public function __construct() {
    global $settings;
    $this->level = $settings['logging']['level'];
    if ($this->level) {
      $this->filename = sprintf('%s/%s_%s.log', $settings['logging']['location'], $settings['logging']['filename_base'], date('Y-m-d'));
      if (!file_exists($this->filename)) {
        // If the log file doesn't exist we need to create it and set permissions.
        touch($this->filename);
        chmod($this->filename, 0666);
      }
    }
  }

  /**
   * Logs an error.
   *
   * @param $level {integer} Level of error to be logged.
   * @param $message {string} Error message.
   */
  public function log($level, $message) {
    if ($level <= $this->level) {
      $message = sprintf("[%s] %s \"%s\"\n", date('Y-m-d H:i:s'), $this->levels[$level], $message);
      error_log($message, 3, $this->filename);
    }
  }
}

// Expose a global object that can be used as a log handler.
$log = new Logging();
