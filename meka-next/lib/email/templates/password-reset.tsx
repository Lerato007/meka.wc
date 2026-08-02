import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type PasswordResetEmailProps = {
  name?: string | null
  resetUrl: string
}

export default function PasswordResetEmail({
  name,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Html lang="en">
      <Head />

      <Preview>Reset your Meka.WC password</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>Meka.WC</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>
              Reset your password
            </Heading>

            <Text style={paragraph}>
              Hi {name?.trim() || "there"},
            </Text>

            <Text style={paragraph}>
              We received a request to reset the password for
              your Meka.WC account.
            </Text>

            <Text style={paragraph}>
              Use the button below to choose a new password.
            </Text>

            <Section style={buttonContainer}>
              <Button href={resetUrl} style={button}>
                Reset password
              </Button>
            </Section>

            <Text style={notice}>
              This link expires in 1 hour and can only be used
              once.
            </Text>

            <Text style={paragraph}>
              If you did not request a password reset, you can
              safely ignore this email. Your password will not
              change.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This email was sent because a password reset was
              requested for your Meka.WC account.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f3f4f6",
  fontFamily: "Arial, Helvetica, sans-serif",
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

const notice = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px",
  padding: "14px 16px",
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
  margin: "0",
}