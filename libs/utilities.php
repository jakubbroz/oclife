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

namespace OCA\oclife;




class utilities {
    
   
    /**
     * Format a file size in human readable form
     * @param integer $bytes File size in bytes
     * @param integer $precision Decimal digits (default: 2)
     * @return string
     */
    public static function formatBytes($bytes, $precision = 2, $addOriginal = FALSE) { 
        $units = array('B', 'KB', 'MB', 'GB', 'TB'); 

        $dimension = max($bytes, 0); 
        $pow = floor(($dimension ? log($bytes) : 0) / log(1024)); 
        $pow = min($pow, count($units) - 1); 

        $dimension /= pow(1024, $pow);

        $result = round($dimension, $precision) . ' ' . $units[$pow];
        
       // if($addOriginal === TRUE) {
        //    $result .= sprintf(" (%s bytes)", number_format($bytes));
        //}
        
        return $result;
    }
    
    /**
     * Remove thumbnails and db entries for deleted files
     * @param array $params All parameters passed by hook
     */
    public static function cleanupForDelete($params) {
        // Get full thumbnail path
        $path = $params['path'];
        \OCA\oclife\utilities::deleteThumb($path);

        // Now remove all entry in DB for this file
        // -- Verificare che qui esista l'entry del file nel DB!!! :-///
        $fileInfos = \OC\Files\Filesystem::getFileInfo($path);
        if($fileInfos['fileid']) {
            $result = \OCA\oclife\hTags::removeAllTagsForFile($fileInfos['fileid']);
        }
        return $result;
    }
    
    /**
     * Rename thumbnail after file rename
     * @param array $params All parameters passed by hook
     */
    public static function cleanupForRename($params) {
        $oldPath = $params['oldpath'];
        \OCA\oclife\utilities::deleteThumb($oldPath);
        return TRUE;
    }

    /**
     * Delete thumb from filesystem if exists
     * @param string $thumbPath
     */
    private static function deleteThumb($thumbPath) {
        // Get full thumbnail path
        $fileInfo = pathinfo($thumbPath);
        $user = \OCP\USER::getUser();
        $previewDir = \OC_User::getHome($user) . '/oclife/previews/' . $user;
        $fullThumbPath = $previewDir . $fileInfo['dirname'] . '/' . $fileInfo['filename'] . '.png';
        
        // If thumbnail exists remove it
        if(file_exists($fullThumbPath)) {
            unlink($fullThumbPath);
        }        
    }
        
    /**
    * Get all files ID of the indicated user
    * TODO: Check if this function gives back only the files the user can access.
    * @param string $user Username
    * @param string $path Path to get the content
    * @param boolean $onlyID Get only the ID of files
    * @param boolean $indexed Output result as dictionary array with fileID as index
    * @return array ID of all the files
    */
    public static function getFileList($user, $path = '') {
        $oc_version = $_SESSION['OC_Version'][0];
        
        if($oc_version === 7) {
            $myres = \OCA\oclife\utilities::getOC7FileList($user, $path);
            return $myres;
        } else {
            return \OCA\oclife\utilities::getOC6FileList($user, $path);            
        }
    }
    
    private static function getOC6FileList($user, $path) {
        $result = array();

        $memcached=new \Memcache();
        $memcached->addServer('localhost', 11211);
        
        $dirView = new \OC\Files\View('/' . $user);
        $dirContent = $dirView->getDirectoryContent($path);
        
        foreach($dirContent as $item) {
            $itemRes = array();
            
            if(strpos($item['mimetype'], 'directory') === FALSE) {
                $fileData = array('fileid'=>$item['fileid'], 'name'=>$item['name'], 'mimetype'=>$item['mimetype']);
                $fileData['path'] = isset($item['usersPath']) ? $item['usersPath'] : $item['path'];
                        
                $itemRes[] = $fileData;
            } else {
                // Case by case build appropriate path
                if(isset($item['usersPath'])) {
                    // - this condition when usersPath is set - i.e. Shared files
                    $itemPath = $item['usersPath'];
                } elseif(isset($item['path'])) {
                    // - Standard case - Normal user's folder
                    $itemPath = $item['path'];
                } else {
                    // - Special folders - i.e. sharings
                    $itemPath = 'files/' . $item['name'];
                }

                $itemRes = \OCA\oclife\utilities::getOC6FileList($user, $itemPath);
            }            
            
            foreach($itemRes as $item) {              
                 $memcached->set(intval($item['fileid']), $item);  
            }
        }

        return $result;        
    }

