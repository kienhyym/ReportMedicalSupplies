define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/vattuyte/tpl/model.html'),
		schema = require('json!schema/MedicalSuppliesSchema.json');
	var BrandsSelectView = require('app/view/DanhMuc/HangSanXuat/SelectView');
	var GroupSuppliesSelectView = require('app/view/DanhMuc/NhomVatTu/SelectView');
	var CodeSuppliesSelectView = require('app/view/DanhMuc/MaHieuVatTu/SelectView');
	var QuocGiaSelectView = require('app/view/DanhMuc/QuocGia/SelectView');
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
				],
			}],
		uiControl: {
			fields: [
				{
					field:"brands",
					uicontrol:"ref",
					textField: "name",
					//chuyen sang thanh object
					foreignRemoteField: "id",
					foreignField: "brands_id",
					dataSource: BrandsSelectView
				},
				{
					field:"group_supplies",
					uicontrol:"ref",
					textField: "name",
					//chuyen sang thanh object
					foreignRemoteField: "id",
					foreignField: "group_supplies_id",
					dataSource: GroupSuppliesSelectView
				},
				{
					field:"national",
					uicontrol:"ref",
					textField: "ten",
					//chuyen sang thanh object
					foreignRemoteField: "id",
					foreignField: "national_id",
					dataSource: QuocGiaSelectView
				},
			]
		},
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (self.getApp().hasRole('admin') == false) {
				self.$el.find('.check-role').attr('readonly', 'readonly')
			}

			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						console.log(data)
						if(data.attributes.group_supplies == null || data.attributes.group_supplies == undefined){
							self.$el.find('#manhomvattu').val("")
						}else{
							self.$el.find('#manhomvattu').text(data.changed.group_supplies.code)
						}
						if(data.attributes.code_supplies == null || data.attributes.code_supplies == undefined){
							self.$el.find('#mahieuvattu').val("")
						}else{
							self.$el.find('#mahieuvattu').val(data.changed.code_supplies.code)
						}
						
						
						self.applyBindings();
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
				self.$el.find('[btn-name="delete"]').hide()
			}

		},
	});

});