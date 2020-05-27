define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/thongkebaocao/tpl/view.html');

    return Gonrin.View.extend({
        template: template,
        render: function () {
            var self = this;
            self.loadUIControl();
            self.loadItemDropdown();
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
                    { value: "donvinhanuoc", text: "Nhà nước" },
                    { value: "donvicungung", text: "Cung ứng" },
                ],
            });

            self.$el.find('#start_time').datetimepicker({
                textFormat:'DD-MM-YYYY',
                extraFormats:['DDMMYYYY'],
                parseInputDate: function(val){
                    return moment.unix(val)
                },
                parseOutputDate: function(date){
                    return date.unix()
                }
            });

            self.$el.find('#end_time').datetimepicker({
                textFormat:'DD-MM-YYYY',
                extraFormats:['DDMMYYYY'],
                parseInputDate: function(val){
                    return moment.unix(val)
                },
                parseOutputDate: function(date){
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
						self.$el.find('.dropdown-item').remove();
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
						self.$el.find('.dropdown-item').remove();
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
			self.$el.find('.dropdown-item').unbind('click').bind('click', function () {
				var dropdownItemClick = $(this);
                self.$el.find('.search-item').val(dropdownItemClick.attr('title'))
				self.$el.find('.dropdown-menu-item').hide()
			})

		},
    });

});