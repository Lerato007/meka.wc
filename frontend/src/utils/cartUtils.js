export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

// NOTE: the code below has been changed from the course code to fix an issue
// with type coercion of strings to numbers.
// Our addDecimals function expects a number and returns a string, so it is not
// correct to call it passing a string as the argument.

export const updateCart = (state) => {
  // Calculate the items price in whole number (pennies) to avoid issues with
  // floating point number calculations
  const itemsPrice = state.cartItems.reduce(
    (acc, item) => acc + (item.price * 100 * item.qty) / 100,
    0
  );
  state.itemsPrice = addDecimals(itemsPrice);

  // Calculate the vat price
  const vatPrice = 0.15 * itemsPrice;
  state.vatPrice = addDecimals(vatPrice);

  // Determine shipping based on city
  let shippingPrice = 0;

  if (state.shippingAddress.city.toLowerCase() === 'paarl') {
    shippingPrice = 0; // Free for Paarl customers
  } else {
    shippingPrice = itemsPrice > 500 ? 0 : 100; // Outside Paarl
  }

  state.shippingPrice = addDecimals(shippingPrice);

  // Calculate the total price (excluding VAT)
  const totalPrice = itemsPrice + shippingPrice;
  state.totalPrice = addDecimals(totalPrice);

  // Save the cart to localStorage
  localStorage.setItem('cart', JSON.stringify(state));

  return state;
};
