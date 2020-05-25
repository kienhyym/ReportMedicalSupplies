define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/Role/collection.html'),
	schema 				= require('json!app/view/HeThong/Role/Schema.json');
    
    
    return Gonrin.CollectionDialogView.extend({
    	
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "role",
    	textField: "name",
    	uiControl:{
    		fields: [
				// { 
				// 	field: "id",label:"ID",width:50,readonly: false, 
				//  },	
				 { field: "name", label: "Tên", width:150 },
				 { field: "description", label: "Mô tả", width:150 },
		    ],
		    onRowClick: function(event){
				this.uiControl.selectedItems = event.selectedItems;
				var self = this;
				self.trigger("onSelected");
				self.close();
	    	},
    	},
    	render:function(){
    		this.applyBindings();
    		return this;
    	},
    	
    });

});