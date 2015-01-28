<?php

//return tagid of tag with description same as you enter in tokenfield


\OCP\JSON::callCheck();
\OCP\JSON::checkLoggedIn();
\OCP\JSON::checkAppEnabled('oclife');

$ctags = new \OCA\oclife\hTags();
$tagData = $ctags->getAllTags('xx');

$searchKey = filter_input(INPUT_GET, 'term', FILTER_SANITIZE_STRING);

$result = array('result'=>-1);

foreach($tagData as $tag) {
    if($tag['tagid'] !== '-1') {       
            if(strcmp(strtolower($tag['descr']), strtolower($searchKey))== 0) {
                $result= NULL;
                $result = array('result'=>$tag['tagid'],'name'=>$tag['descr']);
                break;
            }
        
    }
}

echo json_encode($result);
