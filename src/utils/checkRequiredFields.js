module.exports  =  function checkRequiredFields(requiredFields, obj) {
  const missingFields = [];
  requiredFields.forEach((field) => {
    if (!(field in obj)) {
      missingFields.push(field);
    }
  });
  return missingFields;
}