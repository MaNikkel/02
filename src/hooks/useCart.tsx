import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('cart-items')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: { id, title, price, image } } = await api.get(`/products/${productId}`)
      const index = cart.findIndex(cart => cart.id === productId)
      if (index >= 0) {
        const newCart = cart
        newCart[index].amount += 1
        setCart([...newCart])
      } else {
        setCart([ ...cart, { amount: 1, id, image, price, title } ])
      }
    } catch {
      toast('Erro')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = cart.filter(cart => cart.id !== productId)
      setCart(newCart)
    } catch {
      toast('Erro')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const index = cart.findIndex(cart => cart.id === productId)
      const newCart = cart
      newCart[index].amount += amount
      setCart([...newCart])
    } catch {
      toast('Erro')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
