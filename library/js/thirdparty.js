/*
Third party scrips
*/



/**
 * AnchorJS - v1.3.0 - 2015-09-22
 * https://github.com/bryanbraun/anchorjs
 * Copyright (c) 2015 Bryan Braun; Licensed MIT
 */

function AnchorJS(options) {
  'use strict';

  this.options = options || {};

  this._applyRemainingDefaultOptions = function(opts) {
    this.options.icon = this.options.hasOwnProperty('icon') ? opts.icon : '\ue9cb'; // Accepts characters (and also URLs?), like  '#', '¶', '❡', or '§'.
    this.options.visible = this.options.hasOwnProperty('visible') ? opts.visible : 'hover'; // Also accepts 'always'
    this.options.placement = this.options.hasOwnProperty('placement') ? opts.placement : 'right'; // Also accepts 'left'
    this.options.class = this.options.hasOwnProperty('class') ? opts.class : ''; // Accepts any class name.
  };

  this._applyRemainingDefaultOptions(options);

  this.add = function(selector) {
    var elements,
        elsWithIds,
        idList,
        elementID,
        i,
        roughText,
        tidyText,
        index,
        count,
        newTidyText,
        readableID,
        anchor;

    this._applyRemainingDefaultOptions(this.options);

    // Provide a sensible default selector, if none is given.
    if (!selector) {
      selector = 'h1, h2, h3, h4, h5, h6';
    } else if (typeof selector !== 'string') {
      throw new Error('The selector provided to AnchorJS was invalid.');
    }

    elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      return false;
    }

    this._addBaselineStyles();

    // We produce a list of existing IDs so we don't generate a duplicate.
    elsWithIds = document.querySelectorAll('[id]');
    idList = [].map.call(elsWithIds, function assign(el) {
      return el.id;
    });

    for (i = 0; i < elements.length; i++) {

      if (elements[i].hasAttribute('id')) {
        elementID = elements[i].getAttribute('id');
      } else {
        roughText = elements[i].textContent;

        // Refine it so it makes a good ID. Strip out non-safe characters, replace
        // spaces with hyphens, truncate to 32 characters, and make toLowerCase.
        //
        // Example string:                                // '⚡⚡⚡ Unicode icons are cool--but they definitely don't belong in a URL fragment.'
        tidyText = roughText.replace(/[^\w\s-]/gi, '')    // ' Unicode icons are cool--but they definitely dont belong in a URL fragment'
                                .replace(/\s+/g, '-')     // '-Unicode-icons-are-cool--but-they-definitely-dont-belong-in-a-URL-fragment'
                                .replace(/-{2,}/g, '-')   // '-Unicode-icons-are-cool-but-they-definitely-dont-belong-in-a-URL-fragment'
                                .substring(0, 64)         // '-Unicode-icons-are-cool-but-they-definitely-dont-belong-in-a-URL'
                                .replace(/^-+|-+$/gm, '') // 'Unicode-icons-are-cool-but-they-definitely-dont-belong-in-a-URL'
                                .toLowerCase();           // 'unicode-icons-are-cool-but-they-definitely-dont-belong-in-a-url'

        // Compare our generated ID to existing IDs (and increment it if needed)
        // before we add it to the page.
        newTidyText = tidyText;
        count = 0;
        do {
          if (index !== undefined) {
            newTidyText = tidyText + '-' + count;
          }
          // .indexOf is supported in IE9+.
          index = idList.indexOf(newTidyText);
          count += 1;
        } while (index !== -1);
        index = undefined;
        idList.push(newTidyText);

        // Assign it to our element.
        // Currently the setAttribute element is only supported in IE9 and above.
        elements[i].setAttribute('id', newTidyText);

        elementID = newTidyText;
      }

      readableID = elementID.replace(/-/g, ' ');

      // The following code builds the following DOM structure in a more effiecient (albeit opaque) way.
      // '<a class="anchorjs-link ' + this.options.class + '" href="#' + elementID + '" aria-label="Anchor link for: ' + readableID + '" data-anchorjs-icon="' + this.options.icon + '"></a>';
      anchor = document.createElement('a');
      anchor.className = 'anchorjs-link ' + this.options.class;
      anchor.href = '#' + elementID;
      anchor.setAttribute('aria-label', 'Anchor link for: ' + readableID);
      anchor.setAttribute('data-anchorjs-icon', this.options.icon);

      if (this.options.visible === 'always') {
        anchor.style.opacity = '1';
      }

      if (this.options.icon === '\ue9cb') {
        anchor.style.fontFamily = 'anchorjs-icons';
        anchor.style.fontStyle = 'normal';
        anchor.style.fontVariant = 'normal';
        anchor.style.fontWeight = 'normal';
        anchor.style.lineHeight = 1;
        // We set lineHeight = 1 here because the `anchorjs-icons` font family could otherwise affect the
        // height of the heading. This isn't the case for icons with `placement: left`, so we restore
        // line-height: inherit in that case, ensuring they remain positioned correctly. For more info,
        // see https://github.com/bryanbraun/anchorjs/issues/39.
        if (this.options.placement === 'left') {
          anchor.style.lineHeight = 'inherit';
        }
      }

      if (this.options.placement === 'left') {
        anchor.style.position = 'absolute';
        anchor.style.marginLeft = '-1em';
        anchor.style.paddingRight = '0.5em';
        elements[i].insertBefore(anchor, elements[i].firstChild);
      } else { // if the option provided is `right` (or anything else).
        anchor.style.paddingLeft = '0.375em';
        elements[i].appendChild(anchor);
      }
    }

    return this;
  };

  this.remove = function(selector) {
    var domAnchor,
        elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
      domAnchor = elements[i].querySelector('.anchorjs-link');
      if (domAnchor) {
        elements[i].removeChild(domAnchor);
      }
    }
    return this;
  };

  this._addBaselineStyles = function() {
    // We don't want to add global baseline styles if they've been added before.
    if (document.head.querySelector('style.anchorjs') !== null) {
      return;
    }

    var style = document.createElement('style'),
        linkRule =
        ' .anchorjs-link {'                       +
        '   opacity: 0;'                          +
        '   text-decoration: none;'               +
        '   -webkit-font-smoothing: antialiased;' +
        '   -moz-osx-font-smoothing: grayscale;'  +
        ' }',
        hoverRule =
        ' *:hover > .anchorjs-link,'              +
        ' .anchorjs-link:focus  {'                +
        '   opacity: 1;'                          +
        ' }',
        anchorjsLinkFontFace =
        ' @font-face {'                           +
        '   font-family: "anchorjs-icons";'       +
        '   font-style: normal;'                  +
        '   font-weight: normal;'                 + // Icon from icomoon; 10px wide & 10px tall; 2 empty below & 4 above
        '   src: url(data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMg8SBTUAAAC8AAAAYGNtYXAWi9QdAAABHAAAAFRnYXNwAAAAEAAAAXAAAAAIZ2x5Zgq29TcAAAF4AAABNGhlYWQEZM3pAAACrAAAADZoaGVhBhUDxgAAAuQAAAAkaG10eASAADEAAAMIAAAAFGxvY2EAKACuAAADHAAAAAxtYXhwAAgAVwAAAygAAAAgbmFtZQ5yJ3cAAANIAAAB2nBvc3QAAwAAAAAFJAAAACAAAwJAAZAABQAAApkCzAAAAI8CmQLMAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADpywPA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAAAAAADAAAAAwAAABwAAQADAAAAHAADAAEAAAAcAAQAOAAAAAoACAACAAIAAQAg6cv//f//AAAAAAAg6cv//f//AAH/4xY5AAMAAQAAAAAAAAAAAAAAAQAB//8ADwABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAACADEARAJTAsAAKwBUAAABIiYnJjQ/AT4BMzIWFxYUDwEGIicmND8BNjQnLgEjIgYPAQYUFxYUBw4BIwciJicmND8BNjIXFhQPAQYUFx4BMzI2PwE2NCcmNDc2MhcWFA8BDgEjARQGDAUtLXoWOR8fORYtLTgKGwoKCjgaGg0gEhIgDXoaGgkJBQwHdR85Fi0tOAobCgoKOBoaDSASEiANehoaCQkKGwotLXoWOR8BMwUFLYEuehYXFxYugC44CQkKGwo4GkoaDQ0NDXoaShoKGwoFBe8XFi6ALjgJCQobCjgaShoNDQ0NehpKGgobCgoKLYEuehYXAAEAAAABAACiToc1Xw889QALBAAAAAAA0XnFFgAAAADRecUWAAAAAAJTAsAAAAAIAAIAAAAAAAAAAQAAA8D/wAAABAAAAAAAAlMAAQAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAACAAAAAoAAMQAAAAAACgAUAB4AmgABAAAABQBVAAIAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEADgAAAAEAAAAAAAIABwCfAAEAAAAAAAMADgBLAAEAAAAAAAQADgC0AAEAAAAAAAUACwAqAAEAAAAAAAYADgB1AAEAAAAAAAoAGgDeAAMAAQQJAAEAHAAOAAMAAQQJAAIADgCmAAMAAQQJAAMAHABZAAMAAQQJAAQAHADCAAMAAQQJAAUAFgA1AAMAAQQJAAYAHACDAAMAAQQJAAoANAD4YW5jaG9yanMtaWNvbnMAYQBuAGMAaABvAHIAagBzAC0AaQBjAG8AbgBzVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADEALgAwYW5jaG9yanMtaWNvbnMAYQBuAGMAaABvAHIAagBzAC0AaQBjAG8AbgBzYW5jaG9yanMtaWNvbnMAYQBuAGMAaABvAHIAagBzAC0AaQBjAG8AbgBzUmVndWxhcgBSAGUAZwB1AGwAYQByYW5jaG9yanMtaWNvbnMAYQBuAGMAaABvAHIAagBzAC0AaQBjAG8AbgBzRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format("truetype");' +
        ' }',
        pseudoElContent =
        ' [data-anchorjs-icon]::after {'          +
        '   content: attr(data-anchorjs-icon);'   +
        ' }',
        firstStyleEl;

    style.className = 'anchorjs';
    style.appendChild(document.createTextNode('')); // Necessary for Webkit.

    // We place it in the head with the other style tags, if possible, so as to
    // not look out of place. We insert before the others so these styles can be
    // overridden if necessary.
    firstStyleEl = document.head.querySelector('[rel="stylesheet"], style');
    if (firstStyleEl === undefined) {
      document.head.appendChild(style);
    } else {
      document.head.insertBefore(style, firstStyleEl);
    }

    style.sheet.insertRule(linkRule, style.sheet.cssRules.length);
    style.sheet.insertRule(hoverRule, style.sheet.cssRules.length);
    style.sheet.insertRule(pseudoElContent, style.sheet.cssRules.length);
    style.sheet.insertRule(anchorjsLinkFontFace, style.sheet.cssRules.length);
  };
}

