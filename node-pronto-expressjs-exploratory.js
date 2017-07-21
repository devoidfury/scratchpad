const port = 8000;



var app = pronto()

// logger middleware, which logs the result status
app.use(function(req, res, next) {
    const originalEnd = res.end
    res.end = function(...args) {
        originalEnd.apply(res, args)
        console.log(`${req.method} ${req.url} - ${res.statusCode}`)
    }
    next()
})


// example of mounting a whole app or router
var testrouter = pronto().get('/test', (req, res) => res.end('YAY'));
app.use('/what', testrouter.handler)

// serve static assets
app.use('/static/', function(req, res, next) {
    var path = 'public/' + req.url.substring('/static/'.length)
    path = path.replace(/\/\.\./g, '') // protect from DAT
    fs.exists(path, function(exists) {
        if (!exists) return next();
        fs.createReadStream(path).pipe(res);
    })
})

function randomlyEndRouteMiddleware(req, res, next) {
    if (Math.random() * 10 < 5) {
        next()
    } else {
        res.end('ended first function')
    }
}

app.get('/two', randomlyEndRouteMiddleware, function(req, res, next) {
    res.end('ended second function')
})

app.get('/', function(req, res, next) {
    res.end('hello, world')
})

app.get('/error', function(req, res, next) {
    next(new Error('some error'))
})

app.listen(port, () => console.log(`listening on port ${port}`))


// example express-like implementation
function pronto() {
    const stack = []
    const app = {}

    function mountPathPrefix(path, fn) {
        return function(req, res, next) {
            if (req.path.indexOf(path) === 0) {
                fn(req, res, next, path)
            } else {
                next()
            }
        }
    }

    app.use = function use(path, fn) {
        if (typeof path === 'function') {
            stack.push(path)
        } else {
            stack.push(mountPathPrefix(path, fn))
        }
        return app;
    }

    app.route = function route(verb, path, fns) {
        for (const fn of fns) {
            stack.push(function(req, res, next) {
                if (req.path === path && req.method === verb) {
                    fn(req, res, next, path)
                } else {
                    next()
                }
            })
        }
        return app;
    }

    const shorthands = [
        ['get', 'GET'],
        ['post', 'POST'],
        ['put', 'PUT'],
        ['patch', 'PATCH'],
        ['del', 'DELETE'],
    ]

    for (const [property, httpverb] of shorthands) {
        app[property] = function(path, ...fns) {
            return app.route(httpverb, path, fns)
        }
    }

    function* dispatch() {
        for (const route of stack)
            yield route
    }

    app.handler = function handler(request, response, parentNext, mountPoint) {
        const dispatcher = dispatch()

        // generic storage for passing data from middleware easily
        if (!parentNext) {
            request.originalUrl = request.url
            request.locals = {}
        }

        // allow mounting an app on an app, like an express Router
        request.baseUrl = mountPoint ? request.baseUrl + mountPoint : '';
        request.path = request.url.substring(request.baseUrl.length)

        function next(err) {
            if (err)
                return app.errorHandler(err, request, response)

            const route = dispatcher.next().value
            if (route)
                return route(request, response, next)

            // no matches, either pass back up to parent app or run the 404

            if (parentNext) {
                if (mountPoint) {
                    request.baseUrl = request.baseUrl.substring(0, request.baseUrl.length - mountPoint.length)
                    request.path = request.url.substring(request.baseUrl.length)
                }
                return parentNext()
            }

            app.notfound(request, response)
        }
        next()
    }

    app.errorHandler = function(err, req, res) {
        console.error(err)
        // for default status, use generic server error
        if (res.statusCode === 200)
            res.statusCode = 500
        res.end('Internal Server Error')
    }

    app.notfound = function(req, res) {
        res.statusCode = 404
        res.end(`Cannot ${req.method} ${req.url}`)
    }

    app.listen = function(...args) {
        require('http').createServer(app.handler).listen(...args)
    }

    return app
}

