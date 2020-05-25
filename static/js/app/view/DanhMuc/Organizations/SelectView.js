define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/DanhMuc/Organizations/tpl/collection.html'),
	schema 				= require('json!app/view/DanhMuc/Organizations/Schema.json');

    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "organizations",
    	textField: "name",
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
	    	     { field: "code", label: "Mã"},
		     	 { field: "name", label: "Tên"},
		     	{ field: "address", label: "Địa chỉ"},
		     	{ field: "description", label: "Mô tả"},
		    ],
		    onRowClick: function(event){
	    		this.uiControl.selectedItems = event.selectedItems;
	    	},
    	},
    	render:function(){
    		var self= this;
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: "organizations_filter"
    		});
    		filter.render();
    		self.uiControl.orderBy = [{"field": "name", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = { "$or": [
					{"code": {"$likeI": text }},
					{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }},
					{"address": {"$likeI": text }}
				] };
    			self.uiControl.filters = filters;
    		}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = { "$or": [
							{"code": {"$likeI": text }},
							{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }},
							{"address": {"$likeI": text }}
						] };
						$col.data('gonrin').filter(filters);
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