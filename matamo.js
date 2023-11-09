
var _paq = window._paq = window._paq || [];
_paq.push([ 'trackPageView' ]);
_paq.push([ 'enableLinkTracking' ]);
(function() {
var u = "https://piwik.domainepublic.net/";
_paq.push([ 'setTrackerUrl', u + 'piwik.php' ]);
_paq.push([ 'setSiteId', '170' ]);
var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
g.async = true;
g.src = u + 'piwik.js';
s.parentNode.insertBefore(g, s);
})();

var matamo_lasturl = null;

window.addEventListener('pagechange', function(e) {
  if(matamo_lasturl) {
    _paq.push([ 'setReferrerUrl', matamo_lasturl ]);
  }
  const newurl = e.detail;
  _paq.push([ 'setCustomUrl', newurl ]);
  // _paq.push([ 'setDocumentTitle', 'title goes here' ]);
  _paq.push([ 'trackPageView' ]);
  matamo_lasturl = newurl;
});
