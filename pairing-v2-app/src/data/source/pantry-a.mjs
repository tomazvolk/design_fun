/* Oils, acids, sweeteners, condiments, sauces and other pantry staples. */
const entries = {
  "olive-oil": {
    name: "olive oil", aliases: ["extra virgin olive oil", "evoo"], cat: "oil",
    taste: "bitter:1 hot:1", weight: 2, volume: 2, season: "all", techniques: "drizzle fry confit dress",
    cuisines: { mediterranean: 4, italian: 4, "middle-eastern": 3, french: 3 }, chips: ["Tuscan", "Ligurian", "Greek", "Spanish", "Lebanese"], dishes: "dressings sauces everything", art: "oil",
    pairs: "garlic:4 lemon:4 salt:4 bread:4 tomato:4 basil:4 rosemary:4 thyme:3 oregano:4 parsley:4 black-pepper:3 chile:3 vinegar:3 balsamic-vinegar:4 sherry-vinegar:3 anchovy:4 caper:3 olive:4 parmesan:4 pecorino:3 feta:4 mozzarella:4 burrata:4 ricotta:3 goat-cheese:3 labneh:4 yogurt:3 egg:3 fish:4 sea-bass:4 cod:4 tuna:4 shrimp:4 squid:4 octopus:4 mussels:3 clam:4 chicken:3 lamb:4 pork:2 beef:3 steak:3 pasta:4 risotto:1 rice:3 couscous:3 bulgur:4 bean:4 chickpea:4 lentil:3 potato:3 zucchini:4 eggplant:4 bell-pepper:4 artichoke:4 asparagus:3 fennel:3 kale:4 broccoli:3 cauliflower:3 arugula:4 lettuce:3 cucumber:2 avocado:3 beet:2 carrot:3 squash:3 mushroom:3 orange:3 blood-orange:3 fig:3 peach:2 watermelon:3 strawberry:1 chocolate:3 vanilla:2 honey:2 ice-cream:3 pistachio:3 almond:3 walnut:3 hazelnut:2 pine-nut:4 sumac:4 za-atar:4 harissa:3 pesto:4 tahini:3 mint:2 dill:2 cilantro:2 sage:2 bay-leaf:1 cumin:3 paprika:4 fennel-seed:2 coriander-seed:2 saffron:3 preserved-lemon:3",
  },
  olive: {
    name: "olive", aliases: ["olives", "kalamata", "green olive", "black olive"], cat: "condiment",
    taste: "salty bitter", weight: 2, volume: 4, season: "all", techniques: "raw marinate tapenade bake",
    cuisines: { mediterranean: 4, italian: 4, french: 3, "middle-eastern": 3 }, chips: ["Greek", "Provençal", "Sicilian", "Moroccan"], dishes: "salads tapenade braises pizza antipasti", art: "olive",
    pairs: "lemon:4 orange:3 blood-orange:3 fennel:3 garlic:4 olive-oil:4 anchovy:4 caper:4 tomato:4 feta:4 goat-cheese:2 mozzarella:2 parmesan:2 ricotta:1 manchego:3 halloumi:2 labneh:3 bread:4 pita:3 pizza:3 pasta:3 rice:1 couscous:2 chickpea:2 bean:1 chicken:4 lamb:3 duck:2 rabbit:3 beef:2 veal:1 pork:1 sausage:1 chorizo:2 fish:3 tuna:3 cod:3 sea-bass:3 squid:2 octopus:2 shrimp:2 anchovy:4 egg:2 potato:2 bell-pepper:3 eggplant:2 zucchini:1 artichoke:2 cucumber:2 red-onion:2 onion:2 celery:1 cauliflower:1 kale:1 arugula:1 watermelon:2 fig:1 almond:3 walnut:1 pine-nut:1 thyme:3 rosemary:2 oregano:3 basil:2 parsley:3 bay-leaf:2 mint:1 chile:3 cumin:2 coriander-seed:1 fennel-seed:2 paprika:2 preserved-lemon:4 harissa:3 vinegar:2 sherry-vinegar:2 white-wine:3 red-wine:2 vermouth:3 gin:3 black-pepper:2 honey:1 butter:1 pesto:1 tahini:1 chocolate:1",
  },
  caper: {
    name: "caper", aliases: ["capers", "caperberries"], cat: "condiment",
    taste: "salty sour", weight: 1, volume: 4, season: "all", techniques: "fry rinse chop", cuisines: { italian: 4, mediterranean: 4, french: 3 }, chips: ["Sicilian", "Provençal"], dishes: "sauces salads pasta fish", art: "olive",
    pairs: "lemon:4 anchovy:4 olive:4 garlic:3 butter:4 brown-butter:3 olive-oil:4 parsley:4 dill:3 tarragon:2 chives:1 mint:1 oregano:1 thyme:1 tomato:3 red-onion:2 shallot:3 onion:2 potato:2 cauliflower:3 eggplant:2 zucchini:1 green-bean:1 bell-pepper:2 celery:2 cucumber:2 beet:1 artichoke:2 fennel:2 radish:1 arugula:1 fish:4 sole:4 skate:4 cod:3 salmon:3 smoked-salmon:4 tuna:3 sea-bass:3 swordfish:3 squid:2 shrimp:1 chicken:3 veal:4 lamb:2 beef:2 steak:2 pork:1 rabbit:1 liver:1 egg:3 mayonnaise:3 tartar-sauce:4 vinaigrette:3 mustard:3 vinegar:3 white-wine:3 sherry-vinegar:2 pasta:3 bread:2 rice:1 pizza:2 couscous:1 raisin:3 pine-nut:2 almond:1 walnut:1 chile:2 black-pepper:3 salt:2 mozzarella:1 parmesan:2 cream-cheese:2 goat-cheese:1 feta:1 crème-fraîche:1 avocado:1 caper:1 cream:1",
  },
  mustard: {
    name: "mustard", aliases: ["dijon mustard", "wholegrain mustard", "mustard seed", "english mustard"], cat: "condiment",
    taste: "hot sour:1 bitter:1", weight: 1, volume: 4, season: "all", techniques: "whisk glaze temper", cuisines: { french: 4, indian: 3 }, chips: ["Dijon", "Bengali", "British", "German"], dishes: "dressings sauces glazes sandwiches pickles", art: "spice",
    pairs: "honey:4 vinegar:4 cider-vinegar:3 sherry-vinegar:2 balsamic-vinegar:1 lemon:3 olive-oil:4 vinaigrette:4 mayonnaise:4 butter:3 cream:3 crème-fraîche:3 egg:3 cheese:3 cheddar:4 gruyere:3 brie:2 blue-cheese:2 goat-cheese:1 ham:4 pork:4 bacon:3 sausage:4 chicken:3 rabbit:4 beef:4 steak:3 veal:2 lamb:2 duck:2 turkey:2 salmon:4 mackerel:4 herring:4 tuna:2 cod:2 trout:2 shrimp:1 crab:3 oyster:1 potato:3 cabbage:3 sauerkraut:3 brussels-sprout:3 leek:2 celery:2 onion:2 shallot:2 carrot:1 cauliflower:2 beet:2 green-bean:3 lettuce:2 asparagus:2 radish:1 cucumber:1 lentil:3 bean:2 chickpea:1 bread:3 pretzel:4 pickles:3 cornichon:3 tarragon:3 dill:3 thyme:2 rosemary:2 parsley:2 chives:2 sage:1 turmeric:2 cumin:2 coriander-seed:2 fennel-seed:2 curry-leaf:4 black-pepper:3 chile:2 paprika:1 garlic:2 ginger:2 apple:2 pear:1 grape:2 fig:1 maple-syrup:3 brown-sugar:3 sugar:2 white-wine:3 beer:3 cider:2 brandy:1 whisky:2 caraway:2 horseradish:2 mango:2",
  },
  horseradish: {
    name: "horseradish", aliases: ["fresh horseradish", "horseradish sauce"], cat: "condiment",
    taste: "hot bitter:1", weight: 1, volume: 5, season: "autumn winter", techniques: "grate cream pickle", cuisines: { french: 1, "east-asian": 1 }, chips: ["British", "German", "Polish", "Jewish"], dishes: "sauces roasts fish", art: "radish",
    pairs: "beef:4 steak:3 roast-beef:4 cream:4 sour-cream:3 crème-fraîche:3 yogurt:2 mayonnaise:3 beet:4 potato:3 apple:2 pear:1 lemon:2 vinegar:3 cider-vinegar:2 mustard:2 smoked-salmon:3 salmon:3 trout:3 mackerel:4 herring:3 oyster:3 cod:1 crab:1 shrimp:2 tomato:2 cocktail-sauce:4 egg:2 bread:2 rye:3 bacon:1 ham:2 pork:2 sausage:2 chicken:1 dill:2 chives:2 parsley:1 black-pepper:2 salt:2 butter:1 celery:1 cabbage:1 pickles:2 sugar:1 honey:1 avocado:1 cheddar:1 cream-cheese:2",
  },
  vinegar: {
    name: "vinegar", aliases: ["white wine vinegar", "red wine vinegar", "wine vinegar", "malt vinegar"], cat: "acid",
    taste: "sour", weight: 1, volume: 4, season: "all", techniques: "deglaze pickle dress reduce", cuisines: { french: 4, mediterranean: 3, italian: 3, "east-asian": 2 }, dishes: "dressings pickles sauces", art: "bottle",
    pairs: "olive-oil:4 mustard:4 shallot:4 garlic:2 honey:3 sugar:3 salt:3 black-pepper:3 tarragon:4 dill:3 thyme:2 bay-leaf:3 parsley:2 chives:1 basil:1 cucumber:4 beet:3 cabbage:3 onion:3 red-onion:3 potato:3 tomato:2 bell-pepper:3 green-bean:2 lettuce:3 fennel:1 carrot:2 celery:1 radish:2 chile:3 ginger:2 mustard:4 caper:3 anchovy:3 olive:2 egg:3 fish:3 cod:3 mackerel:3 herring:4 oyster:4 mussels:1 shrimp:2 chicken:2 pork:3 beef:2 liver:3 duck:2 lamb:2 sausage:2 bacon:3 butter:2 cream:2 blue-cheese:2 feta:2 goat-cheese:2 bread:2 rice:1 lentil:3 bean:3 chickpea:2 strawberry:2 raspberry:2 cherry:2 fig:1 pear:1 apple:2 pickles:4 clove:3 coriander-seed:2 juniper:2 caraway:2 allspice:2 white-wine:1 brown-sugar:2 fish-sauce:1 soy-sauce:2",
  },
  "balsamic-vinegar": {
    name: "balsamic vinegar", aliases: ["balsamic", "aceto balsamico"], cat: "acid",
    taste: "sour sweet", weight: 2, volume: 3, season: "all", techniques: "drizzle reduce glaze", cuisines: { italian: 4 }, chips: ["Modena", "Emilian"], dishes: "dressings glazes desserts salads", art: "bottle",
    pairs: "strawberry:4 tomato:4 olive-oil:4 parmesan:4 mozzarella:3 burrata:3 goat-cheese:3 ricotta:1 basil:3 arugula:3 radicchio:4 onion:3 red-onion:2 shallot:2 caramelized-onion:3 fig:3 peach:3 cherry:3 pear:2 raspberry:2 blueberry:2 blackberry:1 orange:2 grape:2 beet:3 brussels-sprout:3 squash:2 mushroom:2 asparagus:2 eggplant:2 zucchini:1 bell-pepper:2 potato:1 fennel:1 kale:1 spinach:2 green-bean:1 avocado:1 chicken:2 beef:2 steak:2 pork:1 duck:3 lamb:2 veal:1 liver:3 bacon:2 prosciutto:3 sausage:1 salmon:1 scallop:2 shrimp:1 tuna:2 egg:1 honey:2 sugar:1 vanilla:2 chocolate:2 cream:2 mascarpone:1 ice-cream:3 vanilla:2 black-pepper:3 salt:2 rosemary:2 thyme:2 sage:1 mint:1 garlic:2 chile:1 mustard:1 walnut:2 hazelnut:1 pine-nut:2 almond:1 pistachio:1 bread:3 pasta:1 risotto:1 rice:1 polenta:1 watermelon:2 melon:1 cucumber:1 bean:1 lentil:2",
  },
  "sherry-vinegar": {
    name: "sherry vinegar", aliases: ["vinagre de jerez"], cat: "acid",
    taste: "sour", weight: 1, volume: 3, season: "all", techniques: "dress deglaze", cuisines: { mediterranean: 4, french: 3 }, chips: ["Spanish", "Andalusian"], dishes: "dressings gazpacho sauces", art: "bottle",
    pairs: "olive-oil:4 garlic:3 shallot:3 onion:2 tomato:3 bell-pepper:3 cucumber:2 almond:3 hazelnut:2 walnut:3 lentil:3 chickpea:2 bean:2 paprika:3 saffron:1 cumin:1 chorizo:3 ham:2 prosciutto:1 pork:2 chicken:2 duck:2 liver:3 beef:2 lamb:1 squid:2 octopus:2 shrimp:2 cod:2 tuna:1 anchovy:2 egg:2 mushroom:2 cauliflower:2 asparagus:1 artichoke:1 beet:2 fennel:1 potato:2 cabbage:1 brussels-sprout:1 green-bean:1 pear:1 fig:1 grape:2 orange:1 honey:3 sugar:1 butter:2 cream:1 manchego:1 goat-cheese:2 blue-cheese:1 parsley:2 thyme:2 bay-leaf:1 tarragon:1 chive:1 black-pepper:2 salt:2 sherry:3 mustard:2 harissa:1 bread:2 rice:1",
  },
  "cider-vinegar": {
    name: "cider vinegar", aliases: ["apple cider vinegar"], cat: "acid",
    taste: "sour sweet:1", weight: 1, volume: 3, season: "all", techniques: "dress pickle glaze", cuisines: { french: 2 }, chips: ["Norman", "British", "American"], dishes: "dressings pickles slaws glazes", art: "bottle",
    pairs: "apple:4 pork:4 cabbage:4 honey:3 mustard:3 maple-syrup:2 brown-sugar:2 sugar:2 onion:2 shallot:2 beet:2 carrot:2 cucumber:2 celery:1 potato:1 kale:1 brussels-sprout:1 sweet-potato:1 bacon:2 ham:2 chicken:2 sausage:1 duck:1 mackerel:2 herring:2 trout:1 cheddar:2 blue-cheese:1 cream:1 butter:2 olive-oil:3 caraway:2 dill:2 mustard:3 thyme:1 sage:1 chile:2 ginger:2 black-pepper:2 salt:3 bean:1 lentil:1 cider:3 pickles:3 mayonnaise:2 horseradish:2 pear:1 cranberry:2 raisin:1 walnut:1",
  },
  "rice-vinegar": {
    name: "rice vinegar", aliases: ["rice wine vinegar", "black vinegar", "chinkiang vinegar"], cat: "acid",
    taste: "sour sweet:1", weight: 1, volume: 2, season: "all", techniques: "dress pickle season", cuisines: { "east-asian": 4, "se-asian": 2 }, chips: ["Japanese", "Chinese", "Korean"], dishes: "sushi pickles dressings dipping-sauces", art: "bottle",
    pairs: "soy-sauce:4 ginger:4 sesame:4 sugar:3 mirin:3 scallion:2 garlic:3 chile:3 cucumber:4 cabbage:2 carrot:2 radish:3 seaweed:2 rice:4 noodles:3 tofu:3 egg:1 shrimp:2 fish:2 tuna:2 salmon:2 mackerel:3 crab:2 scallop:1 pork:3 chicken:2 beef:1 duck:1 dumpling:4 pickles:4 kimchi:2 miso:2 wasabi:2 honey:1 peanut:2 cilantro:2 mint:1 lime:1 fish-sauce:1 star-anise:1 black-pepper:1 salt:2 oyster:2 avocado:1 bok-choy:2 broccoli:1 green-bean:1 mushroom:2 shiitake:2",
  },
  honey: {
    name: "honey", aliases: ["raw honey", "clear honey"], cat: "sweetener",
    taste: "sweet", weight: 2, volume: 3, season: "all", techniques: "drizzle glaze sweeten", cuisines: { "middle-eastern": 4, mediterranean: 3, french: 3, "east-asian": 2 }, chips: ["Greek", "Provençal", "Persian", "Turkish"], dishes: "desserts glazes dressings baking cheese-plates", art: "honey",
    pairs: "lemon:4 ginger:4 mustard:4 yogurt:4 goat-cheese:4 feta:3 blue-cheese:4 pecorino:4 gorgonzola:4 ricotta:4 halloumi:4 labneh:3 brie:3 manchego:3 cream-cheese:2 mascarpone:3 cream:3 butter:3 milk:3 walnut:3 almond:4 pistachio:4 hazelnut:3 pecan:3 pine-nut:3 sesame:4 peanut:3 cashew:3 oats:4 bread:3 pastry:3 pita:2 rice:2 fig:4 pear:3 apple:3 orange:3 lemon:4 lime:3 grapefruit:3 peach:3 apricot:3 banana:3 date:2 pomegranate:2 quince:3 plum:2 strawberry:2 blueberry:2 raspberry:2 cherry:2 melon:2 mango:2 pineapple:2 rhubarb:2 cranberry:2 grape:2 coconut:2 carrot:3 sweet-potato:2 squash:2 beet:2 fennel:1 onion:2 shallot:1 garlic:2 tomato:1 eggplant:2 brussels-sprout:2 cabbage:1 radicchio:3 turnip:2 parsnip:3 chicken:3 duck:3 pork:3 ham:3 lamb:3 beef:1 salmon:3 shrimp:2 chile:3 black-pepper:2 salt:3 thyme:3 rosemary:3 lavender:4 sage:2 mint:3 basil:2 cinnamon:3 cardamom:3 vanilla:3 clove:2 nutmeg:2 star-anise:2 saffron:3 rose:3 orange-blossom:3 chocolate:2 coffee:2 tea:4 caramel:2 soy-sauce:3 miso:3 sriracha:3 vinegar:3 cider-vinegar:3 balsamic-vinegar:2 sherry-vinegar:3 lemon:4 whisky:3 bourbon:3 rum:2 gin:2 brandy:2 beer:2 tahini:4 harissa:3 za-atar:2 sumac:1 truffle:2 egg:2",
  },
  sugar: {
    name: "sugar", aliases: ["caster sugar", "white sugar", "icing sugar"], cat: "sweetener",
    taste: "sweet", weight: 1, volume: 3, season: "all", techniques: "caramelize cream whisk", cuisines: { french: 4 }, dishes: "desserts baking drinks", art: "honey",
    pairs: "butter:4 egg:4 vanilla:4 cream:4 milk:3 flour:4 chocolate:4 caramel:4 lemon:4 lime:3 orange:3 strawberry:3 raspberry:3 apple:3 pear:2 peach:2 cherry:3 rhubarb:4 cinnamon:4 cardamom:3 ginger:3 nutmeg:2 clove:2 star-anise:2 coffee:3 tea:3 cocoa:4 almond:4 hazelnut:3 walnut:2 pecan:3 pistachio:3 coconut:3 rum:3 brandy:2 bourbon:2 meringue:4 pastry:4 shortbread:4 custard:4 ice-cream:4 rice:2 oats:2 honey:2 salt:3 mint:3 rose:3 lavender:2 vinegar:3 chile:2 tomato:1 onion:2 carrot:1 pork:2 duck:1 ham:2 fish-sauce:3 soy-sauce:3 lime:3 tamarind:3 coconut-milk:3 mango:3 banana:3 pineapple:2 passion-fruit:3 fig:1 date:1 cranberry:4 blackberry:3 blueberry:3 quince:3 plum:3 apricot:3 grapefruit:2",
  },
  "brown-sugar": {
    name: "brown sugar", aliases: ["muscovado", "demerara", "light brown sugar"], cat: "sweetener",
    taste: "sweet bitter:1", weight: 2, volume: 3, season: "all", techniques: "cream glaze rub", cuisines: { latin: 2, "east-asian": 2, "se-asian": 2 }, chips: ["American", "British", "Caribbean"], dishes: "baking glazes rubs sauces", art: "honey",
    pairs: "butter:4 cinnamon:4 vanilla:3 oats:4 apple:3 banana:4 pear:2 pineapple:4 peach:3 sweet-potato:3 squash:2 carrot:2 pumpkin:3 rum:4 bourbon:3 whisky:2 brandy:1 coffee:2 chocolate:3 caramel:3 pecan:4 walnut:3 almond:2 hazelnut:2 peanut:3 coconut:3 ginger:3 nutmeg:2 clove:3 allspice:3 cardamom:1 star-anise:2 chile:3 mustard:3 soy-sauce:3 fish-sauce:3 lime:2 tamarind:3 vinegar:2 cider-vinegar:2 pork:3 ham:3 bacon:3 chicken:2 duck:1 salmon:3 shrimp:2 beef:1 cream:2 milk:2 yogurt:1 cream-cheese:2 egg:2 pastry:3 bread:2 rice:2 sticky-rice:3 molasses:3 maple-syrup:2 honey:1 salt:3 black-pepper:1 raisin:3 date:2 fig:1 cranberry:2 grapefruit:3 orange:1 coconut-milk:3 condensed-milk:1",
  },
  "maple-syrup": {
    name: "maple syrup", aliases: ["maple"], cat: "sweetener",
    taste: "sweet", weight: 2, volume: 3, season: "autumn winter all", techniques: "glaze drizzle bake", cuisines: { french: 1 }, chips: ["Canadian", "American"], dishes: "breakfast glazes baking roasts", art: "honey",
    pairs: "bacon:4 butter:4 pecan:4 walnut:4 oats:4 pancake:4 bread:2 sweet-potato:4 squash:3 pumpkin:3 carrot:2 brussels-sprout:3 parsnip:3 turnip:2 beet:1 onion:1 apple:3 pear:2 banana:3 blueberry:3 cranberry:3 peach:1 plum:1 fig:1 orange:1 pork:3 ham:3 sausage:2 chicken:2 duck:2 turkey:2 salmon:3 shrimp:1 cream:3 milk:2 yogurt:2 ice-cream:3 cream-cheese:2 goat-cheese:1 cheddar:2 blue-cheese:2 brie:1 egg:2 custard:2 pastry:3 vanilla:3 cinnamon:3 nutmeg:2 ginger:2 cardamom:1 chile:2 mustard:3 soy-sauce:2 miso:2 vinegar:2 cider-vinegar:2 bourbon:4 whisky:3 rum:2 coffee:2 chocolate:2 caramel:2 hazelnut:2 almond:2 peanut:2 coconut:1 salt:3 black-pepper:2 rosemary:1 thyme:1 sage:1 tahini:2 sesame:1 kale:1",
  },
  molasses: {
    name: "molasses", aliases: ["treacle", "black treacle"], cat: "sweetener",
    taste: "sweet bitter", weight: 3, volume: 4, season: "winter all", techniques: "bake glaze", cuisines: { latin: 1 }, chips: ["American", "British", "Caribbean"], dishes: "baking glazes beans", art: "honey",
    pairs: "ginger:4 cinnamon:3 clove:3 allspice:2 nutmeg:2 black-pepper:2 brown-sugar:3 butter:3 bean:3 pork:3 ham:3 bacon:2 beef:1 chicken:1 mustard:2 vinegar:2 cider-vinegar:1 rum:3 bourbon:2 coffee:2 chocolate:2 oats:2 bread:3 rye:2 pastry:2 cornbread:2 gingerbread:4 lemon:1 orange:2 apple:1 pear:1 raisin:2 date:1 walnut:1 pecan:2 peanut:1 egg:1 cream:1 milk:2 salt:2 tomato:2 onion:2 chile:1 sweet-potato:1 squash:1 pumpkin:2",
  },
  caramel: {
    name: "caramel", aliases: ["dulce de leche", "salted caramel", "butterscotch"], cat: "sweetener",
    taste: "sweet bitter:1", weight: 3, volume: 3, season: "all", techniques: "cook sauce drizzle", cuisines: { french: 4, latin: 3 }, chips: ["Breton", "Argentine", "American"], dishes: "desserts sauces baking", art: "honey",
    pairs: "salt:4 butter:4 cream:4 vanilla:4 chocolate:4 apple:4 pear:3 banana:4 peach:2 fig:2 date:3 orange:3 lemon:1 pineapple:3 coconut:3 passion-fruit:2 mango:1 plum:1 quince:1 cherry:1 strawberry:2 raspberry:1 coffee:4 cocoa:3 tea:1 pecan:4 hazelnut:4 almond:3 walnut:3 peanut:4 pistachio:2 macadamia:3 cashew:2 sesame:3 pastry:4 shortbread:3 ice-cream:4 custard:3 meringue:2 bread:1 oats:2 rice:1 milk:3 condensed-milk:3 cream-cheese:3 mascarpone:3 ricotta:1 yogurt:1 blue-cheese:2 goat-cheese:1 cinnamon:2 cardamom:2 ginger:2 nutmeg:1 star-anise:2 black-pepper:2 chile:2 rum:3 bourbon:3 whisky:3 brandy:2 calvados:3 beer:1 sweet-potato:1 squash:1 onion:1 pork:1 duck:1 scallop:1 popcorn:4 miso:3 soy-sauce:2 tahini:2",
  },
  chocolate: {
    name: "chocolate", aliases: ["dark chocolate", "milk chocolate", "cocoa nibs"], cat: "sweetener",
    taste: "bitter sweet", weight: 3, volume: 4, season: "all", techniques: "melt temper shave bake", cuisines: { french: 4, latin: 3, italian: 2 }, chips: ["Belgian", "Swiss", "Mexican", "Piedmontese"], dishes: "desserts baking drinks sauces", art: "chocolate",
    pairs: "orange:4 raspberry:4 cherry:4 hazelnut:4 almond:4 coffee:4 vanilla:4 caramel:4 cream:4 butter:4 salt:4 chile:3 cinnamon:4 cardamom:3 ginger:3 nutmeg:2 clove:2 star-anise:3 black-pepper:2 mint:4 rose:2 lavender:2 basil:1 thyme:1 rosemary:2 bay-leaf:1 banana:4 pear:4 strawberry:3 blackberry:2 blueberry:1 fig:2 date:3 apricot:2 passion-fruit:2 mango:1 pineapple:1 coconut:3 lime:2 lemon:1 grapefruit:1 pomegranate:2 plum:2 prune:3 quince:1 cranberry:1 walnut:3 pecan:3 pistachio:3 peanut:4 cashew:2 macadamia:2 chestnut:4 pine-nut:1 sesame:2 tahini:3 milk:4 condensed-milk:2 mascarpone:3 ricotta:3 cream-cheese:3 yogurt:1 goat-cheese:1 blue-cheese:2 parmesan:1 egg:3 pastry:4 shortbread:3 meringue:3 ice-cream:4 custard:3 bread:3 brioche:3 oats:3 rice:1 red-wine:3 port:3 brandy:3 rum:3 bourbon:3 whisky:3 amaretto:3 kirsch:3 grand-marnier:4 beer:2 stout:3 tea:2 earl-grey:3 honey:2 maple-syrup:2 sugar:4 brown-sugar:3 molasses:2 olive-oil:3 beet:2 sweet-potato:1 avocado:1 zucchini:1 squash:1 cocoa:4 white-chocolate:2 balsamic-vinegar:2 duck:1 venison:3 beef:2 rabbit:1 turkey:2 chipotle:2 miso:2 peppercorn:2 cheese:1",
  },
  "white-chocolate": {
    name: "white chocolate", aliases: [], cat: "sweetener",
    taste: "sweet", weight: 3, volume: 2, season: "all", techniques: "melt whip bake", cuisines: { french: 3 }, dishes: "desserts baking", art: "chocolate",
    pairs: "raspberry:4 strawberry:3 passion-fruit:3 lemon:3 lime:2 orange:1 blueberry:2 cherry:1 cranberry:2 rhubarb:3 mango:1 pineapple:1 coconut:3 banana:1 fig:1 pear:1 pistachio:3 macadamia:4 hazelnut:2 almond:2 pecan:1 cashew:1 vanilla:3 cardamom:2 rose:3 lavender:3 saffron:2 ginger:1 cinnamon:1 mint:1 basil:1 lemongrass:2 matcha:4 tea:2 earl-grey:2 coffee:2 cream:4 milk:3 mascarpone:2 cream-cheese:2 yogurt:2 butter:3 egg:2 sugar:3 honey:2 caramel:2 chocolate:2 pastry:3 shortbread:3 meringue:3 ice-cream:3 oats:1 salt:2 olive-oil:2 miso:1 champagne:2 gin:1",
  },
  cocoa: {
    name: "cocoa", aliases: ["cocoa powder", "cacao"], cat: "sweetener",
    taste: "bitter astringent", weight: 2, volume: 4, season: "all", techniques: "dust bake whisk", cuisines: { latin: 3, french: 3, italian: 2 }, chips: ["Mexican", "Aztec"], dishes: "baking drinks desserts rubs", art: "chocolate",
    pairs: "chocolate:4 sugar:4 vanilla:4 milk:4 cream:3 butter:3 egg:3 coffee:4 cinnamon:3 chile:4 cardamom:2 nutmeg:1 clove:1 star-anise:1 salt:3 orange:3 cherry:3 raspberry:2 banana:3 date:2 fig:1 prune:2 hazelnut:4 almond:3 walnut:2 pecan:2 pistachio:2 peanut:2 coconut:2 mascarpone:4 ricotta:2 cream-cheese:2 yogurt:1 oats:2 pastry:3 bread:2 tiramisu:4 rum:2 brandy:2 bourbon:2 red-wine:2 beer:2 beef:3 chicken:2 pork:2 turkey:3 duck:1 venison:2 cumin:2 oregano:1 tomato:1 onion:1 black-bean:2 sesame:1 tahini:1 honey:1 maple-syrup:1 mint:2 caramel:2 avocado:1 beet:2 sweet-potato:1 mole:4",
  },
  vanilla: {
    name: "vanilla", aliases: ["vanilla bean", "vanilla pod", "vanilla extract"], cat: "spice",
    taste: "sweet", weight: 1, volume: 3, season: "all", techniques: "infuse scrape bake", cuisines: { french: 4, latin: 2 }, chips: ["Madagascan", "Tahitian", "Mexican"], dishes: "desserts custards baking drinks", art: "vanilla",
    pairs: "cream:4 sugar:4 milk:4 egg:4 butter:4 custard:4 ice-cream:4 chocolate:4 caramel:4 coffee:3 cocoa:3 honey:3 maple-syrup:3 brown-sugar:3 strawberry:4 raspberry:3 peach:4 apricot:3 cherry:3 pear:4 apple:3 banana:3 pineapple:3 mango:2 coconut:3 passion-fruit:3 orange:3 lemon:3 lime:1 grapefruit:2 fig:2 plum:3 quince:3 rhubarb:3 blueberry:3 blackberry:3 cranberry:2 date:2 prune:2 melon:1 almond:3 hazelnut:3 pecan:3 pistachio:2 walnut:2 macadamia:2 chestnut:3 coconut:3 cinnamon:3 cardamom:3 nutmeg:2 clove:1 star-anise:2 ginger:2 saffron:2 rose:2 lavender:3 mint:1 black-pepper:2 chile:1 salt:2 rum:4 bourbon:4 brandy:3 whisky:2 amaretto:2 cognac:3 champagne:1 mascarpone:3 ricotta:3 cream-cheese:4 yogurt:2 crème-fraîche:2 pastry:4 shortbread:3 meringue:4 oats:3 rice:3 bread:2 brioche:3 lobster:3 scallop:2 shrimp:1 crab:1 chicken:1 pork:1 squash:1 sweet-potato:1 carrot:1 beet:1 tomato:1 corn:1 olive-oil:2 tea:2 earl-grey:2 white-chocolate:3 sesame:1 tahini:1 condensed-milk:3",
  },
  coffee: {
    name: "coffee", aliases: ["espresso", "coffee beans"], cat: "other",
    taste: "bitter sour:1", weight: 2, volume: 4, season: "all", techniques: "brew infuse rub", cuisines: { italian: 4, french: 2, "middle-eastern": 3, latin: 2 }, chips: ["Italian", "Turkish", "Ethiopian", "Vietnamese"], dishes: "desserts drinks rubs baking", art: "coffee",
    pairs: "chocolate:4 cocoa:4 cream:4 milk:4 sugar:4 vanilla:3 caramel:4 cardamom:4 cinnamon:3 nutmeg:1 clove:1 star-anise:1 chile:2 black-pepper:1 orange:3 lemon:1 banana:3 date:3 fig:1 cherry:2 raspberry:1 coconut:2 hazelnut:4 almond:3 walnut:3 pecan:2 pistachio:1 peanut:1 chestnut:1 mascarpone:4 ricotta:2 cream-cheese:1 yogurt:1 condensed-milk:4 egg:2 butter:2 pastry:3 tiramisu:4 shortbread:2 ice-cream:4 custard:2 oats:1 bread:2 rum:3 brandy:3 whisky:3 bourbon:3 amaretto:3 kahlua:4 baileys:3 beer:1 stout:3 honey:2 maple-syrup:2 brown-sugar:2 molasses:2 beef:3 steak:2 pork:2 lamb:1 duck:1 chicken:1 venison:1 mushroom:1 onion:1 tomato:1 miso:1 soy-sauce:1 tahini:1 sesame:1 rose:1 orange-blossom:1 tonic:2",
  },
  tea: {
    name: "tea", aliases: ["black tea", "green tea", "matcha", "earl grey"], cat: "other",
    taste: "bitter astringent", weight: 1, volume: 3, season: "all", techniques: "brew infuse smoke", cuisines: { "east-asian": 4, indian: 3, "middle-eastern": 2, french: 1 }, chips: ["Japanese", "Chinese", "British", "Moroccan", "Indian"], dishes: "drinks desserts poaching smoking", art: "coffee",
    pairs: "milk:3 honey:4 lemon:3 sugar:3 cream:3 mint:4 ginger:3 cardamom:4 cinnamon:2 clove:2 star-anise:2 vanilla:2 rose:3 jasmine:4 orange:2 lime:1 peach:2 apricot:1 pear:1 apple:1 fig:1 lychee:3 date:1 raspberry:1 strawberry:1 blueberry:1 chocolate:2 white-chocolate:2 almond:1 pistachio:1 hazelnut:1 coconut:1 rice:3 noodles:2 egg:2 duck:3 chicken:2 pork:2 salmon:2 scallop:1 shrimp:1 tofu:1 pastry:2 shortbread:2 ice-cream:3 custard:2 meringue:1 butter:1 lavender:3 lemongrass:3 gin:2 whisky:2 rum:1 bourbon:1 saffron:1 black-pepper:1 salt:1 sesame:1 soy-sauce:1",
  },
  "soy-sauce": {
    name: "soy sauce", aliases: ["shoyu", "tamari", "light soy", "dark soy"], cat: "condiment",
    taste: "salty", weight: 1, volume: 4, season: "all", techniques: "season marinate glaze dip", cuisines: { "east-asian": 4, "se-asian": 3 }, chips: ["Japanese", "Chinese", "Korean"], dishes: "stir-fries marinades dipping-sauces noodles", art: "bottle",
    pairs: "ginger:4 garlic:4 scallion:4 sesame:4 rice-vinegar:4 mirin:4 sake:3 sugar:3 brown-sugar:3 honey:3 chile:3 star-anise:4 five-spice:3 black-pepper:2 wasabi:3 miso:3 fish-sauce:2 oyster-sauce:3 hoisin:3 lime:2 lemon:1 orange:2 pineapple:2 mango:1 rice:4 noodles:4 tofu:4 egg:3 mushroom:3 shiitake:4 bok-choy:3 broccoli:3 cabbage:2 kale:2 spinach:2 eggplant:3 green-bean:3 cucumber:2 radish:2 corn:1 sweet-potato:2 squash:2 avocado:2 seaweed:3 kimchi:2 pork:4 beef:4 chicken:4 duck:4 lamb:1 salmon:4 tuna:4 mackerel:3 cod:1 sea-bass:3 shrimp:3 scallop:3 squid:2 crab:2 clam:1 oyster:1 peanut:4 cashew:3 almond:1 butter:3 brown-butter:2 cream:1 cheese:1 parmesan:1 caramel:2 chocolate:1 vanilla:1 maple-syrup:2 molasses:1 tamarind:1 lemongrass:2 cilantro:2 basil:1 mint:1 mustard:1 coffee:1 beer:1 whisky:1 dumpling:4 vinegar:2 tomato:1 onion:2 shallot:1 pickles:2 tea:1",
  },
  "fish-sauce": {
    name: "fish sauce", aliases: ["nam pla", "nuoc mam", "colatura"], cat: "condiment",
    taste: "salty", weight: 1, volume: 5, season: "all", techniques: "season dress marinate", cuisines: { "se-asian": 4, "east-asian": 1, italian: 1 }, chips: ["Thai", "Vietnamese", "Filipino"], dishes: "dressings curries soups dipping-sauces", art: "bottle",
    pairs: "lime:4 chile:4 garlic:4 sugar:4 brown-sugar:3 palm-sugar:4 cilantro:4 mint:3 basil:3 scallion:2 shallot:3 ginger:3 lemongrass:4 galangal:3 lime-leaf:3 tamarind:4 coconut-milk:4 coconut:2 peanut:3 cashew:1 rice:3 noodles:4 rice-vinegar:1 vinegar:1 soy-sauce:2 oyster-sauce:2 hoisin:1 shrimp:4 fish:3 squid:3 crab:3 mussels:2 clam:1 scallop:1 pork:4 chicken:3 beef:3 duck:1 egg:3 tofu:2 cucumber:3 cabbage:3 carrot:2 green-bean:2 brussels-sprout:3 broccoli:1 eggplant:3 corn:1 mushroom:2 bean-sprout:2 papaya:4 mango:3 pineapple:2 grapefruit:3 watermelon:2 melon:1 butter:2 caramel:3 honey:1 black-pepper:2 star-anise:2 curry-powder:1 turmeric:1 tomato:2 avocado:1 lettuce:1 radish:1 anchovy:2 bread:1 beer:1",
  },
  miso: {
    name: "miso", aliases: ["white miso", "red miso", "shiro miso"], cat: "condiment",
    taste: "salty sweet:1", weight: 2, volume: 4, season: "all", techniques: "whisk glaze marinate", cuisines: { "east-asian": 4 }, chips: ["Japanese"], dishes: "soups glazes marinades dressings desserts", art: "bottle",
    pairs: "butter:4 brown-butter:3 sesame:3 ginger:3 garlic:2 scallion:3 mirin:4 sake:3 soy-sauce:3 rice-vinegar:2 honey:3 maple-syrup:2 sugar:2 brown-sugar:1 caramel:3 chocolate:2 vanilla:1 banana:2 apple:1 pear:1 eggplant:4 squash:3 sweet-potato:3 mushroom:3 shiitake:3 tofu:4 seaweed:3 cabbage:1 kale:1 spinach:1 bok-choy:2 carrot:1 radish:2 turnip:2 corn:1 cucumber:1 avocado:1 broccoli:2 cauliflower:1 asparagus:1 potato:1 salmon:4 cod:4 black-cod:4 sea-bass:2 mackerel:3 tuna:2 scallop:3 shrimp:2 clam:2 chicken:3 pork:3 beef:2 duck:2 lamb:1 egg:2 rice:2 noodles:4 ramen:4 bread:1 oats:1 pastry:1 ice-cream:2 cream:1 cheese:1 parmesan:1 peanut:2 walnut:1 cashew:1 tahini:2 lime:1 lemon:1 orange:1 chile:2 black-pepper:1 dashi:4 coffee:1 whisky:1",
  },
  tahini: {
    name: "tahini", aliases: ["sesame paste"], cat: "condiment",
    taste: "bitter sweet:1", weight: 3, volume: 3, season: "all", techniques: "whisk drizzle dress", cuisines: { "middle-eastern": 4, "east-asian": 1 }, chips: ["Lebanese", "Israeli", "Turkish", "Palestinian"], dishes: "dips dressings sauces desserts", art: "bottle",
    pairs: "lemon:4 garlic:4 chickpea:4 hummus:4 olive-oil:3 yogurt:3 labneh:1 honey:4 date:3 halva:4 chocolate:3 cocoa:1 banana:2 fig:2 pomegranate:2 orange:1 apple:1 pear:1 cauliflower:4 eggplant:4 beet:2 carrot:2 sweet-potato:2 squash:2 kale:2 spinach:1 cucumber:1 avocado:1 broccoli:1 cabbage:1 zucchini:1 potato:1 falafel:4 lamb:3 chicken:3 beef:1 fish:2 shrimp:1 cod:1 egg:1 tofu:1 pita:4 bread:3 bulgur:1 rice:1 couscous:1 lentil:1 parsley:2 mint:1 cilantro:1 dill:1 cumin:3 paprika:2 sumac:3 za-atar:2 chile:2 harissa:2 black-pepper:2 salt:3 sesame:4 pine-nut:1 walnut:1 pistachio:1 almond:1 maple-syrup:2 caramel:2 vanilla:1 cream:1 ice-cream:2 oats:1 coffee:1 soy-sauce:1 miso:2 ginger:1 pumpkin-seed:1 sugar:1 brown-sugar:1 butter:1",
  },
  harissa: {
    name: "harissa", aliases: ["rose harissa", "chili paste"], cat: "condiment",
    taste: "hot sweet:1", weight: 2, volume: 5, season: "all", techniques: "stir marinate rub", cuisines: { "middle-eastern": 4, mediterranean: 2 }, chips: ["Tunisian", "Moroccan", "Algerian"], dishes: "stews marinades dips couscous", art: "bottle",
    pairs: "lamb:4 chicken:3 beef:2 merguez:4 sausage:1 fish:2 shrimp:2 squid:2 octopus:1 egg:3 chickpea:3 lentil:2 bean:2 couscous:4 rice:1 bulgur:1 bread:2 pita:3 yogurt:3 labneh:2 feta:2 goat-cheese:1 halloumi:3 cream:1 olive-oil:3 lemon:2 preserved-lemon:3 orange:1 lime:1 honey:3 date:2 apricot:2 raisin:1 pomegranate:1 tomato:2 bell-pepper:2 eggplant:3 zucchini:1 carrot:3 cauliflower:2 squash:2 sweet-potato:1 potato:2 onion:2 garlic:3 cumin:3 coriander-seed:2 caraway:3 paprika:1 cinnamon:1 mint:2 cilantro:2 parsley:2 olive:3 almond:1 pine-nut:1 tahini:2 sumac:1 cabbage:1 kale:1 mussels:1 cod:1 tuna:1 mackerel:2 salmon:1 pork:1 mayonnaise:2",
  },
  pesto: {
    name: "pesto", aliases: ["basil pesto", "pesto genovese"], cat: "condiment",
    taste: "salty bitter:1 sweet:1", weight: 2, volume: 4, season: "summer", techniques: "pound toss spread", cuisines: { italian: 4 }, chips: ["Ligurian"], dishes: "pasta sandwiches pizza soups", art: "bottle",
    pairs: "pasta:4 basil:4 pine-nut:4 parmesan:4 garlic:4 olive-oil:4 pecorino:2 tomato:3 mozzarella:4 burrata:3 ricotta:2 goat-cheese:2 bread:3 pizza:3 gnocchi:4 potato:3 green-bean:4 zucchini:3 pea:2 asparagus:2 spinach:1 kale:1 eggplant:2 bell-pepper:1 chicken:3 shrimp:2 salmon:2 cod:1 tuna:1 beef:1 lamb:2 pork:1 egg:2 rice:2 risotto:2 bean:3 lentil:1 chickpea:1 lemon:2 chile:1 walnut:2 almond:2 pistachio:2 hazelnut:1 cream:1 butter:1 black-pepper:2 salt:2 arugula:2 mint:2 parsley:2 avocado:1 corn:1 cauliflower:1",
  },
  mayonnaise: {
    name: "mayonnaise", aliases: ["mayo", "aioli", "garlic mayonnaise"], cat: "condiment",
    taste: "sour:1 sweet:1 salty:1", weight: 3, volume: 2, season: "all", techniques: "whisk emulsify dress", cuisines: { french: 4, mediterranean: 3, "east-asian": 2 }, chips: ["Provençal", "Catalan", "Japanese", "American"], dishes: "sandwiches salads dips sauces", art: "bottle",
    pairs: "egg:4 lemon:4 garlic:4 mustard:4 olive-oil:4 vinegar:3 cider-vinegar:1 rice-vinegar:1 salt:3 black-pepper:3 chile:2 sriracha:4 hot-sauce:3 paprika:2 cayenne:2 saffron:3 curry-powder:3 wasabi:3 miso:2 soy-sauce:1 ketchup:3 pickles:3 cornichon:3 caper:3 anchovy:3 shallot:2 onion:2 scallion:2 chives:3 tarragon:3 dill:3 parsley:2 basil:2 chervil:2 cilantro:2 celery:3 cucumber:2 tomato:2 lettuce:2 avocado:2 potato:4 corn:3 cabbage:3 carrot:2 beet:1 asparagus:2 artichoke:3 green-bean:2 fennel:1 radish:1 chicken:3 turkey:2 ham:2 bacon:3 beef:2 pork:1 tuna:4 salmon:2 smoked-salmon:1 crab:4 lobster:4 shrimp:3 cod:3 squid:4 scallop:1 oyster:2 bread:4 toast:3 fries:4 rice:2 cheese:2 cheddar:2 parmesan:2 apple:1 orange:1 lime:2 honey:1 truffle:3",
  },
  hollandaise: {
    name: "hollandaise", aliases: ["béarnaise", "beurre blanc"], cat: "condiment",
    taste: "sour:1 salty:1", weight: 3, volume: 2, season: "all", techniques: "whisk emulsify", cuisines: { french: 4 }, dishes: "eggs fish vegetables steaks", art: "bottle",
    pairs: "egg:4 butter:4 lemon:4 vinegar:3 white-wine:3 shallot:4 tarragon:4 chervil:3 chives:2 parsley:1 black-pepper:3 salt:3 cayenne:2 asparagus:4 artichoke:3 broccoli:2 cauliflower:1 potato:2 spinach:3 leek:1 fennel:1 salmon:4 sole:3 cod:3 sea-bass:2 scallop:2 lobster:3 crab:3 shrimp:2 oyster:2 trout:2 chicken:2 steak:4 beef:3 veal:1 ham:3 bacon:3 smoked-salmon:3 bread:3 muffin:3 cream:2 orange:3 blood-orange:3 truffle:2 mustard:2 dill:1 saffron:1",
  },
  vinaigrette: {
    name: "vinaigrette", aliases: ["french dressing", "salad dressing"], cat: "condiment",
    taste: "sour", weight: 1, volume: 3, season: "all", techniques: "whisk dress", cuisines: { french: 4, italian: 2 }, dishes: "salads vegetables", art: "bottle",
    pairs: "olive-oil:4 vinegar:4 mustard:4 shallot:4 lemon:3 honey:2 garlic:2 salt:3 black-pepper:3 tarragon:3 chives:2 parsley:2 chervil:2 dill:2 basil:2 thyme:1 lettuce:4 arugula:3 endive:3 radicchio:2 watercress:3 cucumber:2 tomato:3 avocado:2 beet:3 potato:3 leek:4 asparagus:3 artichoke:3 green-bean:4 fennel:2 carrot:2 celery:2 radish:2 pea:1 lentil:3 bean:3 chickpea:2 egg:3 bacon:3 goat-cheese:3 blue-cheese:2 feta:2 parmesan:2 walnut:2 hazelnut:2 almond:1 pine-nut:1 chicken:2 steak:2 salmon:2 tuna:2 shrimp:2 crab:1 anchovy:2 caper:2 orange:2 apple:1 pear:1 fig:1 sherry-vinegar:3 balsamic-vinegar:3 cider-vinegar:2 rice-vinegar:1 walnut-oil:3 cream:1 yogurt:1",
  },
  "preserved-lemon": {
    name: "preserved lemon", aliases: ["salted lemon", "pickled lemon"], cat: "condiment",
    taste: "salty sour", weight: 1, volume: 4, season: "all", techniques: "chop rinse stir", cuisines: { "middle-eastern": 4 }, chips: ["Moroccan", "Tunisian"], dishes: "tagines salads dressings", art: "lemon",
    pairs: "chicken:4 lamb:3 fish:3 cod:2 sea-bass:2 shrimp:2 squid:1 olive:4 olive-oil:3 garlic:3 onion:2 cilantro:3 parsley:3 mint:2 cumin:3 coriander-seed:2 saffron:3 ginger:2 turmeric:2 cinnamon:1 paprika:2 chile:2 harissa:3 ras-el-hanout:3 couscous:4 rice:2 bulgur:1 chickpea:3 lentil:2 bean:1 potato:2 carrot:2 fennel:2 artichoke:2 zucchini:1 eggplant:2 cauliflower:2 tomato:2 cucumber:1 avocado:1 beet:1 date:2 apricot:2 raisin:1 almond:2 pistachio:1 yogurt:2 labneh:1 feta:2 egg:1 butter:1 honey:2 black-pepper:1 pasta:1 bread:1 vinaigrette:2 mayonnaise:2 tahini:1 grapefruit:1 orange:1",
  },
  tamarind: {
    name: "tamarind", aliases: ["tamarind paste", "tamarind concentrate"], cat: "acid",
    taste: "sour sweet", weight: 2, volume: 4, season: "all", techniques: "soak strain stir", cuisines: { "se-asian": 4, indian: 4, latin: 3, "middle-eastern": 2 }, chips: ["Thai", "Tamil", "Mexican", "Persian"], dishes: "curries chutneys sauces drinks", art: "bottle",
    pairs: "chile:4 sugar:4 brown-sugar:3 palm-sugar:4 fish-sauce:4 lime:3 garlic:3 ginger:3 shallot:2 cumin:2 coriander-seed:1 turmeric:2 mustard:2 curry-leaf:3 cardamom:1 cinnamon:1 star-anise:1 black-pepper:1 peanut:3 cashew:1 coconut:2 coconut-milk:3 noodles:3 rice:2 shrimp:3 fish:3 crab:2 squid:1 chicken:3 pork:3 beef:2 lamb:1 duck:2 egg:2 tofu:1 lentil:3 chickpea:2 bean:1 eggplant:2 okra:3 tomato:2 onion:2 potato:2 sweet-potato:1 squash:1 cilantro:2 mint:2 date:3 mango:3 pineapple:2 banana:1 apricot:1 honey:1 molasses:1 soy-sauce:1 vinegar:1 chocolate:1 rum:1 tequila:1",
  },
  "coconut-milk": {
    name: "coconut milk", aliases: ["coconut cream"], cat: "dairy",
    taste: "sweet", weight: 3, volume: 2, season: "all", techniques: "simmer whip reduce", cuisines: { "se-asian": 4, indian: 4, latin: 2 }, chips: ["Thai", "Keralan", "Sri Lankan", "Caribbean", "Goan"], dishes: "curries soups desserts rice", art: "coconut",
    pairs: "lime:4 chile:4 ginger:3 garlic:3 lemongrass:4 galangal:3 lime-leaf:4 cilantro:3 basil:2 mint:1 fish-sauce:4 soy-sauce:1 tamarind:3 turmeric:4 cumin:2 coriander-seed:2 cardamom:2 cinnamon:2 curry-leaf:3 curry-powder:3 mustard:2 star-anise:1 black-pepper:1 shrimp:4 fish:3 cod:2 sea-bass:2 mussels:3 crab:2 squid:1 scallop:1 chicken:4 pork:2 beef:3 lamb:2 duck:1 egg:1 tofu:3 lentil:3 chickpea:3 bean:1 black-bean:1 rice:4 sticky-rice:4 noodles:3 squash:3 sweet-potato:3 eggplant:3 spinach:1 cauliflower:2 carrot:1 corn:2 mushroom:2 green-bean:1 bok-choy:1 pineapple:3 mango:4 banana:2 papaya:1 passion-fruit:2 lychee:2 coconut:3 sugar:3 brown-sugar:3 palm-sugar:4 honey:1 condensed-milk:1 vanilla:2 chocolate:2 caramel:2 white-chocolate:1 cashew:3 peanut:4 almond:1 pumpkin:2 pumpkin-seed:1 rum:3 salt:2 shallot:3 onion:2 tomato:2 avocado:1",
  },
  "condensed-milk": {
    name: "condensed milk", aliases: ["sweetened condensed milk", "evaporated milk"], cat: "dairy",
    taste: "sweet", weight: 3, volume: 2, season: "all", techniques: "stir boil whip", cuisines: { "se-asian": 3, latin: 3, indian: 2 }, chips: ["Vietnamese", "Brazilian", "Thai", "Filipino"], dishes: "desserts drinks", art: "milk",
    pairs: "coffee:4 tea:3 lime:4 lemon:3 coconut:3 coconut-milk:1 mango:3 banana:2 pineapple:1 strawberry:2 passion-fruit:2 cherry:1 chocolate:3 cocoa:2 caramel:4 vanilla:3 cardamom:3 cinnamon:1 saffron:2 rose:2 egg:3 cream:2 milk:2 butter:2 cream-cheese:2 pastry:2 bread:2 rice:2 sticky-rice:2 oats:1 peanut:2 cashew:1 almond:2 pistachio:2 sesame:1 sugar:1 honey:1 rum:1 salt:1 chile:1 ice-cream:3",
  },
  ghee: {
    name: "ghee", aliases: ["clarified butter"], cat: "oil",
    taste: "sweet:1", weight: 3, volume: 2, season: "all", techniques: "fry temper roast", cuisines: { indian: 4, "middle-eastern": 2 }, chips: ["Punjabi", "Keralan"], dishes: "curries rice breads sweets", art: "butter",
    pairs: "rice:4 lentil:4 cumin:4 mustard:3 curry-leaf:3 turmeric:3 cardamom:3 cinnamon:2 clove:2 garam-masala:3 ginger:3 garlic:3 chile:3 onion:3 potato:2 cauliflower:2 spinach:2 pea:2 paneer:4 chickpea:2 chicken:3 lamb:3 fish:2 shrimp:2 egg:2 naan:4 bread:2 honey:2 sugar:2 cashew:2 almond:2 pistachio:1 raisin:1 saffron:2 coconut:1 yogurt:1 milk:1 black-pepper:1 salt:2 squash:1 sweet-potato:1 carrot:1",
  },
  truffle: {
    name: "truffle", aliases: ["black truffle", "white truffle", "truffle oil"], cat: "other",
    taste: "bitter:1 salty:1", weight: 1, volume: 5, season: "autumn winter", techniques: "shave infuse", cuisines: { french: 4, italian: 4 }, chips: ["Périgord", "Piedmontese", "Umbrian"], dishes: "pasta risotto eggs potatoes", art: "mushroom",
    pairs: "egg:4 butter:4 cream:4 parmesan:4 pasta:4 risotto:4 gnocchi:3 polenta:3 potato:4 bread:3 brioche:1 cheese:3 gruyere:2 brie:3 mozzarella:2 ricotta:1 goat-cheese:1 fontina:3 mushroom:4 porcini:3 cauliflower:2 celeriac:3 asparagus:2 leek:2 onion:1 shallot:2 garlic:1 chicken:4 beef:3 steak:3 veal:2 duck:2 pork:1 foie-gras:3 scallop:3 lobster:3 crab:1 cod:1 sole:2 salmon:1 shrimp:1 chestnut:1 hazelnut:1 walnut:1 honey:2 chocolate:1 madeira:2 brandy:2 champagne:2 white-wine:1 red-wine:2 olive-oil:3 salt:3 black-pepper:3 thyme:1 chives:1 parsley:1 mayonnaise:3 corn:1 pea:1 pizza:2 rice:2",
  },
  pickles: {
    name: "pickles", aliases: ["gherkin", "cornichon", "pickled cucumber", "pickle"], cat: "condiment",
    taste: "sour salty", weight: 1, volume: 4, season: "all", techniques: "brine ferment chop", cuisines: { french: 2, "east-asian": 2, "middle-eastern": 2 }, chips: ["German", "Polish", "Korean", "American", "Jewish"], dishes: "sandwiches burgers charcuterie salads", art: "cucumber",
    pairs: "cucumber:4 vinegar:4 dill:4 mustard:4 garlic:3 salt:3 sugar:2 black-pepper:2 chile:2 bay-leaf:2 clove:2 coriander-seed:2 caraway:3 juniper:2 allspice:2 turmeric:1 ginger:1 beet:2 cabbage:3 onion:3 red-onion:3 carrot:2 radish:2 green-bean:2 cauliflower:2 bell-pepper:2 jalapeño:3 lemon:2 lime:1 bread:3 rye:3 burger:4 sandwich:4 cheese:3 cheddar:4 gruyere:3 cream-cheese:1 ham:3 pork:3 bacon:2 sausage:3 beef:3 pastrami:4 chicken:2 turkey:2 liver:3 pâté:3 egg:3 tuna:2 herring:3 salmon:2 smoked-salmon:2 mayonnaise:3 tartar-sauce:4 ketchup:2 potato:3 fries:2 rice:2 noodles:1 butter:2 sour-cream:1 cream:1 horseradish:2 honey:1 beer:3 vodka:3 gin:1 bourbon:2",
  },
  ketchup: {
    name: "ketchup", aliases: ["tomato ketchup"], cat: "condiment",
    taste: "sweet sour salty:1", weight: 2, volume: 3, season: "all", techniques: "squeeze stir glaze", cuisines: { latin: 1 }, chips: ["American", "British"], dishes: "burgers fries sauces glazes", art: "bottle",
    pairs: "fries:4 potato:3 burger:4 beef:3 pork:2 chicken:2 bacon:2 sausage:3 ham:1 egg:3 bread:3 cheese:2 cheddar:2 mayonnaise:3 mustard:3 pickles:2 onion:2 garlic:1 vinegar:2 brown-sugar:3 molasses:2 honey:1 worcestershire:3 hot-sauce:2 chile:2 paprika:1 shrimp:3 cocktail-sauce:4 horseradish:3 tomato:3 bean:2 rice:1 tortilla:1 clove:1 allspice:1 celery:1 cabbage:1",
  },
  "hot-sauce": {
    name: "hot sauce", aliases: ["sriracha", "tabasco", "chili sauce", "sambal"], cat: "condiment",
    taste: "hot sour:1 salty:1", weight: 1, volume: 5, season: "all", techniques: "dash stir glaze", cuisines: { latin: 4, "se-asian": 4, "east-asian": 3 }, chips: ["Mexican", "Thai", "Louisiana", "Korean"], dishes: "eggs tacos noodles wings", art: "bottle",
    pairs: "egg:4 chicken:4 shrimp:3 fish:2 pork:3 beef:2 tofu:2 avocado:3 corn:3 bean:2 black-bean:2 rice:3 noodles:3 tortilla:3 bread:1 potato:2 fries:3 cabbage:2 cucumber:2 pineapple:2 mango:2 lime:4 lemon:1 cilantro:3 garlic:3 ginger:2 scallion:2 onion:2 vinegar:3 honey:3 sugar:2 brown-sugar:1 maple-syrup:2 butter:3 mayonnaise:4 sour-cream:3 yogurt:2 cream-cheese:2 cheese:3 cheddar:2 blue-cheese:4 feta:1 cotija:2 peanut:3 sesame:2 soy-sauce:3 fish-sauce:3 oyster:3 crab:2 clam:2 tomato:2 ketchup:2 pickles:2 bacon:2 sausage:2 chile:4 cumin:2 oregano:1 beer:3 tequila:2 vodka:2 chocolate:1",
  },
  "curry-powder": {
    name: "curry powder", aliases: ["madras curry powder", "curry spice"], cat: "spice",
    taste: "bitter sweet:1 hot:1", weight: 1, volume: 4, season: "all", techniques: "bloom rub stir", cuisines: { indian: 3, "se-asian": 2, "east-asian": 2, french: 1 }, chips: ["Anglo-Indian", "Japanese", "Caribbean", "Malaysian"], dishes: "curries soups salads mayonnaise", art: "spice",
    pairs: "cauliflower:4 lentil:4 chickpea:3 potato:3 sweet-potato:2 squash:3 carrot:2 cabbage:1 onion:3 spinach:2 pea:2 corn:1 eggplant:2 mushroom:1 tomato:2 chicken:4 lamb:3 beef:2 pork:1 fish:3 shrimp:3 mussels:3 cod:2 scallop:2 crab:2 egg:3 tofu:1 rice:4 noodles:2 bread:1 naan:3 coconut-milk:4 coconut:3 yogurt:3 cream:2 butter:2 ghee:3 mayonnaise:3 mango:2 apple:3 raisin:3 banana:2 pineapple:2 apricot:1 lime:2 lemon:2 tamarind:2 cilantro:3 mint:1 garlic:3 ginger:3 chile:3 cumin:2 turmeric:3 coriander-seed:2 cardamom:1 cinnamon:1 mustard:2 curry-leaf:2 black-pepper:1 salt:2 honey:2 sugar:1 brown-sugar:1 peanut:2 cashew:2 almond:1 chutney:3",
  },
  "five-spice": {
    name: "five-spice", aliases: ["chinese five spice"], cat: "spice",
    taste: "sweet bitter:1 hot:1", weight: 1, volume: 4, season: "all", techniques: "rub braise roast", cuisines: { "east-asian": 4 }, chips: ["Cantonese", "Sichuan"], dishes: "roasts braises marinades", art: "spice",
    pairs: "pork:4 duck:4 chicken:3 beef:2 lamb:1 goose:2 salmon:1 shrimp:1 tofu:2 egg:2 soy-sauce:4 hoisin:4 honey:3 sugar:2 brown-sugar:2 ginger:3 garlic:3 scallion:3 star-anise:3 cinnamon:2 clove:2 fennel-seed:2 black-pepper:2 chile:2 sesame:2 rice:3 noodles:3 pancake:3 cabbage:2 squash:1 sweet-potato:2 mushroom:2 bok-choy:1 orange:2 plum:3 pear:1 apple:1 chocolate:1 rice-vinegar:2 oyster-sauce:1 peanut:1 cucumber:2",
  },
  "ras-el-hanout": {
    name: "ras el hanout", aliases: ["moroccan spice blend", "baharat"], cat: "spice",
    taste: "sweet bitter:1 hot:1", weight: 1, volume: 4, season: "all", techniques: "rub stir bloom", cuisines: { "middle-eastern": 4 }, chips: ["Moroccan", "Tunisian"], dishes: "tagines couscous roasts", art: "spice",
    pairs: "lamb:4 chicken:4 beef:2 fish:2 shrimp:1 squid:1 egg:1 couscous:4 chickpea:3 lentil:2 rice:2 bulgur:1 bread:1 carrot:3 squash:3 sweet-potato:2 eggplant:2 cauliflower:2 potato:2 onion:3 tomato:2 turnip:2 zucchini:1 apricot:3 date:3 raisin:2 prune:3 fig:1 orange:2 lemon:2 preserved-lemon:4 pomegranate:1 almond:3 pistachio:1 pine-nut:1 honey:3 olive-oil:3 olive:3 harissa:3 cumin:3 coriander-seed:2 cinnamon:3 ginger:2 saffron:2 turmeric:2 paprika:2 cardamom:2 rose:2 black-pepper:2 salt:2 cilantro:3 parsley:2 mint:2 garlic:3 yogurt:2 butter:1",
  },
  "garam-masala": {
    name: "garam masala", aliases: [], cat: "spice",
    taste: "sweet bitter:1 hot:1", weight: 1, volume: 4, season: "all", techniques: "finish bloom", cuisines: { indian: 4 }, chips: ["Punjabi", "Mughlai"], dishes: "curries dals rice", art: "spice",
    pairs: "chicken:4 lamb:4 beef:2 pork:1 fish:2 shrimp:2 egg:2 paneer:4 tofu:1 lentil:4 chickpea:4 bean:1 rice:3 naan:3 bread:1 potato:3 cauliflower:4 spinach:3 pea:3 eggplant:3 squash:2 sweet-potato:2 carrot:2 cabbage:2 tomato:3 onion:4 garlic:4 ginger:4 chile:3 cumin:3 coriander-seed:3 turmeric:4 cardamom:3 cinnamon:3 clove:3 black-pepper:3 nutmeg:1 fenugreek:2 mustard:2 curry-leaf:2 yogurt:4 cream:3 butter:3 ghee:4 coconut-milk:2 cashew:3 almond:2 raisin:1 cilantro:4 mint:2 lemon:2 lime:2 tamarind:2 honey:1 sugar:1 salt:2 mango:1",
  },
  hoisin: {
    name: "hoisin", aliases: ["hoisin sauce", "plum sauce"], cat: "condiment",
    taste: "sweet salty", weight: 2, volume: 4, season: "all", techniques: "glaze dip stir", cuisines: { "east-asian": 4 }, chips: ["Cantonese"], dishes: "glazes pancakes stir-fries wraps", art: "bottle",
    pairs: "duck:4 pork:4 chicken:3 beef:3 shrimp:2 tofu:2 egg:1 scallion:4 cucumber:4 pancake:4 noodles:3 rice:3 lettuce:3 cabbage:2 mushroom:2 bok-choy:2 eggplant:2 sweet-potato:1 soy-sauce:3 sesame:3 ginger:3 garlic:3 chile:3 five-spice:4 star-anise:2 rice-vinegar:2 honey:2 sugar:1 peanut:3 cashew:2 lime:2 cilantro:2 mint:1 orange:1 plum:3 pineapple:1 black-pepper:1 oyster-sauce:2 mayonnaise:1",
  },
  "oyster-sauce": {
    name: "oyster sauce", aliases: [], cat: "condiment",
    taste: "salty sweet", weight: 2, volume: 4, season: "all", techniques: "stir-fry glaze", cuisines: { "east-asian": 4, "se-asian": 3 }, chips: ["Cantonese", "Thai"], dishes: "stir-fries noodles greens", art: "bottle",
    pairs: "broccoli:4 bok-choy:4 cabbage:2 green-bean:3 mushroom:3 shiitake:3 eggplant:2 asparagus:2 spinach:1 beef:4 pork:3 chicken:4 shrimp:3 squid:2 scallop:1 tofu:2 egg:2 noodles:4 rice:3 garlic:4 ginger:3 scallion:3 chile:2 soy-sauce:3 sesame:3 rice-vinegar:1 sugar:2 honey:1 black-pepper:2 star-anise:1 cashew:3 peanut:1 lime:1 cilantro:1 basil:2 fish-sauce:2 hoisin:2 mirin:1 sake:1 corn:1 carrot:1 onion:2 bell-pepper:2 pineapple:1",
  },
  seaweed: {
    name: "seaweed", aliases: ["nori", "kombu", "wakame", "dulse"], cat: "vegetable",
    taste: "salty", weight: 1, volume: 3, season: "all", techniques: "toast simmer wrap", cuisines: { "east-asian": 4 }, chips: ["Japanese", "Korean", "Welsh"], dishes: "soups sushi salads broths", art: "leaf",
    pairs: "rice:4 soy-sauce:4 sesame:4 miso:4 dashi:4 tofu:3 cucumber:3 ginger:3 scallion:3 rice-vinegar:3 mirin:2 sake:2 wasabi:3 egg:3 noodles:3 salmon:3 tuna:3 mackerel:3 shrimp:2 crab:2 scallop:1 oyster:2 clam:1 squid:1 chicken:1 pork:2 beef:1 mushroom:3 shiitake:3 avocado:3 radish:2 cabbage:2 kimchi:2 potato:1 butter:3 cream:1 cheese:1 lemon:1 lime:1 chile:2 honey:1 sugar:2 salt:2 black-pepper:1 oats:1 popcorn:2 peanut:1 cashew:1 bread:1 pasta:1",
  },
  kimchi: {
    name: "kimchi", aliases: ["napa cabbage kimchi"], cat: "condiment",
    taste: "sour hot salty", weight: 2, volume: 4, season: "all", techniques: "ferment stir fry", cuisines: { "east-asian": 4 }, chips: ["Korean"], dishes: "stews rice pancakes sandwiches", art: "cabbage",
    pairs: "rice:4 pork:4 tofu:4 egg:4 scallion:3 sesame:3 soy-sauce:2 ginger:2 garlic:3 chile:3 gochujang:4 noodles:3 ramen:3 cheese:3 cheddar:3 butter:2 cream:1 mayonnaise:2 bacon:3 beef:3 chicken:2 shrimp:2 squid:2 tuna:2 mackerel:1 salmon:1 oyster:2 clam:1 mushroom:2 shiitake:2 cabbage:3 cucumber:2 radish:3 potato:2 sweet-potato:1 corn:1 avocado:1 pancake:4 dumpling:3 bread:2 fries:2 burger:3 pickles:1 honey:1 sugar:1 rice-vinegar:1 fish-sauce:3 seaweed:2 peanut:1 lime:1 beer:3 sake:1",
  },
  wasabi: {
    name: "wasabi", aliases: ["japanese horseradish"], cat: "condiment",
    taste: "hot", weight: 1, volume: 5, season: "all", techniques: "grate stir dab", cuisines: { "east-asian": 4 }, chips: ["Japanese"], dishes: "sushi sashimi dressings", art: "radish",
    pairs: "soy-sauce:4 rice:4 tuna:4 salmon:4 scallop:2 shrimp:2 crab:2 oyster:1 sea-bass:2 mackerel:2 squid:1 beef:3 steak:2 chicken:1 pork:1 avocado:3 cucumber:3 seaweed:3 edamame:2 radish:2 egg:2 mayonnaise:3 cream:1 cream-cheese:1 butter:1 ginger:3 sesame:2 scallion:2 lime:2 lemon:1 rice-vinegar:2 mirin:2 sake:1 honey:1 pea:3 potato:2 noodles:2 peanut:1 tofu:2 caviar:1 salt:1 black-pepper:1",
  },
  "orange-blossom": {
    name: "orange blossom", aliases: ["orange blossom water", "orange flower water"], cat: "herb",
    taste: "sweet astringent:1", weight: 1, volume: 4, season: "all", techniques: "scent infuse", cuisines: { "middle-eastern": 4, french: 2 }, chips: ["Moroccan", "Lebanese", "Provençal"], dishes: "desserts drinks baking salads", art: "orange",
    pairs: "orange:4 honey:4 almond:4 pistachio:3 date:3 fig:2 apricot:2 pomegranate:2 strawberry:2 raspberry:1 melon:1 cardamom:3 cinnamon:2 saffron:3 rose:3 vanilla:2 sugar:3 milk:3 cream:3 yogurt:3 labneh:1 ricotta:2 mascarpone:1 egg:2 pastry:3 bread:2 brioche:3 rice:3 semolina:3 couscous:1 carrot:2 beet:1 chicken:1 lamb:1 pine-nut:1 walnut:1 coffee:1 tea:2 gin:1 champagne:1 butter:2",
  },
  elderflower: {
    name: "elderflower", aliases: ["elderflower cordial", "elderflower syrup"], cat: "herb",
    taste: "sweet sour:1 astringent:1", weight: 1, volume: 3, season: "spring summer", techniques: "infuse cordial", cuisines: { french: 1 }, chips: ["British", "Scandinavian", "Austrian"], dishes: "drinks desserts jellies", art: "thyme",
    pairs: "gooseberry:4 strawberry:3 raspberry:2 rhubarb:2 lemon:3 lime:2 apple:2 pear:2 peach:2 apricot:1 cucumber:2 mint:2 basil:1 cream:3 yogurt:2 mascarpone:2 cream-cheese:1 goat-cheese:1 honey:2 sugar:3 vanilla:2 white-chocolate:2 champagne:4 gin:4 vodka:2 white-wine:2 tea:1 pastry:2 shortbread:2 meringue:2 ice-cream:2 custard:1 almond:1 pistachio:1 lavender:1 rose:1",
  },
  flour: {
    name: "flour", aliases: ["plain flour", "all-purpose flour", "wheat flour"], cat: "grain",
    taste: "sweet:1", weight: 2, volume: 1, season: "all", techniques: "bake thicken dust", cuisines: { french: 4, italian: 4 }, dishes: "baking pastry breads pasta", art: "bread",
    pairs: "butter:4 egg:4 sugar:4 milk:4 salt:3 yeast:4 water:4 olive-oil:3 cream:2 vanilla:2 cinnamon:2 cocoa:2 chocolate:2 honey:2 almond:3 hazelnut:2 walnut:2 oats:3 cheese:2 parmesan:2 cheddar:2 potato:2 semolina:3 rye:3 corn:2 apple:2 banana:2 blueberry:2 lemon:2 orange:1 raisin:2 nutmeg:1 cardamom:1 caraway:2 sesame:2 poppy-seed:2 fennel-seed:1 rosemary:2 thyme:1 beer:2 buttermilk:3 yogurt:2 bacon:1 ham:1 mushroom:1 onion:1",
  },
};
export default entries;