    public static function getOC7FileList($user, $path) {
        $dirView = new \OC\Files\View('/' . $user);
        $dirContent = $dirView->getDirectoryContent($path);
        
        $memcached=new \Memcache();
        $memcached->addServer('localhost', 11211);
        
        foreach($dirContent as $item) {
            $fileID = $item->getId();
            $fileMime = $item->getMimetype();
            $fileName = $item->getName();
            $fileDate=$item->getMTime();
            $fileSize= $item->getSize();
            $filePath = substr($item->getPath(), strlen($user) + 2);
            
            $itemRes = array();
            
            if(strpos($fileMime, 'directory') === FALSE) {
                $fileData = array(
                    'fileid' => $fileID,
                    'name' => $fileName,
                    'mimetype' => $fileMime,
                    'size'=> $fileSize,
                    'date'=>$fileDate,
                    'path' => $filePath
                );
                        
                $itemRes[] = $fileData;
            } else {
                $itemRes = \OCA\oclife\utilities::getOC7FileList($user, $filePath);
            }            
            
            foreach($itemRes as $item) {               
                 $memcached->set(intval($item['fileid']), $item);   
                }
            }
        }
    
    
    public static function clearMemcache(){
        $memcashed=new \Memcache();
        $memcashed->connect('localhost');
        $memcashed->flush();
        $memcashed->close();
    }
    
    /**
     * Return the files info (id, name and path) for a given file(s) id
     * @param string $user Username
     * @param array $filesID IDs of the file to look at
     * @return array Associative array with required infos
     */
    
    public static function getFileInfoFromID($user, $filesID) {
        if(!is_array($filesID)) {
            return -1;
        }
       
        if($usersFile === -1) {
            return -2;
        }
        
        // Loop through the provided file ID and return all result
        $result = array();
        
        $memcashed=new \Memcache();
        $memcashed->connect('localhost');
        
        
        foreach($filesID as $fileID) {
            if(($a=$memcashed->get($fileID))!='') {
                $result[$fileID] = $a;
            }
        }
        
        return $result;
    }
    
    
    
