define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!tpl/base/register.html'),
		schema = require('json!app/view/DangkiDonVi/SchemaDonviDangki.json');
	var TinhThanhSelectView = require("app/view/DanhMuc/TinhThanh/SelectView");
	var QuanHuyenSelectView = require("app/view/DanhMuc/QuanHuyen/SelectView");
	var XaPhuongSelectView = require("app/view/DanhMuc/XaPhuong/SelectView");
	var TuyenDonViSelectView = require("app/view/DanhMuc/TuyenDonVi/SelectView");
	var DonviSelectView = require("app/view/DangkiDonVi/DonviCaptrenSelectView");
	// var DonViYTe = require("app/view/DonViYTe/ModelView")
	// var schemaDonvi 	= require('json!app/view/DonViYTe/DonViYTeSchema.json');
	// var ModelDialogView = require("app/view/DonViYTe/UserDonVi/view/ModelDialogView");
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "donvidangki",
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
			if ($(window).width() <= 768) {
				self.$el.find(".border-right").removeClass("border-right");
			}
			self.validate_password();
			self.select_captren();
			self.dangki_donvi();
			self.applyBindings();

			self.model.on("change:tinhthanh_id", function () {
				var filterobj = { "tinhthanh_id": { "$eq": self.model.get("tinhthanh_id") } };
				self.getFieldElement("quanhuyen").data("gonrin").setFilters(filterobj);
				self.model.set({ "quanhuyen": null, "xaphuong": null });
			});
			self.model.on("change:quanhuyen_id", function () {
				var filterobj = { "quanhuyen_id": { "$eq": self.model.get("quanhuyen_id") } };
				self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
				self.model.set({ "xaphuong": null });
			});
			self.model.set("tinhthanh_id", null);

			return this;
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
		select_captren: function () {
			var self = this;
			if (!self.model.get("donvi_tuyendonvi")) {
				self.disabled_select_captren(0);
			}

			self.model.on("change", function () {
				var donvi_tuyendonvi_id = self.model.get("donvi_tuyendonvi_id");
				if (donvi_tuyendonvi_id) {
					self.disabled_select_captren(1);
				}
				//tuyen trung uong
				if (donvi_tuyendonvi_id == "01" || donvi_tuyendonvi_id == "02" || donvi_tuyendonvi_id == "03") {
					var filters = {
						"$or": [
							{ "tuyendonvi_id": { "$eq": "02" } },
							{ "tuyendonvi_id": { "$eq": "03" } },
							{ "tuyendonvi_id": { "$eq": "01" } },
						]
					};
					self.getFieldElement("captren").data("gonrin").setFilters(filters);
				}
				//tuyen tinh
				if (donvi_tuyendonvi_id == "04" || donvi_tuyendonvi_id == "05" || donvi_tuyendonvi_id == "06") {
					var tinhthanh_id = self.model.get("tinhthanh_id");
					if (!tinhthanh_id) {
						self.disabled_select_captren(0);
					} else {
						self.disabled_select_captren(1);
						var filters = {
							"$or": [
								{ "tuyendonvi_id": { "$eq": "01" } },
								{ "tuyendonvi_id": { "$eq": "02" } },
								{ "tuyendonvi_id": { "$eq": "03" } },
							]
						};
						self.getFieldElement("captren").data("gonrin").setFilters(filters);
					}
					//tuyen huyen
				} else if (donvi_tuyendonvi_id == "07" || donvi_tuyendonvi_id == "08" || donvi_tuyendonvi_id == "09") {
					var filters = {
						"$or": [
							{ "tuyendonvi_id": { "$eq": "04" } },
							{ "tuyendonvi_id": { "$eq": "05" } },
							{ "tuyendonvi_id": { "$eq": "06" } },
						]
					};
					var tinhthanh_id = self.model.get("tinhthanh_id"),
						quanhuyen_id = self.model.get("quanhuyen_id");
					if (!tinhthanh_id || tinhthanh_id == null || quanhuyen_id == null || !quanhuyen_id) {
						self.disabled_select_captren(0);
					} else {
						self.disabled_select_captren(1);
						var filterobj = {
							"$and": [
								{
									"tinhthanh_id": {
										"$eq": self.model.get("tinhthanh_id")
									}
								},
								filters
							]
						}
						self.getFieldElement("captren").data("gonrin").setFilters(filterobj);
					}
					//tuyen xa
				} else if (donvi_tuyendonvi_id == "10") {
					var filters = {
						"$or": [
							{ "tuyendonvi_id": { "$eq": "07" } },
							{ "tuyendonvi_id": { "$eq": "08" } },
							{ "tuyendonvi_id": { "$eq": "09" } },
						]
					};
					var tinhthanh_id = self.model.get("tinhthanh_id"),
						quanhuyen_id = self.model.get("quanhuyen_id"),
						xaphuong_id = self.model.get("xaphuong_id");
					if (!tinhthanh_id || tinhthanh_id == null || quanhuyen_id == null || !quanhuyen_id || !xaphuong_id || xaphuong_id == null) {
						self.disabled_select_captren(0);

					} else {
						self.disabled_select_captren(1);
						var filterobj = {
							"$and": [
								{
									"quanhuyen_id": {
										"$eq": self.model.get("quanhuyen_id")
									}
								},
								filters
							]
						}
						self.getFieldElement("captren").data("gonrin").setFilters(filterobj);
					}
				}
			});
		},
		dangki_donvi: function () {
			var self = this;
			self.$el.find("#button_dangkidonvi").unbind("click").bind("click", function () {
				var donvi_ten = self.model.get("donvi_ten"),
					captren = self.model.get("captren"),
					fullname = self.model.get("fullname"),
					email = self.model.get("email"),
					donvi_email = self.model.get("donvi_email"),
					phone = self.model.get("phone"),
					pass = self.model.get("password"),
					cfpass = self.model.get("cfpassword"),
					donvi_tuyendonvi = self.model.get("donvi_tuyendonvi");

				if (donvi_ten == null || donvi_ten == "") {
					self.getApp().notify({ message: "Tên đơn vị không được để trống!" }, { type: "danger" });
					return;
				}
				if (donvi_tuyendonvi == null || donvi_tuyendonvi == undefined) {
					self.getApp().notify({ message: "Chưa chọn tuyến đơn vị!" }, { type: "danger" });
					return;
				}
				var valiedate_tuyendonvi = self.valiedate_tuyendonvi();
				if (valiedate_tuyendonvi == false) {
					return;
				}
				if (captren == null || captren == undefined || captren == "") {
					self.getApp().notify({ message: "Chưa chọn đơn vị cấp trên!" }, { type: "danger" });
					return;
				}
				if (fullname == null || fullname == "" || fullname == undefined) {
					self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
					return;
				}
				if (phone == null || phone == "") {
					self.getApp().notify({ message: "Số điện thoại người dùng không được để trống!" }, { type: "danger" });
					return;
				}
				if (pass == null || pass == "") {
					self.getApp().notify({ message: "Mật khẩu không được để trống!" }, { type: "danger" });
					return;
				}
				if (pass == null || pass != cfpass) {
					self.getApp().notify({ message: "Xác nhận mật khẩu không đúng, vui lòng kiểm tra lại!" }, { type: "danger" });
					return;
				}
				if (!!email) {
					self.model.set("email", email.toLowerCase());
				}
				if (!!donvi_email) {
					self.model.set("donvi_email", donvi_email.toLowerCase());
				}
				self.model.set("donvi_ten", donvi_ten.toUpperCase());
				self.model.set("fullname", fullname.toUpperCase());
				self.model.set("tenkhongdau", gonrinApp().convert_khongdau(donvi_ten));
				self.model.set('active', 0);
				self.model.set('trangthai', 0);
				self.model.save(null, {
					success: function (model, respose, options) {
						self.getApp().notify("Tạo đơn vị thành công.Đợi sự phê duyệt từ cấp trên !");
						self.getApp().getRouter().refresh();
					},
					error: function (xhr, status, error) {
						self.getApp().hideloading();
						self.getApp().notify("Tạo đơn vị không thành công. Vui lòng thử lại");
					}
				});
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
				tinhthanh = self.model.get("tinhthanh_id"),
				quanhuyen = self.model.get("quanhuyen_id"),
				xaphuong = self.model.get("xaphuong_id");
			if ((tuyendonvi_id == "04" || tuyendonvi_id == "05" || tuyendonvi_id == "06") && (tinhthanh == null || tinhthanh == undefined)) {
				self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố " });
				return false;
			}
			else if ((tuyendonvi_id == "07" || tuyendonvi_id == "08" || tuyendonvi_id == "09")) {
				if (tinhthanh == null || tinhthanh == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" });
					return false;
				}
				else if (quanhuyen == null || quanhuyen == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" });
					return false;
				}

			}
			else if ((tuyendonvi_id == "10") && (xaphuong == null || xaphuong == undefined)) {
				if (tinhthanh == null || tinhthanh == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" });
					return false;
				} else if (quanhuyen == null || quanhuyen == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" });
					return false;
				} else if (xaphuong == null || xaphuong == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn  Xã/Phường!" });
					return false;
				}
			};
			return true;
		}
	});

});