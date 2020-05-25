define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/DanhMuc/ThonXom/collection.html'),
    	schema 				= require('json!app/view/DanhMuc/ThonXom/Schema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "thonxom",
    	uiControl:{
	    	fields: [
	    	     { 
	    	    	field: "id",label:"ID",width:250,readonly: true, visible:false
	    	     },
		     	 
		     	 { field: "ma", label: "Mã", width:250},
		     	 { field: "ten", label: "Tên", width:250 },
		     	 {
	            	 field: "xaphuong_id", 
	            	 label: "Xã Phường",
	            	 foreign: "xaphuong",
	            	 foreignValueField: "id",
	            	 foreignTextField: "ten",
	           	 },
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
			    	//gonrinApp().responsive_table();
				}
    	},
	     render:function(){
	    	 this.uiControl.orderBy = [{"field": "ma", "direction": "asc"}];
	    	 this.applyBindings();
	    	 return this;
    	},
    	
    });

});