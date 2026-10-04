const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Stock = require('../models/Stock');
const SymbolModel = require('../models/Symbol');

const stockData = [
  { name: 'TATA MOTORS LIMITED', symbol: 'TATAMOTORS', exchange: 'NSE', sector: 'Automobile' },
  { name: 'RELIANCE INDUSTRIES LIMITED', symbol: 'RELIANCE', exchange: 'NSE', sector: 'Oil & Gas / Conglomerate' },
  { name: 'HDFC BANK LIMITED', symbol: 'HDFCBANK', exchange: 'NSE', sector: 'Banking & Financial' },
  { name: 'ICICI BANK LIMITED', symbol: 'ICICIBANK', exchange: 'NSE', sector: 'Banking & Financial' },
  { name: 'INFOSYS LIMITED', symbol: 'INFY', exchange: 'NSE', sector: 'Information Technology' },
  { name: 'TATA CONSULTANCY SERVICES', symbol: 'TCS', exchange: 'NSE', sector: 'Information Technology' },
  { name: 'STATE BANK OF INDIA', symbol: 'SBIN', exchange: 'NSE', sector: 'Public Banking' },
  { name: 'LARSEN & TOUBRO LIMITED', symbol: 'LT', exchange: 'NSE', sector: 'Infrastructure & Capital Goods' },
  { name: 'BHARTI AIRTEL LIMITED', symbol: 'BHARTIARTL', exchange: 'NSE', sector: 'Telecommunication' },
  { name: 'BAJAJ FINANCE LIMITED', symbol: 'BAJFINANCE', exchange: 'NSE', sector: 'NBFC / Financial Services' },
  { name: 'ITC LIMITED', symbol: 'ITC', exchange: 'NSE', sector: 'FMCG / Diversified' },
  { name: 'KOTAK MAHINDRA BANK', symbol: 'KOTAKBANK', exchange: 'NSE', sector: 'Banking & Financial' },
  { name: 'HINDUSTAN UNILEVER LIMITED', symbol: 'HINDUNILVR', exchange: 'NSE', sector: 'FMCG' },
  { name: 'AXIS BANK LIMITED', symbol: 'AXISBANK', exchange: 'NSE', sector: 'Banking & Financial' },
  { name: 'MARUTI SUZUKI INDIA', symbol: 'MARUTI', exchange: 'NSE', sector: 'Automobile' },
  { name: 'SUN PHARMACEUTICAL INDUSTRIES', symbol: 'SUNPHARMA', exchange: 'NSE', sector: 'Pharmaceuticals' },
  { name: 'TITAN COMPANY LIMITED', symbol: 'TITAN', exchange: 'NSE', sector: 'Consumer Goods / Jewelry' },
  { name: 'ASIAN PAINTS LIMITED', symbol: 'ASIANPAINT', exchange: 'NSE', sector: 'Paints / Chemicals' },
  { name: 'TATA STEEL LIMITED', symbol: 'TATASTEEL', exchange: 'NSE', sector: 'Metals & Mining' },
  { name: 'NTPC LIMITED', symbol: 'NTPC', exchange: 'NSE', sector: 'Power Generation' },
  { name: 'POWER GRID CORPORATION', symbol: 'POWERGRID', exchange: 'NSE', sector: 'Power Transmission' },
  { name: 'MAHINDRA & MAHINDRA', symbol: 'M&M', exchange: 'NSE', sector: 'Automobile' },
  { name: 'ADANI ENTERPRISES LIMITED', symbol: 'ADANIENT', exchange: 'NSE', sector: 'Metals & Mining / Energy' },
  { name: 'ADANI PORTS & SEZ', symbol: 'ADANIPORTS', exchange: 'NSE', sector: 'Ports & Logistics' },
  { name: 'WIPRO LIMITED', symbol: 'WIPRO', exchange: 'NSE', sector: 'Information Technology' },
  { name: 'HCL TECHNOLOGIES LIMITED', symbol: 'HCLTECH', exchange: 'NSE', sector: 'Information Technology' },
  { name: 'ULTRATECH CEMENT LIMITED', symbol: 'ULTRACEMCO', exchange: 'NSE', sector: 'Cement & Building Materials' },
  { name: 'COAL INDIA LIMITED', symbol: 'COALINDIA', exchange: 'NSE', sector: 'Mining & Energy' },
  { name: 'BAJAJ FINSERV LIMITED', symbol: 'BAJAJFINSV', exchange: 'NSE', sector: 'Financial Services' },
  { name: 'TECH MAHINDRA LIMITED', symbol: 'TECHM', exchange: 'NSE', sector: 'Information Technology' },
  { name: 'NESTLE INDIA LIMITED', symbol: 'NESTLEIND', exchange: 'NSE', sector: 'FMCG' },
  { name: 'JSW STEEL LIMITED', symbol: 'JSWSTEEL', exchange: 'NSE', sector: 'Metals & Steel' },
  { name: 'INDUSIND BANK LIMITED', symbol: 'INDUSINDBK', exchange: 'NSE', sector: 'Banking' },
  { name: 'GRASIM INDUSTRIES', symbol: 'GRASIM', exchange: 'NSE', sector: 'Diversified Chemicals' },
  { name: 'CIPLA LIMITED', symbol: 'CIPLA', exchange: 'NSE', sector: 'Pharmaceuticals' }
];

const seedStocksAndSymbols = async () => {
  try {
    await connectDB();

    console.log('Seeding Stocks collection...');
    for (const item of stockData) {
      await Stock.findOneAndUpdate(
        { name: item.name },
        {
          name: item.name,
          symbol: item.symbol,
          exchange: item.exchange,
          sector: item.sector,
          isActive: true
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    console.log('Seeding Symbols collection...');
    for (const item of stockData) {
      await SymbolModel.findOneAndUpdate(
        { symbol: item.symbol },
        {
          symbol: item.symbol,
          stockName: item.name,
          exchange: item.exchange,
          isActive: true
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    console.log(`Successfully seeded ${stockData.length} Stocks and Symbols into Database collections!`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedStocksAndSymbols();
