/*
 * Vegetables. Compact source format, compiled by scripts/build-graph.mjs.
 *   taste    : primary word first, optional secondary. Scores: primary 3, secondary 2, minor "x:1".
 *   weight   : 1 very light .. 5 heavy, "2-3" is a range (midpoint stored, range shown as a bar).
 *   volume   : 1 very quiet .. 5 very loud, same range rule.
 *   season   : "all" or a set of spring summer autumn winter.
 *   cuisines : cuisine group -> tier 1-4 (works .. holy grail).
 *   pairs    : "partner:tier" tokens. Undirected; the higher tier wins when both sides list it.
 */
const entries = {
  fennel: {
    name: "fennel", aliases: ["fennel bulb", "finocchio", "florence fennel"], cat: "vegetable",
    taste: "sweet bitter:1", weight: 2, volume: "2-3", season: "autumn winter", techniques: "braise grill raw roast shave",
    cuisines: { italian: 4, french: 3, mediterranean: 3 }, chips: ["Sicilian", "Provençal"], dishes: "salads soups stews roasts", art: "fennel",
    pairs: "orange:4 olive-oil:3 olive:3 lemon:3 garlic:3 parmesan:3 chicken:3 pork:2 sausage:2 chile:2 mint:2 thyme:2 tomato:2 white-wine:2 cream:2 butter:2 anchovy:2 sea-bass:2 salmon:2 shrimp:2 walnut:2 almond:1 apple:2 pear:1 grapefruit:2 blood-orange:3 onion:2 leek:1 potato:2 arugula:2 radicchio:2 goat-cheese:2 pecorino:2 vinegar:1 honey:1 tarragon:2 dill:2 parsley:2 black-pepper:2 salt:2 saffron:2 pernod:3 star-anise:1 cucumber:1 celery:1 beet:1 lamb:1 duck:1 scallop:2 mussels:2 cod:1 rice:1 egg:1 caper:2 coriander-seed:1 cumin:1 fennel-seed:3",
  },
  tomato: {
    name: "tomato", aliases: ["tomatoes", "cherry tomatoes", "plum tomato"], cat: "vegetable",
    taste: "sweet sour", weight: "2-3", volume: 3, season: "summer", techniques: "raw roast grill stew confit",
    cuisines: { italian: 4, mediterranean: 4, latin: 3, french: 3, "middle-eastern": 2, indian: 2 }, chips: ["Sicilian", "Provençal", "Greek", "Mexican"], dishes: "salads sauces soups pasta pizza salsas sandwiches", art: "tomato",
    pairs: "basil:4 mozzarella:4 olive-oil:4 garlic:4 onion:3 salt:3 balsamic-vinegar:3 bread:3 parmesan:3 oregano:3 anchovy:2 caper:2 olive:3 feta:3 cucumber:3 red-onion:2 chile:3 cilantro:3 lime:2 avocado:3 corn:2 egg:3 bacon:3 beef:2 lamb:2 chicken:2 shrimp:2 cod:1 tuna:2 eggplant:3 zucchini:3 bell-pepper:3 pasta:3 rice:2 cream:2 butter:2 ricotta:2 goat-cheese:2 thyme:2 parsley:2 tarragon:1 mint:1 cumin:2 coriander-seed:1 paprika:2 vinegar:2 honey:1 sugar:1 black-pepper:3 watermelon:2 peach:2 strawberry:1 fennel:2 celery:1 chickpea:2 lentil:2 bean:2 potato:2 saffron:1 vodka:2 red-wine:2 white-wine:1 pesto:3 harissa:2",
  },
  onion: {
    name: "onion", aliases: ["onions", "yellow onion", "brown onion"], cat: "vegetable",
    taste: "sweet hot:1", weight: 2, volume: "3-4", season: "all", techniques: "sauté caramelize roast raw pickle",
    cuisines: { french: 4, italian: 3, indian: 4, latin: 3, "middle-eastern": 3, "east-asian": 2, "se-asian": 2, mediterranean: 3 }, dishes: "soups stews sauces braises roasts salads sandwiches", art: "onion",
    pairs: "butter:4 garlic:4 thyme:3 bay-leaf:3 olive-oil:3 beef:3 chicken:3 pork:2 lamb:2 potato:3 carrot:3 celery:3 tomato:3 cream:2 cheese:3 gruyere:4 parmesan:2 bread:2 vinegar:2 balsamic-vinegar:3 sugar:2 honey:2 red-wine:3 white-wine:3 beer:2 black-pepper:3 salt:3 sage:2 rosemary:2 parsley:2 chile:2 cumin:3 coriander-seed:2 paprika:2 turmeric:2 ginger:2 egg:2 bacon:3 sausage:2 mushroom:3 bean:2 lentil:3 rice:2 raisin:1 apple:2 orange:1 mustard:2 anchovy:2 olive:2 goat-cheese:3 blue-cheese:2 liver:3 lemon:1",
  },
  "red-onion": {
    name: "red onion", aliases: ["purple onion"], cat: "vegetable",
    taste: "sweet hot:1", weight: 2, volume: 3, season: "all", techniques: "raw pickle grill roast",
    cuisines: { latin: 3, mediterranean: 3, indian: 2, "middle-eastern": 3 }, dishes: "salads salsas sandwiches tacos pickles", art: "onion",
    pairs: "lime:3 cilantro:3 tomato:2 cucumber:2 feta:3 olive:2 vinegar:3 orange:2 avocado:2 watermelon:2 chile:2 beet:2 goat-cheese:2 parsley:2 mint:2 sumac:3 lemon:2 olive-oil:2 bean:2 corn:2 pork:1 beef:1 fish:1 shrimp:1 honey:1 sugar:1 balsamic-vinegar:2 chickpea:2",
  },
  shallot: {
    name: "shallot", aliases: ["shallots", "eschalot"], cat: "vegetable",
    taste: "sweet hot:1", weight: 2, volume: 2, season: "all", techniques: "sauté raw mince fry",
    cuisines: { french: 4, "se-asian": 3, italian: 1 }, dishes: "sauces dressings salads stir-fries", art: "onion",
    pairs: "butter:4 white-wine:4 vinegar:3 tarragon:3 chives:2 parsley:2 thyme:2 cream:3 mushroom:3 beef:3 chicken:2 fish:2 oyster:3 scallop:2 mustard:2 lemon:2 olive-oil:2 garlic:2 ginger:2 chile:2 lemongrass:2 fish-sauce:2 lime:2 peanut:1 pork:2 beet:1 potato:2 egg:1 bacon:1 red-wine:3 brandy:2 black-pepper:2",
  },
  garlic: {
    name: "garlic", aliases: ["garlic cloves", "ajo"], cat: "vegetable",
    taste: "hot bitter:1", weight: 2, volume: "4-5", season: "all", techniques: "sauté roast raw confit",
    cuisines: { italian: 4, mediterranean: 4, french: 3, indian: 3, "east-asian": 4, "se-asian": 4, latin: 3, "middle-eastern": 3 }, dishes: "sauces soups stews pasta roasts marinades dips stir-fries", art: "garlic",
    pairs: "olive-oil:4 butter:4 onion:4 tomato:4 lemon:3 parsley:4 basil:3 rosemary:3 thyme:3 oregano:3 chile:4 ginger:4 soy-sauce:3 bread:3 anchovy:3 shrimp:4 chicken:4 lamb:4 beef:3 pork:3 mushroom:3 spinach:3 kale:3 broccoli:3 green-bean:2 potato:3 eggplant:3 zucchini:2 bean:3 chickpea:3 lentil:2 rice:2 pasta:4 cream:2 yogurt:3 cheese:2 parmesan:3 egg:2 bay-leaf:2 cumin:3 coriander-seed:2 paprika:3 saffron:2 black-pepper:3 salt:3 vinegar:2 white-wine:3 red-wine:2 sesame:2 scallion:3 cilantro:3 lime:2 fish-sauce:3 honey:2 almond:2 walnut:2 pine-nut:2 clam:3 mussels:3 cod:2 salmon:2 duck:2 sausage:3 liver:2 cabbage:2 cauliflower:2 artichoke:3 asparagus:2 leek:1 celery:1 carrot:2 fennel:3 caper:2 olive:3 mustard:2 miso:2 harissa:3 pesto:4 tahini:3 sumac:2 mint:2 dill:2 sage:2 tarragon:1 tofu:2",
  },
  leek: {
    name: "leek", aliases: ["leeks"], cat: "vegetable",
    taste: "sweet", weight: 2, volume: 2, season: "autumn winter spring", techniques: "braise sauté roast poach",
    cuisines: { french: 4, italian: 2, mediterranean: 2 }, chips: ["Welsh", "Flemish"], dishes: "soups braises tarts gratins", art: "leek",
    pairs: "potato:4 butter:4 cream:3 chicken:3 thyme:3 bacon:3 gruyere:3 parmesan:2 egg:3 vinaigrette:3 mustard:2 white-wine:3 lemon:2 olive-oil:2 fish:2 scallop:2 mussels:2 salmon:2 cod:2 mushroom:2 goat-cheese:2 blue-cheese:2 chives:2 parsley:2 tarragon:2 black-pepper:2 nutmeg:2 bay-leaf:2 pork:2 lamb:1 bean:2 lentil:2 rice:2 pasta:2 cheese:3 ham:2 apple:1 walnut:2 hazelnut:1 sage:1 garlic:1",
  },
  scallion: {
    name: "scallion", aliases: ["scallions", "spring onions", "green onions", "salad onions"], cat: "vegetable",
    taste: "hot:1 sweet", weight: 1, volume: 2, season: "all", techniques: "raw grill stir-fry garnish",
    cuisines: { "east-asian": 4, "se-asian": 3, latin: 2 }, chips: ["Chinese", "Japanese", "Korean"], dishes: "stir-fries soups salads noodles garnish", art: "leek",
    pairs: "ginger:4 soy-sauce:4 sesame:3 garlic:3 chile:3 egg:3 rice:3 noodles:3 tofu:3 pork:3 chicken:3 beef:2 shrimp:2 fish:2 cilantro:3 lime:2 miso:3 peanut:2 corn:2 potato:2 cream-cheese:2 cheese:1 bacon:2 cucumber:2 avocado:2 mushroom:2 duck:3 crab:2 scallop:1 vinegar:2 honey:1 fish-sauce:2 lemongrass:1 black-pepper:1",
  },
  potato: {
    name: "potato", aliases: ["potatoes", "spuds"], cat: "vegetable",
    taste: "sweet:1", weight: "3-4", volume: "1-2", season: "all", techniques: "roast boil mash fry gratin",
    cuisines: { french: 4, italian: 2, indian: 3, latin: 3, mediterranean: 2 }, chips: ["Irish", "Peruvian", "Belgian"], dishes: "roasts gratins soups salads stews curries breakfast", art: "potato",
    pairs: "butter:4 cream:4 salt:4 rosemary:4 garlic:3 olive-oil:3 onion:3 leek:4 chives:3 parsley:3 thyme:3 bay-leaf:2 cheese:3 gruyere:3 parmesan:2 cheddar:3 blue-cheese:2 goat-cheese:2 sour-cream:3 egg:3 bacon:3 ham:2 sausage:2 beef:3 lamb:3 chicken:2 pork:2 fish:2 cod:3 salmon:2 smoked-salmon:3 anchovy:2 caper:2 mustard:3 vinegar:3 mayonnaise:3 dill:3 tarragon:2 sage:2 nutmeg:2 paprika:2 cumin:2 turmeric:2 curry-leaf:2 chile:2 pea:2 spinach:2 cabbage:2 kale:2 cauliflower:2 mushroom:2 truffle:3 lemon:2 black-pepper:3 horseradish:2 milk:3 white-wine:1 beer:1 celery:1 carrot:2",
  },
  "sweet-potato": {
    name: "sweet potato", aliases: ["sweet potatoes", "kumara", "yam"], cat: "vegetable",
    taste: "sweet", weight: 3, volume: 2, season: "autumn winter", techniques: "roast mash fry bake",
    cuisines: { latin: 3, "east-asian": 2, "se-asian": 2, indian: 2 }, chips: ["Southern US", "Caribbean", "Japanese"], dishes: "roasts soups curries desserts salads", art: "potato",
    pairs: "butter:4 brown-sugar:3 maple-syrup:4 cinnamon:3 nutmeg:2 ginger:3 chile:3 lime:3 cilantro:2 coconut-milk:3 black-bean:3 pecan:3 walnut:2 honey:2 orange:2 sage:3 rosemary:2 thyme:2 garlic:2 onion:2 cumin:2 paprika:2 pork:2 chicken:2 bacon:2 sausage:2 goat-cheese:2 feta:2 blue-cheese:2 cream:2 yogurt:2 miso:3 sesame:2 soy-sauce:2 peanut:2 apple:2 cranberry:2 marshmallow:1 vanilla:1 salt:2 black-pepper:2 olive-oil:2 kale:2 spinach:1 egg:1 curry-powder:2",
  },
  carrot: {
    name: "carrot", aliases: ["carrots"], cat: "vegetable",
    taste: "sweet", weight: 2, volume: 2, season: "all", techniques: "roast raw braise glaze purée",
    cuisines: { french: 3, "middle-eastern": 3, indian: 2, "se-asian": 2, mediterranean: 2 }, chips: ["Moroccan", "Vietnamese"], dishes: "soups salads braises roasts stews desserts pickles", art: "carrot",
    pairs: "butter:4 honey:3 orange:3 cumin:4 ginger:3 cilantro:3 onion:3 celery:4 parsley:3 thyme:3 dill:2 tarragon:2 mint:2 lemon:2 olive-oil:3 cream:2 yogurt:3 feta:2 goat-cheese:2 raisin:2 walnut:2 pistachio:2 almond:2 maple-syrup:2 brown-sugar:2 cinnamon:2 coriander-seed:3 caraway:2 turmeric:2 harissa:3 chile:2 lime:2 fish-sauce:2 peanut:2 sesame:2 soy-sauce:1 beef:3 chicken:3 lamb:2 pork:2 bacon:2 pea:2 potato:2 lentil:3 chickpea:2 rice:1 apple:2 bay-leaf:2 nutmeg:2 vinegar:2 garlic:2 salt:2 black-pepper:2 egg:1",
  },
  celery: {
    name: "celery", aliases: ["celery stalks"], cat: "vegetable",
    taste: "salty:1 bitter:1", weight: 1, volume: 2, season: "all", techniques: "raw braise sauté",
    cuisines: { french: 3, italian: 2 }, dishes: "soups stews salads stocks", art: "celery",
    pairs: "onion:3 carrot:4 blue-cheese:4 peanut:2 walnut:3 apple:3 lemon:2 olive-oil:2 butter:3 cream:2 chicken:3 beef:2 pork:1 tuna:2 shrimp:2 crab:2 lobster:2 potato:1 tomato:1 parsley:2 thyme:2 bay-leaf:2 tarragon:2 dill:2 mustard:2 mayonnaise:3 vinegar:1 anchovy:2 parmesan:2 bean:2 lentil:2 rice:1 egg:2 salt:3 black-pepper:2 raisin:1 date:1 fennel:1 garlic:1",
  },
  beet: {
    name: "beet", aliases: ["beetroot", "beets"], cat: "vegetable",
    taste: "sweet", weight: 3, volume: 3, season: "autumn winter summer", techniques: "roast boil raw pickle",
    cuisines: { french: 2, "middle-eastern": 3, mediterranean: 2 }, chips: ["Russian", "Scandinavian", "Turkish"], dishes: "salads soups pickles dips", art: "beet",
    pairs: "goat-cheese:4 orange:3 walnut:3 horseradish:3 dill:3 sour-cream:3 yogurt:3 vinegar:3 balsamic-vinegar:3 feta:3 blue-cheese:2 hazelnut:2 pistachio:2 apple:2 fennel:1 red-onion:2 arugula:2 cumin:2 coriander-seed:2 caraway:2 mint:2 chives:2 tarragon:2 thyme:2 olive-oil:2 butter:2 honey:2 lemon:2 lime:1 ginger:2 chocolate:2 smoked-salmon:3 herring:3 egg:2 beef:2 pork:1 lentil:2 potato:1 cabbage:2 carrot:1 salt:2 black-pepper:2 mustard:2 tahini:2 sumac:1",
  },
  cabbage: {
    name: "cabbage", aliases: ["green cabbage", "white cabbage", "savoy cabbage"], cat: "vegetable",
    taste: "sweet bitter:1", weight: 2, volume: 2, season: "autumn winter", techniques: "braise raw ferment roast stir-fry",
    cuisines: { "east-asian": 3, french: 2, indian: 2 }, chips: ["German", "Polish", "Korean", "Irish"], dishes: "slaws stews pickles stir-fries soups", art: "cabbage",
    pairs: "butter:3 bacon:3 pork:4 sausage:3 caraway:4 apple:3 vinegar:3 mustard:3 onion:2 carrot:2 potato:2 cream:2 sour-cream:2 cheese:1 juniper:2 bay-leaf:2 black-pepper:2 salt:3 chile:3 garlic:2 ginger:3 sesame:2 soy-sauce:2 fish-sauce:2 lime:2 cilantro:2 peanut:2 mayonnaise:2 dill:2 celery:1 beef:2 duck:2 cumin:1 nutmeg:1 lemon:1 olive-oil:1 egg:1 rice:1",
  },
  kale: {
    name: "kale", aliases: ["curly kale", "cavolo nero", "lacinato kale", "tuscan kale"], cat: "vegetable",
    taste: "bitter", weight: 2, volume: 3, season: "autumn winter", techniques: "sauté braise raw roast",
    cuisines: { italian: 3, mediterranean: 2 }, chips: ["Tuscan", "Portuguese"], dishes: "soups salads stews pasta", art: "kale",
    pairs: "garlic:4 olive-oil:4 lemon:3 chile:3 parmesan:3 bean:3 sausage:3 bacon:2 potato:2 onion:2 anchovy:2 bread:2 pine-nut:2 walnut:2 almond:2 raisin:2 apple:1 cranberry:1 pecorino:2 goat-cheese:2 egg:2 cream:1 butter:2 vinegar:2 balsamic-vinegar:1 tahini:2 sesame:2 soy-sauce:2 miso:1 ginger:1 pork:2 chicken:1 lentil:2 chickpea:2 rice:1 pasta:2 mushroom:2 salt:2 black-pepper:2 nutmeg:1 sweet-potato:2 avocado:1 tomato:1",
  },
  spinach: {
    name: "spinach", aliases: ["baby spinach"], cat: "vegetable",
    taste: "bitter:1", weight: 1, volume: 2, season: "spring autumn", techniques: "sauté raw wilt creamed",
    cuisines: { italian: 3, french: 3, indian: 4, "middle-eastern": 3, mediterranean: 3 }, chips: ["Greek", "Persian", "Punjabi"], dishes: "salads soups curries pasta breakfast dips", art: "leaf",
    pairs: "garlic:4 butter:3 cream:4 nutmeg:4 egg:3 feta:4 ricotta:4 parmesan:3 goat-cheese:2 cheese:2 paneer:4 lemon:3 olive-oil:3 pine-nut:3 raisin:3 chickpea:3 lentil:2 potato:2 mushroom:2 bacon:2 chicken:2 salmon:2 cod:1 shrimp:2 lamb:2 ginger:2 cumin:2 coriander-seed:2 turmeric:2 chile:2 yogurt:3 sesame:2 soy-sauce:2 miso:1 onion:2 shallot:2 dill:2 mint:1 pasta:3 rice:2 bread:1 walnut:1 anchovy:2 orange:1 strawberry:2 pear:1 blue-cheese:2 vinegar:1 balsamic-vinegar:2 salt:2 black-pepper:2 pastry:2",
  },
  arugula: {
    name: "arugula", aliases: ["rocket", "rucola"], cat: "vegetable",
    taste: "bitter hot:1", weight: 1, volume: 3, season: "spring summer autumn", techniques: "raw wilt pesto",
    cuisines: { italian: 4, mediterranean: 3 }, dishes: "salads pizza pasta sandwiches", art: "leaf",
    pairs: "parmesan:4 olive-oil:4 lemon:4 balsamic-vinegar:3 pear:3 fig:3 prosciutto:3 pine-nut:2 walnut:2 goat-cheese:3 mozzarella:2 pecorino:2 blue-cheese:2 tomato:2 beef:3 steak:3 chicken:2 shrimp:2 egg:2 bread:2 pizza:3 pasta:2 garlic:2 chile:1 orange:2 apple:1 strawberry:2 avocado:2 fennel:2 beet:2 potato:1 mushroom:1 anchovy:1 salt:2 black-pepper:2 honey:1 pomegranate:2 pistachio:1",
  },
  radicchio: {
    name: "radicchio", aliases: ["red chicory", "treviso"], cat: "vegetable",
    taste: "bitter", weight: 2, volume: 3, season: "autumn winter", techniques: "grill raw braise roast",
    cuisines: { italian: 4 }, chips: ["Venetian"], dishes: "salads risotto grills pasta", art: "cabbage",
    pairs: "balsamic-vinegar:4 gorgonzola:4 blue-cheese:3 walnut:3 pear:3 pancetta:3 bacon:3 olive-oil:3 honey:3 orange:2 pomegranate:2 fig:2 apple:2 parmesan:2 goat-cheese:2 mozzarella:1 anchovy:2 garlic:2 red-wine:2 risotto:3 pasta:2 polenta:2 chicken:1 beef:1 pork:2 sausage:2 hazelnut:2 pine-nut:1 raisin:2 fennel:2 arugula:1 salt:2 black-pepper:2 lemon:1 vinegar:2 butter:2",
  },
  broccoli: {
    name: "broccoli", aliases: ["broccolini", "tenderstem broccoli"], cat: "vegetable",
    taste: "bitter:1 sweet:1", weight: 2, volume: 2, season: "autumn winter spring", techniques: "steam roast stir-fry raw",
    cuisines: { italian: 3, "east-asian": 3 }, chips: ["Chinese", "Sicilian"], dishes: "stir-fries pasta salads soups", art: "broccoli",
    pairs: "garlic:4 chile:3 lemon:3 olive-oil:3 anchovy:3 parmesan:3 cheddar:3 butter:3 soy-sauce:3 ginger:3 sesame:3 oyster-sauce:3 almond:2 pine-nut:2 walnut:1 cream:2 blue-cheese:2 bacon:2 egg:2 pasta:3 rice:2 noodles:2 tofu:2 beef:3 chicken:2 pork:2 shrimp:2 mustard:1 vinegar:1 orange:1 peanut:2 cashew:2 honey:1 salt:2 black-pepper:2 onion:1 shallot:1 cauliflower:2 bean:1 miso:2 hazelnut:1",
  },
  cauliflower: {
    name: "cauliflower", aliases: [], cat: "vegetable",
    taste: "sweet:1 bitter:1", weight: 2, volume: 1, season: "autumn winter", techniques: "roast purée fry raw steam",
    cuisines: { indian: 4, "middle-eastern": 3, french: 2, italian: 2 }, chips: ["Punjabi", "Lebanese"], dishes: "curries roasts soups salads gratins", art: "broccoli",
    pairs: "butter:3 cream:3 cheese:4 cheddar:4 gruyere:3 parmesan:3 nutmeg:2 cumin:4 turmeric:4 curry-powder:3 coriander-seed:3 ginger:2 chile:3 garlic:3 tahini:4 lemon:3 pomegranate:2 raisin:2 caper:3 anchovy:2 brown-butter:4 almond:3 hazelnut:3 pine-nut:2 olive-oil:3 vinegar:2 mustard:2 paprika:2 saffron:2 cilantro:3 parsley:2 mint:2 chives:1 potato:2 pea:2 chickpea:3 rice:2 pasta:2 bacon:2 egg:2 yogurt:3 sumac:2 harissa:2 onion:2 scallion:1 salt:2 black-pepper:2 truffle:2 date:1 honey:1",
  },
  "brussels-sprout": {
    name: "brussels sprout", aliases: ["brussels sprouts", "sprouts"], cat: "vegetable",
    taste: "bitter sweet:1", weight: 2, volume: 3, season: "autumn winter", techniques: "roast fry shave braise",
    cuisines: { french: 2 }, chips: ["Belgian", "British"], dishes: "roasts salads sides", art: "cabbage",
    pairs: "bacon:4 brown-butter:4 chestnut:4 balsamic-vinegar:3 parmesan:3 pecorino:2 maple-syrup:3 honey:2 garlic:3 lemon:3 mustard:3 shallot:2 onion:2 cream:2 hazelnut:3 walnut:2 almond:2 pine-nut:1 apple:2 cranberry:2 pomegranate:2 fish-sauce:3 chile:2 lime:2 soy-sauce:2 sesame:1 pancetta:3 sausage:2 pork:2 chicken:1 duck:2 egg:2 blue-cheese:2 goat-cheese:1 thyme:2 sage:2 nutmeg:1 caraway:1 vinegar:2 olive-oil:2 butter:3 salt:2 black-pepper:2 potato:1",
  },
  asparagus: {
    name: "asparagus", aliases: ["green asparagus", "white asparagus"], cat: "vegetable",
    taste: "bitter:1 sweet:1", weight: 1, volume: 2, season: "spring", techniques: "roast grill steam shave",
    cuisines: { french: 4, italian: 3 }, chips: ["German", "Flemish"], dishes: "salads risotto pasta breakfast tarts", art: "asparagus",
    pairs: "egg:4 butter:4 hollandaise:4 parmesan:4 lemon:4 olive-oil:3 prosciutto:3 morel:3 mushroom:2 cream:2 chives:3 tarragon:3 chervil:2 parsley:2 mint:2 dill:2 goat-cheese:2 gruyere:2 ricotta:2 pea:3 leek:1 shallot:2 garlic:2 almond:2 hazelnut:2 pine-nut:2 orange:2 vinegar:2 balsamic-vinegar:2 mustard:2 anchovy:2 salmon:2 smoked-salmon:3 shrimp:2 scallop:2 crab:2 chicken:2 bacon:2 pancetta:2 ham:2 rice:2 risotto:3 pasta:3 soy-sauce:1 sesame:2 miso:1 salt:3 black-pepper:3 brown-butter:3 truffle:2 white-wine:1 pastry:2",
  },
  artichoke: {
    name: "artichoke", aliases: ["globe artichoke", "artichoke hearts"], cat: "vegetable",
    taste: "bitter sweet:1", weight: 2, volume: 2, season: "spring", techniques: "braise fry roast raw steam",
    cuisines: { italian: 4, mediterranean: 3, french: 3 }, chips: ["Roman", "Provençal", "Spanish"], dishes: "braises salads pasta pizza dips", art: "artichoke",
    pairs: "lemon:4 garlic:4 olive-oil:4 mint:3 parsley:3 butter:3 parmesan:3 pecorino:2 white-wine:3 anchovy:2 caper:2 olive:2 tomato:2 pea:2 fava-bean:3 potato:2 shrimp:2 lamb:2 chicken:2 egg:2 cream:2 goat-cheese:2 mozzarella:1 bread:2 pasta:2 risotto:2 rice:1 thyme:2 bay-leaf:2 vinegar:2 mayonnaise:3 hollandaise:3 vinaigrette:3 hazelnut:1 almond:1 pine-nut:2 chile:1 black-pepper:2 salt:2 shallot:1 onion:1 ham:2 prosciutto:2",
  },
  eggplant: {
    name: "eggplant", aliases: ["aubergine", "brinjal"], cat: "vegetable",
    taste: "bitter:1", weight: 3, volume: 2, season: "summer autumn", techniques: "roast grill fry smoke braise",
    cuisines: { mediterranean: 4, "middle-eastern": 4, italian: 4, indian: 3, "east-asian": 3, "se-asian": 2 }, chips: ["Sicilian", "Turkish", "Lebanese", "Japanese", "Thai"], dishes: "dips stews braises pasta grills curries", art: "eggplant",
    pairs: "garlic:4 olive-oil:4 tomato:4 tahini:4 lemon:3 yogurt:4 miso:4 soy-sauce:3 sesame:3 basil:3 parmesan:3 mozzarella:3 ricotta:2 feta:3 pine-nut:2 walnut:2 pomegranate:3 mint:3 parsley:3 cilantro:2 cumin:3 coriander-seed:2 paprika:2 chile:3 ginger:2 honey:2 vinegar:2 balsamic-vinegar:2 onion:2 bell-pepper:3 zucchini:3 chickpea:3 lentil:2 lamb:4 pork:2 chicken:2 beef:1 anchovy:2 caper:2 olive:2 oregano:2 thyme:2 bread:2 pasta:3 rice:2 sumac:2 harissa:3 fish-sauce:2 lime:1 egg:1 salt:3 black-pepper:2",
  },
  zucchini: {
    name: "zucchini", aliases: ["courgette", "summer squash"], cat: "vegetable",
    taste: "sweet:1", weight: 2, volume: 1, season: "summer", techniques: "grill sauté raw fry roast",
    cuisines: { italian: 4, french: 3, mediterranean: 3, "middle-eastern": 2 }, chips: ["Provençal", "Ligurian"], dishes: "pasta fritters salads grills soups", art: "zucchini",
    pairs: "garlic:4 olive-oil:4 basil:4 mint:4 lemon:3 parmesan:3 pecorino:2 feta:3 ricotta:3 goat-cheese:3 mozzarella:2 tomato:3 onion:2 shallot:1 thyme:2 oregano:2 parsley:2 dill:2 chile:2 pine-nut:2 almond:2 walnut:1 egg:3 cream:1 butter:2 anchovy:2 caper:1 pasta:3 rice:2 risotto:2 bread:1 pastry:1 shrimp:2 chicken:2 lamb:1 pork:1 bacon:1 eggplant:3 bell-pepper:3 corn:2 pea:1 vinegar:2 balsamic-vinegar:1 honey:1 chocolate:1 salt:2 black-pepper:2 yogurt:2 sumac:1 za-atar:2",
  },
  "bell-pepper": {
    name: "bell pepper", aliases: ["capsicum", "sweet pepper", "red pepper", "peppers"], cat: "vegetable",
    taste: "sweet", weight: 2, volume: 3, season: "summer autumn", techniques: "roast grill raw stew",
    cuisines: { mediterranean: 4, latin: 3, "middle-eastern": 3, italian: 3 }, chips: ["Spanish", "Basque", "Hungarian", "Turkish"], dishes: "stews salads dips sauces grills sandwiches", art: "pepper",
    pairs: "olive-oil:4 garlic:4 onion:3 tomato:3 eggplant:3 zucchini:3 anchovy:3 caper:2 olive:2 basil:3 oregano:2 thyme:2 parsley:2 paprika:3 cumin:2 chile:2 vinegar:3 balsamic-vinegar:2 sherry-vinegar:3 feta:3 goat-cheese:3 mozzarella:2 parmesan:1 almond:3 walnut:3 pine-nut:2 pomegranate:2 lemon:2 honey:1 egg:3 rice:2 bread:2 pasta:2 chicken:3 pork:2 beef:2 sausage:3 chorizo:4 shrimp:2 tuna:2 cod:1 corn:2 bean:2 chickpea:2 cilantro:2 lime:2 avocado:1 harissa:2 sumac:1 salt:2 black-pepper:2 saffron:1",
  },
  chile: {
    name: "chile", aliases: ["chili", "chilli", "chili pepper", "hot pepper", "jalapeño", "red chile"], cat: "spice",
    taste: "hot", weight: 1, volume: 5, season: "all", techniques: "raw roast dry pickle infuse",
    cuisines: { latin: 4, indian: 4, "se-asian": 4, "east-asian": 4, "middle-eastern": 2, mediterranean: 2, italian: 2 }, chips: ["Mexican", "Thai", "Sichuan", "Calabrian", "Korean"], dishes: "salsas curries stir-fries marinades sauces pickles", art: "chile",
    pairs: "garlic:4 lime:4 cilantro:4 ginger:4 onion:2 tomato:3 chocolate:3 lemon:2 honey:3 sugar:2 salt:3 olive-oil:3 vinegar:3 fish-sauce:4 soy-sauce:3 coconut-milk:3 peanut:3 cumin:3 coriander-seed:2 oregano:2 mint:2 basil:2 scallion:3 corn:3 bean:3 avocado:3 mango:3 pineapple:3 watermelon:2 cucumber:2 egg:3 cheese:2 cheddar:2 feta:2 goat-cheese:1 yogurt:2 sour-cream:2 cream:1 beef:3 pork:3 chicken:3 lamb:2 shrimp:3 fish:2 crab:2 squid:3 tofu:2 rice:2 noodles:3 pasta:2 bread:1 chickpea:2 lentil:2 eggplant:3 broccoli:3 kale:3 sweet-potato:3 potato:2 cabbage:3 lemongrass:3 sesame:2 tamarind:3 pomegranate:1 orange:1 vanilla:1 cinnamon:2 anchovy:2 pecorino:1",
  },
  cucumber: {
    name: "cucumber", aliases: ["cucumbers", "persian cucumber"], cat: "vegetable",
    taste: "sweet:1 bitter:1", weight: 1, volume: 1, season: "summer", techniques: "raw pickle smash",
    cuisines: { "middle-eastern": 3, mediterranean: 3, "east-asian": 3, indian: 2, "se-asian": 2 }, chips: ["Greek", "Persian", "Sichuan", "Japanese"], dishes: "salads pickles dips drinks sandwiches", art: "cucumber",
    pairs: "yogurt:4 dill:4 mint:4 lemon:3 vinegar:4 rice-vinegar:3 sesame:3 garlic:3 chile:2 soy-sauce:2 feta:3 tomato:3 red-onion:2 olive:2 avocado:2 watermelon:3 melon:2 smoked-salmon:3 salmon:2 shrimp:2 crab:2 tuna:2 chicken:1 lime:2 cilantro:2 ginger:2 scallion:2 peanut:2 honey:1 sugar:1 salt:3 black-pepper:2 olive-oil:2 sour-cream:3 cream-cheese:2 bread:2 gin:3 vodka:1 strawberry:1 sumac:2 tahini:1 chives:2 tarragon:1 mustard:1",
  },
  mushroom: {
    name: "mushroom", aliases: ["mushrooms", "button mushroom", "cremini", "portobello"], cat: "vegetable",
    taste: "salty:1", weight: 3, volume: 3, season: "autumn all", techniques: "sauté roast grill braise",
    cuisines: { french: 4, italian: 4, "east-asian": 3, "east-asian": 3 }, chips: ["Burgundian", "Piedmontese", "Japanese"], dishes: "sauces risotto pasta soups stews breakfast", art: "mushroom",
    pairs: "butter:4 garlic:4 thyme:4 cream:4 shallot:3 onion:3 parsley:3 white-wine:3 red-wine:3 sherry:3 brandy:2 soy-sauce:3 miso:3 parmesan:3 gruyere:2 blue-cheese:2 goat-cheese:2 egg:3 bacon:3 beef:4 chicken:3 pork:2 veal:3 duck:2 lamb:1 fish:1 scallop:2 shrimp:1 rice:2 risotto:4 pasta:4 polenta:3 bread:3 potato:2 leek:2 spinach:2 kale:2 pea:2 asparagus:2 tarragon:3 rosemary:2 sage:2 chives:2 bay-leaf:2 nutmeg:2 black-pepper:3 salt:3 lemon:2 olive-oil:3 truffle:3 chestnut:2 hazelnut:2 walnut:2 ginger:2 sesame:2 scallion:2 tofu:2 noodles:2 cheese:2 mustard:2 vinegar:2 balsamic-vinegar:2 madeira:3 sour-cream:2 chile:1 dill:1 oregano:1",
  },
  corn: {
    name: "corn", aliases: ["sweetcorn", "maize", "corn on the cob"], cat: "vegetable",
    taste: "sweet", weight: 2, volume: 2, season: "summer", techniques: "grill boil roast cream",
    cuisines: { latin: 4 }, chips: ["Mexican", "Southern US", "Peruvian"], dishes: "salads soups salsas grills breads", art: "corn",
    pairs: "butter:4 lime:4 chile:4 cilantro:3 cheese:3 feta:3 cotija:4 cream:3 bacon:3 scallion:3 basil:3 tomato:3 avocado:2 bean:3 black-bean:3 zucchini:2 bell-pepper:2 onion:2 potato:2 shrimp:3 crab:3 chicken:2 pork:2 sausage:2 chorizo:2 egg:2 honey:2 maple-syrup:1 paprika:2 cumin:2 coriander-seed:1 thyme:1 parsley:1 mayonnaise:3 sour-cream:2 salt:3 black-pepper:3 milk:2 olive-oil:2 garlic:2 blue-cheese:1 goat-cheese:1 mint:1 coconut-milk:1 tarragon:1 chives:2 truffle:1",
  },
  pea: {
    name: "pea", aliases: ["peas", "green peas", "garden peas", "petits pois"], cat: "vegetable",
    taste: "sweet", weight: 1, volume: 2, season: "spring summer", techniques: "boil purée raw sauté",
    cuisines: { french: 4, italian: 3, indian: 3 }, chips: ["British", "Venetian"], dishes: "soups risotto pasta salads curries", art: "pea",
    pairs: "mint:4 butter:4 cream:3 prosciutto:3 ham:3 bacon:3 pancetta:3 lemon:3 parmesan:3 pecorino:2 ricotta:3 goat-cheese:2 feta:2 egg:3 shallot:2 onion:2 leek:2 lettuce:3 asparagus:3 fava-bean:2 carrot:2 potato:2 rice:3 risotto:4 pasta:3 chicken:2 lamb:2 salmon:2 cod:2 scallop:2 shrimp:2 chives:2 tarragon:2 parsley:2 basil:2 dill:2 cumin:2 ginger:2 turmeric:1 paneer:3 coriander-seed:1 olive-oil:2 crème-fraîche:3 mascarpone:1 salt:2 black-pepper:2 nutmeg:1 white-wine:1 vinegar:1 mushroom:2 morel:2",
  },
  "fava-bean": {
    name: "fava bean", aliases: ["broad bean", "broad beans", "fava beans"], cat: "vegetable",
    taste: "sweet:1 bitter:1", weight: 2, volume: 2, season: "spring", techniques: "boil purée raw",
    cuisines: { italian: 4, "middle-eastern": 3, mediterranean: 3 }, chips: ["Roman", "Egyptian", "Sicilian"], dishes: "salads dips pasta stews breakfast", art: "pea",
    pairs: "pecorino:4 mint:4 olive-oil:4 lemon:3 garlic:3 cumin:3 pea:2 asparagus:2 artichoke:3 prosciutto:3 pancetta:2 bacon:2 ricotta:3 feta:2 parmesan:2 dill:2 parsley:3 cilantro:2 chile:2 onion:2 scallion:1 egg:2 tomato:2 bread:2 pasta:2 rice:1 lamb:2 chicken:1 yogurt:2 tahini:2 salt:2 black-pepper:2 savory:3 thyme:1 butter:2 cream:1 morel:2",
  },
  "green-bean": {
    name: "green bean", aliases: ["green beans", "french beans", "haricots verts", "string beans"], cat: "vegetable",
    taste: "sweet:1", weight: 1, volume: 1, season: "summer", techniques: "blanch sauté roast stir-fry",
    cuisines: { french: 4, "east-asian": 2, italian: 2 }, chips: ["Niçoise", "Sichuan"], dishes: "salads sides stir-fries", art: "pea",
    pairs: "butter:4 almond:4 garlic:3 shallot:3 lemon:3 olive-oil:3 vinaigrette:3 mustard:3 tomato:2 potato:2 egg:2 tuna:3 anchovy:3 olive:2 bacon:3 hazelnut:2 walnut:2 pine-nut:1 parmesan:2 feta:2 goat-cheese:2 cream:2 dill:2 tarragon:2 parsley:2 basil:2 thyme:1 mint:2 chile:2 soy-sauce:3 sesame:3 ginger:2 pork:2 chicken:1 lamb:1 onion:1 mushroom:2 salt:2 black-pepper:2 vinegar:2 fish-sauce:2 peanut:2 miso:1",
  },
  lettuce: {
    name: "lettuce", aliases: ["little gem", "romaine", "butter lettuce", "cos"], cat: "vegetable",
    taste: "bitter:1 sweet:1", weight: 1, volume: 1, season: "spring summer", techniques: "raw grill braise",
    cuisines: { french: 3 }, dishes: "salads sandwiches wraps", art: "leaf",
    pairs: "vinaigrette:4 olive-oil:3 lemon:3 vinegar:3 parmesan:3 anchovy:3 egg:3 bacon:3 blue-cheese:3 avocado:2 pea:3 mint:2 chives:2 tarragon:2 dill:1 chicken:2 shrimp:2 crab:1 tomato:2 cucumber:2 radish:3 bread:2 cream:2 crème-fraîche:2 mustard:2 garlic:2 shallot:2 butter:2 walnut:2 orange:1 apple:1 salt:2 black-pepper:2 mayonnaise:2 sour-cream:1",
  },
  radish: {
    name: "radish", aliases: ["radishes", "french breakfast radish"], cat: "vegetable",
    taste: "hot bitter:1", weight: 1, volume: 3, season: "spring", techniques: "raw pickle roast",
    cuisines: { french: 3, "east-asian": 2 }, chips: ["Japanese", "Korean"], dishes: "salads pickles tacos", art: "radish",
    pairs: "butter:4 salt:4 bread:3 lemon:2 vinegar:2 rice-vinegar:2 olive-oil:2 chives:2 dill:2 parsley:2 mint:2 cucumber:2 lettuce:3 avocado:2 cilantro:2 lime:2 chile:1 scallion:1 sesame:2 soy-sauce:2 miso:2 anchovy:2 smoked-salmon:2 crab:1 shrimp:1 egg:2 goat-cheese:2 feta:1 cream-cheese:2 sour-cream:1 honey:1 orange:1 black-pepper:2 pork:1 beef:1",
  },
  squash: {
    name: "squash", aliases: ["butternut squash", "pumpkin", "winter squash", "kabocha"], cat: "vegetable",
    taste: "sweet", weight: 3, volume: 2, season: "autumn winter", techniques: "roast purée soup braise",
    cuisines: { italian: 3, indian: 2, "east-asian": 2, "se-asian": 2, latin: 2 }, chips: ["Northern Italian", "Japanese", "Thai"], dishes: "soups risotto pasta roasts curries desserts", art: "squash",
    pairs: "butter:4 sage:4 brown-butter:4 parmesan:4 nutmeg:3 cinnamon:3 ginger:3 maple-syrup:3 brown-sugar:2 honey:2 cream:3 goat-cheese:3 blue-cheese:3 feta:2 ricotta:2 chile:3 lime:2 coconut-milk:3 curry-powder:2 cumin:2 coriander-seed:2 garlic:2 onion:2 shallot:2 thyme:3 rosemary:2 bay-leaf:1 pecan:3 walnut:3 hazelnut:3 pumpkin-seed:3 almond:2 chestnut:2 apple:2 pear:2 cranberry:2 orange:2 pork:2 sausage:3 bacon:3 pancetta:2 chicken:2 duck:2 lamb:1 shrimp:1 egg:2 rice:2 risotto:4 pasta:3 bread:1 lentil:2 chickpea:2 miso:3 soy-sauce:2 sesame:2 vanilla:1 pastry:2 salt:2 black-pepper:2 olive-oil:3 balsamic-vinegar:2 vinegar:1 tahini:2 harissa:2 yogurt:2 amaretto:2",
  },
  avocado: {
    name: "avocado", aliases: ["avocados"], cat: "fruit",
    taste: "sweet:1", weight: 3, volume: 1, season: "all", techniques: "raw mash grill",
    cuisines: { latin: 4, "east-asian": 2 }, chips: ["Mexican", "Californian", "Japanese"], dishes: "salads salsas dips sandwiches breakfast tacos", art: "avocado",
    pairs: "lime:4 cilantro:4 chile:3 tomato:3 red-onion:2 onion:2 garlic:2 salt:4 olive-oil:3 lemon:3 egg:3 bread:3 shrimp:3 crab:3 salmon:3 smoked-salmon:3 tuna:3 chicken:2 bacon:3 corn:2 black-bean:3 bean:2 cucumber:2 radish:2 arugula:2 grapefruit:3 orange:2 mango:3 pineapple:1 pomegranate:2 feta:2 goat-cheese:2 cotija:2 sour-cream:2 yogurt:2 scallion:2 sesame:2 soy-sauce:2 wasabi:2 rice:2 chocolate:1 honey:1 black-pepper:3 cumin:2 coriander-seed:1 mint:1 basil:1 chives:2 vinegar:1 pistachio:1 walnut:1 pumpkin-seed:2",
  },
};
export default entries;
