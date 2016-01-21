var request = require('request');
var async = require('async');
var qs = require('querystring');



app.accounts({
	table		: 'accounts',
	username	: 'email',
	password	: 'password',
	select		: '*',
	change_password: {
		old_password: 'old_password',
		new_password: 'new_password',
		new_password_again: 'new_password_again'
	}
});

app.accounts.user = function(user, full){
	if(user){
		
		//console.log(user);
		// CONSTRUCT full name from first and last name
		user.full_name = user.first_name + ' ' + user.last_name;
		user.id=user.id;
		
		// GET avatar from db or gravatar
		var avatar = user.avatar;
		user.avatarName = user.avatar;
		user.avatar = function(size, type){
			var size = isset(size) ? size : 50;
			if(isset(avatar)){
				
				return '/uploads/profiles/original/' + avatar;
			} else if (size <= 50) {
				return '/images/no-profile-small.png';
			} else if (size > 50) {
				return '/images/no-profile.png';
			}
		}
		
		// DELETE sensitive information
		if(!isset(full)){
			delete user.password;
			delete user.session;
		}
		return user;
	} else {
		return false;
	}
}
/*
app.get("/chat",function(request,response,mysql){

console.log("--------------------- chating pages-------------------");
    var user_id = request.query.userId;
	if(user_id){ //== response.head.acc-idount.id){
console.log("This is correct page = " +user_id)
       response.data.page = 'chat';
	response.data.title = 'VBOX - Contact Us';

	response.finish();

	} else{
		response.redirect("/");		
		mysql.end();
	    
	}

}) */
app.post(/^\/accounts\/([^\/]+)\/?$/i, function(request, response, mysql){
				
	var user_id = request.params[1];
	if(isset(user_id)){
		var next = new Next(1, finish);
		
		response.data.subpage = request.query.show ? request.query.show : 'wall' ;
		
		if(user_id == response.head.account.id){
			response.data.user = response.head.account;
			response.data.connection = 'you';
			afterUser();
		} else {
			mysql.accounts.get('id', user_id, function(rows){
				response.data.user = rows[0] ? app.accounts.user(rows[0]) : false ;
				
				var follower = response.head.account.business 
					? response.head.account.business.id 
					: response.head.account.id;
					
				// check connection
				var sql = 'SELECT * FROM follows'
					+ ' WHERE follower = ' + mysql.escape(follower) 
					+ ' AND following = ' + mysql.escape(response.data.user.id);
				mysql(sql, function(rows){
					if(rows && rows.length){
						response.data.connection = 'following';
					} else {
						response.data.connection = 'stranger';
					}
					afterUser();
				});
			});
		}
		function afterUser(){
			if(response.data.subpage == 'ads'){
				
				response.data.ads = [];
				
				mysql('SELECT * FROM ads WHERE seller = '+mysql.escape(user_id)+' ORDER BY time_created DESC', function(rows){
					var rowNext = new Next(rows.length*2, next);
					rows.forEach(function(row){
						// get seller informations
						if(row.seller_type == 1){ // business seller
							mysql.businesses.get('id', row.seller, function(rows){
								row.seller = rows[0];
								row.seller_type = 'business';
								rowNext();
							});
						} else { // private seller
							mysql.accounts.get('id', row.seller, function(rows){
								row.seller = app.accounts.user(rows[0]);
								row.seller_type = 'private';
								rowNext();
							});
						}
						
						// get pictures
						mysql.ad_pictures.get('ad', row.id, function(pictures){
							row.pictures = pictures;
							rowNext();
						});
					});
					response.data.ads = rows;
				});
			} else if (response.data.subpage == 'wall') {
				// LIMIT
				var limit_count = response.data.limit_count = 10;
				var page = request.query.page ? (request.query.page-1)*limit_count : 0 ;
                if (isNaN(page) == true){
                    page = 0;
                }
				var LIMIT = page+','+limit_count;
				var count_sql = 'SELECT COUNT(*) FROM posts WHERE owner = ' + mysql.escape(response.data.user.id);
				var nextPost = new Next(2, next);
				mysqlCountRows(request, response, mysql, count_sql, nextPost);
				
				mysql.posts.get('owner', response.data.user.id, {
					order: 'time DESC',
					limit: LIMIT
				}, function(rows){


					response.data.posts = rows;

					nextPost();
				});
			} else {
				app.notFoundHandler(request, response);
			}
		}
		
		
		function finish(){
			if(response.data.user){
				response.data.page = 'profile';
				response.data.title = response.data.user.full_name + '- VBOX';
				response.data.scripts = [scripts.jquery, scripts.jelq, scripts.imagesLoaded, scripts.masonry, scripts.page(response), scripts.dropzone,];
				response.finish();
			} else {
				app.notFoundHandler(request, response);
			}
		}
	} else {
		app.notFoundHandler(request, response);
	} 
});

