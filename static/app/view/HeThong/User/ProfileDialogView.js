define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/User/changeprofile.html');
    
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
    	collectionName: "profile",
    	tools : [
  	    	    {
  	    	    	name: "defaultgr",
  	    	    	type: "group",
  	    	    	groupClass: "toolbar-group",
  	    	    	buttons: [
  						{
  			    	    	name: "save",
  			    	    	type: "button",
  			    	    	buttonClass: "btn-success btn-sm",
  			    	    	label: "TRANSLATE:SAVE",
  			    	    	command: function(){
  			    	    		var self = this;
  			    	    		var currUser = self.getApp().currentUser;
  			    	    		var profile_email = self.$el.find('#profile_email').val();
								if (!!profile_email) {
									profile_email = profile_email.toLowerCase();
								}
  			    	    		var params = {
  			    	    				macongdan: self.$el.find('#profile_macongdan').val(),
  			    	    				phone: self.$el.find('#profile_phone').val(),
  			    	    				email: profile_email,
  			    	    				hoten: self.$el.find('#profile_name').val()
								}
  			    	    		self.getApp().showloading();
  			    	    		$.ajax({
	  				    				url: (self.getApp().serviceURL || "")+'/api/v1/user/changeprofile',
	  				    				method: 'POST',
	  				    				data: JSON.stringify(params),
	  				    				dataType: "json",
	  				    			  	contentType: "application/json",
	  				    			  	success: function(data) {
	  				    			  		self.getApp().hideloading();
	  				    			  		self.getApp().currentUser.hoten = data.hoten;
	  				    			  		self.getApp().currentUser.email = data.email;
	  				    			  		self.getApp().currentUser.macongdan = data.macongdan;
	  				    			  		self.getApp().currentUser.phone = data.phone;
		  				    			    if(!data.hoten || data.hoten === ""){
		  				    			    	data.hoten = data.id;
		  				    			    }
		  				    			   $("#fullname").html(data.hoten);
		  				    			    
	  				    			  		self.getApp().notify("Cập nhập thông tin thành công!");
											self.close();
											self.getApp().getRouter().refresh();
											self.getApp().hideloading();
	  				    			  	},
	  				    			  error: function (xhr, status, error) {
	  				    				self.getApp().hideloading();
	  									try {
	  										if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
	  											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
	  											self.getApp().getRouter().navigate("login");
	  										} else {
	  										  self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
	  										}
	  									}
	  									catch (err) {
	  									  self.getApp().notify({ message: "Lưu không thành công, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
	  									}
	  								}
	  				    			  	
	  				    			});
  			    	    		
  			    	    	}
  			    	    },
  			    	  {
  			    	    	name: "close",
  			    	    	type: "button",
  			    	    	buttonClass: "btn-default btn-sm",
  			    	    	label: "TRANSLATE:CLOSE",
  			    	    	command: function(){
  			    	    		var self = this;
  			    	    		self.close();
  			    	    	}
  			    	    },
  	    	    	]
  	    	    },
  	    	],
  	    	
    	render: function(){
			var self = this;
			console.log(self);
    		var currentUser = self.getApp().currentUser;
    		if (!!currentUser){
    			self.$el.find('#profile_macongdan').val(currentUser.macongdan),
				self.$el.find('#profile_phone').val(currentUser.phone),
				self.$el.find('#profile_email').val(currentUser.email),
				self.$el.find('#profile_name').val(currentUser.hoten)
    		}
    		 
    		this.applyBindings();
    		return this;
    	},
    });

});