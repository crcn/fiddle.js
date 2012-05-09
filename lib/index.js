var sift = require('sift'),
clone    = require('clone'),
equal    = require('deep-equal'),
dref     = require('dref');

/**
 */

var modifiers = {

	/**
	 * increments / drecements field by N count.
	 */

	$inc: function(target, field, value) {

		if(!target[field]) target[field] = 0;

		target[field] += value;
		return true;
	},

	/**
	 * sets a field to the given value
	 */

	$set: function(target, field, value) {

		target[field] = value;
		return true;
	},

	/**
	 * deletes a property from an object
	 */

	$unset: function(target, field) {

		// if(target[field] === undefined) return false;

		delete target[field];
		return true;
	},

	/**
	 * adds a value to an array
	 */

	$push: function(target, field, value) {

		var ov = target[field] || (target[field] = []);
		ov.push(value);
		return true;
	},

	/**
	 * concatenates one array to another (target obj) 
	 */

	$pushAll: function(target, field, value) {

		var ov = target[field] || (target[field] = []);

		for(var i = 0, n = value.length; i < n; i++) {

			ov.push(value[i]);
		}

		return true;
	},

	/**
	 * adds values to the target array if they don't exist
	 */

	$addToSet: function(target, field, value) {

		var ov = target[field] || (target[field] = []),
		each   = value.$each || [value];

		for(var i = 0, n = each.length; i < n; i++) {

			var item = each[i];
			if(deepIndexOf(ov, item) == -1) ov.push(item);
		}

		return true;
	},

	/**
	 * pops (1) / unshifts (-1) a value from an array  
	 */

	$pop: function(target, field, value) {

		var ov = target[field];

		if(!ov || !ov.length) return false;

		if(value == -1) {

			ov.splice(0, 1);

		} else {

			ov.pop();
		}

		return true;
	},

	/**
	 * removes a value from an array
	 */

	$pull: function(target, field, value) {

		var ov = target[field];

		if(ov === undefined) return false;

		var newArray = [],
		sifter       = sift(value);

		var res = target[field] = ov.filter(function(v) {

			return !sifter.test(v);
		});

		return !!res.length;
	},

	/** 
	 * pulls all instances out of an array
	 */

	$pullAll: function(target, field, value) {

		var ov = target[field];

		if(ov === undefined) return false;

		var res = target[field] = ov.filter(function(v) {

			return deepIndexOf(value, v) == -1;
		});

		return !!res.length;
	},

	/**
	 * renames a field
	 */

	$rename: function(target, field, value) {

		var ov = target[field];

		if(ov === undefined) return false;

		delete target[field];
		target[value] = ov;
		return true;
	}
}

/**
 */

var deepIndexOf = function(target, value) {

	for(var i = target.length; i--;) {

		if(equal(target[i], value)) return i;
	}

	return -1;
}


/**
 */

var parse = function(modify) {

	var isModifier = false, key;

	for(key in modifiers) {

		if(key.substr(0,1) == '$') {

			isModifier = true;
			break;
		}
	}

	//REPLACE the object
	if(!isModifier) {

		return function(target) {

			for(key in target) {

				delete target[key];
			}

			var cloned = clone(modifiers);

			for(key in cloned) {

				target[key] = cloned[key];
			}	
		}
	}

	//MODIFY the object
	return function(target) {

		var modified = false;

		for(key in modify) {	

			var modifier = modifiers[key];

			if(!modifier) continue;

			var v = modify[key];

			for(var key2 in v) {

				var keyParts = key2.split('.'),
				targetKey    = keyParts.pop();

				//make sure there are key parts, otherwise the ONLY target is the one given in the function
				var targets = keyParts.length ? dref.get(target, keyParts) : [target];

				for(var i = targets.length; i--;) {

					modified = modifier(targets[i], targetKey, v[key2]) || modified;
				}
			}
		}

		return modified;
	}
}

/**
 */

var fiddler = function(modifiers, filter) {

	var modify = parse(modifiers), sifter;

	if(filter) sifter = sift(filter);

	return function(target) {

		var targets = target instanceof Array ? target : [target],
		modified    = false;

		for(var i = targets.length; i--;) {

			var tg = targets[i];

			if(!sifter || sifter.test(tg)) {

				modified = modify(tg) || modified;
			}
		}

		return modified;
	}
}

/**
 */

var fiddle = module.exports = function(modifiers, filter, target) {

	var fdlr = fiddler(modifiers, filter);

	if(target) return fdlr(target);

	return fdlr;
}


