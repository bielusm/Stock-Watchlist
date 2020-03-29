const errorFormater = ({ param }) => {
  return { msg: `${param} is required` };
};

module.exports = errorFormater;
