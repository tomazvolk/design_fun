const entries = {
  orange: {
    name: "orange", aliases: ["oranges", "navel orange", "orange zest", "orange juice"], cat: "fruit",
    taste: "sweet sour", weight: 2, volume: 3, season: "winter", techniques: "raw zest juice segment candy",
    cuisines: { mediterranean: 3, italian: 3, french: 3, "middle-eastern": 3, "east-asian": 2, latin: 2 }, chips: ["Sicilian", "Moroccan", "Seville"], dishes: "salads desserts sauces drinks baking marinades", art: "orange",
    pairs: "fennel:4 chocolate:4 olive:3 olive-oil:3 almond:3 cinnamon:3 vanilla:3 honey:3 ginger:3 cardamom:3 mint:2 basil:2 rosemary:2 thyme:2 tarragon:1 duck:4 pork:2 chicken:2 beef:2 lamb:1 salmon:2 scallop:2 shrimp:2 cod:1 beet:3 carrot:3 red-onion:2 arugula:2 avocado:2 radicchio:2 pomegranate:2 date:3 fig:2 cranberry:3 grapefruit:2 lemon:2 lime:1 pineapple:2 strawberry:2 rhubarb:3 coconut:2 walnut:2 hazelnut:2 pistachio:3 pecan:1 cream:3 mascarpone:2 ricotta:2 yogurt:2 goat-cheese:2 feta:2 blue-cheese:1 butter:3 brown-butter:2 caramel:3 sugar:3 brandy:3 grand-marnier:4 campari:3 red-wine:2 white-wine:1 vinegar:2 balsamic-vinegar:2 soy-sauce:2 sesame:2 star-anise:3 clove:3 cumin:2 coriander-seed:2 saffron:3 chile:1 black-pepper:2 salt:2 pastry:2 rice:1 coffee:2 cocoa:3",
  },
  "blood-orange": {
    name: "blood orange", aliases: ["blood oranges", "moro orange"], cat: "fruit",
    taste: "sweet sour", weight: 2, volume: 3, season: "winter", techniques: "raw juice segment", cuisines: { italian: 4, mediterranean: 3 }, chips: ["Sicilian"], dishes: "salads desserts drinks", art: "orange",
    pairs: "fennel:3 olive:3 olive-oil:3 red-onion:2 beet:2 arugula:2 pistachio:3 almond:2 campari:4 gin:2 honey:2 vanilla:2 chocolate:3 mascarpone:2 ricotta:2 burrata:3 mint:2 basil:1 scallop:2 duck:2 pork:1 chile:1 black-pepper:2 salt:2 rosemary:1 cardamom:2 pomegranate:2 date:2 mozzarella:2 goat-cheese:2",
  },
  lemon: {
    name: "lemon", aliases: ["lemons", "lemon juice", "lemon zest", "meyer lemon"], cat: "acid",
    taste: "sour bitter:1 sweet:1", weight: 1, volume: 4, season: "all", techniques: "juice zest preserve candy",
    cuisines: { mediterranean: 4, italian: 4, french: 4, "middle-eastern": 4, indian: 2 }, chips: ["Amalfi", "Greek", "Moroccan"], dishes: "sauces salads desserts drinks baking marinades", art: "lemon",
    pairs: "garlic:3 olive-oil:4 butter:4 parsley:3 thyme:3 rosemary:2 basil:2 mint:3 dill:3 oregano:3 tarragon:2 chives:2 sage:2 chicken:4 fish:4 cod:3 sea-bass:3 salmon:3 tuna:2 shrimp:4 scallop:3 crab:3 lobster:3 oyster:3 mussels:2 clam:2 squid:3 lamb:3 veal:3 pork:2 beef:1 egg:3 cream:3 ricotta:3 mascarpone:3 yogurt:3 goat-cheese:3 feta:3 parmesan:3 pecorino:2 butter:4 sugar:4 honey:4 vanilla:2 blueberry:3 raspberry:3 strawberry:2 blackberry:2 cherry:1 fig:1 pear:1 apple:1 ginger:3 cardamom:2 poppy-seed:3 almond:3 hazelnut:1 pistachio:2 pine-nut:2 caper:4 anchovy:3 olive:3 artichoke:4 asparagus:4 broccoli:3 kale:3 spinach:3 zucchini:3 fennel:3 potato:2 chickpea:3 lentil:3 rice:2 pasta:3 bread:1 couscous:2 chile:2 black-pepper:3 salt:3 cumin:2 coriander-seed:2 saffron:2 sumac:2 tahini:4 harissa:2 white-wine:2 gin:3 vodka:2 tea:2 meringue:4 pastry:3 cream-cheese:2 blue-cheese:1 avocado:3 cucumber:3 beet:2 carrot:2 pea:3 tomato:1 eggplant:3 cauliflower:3 brussels-sprout:3 green-bean:3 radish:2 lettuce:3 elderflower:2 lavender:2 thyme:3 coconut:1 pomegranate:1 date:1 chocolate:1 caramel:1 champagne:1",
  },
  lime: {
    name: "lime", aliases: ["limes", "lime juice", "lime zest"], cat: "acid",
    taste: "sour bitter:1", weight: 1, volume: 4, season: "all", techniques: "juice zest",
    cuisines: { latin: 4, "se-asian": 4, indian: 3, "east-asian": 2 }, chips: ["Mexican", "Thai", "Vietnamese", "Keralan"], dishes: "salsas curries drinks marinades salads desserts", art: "lemon",
    pairs: "chile:4 cilantro:4 garlic:3 ginger:3 lemongrass:3 fish-sauce:4 coconut-milk:4 coconut:3 peanut:3 soy-sauce:2 sesame:1 mint:3 basil:2 scallion:2 red-onion:3 onion:1 avocado:4 mango:4 pineapple:3 papaya:3 watermelon:3 melon:2 strawberry:2 coconut:3 cucumber:2 corn:4 tomato:2 black-bean:3 bean:2 rice:2 noodles:3 tortilla:3 shrimp:4 fish:4 cod:2 sea-bass:2 tuna:3 squid:3 crab:3 scallop:2 chicken:3 pork:3 beef:3 duck:1 tofu:2 egg:1 sugar:3 honey:3 brown-sugar:2 caramel:1 vanilla:1 chocolate:2 condensed-milk:3 cream:2 yogurt:2 sour-cream:3 cotija:3 feta:2 cumin:3 coriander-seed:2 tamarind:3 star-anise:1 cardamom:1 salt:3 black-pepper:2 tequila:4 rum:4 gin:2 beer:3 vodka:2 sweet-potato:3 cabbage:2 brussels-sprout:2 cashew:2 tarragon:1 pumpkin-seed:2 cilantro:4",
  },
  grapefruit: {
    name: "grapefruit", aliases: ["pink grapefruit", "pomelo"], cat: "fruit",
    taste: "sour bitter sweet:1", weight: 2, volume: 3, season: "winter", techniques: "raw segment juice broil", cuisines: { "se-asian": 2, french: 2 }, chips: ["Thai", "Vietnamese"], dishes: "salads drinks desserts breakfast", art: "orange",
    pairs: "avocado:3 fennel:2 shrimp:3 crab:3 scallop:2 salmon:2 tuna:2 chicken:1 mint:3 basil:2 tarragon:2 cilantro:2 chile:2 ginger:2 honey:3 brown-sugar:3 sugar:2 vanilla:2 campari:4 gin:3 tequila:3 vodka:2 champagne:2 rosemary:2 thyme:1 pomegranate:2 orange:2 coconut:2 peanut:2 cashew:2 fish-sauce:3 lime:2 red-onion:2 arugula:2 radicchio:1 goat-cheese:2 feta:1 yogurt:2 mascarpone:1 cream:1 black-pepper:2 salt:2 olive-oil:2",
  },
  apple: {
    name: "apple", aliases: ["apples", "granny smith", "bramley"], cat: "fruit",
    taste: "sweet sour", weight: 2, volume: 2, season: "autumn", techniques: "raw bake sauté caramelize juice",
    cuisines: { french: 4, mediterranean: 1 }, chips: ["Norman", "British", "Austrian", "American"], dishes: "desserts baking salads sauces roasts breakfast", art: "apple",
    pairs: "cinnamon:4 butter:4 caramel:4 brown-sugar:3 sugar:3 vanilla:3 nutmeg:2 clove:2 cardamom:2 ginger:3 star-anise:2 allspice:2 lemon:3 orange:1 cranberry:3 pear:2 quince:3 raisin:2 date:2 fig:1 blackberry:3 rhubarb:2 walnut:4 hazelnut:3 almond:3 pecan:3 chestnut:2 pork:4 bacon:3 sausage:3 duck:3 chicken:2 goose:2 cheddar:4 blue-cheese:4 gruyere:2 brie:3 goat-cheese:2 cream:3 crème-fraîche:3 mascarpone:2 yogurt:2 cream-cheese:2 oats:3 pastry:4 bread:2 honey:3 maple-syrup:3 calvados:4 brandy:3 cider:4 rum:2 red-wine:1 white-wine:1 vinegar:2 cider-vinegar:4 mustard:2 horseradish:2 sage:3 thyme:2 rosemary:2 bay-leaf:1 celery:3 cabbage:3 fennel:2 beet:2 carrot:2 squash:2 sweet-potato:2 onion:2 chile:1 salt:2 black-pepper:1 chocolate:1 coffee:1 whisky:2 oats:3",
  },
  pear: {
    name: "pear", aliases: ["pears", "comice pear", "williams pear"], cat: "fruit",
    taste: "sweet", weight: 2, volume: 1, season: "autumn winter", techniques: "raw poach bake roast",
    cuisines: { french: 4, italian: 3 }, chips: ["Burgundian", "Piedmontese"], dishes: "desserts salads baking cheese-plates", art: "pear",
    pairs: "blue-cheese:4 gorgonzola:4 walnut:4 hazelnut:3 almond:3 chocolate:4 vanilla:3 red-wine:4 port:3 honey:3 caramel:3 ginger:3 cinnamon:2 star-anise:3 cardamom:2 clove:1 black-pepper:2 saffron:2 vanilla:3 butter:3 cream:3 mascarpone:3 ricotta:2 goat-cheese:3 parmesan:3 pecorino:2 brie:2 arugula:3 radicchio:3 watercress:2 fennel:1 celery:1 prosciutto:3 duck:2 pork:2 chicken:1 lemon:1 orange:1 cranberry:2 raspberry:1 fig:2 quince:2 chestnut:2 pastry:3 bread:1 oats:1 pecan:2 pistachio:1 balsamic-vinegar:2 vinegar:1 brandy:2 rum:1 sugar:2 brown-sugar:2 maple-syrup:2 rosemary:1 thyme:1 bay-leaf:1 anise:2",
  },
  fig: {
    name: "fig", aliases: ["figs", "fresh figs", "dried figs"], cat: "fruit",
    taste: "sweet", weight: 2, volume: 2, season: "summer autumn", techniques: "raw roast grill dry",
    cuisines: { mediterranean: 4, "middle-eastern": 4, italian: 3, french: 2 }, chips: ["Turkish", "Greek", "Provençal"], dishes: "salads desserts cheese-plates baking", art: "fig",
    pairs: "prosciutto:4 goat-cheese:4 blue-cheese:4 honey:4 walnut:3 almond:3 hazelnut:2 pistachio:3 mascarpone:3 ricotta:3 cream:2 yogurt:2 feta:2 brie:2 gorgonzola:3 balsamic-vinegar:3 red-wine:3 port:3 brandy:2 vanilla:2 cinnamon:2 cardamom:2 star-anise:1 black-pepper:3 orange:2 lemon:1 raspberry:2 pomegranate:2 date:1 arugula:3 radicchio:2 fennel:1 rosemary:3 thyme:3 lavender:1 mint:1 basil:1 duck:3 pork:3 lamb:2 chicken:2 bacon:2 chocolate:2 caramel:2 pastry:2 bread:2 oats:1 sesame:2 tahini:2 olive-oil:3 salt:2 sherry:2 anise:1",
  },
  cherry: {
    name: "cherry", aliases: ["cherries", "sour cherry", "morello"], cat: "fruit",
    taste: "sweet sour", weight: 2, volume: 2, season: "summer", techniques: "raw poach bake preserve", cuisines: { french: 3, "middle-eastern": 2, "east-asian": 1 }, chips: ["Alsatian", "Turkish", "Hungarian"], dishes: "desserts baking sauces drinks", art: "cherry",
    pairs: "chocolate:4 almond:4 vanilla:3 kirsch:4 brandy:3 red-wine:3 port:2 cream:3 mascarpone:2 yogurt:2 goat-cheese:2 ricotta:2 cinnamon:2 clove:1 star-anise:2 black-pepper:2 balsamic-vinegar:3 vinegar:2 lemon:1 orange:1 duck:4 pork:3 lamb:2 venison:3 chicken:1 foie-gras:2 pistachio:3 hazelnut:2 walnut:1 pastry:3 bread:1 sugar:3 honey:2 caramel:1 amaretto:3 bay-leaf:1 thyme:1 rosemary:1 basil:1 mint:1 coffee:1 cocoa:3 rice:1",
  },
  strawberry: {
    name: "strawberry", aliases: ["strawberries"], cat: "fruit",
    taste: "sweet sour:1", weight: 1, volume: 2, season: "spring summer", techniques: "raw macerate roast preserve",
    cuisines: { french: 3, italian: 2 }, chips: ["British", "Provençal"], dishes: "desserts salads drinks breakfast baking", art: "strawberry",
    pairs: "cream:4 balsamic-vinegar:4 black-pepper:3 basil:4 mint:3 vanilla:3 chocolate:3 white-chocolate:3 sugar:3 honey:2 lemon:2 orange:2 lime:2 rhubarb:4 raspberry:2 banana:2 peach:1 melon:1 watermelon:1 cucumber:1 tomato:1 avocado:1 mascarpone:3 ricotta:2 yogurt:3 cream-cheese:3 goat-cheese:2 feta:2 mozzarella:2 burrata:2 almond:3 pistachio:3 hazelnut:2 pastry:3 meringue:4 shortbread:3 oats:2 champagne:4 rosé:2 red-wine:1 rum:1 gin:1 elderflower:3 rose:3 lavender:1 tarragon:2 chile:1 coriander-seed:1 caramel:2 cardamom:1 cinnamon:1 arugula:2 spinach:2 coconut:1 passion-fruit:2 rose:3",
  },
  raspberry: {
    name: "raspberry", aliases: ["raspberries"], cat: "fruit",
    taste: "sour sweet", weight: 1, volume: 3, season: "summer", techniques: "raw purée preserve", cuisines: { french: 3 }, dishes: "desserts baking drinks sauces", art: "strawberry",
    pairs: "chocolate:4 cream:4 vanilla:3 white-chocolate:3 lemon:3 almond:3 hazelnut:2 pistachio:2 peach:3 nectarine:2 apricot:2 strawberry:2 blueberry:2 blackberry:2 mascarpone:3 yogurt:2 ricotta:2 goat-cheese:2 cream-cheese:2 meringue:3 pastry:3 sugar:3 honey:2 rose:2 mint:2 basil:2 thyme:1 lavender:1 black-pepper:1 balsamic-vinegar:2 champagne:3 rosé:2 kirsch:2 brandy:2 duck:2 venison:1 coconut:1 oats:2 orange:1 lime:1 cardamom:1 cinnamon:1",
  },
  blueberry: {
    name: "blueberry", aliases: ["blueberries"], cat: "fruit",
    taste: "sweet sour:1", weight: 1, volume: 2, season: "summer", techniques: "raw bake preserve", cuisines: { french: 1 }, chips: ["American", "Scandinavian"], dishes: "breakfast baking desserts", art: "strawberry",
    pairs: "lemon:4 cream:3 vanilla:3 cinnamon:3 maple-syrup:3 oats:3 buttermilk:3 yogurt:3 cream-cheese:3 mascarpone:2 ricotta:2 goat-cheese:2 almond:3 pecan:2 hazelnut:2 walnut:1 honey:2 sugar:3 brown-sugar:2 orange:2 lime:2 peach:2 raspberry:2 blackberry:2 strawberry:1 apple:1 mint:2 basil:2 lavender:2 thyme:1 cardamom:2 ginger:2 nutmeg:1 black-pepper:1 balsamic-vinegar:2 pastry:3 bread:1 pancake:3 corn:1 duck:2 pork:1 venison:1 white-chocolate:2 chocolate:1 coconut:1 gin:1",
  },
  blackberry: {
    name: "blackberry", aliases: ["blackberries", "brambles"], cat: "fruit",
    taste: "sweet sour", weight: 1, volume: 2, season: "summer autumn", techniques: "raw bake preserve", cuisines: { french: 2 }, chips: ["British"], dishes: "desserts baking sauces", art: "strawberry",
    pairs: "apple:4 cream:3 vanilla:3 lemon:2 sugar:3 honey:2 cinnamon:2 ginger:2 star-anise:1 black-pepper:1 bay-leaf:2 almond:2 hazelnut:2 walnut:1 oats:2 pastry:3 mascarpone:2 yogurt:2 goat-cheese:2 blue-cheese:1 ricotta:1 venison:3 duck:3 lamb:2 pork:1 red-wine:2 port:2 brandy:2 gin:2 chocolate:2 white-chocolate:1 peach:2 raspberry:2 blueberry:2 mint:1 basil:1 sage:1 thyme:1 balsamic-vinegar:1",
  },
  peach: {
    name: "peach", aliases: ["peaches", "nectarine", "nectarines"], cat: "fruit",
    taste: "sweet sour:1", weight: 2, volume: 2, season: "summer", techniques: "raw grill poach bake",
    cuisines: { italian: 3, french: 2, latin: 1 }, chips: ["Piedmontese", "Southern US", "Georgian"], dishes: "desserts salads grills drinks breakfast", art: "peach",
    pairs: "burrata:4 mozzarella:3 prosciutto:4 basil:4 mint:2 tarragon:2 thyme:2 rosemary:2 lavender:2 vanilla:3 honey:3 brown-sugar:3 sugar:2 caramel:2 cream:3 mascarpone:3 ricotta:3 yogurt:3 crème-fraîche:2 goat-cheese:2 blue-cheese:2 almond:4 amaretto:4 pistachio:2 hazelnut:2 pecan:2 raspberry:3 blueberry:2 blackberry:2 cherry:1 strawberry:1 apricot:2 tomato:2 cucumber:1 corn:1 chile:2 ginger:2 cinnamon:2 cardamom:2 star-anise:1 black-pepper:2 balsamic-vinegar:3 vinegar:1 white-wine:3 champagne:3 rosé:2 bourbon:3 brandy:2 rum:1 chicken:2 pork:3 duck:2 shrimp:1 lemon:2 lime:2 orange:1 pastry:3 oats:2 meringue:2 ice-cream:3 butter:3 salt:2 bread:1 arugula:2 fennel:1 red-onion:1",
  },
  apricot: {
    name: "apricot", aliases: ["apricots", "dried apricots"], cat: "fruit",
    taste: "sweet sour", weight: 2, volume: 2, season: "summer", techniques: "raw poach bake dry", cuisines: { "middle-eastern": 4, french: 2, indian: 1 }, chips: ["Moroccan", "Persian", "Turkish"], dishes: "tagines desserts baking stews", art: "peach",
    pairs: "almond:4 lamb:4 honey:3 pistachio:3 vanilla:3 cardamom:3 cinnamon:3 ginger:2 saffron:2 orange:2 lemon:2 rosemary:2 thyme:2 lavender:2 black-pepper:1 chile:1 cumin:2 coriander-seed:2 raspberry:2 cherry:1 peach:2 date:2 fig:1 chicken:3 pork:3 duck:2 goat-cheese:2 ricotta:2 mascarpone:2 yogurt:3 cream:2 brie:1 blue-cheese:1 amaretto:3 brandy:2 white-wine:2 champagne:1 pastry:3 oats:1 rice:2 couscous:3 hazelnut:2 walnut:2 sugar:3 brown-sugar:2 caramel:1 chocolate:2 butter:2 onion:2 harissa:2 bay-leaf:1",
  },
  mango: {
    name: "mango", aliases: ["mangoes", "alphonso mango"], cat: "fruit",
    taste: "sweet sour:1", weight: 2, volume: 3, season: "summer", techniques: "raw grill purée pickle", cuisines: { indian: 4, "se-asian": 4, latin: 3 }, chips: ["Thai", "Keralan", "Mexican", "Filipino"], dishes: "salsas salads desserts drinks pickles curries", art: "mango",
    pairs: "lime:4 chile:4 coconut:4 coconut-milk:3 cilantro:3 mint:3 basil:2 ginger:3 cardamom:3 yogurt:4 cream:3 condensed-milk:3 sticky-rice:4 rice:2 avocado:3 cucumber:2 red-onion:2 tomato:1 passion-fruit:3 pineapple:2 papaya:2 banana:2 raspberry:2 strawberry:1 lemon:2 orange:1 honey:2 sugar:3 brown-sugar:2 vanilla:2 white-chocolate:1 chocolate:1 shrimp:3 fish:2 crab:2 scallop:2 chicken:2 pork:2 duck:1 tofu:1 cashew:2 peanut:2 macadamia:2 pistachio:1 sesame:1 fish-sauce:3 tamarind:3 cumin:2 turmeric:1 black-pepper:2 salt:3 rum:3 tequila:2 champagne:1 mustard:2 saffron:1 rose:1",
  },
  pineapple: {
    name: "pineapple", aliases: ["pineapples"], cat: "fruit",
    taste: "sweet sour", weight: 2, volume: 3, season: "all", techniques: "raw grill roast juice", cuisines: { "se-asian": 3, latin: 3, "east-asian": 2 }, chips: ["Thai", "Mexican", "Hawaiian", "Filipino"], dishes: "salsas desserts drinks grills curries", art: "pineapple",
    pairs: "coconut:4 rum:4 lime:3 chile:3 ginger:3 mint:3 cilantro:2 basil:2 brown-sugar:4 sugar:2 caramel:3 honey:2 vanilla:3 cinnamon:2 star-anise:2 clove:2 black-pepper:2 pork:4 ham:4 bacon:2 chicken:3 duck:2 shrimp:3 fish:2 tofu:1 cream:2 coconut-milk:3 yogurt:2 mascarpone:1 cream-cheese:2 cottage-cheese:2 macadamia:3 cashew:2 peanut:2 almond:1 orange:2 mango:2 banana:3 passion-fruit:2 strawberry:1 soy-sauce:2 fish-sauce:2 tamarind:2 curry-powder:2 turmeric:1 chocolate:1 white-chocolate:1 tequila:2 champagne:1 rice:1 sticky-rice:2 bell-pepper:2 onion:1 red-onion:1 jalapeño:3 salt:2",
  },
  banana: {
    name: "banana", aliases: ["bananas", "plantain"], cat: "fruit",
    taste: "sweet", weight: 3, volume: 2, season: "all", techniques: "raw bake fry caramelize", cuisines: { "se-asian": 2, latin: 3, indian: 2 }, chips: ["Caribbean", "Thai", "Southern US"], dishes: "desserts breakfast baking drinks", art: "banana",
    pairs: "chocolate:4 caramel:4 peanut:4 cream:3 vanilla:3 cinnamon:3 nutmeg:2 cardamom:2 brown-sugar:4 honey:3 maple-syrup:3 rum:4 bourbon:2 brandy:1 butter:4 coconut:3 coconut-milk:2 walnut:3 pecan:3 hazelnut:3 almond:2 macadamia:2 oats:3 yogurt:3 cream-cheese:2 mascarpone:2 condensed-milk:2 ice-cream:4 pastry:2 bread:3 pancake:3 coffee:3 cocoa:3 lime:2 lemon:1 orange:1 pineapple:3 mango:2 passion-fruit:2 strawberry:2 blueberry:1 date:2 ginger:2 clove:1 star-anise:1 chile:1 bacon:2 egg:2 milk:3 salt:2 sesame:1 tahini:2 miso:2 peanut:4",
  },
  pomegranate: {
    name: "pomegranate", aliases: ["pomegranate seeds", "pomegranate molasses"], cat: "fruit",
    taste: "sour sweet astringent", weight: 1, volume: 3, season: "autumn winter", techniques: "raw juice reduce", cuisines: { "middle-eastern": 4, indian: 2, mediterranean: 2 }, chips: ["Persian", "Turkish", "Lebanese", "Georgian"], dishes: "salads stews dips desserts drinks", art: "pomegranate",
    pairs: "walnut:4 lamb:4 eggplant:3 mint:3 parsley:3 cilantro:2 feta:3 goat-cheese:3 yogurt:3 labneh:3 tahini:2 sumac:3 cumin:2 cinnamon:2 cardamom:2 rose:2 orange:2 lemon:1 lime:1 honey:2 sugar:2 pistachio:3 almond:2 hazelnut:1 chicken:3 duck:3 beef:2 pork:1 quail:2 fish:1 rice:2 couscous:2 bulgur:3 chickpea:2 lentil:1 beet:2 squash:2 sweet-potato:1 cauliflower:2 avocado:2 cucumber:1 arugula:2 radicchio:2 fennel:1 fig:2 pear:1 apple:1 date:2 chocolate:2 cream:1 mascarpone:1 olive-oil:3 vinegar:1 black-pepper:2 salt:2 chile:1 onion:2 red-onion:2 bell-pepper:2 chocolate:2",
  },
  date: {
    name: "date", aliases: ["dates", "medjool dates"], cat: "fruit",
    taste: "sweet", weight: 3, volume: 2, season: "autumn winter all", techniques: "raw stuff purée bake", cuisines: { "middle-eastern": 4, indian: 2 }, chips: ["Moroccan", "Persian", "Gulf"], dishes: "desserts tagines salads baking", art: "fig",
    pairs: "almond:4 walnut:4 pistachio:3 tahini:3 sesame:2 orange:3 lemon:1 cinnamon:3 cardamom:3 clove:1 ginger:2 vanilla:2 coffee:3 chocolate:3 cocoa:2 caramel:3 butter:3 cream:3 mascarpone:2 goat-cheese:3 blue-cheese:3 feta:2 cream-cheese:2 ricotta:1 yogurt:2 labneh:2 bacon:4 prosciutto:3 chorizo:2 lamb:3 chicken:2 duck:2 pork:1 banana:2 apple:2 pear:1 fig:1 pomegranate:2 oats:3 rice:2 couscous:3 bulgur:1 honey:2 maple-syrup:2 brandy:2 rum:2 whisky:1 orange-blossom:3 rose:2 saffron:2 cumin:2 coriander-seed:1 chile:2 salt:3 olive-oil:2 harissa:2 celery:1 carrot:1 onion:2",
  },
  cranberry: {
    name: "cranberry", aliases: ["cranberries", "dried cranberries"], cat: "fruit",
    taste: "sour astringent sweet:1", weight: 1, volume: 3, season: "autumn winter", techniques: "cook preserve dry", cuisines: { french: 1 }, chips: ["American", "Scandinavian"], dishes: "sauces baking salads roasts", art: "strawberry",
    pairs: "orange:4 turkey:4 apple:3 pear:2 sugar:4 honey:2 maple-syrup:3 cinnamon:3 ginger:3 clove:2 star-anise:2 vanilla:2 pecan:3 walnut:3 almond:2 pistachio:1 hazelnut:1 oats:2 pastry:2 bread:2 brie:3 goat-cheese:2 blue-cheese:2 cream-cheese:2 cream:1 port:3 red-wine:2 brandy:2 bourbon:1 gin:1 chicken:2 pork:3 duck:2 venison:2 squash:2 brussels-sprout:2 kale:1 sweet-potato:2 wild-rice:3 rice:1 quinoa:1 chocolate:1 white-chocolate:2 lemon:1 lime:1 rosemary:2 thyme:1 sage:2 bay-leaf:1 black-pepper:1 jalapeño:2 chile:1 onion:1 horseradish:1 mustard:1",
  },
  rhubarb: {
    name: "rhubarb", aliases: [], cat: "fruit",
    taste: "sour astringent", weight: 2, volume: 3, season: "spring", techniques: "roast poach stew bake", cuisines: { french: 2 }, chips: ["British", "Scandinavian"], dishes: "desserts baking sauces breakfast", art: "rhubarb",
    pairs: "strawberry:4 ginger:4 sugar:4 orange:3 vanilla:3 custard:4 cream:3 honey:2 brown-sugar:2 cinnamon:2 cardamom:2 star-anise:2 rose:3 elderflower:2 almond:3 hazelnut:2 pistachio:2 oats:3 pastry:4 meringue:3 yogurt:3 mascarpone:2 ricotta:1 goat-cheese:2 cream-cheese:2 crème-fraîche:2 butter:3 lemon:2 raspberry:2 apple:2 pork:3 duck:2 mackerel:3 chicken:1 lamb:1 white-chocolate:3 chocolate:1 black-pepper:1 bay-leaf:1 thyme:1 mint:1 gin:2 champagne:1 angelica:2",
  },
  quince: {
    name: "quince", aliases: ["quince paste", "membrillo"], cat: "fruit",
    taste: "sweet astringent sour:1", weight: 3, volume: 2, season: "autumn", techniques: "poach roast preserve", cuisines: { mediterranean: 3, "middle-eastern": 3, french: 2 }, chips: ["Spanish", "Persian", "Portuguese"], dishes: "desserts cheese-plates stews baking", art: "pear",
    pairs: "manchego:4 cheese:3 blue-cheese:2 goat-cheese:2 apple:3 pear:2 honey:3 sugar:3 vanilla:3 cinnamon:3 star-anise:3 clove:2 cardamom:2 ginger:2 lemon:2 orange:2 rose:2 almond:3 walnut:3 hazelnut:2 pistachio:1 lamb:3 pork:3 duck:2 chicken:2 cream:2 mascarpone:2 yogurt:1 butter:2 pastry:3 brandy:2 red-wine:3 white-wine:2 port:1 black-pepper:1 bay-leaf:2 thyme:1 saffron:2 chile:1",
  },
  melon: {
    name: "melon", aliases: ["cantaloupe", "honeydew", "charentais"], cat: "fruit",
    taste: "sweet", weight: 1, volume: 2, season: "summer", techniques: "raw chill grill", cuisines: { italian: 3, french: 3 }, chips: ["Provençal", "Parma"], dishes: "salads desserts drinks breakfast", art: "melon",
    pairs: "prosciutto:4 ham:3 mint:4 basil:3 lime:3 lemon:2 chile:2 ginger:2 black-pepper:3 salt:3 feta:3 mozzarella:2 burrata:2 ricotta:1 goat-cheese:1 yogurt:2 cream:2 honey:2 sugar:1 vanilla:1 cucumber:2 tomato:1 avocado:1 watermelon:2 strawberry:1 raspberry:1 peach:1 orange:1 port:3 champagne:2 gin:2 rosé:2 white-wine:2 almond:2 pistachio:2 hazelnut:1 olive-oil:2 vinegar:1 balsamic-vinegar:1 shrimp:2 crab:2 scallop:1 tarragon:1 rose:1 elderflower:1 cilantro:1",
  },
  watermelon: {
    name: "watermelon", aliases: [], cat: "fruit",
    taste: "sweet", weight: 1, volume: 2, season: "summer", techniques: "raw chill grill juice", cuisines: { mediterranean: 3, latin: 2, "middle-eastern": 2 }, chips: ["Greek", "Mexican", "Turkish"], dishes: "salads drinks desserts", art: "melon",
    pairs: "feta:4 mint:4 lime:3 chile:3 salt:3 black-pepper:2 cucumber:3 tomato:2 red-onion:2 olive:2 olive-oil:3 basil:2 cilantro:2 lemon:2 honey:2 sugar:1 vanilla:1 ginger:1 jalapeño:3 tequila:3 vodka:2 gin:2 rosé:2 champagne:1 goat-cheese:2 mozzarella:2 halloumi:3 yogurt:2 shrimp:2 crab:1 avocado:2 strawberry:1 melon:2 pistachio:2 almond:1 pumpkin-seed:1 balsamic-vinegar:2 vinegar:2 rose:2 coconut:1 pomegranate:1 arugula:2 sumac:2 tahini:1",
  },
  coconut: {
    name: "coconut", aliases: ["coconut flakes", "desiccated coconut", "fresh coconut"], cat: "fruit",
    taste: "sweet", weight: 2, volume: 2, season: "all", techniques: "toast grate cream", cuisines: { "se-asian": 4, indian: 4, latin: 2 }, chips: ["Thai", "Keralan", "Sri Lankan", "Caribbean"], dishes: "curries desserts baking drinks", art: "coconut",
    pairs: "lime:4 chile:3 ginger:3 lemongrass:3 cilantro:2 mint:2 basil:2 curry-leaf:3 turmeric:3 cumin:2 cardamom:3 cinnamon:2 vanilla:3 chocolate:3 white-chocolate:3 caramel:3 brown-sugar:3 sugar:3 honey:2 condensed-milk:3 cream:2 yogurt:2 mango:4 pineapple:4 banana:3 passion-fruit:3 papaya:2 orange:2 lemon:1 lychee:3 date:2 raspberry:2 strawberry:1 almond:3 cashew:3 peanut:3 macadamia:3 pistachio:1 oats:2 rice:3 sticky-rice:3 shrimp:3 fish:3 chicken:3 pork:2 beef:1 tofu:2 lentil:2 chickpea:2 squash:2 sweet-potato:2 spinach:1 rum:4 coffee:2 cocoa:2 tamarind:2 fish-sauce:2 soy-sauce:1 salt:2 black-pepper:1 pastry:2 meringue:2",
  },
  "passion-fruit": {
    name: "passion fruit", aliases: ["passionfruit", "maracuja"], cat: "fruit",
    taste: "sour sweet", weight: 1, volume: 4, season: "all", techniques: "raw purée curd", cuisines: { latin: 3, "se-asian": 1 }, chips: ["Brazilian", "Australian"], dishes: "desserts drinks sauces", art: "pomegranate",
    pairs: "mango:3 coconut:3 banana:2 pineapple:2 lime:3 orange:2 lemon:1 raspberry:2 strawberry:2 vanilla:3 white-chocolate:3 chocolate:2 caramel:2 cream:3 mascarpone:2 yogurt:3 meringue:4 pastry:2 sugar:3 honey:2 condensed-milk:2 rum:3 cachaça:3 vodka:2 champagne:2 gin:1 chile:2 ginger:2 mint:2 basil:1 fish:1 scallop:2 shrimp:1 chicken:1 duck:1 coconut-milk:2 macadamia:2 almond:1 pistachio:1 ice-cream:3 custard:2",
  },
  raisin: {
    name: "raisin", aliases: ["raisins", "sultanas", "currants"], cat: "fruit",
    taste: "sweet", weight: 2, volume: 2, season: "all", techniques: "soak bake", cuisines: { "middle-eastern": 3, italian: 2, indian: 2 }, chips: ["Sicilian", "Moroccan", "Persian"], dishes: "baking stews salads pilafs", art: "fig",
    pairs: "pine-nut:4 almond:3 walnut:3 cinnamon:4 nutmeg:2 clove:2 cardamom:2 oats:3 apple:2 carrot:2 cabbage:1 kale:2 spinach:3 cauliflower:2 eggplant:1 onion:1 rum:3 brandy:3 sherry:2 honey:2 brown-sugar:3 sugar:2 vanilla:2 chocolate:2 butter:3 cream-cheese:2 ricotta:2 goat-cheese:1 yogurt:1 rice:3 couscous:3 bulgur:1 bread:3 pastry:3 lamb:2 chicken:2 pork:2 duck:1 anchovy:2 vinegar:3 caper:3 saffron:2 cumin:2 coriander-seed:1 orange:2 lemon:2 celery:1 pecan:1 peanut:1",
  },
};
export default entries;
