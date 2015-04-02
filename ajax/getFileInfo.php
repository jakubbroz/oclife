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
// Check if app enabled and user logged in
\OCP\JSON::checkAppEnabled('oclife');
\OCP\User::checkLoggedIn();

// Handle translations
$l = new \OC_L10N('oclife');

// Revert parameters from ajax
$filePath = filter_input(INPUT_POST, 'filePath', FILTER_SANITIZE_STRING);

// Check if multiple file has been choosen
if(substr($filePath, -1) === '/') {
    $thumbPath = OCP\Util::linkToAbsolute('oclife', 'getThumbnail.php', array('filePath' => $filePath));
    
    $preview = '<img style="border: 1px solid black;width:200px;height:200px; display: block;" src="' . $thumbPath . '" />';
    
    $infos = '<strong>' . $l->t('Multiple files selected') . '</strong>';

    $result = array('preview' => $preview, 'infos' => $infos, 'fileid' => -1);

    print json_encode($result);
    die();
}

// Begin to collect files informations
/*
 *  $fileInfos contains:
 * Array ( [fileid] => 30 
 * [storage] => home::qsecofr 
 * [path] => files/Immagini/HungryIla.png 
 * [parent] => 18 
 * [name] => HungryIla.png 
 * [mimetype] => image/png 
 * [mimepart] => image 
 * [size] => 3981786 
 * [mtime] => 1388521137 
 * [storage_mtime] => 1388521137 
 * [encrypted] => 1 
 * [unencrypted_size] => 3981786 
 * [etag] => 52c326b169ba4
 * [permissions] => 27 ) 
 */
$fileInfos = \OC\Files\Filesystem::getFileInfo($filePath);

$exts = preg_split("/[\.]/", $fileInfos['name']);
$n    = count($exts)-1;
$ext  = strtolower($exts[$n]);

if(strcmp($ext,"pdf")==0) {              
    $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/PDFLogo.jpg');
}
else if(strcmp($ext,"xls")==0 || strcmp($ext,"xlsx")==0) {
   $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/xls.png');}
else if(strcmp($ext,"mp3")==0 || strcmp($ext,"audio")==0 || strcmp($ext,"wav")==0 || strcmp($ext,"aac")==0 || strcmp($ext,"wma")==0){
   $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/music.jpg'); 
}
else if(strcmp($ext,"odt")==0 || strcmp($ext,"doc")==0 || strcmp($ext,"docx")==0 || strcmp($ext,"srt")==0 || strcmp($ext,"txt")==0 || strcmp($ext,"asa")==0 || strcmp($ext,"rtf")==0) {
    $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/text.png');
}
else if(strcmp($ext,"mp4")==0 || strcmp($ext,"avi")==0 || strcmp($ext,"flv")==0 || strcmp($ext,"mpeg")==0 || strcmp($ext,"m4v")==0 || strcmp($ext,"mkv")==0) {
    $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/video.png');
}
else if(strcmp($ext,"ppt")==0 || strcmp($ext,"pptx")==0)  {
        $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/presentacion.jpg');
}
else if(strcmp($ext,"zip")==0 || strcmp($ext,"7z")==0 || strcmp($ext,"rar")==0 || strcmp($ext,"tar.gz")==0 || strcmp($ext,"tar")==0) {
        $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/zip.jpg');
}
else {
$thumbPath = \OCP\Util::linkToAbsolute('oclife', 'getThumbnail.php', array('filePath' => $filePath));
}

$preview = '<img style="border: 1px solid black;width:200px;height:200px; display: block;" src="' . $thumbPath . '" />';

$infos = array();
$infos[] = '<strong>' . $l->t('File name') . ': </strong>' . $fileInfos['name'];
$infos[] = '<strong>MIME: </strong>' . $fileInfos['mimetype'];
$infos[] = '<strong>' . $l->t('Size') . ': </strong>' . \OCA\oclife\utilities::formatBytes($fileInfos['size'], 2, TRUE);
$infos[] = '<strong>' . $l->t('When added') . ': </strong>' . \OCP\Util::formatDate($fileInfos['storage_mtime']);
$infos[] = '<strong>' . $l->t('Encrypted? ') . '</strong>' . (($fileInfos['encrypted'] === TRUE) ? $l->t('Yes') : $l->t('No'));

if($fileInfos['encrypted']) {
    $infos[] = '<strong>' . $l->t('Unencrypted size') . ': </strong>' . \OCA\oclife\utilities::formatBytes($fileInfos['unencrypted_size'], 2, TRUE);
}

// Output basic infos
$htmlInfos = implode('<br />', $infos);

// Check for EXIF data
// Get current user
$user = \OCP\User::getUser();
$viewPath = '/' . $user . '/files';
$view = new \OC\Files\View($viewPath);
$imageLocalPath = $view->getLocalFile($filePath);

$exifHandler = new OCA\oclife\exifHandler($imageLocalPath);
$allInfos = $exifHandler->getExifData();
$ifd0Infos = isset($allInfos['IFD0']) ? $allInfos['IFD0'] : array();
$exifInfos = isset($allInfos['EXIF']) ? $allInfos['EXIF'] : array();

$fullInfoArray = array_merge($ifd0Infos, $exifInfos);

if(is_array($fullInfoArray)) {
    $extInfoText = OCA\oclife\utilities::glueArrayHTML($fullInfoArray);
} else {
    $extInfoText = '';
}
$result = array('preview' => $preview, 'infos' => $htmlInfos, 'exif' => $extInfoText, 'fileid' => $fileInfos['fileid']);

print json_encode($result);
