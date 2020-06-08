define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/thongkebaocao_cungung/tpl/view.html');

	return Gonrin.View.extend({
		template: template,
		vattu_id: "",
		vattu_ten: "",
		render: function () {
			var self = this;
			self.function_filter();
		},
		function_filter: function(){
			var self = this;
			self.vattu_id = "";
			self.vattu_ten = "";
			self.typeFilter();
			self.loadItemDropdown();
			self.$el.find(".button-filter").unbind("click").bind("click", function () {
				self.$el.find('.spinner-border').show()
				var date = moment(self.$el.find('#date-report').data("gonrin").getValue()*1000).format('MM DD YYYY') + ' 00:00:00';
				var date_start = Date.parse(date) /1000
				var date_end = date_start + 86400

				var params = {};
				params['type_donvi'] = "donvicungung";
				params['medical_supplies_id'] = self.vattu_id;
				params['medical_supplies_name'] = self.vattu_ten;
				params['date_report_start'] =date_start
				params['date_report_end'] = date_end
				self.apiFilter(params)
			});
		},
		apiFilter : function(params){
			var self = this;
			$.ajax({
				type: "POST",
				url: self.getApp().serviceURL + "/api/v1/enterprise_supply_statistics",
				data: JSON.stringify(params),
				success: function (response) {
					self.$el.find('.spinner-border').hide()
					self.$el.find('#danhSachDonVi tr').remove()

					var avg_price = new Number(response.avg_price).toLocaleString("da-DK");
					var sum_sponsored_sell_number = new Number(response.sum_sponsored_sell_number).toLocaleString("da-DK");
					var sum_price = new Number(response.sum_price).toLocaleString("da-DK");

					self.$el.find('#danhSachDonVi').append(`
						<tr class="text-center">
							<th>I</th>
							<th class="text-left">${response.medical_supplies_name}</th>
							<th>${avg_price}</th>
							<th>${sum_sponsored_sell_number}</th>
							<th>${sum_price}</th>
						</tr>
						`)
					response.data.forEach(function (item, index) {
						var price = new Number(item.price).toLocaleString("da-DK");
						var sell_number = new Number(item.sell_number).toLocaleString("da-DK");
						var sum_price2 = new Number(item.sell_number * item.price).toLocaleString("da-DK");

						self.$el.find('#danhSachDonVi').append(`
						<tr class="text-center">
						<td>${index+1}</td>
							<td class="text-left">${item.organization_name}</td>
							<td>${price}</td>
							<td>${sell_number}</td>
							<td>${sum_price2}</td>
						</tr>
						`)
					})
					self.exportExcel(response, params);

				},
				error: function (xhr, status, error) {
					try {
						if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
							self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
					}
				},
			});
		},
		typeFilter: function () {
			var self = this;
			self.$el.find('#date-report').datetimepicker({
				textFormat: 'DD-MM-YYYY',
				extraFormats: ['DDMMYYYY'],
				parseInputDate: function (val) {
					return moment.unix(val)
				},
				parseOutputDate: function (date) {
					return date.unix()
				}
			});
		},

		loadItemDropdown: function () { // Đổ danh sách Item vào ô tìm kiếm
			var self = this;
			self.$el.find('.search-item').unbind('click').bind('click', function () {
				$(this).select();
				var selectedList = [];
				self.$el.find('.selected-item-general').each(function (index, item) {
					selectedList.push($(item).attr('item_id'))
				})
				var text = $(this).val()
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/load_medical_supplies_dropdown2",
					data: JSON.stringify({ "text": text, "selectedList": selectedList }),
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
					url: self.getApp().serviceURL + "/api/v1/load_medical_supplies_dropdown2",
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
				self.$el.find('.search-item').val(dropdownItemClick.attr('title'));
				self.vattu_id = dropdownItemClick.attr('item-id');
				self.vattu_ten = dropdownItemClick.attr('title');

				self.$el.find('.dropdown-menu-item').hide()
			})
			self.$el.find('.hideDrop').unbind('click').bind('click', function () {
				self.$el.find('.dropdown-menu-item').hide()

			})
		},
		exportExcel: function (data, params) {
			params.medical_supplies_name = params.medical_supplies_name.replace('%',' phần trăm')
			var self = this;
			self.$el.find('.button-excel').unbind('click').bind('click', function () {
					var date_report_start = moment(params.date_report_start * 1000).format('DD MM YYYY');
					var filter = "Thống kê " + params.medical_supplies_name + " trong ngày " + date_report_start;
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/export_excel_cungung",
					data: JSON.stringify({ "data": data, "filter": filter }),
					success: function (response) {
						window.location = String(self.getApp().serviceURL + response.message);
					}
				})
			})
		}
	});

});