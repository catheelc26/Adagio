import { createClient } from "@supabase/supabase-js";

// Config del proyecto de Supabase — se completa con variables de entorno
// (ver .env.example). No hace falta tocar este archivo: solo crear un
// archivo .env con la URL y la "anon key" de tu proyecto Supabase.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseReady = Boolean(url && anonKey);

export const supabase = supabaseReady ? createClient(url, anonKey) : null;
