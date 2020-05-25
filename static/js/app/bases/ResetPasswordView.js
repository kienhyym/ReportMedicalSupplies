define(function (require) {

    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin            	= require('gonrin'),
        tpl                 = require('text!tpl/base/resetpassword.html'),
        template = _.template(tpl);

    return Gonrin.View.extend({
        render: function () {
        	var self = this;
        	self.$el.html(template());
        	self.$el.find('[name=account]').val(self.viewData.user_id);
        	self.$el.find("#btn_resetpw").unbind('click').bind('click', function(){
        		self.processForgotPass();
        		return false;
            });
            
            return this;
        },
       	processForgotPass: function(){
       		var self = this;
       		var password = self.$el.find('[name=password]').val();
       		var cfpassword = self.$el.find('[name=confirmpassword]').val();
       		if(password==="" || password === undefined || password === null || password !== cfpassword){
       			self.getApp().notify("Mật khẩu không khớp, vui lòng thử lại");
       			return false;
       		}
       		var data = JSON.stringify({
       			password: password,
       			token:self.viewData.token
       		});
       		self.getApp().showloading();
       		$.ajax({
       		    url: (self.getApp().serviceURL || "") + '/api/v1/user/recover/resetpw',
       		    type: 'post',
       		    data: data,
	       		headers: {
	    		    	'content-type': 'application/json'
	    		    },
       		    dataType: 'json',
       		    success: function (data) {
       		    	self.$el.find('.form-actions').html('<label class="control-label">'+data.error_message+'</label>');
       		    	self.$el.find('.create-account').show();
       		    	self.$el.find('.create-account').unbind('click').bind('click',function(){
       		    		self.getApp().getRouter().navigate("login");
       		    		self.getApp().getRouter().refresh();
       		    	});
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
       		return false;
       	},

    });

});