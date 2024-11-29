export function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}
// Compare this snippet from src/models/contract.model.js:
