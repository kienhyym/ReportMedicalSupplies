define(function (require) {

    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin            	= require('gonrin'),
        storejs				= require('vendor/store'),
        tpl                 = require('text!tpl/base/Login.html'),
        template = _.template(tpl);
    return Gonrin.View.extend({
        render: function () {
        	var self = this;
        	storejs.set('X-USER-TOKEN', '');
        	self.getApp().currentUser = null;
        	self.getApp().data("current_so", null);
            this.$el.html(template());
            
//            var qrcode = self.getApp().getRouter().getParam("qr");
            var qrcode = self.getApp().getParameterUrl("qr", window.location.href);
//            if(qrcode !== undefined && qrcode!== null && qrcode !==""){
//            	this.$el.find("#msg_qrcode").html('Mã Qr "'+qrcode+'" chưa được gắn với sổ chăm sóc.');
//            }
            self.$el.find("#recover_account").unbind('click').bind('click', function(){
            	self.getApp().getRouter().navigate("recorver");
        	});
            self.$el.find("#login_accountkit").bind('click', function(){
            	if (self.getApp().isMobile === true){
            		self.getApp().showloading();
        			AccountKitPlugin.loginWithPhoneNumber({
            		    useAccessToken: true,
            		    defaultCountryCode: "VN",
            		  },function(res){
            			  gonrinApp().hideloading();
            			  gonrinApp().loginCallbackAccountKit(res);
            		  },function(err){
              		    console.log("accountkit failed res====",err);
              		    gonrinApp().hideloading();
            		});
        		}else{
        			try{
        				AccountKit.login(
          		    	      'PHONE', 
          		    	      {countryCode: "+84", phoneNumber: ""}, // will use default values if not specified
          		    	      gonrinApp().loginCallbackAccountKit
          		    	    );
        			}catch(ex){
        				console.log("accountkit failed res2222====",err);
              		    gonrinApp().hideloading();
        			}
        			
        		}
        	});
            self.$el.find("#register-btn").unbind('click').bind('click', function(){
            	if(qrcode !== undefined && qrcode!== null && qrcode !==""){
        			self.getApp().getRouter().navigate("dangky?qr="+qrcode);
                }else{
                	self.getApp().getRouter().navigate("dangky");
                }
                
        	});
            self.$el.find("#forget-password").unbind('click').bind('click', function(){
                self.getApp().getRouter().navigate("forgot");
        	});
            self.$el.find("input[name='optradio']").change(function(){
        		var check_user = self.$el.find("input[name='optradio']:checked").val();
            	console.log("value=",check_user);
        		if (check_user === 1 || check_user === "1"){
        			self.$el.find("#login_accountkit").hide();
        			self.$el.find(".create-account").hide();
        			
        		}else{
        			self.$el.find("#login_accountkit").show();
        			self.$el.find(".create-account").show();
        		}
        	});

            self.$el.find("#loginfacebook").unbind('click').bind('click',function(){
                var fbLoginSuccess = function (userData) {
                  facebookConnectPlugin.getAccessToken(function(token) {
                    console.log("Token: " + token);
                  });
                }

                facebookConnectPlugin.login(["public_profile"], fbLoginSuccess,
                  function (error) {
                    console.log(error)
                  }
                );
        	});
            
            this.$el.find("#login-form").unbind("submit").bind("submit", function(){
            	self.processLogin();
            	return false;
            });
            return this;
        },
       	processLogin: function(){
       		var self = this;
    		var user_type = self.$el.find("input[name='optradio']:checked").val();
       		var username = this.$('[name=username]').val();
       		var password = this.$('[name=password]').val();
      		// var qrcode = this.getApp().getRouter().getParam("qr");
       		if(username === undefined || username === "" || password === undefined || password === ""){
				  self.getApp().notify({ message: "Vui lòng nhập tài khoản và mật khẩu"}, { type: "danger", delay: 2000 });

       			return;
       		}
       		var qrcode = this.getApp().getParameterUrl("qr", window.location.href);
       		var data;
       		if(qrcode !== undefined && qrcode!== null && qrcode !==""){
       			data = JSON.stringify({
       		        data: username,
       		        password: password,
       		        qr: qrcode
       		    });
       		} else {
       			data = JSON.stringify({
       		        data: username,
       		        password: password
       		    });
       		}
       		
       		self.getApp().showloading();
       		var url_login = self.getApp().serviceURL+'/api/v1/login';
       		$.ajax({
       		    url: url_login,
       		    type: 'POST',
       		    data: data,
       		    headers: {
       		    	'content-type': 'application/json',
       		    	'Access-Control-Allow-Origin':'*'
       		    },
	       		beforeSend: function(){
	    		    $("#loading").removeClass("d-none");
	    		   },
       		    dataType: 'json',
       		    success: function (data) {
       		    	$.ajaxSetup({
       		    	    headers: {
       		    	    	'X-USER-TOKEN': data.token
       		    	    }
       		    	});
					storejs.set('X-USER-TOKEN', data.token);
					self.getApp().data("current_so",null);
					self.getApp().data("danhsachso",null);
       		    	self.getApp().postLogin(data);
       		    	if(password === undefined || password===""){
						   self.router.navigate("user/profile");
					   }
       		    },
    		    error: function (xhr, status, error) {
					try {
						if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						  self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
					  self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
	    	    complete:function(){
	    	    	self.getApp().hideloading();
	    	    	return false;
	    	    }
       		});
       	},

    });

});