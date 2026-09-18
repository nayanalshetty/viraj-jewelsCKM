
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import categoryCatalog from "../data/categories.js";
import "./AdminHomepage.css";

const placements = [
  {
    value: "hero",
    label: "Hero animation",
    help: "Large photo/video slideshow on the homepage.",
  },
  {
    value: "editorial",
    label: "Small collection boxes",
    help: "Images for New Arrivals, Bridal Edit and other collections.",
  },
  {
    value: "campaign",
    label: "Campaign banner",
    help: "Festival and promotional banner.",
  },
  {
    value: "category",
    label: "Category circle",
    help: "Image shown inside a category circle.",
  },
];

const editorialCatalog = [
  { key: "new-arrivals", label: "New Arrivals" },
  { key: "best-sellers", label: "Best Sellers" },
  { key: "festival-edit", label: "Festival Edit" },
  { key: "bridal-edit", label: "Bridal Edit" },
  { key: "daily-luxury", label: "Daily Luxury" },
  { key: "silver-stories", label: "Silver Stories" },
  { key: "gifting", label: "Gifting" },
];

const emptyForm = {
  id: null,
  placement: "hero",
  target_key: "",
  media_type: "photo",
  title: "",
  eyebrow: "",
  subtitle: "",
  link_url: "/category",
  display_order: 1,
  is_published: true,
  media_url: "",
};

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(
    String(url || "")
  );
}

function getStoragePath(url) {
  const marker =
    "/storage/v1/object/public/homepage-media/";

  const index = String(url || "").indexOf(marker);

  if (index === -1) return null;

  return String(url)
    .slice(index + marker.length)
    .split("?")[0];
}

function getCategoryName(slug) {
  const category = categoryCatalog.find(
    (item) => item.slug === slug
  );

  return category?.name || slug || "Category image";
}

function getEditorialName(key) {
  const collection = editorialCatalog.find(
    (item) => item.key === key
  );

  return collection?.label || key || "Collection box";
}

function getItemLabel(item) {
  if (item.placement === "category") {
    return getCategoryName(item.target_key);
  }

  if (item.placement === "editorial") {
    return getEditorialName(item.target_key);
  }

  return item.title || "Untitled item";
}

