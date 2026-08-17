#!/usr/bin/env python3
"""Generate preview.html — a single self-contained file (inline CSS/JS/images)
that renders the NOVA storefront in ANY preview environment (chat preview,
sandboxed iframe, email, etc.). Images are downscaled + base64-inlined."""
import base64, io, json, os, re
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def asset(path):
    return os.path.join(ROOT, path)

def data_uri(path, max_w=700, quality=72):
    src = asset(path)
    if not os.path.exists(src):
        raise SystemExit(f"MISSING ASSET: {path}")
    im = Image.open(src).convert("RGB")
    if im.width > max_w:
        im.thumbnail((max_w, int(im.height * max_w / im.width)))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return f"data:image/jpeg;base64,{b64}"

# ── 1. Read homepage ───────────────────────────────────────────────────────
html = open(asset("index.html")).read()
css = open(asset("assets/css/styles.css")).read()

js_files = [
    "assets/js/config.js",
    "assets/js/products.js",
    "assets/js/cart.js",
    "assets/js/main.js",
    "assets/js/pages/home.js",
]
js_bundle = "\n".join(open(asset(f)).read() for f in js_files)

# ── 2. Asset map (only images used on the homepage + quick-view modal) ─────
featured_ids = ["ring-x3", "band-v10", "ring-x6", "band-v8", "watch-2025f", "ring-x5", "band-v1s", "chronic-mfa1"]
# pull image paths from products.js
products_src = open(asset("assets/js/products.js")).read()
img_srcs = re.findall(r'images:\s*\[([^\]]*)\]', products_src)
first_imgs = []
for block in img_srcs:
    m = re.search(r'"([^"]+)"', block)
    if m:
        first_imgs.append(m.group(1))

needed = set(first_imgs) | {
    "assets/images/hero/hero-rings.jpg",
    "assets/images/hero/hero-bands.png",
    "assets/images/hero/hero-v8.jpg",
    "assets/images/hero/x6-lifestyle.jpg",
    "assets/images/app/app-1.jpg",
    "assets/images/app/app-2.jpg",
    "assets/images/products/2025f.webp",
    "assets/images/products/mfa1.jpg",
}

# bigger images get a higher cap so they don't look soft
caps = {
    "assets/images/hero/hero-rings.jpg": 1500,
    "assets/images/hero/hero-v8.jpg": 900,
    "assets/images/hero/x6-lifestyle.jpg": 900,
    "assets/images/hero/hero-bands.png": 860,
    "assets/images/app/app-1.jpg": 500,
    "assets/images/app/app-2.jpg": 500,
}
ASSET_MAP = {}
for p in sorted(needed):
    ASSET_MAP[p] = data_uri(p, max_w=caps.get(p, 700), quality=74 if p.startswith("assets/images/hero") else 70)

# ── 3. Inline CSS ──────────────────────────────────────────────────────────
html = html.replace(
    '<link rel="stylesheet" href="assets/css/styles.css">',
    "<style>\n" + css + "\n</style>",
)

# ── 4. Inline hero background ──────────────────────────────────────────────
hero_uri = ASSET_MAP["assets/images/hero/hero-rings.jpg"]
html = html.replace(
    "style=\"background-image:url('assets/images/hero/hero-rings.jpg')\"",
    f"style=\"background-image:url('{hero_uri}')\"",
)

# ── 5. Inline static <img> tags ────────────────────────────────────────────
def inline_img(m):
    src = m.group(1)
    if src in ASSET_MAP:
        return f'src="{ASSET_MAP[src]}"'
    return m.group(0)
html = re.sub(r'src="(assets/images/[^"]+)"', inline_img, html)

# ── 6. Inline JS bundle + asset resolver helper ────────────────────────────
helper = (
    "/* preview.html: resolve asset paths to inlined data URIs */\n"
    "window.ASSET_MAP = " + json.dumps(ASSET_MAP) + ";\n"
    "window.imgURL = function(p){ return window.ASSET_MAP[p] || p; };\n"
)
# patch home.js: route generated image paths through imgURL()
js_bundle = js_bundle.replace('src="${p.images[0]}"', 'src="${imgURL(p.images[0])}"')
js_bundle = js_bundle.replace('src="${heroImg[c.id]}"', 'src="${imgURL(heroImg[c.id])}"')

