define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/danhmuc/medicalequipment/tpl/model.html'),
        schema = require('json!schema/MedicalEquipmentSchema.json');
    // var QuyTrinhKiemTraView = require('app/danhmuc/medicalequipment/js/EquipmentInspectionProceduresView');


    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "medicalequipment",
        bindings: "data-bind",
        state: null,
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-default btn-sm btn-secondary",
                    label: "TRANSLATE:Quay lại",
                    command: function() {
                        var self = this;
                        Backbone.history.history.back();
                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success btn-sm",
                    label: "TRANSLATE:Lưu",
                    command: function() {
                        var self = this;

                        self.model.save(null, {
                            success: function(model, respose, options) {

                                self.getApp().notify("Lưu thông tin thành công");
                                self.getApp().getRouter().navigate(self.collectionName + "/collection");
                            },
                            error: function(xhr, status, error) {
                                try {
                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                        self.getApp().getRouter().navigate("login");
                                    } else {
                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                    }
                                } catch (err) {
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
                    label: "TRANSLATE:Xóa",
                    visible: function() {
                        return this.getApp().getRouter().getParam("id") !== null;
                    },
                    command: function() {
                        var self = this;
                        self.model.destroy({
                            success: function(model, response) {
                                self.getApp().notify('Xoá dữ liệu thành công');
                                self.getApp().getRouter().navigate(self.collectionName + "/collection");
                            },
                            error: function(xhr, status, error) {
                                try {
                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                        self.getApp().getRouter().navigate("login");
                                    } else {
                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                    }
                                } catch (err) {
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
                    field: "classify",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: [
                        { "value": "A", "text": "TTBYT Loại A" },
                        { "value": "B", "text": "TTBYT Loại B " },
                        { "value": "C", "text": "TTBYT Loại C " },
                        { "value": "D", "text": "TTBYT Loại D " },
                    ],
                },
                {
                    field: "restricted_list",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: [
                        { "value": "kimloainang", "text": "Thải kim loại nặng" },
                        { "value": "hoachatkhongthanthien", "text": "Hóa chất không thân thiện" },
                        { "value": "no", "text": "Không" },
                    ],
                },
                {
                    field: "types_of_equipment",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: [
                        { "value": "1", "text": "Máy xét nhiệm" },
                        { "value": "2", "text": "Máy chuẩn đoán hình ảnh " },
                        { "value": "3", "text": "Máy thăm dò chức năng" },
                        { "value": "4", "text": "Thiết bị hấp sấy " },
                        { "value": "5", "text": "Thiết bị hỗ trợ sinh tồn " },
                        { "value": "6", "text": "Robot" },
                        { "value": "7", "text": "Thiết bi miễn dịch" },
                        { "value": "8", "text": "Thiết bị lọc và hỗ trợ chức năng " },
                    ],
                },
                {
                    field: "status",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: [
                        { "value": "Đang lưu hành", "text": "Đang lưu hành" },
                        { "value": "Ngừng lưu hành", "text": "Ngừng lưu hành" },
                        { "value": "Cấm lưu hành", "text": "Cấm lưu hành" },
                    ],
                },


            ]
        },

        render: function() {
            var self = this;
            var id = this.getApp().getRouter().getParam("id");
            // self.dungCuChuanBi();
            // self.bindEventSelect();
            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        // var danhsachsanpham = self.model.get('list_of_equipment_details');
                        // danhsachsanpham.sort(function(a, b) {
                        //     var thoigiantaoA = a.created_at
                        //     var thoigiantaoB = b.created_at
                        //     if (thoigiantaoA < thoigiantaoB) {
                        //         return 1;
                        //     }
                        //     if (thoigiantaoA > thoigiantaoB) {
                        //         return -1;
                        //     }
                        //     return 0;
                        // });
                        // danhsachsanpham.forEach(function(item, index) {
                        //     self.$el.find("#danhsachthietbi").append("<tr><td class='p-2'>" + item.model_serial_number + "</td><td class='p-2'>" + item.management_code + "</td><td class='p-2'>" + item.status + "</td><td class='p-1'><a class='btn btn-info btn-sm btn-chitiet p-1' href=" + self.getApp().serviceURL + "/?#equipmentdetails/model?id=" + item.id + ">Xem chi tiết</a></td></tr>")
                        // })
                        self.applyBindings();
                        // self.$el.find(".btn-them").unbind("click").bind("click", function() {
                        //     location.href = self.getApp().serviceURL + "/?#equipmentdetails/model";
                        //     sessionStorage.setItem('TenSanPham', self.$el.find("#tensp").val());
                        //     sessionStorage.setItem('IDSanPham', self.model.get("id"));
                        //     sessionStorage.setItem('ChungLoai', self.model.get("types_of_equipment"));
                        // })
                        // var equipmentinspectionprocedures = self.model.get("List_of_equipment_inspection_procedures");
                        // equipmentinspectionprocedures.sort(function(a, b) {
                        //     if (a.step < b.step) { return -1; }
                        //     if (a.step > b.step) { return 1; }
                        //     return 0;
                        // });
                        // if (equipmentinspectionprocedures === null) {
                        //     self.model.set("List_of_equipment_inspection_procedures", []);
                        // }
                        // $.each(equipmentinspectionprocedures, function(idx, value) {
                        //     self.registerEvent(value);
                        // });
                        // self.cacBuoc();
                        // self.picture();
                        // self.chieucaonoidung();
                        // self.chieurongnoidung();
                        // self.dungCuChuanBi();
                        // self.hienThiDungCuChuanBi();
                    },
                    error: function() {
                        self.getApp().notify("Get data Eror");
                    },
                    // complete: function() {
                    //     self.$el.find("#btn_add").unbind("click").bind("click", () => {
                    //         if (self.$el.find("#noidung").val() !== "") {
                    //             var data_default = {
                    //                 "id": gonrin.uuid(),
                    //                 "step": self.model.get("List_of_equipment_inspection_procedures").length + 1,
                    //                 "picture": null,
                    //                 "content": self.$el.find('#noidung').val(),
                    //             }
                    //             var equipmentinspectionprocedures = self.model.get("List_of_equipment_inspection_procedures");
                    //             if (equipmentinspectionprocedures === null) {
                    //                 equipmentinspectionprocedures = [];
                    //             }
                    //             equipmentinspectionprocedures.push(data_default);
                    //             self.model.set("List_of_equipment_inspection_procedures", equipmentinspectionprocedures)
                    //             self.applyBindings("List_of_equipment_inspection_procedures");

                    //             self.registerEvent(data_default);
                    //             self.$el.find('#equipmentinspectionprocedures div .row .stt').each(function(index, item) {
                    //                 $(item).html('Bước ' + (index + 1))
                    //             })
                    //             $(self.$el.find('.content')[equipmentinspectionprocedures.length - 1]).addClass('col-md-12')
                    //             $(self.$el.find('.picture')[equipmentinspectionprocedures.length - 1]).css("display", "none");

                    //             self.model.save(null, {
                    //                 success: function(model, respose, options) {
                    //                     self.$el.find("#noidung").val("")
                    //                     self.getApp().notify("Lưu thông tin thành công");
                    //                 },
                    //                 error: function(xhr, status, error) {
                    //                     try {
                    //                         if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                    //                             self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                    //                             self.getApp().getRouter().navigate("login");
                    //                         } else {
                    //                             self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                    //                         }
                    //                     } catch (err) {
                    //                         self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                    //                     }
                    //                 }
                    //             });
                    //         }

                    //     });
                    // }
                });
            } else {
                self.applyBindings();
            }
        },
        dungCuChuanBi: function() {
            var self = this;
            self.$el.find('.themDungCu').unbind('click').bind('click', function() {
                self.$el.find('.danhSachDungCu').find('.loadLaiDanhSach').remove();
                self.$el.find('.danhSachDungCuDaChon').find('.item_dungcudachon').remove();

                self.$el.find('.timKiemDungCu').show();
                self.$el.find('.card-body').css('opacity', '0.1');
                $.ajax({
                    url: self.getApp().serviceURL + "/api/v1/preparationtools?results_per_page=100000&max_results_per_page=1000000",
                    method: "GET",
                    contentType: "application/json",
                    success: function(data) {
                        if (data.objects.length != 0) {

                            data.objects.forEach(function(item, index) {
                                self.$el.find('.danhSachDungCu').append(`
								<div class="col-4 col-md-2 p-1 loadLaiDanhSach" dungCu_id="${item.id}" >
									<div class="text-center">
										<div style="margin-left: auto; margin-right: auto; left: 0px; right: 0px;width: 90px;position: relative;">
											<input class="checkbox_dungcu" vitri=${index} item_id="${item.id}" type="checkbox"
												style="position: absolute; top: 0px; left: 0px;width:90px;height: 90px;opacity:0">
											<img src="${item.picture}" alt="Trulli" style="width:90px;height: 90px;">
											<label class="chonDungCuNay" id_show_congcu="${item.id}"
												style="position: absolute;top:70px;right:3px;display:none"><i
													class="fa fa-check-square-o text-success" aria-hidden="true"></i></label>
											<label class="khongChonDungCuNay" id_hide_congcu="${item.id}"
												style="position: absolute;top:70px;right:3px"><i class="fa fa-square-o"
													aria-hidden="true"></i></label>
											<label style="font-size: 10px;width:100px;">${item.name}</label>
										</div>
									</div>
								</div>
									`)
                            })

                        }
                        self.$el.find('.timKiemDungCuChuanBi').keyup(function(e) {
                            self.$el.find('.loadLaiDanhSach').show();
                            var seach = $(this).val();
                            var promise = new Promise(function(resolve, reject) {
                                var arr = []
                                data.objects.forEach(function(item) {
                                    var code = String(item.code);
                                    var name = String(item.name);
                                    if (name.indexOf(seach) == -1) {
                                        if (code.indexOf(seach) == -1) {
                                            arr.push(item.id)
                                        }
                                    }
                                })
                                resolve(arr);
                            });
                            promise.then(
                                function(arr) {
                                    arr.forEach(function(item) {
                                        self.$el.find('[dungCu_id=' + item + ']').hide()
                                    })
                                }
                            );
                        });
                        self.hienThiDungCuChuanBiChonLai();

                        var mangDungCuDaChon = [];
                        if (self.model.get('preparationtools').length != 0) {
                            mangDungCuDaChon = self.model.get('preparationtools');
                        }
                        self.$el.find('.checkbox_dungcu').change(function(event) {
                            self.$el.find('.danhSachDungCuDaChon').find('.item_dungcudachon').remove();
                            if (event.target.checked) {
                                $(this).find('~.chonDungCuNay').show();
                                $(this).find('~.khongChonDungCuNay').hide();
                                mangDungCuDaChon.push(data.objects[$(this).attr('vitri')]);
                                if (mangDungCuDaChon.length != 0) {
                                    mangDungCuDaChon.forEach(function(item_dungcudachon) {
                                        self.$el.find('.danhSachDungCuDaChon').append(`
										<div class="item_dungcudachon" xoa_id ="${item_dungcudachon.id}">
											<button class="btn btn-outline-secondary p-1 m-1" style="font-size: 9px;" >${item_dungcudachon.name}
												<i class="fa fa-times text-danger" aria-hidden="true"></i>
											</button>
										</div>
										`)
                                    })
                                }

                                self.$el.find('.item_dungcudachon').unbind('click').bind('click', function() {
                                    var idDungCu = $(this).attr('xoa_id');
                                    $(this).remove()
                                    self.$el.find('[item_id=' + idDungCu + ']').prop("checked", false);
                                    self.$el.find('[id_show_congcu=' + idDungCu + ']').hide()
                                    self.$el.find('[id_hide_congcu=' + idDungCu + ']').show();
                                    mangDungCuDaChon = lodash.remove(mangDungCuDaChon, function(n) {
                                        return n.id == idDungCu;
                                    });

                                })

                            } else {
                                $(this).find('~.chonDungCuNay').hide()
                                $(this).find('~.khongChonDungCuNay').show()
                                var idDungCu = $(this).attr('item_id');
                                mangDungCuDaChon = lodash.remove(mangDungCuDaChon, function(n) {
                                    return n.id != idDungCu;
                                });
                                if (mangDungCuDaChon.length != 0) {
                                    mangDungCuDaChon.forEach(function(item_dungcudachon) {
                                        self.$el.find('.danhSachDungCuDaChon').append(`
										<div class="item_dungcudachon" xoa_id ="${item_dungcudachon.id}">
											<button class="btn btn-outline-secondary p-1 m-1" style="font-size: 9px;" >${item_dungcudachon.name}
												<i class="fa fa-times text-danger" aria-hidden="true"></i>
											</button>
										</div>
										`)
                                    })
                                }
                                self.$el.find('.item_dungcudachon').unbind('click').bind('click', function() {
                                    var idDungCu = $(this).attr('xoa_id');
                                    $(this).remove()
                                    self.$el.find('[item_id=' + idDungCu + ']').prop("checked", false);
                                    self.$el.find('[id_show_congcu=' + idDungCu + ']').hide()
                                    self.$el.find('[id_hide_congcu=' + idDungCu + ']').show();
                                    mangDungCuDaChon = lodash.remove(mangDungCuDaChon, function(n) {
                                        return n.id == idDungCu;
                                    });

                                })
                                self.chonDungCuChuanBi(mangDungCuDaChon);


                            }

                        })
                        self.$el.find('.item_dungcudachon').unbind('click').bind('click', function() {
                            var idDungCu = $(this).attr('xoa_id');
                            $(this).remove()
                            self.$el.find('[id_show_congcu=' + idDungCu + ']').hide()
                            self.$el.find('[id_hide_congcu=' + idDungCu + ']').show();
                            mangDungCuDaChon = lodash.remove(mangDungCuDaChon, function(n) {
                                return n.id == idDungCu;
                            });
                        })

                        self.chonDungCuChuanBi(mangDungCuDaChon);
                    }
                })


            })
            self.$el.find('#dongChonDungCu').unbind('click').bind('click', function() {
                self.$el.find('.timKiemDungCu').hide();
                self.$el.find('.card-body').css('opacity', '1');
            })
        },
        chonDungCuChuanBi: function(mangDungCuDaChon) {
            var self = this;
            self.$el.find('#chonDanhDachNay').unbind('click').bind('click', function() {
                self.$el.find('.dungCuChuanBi').find('.dungCu').remove();
                self.model.set('preparationtools', mangDungCuDaChon)
                self.$el.find('.timKiemDungCu').hide();
                self.$el.find('.card-body').css('opacity', '1');
                if (mangDungCuDaChon.length != 0) {
                    mangDungCuDaChon.forEach(function(item) {
                        self.$el.find('.dungCuChuanBi').append(`
						<div class="col-md-2 text-center dungCu">
							<img src="${item.picture}" class="text-center" style="width: 90px; height: 90px;margin-left: auto; margin-right: auto;" >
							<label class=" w-100" style="font-size: 10px;">${item.name}</label>
						</div>
					`)
                    })
                }

            })
        },
        hienThiDungCuChuanBi: function() {
            var self = this;
            if (self.model.get('preparationtools').length != 0) {
                self.model.get('preparationtools').forEach(function(item) {
                    self.$el.find('.dungCuChuanBi').append(`
					<div class="col-md-2 text-center dungCu">
						<img src="${item.picture}" class="text-center" style="width: 90px; height: 90px;margin-left: auto; margin-right: auto;" >
						<label class=" w-100" style="font-size: 10px;">${item.name}</label>
					</div>
				`)
                })

            }
        },
        hienThiDungCuChuanBiChonLai: function() {
            var self = this;
            if (self.model.get('preparationtools').length != 0) {
                self.model.get('preparationtools').forEach(function(item) {
                    self.$el.find('[item_id=' + item.id + ']').prop("checked", true);
                    self.$el.find('[id_show_congcu=' + item.id + ']').show()
                    self.$el.find('[id_hide_congcu=' + item.id + ']').hide();
                    self.$el.find('.danhSachDungCuDaChon').append(`
						<div class="item_dungcudachon" xoa_id ="${item.id}">
							<button class="btn btn-outline-secondary p-1 m-1" style="font-size: 9px;" >${item.name}
								<i class="fa fa-times text-danger" aria-hidden="true"></i>
							</button>
						</div>
						`)
                })
            }
        },

        registerEvent: function(data) {
            const self = this;
            var QuyTrinhKiemTraItem = new QuyTrinhKiemTraView();
            if (!!data) {
                QuyTrinhKiemTraItem.model.set(JSON.parse(JSON.stringify(data)));
            }
            QuyTrinhKiemTraItem.render();
            self.$el.find("#equipmentinspectionprocedures").append(QuyTrinhKiemTraItem.$el);
            QuyTrinhKiemTraItem.on("change", function(event) {
                var equipmentinspectionprocedures = self.model.get("List_of_equipment_inspection_procedures");

                if (equipmentinspectionprocedures === null) {
                    equipmentinspectionprocedures = [];
                    equipmentinspectionprocedures.push(event.data)
                }
                for (var i = 0; i < equipmentinspectionprocedures.length; i++) {
                    if (equipmentinspectionprocedures[i].id == event.oldData.id) {
                        equipmentinspectionprocedures[i] = event.data;
                        break;
                    }
                }
                self.model.set("List_of_equipment_inspection_procedures", equipmentinspectionprocedures);
                self.applyBindings("List_of_equipment_inspection_procedures");
            })

            QuyTrinhKiemTraItem.$el.find("#itemRemove").unbind("click").bind("click", function() {

                var equipmentinspectionprocedures = self.model.get("List_of_equipment_inspection_procedures");
                for (var i = 0; i < equipmentinspectionprocedures.length; i++) {
                    if (equipmentinspectionprocedures[i].id === QuyTrinhKiemTraItem.model.get("id")) {
                        equipmentinspectionprocedures.splice(i, 1);
                    }
                }
                self.model.set("List_of_equipment_inspection_procedures", equipmentinspectionprocedures);
                self.applyBinding("List_of_equipment_inspection_procedures");
                QuyTrinhKiemTraItem.destroy();
                QuyTrinhKiemTraItem.remove();
                self.model.save(null, {
                    success: function(model, respose, options) {

                        self.getApp().notify("Xóa thông tin thành công");
                    },
                    error: function(xhr, status, error) {
                        try {
                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                self.getApp().getRouter().navigate("login");
                            } else {
                                self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                            }
                        } catch (err) {
                            self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                        }
                    }
                });
            });
        },
        cacBuoc: function() {
            var self = this;
            self.$el.find('#equipmentinspectionprocedures div .row .stt').each(function(index, item) {
                $(item).append('Bước ', index + 1)
            })
        },
        chieucaonoidung: function() {
            var self = this;
            self.$el.find(".noidungthuchien").each(function(index, item) {
                var x = $(item)[0].scrollHeight;
                $(item)[0].style.height = x + 'px';
            })
        },
        chieurongnoidung: function() {
            var self = this;
            self.$el.find(".hinhanhthietbi").each(function(index, item) {
                // console.log($(item).attr("src"))
                // if ($(item).attr("src") !== "") {

                // 	self.$el.find(".content").each(function (index, item) {
                // 		$(item).addClass('col-md-8')
                // 	})
                // 	self.$el.find(".picture").each(function (index, item) {
                // 		$(item).addClass('col-md-4')
                // 	})
                // }
                // else {
                // 	$(self.$el.find(".picture")[index]).css("display", "none")
                // }
            })

        },
        picture: function() {
            var self = this;
            var filters = {
                filters: {
                    "$and": [
                        { "medicalequipment_id": { "$eq": self.model.get('id') } }
                    ]
                },
                order_by: [{ "field": "step", "direction": "asc" }]
            }
            $.ajax({
                url: self.getApp().serviceURL + "/api/v1/equipmentinspectionprocedures?results_per_page=100000&max_results_per_page=1000000",
                method: "GET",
                data: { "q": JSON.stringify(filters) },
                contentType: "application/json",
                success: function(data) {
                    data.objects.forEach(function(item, index) {
                        if (item.picture !== null) {
                            $(self.$el.find('.hinhanhthietbi')[index]).attr("src", item.picture)
                            $(self.$el.find(".content")[index]).addClass('col-md-8')
                            $(self.$el.find(".picture")[index]).addClass('col-md-4')
                        } else {
                            $(self.$el.find(".content")[index]).addClass('col-md-12')
                            $(self.$el.find(".picture")[index]).css("display", "none")
                        }
                    })

                }
            })
        },
        bindEventSelect: function() {
            var self = this;

            self.$el.find(".upload_files").on("change", function() {
                var http = new XMLHttpRequest();
                var fd = new FormData();

                var data_attr = $(this).attr("data-attr");
                fd.append('file', this.files[0]);
                http.open('POST', '/api/v1/upload/file');

                http.upload.addEventListener('progress', function(evt) {
                    if (evt.lengthComputable) {
                        var percent = evt.loaded / evt.total;
                        percent = parseInt(percent * 100);

                    }
                }, false);
                http.addEventListener('error', function() {}, false);

                http.onreadystatechange = function() {
                    if (http.status === 200) {
                        if (http.readyState === 4) {
                            var data_file = JSON.parse(http.responseText),
                                link, p, t;
                            self.getApp().notify("Tải file thành công");
                            self.model.set(data_attr, data_file.link);
                            var linkhinhanh = data_file.link;
                            self.$el.find('#hinhanhnho').attr("src", data_file.link)
                            self.$el.find("#btn_add").unbind("click").bind("click", () => {
                                if (self.$el.find("#noidung").val() !== "") {
                                    var data_default = {
                                        "id": gonrin.uuid(),
                                        "step": self.model.get("List_of_equipment_inspection_procedures").length + 1,
                                        "picture": linkhinhanh,
                                        "content": self.$el.find('#noidung').val(),
                                    }

                                    var equipmentinspectionprocedures = self.model.get("List_of_equipment_inspection_procedures");
                                    if (equipmentinspectionprocedures === null) {
                                        equipmentinspectionprocedures = [];
                                    }
                                    equipmentinspectionprocedures.push(data_default);
                                    self.model.set("List_of_equipment_inspection_procedures", equipmentinspectionprocedures)
                                    self.applyBindings("List_of_equipment_inspection_procedures");

                                    self.registerEvent(data_default);
                                    self.$el.find('#equipmentinspectionprocedures div .row .stt').each(function(index, item) {
                                        $(item).html('Bước ' + (index + 1))
                                    })
                                    if (linkhinhanh != null) {
                                        $(self.$el.find('.content')[equipmentinspectionprocedures.length - 1]).addClass('col-md-8')
                                        $(self.$el.find('.picture')[equipmentinspectionprocedures.length - 1]).addClass('col-md-4')
                                        $(self.$el.find('.hinhanhthietbi')[equipmentinspectionprocedures.length - 1]).attr("src", linkhinhanh)
                                        self.model.save(null, {
                                            success: function(model, respose, options) {
                                                self.$el.find('#hinhanhnho').removeAttr("src")
                                                self.$el.find("#noidung").val("")
                                                linkhinhanh = null;
                                                self.getApp().notify("Lưu thông tin thành công");
                                            },
                                            error: function(xhr, status, error) {
                                                try {
                                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                                        self.getApp().getRouter().navigate("login");
                                                    } else {
                                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                                    }
                                                } catch (err) {
                                                    self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                                                }
                                            }
                                        });
                                    } else {
                                        $(self.$el.find('.content')[equipmentinspectionprocedures.length - 1]).addClass('col-md-12')
                                        $(self.$el.find('.picture')[equipmentinspectionprocedures.length - 1]).css("display", "none");
                                        self.model.save(null, {
                                            success: function(model, respose, options) {
                                                self.$el.find('#hinhanhnho').removeAttr("src")
                                                self.$el.find("#noidung").val("")
                                                linkhinhanh = null;
                                                self.getApp().notify("Lưu thông tin thành công");
                                            },
                                            error: function(xhr, status, error) {
                                                try {
                                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                                        self.getApp().getRouter().navigate("login");
                                                    } else {
                                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                                    }
                                                } catch (err) {
                                                    self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    self.getApp().notify({ message: "Bạn đã chưa nhập nội dung cho bước này" }, { type: "danger", delay: 1000 });
                                }
                            });
                        }
                    } else {
                        self.getApp().notify("Không thể tải tệp tin lên máy chủ");
                    }
                };
                http.send(fd);
            });
        },
    });
});