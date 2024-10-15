var mysql = require("mysql");
var sql = require("mssql");
const { exec } = require('child_process');
// var con1 = mysql.createPool({
//     connectionLimit: 60,
//     host: "pbvweb01v",
//     user: "tranmung",
//     password: "Tr6nM6ng",
//     database: "linebalancing",
// });
// var con2 = mysql.createPool({
//     connectionLimit: 60,
//     host: "pbvweb01v",
//     user: "tranmung",
//     password: "Tr6nM6ng",
//     database: "engineering",
// });

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

var express = require("express");

var app = express.Router();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const multer = require('multer');

var path = require("path");
var passport = require('passport');
var formidable = require("formidable");
var fs = require("fs");
// Python
const { PythonShell } = require("python-shell");
const { query } = require("express");
app.use(passport.initialize());
app.use(passport.session());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

app.get("/cutting-mechanic", function (req, res) {
    console.log(req.user);
    // res.render("MechanicCutting/mechanic-cutting-home", { user: 'mutran' });
    if (!req.isAuthenticated()) {
        res.render("login");
    } else {
         res.render("MechanicCutting/mechanic-cutting-downtime", { user: req.user });
    }
});

app.get("/cutting-mechanic-downtime", function (req, res) {
    console.log(req.user);
    // res.render("MechanicCutting/mechanic-cutting-downtime", { user: 'tido' });
    if (!req.isAuthenticated()) {
        res.render("login");
    } else {
        res.render("MechanicCutting/mechanic-cutting-downtime", { user: req.user });
    }
});

app.get("/cutting-mechanic-setup-layout", function (req, res) {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        res.render("login");
    } else {
        res.render("MechanicCutting/mechanic-cutting-setup-layout", { user: req.user });
    }
});

app.get("/cutting-mechanic-sparepart-stock", function (req, res) {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        res.render("login");
    } else {
        res.render("MechanicCutting/mechanic-cutting-request-sparepart", { user: req.user });
    }
});
app.get("/cutting-mechanic-setup-pm-plan", function (req, res) {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        res.render("login");
    } else {
        res.send('Chức năng đang phát triển');
    }
});

app.get("/cutting-mechanic-ccs-control", function (req, res) {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        res.render("login");
    } else {
        res.send('Chức năng đang phát triển');
    }
});

app.get("/cutting-mechanic-downtime-report", function (req, res) {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        res.render("login");
    } else {
        res.render("MechanicCutting/mechanic-cutting-reporting", { user: req.user });
    }
});
// ==========================================================================FUNCTION =================================================================

function fc_convert_RFID(rfid, callback) {
    rfid = parseInt(rfid); //00542325
    var hexstring = rfid.toString(16);
    var emphex = hexstring;
    if (hexstring.length > 6)
        emphex = hexstring.substring(hexstring.length - 6, hexstring.length);
    while (emphex.length < 8) {
        emphex = "0" + emphex;
    }
    var last4Digit = emphex.substring(4, 9);
    var pre4Digit = emphex.substring(0, 4);
    if (pre4Digit.length >= 3) {
        pre4Digit = parseInt(
            pre4Digit.substring(pre4Digit.length - 2, pre4Digit.length),
            16
        ).toString();
    }
    last4Digit = parseInt(last4Digit, 16).toString();
    while (pre4Digit.length < 3) {
        pre4Digit = "0" + pre4Digit;
    }
    while (last4Digit.length < 5) {
        last4Digit = "0" + last4Digit;
    }
    var emp8Digits = pre4Digit + last4Digit;
    return callback(emp8Digits);
};

function MachineInformation(MachineID, callback) {
    var machine_type = '';
    var RowPos = '';
    var ColPos = '';
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_machine = ("SELECT * FROM dbo.Innovation_cutting_setup_cutting_machine_location WHERE IDMachine='" + MachineID + "';")
        request.query(sql_machine).then(function (result) {
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
}

// ================= BEGIN ADD CODE DEFECT MECHANIC ===================
app.post('/cutting-mechanic-machine-information', (req, res) => {
    console.log("POST cutting-mechanic-machine-information");
    var MachineID=req.body.MachineID;
    // console.log(MachineID);
    // MachineID='XLC01'
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
    var request = new sql.Request(dbConn);
    sql_query = ("SELECT l.IDMachine,d.MachineName,d.MachineDocumentLink"
            +" FROM dbo.Innovation_cutting_setup_cutting_machine_location l"
            +" INNER JOIN dbo.Innovation_cutting_machine_document d ON d.MachineName=l.MachineName WHERE l.IDMachine='"+MachineID+"'");
    request.query(sql_query).then(function (recordSet) {
    if (recordSet.length > 0) {
    var linkMachine = recordSet[0].MachineName;
    // console.log(linkMachine);
    // exec('start "" "'+linkMachine+'"', (error, stdout, stderr) => {
    // if (error) {
    //     console.error(`Error: ${error}`);
    //     return;
    // }
    //     console.log(`stdout: ${stdout}`);
    //     console.error(`stderr: ${stderr}`);
    //     });
        result = { result:linkMachine };
        res.send(result);
        res.end();
    } else {
        result={'result': 'empty'};
        res.send(result);
        res.end();
        }
        dbConn.close();
    })
    .catch(function (err) {
        console.log(err);
        result={'result': 'err'};
        res.send(result);
        res.end();
        dbConn.close();
        });
    })
    .catch(function (err) {
        result={'result': 'err'};
        res.send(result);
        res.end();
        console.log(err);
    });
});

