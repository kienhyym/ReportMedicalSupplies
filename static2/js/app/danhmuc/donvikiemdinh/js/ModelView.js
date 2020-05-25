define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

		//Gonrin = require('../../EthnicGroup/view/node_modules/gonrin');
	var template = require('text!app/danhmuc/donvikiemdinh/tpl/model.html'),
		schema = require('json!schema/DonViKiemDinhSchema.json');
	var XaPhuongSelectView = require('app/danhmuc/wards/view/SelectView');
	var QuanHuyenSelectView = require('app/danhmuc/District/view/SelectView');
	var TinhThanhSelectView = require('app/danhmuc/Province/view/SelectView');
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "donvikiemdinh",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-default btn-sm  btn-secondary",
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
						command: function () {
							var self = this;
							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify("Lưu thông tin thành công");
									self.getApp().getRouter().navigate(self.collectionName + "/collection");
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
						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, response) {
									self.getApp().notify('Xoá dữ liệu thành công');
									self.getApp().getRouter().navigate(self.collectionName + "/collection");
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
					field: "wards",
					uicontrol: "ref",
					textField: "name",
					foreignRemoteField: "id",
					foreignField: "wards_id",
					dataSource: XaPhuongSelectView
				},
				{
					field: "district",
					uicontrol: "ref",
					textField: "name",
					foreignRemoteField: "id",
					foreignField: "district_id",
					dataSource: QuanHuyenSelectView
				},
				{
					field: "nation",
					uicontrol: "ref",
					textField: "name",
					foreignRemoteField: "id",
					foreignField: "nation_id",
					dataSource: TinhThanhSelectView
				},
				// {
				// 	field: "type",
				// 	uicontrol: "combobox",
				// 	textField: "text",
				// 	valueField: "value",
				// 	dataSource: [
				// 		{ "value": "loai1", "text": "Doanh nghiệp nhà nước" },
				// 		{ "value": "loai2", "text": "Doanh nghiệp tư nhân" },
				// 		{ "value": "loai3", "text": "Doanh nghiệp cổ phần" },
				// 	],
				// },
			]
		},
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			$.fn.selectpicker.Constructor.DEFAULTS.multipleSeparator = ' | ';
			self.$el.find("#multiselect_required").selectpicker();
			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.registerEvent();
						self.model.on("change:province_id", function () {
							self.getFieldElement("district").data("gonrin").setFilters({ "province_id": { "$eq": self.model.get("province_id") } });
						});
						self.model.on("change:district_id", function () {
							self.getFieldElement("wards").data("gonrin").setFilters({ "district_id": { "$eq": self.model.get("district_id") } });
						});
					},
					error: function (xhr, status, error) {
						try {
							if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} else {
								self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						} catch (err) {
							self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
						}
					}
				});
			} else {
				self.applyBindings();
				self.registerEvent();
				self.model.on("change:province_id", function () {
					console.log("change tinh thanh", self.model.get("province_id"));
					self.getFieldElement("district").data("gonrin").setFilters({ "province_id": { "$eq": self.model.get("province_id") } });
				});
				self.model.on("change:district_id", function () {
					self.getFieldElement("wards").data("gonrin").setFilters({ "district_id": { "$eq": self.model.get("district_id") } });
					console.log("change district", self.model.get("district_id"));
				});
			}
		},
	});
});