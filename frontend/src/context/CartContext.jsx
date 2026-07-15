import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } catch (error) {
      // silent fail, cart stays as is
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error("Please log in to add items to your cart");
      return;
    }
    try {
      const { data } = await api.post("/cart", { productId, quantity });
      setCart(data.cart);
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add to cart");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setCart(data.cart);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update cart");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCart(data.cart);
      toast.success("Removed from cart");
    } catch (error) {
      toast.error("Could not remove item");
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart");
      setCart([]);
    } catch (error) {
      // ignore
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
