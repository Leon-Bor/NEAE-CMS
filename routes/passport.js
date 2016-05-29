var express = require('express');
var router = express.Router();
var cfg = require('./config');
var FC = require('./functions')
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

router.post('/password', FC.isAuth, function(req, res) {
	
	// Change the password...
	if(req.body.cms_password !== req.body.cms_password_re){
		res.json({error: 100})
	}else if(req.body.cms_password.replace(" ",'') == ""){
		res.json({error: 101})
	}else{

	let pwhash = crypto.createHmac('sha256', secret)
	           .update(req.body.cms_password+""+cfg.config.cms_salt)
	           .digest('hex');

	    cfg.cms_password = pwhash;
		res.json({error: 0})
	}

});

router.get('/login',function (req, res) {
	res.render("login")
});

router.get('/logout', function(req,res){
   req.session.destroy()
   req.logout();
   res.redirect('/login')
});

module.exports = router;