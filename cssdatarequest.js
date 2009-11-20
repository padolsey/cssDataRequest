/***
 * @author James Padolsey
 * @copyright Copyright (c) 2009 James Padolsey
 * @license http://www.apache.org/licenses/LICENSE-2.0.html
 * @version 0.2
 */

var cssDataRequest = (function(){
    
    function getStyle(elem, prop) {
        return document.defaultView && document.defaultView.getComputedStyle ?
             document.defaultView.getComputedStyle(elem, null)[prop]
            : elem.currentStyle && elem.currentStyle[prop];
    }
    
    function getContent(dataEl, url) {
        
        var content = getStyle(dataEl, 'content');
        
        if (content) { return content; }
        
        try {
            
            var styleSheets = document.styleSheets || [],
                i = 0, ss;
            
            while ( (ss = styleSheets[i++]) ) {
                
                if ( ss.href !== url ) { continue; }
                
                if ( ss.cssRules && ss.cssRules[0] ) {
                    
                    /* WebKit */
                    return ss.cssRules[0].style.content;
                    
                } else {
                    
                    /* IE */
                    return (ss.cssText.match(/CONTENT\s*:\s*('|")((?:\\\1|[^\1])+)\1/i)||[,,''])[2];
                    
                }
            }
            
        } catch(e) {
            
            /* Throws error in FF<3 = SECURITY ERROR */
            var ff = getStyle(dataEl, 'fontFamily');
            return cssDataRequest.FF2 ? ff.indexOf('data') === 1 ? ff.replace(/data/,'') : null : '';
            
        }
        
        return '';
        
    }
    
    var head = document.getElementsByTagName('head')[0],
        body = document.body;
    
    return function cssDataRequest(url, callback) {
        
        var dataEl = document.createElement('data'),
            link = document.createElement('link'),
            timer, attempts = 0;
            
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        
        dataEl.style.display = 'none';
        head.appendChild(link);
        body.appendChild(dataEl);
        
        timer = setInterval(function(){
            
            var content = getContent(dataEl, url);
            
            if (attempts++ > 100) {
                clearInterval(timer);
                return;
            }
            
            if (content && content !== 'none') {
                
                clearInterval(timer);
                
                /* Rectify escaping inconsistencies */
                
                content = content.replace(/^['"]/, '').replace(/['"]$/, '');
                
                if ( !/[^\\]"/.test(content) ) {
                    /* There are no non-escaped quotes */
                    content = content.replace(/\\"/g,'"');
                }
                
                content = content.replace(/([^\\])\\\\(["\\\/bfnrt]|u.{3})/g, '$1\\$2');
                
                body.removeChild(dataEl);
                head.removeChild(link);
                
                callback(content);
            }
            
        }, 100);
        
        return true;
        
    };
    
})();