define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/HeThong/User/RecoverXaPhuong/tpl/recover.html'),
        schema = require('json!app/view/HeThong/User/RecoverXaPhuong/view/Schema.json');
    var QuocGiaSelectView = require("app/view/DanhMuc/QuocGia/SelectView");
    var TinhThanhSelectView = require("app/view/DanhMuc/TinhThanh/SelectView");
    var QuanHuyenSelectView = require("app/view/DanhMuc/QuanHuyen/SelectView");
    var XaPhuongSelectView = require("app/view/DanhMuc/XaPhuong/SelectView");
    var ResetPasswordView = require('app/bases/ResetPasswordView');


    var currentDate = new Date();
    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "xaphuong",
        textField: "ten",
        valueField: "id",
        uiControl: {
            fields: [{
                    field: "ngaysinh",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseDate(val);
                    },
                    parseOutputDate: function(date) {
                        return date.unix();
                    }
                },
                {
                    field: "quocgia",
                    uicontrol: "ref",
                    textField: "ten",
                    foreignRemoteField: "id",
                    foreignField: "quocgia_id",
                    dataSource: QuocGiaSelectView
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
                },
            ]
        },
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success btn-sm",
                    label: "TRANSLATE:SAVE",
                    command: function() {
                        var self = this;


                    }
                },
                {
                    name: "back",
                    type: "button",
                    buttonClass: "btn-default btn-sm",
                    label: "TRANSLATE:BACK",
                    command: function() {
                        var self = this;
                        self.close();
                    }
                },
            ]
        }, ],

        render: function() {
            var self = this;
            this.applyBindings();
            self.$el.find("#btn_resetpw_email").unbind("click").bind("click", function() {
                var url_forgot_pass;
                var val_email = self.$el.find("#email").val();
                if (self.validateEmail(val_email)) {
                    url_forgot_pass = (self.getApp().serviceURL || "") + '/api/resetpw';
                } else if (self.validatePhone(val_email)) {
                    url_forgot_pass = (self.getApp().serviceURL || "") + '/api/v1/user/recover/check_user';
                } else {
                    self.getApp().notify("Vui lòng nhập đúng định dạng email hoặc số điện thoại");
                    return
                }
                var params = {
                    email: val_email,
                    phone: val_email
                }
                self.getApp().showloading();
                $.ajax({
                    url: url_forgot_pass,
                    method: 'POST',
                    data: JSON.stringify(params),
                    dataType: "json",
                    contentType: "application/json",
                    success: function(data) {
                        if (self.validateEmail(val_email)) {
                            $('.form-actions').html('<label class="control-label">' + data.error_message + '</label>');
                        } else if (self.validatePhone(val_email)) {
                            params = {
                                "user_id": data.id,
                                "token": data.token
                            }
                            var resetpassView = new ResetPasswordView({ el: $('.login'), viewData: params });
                            resetpassView.render();
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log(xhr)
                        try {
                            var data_error = $.parseJSON(xhr.responseText);
                            self.getApp().notify(data_error.error_message);
                        } catch (e) {
                            self.getApp().notify("Có lỗi xảy ra, Vui lòng thử lại sau");
                        }
                        return false;
                    },
                    complete: function() {
                        self.getApp().hideloading();
                        return false;
                    }

                });

            });

            self.$el.find("#btn_recover").unbind("click").bind("click", function() {
                var url_recover = (self.getApp().serviceURL || "") + '/api/v1/user/recover';
                var params = {
                    quocgia_id: self.model.get('quocgia_id'),
                    tinhthanh_id: self.model.get('tinhthanh_id'),
                    quanhuyen_id: self.model.get('quanhuyen_id'),
                    xaphuong_id: self.model.get('xaphuong_id'),
                    thonxom_id: self.model.get('thonxom_id'),
                    hoten: self.model.get('hoten'),
                    ngaysinh: self.model.get('ngaysinh')

                }
                self.getApp().showloading();
                $.ajax({
                    url: url_recover,
                    method: 'POST',
                    data: JSON.stringify(params),
                    dataType: "json",
                    contentType: "application/json",
                    success: function(data) {
                        var resetpassView = new ResetPasswordView({ el: $('.login'), viewData: data });
                        resetpassView.render();
                    },
                    error: function(xhr, status, error) {
                        console.log(xhr)
                        try {
                            var data_error = $.parseJSON(xhr.responseText);
                            self.getApp().notify(data_error.error_message);
                        } catch (e) {
                            self.getApp().notify("Có lỗi xảy ra, Vui lòng thử lại sau");
                        }
                        return;
                    },
                    complete: function() {
                        self.getApp().hideloading();
                        return;
                    }

                });

            });

            // self.$el.find("#btn_reset_password").unbind("click").bind("click", function() {
            //     var phone = self.$el.find("#phone").val();
            //     var params = {
            //         "phone": phone
            //     }
            //     $.ajax({
            //         url: (self.getApp().serviceURL || "") + '/api/v1/user/recover/check_user',
            //         data: JSON.stringify(params),
            //         dataType: "json",
            //         method: 'POST',
            //         contentType: "application/json",
            //         success: function(data) {
            //             params = {
            //                 "user_id": data.id,
            //                 "token": data.token
            //             }
            //             var resetpassView = new ResetPasswordView({ el: $('body'), viewData: params });
            //             resetpassView.render();
            //         },
            //         error: function(xhr, status, error) {
            //             try {
            //                 var data = JSON.stringify(params);
            //             } catch (e) {
            //                 console.log(e);
            //             }
            //             self.getApp().notify("Có lỗi xảy ra, vui lòng thử lại sau");
            //         },
            //     });
            // });
            self.model.on("change:quocgia_id", function() {
                var quocgia_id = self.model.get("quocgia_id");
                if (self.getApp().data("quocgia_id") !== quocgia_id) {
                    self.getApp().data("quocgia_id", quocgia_id);
                }

            });

            //    		self.model.on("change:tinhthanh_id", function(){
            //				var tinhthanh_id = self.model.get("tinhthanh_id");
            //    			if(self.getApp().data("tinhthanh_id") !== tinhthanh_id){
            //					self.getApp().data("tinhthanh_id",tinhthanh_id);
            //				}
            //			});
            //    		self.model.on("change:quanhuyen_id", function(){
            //				var quanhuyen_id = self.model.get("quanhuyen_id");
            //    			if(self.getApp().data("quanhuyen_id") !== quanhuyen_id){
            //					self.getApp().data("quanhuyen_id",quanhuyen_id);
            //				}
            //			});
            self.model.on("change:tinhthanh_id", function() {
                self.getFieldElement("quanhuyen").data("gonrin").setFilters({ "tinhthanh_id": { "$eq": self.model.get("tinhthanh_id") } });

            });
            self.model.on("change:quanhuyen_id", function() {
                self.getFieldElement("xaphuong").data("gonrin").setFilters({ "quanhuyen_id": { "$eq": self.model.get("quanhuyen_id") } });

            });
            return this;
        },
        validateEmail: function(email) {
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