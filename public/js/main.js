// Get userlist
$.ajax({
    url: "/users/userlist",
    type: "GET",
    success: (data) => {
        let list = ''; //make sure list is empty
        for (var i = 0; i< data.length; i++) {
            list += '<li class="list-group-item">' + data[i].email.split("@")[0] + 
			' <a href="/users/password/reset/' +  data[i]._id + '" class="btn btn-primary newPasswordBtn">Skicka nytt lösenord</a>' + 
			' <button class="btn btn-danger deleteBtn" id="' + data[i]._id + '">Ta bort</button></li>'
            ;
        }
        $('#ulist').html(list);
    }
}).then(() => {
    // Send delete request
    $(".deleteBtn").click( e => {
        let url = "/users/user/" + e.target.id;
        $.ajax({
            url: url,
            type: "DELETE",
            success: (res) => {
                console.log(res);
                window.location.replace("/users/admin");
            }
        }); 
    });
});

// Get employee-list
$.ajax({
    url: "/templates/employeelist",
    type: "GET",
    success: (data) => {
        let list = ''; // make sure list is empty
        for (var i = 0; i< data.length; i++) {
            list += '<li class="list-group-item">' + data[i].empName + '<br><img src="/uploads/' + data[i].empImage + '" alt="employee image"><br>' +
            ' <button id="' +  data[i]._id + '" class="btn btn-primary editBtn" data-toggle="modal" data-target="#editModal">Ändra</button>' + 
            ' <button class="btn btn-danger deleteEmpBtn" id="' + data[i]._id + '">Ta bort</button></li>'  
            ;
        }
        $('#empList').html(list); 
    }
}).then(() => {
    // Send new password
    $(".editBtn").click(e => {
        $.ajax({
            url: "/templates/employee/" + e.target.id,
            type: "GET",
            success: (data) => {
                // Put values into edit form
                $("#empEditName").val(data.empName);
                $("#empEditRoom").val(data.empRoom);
                $("#empEditPhoneNr").val(data.empPhoneNr);
                $(".submitEditBtn").attr("id", e.target.id);

                // CKEDITOR
                CKEDITOR.instances["empEditDescription"].setData(data.empDescription);
            }
        }).then(() => {
            // Send form
            $(".submitEditBtn").click((e) => { 
                let empEditName = $("#empEditName").val();
                let empEditRoom = $("#empEditRoom").val();
                let empEditPhoneNr = $("#empEditPhoneNr").val();
                let empEditDescription = CKEDITOR.instances["empEditDescription"].getData();
                $.ajax({
                    url: "/templates/employees/" + e.target.id,
                    type: "PUT",
                    data: { empEditName: empEditName, empEditRoom: empEditRoom, empEditPhoneNr: empEditPhoneNr, empEditDescription: empEditDescription},
                    success: (data) => {
                        location.reload();
                    }
                }); 
            }); 
        })
    });
    // Delete employee info
    $(".deleteEmpBtn").click(e => {
        $.ajax({
            url: "/templates/employees/" + e.target.id,
            type: "DELETE",
            success: (res) => {
                console.log(res);
                window.location.replace("/templates/employees");
            }
        });
    });
}); 

// Get information
$.ajax({
    url: "/templates/information",
    type: "GET",
    success: (data) => {
        // Display information in form if it exists
        if(data.length){
			$("#infoName").val(data[0].infoName);
            
            // CKEDITOR
            CKEDITOR.instances["infoFieldOne"].setData(data[0].infoFieldOne);
            CKEDITOR.instances["infoFieldTwo"].setData(data[0].infoFieldTwo);
        }

        // Show image
        let imageHtml = '<img src="/uploads/' + data[0].infoImage + '" alt="Informations-bild">'
        $("#current-image").html(imageHtml); 
    }
});

// News page
// Get news-list
$.ajax({
    url: "/templates/newslist",
    type: "GET",
    success: (data) => {
        let list = ''; // make sure list is empty
        for (var i = 0; i< data.length; i++) {
            list += '<li class="list-group-item"><strong>' + data[i].newsHeading + '</strong><br>' + data[i].newsText + '<img src="/uploads/' + data[i].newsImage + '" alt="news image">' +
            '<br> <button id="' +  data[i]._id + '" class="btn btn-primary editBtn" data-toggle="modal" data-target="#editModal">Ändra</button>' + 
            ' <button class="btn btn-danger deleteNewsBtn" id="' + data[i]._id + '">Ta bort</button></li>'  
            ;
        }
        $('#newsList').html(list); 
    }
}).then(() => {
    $(".editBtn").click(e => {
        $.ajax({
            url: "/templates/news/" + e.target.id,
            type: "GET",
            success: (data) => {
                // Put values into edit form
                $("#newsEditHeading").val(data.newsHeading);
                $(".submitNewsBtn").attr("id", e.target.id);

                // CKEDITOR
                CKEDITOR.instances["newsEditText"].setData(data.newsText);
            }
        }).then(() => {
            // Send edit form 
            $(".submitNewsBtn").click((e) => { 
                let newsEditHeading = $("#newsEditHeading").val();
                let newsEditText = CKEDITOR.instances["newsEditText"].getData();
                $.ajax({
                    url: "/templates/news/" + e.target.id,
                    type: "PUT",
                    data: { newsHeading: newsEditHeading, newsText: newsEditText },
                    success: (data) => {
                        location.reload();
                    }
                }); 
            }); 
        });
    });
    // Delete news
    $(".deleteNewsBtn").click(e => {
        $.ajax({
            url: "/templates/news/" + e.target.id,
            type: "DELETE",
            success: (res) => {
                console.log(res);
                window.location.replace("/templates/news");
            }
        });
    });
}); 