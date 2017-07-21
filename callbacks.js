// const final = (callback, done=0, expect=0, exit=false, data=[]) =>
// 	c =>
// 	(	c = expect++,
// 		(err, ...res) =>
// 		exit ||
// 		err
// 		?
// 		(	exit = true,
// 			callback(err, c) )
// 		: (	data[c] = res,
// 			++done >= expect
// 			?
// 			(	exit = true,
// 				callback(null, data) )
// 			: null) )


// const stringify = data =>
// 	data.map ? data.map(x => JSON.stringify(x)).join(', ') : data

// const taskhandle = final((err, data) =>
// 	(console.log('We are done!'), err && console.log('err! ', data),
// 		data && console.log(`results by task index: ${stringify(data)}`)))

// const run = (x, join=taskhandle()) =>
// 	setTimeout(() => console.log(`finishing task ${x}`) || join(null, x), 50*x*Math.random())

// let x = -1
// while (++x<100) run(x)




// // try again, less statements this time 


// (final, taskhandle, stringify)






// const final = (callback, done=0, expect=0, exit=false, data=[]) =>
// 	c =>
// 	(	c = expect++,
// 		(err, ...res) =>
// 		exit ||
// 		err
// 		?
// 		(	exit = true,
// 			callback(err, c) )
// 		: (	data[c] = res,
// 			++done >= expect
// 			?
// 			(	exit = true,
// 				callback(null, data) )
// 			: null) )


// const stringify = data =>
// 	data.map ? data.map(x => JSON.stringify(x)).join(', ') : data

// const taskhandle = final((err, data) =>
// 	(console.log('We are done!'), err && console.log('err! ', data),
// 		data && console.log(`results by task index: ${stringify(data)}`)))

// const run = (_, idx, __, join=taskhandle()) => (
//  setTimeout(() => console.log(`finishing task ${idx}`) || join(null, idx), variation*idx*Math.random())
// )



// //#require
// (($stringify, $final, variation=50, count=100) => (
// 	//#require
// 	(($taskhandle) => (
// 		[...new Array(count)].map(
// 			(_, idx, __, $join=$taskhandle()) => (
// 				setTimeout(() => (
// 					console.log(`finishing task ${idx}`) || $join(null, idx)
// 				), variation*idx*Math.random())
// 			)
// 		)
// 	))(
// 	//#deps
// 		//$taskhandle
// 		$final((err, data) => (
// 			console.log('We are done!'), err && console.log('err! ', data),
// 			data && console.log(`results by task index: ${$stringify(data)}`)
// 		))
// 	)
// ))(
// //#deps
// 	//$stringify
// 	(data) => (
// 		data.map ? data.map(x => JSON.stringify(x)).join(', ') : data
// 	),
// 	//$final
// 	(callback, done=0, expect=0, exit=false, data=[]) => (
// 		//$join
// 		c => (
// 			c = expect++,
// 			(err, ...res) => (
// 				exit ||
// 				(err || (data[c] = res, ++done >= expect)) &&
// 				(exit = true, callback(err, err ? c : data))
// 			)
// 		)
// 	)
// )




//#require
(($stringify, $final, variation=50, count=100) =>
	//#require
	void (($taskhandle) =>
		void [...new Array(count)].map(
			(_, idx, __, $join=$taskhandle()) =>
				void setTimeout(() =>
					void console.log(`finishing task ${idx}`) || void $join(null, idx),
					variation*idx*Math.random()))
	)(
	//#deps
		// (callback) -> $taskhandle
		$final((err, data) =>
			void console.log('We are done!') ||
			err && void console.log('err! ', data) ||
			data && void console.log(`results by task index: ${$stringify(data)}`))
	)
)(
//#deps
	//$stringify
	data =>
		data.map ? data.map(x => JSON.stringify(x)).join(', ') : data,
	//$final
	(callback, done=0, expect=0, exit=false, data=[]) =>
		//$taskhandle
		c => (
			c = expect++,
			//$join
			(err, ...res) =>
				exit ||
				(err || (data[c] = res, ++done >= expect)) &&
				void (exit = true, callback(err, err ? c : data))
		)
)

// ... what was that again?
