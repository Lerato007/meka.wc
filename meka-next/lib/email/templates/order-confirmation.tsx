import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"

import type { OrderEmailData } from "@/lib/email/order"

type OrderConfirmationEmailProps = {
  order: OrderEmailData
  orderUrl: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount)
}

export default function OrderConfirmationEmail({
  order,
  orderUrl,
}: OrderConfirmationEmailProps) {
  const previewText = `Payment confirmed for order ${order.orderNumber}`

  return (
    <Html lang="en">
      <Head />

      <Preview>{previewText}</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>MekaWC</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>
              Thank you for your order
            </Heading>

            <Text style={paragraph}>
              Hi {order.customer.firstName},
            </Text>

            <Text style={paragraph}>
              We have received your payment successfully and
              your order is now being prepared.
            </Text>

            <Section style={orderNumberBox}>
              <Text style={label}>Order number</Text>

              <Text style={orderNumber}>
                {order.orderNumber}
              </Text>
            </Section>

            <Hr style={divider} />

            <Heading as="h2" style={sectionHeading}>
              Order summary
            </Heading>

            <Section>
              {order.items.map((item) => (
                <Section key={item.id} style={itemContainer}>
                  <Row>
                    <Column style={imageColumn}>
                      {item.imageUrl ? (
                        <Img
                          src={item.imageUrl}
                          alt={item.name}
                          width="72"
                          height="72"
                          style={productImage}
                        />
                      ) : (
                        <Section style={imagePlaceholder}>
                          <Text style={imagePlaceholderText}>
                            Meka.WC
                          </Text>
                        </Section>
                      )}
                    </Column>

                    <Column style={itemDetailsColumn}>
                      <Text style={itemName}>
                        {item.name}
                      </Text>

                      <Text style={itemMeta}>
                        Quantity: {item.quantity}
                      </Text>

                      <Text style={itemMeta}>
                        {formatCurrency(item.price)} each
                      </Text>
                    </Column>

                    <Column style={itemTotalColumn}>
                      <Text style={itemTotal}>
                        {formatCurrency(item.lineTotal)}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}
            </Section>

            <Hr style={divider} />

            <Section>
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Subtotal</Text>
                </Column>

                <Column style={amountColumn}>
                  <Text style={totalValue}>
                    {formatCurrency(order.subtotal)}
                  </Text>
                </Column>
              </Row>

              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Shipping</Text>
                </Column>

                <Column style={amountColumn}>
                  <Text style={totalValue}>
                    {order.shipping === 0
                      ? "Free"
                      : formatCurrency(order.shipping)}
                  </Text>
                </Column>
              </Row>

              <Row style={grandTotalRow}>
                <Column>
                  <Text style={grandTotalLabel}>Total</Text>
                </Column>

                <Column style={amountColumn}>
                  <Text style={grandTotalValue}>
                    {formatCurrency(order.total)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />

            <Heading as="h2" style={sectionHeading}>
              Delivery address
            </Heading>

            <Text style={addressText}>
              {order.customer.fullName}
              <br />
              {order.shippingAddress.addressLine1}
              <br />

              {order.shippingAddress.addressLine2 && (
                <>
                  {order.shippingAddress.addressLine2}
                  <br />
                </>
              )}

              {order.shippingAddress.city}
              <br />
              {order.shippingAddress.province}
              <br />
              {order.shippingAddress.postalCode}
            </Text>

            <Section style={buttonContainer}>
              <Button href={orderUrl} style={button}>
                View your order
              </Button>
            </Section>

            <Text style={helpText}>
              We will send you another update once your order
              has been shipped.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Thank you for shopping with Meka.WC.
            </Text>

            <Text style={footerText}>
              This email was sent regarding order{" "}
              {order.orderNumber}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f3f4f6",
  fontFamily:
    "Arial, Helvetica, sans-serif",
  margin: "0",
  padding: "32px 12px",
}

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "620px",
  overflow: "hidden",
}

const header = {
  backgroundColor: "#111827",
  padding: "24px 32px",
  textAlign: "center" as const,
}

const brand = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  margin: "0",
}

const content = {
  padding: "36px 32px",
}

const heading = {
  color: "#111827",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "36px",
  margin: "0 0 24px",
  textAlign: "center" as const,
}

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
}

const orderNumberBox = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  margin: "28px 0",
  padding: "18px",
  textAlign: "center" as const,
}

const label = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "1px",
  margin: "0 0 6px",
  textTransform: "uppercase" as const,
}

const orderNumber = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
}

const divider = {
  borderColor: "#e5e7eb",
  margin: "28px 0",
}

const sectionHeading = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 20px",
}

const itemContainer = {
  borderBottom: "1px solid #f3f4f6",
  padding: "0 0 18px",
  margin: "0 0 18px",
}

const imageColumn = {
  width: "84px",
  verticalAlign: "top",
}

const productImage = {
  borderRadius: "8px",
  objectFit: "cover" as const,
}

const imagePlaceholder = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  height: "72px",
  textAlign: "center" as const,
  width: "72px",
}

const imagePlaceholderText = {
  color: "#9ca3af",
  fontSize: "10px",
  lineHeight: "72px",
  margin: "0",
}

const itemDetailsColumn = {
  paddingLeft: "12px",
  verticalAlign: "top",
}

const itemName = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: "600",
  lineHeight: "22px",
  margin: "2px 0 6px",
}

const itemMeta = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
}

const itemTotalColumn = {
  textAlign: "right" as const,
  verticalAlign: "top",
  width: "100px",
}

const itemTotal = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "600",
  margin: "2px 0 0",
}

const totalRow = {
  marginBottom: "8px",
}

const totalLabel = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "4px 0",
}

const totalValue = {
  color: "#374151",
  fontSize: "14px",
  margin: "4px 0",
}

const amountColumn = {
  textAlign: "right" as const,
}

const grandTotalRow = {
  borderTop: "1px solid #e5e7eb",
  marginTop: "12px",
  paddingTop: "12px",
}

const grandTotalLabel = {
  color: "#111827",
  fontSize: "17px",
  fontWeight: "700",
  margin: "12px 0 0",
}

const grandTotalValue = {
  color: "#111827",
  fontSize: "17px",
  fontWeight: "700",
  margin: "12px 0 0",
}

const addressText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
}

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
}

const button = {
  backgroundColor: "#111827",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  padding: "13px 24px",
  textDecoration: "none",
}

const helpText = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "21px",
  margin: "0",
  textAlign: "center" as const,
}

const footer = {
  backgroundColor: "#f9fafb",
  borderTop: "1px solid #e5e7eb",
  padding: "24px 32px",
  textAlign: "center" as const,
}

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "4px 0",
}