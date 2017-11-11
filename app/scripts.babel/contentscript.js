'use strict';



let originHref = 'https://artmyn.com/partners/cultural';

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
        score: 0.2,
        summary: '',
        list: [],
        id: link.id
      });
    } else if(r < 0.6) {
      cb({
        score:0.8,
        summary:'10 Reasons why Britney spears cut her hair',
        list: ['She sucks', 'She sucks hard', 'Fuck her', "She's a bitch"],
        id: link.id
      });
    } else {
      cb({
        score:0.7,
        summary:"Summary of link",
        id: link.id
      });
    }
  }, time);

};


let api = new Api();


/* LINK parser */


let links = [...document.body.getElementsByTagName("a")];


let cleanLinks = links.map((link, i) => {
  link.setAttribute('data-id', i);
  return {
    href: link.href,
    text: link.innerText,
    id: i
  }
}).filter(link => {
  return link.href.indexOf('javascript:') === -1 && link.text && link.href !== originHref && !link.href.startsWith('#');
});

let linksAnalysed = {};
cleanLinks.forEach(link => {
  api.getInfo(link, function(linkInfo) {
    linksAnalysed[linkInfo.id] = linkInfo;
    updatLinkUI(linkInfo);
  })
});

let linksMap = cleanLinks.reduce((finalObj, item) => {finalObj[item.id] = item; return finalObj}, {});

setTimeout(function() {
  console.log(linksAnalysed);
}, 2000);

let imgLink = cleanLinks.find(link => {
  return link.href.indexOf('imgur') !== -1;
});

console.log(cleanLinks);
console.log(imgLink);

let killerPngSrc = chrome.extension.getURL('/images/killer.png');

let updatLinkUI = function(linkInfo) {

  if(linkInfo.score >= 0.6) {
    console.log('pwnd');
    $(links[linkInfo.id]).prepend($('<img>', {src: killerPngSrc}));
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

  function renderPopup(data) {
    let red = parseInt(data.score * 255);
    let color = 'rgb('+red+', 150,150)';

    $summary.text(data.summary);

    if(data.list && data.list.length > 0) {
      $list.html(data.list.map(text => { return $('<li>').text(text); })).show();
    } else {
      $list.hide();
    }

    $killerPopup.css('border', '1px solid '+color).show();

  }

  function hidePopup() {
    $killerPopup.hide();
  }


  /* API requests */

  $('a').on('mouseover', function() {
    let id = $(this).attr('data-id');

    let linkAnalysed = linksAnalysed[id];

    if(linkAnalysed) {
      renderPopup(linkAnalysed);
    } else {
      //hidePopup();
    }

    console.log('ID', id, linkAnalysed);

  });

});
