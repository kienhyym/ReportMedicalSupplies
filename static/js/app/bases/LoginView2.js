define(function (require) {

    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin            	= require('gonrin'),
        storejs				= require('store'),
        tpl                 = require('text!tpl/base/Login.html'),
        template = _.template(tpl);

    return Gonrin.View.extend({
        render: function () {
        	this.getApp().data("current_so", null);
        	storejs.remove('gonrintoken');
    	    if($.ajaxSettings.headers != null){
    	    	delete $.ajaxSettings.headers['content-type'];
    	        delete $.ajaxSettings.headers['Authorization'];
    	    }
            this.$el.html(template());
            var qrcode = this.getApp().getRouter().getParam("qr");
//            var qrcode = window.location.pathname.split("/").pop();
            console.log(window.location.pathname);
            console.log("loginview.1qr="+qrcode);
            if(qrcode !== undefined && qrcode !==""){
            	this.$el.find("#msg_qrcode").html('Mã Qr "'+qrcode+'" chưa được gắn với sổ chăm sóc.');
            }
            
            this.handleLogin(qrcode);
            return this;
        },
        handleLogin : function(qrcode){
        	var self = this;
        	$('.login-form').validate({
                errorElement: 'span', //default input error message container
                errorClass: 'help-block', // default input error message class
                focusInvalid: false, // do not focus the last invalid input
                rules: {
                    username: {
                        required: true
                    },
                    password: {
                        required: true
                    },
                    remember: {
                        required: false
                    }
                },

                messages: {
                    username: {
                        required: "Username is required."
                    },
                    password: {
                        required: "Password is required."
                    }
                },

                invalidHandler: function(event, validator) { //display error alert on form submit   
                    $('.alert-danger', $('.login-form')).show();
                },

                highlight: function(element) { // hightlight error inputs
                    $(element)
                        .closest('.form-group').addClass('has-error'); // set error class to the control group
                },

                success: function(label) {
                    label.closest('.form-group').removeClass('has-error');
                    label.remove();
                },

                errorPlacement: function(error, element) {
                    error.insertAfter(element.closest('.input-icon'));
                },

                submitHandler: function(form) {
                    //form.submit(); // form validation success, call ajax form submit
                	self.processLogin();
                }
            });
        	$("#register-btn").bind('click', function(){
        		if(qrcode !== undefined && qrcode !==""){
        			self.getApp().getRouter().navigate("dangky?qr="+qrcode);
                }else{
                	self.getApp().getRouter().navigate("dangky");
                }
                
        	});
        	$("#forget-password").bind('click', function(){
                self.getApp().getRouter().navigate("forgot");
        	});

        	$(".facebook").bind('click', function(){
        		FB.getLoginStatus(function(response) {
        		    statusChangeCallback(response);
        		  });
        		
            });
        },
        events: {
       	 //'click #login-btn' : 'processLogin',
       	 //'click button#submit-btn': 'processLogin'
       	},
        fbLoginSuccess : function (userData) {
            console.log("UserInfo facebook: " + JSON.stringify(userData));
        },
       	processLogin: function(){
       		var username = this.$('[name=username]').val();
       		var password = this.$('[name=password]').val();
       		var qrcode = this.getApp().getRouter().getParam("qr");
       		var data;
       		if(qrcode !== undefined && qrcode !== ""){
       			data = JSON.stringify({
       		        username: username,
       		        password: password,
       		        qr: qrcode
       		    });
       		} else {
       			data = JSON.stringify({
       		        username: username,
       		        password: password
       		    });
       		}
       		
       		var self = this;

       		$.ajax({
       		    url: (self.getApp().serviceURL || "") + '/login',
       		    type: 'post',
       		    data: data,
       		    headers: {
       		    	'content-type': 'application/json'
       		    },
       		    dataType: 'json',
       		    success: function (data) {
       		    	self.getApp().session.token = "Bearer " + data.token;
       		    	storejs.set('gonrin.token', "Bearer " + data.token);
       		    	
       		    	$.ajaxSetup({
       		    	    headers: {
       		    	        'content-type':'application/json',
       		    	        'Authorization':"Bearer " + data.token
       		    	    }
       		    	});
       		    	//get UserInfo and Permission
       		    	//app.trigger("login_succeeded.app");
       		    	//
       		    	self.getApp().getRouter().navigate("index");
       		    },
       		    error: function(XMLHttpRequest, textStatus, errorThrown) {
       		    	self.getApp().notify("Login error");
       		    }
       		});
       	}
    });

});