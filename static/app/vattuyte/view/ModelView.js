define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/vattuyte/tpl/model.html'),
		schema = require('json!schema/MedicalSuppliesSchema.json');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "medical_supplies",
		bindings: "data-bind",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-default btn-sm btn-secondary",
						label: "TRANSLATE:BACK",
						command: function () {
							var self = this;

							Backbone.history.history.back();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:SAVE",
						visible: function () {
							return (this.getApp().hasRole('admin') === true);
						},
						command: function () {
							var self = this;
							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify("Lưu thông tin thành công");
									self.getApp().getRouter().navigate("vattuyte/collection");

								},
								error: function (xhr, status, error) {
									try {
										if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
											self.getApp().getRouter().navigate("login");
										} else {
											self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
										}
									}
									catch (err) {
										self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
									}
								}
							});
						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger btn-sm",
						label: "TRANSLATE:DELETE",
						visible: function () {
							return (this.getApp().hasRole('admin') === true);
						},
						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, response) {
									self.getApp().notify('Xoá dữ liệu thành công');
									self.getApp().getRouter().navigate("vattuyte/collection");
								},
								error: function (xhr, status, error) {
									try {
										if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
											self.getApp().getRouter().navigate("login");
										} else {
											self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
										}
									}
									catch (err) {
										self.getApp().notify({ message: "Xóa dữ liệu không thành công" }, { type: "danger", delay: 1000 });
									}
								}
							});
						}
					},
					{
						name: "use",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:SAVE",
						visible: function () {
							return true
						},
						command: function () {
							var self = this;
							self.saveCheckUseMedicalSupplies()
							self.getApp().getRouter().navigate("vattuyte/collection");

						}
					},
				],
			}],
		uiControl: {
			fields: [

			]
		},
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (self.getApp().hasRole('admin') == false) {
				self.$el.find('.check-role').attr('readonly', 'readonly')
			}
			self.$el.find('.check-use').combobox({
				textField: "text",
				valueField: "value",
				allowTextInput: true,
				enableSearch: true,
				dataSource: [
					{ value: "yes", text: "Đang sử dụng" },
					{ value: "no", text: "Không sử dụng" },
				]
			});

			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						console.log(self.getApp().currentUser.Organization.list_unused_medical_supplies)
						var listUnusedMedicalSupplies = self.getApp().currentUser.Organization.list_unused_medical_supplies
						if (listUnusedMedicalSupplies == null) {
							self.$el.find('.check-use').data('gonrin').setValue('yes')
						}
						else {
							listUnusedMedicalSupplies.forEach(element => {
								if (element == self.model.get('id')) {
									self.$el.find('.check-use').data('gonrin').setValue('no')
									return;
								}
								else{
									self.$el.find('.check-use').data('gonrin').setValue('yes')
								}
							});
						}
					},
					error: function (xhr, status, error) {
						try {
							if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} else {
								self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						}
						catch (err) {
							self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
						}
					}
				});
			} else {
				self.applyBindings();
			}

		},
		saveCheckUseMedicalSupplies: function () {
			var self = this;
			var param = {}
			param.status = self.$el.find('.check-use').data('gonrin').getValue();
			param.organization_id = self.getApp().currentUser.organization_id
			param.medical_supplies_id = self.model.get('id')

			$.ajax({
				type: "POST",
				url: self.getApp().serviceURL + "/api/v1/save_check_use_medical_supplies",
				data: JSON.stringify(param),
				success: function (response) {
					console.log(response)
				}
			});
		}
	});

});