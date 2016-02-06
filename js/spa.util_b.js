spa.util_b = (function() {

	'use strict';

	var configMap = {
			regex_encode_html  : /[&"'><]/g,
			regex_encode_noamp : /["'><]/g,
			html_encode_map	   : {
				'&' : '&#38;',
				'"' : '&#34;',
				"'" : '&#39;',
				'>' : '&#62;',
				'<' : '&#60;'
			}
		},
		decodeHtml, encodeHtml, getEmSize;

	// Create a modified copy of the configuration used to encode entities.
	configMap.encode_noamp_map = $.extend({}, configMap.html_encode_map)
	// But remove the ampersand
	delete configMap.encode_noamp_map['&'];

	// Decodes HTML entities in a browser-friendly way
	// See http://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript
	decodeHtml = function(str) {
		return ( $('<div/>').html(str || '').text() );
	};


	// This is single pass encoder for html entities and handles an arbitrary number of characters
	encodeHtml = function(input_arg_str, exclude_map) {
		var input_str = String(input_arg_str),
			regex,
			lookup;

		if (exclude_map) {
			lookup_map = configMap.encode_noamp_map;
			regex 	   = configMap.regex_encode_noamp;
		}
		else {
			lookup_map = configMap.html_encode_map;
			regex 	   = configMap.regex_encode_html;
		}

		return input_str.replace(regex, 
			function(match, name) {
				return lookup_map[match] || '';
			}
		);
		
	};

	// Create the getEmSize method to calculate the pixel size of the em unit.
	getEmSize = function(el) {
		return Number(
			getComputedStyle(el, '').fontSize.match(/\d*\.?\d*/)[0]
			// http://www.eriwen.com/javascript/measure-ems-for-layout/
			// getComputedStyle(el, '').fontSize.match(/(\d+(\.\d+)?)px$/)[1]
		);
	};

	// Neatly export all the pubic methods.
	return {
		decodeHtml : decodeHtml,
		encodeHtml : encodeHtml,
		getEmSize  : getEmSize
	};

}());