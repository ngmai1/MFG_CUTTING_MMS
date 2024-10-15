$(document).ready(function () {

    var user = $('#username').text();
    if (user.includes('mung.tran@hanes.com')) {
        alert('Bạn chưa đăng nhập hệ thống')
    };

    $('.btn-toggle-mode').click(function () {
        $(this).find('.btn').toggleClass('active');
        if ($(this).find('.btn-primary').length > 0) {
            $(this).find('.btn').toggleClass('btn-primary');
        }
        // $(this).find('.btn').toggleClass('btn-default');  
        get_realtime_downtime();
        var currentStatusMode = getBtnOnModeStatus();
        console.log('StatusMode: ' + currentStatusMode);
    });

    function getBtnOnModeStatus() {
        var btnOnMode = $('#btn-on-mode');
        return btnOnMode.hasClass('active') ? '1' : '0';
    }


    get_realtime_downtime();
    get_machine_broken_code();

    setInterval(get_realtime_downtime, 600000);

    $("#btn_reload_downtime").click(function () {
        get_realtime_downtime();
    });


    $("#btn_clear").click(function () {
        $('#txt_idnv').val('');
        $('#txt_idnv').focus();
    });

    $("#btn_clear_idmechanic").click(function () {
        $('#txt_idmechanic').val('');
        $('#txt_idmechanic').focus();
    });

    $("#btn_clear_machanic_close").click(function () {
        $('#txt_machanic_close').val('');
        $('#txt_machanic_close').focus();
    });

    $("#btn_request_part").click(function () {
        alert("Chức năng này chưa được thêm vào\nSẽ được nâng cấp sau!!!");
        // console.log('Yêu cầu sparepart');
        // var MachineID = $('#txt_machine_close').text().split('|')[0].trim();
        // var broken_machine_code = $('#txt_broken').text().split(':')[1];
        // // alert(broken_machine_code);
        // $('#txt_macine_part_request').text(MachineID);
        // $('#txt_macine_part_broken').text(broken_machine_code);
        // var data_send = {
        //     MachineID: MachineID,
        //     broken_machine_code: broken_machine_code,
        // };
        // $.ajax({
        //     url: '/cutting-mechanic-machine-partlist',
        //     method: 'POST',
        //     data: data_send,
        //     dataType: 'json',
        //     beforeSend: function (request) {
        //         console.log(request);
        //         return true;
        //     },
        //     // timeout: 50000,
        // })
        //     .done(function (response) {
        //         console.log(response);
        //         table_partlist_detail(response)
        //         $('#modal_machine_part_request').modal('show');

        //     })
        //     .fail(function (error) {
        //         alert('FAIL');
        //     })
    });

    $("#btn_send_request").click(function () {
        alert('Yêu cầu sparepart');
    });

    const tbody = $("#table_partlist tbody");
    const searchInput = $("#searchInput");

    // Gán sự kiện input cho trường tìm kiếm
    searchInput.on("input", function () {
        const searchText = $(this).val().trim().toLowerCase();

        // Lọc và hiển thị các hàng phù hợp
        tbody.find("tr").each(function () {
            const row = $(this);
            const rowData = row.text().toLowerCase();

            if (rowData.includes(searchText)) {
                row.show();
            } else {
                row.hide();
            }
        });
    });

    // btn_send_request


    function table_partlist_detail(data) {
        if (data.length > 0) {
            const tbody = $("#table_partlist tbody");
            tbody.empty();
            var i = 0;
            for (let i = 0; i < data.length; i++) {
                // console.log(data[i].SQ)
                const row = $("<tr>"); // Create a new table row
                // Create a new table data cell for each property of the data object
                const TypeMachine = $("<td>").text(data[i].Model);
                const PartNumber = $("<td>").text(data[i].PartID);
                const PartName = $("<td>").text(data[i].PartName);

                const PartVietNam = $("<td>").text(data[i].PartVietNam);
                const SafetyStock = $("<td>").text(data[i].SafetyStock);
                // Append the cells to the row
                row.append(TypeMachine);
                row.append(PartNumber);
                row.append(PartName);
                row.append(PartVietNam);
                row.append(SafetyStock);
                // var button_request = '<td><div class="form-button-action"><button type="button" data-toggle="tooltip" title=""class="btn btn-link btn-primary btn-lg"data-original-title="Edit Task"><i class="fa fa-edit"></i></button></div></td>';
                // row.append(button_request);
                const checkboxCell = $("<td>"); // Create a new table data cell for checkbox
                const checkboxDiv = $('<div class="custom-control custom-checkbox"></div>');
                const checkboxInput = $('<input type="checkbox" class="custom-control-input" id="customCheck' + i + '">');
                const checkboxLabel = $('<label class="custom-control-label" for="customCheck' + i + '"></label>');
                checkboxDiv.append(checkboxInput);
                checkboxDiv.append(checkboxLabel);
                checkboxCell.append(checkboxDiv);
                row.append(checkboxCell);

                tbody.append(row);
                checkboxInput.on("click", function () {
                    const rowData = $(this).closest("tr").find("td").map(function () {
                        return $(this).text();
                    }).get();
                    const keyword = rowData[1];
                    if ($(this).prop("checked")) {
                        // Checkbox đã được chọn
                        // Xử lý dữ liệu
                        console.log("Dữ liệu hàng được chọn:", rowData);
                        const partlist_request = $("#table_partlist_request tbody");
                        const newRow = $("<tr>");
                        newRow.append($("<td>").text(rowData[1]));
                        newRow.append($("<td>").text(rowData[2]));
                        newRow.append($("<td>").text(rowData[3]));
                        newRow.append($("<td>").text(rowData[4]));
                        // newRow.append($("<td>").text(rowData[4]));
                        newRow.append($("<td>").append($("<input>").addClass("form-control").attr("type", "text").css("max-width", "80px").val("1")));
                        newRow.append($("<td>").append($("<button>").addClass("btn btn-danger btn-sm delete-btn").text("Xóa")));
                        partlist_request.append(newRow);

                    } else {
                        const partlist_request = $("#table_partlist_request tbody");
                        // partlist_request.find("tr:contains(" + keyword + ")").remove();
                        // Checkbox đã bị bỏ chọn
                        // Remove row from the other table based on the keyword in a specific column
                        const columnIndex = 0; // Adjust this value to the desired column index in the other table
                        partlist_request.find("tr td:nth-child(" + (columnIndex + 1) + "):contains(" + keyword + ")").closest("tr").remove();
                        // Xử lý tương ứng (nếu cần)
                    }
                });
                // remove row
                const partlist_request = $("#table_partlist_request tbody");
                partlist_request.on("click", ".delete-btn", function () {
                    // const keyword = row.find("td:eq(1)").text();
                    // console.log('xóa');
                    // console.log(keyword);
                    // $(this).closest("tr").remove();
                    // // Uncheck the radio button based on the keyword
                    // const checkboxId = "customCheck" + data.findIndex(item => item.PartID === keyword);
                    // $("#" + checkboxId).prop("checked", false);
                    const row = $(this).closest("tr");
                    const keyword = row.find("td:eq(0)").text(); // Get the keyword from the first column
                    row.remove();
                    // Uncheck the radio button based on the keyword
                    const checkboxId = "customCheck" + data.findIndex(item => item.PartID === keyword);
                    $("#" + checkboxId).prop("checked", false);
                    // Use the keyword for further processing or logging
                    console.log("Keyword:", keyword);
                });
                // change input
                partlist_request.on("keyup", "input", function () {
                    const row = $(this).closest("tr");
                    const rowData = [];

                    // Get values from each cell in the row
                    row.find("td").each(function () {
                        rowData.push($(this).text());
                    });

                    // Get the updated value in the input field
                    let inputValue = $(this).val();
                    inputValue = inputValue.replace(/[^0-9.]/g, '');
                    if (inputValue == '') return;

                    $(this).val(inputValue);
                    const stock = parseFloat(rowData[3]);
                    if (parseFloat(inputValue) > stock) {
                        $(this).val(stock);
                        return;
                    }

                    // Log the row data and the input value
                    console.log("Row data:", rowData);
                    console.log("Input value:", inputValue);
                });
            }
            tbody.find("td").css("text-align", "left");
        }
    };

    // $("#txt_idnv").keydown(function (event) {
    //     if (event.which === 13) {
    //         loading_employee();
    //     }
    // });
    $('#txt_idnv').on('change', function() {
        loading_employee();
    });

    
    // $("#txt_idmechanic").keydown(function (event) {
    //     if (event.which === 13) {
    //         loading_mechainc_infor();
    //     }
    // });

    $('#txt_idmechanic').on('change', function() {
        loading_mechainc_infor();
    });

    // $("#txt_machanic_close").keydown(function (event) {
    //     if (event.which === 13) {
    //         loading_mechanic_close_confirm();
    //     }
    // });

    $('#txt_machanic_close').on('change', function() {
        loading_mechanic_close_confirm();
    });


    $("#btn_open_ticket").click(function () {
        console.log("Open Ticket");
        var emp_id = $("#txt_emp").text().split(":")[1].trim();
        var emp_name = $("#txt_emp_name").text().split(":")[1].trim();
        var machine_name = $("#txt_machine").text().split(":")[1];
        var machine_type = machine_name.split("|")[0]
        var machine_location = machine_name.split("|")[1]
        var machine_broken_code = $("#txt_code_err_machine").val();

        if (emp_id == '' || emp_name == '') {
            alert('Nhân viên chưa xác nhận ID');
            $('#txt_idnv').focus();
            return;
        }
        if (machine_broken_code == '') {
            alert('Bạn chưa chọn mã lỗi code hỏng');
            return;
        }

        var data_send = {
            emp_id: emp_id,
            emp_name: emp_name,
            machine_type: machine_type,
            machine_location: machine_location,
            machine_broken_code: machine_broken_code,
        };
        $.ajax({
            url: '/cutting-mechanic-downtime-open-ticket',
            method: 'POST',
            data: data_send,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            // timeout: 50000,
        })
            .done(function (response) {
                console.log(response);
                $('#modal_employee_open_ticket').modal('hide');
                get_realtime_downtime();
            })
            .fail(function (error) {
                alert('FAIL');
            })
    });

    $("#btn_no_repair_ticket").click(function () {
        console.log("Đóng không sửa");
        var emp_id = $("#txt_repair_emp").text().trim();
        var emp_name = $("#txt_repair_emp_name").text().trim();
        var MachineID = $("#txt_machine_repair_name").text().split("|")[0];
        var mechanic_broken_code = $("#txt_code_err_machine_mechanic").val();
        var mechanic_infor = $("#txt_repair_mechanic_name").text().split(":")[1].trim();
        var mechanic_id = mechanic_infor.split("|")[0];
        var mechanic_name = mechanic_infor.split("|")[1];
        // console.log(machine_type);
        if (mechanic_infor == '') {
            alert('Thợ máy chưa xác nhận');
            $('#txt_idmechanic').focus();
            return;
        }
        if (mechanic_broken_code == '') {
            alert('Thợ máy không để mã code hỏng trống!');
            return;
        }
        // console.log(machine_type);
        var data_send = {
            emp_id: emp_id,
            emp_name: emp_name,
            MachineID: MachineID,
            mechanic_broken_code: mechanic_broken_code,
            mechanic_id: mechanic_id,
            mechanic_name: mechanic_name
        };
        $.ajax({
            url: '/cutting-mechanic-downtime-no_repair',
            method: 'POST',
            data: data_send,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            // timeout: 50000,
        })
            .done(function (response) {
                console.log(response);
                $('#modal_employee_repair_ticket').modal('hide');
                get_realtime_downtime();

            })
            .fail(function (error) {
                console.log(error);
                alert('FAIL');
            })
    });

    $("#btn_machine_document_5").click(function () {
        var MachineID = $("#txt_pm_MachineID").text().split("|")[0];
        MachineID=MachineID.split("|")[0].trim();
        // alert('Machine ID: ' + MachineID);
        get_docunmet_machines(MachineID);
    });
    $("#btn_machine_document_4").click(function () {
        var MachineID = $("#txt_production_close").text().split("|")[0];
        MachineID=MachineID.split("|")[0].trim();
        // alert('Machine ID: ' + MachineID);
        get_docunmet_machines(MachineID);
    });

    $("#btn_machine_document_3").click(function () {
        var MachineID = $("#txt_machine_close").text().split("|")[0];
        MachineID=MachineID.split("|")[0].trim();
        // alert('Machine ID: ' + MachineID);
        get_docunmet_machines(MachineID);
    });

    $("#btn_machine_document_2").click(function () {
        var MachineID = $("#txt_machine_repair_name").text().split("|")[0];
        MachineID=MachineID.split("|")[0].trim();
        // alert('Machine ID: ' + MachineID);
        get_docunmet_machines(MachineID);
    });

    $("#btn_machine_document_1").click(function () {
        var MachineID = $("#txt_machine").text().split(":")[1];
        MachineID=MachineID.split("|")[0].trim();
        // alert('Machine ID: ' + MachineID);
        get_docunmet_machines(MachineID);
    });

    function get_docunmet_machines(MachineID) {

        var data_send = {
            MachineID: MachineID,
        };
        $.ajax({
            url: '/cutting-mechanic-machine-information',
            method: 'post',
            data: data_send,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            // timeout: 50000,
        })
            .done(function (response) {
                console.log(response);
                if(response.result=='empty'||response.result=='err') {
                    alert("Không có thông tin tài liệu máy này!!!");
                    return;
                }
                else{
                    // link=response.result;
                    window.open('/staticFile/'+response.result);

                }
            })
            .fail(function (error) {
                console.error('Failed to open folder.');
                console.log(error);
                // alert('FAIL');
            })
    };
    //Bắt đầu sửa
    $("#btn_repair_ticket").click(function () {
        console.log("Bắt đầu sửa");
        var emp_id = $("#txt_repair_emp").text().trim();
        var emp_name = $("#txt_repair_emp_name").text().trim();
        var MachineID = $("#txt_machine_repair_name").text().split("|")[0];
        var mechanic_broken_code = $("#txt_code_err_machine_mechanic").val();
        var mechanic_infor = $("#txt_repair_mechanic_name").text().split(":")[1].trim();
        var mechanic_id = mechanic_infor.split("|")[0];
        var mechanic_name = mechanic_infor.split("|")[1];
        // console.log(machine_type);
        if (mechanic_infor == '') {
            alert('Thợ máy chưa xác nhận');
            $('#txt_idmechanic').focus();
            return;
        }

        var data_send = {
            emp_id: emp_id,
            emp_name: emp_name,
            MachineID: MachineID,
            mechanic_broken_code: mechanic_broken_code,
            mechanic_id: mechanic_id,
            mechanic_name: mechanic_name
        };
        $.ajax({
            url: '/cutting-mechanic-start-repair',
            method: 'POST',
            data: data_send,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            // timeout: 50000,
        })
            .done(function (response) {
                console.log(response);
                $('#modal_employee_repair_ticket').modal('hide');
                get_realtime_downtime();

            })
            .fail(function (error) {
                console.log(error);
                alert('FAIL');
            })
    });

    //Đống ticket từ thợ máy
    $("#btn_mechanic_close_ticket").click(function () {
        console.log("Đóng ticket");
        var emp_id = $("#txt_close_emp").text().trim();
        var emp_name = $("#txt_close_emp_name").text().trim();
        var MachineID = $("#txt_machine_close").text().split("|")[0];
        var emp_infor = $("#txt_machanic_close_name").text().split(":")[1].trim();
        var emp_confirm = emp_infor.split("|")[0];
        var emp_confirm_name = emp_infor.split("|")[1];
        var mechanic_close_note=$("#txt_mechanic_note_close").val();

        if (emp_infor == '') {
            alert('Bộ phận sản xuất chưa xác nhận');
            $('#txt_machanic_close').focus();
            return;
        }

        var data_send = {
            emp_id: emp_id,
            emp_name: emp_name,
            MachineID: MachineID,
            emp_confirm: emp_confirm,
            emp_confirm_name: emp_confirm_name,
            mechanic_close_note:mechanic_close_note
        };
        $.ajax({
            url: '/cutting-mechanic-finish-repair',
            method: 'POST',
            data: data_send,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            // timeout: 50000,
        })
            .done(function (response) {
                console.log(response);
                $('#modal_mechanic_close_ticket').modal('hide');
                get_realtime_downtime();

            })
            .fail(function (error) {
                console.log(error);
                alert('FAIL');
            })
    });


    function loading_employee() {
        var rfid = $('#txt_idnv').val();
        rfid = $.trim(rfid)
        if (rfid.length == 0) return;
        if (isNaN(rfid)) {
            alert(rfid + ' không phải là số')
            $('#txt_idnv').val('');
            $('#txt_idnv').focus();
            return;
        } else {
            var requestData = {
                rfid: rfid
            };
            $('#txt_idnv').val('');
            $('#txt_idnv').focus();
            $.ajax({
                url: '/cutting-loading-employee',
                method: 'POST',
                data: requestData,
                dataType: 'json',
                beforeSend: function (request) {
                    console.log(request);
                    return true;
                },
                timeout: 20000,
            })
                .done(function (response) {
                    console.log(response);
                    if (response.lenth == 0) {
                        alert('Không tìm thấy nhân viên');
                        $('#txt_idnv').val('');
                        $('#txt_idnv').focus();
                        return;
                    }
                    else {
                        try {
                            $('#txt_idnv').val('');
                            var data = $.extend({}, response); //copy json data
                            console.log(data);
                            console.log('get data');
                            // if (response[0].Dept == 'CT' || response[0].Dept == 'IE') {
                            if (response[0].Dept != 'IE') {
                                $("#txt_emp").text('Mã số:' + response[0].EmployeeID)
                                $("#txt_emp_name").text('Tên nhân viên:' + response[0].Name)
                            }
                            else {
                                alert('Nhân viên không phải là\nNhân viên sản xuất Cutting');
                                return;
                            }
                        }
                        catch {
                            alert('Không tìm thấy nhân viên');
                            $('#txt_idnv').val('');
                            $('#txt_idnv').focus();
                            return;
                        }
                    }

                })
                .fail(function (error) {
                    $('#txt_idnv').val('');
                    $('#txt_idnv').focus();
                    alert('FAIL');
                })
        }
    };

    function loading_mechanic_close_confirm() {
        var rfid = $('#txt_machanic_close').val();
        rfid = $.trim(rfid)
        if (rfid.length == 0) return;
        if (isNaN(rfid)) {
            alert(rfid + ' không phải là số')
            $('#txt_machanic_close').val('');
            $('#txt_machanic_close').focus();
            return;
        } else {
            var requestData = {
                rfid: rfid
            };
            $.ajax({
                url: '/cutting-loading-employee',
                method: 'POST',
                data: requestData,
                dataType: 'json',
                beforeSend: function (request) {
                    console.log(request);
                    return true;
                },
                // timeout: 50000,
            })
                .done(function (response) {
                    // console.log(response);
                    if (response.lenth == 0) {
                        alert('Không tìm thấy nhân viên');
                        $('#txt_machanic_close').val('');
                        $('#txt_machanic_close').focus();
                        return;
                    }
                    else {
                        try {
                            $('#txt_machanic_close').val('');
                            var data = $.extend({}, response); //copy json data
                            console.log(data);
                            console.log('get data');
                            if (response[0].Dept == 'IECT' || response[0].Dept == 'IE') {
                                $("#txt_machanic_close_name").text('Thợ máy:' + response[0].EmployeeID + '|' + response[0].Name)
                            }
                            else {
                                alert('Nhân viên không phải là\nNhân viên thợ máy Cutting');
                                return;
                            }
                        }
                        catch {
                            alert('Không tìm thấy nhân viên');
                            $('#txt_machanic_close').val('');
                            $('#txt_machanic_close').focus();
                            return;
                        }
                    }

                })
                .fail(function (error) {
                    $('#txt_machanic_close').val('');
                    $('#txt_machanic_close').focus();
                    alert('FAIL');
                })
        }
    };

    function loading_mechainc_infor() {
        var rfid = $('#txt_idmechanic').val();
        rfid = $.trim(rfid)
        if (rfid.length == 0) return;
        if (isNaN(rfid)) {
            alert(rfid + ' không phải là số')
            $('#txt_idmechanic').val('');
            $('#txt_idmechanic').focus();
            return;
        } else {
            var requestData = {
                rfid: rfid
            };
            $.ajax({
                url: '/cutting-loading-employee',
                method: 'POST',
                data: requestData,
                dataType: 'json',
                beforeSend: function (request) {
                    console.log(request);
                    return true;
                },
                timeout: 50000,
            })
                .done(function (response) {
                    // console.log(response);
                    if (response.lenth == 0) {
                        alert('Không tìm thấy thợ máy');
                        $('#txt_idmechanic').val('');
                        $('#txt_idmechanic').focus();
                        return;
                    }
                    else {
                        try {
                            $('#txt_idmechanic').val('');
                            var data = $.extend({}, response); //copy json data
                            console.log(data);
                            if (response[0].Dept == 'IECT' || response[0].Dept == 'IE') {
                                $("#txt_repair_mechanic_name").text('Thợ máy:' + response[0].EmployeeID + '|' + response[0].Name)
                            }
                            else {
                                alert('Nhân viên không phải IE Cutting');
                                return;
                            }
                        }
                        catch {
                            alert('Không tìm thấy nhân viên');
                            $('#txt_idmechanic').val('');
                            $('#txt_idmechanic').focus();
                            return;
                        }
                    }

                })
                .fail(function (error) {
                    $('#txt_idmechanic').val('');
                    $('#txt_idmechanic').focus();
                    alert('FAIL');
                })
        }
    };
    

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
                    generate_show_data(response);
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

    function get_machine_broken_code() {
        $("#txt_code_err_machine").val("");
        $("#txt_code_err_machine").empty();
        $.ajax({
            url: '/cutting-mechanic-broken-code',
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
                // console.log(response);
                console.log(typeof response);
                var i = 0;
                var defalt_select = $("<option>").attr("value", "").prop("selected", true);
                $("#txt_code_err_machine").append(defalt_select);
                for (i = 0; i < response.length; i++) {
                    if (response[i].CODE_BROKEN == null) continue;
                    var option = document.createElement('option');
                    option.value = response[i].CODE_BROKEN;
                    option.innerHTML = response[i].CODE_BROKEN;
                    document.getElementById('txt_code_err_machine').appendChild(option);
                }
            })
            .fail(function (error) {
                console.error(error);
                alert('FAIL');
            })
    };

    function get_machine_nechanic_code() {
        $("#txt_code_err_machine_mechanic").val("");
        $("#txt_code_err_machine_mechanic").empty();
        $.ajax({
            url: '/cutting-mechanic-broken-code',
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
                // console.log(response);
                console.log(typeof response);
                var i = 0;
                var defalt_select = $("<option>").attr("value", "").prop("selected", true);
                $("#txt_code_err_machine_mechanic").append(defalt_select);
                for (i = 0; i < response.length; i++) {
                    if (response[i].CODE_BROKEN == null) continue;
                    var option = document.createElement('option');
                    option.value = response[i].CODE_BROKEN;
                    option.innerHTML = response[i].CODE_BROKEN;
                    document.getElementById('txt_code_err_machine_mechanic').appendChild(option);
                }

            })
            .fail(function (error) {
                console.error(error);
                alert('FAIL');
            })
    };

    function generate_show_data(data) {
        var broken_machine = 0;
        var repair_machine = 0;
        var pm_machine = 0;
        var confirm_machine = 0;
        for (var i = 0; i < data.length; i++) {
            var state = data[i].state;
            console.log(state)
            if (state === 1) broken_machine += 1;
            if (state === 2) repair_machine += 1;
            if (state === 4) pm_machine += 1;
            if (state === 3) confirm_machine += 1;

        }
        var total_machines = data.length;
        $('#txt_total_machine').text(total_machines);
        $('#txt_broken_machine').text(broken_machine);
        $('#txt_repair_machine').text(repair_machine);
        $('#txt_pm_machine').text(pm_machine);
        $('#txt_confirm_machine').text(confirm_machine);
    };

    function get_mechanic_confirm_repair(MachineID) {
        $("#txt_code_err_machine_mechanic").val("");
        $("#txt_code_err_machine_mechanic").empty();
        var data = {
            MachineID: MachineID
        }
        $.ajax({
            url: '/cutting-mechanic-confirm-repair',
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
                try {
                    $("#txt_broken_mechanic").text('Lỗi nhân viên báo: ' + response[0].OpenMachineCode);
                    $("#txt_repair_emp").text(response[0].IDEmployee);
                    $("#txt_repair_emp_name").text(response[0].NameEmployee);
                    $("#txt_machine_repair_name").text(response[0].MachineID + '|' + response[0].RowPos + 'x' + response[0].ColPos)
                    $("#txt_code_err_machine_mechanic").val(response[0].OpenMachineCode);//default
                    $('#modal_employee_repair_ticket').modal('show');
                    $('#txt_idmechanic').focus();
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

    function get_time(datetime) {
      var datetimeStr = datetime;
      var datetime = new Date(datetimeStr);
      var timeStr = datetime.toISOString().substr(11, 8);
      return timeStr;
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
                    const { IDMachine, state, StartTime,MachineName } = machine;

                    const cellElement = document.createElement('div');
                    cellElement.classList.add('machine');
                    cellElement.setAttribute('state', state);
                    cellElement.style.gridColumn = `span 1`;
                    cellElement.style.gridRow = `span 1`;
                    // Thêm sự kiện mouseover vào cellElement
                    cellElement.addEventListener("mouseover", function () {
                      // Hiển thị popover khi di chuột vào ô
                      showPopover(this, MachineName);
                    });

                    // Thêm sự kiện mouseout để ẩn popover khi di chuột ra khỏi ô
                    cellElement.addEventListener("mouseout", function () {
                      hidePopover(this);
                    });
                    if (state != 0) {

                        cellElement.style.display = 'flex';
                        cellElement.style.flexDirection = 'column';
                        cellElement.style.justifyContent = 'center';
                        cellElement.style.alignItems = 'center';
                        const txtmc = document.createElement('div');
                        txtmc.innerText = IDMachine;
                        txtmc.style.fontSize = '12px'; // Kích thước font chữ cho dòng 1
                        cellElement.appendChild(txtmc);

                        const starttime = document.createElement('div');
                        starttime.innerText = get_time(StartTime);
                        starttime.style.fontSize = '8px'; // Kích thước font chữ cho dòng 2
                        cellElement.appendChild(starttime);
                    }
                    else {
                        const txtmc = document.createElement('div');
                        txtmc.innerText = IDMachine;
                        txtmc.style.fontSize = '12px'; // Kích thước font chữ cho dòng 1
                        cellElement.appendChild(txtmc);
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
                        // Check chế độ PM hy không
                        var StatusModePM = getBtnOnModeStatus();
                        if (StatusModePM == '0') {
                            //Openticket
                            if (state == 0) {//báo hỏng
                                $("#txt_idmechanic").val('');
                                modal_open_ticket(IDMachine, row, col);
                            }
                            // Confirm to start fix
                            if (state == 1) {// Confirm to start fix
                                $("#txt_idmechanic").val('');
                                $("#txt_repair_mechanic_name").text('Thợ máy:');

                                get_machine_nechanic_code();
                                get_mechanic_confirm_repair(IDMachine);
                            }
                            // Finish or request sparepart
                            if (state == 2) {// Finish or request sparepart
                                $("#txt_machanic_close").val('');
                                $("#txt_machanic_close_name").text('Thợ máy:');
                                modal_mechanic_close(IDMachine);
                            }
                            // Chờ sản xuất xác nhận đóng oke
                            if (state == 3) {// Waiting confirmation
                                $("#txt_IDproduction_close").val('');
                                $("#txt_production_close_name").text('Sản xuất:');
                                modal_production_confirm(IDMachine);
                            }

                            if (state == 4) {// Chế độ PM
                                alert('Cần chuyển sang chế độ PM để đóng công việc PM trên máy này\nMECHANIC CUTTING');
                                return;
                            }
                        }
                        else {
                            if (state > 0 && state < 4) {//báo hỏng
                                alert("CHẾ ĐỘ PM CỦA THỢ MÁY\n\nMáy cần đóng về trạng thái hoạt động tốt\nTrước khi chuyển qua chế độ để PM");
                                return;
                            }
                            else {
                                // Open dialog for PM function
                                modal_pm_function(IDMachine, state);
                            }
                        }

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

    function modal_open_ticket(IDMachine, row, col) {
        $('#txt_idnv').val('');
        $('#txt_emp').text('Mã số:');
        $('#txt_emp_name').text('Tên nhân viên:');

        $('#txt_machine').text('Thông tin máy: ' + IDMachine + '|' + row + 'x' + col);
        $('#txt_machine_name').text(IDMachine);
        $('#modal_employee_open_ticket').modal('show');
        $('#txt_code_err_machine').prop('selectedIndex', 0);
        $('#txt_idnv').focus();
    };


    function modal_mechanic_close(MachineID) {
        var data = {
            MachineID: MachineID
        }
        $.ajax({
            url: '/cutting-mechanic-get-close-ticket',
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
                try {
                    $("#txt_broken").text('Lỗi :' + response[0].CloseMachineCode);
                    $("#txt_close_emp").text(response[0].IDEmployee);
                    $("#txt_close_emp_name").text(response[0].NameEmployee);
                    $("#txt_machine_close").text(response[0].MachineID + '|' + response[0].RowPos + 'x' + response[0].ColPos);
                    $('#modal_mechanic_close_ticket').modal('show');
                    $('#txt_machanic_close').focus();
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

    $("#btn_clear_production").click(function () {
        $('#txt_IDproduction_close').val('');
        $('#txt_IDproduction_close').focus();
    });
    $("#btn_production_approve_machine").click(function () {
        production_confirm_tasks();
    });

    // $("#txt_IDproduction_close").keydown(function (event) {
    //     if (event.which === 13) {
    //         production_employee_information();
    //     }
    // });

    $('#txt_IDproduction_close').on('change', function() {
        production_employee_information();
    });

    function production_employee_information() {
        var rfid = $('#txt_IDproduction_close').val();
        rfid = $.trim(rfid)
        if (rfid.length == 0) return;
        if (isNaN(rfid)) {
            alert(rfid + ' không phải là số')
            $("#txt_production_close_name").text('Sản xuất:');
            $('#txt_IDproduction_close').val('');
            $('#txt_IDproduction_close').focus();
            return;
        } else {
            var requestData = {
                rfid: rfid
            };
            $("#txt_production_close_name").text('Sản xuất:');
            $('#txt_IDproduction_close').val('');
            $('#txt_IDproduction_close').focus();
            $.ajax({
                url: '/cutting-loading-employee',
                method: 'POST',
                data: requestData,
                dataType: 'json',
                beforeSend: function (request) {
                    console.log(request);
                    return true;
                },
                timeout: 2000,
            })
                .done(function (response) {
                    console.log(response);
                    if (response.lenth == 0) {
                        alert('Không tìm thấy nhân viên');
                        $("#txt_production_close_name").text('Sản xuất:');
                        $('#txt_IDproduction_close').val('');
                        $('#txt_IDproduction_close').focus();
                        return;
                    }
                    else {
                        try {
                            $('#txt_IDproduction_close').val('');
                            $("#txt_production_close_name").text('Sản xuất:');
                            // var data = $.extend({}, response); //copy json data
                            // console.log(data);
                            console.log('get data');
                            // if (response[0].Dept == 'CUT' || response[0].Dept == 'IE'||response[0].Dept == 'PR'||response[0].Dept == 'CT') {
                            //     $("#txt_production_close_name").text('Sản xuất:' + response[0].EmployeeID + '|' + response[0].Name)
                            // }
                            if (response[0].Dept !='IECT') {
                                $("#txt_production_close_name").text('Sản xuất:' + response[0].EmployeeID + '|' + response[0].Name)
                            }
                            else {
                                alert('Nhân viên không phải là sản xuất cutting');
                                return;
                            }
                        }
                        catch {
                            alert('Không tìm thấy nhân viên');
                            $("#txt_production_close_name").text('Sản xuất:');
                            $('#txt_IDproduction_close').val('');
                            $('#txt_IDproduction_close').focus();
                        }
                    }

                })
                .fail(function (error) {
                    $('#txt_IDproduction_close').val('');
                    $('#txt_IDproduction_close').focus();
                    alert('FAIL');
                })
        }
    };

    function modal_production_confirm(MachineID) {
        var data = {
            MachineID: MachineID
        }
        $.ajax({
            url: '/cutting-mechanic-get-close-ticket',
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
                try {
                    $("#txt_close_production").text(response[0].IDEmployee);
                    $("#txt_close_production_name").text(response[0].NameEmployee);
                    $("#txt_production_close").text(response[0].MachineID + '|' + response[0].RowPos + 'x' + response[0].ColPos);
                    $('#modal_production_close').modal('show');
                    $('#txt_IDproduction_close').focus();
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

    function production_confirm_tasks() {
        console.log("Sản xuất xác nhận");

        var MachineID = $("#txt_production_close").text().split("|")[0];

        var emp_infor = $("#txt_production_close_name").text().split(":")[1].trim();
        var emp_confirm = emp_infor.split("|")[0];
        var emp_confirm_name = emp_infor.split("|")[1];

        if (emp_infor == '') {
            alert('Bộ phận sản xuất chưa xác nhận');
            $('#txt_IDproduction_close').focus();
            return;
        }

        var data_send = {
            MachineID: MachineID,
            emp_confirm: emp_confirm,
            emp_confirm_name: emp_confirm_name
        };
        $.ajax({
            url: '/cutting-mechanic-production-confirmation',
            method: 'POST',
            data: data_send,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            timeout: 50000,
        })
            .done(function (response) {
                console.log(response);
                $('#modal_production_close').modal('hide');
                get_realtime_downtime();

            })
            .fail(function (error) {
                console.log(error);
                alert('FAIL');
            })

    }

    function modal_pm_function(MachineID, state) {
        $("#txt_pm_mechanic_name").text('Thợ máy:');
        $('#txt_pm_IDMec').val('');
        $("#txt_note_pm_open").val('');
        $("#txt_note_pm_close").val('');

        if (state == '0') {
            $("#btn_pm_open").css('display', 'block');
            $("#btn_pm_close").css('display', 'none');

            $("#div_note_open").css('display', 'block');
            $("#div_note_close").css('display', 'none');
        }
        else {
            $("#btn_pm_open").css('display', 'none');
            $("#btn_pm_close").css('display', 'block');

            $("#div_note_open").css('display', 'none');
            $("#div_note_close").css('display', 'block');
        }

        $('#txt_pm_MachineID').text(MachineID + '|' + state);
        $('#modal_pm_function').modal('show');
        $('#txt_pm_IDMec').focus();
    };

    // $("#txt_pm_IDMec").keydown(function (event) {
    //     if (event.which === 13) {
    //         pm_mechanic_information();
    //     }
    // });

    $('#txt_pm_IDMec').on('change', function() {
        pm_mechanic_information();
    });

    $("#btn_clear_pm_IDMec").click(function () {
        $('#txt_pm_IDMec').val('');
        $('#txt_pm_IDMec').focus();
    });

    function pm_mechanic_information() {
        var rfid = $('#txt_pm_IDMec').val();
        rfid = $.trim(rfid)
        if (rfid.length == 0) return;
        if (isNaN(rfid)) {
            alert(rfid + ' không phải là số')
            $("#txt_pm_mechanic_name").text('Thợ máy:');
            $('#txt_pm_IDMec').val('');
            $('#txt_pm_IDMec').focus();
            return;
        } else {
            var requestData = {
                rfid: rfid
            };
            $("#txt_pm_mechanic_name").text('Thợ máy:');
            $('#txt_pm_IDMec').val('');
            $('#txt_pm_IDMec').focus();
            $.ajax({
                url: '/cutting-loading-employee',
                method: 'POST',
                data: requestData,
                dataType: 'json',
                beforeSend: function (request) {
                    console.log(request);
                    return true;
                },
                timeout: 2000,
            })
                .done(function (response) {
                    console.log(response);
                    if (response.lenth == 0) {
                        alert('Không tìm thấy nhân viên');
                        $("#txt_pm_mechanic_name").text('Thợ máy:');
                        $('#txt_pm_IDMec').val('');
                        $('#txt_pm_IDMec').focus();
                        return;
                    }
                    else {
                        try {
                            $('#txt_pm_IDMec').val('');
                            $("#txt_pm_mechanic_name").text('Thợ máy:');
                            // var data = $.extend({}, response); //copy json data
                            // console.log(data);
                            console.log('get data');
                            if (response[0].Dept == 'IECT' || response[0].Dept == 'IE') {
                                $("#txt_pm_mechanic_name").text('Thợ máy:' + response[0].EmployeeID + '|' + response[0].Name)
                            }
                            else {
                                alert('Nhân viên không phải là thợ máy cutting');
                                return;
                            }
                        }
                        catch {
                            alert('Không tìm thấy nhân viên');
                            $("#txt_pm_mechanic_name").text('Thợ máy:');
                            $('#txt_pm_IDMec').val('');
                            $('#txt_pm_IDMec').focus();
                            return;
                        }
                    }

                })
                .fail(function (error) {
                    $('#txt_pm_IDMec').val('');
                    $('#txt_pm_IDMec').focus();
                    alert('FAIL');
                })
        }
    };

    $("#btn_pm_open").click(function () {
        update_pm_tasks();
    });

    $("#btn_pm_close").click(function () {
        update_pm_tasks();
    });

    function update_pm_tasks() {
        var MachineID = $("#txt_pm_MachineID").text().split("|")[0];
        var MachineState = $("#txt_pm_MachineID").text().split("|")[1];

        var MechanicInfor = $("#txt_pm_mechanic_name").text().split(":")[1].trim();
        var MechanicID = MechanicInfor.split("|")[0];
        var MechanicName = MechanicInfor.split("|")[1];
        var note_open = $("#txt_note_pm_open").val();
        var note_close = $("#txt_note_pm_close").val();


        if (MechanicID == '') {
            alert('Chưa scan thẻ thợ máy');
            $('#txt_pm_IDMec').focus();
            return;
        }
        var data_send = {
            MachineID: MachineID,
            MachineState: MachineState,
            MechanicID: MechanicID,
            MechanicName: MechanicName,
            note_open: note_open,
            note_close: note_close,
        };
        $.ajax({
            url: '/cutting-mechanic-update-pm-task',
            method: 'POST',
            data: data_send,
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            timeout: 50000,
        })
            .done(function (response) {
                console.log(response);
                $('#modal_pm_function').modal('hide');
                get_realtime_downtime();

            })
            .fail(function (error) {
                console.log(error);
                alert('FAIL');
                $('#modal_pm_function').modal('hide');
            })
    }
});