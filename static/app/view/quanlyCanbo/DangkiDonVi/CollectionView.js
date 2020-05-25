define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/view/quanlyCanbo/DangkiDonVi/tpl/collection.html'),
		schema = require('json!app/view/quanlyCanbo/DangkiDonVi/SchemaDonviDangki.json');
	var CustomFilterView      = require('app/base/view/CustomFilterView');


	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/canbo/api/v1/",
		collectionName: "donvidangki",
		tools: [
		],
		uiControl: {
			orderBy:[
				{ field: "trangthai", direction: "asc" }
			],
			fields: [
				{ field: "donvi_ten", label: "Tên đơn vị"},
				// { field: "donvi_email", label: "Email"},
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
				{
					field: "trangthai",
					label: "Trạng thái",
					template: (rowData) => {
						if (rowData.trangthai === 0) {
							return `<div class = "text-primary" > Tạo mới</div>`;
						}
						else if (rowData.trangthai === 1) {
							return `<div style = "color:red"> Không duyệt</div>`;
						} 
						else if (rowData.trangthai === 2) {
							return `<div class = "text-success"> Đã duyệt</div>`;
						}
						else {
							return '';
						}
					}

				},
			],
			datatableClass:"table table-mobile",
			onRowClick: function (event) {
				if (event.rowId) {
					var path = 'canbo/donvidangki/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			},
			onRendered: function (e) {
		    	//gonrinApp().responsive_table();
			}
		},
		render: function () {
			var self = this;
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
			});
			var captren_id = self.getApp().currentUser.donvi_id;
    		filter.render();
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"tenkhongdau": {"$likeI":  gonrinApp().convert_khongdau(text) }};
    			self.uiControl.filters = filters;
			}
			var filters_donvidangki = {"captren_id": {"$eq":captren_id  }};
			self.uiControl.filters = filters_donvidangki;
    		self.applyBindings(); 		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						
						var filters = { "$and": [
							{"tenkhongdau": {"$likeI":  gonrinApp().convert_khongdau(text) }},
							{"captren_id": {"$eq":captren_id  }}
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