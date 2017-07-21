// The question I was asked was:
// Format 4 numbers into a 24-hour time (00:00), finding the maximum 
// (latest) time possible, taking into account that the max hours 
// would be 23 and the max minutes would be 59. If not possible, 
// return NOT POSSIBLE.
//
// So for example:
// 6, 5, 2, 0 would be 20:56
// 3, 9, 5, 0 would be 09:53
// 7, 6, 3, 8 would be NOT POSSIBLE
//
// The example function that had to return the time or string looked 
// like this, A, B, C, D being a different number from the 
// comma-separated list above:
//
// function generate(A, B, C, D) {
//     // Your code here
// } 
//
// How would people tackle this?
//##############################



// Format 4 numbers into a 24-hour time (00:00), finding the maximum 
// (latest) time possible, taking into account that the max hours 
// would be 23 and the max minutes would be 59. If not possible, 
// return NOT POSSIBLE.

const NOT_POSSIBLE = 'NOT POSSIBLE';

function generate(A, B, C, D) {
	var args = [A, B, C, D];
	var idx = 0;
	var out = NOT_POSSIBLE;
	var firstN, secondN;

	MAIN: {
		args.sort(NUMERIC_ASCENDING);
		// number has to start with 0, 1 or 2
		if (args[0] > 2) break MAIN;
		while (args[++idx] < 3) {}

		// take the higest 2, 1, or 0
		firstN = args[--idx];
		args = pop(args, idx);

		if (firstN === 2) {
			// make sure that the first number doesn't exceed 23 and
			// the second number 59
			if (args[0] > 3 || args[0] > 1 && args[1] > 5)
				break MAIN;
			// advance to the first number < 3 or the length
			idx = 0;
			while (args[++idx] < 3){}
		} else {
			// much simpler if we have a 0 or 1, take the biggest n remaining
			idx = args.length;
		}

		secondN = args[--idx];
		args = pop(args, idx);
		// if minutes number is too large, swap
		if (args[0] > 5) {
			out = '' + secondN + args[1] + ':' + firstN + args[0];
		} else {
			// if bottom number is low enough, swap for more minutes
			out = '' + firstN + secondN + (args[1] < 6 ? ':' + args[1] + args[0] : ':' + args[0] + args[1]);
		}
	}
	return out;
}

// numeric comparator for sort
function NUMERIC_ASCENDING(x, y) {
	return x > y ? 1 : y > x ? -1 : 0;
}

// specialized "array pop" I wrote out longhand that's very optimized; might be cheating =D
function pop(arr, target) {
	switch (arr.length) {
	case 3:
		switch (target) {
		case 0: return [arr[1], arr[2]];
		case 1: return [arr[0], arr[2]];
		default: return [arr[0], arr[1]];
		}
	case 4:
		switch (target) {
		case 0: return [arr[1], arr[2], arr[3]];
		case 1: return [arr[0], arr[2], arr[3]];
		case 2: return [arr[0], arr[1], arr[3]];
		default: return [arr[0], arr[1], arr[2]];
		}
	}
}

/* --------------- Start Speed Test --------------------- */
let startTime = Math.floor(Date.now());
let times = 10000; //how many generate call you want?
let timesHolder = times;

while (times--) {
  let A = randNum();
  let B = randNum();
  let C = randNum();
  let D = randNum();
  generate(A, B, C, D);
  if (times == 0) {
    let totalTime = Math.floor(Date.now()) - startTime;
    let msg = timesHolder + ' mine Call Finished Within -> ' + totalTime + ' ms <-';
    console.log(msg);
  }
}
/* --------------- END Speed Test --------------------- */

times = timesHolder;
startTime = Math.floor(Date.now());
while (times--) {
  let A = randNum();
  let B = randNum();
  let C = randNum();
  let D = randNum();
  generate2(A, B, C, D);
  if (times == 0) {
    let totalTime = Math.floor(Date.now()) - startTime;
    let msg = timesHolder + ' gen2 Call Finished Within -> ' + totalTime + ' ms <-';
    console.log(msg);
  }
}

