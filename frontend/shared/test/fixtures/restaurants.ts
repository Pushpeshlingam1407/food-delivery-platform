export const mockRestaurants = [
  {
    id: "rest-1",
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: "4.8",
    image: "pizza.jpg",
    is_active: true,
  },
  {
    id: "rest-2",
    name: "Burger Joint",
    cuisine: "American",
    rating: "4.5",
    image: "burger.jpg",
    is_active: true,
  }
];

export const mockMenuItems = [
  {
    id: "menu-1",
    restaurant_id: "rest-1",
    name: "Margherita Pizza",
    description: "Classic cheese pizza",
    price: "15.00",
    is_available: true,
  },
  {
    id: "menu-2",
    restaurant_id: "rest-1",
    name: "Pepperoni Pizza",
    description: "Spicy pepperoni pizza",
    price: "18.00",
    is_available: true,
  }
];

export const mockCartData = {
  items: [
    { menu_id: "menu-1", name: "Margherita Pizza", price: "15.00", quantity: 1 }
  ]
};
