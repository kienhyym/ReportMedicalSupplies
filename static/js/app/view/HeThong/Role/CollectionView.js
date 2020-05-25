define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/HeThong/Role/tpl/collection.html'),
    	schema 				= require('json!app/view/HeThong/Role/Schema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "role",
    	uiControl:{
    		fields: [
	    	    //  { 
	    	    // 	field: "id",label:"ID",width:50,readonly: true, 
	    	    //  },
		     	 { field: "name", label: "Tên", width:70 },
		     	 { field: "description", label: "Mô tả", width:150 },
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
        	datatableClass:"table table-mobile"
    	},
	     
	     render:function(){
	    	 this.applyBindings();
	    	 return this;
    	},
    	
    });

});