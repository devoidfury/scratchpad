
function SyncPreloader(cls, xtraMethods) {
	this.queue = []

	const stub = (key) => (...args) => {
		let defer = {}
		defer.promise = new Promise(function(resolve, reject) {
			defer.resolve = resolve
			defer.reject = reject
		})
		this.queue.push([key, args, defer]);
		return defer.promise
	}

	const proto = Object.keys(cls.prototype)
	const methods = proto.filter(k => typeof proto[k] === 'function');

	(xtraMethods || [])
		.concat(methods)
		.forEach(k => this[k] = stub(k));

	proto
		.filter(k => typeof proto[k] !== 'function')
		.forEach(k => this[k] = proto[k])
}

SyncPreloader.prototype.readyResolve = function(instance) {
	return Promise.all(this.queue.map(([key, args, defer]) => {
		return instance[key](...args).then(defer.resolve, defer.reject)
	}))
}




console.log(`started at ${Date.now()}`)

// fake async class we want to preload
function Database() {}
Database.prototype.init = function() {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, 4000)
	})
}

Database.fetchCount = 0;
Database.prototype.fetch = function() {
	const id = Database.fetchCount++;
	console.log(`[${id}] start at ${Date.now()}`)
	return new Promise((resolve, reject) => {
		setTimeout(function() {
			console.log(`[${id}] end at ${Date.now()}`)
			resolve()
		}, 2000)
	})
}



// relies on being able to update `db` name
var db = new SyncPreloader(Database)
const realdb = new Database();


db.fetch().then(null, function(err) {
	console.log(err)
})

db.fetch()
.then(() => db.fetch())
.then(() => db.fetch(), function(err) {
	console.log(err)
})


realdb.init().then(function() {
	const preloader = db
	db = realdb
	return preloader.readyResolve(db)
}, function(err) {
	console.log(err)
})
