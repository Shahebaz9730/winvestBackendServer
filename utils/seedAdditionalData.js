const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Complaint = require('../models/Complaint');
const ContactInquiry = require('../models/ContactInquiry');

const seedData = async () => {
  try {
    await connectDB();

    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      await Complaint.insertMany([
        {
          name: 'Rajesh Sharma',
          email: 'rajesh.sharma@gmail.com',
          phone: '+91 98230 11223',
          subject: 'Delayed SMS alerts for Stop Loss trigger',
          complaintText: 'I noticed a 5-minute delay in receiving SMS alert for the HDFC Bank stop loss update. Kindly look into the latency.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          adminNotes: 'Investigating with telecom SMS gateway provider.'
        },
        {
          name: 'Pooja Verma',
          email: 'pooja.verma@yahoo.com',
          phone: '+91 97112 33445',
          subject: 'Billing issue regarding research subscription',
          complaintText: 'Double deduction on renewal for Q3 2026 advisory report bundle.',
          status: 'RESOLVED',
          priority: 'MEDIUM',
          adminNotes: 'Refund of duplicate transaction processed successfully.'
        },
        {
          name: 'Amitabh Deshmukh',
          email: 'amitabh.d@outlook.com',
          phone: '+91 99887 66554',
          subject: 'Unable to open PDF report on mobile',
          complaintText: 'The daily morning advisory market bulletin PDF file fails to open properly on iOS.',
          status: 'PENDING',
          priority: 'LOW',
          adminNotes: ''
        }
      ]);
      console.log('Sample Complaints seeded');
    }

    const contactCount = await ContactInquiry.countDocuments();
    if (contactCount === 0) {
      await ContactInquiry.insertMany([
        {
          fullName: 'Vikram Malhotra',
          email: 'vikram.m@investcorp.in',
          phone: '+91 98450 99887',
          subject: 'Institutional Advisory Subscription Inquiry',
          message: 'We manage a portfolio of ₹50Cr+ and are interested in your institutional research desk and customized call alerts.',
          status: 'NEW'
        },
        {
          fullName: 'Ananya Sen',
          email: 'ananya.sen@gmail.com',
          phone: '+91 91234 56780',
          subject: 'Technical Webinar Schedule Inquiry',
          message: 'Could you please share the dates for the upcoming technical analysis workshop and registration link?',
          status: 'CONTACTED'
        },
        {
          fullName: 'Sunil Chawla',
          email: 'sunil.chawla@hdfcsec.com',
          phone: '+91 98110 22334',
          subject: 'Partnership and Research Syndication',
          message: 'We would like to explore syndicating WinVest research recommendations on our platform.',
          status: 'READ'
        }
      ]);
      console.log('Sample Contact Inquiries seeded');
    }

    console.log('Additional seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
