import base64
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, get_object_or_404
from django.views.generic import View
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from .forms import GeoPostForm
from projects.models import Project
from .view_helper import upload_to_bucket, delete_from_bucket, \
        post_to_geoserver, get_from_geoserver, download_from_bucket, \
        server_error

# CLASS BASED VIEWS


class GeoPostBase(View):
    """
    The Geopost base view class...
    """
    subnav_location = 'projects/geopost/subnav.html'
    curr_project = get_object_or_404(Project, slug='geopost')
    projectList = Project.objects.all().filter(active=True).order_by("title")
    wfsURL = "http://127.0.0.1:8080/geoserver/wfs"
    imageBucket = 'zachtestbucket'

    def getContext(self, form):
        """
        Shorthand way to compose context, for maximum reuse.
        """
        context = {
                'form': form,
                'projectList': self.projectList,
                'subnav_location': self.subnav_location,
                'curr_project': self.curr_project
        }
        return context


# Create your views here.
class Home(GeoPostBase):
    """
    The Geopost homepage view class.
    """

    def get(self, request):
        """
        The GET view method.
        """
        context = self.getContext(GeoPostForm())
        return render(request, 'geopost/home.html', context)


class Entry(LoginRequiredMixin, GeoPostBase):
    """
    The GeoPost view class for creating a new entry, or altering an
    existing one.
    """

    def get(self, request):
        """
        Render with blank form...
        """
        context = self.getContext(GeoPostForm())
        return render(request, 'geopost/entry.html', context)

    def post(self, request):
        """
        Process newly submitted GeoPost entry...

        PROCEEDURE
        1) Get data from POST body
        2) Validate form
        3) Upload photo to bucket
        4) Make WFS transaction with GeoServer
        """
        # GET REQUEST DATA
        fid = request.POST.get('fid', False)
        uuid = request.POST.get('uuid', False)
        title = request.POST.get('title', False)
        body = request.POST.get('body', False)
        photo = request.FILES.get('photo', False)  # FOR STORAGE
        wfsxml = request.POST.get('wfsxml', False)  # FOR GEOSERVER
        data = {
                'uuid': uuid,
                'title': title,
                'body': body,
                'wfsxml': wfsxml
        }
        # VALIDATE FORM
        form = GeoPostForm(data, request.FILES)
        # IF FORM VALIDATION ERROR
        if not form.is_valid():
            context = self.getContext(form)
            return render(request, 'geopost/entry.html', context)
        else:
            pass
        # GET CLEAN VALUES
        uuid = form.cleaned_data['uuid']
        wfsxml = form.cleaned_data['wfsxml']
        # UPLOAD PHOTO TO BUCKET
        # if editing existing entry, first delete existing photo
        if fid:
            delete_from_bucket(uuid, self.imageBucket)
        else:
            pass
        photo.open('rb')
        error = upload_to_bucket(
            photo, self.imageBucket, photo.content_type, uuid)
        photo.close()
        # IF ERROR UPLOADING IMAGE
        if error:
            return server_error(error)
        else:
            pass
        # MAKE GEOSERVER WFS TRANSACTION
        error = post_to_geoserver(wfsxml, self.wfsURL)
        # ALL GOOD
        if not error:
            return HttpResponseRedirect(reverse('geopost_home'))
        # IF WFS TRANSACTION ERROR
        else:
            delete_from_bucket(uuid, self.imageBucket)
            return server_error(error)


# METHOD BASED VIEWS
@login_required
@require_http_methods(["POST"])
def delete(request):
    """
    Delete an entry and its associated photo.  A workaround to AJAX.
    """
    wfsxml = request.POST.get('wfsxml', False)  # FOR GEOSERVER
    uuid = request.POST.get('uuid', False)
    # MAKE GEOSERVER WFS TRANSACTION
    error = post_to_geoserver(wfsxml, GeoPostBase.wfsURL)
    # ALL GOOD
    if error:
        return server_error(error)
    # IF WFS TRANSACTION ERROR
    else:
        pass
    # Delete photo from bucket
    delete_from_bucket(uuid, GeoPostBase.imageBucket)
    return HttpResponseRedirect(reverse('geopost_home'))


@require_http_methods(["GET"])
def photo(request, entry_uuid):
    """
    The GeoPost view method for retrieving photos
    """
    resp = HttpResponse()
    metadata, photo = download_from_bucket(entry_uuid, GeoPostBase.imageBucket)
    resp.write(base64.b64encode(photo))
    resp['Content-Type'] = metadata['contentType']
    return resp
