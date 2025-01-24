// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useGetOrderDetailsQuery } from "../slices/ordersApiSlice"; // Adjust import as necessary
// import Loader from "../components/Loader"; // Adjust import as necessary
// import Message from "../components/Message"; // Adjust import as necessary
// import crypto from "crypto";

// const PayFastScreen = () => {
//   const { id: orderId } = useParams();
//   const { data: order, error, isLoading } = useGetOrderDetailsQuery(orderId);
//   const [signature, setSignature] = useState("");

//   useEffect(() => {
//     if (order) {
//       // Prepare order details for signature
//       const orderDetails = {
//         merchant_id: "your_merchant_id",
//         merchant_key: "your_merchant_key",
//         amount: order.totalPrice,
//         item_name: order.orderItems.map((item) => item.name).join(", "), // Example
//         name_first: order.user.name,
//         email_address: order.user.email,
//         return_url: "your_return_url",
//         cancel_url: "your_cancel_url",
//       };

//       const generateSignature = (data, passPhrase) => {
//         let pfOutput = "";
//         for (let key in data) {
//           if (data[key] !== "") {
//             pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`;
//           }
//         }
//         let getString = pfOutput.slice(0, -1);
//         if (passPhrase) {
//           getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
//         }

//         return crypto.createHash("md5").update(getString).digest("hex");
//       };

//       const signature = generateSignature(orderDetails);
//       setSignature(signature);
//     }
//   }, [order]);

//   if (isLoading) return <Loader />;
//   if (error) return <Message variant="danger">Error loading order details</Message>;

//   return (
//     <div>
//       <h2>PayFast Payment</h2>
//       <form action="your_payfast_url" method="POST">
//         <input type="hidden" name="merchant_id" value="your_merchant_id" />
//         <input type="hidden" name="merchant_key" value="your_merchant_key" />
//         <input type="hidden" name="signature" value={signature} />
//         <input type="hidden" name="amount" value={order.totalPrice} />
//         <input type="hidden" name="item_name" value={order.orderItems.map((item) => item.name).join(", ")} />
//         <input type="hidden" name="name_first" value={order.user.name} />
//         <input type="hidden" name="email_address" value={order.user.email} />
//         <input type="hidden" name="return_url" value="your_return_url" />
//         <input type="hidden" name="cancel_url" value="your_cancel_url" />
//         <button type="submit">Pay Now</button>
//       </form>
//     </div>
//   );
// };

// export default PayFastScreen;
