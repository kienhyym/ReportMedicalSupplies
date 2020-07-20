define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
	var template 			= require('text!app/view/DanhMuc/NhomVatTu/tpl/collection.html'),
		schema 				= require('json!app/view/DanhMuc/NhomVatTu/Schema.json');
		
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "group_supplies",
    	uiControl:{
    		fields: [
	    	     { 
	    	    	field: "id",label:"ID",width:250,readonly: true, visible:false
	    	     },
	    	     { field: "code", label: "Mã", width:250},
		     	 { field: "name", label: "Tên", width:250 },
		     ],
		     onRowClick: function(event){
		    	if(event.rowId){
		        		var path = this.collectionName + '/model?id='+ event.rowId;
		        		this.getApp().getRouter().navigate(path);
		        }
		    	 //this.getApp().loading(); 
		    	 //this.getApp().alert("haha");
		    	
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
	    	 this.applyBindings();
	    	 return this;
    	},
    });

});