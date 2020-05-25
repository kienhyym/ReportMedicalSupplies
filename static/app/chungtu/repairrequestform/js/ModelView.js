define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	// Gonrin = require('../../certificateform/js/node_modules/gonrin');
	var template = require('text!app/chungtu/repairrequestform/tpl/model.html'),
		schema = require('json!schema/RepairRequestFormSchema.json');


	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "repairrequestform",
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

									$.ajax({
										method: "POST",
										url: self.getApp().serviceURL + "/api/v1/notification",
										data: JSON.stringify({
											name: respose.name,
											model_serial_number: respose.model_serial_number,
											notification_type_id: respose.id,
											notification_type: "Phiếu yêu cầu sửa chữa",
											notification_type_code: "repairrequestform",
											status: "chuaxem",
											notification_time: respose.created_at
										}),
										headers: {
											'content-type': 'application/json'
										},
										dataType: 'json',
										success: function (response) {
											if (response) {
											}
										}, error: function (xhr, ere) {
											console.log('xhr', ere);

										}
									})

									$.ajax({
										method: "PUT",
										url: self.getApp().serviceURL + "/api/v1/equipmentdetails/" + self.model.get('equipmentdetails_id'),
										data: JSON.stringify({
											status: "dangsuachua",

										}),
										headers: {
											'content-type': 'application/json'
										},
										dataType: 'json',
										success: function (response) {
											if (response) {

											}
										}, error: function (xhr, ere) {
											console.log('xhr', ere);

										}
									})


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
							self.$el.find('#nguoisundung').val(self.model.get('user'))
							self.$el.find('#organization').val(self.model.get('organization_of_use'))
							self.$el.find('#ngayxayrasuco').val(moment(self.model.get('time_of_problem') * 1000).format("DD/MM/YYYY"))
							// var x = self.$el.find("#describe")[0].scrollHeight;
							// console.log(x)
							// self.$el.find("#describe")[0].style.height =  x + 'px';
							self.$el.find('#describe').val(self.model.get('describe_the_problem'))
							self.$el.find('#ngaydanhgia').val(moment(self.model.get('evaluation_time') * 1000).format("DD/MM/YYYY"))
							self.$el.find('#describe_the_problem').val(self.model.get('preliminary_assessment'))

							self.$el.find('#ykien').val(self.model.get('opinion_of_leader'))
							self.$el.find('#motaketqua').val(self.model.get('result'))
							self.$el.find('#ngayketqua').val(moment(self.model.get('Time_to_return_results') * 1000).format("DD/MM/YYYY"))
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
					field: "time_of_problem",
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
				{
					field: "evaluation_time",
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
				{
					field: "Time_to_return_results",
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
			self.model.set("model_serial_number", sessionStorage.getItem('SerialThietBi'))
			self.model.set("management_code", sessionStorage.getItem('MaQLTBThietBi'))
			sessionStorage.clear();
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						// self.$el.find(".tensp").html("PHIẾU YÊU CẦU SỬA CHỮA THIẾT BỊ: "+self.model.get("name"))
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