# I want to print all combinations of a range 1-5.  lets say [1,2,3,4,5]
# how can I print, 
# 1
# 12
# 123
# 1234
# 1235
# 12345
# 23
# 234
# etc....


# bahaha, don't actually do this
w = lambda *x: [[x[0],*y] for y in w(*x[1:])] + list(w(*x[1:])) if x else [x]
w(*range(1, 6))