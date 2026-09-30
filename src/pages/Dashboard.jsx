import React from "react";
import { useEffect, useState } from "react";
import { LogOut, Plus, Pencil, Trash2, ExternalLink, Package, MousePointerClick } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { deleteProduct, getAdminProducts, getStats, saveProduct, uploadProductImage } from "../lib/api";

const blank = { name: "", description: "", price: "", image_url: "", affiliate_url: "", category: "", published: true, is_featured: false };

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ products: 0, clicks: 0 });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function load() {
    const [p, s] = await Promise.all([getAdminProducts(), getStats()]);
    setProducts(p.data || []);
    setStats(s);
  }

  useEffect(() => { load(); }, []);

  function edit(p) {
    setForm({ ...p, price: p.price ?? "" });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setForm(blank);
    setEditing(false);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const { error } = await saveProduct({
      ...form,
      price: Number(String(form.price).replace(",", ".")),
      category: form.category || "Geral"
    });
    setSaving(false);
    if (error) setMessage(error.message);
    else {
      setMessage("Produto salvo com sucesso.");
      reset();
      load();
    }
  }

  async function remove(id) {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await deleteProduct(id);
    if (error) setMessage(error.message);
    else load();
  }

  return (
    <main className="admin">
      <header className="admin-header">
        <div><strong>ACHADEX</strong><span>Painel administrativo</span></div>
        <div className="admin-user">{user?.email}<button onClick={signOut}><LogOut size={17}/> Sair</button></div>
      </header>

      <div className="admin-content">
        <section className="stats">
          <div className="stat"><Package/><span>Produtos</span><strong>{stats.products}</strong></div>
          <div className="stat"><MousePointerClick/><span>Cliques</span><strong>{stats.clicks}</strong></div>
        </section>

        <section className="admin-card">
          <div className="card-title"><div><h2>{editing ? "Editar produto" : "Cadastrar produto"}</h2><p>Os produtos publicados aparecem automaticamente na vitrine.</p></div>{editing && <button className="secondary" onClick={reset}>Cancelar</button>}</div>
          <form className="product-form" onSubmit={submit}>
            <label>Nome do produto<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required /></label>
            <label>Preço<input type="number" step="0.01" value={form.price} onChange={e => setForm({...form,price:e.target.value})} required /></label>
            <label>Categoria<input value={form.category} onChange={e => setForm({...form,category:e.target.value})} placeholder="Ex.: Casa" /></label>
            <label>
  Imagem do produto
  <input
    type="file"
    accept="image/*"
    disabled={uploadingImage}
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setUploadingImage(true);
        setMessage("");

        const url = await uploadProductImage(file);

        setForm({ ...form, image_url: url });
        setMessage("Imagem enviada com sucesso!");
      } catch (error) {
        setMessage(error.message);
      } finally {
        setUploadingImage(false);
      }
    }}
  />

  {uploadingImage && <small>Enviando imagem...</small>}

  {form.image_url && (
    <img
      src={form.image_url}
      alt="Prévia"
      style={{
        width: "120px",
        height: "120px",
        objectFit: "contain",
        marginTop: "10px"
      }}
    />
  )}
</label>
            <label>Link da oferta / afiliado<input value={form.affiliate_url} onChange={e => setForm({...form,affiliate_url:e.target.value})} placeholder="https://..." required /></label>
            <label className="full">Descrição<textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows="3" /></label>
            <label className="check"><input type="checkbox" checked={form.published} onChange={e => setForm({...form,published:e.target.checked})}/> Publicado na vitrine</label>
            <label className="check"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form,is_featured:e.target.checked})}/> Produto em destaque</label>
            <button className="primary full" disabled={saving}>{saving ? "SALVANDO..." : editing ? "SALVAR ALTERAÇÕES" : "CADASTRAR PRODUTO"}</button>
          </form>
          {message && <div className="notice">{message}</div>}
        </section>

        <section className="admin-card">
          <div className="card-title"><div><h2>Produtos</h2><p>Gerencie o conteúdo da sua vitrine.</p></div></div>
          <div className="table-wrap">
            <table><thead><tr><th>Produto</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>{products.map(p => <tr key={p.id}><td><strong>{p.name}</strong><small>{p.category}</small></td><td>R$ {Number(p.price).toFixed(2).replace(".", ",")}</td><td><span className={p.published ? "status on" : "status"}>{p.published ? "Publicado" : "Oculto"}</span></td><td className="actions"><button onClick={() => edit(p)}><Pencil size={17}/></button><button onClick={() => remove(p.id)}><Trash2 size={17}/></button>{p.affiliate_url && <a href={p.affiliate_url} target="_blank" rel="noreferrer"><ExternalLink size={17}/></a>}</td></tr>)}</tbody></table>
          </div>
        </section>
      </div>
    </main>
  );
}