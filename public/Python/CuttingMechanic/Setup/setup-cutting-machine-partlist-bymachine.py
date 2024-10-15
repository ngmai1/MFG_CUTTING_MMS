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
        filePath = r'C:\Users\mutran\OneDrive - Hanesbrands Inc\Documents\#2023-TranMung\EngineeringWeb\database\cuttingmechanic\setup_machine_partlist\data_partlist_bymachine.xlsx'
        UserUpdate = 'mutran'
        data_excel = pd.read_excel(filePath, sheet_name='setup')
        data_excel = data_excel.fillna('')
        # print(data_excel)
        UserUpdate = 'mutran'
        if len(data_excel) > 0:
            for i in range(0, len(data_excel)):
                PartID = str(data_excel.iloc[i, 1])
                PartNumber = str(data_excel.iloc[i, 2])
                TypeMachine = str(data_excel.iloc[i, 3])
                PartName = str(data_excel.iloc[i, 4]).replace('"', '').replace("'", "")
                PartVietNam = str(data_excel.iloc[i, 5])
                if PartVietNam=="Dao 4'":
                    PartVietNam='Dao 4'
                PartUnit = str(data_excel.iloc[i, 6])
                SafetyStock = str(data_excel.iloc[i, 7])
                PartLocation = str(data_excel.iloc[i, 8])
                CatagoryPart = str(data_excel.iloc[i, 9])

                sql = ("IF EXISTS( SELECT * FROM PBCTS.dbo.cutting_setup_machine_part WHERE PartNumber='" + str(PartNumber) + "')"
                       + " BEGIN"
                       + " UPDATE PBCTS.dbo.cutting_setup_machine_part SET PartID=N'" + str(PartID) + "',TypeMachine=N'" + str(TypeMachine) + "',PartName=N'" + str(PartName) + "',PartVietNam=N'" + str(PartVietNam) + "',PartUnit=N'" + str(PartUnit) + "',"
                       + " SafetyStock=N'" + str(SafetyStock) + "',PartLocation=N'" + str(PartLocation) + "',CatagoryPart=N'" + str(CatagoryPart) + "',"
                       + " UserUpdate=N'" +str(UserUpdate) + "',TimeUpdate=GETDATE() WHERE PartNumber='" +str(PartNumber) + "'"
                       + " END"
                       + " ELSE"
                       + " BEGIN"
                       + " INSERT INTO PBCTS.dbo.cutting_setup_machine_part(PartID,PartNumber,TypeMachine,PartName,PartVietNam,PartUnit,SafetyStock,PartLocation,CatagoryPart,UserUpdate,TimeUpdate)"
                       + " VALUES(N'" + str(PartID) + "',N'" + str(PartNumber) + "',N'" + str(TypeMachine) + "',N'" + str(PartName) + "',N'" + str(PartVietNam) + "',N'" + str(PartUnit) + "',N'" + str(SafetyStock) + "',N'" + str(PartLocation) + "',N'" + str(CatagoryPart) + "',N'" + str(UserUpdate) + "',GETDATE())"
                       + " END")

                cursor.execute(sql)
                connection.commit()

    except Exception as e:
        print(sql)
        print(e)
