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
			self.vattu_id = "";
			self.typeFilter();
			self.loadItemDropdown();

			self.$el.find(".button-filter").unbind("click").bind("click", function () {
				var params = {};
				params['type'] = self.$el.find('.type-filter button').attr('filter');
				params['type_donvi'] = "donvinhanuoc";
				params['medical_supplies_id'] = self.vattu_id;

				if (self.$el.find('.type-filter button').attr('filter') == "none") {
					self.getApp().notify({ message: "Bạn chưa chọn bộ lọc" }, { type: "danger", delay: 1000 });
					params['from_date'] = null;
					params['to_date'] = null;
				}
				else if (self.$el.find('.type-filter button').attr('filter') == "all") {
					params['from_date'] = null;
					params['to_date'] = null;
				}
				else if (self.$el.find('.type-filter button').attr('filter') == "fromBeforeToDay") {
					params['from_date'] = null;
					params['to_date'] = self.$el.find('#end_time').data("gonrin").getValue()
				}
				else if (self.$el.find('.type-filter button').attr('filter') == "fromDayToDay") {
					params['from_date'] = self.$el.find('#start_time').data("gonrin").getValue()
					params['to_date'] = self.$el.find('#end_time').data("gonrin").getValue()
				}
				self.$el.find('.spinner-border').show()

				console.log(params)
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/organizational_list_statistics1",
					data: JSON.stringify(params),
					success: function (response) {
						self.$el.find('.spinner-border').hide()
						self.$el.find('#danhSachDonVi tr').remove()
						response.forEach(function (item, index) {
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
			});
		},
		typeFilter: function () {
			var self = this;
			self.$el.find('.type-filter .dropdown-menu .dropdown-item').unbind('click').bind('click', function () {
				self.$el.find('.type-filter button').text($(this).attr('text'))
				self.$el.find('.type-filter button').attr("filter",$(this).attr('filter'))

				if ($(this).attr('filter') == "none") {
					self.$el.find('.start-time').hide()
					self.$el.find('.end-time').hide()
				}
				else if ($(this).attr('filter') == "all") {
					self.$el.find('.start-time').hide()
					self.$el.find('.end-time').hide()
				}
				else if ($(this).attr('filter') == "fromBeforeToDay") {
					self.$el.find('.start-time').hide()
					self.$el.find('.end-time').show()
				}
				else if ($(this).attr('filter') == "fromDayToDay") {
					self.$el.find('.start-time').show()
					self.$el.find('.end-time').show()
				}
			})


			self.$el.find('#start_time').datetimepicker({
				textFormat: 'DD-MM-YYYY',
				extraFormats: ['DDMMYYYY'],
				parseInputDate: function (val) {
					return moment.unix(val)
				},
				parseOutputDate: function (date) {
					return date.unix()
				}
			});

			self.$el.find('#end_time').datetimepicker({
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