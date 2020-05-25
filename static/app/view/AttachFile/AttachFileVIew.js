define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var itemTemplate = require('text!app/view/AttachFile/tpl/attachfile.html'),
        // template = '<input type="file" class="form-control d-none" id="upload_files" lang="vi" >',
        // '<input  type="file" class="form-control d-none" id="upload_files" lang="vi" accept="audio/*|video/*|image/*|MIME_type">'
        template = '<input type="file" class="form-control d-none" id="upload_files" lang="vi" accept="audio/*|video/*|image/*|MIME_type" >',
        itemSchema = require('json!app/view/AttachFile/SchemaAttachFile.json');

    if ($(window).width() <= 650) {
        itemTemplate = require('text!app/view/AttachFile/tpl/mobileattachfile.html');
    }
    var Compressor = require('../../../../vendor/compressor');
    return Gonrin.ItemView.extend({
        template: template,
        bindings: 'data-canlamsang-bind',
        modelSchema: itemSchema,
        tagName: 'tr',
        Arr_file: [],
        uiControl: {},
        render: function() {
            var self = this;
            this.applyBindings();
            self.registerView();
            self.$el.find("#upload_files").on("change", function(e) {
                self.Arr_file = [];
                self.process_upload_file();
            });
        },
        check_exist_image: function(id_image) {
            var self = this,
                exist = false;
            var viewData = self.viewData;
            if (!!viewData && (viewData.length > 0)) {
                viewData.forEach((iamge, index) => {

                    if (iamge.id == id_image) {
                        exist = true;
                    }
                });
            }
            return exist;
        },
        registerView: function() {
            var self = this;
            var name = self.model.get("name"),
                id = self.model.get("id"),
                link = self.model.get("link"),
                type = self.model.get("type");
            if (link && type && (type.includes("jpg") || type.includes("png"))) {
                self.$el.html(itemTemplate);
                var url_file = self.check_image(link);
                self.$el.find("#name_file").html(name + type).addClass(id);
                self.$el.find(".url_file button").addClass(id);
                self.trigger('load_image', "id");

            } else if (link) {
                //file la file doc/pdf/text/odt/..
                self.$el.html(itemTemplate);
                var url_file = self.check_image(link);
                self.$el.find("#name_file").html(name + type);
                self.$el.find(".url_file").attr("href", url_file).attr("target", "_blank");
                self.trigger('load_image', "id");

            } else {
                self.$el.find("#upload_files").click();
            }
            self.$el.find("#itemRemove").unbind("click").bind("click", function() {
                self.remove(true);
                self.trigger('remove', self.model.get("id"));
            });


        },
        process_upload_file: function() {
            var self = this;
            // var length_file = self.$el.find("#upload_files")[0].files.length;
            self.$el.find("#upload_files")[0].files[0]
                // var Arr_file = [];
                // for (var i = 1; i <= length_file; i++) {
            var file = self.$el.find("#upload_files")[0].files[0];
            self.getApp().showloading();
            if (!!file && file.type.match('image*')) {
                new Compressor(file, {
                    quality: 0.6,
                    success(result) {
                        self.function_upload_file(result);
                        
                        // Arr_file.push(data);
                        // console.log("ok");
                    },
                    error(err) {
                        self.getApp().hideloading();
                        self.getApp().notify("Không thể tải tệp lên hệ thống");
                    },
                });
            } else if (!!file && !file.type.match('image*')) {
                self.function_upload_file(file);
            } else {
                self.getApp().hideloading();
                self.getApp().notify("Vui lòng chọn đúng định dạng tệp");
                return;
            }
            // console.log(Arr_file);
            // if (i == length_file) {
            //     self.getApp().notify("Tải file thành công!");
            //     self.trigger('success', { data: self.Arr_file });
            // }
            // }
        },
        check_image: function(link) {
            var self = this;
            var url_image = ""

            if (!!link) {
                if (link.startsWith("https://somevabe.com/")) {
                    url_image = link;
                } else {
                    url_image = static_url + link;
                }
            }
            return url_image;
        },
        function_upload_file: function(result) {
            var self = this;
            var http = new XMLHttpRequest();
            var fd = new FormData();
            fd.append('file', result, result.name);
            http.open('POST', gonrinApp().serviceURL + '/api/v1/upload');
            var current_so = !!gonrinApp().data("current_so") ? gonrinApp().data("current_so").id : null;
            var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
            http.setRequestHeader("X-SO-CURRENT", current_so);
            http.setRequestHeader("X-USER-TOKEN", token);

            http.upload.addEventListener('progress', function(evt) {
                if (evt.lengthComputable) {
                    var percent = evt.loaded / evt.total;
                    percent = parseInt(percent * 100);

                }
            }, false);
            http.addEventListener('error', function() {
                self.getApp().hideloading();
                self.getApp().notify("Không tải được file lên hệ thống");
            }, false);
            http.onreadystatechange = function() {
                self.getApp().hideloading();
                if (http.status === 200) {
                    if (http.readyState === 4) {

                        var data_file = JSON.parse(http.responseText),
                            link, p, t;
                        // Arr_file.push(data_file);
                        var data = {
                            "id": data_file.id,
                            "name": data_file.name,
                            "type": data_file.extname,
                            "link": data_file.link
                        };
                        self.getApp().notify("Tải file thành công!");
                        self.trigger('success', { data: data });
                        // self.Arr_file.push(data);
                    }
                } else {
                    self.getApp().notify("Không thể file ảnh lên hệ thống");
                }
            };
            http.send(fd);
        },

    });

});