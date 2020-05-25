define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    //Gonrin = require('../../EthnicGroup/view/node_modules/gonrin');

    var template = require('text!app/danhmuc/District/tpl/collection.html'),
        schema = require('json!schema/DistrictSchema.json');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "district",
        bindings: "data-district-bind",
        uiControl: {
            fields: [
                { field: "code", label: "Mã", width: 250 },
                { field: "name", label: "Tên", width: 250 },
                {
                    field: "province_id",
                    label: "Tỉnh thành",
                    foreign: "province",
                    foreignValueField: "id",
                    foreignTextField: "name",
                    width: 250
                },

            ],
            pagination: {
                page: 1,
                pageSize: 100
            },
            onRowClick: function (event) {
                if (event.rowId) {
                    var path = this.collectionName + '/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            }
        },
        render: function () {
            var self = this;
            var currentUser = this.getApp().currentUser;
            if (currentUser !== null && currentUser !== undefined && this.getApp().data("province_id") !== null && currentUser.organization.tuyendonvi_id >= 2 && currentUser.organization.tuyendonvi_id !== 10) {
                this.uiControl.filters = { "province_id": { "$eq": this.getApp().data("province_id") } };
            }
            self.uiControl.orderBy = [{ "field": "name", "direction": "desc" }];
            this.applyBindings();
            return this;
        }
    });
});