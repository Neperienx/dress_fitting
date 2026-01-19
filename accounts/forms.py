from django import forms
from allauth.account.forms import SignupForm

from accounts.models import User


class RoleSignupForm(SignupForm):
    role = forms.ChoiceField(
        choices=(
            (User.Role.OWNER, "Owner"),
            (User.Role.MANAGER, "Admin"),
            (User.Role.STYLIST, "Stylist"),
        ),
        label="Role",
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        base_classes = (
            "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm "
            "focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
        )
        for field in self.fields.values():
            existing_classes = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = f"{existing_classes} {base_classes}".strip()

    def save(self, request):
        user = super().save(request)
        user.role = self.cleaned_data["role"]
        user.save()
        return user
