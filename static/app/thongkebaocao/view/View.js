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
            self.loadUIControl();
			self.loadItemDropdown();
			self.$el.find(".button-filter").unbind("click").bind("click", function () {
				var start_time = self.$el.find("#start_time").data("gonrin").getValue(),
					end_time = self.$el.find("#end_time").data("gonrin").getValue(),
					vattu_id = self.vattu_id,
					type_donvi = self.$el.find("#type").data("gonrin").getValue();
				console.log("start time", start_time, "end time", end_time, "type_donvi", type_donvi, "vatu_id", vattu_id);
				var params = {
					"start_time": start_time,
					"end_time": end_time,
					"vattu_id": vattu_id,
					"type_donvi": type_donvi
				}
				var url = self.getApp().serviceURL + "/api/v1/load_item_dropdown_statistical";
				if (type_donvi == "donvicungung") {
					url = self.getApp().serviceURL + "/api/v1/create_report_donvicungung";
				}
				$.ajax({
					type: "POST",
					url: url,
					data: JSON.stringify(params),
					success: function (response) {

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
                    { value: "donvinhanuoc", text: "Nhà nước" },
                    { value: "donvicungung", text: "Cung ứng" },
                ],
            });
			self.$el.find("#type").data("gonrin").setValue("donvinhanuoc");
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
				console.log("dsafsghfg=======", dropdownItemClick);
				self.$el.find('.search-item').val(dropdownItemClick.attr('title'));
				self.vattu_id = dropdownItemClick.attr('item-id');
				self.$el.find('.dropdown-menu-item').hide()
			})

		},
    });

});