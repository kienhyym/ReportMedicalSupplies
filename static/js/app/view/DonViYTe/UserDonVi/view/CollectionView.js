define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/view/DonViYTe/UserDonVi/tpl/collection.html'),
		schema = require('json!app/view/DonViYTe/UserDonVi/schema/UserSchema.json');
	var CustomFilterView      = require('app/bases/CustomFilterView');
	var UserDonViDialogView = require('app/view/DonViYTe/UserDonVi/view/ModelDialogView');
	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "user",
		datatableClass: "table table-hover",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "create",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:CREATE",
						command: function () {
							var self = this;
							var dialogUserDonViView = new UserDonViDialogView({"viewData": {"donvi":"","data":null,"accept":0}});
							self.$el.find("#content").empty();
							dialogUserDonViView.render();
							self.$el.find("#content").append(dialogUserDonViView.el);
						}
					}
				]
			}
		],
		uiControl: {
			orderBy:[
				{ field: "id", direction: "asc" }
			],
			fields: [
				{ field: "id", label: "ID"},
				{ field: "fullname", label: "Tên"},
				{ field: "email", label: "Email"},
				{ field: "phone_national_number", label: "Số điện thoại"},
				{ 
					field: "active", 
					label: "Trạng thái",
					template: (rowData) => {
						if(rowData.active == false) {
							return '<div class="text-danger">Đang bị khóa</div>';
						}
						return '';
					}
				}
			],
			onRowClick: function(event){
				// var self = this;
				if(event.rowId){
					var self = this;
					var dialogUserDonViView = new UserDonViDialogView({"viewData": {"donvi":"","data":event.rowData}});
					self.$el.find("#content").empty();
					dialogUserDonViView.render();
					self.$el.find("#content").append(dialogUserDonViView.el);
				}
			},
			datatableClass:"table table-mobile",
			onRendered: function (e) {
		    	gonrinApp().responsive_table();
			}
		},
		render: function () {
			var self = this;
            var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
			});
			var donvi_id = "";
			if (self.getApp().currentUser) {
				donvi_id = self.getApp().currentUser.donvi_id;
			}
    		filter.render();
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }};
    			self.uiControl.filters = filters;
			}
			var filters_donvidangki = {"donvi_id": {"$eq":donvi_id  }};
			self.uiControl.filters = filters_donvidangki;
    		self.applyBindings(); 		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						
						var filters = { "$and": [
							{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }},
							{"donvi_id": {"$eq":donvi_id  }}
						]};
						$col.data('gonrin').filter(filters);
						
					}
				}
				self.applyBindings();
			});
			self.$el.find("table").addClass("table-hover");
			self.$el.find("table").removeClass("table-striped");
			
			return this;
		},
	});

});