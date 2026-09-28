import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured =
  Boolean(url) &&
  Boolean(key) &&
  !url.includes("SEU-PROJETO") &&
  !key.includes("SUA_CHAVE");

export const supabase = supabaseConfigured
  ? createClient(url, key)
  : null;