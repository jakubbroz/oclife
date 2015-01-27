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
\OCP\JSON::checkLoggedIn();

$tagID = filter_input(INPUT_POST, 'tagID', FILTER_SANITIZE_NUMBER_INT);
$priviledge = filter_input(INPUT_POST, 'setPriviledge', FILTER_SANITIZE_STRING);
$tagOwnerToSet = filter_input(INPUT_POST, 'tagOwner', FILTER_SANITIZE_STRING);

// At least tagID and the priviledge or the owner has to be set to perform a valid operation
if(!isset($tagID) || (!isset($priviledge) && !isset($tagOwnerToSet))) {
    $result = json_encode(array('result'=>'KO'));
    die($result);
}


$ctags = new \OCA\ownTags\hTags();
$user = \OCP\User::getUser();
$tagOwner = $ctags->getTagOwner($tagID);

if(isset($tagOwnerToSet)) {
    if((!OC_User::isAdminUser(OC_User::getUser()) && !$user === $tagOwner)) {
    $result = json_encode(array('result'=>'NOTALLOWED', 'newpriviledges' => '', 'newowner' => ''));
    die($result);

}
}





if($ctags->writeAllowed($tagID, $user) || $user === $tagOwner) {
    if(isset($priviledge)) {
        // Set priviledges
        $newPriviledges = $ctags->setTagPermission($tagID, $priviledge);
        $newOwner = '';
    } else {
        // Set owner
        $newOwner = $ctags->setTagOwner($tagID, $tagOwnerToSet);
        $newPriviledges = '';
    }

    $result = json_encode(array('result'=>'OK', 'newpriviledges' => $newPriviledges, 'newowner' => $newOwner));    
} else {
    $result = json_encode(array('result'=>'NOTALLOWED', 'newpriviledges' => '', 'newowner' => ''));
}

echo $result;