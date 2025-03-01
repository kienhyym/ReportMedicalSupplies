define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/DanhMuc/TuyenDonVi/tpl/collection.html'),
    	schema 				= require('json!app/view/DanhMuc/TuyenDonVi/Schema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "tuyendonvi",
    	uiControl:{
    		fields: [
	    	     { 
	    	    	field: "id",label:"ID",width:250,readonly: true, visible:false
	    	     },
	    	     { field: "ma", label: "Mã", width:250},
		     	 { field: "ten", label: "Tên", width:250 },
		     	{ field: "mota", label: "Mô tả", width:250 },
		     ],
		     onRowClick: function(event){
		    	if(event.rowId){
		        		var path = this.collectionName + '/model?id='+ event.rowId;
		        		this.getApp().getRouter().navigate(path);
		        }
		    	
		    }
    	},
	    render:function(){
	    	 this.applyBindings();
	    	 return this;
    	},
    });

});