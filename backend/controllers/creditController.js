const CreditRequest = require('../models/CreditRequest');
const Customer = require('../models/Customer');

// Get All Credit Requests with Customer Details
exports.getCreditRequests = async (req, res) => {
  try {
    const requests = await CreditRequest.find().populate('customerId');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
