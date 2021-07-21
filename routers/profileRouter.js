const _ = require('lodash');
const { Profile } = require('../models/profile');
const authorize = require('../middlewares/authorize');

const getProfile = async (req, res) => {
  const userId = req.user._id;
  const profile = await Profile.findOne({ user: userId });
  return res.status(200).send(profile);
};

const setProfile = async (req, res) => {
  const userId = req.user._id;
  const userProfile = _.pick(req.body, [
    'phone',
    'address1',
    'address2',
    'city',
    'state',
    'postcode',
    'country',
  ]);
  userProfile['user'] = userId;
  let profile = await Profile.findOne({ user: userId });
  if (profile) {
    await Profile.updateOne({ user: userId }, userProfile);
  } else {
    profile = new Profile(userProfile);
    await profile.save();
  }
  return res.status(200).send('Updated Successfully!');
};

router.route('/').get(authorize, getProfile).post(authorize, setProfile);