from django.urls import re_path
from . import views

urlpatterns = [
        re_path(r'^$', views.Home.as_view(), name='geopost_home'),
        re_path(r'^entry/$', views.Entry.as_view(), name='geopost_entry'),
        re_path(r'^photo/(?P<entry_uuid>[0-9A-Fa-f-]+)$',
            views.photo,
            name="geopost_photo"),
        re_path(r'^delete/$', views.delete, name='geopost_delete'),
        re_path(r'^vantechy/$', views.vantechy, name='geopost_vantechy')
]
