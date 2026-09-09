import { supabase } from "./supabase";

export async function fetchPlayers() {
  const { data, error } = await supabase.from("players").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function fetchReferees() {
  const { data, error } = await supabase.from("referees").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function replacePlayers(rows) {
  const { error: delErr } = await supabase.from("players").delete().not("id", "is", null);
  if (delErr) throw delErr;
  if (rows.length) {
    const { error } = await supabase.from("players").insert(rows);
    if (error) throw error;
  }
}

export async function replaceReferees(rows) {
  const { error: delErr } = await supabase.from("referees").delete().not("id", "is", null);
  if (delErr) throw delErr;
  if (rows.length) {
    const { error } = await supabase.from("referees").insert(rows);
    if (error) throw error;
  }
}

export async function addPlayer(row) {
  const { error } = await supabase.from("players").insert(row);
  if (error) throw error;
}

export async function deletePlayer(id) {
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw error;
}

export async function addReferee(row) {
  const { error } = await supabase.from("referees").insert(row);
  if (error) throw error;
}

export async function deleteReferee(id) {
  const { error } = await supabase.from("referees").delete().eq("id", id);
  if (error) throw error;
}
