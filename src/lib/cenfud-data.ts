import burgerImage from "@/assets/restaurant-burger.jpg";
import biryaniImage from "@/assets/restaurant-biryani.jpg";
import pizzaImage from "@/assets/restaurant-pizza.jpg";

export type Restaurant = {
  id: string; name: string; cuisine: string; rating: number; reviews: number;
  time: string; fee: number; minOrder: number; image: string; offer: string; isOpen: boolean;
};
export type FoodItem = {
  id: string; restaurantId: string; restaurant: string; name: string; description: string;
  price: number; rating: number; veg: boolean; bestseller?: boolean; image: string;
};

export const categories = [
  ["Pizza", "🍕"], ["Burgers", "🍔"], ["Biryani", "🍛"], ["Chicken", "🍗"],
  ["South Indian", "🥘"], ["Healthy", "🥗"], ["Desserts", "🍰"], ["Beverages", "🥤"],
] as const;

export const restaurants: Restaurant[] = [
  { id: "spice-route", name: "Spice Route", cuisine: "North Indian · Biryani", rating: 4.8, reviews: 2140, time: "25–30 min", fee: 29, minOrder: 149, image: biryaniImage, offer: "50% OFF up to ₹120", isOpen: true },
  { id: "pizza-nation", name: "Pizza Nation", cuisine: "Pizza · Italian", rating: 4.7, reviews: 1680, time: "20–25 min", fee: 0, minOrder: 199, image: pizzaImage, offer: "Free delivery", isOpen: true },
  { id: "burger-house", name: "Burger House", cuisine: "Burgers · Fast Food", rating: 4.6, reviews: 980, time: "30–35 min", fee: 39, minOrder: 129, image: burgerImage, offer: "20% OFF", isOpen: true },
  { id: "chennai-bites", name: "Chennai Bites", cuisine: "South Indian · Beverages", rating: 4.5, reviews: 1240, time: "25–35 min", fee: 19, minOrder: 99, image: biryaniImage, offer: "₹100 OFF", isOpen: true },
  { id: "urban-tandoor", name: "Urban Tandoor", cuisine: "Tandoor · Mughlai", rating: 4.6, reviews: 760, time: "35–40 min", fee: 45, minOrder: 199, image: burgerImage, offer: "Combo deals", isOpen: false },
  { id: "green-bowl", name: "Green Bowl", cuisine: "Healthy · Salads", rating: 4.7, reviews: 520, time: "20–30 min", fee: 25, minOrder: 149, image: pizzaImage, offer: "Free drink", isOpen: true },
];

export const foodItems: FoodItem[] = [
  { id: "hyderabadi-biryani", restaurantId: "spice-route", restaurant: "Spice Route", name: "Hyderabadi Chicken Biryani", description: "Dum-cooked basmati rice, tender chicken and house spices.", price: 289, rating: 4.9, veg: false, bestseller: true, image: biryaniImage },
  { id: "paneer-pizza", restaurantId: "pizza-nation", restaurant: "Pizza Nation", name: "Tandoori Paneer Pizza", description: "Smoky paneer, peppers, mozzarella and mint drizzle.", price: 349, rating: 4.8, veg: true, bestseller: true, image: pizzaImage },
  { id: "paneer-burger", restaurantId: "burger-house", restaurant: "Burger House", name: "Grilled Paneer Burger", description: "Charred paneer, cheese, greens and coriander chutney.", price: 229, rating: 4.7, veg: true, image: burgerImage },
  { id: "chicken-burger", restaurantId: "burger-house", restaurant: "Burger House", name: "Fiery Chicken Burger", description: "Crisp chicken, spicy aioli, onion and crunchy lettuce.", price: 249, rating: 4.6, veg: false, image: burgerImage },
];
