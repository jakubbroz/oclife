<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

\OCP\JSON::callCheck();
\OCP\JSON::checkLoggedIn();
\OCP\JSON::checkAppEnabled('oclife');

$rawFilesData = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_URL);
$filesData = json_decode($rawFilesData);

$result = \OCA\oclife\hTags::getTagsForFiles($filesData);

$jsonTagData = json_encode((array) $result);
echo $jsonTagData;