app.login = function(request, response){
	var query = isset(request.url.query) ? '?' + request.url.query : '';
	response.data.redirect_url = request.url.pathname + query;
	response.data.page = 'login';
	response.data.scripts = [scripts.page(response)];
	response.finish();
} 

//app.accounts.extend = function(request, response, mysql, callback){
//    console.log(response.data);
//    response.data = {};
//    response.data.account = response.head.account;
//
//
//
//
//	var next = new Next(1, function(){ callback(); });
//	// get businesses
//
////    if(typeof accounts === 'undefined' || accounts === null)
////        console.log('accounts not defined');
////    else{
////        if (accounts == false){
////            response.data.account.business = false;
////        }else{
////            console.log(accounts);
////            response.data.account.business = accounts.business;
////            if (response.data.account.business.avatar.indexOf('uploads') < 0){
////                response.data.account.business.avatar = '/uploads/avatars/original/'+ response.data.account.business.avatar;
////
////            }
////            accounts = null;
////        }
////
////
////    }
//
//    mysql('SELECT * FROM business_employees, businesses WHERE business_employees.account = ' + mysql.escape(response.head.account.id) + ' AND businesses.id = business_employees.business AND business_employees.role = 0 ', function(rows){
//        rows.forEach(function(business){
//            business.avatar = isset(business.avatar)
//                ? '/uploads/avatars/original/'+business.avatar
//                : '/images/no-business-profile.png';
//            if(typeof accounts === 'undefined' || accounts === null)
//                console.log('accounts not defined');
//            else {
//                if (accounts == false) {
//                    response.data.account.business = false;
//                } else {
//
//                    if (business.session == request.cookies.business) {
//                        business.selected = true;
//                        response.data.account.business = business;
//                        if (response.data.account.business.avatar.indexOf('uploads') < 0) {
//                            response.data.account.business.avatar = '/uploads/avatars/original/' + response.data.account.business.avatar;
//
//                        }
//                    }else{
//                        console.log(accounts);
//                        response.data.account.business = accounts.business;
//                        if (response.data.account.business.avatar.indexOf('uploads') < 0){
//                            response.data.account.business.avatar = '/uploads/avatars/original/'+ response.data.account.business.avatar;
//
//                        }
//                        accounts = null;
//                    }
//                }
//            }
//        });
//        mysql.businesses.get('account',response.head.account.id,function(businesses){
//            if(businesses && businesses.length) {
//                response.data.account.businesses = businesses;
//            }
////            if (!response.data.account.business){
////                if(typeof accounts === 'undefined' || accounts === null) {
////                    console.log('accounts not defined');
////                }
////                else{
////                    if (accounts == false){
////                        response.data.account.business = false;
////                    }else{
////                        console.log(accounts);
////                        response.data.account.business = accounts.business;
////                        if (response.data.account.business.avatar.indexOf('uploads') < 0){
////                            response.data.account.business.avatar = '/uploads/avatars/original/'+ response.data.account.business.avatar;
////
////                        }
////                        accounts = null;
////                    }
////
////                }
////
////
////            }
//
//            next();
//        });
//
////		response.data.account.businesses = rows;
//
//    })
//	// get notificiations
//	// get ads
//}

