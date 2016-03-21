spa.shell = (function() {

	'use strict';
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
					+ '<div class="spa-shell-head-logo">'
						+ '<h1>SPA</h1>'
						+ '<p>javascript end to end</p>'
					+ '</div>'
					+ '<div class="spa-shell-head-acct"></div>'
				+ '</section>'
				+ '<section class="spa-shell-main">'
					+ '<nav class="spa-shell-main-nav"></nav>'
					+ '<div class="spa-shell-main-content"></div>'
				+ '</section>'
				+ '<footer class="spa-shell-foot"></footer>'
				+ '<div class="spa-shell-modal"></div>',
			resize_interval: 200
		},
		stateMap = { 
			$container : undefined,
			anchor_map : {}, // stores current anchor map vals
			resize_idto : undefined // state var to retain the resize timeout ID
		},
		jqueryMap = {},
		copyAnchorMap,
		setJqueryMap,
		changeAnchorPart,
		onHashchange,
		onResize,
		onTapAcct,
		onLogin,
		onLogout,
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
			$container : $container,
			$acct      : $container.find('.spa-shell-head-acct'),
			$nav       : $container.find('.spa-shell-main-nav')
		};
	};

	// Changes part of the URI anchor component
	changeAnchorPart = function(arg_map) {
		var anchor_map_revise = copyAnchorMap(),
			bool_return = true,
			key_name,
			key_name_dep;

		// Begin marge changes into anchor map 
		KEYVAL: // js label
		for (key_name in arg_map) {
			if ( arg_map.hasOwnProperty(key_name)) {
				
				//skip dependent keys during iteration
				if ( key_name.indexOf('_') === 0 ) { continue KEYVAL; }

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


	onTapAcct = function(event) {
		var acct_text,
			user_name,
			user = spa.model.people.get_user();

		if (user.get_is_anon())	{
			user_name = prompt('Please sign in');
			spa.model.people.login(user_name);
			jqueryMap.$acct.text('Processing...');
		}
		else {
			spa.model.people.logout();
		}
		return false
	};

	onLogin = function(event, login_user) {
		jqueryMap.$acct.text(login_user.name);
	};

	onLogout = function(event, logout_user) {
		jqueryMap.$acct.text('Please sign in')
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

		// Begin adjusting chat component if changed
		if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed ) {
			s_chat_proposed = anchor_map_proposed.chat;

			switch( s_chat_proposed ) {
				case 'opened':
					is_ok = spa.chat.setSliderPosition( 'opened' );
					break;
				case 'closed':
					is_ok = spa.chat.setSliderPosition( 'closed' );
					break;
				default: 
					spa.chat.setSliderPosition( 'closed' );
					delete anchor_map_proposed.chat;
					$.uriAnchor.setAnchor( anchor_map_proposed, null, true );
			}
		}

		// Revert anchor is slider change is denied
		if (!is_ok) {
			if (anchor_map_previous) {
				$.uriAnchor.setAnchor(anchor_map_previous, null, true);
				stateMap.anchor_map = anchor_map_previous;
			}
			else {
				delete anchor_map_proposed.chat;
				$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
			}
		}

		return false;
	};

	// Resize that shit... if necessary
	onResize = function() {
		if (stateMap.resize_idto ) { return true; }

		spa.chat.handleResize();
		stateMap.resize_idto = setTimeout(
			function() {
				stateMap.resize_idto = undefined
			}, 
			configMap.resize_interval
		);
		return true;
	}



	// Callbacks
	// --------------------------------------
	// Begin callback method /setChatAnchor/
	// Example : setChatAnchor( 'closed' );
	// Purpose : Change the chat component of the anchor
	// Arguments:
	// 		* position_type - may be 'closed' or 'opened'
	// Action :
	//     Changes the URI anchor parameter 'chat' to the requested
	//     value if possible.
	// Returns :
	//	   * true - requested anchor part was updated
	//	   * false - requested anchor part was not updated
	// Throws : none
	//
	setChatAnchor = function(position_type) {
		return changeAnchorPart({ chat: position_type});
	};



	// Public methods
	// --------------------------------------
	initModule = function($container) {
		stateMap.$container = $container;
		$container.html ( configMap.main_html );
		setJqueryMap();

		// configure uriAnchor to use our schema
		$.uriAnchor.configModule({
			schema_map : configMap.anchor_schema_map
		});

		// configure and initialize feature modules
		spa.chat.configModule({
			set_chat_anchor : setChatAnchor,
			chat_model 		: spa.model.chat,
			people_model	: spa.model.people
		});
		spa.chat.initModule( jqueryMap.$container );

		$.gevent.subscribe($container, 'spa-login', onLogin);
		$.gevent.subscribe($container, 'spa-logout', onLogout);

		jqueryMap.$acct
			.text('Please sign in')
			.bind('utap', onTapAcct);

		// Handle URI anchor change events.
		// This is done *after* all feature modules are configured and init'd, 
		// otherwise they'll not be ready to handle the trigger event, which 
		// is used to ensure the anchor is considered on-load

		$(window)
			.bind('hashchange', onHashchange)
			.bind('resize', onResize)
			.trigger('hashchange');

	};

	return { initModule: initModule };
}());