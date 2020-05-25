define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    var tpl                 = '<div block-bind="content" class="pt-4">'+
    								'<h4 class="text-center">Trẻ có nguy cơ về sức khoẻ</h4>'+
								    '<div class="row">'+
										'<div class="col-12 text-center">'+
											'Vui lòng liên hệ với nhân viên y tế, <br>hoặc liên hệ Tổng đài hỗ trợ và giải đáp <br>'+
											'<a href="tel:19008600,,,,3"><strong style="font-size:22px;">19008600 nhánh 3</strong></a>'+
											'<br><span>hoặc  </span><a href="tel:0241062,,,,3"><strong style="font-size:22px;"> 1062 nhánh 3</strong></a>'+
										'</div>'+
									'</div>'+
									'<hr><ul class="col-12 list-group" id="list_warnning"></ul>'+
								'</div>';

    return Gonrin.ModelDialogView.extend({
    	template : tpl,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
    	collectionName: "callcenter",
    	render:function(){
    		var self = this;
			self.applyBindings();
			var viewData = self.viewData;
			if (viewData === null || viewData === undefined || viewData.length<=0){
				self.$el.find('#list_warnning').hide();
			}else{
				var list_warnning = self.$el.find('#list_warnning');
				for (let item of viewData) {
					var html_item = '<li class="list-group-item">'+item.label+'( '+item.textvalue+' )</li>';
					list_warnning.append(html_item);
				}
				list_warnning.show();
			}
    	},
    });

});