app.accounts.extend = function(request, response, mysql, callback){
//    console.log(response.data);
    response.data = {};
    response.data.account = response.head.account;
    if(typeof accounts === 'undefined' || accounts === null )
        console.log('accounts not defined');
    else{
//        console.log(accounts);
        response.data.account.business = accounts.business;
        if (response.data.account.business.avatar.indexOf('uploads') < 0){
            response.data.account.business.avatar = '/uploads/avatars/original/'+ response.data.account.business.avatar;

        }
//        accounts = null;


    }



    var next = new Next(1, function(){ callback(); });
    // get businesses
    mysql('SELECT * FROM business_employees, businesses WHERE business_employees.account = ' + mysql.escape(response.head.account.id) + ' AND businesses.id = business_employees.business AND business_employees.role = 0 ', function(rows){
        rows.forEach(function(business){
            business.avatar = isset(business.avatar)
                ? '/uploads/avatars/original/'+business.avatar
                : '/images/no-business-profile.png';
            if(business.session == request.cookies.business){
                business.selected = true;
                response.data.account.business = business;
            }
        });
        mysql.businesses.get('account',response.head.account.id,function(businesses){
            if(businesses && businesses.length) {
                response.data.account.businesses = businesses;
            }

            next();
        });

//		response.data.account.businesses = rows;

    });
    // get notificiations
    // get ads
}

app.accounts.on('login', function(request, response, mysql){
	if(request.errors.password || request.errors.email){
		response.data.page = 'login';
		response.data.errors = request.errors;
		response.data.scripts = [scripts.page(response)];
		response.finish();
	} else {
		var url = request.body.redirect_url || 'home';
		if(response.head.account) {
			url = request.body.redirect_url || response.head.account.id;			
		}
		response.redirect(url);		
		mysql.end();
	}
});


app.accounts.on('create', function(request, response, mysql){
	request.demand('first_name');
	request.demand('last_name');
	request.demand('contact_number');
	request.demand('email');
	request.demand('password');
	request.demand('gender');
	
//	console.log(request.body);
	mysql.accounts.get('email', request.body.email, function(rows){
		if(rows && rows.length) request.error('email', 'already exists');
		onDemand();
	});
	
	function onDemand(){
		if(request.passed){
			var next = new Next(2, finish);
			var account_id = uniqid();
			
			if(isset(request.body.invite_code)){
				var activated = 1;
				mysql('UPDATE business_employees SET confirmed = 1, account = "'+account_id+'" WHERE code = ' + mysql.escape(request.body.invite_code), next);
			} else {
				//var activated = uniqid();
				var activation_key = account_id;
				var activated = 0;
				mail.send({
					email: request.body.email,
					subject: 'Please verify your email',
					html: 'verify.html',
					activated: activation_key,
					name: request.body.first_name
				});
				next();
			}
			
			mysql.accounts.save({
				id: account_id,
				first_name: request.body.first_name,
				last_name: request.body.last_name,
                full_name: request.body.first_name +" "+ request.body.last_name,
				email: request.body.email,
				contact_number: request.body.contact_number,
				password: sha1(request.body.password),
				gender: request.body.gender,
				activated: activated,
				country_short: request.body.country_short || null,
				country_long: request.body.country_long || null,
				locality_short: request.body.locality_short || null,
				locality_long: request.body.locality_long || null,
				administrative_area_level_1_short: request.body.administrative_area_level_1_short || null,
				administrative_area_level_1_long: request.body.administrative_area_level_1_long || null,
				administrative_area_level_2_short: request.body.administrative_area_level_2_short || null,
				administrative_area_level_2_long: request.body.administrative_area_level_2_long || null,
				formatted_address: request.body.formatted_address || null,
			}, next);
			
			function finish(){
				if(!activated){
					response.redirect('/accounts/confirm');
					mysql.end();
				} else {
					var auth = app.accounts.auth.setup(request.body.email, 
						request.body.password, mysql);
						 
					auth.success = function(user){
						Auth.login(response, user.session);
						response.redirect('/');
						mysql.end();
					};
					auth.failed	= function(){
						response.redirect('/accounts/login?login_failed');
						mysql.end();
					};
					auth.run();
				}
				
			}
			
		} else {
			response.data.errors = request.errors;
			response.data.inputs = request.body;
			response.data.page = 'login';
			response.data.scripts = [scripts.maps, scripts.geo, scripts.page(response)];
			response.finish();
		}
	}
});

