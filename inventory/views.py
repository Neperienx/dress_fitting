from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from accounts.permissions import require_manager_or_owner
from .forms import DressForm
from .models import Dress, DressImage


@login_required
@require_manager_or_owner
def dress_list(request):
    if not (request.user.is_staff or request.user.is_superuser) and not request.user.shop:
        messages.error(
            request,
            "Assign a shop to this account before managing dresses.",
        )
        return redirect("shop_setup")
    if request.user.is_staff or request.user.is_superuser:
        dresses = Dress.objects.all().order_by("name")
    else:
        dresses = Dress.objects.filter(shop=request.user.shop).order_by("name")
    dresses = dresses.prefetch_related("images")
    return render(request, "inventory/dress_list.html", {"dresses": dresses})


@login_required
@require_manager_or_owner
def dress_create(request):
    if not (request.user.is_staff or request.user.is_superuser) and not request.user.shop:
        messages.error(
            request,
            "Assign a shop to this account before adding dresses.",
        )
        return redirect("shop_setup")
    if request.method == "POST":
        form = DressForm(request.POST, request.FILES)
        if form.is_valid():
            dress = form.save(commit=False)
            dress.shop = request.user.shop
            dress.save()
            DressImage.objects.create(
                dress=dress,
                image=form.cleaned_data["image"],
                alt_text=dress.name,
            )
            return redirect("dress_list")
    else:
        form = DressForm()
    return render(request, "inventory/dress_form.html", {"form": form, "title": "New Dress"})


@login_required
@require_manager_or_owner
def dress_edit(request, dress_id: int):
    if not (request.user.is_staff or request.user.is_superuser) and not request.user.shop:
        messages.error(
            request,
            "Assign a shop to this account before editing dresses.",
        )
        return redirect("shop_setup")
    if request.user.is_staff or request.user.is_superuser:
        dress = get_object_or_404(Dress, id=dress_id)
    else:
        dress = get_object_or_404(Dress, id=dress_id, shop=request.user.shop)
    if request.method == "POST":
        form = DressForm(request.POST, request.FILES, instance=dress)
        if form.is_valid():
            form.save()
            image = form.cleaned_data.get("image")
            if image:
                DressImage.objects.create(
                    dress=dress,
                    image=image,
                    alt_text=dress.name,
                )
            return redirect("dress_list")
    else:
        form = DressForm(instance=dress)
    return render(request, "inventory/dress_form.html", {"form": form, "title": "Edit Dress"})
