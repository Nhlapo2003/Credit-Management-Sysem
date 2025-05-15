const express = require('express');
const { submitCreditRequest, reviewCreditRequest, getCreditRequests } = require('../controllers/creditController');
const router = express.Router();

// Submit Credit Request
router.post('/submit', submitCreditRequest);

// Review (Approve/Reject) Credit Request
router.post('/review', reviewCreditRequest);

// Get All Credit Requests
router.get('/requests', getCreditRequests);

module.exports = router;
