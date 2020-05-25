define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	// Gonrin = require('../../certificateform/js/node_modules/gonrin');
	var template = require('text!app/chungtu/devicestatusverificationform/tpl/model.html'),
		schema = require('json!schema/DeviceStatusVerificationFormSchema.json');


	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "devicestatusverificationform",
		bindings: "data-bind",
		state: null,
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
						label: "TRANSLATE:Quay lại",
						command: function () {
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:Lưu",
						command: function () {
							var self = this;
							self.model.save(null, {
								success: function (model, respose, options) {

									self.getApp().notify("Lưu thông tin thành công");
									self.getApp().getRouter().navigate(self.collectionName + "/collection");
								},
								error: function (xhr, error) {
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
						name: "&nbsp; In &nbsp; ",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						// label: "TRANSLATE:Xóa",
						visible: function () {
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function () {
							var self = this;
							// self.$el.find('#xxx').on('click', function () {
							self.$el.find('#printJS-form').show();
							self.$el.find('.bodynay').hide();

							self.$el.find('#name').val(self.model.get('name'))
							self.$el.find('#serial').val(self.model.get('model_serial_number'))
							self.$el.find('#maqltb').val(self.model.get('management_code'))

							self.$el.find('#at').val(self.model.get('at'))
							self.$el.find('#home').val(self.model.get('home'))

							self.$el.find('#user').val(self.model.get('user'))
							self.$el.find('#organization').val(self.model.get('organization'))

							self.$el.find('#conclusion_of_equipment_issues').val(self.model.get('conclusion_of_equipment_issues'))
							self.$el.find('#directions_to_overcome').val(self.model.get('directions_to_overcome'))
							self.$el.find('#ngayketqua').val(moment(self.model.get('date') * 1000).format("DD/MM/YYYY"))

							// var x = self.$el.find("#mota2")[0].scrollHeight;
							// console.log(x)
							// // self.$el.find("#describe").style.height = x + 'px';
							// self.$el.find("#describe")[0].style.height =  x + 'px';


							new printJS({ printable: 'printJS-form', font_size: '30px;', type: 'html', css: 'static/css/style.css' });
							self.getApp().getRouter().refresh();

							// })
						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger btn-sm",
						label: "TRANSLATE:Xóa",
						visible: function () {
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, response) {
									self.getApp().notify('Xoá dữ liệu thành công');
									self.getApp().getRouter().navigate(self.collectionName + "/collection");
								},
								error: function (xhr, error) {
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

				// {
				// 	field: "classify",
				// 	uicontrol: "combobox",
				// 	textField: "text",
				// 	valueField: "value",
				// 	dataSource: [
				// 		{ "value": "A", "text": "Loại A (mức độ rủi ro thấp.)" },
				// 		{ "value": "B", "text": "Loại B (mức độ rủi ro trung bình thấp.)" },
				// 		{ "value": "C", "text": "Loại C (mức độ rủi ro trung bình cao.)" },
				// 		{ "value": "D", "text": "Loại D (mức độ rủi ro cao.)" },
				// 	],
				// },
				// {
				// 	field: "status",
				// 	uicontrol: "combobox",
				// 	textField: "text",
				// 	valueField: "value",
				// 	dataSource: [
				// 		{ "value": "Đã gửi yêu cầu sửa chữa", "text": "Đã gửi yêu cầu sửa chữa" },
				// 		{ "value": "Đang sửa chữa", "text": "Đang sửa chữa" },
				// 		{ "value": "Đang chờ kiểm duyệt", "text": "Đang chờ kiểm duyệt" },
				// 		{ "value": "Đã kiểm duyệt", "text": "Đã kiểm duyệt" },
				// 	],
				// },

				{
					field: "date",
					uicontrol: "datetimepicker",
					textFormat: "DD/MM/YYYY",
					extraFormats: ["DDMMYYYY"],
					parseInputDate: function (val) {
						return moment.unix(val)
					},
					parseOutputDate: function (date) {
						return date.unix()
					}
				},
			]
		},

		render: function () {
			var self = this;
			self.model.set("equipmentdetails_id", sessionStorage.getItem('IDThietBi'))
			self.model.set("name", sessionStorage.getItem('TenThietBi'))
			self.model.set("management_code", sessionStorage.getItem('MaQLTBThietBi'))
			self.model.set("model_serial_number", sessionStorage.getItem('SerialThietBi'))
			// sessionStorage.clear();


			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();

					},
					error: function () {
						self.getApp().notify("Get data Eror");
					},
				});
			} else {
				self.applyBindings();
			}
		},

	});
});