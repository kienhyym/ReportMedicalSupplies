define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/thongkebaocao/tpl/view.html');

    return Gonrin.View.extend({
		template: template,
		vattu_id: "",
        render: function () {
			var self = this;
			if (self.getApp().currentUser.Organization != null){
				if (self.getApp().currentUser.Organization.tuyendonvi_id === "1" || self.getApp().currentUser.Organization.tuyendonvi_id === null){
					self.$el.find('#type').removeAttr('readonly')
				}
			}
			else{
				self.$el.find('#type').removeAttr('readonly')
			}
			
			self.vattu_id = "";
            self.loadUIControl();
			self.loadItemDropdown();
			var start_time = null;
			var end_time = null;
			var ngay = null;
			var thang = null;
			var nam = null;
			var btnAll = null;
			self.$el.find('.btn-year').unbind('click').bind('click',function(){
				nam = Number($(this).attr('year'));
				self.$el.find('.toggle-year').text(nam)
				self.$el.find('.btn-all').addClass('btn-outline-secondary')
				self.$el.find('.btn-all').removeClass('btn-secondary')
			})

			self.$el.find('.btn-month').unbind('click').bind('click',function(){
				thang = Number($(this).attr('month'));
				self.$el.find('.toggle-month').text('tháng ' +thang)
				self.$el.find('.btn-all').addClass('btn-outline-secondary')
				self.$el.find('.btn-all').removeClass('btn-secondary')
			})

			self.$el.find('.btn-day').unbind('click').bind('click',function(){
				ngay = Number($(this).attr('day'));
				self.$el.find('.toggle-day').text('ngày ' +ngay)
				self.$el.find('.btn-all').addClass('btn-outline-secondary')
				self.$el.find('.btn-all').removeClass('btn-secondary')
			})

			self.$el.find('.btn-all').unbind('click').bind('click',function(){
				btnAll = "click";
				self.$el.find('.btn-all').removeClass('btn-outline-secondary')

				self.$el.find('.btn-all').addClass('btn-secondary')

			})

			self.$el.find(".button-filter").unbind("click").bind("click", function () {
				if (btnAll == "click"){
					var thoiGianBatDau = '01 01 1997 00:00:00';
					var thoiGianKetThuc = '01 01 2050 00:00:00';
					start_time = Date.parse(thoiGianBatDau) / 1000,
					end_time = Date.parse(thoiGianKetThuc) / 1000
				}
				else{
					if(ngay == null && thang == null && nam != null){
						var namSau = Number(nam)+1
						var thoiGianBatDau = '01 01 '+nam+' 00:00:00';
						var thoiGianKetThuc = '01 01 '+namSau +' 00:00:00';
						start_time = Date.parse(thoiGianBatDau) / 1000,
						end_time = Date.parse(thoiGianKetThuc) / 1000
						console.log("Xxxxxxxxxxxxxxxxxxxxxxxx",thoiGianBatDau,thoiGianKetThuc)
					}
					if(ngay == null && thang != null && nam == null){
						var year = moment().format('YYYY')
						var yearAfter = Number(moment().format('YYYY'))
						var monthNow = thang
						var monthAfter 
						if (monthNow  === 12 ){
							monthAfter = 1
							yearAfter =  yearAfter + 1
						}
						else{
							monthAfter = Number(monthNow) +1 
						}
						var thoiGianBatDau = monthNow +' 01 '+ year+' 00:00:00';
						var thoiGianKetThuc = monthAfter+' 01 '+yearAfter +' 00:00:00';
						start_time = Date.parse(thoiGianBatDau) / 1000,
						end_time = Date.parse(thoiGianKetThuc) / 1000
						console.log("Xxxxxxxxxxxxxxxxxxxxxxxx",thoiGianBatDau,thoiGianKetThuc)
	
					}
					if(ngay == null && thang != null && nam != null){
						var year = nam
						var yearAfter = nam
						var monthNow = thang
						var monthAfter 
						if (monthNow  === 12 ){
							monthAfter = 1
							yearAfter =  yearAfter + 1
						}
						else{
							monthAfter = Number(monthNow) +1 
						}
						var thoiGianBatDau = monthNow +' 01 '+ year+' 00:00:00';
						var thoiGianKetThuc = monthAfter+' 01 '+yearAfter +' 00:00:00';
						start_time = Date.parse(thoiGianBatDau) / 1000,
						end_time = Date.parse(thoiGianKetThuc) / 1000
						console.log("Xxxxxxxxxxxxxxxxxxxxxxxx",thoiGianBatDau,thoiGianKetThuc)
	
					}
	
					if (ngay != null && thang != null && nam != null){
						var thoiGianBatDau = thang +' '+ngay+' '+nam+' 00:00:00';
						start_time = Date.parse(thoiGianBatDau) / 1000,
						end_time = start_time + 86400
						console.log("Xxxxxxxxxxxxxxxxxxxxxxxx",thoiGianBatDau)
	
	
					}
					if (ngay == null && thang == null && nam == null){
						ngay = moment().format('DD')
						thang = moment().format('MM')
						nam = moment().format('YYYY')
						
						var thoiGianBatDau = thang +' '+ngay+' '+nam+' 00:00:00';
						start_time = Date.parse(thoiGianBatDau) / 1000,
						end_time = start_time + 86400
						console.log("Xxxxxxxxxxxxxxxxxxxxxxxx",thoiGianBatDau)
					}
					if (ngay != null && thang == null && nam == null){
						thang = moment().format('MM')
						nam = moment().format('YYYY')
						
						var thoiGianBatDau = thang +' '+ngay+' '+nam+' 00:00:00';
						start_time = Date.parse(thoiGianBatDau) / 1000,
						end_time = start_time + 86400
						console.log("Xxxxxxxxxxxxxxxxxxxxxxxx",thoiGianBatDau)
					}
					if (ngay != null && thang == null && nam != null){
						thang = moment().format('MM')
						
						var thoiGianBatDau = thang +' '+ngay+' '+nam+' 00:00:00';
						start_time = Date.parse(thoiGianBatDau) / 1000,
						end_time = start_time + 86400
						console.log("Xxxxxxxxxxxxxxxxxxxxxxxx",thoiGianBatDau)
					}
					if (ngay != null && thang != null && nam == null){
						nam = moment().format('YYYY')
						var thoiGianBatDau = thang +' '+ngay+' '+nam+' 00:00:00';
						start_time = Date.parse(thoiGianBatDau) / 1000,
						end_time = start_time + 86400
						console.log("Xxxxxxxxxxxxxxxxxxxxxxxx",thoiGianBatDau)
					}
				}
				


				var type_donvi = self.$el.find("#type").data("gonrin").getValue();
				self.$el.find('.spinner-border').show()
				var params = {
					"start_time": start_time,
					"end_time": end_time,
					"medical_supplies_id": self.vattu_id,
					"type_donvi": type_donvi
				}
				console.log(type_donvi)
				var url
				if (type_donvi == "donvicungung") {
					url = self.getApp().serviceURL + "/api/v1/organizational_list_donvicungung";
				}
				else{
					url = self.getApp().serviceURL + "/api/v1/organizational_list_statistics1";
				}
				$.ajax({
					type: "POST",
					url: url,
					data: JSON.stringify(params),
					success: function (response) {
						console.log(response)
						self.$el.find('.spinner-border').hide()

                        self.$el.find('#danhSachDonVi tr').remove()
                        response.forEach(function(item,index){
                            self.$el.find('#danhSachDonVi').append(`
                            <tr>
                                <td>${item.organization_name}</td>
                                <td>${item.quantity_import}</td>
                                <td>${item.quantity_export}</td>
                                <td>${item.net_amount}</td>
                                <td>${item.estimates_net_amount}</td>
                            </tr>
                            `)
                        })
					},
					error: function (xhr, status, error) {
						try {
							if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} else {
								self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						}
						catch (err) {
						  self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
						}
					},
				});
			});
        },
        loadUIControl: function(){
            var self = this;
            //Combobox
            self.$el.find('#type').combobox({
                textField: "text",
                valueField: "value",
                allowTextInput: true,
                enableSearch: true,
                dataSource: [
                    { value: "donvinhanuoc", text: "Đơn vị hành chính" },
                    { value: "donvicungung", text: "Đơn vị cung ứng" },
                ],
            });
			self.$el.find("#type").data("gonrin").setValue("donvinhanuoc");
            // self.$el.find('#start_time').datetimepicker({
            //     textFormat:'DD-MM-YYYY',
            //     extraFormats:['DDMMYYYY'],
            //     parseInputDate: function(val){
            //         return moment.unix(val)
            //     },
            //     parseOutputDate: function(date){
            //         return date.unix()
            //     }
            // });

            // self.$el.find('#end_time').datetimepicker({
            //     textFormat:'DD-MM-YYYY',
            //     extraFormats:['DDMMYYYY'],
            //     parseInputDate: function(val){
            //         return moment.unix(val)
            //     },
            //     parseOutputDate: function(date){
            //         return date.unix()
            //     }
            // });

        },

        loadItemDropdown: function () { // Đổ danh sách Item vào ô tìm kiếm
			var self = this;
			self.$el.find('.search-item').unbind('click').bind('click', function () {
				var text = $(this).val()
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/load_item_dropdown_statistical",
					data: JSON.stringify(text),
					success: function (response) {
						self.$el.find('.dropdown-menu-item .dropdown-item').remove();
						var count = response.length
						response.forEach(function (item, index) {
							self.$el.find('.dropdown-menu-item').append(`
                            <button
                            item-id = "${item.id}" 
							title="${item.name}"
							unit="${item.unit}"
                            class="dropdown-item" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;font-size:13px">${item.name}</button>
                            `)
						})
						if (count == 0) {
							self.$el.find('.dropdown-menu-item').hide()
						}
						if (count == 1) {
							self.$el.find('.dropdown-menu-item').css("height", "45px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 2) {
							self.$el.find('.dropdown-menu-item').css("height", "80px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 3) {
							self.$el.find('.dropdown-menu-item').css("height", "110px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 4) {
							self.$el.find('.dropdown-menu-item').css("height", "130px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count > 4) {
							self.$el.find('.dropdown-menu-item').css("height", "160px")
							self.$el.find('.dropdown-menu-item').show()
						}
						self.chooseItemInListDropdownItem();

					}
				});
			})
			self.$el.find('.search-item').keyup(function name() {
				var text = $(this).val()
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/load_item_dropdown_statistical",
					data: JSON.stringify(text),
					success: function (response) {
						self.$el.find('.dropdown-menu-item .dropdown-item').remove();
						var count = response.length
						response.forEach(function (item, index) {
							self.$el.find('.dropdown-menu-item').append(`
                            <button
                            item-id = "${item.id}" 
							title="${item.name}"
							unit="${item.unit}"
                            class="dropdown-item" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;font-size:13px">${item.name}</button>
                            `)
						})
						if (count == 0) {
							self.$el.find('.dropdown-menu-item').hide()
						}
						if (count == 1) {
							self.$el.find('.dropdown-menu-item').css("height", "45px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 2) {
							self.$el.find('.dropdown-menu-item').css("height", "80px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 3) {
							self.$el.find('.dropdown-menu-item').css("height", "110px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 4) {
							self.$el.find('.dropdown-menu-item').css("height", "130px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count > 4) {
							self.$el.find('.dropdown-menu-item').css("height", "160px")
							self.$el.find('.dropdown-menu-item').show()
						}
						self.chooseItemInListDropdownItem();

					}
				});
			})
			self.$el.find('.out-click').bind('click', function () {
				self.$el.find('.dropdown-menu-item').hide()
			})

        },
        chooseItemInListDropdownItem: function () {
			var self = this;
			self.$el.find('.dropdown-menu-item .dropdown-item').unbind('click').bind('click', function () {
				var dropdownItemClick = $(this);
				console.log("dsafsghfg=======", dropdownItemClick);
				self.$el.find('.search-item').val(dropdownItemClick.attr('title'));
				self.vattu_id = dropdownItemClick.attr('item-id');
				self.$el.find('.dropdown-menu-item').hide()
			})
			self.$el.find('.hideDrop').unbind('click').bind('click', function () {
				self.$el.find('.dropdown-menu-item').hide()

			})
		},
    });

});