app.accounts.on('recover_notify', function(request, response, mysql){
	console.log('#recover_notify');
	if(!request.errors.recovery_email){
		response.data.title = 'VBOX - Recovery Email Sent';
		response.data.page = 'recover_notify';
		response.finish();
	} else {
		response.data.errors = request.errors;
		response.data.page = 'forgotPassword';
		response.finish();
	}
});

app.accounts.on('recover', function(request, response, mysql){
	response.data.reset_code = request.params[1];
	if(!objectLength(request.errors)){
		response.data.title = 'VBOX - New Password';
		response.data.page = 'recover';
		response.data.success = true;
		response.finish();
	} else {
		response.data.errors = request.errors;
		response.data.page = 'recover';
		response.finish();
	}
});

app.accounts.on('change_password', function(request, response, mysql){
	if(!objectLength(request.errors)){
		response.redirect('/accounts/settings/password?success=true');
	} else {
		response.data.errors = request.errors;
		response.data.inputs = request.body;
		response.data.subpage = 'password';
		settingsPage(request, response, mysql);
	}
});

app.get('/accounts/login', function(request, response, mysql){
	response.data.title = 'VBOX - Login';
	response.data.page = 'login';
	response.finish();
});

app.get('/accounts/login', function(request, response, mysql){
    response.data.title = 'VBOX - Login';
    response.data.page = 'login';
    response.finish();
});

//app.get('/accounts/logout', function(request, response, mysql){
//    if(events.logout){
//        Auth.logout(request, response, mysql, false, function(){
//            events.logout(request, response, mysql);
//        });
//    } else {
//        cors(request, response);
//        var redirect = !isset(request.query.sso) ? 'back' : false ;
//        Auth.logout(request, response, mysql, redirect);
//        if(!redirect) response.end({passed: true, errors: false});
//    }
//});

//app.get('/accounts/logout', function(request, response, next){
//    accounts = undefined;
//    response.head.accounts = undefined;
//    next();
//});

app.get('/accounts/signup', function(request, response, mysql){
	response.data.title = 'VBOX - Sign Up';
	response.data.page = 'signup';
	response.data.scripts = [scripts.jquery, scripts.jelq, scripts.maps, scripts.geo, scripts.page(response)];
	response.finish();
});

app.get(/\/accounts\/settings\/([^\/]+)\/?/i, settingsPage);
function settingsPage(request, response, mysql){
	response.data.title = 'VBOX - Settings';
	response.data.page = 'account_settings';
	response.data.subpage =  response.data.subpage || request.params[1] || 'details';
	response.data.scripts = [scripts.jquery, scripts.jelq, scripts.maps, scripts.geo, scripts.page(response)];
	if(!response.data.inputs) response.data.inputs = response.head.account;
	response.finish();
}
//var socialauth  = require('diet-auth')(app);


var fbservice = {};
fbservice.id = '539971812846221';
fbservice.secret = '1ae03a0f1f6932251d2866be1fad15bb';

