define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/danhmuc/EthnicGroup/tpl/collection.html'),
		schema = require('json!schema/EthnicGroupSchema.json');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "ethnicgroup",
		bindings: "data-ethnicgroup-bind",
		uiControl: {
			fields: [
				{ field: "code", label: "Mã", width: 250 },
				{ field: "name", label: "Tên", width: 250 },
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
			this.applyBindings();
			return this;
		},
	});

});