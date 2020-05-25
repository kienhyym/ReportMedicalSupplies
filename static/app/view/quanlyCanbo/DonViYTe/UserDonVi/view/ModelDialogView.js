define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlyCanbo/DonViYTe/UserDonVi/tpl/model.html'),
        schema = require('json!app/view/quanlyCanbo/DonViYTe/UserDonVi/schema/UserSchema.json');
    var TinhThanhSelectView = require("app/view/DanhMuc/TinhThanh/SelectView");
    var QuanHuyenSelectView = require("app/view/DanhMuc/QuanHuyen/SelectView");
    var XaPhuongSelectView = require("app/view/DanhMuc/XaPhuong/SelectView");
    var RoleSelectView = require('app/view/HeThong/RoleQLCB/SelectView');

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "user",
        uiControl: {
            fields: [{
                    field: "roles",
                    label: "Vai trò",
                    uicontrol: "ref",
                    textField: "name",
                    selectionMode: "multiple",
                    dataSource: RoleSelectView
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
                    field: "quanhuyen",
                    uicontrol: "ref",
                    textField: "ten",
                    foreignRemoteField: "id",
                    foreignField: "quanhuyen_id",
                    dataSource: QuanHuyenSelectView
                },
                {
                    field: "xaphuong",
                    uicontrol: "ref",
                    textField: "ten",
                    foreignRemoteField: "id",
                    foreignField: "xaphuong_id",
                    dataSource: XaPhuongSelectView
                }
            ]
        },
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-default btn-sm",
                    label: "TRANSLATE:BACK",
                    visible: function() {
                        return true;
                    },
                    command: function() {
                        var self = this;
                        self.getApp().getRouter().refresh();
                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success btn-sm button_save",
                    label: "TRANSLATE:SAVE",
                    command: function() {
                        var self = this;
                        var validate = self.validate();
                        if (validate === false) {
                            return;
                        }
                        // var viewData = self.viewData.data;
                        // if (viewData !== null && viewData !== undefined) {
                        // self.model.set("id", viewData.id);
                        // }
                        var name = self.model.get("name");
                        self.model.set("name", name.toUpperCase());

                        var email = self.model.get("email");
                        if (!!email) {
                            self.model.set("email", email.toLowerCase());
                        }

                        self.getApp().showloading();
                        self.model.save(null, {
                            success: function(model, respose, options) {
                                self.getApp().hideloading();
                                self.getApp().notify("Lưu dữ liệu thành công!");

                                self.getApp().getRouter().refresh();
                            },
                            error: function(xhr, status, error) {
                                self.getApp().hideloading();
                                try {
                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                        // self.getApp().getRouter().navigate("login");
                                    } else {
                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                    }
                                } catch (err) {
                                    self.getApp().notify({ message: "Lưu dữ liệu không thành công" }, { type: "danger", delay: 1000 });
                                }
                            }
                        });
                    }
                },
                {
                    name: "delete",
                    type: "button",
                    buttonClass: "btn-secondary btn-sm button_xoa",
                    label: "TRANSLATE:DELETE",
                    visible: function() {
                        // return false;
                        var self = this;
                        var dataview;
                        if (!!self.viewData) {
                            var dataview = self.viewData.data;
                        }
                        var currentUser = self.getApp().currentUser;

                        if (dataview !== undefined && dataview !== null) {
                            return (((this.getApp().hasRole('admin_tyt') === true || this.getApp().hasRole('admin_benhvien') === true) && dataview.organization_id == currentUser.organization_id) || this.getApp().hasRole('admin') === true);
                        } else {
                            return false;
                        }
                    },
                    command: function() {
                        var self = this;
                        self.getApp().showloading();
                        // var viewData = self.viewData.data;
                        // if (viewData !== null && viewData !== undefined && viewData.id !== null) {
                        //     self.model.set("id", viewData.id);
                        // }
                        var currentUser = self.getApp().currentUser;
                        self.model.set({ "deleted": true, "deleted_by": currentUser.id });
                        self.model.save(null, {
                            success: function(model, respose, options) {
                                self.getApp().hideloading();
                                self.getApp().notify("Lưu dữ liệu thành công!");

                                self.getApp().getRouter().refresh();
                            },
                            error: function(xhr, status, error) {
                                self.getApp().hideloading();
                                try {
                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                        // self.getApp().getRouter().navigate("login");
                                    } else {
                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                    }
                                } catch (err) {
                                    self.getApp().notify({ message: "Lưu dữ liệu không thành công" }, { type: "danger", delay: 1000 });
                                }
                            }
                        });
                    }
                },
            ]
        }, ],
        render: function() {
            var self = this;
            var curUser = self.getApp().currentUser;
            self.button_khoa_mo_taikhoan();
            if (curUser) {
                self.applyBindings();
                var dataview = self.viewData.data;
                console.log(dataview);
                if (gonrinApp().hasRole('admin_tyt') === true || gonrinApp().hasRole('admin_benhvien') === true || gonrinApp().hasRole('admin') === true) {
                    self.$el.find(".roless").show();
                } else {
                    self.$el.find(".roless").hide();
                }
                if (dataview !== undefined && dataview !== null) {
                    //khong phai tao moi
                    self.model.set(dataview);

                    var active = self.model.get("active");
                    if (dataview.id === curUser.id) {
                        self.$el.find(".button_xoa").hide();
                        self.$el.find(".button_khoa").hide();
                        self.$el.find(".roless").hide();
                        if (active == 0 || active == false) {
                            self.$el.find("input").attr("readonly", true);
                        }
                    }
                } else {
                    // "taomoi"
                    var id = self.getApp().getRouter().getParam("id");
                    if (!!id && gonrinApp().hasRole("admin")) {
                        self.model.set("organization_id", id);
                        self.$el.find(".button_xoa").hide();
                    } else {
                        self.model.set("organization_id", curUser.organization_id);
                        self.$el.find(".button_xoa").hide();
                    }
                }
                var orgnization = curUser.Organization;
                if (orgnization != null && orgnization != " ") {
                    var level = orgnization.level;
                    if (level == 1) {
                        var filters = {
                            "$or": [
                                { "name": { "$eq": "admin_benhvien" } },
                                { "name": { "$eq": "canbo_benhvien" } },
                            ]
                        };
                        self.getFieldElement("roles").data("gonrin").setFilters(filters);
                    } else if (level == 2) {
                        var filters = {
                            "$or": [
                                { "name": { "$eq": "canbo_tyt" } },
                                { "name": { "$eq": "admin_tyt" } },
                            ]
                        };
                        self.getFieldElement("roles").data("gonrin").setFilters(filters);
                    }
                }
                return this;
            }
        },
        validate: function() {
            var self = this;
            var id = self.model.get("id");
            var password = self.model.get("password");
            var name = self.model.get("name");
            var phone = self.model.get("phone");
            var email = self.model.get("email");
            if (name === null || name === "") {
                self.getApp().notify("Vui lòng nhập họ và tên cán bộ");
                return false;
            }
            if (email === null || email === "") {
                self.getApp().notify("Vui lòng nhập email cán bộ");
                return false;
            } else if (gonrinApp().validateEmail(email) == false) {
                self.getApp().notify("Vui lòng nhập đúng định dạng email.");
                return false;
            }
            var roles = self.model.get("roles");
            if (roles == null || roles.length <= 0) {
                self.getApp().notify("Vui lòng chọn vai trò người dùng!");
                return false;
            }
            var confirm_pass = self.$el.find("#confirm_password").val();
            if (id === null || id === "") {
                if (password === null || confirm_pass === null || password === "" || confirm_pass === "") {
                    self.getApp().notify("Vui lòng nhập mật khẩu");
                    return false;
                }
            }
            if (password !== null && password != "" && password !== confirm_pass) {
                self.getApp().notify("Mật khẩu không khớp!");
                return false;
            }
            return true;
        },
        button_khoa_mo_taikhoan: function() {
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

                self.$el.find(".button_khoa").unbind("click").bind("click", function() {
                    self.model.set("active", 0);
                    var validate = self.validate();

                    if (validate === false) {
                        return false;
                    }
                    var email = self.model.get("email");
                    if (!!email) {
                        self.model.set("email", email.toLowerCase());
                    }
                    self.model.save(null, {
                        success: function(data, respose, options) {
                            self.getApp().notify("Khóa tài khoản cán bộ thành công");
                            self.getApp().getRouter().refresh();
                        },
                        error: function(xhr, status, error) {
                            self.getApp().hideloading();
                            self.getApp().notify({ message: "Khóa cán bộ không thành công. Vui lòng thử lại sau!" }, { type: "danger", delay: 1000 });
                        }
                    });
                });
                self.$el.find(".button_mo").unbind("click").bind("click", function() {
                    self.model.set("active", 1);

                    var email = self.model.get("email");
                    if (!!email) {
                        self.model.set("email", email.toLowerCase());
                    }

                    var validate = self.validate();
                    if (validate === false) {
                        return false;
                    }
                    self.model.save(null, {
                        success: function(data, respose, options) {
                            self.getApp().notify("Mở tài khoản cán bộ thành công");
                            self.getApp().getRouter().refresh();
                        },
                        error: function(xhr, status, error) {
                            self.getApp().hideloading();
                            self.getApp().notify({ message: "Mở cán bộ không thành công. Vui lòng thử lại sau!" }, { type: "danger", delay: 1000 });
                        }
                    });
                });
            }
        },
    });

});