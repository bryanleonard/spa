;(function() {

	var tabPanel = function(li) {
		var selector = $(li).find('a').attr('href');
		return $(selector);
	};

	$.fn.tabs = function() {

		var $li = this.find('li'),
			i, $activeLi;

		for (i=0; i < $li.length; i++) {
			if (i === 0) {
				$activeLi = $( $li[i] );
			} else {
				var $div = tabPanel( $li[i] );
				$div.hide();
			}
		}

		this.find('li').on('click', function(e) {
			e.preventDefault();

			if (tabPanel($activeLi).selector !== tabPanel(this).selector) {
				tabPanel($activeLi).hide();
				tabPanel(this).show();
				$activeLi = this;
			}
		});

	};

})();

// $('#breeds').tabs();