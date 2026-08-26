import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Header from "./components/Header/Header.jsx";

import Home from "./pages/Home.jsx";
import Category from "./pages/Category.jsx";
import Product from "./pages/Product.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Search from "./pages/Search.jsx";
import NotFound from "./pages/NotFound.jsx";

import OrderSuccess from "./pages/OrderSuccess.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminCategories from "./pages/AdminCategories.jsx";
import AdminRates from "./pages/AdminRates.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import ProtectedAdminRoute from "./pages/ProtectedAdminRoute.jsx";

import { OrderProvider } from "./context/OrderContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <OrderProvider>

          <Header />

          <Routes>

            {/* =========================
                CUSTOMER WEBSITE
            ========================== */}

            <Route
              path="/"
              element={<Home />}
            />

            <Route
             path="/category"
             element={<Category />}
             />

            <Route
             path="/category/:slug"
             element={<Category />}
            />
            <Route
             path="/category"
             element={<Category />}
            />
            <Route
              path="/product/:id"
              element={<Product />}
            />
            
            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            <Route
              path="/cart"
              element={<Cart />}
            />

            <Route
              path="/checkout"
              element={<Checkout />}
            />

            <Route
              path="/about"
              element={<About />}
            />

            <Route
              path="/contact"
              element={<Contact />}
            />

            <Route
              path="/search"
              element={<Search />}
            />

            <Route
              path="/order-success/:orderId"
              element={<OrderSuccess />}
            />


            {/* =========================
                ADMIN LOGIN
            ========================== */}

            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />


            {/* =========================
                PROTECTED ADMIN AREA
            ========================== */}

            <Route element={<ProtectedAdminRoute />}>

              <Route
                path="/admin"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/products"
                element={<AdminProducts />}
              />

              <Route
                path="/admin/categories"
                element={<AdminCategories />}
              />

              <Route
                path="/admin/rates"
                element={<AdminRates />}
              />

              <Route
                path="/admin/orders"
                element={<AdminOrders />}
              />

            </Route>


            {/* =========================
                404
            ========================== */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

        </OrderProvider>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;