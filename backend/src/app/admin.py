from pathlib import Path
from starlette.requests import Request
from starlette.responses import RedirectResponse
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend

from app.config import settings
from app.database import sync_engine
from app.features.products.models import Product
from app.features.cart.models import CartItem
from app.features.users.models import User

TEMPLATES_DIR = Path(__file__).parent / "templates"


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        email = form.get("username")
        password = form.get("password")
        if email == settings.admin_email and password == settings.admin_password:
            request.session.update({"token": "admin-authed"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("token") == "admin-authed"


class ProductAdmin(ModelView, model=Product):
    name = "Producto"
    name_plural = "Productos"
    icon = "fa-solid fa-box"
    column_list = [Product.id, Product.name, Product.category, Product.price, Product.original_price, Product.stock, Product.rating, Product.image]
    column_searchable_list = [Product.name, Product.description]
    column_sortable_list = [Product.id, Product.price, Product.stock, Product.rating, Product.name]
    form_excluded_columns = []
    form_choices = {
        Product.category: [
            ("Audio", "🎧 Audio"),
            ("Gaming", "🎮 Gaming"),
            ("Monitores", "🖥️ Monitores"),
            ("Accesorios", "🔌 Accesorios"),
            ("Cámaras", "📷 Cámaras"),
        ],
    }
    form_widget_args = {
        Product.image: {"placeholder": "https://images.unsplash.com/photo-..."},
        Product.description: {"rows": 3},
    }
    column_labels = {
        Product.original_price: "Precio original",
        Product.image: "URL de imagen",
        Product.stock: "Stock",
    }


class CartItemAdmin(ModelView, model=CartItem):
    name = "Item Carrito"
    name_plural = "Items Carrito"
    icon = "fa-solid fa-cart-shopping"
    column_list = [CartItem.id, CartItem.product_id, CartItem.quantity, CartItem.created_at]
    column_sortable_list = [CartItem.id, CartItem.created_at]


class UserAdmin(ModelView, model=User):
    name = "Usuario"
    name_plural = "Usuarios"
    icon = "fa-solid fa-user"
    column_list = [User.id, User.email, User.full_name, User.created_at]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.id, User.email, User.created_at]
    form_excluded_columns = [User.hashed_password]


def setup_admin(app):
    auth_backend = AdminAuth(secret_key=settings.secret_key)
    admin = Admin(
        app, sync_engine,
        title="Market Admin",
        templates_dir=str(TEMPLATES_DIR),
        authentication_backend=auth_backend,
    )
    admin.add_view(ProductAdmin)
    admin.add_view(CartItemAdmin)
    admin.add_view(UserAdmin)
    return admin
