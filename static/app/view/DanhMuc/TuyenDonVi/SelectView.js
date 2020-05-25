define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/DanhMuc/TuyenDonVi/tpl/collection.html'),
    	schema 				= require('json!app/view/DanhMuc/TuyenDonVi/Schema.json');
    
    return Gonrin.CollectionDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/canbo/api/v1/",
    	collectionName: "tuyendonvi",
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
				{ 
				field: "id",label:"ID",width:250,readonly: true, visible:false
				},
				// { field: "ma", label: "Mã", width:250},
				{ field: "ten", label: "Tên", width:250 },
		     	// { field: "mota", label: "Mô tả", width:250 },
		    ],
		    onRowClick: function(event){
				this.uiControl.selectedItems = event.selectedItems;
				var self = this;
				self.trigger("onSelected");
				self.close();
	    	},
    	},
    	render:function(){
			this.uiControl.orderBy = [{"field": "ma", "direction": "asc"}];
    		this.applyBindings();
    		return this;
    	},
    	
    });

});