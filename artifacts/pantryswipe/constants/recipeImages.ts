const LOCAL: Record<string, ReturnType<typeof require>> = {
  "recipe-pasta":    require("@/assets/images/recipe-pasta.png"),
  "recipe-salmon":   require("@/assets/images/recipe-salmon.png"),
  "recipe-bowl":     require("@/assets/images/recipe-bowl.png"),
  "recipe-bibimbap": require("@/assets/images/recipe-bibimbap.png"),
};

const W = "?auto=compress&cs=tinysrgb&w=800";
const P = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg${W}`;

export const RECIPE_PHOTO_URLS: Record<string, string> = {
  "5":  P(704569),    // Avocado Toast
  "6":  P(2474661),   // Chicken Tikka Masala
  "7":  P(2087748),   // Tacos al Pastor
  "8":  P(1099680),   // Green Smoothie Bowl
  "9":  P(884600),    // Beef Ramen
  "10": P(1640772),   // Overnight Oats
  "11": P(5409006),   // Shakshuka
  "12": P(3026808),   // Thai Green Curry
  "13": P(1437267),   // Mushroom Risotto
  "14": P(1351238),   // Banana Pancakes
  "15": P(1211887),   // Greek Salad
  "16": P(699953),    // Pad Thai
  "17": P(2097090),   // Chicken Caesar Salad
  "18": P(1639561),   // Pulled Pork Sliders
  "19": P(2338407),   // Vegetable Stir Fry
  "20": P(461198),    // Beef Mince Tacos
  "21": P(539451),    // French Onion Soup
  "22": P(2116094),   // Teriyaki Chicken Bowl
  "23": P(1640774),   // Caprese Salad
  "24": P(769289),    // Lamb Chops
  "25": P(1640775),   // Loaded Nachos
  "p1": P(1603901),   // Prawn Fried Rice
  "p2": P(1639557),   // Mini Beef Burgers
  "p3": P(3026804),   // Chocolate Lava Cake
  "p4": P(1143754),   // Eggs Benedict
  "p5": P(3737270),   // Palak Paneer
  "p6": P(5560763),   // Dal Tadka
  "p7": P(2474661),   // Butter Chicken
  "p8": P(1640777),   // Aloo Gobi
  "p9": P(1640776),   // Lamb Biryani
};

const SOCIAL_FALLBACKS = [
  P(1279330), P(1640777), P(704569),  P(884600),
  P(2474661), P(1351238), P(699953),  P(2087748),
  P(2097090), P(1603901),
];

export function getRecipeImageSource(
  image: string | null,
  recipeId: string,
): { uri: string } | ReturnType<typeof require> | null {
  if (image) {
    if (image.startsWith("http")) return { uri: image };
    return LOCAL[image] ?? null;
  }
  const url = RECIPE_PHOTO_URLS[recipeId];
  return url ? { uri: url } : null;
}

export function getSocialImageSource(
  image: string | null,
  postIndex: number,
  linkedRecipeId?: string,
): { uri: string } | ReturnType<typeof require> | null {
  if (image) {
    if (image.startsWith("http")) return { uri: image };
    return LOCAL[image] ?? null;
  }
  if (linkedRecipeId) {
    const url = RECIPE_PHOTO_URLS[linkedRecipeId];
    if (url) return { uri: url };
  }
  return { uri: SOCIAL_FALLBACKS[postIndex % SOCIAL_FALLBACKS.length] };
}
