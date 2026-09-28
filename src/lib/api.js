import { supabase } from "./supabase";

export async function getPublicProducts({ search = "", category = "Todas" } = {}) {
  if (!supabase) return { data: [], error: null };

  let query = supabase
    .from("products")
    .select("id,name,description,price,image_url,affiliate_url,category,is_featured,created_at")
    .eq("published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (category && category !== "Todas") query = query.eq("category", category);
  if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);

  return query;
}

export async function getCategories() {
  if (!supabase) return { data: [], error: null };
  return supabase.from("categories").select("id,name").order("name");
}

export async function recordClick(productId) {
  if (!supabase) return;
  await supabase.from("clicks").insert({ product_id: productId });
}

export async function getAdminProducts() {
  return supabase.from("products").select("*").order("created_at", { ascending: false });
}

export async function saveProduct(product) {
  if (product.id) {
    const { id, created_at, ...payload } = product;
    return supabase.from("products").update(payload).eq("id", id).select().single();
  }
  return supabase.from("products").insert(product).select().single();
}

export async function deleteProduct(id) {
  return supabase.from("products").delete().eq("id", id);
}

export async function getStats() {
  const [{ count: products }, { count: clicks }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("clicks").select("*", { count: "exact", head: true })
  ]);
  return { products: products || 0, clicks: clicks || 0 };
}