define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/DonVi/lienhemodel.html'),
    	schema 				= require('json!app/view/HeThong/DonVi/LienHeSchema.json');
    
    return Gonrin.DialogView.extend({
    	//selectedItems : [],  //[] may be array if multiple selection
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "donvilienhe",
    	valueField: "id",
    	
    	//selectionMode: "multiple",
    	/*fields: [
    	     {
    	    	field: "donvi_id",
    	    	label:"ID",
    	    	onChange: function(e){
    	    		if(e.value){
    	    			this.model.set("productname", e.value.name);
    	    			this.model.set("codeproduct", e.value.code);
    	    		}
    	    	}
    	     },
    	     {
     	    	field: "unit",
     	    	label:"ID",
     	    	onChange: function(e){
     	    		//
     	    		var unit = e.value;
     	    		if(unit){
     	    			//var unitModel = 
     	    			//filter price here
     	    		}
     	    	}
     	     }
	    ]*/
    });

});