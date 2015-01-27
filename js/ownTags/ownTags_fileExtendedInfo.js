$(document).ready(function(){
    // no versions actions in public mode
    // beware of https://github.com/owncloud/core/issues/4545
    // as enabling this might hang Chrome
    if($('#isPublic').val()){
        return;
    }
    
    var extInfoActionRegistered = false;

    // Add tags button to 'files/index.php'
    if(typeof FileActions !== 'undefined') {
            // Add action to tag a group of files
            $(".selectedActions").html(function(index, oldhtml) {
                if(oldhtml.indexOf("download") > 0) {
                    var tagIconPath = OC.imagePath('ownTags','icon_tag');
                    var newAction = "<a class=\"donwload\" id=\"tagGroup\">";
                    newAction += "<img class=\"svg\" src=\"" + tagIconPath + "\" alt=\"Tag group of file\" style=\"width: 17px; height: 17px; margin: 0px 5px 0px 5px;\" />";
                    newAction += t('ownTags', 'Tag selected files') + "</a>";
                    return newAction + oldhtml;
                } else {
                    return oldhtml;
                }
            });

            var infoIconPath = OC.imagePath('ownTags','icon_info');
            FileActions.register('file', t('ownTags', 'Tag'), OC.PERMISSION_UPDATE, infoIconPath, function(fileName) {
                // Action to perform when clicked
                if(scanFiles.scanning) { return; } // Workaround to prevent additional http request block scanning feedback

                showFileInfo(fileName);
        });
        
        extInfoActionRegistered = true;
    }

    // This is the div where informations will appears
    if(extInfoActionRegistered) {
        $('#content').append('<div id="ownTags_infos" title="' + t('ownTags', 'Tag') + '">\n\
            <div id="ownTags_infoData">\n\
            <table>\n\
            <tr>\n\
            <td id="ownTags_preview"></td>\n\
            <td style="vertical-align: top; padding: 10px;">\n\
            <div id="ownTags_infosData" style="width: 300px; height: 200px;">\n\
            <div id="basicInfoContent" style="height: 200px; overflow:scroll;"></div>\n\
            </div></td>\n\
            </tr>\n\
            </table>\n\
            </div>\n\
            <fieldset class="ownTags_tagsbox" id="ownTags_tags_container"><legend>Tags</legend>\n\
            <input type="text" class="form-control" id="ownTags_tags" placeholder="' + t('ownTags', 'Enter tags here') + '" min-width: 150px; />\n\
            </fieldset>\n\
            </div>');

        // This is the div where tag group will happens
        $('#content').append('<div id="ownTags_tagGroup" title="' + t('ownTags', 'Tag selected files') + '">\n\
            <fieldset class="ownTags_tagsbox"><legend>' + t('ownTags', 'File(s) where the tags will be applied') + '</legend>\n\
            <table style="margin: 5px;">\n\
            <tr>\n\
            <td id="ownTags_multiPreview"></td>\n\
            <td id="" style="vertical-align: top; padding: 10px;">\n\
            <select id="ownTags_filesGroup">\n\
            </select>\n\
            <div id="ownTags_multInfosData" />\n\
            </td>\n\
            </tr>\n\
            </table>\n\
            </fieldset>\n\
            <fieldset class="ownTags_tagsbox" id="ownTags_allfiles_tags_container"><legend>' + t('ownTags', 'Tags common to all files') + '</legend>\n\
            <input type="text" class="form-control" id="ownTags_allfiles_tags" placeholder="' + t('ownTags', 'Enter tags here') + '" min-width: 150px; />\n\
            </fieldset>\n\
            <fieldset class="ownTags_tagsbox" id="ownTags_selfiles_tags_container"><legend>' + t('ownTags', 'Tags for the selected file') + '</legend>\n\
            <input type="text" class="form-control" id="ownTags_selfiles_tags" placeholder="' + t('ownTags', 'Enter tags here') + '" min-width: 150px; />\n\
            </fieldset>\n\
            </div>');
    }
    
    // How to react when user click on "Tag group of file" button
    $( "#tagGroup" ).on( "click", function() {
        var files = getSelectedFiles();
        
        if(files.length === 1) {
            showFileInfo(files[0].name);
        } else {
            showFileGroupInfo(files);
        }        
    });

    $("#ownTags_filesGroup").on("change", function() {
        var selFilePath = $("#ownTags_filesGroup").val();

        if(selFilePath.substr(selFilePath.length - 1) === '/') {
            $("#ownTags_allfiles_tags").tokenfield('enable');
            $("#ownTags_selfiles_tags").tokenfield('disable');
        } else {
            $("#ownTags_allfiles_tags").tokenfield('disable');
            $("#ownTags_selfiles_tags").tokenfield('enable');
        }
        
        populateFileInfo(selFilePath);
    });

    $("#ownTags_infos").dialog({
        autoOpen: false,
        width: 600,
        height: 400,
        modal: true,

        close: function() {
            $('.token').remove();
            $('#ownTags_tags').off('tokenfield:createdtoken');
            $('#ownTags_tags').off('tokenfield:removedtoken');
        }
    });

    $("#ownTags_tagGroup").dialog({
        autoOpen: false,
        width: 640,
        height: 600,
        modal: true,

        close: function() {
            $('#ownTags_selfiles_tags').off('tokenfield:createdtoken');
            $('#ownTags_selfiles_tags').off('tokenfield:removedtoken');
            $('#ownTags_allfiles_tags').off('tokenfield:createdtoken');
            $('#ownTags_allfiles_tags').off('tokenfield:removedtoken');
        }
    });
    
    $("#ownTags_infosData").tabs();
});

