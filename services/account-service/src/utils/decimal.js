const isValidPositiveDecimal = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  if (value.trim() !== value) {
    return false;
  }

  if (value === "") {
    return false;
  }

  if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(value)) {
    return false;
  }

  if (value === "0") {
    return false;
  }

  if (/^0+\.0+$/.test(value)) {
    return false;
  }

  return true;
};

const getDecimalPlaces = (value) => {
  const [, fraction = ""] = value.split(".");

  return fraction.length;
};

const normalizeDecimal = (value) => {
  const stringValue = value.toString();

  if (!stringValue.includes(".")) {
    return stringValue;
  }

  return stringValue.replace(/0+$/, "").replace(/\.$/, "");
};

module.exports = {
  isValidPositiveDecimal,
  getDecimalPlaces,
  normalizeDecimal,
};
