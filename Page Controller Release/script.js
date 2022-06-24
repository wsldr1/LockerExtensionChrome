load();
function load(){
    chrome.storage.local.get(null,function(result){
        for(page in result){
            if(result[page].save == false){
                deletePage(result[page].url);
            }
        }
    });
 }
function addPages(obj = {}){
    let page = {};
    page[obj.url]= {
        url : obj.url,
        lock: obj.lock,
        save: obj.save,
    }
    chrome.storage.local.set(page);
}

function deletePage(url){
    chrome.storage.local.remove(url);
}

function checkLock(){
    chrome.storage.local.get(null,function(result){
        for(p in result){
            let page = result[p];
            chrome.tabs.query({url: page.url},function(tabId){
                if(tabId.length > 1 && page.lock == true){
                    chrome.tabs.update(tabId[1].id, {url: "locked.html"});
                }
            });
        }
    });
}

chrome.tabs.onHighlighted.addListener(function(highlightInfo){

    chrome.tabs.query({active:true,currentWindow:true},function(tabId){
        chrome.storage.local.get(tabId[0].url,function(result){
            for(p in result){
                if(result[p].lock == true){
                    chrome.action.setBadgeText({tabId:tabId[0].id,text:"Lock"});
                }
                
            }
        });
        
    });
});

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo ={url,status}){
    checkLock();

});

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if(message.button == 'lock'){
      chrome.tabs.query({active:true,currentWindow:true},function(tabId){
        if(tabId[0].url == '' || tabId[0].url =="locked.html"){
                return true;
        }
        chrome.storage.local.get(tabId[0].url,function(result){
            let page = {url:tabId[0].url, lock:message.isLock, save: false};
            let text = (message.isLock == true)? "lock" : "";
            chrome.action.setBadgeText({tabId:tabId[0].id,text:text});
            for(p in result){
                if(result[p].url == tabId[0].url ){
                    page = { 
                        url:tabId[0].url, 
                        lock: message.isLock, 
                        save: result[p].save
                        };
                    }
            }
            addPages(page);
            checkLock();
        });
      });
    }

    if(message.button == 'save'){
        chrome.tabs.query({active: true,currentWindow:true},function(tabId){
            chrome.storage.local.get(tabId[0].url,function(result){
                for(p in result){
                    if(result[p].url == tabId[0].url){
                        let page = {
                        url:tabId[0].url, 
                        lock: result[p].lock, 
                        save: true,
                        };
                    addPages(page);
                    }
                }
            });
        });
    }

    if(message.button == 'delete'){
        chrome.tabs.query({active:true,currentWindow:true},function(tabId){deletePage(tabId[0].url)});
    }

    if(message.button == "clear"){
        chrome.storage.local.clear();
        load();
    }
    if(message.data == "info"){
        chrome.tabs.query({active:true},function(tabId){
            chrome.storage.local.get(tabId[0].url,function(result){
                for (p in result){
                    return sendResponse({'lock': result[p].lock});
                }
            });
        });
    }
    return true;

});
