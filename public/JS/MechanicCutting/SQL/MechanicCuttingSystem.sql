---- 1 Báo cáo downtime theo thời gian thực

-- SELECT lc.IDMachine,lc.MachineLocation,lc.MachineName,lc.SerialNo,lc.IndexRow AS row,lc.IndexCol AS col,
-- d.MachineID,d.RowPos,d.ColPos,d.StartTime,CASE WHEN d.MachineStatus IS NULL THEN 0 ELSE d.MachineStatus END AS state
-- ,d.FinishTime,d.IDEmployee,d.NameEmployee,d.IDMechanic,d.MechanicName,d.OpenMachineCode,d.Comment,
-- CASE WHEN d.FinishTime IS NULL THEN ROUND(DATEDIFF(MINUTE, d.StartTime, GETDATE()),2) ELSE ROUND(DATEDIFF(MINUTE, d.StartTime, d.FinishTime),2) END AS DownTimeInMinutes
--  FROM
-- (SELECT * FROM dbo.Innovation_cutting_setup_cutting_machine_location WHERE Active ='Y' AND IndexRow >0 AND IndexCol >0) lc
-- LEFT JOIN
-- (SELECT dt_real.* FROM
-- (SELECT MachineID, MAX(StartTime) AS StartTime FROM dbo.Innovation_cutting_data_downtime GROUP BY MachineID) dt_max
-- LEFT JOIN dbo.Innovation_cutting_data_downtime dt_real ON dt_real.MachineID = dt_max.MachineID AND  dt_real.StartTime = dt_max.StartTime) d
-- ON d.MachineID=lc.IDMachine WHERE d.MachineStatus>0 OR d.StartTime >= cast(dateadd(DAY, -3, getdate()) as date) ORDER BY  d.StartTime DESC,IndexRow asc,IndexCol ASC;
-- 

--- 2 Tổng hợp lỗi theo code lỗi -----
-- SELECT c.*,CASE WHEN a.Issuse IS NULL THEN 0 ELSE a.Issuse END AS Issuse
-- FROM (SELECT MachineCode,CodeInfor FROM dbo.Innovation_cutting_setup_machine_erro_code WHERE CodeActive >0) c
-- LEFT JOIN (SELECT CloseMachineCode,COUNT(MachineID) AS Issuse FROM dbo.Innovation_cutting_data_downtime WHERE StartTime >='2023-01-01'
-- GROUP BY CloseMachineCode) a ON LEFT(a.CloseMachineCode,6)=c.MachineCode

--- 3 Tổng hợp lỗi theo mã máy -----\

-- SELECT d. MachineType, SUM(Issuse) AS TotalIssuse FROM
-- (SELECT m.*,CASE WHEN a.Issuse IS NULL THEN 0 ELSE a.Issuse END AS Issuse
-- FROM (SELECT MachineType,IDMachine FROM dbo.Innovation_cutting_setup_cutting_machine_location WHERE Active ='Y') m
-- LEFT JOIN (SELECT MachineID,COUNT(MachineID) AS Issuse FROM dbo.Innovation_cutting_data_downtime WHERE StartTime >='2023-11-01'
-- GROUP BY MachineID) a ON a.MachineID=m.IDMachine) d GROUP BY MachineType;
-- 
-- SELECT m.*,CASE WHEN a.Issuse IS NULL THEN 0 ELSE a.Issuse END AS Issuse
-- FROM (SELECT MachineType,IDMachine FROM dbo.Innovation_cutting_setup_cutting_machine_location WHERE Active ='Y') m
-- LEFT JOIN (SELECT MachineID,COUNT(MachineID) AS Issuse FROM dbo.Innovation_cutting_data_downtime WHERE StartTime >='2023-11-01'
-- GROUP BY MachineID) a ON a.MachineID=m.IDMachine

--- 4- Lấy thông tin mã lỗ -----\
-- SELECT * FROM dbo.Innovation_cutting_setup_machine_erro_code ORDER BY MachineCode;
-- 
-- UPDATE dbo.Innovation_cutting_setup_machine_erro_code SET TimeUpdate=GETDATE()

--- 5 downtime
SELECT CONVERT(VARCHAR(10), dt.StartTime, 120) AS TIMEDATE,mc.MachineName, dt.*,
    CASE WHEN dt.FinishTime IS NULL THEN ROUND(DATEDIFF(MINUTE, dt.StartTime, GETDATE()),2) ELSE ROUND(DATEDIFF(MINUTE, dt.StartTime, dt.FinishTime),2) END AS DownTimeInMinutes
FROM
    (SELECT *
    FROM dbo.Innovation_cutting_data_downtime d
    where d.StartTime>='2023-01-01' AND d.StartTime<='2023-12-31') dt
    LEFT JOIN dbo.Innovation_cutting_setup_cutting_machine_location mc ON dt.MachineID=mc.IDMachine ORDER BY dt.StartTime ASC


