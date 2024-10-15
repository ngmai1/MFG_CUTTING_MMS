import pandas as pd
import numpy as np
import os
import sys
import json
import pyodbc
import datetime

connection = pyodbc.connect(
    DRIVER='{SQL Server}',
    SERVER='PBVPAYQSQL1V',
    UID='cts',
    PWD='Ct$yS123',
    database='PBCTS')
cursor = connection.cursor()


def get_date_format(date):
    year = date[0:4]
    month = date[4:6]
    day = date[6:8]
    return str(year), str((datetime.date(int(year), int(month), int(day)).isocalendar()[1]))


if __name__ == "__main__":
    data_excel = []
    excelFile=sys.argv[1]
    path=sys.argv[2]
    UserUpdate =sys.argv[3]
    # excelFile='mutran_cutting_mechanic_upload_machine_template.xlsx'
    # path='C:\\Users\\mutran\\OneDrive - Hanesbrands Inc\\Desktop\\Phubai_TranMung_Store\\3. Phubai Innovation project\\2.Digitalization\\CuttingManagementSystem'
    # UserUpdate ='mutran'
    path=path.replace('\\','/')
    try:
        filePath = path+'/public/Python/CuttingMechanic/FileUpload/'+excelFile
        data_excel = pd.read_excel(filePath, sheet_name='UploadMachine',skiprows=1)
        data_excel = data_excel.fillna('')
        # print(data_excel)
        if len(data_excel) > 0:
            for i in range(0, len(data_excel)):
                IDMachine = str(data_excel.iloc[i, 0])
                MachineType = str(data_excel.iloc[i, 1])
                MachineName = str(data_excel.iloc[i, 2])
                SerialNo = str(data_excel.iloc[i, 3])
                MachineLocation = str(data_excel.iloc[i, 4])
                IndexRow = str(data_excel.iloc[i, 5])
                IndexCol = str(data_excel.iloc[i, 6])
                Active = str(data_excel.iloc[i, 7])
                MachineContract = str(data_excel.iloc[i, 8])
                Qty = str(data_excel.iloc[i, 9])
                EntryDate = str(data_excel.iloc[i, 10])
                StatusMachine = str(data_excel.iloc[i, 11])
                LifeCycle = str(data_excel.iloc[i, 12])
                NBV = str(data_excel.iloc[i, 13])
                Comment = str(data_excel.iloc[i, 14])

                sql = ("IF EXISTS( SELECT * FROM PBCTS.dbo.Innovation_cutting_setup_cutting_machine_location WHERE IDMachine='" + str(IDMachine) + "')"
                       + " BEGIN"
                       + " UPDATE PBCTS.dbo.Innovation_cutting_setup_cutting_machine_location SET MachineType=N'" + str(MachineType) + "',MachineName=N'" + str(
                           MachineName) + "',SerialNo=N'" + str(SerialNo) + "',MachineLocation=N'" + str(MachineLocation) + "',IndexRow=N'" + str(IndexRow) + "',"
                       + " IndexCol=N'" + str(IndexCol) + "',Active=N'" + str(Active) + "',MachineContract=N'" + str(
                           MachineContract) + "',Qty='" + str(Qty) + "',EntryDate=N'" + str(EntryDate) + "',"
                       + " StatusMachine=N'" + str(StatusMachine) + "',LifeCycle=N'" + str(
                           LifeCycle) + "',NBV=N'" + str(NBV) + "',Comment=N'" + str(Comment) + "',"
                       + " UserUpdate=N'" +
                       str(UserUpdate) + "',TimeUpdate=GETDATE() WHERE IDMachine='" +
                       str(IDMachine) + "'"
                       + " END"
                       + " ELSE"
                       + " BEGIN"
                       + " INSERT INTO PBCTS.dbo.Innovation_cutting_setup_cutting_machine_location(IDMachine,MachineType,MachineName,SerialNo,MachineLocation,IndexRow,IndexCol,Active,MachineContract,Qty,EntryDate,StatusMachine,LifeCycle,NBV,Comment,UserUpdate,TimeUpdate)"
                       + " VALUES(N'" + str(IDMachine) + "',N'" + str(MachineType) + "',N'" + str(MachineName) + "',N'" + str(SerialNo) + "',N'" + str(
                           MachineLocation) + "',N'" + str(IndexRow) + "',N'" + str(IndexCol) + "',N'" + str(Active) + "',N'" + str(MachineContract) + "',"
                       + " N'" + str(Qty) + "',N'" + str(EntryDate) + "',N'" + str(StatusMachine) + "',N'" + str(
                           LifeCycle) + "',N'" + str(NBV) + "',N'" + str(Comment) + "',N'" + str(UserUpdate) + "',GETDATE())"
                       + " END")
                # print(sql)
                cursor.execute(sql)
                connection.commit()
        print('done')

    except Exception as e:
        print(e)
