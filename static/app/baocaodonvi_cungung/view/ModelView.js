define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/baocaodonvi_cungung/tpl/model.html'),
		schema = require('json!schema/ReportSupplyOrganizationSchema.json');
	var OrganizationView = require('app/donvicungung/view/SelectView');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "report_supply_organization",
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
							self.model.get('details').forEach(function (item, index) {
								delete item.check_begin_net_amount
							})
							var arr = [];
							self.$el.find('.selected-item-general').each(function (index, item) {
								var obj = {
									"organization_id": self.model.get('organization_id'),
									"medical_supplies_id": $(item).attr('item_id'),
									"date": self.model.get('date')
								}
								arr.push(obj)
							})
							if (arr.length > 0) {
								$.ajax({
									type: "POST",
									url: self.getApp().serviceURL + "/api/v1/check_date_begin_new_amount",
									data: JSON.stringify(arr),
									success: function (response) {
										console.log(response)
										if (response.message == "false") {
											self.getApp().notify({ message: "Ngày tạo báo cáo thấp hơn ngày khởi tạo tồn" }, { type: "danger", delay: 1000 });
											return false
										}
										else {
											self.model.save(null, {
												success: function (model, respose, options) {
													self.getApp().notify("Lưu thông tin thành công");
													self.createItem(respose.id)
													self.updateItem();
													self.deleteItem();
													self.getApp().getRouter().navigate("baocaodonvi_cungung/collection");
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
									}
								});
							}

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
									self.getApp().getRouter().navigate("baocaodonvi_cungung/collection");
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
				{
					field: "date",
					uicontrol: "datetimepicker",
					textFormat: "DD/MM/YYYY",
					extraFormats: ["DDMMYYYY"],
					parseInputDate: function (val) {
						return moment.unix(val)
					},
					parseOutputDate: function (date) {
						return date.unix()
					}
				},
			]
		},
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			self.model.set('date', moment().unix());
			self.listItemRemove = [];
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
				var currentUser = gonrinApp().currentUser;
				self.model.set("organization", currentUser.Organization);
			}

		},
		// CHỨC NĂNG CHỌN ITEM.
		chooseItemInListDropdownItem: function () {
			var self = this;
			self.$el.find('.dropdown-item').unbind('click').bind('click', function () {
				
				var stt = self.$el.find('[col-type="STT"]').length + 1;
				var dropdownItemClick = $(this);
				var itemID = dropdownItemClick.attr('item-id')
				var dem = 0
				self.$el.find('.selected-item-general').each(function(index,item){
					if (itemID == $(item).attr('item_id')){
						dem++;
					}
				})
				if (dem >=2 ){
					self.getApp().notify({ message: "1 vật tư không được chọn quá 2 lần" }, { type: "danger", delay: 1000 });
				}


				else{
					self.$el.find('#list-item').before(`
					<div style="width: 1000px;height: 50px;" selected-item-id = "${itemID}" class = "selected-item-new selected-item-general" 
					item_id = "${dropdownItemClick.attr('item-id')}" item-id = "${dropdownItemClick.attr('item-id')}">
						<div style="width: 28px; display: inline-block;text-align: center;padding: 1px;">
							<input selected-item-id = "${itemID}" col-type="STT" class="form-control text-center p-1" value="${stt}" style="font-size:14px">
						</div>
						<div style="width: 248px;display: inline-block;padding: 1px;">
							<input selected-item-id = "${itemID}" col-type="NAME" class="form-control p-1" value="${dropdownItemClick.attr('title')}" readonly style="font-size:14px">
						</div>
						<div style="width: 66px;display: inline-block;text-align: center;padding: 1px;">
							<input selected-item-id = "${itemID}"  class="form-control text-center p-1" readonly value="${dropdownItemClick.attr('unit')}" style="font-size:14px">
						</div>
						<div style="width: 100px;display: inline-block;text-align: center;padding: 1px;">
							<input selected-item-id = "${itemID}" col-type="SUPPLY_ABILITY" supply_ability="0" value="0"    class="form-control text-center p-1" style="font-size:14px">
						</div>
						<div style="width: 100px;display: inline-block;text-align: center;padding: 1px;">
							<input selected-item-id = "${itemID}" col-type="SELL_NUMBER" sell_number="0" value="0"   class="form-control text-center p-1" style="font-size:14px">
						</div>
						<div style="width: 100px; display: inline-block; text-align:center;padding: 1px;">
							<input selected-item-id = "${itemID}" col-type="SPONSORED_NUMBER" sponsored_number="0" value = "0"   class="form-control text-center p-1" style="font-size:14px">
						</div>
						<div style="width: 100px;display: inline-block;text-align: center;padding: 1px;">
							<input selected-item-id = "${itemID}" col-type="PRICE"  price="0" value="0"    class="form-control text-center p-1"  style="font-size:14px">
						</div>
						<div style="width: 116px;display: inline-block;text-align: center;padding: 1px;">
						<div style="position: relative;">
						<div style="width: 100%;display: inline-block;padding: 1px;position: relative;" class="dropdown-${itemID}">
							<input selected-item-id = "${itemID}" type="text" class="form-control" placeholder="Nhập tên đơn vị" item-id="null" class-name = "dropdown-${itemID}">
							<div class="card" style="position: absolute;top: 45px;left: 5px;width: 280px;">
								<div class="dropdown-menu" style="height: 110px;overflow-x: hidden;width:280px;"></div>
							</div>
						</div>
						</div>				
						</div>
						<div style="width: 90px;display: inline-block;text-align: center;padding: 1px;">
						<div style="position: relative;">
							<input selected-item-id = "${itemID}" col-type="FILE" type="file" style="width:35px; position: absolute; opacity: 0;"> 
							<button class= "btn btn-outline-secondary pl-1 pr-1">Tải lên</button>
							<a selected-item-id = "${itemID}" col-type="DOWNLOAD" href="#" class= "btn btn-outline-secondary pl-1 pr-1">Xem</a>
						</div>
						</div>
						<div style="width: 14px;display: inline-block;text-align: center;padding: 1px;">
								<i selected-item-id = "${itemID}" class="fa fa-trash" style="font-size: 17px"></i>
							</div>
					</div>
					`)
				}
				self.searchItem(itemID)
				self.$el.find('.dropdown-menu-item').hide()
				self.$el.find('.search-item').val('')
				self.clickInput();
				self.$el.find('.selected-item-new div .fa-trash').unbind('click').bind('click', function () {
					self.$el.find('.selected-item-new[selected-item-id="' + $(this).attr('selected-item-id') + '"]').remove();
				})
			})
		},
		clickInput: function () {
			var self = this;
			
			// Click vào ô số tự đông thêm dấu chấm
			var listClick = [
				{ "col_type": "SUPPLY_ABILITY", "attr": "supply_ability" },
				{ "col_type": "SELL_NUMBER", "attr": "sell_number" },
				{ "col_type": "SPONSORED_NUMBER", "attr": "sponsored_number" },
				{ "col_type": "PRICE", "attr": "price" },
			]

			
			listClick.forEach(function (item, index) {
				self.$el.find('[col-type="' + item.col_type + '"]').keyup(function () {
					var num = $(this).attr(item.attr)
					if(Number.isNaN(Number($(this).val())) === true){
						console.log(String($(this).val()).slice(-1))
						$(this).val(num)
					}
					num = Number($(this).val())
				})
			})
				listClick.forEach(function (item, index) {
				self.$el.find('[col-type="' + item.col_type + '"]').unbind('click').bind('click', function () {
					if (item.col_type == "SELL_NUMBER"){
						self.$el.find('.selected-item-general[selected-item-id = "'+$(this).attr('selected-item-id')+'"]').find('[col-type="SPONSORED_NUMBER"]').val(0)
						self.$el.find('.selected-item-general[selected-item-id = "'+$(this).attr('selected-item-id')+'"]').find('[col-type="SPONSORED_NUMBER"]').attr("sponsored_number",0)

					}
					if (item.col_type == "SPONSORED_NUMBER"){
						self.$el.find('.selected-item-general[selected-item-id = "'+$(this).attr('selected-item-id')+'"]').find('[col-type="SELL_NUMBER"]').val(0)
						self.$el.find('.selected-item-general[selected-item-id = "'+$(this).attr('selected-item-id')+'"]').find('[col-type="SELL_NUMBER"]').attr('SELL_NUMBER',0)

					}
					var clickThis = $(this);
					clickThis.val(clickThis.attr(item.attr))
				})
				self.$el.find('[col-type="' + item.col_type + '"]').focusout(function () {
					var clickThis = $(this);
					var clickThisValue = clickThis.val();
					if (clickThisValue == null || clickThisValue == '') {
						clickThis.val(0);
					}
					else {
						clickThis.attr(item.attr, clickThisValue)
						setTimeout(() => {
							var clickThisString = new Number(clickThisValue).toLocaleString("da-DK");
							console.log('clickThisString',clickThisString)

							clickThis.val(clickThisString)
						}, 200);
					}
				});
			})
			// Upload file
			self.$el.find("[col-type='FILE']").on("change", function () {
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
							self.$el.find("[col-type='DOWNLOAD']").attr('href',data_file.link)
						}
					} else {
						self.getApp().notify("Không thể tải tệp tin lên máy chủ");
					}
				};
				http.send(fd);
			});
		},
		loadItemDropdown: function () { // Đổ danh sách Item vào ô tìm kiếm
			var self = this;
			self.$el.find('.search-item').unbind('click').bind('click', function () {
				var text = $(this).val()
				var selectedList = [];
				self.$el.find('.selected-item-general').each(function (index, item) {
					selectedList.push($(item).attr('item_id'))
				})
				console.log(selectedList)

				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/load_medical_supplies_dropdown2",
					data: JSON.stringify({ "text": text, "selectedList": selectedList }),
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

				var selectedList = [];
				self.$el.find('.selected-item-general').each(function (index, item) {
					selectedList.push($(item).attr('item_id'))
				})
				var text = $(this).val()
				self.$el.find('.dropdown-item').remove();
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/load_item_dropdown_statistical",
					data: JSON.stringify({ "text": text, "selectedList": selectedList }),
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
		showDetail: function () {
			var self = this;
			if (self.model.get('details').length > 0) {
				self.model.get('details').forEach(function (item, index) {
					var String_SupplyAbility = new Number(item.supply_ability).toLocaleString("da-DK");
					var String_SellNumber = new Number(item.sell_number).toLocaleString("da-DK");
					var String_SponsoredNumber = new Number(item.sponsored_number).toLocaleString("da-DK");
					var String_Price = new Number(item.price).toLocaleString("da-DK");

					self.$el.find('#list-item').before(`
                    <div style="width: 1000px;height: 50px;" selected-item-id = "${item.id}" class = "selected-item-old selected-item-general" item_id = ${item.medical_supplies_id} >
                        <div style="width: 28px; display: inline-block;text-align: center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="STT" value="${index + 1}" class="form-control text-center p-1"  readonly style="font-size:14px">
                        </div>
                        <div style="width: 248px;display: inline-block;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="NAME" value="${item.medical_supplies_name}" class="form-control p-1" readonly style="font-size:14px">
						</div>
						<div style="width: 66px;display: inline-block;text-align: center;padding: 1px;">
							<input selected-item-id = "${item.id}"  class="form-control text-center p-1" value="${item.medical_supplies_unit}" readonly  style="font-size:14px">
						</div>
						<div style="width: 100px;display: inline-block;text-align: center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="SUPPLY_ABILITY" supply_ability="${item.supply_ability}" value="${String_SupplyAbility}"    class="form-control text-center p-1" style="font-size:14px">
                        </div>
                        <div style="width: 100px;display: inline-block;text-align: center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="SELL_NUMBER" sell_number="${item.sell_number}" value="${String_SellNumber}"     class="form-control text-center p-1"   style="font-size:14px">
                        </div>
                        <div style="width: 100px; display: inline-block; text-align:center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="SPONSORED_NUMBER" sponsored_number="${item.sponsored_number}" value = "${String_SponsoredNumber}"     class="form-control text-center p-1"  style="font-size:14px">
                        </div>
                        <div style="width: 100px;display: inline-block;text-align: center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="PRICE" price="${item.price}"  value="${String_Price}"    class="form-control text-center p-1"  style="font-size:14px">
						</div>
						<div style="width: 116px;display: inline-block;text-align: center;padding: 1px;">
							<div style="position: relative;">
                            <div style="width: 100%;display: inline-block;padding: 1px;position: relative;" class="dropdown-${item.id}">
                                <input selected-item-id = "${item.id}" value="${item.health_facilities_name}" type="text" class="form-control" placeholder="Nhập tên đơn vị" item-id="${item.health_facilities_id}" class-name = "dropdown-${item.id}">
                                <div class="card" style="position: absolute;top: 45px;left: 5px;width: 280px;">
                                    <div class="dropdown-menu" style="height: 110px;overflow-x: hidden;width:280px;"></div>
                                </div>
                            </div>
                        </div>
						</div>
						<div style="width: 90px;display: inline-block;text-align: center;padding: 1px;">
							<div style="position: relative;">
								<input selected-item-id = "${item.id}" col-type="FILE" type="file" style="width:35px; position: absolute; opacity: 0;"> 
								<button class= "btn btn-outline-secondary pl-1 pr-1">Tải lên</button>
								<a selected-item-id = "${item.id}" col-type="DOWNLOAD" href="${item.file}"  class= "btn btn-outline-secondary pl-1 pr-1">Xem</a>
							</div>
						</div>
                        <div style="width: 14px;display: inline-block;text-align: center;padding: 1px;">
                            <i selected-item-id = "${item.id}" class="fa fa-trash" style="font-size: 17px"></i>
                        </div>
                    </div>
					`)
					self.searchItem(item.id)
				})
				self.clickInput();
			}
		},
		createItem: function (report_supply_organization_id) {
			var self = this;
			var arr = [];
			self.$el.find('.selected-item-new').each(function (index, item) {
				var ccName = $(item).attr('selected-item-id')
				var obj = {
					"report_supply_organization_id": report_supply_organization_id,
					"organization_id": self.model.get('organization_id'),
					"medical_supplies_id": $(item).attr('item-id'),
					"date": self.model.get('date'),

					"supply_ability": $(item).find('[col-type="SUPPLY_ABILITY"]').attr('supply_ability'),
					"sell_number": $(item).find('[col-type="SELL_NUMBER"]').attr('sell_number'),
					"sponsored_number": $(item).find('[col-type="SPONSORED_NUMBER"]').attr('sponsored_number'),
					"health_facilities_id": self.$el.find('.dropdown-'+ccName +" input").attr('item-id'),
					"price": $(item).find('[col-type="PRICE"]').attr('price'),
					"file": $(item).find('[col-type="DOWNLOAD"]').attr('href')
				}
				arr.push(obj)
			})
			if (arr.length > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/create_report_supply_organization_detail",
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
				var ccName = $(item).attr('selected-item-id')
				var obj = {
					"id": $(item).attr('selected-item-id'),
					"supply_ability": $(item).find('[col-type="SUPPLY_ABILITY"]').attr('supply_ability'),
					"sell_number": $(item).find('[col-type="SELL_NUMBER"]').attr('sell_number'),
					"sponsored_number": $(item).find('[col-type="SPONSORED_NUMBER"]').attr('sponsored_number'),
					"price": $(item).find('[col-type="PRICE"]').attr('price'),
					"health_facilities_id": self.$el.find('.dropdown-'+ccName +" input").attr('item-id'),
					"file": $(item).find('[col-type="DOWNLOAD"]').attr('href'),
					"date": self.model.get('date')
				}
				arr.push(obj)
			})
			if (arr.length > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/update_report_supply_organization_detail",
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
					url: self.getApp().serviceURL + "/api/v1/delete_report_supply_organization_detail",
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

		searchItem: function (id) {
			var self = this;
			var listDropDown= [
				{
					"class_name":"dropdown-"+id,
					"url":self.getApp().serviceURL + "/api/v1/load_organization_dropdown_all",
					"type":"single"
				},
				
			]
			listDropDown.forEach(function(item,index){
				self.$el.find('.'+item.class_name+' input').keyup(function name() {
					self.loadItemDropDown($(this).val(),$(this).attr('class-name'),item.url,item.type)
				})
				self.$el.find('.'+item.class_name+' input').unbind('click').bind('click', function () {
					$(this).select();
					self.loadItemDropDown($(this).val(),$(this).attr('class-name'),item.url,item.type)
				})
			})
			

		},
		loadItemDropDown: function (TEXT,CLASS,URL,TYPE) { // Đổ danh sách Item vào ô tìm kiếm
			var self = this;
			$.ajax({
				type: "POST",
				url: URL,
				data: JSON.stringify(TEXT),
				success: function (response) {
					self.$el.find('.'+CLASS+' div .dropdown-menu .dropdown-item').remove();
					var count = response.length
					response.forEach(function (item, index) {
						var itemSTRING = JSON.stringify(item)
						self.$el.find('.'+CLASS+' div .dropdown-menu').append(`
						<button item-info = '${itemSTRING}' out-side-${CLASS} class='dropdown-item' style='text-overflow: ellipsis;overflow: hidden;white-space: nowrap;font-size:13px'>${item.name}</button>`)
					})
					if (count == 0) {
						self.$el.find('.'+CLASS+' div .dropdown-menu').hide()
					}
					if (count == 1) {
						self.$el.find('.'+CLASS+' div .dropdown-menu').css("height", "45px")
						self.$el.find('.'+CLASS+' div .dropdown-menu').show()
					}
					if (count == 2) {
						self.$el.find('.'+CLASS+' div .dropdown-menu').css("height", "80px")
						self.$el.find('.'+CLASS+' div .dropdown-menu').show()
					}
					if (count == 3) {
						self.$el.find('.'+CLASS+' div .dropdown-menu').css("height", "110px")
						self.$el.find('.'+CLASS+' div .dropdown-menu').show()
					}
					if (count == 4) {
						self.$el.find('.'+CLASS+' div .dropdown-menu').css("height", "130px")
						self.$el.find('.'+CLASS+' div .dropdown-menu').show()
					}
					if (count > 4) {
						self.$el.find('.'+CLASS+' div .dropdown-menu').css("height", "160px")
						self.$el.find('.'+CLASS+' div .dropdown-menu').show()
					}
					if (TYPE == "single"){
						self.chooseItemInListDropdown(CLASS);
					}
					else if(TYPE == "multiple") {
						self.appendItemInListDropdown(CLASS);
					}
				}
			});
		},
		chooseItemInListDropdown: function (CLASS) { //Chọn lẻ 1 item 
			var self = this;
			self.$el.find('.'+CLASS+' div .dropdown-menu .dropdown-item').unbind('click').bind('click', function () {
				var dropdownItemClick = $(this);
				var itemJSON = JSON.parse(dropdownItemClick.attr('item-info'))
				self.$el.find('.'+CLASS+' input').val(itemJSON.name);
				self.$el.find('.'+CLASS+' input').attr('item-id',itemJSON.id);
				self.medicalSuppliesId = itemJSON.id
				self.$el.find('.'+CLASS+' div .dropdown-menu').hide();
			})
			$(document).unbind('click').bind('click', function (e) {
				if ($(e.target).attr('out-side-'+CLASS) == undefined){
					self.$el.find('.'+CLASS+' div .dropdown-menu').hide();
				}
			})
			
		},
	});

});