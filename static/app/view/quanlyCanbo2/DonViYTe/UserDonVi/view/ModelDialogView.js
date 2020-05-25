define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/quanlyCanbo/DonViYTe/UserDonVi/tpl/model.html'),
    	schema 				= require('json!app/view/quanlyCanbo/DonViYTe/UserDonVi/schema/UserSchema.json');
	var TinhThanhSelectView 	= require("app/view/DanhMuc/TinhThanh/SelectView");
	var QuanHuyenSelectView 	= require("app/view/DanhMuc/QuanHuyen/SelectView");
	var XaPhuongSelectView 	= require("app/view/DanhMuc/XaPhuong/SelectView");
	var TuyenDonViSelectView = require("app/view/DanhMuc/TuyenDonVi/SelectView");
	var DonviSelectView = require("app/view/quanlyCanbo/DangkiDonVi/DonviCaptrenSelectView");
	var RoleSelectView = require('app/view/HeThong/RoleQLCB/SelectView');
	var DanTocSelectView 	= require("app/view/DanhMuc/DanToc/SelectView");
	// var TrinhdohocvanSelectView 	= require("app/view/quanlyCanbo/DanhMuc/TrinhDoHocVan/SelectView");
	var QuocGiaSelectView 	= require("app/view/DanhMuc/QuocGia/SelectView");
    // var check_role_canbo  = (gonrinApp().hasRole('admin_canbo') ===false && gonrinApp().hasRole('admin')=== false);

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/canbo/api/v1/",
    	collectionName: "user",
    	uiControl:{
	    		fields:[
	    			{				
						field:"roles",
						label:"Vai trò",
						uicontrol:"ref",
						textField: "name",
						selectionMode: "multiple",
						dataSource: RoleSelectView
					},
					// {
	   				// 	field:"ngaysinh",
					// 	   uicontrol:"datetimepicker",
					// 	   format:"DD/MM/YYYY",
	   				// 	textFormat:"DD/MM/YYYY",
	   				// 	extraFormats:["DDMMYYYY"],
	   				// 	parseInputDate: function(val){
	   				// 		return gonrinApp().parseDate(val);
	                // 	},
	                // 	parseOutputDate: function(date){
	                // 		return date.unix();
	                // 	}
	   				// },
	   				// {
	   				// 	field:"thoihanchungchi",
					// 	   uicontrol:"datetimepicker",
					// 	   format:"DD/MM/YYYY",
	   				// 	textFormat:"DD/MM/YYYY",
	   				// 	extraFormats:["DDMMYYYY"],
	   				// 	parseInputDate: function(val){
	   				// 		return gonrinApp().parseDate(val);
	                // 	},
	                // 	parseOutputDate: function(date){
	                // 		return date.unix();
	                // 	}
	   				// },
					{
	    				field:"dantoc",
	    				uicontrol:"ref",
	    				textField: "ten",
	    				foreignRemoteField: "id",
	    				foreignField: "dantoc_id",
	    				dataSource: DanTocSelectView
	    			},
	    			{
	   					field:"gioitinh",
	   					uicontrol:"combobox",
	   					textField: "text",
	                    valueField: "value",
	                    cssClass:"form-control",
	   					dataSource: [
	                        { value: '1', text: "Nam" },
	                        { value: '0', text: "Nữ" },
	                    ],
	   				},
	    			{
	    				field:"quocgia",
	    				uicontrol:"ref",
	    				textField: "ten",
	    				foreignRemoteField: "id",
	    				foreignField: "quocgia_id",
	    				dataSource: QuocGiaSelectView
	    			},
	        		{
	    				field:"tinhthanh",
	    				uicontrol:"ref",
	    				textField: "ten",
	    				foreignRemoteField: "id",
	    				foreignField: "tinhthanh_id",
	    				dataSource: TinhThanhSelectView
	    			},
	    			{
	    				field:"quanhuyen",
	    				uicontrol:"ref",
	    				textField: "ten",
	    				foreignRemoteField: "id",
	    				foreignField: "quanhuyen_id",
	    				dataSource: QuanHuyenSelectView
	    			},
	    			{
	    				field:"xaphuong",
	    				uicontrol:"ref",
	    				textField: "ten",
	    				foreignRemoteField: "id",
	    				foreignField: "xaphuong_id",
	    				dataSource: XaPhuongSelectView
	    			}
	        	]
	    	},
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
							visible: function () {
								return true;
							},
							command: function () {
								var self = this;
								self.getApp().getRouter().refresh();
								// Backbone.history.history.back();
							}
						},
  			    	    {
  							name: "save",
  							type: "button",
  							buttonClass: "btn-success btn-sm button_save",
  							label: "TRANSLATE:SAVE",
  							command: function(){
  								var self = this;
  								var validate = self.validate();
  				    			if (validate === false){
  				    				return;
  				    			}
 				    			var viewData = self.viewData.data;
 				    			if (viewData!==null && viewData !==undefined){
 				    				self.model.set("id",viewData.id);
								}
								var curUser = self.getApp().currentUser;
								if (curUser) {
									self.model.set("madonvi_bmte",curUser.madonvi_bmte);
								}
								var ten = self.model.get("fullname");
								self.model.set("fullname",ten.toUpperCase());
								self.model.set("tenkhongdau",gonrinApp().convert_khongdau(ten));
								
								var email = self.model.get("email");
								if(!!email) {
									self.model.set("email",email.toLowerCase());
								}
  				            	self.getApp().showloading();
  						        self.model.save(null,{
  						            success: function (model, respose, options) {
  						            	self.getApp().hideloading();
  						                self.getApp().notify("Lưu dữ liệu thành công!");
	  						        
	  		                            self.getApp().getRouter().refresh();
  						            },
  						            error: function (xhr, status, error) {
  						            	self.getApp().hideloading();
										try {
											if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
												self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
												// self.getApp().getRouter().navigate("login");
											} else {
											  self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
											}
										}
										catch (err) {
										  self.getApp().notify({ message: "Lưu dữ liệu không thành công"}, { type: "danger", delay: 1000 });
										}
									}
  						        });
  							}
						},
  						{
 			    	    	name: "delete",
 			    	    	type: "button",
 			    	    	buttonClass: "btn-danger btn-sm button_xoa",
 			    	    	label: "TRANSLATE:DELETE",
 			    	    	visible: function(){
								var self = this;
								var dataview;
								if(!!self.viewData) {
									var dataview = self.viewData.data;
								}
  								var currentUser = self.getApp().currentUser;
  								
  					    		if(dataview!==undefined && dataview!==null){
  	  								return ((this.getApp().hasRole('admin_donvi') ===true && dataview.id !== currentUser.uid_canbo)|| this.getApp().hasRole('admin')=== true);
  					    		}else{
  					    			return false;
  					    		}
 			    	    	},
 			    	    	command: function(){
 			    	    		var self = this;
 			    	    		self.getApp().showloading();
			    	    		var viewData = self.viewData.data;
	 			       			if (viewData!==null && viewData !==undefined && viewData.uid_canbo!==null) {
	 			       				self.model.set("id",viewData.id);
								}
 			                    self.model.destroy({
 			                        success: function(model, response) {
 			                        	self.getApp().hideloading();
										 self.getApp().notify('Xóa cán bộ thành công');
										 self.getApp().getRouter().refresh();
 			                        },
 			                       error: function (xhr, status, error) {
 			                    	  self.getApp().hideloading();
 										try {
 											if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
 												self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
 												self.getApp().getRouter().navigate("login");
 											} else {
 											  self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
 											}
 										}
 										catch (err) {
 										  self.getApp().notify({ message: "Xóa cán bộ không thành công"}, { type: "danger", delay: 1000 });
 										}
 									}
 			                    });
 			    	    	}
 			    	    },
  	    	    	]
  	    	    },
  	    	],
  	    	
    	render: function(){
			var self = this;
			var curUser = self.getApp().currentUser;
			self.button_khoa_mo_taikhoan();
			if (curUser) {
				


				self.applyBindings();
				
				var dataview = self.viewData.data;
				if (gonrinApp().hasRole('admin_donvi') ===true || gonrinApp().hasRole('admin')=== true){
					self.$el.find(".roless").show();
				} else {
					self.$el.find(".roless").hide();
				}
				if(dataview !== undefined && dataview !== null) {
					self.model.set(dataview);
					var active = self.model.get("active");
					if (dataview.id === curUser.uid_canbo) {
						self.$el.find(".button_xoa").hide();
						self.$el.find(".button_khoa").hide();
						self.$el.find(".roless").hide();
						if (active == 0 || active == false) {
							self.$el.find("input").attr("readonly",true);
						}
					}
				} else {
					self.model.set("madonvi_bmte", curUser.madonvi_bmte);
					self.model.set("donvi_id", curUser.id);
					self.$el.find(".button_xoa").hide();
					
				}
				gonrinApp().process_datetime(self, "date","ngaysinh","ngaysinh",self.model.get("ngaysinh"),null, null);
				gonrinApp().process_datetime(self, "date","thoihanchungchi","thoihanchungchi",self.model.get("thoihanchungchi"),null, null);

				self.model.on("change:tinhthanh", function() {
					var filterobj = {"tinhthanh_id": {"$eq": self.model.get("tinhthanh_id")}};
					self.model.set({"quanhuyen":null,"xaphuong":null});
					self.getFieldElement("quanhuyen").data("gonrin").setFilters(filterobj);
					
				});
				self.model.on("change:quanhuyen", function() {
					var filterobj = {"quanhuyen_id": {"$eq": self.model.get("quanhuyen_id")}};
					self.model.set("xaphuong",null);
					self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
					
				});
				
				var tuyendonvi_id = curUser.tuyendonvi_id;
				if (!tuyendonvi_id || tuyendonvi_id === "" || tuyendonvi_id == null  || tuyendonvi_id !== "01") {
						var filters = { "$or": [
						{"name": {"$eq": "canbo" }},
						{"name": {"$eq": "admin_donvi" }},
					]};
					self.getFieldElement("roles").data("gonrin").setFilters(filters);
				
				}
				return this;
			}
    	},
    	validate: function(){
    		var self = this;
    		var id = self.model.get("id");
    		var password =self.model.get("password");
			
    		var hoten = self.model.get("fullname");
			var phone_number = self.model.get("phone_national_number");
			var macongdan = self.model.get("id_card");
    		if (hoten === null || hoten ===""){
    			self.getApp().notify("Vui lòng nhập họ và tên cán bộ");
    			return false;
    		}
    		if (phone_number === null || phone_number ===""){
    			self.getApp().notify("Vui lòng nhập số điện thoại cán bộ");
    			return false;
    		}else{
    			self.model.set("phone_number",phone_number);
			}
			var confirm_pass = self.model.get("confirm_password");
    		if(id === null || id ===""){
    			if (password===null || confirm_pass === null || password==="" || confirm_pass === ""){
    				self.getApp().notify("Vui lòng nhập mật khẩu");
    				return false;
    			}
    		}
    		if(password!==null && password!="" && password !==confirm_pass){
				self.getApp().notify("Mật khẩu không khớp!");
				return false;
			}
			if(macongdan == null || macongdan =="" || macongdan == undefined){
				self.getApp().notify("Vui lòng nhập mã công dân!");
				return false;
			}
    		return true;
		},
		button_khoa_mo_taikhoan: function () {
			var self = this;
			var viewData = self.viewData;
			if (viewData && viewData.data && viewData.data !== "" && viewData.data !== null) {
				
				var active = viewData.data.active;
				if (active == 0 || active == false) {
					self.$el.find(".toolbar-group").append('<button type="button" btn-name="Duyet" class="btn btn-primary btn-sm button_mo">Mở</button>');
				} 
				if (active == 1 || active == true) {
					self.$el.find(".toolbar-group").append('<button type="button" btn-name="Khoa" class="btn btn-danger btn-sm button_khoa">Khóa</button>');
				}
				
				self.$el.find(".button_khoa").unbind("click").bind("click",function() {
					self.model.set("active",0);
					var validate = self.validate();
					if (validate === false){
						return false;
					}
					var email = self.model.get("email");
					if(!!email) {
						self.model.set("email",email.toLowerCase());
					}

					self.model.save(null,{
						success: function (data, respose, options) {
							self.getApp().notify("Khóa tài khoản cán bộ thành công");
							self.getApp().getRouter().refresh();
						},
						error: function (xhr, status, error) {
							self.getApp().hideloading();
							self.getApp().notify({ message: "Khóa cán bộ không thành công. Vui lòng thử lại sau!"}, { type: "danger", delay: 1000 });
						}
					});
				});
				self.$el.find(".button_mo").unbind("click").bind("click",function() {
					self.model.set("active",1);
					var email = self.model.get("email");
					if(!!email) {
						self.model.set("email",email.toLowerCase());
					}

					var validate = self.validate();
					if (validate === false){
						return false;
					}
					self.model.save(null,{
						success: function (data, respose, options) {
							self.getApp().notify("Mở tài khoản cán bộ thành công");
							self.getApp().getRouter().refresh();
						},
						error: function (xhr, status, error) {
							self.getApp().hideloading();
							self.getApp().notify({ message: "Mở cán bộ không thành công. Vui lòng thử lại sau!"}, { type: "danger", delay: 1000 });
						}
					});
				});
			}
		},
    });

});