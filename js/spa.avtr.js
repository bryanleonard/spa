spa.avtr = (function() {

	'use strict';

	var configMap = {
			chat_model   : null,
			people_model : null,

			settable_map : {
				chat_model : true,
				people_model : true
			}
		},
		stateMap = {
			drag_map : null,
			$drag_target : null,
			drag_cbg_color: undefined
		},
		jqueryMap = {},

		getRandRgb,
		setJqueryMap,
		updateAvatar,
		onTapNav,      onHeldstartNav,
		onHeldmoveNav, onHeldendNav,
		onSetchatee,   onListchange,
		onLogout,
		configModule, initModule;

	// Begin utility methods
	// --------------------------------------
	getRandRgb = function() {
		var i, rgb_list = [];

		for (i=0; i < 3; i++) {
			rgb_list.push(Math.floor(Math.random() * 128) + 128);
		}
		return 'rgb(' + rgb_list.join(',') + ')';
	};

	// Begin DOM methods
	// --------------------------------------
	setJqueryMap = function( $container) {
		jqueryMap = { $container : $container };
	}

	updateAvatar = function( $targ ) {
		var css_map, person_id;

		css_map = {
			top: parseInt($targ.css('top'), 10),
			left: parseInt($targ.css('left'), 10),
			'background-color' : $targ.css('background-color')
		};

		person_id = $targ.attr('data-id');
	}

	// Begin Event Handlers
	// --------------------------------------
	onTapNav = function(evt) {
		var css_map,
			$targ = $(evt.elem_target).closest('.spa-avtr-box');

			if ($targ.length === 0) {
				return false;
			}

			$targ.css({ 'background-color' : getRandRgb() });
			updateAvatar($targ);
	};

	onHeldstartNav = function(evt) {
		var offset_target_map, offset_nav_map,
			$targ = $(evt.elem_target).closest('.spa-avtr-box');

		if ($targ.length ===0) {
			return false;
		}

		stateMap.$drag_target = $targ;
		offset_target_map = $targ.offset();
		offset_nav_map = jqueryMap.$container.offset();

		offset_target_map.top -= offset_nav_map.top;
		offset_target_map.left -= offset_nav_map.left;

		stateMap.drag_map = offset_target_map;
		stateMap.drag_bg_color = $target.css('background-color');

		$targ
			.addClass('spa-x-is-drag')
			.css('background-color', '');
	};

	onHeldmoveNav = function(evt) {
		//pg 217
	};

	return {};
}());