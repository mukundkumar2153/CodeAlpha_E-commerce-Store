import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          Code<span>Alpha</span> Shop
        </Link>

        <nav className="nav-links">
          <Link to="/">Catalog</Link>
          <Link to="/cart" className="cart-badge">
            Cart {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/orders">Orders</Link>
              {user.role === "admin" && <Link to="/admin">Admin</Link>}
              <button className="link-btn" onClick={handleLogout}>
                Logout ({user.name.split(" ")[0]})
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
