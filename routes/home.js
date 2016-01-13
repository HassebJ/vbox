var async = require('async');

app.get('/', function(request, response, mysql){
    console.log("----------------------------------------------------")
	var user = response.head.account.business ? response.head.account.business.id : response.head.account.id ;
	if(response.head.account.business) {

        console.log(response.head.account.business.address)
		var url = response.head.account.business.address;		
		response.redirect(url);	
	} else if(response.head.account){
		response.data.user = response.head.account;
		response.data.connection = 'you';
		if(response.data.user){
				response.data.page = 'profile';
				response.data.title = response.data.user.full_name + '- VBOX';
response.data.scripts = [scripts.jquery, scripts.jelq, scripts.selectize, scripts.dropzone, scripts.accounting, scripts.maps, scripts.geo, scripts.page(response)];
		                var limit_count = response.data.limit_count = 10;
				var page = request.query.page ? (request.query.page-1)*limit_count : 0 ;
            if (isNaN(page) == true){
                page = 0;
            }
				var LIMIT = page+','+limit_count;
				var count_sql = 'SELECT COUNT(*) FROM posts WHERE owner = ' + mysql.escape(response.data.user.id);
				
				mysql.posts.get('owner', response.data.user.id, {
					order: 'time DESC',
					limit: LIMIT
				}, function(rows){
                    async.eachSeries(rows, function(post, callback) {

                        mysql.post_comments.get('post', post.id, function(comments){
//                            posts.push(comments);
                            post.comments = comments;
                            callback();

                        });

                    }, function(err){
                        response.data.posts = rows;
                        response.finish();
                        // if any of the file processing produced an error, err would equal that error

                    });



				});
		}
		/*
		app.accounts.extend(request, response, mysql, function(){
			//response.data.title = 'VBOX';
			//response.data.page = 'home';
			//response.finish();
			
			if(response.data.user){
				response.data.page = 'profile';
				response.data.title = response.data.user.full_name + '- VBOX';
				response.data.scripts = [scripts.jquery, scripts.jelq, scripts.imagesLoaded, scripts.masonry, scripts.page(response)];
				response.finish();
			} else {
				response.data.title = 'VBOX';
				response.data.page = 'home';
				response.finish();
			}		
		})
		*/
	} else {
		response.data.title = 'Welcome to VBOX'
		response.data.page = 'welcome';
		response.data.scripts = [scripts.maps, scripts.geo, scripts.validetta, scripts.page(response)];
		response.finish();
	}
});


app.get('/search', function(request, response, mysql){

        response.data.title = 'Welcome to VBOX'
        response.data.page = 'search';
//        response.data.scripts = [scripts.maps, scripts.geo, scripts.validetta, scripts.page(response)];
        response.finish();

});