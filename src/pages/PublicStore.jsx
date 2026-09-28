import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Search, ExternalLink, Flame, ShoppingBag } from "lucide-react";
import { getCategories, getPublicProducts, recordClick } from "../lib/api";
import { supabaseConfigured } from "../lib/supabase";

const demoProducts = [
  { id: "demo-1", name: "Barbeador elétrico", description: "Achadinho em destaque", price: 39.90, category: "Casa", image_url: "", affiliate_url: "#", is_featured: true },
  { id: "demo-2", name: "Cafeteira compacta", description: "Oferta do dia", price: 89.90, category: "Casa", image_url: "", affiliate_url: "#", is_featured: false },
  { id: "demo-3", name: "Fone Bluetooth", description: "Preço especial", price: 59.90, category: "Eletrônicos", image_url: "", affiliate_url: "#", is_featured: true }
];

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PublicStore() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Todas"]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabaseConfigured) {
        setProducts(demoProducts);
        setCategories(["Todas", "Casa", "Eletrônicos"]);
        setLoading(false);
        return;
      }
      const [p, c] = await Promise.all([getPublicProducts(), getCategories()]);
      setProducts(p.data || []);
      setCategories(["Todas", ...(c.data || []).map(x => x.name)]);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const timer = setTimeout(async () => {
      const { data } = await getPublicProducts({ search, category });
      setProducts(data || []);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category]);

  const filtered = useMemo(() => {
    if (supabaseConfigured) return products;
    return products.filter(p =>
      (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
      (category === "Todas" || p.category === category)
    );
  }, [products, search, category]);

  async function offer(product) {
    await recordClick(product.id);
    if (product.affiliate_url && product.affiliate_url !== "#") {
      window.open(product.affiliate_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <main className="store">
      <header className="store-header">
        <img
  src="/achadex-logo.png"
  alt="Achadex"
  style={{ width: "110px", height: "110px", objectFit: "contain" }}
/>
        <div className="brand-sub">🔥 Achadinhos do dia</div>
      </header>

      <section className="store-tools">
        <div className="search-box">
          <Search size={19} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar achadinho..." />
        </div>
        <div className="categories">
          {categories.map(c => (
            <button key={c} className={category === c ? "chip active" : "chip"} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {!supabaseConfigured && (
        <div className="setup-note">
          Modo demonstração. Configure o Supabase para carregar os produtos reais.
        </div>
      )}

      <section className="section-title">
        <div><Flame size={21} /> Achadinhos do dia</div>
        <span>{filtered.length} produtos</span>
      </section>

      {loading ? (
        <div className="empty">Carregando produtos...</div>
      ) : filtered.length === 0 ? (
        <div className="empty"><ShoppingBag size={38} /><strong>Nenhum produto encontrado</strong><span>Tente outra busca ou categoria.</span></div>
      ) : (
        <section className="product-grid">
          {filtered.map(product => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span>📷</span>}
                {product.is_featured && <b className="featured">🔥 Destaque</b>}
              </div>
              <div className="product-body">
                <small>{product.category || "Achadinho"}</small>
                <h2>{product.name}</h2>
                {product.description && <p>{product.description}</p>}
                <strong className="price">{money(product.price)}</strong>
                <button className="offer" onClick={() => offer(product)}>
                  VER OFERTA <ExternalLink size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <footer>ACHADEX • Achadinhos do dia</footer>
    </main>
  );
}