const entries = {
  butter: {
    name: "butter", aliases: ["unsalted butter", "salted butter"], cat: "dairy",
    taste: "sweet:1 salty:1", weight: 3, volume: 2, season: "all", techniques: "melt brown baste bake",
    cuisines: { french: 4, indian: 3, italian: 2, "east-asian": 1 }, dishes: "sauces baking pastry everything", art: "butter",
    pairs: "salt:4 black-pepper:3 garlic:4 lemon:4 parsley:3 tarragon:3 sage:4 thyme:3 chives:3 dill:3 bread:4 toast:4 pastry:4 shortbread:4 egg:4 potato:4 corn:4 pea:4 carrot:4 leek:4 asparagus:4 mushroom:4 cabbage:3 cauliflower:3 brussels-sprout:3 green-bean:4 radish:4 spinach:3 squash:4 sweet-potato:4 onion:4 shallot:4 beet:2 artichoke:3 fennel:2 broccoli:3 rice:3 risotto:3 pasta:3 polenta:3 oats:2 flour:4 sugar:4 brown-sugar:4 honey:3 maple-syrup:4 vanilla:4 chocolate:4 caramel:4 cinnamon:3 nutmeg:2 cardamom:2 apple:4 pear:3 banana:4 peach:3 apricot:2 cherry:1 fig:1 orange:3 lemon:4 lime:1 raspberry:1 strawberry:1 blueberry:1 rhubarb:3 quince:2 cranberry:1 date:3 raisin:3 chicken:4 beef:4 steak:4 pork:2 veal:4 lamb:2 duck:3 rabbit:3 liver:4 turkey:4 fish:4 sole:4 cod:4 salmon:3 trout:4 scallop:4 lobster:4 crab:4 shrimp:4 oyster:3 mussels:4 clam:3 cream:3 milk:3 cheese:3 parmesan:3 white-wine:3 brandy:2 rum:2 bourbon:3 capers:3 caper:3 anchovy:4 mustard:3 vinegar:2 almond:3 hazelnut:3 pecan:3 walnut:2 pine-nut:2 chestnut:2 miso:3 soy-sauce:3 chile:2 paprika:2 saffron:3 curry-powder:2 cumin:2 ginger:2 coffee:2 tea:1 cocoa:2 oats:2 popcorn:4",
  },
  "brown-butter": {
    name: "brown butter", aliases: ["beurre noisette", "browned butter"], cat: "dairy",
    taste: "sweet salty:1 bitter:1", weight: 3, volume: 3, season: "all", techniques: "brown drizzle bake", cuisines: { french: 4, italian: 3 }, dishes: "sauces pasta baking fish", art: "butter",
    pairs: "sage:4 squash:4 cauliflower:4 brussels-sprout:4 hazelnut:4 almond:3 pecan:3 walnut:2 lemon:3 caper:3 capers:3 vinegar:2 sherry-vinegar:2 fish:4 sole:4 trout:4 skate:4 cod:3 scallop:4 shrimp:2 lobster:2 chicken:2 veal:2 pasta:4 gnocchi:4 ravioli:4 rice:2 polenta:2 potato:3 sweet-potato:3 carrot:2 leek:2 mushroom:3 asparagus:3 green-bean:3 pea:2 radish:2 corn:2 egg:2 parmesan:3 ricotta:2 goat-cheese:1 cream:2 sugar:3 brown-sugar:3 honey:3 maple-syrup:3 vanilla:3 chocolate:3 caramel:3 cinnamon:2 nutmeg:2 cardamom:1 apple:3 pear:3 banana:3 peach:2 fig:2 plum:2 cherry:1 orange:2 rhubarb:1 shortbread:3 pastry:3 oats:2 miso:3 soy-sauce:2 thyme:2 rosemary:2 black-pepper:2 salt:3 chile:1",
  },
  cream: {
    name: "cream", aliases: ["double cream", "heavy cream", "whipping cream"], cat: "dairy",
    taste: "sweet:1", weight: 3, volume: 1, season: "all", techniques: "whip reduce infuse", cuisines: { french: 4, italian: 2, indian: 2 }, dishes: "sauces soups desserts pasta", art: "milk",
    pairs: "butter:3 vanilla:4 sugar:4 chocolate:4 caramel:4 coffee:3 honey:3 strawberry:4 raspberry:4 peach:3 cherry:3 blueberry:3 blackberry:3 banana:3 fig:2 pear:3 apple:3 orange:3 lemon:3 lime:2 mango:3 passion-fruit:3 rhubarb:3 cinnamon:3 nutmeg:4 cardamom:3 rose:3 lavender:3 mushroom:4 leek:3 potato:4 spinach:4 corn:3 pea:3 squash:3 cauliflower:3 onion:2 shallot:3 garlic:2 tomato:2 asparagus:2 fennel:2 celery:2 carrot:2 mushroom:4 chicken:3 veal:3 beef:2 pork:2 rabbit:3 salmon:3 cod:3 scallop:3 lobster:3 mussels:4 crab:3 shrimp:2 oyster:2 egg:3 cheese:3 parmesan:3 gruyere:2 blue-cheese:2 goat-cheese:1 mascarpone:3 white-wine:3 brandy:3 sherry:2 madeira:2 bourbon:2 rum:2 tarragon:3 thyme:2 chives:3 dill:3 parsley:1 chervil:3 bay-leaf:3 black-pepper:3 salt:2 horseradish:3 mustard:3 pasta:3 risotto:2 rice:3 bread:2 pastry:4 meringue:4 oats:2 almond:2 hazelnut:2 pistachio:2 walnut:1 pecan:2 chestnut:3 coconut:2 tea:3 earl-grey:3 cocoa:3 truffle:3 saffron:3 peppercorn:3 caviar:2",
  },
  "crème-fraîche": {
    name: "crème fraîche", aliases: ["creme fraiche", "sour cream"], cat: "dairy",
    taste: "sour sweet:1", weight: 3, volume: 1, season: "all", techniques: "dollop stir finish", cuisines: { french: 4 }, chips: ["Norman"], dishes: "soups sauces desserts tarts", art: "milk",
    pairs: "smoked-salmon:4 caviar:4 potato:3 beet:3 leek:3 mushroom:2 cucumber:2 pea:3 asparagus:2 spinach:1 squash:2 onion:2 shallot:2 chives:3 dill:3 tarragon:2 chervil:2 parsley:1 horseradish:3 mustard:3 lemon:3 lime:1 caper:2 egg:2 salmon:3 trout:3 cod:1 scallop:2 chicken:2 veal:1 pork:1 bacon:2 apple:3 pear:2 strawberry:2 raspberry:2 cherry:1 fig:1 rhubarb:2 peach:2 blueberry:1 honey:2 sugar:2 brown-sugar:2 vanilla:2 chocolate:2 caramel:2 pastry:3 bread:2 blini:3 pancake:3 black-pepper:2 salt:2 butter:2 white-wine:2 cider:2 calvados:2 nutmeg:1 cinnamon:1",
  },
  "sour-cream": {
    name: "sour cream", aliases: ["soured cream", "smetana"], cat: "dairy",
    taste: "sour", weight: 3, volume: 1, season: "all", techniques: "dollop stir bake", cuisines: { latin: 3, french: 1 }, chips: ["Russian", "Mexican", "Hungarian", "American"], dishes: "dips soups tacos baking", art: "milk",
    pairs: "potato:4 chives:4 dill:4 onion:3 scallion:3 paprika:4 goulash:3 beet:3 cucumber:3 mushroom:2 cabbage:2 corn:2 avocado:2 tomato:1 chile:2 lime:3 cilantro:2 bean:2 black-bean:2 cheese:2 cheddar:2 feta:1 egg:2 bacon:2 chicken:2 beef:2 pork:1 smoked-salmon:3 herring:3 caviar:3 trout:2 horseradish:3 mustard:2 lemon:2 honey:2 sugar:2 vanilla:2 chocolate:2 cinnamon:1 apple:1 strawberry:1 blueberry:1 cherry:1 banana:1 pastry:2 bread:2 blini:3 pancake:3 tortilla:3 nachos:3 black-pepper:2 salt:2 butter:2 caraway:3 garlic:2 cumin:1 hot-sauce:2",
  },
  yogurt: {
    name: "yogurt", aliases: ["yoghurt", "greek yogurt", "natural yogurt"], cat: "dairy",
    taste: "sour", weight: 2, volume: 1, season: "all", techniques: "marinate dollop strain", cuisines: { "middle-eastern": 4, indian: 4, mediterranean: 3 }, chips: ["Greek", "Turkish", "Persian", "Punjabi"], dishes: "dips marinades sauces breakfast desserts", art: "milk",
    pairs: "cucumber:4 mint:4 garlic:4 lemon:3 honey:4 dill:4 olive-oil:3 cumin:4 coriander-seed:3 turmeric:3 cardamom:3 cinnamon:2 saffron:2 chile:2 paprika:2 sumac:3 za-atar:3 black-pepper:2 salt:3 lamb:4 chicken:4 beef:2 pork:1 fish:2 shrimp:1 egg:2 chickpea:3 lentil:3 rice:3 bulgur:2 couscous:2 bread:3 pita:3 naan:3 oats:3 granola:4 eggplant:4 zucchini:2 beet:3 carrot:3 spinach:3 cauliflower:3 potato:2 sweet-potato:2 squash:2 tomato:2 avocado:2 walnut:3 pistachio:3 almond:3 hazelnut:2 pine-nut:1 pumpkin-seed:1 sesame:2 tahini:3 fig:2 date:2 apricot:3 mango:4 banana:3 strawberry:3 raspberry:2 blueberry:3 peach:3 cherry:2 pomegranate:3 orange:2 lime:2 melon:2 watermelon:2 rhubarb:3 apple:2 pear:1 quince:1 vanilla:2 rose:3 orange-blossom:2 chocolate:1 coffee:1 maple-syrup:2 sugar:2 brown-sugar:1 feta:2 cream:1 butter:1 harissa:3 pomegranate:3 parsley:2 cilantro:3 basil:1 onion:1 red-onion:2 scallion:1 preserved-lemon:2",
  },
  labneh: {
    name: "labneh", aliases: ["strained yogurt", "yogurt cheese"], cat: "dairy",
    taste: "sour salty:1", weight: 2, volume: 2, season: "all", techniques: "strain spread roll", cuisines: { "middle-eastern": 4 }, chips: ["Lebanese", "Turkish"], dishes: "dips breakfast mezze", art: "cheese",
    pairs: "olive-oil:4 za-atar:4 sumac:4 mint:3 pita:4 bread:3 cucumber:3 tomato:3 olive:3 garlic:2 lemon:2 honey:3 date:2 fig:2 pomegranate:3 walnut:2 pistachio:3 pine-nut:2 sesame:2 egg:2 lamb:3 chicken:2 beet:3 eggplant:3 carrot:2 zucchini:1 cauliflower:1 chickpea:2 dill:2 parsley:2 chile:2 harissa:2 black-pepper:2 salt:2 thyme:2 rose:1 orange-blossom:1 apricot:1",
  },
  milk: {
    name: "milk", aliases: ["whole milk"], cat: "dairy",
    taste: "sweet:1", weight: 2, volume: 1, season: "all", techniques: "infuse scald simmer", cuisines: { french: 3, indian: 3 }, dishes: "custards sauces breakfast drinks", art: "milk",
    pairs: "vanilla:4 sugar:4 chocolate:4 cocoa:4 coffee:4 tea:3 honey:3 cinnamon:3 nutmeg:4 cardamom:3 saffron:3 rose:3 bay-leaf:3 egg:4 butter:3 flour:3 rice:4 oats:4 bread:3 pastry:2 cheese:2 cheddar:2 gruyere:2 parmesan:1 potato:3 cauliflower:2 corn:2 leek:2 onion:2 cod:3 fish:2 ham:1 chicken:1 banana:3 strawberry:3 mango:2 date:1 almond:3 pistachio:2 hazelnut:2 coconut:2 caramel:3 malt:3 salt:1 turmeric:3 ginger:2 clove:2 peppercorn:1",
  },
  cheese: {
    name: "cheese", aliases: ["hard cheese", "melting cheese"], cat: "dairy",
    taste: "salty sweet:1", weight: 3, volume: 3, season: "all", techniques: "grate melt bake", cuisines: { french: 4, italian: 4, latin: 2, mediterranean: 2 }, dishes: "sandwiches pasta gratins salads cheese-plates", art: "cheese",
    pairs: "bread:4 egg:4 potato:3 onion:3 tomato:3 apple:3 pear:3 grape:3 fig:3 quince:3 date:2 honey:3 walnut:3 almond:2 hazelnut:2 pasta:4 pizza:4 rice:2 polenta:2 cauliflower:4 leek:3 spinach:2 mushroom:2 squash:2 corn:3 bean:2 ham:4 bacon:3 chicken:2 beef:3 pork:2 sausage:2 cream:3 milk:2 butter:3 black-pepper:3 nutmeg:3 mustard:3 pickles:3 chutney:3 cider:2 beer:3 red-wine:3 white-wine:2 port:2 chile:2 jalapeño:3 oregano:2 thyme:2 sage:1 chives:1 cracker:3 salt:3 truffle:2 caraway:3 cumin:1 paprika:1 olive-oil:2 balsamic-vinegar:1",
  },
  parmesan: {
    name: "parmesan", aliases: ["parmigiano reggiano", "grana padano", "parmigiano"], cat: "dairy",
    taste: "salty", weight: 2, volume: 4, season: "all", techniques: "grate shave melt", cuisines: { italian: 4 }, chips: ["Emilian"], dishes: "pasta risotto salads soups", art: "cheese",
    pairs: "pasta:4 risotto:4 polenta:3 gnocchi:3 pizza:3 bread:3 egg:4 butter:4 olive-oil:4 cream:3 black-pepper:4 garlic:3 basil:4 pesto:4 pine-nut:3 walnut:2 hazelnut:1 lemon:3 tomato:3 mushroom:3 asparagus:4 spinach:3 kale:3 arugula:4 fennel:3 zucchini:3 eggplant:3 artichoke:3 broccoli:3 cauliflower:3 squash:4 pea:3 leek:2 onion:2 potato:2 bean:2 lentil:1 chickpea:1 radicchio:2 celery:2 corn:1 truffle:4 balsamic-vinegar:4 fig:2 pear:3 apple:1 grape:2 prosciutto:4 pancetta:3 bacon:3 chicken:3 veal:3 beef:3 steak:2 anchovy:4 shrimp:1 cod:2 mozzarella:2 ricotta:3 gorgonzola:1 mascarpone:1 sage:3 rosemary:2 thyme:2 parsley:3 oregano:2 chile:2 nutmeg:3 saffron:2 honey:2 red-wine:3 white-wine:2 salt:2 chives:1 mint:1 caper:1 olive:2 rice:3",
  },
  pecorino: {
    name: "pecorino", aliases: ["pecorino romano", "sheep's cheese"], cat: "dairy",
    taste: "salty", weight: 2, volume: 4, season: "all", techniques: "grate shave", cuisines: { italian: 4 }, chips: ["Roman", "Sardinian", "Tuscan"], dishes: "pasta salads antipasti", art: "cheese",
    pairs: "pasta:4 black-pepper:4 egg:4 pancetta:4 guanciale:4 fava-bean:4 pea:2 artichoke:2 asparagus:1 zucchini:2 kale:2 broccoli:1 cauliflower:1 fennel:2 radicchio:1 arugula:2 tomato:2 potato:1 bean:2 chickpea:1 lentil:1 honey:4 pear:3 fig:2 apple:1 walnut:3 hazelnut:2 almond:1 pine-nut:2 olive-oil:3 bread:3 pizza:2 polenta:1 rice:1 lamb:1 sausage:2 anchovy:2 garlic:2 chile:2 mint:3 parsley:2 basil:2 rosemary:2 sage:2 thyme:1 lemon:2 truffle:3 red-wine:3 white-wine:1 salt:2 pecorino:1 fennel-seed:2",
  },
  mozzarella: {
    name: "mozzarella", aliases: ["fior di latte", "buffalo mozzarella", "bocconcini"], cat: "dairy",
    taste: "sweet:1 salty:1", weight: 2, volume: 1, season: "summer all", techniques: "tear melt raw", cuisines: { italian: 4 }, chips: ["Campanian", "Neapolitan"], dishes: "salads pizza sandwiches pasta", art: "cheese",
    pairs: "tomato:4 basil:4 olive-oil:4 pizza:4 bread:3 pasta:3 prosciutto:4 anchovy:2 olive:2 caper:1 garlic:2 oregano:3 black-pepper:3 salt:3 balsamic-vinegar:3 peach:3 melon:2 fig:2 strawberry:2 watermelon:2 cherry:1 pear:1 orange:1 eggplant:3 zucchini:2 bell-pepper:2 arugula:2 spinach:1 mushroom:2 artichoke:1 potato:1 pesto:4 parmesan:2 ricotta:2 egg:2 sausage:2 chicken:2 ham:2 lemon:2 chile:2 mint:1 thyme:1 honey:1 pine-nut:1 walnut:1 pistachio:1 hazelnut:1 cream:1 truffle:2",
  },
  burrata: {
    name: "burrata", aliases: ["stracciatella cheese"], cat: "dairy",
    taste: "sweet:1 salty:1", weight: 3, volume: 1, season: "summer", techniques: "raw tear", cuisines: { italian: 4 }, chips: ["Pugliese"], dishes: "salads antipasti pizza", art: "cheese",
    pairs: "tomato:4 peach:4 olive-oil:4 basil:3 bread:4 prosciutto:4 fig:3 melon:3 strawberry:2 cherry:2 grape:2 blood-orange:3 orange:2 pear:2 pomegranate:2 arugula:2 zucchini:2 eggplant:2 asparagus:2 pea:2 corn:2 beet:2 squash:1 mushroom:1 pesto:3 pine-nut:2 hazelnut:3 pistachio:3 almond:2 walnut:2 honey:3 balsamic-vinegar:3 lemon:2 chile:2 black-pepper:3 salt:4 anchovy:2 olive:2 caper:1 mint:2 oregano:1 thyme:1 pasta:2 pizza:2 truffle:2 pancetta:1 fennel:1 watermelon:2 apricot:1 cucumber:1",
  },
  ricotta: {
    name: "ricotta", aliases: ["fresh ricotta", "ricotta salata"], cat: "dairy",
    taste: "sweet:1", weight: 2, volume: 1, season: "all", techniques: "spread bake whip", cuisines: { italian: 4 }, chips: ["Sicilian", "Roman"], dishes: "pasta desserts breakfast toasts", art: "cheese",
    pairs: "spinach:4 lemon:4 honey:4 pasta:4 ravioli:4 gnocchi:3 lasagna:3 pizza:3 bread:3 toast:4 egg:3 parmesan:3 pecorino:2 mozzarella:2 nutmeg:4 black-pepper:3 salt:2 olive-oil:3 basil:3 mint:2 thyme:2 chives:1 parsley:1 sage:2 tomato:2 zucchini:3 pea:3 asparagus:2 artichoke:1 kale:1 squash:2 mushroom:2 fava-bean:3 beet:1 fig:3 pear:2 peach:3 cherry:3 strawberry:2 raspberry:2 blueberry:2 orange:2 lemon:4 apricot:2 chocolate:3 cocoa:2 coffee:2 vanilla:3 cinnamon:2 sugar:3 candied-peel:3 pistachio:3 almond:3 hazelnut:2 walnut:2 pine-nut:2 pastry:3 cannoli:4 pancake:3 raisin:2 prosciutto:2 ham:1 sausage:2 anchovy:1 truffle:1 cream:1 marsala:2 rum:1 amaretto:2 date:1",
  },
  mascarpone: {
    name: "mascarpone", aliases: [], cat: "dairy",
    taste: "sweet", weight: 3, volume: 1, season: "all", techniques: "whip fold spread", cuisines: { italian: 4 }, chips: ["Lombard"], dishes: "desserts risotto breakfast", art: "cheese",
    pairs: "coffee:4 cocoa:4 chocolate:3 tiramisu:4 vanilla:3 sugar:3 honey:3 egg:3 cream:3 amaretto:3 marsala:3 brandy:2 rum:2 lemon:3 orange:3 strawberry:3 raspberry:3 fig:3 peach:3 pear:3 cherry:2 apricot:2 banana:2 blueberry:2 mango:1 rhubarb:2 pomegranate:1 date:1 almond:2 pistachio:2 hazelnut:3 walnut:1 pastry:3 shortbread:2 bread:1 risotto:2 pasta:2 squash:2 mushroom:2 spinach:1 parmesan:1 prosciutto:1 black-pepper:1 salt:1 cinnamon:1 cardamom:1 nutmeg:1 rose:2 lavender:2 caramel:3",
  },
  "goat-cheese": {
    name: "goat cheese", aliases: ["chèvre", "chevre", "goat's cheese"], cat: "dairy",
    taste: "sour salty", weight: 2, volume: 3, season: "spring all", techniques: "crumble bake spread", cuisines: { french: 4, mediterranean: 2 }, chips: ["Loire", "Provençal"], dishes: "salads tarts toasts pizza", art: "cheese",
    pairs: "beet:4 honey:4 fig:4 thyme:4 walnut:3 hazelnut:3 almond:3 pistachio:2 pine-nut:2 pecan:2 lemon:3 olive-oil:3 balsamic-vinegar:3 vinegar:2 black-pepper:3 salt:2 chile:1 arugula:3 spinach:2 lettuce:2 radicchio:2 watercress:2 asparagus:2 pea:2 leek:3 onion:3 shallot:2 garlic:2 tomato:2 zucchini:3 eggplant:2 bell-pepper:3 squash:3 sweet-potato:2 potato:2 mushroom:2 artichoke:2 fennel:2 radish:2 cucumber:1 beet:4 corn:1 bean:1 lentil:3 chickpea:1 egg:3 bread:3 toast:3 pastry:3 pizza:2 pasta:2 polenta:1 rice:1 bacon:2 prosciutto:3 ham:1 chicken:2 lamb:2 duck:1 strawberry:2 raspberry:2 blueberry:2 blackberry:2 cherry:2 peach:2 apricot:2 pear:3 apple:2 grape:3 date:3 orange:2 blood-orange:2 pomegranate:3 watermelon:2 melon:1 cranberry:2 quince:2 rosemary:2 basil:3 mint:2 chives:2 dill:2 tarragon:2 oregano:1 lavender:2 pastry:3 white-wine:3 sherry:1 cider:1 cream:1 butter:1 sumac:2 za-atar:2 harissa:1 pumpkin-seed:1 caramel:1 chocolate:1 nutmeg:1",
  },
  feta: {
    name: "feta", aliases: ["feta cheese"], cat: "dairy",
    taste: "salty sour", weight: 2, volume: 3, season: "all", techniques: "crumble bake marinate", cuisines: { mediterranean: 4, "middle-eastern": 3 }, chips: ["Greek", "Turkish", "Bulgarian"], dishes: "salads pastries dips grills", art: "cheese",
    pairs: "watermelon:4 tomato:4 cucumber:4 olive:4 olive-oil:4 oregano:4 mint:4 dill:3 lemon:3 red-onion:3 onion:2 garlic:2 spinach:4 zucchini:3 eggplant:3 bell-pepper:3 beet:3 squash:2 sweet-potato:2 chickpea:3 lentil:2 bean:1 pea:2 fava-bean:2 corn:3 avocado:2 potato:2 cauliflower:2 kale:1 radish:1 arugula:1 lettuce:1 pastry:4 phyllo:4 bread:3 pita:4 pasta:2 rice:2 bulgur:2 couscous:2 egg:3 lamb:3 chicken:2 shrimp:3 squid:1 sausage:1 honey:3 fig:2 date:2 pomegranate:3 orange:2 grape:1 strawberry:2 melon:3 peach:2 apricot:1 pear:1 walnut:3 almond:2 pistachio:2 pine-nut:2 pumpkin-seed:1 sesame:2 chile:2 black-pepper:3 sumac:3 za-atar:3 paprika:1 cumin:2 thyme:3 basil:2 parsley:2 cilantro:1 yogurt:2 vinegar:2 balsamic-vinegar:1 harissa:2 tahini:1",
  },
  halloumi: {
    name: "halloumi", aliases: ["grilling cheese"], cat: "dairy",
    taste: "salty", weight: 3, volume: 3, season: "summer all", techniques: "grill fry", cuisines: { "middle-eastern": 3, mediterranean: 3 }, chips: ["Cypriot", "Lebanese"], dishes: "grills salads sandwiches mezze", art: "cheese",
    pairs: "lemon:4 honey:4 mint:4 watermelon:3 pomegranate:2 fig:2 peach:2 grape:1 orange:1 tomato:3 cucumber:2 zucchini:3 eggplant:3 bell-pepper:2 asparagus:2 beet:2 sweet-potato:2 squash:1 chickpea:2 lentil:1 couscous:2 bulgur:2 bread:3 pita:3 olive-oil:3 olive:2 chile:3 harissa:3 za-atar:3 sumac:3 oregano:2 thyme:2 basil:2 parsley:2 cilantro:1 dill:1 black-pepper:2 sesame:2 pine-nut:1 walnut:1 pistachio:2 almond:1 egg:2 yogurt:1 balsamic-vinegar:1 vinegar:1 lime:1 avocado:1 lamb:1 pumpkin-seed:1",
  },
  cheddar: {
    name: "cheddar", aliases: ["mature cheddar", "sharp cheddar"], cat: "dairy",
    taste: "salty sour:1", weight: 3, volume: 3, season: "all", techniques: "grate melt slice", cuisines: { french: 1, latin: 2 }, chips: ["British", "American", "Tex-Mex"], dishes: "sandwiches gratins burgers breakfast", art: "cheese",
    pairs: "apple:4 bread:4 toast:4 egg:4 bacon:4 ham:4 onion:3 potato:4 cauliflower:4 broccoli:3 corn:2 tomato:2 chile:3 jalapeño:4 mustard:4 pickles:4 chutney:4 beer:3 cider:3 whisky:2 red-wine:1 black-pepper:2 salt:2 butter:3 cream:2 milk:2 pastry:3 cracker:4 pasta:3 macaroni:4 rice:1 polenta:1 bean:3 black-bean:2 beef:3 burger:4 chicken:2 pork:2 sausage:2 turkey:2 tuna:2 shrimp:1 pear:2 grape:2 fig:1 date:1 walnut:3 pecan:2 hazelnut:1 honey:2 caramelized-onion:3 leek:2 mushroom:2 spinach:1 kale:1 nutmeg:1 cayenne:2 paprika:2 cumin:1 thyme:1 chives:2 sage:1 avocado:1 tortilla:3 nachos:3",
  },
  gruyere: {
    name: "gruyère", aliases: ["gruyere", "comté", "emmental", "alpine cheese"], cat: "dairy",
    taste: "salty sweet:1", weight: 3, volume: 3, season: "all", techniques: "grate melt bake", cuisines: { french: 4 }, chips: ["Swiss", "Alsatian", "Savoyard"], dishes: "gratins soups sandwiches fondue", art: "cheese",
    pairs: "onion:4 potato:4 leek:3 ham:4 bread:4 egg:4 cream:3 butter:3 milk:2 nutmeg:3 black-pepper:3 mustard:3 white-wine:4 kirsch:3 cider:2 beer:2 garlic:2 thyme:2 bay-leaf:1 chives:1 tarragon:1 bacon:3 sausage:2 chicken:2 veal:1 beef:2 pork:1 mushroom:3 spinach:2 cauliflower:3 broccoli:2 squash:2 asparagus:2 pea:1 cabbage:1 brussels-sprout:1 pasta:3 macaroni:3 polenta:1 rice:1 pastry:3 apple:2 pear:2 grape:2 fig:1 walnut:3 hazelnut:2 almond:1 pickles:3 cornichon:3 caraway:2 cumin:2 truffle:2 anchovy:1 lobster:2 crab:1 cod:1 tomato:1 chile:1",
  },
  "blue-cheese": {
    name: "blue cheese", aliases: ["stilton", "roquefort", "danish blue"], cat: "dairy",
    taste: "salty bitter:1", weight: 3, volume: 5, season: "autumn winter all", techniques: "crumble melt dress", cuisines: { french: 4 }, chips: ["British", "Roquefort"], dishes: "salads cheese-plates sauces burgers", art: "cheese",
    pairs: "pear:4 walnut:4 honey:4 celery:4 fig:4 apple:3 grape:3 date:3 cranberry:2 quince:2 plum:2 pomegranate:1 orange:1 cherry:1 port:4 red-wine:3 sherry:2 brandy:1 whisky:2 beer:2 cider:2 beef:4 steak:4 burger:4 bacon:3 pork:1 chicken:1 duck:1 lamb:1 venison:2 egg:1 bread:3 toast:3 cracker:3 pastry:3 pasta:2 risotto:2 polenta:2 potato:3 gnocchi:2 squash:3 sweet-potato:2 mushroom:2 cauliflower:2 broccoli:2 leek:2 onion:2 caramelized-onion:3 radicchio:3 arugula:2 lettuce:3 endive:4 chicory:4 spinach:2 beet:2 celery:4 pecan:3 hazelnut:2 almond:2 pine-nut:1 chestnut:1 cream:2 butter:2 crème-fraîche:1 chives:2 thyme:1 rosemary:1 sage:1 black-pepper:2 salt:1 balsamic-vinegar:2 vinegar:2 mustard:2 hot-sauce:3 buffalo-sauce:4 chocolate:2 caramel:2 truffle:1 maple-syrup:2",
  },
  gorgonzola: {
    name: "gorgonzola", aliases: ["gorgonzola dolce", "gorgonzola piccante"], cat: "dairy",
    taste: "salty sweet:1 bitter:1", weight: 3, volume: 4, season: "all", techniques: "melt crumble", cuisines: { italian: 4 }, chips: ["Lombard", "Piedmontese"], dishes: "pasta risotto pizza salads", art: "cheese",
    pairs: "pear:4 walnut:4 honey:4 radicchio:4 fig:3 grape:2 apple:2 date:1 polenta:4 risotto:4 gnocchi:4 pasta:3 pizza:3 bread:3 cream:3 mascarpone:3 butter:2 parmesan:1 squash:3 mushroom:2 spinach:2 leek:2 onion:2 potato:2 beef:3 steak:3 chicken:1 bacon:2 pancetta:2 prosciutto:2 sausage:2 hazelnut:3 pine-nut:1 almond:1 chestnut:1 sage:2 thyme:1 rosemary:1 black-pepper:2 balsamic-vinegar:2 red-wine:3 port:2 marsala:1 chocolate:1 celery:2 endive:3 arugula:2 pumpkin-seed:1",
  },
  brie: {
    name: "brie", aliases: ["camembert", "bloomy-rind cheese"], cat: "dairy",
    taste: "salty sweet:1", weight: 3, volume: 2, season: "all", techniques: "bake slice melt", cuisines: { french: 4 }, chips: ["Norman", "Île-de-France"], dishes: "cheese-plates sandwiches baking", art: "cheese",
    pairs: "apple:3 pear:2 grape:3 fig:3 cranberry:3 cherry:2 apricot:2 strawberry:1 raspberry:1 quince:1 date:1 honey:3 maple-syrup:1 walnut:3 almond:3 hazelnut:2 pecan:3 chestnut:1 bread:4 baguette:4 toast:3 cracker:3 pastry:4 puff-pastry:4 ham:2 prosciutto:2 bacon:2 turkey:2 chicken:1 mushroom:3 truffle:3 onion:2 caramelized-onion:3 garlic:2 thyme:3 rosemary:2 chives:1 black-pepper:2 mustard:2 chutney:3 jam:3 cider:3 calvados:3 champagne:3 white-wine:2 red-wine:2 butter:1 cream:1 egg:1 potato:1 leek:1 squash:1",
  },
  manchego: {
    name: "manchego", aliases: ["spanish sheep cheese"], cat: "dairy",
    taste: "salty sweet:1", weight: 3, volume: 3, season: "all", techniques: "slice shave", cuisines: { mediterranean: 4 }, chips: ["Spanish", "La Mancha"], dishes: "tapas cheese-plates salads", art: "cheese",
    pairs: "quince:4 membrillo:4 almond:4 olive:3 olive-oil:3 bread:3 chorizo:3 prosciutto:3 ham:3 honey:3 fig:3 grape:2 pear:2 apple:2 date:2 walnut:2 hazelnut:2 sherry:4 red-wine:3 cider:1 paprika:2 black-pepper:2 thyme:2 rosemary:2 tomato:2 bell-pepper:2 artichoke:1 asparagus:1 egg:2 pastry:1 cracker:2 beef:1 lamb:1 chicken:1 shrimp:1 anchovy:2 caper:1 garlic:1 saffron:1 orange:1 chocolate:1 arugula:1",
  },
  "cream-cheese": {
    name: "cream cheese", aliases: ["philadelphia"], cat: "dairy",
    taste: "sour:1 sweet:1 salty:1", weight: 3, volume: 1, season: "all", techniques: "spread whip bake", cuisines: { french: 1 }, chips: ["American", "Jewish"], dishes: "breakfast desserts dips baking", art: "cheese",
    pairs: "smoked-salmon:4 bagel:4 chives:4 dill:3 scallion:3 cucumber:2 radish:2 tomato:2 caper:2 red-onion:2 lemon:3 sugar:4 vanilla:4 strawberry:4 raspberry:3 blueberry:3 cherry:2 lime:2 orange:1 passion-fruit:2 mango:1 banana:2 pumpkin:3 carrot:4 chocolate:3 white-chocolate:2 caramel:3 honey:2 maple-syrup:2 cinnamon:3 nutmeg:1 graham:3 pastry:3 bread:3 toast:3 oats:1 egg:3 butter:3 cream:2 sour-cream:3 pecan:2 walnut:2 almond:2 hazelnut:1 pistachio:1 jalapeño:3 chile:2 bacon:2 garlic:2 herb:2 everything-bagel:3 black-pepper:1 salt:2 peanut:1 coffee:1",
  },
  paneer: {
    name: "paneer", aliases: ["indian cheese"], cat: "dairy",
    taste: "sweet:1", weight: 3, volume: 1, season: "all", techniques: "fry grill simmer", cuisines: { indian: 4 }, chips: ["Punjabi"], dishes: "curries grills wraps", art: "cheese",
    pairs: "spinach:4 tomato:3 onion:3 garlic:3 ginger:3 chile:3 cumin:3 coriander-seed:3 turmeric:3 garam-masala:4 cardamom:2 cinnamon:1 clove:1 fenugreek:3 cream:3 yogurt:3 butter:3 ghee:4 pea:4 bell-pepper:3 potato:2 cauliflower:2 cashew:3 almond:2 cilantro:3 mint:2 lemon:2 lime:2 rice:3 naan:4 bread:2 honey:1 saffron:1 mango:1 black-pepper:1 salt:2 tamarind:1 curry-leaf:1",
  },
  bread: {
    name: "bread", aliases: ["sourdough", "baguette", "loaf", "crusty bread", "toast"], cat: "grain",
    taste: "sweet:1 salty:1", weight: 3, volume: 1, season: "all", techniques: "toast grill crumb soak", cuisines: { french: 4, italian: 4, mediterranean: 4, "middle-eastern": 3 }, dishes: "sandwiches toasts soups salads", art: "bread",
    pairs: "butter:4 olive-oil:4 cheese:4 egg:4 tomato:4 garlic:4 salt:4 honey:3 jam:4 chocolate:3 anchovy:3 sardine:2 mackerel:3 smoked-salmon:3 ham:4 prosciutto:4 bacon:4 sausage:4 chorizo:3 chicken:3 beef:3 steak:2 pork:3 lamb:3 liver:4 pâté:4 soup:4 bean:3 chickpea:2 lentil:2 avocado:3 mushroom:3 onion:3 leek:2 kale:2 spinach:1 cabbage:1 cucumber:2 radish:3 pepper:2 bell-pepper:2 eggplant:2 zucchini:1 squash:1 potato:1 cream:2 crème-fraîche:2 ricotta:4 goat-cheese:3 feta:3 brie:4 cheddar:4 gruyere:4 blue-cheese:3 mozzarella:3 burrata:4 parmesan:3 manchego:3 labneh:3 yogurt:3 cream-cheese:3 mayonnaise:3 mustard:3 pickles:3 vinegar:2 balsamic-vinegar:3 oregano:2 rosemary:4 thyme:2 sage:2 basil:2 parsley:3 chives:2 dill:2 black-pepper:2 chile:1 cumin:1 caraway:4 fennel-seed:3 sesame:3 poppy-seed:3 za-atar:4 sumac:3 olive:4 caper:2 walnut:3 hazelnut:2 almond:2 raisin:3 date:2 fig:2 apple:2 pear:1 banana:3 strawberry:1 milk:3 sugar:2 cinnamon:3 vanilla:2 cocoa:2 coffee:2 beer:3 red-wine:3 white-wine:2 cider:2 clam:3 mussels:4 oyster:3 crab:3 shrimp:3 lobster:3 cod:3 tuna:2 oil:3 truffle:2 pesto:3 harissa:2 tahini:3 peanut:3 caramel:1",
  },
  pita: {
    name: "pita", aliases: ["flatbread", "pitta", "naan", "lavash"], cat: "grain",
    taste: "sweet:1", weight: 2, volume: 1, season: "all", techniques: "bake grill stuff", cuisines: { "middle-eastern": 4, indian: 3, mediterranean: 3 }, chips: ["Lebanese", "Greek", "Turkish", "Punjabi"], dishes: "sandwiches mezze dips", art: "bread",
    pairs: "hummus:4 tahini:4 labneh:4 yogurt:3 feta:4 halloumi:3 za-atar:4 sumac:4 olive-oil:4 olive:3 lamb:4 chicken:4 beef:2 falafel:4 chickpea:4 eggplant:3 tomato:3 cucumber:3 red-onion:3 onion:2 lettuce:2 parsley:3 mint:3 cilantro:2 dill:1 garlic:3 lemon:3 chile:2 harissa:3 cumin:2 paprika:1 sesame:3 egg:2 honey:2 date:1 fig:1 pomegranate:2 pickles:3 butter:2 ghee:2 cheese:2 spinach:2 potato:1 bean:1",
  },
  pasta: {
    name: "pasta", aliases: ["spaghetti", "penne", "linguine", "noodles", "fresh pasta"], cat: "grain",
    taste: "sweet:1", weight: 3, volume: 1, season: "all", techniques: "boil toss bake", cuisines: { italian: 4 }, dishes: "pasta", art: "pasta",
    pairs: "parmesan:4 pecorino:4 olive-oil:4 garlic:4 butter:4 tomato:4 basil:4 black-pepper:4 salt:4 egg:4 cream:3 pancetta:4 guanciale:4 bacon:3 sausage:3 prosciutto:3 chicken:2 beef:3 veal:3 pork:2 lamb:2 duck:1 rabbit:3 clam:4 mussels:3 shrimp:4 crab:3 lobster:3 squid:3 anchovy:4 tuna:3 cod:1 salmon:2 smoked-salmon:2 caviar:2 mushroom:4 truffle:4 zucchini:3 eggplant:3 bell-pepper:2 broccoli:3 cauliflower:2 kale:2 spinach:3 asparagus:3 pea:3 fava-bean:2 artichoke:2 fennel:1 leek:2 onion:3 shallot:2 potato:1 squash:3 radicchio:2 arugula:2 lettuce:1 corn:1 bean:3 chickpea:3 lentil:2 chile:3 lemon:3 orange:1 caper:3 olive:3 pine-nut:3 walnut:3 hazelnut:2 almond:2 pistachio:2 breadcrumb:3 ricotta:4 mozzarella:3 gorgonzola:3 goat-cheese:2 mascarpone:2 feta:2 burrata:2 pesto:4 parsley:3 oregano:2 sage:3 rosemary:1 thyme:2 mint:2 nutmeg:3 saffron:2 fennel-seed:2 white-wine:3 red-wine:3 vodka:3 brandy:1 vinegar:1 balsamic-vinegar:1 honey:1 raisin:2 miso:2 soy-sauce:1 sesame:1 ginger:1 harissa:1 bottarga:3 pumpkin-seed:1 milk:1",
  },
  noodles: {
    name: "noodles", aliases: ["rice noodles", "egg noodles", "ramen", "udon", "soba"], cat: "grain",
    taste: "sweet:1", weight: 3, volume: 1, season: "all", techniques: "boil stir-fry soup", cuisines: { "east-asian": 4, "se-asian": 4 }, chips: ["Japanese", "Chinese", "Thai", "Vietnamese"], dishes: "soups stir-fries salads", art: "pasta",
    pairs: "soy-sauce:4 sesame:4 ginger:4 garlic:4 scallion:4 chile:4 egg:4 pork:4 chicken:3 beef:3 shrimp:3 duck:2 tofu:3 fish-sauce:3 oyster-sauce:3 hoisin:2 miso:4 rice-vinegar:3 lime:3 peanut:4 cashew:2 cilantro:3 basil:3 mint:2 lemongrass:3 coconut-milk:3 mushroom:3 shiitake:3 bok-choy:3 cabbage:3 carrot:2 cucumber:2 bean-sprout:3 corn:2 broccoli:2 spinach:2 kimchi:3 seaweed:3 tamarind:3 star-anise:3 five-spice:2 honey:1 sugar:2 brown-sugar:2 black-pepper:1 salt:2 butter:2 cheese:1 sake:2 mirin:3 wasabi:1 crab:2 squid:2 clam:1 pickles:1 curry-powder:2 turmeric:1",
  },
  rice: {
    name: "rice", aliases: ["basmati", "jasmine rice", "long-grain rice", "short-grain rice"], cat: "grain",
    taste: "sweet:1", weight: 3, volume: 1, season: "all", techniques: "steam boil fry pilaf",
    cuisines: { indian: 4, "east-asian": 4, "se-asian": 4, "middle-eastern": 4, latin: 3, mediterranean: 3, italian: 2 }, dishes: "pilafs curries stir-fries puddings bowls", art: "rice",
    pairs: "butter:3 soy-sauce:4 egg:4 ginger:3 garlic:3 scallion:3 sesame:3 chile:2 cilantro:2 lime:2 lemon:2 coconut-milk:4 coconut:3 fish-sauce:2 miso:2 rice-vinegar:3 mirin:2 seaweed:3 saffron:4 cardamom:4 cinnamon:3 clove:3 bay-leaf:3 cumin:3 turmeric:4 star-anise:2 black-pepper:2 salt:3 onion:3 shallot:2 pea:3 carrot:1 corn:2 mushroom:3 shiitake:3 spinach:2 kale:1 squash:2 sweet-potato:1 tomato:2 bell-pepper:2 eggplant:2 cauliflower:2 broccoli:2 cabbage:1 cucumber:1 avocado:2 bean:3 black-bean:4 lentil:4 chickpea:3 chicken:3 pork:3 beef:3 lamb:3 duck:2 shrimp:4 fish:3 salmon:3 tuna:3 squid:3 mussels:3 clam:2 crab:3 tofu:4 paneer:3 cheese:2 parmesan:3 feta:2 yogurt:3 milk:4 cream:3 sugar:3 vanilla:3 honey:2 raisin:3 date:2 apricot:2 almond:3 pistachio:3 cashew:3 pine-nut:2 peanut:3 walnut:1 mango:3 banana:1 rose:2 orange-blossom:2 nutmeg:2 parsley:2 dill:3 mint:2 basil:1 tarragon:1 olive-oil:3 tahini:1 kimchi:3 pickles:2 curry-leaf:3 mustard:2 ghee:3 tamarind:1 wasabi:2 sake:2",
  },
  risotto: {
    name: "risotto rice", aliases: ["arborio", "carnaroli", "risotto"], cat: "grain",
    taste: "sweet:1", weight: 3, volume: 1, season: "all", techniques: "stir simmer", cuisines: { italian: 4 }, chips: ["Milanese", "Venetian", "Piedmontese"], dishes: "risotto", art: "rice",
    pairs: "parmesan:4 butter:4 white-wine:4 onion:4 shallot:3 stock:4 saffron:4 mushroom:4 porcini:4 truffle:4 pea:4 asparagus:4 squash:4 radicchio:3 spinach:2 leek:2 fennel:2 zucchini:2 artichoke:2 tomato:2 beet:2 corn:1 lemon:3 mascarpone:2 gorgonzola:4 goat-cheese:2 taleggio:3 cream:2 egg:1 pancetta:3 sausage:2 prosciutto:2 chicken:2 veal:3 rabbit:2 shrimp:3 scallop:3 lobster:3 mussels:2 clam:2 squid:2 cod:1 salmon:1 sage:2 thyme:2 rosemary:1 parsley:3 basil:2 mint:2 chives:2 black-pepper:3 salt:3 nutmeg:1 pine-nut:1 hazelnut:1 red-wine:3 vermouth:2 pear:2 strawberry:1 ink:3",
  },
  polenta: {
    name: "polenta", aliases: ["cornmeal", "grits"], cat: "grain",
    taste: "sweet:1", weight: 3, volume: 1, season: "autumn winter", techniques: "simmer grill fry", cuisines: { italian: 4, latin: 2 }, chips: ["Venetian", "Piedmontese", "Southern US"], dishes: "sides braises breakfast", art: "rice",
    pairs: "butter:4 parmesan:4 gorgonzola:4 cheese:3 cheddar:3 cream:2 milk:2 mascarpone:2 goat-cheese:2 egg:2 mushroom:4 porcini:3 sausage:4 pork:3 beef:3 veal:2 chicken:2 rabbit:2 duck:1 liver:3 bacon:2 pancetta:2 shrimp:3 cod:1 tomato:3 squash:2 kale:2 spinach:2 radicchio:2 onion:2 garlic:2 bean:2 lentil:1 corn:2 bell-pepper:2 sage:3 rosemary:3 thyme:2 bay-leaf:1 parsley:2 chile:1 black-pepper:3 salt:3 nutmeg:1 olive-oil:3 red-wine:3 white-wine:1 honey:1 maple-syrup:1 truffle:3 walnut:1 hazelnut:1",
  },
  couscous: {
    name: "couscous", aliases: ["pearl couscous", "israeli couscous"], cat: "grain",
    taste: "sweet:1", weight: 2, volume: 1, season: "all", techniques: "steam soak", cuisines: { "middle-eastern": 4, mediterranean: 2 }, chips: ["Moroccan", "Tunisian", "Algerian", "Sicilian"], dishes: "tagines salads sides", art: "rice",
    pairs: "lamb:4 chicken:3 fish:2 shrimp:2 chickpea:4 lentil:1 carrot:3 zucchini:2 squash:2 sweet-potato:2 turnip:3 onion:3 tomato:3 bell-pepper:2 eggplant:2 cauliflower:1 pea:1 fennel:1 raisin:3 apricot:3 date:3 fig:1 orange:2 lemon:2 preserved-lemon:4 pomegranate:2 almond:3 pistachio:2 pine-nut:2 walnut:1 harissa:4 ras-el-hanout:4 cumin:3 coriander-seed:2 cinnamon:2 saffron:2 turmeric:2 paprika:2 ginger:1 chile:2 mint:3 parsley:3 cilantro:3 olive-oil:3 butter:3 olive:2 feta:2 halloumi:2 yogurt:2 honey:1 black-pepper:2 salt:2 cucumber:1 red-onion:1 sumac:1 merguez:4 sausage:2",
  },
  bulgur: {
    name: "bulgur", aliases: ["bulgur wheat", "cracked wheat", "freekeh"], cat: "grain",
    taste: "sweet:1", weight: 2, volume: 1, season: "all", techniques: "soak simmer pilaf", cuisines: { "middle-eastern": 4 }, chips: ["Lebanese", "Turkish", "Armenian"], dishes: "salads pilafs mezze", art: "rice",
    pairs: "parsley:4 mint:3 tomato:4 lemon:4 olive-oil:4 red-onion:2 onion:3 scallion:2 cucumber:2 bell-pepper:2 eggplant:2 lamb:4 chicken:2 beef:2 chickpea:3 lentil:3 pomegranate:3 raisin:1 apricot:1 date:1 walnut:3 pine-nut:2 almond:2 pistachio:2 yogurt:2 feta:2 labneh:1 halloumi:2 cumin:2 allspice:2 cinnamon:1 sumac:3 paprika:2 chile:2 black-pepper:2 salt:2 butter:2 garlic:2 dill:1 cilantro:1 tahini:1 harissa:1",
  },
  oats: {
    name: "oats", aliases: ["oatmeal", "porridge oats", "rolled oats"], cat: "grain",
    taste: "sweet:1", weight: 2, volume: 1, season: "all", techniques: "simmer bake toast", cuisines: { french: 1 }, chips: ["Scottish", "Scandinavian"], dishes: "breakfast baking crumbles", art: "rice",
    pairs: "milk:4 butter:3 cream:2 yogurt:3 honey:4 maple-syrup:4 brown-sugar:4 sugar:2 cinnamon:4 nutmeg:2 cardamom:2 ginger:1 vanilla:3 salt:2 apple:4 banana:3 pear:2 blueberry:3 raspberry:2 strawberry:2 blackberry:2 peach:2 apricot:1 cherry:1 cranberry:2 raisin:3 date:3 fig:1 rhubarb:3 coconut:2 almond:3 walnut:3 pecan:3 hazelnut:3 peanut:2 pistachio:1 pumpkin-seed:1 chocolate:3 cocoa:2 white-chocolate:1 caramel:2 coffee:1 egg:1 flour:3 pastry:3 whisky:3 beer:2 cheese:1 cheddar:1 bacon:1 chive:1",
  },
  chickpea: {
    name: "chickpea", aliases: ["chickpeas", "garbanzo beans", "gram"], cat: "grain",
    taste: "sweet:1", weight: 2, volume: 1, season: "all", techniques: "simmer roast mash fry", cuisines: { "middle-eastern": 4, indian: 4, mediterranean: 4, italian: 2 }, chips: ["Lebanese", "Punjabi", "Spanish", "Moroccan", "Ligurian"], dishes: "dips stews salads curries fritters", art: "bean",
    pairs: "tahini:4 lemon:4 garlic:4 olive-oil:4 cumin:4 coriander-seed:3 paprika:3 turmeric:3 chile:3 ginger:2 cinnamon:1 cardamom:1 harissa:3 sumac:3 za-atar:3 parsley:3 cilantro:3 mint:2 rosemary:3 sage:2 thyme:2 bay-leaf:2 onion:3 shallot:1 red-onion:2 tomato:3 spinach:3 kale:2 chard:3 eggplant:3 cauliflower:3 squash:2 sweet-potato:2 carrot:2 potato:2 zucchini:1 bell-pepper:2 cucumber:2 avocado:1 feta:3 yogurt:3 labneh:2 halloumi:2 parmesan:1 egg:2 lamb:4 chicken:2 chorizo:4 sausage:2 cod:3 shrimp:2 tuna:2 squid:1 octopus:3 rice:3 couscous:4 bulgur:3 pasta:3 bread:2 pita:4 lentil:2 coconut-milk:3 raisin:2 date:1 apricot:1 pomegranate:2 vinegar:2 sherry-vinegar:2 salt:3 black-pepper:3 sesame:3 pine-nut:1 almond:1 preserved-lemon:3 curry-powder:3 mustard:1",
  },
  lentil: {
    name: "lentil", aliases: ["lentils", "puy lentils", "red lentils", "dal"], cat: "grain",
    taste: "sweet:1", weight: 2, volume: 1, season: "autumn winter all", techniques: "simmer braise purée", cuisines: { indian: 4, french: 4, "middle-eastern": 4, mediterranean: 2, italian: 2 }, chips: ["Punjabi", "Le Puy", "Lebanese", "Umbrian"], dishes: "dals soups stews salads", art: "bean",
    pairs: "cumin:4 turmeric:4 ginger:4 garlic:4 onion:4 tomato:3 chile:3 coriander-seed:3 mustard:3 curry-leaf:4 cardamom:1 cinnamon:1 bay-leaf:3 thyme:3 rosemary:2 sage:2 parsley:3 cilantro:3 mint:2 dill:1 lemon:3 lime:2 vinegar:3 sherry-vinegar:3 balsamic-vinegar:2 olive-oil:3 butter:2 ghee:4 cream:1 yogurt:3 coconut-milk:3 feta:2 goat-cheese:3 parmesan:1 egg:2 bacon:3 pancetta:3 sausage:4 chorizo:3 ham:2 pork:3 duck:4 chicken:2 lamb:4 beef:2 salmon:3 cod:2 shrimp:1 scallop:2 carrot:3 celery:2 leek:2 potato:2 sweet-potato:2 squash:2 spinach:3 kale:2 chard:2 cauliflower:2 eggplant:2 beet:2 mushroom:2 bell-pepper:1 rice:4 bread:2 naan:3 pita:2 walnut:2 hazelnut:1 almond:1 pomegranate:1 raisin:1 apricot:1 date:1 tamarind:2 harissa:2 sumac:3 paprika:2 black-pepper:3 salt:3 mustard:3 preserved-lemon:2 red-wine:2 pickles:1",
  },
  bean: {
    name: "white bean", aliases: ["beans", "cannellini", "haricot beans", "butter beans", "navy beans"], cat: "grain",
    taste: "sweet:1", weight: 3, volume: 1, season: "autumn winter all", techniques: "simmer braise purée bake", cuisines: { italian: 4, french: 3, mediterranean: 3, latin: 2 }, chips: ["Tuscan", "Toulouse", "Spanish", "Greek"], dishes: "stews soups salads dips cassoulet", art: "bean",
    pairs: "garlic:4 olive-oil:4 rosemary:4 sage:4 thyme:3 bay-leaf:3 parsley:2 oregano:2 basil:2 chile:3 black-pepper:3 salt:3 lemon:3 vinegar:3 sherry-vinegar:2 balsamic-vinegar:1 tomato:4 onion:3 carrot:3 celery:3 leek:2 kale:4 chard:3 spinach:2 cabbage:2 fennel:2 squash:2 potato:2 mushroom:2 bell-pepper:2 corn:2 zucchini:1 sausage:4 chorizo:3 bacon:3 pancetta:3 ham:3 pork:4 lamb:3 duck:4 chicken:2 beef:3 tuna:4 anchovy:3 shrimp:2 cod:3 clam:2 squid:2 parmesan:3 pecorino:2 feta:2 goat-cheese:1 cheese:2 egg:2 bread:4 pasta:3 rice:2 polenta:2 cream:1 butter:2 mustard:2 paprika:2 cumin:2 harissa:2 honey:1 maple-syrup:2 molasses:2 brown-sugar:1 red-wine:2 white-wine:2 beer:2 pesto:2 truffle:1",
  },
  "black-bean": {
    name: "black bean", aliases: ["black beans", "frijoles negros", "turtle beans"], cat: "grain",
    taste: "sweet:1", weight: 3, volume: 1, season: "all", techniques: "simmer refry mash", cuisines: { latin: 4 }, chips: ["Mexican", "Cuban", "Brazilian"], dishes: "stews tacos rice salads soups", art: "bean",
    pairs: "cumin:4 lime:4 cilantro:4 chile:4 jalapeño:3 chipotle:4 garlic:4 onion:4 red-onion:2 oregano:3 bay-leaf:3 epazote:3 paprika:2 coriander-seed:1 cinnamon:1 allspice:1 black-pepper:2 salt:3 rice:4 tortilla:4 corn:4 cornbread:2 bread:1 avocado:4 tomato:3 bell-pepper:3 sweet-potato:4 squash:2 kale:1 spinach:1 plantain:3 banana:1 mango:2 pineapple:2 orange:2 feta:2 cotija:3 cheddar:2 cheese:3 goat-cheese:1 sour-cream:3 cream:1 yogurt:1 egg:3 pork:3 bacon:2 chorizo:3 beef:3 chicken:3 shrimp:2 fish:1 scallion:2 coconut-milk:1 coconut:1 chocolate:2 coffee:2 beer:2 rum:1 tequila:1 vinegar:2 hot-sauce:3 honey:1 brown-sugar:1 pumpkin-seed:2 cashew:1",
  },
  almond: {
    name: "almond", aliases: ["almonds", "ground almonds", "marzipan"], cat: "nut",
    taste: "sweet", weight: 2, volume: 2, season: "all", techniques: "toast grind blanch", cuisines: { mediterranean: 4, "middle-eastern": 4, french: 3, indian: 3, italian: 3 }, chips: ["Spanish", "Moroccan", "Sicilian", "Mughlai", "Provençal"], dishes: "baking desserts sauces salads", art: "nut",
    pairs: "apricot:4 cherry:4 peach:4 pear:3 apple:3 fig:3 orange:3 lemon:3 raspberry:3 strawberry:3 plum:3 date:4 quince:3 grape:2 rhubarb:3 blueberry:3 blackberry:2 cranberry:2 pomegranate:2 banana:2 coconut:3 chocolate:4 white-chocolate:2 caramel:3 honey:4 sugar:4 brown-sugar:2 vanilla:3 cinnamon:3 cardamom:3 saffron:3 rose:3 orange-blossom:3 nutmeg:1 anise:2 amaretto:4 brandy:2 sherry:3 rum:1 marsala:2 butter:3 cream:2 milk:3 ricotta:3 mascarpone:2 goat-cheese:3 manchego:4 feta:2 parmesan:1 egg:3 pastry:4 shortbread:3 bread:2 oats:3 rice:3 couscous:3 chicken:2 lamb:3 duck:1 pork:1 trout:4 sole:3 cod:1 shrimp:1 green-bean:4 cauliflower:3 broccoli:2 asparagus:2 carrot:2 fennel:1 kale:2 spinach:1 bell-pepper:3 tomato:1 garlic:2 chile:2 paprika:3 cumin:1 coriander-seed:1 olive-oil:3 salt:3 black-pepper:1 coffee:2 tea:1 pistachio:2 hazelnut:2 walnut:1 pine-nut:1 raisin:3 harissa:1 romesco:4",
  },
  hazelnut: {
    name: "hazelnut", aliases: ["hazelnuts", "filberts", "cobnuts"], cat: "nut",
    taste: "sweet", weight: 2, volume: 2, season: "autumn", techniques: "toast grind praline", cuisines: { italian: 4, french: 3 }, chips: ["Piedmontese", "Turkish"], dishes: "desserts baking salads sauces", art: "nut",
    pairs: "chocolate:4 coffee:3 caramel:4 brown-butter:4 butter:3 cream:2 vanilla:3 honey:3 sugar:3 brown-sugar:2 pear:3 apple:3 fig:2 peach:2 raspberry:2 strawberry:2 banana:3 orange:2 cherry:2 plum:2 blackberry:2 date:1 quince:2 cranberry:1 squash:3 brussels-sprout:3 cauliflower:3 beet:2 mushroom:2 asparagus:2 green-bean:2 carrot:1 celeriac:2 leek:1 scallop:3 trout:2 chicken:1 duck:2 pork:1 venison:2 lamb:1 goat-cheese:3 blue-cheese:2 gorgonzola:3 gruyere:2 brie:2 parmesan:1 ricotta:2 mascarpone:3 pastry:3 shortbread:2 oats:3 bread:2 cocoa:4 nutella:4 cinnamon:2 nutmeg:1 cardamom:1 frangelico:4 brandy:1 sherry:2 almond:2 pistachio:1 walnut:1 salt:2 black-pepper:1 olive-oil:2 vinegar:1 sherry-vinegar:2 balsamic-vinegar:1 sage:3 thyme:1 rosemary:2 radicchio:2 arugula:1 burrata:3",
  },
  walnut: {
    name: "walnut", aliases: ["walnuts"], cat: "nut",
    taste: "bitter astringent sweet:1", weight: 2, volume: 3, season: "autumn", techniques: "toast chop candy", cuisines: { french: 3, "middle-eastern": 4, italian: 3 }, chips: ["Périgord", "Persian", "Ligurian", "Georgian"], dishes: "salads baking sauces desserts", art: "nut",
    pairs: "blue-cheese:4 gorgonzola:4 goat-cheese:3 pear:4 apple:4 fig:3 grape:3 date:4 banana:3 cranberry:3 pomegranate:4 orange:2 lemon:1 quince:3 plum:1 cherry:1 raspberry:1 maple-syrup:4 honey:3 brown-sugar:3 sugar:2 caramel:3 chocolate:3 coffee:3 vanilla:2 cinnamon:3 nutmeg:1 cardamom:1 butter:2 cream:1 cream-cheese:2 ricotta:2 parmesan:2 pecorino:3 cheddar:3 brie:3 feta:3 yogurt:3 labneh:2 egg:1 bread:3 pasta:3 oats:3 pastry:3 rice:1 bulgur:3 lentil:2 bean:1 chickpea:1 beet:3 celery:3 radicchio:3 arugula:2 endive:3 lettuce:2 spinach:1 kale:2 brussels-sprout:2 squash:3 sweet-potato:2 mushroom:2 carrot:2 cauliflower:1 eggplant:2 bell-pepper:3 zucchini:1 fennel:2 leek:2 garlic:2 parsley:2 basil:2 sage:3 rosemary:2 thyme:2 dill:1 cilantro:1 chile:1 cumin:1 paprika:1 salt:2 black-pepper:2 olive-oil:3 walnut-oil:4 vinegar:2 sherry-vinegar:3 balsamic-vinegar:2 red-wine:2 port:2 brandy:1 whisky:1 chicken:2 duck:2 pork:1 lamb:2 beef:1 trout:1 rum:1 tahini:1 pomegranate:4",
  },
  pecan: {
    name: "pecan", aliases: ["pecans"], cat: "nut",
    taste: "sweet", weight: 2, volume: 2, season: "autumn", techniques: "toast candy bake", cuisines: { latin: 2 }, chips: ["Southern US", "Mexican"], dishes: "baking desserts salads", art: "nut",
    pairs: "maple-syrup:4 brown-sugar:4 caramel:4 butter:4 bourbon:4 vanilla:3 cinnamon:4 nutmeg:2 chocolate:3 coffee:2 honey:3 molasses:3 sugar:3 cream:2 sweet-potato:4 squash:3 pumpkin:4 apple:3 pear:2 banana:3 peach:2 cranberry:3 orange:1 date:1 fig:1 blueberry:2 cherry:1 pastry:4 pie:4 oats:3 bread:2 cornbread:2 rice:1 blue-cheese:3 goat-cheese:2 cheddar:2 brie:3 cream-cheese:2 chicken:2 pork:2 bacon:1 turkey:2 duck:1 trout:1 shrimp:1 salt:3 chile:2 paprika:1 cayenne:2 rosemary:1 sage:1 thyme:1 brussels-sprout:1 green-bean:1 beet:1 kale:1 arugula:1 rum:2 whisky:2 coconut:1 white-chocolate:1",
  },
  pistachio: {
    name: "pistachio", aliases: ["pistachios"], cat: "nut",
    taste: "sweet", weight: 2, volume: 2, season: "all", techniques: "toast chop grind", cuisines: { "middle-eastern": 4, italian: 3, indian: 3 }, chips: ["Persian", "Sicilian", "Turkish", "Mughlai"], dishes: "desserts baking salads rice", art: "nut",
    pairs: "rose:4 cardamom:4 saffron:3 orange:3 blood-orange:3 lemon:2 honey:4 sugar:3 vanilla:2 chocolate:3 white-chocolate:3 cream:2 mascarpone:2 ricotta:3 yogurt:3 labneh:3 goat-cheese:2 feta:2 burrata:3 mozzarella:1 apricot:3 fig:3 date:3 pomegranate:3 cherry:3 strawberry:3 raspberry:2 peach:2 pear:1 mango:1 grape:1 melon:2 watermelon:2 quince:1 cranberry:1 cinnamon:2 clove:1 orange-blossom:3 mint:2 basil:1 parsley:1 cilantro:1 dill:1 pastry:4 baklava:4 phyllo:4 shortbread:2 bread:1 rice:3 couscous:2 bulgur:2 oats:1 lamb:3 chicken:1 duck:1 pork:1 scallop:1 shrimp:1 cod:1 beet:2 carrot:2 asparagus:1 pea:1 fennel:1 arugula:1 avocado:1 cauliflower:1 olive-oil:3 salt:3 black-pepper:1 chile:1 sumac:2 almond:2 hazelnut:1 coffee:1 tea:1 amaretto:1 mortadella:3",
  },
  "pine-nut": {
    name: "pine nut", aliases: ["pine nuts", "pignoli"], cat: "nut",
    taste: "sweet", weight: 1, volume: 2, season: "all", techniques: "toast grind", cuisines: { italian: 4, mediterranean: 4, "middle-eastern": 3 }, chips: ["Ligurian", "Sicilian", "Lebanese", "Catalan"], dishes: "pesto salads pasta pastries", art: "nut",
    pairs: "basil:4 pesto:4 parmesan:3 pecorino:2 garlic:3 olive-oil:4 raisin:4 anchovy:2 caper:1 lemon:2 orange:1 honey:3 sugar:2 chocolate:1 rosemary:2 sage:2 thyme:1 parsley:2 mint:2 spinach:3 kale:2 chard:3 zucchini:2 eggplant:2 cauliflower:2 broccoli:2 green-bean:1 asparagus:2 artichoke:2 fennel:1 tomato:2 bell-pepper:2 squash:1 beet:1 pasta:3 rice:2 couscous:2 bulgur:1 bread:2 pastry:3 lamb:3 chicken:2 pork:1 sardine:3 mackerel:2 cod:1 scallop:1 shrimp:1 ricotta:2 goat-cheese:2 feta:2 mozzarella:1 burrata:2 yogurt:1 labneh:2 egg:1 fig:1 pear:1 apple:1 cinnamon:1 nutmeg:1 sumac:2 pomegranate:1 chile:1 salt:2 black-pepper:1 balsamic-vinegar:2 vinegar:2 currant:3",
  },
  peanut: {
    name: "peanut", aliases: ["peanuts", "groundnut", "peanut butter"], cat: "nut",
    taste: "sweet salty:1", weight: 2, volume: 3, season: "all", techniques: "roast grind sauce", cuisines: { "se-asian": 4, "east-asian": 3, latin: 2, indian: 2 }, chips: ["Thai", "Vietnamese", "Sichuan", "Indonesian", "West African", "American"], dishes: "sauces stir-fries salads desserts", art: "nut",
    pairs: "chile:4 lime:4 cilantro:3 garlic:3 ginger:3 scallion:2 soy-sauce:4 fish-sauce:3 coconut-milk:4 coconut:3 tamarind:3 lemongrass:2 sesame:3 sugar:3 brown-sugar:3 honey:3 caramel:4 chocolate:4 banana:4 apple:2 grape:3 jam:4 jelly:4 raspberry:2 strawberry:2 date:1 vanilla:2 cream:2 milk:2 butter:2 ice-cream:3 oats:2 bread:3 toast:3 pastry:2 rice:3 noodles:4 tortilla:1 chicken:4 pork:3 beef:2 shrimp:3 tofu:3 egg:1 cucumber:2 cabbage:2 carrot:2 green-bean:2 broccoli:2 sweet-potato:2 corn:1 celery:2 spinach:1 eggplant:1 mango:2 pineapple:2 papaya:3 bacon:1 cheese:1 cream-cheese:1 salt:4 black-pepper:1 curry-powder:2 cumin:1 turmeric:1 miso:2 hoisin:2 rice-vinegar:2 vinegar:1 beer:3 bourbon:2 rum:1 pretzel:3 popcorn:2 kimchi:1",
  },
  cashew: {
    name: "cashew", aliases: ["cashews", "cashew nuts"], cat: "nut",
    taste: "sweet", weight: 2, volume: 2, season: "all", techniques: "toast grind cream", cuisines: { indian: 4, "se-asian": 3, "east-asian": 3 }, chips: ["Mughlai", "Goan", "Thai", "Cantonese"], dishes: "curries stir-fries sauces desserts", art: "nut",
    pairs: "chicken:4 shrimp:2 pork:2 beef:1 tofu:2 paneer:3 lentil:1 chickpea:1 rice:3 noodles:2 bread:1 broccoli:2 bell-pepper:3 scallion:2 carrot:1 cauliflower:1 pea:1 spinach:1 sweet-potato:1 mushroom:1 eggplant:1 corn:1 cucumber:1 mango:2 pineapple:2 banana:1 coconut:3 coconut-milk:3 lime:2 lemon:1 orange:1 date:2 raisin:2 apricot:1 cardamom:3 cinnamon:2 saffron:2 turmeric:2 cumin:2 coriander-seed:2 chile:3 ginger:3 garlic:3 curry-leaf:2 curry-powder:2 black-pepper:2 salt:3 honey:3 sugar:2 caramel:2 chocolate:2 white-chocolate:1 vanilla:2 cream:2 milk:2 yogurt:1 rose:1 soy-sauce:3 oyster-sauce:3 hoisin:2 fish-sauce:2 sesame:2 rice-vinegar:1 tamarind:1 ghee:2 butter:1 pastry:1 oats:1 cilantro:2 basil:1 mint:1",
  },
  chestnut: {
    name: "chestnut", aliases: ["chestnuts", "marron", "chestnut purée"], cat: "nut",
    taste: "sweet", weight: 3, volume: 2, season: "autumn winter", techniques: "roast purée candy braise", cuisines: { french: 4, italian: 3, "east-asian": 2 }, chips: ["Piedmontese", "Corsican", "Japanese"], dishes: "stuffings soups desserts braises", art: "nut",
    pairs: "brussels-sprout:4 cabbage:2 squash:2 mushroom:3 porcini:3 celeriac:2 leek:1 onion:2 potato:1 carrot:1 kale:1 turkey:4 pork:3 sausage:3 bacon:3 pancetta:2 duck:3 venison:3 chicken:1 goose:3 pheasant:3 rabbit:2 chocolate:4 vanilla:3 cream:3 sugar:3 brown-sugar:2 honey:3 rum:3 brandy:3 whisky:1 marsala:2 red-wine:2 madeira:2 port:1 pear:2 apple:2 orange:2 fig:1 quince:1 cranberry:1 prune:2 raisin:1 cinnamon:2 nutmeg:1 clove:1 vanilla:3 bay-leaf:2 thyme:2 sage:3 rosemary:2 parsley:1 butter:3 milk:2 mascarpone:2 ricotta:1 parmesan:2 blue-cheese:1 egg:1 pastry:3 bread:2 rice:1 pasta:2 polenta:1 lentil:2 salt:2 black-pepper:2 olive-oil:1 hazelnut:1 almond:1 coffee:1 cocoa:2 lamb:1 beef:1",
  },
  sesame: {
    name: "sesame", aliases: ["sesame seeds", "sesame oil", "toasted sesame"], cat: "nut",
    taste: "sweet:1 bitter:1", weight: 1, volume: 3, season: "all", techniques: "toast grind sprinkle", cuisines: { "east-asian": 4, "middle-eastern": 4, "se-asian": 3 }, chips: ["Japanese", "Korean", "Chinese", "Lebanese"], dishes: "stir-fries salads breads sauces desserts", art: "spice",
    pairs: "soy-sauce:4 ginger:4 scallion:4 garlic:4 rice-vinegar:3 honey:4 sugar:3 brown-sugar:2 miso:3 chile:3 lime:1 lemon:2 orange:2 tahini:4 halva:4 chicken:3 beef:3 pork:3 duck:2 tuna:4 salmon:3 shrimp:3 scallop:2 squid:2 tofu:4 egg:2 rice:3 noodles:4 bread:3 bagel:3 pita:3 cracker:2 pastry:2 cucumber:3 spinach:3 broccoli:3 bok-choy:3 cabbage:2 kale:2 carrot:2 green-bean:3 eggplant:3 sweet-potato:2 squash:2 avocado:2 radish:2 asparagus:2 mushroom:2 seaweed:3 kimchi:2 chocolate:2 caramel:3 banana:1 fig:2 date:2 pomegranate:1 mango:1 cardamom:1 cinnamon:1 black-pepper:1 salt:3 peanut:3 cashew:2 almond:1 pistachio:1 oats:1 za-atar:4 sumac:3 cumin:1 coriander-seed:1 fish-sauce:1 oyster-sauce:1 wasabi:1 sake:1 mirin:2 cilantro:1 mint:1 yogurt:2 labneh:2 halloumi:2 feta:2 hummus:3",
  },
  "pumpkin-seed": {
    name: "pumpkin seed", aliases: ["pepitas", "pumpkin seeds"], cat: "nut",
    taste: "sweet:1 bitter:1", weight: 1, volume: 2, season: "autumn", techniques: "toast grind", cuisines: { latin: 4 }, chips: ["Mexican", "Austrian"], dishes: "salads sauces breads garnish", art: "nut",
    pairs: "chile:3 lime:3 cilantro:3 tomato:2 tomatillo:3 garlic:2 onion:1 cumin:2 coriander-seed:1 paprika:1 cinnamon:1 black-pepper:1 salt:3 squash:3 pumpkin:4 sweet-potato:2 beet:1 kale:2 avocado:2 corn:2 bean:1 black-bean:2 chicken:3 pork:3 turkey:2 fish:1 shrimp:1 egg:1 cheese:2 feta:1 goat-cheese:1 cotija:1 yogurt:1 cream:1 bread:2 oats:1 granola:2 rice:1 honey:2 maple-syrup:2 brown-sugar:1 chocolate:2 caramel:1 cranberry:1 apple:1 pear:1 date:1 olive-oil:2 pumpkin-seed-oil:4 vinegar:1 cider-vinegar:1 sesame:1 sage:1 rosemary:1 thyme:1 tahini:1",
  },
};
export default entries;
