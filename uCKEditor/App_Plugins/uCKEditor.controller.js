﻿angular.module("umbraco")
.controller("uCKEditor.uCKEditorController",
function ($scope, assetsService, dialogService, $log) {

    // Check whether the property editor's label should be hidden
    if ($scope.model.config.hideLabel == 1) {
        $scope.model.hideLabel = true;
    }

    // Tell the assetsService to load files required for the editor
    assetsService
    .loadJs([
        '/App_Plugins/uCKEditor/CKEditor/ckeditor.js',
    ])
        .then(function () {

            // Textaread ID used by the editor
            var editorTextAreaId = 'editorPlaceholder';

            // Assign a UniqueId for the textarea (in case there is more than one editor in the same form)
            var date = new Date();
            var uniqueID = "" + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
            $('#' + editorTextAreaId).attr('id', uniqueID);
            editorTextAreaId = uniqueID;

            // Create the CKEditor control
            var editor;

            // Loads plugin (UmbracoMedia, UmbracoEmbed, ...)
            if (CKEDITOR.config.plugins != null && CKEDITOR.config.plugins != 'undefined' && jQuery.trim(CKEDITOR.config.plugins) != '')
                CKEDITOR.config.plugins += ',umbracomedia,umbracomediatagging,umbracoembed';
            else
                CKEDITOR.config.plugins = 'umbracomedia,umbracomediatagging,umbracoembed';

            if ($scope.model.config.customConfigurationFile != null && jQuery.trim($scope.model.config.customConfigurationFile) != '') {
                // Create the editor using the custom configuration file
                editor = CKEDITOR.replace(editorTextAreaId, {
                    customConfig: $scope.model.config.customConfigurationFile
                });
            }
            else {
                // Create the editor using the other setting
                CKEDITOR.config.width = $scope.model.config.width;
                CKEDITOR.config.height = $scope.model.config.height;
                if ($scope.model.config.language != null && jQuery.trim($scope.model.config.language) != '') {
                    CKEDITOR.config.language = $scope.model.config.language;
                }
                if ($scope.model.config.font_names != null && jQuery.trim($scope.model.config.font_names) != '') {
                    CKEDITOR.config.font_names = $scope.model.config.font_names;
                }
                if ($scope.model.config.font_style != null && jQuery.trim($scope.model.config.font_style) != '') {
                    CKEDITOR.config.font_style = $scope.model.config.font_style;
                }
                if ($scope.model.config.format_tags != null && jQuery.trim($scope.model.config.format_tags) != '') {
                    CKEDITOR.config.format_tags = $scope.model.config.format_tags;
                }
                if ($scope.model.config.allowedContent != null && jQuery.trim($scope.model.config.allowedContent) != '') {
                    CKEDITOR.config.allowedContent = $scope.model.config.allowedContent;
                }
                if ($scope.model.config.extraAllowedContent != null && jQuery.trim($scope.model.config.extraAllowedContent) != '') {
                    CKEDITOR.config.extraAllowedContent = $scope.model.config.extraAllowedContent;
                }
                if ($scope.model.config.toolbar != null && jQuery.trim($scope.model.config.toolbar) != '') {
                    CKEDITOR.config.toolbar = eval("[['umbracomedia,umbracomediatagging,umbracoembed'], " + $scope.model.config.toolbar + ",]");
                }
                if ($scope.model.config.toolbarGroups != null && jQuery.trim($scope.model.config.toolbarGroups) != '') {
                    CKEDITOR.config.toolbarGroups = eval("[{name: 'umbraco', groups: ['umbraco']}, " + $scope.model.config.toolbarGroups + ",]");
                }
                if ($scope.model.config.removeButtons != null && jQuery.trim($scope.model.config.removeButtons) != '') {
                    CKEDITOR.config.removeButtons = $scope.model.config.removeButtons;
                }
                if ($scope.model.config.extraPlugins != null && jQuery.trim($scope.model.config.extraPlugins) != '') {
                    CKEDITOR.config.extraPlugins = $scope.model.config.extraPlugins;
                }
                if ($scope.model.config.removePlugins != null && jQuery.trim($scope.model.config.removePlugins) != '') {
                    CKEDITOR.config.removePlugins = $scope.model.config.removePlugins;
                }
                editor = CKEDITOR.replace(editorTextAreaId, CKEDITOR.config);
            }

            // If toolbars haven't been customized then add umbraco toolbar group to the default CKEditor toolbar
            if ((CKEDITOR.config.toolbarGroups == null || CKEDITOR.config.toolbarGroups == 'undefined' || jQuery.trim(CKEDITOR.config.toolbarGroups) == '') &&
                (CKEDITOR.config.toolbar == null || CKEDITOR.config.toolbar == 'undefined' || jQuery.trim(CKEDITOR.config.toolbar) == '')) {
                editor.ui.addToolbarGroup('umbraco', 0);
            }

            // Get the internal texteditor ID 
            var editorId = 'cke_' + editorTextAreaId;

            // Get UmbracoMedia plugin's button IDs
            var editorButtonMediaIdSelector = '#' + editorId + ' .cke_button__umbracomedia';

            // Hook the click event for the UmbracoMedia plugin's button
            $(document).on('click', editorButtonMediaIdSelector, function () {

                // Open Umbraco's media picker dialog
                dialogService.mediaPicker({
                    // Media picker dialog settings
                    onlyImages: true,
                    showDetails: true,

                    // Media picker callback
                    callback: function (data) {

                        // Check whether an image has been selected
                        if (data) {

                            // Selected image
                            var selectedImage = {
                                alt: data.altText,
                                src: (data.url) ? data.url : '/App_Plugins/uCKEditor/CKEditor/plugins/umbracomedia/images/noimage.png',
                                rel: data.id
                            };

                            // Create an html img tag with the picked image properties to insert into the editor
                            var htmlImage = editor.document.createElement('img');
                            htmlImage.setAttribute('src', selectedImage.src);
                            htmlImage.setAttribute('alt', selectedImage.alt);
                            editor.insertElement(htmlImage)
                        };
                    }
                });

            });



            // Get UmbracoEmbed plugin's button IDs
            var editorButtonEmbedIdSelector = '#' + editorId + ' .cke_button__umbracoembed';

            // Hook the click event for the UmbracoEmbed plugin's button
            $(document).on('click', editorButtonEmbedIdSelector, function () {

                // Open Umbraco's Embed dialog
                dialogService.embedDialog({

                    // Embed dialog callback
                    callback: function (data) {

                        // Insert embed element
                        if (data) {
                            var embedElement = CKEDITOR.dom.element.createFromHtml(data, editor.document);
                            editor.insertElement(embedElement);
                        };
                    }
                });
            });

            // Get UmbracoMediaTagging plugin's button IDs
            var editorButtonMediaTaggingIdSelector = '#' + editorId + ' .cke_button__umbracomediatagging';

            // Hook the click event for the UmbracoMediaTagging plugin's button
            $(document).on('click', editorButtonMediaTaggingIdSelector, function () {
                // Open Umbraco's media tagging picker dialog
                dialogService.open({
                    // Dialog
                    template: '/App_Plugins/MediaTagging/Dialog/_dialog.html',
                    show: true,
                    // Media tagging picker callback
                    callback: function (data) {
                        // Check whether an image has been selected
                        if (data) {
                            // Selected image
                            var selectedImage = {
                                alt: '',
                                src: (data.image) ? data.image : '/App_Plugins/uCKEditor/CKEditor/plugins/umbracomediatagging/images/noimage.png',
                                rel: data.id
                            };
                            // Create an html img tag with the picked image properties to insert into the editor
                            var htmlImage = editor.document.createElement('img');
                            htmlImage.setAttribute('src', selectedImage.src);
                            htmlImage.setAttribute('alt', selectedImage.alt);
                            editor.insertElement(htmlImage)
                        };
                    }
            });

            });

            // Set editor's value (when loading)
            editor.setData($scope.model.value);

            // Save editor's value (when submitting)
            $scope.$on("formSubmitting", function (ev, args) {
                $scope.model.value = editor.getData();
            });

            // Hook the destroy event in order to destroy the CKEditor instances
            $scope.$on("$destroy", function () {
                // Destroy all CKEditors
                for (var instanceName in CKEDITOR.instances) {
                    var instanceEditor = CKEDITOR.instances[instanceName];
                    if (instanceEditor) {
                        instanceEditor.destroy(true);
                        instanceEditor = null;
                    }
                }
            });
        });
});
