define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    return [
        {
            "text": "Danh mục",
            "icon": "fa fa-list-ul",
            "type": "category",
            "visible": function() {
                return this.checkVaitro([1, 2]);

            },
            "entries": [{
                    "text": "<label class='m-0 ml-4'>Trang thiết bị</label>",
                    "type": "view",
                    "collectionName": "medicalequipment",
                    "route": "medicalequipment/collection",
                    "visible": function() {
                        return true
                    }
                },

            ]
        },

        {
            "text": "Báo cáo thống kê",
            "icon": "fa fa-file-text-o",
            "type": "category",
            "entries": [

            ]
        },
    ];

});