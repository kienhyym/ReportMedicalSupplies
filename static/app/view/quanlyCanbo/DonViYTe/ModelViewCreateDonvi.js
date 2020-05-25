define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/view/quanlyCanbo/DonViYTe/tpl/modelcreatedonvi.html'),
		schema = require('json!app/view/quanlyCanbo/DangkiDonVi/SchemaDonviDangki.json');
	var TinhThanhSelectView = require("app/view/DanhMuc/TinhThanh/SelectView");
	var QuanHuyenSelectView = require("app/view/DanhMuc/QuanHuyen/SelectView");
	var XaPhuongSelectView = require("app/view/DanhMuc/XaPhuong/SelectView");
	var TuyenDonViSelectView = require("app/view/DanhMuc/TuyenDonVi/SelectView");
	var DonviSelectView = require("app/view/quanlyCanbo/DangkiDonVi/DonviCaptrenSelectView");
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "admin/donvi/create",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [

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
							var donvi_ten = self.model.get("donvi_ten"),
								fullname = self.model.get("fullname"),
								phone = self.model.get("phone"),
								email = self.model.get("email"),
								donvi_email = self.model.get("donvi_email"),
								pass = self.model.get("password"),
								cfpass = self.model.get("cfpassword"),
								donvi_tuyendonvi = self.model.get("donvi_tuyendonvi");
							if (fullname == null || fullname == "" || fullname == undefined) {
								self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
								return
							}
							if (phone == null || phone == "") {
								self.getApp().notify({ message: "Số điện thoại người dùng không được để trống!" }, { type: "danger" });
								return
							}
							if (email == null || email == "") {
								self.getApp().notify({ message: "Email người dùng không được để trống!" }, { type: "danger" });
								return
							}

							if(!!email) {
								self.model.set("email",email.toLowerCase());
							}
							
							if(!!donvi_email) {
								self.model.set("donvi_email",donvi_email.toLowerCase());
							}

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
							if (donvi_tuyendonvi == null || donvi_tuyendonvi == undefined) {
								self.getApp().notify({ message: "Chưa chọn tuyến đơn vị!" }, { type: "danger" });
								return
							}
							var valiedate_tuyendonvi = self.valiedate_tuyendonvi();
							if (valiedate_tuyendonvi == false) {
								return
							}

							self.model.set("fullname", fullname.toUpperCase());
							self.model.set("donvi_ten", donvi_ten.toUpperCase());

							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify("Tạo đơn vị thành công!");
									self.getApp().getRouter().navigate('canbo/donvi/collection');
								},
								error: function (xhr, status, error) {
									self.getApp().notify({ message: status.responseJSON.error_message}, { type: "danger", delay: 1000});
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
				},
				{
					field: "donvi_tuyendonvi",
					uicontrol: "ref",
					foreignRemoteField: "id",
					foreignField: "donvi_tuyendonvi_id",
					dataSource: TuyenDonViSelectView
				},
				{
					field: "captren",
					uicontrol: "ref",
					foreignRemoteField: "id",
					foreignField: "captren_id",
					dataSource: DonviSelectView
				},
			]
		},
		render: function () {
			var self = this;
			var curUsr = self.getApp().currentUser;
			if (curUsr) {
				var url = self.getApp().serviceURL + "/canbo/api/v1/donvi/" + curUsr.id;
				$.ajax({
					url: url,
					method: "GET",
					contentType: "application/json",
					success: function (obj) {
						self.select_tuyendonvi(obj);
						self.model.set("captren", obj);
						self.$el.find("#donvicaptren").prop("disabled", true);
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
							self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
						}
					},
				});
				self.applyBindings();
				self.validate_password();
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
		},
		select_tuyendonvi: function (obj) {
			var self = this;
			if (obj.tuyendonvi_id == "10") {
				self.getApp().notify("Bạn không có quyền tạo đơn vị!");
				self.$el.find(".taodonvi").hide();
				self.getApp().getRouter().navigate('canbo/donvi/collection');
			}
			self.model.on("change:tinhthanh", function () {
				var filterobj = { "tinhthanh_id": { "$eq": self.model.get("tinhthanh_id") } };
				self.getFieldElement("quanhuyen").data("gonrin").setFilters(filterobj);
				self.model.set({ "quanhuyen": null, "xaphuong": null });
			});
			self.model.on("change:quanhuyen", function () {
				var filterobj = { "quanhuyen_id": { "$eq": self.model.get("quanhuyen_id") } };
				self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
				self.model.set({ "xaphuong": null });
			});
			self.model.on("change", function () {
				var donvi_tuyendonvi_id = obj.tuyendonvi_id;
				if (donvi_tuyendonvi_id == "01") {
					var filters = {
						"$or": [
							{ "id": { "$eq": "02" } },
							{ "id": { "$eq": "03" } },
							{ "id": { "$eq": "04" } },
							{ "id": { "$eq": "05" } },
							{ "id": { "$eq": "06" } },
						]
					};
					self.getFieldElement("donvi_tuyendonvi").data("gonrin").setFilters(filters);
				}
				else if (donvi_tuyendonvi_id == "02" || donvi_tuyendonvi_id == "03") {
					var filters = {
						"$or": [
							{ "id": { "$eq": "04" } },
							{ "id": { "$eq": "05" } },
							{ "id": { "$eq": "06" } },
						]
					};
					self.getFieldElement("donvi_tuyendonvi").data("gonrin").setFilters(filters);
				}
				else if (donvi_tuyendonvi_id == "04" || donvi_tuyendonvi_id == "05" || donvi_tuyendonvi_id == "06") {
					self.model.set("tinhthanh", obj.tinhthanh);
					self.$el.find("#matinhthanh").prop("disabled", false);
					var filters = {
						"$or": [
							{ "id": { "$eq": "07" } },
							{ "id": { "$eq": "08" } },
							{ "id": { "$eq": "09" } },
						]
					};
					self.getFieldElement("donvi_tuyendonvi").data("gonrin").setFilters(filters);
				} else if (donvi_tuyendonvi_id == "07" || donvi_tuyendonvi_id == "08" || donvi_tuyendonvi_id == "09") {
					self.model.set({ "tinhthanh": obj.tinhthanh, "quanhuyen": obj.quanhuyen });
					var filters = {
						"$or": [
							{ "id": { "$eq": "10" } },
						]
					};
					self.getFieldElement("donvi_tuyendonvi").data("gonrin").setFilters(filters);
					self.$el.find("#matinhthanh").prop("disabled", false);
					self.$el.find("#maquanhuyen").prop("disabled", false);
				}
			});
		},
		disabled_select_captren: function (status = 0) {
			var self = this;
			//0 la khong the an nut,1 la co the an nut
			if (status == 1) {
				self.$el.find("#donvicaptren").prop('disabled', false);
			} else {
				self.$el.find("#donvicaptren").prop('disabled', true);
			}
		},
		valiedate_tuyendonvi: function () {
			var self = this;
			var tuyendonvi_id = self.model.get("donvi_tuyendonvi_id"),
				tinhthanh = self.model.get("tinhthanh"),
				quanhuyen = self.model.get("quanhuyen"),
				xaphuong = self.model.get("xaphuong");
			if ((tuyendonvi_id == "04" || tuyendonvi_id == "05" || tuyendonvi_id == "06") && (tinhthanh == null || tinhthanh == undefined)) {
				self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố " });
				return false;
			}
			else if ((tuyendonvi_id == "07" || tuyendonvi_id == "08" || tuyendonvi_id == "09") && (quanhuyen == null || quanhuyen == undefined)) {
				if (tinhthanh == null || tinhthanh == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" });
					return false
				}
				else {
					self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" });
					return false
				}
			}
			else if ((tuyendonvi_id == "10") && (xaphuong == null || xaphuong == undefined)) {
				if (tinhthanh == null || tinhthanh == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" });
					return false;

				} else if (quanhuyen == null || quanhuyen == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" });
					return false;

				} else {
					self.getApp().notify({ message: "Vui lòng chọn  Xã/Phường!" });
					return false;
				}

			};
			return true;
		}
	});
});