//adding new tag to database
function handleTagAdd(eventData, selFileID) {
    var tagID = eventData.attrs.value;
    var tagLabel = eventData.attrs.label;
    var newTag = (tagID.toString() === tagLabel);
    
    
    //check if tag exist
    if(newTag) {
    $.ajax({
                url: OC.filePath('ownTags', 'ajax', 'getExistingTag.php'),
                async: false,
                timeout: 2000,

                data: {
                   term: tagLabel
                    },

                success: function(data) {
                    var resArray = jQuery.parseJSON(data);
                    if(parseInt(resArray.result) > -1) 
                        {
                            tagID = parseInt(resArray.result);
                            newTag=false;
                            eventData.attrs.value=tagID;
                            $("span.token-label").last().text(resArray.name);
                        }                               
                    },
                error: function (xhr, status) {
                    window.alert(t('ownTags', 'Unable to get the tags! Ajax error.'));
                    }
    });
    }
       
    



    if(newTag) {
        var createNew = window.confirm(t('ownTags', 'The tag "') + tagLabel + t('ownTags', '" doesn\'t exist; would you like to create a new one?'));                                                        

        if(!createNew) {
            //zamenjeno za invalid da ne pamti bezveze
            $(eventData.relatedTarget).remove();
        } else {
            $.ajax({
                url: OC.filePath('ownTags', 'ajax', 'tagOps.php'),
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
                    var resArray = jQuery.parseJSON(result);
                    if(resArray.result === 'OK') {
                        tagID = parseInt(resArray.key);
                        eventData.attrs.value=tagID;
                        newTag = false;                                                    
                    } else {
                        window.alert(t('ownTags', 'Unable to create the tag! Ajax error.'));
                    }
                },

                error: function(xhr, status) {
                    window.alert(t('ownTags', 'Unable to create the tag! Ajax error.'));
                    $(eventData.relatedTarget).addClass('invalid');
                    //$(eventData.relatedTarget).addClass('invalid');
                }
            });
        }
    } 
    
    if(!newTag) {
        $.ajax({
            url: OC.filePath('ownTags', 'ajax', 'tagsUpdate.php'),
            async: false,
            timeout: 1000,

            data: {
                op: 'add',
                fileID: JSON.stringify(selFileID),
                tagID: tagID
            },
            
            success:function(data) {
                //raise error if file is already taged with chosen tag
                var resArray = jQuery.parseJSON(data);
                if(!resArray.result) {
                    window.alert(t('ownTags', 'Tag')+" \""+$("span.token-label").last().text()+"\" "+t('ownTags', 'already exists'));
                    
                    $(eventData.relatedTarget).remove();
                    
                }
            },

            error: function (xhr, status) {
                window.alert(t('ownTags', 'Unable to add the tag! Ajax error.'));
                $(eventData.relatedTarget).addClass('invalid');
            },

            type: "POST"});
    }
}

