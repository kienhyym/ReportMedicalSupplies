define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/hethong/rank/tpl/collection.html'),
		schema = require('json!schema/VaiTroSchema.json');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "rank",
        uiControl:{
            fields: [

                {
                    field: "code", label: "Mã", width: 250, readonly: true,
                },
                {
                    field: "name", label: "vai trò", width: 250, readonly: true,
                },
                

            ],
            onRowClick: function (event) {
                if (event.rowId) {
                    var path =  this.collectionName + '/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            }
        },
        render: function () {
            
            this.applyBindings();   
            console.log(this);
            return this;
        },
        
    });

});