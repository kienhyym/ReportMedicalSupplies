define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/DanhMuc/Organizations/tpl/collection.html'),
    	schema 				= require('json!app/view/DanhMuc/Organizations/Schema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "organizations",
    	uiControl:{
    		fields: [
    			{ field: "code", label: "Mã"},
		     	 { field: "name", label: "Tên"},
		     	{ field: "address", label: "Địa chỉ"},
		     	{ field: "description", label: "Mô tả"},
		     ],
		     onRowClick: function(event){
		    	if(event.rowId){
		        		var path = this.collectionName + '/model?id='+ event.rowId;
		        		this.getApp().getRouter().navigate(path);
		        }
		    	
		    },
		    language:{
        		no_records_found:"Chưa có dữ liệu"
        	},
        	noResultsClass:"alert alert-default no-records-found",
        	datatableClass:"table table-mobile",
		    onRendered: function (e) {
		    	gonrinApp().responsive_table();
			}
    	},
	    render:function(){
	    	this.uiControl.orderBy = [{"field": "name", "direction": "asc"}];
	    	 this.applyBindings();
	    	 return this;
    	},
    });

});