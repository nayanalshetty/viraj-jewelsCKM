import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { supabase } from "../lib/supabase.js";

export const OrderContext = createContext(null);

const ORDER_STORAGE_KEY = "viraj_orders";

/* =========================================================
   STATUS HELPERS
   ========================================================= */

const normalizeOrderStatus = (status) => {
  const value = String(status || "new")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const aliases = {
    pending: "new",
    placed: "new",
    new: "new",

    confirmed: "confirmed",

    processing: "processing",

    shipped: "shipped",

    out_for_delivery: "out_for_delivery",

    delivered: "delivered",

    cancelled: "cancelled",
  };

  return aliases[value] || value || "new";
};

const getOrderId = (order) => {
  return (
    order?.supabaseId ||
    order?.id ||
    order?.order_id ||
    null
  );
};

/* =========================================================
   CONVERT SUPABASE ORDER
   ========================================================= */

const convertSupabaseOrder = (data, items = []) => {
  if (!data) return null;

  return {
    id: data.id,

    supabaseId: data.id,

    orderNumber:
      data.order_number ||
      data.orderNumber ||
      String(data.id || ""),

    createdAt:
      data.created_at ||
      new Date().toISOString(),

    orderStatus:
      normalizeOrderStatus(
        data.order_status
      ),

    paymentStatus:
      data.payment_status ||
      "pending",

    paymentMethod:
      data.payment_method ||
      "cod",

    customer: {
      name:
        data.shipping_name ||
        data.name ||
        "",

      mobile:
        data.mobile ||
        data.phone ||
        "",

      email:
        data.email ||
        "",
    },

    address: {
      house:
        data.house ||
        "",

      street:
        data.street ||
        "",

      city:
        data.city ||
        "",

      state:
        data.state ||
        "",

      pincode:
        data.pincode ||
        "",
    },

    items: Array.isArray(items)
      ? items
      : [],

    subtotal:
      Number(data.subtotal || 0),

    shipping:
      Number(
        data.shipping_charge ||
          data.shipping ||
          0
      ),

    discount:
      Number(data.discount || 0),

    tax:
      Number(data.tax || 0),

    total:
      Number(
        data.total_amount ||
          data.total ||
          0
      ),

    paymentId:
      data.razorpay_payment_id ||
      data.payment_id ||
      null,

    razorpayOrderId:
      data.razorpay_order_id ||
      null,

    razorpaySignature:
      data.razorpay_signature ||
      null,
  };
};

