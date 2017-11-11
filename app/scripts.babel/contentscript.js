'use strict';



let originHref = location.href;

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


  $.ajax({
        url: 'http://localhost:8888/info/'+id,
        method:'POST',
        dataType:'application/json',
        data: {id:id, link:link},
        success: function(data) {
          cb(data);
        },
        error: function() {
          console.log('Cant get info '+id);
        }
   });

  chrome.runtime.sendMessage({
           method: 'POST',
           action: 'xhttp',
           url: 'http://localhost:8888/info/'+id,
           data: {id:id, link:link},
         }, function(reponseText) {
            alert(reponseText);
          });


  setTimeout(function() {

      let resp = {
        html: "<h2>Hello + "+parseInt(Math.random()*1000)+"</h2> <p>On se met bien</p>"
      };

      cache[id] = resp;

      cb(resp);

    }, Math.random()*400);
};


Api.prototype.getScores = function(links, cb) {

  $.ajax({
     url: 'http://localhost:8888/scores',
     method:'POST',
     dataType:'application/json',
     data: links,
     success: function(data) {
       cb(data);
     },
    error: function() {
       console.log('Cant get scores');
    }
   });


  setTimeout(function() {
    cb(links.map(link => { link.score = Math.random(); return link; }));
  }, 300);

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
      id: id,
    }
  }).filter(link => {
    return link.href && link.href.indexOf('javascript:') === -1 && link.text && !link.href.startsWith('/') && link.href !== originHref+'#';
  });

  cleanTags = cleanLinks.reduce((obj, subObj) => {
    obj[subObj.id] = subObj;
    return obj;
  }, {});


  let linksToSendForScoring = cleanLinks.filter(el => {
    return !linksScored[el.id]
  });


  api.getScores(linksToSendForScoring, function(scores) {
    scores.forEach(score => {

      linksScored[score.id] = score;

      if(score.score > 0.5) {
        updatLinkUI(score.id, score.score);
      }
    });

  });

};

fetchLinkAnalysis();
setInterval(fetchLinkAnalysis, 4000);


let killerPngSrc = chrome.extension.getURL('/images/killer.png');
let killerPngSrcBad = chrome.extension.getURL('/images/killer-bad.png');
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


  let $killerPopup = $('#killer-popup');
  let $summary = $('#summary');
  let $list = $('#list');

  function renderPopup(data, e) {

    let red = parseInt(data.score * 255);
    let color = 'rgb('+red+', 150,150)';

    $summary.html(data.html);

    if(data.list && data.list.length > 0) {
      $list.html(data.list.map(text => { return $('<li>').text(text); })).fadeIn();
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

    let linkAnalysed = linksScored[id];

    $('.explosion-icon[data-id='+id+']').show();

    (function(linkAnalysed) {
      api.getInfo(linkAnalysed.id, linkAnalysed.href, function(info) {

        info.score = linkAnalysed.score;

        renderPopup(info, e);
      });
    }(linkAnalysed));
  });

  $(document.body).on('mouseleave', '.killer-mini-icon', function(e) {
    hidePopup();
    $('.explosion-icon').hide();
  });


});
