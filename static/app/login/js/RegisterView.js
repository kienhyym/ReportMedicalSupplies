define(function (require) {

    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin            	= require('gonrin'),
        storejs				= require('vendor/store'),
		tpl                 = require('text!app/login/tpl/register.html');
		

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


            self.$el.find("#matinhthanh").on('change.gonrin', function(e){
                $(this).attr('data-id',$(this).data("gonrin").getValue())
                self.$el.find("#maquanhuyen").data("gonrin").setFilters({"tinhthanh_id": { "$eq": $(this).data("gonrin").getValue()}});

            })
            self.$el.find("#maquanhuyen").on('change.gonrin', function(e){
                $(this).attr('data-id',$(this).data("gonrin").getValue())
                self.$el.find("#maxaphuong").data("gonrin").setFilters({"quanhuyen_id": { "$eq": $(this).data("gonrin").getValue()}});

            })
            self.$el.find("#maxaphuong").on('change.gonrin', function(e){
                $(this).attr('data-id',$(this).data("gonrin").getValue())
            })
            
			self.applyBindings();
			self.registerEvent();
		},

		registerEvent: function () {
            var self = this;
            var param = {};
            self.$el.find(".btn-register").unbind("click").bind("click", function () {
                self.$el.find("[data-post]").each(function(index,item){
                    var attr = $(item).attr('data-post');
                    param[attr] = $(item).val();
                })
                self.$el.find("[data-postid]").each(function(index,item){
                    var attr = $(item).attr('data-postid');
                    param[attr] = $(item).attr('data-id');
                })

                $.ajax({
                    method: "POST",
                    url:self.getApp().serviceURL + "/api/v1/dangky_donvi_cungung",
                    data: JSON.stringify(param), 
                    success: function (response) {
                        if (response) {
							self.getApp().notify("Đăng ký thành công");
                            self.getApp().getRouter().navigate("login");
                        }
                    }, error: function (xhr) {
                        console.log('xhr',xhr);
                    }
                })
            });
        }
	});

});