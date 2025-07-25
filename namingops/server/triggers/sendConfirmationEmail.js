// This is a MongoDB Realm/Atlas Trigger that sends a confirmation email
// when a new name request is submitted

exports = async function(changeEvent) {
  // Only run on insert operations
  if (changeEvent.operationType !== 'insert') {
    console.log('Not an insert operation, skipping...');
    return;
  }

  const nameRequest = changeEvent.fullDocument;
  
  // Get the user's email from the request
  const userEmail = nameRequest.submittedByEmail;
  
  if (!userEmail) {
    console.error('No email found for user:', nameRequest.submittedBy);
    return;
  }

  // Prepare email content
  const emailSubject = `Name Request Submitted: ${nameRequest.requestedName}`;
  
  const emailBody = `
    <h2>Thank you for your name request submission!</h2>
    
    <p>Your request has been received and is now being reviewed by our team.</p>
    
    <h3>Request Details</h3>
    <ul>
      <li><strong>Request ID:</strong> ${nameRequest._id}</li>
      <li><strong>Requested Name:</strong> ${nameRequest.requestedName}</li>
      <li><strong>Asset Type:</strong> ${nameRequest.assetType}</li>
      <li><strong>Submission Date:</strong> ${new Date(nameRequest.submittedAt).toLocaleDateString()}</li>
    </ul>
    
    <p>You can check the status of your request at any time by logging into your account.</p>
    
    <p>If you have any questions, please contact our support team.</p>
    
    <p>Best regards,<br>The NamingOps Team</p>
  `;

  // Access the mail service
  const mailService = context.services.get("realm").auth("api-key").email;
  
  try {
    // Send the email
    await mailService.sendEmail({
      to: userEmail,
      subject: emailSubject,
      body: emailBody,
      isHtml: true
    });
    
    console.log(`Confirmation email sent to ${userEmail} for request ${nameRequest._id}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    
    // Log the error to a collection for failed emails
    const db = context.services.get('mongodb-atlas').db('namingops');
    await db.collection('failedEmails').insertOne({
      type: 'confirmation',
      recipient: userEmail,
      requestId: nameRequest._id,
      error: error.message,
      timestamp: new Date()
    });
  }
};
