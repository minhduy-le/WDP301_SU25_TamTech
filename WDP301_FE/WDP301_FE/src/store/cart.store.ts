import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AddOn {
  productId: number;
  productTypeName: string;
  quantity: number;
  price: number;
}

interface CartItem {
  userId: number;
  productId: number;
  productName: string;
  addOns: AddOn[];
  quantity: number;
  price: number;
  totalPrice: number;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  getCartItemsByUserId: (userId: number) => CartItem[];
  clearCart: () => void;
  clearCartForUser: (userId: number) => void;
  updateCartItems: (items: CartItem[]) => void;
  removeFromCart: (userId: number, productId: number, addOns: AddOn[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (item) =>
        set((state) => {
          const existingCart = state.cartItems;
          const existingItemIndex = existingCart.findIndex(
            (cartItem) =>
              cartItem.userId === item.userId &&
              cartItem.productId === item.productId && // Use productId for uniqueness
              JSON.stringify(cartItem.addOns) === JSON.stringify(item.addOns)
          );
          if (existingItemIndex !== -1) {
            const updatedItems = [...existingCart];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity:
                updatedItems[existingItemIndex].quantity + item.quantity,
              totalPrice:
                updatedItems[existingItemIndex].totalPrice + item.totalPrice,
            };
            return { cartItems: updatedItems };
          }
          return { cartItems: [...existingCart, item] };
        }),

      getCartItemsByUserId: (userId: number) =>
        get().cartItems.filter((item) => item.userId === userId),

      clearCart: () => set({ cartItems: [] }),

      clearCartForUser: (userId: number) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.userId !== userId),
        })),

      updateCartItems: (items: CartItem[]) => set({ cartItems: items }),

      removeFromCart: (userId: number, productId: number, addOns: AddOn[]) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) =>
              !(
                item.userId === userId &&
                item.productId === productId &&
                JSON.stringify(item.addOns) === JSON.stringify(addOns)
              )
          ),
        })),
    }),
    {
      name: "cart-storage", // Name of the storage key in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    }
  )
);
