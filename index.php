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

// Highlight current menu item
OCP\App::setActiveNavigationEntry('oclife');

// Include what's needed by fancytree
\OCP\Util::addStyle('oclife', 'ui.fancytree');

\OCP\Util::addScript('oclife', 'fancytree/jquery.fancytree-all');

// Following is needed by layout manager
\OCP\Util::addScript('oclife', 'layout/jquery.sizes');
\OCP\Util::addScript('oclife', 'layout/jlayout.border');
\OCP\Util::addScript('oclife', 'layout/jquery.jlayout');
\OCP\Util::addScript('oclife', 'layout/layout');


// THEN execute what needed by us...
\OCP\Util::addStyle('oclife', 'oclife');
\OCP\Util::addScript('oclife', 'oclife/oclife_tagstree');

// Look up other security checks in the docs!
\OCP\User::checkLoggedIn();
\OCP\App::checkAppEnabled('oclife');

$tpl = new OCP\Template("oclife", "main", "user");
$tpl->printPage();
