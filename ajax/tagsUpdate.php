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

$op = filter_input(INPUT_POST, 'op', FILTER_SANITIZE_STRING);
$rawFileID = filter_input(INPUT_POST, 'fileID', FILTER_SANITIZE_URL);
$tagID = filter_input(INPUT_POST, 'tagID', FILTER_SANITIZE_NUMBER_INT);

$fileIDs = json_decode($rawFileID);

switch($op) {
    case 'add': {
        if(is_array($fileIDs)) {
            $result = \OCA\ownTags\hTags::addTagForFiles($fileIDs, $tagID);
        } else {
            $result = \OCA\ownTags\hTags::addTagForFile($fileIDs, $tagID);
        }
        
        break;
    }
    
    case 'remove': {
        if(is_array($fileIDs)) {
            $result = \OCA\ownTags\hTags::removeTagForFiles($fileIDs, $tagID);
        } else {
            $result = \OCA\ownTags\hTags::removeTagForFile($fileIDs, $tagID);
        }
        break;
    }
}

$resul=array('result'=>$result);
echo json_encode($resul);
die($result);