var anchors = new AnchorJS();




/*!
 * headroom.js v0.7.0 - Give your page some headroom. Hide your header until you need it
 * Copyright (c) 2014 Nick Williams - http://wicky.nillia.ms/headroom.js
 * License: MIT
 */

!function(a,b){"use strict";function c(a){this.callback=a,this.ticking=!1}function d(b){return b&&"undefined"!=typeof a&&(b===a||b.nodeType)}function e(a){if(arguments.length<=0)throw new Error("Missing arguments in extend function");var b,c,f=a||{};for(c=1;c<arguments.length;c++){var g=arguments[c]||{};for(b in g)f[b]="object"!=typeof f[b]||d(f[b])?f[b]||g[b]:e(f[b],g[b])}return f}function f(a){return a===Object(a)?a:{down:a,up:a}}function g(a,b){b=e(b,g.options),this.lastKnownScrollY=0,this.elem=a,this.debouncer=new c(this.update.bind(this)),this.tolerance=f(b.tolerance),this.classes=b.classes,this.offset=b.offset,this.scroller=b.scroller,this.initialised=!1,this.onPin=b.onPin,this.onUnpin=b.onUnpin,this.onTop=b.onTop,this.onNotTop=b.onNotTop}var h={bind:!!function(){}.bind,classList:"classList"in b.documentElement,rAF:!!(a.requestAnimationFrame||a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame)};a.requestAnimationFrame=a.requestAnimationFrame||a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame,c.prototype={constructor:c,update:function(){this.callback&&this.callback(),this.ticking=!1},requestTick:function(){this.ticking||(requestAnimationFrame(this.rafCallback||(this.rafCallback=this.update.bind(this))),this.ticking=!0)},handleEvent:function(){this.requestTick()}},g.prototype={constructor:g,init:function(){return g.cutsTheMustard?(this.elem.classList.add(this.classes.initial),setTimeout(this.attachEvent.bind(this),100),this):void 0},destroy:function(){var a=this.classes;this.initialised=!1,this.elem.classList.remove(a.unpinned,a.pinned,a.top,a.initial),this.scroller.removeEventListener("scroll",this.debouncer,!1)},attachEvent:function(){this.initialised||(this.lastKnownScrollY=this.getScrollY(),this.initialised=!0,this.scroller.addEventListener("scroll",this.debouncer,!1),this.debouncer.handleEvent())},unpin:function(){var a=this.elem.classList,b=this.classes;(a.contains(b.pinned)||!a.contains(b.unpinned))&&(a.add(b.unpinned),a.remove(b.pinned),this.onUnpin&&this.onUnpin.call(this))},pin:function(){var a=this.elem.classList,b=this.classes;a.contains(b.unpinned)&&(a.remove(b.unpinned),a.add(b.pinned),this.onPin&&this.onPin.call(this))},top:function(){var a=this.elem.classList,b=this.classes;a.contains(b.top)||(a.add(b.top),a.remove(b.notTop),this.onTop&&this.onTop.call(this))},notTop:function(){var a=this.elem.classList,b=this.classes;a.contains(b.notTop)||(a.add(b.notTop),a.remove(b.top),this.onNotTop&&this.onNotTop.call(this))},getScrollY:function(){return void 0!==this.scroller.pageYOffset?this.scroller.pageYOffset:void 0!==this.scroller.scrollTop?this.scroller.scrollTop:(b.documentElement||b.body.parentNode||b.body).scrollTop},getViewportHeight:function(){return a.innerHeight||b.documentElement.clientHeight||b.body.clientHeight},getDocumentHeight:function(){var a=b.body,c=b.documentElement;return Math.max(a.scrollHeight,c.scrollHeight,a.offsetHeight,c.offsetHeight,a.clientHeight,c.clientHeight)},getElementHeight:function(a){return Math.max(a.scrollHeight,a.offsetHeight,a.clientHeight)},getScrollerHeight:function(){return this.scroller===a||this.scroller===b.body?this.getDocumentHeight():this.getElementHeight(this.scroller)},isOutOfBounds:function(a){var b=0>a,c=a+this.getViewportHeight()>this.getScrollerHeight();return b||c},toleranceExceeded:function(a,b){return Math.abs(a-this.lastKnownScrollY)>=this.tolerance[b]},shouldUnpin:function(a,b){var c=a>this.lastKnownScrollY,d=a>=this.offset;return c&&d&&b},shouldPin:function(a,b){var c=a<this.lastKnownScrollY,d=a<=this.offset;return c&&b||d},update:function(){var a=this.getScrollY(),b=a>this.lastKnownScrollY?"down":"up",c=this.toleranceExceeded(a,b);this.isOutOfBounds(a)||(a<=this.offset?this.top():this.notTop(),this.shouldUnpin(a,c)?this.unpin():this.shouldPin(a,c)&&this.pin(),this.lastKnownScrollY=a)}},g.options={tolerance:{up:0,down:0},offset:0,scroller:a,classes:{pinned:"headroom--pinned",unpinned:"headroom--unpinned",top:"headroom--top",notTop:"headroom--not-top",initial:"headroom"}},g.cutsTheMustard="undefined"!=typeof h&&h.rAF&&h.bind&&h.classList,a.Headroom=g}(window,document);

