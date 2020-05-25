define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!tpl/DonVi/model.html'),
    	schema 				= require('json!app/view/HeThong/DonVi/Schema.json');
    
    var TuyenDonViSelectView = require('app/view/DanhMuc/TuyenDonVi/SelectView');
    var DonViSelectView = require('app/view/HeThong/DonVi/SelectView');
    
    var QuocGiaSelectView 	= require("app/view/DanhMuc/QuocGia/SelectView");
    var TinhThanhSelectView 	= require("app/view/DanhMuc/TinhThanh/SelectView");
    var QuanHuyenSelectView 	= require("app/view/DanhMuc/QuanHuyen/SelectView");
    var XaPhuongSelectView 	= require("app/view/DanhMuc/XaPhuong/SelectView");
    
    
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "donvi",
    	state: null,
    	uiControl: {
    		fields:[
    			{
  				  	field:"tuyendonvi",
  				  	uicontrol: "ref",
	  				textField: "ten",
					foreignRemoteField: "id",
					foreignField: "tuyendonvi_id",
					dataSource: TuyenDonViSelectView
    			},  
    			{
  				  field:"captren",
  				  uicontrol: "ref",
  				  textField: "ten",
  				  //valueField: "value",
  				  foreignRemoteField: "id",
  				  foreignField: "parent_id",
  				  dataSource: DonViSelectView,
    			},
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
    	tools : [ {
			name : "save",
			type : "button",
			buttonClass : "btn-success btn-sm",
			label : "TRANSLATE:SAVE",
			command : function() {
				var self = this;
//				var parent_id = self.model.get("parent_id");
//				if(parent_id === undefined || parent_id === null || parent_id <=0){
//					self.getApp().notify('Chưa chọn cấp trên');
//				} else {
					self.model.save(null, {
						success : function(model, respose, options) {
							self.getApp().hideloading();
							self.getApp().notify("Lưu đơn vị thành công");
							self.getApp().getRouter().navigate(
									self.collectionName + "/collectiontree");
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
//				}
				
			}
		} ],
    	render:function(){
    		var self = this;
    		var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
        				self.applyBindings();
        			},
        			error:function(){
    					self.getApp().notify("Không lấy được dữ liệu");
    				},
        		});
    		}else{
    			self.applyBindings();
    		}
    		
    	},
    });

});