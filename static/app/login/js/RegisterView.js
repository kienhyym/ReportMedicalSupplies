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
                $(this).attr('id',$(this).data("gonrin").getValue())
            })
            self.$el.find("#maquanhuyen").on('change.gonrin', function(e){
                $(this).attr('id',$(this).data("gonrin").getValue())
            })
            self.$el.find("#maxaphuong").on('change.gonrin', function(e){
                $(this).attr('id',$(this).data("gonrin").getValue())
            })
            
			self.applyBindings();
			self.registerEvent();
		},

		registerEvent: function () {
            var self = this;
            self.$el.find(".btn-register").unbind("click").bind("click", function () {
                self.$el.find("[data-post]").each(function(index,item){
                    console.log($(item).attr('data-post'),$(item).val())
                })
                self.$el.find("[data-postid]").each(function(index,item){
                    console.log($(item).attr('data-postid'),$(item).val())
                })
                

                // $.ajax({
                //     method: "POST",
                //     url:self.getApp().serviceURL + "/api/v1/dangky_donvi_cungung",
                //     data: JSON.stringify({
                //         email: self.$el.find("#txtemail").val(),
                //         name: self.$el.find("#txtname").val(),
                //         phone_number: self.$el.find("#txtphone").val(),
                //         password: self.$el.find("#txtpass").val()
                //     }), 
                //     success: function (response) {
                //         if (response) {
				// 			self.getApp().notify("Đăng ký thành công");
                //             self.getApp().getRouter().navigate("login");
                //         }
                //     }, error: function (xhr) {
                //         console.log('xhr',xhr);
                //     }
                // })
            });
        }
	});

});