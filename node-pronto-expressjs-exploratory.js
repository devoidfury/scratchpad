
const port = 8000
const app = pronto()


// logger middleware, which logs the response status for each request
app.use(function(req, res, next) {
    const originalEnd = res.end
    res.end = function(...args) {
        originalEnd.apply(res, args)
        console.log(`${req.method} ${req.url} - ${res.statusCode}`)
    }
    next()
})


// basic route, this responds "hello world" to a request at http://localhost:8000
app.get('/', function(req, res, next) {
    res.end('hello, world')
})


// middleware that serves static assets
app.use('/static/', function(req, res, next) {
    var path = 'public/' + req.url.substring('/static/'.length)
    path = path.replace(/\/\.\./g, '') // protect from DAT
    fs.exists(path, function(exists) {
        if (!exists) return next();
        fs.createReadStream(path).pipe(res);
    })
})

// example of mounting a whole app or router
{
  const sub_app = pronto()
  sub_app.get('/test', function(req, res){
      res.end('hello from another app')
  })
  app.use('/sub-app', sub_app.handler)
}


// this middleware will either end the request early or call next,
// passing control down the middleware stack
function randomlyEndRouteMiddleware(req, res, next) {
    if (Math.random() * 2 | 0) {
        next()
    } else {
        res.end('ended early')
    }
}

app.get('/two', randomlyEndRouteMiddleware, function(req, res, next) {
    res.end('called next')
})


app.get('/error', function(req, res, next) {
    next(new Error('some error'))
})


// fire it up
app.listen(port, () => console.log(`listening on port ${port}`))



// example express-like implementation
function pronto() {
    // the stack holds each middleware function, which will be called in order for each request
    const stack = []
    // app is the server application object we're handing back from `pronto()`
    const app = {}

    // this pushes a function onto the middleware stack.
    //
    // optionally a prefix path is supplied, in which case we wrap the function
    // with mountPathPrefix
    app.use = function use(path, fn) {
        if (typeof path === 'function') {
            stack.push(path)
        } else {
            stack.push(mountPathPrefix(path, fn))
        }
        return app;
    }

    // this checks that the request path contains the supplied `prefix`, and if so
    // calls the middleware function `fn`, otherwise continues down the middleware
    // stack via `next()`
    function mountPathPrefix(prefix, fn) {
        return function(req, res, next) {
            if (req.path.indexOf(prefix) === 0) {
                fn(req, res, next, prefix)
            } else {
                next()
            }
        }
    }

    // this adds a "route" onto the middleware stack, which can have several functions attached
    // a route only executes if the http `verb` and request `path` match;
    // otherwise skip forward with `next()`
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

    // this next part adds the shorthands for https methods via .get, .post, and some others
    const shorthands = [
        ['get', 'GET'],
        ['post', 'POST'],
        ['put', 'PUT'],
        ['patch', 'PATCH'],
        ['del', 'DELETE'],
    ]
    for (const [property, httpverb] of shorthands) {
      app[property] = (path, ...fns) => app.route(httpverb, path, fns)
    }

    // a generator is a handy way to iterate over the middleware stack functions in
    // a callback/async friendly way
    function* dispatch() {
        for (const route of stack)
            yield route
    }

    // this is the main handler function passed into the node httpServer
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

        // begin iterating the middleware stack
        next()

        function next(err) {
            if (err)
                return app.errorHandler(err, request, response)

            // if there is another route to run, run it, and catch any sync errors
            const route = dispatcher.next().value
            if (route) {
              try {
                route(request, response, next)
              } catch(e) {
                next(e)
              }
              return
            }
            // else, no remaining middleware functions in this application instance

            // parentNext is available if the application is mounted onto another
            // application as middleware, but not if it's the primary application.
            if (parentNext) {
                if (mountPoint) {
                    request.baseUrl = request.baseUrl.substring(0, request.baseUrl.length - mountPoint.length)
                    request.path = request.url.substring(request.baseUrl.length)
                }
                return parentNext()
            }

            // finally 404 after exhausting the middleware stack and having no parent
            app.notfound(request, response)
        }
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
