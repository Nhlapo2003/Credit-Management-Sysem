const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const router = express.Router();

// MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://snhlapo2003:NGk33gHnHWulW5CN@cluster0.cmluwoz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(router); // Use the defined router


// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((error) => console.error('Error connecting to MongoDB', error));

// Define the Credit Request schema
// Updated Credit Request Schema with Approval and Due Dates
const creditRequestSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  amountRequested: Number,
  accountNumber: Number,
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
  }],
  approvalDate: Date,  // Date of approval
  dueDate: Date        // Calculated due date
});

// Create Model
const CreditRequest = mongoose.model('CreditRequest', creditRequestSchema);


// Admin schema
const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const Admin = mongoose.model('Admin', adminSchema);

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

// Routes

// Login route for customers
app.post('/login', async (req, res) => {
  const { customerName, customerEmail } = req.body;

  try {
    const user = await CreditRequest.findOne({ customerName, customerEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    return res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});

// Credit request submission
app.post('/api/credit/submit', upload.array('documents', 10), async (req, res) => {
  try {
    const { customerName, customerEmail, amountRequested, creditPurpose, calculatedScore,accountNumber } = req.body;
    const documents = req.files.map(file => file.filename);

    const newCreditRequest = new CreditRequest({
      customerName,
      customerEmail,
      amountRequested,
      creditPurpose,
      accountNumber,
      documents,
      calculatedScore,
      payments: []
    });

    await newCreditRequest.save();
    res.status(201).send({ 
      message: 'Credit request submitted successfully',
      requestId: newCreditRequest._id
    });
  } catch (error) {
    res.status(500).send({ message: 'Error submitting credit request', error });
  }
});

// Get all credit requests
app.get('/api/credit/requests', async (req, res) => {
  try {
    const creditRequests = await CreditRequest.find();
    res.status(200).json(creditRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching credit requests', error });
  }
});

// Delete a credit request
app.delete('/api/credit/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await CreditRequest.findByIdAndDelete(id);
    res.status(200).send({ message: 'Credit request deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting credit request', error });
  }
});

// Make a payment
app.post('/api/credit/pay/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentMethod, lateFee = 0, interest = 0 } = req.body;

    const creditRequest = await CreditRequest.findById(id);
    if (!creditRequest) {
      return res.status(404).send({ message: 'Credit Request not found' });
    }

    const totalAmount = parseFloat(amountPaid) + parseFloat(lateFee) + parseFloat(interest);

    creditRequest.payments.push({
      amountPaid,
      paymentMethod,
      lateFee: parseFloat(lateFee),
      interest: parseFloat(interest),
      totalAmount
    });

    await creditRequest.save();
    res.status(200).send({ 
      message: 'Payment recorded successfully', 
      totalAmount,
      remainingBalance: creditRequest.amountRequested - 
        creditRequest.payments.reduce((sum, payment) => sum + payment.amountPaid, 0)
    });
  } catch (error) {
    res.status(500).send({ message: 'Error processing payment', error });
  }
});

// Get payment history
app.get('/api/credit/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const creditRequest = await CreditRequest.findById(id);
    if (!creditRequest) {
      return res.status(404).send({ message: 'Credit Request not found' });
    }

    res.status(200).json({
      payments: creditRequest.payments,
      totalPaid: creditRequest.payments.reduce((sum, payment) => sum + payment.amountPaid, 0),
      remainingBalance: creditRequest.amountRequested - 
        creditRequest.payments.reduce((sum, payment) => sum + payment.amountPaid, 0)
    });
  } catch (error) {
    res.status(500).send({ message: 'Error fetching payment history', error });
  }
});

// Admin registration
app.post('/admin/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json({ message: 'Admin registered' });
  } catch (err) {
    res.status(500).json({ message: 'Error', err });
  }
});

// Admin login
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username, password });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid login' });
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', err });
  }
});

// Update borrower status
app.put('/borrowers/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await CreditRequest.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Status update failed', err });
  }
});
app.get('/api/credit/borrowers', async (req, res) => {
  try {
    const creditRequests = await CreditRequest.find();
    res.status(200).json(creditRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching credit requests', error });
  }
});

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  email: String,
  requestedAmount: Number,
  amountPaid: Number,
  lateFee: Number,
  interestRate: Number,
  paymentMethod: String,
  totalAmount: Number,
  status: String
});

const Payment = mongoose.model('Payment', paymentSchema);


// Route to handle payment
app.post('/api/credit/pay/:id', async (req, res) => {
  const { totalAmount, paymentMethod, lateFee, interest } = req.body;
  const user = await Payment.create({
    email: req.body.email,
    requestedAmount: req.body.requestedAmount,
    lateFee,
    interestRate: interest,
    paymentMethod,
    totalAmount: totalAmount,
    status: amountPaid >= req.body.requestedAmount ? 'Paid' : 'Pending'

  });

  res.status(200).json({ message: 'Payment recorded successfully', payment: user });
});

// Route to update payment status
app.put('/api/credit/status/:id', async (req, res) => {
  const { status } = req.body;
  await Payment.findByIdAndUpdate(req.params.id, { status });
  res.status(200).json({ message: 'Payment status updated successfully' });
});


const User = mongoose.model('User', creditRequestSchema);

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

// ✅ Fetch All Payments Route (for Admin)

