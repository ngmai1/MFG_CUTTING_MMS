$(document).ready(function () {
  var user = $("#username").text();
  if (user.includes("mung.tran@hanes.com")) {
    alert("Bạn chưa đăng nhập hệ thống");
  }
  var currentDate = new Date().toISOString().split("T")[0];
  $("#date_from").val(currentDate);
  $("#date_to").val(currentDate);

  loading_dowwntime_data();
  loading_data_bymachinecode();
  loading_data_typemachine();
  loading_code_broken_machine();

  $("#btn_refresh_downtime_data").click(function () {
    loading_dowwntime_data();
  });

  setInterval(loading_dowwntime_data, 60000);

  // ===============================CHUC NANG ADD MÃ CODE =============================
  $("#btn_add_cuttingcode").on("click", function () {
    var user_upload = $("#username").text();
    if (user_upload.includes("mung.tran@hanes.com")) {
      alert("Bạn chưa đăng nhập hệ thống");
      return;
    } else {
      // alert(user_upload);
      user_upload = user_upload.replace("Xin chào ", "");
      user_upload = user_upload.trim().toLowerCase();
      (async function () {
        try {
          var data_user = await getUserData(user_upload);
          console.log(data_user);
          var dept = data_user[0].Department;
          console.log(dept);
          if (dept == "IECT" || dept == "IE") {
            $("#txt_defect_code").val("");
            $("#txt_defect_content").val("");
            $("#txt_defect_code").focus();
            $("#modal_adding_cuttingmachine_code").modal("show");
          } else {
            alert("Tài khoản này không thể thực hiện nghiệp vụ");
            return;
          }
        } catch (error) {
          // Handle errors
          console.error(error);
          alert("Tài khoản này không thể thực hiện nghiệp vụ");
          return;
        }
      })();
    }
  });

  async function getUserData(user_upload) {
    try {
      // Wrap the AJAX call in a Promise
      const userData = await new Promise((resolve, reject) => {
        $.ajax({
          url: "/cutting-mechanic-user-login",
          method: "POST",
          data: { user_login: user_upload },
          dataType: "json",
          beforeSend: function (request) {
            // console.log(request);
            resolve(request);
          },
          timeout: 5000,
          success: function (response) {
            // console.log(response);
            resolve(response);
          },
          error: function (error) {
            // console.error(error);
            reject("FAIL");
          },
        });
      });

      return userData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  $("#btn_upload_code").on("click", function () {
    var codeID = $("#txt_defect_code").val();
    var code_content = $("#txt_defect_content").val();
    if (code_content == "" || codeID == "") {
      alert("Thiếu thông tin điền vào");
      return;
    }
    codeID = codeID.trim().toUpperCase();

    if (
      confirm("Xác nhận cập nhật thêm mã code máy hỏng lên hệ thống") == true
    ) {
      var data_send = {
        codeID: codeID,
        code_content: code_content,
      };
      $.ajax({
        url: "/cutting-mechanic-adding-code-defect",
        method: "POST",
        data: data_send,
        dataType: "json",
        beforeSend: function (request) {
          console.log(request);
          return true;
        },
        timeout: 5000,
      })
        .done(function (response) {
          console.log(response);
          if (response.result == "done") {
            alert("Đã cập nhật");
            loading_code_broken_machine();
            $("#modal_adding_cuttingmachine_code").modal("hide");
          } else {
            alert("FAIL");
            $("#modal_adding_cuttingmachine_code").modal("hide");
          }
          // console.log(typeof response);
        })
        .fail(function (error) {
          console.error(error);
          alert("FAIL");
          $("#modal_adding_cuttingmachine_code").modal("hide");
        });
    } else {
      $("#modal_adding_cuttingmachine_code").modal("hide");
      return;
    }
  });

  // ===============================END CHUC NANG ADD MÃ CODE =============================

  function loading_dowwntime_data() {
    console.log("Loading data");
    // Get values from input fields
    var fromDate = $("#date_from").val();
    var toDate = $("#date_to").val();

    // Convert to Date objects
    var fromDateObj = new Date(fromDate);
    var toDateObj = new Date(toDate);

    // Add one day to toDate
    toDateObj.setDate(toDateObj.getDate() + 1);

    // Convert back to the desired format (YYYY-MM-DD)
    var formattedFromDate = fromDateObj.toISOString().split("T")[0];
    var formattedToDate = toDateObj.toISOString().split("T")[0];

    var data_send = {
      date_from: formattedFromDate,
      date_to: formattedToDate,
    };
    $.ajax({
      url: "/cutting-mechanic-downtime-report-data",
      method: "POST",
      data: data_send,
      dataType: "json",
      beforeSend: function (request) {
        console.log(request);
        return true;
      },
      timeout: 5000,
    })
      .done(function (response) {
        console.log(response);
        table_data_downtime_cutting(response);
        // console.log(typeof response);
      })
      .fail(function (error) {
        console.error(error);
        alert("FAIL");
      });
  }

  function getEndName(fullname) {
    var EmpName = fullname.split(" ");
    var LastName = EmpName[EmpName.length - 1];
    if (LastName.length > 0) {
      return "-" + LastName;
    } else {
      return LastName;
    }
  }

  function table_data_downtime_cutting(data) {
    var tbody = $("#table_machinedowntime tbody");
    tbody.empty();
    var i = 0;
    for (var i = 0; i < data.length; i++) {
      // console.log(data[i].SQ)
      var row = $("<tr>"); // Create a new table row
      // Create a new table data cell for each property of the data object
      var STT = $("<td>").text(i + 1);
      var TIMEDATE = $("<td>").text(data[i].TIMEDATE);
      var MachineID = $("<td>").text(data[i].MachineID);
      var MachineName = $("<td>").text(data[i].MachineName);
      var state = data[i].MachineStatus;
      if (state == "0") {
        var stateCell = $("<td>").text("Đã sửa");
        stateCell.css("color", "green");
      } else if (state == "1") {
        var stateCell = $("<td>").text("Bấm giờ");
        stateCell.css("color", "red");
      } else if (state == "2") {
        var stateCell = $("<td>").text("Đang sửa");
        stateCell.css("color", "orange");
      } else if (state == "3") {
        var stateCell = $("<td>").text("Chờ xác nhận");
        stateCell.css("color", "purple");
      } else {
        var stateCell = $("<td>").text("PM");
        stateCell.css("color", "blue");
      }
      if (
        data[i].CloseMachineCode == "" ||
        data[i].CloseMachineCode == undefined
      ) {
        var OpenMachineCode = $("<td>").text(data[i].OpenMachineCode);
      } else {
        var OpenMachineCode = $("<td>").text(data[i].CloseMachineCode);
      }
      var DownTimeInMinutes = $("<td>").text(data[i].DownTimeInMinutes);
      DownTimeInMinutes.css("color", "purple");
      try {
        var StartTime = $("<td>").text(
          data[i].StartTime.replace("T", " ").replace("Z", "").substring(0, 19)
        );
      } catch {
        var StartTime = $("<td>").text(data[i].StartTime);
      }
      var IDEmployee = $("<td>").text(
        data[i].IDEmployee + getEndName(data[i].NameEmployee)
      );
      try {
        var FixTime = $("<td>").text(
          data[i].FixTime.replace("T", " ").replace("Z", "").substring(0, 19)
        );
      } catch {
        var FixTime = $("<td>").text(data[i].FixTime);
      }
      var IDMechanicTask = $("<td>").text(
        data[i].IDMechanic + getEndName(data[i].MechanicName)
      );
      try {
        var FinishTime = $("<td>").text(
          data[i].FinishTime.replace("T", " ").replace("Z", "").substring(0, 19)
        );
      } catch {
        var FinishTime = $("<td>").text(data[i].FinishTime);
      }
      var MechanicClose = $("<td>").text(data[i].IDComplete);

      try {
        var ProductionFirmTime = $("<td>").text(
          data[i].ProductionFirmTime.replace("T", " ")
            .replace("Z", "")
            .substring(0, 19)
        );
      } catch {
        var ProductionFirmTime = $("<td>").text(data[i].ProductionFirmTime);
      }
      var EmployeeFirm = $("<td>").text(data[i].IDProductionFirm);
      var NoteMechanicClose = $("<td>").text(data[i].NoteMechanicClose);
      // Append the cells to the row
      row.append(STT);
      row.append(TIMEDATE);
      row.append(MachineID);
      row.append(MachineName);
      row.append(stateCell);
      row.append(OpenMachineCode);
      row.append(DownTimeInMinutes);
      row.append(StartTime);
      row.append(IDEmployee);
      row.append(FixTime);
      row.append(IDMechanicTask);
      row.append(FinishTime);
      row.append(MechanicClose);
      row.append(ProductionFirmTime);
      row.append(EmployeeFirm);
      row.append(NoteMechanicClose);
      tbody.append(row);
    }
    tbody.find("td").css("text-align", "center");
  }

  function loading_data_typemachine() {
    $.ajax({
      url: "/cutting-mechanic-downtime-report-by-typemachine",
      method: "POST",
      data: "",
      dataType: "json",
      beforeSend: function (request) {
        console.log(request);
        return true;
      },
      timeout: 5000,
    })
      .done(function (data) {
        console.log(data);
        var MachineType = [];
        var TotalIssuse = [];
        for (i = 0; i < data.length; i++) {
          MachineType.push(data[i].MachineType);
          TotalIssuse.push(data[i].TotalIssuse);
        }
        createChart_bymachinetype(MachineType, TotalIssuse);
      })
      .fail(function (error) {
        console.error(error);
        // alert('FAIL');
      });
  }

  function loading_code_broken_machine() {
    // loading_code_broken_machine
    $.ajax({
      url: "/cutting-mechanic-broken-setup",
      method: "POST",
      data: "",
      dataType: "json",
      beforeSend: function (request) {
        console.log(request);
        return true;
      },
      timeout: 5000,
    })
      .done(function (data) {
        console.log(data);
        var tbody = $("#table_errocodemachine tbody");
        tbody.empty();
        var i = 0;
        for (let i = 0; i < data.length; i++) {
          const row = $("<tr>"); // Create a new table row
          // Create a new table data cell for each property of the data object
          const stt = $("<td>").text(i + 1);
          const MachineCode = $("<td>").text(data[i].MachineCode);
          const CodeInfor = $("<td>").text(data[i].CodeInfor);
          const CodeActive = $("<td>").text(data[i].CodeActive);
          const UserUpdate = $("<td>").text(data[i].UserUpdate);
          try {
            var TimeUpdate = $("<td>").text(
              data[i].TimeUpdate.replace("T", " ")
                .replace("Z", "")
                .substring(0, 19)
            );
          } catch {
            var TimeUpdate = $("<td>").text(data[i].TimeUpdate);
          }
          // Append the cells to the row
          row.append(stt);
          row.append(MachineCode);
          row.append(CodeInfor);
          row.append(CodeActive);
          row.append(UserUpdate);
          row.append(TimeUpdate);
          tbody.append(row);
        }
        tbody.find("td").css("text-align", "center");
      })
      .fail(function (error) {
        console.error(error);
        // alert('FAIL');
      });
  }
  function loading_data_bymachinecode() {
    $.ajax({
      url: "/cutting-mechanic-downtime-report-by-codemachinedowntime",
      method: "POST",
      data: "",
      dataType: "json",
      beforeSend: function (request) {
        console.log(request);
        return true;
      },
      timeout: 5000,
    })
      .done(function (data) {
        console.log(data);
        var CodeMachine = [];
        var DataIssue = [];
        for (i = 0; i < data.length; i++) {
          CodeMachine.push(data[i].MachineCode);
          DataIssue.push(data[i].Issuse);
        }
        createChart_bycodemachine(CodeMachine, DataIssue);
      })
      .fail(function (error) {
        console.error(error);
        // alert('FAIL');
      });
  }

  function createChart_bycodemachine(CodeMachine, DataIssue) {
    var barChart = document
      .getElementById("barChartbycodedowntime")
      .getContext("2d");
    var myBarChart = new Chart(barChart, {
      type: "bar",
      data: {
        labels: CodeMachine,
        datasets: [
          {
            label: "Mã lỗi",
            backgroundColor: randomColors,
            borderColor: randomColors,
            data: DataIssue,
            yAxisID: "y-axis-1", // Assign the dataset to the primary y-axis
          },
          {
            type: "line", // Line dataset
            label: "Tổng lỗi",
            borderColor: "red", // Line color
            borderWidth: 2,
            fill: false, // Do not fill the area under the line
            data: DataIssue,
            yAxisID: "y-axis-2", // Assign the dataset to the secondary y-axis
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 100, // Set the maximum number of ticks to display
              },
            },
          ],
          yAxes: [
            {
              id: "y-axis-1",
              position: "left",
              ticks: {
                beginAtZero: true,
              },
            },
            {
              id: "y-axis-2",
              position: "right",
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }
  function createChart_bymachinetype(MachineType, TotalIssuse) {
    var barChart = document
      .getElementById("barChartbytypeofmachine")
      .getContext("2d");
    var myBarChart = new Chart(barChart, {
      type: "bar",
      data: {
        labels: MachineType,
        datasets: [
          {
            label: "Loại máy",
            backgroundColor: randomColors,
            borderColor: randomColors,
            data: TotalIssuse,
            yAxisID: "y-axis-1", // Assign the dataset to the primary y-axis
          },
          {
            type: "line", // Line dataset
            label: "Tổng lỗi",
            borderColor: "red", // Line color
            borderWidth: 2,
            fill: false, // Do not fill the area under the line
            data: TotalIssuse,
            yAxisID: "y-axis-2", // Assign the dataset to the secondary y-axis
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 100, // Set the maximum number of ticks to display
              },
            },
          ],
          yAxes: [
            {
              id: "y-axis-1",
              position: "left",
              ticks: {
                beginAtZero: true,
              },
            },
            {
              id: "y-axis-2",
              position: "right",
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }
  // Function to generate a random RGB color
  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  // Generate an array of random colors
  var randomColors = Array.from({ length: 12 }, getRandomColor);
});