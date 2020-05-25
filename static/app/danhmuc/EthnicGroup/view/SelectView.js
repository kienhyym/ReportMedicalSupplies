define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/danhmuc/EthnicGroup/tpl/collection.html'),
		schema = require('json!schema/EthnicGroupSchema.json');
	var CustomFilterView = require('app/base/view/CustomFilterView');

	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "ethnicgroup",
		bindings: "data-ethnicgroup-bind",
		textField: "name",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "select",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:SELECT",
						command: function () {
							var self = this;
							self.trigger("onSelected");
							self.close();
						}
					},
				]
			},
		],
		uiControl: {
			fields: [
				{ field: "code", label: "Mã", width: 150 },
				{ field: "name", label: "Tên", width: 250 },
			],
			onRowClick: function (event) {
				this.uiControl.selectedItems = event.selectedItems;
			},
		},
		render: function () {
			var self = this;
			var filter = new CustomFilterView({
				el: self.$el.find("#grid_search"),
				sessionKey: "Dantoc_filter"
			});
			filter.render();
			//data: {"q": JSON.stringify({"filters": filters, "order_by":[{"field": "time", "direction": "desc"}], "limit":1})},

			self.uiControl.orderBy = [{ "field": "code", "direction": "asc" }];
			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var filters = {
					"$or": [
						{ "code": { "$likeI": text } },
						{ "name": { "$likeI": text } },
					]
				};
				self.uiControl.filters = filters;
				self.uiControl.orderBy = [{ "field": "code", "direction": "asc" }];
			}
			self.applyBindings();

			filter.on('filterChanged', function (evt) {
				var $col = self.getCollectionElement();
				var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null) {
						var filters = {
							"$or": [
								{ "name": { "$likeI": text } },
								{ "code": { "$likeI": text } },
							]
						};
						$col.data('gonrin').filter(filters);
						//self.uiControl.filters = filters;
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