define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/view/DonViCungUng/tpl/modelcreatedonvi.html'),
		schema = require('json!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/DonViYTeSchema.json');
	var TinhThanhSelectView = require("app/view/DanhMuc/TinhThanh/SelectView");
	var QuanHuyenSelectView = require("app/view/DanhMuc/QuanHuyen/SelectView");
	var XaPhuongSelectView = require("app/view/DanhMuc/XaPhuong/SelectView");
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "donvi/create",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-default btn-sm",
						label: "TRANSLATE:BACK",
						// visible: function () {
						// 	var self = this;
						// 	var uid = "id";
						// 	if (self.getApp().currentUser) {
						// 		uid = self.getApp().currentUser.donvi_id;
						// 	}
						// 	var id_donvi = this.getApp().getRouter().getParam("id");
						// 	if (uid === id_donvi || !id_donvi) {
						// 		return false;
						// 	} else {
						// 		return true;
						// 	}
						// },
						command: function () {
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm taodonvi",
						label: "TRANSLATE:SAVE",
						visible: function () {
							return (this.getApp().hasRole('admin_donvi') === true || this.getApp().hasRole('admin') === true);
						},
						command: function () {
							var self = this;
							var donvi_ten = self.model.get("donvi_name"),
								fullname = self.model.get("name"),
								pass = self.model.get("password"),
								cfpass = self.model.get("cfpassword"),
								accountName = self.model.get("accountName");
							if (fullname == null || fullname == "" || fullname == undefined) {
								self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
								return
							}
							if (accountName == null || accountName == "") {
								self.getApp().notify({ message: "Tài khoản người dùng được để trống!" }, { type: "danger" });
								return
							}
							
							// if(!!donvi_email) {
							// 	self.model.set("donvi_email",donvi_email.toLowerCase());
							// }
							if (pass == null || pass == "") {
								self.getApp().notify({ message: "Mật khẩu không được để trống!" }, { type: "danger" });
								return
							}
							if (pass == null || pass != cfpass) {
								self.getApp().notify({ message: "Xác nhận mật khẩu không đúng, vui lòng kiểm tra lại!" }, { type: "danger" });
								return
							}
							if (donvi_ten == null || donvi_ten == "") {
								self.getApp().notify({ message: "Tên đơn vị không được để trống!" }, { type: "danger" });
								return
							}

							self.model.set({
								"name": fullname.toUpperCase(),
								"donvi_name": donvi_ten.toUpperCase(),
								"type_donvi": "donvicungung"
							});

							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify("Tạo đơn vị thành công!");
									self.getApp().getRouter().navigate('donvicungung/collection');
								},
								error: function (xhr, status, error) {
									try {
										if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
											self.getApp().getRouter().navigate("login");
										} else {
											self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
										}
									}
									catch (err) {
										self.getApp().notify({ message: "Tên đăng nhập hoặc số điện thoại đã tồn tại" }, { type: "danger", delay: 1000 });
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
					field: "tinhthanh",
					uicontrol: "ref",
					foreignRemoteField: "id",
					foreignField: "tinhthanh_id",
					dataSource: TinhThanhSelectView
				},
				{
					field: "quanhuyen",
					uicontrol: "ref",
					foreignRemoteField: "id",
					foreignField: "quanhuyen_id",
					dataSource: QuanHuyenSelectView
				},
				{
					field: "xaphuong",
					uicontrol: "ref",
					foreignRemoteField: "id",
					foreignField: "xaphuong_id",
					dataSource: XaPhuongSelectView
				}
			]
		},
		render: function () {
			var self = this;
			var curUsr = self.getApp().currentUser;
			if (curUsr) {
				self.applyBindings();
				self.validate_password();
				self.model.on("change:tinhthanh", function() {
					var tinhthanh_id = self.model.get("tinhthanh_id");
					var filterobj = {"tinhthanh_id": {"$eq": tinhthanh_id}}; 
					self.getFieldElement("quanhuyen").data("gonrin").setFilters(filterobj);
					self.model.set({"quanhuyen":null,"xaphuong":null});
				});
				self.model.on("change:quanhuyen", function() {
					var quanhuyen_id = self.model.get("quanhuyen_id");
					var filterobj = {"quanhuyen_id": {"$eq": quanhuyen_id}}; 
					self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
					self.model.set({"xaphuong":null});
				});
			}
		},
		validate_password: function () {
			var self = this;
			self.model.on("change:cfpassword", function () {
				var pwd = self.model.get('password');
				var confirm_pwd = self.model.get('cfpassword');
				if (pwd !== null && pwd !== "" && pwd !== undefined && pwd !== confirm_pwd) {
					self.getApp().notify({ message: "Mật khẩu không khớp.Vui lòng nhập lại!" }, { type: "danger" });
				}
			});
			self.model.on("change:password", function () {
				var pwd = self.model.get('password');
				var confirm_pwd = self.model.get('cfpassword');
				if (confirm_pwd !== null && confirm_pwd !== "" && confirm_pwd !== undefined && pwd !== confirm_pwd) {
					self.getApp().notify({ message: "Mật khẩu không khớp.Vui lòng nhập lại!" }, { type: "danger" });
				}
			});
		}
	});
});