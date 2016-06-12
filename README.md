# NEAE CMS
Node.js CMS with Angular.js, Bootstrap, Express.js and Elasticsearch

### What is special about this CMS?
- Use Bootstraps grid as an easy drag-and-drop feature
- Edit your sass/css in the CMS on the fly
- Multiple language Support
- Component/Section based CMS

### Get Started
- Download Elasticsearch (>= v2.0) and start it
- Download and install Node.js (>= v6.0)
- Run `npm install` in root folder
- Run CMS in root folder with `node app.js` or `node app.js nolog`
- Go to `localhost:3030/login` and login with => Username: `admin`, pw: `admin`

##### Multi Language Support

You can add multiple language in the Settings.
The default language will be shown if in your browser is no language set.
You can force a language via URL: `http://localhost:3030?lang=de`.
This will automaticaly set a cookie `lang` and request everytime this language. 

###Todo:
Some parts of the CMS are not done right now. 

- Dashboard functionality
- Some CMS styling
- Fontend validation with bootstrap validator
