export const calculateTotalPrice = (
  cart: ICart | Record<string, any>,
  restaurantId?: string | null,
): number => {
  if (!restaurantId) return 0;
  const restaurantCart = cart?.[restaurantId];
  if (!restaurantCart || !restaurantCart.items) return 0;
  return Object.values(restaurantCart.items).reduce(
    (sum: number, item: any) => {
      const price = Number(
        item?.data?.price ||
          item?.data?.basePrice ||
          item?.data?.productPrice ||
          0,
      );
      const quantity = Number(item?.quantity || 0);
      return sum + price * quantity;
    },
    0,
  );
};

export const calculateTotalQuantity = (
  cart: ICart | Record<string, any>,
  restaurantId?: string | null,
): number => {
  if (!restaurantId) return 0;
  const restaurantCart = cart?.[restaurantId];
  if (!restaurantCart || !restaurantCart.items) return 0;
  return Object.values(restaurantCart.items).reduce(
    (total: number, item: any) => total + Number(item?.quantity || 0),
    0,
  );
};

export const getItemQuantity = (
  cart: ICart | Record<string, any>,
  restaurantId: string | undefined | null,
  itemId: string,
): number => {
  if (!restaurantId) return 0;
  return cart?.[restaurantId]?.items?.[itemId]?.quantity || 0;
};
