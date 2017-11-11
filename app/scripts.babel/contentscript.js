'use strict';



let originHref = location.href;

console.log('Oring href', originHref);

/*
* API
* */
const Api = function() {

};

let cache = {};

Api.prototype.getInfo = function(id, link, cb) {

  if(cache[id]) {
    return cb(cache[id]);
  }

  chrome.runtime.sendMessage({
           method: 'POST',
           action: 'xhttp',
           contentType:'text/plain',
           url: 'http://localhost:8080/v2/summary',
           data: link,
         }, function(resp) {

        console.log('RESP', resp);
        cache[id] = resp;
        cb(resp);
  });
};


Api.prototype.getScores = function(links, cb) {
  console.log('LINKS', links);
  chrome.runtime.sendMessage({
                               method: 'POST',
                               action: 'xhttp',
                               url: 'http://localhost:8080/v2/detect',
                               contentType:'application/json',
                               data: JSON.stringify(links),
                             }, function(response) {

    cb(response);

    //console.log(reponseText);
  });


  /*
  setTimeout(function() {
    cb(links.map(link => { link.score = Math.random(); return link; }));
  }, 300);
  */

};


let api = new Api();


/* LINK parser */


let links = [];
let linksScored = {};
let allLinksTag = {};
let cleanLinks = [];
let cleanTags = {};

let fetchLinkAnalysis = function() {

  links = [...$('a')];
  console.log('Fetch all links');

  cleanLinks = links.map((link) => {
    let id = link.getAttribute('data-killer-id');
    if(!id) {
      id = parseInt(Math.random() * 10000000);
      link.setAttribute('data-killer-id', id);
    }

    return {
      href: link.href,
      text: link.innerText,
      id: parseInt(id),
    }
  }).filter(link => {
    return link.href && link.href.indexOf('javascript:') === -1
      && link.text && link.text.split(' ').length >= 4
      && !link.href.startsWith(originHref);
  });

  //Remote empty links (faceboo shit)
  links.forEach(link => {
    if(!link.text) {
      $(link).remove();
    }
  });

  console.log('Clean links', cleanLinks);

  cleanTags = cleanLinks.reduce((obj, subObj) => {
    obj[subObj.id] = subObj;
    return obj;
  }, {});


  let linksToSendForScoring = cleanLinks.filter(el => {
    return !linksScored[el.id]
  });


  api.getScores(linksToSendForScoring, function(scores) {
    console.log('SCORES', scores);

    scores.forEach(score => {

      linksScored[score.id] = score;

      if(score.score > 0.5) {
        updatLinkUI(score.id, score.score);
      }
    });

  });

};

fetchLinkAnalysis();
setInterval(fetchLinkAnalysis, 6000);


let killerPngSrc = chrome.extension.getURL('/images/killer.png');
let killerPngSrcBad = chrome.extension.getURL('/images/killer-bad.png');
let killerPngLaser = chrome.extension.getURL('/images/killer-laser.png');
let explosionPngSrc = chrome.extension.getURL('/images/explosion.gif');

let updatLinkUI = function(id, score) {

    let imgUrl = killerPngSrc;

    if(score >= 0.75) {
      imgUrl = killerPngSrcBad;
    }

    let $elem = $('[data-killer-id='+id+']');

    let $explosion = $('<img>', {
      src: explosionPngSrc,
      class:'explosion-icon',
      'data-id': id
    });

    $elem.prepend(
        $('<img>', {
          src: imgUrl,
          class:'killer-mini-icon',
          'data-id': id
        }), $explosion);

};


$.get(chrome.extension.getURL('/html/clickbait-killer.html'), function(data) {
  $(data).appendTo('body');
  // Or if you're using jQuery 1.8+:
  // $($.parseHTML(data)).appendTo('body');

  $('#killer-icon')[0].src = killerPngSrc;
  //$('#killer-icon-laser')[0].src = killerPngLaser;


  let $killerPopup = $('#killer-popup');
  let $summary = $('#summary');
  let $list = $('#list');

  function renderPopup(html, e) {

    //let red = parseInt(data.score * 255);
    let color = 'rgb('+150+', 150,150)';

    $summary.html(html);

    $killerPopup.css({
                       'border': '1px solid '+color,
                       'left': e.clientX,
                       'top': e.clientY+15
    }).show();

  }

  function hidePopup() {
    $killerPopup.hide();
  }


  /* API requests */

  $(document.body).on('mouseover', '.killer-mini-icon', function(e) {
    let id = $(this).attr('data-id');

    let linkAnalysed = linksScored[id];

    $('.explosion-icon[data-id='+id+']').show();

    (function(linkAnalysed) {
      api.getInfo(linkAnalysed.id, linkAnalysed.href, function(html) {

        renderPopup(html, e);
      });
    }(linkAnalysed));
  });

  $(document.body).on('mouseleave', '.killer-mini-icon', function(e) {
    hidePopup();
    $('.explosion-icon').hide();
  });


  let animateKiller = function() {
    let left = parseInt(Math.random()*100);
    let top = parseInt(Math.random()*100);
    let duration = parseInt(Math.random()*10000) + 2000;

    let width = (Math.random() + 0.8) * 50;
    let deg = parseInt(-60 + Math.random() * 120);

    let opacity = Math.random() < 0.3 ? 0 : 1;

    if(opacity == 0) {
      duration = 1500;
    }

    console.log('Animation duration', duration);

    $('#killer-icon').css({
      left:left+"%", top: top+"%", 'transform': 'rotate('+deg+'deg)', opacity:opacity, width: width, transition: 'all '+duration/1000+'s'
    });


    setTimeout(function() {
      animateKiller();
    }, duration);

  };

  animateKiller();

});
