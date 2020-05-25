define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/lichthanhtra/tpl/model.html');
    return Gonrin.View.extend({
        template: template,
        render: function() {
            var self = this;
            self.renderCalendar();
        },
        renderCalendar: function() {
            var self = this;

            var initialLocaleCode = 'vi';
            $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay,listMonth'
                },
                locale: initialLocaleCode,
                buttonIcons: false, // show the prev/next text
                weekNumbers: true,
                navLinks: true, // can click day/week names to navigate views
                editable: true,
                eventLimit: true, // allow "more" link when too many events

                events: function(starttime, endtime, timezone, callback) {
                    var filters = {
                        filters: {
                            "$and": [
                                { "expiration_date": { "$gte": starttime._i / 1000 } }, { "expiration_date": { "$lte": endtime._i / 1000 } },
                            ]
                        },
                        order_by: [{ "field": "created_at", "direction": "asc" }]
                    }

                    $.ajax({
                        url: self.getApp().serviceURL + "/api/v1/certificateform",
                        method: "GET",
                        data: { "q": JSON.stringify(filters, { "order_by": [{ "field": "name", "direction": "desc" }], "page": 1, "results_per_page": 100 }) },
                        contentType: "application/json",
                        success: function(data) {
                            var events = [];
                            for (var i = 0; i < data.objects.length; i++) {
                                var item = data.objects[i];
                                var start = "";
                                if (item.expiration_date !== null) {
                                    start = item.expiration_date;
                                }
                                var event_item = { "start": start * 1000 + 100000000, "title": item.name + '[' + [item.model_serial_number, ] + ']', "url": "#certificateform/model?id=" + item.id };
                                events.push(event_item);

                            }
                            var filters2 = {
                                filters: {
                                    "$and": [
                                        { "time_of_purchase": { "$gte": starttime._i / 1000 } }, { "time_of_purchase": { "$lte": endtime._i / 1000 } },
                                    ]
                                },
                                order_by: [{ "field": "created_at", "direction": "asc" }]
                            }
                            $.ajax({
                                url: self.getApp().serviceURL + "/api/v1/equipmentdetails",
                                method: "GET",
                                data: { "q": JSON.stringify(filters2, { "order_by": [{ "field": "name", "direction": "desc" }], "page": 1, "results_per_page": 100 }) },
                                contentType: "application/json",
                                success: function(data2) {
                                    for (var i = 0; i < data2.objects.length; i++) {
                                        var item2 = data2.objects[i];
                                        var start2 = "";
                                        if (item2.time_of_purchase !== null) {
                                            start2 = item2.time_of_purchase;
                                        }
                                        var event_item2 = { "start": start2 * 1000 + 100000000, "title": item2.name + '[' + [item2.model_serial_number, ] + ']', "url": "#equipmentdetails/model?id=" + item2.id };
                                        events.push(event_item2);

                                    }
                                    callback(events);

                                },
                                error: function(xhr, status, error) {}
                            });
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
                                self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                }
            });



        }
    });

});