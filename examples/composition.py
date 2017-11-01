from functools import reduce

def _compose(f, g):
    def _wrapped(*args):
        return f(g(*args))
    return _wrapped

def compose(*fns):
    return reduce(_compose, fns)


from operator import itemgetter

def add4(x):
    return x + 4

print(max([[0, 3], [0,-20], [0, 17]], key=compose(abs, add4, itemgetter(1))))
