import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { supabase } from "../lib/supabase.js";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCart } from "../context/CartContext.jsx";

import "./Product.css";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [rates, setRates] = useState(null);

  const [loading, setLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(true);

  const [error, setError] = useState("");
  const [ratesError, setRatesError] = useState("");

  /* =========================================================
     ZOOM
     ========================================================= */

  const [zoom, setZoom] = useState(1);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageContainerRef = useRef(null);
  const draggingRef = useRef(false);
  const pointersRef = useRef(new Map());
  const pinchStartRef = useRef(null);
  const suppressNextClickRef = useRef(false);
  const clickTimerRef = useRef(null);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
  });

  const startPositionRef = useRef({
    x: 0,
    y: 0,
  });

  const swipeStartRef = useRef(null);

  /* =========================================================
     NUMBER HELPER
     ========================================================= */

  function toNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    const number = Number(
      String(value)
        .replace(/,/g, "")
        .replace(/[₹$]/g, "")
        .trim()
    );

    return Number.isFinite(number) ? number : 0;
  }

  /* =========================================================
     UUID CHECK
     ========================================================= */

  function isValidUUID(value) {
    if (!value) return false;

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  }

  /* =========================================================
     MEDIA TYPE
     ========================================================= */

  function isVideoMedia(media) {
    if (!media) return false;

    const type = String(
      media.media_type ||
        media.type ||
        media.mime_type ||
        ""
    ).toLowerCase();

    if (type.includes("video")) {
      return true;
    }

    const url = String(
      media.image_url ||
        media.url ||
        ""
    ).toLowerCase();

    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/.test(
      url
    );
  }

  function getMediaUrl(media) {
    return (
      media?.image_url ||
      media?.url ||
      ""
    );
  }

  /* =========================================================
     RESET ZOOM
     ========================================================= */

  function resetZoom() {
    setZoom(1);

    setPosition({
      x: 0,
      y: 0,
    });
  }

  /* =========================================================
     ZOOM IN
     ========================================================= */

  function zoomIn() {
    setZoom((current) =>
      Math.min(
        Number((current + 0.5).toFixed(2)),
        4
      )
    );
  }

  /* =========================================================
     ZOOM OUT
     ========================================================= */

  function zoomOut() {
    setZoom((current) => {
      const next = Math.max(
        Number((current - 0.5).toFixed(2)),
        1
      );

      if (next === 1) {
        setPosition({
          x: 0,
          y: 0,
        });
      }

      return next;
    });
  }

  /* =========================================================
     DOUBLE CLICK ZOOM
     ========================================================= */

  function handleDoubleClick(event) {
    event.stopPropagation();

    if (clickTimerRef.current) {
      window.clearTimeout(
        clickTimerRef.current
      );

      clickTimerRef.current = null;
    }

    suppressNextClickRef.current = false;

    setZoom((current) => {
      if (current > 1) {
        setPosition({
          x: 0,
          y: 0,
        });

        return 1;
      }

      return 2;
    });
  }

  /* =========================================================
     MOUSE WHEEL ZOOM
     ========================================================= */

  function handleWheel(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }

  /* =========================================================
     POINTER / TOUCH
     ========================================================= */

  function distanceBetweenPointers() {
    const points = Array.from(
      pointersRef.current.values()
    );

    if (points.length < 2) {
      return 0;
    }

    const [a, b] = points;

    return Math.hypot(
      b.x - a.x,
      b.y - a.y
    );
  }

  function handlePointerDown(event) {
    if (activeIsVideo) return;

    event.stopPropagation();

    pointersRef.current.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY,
      }
    );

    /* PINCH START */

    if (
      pointersRef.current.size === 2
    ) {
      const distance =
        distanceBetweenPointers();

      pinchStartRef.current = {
        distance,
        zoom,
      };

      draggingRef.current = false;
      suppressNextClickRef.current = true;

      return;
    }

    /* SWIPE START */

    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    /* DRAG WHEN ZOOMED */

    if (zoom > 1) {
      draggingRef.current = true;

      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      startPositionRef.current = {
        ...position,
      };
    }

    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );
  }

  function handlePointerMove(event) {
    if (activeIsVideo) return;

    if (
      pointersRef.current.has(
        event.pointerId
      )
    ) {
      pointersRef.current.set(
        event.pointerId,
        {
          x: event.clientX,
          y: event.clientY,
        }
      );
    }

    /* PINCH */

    if (
      pointersRef.current.size >= 2
    ) {
      const currentDistance =
        distanceBetweenPointers();

      const pinch =
        pinchStartRef.current;

      if (
        pinch?.distance > 0
      ) {
        const nextZoom = Math.max(
          1,
          Math.min(
            4,
            pinch.zoom *
              (currentDistance /
                pinch.distance)
          )
        );

        setZoom(
          Number(
            nextZoom.toFixed(2)
          )
        );
      }

      return;
    }

    /* DRAG */

    if (
      !draggingRef.current ||
      zoom <= 1
    ) {
      return;
    }

    const deltaX =
      event.clientX -
      dragStartRef.current.x;

    const deltaY =
      event.clientY -
      dragStartRef.current.y;

    if (
      Math.abs(deltaX) +
        Math.abs(deltaY) >
      4
    ) {
      suppressNextClickRef.current = true;
    }

    setPosition({
      x:
        startPositionRef.current.x +
        deltaX,

      y:
        startPositionRef.current.y +
        deltaY,
    });
  }

  function handlePointerUp(event) {
    const start =
      swipeStartRef.current;

    pointersRef.current.delete(
      event.pointerId
    );

    if (
      pointersRef.current.size < 2
    ) {
      pinchStartRef.current = null;
    }

    /* MOBILE SWIPE */

    if (
      start &&
      zoom <= 1 &&
      pointersRef.current.size === 0 &&
      images.length > 1
    ) {
      const deltaX =
        event.clientX - start.x;

      const deltaY =
        event.clientY - start.y;

      const horizontalSwipe =
        Math.abs(deltaX) > 45 &&
        Math.abs(deltaX) >
          Math.abs(deltaY);

      if (horizontalSwipe) {
        suppressNextClickRef.current =
          true;

        if (deltaX < 0) {
          nextImage();
        } else {
          previousImage();
        }
      }
    }

    swipeStartRef.current = null;
    draggingRef.current = false;

    event.currentTarget.releasePointerCapture?.(
      event.pointerId
    );
  }

  /* =========================================================
     LOAD LATEST RATES
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      setRatesLoading(true);
      setRatesError("");

      try {
        const {
          data,
          error,
        } = await supabase
          .from("gold_rates")
          .select(
            "rate_24k, rate_22k, rate_18k, silver_rate, effective_date, created_at"
          )
          .order(
            "effective_date",
            {
              ascending: false,
            }
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "No Gold & Silver rates found."
          );
        }

        if (!cancelled) {
          setRates(data);
        }
      } catch (err) {
        console.error(
          "VIRAJ RATE ERROR:",
          err
        );

        if (!cancelled) {
          setRates(null);

          setRatesError(
            err?.message ||
              "Unable to calculate product price."
          );
        }
      } finally {
        if (!cancelled) {
          setRatesLoading(false);
        }
      }
    }

    loadRates();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     LOAD SIMILAR PRODUCTS
     ========================================================= */

  async function loadSimilarProducts(
    currentProduct
  ) {
    if (
      !currentProduct?.category_id
    ) {
      setSimilarProducts([]);
      return;
    }

    try {
      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          sku,
          product_code,
          category_id,
          weight,
          purity,
          gold_purity,
          metal_type,
          metal,
          material,
          making_charge,
          gst,
          stock,
          stock_quantity,
          inventory,
          quantity,
          sold_out,
          published,
          created_at,
          product_images (
            id,
            image_url,
            "order"
          )
        `)
        .eq(
          "category_id",
          currentProduct.category_id
        )
        .eq(
          "published",
          true
        )
        .neq(
          "id",
          currentProduct.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(8);

      if (error) {
        console.error(
          "VIRAJ SIMILAR PRODUCTS ERROR:",
          error
        );

        setSimilarProducts([]);
        return;
      }

      const formatted =
        (data || []).map(
          (item) => {
            const itemImages =
              (
                item.product_images ||
                []
              )
                .filter(
                  (image) =>
                    image &&
                    image.image_url
                )
                .sort(
                  (a, b) =>
                    Number(
                      a.order ?? 0
                    ) -
                    Number(
                      b.order ?? 0
                    )
                );

            return {
              ...item,

              displayImage:
                itemImages[0]
                  ?.image_url || "",
            };
          }
        );

      setSimilarProducts(
        formatted
      );
    } catch (err) {
      console.error(
        "VIRAJ SIMILAR PRODUCTS LOAD ERROR:",
        err
      );

      setSimilarProducts([]);
    }
  }

  /* =========================================================
     LOAD PRODUCT
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!id) {
        setError(
          "Product ID is missing."
        );

        setProduct(null);
        setLoading(false);

        return;
      }

      setLoading(true);
      setError("");
      setProduct(null);
      setImages([]);
      setSimilarProducts([]);
      setActiveIndex(0);

      resetZoom();

      try {
        let productData = null;
        let productError = null;

        const uuid =
          isValidUUID(id);

        /* UUID */

        if (uuid) {
          const result =
            await supabase
              .from("products")
              .select(`
                *,
                categories (
                  id,
                  name,
                  slug
                )
              `)
              .eq("id", id)
              .limit(1);

          productData =
            result.data?.[0] ||
            null;

          productError =
            result.error;
        }

        /* SKU */

        if (
          !productData &&
          !productError
        ) {
          const result =
            await supabase
              .from("products")
              .select(`
                *,
                categories (
                  id,
                  name,
                  slug
                )
              `)
              .eq("sku", id)
              .limit(1);

          productData =
            result.data?.[0] ||
            null;

          productError =
            result.error;
        }

        /* PRODUCT CODE */

        if (
          !productData &&
          !productError &&
          !uuid
        ) {
          const result =
            await supabase
              .from("products")
              .select(`
                *,
                categories (
                  id,
                  name,
                  slug
                )
              `)
              .eq(
                "product_code",
                id
              )
              .limit(1);

          productData =
            result.data?.[0] ||
            null;

          productError =
            result.error;
        }

        if (productError) {
          console.error(
            "VIRAJ PRODUCT ERROR:",
            productError
          );

          if (!cancelled) {
            setError(
              productError.message
            );

            setProduct(null);
            setLoading(false);
          }

          return;
        }

        if (!productData) {
          if (!cancelled) {
            setError(
              `No product found for "${id}".`
            );

            setProduct(null);
            setLoading(false);
          }

          return;
        }

        /* =====================================================
           PRODUCT MEDIA
           ===================================================== */

        let productMedia = [];

        const mediaResult =
          await supabase
            .from("product_images")
            .select("*")
            .eq(
              "product_id",
              productData.id
            );

        if (!mediaResult.error) {
          productMedia =
            mediaResult.data || [];
        }

        productMedia =
          productMedia
            .filter(
              (media) =>
                media &&
                getMediaUrl(media)
            )
            .sort((a, b) => {
              const orderA =
                Number(
                  a.order ??
                    a.sort_order ??
                    a.position ??
                    0
                );

              const orderB =
                Number(
                  b.order ??
                    b.sort_order ??
                    b.position ??
                    0
                );

              return orderA - orderB;
            })
            .map((media) => ({
              ...media,

              image_url:
                String(
                  getMediaUrl(media)
                ).trim(),
            }));

        /* OLD MAIN IMAGE FALLBACK */

        if (
          productMedia.length === 0 &&
          productData.image
        ) {
          productMedia.push({
            id: "main-image",

            image_url:
              String(
                productData.image
              ).trim(),

            media_type: "image",
            order: 0,
          });
        }

        /* OLD IMAGES ARRAY FALLBACK */

        if (
          productMedia.length === 0 &&
          Array.isArray(
            productData.images
          )
        ) {
          productData.images
            .filter(Boolean)
            .forEach(
              (
                media,
                index
              ) => {
                const mediaUrl =
                  typeof media ===
                  "string"
                    ? media
                    : media?.image_url ||
                      media?.url ||
                      "";

                if (mediaUrl) {
                  productMedia.push({
                    id: `fallback-${index}`,

                    image_url:
                      String(
                        mediaUrl
                      ).trim(),

                    media_type:
                      typeof media ===
                      "object"
                        ? media.media_type ||
                          media.type
                        : undefined,

                    order: index,
                  });
                }
              }
            );
        }

        if (!cancelled) {
          setProduct(
            productData
          );

          setImages(
            productMedia
          );

          setActiveIndex(0);
          setLoading(false);

          loadSimilarProducts(
            productData
          );
        }
      } catch (err) {
        console.error(
          "VIRAJ PRODUCT LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load product."
          );

          setProduct(null);
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;

      if (
        clickTimerRef.current
      ) {
        window.clearTimeout(
          clickTimerRef.current
        );

        clickTimerRef.current = null;
      }
    };
  }, [id]);

  /* =========================================================
     IMAGE NAVIGATION
     ========================================================= */

  function previousImage(event) {
    event?.stopPropagation();

    if (images.length <= 1) {
      return;
    }

    resetZoom();

    setActiveIndex(
      (current) =>
        current === 0
          ? images.length - 1
          : current - 1
    );
  }

  function nextImage(event) {
    event?.stopPropagation();

    if (images.length <= 1) {
      return;
    }

    resetZoom();

    setActiveIndex(
      (current) =>
        current ===
        images.length - 1
          ? 0
          : current + 1
    );
  }

  /* =========================================================
     MAIN MEDIA CLICK
     LEFT = PREVIOUS
     RIGHT = NEXT
     DOUBLE CLICK = ZOOM
     ========================================================= */

  function handleMainMediaClick(
    event
  ) {
    if (
      images.length <= 1 ||
      zoom > 1
    ) {
      return;
    }

    if (
      event.target.closest(
        ".fullscreen-button"
      ) ||
      event.target.closest(
        ".gallery-count"
      )
    ) {
      return;
    }

    if (
      suppressNextClickRef.current
    ) {
      suppressNextClickRef.current =
        false;

      return;
    }

    if (
      clickTimerRef.current
    ) {
      window.clearTimeout(
        clickTimerRef.current
      );
    }

    clickTimerRef.current =
      window.setTimeout(() => {
        clickTimerRef.current =
          null;

        const rect =
          event.currentTarget.getBoundingClientRect();

        const clickX =
          event.clientX -
          rect.left;

        const middle =
          rect.width / 2;

        if (clickX < middle) {
          previousImage();
        } else {
          nextImage();
        }
      }, 180);
  }

  /* =========================================================
     SELECT MEDIA
     ========================================================= */

  function selectMedia(index) {
    resetZoom();
    setActiveIndex(index);
  }

  /* =========================================================
     KEYBOARD NAVIGATION
     ========================================================= */

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key ===
        "ArrowLeft"
      ) {
        previousImage();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        nextImage();
      }

      if (
        event.key === "Escape"
      ) {
        setIsFullscreen(false);
        resetZoom();
      }

      if (
        event.key === "+"
      ) {
        zoomIn();
      }

      if (
        event.key === "-"
      ) {
        zoomOut();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [images.length]);

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <main className="product-page">
        <div className="product-loading">
          <p>
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     NOT FOUND
     ========================================================= */

  if (!product) {
    return (
      <main className="product-page">
        <div className="product-not-found">
          <p className="product-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h1>
            Product Not Found
          </h1>

          <p>
            {error ||
              "The requested product could not be found."}
          </p>

          <Link to="/">
            ← Back to Website
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     PRODUCT INFORMATION
     ========================================================= */

  const categoryName =
    product.category ||
    product.categories?.name ||
    "Jewellery";

  const activeMedia =
    images[activeIndex];

  const activeImage =
    activeMedia?.image_url ||
    "";

  const activeIsVideo =
    isVideoMedia(activeMedia);

  const weightNumber =
    toNumber(product.weight);

  const weight =
    weightNumber > 0
      ? `${weightNumber} g`
      : "";

  const metal =
    product.metal_type ||
    product.metal ||
    product.material ||
    "";

  const sku =
    product.sku ||
    product.product_code ||
    "";

  const wishlisted =
    isInWishlist(product.id);

  /* =========================================================
     SOLD OUT / STOCK
     ========================================================= */

  const stockValue =
    product.stock ??
    product.stock_quantity ??
    product.inventory ??
    product.quantity;

  const isSoldOut =
    product.sold_out === true ||
    product.soldOut === true ||
    (
      stockValue !== undefined &&
      stockValue !== null &&
      stockValue !== "" &&
      Number(stockValue) <= 0
    );

  const availableStock =
    stockValue !== undefined &&
    stockValue !== null &&
    stockValue !== ""
      ? Math.max(
          0,
          Number(stockValue)
        )
      : null;

  /* =========================================================
     METAL
     ========================================================= */

  const metalText =
    String(metal)
      .toLowerCase()
      .trim();

  const isSilver =
    metalText.includes(
      "silver"
    );

  /* =========================================================
     PURITY
     ========================================================= */

  const purity =
    isSilver
      ? "925"
      : product.purity ||
        product.gold_purity ||
        "";

  const purityText =
    String(purity)
      .toLowerCase()
      .replace(/\s+/g, "");

  /* =========================================================
     PRICE CALCULATION
     ========================================================= */

  let metalRate = 0;

  if (rates) {
    if (isSilver) {
      metalRate =
        toNumber(
          rates.silver_rate
        );
    } else if (
      purityText.includes("24")
    ) {
      metalRate =
        toNumber(
          rates.rate_24k
        );
    } else if (
      purityText.includes("18")
    ) {
      metalRate =
        toNumber(
          rates.rate_18k
        );
    } else {
      metalRate =
        toNumber(
          rates.rate_22k
        );
    }
  }

  const metalValue =
    weightNumber *
    metalRate;

  const makingCharge =
    toNumber(
      product.making_charge
    );

  const makingTotal =
    weightNumber *
    makingCharge;

  const subtotal =
    metalValue +
    makingTotal;

  const gstPercentage =
    toNumber(product.gst);

  const gstAmount =
    subtotal *
    (gstPercentage / 100);

  const calculatedPrice =
    Math.round(
      subtotal + gstAmount
    );

  const hasRate =
    metalRate > 0;

  const hasWeight =
    weightNumber > 0;

  const hasPrice =
    hasRate &&
    hasWeight &&
    calculatedPrice > 0;

  let priceMessage = "";

  /* =========================================================
     CART
     ========================================================= */

  function handleAddToCart() {
    if (
      !product ||
      !hasPrice ||
      isSoldOut
    ) {
      return;
    }

    addToCart(
      {
        ...product,

        price: calculatedPrice,

        mainImage:
          images.find(
            (media) =>
              !isVideoMedia(media)
          )?.image_url || "",
      },
      quantity
    );
  }

  /* =========================================================
     BUY NOW
     ========================================================= */

  function handleBuyNow() {
    if (
      !product ||
      !hasPrice ||
      isSoldOut
    ) {
      return;
    }

    addToCart(
      {
        ...product,

        price: calculatedPrice,

        mainImage:
          images.find(
            (media) =>
              !isVideoMedia(media)
          )?.image_url || "",
      },
      quantity
    );

    navigate("/checkout");
  }

  /* =========================================================
     WHATSAPP
     ========================================================= */

  function handleWhatsAppEnquiry() {
    if (!product) {
      return;
    }

    const message =
      `Hello Viraj Jewellery,\n\n` +
      `I would like to enquire about:\n` +
      `${product.name}\n` +
      (
        hasPrice
          ? `Price: ₹${calculatedPrice.toLocaleString(
              "en-IN"
            )}\n`
          : ""
      ) +
      `Quantity: ${quantity}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =========================================================
     PRICE MESSAGE
     ========================================================= */

  if (
    !ratesLoading &&
    !hasRate
  ) {
    priceMessage =
      "Price is currently unavailable.";
  } else if (
    !ratesLoading &&
    !hasWeight
  ) {
    priceMessage =
      "Price is currently unavailable.";
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <main className="product-page">

      {/* =====================================================
          BREADCRUMB
          ===================================================== */}

      <div className="product-breadcrumb">
        <Link to="/">
          Home
        </Link>

        <span>/</span>

        <Link to="/category">
          Jewellery
        </Link>

        <span>/</span>

        <span className="breadcrumb-current">
          {product.name}
        </span>
      </div>

      {/* =====================================================
          PRODUCT DETAIL
          ===================================================== */}

      <div className="product-detail">

        {/* ===================================================
            GALLERY
            =================================================== */}

        <section className="product-gallery">

          <div className="product-gallery-layout">

            {/* DESKTOP THUMBNAILS */}

            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map(
                  (
                    media,
                    index
                  ) => {
                    const video =
                      isVideoMedia(
                        media
                      );

                    return (
                      <button
                        key={
                          media.id ||
                          `${media.image_url}-${index}`
                        }
                        type="button"
                        className={
                          activeIndex ===
                          index
                            ? "product-thumbnail active"
                            : "product-thumbnail"
                        }
                        onClick={() =>
                          selectMedia(
                            index
                          )
                        }
                      >
                        {video ? (
                          <div className="video-thumbnail">
                            <video
                              src={
                                media.image_url
                              }
                              muted
                              playsInline
                              preload="metadata"
                            />

                            <span className="video-thumbnail-icon">
                              ▶
                            </span>
                          </div>
                        ) : (
                          <img
                            src={
                              media.image_url
                            }
                            alt={`${product.name} ${
                              index + 1
                            }`}
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}

            {/* MAIN MEDIA */}

            <div
              ref={
                imageContainerRef
              }
              className={`
                product-main-image
                ${
                  images.length > 1
                    ? "clickable"
                    : ""
                }
                ${
                  zoom > 1
                    ? "is-zoomed"
                    : ""
                }
              `}
              onClick={
                handleMainMediaClick
              }
              onDoubleClick={
                activeIsVideo
                  ? undefined
                  : handleDoubleClick
              }
              onWheel={
                activeIsVideo
                  ? undefined
                  : handleWheel
              }
              onPointerDown={
                activeIsVideo
                  ? undefined
                  : handlePointerDown
              }
              onPointerMove={
                activeIsVideo
                  ? undefined
                  : handlePointerMove
              }
              onPointerUp={
                activeIsVideo
                  ? undefined
                  : handlePointerUp
              }
              onPointerCancel={
                activeIsVideo
                  ? undefined
                  : handlePointerUp
              }
            >

              {/* IMAGE / VIDEO */}

              {activeImage ? (
                activeIsVideo ? (
                  <video
                    key={
                      activeImage
                    }
                    src={
                      activeImage
                    }
                    className="product-main-video"
                    controls
                    playsInline
                    preload="metadata"
                    loop
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  />
                ) : (
                  <img
                    src={
                      activeImage
                    }
                    alt={
                      product.name ||
                      "Viraj Jewellery"
                    }
                    className="product-main-media"
                    draggable="false"
                    style={{
                      transform: `
                        translate(
                          ${position.x}px,
                          ${position.y}px
                        )
                        scale(${zoom})
                      `,
                    }}
                  />
                )
              ) : (
                <div className="product-image-placeholder">
                  <strong>
                    VIRAJ
                  </strong>

                  <span>
                    JEWELLERY
                  </span>
                </div>
              )}

              {/* SOLD OUT BADGE */}

              {isSoldOut && (
                <span className="product-sold-out-badge">
                  SOLD OUT
                </span>
              )}

              {/* FULLSCREEN BUTTON */}

              {activeImage && (
                <button
                  type="button"
                  className="fullscreen-button"
                  onClick={(event) => {
                    event.stopPropagation();

                    resetZoom();

                    setIsFullscreen(
                      true
                    );
                  }}
                  aria-label="Open fullscreen gallery"
                >
                  ⛶
                </button>
              )}

              {/* IMAGE COUNTER */}

              {images.length > 1 && (
                <span className="gallery-count">
                  {activeIndex + 1} /{" "}
                  {images.length}
                </span>
              )}

            </div>
          </div>

          {/* MOBILE THUMBNAILS */}

          {images.length > 1 && (
            <div className="mobile-product-thumbnails">
              {images.map(
                (
                  media,
                  index
                ) => {
                  const video =
                    isVideoMedia(
                      media
                    );

                  return (
                    <button
                      key={
                        media.id ||
                        `mobile-${index}`
                      }
                      type="button"
                      className={
                        activeIndex ===
                        index
                          ? "product-thumbnail active"
                          : "product-thumbnail"
                      }
                      onClick={() =>
                        selectMedia(
                          index
                        )
                      }
                    >
                      {video ? (
                        <div className="video-thumbnail">
                          <video
                            src={
                              media.image_url
                            }
                            muted
                            preload="metadata"
                          />

                          <span className="video-thumbnail-icon">
                            ▶
                          </span>
                        </div>
                      ) : (
                        <img
                          src={
                            media.image_url
                          }
                          alt={`${product.name} ${
                            index + 1
                          }`}
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}

        </section>

        {/* ===================================================
            PRODUCT INFORMATION
            =================================================== */}

        <section className="product-information">

          <p className="product-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <p className="product-category">
            {categoryName}
          </p>

          <h1>
            {product.name}
          </h1>

          {/* SOLD OUT STATUS */}

          {isSoldOut && (
            <div className="product-sold-out-status">
              SOLD OUT
            </div>
          )}

          {/* PRODUCT CODE */}

          {sku && (
            <p className="product-code">
              Product Code:
              <strong>
                {sku}
              </strong>
            </p>
          )}

          {/* SPECIFICATIONS */}

          {(weight ||
            purity ||
            metal) && (
            <div className="product-specifications">

              {weight && (
                <div className="product-spec">
                  <span>
                    Weight
                  </span>

                  <strong>
                    {weight}
                  </strong>
                </div>
              )}

              {purity && (
                <div className="product-spec">
                  <span>
                    Purity
                  </span>

                  <strong>
                    {purity}
                  </strong>
                </div>
              )}

              {metal && (
                <div className="product-spec">
                  <span>
                    Metal
                  </span>

                  <strong>
                    {metal}
                  </strong>
                </div>
              )}

            </div>
          )}

          {/* PRICE */}

          <div className="product-price-box">
            <span>
              Price
            </span>

            {ratesLoading ? (
              <strong>
                Calculating...
              </strong>
            ) : hasPrice ? (
              <strong>
                ₹
                {calculatedPrice.toLocaleString(
                  "en-IN"
                )}
              </strong>
            ) : (
              <strong>
                Price unavailable
              </strong>
            )}
          </div>

          {!ratesLoading &&
            !hasPrice &&
            priceMessage && (
              <div className="product-price-note">
                {priceMessage}
              </div>
            )}

          {/* SHORT DESCRIPTION */}

          {product.short_description && (
            <div className="product-short-description">
              <h3>
                About this jewellery
              </h3>

              <p>
                {
                  product.short_description
                }
              </p>
            </div>
          )}

          {/* DESCRIPTION */}

          {product.description && (
            <div className="product-description">
              <h3>
                Product Details
              </h3>

              <p>
                {
                  product.description
                }
              </p>
            </div>
          )}

          {/* PURCHASE */}

          <div className="product-purchase-panel">

            {/* QUANTITY */}

            {!isSoldOut && (
              <div className="product-quantity-row">

                <span>
                  Quantity
                </span>

                <div className="product-quantity-controls">

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (q) =>
                          Math.max(
                            1,
                            q - 1
                          )
                      )
                    }
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <strong>
                    {quantity}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (q) => {
                          if (
                            availableStock !==
                              null &&
                            q >=
                              availableStock
                          ) {
                            return q;
                          }

                          return q + 1;
                        }
                      )
                    }
                    disabled={
                      availableStock !==
                        null &&
                      quantity >=
                        availableStock
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>
              </div>
            )}

            {/* PURCHASE BUTTONS */}

            <div className="product-purchase-actions">

              <button
                type="button"
                className={`product-add-cart-button ${
                  isSoldOut
                    ? "product-sold-out-button"
                    : ""
                }`}
                onClick={
                  handleAddToCart
                }
                disabled={
                  !hasPrice ||
                  isSoldOut
                }
              >
                {isSoldOut
                  ? "Sold Out"
                  : "Add to Cart"}
              </button>

              <button
                type="button"
                className={`product-buy-now-button ${
                  isSoldOut
                    ? "product-sold-out-button"
                    : ""
                }`}
                onClick={
                  handleBuyNow
                }
                disabled={
                  !hasPrice ||
                  isSoldOut
                }
              >
                {isSoldOut
                  ? "Sold Out"
                  : "Buy Now"}
              </button>

            </div>

            {/* SECONDARY ACTIONS */}

            <div className="product-secondary-actions">

              <button
                type="button"
                className={
                  wishlisted
                    ? "product-wishlist-button active"
                    : "product-wishlist-button"
                }
                onClick={() =>
                  toggleWishlist(
                    product
                  )
                }
              >
                <span className="wishlist-symbol">
                  {wishlisted
                    ? "♥"
                    : "♡"}
                </span>

                <span>
                  {wishlisted
                    ? "Saved to Wishlist"
                    : "Add to Wishlist"}
                </span>
              </button>

              <button
                type="button"
                className="product-whatsapp-button"
                onClick={
                  handleWhatsAppEnquiry
                }
              >
                WhatsApp Enquiry
              </button>

            </div>

          </div>

          {/* CONTINUE */}

          <div className="product-actions">
            <Link
              to="/category"
              className="product-continue"
            >
              Continue Shopping

              <span>
                →
              </span>
            </Link>
          </div>

        </section>
      </div>

      {/* =====================================================
          SIMILAR PRODUCTS
          ===================================================== */}

      {similarProducts.length > 0 && (
        <section className="similar-products-section">

          <div className="similar-products-header">

            <p className="similar-products-eyebrow">
              VIRAJ JEWELLERY
            </p>

            <h2>
              Similar Products
            </h2>

            <p className="similar-products-subtitle">
              Explore more jewellery from
              this collection
            </p>

          </div>

          <div className="similar-products-grid">

            {similarProducts.map(
              (item) => {

                const itemWeight =
                  toNumber(
                    item.weight
                  );

                const itemMetal =
                  item.metal_type ||
                  item.metal ||
                  item.material ||
                  "";

                const itemMetalText =
                  String(
                    itemMetal
                  )
                    .toLowerCase()
                    .trim();

                const itemIsSilver =
                  itemMetalText.includes(
                    "silver"
                  );

                const itemPurity =
                  itemIsSilver
                    ? "925"
                    : item.purity ||
                      item.gold_purity ||
                      "";

                const itemPurityText =
                  String(
                    itemPurity
                  )
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      ""
                    );

                let itemRate = 0;

                if (rates) {
                  if (
                    itemIsSilver
                  ) {
                    itemRate =
                      toNumber(
                        rates.silver_rate
                      );
                  } else if (
                    itemPurityText.includes(
                      "24"
                    )
                  ) {
                    itemRate =
                      toNumber(
                        rates.rate_24k
                      );
                  } else if (
                    itemPurityText.includes(
                      "18"
                    )
                  ) {
                    itemRate =
                      toNumber(
                        rates.rate_18k
                      );
                  } else {
                    itemRate =
                      toNumber(
                        rates.rate_22k
                      );
                  }
                }

                const itemMaking =
                  toNumber(
                    item.making_charge
                  );

                const itemGST =
                  toNumber(
                    item.gst
                  );

                const itemSubtotal =
                  itemWeight *
                    itemRate +
                  itemWeight *
                    itemMaking;

                const itemGSTAmount =
                  itemSubtotal *
                  (itemGST / 100);

                const itemPrice =
                  Math.round(
                    itemSubtotal +
                      itemGSTAmount
                  );

                const itemStock =
                  item.stock ??
                  item.stock_quantity ??
                  item.inventory ??
                  item.quantity;

                const itemSoldOut =
                  item.sold_out === true ||
                  (
                    itemStock !==
                      undefined &&
                    itemStock !==
                      null &&
                    itemStock !== "" &&
                    Number(itemStock) <=
                      0
                  );

                return (
                  <article
                    key={
                      item.id
                    }
                    className={`similar-product-card ${
                      itemSoldOut
                        ? "similar-product-sold-out"
                        : ""
                    }`}
                    role="link"
                    tabIndex={0}
                    onClick={() =>
                      navigate(
                        `/product/${item.id}`
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.target !==
                        event.currentTarget
                      ) {
                        return;
                      }

                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {
                        event.preventDefault();

                        navigate(
                          `/product/${item.id}`
                        );
                      }
                    }}
                  >

                    <Link
                      to={`/product/${item.id}`}
                      className="similar-product-image"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >

                      {item.displayImage ? (
                        <img
                          src={
                            item.displayImage
                          }
                          alt={
                            item.name
                          }
                          loading="lazy"
                        />
                      ) : (
                        <div className="similar-product-placeholder">
                          <strong>
                            VIRAJ
                          </strong>

                          <span>
                            JEWELLERY
                          </span>
                        </div>
                      )}

                      {itemSoldOut && (
                        <span className="similar-product-sold-out-badge">
                          SOLD OUT
                        </span>
                      )}

                    </Link>

                    <div className="similar-product-info">

                      <h3>
                        {item.name}
                      </h3>

                      <div className="similar-product-meta">

                        {itemWeight >
                          0 && (
                          <span>
                            {
                              itemWeight
                            }{" "}
                            g
                          </span>
                        )}

                        {itemPurity && (
                          <span>
                            {
                              itemPurity
                            }
                          </span>
                        )}

                        {itemMetal && (
                          <span>
                            {
                              itemMetal
                            }
                          </span>
                        )}

                      </div>

                      <div className="similar-product-bottom">

                        <strong>
                          {itemPrice >
                          0
                            ? `₹${itemPrice.toLocaleString(
                                "en-IN"
                              )}`
                            : "Price unavailable"}
                        </strong>

                        <Link
                          to={`/product/${item.id}`}
                          className="similar-product-view"
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                        >
                          View Product
                        </Link>

                      </div>

                    </div>
                  </article>
                );
              }
            )}

          </div>
        </section>
      )}

      {/* =====================================================
          FULLSCREEN GALLERY
          ===================================================== */}

      {isFullscreen && (
        <div
          className="fullscreen-gallery"
          onClick={() =>
            setIsFullscreen(false)
          }
        >

          <button
            type="button"
            className="fullscreen-close"
            onClick={() =>
              setIsFullscreen(false)
            }
          >
            ×
          </button>

          <div
            className="fullscreen-media-wrapper"
            onClick={(event) =>
              event.stopPropagation()
            }
            onDoubleClick={
              activeIsVideo
                ? undefined
                : handleDoubleClick
            }
          >

            {activeIsVideo ? (
              <video
                src={
                  activeImage
                }
                className="fullscreen-video"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={
                  activeImage
                }
                alt={
                  product.name
                }
                className="fullscreen-image"
              />
            )}

          </div>

          {/* FULLSCREEN LEFT / RIGHT */}

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="fullscreen-side-zone fullscreen-side-zone-left"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
              />

              <button
                type="button"
                className="fullscreen-side-zone fullscreen-side-zone-right"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
              />
            </>
          )}

          <div className="fullscreen-counter">
            {activeIndex + 1} /{" "}
            {images.length}
          </div>

        </div>
      )}

    </main>
  );
}