function handleTagRemove(eventData, selFileID) {
    $.ajax({
        url: OC.filePath('ownTags', 'ajax', 'tagsUpdate.php'),
        async: false,
        timeout: 2000,

        data: {
            op: 'remove',
            fileID: JSON.stringify(selFileID),
            tagID: eventData.attrs.value.toString()
        },

        success: function(result) {
            if(!result) {
                window.alert(t('ownTags', 'Unable to remove the tag! Data base error.'));
            }
        },

        error: function (xhr, status) {
            window.alert(t('ownTags', 'Unable to remove the tag! Ajax error.'));
        },

        type: "POST"});
}

function showFileInfo(fileName) {
    var infoPreview = "";
    var basicInfoContent = "";
    var exifInfoContent = "";
    var fileID = -1;
    var directory = $('#dir').val();
    directory = (directory === "/") ? directory : directory + "/";

    $.ajax({
        url: OC.filePath('ownTags', 'ajax', 'getFileInfo.php'),
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
            $('#ownTags_tags').tokenfield({
              autocomplete: {
                source:  function(request, response) {
                    $.ajax({
                            url: OC.filePath('ownTags', 'ajax', 'getTagFlat.php'),
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
                                window.alert(t('ownTags', 'Unable to get the tags! Ajax error.'));
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
            infoContent = t('ownTags', 'Unable to retrieve informations on this file! Ajax error!');
        }
    });                                

    var dialogTitle =  t('ownTags', 'Informations on') + ' "' + fileName + '"';
    $('#ownTags_infos').dialog( "option", "title", dialogTitle );

    $.ajax({
        url: OC.filePath('ownTags', 'ajax', 'getTagsForFile.php'),
        async: false,
        timeout: 2000,

        data: {
            id: fileID
        },

        success: function(result) {
            $('#ownTags_tags').tokenfield('setTokens', JSON.parse(result));
        },

        error: function (xhr, status) {
            window.alert(t('ownTags', 'Unable to get actual tags for this document! Ajax error!'));
        },

        type: "POST"});

    // Install event handlers
    $('#ownTags_tags').on('tokenfield:createdtoken', function(e) {
        $("#ui-id-5").empty();
        document.getElementById("ownTags_tags-tokenfield").value="";
        handleTagAdd(e, fileID);
     });

    $('#ownTags_tags').on('tokenfield:removedtoken', 
        function (e) {
            handleTagRemove(e, fileID);
        }
    );

    $('#ownTags_preview').html(infoPreview);
    
    $('#basicInfoContent').html(basicInfoContent);

    if(exifInfoContent === "") {
        $('#exifInfoContent').html(t('ownTags', 'No EXIF informations on this file!'));
    } else {
        $('#exifInfoContent').html(exifInfoContent);
    }
    
    $('#ownTags_infos').dialog("open");
}

function showFileGroupInfo(files) {
    var filesList = JSON.stringify(files);
    var directory = $('#dir').val();
    directory = (directory === "/") ? directory : directory + "/";

    // Populate the select
    $('#ownTags_filesGroup').html('');
    $('#ownTags_filesGroup').append('<option value="' + directory + '" selected>' + t('ownTags', 'All selected files') + '</option>');
    for(var iterator = 0; iterator < files.length; iterator++) {
        $('#ownTags_filesGroup').append('<option value="' + directory + files[iterator].name + '">' + files[iterator].name + '</option>');
    }

    // Get multiple files attribute
    populateFileInfo(directory);

    // Opens the popup
    $("#ownTags_allfiles_tags").tokenfield('enable');
    $("#ownTags_selfiles_tags").tokenfield('disable');    
    $('#ownTags_tagGroup').dialog("open");
}

function populateFileInfo(filePath) {
	// Get file infos
	var fileInfos = getFileInfo(filePath);
	
	$('#ownTags_multiPreview').html(fileInfos.preview);
	$('#ownTags_multInfosData').html(fileInfos.infos);
	
	$('#ownTags_allfiles_tags, #ownTags_selfiles_tags').tokenfield({
	  autocomplete: {
		source:  function(request, response) {
			$.ajax({
					url: OC.filePath('ownTags', 'ajax', 'getTagFlat.php'),

					data: {
						term: request.term
					},

					success: function(data) {
						var returnString = data;
						var jsonResult = jQuery.parseJSON(returnString);
						response(jsonResult);
					},

					error: function (xhr, status) {
						window.alert(p('ownTags', 'Unable to get the tags! Ajax error.'));
					}
				});
			},
			minLength: 2,
			delay: 200                                                
	  },
	  showAutocompleteOnFocus: false
	});
			
	$('#ownTags_allfiles_tags').data('bs.tokenfield').$input.on('autocompletefocus', function(e, ui){
		e.preventDefault();
		$(this).val(ui.item.label);
	});

	$('#ownTags_selfiles_tags').data('bs.tokenfield').$input.on('autocompletefocus', function(e, ui){
		e.preventDefault();
		$(this).val(ui.item.label);
	});

	// Query to populate the tags
	var fileID = (fileInfos.fileID === -1) ? getSelectedFiles('id') : parseInt(fileInfos.fileID);

	// Remove old event handler
	$('#ownTags_selfiles_tags').off('tokenfield:createdtoken');
	$('#ownTags_selfiles_tags').off('tokenfield:removedtoken');
	$('#ownTags_allfiles_tags').off('tokenfield:createdtoken');
	$('#ownTags_allfiles_tags').off('tokenfield:removedtoken');

	// Query for actual tags
	$.ajax({
		url: OC.filePath('ownTags', 'ajax', 'getTagsForFile.php'),
		async: false,
		timeout: 2000,

		data: {
			id: JSON.stringify(fileID)
		},

		success: function(result) {
			$('#ownTags_allfiles_tags').tokenfield('setTokens', []);
			$('#ownTags_selfiles_tags').tokenfield('setTokens', []);
			
			if(fileID instanceof Array) {
				$('#ownTags_allfiles_tags').tokenfield('setTokens', JSON.parse(result));
			} else {
				$('#ownTags_selfiles_tags').tokenfield('setTokens', JSON.parse(result));
			}
		},

		error: function (xhr, status) {
			window.alert(p('ownTags', 'Unable to get actual tags for this document! Ajax error!'));
		},

		type: "POST"});
			
	// Install event handlers
	$('#ownTags_selfiles_tags').on('tokenfield:createdtoken', function(e) {
                $("#ui-id-5").empty();
                document.getElementById("ownTags_selfiles_tags-tokenfield").value="";
		handleTagAdd(e, fileID);
	});

	$('#ownTags_selfiles_tags').on('tokenfield:removedtoken', 
		function (e) {
			handleTagRemove(e, fileID);
		}
	);
	
	$('#ownTags_allfiles_tags').on('tokenfield:createdtoken', function(e) {
                  $("#ui-id-5").empty();
                document.getElementById("ownTags_allfiles_tags-tokenfield").value="";
		handleTagAdd(e, fileID);
	});
	
	$('#ownTags_allfiles_tags').on('tokenfield:removedtoken', 
		function (e) {
			handleTagRemove(e, fileID);
		}
	);
}

function getFileInfo(filePath) {
    var result = new Object();
    
    $.ajax({
        url: OC.filePath('ownTags', 'ajax', 'getFileInfo.php'),
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
    var elements=$('td.filename input:checkbox:checked').parent().parent();
    var files=[];
    elements.each(function(i,element) {
        var file={
            id:$(element).attr('data-id'),
            name:$(element).attr('data-file'),
            mime:$(element).data('mime'),
            type:$(element).data('type'),
            size:$(element).data('size'),
            etag:$(element).data('etag')
        };

        if(file.mime.indexOf('directory') === -1) {
            if(property) {
                files.push(file[property]);
            } else {
                files.push(file);
            }
        }
    });
    return files;
}
