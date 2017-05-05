from django import forms


class GeoPostForm(forms.Form):
    """
    Form for GeoPost model.
    """
    uuid = forms.UUIDField()
    title = forms.CharField(max_length=30)
    body = forms.CharField()
    wfsxml = forms.CharField()
    photo = forms.ImageField()