export default function AdminHomepage() {
  const fileRef = useRef(null);

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("homepage_media")
      .select("*")
      .order("placement")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  const publishedCount = useMemo(() => {
    return items.filter((item) => item.is_published).length;
  }, [items]);

  const groupedItems = useMemo(() => {
    return placements.map((placement) => ({
      ...placement,
      items: items.filter(
        (item) =>
          (item.placement || "hero") === placement.value
      ),
    }));
  }, [items]);

  function setField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      display_order: Math.max(items.length + 1, 1),
    });

    setFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function handlePlacementChange(value) {
    setForm((current) => ({
      ...current,
      placement: value,
      target_key: "",
      media_type:
        value === "category"
          ? "photo"
          : current.media_type,
    }));
  }

  function editItem(item) {
    setMessage("");

    setForm({
      id: item.id,
      placement: item.placement || "hero",
      target_key: item.target_key || "",
      media_type: item.media_type || "photo",
      title: item.title || "",
      eyebrow: item.eyebrow || "",
      subtitle: item.subtitle || "",
      link_url: item.link_url || "/category",
      display_order: item.display_order ?? 1,
      is_published: item.is_published !== false,
      media_url: item.media_url || "",
    });

    setFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadFile() {
    if (!file) {
      return form.media_url;
    }

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

    const path = `homepage/${Date.now()}-${
      safeName || "media"
    }`;

    const { error } = await supabase.storage
      .from("homepage-media")
      .upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });

    if (error) {
      throw error;
    }

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
        throw new Error(
          "Please choose a photo or video first."
        );
      }

      if (
        ["category", "editorial"].includes(
          form.placement
        ) &&
        !form.target_key
      ) {
        throw new Error(
          form.placement === "category"
            ? "Please choose a category."
            : "Please choose a collection box."
        );
      }

      const mediaUrl = await uploadFile();

      const payload = {
        placement: form.placement,

        // Important:
        // Editorial AND category both need target_key.
        target_key: [
          "category",
          "editorial",
        ].includes(form.placement)
          ? form.target_key
          : null,

        media_type: form.media_type,

        title: form.title.trim() || null,

        eyebrow: form.eyebrow.trim() || null,

        subtitle: form.subtitle.trim() || null,

        link_url:
          form.link_url.trim() || "/category",

        display_order:
          Number(form.display_order) || 1,

        is_published: !!form.is_published,

        media_url: mediaUrl,
      };

      let result;

      if (form.id) {
        result = await supabase
          .from("homepage_media")
          .update(payload)
          .eq("id", form.id);
      } else {
        result = await supabase
          .from("homepage_media")
          .insert(payload);
      }

      if (result.error) {
        throw result.error;
      }

      setMessage(
        form.id
          ? "Homepage content updated successfully."
          : "Homepage content added successfully."
      );

      resetForm();

      await loadItems();
    } catch (error) {
      console.error("Homepage save error:", error);

      setMessage(
        error?.message ||
          "Unable to save homepage content."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item) {
    const { error } = await supabase
      .from("homepage_media")
      .update({
        is_published: !item.is_published,
      })
      .eq("id", item.id);

    if (error) {
      setMessage(error.message);
    } else {
      await loadItems();
    }
  }

  async function deleteItem(item) {
    const confirmed = window.confirm(
      "Remove this homepage item?"
    );

    if (!confirmed) return;

    try {
      const storagePath = getStoragePath(
        item.media_url
      );

      if (storagePath) {
        await supabase.storage
          .from("homepage-media")
          .remove([storagePath]);
      }

      const { error } = await supabase
        .from("homepage_media")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      await loadItems();
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to delete homepage item."
      );
    }
  }

  const selectedPlacement = placements.find(
    (item) => item.value === form.placement
  );

  return (
    <main className="admin-homepage">
      <header className="admin-homepage-header">
        <div>
          <p className="admin-eyebrow">
            VIRAJ JEWELLERY · HOMEPAGE
          </p>

          <h1>Homepage Manager</h1>

          <p>
            Manage hero visuals, collection boxes,
            campaign banners and category circles.
          </p>
        </div>

        <Link
          to="/admin"
          className="admin-light-button"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="homepage-manager-summary">
        <span>{publishedCount} live items</span>
        <span>{items.length} total</span>
        <span>Homepage visual management</span>
      </div>

      <section className="homepage-media-layout">
        <form
          className="homepage-media-form"
          onSubmit={saveItem}
        >
          <div className="homepage-form-heading">
            <div>
              <span>CONTENT EDITOR</span>

              <h2>
                {form.id
                  ? "Edit homepage item"
                  : "Add homepage item"}
              </h2>
            </div>

            {form.id && (
              <button
                type="button"
                className="homepage-text-button"
                onClick={resetForm}
              >
                New
              </button>
            )}
          </div>

          <label>
            Where should this appear?

            <select
              value={form.placement}
              onChange={(event) =>
                handlePlacementChange(
                  event.target.value
                )
              }
            >
              {placements.map((placement) => (
                <option
                  key={placement.value}
                  value={placement.value}
                >
                  {placement.label}
                </option>
              ))}
            </select>

            <small>
              {selectedPlacement?.help}
            </small>
          </label>

          {form.placement === "editorial" && (
            <label>
              Collection box

              <select
                value={form.target_key}
                onChange={(event) =>
                  setField(
                    "target_key",
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Choose collection box
                </option>

                {editorialCatalog.map((collection) => (
                  <option
                    key={collection.key}
                    value={collection.key}
                  >
                    {collection.label}
                  </option>
                ))}
              </select>

              <small>
                Select the exact collection box
                where the image should appear.
              </small>
            </label>
          )}

          {form.placement === "category" && (
            <label>
              Category

              <select
                value={form.target_key}
                onChange={(event) =>
                  setField(
                    "target_key",
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Choose category
                </option>

                {categoryCatalog.map((category) => (
                  <option
                    key={category.slug}
                    value={category.slug}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Media type

            <select
              value={form.media_type}
              onChange={(event) =>
                setField(
                  "media_type",
                  event.target.value
                )
              }
            >
              <option value="photo">Photo</option>

              {form.placement !== "category" && (
                <option value="video">Video</option>
              )}
            </select>
          </label>

          <label>
            Upload photo / video

            <input
              ref={fileRef}
              type="file"
              accept={
                form.media_type === "video"
                  ? "video/mp4,video/webm,video/ogg,video/quicktime"
                  : "image/*"
              }
              onChange={(event) =>
                setFile(
                  event.target.files?.[0] || null
                )
              }
            />

            <small>
              {file
                ? file.name
                : form.media_url
                ? "Current media will remain unless replaced."
                : "Choose a file from your computer."}
            </small>
          </label>

          <div className="homepage-two-col">
            <label>
              Title

              <input
                value={form.title}
                onChange={(event) =>
                  setField(
                    "title",
                    event.target.value
                  )
                }
                placeholder="New Arrivals"
              />
            </label>

            <label>
              Display order

              <input
                type="number"
                min="1"
                value={form.display_order}
                onChange={(event) =>
                  setField(
                    "display_order",
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <label>
            Small label / eyebrow

            <input
              value={form.eyebrow}
              onChange={(event) =>
                setField(
                  "eyebrow",
                  event.target.value
                )
              }
              placeholder="JUST IN"
            />
          </label>

          <label>
            Short supporting line

            <input
              value={form.subtitle}
              onChange={(event) =>
                setField(
                  "subtitle",
                  event.target.value
                )
              }
              placeholder="Discover the new Viraj edit"
            />
          </label>

          <label>
            Click link

            <input
              value={form.link_url}
              onChange={(event) =>
                setField(
                  "link_url",
                  event.target.value
                )
              }
              placeholder="/category"
            />
          </label>

          <label className="homepage-check">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(event) =>
                setField(
                  "is_published",
                  event.target.checked
                )
              }
            />

            <span>
              Show this on the homepage
            </span>
          </label>

          <button
            className="homepage-save-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : form.id
              ? "Save changes"
              : "Add to homepage"}
          </button>

          {message && (
            <p className="homepage-admin-message">
              {message}
            </p>
          )}
        </form>

        <section className="homepage-media-list">
          <div className="homepage-list-heading">
            <div>
              <span>LIVE HOMEPAGE CONTENT</span>

              <h2>Visuals by section</h2>
            </div>

            <small>
              Hero · Tiles · Campaign · Categories
            </small>
          </div>

          {loading ? (
            <div className="homepage-empty">
              Loading...
            </div>
          ) : (
            groupedItems.map((group) => (
              <div
                className="homepage-group"
                key={group.value}
              >
                <div className="homepage-group-title">
                  <strong>{group.label}</strong>

                  <span>
                    {group.items.length}
                  </span>
                </div>

                {group.items.length === 0 ? (
                  <div className="homepage-group-empty">
                    No items yet
                  </div>
                ) : (
                  <div className="homepage-media-items">
                    {group.items.map((item) => (
                      <article
                        className={`homepage-media-item ${
                          item.is_published
                            ? "is-live"
                            : "is-hidden"
                        }`}
                        key={item.id}
                      >
                        <div className="homepage-media-thumb">
                          {item.media_type === "video" ||
                          isVideo(item.media_url) ? (
                            <video
                              src={item.media_url}
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={item.media_url}
                              alt={
                                item.title ||
                                "Homepage media"
                              }
                            />
                          )}

                          <span>
                            {item.media_type}
                          </span>
                        </div>

                        <div className="homepage-media-info">
                          <strong>
                            {getItemLabel(item)}
                          </strong>

                          <p>
                            {item.eyebrow ||
                              item.subtitle ||
                              "No supporting text"}
                          </p>

                          <small>
                            {item.placement ===
                              "category" &&
                              `Category: ${item.target_key}`}

                            {item.placement ===
                              "editorial" &&
                              `Collection: ${item.target_key}`}

                            {item.placement !==
                              "category" &&
                              item.placement !==
                                "editorial" &&
                              `Order: ${item.display_order}`}

                            {" · "}

                            {item.is_published
                              ? "Live"
                              : "Hidden"}
                          </small>
                        </div>

                        <div className="homepage-media-actions">
                          <button
                            type="button"
                            onClick={() =>
                              togglePublished(item)
                            }
                          >
                            {item.is_published
                              ? "Hide"
                              : "Publish"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              editItem(item)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              deleteItem(item)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </section>
    </main>
  );
}