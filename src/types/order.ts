export const ORDER_STATUS = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
  DELIVERED: 'delivered',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];