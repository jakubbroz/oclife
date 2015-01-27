<?php
/*
 * Copyright 2014 by Francesco PIRANEO G. (fpiraneo@gmail.com)
 * 
 * This file is part of ownTags.
 * 
 * ownTags is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * ownTags is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with ownTags.  If not, see <http://www.gnu.org/licenses/>.
 */
\OCP\JSON::callCheck();
\OCP\JSON::checkLoggedIn();
\OCP\JSON::checkAppEnabled('ownTags');

$rawFilesData = filter_input(INPUT_POST, 'id', FILTER_SANITIZE_URL);
$filesData = json_decode($rawFilesData);

if(is_array($filesData)) {
    $tagCodes = \OCA\ownTags\hTags::getCommonTagsForFiles($filesData);
} else {
    $tagCodes = \OCA\ownTags\hTags::getAllTagsForFile($filesData);
}

$tags = new \OCA\ownTags\hTags();

$result = array();
foreach($tagCodes as $tagID) {
    $tagData = $tags->searchTagFromID($tagID);
    $result[] = new \OCA\ownTags\tag($tagID, $tagData['xx']);
}

$jsonTagData = json_encode((array) $result);
echo $jsonTagData;