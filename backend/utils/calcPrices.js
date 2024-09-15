function addDecimals(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

// NOTE: the code below has been changed from the course code to fix an issue
// with type coercion of strings to numbers.
// Our addDecimals function expects a number and returns a string, so it is not
// correct to call it passing a string as the argument.

export function calcPrices(orderItems, shippingAddress) {
  // Calculate the items price in whole number (pennies) to avoid issues with
  // floating point number calculations
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + (item.price * 100 * item.qty) / 100,
    0
  );

  // Calculate the vat price
  const vatPrice = 0.15 * itemsPrice;

  // Determine shipping cost based on city and order amount
  let shippingPrice = 0;

  if (shippingAddress && shippingAddress.city.toLowerCase() === 'paarl') {
    // Free shipping for Paarl customers
    shippingPrice = 0;
  } else {
    // Outside Paarl: R100 shipping if below R500, free if above R500
    shippingPrice = itemsPrice > 500 ? 0 : 100;
  }

  // Calculate total price (excluding VAT if you want to display it separately)
  const totalPriceWithoutShipping = itemsPrice;
  const totalPrice = totalPriceWithoutShipping + shippingPrice;

  // return prices as strings fixed to 2 decimal places
  return {
    itemsPrice: addDecimals(itemsPrice),
    shippingPrice: addDecimals(shippingPrice),
    vatPrice: addDecimals(vatPrice),
    totalPriceWithoutShipping: addDecimals(totalPriceWithoutShipping),
    totalPrice: addDecimals(totalPrice),
  };
}