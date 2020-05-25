define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		// Gonrin				= require('../../EthnicGroup/view/node_modules/gonrin');
		Gonrin = require('gonrin');

	var template = require('text!app/danhmuc/Province/tpl/collection.html'),
		schema = require('json!schema/ProvinceSchema.json');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "province",
		bindings: "data-province-bind",
		uiControl: {
			fields: [
				{ field: "code", label: "Mã", width: 250 },
				{ field: "name", label: "Tên", width: 250 },
				{
					field: "nation_id",
					label: "Quốc gia",
					foreign: "nation",
					foreignValueField: "id",
					foreignTextField: "name",
					width: 250
				},
				{
					field: "nation",
					visible: false
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
			self.uiControl.orderBy = [{ "field": "name", "direction": "desc" }];
			this.applyBindings();
			return this;
		},

	});

});