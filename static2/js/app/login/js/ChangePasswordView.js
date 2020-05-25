define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/login/tpl/changepassword.html')

	return Gonrin.View.extend({
		template: template,
		modelSchema: {},

		render: function () {
			var self = this;
			// var id = self.id;
			// console.log("self.currentUser",self.getApp().currentUser.id)
			var id = self.getApp().currentUser.id
			var pass = self.getApp().currentUser.password;
			self.applyBindings();
			self.changepasswordEvent(id);
			console.log(id);
			console.log(pass);
		},
		changepasswordEvent: function (id) {
			var self = this;
			self.$el.find("#btn-changepassword").unbind("click").bind("click", function () {
				if (self.$el.find("#txtpass").val() === undefined || self.$el.find("#txtpass").val() === "") {
					self.getApp().notify("mật khẩu cũ không được bỏ trống");
					return false;
				}
				if (self.$el.find("#txtpass2").val() === undefined || self.$el.find("#txtpass2").val() === "") {
					self.getApp().notify("Mật khẩu mới không được bỏ trống");
					return false;
				}
				if (self.$el.find("#txtpass3").val() !== self.$el.find("#txtpass2").val()) {
					self.getApp().notify("Mật khẩu mới viết không giống ở trên");
					return false;
				}
				$.ajax({
					type: 'POST',
					url: self.getApp().serviceURL + "/api/v1/changepassword",
					dataType: 'json',
					data: JSON.stringify({
						user_id: id,
						password_old: self.$el.find("#txtpass").val(),
						password_new: self.$el.find("#txtpass2").val(),
					}),
					success: function (response) {
						if (response) {
							self.getApp().notify({ message: "Đổi mật khẩu đã thành công", delay: 1000  });
							setTimeout(function(){
								window.location = self.getApp().serviceURL;
							}, 1000);
						}


					}, error: function (xhr) {
						self.getApp().notify("Mật khẩu cũ không chính xác ");
					}
				})
			});
		}
	});
});