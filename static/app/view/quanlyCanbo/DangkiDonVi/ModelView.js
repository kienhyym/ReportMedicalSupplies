define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/view/quanlyCanbo/DangkiDonVi/tpl/model.html'),
		schema 				= require('json!app/view/quanlyCanbo/DangkiDonVi/SchemaDonviDangki.json');
	var TinhThanhSelectView 	= require("app/view/DanhMuc/TinhThanh/SelectView");
    var QuanHuyenSelectView 	= require("app/view/DanhMuc/QuanHuyen/SelectView");
	var XaPhuongSelectView 	= require("app/view/DanhMuc/XaPhuong/SelectView");
	var TuyenDonViSelectView = require("app/view/DanhMuc/TuyenDonVi/SelectView");
	var DonviSelectView = require("app/view/quanlyCanbo/DangkiDonVi/DonviCaptrenSelectView");
	// var DonViYTe = require("app/view/DonViYTe/ModelView")
	// var schemaDonvi 	= require('json!app/view/DonViYTe/DonViYTeSchema.json');
	// var ModelDialogView = require("app/view/DonViYTe/UserDonVi/view/ModelDialogView");
	// if ($(window).width() <= 768) {}
	return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/canbo/api/v1/",
    	collectionName: "donvidangki",
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
 			    	    	buttonClass: "btn-success btn-sm",
							label: "TRANSLATE:SAVE",
							visible: function () {
								return (this.getApp().hasRole('admin_donvi') ===true || this.getApp().hasRole('admin') ===true);
							},
 			    	    	command: function(){
								var self = this;
								var donvi_ten = self.model.get("donvi_ten"),
									captren_id = self.model.get("captren_id"),
									email = self.model.get("email"),
									donvi_email = self.model.get("donvi_email"),
									fullname = self.model.get("fullname"),
									phone = self.model.get("phone"),
									pass = self.model.get("password"),
									cfpass = self.model.get("cfpassword"),
									donvi_tuyendonvi = self.model.get("donvi_tuyendonvi"),
									donvi_tuyendonvi_id = self.model.get("donvi_tuyendonvi_id"),
									tinhthanh = self.model.get("tinhthanh"),
									quanhuyen = self.model.get("quanhuyen"),
									xaphuong = self.model.get("xaphuong");
								
								if (fullname == null || fullname == "" ||fullname == undefined) {
									self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
									return
								}
								if  (donvi_ten == null || donvi_ten == ""){
									self.getApp().notify({ message: "Tên đơn vị không được để trống!" }, { type: "danger" });
									return
								}
								if  (phone == null || phone == ""){
									self.getApp().notify({ message: "Số điện thoại không được để trống!" }, { type: "danger" });
									return
								}
								if (pass == null || pass == "") {
									self.getApp().notify({ message: "Mật khẩu không được để trống!" }, { type: "danger" });
									return
								}
								if (pass == null || pass != cfpass) {
									self.getApp().notify({ message: "Xác nhận mật khẩu không đúng, vui lòng kiểm tra lại!" }, { type: "danger" });
									return
								}
								if (donvi_tuyendonvi == null || donvi_tuyendonvi == undefined) {
									self.getApp().notify({ message: "Chưa chọn khối cơ quan!" }, { type: "danger" });
									return
								}
								if (captren_id == null) {
									self.getApp().notify({ message: "Chưa chọn đơn vị cấp trên!" }, { type: "danger" });
									return false
								}
								if ((donvi_tuyendonvi_id == "04" || donvi_tuyendonvi_id == "05" || donvi_tuyendonvi_id == "06") && (tinhthanh == null || tinhthanh == undefined)) {
									self.getApp().notify({ message: "Chưa chọn tỉnh thành!" }, { type: "danger" });
									return false
								}
								else if ((donvi_tuyendonvi_id == "07" || donvi_tuyendonvi_id == "08" || donvi_tuyendonvi_id == "09") && (quanhuyen == null || quanhuyen == undefined) ) {
									self.getApp().notify({ message: "Chưa chọn quận huyện!" }, { type: "danger" });
									return false
								}
								else if ((donvi_tuyendonvi_id == "10") && (quanhuyen == null || quanhuyen == undefined) && (xaphuong == null || xaphuong == undefined)) {
									self.getApp().notify({ message: "Chưa chọn quận huyện, xã phường!" }, { type: "danger" });
									return
								}

								if(!!email) {
									self.model.set("email",email.toLowerCase());
								}
								
								if(!!donvi_email) {
									self.model.set("donvi_email",donvi_email.toLowerCase());
								}
								var id = self.getApp().getRouter().getParam("id");
								if (!id) {
									self.model.set('active',0);
									self.model.set('trangthai',0);
								}
								
								self.model.set("fullname",fullname.toUpperCase());
								self.model.set("donvi_ten",donvi_ten.toUpperCase());
 			                    self.model.save(null,{
									success: function (model, respose, options) {
										var id = self.getApp().getRouter().getParam("id");
										if (!!id ) {
											self.getApp().notify("Lưu đơn vị thông tin thành công!");
										} else {
											self.getApp().notify("Tạo đơn vị thành công.Đợi sự phê duyệt từ cấp trên !");
										}
										self.getApp().getRouter().navigate('canbo/donvi/collection');
									},
									error: function (xhr, status, error) {
											self.getApp().hideloading();
											self.getApp().notify("Tạo đơn vị không thành công. Vui lòng thử lại");
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
					field:"donvi_tuyendonvi",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"donvi_tuyendonvi_id",
					dataSource:TuyenDonViSelectView
				},
				{
					field:"captren",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"captren_id",
					dataSource:DonviSelectView
				},
			]
		},
    	render:function(){
			var self = this;
			var id = self.getApp().getRouter().getParam("id");
			if (id) {
				self.model.set('id',id);
				self.model.fetch({
					success: function (data) {
						var trangthai = self.model.get('trangthai');
						if (trangthai === 2 || trangthai === 1) {
							self.$el.find("input").attr("readonly",true);
						} else if (trangthai === 0) {
							self.button_duyet();
						}
						self.applyBindings();
						self.validate_password();
						self.select_captren();
						self.$el.find("div h3").remove();
					},
					error: function () {
						self.getApp().notify("Không lấy được dữ liêu.Vui lòng thử lại");
					}
				});
			} else {
				self.applyBindings();
				self.validate_password();
				self.select_captren();
			}
			
		},
		button_duyet: function () {
			var self = this;
			self.$el.find(".toolbar-group").append('<button type="button" btn-name="Duyet" class="btn btn-primary btn-sm button_duyet">Duyệt</button>');
			self.$el.find(".toolbar-group").append('<button type="button" btn-name="Duyet" class="btn btn-danger btn-sm button_khongduyet">Không duyệt</button>');
			self.$el.find(".button_duyet").unbind("click").bind("click",function() {
				var url = self.getApp().serviceURL + "/api/v1/admin/donvi/create";
				var curUser = self.getApp().currentUser;
				var email = self.model.get("email"),
				donvi_email = self.model.get("donvi_email");

				if(!!email) {
					self.model.set("email",email.toLowerCase());
				}
				
				if(!!donvi_email) {
					self.model.set("donvi_email",donvi_email.toLowerCase());
				}
				$.ajax({
					url: url,
					method: "POST",
					data: JSON.stringify(self.model.toJSON()),
					contentType: "application/json",
					success: function (obj) {
						self.model.set('active',1);
						self.model.set('trangthai',2);
						self.model.save(null,{
							success: function (model, respose, options) {
								self.getApp().notify("Duyệt thông tin đơn vị  thành công!");
								self.getApp().getRouter().navigate('canbo/donvidangki/collection');
							},
							error: function (xhr, status, error) {
								self.getApp().notify({ message: status.responseJSON.error_message}, { type: "danger", delay: 1000});
								// 	self.getApp().hideloading();
								// 	self.getApp().notify("Duyệt đơn vị không thành công. Vui lòng thử lại");
							}
						});
					},
					error: function (xhr, status, error) {
						try {
							if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
								
							} else {
								self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						}
						catch (err) {
						self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
						}
					}
				});
			});
			self.$el.find(".button_khongduyet").unbind("click").bind("click",function() {
				self.model.set('active',0);
				self.model.set('trangthai',1);

				var email = self.model.get("email"),
				donvi_email = self.model.get("donvi_email");

				if(!!email) {
					self.model.set("email",email.toLowerCase());
				}
				
				if(!!donvi_email) {
					self.model.set("donvi_email",donvi_email.toLowerCase());
				}

				self.model.save(null,{
					success: function (model, respose, options) {
						var id = self.getApp().getRouter().getParam("id");
						if (!!id ) {
							self.getApp().notify("Không duyệt đơn vị thành công!");
						} 
						self.getApp().getRouter().navigate('canbo/donvi/collection');
					},
					error: function (xhr, status, error) {
							self.getApp().hideloading();
							self.getApp().notify("Lỗi truy cập dữ liệu.Vui lòng thử lại sau");
						}
				});
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
		select_captren: function () {
			var self = this;
			if(!self.model.get("donvi_tuyendonvi")){
				self.getFieldElement("captren").data("gonrin").setFilters(null);
				self.$el.find("#donvicaptren").prop('disabled', true);
			}
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
			//////
			self.model.on("change", function(){
				self.$el.find("#donvicaptren").prop('disabled', false); 
				var donvi_tuyendonvi_id = self.model.get("donvi_tuyendonvi_id");
				if (donvi_tuyendonvi_id == "01" || donvi_tuyendonvi_id == "02" || donvi_tuyendonvi_id == "03" ){
					var filters = { "$or": [
						{"tuyendonvi_id": {"$eq": "01" }},
						{"tuyendonvi_id": {"$eq": "02" }},
						{"tuyendonvi_id": {"$eq": "03" }},
					]};
					self.getFieldElement("captren").data("gonrin").setFilters(filters);
				}
				else if (donvi_tuyendonvi_id == "04"|| donvi_tuyendonvi_id == "05" || donvi_tuyendonvi_id == "06"){
					var filters = { "$or": [
						{"tuyendonvi_id": {"$eq": "01" }},
						{"tuyendonvi_id": {"$eq": "02" }},
						{"tuyendonvi_id": {"$eq": "03" }},
					]};
					self.getFieldElement("captren").data("gonrin").setFilters(filters);
				} else if (donvi_tuyendonvi_id == "07" || donvi_tuyendonvi_id == "08" || donvi_tuyendonvi_id == "09") {
					if(!self.model.get("tinhthanh")){
						self.getFieldElement("captren").data("gonrin").setFilters(null);
						self.$el.find("#donvicaptren").prop('disabled', true);
					}
					var filters = { "$or": [
						{"tuyendonvi_id": {"$eq": "04" }},
						{"tuyendonvi_id": {"$eq": "05" }},
						{"tuyendonvi_id": {"$eq": "06" }},
					]};
					var filterobj = {
						"$and": [
							{
								"tinhthanh_id": {
									"$eq": self.model.get("tinhthanh_id")
								}
							},
							// filters
						]
					}
					self.getFieldElement("captren").data("gonrin").setFilters(filterobj);
					
				} else {
					//tuyen xa
					if(!self.model.get("quanhuyen")){
						self.getFieldElement("captren").data("gonrin").setFilters(null);
						self.$el.find("#donvicaptren").prop('disabled', true);
					}
					// console.log("quanhuyen")
					var filters = { "$or": [
						{"tuyendonvi_id": {"$eq": "07" }},
						{"tuyendonvi_id": {"$eq": "08" }},
						{"tuyendonvi_id": {"$eq": "09" }},
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
					self.getFieldElement("captren").data("gonrin").setFilters(filterobj);
				}
				
			});
		}
    });

});