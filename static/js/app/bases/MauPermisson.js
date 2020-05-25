define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        Caocao    	= require('caocao');

    var Permissions = {
    	categories:[
    	    {
    	    	name:"cat1",
    	    	description: "",
    	    	icon:"images/cat1.png",
    	    	display:true,
    	    	permission: {
    	    		read:true,
    	    	}
    	    }
    	],
    	entities: [
    	    {
    	    	category:null,
    	    	"$ref": "app/entity/Store",
    	    	display_name: "Cửa hàng",
    	    	permission: {
    	    		read: true,
    	    		create: true,
    	    		edit: true,
    	    		delete: true,
    	    	},
    	    	//permissons in fields
    	    },
    	    {
    	    	category:"cat1",
    	    	"$ref": "app/entity/Device",
    	    	display_name: "Thiết bị",
    	    	permission: {
    	    		read: true,
    	    		create: true,
    	    		edit: true,
    	    		delete: true,
    	    	},
    	    	//permissons in fields
    	    },
    	],
    };
    return Permissions;   

});