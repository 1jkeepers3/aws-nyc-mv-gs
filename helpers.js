import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
///////////////////////////////////////////////////////
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
export const inputNumber = (val, variableName) => {
  if (typeof val !== "number") {
    throw `${variableName || "provided variable"} is not a number`;
  }
  if (isNaN(val)) {
    throw `${variableName || "provided variable"} can't be NaN`;
  }
};
//////////////////////////////////////////////////////
export const inputObject = (val, variableName) => {
  if (!(val instanceof Object) || Array.isArray(val)) {
    throw `${variableName || "provided variable"} is not an Object`;
  }
};
//////////////////////////////////////////////////////
export const inputLettersOnly = (val, variableName) => {
  const regex = /^[A-Za-z]+$/;
  if (!regex.test(val))
    throw `${variableName || "provided variable"} must only contain letters`;
};
//////////////////////////////////////////////////////
export const fnlnLength = (val, variableName) => {
  if (val.length < 2 || val.length > 20)
    throw `${
      variableName || "provided variable"
    } must between 2 and 20 characters`;
};
//////////////////////////////////////////////////////
export const userIdLength = (val, variableName) => {
  if (val.length < 5 || val.length > 10)
    throw `${
      variableName || "provided variable"
    } must between 5 and 10 characters`;
};
//////////////////////////////////////////////////////
export const genderLength = (val, variableName) => {
  if (val.length < 2 || val.length > 10)
    throw `${
      variableName || "provided variable"
    } must between 2 and 10 characters`;
};
//////////////////////////////////////////////////////
export const cityLength = (val, variableName) => {
  if (val.length < 0 || val.length > 50)
    throw `${
      variableName || "provided variable"
    } must between 0 and 50 characters`;
};
//////////////////////////////////////////////////////
export const stateLength = (val, variableName) => {
  if (val.length < 3 || val.length > 20)
    throw `${
      variableName || "provided variable"
    } must between 3 and 20 characters`;
};
//////////////////////////////////////////////////////
export const passwordLength = (val, variableName) => {
  if (val.length < 8)
    throw `${
      variableName || "provided variable"
    } must at least 8 characters long`;
};
//////////////////////////////////////////////////////
export const inputLettersNumbersOnly = (val, variableName) => {
  const regex = /^[A-Za-z0-9]+$/;
  if (!regex.test(val))
    throw `${
      variableName || "provided variable"
    } must only contain letters or positive whole numbers`;
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
export const checkValidGender = (val, variableName) => {
  const validGenders = ["male", "female"];
  if (!validGenders.includes(val.toLowerCase()))
    throw `${
      variableName || "provided variable"
    } must be either "male" or "female"`;
};
//////////////////////////////////////////////////////
export const checkValidState = (val, variableName) => {
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
  if (!validStates.includes(val.toLowerCase())) {
    throw `${
      variableName || "provided variable"
    } must be a valid State in the United States of America."`;
  }
};
//////////////////////////////////////////////////////
export const inputValidCourseName = (val, variableName) => {
  if (val.length < 5 || val.length > 50) {
    throw `${
      variableName || "provided variable"
    } must be at least 5 characters and no more than 50 characters long`;
  }
  if (!/^[A-Za-z0-9 ]+$/.test(val)) {
    throw `${
      variableName || "provided variable"
    } can contain letters a-z, A-Z, positive whole numbers > 0 and spaces`;
  }
};
//////////////////////////////////////////////////////
export const inputDuplicateCourseName = async (val, variableName) => {
  const courseCollection = await courses();
  const allCourses = await courseCollection.find({}).toArray();
  const duplicate = allCourses.find(
    (c) => c.course_name.trim().toLowerCase() === val.trim().toLowerCase()
  );

  if (duplicate) {
    throw `${
      variableName || "provided variable"
    } There can be no duplicate course names`;
  }
};
//////////////////////////////////////////////////////
export const inputValidCourseCode = (val, variableName) => {
  if (!/^[A-Z]{2,4}-\d{3}$/.test(val)) {
    throw `${
      variableName || "provided variable"
    } must be 2-4 uppercase letters followed by a hyphen and then a single 3-digit whole number`;
  }
  const num = parseInt(val.split("-")[1], 10);
  if (num < 100 || num > 999) {
    throw `${
      variableName || "provided variable"
    } the single 3-digit whole number must be >= 100 and <= 999.`;
  }
};
//////////////////////////////////////////////////////
export const inputDuplicateCourseCode = async (val, variableName) => {
  const courseCollection = await courses();
  const allCourses = await courseCollection.find({}).toArray();
  const duplicate = allCourses.find((c) => c.course_code.trim() === val.trim());

  if (duplicate) {
    throw `${
      variableName || "provided variable"
    } There can be no duplicate course codes`;
  }
};
//////////////////////////////////////////////////////
export const inputValidDepartment = (val, variableName) => {
  if (val.length < 5 || val.length > 50) {
    throw `${
      variableName || "provided variable"
    } must be at least 5 characters and no more than 50 characters long`;
  }
  if (!/^[A-Za-z ]+$/.test(val)) {
    throw `${
      variableName || "provided variable"
    } can contain letters a-z, A-Z, and spaces`;
  }
};
//////////////////////////////////////////////////////
export const inputValidSummary = (val, variableName) => {
  if (val.length < 50 || val.length > 1000) {
    throw `${
      variableName || "provided variable"
    } must be at least 50 characters long and no more than 1000 characters long`;
  }
  let flag = 1;
  const arr = val.split("");
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] === arr[i]) {
      flag = flag + 1;
      if (flag >= 5) {
        throw `${
          variableName || "provided variable"
        } can not repeat the same character 5 times or more`;
      }
    } else {
      flag = 1;
    }
  }
};
//////////////////////////////////////////////////////
export const inputLogisticsValidKeysProps = (val, variableName) => {
  const valKeys = Object.keys(val);
  const logKeys = [
    "start_date",
    "end_date",
    "meeting_days",
    "start_time",
    "end_time",
    "room",
  ];

  let missing = logKeys.filter((key) => !valKeys.includes(key));
  if (missing.length > 0) {
    throw `${
      variableName || "provided variable"
    } must have all of the following keys/properties: ${logKeys}`;
  }
  let extra = valKeys.filter((key) => !logKeys.includes(key));
  if (extra.length > 0) {
    throw `${
      variableName || "provided variable"
    } must have only of the following keys/properties: ${logKeys}`;
  }
  let invalidProperties = logKeys.filter(
    (key) => val[key] === undefined || val[key] === null
  );
  if (invalidProperties.length > 0) {
    throw `${
      variableName || "provided variable"
    } has fields that are not valid values. All fields in the object need to have valid values`;
  }
  let invalidStringType = logKeys.filter(
    (key) => typeof val[key] !== "string" || val[key].trim().length === 0
  );
  if (invalidStringType.length > 0) {
    throw `${
      variableName || "provided variable"
    } must have values that are strings or non-empty strings`;
  }
};
//////////////////////////////////////////////////////
export const inputLogisticsValidStartDateEndDate = (val, variableName) => {
  // start_date
  if (!val.start_date || typeof val.start_date !== "string") {
    throw `${variableName}.start_date is required and must be a non-empty string.`;
  }
  val.start_date = val.start_date.trim();
  const startDate = val.start_date;
  if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(startDate)) {
    throw `${variableName}.start_date must be a valid date in "MM/DD/YYYY" format.  If the month or day is a single digit, it must have the leading 0.`;
  }
  const [monthStart, dayStart, yearStart] = startDate.split("/");
  const moStart = parseInt(monthStart, 10);
  const daStart = parseInt(dayStart, 10);
  const yeStart = parseInt(yearStart, 10);
  const startDateObj = new Date(yeStart, moStart - 1, daStart);

  if (
    startDateObj.getFullYear() !== yeStart ||
    startDateObj.getMonth() + 1 !== moStart ||
    startDateObj.getDate() !== daStart
  )
    throw `${variableName}.start_date is not a valid calendar date`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDateObj < today) {
    throw `${variableName}.start_date must be a date today or in the future`;
  }
  // end_date
  if (!val.end_date || typeof val.end_date !== "string") {
    throw `${variableName}.end_date is required and must be a non-empty string.`;
  }
  val.end_date = val.end_date.trim();
  const endDate = val.end_date;
  if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(endDate)) {
    throw `${variableName}.end_date must be a valid date in "MM/DD/YYYY" format.  If the month or day is a single digit, it must have the leading 0.`;
  }
  const [monthEnd, dayEnd, yearEnd] = endDate.split("/");
  const moEnd = parseInt(monthEnd, 10);
  const daEnd = parseInt(dayEnd, 10);
  const yeEnd = parseInt(yearEnd, 10);
  const endDateObj = new Date(yeEnd, moEnd - 1, daEnd);

  if (
    endDateObj.getFullYear() !== yeEnd ||
    endDateObj.getMonth() + 1 !== moEnd ||
    endDateObj.getDate() !== daEnd
  )
    throw `${variableName}.end_date is not a valid calendar date`;
  if (endDateObj <= startDateObj) {
    throw `${variableName}.end_date must be later than the ${variableName}.start_date`;
  }
  const diffMilliseconds = endDateObj - startDateObj;
  const diffDays = diffMilliseconds / (1000 * 60 * 60 * 24);
  if (diffDays < 56 || diffDays > 113) {
    throw `${variableName}.end_date must be at least 8 weeks after the ${variableName}.start_date and no more than 16 weeks after the ${variableName}.start_date `;
  }
};
//////////////////////////////////////////////////////
export const inputLogisticsValidMeetingDays = (val, variableName) => {
  if (!val.meeting_days || typeof val.meeting_days !== "string") {
    throw `${variableName}.meeting_days is required and must be a non-empty string.`;
  }
  const meetingDays = ["M", "T", "W", "R", "F"];
  val.meeting_days = val.meeting_days.trim();
  const input = val.meeting_days;
  const seenDays = new Set();

  for (let i = 0; i < input.length; i++) {
    if (!meetingDays.includes(input[i])) {
      throw `${variableName}.meeting_days has an invalid day: ${input[i]}. Allowed days: ${meetingDays}`;
    }
    if (seenDays.has(input[i])) {
      throw `${variableName}.meeting_days contains repeated day: ${input[i]}`;
    }
    seenDays.add(input[i]);
  }
  let lastIndex = -1;
  for (let k = 0; k < input.length; k++) {
    let index = meetingDays.indexOf(input[k]);
    if (index < lastIndex) {
      throw `${variableName}.meeting_days must follow the same order of the days of the week "MTWRF" `;
    }
    lastIndex = index;
  }
};
/////////////////////////////////////////////////////
export const inputLogisticsValidStartTimeEndTime = (val, variableName) => {
  // start time
  if (!val.start_time || typeof val.start_time !== "string") {
    throw `${variableName}.start_time is required and must be a non-empty string.`;
  }
  val.start_time = val.start_time.trim();
  const startTime = val.start_time;
  if (!/^([1-9]|1[0-2]):([0-5][0-9])(AM|PM)$/.test(startTime)) {
    throw `${variableName}.start_time must be a valid time in 12-hour AM/PM format.`;
  }
  const [hourStart, minuteStart, ampmStart] = startTime
    .match(/([0-9]+):([0-9]{2}(AM|PM))/)
    .slice(1);
  let startHour = parseInt(hourStart, 10);
  let startMinute = parseInt(minuteStart, 10);
  if (ampmStart === "PM" && startHour !== 12) {
    startHour += 12;
  }
  if (ampmStart === "AM" && startHour === 12) {
    startHour = 0;
  }
  const startMinutesTotal = startHour * 60 + startMinute;
  if (startMinutesTotal < 480 || startMinutesTotal > 1140) {
    throw `${variableName}.start_time must be between 8:00AM and 7:00PM`;
  }
  // end time
  if (!val.end_time || typeof val.end_time !== "string") {
    throw `${variableName}.end_time is required and must be a non-empty string.`;
  }
  val.end_time = val.end_time.trim();
  const endTime = val.end_time;
  if (!/^([1-9]|1[0-2]):([0-5][0-9])(AM|PM)$/.test(endTime)) {
    throw `${variableName}.end_time must be a valid time in 12-hour AM/PM format.`;
  }
  const [hourEnd, minuteEnd, ampmEnd] = endTime
    .match(/([0-9]+):([0-9]{2}(AM|PM))/)
    .slice(1);
  let endHour = parseInt(hourEnd, 10);
  let endMinute = parseInt(minuteEnd, 10);
  if (ampmEnd === "PM" && endHour !== 12) {
    endHour += 12;
  }
  if (ampmEnd === "AM" && endHour === 12) {
    endHour = 0;
  }
  const endMinutesTotal = endHour * 60 + endMinute;

  const diffMinutes = endMinutesTotal - startMinutesTotal;
  if (diffMinutes < 60 || diffMinutes > 180) {
    throw `${variableName}.end_time must be at least 1 hour after the ${variableName}.start_time and no more than 3 hours after the ${variableName}.start_time.`;
  }
};
/////////////////////////////////////////////////////
export const inputLogisticsValidRoom = (val, variableName) => {
  if (!val.room || typeof val.room !== "string") {
    throw `${variableName}.room is required and must be a non-empty string.`;
  }
  val.room = val.room.trim();
  const input = val.room;

  if (input.length < 4 || input.length > 20) {
    throw `${variableName}.room must be at least 4 characters long and no more than 20 characters long.`;
  }
  if (!/^[A-Za-z0-9 -]+$/.test(input)) {
    throw `${variableName}.room can only contain letters, whole numbers > 0, spaces  and a hyphen.All other characters are not allowed`;
  }
  if ((input.match(/-/g) || []).length > 1) {
    throw `${variableName}.room can contain at most one hyphen`;
  }
  if (/^[-\s]|[-\s]$/.test(input)) {
    throw `${variableName}.room cannot start or end with a hyphen or space`;
  }
  if (/\s-\d/.test(input)) {
    throw `${variableName}.room cannot contain negative numbers`;
  }

  const nums = input.match(/\d+/g);

  if (nums) {
    for (let n of nums) {
      let v = parseInt(n, 10);
      if (!Number.isInteger(v) || v <= 0) {
        throw `${variableName}.room must only have whole numbers > 0`;
      }
    }
  }
};
/////////////////////////////////////////////////////
export const inputCreditsValid = (val, variableName) => {
  if (!Number.isInteger(val)) {
    throw `${variableName}.credits must be a whole number`;
  }
  if (val <= 0 || val > 6) {
    throw `${variableName}.credits must be a number > 0 and <=6`;
  }
};
/////////////////////////////////////////////////////
export const inputValidObjectId = (val, variableName) => {
  if (!ObjectId.isValid(val)) {
    throw `${variableName} is an invalid Object ID`;
  }
};
/////////////////////////////////////////////////////
export const roomTimeConflict = (val1, val2, variableName1, variableName2) => {
  if (!val1 || !val2) throw `Invalid ${variableName1}or ${variableName2}`;

  const parseTime = (timeStr) => {
    let time = timeStr.trim().toUpperCase();
    let [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr);
    let minute = parseInt(minuteStr.replace(/\D/g, "") || 0);
    let isPM = time.includes("PM");

    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    return hour * 60 + minute;
  };

  const newStart = parseTime(val1.start_time);
  const newEnd = parseTime(val1.end_time);

  const newDays = Array.from(val1.meeting_days);

  for (let course of val2) {
    let existing = course.logistics;
    if (!existing || existing.room !== val1.room) {
      continue;
    }
    const existingDays = Array.from(existing.meeting_days);
    let overLapDays = newDays.filter((day) => existingDays.includes(day));

    if (overLapDays.length > 0) {
      let existingStart = parseTime(existing.start_time);
      let existingEnd = parseTime(existing.end_time);

      let isOverLap = newStart < existingEnd && newEnd > existingStart;

      if (isOverLap) {
        throw `Room ${val1.room} is already booked on ${overLapDays.join(
          ", "
        )} from ${existing.start_time} - ${existing.end_time}`;
      }
    }
  }
  return true;
};
/////////////////////////////////////////////////////
export const inputFloatNumRange = (val, variableName) => {
  if (val < 0 || val > 100) {
    throw `${variableName} must be in the range of 0 to 100`;
  }
  const decimalPart = val.toString().split(".")[1];
  if (decimalPart && decimalPart.length > 2) {
    throw `${variableName} cannot have more than 2 decimal places`;
  }
};
/////////////////////////////////////////////////////
export const inputDOB = (val, variableName) => {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!dateRegex.test(val)) {
    throw `${variableName} must be in YYYY-MM-DD format and must be a valid date`;
  }

  const [year, month, day] = val.split("-").map(Number);

  const dateObj = new Date(year, month - 1, day);

  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    throw `${variableName} must be a valid calendar date`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateObj > today) {
    throw `${variableName} can not be in the future`;
  }

  let age = today.getFullYear() - dateObj.getFullYear();
  const monthDiff = today.getMonth() - dateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateObj.getDate())
  ) {
    age--;
  }

  if (age < 18 || age > 100) {
    throw `${variableName} indicates age must be between 18 and 100`;
  }
};
/////////////////////////////////////////////////////
export const calculateAge = (val) => {
  const [year, month, day] = val.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // if birthdate hasn't happened this year yet
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
};
/////////////////////////////////////////////////////
export const inputValidMajor = (val, variableName) => {
  if (val.length < 5 || val.length > 50) {
    throw `${
      variableName || "provided variable"
    } must be at least 5 characters and no more than 50 characters long`;
  }
  if (!/^[A-Za-z ]+$/.test(val)) {
    throw `${
      variableName || "provided variable"
    } can contain letters a-z, A-Z and spaces`;
  }
};
/////////////////////////////////////////////////////
export const inputValidEmail = (val, variableName) => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const domainParts = val.split("@")[1];

  if (val.length > 254) {
    throw `${variableName} must be less than 255 characters`;
  }
  if (!emailRegex.test(val)) {
    throw `${variableName} must be a valid email address format`;
  }
  if (!domainParts || !/\.[A-Za-z]{2,63}$/.test(domainParts)) {
    throw `${variableName} must have a valid domain (e.g. gmail.com)`;
  }
};
/////////////////////////////////////////////////////
export const inputValidName = (val, variableName) => {
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'.\- ]*$/u;

  if (val.length < 2 || val.length > 50) {
    throw `${variableName} must be at least 2 characters and no more than 50 characters long`;
  }
  if (!nameRegex.test(val)) {
    throw `${variableName} can contain only letters, accented letters, apostrophes, hyphens, spaces, and periods and must start with a letter`;
  }
};
// Display date and time in NY timezone
export const formatDate = (date) => {
  const options = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  // eg: Nov 05, 2023, 03:24:00 PM
  const month = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
  }).format(date);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    day: "2-digit",
  }).format(date);
  const year = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${month} ${day}, ${year}, ${time}`;
};

// getEmailTransporter
export const getEmailTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "diamabo.dev@gmail.com",
      pass: "uzac syal ulng aymi",
    },
  });
  return transporter;
};

export const timeAgo = (date) => {
  const now = new Date();
  const secondsPast = Math.floor((now - date) / 1000);

  if (secondsPast < 60) {
    return `${secondsPast} seconds ago`;
  }
  if (secondsPast < 3600) {
    const minutes = Math.floor(secondsPast / 60);
    return `${minutes} minutes ago`;
  }
  if (secondsPast < 86400) {
    const hours = Math.floor(secondsPast / 3600);
    return `${hours} hours ago`;
  }
  if (secondsPast < 2592000) {
    const days = Math.floor(secondsPast / 86400);
    return `${days} days ago`;
  }
  if (secondsPast < 31104000) {
    const months = Math.floor(secondsPast / 2592000);
    return `${months} months ago`;
  }
  const years = Math.floor(secondsPast / 31104000);
  return `${years} years ago`;
};
/////////////////////////////////////////////////////
export const APP_NAME = "NYC Motor Vehicle Good Samaritan";
