const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://snhlapo2003:NGk33gHnHWulW5CN@cluster0.cmluwoz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Credit Request Schema
const creditRequestSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  amountRequested: Number,
  creditPurpose: String,
  documents: [String],
  calculatedScore: Number,
  status: { type: String, default: 'Pending' },
  payments: [{
    amountPaid: Number,
    paymentMethod: String,
    lateFee: Number,
    interest: Number,
    totalAmount: Number,
    paymentDate: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', creditRequestSchema);

// Route: Record Payment
app.post('/api/credit/pay/:_id', async (req, res) => {
  const { _id } = req.params;
  const { amountPaid, paymentMethod, lateFee, interestRate } = req.body;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.payments) user.payments = [];

    const interest = ((amountPaid || 0) * (interestRate / 100)) || 0;
    const totalAmount = (amountPaid || 0) + (lateFee || 0) + interest;

    user.payments.push({
      amountPaid: amountPaid || 0,
      paymentMethod: paymentMethod || 'N/A',
      lateFee: lateFee || 0,
      interest: interest || 0,
      totalAmount
    });

    if (user.payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0) >= user.amountRequested) {
      user.status = 'Paid in Full';
    }

    await user.save();

    res.status(200).json({ message: 'Payment recorded successfully', totalAmount });
  } catch (err) {
    console.error('Payment Error:', err.message);
    res.status(500).json({ message: 'Failed to record payment', error: err.message });
  }
});

// Route: Fetch Paid Amount
app.get('/api/credit/paid/:_id', async (req, res) => {
  const { _id } = req.params;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalPaid = user.payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    res.status(200).json({ totalPaid });
  } catch (err) {
    console.error('Error fetching paid amount:', err);
    res.status(500).json({ message: 'Failed to fetch paid amount', error: err.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
