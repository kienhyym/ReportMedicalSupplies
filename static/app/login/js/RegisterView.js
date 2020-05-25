define(function (require) {

    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin            	= require('gonrin'),
        storejs				= require('vendor/store'),
		tpl                 = require('text!app/login/tpl/register.html');
		

    var template = gonrin.template(tpl)({});


    return Gonrin.View.extend({
		template: template,
		modelSchema: [],
		urlPrefix: "/api/v1/",
		collectionName: "",
		//tools:null,

		render: function () {
			var self = this;
			self.applyBindings();
			self.registerEvent();
		},

		registerEvent: function () {
            console.log('asdfg')
            var self = this;
            
            self.$el.find("#btn-register").unbind("click").bind("click", function () {
                if(self.$el.find("#txtemail").val() === undefined || self.$el.find("#txtemail").val() === ""){
                    self.getApp().notify("Email không được bỏ trống");
                    return false;
                }
                if(self.$el.find("#txtname").val() === undefined || self.$el.find("#txtname").val() === ""){
                    self.getApp().notify("Tên không được bỏ trống");
                    return false;
                }  
                if(self.$el.find("#txtphone").val() === undefined || self.$el.find("#txtphone").val() === ""){
                    self.getApp().notify("số điện thoại không được bỏ trống");
                    return false;
                }
                if(self.$el.find("#txtpass").val() === undefined || self.$el.find("#txtpass").val() === ""){
                    self.getApp().notify("Mật khẩu không được bỏ trống");
                    return false;
                }
                if(self.$el.find("#txtpass").val() !== self.$el.find("#txtpass2").val() ){
                    self.getApp().notify("Mật khẩu nhập lại không giống");
                    return false;
                }
                
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                var email = self.$el.find("#txtemail").val();
                if (!re.test(email)) {
                    self.getApp().notify("Email sai định dạng");
                    return false;
                }
                var templatephonenumber = /^\(?([0-9]{10})$/;
                var phonenumber = self.$el.find("#txtphone").val();
                if (!templatephonenumber.test(phonenumber)) {
                    self.getApp().notify("số diện thoạis sai định dạng");
                    return false;
                }
                
                

                $.ajax({
                    method: "POST",
                    url:self.getApp().serviceURL + "/api/v1/register",
                    data: JSON.stringify({
                        email: self.$el.find("#txtemail").val(),
                        name: self.$el.find("#txtname").val(),
                        phone_number: self.$el.find("#txtphone").val(),
                        password: self.$el.find("#txtpass").val()
                    }), 
                    success: function (response) {
                        if (response) {
							// toastr.success("Đăng ký thành công");
							self.getApp().notify("Đăng ký thành công");
                            self.getApp().getRouter().navigate("login");
                        }
                    }, error: function (xhr) {
                        console.log('xhr',xhr);
						// toastr.error(xhr.responseJSON.message);
						// self.getApp().notify(xhr.responseJSON.message);
                    }
                })
            });
        }
	});

});