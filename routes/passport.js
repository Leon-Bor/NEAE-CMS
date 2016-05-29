var express = require('express');
var router = express.Router();
var cfg = require('./config');
const crypto = require('crypto');
const secret = '1LikeTrains';

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {


	let hash = crypto.createHmac('sha256', secret)
	           .update(password+""+cfg.config.cms_salt)
	           .digest('hex');

	console.log(hash)
	           
	if (username != cfg.config.cms_username) {
		console.log("username incorret")
	return done(null, false, { message: 'Incorrect username.' });
	}
	if (hash != cfg.config.cms_password) {
		console.log("upassword incorret")
	return done(null, false, { message: 'Incorrect password.' });
	}
	return done(null, {id: cfg.config.cms_username});

  }
));

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    if(id == cfg.config.cms_username)
        done(null, {id: cfg.config.cms_username});

});

router.post('/login',
  passport.authenticate('local', { successRedirect: '/cms',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

router.get('/login',function (req, res) {
	res.render("login")
});

router.get('/logout', function(req,res){
	console.log('logout')
   req.session.destroy()
   req.logout();
   res.redirect('/login')
});

module.exports = router;