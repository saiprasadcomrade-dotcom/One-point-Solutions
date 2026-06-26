import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('electro_cart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('electro_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (device) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === device.id);
      if (existing) {
        return prev.map(item =>
          item.id === device.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...device, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
  };
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.daily_rate * item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
