const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const stockRoutes = require('./routes/stockRoutes');
const symbolRoutes = require('./routes/symbolRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const reportDownloaderRoutes = require("./routes/reportDownloaderRoutes");
const path = require("path");
const researchReportRoutes = require("./routes/researchReportRoutes");
const investorCharterRoutes = require('./routes/investorCharterRoutes');
const visitorRoutes = require('./routes/visitorRoutes');


const app = express();

// Security HTTP headers
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WinVest Research & Advisory Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes


app.use('/api/auth', authRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/symbols', symbolRoutes);
app.use('/api/advertisements', advertisementRoutes);

app.use('/api/visitors', visitorRoutes);

app.use("/api/report-downloaders", reportDownloaderRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Bind Routes
app.use("/api/research-report", researchReportRoutes);

// complaintTable page
// app.use('/api', require('./routes/investorCharterRoutes'));
app.use('/api', investorCharterRoutes);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);
// Static folder access permission for uploaded PDFs



// updatecharter:()=>axiosInstance.put(''),
// updatetrend:()=>axiosInstance.put(''),

module.exports = app;
