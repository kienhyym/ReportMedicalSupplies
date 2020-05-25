define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/DonVi/collection.html'),
    	schema 				= require('json!app/view/DanhMuc/DonVi/Schema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "donvi",
    	fields: [
    	     { 
    	    	field: "id",label:"ID",width:250,readonly: true, 
    	     },
	     	 { field: "ten", label: "Tên", width:250 },
	     	 { field: "ma", label: "Ma", width:250},
	     ],
	     
	     render:function(){
	    	 this.applyBindings();
	    	 return this;
    	},
    	onRowClick: function(event){
    		if(event.rowId){
        		var path = this.collectionName + '/model?id='+ event.rowId;
        		this.getApp().getRouter().navigate(path);
        	}
    	}
    });

});