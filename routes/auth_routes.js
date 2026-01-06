import { Router } from "express";
import xss from "xss";
import {
  redirectIfLoggedInLogin,
  redirectIfLoggedInRegister,
  requireUserLogin,
  requireLoginSignout,
  logger,
} from "../middleware.js";
import * as userData from "../data/users.js";
import * as helpers from "../helpers.js";

const router = Router();
////////////////////////////////////////////////////
router.use(logger);
////////////////////////////////////////////////////
router.route("/").get(async (req, res) => {
  const user = req.session.user || null;
  res.render("home", {
    title: helpers.APP_NAME,
    subTitle: "Group 21 Final Project",
    user: user,
    isLoggedIn: !!user,
  });
});
////////////////////////////////////////////////////
router
  .route("/register")
  .get(redirectIfLoggedInRegister, async (req, res) => {
    res.render("register", {
      title: helpers.APP_NAME,
      subTitle: "Register",
    });
  })
  ////////////////////////////////////////////////////
  .post(async (req, res) => {
    let {
      firstName,
      lastName,
      userId,
      email,
      gender,
      city,
      state,
      dateofbirth,
      password,
      confirmPassword,
    } = req.body;
    // XSS Protection
    firstName = xss(firstName);
    lastName = xss(lastName);
    userId = xss(userId);
    password = xss(password);
    confirmPassword = xss(confirmPassword);
    try {
      //----------------------------------------------
      // INPUT VALIDATION
      //----------------------------------------------
      // input exist?
      if (
        !firstName ||
        !lastName ||
        !userId ||
        !email ||
        !gender ||
        !city ||
        !state ||
        !dateofbirth ||
        !password ||
        !confirmPassword
      ) {
        return res.status(400).render("register", {
          error: "All fields are required.",
          title: helpers.APP_NAME,
          subTitle: "Register",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // input are strings ?
      if (
        typeof firstName !== "string" ||
        typeof lastName !== "string" ||
        typeof userId !== "string" ||
        typeof email !== "string" ||
        typeof gender !== "string" ||
        typeof city !== "string" ||
        typeof state !== "string" ||
        typeof dateofbirth !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string"
      ) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error:
            "fields [firstName, lastName, userId, email,gender, city, state, dateofbirth, password, confrimPassword] must be strings.",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // trim all string inputs
      firstName = firstName.trim();
      lastName = lastName.trim();
      userId = userId.trim();
      email = email.trim();
      gender = gender.trim();
      city = city.trim();
      state = state.trim();
      // check date of birth
      const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

      if (!dateRegex.test(dateofbirth)) {
        console.log(dateofbirth);
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error: "Date of birth is invalid",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }

      const [year, month, day] = dateofbirth.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const today = new Date();

      let age = today.getFullYear() - dateObj.getFullYear();
      const monthDiff = today.getMonth() - dateObj.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dateObj.getDate())
      ) {
        age--;
      }

      if (
        dateObj.getFullYear() !== year ||
        dateObj.getMonth() !== month - 1 ||
        dateObj.getDate() !== day ||
        age < 18 ||
        age > 100
      ) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error: "You must be at least 18 years old and provide a valid date.",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // check firstName
      if (
        firstName.trim().length === 0 ||
        !/^[A-Za-z]+$/.test(firstName) ||
        firstName.length < 2 ||
        firstName.length > 20
      ) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error:
            "firstName must be a valid string with letters only and must be >= 2 characters and <= 20 characters",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // check lastName
      if (
        lastName.trim().length === 0 ||
        !/^[A-Za-z]+$/.test(lastName) ||
        lastName.length < 2 ||
        lastName.length > 20
      ) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error:
            "lastName must be a valid string with letters only and must be >= 2 characters and <= 20 characters",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // check userId
      if (
        userId.trim().length === 0 ||
        userId.length < 5 ||
        userId.length > 10
      ) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error:
            "userId must be a valid string with and must be >= 5 characters and <= 10 characters",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // case insensitive
      userId = userId.toLowerCase();
      // check password
      if (
        password.length === 0 ||
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error:
            "password must be valid string and a minimum of 8 characters long.  There needs to be at least one uppercase character, there has to be at least one number and there has to be at least one special character",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // check confirmPasword
      if (password !== confirmPassword) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error: "password and confirmPassword do not match.",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // check gender
      const validGenders = ["male", "female"];
      if (!validGenders.includes(gender.toLowerCase())) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error: 'gender must be either "male" or "female"',
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // check state
      const validStates = [
        "alabama",
        "alaska",
        "arizona",
        "arkansas",
        "california",
        "colorado",
        "connecticut",
        "delaware",
        "district of columbia",
        "florida",
        "georgia",
        "hawaii",
        "idaho",
        "illinois",
        "indiana",
        "iowa",
        "kansas",
        "kentucky",
        "louisiana",
        "maine",
        "maryland",
        "massachusetts",
        "michigan",
        "minnesota",
        "mississippi",
        "missouri",
        "montana",
        "nebraska",
        "nevada",
        "new hampshire",
        "new jersey",
        "new mexico",
        "new york",
        "north carolina",
        "north dakota",
        "ohio",
        "oklahoma",
        "oregon",
        "pennsylvania",
        "rhode island",
        "south carolina",
        "south dakota",
        "tennessee",
        "texas",
        "utah",
        "vermont",
        "virginia",
        "washington",
        "west virginia",
        "wisconsin",
        "wyoming",
      ];
      if (!validStates.includes(state.toLowerCase())) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error: "must be a valid State in the United States of America.",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      // check email
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      const domainParts = email.split("@")[1];

      if (
        email.length > 254 ||
        !emailRegex.test(email) ||
        !domainParts ||
        !/\.[A-Za-z]{2,63}$/.test(domainParts)
      ) {
        return res.status(400).render("register", {
          title: helpers.APP_NAME,
          subTitle: "Register",
          error: "email is invalid.",
          user: {
            firstName,
            lastName,
            userId,
            email,
            password,
            gender,
            city,
            state,
            dateofbirth,
          },
        });
      }
      //----------------------------------------------
      // POST / register
      //----------------------------------------------
      const newUser = await userData.register(
        firstName,
        lastName,
        userId,
        email,
        gender,
        city,
        state,
        dateofbirth,
        password
      );

      if (newUser.registrationCompleted) {
        return res.redirect("/login");
      }
      res.status(500).render("register", {
        title: helpers.APP_NAME,
        subTitle: "Register",
        error: "Internal Server Error",
        user: {
          firstName,
          lastName,
          userId,
          email,
          password,
          gender,
          city,
          state,
          dateofbirth,
        },
      });
    } catch (e) {
      res.status(400).render("register", {
        title: helpers.APP_NAME,
        subTitle: "Register",
        error: e.message || e,
        user: {
          firstName,
          lastName,
          userId,
          email,
          password,
          gender,
          city,
          state,
          dateofbirth,
        },
      });
    }
  });
////////////////////////////////////////////////////
router
  .route("/login")
  .get(redirectIfLoggedInLogin, async (req, res) => {
    res.render("login", {
      title: helpers.APP_NAME,
      subTitle: "Login",
    });
  })
  ////////////////////////////////////////////////////
  .post(async (req, res) => {
    try {
      let { userId, password } = req.body;
      // XSS Protection
      userId = xss(userId);
      password = xss(password);
      //----------------------------------------------
      // INPUT VALIDATION
      //----------------------------------------------
      // input exist?
      if (!userId || !password) {
        return res.status(400).render("login", {
          title: helpers.APP_NAME,
          subTitle: "Login",
          error: "All fields are required",
        });
      }
      // input are strings ?
      if (typeof userId !== "string" || typeof password !== "string") {
        return res.status(400).render("login", {
          title: helpers.APP_NAME,
          subTitle: "Login",
          error: "userId and password must be strings.",
        });
      }
      // trim all string inputs
      userId = userId.trim();
      // check userId
      if (
        userId.trim().length === 0 ||
        userId.length < 5 ||
        userId.length > 10
      ) {
        return res.status(400).render("login", {
          title: helpers.APP_NAME,
          subTitle: "Login",
          error:
            "userId must be a valid string with and must be >= 5 characters and <= 10 characters",
        });
      }
      // case insensitive
      userId = userId.toLowerCase();
      // check password
      if (
        password.length === 0 ||
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        return res.status(400).render("login", {
          error:
            "password must be valid string and a minimum of 8 characters long.  There needs to be at least one uppercase character, there has to be at least one number and there has to be at least one special character",
        });
      }
      //----------------------------------------------
      // POST / login
      //----------------------------------------------
      const loggedInUser = await userData.login(userId, password);

      req.session.user = loggedInUser;

      return res.redirect("/landing");
    } catch (e) {
      res.status(400).render("login", { error: e.message || e });
    }
  });
////////////////////////////////////////////////////
router.route("/landing").get(requireUserLogin, async (req, res) => {
  const user = req.session.user;
  res.render("landing", {
    title: helpers.APP_NAME,
    subTitle: "Landing Page",
    user: user,
  });
});
////////////////////////////////////////////////////
router.route("/signout").get(requireLoginSignout, async (req, res) => {
  req.session.destroy();
  res.render("signout", {
    title: helpers.APP_NAME,
    subTitle: "Signed Out",
  });
});
////////////////////////////////////////////////////
export default router;
