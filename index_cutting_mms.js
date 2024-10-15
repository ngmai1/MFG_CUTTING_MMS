const os = require('os');
require('log-timestamp');
const { exec } = require('child_process');
const usercomputer = os.userInfo().username.toLowerCase();
var computerName = os.hostname();
console.log(computerName, usercomputer);

var mysql = require('mysql');
const socketIO = require("socket.io");
const express = require('express');
const app = express();
var compression = require('compression')
var serveIndex = require('serve-index');
app.use(compression({
    level: 6,
    threshold: 100 * 500,

    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false
        }
        return compression.filter(req, res)
    }
}));

// Configure SQL Server connection
// const SQLConfig = {
//     user: 'sa',
//     password: 'Phubai@123@',
//     server: 'PBV-61GMXT2\\SQLEXPRESS',
//     database: 'PBCTS',
//     port: 1433,
//     options: {
//         trustedConnection: true,
//     },
// };

const SQLConfig = {
    server: "PBVPAYQSQL1V",
    database: "PBCTS",
    user: "cts",
    password: "Ct$yS123",
    port: 1433,
    options: {
        trustedConnection: true,
    },
};

var con1 = mysql.createPool({
  connectionLimit: 1000,
  host: "pbvweb01v",
  user: "mms_web",
  password: "1234567890",
  database: "linebalancing",
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from("your_password"), 
  },
});
var con2 = mysql.createPool({
  connectionLimit: 1000,
  host: "pbvweb01v",
  user: "mms_web",
  password: "1234567890",
  database: "erpsystem",
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from("your_password"), 
  },
});
var con3 = mysql.createPool({
  connectionLimit: 1000,
  host: "pbvweb01v",
  user: "mms_web",
  password: "1234567890",
  database: "erphtml",
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from("your_password"), 
  },
});
var con4 = mysql.createPool({
  connectionLimit: 1000,
  host: "pbvweb01v",
  user: "mms_web",
  password: "1234567890",
  database: "pr2k",
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from("your_password"), 
  },
});
var con5 = mysql.createPool({
  connectionLimit: 1000,
  host: "pbvweb01v",
  user: "mms_web",
  password: "1234567890",
  database: "cutting_system",
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from("your_password"), 
  },
});

const cors = require('cors');
app.use(cors()); 


var mysql = require('mysql');
const mssql = require('mssql');
// const bcrypt = require('bcrypt');
var path = require("path");
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
// var logger = require("morgan");
var LocalStrategy = require('passport-local').Strategy;
const { PythonShell } = require('python-shell');
var formidable = require('formidable');
app.use(flash());

const RedisStore = require('connect-redis').default;  // Note the .default part
const redis = require('redis');

const redisClient = redis.createClient();

app.use(express.static("public"));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
}));


const morgan = require('morgan');

// Define a custom token for morgan to include client IP address

morgan.token('client-ip', function(req, res) {

    return req.ip; // Use req.ip to get the client IP address

  });

morgan.token('username', function(req, res) {

    return req.user; // Use req.ip to get the client IP address

  });  

// Custom token for timestamp

morgan.token('datetime', () => {

    const currentDate = new Date();

    const options = {

        timeZone: 'Asia/Bangkok', // Set the timezone to GMT+7

        hour12: false, // Use 24-hour format

        year: 'numeric',

        month: '2-digit',

        day: '2-digit',

        hour: '2-digit',

        minute: '2-digit',

        second: '2-digit'

      };

    return currentDate.toLocaleString('en-US', options);

  });

  // Use the modified "dev" format with client IP included

app.use(morgan(':client-ip :datetime :username :method :url :status :response-time ms - '));
 





// ======================================ROUTES LINK =================================

var CuttingMechanic = require('./routes/cutting-mechanic-system');//SewingMechanic

app.use('/', CuttingMechanic);

// var clips = require('./routes/clips');//videos
// app.use('/', clips);

app.use(passport.initialize());
app.use(passport.session());
// app.use(logger("dev"));
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
const port = 88;
computerName='localhost'
server.listen(port, computerName);
console.log('http://' + computerName + ':' + port + '/');

//======================================POST GET HTTP Routers==============================================
app.get("/", function (req, res) {
    // res.redirect('http://pbvpweb01:68')
    // console.log(req.user);
    // if (!req.isAuthenticated()) {
    //     res.render("login");
    // } else {
    //     res.render("home", { user: req.user });
    // }
    res.render('home', { user: 'anonymous' });
});


app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

app.get("/login", function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.render('login');
        res.end()
    });
});

