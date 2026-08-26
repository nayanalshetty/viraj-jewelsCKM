import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import "./AdminCategories.css";

const blank = { name:"", slug:"", metal_type:"gold" };

function slugify(v){return v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}

export default function AdminCategories(){
  const [categories,setCategories]=useState([]);
  const [form,setForm]=useState(blank);
  const [editing,setEditing]=useState(null);
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    const {data,error}=await supabase.from("categories").select("*").order("name");
    if(error)setMessage(error.message);
    setCategories(data||[]);
    setLoading(false);
  }
  useEffect(()=>{load()},[]);

  async function save(e){
    e.preventDefault(); setMessage("");
    if(!form.name.trim()) return setMessage("Category name is required.");
    const payload={name:form.name.trim(),slug:slugify(form.slug||form.name),metal_type:form.metal_type};
    const result=editing
      ? await supabase.from("categories").update(payload).eq("id",editing)
      : await supabase.from("categories").insert(payload);
    if(result.error){setMessage(result.error.message);return;}
    setMessage(editing?"Category updated.":"Category created.");
    setForm(blank);setEditing(null);load();
  }
  async function remove(id){
    if(!confirm("Delete this category? Products already linked to it may prevent deletion."))return;
    const {error}=await supabase.from("categories").delete().eq("id",id);
    if(error)setMessage(error.message);else{setMessage("Category deleted.");load();}
  }

  return <main className="admin-categories-page">
    <header className="admin-page-header">
      <div><p className="admin-eyebrow">VIRAJ JEWELLERY · CATALOGUE</p><h1>Category Management</h1><p>Create a new category whenever Viraj launches a new jewellery collection.</p></div>
      <Link to="/admin" className="admin-light-button">← Dashboard</Link>
    </header>
    {message&&<div className="admin-message">{message}</div>}
    <section className="admin-category-layout">
      <form className="admin-category-form" onSubmit={save}>
        <p className="admin-eyebrow">{editing?"EDIT CATEGORY":"NEW CATEGORY"}</p>
        <h2>{editing?"Update category":"Add category"}</h2>
        <label>Category name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Bridal Jewellery"/></label>
        <label>Slug<input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="bridal-jewellery"/></label>
        <label>Metal<select value={form.metal_type} onChange={e=>setForm({...form,metal_type:e.target.value})}><option value="gold">Gold</option><option value="silver">Silver</option></select></label>
        <div className="category-form-actions"><button className="admin-publish-button">{editing?"SAVE CATEGORY":"CREATE CATEGORY"}</button>{editing&&<button type="button" className="admin-light-button" onClick={()=>{setEditing(null);setForm(blank)}}>Cancel</button>}</div>
      </form>
      <section className="admin-category-list">
        <div className="category-list-head"><h2>Existing categories</h2><button className="admin-light-button" onClick={load}>↻ Refresh</button></div>
        {loading?<div className="admin-empty-state">Loading categories…</div>:categories.map(c=><div className="category-row" key={c.id}><div><strong>{c.name}</strong><span>{c.slug}</span></div><span className={`metal-tag ${String(c.metal_type||"").toLowerCase()}`}>{c.metal_type||"—"}</span><div><button onClick={()=>{setEditing(c.id);setForm({name:c.name||"",slug:c.slug||"",metal_type:c.metal_type||"gold"})}}>Edit</button><button className="danger" onClick={()=>remove(c.id)}>Delete</button></div></div>)}
      </section>
    </section>
  </main>
}
