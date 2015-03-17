var previewShown = false;

$(document).ready(function() {

    
    
    
    //allFields = $([]).add(tagName);
     allFields = $([]).add(document.getElementById('tagName'));
    
    $("#tagstree").fancytree({
        extensions: ["dnd"],

        renderNode: function(event, data) {
            var iconCSS = getItemIcon(data.node.data.permission);
            var span = $(data.node.span);
            if(data.key!="_statusNode")
            if(data.node.data.owner==document.getElementById("expandDisplayName").outerText) {
                var findResult = span.find("> span.fancytree-title");
                span.css("font-weight","bold");
            }
            var findResult = span.find("> span.fancytree-icon");
            findResult.css("backgroundImage", iconCSS);
            findResult.css("backgroundPosition", "0 0");
            
        },

        source: {
            url: OC.filePath('oclife', 'ajax', 'getTags.php')
        },

        checkbox: true,
        
        activate: function(event, data) {
            var node = $("#tagstree").fancytree("getActiveNode");
            if(node.key === "-1") {
                return;
            }
            
            $("#btnRename").button( "option", "disabled", false );
            $("#btnDelete").button( "option", "disabled", false );
            adjustPriviledge(data.node.key);
        },
        
        deactivate: function(event, data) {
            deActivateButtons();
        },

        select: function(event, data) {
            var selectedNodes = data.tree.getSelectedNodes();
            var selNodesData = new Array();

            for(i = 0; i < selectedNodes.length; i++) {
                var nodeData = new Object();
                nodeData.key = selectedNodes[i].key;
                nodeData.title = selectedNodes[i].title;

                selNodesData.push(nodeData);
            }

            var tags = JSON.stringify(selNodesData);
                
            
            
            $.ajax({
                url: OC.filePath('oclife', 'ajax', 'searchFilesFromTags.php'),

                data: {
                    tags: tags,
                    listgrid: $("#myonoffswitch")[0].checked
                },

                type: "POST",

                success: function( result ) {
                    $("#oclife_fileList").html(result);

                    if(result === '') {
                        $("#oclife_emptylist").css("display", "block");
                    } else {
                        $("#oclife_emptylist").css("display", "none");
                    }
                },

                error: function( xhr, status ) {
                    updateStatusBar(t('oclife', 'Unable to get files list!'));
                }
            });
        },

        dnd: {
            preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
            preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
            autoExpandMS: 400,
            dragStart: function(node, data) {
              return true;
            },
            dragEnter: function(node, data) {
               return true;
            },
            dragDrop: function(node, data) {
                data.otherNode.moveTo(node, data.hitMode);

                $.ajax({
                    url: OC.filePath('oclife', 'ajax', 'changeHierachy.php'),

                    data: {
                        movedTag: data.otherNode.key,
                        droppedTo: data.node.key
                    },

                    type: "POST",

                    success: function( result ) {
                        if(result === 'OK') {
                            updateStatusBar(t('oclife', 'Tag moved successfully!'));
                        } else {
                            updateStatusBar(t('oclife', 'Tag not moved! Data base error!'));
                        }
                    },
                    
                    error: function( xhr, status ) {
                        updateStatusBar(t('oclife', 'Tag not moved! Ajax error!'));
                    }
                });
            }
        }
    });

    $( "#btnExpandAll" )
        .button({
            icons: {
                primary: "ui-icon-plus"
            },
            text: false
        })
        .click(function() {
            $("#tagstree").fancytree("getRootNode").visit(function(node){
                node.setExpanded(true);
            });
        });

    $( "#btnCollapseAll" )
        .button({
            icons: {
                primary: "ui-icon-minus"
            },
            text: false
        })
        .click(function() {
            $("#tagstree").fancytree("getRootNode").visit(function(node){
                node.setExpanded(false);
            });
        });

    $( "#btnNew" )
        .button({
            icons: {
                primary: "ui-icon-document"
            },
            text: false
        })
        .click(function() {
            var node = $("#tagstree").fancytree("getActiveNode");
            var nodeKey = -1;
            if(node !== null) {
                nodeKey = node.key;
            }
            if(node==null) {
              node = $("#tagstree").fancytree("getRootNode");
            }

           // newTagName.value = "";
            document.getElementById('newTagName').value = "";
           // parentID.value = nodeKey;
            document.getElementById('parentID').value = nodeKey;
           

            $( "#createTag" ).dialog( "open" );
            $(this).closest('.ui-dialog').find('.ui-dialog-buttonpane button:eq(0)').focus();
        });

    $( "#btnRename" )
        .button({
            icons: {
                primary: "ui-icon-pencil"
            },
            text: false,
            disabled: true 
        })
        .click(function() {
            var node = $("#tagstree").fancytree("getActiveNode");
            if(node === null) {
                return;
            }

            if(node.key === '-1') {
                updateStatusBar(t('oclife', 'Editing of Root node not allowed!'));
                return;
            }

            $("#tagName").val(node.title);
            $("#tagID").val(node.key);

            $( "#renameTag" ).dialog( "open" );
            $(this).closest('.ui-dialog').find('.ui-dialog-buttonpane button:eq(0)').focus();                
        });

    $( "#btnDelete" )
        .button({
            icons: {
                primary: "ui-icon-trash"
            },
            text: false,
            disabled: true 
        })
        .click(function() {
            var node = $("#tagstree").fancytree("getActiveNode");
            if(node === null) {
                return;
            }

            if(node.key === '-1') {
                updateStatusBar(t('oclife', 'Deleting of Root node not allowed!'));
                return;
            }
            $("#tagToDelete").text(node.title);
            //deleteID.value = node.key;
            document.getElementById('deleteID').value=node.key; 
            
            $( "#deleteConfirm" ).dialog( "open" );
            $(this).closest('.ui-dialog').find('.ui-dialog-buttonpane button:eq(0)').focus();
        });

    $("#menuOwnPriv").on("change", function(){
        var value = $("#menuOwnPriv").val();
        var node = $("#tagstree").fancytree("getActiveNode");
        
        if(value === "OwnRO") {
            changePriviledge(node.key, 'r-xxxx');
        } else if(value === "OwnRW") {
            changePriviledge(node.key, 'rwxxxx');
        }
    });
    
    $("#menuGrpPriv").on("change", function(){
        var value = $("#menuGrpPriv").val();
        var node = $("#tagstree").fancytree("getActiveNode");
        
        if(value === "GrpNO") {
            changePriviledge(node.key, 'xx--xx');
        } else if(value === "GrpRO") {
            changePriviledge(node.key, 'xxr-xx');
        } else if(value === "GrpRW") {
            changePriviledge(node.key, 'xxrwxx');
        }
    });

    $("#menuAllPriv").on("change", function(){
        var value = $("#menuAllPriv").val();
        var node = $("#tagstree").fancytree("getActiveNode");
        
        if(value === "AllNO") {
            changePriviledge(node.key, 'xxxx--');
        } else if(value === "AllRO") {
            changePriviledge(node.key, 'xxxxr-');
        } else if(value === "AllRW") {
            changePriviledge(node.key, 'xxxxrw');
        }
    });

    $("#menuOwnName").on("change", function(){
        var newOwner = $("#menuOwnName").val();
        var nodeKey = $("#tagstree").fancytree("getActiveNode").key;
        
        $.ajax({
            url: OC.filePath('oclife', 'ajax', 'changePriviledge.php'),

            data: {
                tagID: nodeKey,
                tagOwner: newOwner
            },

            type: "POST",

            success: function(result) {
                var resultData = jQuery.parseJSON(result);
                
                if(resultData.result === 'OK') {
                    updateStatusBar(t('oclife', 'Owner changed successfully!'));
                    if(newOwner==$("#expandDisplayName")[0].innerText) {
                        $(".fancytree-active")[0].style.fontWeight="bold";
                    } else {
                        $(".fancytree-active")[0].style.fontWeight="normal";
                    }
                    
                } else if(resultData.result === 'NOTALLOWED') {
                    updateStatusBar(t('oclife', 'Owner not changed! Permission denied!'));
                } else {
                    updateStatusBar(t('oclife', 'Owner not changed! Data base error!'));
                }
            },
            error: function( xhr, status ) {
                updateStatusBar(t('oclife', 'Owner not changed! Ajax error!'));
            }
        });
    });

       
    $("#fileTable").delegate(
        "#Download",
        "mousedown",
        function() {
        var filePath = $(this).parent().attr("data-fullPath");
        var spliter=filePath;
        var dir=spliter.split("/");
        var file=dir[dir.length-1];
        spliter=filePath.substring((filePath.length-file.length),0);
        var p=spliter.split('/').join("%2F");
        
        window.location.href="/owncloud/index.php/apps/files/ajax/download.php?dir="+p+"&files="+file;                
        
        });
        
        
         $down=$("<div id='Download' style='width:100%;background-color:red;position:relative;top:-228px;display:hidden'>"+t('oclife','Download')+"</div>");
         $del=$("<div id='Delete' style='width:100%;background-color:blue;position:relative;top:-228px;display:hidden'>"+t('oclife','Delete tag')+"</div>");        
         $preview=$("<div id='Preview' style='width:100%;background-color:purple;position:relative;top:-228px;display:hidden'>"+t('oclife','Preview')+"</div>");        
         $pom4=null;
         $pom6=null;
         
    function getInternetExplorerVersion(){

    var rv = - 1;
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    else if (navigator.appName == 'Netscape')
    {
        var ua = navigator.userAgent;
        var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}
            
     $("#fileTable").delegate(
        ".oclife_tile",
        "mouseover",
        function() {
            var filePath = $(this).attr("data-fullPath");
            var nesto=filePath.split(".");
            var extension=nesto[nesto.length-1].toLowerCase();
            if(extension=="jpg" || extension=="jpeg" || extension=="png" || extension=="tiff" || (extension=="pdf" && getInternetExplorerVersion()==-1))               
             { 
                $down[0].innerHTML = t('oclife', 'Download');
                    $del[0].innerHTML = t('oclife', 'Delete tag');
                    $preview[0].innerHTML = t('oclife', 'Preview');
                    $down.appendTo($(this));
                    $preview.appendTo($(this));
                    $del.appendTo($(this));
                    $down.css({"visibility": "visible"});
                    $del.css({"visibility": "visible"});
                    $preview.css({"visibility": "visible"});             
            }
        
        else {                     
            $down.appendTo($(this));
            $del.appendTo($(this));
            $down.css({"visibility":"visible"});
            $del.css({"visibility":"visible"});
        }
        });
        
       $("#fileTable").delegate(
        ".oclife_tile",
        "mouseout",
        function() {
           
            $down.css({"visibility":"hidden"});
            $del.css({"visibility":"hidden"});
            $preview.css({"visibility":"hidden"});
            });
           

            
        
        $('#fileTable').delegate(
        "#download",
        "click",
        function() {
        var filePath = $(this).parent().attr("filepath");
       var spliter=filePath;
        var dir=spliter.split("/");
        var file=dir[dir.length-1];
        spliter=filePath.substring((filePath.length-file.length),0);
        var p=spliter.split('/').join("%2F");
        
        window.location.href="/owncloud/index.php/apps/files/ajax/download.php?dir="+p+"&files="+file;                
        });
        
        $('#fileTable').delegate(
        "#delete",
        "click",
        function() {
        var fileID = $(this).parent().attr("fileid");
        $pom6=fileID;
        Nadji(fileID);
    });
        
        $('#fileTable').delegate(
        "#preview",
        "click",
        function() {
        var filePath = $(this).parent().attr("filePath");
            var nesto=filePath.split(".");
            var extension=nesto[nesto.length-1].toLowerCase();
            if(extension=="jpg" || extension=="jpeg" || extension=="png" || extension=="tiff") {
                showPreview(filePath);
            }  
            if(extension=="pdf") {
                    showPDFviewerPom("%2F",filePath);
            }
        });
        
        
        
        
        $('#fileTable').delegate(
        "#Delete",
        "mousedown",
        function() {
        
        var fileID = $(this).parent().attr("data-fileid");
        $pom6=fileID;
        Nadji(fileID);
                 
        });
        
        
        function Nadji(fileID) {
                      
        $.ajax({
            url: OC.filePath('oclife', 'ajax', 'getTagsForFile.php'),
            async: false,
            timeout: 2000,

        data: {
            id: fileID
        },

        success: function(result) {
            var niz = null;
            var niz = JSON.parse(result);
            var i = 0;
            $pom5 = document.getElementById("lista");
            $pom5.innerHTML = "";
            while (i < niz.length) {
                if(niz[i].write) {
                    $pom4 = ($("<li id='listali' style='list-style-type: none;margin-left:40%;' ><input type='checkbox' /><input type='hidden' value='" + niz[i].value + "'/>" + niz[i].label + "</li>"));
                    $pom4.appendTo($pom5);           
                }
                else if(niz[i].read) {
                    $pom4 = ($("<li id='listali' style='color:red;list-style-type: none;margin-left:40%;' ><input type='hidden' value='" + niz[i].value + "'/>" + niz[i].label + "</li>"));
                    $pom4.appendTo($pom5);
                    }
                i++;
            }

            $("#ObrisiIh").dialog("open");
        },

        error: function (xhr, status) {
            window.alert(t('oclife', 'Unable to get actual tags for this document! Ajax error!'));
        },

        type: "POST"});
        }
        
        
        $( "#ObrisiIh" ).dialog({
        autoOpen: false,
        height: 200,
        width: 300,
        modal: true,
        resizable: false,
        buttons: {
            Confirm: {
                text: t('oclife', 'Confirm'),
                click: function() {
                    Obrisi();
                   $( this ).dialog( "close" );
                }
            },

            Cancel: {
                text: t('oclife', 'Cancel'),
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        },

        close: function() {
            allFields.val("").removeClass( "ui-state-error" );
        }
    });
    
    $('#myonoffswitch').click(function() {
         var selectedNodes = $("#tagstree").fancytree("getTree").getSelectedNodes();
         var selNodesData = new Array();

        for(i = 0; i < selectedNodes.length; i++) {
            var nodeData = new Object();
            nodeData.key = selectedNodes[i].key;
            nodeData.title = selectedNodes[i].title;

            selNodesData.push(nodeData);
        }

        var tags = JSON.stringify(selNodesData);

        $.ajax({
            url: OC.filePath('oclife', 'ajax', 'searchFilesFromTags.php'),

            data: {
                tags: tags,
                 listgrid: $("#myonoffswitch")[0].checked
            },

            type: "POST",

            success: function( result ) {
                $("#oclife_fileList").html(result);

                if(result === '') {
                    $("#oclife_emptylist").css("display", "block");
                } else {
                    $("#oclife_emptylist").css("display", "none");
                }
            },

            error: function( xhr, status ) {
                updateStatusBar(t('oclife', 'Unable to get files list!'));
            }
        });  
});
    

        
        function Obrisi() {
            var i=0;
            while(i<$pom5.childNodes.length) {
                if($pom5.childNodes[i].childNodes[0].checked==true) {
                    
                    $.ajax({
                        url: OC.filePath('oclife', 'ajax', 'tagsUpdate.php'),
                        async: false,
                        timeout: 1000,

                        data: {
                            op: 'remove',
                            fileID: $pom6,
                            tagID: $pom5.childNodes[i].childNodes[1].value
                        },

                        success:function(data) {
                                    var selectedNodes = $("#tagstree").fancytree("getTree").getSelectedNodes();
                                    var selNodesData = new Array();

                                    for(i = 0; i < selectedNodes.length; i++) {
                                        var nodeData = new Object();
                                        nodeData.key = selectedNodes[i].key;
                                        nodeData.title = selectedNodes[i].title;

                                        selNodesData.push(nodeData);
                                    }

                                    var tags = JSON.stringify(selNodesData);

                                    $.ajax({
                                        url: OC.filePath('oclife', 'ajax', 'searchFilesFromTags.php'),

                                        data: {
                                            tags: tags,
                                             listgrid: $("#myonoffswitch")[0].checked
                                        },

                                        type: "POST",

                                        success: function( result ) {
                                            $("#oclife_fileList").html(result);

                                            if(result === '') {
                                                $("#oclife_emptylist").css("display", "block");
                                            } else {
                                                $("#oclife_emptylist").css("display", "none");
                                            }
                                        },

                                        error: function( xhr, status ) {
                                            updateStatusBar(t('oclife', 'Unable to get files list!'));
                                        }
                                    });  
                        },

                        error: function (xhr, status) {
                            window.alert(t('oclife', 'Unable to add the tag! Ajax error.'));
                            $(eventData.relatedTarget).addClass('invalid');
                        },

                        type: "POST"});  
                    
                   }
                i++;
            }
        }
        
    $('#fileTable').delegate(
        "#Preview",
        "mousedown",
        function() {
            $down.css({"visibility":"hidden"});
            $del.css({"visibility":"hidden"});
            $preview.css({"visibility":"hidden"});
            var fileID = $(this).parent().attr("data-fileid");
            var filePath = $(this).parent().attr("data-fullPath");
            var nesto=filePath.split(".");
            var extension=nesto[nesto.length-1].toLowerCase();
            if(extension=="jpg" || extension=="jpeg" || extension=="png" || extension=="tiff") {
                showPreview(filePath);
            }  
            if(extension=="pdf") {
               
                    showPDFviewerPom("%2F",filePath);
                
            }
            
        });
        
        

        $(window).resize(function(){
            if(previewShown) {
                $("#imagePreview").dialog("option","position","center");
            }
        }).resize();

    $("#fileTable").delegate(
        "#imagePreview",
        "click",
        function(eventData) {
            $("#imagePreview").dialog("close");
            $("#previewArea").attr("src", "");
            previewShown = false;
        });

    function deActivateButtons() {
        $("#btnRename").button( "option", "disabled", true );
        $("#btnDelete").button( "option", "disabled", true );

        $("#menuOwnName").prop("disabled", true);
        $("#menuOwnPriv").prop("disabled", true);
        $("#menuGrpPriv").prop("disabled", true);
        $("#menuAllPriv").prop("disabled", true);
    }
    
    function adjustPriviledge(tagID) {
        $.ajax({
            url: OC.filePath('oclife', 'ajax', 'tagOps.php'),
            async: false,
            timeout: 2000,

            data: {
                tagOp: 'info',
                tagID: tagID,
                tagName: '',
                tagLang: 'xx'
            },

            type: "POST",

            success: function(result) {
                var resultData = jQuery.parseJSON(result);

                if(resultData.result === 'OK') {
                    $("#menuOwnName").prop("disabled", false);
                    $("#menuOwnName").val(resultData.owner);
                    
                    $("#menuOwnPriv").prop("disabled", false);
                    $("#menuGrpPriv").prop("disabled", false);
                    $("#menuAllPriv").prop("disabled", false);
                    
                    var permission = resultData.permission;
                    
                    if(permission.substring(0,1) === "r" && permission.substring(1,2) === "w") {
                        $("#menuOwnPriv").val("OwnRW");
                    } else {
                        $("#menuOwnPriv").val("OwnRO");
                    }
                    
                    if(permission.substring(2,3) === "-" && permission.substring(3,4) === "-") {
                        $("#menuGrpPriv").val("GrpNO");
                    }
                    else if(permission.substring(2,3) === "r" && permission.substring(3,4) === "w") {
                        $("#menuGrpPriv").val("GrpRW");
                    } else {
                        $("#menuGrpPriv").val("GrpRO");
                    }

                    if(permission.substring(4,5) === "-" && permission.substring(5,6) === "-") {
                        $("#menuAllPriv").val("AllNO");
                    }
                    else if(permission.substring(4,5) === "r" && permission.substring(5,6) === "w") {
                        $("#menuAllPriv").val("AllRW");
                    } else {
                        $("#menuAllPriv").val("AllRO");
                    }
                } else {
                    updateStatusBar(t('oclife', 'Unable to get info! Data base error!'));
                }
            },

            error: function( xhr, status ) {
                updateStatusBar(t('oclife', 'Unable to get info! Ajax error!'));
            }                            
        });
    }

    function showPreview(filePath) {
        var maskHeight = $(window).height();  
        var maskWidth = $(window).width();
        var prevWidth = 825;
        var prevHeight = 660;
        var dialogTop =  (maskHeight  - prevHeight) / 2;  
        var dialogLeft = (maskWidth - prevWidth) / 2; 
        var thumbPath = OC.filePath("oclife", "", "getPreview.php") + "?filePath=" + encodeURIComponent(filePath);

        $("#imagePreview").dialog("open");
        $("#previewArea").attr("src", thumbPath);
        $("#imagePreview").dialog({top: dialogTop, left: dialogLeft, width: prevWidth, height: prevHeight, position: "fixed"});
        $("#imagePreview").dialog("option","position","center");

        previewShown = true;
    }

    function getItemIcon(nodeClass) {
        if(nodeClass === undefined) {
            return '';
        }
        
        var iconCSS = '';
        var ownPriv = nodeClass.substring(0,2);
        var grpPriv = nodeClass.substring(2,4);
        var allPriv = nodeClass.substring(4,6);

        if(ownPriv === 'r-' && grpPriv === '--' && allPriv === '--') {
            iconCSS = "URL(" + OC.filePath('oclife', 'img', 'fancytree/icon_person_red.png') + ")";
        } else if(ownPriv === 'rw' && grpPriv === '--' && allPriv === '--') {
            iconCSS = "URL(" + OC.filePath('oclife', 'img', 'fancytree/icon_person_green.png') + ")";
        } else if(grpPriv === 'r-' && allPriv === '--') {
            iconCSS = "URL(" + OC.filePath('oclife', 'img', 'fancytree/icon_group_red.png') + ")";
        } else if(grpPriv === 'rw' && allPriv === '--') {
            iconCSS = "URL(" + OC.filePath('oclife', 'img', 'fancytree/icon_group_green.png') + ")";
        } else if(allPriv === 'r-') {
            iconCSS = "URL(" + OC.filePath('oclife', 'img', 'fancytree/icon_globe_red.png') + ")";
        } else if(allPriv === 'rw') {
            iconCSS = "URL(" + OC.filePath('oclife', 'img', 'fancytree/icon_globe_green.png') + ")";
        } else {
            iconCSS = "URL(" + OC.filePath('oclife', 'img', 'fancytree/icon_invalid.png') + ")";
        }

        return iconCSS;
    }

    function checkLength( o, min, max ) {
        if(o.value.length > max || o.value.length < min ) {
            updateTips('Lenght must be between ' + min + " - " + max + "." );
            return false;
        } else {
            return true;
        }
    }

    function updateTips( t ) {
        $( ".validateTips" )
            .text( t )
            .addClass( "ui-state-highlight" );
            setTimeout(function() {
                $( ".validateTips" ).removeClass( "ui-state-highlight", 1500 );
            }, 500 );
    }

    function updateStatusBar( t ) {
        $('#notification').html(t);
        $('#notification').slideDown();
        window.setTimeout(function(){
            $('#notification').slideUp();
        }, 5000);            
    }

    $("#renameTag").dialog({
        autoOpen: false,
        height: 200,
        width: 350,
        modal: true,
        resizable: false,
        buttons: {
            Confirm: {
                text: t('oclife', 'Confirm'),
                click: function() {
                    renameTag();
                }
            },

            Cancel: {
                text: t('oclife', 'Cancel'),
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        },

        close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
        }
    });

    $("#renameTag").on('keypress', function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code === 13) {
            e.preventDefault();
            renameTag();
        }
    });

    function renameTag() {
        var bValid = true;
        allFields.removeClass( "ui-state-error" );
        //bValid = bValid && checkLength( tagName, 1, 20 );
        bValid = bValid && checkLength( document.getElementById("tagName"), 1, 80 );

        if ( bValid ) {
            /*
            var newValue = tagName.value;
            var tagToMod = tagID.value;
            */
            var newValue = document.getElementById("tagName").value;
            var tagToMod = document.getElementById("tagID").value;
           
            $.ajax({
                url: OC.filePath('oclife', 'ajax', 'tagOps.php'),
                async: false,
                timeout: 2000,

                data: {
                    tagOp: 'rename',
                    tagID: tagToMod,
                    tagName: newValue,
                    tagLang: 'xx'
                },

                type: "POST",

                success: function(result) {
                    var resultData = jQuery.parseJSON(result);

                    if(resultData.result === 'OK') {
                        var parentNode = $("#tagstree").fancytree("getActiveNode").getParent();
                        $("#tagstree").fancytree("getActiveNode").remove();

                        var nodeData = {
                            'title': resultData.title,
                            'key': parseInt(resultData.key),
                            'permission': resultData.permission
                        };
                        var newNode = parentNode.addChildren(nodeData);
                        newNode.setActive(true);

                        updateStatusBar(t('oclife', 'Rename done!'));
                    } else if(resultData.result === 'NOTALLOWED' ) {
			updateStatusBar(t('oclife', 'Unable to rename! Permission denied!'));
		    } else {
                        updateStatusBar(t('oclife', 'Tag')+" \""+resultData.title+"\" "+t('oclife', 'already exists'));
                   }
                },

                error: function( xhr, status ) {
                    updateStatusBar(t('oclife', 'Unable to rename! Ajax error!'));
                }
            });                        

            $("#renameTag").dialog( "close" );
        }
    }

    $( "#createTag" ).dialog({
        autoOpen: false,
        height: 200,
        width: 350,
        modal: true,
        resizable: false,
        buttons: {
            Confirm: {
                text: t('oclife', 'Confirm'),
                click: function() {
                    insertTag();
                }
            },

            Cancel: {
                text: t('oclife', 'Cancel'),
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        },

        close: function() {
            allFields.val("").removeClass( "ui-state-error" );
        }
    });

    $("#createTag").on('keypress', function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code === 13) {
            e.preventDefault();
            insertTag();
        }
    });

    function insertTag() {
        var bValid = true;
        allFields.removeClass( "ui-state-error" );
        //bValid = bValid && checkLength( newTagName, 1, 20 );
        bValid = bValid && checkLength( document.getElementById("newTagName"), 1, 80 );

        if ( bValid ) {
          //  var newValue = newTagName.value;
            //var parent = parentID.value;
            var newValue = document.getElementById("newTagName").value;
            var parent = document.getElementById("parentID").value;

            $.ajax({
                url: OC.filePath('oclife', 'ajax', 'tagOps.php'),
                async: false,
                timeout: 2000,

                data: {
                    tagOp: 'new',
                    parentID: parent,
                    tagName: newValue,
                    tagLang: "xx"
                },

                type: "POST",

                success: function( result ) {                                
                    var resArray = jQuery.parseJSON(result);
                    if(resArray.result === 'OK') {
                        var node = $("#tagstree").fancytree("getActiveNode");
                         if(node==null) {
                             node = $("#tagstree").fancytree("getNodeByKey","-1");
                        }
                        var nodeData = {
                            'title': resArray.title,
                            'key': parseInt(resArray.key),
                            'permission': resArray.permission
                        };
                        var newNode = node.addChildren(nodeData);
                        node.setExpanded(true);
                        newNode.setActive(true);

                        updateStatusBar(t('oclife', 'Tag created successfully!'));
                        $(".fancytree-active").css("font-weight","bold");
                        var node = $("#tagstree").fancytree("getRootNode");
                        node.sortChildren(null, true);
                        //location.reload();   
                    } else {
                        updateStatusBar(t('oclife', 'Tag')+" \""+resArray.title+"\" "+t('oclife', 'already exists'));
                    }
                },

                error: function( xhr, status ) {
                    updateStatusBar(t('oclife', 'Unable to create tag! Ajax error!'));
                }
            });                        

            $('#createTag').dialog( "close" );                        
        }
    }

    $( "#deleteConfirm" ).dialog({
        resizable: false,
        autoOpen: false,
        width: 320,
        height: 200,
        modal: true,
        buttons: {
            Cancel: {
                text: t('oclife', 'Cancel'),
                click: function() {
                    $( this ).dialog( "close" );
                    updateStatusBar(t('oclife', 'Operation canceled: No deletion occurred!'));
                }
            },

            Delete: {
                
              
                text: t('oclife', 'Delete'),
                click: function() {
                    $( this ).dialog( "close" );
                    //updateStatusBar(t('oclife', 'dada'));
                   // var tagID = deleteID.value;
                    var tagID = document.getElementById('deleteID').value;

                    if(tagID === "-1") {
                        updateStatusBar(t('oclife', 'Invalid tag number! Nothing done!'));
                        return;
                    }

                    $.ajax({
                        url: OC.filePath('oclife', 'ajax', 'tagOps.php'),
                        async: false,
                        timeout: 2000,

                        data: {
                            tagOp: 'delete',
                            parentID: '-1',
                            tagName: '',
                            tagLang: "xx",
                            tagID: tagID
                        },

                        type: "POST",

                        success: function(result) {
                            var resArray = jQuery.parseJSON(result);

                            if(resArray.result === 'OK') {
                                $("#tagstree").fancytree("getActiveNode").remove();
                                updateStatusBar(t('oclife', 'Tag removed successfully!'));
			    } else if (resArray.result === 'NOTALLOWED') {
				updateStatusBar(t('oclife', 'Tag not removed! Permission denied'));
                            } else {
                                updateStatusBar(t('oclife', 'Tag not removed! Data base error!'));
                            }
                        },
                        error: function( xhr, status ) {
                            updateStatusBar(t('oclife', 'Tags not removed! Ajax error!'));
                        }
                    });
                }
            }
        }
    });

    function changePriviledge(nodeKey, priviledge) {
        $.ajax({
            url: OC.filePath('oclife', 'ajax', 'changePriviledge.php'),

            data: {
                tagID: nodeKey,
                setPriviledge: priviledge
            },

            type: "POST",

            success: function(result) {
                var resultData = jQuery.parseJSON(result);
                
                if(resultData.result === 'OK') {
                    var node = $("#tagstree").fancytree("getActiveNode");
                    var iconCSS = getItemIcon(resultData.newpriviledges);

                    var span = $(node.span);
                    var findResult = span.find("> span.fancytree-icon");
                    findResult.css("backgroundImage", iconCSS);
                    findResult.css("backgroundPosition", "0 0");


                    updateStatusBar(t('oclife', 'Priviledge changed successfully!'));
                } else if(result === 'NOTALLOWED') {
                    updateStatusBar(t('oclife', 'Priviledge not changed! Permission denied!'));
                } else {
                    updateStatusBar(t('oclife', 'Priviledge not changed! Permission denied!'));
                }
            },
            error: function( xhr, status ) {
                updateStatusBar(t('oclife', 'Priviledge not changed! Ajax error!'));
            }
        });
    }

    $("#filePath").dialog({
        resizable: false,
        autoOpen: false,
        width: 320,
        height: 200,
        modal: true,
        buttons: {
            "Close": function() {
                $( this ).dialog( "close" );
            }
        }
    });

    $("#imagePreview").dialog({
        resizable: true,
        autoOpen: false,
        width: 800,
        height: 650,
        modal: true,
        buttons: {
        },

        close: function() {
            $("#previewArea").attr("src", "");
        }
    });   
       
    
    setTimeout(function() {
          var node = $("#tagstree").fancytree("getRootNode");
          node.sortChildren(null, true);
    },250);

});







