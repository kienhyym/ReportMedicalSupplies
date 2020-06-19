define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/baocaodonvi_cungung/tpl/collection.html'),
        schema = require('json!schema/ReportSupplyOrganizationSchema.json');

    var CustomFilterView = require('app/base/view/CustomFilterView');


    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "report_supply_organization",
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "CREATE",
                    type: "button",
                    buttonClass: "btn-success btn-sm",
                    label: "TRANSLATE:Tạo mới",
                    command: function () {
                        var self = this;
                        self.getApp().getRouter().navigate("/baocaodonvi_cungung/model");
                    }
                },
            ],
        }],
        uiControl: {
            orderBy: [
                {
                    field: "date",
                    direction: "desc"
                }
            ],
            fields: [
                {
                    field: "stt",
                    label: "STT",
                    width: 50,
                    template: function (rowData) {
                        return `
                            <div class="text-center">${rowData.stt}</div>
                        `;
                    },
                },
                {
                    field: "date",
                    label: "Thời gian báo cáo",
                    template: function (rowData) {
                        if (!!rowData.date) {
                            return `
                                        <div>${ moment(rowData.date * 1000).format("DD/MM/YYYY")}</div>
                                    `;
                        }
                        return "";
                    }
                },
            ],
            onRowClick: function (event) {
                if (event.rowId) {
                    var path = '/baocaodonvi_cungung/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }

            },
            pagination: {
                // page: 1,
                pageSize: 15
            },
        },
        render: function () {
            var self = this;
            self.$el.find('#grid_search_time').datetimepicker({
                textFormat: 'DD-MM-YYYY',
                extraFormats: ['DDMMYYYY'],
                parseInputDate: function (val) {
                    return moment.unix(val)
                },
                parseOutputDate: function (date) {
                    return date.unix()
                }
            });
            var currentUser = gonrinApp().currentUser;
            var filters;
            filters = {
                "$and": [
                    { "organization_id": { "$eq": currentUser.organization_id } }
                ]
            };
            self.uiControl.filters = filters;
            self.applyBindings();

            self.$el.find('#grid_search_time').blur(function (e) {
                var $col = self.getCollectionElement();

                var value = self.$el.find('#grid_search_time').data("gonrin").getValue();
                filters = {
                    "$and": [
                        { "date": { "$gte": value } },
                        { "date": { "$lt": value + 86400 } },
                        { "organization_id": { "$eq": currentUser.organization_id } }
                    ]
                };
                $col.data('gonrin').filter(filters);
            });
            return this;
        },
    });

});