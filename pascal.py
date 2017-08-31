# example recursive map implementation
def mymap(fn, targets):
	def map(source, dest):
		if not source:
			return dest
		dest.append(fn(source[0]))
		return map(source[1:], dest)
	return map(targets, [])

# this has some limits, namely that it doesn't handle all iterables.
# a better solution might look like:
def mymap(fn, targets):
	return (fn(item) for item in targets)
# however at that point, it's likely clearer to just use the generator
# expression inline


DEPTH = 15

def calc_num(parent):
	def _calc_num(idx):
		x = (parent[idx - 1] or 0) if idx > 0 else 0
		y = parent[idx] if idx < len(parent) else 0
		return max(x + y, 1)
	return _calc_num


def make_tri(prev_total, depth=5):
	parent = prev_total[-1] if prev_total else []
	total = prev_total + [list(map(calc_num(parent), range(len(prev_total) + 1)))]
	return make_tri(total, depth=depth-1) if depth > 1 else total

rows = make_tri([], depth=10)
maxmagnitude = len(str(max(rows[-1])))
maxlen = maxmagnitude * len(rows) + len(rows) - 1

def fmt_value(i):
	return ("{: ^%i}" % maxmagnitude).format(i)

def fmt_row(row):
	return ("{: ^%i}" % maxlen).format(' '.join(map(fmt_value, row)))

print('\n'.join(map(fmt_row, rows)))
