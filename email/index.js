
var mailer = require("nodemailer");
mail = mailer.createTransport("SMTP",{
    host:"mail.gandi.net",
    port:465,
//    secure: true,
    secureConnection: true,
    auth: {
        user: "hello@veebox.io",
        pass: "vbox@1234"
    }
});

//
//mail = mailer.createTransport("SMTP",{
//	host:"relay.mail.gandi.net", 	// smtp hostname
//	port: 465, 						// port for secure smtp
////	debug: true,						// display debug log
//    auth: {
//        user:"hello@veebox.io",		// smtp username
//        pass:"vbox@1234"	// smtp password
//    }
//});

// CREATE send shorthand
mail.send = function(locals, options){
	// Render HTML Template
	var options = options || {};
	app.ect.render(__dirname + '/templates/' + locals.html, locals, function (error, html) {
		if(!isset(error)){

            mail.sendMail({
                from: "VBOX <hello@veebox.io>",
                to: locals.email, // list of receivers
                subject: locals.subject, // Subject line
                html: html // html body
            }, function(error, response){
                if(error){
                    console.log("Nodemailer error: "  + error);
                }else{
                    console.log("Message sent: " + response.message);
                }
            });

//            mailer({
//                from: "VBOX <hello@veebox.io>", // sender address
//                to: locals.email, // list of receivers
//                subject: locals.subject, // Subject line
//                html: html // html body
////                generateTextFromHTML: true
//            });
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