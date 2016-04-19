import json
import time
import httplib2
import apiclient
from django.http import HttpResponse
from apiclient.http import MediaIoBaseUpload
from oauth2client.client import GoogleCredentials

def upload_to_bucket(file, bucket, mimetype, id):
	"""
	SUCCESS: return None
	ERROR: return http error code
	"""
	credentials = GoogleCredentials.get_application_default()
	service = apiclient.discovery.build('storage', 'v1', credentials=credentials)
	image = MediaIoBaseUpload(file, mimetype=mimetype, resumable=True)
	req = service.objects().insert(
		bucket=bucket,
		media_body=image, 
		name=id)
	# PROCESS UPLOAD IN CHUNKS
	resp = None
	serverErrorCount = 0 # to prevent infinite loop
	while resp is None:
		try:
			status, resp = req.next_chunk()
		# IF SERVER ERROR, TRY CHUNK AGAIN
		except apiclient.errors.HttpError as e:
			# IF 5xx ERROR RETRY
			if e.resp.status in [500, 502, 503, 504]:
				# Check how many retries have happened
				if serverErrorCount > 8:
					return e.resp.status
				else:
					time.sleep(1 + (serverErrorCount*0.3)) # sleep it off
					serverErrorCount += 1
					continue
			# If OTHER ERROR, RETURN IT IMMEDIATELY
			else:
				return e.resp.status
	# IF NO ERROR, RETURN NONE
	return None

def download_from_bucket(uuid, bucket):
	"""
	Download object named uuid from bucket. 
	SUCCESS: return metadata dict, unencoded file str
	ERROR: return http error code
	"""
	credentials = GoogleCredentials.get_application_default()
	service = apiclient.discovery.build('storage', 'v1', credentials=credentials)
	try:
		reqMeta = service.objects().get(bucket=bucket, object=uuid)
		respMeta = reqMeta.execute()
		reqContent = service.objects().get_media(bucket=bucket, object=uuid)
		respContent = reqContent.execute()
		return respMeta, respContent
	except apiclient.errors.HttpError as e:
		return e.resp.status

def delete_from_bucket(uuid, bucket):
	"""
	SUCCESS: return None
	HTTP ERROR: return error code
	"""
	credentials = GoogleCredentials.get_application_default()
	service = apiclient.discovery.build('storage', 'v1', credentials=credentials)
	try:
		req = service.objects().delete(bucket=bucket, object=uuid)
		resp = req.execute()
		return None
	except apiclient.errors.HttpError as e:
		return e.resp.status

def post_to_geoserver(xml, url):
	"""
	SUCCESS: return None
	WFS ERROR: return str error code
	"""
	h = httplib2.Http()
	h.follow_all_redirects = True
	auth = ''
	with open('/django/geoserver_proxy_header.txt', 'r') as a:
		auth = a.readlines()[0].strip()
	headers = {
		'Content-Type': 'application/xml',
		auth: ' zach'
	}
	try:
		resp, content = h.request(url, method="POST", body=xml, headers=headers)
		decodedContent = content.decode('utf-8')
		if 'ows:ExceptionReport' in decodedContent:
			return decodedContent
		else:
			return None
	except ConnectionRefusedError as e:
		return e

def get_from_geoserver(url):
	"""
	"""
	h = httplib2.Http()
	h.follow_all_redirects = True
	try:
		resp, content = h.request(url, method="GET")
		return content.decode('utf-8')
	except ConnectionRefusedError as e:
		return e

def server_error(errorMsg):
	"""
	Shorthand for returning error message.
	"""
	resp = HttpResponse(status=502)
	resp.write("<h3>502 BAD GATEWAY: </h3>")
	resp.write("<p>ERROR: {}</p>".format(errorMsg))
	return resp
