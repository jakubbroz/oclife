$(document).ready(function(){
    // no versions actions in public mode
    // beware of https://github.com/owncloud/core/issues/4545
    // as enabling this might hang Chrome
    if($('#isPublic').val()){
        return;
    }
    
    var extInfoActionRegistered = false;

    // Add tags button to 'files/index.php'
    LoadTagButton();
    
    function LoadTagButton() {
        if(typeof FileActions !== 'undefined') {
                // Add action to tag a group of files
                $(".selectedActions").html(function(index, oldhtml) {
                    if(oldhtml.indexOf("download") > 0) {
                        var tagIconPath = OC.imagePath('oclife','icon_tag');
                        var newAction = "<a class=\"donwload\" id=\"tagGroup\">";
                        newAction += "<img class=\"svg\" src=\"" + tagIconPath + "\" alt=\"Tag group of file\" style=\"width: 17px; height: 17px; margin: 0px 5px 0px 5px;\" />";
                        newAction += t('oclife', 'Tag selected files') + "</a>";
                        return newAction + oldhtml;
                    } else {
                        return oldhtml;
                    }
                });

                var infoIconPath = OC.imagePath('oclife','icon_info');

                FileActions.register('file', t('oclife', 'Tag'), OC.PERMISSION_UPDATE , infoIconPath, function(fileName) {
                    // Action to perform when clicked
                    if(scanFiles.scanning) { return; } // Workaround to prevent additional http request block scanning feedback
                showFileInfo(fileName);
            });

            extInfoActionRegistered = true;
        }
        }
   

    // This is the div where informations will appears
    if(extInfoActionRegistered) {
        $('#content').append('<div id="oclife_infos" title="' + t('oclife', 'Tag') + '">\n\
            <div id="oclife_infoData">\n\
            <table>\n\
            <tr>\n\
            <td id="oclife_preview"></td>\n\
            <td style="vertical-align: top; padding: 10px;">\n\
            <div id="oclife_infosData" style="width: 300px; height: 200px;">\n\
            <div id="basicInfoContent" style="height: 200px; overflow:scroll;"></div>\n\
            </div></td>\n\
            </tr>\n\
            </table>\n\
            </div>\n\
            <fieldset class="oclife_tagsbox" id="oclife_tags_container"><legend>'+t('oclife','Tags')+'</legend>\n\
            <input type="text" class="form-control" id="oclife_tags" placeholder="' + t('oclife', 'Enter tags here') + '" min-width: 150px; />\n\
            </fieldset>\n\
            </div>');

        // This is the div where tag group will happens
        $('#content').append('<div id="oclife_tagGroup" title="' + t('oclife', 'Tag selected files') + '">\n\
            <fieldset class="oclife_tagsbox"><legend>' + t('oclife', 'File(s) where the tags will be applied') + '</legend>\n\
            <table style="margin: 5px;">\n\
            <tr>\n\
            <td id="oclife_multiPreview"></td>\n\
            <td id="" style="vertical-align: top; padding: 10px;">\n\
            <select id="oclife_filesGroup">\n\
            </select>\n\
            <div id="oclife_multInfosData" />\n\
            </td>\n\
            </tr>\n\
            </table>\n\
            </fieldset>\n\
            <fieldset class="oclife_tagsbox" id="oclife_allfiles_tags_container"><legend>' + t('oclife', 'Tags common to all files') + '</legend>\n\
            <input type="text" class="form-control" id="oclife_allfiles_tags" placeholder="' + t('oclife', 'Enter tags here') + '" min-width: 150px; />\n\
            </fieldset>\n\
            <fieldset class="oclife_tagsbox" id="oclife_selfiles_tags_container"><legend>' + t('oclife', 'Tags for the selected file') + '</legend>\n\
            <input type="text" class="form-control" id="oclife_selfiles_tags" placeholder="' + t('oclife', 'Enter tags here') + '" min-width: 150px; />\n\
            </fieldset>\n\
            </div>');
    }
    
    
    // How to react when user click on "Tag group of file" button
    $("#tagGroup").on("click", function () {
        var files = getSelectedFiles();
        var c = 0;
        for (var i = 0; i < files.length; i++) {
            if (files[i].type == "dir") {
                c = 1;
                updateStatusBar(t('oclife', 'Folders must not be tagged!'));
                break;
            }
        }
        if (c == 0) {
            if (files.length === 1) {
                showFileInfo(files[0].name);
            } else {
                showFileGroupInfo(files);
            }
        }
    });
    
    function updateStatusBar( t ) {
        $('#notification').html(t);
        $('#notification').slideDown();
        window.setTimeout(function(){
            $('#notification').slideUp();
        }, 5000);            
    }

    $("#oclife_filesGroup").on("change", function() {
        var selFilePath = $("#oclife_filesGroup").val();

        if(selFilePath.substr(selFilePath.length - 1) === '/') {
            $("#oclife_allfiles_tags").tokenfield('enable');
            $("#oclife_selfiles_tags").tokenfield('disable');
        } else {
            $("#oclife_allfiles_tags").tokenfield('disable');
            $("#oclife_selfiles_tags").tokenfield('enable');
        }
        
        populateFileInfo(selFilePath);
    });

    $("#oclife_infos").dialog({
        autoOpen: false,
        width: 600,
        height: 400,
        modal: true,

        close: function() {
            $('.token').remove();
            $('#oclife_tags').off('tokenfield:createdtoken');
            $('#oclife_tags').off('tokenfield:removedtoken');
        }
    });

    $("#oclife_tagGroup").dialog({
        autoOpen: false,
        width: 640,
        height: 600,
        modal: true,

        close: function() {
            $('#oclife_selfiles_tags').off('tokenfield:createdtoken');
            $('#oclife_selfiles_tags').off('tokenfield:removedtoken');
            $('#oclife_allfiles_tags').off('tokenfield:createdtoken');
            $('#oclife_allfiles_tags').off('tokenfield:removedtoken');
        }
    });
    
    $("#oclife_infosData").tabs();
    
    //tag button will be permanent if tags exists.
    
    


    var oldHash = window.location.href;
    if (oldHash.indexOf("files") != -1) {
        var interval = setInterval(function () {
            tagPermanent(0, document.getElementById("fileList").childElementCount);
            clearInterval(interval);
        }, 1000);


        var cec = document.getElementById("fileList").childElementCount;
        var detect = function () {
            if (oldHash != window.location.href) {
                cec = document.getElementById("fileList").childElementCount;
                tagPermanent(cec, document.getElementById("fileList").childElementCount);
            }
            if (document.getElementById("fileList").childElementCount > cec) {
                //var a= FileList.files;
                tagPermanent(cec, document.getElementById("fileList").childElementCount);
                cec = document.getElementById("fileList").childElementCount;
            }
            oldHash = window.location.href;
        };
        setInterval(function () {
            detect();
            
        }, 1000);
    }

});
 