app.post('/cutting-mechanic-user-login', function (req, res) {
    var user_login=req.body.user_login
    console.log("POST /cutting-mechanic-user-login");
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT TOP 1 UserName,Name,Position,Department FROM dbo.Innovation_erpsystem_setup_user WHERE UserName='" + user_login + "'");
        // console.log(sql_query);
        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                console.log(recordSet);
                res.send(recordSet);
                res.end();
            } else {
                recordSet = [];
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                recordSet = [];
                res.send(recordSet);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            recordSet = [];
            res.send(recordSet);
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-adding-code-defect', function (req, res) {
    console.log("POST /cutting-mechanic-adding-code-defect");

    var codeID = req.body.codeID.toUpperCase();
    codeID=codeID.replace('ER-','');
    codeID = codeID.trim();
    var code_content = req.body.code_content;
    var CodeActive='1';
    var codeID_string='ER-'+codeID
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        // sql_query = ("INSERT INTO dbo.Innovation_cutting_setup_machine_erro_code (MachineCode,CodeInfor,CodeActive,UserUpdate,TimeUpdate)"
        //     + " VALUES (N'" + codeID + "',N'" + code_content + "',N'" + CodeActive + "',N'" + req.user + "',GETDATE())");
        
        sql_query = ("IF EXISTS( SELECT * FROM dbo.Innovation_cutting_setup_machine_erro_code WHERE MachineCode='" +codeID_string + "')"
            + " BEGIN"
            + " UPDATE dbo.Innovation_cutting_setup_machine_erro_code SET CodeInfor=N'" +code_content + "',CodeActive=N'" + CodeActive + "',"
            + " UserUpdate=N'" +req.user + "',TimeUpdate=GETDATE() WHERE MachineCode='" +codeID_string + "'"
            + " END"
            + " ELSE"
            + " BEGIN"
            + " INSERT INTO dbo.Innovation_cutting_setup_machine_erro_code (MachineCode,CodeInfor,CodeActive,UserUpdate,TimeUpdate)"
            + " VALUES (N'" + codeID_string + "',N'" + code_content + "',N'" + CodeActive + "',N'" + req.user + "',GETDATE())"
            + " END")
            // console.log(sql_query);
            request.query(sql_query).then(function (recordSet) {
            res.send({ 'result': 'done' });
            res.end();
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'erro' });
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

// ================= END ADD CODE DEFECT MECHANIC ===================

app.post('/cutting-mechanic-update-machineinformation', function (req, res) {
    console.log("POST /cutting-mechanic-update-machineinformation");
    var IDMachine = req.body.IDMachine;
    var MachineType = req.body.MachineType;
    var MachineName = req.body.MachineName;
    var SerialNo = req.body.SerialNo;
    var StatusMachine = req.body.StatusMachine;
    var MachineLocation = req.body.MachineLocation;
    var IndexCol = req.body.IndexCol;
    var IndexRow = req.body.IndexRow;
    var Active = req.body.Active;
    var MachineContract = req.body.MachineContract;
    var EntryDate = req.body.EntryDate;
    var LifeCycle = req.body.LifeCycle;
    var Comment = req.body.Comment;

    
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT * FROM dbo.Innovation_cutting_setup_cutting_machine_location WHERE IndexRow='" + IndexRow + "' AND IndexCol='" + IndexCol + "' AND Active='Y' AND IndexCol > 0 AND IndexCol > 0 AND IDMachine != '" + IDMachine + "'");
        // console.log(sql_query);
        request.query(sql_query).then(function (recordSet) {
            console.log(recordSet);
            if (recordSet.length == 0) {
                var dbConn2 = new sql.Connection(SQLConfig);
                dbConn2.connect().then(function () {
                    var request2 = new sql.Request(dbConn2);
                    sql_update = ("UPDATE dbo.Innovation_cutting_setup_cutting_machine_location"
                     +" SET MachineType = N'" + MachineType + "',MachineName = N'" + MachineName + "',"
                     + " SerialNo = N'" + SerialNo + "',StatusMachine = '" + StatusMachine + "',"
                     + " MachineLocation = N'" + MachineLocation + "',Active = '" + Active + "',"
                     + " IndexRow = '" + IndexRow + "',IndexCol = '" + IndexCol + "',"
                     + " LifeCycle = N'" + LifeCycle + "',Comment = N'" + Comment + "',"
                     + " MachineContract = N'" + MachineContract + "',EntryDate = N'" + EntryDate + "'"
                     +" WHERE IDMachine = '" + IDMachine + "'");
                    // console.log(sql_update);
                    request2.query(sql_update).then(function (recordSet) {
                        res.send({ 'result': 'done' });
                        res.end()
                        dbConn2.close();
                    })
                        .catch(function (err) {
                            console.log(err);
                            res.send({ 'result': 'erro' });
                            res.end();
                            dbConn2.close();
                        });
                })
                    .catch(function (err) {
                        console.log(err);
                        res.send({ 'result': 'erro' });
                        res.end();
                        dbConn2.close();
                    });

            }
            else {
                res.send({ 'result': 'empty' });
                res.end();
                dbConn.close();
            }

        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'erro' });
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-machine-inventory', function (req, res) {
    console.log("POST /cutting-mechanic-machine-inventory");
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT * FROM [PBCTS].[dbo].[Innovation_cutting_setup_cutting_machine_location]");
        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                // console.log(recordSet);
                res.send(recordSet);
                res.end();
            } else {
                recordSet = [];
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                recordSet = [];
                res.send(recordSet);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            recordSet = [];
            res.send(recordSet);
            res.end();
            console.log(err);
        });
});

