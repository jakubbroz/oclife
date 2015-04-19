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

$this->create('oclife_index', '/')->action(
    function($params){
        require __DIR__ . '/../index.php';
    }
);

$this->create('change_tag_hierarchy', 'ajax/changeHierachy.php')->actionInclude('oclife/ajax/changeHierachy.php');
$this->create('change_tag_priviledge', 'ajax/changePriviledge.php')->actionInclude('oclife/ajax/changePriviledge.php');
$this->create('get_file_informations', 'ajax/getFileInfo.php')->actionInclude('oclife/ajax/getFileInfo.php');

$this->create('get_tags_flat', 'ajax/getTagFlat.php')->actionInclude('oclife/ajax/getTagFlat.php');

$this->create('files_tags', 'ajax/FilesTags.php')->actionInclude('oclife/ajax/FilesTags.php');
$this->create('clear_memcache', 'ajax/ClearMemcache.php')->actionInclude('oclife/ajax/ClearMemcache.php');
$this->create('set_memcache', 'ajax/SetMemcache.php')->actionInclude('oclife/ajax/SetMemcache.php');
$this->create('get_existing_tag', 'ajax/getExistingTag.php')->actionInclude('oclife/ajax/getExistingTag.php');


$this->create('get_all_tags', 'ajax/getTags.php')->actionInclude('oclife/ajax/getTags.php');
$this->create('get_tags_for_file', 'ajax/getTagsForFile.php')->actionInclude('oclife/ajax/getTagsForFile.php');
$this->create('search_files_from_tags', 'ajax/searchFilesFromTags.php')->actionInclude('oclife/ajax/searchFilesFromTags.php');
$this->create('tag_operations', 'ajax/tagOps.php')->actionInclude('oclife/ajax/tagOps.php');
$this->create('tag_update', 'ajax/tagsUpdate.php')->actionInclude('oclife/ajax/tagsUpdate.php');

$this->create('save_admin_preferences', 'ajax/savePrefs.php')->actionInclude('oclife/ajax/savePrefs.php');

// Following routes for previews
$this->create('get_preview', 'getPreview.php')->actionInclude('oclife/getPreview.php');
$this->create('get_thumbnail', 'getThumbnail.php')->actionInclude('oclife/getThumbnail.php');