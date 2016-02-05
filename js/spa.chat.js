spa.chat = (function() {

	// Module scoped vars
	// --------------------------------------
	var configMap = {
			main_html: String()
				+ '<div class="spa-chat">'
					+ '<div class="spa-chat-head">'
						+ '<div class="spa-chat-head-toggle">+</div>'
						+ '<div class="spa-chat-head-title">'
							+ 'Chat'
						+ '</div>'
					+ '</div>'
					+ '<div class="spa-chat-closer">&times;</div>'
					+ '<div class="spa-chat-sizer">'
						+ '<div class="spa-chat-msgs"></div>'
						+ '<div class="spa-chat-box">'
							+ '<input type="text"/>' /* should have spa-chat-input class? */
							+ '<div>send</div>'
						+ '</div>'
					+ '</div>'
				+ '</div>',
			settable_map: {
				slider_open_time    : true,
				slider_close_time   : true,
				slider_open_em      : true,
				slider_closed_em    : true,
				slider_opened_title : true,
				slider_closed_title : true,
				chat_model          : true,
				people_model        : true,
				set_chat_anchor     : true
			},
			slider_open_time     : 250,
			slider_close_time    : 250,
			slider_opened_min_em : 10,
			window_height_min_em : 20,
			slider_opened_em     : 18,
			slider_closed_em     : 2,
			slider_opened_title  : 'Click to close',
			slider_closed_title  : 'Click to open',
			chat_model           : null,
			people_model         : null,
			set_chat_anchor      : null
		},
		stateMap = { 
			$append_target   : null,
			position_type    : 'closed',
			px_per_em        : 0,
			slider_hidden_px : 0,
			slider_closed_px : 0,
			slider_opened_px : 0
		},
		jqueryMap = {},
		setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
		onClickToggle, configModule, initModule,
		removeSlider, handleResize

	// Utility methods
	// --------------------------------------
	getEmSize = function(el) {
		return Number(
			getComputedStyle(el, '').fontSize.match(/\d*\.?\d*/)[0]
		);
	};


	// DOM methods
	// --------------------------------------
	setJqueryMap = function() {
		var $append_target = stateMap.$append_target,
			$slider        = $append_target.find( '.spa-chat' );
		
		jqueryMap = {
			$slider : $slider,
			$head   : $slider.find('.spa-chat-head'),
			$toggle : $slider.find('.spa-chat-head-toggle'),
			$title  : $slider.find('.spa-chat-head-title'),
			$sizer  : $slider.find('.spa-chat-sizer'),
			$msgs   : $slider.find('.spa-chat-msgs'),
			$box    : $slider.find('.spa-chat-box'),
			$input  : $slider.find('.spa-chat-input input[type=text]')
		};
	};

	setPxSizes = function() {
		var px_per_em,
			open_height_em,
			window_height_em;

		px_per_em = getEmSize( jqueryMap.$slider.get(0) );
		window_height_em = Math.floor( $(window).height() / px_per_em ) + 0.5;
		opened_height_em = ( window_height_em > configMap.window_height_min_em )
			? configMap.slider_opened_em
			: configMap.slider_opened_min_em;


		stateMap.px_per_em        = px_per_em;
		stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
		stateMap.slider_opened_px = opened_height_em * px_per_em;

		jqueryMap.$sizer.css({
			height: (opened_height_em - 2) * px_per_em
		});
	};



	// Public methods
	// --------------------------------------
	// Example : spa.chat.setSliderPosition( 'closed' );
	// Purpose : Move the chat slider to the requested position
	// Arguments : // * position_type - enum('closed', 'opened', or 'hidden')
	// * callback - optional callback to be run end at the end
	// of slider animation. The callback receives a jQuery
	// collection representing the slider div as its single
	// argument
	// Action :
	// This method moves the slider into the requested position.
	// If the requested position is the current position, it
	// returns true without taking further action
	// Returns :
	// * true - The requested position was achieved
	// * false - The requested position was not achieved
	// Throws : none
	//
	setSliderPosition = function(position_type, cb) {
		var height_px,
			animate_time,
			slider_title,
			toggle_text;

		// return true if slider is alread in requested position
		if (stateMap.position_type === position_type) {
			return true;
		}

		//prepare animate params
		switch(position_type) {
			case 'opened' :
				height_px    = stateMap.slider_opened_px;
				animate_time = configMap.slider_open_time;
				slider_title = configMap.slider_opened_title;
				toggle_text  = "="
			break;

			case 'hidden' :
				height_px    = 0;
				animate_time = configMap.slider_open_time;
				slider_title = '';
				toggle_text  = '+';
			break;

			case 'closed' :
				height_px    = stateMap.slider_closed_px;
				animate_time = stateMap.slider_close_time;
				slider_title = configMap.slider_closed_title;
				toggle_text  = '+';
			break;

			default : // bail for unknown position_type
				return false;
		}

		// animate slider position change
		stateMap.position_type = '';
		jqueryMap.$slider.velocity(
			{ height: height_px },
			function() {
				jqueryMap.$toggle.prop('title', slider_title);
				jqueryMap.$toggle.text( toggle_text );
				stateMap.position_type = position_type;

				if (cb) {
					cb(jqueryMap.$slider);
				}
			}
		);
		return true;
	};


	// Event Handlers
	// -------------------------------------- 
	onClickToggle = function(event){
		var set_chat_anchor = configMap.set_chat_anchor;
		if ( stateMap.position_type === 'opened') {
			set_chat_anchor('closed');
		}
		else if ( stateMap.position_type === 'closed') {
			set_chat_anchor('opened')
		}

		return false;
	}




	// Adjust configuration of allowed keys
	// Whenever a feature module accepts settings, we always use the same 
	// method name and the same spa.util.setConfigMap utility
	// Begin public method /configModule/
	// Example : spa.chat.configModule({ slider_open_em : 18 });
	// Purpose : Configure the module prior to initialization
	// Arguments :
	// * set_chat_anchor - a callback to modify the URI anchor to
	// indicate opened or closed state. This callback must return
	// false if the requested state cannot be met
	// * chat_model - the chat model object provides methods
	// to interact with our instant messaging
	// * people_model - the people model object which provides
	// methods to manage the list of people the model maintains
	// * slider_* settings. All these are optional scalars.
	// See mapConfig.settable_map for a full list
	// Example: slider_open_em is the open height in em's
	// Action :
	// The internal configuration data structure (configMap) is
	// updated with provided arguments. No other actions are taken.
	// Returns : true
	// Throws : JavaScript error object and stack trace on
	// unacceptable or missing arguments
	//
	configModule = function(input_map) {
		spa.util.setConfigMap({
			input_map    : input_map,
			settable_map : configMap.settable_map,
			config_map   : configMap
		});
		return true;
	};

	// Begin public method /initModule/
	// Example : spa.chat.initModule( $('#div_id') );
	// Purpose : Directs Chat to offer its capability to the user
	// Arguments :
	// * $append_target (example: $('#div_id')).
	// A jQuery collection that should represent
	// a single DOM container
	// Action :
	// Appends the chat slider to the provided container and fills
	// it with HTML content. It then initializes elements,
	// events, and handlers to provide the user with a chat-room
	// interface
	// Returns : true on success, false on failure
	// Throws : none
	//
	initModule = function($append_target) {
		$append_target.append( configMap.main_html );
		stateMap.$append_target = $append_target;
		setJqueryMap();
		setPxSizes();

		// init chat slider to default title and state
		jqueryMap.$toggle.prop('title', configMap.slider_closed_title );
		jqueryMap.$head.click(onClickToggle);
		stateMap.position_type = 'closed';
		
		return true;
	};

	// Begin public method /removeSlider/
	// Purpose :
	// * Removes chatSlider DOM element
	// * Reverts to initial state
	// * Removes pointers to callbacks and other data
	// Arguments : none
	// Returns : true
	// Throws : none
	//
	removeSlider = function() {
		// unwind initialization and state
		// remove DOM container; removes event bindings too
		if (jqueryMap.$slider) {
			jqueryMap.$slider.slideUp();
			// jqueryMap.$slider.fadeOut(function() {
			// 	jqueryMap.$slider.remove();
			// 	jqueryMap = {};
			// });
		}

		stateMap.$append_target = null;
		stateMap.position_type  = 'closed';

		// unwind key configurations
		configMap.chat_model      = null;
		configMap.people_model    = null;
		configMap.set_chat_anchor = null;

		return true;
	};


	// Purpose :
	//  	Given a window resize event, adjust the presentation by this module if needed.
	// Actions:
	// 		If the window height or width falls below a given threshold, resie the chat slider for the reduce window size.
	// Returns: boolean
	//  	false - resize not considered
	//  	true - resize considered
	// Throws:
	//  	none
	//  
	handleResize = function() {
		// first, don't do anything if there isn't a slider to begin with
		if (!jqueryMap.$slider) { return false; }

		setPxSizes(); // ツ
		if (stateMap.position_type === 'opened') {
			jqueryMap.$slider.css({ height: stateMap.slider_opened_px});
		}

		return true;		
	};


	return {
		setSliderPosition : setSliderPosition,
		configModule      : configModule,
		initModule        : initModule,
		removeSlider	  : removeSlider,
		handleResize 	  : handleResize
	};
	
}());