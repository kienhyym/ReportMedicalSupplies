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
            // return self;
        },
    });

});