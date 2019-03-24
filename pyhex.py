#!/usr/bin/env python3
import argparse
import inspect
from string import whitespace
from signal import signal, SIGPIPE, SIG_DFL

class ByteViewer:
	"""
	class for viewing a slice of the hexadecimal byte values in a file,
	by displaying the byte values as hex numbers instead of whatever encoding
	they may be in (ascii or utf-8, typically, for a text file)
	"""
	def __init__(self, input_file, nbytes=0, offset=0, line_length=16):
		self.file = input_file
		self.nbytes = nbytes
		self.offset = offset
		self.line_length = line_length
		self.fmt_str = '{:%s}| {}' % (line_length*2 + line_length//2)

	def __iter__(self):
		"""initialize iterator and return iterator (this instance).
		(iterator protocol)"""
		self.file.seek(self.offset)
		return self

	def __next__(self) -> str:
		"""returns the next item in sequence.
		(iterator protocol)"""
		out = self.read_line()
		if not out:
			raise StopIteration()
		return out

	def read_line(self) -> str:
		"""Reads a fully formatted line from the file."""
		raw_bytes = self.read_raw()
		return self.format_line(raw_bytes) if raw_bytes else ''

	def read_raw(self) -> list:
		"""Reads a raw line from the file."""
		raw_bytes = []
		for _ in range(self.line_length):
			byte = self.file.read(1)
			if self.at_end or not byte:
				break
			raw_bytes.append(byte)
		return raw_bytes

	def format_line(self, raw_bytes) -> str:
		"""Formats a line for pretty printing."""
		raw_line = bytes.join(b'', raw_bytes).decode('ascii', 'replace')
		raw_line = ''.join('.' if c in whitespace else c for c in raw_line)
		chars = ''.join(format(ord(byte), '02x') for byte in raw_bytes)
		hex_str = ' '.join(chars[i:i+4] for i in range(0, len(chars), 4))
		return self.fmt_str.format(hex_str, raw_line)

	@property
	def at_end(self) -> bool:
		"""Indicates that iteration should halt, past the end of the slice"""
		if self.nbytes:
			return self.file.tell() > (self.nbytes + self.offset)
		return False



def arg_parser(defaults):
	parser = argparse.ArgumentParser(description='simple file hex viewer.')
	parser.add_argument('file',
		type=argparse.FileType('rb'),
		help='a file to examine')
	parser.add_argument('-n', '--nbytes',
		type=int,
		default=defaults['nbytes'],
		help='number of bytes to print')
	parser.add_argument('-l', '--line-length',
		type=int,
		default=defaults['line_length'],
		help='number of bytes to print on each line')
	parser.add_argument('-o', '--offset',
		type=int,
		default=defaults['offset'],
		help='number of bytes to skip')
	return parser.parse_args()


def get_fn_defaults(fn):
	args = inspect.getfullargspec(fn)
	names_with_defaults = args.args[-len(args.defaults):]
	defaults = dict(zip(names_with_defaults, args.defaults))
	return defaults


if __name__ == '__main__':
	# don't throw an error if no process is reading stdout, just quit
	# (eg when piping to the head command)
	signal(SIGPIPE, SIG_DFL)
	args = arg_parser(get_fn_defaults(ByteViewer))
	viewer = ByteViewer(args.file, args.nbytes, args.offset, args.line_length)
	for line in viewer:
		print(line)
