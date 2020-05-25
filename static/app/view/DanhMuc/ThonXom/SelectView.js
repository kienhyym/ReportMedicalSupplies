define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/DanhMuc/ThonXom/collection.html'),
    	schema 				= require('json!app/view/DanhMuc/ThonXom/Schema.json');
    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "thonxom",
    	textField: "ten",
    	valueField: "id",
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
		    	    		self.close();
		    	    	}
		    	    },
    	    	]
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
    	],
    	uiControl:{
    		fields: [
    				 { field: "ma", label: "Mã", width:150},
    		     	 { field: "ten", label: "Tên", width:250 }
//    	    	     {
//        	        	 field: "xaphuong_id", 
//        	        	 label: "Xã phường",
//        	        	 foreign: "xaphuong",
//        	        	 foreignValueField: "id",
//        	        	 foreignTextField: "ten",
//        	        	 width:250
//        	         },
    		    ],
    		    onRowClick: function(event){
					this.uiControl.selectedItems = event.selectedItems;
					var self = this;
					self.trigger("onSelected");
					self.close();
    	    	},
    	    	onRendered: function (e) {
    		    	gonrinApp().responsive_table();
    			}
    	},
    	render:function(){
    		if (this.getApp().data("xaphuong_id") !== null){
    			this.uiControl.filters = {"xaphuong_id": {"$eq": this.getApp().data("xaphuong_id")}};
    		}
    		var self= this;
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
    		self.uiControl.orderBy = [{"field": "ma", "direction": "asc"}];
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