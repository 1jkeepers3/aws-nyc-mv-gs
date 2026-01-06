// general validation helper file for frontend, for use in public front facing application
export const inputExist = (val, variableName) => {
  if (val === undefined || val === null) {
    throw `${variableName || "provided variable"} does not exist`;
  }
};
//////////////////////////////////////////////////////
export const inputString = (val, variableName) => {
  if (typeof val !== "string") {
    throw `${variableName || "provided variable"} is not a string`;
  }
};
//////////////////////////////////////////////////////
export const inputEmptyString = (val, variableName) => {
  if (val.trim().length === 0) {
    throw `${
      variableName || "provided variable"
    } can't be an empty string or just spaces`;
  }
};
//////////////////////////////////////////////////////
export const inputLettersOnly = (val, variableName) => {
  const regex = /^[A-Za-z]+$/;
  if (!regex.test(val))
    throw `${variableName || "provided variable"} must only contain letters`;
};
//////////////////////////////////////////////////////
export const inputLettersNumbersOnly = (val, variableName) => {
  const regex = /^[A-Za-z1-9]+$/;
  if (!regex.test(val))
    throw `${
      variableName || "provided variable"
    } must only contain letters or positive whole numbers`;
};
//////////////////////////////////////////////////////
export const passwordLength = (val, variableName) => {
  if (val.length < 8)
    throw `${
      variableName || "provided variable"
    } must at least 8 characters long`;
};
//////////////////////////////////////////////////////
export const userIdLength = (val, variableName) => {
  if (val.length < 5 || val.length > 10)
    throw `${
      variableName || "provided variable"
    } must between 5 and 10 characters`;
};
//////////////////////////////////////////////////////
export const checkPassWordConstraints = (val, variableName) => {
  const hasUpperCase = /[A-Z]/.test(val);
  const hasNumber = /[0-9]/.test(val);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(val);
  if (!hasUpperCase || !hasNumber || !hasSpecialChar)
    throw `${
      variableName || "provided variable"
    } must contain at least one uppercase character, at least one number and at least one special character`;
};
//////////////////////////////////////////////////////
export const fnlnLength = (val, variableName) => {
  if (val.length < 2 || val.length > 20)
    throw `${
      variableName || "provided variable"
    } must between 2 and 20 characters`;
};
//////////////////////////////////////////////////////
export const inputValidObjectId = (val, variableName) => {
  if (!ObjectId.isValid(val)) {
    throw `${variableName} is an invalid Object ID`;
  }
};
/////////////////////////////////////////////////////