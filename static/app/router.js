define(function(require) {

    "use strict";

    var $ = require('jquery'),
        Gonrin = require('gonrin');
    // var Index = require('app/lichthanhtra/view/ModelView');
    var Login = require('app/login/js/LoginView');
    var ChangePasswordView = require('app/login/js/ChangePasswordView');
    var ForgotPasswordView = require('app/login/js/ForgotPasswordView');
    var LichThanhTraView = require('app/lichthanhtra/view/ModelView');
    var RegisterView = require('app/login/js/RegisterView');
    var navdata = require('app/nav/route');

    return Gonrin.Router.extend({
        routes: {
            // "index": "index",
            "login": "login",
            "logout": "logout",
            "forgot": "forgotPassword",
            "changepassword": "changepassword",
            "register": "register",
            "lichthanhtra": "lichthanhtra",
            "error": "error_page",
            "*path": "defaultRoute"
        },
        defaultRoute: function() {
            // this.navigate("index", true);
            // var indexview = new Index({ el: $('.main-content-container') });
            // indexview.render();      
        },
        index: function() {
            // this.navigate('dangkykham/collection');
            // var indexview = new Index({ el: $('.main-content-container') });
            // indexview.render();
        },
        logout: function() {
            var self = this;
            $.ajax({
                url: self.getApp().serviceURL + '/api/v1/logout',
                dataType: "json",
                success: function(data) {},
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    //self.getApp().notify(self.getApp().translate("LOGOUT_ERROR"));
                },
                complete: function() {
                    self.navigate("login");
                }
            });
        },
        error_page: function() {
            var app = this.getApp();
            if (app.$content) {
                app.$content.html("Error Page");
            }
            return;
        },
        login: function() {
            var loginview = new Login({ el: $('.content-contain') });
            loginview.render();
        },
        forgotPassword: function() {
            var forgotPassView = new ForgotPasswordView({ el: $('.content-contain') });
            forgotPassView.render();
        },
        changepassword: function() {
            var self = this;
            var changePasswordView = new ChangePasswordView({
                el: $('.content-contain'),
                id: self.getApp().currentUser.id
            });
            changePasswordView.render();
        },
        register: function() {
            var registerView = new RegisterView({ el: $('.content-contain') });
            registerView.render();
        },
        lichthanhtra: function() {
            var lichThanhTraView = new LichThanhTraView({ el: $('.main-content-container') });
            lichThanhTraView.render();
        },
        registerAppRoute: function() {
            var self = this;
            $.each(navdata, function(idx, entry) {
                var entry_path = _.result(entry, 'route');
                self.route(entry_path, entry.collectionName, function() {
                    require([entry['$ref']], function(View) {
                        var view = new View({ el: self.getApp().$content, viewData: entry.viewData });
                        view.render();
                    });
                });
            });
        },
    });

});