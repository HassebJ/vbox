// CONNECT to Mandrill
mail = nodemailer.createTransport("SMTP", {
	host	: "mail.livevbox.com", 	// smtp hostname
	port	: 25, 						// port for secure smtp
	debug	: true,						// display debug log
    auth	: {
        user: "hello@livevbox.com",		// smtp username
        pass: "vbox@1234"	// smtp password
    }
});

// CREATE send shorthand
mail.send = function(locals, options){
	// Render HTML Template
	var options = options || {};
	app.ect.render(__dirname + '/templates/' + locals.html, locals, function (error, html) {
		if(!isset(error)){ 
			mail.sendMail(merge({
			    from	: "VBOX <hello@livevbox.com>",
			    to		: locals.email,
			    subject	: locals.subject,
			    html	: html,
			    generateTextFromHTML: true
			}, options));
		} else {
			console.trace('Mail ECT Rendering Error: ', error);
		}
	});
}