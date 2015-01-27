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
\OCP\JSON::checkAppEnabled('ownTags');
\OCP\User::checkLoggedIn();

// Check for a valid operation to perform
$tagOp = filter_input(INPUT_POST, 'tagOp', FILTER_SANITIZE_STRING);
$validOps = array('new', 'rename', 'delete', 'info');

if(array_search($tagOp, $validOps) === FALSE) {
    $result = array(
        'result' => 'KO',
        'title' => '',
        'key' => ''
    );
    
    die(json_encode($result));
}

// Check for valid input parameters
$parentID = intval(filter_input(INPUT_POST, 'parentID', FILTER_SANITIZE_NUMBER_INT));
$tagID = filter_input(INPUT_POST, 'tagID', FILTER_SANITIZE_NUMBER_INT);
$tagName = filter_input(INPUT_POST, 'tagName', FILTER_SANITIZE_STRING);
$tagLang = filter_input(INPUT_POST, 'tagLang', FILTER_SANITIZE_STRING);

if($parentID === FALSE || $tagName === FALSE || strlen($tagLang) === 0 || strlen($tagLang) > 2) {
    $result = array(
        'result' => 'KO',
        'title' => '',
        'key' => ''
    );
    
    die(json_encode($result));
}

// For write operations check if tag can be written
if($tagOp == 'rename' || $tagOp == 'delete') {
	if(!\OCA\ownTags\hTags::writeAllowed($tagID)) {
		$result = array(
			'result' => 'NOTALLOWED',
			'title' => '',
			'key' => $tagID
		);

		die(json_encode($result));
	}
}

// Tag handler instance
$ctags = new \OCA\ownTags\hTags();

// Switch between possible operations
switch($tagOp) {
    case 'new': {
        $tagID = $ctags->newTag($tagLang, $tagName, $parentID);
        if(is_numeric($tagID)) {
        $permission = $ctags->getTagPermission($tagID);
        $result = TRUE;
        }
        else {
            $result1=$tagID;
            $result=FALSE;
        }
        break;
    }
    
    case 'rename': {
        $tagData = array($tagLang => $tagName);
        
        $ctags1 = new \OCA\ownTags\hTags();
        $tagData1 = $ctags1->getAllTags('xx');
        $searchKey = $tagName;
        $cvrc=0;
        $result1 = 0;

        foreach($tagData1 as $tag) {
            if($tag['tagid'] !== '-1') {       
                if(strcmp(strtolower($tag['descr']), strtolower($searchKey))== 0) {
                    $result1= $tag['descr'];
                    $cvrc=1;
                    break;
                    }         
                }
            }
        
        if($cvrc == 1) {
            $result= FALSE;
            break;
        }
        
        
        $result = $ctags->alterTag($tagID, $tagData);
        $permission = $ctags->getTagPermission($tagID);
        
        break;
    }
    
    case 'delete': {
        $result = $ctags->deleteTagAndChilds(intval($tagID));
        $permission = '';
        $owner = '';
        
        break;
    }
    
    case 'info': {
        $tagData = $ctags->getTagData($tagID);

        if($tagData !== FALSE) {
            $tagName = $tagData['title'];
            $owner = $ctags->getTagOwner($tagID);
            $permission = $ctags->getTagPermission($tagID);
            $result = TRUE;
        } else {
            $result = FALSE;
        }
        
        break;
    }    
}

// Publish the op result
if($result === FALSE) {
    $result = array(
        'result' => 'KO',
        'title' => $result1,
        'key' => ''
    );
} else {
    $result = array(
        'result' => 'OK',
        'title' => $tagName,
        'key' => $tagID,
        'owner' => $owner,
        'permission' => $permission
    );
}

echo json_encode($result);