app.post('/cutting-machine-update-machine', (req, res) => {
    console.log('upload');
    req.user='mutran'
    var form = new formidable.IncomingForm();
    excelFile = '';
    form.parse(req);
    form.on('fileBegin', function (name, file) {
        // console.log(file);
        excelFile = req.user + '_' + file.originalFilename;
        // console.log(excelFile);
        file.filepath = './public/Python/CuttingMechanic/FileUpload/'+excelFile;
    });

    form.on('file', function (name, file) {
        var options = {
            mode: 'text',
            pythonPath: 'python',
            scriptPath: './public/Python/CuttingMechanic/Update',
            pythonOptions: ['-u'],
            args: [excelFile, process.cwd(), req.user]
        }
        // console.log(options);
        let shell = new PythonShell('update-add-cutting-machine-inventory.py', options);
        shell.on('message', function (message) {
            // res.setHeader("Content-Type", "application/json");
            // console.log(message);
            res.send(message);
            res.end();
        })
    });
});

app.post('/cutting-mechanic-update-pm-task', function (req, res) {
    console.log("POST /cutting-mechanic-update-pm-task");
    var MachineID = req.body.MachineID;
    var MachineState = req.body.MachineState;
    var MechanicID = req.body.MechanicID;
    var MechanicName = req.body.MechanicName;
    var note_open = req.body.note_open;
    var note_close = req.body.note_close;
    var dbConn = new sql.Connection(SQLConfig);
    var task = 'PM';
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        if (MachineState != '0') {
            var MachinesStatus = '0';
            // OK

            sql_query=("UPDATE dbo.Innovation_cutting_data_downtime"
                +" SET MachineStatus = '" + MachinesStatus + "',"
                +" IDMechanic ='" + MechanicID + "',"
                +" MechanicName = '" + MechanicName + "',"
                +" CloseMachineCode =N'" + task + "',"
                +" NotePMClose = N'" + note_close + "',"
                +" FinishTime = GETDATE()"
                +" WHERE MachineID = ("
                +" SELECT TOP 1 dt_real.MachineID" 
                +" FROM (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max" 
                +" LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real" 
                +" ON dt_real.MachineID = dt_max.MachineID"
                +" AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
                +" WHERE dt_real.MachineID = '" + MachineID + "' AND MachineStatus = '4'"
                +" ORDER BY dt_real.StartTime DESC) AND MachineStatus = '4'")
            // console.log(sql_query)
            request.query(sql_query).then(function (recordSet) {
                res.send({ 'result': 'done' });
                res.end();
                dbConn.close();
            })
                .catch(function (err) {
                    console.log(err);
                    res.send({ 'result': 'error' });
                    dbConn.close();
                });
        }
        else {
            MachinesStatus = '4';
            // Call MachineInformation asynchronously
            MachineInformation(MachineID, function (MachineLogs) {
                console.log(MachineLogs);
                // Use MachineLogs here to set MachineType, RowPos, ColPos
                var MachineType = MachineLogs[0].MachineType;
                var RowPos = MachineLogs[0].IndexRow;
                var ColPos = MachineLogs[0].IndexCol;

                sql_query = ("INSERT INTO dbo.Innovation_cutting_data_downtime (MachineID,RowPos,ColPos,MachineStatus,StartTime,IDEmployee,NameEmployee,OpenMachineCode,NotePMOpen)"
                    + " VALUES (N'" + MachineID + "',N'" + RowPos + "',N'" + ColPos + "',N'" + MachinesStatus + "',GETDATE(),N'" + MechanicID + "',N'" + MechanicName + "',N'" + task + "',N'" + note_open + "')");
                request.query(sql_query).then(function (recordSet) {
                    res.send({ 'result': 'done' });
                    res.end();
                    dbConn.close();
                })
                    .catch(function (err) {
                        console.log(err);
                        res.send({ 'result': 'error' });
                        dbConn.close();
                    });
            });
        }
    })
        .catch(function (err) {
            console.log(err);
            res.send({ 'result': 'error' });
            res.end();
        });
});


