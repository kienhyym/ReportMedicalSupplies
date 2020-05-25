define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/DonVi/collection.html'),
    	schema 				= require('json!app/view/DanhMuc/DonVi/Schema.json');
    
    return Gonrin.DialogView.extend({
    	//selectedItems : [],  //[] may be array if multiple selection
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "donvi",
    	textField: "ten",
    	valueField: "id",
    	fields: [
    	     { 
    	    	field: "id",label:"ID",width:250,readonly: true, 
    	     },
	     	 { field: "ten", label: "Tên", width:250 },
	     	 { field: "diachi", label: "Địa chỉ", width:250},
	     	{ field: "tuyendonvi", visible:false},
	     	{ field: "ghichu",  visible:false},
	     	{ field: "vungmien",  visible:false},
	     	{ field: "diachi",  visible:false},
	    ],
	    onRowClick: function(event){
    		this.selectedItems = event.selectedItems;
    	},
    });

});