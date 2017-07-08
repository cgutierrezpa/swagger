var config = {
    test: {
        //url to be used in link generation
        url: "http://localhost",
        //secret to generate JSON web tokens
        secret: "quentintokentino",
        //mysql connection settings
        database: {
            host:   "fundledb.c7dbtqa0glty.eu-west-1.rds.amazonaws.com",
            port:   "3306",
            db:     "FundleDB",
            mode:   "mode_local",
            user:   "dbadmin",
            password: "DBs3c_r3"
        },
        //server details
        server: {
            host: "localhost",
            port: "3000"
        }
    },
    development: {
        //url to be used in link generation
        url: "http://my.site.com",
        //secret to generate JSON web tokens
        secret: "quentintokentino",
        //mysql connection settings
        database: {
            host:   "fundledb.c7dbtqa0glty.eu-west-1.rds.amazonaws.com",
            port:   "3306",
            db:     "FundleDB",
            mode:   "mode_development",
            user:   "dbadmin",
            password: "DBs3c_r3"
        },
        //server details
        server: {
            host: "ec2-54-77-232-106.eu-west-1.compute.amazonaws.com",
            port: "3422"
        }
    },
    production: {
        //url to be used in link generation
        url: "http://my.site.com",
        //secret to generate JSON web tokens
        secret: "quentintokentino",
        //mysql connection settings
        database: {
            host:   "fundledb.c7dbtqa0glty.eu-west-1.rds.amazonaws.com",
            port:   "3306",
            db:     "FundleDB",
            mode:   "mode_production",
            user:   "dbadmin",
            password: "DBs3c_r3"
        },
        //server details
        server: {
            host:   "127.0.0.1",
            port:   "3421"
        }
    }
};
module.exports = config;