'use strict';

console.log('Hello content script');

let originHref = 'https://artmyn.com/partners/cultural';


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

let imgLink = cleanLinks.find(link => {
  return link.href.indexOf('imgur') !== -1;
});

console.log(cleanLinks);
console.log(imgLink);


$.get(chrome.extension.getURL('/html/clickbait-killer.html'), function(data) {
  $(data).appendTo('body');
  // Or if you're using jQuery 1.8+:
  // $($.parseHTML(data)).appendTo('body');
});