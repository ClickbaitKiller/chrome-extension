'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: 'CK'});


chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action == "xhttp") {

    console.log('BG JS', request.data);

    $.ajax({
             type: request.method,
             url: request.url,
             contentType:request.contentType,
             data: request.data,
             success: function(responseText){
               callback(responseText);
             },
             error: function(XMLHttpRequest, textStatus, errorThrown) {
               //if required, do some error handling
               callback(XMLHttpRequest, errorThrown);
             }
           });

    return true; // prevents the callback from being called too early on return
  }
});