//test app
//fbservice.id = '541870319323037';
//fbservice.secret = '560c3837ec5f8165bfd7a1e782b51ffe';
fbservice.app = app;
fbservice.response =  app.domain + 'auth/facebook/response';
fbservice.dialog = '/auth/facebook';
fbservice.redirect = '/auth/facebook/redirect';
fbservice.redirect_uri = 'http://'+ app.domain+fbservice.redirect ;
fbservice.scopes = '&scope=email';

fbservice.access_token = function(code, callback){
    request('https://graph.facebook.com/oauth/access_token?'
            + 'client_id='+this.id
            + '&redirect_uri='+this.redirect_uri
            + '&client_secret='+this.secret
            + '&code='+code,
        function(error, httpResponse, body){
            callback(error, body);
        });
};

fbservice.inspect_access_token = function(access_token, callback){
    var fbservice = this;
    request('https://graph.facebook.com/debug_token?'
            + 'access_token='+access_token,
        function(error, httpResponse, body){
            callback(error, body);
        });
};

app.get(fbservice.dialog, function(req, res){
//        console.log($);
    res.redirect('https://www.facebook.com/dialog/oauth'
        + '?client_id='+fbservice.id
        + '&redirect_uri='+fbservice.redirect_uri+fbservice.scopes);
});
//var facebook = socialauth('facebook', {
//    id      : '539971812846221',             // facebook app id
//    secret  : '1ae03a0f1f6932251d2866be1fad15bb',     // facebook app secret
//    scope   : 'email'               // specify facebook scopes
//});

