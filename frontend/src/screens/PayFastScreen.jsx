// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useGetOrderDetailsQuery } from "../slices/ordersApiSlice";
// import Loader from "../components/Loader";
// import Message from "../components/Message";

// const PayFastScreen = () => {
//   const { id: orderId } = useParams();
//   const { data: order, error, isLoading } = useGetOrderDetailsQuery(orderId);
//   const [payfastData, setPayfastData] = useState(null);

//   useEffect(() => {
//     const fetchPayFastData = async () => {
//       if (order?._id) {
//         try {
//           const res = await fetch("/api/payfast/session", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(order),
//           });

//           const data = await res.json();
//           if (res.ok) {
//             setPayfastData(data);
//             console.log("=== PayFast Form Data Debug ===");
//             console.log(data);
//             console.log("===============================");
//           } else {
//             console.error("PayFast error:", data);
//           }
//         } catch (err) {
//           console.error("Fetch failed:", err);
//         }
//       }
//     };
//     fetchPayFastData();
//   }, [order]);

//   if (isLoading) return <Loader />;
//   if (error)
//     return <Message variant="danger">Error loading order details</Message>;
//   if (!payfastData) return <Loader />;

//   const fieldOrder = [
//     "merchant_id",
//     "merchant_key",
//     "return_url",
//     "cancel_url",
//     "notify_url",
//     "name_first",
//     "email_address",
//     "m_payment_id",
//     "amount",
//     "item_name",
//   ];

//   return (
//     <div>
//       <h2>PayFast Payment</h2>
//       <form action="https://www.payfast.co.za/eng/process" method="POST">
//         {fieldOrder.map((key) => (
//           <input
//             key={key}
//             name={key}
//             type="hidden"
//             value={payfastData[key] || ""}
//           />
//         ))}
//         <button type="submit">Pay Now</button>
//       </form>
//     </div>
//   );
// };

// export default PayFastScreen;
