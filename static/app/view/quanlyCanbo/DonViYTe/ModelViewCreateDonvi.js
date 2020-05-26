define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/view/quanlyCanbo/DonViYTe/tpl/modelcreatedonvi.html'),
		schema = require('json!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/DonViYTeSchema.json');
	var TinhThanhSelectView = require("app/view/DanhMuc/TinhThanh/SelectView");
	var QuanHuyenSelectView = require("app/view/DanhMuc/QuanHuyen/SelectView");
	var XaPhuongSelectView = require("app/view/DanhMuc/XaPhuong/SelectView");
	var TuyenDonViSelectView = require("app/view/DanhMuc/TuyenDonVi/SelectView");
	var DonviSelectView = require("app/view/quanlyCanbo/DangkiDonVi/DonviCaptrenSelectView");
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
								phone = self.model.get("phone"),
								email = self.model.get("email"),
								donvi_email = self.model.get("donvi_email"),
								pass = self.model.get("password"),
								cfpass = self.model.get("cfpassword"),
								tuyendonvi = self.model.get("tuyendonvi");
							if (fullname == null || fullname == "" || fullname == undefined) {
								self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
								return
							}
							// if (phone == null || phone == "") {
							// 	self.getApp().notify({ message: "Số điện thoại người dùng không được để trống!" }, { type: "danger" });
							// 	return
							// }
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
							if (tuyendonvi == null || tuyendonvi == undefined) {
								self.getApp().notify({ message: "Chưa chọn tuyến đơn vị!" }, { type: "danger" });
								return
							}
							var valiedate_tuyendonvi = self.valiedate_tuyendonvi();
							if (valiedate_tuyendonvi == false) {
								return
							}

							self.model.set("name", fullname.toUpperCase());
							self.model.set("donvi_name", donvi_ten.toUpperCase());

							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify("Tạo đơn vị thành công!");
									self.getApp().getRouter().navigate('canbo/donvi/collection');
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
					field: "tuyendonvi",
					uicontrol: "ref",
					foreignRemoteField: "id",
					foreignField: "tuyendonvi_id",
					dataSource: TuyenDonViSelectView
				},
				{
					field: "parent",
					uicontrol: "ref",
					foreignRemoteField: "id",
					foreignField: "parent_id",
					dataSource: DonviSelectView
				},
			]
		},
		render: function () {
			var self = this;
			var curUsr = self.getApp().currentUser;
			if (curUsr) {
				var url = self.getApp().serviceURL + "/api/v1/donvi/" + curUsr.organization_id;
				$.ajax({
					url: url,
					method: "GET",
					contentType: "application/json",
					success: function (obj) {
						self.select_tuyendonvi(obj);
						self.model.set("parent", obj);
						// console.log("parent", self.model.get("parent"));
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
		get_tuyendonvi: function (obj, matuyendonvi = null) {
			var self = this,
				url;
			if (matuyendonvi !== null) {
				url = self.getApp().serviceURL + "/api/v1/tuyendonvi?ma=" + matuyendonvi;
			} else {
				var tuyendonvi_id = obj.tuyendonvi_id;
				url = self.getApp().serviceURL + "/api/v1/tuyendonvi?id=" + tuyendonvi_id;
			}
			$.ajax({
				url: url,
				method: "GET",
				contentType: "application/json",
				success: function (data) {
					if (!!data.objects){
						if (matuyendonvi == null) {
							self.trigger("get_tuyendonvi_1", {"data": data.objects[0]});
						} else {
							self.model.set("tuyendonvi", data.objects[0])
							self.$el.find("#tuyendonvi").prop("disabled", true);
						}
					}
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
				}
			});
		},
		select_tuyendonvi: function (obj) {
			var self = this;
			if (obj.tuyendonvi_id == "16" || obj.tuyendonvi_id == "17") {
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
				console.log("donvi_tuyendonvi_id=======", donvi_tuyendonvi_id);
				if (donvi_tuyendonvi_id == "1") {
					var filters = {
						"$or": [
							{ "id": { "$eq": "6" } },
							{ "id": { "$eq": "7" } },
							{ "id": { "$eq": "8" } },
						]
					};
					self.getFieldElement("tuyendonvi").data("gonrin").setFilters(filters);
				}
				else if (donvi_tuyendonvi_id == "6" || donvi_tuyendonvi_id == "7" || donvi_tuyendonvi_id == "8") {
					self.model.set("tinhthanh", obj.tinhthanh);
					self.$el.find("#matinhthanh").prop("disabled", false);
					var filters = {
						"$or": [
							{ "id": { "$eq": "9" } },
							{ "id": { "$eq": "10" } },
							{ "id": { "$eq": "11" } },
						]
					};
					self.getFieldElement("tuyendonvi").data("gonrin").setFilters(filters);
				}
				else if (donvi_tuyendonvi_id == "09" || donvi_tuyendonvi_id == "10" || donvi_tuyendonvi_id == "11") {
					self.model.set("quanhuyen", obj.quanhuyen);
					self.$el.find("#maquanhuyen").prop("disabled", false);
					var filters = {
						"$or": [
							{ "id": { "$eq": "12" } },
							{ "id": { "$eq": "13" } },
							{ "id": { "$eq": "14" } },
							{ "id": { "$eq": "15" } },
						]
					};
					self.getFieldElement("tuyendonvi").data("gonrin").setFilters(filters);
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
			var tuyendonvi_id = self.model.get("tuyendonvi_id"),
				tinhthanh = self.model.get("tinhthanh"),
				quanhuyen = self.model.get("quanhuyen"),
				xaphuong = self.model.get("xaphuong");
			if (tuyendonvi_id) {
				// var matuyendonvi = tuyendonvi.ma;
				if ((tuyendonvi_id == "2" || tuyendonvi_id == "3") && (tinhthanh == null || tinhthanh == undefined)) {
					self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố " });
					return false;
				}
				else if (tuyendonvi_id == "4") {
					if (tinhthanh == null || tinhthanh == undefined) {
						self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" });
						return false
					} else if (quanhuyen == null || quanhuyen == undefined){
						self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" });
						return false
					}
				}
				else if (tuyendonvi_id == "5") {
					if (tinhthanh == null || tinhthanh == undefined) {
						self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" });
						return false;
	
					} else if (quanhuyen == null || quanhuyen == undefined) {
						self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" });
						return false;
	
					} else if (xaphuong == null || xaphuong == undefined){
						self.getApp().notify({ message: "Vui lòng chọn  Xã/Phường!" });
						return false;
					}
				};
			}
			return true;
		}
	});
});