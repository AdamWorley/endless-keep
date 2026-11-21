// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
// Player-name cleaning and a basic profanity filter.
// keep in sync with leaderboard/src/names.js (the server is the authority; this copy double-checks names on screen)

const MAX_LEN = 16;

// Turns whatever was typed into a safe display name, or "" if nothing usable is left.
function cleanName(input) {
  if (typeof input !== "string") return "";
  let s = input.normalize("NFKC")
    // drop control, format (zero-width, bidi overrides), private-use, unassigned and surrogate code points
    .replace(/[\p{Cc}\p{Cf}\p{Co}\p{Cn}\p{Cs}]/gu, "")
    // at most two combining marks per letter, so "zalgo" text can't smear over the board
    .replace(/(\p{M}{2})\p{M}+/gu, "$1")
    // only letters, marks, numbers, spaces and a little punctuation
    .replace(/[^\p{L}\p{M}\p{N} '._!-]/gu, "")
    .replace(/\s+/g, " ").trim();
  s = Array.from(s).slice(0, MAX_LEN).join("").trim();
  return /[\p{L}\p{N}]/u.test(s) ? s : "";
}

// Common look-alike swaps people use to sneak words past filters.
const LEET = { "0": "o", "1": "i", "!": "i", "3": "e", "4": "a", "@": "a", "5": "s", "$": "s", "7": "t", "8": "b", "9": "g", "|": "i", "+": "t" };
const fold = s => s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[0-9!@$|+]/g, c => LEET[c] || c);

// Words blocked anywhere inside a name (rarely part of innocent words).
const ANYWHERE = ["fuck", "fuk", "fck", "shit", "cunt", "nigg", "nigga", "faggot", "fagot", "whore", "slut", "wank", "twat", "bitch", "biatch",
  "retard", "kike", "chink", "spic", "tranny", "dyke", "nazi", "hitler", "rapist", "pedo", "paedo", "porn", "penis", "vagina", "dildo",
  "cock", "pussy", "asshole", "arsehole", "bollock", "bastard", "jizz", "cum shot", "cumshot", "blowjob", "handjob", "motherf", "heil"];
// Words blocked only as a whole word (they hide inside innocent words like "class", "title" or "grape").
const WHOLE = ["ass", "arse", "tit", "tits", "cum", "fag", "rape", "raped", "sex", "nig", "coon", "homo", "piss", "prick", "spunk", "gay", "kkk"];
const SAFE = ["cocktail", "peacock", "hancock", "babcock", "cockatoo", "cockatiel", "cockney", "cockerel", "cockpit", "shuttlecock", "scunthorpe", "spicy", "spice"];

function isProfane(name) {
  const f = fold(name);
  const words = f.split(/[^a-z]+/).filter(Boolean);
  if (words.some(w => WHOLE.includes(w) || WHOLE.includes(w.replace(/(.)\1+/g, "$1")))) return true;
  let joined = f.replace(/[^a-z]/g, "");
  for (const ok of SAFE) joined = joined.split(ok).join("");
  const squeezed = joined.replace(/(.)\1+/g, "$1");
  if (WHOLE.includes(joined) || WHOLE.includes(squeezed)) return true;   // e.g. "a s s"
  // the squeezed form ("fuuuck" -> "fuck") is only compared with words that have no doubled letters themselves,
  // otherwise "nigg" would squeeze to "nig" and match "knight"
  return ANYWHERE.some(b => { const w = b.replace(/ /g, ""); return joined.includes(w) || (!/(.)\1/.test(w) && squeezed.includes(w)); });
}
