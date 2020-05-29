define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

        var template = require('text!app/baocaodonvi/tpl/collection.html'),
        schema = require('json!schema/ReportOrganizationSchema.json');

    var CustomFilterView = require('app/base/view/CustomFilterView');


    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "report_organization",
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
                        self.getApp().getRouter().navigate("/baocaodonvi/model");
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
            orderBy: [
                {
                    field: "created_at",
                    direction: "desc"
                }
            ],
            fields: [{
                    field: "date",
                    label: "Thời gian báo cáo",
                    template: function(rowData) {
                        if (!!rowData.date) {
                            return `
                                        <div>${ moment(rowData.date*1000).format("DD/MM/YYYY") }</div>
                                    `;
                        }
                        return "";
                    }
                },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = '/baocaodonvi/model?id=' + event.rowId;
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
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: this.collectionName + "_filter"
            });
            filter.render();
            var currentUser = gonrinApp().currentUser;

            if (!filter.isEmptyFilter()) {
                var filters;
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                if(gonrinApp().hasRole("admin")) {
                    filters = {"$and": [
                        { "code": { "$likeI": text } },
                    ]};
                } else {
                    filters = {"$and": [
                        { "code": { "$likeI": text } },
                        { "organization_id": {"$eq": currentUser.organization_id}}
                    ]};
                }
                self.uiControl.filters = filters;
            }
            var filterobj;
            if(gonrinApp().hasRole("admin")) {
            } else {
                filterobj = {"$and": [
                    { "organization_id": {"$eq": currentUser.organization_id}}
                ]};
            }
            self.uiControl.filters = filterobj;
            self.applyBindings();

            filter.on('filterChanged', function(evt) {
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