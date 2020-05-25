define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		// Gonrin				= require('../../EthnicGroup/view/node_modules/gonrin');
		Gonrin = require('gonrin');

	var template = require('text!app/danhmuc/Wards/tpl/collection.html'),
		schema = require('json!schema/WardsSchema.json');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "wards",
		bindings: "data-wards-bind",
		uiControl: {
			fields: [
				{ field: "code", label: "Mã", width: 250 },
				{ field: "name", label: "Tên", width: 250 },
				{
					field: "district_id",
					label: "Quận Huyện",
					foreign: "district",
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
			//	    	 var currentUser = this.getApp().currentUser;
			//	    	 if (currentUser!==null && currentUser!== undefined && this.getApp().data("district_id") !== null &&  currentUser.organization.tuyendonvi_id >=3 && currentUser.organization.tuyendonvi_id!==10) {
			//                this.uiControl.filters = { "district_id": { "$eq": this.getApp().data("district_id") } };
			//             }
			self.uiControl.orderBy = [{ "field": "name", "direction": "desc" }];
			this.applyBindings();
			return this;
		}

	});

});