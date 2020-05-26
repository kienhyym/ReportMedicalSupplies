define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/baocaodonvi/tpl/model.html'),
		schema = require('json!schema/ReportOrganizationSchema.json');
	var OrganizationView = require('app/donvicungung/view/SelectView');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "report_organization",
		bindings: "data-bind",
		listItemRemove: [],
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-default btn-sm btn-secondary",
						label: "TRANSLATE:BACK",
						command: function () {
							var self = this;

							Backbone.history.history.back();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:SAVE",
						command: function () {
							var self = this;
							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify("Lưu thông tin thành công");
									self.getApp().getRouter().navigate(self.collectionName + "/collection");
									self.createItem(respose.id)
									self.updateItem();
									self.deleteItem();
								},
								error: function (xhr, status, error) {
									try {
										if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
											self.getApp().getRouter().navigate("login");
										} else {
											self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
										}
									}
									catch (err) {
										self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
									}
								}
							});
						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger btn-sm",
						label: "TRANSLATE:DELETE",
						visible: function () {
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, response) {
									self.getApp().notify('Xoá dữ liệu thành công');
									self.getApp().getRouter().navigate(self.collectionName + "/collection");
								},
								error: function (xhr, status, error) {
									try {
										if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
											self.getApp().getRouter().navigate("login");
										} else {
											self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
										}
									}
									catch (err) {
										self.getApp().notify({ message: "Xóa dữ liệu không thành công" }, { type: "danger", delay: 1000 });
									}
								}
							});
						}
					},
				],
			}],
		uiControl: {
			fields: [
				{
					field: "organization",
					uicontrol: "ref",
					textField: "name",
					foreignRemoteField: "id",
					foreignField: "organization_id",
					dataSource: OrganizationView
				},
			]
		},
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.loadItemDropdown();
						self.showDetail();
						self.listItemsOldRemove();

					},
					error: function (xhr, status, error) {
						try {
							if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} else {
								self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						}
						catch (err) {
							self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
						}
					}
				});
			} else {
				self.applyBindings();
				self.loadItemDropdown();

			}

		},
		// CHỨC NĂNG CHỌN ITEM.
		chooseItemInListDropdownItem: function () {
			var self = this;
			self.$el.find('.dropdown-item').unbind('click').bind('click', function () {
				var stt = self.$el.find('[col-type="STT"]').length + 1;
				var dropdownItemClick = $(this);
				var itemID = dropdownItemClick.attr('item-id')
				self.$el.find('#list-item').before(`
                <div style="width: 1000px;height: 50px;" selected-item-id = "${itemID}" class = "selected-item-new" 
                item-id = "${dropdownItemClick.attr('item-id')}"
                >
                    <div style="width: 45px; display: inline-block;text-align: center;padding: 5px;">
                        <input selected-item-id = "${itemID}" col-type="STT" class="form-control text-center p-1" value="${stt}" style="font-size:14px">
                    </div>
                    <div style="width: 290px;display: inline-block;padding: 5px;">
                        <input selected-item-id = "${itemID}" col-type="NAME" class="form-control p-1" value="${dropdownItemClick.attr('title')}" readonly style="font-size:14px">
					</div>
					<div style="width: 190px;display: inline-block;text-align: center;padding: 5px;">
                        <input selected-item-id = "${itemID}"  class="form-control text-center p-1" value="${dropdownItemClick.attr('unit')}" style="font-size:14px">
                    </div>
                    <div style="width: 140px;display: inline-block;text-align: center;padding: 5px;">
                        <input selected-item-id = "${itemID}" col-type="QUANTITY_IMPORT" type="number" class="form-control text-center p-1" value="0" style="font-size:14px">
                    </div>
                    <div style="width: 140px; display: inline-block; text-align:center;padding: 5px;">
                        <input selected-item-id = "${itemID}" col-type="QUANTITY_EXPORT" type="number" class="form-control text-center p-1" value = "0" style="font-size:14px">
                    </div>
                    <div style="width: 140px;display: inline-block;text-align: center;padding: 5px;">
                        <input selected-item-id = "${itemID}" col-type="NET_AMOUNT" type="number" class="form-control text-center p-1" readonly style="font-size:14px">
                    </div>
                    <div style="width: 30px;display: inline-block;text-align: center;padding: 5px;">
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
		clickImportExport: function () {
			var self = this;
			self.$el.find('selected-item')
			//Out Click QUANTITY_IMPORT
			self.$el.find('[col-type="QUANTITY_IMPORT"]').focusout(function () {
				var pointerOutQuantityImport = $(this);
				var pointerOutQuantityValueImport = pointerOutQuantityImport.val();
				if (pointerOutQuantityValueImport == null || pointerOutQuantityValueImport == '') {
					pointerOutQuantityImport.val(0)
				}

				var selectedItemId = pointerOutQuantityImport.attr('selected-item-id');
				var pointerOutQuantityExport = self.$el.find('[col-type="QUANTITY_EXPORT"][selected-item-id = ' + selectedItemId + ']').val();
				var resultNetAmount = pointerOutQuantityImport.val() - pointerOutQuantityExport;
				self.$el.find('[col-type="NET_AMOUNT"][selected-item-id = ' + selectedItemId + ']').val(resultNetAmount);
			});
			//Out Click QUANTITY_EXPORT
			self.$el.find('[col-type="QUANTITY_EXPORT"]').focusout(function () {
				var pointerOutQuantityExport = $(this);
				var pointerOutQuantityValueExport = pointerOutQuantityExport.val();
				if (pointerOutQuantityValueExport == null || pointerOutQuantityValueExport == '') {
					pointerOutQuantityExport.val(0)
				}
				var selectedItemId = pointerOutQuantityExport.attr('selected-item-id');
				var pointerOutQuantityImport = self.$el.find('[col-type="QUANTITY_IMPORT"][selected-item-id = ' + selectedItemId + ']').val();
				var resultNetAmount = pointerOutQuantityImport - pointerOutQuantityExport.val();
				self.$el.find('[col-type="NET_AMOUNT"][selected-item-id = ' + selectedItemId + ']').val(resultNetAmount);
			});
		},
		loadItemDropdown: function () { // Đổ danh sách Item vào ô tìm kiếm
			var self = this;
			self.$el.find('.search-item').keyup(function name() {
				self.$el.find('.dropdown-item').remove();
				var text = $(this).val()
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/load_item_dropdown",
					data: JSON.stringify(text),
					success: function (response) {
						var count = response.length
						response.forEach(function (item, index) {
							self.$el.find('.dropdown-menu-item').append(`
                            <button
                            item-id = "${item.id}" 
							title="${item.name}"
							unit="${item.unit}"
                            class="dropdown-item" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">${item.name}</button>
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
						if (count > 2) {
							self.$el.find('.dropdown-menu-item').css("height", "110px")
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
		showDetail: function () {
			var self = this;
			if (self.model.get('details').length > 0) {
				self.model.get('details').forEach(function (item, index) {
					var quantityImportToLocaleString = new Number(item.quantity_import).toLocaleString("da-DK");
					var quantityExportToLocaleString = new Number(item.quantity_export).toLocaleString("da-DK");
					self.$el.find('#list-item').before(`
                    <div style="width: 1000px;height: 50px;" selected-item-id = "${item.id}" class = "selected-item-old" >
                        <div style="width: 45px; display: inline-block;text-align: center;padding: 5px;">
                            <input selected-item-id = "${item.id}" col-type="STT" class="form-control text-center p-1" value="${index + 1}" style="font-size:14px">
                        </div>
                        <div style="width: 290px;display: inline-block;padding: 5px;">
                            <input selected-item-id = "${item.id}" col-type="NAME" class="form-control p-1" value="${item.medical_supplies_name}" readonly style="font-size:14px">
						</div>
						<div style="width: 190px;display: inline-block;text-align: center;padding: 5px;">
							<input selected-item-id = "${item.id}"  class="form-control text-center p-1" value="${item.medical_supplies_unit}" style="font-size:14px">
						</div>
                        <div style="width: 140px;display: inline-block;text-align: center;padding: 5px;">
                            <input selected-item-id = "${item.id}" col-type="QUANTITY_IMPORT" type="number" class="form-control text-center p-1" value="${quantityImportToLocaleString}" style="font-size:14px">
                        </div>
                        <div style="width: 140px; display: inline-block; text-align:center;padding: 5px;">
                            <input selected-item-id = "${item.id}" col-type="QUANTITY_EXPORT" type="number" class="form-control text-center p-1" value = "${quantityExportToLocaleString}" style="font-size:14px">
                        </div>
                        <div style="width: 140px;display: inline-block;text-align: center;padding: 5px;">
                            <input selected-item-id = "${item.id}" col-type="NET_AMOUNT" class="form-control text-center p-1" value="${quantityImportToLocaleString - quantityExportToLocaleString}" readonly style="font-size:14px">
                        </div>
                        <div style="width: 30px;display: inline-block;text-align: center;padding: 5px;">
                            <i selected-item-id = "${item.id}" class="fa fa-trash" style="font-size: 17px"></i>
                        </div>
                    </div>
                    `)
				})
				self.clickImportExport();

			}


		},
		createItem: function (report_organization_id) {
			var self = this;
			var arr = [];
			self.$el.find('.selected-item-new').each(function (index, item) {
				var obj = {
					"report_organization_id": report_organization_id,
					"organization_id": self.model.get('organization_id'),
					"medical_supplies_id": $(item).attr('item-id'),
					"quantity_export": $(item).find('[col-type="QUANTITY_EXPORT"]').val(),
					"quantity_import": $(item).find('[col-type="QUANTITY_IMPORT"]').val(),
				}
				arr.push(obj)
			})
			if (arr.length > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/create_report_organization_detail",
					data: JSON.stringify(arr),
					success: function (response) {
						console.log(response)
					}
				});
			}

		},
		updateItem: function () {
			var self = this;
			var arr = [];
			self.$el.find('.selected-item-old').each(function (index, item) {
				var obj = {
					"id": $(item).attr('selected-item-id'),
					"organization_id": self.model.get('organization_id'),
					"quantity_export": $(item).find('[col-type="QUANTITY_EXPORT"]').val(),
					"quantity_import": $(item).find('[col-type="QUANTITY_IMPORT"]').val(),
				}
				arr.push(obj)
			})
			if (arr.length > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/update_report_organization_detail",
					data: JSON.stringify(arr),
					success: function (response) {
						console.log(response)
					}
				});
			}
		},
		listItemsOldRemove: function () {
			var self = this;
			self.$el.find('.selected-item-old div .fa-trash').unbind('click').bind('click', function () {
				self.$el.find('.selected-item-old[selected-item-id="' + $(this).attr('selected-item-id') + '"]').remove();
				self.listItemRemove.push($(this).attr('selected-item-id'))
			})
		},
		deleteItem: function () {
			var self = this;
			var arrayItemRemove = self.listItemRemove.length;
			if (arrayItemRemove > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/delete_report_organization_detail",
					data: JSON.stringify(self.listItemRemove),
					success: function (response) {
						self.listItemRemove.splice(0, arrayItemRemove);
						console.log(response)
					}
				});
			}
		},


		// HẾT CHỨC NĂNG CHỌN ITEM XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
		// XXXXXXXXXXXXXXXXXXXXXXXXXXXX
	});

});