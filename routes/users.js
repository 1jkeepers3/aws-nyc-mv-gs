import { Router } from "express";
const router = Router();
import { userData } from '../data/index.js';
import * as helpers from '../helpers.js';

// VISIT YOURSELF ///////////////////////////////
router.route('/profile').get(async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const id = req.session.user._id;
  res.redirect(`/users/profile/${id}`);
});

// VISIT A USER ///////////////////////////////
router.route('/profile/:userId').get(async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  let { userId } = req.params;
  try {
    helpers.inputExist(userId, "userId");
    helpers.inputString(userId, "userId");
    userId = userId.trim();
    helpers.inputEmptyString(userId, "userId");
    helpers.inputValidObjectId(userId, "userId");
  } catch (e) {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
      user: req.session.user,
    });
  }
  try {
    const user = await userData.getUserById(userId);
    if (!user) {
      return res.status(404).render("error", {
        title: helpers.APP_NAME,
        subTitle: "Error",
        error: "User Not Found",
        user: req.session.user,
      });
    }
    const currentUserId = req.session.user._id;
    const isOwnProfile = user._id.toString() === currentUserId.toString();
    let isUpvoted = false;
    let isDownvoted = false;
    if (!isOwnProfile && user.ratings) {
      const myVote = user.ratings.find(
        (r) => r.raterId.toString() === currentUserId
      );

      if (myVote) {
        if (myVote.value === 1) isUpvoted = true;
        if (myVote.value === -1) isDownvoted = true;
      }
    }
    return res.render("userProfile", {
      title: helpers.APP_NAME,
      subTitle: `User Profile`,
      userProfile: user,
      user: req.session.user,
      isOwnProfile: isOwnProfile,
      isUpvoted: isUpvoted,
      isDownvoted: isDownvoted
    });
  } catch (e) {
    return res.status(404).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
      user: req.session.user,
    });
  }
});

// RATE A USER ///////////////////////////////
router.route('/rate/:userId/:voteType').post(async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  let { userId, voteType } = req.params;
  const raterId = req.session.user._id;

  const action = voteType.toLowerCase().trim();
  if (action !== 'up' && action !== 'down') {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: "Invalid rating type. Must be 'up' or 'down'.",
      user: req.session.user,
    });
  }
  const voteValue = (action === 'up') ? 1 : -1;

  try {
    helpers.inputExist(userId, "userId");
    helpers.inputString(userId, "userId");
    userId = userId.trim();
    helpers.inputEmptyString(userId, "userId");
    helpers.inputValidObjectId(userId, "userId");
  } catch (e) {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
      user: req.session.user,
    });
  }

  try {
    await userData.rateUser(userId, raterId, voteValue);
    return res.redirect(`/users/profile/${userId}`);
  } catch (e) {
    return res.status(400).render("error", {
      title: helpers.APP_NAME,
      subTitle: "Error",
      error: e,
      user: req.session.user,
    });
  }
});

///////////////////////////////////////////////////
export default router;