function randNum() {
  return Math.floor(Math.random() * (9 - 0 + 1)) + 0;
}
/* --------------- END Speed Test --------------------- */


// first, write some test cases
function test(generate) {
	generate = make_expect(generate);
	// provided as examples
	generate(6, 5, 2, 0).expect(s => s == '20:56');
	generate(3, 9, 5, 0).expect(s => s == '09:53');
	generate(7, 6, 3, 8).expect(s => s == NOT_POSSIBLE);
	// additional as needed
	generate(2, 3, 5, 9).expect(s => s == '23:59');
	generate(2, 3, 9, 5).expect(s => s == '23:59');
	generate(9, 2, 3, 5).expect(s => s == '23:59');
	generate(9, 5, 3, 2).expect(s => s == '23:59');
	generate(2, 4, 5, 6).expect(s => s == NOT_POSSIBLE);
	generate(1, 2, 6, 6).expect(s => s == '16:26');
	generate(1, 2, 9, 9).expect(s => s == '19:29');
	generate(0, 0, 0, 1).expect(s => s == '10:00');
	generate(0, 0, 0, 9).expect(s => s == '09:00');
	generate(1, 1, 1, 2).expect(s => s == '21:11');
	generate(2, 2, 1, 2).expect(s => s == '22:21');
	generate(0, 0, 2, 9).expect(s => s == '20:09');
	generate(7, 6, 3, 8).expect(s => s == NOT_POSSIBLE);
	generate(2, 3, 7, 9).expect(s => s == NOT_POSSIBLE);
	generate(2, 2, 7, 9).expect(s => s == NOT_POSSIBLE);
	generate(2, 1, 7, 9).expect(s => s == '19:27');
	generate(0, 0, 0, 0).expect(s => s == '00:00');
	generate(1, 7, 2, 7).expect(s => s == '17:27');
	generate(0, 0, 2, 9).expect(s => s == '20:09');
}

// a decorator that makes nice asserts
function make_expect(fn) {
	let result;
	const shim = {expect: function(expected) {
		if (!expected(this.result))
			console.error(`${JSON.stringify(this.args)
			}\n ${expected.toString()
			} (failed); [unexpected result ${
			JSON.stringify(this.result)}]`);
		return this;
	}};
	return (...args) => {
		shim.args = args;
		shim.result = fn(...args);
		return shim;
	};
}

console.log('test gen 1\n=============')
test(generate)
console.log('test gen 2\n=============')
test(generate2)


function generate2(A, B, C, D) {
    vals = [A, B, C, D];
    counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < vals.length; i++) {
        for (j = vals[i]; j < counts.length; j++) counts[j]++;
    }
    // counts is now populated with the number of values less than or equal to the index it belongs to
    // so counts[2] is the total number of 0's, 1's and 2's
    if (counts[2] === 0) return 'NOT POSSIBLE';
    // if there are no 0's and 1's, then it must start with 2
    mustStartWith2 = counts[1] === 0;
    if (mustStartWith2 && counts[3] === 1) return 'NOT POSSIBLE';
    // We want a count of the number of free digits that are 5 or less (for the minute digit)
    numbersAvailableForMinute = counts[5] - (mustStartWith2 ? 2 : 1); 
    if (numbersAvailableForMinute === 0) return 'NOT POSSIBLE';
    // we now know that it is a valid time
    time = [0, 0, 0, 0];
    // we also know if it starts with 2
    startsWith2 = mustStartWith2 || (numbersAvailableForMinute >= 2 && counts[2] > counts[1]);
    // knowing the starting digit, we know the maximum value for each digit
    maxs = startsWith2 ? [2, 3, 5, 9] : [1, 9, 5, 9];
    for (i = 0; i < maxs.length; i++) {
        // find the first occurrence in counts that has the same count as the maximum
        time[i] = counts.indexOf(counts[maxs[i]]);
        // update counts after the value was removed
        for (j = time[i]; j < counts.length; j++) counts[j]--;
    }
    // create the time
    return time[0]+""+time[1]+":"+time[2]+""+time[3];
}

