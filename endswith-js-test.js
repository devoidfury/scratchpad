function endsWith1(str, target) {
	const target_length = target.length;
	const skip = str.length - target_length;
	for (let i = 0; i < target_length; i++)
		if (str[skip + i] !== target[i])
			return false;
	return true;
}

function endsWith(str, target) {
	let i = target.length;
	const skip = str.length - i;
	while (i --> 0) // slides towards operator
		if (str[skip + i] !== target[i])
			return false;
	return true;
}

const endsWith = (source, ending) => source.substr(-ending.length) === ending;


endsWith("ajddj", "dj");


// я очнулся на вокзале в подмосковье без своих штанов
// я вряд ли смогу на сухую слезть
