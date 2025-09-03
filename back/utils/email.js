const nodemailer = require("nodemailer");
const transport = require("../middlewares/sendMail");

const sendVerificationEmail = async (email, isVerified, rejectionReason = null) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`Invalid email format: ${email}`);
    throw new Error(`Invalid email format: ${email}`);
  }

  // Verify transport configuration
  if (!transport || typeof transport.sendMail !== "function") {
    console.error("Email transport is not properly configured");
    throw new Error("Email transport is not properly configured");
  }

  // Check environment variables
  if (!process.env.EMAIL_FROM) {
    console.error("EMAIL_FROM environment variable is not set");
    throw new Error("Email configuration missing: EMAIL_FROM not set");
  }

  console.log(`Preparing to send email to: ${email}, Verified: ${isVerified}, Reason: ${rejectionReason}`);

  let subject = isVerified ? "Your Boat Has Been Verified!" : "Your Boat Verification Was Rejected";
  let htmlContent;

  if (isVerified) {
    htmlContent = `
      <h1>Congratulations!</h1>
      <p>Your boat has been verified by the admin and is now visible to passengers.</p>
      <p>Log in to your dashboard to manage your boat: <a href="http://localhost:5173/boats">SEE ROUR BOAT </a>.</p>
    `;
  } else {
    htmlContent = `
      <h1>Verification Update</h1>
      <p>Unfortunately, your boat verification was rejected.</p>
      <p>Reason: ${rejectionReason}</p>
      <p>Please update your boat information and resubmit: <a href="http://localhost:5173/complete-boat-info">Resubmit Boat Info</a>.</p>
    `;
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const info = await transport.sendMail({
        from: process.env.EMAIL_FROM || "no-reply@yourapp.com",
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`Email sent successfully to ${email}:`, {
        messageId: info.messageId,
        response: info.response,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Email attempt failed (${retries} retries left):`, {
        error: error.message,
        code: error.code,
        response: error.response,
        responseCode: error.responseCode,
      });
      retries--;
      if (retries === 0) {
        throw new Error(`Failed to send email to ${email}: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }
};

module.exports = { sendVerificationEmail };