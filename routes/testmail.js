var mailer = require("nodemailer").mail;
app.get('/testmail', function(request, response, mysql){
		mail.send({
					email: 'deb17276@gmail.com',
					subject: 'Please verify your email',
					html: 'verify.html',
					activated: '12345678',
					name: 'Deb'
				});
		response.data.title = 'Welcome to VBOX'
		response.data.page = 'welcome';
		response.data.scripts = [scripts.maps, scripts.geo, scripts.validetta, scripts.page(response)];
		response.finish();
});

app.get('/company/postcontact', function(request, response, mysql){
    var msg = request.query;
    console.log("query: " + msg.cf_name +' <'+msg.cf_email+'>');
    console.log(msg.cf_subject);
    console.log(msg.cf_message);

    mailer({
        from: msg.cf_name +' <'+msg.cf_email+'>', // sender address
        to: 'leoash842@hotmail.com', // list of receivers
        subject: msg.cf_subject, // Subject line
        text: msg.cf_message // html body
//                generateTextFromHTML: true
    });

    response.data.title = 'VBOX';
    response.data.page = 'submitcontact';
    response.finish();


});