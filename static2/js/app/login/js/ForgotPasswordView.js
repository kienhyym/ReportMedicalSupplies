define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin'),
        tpl = require('text!app/login/tpl/forgotpassword.html');
    var template = gonrin.template(tpl)({});
    return Gonrin.View.extend({
        template: template,
        modelSchema: [],
        urlPrefix: "/api/v1/",
        collectionName: "",
        render: function () {
            var self = this;
            self.$el.find("#btn_forgot").unbind("click").bind("click", function () {
                console.log('xxxx')
                $.ajax({
                    type: "POST",
                    url: self.getApp().serviceURL + "/api/v1/tokenuser",
                    data: JSON.stringify({
                        email: self.$el.find("#txtvalue").val()
                    }),
                    headers: {
                        'content-type': 'application/json'
                    },
                    dataType: 'json',
                    success: function (data, res) {
                        self.getApp().notify({ message: "Yêu cầu đã được gửi qua gmail" });
                        self.$el.find("#forgotpassword-form1").hide();
                        self.$el.find("#forgotpassword-form2").show();
                        self.$el.find("#btn-back2").unbind("click").bind("click", function () {
                            self.getApp().getRouter().navigate("login");
                        });

                        self.$el.find("#btn_forgot2").unbind("click").bind("click", function () {
                            console.log(parseInt(self.$el.find("#txttoken").val()))
                            console.log(data.ok)
                            if (parseInt(self.$el.find("#txttoken").val()) == data.ok) {
                                if (self.$el.find("#txtpass2").val() != self.$el.find("#txtpass1").val()) {
                                    self.getApp().notify({ message: "Mật khẩu chưa khớp nhau" }, { type: "danger", delay: 1000 });

                                }
                                else {
                                    $.ajax({
                                        type: "POST",
                                        url: self.getApp().serviceURL + "/api/v1/newpassword",
                                        data: JSON.stringify({
                                            id: data.id,
                                            password: self.$el.find("#txtpass1").val()
                                        }),
                                        headers: {
                                            'content-type': 'application/json'
                                        },
                                        dataType: 'json',
                                        success: function (data, res) {
                                            self.getApp().notify({ message: "Lấy lại mật khẩu thành công" });

                                            self.getApp().getRouter().navigate("login");


                                        },
                                        error: function (xhr, status, error) {
                                            self.getApp().notify({ message: "Tài khoản không có trong hệ thống" }, { type: "danger", delay: 1000 });
                                        },
                                    });
                                }

                            }
                            else {
                                self.getApp().notify({ message: "Mã đã hết hạn hoặc không chính xác" }, { type: "danger", delay: 1000 });

                            }

                        });
                    },
                    error: function (xhr, status, error) {
                        self.getApp().notify({ message: "Tài khoản không có trong hệ thống" }, { type: "danger", delay: 1000 });
                    },
                });

                // self.processForgotPass();
            });
            self.$el.find("#btn-back").unbind("click").bind("click", function () {
                self.getApp().getRouter().navigate("login");
            });
            self.$el.find(".backgroundColor").css("width", screen.availWidth);
            self.$el.find(".backgroundColor").css("height", screen.availHeight);
            return this;
        },
        // validateEmail: function (email) {
        //     var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //     return re.test(String(email).toLowerCase());
        // },
        processForgotPass: function () {
            var self = this;

            // var emailOrPhone = self.$el.find("#txtvalue").val();

            // if (emailOrPhone === null || emailOrPhone === "") {
            //     self.getApp().notify("Giá trị không hợp lệ, vui lòng kiểm tra lại");
            //     return;
            // }
            // // var data = JSON.stringify({
            // //     email: self.$el.find("#txtgmail").val()
            // // });
            // var filters = {
            // 	filters: {
            // 		"$or": [
            //             { "email": { "$eq": emailOrPhone } },
            //             { "phone_number": { "$eq": emailOrPhone } }
            // 		]
            // 	},
            // 	order_by: [{ "field": "created_at", "direction": "asc" }]
            // }
            // $.ajax({
            // 	url: self.getApp().serviceURL + "/api/v1/user?results_per_page=100000&max_results_per_page=1000000",
            // 	method: "GET",
            // 	data: "q=" + JSON.stringify(filters),
            // 	contentType: "application/json",
            // 	success: function (data) {
            //         console.log(data.objects[0].email)
            //         $.ajax({
            //             type: "POST",
            //             url: "https://upstart.vn/services/api/email/send",
            //             data: JSON.stringify({
            //                 from: {
            //                     "id": "kien97ym@gmail.com",
            //                     "password": "kocopass_1",
            //                 },
            //                 "to": data.objects[0].email,
            //                 "message": self.getApp().serviceURL+"/?#newpassword",
            //                 "subject": "Yêu cầu lấy lại mật khẩu",
            //             }),
            //             success: function (response) {
            //                 self.getApp().notify({ message: "Đã gưi thành công" });

            //             },
            //             error: function (response) {
            //                 self.getApp().notify({ message: "Tài khoản hoặc mật khẩu gmail không chính xác" }, { type: "danger", delay: 1000 });
            //             }
            //         });
            // 	},
            // 	error: function (xhr, status, error) {
            // 		self.getApp().notify({ message: "Email hoặc số điện thoại không có trong hệ thống" }, { type: "danger", delay: 1000 });
            // 	},
            // });


            // $.ajax({
            //     url: (self.getApp().serviceURL || "") + '/api/resetpw',
            //     type: 'post',
            //     data: data,
            //     headers: {
            //         'content-type': 'application/json'
            //     },
            //     dataType: 'json',
            //     success: function (data) {
            //         console.log('suscess')
            //         $('#login-form').html('<label class="control-label">' + data.error_message + '</label>');
            //     },
            //     error: function (xhr, status, error) {
            //         try {
            //             self.getApp().notify($.parseJSON(xhr.responseText).error_message);
            //         }
            //         catch (err) {
            //             self.getApp().notify("có lỗi xảy ra, vui lòng thử lại sau ");
            //         }

            //     }
            // });
        },
    });
});