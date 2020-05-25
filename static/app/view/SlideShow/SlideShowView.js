define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    var	schema 				= require('json!app/view/KhamTheoDoiSucKhoeTre/Schema.json');
    var slideIndex = 1;
	return Gonrin.ModelView.extend({
		modelSchema: schema,
		render: function () {
			var self = this;
            var viewData = self.viewData;
            if (viewData) {
				var list_image = viewData.data;
				var el = viewData.el;
                self.render_popup_image(list_image, el)
            }
            self.applyBindings();
        },
		render_popup_image:function(list_image_model = [], $el){
			var self = this;
			var list_image = [];
			var index = 1;
			slideIndex = 1;
			if (list_image_model.length == 0) {
				return;
			}

			$("#myModal .modal-content-timeline").html("");
			list_image_model.forEach(function (item, idx) {
				var item_image = item;
				var src = item_image.link;
				var id = item_image.id;
				list_image.push(src);
				var obj_img = { "index": index, "url": self.check_image(src) };
				$el.find("." + id ).unbind("click").bind("click", { obj: obj_img }, function (e) {
					var item_cncc = e.data.obj;
					var img = document.createElement('img');
					img.src = item_cncc.url;
					img.onload = function (e) {
						self.openModal();
						self.currentSlide(item_cncc.index);
					};
					img.onerror = function (e) {
						// self.$el.find("#change"+tag_id).click();
					};
				});
				index = index + 1;
			});
			for(var i=0;i<list_image.length;i++){
				$("#myModal .modal-content-timeline").append(`<div class="mySlides">
					<div class="numbertext">`+(i+1)+` / `+list_image.length+`</div>
					<img src="`+self.check_image(list_image[i])+`" width="100%" >
				</div>`);
			}
			var prev = $("<a>").addClass("prev-timeline").html("&#10094;");
			var next = $("<a>").addClass("next-timeline").html("&#10095;");

			$("#myModal .modal-content-timeline").append(prev);
			$("#myModal .modal-content-timeline").append(next);
			$("#myModal .modal-content-timeline").append(`<div class="caption-container">
				<p id="caption"></p>
			</div>`);
			
			prev.unbind('click').bind('click',function(){
				self.plusSlides(-1);
			});
			next.unbind('click').bind('click',function(){
				self.plusSlides(1);
			});
			$("#myModal .close-timeline").unbind("click").bind("click",function(e){
				self.closeModal();
			});
			
			self.showSlides(1);
		},
		check_image: function (link) {
			var self = this;
			var url_image = ""

			if (!!link){
				if (link.startsWith("https://somevabe.com/")){
					url_image = link;
				} else {
					url_image = static_url + link;
				}
			}
			return url_image;
		},
		openModal: function () {
			document.getElementById("myModal").style.display = "block";
		},

		closeModal: function () {
			document.getElementById("myModal").style.display = "none";
		},

		plusSlides: function (n) {
			var self = this;
			self.showSlides(slideIndex += n);
		},

		currentSlide: function (n) {
			var self = this;
			self.showSlides(slideIndex = n);
		},

		showSlides: function (n) {
			var i;
			var slides = document.getElementsByClassName("mySlides");
			// var dots = document.getElementsByClassName("demo");
			// var captionText = document.getElementById("caption");
			if (n > slides.length) { slideIndex = 1 }
			if (n < 1) { slideIndex = slides.length }
			for (i = 0; i < slides.length; i++) {
				slides[i].style.display = "none";
			}
			// for (i = 0; i < dots.length; i++) {
			// 	dots[i].className = dots[i].className.replace(" active", "");
			// }
			if (!!slides[slideIndex - 1]) {
				slides[slideIndex - 1].style.display = "block";
			}
			// dots[slideIndex-1].className += " active";
			// captionText.innerHTML = dots[slideIndex-1].alt;
		},
		render_list_file: function () {

		}
    });
});