from django import forms


class ShopCreateForm(forms.Form):
    name = forms.CharField(max_length=255, label="Shop name")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_base_styles()

    def _apply_base_styles(self) -> None:
        base_classes = (
            "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm "
            "focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
        )
        for field in self.fields.values():
            existing_classes = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = f"{existing_classes} {base_classes}".strip()


class ShopJoinForm(forms.Form):
    code = forms.UUIDField(label="Shop code")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_base_styles()

    def _apply_base_styles(self) -> None:
        base_classes = (
            "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm "
            "focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-300"
        )
        for field in self.fields.values():
            existing_classes = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = f"{existing_classes} {base_classes}".strip()