# ── 7. Quick-view modal + cart drawer + extra CSS/JS ───────────────────────
extra_css = """
/* preview-only UI */
.pv-overlay{position:fixed;inset:0;background:rgba(5,5,6,.78);backdrop-filter:blur(6px);z-index:300;display:grid;place-items:center;padding:1.2rem;opacity:0;pointer-events:none;transition:opacity .25s ease}
.pv-overlay.open{opacity:1;pointer-events:auto}
.pv-modal{width:min(880px,100%);max-height:88vh;overflow:auto;background:var(--bg-3);border:1px solid var(--border-strong);border-radius:var(--radius);display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;padding:1.6rem;position:relative}
.pv-modal img{width:100%;border-radius:var(--radius-sm);aspect-ratio:1/1;object-fit:cover;background:#101014}
.pv-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;border:1px solid var(--border-strong);background:var(--bg-2);color:var(--text);font-size:1.1rem;cursor:pointer;z-index:2}
.pv-close:hover{color:var(--accent);border-color:var(--accent)}
.drawer-overlay{position:fixed;inset:0;background:rgba(5,5,6,.6);z-index:300;opacity:0;pointer-events:none;transition:opacity .25s ease}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(420px,100%);background:var(--bg-3);border-left:1px solid var(--border-strong);z-index:301;transform:translateX(100%);transition:transform .3s ease;display:flex;flex-direction:column}
.drawer.open{transform:none}
.drawer-overlay.open{opacity:1;pointer-events:auto}
.drawer-head{padding:1.2rem 1.4rem;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.drawer-body{padding:1.2rem 1.4rem;flex:1;overflow:auto}
.drawer-foot{padding:1.2rem 1.4rem;border-top:1px solid var(--border)}
.d-line{display:grid;grid-template-columns:56px 1fr auto;gap:.8rem;align-items:center;padding:.6rem 0;border-bottom:1px solid var(--border)}
.d-line img{width:56px;height:56px;border-radius:10px;object-fit:cover}
.d-line b{font-size:.9rem}
.d-line .m{color:var(--faint);font-size:.75rem}
.d-line .x{background:none;border:none;color:var(--faint);cursor:pointer;font-size:.78rem;text-decoration:underline}
.d-line .x:hover{color:var(--danger)}
@media(max-width:640px){.pv-modal{grid-template-columns:1fr}}
"""
extra_js = """
/* preview.html: quick-view modal + cart drawer */
(function(){
  var overlay = document.createElement('div'); overlay.className='pv-overlay';
  document.body.appendChild(overlay);
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  document.addEventListener('click', function(e){
    var link = e.target.closest('a[href^="product.html"]');
    if(!link) return;
    e.preventDefault();
    var id = new URLSearchParams(link.getAttribute('href').split('?')[1]).get('id');
    var p = PRODUCTS_BY_ID[id]; if(!p) return;
    overlay.innerHTML = '<div class="pv-modal" role="dialog" aria-modal="true">' +
      '<button class="pv-close" aria-label="Close">×</button>' +
      '<img src="'+imgURL(p.images[0])+'" alt="'+esc(p.name)+'">' +
      '<div><span class="pdp-cat">'+esc(CATEGORY_LABEL[p.category])+' · Model '+esc(p.model)+'</span>' +
      '<h2 style="font-size:1.6rem;margin:.4rem 0">'+esc(p.name)+'</h2>' +
      '<div class="pdp-price">'+formatPrice(p.price)+(p.compareAt?'<span class="compare">'+formatPrice(p.compareAt)+'</span>':'')+'</div>' +
      '<p class="muted" style="font-size:.92rem">'+esc(p.tagline)+'</p>' +
      '<ul class="pdp-feats">'+p.features.slice(0,3).map(function(f){return '<li>'+esc(f)+'</li>';}).join('')+'</ul>' +
      '<div class="buy-row"><button class="btn btn-primary" data-pv-add>Add to cart — '+formatPrice(p.price)+'</button></div>' +
      '<p class="faint" style="font-size:.78rem">Quick preview. Full page with specs, gallery & checkout ships in nova-store.zip.</p>' +
      '</div></div>';
    overlay.querySelector('.pv-close').addEventListener('click', closePv);
    overlay.querySelector('[data-pv-add]').addEventListener('click', function(){ Cart.add(p.id); toast(p.name+' added to cart'); });
    overlay.classList.add('open');
  });
  function closePv(){ overlay.classList.remove('open'); }
  overlay.addEventListener('click', function(e){ if(e.target===overlay) closePv(); });

  /* cart drawer */
  var drawerOverlay=document.createElement('div'); drawerOverlay.className='drawer-overlay';
  var drawer=document.createElement('aside'); drawer.className='drawer'; drawer.setAttribute('aria-label','Cart');
  document.body.appendChild(drawerOverlay); document.body.appendChild(drawer);
  function openDrawer(){ renderDrawer(); drawer.classList.add('open'); drawerOverlay.classList.add('open'); }
  function closeDrawer(){ drawer.classList.remove('open'); drawerOverlay.classList.remove('open'); }
  function renderDrawer(){
    var lines=Cart.lineTotals();
    drawer.innerHTML = '<div class="drawer-head"><h3 style="margin:0">Your cart</h3><button class="pv-close" data-drawer-close aria-label="Close">×</button></div>' +
      '<div class="drawer-body">' + (lines.length? lines.map(function(l){
        return '<div class="d-line"><img src="'+imgURL(l.product.images[0])+'" alt=""><div><b>'+esc(l.product.name)+'</b><div class="m">'+formatPrice(l.product.price)+' × '+l.qty+'</div><div class="qty" style="margin-top:.4rem"><button data-dminus>−</button><output>'+l.qty+'</output><button data-dplus>+</button></div></div><div style="text-align:right"><b>'+formatPrice(l.lineTotal)+'</b><br><button class="x" data-dremove>Remove</button></div></div>';
      }).join('') : '<p class="muted">Your cart is empty.</p>') + '</div>' +
      '<div class="drawer-foot">' +
      '<div class="sum-line"><span>Subtotal</span><b>'+formatPrice(Cart.subtotal())+'</b></div>' +
      '<div class="sum-line"><span>Shipping</span><b>'+(Cart.shipping()===0?'Free':formatPrice(Cart.shipping()))+'</b></div>' +
      '<div class="sum-line sum-total"><span>Total</span><b>'+formatPrice(Cart.total())+'</b></div>' +
      '<button class="btn btn-primary btn-lg btn-block" data-dcheckout>Checkout</button>' +
      '<p class="faint" style="font-size:.75rem;text-align:center;margin:.6rem 0 0">Full checkout & Stripe payment live in cart.html (nova-store.zip)</p>' +
      '</div>';
    drawer.querySelector('[data-drawer-close]').addEventListener('click', closeDrawer);
    lines.forEach(function(l){
      var row=drawer.querySelectorAll('.d-line')[lines.indexOf(l)];
      row.querySelector('[data-dplus]').addEventListener('click',function(){ Cart.setQty(l.id, l.qty+1); });
      row.querySelector('[data-dminus]').addEventListener('click',function(){ if(l.qty>1) Cart.setQty(l.id, l.qty-1); });
      row.querySelector('[data-dremove]').addEventListener('click',function(){ Cart.remove(l.id); });
    });
    drawer.querySelector('[data-dcheckout]').addEventListener('click', function(){ toast('Checkout lives in cart.html — see nova-store.zip'); });
  }
  document.addEventListener('click', function(e){
    var cartBtn=e.target.closest('.cart-btn'); if(!cartBtn) return;
    e.preventDefault(); openDrawer();
  });
  drawerOverlay.addEventListener('click', closeDrawer);
  document.addEventListener('nova:cart', function(){ if(drawer.classList.contains('open')) renderDrawer(); });
})();
"""

html = html.replace(
    '<script src="assets/js/config.js"></script>\n  <script src="assets/js/products.js"></script>\n  <script src="assets/js/cart.js"></script>\n  <script src="assets/js/main.js"></script>\n  <script src="assets/js/pages/home.js"></script>',
    "<style>\n" + extra_css + "\n</style>\n"
    + "<script>\n" + helper + js_bundle + "\n</script>\n"
    + "<script>\n" + extra_js + "\n</script>",
)

# ── 8. Write preview.html ──────────────────────────────────────────────────
out = asset("preview.html")
open(out, "w").write(html)
size = os.path.getsize(out)
print(f"preview.html written: {size/1024:.0f} KB")
leftover = re.findall(r'(?:src|href)="assets/[^"]+"', html)
print("leftover asset refs:", len(leftover))
