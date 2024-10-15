import pandas as pd
import numpy as np
import os
import sys
import json
import pyodbc
import datetime

connection = pyodbc.connect(
    DRIVER='{SQL Server}',
    SERVER='PBV-61GMXT2\\SQLEXPRESS',
    UID='sa',
    PWD='Phubai@123@',
    database='PBCTS')
cursor = connection.cursor()


def get_date_format(date):
    year = date[0:4]
    month = date[4:6]
    day = date[6:8]
    return str(year), str((datetime.date(int(year), int(month), int(day)).isocalendar()[1]))


if __name__ == "__main__":
    data_excel = []
    try:
        filePath = r'C:\Users\mutran\OneDrive - Hanesbrands Inc\Desktop\Phubai_TranMung_Store\3. Phubai Innovation project\2.Digitalization\CuttingManagementSystem\public\Python\CuttingMechanic\Setup\datasetup\data_machine_cutting.xlsx'
        UserUpdate = 'mutran'
        data_excel = pd.read_excel(filePath, sheet_name='MachineList')
        data_excel = data_excel.fillna('')
        # print(data_excel)
        UserUpdate = 'mutran'
        if len(data_excel) > 0:
            for i in range(0, len(data_excel)):
                IDMachine = str(data_excel.iloc[i, 1])
                MachineType = str(data_excel.iloc[i, 2])
                MachineName = str(data_excel.iloc[i, 3])
                SerialNo = str(data_excel.iloc[i, 4])
                MachineLocation = str(data_excel.iloc[i, 5])
                IndexRow = str(data_excel.iloc[i, 6])
                IndexCol = str(data_excel.iloc[i, 7])
                Active = str(data_excel.iloc[i, 8])
                MachineContract = str(data_excel.iloc[i, 9])
                Qty = str(data_excel.iloc[i, 10])
                EntryDate = str(data_excel.iloc[i, 11])
                StatusMachine = str(data_excel.iloc[i, 12])
                LifeCycle = str(data_excel.iloc[i, 13])
                NBV = str(data_excel.iloc[i, 14])
                Comment = str(data_excel.iloc[i, 15])

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
