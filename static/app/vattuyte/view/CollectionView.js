define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

        var template = require('text!app/vattuyte/tpl/collection.html'),
        schema = require('json!schema/MedicalSuppliesSchema.json');

    var CustomFilterView = require('app/base/view/CustomFilterView');


    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "medical_supplies",
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-default btn-sm btn-secondary",
                    label: "TRANSLATE:Quay lại",
                    command: function() {
                        var self = this;
                        Backbone.history.history.back();
                    }
                },
                {
                    name: "CREATE",
                    type: "button",
                    buttonClass: "btn-success btn-sm",
                    label: "TRANSLATE:Tạo mới",
                    command: function() {
                        var self = this;
                        self.getApp().getRouter().navigate("/vattuyte/model");
                    },
                    visible: function () {
                        return (this.getApp().hasRole('admin') ===true);
                    },
                },
                // {
                //     name: "import",
                //     type: "button",
                //     buttonClass: "btn-info btn-sm imp",
                //     label: "TRANSLATE:Import",
                //     command: function () {
                //         var self = this;


                //     }
                // },
            ],
        }],
        uiControl: {
            orderBy: [{
                    field: "name",
                    direction: "asc"
                },
                {
                    field: "created_at",
                    direction: "desc"
                }
            ],
            fields: [
                {
                    field: "stt",
                    label: "STT"
                },
                // {
                //     field: "code",
                //     label: "Mã"
                // },
                {
                    field: "name",
                    label: "Tên trang thiết bị y tế",
                    // width: "30px",
                    // template: function(rowData) {
                    //     if (!!rowData) {
                    //         return `
                    //                     <div class='text-center pt-3'>${rowData.stt}</div>
                    //                 `;
                    //     }
                    //     return "";
                    // }
                },
                {
                    field: "unit",
                    label: "Đơn vị tính"
                },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = '/vattuyte/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }

            },
            pagination: {
                page: 1,
                pageSize: 100
            },
        },
        render: function() {
            var self = this;
            if (self.getApp().hasRole('admin') ===true){
                self.$el.find(".chonfile").show()
            }
            else{
                self.$el.find(".chonfile").hide()
            }
            self.$el.find("#chonfile").on("change", function () {
                var http = new XMLHttpRequest();
                var fd = new FormData();
                fd.append('file', this.files[0]);
                http.open('POST', '/api/v1/link_file_upload');
                http.upload.addEventListener('progress', function (evt) {
                    if (evt.lengthComputable) {
                        var percent = evt.loaded / evt.total;
                        percent = parseInt(percent * 100);
                    }
                }, false);
                http.addEventListener('error', function () {
                }, false);

                http.onreadystatechange = function () {
                    if (http.status === 200) {
                        if (http.readyState === 4) {
                            var data_file = JSON.parse(http.responseText), link, p, t;
                            self.getApp().notify("Tải lên thành công");
                            self.getApp().getRouter().refresh();
                        }
                    } else {
                        self.getApp().notify({ message: "Không thể tải tệp tin lên máy chủ, Có thể nội dung file sai" }, { type: "danger", delay: 1000 });
                        self.getApp().getRouter().refresh();
                    }
                };
                http.send(fd);
            });



            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: this.collectionName + "_filter"
            });
            filter.render();

            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = { "name": { "$likeI": text } };
                self.uiControl.filters = filters;
            }
            self.applyBindings();

            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = { "name": { "$likeI": text } };
                        $col.data('gonrin').filter(filters);
                    } else {
                        self.uiControl.filters = null;
                    }
                }
                self.applyBindings();
            });
            return this;
        },
    });

});