function tagPermanent(n,m) {   
        var tbody=document.getElementById("fileList");
        if(tbody.childElementCount>0) {
            var fajlovi=new Array();
            var skupid=new Array();
            if(n<=20) n=0;
            for(var i=0;i<tbody.childElementCount;i++) {
                if(tbody.childNodes[i].getAttribute("data-type")!="dir") {
                    skupid.push(i);
                    fajlovi.push(tbody.childNodes[i].getAttribute("data-id"));
                }
            }
            
        $.ajax({
        url: OC.filePath('oclife', 'ajax', 'FilesTags.php'),
        async: false,
        timeout: 2000,

        data: {
            id: JSON.stringify(fajlovi)
        },

        success: function(result) {              
           var niz=JSON.parse(result); 
           for(i=0;i<niz.length;i++) {
            if(niz[i]) postTagSing("1",skupid[i]);
            else postTagSing("",skupid[i]);
            }
        },
        error: function (xhr, status) {
            (t('oclife', 'Unable to get actual tags for this document! Ajax error!'));
        },
        type: "POST"
        });   
    }
}


function postTagSing(niz,i) {
   var tbody=document.getElementById("fileList");
   var k;
   if(tbody.childNodes[i].childNodes[0].childNodes[2].className=="name") k=2;
   else k=3;
   //var tb= tbody.childNodes[i].childNodes[0].childNodes[2].childNodes[1].childNodes[1];  
   var tb=tbody.childNodes[i].childNodes[0].childNodes[k].childNodes[1].childNodes[1]
    if (niz == "") {
        tb.classList.remove("permanent");
        tb.style.position="";
        tb.style.left="";
    } 
    else {
        tb.classList.add("permanent");
        tb.style.position="relative";
        if((tbody.childNodes[i].getAttribute('data-mime')=="application/vnd.oasis.opendocument.text" || tbody.childNodes[i].getAttribute('data-mime')=="application/msword" || tbody.childNodes[i].getAttribute('data-mime')=="application/vnd.openxmlformats-officedocument.wordprocessingml.document") && tbody.childNodes[i].childNodes[0].childNodes[k].childNodes[1].childNodes[4].classList.length!=3) {
                tb.style.left="-370%";
        }
        else if((tbody.childNodes[i].getAttribute('data-mime')=="application/vnd.oasis.opendocument.text" || tbody.childNodes[i].getAttribute('data-mime')=="application/msword" || tbody.childNodes[i].getAttribute('data-mime')=="application/vnd.openxmlformats-officedocument.wordprocessingml.document") && tbody.childNodes[i].childNodes[0].childNodes[k].childNodes[1].childNodes[4].classList.length==3) {
                tb.style.left="-100%";
        }
        else if(tbody.childNodes[i].childNodes[0].childNodes[k].childNodes[1].childNodes[3].classList.length==3) {
            tb.style.left="-63%";
        }
        else {
           tb.style.left="-270%";
        }
        tbody.childNodes[i].onmouseover = function () {
            this.childNodes[0].childNodes[k].childNodes[1].childNodes[1].style.left = "0px";
        }

        tbody.childNodes[i].onmouseout = function () {
            if((this.getAttribute('data-mime')=="application/vnd.oasis.opendocument.text" || this.getAttribute('data-mime')=="application/msword" || this.getAttribute('data-mime')=="application/vnd.openxmlformats-officedocument.wordprocessingml.document") && this.childNodes[0].childNodes[k].childNodes[1].childNodes[4].classList.length!=3) {
                this.childNodes[0].childNodes[k].childNodes[1].childNodes[1].style.left="-350%";
            }
            else if((this.getAttribute('data-mime')=="application/vnd.oasis.opendocument.text" || this.getAttribute('data-mime')=="application/msword" || this.getAttribute('data-mime')=="application/vnd.openxmlformats-officedocument.wordprocessingml.document") && this.childNodes[0].childNodes[k].childNodes[1].childNodes[4].classList.length==3) {
                this.childNodes[0].childNodes[k].childNodes[1].childNodes[1].style.left="-100%";
            }   
            else if (this.childNodes[0].childNodes[k].childNodes[1].childNodes[3].classList.length == 3) {
                this.childNodes[0].childNodes[k].childNodes[1].childNodes[1].style.left = "-63%";
            }
            else {
                this.childNodes[0].childNodes[k].childNodes[1].childNodes[1].style.left = "-270%";
            }
        }
    }
}