app.get("/api/credit/payments", async (req, res) => {
  try {
    const payments = await CreditRequest.find(); // Ensure CreditRequest is your correct model
    
    // Include customerEmail in each payment entry
    const allPayments = payments.flatMap((request) =>
      (request.payments || []).map((payment) => ({
        ...payment.toObject(), // Convert payment to plain object
        customerEmail: request.customerEmail,
        
        amountRequested: request.amountRequested // Add customerEmail
      }))
    );
    
    res.status(200).json({ payments: allPayments });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ error: "Error fetching payment history" });
  }
});

// Delete Payment by ID
app.delete("/api/credit/payments/:id", async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Find the CreditRequest containing this payment
    const creditRequest = await CreditRequest.findOne({
      "payments._id": paymentId
    });

    if (!creditRequest) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Remove the payment from the array
    creditRequest.payments = creditRequest.payments.filter(
      (payment) => payment._id.toString() !== paymentId
    );

    await creditRequest.save();
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ error: "Error deleting payment" });
  }
});
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Updated Document Download Route (Supports All Types)
app.get("/api/credit/documents/:documentId", async (req, res) => {
  const documentId = req.params.documentId;
  console.log("Document ID received:", documentId);

  try {
    // Verify document ID is not empty
    if (!documentId) {
      console.error("No document ID provided.");
      return res.status(400).json({ error: "Document ID is required." });
    }

    // Find the document in the database using the ID directly in the array
    const creditRequest = await CreditRequest.findOne({ documents: documentId });

    if (!creditRequest) {
      console.error("Document not found in any credit request:", documentId);
      return res.status(404).json({ error: "Document not found in database." });
    }

    // Set the path for the document file
    const documentPath = path.join(__dirname, "uploads", documentId);
    console.log("Document Path:", documentPath);

    if (fs.existsSync(documentPath)) {
      const fileExtension = path.extname(documentPath).toLowerCase();

      if (fileExtension === ".pdf") {
        // Serve the existing PDF file
        res.setHeader("Content-Disposition", `inline; filename=${documentId}`);
        res.setHeader("Content-Type", "application/pdf");
        return res.sendFile(documentPath);
      } else {
        // Convert any other file type (e.g., .txt, .docx) to PDF
        const pdfPath = path.join(__dirname, "uploads", `${documentId}.pdf`);
        const pdfDoc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);
        pdfDoc.pipe(writeStream);

        if (fileExtension === ".txt") {
          // Read and convert .txt to PDF
          const textContent = fs.readFileSync(documentPath, "utf-8");
          pdfDoc.text(textContent);
        } else {
          // For unsupported formats, print a message in PDF
          pdfDoc.text(`Document Preview for: ${documentId}`);
          pdfDoc.text("\n\nThis document is of a type that cannot be directly viewed.");
          pdfDoc.text("\n\nPlease contact the administrator for further support.");
        }

        pdfDoc.end();

        // Wait for PDF generation and then send it
        writeStream.on("finish", () => {
          res.setHeader("Content-Disposition", `inline; filename=${documentId}.pdf`);
          res.setHeader("Content-Type", "application/pdf");
          res.sendFile(pdfPath);
        });
      }
    } else {
      console.error("Document file not found on server:", documentPath);
      res.status(404).json({ error: "Document file not found on server." });
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Error fetching document." });
  }
});

// Example route in server1.js
app.get('/api/credit/payments', async (req, res) => {
  try {
    const payments = await Payment.find(); // Adjust this to your MongoDB query
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});


app.get("/api/credit/dashboard", async (req, res) => {
  try {
    const requests = await CreditRequest.find(); 
    const payments = await Payment.find(); 
    
    res.json({
      requests: requests,
      payments: payments
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Update Credit Status with Approval Date and Due Date
app.put('/api/credit/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const creditRequest = await CreditRequest.findById(id);

    if (!creditRequest) {
      return res.status(404).json({ error: 'Credit request not found' });
    }

    creditRequest.status = status;

    if (status === 'Approved') {
      creditRequest.approvalDate = new Date(); // Set approval date to now
      creditRequest.dueDate = new Date();
      creditRequest.dueDate.setDate(creditRequest.approvalDate.getDate() + 30); // Set due date 30 days later
    } else {
      // Clear approval and due dates if status is not approved
      creditRequest.approvalDate = null;
      creditRequest.dueDate = null;
    }

    await creditRequest.save();
    res.json({ message: `Credit request status updated to ${status}`, creditRequest });
  } catch (error) {
    console.error('Error updating credit status:', error);
    res.status(500).json({ error: 'Failed to update credit status' });
  }
});
app.use('/api', router); // If you have a base path like /api

router.get('/api/credit/payments/:email', async (req, res) => {
  const email = req.params.email;

  try {
    const payments = await Payment.find({ customerEmail: email });
    res.status(200).json({ payments });
  } catch (error) {
    console.error('Error fetching payments for email:', email, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/credit/:id', async (req, res) => {
  try {
    const borrower = await CreditRequest.findById(req.params.id);
    if (!borrower) {
      return res.status(404).json({ message: 'Borrower not found' });
    }
    res.status(200).json(borrower);
  } catch (err) {
    console.error('Error fetching borrower:', err);
    res.status(500).json({ message: 'Server error' });
  }
});












// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});