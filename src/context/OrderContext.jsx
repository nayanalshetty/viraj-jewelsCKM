import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase.js";

export const OrderContext = createContext(null);

const ORDER_STORAGE_KEY = "viraj_orders";

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);

      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Unable to load local orders:", error);
      return [];
    }
  });

  /* --------------------------------------------------
     SAVE LOCAL BACKUP
  -------------------------------------------------- */

  useEffect(() => {
    try {
      localStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify(orders)
      );
    } catch (error) {
      console.error("Unable to save local orders:", error);
    }
  }, [orders]);

  /* --------------------------------------------------
     CREATE ORDER
  -------------------------------------------------- */

  const createOrder = async (orderData) => {
    const now = new Date();

    const orderNumber =
      "VIRAJ-" +
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "-" +
      String(Date.now()).slice(-6);

    const supabaseOrder = {
      order_number: orderNumber,

      customer_id:
        orderData.customer_id || null,

      subtotal:
        Number(orderData.subtotal || 0),

      shipping_charge:
        Number(orderData.shipping || 0),

      discount:
        Number(orderData.discount || 0),

      tax:
        Number(orderData.tax || 0),

      total_amount:
        Number(orderData.total || 0),

      payment_status:
        "pending",

      order_status:
        "new",

      payment_method:
        orderData.paymentMethod || "cod",

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
        Number(orderData.shipping || 0),

      razorpay_order_id:
        orderData.razorpayOrderId || null,

      razorpay_payment_id:
        orderData.paymentId || null,

      razorpay_signature:
        orderData.razorpaySignature || null,
    };

    console.log(
      "CREATING ORDER:",
      supabaseOrder
    );

    /* --------------------------------------------------
       INSERT INTO SUPABASE
    -------------------------------------------------- */

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
        error.message || "Unable to save order."
      );
    }

    console.log(
      "SUPABASE ORDER CREATED:",
      data
    );

    /* --------------------------------------------------
       CREATE LOCAL ORDER OBJECT
    -------------------------------------------------- */

    const newOrder = {
      id:
        data.id,

      orderNumber:
        data.order_number || orderNumber,

      createdAt:
        data.created_at || now.toISOString(),

      orderStatus:
        data.order_status || "new",

      paymentStatus:
        data.payment_status || "pending",

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
        orderData.items || [],

      subtotal:
        Number(orderData.subtotal || 0),

      shipping:
        Number(orderData.shipping || 0),

      discount:
        Number(orderData.discount || 0),

      tax:
        Number(orderData.tax || 0),

      total:
        Number(orderData.total || 0),

      paymentId:
        orderData.paymentId || null,

      razorpayOrderId:
        orderData.razorpayOrderId || null,

      supabaseId:
        data.id,
    };

    /* --------------------------------------------------
       SAVE LOCALLY
    -------------------------------------------------- */

    setOrders((current) => [
      newOrder,
      ...current,
    ]);

    return newOrder;
  };

  /* --------------------------------------------------
     GET ORDER BY ID
  -------------------------------------------------- */

  const getOrderById = async (orderId) => {
    if (!orderId) {
      return null;
    }

    console.log(
      "SEARCHING FOR ORDER:",
      orderId
    );

    /* FIRST: LOCAL STORAGE */

    const localOrder = orders.find(
      (order) =>
        String(order.id) === String(orderId) ||
        String(order.orderNumber) === String(orderId) ||
        String(order.supabaseId) === String(orderId)
    );

    if (localOrder) {
      console.log(
        "ORDER FOUND IN LOCAL STORAGE:",
        localOrder
      );

      return localOrder;
    }

    /* SECOND: SUPABASE */

    const {
      data,
      error,
    } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      console.error(
        "SUPABASE ORDER LOOKUP ERROR:",
        error
      );

      return null;
    }

    if (!data) {
      console.log(
        "ORDER NOT FOUND:",
        orderId
      );

      return null;
    }

    console.log(
      "ORDER FOUND IN SUPABASE:",
      data
    );

    /* Convert Supabase format to website format */

    return {
      id:
        data.id,

      orderNumber:
        data.order_number,

      createdAt:
        data.created_at,

      orderStatus:
        data.order_status || "new",

      paymentStatus:
        data.payment_status || "pending",

      paymentMethod:
        data.payment_method || "cod",

      customer: {
        name:
          data.shipping_name || "",
      },

      address: {
        street:
          data.street || "",

        city:
          data.city || "",

        state:
          data.state || "",

        pincode:
          data.pincode || "",
      },

      items: [],

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
        Number(data.total_amount || 0),

      supabaseId:
        data.id,
    };
  };

  /* --------------------------------------------------
     LOAD ALL ORDERS
  -------------------------------------------------- */

  const loadOrders = async () => {
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

      throw new Error(error.message);
    }

    setOrders(data || []);

    return data || [];
  };

  /* --------------------------------------------------
     UPDATE ORDER STATUS
  -------------------------------------------------- */

  const updateOrderStatus = async (
    orderId,
    orderStatus
  ) => {
    const {
      error,
    } = await supabase
      .from("orders")
      .update({
        order_status: orderStatus,
      })
      .eq("id", orderId);

    if (error) {
      throw new Error(error.message);
    }

    setOrders((current) =>
      current.map((order) =>
        String(order.id) === String(orderId)
          ? {
              ...order,
              orderStatus,
            }
          : order
      )
    );
  };

  /* --------------------------------------------------
     UPDATE PAYMENT STATUS
  -------------------------------------------------- */

  const updatePaymentStatus = async (
    orderId,
    paymentStatus
  ) => {
    const {
      error,
    } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
      })
      .eq("id", orderId);

    if (error) {
      throw new Error(error.message);
    }

    setOrders((current) =>
      current.map((order) =>
        String(order.id) === String(orderId)
          ? {
              ...order,
              paymentStatus,
            }
          : order
      )
    );
  };

  /* --------------------------------------------------
     CLEAR LOCAL ORDERS
  -------------------------------------------------- */

  const clearOrders = () => {
    setOrders([]);
    localStorage.removeItem(
      ORDER_STORAGE_KEY
    );
  };

  /* --------------------------------------------------
     CONTEXT VALUE
  -------------------------------------------------- */

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
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

/* --------------------------------------------------
   HOOK
-------------------------------------------------- */

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