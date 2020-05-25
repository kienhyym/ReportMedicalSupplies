define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!tpl/DangKyDonVi/model.html'),
    	schema 				= require('json!app/view/HeThong/DangKyDonVi/Schema.json');
    
    var TuyenDonViEnum = require('json!app/enum/TuyenDonViEnum.json');
    
    var TrangThaiDangKyDonViEnum = require('json!app/enum/TrangThaiDangKyDonViEnum.json');
    
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "dangkydonvi",
    	state: null,
    	
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
						label: "app.lang.back",
						command: function(){
							var self = this;
							if(self.progressbar){
  		    	    			self.progressbar.hide();
  		    	    		}
							Backbone.history.history.back();
			                //self.getApp().getRouter().navigate(self.collectionName + "/collection");
						}
					},
					{
		    	    	name: "save",
		    	    	type: "button",
		    	    	buttonClass: "btn-success btn-sm",
		    	    	label: "app.lang.save",
		    	    	command: function(){
		    	    		var self = this;
		    	    		if(self.progressbar){
  		    	    			self.progressbar.show();
  		    	    		}
		                    self.model.save(null,{
		                        success: function (model, respose, options) {
		                        	if(self.progressbar){
		  		    	    			self.progressbar.hide();
		  		    	    		}
		                            self.getApp().notify("Save successfully");
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
		    	    	label: "app.lang.delete",
		    	    	visible: function(){
		    	    		return this.getApp().getRouter().getParam("id") !== null;
		    	    	},
		    	    	command: function(){
		    	    		var self = this;
		    	    		self.progressbar.show();
		                    self.model.destroy({
		                        success: function(model, response) {
		                        	if(self.progressbar){
		  		    	    			self.progressbar.hide();
		  		    	    		}
		                            self.getApp().getRouter().navigate(self.collectionName + "/collection");
		                        },
		                        error: function (model, xhr, options) {
		                            //self.alertMessage("Something went wrong while processing the model", false);
		                            self.getApp().notify('Delete error');
		                            self.progressbar.hide();
		                        }
		                    });
		    	    	}
		    	    },
    	    	],
    	    },
    	    {
    	    	name: "exportgr",
    	    	type: "group",
    	    	groupClass: "toolbar-group",
    	    	buttons: [
					{
						name: "export",
						type: "button",
						buttonClass: "btn-warning btn-sm",
						label: "Tạo đơn vị và tài khoản theo đơn đăng ký",
						visible: function(){
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function(){
							var self = this;
							self.progressbar.show();
							var id = self.model.get('id');
							var url = "/dangky/exportdonvi?id="+ id;
							//
							$.ajax({
		    	 				url: url,
		    	 				success: function(data) {
		    	 					self.getApp().getRouter().navigate(self.collectionName + "/collection");
		    	 				},
		    	 				error: function (xhr, status, error) {
		    	 			       try {
		    	 			    	    var msgJson = $.parseJSON(xhr.responseText); 
		    	 			    	    if(msgJson){
		    	 			    	    	self.getApp().notify(msgJson.message);
		    	 			    	    }
		    	 			    	}
		    	 			    	catch(err) {
		    	 			    		self.getApp().notify("Error");
		    	 			    	}
		    	 			    	self.progressbar.hide();
		    	 			    }
		    	 			});
						}
					},   
    	    	]
    	    }
        ],
    	
    	UiControl:[
			{
				  field:"donvi_tuyendonvi",
				  uicontrol: "combobox",
				  textField: "text",
				  valueField: "value",
				  dataSource: TuyenDonViEnum,
			},
			{
				  field:"trangthai",
				  uicontrol: "combobox",
				  textField: "text",
				  valueField: "value",
				  dataSource: TrangThaiDangKyDonViEnum,
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
    			self.applyBindings();
    		}
    		
    	},
    });

});