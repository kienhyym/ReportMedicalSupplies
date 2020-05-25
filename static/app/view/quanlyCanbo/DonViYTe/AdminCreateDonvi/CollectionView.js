define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/tpl/collection.html'),
        schema = require('json!app/view/quanlyCanbo/DonViYTe/DonViYTeSchema.json'),
        TinhThanhSelectView = require("app/view/DanhMuc/TinhThanh/SelectView");
    var CustomFilterView = require('app/base/view/CustomFilterView');
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvi",
        id_tinhthanh: "",
        uiControl: {
            fields: [
                { field: "name", label: "Tên đơn vị" },
                {
                    field: "tinhthanh_id",
                    label: "Tỉnh thành",
                    foreign: "tinhthanh",
                    foreignValueField: "id",
                    foreignTextField: "ten",
                },
                {
                    field: "quanhuyen_id",
                    label: "Quận/Huyện",
                    foreign: "quanhuyen",
                    foreignValueField: "id",
                    foreignTextField: "ten",
                },
                {
                    field: "xaphuong_id",
                    label: "Xã/Phường",
                    foreign: "xaphuong",
                    foreignValueField: "id",
                    foreignTextField: "ten",
                },
                // {
                //     field: "madonvi_bmte",
                //     label: "Mã đơn vị"
                // },
                {
                    field: "active",
                    label: "Trạng thái",
                    template: (rowData) => {
                        if (rowData.active == 0) {
                            return '<div class="text-danger">Đang bị khóa</div>';
                        } else if (rowData.active == 1) {
                            return '<div class="text-success">Đang hoạt động</div>';
                        }
                        return '';
                    }
                }
            ],
            pagination: {
                page: 1,
                pageSize: 20
            },
            onRowClick: function(event) {
                if (event.rowId) {
                    this.getApp().getRouter().navigate("canbo/donvi/model?id=" + event.rowId);

                }
            },
            datatableClass: "table table-mobile",
            onRendered: function(e) {
                    //gonrinApp().responsive_table();
                }
                // onRendered: function (e) {
                // 	var self = this;
                // 	if (this.uiControl.dataSource == null || this.uiControl.dataSource.length<=0){
                // 		self.$el.find("#grid").hide();
                // 		self.getApp().getRouter().navigate("canbo/donvi/collection");
                // 	}
                // }
        },
        render: function() {
            var self = this;
            self.id_tinhthanh = "";
            self.$el.find("#Tinhthanh").ref({
                textField: "ten",
                valueField: "id",
                dataSource: TinhThanhSelectView,
            });
            self.$el.find("#Tinhthanh").on("change.gonrin", function() {
                self.id_tinhthanh = self.$el.find("#Tinhthanh").data("gonrin").getValue();
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                filters = {
                    "$and": [
                        { "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } },
                        { "tinhthanh_id": { "$eq": self.id_tinhthanh } }
                    ]
                };
                var $col = self.getCollectionElement();
                $col.data('gonrin').filter(filters);
            });
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            filter.model.set("text", "");
            self.uiControl.orderBy = [{ "field": "level", "direction": "asc" }, { "field": "name", "direction": "asc" }, { "field": "code", "direction": "asc" }];

            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = { "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } };
                self.uiControl.filters = filters;
            }
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters;
                        if (self.id_tinhthanh !== null && self.id_tinhthanh !== "") {
                            filters = {
                                "$and": [
                                    { "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                    { "tinhthanh_id": { "$eq": self.id_tinhthanh } }
                                ]
                            };
                        } else {
                            filters = {
                                "$and": [
                                    { "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } }
                                ]
                            };
                        }
                        $col.data('gonrin').filter(filters);
                        // self.uiControl.filters = filters_donvidangki;
                    } else {
                        if (self.id_tinhthanh !== null && self.id_tinhthanh !== "") {
                            filters = {
                                "$and": [
                                    { "tinhthanh_id": { "$eq": self.id_tinhthanh } }
                                ]
                            };
                            $col.data('gonrin').filter(filters);
                        }
                    }
                }
                self.applyBindings();
            });
            self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");
            self.applyBindings();
            return this;
        },

    });

});