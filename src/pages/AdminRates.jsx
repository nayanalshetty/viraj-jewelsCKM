import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./AdminRates.css";

export default function AdminRates(){
  const {user}=useAuth();
  const [role,setRole]=useState(null);
  const [rates,setRates]=useState({rate_24k:"",rate_22k:"",rate_18k:"",silver_rate:"",effective_date:new Date().toISOString().slice(0,10)});
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [message,setMessage]=useState("");

  async function load(){
    setLoading(true);
    const [r,roleResult]=await Promise.all([
      supabase.from("gold_rates").select("*").order("effective_date",{ascending:false}).limit(1).maybeSingle(),
      supabase.from("admin_roles").select("role").eq("user_id",user?.id).maybeSingle()
    ]);
    setRole(roleResult.data?.role||"manager");
    if(r.data)setRates({
      rate_24k:r.data.rate_24k??"",rate_22k:r.data.rate_22k??"",rate_18k:r.data.rate_18k??"",
      silver_rate:r.data.silver_rate??"",effective_date:r.data.effective_date?.slice(0,10)||new Date().toISOString().slice(0,10)
    });
    if(r.error&&r.error.code!=="PGRST116")setMessage(r.error.message);
    setLoading(false);
  }
  useEffect(()=>{if(user?.id)load()},[user?.id]);

  if(!loading&&role!=="owner")return <main className="admin-rates-page"><div className="admin-forbidden"><p className="admin-eyebrow">OWNER ONLY</p><h1>Gold & Silver Rates</h1><p>Your account is not assigned the <strong>owner</strong> role. This protects the daily rates from accidental changes.</p><Link to="/admin" className="admin-dark-button">← Back to Dashboard</Link></div></main>;

  async function save(e){
    e.preventDefault();setSaving(true);setMessage("");
    try{
      const payload={rate_24k:Number(rates.rate_24k),rate_22k:Number(rates.rate_22k),rate_18k:Number(rates.rate_18k),silver_rate:Number(rates.silver_rate),effective_date:rates.effective_date};
      const {error}=await supabase.from("gold_rates").insert(payload);
      if(error)throw error;
      setMessage("Today's Gold & Silver rates were saved.");
      await load();
    }catch(e){setMessage(e.message||"Unable to save rates.");}finally{setSaving(false);}
  }

  return <main className="admin-rates-page"><header className="admin-page-header"><div><p className="admin-eyebrow">OWNER · DAILY PRICING</p><h1>Gold & Silver Rates</h1><p>Update the rates once. The customer website can use the latest effective rate.</p></div><Link to="/admin" className="admin-light-button">← Dashboard</Link></header>
  {message&&<div className="admin-message">{message}</div>}
  <form className="rates-card" onSubmit={save}>
    <div className="rate-grid">
      <label>24K Gold / gram<input type="number" step="0.01" min="0" value={rates.rate_24k} onChange={e=>setRates({...rates,rate_24k:e.target.value})}/></label>
      <label>22K Gold / gram<input type="number" step="0.01" min="0" value={rates.rate_22k} onChange={e=>setRates({...rates,rate_22k:e.target.value})}/></label>
      <label>18K Gold / gram<input type="number" step="0.01" min="0" value={rates.rate_18k} onChange={e=>setRates({...rates,rate_18k:e.target.value})}/></label>
      <label>Silver / gram<input type="number" step="0.01" min="0" value={rates.silver_rate} onChange={e=>setRates({...rates,silver_rate:e.target.value})}/></label>
      <label>Effective date<input type="date" value={rates.effective_date} onChange={e=>setRates({...rates,effective_date:e.target.value})}/></label>
    </div>
    <div className="rate-note"><strong>Pricing rule</strong><span>Products store their weight. Final display pricing should use the latest applicable metal rate rather than a permanently fixed gold price.</span></div>
    <button className="admin-publish-button" disabled={saving}>{saving?"SAVING…":"SAVE TODAY'S RATES"}</button>
  </form>
  </main>
}
