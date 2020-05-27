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
            self.loadItemDropdown();
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
				var stt = self.$el.find('[col-type="STT"]').length + 1;
				var dropdownItemClick = $(this);
				var beginNetAmount = new Number(dropdownItemClick.attr('begin_net_amount')).toLocaleString("da-DK");

				var itemID = dropdownItemClick.attr('item-id')
				self.$el.find('#list-item').before(`
                <div style="width: 1000px;height: 50px;" selected-item-id = "${itemID}" class = "selected-item-new selected-item-general" 
                item_id = "${dropdownItemClick.attr('item-id')}" item-id = "${dropdownItemClick.attr('item-id')}">
                    <div style="width: 28px; display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="STT" class="form-control text-center p-1" value="${stt}" style="font-size:14px">
                    </div>
                    <div style="width: 248px;display: inline-block;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="NAME" class="form-control p-1" value="${dropdownItemClick.attr('title')}" readonly style="font-size:14px">
					</div>
					<div style="width: 148px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}"  class="form-control text-center p-1" readonly value="${dropdownItemClick.attr('unit')}" style="font-size:14px">
					</div>
					<div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="BEGIN_NET_AMOUNT"  readonly begin_net_amount="${dropdownItemClick.attr('begin_net_amount')}" class="form-control text-center p-1" value="${beginNetAmount}" style="font-size:14px">
                    </div>
                    <div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="QUANTITY_IMPORT" type="number" quantity_import="0" class="form-control text-center p-1" value="0" style="font-size:14px">
                    </div>
                    <div style="width: 106px; display: inline-block; text-align:center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="QUANTITY_EXPORT" type="number" quantity_export="0" class="form-control text-center p-1" value = "0" style="font-size:14px">
                    </div>
                    <div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="END_NET_AMOUNT"  end_net_amount = "0" value="0" class="form-control text-center p-1" readonly style="font-size:14px">
					</div>
					<div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="ESTIMATES_NET_AMOUNT" type="number" estimates_net_amount="0" value="0" class="form-control text-center p-1"  style="font-size:14px">
                    </div>
                    <div style="width: 14px;display: inline-block;text-align: center;padding: 1px;">
                            <i selected-item-id = "${itemID}" class="fa fa-trash" style="font-size: 17px"></i>
                        </div>
                </div>
                `)
				self.$el.find('.dropdown-menu-item').hide()
				self.$el.find('.search-item').val('')
				self.clickImportExport();
				self.$el.find('.selected-item-new div .fa-trash').unbind('click').bind('click', function () {
					self.$el.find('.selected-item-new[selected-item-id="' + $(this).attr('selected-item-id') + '"]').remove();
				})
			})

		},
    });

});