define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin'),
        storejs = require('vendor/store'),
        tpl = require('text!app/login/tpl/login.html');
    var template = gonrin.template(tpl)({});
    return Gonrin.View.extend({
        render: function () {
            var self = this;
            this.$el.html(template);
            self.getApp().currentUser = null;
            $("body").attr({
                'style': 'background-color: #e9ecf3 !important;'
            });
            this.$el.find("#login-form").unbind("submit").bind("submit", function () {
                self.processLogin();
                return false;
            });
            $("#register-btn").unbind('click').bind('click', function () {
                self.getApp().getRouter().navigate("register");
            });
            $("#forgot-btn").unbind('click').bind('click', function () {
                self.getApp().getRouter().navigate("forgot");
            });
            return this;
        },
        processLogin: function () {
            var username = this.$('[name=username]').val().toLowerCase().trim();
            var password = this.$('[name=password]').val().trim();
            var data = JSON.stringify({
                data: username,
                password: password
            });
            var self = this;
            $.ajax({
                url: self.getApp().serviceURL + "/api/v1/login",
                type: 'post',
                data: data,
                success: function (data) {
                    // if (data.active === 1 || data.active === '1') {
                    $.ajaxSetup({
                        headers: {
                            'X-USER-TOKEN': data.token
                        }
                    });
                    storejs.set('X-USER-TOKEN', data.token);
                    gonrinApp().postLogin(data);
                    // }
                    //  else {
                    //     gonrinApp().notify("Tài khoản của bạn đã bị khóa");
                    // }
                    // console.log("a>>>>>>>>>>>>>>>>>>>>>>", self.getApp());
                    // self.getApp().postLogin(response);
                },
                error: function (xhr) {
                    self.getApp().notify({ message: "Tài khoản hoặc mật khẩu không chính xác" }, { type: "danger", delay: 1000 });

                }
            });
        },
    });
});