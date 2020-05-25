define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		// Gonrin				= require('../../EthnicGroup/view/node_modules/gonrin');
		Gonrin = require('gonrin');

	var template = require('text!app/danhmuc/Province/tpl/collection.html'),
	schema = require('json!schema/ProvinceSchema.json');
	var CustomFilterView = require('app/base/view/CustomFilterView');

	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "province",
		bindings: "data-province-bind",
		textField: "name",
		//    	valueField: "id",
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
				//	    	     { 
				//	    	    	field: "id",label:"ID",width:150,readonly: true, 
				//	    	     },
				{ field: "code", label: "Mã", width: 200 },
				{ field: "name", label: "Tên", width: 250 },
				//		     	{
				//    	        	 field: "nation_id", 
				//    	        	 label: "Quốc gia",
				//    	        	 foreign: "nation",
				//    	        	 foreignValueField: "id",
				//    	        	 foreignTextField: "name",
				//    	        	 width:250
				//    	         },
				//    	         { field: "nation", visible:false },
			],
			onRowClick: function (event) {
				this.uiControl.selectedItems = event.selectedItems;
			},
		},
		render: function () {

			var self = this;
			var filter = new CustomFilterView({
				el: self.$el.find("#grid_search"),
				sessionKey: self.collectionName + "_filter"
			});
			filter.render();

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var filters = {
					"$or": [
						{ "name": { "$likeI": text } },
					]
				};
				self.uiControl.filters = filters;
			}
			self.uiControl.orderBy = [{ "field": "name", "direction": "desc" }];
			self.applyBindings();

			filter.on('filterChanged', function (evt) {
				var $col = self.getCollectionElement();
				var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null) {
						var filters = {
							"$or": [
								{ "name": { "$likeI": text } },
							]
						};
						$col.data('gonrin').filter(filters);
					} else {
						//						self.uiControl.filters = null;
					}
				}
				self.uiControl.orderBy = [{ "field": "name", "direction": "desc" }];
				self.applyBindings();
			});
			return this;
		},

	});

});