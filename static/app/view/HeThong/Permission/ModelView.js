define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!tpl/Permission/model.html'),
    	schema 				= require('json!app/view/HeThong/Permission/Schema.json');
    
    
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "permission",
    	state: null,
    	uiControl:[
    	    {
				field:"canread",
				uicontrol:"combobox",
				textField: "text",
                valueField: "value",
				dataSource: [
					{ value: true, text: "Có" },
					{ value: false, text: "Không" },
                ]
			},
			{
				field:"cancreate",
				uicontrol:"combobox",
				textField: "text",
                valueField: "value",
				dataSource: [
					{ value: true, text: "Có" },
					{ value: false, text: "Không" },
                ]
			},
			{
				field:"canupdate",
				uicontrol:"combobox",
				textField: "text",
                valueField: "value",
				dataSource: [
					{ value: true, text: "Có" },
					{ value: false, text: "Không" },
                ]
			},
			{
				field:"candelete",
				uicontrol:"combobox",
				textField: "text",
                valueField: "value",
				dataSource: [
                    { value: true, text: "Có" },
                    { value: false, text: "Không" },
                ]
			},
      	],
    	render:function(){
    		var self = this;
    		var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
        				self.applyBindings();
        			},
        			error:function(){
    					self.getApp().notify("Get data Eror");
    				},
        		});
    		}else{
    			self.applyBindings();
    		}
    		
    	},
    });

});