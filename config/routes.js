const parseString = require("xml2js").parseString;
const stripPrefix = require("xml2js").processors.stripPrefix;
const decoder = require('saml-encoder-decoder-js');
const  Saml2js = require('saml2js');

module.exports = function (app, config, passport) {

  app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
      res.render('home',
        {
          user: req.user
        });
    } else {
      res.render('home',
        {
          user: null
        });
    }
  });

  app.get('/login',
    passport.authenticate(config.passport.strategy,
      {
        successRedirect: '/',
        failureRedirect: '/login'
      })
  );

  app.post(config.passport.saml.path,
    passport.authenticate(config.passport.strategy,
      {
        failureRedirect: '/',
        failureFlash: true
      }),
    function (req, res) {
      var samlResponse = req.body.SAMLResponse;
      var parser = new Saml2js(samlResponse);
      var parsedObject = parser.toObject();
      console.log(parsedObject);
      // Decode response
      //var xml = new Buffer(samlResponse, 'base64').toString('ascii');
      decoder.decodeSamlPost(samlResponse, (err, xmlResponse) => {
        if (err) {
          throw new Error(err);
        } else {
          parseString(xmlResponse, { tagNameProcessors: [stripPrefix] }, function (err, result) {
            if (err) {
              throw err;
            } else {

              //sign token
              //token = JWT.sign({ id: nameID }, keyConfig.secretKey, {
             //   expiresIn: '24h' //other configuration options
             // });
              console.log(result);

            }
          });
        }
      })

      //console.log(xml)
      res.redirect('/');
    }
  );

  app.get('/signup', function (req, res) {
    res.render('signup');
  });

  app.get('/profile', function (req, res) {
    if (req.isAuthenticated()) {
      res.render('profile',
        {
          user: req.user
        });
    } else {
      res.redirect('/login');
    }
  });

  app.get('/logout', function (req, res) {
    req.logout();
    // TODO: invalidate session on IP
    res.redirect('/');
  });

};
