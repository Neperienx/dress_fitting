from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from accounts.permissions import require_manager_or_owner
from .forms import DressForm
from .models import Dress


@login_required
@require_manager_or_owner
def dress_list(request):
    dresses = Dress.objects.filter(shop=request.user.shop).order_by("name")
    return render(request, "inventory/dress_list.html", {"dresses": dresses})


@login_required
@require_manager_or_owner
def dress_create(request):
    if request.method == "POST":
        form = DressForm(request.POST)
        if form.is_valid():
            dress = form.save(commit=False)
            dress.shop = request.user.shop
            dress.save()
            return redirect("dress_list")
    else:
        form = DressForm()
    return render(request, "inventory/dress_form.html", {"form": form, "title": "New Dress"})


@login_required
@require_manager_or_owner
def dress_edit(request, dress_id: int):
    dress = get_object_or_404(Dress, id=dress_id, shop=request.user.shop)
    if request.method == "POST":
        form = DressForm(request.POST, instance=dress)
        if form.is_valid():
            form.save()
            return redirect("dress_list")
    else:
        form = DressForm(instance=dress)
    return render(request, "inventory/dress_form.html", {"form": form, "title": "Edit Dress"})
