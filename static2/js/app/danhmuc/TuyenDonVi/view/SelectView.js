define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		//Gonrin = require('../../EthnicGroup/view/node_modules/gonrin');
        Gonrin = require('gonrin');

	var template = require('text!app/view/DanhMuc/TuyenDonVi/tpl/collection.html'),
		schema = require('json!schema/TuyenDonViSchema.json');

	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "tuyendonvi",
		//textField: "name",
		//valueField: "id",
		uiControl: {
			pagination: {
				pageSize: 30
			},
			fields: [{
					field: "id",
					label: "ID",
					width: "80px",
					readonly: true,
				},
				{
					field: "code",
					label: "Mã",
					width: "150px"
				},
				{
					field: "name",
					label: "Tên",
					width: "350px"
				}
			],
			onRowClick: function (event) {
				this.uiControl.selectedItems = event.selectedItems;
			},
		},
		render: function () {
			this.applyBindings();
			return this;
		},
	});

});