app.post('/cutting-mechanic-downtime-report-data', function (req, res) {
    console.log("POST /cutting-mechanic-downtime-report-data");
    var date_from=req.body.date_from;
    var date_to=req.body.date_to;
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        // sql_query = ("SELECT lc.IDMachine,lc.MachineLocation,lc.MachineName,lc.SerialNo,lc.IndexRow AS row,lc.IndexCol AS col,"
        //     + " d.MachineID,d.RowPos,d.ColPos,d.StartTime,CASE WHEN d.MachineStatus IS NULL THEN 0 ELSE d.MachineStatus END AS state"
        //     + " ,d.FinishTime,d.IDEmployee,d.NameEmployee,d.IDMechanic,d.MechanicName,d.OpenMachineCode,d.Comment,"
        //     + " CASE WHEN d.FinishTime IS NULL THEN ROUND(DATEDIFF(MINUTE, d.StartTime, GETDATE()),2) ELSE ROUND(DATEDIFF(MINUTE, d.StartTime, d.FinishTime),2) END AS DownTimeInMinutes"
        //     + " FROM"
        //     + " (SELECT * FROM dbo.Innovation_cutting_setup_cutting_machine_location WHERE Active ='Y' AND IndexRow >0 AND IndexCol >0) lc"
        //     + " LEFT JOIN"
        //     + " (SELECT dt_real.* FROM"
        //     + " (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max"
        //     + " LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real ON dt_real.MachineID = dt_max.MachineID AND  CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)) d"
        //     + " ON d.MachineID=lc.IDMachine WHERE d.MachineStatus>0 OR d.StartTime >= cast(dateadd(DAY, -3, getdate()) as date) ORDER BY  d.StartTime DESC,IndexRow asc,IndexCol asc");
        sql_query=("SELECT CONVERT(VARCHAR(10), dt.StartTime, 120) AS TIMEDATE,mc.MachineName, dt.*,"
                +" CASE WHEN dt.FinishTime IS NULL THEN ROUND(DATEDIFF(MINUTE, dt.StartTime, GETDATE()),2) ELSE ROUND(DATEDIFF(MINUTE, dt.StartTime, dt.FinishTime),2) END AS DownTimeInMinutes"
                +" FROM"
                +" (SELECT *"
                +" FROM dbo.Innovation_cutting_data_downtime d"
                +" where d.StartTime>='" + date_from + "' AND d.StartTime<='" + date_to + "') dt"
                +" LEFT JOIN dbo.Innovation_cutting_setup_cutting_machine_location mc ON dt.MachineID=mc.IDMachine ORDER BY dt.StartTime ASC");
        // console.log(sql_query);
        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                // console.log(recordSet);
                res.send(recordSet);
                res.end();
            } else {
                recordSet = [];
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                recordSet = [];
                res.send(recordSet);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            recordSet = [];
            res.send(recordSet);
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-downtime-report-by-codemachinedowntime', function (req, res) {
    console.log("POST /cutting-mechanic-downtime-report-by-codemachinedowntimeSELECT * FROM dbo.Innovation_cutting_setup_machine_erro_code ORDER BY MachineCode;");
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT c.*,CASE WHEN a.Issuse IS NULL THEN 0 ELSE a.Issuse END AS Issuse"
            + " FROM (SELECT MachineCode,CodeInfor FROM dbo.Innovation_cutting_setup_machine_erro_code WHERE CodeActive >0) c"
            + " LEFT JOIN (SELECT CloseMachineCode,COUNT(MachineID) AS Issuse FROM dbo.Innovation_cutting_data_downtime WHERE StartTime >='2023-01-01'"
            + " GROUP BY CloseMachineCode) a ON LEFT(a.CloseMachineCode,6)=c.MachineCode");

        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                // console.log(recordSet);
                res.send(recordSet);
                res.end();
            } else {
                recordSet = [];
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                recordSet = [];
                res.send(recordSet);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            recordSet = [];
            res.send(recordSet);
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-downtime-report-by-typemachine', function (req, res) {
    console.log("POST /cutting-mechanic-downtime-report-by-typemachine");
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT d. MachineType, SUM(Issuse) AS TotalIssuse FROM"
            + " (SELECT m.*,CASE WHEN a.Issuse IS NULL THEN 0 ELSE a.Issuse END AS Issuse"
            + " FROM (SELECT MachineType,IDMachine FROM dbo.Innovation_cutting_setup_cutting_machine_location WHERE Active ='Y') m"
            + " LEFT JOIN (SELECT MachineID,COUNT(MachineID) AS Issuse FROM dbo.Innovation_cutting_data_downtime WHERE StartTime >='2023-11-01'"
            + " GROUP BY MachineID) a ON a.MachineID=m.IDMachine) d GROUP BY MachineType;");

        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                // console.log(recordSet);
                res.send(recordSet);
                res.end();
            } else {
                recordSet = [];
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                recordSet = [];
                res.send(recordSet);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            recordSet = [];
            res.send(recordSet);
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-downtime-report-get-codebroken', function (req, res) {
    console.log("POST /cutting-mechanic-downtime-report-get-codebroken");
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT * FROM dbo.Innovation_cutting_setup_machine_erro_code ORDER BY MachineCode;");

        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                // console.log(recordSet);
                res.send(recordSet);
                res.end();
            } else {
                recordSet = [];
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                recordSet = [];
                res.send(recordSet);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            recordSet = [];
            res.send(recordSet);
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-downtime-realtime', function (req, res) {
    console.log("POST cutting-mechanic-downtime");
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT lc.IDMachine,lc.MachineLocation,lc.MachineName,lc.SerialNo,lc.IndexRow AS row,lc.IndexCol AS col,"
            + " d.MachineID,d.RowPos,d.ColPos,d.StartTime,CASE WHEN d.MachineStatus IS NULL THEN 0 ELSE d.MachineStatus END AS state FROM"
            + " (SELECT * FROM dbo.Innovation_cutting_setup_cutting_machine_location WHERE Active ='Y' AND IndexRow >0 AND IndexCol >0) lc"
            + " LEFT JOIN"
            + " (SELECT dt_real.* FROM"
            + " (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max"
            + " LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real ON dt_real.MachineID = dt_max.MachineID AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)) d"
            + " ON d.MachineID=lc.IDMachine ORDER BY IndexRow,IndexCol");

        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                res.send(recordSet);
                res.end();
            } else {
                res.send({ result: 'empty' });
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ result: 'erro' });
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-broken-setup', function (req, res) {
    console.log("POST cutting-mechanic-broken-setup");
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT *FROM dbo.Innovation_cutting_setup_machine_erro_code");

        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {

                if (recordSet.length > 0) {
                    res.send(recordSet);
                    res.end();
                }
                else {
                    res.send({ 'result': 'empty' });
                    res.end();
                }

            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'error' });
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-broken-code', function (req, res) {

    console.log("POST cutting-mechanic-broken-code");
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT CONCAT(MachineCode,' - ',CodeInfor) AS CODE_BROKEN FROM dbo.Innovation_cutting_setup_machine_erro_code WHERE CodeActive=1");
        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {

                if (recordSet.length > 0) {
                    res.send(recordSet);
                    res.end();
                }
                else {
                    res.send({ 'result': 'empty' });
                    res.end();
                }
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'error' });
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-loading-employee', function (req, res) {
    console.log("POST cutting-loading-employee");
    var rfid = req.body.rfid;

    fc_convert_RFID(rfid, function (IDCard) {
        // console.log(IDCard);
        
        // IDCard = '08421875'
        var dbConn = new sql.Connection(SQLConfig);
        dbConn.connect().then(function () {
            var request = new sql.Request(dbConn);
            
            // console.log(IDCard);
            sql_query = ("SELECT rf.*,e.Name,e.Dept,e.Position,e.Shift"
                + " FROM (SELECT DISTINCT CardNo,EmployeeID FROM dbo.Innovation_erpsystem_setup_rfidemplist WHERE CardNo='" + IDCard + "') rf"
                + " LEFT JOIN dbo.Innovation_erpsystem_setup_emplist e ON e.ID=rf.EmployeeID");
            
            if (rfid=='02591981924'||rfid=='0312925409'){
                if (rfid=='02591981924') IDCard='00461540'
                sql_query=("SELECT rf.*,e.Name,CASE WHEN e.Dept = 'CT' THEN 'IECT' ELSE e.Dept END AS Dept,e.Position,e.Shift"
                    +" FROM (SELECT DISTINCT CardNo, EmployeeID FROM dbo.Innovation_erpsystem_setup_rfidemplist WHERE CardNo = '" + IDCard + "') rf"
                    +" LEFT JOIN dbo.Innovation_erpsystem_setup_emplist e ON e.ID = rf.EmployeeID;")
            }
            // console.log(sql_query)
            request.query(sql_query).then(function (recordSet) {
                if (recordSet.length > 0) {
                    // console.log(recordSet);
                    res.send(recordSet);
                    res.end();
                }
                else {
                    recordSet = [];
                    res.send(recordSet);
                    res.end();
                }
                dbConn.close();

            })
                .catch(function (err) {
                    console.log(err);
                    res.end();

                    dbConn.close();
                });
        })
            .catch(function (err) {
                res.end();
                console.log(err);
            });
    });
});

