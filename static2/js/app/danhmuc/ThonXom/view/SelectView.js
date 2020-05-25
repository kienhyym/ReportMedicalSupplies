define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('../../EthnicGroup/view/node_modules/gonrin');
    
    var template 			= require('text!app/view/tpl/danhmuc/ThonXom/collection.html'),
    	schema 				= require('json!schema/ThonXomSchema.json');
    var CustomFilterView      = require('app/bases/views/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "thonxom",
		bindings:"data-thonxom-bind",
    	textField: "name",
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
    	],
    	uiControl:{
    		fields: [
    				 { field: "code", label: "Mã"},
    		     	 { field: "name", label: "Tên" },
    		     	{
    	            	 field: "wards_id", 
    	            	 label: "Xã/Phường",
    	            	 foreign: "wards",
    	            	 foreignValueField: "id",
    	            	 foreignTextField: "name",
    	           	 },
    		    ],
    		    onRowClick: function(event){
    	    		this.uiControl.selectedItems = event.selectedItems;
    	    	},
    	},
    	render:function(){
    		var currentUser = this.getApp().currentUser;
            if (this.getApp().data("wards_id") !== null) {
                this.uiControl.filters = { "wards_id": { "$eq": this.getApp().data("wards_id") } };
            }
    		this.uiControl.orderBy = [{"field": "name", "direction": "desc"}];
    		var self= this;
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
    		
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var query = { "$or": [
					{"name": {"$likeI": text }},
				]};
				var filters = {"$and": [
					{"wards_id": {"$eq": this.getApp().data("wards_id")}},
					query
				]};
    			self.uiControl.filters = filters;
    		}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var query = { "$or": [
							{"name": {"$likeI": text }},
						]};
						var filters = {"$and": [
							{"wards_id": {"$eq": this.getApp().data("wards_id")}},
							query
						]};
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