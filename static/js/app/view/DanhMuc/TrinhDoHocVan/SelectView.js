define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/DanhMuc/TrinhDoHocVan/collection.html'),
    	schema 				= require('json!app/view/DanhMuc/TrinhDoHocVan/Schema.json');
    var CustomFilterView      = require('app/bases/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "trinhdohocvan",
    	textField: "ten",
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
	    	     { field: "ma", label: "Mã", width:150},
		     	 { field: "ten", label: "Tên", width:250 },
		    ],
		    onRowClick: function(event){
	    		this.uiControl.selectedItems = event.selectedItems;
	    	},
    	},
    	render:function(){
    		var self= this;
    		var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
    		});
    		filter.render();
    		
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = { "$or": [
					{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }},
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
							{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }},
						] };
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