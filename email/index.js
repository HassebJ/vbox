
var mailer = require("nodemailer");
mail = mailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "veebox.io@gmail.com",
        pass: "vbox@1234"
    }
});
//mail = nodemailer.createTransport("SMTP", {
//	host	: "webmail.gandi.net", 	// smtp hostname
//	port	: 25, 						// port for secure smtp
//	debug	: true,						// display debug log
//    auth	: {
//        user: "hello@veebox.io",		// smtp username
//        pass: "vbox@1234"	// smtp password
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
                    console.log(error);
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