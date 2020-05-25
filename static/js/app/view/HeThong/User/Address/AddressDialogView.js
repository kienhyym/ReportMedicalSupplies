define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/User/address.html'),
    	schema 				= require('json!app/view/HeThong/User/Address/Schema.json');
    var QuocGiaSelectView 	= require("app/view/DanhMuc/QuocGia/SelectView");
    var TinhThanhSelectView 	= require("app/view/DanhMuc/TinhThanh/SelectView");
    var QuanHuyenSelectView 	= require("app/view/DanhMuc/QuanHuyen/SelectView");
    var XaPhuongSelectView 	= require("app/view/DanhMuc/XaPhuong/SelectView");
    
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "address",
    	textField: "ten",
    	valueField: "id",
    	uiControl:{
	    		fields:[
	    			{
	    				field:"quocgia",
	    				uicontrol:"ref",
	    				textField: "ten",
	    				foreignRemoteField: "id",
	    				foreignField: "quocgia_id",
	    				dataSource: QuocGiaSelectView
	    			},
	        		{
	    				field:"tinhthanh",
	    				uicontrol:"ref",
	    				textField: "ten",
	    				foreignRemoteField: "id",
	    				foreignField: "tinhthanh_id",
	    				dataSource: TinhThanhSelectView
	    			},
	    			{
	    				field:"quanhuyen",
	    				uicontrol:"ref",
	    				textField: "ten",
	    				foreignRemoteField: "id",
	    				foreignField: "quanhuyen_id",
	    				dataSource: QuanHuyenSelectView
	    			},
	    			{
	    				field:"xaphuong",
	    				uicontrol:"ref",
	    				textField: "ten",
	    				foreignRemoteField: "id",
	    				foreignField: "xaphuong_id",
	    				dataSource: XaPhuongSelectView
	    			},
	    			
	        	]
	    	},
    	tools : [
  	    	    {
  	    	    	name: "defaultgr",
  	    	    	type: "group",
  	    	    	groupClass: "toolbar-group",
  	    	    	buttons: [
  						{
  			    	    	name: "save",
  			    	    	type: "button",
  			    	    	buttonClass: "btn-success btn-sm",
  			    	    	label: "TRANSLATE:SAVE",
  			    	    	command: function(){
  			    	    		var self = this;
  			    	    		var currUser = self.getApp().currentUser;
  			    	    		var currentSo = self.getApp().data("current_so");
  			    	    		var viewData = self.viewData;
  			    	    		console.log("update profile viewData=====",viewData);
//  			    	    		var url_profile = (self.getApp().serviceURL || "")+'/api/v1/sochamsoc/profile/'+ currentSo.id;
  			    	    		if (viewData !== null && viewData !== undefined && viewData.id !== undefined){
  			    	    			var url_profile = (self.getApp().serviceURL || "")+'/api/v1/sochamsoc/profile/'+ viewData.id;
  			    	    			var params = {
  	  			    	    				quocgia_id: self.model.get('quocgia_id'),
  	  			    	    				quocgia: self.model.get('quocgia'),
  	  			    	    				tinhthanh_id: self.model.get('tinhthanh_id'),
  	  			    	    				tinhthanh: self.model.get('tinhthanh'),
  	  			    	    				quanhuyen_id: self.model.get('quanhuyen_id'), 
  	  			    	    				quanhuyen: self.model.get('quanhuyen'),
  	  			    	    				xaphuong_id: self.model.get('xaphuong_id'), 
  	  			    	    				xaphuong: self.model.get('xaphuong'), 
  	  			    	    				thonxom_id: self.model.get('thonxom_id'), 
  	  			    	    				diachi: self.model.get('diachi'),
  	  			    	    		}
  			    	    			self.getApp().showloading();
  	  			    	    		$.ajax({
  		  				    				url: url_profile,
  		  				    				method: 'POST',
  		  				    				data: JSON.stringify({"profile":params}),
  		  				    				dataType: "json",
  		  				    			  	contentType: "application/json",
  		  				    			  	success: function(data) {
  		  				    			  		self.getApp().notify("Cập nhập thông tin thành công!");
  		  				    			  		self.close();
  		  				    			  	},
	  		  				    			error: function (xhr, status, error) {
	  		  				    				self.getApp().hideloading();
	  		  									try {
	  		  										if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
	  		  											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
	  		  											self.getApp().getRouter().navigate("login");
	  		  										} else {
	  		  										  self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
	  		  										}
	  		  									} catch (err) {
	  		  									  self.getApp().notify({ message: "Lưu không thành công, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
	  		  									}
	  		  								},
	  		  	  				    	    complete: function(){
	  		  	  				    	    	self.getApp().hideloading();
	  		  	  				    	    }
  		  				    			  	
  		  				    			});
  			    	    		}else{
  			    	    			console.log("viewData truyen sang khong hop le", viewData);
  			    	    			self.getApp().notify("Có lỗi xảy ra, Vui lòng thử lại sau");
  			    	    		}
  			    	    		
  			    	    		
  			    	    	}
  			    	    },
  			    	  {
  			    	    	name: "close",
  			    	    	type: "button",
  			    	    	buttonClass: "btn-default btn-sm",
  			    	    	label: "TRANSLATE:CLOSE",
  			    	    	command: function(){
  			    	    		var self = this;
  			    	    		self.close();
  			    	    	}
  			    	    },
  	    	    	]
  	    	    },
  	    	],
  	    	
    	render: function(){
    		var self = this;
    		var viewData = self.viewData;
    		if (viewData !== null && viewData !== undefined  && viewData.id !== null){
    			self.getApp().showloading();
    			
    			var url_profile = (self.getApp().serviceURL || "")+'/api/v1/sochamsoc/profile/'+ viewData.id;
    			$.ajax({
      				url: url_profile,
      				method: 'GET',
      				dataType: "json",
      			  	contentType: "application/json",
      			  	success: function(data) {
      			  		
      			  		self.model.set(data);
      			  		if(!!data && !!data.quocgia_id && data.quocgia_id.length>0){
      			  			self.getApp().data("quocgia_id",data.quocgia_id);
      			  		}
      			  		
      			  		self.getApp().data("tinhthanh_id",data.tinhthanh_id);
      			  		self.getApp().data("quanhuyen_id",data.quanhuyen_id);
      			  		self.getApp().data("xaphuong_id",data.xaphuong_id);
      			  		
      			  		
      			  	},
    	    	    error: function (request, status, error) {
    	    	    	console.log(request)
    	    	    }, 
    	    	    complete: function(data) {
    	    	    	self.getApp().hideloading();
    	    	    	self.applyBindings();
    	    	    	var title = "Thông tin địa chỉ";
    	    			if(!!viewData.title && viewData.title !==""){
    	    				title = viewData.title;
    	    			}
    	    			self.$el.find("#title").html(title);
    	    	    	self.model.on("change:tinhthanh_id", function(){
    	    				self.getFieldElement("quanhuyen").data("gonrin").setFilters({"tinhthanh_id": { "$eq": self.model.get("tinhthanh_id")}});

    	    			});
    	        		self.model.on("change:quanhuyen_id", function(){
    	        			self.getFieldElement("xaphuong").data("gonrin").setFilters({"quanhuyen_id": { "$eq": self.model.get("quanhuyen_id")}});

    	    			});
    	            }
      			  	
      			});
    		}else{
    			self.applyBindings();
    		}
    		
    		
    		return this;
    	},
    });

});