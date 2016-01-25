// Dependencies
var request = require('request');
var qs = require('querystring');
var url = require('url');

// Google Handle


    // Dependencies
var google = require('googleapis');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;

var options = {};
var gpservice = {};
options.id = '590595118800-79odej66vcn2demcou032ol3hu9nk5r5.apps.googleusercontent.com';
options.secret = 'LggSLc7Ll88I5xAEwArUKPYw';
gpservice.dialog = options.dialog || '/auth/google';
gpservice.redirectPath = options.redirect ? options.redirect : 'http://'+app.domain +'/auth/google/redirect';
gpservice.redirect = url.parse(gpservice.redirectPath).pathname;
gpservice.oauth = new OAuth2(options.id, options.secret, gpservice.redirectPath);
gpservice.response = options.response || '/auth/google/response';

// generate a url that asks permissions for Google+ and Google Calendar scopes
gpservice.scopes = ['email', 'profile'];
if(options.scope){
    options.scope.split(',').forEach(function(scope){
        gpservice.scopes.push('https://www.googleapis.com/auth/'+scope.trim());
    });
}

gpservice.url = gpservice.oauth.generateAuthUrl({
    access_type: options.access_type || 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: gpservice.scopes // If you only need one scope you can pass it as string
});

app.get(gpservice.dialog, function(req, res){
    res.redirect(gpservice.url);
});

app.get(gpservice.redirect, function(req, res, mysql){
    accounts = undefined;
    res.head.accounts = undefined;
    gpservice.oauth.getToken(req.query.code, function(token_error, tokens) {
        console.log("token_er: "+ token_error );
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        if(!token_error) {
            gpservice.oauth.setCredentials(tokens);
            plus.people.get({ userId: 'me', auth:gpservice.oauth }, function(profileError, me_body) {
                if(!profileError){
                    console.log("data:" + me_body);
                    var user = me_body;
                    console.log("email:" + user.emails[0].value);
//                    res.data.user = user;
//                    res.passed = true;
//                    res.data.tokens = tokens;
                    mysql.accounts.get('email', user.emails[0].value, function(rows){
                        if(rows && rows.length) {

                            if(rows[0].is_social !== 1){
                                req.error = 'email already exists';
//                                req.error = 'User not found.';
                                res.data.page = 'login';
                                    res.data.errors = req.errors;
                                    res.data.scripts = [scripts.page(res)];
                                    res.finish();

                            }else{

                                var auth = app.accounts.auth.setup(user.emails[0].value,
                                    user.id, mysql);

                                auth.success = function(user){
                                    Auth.login(res, user.session);
                                    res.redirect('/');
                                    mysql.end();
                                };
                                auth.failed	= function(){
                                    res.redirect('/accounts/login?login_failed');
                                    mysql.end();
                                };
                                auth.run();
                            }

                        }else{
                            var account_id = uniqid();
                            mysql.accounts.save({
                                id: account_id,
                                first_name: user.name.givenName,
                                last_name: user.name.familyName,
                                full_name: user.displayName,
                                email: user.emails[0].value,
                                gender: user.gender,
                                password: sha1(user.id),
                                activated: 1,
                                is_social:1
                            }, function () {

                                var auth = app.accounts.auth.setup(user.emails[0].value,
                                    user.id, mysql);

                                auth.success = function(user){
                                    Auth.login(res, user.session);
                                    res.redirect('/');
                                    mysql.end();
                                };
                                auth.failed	= function(){
                                    res.redirect('/accounts/login?login_failed');
                                    mysql.end();
                                };
                                auth.run();
                            });
                        }

                    });
//                        $.return();
                } else {
                    res.passed = false;
                    res.error = profileError;
                    res.data.page = 'login';
                    res.data.errors = res.errors;
                    res.data.scripts = [scripts.page(res)];
                    res.finish();
//                        $.return();
                }
            });

        } else {

            res.passed = false;
            res.error = token_error;
            res.data.page = 'login';
            res.data.errors = res.errors;
            res.data.scripts = [scripts.page(res)];
            res.finish();
//                res.return();
        }
    });
})


gpservice.access_token = function(code, callback){
    request('https://graph.Google.com/oauth/access_token?'
            + 'client_id='+this.id
            + '&redirect_uri='+this.redirect_uri
            + '&client_secret='+this.secret
            + '&code='+code,
        function(error, httpResponse, body){
            callback(error, body);
        });
}

gpservice.inspect_access_token = function(access_token, callback){
    var gpservice = this;
    request('https://graph.Google.com/debug_token?'
            + 'access_token='+access_token,
        function(error, httpResponse, body){
            callback(error, body);

        });
}

