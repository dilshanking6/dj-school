const axios = require('axios');
require('dotenv').config();

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

async function getSheetData(sheetName) {
  try {
    if (!APPS_SCRIPT_URL) throw new Error('APPS_SCRIPT_URL is not defined in .env');
    const response = await axios.post(APPS_SCRIPT_URL, {
      action: 'read',
      sheetName: sheetName
    }, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error(`Error reading ${sheetName}:`, error.message);
    return []; // Return empty array instead of null to prevent map errors
  }
}

async function appendSheetData(sheetName, values) {
  try {
    if (!APPS_SCRIPT_URL) throw new Error('APPS_SCRIPT_URL is not defined in .env');
    await axios.post(APPS_SCRIPT_URL, {
      action: 'append',
      sheetName: sheetName,
      values: values
    }, { timeout: 10000 });
    return true;
  } catch (error) {
    console.error(`Error appending to ${sheetName}:`, error.message);
    throw new Error('Database Connection Error. Please check Google Sheets setup.');
  }
}

async function deleteSheetData(sheetName, id) {
  try {
    const response = await axios.post(APPS_SCRIPT_URL, {
      action: 'delete',
      sheetName: sheetName,
      id: id
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting from ${sheetName}:`, error.message);
    return null;
  }
}

async function updateSheetData(sheetName, id, values) {
  try {
    const response = await axios.post(APPS_SCRIPT_URL, {
      action: 'update',
      sheetName: sheetName,
      id: id,
      values: values
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating ${sheetName}:`, error.message);
    return null;
  }
}

module.exports = { getSheetData, appendSheetData, deleteSheetData, updateSheetData };