app.get(fbservice.redirect, function(req, res, mysql){

    if(req.query.code){

        // 3. get token
        fbservice.access_token(req.query.code, function(access_token_error, access_token_body){
            var access_token = qs.parse(access_token_body).access_token;
            if(access_token){
                request('https://graph.facebook.com/v2.0/me?fields=first_name,last_name,gender,locale,email&access_token='+access_token,
                    function(error, http, me_body){
                        req.error = error;
                        if(me_body){
//                            console.log(me_body.email);
                            var user = JSON.parse(me_body);
//                            console.log("json" + user.email);
                            res.passed = true;
                            res.data.tokens = qs.parse(access_token_body);
                            mysql.accounts.get('email', user.email, function(rows){
                                if(rows && rows.length) {
                                    if(rows[0].is_social !== 1){
                                        req.error = 'email already exists';
                                        res.data.page = 'login';
                                        res.data.errors = req.errors;
                                        res.data.scripts = [scripts.page(res)];
                                        res.finish();

                                }else{

                                    var auth = app.accounts.auth.setup(user.email,
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
                                            first_name: user.first_name,
                                            last_name: user.last_name,
                                            full_name: user.first_name + ' '+user.last_name,
                                            email: user.email,
                                            gender: user.gender,
                                            password: sha1(user.id),
                                            activated: 1,
                                            is_social:1

                            //            first_name: profile.name.givenName,
                            //            last_name: profile.name.familyName,
                            //            full_name: profile.name.givenName +" "+ profile.name.familyName,
                            //            email: profile.emails[0].value,
                            //            contact_number: request.body.contact_number,
                            //            password: null,
                            //            access_token: access_token,
                            //            gender: request.body.gender,
                            //            activated: activated
                                        }, function () {
                                            var auth = app.accounts.auth.setup(user.email,
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
//                            $.return();
                        } else {
                            res.passed = false;
                            if(!error) {
                                req.error = 'User not found.';
                            }
                            res.data.page = 'login';
                            res.data.errors = req.errors;
                            res.data.scripts = [scripts.page(res)];
                            res.finish();
//                            $.return();
                        }
                        //$.redirect(fbservice.response+'?passed=true&'+access_token_body+'&'+qs.stringify({user:me_body}));
                    });
            } else {
                res.data.page = 'login';
                res.data.errors = JSON.parse(access_token_body);
                res.data.scripts = [scripts.page(res)];
                req.error = JSON.parse(access_token_body);
                res.passed = false;
                res.finish();

//                $.return();
                //$.redirect(fbservice.response+'?passed=false&error='+JSON.stringify(error));

            }
        });
    } else if (req.query.token) {
        fbservice.inspect_access_token(access_token, req.query.token, function(inspect_error, inspect_body){
            if(!inspect_error){
                res.passed = true;
                Object.merge(res.data, qs.parse(inspect_body));
//                response.return();
                //$.redirect(fbservice.response+'?passed=true&'+inspect_body);
            } else {
                res.passed = false;
                res.error = qs.parse(inspect_error);
//                $.return();
                //$.redirect(fbservice.response+'?passed=false&'+inspect_error);
            }
        });
    } else if (req.query.error) {
        req.passed = false;
        res.data.page = 'login';
        res.data.errors = JSON.parse(access_token_body);
        res.data.scripts = [scripts.page(res)];
        req.error = JSON.parse(access_token_body);
        res.passed = false;
        res.finish();
    }
});


app.post('/accounts/save', function(request, response, mysql){
	request.demand('first_name');
	request.demand('last_name');
	request.demand('contact_number');
	request.demand('gender');
	
//	console.log(request.body);
	
	if(request.passed){
		mysql.accounts.save({
			id: response.head.account.id,
			first_name: request.body.first_name,
			last_name: request.body.last_name,
			contact_number: request.body.contact_number,
			gender: request.body.gender,
            email: response.head.account.email,
			
			country_short: (request.body.country_short || response.head.account.country_short) || null,
			country_long:(request.body.country_long || response.head.account.country_long) || null,
			locality_short:(request.body.locality_short || response.head.account.locality_short)|| null,
			locality_long:(request.body.locality_long || response.head.account.locality_long)|| null,
			administrative_area_level_1_short:(request.body.administrative_area_level_1_short || response.head.account.administrative_area_level_1_short )|| null,
			administrative_area_level_1_long:(request.body.administrative_area_level_1_long || response.head.account.administrative_area_level_1_long )|| null,
			administrative_area_level_2_short:(request.body.administrative_area_level_2_short || response.head.account.administrative_area_level_2_short )|| null,
			administrative_area_level_2_long:(request.body.administrative_area_level_2_long || response.head.account.administrative_area_level_2_long )|| null,
			formatted_address:(request.body.formatted_address || response.head.account.formatted_address)|| null
		}, function(){
            mysql.end();
			response.redirect('/accounts/'+response.head.account.id);
		});
		
	} else {
		response.data.errors = request.errors;
		response.data.inputs = request.body;
		response.data.subpage = 'details';
		settingsPage(request, response, mysql);
	}
});

app.get.simple('/accounts/savePicture', function(request, response){
	response.redirect('/accounts/settings/picture');
});

app.get('/accounts/removePicture', function(request, response, mysql){
	if(response.head.account.id){

		// delete old avatar
		if(response.head.account.avatarName){
			var source = app.public+'/uploads/profiles';
			var next = new Next(2, function(){
				response.redirect('back');
			})
			fs.unlink(source+'/original/'+response.head.account.avatarName, next);
			mysql.accounts.save({id: response.head.account.id, avatar: null }, next)
		} else {
			response.redirect('back');
		}
	} else {
		response.redirect('back');
	}
});

app.post.simple('/accounts/savePicture', function(request, response){
	app.upload('/uploads/profiles/original', request, response, function(mysql){
		//console.log('request.body.files', request.body.files)
		if(request.body.files && request.body.files.picture && request.body.files.picture.size){
			var source = app.public+'/uploads/profiles/original/';

			var avatar = request.body.files.picture.path.split(source)[1];
			
			//console.log({id: response.head.account.id, avatar: avatar});
			
			var next = new Next(2, finish);
			
			// delete old avatar
			//console.log('response.head.account.avatarName=',response.head.account.avatarName)
			if(response.head.account.avatarName){
				var source = app.public+'/uploads/profiles';
				//console.log('REMOVE FILE', source+'/original/'+response.head.account.avatarName)
				fs.unlink(source+'/original/'+response.head.account.avatarName, next);
			} else {
				next();
			}
			
			// save new avatar
			mysql.accounts.save({id: response.head.account.id, avatar: avatar}, next);
			
			function finish(){
				response.redirect('/accounts/settings/picture?success=true');
			}
			
		} else {
			request.error('photo', 'error');
			request.abort();
		}
	});
	
	response.onAbort = function(){

		response.data.errors = request.errors;
		response.data.inputs = request.body;
		response.data.subpage = 'picture';
		settingsPage(request, response, mysql);
	}
}, true);

app.get('/accounts/confirm', function(request, response, mysql){
	response.data.title = 'VBOX - Please verify your email';
	response.data.page = 'confirm';
	response.finish();
});

app.get('/accounts/forgotPassword', function(request, response, mysql){
	response.data.title = 'VBOX - Forgot Password';
	response.data.page = 'forgotPassword';
	response.finish();
});

// POST businesses/savePicture
app.post.simple('/accounts/cover', function(request, response){
    app.upload('/uploads/avatars/original', request, response, function(mysql){
//        console.log('request.body.files', request)
        if(request.body.files && request.body.files.picture && request.body.files.picture.size){
            var source = app.public+'/uploads/avatars/original/';

            var avatar = request.body.files.picture.path.split(source)[1];

            console.log({id: response.head.account.id, avatar: avatar});

            var next = new Next(2, finish);


            // save new avatar
            var path = '/uploads/avatars/original/'+avatar;
//            mysql.accounts.save({id: response.head.account.id, cover: '/uploads/avatars/original/'+avatar}, next);
            mysql('UPDATE accounts SET cover = "'+path+'" WHERE id = "' + response.head.account.id+'" ', next);
            response.redirect('back');

            function finish(){
//                response.redirect('/businesses/settings/logo?success=true');
            }

        } else {
            request.error('photo', 'error');
            request.abort();
        }
    });

    response.onAbort = function(){

        response.data.errors = request.errors;
        response.data.inputs = request.body;
        response.data.subpage = 'logo';
        settingsPage(request, response, mysql);
    }
}, true);

app.get(/^\/accounts\/([^\/]+)\/?$/i, function(request, response, mysql){
    var posts  = [];
	var user_id = request.params[1];
	//console.log('user id=',user_id);
	if(isset(user_id)){
		var next = new Next(1, finish);
		
		response.data.subpage = request.query.show ? request.query.show : 'wall' ;
		
		if(user_id == response.head.account.id){
			response.data.user = response.head.account;
			response.data.connection = 'you';
//            var nextPostz = new Next(1, next);
            var sqlCount = 'SELECT * FROM follows'
                + ' WHERE  following = ' + mysql.escape(response.data.user.id)+"  AND following_type='personal'";
            mysql(sqlCount, function(rowsCount){
                response.data.followerCount = rowsCount.length;
                var adCount = 'SELECT * FROM ads'
                    + ' WHERE  seller = ' + mysql.escape(response.data.user.id);//+"  OR agent = "+ mysql.escape(response.data.user.id);
                mysql(adCount, function(adrowcount){
                    response.data.adCount = adrowcount.length;
                    afterUser();
//                    nextPostz();
                });



            });

		} else {
			mysql.accounts.get('id', user_id, function(rows){
				response.data.user = rows[0] ? app.accounts.user(rows[0]) : false ;
				
				var follower = response.head.account.business 
					? response.head.account.business.id 
					: response.head.account.id;
					
				// check connection
				var sql = 'SELECT * FROM follows'
					+ ' WHERE follower = ' + mysql.escape(follower) 
					+ ' AND following = ' + mysql.escape(response.data.user.id)+" AND following_type='personal'";
				mysql(sql, function(rows){
					if(rows && rows.length){
						response.data.connection = 'following';
					} else {
						response.data.connection = 'stranger';
					}
					

					                   	var sqlCount = 'SELECT * FROM follows'
					+ ' WHERE  following = ' + mysql.escape(response.data.user.id)+"  AND following_type='personal'";
				mysql(sqlCount, function(rowsCount){
			        response.data.followerCount = rowsCount.length;
                    var adCount = 'SELECT * FROM ads'
                        + ' WHERE  seller = ' + mysql.escape(response.data.user.id);//+"  OR agent = "+ mysql.escape(response.data.user.id);
                    mysql(adCount, function(adrowcount){
                        response.data.adCount = adrowcount.length;
                        afterUser();
                    });



				});

				});
			});
		}
		function afterUser(){

			if(response.data.subpage == 'ads'){
				
				response.data.ads = [];
				
				mysql('SELECT * FROM ads WHERE seller = '+mysql.escape(user_id)+' ORDER BY time_created DESC', function(rows){
					var rowNext = new Next(rows.length*2, next);
					rows.forEach(function(row){
						// get seller informations
						if(row.seller_type == 1){ // business seller
							mysql.businesses.get('id', row.seller, function(rows){
								row.seller = rows[0];
								row.seller_type = 'business';
								rowNext();
							});
						} else { // private seller
							mysql.accounts.get('id', row.seller, function(rows){
								row.seller = app.accounts.user(rows[0]);
								row.seller_type = 'private';
								rowNext();
							});
						}
						
						// get pictures
						mysql.ad_pictures.get('ad', row.id, function(pictures){
							row.pictures = pictures;
							rowNext();
						});
					});
					response.data.ads = rows;
				});
			} else if(response.data.subpage == 'me'){
                var nextPostz = new Next(1, next);
                var sqlCount = 'SELECT * FROM follows'
                    + ' WHERE  following = ' + mysql.escape(response.data.user.id)+"  AND following_type='personal'";
                mysql(sqlCount, function(rowsCount){
                    response.data.followerCount = rowsCount.length;
                    var adCount = 'SELECT * FROM ads'
                        + ' WHERE  seller = ' + mysql.escape(response.data.user.id);//+"  OR agent = "+ mysql.escape(response.data.user.id);
                    mysql(adCount, function(adrowcount){
                        response.data.adCount = adrowcount.length;
                        nextPostz();
                    });



                });

            }
            else if (response.data.subpage == 'wall') {
				// LIMIT
				var limit_count = response.data.limit_count = 10;
				var page = request.query.page ? (request.query.page-1)*limit_count : 0 ;
                if (isNaN(page) == true){
                    page = 0;
                }
				var LIMIT = page+','+limit_count;
				var count_sql = 'SELECT COUNT(*) FROM posts WHERE owner = ' + mysql.escape(response.data.user.id);
				var nextPost = new Next(2, next);
				mysqlCountRows(request, response, mysql, count_sql, nextPost);
				
				mysql.posts.get('owner', response.data.user.id, {
					order: 'time DESC',
					limit: LIMIT
				}, function(rows){

//                    rows.forEach(function(row){

                    async.eachSeries(rows, function(post, callback) {

                        mysql.post_comments.get('post', post.id, function(comments){
                            posts.push(comments);
                            post.comments = comments;
                            callback();

                        });

                    }, function(err){
                        response.data.posts = rows;
                        nextPost();
                        // if any of the file processing produced an error, err would equal that error

                    });



				});
				
			} else {
				app.notFoundHandler(request, response);
			}
		}
		
		
		function finish(){
			if(response.data.user){
				response.data.page = 'profile';
				response.data.title = response.data.user.full_name + '- VBOX';
				response.data.scripts = [scripts.jquery, scripts.jelq,scripts.dropzone, scripts.imagesLoaded, scripts.masonry, scripts.page(response)];
				response.finish();
			} else {
				app.notFoundHandler(request, response);
			}
		}
	} else {
		app.notFoundHandler(request, response);
	} 
});
