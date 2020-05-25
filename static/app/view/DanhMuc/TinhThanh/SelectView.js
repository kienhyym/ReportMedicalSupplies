define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/DanhMuc/TinhThanh/tpl/select.html'),
    	schema 				= require('json!app/view/DanhMuc/TinhThanh/Schema.json');
    var CustomFilterView      = require('app/base/view/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "tinhthanh",
    	textField: "ten",
//    	valueField: "id",
    	tools : [
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
		    	    	command: function(){
		    	    		var self = this;
		    	    		self.trigger("onSelected");
		    	    		var selected_items = self.uiControl.selectedItems;
		    	    		if(!!selected_items && selected_items.length>0){
		    	    			self.getApp().data("tinhthanh_id", selected_items[0]["id"]);
		    	    		}
		    	    		
		    	    		self.close();
		    	    	}
		    	    },
		    	    {
			    	    	name: "close",
			    	    	type: "button",
			    	    	buttonClass: "btn-default btn-sm",
			    	    	label: "TRANSLATE:CLOSE",
			    	    	command: function(){
			    	    		var self = this;
			    	    		self.close();
			    	    	}
			    	    },
    	    	]
    	    },
    	],
    	uiControl:{
    		fields: [
//	    	     { 
//	    	    	field: "id",label:"ID",width:150,readonly: true, 
//	    	     },
                // { field: "ma", label: "Mã", width: 200 },
		     	 { field: "ten", label: "Tên", width:250 },
//		     	{
//    	        	 field: "quocgia_id", 
//    	        	 label: "Quốc gia",
//    	        	 foreign: "quocgia",
//    	        	 foreignValueField: "id",
//    	        	 foreignTextField: "ten",
//    	        	 width:250
//    	         },
//    	         { field: "quocgia", visible:false },
		    ],
		    onRowClick: function(event){
				this.uiControl.selectedItems = event.selectedItems;
				var self = this;
				self.trigger("onSelected");
				var selected_items = self.uiControl.selectedItems;
				if(!!selected_items && selected_items.length>0){
					self.getApp().data("tinhthanh_id", selected_items[0]["id"]);
				}
				
				self.close();
	    	},
	    	onRendered: function (e) {
		    	//gonrinApp().responsive_table();
			}
    	},
    	render:function(){
//    		if (this.getApp().data("quocgia_id") !== null){
//    			this.uiControl.filters = {"quocgia_id": {"$eq": this.getApp().data("quocgia_id")}};
//    		}
    		
    		var self= this;
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
            self.uiControl.orderBy = [{ "field": "ten", "direction": "asc" }];
    		if(!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = {"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }};
    			self.uiControl.filters = filters;
    		}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }};
						$col.data('gonrin').filter(filters);
						//self.uiControl.filters = filters;
					} 
				}
				self.applyBindings();
    		});
            self.$el.find(".btn-default").hide();
    		return this;
    	},
    	
    });

});