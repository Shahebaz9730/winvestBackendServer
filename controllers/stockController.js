const Stock = require('../models/Stock');
const SymbolModel = require('../models/Symbol');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all available stocks for dropdowns
 * @route   GET /api/stocks
 * @access  Private / Public
 */
const getStocks = async (req, res, next) => {
  try {
    const stocks = await Stock.find({ isActive: true }).sort({ name: 1 }).lean();
    return sendSuccess(res, 200, 'Stocks fetched successfully', { stocks });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all available symbols for dropdowns
 * @route   GET /api/symbols
 * @access  Private / Public
 */
const getSymbols = async (req, res, next) => {
  try {
    const symbols = await SymbolModel.find({ isActive: true }).sort({ symbol: 1 }).lean();
    return sendSuccess(res, 200, 'Symbols fetched successfully', { symbols });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new stock master
 * @route   POST /api/stocks
 * @access  Private (Admin)
 */
const createStock = async (req, res, next) => {
  try {
    const { name, symbol, exchange, sector } = req.body;
    if (!name || !symbol) {
      return sendError(res, 400, 'Name and Symbol are required');
    }

    const stock = await Stock.create({
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      exchange: exchange || 'NSE',
      sector: sector || ''
    });

    // Also ensure symbol exists in symbols collection
    await SymbolModel.findOneAndUpdate(
      { symbol: symbol.trim().toUpperCase() },
      {
        symbol: symbol.trim().toUpperCase(),
        stockName: name.trim(),
        exchange: exchange || 'NSE',
        isActive: true
      },
      { upsert: true, returnDocument: 'after' }
    );

    return sendSuccess(res, 201, 'Stock created successfully', { stock });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStocks,
  getSymbols,
  createStock
};
