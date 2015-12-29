// CONNECT to Mandrill

var mailer = require("nodemailer").mail;
mail = nodemailer.createTransport("SMTP", {
	host	: "webmail.gandi.net", 	// smtp hostname
	port	: 25, 						// port for secure smtp
	debug	: true,						// display debug log
    auth	: {
        user: "hello@veebox.io",		// smtp username
        pass: "vbox@1234"	// smtp password
    }
});

// CREATE send shorthand
mail.send = function(locals, options){
	// Render HTML Template
	var options = options || {};
	app.ect.render(__dirname + '/templates/' + locals.html, locals, function (error, html) {
		if(!isset(error)){

            mailer({
                from: "VBOX <hello@veebox.io>", // sender address
                to: locals.email, // list of receivers
                subject: locals.subject, // Subject line
                html: html // html body
//                generateTextFromHTML: true
            });
//			mail.sendMail(merge({
//			    from	: "VBOX <hello@veebox.io>",
//			    to		: locals.email,
//			    subject	: locals.subject,
//			    html	: html,
//			    generateTextFromHTML: true
//			}, options));
		} else {
			console.trace('Mail ECT Rendering Error: ', error);
		}
	});
}