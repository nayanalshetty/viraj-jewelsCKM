import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../context/OrderContext.jsx";

import "./AdminOrders.css";

export default function AdminOrders() {
    const { user, logout } = useAuth();
  const {
    orders,
    loadOrders,
    updateOrderStatus,
    updatePaymentStatus,
  } = useOrders();

  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadAdminOrders();
  }, []);

  const loadAdminOrders = async () => {
    try {
      setLoading(true);
      await loadOrders();
    } catch (error) {
      console.error("Unable to load admin orders:", error);
      alert(error.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderNumber = (order) => {
    return (
      order.orderNumber ||
      order.order_number ||
      order.id ||
      "N/A"
    );
  };

  const getCustomerName = (order) => {
    return (
      order.customer?.name ||
      order.shipping_name ||
      order.name ||
      "Customer"
    );
  };

  const getMobile = (order) => {
    return (
      order.customer?.mobile ||
      order.mobile ||
      "N/A"
    );
  };

  const getTotal = (order) => {
    return Number(
      order.total ||
      order.total_amount ||
      0
    );
  };

  const getPaymentMethod = (order) => {
    const method =
      order.paymentMethod ||
      order.payment_method ||
      "cod";

    if (method === "cod") {
      return "Cash on Delivery";
    }

    return "Online Payment";
  };

  const getPaymentStatus = (order) => {
    return (
      order.paymentStatus ||
      order.payment_status ||
      "pending"
    );
  };

  const getOrderStatus = (order) => {
    return (
      order.orderStatus ||
      order.order_status ||
      "new"
    );
  };

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();

    const orderNumber =
      getOrderNumber(order).toLowerCase();

    const customer =
      getCustomerName(order).toLowerCase();

    const mobile =
      getMobile(order).toLowerCase();

    const matchesSearch =
      !query ||
      orderNumber.includes(query) ||
      customer.includes(query) ||
      mobile.includes(query);

    const currentStatus =
      getOrderStatus(order).toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOrderStatus = async (
    order,
    newStatus
  ) => {
    try {
      const id =
        order.supabaseId ||
        order.id;

      await updateOrderStatus(
        id,
        newStatus
      );

      setSelectedOrder((current) =>
        current
          ? {
              ...current,
              orderStatus: newStatus,
            }
          : current
      );
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Unable to update order status."
      );
    }
  };

  const handlePaymentStatus = async (
    order,
    newStatus
  ) => {
    try {
      const id =
        order.supabaseId ||
        order.id;

      await updatePaymentStatus(
        id,
        newStatus
      );

      setSelectedOrder((current) =>
        current
          ? {
              ...current,
              paymentStatus: newStatus,
            }
          : current
      );
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Unable to update payment status."
      );
    }
  };

  const getStatusClass = (status) => {
    return String(status)
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  if (loading) {
    return (
      <main className="admin-orders-page">
        <div className="admin-orders-loading">
          <div className="admin-loader" />
          <h2>Loading Orders</h2>
          <p>
            Please wait while we load Viraj Jewellery
            orders.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-orders-page">

      {/* HEADER */}

      <section className="admin-orders-header">

        <div>
          <p className="admin-eyebrow">
            VIRAJ JEWELLERY
          </p>

          <h1>
            Order Management
          </h1>

          <p className="admin-subtitle">
            Manage customer orders, payments and
            delivery status.
          </p>
        </div>

        <div className="admin-header-actions">

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadAdminOrders}
          >
            ↻ Refresh Orders
          </button>
          <button
          type="button"
          onClick={async () => {
         try {
          await logout();
          } catch (error) {
         console.error("Logout failed:", error);
      }
    }}
    className="admin-logout-button"
  >
    Logout
  </button>

          <Link
            to="/"
            className="admin-home-button"
          >
            Back to Website
          </Link>

        </div>

      </section>


      {/* SUMMARY */}

      <section className="admin-summary-grid">

        <div className="admin-summary-card">
          <span>Total Orders</span>
          <strong>
            {orders.length}
          </strong>
        </div>

        <div className="admin-summary-card">
          <span>New Orders</span>
          <strong>
            {
              orders.filter(
                (order) =>
                  getOrderStatus(order)
                    .toLowerCase() === "new"
              ).length
            }
          </strong>
        </div>

        <div className="admin-summary-card">
          <span>Pending Payments</span>
          <strong>
            {
              orders.filter(
                (order) =>
                  getPaymentStatus(order)
                    .toLowerCase() === "pending"
              ).length
            }
          </strong>
        </div>

        <div className="admin-summary-card">
          <span>Total Value</span>
          <strong>
            ₹
            {formatPrice(
              orders.reduce(
                (total, order) =>
                  total + getTotal(order),
                0
              )
            )}
          </strong>
        </div>

      </section>


      {/* CONTROLS */}

      <section className="admin-orders-controls">

        <div className="admin-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search order, customer or mobile..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">
            All Orders
          </option>

          <option value="new">
            New
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="processing">
            Processing
          </option>

          <option value="shipped">
            Shipped
          </option>

          <option value="delivered">
            Delivered
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

      </section>


      {/* ORDERS */}

      <section className="admin-orders-card">

        <div className="admin-table-header">

          <div>
            <h2>
              Customer Orders
            </h2>

            <p>
              {filteredOrders.length} order
              {filteredOrders.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

        </div>


        {filteredOrders.length === 0 ? (

          <div className="admin-empty">

            <div className="admin-empty-icon">
              ◇
            </div>

            <h3>
              No Orders Found
            </h3>

            <p>
              There are no orders matching your
              current search.
            </p>

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-orders-table">

              <thead>
                <tr>
                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredOrders.map(
                  (order) => {

                    const orderStatus =
                      getOrderStatus(order);

                    const paymentStatus =
                      getPaymentStatus(order);

                    return (
                      <tr
                        key={
                          order.supabaseId ||
                          order.id ||
                          getOrderNumber(order)
                        }
                      >

                        <td>

                          <button
                            type="button"
                            className="admin-order-number"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                          >
                            {getOrderNumber(
                              order
                            )}
                          </button>

                        </td>


                        <td>

                          <div className="admin-customer">

                            <strong>
                              {getCustomerName(
                                order
                              )}
                            </strong>

                            <span>
                              {getMobile(order)}
                            </span>

                          </div>

                        </td>


                        <td>
                          <span className="admin-date">
                            {formatDate(
                              order.createdAt ||
                              order.created_at
                            )}
                          </span>
                        </td>


                        <td>

                          <div className="admin-payment">

                            <strong>
                              {getPaymentMethod(
                                order
                              )}
                            </strong>

                            <span
                              className={`payment-status ${getStatusClass(
                                paymentStatus
                              )}`}
                            >
                              {paymentStatus}
                            </span>

                          </div>

                        </td>


                        <td>

                          <strong className="admin-amount">
                            ₹
                            {formatPrice(
                              getTotal(order)
                            )}
                          </strong>

                        </td>


                        <td>

                          <select
                            className={`admin-status-select status-${getStatusClass(
                              orderStatus
                            )}`}
                            value={orderStatus}
                            onChange={(event) =>
                              handleOrderStatus(
                                order,
                                event.target.value
                              )
                            }
                          >

                            <option value="new">
                              New
                            </option>

                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="processing">
                              Processing
                            </option>

                            <option value="shipped">
                              Shipped
                            </option>

                            <option value="delivered">
                              Delivered
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>

                          </select>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="admin-view-button"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ORDER DETAILS MODAL */}

      {selectedOrder && (

        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <section
            className="admin-order-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>

                <p>
                  ORDER DETAILS
                </p>

                <h2>
                  {getOrderNumber(
                    selectedOrder
                  )}
                </h2>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                ×
              </button>

            </div>


            <div className="admin-modal-content">

              {/* CUSTOMER */}

              <div className="admin-info-section">

                <h3>
                  Customer Information
                </h3>

                <div className="admin-info-grid">

                  <div>
                    <span>
                      Name
                    </span>

                    <strong>
                      {getCustomerName(
                        selectedOrder
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Mobile
                    </span>

                    <strong>
                      {getMobile(
                        selectedOrder
                      )}
                    </strong>
                  </div>

                </div>

              </div>


              {/* ADDRESS */}

              <div className="admin-info-section">

                <h3>
                  Delivery Address
                </h3>

                <p className="admin-address">

                  {[
                    selectedOrder.address?.house ||
                      selectedOrder.house,

                    selectedOrder.address?.street ||
                      selectedOrder.street,

                    selectedOrder.address?.city ||
                      selectedOrder.city,

                    selectedOrder.address?.state ||
                      selectedOrder.state,

                    selectedOrder.address?.pincode ||
                      selectedOrder.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                    "Address not available"}

                </p>

              </div>


              {/* PAYMENT */}

              <div className="admin-info-section">

                <h3>
                  Payment
                </h3>

                <div className="admin-info-grid">

                  <div>
                    <span>
                      Method
                    </span>

                    <strong>
                      {getPaymentMethod(
                        selectedOrder
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <select
                      value={getPaymentStatus(
                        selectedOrder
                      )}
                      onChange={(event) =>
                        handlePaymentStatus(
                          selectedOrder,
                          event.target.value
                        )
                      }
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="paid">
                        Paid
                      </option>

                      <option value="failed">
                        Failed
                      </option>

                      <option value="refunded">
                        Refunded
                      </option>
                    </select>

                  </div>

                </div>

              </div>


              {/* ORDER */}

              <div className="admin-info-section">

                <h3>
                  Order Information
                </h3>

                <div className="admin-info-grid">

                  <div>
                    <span>
                      Order Status
                    </span>

                    <select
                      value={getOrderStatus(
                        selectedOrder
                      )}
                      onChange={(event) =>
                        handleOrderStatus(
                          selectedOrder,
                          event.target.value
                        )
                      }
                    >
                      <option value="new">
                        New
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="processing">
                        Processing
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>

                    </select>

                  </div>

                  <div>
                    <span>
                      Total Amount
                    </span>

                    <strong className="admin-modal-total">
                      ₹
                      {formatPrice(
                        getTotal(
                          selectedOrder
                        )
                      )}
                    </strong>
                  </div>

                </div>

              </div>


              {/* ITEMS */}

              {selectedOrder.items &&
                selectedOrder.items.length > 0 && (

                  <div className="admin-info-section">

                    <h3>
                      Jewellery Items
                    </h3>

                    <div className="admin-items">

                      {selectedOrder.items.map(
                        (item, index) => (

                          <div
                            className="admin-item"
                            key={
                              item.id ||
                              item.productId ||
                              index
                            }
                          >

                            <div className="admin-item-image">

                              {item.image ? (

                                <img
                                  src={item.image}
                                  alt={
                                    item.name ||
                                    "Jewellery"
                                  }
                                />

                              ) : (

                                <span>
                                  V
                                </span>

                              )}

                            </div>

                            <div>

                              <strong>
                                {item.name ||
                                  "Jewellery"}
                              </strong>

                              <span>
                                Quantity:{" "}
                                {Number(
                                  item.quantity || 1
                                )}
                              </span>

                            </div>

                            <strong>
                              ₹
                              {formatPrice(
                                Number(
                                  item.price || 0
                                ) *
                                  Number(
                                    item.quantity ||
                                      1
                                  )
                              )}
                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

            </div>

          </section>

        </div>

      )}

    </main>
  );
}