require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;
const JOTFORM_FORM_ID = '243095265082154'; // Replace with your actual form ID

// 1. Initialize the webhook on JotForm
async function initializeWebhook() {
  try {
    const webhookURL = 'https://webhook-jform-i04y3i7pe-udays-projects-42c3d836.vercel.app/api/webhook';
    const response = await axios.post(
      `https://api.jotform.com/form/${JOTFORM_FORM_ID}/webhooks`,
      { webhookURL },
      {
        headers: {
          'Content-Type': 'application/json',
          APIKEY: JOTFORM_API_KEY,
        },
      }
    );
    console.log('Webhook added:', response.data);
  } catch (error) {
    console.error('Error setting webhook:', error);
  }
}

// 2. Call this function once when the server starts
initializeWebhook();

// 3. Handle incoming webhook events
app.post('/api/webhook', async (req, res) => {
  const { submissionID } = req.body;

  try {
    // Fetch submission details
    const submissionResponse = await axios.get(
      `https://api.jotform.com/submission/${submissionID}`,
      { headers: { APIKEY: JOTFORM_API_KEY } }
    );
    const submissionData = submissionResponse.data.content;

    // Define new fields to add
    const profileLink = `https://www.jotform.com/pdf-view/${submissionID}`;
    const sendInterestLink = `https://mail.google.com/mail/?view=cm&fs=1&to=nripelligola@gmail.com&su=Interested%20in%20a%20profile&body=Hi!%20I%20am%20interested%20in%20${profileLink}`;
    const contactSupportLink = 'https://wa.me/15125932226';

    // Update submission with new data
    await axios.post(
      `https://api.jotform.com/submission/${submissionID}`,
      {
        'submission[profile_link]': profileLink,
        'submission[send_interest]': sendInterestLink,
        'submission[contact_support]': contactSupportLink,
      },
      { headers: { APIKEY: JOTFORM_API_KEY } }
    );

    console.log(`Submission ${submissionID} updated with new fields.`);
    res.status(200).json({ message: 'Submission updated successfully' });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
