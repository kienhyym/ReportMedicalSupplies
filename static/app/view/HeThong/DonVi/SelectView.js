define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/DonVi/collection.html'),
    	schema 				= require('json!app/view/HeThong/DonVi/Schema.json');
    
    var TuyenDonViSelectView = require('app/view/DanhMuc/TuyenDonVi/SelectView');
    
    return Gonrin.CollectionDialogView.extend({
    	
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "donvi",
    	textField: "ten",
//    	valueField: "id",
    	uiControl:{
    		fields: [
	    	     { 
	    	    	field: "id",label:"ID"
	    	     },
	    	     
		     	 { field: "ten", label: "Tên"},
		     	 
		     	{
		     	    field: "tuyendonvi",
		     	    uicontrol: "ref",
		     	    label: "Tuyến đơn vị",
		     	    dataSource: TuyenDonViSelectView,
		     	    foreignField: "tuyendonvi_id",
		     	    textField: "ten",
					foreignRemoteField: "id",
		     	    
		     	  },
		     	 { field: "email", label: "Email"},
		     	{ field: "ma", visible:false},
		     	 { field: "diachi", visible:false},
		     	{ field: "ghichu",  visible:false},
		     	{ field: "vungmien",  visible:false},
		     	{ field: "parent_id",  visible:false},
		     	{ field: "captren",  visible:false},
		     	{ field: "coquanchuquan",  visible:false},
		     	{ field: "sodienthoai",  visible:false},
		     	{ field: "tinhthanh_id",  visible:false},
		     	{ field: "tinhthanh",  visible:false},
//		     	{ field: "donvilienhe",  visible:false},
		     	{ field: "laysolieu",  visible:false},
		     	{ field: "users",  visible:false},
		    ],
		    onRowClick: function(event){
	    		this.uiControl.selectedItems = event.selectedItems;
	    	},
    	},
    	render:function(){
    		this.applyBindings();
    		return this;
    	},
    	
    });

});