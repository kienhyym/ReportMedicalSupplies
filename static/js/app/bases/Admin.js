define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        template                 = require('text!tpl/base/admin.html'),
        Gonrin				= require('gonrin');
    
    
    return Gonrin.View.extend({
    	template : template,
		render: function(){
			var self = this;
			var currUser = self.getApp().currentUser;
			
			if(self.getApp().hasRole('admin') === true){
				var btn_upgrade = self.$el.find('#upgrade_canbo button').first();
				var btn_downgrade = self.$el.find('#downgrade_canbo button').first();
				btn_upgrade.unbind("click").bind("click", function(){
					var input = self.$el.find('#upgrade_canbo input').first();
					if(input.val()=== null || input.val().trim()==='' || input.val()=== undefined){
						self.getApp().notify("Yêu cầu nhập mã người dùng!");
						return;
					}else{
						$.ajax({
			       		    url:  self.getApp().serviceURL+'/upgrade_role_canbo',
			       		    type: 'POST',
			       		    data: JSON.stringify({"uid":input.val()}),
			       		    headers: {
			       		    	'content-type': 'application/json'
			       		    },
			       		    dataType: 'json',
			       		    success: function (data) {
			       		    	if (!!data.error_message){
			       		    		self.getApp().notify(data.error_message)
			       		    	}else{
			       		    		self.getApp().notify("Cấp quyền cán bộ thành công!")
			       		    	}
			       		    },
			       		    error: function(XMLHttpRequest, textStatus, errorThrown) {
			       		    	self.getApp().notify("Có lỗi xảy ra, vui lòng thử lại sau!");
			       		    }
			       		});
						
					}
				});
				
				btn_downgrade.unbind("click").bind("click", function(){
					var input = self.$el.find('#downgrade_canbo input').first();
					if(input.val()=== null || input.val().trim()==='' || input.val()=== undefined){
						self.getApp().notify("Yêu cầu nhập mã người dùng!");
						return;
					}else{
						$.ajax({
			       		    url:  self.getApp().serviceURL+'/downgrade_role_canbo',
			       		    type: 'POST',
			       		    data: JSON.stringify({"uid":input.val()}),
			       		    headers: {
			       		    	'content-type': 'application/json'
			       		    },
			       		    dataType: 'json',
			       		    success: function (data) {
			       		    	if (!!data.error_message){
			       		    		self.getApp().notify(data.error_message)
			       		    	}else{
			       		    		self.getApp().notify("Huỷ quyền cán bộ thành công!")
			       		    	}
			       		    },
			       		    error: function(XMLHttpRequest, textStatus, errorThrown) {
			       		    	self.getApp().notify("Có lỗi xảy ra, vui lòng thử lại sau!");
			       		    }
			       		});
						
					}
				});
			} else {
	    		self.getApp().notify("Bạn không có quyền thực hiện tác vụ này!");
	    		self.getApp().getRouter().navigate('login');
			}
			
			return this;
		},
	    
	    
	});

});