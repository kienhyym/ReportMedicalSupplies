define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!tpl/User/model.html'),
    	schema 				= require('json!app/view/HeThong/User/Schema.json');
    var DonViSelectView = require('app/view/HeThong/DonVi/SelectView');
    var RoleSelectView = require('app/view/HeThong/Role/SelectView');
    
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "user",
    	tools : [
 	    	    {
 	    	    	name: "defaultgr",
 	    	    	type: "group",
 	    	    	groupClass: "toolbar-group",
 	    	    	buttons: [
 						{
 							name: "back",
 							type: "button",
 							buttonClass: "btn-default btn-sm",
 							label: "TRANSLATE:BACK",
 							command: function(){
 								var self = this;
 								
 								Backbone.history.history.back();
 				                //self.getApp().getRouter().navigate(self.collectionName + "/collection");
 							}
 						},
 						{
 			    	    	name: "save",
 			    	    	type: "button",
 			    	    	buttonClass: "btn-success btn-sm",
 			    	    	label: "TRANSLATE:SAVE",
 			    	    	command: function(){
 			    	    		var self = this;
 			    	    		var id = this.model.get("id");
 			    	    		if(id === null || id === undefined || !id){
 			    	    			var userInfo = {};
 		 			       			userInfo.user_id = null;
 		 			       			userInfo.id = null;
 		 			       			userInfo.email = self.model.get('email');
 		 			       			userInfo.hoten = self.model.get('name');
 		 			       			userInfo.dienthoai = self.model.get('phone');
 		 			       			var arrUser = [];
 		 			       			arrUser.push(userInfo);
 		 			       			self.model.set('userinfo', arrUser);
 			    	    		}
 			    	    		
 			                    self.model.save(null,{
 			                        success: function (model, respose, options) {
 			                        	var donvi_id = self.getApp().getRouter().getParam("donvi_id");
 			                            self.getApp().notify("Save successfully");
 			                            if(donvi_id){
 			                            	Backbone.history.history.back();
 			                            }else{
 			                            	self.getApp().getRouter().navigate(self.collectionName + "/collection");
 			                            }
 			                            
 			                        },
 			                       error: function (xhr, status, error) {
 						            	self.getApp().hideloading();
 										try {
 											if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
 												self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
 												self.getApp().getRouter().navigate("login");
 											} else {
 										  	self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
 											}
 										}
 										catch (err) {
 										  self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
 										}
 									}
 			                    });
 			    	    	}
 			    	    },
 						{
 			    	    	name: "delete",
 			    	    	type: "button",
 			    	    	buttonClass: "btn-danger btn-sm",
 			    	    	label: "TRANSLATE:DELETE",
 			    	    	visible: function(){
 			    	    		return this.getApp().getRouter().getParam("id") !== null;
 			    	    	},
 			    	    	command: function(){
 			    	    		var self = this;
 			                    self.model.destroy({
 			                        success: function(model, response) {
 			                        	
 			                            self.getApp().getRouter().navigate(self.collectionName + "/collection");
 			                        },
 			                       error: function (xhr, status, error) {
 										try {
 											if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
 												self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
 												self.getApp().getRouter().navigate("login");
 											} else {
 										  	self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
 											}
 										}
 										catch (err) {
 										  self.getApp().notify({ message: "Xóa thông tin không thành công"}, { type: "danger", delay: 1000 });
 										}
 									}
 			                    });
 			    	    	}
 			    	    },
 	    	    	],
 	    	    }],
	 	uiControl: [
				{
					  field:"donvi",
					  uicontrol: "ref",
					  textField: "ten",
					  //valueField: "value",
					  foreignRemoteField: "id",
					  foreignField: "donvi_id",
					  dataSource: DonViSelectView,
				},
				{				
					field:"roles",
					label:"Vai trò",
					uicontrol:"ref",
					textField: "name",
					selectionMode: "multiple",
					dataSource: RoleSelectView
					},
	 	],
    	render:function(){
    		var self = this;
    		var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			//progresbar quay quay
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
    			var donvi_id = this.getApp().getRouter().getParam("donvi_id");
    			if(donvi_id){
    				this.model.set('donvi_id', parseInt(donvi_id));
    			}
    			self.applyBindings();
    		}
    		
    	},
    });

});