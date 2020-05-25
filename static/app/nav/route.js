define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    return [
        {
            "collectionName": "user",
            "route": "user/collection",
            "$ref": "app/hethong/user/js/CollectionView",
        },
    ];

});