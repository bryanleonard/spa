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
			drag_bg_color: undefined
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
	};

	updateAvatar = function( $targ ) {
		var css_map, person_id;

		css_map = {
			top: parseInt($targ.css('top'), 10),
			left: parseInt($targ.css('left'), 10),
			'background-color' : $targ.css('background-color')
		};

		person_id = $targ.attr('data-id');
		configMap.chat_model.update_avatar({
			person_id : person_id, css_map : css_map
		});
	};

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
		stateMap.drag_bg_color = $targ.css('background-color');

		$targ
			.addClass('spa-x-is-drag')
			.css('background-color', '');
	};

	onHeldmoveNav = function(evt) {
		var drag_map = stateMap.drag_map;
		
		if ( ! drag_map ){ return false; }

		drag_map.top  += evt.px_delta_y;
		drag_map.left += evt.px_delta_x;

		stateMap.$drag_target.css({
			top : drag_map.top, left : drag_map.left
		});
	};

	onHeldendNav = function ( event ) {
		var $drag_target = stateMap.$drag_target;

		if ( !$drag_target ) {
			return false;
		}

		$drag_target
			.removeClass('spa-x-is-drag')
			.css('background-color', stateMap.drag_bg_color);

		stateMap.drag_bg_color = undefined;
		stateMap.$drag_target  = null;
		stateMap.drag_map      = null;
		updateAvatar( $drag_target );
	};

	onSetchatee = function( evt, arg_map ) {
		var $nav = $(this),
			new_chatee = arg_map.new_chatee,
			old_chatee = arg_map.old_chatee;

		// Use this to highlight avatar of user in nav area
		// See new_chatee.name, old_chatee.name, etc.
		// remove highlight from old_chatee avatar here
		if ( old_chatee ) {
			$nav
				.find('.spa-avtr-box[data-id=' + old_chatee.cid + ']')
				.removeClass( 'spa-x-is-chatee' );
		}

		// Add highlight to new_chatee avatar here
		if (new_chatee) {
			$nav.find( '.spa-avtr-box[data-id=' + new_chatee.cid + ']' )
				.addClass('spa-x-is-chatee');
		}
	};

	// Invoked when the Model publishes a spa-listchange event. 
	// In this module, we redraw the avatars.
	onListchange = function( evt ) {
		var $nav      = $(this),
			people_db = configMap.people_model.get_db(),
			user      = configMap.people_model.get_user(),
			chatee    = configMap.chat_model.get_chatee() || {},
			$box;

		$nav.empty();

		// if user is logged out, do not render
		if (user.get_is_anon()) {
			return false;
		}

		people_db().each( function( person, index) {
			var class_list;

			if (person.get_is_anon()) {
				return true;
			}

			class_list = ['spa-avtr-box'];

			if ( person.id === chatee.id ){
				class_list.push('spa-x-is-chatee');
			}

			if ( person.get_is_user() ) {
				class_list.push( 'spa-x-is-user' );
			}

			$box = $('<div/>')
				.addClass(class_list.join(' '))
				.css(person.css_map)
				.attr('data-id', String(person.id))
				.prop('title', spa.util_b.encodeHtml(person.name))
				.text(person.name)
				.appendTo($nav);
		});
	};

	onLogout = function() {
		jqueryMap.$container.empty();
	};


	// Begin Public Methods
	// --------------------------------------
	//Configure the module prior to initialization,
	// values we do not expect to change during a user session.
	configModule = function( input_map) {
		spa.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});

		return true;
	};

	initModule = function( $container ) {
		setJqueryMap($container);

		// Bind model global events
		$.gevent.subscribe( $container, 'spa-setchatee', onSetchatee );
		$.gevent.subscribe( $container, 'spa-listchange', onListchange );
		$.gevent.subscribe( $container, 'spa-logout', onLogout );

		// Bind actions, yo
		// Binding before the Model events could result in a race condition.
		$container
			.bind( 'utap', onTapNav )
			.bind( 'uheldstart', onHeldstartNav )
			.bind( 'uheldmove', onHeldmoveNav )
			.bind( 'uheldend', onHeldendNav );

		return true;
	};

	return {
		configModule: configModule,
		initModule: initModule
	};

}());