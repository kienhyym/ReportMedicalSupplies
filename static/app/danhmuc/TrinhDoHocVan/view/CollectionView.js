define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('../../EthnicGroup/view/node_modules/gonrin');
    
    var template 			= require('text!app/view/tpl/DanhMuc/TrinhDoHocVan/collection.html'),
    	schema 				= require('json!schema/TrinhDoHocVanSchema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "trinhdohocvan",
    	uiControl:{
    		fields: [
	    	     { field: "code", label: "Mã", width:250},
		     	 { field: "name", label: "Tên", width:250},
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