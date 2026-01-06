import { users } from "../config/mongoCollections.js";
import bcrypt from "bcrypt";
import * as helpers from "../helpers.js";
import { ObjectId } from "mongodb";

const saltRounds = 12;
///// Register /////////////////////////////
export const register = async (
  firstName,
  lastName,
  userId,
  email,
  gender,
  city,
  state,
  dateofbirth,
  password
) => {
  // -------------------------------------------------
  // INPUT VALIDATION
  // -------------------------------------------------
  // check all inputs exist
  helpers.inputExist(firstName, "firstName");
  helpers.inputExist(lastName, "lastName");
  helpers.inputExist(userId, "userId");
  helpers.inputExist(email, "email");
  helpers.inputExist(gender, "gender");
  helpers.inputExist(city, "city");
  helpers.inputExist(state, "state");
  helpers.inputExist(dateofbirth, "dateofbirth");
  helpers.inputExist(password, "password");
  // check the string inputs are strings
  helpers.inputString(firstName, "firstName");
  helpers.inputString(lastName, "lastName");
  helpers.inputString(userId, "userId");
  helpers.inputString(email, "email");
  helpers.inputString(gender, "gender");
  helpers.inputString(city, "city");
  helpers.inputString(state, "state");
  helpers.inputString(dateofbirth, "dateofbirth");
  helpers.inputString(password, "password");
  // trim all string inputs
  firstName = firstName.trim();
  lastName = lastName.trim();
  userId = userId.trim();
  email = email.trim();
  gender = gender.trim();
  city = city.trim();
  state = state.trim();
  // check all string inputs aren't empty
  helpers.inputEmptyString(firstName, "firstName");
  helpers.inputEmptyString(lastName, "lastName");
  helpers.inputEmptyString(userId, "userId");
  helpers.inputEmptyString(email, "email");
  helpers.inputEmptyString(gender, "gender");
  helpers.inputEmptyString(city, "city");
  helpers.inputEmptyString(state, "state");
  helpers.inputEmptyString(dateofbirth, "dateofbirth");
  helpers.inputEmptyString(password, "password");
  // check letters only
  helpers.inputLettersOnly(firstName, "firstName");
  helpers.inputLettersOnly(lastName, "lastName");
  helpers.inputLettersOnly(gender, "gender");
  // check letters or numbers only
  helpers.inputLettersNumbersOnly(userId, "userId");
  // check input lengths
  helpers.fnlnLength(firstName, "firstName");
  helpers.fnlnLength(lastName, "lastName");
  helpers.userIdLength(userId, "userId");
  helpers.genderLength(gender, "gender");
  helpers.cityLength(city, "city");
  helpers.stateLength(state, "state");
  helpers.passwordLength(password, "password");
  // check valid gender
  helpers.checkValidGender(gender, "gender");
  // check valid state
  helpers.checkValidState(state, "state");
  // check valid email
  helpers.inputValidEmail(email, "email");
  // check valid date of birth format
  helpers.inputDOB(dateofbirth, "dateofbirth");
  // case insensitive
  userId = userId.toLowerCase();
  // check duplicate userIds
  const userCollection = await users();
  const existingUser = await userCollection.findOne({ userId });
  if (existingUser) throw new Error("User ID already exists");
  // check password constraints
  helpers.checkPassWordConstraints(password, "password");
  // signupDate
  function suDate() {
    const newDateObj = new Date();
    const month = String(newDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(newDateObj.getDate()).padStart(2, "0");
    const year = newDateObj.getFullYear();
    return `${month}/${day}/${year}`;
  }
  const signupDate = suDate();
  // calculate age from dateofbirth
  const age = helpers.calculateAge(dateofbirth);
  // -------------------------------------------------
  // REGISTER
  // -------------------------------------------------
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // user
  const newUser = {
    firstName,
    lastName,
    userId,
    email,
    password: hashedPassword,
    gender,
    city,
    state,
    age,
    socialCreditRating: 0,
    submittedCrashIds: [],
    ratings: [],
    commentedCrashIds: [],
    crashesWitnessed: 0,
    signupDate,
    lastLogin: null,
  };
  // add to db
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.insertedId) throw new Error("Could not register user");
  return { registrationCompleted: true };
};
/////// Login ////////////////////////////////
export const login = async (userId, password) => {
  // -------------------------------------------------
  // INPUT VALIDATION
  // -------------------------------------------------
  // check all inputs exist
  helpers.inputExist(userId, "userId");
  helpers.inputExist(password, "password");
  // check the string inputs are strings
  helpers.inputString(userId, "userId");
  helpers.inputString(password, "password");
  // trim all string inputs
  userId = userId.trim();
  // check all string inputs aren't empty
  helpers.inputEmptyString(userId, "userId");
  helpers.inputEmptyString(password, "password");
  // check length
  helpers.userIdLength(userId, "userId");
  helpers.passwordLength(password, "password");
  // check letters or positive whole numbers
  helpers.inputLettersNumbersOnly(userId, "userId");
  // case insensitive
  userId = userId.toLowerCase();
  // check password constraints
  helpers.checkPassWordConstraints(password, "password");
  // -------------------------------------------------
  // LOGIN
  // -------------------------------------------------
  const userCollection = await users();
  // find user by id
  const user = await userCollection.findOne({ userId });
  if (!user) throw new Error("Either the userId or password is invalid");
  // compare password
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword)
    throw new Error("Either the userId or password is invalid");
  // lastLogin
  function lstLgn() {
    const newDateObj = new Date();
    const month = String(newDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(newDateObj.getDate()).padStart(2, "0");
    const year = newDateObj.getFullYear();
    let hours = newDateObj.getHours();
    const minutes = String(newDateObj.getMinutes()).padStart(2, "0");
    const amorPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month}/${day}/${year} ${hours}:${minutes}:${amorPm}`;
  }
  const lastLogin = lstLgn();
  await userCollection.updateOne({ userId }, { $set: { lastLogin } });
  const updatedUser = await userCollection.findOne({ userId });

  const { _id: id, password: pw, ...userWOIdAndPassword } = updatedUser;
  return {
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    userId: updatedUser.userId,
    signupDate: updatedUser.signupDate,
    lastLogin: updatedUser.lastLogin,
    socialCreditRating: updatedUser.socialCreditRating,
  };
};
//// Get ALL Users ///////////////////////////
export const getAllUsers = async () => {
  const userCollection = await users();

  let userList = await userCollection.find({}).sort({ lastName: -1 }).toArray();

  if (!userList) throw "Could not get all users";

  userList = userList.map((element) => {
    element._id = element._id.toString();
    return element;
  });
  return userList;
};
//////// Get User By Id /////////////////////////
export const getUserById = async (id) => {
  // -------------------------------------------------
  // INPUT VALIDATION
  // -------------------------------------------------
  helpers.inputExist(id, "id");
  helpers.inputString(id, "id");
  id = id.trim();
  helpers.inputEmptyString(id, "id");
  helpers.inputValidObjectId(id, "id");
  // -------------------------------------------------
  // GET USER BY ID
  // -------------------------------------------------
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(id) });
  if (!user) throw `User with ID: ${id} not found`;

  user._id = user._id.toString();
  return user;
};
//////// Rate User /////////////////////////
export const rateUser = async (rateeId, raterId, voteValue) => { // warning to group members: this method assumes -1 and +1 for it to work well
  // -------------------------------------------------
  // INPUT VALIDATION
  // -------------------------------------------------
  helpers.inputExist(rateeId, "rateeId");
  helpers.inputExist(raterId, "raterId");
  helpers.inputExist(voteValue, "voteValue");

  helpers.inputString(rateeId, "rateeId");
  helpers.inputString(raterId, "raterId");

  rateeId = rateeId.trim();
  raterId = raterId.trim();

  helpers.inputEmptyString(rateeId, "rateeId");
  helpers.inputEmptyString(raterId, "raterId");

  helpers.inputValidObjectId(rateeId, "rateeId");
  helpers.inputValidObjectId(raterId, "raterId");

  if (rateeId === raterId) throw "You cannot rate yourself";
  if (voteValue !== 1 && voteValue !== -1) throw "Vote value must be 1 (up) or -1 (down)";
  // -------------------------------------------------
  // RATE USER
  // -------------------------------------------------
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(rateeId) });
  if (!user) throw `User with ID: ${rateeId} not found`;

  const existingRating = user.ratings.findIndex(
    (r) => r.raterId.toString() === raterId
  );
  let shouldUpdate = false;
  let scoreChange = 0;

  if (existingRating === -1) { // new rating entirely
    user.ratings.push({ raterId: raterId, value: voteValue });
    scoreChange = voteValue;
    shouldUpdate = true;
  } 
  else { // existing
    const currentRating = user.ratings[existingRating];

    if (currentRating.value !== voteValue) { // only update if diff val
      user.ratings[existingRating].value = voteValue;
      scoreChange = voteValue * 2;
      shouldUpdate = true;
    }
  }

  if (shouldUpdate) { // if something should change in the rating list:
    const newSocialScore = user.socialCreditRating + scoreChange;
    const updateInfo = await userCollection.updateOne(
      { _id: new ObjectId(rateeId) },
      { 
        $set: { 
          ratings: user.ratings,
          socialCreditRating: newSocialScore
        } 
      }
    );
    if (!updateInfo.matchedCount && !updateInfo.modifiedCount) {
      throw "No update";
    }
    const updatedUser = await userCollection.findOne({ _id: new ObjectId(rateeId) });
    updatedUser._id = updatedUser._id.toString();
    return updatedUser;
  }

  user._id = user._id.toString();
  return user;
}

////////////////////////////////////////////////////
