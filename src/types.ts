export interface FoodOrder {
  id: string;
  user_name: string;
  food_item: string;
  notes?: string;
  created_at?: string;
}

export interface OrderState {
  orders: FoodOrder[];
}