// app.get("/login", function (req, res) {
//     res.render('login');
// });



// app.get("/login", function (req, res) {
//     // res.redirect('http://pbvpweb01:68')
//     // res.end()
//     res.render('login');
// });


app.post('/login', passport.authenticate("local", {
    failureRedirect: '/login',
    failureFlash: true
}), function (req, res) {
    get_dept(req.user, function (result) {
        // console.log(result);
        user = result[0].User;
        dept = result[0].Department;
        position = result[0].Position;
        // res.redirect('/')
        // res.end();
        switch (dept){
            // case 'CUT':
            // case 'IECT':
            //     res.redirect("/cutting-mechanic-downtime");
            //     break;
            // case 'PR':
            //     res.redirect("/cutting-mechanic-downtime");
            //     break;
            // case 'MEC':
            //     res.redirect("/sewing-mechanic-change-style");
            //     break;
            case 'IE':
                if (user=='mutran') res.render("home", {ID:req.user});
                else res.redirect("/");
                break;
            default:
                res.redirect('/')
        }
    })
})

passport.use(new LocalStrategy(
    (username, password, done) => {
        var flagLogin = false;
        var dbConn = new mssql.Connection(SQLConfig);
        dbConn.connect().then(function () {
            var request = new mssql.Request(dbConn);
            sql_user = ("SELECT [Password],[Position] FROM [PBCTS].[dbo].[Innovation_erpsystem_setup_user] WHERE UserName='" + username + "' OR IDName='" + username + "';")
            request.query(sql_user).then(function (result) {
                // console.log(result);  
                if (result.length > 0) {
                    dbConn.close();
                    if (password == result[0].Password) {
                        console.log(username + ' Login successful');
                        flagLogin = true;
                        return done(null, username);
                    }
                }
                if (flagLogin == false) {
                    return done(null, false);
                }
            }).catch(function (err) {
                console.log(err);
            });
        }).catch(function (err) {
            console.log(err);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
function get_dept(user, callback) {
    var dept = '';
    var dbConn = new mssql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new mssql.Request(dbConn);
        sql_user = ("SELECT [UserName],[Department],[Position] FROM [PBCTS].[dbo].[Innovation_erpsystem_setup_user] WHERE UserName='" + user + "' OR IDName='" + user + "';")
        request.query(sql_user).then(function (result) {
            // console.log(result);
            dbConn.close();
            if (result.length > 0) {
                return callback(result);
            }
        }).catch(function (err) {
            console.log(err);
        });
    }).catch(function (err) {
        console.log(err);
    });
    return dept;
};

//==============================HANES APP PRODUCTION =============================
function get_date_infor(date, callback) {
    con4.getConnection(function (err, connection) {
        if (err) {
            throw err;
        }
        connection.query("select StartTime, FinishTime, Shift, Note, Week from pr2k.operation_schedule where DATE='" + date + "';", function (err, result, fields) {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
                return callback(result);
            }
        });
    });
};

function get_sup_group(user, callback) {
    var dept = '';
    con2.getConnection(function (err, connection) {
        if (err) {
            throw err;
        }
        sql=("SELECT IF(GR_RIT IS NULL, GR_BAL, GR_RIT) NAMEGROUP, IF(SUP_RIT IS NULL, 'B', 'R') SHIFT FROM"
        + " (SELECT g1.NameGroup GR_RIT, g2.NameGroup GR_BAL, g1.SupervisorRitmo SUP_RIT, g2.SupervisorBali SUP_BAL"
        + " FROM (SELECT NAME FROM setup_user WHERE USER='" + user + "') AS Temp1" 
        + " left JOIN (SELECT * from setup_group g1 WHERE g1.`StatusScan`='Enable') g1 ON g1.SUPERvisorRitmo=Temp1.NAME" 
        + " left JOIN (SELECT * from setup_group g2 WHERE g2.`StatusScan`='Enable') g2 ON g2.SUPERvisorBali=Temp1.NAME) t2 GROUP BY SHIFT;")
        
        connection.query(sql, function (err, result, fields) {
                connection.release();
                if (err) throw err;
                if (result.length > 0) {
                    return callback(result);
                }
            });
    });
    return dept;
};

function get_kanban_infor(plant = 'PB', groupName = '000-000', callback) {
    con4.getConnection(function (err, connection) {
        if (err) {
            throw err;
        }
        if (plant == 'PB' && groupName == '000-000') sql = "select se.NAMEGROUP, kb.ASS_LOT, kb.ASS_STATUS, kb.ASS_CALL, kb.ASS_SEND, kb.ASS_RECEIVE, kb.ASS_SUSPEND from pr2k.operation_kanban kb "
            + " inner join erpsystem.setup_plansewing se on kb.ASS_LOT=se.LotAnet where STAtUS!='DONE' group by se.NameGroup;";
        else if (plant != 'PB' && groupName == '000-000') sql = "select se.NAMEGROUP, kb.ASS_LOT, kb.ASS_STATUS, kb.ASS_CALL, kb.ASS_SEND, kb.ASS_RECEIVE, kb.ASS_SUSPEND from pr2k.operation_kanban kb "
            + " inner join erpsystem.setup_plansewing se on kb.ASS_LOT=se.LotAnet where STATUS!='DONE' and PLAN='" + plant + "' group by se.NameGroup;";
        else if (plant == 'PB' && groupName != '000-000') sql = "select se.NAMEGROUP, kb.ASS_LOT, kb.ASS_STATUS, kb.ASS_CALL, kb.ASS_SEND, kb.ASS_RECEIVE, kb.ASS_SUSPEND from pr2k.operation_kanban kb "
            + " inner join erpsystem.setup_plansewing se on kb.ASS_LOT=se.LotAnet where STATUS!='DONE' and se.NameGroup='" + groupName + "' group by se.NameGroup;";
        else if (plant != 'PB' && groupName == '000-000') sql = "select se.NAMEGROUP, kb.ASS_LOT, kb.ASS_STATUS, kb.ASS_CALL, kb.ASS_SEND, kb.ASS_RECEIVE, kb.ASS_SUSPEND from pr2k.operation_kanban kb "
            + " inner join erpsystem.setup_plansewing se on kb.ASS_LOT=se.LotAnet where STATUS!='DONE' and PLAN='" + plant + "' and se.NameGroup='" + groupName + "' group by se.NameGroup;";
        connection.query(sql, function (err, result, fields) {
            connection.release();
            if (err) throw err;
            return callback(result);
        });
    });
}


app.post("/login_user", function (req, res) {
    res.send(req.user);
    res.end();
});

app.post("/Get_Week", function (req, res) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    var timeUpdate = localISOTime.replace(/T/, ' ').replace(/\..+/, '');
    currHrs = parseInt(timeUpdate.substring(11, 13));
    year = timeUpdate.substring(0, 4);
    month = timeUpdate.substring(5, 7);
    day = timeUpdate.substring(8, 10);
    date = year + month + day;
    con4.getConnection(function (err, connection) {
        if (err) {
            throw err;
        }
        sql = "select WEEK from pr2k.operation_schedule where DATE='" + date + "';";
        connection.query(sql, function (err, result, fields) {
            connection.release();
            if (err) throw err;
            res.send(result);
            res.end();
        });
    });
});

app.post("/Get_RFID", function (req, res) {
    rfid = req.body.rfid;
    con4.getConnection(function (err, connection) {
        if (err) {
            throw err;
        }
        sql = "select e.ID, e.Name, e.Shift, e.Line, e.Dept, e.Position from erpsystem.setup_rfidemplist r inner join erpsystem.setup_emplist e "
            + " on r.EmployeeID=e.ID where r.CardNo='" + rfid + "' or e.ID='" + rfid + "';";
        connection.query(sql, function (err, result, fields) {
            connection.release();
            if (err) throw err;
            res.send(result);
            res.end();
        });
    });
});


app.post("/Get_User_Infor", function (req, res) {
    con2.getConnection(function (err, connection) {
        if (err) {
            throw err;
        }
        connection.query("SELECT User, Department, Position, Name FROM setup_user where User='" + req.user + "';", function (err, result, fields) {
            connection.release();
            if (err) throw err;
            res.send(result);
            res.end();
        });
    });
});

app.post("/Get_Group_By_User", function (req, res) {
    get_sup_group(req.user, function (result) {
        res.send(result);
        res.end();
    })
});
//============================================ PRODUCTION FUNCTION================================================

app.get("/production-scanbundle-payroll-check", function (req, res) {
    res.redirect('http://pbvpweb01:98/production-scanbundle-payroll-check')
    res.end()
    // if (req.isAuthenticated()) {
    //     get_sup_group(req.user, function (result) {
    //         if (result.length > 0) res.render("Production/PayrollCheck", { group: result[0].NAMEGROUP, shift: result[0].SHIFT });
    //         else res.render("Production/PayrollCheck");
    //     });
    // }
    // else {
    //     res.render("login");
    // }
});


// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).redirect('http://pbvpweb01:98');
});

app.disable('view cache');