//adding new tag to database
function handleTagAdd(eventData, selFileID) {
    var tagID = eventData.attrs.value;
    var tagLabel = eventData.attrs.label;
    var newTag = (tagID.toString() === tagLabel);
    
    
    //check if tag exist
    if(newTag) {
    $.ajax({
                url: OC.filePath('oclife', 'ajax', 'getExistingTag.php'),
                async: false,
                timeout: 2000,

                data: {
                   term: tagLabel
                    },

                success: function(data) {
                    var resArray = JSON.parse(data);
                    if(parseInt(resArray.result) > -1) 
                        {
                            tagID = parseInt(resArray.result);
                            newTag=false;
                            eventData.attrs.value=tagID;
                            $("span.token-label").last().text(resArray.name);
                        }                               
                    },
                error: function (xhr, status) {
                    updateStatusBar(t('oclife', 'Unable to get the tags! Ajax error.'));
                    }
    });
    }
       
    



    if(newTag) {
        var createNew = window.confirm(t('oclife', 'The tag "') + tagLabel + t('oclife', '" doesn\'t exist; would you like to create a new one?'));                                                        

        if(!createNew) {
            //zamenjeno za invalid da ne pamti bezveze
            $(eventData.relatedTarget).remove();
        } else {
            $.ajax({
                url: OC.filePath('oclife', 'ajax', 'tagOps.php'),
                async: false,
                timeout: 2000,

                data: {
                    tagOp: 'new',
                    parentID: -1,
                    tagName: tagLabel,
                    tagLang: "xx"
                },

                type: "POST",

                success: function(result) {
                    var resArray = JSON.parse(result);
                    if(resArray.result === 'OK') {
                        tagID = parseInt(resArray.key);
                        eventData.attrs.value=tagID;
                        newTag = false;                                                    
                    } else {
                        window.alert(t('oclife', 'Unable to create the tag! Ajax error.'));
                    }
                },

                error: function(xhr, status) {
                    window.alert(t('oclife', 'Unable to create the tag! Ajax error.'));
                    $(eventData.relatedTarget).addClass('invalid');
                }
            });
        }
    } 
    
    if(!newTag) {
        $.ajax({
            url: OC.filePath('oclife', 'ajax', 'tagsUpdate.php'),
            async: false,
            timeout: 1000,

            data: {
                op: 'add',
                fileID: JSON.stringify(selFileID),
                tagID: tagID
            },
            
            success:function(data) {
                //raise error if file is already taged with chosen tag
                
                var resArray = JSON.parse(data);
                if(!resArray.result) {
                    window.alert(('oclife', 'Tag')+" \""+$("span.token-label").last().text()+"\" "+t('oclife', 'already exists'));      
                    $(eventData.relatedTarget).remove();             
                }
                else if(resArray.result=="permission") {
                     window.alert(t('oclife', 'Unable to add the tag! Permission denied.'));
                     $(eventData.relatedTarget).remove(); 
                }
            },

            error: function (xhr, status) {
                window.alert(t('oclife', 'Unable to add the tag! Ajax error.'));
                $(eventData.relatedTarget).addClass('invalid');
            },

            type: "POST"});
    }
    tagPermanent();
}