app.post('/cutting-mechanic-downtime-open-ticket', function (req, res) {
    console.log("POST /cutting-mechanic-downtime-open-ticket");

    var emp_id = req.body.emp_id.trim();
    var emp_name = req.body.emp_name;
    var machine_type = req.body.machine_type.trim();
    var machine_location = req.body.machine_location.trim();
    var machine_broken_code = req.body.machine_broken_code;
    var RowPos = machine_location.split("x")[0];
    var ColPos = machine_location.split("x")[1];

    var MachinesStatus = 1;//code status broken: 0
    // OK

    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("INSERT INTO dbo.Innovation_cutting_data_downtime (MachineID,RowPos,ColPos,MachineStatus,StartTime,IDEmployee,NameEmployee,OpenMachineCode)"
            + " VALUES (N'" + machine_type + "',N'" + RowPos + "',N'" + ColPos + "',N'" + MachinesStatus + "',GETDATE(),N'" + emp_id + "',N'" + emp_name + "',N'" + machine_broken_code + "')");
        request.query(sql_query).then(function (recordSet) {
            res.send({ 'result': 'done' });
            res.end();
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'erro' });
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-confirm-repair', function (req, res) {
    console.log("POST cutting-mechanic-confirm-repair");
    var MachineID = req.body.MachineID;
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT dt_real.* FROM"
            + " (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max"
            + " LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real ON dt_real.MachineID = dt_max.MachineID AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
            + " WHERE dt_real.MachineID='" + MachineID + "'");

        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-downtime-no_repair', function (req, res) {
    console.log("POST cutting-mechanic-downtime-no_repair");
    var MachineID = req.body.MachineID;
    var emp_id = req.body.emp_id;
    var emp_name = req.body.emp_name;
    var mechanic_broken_code = req.body.mechanic_broken_code;
    var mechanic_id = req.body.mechanic_id;
    var mechanic_name = req.body.mechanic_name;

    var MachinesStatus = 0;
    var Note = 'Đóng không cần sửa'
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        // OK

        sql_query = ("UPDATE dbo.Innovation_cutting_data_downtime SET MachineStatus = '" + MachinesStatus + "',IDMechanic='" + mechanic_id + "',MechanicName='" + mechanic_name + "',CloseMachineCode=N'" + mechanic_broken_code + "',Comment =N'" + Note + "',FinishTime=GETDATE() WHERE MachineID =(SELECT dt_real.MachineID FROM"
            + " (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max"
            + " LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real ON dt_real.MachineID = dt_max.MachineID AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
            + " WHERE dt_real.MachineID='" + MachineID + "' AND MachineStatus = '1') AND MachineStatus = '1'");
        
         sql_query=("UPDATE dbo.Innovation_cutting_data_downtime"
                +" SET MachineStatus = '" + MachinesStatus + "',"
                +" IDMechanic ='" + mechanic_id + "',"
                +" MechanicName = '" + mechanic_name + "',"
                +" CloseMachineCode =N'" + mechanic_broken_code + "',"
                +" Comment = N'" + Note + "',"
                +" FinishTime = GETDATE()"
                +" WHERE MachineID = ("
                +" SELECT TOP 1 dt_real.MachineID" 
                +" FROM (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max" 
                +" LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real" 
                +" ON dt_real.MachineID = dt_max.MachineID"
                +" AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
                +" WHERE dt_real.MachineID = '" + MachineID + "' AND MachineStatus = '1'"
                +" ORDER BY dt_real.StartTime DESC) AND MachineStatus = '1'")
            

        request.query(sql_query).then(function (recordSet) {
            res.send({ 'result': 'done' });
            res.end();
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'erro' });
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.send({ 'result': 'erro' });
            res.end();
            console.log(err);
        });
});


