
(function() {
	var PENDING_STATE = 0x00;
	var FINAL_STATE = 0x01;
	var FUFILLED_STATE = 0x02;
	var REJECTED_STATE = 0x04;
	var QUEUED_STATE = 0x08;

	function DPromise(setup) {
		this._state = PENDING_STATE;
		this.value = undefined;

		this.resolve = this.resolve.bind(this);
		this.reject = this.reject.bind(this);

		this.onFulfilled = [];
		this.onRejected = [];

		if (typeof setup === 'function') {
			setup(this.resolve, this.reject);
		}
	}

	DPromise.prototype.resolve = function(result) {
		if (this._state & FINAL_STATE) return;
		_resolver(this, result);
		return this;
	};

	DPromise.prototype.reject = function(reason) {
		if (this._state & FINAL_STATE) return;
		this._state |= FINAL_STATE | REJECTED_STATE;
		this.value = reason;
		_callbacks(this);
		return this;
	};

	function _fulfill(dprom, result) {
		if (dprom._state & FINAL_STATE) return;
		dprom._state |= FINAL_STATE | FUFILLED_STATE;
		dprom.value = result;
		_callbacks(dprom);
	};

	function _chainResult(next, handler) {
		return function(val) {
			var result;
			try {
				result = handler(val);
			} catch (e) {
				return next.reject(e);
			}
			next.resolve(result);
		}
	}

	DPromise.prototype.then = function(success, fail) {
		var next = new DPromise();
		
		this.onFulfilled.push(typeof success === 'function' ?
			_chainResult(next, success) :
			next.resolve);

		this.onRejected.push(typeof fail === 'function' ?
			_chainResult(next, fail) :
			next.reject);

		_callbacks(this);
		return next;
	}

	function _callbacks(dprom) {
		var state = dprom._state;
		if (state & QUEUED_STATE || !(state & FINAL_STATE)) {
			return;
		}
		dprom.state |= QUEUED_STATE;
		// fires the pending fufillment/rejection handlers when the stack clears
		setTimeout(_execute_callbacks, 0, dprom);
	}

	function _execute_callbacks(dprom) {
		var cbs = (dprom._state & FUFILLED_STATE) ? dprom.onFulfilled : dprom.onRejected;
		var value = dprom.value;
		for (var i = 0; i < cbs.length; i++) {
			cbs[i](value);
		}
		cbs.length = 0;
		dprom.state &= ~QUEUED_STATE;
	}

	function _resolver(promise, x) {
		if (promise === x) {
			return promise.reject(
				new TypeError('A+ 2.3.1 promise and x refer to the same object'));
		}

		if (x instanceof DPromise) {
			// # 2.3.2 If x is a promise, adopt its state
			// shortcut for our own promise implementation
			x.onFulfilled.push(promise.resolve);
			x.onRejected.push(promise.reject);
			return _callbacks(x);
		}

		if (['function', 'object'].indexOf(typeof x) !== -1 && x !== null) {
			// # 2.3.3 check if x is thenable, and use it appropriately
			var then;
			try {
				then = x.then;
			} catch (e) {
				return promise.reject(e);
			}

			if (typeof then === 'function') {
				var handled = false;
				function resolvePromise(y) {
					if (handled) return;
					handled = true;
					promise.resolve(y);
				}

				function rejectPromise(reason) {
					if (handled) return;
					handled = true;
					promise.reject(reason);
				}

				try {
					return then.call(x, resolvePromise, rejectPromise);
				} catch(e) {
					if (handled) return; // # 2.3.3.3.4.1 if resolve/reject called, ignore error
					return promise.reject(e);
				}
			}
		}

		// otherwise fufill promise with x
		_fulfill(promise, x);
	}

	// aliases and helpers
	DPromise.resolve = DPromise.resolved = function(value) {
		return (new DPromise()).resolve(value);
	};

	DPromise.reject = DPromise.rejected = function(reason) {
		return (new DPromise()).reject(reason);
	};

	DPromise.deferred = function() {
		var promise = new DPromise();
		return {promise: promise, resolve: promise.resolve, reject: promise.reject};
	}


	if (typeof window !== 'undefined') {
		window.DPromise = DPromise;
	} else if (typeof exports !== 'undefined') {
		module.exports = DPromise;
	}
})();
