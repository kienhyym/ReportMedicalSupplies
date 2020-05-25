define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 		    = require('text!tpl/User/profile.html');
//    	schema 				= require('json!app/view/HeThong/User/Schema.json');
    var ChangePasswordView  = require('app/view/HeThong/User/ChangePasswordView');
    var AddressDialogView      = require('app/view/HeThong/User/Address/AddressDialogView');
    var ProfileDialogView      = require('app/view/HeThong/User/ProfileDialogView');
    
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: {},
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
                        command: function() {
                            Backbone.history.history.back();
                        }
                    },

                ],
            }],
    	render: function() {
            var self = this;
            this.applyBindings();
            var currentUser = this.getApp().currentUser;
    		if (!!currentUser) {
    			self.$el.find("#changepass").unbind("click").bind("click", function(){
    				var changepass = new ChangePasswordView();
    				changepass.dialog();
    				
    			});
    			
    			self.$el.find("#changeprofile").unbind("click").bind("click", function(){
    				var profile = new ProfileDialogView();
    				profile.dialog();
    				
    			});
    			
    			self.$el.find("#changeaddress").unbind("click").bind("click", function(){
    				var address = new AddressDialogView({"viewData":{"id":currentUser.id,"title":"Thông tin địa chỉ của người dùng"}});
    				address.dialog();
    				
                });
                if (!!currentUser.id && currentUser.id !== null && currentUser.id !== undefined ) {
                    self.$el.find(".manguoidung").text(currentUser.id);
                }
                if (!!currentUser.hoten && currentUser.hoten !== null && currentUser.hoten !== undefined ) {
                    self.$el.find(".hotenme").text(currentUser.hoten);
                }
                if (!!currentUser.email && currentUser.email !== null && currentUser.email !== undefined ) {
                    self.$el.find(".email").text(currentUser.email);
                }
                if (!!currentUser.phone && currentUser.phone !== null && currentUser.phone !== undefined ) {
                    self.$el.find(".sodienthoai").text(currentUser.phone);
                }
                
                
//    			$("#email").val(currentUser.email);
//    			if(!!currentUser.phone){
//    				$("#phone").val(currentUser.phone);
//    			}
//    			$("#changephone").click(function(){
//    				var phone = $("#phone").val();
//    				if(!!phone && phone.length>1){
//    					$.ajax({
//			    				url: (self.getApp().serviceURL || "")+'/user/changephone',
//			    				method: 'POST',
//			    				data: JSON.stringify({phone: phone}),
//			    				dataType: "json",
//			    			  	contentType: "application/json",
//			    			  	success: function(data) {
//			    			  		console.log(data);
//			    			  		self.getApp().notify("Cập nhật thành công");
//
//			    			  	},
//				    	    error: function (request, status, error) {
//				    	        self.getApp().notify(request.responseText);
//
//				    	    }
//			    			  	
//			    			});
//    				}
//    			});
//    			
//    			$("#changepass").click(function(){
//    				var pass = self.$el.find("#password").val();
//                    var newpass = self.$el.find("#newpassword").val();
//                    var confirm = self.$el.find("#confirm_password").val();
//                    
//                    if(!!newpass && newpass.length > 0 && newpass === confirm){
//                    	$.ajax({
//				    				url: (self.getApp().serviceURL || "")+'/user/changepw',
//				    				method: 'POST',
//				    				data: JSON.stringify({password: pass, newpassword: newpass, confirm:confirm}),
//				    				dataType: "json",
//				    			  	contentType: "application/json",
//				    			  	success: function(data) {
//				    			  		self.getApp().notify("Cập nhật thành công");
//				    			  	},
//	  				    	    error: function (request, status, error) {
//	  				    	        self.getApp().notify(request.responseText);
//
//	  				    	    }
//				    			  	
//				    			});
//                    }else{
//                    	self.getApp().notify("Mật khẩu mới không khớp với nhập lại mật khẩu mới");
//
//                    }
//    			});
    			
    		}else{
    			self.getApp().getRouter().navigate("/login");
    		}
    	},
    });

});