// Graceful image fallback: when no real product photo can be found, infer a
// food category from the item's name and show a representative icon instead of
// a generic placeholder (or, worse, a mismatched photo). Pure client-side
// keyword matching — works for both typed and store-picked items, NL + EN.
//
// Real images always take priority; this only runs when imgStatus is "error".

export interface FoodCategory {
  /** stable id */
  id: string;
  /** emoji shown as the icon */
  emoji: string;
  /** human label (alt text / aria) */
  label: string;
  /** lowercase keywords/stems matched against the product name */
  keywords: string[];
}

// Order matters: the first category with a keyword hit wins, so put more
// specific categories before broad ones (e.g. "drinks" before generic).
const CATEGORIES: FoodCategory[] = [
  {
    id: "dairy",
    emoji: "🥛",
    label: "Dairy",
    keywords: [
      "melk", "milk", "kaas", "cheese", "yoghurt", "yogurt", "kwark", "boter",
      "butter", "room", "cream", "slagroom", "vla", "karnemelk", "feta",
      "mozzarella", "brie", "parmezaan", "parmesan", "gouda", "kwarktaart",
    ],
  },
  {
    id: "eggs",
    emoji: "🥚",
    label: "Eggs",
    keywords: ["ei", "eieren", "egg", "eggs"],
  },
  {
    id: "meat",
    emoji: "🥩",
    label: "Meat",
    keywords: [
      "vlees", "meat", "kip", "chicken", "rund", "beef", "varken", "pork",
      "gehakt", "mince", "worst", "sausage", "worstjes", "spek", "bacon",
      "ham", "biefstuk", "steak", "schnitzel", "kipfilet", "shoarma",
      "speklap", "rookworst", "frikandel", "kroket", "saucijs", "hamburger",
      "filet", "lamsvlees", "kalkoen", "turkey",
    ],
  },
  {
    id: "fish",
    emoji: "🐟",
    label: "Fish",
    keywords: [
      "vis", "fish", "zalm", "salmon", "tonijn", "tuna", "garnaal", "garnalen",
      "shrimp", "haring", "kabeljauw", "cod", "makreel", "mosselen", "mussels",
      "schol", "sardines", "paling", "forel", "trout",
    ],
  },
  {
    id: "vegetables",
    emoji: "🥦",
    label: "Vegetables",
    keywords: [
      "groente", "vegetable", "sla", "lettuce", "tomaat", "tomato", "komkommer",
      "cucumber", "paprika", "pepper", "ui", "onion", "wortel", "carrot",
      "broccoli", "bloemkool", "cauliflower", "spinazie", "spinach", "champignon",
      "champignons", "mushroom", "aardappel", "potato", "aardappelen", "courgette",
      "zucchini", "aubergine", "prei", "leek", "knoflook", "garlic", "boon",
      "bonen", "bean", "erwt", "pea", "mais", "corn", "kool", "cabbage",
      "andijvie", "rucola", "spruitjes", "asperge", "asparagus", "biet", "radijs",
      "selderij", "celery", "pompoen", "pumpkin", "avocado",
    ],
  },
  {
    id: "fruit",
    emoji: "🍎",
    label: "Fruit",
    keywords: [
      "fruit", "appel", "apple", "banaan", "banana", "sinaasappel", "orange",
      "peer", "pear", "druif", "druiven", "grape", "aardbei", "strawberry",
      "framboos", "raspberry", "bes", "bessen", "berry", "kiwi", "mango",
      "ananas", "pineapple", "meloen", "melon", "citroen", "lemon", "limoen",
      "lime", "perzik", "peach", "nectarine", "pruim", "plum", "kers", "cherry",
      "mandarijn", "clementine", "grapefruit", "abrikoos", "apricot", "vijg",
    ],
  },
  {
    id: "bakery",
    emoji: "🍞",
    label: "Bakery",
    keywords: [
      "brood", "bread", "stokbrood", "baguette", "bolletje", "broodje", "bun",
      "croissant", "beschuit", "cracker", "knäckebröd", "toast", "bagel",
      "wrap", "tortilla", "naan", "pita", "krentenbol", "ontbijtkoek", "muffin",
      "donut", "taart", "cake", "gebak", "koek", "koekje", "cookie", "biscuit",
    ],
  },
  {
    id: "pasta_rice",
    emoji: "🍝",
    label: "Pasta & rice",
    keywords: [
      "pasta", "spaghetti", "macaroni", "penne", "fusilli", "lasagne",
      "tagliatelle", "noedels", "noodles", "rijst", "rice", "risotto",
      "couscous", "quinoa", "bulgur", "mie",
    ],
  },
  {
    id: "drinks",
    emoji: "🥤",
    label: "Drinks",
    keywords: [
      "cola", "fris", "frisdrank", "soda", "limonade", "sap", "juice", "drinken",
      "drink", "water", "spa", "ice tea", "icetea", "ranja", "siroop", "tonic",
      "energy", "redbull", "fanta", "sprite", "seven up", "dubbelfris",
    ],
  },
  {
    id: "coffee_tea",
    emoji: "☕",
    label: "Coffee & tea",
    keywords: [
      "koffie", "coffee", "thee", "tea", "espresso", "cappuccino", "latte",
      "senseo", "nespresso", "douwe egberts", "pickwick",
    ],
  },
  {
    id: "alcohol",
    emoji: "🍷",
    label: "Alcohol",
    keywords: [
      "bier", "beer", "wijn", "wine", "rosé", "rose", "champagne", "prosecco",
      "whisky", "wodka", "vodka", "rum", "gin", "likeur", "liquor", "pils",
      "speciaalbier", "aperol", "martini",
    ],
  },
  {
    id: "snacks",
    emoji: "🍫",
    label: "Snacks & sweets",
    keywords: [
      "chips", "crisps", "chocolade", "chocolate", "snoep", "candy", "drop",
      "winegum", "haribo", "reep", "nootjes", "noten", "nuts", "pinda", "peanut",
      "popcorn", "zoutjes", "borrelnoot", "stroopwafel", "pepernoten", "speculaas",
      "m&m", "snickers", "mars", "twix", "kitkat", "bonbon", "pinda's",
    ],
  },
  {
    id: "frozen",
    emoji: "🧊",
    label: "Frozen",
    keywords: [
      "diepvries", "frozen", "ijs", "ice cream", "pizza", "patat", "friet",
      "fries", "loempia", "bitterbal", "vissticks", "ijsje", "magnum", "ben",
    ],
  },
  {
    id: "breakfast",
    emoji: "🥣",
    label: "Breakfast",
    keywords: [
      "muesli", "granola", "cornflakes", "cruesli", "havermout", "oatmeal",
      "ontbijt", "pap", "brinta", "hagelslag", "pindakaas", "jam", "honing",
      "honey", "vlokken", "ontbijtgranen", "cereal",
    ],
  },
  {
    id: "pantry",
    emoji: "🥫",
    label: "Pantry",
    keywords: [
      "saus", "sauce", "ketchup", "mayonaise", "mayo", "mosterd", "mustard",
      "olie", "oil", "azijn", "vinegar", "zout", "salt", "peper", "pepper",
      "suiker", "sugar", "bloem", "flour", "meel", "blik", "can", "soep", "soup",
      "bouillon", "kruiden", "spice", "specerij", "conserven", "pesto", "curry",
      "sambal", "ketjap", "sojasaus", "tomatenpuree", "passata",
    ],
  },
  {
    id: "household",
    emoji: "🧻",
    label: "Household",
    keywords: [
      "wc papier", "toiletpapier", "toilet", "keukenrol", "tissue", "zakdoek",
      "afwasmiddel", "wasmiddel", "schoonmaak", "cleaning", "detergent",
      "vuilniszak", "afval", "spons", "sponge", "allesreiniger", "bleek",
      "luier", "diaper", "tandpasta", "toothpaste", "shampoo", "zeep", "soap",
      "deodorant", "scheermes",
    ],
  },
];

// Default when nothing matches — a neutral cart/basket marker.
export const DEFAULT_CATEGORY: FoodCategory = {
  id: "other",
  emoji: "🛒",
  label: "Other",
  keywords: [],
};

/**
 * Infer a food category from a product name via keyword matching.
 * Returns DEFAULT_CATEGORY when nothing matches. Whole-word aware so "ei"
 * doesn't match inside "kweistjes" etc.
 */
export function categoryForName(name: string): FoodCategory {
  const lower = ` ${name.toLowerCase()} `;
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      // word-boundary match for short keywords, substring for longer ones
      if (kw.length <= 3) {
        if (lower.includes(` ${kw} `) || lower.includes(` ${kw}s `)) return cat;
      } else if (lower.includes(kw)) {
        return cat;
      }
    }
  }
  return DEFAULT_CATEGORY;
}