app.post('/cutting-mechanic-start-repair', function (req, res) {
    console.log("POST cutting-mechanic-start-repair");

    var MachineID = req.body.MachineID;
    var emp_id = req.body.emp_id;
    var emp_name = req.body.emp_name;
    var mechanic_broken_code = req.body.mechanic_broken_code;
    var mechanic_id = req.body.mechanic_id;
    var mechanic_name = req.body.mechanic_name;
    var MachinesStatus = 2;

    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        // sql_query = ("UPDATE dbo.Innovation_cutting_data_downtime SET MachineStatus = '" + MachinesStatus + "',IDMechanic='" + mechanic_id + "',MechanicName='" + mechanic_name + "',CloseMachineCode=N'" + mechanic_broken_code + "',FixTime=GETDATE() WHERE MachineID =(SELECT dt_real.MachineID FROM"
        //     + " (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max"
        //     + " LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real ON dt_real.MachineID = dt_max.MachineID AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
        //     + " WHERE dt_real.MachineID='" + MachineID + "' AND MachineStatus = '1') AND MachineStatus='1'");
        sql_query=("UPDATE dbo.Innovation_cutting_data_downtime"
            +" SET MachineStatus = '" + MachinesStatus + "',"
            +" IDMechanic ='" + mechanic_id + "',"
            +" MechanicName = '" + mechanic_name + "',"
            +" CloseMachineCode =N'" + mechanic_broken_code + "',"
            +" FixTime = GETDATE()"
            +" WHERE MachineID = ("
            +" SELECT TOP 1 dt_real.MachineID" 
            +" FROM (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max" 
            +" LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real" 
            +" ON dt_real.MachineID = dt_max.MachineID"
            +" AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
            +" WHERE dt_real.MachineID = '" + MachineID + "' AND MachineStatus = '1'"
            +" ORDER BY dt_real.StartTime DESC) AND MachineStatus = '1'")
        // console.log(sql_query);
        request.query(sql_query).then(function (recordSet) {
            res.send({ 'result': 'done' });
            res.end();
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'erro' });
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-production-confirmation', function (req, res) {
    console.log("POST cutting-mechanic-production-confirmation");

    var MachineID = req.body.MachineID;
    var emp_confirm = req.body.emp_confirm;
    var emp_confirm_name = req.body.emp_confirm_name;
    var IDComplete = emp_confirm + '-' + emp_confirm_name

    var MachinesStatus = 0; //đặt lại hoạt động tốt

    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        // sql_query = ("UPDATE dbo.Innovation_cutting_data_downtime SET MachineStatus = '" + MachinesStatus + "',IDProductionFirm='" + IDComplete + "',ProductionFirmTime=GETDATE() WHERE MachineID =(SELECT dt_real.MachineID FROM"
        //     + " (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max"
        //     + " LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real ON dt_real.MachineID = dt_max.MachineID AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
        //     + " WHERE dt_real.MachineID='" + MachineID + "' AND MachineStatus = '3' ) AND MachineStatus = '3'");
        sql_query=("UPDATE dbo.Innovation_cutting_data_downtime"
            +" SET MachineStatus = '" + MachinesStatus + "',"
            +" IDProductionFirm = '" + IDComplete + "',"
            +" ProductionFirmTime = GETDATE()"
            +" WHERE MachineID = ("
            +" SELECT TOP 1 dt_real.MachineID" 
            +" FROM (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max" 
            +" LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real" 
            +" ON dt_real.MachineID = dt_max.MachineID"
            +" AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
            +" WHERE dt_real.MachineID = '" + MachineID + "' AND MachineStatus = '3'"
            +" ORDER BY dt_real.StartTime DESC) AND MachineStatus = '3'")

        request.query(sql_query).then(function (recordSet) {
            res.send({ 'result': 'done' });
            res.end();
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'erro' });
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-finish-repair', function (req, res) {
    console.log("POST cutting-mechanic-finish-repair");

    var MachineID = req.body.MachineID;
    var emp_id = req.body.emp_id;
    var emp_name = req.body.emp_name;
    var emp_confirm = req.body.emp_confirm;
    var emp_confirm_name = req.body.emp_confirm_name;
    var IDComplete = emp_confirm + '-' + emp_confirm_name
    var mechanic_close_note= req.body.mechanic_close_note;
    var MachinesStatus = 3; //chờ xác nhận

    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        // sql_query = ("UPDATE dbo.Innovation_cutting_data_downtime SET MachineStatus = '" + MachinesStatus + "',IDComplete='" + IDComplete + "',FinishTime=GETDATE(),NoteMechanicClose=N'" + mechanic_close_note + "' WHERE MachineID =(SELECT dt_real.MachineID FROM"
        //     + " (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max"
        //     + " LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real ON dt_real.MachineID = dt_max.MachineID AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
        //     + " WHERE dt_real.MachineID='" + MachineID + "' AND MachineStatus = '2')  AND MachineStatus = '2'");
        sql_query=("UPDATE dbo.Innovation_cutting_data_downtime"
            +" SET MachineStatus = '" + MachinesStatus + "',"
            +" IDComplete ='" + IDComplete + "',"
            +" NoteMechanicClose = N'" + mechanic_close_note + "',"
            +" FinishTime = GETDATE()"
            +" WHERE MachineID = ("
            +" SELECT TOP 1 dt_real.MachineID" 
            +" FROM (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max" 
            +" LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real" 
            +" ON dt_real.MachineID = dt_max.MachineID"
            +" AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
            +" WHERE dt_real.MachineID = '" + MachineID + "' AND MachineStatus = '2'"
            +" ORDER BY dt_real.StartTime DESC) AND MachineStatus = '2'")

        request.query(sql_query).then(function (recordSet) {
            res.send({ 'result': 'done' });
            res.end();
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'erro' });
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-get-close-ticket', function (req, res) {
    console.log("POST cutting-mechanic-get-close-ticket");
    var MachineID = req.body.MachineID;
    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT dt_real.* FROM"
            + " (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max"
            + " LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real ON dt_real.MachineID = dt_max.MachineID AND CONVERT(varchar, dt_real.StartTime, 120) = CONVERT(varchar, dt_max.StartTime, 120)"
            + " WHERE dt_real.MachineID='" + MachineID + "'");

        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});