/*!
 * headroom.js v0.7.0 - Give your page some headroom. Hide your header until you need it
 * Copyright (c) 2014 Nick Williams - http://wicky.nillia.ms/headroom.js
 * License: MIT
 */

!function(a){a&&(a.fn.headroom=function(b){return this.each(function(){var c=a(this),d=c.data("headroom"),e="object"==typeof b&&b;e=a.extend(!0,{},Headroom.options,e),d||(d=new Headroom(this,e),d.init(),c.data("headroom",d)),"string"==typeof b&&d[b]()})},a("[data-headroom]").each(function(){var b=a(this);b.headroom(b.data())}))}(window.Zepto||window.jQuery);

//LazyLoad

!function(a,b,c,d){var e=a(b);a.fn.lazyload=function(f){function g(){var b=0;i.each(function(){var c=a(this);if(!j.skip_invisible||c.is(":visible"))if(a.abovethetop(this,j)||a.leftofbegin(this,j));else if(a.belowthefold(this,j)||a.rightoffold(this,j)){if(++b>j.failure_limit)return!1}else c.trigger("appear"),b=0})}var h,i=this,j={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:b,data_attribute:"original",skip_invisible:!0,appear:null,load:null,placeholder:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"};return f&&(d!==f.failurelimit&&(f.failure_limit=f.failurelimit,delete f.failurelimit),d!==f.effectspeed&&(f.effect_speed=f.effectspeed,delete f.effectspeed),a.extend(j,f)),h=j.container===d||j.container===b?e:a(j.container),0===j.event.indexOf("scroll")&&h.bind(j.event,function(){return g()}),this.each(function(){var b=this,c=a(b);b.loaded=!1,(c.attr("src")===d||c.attr("src")===!1)&&c.is("img")&&c.attr("src",j.placeholder),c.one("appear",function(){if(!this.loaded){if(j.appear){var d=i.length;j.appear.call(b,d,j)}a("<img />").bind("load",function(){var d=c.attr("data-"+j.data_attribute);c.hide(),c.is("img")?c.attr("src",d):c.css("background-image","url('"+d+"')"),c[j.effect](j.effect_speed),b.loaded=!0;var e=a.grep(i,function(a){return!a.loaded});if(i=a(e),j.load){var f=i.length;j.load.call(b,f,j)}}).attr("src",c.attr("data-"+j.data_attribute))}}),0!==j.event.indexOf("scroll")&&c.bind(j.event,function(){b.loaded||c.trigger("appear")})}),e.bind("resize",function(){g()}),/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)&&e.bind("pageshow",function(b){b.originalEvent&&b.originalEvent.persisted&&i.each(function(){a(this).trigger("appear")})}),a(c).ready(function(){g()}),this},a.belowthefold=function(c,f){var g;return g=f.container===d||f.container===b?(b.innerHeight?b.innerHeight:e.height())+e.scrollTop():a(f.container).offset().top+a(f.container).height(),g<=a(c).offset().top-f.threshold},a.rightoffold=function(c,f){var g;return g=f.container===d||f.container===b?e.width()+e.scrollLeft():a(f.container).offset().left+a(f.container).width(),g<=a(c).offset().left-f.threshold},a.abovethetop=function(c,f){var g;return g=f.container===d||f.container===b?e.scrollTop():a(f.container).offset().top,g>=a(c).offset().top+f.threshold+a(c).height()},a.leftofbegin=function(c,f){var g;return g=f.container===d||f.container===b?e.scrollLeft():a(f.container).offset().left,g>=a(c).offset().left+f.threshold+a(c).width()},a.inviewport=function(b,c){return!(a.rightoffold(b,c)||a.leftofbegin(b,c)||a.belowthefold(b,c)||a.abovethetop(b,c))},a.extend(a.expr[":"],{"below-the-fold":function(b){return a.belowthefold(b,{threshold:0})},"above-the-top":function(b){return!a.belowthefold(b,{threshold:0})},"right-of-screen":function(b){return a.rightoffold(b,{threshold:0})},"left-of-screen":function(b){return!a.rightoffold(b,{threshold:0})},"in-viewport":function(b){return a.inviewport(b,{threshold:0})},"above-the-fold":function(b){return!a.belowthefold(b,{threshold:0})},"right-of-fold":function(b){return a.rightoffold(b,{threshold:0})},"left-of-fold":function(b){return!a.rightoffold(b,{threshold:0})}})}(jQuery,window,document);

/*
 Sticky-kit v1.1.2 | WTFPL | Leaf Corcoran 2015 | http://leafo.net
*/
(function(){var t,i;t=this.jQuery||window.jQuery,i=t(window),t.fn.stick_in_parent=function(o){var s,e,n,r,c,l,a,p,u,d,f,h;for(null==o&&(o={}),h=o.sticky_class,l=o.inner_scrolling,f=o.recalc_every,d=o.parent,u=o.offset_top,p=o.spacer,n=o.bottoming,null==u&&(u=0),null==d&&(d=void 0),null==l&&(l=!0),null==h&&(h="is_stuck"),s=t(document),null==n&&(n=!0),r=function(o,e,r,c,a,g,k,m){var v,y,_,b,w,x,C,I,z,A,j,M;if(!o.data("sticky_kit")){if(o.data("sticky_kit",!0),w=s.height(),C=o.parent(),null!=d&&(C=C.closest(d)),!C.length)throw"failed to find stick parent";if(_=!1,v=!1,j=null!=p?p&&o.closest(p):t("<div />"),j&&j.css("position",o.css("position")),I=function(){var t,i,n;if(!m)return w=s.height(),t=parseInt(C.css("border-top-width"),10),i=parseInt(C.css("padding-top"),10),e=parseInt(C.css("padding-bottom"),10),r=C.offset().top+t+i,c=C.height(),_&&(_=!1,v=!1,null==p&&(o.insertAfter(j),j.detach()),o.css({position:"",top:"",width:"",bottom:""}).removeClass(h),n=!0),a=o.offset().top-(parseInt(o.css("margin-top"),10)||0)-u,g=o.outerHeight(!0),k=o.css("float"),j&&j.css({width:o.outerWidth(!0),height:g,display:o.css("display"),"vertical-align":o.css("vertical-align"),"float":k,"margin-right":"-100%"}),n?M():void 0},I(),g!==c)return b=void 0,x=u,A=f,M=function(){var t,d,y,z,M,Q;if(!m)return y=!1,null!=A&&(A-=1,0>=A&&(A=f,I(),y=!0)),y||s.height()===w||(I(),y=!0),z=i.scrollTop(),null!=b&&(d=z-b),b=z,_?(n&&(M=z+g+x>c+r,v&&!M&&(v=!1,o.css({position:"fixed",bottom:"",top:x}).trigger("sticky_kit:unbottom"))),a>z&&(_=!1,x=u,null==p&&(("left"===k||"right"===k)&&o.insertAfter(j),j.detach()),t={position:"",width:"",top:""},o.css(t).removeClass(h).trigger("sticky_kit:unstick")),l&&(Q=i.height(),g+u>Q&&(v||(x-=d,x=Math.max(Q-g,x),x=Math.min(u,x),_&&o.css({top:x+"px"}))))):z>a&&(_=!0,t={position:"fixed",top:x},t.width="border-box"===o.css("box-sizing")?o.outerWidth()+"px":o.width()+"px",o.css(t).addClass(h),null==p&&(o.after(j),("left"===k||"right"===k)&&j.append(o)),o.trigger("sticky_kit:stick")),_&&n&&(null==M&&(M=z+g+x>c+r),!v&&M)?(v=!0,"static"===C.css("position")&&C.css({position:"relative"}),o.css({position:"absolute",bottom:e,top:"auto"}).trigger("sticky_kit:bottom")):void 0},z=function(){return I(),M()},y=function(){return m=!0,i.off("touchmove",M),i.off("scroll",M),i.off("resize",z),t(document.body).off("sticky_kit:recalc",z),o.off("sticky_kit:detach",y),o.removeData("sticky_kit"),o.css({position:"",bottom:"",top:"",width:""}),C.position("position",""),_?(null==p&&(("left"===k||"right"===k)&&o.insertAfter(j),j.remove()),o.removeClass(h)):void 0},i.on("touchmove",M),i.on("scroll",M),i.on("resize",z),t(document.body).on("sticky_kit:recalc",z),o.on("sticky_kit:detach",y),setTimeout(M,0)}},c=0,a=this.length;a>c;c++)e=this[c],r(t(e));return this}}).call(this);