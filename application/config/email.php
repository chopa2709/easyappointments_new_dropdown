<?php defined('BASEPATH') or exit('No direct script access allowed');

// Add custom values by settings them to the $config array.
// Example: $config['smtp_host'] = 'smtp.gmail.com';
// @link https://codeigniter.com/user_guide/libraries/email.html

$config['useragent'] = 'Easy!Appointments';
$config['protocol']  = 'smtp';
$config['mailtype']  = 'html';

$config['smtp_host']   = 'eoslab.sakura.ne.jp';
$config['smtp_user']   = 'santasara_info@mail.eos-lab.net';
$config['smtp_pass']   = 'Onsenroot400';
$config['smtp_crypto'] = 'tls';
$config['smtp_port']   = 587;
$config['smtp_auth']   = TRUE;

$config['crlf']    = "\r\n";
$config['newline'] = "\r\n";
$config['charset'] = 'utf-8';
