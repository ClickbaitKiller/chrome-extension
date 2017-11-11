'use strict';



let originHref = location.origin;

/*
* API
* */
const Api = function() {

};


Api.prototype.getInfo = function(link, cb) {
  let r = Math.random();
  let time = Math.random()*400;

  setTimeout(function() {

    if(r < 0.3) {
      cb({
        score: 0.6,
        summary:"100% bullshit",
        id: link.id
      });
    } else if(r < 0.45) {
      cb({
        score:0.8,
        summary:'10 Reasons why Britney spears cut her hair',
        list: ['She sucks', 'She sucks hard', 'Fuck her', "She's a bitch"],
        id: link.id
      });
    } else {
      cb({

      });
    }
  }, time);

};


let api = new Api();


/* LINK parser */


let links = [...document.body.getElementsByTagName("a")];
let linksAnalysed = {};

let fetchLinkAnalysis = function() {

};
let cleanLinks = links.map((link, i) => {
  link.setAttribute('data-id', i);
  return {
    href: link.href,
    text: link.innerText,
    id: i
  }
}).filter(link => {
  return link.href.indexOf('javascript:') === -1
    && link.text
      && !link.href.startsWith('/')
    && !link.href.startsWith(originHref)
    && !link.href.startsWith('#');
});



cleanLinks.forEach(link => {
  api.getInfo(link, function(linkInfo) {
    linksAnalysed[linkInfo.id] = linkInfo;
    updatLinkUI(linkInfo);
  })
});


setTimeout(function() {
  console.log(linksAnalysed);
}, 2000);

let imgLink = cleanLinks.find(link => {
  return link.href.indexOf('imgur') !== -1;
});


let killerPngSrc = chrome.extension.getURL('/images/killer.png');

let updatLinkUI = function(linkInfo) {

  if(linkInfo.score >= 0) {
    $(links[linkInfo.id]).prepend(
      $('<img>', {
        src: killerPngSrc,
        class:'killer-mini-icon',
        'data-id': linkInfo.id
      }));
  }

};


$.get(chrome.extension.getURL('/html/clickbait-killer.html'), function(data) {
  $(data).appendTo('body');
  // Or if you're using jQuery 1.8+:
  // $($.parseHTML(data)).appendTo('body');

  $('#killer-icon')[0].src = killerPngSrc;


  let $killerPopup = $('#killer-popup');
  let $summary = $('#summary');
  let $list = $('#list');

  function renderPopup(data, e) {
    let red = parseInt(data.score * 255);
    let color = 'rgb('+red+', 150,150)';

    $summary.text(data.summary);

    if(data.list && data.list.length > 0) {
      $list.html(data.list.map(text => { return $('<li>').text(text); })).show();
    } else {
      $list.hide();
    }

    $killerPopup.css({
                        'border': '1px solid '+color,
                       'left': e.clientX,
                       'top': e.clientY+5
    }).show();

  }

  function hidePopup() {
    $killerPopup.hide();
  }


  /* API requests */

  $(document.body).on('mouseover', '.killer-mini-icon', function(e) {
    let id = $(this).attr('data-id');

    let linkAnalysed = linksAnalysed[id];

    if(linkAnalysed && linkAnalysed.score && (linkAnalysed.summary || (linkAnalysed.list && linkAnalysed.list.length>0))) {
      console.log(linkAnalysed);
      renderPopup(linkAnalysed, e);
    } else {
      hidePopup();
    }
  });

  $(document.body).on('mouseleave', '.killer-mini-icon', function(e) {
    hidePopup();
  });

});
