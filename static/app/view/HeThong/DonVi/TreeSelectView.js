define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!tpl/DonVi/treeselect.html'),
    	schema 				= require('json!app/view/HeThong/DonVi/Schema.json');
    
    return Gonrin.DialogView.extend({
    	uiControl: {selectedItems:[]},
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "donvi",
    	textField: "ten",
    	//render()
    	tools : [
  	    	    {
  	    	    	name: "defaultgr",
  	    	    	type: "group",
  	    	    	groupClass: "toolbar-group",
  	    	    	buttons: [
  						{
  			    	    	name: "select",
  			    	    	type: "button",
  			    	    	buttonClass: "btn-success btn-sm",
  			    	    	label: "TRANSLATE:SELECT",
  			    	    	command: function(){
  			    	    		var self = this;
  			    	    		self.trigger("onSelected");
  			    	    		self.close();
  			    	    	}
  			    	    },
  	    	    	]
  	    	    },
  	    	],
    	dialog: function(){
    		var self = this;
    		this.initToolbar();
    		this.renderTree();
    		//this.applyBindings();
    		self.$dialog = gonrin.dialog.dialog({message:self.$el});
    		return this;
    	},
    	renderTree: function(){
    		var self = this;
			var url = "/donvitree";
			$.ajax({
				url: url,
				dataType: "json",
				contentType: "application/json",
				success: function(data) {
					
					var tree = self.$el.find("#donvi-tree");
					tree.treeview({
						data: [data],
						onNodeSelected: $.proxy(self.onItemSelected, self),
						onNodeUnselected: $.proxy(self.onItemUnSelected, self),
						nodesField: "nodes",
						textField: "ten",
					});
					if(self.uiControl.selectedItems.length > 0){
						var selectId = self.uiControl.selectedItems[0].id;
						var selectedNodes = tree.data('gonrin').findNodes(selectId, 'g', 'id'); 
						if((!!selectedNodes) && (selectedNodes.length > 0)){
							tree.data('gonrin').selectNode(selectedNodes[0]);
						}
					};
					
				},
			});
    	},
    	onItemSelected: function(event, node){
			var self = this;
			var obj = {ten: node.ten, id: node.id};
			self.uiControl.selectedItems = [obj];
		},
		onItemUnSelected: function(event, node){
			var self = this;
			self.uiControl.selectedItems = [];
		},
    });

});