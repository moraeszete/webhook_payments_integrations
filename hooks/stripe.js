/*
  * This file is part of the Webhook Template project.
*/

module.exports = async (req, res) => {
  console.log('Stripe webhook received')
  return res.status(200).json({ error: false, message: "Stripe webhook processed!" });
}