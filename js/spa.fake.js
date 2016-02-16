spa.fake = (function() {

	'use strict';

	var peopleList,
		fakeIdSerial, 
		makeFakeId,  
		mockSio;

	fakeIdSerial = 5;

	makeFakeId = function() {
		return 'id_' + String( fakeIdSerial++ );
	};

	peopleList = [
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
			name : 'Bryan',
			_id : 'id_04',
			css_map : { top: 140, left: 20, 'background-color' : 'rgb( 192, 128, 128)' }
		}
	];

	mockSio = (function() {
		var on_sio, 
			emit_sio,
			emit_mock_msg,
			send_listchange,
			listchange_idto,
			callback_map = {};

		on_sio = function(msg_type, callback) {
			callback_map[msg_type] = callback;
		};

		// emulates sending a message to the server
		emit_sio = function(msg_type, data) {
			var person_map;

			// respond to 'adduser' even with 'userupdate' cb after a 3s delay
			if (msg_type === 'adduser' && callback_map.userupdate) {
				setTimeout(function() {

					person_map = {
						_id     : makeFakeId(),
						name    : data.name,
						css_map : data.css_map
					};
					peopleList.push(person_map);
					callback_map.userupdate([person_map]);

					// callback_map.userupdate(
					// 	[{
					// 		_id     : makeFakeId(),
					// 		name    : data.name,
					// 		css_map : data.css_map
					// 	}]
					// )
				}, 3000);
			}

			// Respond to 'updatechat' event with an 'updatechat'
			// callback after a 2s delay. Echo back user info.
			if ( msg_type === 'updatechat' && callback_map.updatechat ) {
				setTimeout (function() {
					var user = spa.model.people.get_user();
					callback_map.updatechat([{
						dest_id   : user.id,
						dest_name : user.name,
						sender_id : data.dest_id,
						msg_text  : 'Thanks for the note, ' + user.name + '.'
					}]);
				}, 2000);
			}

			if ( msg_type === 'leavechat' ) {
				//reset login status
				delete callback_map.listchange;
				delete callback_map.updatechat;

				if ( listchange_idto ) {
					clearTimeout( listchange_idto );
					listchange_idto = undefined;
				}

				send_listchange();
			}
		};

		emit_mock_msg = function() {
			//TODO: start here
		};

		send_listchange = function() {
			listchange_idto = setTimeout( function() {
				if (callback_map.listchange) {
					callback_map.listchange([peopleList]);
					listchange_idto = undefined;
				}
				else {
					send_listchange();
				}
			}, 1000);
		};

		// Fire it up, man...
		send_listchange();

		// Export on_sio as on and emit_sio as emit to emulate a real SocketIO object.
		return { 
			emit : emit_sio,
			on   : on_sio
		}
	}());


	return {
		mockSio : mockSio
	};
}());