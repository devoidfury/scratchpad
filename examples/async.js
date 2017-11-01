var x = [1, 2]
console.log(`before request (happens 1st) x is ${x}`);

setTimeout(function() {
	console.log(`after request finished (happens 3rd/last) x is ${x}`);
	x.push(3)
	console.log(`finally x is ${x}`);
}, 200)

console.log(`after starting request (happens 2nd) x is ${x}`);

