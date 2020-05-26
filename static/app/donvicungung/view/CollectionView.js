define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/donvicungung/tpl/collection.html'),
        schema = require('json!schema/OrganizationSchema.json');

    var CustomFilterView = require('app/base/view/CustomFilterView');


    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvi",
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                name: "back",
                type: "button",
                buttonClass: "btn-default btn-sm btn-secondary",
                label: "TRANSLATE:Quay lại",
                command: function () {
                    var self = this;
                    Backbone.history.history.back();
                }
            },
            {
                name: "CREATE",
                type: "button",
                buttonClass: "btn-success btn-sm",
                label: "TRANSLATE:Tạo mới",
                command: function () {
                    var self = this;
                    self.getApp().getRouter().navigate("/donvicungung/model");
                }
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
                field: "code",
                direction: "asc"
            },
            {
                field: "created_at",
                direction: "desc"
            }
            ],
            fields: [{
                field: "name",
                label: "Tên",
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
            ],
            onRowClick: function (event) {
                if (event.rowId) {
                    var path = '/donvicungung/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }

            },
            pagination: {
                page: 1,
                pageSize: 100
            },
        },
        render: function () {
            var self = this;
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: this.collectionName + "_filter"
            });
            filter.render();

            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = { "code": { "$likeI": text } };
                self.uiControl.filters = filters;
            }
            self.applyBindings();

            filter.on('filterChanged', function (evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = { "code": { "$likeI": text } };
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