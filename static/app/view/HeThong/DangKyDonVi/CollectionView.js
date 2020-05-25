define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/DangKyDonVi/collection.html'),
    	schema 				= require('json!app/view/HeThong/DangKyDonVi/Schema.json');
    
    var TuyenDonViEnum = require('json!app/enum/TuyenDonViEnum.json');
    var TrangThaiDangKyDonViEnum = require('json!app/enum/TrangThaiDangKyDonViEnum.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "dangkydonvi",
    	fields: [
    	     { 
    	    	field: "id",label:"ID",visible:false
    	     },
	     	 { field: "donvi_ten", label: "Tên đơn vị"},
	     	 { 
	     		 field: "captren_id", 
	     		 label: "Cấp trên",
	     		 foreign: "captren",
	     		 foreignValueField: "id",
                 foreignTextField: "ten"
	     	 },
	     	 { field: "user_email", label: "Email"},
	     	 { field: "madangky", label: "Mã đăng ký"},
	     	 {
		     	   field: "donvi_tuyendonvi",
		     	   label: "Tuyến đơn vị",
		     	   foreignValues: TuyenDonViEnum,
	               foreignValueField: "value",
	               foreignTextField: "text"
		     	    
		     },
	     	 { field: "trangthai", label: "Trạng thái",
	     		foreignValues: TrangThaiDangKyDonViEnum,
                foreignValueField: "value",
                foreignTextField: "text"
            },
	     	
	     	{
	     	    "field": "user_name",
	     	    "visible": false
	     	  },
	     	  {
	     	    "field": "user_phone",
	     	    "visible": false
	     	  },
	     	  {
	     	    "field": "donvi_coquanchuquan",
	     	    "visible": false
	     	  },
	     	  {
	     	    "field": "donvi_diachi",
	     	    "visible": false
	     	  },
	     	  {
	     	    "field": "donvi_sodienthoai",
	     	    "visible": false
	     	  },
	     	  
	     	  {
	     	    "field": "donvi_id",
	     	    "visible": false
	     	  },
	     	  {
	     	    "field": "user_id",
	     	    "visible": false
	     	  }
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