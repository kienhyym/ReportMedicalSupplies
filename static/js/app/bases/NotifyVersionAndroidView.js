define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    var tpl                 = require('text!tpl/base/NotifyVersion.html');
    return Gonrin.DialogView.extend({
    	template : tpl,
    	render:function(){
    		var self = this;
    		self.getApp().hideloading();
    		var currUser = self.getApp().currentUser;
    		if(currUser !== undefined && currUser!== null){
    			self.$el.find("#link_app").attr({"href":currUser.version.url_google_store});
			}else{
				self.$el.find("#link_app").attr({'href':'https://play.google.com/store/apps/details?id=com.somevabe.apps'});
			}
			self.applyBindings();
    	},
    });

});