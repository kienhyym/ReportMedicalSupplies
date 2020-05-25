define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/tpl/model.html'),
        schema = require('json!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/DonViYTeSchema.json');
    var TinhThanhSelectView = require("app/view/DanhMuc/TinhThanh/SelectView");
    var QuanHuyenSelectView = require("app/view/DanhMuc/QuanHuyen/SelectView");
    var XaPhuongSelectView = require("app/view/DanhMuc/XaPhuong/SelectView");
    var DonviSelectView = require("app/view/quanlyCanbo/DangkiDonVi/DonviCaptrenSelectView");
    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvi/create",
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-default btn-sm",
                    label: "TRANSLATE:BACK",
                    command: function() {
                        Backbone.history.history.back();
                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success btn-sm taodonvi",
                    label: "TRANSLATE:SAVE",
                    visible: function() {
                        return this.getApp().hasRole('admin');
                    },
                    command: function() {
                        var self = this;
                        var curUser = self.getApp().currentUser;
                        if (curUser) {
                            self.model.set("created_by", curUser.id);
                        }
                        var level = self.model.get("level"),
                            donvi_name = self.model.get("donvi_name"),
                            donvi_email = self.model.get("donvi_email"),
                            name = self.model.get("name"),
                            phone = self.model.get("phone"),
                            email = self.model.get("email"),
                            pass = self.model.get("password"),
                            cfpass = self.model.get("cfpassword"),
                            parent = self.model.get("parent");

                        if (donvi_name == null || donvi_name == "") {
                            self.getApp().notify({ message: "Tên đơn vị không được để trống!" }, { type: "danger" });
                            return
                        }
                        if (level == null || level == undefined) {
                            self.getApp().notify({ message: "Chưa chọn tuyến đơn vị!" }, { type: "danger" });
                            return
                        }
                        if (parent != null && parent != undefined) {
                            self.model.set("parent_name", parent.name);
                        }
                        if (self.valiedate_level() == false) {
                            return false;
                        }
                        if (name == null || name == "" || name == undefined) {
                            self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
                            return
                        }
                        // if (phone == null || phone == "") {
                        //     self.getApp().notify({ message: "Số điện thoại người dùng không được để trống!" }, { type: "danger" });
                        //     return
                        // }
                        if (email == null || email == "") {
                            self.getApp().notify({ message: "Email người dùng không được để trống!" }, { type: "danger" });
                            return
                        }
                        self.model.set("email", email.toLowerCase());

                        if (!!donvi_email) {
                            self.model.set("donvi_email", donvi_email.toLowerCase());
                        }
                        if (pass == null || pass == "") {
                            self.getApp().notify({ message: "Mật khẩu không được để trống!" }, { type: "danger" });
                            return
                        }
                        if (pass == null || pass != cfpass) {
                            self.getApp().notify({ message: "Xác nhận mật khẩu không đúng, vui lòng kiểm tra lại!" }, { type: "danger" });
                            return
                        }
                        if (self.validate_password() == false) {
                            return false;
                        }

                        self.model.set("name", name.toUpperCase());
                        self.model.set("donvi_name", donvi_name.toUpperCase());

                        self.model.save(null, {
                            success: function(model, respose, options) {
                                self.getApp().notify("Tạo đơn vị thành công!");
                                self.getApp().getRouter().navigate('admin/donvi/collection');
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
                                  self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
                                }
                            }
                        });
                    }
                },
            ],
        }],
        uiControl: {
            fields: [{
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
                    field: "parent",
                    uicontrol: "ref",
                    foreignRemoteField: "id",
                    foreignField: "parent_id",
                    dataSource: DonviSelectView
                },
                {
                    field: "level",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Bệnh viện" },
                        { value: 2, text: "Trạm y tế" }
                    ],
                },
            ]
        },
        render: function() {
            var self = this;
            self.applyBindings();
            self.validate_password();
            // self.$el.find("#donvicaptren").prop('disabled', true);
            self.model.on("change:tinhthanh_id", function() {
                var filterobj = { "tinhthanh_id": { "$eq": self.model.get("tinhthanh_id") } };
                self.getFieldElement("quanhuyen").data("gonrin").setFilters(filterobj);
                self.model.set({ "quanhuyen": null, "xaphuong": null });
            });
            self.model.on("change:quanhuyen_id", function() {
                var filterobj = { "quanhuyen_id": { "$eq": self.model.get("quanhuyen_id") } };
                self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
                self.model.set({ "xaphuong": null, "parent": null });
            });
            // self.model.on("change:tinhthanh_id", function(){
            //     self.getFieldElement("quanhuyen").data("gonrin").setFilters({"tinhthanh_id": { "$eq": self.model.get("tinhthanh_id")}});

            // });
            // self.model.on("change:quanhuyen_id", function(){
            //     self.getFieldElement("xaphuong").data("gonrin").setFilters({"quanhuyen_id": { "$eq": self.model.get("quanhuyen_id")}});

            // });
            self.$el.find(".parent_donvi").unbind("click").bind("click", function() {
                self.valiedate_level();
            });
            self.model.on("change", function() {
                var level = self.model.get("level");
                if (level == 2) {
                    self.$el.find("#donvicaptren").prop('disabled', false);
                    var filters = { "quanhuyen_id": { "$eq": self.model.get("quanhuyen_id") } };
                    self.getFieldElement("parent").data("gonrin").setFilters(filters);
                }
            });
        },
        validate_password: function() {
            var self = this;
            self.model.on("change:cfpassword", function() {
                var pwd = self.model.get('password');
                var confirm_pwd = self.model.get('cfpassword');
                if (pwd !== null && pwd !== "" && pwd !== undefined && pwd !== confirm_pwd) {
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
        valiedate_level: function() {
            var self = this;
            var level = self.model.get("level"),
                tinhthanh = self.model.get("tinhthanh"),
                xaphuong = self.model.get("xaphuong"),
                quanhuyen = self.model.get("quanhuyen");
            if (!!level) {
                if (tinhthanh == null || tinhthanh == undefined) {
                    self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố!" });
                    self.$el.find("#donvicaptren").prop('disabled', true);
                    return false;

                } else if (quanhuyen == null || quanhuyen == undefined) {
                    self.getApp().notify({ message: "Vui lòng chọn Quận/Huyện!" });
                    self.$el.find("#donvicaptren").prop('disabled', true);
                    return false;

                } else if ((xaphuong == null || xaphuong == undefined) && level == 2) {
                    self.getApp().notify({ message: "Vui lòng chọn  Xã/Phường!" });
                    return false;
                }
            }
            return true;
        }
    });
});