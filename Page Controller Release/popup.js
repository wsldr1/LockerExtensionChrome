$(document).ready(function(){
    update();
    $("input[type='checkbox']").click(function(){
        let lock = $(this).prop("checked");
        chrome.runtime.sendMessage({button:"lock",isLock: lock});
    });

    $("input[name='save']").click(function(){
        chrome.runtime.sendMessage({button:"save"});
        update();
    })
    
    $("input[name='delete']").click(function(){
        chrome.runtime.sendMessage({button:"delete"});
        update();
    });
    $("input[name='clear']").click(function(){
        chrome.runtime.sendMessage({button:"clear"});
        update();
    });


});

function update(){
    chrome.runtime.sendMessage({data:"info"},function(response){
        $("input[type ='checkbox']").prop('checked',response.lock);
    });

}
