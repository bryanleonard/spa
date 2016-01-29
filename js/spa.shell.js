spa.shell = (function() {

// Begin callback method /setChatAnchor/
// Example : setChatAnchor( 'closed' );
// Purpose : Change the chat component of the anchor
// Arguments:
// * position_type - may be 'closed' or 'opened'
// Action :
// Changes the URI anchor parameter 'chat' to the requested
// value if possible.
// Returns :
// * true - requested anchor part was updated
// * false - requested anchor part was not updated
// Throws : none
//

	// Module scoped vars
	// --------------------------------------
	var configMap = {
			anchor_schema_map: { // Define the map used by uriAnchor for validation
				chat: {
					opened: true,
					closed: true
				}
			},
			main_html: String()
				+ '<section class="spa-shell-head">'
					+ '<div class="spa-shell-head-logo"></div>'
					+ '<div class="spa-shell-head-acct"></div>'
					+ '<div class="spa-shell-head-search"></div>'
				+ '</section>'
				+ '<section class="spa-shell-main">'
					+ '<nav class="spa-shell-main-nav"></nav>'
					+ '<div class="spa-shell-main-content"></div>'
				+ '</section>'
				+ '<footer class="spa-shell-foot"></footer>'
				+ '<div class="spa-shell-modal"></div>',
			chat_extend_time: 250,
			chat_retract_time: 300,
			chat_extend_height: 450,
			chat_retract_height: 25,
			chat_extended_title: "Click to retract",
			chat_retracted_title: "Click to extend"
		},
		stateMap = { 
			// $container: null,
			anchor_map : {} // stores current anchor map vals
			// is_chat_retracted: true
		},
		jqueryMap = {},
		copyAnchorMap,
		setJqueryMap,
		changeAnchorPart,
		onHashchange,
		setChatAnchor,
		initModule;
	

	// Utility methods
	// --------------------------------------
	// Returns copy of stored anchor map; minimizes overhead
	copyAnchorMap = function() {
		return $.extend( true, {}, stateMap.anchor_map );
	}


	// DOM methods
	// --------------------------------------
	// jqueryMap cache reduces DOM transversals and improves performance.
	setJqueryMap = function() {
		var $container = stateMap.$container;
		jqueryMap = { 
			$container: $container
			// $chat: $container.find('.spa-shell-chat')
		};
	};

	// Extends or retracts chat slider
	// toggleChat = function(do_extend, callback) {
	// 	var px_chat_ht = jqueryMap.$chat.height(),
	// 		is_open    = px_chat_ht === configMap.chat_extend_height,
	// 		is_closed  = px_chat_ht === configMap.chat_retract_height,
	// 		is_sliding = !is_open && !is_closed;

	// 	// avoid race condition
	// 	if (is_sliding) { return false; }

	// 	// Begin extending alider
	// 	if (do_extend) {
	// 		jqueryMap.$chat.velocity(
	// 			{ height: configMap.chat_extend_height },
	// 			configMap.chat_extend_time,
	// 			function() {

	// 				// change title and set to chat traction
	// 				jqueryMap.$chat.attr('title', configMap.chat_extended_title);
	// 				stateMap.is_chat_retracted = false;

	// 				if (callback) {
	// 					callback( jqueryMap.$chat );
	// 				}
	// 			}
	// 		);

	// 		return true;
	// 	}

	// 	// Begin retract chat slider
	// 	jqueryMap.$chat.velocity(
	// 		{ height: configMap.chat_retract_height },
	// 		configMap.chat_retract_time,
	// 		function() {

	// 			// change title and set to chat traction
	// 			jqueryMap.$chat.attr('title', configMap.chat_retracted_title);
	// 			stateMap.is_chat_retracted = true;

	// 			if (callback) {
	// 				callback( jqueryMap.$chat );
	// 			}
	// 		}
	// 	);

	// 	return true;
	// };

	// Changes part of the URI anchor component
	changeAnchorPart = function(arg_map) {
		var anchor_map_revise = copyAnchorMap(),
			bool_return = true,
			key_name,
			key_name_dep;

		// Begin marge changes into anchor map 
		KEYVAL:
		for (key_name in arg_map) {
			if ( arg_map.hasOwnProperty(key_name)) {
				
				//skip dependent keys during iteration
				if ( key_name.indexOf('_') === 0 ) { continue KEYVAL };

				//update independent key value
				anchor_map_revise[key_name] = arg_map[key_name];

				//update matching dependent key
				key_name_dep = '_' + key_name;
				if (arg_map[key_name_dep]) {
					anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				}
				else {
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise['_s' + key_name_dep];
				}
			}
		}

		// Begin attempt to update URI, revert if unsuccessful
		try {
			$.uriAnchor.setAnchor( anchor_map_revise );
		}
		catch(error) {
			// replace URL with existing data
			$.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
			bool_return = false;
		}

		return bool_return;
	};


	// Event handlers
	// --------------------------------------
	// Parses URI anchor component. Compares proposed application state with 
	// current and adjusts app only where proposed state differs from existing
	onHashchange = function(event) {
		var _s_chat_previous, 
			_s_chat_proposed,
			s_chat_proposed,
			anchor_map_proposed,
			is_ok = true,
			anchor_map_previous = copyAnchorMap();

		// attempt to parse anchor
		try {
			anchor_map_proposed = $.uriAnchor.makeAnchorMap();
		}
		catch(error) {
			$.uriAnchor.setAnchor( anchor_map_previous, null, true );
			return false;
		}
		stateMap.anchor_map = anchor_map_proposed;

		// convenience vars
		_s_chat_previous = anchor_map_previous._s_chat;
		_s_chat_proposed = anchor_map_proposed._s_chat;

		// Begin adjust chat component if changed
		if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed ) {
			s_chat_proposed = anchor_map_proposed.chat;

			switch( s_chat_proposed ) {
				case 'opened':
					// toggleChat(true);
					is_ok = spa.chat.setSliderPosition( 'opened' );
					break;
				case 'closed':
					// toggleChat(false);
					is_ok = spa.chat.setSliderPosition( 'closed' );
					break;
				default: 
					spa.chat.setSliderPosition( 'closed' );
					delete anchor_map_proposed.chat;
					$.uriAnchor.setAnchor( anchor_map_proposed, null, true );
			}

			if (!is_ok) {
				if (anchor_map_previous) {
					$.uriAnchor.setAnchor(anchor)
				}
			}
			else
//128
			}
		}

		return false;
	};


	onClickChat = function(event) {

		// origin version
		// toggleChat( stateMap.is_chat_retracted);
		// return false; // same as saying event.preventDefault(), event.stopPropagation(), and event.preventImmediatePropagation()

		// v2, updating the URI
		// if (toggleChat(stateMap.is_chat_retracted)) {
		// 	$.uriAnchor.setAnchor({
		// 		chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
		// 	});
		// }
		//
		// return false;

		// v3 - doing it with the uriAnchor integration
		changeAnchorPart({
			chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
		});

		return false;
	};


	// Public methods
	// --------------------------------------
	initModule = function($container) {
		stateMap.$container = $container;
		$container.html ( configMap.main_html );
		setJqueryMap();

		// init chat slider
		stateMap.is_chat_retracted = true;
		jqueryMap.$chat
			.attr('title', configMap.chat_retracted_title)
			.on('click', onClickChat );

		// configure uriAnchor to use our schema
		$.uriAnchor.configModule({
			schema_map : configMap.anchor_schema_map
		});

		// configure and initialize feature modules
		spa.chat.configModule( {} );
		spa.chat.initModule( jqueryMap.$chat );

		// Handle URI anchor change events.
		// This is done *after* all feature modules are configured and init'd, 
		// otherwise they'll not be ready to handle the trigger event, which 
		// is used to ensure the anchor is considered on-load

		$(window)
			.bind('hashchange', onHashchange)
			.trigger('hashchange');

	};

	return { initModule: initModule };
}());