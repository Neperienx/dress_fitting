from django import forms
from .models import BrideSession


class BrideSessionForm(forms.ModelForm):
    class Meta:
        model = BrideSession
        fields = ["bride_name"]
