// logger ///////////////////////////////////////////
export const logger = (req, res, next) => {
  const timestamp = new Date().toUTCString();
  const method = req.method;
  const path = req.path;
  const user = req.session.user;
  let authStatus = "Non-Authenticated";

  if (user) {
    authStatus = "Authenticated";
  }
  console.log(`[${timestamp}]: ${method} ${path} (${authStatus})`);
  next();
};
// GET / login /////////////////////////////////////
export const redirectIfLoggedInLogin = (req, res, next) => {
  const user = req.session.user;

  if (user) {
    return res.redirect("/landing");
  }

  next();
};
// GET / register //////////////////////////////////
export const redirectIfLoggedInRegister = (req, res, next) => {
  const user = req.session.user;

  if (user) {
    return res.redirect("/landing");
  }
  next();
};
// GET / user /////////////////////////////////////
export const requireUserLogin = (req, res, next) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  } else {
    next();
  }
};
// GET / signout /////////////////////////////////////
export const requireLoginSignout = (req, res, next) => {
  const user = req.session.user;
  if (!user) {
    return res.redirect("/login");
  } else {
    next();
  }
};
/////////////////////////////////////////////////////
