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
            buttons: [
                // {
                //     name: "back",
                //     type: "button",
                //     buttonClass: "btn-default btn-sm btn-secondary",
                //     label: "TRANSLATE:Quay lại",
                //     command: function() {
                //         var self = this;
                //         Backbone.history.history.back();
                //     }
                // },
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
                    field: "date",
                    direction: "desc"
                }
            ],
            fields: [
                {
                    field: "stt",
                    label: "STT",
                    width:50,
                    template: function(rowData) {
                    return `
                            <div class="text-center">${rowData.stt}</div>
                        `;
                    },
                    
                    
                },
                {
                    field: "date",
                    label: "Thời gian báo cáo",
                    template: function(rowData) {
                        if (!!rowData.date) {
                            console.log(rowData)

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
                pageSize: 15
            },
        },
        render: function() {
            var self = this;
            self.$el.find('.xoaloc').unbind('click').bind('click',function(){
                self.getApp().getRouter().refresh();
            })

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
                console.log(value)
                filters = {
                    "$and": [
                        { "date": { "$gte": value } },
                        { "date": { "$lt": Number(value + 86400) } },
                        { "organization_id": { "$eq": currentUser.organization_id } }
                    ]
                };
                $col.data('gonrin').filter(filters);
            });
            return this;
        },
    });

});