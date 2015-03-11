<?php
/*
 * Copyright 2014 by Francesco PIRANEO G. (fpiraneo@gmail.com)
 * 
 * This file is part of oclife.
 * 
 * oclife is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * oclife is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with oclife.  If not, see <http://www.gnu.org/licenses/>.
 */
\OCP\JSON::callCheck();
\OCP\JSON::checkLoggedIn();
\OCP\JSON::checkAppEnabled('oclife');

$l = new \OC_L10N('oclife');
$ctags = new \OCA\oclife\hTags();

$JSONtags = filter_input(INPUT_POST, 'tags', FILTER_SANITIZE_URL);
$listgrid = filter_input(INPUT_POST, 'listgrid', FILTER_SANITIZE_URL);

// Look for selected tag and child
$tags = json_decode($JSONtags);
$tagsToSearch = array();

foreach($tags as $tag) {    
    $tagID = intval($tag->key);
    $tagsToSearch[] = intval($tagID);
}

// Look for files with that tag
$filesIDs = \OCA\oclife\hTags::getFileWithTagArray($tagsToSearch);
$fileData = \OCA\oclife\utilities::getFileInfoFromID(OCP\User::getUser(), $filesIDs);

$result = '';
if($listgrid=="false") {
foreach($fileData as $file) {
    $result .= \OCA\oclife\utilities::prepareTile($file);
}
}
else {
     $result = '<table class="CSSTableGenerator">';
     $result.='<tr><td style="text-align:left";>'.$l->t('File name').'</td><td colspan="3">'.$l->t('Actions').'</td><td>'.$l->t('Size').'</td><td>'.$l->t('When added').'</td></tr>';
     foreach($fileData as $file) {
    $result .= \OCA\oclife\utilities::prepareTile1($file);
}
    $result.='</table>';
}

echo $result;