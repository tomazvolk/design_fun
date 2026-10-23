/*
 * Slovenian UI strings, keyed by the English text in the code. Plurals are arrays of four forms:
 * [1, 2, 3–4, 5+], e.g. 1 partner, 2 partnerja, 3 partnerji, 5 partnerjev.
 */
/** @type {Record<string, string | [string, string, string, string]>} */
export const SL = {
  // shell and navigation
  Explore: "Raziskuj", Saved: "Shranjeno", Season: "Sezona", Main: "Glavna navigacija", Language: "Jezik",
  "Add to Home Screen": "Dodaj na začetni zaslon",
  "Add Pairing Explorer to your Home Screen: tap Share, then Add to Home Screen. It then opens full screen and keeps your saved combinations.":
    "Dodaj Pairing Explorer na začetni zaslon: tapni Deli, nato Dodaj na začetni zaslon. Potem se odpre čez cel zaslon in obdrži tvoje shranjene kombinacije.",
  Dismiss: "Zapri", "A newer version is ready.": "Na voljo je nova različica.", Update: "Posodobi",
  // onboarding
  Welcome: "Dobrodošli", Skip: "Preskoči", "Slide {i} of {n}": "Stran {i} od {n}", "Start exploring": "Začni raziskovati", Next: "Naprej",
  "Start with what's in the pan.": "Začni s tem, kar je v ponvi.",
  "Type one ingredient and see everything it goes with on a wheel, strongest partners nearest the centre.":
    "Vpiši sestavino in na kolesu poglej vse, s čimer se ujame, najmočnejše kombinacije so najbližje središču.",
  "Tap a second. Watch it narrow.": "Dodaj drugo. Glej, kako se izbor zoža.",
  "The wheel re-centres on what both ingredients share, so you build the dish outward.":
    "Kolo se osredotoči na to, kar imata obe sestavini skupnega, tako da jed gradiš navzven.",
  "Keep the ones you like.": "Obdrži tiste, ki so ti všeč.",
  "Save a combination with a note. It works offline, in the kitchen, one-handed.": "Shrani kombinacijo z opombo. Deluje brez povezave, v kuhinji, z eno roko.",
  // search home
  "Loading the pairing map…": "Nalagam zemljevid kombinacij …", "Loading…": "Nalagam …",
  Ingredient: "Sestavina", "Search ingredients": "Išči sestavine", Clear: "Počisti", Matches: "Zadetki", cuisine: "kuhinja", dish: "jed",
  "No ingredient called ‘{q}’. Try a simpler name.": "Sestavine ‘{q}’ ni. Poskusi s preprostejšim imenom.",
  "What’s in the pan?": "Kaj je v ponvi?",
  "Pick an ingredient to start from. The wheel will show only partners of this cuisine until you reset filters.":
    "Izberi sestavino za začetek. Kolo bo kazalo le kombinacije iz te kuhinje, dokler ne ponastaviš filtrov.",
  "Ingredients that work in it. Pick one to start from.": "Sestavine, ki se v njej obnesejo. Izberi eno za začetek.",
  Recent: "Nedavno", "In season now": "Zdaj v sezoni", "By family": "Po skupinah",
  "The wheel keeps these in this order, herbs at the top.": "Kolo jih razvršča v tem vrstnem redu, zelišča na vrhu.",
  "Try the main flow": "Preizkusi osnovni potek", "Fennel, then orange, then read why olives.": "Koromač, nato pomaranča, potem preberi, zakaj olive.",
  "Start with fennel": "Začni s koromačem",
  // map screen
  "Up to {n} ingredients": "Največ {n} sestavin", "Link copied": "Povezava kopirana", Open: "Odpri", Anchors: "Izhodiščne sestavine",
  "Back to search": "Nazaj na iskanje", "Remove {name}": "Odstrani {name}", "Add an ingredient": "Dodaj sestavino",
  "+{n} more in the list": "še {n} na seznamu", "{n} of some": "{n} z nekaterimi",
  "{n} partners": ["{n} kombinacija", "{n} kombinaciji", "{n} kombinacije", "{n} kombinacij"],
  "{n} partners of all": ["{n} kombinacija z vsemi", "{n} kombinaciji z vsemi", "{n} kombinacije z vsemi", "{n} kombinacij z vsemi"],
  "List view": "Seznam", "Map view": "Kolo", Filters: "Filtri", "Filtered to {name}": "Filtrirano: {name}",
  "Dishes can only be filters on the ingredient page": "Jedi so lahko le filter na strani sestavine",
  "{n} pair with it": ["{n} sestavina se ujema z njo", "{n} sestavini se ujemata z njo", "{n} sestavine se ujemajo z njo", "{n} sestavin se ujema z njo"],
  "{n} pair with all of them": ["{n} sestavina se ujema z vsemi", "{n} sestavini se ujemata z vsemi", "{n} sestavine se ujemajo z vsemi", "{n} sestavin se ujema z vsemi"],
  "{n} with some": "{n} z nekaterimi", "Save combination": "Shrani kombinacijo", "Share link": "Deli povezavo",
  "Nothing pairs with all of these.": "Nič se ne ujema z vsemi temi.", "These bridge them:": "Te jih povezujejo:",
  "Bridges reach {names} in two hops. They are not full matches.": "Mostovi dosežejo {names} v dveh korakih. Niso popolna ujemanja.",
  "No partners to show for {name}.": "Za {name} ni kombinacij za prikaz.", "Reset filters": "Ponastavi filtre",
  Classic: "Klasika", Recommended: "Priporočeno", Works: "Deluje", "Holy grail": "Sveti gral", "Pairs with some": "Ujema se z nekaterimi",
  "Partners as a list": "Kombinacije kot seznam", "Nothing to list.": "Ni česa prikazati.", "not with {names}": "ne z: {names}", common: "pogosta",
  Close: "Zapri", "Why it pairs": "Zakaj se ujema", "no direct pairing; reaches it through {name}.": "ni neposredne kombinacije; poveže ju {name}.",
  "no direct pairing.": "ni neposredne kombinacije.", "Works in": "Uporaba", "Add as anchor": "Dodaj kot izhodišče",
  "Save current anchors": "Shrani trenutne sestavine", "Save with current anchors": "Shrani s trenutnimi sestavinami", "Full page": "Celotna stran",
  Category: "Kategorija", "hold for “only”": "pridrži za “samo to”", Cuisine: "Kuhinja", "Hide common ingredients": "Skrij pogoste sestavine",
  "Suppresses the 30 biggest hubs so the unusual partners come forward.": "Skrije 30 najpogostejših sestavin, da pridejo do izraza manj običajne kombinacije.",
  Done: "Končano", Reset: "Ponastavi", "A note, like “Sunday salad”": "Opomba, npr. “nedeljska solata”", Note: "Opomba", Save: "Shrani",
  // wheel
  "Pairing wheel": "Kolo kombinacij", "save or share": "shrani ali deli", "pairs with some anchors": "ujema se z nekaterimi izhodišči",
  "Zoom in": "Povečaj", "Zoom out": "Pomanjšaj", "Back to the centre": "Nazaj na sredino",
  "{n} anchors": ["{n} sestavina", "{n} sestavini", "{n} sestavine", "{n} sestavin"],
  // pairing views
  Version: "Različica", Rows: "Vrste", Grid: "Mreža", Ranked: "Lestvica", Bubbles: "Mehurčki", Compare: "Primerjava", Wheel: "Kolo",
  "No partners to show with these filters.": "S temi filtri ni kombinacij.", "These bridge them in two steps:": "Te jih povežejo v dveh korakih:",
  "the pairings cooks reach for first": "kombinacije, po katerih kuharji sežejo najprej", "strong and reliable": "močne in zanesljive",
  "worth trying": "vredne poskusa", "takes the dish another way": "jed pelje v drugo smer", "Open {name}": "Odpri {name}",
  "Add {name} as anchor": "Dodaj {name} kot izhodišče", All: "Vse", "Pairings as bubbles": "Kombinacije kot mehurčki", "bigger = stronger": "večje = močnejše",
  "Add a second ingredient with the + at the top to see where they agree and where they differ.":
    "Dodaj drugo sestavino s + na vrhu in poglej, kje se ujemata in kje razhajata.",
  Partner: "Sestavina", "strength {n} of 4": "moč {n} od 4", "{n} of {max}": "{n} od {max}", small: "majhna", medium: "srednja", large: "velika",
  // profile
  Back: "Nazaj", "Add to the map": "Dodaj na kolo", "See what pairs": "Poglej kombinacije", "All year": "Vse leto", "all year": "vse leto",
  Also: "Tudi", Cook: "Priprava", "No established trios recorded for {name} yet.": "Za {name} še ni zabeleženih uveljavljenih kombinacij.",
  Yours: "Tvoja", "Illustration of {name}": "Ilustracija: {name}", "Photo by": "Fotografija:", on: "na", "Artwork by": "Ilustracija:",
  "Compare with": "Primerjaj z", Taste: "Okus", Heaviness: "Teža", Volume: "Jakost", Facts: "Podatki", "Pairs with": "Se ujema z",
  "Open the map": "Odpri kolo", "Proven combos": "Preizkušene kombinacije", "Tap a cuisine to see partners from it.": "Tapni kuhinjo za njene kombinacije.",
  "Thin bar: {name}, {value}": "Tanka črta: {name}, {value}", "{a} to {b}": "{a} do {b}",
  none: "nič", "a little": "malo", clearly: "izrazito", strongly: "močno",
  "very light": "zelo lahka", light: "lahka", heavy: "težka", "very heavy": "zelo težka",
  "very quiet": "zelo blaga", quiet: "blaga", moderate: "zmerna", loud: "močna", "very loud": "zelo močna",
  Sweet: "Sladko", Sour: "Kislo", Salty: "Slano", Bitter: "Grenko", Hot: "Pekoče", Astringent: "Trpko",
  sweet: "sladek", sour: "kisel", salty: "slan", bitter: "grenak", hot: "pekoč", astringent: "trpek",
  Spring: "Pomlad", Summer: "Poletje", Autumn: "Jesen", Winter: "Zima",
  "A classic pairing with {b}.": "Klasična kombinacija z: {b}.", "Shared taste: both {taste}.": "Skupen okus: {taste}.",
  "Contrast: sweetness against the edge of {b}.": "Kontrast: sladkoba proti ostrini sestavine {b}.", "Both at home in the same cuisine.": "Obe sta doma v isti kuhinji.",
  "Works with {b}.": "Ujema se z: {b}.",
  // saved
  "Nothing saved yet": "Še nič shranjenega", "Tap the centre of the wheel, or an ingredient card, and save the combination with a note.":
    "Tapni sredino kolesa ali kartico sestavine in shrani kombinacijo z opombo.",
  "{n} combinations": ["{n} kombinacija", "{n} kombinaciji", "{n} kombinacije", "{n} kombinacij"], "swipe to delete": "povleci za brisanje",
  Deleted: "Izbrisano", Graph: "Podatki", installed: "nameščeno", "in the browser": "v brskalniku", "saved on this device": "shranjeno na tej napravi",
  and: "in", "No note": "Brez opombe", "Up to {n} saved combinations in the free tier.": "V brezplačni različici največ {n} shranjenih kombinacij.",
  "Could not save on this device.": "Na tej napravi ni bilo mogoče shraniti.",
  // season
  "in {month}": "v mesecu {month}", Hemisphere: "Polobla", "Northern hemisphere": "Severna polobla", Southern: "Južna",
  // categories and families
  Herb: "Zelišče", Spice: "Začimba", Vegetable: "Zelenjava", Fruit: "Sadje", Protein: "Meso in jajca", Seafood: "Ribe in morski sadeži", Dairy: "Mlečni izdelki",
  "Grain & pulse": "Žita in stročnice", "Nut & seed": "Oreščki in semena", Oil: "Olje", Acid: "Kislina", Sweetener: "Sladilo", Alcohol: "Alkohol", Condiment: "Omake in dodatki", Other: "Drugo",
  Herbs: "Zelišča", Spices: "Začimbe", Vegetables: "Zelenjava", "Meat & eggs": "Meso in jajca", Grains: "Žita", Nuts: "Oreščki", Oils: "Olja", Acids: "Kisline",
  Drinks: "Pijače", Condiments: "Omake",
  "Herbs & spices": "Zelišča in začimbe", "Meat & fish": "Meso in ribe", "Grains & nuts": "Žita in oreščki", "Pantry & drinks": "Shramba in pijače",
};
