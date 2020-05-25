define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/Donvi/createuser.html');
    
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
    	collectionName: "donvi",
    	render: function(){
    		var self = this;
    		var donvi_id = self.viewData.donvi_id;
    		self.$el.find('#btn_add_new_account').unbind('click').bind('click', function(){
    	       		var hoten = self.$el.find('[name=hoten]').val();
    	       		var phone = self.$el.find('[name=phone]').val();
    	       		var email = self.$el.find('[name=email]').val();
    	       		var macongdan = self.$el.find('[name=macongdan]').val();
    	       		var password = self.$el.find('[name=password]').val();
    	       		var confirm_password = self.$el.find('[name=confirm_password]').val();
    	       		if(phone === undefined || phone === ""){
    	       			self.getApp().notify("Số điện thoại không được bỏ trống");
    	       			return false;
    	       		}
//    	       		if(macongdan === undefined || macongdan === ""){
//    	       			self.getApp().notify("Mã công dân không được bỏ trống");
//    	       			return false;
//    	       		}
//    	       		if(email === undefined || email === ""){
//    	       			self.getApp().notify("Email không được bỏ trống");
//    	       			return false;
//    	       		}
    	       		if(password === undefined || password === "" || password !== confirm_password){
    	       			self.getApp().notify("Mật khẩu không khớp");
    	       			return false;
    	       		}
    	       		var data = JSON.stringify({
    	       	   		        hoten: hoten,
    	       	   		        phone:phone,
    	       	   		        email: email,
    	       	   		        macongdan:macongdan,
    	       	   		        password: password,
    	       	   		        password_confirm: confirm_password,
    	       	   		        donvi_id: donvi_id
    	       		});
    	       		
    	       		self.getApp().showloading();
    	       		var url_server = (self.getApp().serviceURL || "") + '/api/donvi/adduser/new';
    	       		$.ajax({
    	       		    url: url_server,
    	       		    type: 'POST',
    	       		    data: data,
    	       		    headers: {
    	    		    	'content-type': 'application/json'
    	    		    },
    	       		    dataType: 'json',
    	       		    success: function (data) {
    	       		    	self.getApp().hideloading();
    	       		    	self.getApp().notify("Thêm người dùng thành công");
    	       		    	self.close();
    	       		    	self.trigger("loaduser", "True");
    	       		    },
    	       		    error: function(request, textStatus, errorThrown) {
    	       		    	
    	       		    	try {
    	       		    		self.getApp().notify($.parseJSON(request.responseText).error_message);
    	       		    		}				  	  				    	
    	       		    	catch(err) {
    	       		    		self.getApp().notify(request);
    	       		    		}
    	       		    	self.getApp().hideloading();
    	       		    }
    	       		    
    	       		});
    	       		return false;
    		});
    		
    		self.$el.find('#btn_add_account_exist').unbind('click').bind('click', function(){
    			var account = self.$el.find('#account_exist').val().trim();
    			if (account===null || account === ''){
    				self.getApp().notify("Vui lòng nhập thông tin tài khoản");
    				return false;
    			}else{
    				var data = JSON.stringify({
       	   		       	account: account,
       	   		        donvi_id: donvi_id
		       		});
		       		
		       		self.getApp().showloading();
		       		var url_server = (self.getApp().serviceURL || "") + '/api/donvi/adduser/exist';
		       		$.ajax({
		       		    url: url_server,
		       		    type: 'POST',
		       		    data: data,
		       		    headers: {
		    		    	'content-type': 'application/json'
		    		    },
		       		    dataType: 'json',
		       		    success: function (data) {
		       		    	self.getApp().hideloading();
		       		    	self.getApp().notify("Thêm người dùng thành công");
		       		    	self.close();
		       		    	self.trigger("loaduser", "True");
		       		    },
		       		    error: function(request, textStatus, errorThrown) {
		       		    	
		       		    	try {
		       		    		self.getApp().notify($.parseJSON(request.responseText).error_message);
		       		    		}				  	  				    	
		       		    	catch(err) {
		       		    		self.getApp().notify(request);
		       		    		}
		       		    	self.getApp().hideloading();
		       		    }
		       		    
		       		});
    			}
    			return false;
    		});
    		
    		self.$el.find('#btn_cancel_account_exist').unbind('click').bind('click', function(){
    			self.close();
    			
    		});
    		self.applyBindings();
    		
    		return this;
    	}
    });

});