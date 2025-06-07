import { createContext, useState } from 'react';

export const CommonContext = createContext();

export const ContextProvider = ({ children }) => {
  const [dataChanged, setDataChanged] = useState(false);
  const [cart, setCart] = useState([]);

  const triggerReload = () => setDataChanged((prev) => !prev);

  const addToCart = (item) => {
    const updatedCart = [...cart, item];
    setCart(updatedCart);
    console.log('Item added to cart:', item);
    console.log('Current cart:', updatedCart);
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
    console.log('Item removed from cart:', itemId);
    console.log('Current cart:', updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    console.log('Cart cleared');
  };

  return (
    <CommonContext.Provider
      value={{
        dataChanged,
        triggerReload,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};
