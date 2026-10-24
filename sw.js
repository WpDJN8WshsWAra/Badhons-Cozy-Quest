/* Badhon's Cozy Quest — service worker v5.0.0
   - ছবি আর ছোট সাউন্ড: প্রথমবার নামলে ফোনে জমা থাকে (অফলাইনেও চলে, ব্যান্ডউইথও বাঁচে)
   - index.html: আগে নেটওয়ার্ক, না পেলে জমানোটা (নতুন ভার্সন এলে নিজে থেকে পায়)
   - bgm/night: প্রথমবার চালানোর সময় নামে, তারপর জমা থাকে */
const VER = 'badhon-v5.0.0';
const CORE = ["./", "index.html", "css/style.css", "js/app.js", "manifest.webmanifest", "og-image.png", "icons/icon-192.png", "icons/icon-512.png", "icons/splash-cup.png", "icons/icon-maskable-512.png"];
const MEDIA = ["assets/img/alarm_clock.webp", "assets/img/bd_1.webp", "assets/img/bd_10.webp", "assets/img/bd_11.webp", "assets/img/bd_12.webp", "assets/img/bd_2.webp", "assets/img/bd_3.webp", "assets/img/bd_4.webp", "assets/img/bd_5.webp", "assets/img/bd_6.webp", "assets/img/bd_7.webp", "assets/img/bd_8.webp", "assets/img/bd_9.webp", "assets/img/bed_green.webp", "assets/img/books_stack.webp", "assets/img/cabinet_bookshelf.webp", "assets/img/cactus_flower.webp", "assets/img/cane_chair.webp", "assets/img/cat_plush.webp", "assets/img/chest_ottoman.webp", "assets/img/clay_tea_kettle.webp", "assets/img/coffee_table_book.webp", "assets/img/d_armchair.webp", "assets/img/d_cabinet.webp", "assets/img/d_floorlamp.webp", "assets/img/d_sidetable.webp", "assets/img/d_sofa.webp", "assets/img/d_tvstand.webp", "assets/img/desk_lamp.webp", "assets/img/desk_laptop.webp", "assets/img/eid_lantern.webp", "assets/img/fairy_lights.webp", "assets/img/fern_plant.webp", "assets/img/hand_fan.webp", "assets/img/hanging_plant.webp", "assets/img/hilsa_fish.webp", "assets/img/hud_coin.webp", "assets/img/hud_cup0.webp", "assets/img/hud_cup1.webp", "assets/img/hud_cup2.webp", "assets/img/hud_flame.webp", "assets/img/hud_gift0.webp", "assets/img/hud_gift1.webp", "assets/img/hud_jar.webp", "assets/img/hud_moon.webp", "assets/img/hud_sun.webp", "assets/img/hud_target.webp", "assets/img/hud_xp.webp", "assets/img/hurricane_lantern.webp", "assets/img/ic_b1.webp", "assets/img/ic_b2.webp", "assets/img/ic_b3.webp", "assets/img/ic_b4.webp", "assets/img/ic_b5.webp", "assets/img/ic_b6.webp", "assets/img/ic_c1.webp", "assets/img/ic_c2.webp", "assets/img/ic_c3.webp", "assets/img/ic_c4.webp", "assets/img/ic_c5.webp", "assets/img/ic_c6.webp", "assets/img/ic_d1.webp", "assets/img/ic_d2.webp", "assets/img/ic_d3.webp", "assets/img/ic_d4.webp", "assets/img/ic_d5.webp", "assets/img/ic_d6.webp", "assets/img/ic_l1.webp", "assets/img/ic_l2.webp", "assets/img/ic_l3.webp", "assets/img/ic_l4.webp", "assets/img/ic_l5.webp", "assets/img/ic_l6.webp", "assets/img/jamdani_cushion.webp", "assets/img/jute_floor_bed.webp", "assets/img/jute_mat.webp", "assets/img/k_cart.webp", "assets/img/k_dining.webp", "assets/img/k_fridge.webp", "assets/img/k_island.webp", "assets/img/k_rack.webp", "assets/img/k_shelf.webp", "assets/img/k_sink.webp", "assets/img/k_stove.webp", "assets/img/k_woodsink.webp", "assets/img/kalamdani_pens.webp", "assets/img/kantha_rug.webp", "assets/img/ladder_bookshelf.webp", "assets/img/lantern_low_table.webp", "assets/img/ma_ask.webp", "assets/img/ma_cheer.webp", "assets/img/ma_happy.webp", "assets/img/ma_sad.webp", "assets/img/ma_think.webp", "assets/img/mango_pickle_jar.webp", "assets/img/nav_learn.webp", "assets/img/nav_me.webp", "assets/img/nav_mistakes.webp", "assets/img/nav_room.webp", "assets/img/paper_kite.webp", "assets/img/paper_lantern.webp", "assets/img/photo_frame.webp", "assets/img/poster_frames.webp", "assets/img/radio.webp", "assets/img/rickshaw_art_frame.webp", "assets/img/room_cream.webp", "assets/img/room_green.webp", "assets/img/room_pink.webp", "assets/img/round_mirror.webp", "assets/img/round_rug.webp", "assets/img/s_board.webp", "assets/img/s_bread.webp", "assets/img/s_fruitbowl.webp", "assets/img/s_jug.webp", "assets/img/s_kplant.webp", "assets/img/s_mortar.webp", "assets/img/s_pan.webp", "assets/img/s_plates.webp", "assets/img/s_pot.webp", "assets/img/s_ricecooker.webp", "assets/img/s_spicejars.webp", "assets/img/s_teatray.webp", "assets/img/shahid_minar_frame.webp", "assets/img/shitalpati_mat.webp", "assets/img/sofa_pink.webp", "assets/img/sp_books.webp", "assets/img/sp_cat.webp", "assets/img/sp_cup.webp", "assets/img/sp_lantern.webp", "assets/img/sp_lotus.webp", "assets/img/sp_moon.webp", "assets/img/star_jar.webp", "assets/img/storage_bench.webp", "assets/img/striped_rug.webp", "assets/img/succulent.webp", "assets/img/table_lamp.webp", "assets/img/teacup.webp", "assets/img/teapot.webp", "assets/img/terracotta_pot.webp", "assets/img/tray_deep.webp", "assets/img/tray_front.webp", "assets/img/tr_beg.webp", "assets/img/tr_med.webp", "assets/img/tr_high.webp", "assets/img/tr_pro.webp", "assets/img/tut1.jpg", "assets/img/tut2.jpg", "assets/img/tw_open.webp", "assets/img/tw_shut.webp", "assets/img/ui_all.webp", "assets/img/ui_basket.webp", "assets/img/ui_bd.webp", "assets/img/ui_bedroom.webp", "assets/img/ui_beginner.webp", "assets/img/ui_camera.webp", "assets/img/ui_claim.webp", "assets/img/ui_close.webp", "assets/img/ui_done.webp", "assets/img/ui_drawing.webp", "assets/img/ui_enlarge.webp", "assets/img/ui_flip.webp", "assets/img/ui_furniture.webp", "assets/img/ui_hand.webp", "assets/img/ui_heart.webp", "assets/img/ui_heart_empty.webp", "assets/img/ui_help.webp", "assets/img/ui_higher.webp", "assets/img/ui_key.webp", "assets/img/ui_kitchen.webp", "assets/img/ui_lock.webp", "assets/img/ui_medal.webp", "assets/img/ui_medium.webp", "assets/img/ui_music_off.webp", "assets/img/ui_music_on.webp", "assets/img/ui_myroom.webp", "assets/img/ui_notes.webp", "assets/img/ui_pro.webp", "assets/img/ui_rooms.webp", "assets/img/ui_shop.webp", "assets/img/ui_shrink.webp", "assets/img/ui_small.webp", "assets/img/ui_sparkle.webp", "assets/img/ui_teacup.webp", "assets/img/ui_totray.webp", "assets/img/ui_trash.webp", "assets/img/ui_undo.webp", "assets/img/ui_wall.webp", "assets/img/un_0.webp", "assets/img/un_1.webp", "assets/img/un_10.webp", "assets/img/un_11.webp", "assets/img/un_2.webp", "assets/img/un_3.webp", "assets/img/un_4.webp", "assets/img/un_5.webp", "assets/img/un_6.webp", "assets/img/un_7.webp", "assets/img/un_8.webp", "assets/img/un_9.webp", "assets/img/vanity_mirror.webp", "assets/img/vase_plant.webp", "assets/img/w_bunting.webp", "assets/img/w_macrame.webp", "assets/img/w_painting.webp", "assets/img/w_plates.webp", "assets/img/w_shelf2.webp", "assets/img/w_window.webp", "assets/img/wall_clock.webp", "assets/img/wall_shelf.webp", "assets/img/wardrobe_yellow.webp", "assets/img/window_curtains.webp", "assets/snd/back.mp3", "assets/snd/badge.mp3", "assets/snd/buy.mp3", "assets/snd/coin.mp3", "assets/snd/done.mp3", "assets/snd/gift.mp3", "assets/snd/key.mp3", "assets/snd/lose.mp3", "assets/snd/notify.mp3", "assets/snd/pick.mp3", "assets/snd/pick2.mp3", "assets/snd/place.mp3", "assets/snd/pop.mp3", "assets/snd/purchase.mp3", "assets/snd/remove.mp3", "assets/snd/snap.mp3", "assets/snd/ui_click.mp3", "assets/snd/wrong.mp3"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => Promise.all(CORE.concat(MEDIA).map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

async function audioResp(req) {
  const cache = await caches.open(VER);
  let res = await cache.match(req.url);
  if (!res) {
    try {
      const full = await fetch(req.url);
      if (!full.ok || full.status !== 200) return full;
      cache.put(req.url, full.clone()); res = full;
    } catch (err) { return Response.error(); }
  }
  const range = req.headers.get('range');
  if (!range) return res;
  const buf = await res.arrayBuffer(), m = /bytes=(\d*)-(\d*)/.exec(range);
  if (!m) return new Response(buf, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
  const s = m[1] ? +m[1] : 0; let e = m[2] ? +m[2] : buf.byteLength - 1; e = Math.min(e, buf.byteLength - 1);
  return new Response(buf.slice(s, e + 1), { status: 206, statusText: 'Partial Content', headers: { 'Content-Type': 'audio/mpeg', 'Content-Range': 'bytes ' + s + '-' + e + '/' + buf.byteLength, 'Content-Length': String(e - s + 1), 'Accept-Ranges': 'bytes' } });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== location.origin) {
    if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
      e.respondWith(caches.open(VER).then(async c => {
        const hit = await c.match(req);
        const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || net;
      }));
    }
    return;
  }

  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname === '/') {
    e.respondWith(
      fetch(req).then(r => {
        if (r && r.ok) { const copy = r.clone(); caches.open(VER).then(c => c.put('index.html', copy)); }
        return r;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }

  if (/\.mp3$/.test(url.pathname)) { e.respondWith(audioResp(req)); return; }

  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && r.ok) { const copy = r.clone(); caches.open(VER).then(c => c.put(req, copy)); }
    return r;
  })));
});
