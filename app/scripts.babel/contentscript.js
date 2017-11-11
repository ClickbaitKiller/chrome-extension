'use strict';



let originHref = location.href;

/*
* API
* */
const Api = function() {

};

Api.prototype.getInfo = function(id, link, cb) {
    setTimeout(function() {

      return {
        id: id,
        link: link,
        html: "<h2>Hello + "+parseInt(Math.random()*1000)+"</h2>"
      }

    }, Math.random()*400);
};


Api.prototype.getScores = function(links, cb) {

  setTimeout(function() {
    cb(links.map(link => { link.score = Math.random(); return link; }));
  }, 300);

};


let api = new Api();


/* LINK parser */


let links = [];
let linksAnalysed = {};
let allLinksTag = {};
let cleanLinks = [];
let cleanTags = {};

let fetchLinkAnalysis = function() {

  links = [...$('a')];
  console.log('Fetch all links');

  cleanLinks = links.map((link) => {
    let id = parseInt(Math.random() * 10000000);

    link.setAttribute('data-killer-id', id);

    return {
      href: link.href,
      text: link.innerText,
      id: id,
    }
  }).filter(link => {
    return link.href && link.href.indexOf('javascript:') === -1 && link.text && !link.href.startsWith('/') && link.href !== originHref+'#';
  });

  cleanTags = cleanLinks.reduce((obj, subObj) => {
    obj[subObj.id] = subObj;
    return obj;
  }, {});

  api.getScores(cleanLinks, function(scores) {
    scores.forEach(score => {
      updatLinkUI(score.id, score.score);
    });
  });

};

setInterval(fetchLinkAnalysis, 5000);


let killerPngSrc = chrome.extension.getURL('/images/killer.png');
let killerPngSrcBad = chrome.extension.getURL('/images/killer-bad.png');

let updatLinkUI = function(id, score) {

  if(score >= 0) {
    let imgUrl = killerPngSrc;

    if(score > 0.8) {
      imgUrl = killerPngSrcBad;
    }


    $('[data-killer-id='+id+']').prepend(
        $('<img>', {
          src: imgUrl,
          class:'killer-mini-icon',
          'data-id': id
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
