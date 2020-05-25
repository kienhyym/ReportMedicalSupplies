define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		//Gonrin = require('../../EthnicGroup/view/node_modules/gonrin');
        Gonrin = require('gonrin');

	var template = require('text!app/danhmuc/wards/tpl/collection.html'),
	schema = require('json!schema/WardsSchema.json');
	var CustomFilterView = require('app/base/view/CustomFilterView');

	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "wards",
		bindings: "data-wards-bind",
		textField: "name",
		valueField: "id",
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
				//    		     	{
				//        	        	 field: "district_id", 
				//        	        	 label: "Quận huyện",
				//        	        	 foreign: "district",
				//        	        	 foreignValueField: "id",
				//        	        	 foreignTextField: "name",
				//        	        	 width:250
				//        	         },
			],
			onRowClick: function (event) {
				this.uiControl.selectedItems = event.selectedItems;
			},
		},
		render: function () {
			var self = this;
			self.$el.find(".close").unbind('click').bind('click', function () {
				console.log("xxxxxxxxx")
				self.$el.find("#grid_search input").val("")
			})
			//    		var currentUser = this.getApp().currentUser;
			//	    	 if (this.getApp().data("district_id") !== null) {
			//               this.uiControl.filters = { "district_id": { "$eq": this.getApp().data("district_id") } };
			//            }
			self.uiControl.orderBy = [{ "field": "name", "direction": "desc" }];
			var filter = new CustomFilterView({
				el: self.$el.find("#grid_search"),
				sessionKey: self.collectionName + "_filter"
			});
			filter.render();

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var query = {
					"$or": [
						{ "name": { "$likeI": text } },
					]
				};
				//				var filters = {"$and": [
				//					{"district_id": {"$eq": this.getApp().data("district_id")}},
				//					query
				//				]};
				var filters = query;
				if (self.uiControl.filters !== null) {
					filters = {
						"$and": [
							self.uiControl.filters,
							query
						]
					};
				}
				self.uiControl.filters = filters;
			}
			self.applyBindings();

			filter.on('filterChanged', function (evt) {
				var $col = self.getCollectionElement();
				var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null) {
						var query = {
							"$or": [
								{ "name": { "$likeI": text } },
							]
						};
						var filters = query;
						if (self.uiControl.filters !== null) {
							filters = {
								"$and": [
									self.uiControl.filters,
									query
								]
							};
						}
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