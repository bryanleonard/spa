spa.fake = (function() {

	'use strict';

	var fakeIdSerial, 
		makeFakeId, 
		getPeopleList, 
		mockSio;

	fakeIdSerial = 5;

	makeFakeId = function() {
		return 'id_' + String( fakeIdSerial++ );
	};

	getPeopleList = function() {
		return [
			{ 
				name : 'Betty', 
				_id : 'id_01',
				css_map : { top: 20, left: 20, 'background-color' : 'rgb( 128, 128, 128)' }
			},
			{ 
				name : 'Mike', 
				_id : 'id_02',
				css_map : { top: 60, left: 20, 'background-color' : 'rgb( 128, 255, 128)' }
			},
			{ 
				name : 'Pebbles',
				_id : 'id_03',
				css_map : { top: 100, left: 20, 'background-color' : 'rgb( 128, 192, 192)'  }
			},
			{ 
				name : 'Wilma',
				_id : 'id_04',
				css_map : { top: 140, left: 20, 'background-color' : 'rgb( 192, 128, 128)' }
			}
			,{ 
				name : 'Bryan',
				_id : 'id_05',
				css_map : { top: 180, left: 20, 'background-color' : 'rgb( 207, 13, 32)' }
			}
		];
	};

	mockSio = (function() {
		var on_sio, 
			emit_sio, 
			callback_map = {};

		on_sio = function(msg_type, callback) {
			callback_map[msg_type] = callback;
		};

		// emulates sending a message to the server
		emit_sio = function(msg_type, data) {
			// respond to 'adduser' even with 'userupdate' cb after a 3s delay
			if (msg_type === 'adduser' && callback_map.userupdate) {
				setTimeout(function() {
					callback_map.userupdate(
						[{
							_id     : makeFakeId(),
							name    : data.name,
							css_map : data.css_map
						}]
					)
				}, 3000);
			}
		};

		// Export on_sio as on and emit_sio as emit to emulate a real SocketIO object.
		return { 
			emit: emit_sio,
			on : on_sio
		}
	}());


	return {
		getPeopleList : getPeopleList,
		mockSio : mockSio
	};
}());