import requests

def pretty_print_request(request):
	print('{}\n{}\n{}\n\n{}'.format(
		'-----------REQUEST-----------',
		request.method + ' ' + request.url,
		'\n'.join('{}: {}'.format(k, v) for k, v in request.headers.items()),
		request.body,
	))

def pretty_print_response(response):
	print('{}\n{} {}\n{}\n\n{}'.format(
		'-----------RESPONSE-----------',
		response.status_code,
		response.reason,
		'\n'.join('{}: {}'.format(k, v) for k, v in response.headers.items()),
		response.text,
	))


def getVerbose(s, *args, **kwargs):
	"""
	This acts like requests.Request, but takes session instance as
	first parameter and prints request/response representations.
	"""
	req = requests.Request(*args, **kwargs)
	prepared_request = req.prepare()
	pretty_print_request(prepared_request)
	response = s.send(prepared_request)
	pretty_print_response(response)
	return response


s = requests.Session()
getVerbose(s,'GET','http://example.com',headers={'X-Whatever':'example header'},data='foo=bar&baz=spam')
