define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template 		= require('text!app/view/quanlyCanbo/DonViYTe/tpl/model.html'),
	schema 				= require('json!app/view/quanlyCanbo/DonViYTe/DonViYTeSchema.json');
	var TinhThanhSelectView 	= require("app/view/DanhMuc/TinhThanh/SelectView");
    var QuanHuyenSelectView 	= require("app/view/DanhMuc/QuanHuyen/SelectView");
    var XaPhuongSelectView 	= require("app/view/DanhMuc/XaPhuong/SelectView");
	var TuyenDonViSelectView = require("app/view/DanhMuc/TuyenDonVi/SelectView"),
		DonviSelectView = require("app/view/quanlyCanbo/DangkiDonVi/DonviCaptrenSelectView");
	var UserDonViDialogView = require('app/view/quanlyCanbo/DonViYTe/UserDonVi/view/ModelDialogView');
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "donvi",
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
						visible: function () {
							var self = this;
							var uid = "id";
							if (self.getApp().currentUser) {
								uid = self.getApp().currentUser.donvi_id;
							}
							var id_donvi = this.getApp().getRouter().getParam("id");
							if (uid === id_donvi || !id_donvi) {
								return false;
							} else {
								return true;
							}
						},
						command: function () {
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm button_save",
						label: "TRANSLATE:SAVE",
						visible: function () {
							return (this.getApp().hasRole('admin_donvi') ===true || this.getApp().hasRole('admin')=== true);
						},
						command: function () {
							var self = this;
							var ten = self.model.get("name");
							// var sodienthoai = self.model.get("phone");
							var email = self.model.get("email");
							if(!!email) {
								self.model.set("email",email.toLowerCase());
							}

							if(!ten || ten == null || ten == "") {
								self.getApp().notify("Tên đơn vị không được để trống.Vui lòng nhập tên đơn vị!");
								return false;
							}
							// if(!sodienthoai || sodienthoai == null || sodienthoai == "") {
							// 	self.getApp().notify("Số điện thoại không được để trống.Vui lòng nhập số điện thoại!");
							// 	return false;
							// }
							self.model.set("name",ten.toUpperCase());
							self.model.set("unsigned_name",gonrinApp().convert_khongdau(ten));
							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify("Sửa đơn vị thành công!");
									self.getApp().getRouter().refresh();
								},
								error: function (xhr, status, error) {
									self.getApp().notify({ message: status.responseJSON.error_message}, { type: "danger", delay: 1000});
								}
							});
						}
					},
					{
						name: "info",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: "Thông tin tài khoản",
						visible: function() {
							var self = this;
							var uid = "id";
							if (self.getApp().currentUser) {
								uid = self.getApp().currentUser.donvi_id;
							}
							//chi tài khoan admin don vi moi duoc xem chi tiết tài khoản của mình
							var id_donvi = this.getApp().getRouter().getParam("id");
							if (uid === id_donvi || !id_donvi) {
								return true;
							} else {
								return false;
							}
						},
						command: function () {
							var self = this;
							var uid = self.getApp().currentUser.id;
							var url = self.getApp().serviceURL + "/api/v1/user/"+uid;
							$.ajax({
								url: url,
								method: "GET",
								contentType: "application/json",
								success: function (obj) {
									// var userid_canbo = obj.uid_canbo;
									// obj.uid_canbo
									obj.id = uid;
									var dialogUserDonViView = new UserDonViDialogView({"viewData": {"donvi":self.model.toJSON(),"data":obj,"accept":0}});
									self.$el.find("#content").empty();
									dialogUserDonViView.render();
									self.$el.find("#content").append(dialogUserDonViView.el);
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
								},
							});
						}
					},
				],
			}],
		uiControl: {
			fields: [
				{
					field: "xaphuong",
					uicontrol: "ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "xaphuong_id",
					dataSource: XaPhuongSelectView
				},
				{
					field: "quanhuyen",
					uicontrol: "ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "quanhuyen_id",
					dataSource: QuanHuyenSelectView
				},
				{
					field: "tinhthanh",
					uicontrol: "ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "tinhthanh_id",
					dataSource: TinhThanhSelectView
				},
				{
  					field:"ngaysinh",
					  uicontrol:"datetimepicker",
					  format:"DD/MM/YYYY",
  					textFormat:"DD/MM/YYYY",
  					extraFormats:["DDMMYYYY"],
  					parseInputDate: function(val){
  						return gonrinApp().parseDate(val);
                	},
                	parseOutputDate: function(date){
                		return date.unix();
                	}
  				},
  				{
  				  	field:"tuyendonvi",
  				  	uicontrol: "ref",
	  				textField: "ten",
					foreignRemoteField: "id",
					foreignField: "tuyendonvi_id",
					dataSource: TuyenDonViSelectView
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
		render: function () {
			var self = this;
			var donvi_id = this.getApp().getRouter().getParam("id");
			var curUser = self.getApp().currentUser;
			if ( !!self.getApp().hasRole('canbo') && self.getApp().hasRole('admin_donvi') == false && self.getApp().hasRole('admin') == false ) {
				self.$el.find("input").prop('disabled', true);
				//tuyendonvi
			}
			if (curUser && !donvi_id) {
				donvi_id = curUser.organization_id;
			}
			if (donvi_id) {
				var url = self.getApp().serviceURL + "/api/v1/donvi/"+donvi_id;
				$.ajax({
					url: url,
					method: "GET",
					contentType: "application/json",
					success: function (data) {
						var curUser = self.getApp().currentUser;
						var users = data.users;
						if (!self.getApp().hasRole('admin') && (data.id !== curUser.organization_id)) {
							self.$el.find(".create-account-user").hide();
						}
						// if (!users || users.length == 0) {
						// 	self.$el.find(".create-account-user").hide();
						// }
						self.model.set(data);
						
						self.applyBindings();
						var tuyendonvi_id = data.tuyendonvi_id;
						self.filter_parent(tuyendonvi_id);
						self.model.on("change", function() {
							console.log("32456");
							var tuyendonvi_id = self.model.get("tuyendonvi_id");
							self.filter_parent(tuyendonvi_id);
						});
						self.getUserDonVi();
						
						if(!self.getApp().hasRole('admin')) {
							self.$el.find(".tuyendonvi input").prop("disabled", true);
							self.$el.find("#parent_donvi").hide();
						}
						self.$el.find(".madonvi").removeClass("d-none");
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
						
						self.button_duyet();
						// self.getUserDonVi();
						self.$el.find(".create-account-user").unbind("click").bind("click", function() {
                            var dialogUserDonViView = new UserDonViDialogView({ "viewData": { "donvi": "", "data": null, "create_new": true , "organization_id": self.model.get("id")} });
                            self.$el.find("#content").empty();
                            dialogUserDonViView.render();
                            self.$el.find("#content").append(dialogUserDonViView.el);
                        });
					},
					error: function (xhr, status, error) {
						try {
							if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} else {
								self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						}catch (err) {
							self.getApp().notify({ message: "Lỗi không lấy được dữ liệu"}, { type: "danger", delay: 1000 });
						}
					}
				});
			}
			else {
				self.applyBindings();
				self.getApp().notify("Lỗi truy cập dữ liệu. Vui lòng thử lại sau")
				if(gonrinApp().hasRole("admin")) {
					self.getApp().getRouter().navigate("admin/donvi/collection");
				} else {
					self.getApp().getRouter().navigate("canbo/donvi/collection");
				}
			}
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
		filter_parent: function (tuyendonvi_id) {
			var self = this;
			var tinhthanh_id = self.model.get("tinhthanh_id");
			var quanhuyen_id = self.model.get("quanhuyen_id");
			if (tuyendonvi_id == "6" || tuyendonvi_id == "7" || tuyendonvi_id == "8") {
								self.$el.find("#donvicaptren").prop('disabled', false);
								var filters = {"tuyendonvi_id": {"$eq": "1" }};
								self.getFieldElement("parent").data("gonrin").setFilters(filters);
			} else if (tuyendonvi_id == "9" || tuyendonvi_id == "10" || tuyendonvi_id == "11") {
				var tinhthanh_id = self.model.get("tinhthanh_id");
				if (!tinhthanh_id || tinhthanh_id == null ) {
					self.disabled_select_captren(0);
				} else {
					self.disabled_select_captren(1);
					var filters = { "$or": [
							{"tuyendonvi_id": {"$eq": "6" }},
							{"tuyendonvi_id": {"$eq": "7" }},
							{"tuyendonvi_id": {"$eq": "8" }},
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
			} else if (tuyendonvi_id == "12" || tuyendonvi_id == "13" || tuyendonvi_id == "14" || tuyendonvi_id == "15") {
				var tinhthanh_id = self.model.get("tinhthanh_id");
				if (!tinhthanh_id || tinhthanh_id == null ) {
					self.disabled_select_captren(0);
				} else {
					self.disabled_select_captren(1);
					var filters = { "$or": [
						{"tuyendonvi_id": {"$eq": "9" }},
						{"tuyendonvi_id": {"$eq": "10" }},
						{"tuyendonvi_id": {"$eq": "11" }},
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
			} else if (tuyendonvi_id == "16" || tuyendonvi_id == "17") {
				var quanhuyen_id = self.model.get("quanhuyen_id");
				if (!quanhuyen_id || quanhuyen_id == null ) {
					self.disabled_select_captren(0);
				} else {
					console.log("ok mo");
					self.disabled_select_captren(1);
					var filters = { "$or": [
						{"tuyendonvi_id": {"$eq": "12" }},
						{"tuyendonvi_id": {"$eq": "13" }},
						{"tuyendonvi_id": {"$eq": "14" }},
						{"tuyendonvi_id": {"$eq": "15" }}
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
		},
		button_duyet: function () {
			var self = this;
			var donvi_id = this.getApp().getRouter().getParam("id");
			if (donvi_id) {
				var active = self.model.get("active");
				if (active === 0 || active === false) {
					self.$el.find(".toolbar-group").append('<button type="button" btn-name="Duyet" class="btn btn-primary btn-sm button_mo">Mở</button>');
				} else {
					self.$el.find(".toolbar-group").append('<button type="button" btn-name="Khoa" class="btn btn-danger btn-sm button_khoa">Khóa</button>');
				}
				
				self.$el.find(".button_mo").unbind("click").bind("click",function() {
					self.model.set("active",1);

					var email = self.model.get("email");
					if(!!email) {
						self.model.set("email",email.toLowerCase());
					}

					var ten = self.model.get("name");
					self.model.set("name",ten.toUpperCase());
					self.model.set("unsigned_name",gonrinApp().convert_khongdau(ten));
					self.model.save(null, {
						success: function (model, respose, options) {
							self.getApp().notify("Mở tài khoản đơn vị thành công!");
							if(gonrinApp().hasRole("admin")) {
								self.getApp().getRouter().navigate("admin/donvi/collection");
							} else {
								self.getApp().getRouter().navigate("canbo/donvi/collection");
							}
						},
						error: function (xhr, status, error) {
							self.getApp().hideloading();
								try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								} else {
									self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Mở đơn vị không thành công. Vui lòng thử lại sau!"}, { type: "danger", delay: 1000 });
							}
						}
					});
				});
				self.$el.find(".button_khoa").unbind("click").bind("click",function() {
					self.model.set("active",0);

					var email = self.model.get("email");
					if(!!email) {
						self.model.set("email",email.toLowerCase());
					}

					var ten = self.model.get("name");
					self.model.set("name",ten.toUpperCase());
					self.model.set("unsigned_name",gonrinApp().convert_khongdau(ten));
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Khóa đơn vị thành công!");
							if(gonrinApp().hasRole("admin")) {
								self.getApp().getRouter().navigate("admin/donvi/collection");
							} else {
								self.getApp().getRouter().navigate("canbo/donvi/collection");
							}
						},
						error: function (xhr, status, error) {
							self.getApp().hideloading();
								try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								} else {
									self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Khóa đơn vị không thành công. Vui lòng thử lại sau!"}, { type: "danger", delay: 1000 });
							}
						}
					});
				});
			}
		},
		getUserDonVi:function(){
			var self = this;
			if (self.getApp().hasRole('admin_donvi') ===false && self.getApp().hasRole('admin')=== false){
				self.$el.find(".users").hide();
			} else {
				$("#grid").html("");
				var madonvi = self.model.get("id");
				console.log(madonvi)
				var query = {
					"filters": { "organization_id": { "$eq": madonvi }}
					// "order_by": [{ "field": "updated_at", "direction": "desc" }]
				};
				var url_donvi = self.getApp().serviceURL + '/api/v1/user?results_per_page=1000&max_results_per_page=10000' + (query ? "&q=" + JSON.stringify(query) : "");
				$.ajax({
					url: url_donvi,
					method: "GET",
		    		contentType: "application/json",
					success: function (data) {
						$("#grid").grid({
		                	showSortingIndicator: true,
		                	onValidateError: function(e){
		                		console.log(e);
		                	},
		                	language:{
		                		no_records_found:" "
		                	},
		                	noResultsClass:"alert alert-default no-records-found",
		                	refresh:true,
		                	orderByMode: "client",
		                	fields: [
								{field: "name", label: "Họ và tên", sortable: {order:"asc"}},
								{field: "phone", label: "Số điện thoại"},
								{field: "email", label: "Email"},
								{field: "accountName", label: "Tên đăng nhập"},
								{
									field: "roles",
									label: "Vai trò",
									// textField: "name",
									template: function(rowData) {
										var roles = rowData.roles;
										if (roles.indexOf("admin_donvi")){
											return '<span>Admin</span>';
										} else {
											return '<span>Canbo</span>';
										}
									}
								},
							],
							dataSource: data.objects,
							primaryField:"id",
							selectionMode: "single",
							pagination: {
							page: 1,
							pageSize: 20
							},
							onRowClick: function(event) {
								var curUser = self.getApp().currentUser;
								var users = data.users;
								if ((!self.getApp().hasRole('admin') && (event.rowData.organization_id == curUser.organization_id)) || self.getApp().hasRole('admin') ) {
								
                                    var dialogUserDonViView = new UserDonViDialogView({ "viewData": { "donvi": "", "data": event.rowData } });
                                    self.$el.find("#content").empty(); 
                                    dialogUserDonViView.render();
                                    self.$el.find("#content").append(dialogUserDonViView.el);
                                }
                            },
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
					},
				});
			}
			
		},
		validateEmail: function (email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(String(email).toLowerCase());
		},
		validatePhone: function(inputPhone) {
			if (inputPhone == null || inputPhone == undefined) {
				return false;
			}
            var phoneno = /(09|08|07|05|03)+[0-9]{8}/g;
            const result = inputPhone.match(phoneno);
            if (result && result == inputPhone) {
                return true;
            } else {
                return false;
            }
		}
	});


});