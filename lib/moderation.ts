export interface ModerationResult {
  blocked: boolean
  category?: "crisis" | "sexual" | "violence" | "hate" | "profanity" | "harmful"
}

// ── Priority 0: Crisis / self-harm detection ────────────────────────
// Runs BEFORE all other tiers so "kill myself" → crisis, not violence.

function normalizeLeetspeak(text: string): string {
  return text
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
}

const crisisPhrases: string[] = [
  // EN — self-directed harm
  "kill myself", "kill me", "kill yourself",
  "end my life", "end it all", "end this",
  "take my life", "take my own life",
  "want to die", "wanna die", "want to be dead",
  "better off dead", "rather be dead",
  "wish i was dead", "wish i were dead",
  "hurt myself", "harm myself", "cut myself",
  "hang myself", "shoot myself", "drown myself", "poison myself",
  "slit my wrist", "slit my wrists",
  "jump off a bridge", "jump off a building",
  "not worth living", "no reason to live", "no point in living",
  "don't want to be alive", "dont want to be alive",
  "don't want to live", "dont want to live",
  "self harm", "self-harm",
  // DE — self-directed harm
  "mich umbringen", "mich selbst umbringen", "mich töten",
  "mein leben beenden", "meinem leben ein ende",
  "mich selbst verletzen", "mich ritzen",
  "mich erhängen", "mich erschießen",
  "will sterben", "will nicht mehr leben",
  "nicht mehr leben", "keinen sinn mehr",
  "lieber tot", "bring dich um",
]

const crisisRoots: string[] = [
  "suicid",        // suicide, suicidal
  "selbstmord",    // DE: suicide
  "selbstverletz", // DE: self-harm
]

