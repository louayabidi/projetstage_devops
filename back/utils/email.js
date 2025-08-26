const transport = require("../middlewares/sendMail");

const sendVerificationEmail = async (email, isVerified, rejectionReason = null) => {
  let subject = isVerified ? 'Your Boat Has Been Verified!' : 'Your Boat Verification Was Rejected';
  let htmlContent;

  if (isVerified) {
    htmlContent = `
      <h1>Congratulations!</h1>
      <p>Your boat has been verified by the admin and is now visible to passengers.</p>
      <p>Log in to your dashboard to manage your boat: <a href="http://localhost:5173/dashboard">Dashboard</a>.</p>
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
      await transport.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@yourapp.com',
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`Email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error(`Email attempt failed (${retries} retries left):`, error);
      retries--;
      if (retries === 0) {
        throw new Error(`Failed to send email to ${email}: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }
};

module.exports = { sendVerificationEmail };