app.post('/cutting-mechanic-layout-move', function (req, res) {
    console.log("POST cutting-mechanic-layout-move");
    var IDMachine = req.body.IDMachine;
    var IndexCol = req.body.IndexCol;
    var IndexRow = req.body.IndexRow;

    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT * FROM dbo.Innovation_cutting_setup_cutting_machine_location WHERE IndexRow='" + IndexRow + "' AND IndexCol='" + IndexCol + "' AND Active='Y' AND IndexCol > 0 AND IndexCol > 0 AND IDMachine != '" + IDMachine + "'");
        // console.log(sql_query);
        request.query(sql_query).then(function (recordSet) {
            // console.log(recordSet);
            if (recordSet.length == 0) {
                var dbConn2 = new sql.Connection(SQLConfig);
                dbConn2.connect().then(function () {
                    var request2 = new sql.Request(dbConn2);
                    sql_update = ("UPDATE dbo.Innovation_cutting_setup_cutting_machine_location SET IndexRow = '" + IndexRow + "',IndexCol = '" + IndexCol + "' WHERE IDMachine = '" + IDMachine + "'")
                    // console.log(sql_update);

                    request2.query(sql_update).then(function (recordSet) {
                        res.send({ 'result': 'done' });
                        res.end()
                        dbConn2.close();
                    })
                        .catch(function (err) {
                            res.send({ 'result': 'empty' });
                            res.end();
                            dbConn2.close();
                        });
                })
                    .catch(function (err) {
                        console.log(err);
                        res.send({ 'result': 'erro' });
                        res.end();
                        dbConn2.close();
                    });

            }
            else {
                res.send({ 'result': 'empty' });
                res.end();
                dbConn.close();
            }

        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'erro' });
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});


