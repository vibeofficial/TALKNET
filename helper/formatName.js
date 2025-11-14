exports.format = async (name) => {
  try {
    return name.split(' ').map((e)=> e[0].toUpperCase() + e.slice(1).toLowerCase()).join(' ');
  } catch (error) {
    throw new Error(`Error formatting name: ${error.message}`);

  }
};