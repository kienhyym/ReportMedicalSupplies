define(function (require) {

    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin'),
        storejs = require('vendor/store'),
        tpl = require('text!app/login/tpl/register.html');


    var template = gonrin.template(tpl)({});
    var XaPhuongDialogView = require('app/view/DanhMuc/XaPhuong/SelectView');
    var QuanHuyenDialogView = require('app/view/DanhMuc/QuanHuyen/SelectView');
    var TinhThanhDialogView = require('app/view/DanhMuc/TinhThanh/SelectView');

    return Gonrin.View.extend({
        template: template,
        modelSchema: [],
        urlPrefix: "/api/v1/",
        collectionName: "",
        render: function () {
            var self = this;
            self.$el.find("#matinhthanh").ref({
                textField: "ten",
                valueField: "id",
                dataSource: TinhThanhDialogView,
            });

            self.$el.find("#maquanhuyen").ref({
                textField: "ten",
                valueField: "id",
                dataSource: QuanHuyenDialogView,
            });

            self.$el.find("#maxaphuong").ref({
                textField: "ten",
                valueField: "id",
                dataSource: XaPhuongDialogView,
            });


            self.$el.find("#matinhthanh").on('change.gonrin', function (e) {
                $(this).attr('data-id', $(this).data("gonrin").getValue())
                self.$el.find("#maquanhuyen").data("gonrin").setFilters({ "tinhthanh_id": { "$eq": $(this).data("gonrin").getValue() } });

            })
            self.$el.find("#maquanhuyen").on('change.gonrin', function (e) {
                $(this).attr('data-id', $(this).data("gonrin").getValue())
                self.$el.find("#maxaphuong").data("gonrin").setFilters({ "quanhuyen_id": { "$eq": $(this).data("gonrin").getValue() } });

            })
            self.$el.find("#maxaphuong").on('change.gonrin', function (e) {
                $(this).attr('data-id', $(this).data("gonrin").getValue())
            })

            self.applyBindings();
            self.registerEvent();
        },

        registerEvent: function () {
            var self = this;
            var param = {};
            self.$el.find(".btn-register").unbind("click").bind("click", function () {
                var tennguoidung = self.$el.find("#tennguoidung").val();
                var sodienthoai = self.$el.find("#sodienthoai").val();
                // var email = self.$el.find("#email").val();
                var pass = self.$el.find("#pass").val();
                var pass2 = self.$el.find("#pass2").val();
                var tendonvi = self.$el.find("#tendonvi").val();
                var matinhthanh = self.$el.find("#matinhthanh").val();
                var maquanhuyen = self.$el.find("#maquanhuyen").val();
                var maxaphuong = self.$el.find("#maxaphuong").val();
                var diachi = self.$el.find("#diachi").val();
                if (tennguoidung == "" || tennguoidung == null) {
                    self.getApp().notify({ message: "Chưa nhập tên người dùng" }, { type: "danger", delay: 1000 });
                    return false;
                }
                else if (sodienthoai == "" || sodienthoai == null) {
                    self.getApp().notify({ message: "Chưa nhập số điện thoại người dùng" }, { type: "danger", delay: 1000 });
                    return false;
                }
                // else if (email == "" || email == null) {
                //     self.getApp().notify({ message: "Chưa nhập email người dùng" }, { type: "danger", delay: 1000 });
                //     return false;
                // } 
                else if (pass == "" || pass == null) {
                    self.getApp().notify({ message: "Chưa nhập mật khẩu người dùng" }, { type: "danger", delay: 1000 });
                    return false;
                } else if (pass2 == "" || pass2 == null) {
                    self.getApp().notify({ message: "Chưa nhập lại mật khẩu người dùng" }, { type: "danger", delay: 1000 });
                    return false;
                } else if (tendonvi == "" || tendonvi == null) {
                    self.getApp().notify({ message: "Chưa nhập tên dơn vị" }, { type: "danger", delay: 1000 });
                    return false;
                }
                else if (matinhthanh == "" || matinhthanh == null) {
                    self.getApp().notify({ message: "Chưa nhập tỉnh thành" }, { type: "danger", delay: 1000 });
                    return false;
                }
                else if (maquanhuyen == "" || maquanhuyen == null) {
                    self.getApp().notify({ message: "Chưa nhập quận huyện" }, { type: "danger", delay: 1000 });
                    return false;
                }
                else if (maxaphuong == "" || maxaphuong == null) {
                    self.getApp().notify({ message: "Chưa nhập xã phường" }, { type: "danger", delay: 1000 });
                    return false;
                }
                else if (diachi == "" || diachi == null) {
                    self.getApp().notify({ message: "Chưa nhập địa chỉ" }, { type: "danger", delay: 1000 });
                    return false;
                }
                else if (pass != pass2) {
                    self.getApp().notify({ message: "Mật khẩu của bạn chưa khớp"}, { type: "danger", delay: 1000 });
                    return false;
                }
                else {
                    self.$el.find("[data-post]").each(function (index, item) {
                        var attr = $(item).attr('data-post');
                        param[attr] = $(item).val();
                    })
                    self.$el.find("[data-postid]").each(function (index, item) {
                        var attr = $(item).attr('data-postid');
                        param[attr] = $(item).attr('data-id');
                    })

                    $.ajax({
                        method: "POST",
                        url: self.getApp().serviceURL + "/api/v1/dangky_donvi_cungung",
                        data: JSON.stringify(param),
                        success: function (response) {
                            if (response) {
                                self.getApp().notify("Đăng ký thành công");
                                self.getApp().getRouter().navigate("login");
                            }
                        }, error: function (xhr) {
                            self.getApp().notify({ message: "Số điện thoại đã có trong hệ thống"}, { type: "danger", delay: 1000 });
                        }
                    })
                }


            });
        }
    });

});