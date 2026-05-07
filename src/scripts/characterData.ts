export interface CharacterInfo {
  affiliation: string;
  description: string;
}

export const CHARACTER_DATA: Record<string, CharacterInfo> = {
  // Original trilogy
  'luke-skywalker': {
    affiliation: 'Jedi Order · Rebel Alliance',
    description:
      'Farmboy from Tatooine who became a Jedi Knight, destroyed the Death Star, and redeemed his father Darth Vader.',
  },
  'leia-organa': {
    affiliation: 'Rebel Alliance',
    description:
      'Princess of Alderaan and co-founder of the Rebellion — diplomat, soldier, and leader until the very end.',
  },
  'han-solo': {
    affiliation: 'Rebel Alliance',
    description:
      'Corellian smuggler and captain of the Millennium Falcon who became a general in the Rebel Alliance.',
  },
  chewbacca: {
    affiliation: 'Rebel Alliance',
    description:
      "Wookiee warrior and co-pilot of the Millennium Falcon, Han Solo's loyal companion for decades.",
  },
  'darth-vader': {
    affiliation: 'Galactic Empire · Sith',
    description:
      "Former Jedi Knight Anakin Skywalker, seduced to the dark side and forged into the Emperor's terrifying enforcer.",
  },
  'obi-wan-kenobi': {
    affiliation: 'Jedi Order',
    description:
      'Jedi Master who trained both Anakin Skywalker and Luke, guiding the Rebellion even from beyond death.',
  },
  yoda: {
    affiliation: 'Jedi Order',
    description:
      'Grand Master of the Jedi Order for centuries, training generations of Jedi before peacefully dying at age 900.',
  },
  'lando-calrissian': {
    affiliation: 'Rebel Alliance',
    description:
      'Charming Baron Administrator of Cloud City who eventually joined the Rebellion as a general.',
  },
  'wedge-antilles': {
    affiliation: 'Rebel Alliance',
    description:
      'Ace Rebel pilot and one of the only combatants to survive both the Battle of Yavin and the Battle of Endor.',
  },
  'boba-fett': {
    affiliation: 'Bounty Hunter',
    description:
      'Clone of Jango Fett who became the most feared bounty hunter in the galaxy, later Daimyo of Tatooine.',
  },
  'emperor-palpatine': {
    affiliation: 'Galactic Empire · Sith',
    description:
      'Darth Sidious — the Dark Lord who engineered the collapse of the Republic and ruled the galaxy as Emperor.',
  },
  'r2-d2': {
    affiliation: 'Rebel Alliance',
    description:
      'Plucky astromech droid who carried the Death Star plans, flew with Luke, and saved the day countless times.',
  },
  'c-3po': {
    affiliation: 'Rebel Alliance',
    description:
      'Protocol droid fluent in over six million forms of communication, built by a young Anakin Skywalker.',
  },
  'admiral-ackbar': {
    affiliation: 'Rebel Alliance',
    description:
      'Mon Calamari admiral who commanded the Rebel fleet at Endor. Known galaxy-wide for his tactical insight.',
  },
  'mon-mothma': {
    affiliation: 'Rebel Alliance',
    description: 'Galactic senator and founding leader of the Alliance to Restore the Republic.',
  },
  'grand-moff-tarkin': {
    affiliation: 'Galactic Empire',
    description:
      'Imperial governor who championed the Death Star as a tool of political terror and was destroyed alongside it.',
  },
  // Prequel trilogy
  'qui-gon-jinn': {
    affiliation: 'Jedi Order',
    description:
      'Unorthodox Jedi Master who discovered Anakin Skywalker on Tatooine and believed him to be the Chosen One.',
  },
  'padm-amidala': {
    affiliation: 'Galactic Republic',
    description:
      'Queen and later Senator of Naboo, secret wife of Anakin Skywalker, and mother of Luke and Leia.',
  },
  'mace-windu': {
    affiliation: 'Jedi Order',
    description:
      'Senior Jedi Master and High Council member, formidable warrior who wielded a distinctive purple lightsaber.',
  },
  'count-dooku': {
    affiliation: 'Separatist Alliance · Sith',
    description:
      'Former Jedi Master turned Sith apprentice who led the Confederacy of Independent Systems as Darth Tyranus.',
  },
  'general-grievous': {
    affiliation: 'Separatist Alliance',
    description:
      'Cyborg general who commanded the Droid Army and collected Jedi lightsabers as trophies.',
  },
  'jango-fett': {
    affiliation: 'Bounty Hunter',
    description:
      "Mandalorian mercenary whose genetic template became the basis for the Republic's entire Grand Army.",
  },
  'kit-fisto': {
    affiliation: 'Jedi Order',
    description:
      'Nautolan Jedi Master known for his combat skill in water and his permanent wide smile.',
  },
  'aayla-secura': {
    affiliation: 'Jedi Order',
    description:
      "Twi'lek Jedi Knight and Clone Wars general, killed during Order 66 on the planet Felucia.",
  },
  'plo-koon': {
    affiliation: 'Jedi Order',
    description:
      'Kel Dor Jedi Master and ace pilot on the High Council — the one who discovered Ahsoka Tano.',
  },
  'jar-jar-binks': {
    affiliation: 'Gungan · Galactic Republic',
    description:
      'Clumsy Gungan exile who inadvertently played a pivotal role in galactic politics — and possibly much more.',
  },
  'darth-maul': {
    affiliation: 'Sith · Crimson Dawn',
    description:
      'Zabrak Sith apprentice of Palpatine who survived bisection to become a feared crime lord and leader of Crimson Dawn.',
  },
  // Sequel trilogy
  'rey-skywalker': {
    affiliation: 'Jedi Order · Resistance',
    description:
      'Scavenger from Jakku who discovered her Force powers, defeated the Sith, and took the Skywalker name.',
  },
  'poe-dameron': {
    affiliation: 'Resistance',
    description:
      "The Resistance's best pilot, known for daring maneuvers, quick wit, and absolute loyalty to the cause.",
  },
  'kylo-ren': {
    affiliation: 'First Order · Knights of Ren',
    description:
      'Ben Solo — son of Han and Leia — seduced to the dark side, eventually redeemed at the cost of his life.',
  },
  finn: {
    affiliation: 'Resistance',
    description:
      'Former First Order stormtrooper FN-2187 who defected, joined the Resistance, and discovered he was Force-sensitive.',
  },
  'bb-8': {
    affiliation: 'Resistance',
    description:
      "Rolling astromech droid and Poe Dameron's co-pilot, renowned for courage and resourcefulness in the field.",
  },
  'maz-kanata': {
    affiliation: 'Independent',
    description:
      "Thousand-year-old pirate and Force-sensitive who kept Luke's first lightsaber and ran a castle on Takodana.",
  },
  'general-hux': {
    affiliation: 'First Order',
    description:
      'Fanatical First Order general who commanded Starkiller Base and rivaled Kylo Ren for influence.',
  },
  'captain-phasma': {
    affiliation: 'First Order',
    description:
      'Chrome-armored stormtrooper commander whose polished exterior hid ruthless self-preserving cowardice.',
  },
  // The Clone Wars
  'ahsoka-tano': {
    affiliation: 'Jedi Order (former) · Rebel Alliance',
    description:
      "Anakin's Togruta Padawan who left the Jedi Order, survived the Purge, and became a key figure in the early Rebellion.",
  },
  'captain-rex': {
    affiliation: 'Galactic Republic · Rebel Alliance',
    description:
      'Captain of the 501st Legion and one of the most decorated clone troopers, later an ally of the Rebellion.',
  },
  'commander-cody': {
    affiliation: 'Galactic Republic',
    description:
      'Commander of the 212th Attack Battalion under Obi-Wan Kenobi, who executed Order 66 without hesitation.',
  },
  'asajj-ventress': {
    affiliation: 'Sith (former) · Bounty Hunter',
    description:
      "Nightsister trained as Palpatine's assassin who was discarded by Dooku and reinvented herself as a bounty hunter.",
  },
  'hondo-ohnaka': {
    affiliation: 'Weequay Pirates',
    description:
      'Jovial pirate captain willing to deal with anyone — Jedi, Sith, or Empire — if the price is right.',
  },
  'savage-opress': {
    affiliation: 'Sith · Nightbrothers',
    description:
      "Darth Maul's Zabrak brother, enhanced by Nightsister magic, who served as his apprentice before dying at Sidious's hand.",
  },
  'cad-bane': {
    affiliation: 'Bounty Hunter',
    description:
      'Ruthless Duros mercenary and one of the most dangerous bounty hunters of the Clone Wars era.',
  },
  'aurra-sing': {
    affiliation: 'Bounty Hunter',
    description:
      'Pale-skinned assassin with cybernetic antennae who trained the young Boba Fett and took contracts across the galaxy.',
  },
  'pre-vizsla': {
    affiliation: 'Death Watch · Mandalore',
    description:
      'Mandalorian warrior and Death Watch leader who claimed the Darksaber but was slain by Darth Maul in single combat.',
  },
  'bo-katan-kryze': {
    affiliation: 'Mandalore',
    description:
      'Mandalorian warrior who reunited her people multiple times, wielded the Darksaber, and ruled as regent of Mandalore.',
  },
  'barriss-offee': {
    affiliation: 'Jedi Order',
    description:
      'Mirialan Jedi Padawan who secretly bombed the Jedi Temple out of growing disillusionment with the Order.',
  },
  // Rebels
  'kanan-jarrus': {
    affiliation: 'Jedi Order · Ghost Crew',
    description:
      "Jedi survivor of Order 66 who hid his identity as a laborer before becoming a Rebel and Ezra's master.",
  },
  'ezra-bridger': {
    affiliation: 'Jedi Order · Ghost Crew',
    description:
      "Street-smart Force-sensitive orphan from Lothal who became Kanan's Padawan and vanished into hyperspace to save his homeworld.",
  },
  'sabine-wren': {
    affiliation: 'Mandalore · Ghost Crew',
    description:
      'Mandalorian artist, explosives expert, and wielder of the Darksaber who helped liberate her home world.',
  },
  'hera-syndulla': {
    affiliation: 'Ghost Crew · Rebel Alliance',
    description:
      "Twi'lek pilot and leader of the Ghost crew, one of the Rebellion's most effective and celebrated commanders.",
  },
  'zeb-orrelios': {
    affiliation: 'Ghost Crew',
    description:
      "Lasat warrior and last survivor of his people's honor guard, serving as the Ghost crew's muscle.",
  },
  'grand-admiral-thrawn': {
    affiliation: 'Galactic Empire',
    description:
      "Chiss tactical genius and the Empire's most dangerous commander, who studied enemy art to predict their behavior.",
  },
  'agent-kallus': {
    affiliation: 'Galactic Empire · Rebel Alliance',
    description:
      'ISB agent who began as an antagonist and gradually became a Rebel spy known as Fulcrum.',
  },
  chopper: {
    affiliation: 'Ghost Crew',
    description:
      'Cantankerous C1-series astromech droid on the Ghost, known for shocking allies and enemies with equal enthusiasm.',
  },
  // The Mandalorian / Book of Boba Fett
  'din-djarin': {
    affiliation: 'Mandalorian · Bounty Hunter',
    description:
      'Lone Mandalorian whose strict creed was tested when he became the unlikely guardian of a Force-sensitive foundling.',
  },
  grogu: {
    affiliation: 'Jedi (youngling)',
    description:
      "Force-sensitive youngling of Yoda's species, survivor of Order 66, and Din Djarin's adopted son.",
  },
  'greef-karga': {
    affiliation: "Bounty Hunters' Guild",
    description:
      'Guild magistrate who hired Din Djarin and later became High Magistrate of Nevarro, an unlikely galactic statesman.',
  },
  kuiil: {
    affiliation: 'Independent',
    description:
      'Ugnaught vapor farmer who helped Din Djarin, reprogrammed IG-11, and sacrificed his life to protect Grogu.',
  },
  'fennec-shand': {
    affiliation: 'Bounty Hunter',
    description:
      'Elite assassin saved from death by Boba Fett, who became his most trusted and lethal partner.',
  },
  'ig-11': {
    affiliation: 'Bounty Hunter (reprogrammed)',
    description:
      'Assassin droid reprogrammed by Kuiil to protect Grogu; self-destructed to save the Mandalorian and the Child.',
  },
  'moff-gideon': {
    affiliation: 'Imperial Remnant',
    description:
      "Imperial warlord who sought to use Grogu's Force-rich blood to create Force-sensitive soldiers for a new Empire.",
  },
  // The Bad Batch
  hunter: {
    affiliation: 'Clone Force 99',
    description:
      'Leader of the Bad Batch with enhanced tracking senses, dedicated to protecting Omega and his squad.',
  },
  crosshair: {
    affiliation: 'Clone Force 99 · Empire',
    description:
      'Enhanced clone sniper whose inhibitor chip drove him to serve the Empire even after his squad defected.',
  },
  tech: {
    affiliation: 'Clone Force 99',
    description:
      'Analytical genius of the Bad Batch with an enhanced brain, encyclopedic knowledge, and dry wit.',
  },
  wrecker: {
    affiliation: 'Clone Force 99',
    description:
      'Physically enhanced clone of enormous strength who loves explosions and is fiercely protective of Omega.',
  },
  omega: {
    affiliation: 'Clone Force 99',
    description:
      'Unmodified female clone of Jango Fett with a pure genetic template, raised on Kamino and adopted by the Bad Batch.',
  },
  // Andor
  'cassian-andor': {
    affiliation: 'Rebel Alliance',
    description:
      'Spy and soldier who sacrificed his freedom and ultimately his life to light the spark of the Rebel Alliance.',
  },
  'luthen-rael': {
    affiliation: 'Rebel Alliance',
    description:
      'Antiques dealer by cover, spymaster by vocation — the cold architect who funded and shaped the early Rebellion.',
  },
  'syril-karn': {
    affiliation: 'Galactic Empire',
    description:
      'Overzealous Imperial bureaucrat whose obsessive pursuit of Cassian Andor drove him deeper into the ISB machine.',
  },
  'vel-sartha': {
    affiliation: 'Rebel Alliance',
    description:
      "Rebel operative and Luthen's trusted courier who led the Aldhani heist and wrestled with the cost of the cause.",
  },
  b2emo: {
    affiliation: 'Independent',
    description:
      'Slow-moving ground unit droid fiercely loyal to the Andor family on Ferrix, with unexpected emotional depth.',
  },
  // Obi-Wan Kenobi (series)
  reva: {
    affiliation: 'Galactic Empire · Inquisitorius',
    description:
      'Third Sister Inquisitor who hunted Jedi across the galaxy while secretly seeking revenge against Darth Vader.',
  },
  // Jedi: Fallen Order / Survivor
  'cal-kestis': {
    affiliation: 'Jedi Order (survivor)',
    description:
      'Jedi Padawan who survived Order 66 while hiding as a scrapper, and later worked to restore the Jedi legacy.',
  },
  'cere-junda': {
    affiliation: 'Jedi Order (former)',
    description:
      'Jedi Knight who survived the Purge, briefly fell to the dark side, and dedicated herself to guiding Cal Kestis.',
  },
  merrin: {
    affiliation: 'Nightsisters · Jedi (ally)',
    description:
      "Last surviving Nightsister of Dathomir who joined Cal's crew and brought Magick to the fight against the Empire.",
  },
  'bd-1': {
    affiliation: 'Jedi Order (droid)',
    description:
      'Compact scomp-link droid and arguably the most loyal companion a wandering Jedi Padawan could ask for.',
  },
  // KOTOR
  'darth-revan': {
    affiliation: 'Jedi Order · Sith (redeemed)',
    description:
      'Legendary Jedi-turned-Sith who conquered half the galaxy before being redeemed and defeating his own former apprentice.',
  },
  'bastila-shan': {
    affiliation: 'Jedi Order',
    description:
      "Jedi Knight with the rare gift of battle meditation who played a pivotal role in Revan's redemption.",
  },
  'darth-malak': {
    affiliation: 'Sith',
    description:
      "Revan's former apprentice who betrayed him, became a feared Dark Lord, and enslaved Bastila through the dark side.",
  },
  'carth-onasi': {
    affiliation: 'Galactic Republic',
    description:
      'Decorated Republic soldier and pilot who helped the amnesiac Revan defeat Malak while wrestling with deep personal loss.',
  },
  'jolee-bindo': {
    affiliation: 'Jedi Order (rogue)',
    description:
      'Eccentric former Jedi who lived as a hermit in the Shadowlands of Kashyyyk until Revan came along.',
  },
  'hk-47': {
    affiliation: 'Independent (droid)',
    description:
      "Sadistic assassin droid built by Revan, with a fondness for calling organics 'meatbags' and an enthusiasm for violence.",
  },
  'mission-vao': {
    affiliation: 'Independent',
    description:
      "Resourceful young Twi'lek from the undercity of Taris who joined Revan's crew alongside her Wookiee partner Zaalbar.",
  },
  'canderous-ordo': {
    affiliation: 'Mandalorian · Republic',
    description:
      'Mandalorian veteran who fought in the Mandalorian Wars and later united the clans as Mandalore the Preserver.',
  },
  'meetra-surik': {
    affiliation: 'Jedi Order',
    description:
      "The Jedi Exile — a general who severed her Force bond at Malachor V, was exiled, and later healed the Force's wounds.",
  },
  'darth-nihilus': {
    affiliation: 'Sith',
    description:
      'Dark Lord whose insatiable hunger for the Force turned him into a wound in it, capable of devouring entire planets.',
  },
  'darth-sion': {
    affiliation: 'Sith',
    description:
      "Lord of Pain who held his shattered body together through sheer hatred, made nearly unkillable by the dark side's power.",
  },
  'atton-rand': {
    affiliation: 'Republic',
    description:
      "Roguish pilot and former Jedi-hunter with a dark past who became one of Meetra Surik's most trusted companions.",
  },
  mira: {
    affiliation: 'Bounty Hunter',
    description:
      'Skilled bounty hunter who preferred stun settings, survived the jungles of Nar Shaddaa, and had latent Force sensitivity.',
  },
  // Legends / EU
  'mara-jade': {
    affiliation: "Emperor's Hand · Jedi Order",
    description:
      "Former Hand of the Emperor who became a Jedi Master and Luke Skywalker's wife in the Expanded Universe.",
  },
  'kyle-katarn': {
    affiliation: 'Rebel Alliance · Jedi Order',
    description:
      'Former Imperial officer turned mercenary who uncovered the Dark Trooper project and became a powerful Jedi.',
  },
  'galen-marek': {
    affiliation: 'Sith (apprentice) · Rebel Alliance',
    description:
      "Darth Vader's secret apprentice whose sacrifice inspired the founding of the Rebel Alliance.",
  },
  'dash-rendar': {
    affiliation: 'Rebel Alliance',
    description:
      'Corellian smuggler and mercenary who aided the Rebellion during the events of Shadows of the Empire.',
  },
  'jaina-solo': {
    affiliation: 'Jedi Order · Galactic Alliance',
    description:
      "Han and Leia's daughter, twin sister of Jacen, who became a Jedi Knight and the 'Sword of the Jedi'.",
  },
  'jacen-solo': {
    affiliation: 'Jedi Order · Sith',
    description:
      "Han and Leia's son who fell to the dark side as Darth Caedus and was ultimately slain by his twin sister Jaina.",
  },
  'nomi-sunrider': {
    affiliation: 'Jedi Order',
    description:
      'Jedi Master and Grand Master of the Order during the Great Sith War, renowned for her mastery of battle meditation.',
  },
  'ulic-qel-droma': {
    affiliation: 'Jedi Order · Sith (redeemed)',
    description:
      'Jedi Knight who fell to the dark side during the Great Sith War before being redeemed and stripped of the Force.',
  },
  starkiller: {
    affiliation: 'Sith (clone)',
    description:
      "Clone of Galen Marek created by Darth Vader — a relentless Force-user torn between the dark side and a ghost's memories.",
  },
  'darth-bane': {
    affiliation: 'Sith',
    description:
      "Sith Lord who survived the Brotherhood's self-destruction and established the Rule of Two: one master, one apprentice.",
  },
};
