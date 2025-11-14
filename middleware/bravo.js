const Brevo = require('@getbrevo/brevo')

exports.sendEmail = async (options) => {
  try {
    const apikey = process.env.BREVO_API;
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apikey);
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.to = [{ email: options.email }];
    sendSmtpEmail.sender = { name: 'TALKNET', email: 'udumag51@gmail.com' };
    sendSmtpEmail.htmlContent = options.html;
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
}