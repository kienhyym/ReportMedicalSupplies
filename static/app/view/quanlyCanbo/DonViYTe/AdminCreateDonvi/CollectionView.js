define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/tpl/collection.html'),
    	schema 				= require('json!app/view/quanlyCanbo/DonViYTe/DonViYTeSchema.json');
	var CustomFilterView      = require('app/base/view/CustomFilterView');
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "donvi",
    	uiControl:{
    		fields: [
		     	{ field: "name", label: "Tên đơn vị"},
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
					field: "code", 
					label: "Mã đơn vị"
			   	},
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
		    pagination: {
	            	page: 1,
	            	pageSize: 20
	            },
		    onRowClick: function(event){
	    		if(event.rowId){
	    			this.getApp().getRouter().navigate("canbo/donvi/model?id="+ event.rowId);

	        	}
			},
			datatableClass:"table table-mobile",
			onRendered: function (e) {
		    	// gonrinApp().responsive_table();
			}
		    // onRendered: function (e) {
			// 	var self = this;
			// 	if (this.uiControl.dataSource == null || this.uiControl.dataSource.length<=0){
			// 		self.$el.find("#grid").hide();
			// 		self.getApp().getRouter().navigate("canbo/donvi/collection");
			// 	}
			// }
    	},
	    render: function () {
			var self = this;
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
			});
			var created_by = self.getApp().currentUser.id;
    		filter.render();
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = { "$and": [
					{"unsigned_name": {"$likeI":  gonrinApp().convert_khongdau(text) }},
					{"type_donvi": {"$eq": "donvinhanuoc" }}
				]};
				self.uiControl.filters = filters;
			}
			var filters_donvidangki = { "$and": [
				{"created_by": {"$eq":created_by  }},
				{"type_donvi": {"$eq": "donvinhanuoc"  }}
			]};
			self.uiControl.filters = filters_donvidangki;
    		self.applyBindings(); 		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						
						var filters = { "$and": [
							{"unsigned_name": {"$likeI":  gonrinApp().convert_khongdau(text) }},
							{"created_by": {"$eq":created_by  }},
							{"type_donvi": {"$eq": "donvinhanuoc"  }}
						]};
						$col.data('gonrin').filter(filters);
						
					}
				}
				self.applyBindings();
			});
			self.$el.find("table").addClass("table-hover");
			self.$el.find("table").removeClass("table-striped");
			self.applyBindings();
			return this;
		},
    	
    });

});