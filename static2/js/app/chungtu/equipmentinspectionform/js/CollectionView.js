define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/chungtu/equipmentinspectionform/tpl/collection.html'),
        schema = require('json!schema/EquipmentInspectionFormSchema.json');

    var CustomFilterView = require('app/base/view/CustomFilterView');


    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "equipmentinspectionform",
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
                    self.getApp().getRouter().navigate(self.collectionName + "/model");
                }
            },
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
                    label: "STT",
                    width: "30px",
                    template: function (rowData) {
                        if (!!rowData) {
                            return `
                                        <div>${rowData.stt}</div>
                                    `;
                        }
                        return "";
                    }
                },
                {
                    field: "name",
                    label: "Phiếu",
                    template: function (rowData) {
                        if (!!rowData) {
                            var utcTolocal = function (times, format) {
                                return moment(times * 1000).local().format(format);
                            }
                            if (rowData.status == "success"){
                                return `<div style="position: relative;">
                                            <div>${rowData.name} (Serial:${rowData.model_serial_number})</div>
                                            <div>Ngày kiểm tra:${utcTolocal(rowData.date, "DD/MM/YYYY")}</div>
                                            <div>Trạng thái:<label class="badge badge-success pt-0 pb-0">Tốt</label></div>
                                            <i style="position: absolute;bottom:0;right:0" class='fa fa-angle-double-right'></i>
                                        </div>
                                        `;
                            }
                            else{
                                return `    <div style="position: relative;">
                                            <div>${rowData.name} (Serial:${rowData.model_serial_number})</div>
                                            <div>Ngày kiểm tra:${utcTolocal(rowData.date, "DD/MM/YYYY")}</div>
                                            <div>Trạng thái:<label class="badge badge-danger pt-0 pb-0">không tốt</label></div>
                                            <i style="position: absolute;bottom:0;right:0" class='fa fa-angle-double-right'></i>
                                        </div>
                                    `;
                            }
                            
                        }
                        return "";
                    }
                },
            ],
            onRowClick: function (event) {
                if (event.rowId) {
                    var path = this.collectionName + '/model?id=' + event.rowId;
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
            
            var type = self.getApp().getRouter().getParam("type");
            var value = self.getApp().getRouter().getParam("value");
            console.log(value)
            if (type == "getbyID"){
                self.uiControl.filters = {"equipmentdetails_id":{"$eq":value}};
            }
            if(type == "getbyToday"){
                self.uiControl.filters ={
                    $and:[
                        {"date":{"$gt":Number(value)}},
                        {"date":{"$lt":Number(value)+86400}},
                    ]
                } ;
            }
            if(type == null){
                self.uiControl.filters =null
            }
            self.applyBindings();
            filter.on('filterChanged', function (evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        if (type == "getbyID"){
                            var filters = {
                                $and:[
                                    {"equipmentdetails_id":{"$eq":value}},
                                    {"name": { "$likeI": text }},
                                ]
                            }
                        }
                        if(type == "getbyToday"){
                            var filters = {
                                $and:[
                                    {"date":{"$gt":Number(value)}},
                                    {"date":{"$lt":Number(value)+86400}},
                                    {"name": { "$likeI": text }},
                                ]
                            }
                        }
                        if(type == null){
                            var filters = { "name": { "$likeI": text } };
                        }
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