function detectCrisis(normalized: string): boolean {
  const leetNormalized = normalizeLeetspeak(normalized)

  // Check phrases against both raw and leetspeak-normalized input
  for (const phrase of crisisPhrases) {
    if (normalized.includes(phrase) || leetNormalized.includes(phrase)) {
      return true
    }
  }

  // Check crisis roots with word boundary
  for (const root of crisisRoots) {
    const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}`, 'i')
    if (regex.test(normalized) || regex.test(leetNormalized)) {
      return true
    }
  }

  return false
}

// ── Tier 1: Root matching via \broot regex ──────────────────────────
// If ANY form of the root appears, it's blocked.
// "kill" → kill, killed, killing, killer, kills
// Word boundary at start prevents matching INSIDE other words:
//   "kill" won't match "skill" or "overkill"
const blockedRoots: Record<string, string[]> = {
  sexual: [
    // EN
    "rape", "rapist", "molest", "pedophil", "paedophil",
    "incest", "grope", "underage", "porn",
    // DE
    "vergewaltig", "pädophil", "inzest", "pornograf",
  ],
  violence: [
    // EN
    "kill", "murder", "assassin", "massacr", "terroris",
    "genocid", "tortur", "kidnap", "strangl", "slaughter",
    "fight", "punch", "attack", "beat", "hit",
    // DE
    "töten", "ermord", "erstech", "erschieß",
    "massaker", "folter", "entführ", "erwürg",
    "kämpfen", "schlagen", "angreif", "prügel",
  ],
  hate: [
    // EN — slurs (all forms blocked)
    "nigger", "nigga", "spic", "wetback", "chink", "gook", "kike",
    "zipperhead", "raghead", "towelhead", "beaner", "coon", "darkie",
    "faggot", "tranny", "retard", "subhuman",
    // EN — protected groups (block any question targeting a group)
    "jewish", "muslim", "islam", "christian", "hindu", "buddhist",
    "sikh", "catholic", "protestant", "evangelical",
    "arab", "mexican", "hispanic", "latino", "latina",
    "homosexual", "lesbian", "bisexual", "lgbtq", "queer",
    "immigrant", "refugee", "foreigner",
    // DE — slurs
    "kanake", "kameltreiber", "kümmeltürke", "schlitzauge",
    "neger", "zigeuner", "polacke", "schwuchtel", "untermenschen",
    // DE — protected groups
    "jüdisch", "muslimisch", "islamisch", "christlich", "hinduistisch",
    "buddhistisch", "katholisch", "evangelisch",
    "arabisch", "mexikanisch", "hispanisch",
    "homosexuell", "lesbisch", "bisexuell",
    "einwanderer", "flüchtling", "ausländer",
  ],
  profanity: [
    // EN
    "fuck", "motherfuck", "cunt", "shit", "bitch",
    "whore", "slut", "asshole", "douchebag", "twat", "scumbag",
    // DE
    "fick", "scheiß", "hurensohn", "missgeburt",
    "arschloch", "wichser", "schlampe", "hure", "drecksau", "spast",
  ],
  harmful: [
    // EN — bullying & harassment
    "bully", "harass", "stalk", "blackmail", "extort",
    "intimidat", "humiliat",
    // Theft & crime
    "steal", "shoplift", "smuggl", "counterfeit",
    // Drugs
    "overdos", "cocain", "heroin",
    // Abuse & manipulation
    "abuse", "scam", "gaslight", "sabotag", "revenge", "manipulat",
    // DE
    "mobben", "mobbing", "stalken", "erpress",
    "einschüchter", "demütig",
    "stehlen", "klauen", "berauben",
    "kokain", "misshandel", "missbrauch",
    "tierquälerei", "sabotier", "manipulier",
  ],
}

// ── Tier 2: Exact word matching via \bword\b regex ──────────────────
// For words where root matching would cause false positives.
// "stab" exact avoids matching "stable"; "rob" exact avoids "robot".
const blockedExact: Record<string, string[]> = {
  violence: [
    "stab", "stabbed", "stabbing", "stabber",
  ],
  harmful: [
    "rob", "robbed", "robbing", "robbery", "robber",
    "meth", "dox", "swat",
  ],
  profanity: [
    "dickhead", "shithead",
  ],
  hate: [
    // Short group words — exact match to avoid false positives
    // "jew" exact avoids matching "jewelry"; "gay" exact avoids "gayer" confusion
    "jew", "jews", "gay", "gays", "trans",
    // DE
    "jude", "juden", "schwul", "schwule",
  ],
}

// ── Tier 3: Substring matching via .includes() ──────────────────────
// Multi-word phrases. If the substring appears anywhere, block.
const blockedPhrases: Record<string, string[]> = {
  sexual: [
    // EN
    "sex with", "sleep with child", "sleep with kid", "sleep with minor",
    "naked child", "naked kid", "nude child", "nude kid",
    "touch child", "touch kid",
    "child exploit", "sex slave", "sex traffic",
    // DE
    "sex mit kind", "sex mit mädchen", "sex mit junge",
    "sex mit teenager", "sex mit minderjährig",
    "nackte kinder", "kinderausbeutung",
    "sexueller missbrauch", "kindesmissbrauch",
    "sexuelle belästigung",
  ],
  violence: [
    // EN
    "shoot someone", "shoot him", "shoot her", "shoot them",
    "shoot people", "shoot up", "mass shooting", "school shooting",
    "death to", "blow up",
    "bomb threat", "make a bomb", "build a bomb", "plant a bomb",
    "death threat", "suicide bomb", "car bomb",
    // DE
    "bombendrohung", "bombe bauen", "anschlag planen",
    "massenerschießung", "massenmord", "morddrohung",
    "selbstmordanschlag",
  ],
  hate: [
    // EN
    "heil hitler", "white supremacy", "white power",
    "ethnic cleansing", "holocaust denial", "racial superiority",
    "racial purity", "race war", "go back to your country",
    "jewish conspiracy", "zionist conspiracy",
    "jews control",
    // DE
    "weiße vorherrschaft", "ausländer raus",
    "ethnische säuberung", "holocaust leugnung", "rassenkrieg",
    "jüdische verschwörung",
  ],
  harmful: [
    // Drugs
    "sell drugs", "deal drugs", "cook meth", "make drugs",
    "drug someone", "spike someone", "roofie",
    // Weapons
    "buy a gun", "get a weapon", "make a weapon",
    // Doxxing / swatting
    "doxxing", "swatting", "dox someone",
    // Animal cruelty
    "animal cruelty",
    // DE — Drugs
    "drogen verkaufen", "drogen dealen", "drogen herstellen",
    // Animal cruelty
    "tiere quälen",
  ],
  profanity: [
    // EN
    "piece of shit", "eat shit",
    "go die", "hope you die", "rot in hell", "burn in hell",
    "son of a bitch", "suck my", "dick head",
    // DE
    "fick dich", "verpiss dich",
    "halt die fresse", "halt dein maul",
    "fahr zur hölle", "brenn in der hölle",
  ],
}

export function moderateContent(text: string): ModerationResult {
  const normalized = text.toLowerCase().trim()
  const leetNormalized = normalizeLeetspeak(normalized)

  // Priority 0: Crisis/self-harm detection — runs before everything else
  if (detectCrisis(normalized)) {
    return { blocked: true, category: "crisis" }
  }

  // Tier 1: Root matching — \broot (catches root + ALL word forms)
  // Checks both raw and leetspeak-normalized input (e.g. "k1ll" → "kill")
  for (const [category, roots] of Object.entries(blockedRoots)) {
    for (const root of roots) {
      const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}`, 'i')
      if (regex.test(normalized) || regex.test(leetNormalized)) {
        return { blocked: true, category: category as ModerationResult["category"] }
      }
    }
  }

  // Tier 2: Exact word matching — \bword\b (avoids false positives like "stable", "robot")
  for (const [category, words] of Object.entries(blockedExact)) {
    for (const word of words) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}\\b`, 'i')
      if (regex.test(normalized) || regex.test(leetNormalized)) {
        return { blocked: true, category: category as ModerationResult["category"] }
      }
    }
  }

  // Tier 3: Substring matching — .includes() (multi-word phrases)
  // Checks both raw and leetspeak-normalized input
  for (const [category, phrases] of Object.entries(blockedPhrases)) {
    for (const phrase of phrases) {
      const lowerPhrase = phrase.toLowerCase()
      if (normalized.includes(lowerPhrase) || leetNormalized.includes(lowerPhrase)) {
        return { blocked: true, category: category as ModerationResult["category"] }
      }
    }
  }

  return { blocked: false }
}
