var sift = require('sift'),
clone    = require('clone'),
equal    = require('deep-equal');



var modifiers = {

	/**
	 * iincrements field by N
	 */

	$inc: function(target, field, value) {
		if(!target[field]) target[field] = 0;
		target[field] += value;
	},

	/**
	 */

	$set: function(target, field, value) {
		target[field] = value;
	},

	/**
	 */

	$unset: function(target, field) {
		delete target[field];
	},

	/**
	 */

	$push: function(target, field, value) {
		var ov = target[field] || [];
		ov.push(value);
		target[field] = ov;
	},

	/**
	 */

	$pushAll: function(target, field, value) {
		var ov = target[field] || [];

		for(var i = 0, n = value.length; i < n; i++) {
			ov.push(value[i]);
		}
		target[field] = ov;
	},

	/**
	 */

	$addToSet: function(target, field, value) {
		var ov = target[field] || [],
		each = value.$each || [value];

		for(var i = 0, n = each.length; i < n; i++) {
			var item = each[i];
			if(deepIndexOf(ov, item) == -1) ov.push(item);
		}
	},


	/**
	 */

	$pop: function(target, field, value) {
		var ov = target[field];
		if(!ov) return;
		if(value == -1) {
			ov.splice(0, 1);
		} else {
			ov.pop();
		}
	},

	/**
	 */

	$pull: function(target, field, value) {
		var ov = target[field];
		if(!ov) return;
		var newArray = [],
		sifter = sift(value);


		target[field] = ov.filter(function(v) {
			return !sifter.test(v);
		});
	},

	/**
	 */

	$pullAll: function(target, field, value) {

		var ov = target[field];
		if(!ov) return;

		target[field] = ov.filter(function(v) {
			return deepIndexOf(value, v) == -1;
		})
	},

	/**
	 */

	$rename: function(target, field, value) {
		var ov = target[field];
		delete target[field];
		target[value] = ov;
	}
}

var deepIndexOf = function(target, value) {
	for(var i = target.length; i--;) {
		if(equal(target[i], value)) return i;
	}
	return -1;
}




var parse = function(modify) {

	var isModifier = false, key;
	for(key in modifiers) {
		if(key.substr(0,1) == '$') {
			isModifier = true;
			break;
		}
	}

	//replacing the object
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

	return function(target) {
		for(key in modify) {
			var modifier = modifiers[key];
			if(!modifier) continue;
			var v = modify[key];

			for(var key2 in v) {

				var keyParts = key2.split('.'),
				targetKey = keyParts.pop();

				var targets = findTargets(keyParts, target);

				for(var i = targets.length; i--;) {
					modifier(targets[i], targetKey, v[key2]);
				}
			}
		}	
	}


	
}


var findTargets = function(keyParts, target, index, targets) {

	if(!targets) {
		keyParts = keyParts instanceof Array ? keyParts : keyParts.split('.');
		targets = [];
		index = 0;
	}

	var ct, i, j, kp, pt = target;


	for(i = index, n = keyParts.length; i < n; i++) {
		kp = keyParts[i];
		ct = pt[kp];

		if(kp == '$') {
			for(j = pt.length; j--;) {
				findTargets(keyParts, pt[j], i+1, targets);
			}
			return targets;
		} else
		if(!target[kp]) {
			ct = target[kp] = {};
		}

		pt = ct;
	}

	if(ct) {
		targets.push(ct);
	} else
	{
		targets.push(pt);
	}

	return targets;
}




var fiddler = function(modifiers, filter) {

	var modify = parse(modifiers), sifter;
	if(filter) sifter = sift(filter);

	return function(target) {
		var targets = target instanceof Array ? target : [target];

		for(var i = targets.length; i--;) {
			var tg = targets[i];
			if(!sifter || sifter.test(tg)) {
				modify(tg);
			}
		}
	}
}


var fiddle = module.exports = function(modifiers, filter, target) {

	var fdlr = fiddler(modifiers, filter);

	if(target) return fdlr(target);

	return fdlr;
}


