exports.format = async (str) => {
  try {
    const name = str.trim().split(' ');
    if (name.length < 2) throw new Error("Please enter fullname");
    return name.map((e) => e[0].toUpperCase() + e.slice(1).toLowerCase()).join(' ');
  } catch (error) {
    throw new Error(`${error.message}`);
  }
};