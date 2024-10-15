

$(document).ready(function () {
    var loader = $('#txt_loader');
    loader.hide();
    var user = $('#username').text();
    if (user.includes('mung.tran@hanes.com')) {
        alert('Bạn chưa đăng nhập hệ thống')
    };

    get_realtime_downtime();
    machine_inventory_information();
    // ===========================================

    $("#btn_full_inventory").click(function () {
        get_cutting_machine();
    });
    $("#btn_adjust_machine").click(function () {
        get_cutting_machine();
    });

    $('#btn_upload').on('click', function () {
        $('#file').click();
    });

    $('#file').on('change', function () {
        if ($('#file').val() !== '') {
            $('#submit').click();
        }
    });

    $('#upload_form').on('submit', function (e) {
        if ($('#file').val() !== '') {
            e.preventDefault();
            loader.show();
            var xsend = new XMLHttpRequest();
            xsend.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    //done
                    result = xsend.responseText;
                    if (result == 'done') {
                        loader.hide();
                        alert('File đã được cập nhật!');
                        location.reload();
                    } else {
                        loader.hide();
                        alert('Đã có lỗi, hãy kiểm tra lại file!' + '\n' + result);
                    }
                }
            };

            var fileInput = $('#file')[0];
            var file = fileInput.files[0];
            var formData = new FormData();
            formData.append('file', file);
            console.log(file);

            if (file != null) {
                xsend.open('POST', '/cutting-machine-update-machine', true);
                xsend.send(formData);
            }
        }
        return false;
    });


    $("#btn_submit").click(function () {
        var IndexRow = $('#txt_new_row').val();
        var IndexCol = $('#txt_new_col').val();
        var IDMachine = $('#txt_machine_name').text().trim();

        if (IndexCol == '' || IndexRow == '') {
            alert('Chưa bố trí tọa độ layout cho máy');
            return;
        }

        var data = {
            IDMachine: IDMachine,
            IndexRow: parseInt(IndexRow),
            IndexCol: parseInt(IndexCol),
        }
        console.log(data);
        $.ajax({
            url: '/cutting-mechanic-layout-move',
            method: 'POST',
            data: data,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            timeout: 5000,
        })
            .done(function (response) {
                console.log(response);
                var result = response.result;
                console.log(result);
                if (result == 'done') {
                    $("#modal_setup_layout").modal('hide');
                    get_realtime_downtime();
                }
                if (result == 'erro') {
                    alert('Xãy ra lỗi');
                    $("#modal_setup_layout").modal('hide');
                    return;
                }
                if (result == 'empty') {
                    alert('Trùng vị trí');
                    $("#modal_setup_layout").modal('hide');
                    return;
                }

            })
            .fail(function (error) {
                console.error(error);
                alert('FAIL');
            })

    });

    function machine_inventory_information() {
        $.ajax({
            url: '/cutting-mechanic-machine-inventory',
            method: 'POST',
            data: '',
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            timeout: 5000,
        })
            .done(function (data) {
                try {
                    var data_floor = $.grep(data, function (item) {
                        // Modify the condition as needed
                        return item['MachineLocation'] == 'Floor';
                    });
                    var data_stock = $.grep(data, function (item) {
                        // Modify the condition as needed
                        return item['MachineLocation'] == 'Stock';
                    });
                    var data_other = $.grep(data, function (item) {
                        // Modify the condition as needed
                        return item['MachineLocation'] != 'Stock' && item['MachineLocation'] != 'Floor'
                    });
                    sessionStorage.clear();
                    for (var i = 0; i < data.length; i++) {

                        sessionStorage.setItem(data[i].IDMachine, JSON.stringify(data[i]));
                        // console.log(sessionStorage.getItem(data[i].IDMachine));     
                    }
                    // console.log(data_floor);
                    // console.log(data_stock);
                    // console.log(data_other);
                    table_machine_inventory_each_position(data = data_floor, typelocation = '1')
                    table_machine_inventory_each_position(data = data_stock, typelocation = '2')
                    table_machine_inventory_each_position(data = data_other, typelocation = '3')

                }
                catch (e) {
                    console.log(e);
                }
            })
            .fail(function (error) {
                console.error(error);
                alert('FAIL');
            })
    };

    function table_machine_inventory_each_position(data, typelocation) {
        if (typelocation == '1') {
            var tbody = $("#table_machine_floor tbody");
            $('#total_machine_floor').text(data.length);
        }
        if (typelocation == '2') {
            var tbody = $("#table_machine_stock tbody");
            $('#total_machine_stock').text(data.length);
        }
        if (typelocation == '3') {
            var tbody = $("#table_machine_other tbody");
            $('#total_machine_other').text(data.length);
        }
        tbody.empty();
        var i = 0;
        for (let i = 0; i < data.length; i++) {
            const row = $("<tr>"); // Create a new table row
            // Create a new table data cell for each property of the data object
            const stt = $("<td>").text(i + 1);
            const IDMachine = $("<td>").text(data[i].IDMachine);
            const MachineType = $("<td>").text(data[i].MachineType);
            const MachineName = $("<td>").text(data[i].MachineName);
            const SerialNo = $("<td>").text(data[i].SerialNo);
            const MachineLocation = $("<td>").text(data[i].MachineLocation);
            var button_detail = '<td> <div class="form-button-action"> <button class="btn btn-detail-machine btn-icon btn-round btn-secondary"><i class="fa fa-bookmark"></i></button> </td>';
            // Append the cells to the row
            row.append(stt);
            row.append(IDMachine);
            row.append(MachineType);
            row.append(MachineName);
            row.append(SerialNo);

            row.append(button_detail)
            tbody.append(row);
        }
        tbody.find("td").css("text-align", "center");

    };
    function pop_up_machine_information(IDMachine, MachineInformation) {
        $("#txt_machine_information").text('Thông tin liên quan đến máy |' + IDMachine);
        var data = JSON.parse(MachineInformation);
        MachineType = data.MachineType;
        MachineName = data.MachineName;
        SerialNo = data.SerialNo;

        StatusMachine = data.StatusMachine; //select
        MachineLocation = data.MachineLocation;//select
        IndexRow = data.IndexRow;
        IndexCol = data.IndexCol;
        Active = data.Active;//select
        MachineContract = data.MachineContract;//select
        EntryDate = data.EntryDate;
        LifeCycle = data.LifeCycle;
        CommentNote = data.Comment;

        $("#pop_MachineType").val(MachineType);
        $("#pop_MachineName").val(MachineName);
        $("#pop_SerialNo").val(SerialNo);

        $("#pop_IndexRow").val(IndexRow);
        $("#pop_IndexCol").val(IndexCol);

        $("#pop_EntryDate").val(EntryDate);
        $("#pop_LifeCycle").val(LifeCycle);
        $("#pop_Comment").val(CommentNote);
        // Selection 
        $("#pop_StatusMachine").val(StatusMachine);
        console.log(StatusMachine);
        $("#pop_MachineLocation").val(MachineLocation);
        $("#pop_Active").val(Active);
        $("#pop_MachineContract").val(MachineContract);

        $("#modal_machine_information").modal('show');
    }

    $('#table_machine_floor tbody').on('click', '.btn-detail-machine', function () {
        var IDMachine = $(this).closest('tr').find('td:eq(1)').text();
        MachineInformation = sessionStorage.getItem(IDMachine);
        // x.parentNode.childNodes[2].innerHTML=JSON.parse(po_infor).Project;
        pop_up_machine_information(IDMachine, MachineInformation);

    });
    $('#table_machine_stock tbody').on('click', '.btn-detail-machine', function () {
        var IDMachine = $(this).closest('tr').find('td:eq(1)').text();
        MachineInformation = sessionStorage.getItem(IDMachine);
        pop_up_machine_information(IDMachine, MachineInformation);
    });

    $('#table_machine_other tbody').on('click', '.btn-detail-machine', function () {
        var IDMachine = $(this).closest('tr').find('td:eq(1)').text();
        MachineInformation = sessionStorage.getItem(IDMachine);
        pop_up_machine_information(IDMachine, MachineInformation);
    });

    $('#table_machine tbody').on('click', '.btn-detail-machine', function () {
        var IDMachine = $(this).closest('tr').find('td:eq(1)').text();
        MachineInformation = sessionStorage.getItem(IDMachine);
        $("#modal_machine_list").modal("hide");
        pop_up_machine_information(IDMachine, MachineInformation);
    });

    $("#btn_update_machineinformation").click(function () {
        var IDMachine = $('#txt_machine_information').text().split('|')[1].trim();
        var MachineType = $('#pop_MachineType').val();
        var MachineName = $('#pop_MachineName').val();
        var SerialNo = $('#pop_SerialNo').val();
        var StatusMachine = $('#pop_StatusMachine').val();
        var MachineLocation = $('#pop_MachineLocation').val();
        var IndexRow = $('#pop_IndexRow').val();
        var IndexCol = $('#pop_IndexCol').val();
        var Active = $('#pop_Active').val();
        var MachineContract = $('#pop_MachineContract').val();
        var EntryDate = $('#pop_EntryDate').val();
        var LifeCycle = $('#pop_LifeCycle').val();
        var Comment = $('#pop_Comment').val();
        if (IndexRow == '') IndexRow = '0';
        if (IndexCol == '') IndexCol = '0';
        var data = {
            IDMachine: IDMachine,
            MachineType: MachineType,
            MachineName: MachineName,
            SerialNo: SerialNo,
            StatusMachine: StatusMachine,//select
            MachineLocation: MachineLocation,
            IndexRow: IndexRow,
            IndexCol: IndexCol,
            Active: Active,//select
            MachineContract: MachineContract,//select
            EntryDate: EntryDate,
            LifeCycle: LifeCycle,
            Comment: Comment,
        }
        console.log(data);
        $.ajax({
            url: '/cutting-mechanic-update-machineinformation',
            method: 'POST',
            data: data,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            timeout: 5000,
        })
            .done(function (response) {
                console.log(response);
                var result = response.result;
                console.log(result);
                if (result == 'done') {
                    alert("Thành công");
                    $("#modal_machine_information").modal('hide');
                    location.reload();
                }
                if (result == 'erro') {
                    alert('Xãy ra lỗi');
                    $("#modal_machine_information").modal('hide');
                    return;
                }
                if (result == 'empty') {
                    alert('Trùng vị trí');
                    $("#modal_machine_information").modal('hide');
                    return;
                }

            })
            .fail(function (error) {
                console.error(error);
                alert('FAIL');
            })

    });

    function get_realtime_downtime() {
        $.ajax({
            url: '/cutting-mechanic-downtime-realtime',
            method: 'POST',
            data: '',
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            timeout: 5000,
        })
            .done(function (response) {
                console.log(response);
                try {
                    cutting_generate_layout('26', '9', response);
                }
                catch {

                    var result = response.result;
                    console.log(result);
                    if (result == 'empty') {
                        alert('Không có dữ liệu');
                        return;
                    }
                    if (result == 'erro') {
                        alert('Xãy ra lỗi');
                        return;
                    }
                }

            })
            .fail(function (error) {
                console.error(error);
                alert('FAIL');
            })
    };

    function get_empty_location(columnCount, rowCount, data) {
        var machines = data;
        var emptyCoordinates = [];
        for (let row = 1; row <= rowCount; row++) {
            for (let col = 1; col <= columnCount; col++) {
                emptyCoordinates.push({ row, col });
            }
        }
        for (let row = 1; row <= rowCount; row++) {
            for (let col = 1; col <= columnCount; col++) {
                var machine = machines.find(m => m.col === col && m.row === row);
                if (machine) {
                    // Phần tử máy đã được sử dụng, loại bỏ tọa độ tương ứng khỏi mảng emptyCoordinates
                    emptyCoordinates = emptyCoordinates.filter(coord => !(coord.row === row && coord.col === col));
                    // ...
                } else {
                    // ...
                }
            }
        }
        return emptyCoordinates;
    }

    function generate_column_row_coordinates(maxrows, maxcols) {
      $("#txt_new_row").empty();
      $("#txt_new_col").empty();

      $("#txt_new_row").prepend($("<option>").val("").text(""));
      $("#txt_new_col").prepend($("<option>").val("").text(""));

      for (let i = 1; i <= parseInt(maxrows); i++) {
        var option = $("<option>").val(i).text(i);
        $("#txt_new_row").append(option);
      }

      for (let i = 1; i <= parseInt(maxcols); i++) {
        var option = $("<option>").val(i).text(i);
        $("#txt_new_col").append(option);
      }
    }

    // Hàm hiển thị popover
    function showPopover(element, MachineName) {
      const content = `Tên máy: ${MachineName}`;

      $(element).popover({
        title: "Thông tin máy",
        content: content,
        placement: "auto", // Adjust the placement as needed
        trigger: "manual", // Manual trigger to control when the popover appears
      });

      $(element).popover("show");
    }

    // Hàm ẩn popover
    function hidePopover(element) {
      $(element).popover("hide");
    }

    function cutting_generate_layout(cols, rows, data) {
        // Số lượng cột và hàng
        const columnCount = parseInt(cols);
        const rowCount = parseInt(rows);
        const machines = data;
        // Container chứa các phần tử
        const container = document.getElementById('machineContainer');
        $('#machineContainer').empty();
        // Tạo các phần tử máy và đặt vị trí và màu nền cho chúng
        for (let row = 1; row <= rowCount; row++) {
            for (let col = 1; col <= columnCount; col++) {
                const machine = machines.find(m => m.col === col && m.row === row);
                if (machine) {
                    const { IDMachine, state,MachineName } = machine;

                    const cellElement = document.createElement('div');
                    cellElement.classList.add('machine');
                    cellElement.setAttribute('state', state);
                    cellElement.style.gridColumn = `span 1`;
                    cellElement.style.gridRow = `span 1`;
                    cellElement.innerText = IDMachine;
                    // Thêm sự kiện mouseover vào cellElement
                    cellElement.addEventListener("mouseover", function () {
                      // Hiển thị popover khi di chuột vào ô
                      showPopover(this, MachineName);
                    });

                    // Thêm sự kiện mouseout để ẩn popover khi di chuột ra khỏi ô
                    cellElement.addEventListener("mouseout", function () {
                      hidePopover(this);
                    });
                    if (state === 4) {
                      cellElement.style.color = "white";
                      cellElement.style.backgroundColor = "blue";
                    }
                    // Thay đổi màu chữ dựa trên trạng thái (state)
                    if (state === 2) {
                        cellElement.style.color = 'black';
                    } else {
                        cellElement.style.color = 'white';
                    }

                    cellElement.addEventListener('click', function () {
                        console.log('Clicked machine:', IDMachine);
                        console.log('Row:', row);
                        console.log('Column:', col);
                        console.log('State:', state);
                        // var emptyCoordinates = get_empty_location(columnCount, rowCount, data);
                        // console.log('EmptyCoordinates:', emptyCoordinates);
                        $("#txt_cur_col").val(col);
                        $("#txt_cur_row").val(row);
                        $("#txt_machine_name").text(IDMachine);
                        generate_column_row_coordinates(rowCount, columnCount)
                        $("#modal_setup_layout").modal('show');
                    });
                    container.appendChild(cellElement);
                } else {
                    const emptyCell = document.createElement('div');
                    emptyCell.classList.add('empty-cell');
                    emptyCell.style.gridColumn = `span 1`;
                    emptyCell.style.gridRow = `span 1`;

                    container.appendChild(emptyCell);
                }
            }
        }
        // Hiển thị số thứ tự cột
        const columnNumberContainer = document.createElement('div');
        columnNumberContainer.classList.add('column-number');
        for (let col = 1; col <= columnCount; col++) {
            const columnNumber = document.createElement('div');
            columnNumber.innerText = col;
            columnNumberContainer.appendChild(columnNumber);
        }
        container.appendChild(columnNumberContainer);
        // Hiển thị số thứ tự hàng
        const rowNumberContainer = document.createElement('div');
        rowNumberContainer.classList.add('row-number');
        for (let row = 1; row <= rowCount; row++) {
            const rowNumber = document.createElement('div');
            rowNumber.innerText = row;
            rowNumberContainer.appendChild(rowNumber);
        }
        container.appendChild(rowNumberContainer);
    };

    function get_cutting_machine() {
        $.ajax({
            url: '/cutting-mechanic-machine-list',
            method: 'POST',
            data: '',
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            timeout: 5000,
        })
            .done(function (response) {
                console.log(response);
                generate_machine_table(response);
                $("#modal_machine_list").modal("show");
            })
            .fail(function (error) {
                console.error(error);
                alert('FAIL');
            })
    };

    function generate_machine_table(data) {
        const tbody = $("#table_machine tbody");
        tbody.empty();
        var i = 0;
        for (let i = 0; i < data.length; i++) {
            const row = $("<tr>"); // Create a new table row
            // Create a new table data cell for each property of the data object
            const stt = $("<td>").text(i + 1);
            const IDMachine = $("<td>").text(data[i].IDMachine);
            const MachineType = $("<td>").text(data[i].MachineType);
            const MachineName = $("<td>").text(data[i].MachineName);
            const SerialNo = $("<td>").text(data[i].SerialNo);
            const MachineLocation = $("<td>").text(data[i].MachineLocation);
            const IndexRow = $("<td>").text(data[i].IndexRow);
            const IndexCol = $("<td>").text(data[i].IndexCol);
            const StatusMachine = $("<td>").text(data[i].StatusMachine);
            const MachineContract = $("<td>").text(data[i].MachineContract);
            const Comment = $("<td>").text(data[i].Comment);
            const UserUpdate = $("<td>").text(data[i].UserUpdate);
            // const TimeUpdate = $("<td>").text(data[i].TimeUpdate);
            try {
                var TimeUpdate = $("<td>").text(data[i].TimeUpdate.replace("T", " ").replace("Z", "").substring(0, 19));
            }
            catch {
                var TimeUpdate = $("<td>").text(data[i].TimeUpdate);
            }

            // Append the cells to the row
            row.append(stt);
            row.append(IDMachine);
            row.append(MachineType);
            row.append(MachineName);
            row.append(SerialNo);
            row.append(MachineLocation);

            row.append(IndexRow);
            row.append(IndexCol);

            row.append(StatusMachine);
            row.append(MachineContract);
            row.append(Comment);
            row.append(UserUpdate);
            row.append(TimeUpdate);
            // CCS
            if (data[i].MachineLocation=='Floor') MachineLocation.css("color", "green");
            if (data[i].MachineLocation=='Stock') MachineLocation.css("color", "orange");
            if (data[i].MachineLocation=='Other') MachineLocation.css("color", "purple");
            // CCS-Status
            if (data[i].StatusMachine=='Good') StatusMachine.css({
                'background-color': 'green',
                'color': 'white',
            });
            if (data[i].StatusMachine=='Follow Up') StatusMachine.css({
                'background-color': 'orange',
                'color': 'white'
            });
            if (data[i].StatusMachine=='Fail') StatusMachine.css({
                'background-color': 'red',
                'color': 'white'
            });
            // CCS Bảo hành
            if (data[i].MachineContract=='Y') MachineContract.css("color", "green");
            else MachineContract.css("color", "red");
            // check conditions
            IDMachine.css("color", "blue");
            IndexRow.css("color", "green");
            IndexCol.css("color", "red");
            // button
            var Active = $("<td>").text(data[i].Active);
            var statusCell = $('<td class="text-center">');
            var select = $('<select class="form-control">');
            select.append('<option value="Y" ' + (Active.text() === 'Y' ? 'selected' : '') + ' style="padding: 0px;color:green;">Hiển thị</option>');
            select.append('<option value="N" ' + (Active.text() === 'N' ? 'selected' : '') + ' style="padding: 0px;color:red;">Ẩn</option>');
            select.on('change', function () {
                var statusMachine = $(this).val();
                var rowData = $(this).closest('tr').find('td').map(function () {
                    return $(this).text();
                }).get();
                // Perform actions with the selected value and rowData
                console.log('Selected value: ' + statusMachine);
                console.log('Row data: ' + rowData[0]);
                var MachineID = rowData[1];
                var MachineType = rowData[2];
                var MachineName = rowData[3];
                var SerialNo = rowData[4];
                var MachineLocation = rowData[5];
                var IndexRow = rowData[6];
                var IndexCol = rowData[7];
                update_status_machine_cutting(MachineID, MachineType, MachineName, SerialNo, MachineLocation, IndexRow, IndexCol, statusMachine);

            });
            statusCell.append(select);
            var button_detail = '<td> <div class="form-button-action"> <button class="btn btn-detail-machine btn-icon btn-round btn-secondary"><i class="fa fa-bookmark"></i></button> </td>';
            row.append(statusCell);
            row.append(button_detail);

            tbody.append(row);
        }
        tbody.find("td").css("text-align", "center");
    };

    function update_status_machine_cutting(MachineID, MachineType, MachineName, SerialNo, MachineLocation, IndexRow, IndexCol, statusMachine) {
        var data = {
            MachineID: MachineID,
            MachineType: MachineType,
            MachineName: MachineName,
            SerialNo: SerialNo,
            MachineLocation: MachineLocation,
            IndexRow: IndexRow,
            IndexCol: IndexCol,
            statusMachine: statusMachine,
        }
        console.log(data);
        $.ajax({
            url: '/cutting-mechanic-machine_active',
            method: 'POST',
            data: data,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            timeout: 5000,
        })
            .done(function (response) {
                console.log(response);
                var result = response.result;
                console.log(result);
                if (result == 'done') {
                    $("#modal_machine_list").modal('hide');
                    alert_done();
                    get_realtime_downtime();
                }
                if (result == 'erro') {
                    alert('Xãy ra lỗi');
                    $("#modal_machine_list").modal('hide');
                    return;
                }
                if (result == 'empty') {
                    alert('Trùng vị trí');
                    $("#modal_machine_list").modal('hide');
                    return;
                }

            })
            .fail(function (error) {
                console.error(error);
                alert('FAIL');
            })
    };

    function alert_done() {
        swal("Đã cập nhật trạng thái!", "Leading the challenge !", {
            icon: "success",
            buttons: {
                confirm: {
                    className: 'btn btn-success'
                }
            },
        });
    }

});