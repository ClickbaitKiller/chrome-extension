'use strict';



let originHref = 'https://artmyn.com/partners/cultural';

/*
* API
* */


const Api = function() {

};


Api.prototype.getInfo = function(link) {
  let r = Math.random();
  let time = Math.random()*400;

  setTimeout(function() {

    if(r < 0.3) {
      return {
        score: 0.2,
        summary: '',
        list: [],
        id: link.id
      }
    } else if(r < 0.6) {
      return {
        score:0.8,
        summary:'10 Reasons why Britney spears cut her hair',
        list: ['She sucks', 'She sucks hard', 'Fuck her'],
        id: link.id
      }
    } else {
      return {
        score:0.7,
        summary:"Summary of link",
        id: link.id
      }
    }
  }, time);

};


let api = new Api();


/* LINK parser */


let links = [...document.body.getElementsByTagName("a")];

console.log(links);

let cleanLinks = links.map((link, i) => {
  return {
    href: link.href,
    text: link.innerText,
    index: i
  }
}).filter(link => {
  return link.href.indexOf('javascript:') === -1 && link.text && link.href !== originHref;
});

let linkAnalysed = [];
cleanLinks.forEach(link => {
  api.getInfo(link, function(linkInfo) {
    linkAnalysed.push(linkInfo);
  })
});

setTimeout(function() {
  console.log(linkAnalysed);
}, 2000);

let imgLink = cleanLinks.find(link => {
  return link.href.indexOf('imgur') !== -1;
});

console.log(cleanLinks);
console.log(imgLink);


$.get(chrome.extension.getURL('/html/clickbait-killer.html'), function(data) {
  $(data).appendTo('body');
  // Or if you're using jQuery 1.8+:
  // $($.parseHTML(data)).appendTo('body');

  $('#killer-icon')[0].src = chrome.extension.getURL('/images/killer.png');
});