    /**
     * Prepare an image tile
     * @param array $fileData File data with this structure: array('id'=>'', 'path'=>'', 'name'=>'')
     * @return string
     */
    public static function prepareTile($fileData) {
        
        $pathInfo = substr(pathinfo($fileData['path'], PATHINFO_DIRNAME), 6);
        $filePath = strpos($fileData['path'], 'files') === FALSE ? $fileData['path'] : substr($fileData['path'], 5);
        
        $result = '<div class="oclife_tile" data-fileid="' . $fileData['fileid'] . '" data-filePath="' . $pathInfo . '" data-fullPath="' . $filePath . '">';
        $result .= '<div class="oclife_ime">' . $fileData['name'] . '</div>';
        
        $exts = preg_split("/[\.]/", $fileData['name']);
        $n    = count($exts)-1;
        $ext  =strtolower($exts[$n]);
             

             if(strcmp($ext,"pdf")==0) {              
                  $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/PDFLogo.jpg');
            }
            else if(strcmp($ext,"xls")==0 || strcmp($ext,"xlsx")==0) {
               $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/xls.png');}
            else if(strcmp($ext,"mp3")==0 || strcmp($ext,"audio")==0 || strcmp($ext,"wav")==0 || strcmp($ext,"aac")==0 || strcmp($ext,"wma")==0){
               $thumbPath=  \OCP\Util::linkToAbsolute('/apps/oclife', '/img/music.jpg'); 
            }
            else if(strcmp($ext,"odt")==0 || strcmp($ext,"doc")==0 || strcmp($ext,"docx")==0 || strcmp($ext,"srt")==0 || strcmp($ext,"txt")==0 || strcmp($ext,"asa")==0) {
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
        
        
        $result .= '<img src="' . $thumbPath . '" />';
        $result .= '</div>';
        
        return $result;
    }
    
    public static function prepareTile1($fileData) {
       
        $name=$fileData['name'];
        $size=\OCA\oclife\utilities::formatBytes($fileData['size'], 2, TRUE);
        $date=date('d/m/Y H:i:s', strtotime('+1 hours', $fileData['date']));
        
         
        $pathInfo = substr(pathinfo($fileData['path'], PATHINFO_DIRNAME), 6);
        $filePath = strpos($fileData['path'], 'files') === FALSE ? $fileData['path'] : substr($fileData['path'], 5);
        
                
        $result="<tr filepath='".$filePath."' fileid='".$fileData['fileid']."'><td>".$name."</td>";
       
        $exts = preg_split("/[\.]/", $fileData['name']);
        $n    = count($exts)-1;
        $extension  =strtolower($exts[$n]);
         $l = new \OC_L10N('oclife');
        if($extension=="jpg" || $extension=="jpeg" || $extension=="png" || $extension=="tiff" || $extension=="pdf") {              
        
            $result.="<td id='download'><button id='sivo'>".$l->t('Download')."</button></td><td id='preview'><button id='sivo'>".$l->t('Preview')."</button></td><td id='delete'><button id='sivo'>".$l->t('Delete tag')."</button></td>";
        }    
        else {
            $result.="<td id='download'><button id='sivo'>".$l->t('Download')."</button></td><td></td><td id='delete'><button id='sivo'>".$l->t('Delete tag')."</button></td>";
        }

       
       
       
        $result.="<td id='kraj'>".$size."</td><td id='kraj'>".$date."</td></tr>";
        return $result;
         
        
    
            
    }
    /**
     * Glue an array with key and value on an html table
     * @param Array $myArray
     * @param String $tableClass String class used for the table
     * @param String $keyColClass String class used for the key column
     */
    public static function glueArrayHTML($myArray, $tableClass=NULL, $keyColClass=NULL) {
        // Check if is an array
        if(!is_array($myArray)) {
            return FALSE;
        }
        
        // Loop through array elements and build result
        $result = is_null($tableClass) ? "<table>\n" : sprintf("<table class=\"%s\">\n", $tableClass);

        foreach($myArray as $key => $value) {
	        if (($key <> 'MakerNote') && (strpos($key, 'UndefinedTag') === false)) {
                $keyColClassOut = is_null($keyColClass) ? '' : sprintf(" class=\"%s\"", $keyColClass);
                $line = sprintf("<tr><td%s>%s</td><td>%s</td></tr>\n", $keyColClassOut, trim($key), trim($value));
                $result .= $line;
	        }
        }
        
        $result .= "</table>\n";
        
        return $result;
    }
    
    /**
     * Get all users belonging to the same group(s) as the indicated user
     * @param String $user The user asking for his/her group(s) companions
     * @return Array All users belonging on the same group as indicated user
     */
    public static function getGroupCompanion($user) {
        if(trim($user) === '') {
            return FALSE;
        }

        $sql = 'SELECT `uid` FROM `*PREFIX*group_user` WHERE `gid` IN ( SELECT `gid` FROM *PREFIX*group_user WHERE `uid`=?) GROUP BY `uid`';
        $args = array($user);

        $query = \OCP\DB::prepare($sql);
        $resRsrc = $query->execute($args);

        $result = array();

        while($row = $resRsrc->fetchRow()) {
            $result[] = $row['uid'];
        }

        return $result;
    }

    /**
     * Get all users in the indicated group
     * @param String $group Group to get the users; if empty or NULL returns all users
     * @param String $withDisplayName Get also display name if set to TRUE
     * @return Array All users belonging to indicated group
     */
    public static function getUsers($user = NULL, $withDisplayName = FALSE) {
        if(trim($group) === '' || $group === NULL) {
            $sql = 'SELECT `uid`, `displayname` FROM `*PREFIX*users` ORDER BY `displayname`';
            $query = \OCP\DB::prepare($sql);
            $resRsrc = $query->execute();
        } else {
            $gsql='Select `gid` from `*PREFIX*users` WHERE `uid`=?';
            $query= \OCP\DB::prepare($sql); 
            $resRsrc = $query->execute($user);
            $group=array();
            while($row = $resRsrc->fetchRow()) {
                $group[]=$row['gid'];
            }
            
            $sql = 'SELECT `uid`, `displayname` FROM `*PREFIX*users` WHERE `uid` IN (SELECT `uid` FROM *PREFIX*group_user WHERE `gid` = ?) ORDER BY `displayname`';
            $args = $group;            
            $query = \OCP\DB::prepare($sql);
            $resRsrc = $query->execute($args);
        }

        $result = array();

        while($row = $resRsrc->fetchRow()) {
            if($withDisplayName) {
                $result[$row['uid']] = $row['displayname'];
            } else {
                $result[] = $row['uid'];
            }
        }

        return $result;
    }    
}
