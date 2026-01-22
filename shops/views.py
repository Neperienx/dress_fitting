from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from .forms import ShopCreateForm, ShopJoinForm
from .models import Shop, ShopMembership


def home(request):
    return render(request, "home.html")


@login_required
def dashboard(request):
    return render(request, "dashboard.html")


@login_required
def shop_setup(request):
    if request.user.shop and request.method == "GET":
        messages.info(request, "Your account is already assigned to a shop.")
        return redirect("dashboard")

    create_form = ShopCreateForm(prefix="create")
    join_form = ShopJoinForm(prefix="join")

    if request.method == "POST":
        action = request.POST.get("action")
        if action == "create":
            create_form = ShopCreateForm(request.POST, prefix="create")
            if create_form.is_valid():
                shop = Shop.objects.create(name=create_form.cleaned_data["name"])
                request.user.shop = shop
                request.user.save(update_fields=["shop"])
                ShopMembership.objects.get_or_create(user=request.user, shop=shop)
                messages.success(request, "Shop created. You are now assigned to it.")
                return redirect("dashboard")
        elif action == "join":
            join_form = ShopJoinForm(request.POST, prefix="join")
            if join_form.is_valid():
                shop = Shop.objects.filter(id=join_form.cleaned_data["code"]).first()
                if not shop:
                    join_form.add_error("code", "We couldn't find a shop with that code.")
                else:
                    request.user.shop = shop
                    request.user.save(update_fields=["shop"])
                    ShopMembership.objects.get_or_create(user=request.user, shop=shop)
                    messages.success(request, "You're now connected to the shop.")
                    return redirect("dashboard")
        else:
            messages.error(request, "Choose an action to create or join a shop.")

    return render(
        request,
        "shops/shop_setup.html",
        {
            "create_form": create_form,
            "join_form": join_form,
        },
    )
