spa.util = (function() {

	var makeError, setConfigMap;

	// Purpose: a convenience wrapper to create an error object
	makeError = function( name_text, msg_text, data ) {
		var error = new Error();

		error.name = name_text;
		error.message = msg_text;

		if (data) { error.data = data; }

		return error;
	};

	// Purpose: Common code to set configs in feature modules
	setConfigMap = function(arg_map) {
		var input_map = arg_map.input_map,
			settable_table = arg_map.settable_table,
			config_map = arg_map.config_map,
			key_name,
			error;

		for (key_name in input_map) {
			if (input_map.hasOwnProperty(key_name)) {
				if (settable_map.hasOwnProperty(key_name)) {
					config_map[key_name] = input_map[key_name];
				}
				else {
					error = makeError('Bad Input', 'Setting config key |' + key_name + "| is not supported")
				}

				throw error;
			}
		}
	};

	return {
		makeError: makeError,
		setConfigMap: setConfigMap
	};
}());