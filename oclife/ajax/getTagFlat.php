<?php
OCP\JSON::checkLoggedIn();
OCP\JSON::checkAppEnabled('oclife');

class tag {
    public $value;
    public $label;
    
    function __construct($value, $label) {
        $this->value = $value;
        $this->label = $label;
    }

    public function getValue() {
        return $this->value;
    }

    public function getLabel() {
        return $this->label;
    }

    public function setValue($value) {
        $this->value = $value;
    }

    public function setLabel($label) {
        $this->label = $label;
    }
}

$ctags = new OCA\OCLife\hTags();
$tagData = $ctags->getAllTags('xx');

$searchKey = filter_input(INPUT_GET, 'term', FILTER_SANITIZE_STRING);

$result = array();

foreach($tagData as $tag) {
    if(is_null($searchKey) || $searchKey === FALSE || $searchKey === '') {
        $result[] = new tag($tag['tagid'], $tag['descr']);
    } else {
        if(strpos($tag['descr'], $searchKey) !== FALSE) {
            $result[] = new tag($tag['tagid'], $tag['descr']);
        }
    }
}

$jsonTagData = json_encode((array) $result);
echo $jsonTagData;