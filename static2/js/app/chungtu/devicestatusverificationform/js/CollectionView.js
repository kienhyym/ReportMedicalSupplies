define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        // Gonrin = require('../../certificateform/js/node_modules/gonrin');
        Gonrin = require('gonrin');

    var template = require('text!app/chungtu/devicestatusverificationform/tpl/collection.html'),
        schema = require('json!schema/DeviceStatusVerificationFormSchema.json');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "devicestatusverificationform",
        loaiDanhSachHomNay: null,
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
                        label: "TRANSLATE:Quay lại",
                        command: function () {
                            var self = this;
                            Backbone.history.history.back();
                        }
                    },
                ],
            }],
        initialize: function () {
            this.loaiDanhSachHomNay = localStorage.getItem("LoaiDanhSachHomNay");
            localStorage.clear();
        },
        render: function () {
            var self = this;
            self.$el.find('#ngaykiemtra').datetimepicker({
                textFormat: 'DD-MM-YYYY',
                extraFormats: ['DDMMYYYY'],
                parseInputDate: function (val) {
                    return moment.unix(val)
                },
                parseOutputDate: function (date) {
                    return date.unix()
                }
            });

            this.applyBindings();
            self.locData();

            return this;
        },
        locData: function () {
            var self = this;
            var IDTB = sessionStorage.getItem('IDThietBi');
            sessionStorage.clear();
            if (IDTB !== null) {
                var filters = {
                    filters: {
                        "$and": [
                            { "equipmentdetails_id": { "$eq": IDTB } }
                        ]
                    },
                    order_by: [{ "field": "created_at", "direction": "desc" }]
                }
                $.ajax({
                    url: self.getApp().serviceURL + "/api/v1/devicestatusverificationform?results_per_page=100000&max_results_per_page=1000000",
                    method: "GET",
                    data: "q=" + JSON.stringify(filters),
                    contentType: "application/json",
                    success: function (data) {
                        var i = 1;
                        var arr = [];
                        data.objects.forEach(function (item, index) {
                            item.stt = i;
                            i++;
                            arr.push(item)
                        })
                        self.render_grid(arr);


                        self.$el.find("#name").keyup(function () {
                            arr = [];
                            var i = 1;
                            data.objects.forEach(function (item, index) {
                                if ((item.name).indexOf(self.$el.find("#name").val()) !== -1) {
                                    item.stt = i;
                                    i++;
                                    arr.push(item)

                                }
                            });
                            self.render_grid(arr);

                        });
                        self.$el.find('#ngaykiemtra').blur(function () {
                            var x = self.$el.find('#ngaykiemtra').data("gonrin").getValue();

                            if (arr.length != 0) {
                                var arr2 = [];
                                var i = 1;
                                arr.forEach(function (item, index) {
                                    if (moment(item.date * 1000).format("DDMMYYYY") == moment(x * 1000).format("DDMMYYYY")) {
                                        item.stt = i;
                                        i++;
                                        arr2.push(item)
                                    }
                                });
                                self.render_grid(arr2);

                            }
                            else {
                                arr2 = []
                                var i = 1;
                                data.objects.forEach(function (item, index) {
                                    if (moment(item.date * 1000).format("DDMMYYYY") == moment(x * 1000).format("DDMMYYYY")) {
                                        item.stt = i;
                                        i++;
                                        arr2.push(item)
                                    }
                                });
                                self.render_grid(arr2);
                                self.$el.find("#name").keyup(function () {
                                    var arr3 = [];
                                    var i = 1;
                                    arr2.forEach(function (item, index) {
                                        if ((item.name).indexOf(self.$el.find("#name").val()) !== -1) {
                                            item.stt = i;
                                            i++;
                                            arr3.push(item)
                                        }
                                    });
                                    self.render_grid(arr3);

                                });
                            }

                        })

                    },


                })
            }
            if (self.loaiDanhSachHomNay != null) {
                self.appListToday();
            }
            else {
                $.ajax({
                    url: self.getApp().serviceURL + "/api/v1/devicestatusverificationform?results_per_page=100000&max_results_per_page=1000000",
                    method: "GET",
                    data: { "q": JSON.stringify({ "order_by": [{ "field": "created_at", "direction": "desc" }] }) },
                    contentType: "application/json",
                    success: function (data) {
                        var i = 1;
                        var arr = [];
                        data.objects.forEach(function (item, index) {
                            item.stt = i;
                            i++;
                            arr.push(item)
                        })
                        self.render_grid(arr);
                        self.$el.find("#name").keyup(function () {
                            arr = [];
                            var i = 1;
                            data.objects.forEach(function (item, index) {
                                if ((item.name).indexOf(self.$el.find("#name").val()) !== -1) {
                                    item.stt = i;
                                    i++;
                                    arr.push(item)

                                }
                            });
                            self.render_grid(arr);

                        });
                        self.$el.find('#ngaykiemtra').blur(function () {
                            var x = self.$el.find('#ngaykiemtra').data("gonrin").getValue();

                            if (arr.length != 0) {
                                var arr2 = [];
                                var i = 1;
                                arr.forEach(function (item, index) {
                                    if (moment(item.date * 1000).format("DDMMYYYY") == moment(x * 1000).format("DDMMYYYY")) {
                                        item.stt = i;
                                        i++;
                                        arr2.push(item)
                                    }
                                });
                                self.render_grid(arr2);

                            }
                            else {
                                arr2 = []
                                var i = 1;
                                data.objects.forEach(function (item, index) {
                                    if (moment(item.date * 1000).format("DDMMYYYY") == moment(x * 1000).format("DDMMYYYY")) {
                                        item.stt = i;
                                        i++;
                                        arr2.push(item)
                                    }
                                });
                                self.render_grid(arr2);
                                self.$el.find("#name").keyup(function () {
                                    var arr3 = [];
                                    var i = 1;
                                    arr2.forEach(function (item, index) {
                                        if ((item.name).indexOf(self.$el.find("#name").val()) !== -1) {
                                            item.stt = i;
                                            i++;
                                            arr3.push(item)
                                        }
                                    });
                                    self.render_grid(arr3);

                                });
                            }

                        })
                    }
                })
            }
        },
        render_grid: function (dataSource) {
            sessionStorage.clear();

            var self = this;
            var element = self.$el.find("#grid-data");
            element.grid({
                // showSortingIndicator: true,
                orderByMode: "client",
                language: {
                    no_records_found: "Chưa có dữ liệu"
                },
                noResultsClass: "alert alert-default no-records-found",
                fields: [
                    {
                        label: "STT",
                        width: "30px",
                        template: function (rowData) {
                            if (!!rowData) {
                                return `
                                            <div>${rowData.stt}</div>
                                        `;
                            }
                            return "";
                        }
                    },
                    {
                        label: "Phiếu",
                        template: function (rowData) {
                            console.log(rowData)
                            if (!!rowData && rowData.date) {
                                var utcTolocal = function (times, format) {
                                    return moment(times * 1000).local().format(format);
                                }
                                return `    <div style="position: relative;">
                                                <div>${rowData.name} (Serial:${rowData.model_serial_number})</div>
                                                <div>Ngày kiểm tra:${utcTolocal(rowData.date, "DD/MM/YYYY")}</div>
                                                <i style="position: absolute;bottom:0;right:0" class='fa fa-angle-double-right'></i>
                                            </div>
                                            `;
                            }
                            return "";
                        }
                    },
                ],
                dataSource: dataSource,
                primaryField: "id",
                refresh: true,
                selectionMode: false,
                pagination: {
                    page: 1,
                    pageSize: 100
                },
                events: {
                    "rowclick": function (e) {
                        self.getApp().getRouter().navigate("devicestatusverificationform/model?id=" + e.rowId);
                    },
                },
            });
            $(self.$el.find('.grid-data tr')).each(function (index, item) {
                $(item).find('td:first').css('height', $(item).height())

                console.log($(item).find('td:first').addClass('d-flex align-items-center justify-content-center'))

            })
        },
        appListToday: function () {
            var self = this;
            var thoiGianBatDau = moment().format('MMMM Do YYYY') + ' 00:00:01';
            var thoiGianKetThuc = String(moment().format('MMMM Do YYYY')) + ' 23:59:59';
            $.ajax({
                url: self.getApp().serviceURL + "/api/v1/list_today",
                method: "POST",
                data: JSON.stringify(
                    {
                        "thoiGianBatDau": Date.parse(thoiGianBatDau) / 1000,
                        "thoiGianKetThuc": Date.parse(thoiGianKetThuc) / 1000,
                        "tableName": self.loaiDanhSachHomNay
                    }
                ),
                contentType: "application/json",
                success: function (data) {
                    var list = [];
                    data.forEach(function (item, index) {
                        item.stt = index + 1;
                        list.push(item)
                        self.render_grid(list);
                    });
                }
            })
        }
    });

});