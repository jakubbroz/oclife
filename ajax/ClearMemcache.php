<?php

\OCP\JSON::callCheck();
\OCP\JSON::checkLoggedIn();
\OCP\JSON::checkAppEnabled('oclife');

\OCA\oclife\utilities::clearMemcache();
