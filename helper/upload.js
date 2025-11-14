const fs = require('fs');

exports.handleFileUpload = async (file) => {
  try {
    fs.unlinkSync(file.path)
  } catch (error) {
    throw new Error(`Error handling file upload: ${error.message}`);
  }
};