define(function (require) {

    "use strict";
    
    var $           = require('jquery'),
        Gonrin    	= require('gonrin');
//        storejs		= require('store');
    var Login		= require('app/bases/LoginView');
    var RegisterView	= require('app/bases/RegisterView');
    var RecorverAccountView	= require('app/view/HeThong/User/RecoverXaPhuong/view/RecoverXaPhuongView');
    var ForgotPasswordView	= require('app/bases/ForgotPasswordView');
    var NotifyVersionAndroid	= require('app/bases/NotifyVersionAndroidView');
    var NotifyVersionIOS	= require('app/bases/NotifyVersionIOSView');
    var navdata = require('app/bases/Nav/route');
    
    return Gonrin.Router.extend({
        routes: {
        	"index" : "index",
            "login":"login",
            "notify_android":"check_version_android",
            "notify_ios":"check_version_ios",
            "logout": "logout",
            "forgot":"forgotPassword",
            "dangky":"dangky",
//            "recorver":"recorver",
            //"change-passwd": "changePasswd",
            "error":"error_page",
            "*path":  "defaultRoute"
        },
        defaultRoute:function(){
//        	var qrcode = this.getApp().getRouter().getParam("qr");
//		    	if(qrcode !== undefined && qrcode!== null && qrcode !==""){
//	            	this.navigate("index?qr="+qrcode,true);
//	            }else{
//	            	this.navigate("index",true);
//	            }
//        	this.navigate("sochamsoc/model?id=current",true);
        	
        },
        index:function(){
        	//check storejs session
        	/*var app = this.getApp();
        	if(!app.check_valid_session()){
        		var token = storejs.get('gonrin.token');
            	if(token != null){
            		app.session.token = token;
            		$.ajaxSetup({
        	    	    headers: {
        	    	        'content-type':'application/json',
        	    	        'Authorization':token
        	    	    }
        	    	});
            	}
        	}
        	if(app.check_valid_session()){
	    		app.postLogin();
	    	}else{
	    		this.navigate("login");
	    	}*/
//        	this.navigate("sochamsoc/model?id=current",true);
        },
        check_version_android: function(){
        	var checkVersion = new NotifyVersionAndroid({el: $('.content-contain')});
        	checkVersion.render();
        },
        check_version_ios: function(){
        	var checkVersion = new NotifyVersionIOS({el: $('.content-contain')});
        	checkVersion.render();
        },
        logout: function(){
        	var self = this;
        	$.ajax({
				url: self.getApp().serviceURL + '/logout',
       		    dataType:"json",
       		    success: function (data) {
       		    	self.getApp().data("current_so", null);
       		    	self.getApp().currentUser = null;
       	            var loginview = new Login({el: $('.content-contain')});
       	            loginview.render();
       		    },
       		    error: function(XMLHttpRequest, textStatus, errorThrown) {
       		    	console.log(self.getApp().translate("LOGOUT_ERROR"));
       		    	self.getApp().data("current_so", null);
       		    	self.getApp().currentUser = null;
       	            var loginview = new Login({el: $('.content-contain')});
       	            loginview.render();
       		    },
        	});
        	try{
    			AccountKitPlugin.logout();
    		}catch(err){
    			
    		}
        },
        error_page: function(){
        	var app = this.getApp();
        	if(app.$content){
        		app.$content.html("Error Page");
        	}
        	return;
        },
        login: function(){
        	this.getApp().data("current_so", null);
//        	var loginview = new Login({el: $('.content-contain')});
            var loginview = new Login({el: $('.content-contain')});
            loginview.render();
        },
        dangky: function(){
        	var registerView = new RegisterView({el: $('.content-contain')});
        	registerView.render();
        },
        forgotPassword: function(){
//            var forgotPassView = new ForgotPasswordView({el: $('body')});
//            forgotPassView.render();
        	var recoverView = new RecorverAccountView({el: $('.content-contain')});
        	recoverView.render();
        },
        registerAppRoute: function(){
            var self = this;
            $.each(navdata, function(idx, entry){
                var entry_path = _.result(entry,'route');
                self.route(entry_path, entry.collectionName, function(){
                    require([ entry['$ref'] ], function ( View) {
                        var view = new View({el: self.getApp().$content, viewData:entry.viewData});
                        view.render();
                    });
                });
            });
        },
//        recorver: function(){
//        	var recoverView = new RecorverView({el: $('body')});
//        	recoverView.render();
//        },
    });

});