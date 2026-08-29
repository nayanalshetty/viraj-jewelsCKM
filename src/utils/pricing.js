/* =========================================================
   VIRAJ JEWELLERY
   AUTOMATIC GOLD & SILVER PRICING
   ========================================================= */

export function getMetalRate(product, rates) {
  if (!product || !rates) return 0;

  const metal = String(
    product.metal_type ||
      product.metal ||
      product.material ||
      ""
  ).toLowerCase();

  /* =======================================================
     SILVER
     ======================================================= */

  if (metal === "silver") {
    return Number(rates.silver_rate || 0);
  }

  /* =======================================================
     GOLD
     ======================================================= */

  const purity = String(
    product.purity ||
      product.gold_purity ||
      "22K"
  )
    .toUpperCase()
    .replace(/\s/g, "");

  if (purity === "24K") {
    return Number(rates.rate_24k || 0);
  }

  if (purity === "18K") {
    return Number(rates.rate_18k || 0);
  }

  /* Default gold purity = 22K */

  return Number(rates.rate_22k || 0);
}


/* =========================================================
   CALCULATE PRODUCT PRICE
   ========================================================= */

export function calculateProductPrice(
  product,
  rates
) {
  if (!product || !rates) {
    return {
      metalRate: 0,
      metalValue: 0,
      makingCharge: 0,
      subtotal: 0,
      gstAmount: 0,
      finalPrice: 0,
    };
  }

  const weight = Number(
    product.weight || 0
  );

  const metalRate = getMetalRate(
    product,
    rates
  );

  const makingCharge = Number(
    product.making_charge || 0
  );

  const gstPercent = Number(
    product.gst || 0
  );

  /* Metal value */

  const metalValue =
    weight * metalRate;

  /* Before GST */

  const subtotal =
    metalValue + makingCharge;

  /* GST */

  const gstAmount =
    subtotal * (gstPercent / 100);

  /* Final customer price */

  const finalPrice =
    subtotal + gstAmount;

  return {
    metalRate,
    metalValue,
    makingCharge,
    subtotal,
    gstAmount,
    finalPrice,
  };
}


/* =========================================================
   FORMAT RUPEE
   ========================================================= */

export function formatPrice(value) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}yes