function hidePDFviewerPom() {
	$('#pdframe, #pdfbar').remove();
	if ($('#isPublic').val() && $('#filesApp').val()){
		$('#controls').removeClass('hidden');
	}
	//FileList.setViewerMode(false);
	// replace the controls with our own
        $(".oclife_ime").removeClass('hidden');
	$('#app-content #controls').removeClass('hidden');
        
}

function showPDFviewerPom(dir, filename) {
	if(!showPDFviewerPom.shown) {
		var $iframe;
		var viewer = OC.linkTo('files_pdfviewer', 'viewer.php')+'?dir='+encodeURIComponent(dir).replace(/%2F/g, '/')+'&file='+encodeURIComponent(filename);
		$iframe = $('<iframe id="pdframe" style="width:100%;height:100%;display:block;position:absolute;top:0;" src="'+viewer+'" sandbox="allow-scripts allow-same-origin" /><div id="pdfbar"><a id="close" title="Close">X</a></div>');
		$down.css({"visibility":"hidden"});
                $del.css({"visibility":"hidden"});
                $preview.css({"visibility":"hidden"});
                $('#content').append($iframe).css({height: '100%'});
		$('body').css({height: '100%'});
                $('footer').addClass('hidden');
		$('#imgframe').addClass('hidden');
		$('.directLink').addClass('hidden');
		$('.directDownload').addClass('hidden');
		$('#controls').addClass('hidden');
		$(".oclife_ime").addClass('hidden');
		$("#pageWidthOption").attr("selected","selected");
		// replace the controls with our own
		$('#app-content #controls').addClass('hidden');
		$('#pdfbar').css({position:'absolute',top:'6px',right:'5px'});
		$('#close').css({display:'block',padding:'0 5px',color:'#BBBBBB','font-weight':'900','font-size':'16px',height:'18px',background:'transparent'}).click(function(){
                    $(".oclife_ime").removeClass('hidden');
                    hidePDFviewerPom();
			});		
	}
}
showPDFviewerPom.oldCode='';
showPDFviewerPom.lastTitle='';


$(document).ready(function(){
	// The PDF viewer doesn't work in Internet Explorer 8 and below
	if(!$.browser.msie || ($.browser.msie && $.browser.version >= 9)){
		var sharingToken = $('#sharingToken').val();

		// Logged-in view
		if ($('#filesApp').val() && typeof FileActions !=='undefined'){
 			FileActions.register('application/pdf','Edit', OC.PERMISSION_READ, '',function(filename){
				if($('#isPublic').val()) {
					showPDFviewerPom('', encodeURIComponent(sharingToken)+"&files="+encodeURIComponent(filename)+"&path="+encodeURIComponent(FileList.getCurrentDirectory()));
				} else {
					showPDFviewerPom(encodeURIComponent(FileList.getCurrentDirectory()), encodeURIComponent(filename));
				}
			});
			FileActions.setDefault('application/pdf','Edit');
		}

		// Public view
		if ($('#isPublic').val() && $('#mimetype').val() === 'application/pdf') {
			showPDFviewerPom('', sharingToken);
		}
	}
});