function handleTagRemove(eventData, selFileID,filename) {
    $.ajax({
        url: OC.filePath('oclife', 'ajax', 'tagsUpdate.php'),
        async: false,
        timeout: 2000,

        data: {
            op: 'remove',
            fileID: JSON.stringify(selFileID),
            tagID: eventData.attrs.value.toString()
        },

        success: function(data) {
            if(JSON.parse(data).result==false) {
                alert(t('oclife', 'Unable to remove the tag! Database error.')); 
            }
        },

        error: function (xhr, status) {
            updateStatusBar(t('oclife', 'Unable to remove the tag! Ajax error.'));
        },

        type: "POST"});
    tagPermanent();
}

function showFileInfo(fileName) {
    
    var infoPreview = "";
    var basicInfoContent = "";
    var exifInfoContent = "";
    var fileID = -1;
    var directory = $('#dir').val();
    directory = (directory === "/") ? directory : directory + "/";

    $.ajax({
        url: OC.filePath('oclife', 'ajax', 'getFileInfo.php'),
        async: false,
        timeout: 2000,

        data: {
            filePath: directory + fileName
        },

        type: "POST",

        success: function( result ) {
            var jsonResult = JSON.parse(result);

            infoPreview = jsonResult.preview;
            basicInfoContent = jsonResult.infos;
            exifInfoContent = jsonResult.exif;
            fileID = jsonResult.fileid;
            
            // Prepare token fields
            $('#oclife_tags').tokenfield({
              autocomplete: {
                source:  function(request, response) {
                    $.ajax({
                            url: OC.filePath('oclife', 'ajax', 'getTagFlat.php'),
                            data: {
                                //term: request.term
                                term: request.term.toLowerCase()
                            },

                            success: function(data) {
                                var returnString = data;
                                var jsonResult = jQuery.parseJSON(returnString);
                                response(jsonResult);
                            },

                            error: function (xhr, status) {
                                updateStatusBar(t('oclife', 'Unable to get the tags! Ajax error.'));
                            }
                        });
                    },
                    minLength: 2,
                    delay: 200
              },
              showAutocompleteOnFocus: false
            }).data('bs.tokenfield').$input.on('autocompletefocus', function(e, ui){
                e.preventDefault();
                $(this).val(ui.item.label);
            });            
        },

        error: function( xhr, status ) {
            infoContent = t('oclife', 'Unable to retrieve informations on this file! Ajax error!');
        }
    });                                

    var dialogTitle =  t('oclife', 'Informations on') + ' "' + fileName + '"';
    $('#oclife_infos').dialog( "option", "title", dialogTitle );

    $.ajax({
        url: OC.filePath('oclife', 'ajax', 'getTagsForFile.php'),
        async: false,
        timeout: 2000,

        data: {
            id: fileID
        },

        success: function(data) {
            result=JSON.parse(data);
            var d=[],b=[],broj=0;
            for(var i=0;i<result.length;i++) {
                if(result[i].write) {
                    b.push(broj);
                }
                if(result[i].read) {
                    broj++;
                    d.push(result[i]);
                }
            }
            $('#oclife_tags').tokenfield('setTokens', d);
            var tokeni=document.getElementsByClassName("token");
            var j=0;
            for(var i=0;i<tokeni.length;i++) {
                if(i!=b[j]) {
                    if(tokeni[i].childElementCount==2)
                    tokeni[i].childNodes[1].remove();
                }
                else j++;
            }
            
        },

        error: function (xhr, status) {
            updateStatusBar(t('oclife', 'Unable to get actual tags for this document! Ajax error!'));
        },

        type: "POST"});

    // Install event handlers
    $('#oclife_tags').on('tokenfield:createdtoken', function(e) {
        $("#ui-id-5").empty();
        document.getElementById("oclife_tags-tokenfield").value="";
        handleTagAdd(e, fileID);
     });

    $('#oclife_tags').on('tokenfield:removedtoken', 
        function (e) {
            handleTagRemove(e, fileID,fileName);
        }
    );

    $('#oclife_preview').html(infoPreview);
    
    $('#basicInfoContent').html(basicInfoContent);
    
    $('#oclife_infos').dialog("open");
}

