define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    var itemTemplate = require('text!app/baocaodonvi_cungung/tpl/item.html'),
        itemSchema = require('json!schema/ReportSupplyOrganizationDetailSchema.json');

    return Gonrin.ItemView.extend({
        bindings: "baocaodonvicungung-bind",
        template: itemTemplate,
        tagName: 'div',
        modelSchema: itemSchema,
        urlPrefix: "/api/v1/",
        collectionName: "report_supply_organization_detail",
        foreignRemoteField: "id",
        foreignField: "report_supply_organization_id",
        render: function () {
            var self = this;
            self.clickOrKeyupSeachItem();
            self.applyBindings();
            self.EventClick();
            self.uploadFile();
            self.selfOrSponsor();
        },
        EventClick: function () {
            const self = this;
            var clas = ["supply-ability", "quantity", "price",]
            clas.forEach(function (item, idex) {
                self.$el.find('.' + item).unbind('click').bind('click', function () {
                    $(this).val($(this).attr(item))
                })
                self.$el.find('.' + item).focusout(function () {
                    var that = $(this)
                    setTimeout(() => {
                        that.attr(item, that.val())
                    }, 50);
                    setTimeout(() => {
                        var ValueString = new Number(that.val()).toLocaleString("da-DK");
                        that.val(ValueString);
                    }, 100);
                    setTimeout(() => {
                        var element = '';
                        for (var i = 0; i < item.length; i++) {
                            if (item[i] === "-") {
                                element = element + "_"
                            }
                            else {
                                element = element + item[i]
                            }
                        }
                        self.model.set(element, Number(that.attr(item)))
                        element = ''
                    }, 150);
                })
                self.$el.find('.' + item).keyup(function () {
                    var num = $(this).attr(item)
                    if (Number.isNaN(Number($(this).val())) === true) {
                        String($(this).val()).slice(-1)
                        $(this).val(num)
                    }
                    num = Number($(this).val())
                })
            })
            self.model.on("change", () => {
                self.trigger("change", self.model.toJSON());
            });
        },
        uploadFile :function(){
            var self = this;
            self.$el.find('.upload-file').on("change", function () {
				var contro = $(this)
				var http = new XMLHttpRequest();
				var fd = new FormData();
				fd.append('file', this.files[0]);
				http.open('POST', '/api/v1/upload/file');
				http.upload.addEventListener('progress', function (evt) {
					if (evt.lengthComputable) {
						var percent = evt.loaded / evt.total;
						percent = parseInt(percent * 100);
					}
				}, false);
				http.addEventListener('error', function () {
				}, false);

				http.onreadystatechange = function () {
					if (http.status === 200) {
						if (http.readyState === 4) {
							var data_file = JSON.parse(http.responseText), link, p, t;
                            self.getApp().notify("Tải file thành công");
                            self.model.set('file',data_file.link)
                            self.$el.find('.file').attr('href',data_file.link)
                            self.$el.find('.fa-eye').addClass('text-primary')
						}
					} else {
						self.getApp().notify("Không thể tải tệp tin lên máy chủ");
					}
				};
				http.send(fd);
			});
        },
        selfOrSponsor: function(){
            var self = this;
            self.model.set('type_sell_sponsor',"sell")
            self.$el.find('.dropdown-type-sell-sponsor .dropdown-item').unbind('click').bind('click', function () {
                self.model.set('type_sell_sponsor',$(this).attr('value'))
                self.$el.find('.dropdown-type-sell-sponsor button').text($(this).text())
			})
        },
        clickOrKeyupSeachItem: function () { // click vào ô tìm kiếm hay là keyup ô tìm kiếm
			var self = this;
			self.$el.find('.health-facilities-id').unbind('click').bind('click', function () {
				var text = $(this).val()
				self.loadItemDropdown(text)
			})

			self.$el.find('.health-facilities-id').keyup(function name() {
				var text = $(this).val()
				self.$el.find('.seach-donvi-giaomua .dropdown-item').remove();
				self.loadItemDropdown(text)
			})
		},
		loadItemDropdown: function (text) { // Đổ danh sách Item vào ô tìm kiếm
			var self = this;
			$.ajax({
				type: "POST",
				url: self.getApp().serviceURL + "/api/v1/load_organization_dropdown_all",
				data: JSON.stringify(text),
				success: function (response) {
					self.$el.find('.seach-donvi-giaomua .dropdown-item').remove();
					var count = response.length
					response.forEach(function (item, index) {
						self.$el.find('.seach-donvi-giaomua').append(`
						<button health-facilities-id = '${JSON.stringify(item)}' class="dropdown-item" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;font-size:13px">${item.name}</button>
						`)
					})
					if (count == 0) {
                        self.$el.find('.seach-donvi-giaomua').hide()
                        self.$el.find('.seach-donvi-giaomua').show()
					}
					if (count == 1) {
						self.$el.find('.seach-donvi-giaomua').css("height", "45px")
						self.$el.find('.seach-donvi-giaomua').show()
					}
					if (count == 2) {
						self.$el.find('.seach-donvi-giaomua').css("height", "80px")
						self.$el.find('.seach-donvi-giaomua').show()
					}
					if (count == 3) {
						self.$el.find('.seach-donvi-giaomua').css("height", "110px")
						self.$el.find('.seach-donvi-giaomua').show()
					}
					if (count == 4) {
						self.$el.find('.seach-donvi-giaomua').css("height", "130px")
						self.$el.find('.seach-donvi-giaomua').show()
					}
					if (count > 4) {
						self.$el.find('.seach-donvi-giaomua').css("height", "160px")
						self.$el.find('.seach-donvi-giaomua').show()
					}
					self.chooseItemInListDropdownItem();

				}
			});
		},
		chooseItemInListDropdownItem: function () {// chọn giá trị tìm kiếm
			var self = this;
			self.$el.find('.seach-donvi-giaomua .dropdown-item').unbind('click').bind('click', function () {
                var donViGiaoMua = JSON.parse($(this).attr('health-facilities-id'))
                self.$el.find('.health-facilities-id').val(donViGiaoMua.name)
                self.model.set('health_facilities_id',donViGiaoMua.id)
				self.$el.find('.seach-donvi-giaomua').hide()
            })
		},
    });
});