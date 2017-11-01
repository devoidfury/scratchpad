
// parse string like 1.5M or 10k and return the number
function parse_shorthand(str, type) {
	type = type || 'number';
	str = str.replace(/ /g, ''); // remove spaces

	var total = 0;
	var part = 0;
	var part_fraction = 0;
	var fraction_len = 0;
	var is_fraction = false;
	var c;

	// process the string; update total if we find a unit character
	for(var i = 0; i < str.length; i++) {
		c = str.charAt(i);

		if(c == '.' || c == ',') {
			is_fraction = true;

		} else if(is_numeric(c)) {
			if(is_fraction) {
				part_fraction = part_fraction * 10 + parseInt(c, 10);
				fraction_len++;
			} else {
				part = part * 10 + parseInt(c, 10);
			}

		} else {

			total += magnitude(c, type) * part +
					magnitude(c, type) * part_fraction / Math.pow(10, fraction_len);

			part = 0;
			part_fraction = 0;
			fraction_len = 0;
			is_fraction = false;
		}
	}

	return Math.round(total + part + part_fraction / Math.pow(10, fraction_len));
}

// inverse of parse; take a javascript number and print it out using the shorthands
function format_shorthand(number, type) {
	var out = [],
		mag,
		current

	type = type || 'number';

	for (var i = 0; i < MAGNITUDES[type].length; i++) {
		mag = MAGNITUDES[type][i]
		current = (number / mag[1]) | 0

		if (current > 0) {
			out.push(current + mag[0])
			number -= current * mag[1]
		}
	}
	number && out.push('' + number);
	return out.join(' ');
}


module.exports = {
	parse_shorthand,
	format_shorthand
}




function genIndex(scale) {
	return scale.reduce(function(cache, [measure, time, aliases]) {
		cache[measure] = time
		if (aliases) {
			for (const a of aliases) {
				cache[a] = time;
			}
		}
		return cache
	}, Object.create(null));
}


function isNumeric(str) {
	for(var i = 0; i < str.length; i++) {
		if(str.charAt(i) < '0' || str.charAt(i) > '9')
			return false;
	}
	return true;
}

function magnitude(scale, str) {
	return scale[str.toLowerCase()] || 0;
}



module.exports = timeTyrant;


var indexCache;
function timeTyrant(input, scale) {
	if (!indexCache) {
		indexCache = genIndex();
	}
	scale = scale || indexCache;


}

timeTyrant.scale = [
	['y', 1000 * 60 * 60 * 24 * 365],
	['w', 1000 * 60 * 60 * 24 * 7],
	['d', 1000 * 60 * 60 * 24],
	['h', 1000 * 60 * 60],
	['m', 1000 * 60],
	['s', 1000]
];
