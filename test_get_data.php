<?php
// test_get_data.php
ob_start();
require_once 'backend/api/get_data.php';
$output = ob_get_clean();
echo $output;
?>