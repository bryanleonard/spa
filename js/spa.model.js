// * chat_model - the chat model object provides methods to interct with 
//   our instant messaging.
// * people_model - the people model object which provides methods to interact 
//   with the list of people the model maintains
// 164
spa.model = (function() {

	'use strict';

	// The people object API
	// ---------------------
	// The people object is available at spa.model.people.
	// The people object provides methods and events to manage
	// a collection of person objects. Its public methods include:
	// * get_user() - return the current user person object.
	//   If the current user is not signed-in, an anonymous person
	//   object is returned.
	// * get_db() - return the TaffyDB database of all the person
	//   objects - including the current user - pre-sorted.
	// * get_by_cid( <client_id> ) - return a person object with
	//   provided unique id.
	// * login( <user_name> ) - login as the user with the provided
	//   user name. The current user object is changed to reflect
	//   the new identity.
	// * logout()- revert the current user object to anonymous.
	//
	// jQuery global custom events published by the object include:
	// * 'spa-login' is published when a user login process
	//   completes. The updated user object is provided as data.
	// * 'spa-logout' is published when a logout completes.
	//   The former user object is provided as data.
	//
	// Each person is represented by a person object.
	// Person objects provide the following methods:
	// * get_is_user() - return true if object is the current user
	// * get_is_anon() - return true if object is anonymous
	//
	// The attributes for a person object include:
	// * cid - string client id. This is always defined, and
	//   is only different from the id attribute
	//   if the client data is not synced with the backend.
	// * id - the unique id. This may be undefined if the
	//   object is not synced with the backend.
	// * name - the string name of the user.
	// * css_map - a map of attributes used for avatar
	//   presentation.
	//

	var configMap = {
			anon_id : 'a0'
		},
		stateMap = {
			anon_user      : null,    // Key in our state map to store the anonymous person object
			cid_serial	   : 0,		  // serial number used to create this ID from makeCid
			people_cid_map : {},      // Key in our state map to store a map of person objects keyed by client ID
			people_db      : TAFFY(),  // Key in our state map to store a TaffyDB collection of person objects. Initialize it as an empty collection.
			user 		   : null
		},
		isFakeData = true, // Tells the Model to use the example data, objects, and methods from the Fake module instead of actual data Create a prototype for from the Data module.
		personProto, makeCid, clearPeopleDb, completeLogin, makePerson, removePerson, people, initModule;

	// The people object API
	// ---------------------
	// The people object is available at spa.model.people.
	// The people object provides methods and events to manage
	// a collection of person objects. Its public methods include:
	// * get_user() - return the current user person object.
	// If the current user is not signed-in, an anonymous person
	// object is returned.
	// * get_db() - return the TaffyDB database of all the person
	// objects - including the current user - presorted.
	// * get_by_cid( <client_id> ) - return a person object with
	// provided unique id.
	// * login( <user_name> ) - login as the user with the provided
	// user name. The current user object is changed to reflect
	// the new identity. Successful completion of login
	// publishes a 'spa-login' global custom event.
	// * logout()- revert the current user object to anonymous.
	// This method publishes a 'spa-logout' global custom event.
	//
	// jQuery global custom events published by the object include:
	// * spa-login - This is published when a user login process
	// completes. The updated user object is provided as data.
	// * spa-logout - This is published when a logout completes.
	// The former user object is provided as data.
	//
	// Each person is represented by a person object.
	// Person objects provide the following methods:
	// * get_is_user() - return true if object is the current user
	// * get_is_anon() - return true if object is anonymous
	//
	// The attributes for a person object include:
	// * cid - string client id. This is always defined, and
	// is only different from the id attribute
	// if the client data is not synced with the backend.
	// * id - the unique id. This may be undefined if the
	// object is not synced with the backend.
	// * name - the string name of the user.
	// * css_map - a map of attributes used for avatar
	// presentation.
	//

	// Prototype for person objects. Use of a prototype usually reduces memory requirements and improves the performance of objects
	personProto = {
		get_is_user: function() {
			return this.cid === stateMap.user.cid;
		},
		get_is_anon: function() {
			return this.cid === stateMap.anon_user.cid;
		}
	};

	// Client id generator
	makeCid = function() {
		return 'c' + String( stateMap.cid_serial++ );
	};
	
	// Remove all person objects except for the anonymous person and any signed in user.
	clearPeopleDb = function() {
		var user = stateMap.user;

		stateMap.people_db 		= TAFFY();
		stateMap.people_cid_map = {};

		if (user) {
			stateMap.people_db.insert(user);
			stateMap.people_cid_map[user.cid] = user;
		}
	};

	// Complete user sign-in when the backend sends confirmation and data for the user.
	completeLogin = function(user_list) {

console.log(user_list);

		var user_map = user_list[0];

		delete stateMap.people_cid_map[user_map.cid];

		stateMap.user.cid                     = user_map._id;
		stateMap.user.id                      = user_map._id;
		stateMap.user.css_map                 = user_map.css_map;
		stateMap.people_cid_map[user_map._id] = stateMap.user;

		// When we add chat, we should join here
		$.gevent.publish('spa-login', [stateMap.user]);
	};

	makePerson = function( person_map ) {
		var person,
			cid = person_map.cid,
			css_map = person_map.css_map,
			id = person_map.id,
			name = person_map.name;

		if ( cid === undefined || !name ) {
			throw 'Client ID and name required.';
		}

		person         =  Object.create(personProto);
		person.cid     = cid;
		person.name    = name;
		person.css_map = css_map;

		if (id) { person.id = id; }

		stateMap.people_cid_map[cid] = person;

		stateMap.people_db.insert(person);

		return person;
	};

	// Remove a person obj rom the people list
	removePerson = function(person) {
		// If no person and can't remove anonymous person
		// if (!person || person.id === configMap.anon_id ) { return false; }
		if ( ! person ) { return false; }
		if ( person.id === configMap.anon_id ) { return false; }

		stateMap.people_db({ cid : person.cid }).remove();

		if (person.cid) {
			delete stateMap.people_cid_map[person.cid];
		}

		return true;
	};

	// people = {
	// 	get_db      : function() { return stateMap.people_db; },
	// 	get_cid_map : function() { return stateMap.people_cid_map; }
	// };

	// People closure so we can share only the methods we want
	people = (function() {
		var get_by_cid, get_db, get_user, login, logout;

		// A conveniencde method
		get_by_cid = function(cid) { return stateMap.people_cid_map[cid]; };

		// Returns the TaffyDB collection of person objects
		get_db = function() { return stateMap.people_db };
		
		// Returns the current user person object
		get_user = function() { return stateMap.user };

		// No fancy credential checking, just a dumb login
		login = function(name) {
			var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

			stateMap.user = makePerson({
				cid : makeCid(),
				css_map : { top: 25, left: 25, 'background-color': '#8f8' },
				name : name
			});

			// Emit a cb to complete sign-in
			sio.on('userupdate', completeLogin);

			// Send an adduser message to the backend along with all the user details. 
			// Adding a user and signing in are the same thing in this context
			sio.emit('adduser', {
				cid     : stateMap.user.cid,
				css_map : stateMap.user.css_map,
				name    : stateMap.user.name
			});
		};

		logout = function() {
			var is_removed,
				user = stateMap.user;

			// when we add chat, we should leave the chatroom here
			is_removed    = removePerson(user);
			stateMap.user = stateMap.anon_user;

			$.gevent.publish('spa-logout', [user]);
			return is_removed;
		};

		return {
			get_by_cid : get_by_cid,
			get_db : get_db,
			get_user : get_user,
			login: login,
			logout : logout
		};

	}());

	initModule = function() {
		var i, people_list, person_map;

		// init anonymous person
		stateMap.anon_user = makePerson({
			cid  : configMap.anon_id,
			id   : configMap.anon_id,
			name : 'anonymous'
		});
		stateMap.user = stateMap.anon_user;

		// Get the list of online people from the Fake module and add them to the people_db TaffyDB collection.
		if ( isFakeData ) {
			people_list = spa.fake.getPeopleList();

			for (i=0; i < people_list.length; i++) {
				person_map = people_list[i];
				makePerson({
					cid     : person_map._id,
					css_map : person_map.css_map,
					id      : person_map._id,
					name    : person_map.name
				});
			}
		}

	};

	return {
		initModule : initModule,
		people     : people
		// ,makePerson : makePerson
	};
}());