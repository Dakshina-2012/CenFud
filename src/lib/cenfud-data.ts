import burgerImage from "@/assets/restaurant-burger.jpg";
import biryaniImage from "@/assets/restaurant-biryani.jpg";
import pizzaImage from "@/assets/restaurant-pizza.jpg";

export type Restaurant = {
  id: string; name: string; cuisine: string; rating: number; reviews: number;
  time: string; fee: number; minOrder: number; image: string; offer: string; isOpen: boolean;
};
export type FoodItem = {
  id: string; restaurantId: string; restaurant: string; name: string; description: string;
  price: number; rating: number; veg: boolean; bestseller?: boolean; image: string; category: string;
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
  // Spice Route — North Indian · Biryani (7)
  { id: "hyderabadi-biryani", restaurantId: "spice-route", restaurant: "Spice Route", name: "Hyderabadi Chicken Biryani", description: "Dum-cooked basmati rice, tender chicken and house spices.", price: 289, rating: 4.9, veg: false, bestseller: true, image: biryaniImage, category: "Biryani" },
  { id: "mutton-biryani", restaurantId: "spice-route", restaurant: "Spice Route", name: "Mutton Dum Biryani", description: "Slow-cooked mutton layered with saffron rice and fried onions.", price: 349, rating: 4.8, veg: false, image: biryaniImage, category: "Biryani" },
  { id: "veg-biryani", restaurantId: "spice-route", restaurant: "Spice Route", name: "Subz Veg Biryani", description: "Garden vegetables, paneer and aromatic basmati, served with raita.", price: 229, rating: 4.6, veg: true, image: biryaniImage, category: "Biryani" },
  { id: "butter-chicken", restaurantId: "spice-route", restaurant: "Spice Route", name: "Butter Chicken", description: "Creamy tomato gravy with charred tandoori chicken pieces.", price: 319, rating: 4.8, veg: false, bestseller: true, image: burgerImage, category: "Chicken" },
  { id: "paneer-butter-masala", restaurantId: "spice-route", restaurant: "Spice Route", name: "Paneer Butter Masala", description: "Soft paneer in a rich makhani gravy, best with naan.", price: 269, rating: 4.7, veg: true, image: pizzaImage, category: "Healthy" },
  { id: "gulab-jamun", restaurantId: "spice-route", restaurant: "Spice Route", name: "Gulab Jamun (4 pc)", description: "Warm khoya dumplings soaked in rose-cardamom syrup.", price: 129, rating: 4.7, veg: true, image: pizzaImage, category: "Desserts" },
  { id: "masala-lassi", restaurantId: "spice-route", restaurant: "Spice Route", name: "Masala Lassi", description: "Chilled churned yogurt with roasted cumin and mint.", price: 89, rating: 4.5, veg: true, image: biryaniImage, category: "Beverages" },
  // Pizza Nation — Pizza · Italian (7)
  { id: "paneer-pizza", restaurantId: "pizza-nation", restaurant: "Pizza Nation", name: "Tandoori Paneer Pizza", description: "Smoky paneer, peppers, mozzarella and mint drizzle.", price: 349, rating: 4.8, veg: true, bestseller: true, image: pizzaImage, category: "Pizza" },
  { id: "margherita-pizza", restaurantId: "pizza-nation", restaurant: "Pizza Nation", name: "Classic Margherita", description: "San Marzano tomato, fresh basil and double mozzarella.", price: 249, rating: 4.6, veg: true, image: pizzaImage, category: "Pizza" },
  { id: "chicken-pepperoni-pizza", restaurantId: "pizza-nation", restaurant: "Pizza Nation", name: "Chicken Pepperoni Pizza", description: "Spicy chicken pepperoni over a cheesy hand-tossed base.", price: 399, rating: 4.7, veg: false, image: pizzaImage, category: "Pizza" },
  { id: "farmhouse-pizza", restaurantId: "pizza-nation", restaurant: "Pizza Nation", name: "Farmhouse Veggie Pizza", description: "Mushrooms, sweet corn, capsicum, onion and olives.", price: 329, rating: 4.5, veg: true, image: pizzaImage, category: "Pizza" },
  { id: "garlic-bread", restaurantId: "pizza-nation", restaurant: "Pizza Nation", name: "Cheesy Garlic Bread", description: "Golden garlic breadsticks loaded with mozzarella.", price: 149, rating: 4.6, veg: true, image: burgerImage, category: "Burgers" },
  { id: "choco-lava-cake", restaurantId: "pizza-nation", restaurant: "Pizza Nation", name: "Choco Lava Cake", description: "Molten chocolate center cake, baked fresh.", price: 109, rating: 4.8, veg: true, bestseller: true, image: pizzaImage, category: "Desserts" },
  { id: "virgin-mojito", restaurantId: "pizza-nation", restaurant: "Pizza Nation", name: "Virgin Mojito", description: "Mint, lime and soda over crushed ice.", price: 99, rating: 4.4, veg: true, image: biryaniImage, category: "Beverages" },
  // Burger House — Burgers · Fast Food (7)
  { id: "paneer-burger", restaurantId: "burger-house", restaurant: "Burger House", name: "Grilled Paneer Burger", description: "Charred paneer, cheese, greens and coriander chutney.", price: 229, rating: 4.7, veg: true, image: burgerImage, category: "Burgers" },
  { id: "chicken-burger", restaurantId: "burger-house", restaurant: "Burger House", name: "Fiery Chicken Burger", description: "Crisp chicken, spicy aioli, onion and crunchy lettuce.", price: 249, rating: 4.6, veg: false, bestseller: true, image: burgerImage, category: "Burgers" },
  { id: "double-cheese-burger", restaurantId: "burger-house", restaurant: "Burger House", name: "Double Cheese Blast Burger", description: "Two patties, double cheese, house sauce and pickles.", price: 299, rating: 4.7, veg: false, image: burgerImage, category: "Burgers" },
  { id: "crispy-chicken-wings", restaurantId: "burger-house", restaurant: "Burger House", name: "Crispy Chicken Wings (6 pc)", description: "Tossed in smoky barbecue glaze with sesame.", price: 279, rating: 4.6, veg: false, image: burgerImage, category: "Chicken" },
  { id: "peri-fries", restaurantId: "burger-house", restaurant: "Burger House", name: "Peri Peri Fries", description: "Crispy fries dusted with peri peri spice mix.", price: 129, rating: 4.5, veg: true, image: burgerImage, category: "Healthy" },
  { id: "oreo-shake", restaurantId: "burger-house", restaurant: "Burger House", name: "Oreo Thickshake", description: "Creamy vanilla shake blended with Oreo crumble.", price: 159, rating: 4.7, veg: true, image: biryaniImage, category: "Beverages" },
  { id: "brownie-sundae", restaurantId: "burger-house", restaurant: "Burger House", name: "Brownie Fudge Sundae", description: "Warm brownie, vanilla scoop and hot chocolate fudge.", price: 189, rating: 4.8, veg: true, image: pizzaImage, category: "Desserts" },
  // Chennai Bites — South Indian · Beverages (7)
  { id: "ghee-roast-dosa", restaurantId: "chennai-bites", restaurant: "Chennai Bites", name: "Ghee Roast Dosa", description: "Crisp golden dosa roasted in ghee, with chutney and sambar.", price: 149, rating: 4.8, veg: true, bestseller: true, image: biryaniImage, category: "South Indian" },
  { id: "idli-vada-combo", restaurantId: "chennai-bites", restaurant: "Chennai Bites", name: "Idli Vada Combo", description: "Two soft idlis and a crispy medu vada with sambar.", price: 99, rating: 4.6, veg: true, image: biryaniImage, category: "South Indian" },
  { id: "masala-dosa", restaurantId: "chennai-bites", restaurant: "Chennai Bites", name: "Mysore Masala Dosa", description: "Spicy red chutney dosa stuffed with potato masala.", price: 139, rating: 4.7, veg: true, image: biryaniImage, category: "South Indian" },
  { id: "chettinad-chicken", restaurantId: "chennai-bites", restaurant: "Chennai Bites", name: "Chettinad Chicken Curry", description: "Fiery Chettinad-style chicken with black pepper and curry leaves.", price: 289, rating: 4.7, veg: false, image: burgerImage, category: "Chicken" },
  { id: "pongal", restaurantId: "chennai-bites", restaurant: "Chennai Bites", name: "Ven Pongal", description: "Comforting rice-lentil pongal with ghee, pepper and cashew.", price: 109, rating: 4.5, veg: true, image: biryaniImage, category: "South Indian" },
  { id: "filter-coffee", restaurantId: "chennai-bites", restaurant: "Chennai Bites", name: "Filter Coffee", description: "Strong decoction coffee frothed with hot milk.", price: 59, rating: 4.8, veg: true, image: biryaniImage, category: "Beverages" },
  { id: "payasam", restaurantId: "chennai-bites", restaurant: "Chennai Bites", name: "Semiya Payasam", description: "Vermicelli kheer with cardamom, cashews and raisins.", price: 99, rating: 4.6, veg: true, image: pizzaImage, category: "Desserts" },
  // Urban Tandoor — Tandoor · Mughlai (6)
  { id: "tandoori-chicken", restaurantId: "urban-tandoor", restaurant: "Urban Tandoor", name: "Tandoori Chicken (Half)", description: "Clay-oven roasted chicken marinated overnight in spices.", price: 329, rating: 4.8, veg: false, bestseller: true, image: burgerImage, category: "Chicken" },
  { id: "chicken-tikka", restaurantId: "urban-tandoor", restaurant: "Urban Tandoor", name: "Murgh Malai Tikka", description: "Creamy cheese-marinated chicken tikka, char-grilled.", price: 309, rating: 4.7, veg: false, image: burgerImage, category: "Chicken" },
  { id: "paneer-tikka", restaurantId: "urban-tandoor", restaurant: "Urban Tandoor", name: "Paneer Tikka Angara", description: "Smoky spiced paneer cubes with peppers and onion.", price: 269, rating: 4.6, veg: true, image: pizzaImage, category: "Healthy" },
  { id: "dal-makhani", restaurantId: "urban-tandoor", restaurant: "Urban Tandoor", name: "Dal Makhani", description: "Black lentils simmered 12 hours with butter and cream.", price: 219, rating: 4.7, veg: true, image: biryaniImage, category: "Healthy" },
  { id: "rumali-roti-basket", restaurantId: "urban-tandoor", restaurant: "Urban Tandoor", name: "Rumali Roti Basket", description: "Four paper-thin rumali rotis, brushed with butter.", price: 89, rating: 4.4, veg: true, image: burgerImage, category: "South Indian" },
  { id: "phirni", restaurantId: "urban-tandoor", restaurant: "Urban Tandoor", name: "Kesar Phirni", description: "Chilled saffron rice pudding served in a clay bowl.", price: 119, rating: 4.6, veg: true, image: pizzaImage, category: "Desserts" },
  // Green Bowl — Healthy · Salads (6)
  { id: "buddha-bowl", restaurantId: "green-bowl", restaurant: "Green Bowl", name: "Rainbow Buddha Bowl", description: "Quinoa, roasted veggies, chickpeas and tahini dressing.", price: 279, rating: 4.8, veg: true, bestseller: true, image: pizzaImage, category: "Healthy" },
  { id: "grilled-chicken-salad", restaurantId: "green-bowl", restaurant: "Green Bowl", name: "Grilled Chicken Salad", description: "Herb-grilled chicken over greens with citrus vinaigrette.", price: 299, rating: 4.7, veg: false, image: pizzaImage, category: "Healthy" },
  { id: "paneer-wrap", restaurantId: "green-bowl", restaurant: "Green Bowl", name: "Whole Wheat Paneer Wrap", description: "Spiced paneer and crunchy veggies in a whole wheat wrap.", price: 199, rating: 4.5, veg: true, image: burgerImage, category: "Healthy" },
  { id: "sprout-chaat", restaurantId: "green-bowl", restaurant: "Green Bowl", name: "Protein Sprout Chaat", description: "Sprouted moong, pomegranate, cucumber and lemon.", price: 149, rating: 4.6, veg: true, image: biryaniImage, category: "Healthy" },
  { id: "green-smoothie", restaurantId: "green-bowl", restaurant: "Green Bowl", name: "Green Detox Smoothie", description: "Spinach, apple, cucumber and ginger, cold-blended.", price: 139, rating: 4.5, veg: true, image: biryaniImage, category: "Beverages" },
  { id: "fruit-yogurt-parfait", restaurantId: "green-bowl", restaurant: "Green Bowl", name: "Fruit Yogurt Parfait", description: "Greek yogurt layered with seasonal fruit and granola.", price: 169, rating: 4.7, veg: true, image: pizzaImage, category: "Desserts" },
];
