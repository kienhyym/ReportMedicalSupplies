define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/tpl/model.html'),
		schema 				= require('json!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/DonViYTeSchema.json');
	var TinhThanhSelectView 	= require("app/view/DanhMuc/TinhThanh/SelectView");
    var QuanHuyenSelectView 	= require("app/view/DanhMuc/QuanHuyen/SelectView");
	var XaPhuongSelectView 	= require("app/view/DanhMuc/XaPhuong/SelectView");
	var TuyenDonViSelectView = require("app/view/DanhMuc/TuyenDonVi/SelectView");
	var DonviSelectView = require("app/view/quanlyCanbo/DangkiDonVi/DonviCaptrenSelectView");
	return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "donvi/create",
    	tools : [
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
						   // visible: false,
							command: function(){
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
								return (this.getApp().hasRole('admin_donvi') ===true || this.getApp().hasRole('admin') ===true);
							},
 			    	    	command: function(){
								var self = this;
								// var curUser = self.getApp().currentUser;
								// if (curUser) {
								// 	self.model.set("created_by",curUser.id);
								// }
								var donvi_ten = self.model.get("donvi_name"),
									captren_id = self.model.get("parent_id"),
									email = self.model.get("email"),
									donvi_email = self.model.get("donvi_email"),
									fullname = self.model.get("name"),
									phone = self.model.get("phone"),
									pass = self.model.get("password"),
									cfpass = self.model.get("cfpassword"),
									tuyendonvi = self.model.get("tuyendonvi");
								//  tuyendonvi_id = self.model.get("tuyendonvi_id"),
								//  tinhthanh = self.model.get("tinhthanh"),
								//  quanhuyen = self.model.get("quanhuyen"),
								//  xaphuong = self.model.get("xaphuong");
								if (fullname == null || fullname == "" ||fullname == undefined) {
									self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
									return
								}
								
								if  (phone == null || phone == ""){
									self.getApp().notify({ message: "Số điện thoại người dùng không được để trống!" }, { type: "danger" });
									return
								}
								if  (email == null || email == ""){
									self.getApp().notify({ message: "Email người dùng không được để trống!" }, { type: "danger" });
									return
								} else {
									self.model.set("email",email.toLowerCase());
								}

								if (!!donvi_email) {
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
								if  (donvi_ten == null || donvi_ten == ""){
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
								self.model.set("name",fullname.toUpperCase());
								self.model.set("donvi_name",donvi_ten.toUpperCase());
 			                    self.model.save(null,{
									success: function (model, respose, options) {
										self.getApp().notify("Tạo đơn vị thành công!");
										self.getApp().getRouter().navigate('admin/donvi/collection');
									},
									error: function (xhr, status, error) {
										try {
											if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
												self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
												self.getApp().getRouter().navigate("login");
											} else {
												self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
											}
										} catch (err) {
											self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
										}
									}
 			                    });
 			    	    	}
						},
 	    	    	],
 	    	    }],
	 	uiControl: {
			fields:[
				{
					field:"tinhthanh",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"tinhthanh_id",
					dataSource:TinhThanhSelectView
				},
				{
					field:"quanhuyen",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"quanhuyen_id",
					dataSource:QuanHuyenSelectView
				},
				{
					field:"xaphuong",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"xaphuong_id",
					dataSource:XaPhuongSelectView
				},
				{
					field:"tuyendonvi",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"tuyendonvi_id",
					dataSource:TuyenDonViSelectView
				},
				{
					field:"parent",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"parent_id",
					dataSource:DonviSelectView
				},
			]
		},
    	render:function(){
			var self = this;
			self.applyBindings();
			self.validate_password();
			var curUsr = self.getApp().currentUser;
			if(!self.model.get("tuyendonvi_id")) {
				self.disabled_select_captren(0);
			}
			self.model.on("change:tinhthanh", function() {
				var filterobj = {"tinhthanh_id": {"$eq": self.model.get("tinhthanh_id")}}; 
				self.getFieldElement("quanhuyen").data("gonrin").setFilters(filterobj);
				self.model.set({"quanhuyen":null,"xaphuong":null});
			});
			self.model.on("change:quanhuyen", function() {
				var filterobj = {"quanhuyen_id": {"$eq": self.model.get("quanhuyen_id")}}; 
				self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
				self.model.set({"xaphuong":null});
			});
			
			self.model.on("change", function(){
				var tuyendonvi_id = self.model.get("tuyendonvi_id");
				if (tuyendonvi_id == "02") {
					var filters = {"tuyendonvi_id": {"$eq": "01" }};
					self.getFieldElement("parent").data("gonrin").setFilters(filters);
				} else if (tuyendonvi_id == "03") {
					var tinhthanh_id = self.model.get("tinhthanh_id");
					if (!tinhthanh_id || tinhthanh_id == null ) {
						self.disabled_select_captren(0);
					} else {
						self.disabled_select_captren(1);
						var filters = { "$or": [
								{"tuyendonvi_id": {"$eq": "02" }},
						]};
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
						self.getFieldElement("parent").data("gonrin").setFilters(filterobj);
					}
				} else if (tuyendonvi_id == "04") {
					var tinhthanh_id = self.model.get("tinhthanh_id");
					if (!tinhthanh_id || tinhthanh_id == null ) {
						self.disabled_select_captren(0);
					} else {
						self.disabled_select_captren(1);
						var filters = { "$or": [
							{"tuyendonvi_id": {"$eq": "03" }},
						]};
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
						self.getFieldElement("parent").data("gonrin").setFilters(filterobj);
					}
				} else if (tuyendonvi_id == "05") {
					var quanhuyen_id = self.model.get("quanhuyen_id");
					if (!quanhuyen_id || quanhuyen_id == null ) {
						self.disabled_select_captren(0);
					} else {
						self.disabled_select_captren(1);
						var filters = { "$or": [
							{"tuyendonvi_id": {"$eq": "04" }}
						]};
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
						self.getFieldElement("parent").data("gonrin").setFilters(filterobj);
					}
				}
			});
			
		},
		validate_password: function() {
			var self = this;
			self.model.on("change:cfpassword", function() {
				var pwd = self.model.get('password');
				var confirm_pwd = self.model.get('cfpassword');
				if (pwd !==null && pwd !== "" && pwd !== undefined && pwd !== confirm_pwd) {
					self.getApp().notify({ message: "Mật khẩu không khớp.Vui lòng nhập lại!" }, { type: "danger" });
				}
			});
            self.model.on("change:password", function() {
				var pwd = self.model.get('password');

				var confirm_pwd = self.model.get('cfpassword');
				if (confirm_pwd !== null && confirm_pwd !== "" && confirm_pwd !== undefined && pwd !== confirm_pwd) {
					self.getApp().notify({ message: "Mật khẩu không khớp.Vui lòng nhập lại!" }, { type: "danger" });
				}
			});
		},
		disabled_select_captren: function(status = 0) {
			var self = this;
			//0 la khong the an nut,1 la co the an nut
			if (status == 1) {
				self.$el.find("#donvicaptren").prop('disabled', false);
			} else {
				self.$el.find("#donvicaptren").prop('disabled', true);
			}
		},
		valiedate_tuyendonvi: function() {
			var self = this;
			var tuyendonvi_id = self.model.get("tuyendonvi_id"),
				tinhthanh = self.model.get("tinhthanh"),
				quanhuyen = self.model.get("quanhuyen"),
				xaphuong = self.model.get("xaphuong");
			if ((tuyendonvi_id == "04" || tuyendonvi_id == "05" || tuyendonvi_id == "06") && (tinhthanh == null || tinhthanh == undefined)) {
				self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố "}, { type: "danger" });
				return false;
			}
			else if ((tuyendonvi_id == "07" || tuyendonvi_id == "08" || tuyendonvi_id == "09") && (quanhuyen == null || quanhuyen == undefined) ) {
				if (tinhthanh == null || tinhthanh == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" }, { type: "danger" });
					return false
				}
				else {
					self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" }, { type: "danger" });
					return false
				}
			}
			else if ((tuyendonvi_id == "10") && (xaphuong == null || xaphuong == undefined)) {
				if (tinhthanh == null || tinhthanh == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" }, { type: "danger" });
					return false;
				} else if (quanhuyen == null || quanhuyen == undefined) {
					self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" }, { type: "danger" });
					return false;
				} else {
					self.getApp().notify({ message: "Vui lòng chọn  Xã/Phường!" }, { type: "danger" });
					return false;
				}
			};
			return true;
		}
    });
});