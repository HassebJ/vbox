module.exports = function Configs() {
    if (process.env.NODE_ENV === 'development'){
        Configs.prototype.domain = 'localhost';
        Configs.prototype.port = '80';

    }else{
        Configs.prototype.domain = 'veebox.io'; //whatever is the ip of the server it is hosted on
        Configs.prototype.port = '80';
    }

    Configs.prototype.mysql = {
        connectionLimit : 10,
        host     : 'localhost',
        user     : 'root',
        password : 'vbox@1234',
        database : 'vbox'
    };
    Configs.prototype.paypal= {
        "port" : 5000,
        "api" : {
          "host" : "api.sandbox.paypal.com",
          "port" : "",            
          "client_id" : "ASTi1LhaanplBWPgtsqpBCt8fq6ZL8uco-A7Y6bkMXgVr2An-dBR9L3b01b4QapUZkoEcbi8VgF6rlWt",
          "client_secret" : "ENXJ5v626w-ut4OyqJ-YpFxllMfUhnLrjOGePaUULjd9nyb5e8f2OxeWxhClkHn_TONxnt6-gzFf6vmO"
        }
    };
    Configs.prototype.charges = {
        "charge_after" : "60", // 60 seconds
        "charge" : "0.05" //0.05$
    };
};
//Configs.prototype.paypal= {
//        "port" : 5000,
//        "api" : {
//          "host" : "api.sandbox.paypal.com",
//          "port" : "",            
//          "client_id" : "ASTi1LhaanplBWPgtsqpBCt8fq6ZL8uco-A7Y6bkMXgVr2An-dBR9L3b01b4QapUZkoEcbi8VgF6rlWt",
//          "client_secret" : "ENXJ5v626w-ut4OyqJ-YpFxllMfUhnLrjOGePaUULjd9nyb5e8f2OxeWxhClkHn_TONxnt6-gzFf6vmO"
//        }
//    };
