import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate Order Confirmation Email HTML
export const generateOrderEmailHTML = (order, amount, currency) => {
  const currencySymbol = currency === 'USD' ? '$' : 'R';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #00a95c 0%, #008849 100%);
          color: white; 
          padding: 30px 20px; 
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .content { 
          padding: 30px 20px;
        }
        .order-details { 
          background-color: #f9f9f9; 
          padding: 20px; 
          margin: 20px 0; 
          border-radius: 8px;
          border-left: 4px solid #00a95c;
        }
        .order-details h3 {
          margin-top: 0;
          color: #00a95c;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .item { 
          background-color: white;
          border: 1px solid #eee;
          padding: 15px; 
          margin: 10px 0;
          border-radius: 5px;
        }
        .item-name {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .item-details {
          color: #666;
          font-size: 14px;
        }
        .summary {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #00a95c;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 15px;
        }
        .total-row {
          font-size: 20px;
          font-weight: bold;
          color: #00a95c;
          padding-top: 15px;
          border-top: 2px dashed #ddd;
          margin-top: 10px;
        }
        .shipping-address {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
        }
        .alert-box {
          background-color: #e8f5e9;
          border-left: 4px solid #4caf50;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          background-color: #f9f9f9;
          color: #666; 
          font-size: 12px;
          border-top: 1px solid #eee;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .info-row, .summary-row {
            flex-direction: column;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>
        
        <div class="content">
          <p>Hi <strong>${order.user.name}</strong>,</p>
          <p>Great news! Your payment has been successfully processed and your order is confirmed.</p>
          
          <div class="alert-box">
            <strong>📦 What happens next?</strong><br>
            We're preparing your items for shipment. You'll receive a tracking number via email once your order ships.
          </div>

          <div class="order-details">
            <h3>📋 Order Summary</h3>
            <div class="info-row">
              <span><strong>Order ID:</strong></span>
              <span>${order._id}</span>
            </div>
            <div class="info-row">
              <span><strong>Order Date:</strong></span>
              <span>${new Date(order.createdAt).toLocaleDateString('en-ZA', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="info-row">
              <span><strong>Payment Method:</strong></span>
              <span>${order.paymentMethod}</span>
            </div>
          </div>

          <div class="order-details">
            <h3>🛍️ Items Ordered</h3>
            ${order.orderItems.map(item => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                  Quantity: ${item.qty} × ${currencySymbol}${item.price.toFixed(2)} = ${currencySymbol}${(item.qty * item.price).toFixed(2)}
                </div>
              </div>
            `).join('')}
            
            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${currencySymbol}${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span>${currencySymbol}${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>VAT (15%):</span>
                <span>${currencySymbol}${order.vatPrice.toFixed(2)}</span>
              </div>
              <div class="summary-row total-row">
                <span>Total Paid:</span>
                <span>${currencySymbol}${amount}</span>
              </div>
            </div>
          </div>

          <div class="order-details">
            <h3>🚚 Shipping Address</h3>
            <div class="shipping-address">
              <strong>${order.user.name}</strong><br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country}<br>
              📞 ${order.shippingAddress.phone}
            </div>
          </div>

          <p style="margin-top: 30px;">
            <strong>Need help?</strong><br>
            If you have any questions about your order, please reply to this email or contact us at 
            <a href="mailto:${process.env.EMAIL_FROM}" style="color: #00a95c;">${process.env.EMAIL_FROM}</a>
          </p>
        </div>

        <div class="footer">
          <p><strong>Meka.WC</strong></p>
          <p>© ${new Date().getFullYear()} Meka.WC. All rights reserved.</p>
          <p style="margin-top: 10px; font-size: 11px;">
            This email was sent to ${order.user.email} because you made a purchase on our website.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send Order Confirmation Email
export const sendOrderConfirmationEmail = async (order, amount, currency = 'ZAR') => {
  try {
    console.log('=== SendGrid Email Service ===');
    console.log('Sending to:', order.user.email);
    console.log('Order ID:', order._id);
    
  const msg = {
  to: order.user.email,
  from: process.env.EMAIL_FROM, // 👈 string only
  subject: `Order Confirmation #${order._id} - Meka.WC`,
  text: `Your order ${order._id} has been confirmed.`,
  html: generateOrderEmailHTML(order, amount, currency),
};

    console.log('Sending email via SendGrid...');
    const response = await sgMail.send(msg);
    
    console.log('✅ Email sent successfully!');
    console.log('SendGrid Response Status:', response[0].statusCode);
    
    return { 
      success: true, 
      messageId: response[0].headers['x-message-id'],
      statusCode: response[0].statusCode 
    };
    
  } catch (error) {
    console.error('❌ SendGrid Error:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('SendGrid Response Error:', error.response.body);
    }
    
    return { success: false, error: error.message };
  }
};

// Send Order Shipped Email
export const sendOrderShippedEmail = async (order, trackingNumber) => {
  try {
    console.log('=== Sending Shipping Notification ===');
    console.log('Order ID:', order._id);
    console.log('Tracking Number:', trackingNumber);
    
    const msg = {
      to: order.user.email,
      from: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME || 'Meka.WC'
      },
      subject: `Your Order Has Shipped! #${order._id} - Meka.WC`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #00a95c 0%, #008849 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px 20px; }
            .tracking-box { background-color: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #4caf50; }
            .tracking-number { font-size: 24px; font-weight: bold; color: #00a95c; margin: 10px 0; font-family: monospace; }
            .shipping-address { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; background-color: #f9f9f9; color: #666; font-size: 12px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Your Order is On Its Way!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${order.user.name}</strong>,</p>
              <p>Great news! Your order <strong>#${order._id}</strong> has been shipped and is on its way to you.</p>
              
              <div class="tracking-box">
                <p style="margin: 0 0 10px 0;"><strong>📍 Tracking Number:</strong></p>
                <div class="tracking-number">${trackingNumber}</div>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">You can use this number to track your package</p>
              </div>

              <div class="shipping-address">
                <p style="margin: 0 0 10px 0;"><strong>🚚 Delivering To:</strong></p>
                <p style="margin: 5px 0;">
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                  ${order.shippingAddress.country}
                </p>
              </div>

              <p style="margin-top: 30px;">
                <strong>Questions about your delivery?</strong><br>
                Reply to this email or contact us at 
                <a href="mailto:${process.env.EMAIL_FROM}" style="color: #00a95c;">${process.env.EMAIL_FROM}</a>
              </p>
            </div>
            <div class="footer">
              <p><strong>Meka.WC</strong></p>
              <p>© ${new Date().getFullYear()} Meka.WC. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const response = await sgMail.send(msg);
    console.log('✅ Shipping email sent successfully!');
    
    return { success: true, messageId: response[0].headers['x-message-id'] };
    
  } catch (error) {
    console.error('❌ Error sending shipping email:', error.message);
    return { success: false, error: error.message };
  }
};