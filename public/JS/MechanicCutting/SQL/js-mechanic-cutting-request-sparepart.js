

$(document).ready(function () {
    // var user = $('#username').text();
    // if (user.includes('mung.tran@hanes.com')) {
    //     alert('Bạn chưa đăng nhập hệ thống')
    // };
    get_summary_part_request();

    function get_summary_part_request() {
        $.ajax({
            url: '/cutting-mechanic-request-part-summary',
            method: 'POST',
            data: '',
            dataType: 'json',
            beforeSend: function (request) {
                console.log(request);
                return true;
            },
            // timeout: 5000,
        })
            .done(function (response) {
                console.log(response);
                try {
                    generate_request_Table(response);
                }
                catch {
                    console.error(error);
                    alert('FAIL');
                }
            })
            .fail(function (error) {
                console.error(error);
                alert('FAIL');
            })
    };


    function generate_request_Table(data) {
        const tbody = $("#table_summary_part_request tbody");
        tbody.empty();
        var i = 0;
        for (let i = 0; i < data.length; i++) {
            const row = $("<tr>"); // Create a new table row
            // Create a new table data cell for each property of the data object
            const stt = $("<td>").text(i + 1);
            const week = $("<td>").text(data[i].week);
            const group = $("<td>").text(data[i].groupcbc);
            const shift = $("<td>").text(data[i].shift);
            const style_detail = $("<td>").text(data[i].style);
            const group2 = $("<td>").text(data[i].groupcbc);
            const shift2 = $("<td>").text(data[i].shift);
            const style_detail2 = $("<td>").text(data[i].style);
            // Append the cells to the row
            row.append(stt);
            row.append(week);
            row.append(group);
            row.append(shift);
            row.append(style_detail);
            row.append(group2);
            row.append(shift2);
            row.append(style_detail2);

            // button
            var btn_accept = '<td> <div class="form-button-action"> <button class="btn btn-accept btn-icon btn-round btn-success"><i class="fa fa-check-square"></i></button> </td>';
            var btn_cancel = '<td> <div class="form-button-action"> <button class="btn btn-cancel btn-icon btn-round btn-danger"><i class="fas fa-calendar-times"></i></button> </td>';
            row.append(btn_accept);
            row.append(btn_cancel);
            // Append the row to the tbody element
            tbody.append(row);
        }
        tbody.find("td").css("text-align", "center");
    };

});