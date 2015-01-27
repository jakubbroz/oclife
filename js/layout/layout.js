jQuery(function($) {
    var container = $('#ownTags_content');

    function relayout() {
        container.layout({resize: false});
    }
    relayout();

    $(window).resize(relayout);

    $('#tagscontainer').resizable({
        handles: 'e',
        stop: relayout
    });
});