app.post('/cutting-mechanic-machine-list', function (req, res) {
    console.log("POST /cutting-mechanic-machine-list");

    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT * FROM dbo.Innovation_cutting_setup_cutting_machine_location  ORDER BY IDMachine,IndexRow,IndexCol,Active");
        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-machine_active', function (req, res) {
    console.log("POST cutting-mechanic-machine_active");

    var MachineID = req.body.MachineID;
    var MachineType = req.body.MachineType;
    var MachineName = req.body.MachineName;
    var SerialNo = req.body.SerialNo;
    var MachineLocation = req.body.MachineLocation;
    var IndexRow = req.body.IndexRow;
    var IndexCol = req.body.IndexCol;
    var statusMachine = req.body.statusMachine;


    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("UPDATE dbo.Innovation_cutting_setup_cutting_machine_location SET Active = '" + statusMachine + "' WHERE IDMachine = '" + MachineID + "'");
        request.query(sql_query).then(function (recordSet) {
            res.send({ 'result': 'done' });
            res.end();
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.send({ 'result': 'erro' });
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-machine-partlist', function (req, res) {
    console.log("POST /cutting-mechanic-machine-partlist");
    var MachineID = req.body.MachineID;

    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT * FROM dbo.Innovation_cutting_setup_machine_part"
            + " WHERE Model IN (select MachineName from dbo.Innovation_cutting_setup_cutting_machine_location lc where lc.IDMachine='" + MachineID + "')");
        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});

app.post('/cutting-mechanic-request-part-summary', function (req, res) {
    console.log("POST /cutting-mechanic-request-part-summary");

    var dbConn = new sql.Connection(SQLConfig);
    dbConn.connect().then(function () {
        var request = new sql.Request(dbConn);
        sql_query = ("SELECT * FROM dbo.Innovation_cutting_setup_machine_part WHERE TypeMachine='PISANI'");
        request.query(sql_query).then(function (recordSet) {
            if (recordSet.length > 0) {
                res.send(recordSet);
                res.end();
            }
            dbConn.close();
        })
            .catch(function (err) {
                console.log(err);
                res.end();
                dbConn.close();
            });
    })
        .catch(function (err) {
            res.end();
            console.log(err);
        });
});


module.exports = app;