function showFileGroupInfo(files) {
    var filesList = JSON.stringify(files);
    var directory = $('#dir').val();
    directory = (directory === "/") ? directory : directory + "/";

    // Populate the select
    $('#oclife_filesGroup').html('');
    $('#oclife_filesGroup').append('<option value="' + directory + '" selected>' + t('oclife', 'All selected files') + '</option>');
    for(var iterator = 0; iterator < files.length; iterator++) {
        $('#oclife_filesGroup').append('<option value="' + directory + files[iterator].name + '">' + files[iterator].name + '</option>');
    }

    // Get multiple files attribute
    populateFileInfo(directory);

    // Opens the popup
    $("#oclife_allfiles_tags").tokenfield('enable');
    $("#oclife_selfiles_tags").tokenfield('disable');    
    $('#oclife_tagGroup').dialog("open");
}

function populateFileInfo(filePath) {
	// Get file infos
	var fileInfos = getFileInfo(filePath);
	
	$('#oclife_multiPreview').html(fileInfos.preview);
	$('#oclife_multInfosData').html(fileInfos.infos);
	
	$('#oclife_allfiles_tags, #oclife_selfiles_tags').tokenfield({
	  autocomplete: {
		source:  function(request, response) {
			$.ajax({
					url: OC.filePath('oclife', 'ajax', 'getTagFlat.php'),

					data: {
						term: request.term
					},

					success: function(data) {
						var returnString = data;
						var jsonResult = jQuery.parseJSON(returnString);
						response(jsonResult);
					},

					error: function (xhr, status) {
						updateStatusBar(p('oclife', 'Unable to get the tags! Ajax error.'));
					}
				});
			},
			minLength: 2,
			delay: 200                                                
	  },
	  showAutocompleteOnFocus: false
	});
			
	$('#oclife_allfiles_tags').data('bs.tokenfield').$input.on('autocompletefocus', function(e, ui){
		e.preventDefault();
		$(this).val(ui.item.label);
	});

	$('#oclife_selfiles_tags').data('bs.tokenfield').$input.on('autocompletefocus', function(e, ui){
		e.preventDefault();
		$(this).val(ui.item.label);
	});

	// Query to populate the tags
	var fileID = (fileInfos.fileID === -1) ? getSelectedFiles('id') : parseInt(fileInfos.fileID);
        var fileName = (fileInfos.fileID === -1) ? getSelectedFiles('name') : fileInfos.name;

	// Remove old event handler
	$('#oclife_selfiles_tags').off('tokenfield:createdtoken');
	$('#oclife_selfiles_tags').off('tokenfield:removedtoken');
	$('#oclife_allfiles_tags').off('tokenfield:createdtoken');
	$('#oclife_allfiles_tags').off('tokenfield:removedtoken');

	// Query for actual tags
	$.ajax({
		url: OC.filePath('oclife', 'ajax', 'getTagsForFile.php'),
		async: false,
		timeout: 2000,

		data: {
			id: JSON.stringify(fileID)
		},

		success: function(data) {
                    $('#oclife_allfiles_tags').tokenfield('setTokens', []);
                    $('#oclife_selfiles_tags').tokenfield('setTokens', []);
                        result=JSON.parse(data);
                        var d=[],b=[],broj=0;
                        for(var i=0;i<result.length;i++) {
                            if(result[i].write) {
                                b.push(broj);
                            }
                            if(result[i].read) {
                                broj++;
                                d.push(result[i]);
                            }
                        }
                        if(fileID instanceof Array) {
				$('#oclife_allfiles_tags').tokenfield('setTokens', d);
			} else {
				$('#oclife_selfiles_tags').tokenfield('setTokens', d);
			}
                        var tokeni=document.getElementsByClassName("token");
                        var j=0;
                        for(var i=0;i<tokeni.length;i++) {
                            if(i!=b[j]) {
                                if(tokeni[i].childElementCount==2)
                                tokeni[i].childNodes[1].remove();
                            }
                            else j++;
                        }
                        
                        
			
		},

		error: function (xhr, status) {
			updateStatusBar(p('oclife', 'Unable to get actual tags for this document! Ajax error!'));
		},

		type: "POST"});
			
	// Install event handlers
	$('#oclife_selfiles_tags').on('tokenfield:createdtoken', function(e) {
                $("#ui-id-5").empty();
                document.getElementById("oclife_selfiles_tags-tokenfield").value="";
		handleTagAdd(e, fileID);
	});

	$('#oclife_selfiles_tags').on('tokenfield:removedtoken', 
		function (e) {
			handleTagRemove(e, fileID,fileName);
		}
	);
	
	$('#oclife_allfiles_tags').on('tokenfield:createdtoken', function(e) {
                  $("#ui-id-5").empty();
                document.getElementById("oclife_allfiles_tags-tokenfield").value="";
		handleTagAdd(e, fileID);
	});
	
	$('#oclife_allfiles_tags').on('tokenfield:removedtoken', 
		function (e) {
			handleTagRemove(e, fileID,fileName);
		}
	);
}

function getFileInfo(filePath) {
    var result = new Object();
    
    $.ajax({
        url: OC.filePath('oclife', 'ajax', 'getFileInfo.php'),
        async: false,
        timeout: 2000,

        data: {
            filePath: filePath
        },

        type: "POST",

        success: function(ajaxResult) {
            var jsonResult = JSON.parse(ajaxResult);

            result.result = "OK";
            result.preview = jsonResult.preview;
            result.infos = jsonResult.infos;
            result.fileID = parseInt(jsonResult.fileid);
            },

        error: function (xhr, status) {
            result.result = "KO";
            result.preview = "";
            result.infos = "";
            result.fileID = -1;
        }
    });
    
    return result;
}

function getSelectedFiles(property) {
        var elements =Object.keys(FileList._selectedFiles).map(function (key) {return FileList._selectedFiles[key]});
        var files = [];
        for(var i=0;i<elements.length;i++) {
            var file = {
                id: elements[i].id,
                name: elements[i].name,
                mime: elements[i].mimetype,
                type: elements[i].type,
                size: elements[i].size,
                etag: elements[i].etag
            };


            if (property) {
                files.push(file[property]);
            } else {
                files.push(file);
            }
            
       }
  
    return files;

}
