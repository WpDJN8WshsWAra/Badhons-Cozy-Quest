'use strict';
/* ============ Config ============ */
const VERSION = '2.0.3';
const APP_NAME = "Badhon's Cozy Quest";
const APP_SUB = 'বাঁধনের কোজি ইংলিশ যাত্রা';
const SB_URL = '';
const SB_KEY = '';   // no external tracking
// বাঁধন ভাইয়াের ছবি এখানে বসবে। দুই ভাবে দেওয়া যায়:
// 1) আলাদা আলাদা ছবি: images: { ask:'লিংক', happy:'লিংক', sad:'লিংক', cheer:'লিংক', think:'লিংক' }
// 2) এক লাইনে 5টা এক্সপ্রেশনের একটা ছবি (sheet), order অনুযায়ী বাঁ থেকে ডানে
const MASCOT = {
  images: {
    "ask": "assets/img/ma_ask.webp?v=badhon5",
    "happy": "assets/img/ma_happy.webp?v=badhon5",
    "sad": "assets/img/ma_sad.webp?v=badhon5",
    "cheer": "assets/img/ma_cheer.webp?v=badhon5",
    "think": "assets/img/ma_think.webp?v=badhon5"
  },
  sheet: '',
  order: ['ask', 'happy', 'sad', 'cheer', 'think']
};
const EXPR_EMOJI = { ask: '🙂', happy: '😊', sad: '🥺', cheer: '🥳', think: '🤔' };

const TUT_IMG = {
  1: 'assets/img/tut1.jpg',
  2: 'assets/img/tut2.jpg'
};

/* ============ Helpers ============ */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const bn = n => String(n);
const r2 = v => +v.toFixed(2), f3 = v => +v.toFixed(3);

/* ============ v1.3.8: ছবির আইকন (ইমোজির বদলে) ============ */
const UIMAP = { '↩️': 'undo', '📷': 'camera', '🎵': 'music_on', '🔇': 'music_off', '❓': 'help', '📝': 'notes', '🏡': 'myroom', '🛒': 'shop', '🛋️': 'drawing', '🖼️': 'wall', '🧸': 'small', '🏠': 'rooms', '🛏️': 'bedroom', '🍳': 'kitchen', '🔒': 'lock', '🔑': 'key', '➖': 'shrink', '➕': 'enlarge', '↔️': 'flip', '🧺': 'totray', '✖️': 'close', '🗑️': 'trash', '✅': 'done', '🎉': 'claim', '✨': 'sparkle', '👆': 'hand', '🍵': 'teacup', '🏅': 'medal', '🌱': 'beginner', '🌿': 'medium', '🏆': 'pro', '❤️': 'heart', '🤍': 'heart_empty' };
const HUDMAP = { '🎯': 'hud_target', '🎁': 'hud_gift0', '🪙': 'hud_coin', '🥢': 'tw_open', '🔥': 'hud_flame', '☀️': 'hud_sun', '🌙': 'hud_moon' };
const EMO = {}, EMO_HUD = {};
Object.entries(UIMAP).forEach(([k, v]) => EMO[k.replace(/\uFE0F/g, '')] = 'ui_' + v + '.webp');
Object.entries(HUDMAP).forEach(([k, v]) => { const kk = k.replace(/\uFE0F/g, ''); EMO[kk] = v + '.webp'; EMO_HUD[kk] = 1; });
const EMO_SRC = '(' + Object.keys(EMO).sort((a, b) => b.length - a.length).join('|') + ')\uFE0F?';
const EMO_RE = new RegExp(EMO_SRC, 'g'), EMO_T = new RegExp(EMO_SRC);
const ico = (n, c = '') => `<img class="uic ${c}" src="assets/img/ui_${n}.webp" alt="" draggable="false">`;
const ROOM_IC = { room_pink: 'bedroom', room_green: 'drawing', room_cream: 'kitchen' };
const LVIC = { beg: 'beginner', med: 'medium', high: 'higher', pro: 'pro' };
const lvI = k => ico(LVIC[k] || 'beginner');
function iconify(root) {
  if (!root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => { const p = n.parentNode; if (!p || /^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE)$/.test(p.nodeName) || (p.closest && p.closest('[data-noic]'))) return NodeFilter.FILTER_REJECT; return EMO_T.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; } });
  const list = []; while (w.nextNode()) list.push(w.currentNode);
  list.forEach(n => {
    const t = n.nodeValue, frag = document.createDocumentFragment(); let last = 0, m; EMO_RE.lastIndex = 0;
    while ((m = EMO_RE.exec(t))) {
      if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      const im = document.createElement('img'); im.className = 'uic' + (EMO_HUD[m[1]] ? ' hud' : ''); im.src = 'assets/img/' + EMO[m[1]]; im.alt = ''; im.draggable = false; frag.appendChild(im); last = m.index + m[0].length;
    }
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    n.parentNode.replaceChild(frag, n);
  });
}

/* ============ Storage ============ */
const NOOK = {"items": [{"id": "bed_green", "n": "সবুজ বিছানা", "p": 60, "k": "f", "w": 46, "f": 0, "g": "আসবাব", "r": 0.932, "c": "f", "sf": [0.55, 0.58, 0.22, [-0.5, 0.5]]}, {"id": "wardrobe_yellow", "n": "হলুদ আলমারি", "p": 50, "k": "f", "w": 30, "f": 0, "g": "আসবাব", "r": 1.407, "c": "f"}, {"id": "sofa_pink", "n": "গোলাপি সোফা", "p": 55, "k": "f", "w": 40, "f": 0, "g": "আসবাব", "r": 0.847, "c": "f", "sf": [0.5, 0.6, 0.28, [-0.55, 0.55]]}, {"id": "ladder_bookshelf", "n": "সিঁড়ি তাক", "p": 45, "k": "f", "w": 26, "f": 0, "g": "আসবাব", "r": 1.508, "c": "f"}, {"id": "kantha_rug", "n": "নকশি কাঁথা", "p": 35, "k": "f", "w": 44, "f": 1, "g": "আসবাব", "r": 0.589, "c": "f"}, {"id": "coffee_table_book", "n": "পড়ার টেবিল", "p": 30, "k": "f", "w": 30, "f": 0, "g": "আসবাব", "r": 0.726, "c": "f", "sf": [0.5, 0.4, 0.28, [-0.7, 0.7]]}, {"id": "chest_ottoman", "n": "কাঠের বাক্স", "p": 25, "k": "f", "w": 24, "f": 0, "g": "আসবাব", "r": 0.87, "c": "f", "sf": [0.5, 0.36, 0.28, [-0.6, 0.6]]}, {"id": "desk_lamp", "n": "ল্যাম্প-ডেস্ক", "p": 45, "k": "f", "w": 34, "f": 0, "g": "আসবাব", "r": 1.118, "c": "f", "sf": [0.6, 0.5, 0.24, [0.1]], "lt": 1}, {"id": "storage_bench", "n": "বেঞ্চ", "p": 30, "k": "f", "w": 34, "f": 0, "g": "আসবাব", "r": 0.862, "c": "f", "sf": [0.45, 0.3, 0.26, [-0.5, 0.5]]}, {"id": "desk_laptop", "n": "ল্যাপটপ ডেস্ক", "p": 50, "k": "f", "w": 38, "f": 0, "g": "আসবাব", "r": 0.937, "c": "f"}, {"id": "cabinet_bookshelf", "n": "বইয়ের আলমারি", "p": 45, "k": "f", "w": 27, "f": 0, "g": "আসবাব", "r": 1.377, "c": "f"}, {"id": "jute_floor_bed", "n": "পাটির বিছানা", "p": 40, "k": "f", "w": 44, "f": 0, "g": "আসবাব", "r": 0.595, "c": "f"}, {"id": "lantern_low_table", "n": "লণ্ঠন-টেবিল", "p": 30, "k": "f", "w": 32, "f": 0, "g": "আসবাব", "r": 0.816, "c": "f", "lt": 1}, {"id": "vanity_mirror", "n": "ড্রেসিং টেবিল", "p": 45, "k": "f", "w": 30, "f": 0, "g": "আসবাব", "r": 1.18, "c": "f", "sf": [0.42, 0.62, 0.24, [-0.3, 0.5]]}, {"id": "cane_chair", "n": "বেতের চেয়ার", "p": 30, "k": "f", "w": 24, "f": 0, "g": "আসবাব", "r": 1.152, "c": "f"}, {"id": "wall_clock", "n": "দেয়ালঘড়ি", "p": 20, "k": "w", "w": 13, "f": 0, "g": "দেয়াল ও মেঝে", "r": 1.0, "c": "w"}, {"id": "window_curtains", "n": "জানালা-পর্দা", "p": 35, "k": "w", "w": 26, "f": 0, "g": "দেয়াল ও মেঝে", "r": 0.874, "c": "w"}, {"id": "fairy_lights", "n": "ফেয়ারি লাইট", "p": 25, "k": "w", "w": 46, "f": 0, "g": "দেয়াল ও মেঝে", "r": 0.432, "c": "w", "lt": 1, "sn": "top"}, {"id": "wall_shelf", "n": "দেয়ালের তাক", "p": 25, "k": "w", "w": 26, "f": 0, "g": "দেয়াল ও মেঝে", "r": 0.668, "c": "w"}, {"id": "poster_frames", "n": "তিন ছবির ফ্রেম", "p": 25, "k": "w", "w": 26, "f": 0, "g": "দেয়াল ও মেঝে", "r": 0.4, "c": "w"}, {"id": "round_rug", "n": "গোল গালিচা", "p": 30, "k": "f", "w": 40, "f": 1, "g": "দেয়াল ও মেঝে", "r": 0.711, "c": "f"}, {"id": "striped_rug", "n": "ডোরাকাটা গালিচা", "p": 30, "k": "f", "w": 40, "f": 1, "g": "দেয়াল ও মেঝে", "r": 0.474, "c": "f"}, {"id": "jute_mat", "n": "পাটের চাটাই", "p": 20, "k": "f", "w": 32, "f": 1, "g": "দেয়াল ও মেঝে", "r": 0.995, "c": "f"}, {"id": "hanging_plant", "n": "ঝুলন্ত গাছ", "p": 25, "k": "w", "w": 14, "f": 0, "g": "দেয়াল ও মেঝে", "r": 1.696, "c": "w", "h": 1}, {"id": "paper_lantern", "n": "কাগজের লণ্ঠন", "p": 20, "k": "w", "w": 11, "f": 0, "g": "দেয়াল ও মেঝে", "r": 1.776, "c": "w", "lt": 1, "h": 1}, {"id": "round_mirror", "n": "গোল আয়না", "p": 25, "k": "w", "w": 17, "f": 0, "g": "দেয়াল ও মেঝে", "r": 1.005, "c": "w"}, {"id": "teacup", "n": "চায়ের কাপ", "p": 10, "k": "f", "w": 7, "f": 0, "g": "ছোট জিনিস", "r": 0.779, "c": "s", "op": 1}, {"id": "teapot", "n": "চায়ের পট", "p": 15, "k": "f", "w": 8, "f": 0, "g": "ছোট জিনিস", "r": 1.08, "c": "s", "op": 1}, {"id": "table_lamp", "n": "টেবিল ল্যাম্প", "p": 20, "k": "f", "w": 7.5, "f": 0, "g": "ছোট জিনিস", "r": 1.357, "c": "s", "op": 1, "lt": 1}, {"id": "fern_plant", "n": "ফার্ন গাছ", "p": 20, "k": "f", "w": 9.5, "f": 0, "g": "ছোট জিনিস", "r": 1.092, "c": "s"}, {"id": "books_stack", "n": "বইয়ের গাদা", "p": 15, "k": "f", "w": 8.5, "f": 0, "g": "ছোট জিনিস", "r": 0.874, "c": "s", "op": 1}, {"id": "alarm_clock", "n": "অ্যালার্ম ঘড়ি", "p": 12, "k": "f", "w": 6.5, "f": 0, "g": "ছোট জিনিস", "r": 1.255, "c": "s", "op": 1}, {"id": "photo_frame", "n": "ছবির ফ্রেম", "p": 12, "k": "w", "w": 12, "f": 0, "g": "ছোট জিনিস", "r": 1.141, "c": "w"}, {"id": "star_jar", "n": "তারার বোতল", "p": 15, "k": "f", "w": 6.5, "f": 0, "g": "ছোট জিনিস", "r": 1.424, "c": "s", "op": 1}, {"id": "radio", "n": "পুরোনো রেডিও", "p": 25, "k": "f", "w": 10, "f": 0, "g": "ছোট জিনিস", "r": 0.942, "c": "s", "op": 1}, {"id": "vase_plant", "n": "ফুলদানি", "p": 18, "k": "f", "w": 6.5, "f": 0, "g": "ছোট জিনিস", "r": 1.759, "c": "s", "op": 1}, {"id": "cat_plush", "n": "বিড়াল পুতুল", "p": 30, "k": "f", "w": 10, "f": 0, "g": "ছোট জিনিস", "r": 1.131, "c": "s"}, {"id": "hand_fan", "n": "হাতপাখা", "p": 15, "k": "w", "w": 13, "f": 0, "g": "ছোট জিনিস", "r": 0.689, "c": "w"}, {"id": "cactus_flower", "n": "ক্যাকটাস", "p": 15, "k": "f", "w": 6.5, "f": 0, "g": "ছোট জিনিস", "r": 1.397, "c": "s", "op": 1}, {"id": "succulent", "n": "সাকুলেন্ট", "p": 15, "k": "f", "w": 7, "f": 0, "g": "ছোট জিনিস", "r": 1.233, "c": "s", "op": 1}, {"id": "rickshaw_art_frame", "n": "রিকশা আর্ট", "p": 30, "k": "w", "w": 17, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 0.863, "c": "w"}, {"id": "hilsa_fish", "n": "ইলিশ সাজ", "p": 25, "k": "w", "w": 18, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 0.668, "c": "w"}, {"id": "terracotta_pot", "n": "মাটির হাঁড়ি", "p": 20, "k": "f", "w": 9, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 0.975, "c": "s"}, {"id": "shitalpati_mat", "n": "শীতলপাটি", "p": 25, "k": "f", "w": 34, "f": 1, "g": "বাংলাদেশি ছোঁয়া", "r": 0.779, "c": "f"}, {"id": "hurricane_lantern", "n": "হারিকেন", "p": 25, "k": "f", "w": 7.5, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 1.532, "c": "s", "op": 1, "lt": 1}, {"id": "jamdani_cushion", "n": "জামদানি কুশন", "p": 20, "k": "f", "w": 10, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 0.974, "c": "s"}, {"id": "clay_tea_kettle", "n": "মাটির কেটলি", "p": 25, "k": "f", "w": 8.5, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 1.056, "c": "s", "op": 1}, {"id": "mango_pickle_jar", "n": "আচারের বয়াম", "p": 15, "k": "f", "w": 7, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 1.301, "c": "s", "op": 1}, {"id": "eid_lantern", "n": "ঈদের ফানুস", "p": 30, "k": "w", "w": 11, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 1.696, "c": "w", "lt": 1, "h": 1}, {"id": "paper_kite", "n": "ঘুড়ি", "p": 20, "k": "w", "w": 15, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 1.005, "c": "w"}, {"id": "kalamdani_pens", "n": "কলমদানি", "p": 15, "k": "f", "w": 7, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 1.496, "c": "s", "op": 1}, {"id": "shahid_minar_frame", "n": "শহীদ মিনার", "p": 30, "k": "w", "w": 15, "f": 0, "g": "বাংলাদেশি ছোঁয়া", "r": 0.931, "c": "w"}, {"id": "k_stove", "n": "গ্যাসের চুলা", "p": 50, "k": "f", "w": 26, "f": 0, "g": "কিচেনের আসবাব 🍳", "r": 1.266, "c": "f", "sf": [0.4, 0.42, 0.18, [-0.5]]}, {"id": "k_fridge", "n": "সবুজ ফ্রিজ", "p": 55, "k": "f", "w": 20, "f": 0, "g": "কিচেনের আসবাব 🍳", "r": 1.527, "c": "f", "sf": [0.5, 0.1, 0.22, [0]]}, {"id": "k_dining", "n": "খাবার টেবিল", "p": 45, "k": "f", "w": 32, "f": 0, "g": "কিচেনের আসবাব 🍳", "r": 0.945, "c": "f", "sf": [0.55, 0.42, 0.2, [-0.55, 0.55]]}, {"id": "k_island", "n": "কিচেন আইল্যান্ড", "p": 50, "k": "f", "w": 30, "f": 0, "g": "কিচেনের আসবাব 🍳", "r": 1.075, "c": "f", "sf": [0.5, 0.26, 0.3, [-0.55, 0.55]]}, {"id": "k_sink", "n": "সিঙ্ক কাউন্টার", "p": 45, "k": "f", "w": 34, "f": 0, "g": "কিচেনের আসবাব 🍳", "r": 0.905, "c": "f", "sf": [0.75, 0.38, 0.12, [0]]}, {"id": "k_shelf", "n": "কিচেন তাক", "p": 40, "k": "f", "w": 22, "f": 0, "g": "কিচেনের আসবাব 🍳", "r": 1.299, "c": "f", "sf": [[0.5, 0.32, 0.24, [0.6]], [0.5, 0.6, 0.24, [-0.6]], [0.5, 0.88, 0.24, [0.6]]]}, {"id": "k_cart", "n": "চায়ের ট্রলি", "p": 35, "k": "f", "w": 26, "f": 0, "g": "কিচেনের আসবাব 🍳", "r": 1.136, "c": "f", "sf": [[0.5, 0.5, 0.22, [0.75]], [0.5, 0.86, 0.2, [0.6]]]}, {"id": "k_woodsink", "n": "কাঠের সিঙ্ক", "p": 45, "k": "f", "w": 32, "f": 0, "g": "কিচেনের আসবাব 🍳", "r": 0.995, "c": "f", "sf": [0.78, 0.5, 0.12, [0]]}, {"id": "k_rack", "n": "খোলা মসলার তাক", "p": 30, "k": "f", "w": 22, "f": 0, "g": "কিচেনের আসবাব 🍳", "r": 1.198, "c": "f", "sf": [[0.5, 0.4, 0.2, [-0.6]], [0.5, 0.72, 0.2, [0.6]]]}, {"id": "s_pot", "n": "হাঁড়ি", "p": 15, "k": "f", "w": 9, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 0.82, "c": "s", "op": 1}, {"id": "s_pan", "n": "ফ্রাইং প্যান", "p": 12, "k": "f", "w": 10, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 0.545, "c": "s", "op": 1}, {"id": "s_fruitbowl", "n": "ফলের বাটি", "p": 15, "k": "f", "w": 9, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 0.885, "c": "s", "op": 1}, {"id": "s_teatray", "n": "চায়ের ট্রে", "p": 20, "k": "f", "w": 12, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 0.705, "c": "s", "op": 1}, {"id": "s_spicejars", "n": "মসলার জার", "p": 15, "k": "f", "w": 10, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 0.65, "c": "s", "op": 1}, {"id": "s_board", "n": "কাটিং বোর্ড", "p": 12, "k": "f", "w": 10, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 0.695, "c": "s", "op": 1}, {"id": "s_ricecooker", "n": "রাইস কুকার", "p": 20, "k": "f", "w": 9, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 1.02, "c": "s", "op": 1}, {"id": "s_plates", "n": "থালার স্তূপ", "p": 12, "k": "f", "w": 9, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 0.815, "c": "s", "op": 1}, {"id": "s_bread", "n": "রুটির ঝুড়ি", "p": 15, "k": "f", "w": 10, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 0.71, "c": "s", "op": 1}, {"id": "s_mortar", "n": "শিল-নোড়া", "p": 18, "k": "f", "w": 9, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 1.081, "c": "s"}, {"id": "s_jug", "n": "পানির জাগ", "p": 15, "k": "f", "w": 7, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 1.053, "c": "s"}, {"id": "s_kplant", "n": "ছোট গাছ", "p": 15, "k": "f", "w": 7.5, "f": 0, "g": "কিচেনের ছোট জিনিস 🥘", "r": 1.282, "c": "s"}, {"id": "d_sofa", "n": "সবুজ সোফা", "p": 60, "k": "f", "w": 42, "f": 0, "g": "ড্রয়িং রুম 🛋️", "r": 0.635, "c": "f", "sf": [0.5, 0.62, 0.3, [-0.55, 0.55]]}, {"id": "d_armchair", "n": "গোল আর্মচেয়ার", "p": 40, "k": "f", "w": 24, "f": 0, "g": "ড্রয়িং রুম 🛋️", "r": 0.985, "c": "f"}, {"id": "d_tvstand", "n": "টিভি স্ট্যান্ড", "p": 50, "k": "f", "w": 28, "f": 0, "g": "ড্রয়িং রুম 🛋️", "r": 1.282, "c": "f", "sf": [0.5, 0.84, 0.28, [-0.5, 0.5]]}, {"id": "d_cabinet", "n": "কাচের আলমারি", "p": 50, "k": "f", "w": 27, "f": 0, "g": "ড্রয়িং রুম 🛋️", "r": 1.266, "c": "f", "sf": [0.5, 0.12, 0.3, [-0.6, 0.6]]}, {"id": "d_sidetable", "n": "সাইড টেবিল", "p": 30, "k": "f", "w": 14, "f": 0, "g": "ড্রয়িং রুম 🛋️", "r": 1.786, "c": "f", "lt": 1}, {"id": "d_floorlamp", "n": "স্ট্যান্ড ল্যাম্প", "p": 30, "k": "f", "w": 9, "f": 0, "g": "ড্রয়িং রুম 🛋️", "r": 2.632, "c": "f", "lt": 1}, {"id": "w_painting", "n": "নদীর ছবি", "p": 35, "k": "w", "w": 28, "f": 0, "g": "দেয়ালের সাজ 🖼️", "r": 0.65, "c": "w"}, {"id": "w_shelf2", "n": "ফুলের তাক", "p": 30, "k": "w", "w": 24, "f": 0, "g": "দেয়ালের সাজ 🖼️", "r": 0.65, "c": "w", "sf": [0.5, 0.82, 0.4, [0]]}, {"id": "w_plates", "n": "দেয়ালের প্লেট", "p": 25, "k": "w", "w": 20, "f": 0, "g": "দেয়ালের সাজ 🖼️", "r": 0.5, "c": "w"}, {"id": "w_bunting", "n": "পতাকার মালা", "p": 20, "k": "w", "w": 42, "f": 0, "g": "দেয়ালের সাজ 🖼️", "r": 0.36, "c": "w", "sn": "top"}, {"id": "w_macrame", "n": "সূর্য ম্যাক্রামে", "p": 30, "k": "w", "w": 14, "f": 0, "g": "দেয়ালের সাজ 🖼️", "r": 1.626, "c": "w"}, {"id": "w_window", "n": "ফুল-পর্দার জানালা", "p": 40, "k": "w", "w": 26, "f": 0, "g": "দেয়ালের সাজ 🖼️", "r": 1.07, "c": "w"}, {"id": "sp_cup", "n": "সোনালি চায়ের কাপ", "p": 0, "k": "f", "w": 8, "f": 0, "g": "স্পেশাল ✨", "r": 1.07, "c": "s", "sp": 1, "op": 1}, {"id": "sp_lantern", "n": "তারা ফানুস", "p": 0, "k": "w", "w": 11, "f": 0, "g": "স্পেশাল ✨", "r": 1.274, "c": "w", "sp": 1, "lt": 1, "h": 1}, {"id": "sp_cat", "n": "রংধনু বিড়াল", "p": 0, "k": "f", "w": 10, "f": 0, "g": "স্পেশাল ✨", "r": 1.149, "c": "s", "sp": 1}, {"id": "sp_lotus", "n": "কাচের পদ্ম", "p": 0, "k": "f", "w": 8, "f": 0, "g": "স্পেশাল ✨", "r": 1.176, "c": "s", "sp": 1, "op": 1}, {"id": "sp_books", "n": "জাদুর বই", "p": 0, "k": "f", "w": 9, "f": 0, "g": "স্পেশাল ✨", "r": 0.905, "c": "s", "sp": 1, "op": 1}, {"id": "sp_moon", "n": "চাঁদের বাতি", "p": 0, "k": "f", "w": 9, "f": 0, "g": "স্পেশাল ✨", "r": 1.212, "c": "s", "sp": 1, "op": 1, "lt": 1}, {"id": "tr_beg", "n": "চারাগাছের ট্রফি", "p": 0, "k": "f", "w": 9, "f": 0, "g": "ট্রফি 🏆", "r": 1.105, "c": "s", "sp": 1, "op": 1, "tr": 1}, {"id": "tr_med", "n": "লতাপাতার ট্রফি", "p": 0, "k": "f", "w": 9, "f": 0, "g": "ট্রফি 🏆", "r": 1.03, "c": "s", "sp": 1, "op": 1, "tr": 1}, {"id": "tr_high", "n": "সাকুরা ট্রফি", "p": 0, "k": "f", "w": 9, "f": 0, "g": "ট্রফি 🏆", "r": 0.995, "c": "s", "sp": 1, "op": 1, "tr": 1}, {"id": "tr_pro", "n": "সোনালি চ্যাম্পিয়ন কাপ", "p": 0, "k": "f", "w": 9, "f": 0, "g": "ট্রফি 🏆", "r": 0.88, "c": "s", "sp": 1, "op": 1, "tr": 1}], "rooms": [{"id": "room_pink", "n": "বেডরুম", "p": 0, "e": "🛏️"}, {"id": "room_green", "n": "ড্রয়িং রুম", "p": 40, "e": "🛋️"}, {"id": "room_cream", "n": "কিচেন", "p": 40, "e": "🍳"}]};
const NIMG = {"room_pink": "assets/img/room_pink.webp", "room_green": "assets/img/room_green.webp", "room_cream": "assets/img/room_cream.webp", "bed_green": "assets/img/bed_green.webp", "wardrobe_yellow": "assets/img/wardrobe_yellow.webp", "sofa_pink": "assets/img/sofa_pink.webp", "ladder_bookshelf": "assets/img/ladder_bookshelf.webp", "kantha_rug": "assets/img/kantha_rug.webp", "coffee_table_book": "assets/img/coffee_table_book.webp", "chest_ottoman": "assets/img/chest_ottoman.webp", "desk_lamp": "assets/img/desk_lamp.webp", "storage_bench": "assets/img/storage_bench.webp", "desk_laptop": "assets/img/desk_laptop.webp", "cabinet_bookshelf": "assets/img/cabinet_bookshelf.webp", "jute_floor_bed": "assets/img/jute_floor_bed.webp", "lantern_low_table": "assets/img/lantern_low_table.webp", "vanity_mirror": "assets/img/vanity_mirror.webp", "cane_chair": "assets/img/cane_chair.webp", "wall_clock": "assets/img/wall_clock.webp", "window_curtains": "assets/img/window_curtains.webp", "fairy_lights": "assets/img/fairy_lights.webp", "wall_shelf": "assets/img/wall_shelf.webp", "poster_frames": "assets/img/poster_frames.webp", "round_rug": "assets/img/round_rug.webp", "striped_rug": "assets/img/striped_rug.webp", "jute_mat": "assets/img/jute_mat.webp", "hanging_plant": "assets/img/hanging_plant.webp", "paper_lantern": "assets/img/paper_lantern.webp", "round_mirror": "assets/img/round_mirror.webp", "teacup": "assets/img/teacup.webp", "teapot": "assets/img/teapot.webp", "table_lamp": "assets/img/table_lamp.webp", "fern_plant": "assets/img/fern_plant.webp", "books_stack": "assets/img/books_stack.webp", "alarm_clock": "assets/img/alarm_clock.webp", "photo_frame": "assets/img/photo_frame.webp", "star_jar": "assets/img/star_jar.webp", "radio": "assets/img/radio.webp", "vase_plant": "assets/img/vase_plant.webp", "cat_plush": "assets/img/cat_plush.webp", "hand_fan": "assets/img/hand_fan.webp", "cactus_flower": "assets/img/cactus_flower.webp", "succulent": "assets/img/succulent.webp", "rickshaw_art_frame": "assets/img/rickshaw_art_frame.webp", "hilsa_fish": "assets/img/hilsa_fish.webp", "terracotta_pot": "assets/img/terracotta_pot.webp", "shitalpati_mat": "assets/img/shitalpati_mat.webp", "hurricane_lantern": "assets/img/hurricane_lantern.webp", "jamdani_cushion": "assets/img/jamdani_cushion.webp", "clay_tea_kettle": "assets/img/clay_tea_kettle.webp", "mango_pickle_jar": "assets/img/mango_pickle_jar.webp", "eid_lantern": "assets/img/eid_lantern.webp", "paper_kite": "assets/img/paper_kite.webp", "kalamdani_pens": "assets/img/kalamdani_pens.webp", "shahid_minar_frame": "assets/img/shahid_minar_frame.webp", "k_stove": "assets/img/k_stove.webp", "k_fridge": "assets/img/k_fridge.webp", "k_dining": "assets/img/k_dining.webp", "k_island": "assets/img/k_island.webp", "k_sink": "assets/img/k_sink.webp", "k_shelf": "assets/img/k_shelf.webp", "k_cart": "assets/img/k_cart.webp", "k_woodsink": "assets/img/k_woodsink.webp", "k_rack": "assets/img/k_rack.webp", "s_pot": "assets/img/s_pot.webp", "s_pan": "assets/img/s_pan.webp", "s_fruitbowl": "assets/img/s_fruitbowl.webp", "s_teatray": "assets/img/s_teatray.webp", "s_spicejars": "assets/img/s_spicejars.webp", "s_board": "assets/img/s_board.webp", "s_ricecooker": "assets/img/s_ricecooker.webp", "s_plates": "assets/img/s_plates.webp", "s_bread": "assets/img/s_bread.webp", "s_mortar": "assets/img/s_mortar.webp", "s_jug": "assets/img/s_jug.webp", "s_kplant": "assets/img/s_kplant.webp", "d_sofa": "assets/img/d_sofa.webp", "d_armchair": "assets/img/d_armchair.webp", "d_tvstand": "assets/img/d_tvstand.webp", "d_cabinet": "assets/img/d_cabinet.webp", "d_sidetable": "assets/img/d_sidetable.webp", "d_floorlamp": "assets/img/d_floorlamp.webp", "w_painting": "assets/img/w_painting.webp", "w_shelf2": "assets/img/w_shelf2.webp", "w_plates": "assets/img/w_plates.webp", "w_bunting": "assets/img/w_bunting.webp", "w_macrame": "assets/img/w_macrame.webp", "w_window": "assets/img/w_window.webp", "sp_cup": "assets/img/sp_cup.webp", "sp_lantern": "assets/img/sp_lantern.webp", "sp_cat": "assets/img/sp_cat.webp", "sp_lotus": "assets/img/sp_lotus.webp", "sp_books": "assets/img/sp_books.webp", "sp_moon": "assets/img/sp_moon.webp", "tr_beg": "assets/img/tr_beg.webp", "tr_med": "assets/img/tr_med.webp", "tr_high": "assets/img/tr_high.webp", "tr_pro": "assets/img/tr_pro.webp"};
const ASPECT = '401/497';

const ITEM = {}; NOOK.items.concat(NOOK.rooms).forEach(i => ITEM[i.id] = i);
const ROOMS = NOOK.rooms.map(r => r.id);
const FLOOR = [[5,74],[50,53],[95,74],[50,96]], WALL = [[5,70.7],[5,29.3],[50,9.2],[95,29.3],[95,70.7],[50,50.3]];
/* দেয়ালের আসল ঢাল (ঘরের ছবি মেপে): বাঁ দেয়াল ডানে উঠছে, ডান দেয়াল ডানে নামছে */
const WK = .48, WSX = .87;
const wTop = x => 27.8 - ((x < 50 ? x : 100 - x) - 8.3) * .445, wBot = x => 69.2 - ((x < 50 ? x : 100 - x) - 8.3) * .453;
const wMat = x => `matrix(${WSX},${x < 50 ? -WK : WK},0,1,0,0)`;
const isFlatW = it => !!it && it.k === 'w' && !it.h;
/* ---- v1.3.8: মেঝেতে ঠিকঠাক বসা ----
   মেঝেটা একটা রম্বস (ঘরের ছবি মেপে)। u,v অক্ষে সেটা [-1,1] বর্গ: u=-1 বাঁ দেয়াল, v=+1 ডান দেয়াল।
   জিনিসের তলার মাপ (footprint) মেঝের ভেতরে রাখা হয়, বড় আসবাব দেয়াল ঘেঁষে লেগে যায়। */
const FLR = { cx: 50, cy: 74.5, hw: 45, hh: 21.5 };
const toUV = (x, y) => { const X = (x - FLR.cx) / FLR.hw, Y = (y - FLR.cy) / FLR.hh; return [X + Y, X - Y]; };
const fromUV = (u, v) => [FLR.cx + (u + v) / 2 * FLR.hw, FLR.cy + (u - v) / 2 * FLR.hh];
const FLATF = { jute_mat: 'ell', striped_rug: 'proj' };   // যে গালিচাগুলো ওপর থেকে আঁকা, মেঝের ঢালে শুইয়ে দিতে হয়
function floorM(it, fl) {
  const m = FLATF[it.id]; if (!m) return null;
  if (m === 'ell') return [fl ? -1 : 1, 0, 0, .6];
  const k = 1 / (1 + it.r), a = k, b = .5774 * k;
  return fl ? [f3(a), f3(-b), f3(a), f3(b)] : [f3(a), f3(b), f3(-a), f3(b)];
}
const floorMs = (it, fl) => { const m = floorM(it, fl); return m ? `matrix(${m.join(',')},0,0)` : ''; };
const itemT = (it, q) => `translate(-50%,${it.k === 'w' || it.f ? '-50%' : '-92%'})${isFlatW(it) ? ' ' + wMat(q.x) : ''} ${floorMs(it, q.fl) || 'scaleX(' + (q.fl ? -1 : 1) + ')'}`;
const FP = .24;   // তলার অর্ধেক চওড়া = ছবির চওড়ার এই ভগ্নাংশ
function fpExt(it, s) {
  const w = it.w * s;
  if (it.f) { const m = FLATF[it.id]; let bx = w / 2 * .94, by = w * it.r * AR / 2 * .94; if (m === 'ell') by *= .6; else if (m === 'proj') by = w * .2887 * AR * .94; return [bx, by]; }
  const bx = w * FP; return [bx, bx * .5];
}
const fpB = (it, s) => { const [bx, by] = fpExt(it, s); return Math.max(0, 1 - (bx / FLR.hw + by / FLR.hh)); };
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
function floorFit(q) {
  const it = ITEM[q.id]; if (!it || it.k !== 'f' || q.on) return q;
  const B = fpB(it, q.s || 1); let [u, v] = toUV(q.x, q.y);
  u = clampN(u, -B, B); v = clampN(v, -B, B);
  if (it.c === 'f' && !it.f) { const m = .1; if (u < -B + m) u = -B; if (v > B - m) v = B; }   // বড় আসবাব দেয়াল ঘেঁষে লাগে
  const [x, y] = fromUV(u, v); q.x = r1(x); q.y = r1(y); return q;
}
const FLOOR_WIDE = [[-1.12, -1.12], [-1.12, 1.12], [1.12, 1.12], [1.12, -1.12]].map(([u, v]) => fromUV(u, v));   // মেঝের কাছাকাছি কোথাও ছাড়লেও জিনিস ঠিক জায়গায় গিয়ে বসে
const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const poly = P => P.map(q => q.join(',')).join(' ');
let N = { tab: 'room', id: null, rid: null, cat: 'all', ri: 0, ti: 0, undo: [] };
const AR = 401 / 497, r1 = v => +v.toFixed(1);
const COIN = '<img class="ci" src="assets/img/hud_coin.webp" alt="">', dk = d => (d || new Date()).toLocaleDateString('en-CA');
const roomItems = rid => (S.rooms[rid] = S.rooms[rid] || []);
const placedIds = () => ROOMS.flatMap(r => roomItems(r).map(q => q.id));
const ancY = it => (it.k === 'w' || it.f) ? .5 : .92;
const hOf = q => ITEM[q.id].w * (q.s || 1) * ITEM[q.id].r * AR;
const zOf = (q, list) => { const it = ITEM[q.id]; if (q.on) { const p = list.find(z => z.id === q.on); if (p) return zOf(p, list) + 1; } return it.f ? 1 : it.k === 'w' ? 2 : 10 + Math.round(q.y * 10); };
/* দেয়ালের জিনিস দেয়ালের ভেতরেই রাখো (এক দেয়ালে, কোণা পেরিয়ে না) */
function wallFit(q) {
  const it = ITEM[q.id]; if (!it || it.k !== 'w') return q;
  const flat = isFlatW(it), fx = flat ? WSX : 1;
  const smax = Math.min(2.2, 39 / (it.w * it.r * AR), flat ? 42 / (it.w * fx) : 99);
  let s = q.s || 1; if (s > smax) { s = +smax.toFixed(2); q.s = s; }
  const hw = it.w * s * fx / 2, hh = it.w * s * it.r * AR / 2; let x = q.x, y = q.y;
  if (flat) x = x < 50 ? Math.min(Math.max(x, 6.2 + hw), 49.4 - hw) : Math.min(Math.max(x, 50.6 + hw), 93.8 - hw);
  else x = Math.min(Math.max(x, 6 + hw), 94 - hw);
  let lo, hi;
  if (flat) { lo = wTop(x) + hh + .8; hi = wBot(x) - hh - .8; }
  else { const xs = [x - hw, x, x + hw].concat(x - hw < 50 && x + hw > 50 ? [50] : []); lo = Math.max(...xs.map(wTop)) + hh + .8; hi = Math.min(...xs.map(wBot)) - hh - .8; }
  y = hi >= lo ? Math.min(Math.max(y, lo), hi) : (lo + hi) / 2;
  if (it.h) y = Math.min(lo - .2, hi >= lo ? hi : lo); else if (it.sn === 'top') y = Math.min(lo + 1.6, hi >= lo ? hi : lo + 1.6);
  q.x = r1(x); q.y = r1(y); return q;
}
function fixS() {
  if (S.cv !== 4) { if (S.name) { S.progress = {}; S.mistakes = []; S.boss = {}; S.tch = {}; } S.cv = 4; save(); }
  if (!LV[S.lvl]) { const c = +S.cls; S.lvl = !S.name ? '' : c >= 9 ? 'high' : c >= 6 ? 'med' : 'beg'; }
  if (!S.rooms) S.rooms = {};
  if (S.items && S.items.length) { const t = ROOMS.includes(S.theme) ? S.theme : ROOMS[0]; S.rooms[t] = (S.rooms[t] || []).concat(S.items); }
  if (!S.qd) S.qd = {};
  if (!S.days) { S.days = {}; const n = S.streak || 0; if (n > 0 && S.lastDay) { const end = new Date(); if (S.lastDay !== dkey()) end.setDate(end.getDate() - 1); for (let i = 0; i < Math.min(n, 7); i++) { const d = new Date(end); d.setDate(end.getDate() - i); S.days[dk(d)] = 1; } } }
  if (!S.bd) S.bd = {};
  S.items = []; ROOMS.forEach(r => { if (!S.rooms[r]) S.rooms[r] = []; });
  ['clip_garland', 'clip_note'].forEach((c, k) => { if (S.owned.includes(c)) { S.owned = S.owned.filter(x => x !== c); S.coins = (S.coins || 0) + [25, 20][k]; } ROOMS.forEach(r => { S.rooms[r] = S.rooms[r].filter(q => q.id !== c); }); });
  if (S.owned.includes('floral_curtains')) { S.owned = S.owned.filter(x => x !== 'floral_curtains'); S.coins = (S.coins || 0) + 30; S.refund = 30; }
  ROOMS.forEach(r => { S.rooms[r] = S.rooms[r].filter(q => ITEM[q.id]); resnap(r); });
  if (S.refund) { const n = S.refund; S.refund = 0; save(); setTimeout(() => toast('🧾 ফুল-পর্দাটা সরিয়ে দিয়েছি, ' + n + ' কয়েন ফেরত পেয়েছ'), 2600); }
  Object.keys(S.boss || {}).forEach(key => { const lv = String(key).split(':')[0]; if (TROPHY[lv] && S.boss[key] > 0 && !S.owned.includes(TROPHY[lv])) { S.owned.push(TROPHY[lv]); S.gifts = (S.gifts || 0) + 1; S.trLate = (S.trLate || 0) + 1; } });
  ensureTrays();
  if (S.trLate) { const n = S.trLate; S.trLate = 0; save(); setTimeout(() => toast('🏆 বস আগেই হারিয়েছিলে, তাই ' + n + 'টা ট্রফি পেয়েছ! ট্রেতে দেখো'), 3200); }
  N.ri = Math.max(0, ROOMS.indexOf(S.ri));
}
const pushUndo = () => { N.undo.push(JSON.stringify(S.rooms)); if (N.undo.length > 20) N.undo.shift(); };
function toast(t) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; document.body.appendChild(el); iconify(el); setTimeout(() => el.remove(), 2300); }

/* ---- টেবিল/তাকের ওপর বসানো ---- */
function surfs(p) {
  const it = ITEM[p.id]; if (!it.sf) return null;
  const arr = Array.isArray(it.sf[0]) ? it.sf : [it.sf], wP = it.w * (p.s || 1), h = hOf(p), top = p.y - ancY(it) * h, mxy = Math.max(...arr.map(z => z[1]));
  return arr.map(sf => { const sx = p.x - wP / 2 + (p.fl ? 1 - sf[0] : sf[0]) * wP, hw = sf[2] * wP; return { l: p.x - wP / 2, r: p.x + wP / 2, top, bot: top + Math.min(.95, mxy + .2) * h, sx, hw, sy: top + sf[1] * h, h, sl: (sf[3] || [-.6, 0, .6]).map(o => sx + (p.fl ? -o : o) * hw) }; });
}
function perch(rid, id, rx, ry) {
  const it = ITEM[id]; if (it.c !== 's' || it.k !== 'f') return null;
  const L = roomItems(rid); let best = null;
  L.forEach(p => { if (p.id === id || p.on) return; const gs = surfs(p); if (!gs) return;
    gs.forEach((g, si) => { if (rx < g.l || rx > g.r || ry < g.top || ry > g.bot) return;
      const used = L.filter(z => z.on === p.id && (z.si || 0) === si && z.id !== id).map(z => z.sl || 0), free = g.sl.map((x, k) => k).filter(k => !used.includes(k)); if (!free.length) return;
      const sl = free.reduce((a, k) => Math.abs(g.sl[k] - rx) < Math.abs(g.sl[a] - rx) ? k : a, free[0]), dd = Math.abs(ry - g.sy);
      if (!best || p.y > best.p.y + 1e-6 || (p === best.p && dd < best.d)) best = { p, g, si, sl, d: dd }; }); });
  return best ? { pid: best.p.id, si: best.si, sl: best.sl, x: best.g.sl[best.sl], y: best.g.sy } : null;
}
function resnap(rid) {
  const L = roomItems(rid);
  L.forEach(q => { const it = ITEM[q.id]; if (it && it.k === 'w') wallFit(q); else if (it && it.k === 'f' && !q.on) floorFit(q); });
  L.forEach(q => { if (!q.on) return; const p = L.find(z => z.id === q.on), gs = p && surfs(p), g = gs && gs[q.si || 0]; if (!g) { delete q.on; delete q.si; delete q.sl; return; } q.x = r1(g.sl[q.sl || 0] != null ? g.sl[q.sl || 0] : g.sx); q.y = r1(g.sy); });
}
const removeWithKids = (rid, id) => { S.rooms[rid] = roomItems(rid).filter(z => z.id !== id && z.on !== id); };

const GLY = { d_floorlamp: 22, d_sidetable: 30, desk_lamp: 30, lantern_low_table: 34, table_lamp: 40, hurricane_lantern: 42 };
function glowHTML(it, q) {
  if (!it.lt) return ''; const w = it.w * (q.s || 1);
  if (it.k === 'w' && w > 20) return '<i class="glow wide"></i>';
  const D = w <= 20 ? 37 : w * 1.3, gw = Math.round(D / w * 100), gy = GLY[q.id] != null ? GLY[q.id] : (it.k === 'w' ? 50 : 36);
  return `<i class="glow" style="--gw:${gw}%;--gy:${gy}%"></i>`;
}
const FF = [[16, 22, 0], [82, 14, 2.2], [9, 52, 4.1], [90, 48, 1.1], [30, 78, 5.3], [70, 84, 3.2], [52, 10, 6.4]];
const fxHTML = () => '<div class="fx">' + FF.map(([x, y, d], k) => `<i style="left:${x}%;top:${y}%;animation-delay:${d}s;animation-duration:${7 + k % 3 * 1.6}s"></i>`).join('') + '</div>';
const pitHTML = (q, list) => { const it = ITEM[q.id]; if (!it) return ''; const t = itemT(it, q);
  return `<button class="pit ${N.last === q.id ? 'new' : ''} ${q.on ? 'on' : ''} ${it.k === 'f' && !it.f && !q.on ? 'fs' : ''} ${it.lt ? 'lt' : ''}" data-id="${q.id}" style="--t:${t};left:${q.x}%;top:${q.y}%;width:${it.w * (q.s || 1)}%;transform:${t};z-index:${zOf(q, list)}">${glowHTML(it, q)}<img src="${NIMG[q.id]}" alt="${esc(it.n)}"></button>`; };

/* v1.3.4: দিন-রাত ঘড়ি ধরে নিজে বদলায়; নিজে বদলালে ওই দিন/রাতের জন্য সেটাই থাকে */
const isNightNow = () => { const h = new Date().getHours(); return h >= 18 || h < 6; };
const partKey = () => dkey() + (isNightNow() ? 'n' : 'd');
function autoNight() { if (S.nightMan === partKey()) return false; const w = isNightNow() ? 1 : 0; if ((S.night ? 1 : 0) === w) return false; S.night = w; return true; }
function dnToggle() {
  return `<button class="dn ${S.night ? 'night' : ''}" data-act="night" role="switch" aria-checked="${!!S.night}" aria-label="দিন-রাত"><span class="dn-trk"><i class="st s1"></i><i class="st s2"></i><i class="st s3"></i><i class="cl"></i></span><span class="dn-kn"><img class="sun" src="assets/img/hud_sun.webp" alt=""><img class="moon" src="assets/img/hud_moon.webp" alt=""></span></button>`;
}
function roomPanel(rid, i) {
  const r = ITEM[rid], own = S.owned.includes(rid), L = roomItems(rid), ok = (S.coins || 0) >= r.p;
  return `<section class="rpan ${i === N.ri ? 'cur' : ''}" data-rid="${rid}" data-i="${i}"><div class="rhead"><span></span><div class="rname">${ico(ROOM_IC[rid])} ${r.n}${own ? '' : ' ' + ico('lock')}</div>${own ? dnToggle() : '<span></span>'}</div>
  <div class="rstage">${own ? fxHTML() : ''}<div class="room ${own ? '' : 'lockd'}" style="aspect-ratio:${ASPECT}"><img class="rbg" src="${NIMG[rid]}" alt="">${own ? `<i class="dusk" style="-webkit-mask-image:url(${NIMG[rid]});mask-image:url(${NIMG[rid]})"></i>` : ''}
  <svg class="zone" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon class="zpoly" points=""/></svg>${own ? L.map(q => pitHTML(q, L)).join('') : `<div class="lockv"><div class="big">🔒</div><b>${r.n}</b><span>${COIN} ${r.p}</span><button class="mini ${ok ? '' : 'off'}" data-act="buy" data-id="${rid}">${ok ? 'কিনে খুলি' : 'কয়েন কম'}</button></div>`}</div></div></section>`;
}
const CATS = [['all', 'সব', 'all'], ['f', 'আসবাব', 'furniture'], ['w', 'দেয়াল', 'wall'], ['s', 'ছোট জিনিস', 'small']];
/* v1.3.8: ট্রে এখন আলাদা আলাদা, পাশাপাশি। প্রতি ট্রেতে 6টা জায়গা; ভরলে পরের ট্রেতে যায়; নতুন ট্রে শপ থেকে কিনতে হয় */
const TRAY_CAP = 6, TRAY_MAX = 6, TRAY_PRICE = [0, 30, 40, 50, 60, 70];
const TB = { W: 777, H: 468 };
const TSLOT = [[175, 195, 190, 150], [388.5, 195, 190, 150], [602, 195, 190, 150], [150, 324, 210, 165], [388.5, 324, 210, 165], [627, 324, 210, 165]];
const TSLOT_ST = TSLOT.map(([cx, b, w, h]) => `left:${r2((cx - w / 2) / TB.W * 100)}%;top:${r2((b - h) / TB.H * 100)}%;width:${r2(w / TB.W * 100)}%;height:${r2(h / TB.H * 100)}%`);
const unplacedList = () => { const pid = placedIds(); return S.owned.filter(x => ITEM[x] && ITEM[x].k && !pid.includes(x)); };
const trayN = () => Math.max(1, S.trays || 1);
const trayFull = () => unplacedList().length >= trayN() * TRAY_CAP;
const trayOrder = () => { const a = unplacedList(); return N.cat === 'all' ? a : a.filter(x => ITEM[x].c === N.cat).concat(a.filter(x => ITEM[x].c !== N.cat)); };
function ensureTrays() { const need = Math.ceil(unplacedList().length / TRAY_CAP); if (!S.trays) S.trays = 1; if (need > S.trays) { S.trays = need; return true; } return false; }
function trayFullSheet(kind) {
  const more = trayN() < TRAY_MAX, pr = more ? TRAY_PRICE[trayN()] : 0, can = more && (S.coins || 0) >= pr;
  const t1 = kind === 'return' ? 'ট্রেতে আর জায়গা নেই!' : 'ট্রে ফুল হয়ে গেছে!';
  const msg = !more ? 'সব ট্রে ভরা। আগে ঘরে কিছু জিনিস সাজাও, তারপর নতুন জিনিস আনতে পারবে।'
    : can ? `${kind === 'return' ? 'জিনিসটা ট্রেতে ফেরাতে' : 'নতুন জিনিস আনতে'} আগে শপে গিয়ে একটা ট্রে কিনে আনো। ট্রে ${bn(trayN() + 1)}-এর দাম ${COIN} ${pr}।`
    : `${kind === 'return' ? 'জিনিসটা ট্রেতে ফেরাতে' : 'নতুন জিনিস আনতে'} আগে ট্রে কিনতে হবে, দাম ${COIN} ${pr}। আরও ${pr - (S.coins || 0)} কয়েন লাগবে। পাঠ করে কয়েন জমাও, পড়াশোনাই কেনাকাটার চাবি 🔑`;
  sheet(`<div class="center">${mascot(84, 'think', true)}</div><h3>${ico('totray')} ${t1}</h3><p>${msg}</p>${more ? (can ? '<button class="btn" data-act="trayshop">শপে গিয়ে ট্রে কিনি</button>' : '<button class="btn" data-act="home">পাঠ করে কয়েন জমাই</button>') : ''}<button class="btn ghost" data-act="close">ঠিক আছে</button>`);
}
const trayK = id => Math.round(clampN(.58 + .42 * Math.pow(Math.min(1, (ITEM[id].w || 20) / 32), .55), .58, 1) * 100);   // ছোট জিনিস একটু ছোট দেখায়, বড় জিনিস পুরো ঘর জুড়ে
function trayPanel(i, list, hintHTML, total) {
  const own = i < trayN(), chunk = list.slice(i * TRAY_CAP, i * TRAY_CAP + TRAY_CAP), full = trayFull();
  const dots = Array.from({ length: total }, (_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('');
  let inner = '', foot = '', msg = '';
  if (own) {
    inner = TSLOT_ST.map((st, k) => { const id = chunk[k]; return id ? `<button class="ti ${k < 3 ? 'bk' : 'fr'} ${ITEM[id].sp ? 'sp' : ''}" data-id="${id}" style="${st}" aria-label="${esc(ITEM[id].n)}"><img src="${NIMG[id]}" alt="" style="max-width:${trayK(id)}%;max-height:${trayK(id)}%"></button>` : `<i class="tsl" style="${st}"></i>`; }).join('');
    if (i === 0 && !list.length) msg = `<div class="tempty">${!S.owned.some(x => ITEM[x] && ITEM[x].k) ? 'শপ থেকে স্টিকার কিনে আনো 🛒' : 'সব সাজানো হয়ে গেছে! ✨'}</div>`;
    if (full) foot = trayN() < TRAY_MAX ? `<button class="tpill full" data-act="trayshop">🧺 ট্রে ফুল! শপে গিয়ে ট্রে কিনে আনো</button>` : '<div class="tpill full">সব ট্রে ভরা, আগে ঘরে সাজাও</div>';
    else if (hintHTML && i === 0) foot = hintHTML;
    else foot = `<div class="tpill"><span class="tdots">${dots}</span><b>ট্রে ${bn(i + 1)}</b><span class="tcnt">${bn(chunk.length)}/${TRAY_CAP}</span></div>`;
  } else {
    const pr = TRAY_PRICE[i] || 0, next = i === trayN(), ok = (S.coins || 0) >= pr;
    inner = `<div class="tlockv">🔒<b>ট্রে ${bn(i + 1)}</b><span>${COIN} ${pr}</span>${next ? `<button class="mini ${ok ? '' : 'off'}" data-act="buytray">${ok ? 'কিনে খুলি' : 'কয়েন কম'}</button>` : '<small>আগের ট্রে আগে খোলো</small>'}</div>`;
    foot = `<div class="tpill"><span class="tdots">${dots}</span><b>ট্রে ${bn(i + 1)}</b></div>`;
  }
  return `<section class="tpan ${own ? '' : 'lockd'}" data-ti="${i}"><div class="tbox"><img class="tb" src="assets/img/tray_deep.webp" alt="">${inner}${msg}<img class="tf" src="assets/img/tray_front.webp" alt="">${foot}</div></section>`;
}
function trayHTML(hintHTML = '') {
  const all = unplacedList(), list = trayOrder(), total = Math.max(trayN(), TRAY_MAX);
  if (N.ti >= total) N.ti = total - 1;
  const fl = `<div class="chips tfilter">${CATS.map(([k, t, ic]) => `<button class="chip sm ${N.cat === k ? 'on' : ''}" data-act="cat" data-v="${k}">${ico(ic)} ${t} ${k === 'all' ? all.length : all.filter(x => ITEM[x].c === k).length}</button>`).join('')}</div>`;
  const panels = Array.from({ length: total }, (_, i) => trayPanel(i, list, hintHTML, total)).join('');
  return fl + `<div class="tcarw" id="tray"><div class="tcar" id="tcar">${panels}</div><button class="tarw l ${N.ti === 0 ? 'off' : ''}" data-act="trprev" aria-label="আগের ট্রে"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="tarw r ${N.ti === total - 1 ? 'off' : ''}" data-act="trnext" aria-label="পরের ট্রে"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="twr" aria-label="চিমটা"><img src="assets/img/tw_open.webp" alt=""></button></div>`;
}
function trayGo(i) { const c = $('#tcar'); if (!c) return; i = Math.max(0, Math.min(c.children.length - 1, i)); c.scrollTo({ left: c.children[i].offsetLeft, behavior: 'smooth' }); }
function restoreTray() { const c = $('#tcar'); if (c && c.children[N.ti]) c.scrollLeft = c.children[N.ti].offsetLeft; }
function syncTray() {
  const c = $('#tcar'); if (!c) return; const n = c.children.length, b = Math.max(0, Math.min(n - 1, Math.round(c.scrollLeft / (c.clientWidth || 1)))); N.ti = b;
  const l = $('.tarw.l'), r = $('.tarw.r'); if (l) l.classList.toggle('off', b === 0); if (r) r.classList.toggle('off', b === n - 1);
}
let tcarQ = false;
document.addEventListener('scroll', e => { if (e.target && e.target.id === 'tcar' && !tcarQ) { tcarQ = true; requestAnimationFrame(() => { tcarQ = false; syncTray(); }); } }, true);
function roomHTML() {
  autoNight();
  const cnt = S.owned.filter(x => ITEM[x] && ITEM[x].k).length, n = placedIds().length;
  const dkb = (act, ic, lb, c, extra = '') => `<button class="dk" data-act="${act}" ${extra}><span class="dki c${c}">${ic}</span><span class="dkl">${lb}</span></button>`;
  const tools = `<div class="dock2">${dkb('undo', '↩️', 'আনডু', 1, N.undo.length ? '' : 'disabled')}${dkb('pic', '📷', 'ছবি', 2)}${dkb('quests', '<img src="assets/img/hud_target.webp" alt="">', 'কোয়েস্ট', 3) .replace('</span><span class="dkl">', '</span><span class="dkl">') .replace('</button>', (qReady() ? `<span class="bd">${qReady()}</span>` : '') + '</button>')}${dkb('music', S.music === false ? '🔇' : '🎵', 'গান', 4)}${dkb('help', '❓', 'কীভাবে', 5)}${dkb('notes', '📝', 'নোট', 6)}</div>`;
  return rankStrip() + `<div class="rrow"><div class="rwrap"><button class="arw l ${N.ri === 0 ? 'off' : ''}" data-act="rprev" aria-label="আগের ঘর">‹</button><div class="rcar ${S.night ? 'night' : ''}" id="rcar">${ROOMS.map(roomPanel).join('')}</div><button class="arw r ${N.ri === ROOMS.length - 1 ? 'off' : ''}" data-act="rnext" aria-label="পরের ঘর">›</button></div>${tools}</div>
  <div class="dots">${ROOMS.map((r, i) => `<button class="dot ${i === N.ri ? 'on' : ''}" data-act="rgo" data-i="${i}" aria-label="${ITEM[r].n}"></button>`).join('')}${cnt ? `<span class="rcnt">সাজানো ${n}/${cnt}</span>` : ''}</div>` + trayHTML(!n && cnt ? '<div class="hint">👆 স্টিকার ওপরে টানো, নয়তো চিমটা ধরে স্টিকারের ওপর রাখো। ছোট জিনিস টেবিলের ওপরেও বসে!</div>' : '');
}
const SHOP = [['tray', 'basket', 'ট্রে'], ['room', 'rooms', 'ঘর'], ['f', 'furniture', 'আসবাব'], ['w', 'wall', 'দেয়াল'], ['s', 'small', 'ছোট জিনিস'], ['bd', 'bd', 'দেশি ছোঁয়া']];
const shopCat = it => it.g === 'বাংলাদেশি ছোঁয়া' ? 'bd' : it.c;
const shopList = c => c === 'room' ? NOOK.rooms : NOOK.items.filter(i => !i.sp && shopCat(i) === c);
const gName = (g, c) => g === 'দেয়াল ও মেঝে' ? (c === 'w' ? 'দেয়ালের সাজ' : 'গালিচা ও চাটাই') : g;
const trayInfoHTML = () => { const used = unplacedList().length, cap = trayN() * TRAY_CAP, full = trayFull(); return `<div class="tinfo ${full ? 'full' : ''}">${ico('totray')}<div><b>প্রতি ট্রেতে ${bn(TRAY_CAP)}টা জিনিস ধরে</b><span>এখন ${bn(used)}/${bn(cap)} জায়গা ভরা${full ? ' · ট্রে ফুল, নতুন জিনিস আনতে আগে ট্রে কিনো' : ''}</span></div></div>`; };
function trayShopHTML() {
  const card = n => { const own = n <= trayN(), next = n === trayN() + 1, pr = TRAY_PRICE[n - 1] || 0, ok = (S.coins || 0) >= pr;
    return `<div class="pcard ${own ? 'own' : ''}"><img src="assets/img/ui_basket.webp" alt=""><b>ট্রে ${bn(n)}</b>${own ? '<em>✓ আছে</em>' : next ? `<span class="pr">${COIN} ${pr}</span><button class="mini ${ok ? '' : 'off'}" data-act="buytray">${ok ? 'কিনি' : 'কয়েন কম'}</button>` : '<em class="soon">আগের ট্রে আগে</em>'}</div>`; };
  return trayInfoHTML() + `<div class="pgrid">${Array.from({ length: Math.max(TRAY_MAX, trayN()) }, (_, k) => card(k + 1)).join('')}</div><p class="tnote">পাঠ করে কয়েন জমালে তবেই নতুন ট্রে আর নতুন জিনিস কেনা যায় 🌸</p>`;
}
function shopHTML() {
  const cat = N.scat || 'f', have = it => S.owned.includes(it.id), full = trayFull();
  const card = it => { const ok = (S.coins || 0) >= it.p && !full;
    return `<div class="pcard ${have(it) ? 'own' : ''}"><img src="${NIMG[it.id]}" alt=""><b>${it.n}</b>${have(it) ? '<em>✓ আছে</em>' : `<span class="pr">${COIN} ${it.p}</span><button class="mini ${ok ? '' : 'off'}" data-act="buy" data-id="${it.id}">${full && !ROOMS.includes(it.id) ? 'ট্রে ফুল' : 'কিনি'}</button>`}</div>`; };
  const tabs = SHOP.map(([k, ic, t]) => { const l = k === 'tray' ? null : shopList(k), cn = k === 'tray' ? trayN() + '/' + Math.max(TRAY_MAX, trayN()) : l.filter(have).length + '/' + l.length; return `<button class="stab ${cat === k ? 'on' : ''}" data-act="scat" data-v="${k}"><span class="si2">${ico(ic)}</span><b>${t}</b><small>${cn}</small></button>`; }).join('');
  const l = cat === 'tray' ? [] : shopList(cat), srt = a => [...a].sort((x, y) => have(x) - have(y));
  const body = cat === 'tray' ? trayShopHTML() : (cat === 'room' ? '' : trayInfoHTML()) + (cat === 'room' ? `<div class="pgrid">${srt(l).map(card).join('')}</div>`
    : [...new Set(l.map(i => i.g))].map(g => `<h3 class="disp gh2">${gName(g, cat)}</h3><div class="pgrid">${srt(l.filter(i => i.g === g)).map(card).join('')}</div>`).join(''));
  return `<div class="stabs">${tabs}</div>${body}`;
}
function nookHTML() {
  return `<div class="nk-top"><div class="seg"><button class="${N.tab === 'room' ? 'on' : ''}" data-act="ntab" data-v="room">🏡 My Room</button><button class="${N.tab === 'shop' ? 'on' : ''}" data-act="ntab" data-v="shop">🛒 Cozy Shop</button></div><div class="coin">${COIN} ${S.coins || 0}</div></div>` + (N.tab === 'shop' ? shopHTML() : roomHTML());
}

/* ---- ঘর বদল (স্লাইড / অ্যারো) ---- */
function roomGo(i) { const c = $('#rcar'); if (!c) return; i = Math.max(0, Math.min(ROOMS.length - 1, i)); const p = c.children[i]; c.scrollTo({ left: p.offsetLeft - (c.clientWidth - p.offsetWidth) / 2, behavior: 'smooth' }); }
function restoreCar() { if (N.sel && !document.getElementById('qm')) N.sel = null; const c = document.getElementById('rcar'); if (c && c.children[N.ri]) { const p = c.children[N.ri]; c.scrollLeft = p.offsetLeft - (c.clientWidth - p.offsetWidth) / 2; } }
function syncCar() {
  const c = $('#rcar'); if (!c) return; const mid = c.scrollLeft + c.clientWidth / 2; let b = 0, bd = 1e9;
  [...c.children].forEach((p, i) => { const d = Math.abs(p.offsetLeft + p.offsetWidth / 2 - mid); if (d < bd) { bd = d; b = i; } });
  if (b !== N.ri) { N.ri = b; S.ri = ROOMS[b]; save(); }
  [...c.children].forEach((p, i) => p.classList.toggle('cur', i === b));
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('on', i === b));
  const l = $('.arw.l'), r = $('.arw.r'); if (l) l.classList.toggle('off', b === 0); if (r) r.classList.toggle('off', b === ROOMS.length - 1);
}
let carQ = false;
document.addEventListener('scroll', e => { if (e.target && e.target.id === 'rcar' && !carQ) { carQ = true; requestAnimationFrame(() => { carQ = false; syncCar(); }); } }, true);

function closeQm() { const m = document.getElementById('qm'); if (m) m.remove(); N.sel = null; document.querySelectorAll('.pit.sel').forEach(n => n.classList.remove('sel')); }
function itemSheet(rid, id) {
  N.rid = rid; N.id = id; const el = document.querySelector(`.rpan[data-rid="${rid}"] .pit[data-id="${id}"]`); if (!el) return;
  closeQm(); N.sel = id; el.classList.add('sel'); snd('pop', .6);
  const m = document.createElement('div'); m.id = 'qm'; m.className = 'qm';
  m.innerHTML = '<button class="qb" data-act="isz" data-v="-" aria-label="ছোট">➖</button><button class="qb" data-act="isz" data-v="+" aria-label="বড়">➕</button><button class="qb" data-act="iflip" aria-label="উল্টাও">↔️</button><button class="qb" data-act="itray" aria-label="ট্রেতে">🧺</button><button class="qb" data-act="qmx" aria-label="বন্ধ">✖</button>';
  layer.appendChild(m); iconify(m); const b = el.getBoundingClientRect(), w = m.offsetWidth; let top = b.top - 54; if (top < 70) top = b.bottom + 8;
  m.style.top = top + 'px'; m.style.left = Math.max(6, Math.min(innerWidth - w - 6, b.left + b.width / 2 - w / 2)) + 'px';
}
const cntIn = rid => roomItems(rid).length, one = c => [c ? 1 : 0, 1];
const QUESTS = [
  { id: 'q1', t: 'প্রথম জিনিসটা ঘরে বসাও', r: 5, v: () => [Math.min(placedIds().length, 1), 1] },
  { id: 'q2', t: 'ঘরে 5টা জিনিস সাজাও', r: 10, v: () => [Math.min(placedIds().length, 5), 5] },
  { id: 'q3', t: 'টেবিল বা তাকের ওপর একটা ছোট জিনিস রাখো', r: 10, v: () => one(ROOMS.some(r => roomItems(r).some(q => q.on))) },
  { id: 'q4', t: 'বেডরুমে 10টা জিনিস সাজাও', r: 20, v: () => [Math.min(cntIn('room_pink'), 10), 10] },
  { id: 'q5', t: 'ড্রয়িং রুম কিনে খোলো', r: 15, v: () => one(S.owned.includes('room_green')) },
  { id: 'q6', t: 'ড্রয়িং রুমে একটা সোফা বসাও', r: 15, v: () => one(roomItems('room_green').some(q => q.id === 'd_sofa' || q.id === 'sofa_pink')) },
  { id: 'q7', t: 'কিচেন কিনে খোলো', r: 15, v: () => one(S.owned.includes('room_cream')) },
  { id: 'q8', t: 'কিচেনে 5টা জিনিস সাজাও', r: 20, v: () => [Math.min(cntIn('room_cream'), 5), 5] },
  { id: 'q9', t: 'ঘরের ছবি তোলো 📷', r: 10, v: () => one(S.pics) },
  { id: 'q10', t: '15টা জিনিস কেনো', r: 20, v: () => [Math.min(S.owned.filter(x => ITEM[x] && ITEM[x].k).length, 15), 15] },
  { id: 'q11', t: 'পাঠ শেষে সারপ্রাইজ স্টিকার পাও 🎁', r: 15, v: () => [Math.min(S.gifts || 0, 1), 1] },
  { id: 'q12', t: 'রাতের মোড চালিয়ে দেখো 🌙', r: 5, v: () => one(S.nightSeen) },
  { id: 'q13', t: 'তিনটা ঘরেই অন্তত 3টা করে জিনিস সাজাও', r: 30, v: () => [ROOMS.filter(r => cntIn(r) >= 3).length, 3] },
  { id: 'q14', t: 'শপ থেকে একটা নতুন ট্রে কেনো 🧺', r: 15, v: () => one(trayN() > 1) }];
const qReady = () => QUESTS.filter(q => !S.qd[q.id] && q.v()[0] >= q.v()[1]).length;
function questSheet() {
  const rows = QUESTS.map(q => { const [c, m] = q.v(), done = c >= m, got = S.qd[q.id]; return `<div class="qrow ${got ? 'got' : ''}"><div>${got ? '✅' : done ? '🎉' : '🎯'} ${q.t}<small>${got ? 'পুরস্কার নেওয়া হয়েছে' : c + '/' + m}</small></div>${got ? '' : done ? `<button class="mini" data-act="qclaim" data-id="${q.id}">${COIN} +${q.r}</button>` : `<span class="qr">${COIN} ${q.r}</span>`}</div>`; }).join('');
  sheet(`<h3>🎯 কোজি কোয়েস্ট</h3><div style="max-height:52vh;overflow:auto;text-align:left;margin:8px 0">${rows}</div><button class="btn" data-act="close">ঠিক আছে</button>`);
}
function musicSheet() {
  const on = S.music !== false;
  sheet(`<h3>🎵 মিউজিক</h3><div class="toggle" style="margin:10px 0"><button class="chip ${on ? 'on' : ''}" data-act="mset" data-v="1">চালু 🎶</button><button class="chip ${!on ? 'on' : ''}" data-act="mset" data-v="0">বন্ধ 🔇</button></div>
  <div style="display:flex;align-items:center;gap:10px;margin:12px 4px"><span>🔈</span><input type="range" id="vol" min="0" max="100" value="${Math.round(VOL() * 100)}" style="flex:1;accent-color:#8fbc7a"><span>🔊</span></div>
  <p style="font-size:14px;color:var(--ink2)">পাঠ শুরু হলে মিউজিক নিজে থেকে আস্তে হয়ে যাবে, যাতে পড়ায় মন বসে 🌿</p><button class="btn" data-act="close">ঠিক আছে</button>`);
}
const TIPS = ['এসো এসো! 🍵 এই ছোট্ট কোণটা পুরোটাই তোমার। যেমন খুশি সাজাও।', 'পাঠ শেষ করলেই কয়েন জমে। যত বেশি পাঠ শেষ করবে, তত সুন্দর করে ঘর গোছাতে পারবে 🪙', 'বিছানা আর সোফার মতো বড় জিনিস আগে বসাও, তারপর ছোট জিনিস দিয়ে ঘর ভরিয়ে তোলো 🛋️', 'টেবিল বা বাক্সের ওপর ছোট জিনিস রেখে দেখো, কেমন আপন আপন লাগে! 🍵', 'দেয়ালে ঘড়ি, পর্দা আর ছবি ঝুলিয়ে দাও, ঘর হেসে উঠবে 🖼️', 'ভুল করলে ভেবো না। ভুলের খাতায় জমা থাকে, আবার চেষ্টা করলেই ঠিক হয়ে যাবে 📒', 'ঘর গোছানো শেষ? ছবি বাটনে চেপে ঘরের ছবি তুলে বন্ধুদের দেখাও 📷', 'নতুন ঘর খুলতে কয়েন লাগে। বেডরুম সাজানো হলে ড্রয়িং রুম আর কিচেনও সাজিয়ে ফেলো 🌸', 'মাঝে মাঝে পাঠ শেষ করলে একটা সারপ্রাইজ স্টিকারও মেলে, তাই রোজ একটু করে পড়ো 🎁', 'চিমটা ধরে স্টিকারের ওপর কয়েক মুহূর্ত রাখলেই ও তুলে নেবে। চেষ্টা করে দেখো! 🥢', 'ফুলগাছ আর বইয়ের পাশে বসে ইংরেজি পড়তে কী যে ভালো লাগে! 🌿', '🎯 কোয়েস্টে ছোট ছোট লক্ষ্য পূরণ করলেই কয়েন মেলে। একবার দেখে নাও!', 'রাতের মোড চালিয়ে দেখো, ল্যাম্প আর ফানুসগুলো কেমন জ্বলে ওঠে 🌙'];
function cozyDialog() {
  const left = NOOK.items.concat(NOOK.rooms).filter(i => !i.sp && !S.owned.includes(i.id)).map(i => i.p), cheap = left.length ? Math.min(...left) : 9999, can = (S.coins || 0) >= cheap;
  const msg = can && Math.random() < .6 ? `তোমার ${S.coins} কয়েন জমেছে! মার্কেটে গিয়ে নতুন কিছু আনবে নাকি? 🛒` : rnd(TIPS);
  sheet(`<div class="center">${mascot(92, 'happy', true)}</div><div style="font-family:'Baloo Da 2',sans-serif;font-weight:800;color:var(--peach-d)">বাঁধন ভাইয়া</div><div class="bubble" style="margin:8px 0 14px">${msg}</div>${can ? '<button class="btn" data-act="tomarket">মার্কেটে যাই 🛒</button>' : '<button class="btn" data-act="home">পাঠ করে কয়েন জমাই 🪙</button>'}<button class="btn ghost" data-act="close">ঠিক আছে ভাইয়া 🌸</button>`);
}
/* ===== v1.3.5: সুন্দর শেয়ার-কার্ড (দিনে পতাকার মালা, রাতে জ্বলা আলো ও জোনাকি) ===== */
const cvMk = (w, h) => { const o = document.createElement('canvas'); o.width = Math.max(1, Math.ceil(w)); o.height = Math.max(1, Math.ceil(h)); return o; };
function cvTint(img, w, h, mul) {
  const o = cvMk(w, h), x = o.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, o.width, o.height);
  x.globalCompositeOperation = 'multiply'; x.fillStyle = typeof mul === 'function' ? mul(x, o.width, o.height) : mul; x.fillRect(0, 0, o.width, o.height);
  x.globalCompositeOperation = 'destination-in'; x.drawImage(img, 0, 0, o.width, o.height); return o;
}
function cvRR(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function cvGlow(c, x, y, rx, ry, stops, op, mode) {
  c.save(); c.translate(x, y); c.scale(1, ry / rx); if (mode) c.globalCompositeOperation = mode; if (op != null) c.globalAlpha = op;
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); stops.forEach(([p, col]) => g.addColorStop(p, col)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, Math.PI * 2); c.fill(); c.restore();
}
function cvSpark(c, x, y, r, col, a) { c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); for (let k = 0; k < 8; k++) { const t = k * Math.PI / 4 - Math.PI / 2, rr = k % 2 ? r * .28 : r; c.lineTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr); } c.closePath(); c.fill(); c.restore(); }
function cvHeart(c, x, y, sz, col, a) { c.save(); c.globalAlpha = a; c.fillStyle = col; c.translate(x, y); c.beginPath(); c.moveTo(0, sz * .35); c.bezierCurveTo(-sz * .95, -sz * .15, -sz * .5, -sz * .9, 0, -sz * .4); c.bezierCurveTo(sz * .5, -sz * .9, sz * .95, -sz * .15, 0, sz * .35); c.fill(); c.restore(); }
function cvFit(c, txt, weight, size, fam, maxW, min) { let f = size; c.font = `${weight} ${f}px ${fam}`; while (c.measureText(txt).width > maxW && f > (min || 18)) { f -= 1; c.font = `${weight} ${f}px ${fam}`; } return f; }
async function savePic() {
  const rid = ROOMS[N.ri]; if (!S.owned.includes(rid)) return toast('এই ঘরটা এখনো কেনা হয়নি 🔒');
  toast('ছবি বানাচ্ছি… 📷');
  const night = !!S.night, L = roomItems(rid), rm = ITEM[rid];
  const CW = 1080, CH = 1560, RW = 800, RH = Math.round(RW / AR), RX = (CW - RW) / 2, RY = 250;
  const FB = '"Baloo Da 2","Hind Siliguri",sans-serif', FH = '"Hind Siliguri","Baloo Da 2",sans-serif';
  const ld = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const bg = await ld(NIMG[rid]), im = {}, ex = {};
  await Promise.all(L.map(async q => { if (!im[q.id]) im[q.id] = await ld(NIMG[q.id]); }));
  await Promise.all(['ma_happy', night ? 'hud_moon' : 'hud_sun'].map(async k => { ex[k] = await ld('assets/img/' + k + '.webp'); }));
  try { await Promise.all(['800 40px "Baloo Da 2"', '700 28px "Baloo Da 2"', '500 28px "Hind Siliguri"'].map(f => document.fonts.load(f, 'আবকম Badhon 0'))); await document.fonts.ready; } catch (e) {}
  const cv = cvMk(CW, CH), c = cv.getContext('2d'); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  const rnd = rngSeed(hashStr(rid + (S.name || '') + L.length));
  /* আকাশ / দেয়ালের রং */
  const g = c.createLinearGradient(0, 0, 0, CH);
  if (night) { g.addColorStop(0, '#2D2868'); g.addColorStop(.38, '#4B3F8C'); g.addColorStop(.72, '#7C5A9E'); g.addColorStop(1, '#B97C98'); }
  else { g.addColorStop(0, '#FFF7EA'); g.addColorStop(.5, '#FFEBDD'); g.addColorStop(1, '#FFDACB'); }
  c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  cvGlow(c, CW / 2, RY + RH * .5, 640, 720, night ? [[0, '#FFB87499'], [.55, '#FFB87433'], [1, '#FFB87400']] : [[0, '#FFE6BCdd'], [.6, '#FFE6BC55'], [1, '#FFE6BC00']]);
  /* তারা / কনফেটি — ঘরের ষড়ভুজের বাইরে */
  const HEX = [[50, 1], [97, 26], [97, 74], [50, 99], [3, 74], [3, 26]];
  const free = (x, y) => !inPoly((x - RX) / RW * 100, (y - RY) / RH * 100, HEX) && !(y > 105 && y < 255 && x > 130 && x < 950) && !(y > 1240);
  const pal = night ? ['#FFFFFF', '#FFF1C2', '#FFD9EC'] : ['#FFB7C5', '#FFD98A', '#B7DDA8', '#BCD8F2', '#F4C2E0'];
  for (let k = 0, n = 0, want = night ? 80 : 36; n < want && k < 900; k++) {
    const x = 18 + rnd() * (CW - 36), y = 110 + rnd() * (CH - 140); if (!free(x, y)) continue; n++;
    const col = pal[Math.floor(rnd() * pal.length)], t = rnd();
    if (night) { if (t < .12) cvSpark(c, x, y, 7 + rnd() * 8, col, .85); else { c.globalAlpha = .45 + rnd() * .5; c.fillStyle = col; c.beginPath(); c.arc(x, y, 1.2 + rnd() * 2.4, 0, 7); c.fill(); c.globalAlpha = 1; } }
    else if (t < .4) { c.globalAlpha = .6 + rnd() * .3; c.fillStyle = col; c.beginPath(); c.arc(x, y, 5 + rnd() * 6, 0, 7); c.fill(); c.globalAlpha = 1; }
    else if (t < .72) cvSpark(c, x, y, 11 + rnd() * 8, col, .85); else cvHeart(c, x, y, 10 + rnd() * 6, col, .8);
  }
  /* ওপরে দিনে পতাকার মালা, রাতে জ্বলা ফেয়ারি লাইট */
  const sy = x => 14 + 38 * Math.sin(Math.PI * x / CW), sl = x => 38 * Math.PI / CW * Math.cos(Math.PI * x / CW);
  c.strokeStyle = night ? '#E8D6B0' : '#C9A98C'; c.lineWidth = 3; c.beginPath(); for (let x = -10; x <= CW + 10; x += 10) c.lineTo(x, sy(x)); c.stroke();
  const NF = 11, fl = ['#FFB7C5', '#FFD98A', '#B7DDA8', '#BCD8F2', '#F4C2E0'];
  for (let k = 0; k < NF; k++) {
    const x = (k + .5) * CW / NF, y = sy(x);
    if (night) { cvGlow(c, x, y + 15, 34, 34, [[0, '#FFF3C2ff'], [.3, '#FFD66bAA'], [1, '#FFD66b00']], 1, 'screen'); c.fillStyle = '#FFF4C4'; c.beginPath(); c.ellipse(x, y + 14, 6.5, 9, 0, 0, 7); c.fill(); }
    else { c.save(); c.translate(x, y); c.rotate(Math.atan(sl(x))); c.fillStyle = fl[k % 5]; c.beginPath(); c.moveTo(-26, 0); c.lineTo(26, 0); c.lineTo(0, 50); c.closePath(); c.fill(); c.restore(); }
  }
  /* শিরোনাম + ঘরের নাম */
  const nm = (S.name || '').trim().slice(0, 14), title = nm ? nm + '-এর Cozy Room' : 'আমার Cozy Room';
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  cvFit(c, title, 800, 68, FB, 780, 40); c.fillStyle = night ? '#FFF1DE' : '#4B3326';
  c.save(); if (night) { c.shadowColor = 'rgba(15,8,40,.45)'; c.shadowBlur = 10; c.shadowOffsetY = 3; } c.fillText(title, CW / 2, 172); c.restore();
  const chipT = rm.e + ' ' + rm.n; cvFit(c, chipT, 700, 32, FB, 400, 22); const cwid = c.measureText(chipT).width + 60;
  cvRR(c, CW / 2 - cwid / 2, 196, cwid, 52, 26); c.fillStyle = night ? 'rgba(255,255,255,.17)' : '#FFE0E7'; c.fill(); c.fillStyle = night ? '#FFE9C9' : '#8B4A5A'; c.fillText(chipT, CW / 2, 233);
  const sun = ex[night ? 'hud_moon' : 'hud_sun']; if (sun) { if (night) cvGlow(c, 1000, 140, 80, 80, [[0, '#FFF3C2aa'], [1, '#FFF3C200']]); c.drawImage(sun, 954, 96, 92, 92); }
  /* ঘরের মাটির ছায়া */
  /* v1.7.1: ঘরের নিচের ছায়া সরানো (অ্যাপে নেই, ছবিতেও থাকবে না) */
  /* ঘর: রাতে দেয়াল-মেঝে গোধূলির রঙে গাঢ় */
  if (bg) c.drawImage(night ? cvTint(bg, RW, RH, (x, w, h) => { const q = x.createRadialGradient(w * .5, h * .6, 0, w * .5, h * .6, w * .8); q.addColorStop(0, '#A28ECB'); q.addColorStop(.58, '#7863AE'); q.addColorStop(1, '#5A4A92'); return q; }) : bg, RX, RY, RW, RH);
  [...L].sort((a, b) => zOf(a, L) - zOf(b, L)).forEach(q => {
    const it = ITEM[q.id], i = im[q.id]; if (!i) return;
    const sw = it.w * (q.s || 1), w = RW * sw / 100, h = w * it.r, top = RY + RH * q.y / 100 - ancY(it) * h, cx = RX + RW * q.x / 100;
    if (night && it.lt) {   /* আলোর পুকুর — আইটেমের পেছনে */
      if (it.k === 'w' && sw > 20) cvGlow(c, cx, top + h / 2, w * .66, w * .264, [[0, '#FFEFB8aa'], [.48, '#FFE08A55'], [1, '#FFE08A00']], 1, 'screen');
      else { const D = (sw <= 20 ? 37 : sw * 1.3) / 100 * RW, gy = (GLY[q.id] != null ? GLY[q.id] : (it.k === 'w' ? 50 : 36)) / 100, rg = D / 2;
        cvGlow(c, cx, top + gy * h, rg, rg, [[0, '#FFEFC2f0'], [.15, '#FFD98Acc'], [.33, '#FFC76A70'], [.55, '#FFC06A2a'], [.78, '#FFC06A0c'], [1, '#FFC06A00']], .95, 'screen'); }
    }
    /* v1.7.1: আসবাবের নিচের ছায়া সরানো */
    c.save(); c.translate(cx, top + h / 2); if (isFlatW(it)) c.transform(WSX, q.x < 50 ? -WK : WK, 0, 1, 0, 0); const fm = floorM(it, q.fl); if (fm) c.transform(fm[0], fm[1], fm[2], fm[3], 0, 0); else if (q.fl) c.scale(-1, 1);
    if (night && it.lt) {
      c.shadowColor = 'rgba(255,176,71,.75)'; c.shadowBlur = 46; c.drawImage(i, -w / 2, -h / 2, w, h);
      c.shadowColor = '#FFD66B'; c.shadowBlur = 18; c.drawImage(i, -w / 2, -h / 2, w, h);
      c.shadowColor = 'transparent'; c.shadowBlur = 0; c.globalCompositeOperation = 'lighter'; c.globalAlpha = .3; c.drawImage(i, -w / 2, -h / 2, w, h);
    } else if (night) c.drawImage(cvTint(i, w, h, '#DBD6E4'), -w / 2, -h / 2, w, h);
    else c.drawImage(i, -w / 2, -h / 2, w, h);
    c.restore();
  });
  /* রাতের জোনাকি */
  if (night) for (let k = 0; k < 13; k++) { const x = RX + 30 + rnd() * (RW - 60), y = RY + 40 + rnd() * (RH * .8); cvGlow(c, x, y, 15, 15, [[0, '#FFFBD8ff'], [.22, '#FFE27Aee'], [.6, '#FFC25A44'], [1, '#FFC25A00']], .95, 'screen'); }
  /* স্টিকার-ব্যাজ: সাজানো জিনিস + স্ট্রিক/লেভেল */
  const badge = (txt, x, y, rot) => { c.save(); c.translate(x, y); c.rotate(rot); cvFit(c, txt, 700, 30, FB, 270, 20); const bw = c.measureText(txt).width + 50;
    c.shadowColor = 'rgba(70,40,30,.25)'; c.shadowBlur = 14; c.shadowOffsetY = 5; cvRR(c, -bw / 2, -32, bw, 64, 32); c.fillStyle = '#FFFBF3'; c.fill(); c.shadowColor = 'transparent'; c.fillStyle = '#6B4429'; c.fillText(txt, 0, 10); c.restore(); };
  if (L.length) badge(`🛋️ ${L.length}টি জিনিস`, 200, 1172, -.07);
  if ((S.streak || 0) >= 2) badge(`🔥 ${S.streak} দিনের স্ট্রিক`, 880, 1172, .07); else if (LV[S.lvl]) badge(`${LV[S.lvl].e} ${LV[S.lvl].name}`, 880, 1172, .07);
  badge(rkInfo().r.e + ' ' + rkInfo().r.n, 540, 1172, 0);
  /* নিচের কার্ড: বাঁধন + আমন্ত্রণ + লিংক */
  const PX = 60, PY = 1268, PW = 960, PH = 240;
  c.save(); c.shadowColor = night ? 'rgba(15,8,40,.5)' : 'rgba(80,45,30,.26)'; c.shadowBlur = 38; c.shadowOffsetY = 12; cvRR(c, PX, PY, PW, PH, 48); c.fillStyle = '#FFFAF1'; c.fill(); c.restore();
  const lg = c.createLinearGradient(PX, 0, PX + PW, 0); lg.addColorStop(0, '#FFB7C5'); lg.addColorStop(.5, '#FFD98A'); lg.addColorStop(1, '#B7DDA8');
  c.save(); cvRR(c, PX, PY, PW, PH, 48); c.clip(); c.fillStyle = lg; c.fillRect(PX, PY, PW, 9); c.restore();
  if (ex.ma_happy) c.drawImage(ex.ma_happy, PX + 14, PY - 46, 252, 252);
  c.textAlign = 'left'; const TX = PX + 288, TW = PW - 288 - 36;
  c.fillStyle = '#E8876B'; c.font = `800 24px ${FB}`; c.fillText("BADHON'S COZY QUEST", TX, PY + 58);
  cvFit(c, 'ইংরেজি শেখো, ঘর সাজাও!', 800, 46, FB, TW, 28); c.fillStyle = '#4B3326'; c.fillText('ইংরেজি শেখো, ঘর সাজাও!', TX, PY + 112);
  cvFit(c, 'তুমিও বানাও তোমার নিজের Cozy Room 🌸', 500, 29, FH, TW, 18); c.fillStyle = '#8A6E5C'; c.fillText('তুমিও বানাও তোমার নিজের Cozy Room 🌸', TX, PY + 154);
  const lk = appLink().replace(/^https?:\/\//, '').replace(/\?.*$/, '').replace(/\/$/, ''); cvFit(c, lk, 700, 28, FB, TW - 52, 16); const lw = Math.min(TW, c.measureText(lk).width + 52);
  cvRR(c, TX, PY + 172, lw, 52, 26); c.fillStyle = '#FF8A6B'; c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(lk, TX + lw / 2, PY + 208);
  rkFrame(c, CW, CH);
  cv.toBlob(b => { if (!b) return toast('ছবি বানানো গেল না'); S.pics = 1; save(); PIC = b; const url = URL.createObjectURL(b); snd('done');
    sheet(`<h3>📷 ঘরের ছবি</h3><img src="${url}" alt="" style="max-width:100%;max-height:56vh;border-radius:16px;margin:6px 0 8px;box-shadow:0 5px 16px #0003"><div style="font-size:14.5px;color:var(--ink2);margin:0 0 10px">গ্রুপে পোস্ট করলে বন্ধুরাও নিজের ঘর সাজাতে শুরু করবে 🌸${isInApp() ? '<br><small>ডাউনলোড না হলে ছবিটা চেপে ধরে “Save image” দাও</small>' : ''}</div><button class="btn" data-act="picdl">⬇️ ডাউনলোড করো</button><button class="btn peach" data-act="picsave">📤 শেয়ার করো</button><button class="btn ghost" data-act="piccap">📋 ক্যাপশন কপি করো</button><button class="btn ghost" data-act="close">বন্ধ করো</button>`); PICURL = url; }, 'image/png');
}
const picCaption = () => 'আমার Cozy Room 🌸 English শিখতে শিখতে ঘর সাজাচ্ছি! তুমিও সাজিয়ে দেখো 👉 ' + appLink().replace(/\?src=[^&]*/, '') + '?src=roomshare';
let PIC = null, PICURL = '';
function picDl() {
  if (!PIC) return; track('room_download');
  try { const a = document.createElement('a'); a.href = PICURL || URL.createObjectURL(PIC); a.download = 'my-cozy-room.png'; document.body.appendChild(a); a.click(); a.remove(); toast('ছবি ডাউনলোড হচ্ছে ✅'); } catch (e) { toast('ডাউনলোড হলো না, ছবিটা চেপে ধরে সেভ করো'); }
}
function picOut() {
  if (!PIC) return; const f = new File([PIC], 'my-cozy-room.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [f] })) { track('room_share'); navigator.share({ files: [f], title: 'My Cozy Room', text: 'আমার Cozy Room 🌸 তুমিও সাজিয়ে দেখো: ' + appLink().replace(/\?src=[^&]*/, '') + '?src=roomshare' }).catch(() => {}); }
  else { const a = document.createElement('a'); a.href = PICURL; a.download = 'my-cozy-room.png'; document.body.appendChild(a); a.click(); a.remove(); toast('ছবি সেভ হয়েছে ✅'); }
}
function nookAct(act, i, v, id) {
  if (act === 'ntab') { N.tab = v; render(); toTop(); }
  else if (act === 'cat') { N.cat = v; N.ti = 0; render(); }
  else if (act === 'trprev') trayGo(N.ti - 1); else if (act === 'trnext') trayGo(N.ti + 1);
  else if (act === 'trayshop') { closeSheet(); N.tab = 'shop'; N.scat = 'tray'; render(); toTop(); }
  else if (act === 'buytray') {
    if (trayN() >= TRAY_MAX) return toast('সব ট্রে কেনা হয়ে গেছে');
    const n = trayN() + 1, pr = TRAY_PRICE[n - 1];
    if ((S.coins || 0) < pr) return sheet(`<div class="big">${COIN}</div><h3>কয়েন কম পড়ছে</h3><p>ট্রে ${bn(n)}-এর জন্য আরও ${pr - (S.coins || 0)} কয়েন লাগবে। পাঠ করলেই কয়েন জমে!</p><button class="btn" data-act="home">পাঠ করে কয়েন জমাই</button><button class="btn ghost" data-act="close">ঠিক আছে</button>`);
    S.coins -= pr; S.trays = n; N.ti = n - 1; save(); snd('purchase', .8); render();
    sheet(`<div class="center">${mascot(90, 'cheer', true)}</div><h3>নতুন ট্রে পেলে! 🎉</h3><p>ট্রে ${bn(n)} খুলে গেছে। এখন আরও ${bn(TRAY_CAP)}টা জিনিস রাখতে পারবে।</p><button class="btn" data-act="ntab" data-v="room">ঘরে যাই</button><button class="btn ghost" data-act="close">আরও দেখি</button>`); petals();
  }
  else if (act === 'scat') { N.scat = v; render(); }
  else if (act === 'rprev') roomGo(N.ri - 1); else if (act === 'rnext') roomGo(N.ri + 1); else if (act === 'rgo') roomGo(i);
  else if (act === 'tomarket') { closeSheet(); N.tab = 'shop'; if (trayFull()) N.scat = 'tray'; render(); }
  else if (act === 'undo') { if (!N.undo.length) return; const pr = JSON.parse(N.undo[N.undo.length - 1]), pid = Object.values(pr).reduce((a, l) => a.concat(l.map(q => q.id)), []); if (S.owned.filter(x => ITEM[x] && ITEM[x].k && !pid.includes(x)).length > trayN() * TRAY_CAP) return trayFullSheet('return'); N.undo.pop(); S.rooms = pr; save(); snd('back'); render(); toast('↩️ ফিরিয়ে দিলাম'); }
  else if (act === 'pic') savePic(); else if (act === 'picdl') picDl();
  else if (act === 'picsave') picOut();
  else if (act === 'piccap') { const t = picCaption(); track('room_caption'); const ok = () => toast('ক্যাপশন কপি হয়েছে ✅ এবার পোস্টে পেস্ট করো'); const old = () => { try { const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ok(); } catch (e) { toast('কপি হলো না 😅'); } }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, old); else old(); }
  else if (act === 'help') sheet(`<div class="center">${mascot(72, 'happy', true)}</div><h3>স্টিকার সাজানো ✨</h3>
    <div class="gst"><b>1️⃣</b><div>ট্রে থেকে স্টিকারে আঙুল রেখে <b>ওপরে টানো</b>। অথবা <b>চিমটা</b> ধরে টেনে স্টিকারের ওপর কিছুক্ষণ রাখো, ও তুলে নেবে!</div></div>
    <div class="gst"><b>2️⃣</b><div>ঘরে যেখানে খুশি নিয়ে যাও। সবুজ আলো জ্বললে জায়গা ঠিক আছে। ছোট জিনিস <b>টেবিল, বাক্স আর তাকের ওপরেও</b> বসে।</div></div>
    <div class="gst"><b>3️⃣</b><div>ঘর বদলাতে ডানে-বাঁয়ে <b>স্লাইড</b> করো বা ‹ › চাপো। নতুন ঘর কয়েন দিয়ে কিনতে হয়।</div></div>
    <div class="gst"><b>🔁</b><div>বসানো জিনিসে <b>ট্যাপ</b> করলেই পাশে ➖ ➕ ↔️ 🧺 বাটন আসে। দুই আঙুলে চিমটি কেটেও ছোট-বড় হয়। ভুল হলে ↩️ আনডু।</div></div><div class="gst"><b>🖼️</b><div>দেয়ালের ঘড়ি, ছবি, জানালা দেয়ালে নিজে থেকে দেয়ালের ঢালে লেগে যায়। ঝুলন্ত গাছ আর ফানুস শূন্যে ঝোলে।</div></div><div class="gst"><b>🍵</b><div>চায়ের কাপ, ঘড়ি, জারের মতো ছোট জিনিস শুধু টেবিল বা তাকের ওপর বসে, নিজে থেকে জায়গায় লেগে যায়।</div></div><div class="gst"><b>🧺</b><div>প্রতি ট্রেতে 6টা জায়গা। ভরলে পরের ট্রেতে যায়, ডানে-বাঁয়ে স্লাইড করো। নতুন ট্রে শপের <b>ট্রে</b> ট্যাব থেকে কয়েন দিয়ে কেনা যায়।</div></div><div class="gst"><b>🏠</b><div>মেঝের জিনিস নিজে থেকে মেঝের ভেতরে আর দেয়াল ঘেঁষে বসে। সবুজ জায়গাটা দেখায় কোথায় রাখা যাবে।</div></div><button class="btn" data-act="close">বুঝেছি!</button>`);
  else if (act === 'music') musicSheet();
  else if (act === 'isz') { const q = roomItems(N.rid).find(z => z.id === N.id); if (q) { pushUndo(); q.s = Math.min(2.2, Math.max(.5, +((q.s || 1) + (v === '+' ? .15 : -.15)).toFixed(2))); resnap(N.rid); save(); render(); itemSheet(N.rid, N.id); } }
  else if (act === 'iflip') { const q = roomItems(N.rid).find(z => z.id === N.id); if (q) { pushUndo(); q.fl = !q.fl; resnap(N.rid); save(); render(); itemSheet(N.rid, N.id); } }
  else if (act === 'itray') { const need = 1 + roomItems(N.rid).filter(z => z.on === N.id).length; if (unplacedList().length + need > trayN() * TRAY_CAP) { closeQm(); return trayFullSheet('return'); } pushUndo(); removeWithKids(N.rid, N.id); save(); snd('remove'); closeSheet(); render(); }
  else if (act === 'buy') {
    const it = ITEM[id]; if (!it || S.owned.includes(id)) return;
    if (!ROOMS.includes(id) && trayFull()) return trayFullSheet('buy');
    if ((S.coins || 0) < it.p) return sheet(`<div class="big">${COIN}</div><h3>কয়েন কম পড়ছে</h3><p>আরও ${it.p - (S.coins || 0)} কয়েন লাগবে। পাঠ করলেই কয়েন জমে!</p><button class="btn" data-act="close">ঠিক আছে</button>`);
    S.coins -= it.p; S.owned.push(id); save(); snd('purchase', .8);
    if (ROOMS.includes(id)) { N.ri = ROOMS.indexOf(id); S.ri = id; N.tab = 'room'; save(); render(); sheet(`<div class="center">${mascot(90, 'cheer', true)}</div><h3>${ico(ROOM_IC[id])} ${it.n} খুলে গেছে! 🎉</h3><p>এখন নিজের মতো করে সাজিয়ে ফেলো।</p><button class="btn" data-act="close">সাজাই!</button>`); petals(); return; }
    render(); const fullNow = trayFull(), more = trayN() < TRAY_MAX;
    sheet(`<div class="center">${mascot(90, 'cheer', true)}</div><h3>কেনা হলো! 🎉</h3><p>${it.n} এখন তোমার। ঘরে বসিয়ে দেখো কেমন লাগে!</p>${fullNow ? `<p class="trnote">🧺 ট্রে এখন ভরে গেল! ${more ? 'আরও জিনিস আনতে শপে গিয়ে ট্রে কিনে আনো।' : 'আরও জিনিস আনতে আগে কিছু জিনিস ঘরে সাজাও।'}</p>` : ''}<button class="btn" data-act="ntab" data-v="room">ঘরে যাই</button>${fullNow && more ? '<button class="btn ghost" data-act="trayshop">ট্রে কিনি</button>' : ''}<button class="btn ghost" data-act="close">আরও দেখি</button>`);
  }
}
const KEY = 'badhons_nook_v01';
const defaults = () => ({ name: '', cls: '', lvl: '', stats: true, xp: 0, streak: 0, lastDay: '', dayKey: '', dayXp: 0, progress: {}, mistakes: [], sound: true, tut: false, coins: 0, owned: ['room_pink'], trays: 1, items: [], rooms: {}, dry: 0, notes: [], music: true, theme: 'room_pink' });
function load() { try { const r = localStorage.getItem(KEY); return r ? Object.assign(defaults(), JSON.parse(r)) : defaults(); } catch (e) { return defaults(); } }
let S = load();

function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
try { const q = new URLSearchParams(location.search).get('src'); if (q && !S.src) { S.src = q.slice(0, 40).replace(/[^\w\-.]/g, ''); save(); } } catch (e) {}

const dkey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const yKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dkey(d); };
const shownStreak = () => (S.lastDay === dkey() || S.lastDay === yKey()) ? S.streak : 0;
const todayXp = () => S.dayKey === dkey() ? S.dayXp : 0;
function addXp(n, extra = 0) { const k = dkey(); if (S.dayKey !== k) { S.dayKey = k; S.dayXp = 0; } S.dayXp += n; S.xp += n; S.coins = (S.coins || 0) + n + extra; }
function touchStreak() { const k = dkey(); (S.days = S.days || {})[dk()] = 1; if (S.lastDay === k) return; S.streak = (S.lastDay === yKey()) ? S.streak + 1 : 1; S.lastDay = k; }
const level = () => Math.floor(S.xp / 100) + 1;
const TITLES = ['নতুন চা-পাতা', 'মিষ্টি কুঁড়ি', 'ফুটন্ত ফুল', 'বাঁধনের প্রিয় বন্ধু', 'ইংলিশ তারকা'];

/* ============ Cozy sound (kalimba-style plucks, no voice) ============ */
let AC = null;
const PENT = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
function pluck(f, d = .5, v = .08, when = 0, type = 'sine') {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const t = AC.currentTime + when, o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), g2 = AC.createGain();
    o.type = type; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2.01; g2.gain.value = .22;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(AC.destination);
    o.start(t); o2.start(t); o.stop(t + d + .05); o2.stop(t + d + .05);
  } catch (e) {}
}
const sfx = {
  tap: () => snd('ui_click', .5),
  good: n => { const k = Math.min(Math.max(n - 1, 0), PENT.length - 2); pluck(PENT[k], .5, .08); pluck(PENT[k + 1], .6, .07, .09); },
  bad: () => snd('wrong', .85),
  soft: () => { pluck(233, .4, .07, 0, 'triangle'); pluck(196, .5, .06, .13, 'triangle'); },
  win: () => [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => pluck(f, .7, .07, i * .11)),
  lose: () => snd('lose', .9),
  hello: () => { pluck(659.25, .6, .06); pluck(880, .8, .06, .14); }
};
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

/* ============ Mascot (expressions) ============ */
function mascot(px = 56, ex = 'ask', hop = false) {
  const st = `width:${px}px;height:${px}px`, cls = 'mascot' + (hop ? ' hop' : '') + (MASCOT.images[ex] ? ' pic' : '');
  if (MASCOT.images[ex]) return `<img class="${cls}" style="${st}" src="${MASCOT.images[ex]}" alt="বাঁধন ভাইয়া">`;
  if (MASCOT.sheet) {
    const n = MASCOT.order.length, k = Math.max(0, MASCOT.order.indexOf(ex)), pos = n > 1 ? (k / (n - 1)) * 100 : 0;
    return `<span class="${cls} spr" style="${st};background-image:url(${MASCOT.sheet});background-size:${n * 100}% 100%;background-position:${pos}% 50%" role="img" aria-label="বাঁধন ভাইয়া"></span>`;
  }
  return `<span class="${cls} ph" style="${st};font-size:${Math.round(px * .5)}px" role="img" aria-label="বাঁধন ভাইয়া">${EXPR_EMOJI[ex] || '🙂'}</span>`;
}

/* ============ Content ============ */
/* Badhon's Cozy Quest — content v1.1
   লেভেল: Beginner / Medium / Higher / Pro
   প্রশ্ন বদলালে ID (পাঠ:ক্রম) ঠিক রাখতে পুরোনো প্রশ্নের জায়গায় জায়গায় বদল করা হয়েছে। */
const pick = (word, ans, opts, tip) => ({ t: 'pick', word, ans, opts, tip });
const wtr = (en, ans, opts, tip) => ({ t: 'wtr', en, ans, opts, tip });
const tr = (bn, ans, opts, tip) => ({ t: 'tr', bn, ans, opts, tip });
const fill = (s, ans, opts, tip) => ({ t: 'fill', s, ans, opts, tip });
const ord = (bn, words, extra, tip, alt) => ({ t: 'ord', bn, words, extra, tip, alt: alt || [] });
const mat = (pairs, tip) => ({ t: 'mat', pairs, tip });
const mcq = (p, ans, opts, tip) => ({ t: 'mcq', p, ans, opts, tip });
const typ = (bn, ans, tip) => ({ t: 'typ', bn, ans, tip });
const hear = (say, ask, ans, opts, tip) => ({ t: 'lis', say, ask, ans, opts, tip });
const chat = (lines, ans, opts, tip) => ({ t: 'chat', lines, ans, opts, tip });
const err = (s, bad, fix, tip) => ({ t: 'err', s, bad, fix, tip });
const clz = (p, bank, ans, tip) => ({ t: 'cloze', p, bank, ans, tip });

const LEVELS = [
  { k: 'beg', name: 'Beginner', e: '🌱', sub: 'একদম নতুন বা ছোটদের জন্য, ইংরেজির ABC থেকে খুব সহজ শুরু', hint: 'একদম নতুন? এখান থেকেই শুরু', bonus: 0, tag: '🧒 For Kids' },
  { k: 'med', name: 'Medium', e: '🌿', sub: 'বেসিক জানা আছে, এবার বাক্য আর গ্রামারের নিয়ম মজবুত করার জন্য', hint: 'বাক্য গড়া, tense আর preposition', bonus: 5, tag: '⭐ Recommended' },
  { k: 'high', name: 'Higher', e: '🌸', sub: 'পরীক্ষা আর আত্মবিশ্বাসের জন্য, কঠিন গ্রামার ও শব্দভাণ্ডার', hint: 'পরীক্ষার প্রস্তুতির উপযোগী', bonus: 10 },
  { k: 'pro', name: 'Pro', e: '🏆', sub: 'ইংরেজিতে দক্ষতা আছে, তবুও নিজেকে ঘষামাজা করে নিতে চাও', hint: 'কঠিন শব্দ, ইডিয়ম আর সূক্ষ্ম ভুল ধরার চ্যালেঞ্জ', bonus: 16 }
];
const LV = {}; LEVELS.forEach(l => LV[l.k] = l);

/* img = আগের ছবি (un_N.webp); না থাকলে emoji দেখাবে */
const UNITS = {
  beg: [
    { title: 'খাবার-দাবার', sub: 'ভাত, মাছ, চা আর বিরিয়ানি', cls: 'u0', img: 0 },
    { title: 'ঢাকার রাস্তা', sub: 'রিকশা, বাস আর জ্যাম', cls: 'u1', img: 1 },
    { title: 'হ্যালো, কেমন আছো?', sub: 'শুভেচ্ছা আর নিজের পরিচয়', cls: 'u2', img: 2 },
    { title: 'রঙ, সংখ্যা আর পশুপাখি', sub: 'রঙিন দুনিয়া আর গোনা শেখা', cls: 'u0', e: '🎨' },
    { title: 'আপনজন আর রোজকার দিন', sub: 'পরিবার আর সারাদিনের রুটিন', cls: 'u1', e: '🏡' },
    { title: 'স্কুলব্যাগের ভেতরে', sub: 'বই, কলম আর ক্লাসরুম', cls: 'u2', e: '🎒' },
    { title: 'কান খাড়া! শুনে শেখো', sub: 'শুনে বুঝে উত্তর দাও, আর ছোট ভদ্র কথা', cls: 'u0', e: '🎧' }
  ],
  med: [
    { title: 'ফোন আর ইন্টারনেট', sub: 'Present tense, article, ফেসবুক-ইউটিউব', cls: 'u0', img: 3 },
    { title: 'ক্রিকেট আর আড্ডা', sub: 'Past, future আর preposition', cls: 'u1', img: 4 },
    { title: 'স্কুল আর কোচিং', sub: 'Modal, তুলনা আর perfect tense', cls: 'u2', img: 5 },
    { title: 'প্রশ্ন আর বর্ণনা', sub: 'Question word, adjective আর adverb', cls: 'u0', e: '❓' },
    { title: 'জায়গা আর পরিমাণ', sub: 'Preposition of place, much-many-few-little', cls: 'u1', e: '📍' },
    { title: 'দোকানে দরদাম', sub: 'Shopping, price আর ভদ্র অনুরোধ', cls: 'u2', e: '🛒' },
    { title: 'শোনা আর ফোনে কথা', sub: 'শুনে ধরো, ঠিক-ভুল, ফোনের ইংরেজি', cls: 'u0', e: '📱' }
  ],
  high: [
    { title: 'টেনস টাইম', sub: 'সব tense আর subject-verb agreement', cls: 'u0', img: 6 },
    { title: 'রাইট ফর্ম আর ভয়েস', sub: 'Gerund, infinitive আর passive', cls: 'u1', img: 7 },
    { title: 'যদি-তাহলে আর আরও', sub: 'Conditional, modal, preposition', cls: 'u2', img: 8 },
    { title: 'গ্রামার আর ভোকাব', sub: 'Advanced grammar, synonym-antonym', cls: 'u0', img: 9 },
    { title: 'ফ্রেজাল ভার্ব আর নেরেশন', sub: 'Phrasal verb, reported speech', cls: 'u1', img: 10 },
    { title: 'এরর হান্টার', sub: 'ভুল ধরো, ফাইনাল বস', cls: 'u2', img: 11 },
    { title: 'বাক্য বদলের খেলা', sub: 'Passive, too...to, connector আর transformation', cls: 'u0', e: '🔄' },
    { title: 'শুনে ধরো, ঠিক-ভুল', sub: 'Listening, reported speech আর কঠিন ফাঁদ', cls: 'u1', e: '🎯' }
  ],
  pro: [
    { title: 'ধারালো গ্রামার', sub: 'সূক্ষ্ম tense আর advanced structure', cls: 'u0', e: '⚔️' },
    { title: 'শব্দের জাদু', sub: 'কঠিন শব্দ, ইডিয়ম আর collocation', cls: 'u1', e: '✨' },
    { title: 'ঝকঝকে ইংরেজি', sub: 'Confusing word, error hunt, formal English', cls: 'u2', e: '💎' },
    { title: 'রিডিং কর্নার', sub: 'ছোট গল্প পড়ো, উত্তর খোঁজো', cls: 'u0', e: '📖' },
    { title: 'বাংলিশ ফাঁদ', sub: 'বাংলা-ঘেঁষা ভুল ধরো, ঝকঝকে ইংরেজি বলো', cls: 'u1', e: '🪤' },
    { title: 'শব্দের ধার', sub: 'Idiom শুনে শেখো, অর্থ ধরো', cls: 'u2', e: '🎭' }
  ]
};

const LESSONS = [];
const BMAP = { A: 'beg', B: 'med', C: 'high', D: 'high', P: 'pro' };
const L = (id, band, unit, title, emoji, qs) => LESSONS.push({ id, lvl: BMAP[band], unit: band === 'D' ? unit + 3 : unit, title, emoji, qs });

L('l1', 'A', 0, 'ভাত, মাছ, চা', '🍚', [
  pick('rice', '🍚', ['🍚', '🐟', '🥚', '🥭']),
  pick('fish', '🐟', ['🐟', '🍵', '🍞', '🍚']),
  wtr('tea', 'চা', ['চা', 'ডিম', 'আম', 'রুটি'], 'tea মানে চা। ইংরেজিতে চা পান করা হয়, তাই বলি: I drink tea।'),
  wtr('egg', 'ডিম', ['ডিম', 'মাছ', 'ভাত', 'দুধ'], 'egg মানে ডিম। ‘an egg’ বলি, কারণ egg শুরু হয় স্বরধ্বনি দিয়ে।'),
  mat([['ভাত', 'rice'], ['মাছ', 'fish'], ['আম', 'mango'], ['রুটি', 'bread']]),
  tr('আমি ভাত খাই।', 'I eat rice.', ['I eat rice.', 'I eat fish.', 'I drink rice.', 'You eat rice.'], 'ভাত ‘eat’ করা হয়, আর ‘I’ মানে আমি। তাই I eat rice। ‘drink rice’ বললে ভাত হাসবে 😄'),
  ord('আমি চা পান করি।', ['I', 'drink', 'tea'], ['eat', 'rice'], 'চা, দুধ, পানি এসব ‘drink’ করা হয়। আর খাবার ‘eat’ করা হয়।'),
  pick('mango', '🥭', ['🥭', '🍌', '🥛', '🍞'])
]);
L('l2', 'A', 0, 'আমি খাই, আমি চাই', '🍛', [
  fill('I ___ rice every day.', 'eat', ['eat', 'drink', 'go'], 'ভাত ‘eat’ করা হয়। ‘drink rice’ শুনলে ভাত হাসবে 😄'),
  fill('I ___ milk in the morning.', 'drink', ['drink', 'eat', 'read'], 'দুধ, চা, পানি: এগুলোর সাথে ‘drink’।'),
  tr('আমার বিরিয়ানি পছন্দ।', 'I like biryani.', ['I like biryani.', 'I likes biryani.', 'I am like biryani.', 'Biryani like I.'], '‘I’-এর সাথে verb-এ s বসে না: I like। কিন্তু he likes।'),
  ord('আমি একটি আম চাই।', ['I', 'want', 'a', 'mango'], ['eat', 'am'], 'চাই = want।'),
  fill('Biryani is very ___.', 'delicious', ['delicious', 'run', 'blue'], 'Delicious মানে সুস্বাদু।'),
  mat([['খাই', 'eat'], ['পান করি', 'drink'], ['পছন্দ', 'like'], ['চাই', 'want']]),
  tr('সে চা পান করে।', 'He drinks tea.', ['He drinks tea.', 'He drink tea.', 'He drinking tea.', 'He is drinks tea.'], 'He/She/It-এর সাথে verb-এর শেষে s বসে: he drinks।'),
  tr('তুমি কি ভাত খাও?', 'Do you eat rice?', ['Do you eat rice?', 'You do eat rice?', 'Are you eat rice?', 'Do you eats rice?'], 'প্রশ্ন করতে শুরুতে ‘Do’ বসাই, তারপর verb আগের মতোই থাকে: Do you eat?')
]);
L('l3', 'A', 1, 'যানবাহন', '🚌', [
  pick('bus', '🚌', ['🚌', '🚆', '✈️', '🚗']),
  pick('train', '🚆', ['🚆', '🚌', '⛵', '🚗']),
  pick('boat', '⛵', ['⛵', '✈️', '🚗', '🚌']),
  wtr('rickshaw', 'রিকশা', ['রিকশা', 'বাস', 'নৌকা', 'ট্রেন'], 'rickshaw ঠিক আমাদের রিকশাই, বাংলা থেকে ইংরেজিতে চলে গেছে! bus = বাস, boat = নৌকা, train = ট্রেন।'),
  wtr('road', 'রাস্তা', ['রাস্তা', 'সেতু', 'বাজার', 'স্কুল'], 'road মানে রাস্তা। bridge = সেতু, market = বাজার, school = স্কুল।'),
  mat([['বাজার', 'market'], ['সেতু', 'bridge'], ['রাস্তা', 'road'], ['স্কুল', 'school']]),
  tr('বাসটি বড়।', 'The bus is big.', ['The bus is big.', 'The bus big.', 'Bus is bigs.', 'The big is bus.'], 'বাক্যে is লাগে: The bus is big।'),
  pick('plane', '✈️', ['✈️', '🚆', '🚌', '⛵'])
]);
L('l4', 'A', 1, 'কোথায় যাচ্ছ?', '🛺', [
  fill('I go ___ school.', 'to', ['to', 'in', 'by'], 'কোথাও যাওয়া বোঝাতে go to ব্যবহার করি।'),
  fill('I go to school ___ rickshaw.', 'by', ['by', 'to', 'at'], 'বাহনে চড়ে গেলে by: by bus, by rickshaw।'),
  ord('আমি বাসে যাই।', ['I', 'go', 'by', 'bus'], ['to', 'on'], 'বাসে যাই = go by bus।'),
  tr('রাস্তাটা ব্যস্ত (গাড়িতে ভরা)।', 'The road is busy.', ['The road is busy.', 'The road busy is.', 'The road are busy.', 'Road the is busy.'], 'একটি জিনিসের সাথে is: The road is busy।'),
  ord('আমরা বাজারে যাই।', ['We', 'go', 'to', 'the', 'market'], ['by', 'is'], '‘We’ মানে আমরা।'),
  fill('Dhaka is a very ___ city.', 'busy', ['busy', 'sleep', 'blue'], 'Busy মানে ব্যস্ত। ঢাকা সবসময় ব্যস্ত!'),
  tr('আমি ট্রেনে ঢাকা যাই।', 'I go to Dhaka by train.', ['I go to Dhaka by train.', 'I go Dhaka by train.', 'I go to Dhaka in train.', 'I am go to Dhaka by train.'], 'go-এর পরে জায়গার আগে to বসে: go to Dhaka।'),
  mat([['যাই', 'go'], ['বাস', 'bus'], ['ব্যস্ত', 'busy'], ['শহর', 'city']])
]);
L('l5', 'A', 2, 'শুভেচ্ছা', '👋', [
  tr('ধন্যবাদ', 'Thank you', ['Thank you', 'Sorry', 'Please', 'Goodbye'], 'কেউ উপকার করলে Thank you। Sorry বলি ভুল করলে, আর Please বলি কিছু চাইতে গিয়ে।'),
  tr('দুঃখিত', 'Sorry', ['Sorry', 'Please', 'Hello', 'Thank you'], 'ভুল করলে বা কষ্ট দিলে Sorry বলি। Thank you বলি ধন্যবাদ জানাতে।'),
  tr('শুভ সকাল', 'Good morning', ['Good morning', 'Good night', 'Good evening', 'Good afternoon'], 'সকালে Good morning, রাতে ঘুমানোর আগে Good night।'),
  tr('বিদায়', 'Goodbye', ['Goodbye', 'Hello', 'Welcome', 'Please'], 'চলে যাওয়ার সময় Goodbye। Hello বলি দেখা হলে, শুরুতে।'),
  mat([['ধন্যবাদ', 'Thank you'], ['দুঃখিত', 'Sorry'], ['অনুগ্রহ করে', 'Please'], ['শুভ রাত্রি', 'Good night']]),
  fill('A: Thank you!  B: You are ___.', 'welcome', ['welcome', 'sorry', 'good'], '‘You are welcome’ মানে ‘কোনো ব্যাপার না’।'),
  ord('শুভ সন্ধ্যা', ['Good', 'evening'], ['morning', 'night'], 'সন্ধ্যায় Good evening।'),
  fill('___ me, where is the bus stop?', 'Excuse', ['Excuse', 'Thank', 'Good'], 'কারো মনোযোগ চাইতে বলি Excuse me।')
]);
L('l6', 'A', 2, 'আমার পরিচয়', '🎒', [
  ord('আমার নাম রিয়া।', ['My', 'name', 'is', 'Riya'], ['am', 'I'], 'আমার = My। My name is…'),
  tr('আমি ভালো আছি।', 'I am fine.', ['I am fine.', 'I fine am.', 'I is fine.', 'Me fine.'], '‘I’-এর সাথে am।'),
  fill('I ___ a student.', 'am', ['am', 'is', 'are'], '‘I’-এর সাথে সবসময় am।'),
  tr('তুমি কেমন আছো?', 'How are you?', ['How are you?', 'How is you?', 'Who are you?', 'How you are?'], 'কেমন = How। ‘you’-এর সাথে are।'),
  fill('She ___ my teacher.', 'is', ['is', 'am', 'are'], 'She/He/It-এর সাথে is।'),
  ord('আমি স্কুলে পড়ি।', ['I', 'study', 'at', 'school'], ['in', 'is'], 'স্কুলে পড়ি = study at school।'),
  mat([['নাম', 'name'], ['শিক্ষক', 'teacher'], ['ছাত্র', 'student'], ['বন্ধু', 'friend']]),
  tr('ইনি আমার বন্ধু।', 'This is my friend.', ['This is my friend.', 'This are my friend.', 'This my friend is.', 'These is my friend.'], 'একজন হলে This is…')
]);

L('b1', 'B', 0, 'ফোন আর নেট', '📱', [
  wtr('search', 'খোঁজা', ['খোঁজা', 'মোছা', 'পাঠানো', 'বন্ধ করা'], 'search মানে খোঁজা। গুগলে কিছু খুঁজলে বলি: I search on Google।'),
  wtr('delete', 'মুছে ফেলা', ['মুছে ফেলা', 'সেভ করা', 'খোলা', 'দেখা'], 'delete মানে মুছে ফেলা। ভুল ছবি delete করা সহজ, জীবনের ভুল delete করা কঠিন 😄'),
  mat([['পাঠানো', 'send'], ['পাওয়া', 'receive'], ['খোলা', 'open'], ['বন্ধ করা', 'close']]),
  fill('He ___ videos on YouTube every night.', 'watches', ['watches', 'watch', 'watching', 'watched'], 'He/She/It একবচন হলে Present Simple-এ verb-এর সাথে s/es বসে। watch-এর শেষে ch আছে, তাই es লাগে: watches। উদাহরণ: She goes, he fixes, it works।'),
  tr('আমরা প্রতিদিন ফেসবুক ব্যবহার করি।', 'We use Facebook every day.', ['We use Facebook every day.', 'We uses Facebook every day.', 'We are use Facebook every day.', 'We using Facebook every day.'], 'We/You/They/I-এর সাথে verb মূল রূপে বসে (use), s লাগে না। ‘are use’ ভুল, কারণ are-এর পরে verb-এ ing লাগে (are using)। আর ‘using’ একা বসলে verb-এর আগে helping verb থাকে না, বাক্য অসম্পূর্ণ হয়।'),
  ord('সে আমাকে একটি মেসেজ পাঠায়।', ['She', 'sends', 'me', 'a', 'message'], ['send', 'are'], 'She একবচন, তাই Present Simple-এ send হয়ে যায় sends। মনে রাখো: he/she/it + verb+s।'),
  fill('My phone ___ not working.', 'is', ['is', 'are', 'do', 'does'], 'ফোন একটি জিনিস (একবচন), তাই is। ‘not working’ চলমান অবস্থা বোঝায়, তাই আগে is/am/are বসে; do/does এখানে চলে না।')
]);
L('b2', 'B', 0, 'অনলাইন লাইফ', '🌐', [
  fill('She is ___ a video right now.', 'recording', ['recording', 'record', 'records', 'recorded'], '‘right now’ মানে এই মুহূর্তে কাজটা চলছে, তাই Present Continuous: is/am/are + verb+ing। উদাহরণ: I am eating, they are playing।'),
  fill('I need ___ umbrella today.', 'an', ['a', 'an', 'the'], 'যে শব্দের উচ্চারণ স্বরধ্বনি (a, e, i, o, u-র শব্দ) দিয়ে শুরু, তার আগে an। ‘umbrella’ শুরু হয় ‘আ’ শব্দ দিয়ে, তাই an umbrella।'),
  fill('It is ___ hour-long video.', 'an', ['a', 'an', 'the'], 'বানান নয়, উচ্চারণ দেখো! hour-এর h উচ্চারণ হয় না, শুরুতে ‘আওয়ার’ শোনা যায়। তাই an hour। একইভাবে an honest man।'),
  tr('তারা এখন গেম খেলছে।', 'They are playing a game now.', ['They are playing a game now.', 'They playing a game now.', 'They plays a game now.', 'They is playing a game now.'], '‘এখন’ মানে Present Continuous। They-এর সাথে are বসে, তারপর verb+ing। ‘They playing’-এ are নেই, তাই ভুল। ‘They is’-এ is বহুবচনের সাথে বসেছে, তাও ভুল।'),
  mat([['নিরাপদ', 'safe'], ['ঝুঁকি', 'risk'], ['অনলাইন', 'online'], ['বিপজ্জনক', 'dangerous']]),
  mcq('Which sentence is correct?', 'Rahim does not use Facebook.', ['Rahim does not use Facebook.', 'Rahim not use Facebook.', 'Rahim do not use Facebook.', 'Rahim does not uses Facebook.'], 'Rahim (একজন) হলে negative-এ does not বসে। আর does থাকলে মূল verb-এ s লাগে না, কারণ s-এর কাজটা does-ই করে ফেলেছে: does not use।'),
  ord('আমি এখন কোনো ভিডিও দেখছি না।', ['I', 'am', 'not', 'watching', 'a', 'video', 'now'], ['do', 'watch'], 'Present Continuous negative: am/is/are + not + verb+ing। I-এর সাথে am।')
]);
L('b3', 'B', 1, 'ক্রিকেট আর আড্ডা', '🏏', [
  fill('Bangladesh ___ the match yesterday.', 'won', ['won', 'win', 'wins', 'winning'], '‘yesterday’ (গতকাল) মানে Past Simple। win-এর past রূপ won (irregular verb)। win → won → won।'),
  fill('We ___ to the field after school.', 'went', ['went', 'go', 'goes', 'gone'], 'go → went → gone। Past Simple-এ went বসে। gone-এর আগে has/have/had না থাকলে বসে না।'),
  mat([['see', 'saw'], ['eat', 'ate'], ['buy', 'bought'], ['run', 'ran']]),
  tr('সে একটি ছক্কা মেরেছিল।', 'He hit a six.', ['He hit a six.', 'He hitted a six.', 'He hits a six yesterday.', 'He was hit a six.'], 'hit-এর তিন রূপই এক: hit-hit-hit। তাই past-এও hit। ‘hitted’ বলে কোনো শব্দ নেই। ‘was hit’ মানে সে নিজে আঘাত পেয়েছে (passive), তাই অর্থ বদলে যায়।'),
  fill('Did you ___ the match last night?', 'watch', ['watch', 'watched', 'watches', 'watching'], 'Did থাকলে verb সবসময় মূল রূপে বসে। Did নিজেই অতীত বোঝায়, তাই আবার watched বললে অতীত দুবার হয়ে যায়। ঠিক: Did you watch?'),
  ord('আমরা গতকাল দুই ঘণ্টা আড্ডা দিয়েছি।', ['We', 'chatted', 'for', 'two', 'hours', 'yesterday'], ['chat', 'will'], 'অতীতের কাজ, তাই chat-এর past chatted (শেষ ব্যঞ্জন t দ্বিগুণ হয়ে ed)।'),
  mcq('Choose the correct sentence.', 'I did not go to the coaching class.', ['I did not go to the coaching class.', 'I did not went to the coaching class.', 'I not went to the coaching class.', 'I do not went to the coaching class.'], 'Past negative: did not + মূল verb। did not-এর পরে went বসালে অতীত দুবার হয়। ‘I not went’-এ helping verb নেই, তাই ভুল।')
]);
L('b4', 'B', 1, 'প্ল্যান আর ভবিষ্যৎ', '🗓️', [
  fill('I ___ call you tomorrow.', 'will', ['will', 'did', 'am'], '‘tomorrow’ (আগামীকাল) ভবিষ্যৎ বোঝায়, তাই will + verb।'),
  fill('Look at the clouds! It is ___ to rain.', 'going', ['going', 'will', 'went'], 'চোখের সামনে প্রমাণ (কালো মেঘ) দেখে ভবিষ্যৎ বললে be going to। উদাহরণ: It is going to rain।'),
  fill('The meeting is ___ 5 p.m.', 'at', ['at', 'on', 'in'], 'নির্দিষ্ট ঘড়ির সময়ের আগে at: at 5 p.m., at noon। দিনের আগে on: on Friday। মাস-বছরের আগে in: in July, in 2026।'),
  fill('We have no classes ___ Friday.', 'on', ['on', 'at', 'in'], 'বারের (Friday, Sunday) আগে on বসে: on Friday।'),
  fill('My birthday is ___ December.', 'in', ['in', 'on', 'at'], 'মাসের আগে in বসে: in December। কিন্তু তারিখ হলে on: on 16 December।'),
  tr('আমি আগামীকাল ঢাকায় যাব।', 'I will go to Dhaka tomorrow.', ['I will go to Dhaka tomorrow.', 'I go to Dhaka tomorrow.', 'I will went to Dhaka tomorrow.', 'I am go to Dhaka tomorrow.'], 'ভবিষ্যৎ = will + verb-এর মূল রূপ। will-এর পরে went বা going বসে না, বসে go।'),
  mat([['at night', 'রাতে'], ['on Friday', 'শুক্রবার'], ['in July', 'জুলাই মাসে'], ['at noon', 'দুপুরে']])
]);
L('b5', 'B', 2, 'স্কুল আর কোচিং', '🎒', [
  fill('You ___ study hard for the exam.', 'should', ['should', 'can', 'may'], 'should = উচিত (উপদেশ)। can = পারা (সামর্থ্য)। may = হয়তো বা অনুমতি চাওয়া।'),
  fill('Ria is ___ than Tania.', 'taller', ['tall', 'taller', 'tallest'], 'দুজনের মধ্যে তুলনা হলে comparative রূপ (tall+er) আর পরে than বসে।'),
  fill('Rafi is the ___ student in our class.', 'best', ['good', 'better', 'best'], 'অনেকের মধ্যে সেরা বোঝাতে the + superlative। good-এর তিন রূপ: good → better → best (irregular)।'),
  tr('তুমি ক্লাসে ফোন ব্যবহার করতে পারবে না।', 'You cannot use your phone in class.', ['You cannot use your phone in class.', 'You cannot uses your phone in class.', 'You not can use your phone in class.', 'You can not to use your phone in class.'], 'Modal (can, should, must)-এর পরে সবসময় verb-এর মূল রূপ বসে, s বা to বসে না। আর not বসে modal-এর পরে: cannot।'),
  mat([['ভারী', 'heavy'], ['সহজ', 'easy'], ['কঠিন', 'difficult'], ['গুরুত্বপূর্ণ', 'important']]),
  ord('এই প্রশ্নটা ওটার চেয়ে কঠিন।', ['This', 'question', 'is', 'harder', 'than', 'that', 'one'], ['hard', 'more'], 'ছোট শব্দে er বসে: hard → harder। আর তুলনার সময় than বসে।'),
  mcq('Choose the correct sentence.', 'She is more intelligent than her brother.', ['She is more intelligent than her brother.', 'She is intelligenter than her brother.', 'She is most intelligent than her brother.', 'She more intelligent than her brother.'], 'বড় শব্দে (intelligent, beautiful, important) er বসে না, শব্দের আগে more বসে। most বসে সবচেয়ে বোঝাতে, তাই than-এর সাথে চলে না।')
]);
L('b6', 'B', 2, 'চ্যালেঞ্জ: মিক্স', '🧩', [
  fill('If it rains, we ___ stay at home.', 'will', ['will', 'would', 'did'], 'সম্ভাব্য শর্ত: If + Present, … will + verb। বৃষ্টি হতেই পারে, তাই will।'),
  fill('She has ___ her homework.', 'finished', ['finished', 'finish', 'finishing'], 'Present Perfect: has/have + Past Participle (V3)। finish-এর V3 finished।'),
  fill('I have lived in Dhaka ___ 2019.', 'since', ['since', 'for', 'from'], 'নির্দিষ্ট সময়ের শুরু (2019, Monday, morning) থাকলে since। সময়ের পরিমাণ (five years) থাকলে for।'),
  fill('She has been waiting ___ two hours.', 'for', ['for', 'since', 'from'], 'two hours হলো সময়ের পরিমাণ, তাই for। শুরুর সময় (since 5 p.m.) হলে since বসত।'),
  tr('বাসটা চলে গেছে।', 'The bus has gone.', ['The bus has gone.', 'The bus have gone.', 'The bus has went.', 'The bus is go.'], 'Present Perfect: has + V3। bus একবচন, তাই has। go-এর V3 gone, went নয়।'),
  mcq('Which is correct?', 'There are many buses on the road.', ['There are many buses on the road.', 'There is many buses on the road.', 'There are many bus on the road.', 'There have many buses on the road.'], 'many-র পরে বহুবচন noun (buses) আসে, তাই are। আর ‘There have’ বলা হয় না, There is/are বসে।'),
  ord('আমি দুই বছর ধরে ইংরেজি শিখছি।', ['I', 'have', 'been', 'learning', 'English', 'for', 'two', 'years'], ['am', 'since'], 'কাজ শুরু হয়ে এখনো চলছে, সময়ের পরিমাণ দেওয়া: have been + verb+ing + for।')
]);

L('c1', 'C', 0, 'টেনস ওয়ার্ম-আপ', '⏳', [
  fill('The sun ___ in the east.', 'rises', ['rises', 'rise', 'rose', 'rising'], 'চিরসত্য বা সার্বজনীন সত্য সবসময় Present Simple-এ। The sun একবচন, তাই rises।'),
  fill('He ___ lunch when the power went out.', 'was eating', ['was eating', 'ate', 'is eating', 'has eaten'], 'একটা কাজ চলছিল (খাচ্ছিল), তখন আরেকটা ঘটল (বিদ্যুৎ গেল)। যেটা চলছিল সেটা Past Continuous (was/were + verb+ing), যেটা হঠাৎ ঘটল সেটা Past Simple।'),
  tr('আমি এই ফোনটা তিন বছর ধরে ব্যবহার করছি।', 'I have been using this phone for three years.', ['I have been using this phone for three years.', 'I am using this phone for three years.', 'I use this phone since three years.', 'I was using this phone for three years.'], 'কাজটা অতীতে শুরু হয়ে এখনো চলছে, সময়ের পরিমাণ দেওয়া আছে, তাই Present Perfect Continuous: have been + verb+ing + for। ‘am using’ দিয়ে for three years চলে না। আর since-এর পরে সময়ের পরিমাণ নয়, শুরুর সময় বসে।'),
  mcq('Choose the correct sentence.', 'She has already sent the money via bKash.', ['She has already sent the money via bKash.', 'She have already sent the money via bKash.', 'She has already send the money via bKash.', 'She has already sent the money via bKash yesterday.'], 'Present Perfect = has/have + V3। She একবচন, তাই has; send-এর V3 sent। আর Present Perfect-এর সাথে yesterday, last week, ago-র মতো নির্দিষ্ট অতীত সময় বসে না।'),
  mat([['Present Perfect', 'has/have + V3'], ['Past Continuous', 'was/were + V-ing'], ['Future Simple', 'will + V1'], ['Past Perfect', 'had + V3']]),
  fill('By the time we reached the station, the train ___.', 'had left', ['had left', 'left', 'has left', 'was leaving'], 'দুটো অতীত ঘটনার মধ্যে যেটা আগে ঘটেছে সেটা Past Perfect (had + V3)। এখানে ট্রেন আগে ছেড়েছে, আমরা পরে পৌঁছেছি।'),
  ord('বৃষ্টি শুরু হলে আমরা ম্যাচ খেলছিলাম।', ['We', 'were', 'playing', 'when', 'it', 'started', 'to', 'rain'], ['played', 'was'], 'একটা কাজ চলছিল (were playing), তখন আরেকটা ঘটল (started)। We-এর সাথে were।')
]);
L('c2', 'C', 0, 'সাবজেক্ট-ভার্ব মিল', '🤝', [
  fill('Neither Rina nor her friends ___ present.', 'were', ['was', 'were', 'is', 'has'], 'Neither…nor-এ verb শেষের subject-এর সাথে মেলে। শেষে ‘her friends’ (বহুবচন), তাই were।'),
  fill('Each of the students ___ a laptop.', 'has', ['has', 'have', 'are'], '‘Each of’ + বহুবচন noun থাকলেও verb একবচন হয়, কারণ each মানে প্রত্যেকে, একজন একজন করে।'),
  fill('The number of cars in Dhaka ___ increasing.', 'is', ['is', 'are', 'were'], '‘The number of’ = সংখ্যাটা, এটা একটাই জিনিস, তাই একবচন verb। উল্টো দিকে ‘A number of’ = অনেক, তাই বহুবচন (are)।'),
  mcq('Choose the correct sentence.', 'Ten kilometers is a long way to walk.', ['Ten kilometers is a long way to walk.', 'Ten kilometers are a long way to walk.', 'Ten kilometer is a long way to walk.', 'Ten kilometers were long way to walk.'], 'দূরত্ব, সময়, টাকার পরিমাণ একটা এককের মতো ধরা হয়, তাই একবচন verb। ‘Ten kilometer’-এ বহুবচনের s নেই, আর ‘long way’-এর আগে a লাগে।'),
  fill('Everybody ___ waiting for the result.', 'is', ['is', 'are', 'were'], 'Everybody, everyone, nobody, somebody সবসময় একবচন। অর্থে অনেক মানুষ মনে হলেও ব্যাকরণে একজন ধরা হয়।'),
  mat([['news', 'is'], ['police', 'are'], ['mathematics', 'is'], ['people', 'are']]),
  tr('পাঁচ মিনিট অনেক সময় নয়।', 'Five minutes is not a long time.', ['Five minutes is not a long time.', 'Five minutes are not a long time.', 'Five minute is not a long time.', 'Five minutes is not long a time.'], 'সময়ের পরিমাণ একটা এককের মতো, তাই is। আর ‘a long time’ একটা নির্দিষ্ট সাজানো রূপ, ‘long a time’ বলা যায় না।')
]);
L('c3', 'C', 1, 'রাইট ফর্ম', '✍️', [
  fill('She enjoys ___ street food.', 'eating', ['eating', 'to eat', 'eat'], 'enjoy, finish, avoid, mind, practise-এর পরে verb+ing (gerund) বসে।'),
  fill('I want ___ a new phone.', 'to buy', ['buying', 'to buy', 'buy'], 'want, hope, decide, plan, wish-এর পরে to + verb (infinitive) বসে।'),
  fill('You should stop ___ your time on Facebook.', 'wasting', ['wasting', 'to waste', 'waste'], 'stop + verb+ing = কাজটা বন্ধ করা। ‘stop to waste’ মানে থেমে গিয়ে নষ্ট করা, অর্থ পুরো বদলে যায়।'),
  fill('He made me ___ the whole essay again.', 'write', ['write', 'to write', 'writing'], 'make, let, help + object-এর পরে to ছাড়া verb: He made me write। (কিন্তু passive-এ to ফেরত আসে: I was made to write।)'),
  fill('I am looking forward to ___ you.', 'meeting', ['meeting', 'meet', 'to meet'], 'এখানে to একটা preposition (look forward to), infinitive-এর to নয়। preposition-এর পরে verb+ing বসে।'),
  tr('আমি তোমার সাথে দেখা করতে চাই।', 'I want to meet you.', ['I want to meet you.', 'I want meeting you.', 'I want meet you.', 'I wants to meet you.'], 'want-এর পরে to + verb। I-এর সাথে wants হয় না (wants বসে he/she/it-এর সাথে)।'),
  mcq('Choose the correct sentence.', 'He is used to waking up early.', ['He is used to waking up early.', 'He is used to wake up early.', 'He used to waking up early.', 'He is use to waking up early.'], 'be used to + verb+ing = অভ্যস্ত থাকা। ‘used to + verb’ = আগে করতাম (এখন করি না)। দুটো আলাদা অর্থ, তাই গুলিয়ে ফেলো না।')
]);
L('c4', 'C', 1, 'প্যাসিভ ভয়েস', '🔁', [
  fill('The letter ___ by Rahim.', 'was written', ['wrote', 'was written', 'has wrote', 'is writing'], 'Passive = be + V3। কাজটা কে করেছে (by Rahim) দেখলেই বুঝবে কর্তার ওপর কাজ হয়নি, কাজ হয়েছে চিঠির ওপর। তাই was written।'),
  ord('বাড়ির কাজটা শেষ করা হয়েছে।', ['The', 'homework', 'has', 'been', 'finished'], ['have', 'is'], 'Present Perfect Passive = has/have been + V3। homework একবচন, তাই has।'),
  mcq('Change into passive: “They are repairing the road.”', 'The road is being repaired.', ['The road is being repaired.', 'The road was repaired.', 'The road is repaired.', 'The road has been repairing.'], 'Present Continuous-এর passive: is/am/are + being + V3। কাজটা এখন চলছে, তাই being বসবে।'),
  mcq('Change into passive: “Someone stole my wallet.”', 'My wallet was stolen.', ['My wallet was stolen.', 'My wallet is stolen.', 'My wallet was stole.', 'My wallet has stolen.'], 'Past Simple-এর passive: was/were + V3। steal → stole → stolen। V3 stolen, stole নয়।'),
  fill('English ___ all over the world.', 'is spoken', ['speaks', 'is spoken', 'is speaking', 'spoke'], 'ভাষা নিজে কথা বলে না, ভাষাকে বলা হয়, তাই passive: is spoken।'),
  mat([['write', 'written'], ['break', 'broken'], ['choose', 'chosen'], ['take', 'taken']]),
  fill('The Padma Bridge ___ in 2022.', 'was opened', ['opened', 'was opened', 'is opened', 'has opened'], 'সেতু নিজে খোলেনি, কেউ খুলেছে। ঘটনা অতীতের (2022), তাই Past passive: was opened।')
]);
L('c5', 'C', 2, 'যদি-তাহলে', '🔮', [
  fill('If you study hard, you ___ pass.', 'will', ['will', 'would', 'had'], 'Type 1 (সম্ভাব্য শর্ত): If + Present, will + verb।'),
  fill("If I ___ a bird, I would fly to Cox's Bazar.", 'were', ['was', 'were', 'am'], 'Type 2 (কল্পনা, বাস্তবে নয়): If + Past, would + verb। এখানে সব subject-এর সাথে were বসে।'),
  fill('If she had left earlier, she ___ the bus.', 'would have caught', ['would catch', 'would have caught', 'will catch', 'had caught'], 'Type 3 (অতীতের অসম্ভব শর্ত): If + had + V3, would have + V3। অতীতে যা ঘটেনি তা নিয়ে আফসোস।'),
  mcq('Which is correct?', 'Unless you hurry, you will miss the train.', ['Unless you hurry, you will miss the train.', 'Unless you do not hurry, you will miss the train.', 'Unless you hurry, you would miss the train.', 'Unless you will hurry, you miss the train.'], 'Unless মানে If…not। তাই unless-এর পরে আবার not বসালে দুবার না বলা হয়ে যায়।'),
  tr('আমার কাছে টাকা থাকলে আমি একটা ল্যাপটপ কিনতাম।', 'If I had money, I would buy a laptop.', ['If I had money, I would buy a laptop.', 'If I have money, I would buy a laptop.', 'If I had money, I will buy a laptop.', 'If I would have money, I would buy a laptop.'], 'কল্পনার শর্ত (টাকা নেই): If + Past (had), would + verb। If-এর পাশে would বসে না।'),
  fill('I wish I ___ a superhero.', 'were', ['were', 'am', 'will be'], 'wish + Past রূপ = বর্তমানে যা নেই তার ইচ্ছা। এখানেও were।'),
  ord('আজ বৃষ্টি না হলে আমরা মাঠে যাব।', ['If', 'it', 'does', 'not', 'rain', 'today', 'we', 'will', 'go', 'to', 'the', 'field'], ['would', 'is'], 'Type 1: If + Present (does not rain), will + verb।')
]);
L('c6', 'C', 2, 'মডাল আর প্রিপোজিশন', '🏁', [
  fill('You ___ wear a helmet while riding a bike.', 'must', ['must', 'might', 'can'], 'must = অবশ্যই (আইন বা বাধ্যবাধকতা)। might = হতেও পারে। can = পারা।'),
  fill('It ___ rain tonight, so take an umbrella.', 'may', ['may', 'must', 'shall'], 'may/might = সম্ভাবনা (হতেও পারে)। নিশ্চিত হলে will বসত।'),
  fill('She is good ___ math.', 'at', ['at', 'in', 'on'], 'কোনো বিষয়ে দক্ষ = good at। Adjective-এর সাথে কোন preposition বসবে সেটা মুখস্থ রাখতে হয়: good at, afraid of, interested in।'),
  fill('I am interested ___ learning coding.', 'in', ['in', 'at', 'of'], 'interested in = আগ্রহী। পরে verb থাকলে verb+ing: interested in learning।'),
  fill('He is afraid ___ dogs.', 'of', ['of', 'from', 'at'], 'afraid of = ভয় পাওয়া।'),
  mat([['depend', 'on'], ['believe', 'in'], ['listen', 'to'], ['wait', 'for']]),
  mcq('Choose the correct sentence.', 'He insisted on going alone.', ['He insisted on going alone.', 'He insisted to go alone.', 'He insisted in going alone.', 'He insisted going alone.'], 'insist on + verb+ing = জোর করা। insist-এর পরে to-infinitive বসে না।')
]);

L('d1', 'D', 0, 'গ্রামার আপগ্রেড', '🎩', [
  fill('She is ___ honest girl.', 'an', ['a', 'an', 'the'], 'honest-এর h উচ্চারণ হয় না, উচ্চারণ শুরু হয় স্বরধ্বনি দিয়ে (অনেস্ট), তাই an। বানান নয়, উচ্চারণ দেখো।'),
  fill('___ Padma is a big river.', 'The', ['A', 'The', '(কিছু বসবে না)'], 'নদী, সাগর, পর্বতমালার নামের আগে the বসে: the Padma, the Bay of Bengal, the Himalayas।'),
  fill('Hardly had I reached the station ___ the train left.', 'when', ['when', 'than', 'then'], 'Hardly/Scarcely + had + subject + V3 … when। কিন্তু No sooner … than। দুটো জোড়া গুলিয়ে ফেলো না।'),
  mat([['Hardly', 'when'], ['No sooner', 'than'], ['Not only', 'but also'], ['Either', 'or']]),
  mcq('Choose the correct sentence.', 'Not only did he win, but he also broke the record.', ['Not only did he win, but he also broke the record.', 'Not only he won, but he also broke the record.', 'Not only he did win, but he also broke the record.', 'Not only did he won, but he also broke the record.'], 'Not only বাক্যের শুরুতে বসলে inversion হয়: auxiliary আগে, subject পরে (did he win)। আর did-এর পরে verb মূল রূপে থাকে, won নয়।'),
  tr('যত বেশি তুমি অনুশীলন করবে, তত ভালো করবে।', 'The more you practise, the better you will do.', ['The more you practise, the better you will do.', 'More you practise, better you will do.', 'The more you practise, the more better you will do.', 'The most you practise, the best you will do.'], '‘যত…তত’ = The + comparative, the + comparative। ‘more better’ ডাবল comparative, তাই ভুল। most/best তুলনার জন্য নয়, সবচেয়ে বোঝাতে।'),
  fill('It is high time we ___ our environment.', 'protected', ['protect', 'protected', 'will protect'], 'It is (high) time + Past রূপ = এখনই করা উচিত, দেরি হয়ে যাচ্ছে। অর্থ বর্তমান, কিন্তু verb থাকে past।')
]);
L('d2', 'D', 0, 'শব্দভাণ্ডার', '📚', [
  mcq('Synonym of ‘ample’', 'plenty', ['plenty', 'scarce', 'tiny', 'weak'], 'ample = যথেষ্ট, প্রচুর। plenty একই অর্থের কাছাকাছি। scarce মানে দুষ্প্রাপ্য, যা উল্টো অর্থ।'),
  mcq('Antonym of ‘generous’', 'stingy', ['stingy', 'kind', 'rich', 'polite'], 'generous = উদার। উল্টো অর্থ stingy (কৃপণ)।'),
  mcq('Synonym of ‘vital’', 'essential', ['essential', 'useless', 'optional', 'minor'], 'vital = অত্যন্ত জরুরি। essential একই অর্থ। optional মানে ইচ্ছাধীন, বিপরীত ধারণা।'),
  mcq('Antonym of ‘transparent’', 'opaque', ['opaque', 'clear', 'thin', 'bright'], 'transparent = স্বচ্ছ। উল্টো opaque (অস্বচ্ছ)। clear আসলে transparent-এর কাছাকাছি, তাই ফাঁদে পড়ো না।'),
  mat([['abundant', 'plentiful'], ['reluctant', 'unwilling'], ['brief', 'short'], ['fragile', 'delicate']]),
  fill('The teacher’s advice was very ___; it changed my life.', 'valuable', ['valuable', 'worthless', 'cheap', 'weak'], 'জীবন বদলে দিয়েছে, তাই উপদেশটা মূল্যবান (valuable)। worthless মানে মূল্যহীন, যা উল্টো।'),
  mcq('Which word means ‘to make something better’?', 'improve', ['improve', 'reduce', 'delay', 'ignore'], 'improve = উন্নত করা। reduce = কমানো, delay = দেরি করা, ignore = উপেক্ষা করা।')
]);
L('d3', 'D', 1, 'ফ্রেজাল ভার্ব', '🧷', [
  fill('Please turn ___ the light; it is too bright.', 'off', ['off', 'on', 'up'], 'turn off = বন্ধ করা। turn on = চালু করা। turn up = ভলিউম বা মাত্রা বাড়ানো।'),
  fill('The match was called ___ because of rain.', 'off', ['off', 'on', 'in'], 'call off = বাতিল করা। বৃষ্টির কারণে ম্যাচ বাতিল হলে বলি: The match was called off।'),
  fill('We ran ___ of data during the live match.', 'out', ['out', 'off', 'over'], 'run out of = ফুরিয়ে যাওয়া। উদাহরণ: We ran out of time।'),
  mat([['give up', 'ছেড়ে দেওয়া'], ['look after', 'দেখাশোনা করা'], ['put off', 'পিছিয়ে দেওয়া'], ['carry on', 'চালিয়ে যাওয়া']]),
  mcq('What does ‘bring up’ mean in: She was brought up by her grandparents?', 'raised', ['raised', 'lifted', 'mentioned', 'invited'], 'bring up = লালনপালন করা (raise)। আবার আলোচনায় তোলা অর্থেও ব্যবহার হয়, তাই বাক্যের অর্থ দেখে বুঝতে হয়।'),
  fill("I can't ___ with this noise any longer.", 'put up', ['put up', 'put off', 'put on'], 'put up with = সহ্য করা। put off = পিছিয়ে দেওয়া। put on = পরা বা চালু করা।'),
  tr('তিনি ঢাকায় বড় হয়েছেন।', 'He grew up in Dhaka.', ['He grew up in Dhaka.', 'He grow up in Dhaka.', 'He has grew up in Dhaka.', 'He is grown up in Dhaka.'], 'grow up = বড় হওয়া। grow → grew → grown। Past Simple-এ grew। has-এর পরে grew নয়, grown বসত।')
]);
L('d4', 'D', 1, 'রিপোর্টেড স্পিচ', '💬', [
  mcq('Direct: He said, “I am busy.” Indirect:', 'He said that he was busy.', ['He said that he was busy.', 'He said that he is busy.', 'He said that I was busy.', 'He said that he has been busy.'], 'Reporting verb অতীত (said) হলে ভেতরের tense এক ধাপ পিছোয়: am → was। আর পুরুষ বদলায়: I → he।'),
  mcq('Direct: She said, “I will call you.” Indirect:', 'She said that she would call me.', ['She said that she would call me.', 'She said that she will call you.', 'She said that I would call you.', 'She said that she would call you.'], 'will → would। পুরুষ বদলায়: I → she (বক্তা), you → me (শ্রোতা)।'),
  mcq('Direct: He said to me, “Where do you live?” Indirect:', 'He asked me where I lived.', ['He asked me where I lived.', 'He asked me where did I live.', 'He told me where I lived.', 'He asked me where do I live.'], 'প্রশ্ন indirect হলে সাধারণ বাক্যের মতো সাজে (I lived), do/did থাকে না। আর said to → asked।'),
  fill('The teacher told us that the sun ___ in the east.', 'rises', ['rises', 'rose', 'is rising'], 'সার্বজনীন সত্য indirect speech-এও বদলায় না, তাই rises।'),
  mat([['now', 'then'], ['today', 'that day'], ['tomorrow', 'the next day'], ['here', 'there']]),
  mcq('Indirect: He said, “Let’s go for a walk.”', 'He suggested going for a walk.', ['He suggested going for a walk.', 'He said let us go for a walk.', 'He suggested to go for a walk.', 'He ordered to go for a walk.'], 'Let’s একটা প্রস্তাব, তাই suggested + verb+ing। suggest-এর পরে to-infinitive বসে না।'),
  tr('সে জিজ্ঞেস করল আমি ফ্রি আছি কি না।', 'She asked if I was free.', ['She asked if I was free.', 'She asked that I was free.', 'She asked was I free.', 'She asked if was I free.'], 'হ্যাঁ/না প্রশ্ন indirect হলে if বা whether বসে, তারপর সাধারণ সাজানো: if I was free।')
]);
L('d5', 'D', 2, 'এরর স্পটিং', '🔍', [
  mcq('Find the error: “Each of the boys have a bike.”', 'have → has', ['have → has', 'Each → All', 'of → in', 'a → an'], 'Each of + বহুবচন noun হলেও verb একবচন হয়। তাই have নয়, has।'),
  mcq('Find the error: “She is more smarter than me.”', 'more smarter → smarter', ['more smarter → smarter', 'is → are', 'than → then', 'me → my'], 'ডাবল comparative ভুল। ছোট শব্দে er বসে (smarter), আর more বসে বড় শব্দে। দুটো একসাথে নয়।'),
  mcq('Find the error: “He suggested me to take a rest.”', 'suggested me to take → suggested that I take', ['suggested me to take → suggested that I take', 'He → She', 'a rest → rests', 'No error'], 'suggest-এর পরে object + to-infinitive বসে না। বলো: suggested that I take, অথবা suggested taking a rest।'),
  mcq('Find the error: “I am knowing the answer.”', 'am knowing → know', ['am knowing → know', 'the → a', 'answer → answers', 'No error'], 'know, like, love, want, believe-এর মতো stative verb সাধারণত continuous (ing) হয় না।'),
  mcq('Find the error: “The information are very useful.”', 'are → is', ['are → is', 'very → much', 'useful → use', 'The → A'], 'information uncountable noun, তাই সবসময় একবচন verb। একইভাবে advice, furniture, news।'),
  fill('Neither of the answers ___ correct.', 'is', ['is', 'are', 'were'], '‘Neither of’-এর পরে বহুবচন থাকলেও ঐতিহ্যবাহী ব্যাকরণে verb একবচন (is)।'),
  mcq('Which sentence has NO error?', 'She has been working here since 2019.', ['She has been working here since 2019.', 'She is working here since 2019.', 'She has worked here since five years.', 'She works here for 2019.'], 'শুরুর সময় (2019) + এখনো চলছে = has been working + since। since-এর পরে সময়ের পরিমাণ (five years) বসে না, সেখানে for লাগে।')
]);
L('d6', 'D', 2, 'ফাইনাল বস', '🏆', [
  fill('Had I known the truth, I ___ him.', 'would have helped', ['would help', 'would have helped', 'will help', 'had helped'], '‘Had + subject + V3’ মানে If I had known (inversion)। এটা Type 3, তাই ফলাফল would have + V3।'),
  fill('She ___ rather stay at home than go out.', 'would', ['would', 'will', 'must'], 'would rather + verb (than + verb) = বরং …করতাম।'),
  mcq('Choose the correct sentence.', 'Having finished the work, he went home.', ['Having finished the work, he went home.', 'Finished the work, he went home.', 'Having finish the work, he went home.', 'After finished the work, he went home.'], 'Having + V3 = কাজটা আগে শেষ করে। ‘After finished’-এ After-এর পরে finishing বসত।'),
  mat([['Although', 'যদিও'], ['Despite', 'সত্ত্বেও (+noun)'], ['Therefore', 'তাই'], ['Moreover', 'তদুপরি']]),
  fill('___ he was tired, he kept working.', 'Although', ['Although', 'Despite', 'Because'], 'Although + subject + verb (পুরো clause)। Despite + noun বা verb+ing। কারণ বোঝাতে Because বসত, কিন্তু এখানে বৈপরীত্য।'),
  tr('তুমি যাই বলো না কেন, আমি ভুলব না।', 'No matter what you say, I will not forget.', ['No matter what you say, I will not forget.', 'No matter what do you say, I will not forget.', 'Whatever you say, I not forget.', 'No matter you say, I will not forget.'], 'No matter what + subject + verb (সাধারণ সাজানো, প্রশ্নের মতো নয়)। আর ‘I not forget’-এ helping verb নেই।'),
  mcq('Choose the correct sentence.', 'If I were you, I would apologise.', ['If I were you, I would apologise.', 'If I was you, I will apologise.', 'If I am you, I would apologise.', 'If I were you, I will apologise.'], 'Type 2 কল্পনা: If + were, would + verb। ‘আমি তোমার জায়গায় থাকলে’ বাস্তবে সম্ভব নয়, তাই would।')
]);


/* ================= v1.1: সংশোধন ================= */
const LS_ = id => LESSONS.find(l => l.id === id);
const PATCH = (id, i, q) => { LS_(id).qs[i] = q; };
const ADD = (id, ...qs) => { LS_(id).qs.push(...qs); };

/* ---- Beginner: ভুল ও পুনরাবৃত্তি ঠিক করা ---- */
PATCH('l1', 4, mat([['দুধ', 'milk'], ['পানি', 'water'], ['কলা', 'banana'], ['রুটি', 'bread']], 'milk = দুধ, water = পানি, banana = কলা, bread = রুটি। দুধ আর পানি drink করা হয়, কলা আর রুটি eat।'));
ADD('l1', typ('আমার মাছ পছন্দ।', ['I like fish.', 'I love fish.'], 'পছন্দ = like। I-এর সাথে like (s ছাড়া): I like fish।'));
ADD('l2', typ('সে ভাত খায়।', ['He eats rice.', 'She eats rice.'], 'He/She-এর সাথে verb-এর শেষে s বসে: eats।'));
PATCH('l3', 3, wtr('rickshaw', 'রিকশা', ['রিকশা', 'বাস', 'নৌকা', 'ট্রেন'], 'rickshaw মানে রিকশা। শব্দটা জাপানি ‘jinrikisha’ থেকে ইংরেজিতে এসেছে। bus = বাস, boat = নৌকা, train = ট্রেন।'));
PATCH('l3', 5, mat([['বাজার', 'market'], ['স্কুল', 'school'], ['হাসপাতাল', 'hospital'], ['দোকান', 'shop']], 'market = বাজার, school = স্কুল, hospital = হাসপাতাল, shop = দোকান।'));
ADD('l3', typ('আমি নৌকায় যাই।', ['I go by boat.'], 'বাহনে চড়ে গেলে ‘by’ বসে: by boat, by bus, by train।'));
PATCH('l4', 7, mat([['যাই', 'go'], ['গাড়ি', 'car'], ['দ্রুত', 'fast'], ['ধীরে', 'slow']], 'go = যাই, car = গাড়ি, fast = দ্রুত, slow = ধীরে।'));
PATCH('l5', 4, mat([['আবার দেখা হবে', 'See you later'], ['অনুগ্রহ করে', 'Please'], ['শুভ রাত্রি', 'Good night'], ['শুভ দুপুর', 'Good afternoon']], 'See you later = আবার দেখা হবে। Please = অনুগ্রহ করে। Good night = ঘুমানোর আগের শুভেচ্ছা। Good afternoon = দুপুর-বিকেলের শুভেচ্ছা।'));
ADD('l5', typ('আপনার সাথে দেখা হয়ে ভালো লাগলো।', ['Nice to meet you.', 'Good to meet you.', 'Pleased to meet you.'], 'প্রথম পরিচয়ে বলি: Nice to meet you।'));
PATCH('l6', 5, ord('আমি স্কুলে পড়ি।', ['I', 'study', 'at', 'school'], ['am', 'is'], 'স্কুলে পড়ি = study at school।'));
ADD('l6', typ('আমি ঢাকায় থাকি।', ['I live in Dhaka.'], 'থাকি = live। শহরের নামের আগে in বসে: in Dhaka।'));

/* ---- Medium ---- */
ADD('b1', typ('আমি ফোনে গেম খেলি।', 'I play games on my phone.', 'গেম ‘play’ করা হয়, আর ফোনের ওপর ‘on my phone’।'));
PATCH('b2', 6, ord('আমি এখন একটি ভিডিও দেখছি না।', ['I', 'am', 'not', 'watching', 'a', 'video', 'now'], ['do', 'watch'], 'Present Continuous negative: am/is/are + not + verb+ing। I-এর সাথে am।', [['now', 'I', 'am', 'not', 'watching', 'a', 'video']]));
PATCH('b3', 1, fill('We ___ to the field after school yesterday.', 'went', ['went', 'go', 'goes', 'gone'], '‘yesterday’ (গতকাল) মানে Past Simple। go → went → gone। gone-এর আগে has/have/had না থাকলে বসে না।'));
PATCH('b3', 5, ord('আমরা গতকাল দুই ঘণ্টা আড্ডা দিয়েছি।', ['We', 'chatted', 'for', 'two', 'hours', 'yesterday'], ['chat', 'will'], 'অতীতের কাজ, তাই chat-এর past chatted (শেষ ব্যঞ্জন t দ্বিগুণ হয়ে ed)।', [['We', 'chatted', 'yesterday', 'for', 'two', 'hours'], ['yesterday', 'we', 'chatted', 'for', 'two', 'hours']]));
ADD('b3', typ('আমি কাল ক্রিকেট খেলব।', ['I will play cricket tomorrow.', 'I am going to play cricket tomorrow.'], 'ভবিষ্যতের কাজে will + verb: I will play।'));
PATCH('b5', 0, fill('You ___ study hard if you want to pass the exam.', 'should', ['should', 'may', 'might'], 'should = উচিত (উপদেশ)। may/might = সম্ভাবনা বা অনুমতি। পাস করতে চাইলে পড়া উচিত, তাই should।'));
ADD('b5', typ('সে কোচিংয়ে যায়।', ['She goes to coaching.', 'He goes to coaching.'], 'he/she-এর সাথে verb-এ s/es বসে: goes।'));
PATCH('b6', 6, ord('আমি দুই বছর ধরে ইংরেজি শিখছি।', ['I', 'have', 'been', 'learning', 'English', 'for', 'two', 'years'], ['am', 'since'], 'কাজ শুরু হয়ে এখনো চলছে, সময়ের পরিমাণ দেওয়া: have been + verb+ing + for।', [['for', 'two', 'years', 'I', 'have', 'been', 'learning', 'English']]));

/* ---- Higher ---- */
PATCH('c1', 6, ord('বৃষ্টি শুরু হওয়ার সময় আমরা ম্যাচ খেলছিলাম।', ['We', 'were', 'playing', 'when', 'it', 'started', 'to', 'rain'], ['played', 'was'], 'একটা কাজ চলছিল (were playing), তখন আরেকটা ঘটল (started)। We-এর সাথে were।', [['when', 'it', 'started', 'to', 'rain', 'we', 'were', 'playing']]));
ADD('c1',
  mcq('Which sentence uses the Past Perfect tense?', 'They had finished dinner before the guests arrived.', ['They had finished dinner before the guests arrived.', 'They finished dinner when the guests arrived.', 'They were finishing dinner as the guests arrived.', 'They have finished dinner since the guests arrived.'], 'Past Perfect = had + V3। দুটো অতীত ঘটনার মধ্যে যেটা আগে ঘটেছে সেটায় বসে। এখানে খাওয়া শেষ হয়েছে অতিথি আসার আগে।'),
  tr('সে গতকাল থেকে অসুস্থ।', 'She has been ill since yesterday.', ['She has been ill since yesterday.', 'She is ill since yesterday.', 'She was ill since yesterday.', 'She has ill since yesterday.'], 'অতীতে শুরু হয়ে এখনো চলছে = Present Perfect: has been। since-এর সাথে সাধারণ present (is) বা simple past (was) চলে না।'),
  fill('Look! The children ___ in the rain.', 'are playing', ['are playing', 'play', 'played', 'have played'], '‘Look!’ বলে চোখের সামনে যা ঘটছে সেটা দেখানো হয়, তাই Present Continuous: are playing।')
);
ADD('c2', typ('সে প্রতিদিন স্কুলে যায়।', ['He goes to school every day.', 'She goes to school every day.'], 'Third person singular-এ verb-এ s/es: goes।'));
ADD('c2',
  fill('The teacher, along with the students, ___ going on a trip.', 'is', ['is', 'are', 'were'], 'along with / together with / as well as দিয়ে কিছু জুড়লে verb প্রথম subject (The teacher) অনুযায়ী হয়। তাই is।'),
  fill('Bangladesh and India ___ neighbouring countries.', 'are', ['are', 'is', 'has'], '‘and’ দিয়ে দুটো আলাদা subject জুড়লে বহুবচন হয়, তাই are।'),
  fill('One of my friends ___ in Canada.', 'lives', ['lives', 'live', 'are living'], 'One of + বহুবচন noun হলেও মূল subject ‘one’ (একজন), তাই verb একবচন: lives।')
);
ADD('c3',
  fill('She is good at ___ pictures.', 'drawing', ['drawing', 'to draw', 'draw'], 'preposition (at)-এর পরে verb+ing বসে: good at drawing।'),
  fill('I remember ___ the door, so it must be locked.', 'locking', ['locking', 'to lock', 'lock'], 'remember + verb+ing = আগে করেছি, সেটা মনে আছে। remember + to + verb = করতে হবে, সেটা মনে রাখা।'),
  fill('Please remember ___ the lights before you leave.', 'to turn off', ['to turn off', 'turning off', 'turn off'], 'remember + to + verb = কাজটা করতে হবে (এখনো করা হয়নি), সেটা মনে রাখা।')
);
ADD('c4',
  fill('Many houses ___ by the flood last year.', 'were destroyed', ['were destroyed', 'destroyed', 'are destroyed', 'have destroyed'], 'বন্যা ঘরগুলোকে ধ্বংস করেছে, ঘর নিজে করেনি, তাই passive। last year মানে Past, তাই were destroyed।'),
  tr('এই গল্পটি রবীন্দ্রনাথ লিখেছিলেন।', 'This story was written by Tagore.', ['This story was written by Tagore.', 'This story wrote by Tagore.', 'This story was write by Tagore.', 'This story has wrote by Tagore.'], 'Past passive = was/were + V3। write → wrote → written, তাই was written।'),
  mcq('Change into passive: “Rafi will complete the work.”', 'The work will be completed by Rafi.', ['The work will be completed by Rafi.', 'The work will complete by Rafi.', 'The work is completed by Rafi.', 'The work will be complete by Rafi.'], 'Future passive = will be + V3। completed হলো V3।')
);
PATCH('c5', 1, fill("If I ___ a bird, I would fly to Cox's Bazar.", 'were', ['were', 'am', 'will be'], 'Type 2 (কল্পনা, বাস্তবে নয়): If + Past, would + verb। এখানে সব subject-এর সাথে were বসে।'));
PATCH('c5', 3, mcq('Which is correct?', 'Unless you hurry, you will miss the train.', ['Unless you hurry, you will miss the train.', 'Unless you do not hurry, you will miss the train.', 'Unless you will hurry, you will miss the train.', 'Unless hurry you, you will miss the train.'], 'Unless মানে If…not। তাই unless-এর পরে আবার not বসালে দুবার না বলা হয়ে যায়। আর unless-এর পরে will বসে না, present বসে।'));
PATCH('c5', 6, ord('বৃষ্টি না হলে আমরা মাঠে যাব।', ['If', 'it', 'does', 'not', 'rain', 'we', 'will', 'go', 'to', 'the', 'field'], ['would', 'is'], 'Type 1: If + Present (does not rain), will + verb।', [['we', 'will', 'go', 'to', 'the', 'field', 'if', 'it', 'does', 'not', 'rain']]));
ADD('c5', typ('তুমি যদি পরিশ্রম না করো, ফেল করবে।', ['If you do not work hard, you will fail.', 'If you don’t work hard, you will fail.', 'If you do not study hard, you will fail.', 'If you don’t study hard, you will fail.'], 'Type 1: If + present, will + verb।'));
ADD('c5',
  tr('যদি তুমি গতকাল আমাকে জিজ্ঞেস করতে, আমি সাহায্য করতাম।', 'If you had asked me yesterday, I would have helped.', ['If you had asked me yesterday, I would have helped.', 'If you asked me yesterday, I would help.', 'If you have asked me yesterday, I would have helped.', 'If you had asked me yesterday, I will help.'], 'অতীতে যা ঘটেনি তা নিয়ে (গতকাল) Type 3: If + had + V3, would have + V3।'),
  fill('I will call you as soon as I ___ home.', 'reach', ['reach', 'will reach', 'would reach', 'reached'], 'as soon as, when, before, after-এর পরে ভবিষ্যৎ বোঝালেও present tense বসে: as soon as I reach।'),
  mcq('Which is a correct Type 2 sentence?', 'If I lived in Cox’s Bazar, I would swim every day.', ['If I lived in Cox’s Bazar, I would swim every day.', 'If I lived in Cox’s Bazar, I will swim every day.', 'If I live in Cox’s Bazar, I would swim every day.', 'If I had lived in Cox’s Bazar, I would swim every day.'], 'Type 2: If + Past Simple (lived), would + verb। বাস্তবে আমি সেখানে থাকি না, তাই কল্পনার রূপ।')
);
PATCH('c6', 0, fill('Wearing a helmet is the law, so you ___ wear one while riding a bike.', 'must', ['must', 'might', 'can'], 'must = অবশ্যই (আইন বা বাধ্যবাধকতা)। might = হতেও পারে। can = পারা।'));
ADD('c6',
  fill('___ I come in, sir?', 'May', ['May', 'Did', 'Must'], 'অনুমতি চাইতে ভদ্রভাবে May I…? বলি।'),
  fill('He was absent ___ illness.', 'because of', ['because of', 'because', 'although'], 'because of + noun (illness)। because + পুরো বাক্য (subject + verb)।'),
  mat([['agree', 'with'], ['apologise', 'for'], ['complain', 'about'], ['succeed', 'in']], 'agree with, apologise for, complain about, succeed in। এই জোড়াগুলো একসাথে মনে রাখতে হয়।')
);
PATCH('d1', 0, fill('It was ___ unique experience.', 'a', ['a', 'an', 'the'], 'unique-এর উচ্চারণ ‘ইউনিক’, শুরুটা য়-ধ্বনি (ব্যঞ্জন), বানানে u থাকলেও। তাই a unique। বানান নয়, উচ্চারণ দেখো।'));
ADD('d1',
  fill('She plays ___ violin beautifully.', 'the', ['the', 'a', '(কিছু বসবে না)'], 'বাদ্যযন্ত্রের নামের আগে the বসে: the violin, the guitar।'),
  fill('I have never seen ___ more beautiful sunset.', 'a', ['a', 'an', 'the'], 'sunset একটি গোনা যায় এমন জিনিস, আর more শব্দটা ব্যঞ্জন ধ্বনিতে শুরু, তাই a more beautiful sunset।'),
  mcq('Choose the correct sentence.', 'Rarely do we see such a beautiful sunset.', ['Rarely do we see such a beautiful sunset.', 'Rarely we see such a beautiful sunset.', 'Rarely we do see such a beautiful sunset.', 'Rarely do we sees such a beautiful sunset.'], 'Rarely, seldom, never-এর মতো নেতিবাচক শব্দ শুরুতে বসলে inversion হয়: Rarely do we see। do-এর পরে verb মূল রূপে।')
);
PATCH('d2', 0, mcq('Synonym of ‘ample’', 'sufficient', ['sufficient', 'scarce', 'tiny', 'weak'], 'ample = যথেষ্ট, প্রচুর। sufficient একই অর্থের কাছাকাছি। scarce মানে দুষ্প্রাপ্য, যা উল্টো অর্থ।'));
ADD('d2',
  mcq('Synonym of ‘huge’', 'enormous', ['enormous', 'tiny', 'narrow', 'calm'], 'huge = বিশাল। enormous একই অর্থের। tiny মানে খুব ছোট।'),
  mcq('Antonym of ‘ancient’', 'modern', ['modern', 'old', 'historic', 'dusty'], 'ancient = অতি প্রাচীন। উল্টো modern (আধুনিক)। old আর historic প্রায় একই দিকের অর্থ।'),
  mcq('Which word means ‘to look at something for a long time’?', 'stare', ['stare', 'glance', 'blink', 'peek'], 'stare = অনেকক্ষণ তাকিয়ে থাকা। glance = এক পলক দেখা। peek = উঁকি দেওয়া।')
);
ADD('d3', typ('আমি সিদ্ধান্তটা পিছিয়ে দিলাম।', ['I put off the decision.', 'I postponed the decision.'], 'put off = পিছিয়ে দেওয়া। অতীত হলেও put off-ই থাকে (put-put-put)।'));
ADD('d3',
  fill('Please ___ your shoes before entering the room.', 'take off', ['take off', 'take on', 'take in'], 'take off = খুলে ফেলা (জুতো, জামা)। take on = দায়িত্ব নেওয়া। take in = বুঝে নেওয়া।'),
  fill('The thief ___ with the money before the police came.', 'got away', ['got away', 'got up', 'got on'], 'get away = পালিয়ে যাওয়া। get up = ওঠা। get on = বাসে ওঠা বা মিলেমিশে চলা।'),
  mat([['find out', 'জানতে পারা'], ['set up', 'প্রতিষ্ঠা করা'], ['break down', 'নষ্ট হয়ে যাওয়া'], ['come across', 'হঠাৎ পেয়ে যাওয়া']], 'find out = আবিষ্কার করা বা জানতে পারা। set up = চালু বা প্রতিষ্ঠা করা। break down = অচল হওয়া। come across = হঠাৎ কিছু পেয়ে যাওয়া।')
);
ADD('d4', typ('সে বলল, “আমি ক্লান্ত।”', ['He said that he was tired.', 'He said he was tired.', 'She said that she was tired.', 'She said she was tired.'], 'Reported speech-এ present বদলে past হয়: am → was।'));
ADD('d4',
  mcq('Direct: “Close the window,” he said to me. Indirect:', 'He told me to close the window.', ['He told me to close the window.', 'He said me to close the window.', 'He asked me close the window.', 'He told me that close the window.'], 'আদেশের indirect: told/ordered + object + to + verb। ‘said me’ বলা যায় না।'),
  mcq('Direct: She said, “I went to Sylhet yesterday.” Indirect:', 'She said that she had gone to Sylhet the day before.', ['She said that she had gone to Sylhet the day before.', 'She said that she goes to Sylhet the day before.', 'She said that I had gone to Sylhet the day before.', 'She said that she has gone to Sylhet yesterday.'], 'Past Simple → Past Perfect (went → had gone), আর yesterday → the day before। পুরুষও বদলায়: I → she।'),
  tr('শিক্ষক আমাকে জিজ্ঞেস করলেন আমার নাম কী।', 'The teacher asked me what my name was.', ['The teacher asked me what my name was.', 'The teacher asked me what was my name.', 'The teacher said me what my name was.', 'The teacher asked me what name my.'], 'প্রশ্ন indirect হলে সাধারণ বাক্যের মতো সাজে: what my name was। আর said to বদলে asked।')
);
PATCH('d5', 0, mcq('Find the error: “The books on the table is mine.”', 'is → are', ['is → are', 'on → in', 'mine → my', 'The → A'], 'মূল subject হলো books (বহুবচন)। on the table শুধু জায়গা বোঝায়, তাই verb হবে are।'));
PATCH('d5', 5, fill('The scissors ___ on the table.', 'are', ['are', 'is', 'was'], 'scissors, trousers, glasses-এর মতো জোড়া জিনিস বহুবচন, তাই are। একটাকে বোঝাতে a pair of scissors বললে verb একবচন (is)।'));
ADD('d5',
  mcq('Find the error: “Despite of the rain, we went out.”', 'Despite of → Despite', ['Despite of → Despite', 'went → go', 'we → us', 'the → a'], 'Despite-এর সাথে of বসে না। ঠিক: Despite the rain, অথবা In spite of the rain।'),
  mcq('Find the error: “He is one of the best player in the team.”', 'player → players', ['player → players', 'best → good', 'He → She', 'in → at'], 'one of the + বহুবচন noun: one of the best players।'),
  mcq('Find the error: “She said me that she was tired.”', 'said me → told me', ['said me → told me', 'was → is', 'tired → tire', 'No error'], 'said-এর পরে সরাসরি person বসে না: said to me। ব্যক্তি থাকলে told me বলি।')
);
ADD('d6',
  fill('Not until the teacher arrived ___ the noise stop.', 'did', ['did', 'does', 'had'], 'Not until শুরুতে বসলে inversion হয়: did the noise stop। did-এর পরে verb মূল রূপে।'),
  fill('He is the man ___ car was stolen.', 'whose', ['whose', 'who', 'which'], 'whose = যার (মালিকানা বোঝায়)। the man whose car = যে লোকের গাড়ি।'),
  tr('যত দ্রুত সম্ভব আমাকে জানিও।', 'Let me know as soon as possible.', ['Let me know as soon as possible.', 'Let me know as soon as possibly.', 'Let me know soon as possible.', 'Let me to know as soon as possible.'], 'as soon as possible একটি স্থির রূপ। Let-এর পরে to বসে না: Let me know।')
);

/* ================= v1.1: নতুন পাঠ — Beginner ================= */
L('l7', 'A', 3, 'রঙ আর সংখ্যা', '🎨', [
  pick('red', '🔴', ['🔴', '🔵', '🟢', '🟡'], 'red মানে লাল।'),
  pick('blue', '🔵', ['🔵', '🔴', '🟢', '🟡'], 'blue মানে নীল। আকাশ আর সমুদ্র blue।'),
  wtr('green', 'সবুজ', ['সবুজ', 'হলুদ', 'কালো', 'সাদা'], 'green মানে সবুজ। ধানখেত আর গাছের পাতা green।'),
  wtr('yellow', 'হলুদ', ['হলুদ', 'লাল', 'নীল', 'সবুজ'], 'yellow মানে হলুদ। সূর্যমুখী ফুল yellow।'),
  wtr('seven', 'সাত', ['সাত', 'ছয়', 'নয়', 'আট'], 'seven = 7 (সাত)। six = ছয়, eight = আট, nine = নয়।'),
  mat([['এক', 'one'], ['দুই', 'two'], ['তিন', 'three'], ['চার', 'four']], 'one = এক, two = দুই, three = তিন, four = চার।'),
  fill('I have ___ eyes.', 'two', ['two', 'three', 'ten'], 'আমাদের দুটি চোখ, তাই two eyes। এক-এর বেশি হলে noun-এর শেষে s বসে।'),
  tr('আমার একটি লাল ব্যাগ আছে।', 'I have a red bag.', ['I have a red bag.', 'I have red a bag.', 'I has a red bag.', 'I am a red bag.'], '‘I’-এর সাথে have বসে। রঙ noun-এর ঠিক আগে বসে: a red bag, ‘red a bag’ নয়।'),
  ord('আকাশটা নীল।', ['The', 'sky', 'is', 'blue'], ['red', 'are'], 'sky একটি, তাই is। The sky is blue।'),
  fill('Two plus three is ___.', 'five', ['five', 'six', 'four'], '2 + 3 = 5। five মানে পাঁচ। six = ছয়, four = চার।'),
  typ('আমার তিনটি বই আছে।', ['I have three books.', 'I have 3 books.'], 'three মানে তিন। একের বেশি হলে books (বহুবচন)।')
]);
L('l10', 'A', 3, 'পশুপাখি', '🐄', [
  pick('cow', '🐄', ['🐄', '🐐', '🐈', '🐕'], 'cow মানে গরু।'),
  pick('cat', '🐈', ['🐈', '🐕', '🐄', '🐦'], 'cat মানে বিড়াল। কুকুর হলো dog।'),
  pick('bird', '🐦', ['🐦', '🐟', '🐈', '🐐'], 'bird মানে পাখি।'),
  wtr('goat', 'ছাগল', ['ছাগল', 'গরু', 'হাঁস', 'মুরগি'], 'goat মানে ছাগল। গরু হলো cow।'),
  wtr('duck', 'হাঁস', ['হাঁস', 'মুরগি', 'কাক', 'ময়ূর'], 'duck মানে হাঁস। মুরগি হলো hen বা chicken।'),
  mat([['মুরগি', 'hen'], ['কুকুর', 'dog'], ['ঘোড়া', 'horse'], ['হাতি', 'elephant']], 'hen = মুরগি, dog = কুকুর, horse = ঘোড়া, elephant = হাতি।'),
  fill('A cat says ___.', 'meow', ['meow', 'moo', 'quack'], 'বিড়াল ডাকে meow, গরু ডাকে moo, হাঁস ডাকে quack।'),
  tr('আমার একটি কুকুর আছে।', 'I have a dog.', ['I have a dog.', 'I has a dog.', 'I have dog a.', 'I am a dog.'], '‘I’-এর সাথে have বসে। একটি = a।'),
  ord('গরু দুধ দেয়।', ['A', 'cow', 'gives', 'milk'], ['give', 'eat'], 'cow একটি, তাই verb-এ s বসে: gives। A cow gives milk।'),
  fill('A bird can ___ in the sky.', 'fly', ['fly', 'swim', 'run'], 'পাখি আকাশে উড়ে, তাই fly। can-এর পরে verb মূল রূপে বসে।'),
  typ('আমি বিড়াল ভালোবাসি।', ['I love cats.', 'I like cats.', 'I love cat.'], 'ভালোবাসা = love। সাধারণভাবে বোঝাতে cats (বহুবচন): I love cats।')
]);
L('l8', 'A', 4, 'আপনজন', '👨‍👩‍👧', [
  wtr('mother', 'মা', ['মা', 'বাবা', 'দাদি', 'বোন'], 'mother মানে মা। আদর করে mom বা mum-ও বলে।'),
  wtr('father', 'বাবা', ['বাবা', 'ভাই', 'চাচা', 'দাদা'], 'father মানে বাবা। আদর করে dad বলে।'),
  mat([['ভাই', 'brother'], ['বোন', 'sister'], ['দাদি', 'grandmother'], ['চাচা', 'uncle']], 'brother = ভাই, sister = বোন, grandmother = দাদি বা নানি, uncle = চাচা, মামা, কাকা।'),
  fill('She is my ___. She cooks for us.', 'mother', ['mother', 'school', 'rice'], 'She মানে সে (মেয়ে)। যে রান্না করে দেয়, সে আমার মা: She is my mother।'),
  tr('সে আমার ভাই।', 'He is my brother.', ['He is my brother.', 'She is my brother.', 'He are my brother.', 'He is me brother.'], 'ছেলে হলে He, মেয়ে হলে She। আমার = my (me নয়)।'),
  fill('I have two ___.', 'sisters', ['sisters', 'sister', 'a sister'], 'two মানে একের বেশি, তাই বহুবচন: sisters।'),
  ord('আমার দাদু গল্প বলেন।', ['My', 'grandfather', 'tells', 'stories'], ['tell', 'are'], 'grandfather একজন, তাই verb-এ s: tells। My grandfather tells stories।'),
  pick('baby', '👶', ['👶', '👴', '👩', '🧒'], 'baby মানে শিশু (ছোট্ট বাচ্চা)।'),
  tr('আমরা চারজন।', 'We are four.', ['We are four.', 'We is four.', 'We am four.', 'We four are.'], 'We-এর সাথে are বসে। চার = four।'),
  wtr('family', 'পরিবার', ['পরিবার', 'বন্ধু', 'প্রতিবেশী', 'শিক্ষক'], 'family মানে পরিবার।'),
  typ('আমার একটি ছোট বোন আছে।', ['I have a little sister.', 'I have a younger sister.', 'I have a small sister.'], 'ছোট বোন = little sister বা younger sister। I-এর সাথে have।')
]);
L('l9', 'A', 4, 'আমার রোজকার দিন', '⏰', [
  wtr('wake up', 'ঘুম থেকে ওঠা', ['ঘুম থেকে ওঠা', 'ঘুমিয়ে পড়া', 'স্নান করা', 'খেলতে যাওয়া'], 'wake up মানে ঘুম ভেঙে ওঠা। ঘুমাতে যাওয়া বলি go to bed।'),
  mat([['brush', 'ব্রাশ করা'], ['bath', 'গোসল'], ['breakfast', 'সকালের নাস্তা'], ['sleep', 'ঘুমানো']], 'brush = ব্রাশ করা, bath = গোসল, breakfast = সকালের নাস্তা, sleep = ঘুমানো।'),
  fill('I go to bed ___ night.', 'at', ['at', 'of', 'to'], 'রাত বোঝাতে at night বলি: I go to bed at night।'),
  tr('আমি সকালে স্কুলে যাই।', 'I go to school in the morning.', ['I go to school in the morning.', 'I go to school at the morning.', 'I go school in the morning.', 'I am go to school in the morning.'], 'সকাল, দুপুর, বিকেলের আগে in the: in the morning। যাওয়া বোঝাতে go to school।'),
  ord('আমি ছয়টায় ঘুম থেকে উঠি।', ['I', 'wake', 'up', 'at', 'six'], ['in', 'am'], 'ঘড়ির সময়ের আগে at বসে: at six।'),
  fill('She ___ breakfast at 8 o’clock.', 'has', ['has', 'have', 'having'], 'She-এর সাথে have হয়ে যায় has। has breakfast = সকালের নাস্তা করা।'),
  pick('clock', '⏰', ['⏰', '📱', '🕯️', '🔔'], 'clock মানে ঘড়ি।'),
  tr('তুমি কখন ঘুমাতে যাও?', 'When do you go to bed?', ['When do you go to bed?', 'When you go to bed?', 'When do you goes to bed?', 'When are you go to bed?'], 'প্রশ্নে Do আগে বসে, তারপর verb মূল রূপে: When do you go?'),
  wtr('afternoon', 'বিকেল', ['বিকেল', 'সকাল', 'রাত', 'সন্ধ্যা'], 'afternoon = দুপুরের পর থেকে সন্ধ্যার আগের সময়, বিকেল। evening = সন্ধ্যা।'),
  fill('He ___ his teeth every morning.', 'brushes', ['brushes', 'brush', 'brushing'], 'He-এর সাথে verb-এ s/es বসে। brush-এর শেষে sh, তাই es: brushes।'),
  typ('আমি রাতে বই পড়ি।', ['I read books at night.', 'I read a book at night.', 'I read at night.'], 'রাত বোঝাতে at night। I-এর সাথে read।')
]);

/* ================= v1.1: নতুন পাঠ — Medium ================= */
L('b7', 'B', 3, 'প্রশ্ন বানাই', '❓', [
  mat([['What', 'কী'], ['Where', 'কোথায়'], ['When', 'কখন'], ['Why', 'কেন']], 'What = কী, Where = কোথায়, When = কখন, Why = কেন। প্রশ্ন বানাতে এগুলো বাক্যের শুরুতে বসে।'),
  fill('___ is your name?', 'What', ['What', 'Where', 'When'], 'নাম জানতে চাইলে What: What is your name?'),
  fill('___ do you live?', 'Where', ['Where', 'Who', 'Which'], 'থাকার জায়গা জানতে Where: Where do you live?'),
  fill('___ is that boy? He is my cousin.', 'Who', ['Who', 'What', 'Where'], 'মানুষ সম্পর্কে জানতে চাইলে Who। উত্তরে সম্পর্ক বলা হয়েছে (cousin)।'),
  tr('তুমি কখন স্কুলে যাও?', 'When do you go to school?', ['When do you go to school?', 'When you go to school?', 'When does you go to school?', 'When do you goes to school?'], 'প্রশ্নের শব্দ (When) + do + subject + verb-এর মূল রূপ: When do you go?'),
  ord('তোমার বাড়ি কোথায়?', ['Where', 'is', 'your', 'house'], ['are', 'do'], 'house একটি, তাই is। Where is your house?'),
  mcq('Choose the correct question.', 'Where does she live?', ['Where does she live?', 'Where she lives?', 'Where does she lives?', 'Where do she live?'], 'she-এর সাথে does, আর does থাকলে মূল verb-এ s লাগে না: Where does she live?'),
  fill('___ are you crying? Are you hurt?', 'Why', ['Why', 'Who', 'Which'], 'কারণ জানতে চাইলে Why।'),
  tr('এই বইয়ের দাম কত?', 'How much is this book?', ['How much is this book?', 'How many is this book?', 'How much are this book?', 'What much is this book?'], 'দাম জানতে How much। book একটি, তাই is।'),
  typ('তোমার ফোন নম্বর কত?', ['What is your phone number?', 'What is your mobile number?', 'What’s your phone number?', 'What’s your mobile number?'], 'নম্বর জানতে What: What is your phone number?')
]);
L('b8', 'B', 3, 'বিশেষণ আর ক্রিয়াবিশেষণ', '🌈', [
  fill('She is a ___ driver.', 'careful', ['careful', 'carefully', 'care'], 'noun (driver)-এর আগে adjective বসে: careful driver।'),
  fill('She drives ___.', 'carefully', ['carefully', 'careful', 'care'], 'verb (drives) কেমন করে হয়, সেটা adverb দিয়ে বলি: carefully (careful + ly)।'),
  mat([['quick', 'quickly'], ['slow', 'slowly'], ['happy', 'happily'], ['easy', 'easily']], 'adjective-এর শেষে ly যোগ করে adverb হয়। শেষে y থাকলে y বদলে i হয়ে ily: happy → happily।'),
  fill('He speaks English very ___.', 'well', ['well', 'good', 'nice'], 'good একটি adjective। verb (speaks) কেমন করে হয় বলতে adverb well বসে।'),
  mcq('Choose the correct sentence.', 'The train runs fast.', ['The train runs fast.', 'The train runs fastly.', 'The train runs fasting.', 'The train run fast.'], 'fast শব্দটা adjective আর adverb দুটোই, আলাদা ly রূপ নেই। ‘fastly’ বলে কোনো শব্দ নেই।'),
  fill('The tea is too ___. I cannot drink it.', 'hot', ['hot', 'fastly', 'slowly'], 'tea বিশেষ্য, তার অবস্থা বলতে adjective বসে। too hot মানে এত গরম যে খাওয়া যায় না।'),
  tr('সে খুব সুন্দর গান গায়।', 'She sings very beautifully.', ['She sings very beautifully.', 'She sings very beautiful.', 'She sing very beautifully.', 'She is sings very beautifully.'], 'গান গাওয়া (verb) কেমন, তাই adverb beautifully। She-এর সাথে sings।'),
  fill('It is a ___ big house.', 'very', ['very', 'much', 'many'], 'adjective (big)-এর আগে very বসে: very big। much ও many পরিমাণ বা সংখ্যা বোঝায়।'),
  ord('সে ধীরে ধীরে হাঁটে।', ['She', 'walks', 'slowly'], ['slow', 'walk'], 'verb (walks) কেমন করে হয়, তাই adverb slowly।'),
  typ('সে সুন্দরভাবে লেখে।', ['She writes beautifully.', 'She writes nicely.', 'He writes beautifully.', 'He writes nicely.'], 'verb (writes) কেমন করে হয়, তাই adverb: beautifully বা nicely।')
]);
L('b9', 'B', 4, 'জায়গা আর দিক', '📍', [
  fill('The book is ___ the table.', 'on', ['on', 'in', 'between'], 'কোনো কিছুর ওপরে ছুঁয়ে থাকলে on: on the table, on the wall।'),
  fill('The coins are ___ my pocket.', 'in', ['in', 'on', 'between'], 'ভেতরে থাকলে in: in my pocket, in the box।'),
  mat([['above', 'ওপরে'], ['under', 'নিচে'], ['behind', 'পিছনে'], ['near', 'কাছে']], 'above = ওপরে, under = নিচে, behind = পিছনে, near = কাছে।'),
  fill('The cat is sleeping ___ the sofa.', 'under', ['under', 'between', 'during'], 'নিচে থাকলে under। between মাঝখানে, during সময় বোঝায়।'),
  fill('Rina sits ___ Tania and Ria.', 'between', ['between', 'over', 'during'], 'দুজনের মাঝখানে between। তিনজন বা বেশির মধ্যে হলে among।'),
  mcq('Choose the correct sentence.', 'The teacher divided the sweets among the five children.', ['The teacher divided the sweets among the five children.', 'The teacher divided the sweets between the five children.', 'The teacher divided the sweets above the five children.', 'The teacher divided the sweets during the five children.'], 'দুইয়ের বেশি জনের মধ্যে ভাগ হলে among। দুইজনের মধ্যে হলে between।'),
  tr('স্কুলটা মসজিদের পাশে।', 'The school is next to the mosque.', ['The school is next to the mosque.', 'The school is next the mosque.', 'The school are next to the mosque.', 'The school is next on the mosque.'], 'পাশে = next to। school একটি, তাই is।'),
  ord('ব্যাগটা চেয়ারের পিছনে আছে।', ['The', 'bag', 'is', 'behind', 'the', 'chair'], ['under', 'are'], 'পিছনে = behind। bag একটি, তাই is।'),
  fill('She lives ___ Chattogram.', 'in', ['in', 'of', 'by'], 'শহর, জেলা বা দেশের নামের আগে in: in Dhaka, in Bangladesh।'),
  fill('I am waiting ___ the bus stop.', 'at', ['at', 'of', 'during'], 'নির্দিষ্ট স্থান-বিন্দুর (bus stop, station, door) আগে at।'),
  wtr('opposite', 'বিপরীত', ['বিপরীত', 'পাশে', 'ভেতরে', 'পেছনে'], 'opposite মানে বিপরীত দিকে। The bank is opposite the school।'),
  typ('আমার ব্যাগ টেবিলের নিচে আছে।', ['My bag is under the table.', 'My bag is below the table.'], 'নিচে = under। bag একটি, তাই is।')
]);
L('b10', 'B', 4, 'কতটা, কতগুলো?', '🧮', [
  fill('I do not have ___ money.', 'much', ['much', 'many', 'few'], 'টাকা গুনে বলা যায় না (uncountable), তাই much। many বসে গোনা যায় এমন বহুবচনের সাথে।'),
  fill('How ___ students are there in your class?', 'many', ['many', 'much', 'little'], 'student গুনে বলা যায়, তাই How many।'),
  fill('There is ___ milk in the glass.', 'a little', ['a little', 'a few', 'many'], 'uncountable (milk)-এর সাথে a little। গোনা যায় এমন (books)-এর সাথে a few।'),
  fill('I have ___ friends in Dhaka.', 'a few', ['a few', 'a little', 'much'], 'friends গুনে বলা যায়, তাই a few।'),
  mat([['some', 'কিছু'], ['no', 'একদমই নেই'], ['a lot of', 'অনেক'], ['every', 'প্রত্যেক']], 'some = কিছু, no = একদমই নেই, a lot of = অনেক, every = প্রত্যেক।'),
  fill('I do not have ___ questions.', 'any', ['any', 'some', 'a'], 'negative বাক্যে সাধারণত any বসে। ‘a questions’ ভুল, কারণ questions বহুবচন।'),
  mcq('Choose the correct sentence.', 'There are many people at the bus stop.', ['There are many people at the bus stop.', 'There is many people at the bus stop.', 'There are much people at the bus stop.', 'There are many person at the bus stop.'], 'people বহুবচন, তাই There are। গোনা যায় বলে many, much নয়।'),
  tr('আমার হাতে অনেক সময় নেই।', 'I do not have much time.', ['I do not have much time.', 'I do not have many time.', 'I have not much times.', 'I do not has much time.'], 'time গোনা যায় না, তাই much। do not-এর পরে verb-এর মূল রূপ: have।'),
  ord('আমার কাছে কয়েকটি কলম আছে।', ['I', 'have', 'a', 'few', 'pens'], ['little', 'much'], 'pen গুনে বলা যায়, তাই a few + বহুবচন (pens)।'),
  mcq('Choose the correct sentence.', 'She drinks a lot of water.', ['She drinks a lot of water.', 'She drinks a lot water.', 'She drink a lot of water.', 'She drinks lot of water.'], 'a lot of একসাথে বসে, of বাদ যায় না। She-এর সাথে drinks।'),
  typ('বাজারে অনেক মানুষ আছে।', ['There are many people in the market.', 'There are a lot of people in the market.', 'There are lots of people in the market.'], 'people বহুবচন, তাই There are। অনেক = many বা a lot of।')
]);

/* ================= v1.1: অস্পষ্ট অপশন সরানো ================= */
const NONE = '(কিছু বসবে না)';
const FIXQ = (id, key, fn) => {
  const l = LS_(id), i = l.qs.findIndex(q => (q.s || q.p || q.bn || q.en || q.word) === key);
  if (i < 0) throw new Error('fix target not found: ' + id + ' / ' + key);
  l.qs[i] = fn(l.qs[i]);
};
const SETO = (id, key, props) => FIXQ(id, key, q => Object.assign({}, q, props));

SETO('l7', 'I have ___ eyes.', { s: 'Every person has ___ eyes.', tip: 'আমাদের দুটি চোখ, তাই two eyes। একের বেশি হলে noun-এর শেষে s বসে।' });
SETO('b2', 'I need ___ umbrella today.', { opts: ['a', 'an', NONE], tip: 'যে শব্দের উচ্চারণ স্বরধ্বনি দিয়ে শুরু, তার আগে an। ‘umbrella’ শুরু হয় ‘আ’ ধ্বনি দিয়ে, তাই an umbrella।' });
SETO('b2', 'It is ___ hour-long video.', { opts: ['a', 'an', NONE] });
SETO('d1', 'It was ___ unique experience.', { opts: ['a', 'an', NONE] });
SETO('d1', 'She plays ___ violin beautifully.', { s: 'My father is ___ engineer.', ans: 'an', opts: ['a', 'an', NONE], tip: 'engineer শুরু হয় স্বরধ্বনি (এ) দিয়ে, তাই an engineer। বানান নয়, উচ্চারণ দেখো।' });
SETO('d1', 'I have never seen ___ more beautiful sunset.', { s: 'He works as ___ university teacher.', ans: 'a', opts: ['a', 'an', NONE], tip: 'university-এর উচ্চারণ ‘ইউনিভার্সিটি’, শুরুটা য়-ধ্বনি (ব্যঞ্জন)। বানানে u থাকলেও তাই a university।' });
SETO('c6', 'It ___ rain tonight, so take an umbrella.', { opts: ['may', 'shall', 'did'] });
SETO('c6', 'She is good ___ math.', { opts: ['at', 'for', 'on'] });
SETO('b8', 'The tea is too ___. I cannot drink it.', { opts: ['hot', 'hotly', 'heat'] });
SETO('b9', 'She lives ___ Chattogram.', { opts: ['in', 'of', 'to'] });
SETO('b10', 'I do not have ___ questions.', { opts: ['any', 'much', 'a'] });
SETO('b10', 'There is ___ milk in the glass.', { opts: ['a little', 'a few', 'many'] });
{
  const l = LS_('c2'), i = l.qs.findIndex(q => q.t === 'mat');
  l.qs[i] = mat([['The news', 'is good'], ['The police', 'are coming'], ['Mathematics', 'is difficult'], ['People', 'are kind']], 'news আর mathematics দেখতে বহুবচন হলেও একবচন (is)। police আর people বহুবচন (are)।');
}

/* ================= v1.1: Pro লেভেল ================= */
L('p1', 'P', 0, 'টেনসের সূক্ষ্ম ফারাক', '⏳', [
  mcq('Which sentence is correct?', 'I have known her since 2018.', ['I have known her since 2018.', 'I know her since 2018.', 'I am knowing her since 2018.', 'I knew her since 2018.'], 'know একটি stative verb, তাই continuous হয় না। since + শুরুর সময় থাকলে Present Perfect: have known।'),
  fill('She was tired because she ___ all night.', 'had been working', ['had been working', 'has been working', 'is working'], 'ক্লান্ত থাকার আগে থেকেই কাজ চলছিল। অতীতের আগের সময় ধরে চলা কাজ = Past Perfect Continuous: had been + V-ing।'),
  mcq('Choose the sentence with correct tense.', 'By the time he arrives, we will have finished dinner.', ['By the time he arrives, we will have finished dinner.', 'By the time he will arrive, we will have finished dinner.', 'By the time he arrives, we will finished dinner.', 'By the time he arrived, we will have finished dinner.'], 'By the time-এর পরের অংশে ভবিষ্যৎ বোঝালেও present (arrives) বসে। মূল বাক্য Future Perfect: will have + V3।'),
  fill('This time next week, I ___ on a beach in Cox’s Bazar.', 'will be lying', ['will be lying', 'lay', 'have lain'], 'ভবিষ্যতের নির্দিষ্ট মুহূর্তে কাজটা চলতে থাকবে = Future Continuous: will be + V-ing।'),
  tr('আমি দশ বছর ধরে এখানে থাকি।', 'I have lived here for ten years.', ['I have lived here for ten years.', 'I live here since ten years.', 'I am living here since ten years.', 'I have lived here since ten years.'], 'অতীতে শুরু হয়ে এখনো চলছে = Present Perfect। সময়ের পরিমাণ (ten years) থাকলে for, শুরুর সময় (2016) থাকলে since।'),
  mcq('Which sentence is correct?', 'I am having lunch right now.', ['I am having lunch right now.', 'I am having a car.', 'I am liking pizza.', 'I am understanding this.'], 'have যখন ‘খাওয়া’ অর্থে, তখন continuous হয়। ‘আছে’ অর্থে (have a car) আর like, understand-এর মতো stative verb continuous হয় না।'),
  fill('When I was a child, I ___ play cricket every evening.', 'used to', ['used to', 'am used to', 'was use to'], 'অতীতের অভ্যাস = used to + verb। am used to + V-ing মানে এখন অভ্যস্ত।'),
  ord('আমি আসার আগেই সে চলে গিয়েছিল।', ['She', 'had', 'left', 'before', 'I', 'arrived'], ['has', 'was'], 'যেটা আগে ঘটেছে সেটা Past Perfect (had left), যেটা পরে ঘটেছে সেটা Past Simple (arrived)।', [['before', 'I', 'arrived', 'she', 'had', 'left']]),
  fill('I ___ him since last Monday.', 'have not seen', ['have not seen', 'did not see', 'do not see', 'was not seeing'], 'since last Monday মানে শুরুর সময় থেকে এখন পর্যন্ত, তাই Present Perfect: have not seen।'),
  fill('You ___ told me earlier! Now it is too late.', 'should have', ['should have', 'must have', 'would have'], 'should have + V3 = আগে করা উচিত ছিল, কিন্তু করা হয়নি (আফসোস)।'),
  typ('আমি যখন ঘুমাচ্ছিলাম, তখন ফোন বেজে উঠল।', ['The phone rang while I was sleeping.', 'The phone rang when I was sleeping.', 'While I was sleeping, the phone rang.', 'When I was sleeping, the phone rang.'], 'যে কাজ চলছিল (was sleeping) সেটা Past Continuous, যা হঠাৎ ঘটল (rang) সেটা Past Simple।')
]);
L('p2', 'P', 0, 'অ্যাডভান্সড স্ট্রাকচার', '🏗️', [
  mcq('Choose the correct sentence.', 'Only after the exam did she realise her mistake.', ['Only after the exam did she realise her mistake.', 'Only after the exam she realised her mistake.', 'Only after the exam did she realised her mistake.', 'Only after the exam she did realise her mistake.'], 'Only + সময় বা শর্ত শুরুতে বসলে inversion হয়: did she realise। did-এর পরে verb মূল রূপে থাকে।'),
  mcq('Choose the correct sentence.', 'Little did he know that the plan had failed.', ['Little did he know that the plan had failed.', 'Little he knew that the plan had failed.', 'Little did he knew that the plan had failed.', 'Little he did know that the plan had failed.'], 'Little (প্রায় কিছুই না) শুরুতে বসলে inversion হয়: Little did he know। did-এর পরে know।'),
  fill('Under no circumstances ___ the door be opened.', 'should', ['should', 'is', 'does'], 'Under no circumstances শুরুতে বসলে inversion: modal আগে, subject পরে। should the door be opened।'),
  mcq('Choose the correct sentence.', 'It was Rina who solved the problem.', ['It was Rina who solved the problem.', 'It was Rina who solve the problem.', 'It was Rina who solving the problem.', 'It was Rina who was solved the problem.'], 'Cleft sentence: It was + জোর দেওয়া অংশ + who/that + বাকি অংশ। কে করেছে সেটাকে জোর দিতে এভাবে বলা হয়।'),
  fill('Not only ___ late, but he also forgot his books.', 'was he', ['was he', 'he was', 'did he was'], 'Not only শুরুতে বসলে inversion হয়। be-verb হলে was আগে: Not only was he late।'),
  tr('আমি তখন পড়াশোনা করলে আজ ডাক্তার হতাম।', 'If I had studied then, I would be a doctor today.', ['If I had studied then, I would be a doctor today.', 'If I studied then, I would be a doctor today.', 'If I had studied then, I will be a doctor today.', 'If I have studied then, I would be a doctor today.'], 'Mixed conditional: অতীতের শর্ত (had studied), বর্তমানের ফল (would be)। এখানে ‘today’ বর্তমানের ফল বোঝায়।'),
  mcq('Choose the correct sentence.', 'Having been warned, he avoided the road.', ['Having been warned, he avoided the road.', 'Having warned, he avoided the road.', 'Been warned, he avoided the road.', 'Having been warn, he avoided the road.'], 'Having been + V3 = সতর্ক করা হয়েছিল বলে (passive participle)। এটা আগে ঘটেছে বোঝায়।'),
  mcq('Which sentence has correct parallel structure?', 'She likes reading, writing and painting.', ['She likes reading, writing and painting.', 'She likes reading, writing and to paint.', 'She likes to read, writing and painting.', 'She likes reading, to write and painting.'], 'তালিকার সব অংশ একই রূপে হতে হয় (parallel structure)। এখানে সবগুলো V-ing: reading, writing, painting।'),
  mcq('Choose the correct sentence.', 'Were I rich, I would travel the world.', ['Were I rich, I would travel the world.', 'Was I rich, I would travel the world.', 'Did I rich, I would travel the world.', 'If were I rich, I would travel the world.'], 'If I were rich-এর If বাদ দিলে inversion হয়: Were I rich…। এখানে If আর inversion একসাথে বসে না।'),
  ord('কেবল তখনই আমি সত্যিটা বুঝলাম।', ['Only', 'then', 'did', 'I', 'understand', 'the', 'truth'], ['do', 'understood'], 'Only then শুরুতে বসলে inversion: did I understand। did-এর পরে verb মূল রূপে।')
]);
L('p3', 'P', 1, 'শব্দের শক্তি', '📚', [
  mcq('Meaning of ‘ubiquitous’', 'found everywhere', ['found everywhere', 'extremely rare', 'very ancient', 'easily broken'], 'ubiquitous = সর্বত্র বিদ্যমান। যেমন: Smartphones are ubiquitous today।'),
  mcq('Meaning of ‘meticulous’', 'very careful about details', ['very careful about details', 'careless', 'quick-tempered', 'shy'], 'meticulous = খুঁটিনাটি নিয়ে অত্যন্ত সতর্ক।'),
  mcq('Synonym of ‘ephemeral’', 'short-lived', ['short-lived', 'permanent', 'heavy', 'ordinary'], 'ephemeral = ক্ষণস্থায়ী। কাছের শব্দ: fleeting, transient। permanent মানে স্থায়ী, যা উল্টো।'),
  mcq('Antonym of ‘frugal’', 'extravagant', ['extravagant', 'thrifty', 'careful', 'poor'], 'frugal = মিতব্যয়ী। উল্টো extravagant (অপব্যয়ী)। thrifty আসলে frugal-এর কাছাকাছি, ফাঁদে পড়ো না।'),
  fill('Her ___ speech moved the whole audience to tears.', 'eloquent', ['eloquent', 'mundane', 'tedious'], 'eloquent = বাকপটু, প্রাঞ্জল ও প্রভাবশালী। mundane = একঘেয়ে সাধারণ, tedious = ক্লান্তিকর।'),
  mat([['candid', 'খোলামেলা'], ['vague', 'অস্পষ্ট'], ['diligent', 'পরিশ্রমী'], ['obsolete', 'সেকেলে, অচল']], 'candid = খোলাখুলি সৎ, vague = অস্পষ্ট, diligent = পরিশ্রমী, obsolete = যা আর ব্যবহার হয় না।'),
  mcq('Which word means ‘to make a problem less severe’?', 'alleviate', ['alleviate', 'aggravate', 'accumulate', 'abandon'], 'alleviate = প্রশমিত করা। aggravate = আরও খারাপ করা (উল্টো)।'),
  mcq('Antonym of ‘hostile’', 'friendly', ['friendly', 'aggressive', 'angry', 'distant'], 'hostile = শত্রুভাবাপন্ন। উল্টো friendly (বন্ধুত্বপূর্ণ)।'),
  fill('Despite the heavy criticism, she remained ___ and did not change her decision.', 'resolute', ['resolute', 'hesitant', 'fragile'], 'resolute = দৃঢ়সংকল্প। hesitant = দ্বিধাগ্রস্ত, যা সিদ্ধান্ত না বদলানোর সাথে মেলে না।'),
  mcq('Closest meaning of ‘inevitable’', 'certain to happen', ['certain to happen', 'easy to avoid', 'hard to believe', 'impossible to see'], 'inevitable = অনিবার্য, যা এড়ানো যায় না।'),
  wtr('benevolent', 'দয়ালু ও পরোপকারী', ['দয়ালু ও পরোপকারী', 'নিষ্ঠুর', 'বোকা', 'লোভী'], 'benevolent = শুভেচ্ছাপরায়ণ, পরোপকারী।')
]);
L('p4', 'P', 1, 'ইডিয়ম আর প্রবাদ', '🎭', [
  mcq('‘Break the ice’ means:', 'start a conversation in an awkward situation', ['start a conversation in an awkward situation', 'break something frozen', 'get very angry', 'run away quickly'], 'break the ice = আড়ষ্টতা কাটিয়ে আলাপ শুরু করা।'),
  mcq('‘Spill the beans’ means:', 'reveal a secret', ['reveal a secret', 'waste food', 'cook dinner', 'tell a lie'], 'spill the beans = গোপন কথা ফাঁস করে দেওয়া।'),
  mcq('‘Once in a blue moon’ means:', 'very rarely', ['very rarely', 'every night', 'suddenly', 'very loudly'], 'once in a blue moon = কালেভদ্রে, খুব কম।'),
  mcq('‘Piece of cake’ means:', 'something very easy', ['something very easy', 'a sweet gift', 'a small portion', 'something dangerous'], 'piece of cake = খুব সহজ কাজ।'),
  fill('He is under the ___ today, so he is staying in bed.', 'weather', ['weather', 'rain', 'sky'], 'under the weather = একটু অসুস্থ বা শরীর খারাপ।'),
  mat([['hit the sack', 'ঘুমাতে যাওয়া'], ['cost an arm and a leg', 'অত্যন্ত দামি হওয়া'], ['burn the midnight oil', 'রাত জেগে কাজ বা পড়া'], ['a blessing in disguise', 'খারাপ থেকে আসা ভালো কিছু']], 'hit the sack = ঘুমাতে যাওয়া। cost an arm and a leg = খুব দামি। burn the midnight oil = রাত জাগা। a blessing in disguise = প্রথমে খারাপ লাগলেও পরে ভালো প্রমাণিত হওয়া।'),
  mcq('Which idiom means ‘to be very happy’?', 'over the moon', ['over the moon', 'down in the dumps', 'under the weather', 'at a loss'], 'over the moon = খুব খুশি। down in the dumps = মন খারাপ।'),
  fill('Don’t cry over spilt ___; what is done is done.', 'milk', ['milk', 'water', 'tea'], 'cry over spilt milk = যা হয়ে গেছে তা নিয়ে আফসোস করা।'),
  mcq('‘The ball is in your court’ means:', 'it is your turn to decide or act', ['it is your turn to decide or act', 'you are good at sports', 'you are being blamed', 'the game has ended'], 'the ball is in your court = এখন সিদ্ধান্ত বা পদক্ষেপ নেওয়ার পালা তোমার।'),
  mcq('Choose the idiom that fits: “We have been working for ten hours. Let’s ___.”', 'call it a day', ['call it a day', 'break the ice', 'spill the beans', 'cost an arm'], 'call it a day = আজকের মতো কাজ শেষ করা।')
]);
L('p5', 'P', 1, 'কলোকেশন', '🧩', [
  fill('She ___ a big mistake in the exam.', 'made', ['made', 'did', 'took'], 'mistake-এর সাথে make বসে: make a mistake।'),
  fill('Can you ___ me a favour?', 'do', ['do', 'make', 'give'], 'favour-এর সাথে do বসে: do someone a favour।'),
  fill('We had ___ rain all day yesterday.', 'heavy', ['heavy', 'strong', 'big'], 'rain-এর সাথে heavy: heavy rain। strong চলে tea, coffee, wind-এর সাথে।'),
  fill('I like my tea ___.', 'strong', ['strong', 'heavy', 'big'], 'tea, coffee-র সাথে strong বসে: strong tea।'),
  mat([['make', 'a promise'], ['do', 'homework'], ['take', 'a photo'], ['have', 'a shower']], 'make a promise, do homework, take a photo, have a shower। এগুলো নির্দিষ্ট জোড়ায় বসে, মুখস্থ করতে হয়।'),
  mcq('Which phrase is correct?', 'break a promise', ['break a promise', 'crack a promise', 'tear a promise', 'smash a promise'], 'প্রতিশ্রুতি ভাঙা = break a promise। break a record, break a rule-ও বলা হয়।'),
  mcq('Choose the correct word: a ___ of fish', 'school', ['school', 'herd', 'pack', 'flock'], 'মাছের ঝাঁক = school, গরুর পাল = herd, নেকড়ের দল = pack, পাখির ঝাঁক = flock।'),
  fill('Let’s ___ a break; we have been studying for hours.', 'take', ['take', 'make', 'do'], 'take a break = একটু বিরতি নেওয়া।'),
  fill('The police ___ an arrest last night.', 'made', ['made', 'did', 'took'], 'arrest-এর সাথে make: make an arrest।'),
  mcq('Which sentence sounds natural?', 'She has a high fever.', ['She has a high fever.', 'She has a tall fever.', 'She has a big fever.', 'She has a long fever.'], 'fever-এর সাথে high বসে: a high fever।')
]);
L('p6', 'P', 2, 'কনফিউজিং ওয়ার্ডস', '🌀', [
  fill('The new rule will ___ all students.', 'affect', ['affect', 'effect', 'affects'], 'affect (verb) = প্রভাবিত করা। effect (noun) = প্রভাব বা ফল। will-এর পরে verb মূল রূপে।'),
  fill('Sleeping late has a bad ___ on health.', 'effect', ['effect', 'affect', 'affects'], 'a bad effect: a-এর পরে noun বসে, তাই effect।'),
  fill('The ___ of our school gave a speech.', 'principal', ['principal', 'principle', 'principals'], 'principal = প্রধান শিক্ষক বা প্রধান। principle = নীতি।'),
  fill('Honesty is a basic ___ of life.', 'principle', ['principle', 'principal', 'principally'], 'principle = নীতি বা আদর্শ। principal = প্রধান।'),
  mcq('Choose the correct word: “Please ___ my apology.”', 'accept', ['accept', 'except', 'expect', 'excerpt'], 'accept = গ্রহণ করা। except = ছাড়া। expect = আশা করা।'),
  mcq('Choose the correct word: “Everyone came ___ Rafi.”', 'except', ['except', 'accept', 'expect', 'access'], 'except = ছাড়া। Everyone came except Rafi = রফি ছাড়া সবাই এসেছে।'),
  fill('Be careful! The knot is too ___ and may open.', 'loose', ['loose', 'lose', 'lost'], 'loose (adjective) = আলগা। lose (verb) = হারানো। lost = হারিয়ে গেছে।'),
  fill('Don’t ___ your wallet in the crowd.', 'lose', ['lose', 'loose', 'loss'], 'lose (verb) = হারানো। Don’t-এর পরে verb মূল রূপে বসে।'),
  mcq('Which sentence is correct?', 'I need your advice on this matter.', ['I need your advice on this matter.', 'I need your advise on this matter.', 'I need you advice on this matter.', 'I need your advices on this matter.'], 'advice (noun) = উপদেশ, uncountable। advise (verb) = উপদেশ দেওয়া।'),
  mat([['stationery', 'কলম-খাতা ইত্যাদি'], ['stationary', 'স্থির'], ['compliment', 'প্রশংসা'], ['complement', 'পরিপূরক']], 'stationery = লেখার সামগ্রী, stationary = স্থির, compliment = প্রশংসা, complement = যা কিছু সম্পূর্ণ করে।'),
  fill('___ going to win the match tomorrow.', 'They’re', ['They’re', 'Their', 'There'], 'They’re = They are। Their = তাদের। There = সেখানে।')
]);
L('p7', 'P', 2, 'এরর হান্টার প্রো', '🔎', [
  mcq('Find the error: “Between you and I, the plan will fail.”', 'I → me', ['I → me', 'Between → Among', 'will → would', 'No error'], 'preposition (between)-এর পরে object pronoun বসে: between you and me।'),
  mcq('Find the error: “She is the taller of the three sisters.”', 'taller → tallest', ['taller → tallest', 'of → in', 'three → third', 'No error'], 'তিন বা তার বেশির মধ্যে সবচেয়ে বোঝাতে superlative: the tallest। দুজনের মধ্যে হলে taller।'),
  mcq('Find the error: “I have less friends than he has.”', 'less → fewer', ['less → fewer', 'friends → friend', 'than → then', 'has → have'], 'গুনে বলা যায় এমন বহুবচনের সাথে fewer। less বসে uncountable-এর সাথে (less money)।'),
  mcq('Find the error: “Walking down the road, a snake bit him.”', 'a snake bit him → he was bitten by a snake', ['a snake bit him → he was bitten by a snake', 'Walking → Walked', 'road → roads', 'No error'], 'Walking-এর কর্তা হওয়া উচিত যে হাঁটছিল (he), সাপ নয়। এটাকে dangling modifier বলে।'),
  mcq('Find the error: “Me and Rafi went to the market.”', 'Me and Rafi → Rafi and I', ['Me and Rafi → Rafi and I', 'went → go', 'the → a', 'No error'], 'subject হিসেবে I বসে, me নয়। আর ভদ্রতার নিয়মে অন্যজনের নাম আগে: Rafi and I।'),
  mcq('Find the error: “The man whom lives next door is a doctor.”', 'whom → who', ['whom → who', 'lives → live', 'next → near', 'No error'], 'এখানে সে নিজেই কাজটা করছে (lives), তাই subject হিসেবে who বসে। whom বসে object-এর জায়গায়।'),
  mcq('Find the error: “She is not only intelligent but also works hard.”', 'works hard → hard-working', ['works hard → hard-working', 'not only → no only', 'is → are', 'No error'], 'not only … but also-এর দুই পাশের অংশ একই ধরনের হতে হয়। intelligent (adjective), তাই hard-working (adjective)।'),
  mcq('Find the error: “I prefer coffee than tea.”', 'than → to', ['than → to', 'prefer → preferred', 'coffee → coffees', 'No error'], 'prefer X to Y: coffee to tea। prefer-এর সাথে than বসে না।'),
  mcq('Find the error: “The book which I bought it is expensive.”', 'remove “it”', ['remove “it”', 'which → who', 'bought → buy', 'No error'], 'which নিজেই book-এর কাজ করছে, তাই আলাদা করে it বসে না (বাংলাভাষীদের চেনা ভুল)।'),
  mcq('Find the error: “I am agree with you.”', 'am agree → agree', ['am agree → agree', 'with → to', 'you → your', 'No error'], 'agree নিজেই verb, তাই am লাগে না: I agree with you।'),
  mcq('Find the error: “He explained me the problem.”', 'explained me the problem → explained the problem to me', ['explained me the problem → explained the problem to me', 'explained → explain', 'the → a', 'No error'], 'explain-এর সাথে সরাসরি person বসে না। বলি: explained the problem to me।')
]);
L('p8', 'P', 2, 'ফর্মাল ইংরেজি', '🎩', [
  mcq('Choose the more formal word for ‘ask for’.', 'request', ['request', 'beg', 'demand', 'chase'], 'ফর্মাল লেখায় ask for-এর বদলে request। demand মানে জোর দিয়ে দাবি।'),
  mcq('Choose the formal sentence.', 'We require further information.', ['We require further information.', 'We want more info.', 'We need some more stuff.', 'We gotta know more.'], 'ফর্মাল ভাষায় require, further, information বসে। info, stuff, gotta কথ্য ভাষার শব্দ।'),
  mcq('Which opening is suitable for a formal email to a principal?', 'Dear Sir/Madam,', ['Dear Sir/Madam,', 'Hey there!', 'Yo, Principal!', 'What’s up,'], 'ফর্মাল চিঠি বা ইমেইলের শুরুতে Dear Sir/Madam বসে।'),
  mat([['get', 'obtain'], ['buy', 'purchase'], ['show', 'demonstrate'], ['end', 'terminate']], 'get → obtain, buy → purchase, show → demonstrate, end → terminate। ডানদিকের শব্দগুলো বেশি ফর্মাল।'),
  mcq('Choose the most polite request.', 'Could you possibly send me the file by Friday?', ['Could you possibly send me the file by Friday?', 'Send me the file by Friday.', 'You must send the file by Friday.', 'Give me the file Friday.'], 'Could you possibly…? সবচেয়ে ভদ্র রূপ। আদেশের সুরের বাক্য ফর্মাল অনুরোধে চলে না।'),
  mcq('Which sentence is suitable for a formal application?', 'I am writing to apply for the post of Assistant Teacher.', ['I am writing to apply for the post of Assistant Teacher.', 'I wanna be your assistant teacher.', 'Hi! I need a teaching job.', 'Give me the teacher job please.'], 'আবেদনপত্রে I am writing to apply for… দিয়ে শুরু করা হয়।'),
  fill('Please find the report ___ with this email.', 'attached', ['attached', 'attaching', 'attach'], 'ইমেইলে বলি: Please find the report attached (সংযুক্ত করা হয়েছে)।'),
  mcq('Choose the formal word that means “start”.', 'commence', ['commence', 'conclude', 'continue', 'cancel'], 'commence = শুরু করা (ফর্মাল)। conclude = শেষ করা।'),
  mcq('Which word is informal?', 'kids', ['kids', 'children', 'offspring', 'juveniles'], 'kids কথ্য ভাষার শব্দ। children সাধারণ-ফর্মাল, offspring আর juveniles আরও ফর্মাল।'),
  mcq('How should you end a formal letter that begins with “Dear Sir/Madam”?', 'Yours faithfully,', ['Yours faithfully,', 'Love,', 'See ya,', 'Cheers mate,'], 'Dear Sir/Madam দিয়ে শুরু করলে শেষে Yours faithfully। নাম জানা থাকলে Yours sincerely।')
]);
L('p9', 'P', 2, 'প্রিপোজিশন প্রো', '🔗', [
  fill('She is allergic ___ dust.', 'to', ['to', 'with', 'of'], 'allergic to = কোনো কিছুতে অ্যালার্জি আছে।'),
  fill('He is responsible ___ the whole project.', 'for', ['for', 'of', 'to'], 'responsible for = দায়িত্বে থাকা।'),
  fill('We should comply ___ the rules.', 'with', ['with', 'to', 'for'], 'comply with = নিয়ম মেনে চলা।'),
  fill('The teacher was impressed ___ her answer.', 'by', ['by', 'at', 'for'], 'impressed by = মুগ্ধ হওয়া। (impressed with-ও বলা হয়)'),
  fill('He is prone ___ forgetting names.', 'to', ['to', 'for', 'of'], 'prone to = প্রবণ, যার ঝোঁক আছে। পরে verb+ing বসে: prone to forgetting।'),
  mcq('Choose the correct sentence.', 'She is capable of solving the problem.', ['She is capable of solving the problem.', 'She is capable to solve the problem.', 'She is capable for solving the problem.', 'She is capable in solve the problem.'], 'capable of + verb+ing = কোনো কাজে সক্ষম।'),
  mcq('Choose the correct sentence.', 'The shop is famous for its sweets.', ['The shop is famous for its sweets.', 'The shop is famous of its sweets.', 'The shop is famous by its sweets.', 'The shop is famous with its sweets.'], 'famous for = কিছুর জন্য বিখ্যাত।'),
  mat([['abide', 'by'], ['result', 'in'], ['refrain', 'from'], ['cope', 'with']], 'abide by (মেনে চলা), result in (ফল দেওয়া), refrain from (বিরত থাকা), cope with (সামলে নেওয়া)।'),
  fill('The film is similar ___ the one we watched last year.', 'to', ['to', 'with', 'from'], 'similar to = কিছুর মতো।'),
  fill('I am fed up ___ waiting.', 'with', ['with', 'to', 'at'], 'fed up with = কোনো কিছুতে বিরক্ত বা ক্লান্ত হয়ে যাওয়া।')
]);

const PASS_A = 'The Sundarbans is the largest mangrove forest in the world. It lies across Bangladesh and India, but most of it is in Bangladesh. The forest is home to the Royal Bengal tiger, spotted deer, and many kinds of birds. Because the trees grow in salty water, their roots rise above the mud to help them breathe.';
const PASS_B = 'Badhon used to waste an hour on her phone every night before bed. Last month, she decided to read a book instead. At first it felt boring, but after a week she started to enjoy it. Now she falls asleep faster and wakes up feeling fresh.';
const PASS_C = 'Rafi studied only the night before the exam. He read quickly and slept for just three hours. In the exam hall, he could not remember many answers. His friend Tania, who had studied a little every day for two weeks, finished early and scored full marks.';
L('p10', 'P', 3, 'পড়ে বোঝো', '📖', [
  mcq(PASS_A + '\n\nWhere is most of the Sundarbans located?', 'In Bangladesh', ['In Bangladesh', 'In India', 'In Myanmar', 'In Nepal'], 'দ্বিতীয় বাক্যে বলা আছে: most of it is in Bangladesh।'),
  mcq(PASS_A + '\n\nWhy do the roots rise above the mud?', 'To help the trees breathe', ['To help the trees breathe', 'To catch fish', 'To find fresh water', 'To scare tigers'], 'শেষ বাক্যে আছে: roots rise above the mud to help them breathe।'),
  mcq(PASS_A + '\n\nWhich animal is NOT mentioned in the passage?', 'Elephant', ['Elephant', 'Royal Bengal tiger', 'Spotted deer', 'Birds'], 'অনুচ্ছেদে tiger, deer আর birds আছে। elephant-এর কথা নেই।'),
  mcq(PASS_B + '\n\nWhat did Badhon do before bed in the past?', 'She used her phone for an hour', ['She used her phone for an hour', 'She read a book', 'She did homework', 'She watched TV'], 'প্রথম বাক্যে আছে: used to waste an hour on her phone।'),
  mcq(PASS_B + '\n\nHow did she feel about reading at first?', 'It felt boring', ['It felt boring', 'It felt exciting', 'It felt scary', 'It felt expensive'], 'At first it felt boring, কিন্তু এক সপ্তাহ পরে ভালো লাগতে শুরু করল।'),
  mcq(PASS_B + '\n\nWhat is the main idea of the passage?', 'A small habit change improved her sleep', ['A small habit change improved her sleep', 'Phones are not allowed at night', 'Books are very expensive', 'Badhon dislikes reading'], 'পুরো অনুচ্ছেদের মূল কথা: ফোনের বদলে বই পড়ায় তার ঘুম ভালো হয়েছে।'),
  mcq(PASS_C + '\n\nWhat can we infer about Rafi’s result?', 'He probably did not do well', ['He probably did not do well', 'He scored full marks', 'He finished early', 'He studied for two weeks'], 'সে পরীক্ষার হলে অনেক উত্তর মনে করতে পারেনি, তাই তার ফল সম্ভবত ভালো হয়নি।'),
  mcq(PASS_C + '\n\nHow did Tania prepare for the exam?', 'She studied a little every day', ['She studied a little every day', 'She studied only the night before', 'She did not study', 'She slept for three hours'], 'Tania দুই সপ্তাহ ধরে রোজ একটু একটু পড়েছিল।'),
  mcq(PASS_C + '\n\nThe word “scored” is closest in meaning to:', 'obtained', ['obtained', 'lost', 'hid', 'copied'], 'scored full marks = পুরো নম্বর পেয়েছে। obtained মানে অর্জন করা বা পাওয়া।')
]);

SETO('p5', 'We had ___ rain all day yesterday.', { opts: ['heavy', 'tall', 'big'] });


/* ================= v2.0: নতুন ধাঁচের প্রথম পাঠ (প্রতি মোডে) ================= */
const L2 = (id, band, unit, title, emoji, teach, qs) => { const k = LESSONS.findIndex(x => x.id === id); if (k >= 0) LESSONS.splice(k, 1); L(id, band, unit, title, emoji, qs); const l = LESSONS.pop(); l.full = true; l.teach = teach; LESSONS.splice(k >= 0 ? k : LESSONS.length, 0, l); };
L2('l1', 'A', 0, 'ভাত, মাছ, চা', '🍚', { t: 'ভাত খাই, চা পান করি', pts: ['খাবারের সাথে eat বসে: I eat rice.', 'পানীয়ের সাথে drink বসে: I drink tea.'], ex: [['I eat rice.', 'আমি ভাত খাই।'], ['I drink tea.', 'আমি চা পান করি।']] }, [
  pick('rice', '🍚', ['🍚', '🐟', '🥚', '🥭']),
  wtr('tea', 'চা', ['চা', 'ডিম', 'আম', 'রুটি'], 'tea মানে চা। চা পান করা হয়, তাই I drink tea।'),
  hear('I eat rice.', 'কী শুনলে?', 'আমি ভাত খাই।', ['আমি ভাত খাই।', 'আমি চা খাই।', 'আমি ভাত চাই।', 'আমি মাছ খাই।'], 'eat = খাই, rice = ভাত। দুটো শব্দ শুনেই ধরা যায়।'),
  mat([['ভাত', 'rice'], ['মাছ', 'fish'], ['আম', 'mango'], ['রুটি', 'bread']]),
  chat([['o', 'Do you want tea?']], 'Yes, please.', ['Yes, please.', 'Yes, I am tea.', 'No, tea eat.', 'Tea, I rice.'], 'কেউ চা চাইলে ভদ্রভাবে বলি: Yes, please.'),
  err('I drink rice every day.', 1, 'I eat rice every day.', 'ভাত drink করা হয় না, eat করা হয়। তাই drink ভুল।'),
  ord('আমি চা পান করি।', ['I', 'drink', 'tea'], ['eat', 'rice'], 'চা, দুধ, পানি drink করা হয়।'),
  typ('আমি ভাত খাই।', ['I eat rice.'], 'ভাত খাবার, তাই eat: I eat rice.')
]);
L2('b1', 'B', 0, 'ফোন আর নেট', '📱', { t: 'ফোনের ইংরেজি', pts: ['রোজকার অভ্যাসে Present Simple: I watch videos.', 'He/She/It-এর সাথে verb-এ s/es: She checks.', 'একবচনে is, বহুবচনে are: My phone is slow.'], ex: [['She checks her bKash balance.', 'সে তার বিকাশ ব্যালেন্স দেখে।'], ['My phone is not charging.', 'আমার ফোন চার্জ হচ্ছে না।']] }, [
  hear('I will send you the location on WhatsApp.', 'কী শুনলে?', 'আমি তোমাকে WhatsApp-এ লোকেশন পাঠাব।', ['আমি তোমাকে WhatsApp-এ লোকেশন পাঠাব।', 'আমি তোমার লোকেশন পেয়েছি।', 'তুমি আমাকে ফোন করো।', 'আমি লোকেশন মুছে ফেলেছি।'], 'will send = পাঠাব, location = লোকেশন।'),
  chat([['o', 'Did you get my message?'], ['m', 'Not yet. My internet is very slow.'], ['o', 'Try Wi-Fi.']], 'Okay, I will connect to Wi-Fi now.', ['Okay, I will connect to Wi-Fi now.', 'Okay, I connecting Wi-Fi now.', 'Okay, I connects to Wi-Fi now.', 'Okay, I am connect Wi-Fi now.'], 'সিদ্ধান্ত এখনই নিলে will: I will connect.'),
  mat([['মুছে ফেলা', 'delete'], ['সংযোগ', 'connection'], ['সংযুক্তি', 'attachment'], ['খোঁজা', 'search']]),
  fill('She ___ her bKash balance every morning.', 'checks', ['checks', 'check', 'checking', 'checked'], 'রোজকার অভ্যাস, আর She-এর সাথে verb-এ s বসে: checks।'),
  err('My phone are not charging properly.', 2, 'My phone is not charging properly.', 'phone একবচন, তাই are নয়, is বসবে।'),
  tr('আমি রোজ রাতে ইউটিউবে ভিডিও দেখি।', 'I watch videos on YouTube every night.', ['I watch videos on YouTube every night.', 'I watches videos on YouTube every night.', 'I am watch videos on YouTube every night.', 'I watching videos on YouTube every night.'], 'I-এর সাথে verb-এ s বসে না: I watch।'),
  ord('সে আমাকে একটা মেসেজ পাঠায়।', ['She', 'sends', 'me', 'a', 'message'], ['send', 'are'], 'She-এর সাথে sends।'),
  wtr('reply', 'উত্তর দেওয়া', ['উত্তর দেওয়া', 'মুছে ফেলা', 'বন্ধ করা', 'খুঁজে পাওয়া'], 'reply মানে মেসেজের উত্তর দেওয়া।'),
  typ('আমি ফোনে গেম খেলি।', ['I play games on my phone.'], 'I-এর সাথে verb মূল রূপে: I play।')
]);
L2('c1', 'C', 0, 'টেনস ওয়ার্ম-আপ', '⏳', { t: 'টেনস এক নজরে', pts: ['তখন চলছিল: Past Continuous (was eating)', 'অতীত থেকে এখন পর্যন্ত: Present Perfect (has sent, has been waiting)', 'অতীতের আগের ঘটনা: Past Perfect (had left)'], ex: [['She has been waiting for an hour.', 'সে এক ঘণ্টা ধরে অপেক্ষা করছে।'], ['The train had left.', 'ট্রেন আগেই ছেড়ে গিয়েছিল।']] }, [
  hear('She has been waiting for an hour.', 'কী শুনলে?', 'সে এক ঘণ্টা ধরে অপেক্ষা করছে।', ['সে এক ঘণ্টা ধরে অপেক্ষা করছে।', 'সে এক ঘণ্টা আগে অপেক্ষা করেছিল।', 'সে এক ঘণ্টা পরে অপেক্ষা করবে।', 'সে অপেক্ষা শেষ করেছে।'], 'has been waiting for = অতীত থেকে এখনো চলছে।'),
  fill('He ___ lunch when the power went out.', 'was eating', ['was eating', 'ate', 'is eating', 'has eaten'], 'বিদ্যুৎ যাওয়ার সময় খাওয়া চলছিল, তাই Past Continuous: was eating।'),
  err('She have already sent the money via bKash.', 1, 'She has already sent the money via bKash.', 'She-এর সাথে have নয়, has বসে।'),
  chat([['o', 'Why are you so late?']], 'The bus had already left when I reached the stop.', ['The bus had already left when I reached the stop.', 'The bus already leaves when I reached the stop.', 'The bus has already left when I had reached the stop.', 'The bus was already leave when I reached the stop.'], 'পৌঁছানোর আগেই বাস ছেড়েছে, তাই আগের ঘটনায় Past Perfect।'),
  mcq('Which sentence is correct?', 'I have lived here since 2019.', ['I have lived here since 2019.', 'I live here since 2019.', 'I am living here since 2019.', 'I lived here since 2019.'], 'since + শুরুর সময় থাকলে Present Perfect: have lived।'),
  clz('Tania ___ English for two years. Last month she ___ an IELTS course, and now she ___ for the exam.', ['has studied', 'joined', 'is preparing', 'study', 'join'], ['has studied', 'joined', 'is preparing'], 'for two years = has studied, Last month = joined, now = is preparing।'),
  mat([['Present Perfect', 'has/have + V3'], ['Past Continuous', 'was/were + V-ing'], ['Future Simple', 'will + V1'], ['Past Perfect', 'had + V3']]),
  ord('বৃষ্টি শুরু হওয়ার সময় আমরা ম্যাচ খেলছিলাম।', ['We', 'were', 'playing', 'when', 'it', 'started', 'to', 'rain'], ['played', 'was'], 'খেলা চলছিল, তাই were playing।', [['when', 'it', 'started', 'to', 'rain', 'we', 'were', 'playing']]),
  typ('সে গতকাল থেকে অসুস্থ।', ['She has been ill since yesterday.', 'She has been sick since yesterday.'], 'গতকাল থেকে এখনো, তাই has been + since।')
]);
L2('p1', 'P', 0, 'টেনসের সূক্ষ্ম ফারাক', '⏳', { t: 'সূক্ষ্ম ফারাক', pts: ['since + শুরুর সময়, for + সময়ের দৈর্ঘ্য', 'know, have-এর মতো state verb সাধারণত continuous হয় না', 'By the time + present হলে ভবিষ্যতে will have + V3'], ex: [['She has been working here for five years.', 'সে পাঁচ বছর ধরে এখানে কাজ করছে।'], ['By the time he arrives, we will have finished.', 'সে পৌঁছানোর মধ্যে আমরা শেষ করে ফেলব।']] }, [
  mcq('Which sentence is correct?', 'I have known her since 2018.', ['I have known her since 2018.', 'I know her since 2018.', 'I am knowing her since 2018.', 'I knew her since 2018.'], 'know একটি state verb, আর since আছে, তাই have known।'),
  err('She has been working here since five years.', 5, 'She has been working here for five years.', 'পাঁচ বছর মানে সময়ের দৈর্ঘ্য, তাই for। since বসে শুরুর সময়ের সাথে।'),
  hear('By this time next week, I will have finished the report.', 'কী শুনলে?', 'আগামী সপ্তাহের এই সময়ের মধ্যে আমি রিপোর্টটা শেষ করে ফেলব।', ['আগামী সপ্তাহের এই সময়ের মধ্যে আমি রিপোর্টটা শেষ করে ফেলব।', 'গত সপ্তাহে আমি রিপোর্টটা শেষ করেছি।', 'আমি এখন রিপোর্ট লিখছি।', 'আমি রিপোর্টটা লিখতে পারিনি।'], 'will have finished = ভবিষ্যতের কোনো সময়ের মধ্যে শেষ হয়ে যাবে।'),
  chat([['o', 'I tried calling you at ten last night.']], 'Sorry, I had already fallen asleep by then.', ['Sorry, I had already fallen asleep by then.', 'Sorry, I have already fall asleep by then.', 'Sorry, I already sleeping by then.', 'Sorry, I was already sleep by then.'], 'রাত দশটার আগেই ঘুমিয়ে পড়েছিলাম, তাই Past Perfect।'),
  fill('She was tired because she ___ all night.', 'had been working', ['had been working', 'has been working', 'is working', 'will work'], 'ক্লান্ত হওয়ার আগে থেকে কাজ চলছিল, তাই Past Perfect Continuous।'),
  clz('Hasan ___ the report before the meeting started, so he ___ calm during the presentation. If he ___ late, he would have panicked.', ['had finished', 'felt', 'had been', 'finish', 'feel'], ['had finished', 'felt', 'had been'], 'before + অতীত = had finished, so he = felt, If + Type 3 = had been।'),
  tr('আমি দশ বছর ধরে এখানে থাকি।', 'I have lived here for ten years.', ['I have lived here for ten years.', 'I live here since ten years.', 'I am living here since ten years.', 'I have lived here since ten years.'], 'দশ বছর = সময়ের দৈর্ঘ্য, তাই for।'),
  ord('সে আমাকে জানিয়েছিল যে সে আগেই পৌঁছে গেছে।', ['She', 'told', 'me', 'that', 'she', 'had', 'already', 'arrived'], ['has', 'was'], 'জানানোর আগেই পৌঁছেছে, তাই had arrived।'),
  typ('আমি এখানে পাঁচ বছর ধরে কাজ করছি।', ['I have been working here for five years.', 'I have worked here for five years.'], 'এখনো চলছে, তাই Present Perfect + for।')
]);


L2('l2', 'A', 0, 'আমি খাই, আমি চাই', '🍛', { t: 'চাই আর ভালো লাগে', pts: ['চাইলে want: I want tea.', 'ভালো লাগলে like: I like fish.'], ex: [['I want rice.', 'আমি ভাত চাই।'], ['I like mango.', 'আমার আম ভালো লাগে।']] }, [
  fill('I ___ tea every morning.', 'drink', ['drink', 'eat', 'sleep', 'run'], 'চা পান করা হয়, তাই drink।'),
  tr('আমি মাছ চাই।', 'I want fish.', ['I want fish.', 'I wants fish.', 'I am want fish.', 'I fish want.'], 'I-এর সাথে want, s বসে না।'),
  hear('I like mango.', 'কী শুনলে?', 'আমার আম ভালো লাগে।', ['আমার আম ভালো লাগে।', 'আমি আম চাই।', 'আমি আম খাই।', 'আমার আম নেই।'], 'like = ভালো লাগা, mango = আম।'),
  clz('Rafi ___ rice every day. His sister ___ tea. They both ___ mangoes.', ['eats', 'drinks', 'like', 'drink', 'sleep'], ['eats', 'drinks', 'like'], 'Rafi, His sister একজন, তাই eats, drinks। They-এর সাথে like।'),
  mcq('Rina gets up at six. She drinks tea and eats bread. Then she goes to school.\n\nWhat does Rina eat in the morning?', 'Bread', ['Bread', 'Rice', 'Fish', 'Mango'], 'গল্পে আছে: eats bread।'),
  mcq('Rina gets up at six. She drinks tea and eats bread. Then she goes to school.\n\nWhen does Rina get up?', 'At six', ['At six', 'At seven', 'At eight', 'At five'], 'গল্পের প্রথম লাইনে: gets up at six।'),
  mat([['চা', 'tea'], ['ডিম', 'egg'], ['পানি', 'water'], ['দুধ', 'milk']]),
  ord('আমি রুটি খেতে চাই।', ['I', 'want', 'to', 'eat', 'bread'], ['drink', 'is'], 'want to + verb: want to eat।'),
  typ('আমি চা চাই।', ['I want tea.'], 'I want tea. চাই = want।')
]);
L2('b2', 'B', 0, 'অনলাইন লাইফ', '🌐', { t: 'অনলাইনে নিরাপদ থাকা', pts: ['উপদেশে should: You should check the seller.', 'পরিকল্পনায় be going to: I am going to order a phone.', 'স্বরধ্বনি দিয়ে শুরু হলে an, নইলে a।'], ex: [['You should not share your OTP.', 'OTP কাউকে দেওয়া উচিত নয়।'], ['I am going to buy a charger.', 'আমি একটা চার্জার কিনতে যাচ্ছি।']] }, [
  mcq('Sadia saw a Facebook page selling phones at half price. She wanted to send money by bKash at once, but her brother stopped her. He said, "Check the page first. Many fake pages cheat people."\n\nWhy did her brother stop her?', 'The page might be fake.', ['The page might be fake.', 'The phone was too big.', 'She had no bKash account.', 'It was too late at night.'], 'ভাই বলেছে অনেক ভুয়া পেজ মানুষকে ঠকায়।'),
  mcq('Sadia saw a Facebook page selling phones at half price. She wanted to send money by bKash at once, but her brother stopped her. He said, "Check the page first. Many fake pages cheat people."\n\nWhat should Sadia do first?', 'Check the page.', ['Check the page.', 'Send money quickly.', 'Delete bKash.', 'Buy two phones.'], 'ভাইয়ের কথা: Check the page first।'),
  clz('Last week I ___ a charger online. It ___ two days to arrive, and now it ___ perfectly.', ['bought', 'took', 'works', 'buy', 'take'], ['bought', 'took', 'works'], 'Last week = bought, অতীতে took, now = works।'),
  fill('You ___ share your OTP with anyone.', 'should not', ['should not', 'must to', 'can be', 'are not'], 'উপদেশ বা নিষেধে should not।'),
  mcq('Choose the correct sentence.', 'I am going to order a phone tomorrow.', ['I am going to order a phone tomorrow.', 'I going to order a phone tomorrow.', 'I am go to order a phone tomorrow.', 'I will to order a phone tomorrow.'], 'পরিকল্পনায় am/is/are + going to + verb।'),
  chat([['o', 'Is this seller trustworthy?']], 'I am not sure. Let us check the reviews first.', ['I am not sure. Let us check the reviews first.', 'I not sure. Let us check the reviews first.', 'I am not sure. Let us checking the reviews first.', 'I am no sure. Let us to check the reviews first.'], 'I am not sure। Let us + verb মূল রূপে।'),
  hear('Please do not click on unknown links.', 'কী শুনলে?', 'অচেনা লিংকে ক্লিক কোরো না।', ['অচেনা লিংকে ক্লিক কোরো না।', 'এই লিংকটা পাঠিয়ে দাও।', 'লিংকটা খুলে দেখো।', 'লিংকটা মুছে ফেলেছি।'], 'do not click = ক্লিক কোরো না, unknown = অচেনা।'),
  err('I bought an new phone yesterday.', 2, 'I bought a new phone yesterday.', 'new শুরু ব্যঞ্জনধ্বনি দিয়ে, তাই an নয়, a।'),
  tr('এই অফারটা আগামীকাল শেষ হবে।', 'This offer will end tomorrow.', ['This offer will end tomorrow.', 'This offer will ends tomorrow.', 'This offer is end tomorrow.', 'This offer will ended tomorrow.'], 'will-এর পরে verb মূল রূপে: will end।')
]);
L2('c2', 'C', 0, 'সাবজেক্ট-ভার্ব মিল', '🤝', { t: 'Subject আর Verb-এর মিল', pts: ['Each, every, everyone-এর পরে একবচন verb: Everyone is ready.', 'news, furniture-এর মতো শব্দে একবচন verb: The news is bad.', 'police-এ বহুবচন verb: The police are here.'], ex: [['Everyone is ready.', 'সবাই প্রস্তুত।'], ['The news is shocking.', 'খবরটা চমকে দেওয়ার মতো।']] }, [
  mcq('Everyone in the team works hard, but the news from the head office is worrying. The company is planning to close two branches, and the staff are afraid of losing their jobs.\n\nWhat is the staff worried about?', 'Losing their jobs', ['Losing their jobs', 'Moving to a new city', 'Getting a bonus', 'Working fewer hours'], 'afraid of losing their jobs থেকে বোঝা যায়।'),
  mcq('Everyone in the team works hard, but the news from the head office is worrying. The company is planning to close two branches, and the staff are afraid of losing their jobs.\n\nWho is planning to close two branches?', 'The company', ['The company', 'The staff', 'The team', 'The customers'], 'The company is planning to close two branches।'),
  fill('Each of the students ___ a different book.', 'has', ['has', 'have', 'are having', 'were'], 'Each-এর পরে একবচন, তাই has।'),
  err('The news about the exam are shocking.', 5, 'The news about the exam is shocking.', 'news একবচন, তাই are নয়, is।'),
  clz('Everyone ___ here now. The furniture in the room ___ old, but the chairs ___ comfortable.', ['is', 'is', 'are', 'has', 'have'], ['is', 'is', 'are'], 'Everyone, furniture একবচন (is), chairs বহুবচন (are)।'),
  wtr('reluctant', 'অনিচ্ছুক', ['অনিচ্ছুক', 'উৎসাহী', 'ক্লান্ত', 'সন্দেহজনক'], 'reluctant = কিছু করতে অনিচ্ছুক।'),
  tr('প্রত্যেক ছাত্রের একটা আইডি কার্ড আছে।', 'Every student has an ID card.', ['Every student has an ID card.', 'Every student have an ID card.', 'Every students has an ID card.', 'Every student are having an ID card.'], 'Every + একবচন noun + has।'),
  mcq('Choose the correct sentence.', 'The police are searching for the thief.', ['The police are searching for the thief.', 'The police is searching for the thief.', 'The police was search for the thief.', 'The police searches for the thief.'], 'police সবসময় বহুবচন, তাই are।'),
  hear('Neither of them was late.', 'কী শুনলে?', 'তাদের কেউই দেরি করেনি।', ['তাদের কেউই দেরি করেনি।', 'তারা দুজনেই দেরি করেছিল।', 'তাদের একজন দেরি করেছিল।', 'তারা কেউ আসেনি।'], 'Neither of them = তাদের কেউই নয়।'),
  chat([['o', 'Are the results out yet?']], 'Yes, the results are on the notice board.', ['Yes, the results are on the notice board.', 'Yes, the results is on the notice board.', 'Yes, the result are on the notice board.', 'Yes, the results was on the notice board.'], 'results বহুবচন, তাই are।')
]);
L2('p2', 'P', 0, 'অ্যাডভান্সড স্ট্রাকচার', '🏗️', { t: 'জটিল গঠন', pts: ['Inversion: Never have I seen such a crowd.', 'Passive: The report was submitted by Rafi.', 'Wish: I wish I had more time.'], ex: [['Never have I seen such a crowd.', 'এমন ভিড় আমি কখনো দেখিনি।'], ['I wish I had more time.', 'আমার যদি আরও সময় থাকত!']] }, [
  mcq('Although the project was nearly finished, the manager insisted that it be reviewed once more. Had he skipped the review, a small error in the budget would have gone unnoticed, costing the company thousands.\n\nWhat does the passage suggest about the review?', 'It prevented a costly mistake.', ['It prevented a costly mistake.', 'It delayed the project for years.', 'It was a waste of time.', 'It was done by the staff alone.'], 'রিভিউ না হলে ভুল ধরা পড়ত না, মানে রিভিউ ক্ষতি ঠেকিয়েছে।'),
  mcq('Although the project was nearly finished, the manager insisted that it be reviewed once more. Had he skipped the review, a small error in the budget would have gone unnoticed, costing the company thousands.\n\nWhat would have happened without the review?', 'An error would have gone unnoticed.', ['An error would have gone unnoticed.', 'The project would have been cancelled.', 'The manager would have resigned.', 'The budget would have doubled.'], 'Had he skipped... would have gone unnoticed।'),
  wtr('meticulous', 'অত্যন্ত খুঁতখুঁতে ও যত্নশীল', ['অত্যন্ত খুঁতখুঁতে ও যত্নশীল', 'অলস ও উদাসীন', 'রাগী', 'খুব দ্রুত'], 'meticulous = প্রতিটা খুঁটিনাটি যত্ন করে দেখে।'),
  mat([['Inversion', 'Never have I seen this.'], ['Passive', 'The report was written by Rafi.'], ['Conditional', 'If I had time, I would help.'], ['Reported speech', 'She said that she was tired.']]),
  fill('Never ___ such a beautiful sunset.', 'have I seen', ['have I seen', 'I have seen', 'I saw', 'did I seen'], 'Never বাক্যের শুরুতে এলে auxiliary আগে বসে: have I seen।'),
  err('If I would have known, I would have helped.', 2, 'If I had known, I would have helped.', 'If-এর অংশে would বসে না, Past Perfect বসে: had known।'),
  tr('আমার যদি আরও সময় থাকত!', 'I wish I had more time.', ['I wish I had more time.', 'I wish I have more time.', 'I wish I would have more time.', 'I wish I am having more time.'], 'বর্তমানের অপূর্ণ ইচ্ছায় wish + Past Simple।'),
  hear('Hardly had he arrived when the lights went out.', 'কী শুনলে?', 'সে পৌঁছাতে না পৌঁছাতেই আলো চলে গেল।', ['সে পৌঁছাতে না পৌঁছাতেই আলো চলে গেল।', 'সে পৌঁছানোর অনেক পরে আলো গেল।', 'আলো যাওয়ার আগে সে অপেক্ষা করছিল।', 'সে আলো জ্বালিয়ে পৌঁছাল।'], 'Hardly had... when = ...মাত্রই।'),
  typ('রিপোর্টটা গতকাল জমা দেওয়া হয়েছিল।', ['The report was submitted yesterday.', 'The report was handed in yesterday.'], 'Passive: was + V3।')
]);


L2('l3', 'A', 1, 'যানবাহন', '🚌', { t: 'কীসে যাই?', pts: ['যানবাহনের আগে by বসে: by bus, by train।', 'I/We/They-এর সাথে go, She/He-এর সাথে goes।'], ex: [['I go by bus.', 'আমি বাসে যাই।'], ['She goes by train.', 'সে ট্রেনে যায়।']] }, [
  pick('bus', '🚌', ['🚌', '🚆', '✈️', '🚗']),
  pick('boat', '⛵', ['⛵', '✈️', '🚗', '🚌']),
  hear('I go by bus.', 'কী শুনলে?', 'আমি বাসে যাই।', ['আমি বাসে যাই।', 'আমি ট্রেনে যাই।', 'আমি হেঁটে যাই।', 'আমি বাস চাই।'], 'by bus = বাসে।'),
  mat([['রিকশা', 'rickshaw'], ['নৌকা', 'boat'], ['ট্রেন', 'train'], ['বিমান', 'plane']]),
  fill('I go to school ___ rickshaw.', 'by', ['by', 'at', 'on', 'to'], 'যানবাহনের আগে by: by rickshaw।'),
  chat([['o', 'How do you go to school?']], 'I go by bus.', ['I go by bus.', 'I goes by bus.', 'I bus go.', 'I am go bus.'], 'I-এর সাথে go, আর by + যানবাহন।'),
  err('She go to school by train.', 1, 'She goes to school by train.', 'She-এর সাথে goes বসে।'),
  ord('আমরা নৌকায় যাই।', ['We', 'go', 'by', 'boat'], ['goes', 'on'], 'by boat = নৌকায়।'),
  typ('আমি ট্রেনে যাই।', ['I go by train.'], 'by train = ট্রেনে।')
]);
L2('b3', 'B', 1, 'ক্রিকেট আর আড্ডা', '🏏', { t: 'অতীতের গল্প', pts: ['গতকালের ঘটনায় Past Simple: Bangladesh won.', 'অনিয়মিত verb: go → went, buy → bought, see → saw।', 'প্রশ্নে did + verb মূল রূপে: Did you watch it?'], ex: [['We watched the match last night.', 'আমরা কাল রাতে ম্যাচ দেখেছি।'], ['Did you see the last over?', 'তুমি শেষ ওভারটা দেখেছ?']] }, [
  chat([['o', 'Did you watch the match last night?']], 'Yes, I did. We won by two runs!', ['Yes, I did. We won by two runs!', 'Yes, I did. We win by two runs!', 'Yes, I do. We won by two runs!', 'Yes, I did. We wined by two runs!'], 'Did-এর উত্তরে Yes, I did। জেতা অতীতের ঘটনা, তাই won।'),
  hear('We watched the match with our friends.', 'কী শুনলে?', 'আমরা বন্ধুদের সাথে ম্যাচ দেখেছি।', ['আমরা বন্ধুদের সাথে ম্যাচ দেখেছি।', 'আমরা বন্ধুদের সাথে ম্যাচ দেখব।', 'আমরা বন্ধুদের সাথে ম্যাচ খেলেছি।', 'আমি বন্ধুকে ম্যাচ দেখিয়েছি।'], 'watched = দেখেছি (অতীত)।'),
  fill('Bangladesh ___ the match yesterday.', 'won', ['won', 'win', 'wins', 'winning'], 'yesterday = অতীত, win-এর past হলো won।'),
  err('We goed to the field after school.', 1, 'We went to the field after school.', 'go অনিয়মিত: go → went, goed নয়।'),
  mat([['see', 'saw'], ['eat', 'ate'], ['buy', 'bought'], ['run', 'ran']]),
  clz('Last night we ___ biryani, ___ the match, and ___ home very late.', ['ate', 'watched', 'went', 'eat', 'watch'], ['ate', 'watched', 'went'], 'Last night = অতীত: ate, watched, went।'),
  tr('তুমি কি গতকাল খেলেছিলে?', 'Did you play yesterday?', ['Did you play yesterday?', 'Do you played yesterday?', 'Did you played yesterday?', 'Are you play yesterday?'], 'did-এর পরে verb মূল রূপে: play।'),
  ord('সে শেষ বলে একটা ছক্কা মেরেছিল।', ['He', 'hit', 'a', 'six', 'on', 'the', 'last', 'ball'], ['hits', 'hitted'], 'hit-এর past রূপও hit।'),
  typ('আমরা গতকাল ম্যাচ জিতেছি।', ['We won the match yesterday.'], 'win → won।')
]);
L2('c3', 'C', 1, 'রাইট ফর্ম', '✍️', { t: 'ing নাকি to?', pts: ['enjoy, finish, avoid, mind-এর পরে verb+ing: enjoy eating', 'want, hope, decide, plan-এর পরে to + verb: want to buy', 'stop + ing = কাজটা বন্ধ করা'], ex: [['She enjoys eating street food.', 'সে স্ট্রিট ফুড খেতে ভালোবাসে।'], ['I want to buy a new phone.', 'আমি নতুন ফোন কিনতে চাই।']] }, [
  fill('She enjoys ___ street food.', 'eating', ['eating', 'to eat', 'eat'], 'enjoy-এর পরে verb+ing।'),
  fill('I want ___ a new phone.', 'to buy', ['to buy', 'buying', 'buy'], 'want-এর পরে to + verb।'),
  err('He avoided to answer my question.', 2, 'He avoided answering my question.', 'avoid-এর পরে verb+ing বসে: avoided answering।'),
  chat([['o', 'Why are you still awake?']], 'I cannot stop thinking about tomorrow’s exam.', ['I cannot stop thinking about tomorrow’s exam.', 'I cannot stop to thinking about tomorrow’s exam.', 'I cannot stop think about tomorrow’s exam.', 'I cannot stop thought about tomorrow’s exam.'], 'stop + ing = কাজটা বন্ধ করতে না পারা।'),
  hear('She decided to study abroad.', 'কী শুনলে?', 'সে বিদেশে পড়তে যাওয়ার সিদ্ধান্ত নিয়েছে।', ['সে বিদেশে পড়তে যাওয়ার সিদ্ধান্ত নিয়েছে।', 'সে বিদেশে পড়াশোনা শেষ করেছে।', 'সে বিদেশে পড়তে চায় না।', 'সে বিদেশ থেকে ফিরে এসেছে।'], 'decide to = সিদ্ধান্ত নেওয়া।'),
  clz('I really enjoy ___ English, and I plan ___ an IELTS course. I hope ___ a good score.', ['learning', 'to join', 'to get', 'learn', 'join'], ['learning', 'to join', 'to get'], 'enjoy + ing, plan + to, hope + to।'),
  tr('তুমি কি গান শুনতে ভালোবাসো?', 'Do you enjoy listening to music?', ['Do you enjoy listening to music?', 'Do you enjoy to listen to music?', 'Do you enjoy listen to music?', 'Are you enjoy listening to music?'], 'enjoy + verb+ing।'),
  fill('You should stop ___ your time on Facebook.', 'wasting', ['wasting', 'to waste', 'waste'], 'stop + ing = কাজটা বন্ধ করা।'),
  ord('আমি শিক্ষক হওয়ার সিদ্ধান্ত নিয়েছি।', ['I', 'decided', 'to', 'become', 'a', 'teacher'], ['becoming', 'become'], 'decide-এর পরে to + verb।'),
  typ('সে গিটার বাজাতে ভালোবাসে।', ['She enjoys playing the guitar.', 'She loves playing the guitar.', 'She likes playing the guitar.'], 'enjoy-এর পরে verb+ing।')
]);
L2('p3', 'P', 1, 'শব্দের শক্তি', '📚', { t: 'শব্দ চেনার কৌশল', pts: ['প্রসঙ্গ দেখে অর্থ আন্দাজ করো।', 'Synonym মানে কাছাকাছি অর্থ, antonym মানে উল্টো অর্থ।'], ex: [['ubiquitous = found everywhere', 'সবখানে পাওয়া যায়'], ['ephemeral = short-lived', 'ক্ষণস্থায়ী']] }, [
  mcq('Meaning of “ubiquitous”', 'found everywhere', ['found everywhere', 'extremely rare', 'very ancient', 'easily broken'], 'ubiquitous = সবখানে বিদ্যমান। মোবাইল ফোন এখন ubiquitous।'),
  mcq('The shop owner was candid about the problem. He admitted that the phone had a battery fault and offered a refund.\n\nWhat does “candid” mean here?', 'honest and direct', ['honest and direct', 'angry and rude', 'shy and quiet', 'careless'], 'সে সমস্যাটা স্বীকার করেছে, তাই candid = সৎ ও সরাসরি।'),
  wtr('ephemeral', 'ক্ষণস্থায়ী', ['ক্ষণস্থায়ী', 'চিরস্থায়ী', 'জটিল', 'দামি'], 'ephemeral = অল্প সময় টেকে, যেমন বুদবুদ।'),
  mat([['benevolent', 'kind and generous'], ['reluctant', 'unwilling'], ['frugal', 'careful with money'], ['ambiguous', 'having two meanings']]),
  fill('Her ___ speech moved everyone in the hall to tears.', 'eloquent', ['eloquent', 'hostile', 'trivial', 'reluctant'], 'eloquent = সুন্দর ও প্রভাবশালী বক্তব্য।'),
  chat([['o', 'Why do you trust the new accountant?']], 'Because she is meticulous and never makes careless mistakes.', ['Because she is meticulous and never makes careless mistakes.', 'Because she is reluctant and never makes careless mistakes.', 'Because she is ephemeral and never makes careless mistakes.', 'Because she is ambiguous and never makes careless mistakes.'], 'meticulous = খুঁটিনাটিতে যত্নশীল, তাই ভুল করে না।'),
  hear('The ubiquitous use of smartphones has changed our habits.', 'কী শুনলে?', 'সর্বত্র স্মার্টফোনের ব্যবহার আমাদের অভ্যাস বদলে দিয়েছে।', ['সর্বত্র স্মার্টফোনের ব্যবহার আমাদের অভ্যাস বদলে দিয়েছে।', 'স্মার্টফোন এখন খুব দামি হয়ে গেছে।', 'আমরা স্মার্টফোন ব্যবহার ছেড়ে দিয়েছি।', 'স্মার্টফোন আমাদের অভ্যাস বদলাতে পারেনি।'], 'ubiquitous use = সর্বত্র ব্যবহার।'),
  mcq('Choose the word closest in meaning to “scarce”.', 'rare', ['rare', 'plentiful', 'harmful', 'fragile'], 'scarce = অল্প পাওয়া যায়, মানে rare।'),
  ord('তার কথাগুলো দ্ব্যর্থবোধক ছিল।', ['His', 'words', 'were', 'ambiguous'], ['was', 'frugal'], 'words বহুবচন, তাই were।'),
  typ('সে টাকা খরচে হিসেবি।', ['He is frugal with money.', 'She is frugal with money.'], 'frugal = খরচে হিসেবি।')
]);


L2('b4', 'B', 1, 'প্ল্যান আর ভবিষ্যৎ', '🗓️', { t: 'ভবিষ্যতের তিন রাস্তা', pts: ['এখনই সিদ্ধান্ত: will (I will call you.)', 'আগে থেকে ঠিক করা বা প্রমাণ দেখে: be going to (It is going to rain.)', 'সময়ের আগে: at + ঘড়ি, on + বার, in + মাস/বছর'], ex: [['I am going to visit Cox’s Bazar next month.', 'আমি আগামী মাসে কক্সবাজার যাব (ঠিক করা আছে)।'], ['The meeting is at 5 p.m. on Friday.', 'মিটিং শুক্রবার বিকেল ৫টায়।']] }, [
  chat([['o', 'Are you free this weekend?']], 'Yes, I am going to visit my grandparents on Friday.', ['Yes, I am going to visit my grandparents on Friday.', 'Yes, I going to visit my grandparents on Friday.', 'Yes, I am go to visit my grandparents on Friday.', 'Yes, I will to visit my grandparents on Friday.'], 'আগে থেকে ঠিক করা পরিকল্পনায় am going to।'),
  hear('I will call you tomorrow.', 'কী শুনলে?', 'আমি তোমাকে আগামীকাল ফোন করব।', ['আমি তোমাকে আগামীকাল ফোন করব।', 'আমি তোমাকে গতকাল ফোন করেছিলাম।', 'তুমি আমাকে আগামীকাল ফোন করবে।', 'আমি এখন তোমাকে ফোন করছি।'], 'will call = ফোন করব।'),
  fill('Look at the clouds! It is ___ to rain.', 'going', ['going', 'will', 'gone', 'went'], 'প্রমাণ দেখে ভবিষ্যৎ বললে be going to।'),
  fill('The meeting is ___ 5 p.m.', 'at', ['at', 'on', 'in', 'by'], 'ঘড়ির সময়ের আগে at।'),
  clz('My exam is ___ Sunday. We moved here ___ 2019. The class starts ___ 9 a.m.', ['on', 'in', 'at', 'by', 'to'], ['on', 'in', 'at'], 'বারের আগে on, বছরের আগে in, ঘড়ির সময়ের আগে at।'),
  err('I will to call him tomorrow.', 2, 'I will call him tomorrow.', 'will-এর পরে to বসে না, সরাসরি verb।'),
  tr('আমি আগামী সপ্তাহে একটা নতুন ফোন কিনতে যাচ্ছি।', 'I am going to buy a new phone next week.', ['I am going to buy a new phone next week.', 'I will going to buy a new phone next week.', 'I am go to buy a new phone next week.', 'I going to buy a new phone next week.'], 'am/is/are + going to + verb।'),
  ord('আজ রাতে বৃষ্টি হতে যাচ্ছে।', ['It', 'is', 'going', 'to', 'rain', 'tonight'], ['will', 'goes'], 'be going to + verb।'),
  typ('আমি কাল তোমাকে মেসেজ করব।', ['I will message you tomorrow.', 'I will text you tomorrow.'], 'will + verb মূল রূপে।')
]);
L2('b5', 'B', 2, 'স্কুল আর কোচিং', '🎒', { t: 'তুলনা আর উপদেশ', pts: ['দুজনের তুলনা: taller than', 'সবার মধ্যে সেরা: the + best/tallest', 'উপদেশ: should (You should revise daily.)'], ex: [['Ria is taller than Tania.', 'রিয়া তানিয়ার চেয়ে লম্বা।'], ['Rafi is the best student in our class.', 'রাফি ক্লাসের সেরা ছাত্র।']] }, [
  chat([['o', 'Which coaching centre is better?']], 'The new one is cheaper than the old one.', ['The new one is cheaper than the old one.', 'The new one is cheap than the old one.', 'The new one is more cheaper than the old one.', 'The new one is the cheaper of the old one.'], 'দুটোর তুলনায় cheaper than।'),
  hear('You should revise every day.', 'কী শুনলে?', 'তোমার প্রতিদিন রিভিশন দেওয়া উচিত।', ['তোমার প্রতিদিন রিভিশন দেওয়া উচিত।', 'তুমি প্রতিদিন রিভিশন দাও।', 'তুমি আজ রিভিশন দেবে না।', 'প্রতিদিন রিভিশন দেওয়া যায় না।'], 'should = উচিত।'),
  fill('You ___ study hard if you want to pass the exam.', 'should', ['should', 'shouldn’t', 'mustn’t', 'needn’t'], 'পাস করতে চাইলে পড়া উচিত, তাই should।'),
  fill('Rafi is the ___ student in our class.', 'best', ['best', 'better', 'good', 'most good'], 'good → better → best, সবার মধ্যে সেরা তাই the best।'),
  err('Ria is more taller than Tania.', 2, 'Ria is taller than Tania.', 'tall-এর সাথে more বসে না, শুধু taller।'),
  mat([['good', 'better'], ['bad', 'worse'], ['far', 'farther'], ['little', 'less']]),
  clz('Dhaka is ___ than Rajshahi, but Rajshahi is ___. Dhaka is the ___ city in Bangladesh.', ['bigger', 'quieter', 'biggest', 'big', 'quiet'], ['bigger', 'quieter', 'biggest'], 'than-এর আগে comparative, the-এর পরে superlative।'),
  tr('এটা আমার দেখা সবচেয়ে সুন্দর জায়গা।', 'It is the most beautiful place I have seen.', ['It is the most beautiful place I have seen.', 'It is most beautiful place I have seen.', 'It is the beautifulest place I have seen.', 'It is the more beautiful place I have seen.'], 'বড় শব্দে the most + adjective।'),
  typ('তার ফোনটা আমারটার চেয়ে দামি।', ['His phone is more expensive than mine.', 'Her phone is more expensive than mine.'], 'expensive বড় শব্দ, তাই more expensive than।')
]);
L2('c4', 'C', 1, 'প্যাসিভ ভয়েস', '🔁', { t: 'কাজটা কার? কাজ কীসের?', pts: ['Passive = be + V3: The letter was written by Rahim.', 'Tense অনুযায়ী be বদলায়: is, was, has been, will be', 'কে করেছে জরুরি না হলে by ছাড়াই বলা যায়'], ex: [['The bridge was built in 2018.', 'সেতুটা ২০১৮ সালে তৈরি হয়েছিল।'], ['The road is being repaired.', 'রাস্তাটা এখন মেরামত হচ্ছে।']] }, [
  fill('The letter ___ by Rahim.', 'was written', ['was written', 'wrote', 'is writing', 'has write'], 'Passive = be + V3, অতীত তাই was written।'),
  err('The homework was finish by the students.', 3, 'The homework was finished by the students.', 'Passive-এ be-এর পরে V3: finished।'),
  hear('The new bridge was opened last week.', 'কী শুনলে?', 'নতুন সেতুটা গত সপ্তাহে খোলা হয়েছে।', ['নতুন সেতুটা গত সপ্তাহে খোলা হয়েছে।', 'নতুন সেতুটা আগামী সপ্তাহে খোলা হবে।', 'তারা নতুন সেতু খুলছে।', 'সেতুটা এখনো বন্ধ আছে।'], 'was opened + last week = অতীতে খোলা হয়েছে।'),
  chat([['o', 'Has the result been published?']], 'Yes, it was published this morning.', ['Yes, it was published this morning.', 'Yes, it published this morning.', 'Yes, it was publish this morning.', 'Yes, it is publishing this morning.'], 'ফলাফল প্রকাশ করা হয়েছে, তাই was published।'),
  clz('The road ___ now. It ___ built in 2015. Soon, a new bridge ___ opened.', ['is being repaired', 'was', 'will be', 'repaired', 'has'], ['is being repaired', 'was', 'will be'], 'now = is being repaired, 2015 = was built, Soon = will be opened।'),
  tr('বাড়ির কাজটা শেষ করা হয়েছে।', 'The homework has been completed.', ['The homework has been completed.', 'The homework has completed.', 'The homework was been completed.', 'The homework is completed yet.'], 'Present Perfect Passive: has been + V3।'),
  mcq('Change into passive: “They are repairing the road.”', 'The road is being repaired.', ['The road is being repaired.', 'The road was repaired.', 'The road is repaired being.', 'The road has repaired.'], 'Present Continuous-এর passive: is being + V3।'),
  ord('এই গানটা সবাই পছন্দ করে।', ['This', 'song', 'is', 'liked', 'by', 'everyone'], ['like', 'was'], 'Present Simple passive: is + V3।'),
  typ('কাজটা গতকাল শেষ করা হয়েছিল।', ['The work was finished yesterday.', 'The work was completed yesterday.'], 'অতীতের passive: was + V3।')
]);
L2('c5', 'C', 2, 'যদি-তাহলে', '🔮', { t: 'যদি-তাহলে-র তিন ধরন', pts: ['সম্ভাব্য: If + present, will + verb', 'কল্পনা: If + past, would + verb', 'আফসোস: If + had + V3, would have + V3'], ex: [['If you study hard, you will pass.', 'কষ্ট করে পড়লে পাস করবে।'], ['If I had left earlier, I would have caught the bus.', 'আগে বের হলে বাসটা পেতাম।']] }, [
  fill('If you study hard, you ___ pass.', 'will', ['will', 'would', 'would have', 'had'], 'সম্ভাব্য শর্ত: If + present, will।'),
  fill('If I ___ a bird, I would fly to Cox’s Bazar.', 'were', ['were', 'am', 'will be', 'had been'], 'কল্পনায় If + past: were।'),
  chat([['o', 'Why did you miss the bus?']], 'If I had left earlier, I would have caught it.', ['If I had left earlier, I would have caught it.', 'If I left earlier, I would have caught it.', 'If I had left earlier, I would catch it.', 'If I would leave earlier, I had caught it.'], 'অতীতের আফসোসে If + had + V3, would have + V3।'),
  err('If it will rain tomorrow, we will stay home.', 2, 'If it rains tomorrow, we will stay home.', 'If-এর অংশে will বসে না, Present Simple: rains।'),
  hear('If I had more money, I would buy a car.', 'কী শুনলে?', 'আমার আরও টাকা থাকলে আমি একটা গাড়ি কিনতাম।', ['আমার আরও টাকা থাকলে আমি একটা গাড়ি কিনতাম।', 'আমার আরও টাকা থাকলে আমি একটা গাড়ি কিনব।', 'আমার টাকা ছিল বলেই গাড়ি কিনেছি।', 'আমি গাড়ি কিনতে চাই না।'], 'If + past, would = কল্পনা, তাই কিনতাম।'),
  clz('If it ___ tomorrow, we will cancel the trip. If I ___ you, I would stay home. If we ___ earlier, we would have caught the train.', ['rains', 'were', 'had left', 'will rain', 'leave'], ['rains', 'were', 'had left'], 'Type 1: rains, Type 2: were, Type 3: had left।'),
  tr('আমি তোমার জায়গায় থাকলে ওটা কিনতাম না।', 'If I were you, I would not buy it.', ['If I were you, I would not buy it.', 'If I am you, I will not buy it.', 'If I was you, I would not bought it.', 'If I were you, I will not buy it.'], 'কল্পনায় If I were you, would।'),
  ord('বৃষ্টি হলে আমরা বাসায় থাকব।', ['If', 'it', 'rains', 'we', 'will', 'stay', 'home'], ['would', 'rained'], 'If + present, will + verb।', [['We', 'will', 'stay', 'home', 'if', 'it', 'rains']]),
  mat([['Type 1', 'If + present, will'], ['Type 2', 'If + past, would'], ['Type 3', 'If + had + V3, would have'], ['Zero', 'If + present, present']]),
  typ('তুমি পড়লে পাস করবে।', ['If you study, you will pass.', 'You will pass if you study.'], 'সম্ভাব্য শর্ত: If + present, will।')
]);

/* ================= পাঠ সাজানো: লেভেল → ইউনিট → ক্রম ================= */
(function () {
  const lo = {}; LEVELS.forEach((l, i) => lo[l.k] = i);
  const idx = new Map(LESSONS.map((l, i) => [l.id, i]));
  LESSONS.sort((a, b) => lo[a.lvl] - lo[b.lvl] || a.unit - b.unit || idx.get(a.id) - idx.get(b.id));
})();

const lvlLessons = () => LESSONS.filter(l => l.lvl === S.lvl);

/* ---- v1.6.1: মোডের প্রথম বস কুইজ জিতলে সেই মোডের ট্রফি সারপ্রাইজ গিফট ---- */
const TROPHY = { beg: 'tr_beg', med: 'tr_med', high: 'tr_high', pro: 'tr_pro' };
const trBadge = () => `<span class="bsb"><img src="${NIMG[TROPHY[S.lvl]]}" alt=""><i>ট্রফি</i></span>`;
const trTeaser = () => (!TROPHY[S.lvl] || S.owned.includes(TROPHY[S.lvl])) ? '' : `<div class="gift"><img src="${NIMG[TROPHY[S.lvl]]}" alt="" style="filter:grayscale(1);opacity:.5"><div><b>🎁 প্রথম জয়ে সারপ্রাইজ!</b>${LV[S.lvl].name} মোডের প্রথম বস জিতলেই ${ITEM[TROPHY[S.lvl]].n} ট্রেতে চলে আসবে</div></div>`;
const lessonById = id => LESSONS.find(l => l.id === id);
const HAS_IC = /^(l[1-6]|b[1-6]|c[1-6]|d[1-6])$/;

function pickSet(l) {
  const arr = l.qs.map((q, k) => ({ ...q, id: l.id + ':' + k }));
  if (l.full) return arr;
  return shuffle(arr.map((_, i) => i)).slice(0, 7).sort((a, b) => a - b).map(i => arr[i]);
}
const nrm = s => String(s).toLowerCase().replace(/[‘’]/g, "'").replace(/[.!?,;:"“”]+/g, '').replace(/\s+/g, ' ').trim();
function lev(a, b) { const m = a.length, n = b.length, d = []; for (let i = 0; i <= m; i++) { d[i] = [i]; } for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return d[m][n]; }
function checkTyp(q) {
  const got = (LS.typed || '').trim(), g = nrm(got), accs = [].concat(q.ans);
  if (accs.some(a => nrm(a) === g)) return judge(true, got);
  const dist = Math.min(...accs.map(a => lev(g, nrm(a))));
  if (dist <= 1 || (dist <= 2 && g.length >= 14)) {
    LS.phase = 'fb'; LS.combo = 0; LS.mist++; sfx.good(1);
    if (!S.mistakes.includes(q.id)) S.mistakes.push(q.id);
    LS.fb = { ok: true, typo: true, msg: 'প্রায় ঠিক! শুধু বানানটা শুধরে নাও ✍️', mine: got };
    save(); render();
  } else judge(false, got);
}
function matPick(side, i) {
  const v = LS.view; if (LS.phase !== 'ask' || v.done.includes(i)) return;
  if (side === 'l') v.selL = v.selL === i ? null : i; else v.selR = v.selR === i ? null : i;
  if (v.selL !== null && v.selR !== null) {
    if (v.selL === v.selR) {
      v.done.push(v.selL); v.selL = v.selR = null; buzz(15); LS.say = 'বাহ! ঠিক জোড়া। পরেরটা দেখো 😊';
      if (v.done.length === LS.cur.pairs.length) {
        LS.phase = 'fb';
        if (v.miss) { LS.combo = 0; LS.hearts--; LS.mist++; if (!S.mistakes.includes(LS.cur.id)) S.mistakes.push(LS.cur.id); LS.fb = { ok: true, msg: 'সব জোড়া মিলেছে! তবে একটু ঘুরপথে 😄' }; sfx.good(1); }
        else { LS.combo++; sfx.good(LS.combo); LS.fb = { ok: true, msg: rnd(OK_MSG) }; if (LS.meta.practice) S.mistakes = S.mistakes.filter(x => x !== LS.cur.id); }
        save();
      } else sfx.good(1);
    } else {
      v.miss = true; v.wrong = [v.selL, v.selR]; v.selL = v.selR = null; LS.say = 'ওটা মেলেনি, আবার চেষ্টা করো 🌸'; sfx.soft(); buzz(40);
      const cur = LS.cur; setTimeout(() => { if (LS && LS.cur === cur && LS.view.wrong) { LS.view.wrong = null; render(); } }, 650);
    }
  }
  render();
}

const OK_MSG = [
  'বাহ! একদম ঠিক 🌸', 'চা-এর চেয়েও মিষ্টি উত্তর! 🍵', 'বাঁধন ভাইয়া গর্বিত! ✨', 'ফুচকার মতো পারফেক্ট, টক-ঝাল-মিষ্টি সব ঠিক!',
  'Pathao-র চেয়েও দ্রুত উত্তর! 🛵', 'জ্যামে না আটকে সোজা পৌঁছে গেলে! 🚀', 'bKash-এর মতো নির্ভুল, একটাও ভুল হয়নি 💸',
  'লোডশেডিং হলেও তোমার মাথা জ্বলজ্বল করছে! 💡', 'ইংলিশ তোমার সাথে ফ্রেন্ডলি হয়ে যাচ্ছে 😄'
];
const OK_MSG_HOT = ['কম্বো চলছে! থামবে না কিন্তু! 🔥', 'হ্যাটট্রিক! বাঁধন ভাইয়া তো দারুণ খুশি! 🥳', 'তুমি তো দেখছি আগুন! 🔥'];
const BAD_MSG = [
  'আহা… একটু মন খারাপ হলো 🥺 তবে চলো বুঝে নিই কেন ভুল হলো।',
  'ইশ! রিকশা উল্টে যায়নি, শুধু একটু বাঁক নিয়েছে 😅 চলো দেখি কী হলো।',
  'আরেকটু হলেই হয়ে যেত! মন খারাপ করো না, আমরা শিখে নেব! 💪',
  'ভুল হলে বাঁধন ভাইয়া রাগ করে না, শুধু চা খায় ☕ চলো বুঝিয়ে দিই!'
];
const ASK_MSG = ['এবার তোমার পালা! উত্তরটা দাও তো দেখি 😊', 'ভালো করে ভেবে উত্তর দাও, পারবে তুমি! ✨', 'টেনশন নেই, ভুল করলেও বাঁধন ভাইয়া আছে 🌟', 'উত্তরটা ঠিক করে ফেলো, আমি অপেক্ষা করছি ☕'];
/* ---- v1.4.0: নতুন লেসন (চার মোডেই) ---- */
L('n_a1', 'A', 5, 'স্কুলব্যাগের ভেতরে', '🎒', [
  wtr('pen', 'কলম', ['কলম', 'বই', 'খাতা', 'ব্যাগ'], 'pen মানে কলম। কলম দিয়ে লিখি: I write with a pen। কলম হারালে বুঝবে সে বন্ধু ছিল 😄'),
  wtr('bag', 'ব্যাগ', ['ব্যাগ', 'বই', 'চেয়ার', 'জানালা'], 'bag মানে ব্যাগ। স্কুলব্যাগ = school bag। ব্যাগ ভারী মানে অনেক বই!'),
  mat([['বই', 'book'], ['খাতা', 'notebook'], ['কলম', 'pen'], ['ব্যাগ', 'bag']], 'book = বই, notebook = খাতা, pen = কলম, bag = ব্যাগ। পুরো স্কুলব্যাগ তৈরি 🎒'),
  fill('I read a ___.', 'book', ['book', 'rice', 'bus'], 'পড়ি বই, তাই book। rice খাই আর bus-এ চড়ি, পড়ি না 😄'),
  fill('This ___ a pen.', 'is', ['is', 'are', 'am'], 'This একটা জিনিস বোঝায়, তাই is: This is a pen।'),
  ord('এটা আমার ব্যাগ।', ['This', 'is', 'my', 'bag'], ['are', 'me'], 'This is = এটা। my = আমার। আমার ব্যাগ = my bag।'),
  mcq('“আমার একটা কলম আছে।” ইংরেজিতে কোনটা?', 'I have a pen.', ['I have a pen.', 'I has a pen.', 'I am a pen.', 'I have pen a.'], 'I-এর সাথে have বসে। has বসে he, she, it-এর সাথে। আর I am a pen বললে তুমি নিজেই কলম হয়ে যাবে 😂'),
  typ('আমি স্কুলে যাই।', ['I go to school.'], 'যাই = go। জায়গার আগে to বসে: go to school।')
]);
L('n_b1', 'B', 5, 'দোকানে দরদাম', '🛒', [
  mcq('দোকানদারকে ভদ্রভাবে বলবে: “আমাকে এক বোতল পানি দেবেন?”', 'Could I have a bottle of water, please?', ['Could I have a bottle of water, please?', 'Give me water bottle now.', 'I want water bottle you give.', 'Water bottle, give!'], 'ভদ্র অনুরোধে Could I have ... please? বসে। ভদ্রতায় দোকানদার মামা খুশি, দামও কমতে পারে 😄'),
  fill('How ___ is this shirt?', 'much', ['much', 'many', 'long'], 'দাম জানতে How much। গোনা যায় এমন জিনিসের সংখ্যা জানতে How many।'),
  fill('Please give me ___ salt.', 'a little', ['a little', 'a few', 'many'], 'salt গোনা যায় না, তাই a little। গোনা যায় এমন জিনিসে a few।'),
  fill('There are ___ mangoes in the basket.', 'a few', ['a few', 'a little', 'much'], 'আম গোনা যায়, তাই a few। a little বসে গোনা যায় না এমন জিনিসে।'),
  ord('এটার দাম কত?', ['How', 'much', 'is', 'this'], ['many', 'are'], 'দাম জানতে: How much is this?'),
  mcq('Choose the correct sentence.', 'Can you reduce the price a little?', ['Can you reduce the price a little?', 'Can you reducing the price a little?', 'Can you reduces the price a little?', 'You can reduce price a little?'], 'Can you-এর পরে verb-এর মূল রূপ বসে: Can you reduce।'),
  mat([['ছাড়', 'discount'], ['খুচরা টাকা', 'change'], ['রসিদ', 'receipt'], ['সস্তা', 'cheap']], 'discount = ছাড়, change = খুচরা বা ফেরত টাকা, receipt = রসিদ, cheap = সস্তা।'),
  typ('আমি এটা কিনব।', ['I will buy this.', 'I will buy it.'], 'ভবিষ্যতের সিদ্ধান্তে will বসে: I will buy this।')
]);
L('n_h1', 'D', 3, 'বাক্য বদলের খেলা', '🔄', [
  mcq('Change into passive: “The students completed the project.”', 'The project was completed by the students.', ['The project was completed by the students.', 'The project is completed by the students.', 'The project was complete by the students.', 'The project has completed by the students.'], 'Past simple active → passive: was/were + past participle। তাই was completed।'),
  mcq('Rewrite with “too...to”: “He is so tired that he cannot walk.”', 'He is too tired to walk.', ['He is too tired to walk.', 'He is too tired for walk.', 'He is too tired that walk.', 'He is very tired to walk.'], 'so ... that ... cannot = too ... to + verb।'),
  fill('The tea was ___ hot that I could not drink it.', 'so', ['so', 'too', 'very'], 'so + adjective + that। too-এর পরে that বসে না।'),
  fill('Not only Rafi ___ Tania was late.', 'but also', ['but also', 'and also', 'also but'], 'Not only ... but also একসাথে বসে। দুজনেই দেরি করেছে, ক্লাসের ঘণ্টা কিন্তু সময়মতোই বেজেছিল 😄'),
  mcq('Which sentence is correct?', 'Having finished his homework, he went out to play.', ['Having finished his homework, he went out to play.', 'Having finish his homework, he went out to play.', 'Finished his homework, he went out playing.', 'Having finished his homework, he goes out played.'], 'Having + past participle = কাজ শেষ করে। দুই কাজের কর্তা একজন হলে এভাবে জোড়া যায়।'),
  ord('রাফি কঠোর পরিশ্রম করলে সে সফল হবে।', ['If', 'Rafi', 'works', 'hard', 'he', 'will', 'succeed'], ['worked', 'would'], 'সম্ভাব্য শর্ত: If + present simple, will + verb।'),
  mat([['যদি না', 'unless'], ['যদিও', 'although'], ['তাই', 'therefore'], ['অন্যদিকে', 'whereas']], 'unless = যদি না, although = যদিও, therefore = তাই, whereas = অন্যদিকে।'),
  typ('চিঠিটা গতকাল লেখা হয়েছিল।', ['The letter was written yesterday.'], 'Passive past: was + written। yesterday বাক্যের শেষে বসে।')
]);
L('n_p1', 'P', 4, 'বাংলিশ ফাঁদ', '🪤', [
  mcq('Which is correct?', 'I have been living in Dhaka for ten years.', ['I have been living in Dhaka for ten years.', 'I am living in Dhaka for ten years.', 'I live in Dhaka since ten years.', 'I was living in Dhaka for ten years.'], 'for + সময়ের পরিমাণ হলে present perfect (continuous) বসে: have been living।'),
  mcq('Choose the correct sentence.', 'She is married to a doctor.', ['She is married to a doctor.', 'She is married with a doctor.', 'She is marrying a doctor since long.', 'She has married to a doctor.'], 'be married to someone। married with — এটা বাংলিশ ফাঁদ!'),
  mcq('Which is correct?', 'I am looking forward to meeting you.', ['I am looking forward to meeting you.', 'I am looking forward to meet you.', 'I look forward to meet you.', 'I am looking forward for meeting you.'], 'look forward to-এর to এখানে preposition, তাই পরে -ing বসে: meeting।'),
  fill('He suggested ___ early.', 'leaving', ['leaving', 'to leave', 'leave'], 'suggest-এর পরে -ing বসে: suggested leaving।'),
  fill('Neither of the two boys ___ present.', 'was', ['was', 'were', 'are'], 'Neither of + দুজন হলে আনুষ্ঠানিক ইংরেজিতে একবচন verb: was।'),
  mcq('Spot the error: “I prefer tea than coffee.”', 'than → to', ['than → to', 'prefer → like', 'tea → teas', 'No error'], 'prefer A to B। এখানে than নয়, to বসবে।'),
  mat([['লাইট জ্বালাও', 'switch on the light'], ['গাড়ি চালাও', 'drive the car'], ['ওষুধ খাও', 'take the medicine'], ['ফোন ধরো', 'pick up the phone']], 'বাংলায় বলি জ্বালাও, খাও, ধরো; ইংরেজিতে ক্রিয়াটা আলাদা: switch on, drive, take, pick up।'),
  typ('আমি তোমার ফোনের অপেক্ষায় আছি।', ['I am waiting for your call.'], 'wait for = অপেক্ষা করা। for-টা ভুলে যেও না!')
]);
const tf = (p, right, tip) => mcq(p, right ? 'ঠিক ✅' : 'ভুল ❌', ['ঠিক ✅', 'ভুল ❌'], tip);
const lis = (say, ans, opts, tip) => ({ ...mcq('🔊 শুনে সঠিকটা বেছে নাও', ans, opts, tip), voice: say });
L('n_a2', 'A', 6, 'কান খাড়া! শুনে শেখো', '🎧', [
  lis('water', 'water', ['water', 'winter', 'waiter'], 'water = পানি। শুনতে winter-এর মতো, কিন্তু winter মানে শীতকাল 🥶'),
  lis('Good morning', 'Good morning', ['Good morning', 'Good evening', 'Good night'], 'সকালে বলি Good morning। ঘুমানোর আগে বলি Good night 🌙'),
  lis('I like mango', 'I like mango', ['I like mango', 'I like banana', 'I like tea'], 'mango = আম। আমের দিনে সবাই এই কথা বলে 🥭'),
  lis('She is my sister', 'She is my sister', ['She is my sister', 'He is my brother', 'She is my mother'], 'sister = বোন, brother = ভাই, mother = মা।'),
  tf('“Cat” মানে বিড়াল। ঠিক নাকি ভুল?', true, 'cat = বিড়াল, dog = কুকুর। ম্যাউ ম্যাউ বললেই cat 🐱'),
  tf('“Water” মানে আগুন। ঠিক নাকি ভুল?', false, 'water মানে পানি। আগুন হলো fire 🔥')
]);
L('n_a3', 'A', 6, 'ছোট ছোট ভদ্র কথা', '💬', [
  mcq('কেউ বলল “Thank you.” উত্তরে কী বলবে?', 'You are welcome.', ['You are welcome.', 'Good night.', 'See you.', 'I am sorry.'], 'Thank you-এর উত্তরে বলি You are welcome।'),
  fill('___ you for your help.', 'Thank', ['Thank', 'Sorry', 'Hello'], 'সাহায্যের জন্য ধন্যবাদ: Thank you for your help।'),
  ord('আমি দুঃখিত।', ['I', 'am', 'sorry'], ['is', 'are'], 'I am sorry = আমি দুঃখিত। ভুল করলে বলতে ভুলো না!'),
  mat([['ধন্যবাদ', 'thank you'], ['দুঃখিত', 'sorry'], ['দয়া করে', 'please'], ['স্বাগতম', 'welcome']], 'thank you = ধন্যবাদ, sorry = দুঃখিত, please = দয়া করে, welcome = স্বাগতম।'),
  tf('বিদায় নেওয়ার সময় “Good bye” বলা যায়। ঠিক নাকি ভুল?', true, 'Good bye = বিদায়। Good morning সকালের শুভেচ্ছা।'),
  typ('শুভ রাত্রি।', ['Good night.'], 'ঘুমানোর আগে Good night। ঘুমন্ত বাঁধনও শুনতে পায় 😴')
]);
L('n_b2', 'B', 6, 'শুনে বুঝে ঠিক-ভুল', '🎧', [
  lis('She has been waiting for an hour', 'She has been waiting for an hour.', ['She has been waiting for an hour.', 'She was waiting for an hour.', 'She will wait for an hour.'], 'has been waiting = আগে থেকে অপেক্ষা করছে, এখনও করছে।'),
  lis('I am going to buy a new phone', 'I am going to buy a new phone.', ['I am going to buy a new phone.', 'I went to buy a new phone.', 'I want to sell my phone.'], 'am going to = পরিকল্পনা: কিনতে যাচ্ছি।'),
  lis('Could you open the window', 'Could you open the window?', ['Could you open the window?', 'Could you close the window?', 'Could you open the door?'], 'open আর close শোনার সময় আলাদা করে ধরো। জানালা = window।'),
  tf('“He don’t like tea.” বাক্যটা কি ঠিক?', false, 'he-এর সাথে doesn’t বসে: He doesn’t like tea।'),
  tf('“She goes to school by bus.” বাক্যটা কি ঠিক?', true, 'she-এর সাথে verb-এ s/es বসে: goes। by bus = বাসে করে।'),
  fill('If it rains, we ___ stay at home.', 'will', ['will', 'would', 'are'], 'সম্ভাব্য শর্তে: If + present, will + verb।')
]);
L('n_b3', 'B', 6, 'ফোনে কথা', '📱', [
  mcq('ফোনে বলবে: “একটু অপেক্ষা করুন।”', 'Please hold on.', ['Please hold on.', 'Please hold me.', 'Please go on wait.', 'Please wait for hold.'], 'ফোনে অপেক্ষা করতে বলতে: Please hold on বা Please wait।'),
  fill('Can I speak ___ Rafi, please?', 'to', ['to', 'at', 'in'], 'কারো সাথে কথা বলা: speak to someone।'),
  ord('আমি পরে ফোন করব।', ['I', 'will', 'call', 'you', 'later'], ['calls', 'did'], 'will + call = ফোন করব। later = পরে।'),
  lis('Sorry, you have the wrong number', 'Sorry, you have the wrong number.', ['Sorry, you have the wrong number.', 'Sorry, I have your number.', 'Sorry, I lost my number.'], 'wrong number = ভুল নম্বর। রং নম্বরে ডাক পড়লে কাজে লাগবে 😄'),
  mat([['মিসড কল', 'missed call'], ['ভুল নম্বর', 'wrong number'], ['লাইন কাটা', 'hang up'], ['ফোন ধরা', 'pick up']], 'missed call, wrong number, hang up, pick up।'),
  typ('আমি তোমাকে মেসেজ পাঠাব।', ['I will send you a message.', 'I will text you.'], 'send a message = মেসেজ পাঠানো। text you-ও চলে।')
]);
L('n_h2', 'D', 4, 'শুনে ধরো, ঠিক-ভুল', '🎯', [
  lis('Had I known, I would have helped', 'Had I known, I would have helped.', ['Had I known, I would have helped.', 'If I knew, I will help.', 'I knew, so I helped him.'], 'Had I known = If I had known। অতীতের না-জানা নিয়ে আফসোস।'),
  lis('The match was cancelled due to rain', 'The match was cancelled due to rain.', ['The match was cancelled due to rain.', 'The match was won due to rain.', 'The rain was cancelled due to the match.'], 'due to = কারণে, cancelled = বাতিল।'),
  tf('“Each of the boys have a bag.” বাক্যটা কি ঠিক?', false, 'Each of + বহুবচন হলেও verb একবচন: Each of the boys has a bag।'),
  tf('“The news are shocking.” বাক্যটা কি ঠিক?', false, 'news দেখতে বহুবচন, কিন্তু একবচন: The news is shocking।'),
  mcq('Choose the correct reported speech: He said, “I am tired.”', 'He said that he was tired.', ['He said that he was tired.', 'He said that he is tired.', 'He said that I was tired.', 'He said that he has tired.'], 'Reported speech-এ present → past: am → was, I → he।'),
  fill('Hardly had he arrived ___ it started to rain.', 'when', ['when', 'than', 'then'], 'Hardly ... when আর No sooner ... than: দুটোই মনে রাখো!')
]);
L('n_p2', 'P', 5, 'শব্দের ধার', '🎭', [
  lis('It is raining cats and dogs', 'It is raining cats and dogs.', ['It is raining cats and dogs.', 'It is raining a lot of cats.', 'It is raining cold dogs.'], 'raining cats and dogs = মুষলধারে বৃষ্টি। সত্যিকারের বিড়াল পড়ে না 🐱🐶'),
  mcq('“Break the ice” মানে কী?', 'আড়ষ্টতা কাটিয়ে কথা শুরু করা', ['আড়ষ্টতা কাটিয়ে কথা শুরু করা', 'বরফ ভেঙে ফেলা', 'খুব রেগে যাওয়া', 'ঠান্ডা লাগা'], 'break the ice = অচেনা পরিবেশে প্রথম আড়ষ্টতা কাটানো।'),
  mcq('“Piece of cake” মানে কী?', 'খুব সহজ কাজ', ['খুব সহজ কাজ', 'কেকের টুকরো', 'খুব দামি জিনিস', 'বিপদ'], 'piece of cake = পানির মতো সহজ কাজ 🍰'),
  tf('“Once in a blue moon” মানে খুব কম, কালেভদ্রে। ঠিক নাকি ভুল?', true, 'once in a blue moon = কালেভদ্রে। নীল চাঁদ সত্যিই উঠলে ছবি তুলে রেখো 🌙'),
  tf('“Hit the books” মানে বই দিয়ে কাউকে মারা। ঠিক নাকি ভুল?', false, 'hit the books = মন দিয়ে পড়তে বসা 📚'),
  fill('Don’t cry over ___ milk.', 'spilt', ['spilt', 'spill', 'spilling'], 'Don’t cry over spilt milk = যা হয়ে গেছে তা নিয়ে আফসোস করো না। spilt = past participle।')
]);
const WIN_MSG = ['বাঁধন ভাইয়া বলছে: আজ চা-বিস্কুট তোমার পাওনা! 🍪', 'বাঁধন ভাইয়া বলছে: তোমার ইংলিশ শুনলে ঢাকার জ্যামও সরে যাবে! 🚀', 'বাঁধন ভাইয়া বলছে: এইটুকুই তো শুরু, আরও মজা বাকি!'];
const QLABEL = { pick: null, wtr: 'এই শব্দের বাংলা কী?', tr: 'ইংরেজিতে কী হবে?', fill: 'শূন্যস্থানে কোনটা বসবে?', ord: 'ইংরেজিতে সাজিয়ে লেখো', mat: 'জোড়া মেলাও', mcq: 'সঠিকটা বেছে নাও', typ: 'ইংরেজিতে টাইপ করো', lis: 'শুনে উত্তর দাও', chat: 'কথোপকথনটা শেষ করো', err: 'ভুল শব্দটা ছুঁয়ে ধরো', cloze: 'ফাঁকা জায়গায় শব্দ বসাও' };

const qById = id => { const [lid, i] = id.split(':'); const l = lessonById(lid); return l && l.qs[+i] ? { ...l.qs[+i], id } : null; };
function qText(q) {
  switch (q.t) {
    case 'pick': return `‘${q.word}’ = ${q.ans}`;
    case 'wtr': return `${q.en} → ${q.ans}`;
    case 'tr': return `${q.bn} → ${q.ans}`;
    case 'fill': return q.s.replace('___', q.ans);
    case 'ord': return `${q.bn} → ${q.words.join(' ')}`;
    case 'mat': return q.pairs.map(p => `${p[0]} = ${p[1]}`).join(', ');
    case 'mcq': { const pp = q.p.split('\n\n'); return pp[pp.length - 1] + ' → ' + q.ans; }
    case 'typ': return `${q.bn} → ${[].concat(q.ans)[0]}`;
    case 'lis': return `${q.say} → ${q.ans}`;
    case 'chat': return q.lines.map(x => x[1]).join(' / ') + ' → ' + q.ans;
    case 'err': return q.fix;
    case 'cloze': { let k = 0; return q.p.replace(/___/g, () => q.ans[k++]); }
  }
}
function ansText(q) {
  if (q.t === 'pick') return `${q.ans} (${q.word})`;
  if (q.t === 'ord') return q.words.join(' ');
  if (q.t === 'typ') return [].concat(q.ans)[0];
  if (q.t === 'err') return q.fix;
  if (q.t === 'cloze') return q.ans.join(', ');
  return q.ans;
}

/* ============ State / Router ============ */
let view = 'splash';
let W = { name: '', lvl: '' };
let T = 0, tutFrom = 'start';
let LS = null;
let splashTimer = null;
const app = $('#app'), layer = $('#layer');

/* v1.3.6: স্ক্রল আসলে body-তে হয় (html+body দুটোতেই overflow-x:hidden), তাই window.scrollTo একা কাজ করত না */
function toTop() { try { window.scrollTo(0, 0); } catch (e) {} document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }
function go(v) {
  view = v; render(); toTop(); if (window.dlgSoonFn) window.dlgSoonFn(v);
  if (v === 'splash') { clearTimeout(splashTimer); splashTimer = setTimeout(() => { if (view === 'splash') afterSplash(); }, 2800); }
}
function afterSplash() { if (!S.tut) { S.tut = true; save(); } go(!S.tut ? 'tut' : (!S.name || !LV[S.lvl]) ? 'welcome' : 'home'); trackOpen(); }
function render() {
  app.classList.toggle('nkfit', view === 'nook' && N.tab === 'room');   // v1.3.6: ঘর+ট্রে এক স্ক্রিনে
  layer.innerHTML = '';
  if (view === 'splash') app.innerHTML = splashHTML();
  else if (view === 'tut') app.innerHTML = tutHTML();
  else if (view === 'welcome') app.innerHTML = welcomeHTML();
  else if (view === 'home') app.innerHTML = homeHTML() + navHTML('home');
  else if (view === 'mistakes') app.innerHTML = mistakesHTML() + navHTML('mistakes');
  else if (view === 'nook') app.innerHTML = nookHTML() + navHTML('nook');
  else if (view === 'me') app.innerHTML = meHTML() + navHTML('me');
  else if (view === 'report') app.innerHTML = reportHTML() + navHTML('me');
  else if (view === 'lesson') app.innerHTML = lessonHTML();
  else if (view === 'result') { app.innerHTML = resultHTML(); petals(); }
  else if (view === 'fail') app.innerHTML = failHTML();
}

/* ============ Views ============ */
const cupSVG = `
<svg viewBox="0 0 160 140" class="cup" aria-hidden="true">
  <g class="steam"><path d="M60 40 q-8 -12 0 -22 q8 -10 0 -18"/><path d="M82 40 q-8 -12 0 -22 q8 -10 0 -18"/><path d="M104 40 q-8 -12 0 -22 q8 -10 0 -18"/></g>
  <ellipse cx="82" cy="124" rx="62" ry="9" fill="#EBD9C3"/>
  <path d="M28 52 h108 v34 a44 44 0 0 1 -44 44 h-20 a44 44 0 0 1 -44 -44z" fill="#FFC9D6" stroke="#E58BA3" stroke-width="4"/>
  <path d="M136 62 h10 a16 16 0 0 1 0 32 h-16" fill="none" stroke="#E58BA3" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="82" cy="52" rx="54" ry="7" fill="#F2B45C"/>
  <text x="82" y="102" text-anchor="middle" font-size="30">🌸</text>
</svg>`;

function splashHTML() {
  return `<div class="splash" data-act="skipsplash">
    <img class="logo" src="icons/splash-cup.png" alt="">
    <h1>${APP_NAME}</h1>
    <div class="sub">${APP_SUB}</div>
    <p class="tag">এক কাপ চা আর একটু একটু ইংরেজি</p>
    ${mascot(96, 'happy', true)}
    <div class="loadbar"><i></i></div>
    <div class="hint">ট্যাপ করলে সরাসরি শুরু হবে</div>
    <p class="foot-note" style="margin-top:26px">গেম ভার্সন v${VERSION}<br>তৈরি করেছেন Badhon</p>
  </div>`;
}

const TUT = [
  { img: 1, pin: [72, 76], title: '1. ব্যাজটায় ট্যাপ করো', text: 'অ্যাপের নিচে ডানদিকে <b>“Powered by Netlify”</b> লেখা একটা ব্যাজ দেখা যায়। ওটার ওপর <b>একবার ট্যাপ</b> করো।' },
  { img: 2, pin: [48.6, 74.4], title: '2. “Hide this badge” বেছে নাও', text: 'একটা বক্স খুলবে। একদম নিচে ছোট করে <b>“Hide this badge”</b> লেখা আছে। ওখানে ট্যাপ করলেই ব্যাজ লুকিয়ে যাবে।' },
  { img: 0, title: '3. ব্যস, শেষ! ✅', text: 'ব্যাজ না সরালে অ্যাপের নিচের মেনু (Learn, Practice, Profile) আর কিছু বাটন ঢেকে যেতে পারে। তাই এটা একবার করে নাও। <b>ব্যাজ না দেখলে</b> এই ধাপ বাদ দিতে পারো।' }
];
function tutHTML() {
  const p = TUT[T], last = T === TUT.length - 1;
  const img = p.img ? `<div class="tutimg"><img src="${TUT_IMG[p.img]}" alt="ধাপ ${bn(T + 1)}"><div class="pin" style="left:${p.pin[0]}%;top:${p.pin[1]}%"><span class="ring"></span><span class="arr">${ico('hand')}</span></div></div>`
    : `<div class="center" style="margin:26px 0 10px">${mascot(120, 'cheer', true)}</div>`;
  return `<div class="tuthead"><div class="dots">${TUT.map((_, i) => `<i class="${i === T ? 'on' : ''}"></i>`).join('')}</div>
      <button class="btn ghost" style="width:auto;padding:6px 10px" data-act="tskip">স্কিপ</button></div>
    <h2 class="sec" style="margin-top:8px">ব্যাজ লুকিয়ে ফেলি 🙈</h2>
    <div class="card"><h3 style="font-size:22px;margin-bottom:6px">${p.title}</h3><div class="tutp">${p.text}</div></div>
    ${img}
    <div class="tutnav">
      <button class="round" data-act="tprev" aria-label="আগের ধাপ" ${T === 0 ? 'disabled' : ''}>‹</button>
      <button class="btn ${last ? '' : 'peach'}" data-act="tnext">${last ? 'বুঝেছি, এগোই →' : 'পরের ধাপ →'}</button>
    </div>`;
}

function classChips(cur, act) {
  return [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `<button class="chip ${cur == n ? 'on' : ''}" data-act="${act}" data-v="${n}">${bn(n)}</button>`).join('');
}
function welcomeHTML() {
  return `<div class="hero">${mascot(96, 'happy', true)}
    <h1 style="font-size:32px">চলো, একটু পরিচয় হয়ে যাক!</h1>
    <p class="tag">বাঁধন ভাইয়া তোমার জন্য অপেক্ষা করছে 🌸</p></div>
  <div class="field">
    <label for="nm">তোমার নাম কী?</label>
    <input id="nm" type="text" maxlength="24" autocomplete="off" placeholder="যেমন: রিয়া" value="${esc(W.name)}">
    <label>কোন লেভেলে শুরু করবে?</label>
    <div class="lvgrid">${levelCards(W.lvl, 'wlvl')}</div>
  </div>
  <div style="margin-top:24px"><button class="btn" id="startBtn" data-act="begin" ${(W.name.trim() && W.lvl) ? '' : 'disabled'}>চলো শুরু করি</button></div>
  <p class="foot-note">গেম ভার্সন v${VERSION}<br>তৈরি করেছেন Badhon</p>`;
}

const canBuy = () => { const l = NOOK.items.concat(NOOK.rooms).filter(i => !i.sp && !S.owned.includes(i.id) && (!trayFull() || ROOMS.includes(i.id))).map(i => i.p); if (trayN() < TRAY_MAX) l.push(TRAY_PRICE[trayN()]); return l.length && (S.coins || 0) >= Math.min(...l); };
function navHTML(on) {
  const b = (k, img, t, dot) => `<button class="${on === k ? 'on' : ''}" data-act="nav" data-v="${k}" aria-label="${t}"><img class="nvi" src="assets/img/nav_${img}.webp" alt="">${dot ? '<i class="nvd"></i>' : ''}<span>${t}</span></button>`;
  return `<nav class="nav"><div>${b('home', 'learn', 'Learn')}${b('nook', 'room', 'Cozy Room', qReady() > 0 || canBuy())}${b('mistakes', 'mistakes', 'Practice')}${b('me', 'me', 'Profile')}</div></nav>`;
}
function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'শুভ রাত্রি' : h < 12 ? 'শুভ সকাল' : h < 16 ? 'শুভ দুপুর' : h < 19 ? 'শুভ বিকেল' : 'শুভ সন্ধ্যা';
}
const unlocked = (list, i) => i === 0 || isStaff() || !!S.progress[list[i].id] || !!S.progress[list[i - 1].id];

function weekCups() {
  const names = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'], now = new Date(), tk = dk(now); let h = '';
  for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); const k = dk(d), done = !!(S.days && S.days[k]), td = k === tk;
    h += `<div class="wc ${td ? 'td' : ''}"><img src="assets/img/hud_cup${done ? 2 : td ? 1 : 0}.webp" alt=""><span>${names[d.getDay()]}</span></div>`; }
  return `<div class="week">${h}</div>`;
}
function nextGoal() {
  const c = S.coins || 0, left = NOOK.items.concat(NOOK.rooms).filter(i => !i.sp && !S.owned.includes(i.id)).sort((a, b) => a.p - b.p);
  if (!left.length) return { c, pct: 100, line: 'সবকিছু এখন তোমার! 🎉' };
  const aff = left.filter(i => i.p <= c), nx = aff.length ? aff[aff.length - 1] : left[0];
  return { nx, c, pct: Math.min(100, Math.round(c / nx.p * 100)), line: c >= nx.p ? `জমেছে! এখন কিনতে পারবে: <b>${nx.n}</b>` : `আর ${nx.p - c} কয়েনে <b>${nx.n}</b> কিনতে পারবে` };
}
function roomCard() {
  const own = ROOMS.filter(r => S.owned.includes(r)), rid = own.includes(S.ri) ? S.ri : own[0], L = roomItems(rid), g = nextGoal();
  const mp = q => { const it = ITEM[q.id]; if (!it) return ''; const t = itemT(it, q); return `<img class="mp" src="${NIMG[q.id]}" alt="" style="left:${q.x}%;top:${q.y}%;width:${it.w * (q.s || 1)}%;transform:${t};z-index:${zOf(q, L)}">`; };
  return `<button class="tile rt" data-act="tonook"><div class="room rmini" style="aspect-ratio:${ASPECT}"><img class="rbg" src="${NIMG[rid]}" alt="">${L.map(mp).join('')}</div><b>My Cozy Room</b><span>${COIN} ${S.coins || 0}</span><small>${g.line}</small></button>`;
}
function homeHTML() {
  const list = lvlLessons(), UN = UNITS[S.lvl];
  const goal = 20, dx = Math.min(todayXp(), goal), C = 2 * Math.PI * 17;
  let h = inAppCard() + `
  <div class="top">${mascot(58, 'happy')}
    <div class="greet">${greeting()}, ${esc(S.name)}!<button class="lvpill k-${S.lvl}" data-act="lvlpick">${lvI(S.lvl)} ${LV[S.lvl].name} <i>বদলাও ▾</i></button></div>
  </div>
  ${installPill()}<div class="stats">
    <div class="stat"><b><img class="si" src="assets/img/hud_flame.webp" alt=""> ${bn(shownStreak())}</b><span>দিনের স্ট্রিক</span></div>
    <div class="stat"><b><img class="si" src="assets/img/hud_xp.webp" alt=""> ${bn(S.xp)}</b><span>মোট XP</span></div>
    <div class="stat"><svg class="ring2" viewBox="0 0 42 42" role="img" aria-label="আজকের লক্ষ্য">
      <circle cx="21" cy="21" r="17" fill="none" stroke="var(--line)" stroke-width="5"/>
      <circle cx="21" cy="21" r="17" fill="none" stroke="var(--matcha)" stroke-width="5" stroke-linecap="round"
        stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - dx / goal)}" transform="rotate(-90 21 21)"/></svg>
      <span>আজ ${bn(dx)}/${bn(goal)} XP</span></div>
  </div>${weekCups()}<div class="duo">${challengeTile()}${roomCard()}</div>`;
  let lastUnit = -1;
  list.forEach((l, i) => {
    if (l.unit !== lastUnit) { lastUnit = l.unit; const u = UN[l.unit]; h += `<div class="unit ${u.cls}"><div><h2>ইউনিট ${bn(l.unit + 1)}: ${u.title}</h2><p>${u.sub}</p></div>${u.img != null ? `<img class="uart" src="assets/img/un_${u.img}.webp" alt="">` : `<div class="uart emo">${u.e}</div>`}</div>`; }
    const st = S.progress[l.id] || 0, open = unlocked(list, i), cur = open && !st;
    const x = Math.round(Math.sin(i * 1.15) * 52), nxt = list[i + 1], x2 = Math.round(Math.sin((i + 1) * 1.15) * 52);
    h += `<div class="nodewrap" style="--dx:${x}px">
      ${cur ? `<div class="start-tag">শুরু করো · ${COIN} ${13 + LV[S.lvl].bonus}-${19 + LV[S.lvl].bonus}</div>` : ''}
      <button class="node ${st ? 'done' : cur ? 'cur' : 'lock'}" data-act="open" data-id="${l.id}" aria-label="${esc(l.title)}${open ? '' : ' (বন্ধ)'}">${HAS_IC.test(l.id) ? `<img class="nic" src="assets/img/ic_${l.id}.webp" alt="">` : `<span class="nemo">${l.emoji}</span>`}${open ? '' : '<b class="lk">🔒</b>'}${st ? `<span class="nst">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</span>` : ''}</button>
    </div>`;
    if (!nxt || nxt.unit !== l.unit) h += bossNode(list, l);
    if (nxt && nxt.unit === l.unit) h += `<svg class="trail" viewBox="0 0 240 44" aria-hidden="true"><path d="M${120 + x} 0 C ${120 + x} 24, ${120 + x2} 20, ${120 + x2} 44" fill="none" stroke="var(--lock-d)" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 11"/></svg>`;
  });
  h += `<p class="foot-note">আরও ইউনিট আসছে… 🌱<br>v${VERSION}</p>`;
  return h;
}

const notesBlock = () => { const ns = S.notes || []; return `<h3 class="disp" style="margin:24px 0 6px">📝 আমার নোট</h3><button class="btn peach" data-act="notes" style="margin:6px 0 4px">+ নতুন নোট লিখি</button>${ns.length ? ns.map((n, i) => `<div class="note" style="background:${['#FFF3B8', '#FFD9E1', '#D8EBC9', '#D9E8F5'][i % 4]};transform:rotate(${[-1.2, 1, -.6, 1.4][i % 4]}deg);color:#4B3326"><div>${esc(n.t)}<small>${n.d}</small></div><button class="tbtn" data-act="ndel" data-i="${i}" style="width:30px;height:30px;font-size:14px">🗑️</button></div>`).join('') : '<p style="color:var(--ink2);text-align:center">এখনো কোনো নোট নেই।</p>'}`; };
function mistakesHTML() {
  const all = S.mistakes.map(id => ({ id, q: qById(id) })).filter(x => x.q), lim = N.mlim || 30, show = all.slice(0, lim);
  if (!all.length) return `<h2 class="sec">ভুলের খাতা 📒</h2>
    <div class="empty"><div class="big">🍵</div><p>খাতা এখন খালি!<br>পাঠে কোনো ভুল হলে এখানে জমা হবে, তারপর আবার চেষ্টা করে দেখা যাবে।</p></div>` + notesBlock();
  return `<h2 class="sec">ভুলের খাতা 📒</h2>
    <p style="margin-top:-6px;color:var(--ink2)">${all.length}টা প্রশ্নে আবার চেষ্টা করা যায়। ঠিক করলে নিজে থেকেই সরে যায়।</p>
    <button class="btn peach" data-act="practice" style="margin:12px 0 8px">ভুলগুলো ঠিক করি (প্র্যাকটিস)</button>
    <div class="paper">${show.map(x => `<div class="item mi"><span>${esc(qText(x.q))}</span><button class="mx" data-act="mdel" data-id="${x.id}" aria-label="খাতা থেকে সরাও">✕</button></div>`).join('')}</div>
    ${all.length > lim ? `<button class="btn ghost" data-act="mmore">আরও ${all.length - lim}টা দেখাও</button>` : ''}
    <button class="btn ghost" data-act="mclear" style="margin-top:6px">🗑️ সব মুছি</button>` + notesBlock();
}

function meHTML() {
  const done = lvlLessons().filter(l => S.progress[l.id]).length;
  const lv = level(), ttl = TITLES[Math.min(lv - 1, TITLES.length - 1)];
  return `
  <div class="center" style="margin-top:6px">${mascot(84, 'happy')}<h2 class="sec" style="margin:8px 0 0">${esc(S.name)}</h2>
    <div style="color:var(--ink2)">${lvI(S.lvl)} ${LV[S.lvl].name} · ${ttl}</div></div>
  <div class="pchips"><div><img class="si" src="assets/img/hud_xp.webp" alt=""><b>Lv ${bn(lv)}</b><span>${bn(S.xp)} XP</span></div><div><img class="si" src="assets/img/hud_flame.webp" alt=""><b>${bn(shownStreak())} দিন</b><span>স্ট্রিক</span></div><div><img class="si" src="assets/img/hud_coin.webp" alt=""><b>${bn(S.coins || 0)}</b><span>কয়েন</span></div></div>
  <div class="xpbar"><i style="width:${S.xp % 100}%"></i></div><div class="xpl">পরের লেভেলে ${100 - S.xp % 100} XP বাকি</div>
  <div class="card" style="margin-top:16px">
    <div class="row"><span>শেষ করা পাঠ (এই লেভেলে)</span><b>${bn(done)}/${bn(lvlLessons().length)}</b></div>
  </div>
  <div class="card" style="margin-top:14px"><b class="disp">আমার লেভেল</b>
    <div class="lvgrid" style="margin-top:8px">${levelCards(S.lvl, 'setlvl')}</div>
    <div style="color:var(--ink2);font-size:14px;margin-top:10px">লেভেল বদলালে ওই লেভেলের পাঠ দেখাবে। তোমার তারা আর অগ্রগতি জমা থাকবে।</div></div>
  ${installCard()}${donateCard()}
  <div class="card" style="margin-top:14px"><b class="disp">শব্দ</b>
    <div class="toggle" style="margin-top:8px">
      <button class="chip ${S.sound ? 'on' : ''}" data-act="snd" data-v="1">চালু 🔔</button>
      <button class="chip ${!S.sound ? 'on' : ''}" data-act="snd" data-v="0">বন্ধ 🔕</button>
    </div></div>
  <div class="card" style="margin-top:14px;text-align:center">
    <h3 style="font-size:24px">${APP_NAME}</h3>
    <div style="color:var(--peach-d);font-family:'Baloo Da 2',sans-serif;font-weight:700">${APP_SUB}</div>
    <div class="row" style="margin-top:10px"><span>গেম ভার্সন</span><b>v${VERSION}</b></div>
    <p style="margin:12px 0 0;font-size:16px">তৈরি করেছেন<br><b>Badhon</b></p>
    <p style="margin:8px 0 0;font-size:14px;color:var(--ink2)">বাংলাদেশের স্কুলপড়ুয়াদের জন্য, ভালোবাসা দিয়ে বানানো 🌷</p>
    <p style="margin:8px 0 0;font-size:13px;color:var(--ink2)">🔒 অ্যাপ ভালো করতে শুধু অজানা ব্যবহারের হিসাব (কোন পাঠে কেউ থামল, কোন প্রশ্ন কঠিন) জমা হয়। নাম, ফোন নম্বর বা ছবি কিছুই নেওয়া হয় না। চাইলে নিচের “অজানা পরিসংখ্যান” থেকে বন্ধ করা যায়। 🔔 “বাঁধনের ডাক” চালু করলে ডাক পাঠাতে তোমার নাম, লেভেল, স্ট্রিক আর শেষ পড়ার দিন আমাদের সার্ভারে যায়। ফোনের সেটিংসে বন্ধ করলেই আর কিছু যাবে না।</p>
  </div>
  <div class="card" style="margin-top:14px"><b class="disp">🏆 আমার ট্রফি</b><div style="color:var(--ink2);font-size:14px;margin-top:4px">প্রতি মোডের প্রথম বস কুইজ জিতলে একটা করে ট্রফি মেলে।</div><div class="trshelf">${Object.keys(TROPHY).map(k => `<button class="trs ${S.owned.includes(TROPHY[k]) ? '' : 'off'}" data-act="trinfo" data-v="${k}"><img src="${NIMG[TROPHY[k]]}" alt=""><small>${LV[k].name}</small></button>`).join('')}</div></div>
  <div class="card" style="margin-top:14px"><b class="disp">🏅 আমার ব্যাজ</b><div class="bgrid">${BADGES.map((b, i) => `<button class="bdg ${S.bd && S.bd[i] ? '' : 'off'}" data-act="bdinfo" data-i="${i}"><img src="assets/img/bd_${i + 1}.webp" alt=""><small>${b[0]}</small></button>`).join('')}</div></div>
  <div class="card" style="margin-top:14px"><b class="disp">✨ নতুন কী? · v${VERSION}</b><div style="color:var(--ink2);font-size:14px;margin:6px 0 10px">নতুন কী কী এল, এক নজরে।</div><button class="btn peach" data-act="news">দেখি কী নতুন</button><button class="btn ghost" data-act="shareapp">🫶 বন্ধুকে শেয়ার করো</button></div>
  ${pushCard()}${statsCard()}<div class="card" style="margin-top:14px"><b class="disp">☁️ সেভ ব্যাকআপ</b><div style="color:var(--ink2);font-size:14px;margin:6px 0 10px">ফোন বদলালে যাতে কয়েন, ঘর আর অগ্রগতি হারিয়ে না যায়।</div><button class="btn peach" data-act="bkshow">কোড বের করি</button><button class="btn ghost" data-act="bkask">কোড থেকে ফিরিয়ে আনি</button></div>
  ${staffCard()}
  <div class="card" style="margin-top:14px"><b class="disp">💌 যোগাযোগ ও অনুদান</b>
    <div style="color:var(--ink2);font-size:14px;margin:6px 0 10px">পড়াশোনা, যেকোনো প্রশ্ন বা সাপোর্টের জন্য সরাসরি যোগাযোগ করো:</div>
    <a class="btn peach" style="text-decoration:none;text-align:center" href="mailto:ogbadhon@gmail.com" onclick="track('contact_click',{extra:{w:'badhon'}})">📧 ইমেইল পাঠাও</a>
    <div style="text-align:center;font-size:14px;font-weight:600;color:var(--peach-d);margin:6px 0 12px;user-select:text;-webkit-user-select:text">ogbadhon@gmail.com</div>
    <a class="btn ghost" style="text-decoration:none;text-align:center;border:2px solid var(--line);border-radius:18px;padding:10px" href="tel:01308390333">📞 01308390333</a>
    <div style="text-align:center;font-size:13px;color:var(--ink2);margin:6px 0 0;user-select:text;-webkit-user-select:text">বিকাশ / নগদ / কল: 01308390333</div></div>
  <div style="margin-top:14px"><button class="btn ghost" data-act="reset">সব মুছে নতুন করে শুরু</button></div>`;
}

/* ============ Lesson engine ============ */
function startLesson(qs, meta) {
  track(meta.challenge ? 'challenge_start' : meta.practice ? 'practice_start' : 'lesson_start', { lesson: meta.id || null });
  LS = { t0: Date.now(), meta, queue: qs.slice(), total: qs.length, hearts: 5, mist: 0, combo: 0, cur: null, view: null, phase: 'ask', sel: null, placed: [], fb: null, say: '' };
  nextQ();
}
function nextQ() {
  if (!LS.queue.length) return finish();
  const q = LS.queue[0]; LS.cur = q; LS.phase = 'ask'; LS.sel = null; LS.placed = []; LS.fb = null; LS.typed = ''; LS.showTxt = false; LS.say = rnd(ASK_MSG);
  const v = {};
  if (q.t === 'ord') v.bank = shuffle(q.words.concat(q.extra || []).map((w, i) => ({ w, i })));
  else if (q.t === 'mat') { v.left = shuffle(q.pairs.map((_, i) => i)); v.right = shuffle(q.pairs.map((_, i) => i)); v.done = []; v.selL = null; v.selR = null; v.wrong = null; v.miss = false; }
  else if (q.t === 'cloze') v.bank = shuffle(q.bank.map((w, i) => ({ w, i })));
  else if (q.t !== 'typ' && q.t !== 'err') { const d = shuffle(q.opts.filter(o => o !== q.ans)).slice(0, (S.lvl === 'high' || S.lvl === 'pro') ? 3 : 2); v.opts = shuffle([q.ans, ...d]); }
  LS.view = v;
  if (q.t === 'lis') setTimeout(() => speak(q.say), 600); else if (q.voice || q.t === 'wtr') setTimeout(() => speak(q.voice || q.en), 500);
  go('lesson');
}

function whyHTML(q, ok) { return `<div class="why">🌸 <b style="display:inline;font-size:16px">${ok ? 'কেন ঠিক?' : 'কেন এমন?'}</b> ${esc(q.tip || ('সম্পূর্ণ উত্তর: ' + qText(q)))}</div>${flagBtn(q)}`; }
function dockHTML() {
  if (LS.phase === 'fb') {
    const f = LS.fb, q = LS.cur;
    const mine = f.mine ? `<div class="ex mine"><span>তোমার উত্তর:</span> <b>${esc(f.mine)}</b></div>` : '';
    const good = q.t === 'mat' ? '' : `<div class="ex good"><span>সঠিক উত্তর:</span> <b>${esc(ansText(q))}</b></div>`;
    if (f.ok) return `<div class="dock">${mascot(66, f.typo ? 'think' : (LS.combo >= 3 ? 'cheer' : 'happy'), true)}<div class="say"><b>${esc(f.msg)}</b>${f.typo ? mine + good : ''}${whyHTML(q, true)}</div></div>`;
    return `<div class="dock">${mascot(66, 'sad', true)}<div class="say"><b>${esc(f.msg)}</b>${mine}${good}${whyHTML(q, false)}</div></div>`;
  }
  return `<div class="dock">${mascot(66, 'ask')}<div class="say">${esc(LS.say)}</div></div>`;
}

function teachSheet(l) { const t = l.teach; sheet(`<div class="big">💡</div><h3>${esc(t.t)}</h3><div class="teach">${t.pts.map(x => `<p>• ${esc(x)}</p>`).join('')}${t.ex.map(([e, b]) => `<div class="tex"><b>${esc(e)}</b><span>${esc(b)}</span></div>`).join('')}</div><button class="btn" data-act="gostart" data-id="${l.id}">বুঝেছি, শুরু করি</button>`); }
function speak(t) {
  try {
    if (!('speechSynthesis' in window) || !t) { toast('এই ফোনে ভয়েস চালু করা যায়নি'); return; }
    const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = .85;
    const vs = speechSynthesis.getVoices(), v = vs.find(x => /^en[-_](US|GB|IN)/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang));
    if (v) u.voice = v; speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) {}
}
function bossSet(u) {
  const arr = lvlLessons().filter(l => l.unit === u).flatMap(l => l.qs.map((q, k) => ({ ...q, id: l.id + ':' + k })));
  return shuffle(arr).slice(0, 10);
}
function bossNode(list, l) {
  const u = l.unit, ul = list.filter(x => x.unit === u), st = (S.boss || {})[S.lvl + ':' + u] || 0;
  const open = isStaff() || ul.every(x => S.progress[x.id]);
  return `<div class="nodewrap" style="--dx:0px">${open && !st ? '<div class="start-tag">বস কুইজ 🏆</div>' : ''}<button class="node ${st ? 'done' : open ? 'cur' : 'lock'}" data-act="boss" data-u="${u}" aria-label="ইউনিট ফাইনাল বস কুইজ"><span class="nemo">🏆</span>${open ? '' : '<b class="lk">🔒</b>'}${st ? `<span class="nst">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</span>` : ''}${(TROPHY[S.lvl] && !S.owned.includes(TROPHY[S.lvl])) ? trBadge() : ''}</button></div>`;
}
function finishBoss() {
  const meta = LS.meta, stars = LS.mist === 0 ? 3 : LS.mist <= 2 ? 2 : 1, key = meta.boss;
  S.boss = S.boss || {}; const first = !S.boss[key], xp = 20 + stars * 5, bB = first ? 25 + LV[S.lvl].bonus : 0;
  addXp(xp, bB); touchStreak(); S.boss[key] = Math.max(S.boss[key] || 0, stars); save();
  LS.res = { stars, xp, coins: xp + bB, lvb: 0, chB: 0, bossB: bB, msg: 'বাঁধন ভাইয়া বলছে: ইউনিটের বস তোমার কাছে হার মানল! 🏆' };
  const blv = String(key).split(':')[0];
  if (TROPHY[blv] && !S.owned.includes(TROPHY[blv])) { S.owned.push(TROPHY[blv]); S.gifts = (S.gifts || 0) + 1; LS.res.gift = TROPHY[blv]; LS.res.trophy = blv; if (ensureTrays()) LS.res.trayGift = 1; save(); track('trophy_won', { n: stars, extra: { lvl: blv, key } }); setTimeout(() => { try { snd('badge'); } catch (e) {} }, 700); }
  track('boss_done', { n: stars, extra: { key } }); sfx.win(); buzz([30, 30, 60]); go('result');
}
function quizOf(q) {
  const o = LS.view.opts;
  if (q.voice) return null;
  if (q.t === 'mcq') { const pp = q.p.split('\n\n'); return { h: 'সঠিকটা কোনটা?', q: pp[pp.length - 1], opts: o }; }
  if (q.t === 'fill') return { h: 'শূন্যস্থানে কোনটা বসবে?', q: q.s, opts: o };
  if (q.t === 'wtr') return { h: 'এই শব্দের বাংলা কী?', q: q.en, opts: o };
  if (q.t === 'typ') return { h: 'ইংরেজিতে কী হবে?', q: q.bn, opts: null };
  return null;
}
async function quizCard() {
  const d = quizOf(LS.cur); if (!d) return toast('এই ধরনের প্রশ্নের কার্ড হয় না');
  toast('কার্ড বানাচ্ছি… 📷');
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const F = "'Hind Siliguri','Noto Sans Bengali',system-ui,sans-serif";
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff3e0'); g.addColorStop(1, '#ffd9e4'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,.75)'; cvRR(x, 50, 50, W - 100, H - 100, 48); x.fill();
  x.textAlign = 'center'; x.fillStyle = '#8a5a44'; x.font = `800 40px ${F}`; x.fillText("Badhon's Cozy Quest 🍵", W / 2, 130);
  x.fillStyle = '#c0567a'; x.font = `800 54px ${F}`; x.fillText(d.h, W / 2, 230);
  const fs = 60; x.font = `800 ${fs}px ${F}`; x.fillStyle = '#4a2f27';
  const ls = []; let cur = ''; d.q.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > W - 220 && cur) { ls.push(cur); cur = w; } else cur = t; }); if (cur) ls.push(cur);
  let y = 340; ls.slice(0, 5).forEach(l => { x.fillText(l, W / 2, y); y += fs + 16; }); y += 20;
  if (d.opts) d.opts.forEach((o, i) => {
    x.fillStyle = '#fff'; cvRR(x, 120, y, W - 240, 110, 36); x.fill(); x.strokeStyle = '#f0c9a8'; x.lineWidth = 4; x.stroke();
    x.fillStyle = '#4a2f27'; const t = 'ABCD'[i] + '.  ' + o, f = cvFit(x, t, 700, 46, F, W - 360, 26); x.font = `700 ${f}px ${F}`; x.textAlign = 'left'; x.fillText(t, 160, y + 70); x.textAlign = 'center'; y += 135; });
  else { x.fillStyle = '#8a5a44'; x.font = `700 46px ${F}`; x.fillText('ইংরেজিতে লিখে কমেন্ট করো ✍️', W / 2, y + 40); }
  x.fillStyle = '#c0567a'; x.font = `800 44px ${F}`; x.fillText('উত্তর কমেন্টে জানাও 👇', W / 2, H - 190);
  const link = appLink().replace(/\?src=[^&]*/, ''); x.fillStyle = '#8a5a44'; x.font = `700 36px ${F}`; x.fillText(link.replace(/^https?:\/\//, ''), W / 2, H - 125);
  const blob = await new Promise(r => c.toBlob(r, 'image/png')), f = new File([blob], 'cozy-quiz.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [f] })) { track('quiz_share'); navigator.share({ files: [f], title: "Badhon's Cozy Quest", text: 'এই প্রশ্নের উত্তর কী? 🤔 আরও মজার কুইজ: ' + link + '?src=quizshare' }).catch(() => {}); }
  else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cozy-quiz.png'; document.body.appendChild(a); a.click(); a.remove(); toast('কার্ড সেভ হয়েছে ✅'); }
}
function lessonHTML() {
  const q = LS.cur, v = LS.view, pct = Math.round(((LS.total - LS.queue.length) / LS.total) * 100);
  let body = '';
  const locked = LS.phase === 'fb';
  const optClass = i => {
    if (!locked) return LS.sel === i ? 'sel' : '';
    if (v.opts[i] === q.ans) return 'ok';
    return LS.sel === i ? 'no' : '';
  };
  const label = q.t === 'pick' ? `‘<b>${esc(q.word)}</b>’ কোনটা?` : QLABEL[q.t];
  const head = `<div class="qlabel">${label}</div>`;
  const listOpts = () => `<div class="opts list">${v.opts.map((o, i) => `<button class="opt ${optClass(i)}" data-act="sel" data-i="${i}" ${locked ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>`;
  if (q.t === 'pick') {
    body = `${head}<div class="opts grid">${v.opts.map((o, i) => `<button class="opt emo ${optClass(i)}" data-act="sel" data-i="${i}" ${locked ? 'disabled' : ''}>${o}</button>`).join('')}</div>`;
  } else if (q.t === 'wtr') {
    body = `${head}<div class="bigq">${esc(q.en)}</div><button class="spk" data-act="say" data-t="${esc(q.en)}" aria-label="শুনো">🔊</button>${listOpts()}`;
  } else if (q.t === 'tr') {
    body = `${head}<div class="bigq sm">${esc(q.bn)}</div>${listOpts()}`;
  } else if (q.t === 'mcq') {
    const pp = q.p.split('\n\n'), passage = pp.length > 1 ? `<div class="passage">${esc(pp[0])}</div>` : '';
    body = `${head}${passage}<div class="bigq sm">${esc(pp[pp.length - 1])}</div>${q.voice ? `<button class="spk" data-act="say" data-t="${esc(q.voice)}" aria-label="শুনো">🔊</button>` : ''}${listOpts()}`;
  } else if (q.t === 'fill') {
    const chosen = LS.sel !== null ? esc(v.opts[LS.sel]) : '&nbsp;';
    const sentence = esc(q.s).split('___').join(`<span class="blank">${chosen}</span>`);
    body = `${head}<div class="sent">${sentence}</div>${listOpts()}`;
  } else if (q.t === 'typ') {
    body = `${head}<div class="bigq sm">${esc(q.bn)}</div><input id="typ" class="typ" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="এখানে ইংরেজিতে লেখো" value="${esc(LS.typed || '')}" ${locked ? 'disabled' : ''}>`;
  } else if (q.t === 'ord') {
    const placed = LS.placed.map(bi => { const t = v.bank.find(b => b.i === bi); return `<button class="wtile" data-act="unplace" data-i="${bi}" ${locked ? 'disabled' : ''}>${esc(t.w)}</button>`; }).join('');
    const rest = v.bank.filter(b => !LS.placed.includes(b.i)).map(b => `<button class="wtile" data-act="place" data-i="${b.i}" ${locked ? 'disabled' : ''}>${esc(b.w)}</button>`).join('');
    body = `${head}<div class="bigq sm" style="margin-top:0">${esc(q.bn)}</div><div class="line" aria-label="তোমার উত্তর">${placed}</div><div class="bank">${rest}</div>`;
  } else if (q.t === 'mat') {
    const bt = (side, i, txt) => { const ci = v.done.indexOf(i), dn = ci >= 0, isSel = side === 'l' ? v.selL === i : v.selR === i, bad = v.wrong && v.wrong[side === 'l' ? 0 : 1] === i;
      return `<button class="opt ${dn ? 'done pc' + ci : ''} ${isSel ? 'sel' : ''} ${bad ? 'no' : ''}" data-act="${side === 'l' ? 'ml' : 'mr'}" data-i="${i}" ${dn ? 'disabled' : ''}>${esc(txt)}${dn ? '<i>' + bn(ci + 1) + '</i>' : ''}</button>`; };
    const rows = v.left.map((l, k) => bt('l', l, q.pairs[l][0]) + bt('r', v.right[k], q.pairs[v.right[k]][1])).join('');
    body = `${head}<div class="match">${rows}</div>`;
  } else if (q.t === 'lis') {
    body = `${head}<button class="spk big" data-act="say" data-t="${esc(q.say)}" aria-label="শুনো">🔊</button><div class="lish">${esc(q.ask)}</div>${(locked || LS.showTxt) ? `<div class="passage">${esc(q.say)}</div>` : '<button class="txtb" data-act="showtxt">👀 শুনতে পাচ্ছ না? লেখাটা দেখো</button>'}${listOpts()}`;
  } else if (q.t === 'chat') {
    const ch = LS.sel !== null ? esc(v.opts[LS.sel]) : '…';
    body = `${head}<div class="chat">${q.lines.map(([w, t]) => `<div class="cb ${w}"><span>${esc(t)}</span></div>`).join('')}<div class="cb m bl"><span>${ch}</span></div></div>${listOpts()}`;
  } else if (q.t === 'err') {
    body = `${head}<div class="etoks">${q.s.split(' ').map((w, i) => `<button class="etok ${locked ? (i === q.bad ? 'ok' : LS.sel === i ? 'no' : '') : (LS.sel === i ? 'sel' : '')}" data-act="sel" data-i="${i}" ${locked ? 'disabled' : ''}>${esc(w)}</button>`).join('')}</div>`;
  } else if (q.t === 'cloze') {
    const parts = q.p.split('___'), words = LS.placed.map(bi => v.bank.find(b => b.i === bi)), full = LS.placed.length >= q.ans.length;
    const para = parts.map((t, k) => esc(t) + (k < parts.length - 1 ? (words[k] ? `<button class="cbl on" data-act="unplace" data-i="${words[k].i}" ${locked ? 'disabled' : ''}>${esc(words[k].w)}</button>` : '<span class="cbl"></span>') : '')).join('');
    body = `${head}<div class="cloze">${para}</div><div class="bank">${v.bank.filter(b => !LS.placed.includes(b.i)).map(b => `<button class="wtile" data-act="place" data-i="${b.i}" ${(locked || full) ? 'disabled' : ''}>${esc(b.w)}</button>`).join('')}</div>`;
  }

  let foot;
  if (LS.phase === 'fb') {
    const f = LS.fb;
    foot = `<div class="lfoot ${f.ok ? 'ok' : 'no'}"><div>${dockHTML()}<button class="btn ${f.ok ? '' : 'bad'}" data-act="cont">চালিয়ে যাও</button></div></div>`;
  } else if (q.t === 'mat') {
    foot = `<div class="lfoot"><div>${dockHTML()}</div></div>`;
  } else {
    const ready = q.t === 'cloze' ? LS.placed.length === q.ans.length : q.t === 'ord' ? LS.placed.length > 0 : q.t === 'typ' ? (LS.typed || '').trim().length > 0 : LS.sel !== null;
    foot = `<div class="lfoot"><div>${dockHTML()}<button class="btn" data-act="check" ${ready ? '' : 'disabled'}>যাচাই করো</button></div></div>`;
  }

  return `<div class="lhead">
    <button class="x" data-act="quit" aria-label="বন্ধ করো">✕</button>
    <div class="pbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
    <div class="hearts" aria-label="${LS.hearts}টা হার্ট">${[0, 1, 2, 3, 4].map(i => ico(i < LS.hearts ? 'heart' : 'heart_empty')).join('')}</div></div>
    <div class="qbody">${body}${(!q.voice && ['mcq', 'fill', 'wtr', 'typ'].includes(q.t)) ? '<button class="qshare" data-act="qshare">📤 কুইজ কার্ড বানাও</button>' : ''}</div>${foot}`;
}

function judge(ok, mine) {
  const q = LS.cur;
  LS.phase = 'fb';
  if (ok) {
    LS.combo++;
    sfx.good(LS.combo); buzz(20);
    LS.fb = { ok: true, msg: LS.combo >= 3 && Math.random() < .7 ? rnd(OK_MSG_HOT) : rnd(OK_MSG) };
    if (LS.meta.practice) S.mistakes = S.mistakes.filter(id => id !== q.id);
  } else {
    LS.combo = 0;
    sfx.bad(); buzz([40, 40, 40]);
    LS.hearts--; LS.mist++;
    track('qwrong', { lesson: LS.meta.id || (LS.meta.challenge ? 'challenge' : 'practice'), qid: q.id });
    if (!S.mistakes.includes(q.id)) S.mistakes.push(q.id);
    LS.fb = { ok: false, msg: rnd(BAD_MSG), mine };
  }
  save(); render();
  if (!ok) setTimeout(() => { const m = document.querySelector('.dock .mascot'); if (m && LS && LS.phase === 'fb' && LS.fb && !LS.fb.ok && MASCOT.images.think) m.src = MASCOT.images.think; }, 1800);
}

function finish() {
  if (LS.meta.boss) return finishBoss();
  const meta = LS.meta, les = meta.id ? lessonById(meta.id) : null, stars = LS.mist === 0 ? 3 : LS.mist <= 2 ? 2 : 1;
  const xp = meta.practice ? 8 : 10 + stars * 3, prev = meta.id ? (S.progress[meta.id] || 0) : 0;
  const lvb = (!meta.practice && !meta.challenge && les) ? LV[les.lvl].bonus : 0;
  let chB = 0; if (meta.challenge && S.chDay !== dk()) { chB = 15 + LV[S.lvl].bonus; S.chDay = dk(); }
  addXp(xp, lvb + chB); touchStreak(); S.tc = (S.tc && S.tc.d === dk()) ? S.tc : { d: dk(), n: 0 }; S.tc.n++;
  if (!meta.practice && !meta.challenge) S.progress[meta.id] = Math.max(prev, stars);
  save();
  LS.res = { stars, xp, coins: xp + lvb + chB, lvb, chB, msg: rnd(WIN_MSG) };
  track(meta.challenge ? 'challenge_done' : meta.practice ? 'practice_done' : 'lesson_done', { lesson: meta.id || null, n: stars, extra: { mist: LS.mist, hearts: LS.hearts, sec: Math.round((Date.now() - (LS.t0 || Date.now())) / 1000), first: !!(meta.id && !prev) } });
  if (!meta.practice && !meta.challenge) { S.dry = (S.dry || 0) + 1; if (Math.random() < .25 || S.dry >= 4) { const sp = NOOK.items.filter(i => i.sp && !i.tr && !S.owned.includes(i.id)), pool = sp.length ? sp : NOOK.items.filter(i => !i.tr && !S.owned.includes(i.id)); S.dry = 0; if (pool.length) { const g = rnd(pool); S.owned.push(g.id); S.gifts = (S.gifts || 0) + 1; LS.res.gift = g.id; if (ensureTrays()) LS.res.trayGift = 1; } else { S.coins = (S.coins || 0) + 5; LS.res.bonus = 5; } save(); if (LS.res.gift) setTimeout(() => { try { snd('done'); } catch (e) {} }, 700); } }
  sfx.win(); buzz([30, 30, 60]);
  go('result');
}

function resultHTML() {
  const r = LS.res, g = nextGoal(), stars = [0, 1, 2].map(i => `<span>${i < r.stars ? '⭐' : '☆'}</span>`).join('');
  const pb = g.nx ? Math.max(0, Math.round((g.c - r.coins - (r.bonus || 0)) / g.nx.p * 100)) : 100, ph = r.anim ? g.pct : Math.min(pb, g.pct);
  const gift = r.gift ? `<div class="giftx"><img id="gbox" class="gb shake" src="assets/img/hud_gift0.webp" alt=""><div id="greveal" class="greveal ${r.anim ? 'on' : ''}"><img src="${NIMG[r.gift]}" alt=""><div>${r.trophy ? `<b>🏆 ${LV[r.trophy].name} মোডের বসকে হারিয়ে দিলে!</b>${ITEM[r.gift].n} জিতে নিয়েছ। ট্রেতে অপেক্ষা করছে, কোজি রুমে সাজিয়ে সবাইকে দেখাও!` : `<b>🎁 সারপ্রাইজ স্টিকার!</b>${ITEM[r.gift].n}${ITEM[r.gift].sp ? ' ✨ স্পেশাল' : ''} পেয়েছো, ট্রেতে অপেক্ষা করছে।`}${r.trayGift ? '<br>🧺 ট্রে ভরা ছিল, তাই একটা নতুন ট্রেও ফ্রি পেলে!' : ''}</div></div></div>` : r.bonus ? `<div class="gift"><div><b>🎁 সারপ্রাইজ!</b>সব স্টিকার তোমার, তাই ${r.bonus} বোনাস কয়েন পেলে ${COIN}</div></div>` : '';
  return `<div class="center" style="padding-top:18px">${mascot(110, 'cheer', true)}
    <h2 style="font-size:32px;margin-top:10px">${LS.meta.boss ? 'বস কুইজ জিতেছ! 🏆' : LS.meta.practice ? 'ভুলগুলো ঠিক হলো!' : LS.meta.challenge ? 'চ্যালেঞ্জ শেষ!' : 'পাঠ শেষ!'}</h2>
    <div class="stars" aria-label="${r.stars}টা তারা">${stars}</div>
    <div class="bubble">${r.msg}</div>
    <div class="rstats four">
      <div class="stat"><b><img class="si" src="assets/img/hud_xp.webp" alt=""> +${bn(r.xp)}</b><span>XP পেলে</span></div>
      <div class="stat cs"><b>${COIN} +${bn(r.coins)}</b><span>কয়েন পেলে</span></div>
      <div class="stat"><b><img class="si" src="assets/img/hud_flame.webp" alt=""> ${bn(shownStreak())}</b><span>দিনের স্ট্রিক</span></div>
      <div class="stat"><b>${ico('heart')} ${bn(LS.hearts)}</b><span>হার্ট বাকি</span></div>
    </div>
    ${(r.lvb || r.chB || r.bossB) ? `<div class="bonusline">${r.lvb ? `<span>${lvI(S.lvl)} লেভেল বোনাস +${r.lvb}</span>` : ''}${r.chB ? `<span>🎯 চ্যালেঞ্জ বোনাস +${r.chB}</span>` : ''}${r.bossB ? `<span>🏆 বস বোনাস +${r.bossB}</span>` : ''}</div>` : ''}
    <div class="jarbox"><div class="jar" id="jar"><img src="assets/img/hud_jar.webp" alt=""><div class="jfill"><i style="height:${ph}%"></i></div></div><div class="jt"><b>${COIN} ${g.c}</b><small>${g.line}</small></div></div>
    ${gift}
    <button class="btn" data-act="home">চালিয়ে যাও</button>${(!isStandalone() && (DIP || isIOS() || isInApp())) ? `<button class="btn peach" data-act="installbig" style="margin-top:8px">${isInApp() ? '🌐 ব্রাউজারে খুলে ইনস্টল করো' : '📲 অ্যাপের মতো রাখো'}</button>` : ''}${r.gift ? '<button class="btn ghost" data-act="giftgo">ঘরে গিয়ে বসাই 🏡</button>' : ''}</div>`;
}

function failHTML() {
  return `<div class="center" style="padding-top:36px">${mascot(120, 'sad', true)}
    <h2 style="font-size:30px;margin:12px 0 8px">হার্ট শেষ, কিন্তু সমস্যা নেই!</h2>
    <p style="color:var(--ink2);margin:0 0 6px">বাঁধন ভাইয়া বলছে: ইংলিশ পালিয়ে যাচ্ছে না। একটু চা খেয়ে আবার আসো ☕ 🍵</p>
    <p style="color:var(--ink2);margin:0 0 24px">ভুল করা প্রশ্নগুলো ভুলের খাতায় জমা আছে।</p>
    <button class="btn peach" data-act="retry">আবার চেষ্টা করি</button>
    <div style="margin-top:8px"><button class="btn ghost" data-act="home">বাড়ি ফিরি</button></div></div>`;
}

function petals() {
  const box = document.createElement('div'); box.className = 'petals';
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('i'); p.className = 'petal';
    p.style.left = Math.random() * 100 + '%';
    p.style.setProperty('--sx', (Math.random() * 120 - 60) + 'px');
    p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    p.style.animationDuration = (2.6 + Math.random() * 2.2) + 's';
    p.style.animationDelay = (Math.random() * .9) + 's';
    p.style.width = (10 + Math.random() * 8) + 'px'; p.style.height = (8 + Math.random() * 6) + 'px';
    box.appendChild(p);
  }
  layer.appendChild(box);
  setTimeout(() => box.remove(), 6000);
}

/* ============ Sheets ============ */
function sheet(html) {
  layer.querySelectorAll('.overlay').forEach(n => n.remove());
  const o = document.createElement('div'); o.className = 'overlay'; o.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  o.addEventListener('click', e => { if (e.target === o) o.remove(); });
  layer.appendChild(o); iconify(o);
}
const closeSheet = () => layer.querySelectorAll('.overlay').forEach(n => n.remove());

/* ============ কপি / জুম বন্ধ ============ */
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => { if (!(e.target.closest && e.target.closest('input,textarea'))) e.preventDefault(); });
document.addEventListener('dblclick', e => { if (!(e.target.closest && e.target.closest('input,textarea'))) e.preventDefault(); });
document.addEventListener('copy', e => { if (!(document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName))) e.preventDefault(); });
['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault()));
document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });

/* ============ Events ============ */
document.addEventListener('input', e => {
  if (e.target.id === 'nm') { W.name = e.target.value; const b = $('#startBtn'); if (b) b.disabled = !(W.name.trim() && W.lvl); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'nm') { const b = $('#startBtn'); if (b && !b.disabled) b.click(); }
});

function finishTut() {
  S.tut = true; save(); T = 0;
  go(tutFrom === 'me' ? 'me' : (S.name ? 'home' : 'welcome'));
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, i = el.dataset.i !== undefined ? +el.dataset.i : null, v = el.dataset.v, id = el.dataset.id;
  if (!['check', 'cont', 'skipsplash'].includes(act)) sfx.tap();

  switch (act) {
    case 'say': speak(el.dataset.t); break;
    case 'qshare': quizCard(); break;
    case 'boss': { const u = +el.dataset.u, list = lvlLessons(), ul = list.filter(x => x.unit === u);
      if (!isStaff() && !ul.every(x => S.progress[x.id])) { sheet(`<div class="big">🔒</div><h3>বস কুইজ বন্ধ</h3><p>এই ইউনিটের সব পাঠ শেষ করলে বস কুইজ খুলবে।</p><button class="btn" data-act="close">ঠিক আছে</button>`); break; }
      const st = (S.boss || {})[S.lvl + ':' + u] || 0;
      sheet(`<div class="big">🏆</div><h3>${esc(UNITS[S.lvl][u].title)} · বস কুইজ</h3><p>10টা প্রশ্ন · ${st ? 'আবার জিতলে তারা বাড়তে পারে ' + '⭐'.repeat(st) : 'প্রথমবার জিতলে বিশাল বোনাস কয়েন ' + COIN}</p>${trTeaser()}<button class="btn" data-act="bossgo" data-u="${u}">${st ? 'আবার লড়ি' : 'বসকে হারাই'}</button><button class="btn ghost" data-act="close">পরে</button>`); break; }
    case 'bossgo': { closeSheet(); const u = +el.dataset.u, qs = bossSet(u); if (qs.length) startLesson(qs, { boss: S.lvl + ':' + u, bossU: u }); break; }
    case 'skipsplash': sfx.hello(); clearTimeout(splashTimer); afterSplash(); break;
    case 'tnext': if (T < TUT.length - 1) { T++; render(); } else finishTut(); break;
    case 'tprev': if (T > 0) { T--; render(); } break;
    case 'tskip': finishTut(); break;
    case 'tutagain': T = 0; tutFrom = 'me'; go('tut'); break;
    case 'wlvl': W.lvl = v; document.querySelectorAll('.lvc').forEach(c => c.classList.toggle('on', c.dataset.v === v)); { const b = $('#startBtn'); if (b) b.disabled = !(W.name.trim() && W.lvl); } break;
    case 'begin': S.name = W.name.trim(); S.lvl = W.lvl; save(); track('start', { extra: { lvl: S.lvl } }); go('home'); break;
    case 'setlvl': if (LV[v]) { const ch = S.lvl !== v; S.lvl = v; save(); closeSheet(); if (ch) { track('level_set', { extra: { to: v } }); toast(LV[v].e + ' ' + LV[v].name + ' লেভেলে এলে!'); } go('home'); } break;
    case 'lvlpick': levelSheet(); break;
    case 'challenge': startChallenge(); break;
    case 'flag': if (LS && id) { (LS.flagged = LS.flagged || {})[id] = 1; track('flag', { lesson: id.split(':')[0], qid: id }); toast('ধন্যবাদ! বাঁধনকে জানিয়ে দিলাম 🌟'); render(); } break;
    case 'mdel': S.mistakes = S.mistakes.filter(x => x !== id); save(); snd('remove', .5); render(); break;
    case 'mmore': N.mlim = (N.mlim || 30) + 30; render(); break;
    case 'mclear': sheet(`<div class="big">🗑️</div><h3>খাতা পুরো খালি করবে?</h3><p>ভুলের খাতার সব প্রশ্ন মুছে যাবে। পাঠের তারা আর কয়েন আগের মতোই থাকবে।</p><button class="btn bad" data-act="mclear2">হ্যাঁ, সব মুছো</button><button class="btn ghost" data-act="close">না, থাক</button>`); break;
    case 'mclear2': S.mistakes = []; save(); closeSheet(); snd('remove'); toast('খাতা পরিষ্কার ✨'); render(); break;
    case 'install': case 'installbig': installSheet(); break;
    case 'doinst': doInst(); break;
    case 'insthide': S.instHide = Date.now(); save(); render(); break;
    case 'copylink': copyLink(); break;
    case 'shareapp': shareApp(); break;
    case 'news': newsSheet(); break;
    case 'stats': S.stats = v === '1'; save(); render(); break;
    case 'stlogin': staffSheet(); break;
    case 'stgo': staffLogin(); break;
    case 'stout': staffOut(); break;
    case 'stcoins': S.coins = Math.max(S.coins || 0, STAFF_COINS); save(); toast('🪙 কয়েন ভরা হলো'); render(); break;
    case 'report': RP.st = 'idle'; go('report'); loadReport(); break;
    case 'rpdays': RP.days = +v || 7; loadReport(); break;
    case 'rpreload': loadReport(); break;
    case 'rpback': go('me'); break;
    case 'copynum': copyNum(); break;
    case 'nav': go(v); break;
    case 'open': {
      const list = lvlLessons(), idx = list.findIndex(x => x.id === id), l = list[idx];
      if (!unlocked(list, idx)) { sheet(`<div class="big">🔒</div><h3>এখনো বন্ধ</h3><p>আগের পাঠটা শেষ করলে এটা খুলে যাবে।</p><button class="btn" data-act="close">ঠিক আছে</button>`); break; }
      const st = S.progress[l.id] || 0;
      sheet(`<div class="big">${l.emoji}</div><h3>${esc(l.title)}</h3><p>${UNITS[l.lvl][l.unit].title} · ${l.full ? l.qs.length : Math.min(7, l.qs.length)}টা প্রশ্ন · ${COIN} ${13 + LV[l.lvl].bonus}-${19 + LV[l.lvl].bonus}${st ? ' · ' + '⭐'.repeat(st) : ''}</p>
        <button class="btn" data-act="go" data-id="${l.id}">${st ? 'আবার করি' : 'শুরু করি'}</button>${l.teach ? `<button class="btn ghost" data-act="teach" data-id="${l.id}">💡 আগে একটু শিখি</button>` : ''}<button class="btn ghost" data-act="close">পরে</button>`);
      break;
    }
    case 'close': closeSheet(); break;
    case 'ntab': case 'cat': case 'scat': case 'rprev': case 'rnext': case 'rgo': case 'undo': case 'pic': case 'picdl': case 'picsave': case 'piccap': case 'tomarket': case 'buy': case 'help': case 'music': case 'isz': case 'iflip': case 'itray': case 'trprev': case 'trnext': case 'trayshop': case 'buytray': nookAct(act, i, v, id); break;
    case 'night': {
      S.night = !S.night; S.nightMan = partKey(); const first = S.night && !S.nightSeen; if (S.night) S.nightSeen = 1; save(); snd('pick2');
      document.querySelectorAll('.dn').forEach(b => { b.classList.toggle('night', !!S.night); b.setAttribute('aria-checked', !!S.night); });
      const rc = document.getElementById('rcar'); if (rc) rc.classList.toggle('night', !!S.night); nkSky();
      if (first) setTimeout(() => { if (view === 'nook') render(); }, 500);
      break;
    }
    case 'quests': questSheet(); break;
    case 'qclaim': { const q = QUESTS.find(z => z.id === id); if (q && !S.qd[q.id] && q.v()[0] >= q.v()[1]) { S.qd[q.id] = 1; S.coins = (S.coins || 0) + q.r; save(); snd('coin'); render(); questSheet(); } break; }
    case 'qmx': closeQm(); break;
    case 'tonook': N.tab = 'room'; go('nook'); break;
    case 'bdinfo': { const b = BADGES[+i], got = S.bd && S.bd[+i]; sheet(`<div class="center"><img src="assets/img/bd_${+i + 1}.webp" alt="" style="width:96px;${got ? '' : 'filter:grayscale(1);opacity:.5'}"></div><h3>${b[0]}</h3><p>${b[1]}</p><p style="color:var(--ink2)">${got ? '✅ পেয়ে গেছো!' : 'এখনো পাওনি'}</p><button class="btn" data-act="close">ঠিক আছে</button>`); break; }
    case 'mset': S.music = v === '1'; save(); render(); musicSheet(); break;
    case 'giftgo': N.tab = 'room'; go('nook'); break;
    case 'trinfo': { const k = v; if (!TROPHY[k]) break; const got = S.owned.includes(TROPHY[k]);
      sheet(`<div class="center"><img src="${NIMG[TROPHY[k]]}" alt="" style="width:110px;height:110px;object-fit:contain;${got ? '' : 'filter:grayscale(1);opacity:.4'}"></div><h3>${ITEM[TROPHY[k]].n}</h3><p>${got ? '✅ জিতে নিয়েছ! ট্রফি ট্রেতে আছে, কোজি রুমে সাজিয়ে রাখো।' : `${LV[k].name} মোডের যেকোনো ইউনিটের বস কুইজ প্রথমবার জিতলেই এই ট্রফি সারপ্রাইজ গিফট পাবে 🎁`}</p><button class="btn" data-act="close">ঠিক আছে</button>`); break; }
    case 'bkshow': backupSheet(); break;
    case 'bkask': restoreSheet(); break;
    case 'bkcopy': { const t = $('#bk'); if (t) { t.select(); const ok = () => toast('কপি হয়েছে ✅'); (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(ok).catch(() => { try { document.execCommand('copy'); ok(); } catch (x) { toast('লেখাটা চেপে ধরে কপি করো'); } }); } break; }
    case 'bkrestore': { try { const o = decS(($('#bkin') || {}).value); S = Object.assign(defaults(), o); fixS(); save(); closeSheet(); toast('সব ফিরে এসেছে 🌸'); go('home'); } catch (x) { toast('কোডটা ঠিক নেই, আবার দেখো'); } break; }
    case 'notes': notesSheet(); break;
    case 'nsave': { const t = ($('#nta') || {}).value; if (t && t.trim()) { (S.notes = S.notes || []).unshift({ t: t.trim(), d: new Date().toLocaleDateString('en-GB') }); save(); if (view === 'mistakes') render(); notesSheet(); } break; }
    case 'ndel': S.notes.splice(i, 1); save(); if (view === 'mistakes' && !layer.querySelector('.overlay')) render(); else notesSheet(); break;
    case 'go': { closeSheet(); const l = lessonById(id), lst = lvlLessons(), ix = lst.findIndex(x => x.id === id); if (ix >= 0 && !unlocked(lst, ix)) { toast('আগের পাঠটা শেষ করলে এটা খুলবে 🔒'); break; } if (l.teach && !(S.tch || (S.tch = {}))[l.id]) { teachSheet(l); break; } startLesson(pickSet(l), { id: l.id }); break; }
    case 'gostart': { closeSheet(); const l = lessonById(id); if (l) { (S.tch = S.tch || {})[l.id] = 1; save(); startLesson(pickSet(l), { id: l.id }); } break; }
    case 'teach': { closeSheet(); const l = lessonById(id); if (l && l.teach) teachSheet(l); break; }
    case 'showtxt': if (LS && LS.phase === 'ask') { LS.showTxt = true; render(); } break;
    case 'practice': { const qs = shuffle(S.mistakes.map(qById).filter(Boolean)).slice(0, 8); if (qs.length) startLesson(qs, { practice: true }); break; }
    case 'retry': { const m = LS.meta; if (m.boss) { const qs = bossSet(m.bossU); qs.length ? startLesson(qs, m) : go('home'); } else if (m.challenge) { const qs = challengeSet(); qs.length ? startLesson(qs, m) : go('home'); } else if (m.practice) { const qs = shuffle(S.mistakes.map(qById).filter(Boolean)).slice(0, 8); qs.length ? startLesson(qs, m) : go('home'); } else { const l = lessonById(m.id); startLesson(pickSet(l), m); } break; }
    case 'home': { const fr = view === 'result'; go('home'); if (fr && !S.instAsk && doneCount() >= 1 && instReady() && !isInApp()) setTimeout(() => { if (view === 'home' && !layer.querySelector('.overlay') && !document.querySelector('.nmd')) installSheet(true); }, 900); break; }
    case 'snd': S.sound = v === '1'; save(); render(); if (S.sound) sfx.good(2); break;
    case 'reset': sheet(`<div class="big">🧹</div><h3>সব মুছে ফেলবে?</h3><p>নাম, XP, স্ট্রিক আর তারা সব মুছে যাবে।</p>
        <button class="btn bad" data-act="reset2">হ্যাঁ, মুছে ফেলো</button><button class="btn ghost" data-act="close">না, থাক</button>`); break;
    case 'reset2': try { localStorage.removeItem(KEY); } catch (err) {} S = defaults(); fixS(); W = { name: '', lvl: '' }; closeSheet(); go('welcome'); break;
    case 'quit': sheet(`<div class="big">🍵</div><h3>এখনই চলে যাবে?</h3><p>এই পাঠের অগ্রগতি হারিয়ে যাবে।</p>
        <button class="btn" data-act="close">থাকি</button><button class="btn ghost" data-act="leave">বের হই</button>`); break;
    case 'leave': if (LS) track('lesson_quit', { lesson: LS.meta.id || (LS.meta.challenge ? 'challenge' : 'practice'), n: LS.total - LS.queue.length }); closeSheet(); go('home'); break;

    case 'sel': if (LS.phase === 'ask') { LS.sel = i; render(); } break;
    case 'place': if (LS.phase === 'ask' && !(LS.cur.t === 'cloze' && LS.placed.length >= LS.cur.ans.length)) { LS.placed.push(i); render(); } break;
    case 'unplace': if (LS.phase === 'ask') { LS.placed = LS.placed.filter(x => x !== i); render(); } break;
    case 'check': {
      const q = LS.cur;
      if (q.t === 'typ') checkTyp(q);
      else if (q.t === 'ord') { const got = LS.placed.map(bi => LS.view.bank.find(b => b.i === bi).w).join(' '); judge(got.toLowerCase() === q.words.join(' ').toLowerCase() || (q.alt || []).some(a => a.join(' ').toLowerCase() === got.toLowerCase()), got); }
      else if (q.t === 'cloze') { const got = LS.placed.map(bi => LS.view.bank.find(b => b.i === bi).w); judge(got.join('|').toLowerCase() === q.ans.join('|').toLowerCase(), got.join(', ')); }
      else if (q.t === 'err') judge(LS.sel === q.bad, q.s.split(' ')[LS.sel]);
      else { const got = LS.view.opts[LS.sel]; judge(got === q.ans, got); }
      break;
    }
    case 'ml': matPick('l', i); break;
    case 'mr': matPick('r', i); break;
    case 'cont': {
      sfx.tap();
      const q = LS.queue.shift();
      
      if (LS.hearts <= 0) { sfx.lose(); track('lesson_fail', { lesson: LS.meta.id || (LS.meta.challenge ? 'challenge' : 'practice'), n: LS.total - LS.queue.length }); go('fail'); }
      else nextQ();
      break;
    }
  }
});

document.addEventListener('input', e => { if (e.target.id === 'typ' && LS) { LS.typed = e.target.value; if (e.inputType && e.inputType.indexOf('insert') === 0) snd('key', .45); const b = $('[data-act="check"]'); if (b) b.disabled = !LS.typed.trim(); } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'typ') { const b = $('[data-act="check"]'); if (b && !b.disabled) b.click(); } });
const _render = render;
render = function () { _render(); if (view !== 'lesson' && view !== 'splash') iconify(app); restoreCar(); restoreTray(); fxHook(); requestAnimationFrame(() => { const f = document.querySelector('.lfoot'); document.documentElement.style.setProperty('--foot', (f ? f.offsetHeight : 0) + 'px'); }); };
if (window.visualViewport) { const vv = window.visualViewport, kb = () => document.documentElement.style.setProperty('--kb', Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + 'px'); vv.addEventListener('resize', kb); vv.addEventListener('scroll', kb); }
/* ============ v1.1: লেভেল, চ্যালেঞ্জ, ট্রেইলার, পরিসংখ্যান, ইনস্টল ============ */
const levelCards = (cur, act) => LEVELS.map(l => `<button class="lvc k-${l.k} ${cur === l.k ? 'on' : ''} ${l.k === 'med' ? 'rec' : ''}" data-act="${act}" data-v="${l.k}"><span class="lve">${lvI(l.k)}</span><span class="lvt"><b>${l.name}${l.tag ? `<em class="lvg ${l.k === 'med' ? 'rc' : ''}">${l.tag}</em>` : ''}</b><small>${l.sub}</small></span><i class="lvck">✓</i></button>`).join('');
function levelSheet() {
  sheet(`<div class="center">${mascot(72, 'ask', true)}</div><h3>কোন লেভেলে খেলবে?</h3><p>যখন খুশি বদলাতে পারবে। তারা আর অগ্রগতি সব জমা থাকবে 🌸</p><div class="lvgrid" style="text-align:left;max-height:48vh;overflow:auto;padding:2px 2px 6px">${levelCards(S.lvl, 'setlvl')}</div><button class="btn ghost" data-act="close" style="margin-top:6px">থাক</button>`);
}

/* ---- আজকের চ্যালেঞ্জ: পুরোনো (শেষ করা) পাঠ থেকে রোজ 10টা প্রশ্ন, সারাদিন একই সেট ---- */
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rngSeed(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function challengePool() { return lvlLessons().filter(l => S.progress[l.id] || isStaff()).flatMap(l => l.qs.map((q, k) => ({ ...q, id: l.id + ':' + k }))); }
function challengeSet() {
  const r = rngSeed(hashStr(dk() + S.lvl)), a = challengePool().map(q => [r(), q]).sort((x, y) => x[0] - y[0]).map(x => x[1]), out = []; let mats = 0;
  for (const q of a) { if (q.t === 'mat') { if (mats >= 2) continue; mats++; } out.push(q); if (out.length >= 10) break; }
  return out;
}
function startChallenge() { const qs = challengeSet(); if (qs.length < 8) return toast('আগে আরও একটা পাঠ শেষ করো 🌱'); startLesson(qs, { challenge: true }); }
function challengeTile() {
  const ready = challengePool().length >= 10, done = S.chDay === dk(), b = 15 + LV[S.lvl].bonus;
  if (!ready) return `<div class="tile ch lock"><span class="che">🎯</span><b>আজকের চ্যালেঞ্জ</b><small>আরও একটা পাঠ শেষ করলেই খুলবে</small></div>`;
  return `<button class="tile ch ${done ? 'done' : ''}" data-act="challenge"><span class="che">${done ? '✅' : '🎯'}</span><b>আজকের চ্যালেঞ্জ</b><small>${done ? 'আজকের পুরস্কার পেয়েছ! কাল নতুন সেট' : `10টা প্রশ্ন · ${COIN} +${b}`}</small></button>`;
}

const trailerCard = () => ''; function trailerSheet() {}

/* ---- ভুলের খাতার 🚩 বাটন ---- */
const flagBtn = q => (LS && LS.flagged && LS.flagged[q.id]) ? '<div class="flagged">🌸 জানিয়ে দিয়েছি, ধন্যবাদ!</div>' : `<button class="flag" data-act="flag" data-id="${q.id}">🚩 ভুল আছে?</button>`;

/* ---- অজানা পরিসংখ্যান (Supabase events): নাম/ফোন/ছবি কিছুই যায় না ---- */
const UID = (() => { try { let u = localStorage.getItem('ncq_uid'); if (!u) { u = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'u' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('ncq_uid', u); } return u; } catch (e) { return 'anon'; } })();
let EVQ = (() => { try { return JSON.parse(localStorage.getItem('ncq_evq') || '[]'); } catch (e) { return []; } })();
const evSave = () => { try { localStorage.setItem('ncq_evq', JSON.stringify(EVQ)); } catch (e) {} };
function track(ev, o) {
  o = o || {}; if (S.stats === false || isStaff()) return;
  EVQ.push({ uid: UID, ev, lvl: S.lvl || null, lesson: o.lesson || null, qid: o.qid || null, n: o.n == null ? null : o.n, extra: o.extra || null });
  if (EVQ.length > 200) EVQ.splice(0, EVQ.length - 200); evSave();
  if (EVQ.length >= 12) flushEv();
}
let evBusy = false;
async function flushEv() {
  if (evBusy || !EVQ.length || !navigator.onLine || !SB_KEY) return; evBusy = true;
  const batch = EVQ.slice(0, 50);
  try {
    const r = await fetch(SB_URL + '/rest/v1/events', { method: 'POST', headers: { apikey: SB_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(batch), keepalive: true });
    if (r.ok || r.status === 400 || r.status === 422) { EVQ.splice(0, batch.length); evSave(); }
  } catch (e) {}
  evBusy = false;
}
function trackOpen() { if (S.opened === dk() || isStaff()) return; S.opened = dk(); save(); track('open', { extra: { pwa: !!isStandalone(), src: S.src || null, inapp: isInApp() } }); }
setInterval(flushEv, 10000);
document.addEventListener('visibilitychange', () => { if (document.hidden) flushEv(); else if (view === 'nook' && N.tab === 'room' && autoNight()) { save(); render(); } });
addEventListener('online', flushEv);
const statsCard = () => `<div class="card" style="margin-top:14px"><b class="disp">📊 অজানা পরিসংখ্যান</b><div style="color:var(--ink2);font-size:14px;margin:6px 0 8px">কোন পাঠ কঠিন সেটা বুঝে অ্যাপ ভালো করতে শুধু ব্যবহারের হিসাব পাঠানো হয়। নাম, ফোন নম্বর বা ছবি কিছুই না।</div><div class="toggle"><button class="chip ${S.stats !== false ? 'on' : ''}" data-act="stats" data-v="1">চালু</button><button class="chip ${S.stats === false ? 'on' : ''}" data-act="stats" data-v="0">বন্ধ</button></div></div>`;

/* ---- হোমস্ক্রিনে ইনস্টল (PWA) ---- */
let DIP = null;
const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
addEventListener('beforeinstallprompt', e => { e.preventDefault(); DIP = e; });
addEventListener('appinstalled', () => { DIP = null; track('installed'); giveInstallReward(); toast('হোমস্ক্রিনে চলে এসেছে 🎉'); if (view === 'me') render(); });
function installCard() {
  const on = isStandalone();
  return `<div class="card" style="margin-top:14px"><b class="disp">📲 হোমস্ক্রিনে রাখো</b><div style="color:var(--ink2);font-size:14px;margin:6px 0 10px">${on ? '✅ তোমার ফোনে অ্যাপ রাখাই আছে। বন্ধুদের কীভাবে রাখতে হয়, এখান থেকে দেখিয়ে দিতে পারো।' : 'এক ট্যাপে খুলবে। একবার খুললে ইন্টারনেট ছাড়াও পাঠ আর ঘর চলে 🌸'}</div><button class="btn peach" data-act="install">কীভাবে রাখব?</button></div>`;
}

/* ============ v1.2: শিক্ষক/ডেভ লগইন, ক্লাস রিপোর্ট, দান কার্ড ============ */
const STAFF_COINS = 99999, BKASH = '01308390333';
const SKEY = 'ncq_staff';
let SESS = (() => { try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { return null; } })();
const isStaff = () => !!(SESS && SESS.rt);
const sessSave = () => { try { SESS ? localStorage.setItem(SKEY, JSON.stringify(SESS)) : localStorage.removeItem(SKEY); } catch (e) {} };
async function authCall(path, body) {
  const r = await fetch(SB_URL + '/auth/v1/' + path, { method: 'POST', headers: { apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let j = {}; try { j = await r.json(); } catch (e) {}
  return { ok: r.ok, j };
}
function takeSession(j) { SESS = { at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000 - 60000, email: (j.user && j.user.email) || (SESS && SESS.email) || '' }; sessSave(); }
async function freshToken() {
  if (!SESS) return null;
  if (SESS.exp > Date.now()) return SESS.at;
  try { const r = await authCall('token?grant_type=refresh_token', { refresh_token: SESS.rt }); if (r.ok && r.j.access_token) { takeSession(r.j); return SESS.at; } } catch (e) {}
  return null;
}
function staffInit() { if (isStaff() && (S.coins || 0) < STAFF_COINS) { S.coins = STAFF_COINS; save(); } }
function staffSheet() {
  sheet(`<div class="center">${mascot(72, 'ask', true)}</div><h3>🔑 শিক্ষক / ডেভেলপার</h3><p>শুধু যাদের অ্যাকাউন্ট আছে। ঢুকলে অনেক কয়েন আর সব পাঠ খোলা থাকবে, সাথে ক্লাস রিপোর্ট দেখা যাবে।</p>
    <input id="stEmail" class="inp" type="email" autocomplete="username" placeholder="ইমেইল" style="margin-bottom:8px">
    <input id="stPw" class="inp" type="password" autocomplete="current-password" placeholder="পাসওয়ার্ড" style="margin-bottom:12px">
    <button class="btn" id="stGo" data-act="stgo">ঢুকি</button><button class="btn ghost" data-act="close">থাক</button>`);
}
async function staffLogin() {
  const em = (($('#stEmail') || {}).value || '').trim(), pw = ($('#stPw') || {}).value || '';
  if (!em || !pw) return toast('ইমেইল আর পাসওয়ার্ড দুটোই লেখো');
  if (!navigator.onLine) return toast('ইন্টারনেট চালু করো');
  const b = $('#stGo'); if (b) { b.disabled = true; b.textContent = 'দেখছি…'; }
  let r; try { r = await authCall('token?grant_type=password', { email: em, password: pw }); } catch (e) { r = { ok: false, j: {} }; }
  if (!r.ok || !r.j.access_token) { if (b) { b.disabled = false; b.textContent = 'ঢুকি'; } return toast('ইমেইল বা পাসওয়ার্ড মেলেনি'); }
  takeSession(r.j); S.coins = Math.max(S.coins || 0, STAFF_COINS); save(); closeSheet(); toast('✅ স্বাগতম! সব পাঠ আর কয়েন খোলা'); render();
}
function staffOut() { SESS = null; sessSave(); RP = { days: 7, st: 'idle', d: null, err: '' }; toast('লগআউট হয়েছে'); go('me'); }
function staffCard() {
  if (!isStaff()) return `<div class="center" style="margin-top:14px"><button class="btn ghost" data-act="stlogin">🔑 শিক্ষক / ডেভ লগইন</button></div>`;
  return `<div class="card staff" style="margin-top:14px"><b class="disp">🔑 ${esc(SESS.email || 'শিক্ষক / ডেভ')}</b><div style="color:var(--ink2);font-size:14px;margin:6px 0 10px">সব পাঠ খোলা, অনেক কয়েন, আর এই ফোনের খেলা অ্যানালিটিক্সে গোনা হয় না।</div>
    <button class="btn" data-act="report">📊 ক্লাস রিপোর্ট দেখি</button><button class="btn peach" data-act="stcoins" style="margin-top:8px">🪙 কয়েন ভরো (${STAFF_COINS.toLocaleString('en-US')})</button><button class="btn ghost" data-act="stout" style="margin-top:4px">লগআউট</button></div>`;
}

/* ---- ক্লাস রিপোর্ট ---- */
let RP = { days: 7, st: 'idle', d: null, err: '' };
async function loadReport() {
  RP.st = 'load'; if (view === 'report') render();
  try {
    const tk = await freshToken();
    if (!tk) { RP.st = 'err'; RP.err = 'লগইনের সময় শেষ হয়েছে। লগআউট করে আবার ঢোকো।'; }
    else {
      const r = await fetch(SB_URL + '/rest/v1/rpc/get_report', { method: 'POST', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_days: RP.days }) });
      if (r.ok) { RP.d = await r.json(); RP.st = 'ok'; }
      else { RP.st = 'err'; RP.err = r.status === 404 ? 'রিপোর্টের SQL এখনো Supabase-এ বসানো হয়নি (supabase_report.sql চালাও)।' : (r.status === 401 || r.status === 403) ? 'অনুমতি মেলেনি। লগআউট করে আবার ঢোকো।' : 'রিপোর্ট আনা গেল না (' + r.status + ')।'; }
    }
  } catch (e) { RP.st = 'err'; RP.err = 'ইন্টারনেটে সমস্যা, আবার চেষ্টা করো।'; }
  if (view === 'report') render();
}
const trunc = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
function reportHTML() {
  const sw = [[1, '24 ঘণ্টা'], [7, '7 দিন'], [30, '30 দিন']];
  let h = `<div class="rphead"><button class="mx" data-act="rpback" aria-label="পেছনে">‹</button><h2 class="sec" style="margin:0">📊 ক্লাস রিপোর্ট</h2></div>
    <div class="toggle" style="margin:10px 0">${sw.map(([d, t]) => `<button class="chip ${RP.days === d ? 'on' : ''}" data-act="rpdays" data-v="${d}">${t}</button>`).join('')}</div>`;
  if (RP.st === 'idle' || RP.st === 'load') return h + `<div class="empty"><div class="big">🍵</div><p>রিপোর্ট আনছি…</p></div>`;
  if (RP.st === 'err') return h + `<div class="empty"><div class="big">🌧️</div><p>${esc(RP.err)}</p></div><button class="btn peach" data-act="rpreload">আবার চেষ্টা করি</button>`;
  const d = RP.d || {}, n = k => +d[k] || 0;
  const st = (v, t, e) => `<div class="stat"><b>${e} ${bn(v)}</b><span>${t}</span></div>`;
  h += `<div class="rpgrid">${st(n('active'), 'জন ঢুকেছে', '👥')}${st(n('new_users'), 'নতুন', '🌱')}${st(n('returning_users'), 'ফিরে এসেছে', '🔁')}${st(n('lessons_done'), 'পাঠ শেষ', '✅')}${st(d.avg_sec ? Math.round(+d.avg_sec / 60 * 10) / 10 : 0, 'মিনিট/পাঠ', '⏱️')}${st(n('challenge_done'), 'চ্যালেঞ্জ শেষ', '🎯')}${st(n('trailer_open'), 'ট্রেইলার দেখল', '🎬')}${st(n('installs'), 'হোমস্ক্রিনে রাখল', '📲')}${st(n('push_asked'), 'বাঁধনের ডাকের প্রশ্ন দেখল', '❓')}${st(n('push_granted'), 'বাঁধনের ডাক চালু করল', '🔔')}${st(n('push_denied'), 'ডাক বন্ধ রাখল', '🔕')}${st(n('push_opens'), 'ডাক থেকে অ্যাপ খুলল', '📬')}</div>
    <p class="rpnote">একজনের দুটো ফোন বা ব্রাউজার থাকলে দুজন গোনা হয়। রোজের হিসাব ফোনের খোলা অ্যাপ থেকে আসে।</p>`;
  if (!n('active') && !n('lessons_done')) return h + `<div class="empty"><div class="big">🌤️</div><p>এই সময়ে এখনো ডেটা জমেনি।<br>ছাত্রছাত্রীরা খেলতে থাকলে এখানে ভরে উঠবে।</p></div>`;
  const bd = d.by_day || [], mx = Math.max(1, ...bd.map(x => +x.n));
  if (bd.length) h += `<h3 class="disp" style="margin:18px 0 6px">📅 রোজ কতজন</h3><div class="card"><div class="dbars">${bd.map(x => `<div class="db"><i style="height:${Math.max(6, Math.round(+x.n / mx * 70))}px"></i><b>${bn(x.n)}</b><small>${String(x.d).slice(8, 10)}</small></div>`).join('')}</div></div>`;
  const lv = d.levels || []; if (lv.length) h += `<h3 class="disp" style="margin:18px 0 6px">🎚️ কোন লেভেলে কতজন</h3><div class="card">${LEVELS.map(l => { const f = lv.find(x => x.lvl === l.k); return `<div class="row"><span>${lvI(l.k)} ${l.name}</span><b>${bn(f ? f.n : 0)}</b></div>`; }).join('')}</div>`;
  const ls = (d.lessons || []).map(x => ({ x, l: lessonById(x.id) })).filter(o => o.l).sort((a, b) => LESSONS.indexOf(a.l) - LESSONS_IDX(b.l));
  if (ls.length) h += `<h3 class="disp" style="margin:18px 0 6px">🛣️ কোন পাঠে কী হচ্ছে</h3><div class="card">${ls.map(({ x, l }) => { const s = +x.starts || 0, dn = +x.done || 0, f = +x.fails || 0, q = +x.quits || 0, pct = s ? Math.min(100, Math.round(dn / s * 100)) : 0, warn = s >= 5 && (f + q) / s >= .4; return `<div class="lrow"><div class="lt"><b>${LV[l.lvl].e} ${esc(l.title)} ${warn ? '⚠️' : ''}</b><small>শুরু ${bn(s)} · শেষ ${bn(dn)} · হার্ট শেষ ${bn(f)} · ছেড়ে গেছে ${bn(q)}</small></div><div class="bar ${warn ? 'w' : ''}"><i style="width:${pct}%"></i></div></div>`; }).join('')}<p class="rpnote" style="margin:8px 0 0">⚠️ মানে শুরু করা 10 জনের মধ্যে 4 জনের বেশি শেষ করতে পারেনি।</p></div>`;
  const ql = (arr, ico) => arr.map(x => { const q = qById(x.qid); return `<div class="item mi"><span>${q ? esc(trunc(qText(q), 78)) : esc(x.qid)}</span><b>${ico} ${bn(x.n)}</b></div>`; }).join('');
  if ((d.wrong || []).length) h += `<h3 class="disp" style="margin:18px 0 6px">😵 সবচেয়ে বেশি ভুল হওয়া প্রশ্ন</h3><div class="paper">${ql(d.wrong, '✖')}</div>`;
  if ((d.flags || []).length) h += `<h3 class="disp" style="margin:18px 0 6px">🚩 “ভুল আছে?” চাপা প্রশ্ন</h3><div class="paper">${ql(d.flags, '🚩')}</div><p class="rpnote">এগুলো আগে দেখে নাও, সম্ভবত প্রশ্নে বা উত্তরে সমস্যা আছে।</p>`;
  return h;
}
const LESSONS_IDX = l => LESSONS.indexOf(l);

/* ---- দান কার্ড (শুধু বিকাশ, জোর নেই) ---- */
const donateCard = () => `<div class="card donate" style="margin-top:14px">
  <span class="dtag">💝 ডোনেশন (ঐচ্ছিক)</span>
  <div class="dtop">${mascot(56, 'happy')}<b class="disp">অ্যাপটাকে সাপোর্ট করো ☕</b></div>
  <div class="dtxt">এই অ্যাপ আমরা সবার জন্য ফ্রি বানিয়েছি। ভালো লাগলে ছোট্ট একটা ডোনেশন আরও নতুন পাঠ আর ফিচার বানানোর উৎসাহ দেয়।</div>
  <div class="dfree">✅ ডোনেশন না দিলেও অ্যাপের সবকিছু ঠিক আগের মতোই পাবে।</div>
  <ol class="dsteps"><li><b>1</b>নিচের নম্বরটা কপি করো</li><li><b>2</b>বিকাশ বা নগদ অ্যাপ খোলো</li><li><b>3</b>ওই নম্বরে টাকা পাঠাও</li></ol>
  <div class="bk"><span>বিকাশ / নগদ</span><b>${BKASH}</b><button class="chip" data-act="copynum">কপি</button></div>
  <div class="dwarn">👨‍👩‍👧 ছাত্রছাত্রীরা অবশ্যই বড়দের অনুমতি নিয়ে পাঠাবে।</div></div>`;
function copyNum() {
  const done = () => { toast('ধন্যবাদ! 💗 নম্বর কপি হয়েছে, আরও নতুন পাঠ আসবে'); track('donate_copy'); };
  const fb = () => { const ta = document.createElement('textarea'); ta.value = BKASH; ta.style.cssText = 'position:fixed;opacity:0;left:-999px'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); ok ? done() : toast('নম্বরটা: ' + BKASH); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(BKASH).then(done, fb); else fb();
}
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.id === 'stPw') staffLogin(); });

fixS();
staffInit();
go('splash');

/* ============ v0.5: sounds, bgm, sticker drag, notes ============ */
const SND = {}; ['pick', 'pick2', 'snap', 'place', 'back', 'remove', 'buy', 'done', 'coin', 'gift', 'pop', 'ui_click', 'key', 'wrong', 'lose', 'purchase', 'badge', 'notify'].forEach(k => { const a = new Audio('assets/snd/' + k + '.mp3'); a.preload = 'auto'; SND[k] = a; });
function snd(k, vol = .8) { if (!S.sound) return; try { const a = SND[k].cloneNode(); a.volume = vol; a.play().catch(() => {}); } catch (e) {} if (navigator.vibrate && k === 'place') try { navigator.vibrate(12); } catch (e) {} }
const BGM = new Audio(); BGM.preload = 'none'; BGM.loop = true; BGM.volume = .28; let bgmSrc = false;   // প্রথম ট্যাপের পরেই নামে
let bgmOn = false; function bgm() {}
document.addEventListener('pointerdown', () => { bgmOn = true; }, { once: true });
setInterval(() => { const want = bgmOn && S.sound && S.music !== false && !document.hidden && !document.querySelector('.trframe'); if (!want && !BGM.paused) BGM.pause(); else if (want && BGM.paused) { if (!bgmSrc) { BGM.src = 'assets/snd/bgm.mp3'; bgmSrc = true; } BGM.play().catch(() => {}); } }, 700);


const VOL = () => S.vol == null ? .35 : S.vol;
const NIGHT = new Audio(); NIGHT.preload = 'none'; NIGHT.loop = true; NIGHT.volume = 0; let nightSrc = false;   // রাতের মোডে গেলে তবেই নামে
setInterval(() => { const t = VOL() * (view === 'lesson' ? .22 : 1), d = t - BGM.volume; BGM.volume = Math.max(0, Math.min(1, Math.abs(d) < .01 ? t : BGM.volume + d * .2));
  const wn = view === 'nook' && N.tab === 'room' && S.night && bgmOn && S.sound && S.music !== false && !document.hidden, nt = wn ? Math.min(1, Math.max(.12, VOL() * .6)) : 0, nd = nt - NIGHT.volume;
  NIGHT.volume = Math.max(0, Math.min(1, Math.abs(nd) < .01 ? nt : NIGHT.volume + nd * .1));
  if (wn && NIGHT.paused) { if (!nightSrc) { NIGHT.src = 'assets/snd/night.mp3'; nightSrc = true; } NIGHT.play().catch(() => {}); } else if (!wn && NIGHT.volume < .02 && !NIGHT.paused) NIGHT.pause(); }, 120);
document.addEventListener('input', e => { if (e.target.id === 'vol') { S.vol = e.target.value / 100; save(); } });

let D = null;
const imgOf = id => NIMG[id];
const curPanel = () => document.querySelector('.rpan[data-i="' + N.ri + '"]');
const toolUIoff = () => { document.body.classList.remove('dragging'); const t = $('#tray'); if (t) t.classList.remove('hold'); };
document.addEventListener('pointerdown', e => {
  if (D) return;
  if (N.sel && !e.target.closest('#qm') && !e.target.closest('.pit')) closeQm();
  const w = e.target.closest('.twr');
  if (w) { D = { from: 'w', el: w, x0: e.clientX, y0: e.clientY, on: false, pid: e.pointerId, touch: e.pointerType !== 'mouse' }; return; }
  const el = e.target.closest('.ti,.pit'); if (!el) return;
  D = { id: el.dataset.id, from: el.classList.contains('ti') ? 't' : 'r', el, x0: e.clientX, y0: e.clientY, on: false, pid: e.pointerId, touch: e.pointerType !== 'mouse' };
});
document.addEventListener('pointermove', e => {
  if (!D || e.pointerId !== D.pid) return;
  if (!D.on) {
    const dx = e.clientX - D.x0, dy = e.clientY - D.y0;
    if (D.from === 'w') { if (Math.hypot(dx, dy) > 5) startTool(); else return; }
    else if (D.from === 't' ? (dy < -10 && Math.abs(dy) > Math.abs(dx)) || (!D.touch && Math.hypot(dx, dy) > 6) : Math.hypot(dx, dy) > 6) { startDrag(e); if (!D) return; } else return;
  }
  e.preventDefault(); D.tool ? moveTool(e) : moveDrag(e);
}, { passive: false });

/* চিমটা নিজেই টেনে নেওয়া যায়; কোনো স্টিকারের ওপর একটু ধরে রাখলে তুলে নেয় */
function startTool() {
  D.on = true; D.tool = true; D.tw = document.createElement('img'); D.tw.className = 'tw'; D.tw.src = 'assets/img/tw_open.webp'; layer.appendChild(D.tw);
  const t = $('#tray'); if (t) t.classList.add('hold'); document.body.classList.add('dragging'); snd('pick2', .5);
}
function moveTool(e) {
  const px = e.clientX, py = e.clientY - (D.touch ? 56 : 8); D.tw.style.left = px + 'px'; D.tw.style.top = py + 'px'; D.last = e;
  const hit = document.elementsFromPoint(px, py).map(n => n.closest && n.closest('.pit,.ti')).find(Boolean) || null;
  if (hit !== D.hov) { if (D.hov) D.hov.classList.remove('hl'); D.hov = hit; clearTimeout(D.ht); if (hit) { hit.classList.add('hl'); D.ht = setTimeout(() => grab(hit), 300); } }
}
function grab(hit) {
  if (!D || !D.tool || D.hov !== hit) return;
  const last = D.last, tw = D.tw; hit.classList.remove('hl');
  D.id = hit.dataset.id; D.from = hit.classList.contains('ti') ? 't' : 'r'; D.el = hit; D.tool = false; D.hov = null; D.on = false; D.touch = D.touch;
  startDrag(last, tw); if (D && D.on) moveDrag(last);
}
function startDrag(e, tw) {
  closeQm(); const it = ITEM[D.id], panel = D.from === 'r' ? D.el.closest('.rpan') : curPanel();
  if (!it || !panel) { if (tw) tw.remove(); toolUIoff(); D = null; return; }
  D.rid = panel.dataset.rid;
  if (!S.owned.includes(D.rid)) { toast('এই ঘরটা আগে কিনতে হবে 🔒'); if (tw) tw.remove(); toolUIoff(); D = null; return; }
  const room = panel.querySelector('.room'), L = roomItems(D.rid);
  D.on = true; D.room = room; D.rr = room.getBoundingClientRect(); D.q = L.find(z => z.id === D.id) || { s: 1, fl: false };
  const w = D.rr.width * it.w * (D.q.s || 1) / 100;
  D.gh = document.createElement('div'); D.gh.className = 'gh'; D.gh.style.width = w + 'px'; D.gh.innerHTML = `<img src="${imgOf(D.id)}" style="transform:scaleX(${D.q.fl && !FLATF[D.id] ? -1 : 1})">`;
  D.tw = tw || document.createElement('img'); D.tw.className = 'tw'; D.tw.src = 'assets/img/tw_shut.webp';
  layer.appendChild(D.gh); layer.appendChild(D.tw);
  D.el.classList.add('lift'); L.filter(z => z.on === D.id).forEach(k => { const n = room.querySelector(`.pit[data-id="${k.id}"]`); if (n) n.classList.add('lift'); });
  room.classList.add('drag'); const tr = $('#tray'); if (tr) tr.classList.add('hold'); document.body.classList.add('dragging'); D.poly = it.k === 'w' ? WALL : it.op ? FLOOR : FLOOR_WIDE;
  room.querySelector('.zpoly').setAttribute('points', poly(D.poly)); try { D.el.setPointerCapture(e.pointerId); } catch (x) {}
  snd(Math.random() < .5 ? 'pick' : 'pick2'); D.ok = false; D.pr = null; D.hp = null; D.pos = null;
}
function moveDrag(e) {
  const it = ITEM[D.id], lift = D.touch ? 64 : 10, g = D.gh, h = g.offsetHeight, anchor = (it.k === 'w' || it.f) ? .5 : .92;
  let px = e.clientX, py = e.clientY - lift;
  D.rx = (px - D.rr.left) / D.rr.width * 100; D.ry = (py - D.rr.top) / D.rr.height * 100;
  const pr = perch(D.rid, D.id, D.rx, D.ry); D.pr = pr;
  if (pr) { px = D.rr.left + pr.x / 100 * D.rr.width; py = D.rr.top + pr.y / 100 * D.rr.height; }
  const ok = !!pr || (!it.op && inPoly(D.rx, D.ry, D.poly)); D.pos = null; let gx = D.rx;
  const isFl = it.k === 'f' && !it.op && !pr;
  if (it.k === 'w' && ok) { const f = wallFit({ id: D.id, x: D.rx, y: D.ry, s: D.q.s || 1 }); D.pos = { x: f.x, y: f.y, s: f.s }; gx = f.x; px = D.rr.left + f.x / 100 * D.rr.width; py = D.rr.top + f.y / 100 * D.rr.height; }
  if (isFl && ok) { const f = floorFit({ id: D.id, x: D.rx, y: D.ry, s: D.q.s || 1 }); D.pos = { x: f.x, y: f.y, s: D.q.s || 1 }; px = D.rr.left + f.x / 100 * D.rr.width; py = D.rr.top + f.y / 100 * D.rr.height; }
  g.style.transform = isFlatW(it) ? wMat(gx) : floorMs(it, D.q.fl);
  g.style.left = (px - g.offsetWidth / 2) + 'px'; g.style.top = (py - h * anchor) + 'px';
  D.tw.style.left = px + 'px'; D.tw.style.top = (py - h * anchor + h * .12) + 'px';
  const hid = pr ? pr.pid : null;
  if (hid !== D.hp) { D.room.querySelectorAll('.pit.hl').forEach(n => n.classList.remove('hl')); if (hid) { const n = D.room.querySelector(`.pit[data-id="${hid}"]`); if (n) n.classList.add('hl'); } D.hp = hid; }
  if (ok !== D.ok) { D.ok = ok; D.room.querySelector('.zone').classList.toggle('ok', ok); if (ok) snd('snap', .5); }
  const t = $('#tray'); D.inTray = !!t && e.clientY > t.getBoundingClientRect().top;
}
function endDrag(cancel) {
  if (!D) return; const d = D; D = null; clearTimeout(d.ht);
  if (d.from === 'w' && !d.on) { if (!cancel) toast('🥢 চিমটা টেনে স্টিকারের ওপর ধরে রাখো'); return; }
  if (d.tool) { if (d.tw) d.tw.remove(); if (d.hov) d.hov.classList.remove('hl'); toolUIoff(); if (!cancel) snd('back', .5); return; }
  if (!d.on) { if (d.from === 'r' && !cancel) itemSheet(d.el.closest('.rpan').dataset.rid, d.id); return; }
  d.gh.remove(); d.tw.remove(); toolUIoff(); d.room.classList.remove('drag'); const z = d.room.querySelector('.zone'); if (z) z.classList.remove('ok'); d.room.querySelectorAll('.pit.hl').forEach(n => n.classList.remove('hl'));
  const L = roomItems(d.rid), pr = d.pr;
  if (!cancel && d.ok) {
    pushUndo(); const wp = !pr && d.pos ? d.pos : null, nx = pr ? pr.x : wp ? wp.x : d.rx, ny = pr ? pr.y : wp ? wp.y : d.ry, q = L.find(z => z.id === d.id);
    if (q) { if (wp) q.s = wp.s; const dx = nx - q.x, dy = ny - q.y; q.x = r1(nx); q.y = r1(ny); if (pr) { q.on = pr.pid; q.si = pr.si; q.sl = pr.sl; } else { delete q.on; delete q.si; delete q.sl; } L.filter(k => k.on === q.id).forEach(k => { k.x = r1(k.x + dx); k.y = r1(k.y + dy); }); }
    else L.push(Object.assign({ id: d.id, x: r1(nx), y: r1(ny), s: wp ? wp.s : 1, fl: false }, pr ? { on: pr.pid, si: pr.si, sl: pr.sl } : {}));
    save(); snd('place'); N.last = d.id; render(); N.last = null;
    if (!S.hint1) { S.hint1 = 1; save(); setTimeout(() => toast('👆 বসানো জিনিসে ট্যাপ করলে ছোট-বড় করা যায়'), 700); }
    if (placedIds().length >= 10 && !S.done10) { S.done10 = 1; save(); setTimeout(() => { snd('done'); petals(); }, 350); }
  } else if (!cancel && d.inTray && d.from === 'r') { const need = 1 + L.filter(k => k.on === d.id).length; if (unplacedList().length + need > trayN() * TRAY_CAP) { snd('back'); render(); trayFullSheet('return'); } else { pushUndo(); removeWithKids(d.rid, d.id); save(); snd('remove'); render(); } }
  else { snd('back'); if (!cancel && ITEM[d.id].op && !d.pr && !d.inTray) toast('🍵 এটা টেবিল বা তাকের ওপর রাখতে হয়'); render(); }
}
document.addEventListener('pointerup', e => { if (D && e.pointerId === D.pid) endDrag(false); });
document.addEventListener('pointercancel', e => { if (D && e.pointerId === D.pid) { if (D.on) endDrag(true); else D = null; } });

/* ---- দুই আঙুলে ছোট-বড় ---- */
let PZ = null;
const tdist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
document.addEventListener('touchstart', e => { if (e.touches.length === 2 && N.sel && N.rid) { const q = roomItems(N.rid).find(z => z.id === N.sel); if (!q) return; PZ = { d: tdist(e.touches), s: q.s || 1, q, rid: N.rid }; if (D && !D.on) D = null; pushUndo(); } }, { passive: false });
document.addEventListener('touchmove', e => { if (PZ && e.touches.length === 2) { if (e.cancelable) e.preventDefault(); const s = Math.min(2.2, Math.max(.5, PZ.s * tdist(e.touches) / PZ.d)); PZ.q.s = +s.toFixed(2); const el = document.querySelector(`.rpan[data-rid="${PZ.rid}"] .pit[data-id="${PZ.q.id}"]`); if (el) el.style.width = ITEM[PZ.q.id].w * PZ.q.s + '%'; } }, { passive: false });
document.addEventListener('touchend', e => { if (PZ && e.touches.length < 2) { const z = PZ; PZ = null; resnap(z.rid); save(); render(); itemSheet(z.rid, z.q.id); } });
/* ---- ব্যাজ ---- */
const BADGES = [
  ['প্রথম পা', 'প্রথম পাঠ শেষ করো', () => Object.values(S.progress).some(v => v > 0)],
  ['তিন তারা', 'কোনো পাঠে 3 তারা পাও', () => Object.values(S.progress).some(v => v >= 3)],
  ['আগুনে 7 দিন', 'টানা 7 দিন পাঠ করো', () => shownStreak() >= 7],
  ['স্টিকার সাজানো', 'ঘরে 10টা জিনিস সাজাও', () => placedIds().length >= 10],
  ['তিন ঘরের মালিক', 'তিনটা ঘরই কিনে খোলো', () => ROOMS.every(r => S.owned.includes(r))],
  ['সারপ্রাইজ', 'পাঠ শেষে সারপ্রাইজ স্টিকার পাও', () => (S.gifts || 0) >= 1],
  ['ছবি শিকারি', 'ঘরের ছবি তোলো', () => !!S.pics],
  ['রাতের পাখি', 'ঘরে রাতের মোড চালাও', () => !!S.nightSeen],
  ['কোয়েস্ট মাস্টার', 'সব কোয়েস্ট শেষ করো', () => QUESTS.every(q => S.qd[q.id])],
  ['কয়েনের ঝুলি', '100 কয়েন জমাও', () => (S.coins || 0) >= 100],
  ['লেভেল শেষ', 'নিজের লেভেলের সব পাঠ শেষ করো', () => { const l = lvlLessons(); return l.length > 0 && l.every(x => S.progress[x.id]); }],
  ['চ্যাম্পিয়ন', 'সব ' + LESSONS.length + 'টা পাঠ শেষ করো', () => LESSONS.every(x => S.progress[x.id])]];
setInterval(() => { if (!S.bd || ['splash', 'welcome', 'tut'].includes(view)) return; const first = !S.bdInit; let nb = null;
  BADGES.forEach((b, i) => { if (!S.bd[i] && b[2]()) { S.bd[i] = 1; if (!first) nb = b[0]; } });
  if (first) { S.bdInit = 1; save(); } else if (nb) { save(); snd('badge', .85); toast('🏅 নতুন ব্যাজ: ' + nb); } }, 2000);
/* ---- পুরো অ্যাপের রাতের রঙ + ফলাফলের অ্যানিমেশন ---- */
function appNightCls() { document.documentElement.classList.remove('nightapp'); }
setInterval(appNightCls, 60000);
function fxHook() { appNightCls(); if (view === 'result' && LS && LS.res && !LS.res.anim) { LS.res.anim = 1; requestAnimationFrame(resultFx); } }
function resultFx() {
  const jar = $('#jar'), src = $('.rstats .stat.cs'), r = LS.res; if (!jar || !src) return;
  const fill = jar.querySelector('.jfill i'), g = nextGoal(); setTimeout(() => { if (fill) fill.style.height = g.pct + '%'; }, 900);
  const a = src.getBoundingClientRect(), b = jar.getBoundingClientRect(), n = Math.min(10, Math.max(4, Math.round(r.coins / 2)));
  for (let i = 0; i < n; i++) setTimeout(() => { const c = document.createElement('img'); c.src = 'assets/img/hud_coin.webp'; c.className = 'cfly'; const l = a.left + a.width / 2 - 12 + (Math.random() * 30 - 15), t = a.top + a.height / 2 - 12; c.style.left = l + 'px'; c.style.top = t + 'px'; document.body.appendChild(c);
    requestAnimationFrame(() => { c.style.transform = `translate(${b.left + b.width / 2 - 12 - l}px,${b.top + b.height * .35 - t}px) scale(.7)`; c.style.opacity = '.9'; }); setTimeout(() => { c.remove(); if (i % 3 === 0) snd('coin', .5); }, 750); }, 250 + i * 110);
  if (r.gift) setTimeout(() => { const box = $('#gbox'), rv = $('#greveal'); if (box) { box.src = 'assets/img/hud_gift1.webp'; box.classList.remove('shake'); box.classList.add('popb'); } snd('gift'); if (rv) rv.classList.add('on'); }, 1700);
}
/* ---- রোজকার উপহার ---- */
const todayK = () => new Date().toLocaleDateString('en-CA');



/* ============ v1.3: স্বাগতম, ইনস্টল আর বাঁধন ভাইয়াের ডায়লগ ============ */
const UA = navigator.userAgent || '';
const isInApp = () => /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram|; wv\)/i.test(UA);
const appLink = () => { let u = location.origin + location.pathname.replace(/index\.html$/, ''); if (S.src) u += '?src=' + encodeURIComponent(S.src); return u; };
const doneCount = () => Object.values(S.progress || {}).filter(v => v > 0).length;
const instReady = () => !isStandalone() && (isInApp() || DIP || isIOS());
function inAppCard() {
  if (!isInApp() || isStandalone()) return '';
  if (S.iaDay !== dk()) { S.iaDay = dk(); save(); track('inapp_seen'); }
  const how = isIOS() ? 'নিচের ডানে <b>⋯</b> চাপো → <b>Open in Safari</b>' : 'ওপরের ডানে <b>⋮</b> চাপো → <b>Open in browser / Chrome</b>';
  return `<div class="ia"><b>🌐 ব্রাউজারে খুলে নাও, অ্যাপের মতো চলবে</b><div>এখন তুমি Facebook/Messenger-এর ভেতরের ছোট ব্রাউজারে আছ। ${how}। তারপর হোমস্ক্রিনে রাখা যাবে।</div><button data-act="copylink">🔗 লিংক কপি করো</button></div>`;
}
function installPill() {
  if (isStandalone() || isInApp() || !doneCount() || !(DIP || isIOS()) || (S.instHide && Date.now() - S.instHide < 3 * 864e5)) return '';
  return `<div class="ipill"><button class="go" data-act="installbig">📲 অ্যাপের মতো রাখো</button><button class="x" data-act="insthide" aria-label="পরে">✕</button></div>`;
}
const iosShot = () => `<div class="shot">
<svg viewBox="0 0 100 120" aria-hidden="true"><rect x="2" y="2" width="96" height="116" rx="14" fill="#fff" stroke="#E2C6A6" stroke-width="3"/><rect x="12" y="92" width="76" height="18" rx="9" fill="#EEF2F8"/><g transform="translate(44,94)" fill="none" stroke="#2f7ae5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8v-7M2.5 4.5L6 1l3.5 3.5"/><path d="M1 7v8h10V7"/></g><circle cx="50" cy="100" r="13" fill="none" stroke="#FF9F80" stroke-width="3" stroke-dasharray="3 4"/><text x="50" y="30" text-anchor="middle" font-size="22">1</text><text x="50" y="58" text-anchor="middle" font-size="9" fill="#8A6E5C">Share</text></svg>
<svg viewBox="0 0 100 120" aria-hidden="true"><rect x="2" y="2" width="96" height="116" rx="14" fill="#fff" stroke="#E2C6A6" stroke-width="3"/><rect x="10" y="40" width="80" height="22" rx="8" fill="#FFE9DE" stroke="#FF9F80" stroke-width="2.5"/><rect x="15" y="44" width="14" height="14" rx="4" fill="none" stroke="#4B3326" stroke-width="2"/><path d="M22 47v8M18 51h8" stroke="#4B3326" stroke-width="2" stroke-linecap="round"/><text x="35" y="55" font-size="8.5" fill="#4B3326" font-weight="700">Add to Home Screen</text><text x="50" y="26" text-anchor="middle" font-size="22">2</text></svg>
<svg viewBox="0 0 100 120" aria-hidden="true"><rect x="2" y="2" width="96" height="116" rx="14" fill="#fff" stroke="#E2C6A6" stroke-width="3"/><rect x="30" y="40" width="40" height="40" rx="10" fill="#FFC9D6" stroke="#E58BA3" stroke-width="3"/><text x="50" y="68" text-anchor="middle" font-size="22">🍵</text><text x="50" y="26" text-anchor="middle" font-size="22">3</text><text x="50" y="98" text-anchor="middle" font-size="9" fill="#8A6E5C">Add চাপো</text></svg></div>`;
function installSheet(auto) {
  if (auto && isStandalone()) return;
  if (auto) { S.instAsk = Date.now(); save(); }
  let body, btn;
  if (isInApp()) {
    const how = isIOS() ? 'নিচের ডানে <b>⋯</b> → <b>Open in Safari</b>' : 'ওপরের ডানে <b>⋮</b> → <b>Open in browser / Chrome</b>';
    body = `<p style="font-size:16px">আগে ব্রাউজারে খুলতে হবে, এই ছোট ব্রাউজারে ইনস্টল হয় না।<br>${how}</p>`; btn = '<button class="btn" data-act="copylink">🔗 লিংক কপি করো</button>';
  } else if (DIP) {
    body = '<p style="font-size:16px">এক ট্যাপে হোমস্ক্রিনে চলে আসবে, অ্যাপের মতো ফুল-স্ক্রিনে খুলবে। একবার খুললে ইন্টারনেট ছাড়াও পাঠ আর ঘর চলে। ইনস্টল করলে <b>10 কয়েন</b> উপহার 🎁</p>'; btn = '<button class="btn peach" data-act="doinst">📲 অ্যাপের মতো রাখো</button>';
    track('install_prompt_shown', { extra: { auto: !!auto } });
  } else if (isIOS()) {
    body = '<p style="font-size:16px;margin-bottom:0">Safari-তে খুলে এই তিন ধাপ:</p>' + iosShot() + '<p style="font-size:14px;color:var(--ink2)">Share (⬆️) → Add to Home Screen → Add</p>'; btn = '';
    track('install_prompt_shown', { extra: { auto: !!auto, ios: 1 } });
  } else {
    body = '<div class="gst"><b>1️⃣</b><div>Chrome-এ অ্যাপটা খোলো।</div></div><div class="gst"><b>2️⃣</b><div>ওপরের ডানে <b>⋮</b> চাপো।</div></div><div class="gst"><b>3️⃣</b><div><b>Install app</b> বা <b>Add to Home screen</b> বেছে নাও।</div></div>'; btn = '';
  }
  sheet(`<div class="center">${mascot(88, 'cheer', true)}</div><h3>📲 অ্যাপের মতো রাখো</h3>${isStandalone() ? '<p style="font-size:15px;color:var(--ink2)">✅ তোমার ফোনে অ্যাপ আছেই! বন্ধুদের যা দেখাতে হবে:</p>' : ''}${body}${btn}<button class="btn ghost" data-act="close">পরে</button>`);
}
async function doInst() {
  if (!DIP) return installSheet();
  const p = DIP; DIP = null; p.prompt(); const r = await p.userChoice.catch(() => ({}));
  if (r && r.outcome === 'accepted') { track('install_prompt_accepted'); closeSheet(); } else track('install_prompt_dismissed');
  if (view === 'home') render();
}
function giveInstallReward() { if (S.instRw) return; S.instRw = 1; S.coins = (S.coins || 0) + 10; save(); snd('coin'); toast('🎁 ইনস্টলের উপহার: 10 কয়েন'); }
function copyLink() { const u = appLink(), ok = () => toast('লিংক কপি হয়েছে ✅ এবার ব্রাউজারে পেস্ট করো'); (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(u) : Promise.reject()).then(ok).catch(() => { prompt('লিংকটা কপি করো:', u); }); track('link_copy'); }
function shareApp() { track('app_share'); const d = { title: "Badhon's Cozy Quest", text: 'এক কাপ চা আর একটু একটু ইংরেজি 🍵 ঘর সাজাতে সাজাতে ইংরেজি শেখার গেম!', url: appLink().replace(/\?src=[^&]*/, '') + '?src=share' }; if (navigator.share) navigator.share(d).catch(() => {}); else copyLink(); }

/* ---- "নতুন কী?" ---- */
const NEWS = [['v2.0.3 · নতুন ধাঁচে পড়া 📚', ['শুনে উত্তর, চ্যাট শেষ করা, ভুল ধরা আর অনুচ্ছেদে শব্দ বসানো, চারটা নতুন ধরনের প্রশ্ন', 'প্রতি মোডের প্রথম তিন পাঠ নতুন করে সাজানো, সাথে ছোট অনুচ্ছেদ পড়ে উত্তর, আর শুরুতে ছোট “আগে একটু শিখি” কার্ড', 'পড়ার অগ্রগতি আর ভুলের খাতা নতুন করে শুরু হয়েছে। কয়েন, ঘর, ব্যাজ আর র‍্যাংক যেমন ছিল তেমনই আছে 🌸']], ['v1.9.0 · ঘরের র‍্যাংক 🥇', ['ঘরে জিনিস বসালে পয়েন্ট, আর পয়েন্টে Bronze থেকে Legend পর্যন্ত র‍্যাংক', 'র‍্যাংক-আপে কনফেটি আর বাঁধনের অভিনন্দন', 'ঘরের ছবিতে র‍্যাংকের ফ্রেম আর ব্যাজ']], ['v1.8.0 · সহজ শুরু ✨', ['ঘরের ছবি এখন সরাসরি ডাউনলোড করা যায়, তারপর শেয়ার', 'লেভেল বাছাইয়ে Medium-এ “Recommended”, Beginner ছোটদের জন্য', 'শুরুতে ব্যাজ লুকানোর ধাপ আর নেই, সরাসরি খেলা শুরু', 'বাঁধন ভাইয়াের ছোট্ট উপদেশ আসে আর নিজে নিজেই চলে যায়', 'Profile-এ যোগাযোগের ইমেইল']], ['v1.7.1 · ঘরের ছবি পরিষ্কার', ['ঘরের ছবিতে আসবাব আর ঘরের নিচের বাড়তি ছায়া সরানো হয়েছে, এখন ছবি অ্যাপের মতোই দেখায়']], ['v1.7.0 · বাঁধনের ডাক 🔔', ['এখন বাঁধন ঠিক সময়ে নোটিফিকেশনে ডাকতে পারবে (চাইলে চালু করবে, দিনে সর্বোচ্চ 3টা, রাত 12–সকাল 10টা কিছু আসবে না)', '“আমি” ট্যাবে বাঁধনের ডাক চালু করার কার্ড আছে']], ['v1.6.2 · নতুন আইকন আর পুরো নাম', ['অ্যাপের আইকনে এখন বাঁধন ভাইয়াের মুখ 🌸', 'হোমস্ক্রিনে অ্যাপের নাম আবার পুরো: Badhon’s Cozy Quest']], ['v1.6.1 · বস ট্রফি 🏆', ['প্রতি মোডের প্রথম বস কুইজ জিতলে সারপ্রাইজ গিফট হিসেবে নিজস্ব ট্রফি মেলে: Beginner-এ চারাগাছ, Medium-এ লতাপাতা, Higher-এ সাকুরা, Pro-তে সোনালি কাপ', 'ট্রফি ট্রেতে এসে যায়, কোজি রুমে টেবিল বা তাকের ওপর সাজিয়ে রাখা যায় ✨', 'বস কুইজের পাশে ট্রফির ইশারা থাকে; “আমি” ট্যাবে নিজের ট্রফিগুলো দেখো']], ['v1.6.0 · বস কুইজ আর কুইজ কার্ড', ['🏆 প্রতিটা ইউনিটের শেষে বস কুইজ: 10টা প্রশ্ন, প্রথমবার জিতলে বোনাস কয়েন, ইউনিটের সব পাঠ শেষ হলে খোলে', '📤 পাঠের প্রশ্নে "কুইজ কার্ড বানাও": প্রশ্নটা সুন্দর ছবির কার্ড হয়ে যায়, বন্ধুদের বা গ্রুপে শেয়ার করো, কমেন্টে উত্তর জানতে চাও']], ['v1.5.1 · পাঠের তালা ঠিক', ['এখন আগের পাঠ শেষ না করলে পরের পাঠ বন্ধ থাকবে 🔒 শেষ করলেই খুলে যাবে', 'যে পাঠ আগে শেষ করা হয়েছে সেটা সবসময় খোলা থাকবে']], ['v1.5.0 · ভয়েস আর নতুন ধরনের পাঠ', ['🔊 শুনে উত্তর দাও: ইংরেজি শুনে সঠিকটা বেছে নাও (ফোনের নিজস্ব ইংরেজি ভয়েসে)', '✅❌ ঠিক নাকি ভুল: বাক্য ঠিক না ভুল, এক ট্যাপে বলো', 'শব্দের পাঠে এখন 🔊 বাটন আছে, ছবি ট্যাপ করে উচ্চারণ শোনো', 'আরও 6টা নতুন পাঠ আর 4টা নতুন ইউনিট, চার মোডেই 🎉']], ['v1.4.0 · নতুন পাঠ চারটা মোডেই', ['Beginner, Medium, Higher আর Pro: প্রতিটায় একটা করে নতুন পাঠ, মজার টিপসসহ 🎉', 'নতুন ইউনিট: স্কুলব্যাগের ভেতরে, দোকানে দরদাম, বাক্য বদলের খেলা, বাংলিশ ফাঁদ', 'বাঁধন এখন মনে করিয়ে দেবেন: পাঠ করে কয়েন জমাও, তারপর কোজি রুম সাজাও 🏡']], ['v1.3.9 · ছোট ঠিকঠাক', ['ঘরের নিচের আর জিনিসের নিচের ছায়া সরানো হয়েছে, এখন আরও কোজি লাগবে 🌸', 'ট্রের ডান-বাম অ্যারো বাটন বড় হয়েছে আর ঠিকঠাক কাজ করে']], ['v1.3.8 · নতুন আইকন, পাশাপাশি ট্রে, মেঝেতে ঠিকঠাক বসা', ['ট্রে এখন আলাদা আলাদা: প্রতি ট্রেতে 6টা জিনিস ফাঁকা ফাঁকা করে সাজানো, আর কোনো জিনিস কাটা পড়ে না 🧺', 'ট্রে ভরে গেলে পরের ট্রেতে জিনিস যায়। ডানে-বাঁয়ে স্লাইড করে ট্রে বদলাও; বাকি ট্রেগুলো ঘরের মতোই তালা দেওয়া', 'শপের একদম প্রথমে ট্রে: কয়েন দিয়ে নতুন ট্রে কেনো। ট্রে ফুল থাকলে নতুন জিনিস কেনা যায় না, তাই আগে ট্রে কিনতে হয়', 'মেঝের জিনিস এখন মেঝের ভেতরেই থাকে, দেয়াল ঘেঁষে লেগে যায়, গালিচা-চাটাই মেঝের ঢালে শুয়ে থাকে, নিচে নরম ছায়াও পড়ে', 'ইমোজির জায়গায় নতুন কিউট ছবির আইকন: বাটন, ট্যাব, লেভেল, হার্ট, তালা আর আরও অনেক জায়গায়']], ['v1.3.7 · ট্রেতে সব জিনিস', ['ট্রেতে এখন সব স্টিকার একসাথে দেখা যায়, পাশে স্ক্রল করতে হয় না, সোফাও আর লুকিয়ে থাকে না 🛋️', 'ট্রে একটু বড় হয়েছে আর জিনিসগুলো একটু ছোট হয়ে সারি করে বসেছে', 'দিন-রাত বাটনের ডান পাশটা আর কাটা পড়ে না ☀️🌙', 'নিচের মেনুর নাম এখন ইংরেজিতে: Learn, Cozy Room, Practice, Profile; ঘরের ট্যাবে My Room আর Cozy Shop']], ['v1.3.6 · ঘর আর ট্রে এক স্ক্রিনে', ['কোজি রুমে এখন পুরো ঘর আর ট্রে একসাথে এক স্ক্রিনে দেখা যায়, জিনিস তুলে বসাতে আর স্ক্রল করতে হয় না 🏡', 'টুলের বাটনগুলো (আনডু, ছবি, কোয়েস্ট, গান, কীভাবে, নোট) ঘরের পাশে লম্বা সারিতে এসেছে', 'এক ট্যাব থেকে আরেক ট্যাবে গেলে পেজ এখন সবসময় একদম ওপর থেকে শুরু হয়, আগের স্ক্রল-করা জায়গায় থেকে যায় না']], ['v1.3.5 · রাতের ঘর আর শেয়ার-কার্ড', ['রাতে ঘরের দেয়াল-মেঝে গোধূলির রঙে গাঢ় হয়, তাই আলোগুলো আরও ফুটে ওঠে 🌙', 'ঘরের ছবি নতুন রূপে: দিনে পতাকার মালা, রাতে জ্বলা আলো আর জোনাকি ✨', 'ছবির কার্ডে তোমার নাম, সাজানো জিনিস, স্ট্রিক আর বাঁধন ভাইয়াের আমন্ত্রণ', 'ছবির সাথে ক্যাপশন কপি করার বাটন: গ্রুপে পোস্ট করা এখন আরও সহজ']], ['v1.3.4 · খোলা আর উজ্জ্বল ঘর', ['ঘরের চারপাশের বর্ডার আর বদ্ধ কার্ড নেই, ঘর এখন খোলা আকাশের নিচে', 'দিন-রাত বাটনের চৌকো দাগ চলে গেছে', 'রাতের ঘর আরও উজ্জ্বল আর উষ্ণ: ল্যাম্প আর লণ্ঠনের আলো বড় হয়ে দেয়ালে-মেঝেতে ছড়ায়, জোনাকি ভাসে ✨', 'দিন-রাত এখন ফোনের ঘড়ি ধরে নিজে বদলায় (সন্ধ্যা 6টা–ভোর 6টা রাত); নিজে বদলালেও চলবে']], ['v1.3.3 · রাতের ঘর', ['রাত করলে "আমার ঘর" ট্যাবের পুরো পেজটাই তারাভরা রাত হয়, ভাসমান কার্ড নেই', 'ঘর যেন ভেতর থেকে আলোয় জ্বলছে: ল্যাম্প আর লণ্ঠনের নরম আলো', 'ফেয়ারি লাইটের বাল্ব আলাদা করে জ্বলে, পর্দা আর ফ্যাকাশে হয় না', 'বাকি ট্যাব সবসময়ের মতো লাইট']], ['v1.3.2 · নিজে আপডেট', ['নতুন ভার্সন এলে অ্যাপ নিজে থেকেই আপডেট হয়ে যায়, পুরোনো ভার্সনে আটকে থাকবে না']], ['v1.3.1 · আরও আরামের', ['রাতের ঘরের ব্যাকগ্রাউন্ড এখন গোধূলির নরম আকাশ, বদ্ধ ভাব নেই 🌙', '"আমি" ট্যাবে হোমস্ক্রিনে রাখার গাইড সবসময় থাকে', 'ধীর ইন্টারনেটেও অ্যাপ দ্রুত খোলে', 'জানালার পর্দায় আলোর ঝলক কম']], ['v1.3 · স্বাগতম আর ইনস্টল', ['বাঁধন ভাইয়াের ডায়লগ: প্রতিটা পর্দায় ছোট প্রশ্ন, উত্তর দিলেই কয়েন 🪙', 'অ্যাপ সবসময় লাইট মোডে, ফোনের ডার্ক মোডে আর অন্ধকার হবে না ☀️', 'দিন-রাত এখন শুধু ঘরের ভেতরে, রাতে লাইট আর ফানুস জ্বলে ওঠে 🌙', 'ঘর আরও বড়, পরিষ্কার; দেয়ালের জিনিস ঠিকঠাক বসে', 'ফেয়ারি লাইট আর পতাকার মালা পুরো দেয়াল জুড়ে ঝোলে, ঝুলন্ত জিনিস ছাদ থেকে ঝোলে', 'হোমস্ক্রিনে ইনস্টলের বড় বাটন (ইনস্টল করলে 10 কয়েন)', 'Facebook/Messenger-এর ভেতরে খুললে ব্রাউজারে খোলার সঠিক নির্দেশ', 'ঘরের ছবি এখন অ্যাপের লিংকসহ শেয়ার করা যায় 📷', 'কুইজের শব্দ-বাটন আবার ছোট আর সুন্দর']], ['v1.2 · ক্লাস রিপোর্ট', ['শিক্ষকের জন্য ক্লাস রিপোর্ট', 'ভুল প্রশ্নে 🚩 জানানোর বাটন', 'ব্যাকআপ কোড, ট্রেইলার, আজকের চ্যালেঞ্জ']]];
function newsSheet() {
  S.seenVer = VERSION; save(); track('whatsnew_open');
  sheet(`<div class="center">${mascot(80, 'cheer', true)}</div><h3>✨ নতুন কী? · v${VERSION}</h3><div class="wn">${NEWS.map(([t, l]) => `<h4>${t}</h4><ul>${l.map(x => `<li>${x}</li>`).join('')}</ul>`).join('')}</div><button class="btn" data-act="close">দারুণ! 🌸</button>`);
}

/* ---- বাঁধন ভাইয়াের ডায়লগ ---- */
const DL = () => (S.dlg = (S.dlg && typeof S.dlg === 'object' && S.dlg.seen) ? S.dlg : { last: 0, day: '', n: 0, seen: {} });
const dAway = () => { if (!S.lastDay) return 0; const a = new Date(S.lastDay + 'T00:00:00'), b = new Date(dk() + 'T00:00:00'); return Math.round((b - a) / 864e5); };
const dToday = () => (S.tc && S.tc.d === dk()) ? S.tc.n : 0;
const dStart = () => { go('home'); setTimeout(() => { const n = document.querySelector('.node.cur'); if (n) { n.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => n.click(), 450); } }, 250); };
const fire = (a, d) => { const b = document.createElement('button'); b.dataset.act = a; if (d) Object.entries(d).forEach(([k, v]) => b.dataset[k] = v); b.style.display = 'none'; document.body.appendChild(b); b.click(); b.remove(); };
const GO = {
  start: dStart, trailer: () => trailerSheet(), install: () => installSheet(), level: () => levelSheet(), share: shareApp, whatsnew: newsSheet,
  market: () => { if (view !== 'nook') { N.tab = 'shop'; go('nook'); } else fire('tomarket'); }, help: () => fire('help'), pic: () => fire('pic'), quests: () => fire('quests'),
  night: () => { const b = document.querySelector('.rpan.cur .dn'); if (b) b.click(); }, practice: () => fire('practice'), challenge: () => fire('challenge'),
  notes: () => fire('notes'), backup: () => { S.bkSeen = 1; save(); fire('bkshow'); }, room: () => { N.tab = 'room'; go('nook'); }, traymarket: () => { N.scat = 'tray'; if (view !== 'nook') { N.tab = 'shop'; go('nook'); } else fire('trayshop'); }
};
/* ===== v1.7.0 · বাঁধনের ডাক (পুশ নোটিফিকেশন) ===== */
const PUSH_API = '', OS_APP_ID = '';
function pushSupported() { return false; }
function pushCan() { return false; }
const pushPerm = () => 'default';
let osP = null;
function loadOS() { return Promise.reject(new Error('Push disabled in offline mode')); }
let psT = 0;
function pushSync(force) {}
async function pushAsk() {
  if (!pushCan()) return;
  try {
    const OS = await loadOS(); await OS.Notifications.requestPermission(); const p = pushPerm();
    S.np = p; track('push_perm', { extra: { r: p } });
    if (p === 'granted') {
      try { await OS.login(UID); } catch (e) {}
      if (!S.npCoin) { S.npCoin = 1; S.coins = (S.coins || 0) + 10; snd('coin'); toast('🔔 বাঁধনের ডাক চালু! +10 🪙'); }
      save(); pushSync(true);
    } else save();
  } catch (e) { track('push_perm', { extra: { r: 'error' } }); }
  if (view === 'me') render();
}
window.pushAsk = pushAsk;
function pushCard() {
  if (!pushSupported() || isInApp()) return '';
  const p = pushPerm(), box = (t, b) => `<div class="card" style="margin-top:14px"><b class="disp">🔔 বাঁধনের ডাক</b><div style="color:var(--ink2);font-size:14px;margin:6px 0 ${b ? 8 : 0}px">${t}</div>${b}</div>`;
  if (isIOS() && !isStandalone()) return box('আগে অ্যাপটা হোমস্ক্রিনে রাখো, তারপর এখানে নোটিফিকেশন চালু করা যাবে।', '');
  if (p === 'granted') return box('✅ চালু আছে। বাঁধন দিনে সর্বোচ্চ 3টা ডাক দেবে। বন্ধ করতে চাইলে ফোনের সেটিংসে নোটিফিকেশন বন্ধ করো।', '');
  if (p === 'denied') return box('এখন বন্ধ আছে। ফোনের সেটিংসে এই অ্যাপের নোটিফিকেশন অনুমতি দিলে আবার চালু হবে।', '');
  return box('বাঁধন ঠিক সময়ে মনে করিয়ে দেবে, যাতে স্ট্রিক না ভাঙে। চালু করলে 10 🪙 উপহার!', '<button class="btn" onclick="pushAsk()">🔔 বাঁধনের ডাক চালু করো</button>');
}
GO.pushask = () => pushAsk();
(() => {
  const _ts = touchStreak; touchStreak = function () { _ts(); setTimeout(() => pushSync(true), 1500); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pushSync(); });
  try { const q = new URLSearchParams(location.search); if (q.get('via') === 'push') { track('push_open', { extra: { t: q.get('t'), s: q.get('s'), v: q.get('v'), l: q.get('l'), st: q.get('st') } }); history.replaceState(null, '', location.pathname); } } catch (e) {}
  setTimeout(() => { if (pushCan() && pushPerm() === 'granted') { loadOS().then(OS => OS.login(UID)).catch(() => {}); pushSync(true); } }, 3000);
})();
const mkD = (id, scr, pri, when, mood, say, opts, cd) => ({ id, scr, pri, when, mood, say, opts, cd: cd || 1 });
const mkO = (t, r, say, mood, go, gl) => ({ t, r, say, mood, go, gl });
const DLGS = [
  mkD('q_notif', ['home', 'me'], 89, () => !!S.name && doneCount() >= 1 && pushCan() && pushPerm() === 'default', 'ask', () => `${S.name}, তোমাকে ঠিক সময়ে ডাকব? 🔔 স্ট্রিক যেন না ভাঙে, তাই বাঁধন দিনে সর্বোচ্চ 3টা ছোট্ট ডাক দেবে। রাত 12টা থেকে সকাল 10টা কিছু আসবে না!`, [mkO('হ্যাঁ, ডেকো ভাইয়া 🔔', 0, 'ঠিক আছে! এবার ফোন জিজ্ঞেস করবে, “Allow” চাপো 🌸 চালু হলে 10 🪙 উপহার!', 'cheer', 'pushask', 'অনুমতি দিই'), mkO('এখন না', 0, 'ঠিক আছে, ইচ্ছে হলে “আমি” ট্যাবে চালু করতে পারবে 🌸', 'happy')], 7),
  mkD('gift', ['home'], 90, () => S.gDay !== dk(), 'cheer', () => `ফিরে এসেছ বলে খুব খুশি হলাম, ${S.name}! আজকের ছোট্ট উপহারটা নাও 🎁`, [mkO('নিলাম ভাইয়া 🌸', 3 + Math.min(S.streak || 0, 7), 'রোজ পাঠ করলে উপহার আরও বাড়ে, মনে রেখো!', 'happy')]),
  mkD('whatsnew', ['home'], 88, () => S.seenVer && S.seenVer !== VERSION, 'cheer', () => 'অ্যাপে নতুন কিছু এসেছে! দেখে নেবে নাকি? ✨', [mkO('দেখি কী নতুন ✨', 5, 'দেখো দেখো!', 'cheer', 'whatsnew', 'দেখাও'), mkO('পরে দেখব', 2, 'আচ্ছা, "আমি" ট্যাবে যেকোনো সময় পাবে।', 'happy')]),
  mkD('back3', ['home'], 100, () => dAway() >= 3 && !!S.name, 'sad', () => `${S.name}, ${dAway()} দিন পর! ইশ, তোমাকে কত মিস করছিলাম 🥺`, [mkO('আর দেরি না, শুরু! 💪', 10, 'এই তো আমার সোনা ছাত্রী! একটা ছোট পাঠ দিয়েই ফিরে এসো।', 'cheer', 'start', 'চলো শুরু করি'), mkO('একটু ব্যস্ত ছিলাম 😅', 8, 'কোনো ব্যাপার না! আজ শুধু একটা পাঠ, তাহলেই স্ট্রিক আবার চালু।', 'happy', 'start', 'চলো একটা পাঠ')]),
  mkD('lost', ['home'], 95, () => dAway() === 2 && (S.streak || 0) > 0, 'sad', () => 'কাল তো তোমাকে দেখলাম না! স্ট্রিকটা ভেঙে গেল 🥺 কী হয়েছিল?', [mkO('ব্যস্ত ছিলাম', 5, 'বুঝেছি! আজ নতুন করে শুরু করলেই হবে।', 'happy', 'start', 'শুরু করি'), mkO('ভুলে গিয়েছিলাম', 5, 'আহা! আজ একটা পাঠ করে নিলে স্ট্রিক আবার শুরু হবে ☕', 'happy', 'start', 'শুরু করি'), mkO('শরীর ভালো ছিল না', 6, 'শরীরটা আগে! এখন ভালো থাকলে ছোট্ট একটা পাঠ করো 🌸', 'think', 'start', 'ঠিক আছে')]),
  mkD('q_classes', ['home'], 50, () => !!S.name, 'ask', () => `আজ এখন পর্যন্ত কয়টা পাঠ করলে, ${S.name}?`, [mkO('একটাও না 😅', 2, 'ঠিক আছে! আগে চা-নাস্তা খেয়ে নাও, তারপর ছোট্ট একটা পাঠ দিয়ে শুরু করো। আমি অপেক্ষা করছি ☕', 'happy', 'start', 'চলো শুরু করি'), mkO('1টা', 3, 'ভালো শুরু! আরেকটা করলেই আজকের লক্ষ্য ছুঁয়ে ফেলবে।', 'happy'), mkO('2–3টা', 4, 'বাহ! তুমি তো দারুণ এগোচ্ছ! 🌟', 'cheer'), mkO('4টা বা তার বেশি 🔥', 6, 'ওরেব্বাস! তুমি তো ইংলিশের ঝড়! 🥳', 'cheer')]),
  mkD('q_eat', ['home'], 40, () => { const h = new Date().getHours(); return h >= 7 && h < 22; }, 'ask', () => 'খাওয়া-দাওয়া হয়েছে? 🍚 খালি পেটে পড়া জমে না কিন্তু!', [mkO('হ্যাঁ, খেয়েছি 😋', 2, 'তাহলে তো মাথা ফুরফুরে! একটা পাঠ হয়ে যাক?', 'happy', 'start', 'চলো'), mkO('এখনো না', 2, 'আগে খেয়ে নাও, তারপর একটা পাঠ করে ফেলো। আমি চা নিয়ে বসে আছি ☕', 'happy')]),mkD('q_install', ['home', 'me'], 70, () => doneCount() >= 1 && instReady() && !isInApp(), 'ask', () => 'অ্যাপটা হোমস্ক্রিনে রেখেছ? 📲 তাহলে এক ট্যাপেই খুলবে!', [mkO('রাখব ভাইয়া', 5, 'বাহ! তাহলে এক ট্যাপেই চলে আসবে।', 'cheer', 'install', 'রাখি'), mkO('পরে', 2, 'ঠিক আছে, "আমি" ট্যাবেও বাটন আছে।', 'happy')], 3),
  mkD('q_goal_done', ['home'], 55, () => todayXp() >= 20, 'cheer', () => 'আজকের লক্ষ্য পূরণ! 🎉 তুমি কি জানো, তুমি দারুণ করছ?', [mkO('হিহি, ধন্যবাদ ভাইয়া! 🥳', 4, 'কাল আবার দেখা হবে, ভুলো না!', 'cheer')]),
  mkD('q_goal', ['home'], 53, () => todayXp() > 0 && todayXp() < 20, 'think', () => `আজকের লক্ষ্যের আর ${20 - todayXp()} XP বাকি! একটা পাঠেই হয়ে যাবে।`, [mkO('এখনই করি! 💪', 3, 'এই তো! আমি জানতাম তুমি পারবে।', 'cheer', 'start', 'চলো'), mkO('একটু পরে', 2, 'ঠিক আছে, মনে রেখো কিন্তু 🌸', 'happy')]),
  mkD('q_chal', ['home'], 52, () => challengePool().length >= 10 && S.chDay !== dk(), 'ask', () => 'আজকের 🎯 চ্যালেঞ্জ খুলে গেছে! বোনাস কয়েনও আছে।', [mkO('চলো খেলি! 🎯', 3, 'ভালো করে ভেবে উত্তর দিও!', 'cheer', 'challenge', 'শুরু'), mkO('পরে', 2, 'আজ রাতের আগেই কিন্তু করে নিও!', 'happy')]),
  mkD('q_level', ['home'], 45, () => doneCount() >= 3, 'ask', () => 'পাঠগুলো কেমন লাগছে? একটু বলবে?', [mkO('সহজ লাগছে', 3, 'তাহলে লেভেল বাড়িয়ে একটু চ্যালেঞ্জ নেবে? 😉', 'cheer', 'level', 'লেভেল দেখি'), mkO('ঠিকই আছে', 3, 'বাহ্, তাহলে এই গতিতেই চলো!', 'happy'), mkO('একটু কঠিন', 4, 'চিন্তা নেই! ভুলের খাতা আছে না, ভুল থেকেই তো শেখা 📒', 'happy')], 5),
  mkD('q_friend', ['home', 'me'], 30, () => doneCount() >= 2 && !isInApp(), 'ask', () => 'এই অ্যাপের কথা বন্ধুদের বলেছ? ওরাও সাথে পড়লে আরও মজা! 🫶', [mkO('এখনই শেয়ার করি', 5, 'ধন্যবাদ! তুমি দারুণ বন্ধু 💕', 'cheer', 'share', 'শেয়ার করি'), mkO('বলেছি', 3, 'ওরা কেমন লাগল বললে আমাকেও জানিও 🌸', 'happy'), mkO('পরে', 2, 'আচ্ছা, "আমি" ট্যাবে শেয়ার বাটন আছে।', 'happy')], 4),
  mkD('q_tour', ['home'], 35, () => doneCount() >= 1 && !S.tourSeen, 'ask', () => 'অ্যাপের সব কোণ ঘুরে দেখেছ? 🏡 Cozy Room, Practice, Profile ট্যাব...', [mkO('দেখেছি', 2, 'দারুণ!', 'happy'), mkO('বলো কোনটা কোথায়', 3, 'নিচে চারটা বাটন: Learn 📖 পাঠ, Cozy Room 🏡 ঘর সাজানো, Practice 📒 ভুলের খাতা, Profile 🌸 ব্যাজ আর ব্যাকআপ।', 'think')], 7),
  mkD('n_trayfull', ['nook'], 78, () => trayFull() && trayN() < TRAY_MAX, 'think', () => 'ট্রে ভরে গেছে! নতুন জিনিস আনতে চাইলে শপে গিয়ে একটা ট্রে কিনে আনো 🧺 আর কয়েন লাগবে? পাঠ করলেই জমবে!', [mkO('শপে যাই', 3, 'ট্রে ট্যাবটা একদম প্রথমে আছে!', 'cheer', 'traymarket', 'চলো'), mkO('পরে', 2, 'আগে ঘরে কিছু সাজিয়েও জায়গা বানাতে পারো 😉', 'happy')], 2),
  mkD('n_trayinfo', ['nook'], 66, () => unplacedList().length >= 4 && !S.trInfo, 'ask', () => 'জানো তো, প্রতি ট্রেতে 6টা করে জিনিস ধরে! ভরে গেলে পরের ট্রেতে যায়। ডানে-বাঁয়ে স্লাইড করে দেখো 🧺', [mkO('বুঝেছি ভাইয়া', 3, 'নতুন ট্রে শপে পাবে, কয়েন দিয়ে কিনতে হয়।', 'cheer')], 30),
  mkD('n_empty', ['nook'], 80, () => placedIds().length === 0 && S.owned.some(x => ITEM[x] && ITEM[x].k), 'ask', () => 'ঘরটা এখনো ফাঁকা! ট্রে থেকে একটা জিনিস তুলে ঘরে বসিয়ে দাও 🥢', [mkO('চেষ্টা করি', 3, 'সবুজ আলো জ্বললে ছেড়ে দিও!', 'cheer'), mkO('কীভাবে করব?', 3, 'এই নাও ছোট্ট গাইড!', 'think', 'help', 'দেখি')]),
  mkD('n_buy', ['nook'], 70, () => canBuy(), 'happy', () => `তোমার ${S.coins} কয়েন জমেছে! মার্কেটে নতুন কিছু আনবে নাকি? 🛒`, [mkO('মার্কেটে যাই 🛒', 2, 'ভালো কিছু বেছে নিও!', 'cheer', 'market', 'চলো'), mkO('পরে', 2, 'আরও জমিয়ে একসাথে কেনাও ভালো 😉', 'happy')], 2),
  mkD('n_night', ['nook'], 65, () => !S.nightSeen && !S.night && placedIds().length > 0, 'ask', () => 'রাতের মোড চালিয়ে দেখেছ? 🌙 লাইট আর ফানুস জ্বলে ওঠে!', [mkO('দেখাও!', 3, 'দেখো কী সুন্দর!', 'cheer', 'night', 'দেখি'), mkO('পরে', 2, 'ঘরের ওপরের ডানে চাঁদ-সূর্য বাটন আছে।', 'happy')], 3),
  mkD('n_quest', ['nook'], 62, () => qReady() > 0, 'cheer', () => 'কোয়েস্ট শেষ হয়ে গেছে! পুরস্কার নিতে ভুলো না 🎯', [mkO('নিই!', 2, 'কয়েন জমিয়ে ফেলো!', 'cheer', 'quests', 'নিই')]),
  mkD('n_share', ['nook'], 58, () => placedIds().length >= 5 && !S.pics, 'ask', () => 'ঘরটা তো দারুণ সাজিয়েছ! 📷 ছবি তুলে বন্ধুদের দেখাবে?', [mkO('ছবি তুলি', 4, 'হাসি দাও!', 'cheer', 'pic', 'তুলি'), mkO('পরে', 2, 'ঠিক আছে, ছবি বাটনে চাপলেই হবে।', 'happy')], 3),
  mkD('n_fb', ['nook'], 50, () => placedIds().length >= 3, 'ask', () => 'ঘর সাজাতে কেমন লাগছে? একটু বলবে? 🌸', [mkO('দারুণ মজা!', 3, 'আমারও খুব ভালো লাগছে দেখে!', 'cheer'), mkO('ঠিকঠাক', 3, 'আরও সুন্দর করার চেষ্টা করছি!', 'happy'), mkO('একটু কঠিন লাগে', 4, 'ট্যাপ করলে ছোট-বড় করা যায়, আর ↩️ আনডু তো আছেই!', 'think', 'help', 'গাইড দেখি')], 4),
  mkD('n_fav', ['nook'], 40, () => ROOMS.filter(r => S.owned.includes(r)).length >= 2, 'ask', () => 'কোন ঘরটা তোমার সবচেয়ে প্রিয়?', ROOMS.map(r => mkO(ITEM[r].e + ' ' + ITEM[r].n, 3, 'আমারও ওটা ভালো লাগে!', 'happy')), 6),
  mkD('n_tip', ['nook'], 10, () => true, 'happy', () => rnd(TIPS), [mkO('ধন্যবাদ ভাইয়া 🌸', 2, 'যাও, সাজাও!', 'cheer')], 1),
  mkD('m_has', ['mistakes'], 60, () => S.mistakes.length > 0, 'think', () => `ভুলের খাতায় ${S.mistakes.length}টা প্রশ্ন জমেছে। ভুল থেকেই তো শেখা! আবার করে দেখবে?`, [mkO('এখনই করি 💪', 4, 'দারুণ!', 'cheer', 'practice', 'শুরু'), mkO('পরে', 2, 'আজকের মধ্যে একবার দেখে নিও 📒', 'happy')]),
  mkD('m_none', ['mistakes'], 50, () => S.mistakes.length === 0, 'cheer', () => 'ভুলের খাতা একদম খালি! 🎉 নতুন ভুল হলে এখানে জমবে।', [mkO('হিহি, ধন্যবাদ!', 3, 'এভাবেই চলো!', 'cheer')]),
  mkD('m_note', ['mistakes'], 30, () => !(S.notes || []).length, 'ask', () => 'ক্লাসে নতুন কিছু শিখলে নোটে লিখে রাখো, পরে দারুণ কাজে লাগে 📝', [mkO('এখনই লিখি', 3, 'লিখে ফেলো!', 'cheer', 'notes', 'লিখি'), mkO('পরে', 2, 'পাশের 📝 বাটনে যখন খুশি।', 'happy')], 3),
  mkD('me_bk', ['me'], 60, () => !S.bkSeen && doneCount() >= 1, 'think', () => 'ফোন বদলালে সব হারিয়ে ফেলো না যেন! ☁️ ব্যাকআপ কোডটা নিয়ে রাখবে?', [mkO('নিয়ে রাখি', 4, 'এই নাও!', 'cheer', 'backup', 'কোড দেখি'), mkO('পরে', 2, 'নিচের দিকে "সেভ ব্যাকআপ" আছে।', 'happy')], 3),
  mkD('me_badge', ['me'], 35, () => true, 'ask', () => 'তোমার ব্যাজগুলো দেখেছ? 🏅 কোনগুলো বাকি, ট্যাপ করলেই জানা যায়!', [mkO('দেখছি!', 2, 'সবগুলো জোগাড় করে ফেলো!', 'cheer')], 3),
  mkD('n_more_lessons', ['home'], 45, () => !!S.name && todayXp() < 20, 'cheer', () => `${S.name}, আরেকটা পাঠ করে ফেলবে? 📚 প্রতিটা পাঠে কয়েন মেলে, আর কয়েন দিয়ে কোজি রুম সাজানো যায়!`, [mkO('চলো একটা পাঠ! 💪', 4, 'এই তো! কয়েন জমাও, তারপর ঘরটা সাজিয়ে ফেলো 🏡', 'cheer', 'start', 'চলো শুরু করি'), mkO('আগে ঘরটা দেখি', 2, 'আচ্ছা! কিন্তু নতুন সোফা কিনতে তো কয়েন লাগবে, বাঁধনের কাছে ধার চেয়ো না 😄', 'happy', 'room', 'ঘরে যাই')])
];
let dBusy = false, dTm = 0;
const dOK = d => { const s = DL().seen[d.id]; if (!s) return true; if (d.cd <= 1) return s.d !== dk(); return Date.now() - s.t >= d.cd * 864e5 - 108e5; };
function dlgPick(scr) { return DLGS.filter(d => d.scr.includes(scr) && dOK(d) && (() => { try { return d.when(); } catch (e) { return false; } })()).sort((a, b) => b.pri - a.pri)[0]; }
function dlgTry(force) {
  if (dBusy || !S.name || !['home', 'nook', 'mistakes', 'me'].includes(view) || layer.querySelector('.overlay') || document.querySelector('.nmd') || (typeof D !== 'undefined' && D && D.on)) return;
  if (DL().day !== dk()) { DL().day = dk(); DL().n = 0; }
  const d = dlgPick(view); if (!d) return;
  const gap = Date.now() - (DL().last || 0), hi = d.pri >= 80;
  if (!hi && (gap < 120000 || DL().n >= 8)) return;
  if (hi && gap < 20000) return;
  dlgShow(d);
}
const dlgSoon = v => { clearTimeout(dTm); if (['home', 'nook', 'mistakes', 'me'].includes(v)) dTm = setTimeout(() => { if (view === v) dlgTry(); }, v === 'home' ? 1300 : 1000); };
setInterval(() => dlgTry(), 40000);
window.dlgSoonFn = dlgSoon;
/* ===== v1.9.0: ঘরের র‍্যাংক (Bronze → Legend) ===== */
const RANKS = [
  { n: 'Bronze', e: '🥉', c: '#CD7F32', c2: '#8B5A2B', min: 0 }, { n: 'Silver', e: '🥈', c: '#C9CFD8', c2: '#8A93A0', min: 10 },
  { n: 'Gold', e: '🥇', c: '#F5C542', c2: '#C99A1C', min: 28 }, { n: 'Platinum', e: '💠', c: '#7FD3E8', c2: '#4A9FC0', min: 55 },
  { n: 'Diamond', e: '💎', c: '#A98BFF', c2: '#6B4FD6', min: 90 }, { n: 'Heroic', e: '🔥', c: '#FF7A4D', c2: '#D13F1C', min: 135 },
  { n: 'Legend', e: '👑', c: '#FFD34D', c2: '#E0A100', min: 190 }
];
const rkSvg = (r, w = 30) => `<svg viewBox="0 0 30 34" style="width:${w}px;height:${Math.round(w * 34 / 30)}px;flex:none" aria-hidden="true"><path d="M15 1 28 6v11c0 8-6 13-13 16C8 30 2 25 2 17V6z" fill="${r.c}" stroke="${r.c2}" stroke-width="2" stroke-linejoin="round"/><path d="m15 9 2.4 5 5.4.7-4 3.7 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.7 5.4-.7z" fill="#fff" opacity=".92"/></svg>`;
const rkScore = () => { let a = 0; placedIds().forEach(id => { const t = ITEM[id]; if (t) a += Math.max(1, Math.round((t.p || 20) / 10)); }); return a + Math.max(0, ROOMS.filter(r => S.owned.includes(r)).length - 1) * 5; };
function rkInfo() {
  const p = Math.max(S.rkPts || 0, rkScore()); let i = 0; RANKS.forEach((r, k) => { if (p >= r.min) i = k; });
  const r = RANKS[i], nx = RANKS[i + 1]; return { p, i, r, nx, pct: nx ? Math.round((p - r.min) / (nx.min - r.min) * 100) : 100, left: nx ? nx.min - p : 0 };
}
function rankStrip() {
  const k = rkInfo(), r = k.r;
  return `<button class="rks" style="--rc:${r.c}" onclick="rankSheet()" aria-label="র‍্যাংক">${rkSvg(r)}<span class="rkt"><b>${r.n}</b><small>${k.nx ? k.nx.n + '-এ উঠতে আর ' + k.left + ' পয়েন্ট' : 'সর্বোচ্চ র‍্যাংক! 👑'}</small><span class="rkbar"><i style="width:${k.pct}%"></i></span></span></button>`;
}
function rankSheet() {
  const k = rkInfo();
  sheet(`<div class="center">${mascot(72, 'happy', true)}</div><h3>ঘরের র‍্যাংক</h3><p>ঘরে জিনিস বসালে পয়েন্ট মেলে। দামি জিনিসে বেশি পয়েন্ট, নতুন ঘর কিনলেও বোনাস 🏡</p><div style="max-height:44vh;overflow:auto">${RANKS.map((r, i) => `<div class="rkrow ${i === k.i ? 'cur' : ''} ${i > k.i ? 'off' : ''}" style="--rc:${r.c}">${rkSvg(r, 26)}<b style="flex:1">${r.n}</b><small>${r.min} পয়েন্ট</small></div>`).join('')}</div><p style="margin:8px 0">তোমার পয়েন্ট: <b>${k.p}</b></p><button class="btn" data-act="close">ঠিক আছে</button>`);
}
function confetti() {
  const b = document.createElement('div'), cs = ['#FF8A6B', '#F5C542', '#8DBE6B', '#7FD3E8', '#A98BFF', '#FF7AA8']; b.className = 'cfx';
  for (let i = 0; i < 70; i++) { const e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.background = rnd(cs); e.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px'); e.style.setProperty('--rot', (Math.random() * 720) + 'deg'); e.style.animationDelay = Math.random() * .7 + 's'; e.style.animationDuration = (2 + Math.random() * 1.4) + 's'; b.appendChild(e); }
  document.body.appendChild(b); setTimeout(() => b.remove(), 4400);
}
function rkUp(k) {
  confetti(); try { snd('badge'); } catch (e) {} track('rank_up', { extra: { r: k.r.n, p: k.p } });
  sheet(`<div class="center">${mascot(88, 'cheer', true)}</div><div style="display:flex;justify-content:center;margin:2px 0">${rkSvg(k.r, 64)}</div><h3>অভিনন্দন ${esc(S.name || '')}! 🎉</h3><p>তোমার ঘর এখন <b>${k.r.n}</b> র‍্যাংকে ${k.r.e}</p><button class="btn" onclick="closeSheet();GO.pic()">📷 শেয়ার করি</button><button class="btn ghost" data-act="close">পরে</button>`);
}
function rkCheck() {
  if (!S.name || view !== 'nook' || document.hidden || layer.querySelector('.overlay') || document.querySelector('.nmd') || (typeof D !== 'undefined' && D && D.on)) return;
  const sc = rkScore(); if (sc > (S.rkPts || 0)) { S.rkPts = sc; save(); }
  const el = document.querySelector('.rks'); if (el) { const t = document.createElement('div'); t.innerHTML = rankStrip(); if (el.outerHTML !== t.firstChild.outerHTML) el.replaceWith(t.firstChild); }
  const k = rkInfo(); if (S.rk == null) { S.rk = k.i; save(); if (k.i >= 1) rkUp(k); return; }
  if (k.i > S.rk) { S.rk = k.i; save(); rkUp(k); }
}
setInterval(rkCheck, 1200);
function rkFrame(c, W, H) {
  const k = rkInfo(), r = k.r, i = k.i; c.save();
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, r.c); g.addColorStop(.5, '#FFFFFF77'); g.addColorStop(1, r.c2);
  c.lineWidth = i >= 5 ? 26 : 20; c.strokeStyle = g; if (i >= 5) { c.shadowColor = r.c; c.shadowBlur = 28; }
  cvRR(c, 10, 10, W - 20, H - 20, 52); c.stroke(); c.restore();
  if (i >= 4) { c.save(); c.fillStyle = '#fff'; for (let n = 0; n < 26; n++) { c.globalAlpha = .9; c.beginPath(); c.arc((n + .5) * W / 26, n % 2 ? 12 : H - 12, 3 + (n % 3) * 1.5, 0, 6.283); c.fill(); } c.restore(); }
  if (i === 6) { c.save(); c.font = '90px serif'; c.textAlign = 'center'; c.fillText('👑', W / 2, 76); c.restore(); }
}

/* ===== v1.8.0: বাঁধনের ছোট্ট উপদেশ (উত্তর লাগে না, নিজে নিজে চলে যায়) ===== */
const MTIPS = [
  { id: 'easy', ok: () => S.lvl !== 'pro' && doneCount() >= 3, say: 'পাঠগুলো খুব সহজ লাগছে? লেভেল বদলে আরেকটু কঠিন কিছু চেষ্টা করো 💪', go: () => GO.level() },
  { id: 'prof', ok: () => view !== 'me', say: 'মাঝে মাঝে Profile থেকে ঘুরে এসো, তোমার ট্রফি আর ব্যাজ অপেক্ষা করছে 🏅', go: () => go('me') },
  { id: 'hard', ok: () => S.lvl !== 'beg' && doneCount() >= 2, say: 'কঠিন লাগছে? কোনো চিন্তা নেই, লেভেল বদলে নিলে সব অগ্রগতি জমা থাকবে 🌱', go: () => GO.level() },
  { id: 'room', ok: () => view !== 'nook', say: 'ঘরটা ভালো করে সাজাও! কয়েন দিয়ে নতুন নতুন জিনিস কিনে নাও 🏡', go: () => GO.room() },
  { id: 'daily', ok: () => true, say: 'রোজ একটা করে পাঠ করলে স্ট্রিক বাড়ে, আর উপহারও বাড়ে 🔥', go: null },
  { id: 'share', ok: () => (S.owned || []).length > 3, say: 'সুন্দর ঘর সাজালে বন্ধুদের শেয়ার করো, ওরাও নিজের ঘর সাজাতে শুরু করবে 🌸', go: () => GO.share() },
  { id: 'mist', ok: () => view !== 'mistakes' && doneCount() >= 2, say: 'ভুল হলে ভয় নেই! Practice-এ আবার চেষ্টা করলে তাড়াতাড়ি শেখা হয় 📒', go: () => go('mistakes') }
];
function tipTry() {
  if (!S.name || doneCount() < 1 || !['home', 'nook', 'mistakes', 'me'].includes(view) || document.hidden) return;
  if (dBusy || document.querySelector('.nmd,.mtip') || layer.querySelector('.overlay') || (typeof D !== 'undefined' && D && D.on)) return;
  const m = S.mt = S.mt || { d: '', n: 0, t: 0, i: 0 }; if (m.d !== dk()) { m.d = dk(); m.n = 0; }
  const now = Date.now(); if (m.n >= 5 || now - m.t < 150000 || now - (DL().last || 0) < 60000) return;
  let t = null; for (let k = 0; k < MTIPS.length; k++) { const c = MTIPS[(m.i + k) % MTIPS.length]; let ok = false; try { ok = c.ok(); } catch (e) {} if (ok) { t = c; m.i = (m.i + k + 1) % MTIPS.length; break; } }
  if (!t) return; m.n++; m.t = now; save(); try { snd('pop', .35); } catch (e) {}
  const o = document.createElement('div'); o.className = 'mtip'; o.innerHTML = mascot(52, 'happy', false) + '<div><b>বাঁধন ভাইয়া</b>' + esc(t.say) + '</div>'; document.body.appendChild(o); try { iconify(o); } catch (e) {}
  const bye = () => { clearTimeout(o._t); o.classList.add('out'); setTimeout(() => o.remove(), 320); };
  o._t = setTimeout(bye, 6500);
  o.addEventListener('click', () => { bye(); track('tip_tap', { extra: { id: t.id } }); if (t.go) setTimeout(t.go, 150); });
  track('tip_shown', { extra: { id: t.id } });
}
setTimeout(tipTry, 35000); setInterval(tipTry, 30000);

function dlgPic(o, mood) { o.querySelector('.nmd-pic').innerHTML = mascot(122, mood || 'happy', true); }
function dlgType(o, text, done) {
  const t = o.querySelector('.t'), g = o.querySelector('.g'); clearInterval(o._tm); o._done = false;
  let ch; try { ch = [...new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(text)].map(s => s.segment); } catch (e) { ch = Array.from(text); }
  const fin = () => { clearInterval(o._tm); t.textContent = text; iconify(t); g.textContent = ''; if (!o._done) { o._done = true; done && done(); } }; o._fin = fin;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return fin();
  let i = 0; o._tm = setInterval(() => { i++; t.textContent = ch.slice(0, i).join(''); g.textContent = ch.slice(i).join(''); if (i % 3 === 0) { try { snd('key', .12); } catch (e) {} } if (i >= ch.length) fin(); }, 30);
}
function dlgClose(o, go) { clearInterval(o._tm); o.remove(); dBusy = false; if (go && GO[go]) setTimeout(GO[go], 120); }
function dlgShow(d) {
  dBusy = true; DL().last = Date.now(); DL().n = (DL().n || 0) + 1; DL().seen[d.id] = { t: Date.now(), d: dk() }; save(); track('dialog_shown', { extra: { id: d.id } }); snd('notify', .6);
  const o = document.createElement('div'); o.className = 'nmd';
  o.innerHTML = `<div class="nmd-in"><div class="nmd-pic"></div><div class="nmd-box"><div class="nmd-rb">বাঁধন ভাইয়া</div><button class="nmd-x" aria-label="বন্ধ">✕</button><div class="nmd-tx"><span class="t"></span><span class="g"></span></div><div class="nmd-op"></div></div></div>`;
  document.body.appendChild(o); dlgPic(o, d.mood);
  const ops = o.querySelector('.nmd-op'), say = typeof d.say === 'function' ? d.say() : d.say;
  const showOpts = () => { ops.innerHTML = d.opts.map((p, k) => `<button class="nmd-o ${d.opts.length === 1 ? 'pri' : ''}" data-k="${k}" style="animation-delay:${k * 60}ms"><span>${esc(p.t)}</span>${p.r ? `<i>🪙 +${p.r}</i>` : ''}</button>`).join(''); iconify(ops); };
  o.addEventListener('click', e => {
    const x = e.target.closest('.nmd-x'), b = e.target.closest('.nmd-o');
    if (x) { DL().seen[d.id] = { t: Date.now() - (d.cd > 1 ? 0 : 0), d: dk() }; save(); track('dialog_skip', { extra: { id: d.id } }); return dlgClose(o); }
    if (b && b.dataset.k !== undefined && !o._ans) {
      o._ans = 1; const p = d.opts[+b.dataset.k]; if (d.id === 'gift') S.gDay = dk(); S.coins = (S.coins || 0) + p.r; S.dlgN = (S.dlgN || 0) + 1; save(); snd('coin'); track('dialog_answer', { extra: { id: d.id, a: +b.dataset.k } });
      if (d.id === 'n_trayinfo') { S.trInfo = 1; save(); } if (d.id === 'q_trailer' && +b.dataset.k === 0) { S.trSeen = 1; save(); } if (d.id === 'q_tour') { S.tourSeen = 1; save(); }
      const rw = document.createElement('div'); rw.className = 'nmd-rw'; rw.innerHTML = `${COIN} +${p.r}`; o.querySelector('.nmd-box').appendChild(rw);
      dlgPic(o, p.mood || 'happy'); ops.innerHTML = '';
      dlgType(o, p.say || 'ধন্যবাদ! 🌸', () => { ops.innerHTML = `<button class="nmd-o pri" data-k="end" style="justify-content:center"><span>${p.gl || 'ঠিক আছে ভাইয়া 🌸'}</span></button>`; iconify(ops); o._end = p.go; });
      return;
    }
    if (b && b.dataset.k === 'end') return dlgClose(o, o._end);
    if (!o._done) o._fin();
  });
  dlgType(o, say, showOpts);
}


/* ---- রাতে ঘরের ট্যাবের পেজ আকাশ ---- */
const TC0 = (document.querySelector('meta[name="theme-color"]') || {}).content || '#489B82';
function nkSky() {
  const on = view === 'nook' && N.tab === 'room' && !!S.night;
  document.documentElement.classList.toggle('nknight', on);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = on ? '#1C1944' : TC0;
}
const render0 = render; render = function () { render0.apply(this, arguments); nkSky(); };

/* ---- সেভ ব্যাকআপ কোড ---- */
function encS() { const b = new TextEncoder().encode(JSON.stringify(S)); let s = ''; b.forEach(c => s += String.fromCharCode(c)); return 'NCQ1.' + btoa(s); }
function decS(t) { t = (t || '').replace(/\s+/g, ''); if (!t.startsWith('NCQ1.')) throw 0; const s = atob(t.slice(5)), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); const o = JSON.parse(new TextDecoder().decode(b)); if (!o || typeof o !== 'object' || !Array.isArray(o.owned)) throw 0; return o; }
function backupSheet() { sheet(`<h3>☁️ ব্যাকআপ কোড</h3><p style="font-size:15px">ফোন বদলালে এই কোডটা নতুন ফোনে পেস্ট করলেই কয়েন, ঘর আর অগ্রগতি ফিরে আসবে। কোডটা কোথাও সেভ করে রাখো (যেমন নিজেকে মেসেজ পাঠিয়ে)।</p><textarea class="nta" id="bk" readonly style="height:110px;font-size:12px;word-break:break-all">${encS()}</textarea><button class="btn" data-act="bkcopy" style="margin-top:8px">📋 কোড কপি করো</button><button class="btn ghost" data-act="close">বন্ধ করো</button>`); }
function restoreSheet() { sheet(`<h3>কোড থেকে ফিরিয়ে আনি</h3><p style="font-size:15px">এখানে কোডটা পেস্ট করো। এই ফোনের এখনকার ডেটা বদলে যাবে।</p><textarea class="nta" id="bkin" placeholder="NCQ1...." style="height:110px;font-size:12px"></textarea><button class="btn" data-act="bkrestore" style="margin-top:8px">ফিরিয়ে আনি</button><button class="btn ghost" data-act="close">থাক</button>`); }

const fab = document.createElement('button'); fab.className = 'fab'; fab.dataset.act = 'notes'; fab.textContent = '📝'; fab.setAttribute('aria-label', 'নোট'); document.body.appendChild(fab); iconify(fab);
setInterval(() => { fab.style.display = ['splash', 'welcome', 'tut', 'nook'].includes(view) ? 'none' : ''; }, 400);
function notesSheet() {
  const ns = S.notes || [];
  sheet(`<h3>📝 আমার নোট</h3><p style="margin-bottom:8px">ক্লাসে কিছু শিখলে বা ভুল হলে এখানে টুকে রাখো।</p><textarea class="nta" id="nta" placeholder="এখানে লেখো..."></textarea><button class="btn" data-act="nsave" style="margin-top:8px">সেভ করো</button>${ns.map((n, i) => `<div class="note"><div>${esc(n.t)}<small>${n.d}</small></div><button class="tbtn" data-act="ndel" data-i="${i}" style="width:30px;height:30px;font-size:14px">🗑️</button></div>`).join('')}<button class="btn ghost" data-act="close" style="margin-top:8px">বন্ধ করো</button>`);
}
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  /* নতুন ভার্সন এলে নিজে থেকে আপডেট: শান্ত পর্দায় (লেসন/ডায়লগ/ড্র্যাগ ছাড়া) একবার রিলোড */
  const hadCtl = !!navigator.serviceWorker.controller; let pend = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtl) pend = true; });
  setInterval(() => { if (pend && ['home', 'nook', 'mistakes', 'me'].includes(view) && !layer.querySelector('.overlay') && !document.querySelector('.nmd') && !(typeof D !== 'undefined' && D && D.on)) { pend = false; location.reload(); } }, 3000);
  const chk = () => navigator.serviceWorker.getRegistration().then(r => r && r.update()).catch(() => {});
  document.addEventListener('visibilitychange', () => { if (!document.hidden) chk(); });
  addEventListener('load', () => navigator.serviceWorker.getRegistration().then(r => (r && r.active && /sw\.js\?/.test(r.active.scriptURL)) ? r.update() : navigator.serviceWorker.register('sw.js')).catch(() => {}));
}
