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

					self.$el.find('#danhSachDonVi').append(`
						<tr>
							<th>I</th>
							<th>${response.medical_supplies_name}</th>
							<th>${response.avg_price}</th>
							<th>${response.sum_sponsored_sell_number}</th>
							<th>${response.sum_price}</th>
						</tr>
						`)
					response.data.forEach(function (item, index) {
						self.$el.find('#danhSachDonVi').append(`
						<tr>
						<td>${index+1}</td>
							<td>${item.organization_name}</td>
							<td>${item.price}</td>
							<td>${item.sponsored_number + item.sell_number}</td>
							<td>${(item.sponsored_number + item.sell_number) * item.price }</td>
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
					url: self.getApp().serviceURL + "/api/v1/load_item_dropdown_statistical",
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
			var self = this;
			self.$el.find('.button-excel').unbind('click').bind('click', function () {
				if (params.type == "all") {
					var filter = "Thống kê " + params.medical_supplies_name + " từ trước đến nay";
				}
				else if (params.type == "fromBeforeToDay") {
					var to_date = moment(params.to_date * 1000).format('DD MM YYYY');
					var filter = "Thống kê " + params.medical_supplies_name + " từ trước đến ngày " + to_date;
				}
				else if (params.type == "fromDayToDay") {
					var from_date = moment(params.from_date * 1000).format('DD MM YYYY');
					var to_date = moment(params.to_date * 1000).format('DD MM YYYY');
					var filter = "Thống kê " + params.medical_supplies_name + " từ ngày " + from_date + " đến ngày " + to_date;
				}
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/export_excel",
					data: JSON.stringify({ "data": data, "filter": filter }),
					success: function (response) {
						window.location = String(self.getApp().serviceURL + response.message);
					}
				})
			})
		}
	});

});