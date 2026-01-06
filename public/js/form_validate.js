import * as helpers from "./validate.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  if (!registerForm) return;
  registerForm.addEventListener("submit", (event) => {
    try {
      // get form values
      let firstName = document.getElementById("firstName").value;
      let lastName = document.getElementById("lastName").value;
      let userId = document.getElementById("userId").value;
      let password = document.getElementById("password").value;
      let confirmPassword = document.getElementById("confirmPassword").value;
      // ----------------------------------------------
      // INPUT VALIDATION
      // ----------------------------------------------
      // check all inputs exist
      helpers.inputExist(firstName, "firstName");
      helpers.inputExist(lastName, "lastName");
      helpers.inputExist(userId, "userId");
      helpers.inputExist(password, "password");
      helpers.inputExist(confirmPassword, "confirmPassword");
      // check the string inputs are strings
      helpers.inputString(firstName, "firstName");
      helpers.inputString(lastName, "lastName");
      helpers.inputString(userId, "userId");
      helpers.inputString(password, "password");
      helpers.inputString(confirmPassword, "confirmPassword");
      // trim all string inputs
      firstName = firstName.trim();
      lastName = lastName.trim();
      userId = userId.trim();
      // check all string inputs aren't empty
      helpers.inputEmptyString(firstName, "firstName");
      helpers.inputEmptyString(lastName, "lastName");
      helpers.inputEmptyString(userId, "userId");
      helpers.inputEmptyString(password, "password");
      helpers.inputEmptyString(confirmPassword, "confirmPassword");
      // check letters only
      helpers.inputLettersOnly(firstName, "firstName");
      helpers.inputLettersOnly(lastName, "lastName");
      // check letters or numbers only
      helpers.inputLettersNumbersOnly(userId, "userId");
      // check input lengths
      helpers.fnlnLength(firstName, "firstName");
      helpers.fnlnLength(lastName, "lastName");
      helpers.userIdLength(userId, "userId");
      helpers.passwordLength(password, "password");
      helpers.passwordLength(confirmPassword, "confirmPassword");
      // case insensitive
      userId = userId.toLowerCase();
      // check password constraints
      helpers.checkPassWordConstraints(password, "password");
      // check password matches confirmPassword
      if (password !== confirmPassword) {
        throw "password and confirmPassword do not match";
      }
    } catch (e) {
      event.preventDefault();
      let errorContainer = document.getElementById("error");
      if (errorContainer) {
        errorContainer.textContent = e;
      }
    }
  });
});
