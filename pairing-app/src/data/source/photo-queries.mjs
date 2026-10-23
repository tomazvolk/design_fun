/*
 * Pexels search terms per ingredient. The default is the ingredient's name; list an ingredient here when its
 * name alone finds the wrong thing ("orange" finds orange things, "port" finds harbours).
 *
 *   id: "search words"                 use these words instead of the name
 *   id: { query: "...", pick: 2 }      use these words and take the third result (0 is the first)
 *   id: { pick: 1 }                    keep the name, take the second result
 *
 * After editing, run `pnpm photos` again: changed searches are fetched again, changed picks need no request.
 * `pnpm photos:review` writes photo-review.html with every ingredient's result and its alternatives numbered.
 */
export const PHOTO_QUERIES = {
  // vegetables
  tomato: "tomatoes", onion: "onions", "red-onion": "red onions", shallot: "shallots", leek: "leeks", scallion: "spring onions",
  potato: "potatoes", "sweet-potato": "sweet potatoes", carrot: "carrots", beet: "beetroot", spinach: "spinach leaves",
  "brussels-sprout": "brussels sprouts", "bell-pepper": "bell peppers", corn: "corn on the cob", pea: "green peas",
  "fava-bean": "fava beans", "green-bean": "green beans", radish: "radishes", squash: "butternut squash", turnip: "turnips",
  chard: "swiss chard", mushroom: "mushrooms", shiitake: "shiitake mushrooms", morel: "morel mushrooms", "bok-choy": "bok choy",
  // fruit
  orange: "orange fruit", "blood-orange": "blood orange sliced", lemon: "lemons", lime: "limes", apple: "apples", pear: "pears",
  fig: "fresh figs", cherry: "cherries", strawberry: "strawberries", raspberry: "raspberries", blueberry: "blueberries",
  blackberry: "blackberries", peach: "peaches", apricot: "apricots", banana: "bananas", date: "medjool dates",
  cranberry: "cranberries", melon: "cantaloupe melon", raisin: "raisins", plum: "plums", grape: "grapes",
  gooseberry: "gooseberries", "passion-fruit": "passion fruit", coconut: "coconut halves",
  // herbs and spices
  basil: "fresh basil", mint: "fresh mint leaves", parsley: "fresh parsley", dill: "fresh dill", thyme: "fresh thyme",
  sage: "sage leaves", tarragon: "tarragon herb", chervil: "chervil herb", marjoram: "marjoram herb", "bay-leaf": "bay leaves",
  chile: "red chili peppers", cumin: "cumin seeds", "coriander-seed": "coriander seeds", paprika: "paprika powder",
  turmeric: "turmeric root", ginger: "ginger root", cinnamon: "cinnamon sticks", cardamom: "cardamom pods",
  clove: "cloves spice", nutmeg: "whole nutmeg", "fennel-seed": "fennel seeds", saffron: "saffron threads",
  "black-pepper": "black peppercorns", salt: "sea salt flakes", caraway: "caraway seeds", sumac: "sumac spice",
  "za-atar": "zaatar spice", "curry-leaf": "curry leaves", "lime-leaf": "kaffir lime leaves", juniper: "juniper berries",
  allspice: "allspice berries", lavender: "lavender flowers", rose: "rose petals", "orange-blossom": "orange blossom flowers",
  elderflower: "elderflower", fenugreek: "fenugreek seeds", anise: "anise seeds", "poppy-seed": "poppy seeds",
  "five-spice": "star anise cinnamon spices", "ras-el-hanout": "moroccan spice market", "garam-masala": "indian spices",
  "curry-powder": "curry powder",
  // meat and fish
  chicken: "roast chicken", duck: "duck breast", turkey: "roast turkey", beef: "raw beef", pork: "pork chop",
  sausage: "sausages", lamb: "lamb chops", rabbit: "rabbit stew", venison: "venison steak", liver: "chicken liver pate",
  goose: "roast goose", goat: "goat curry", merguez: "merguez sausage", fish: "fish fillet", salmon: "salmon fillet",
  tuna: "tuna steak", cod: "cod fillet", "sea-bass": "sea bass fish", scallop: "scallops", oyster: "oysters", clam: "clams",
  anchovy: "anchovies", sole: "sole fish", herring: "herring fish", egg: "eggs",
  // dairy
  cream: "pouring cream", milk: "glass of milk", cheese: "cheese board", "brown-butter": "browned butter pan",
  "crème-fraîche": "creme fraiche", "sour-cream": "sour cream", "goat-cheese": "goat cheese", "blue-cheese": "blue cheese",
  "cream-cheese": "cream cheese", pecorino: "pecorino cheese", gruyere: "gruyere cheese", cotija: "crumbled white cheese",
  // grains, nuts, pantry
  bread: "sourdough bread", pasta: "dry pasta", rice: "uncooked rice", risotto: "risotto", pita: "pita bread",
  tortilla: "corn tortillas", chickpea: "chickpeas", lentil: "lentils", bean: "white beans", "black-bean": "black beans",
  almond: "almonds", hazelnut: "hazelnuts", walnut: "walnuts", pecan: "pecans", pistachio: "pistachios", "pine-nut": "pine nuts",
  peanut: "peanuts", cashew: "cashews", chestnut: "roasted chestnuts", sesame: "sesame seeds", "pumpkin-seed": "pumpkin seeds",
  "olive-oil": "olive oil", olive: "olives bowl", caper: "capers", mustard: "mustard jar", horseradish: "horseradish root",
  vinegar: "vinegar bottle", "balsamic-vinegar": "balsamic vinegar", "sherry-vinegar": "vinegar", "cider-vinegar": "apple cider vinegar",
  "rice-vinegar": "rice vinegar", sugar: "sugar cubes", "brown-sugar": "brown sugar", "maple-syrup": "maple syrup",
  molasses: "molasses", caramel: "caramel sauce", chocolate: "dark chocolate", "white-chocolate": "white chocolate",
  cocoa: "cocoa powder", vanilla: "vanilla pods", coffee: "coffee beans", tea: "loose leaf tea", "soy-sauce": "soy sauce",
  "fish-sauce": "fish sauce", miso: "miso paste", harissa: "harissa paste", pesto: "pesto sauce", hollandaise: "hollandaise sauce",
  vinaigrette: "salad dressing", "preserved-lemon": "preserved lemons", tamarind: "tamarind pods", "coconut-milk": "coconut milk",
  "condensed-milk": "condensed milk", truffle: "black truffle", pickles: "pickles jar", "hot-sauce": "hot sauce",
  seaweed: "nori seaweed", "oyster-sauce": "oyster sauce", hoisin: "hoisin sauce", flour: "flour", pastry: "puff pastry",
  meringue: "meringues", custard: "custard", "ice-cream": "ice cream scoop", shortbread: "shortbread cookies",
  // drinks
  "red-wine": "red wine glass", "white-wine": "white wine glass", champagne: "champagne glass", sherry: "sherry glass",
  brandy: "brandy snifter", rum: "rum glass", gin: "gin and tonic", vodka: "vodka", tequila: "tequila shot",
  bourbon: "bourbon whiskey", whisky: "whisky glass", beer: "beer glass", cider: "cider glass", port: "port wine glass",
  madeira: "fortified wine glass", amaretto: "amaretto", campari: "campari spritz", pernod: "pastis glass",
  kirsch: "cherry brandy", sake: "sake cup",
};

const normalize = (v) => (typeof v === "string" ? { query: v } : v ?? {});
export function queryFor(id, name) { return normalize(PHOTO_QUERIES[id]).query ?? name; }
export function pickFor(id) { return normalize(PHOTO_QUERIES[id]).pick ?? 0; }
