// =========================================================
// VIRAJ JEWELLERS — AUTOMATIC PRODUCT PRICING
// =========================================================

export function getMetalRate(product, rates) {
  if (!product || !rates) return 0;

  const metal = String(
    product.metal_type ||
      product.metal ||
      product.material ||
      ""
  ).toLowerCase();

  // SILVER
  if (metal === "silver") {
    return Number(rates.silver_rate || 0);
  }

  // GOLD
  const purity = String(
    product.purity ||
      product.gold_purity ||
      "22K"
  ).toUpperCase();

  if (purity.includes("24")) {
    return Number(rates.rate_24k || 0);
  }

  if (purity.includes("18")) {
    return Number(rates.rate_18k || 0);
  }

  // Default gold = 22K
  return Number(rates.rate_22k || 0);
}


export function calculateProductPrice(product, rates) {
  if (!product || !rates) return 0;

  const weight = Number(product.weight || 0);

  if (!weight) return 0;

  const metalRate = getMetalRate(product, rates);

  if (!metalRate) return 0;

  // Metal value
  const metalValue = weight * metalRate;

  // Making charge
  const makingCharge = Number(
    product.making_charge || 0
  );

  // Subtotal before GST
  const subtotal =
    metalValue + makingCharge;

  // GST percentage
  const gstPercent = Number(
    product.gst || 0
  );

  const gstAmount =
    subtotal * (gstPercent / 100);

  // Final price
  const finalPrice =
    subtotal + gstAmount;

  return Math.round(finalPrice);
}


export function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;
}