/* =========================================================
   PROVIDER
   ========================================================= */

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          ORDER_STORAGE_KEY
        );

      return saved
        ? JSON.parse(saved)
        : [];
    } catch (error) {
      console.error(
        "Unable to load local orders:",
        error
      );

      return [];
    }
  });

  /* =======================================================
     SAVE LOCAL BACKUP
     ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify(orders)
      );
    } catch (error) {
      console.error(
        "Unable to save local orders:",
        error
      );
    }
  }, [orders]);

  /* =======================================================
     CREATE ORDER
     ======================================================= */

  const createOrder = async (orderData) => {
    const now = new Date();

    const orderNumber =
      "VIRAJ-" +
      now.getFullYear() +
      String(
        now.getMonth() + 1
      ).padStart(2, "0") +
      String(
        now.getDate()
      ).padStart(2, "0") +
      "-" +
      String(Date.now()).slice(-6);

    const supabaseOrder = {
      order_number:
        orderNumber,

      customer_id:
        orderData.customer_id ||
        null,

      subtotal:
        Number(
          orderData.subtotal || 0
        ),

      shipping_charge:
        Number(
          orderData.shipping || 0
        ),

      discount:
        Number(
          orderData.discount || 0
        ),

      tax:
        Number(
          orderData.tax || 0
        ),

      total_amount:
        Number(
          orderData.total || 0
        ),

      payment_status:
        "pending",

      order_status:
        "new",

      payment_method:
        orderData.paymentMethod ||
        "cod",

      shipping_name:
        orderData.name || "",

      street:
        [
          orderData.house,
          orderData.street,
        ]
          .filter(Boolean)
          .join(", "),

      city:
        orderData.city || "",

      state:
        orderData.state || "",

      pincode:
        orderData.pincode || "",

      shipping:
        Number(
          orderData.shipping || 0
        ),

      razorpay_order_id:
        orderData.razorpayOrderId ||
        null,

      razorpay_payment_id:
        orderData.paymentId ||
        null,

      razorpay_signature:
        orderData.razorpaySignature ||
        null,
    };

    console.log(
      "CREATING ORDER:",
      supabaseOrder
    );

    /* =====================================================
       INSERT ORDER
       ===================================================== */

    const {
      data,
      error,
    } = await supabase
      .from("orders")
      .insert([supabaseOrder])
      .select()
      .single();

    if (error) {
      console.error(
        "SUPABASE ORDER ERROR:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to save order."
      );
    }

    console.log(
      "SUPABASE ORDER CREATED:",
      data
    );

    /* =====================================================
       LOCAL ORDER
       ===================================================== */

    const newOrder = {
      id: data.id,

      supabaseId:
        data.id,

      orderNumber:
        data.order_number ||
        orderNumber,

      createdAt:
        data.created_at ||
        now.toISOString(),

      orderStatus:
        normalizeOrderStatus(
          data.order_status
        ),

      paymentStatus:
        data.payment_status ||
        "pending",

      paymentMethod:
        data.payment_method ||
        orderData.paymentMethod ||
        "cod",

      customer: {
        name:
          orderData.name || "",

        mobile:
          orderData.mobile || "",

        email:
          orderData.email || "",
      },

      address: {
        house:
          orderData.house || "",

        street:
          orderData.street || "",

        city:
          orderData.city || "",

        state:
          orderData.state || "",

        pincode:
          orderData.pincode || "",
      },

      items:
        Array.isArray(
          orderData.items
        )
          ? orderData.items
          : [],

      subtotal:
        Number(
          orderData.subtotal || 0
        ),

      shipping:
        Number(
          orderData.shipping || 0
        ),

      discount:
        Number(
          orderData.discount || 0
        ),

      tax:
        Number(
          orderData.tax || 0
        ),

      total:
        Number(
          orderData.total || 0
        ),

      paymentId:
        orderData.paymentId ||
        null,

      razorpayOrderId:
        orderData.razorpayOrderId ||
        null,

      razorpaySignature:
        orderData.razorpaySignature ||
        null,
    };

    /* =====================================================
       SAVE LOCAL
       ===================================================== */

    setOrders((current) => [
      newOrder,
      ...current.filter(
        (order) =>
          String(
            getOrderId(order)
          ) !==
          String(data.id)
      ),
    ]);

    return newOrder;
  };

  /* =======================================================
     GET ORDER BY ID / ORDER NUMBER
     ======================================================= */

  const getOrderById = useCallback(
    async (orderId) => {
      if (!orderId) {
        return null;
      }

      console.log(
        "SEARCHING FOR ORDER:",
        orderId
      );

      /* ===================================================
         FIRST: LOCAL STORAGE
         =================================================== */

      const localOrder =
        orders.find((order) => {
          return (
            String(order.id) ===
              String(orderId) ||
            String(
              order.supabaseId
            ) ===
              String(orderId) ||
            String(
              order.orderNumber
            ).toLowerCase() ===
              String(
                orderId
              ).toLowerCase()
          );
        });

      if (localOrder) {
        console.log(
          "ORDER FOUND LOCALLY:",
          localOrder
        );

        /*
         * We still refresh from Supabase below.
         * This is important because the admin may
         * have changed the status.
         */
      }

      /* ===================================================
         SECOND: SUPABASE BY UUID
         =================================================== */

      let data = null;
      let error = null;

      const uuidLookup =
        await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .maybeSingle();

      data =
        uuidLookup.data;

      error =
        uuidLookup.error;

      /*
       * If ID lookup failed because the customer
       * supplied the order number instead of UUID,
       * search by order_number.
       */

      if (
        !data &&
        !error
      ) {
        const orderNumberLookup =
          await supabase
            .from("orders")
            .select("*")
            .eq(
              "order_number",
              orderId
            )
            .maybeSingle();

        data =
          orderNumberLookup.data;

        error =
          orderNumberLookup.error;
      }

      /*
       * If Supabase lookup failed, use local
       * order as a fallback.
       */

      if (error) {
        console.error(
          "SUPABASE ORDER LOOKUP ERROR:",
          error
        );

        return localOrder || null;
      }

      if (!data) {
        console.log(
          "ORDER NOT FOUND:",
          orderId
        );

        return localOrder || null;
      }

      console.log(
        "ORDER FOUND IN SUPABASE:",
        data
      );

      /* ===================================================
         LOAD ORDER ITEMS
         =================================================== */

      let orderItems = [];

      /*
       * Your existing database may or may not have
       * an order_items table.
       *
       * Try to load it if available.
       */

      try {
        const {
          data: itemData,
          error: itemError,
        } = await supabase
          .from("order_items")
          .select("*")
          .eq(
            "order_id",
            data.id
          );

        if (
          !itemError &&
          Array.isArray(itemData)
        ) {
          orderItems =
            itemData.map(
              (item) => ({
                id:
                  item.id,

                productId:
                  item.product_id ||
                  item.productId ||
                  null,

                name:
                  item.product_name ||
                  item.name ||
                  "Jewellery",

                image:
                  item.image_url ||
                  item.image ||
                  "",

                quantity:
                  Number(
                    item.quantity || 1
                  ),

                price:
                  Number(
                    item.price ||
                      item.unit_price ||
                      0
                  ),
              })
            );
        }
      } catch (itemError) {
        console.warn(
          "Order items table could not be loaded:",
          itemError
        );
      }

      /*
       * If order_items doesn't exist or contains
       * nothing, preserve the local cart items.
       */

      if (
        orderItems.length === 0 &&
        localOrder?.items?.length
      ) {
        orderItems =
          localOrder.items;
      }

      /* ===================================================
         CONVERT
         =================================================== */

      const convertedOrder =
        convertSupabaseOrder(
          data,
          orderItems
        );

      /*
       * Preserve customer details from local checkout
       * if the existing orders table doesn't contain
       * those columns.
       */

      if (localOrder) {
        convertedOrder.customer = {
          name:
            convertedOrder.customer
              .name ||
            localOrder.customer?.name ||
            "",

          mobile:
            convertedOrder.customer
              .mobile ||
            localOrder.customer?.mobile ||
            "",

          email:
            convertedOrder.customer
              .email ||
            localOrder.customer?.email ||
            "",
        };

        convertedOrder.address = {
          house:
            convertedOrder.address
              .house ||
            localOrder.address?.house ||
            "",

          street:
            convertedOrder.address
              .street ||
            localOrder.address?.street ||
            "",

          city:
            convertedOrder.address
              .city ||
            localOrder.address?.city ||
            "",

          state:
            convertedOrder.address
              .state ||
            localOrder.address?.state ||
            "",

          pincode:
            convertedOrder.address
              .pincode ||
            localOrder.address?.pincode ||
            "",
        };

        if (
          convertedOrder.items.length ===
            0 &&
          localOrder.items?.length
        ) {
          convertedOrder.items =
            localOrder.items;
        }
      }

      /* ===================================================
         UPDATE LOCAL COPY
         =================================================== */

      setOrders((current) => {
        const exists =
          current.some(
            (item) =>
              String(
                getOrderId(item)
              ) ===
              String(data.id)
          );

        if (!exists) {
          return [
            convertedOrder,
            ...current,
          ];
        }

        return current.map(
          (item) =>
            String(
              getOrderId(item)
            ) ===
            String(data.id)
              ? {
                  ...item,
                  ...convertedOrder,
                }
              : item
        );
      });

      return convertedOrder;
    },
    [orders]
  );

  /* =======================================================
     LOAD ALL ORDERS
     ======================================================= */

  const loadOrders = useCallback(
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        console.error(
          "Unable to load orders:",
          error
        );

        throw new Error(
          error.message ||
            "Unable to load orders."
        );
      }

      const converted =
        (data || []).map(
          (order) =>
            convertSupabaseOrder(
              order,
              []
            )
        );

      setOrders(converted);

      return converted;
    },
    []
  );

  /* =======================================================
     UPDATE ORDER STATUS
     ======================================================= */

  const updateOrderStatus = async (
    orderId,
    orderStatus
  ) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required."
      );
    }

    const normalizedStatus =
      normalizeOrderStatus(
        orderStatus
      );

    console.log(
      "UPDATING ORDER STATUS:",
      orderId,
      normalizedStatus
    );

    const {
      data,
      error,
    } = await supabase
      .from("orders")
      .update({
        order_status:
          normalizedStatus,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error(
        "ORDER STATUS UPDATE ERROR:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to update order status."
      );
    }

    const updatedOrder =
      data
        ? convertSupabaseOrder(
            data,
            []
          )
        : null;

    setOrders((current) =>
      current.map((order) =>
        String(
          getOrderId(order)
        ) ===
        String(orderId)
          ? {
              ...order,

              orderStatus:
                normalizedStatus,

              ...(updatedOrder
                ? {
                    orderNumber:
                      updatedOrder.orderNumber,

                    createdAt:
                      updatedOrder.createdAt,

                    paymentStatus:
                      updatedOrder.paymentStatus,

                    paymentMethod:
                      updatedOrder.paymentMethod,

                    total:
                      updatedOrder.total,
                  }
                : {}),
            }
          : order
      )
    );

    return updatedOrder;
  };

  /* =======================================================
     UPDATE PAYMENT STATUS
     ======================================================= */

  const updatePaymentStatus = async (
    orderId,
    paymentStatus
  ) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required."
      );
    }

    const normalizedPayment =
      String(
        paymentStatus || "pending"
      )
        .trim()
        .toLowerCase();

    const {
      data,
      error,
    } = await supabase
      .from("orders")
      .update({
        payment_status:
          normalizedPayment,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error(
        "PAYMENT STATUS UPDATE ERROR:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to update payment status."
      );
    }

    setOrders((current) =>
      current.map((order) =>
        String(
          getOrderId(order)
        ) ===
        String(orderId)
          ? {
              ...order,
              paymentStatus:
                normalizedPayment,
            }
          : order
      )
    );

    return data;
  };

  /* =======================================================
     CLEAR LOCAL ORDERS
     ======================================================= */

  const clearOrders = () => {
    setOrders([]);

    try {
      localStorage.removeItem(
        ORDER_STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "Unable to clear local orders:",
        error
      );
    }
  };

  /* =======================================================
     CONTEXT VALUE
     ======================================================= */

  const value = {
    orders,

    createOrder,

    getOrderById,

    loadOrders,

    updateOrderStatus,

    updatePaymentStatus,

    clearOrders,
  };

  return (
    <OrderContext.Provider
      value={value}
    >
      {children}
    </OrderContext.Provider>
  );
}

/* =========================================================
   HOOK
   ========================================================= */

export function useOrders() {
  const context =
    useContext(OrderContext);

  if (!context) {
    throw new Error(
      "useOrders must be used inside OrderProvider"
    );
  }

  return context;
}