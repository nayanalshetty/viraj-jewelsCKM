import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./AdminProducts.css";

const emptyForm = {
  id: null,
  name: "",
  sku: "",
  category_id: "",
  metal_type: "gold",
  gender: "Women",
  purity: "22K",
  weight: "",
  making_charge: "",
  gst: "",
  stock: "1",
  short_description: "",
  description: "",
  is_featured: false,
  is_active: true,
  images: [],
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getStoragePath(imageUrl) {
  if (!imageUrl) return null;

  const marker =
    "/storage/v1/object/public/product-images/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) return null;

  return imageUrl
    .slice(index + marker.length)
    .split("?")[0];
}

export default function AdminProducts() {
  const { user } = useAuth();

  const fileRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);

  const [search, setSearch] = useState("");
  const [filterMetal, setFilterMetal] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const [
        productsResponse,
        categoriesResponse,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*, categories(name, slug)")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("categories")
          .select("*")
          .order("name"),
      ]);

      if (productsResponse.error) {
        throw productsResponse.error;
      }

      if (categoriesResponse.error) {
        throw categoriesResponse.error;
      }

      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error("Admin product loading error:", error);

      setMessage(
        error?.message || "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        [product.name, product.sku, product.slug].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(q)
        );

      const matchesMetal =
        filterMetal === "all" ||
        String(product.metal_type || "").toLowerCase() ===
          filterMetal;

      return matchesSearch && matchesMetal;
    });
  }, [products, search, filterMetal]);

  function setField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function startEdit(product) {
    setMessage("");

    try {
      const {
        data: images,
        error,
      } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", product.id)
        .order("order", {
          ascending: true,
        });

      if (error) throw error;

      setForm({
        id: product.id,
        name: product.name || "",
        sku: product.sku || "",
        category_id: product.category_id || "",
        metal_type: product.metal_type || "gold",
        gender: product.gender || "Women",
        purity: product.purity || "22K",
        weight: product.weight ?? "",
        making_charge: product.making_charge ?? "",
        gst: product.gst ?? "",
        stock: product.stock ?? "1",
        short_description: product.short_description || "",
        description: product.description || "",
        is_featured: !!product.is_featured,
        is_active: product.is_active !== false,
        images: images || [],
      });

      setFiles([]);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Edit product error:", error);

      setMessage(
        error?.message || "Unable to load product images."
      );
    }
  }

  async function deleteProductImage(image) {
    if (!image?.id) return;

    const confirmed = window.confirm(
      "Delete this image from the product?"
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const storagePath = getStoragePath(image.image_url);

      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove([storagePath]);

        if (storageError) {
          console.warn(
            "Storage image deletion warning:",
            storageError
          );
        }
      }

      const { error: imageDbError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", image.id);

      if (imageDbError) {
        throw imageDbError;
      }

      setForm((current) => ({
        ...current,
        images: current.images.filter(
          (item) => item.id !== image.id
        ),
      }));

      setMessage("Product image deleted successfully.");
    } catch (error) {
      console.error(
        "Delete product image error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to delete product image."
      );
    }
  }

  async function uploadImages(productId, selectedFiles) {
    if (!selectedFiles.length) return [];

    const uploaded = [];

    for (const file of selectedFiles) {
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-");

      const path = `${productId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      uploaded.push(publicUrlData.publicUrl);
    }

    return uploaded;
  }

  async function saveProduct(event) {
    event.preventDefault();

    setMessage("");

    if (!form.name.trim()) {
      setMessage("Please enter a product name.");
      return;
    }

    if (!form.category_id) {
      setMessage("Please select a category.");
      return;
    }

    if (!form.weight) {
      setMessage("Please enter the product weight.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),

        slug:
          slugify(form.name) +
          (form.sku
            ? `-${slugify(form.sku)}`
            : ""),

        category_id: form.category_id,
        metal_type: form.metal_type,
        gender: form.gender,

        purity:
          form.metal_type === "silver"
            ? "Silver"
            : form.purity,

        sku: form.sku.trim() || null,
        weight: Number(form.weight),

        making_charge:
          form.making_charge === ""
            ? 0
            : Number(form.making_charge),

        gst:
          form.gst === ""
            ? 0
            : Number(form.gst),

        stock: Number(form.stock || 0),

        short_description:
          form.short_description.trim() || null,

        description:
          form.description.trim() || null,

        is_featured: !!form.is_featured,
        is_active: !!form.is_active,

        price: 0,
      };

      let productId = form.id;

      if (form.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", form.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;

        productId = data.id;
      }

      const imageUrls = await uploadImages(
        productId,
        files
      );

      if (imageUrls.length) {
        const existingImageCount = form.images.length;

        const rows = imageUrls.map(
          (image_url, index) => ({
            product_id: productId,
            image_url,
            order: existingImageCount + index,
          })
        );

        const { error } = await supabase
          .from("product_images")
          .insert(rows);

        if (error) throw error;
      }

      setMessage(
        form.id
          ? "Product updated successfully."
          : "Product published successfully."
      );

      setForm(emptyForm);
      setFiles([]);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      await load();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Save product error:", error);

      setMessage(
        error?.message || "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id) {
    const confirmed = window.confirm(
      "Delete this product and its image records?"
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const { error: imageError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", id);

      if (imageError) throw imageError;

      const { error: productError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (productError) throw productError;

      setMessage("Product deleted successfully.");

      await load();
    } catch (error) {
      console.error("Delete product error:", error);

      setMessage(
        error?.message || "Unable to delete product."
      );
    }
  }

  function cancelEdit() {
    setForm(emptyForm);
    setFiles([]);

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    setMessage("");
  }

  return (
    <main className="admin-products-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            VIRAJ JEWELLERY · CATALOGUE
          </p>

          <h1>Product Management</h1>

          <p>
            Add products the easy way — like publishing a post.
          </p>
        </div>

        <div className="admin-page-actions">
          <Link
            to="/admin"
            className="admin-light-button"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      <section className="admin-product-editor">
        <div className="admin-editor-heading">
          <div>
            <p className="admin-eyebrow">
              {form.id ? "EDIT PRODUCT" : "NEW PRODUCT"}
            </p>

            <h2>
              {form.id
                ? "Update jewellery"
                : "Publish jewellery"}
            </h2>
          </div>

          {form.id && (
            <button
              type="button"
              className="admin-light-button"
              onClick={cancelEdit}
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={saveProduct}>
          {form.id && form.images.length > 0 && (
            <div className="admin-existing-images">
              <div className="admin-existing-images-heading">
                <div>
                  <p className="admin-eyebrow">
                    CURRENT PHOTOS
                  </p>

                  <h3>Product images</h3>
                </div>

                <span>
                  {form.images.length} image
                  {form.images.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="admin-existing-images-grid">
                {form.images.map((image, index) => (
                  <div
                    className="admin-existing-image-card"
                    key={image.id}
                  >
                    <div className="admin-existing-image-number">
                      {index + 1}
                    </div>

                    <img
                      src={image.image_url}
                      alt={`Product image ${index + 1}`}
                    />

                    <button
                      type="button"
                      className="admin-delete-image-button"
                      onClick={() =>
                        deleteProductImage(image)
                      }
                    >
                      🗑 Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="admin-upload-zone"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) =>
                setFiles(
                  Array.from(
                    event.target.files || []
                  )
                )
              }
            />

            <div className="upload-icon">＋</div>

            <strong>
              {files.length
                ? `${files.length} image${
                    files.length > 1 ? "s" : ""
                  } selected`
                : "Add product photos"}
            </strong>

            <span>
              Click to select one or multiple edited jewellery
              images
            </span>

            {files.length > 0 && (
              <div className="upload-file-list">
                {files.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="admin-form-grid">
            <label>
              Product name

              <input
                value={form.name}
                onChange={(event) =>
                  setField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="e.g. Lakshmi Gold Necklace"
              />
            </label>

            <label>
              Product code / SKU

              <input
                value={form.sku}
                onChange={(event) =>
                  setField(
                    "sku",
                    event.target.value
                  )
                }
                placeholder="VJ-NK-001"
              />
            </label>

            <label>
              Metal

              <select
                value={form.metal_type}
                onChange={(event) =>
                  setField(
                    "metal_type",
                    event.target.value
                  )
                }
              >
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
              </select>
            </label>

            <label>
              Category

              <select
                value={form.category_id}
                onChange={(event) =>
                  setField(
                    "category_id",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Weight (grams)

              <input
                type="number"
                step="0.001"
                min="0"
                value={form.weight}
                onChange={(event) =>
                  setField(
                    "weight",
                    event.target.value
                  )
                }
                placeholder="4.250"
              />
            </label>

            <label>
              Purity

              <select
                disabled={
                  form.metal_type === "silver"
                }
                value={
                  form.metal_type === "silver"
                    ? "Silver"
                    : form.purity
                }
                onChange={(event) =>
                  setField(
                    "purity",
                    event.target.value
                  )
                }
              >
                <option>24K</option>
                <option>22K</option>
                <option>18K</option>
              </select>
            </label>

            <label>
              Gender

              <select
                value={form.gender}
                onChange={(event) =>
                  setField(
                    "gender",
                    event.target.value
                  )
                }
              >
                <option>Women</option>
                <option>Men</option>
                <option>Kids</option>
                <option>Unisex</option>
              </select>
            </label>

            <label>
              Stock

              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) =>
                  setField(
                    "stock",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Making charge

              <input
                type="number"
                step="0.01"
                min="0"
                value={form.making_charge}
                onChange={(event) =>
                  setField(
                    "making_charge",
                    event.target.value
                  )
                }
                placeholder="Optional"
              />
            </label>

            <label>
              GST %

              <input
                type="number"
                step="0.01"
                min="0"
                value={form.gst}
                onChange={(event) =>
                  setField(
                    "gst",
                    event.target.value
                  )
                }
                placeholder="Optional"
              />
            </label>

            <label className="wide">
              Short description

              <input
                value={form.short_description}
                onChange={(event) =>
                  setField(
                    "short_description",
                    event.target.value
                  )
                }
                placeholder="Short description of the jewellery"
              />
            </label>

            <label className="wide">
              Description

              <textarea
                rows="4"
                value={form.description}
                onChange={(event) =>
                  setField(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Detailed product description"
              />
            </label>
          </div>

          <div className="admin-checks">
            <label>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setField(
                    "is_active",
                    event.target.checked
                  )
                }
              />
              Published / active
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) =>
                  setField(
                    "is_featured",
                    event.target.checked
                  )
                }
              />
              Featured product
            </label>
          </div>

          <button
            type="submit"
            className="admin-publish-button"
            disabled={saving}
          >
            {saving
              ? "PUBLISHING…"
              : form.id
              ? "SAVE PRODUCT"
              : "PUBLISH PRODUCT"}
          </button>
        </form>
      </section>

      <section className="admin-product-list">
        <div className="admin-list-toolbar">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search product or SKU…"
          />

          <select
            value={filterMetal}
            onChange={(event) =>
              setFilterMetal(event.target.value)
            }
          >
            <option value="all">All metals</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>

          <button
            type="button"
            className="admin-light-button"
            onClick={load}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-empty-state">
            Loading products…
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="admin-empty-state">
            No products yet. Publish your first jewellery
            product above.
          </div>
        ) : (
          <div className="admin-product-table">
            <div className="admin-table-row admin-table-head">
              <span>Product</span>
              <span>Metal</span>
              <span>Weight</span>
              <span>Stock</span>
              <span>Actions</span>
            </div>

            {visibleProducts.map((product) => (
              <div
                className="admin-table-row"
                key={product.id}
              >
                <span>
                  <strong>{product.name}</strong>
                  <small>
                    {product.sku || "No SKU"}
                  </small>
                </span>

                <span>
                  {product.metal_type}
                </span>

                <span>
                  {product.weight} g
                </span>

                <span>
                  {product.stock ?? 0}
                </span>

                <span className="admin-row-actions">
                  <button
                    type="button"
                    onClick={() =>
                      startEdit(product)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      deleteProduct(product.id)
                    }
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}