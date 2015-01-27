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

\OCP\App::addNavigationEntry(array(

    // the string under which your app will be referenced in owncloud
    'id' => 'ownTags',

    // sorting weight for the navigation. The higher the number, the higher
    // will it be listed in the navigation
    'order' => 10,

    // the route that will be shown on startup
    'href' => \OCP\Util::linkToRoute('ownTags_index'),

    // the icon that will be shown in the navigation
    // this file needs to exist in img/example.png
    'icon' => \OCP\Util::imagePath('ownTags', 'nav-icon.svg'),

    // the title of your application. This will be used in the
    // navigation or on the settings page of your app
    'name' => 'Tags'
));

// Handle translations
$l = new \OC_L10N('ownTags');

// Add what's needed by TagManager
\OCP\Util::addStyle('ownTags', 'bootstrap-tokenfield');
\OCP\Util::addStyle('ownTags', 'ownTags_fileInfo');

\OCP\Util::addScript('ownTags', 'bootstrap-tokenfield/bootstrap-tokenfield');
\OCP\Util::addScript('ownTags', 'bootstrap-tokenfield/typeahead.bundle');
\OCP\Util::addScript('ownTags', 'bootstrap-tokenfield/affix');

\OCP\App::registerAdmin('ownTags', 'settings');

\OCP\Util::addscript('ownTags', 'ownTags/ownTags_fileExtendedInfo');

// Register filesystem hooks to remove thumbnails and tags DB entries
\OCP\Util::connectHook('OC_Filesystem', 'delete', 'OCA\ownTags\utilities', 'cleanupForDelete');
\OCP\Util::connectHook('OC_Filesystem', 'rename', 'OCA\ownTags\utilities', 'cleanupForRename');
