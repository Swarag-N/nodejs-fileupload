function verifyName(name) {
  const regex = /E-\d{3}/;
  return regex.test(name);
}

module.exports = { verifyName };
