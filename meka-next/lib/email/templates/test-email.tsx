import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type TestEmailProps = {
  firstName: string
}

export function TestEmail({ firstName }: TestEmailProps) {
  return (
    <Html>
      <Head />

      <Preview>
        Your Meka.WC email service is working
      </Preview>

      <Body
        style={{
          backgroundColor: "#f4f4f5",
          fontFamily:
            "Arial, Helvetica, sans-serif",
          margin: 0,
          padding: "32px 12px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            margin: "0 auto",
            maxWidth: "600px",
            padding: "32px",
          }}
        >
          <Section>
            <Heading
              style={{
                color: "#18181b",
                fontSize: "28px",
                margin: "0 0 24px",
              }}
            >
              Meka.WC
            </Heading>

            <Heading
              as="h2"
              style={{
                color: "#18181b",
                fontSize: "20px",
                margin: "0 0 16px",
              }}
            >
              Email service connected
            </Heading>

            <Text
              style={{
                color: "#3f3f46",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Hi {firstName},
            </Text>

            <Text
              style={{
                color: "#3f3f46",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Your Meka.WC application successfully sent
              this email through Resend.
            </Text>

            <Hr
              style={{
                borderColor: "#e4e4e7",
                margin: "24px 0",
              }}
            />

            <Text
              style={{
                color: "#71717a",
                fontSize: "13px",
                lineHeight: "20px",
              }}
            >
              This is a development test email. No action
              is required.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}