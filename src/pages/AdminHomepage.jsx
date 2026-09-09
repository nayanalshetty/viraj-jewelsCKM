import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import "./AdminHomepage.css";

const emptyForm = {
  id: null,
  media_type: "photo",
  title: "",
  subtitle: "",
  link_url: "/category",
  display_order: 1,
  is_published: true,
  media_url: "",
};

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(url || ""));
}

function getStoragePath(url) {
  const marker = "/storage/v1/object/public/homepage-media/";
  const index = String(url || "").indexOf(marker);
  if (index === -1) return null;
  return String(url).slice(index + marker.length).split("?")[0];
}

export default function AdminHomepage() {
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("homepage_media")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const publishedCount = useMemo(
    () => items.filter((item) => item.is_published).length,
    [items]
  );

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm({ ...emptyForm, display_order: Math.max(items.length + 1, 1) });
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function editItem(item) {
    setMessage("");
    setForm({
      id: item.id,
      media_type: item.media_type || "photo",
      title: item.title || "",
      subtitle: item.subtitle || "",
      link_url: item.link_url || "/category",
      display_order: item.display_order ?? 1,
      is_published: item.is_published !== false,
      media_url: item.media_url || "",
    });
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadFile() {
    if (!file) return form.media_url;

    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");
    const path = `homepage/${Date.now()}-${safeName || `media.${extension}`}`;

    const { error } = await supabase.storage
      .from("homepage-media")
      .upload(path, file, { upsert: false, contentType: file.type || undefined });

    if (error) throw error;

    const { data } = supabase.storage
      .from("homepage-media")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function saveItem(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      if (!file && !form.media_url) {
        throw new Error("Choose a photo or video first.");
      }

      const mediaUrl = await uploadFile();
      const payload = {
        media_type: form.media_type,
        title: form.title.trim() || null,
        subtitle: form.subtitle.trim() || null,
        link_url: form.link_url.trim() || "/category",
        display_order: Number(form.display_order) || 1,
        is_published: !!form.is_published,
        media_url: mediaUrl,
      };

      if (form.id) {
        const { error } = await supabase
          .from("homepage_media")
          .update(payload)
          .eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("homepage_media")
          .insert(payload);
        if (error) throw error;
      }

      setMessage(form.id ? "Homepage media updated." : "Homepage media published.");
      resetForm();
      await load();
    } catch (error) {
      console.error("Homepage media save error:", error);
      setMessage(error?.message || "Unable to save homepage media.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item) {
    const { error } = await supabase
      .from("homepage_media")
      .update({ is_published: !item.is_published })
      .eq("id", item.id);
    if (error) setMessage(error.message);
    else load();
  }

  async function deleteItem(item) {
    if (!window.confirm("Remove this homepage media?")) return;
    setMessage("");

    try {
      const path = getStoragePath(item.media_url);
      if (path) {
        await supabase.storage.from("homepage-media").remove([path]);
      }

      const { error } = await supabase
        .from("homepage_media")
        .delete()
        .eq("id", item.id);
      if (error) throw error;
      await load();
    } catch (error) {
      setMessage(error?.message || "Unable to delete media.");
    }
  }

  return (
    <main className="admin-homepage">
      <header className="admin-homepage-header">
        <div>
          <p className="admin-eyebrow">VIRAJ JEWELLERY · HOMEPAGE</p>
          <h1>Homepage Media</h1>
          <p>Add a fresh photo or video whenever you want. Published items appear in the compact animated story after Categories.</p>
        </div>
        <Link to="/admin" className="admin-light-button">← Dashboard</Link>
      </header>

      <section className="homepage-media-layout">
        <form className="homepage-media-form" onSubmit={saveItem}>
          <div className="homepage-form-heading">
            <div>
              <span>CONTENT</span>
              <h2>{form.id ? "Edit homepage media" : "Add new media"}</h2>
            </div>
            {form.id && <button type="button" className="homepage-text-button" onClick={resetForm}>New</button>}
          </div>

          <label>Media type
            <select value={form.media_type} onChange={(e) => setField("media_type", e.target.value)}>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </label>

          <label>Photo / video
            <input
              ref={fileRef}
              type="file"
              accept={form.media_type === "video" ? "video/mp4,video/webm,video/ogg,video/quicktime" : "image/*"}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <small>{file ? file.name : "Choose a file from your computer"}</small>
          </label>

          <div className="homepage-two-col">
            <label>Small title
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Crafted for your moments" />
            </label>
            <label>Order
              <input type="number" min="1" value={form.display_order} onChange={(e) => setField("display_order", e.target.value)} />
            </label>
          </div>

          <label>Short line
            <input value={form.subtitle} onChange={(e) => setField("subtitle", e.target.value)} placeholder="Discover the new Viraj edit" />
          </label>

          <label>Click link
            <input value={form.link_url} onChange={(e) => setField("link_url", e.target.value)} placeholder="/category" />
          </label>

          <label className="homepage-check">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setField("is_published", e.target.checked)} />
            <span>Show this on the homepage</span>
          </label>

          <button className="homepage-save-button" type="submit" disabled={saving}>
            {saving ? "Saving…" : form.id ? "Save changes" : "Add to homepage"}
          </button>

          {message && <p className="homepage-admin-message">{message}</p>}
        </form>

        <section className="homepage-media-list">
          <div className="homepage-list-heading">
            <div>
              <span>LIVE CONTENT</span>
              <h2>{publishedCount} published</h2>
            </div>
            <small>{items.length} total</small>
          </div>

          {loading ? <div className="homepage-empty">Loading…</div> : items.length === 0 ? (
            <div className="homepage-empty">No homepage media yet. Add your first photo or video.</div>
          ) : (
            <div className="homepage-media-items">
              {items.map((item) => (
                <article className={`homepage-media-item ${item.is_published ? "is-live" : "is-hidden"}`} key={item.id}>
                  <div className="homepage-media-thumb">
                    {item.media_type === "video" || isVideo(item.media_url) ? (
                      <video src={item.media_url} muted playsInline preload="metadata" />
                    ) : (
                      <img src={item.media_url} alt={item.title || "Homepage media"} />
                    )}
                    <span>{item.media_type}</span>
                  </div>
                  <div className="homepage-media-info">
                    <strong>{item.title || "Untitled media"}</strong>
                    <p>{item.subtitle || "No supporting line"}</p>
                    <small>Order {item.display_order} · {item.is_published ? "Live" : "Hidden"}</small>
                  </div>
                  <div className="homepage-media-actions">
                    <button type="button" onClick={() => togglePublished(item)}>{item.is_published ? "Hide" : "Publish"}</button>
                    <button type="button" onClick={() => editItem(item)}>Edit</button>
                    <button type="button" className="danger" onClick={() => deleteItem(item)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
