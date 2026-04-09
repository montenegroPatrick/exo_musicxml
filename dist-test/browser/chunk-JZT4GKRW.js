import{i as pn,l as hn}from"./chunk-ZAYGJQTG.js";import{k as ln,l as cn,m as dn,o as Z,s as oe,t as un}from"./chunk-Q7IWVWVU.js";import{$ as Qt,$a as O,Ab as Jt,Ac as sn,Bb as te,Cb as Je,Eb as tn,Ec as x,Fc as an,Hb as en,Jb as U,Kb as dt,La as A,Lb as ut,Mb as _t,Oa as qe,Ob as xt,P as E,Pb as It,Q,Qa as Ye,Qb as ve,Ra as Qe,S as ze,Sb as nn,U as m,Ub as on,V as Ge,Vb as ee,Xa as j,Xb as H,Ya as X,Yb as ne,Za as F,Zb as ie,ba as Ke,bb as ct,ca as nt,db as Zt,eb as Xe,ec as L,f as Yt,ga as w,gc as Se,jb as Ze,ka as he,la as S,na as Xt,nb as it,ra as mt,sc as rn,tb as P,tc as pt,ub as me,uc as Ot,vb as fe,wb as Tt,xb as be,xc as q,yb as ge,zb as ye,zc as Ce}from"./chunk-EVENO5MT.js";import{a as _,b as Ve,m as v}from"./chunk-QUXI33BQ.js";var Oi=Object.defineProperty,Pi=(e,i,t)=>i in e?Oi(e,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[i]=t,ft=(e,i,t)=>Pi(e,typeof i!="symbol"?i+"":i,t);if(typeof window.postMessage>"u")throw new Error("The Flat Embed JS API is not supported in this browser");var we=class{constructor(i){ft(this,"embed"),ft(this,"promises"),ft(this,"eventCallbacks"),this.embed=i,this.promises={},this.eventCallbacks={}}pushCall(i,t,n){this.promises[i]=this.promises[i]||[],this.promises[i].push({resolve:t,reject:n})}subscribeEvent(i,t){return this.eventCallbacks[i]=this.eventCallbacks[i]||[],this.eventCallbacks[i].push(t),this.eventCallbacks[i].length===1}unsubscribeEvent(i,t){if(!this.eventCallbacks[i])return!1;if(t){let n=this.eventCallbacks[i].indexOf(t);n>=0&&this.eventCallbacks[i].splice(n,1)}else this.eventCallbacks[i]=[];return!t||this.eventCallbacks[i].length===0}process(i){"method"in i&&i.method?this.processMethodResponse(i):"event"in i&&i.event&&this.processEvent(i)}processMethodResponse(i){if(!this.promises[i.method])return;let t=this.promises[i.method].shift();t&&(i.error?t.reject(i.error):t.resolve(i.response))}processEvent(i){!this.eventCallbacks[i.event]||this.eventCallbacks[i.event].length===0||this.eventCallbacks[i.event].forEach(t=>{t.call(this.embed,i.parameters)})}};function mn(e,i,t){if(!e.element.contentWindow||!e.element.contentWindow.postMessage)throw new Error("No `contentWindow` or `contentWindow.postMessage` available on the element");let n={method:i,parameters:t};e.element.contentWindow.postMessage(n,e.origin)}function ki(e){return typeof e=="string"&&(e=JSON.parse(e)),e}function Ni(e){if(typeof e=="string"){let i=document.getElementById(e);if(!i)throw new TypeError(`The DOM element with the identifier "${e}" was not found.`);e=i}if(!(e instanceof window.HTMLElement))throw new TypeError("The first parameter must be an existing DOM element or an identifier.");if(e.nodeName!=="IFRAME"){let i=e.querySelector("iframe");i&&(e=i)}return e}function Ai(e){let i=e.baseUrl||"https://flat-embed.com";e.isCustomUrl||(i+=`/${e.score||"blank"}`);let t=Object.assign({jsapi:!0},e.embedParams),n=Object.keys(t).map(o=>`${encodeURIComponent(o)}=${encodeURIComponent(t[o])}`).join("&");return`${i}?${n}`}function Li(e,i){let t=Ai(i),n=document.createElement("iframe");return n.setAttribute("src",t),n.setAttribute("width",i.width||"100%"),n.setAttribute("height",i.height||"100%"),n.setAttribute("allowfullscreen","true"),n.setAttribute("allow","autoplay; midi"),n.setAttribute("frameborder","0"),i.lazy&&n.setAttribute("loading","lazy"),e.appendChild(n),n}var Ee=new WeakMap,fn=new WeakMap,re=class{constructor(i,t={}){ft(this,"origin","*"),ft(this,"element"),ft(this,"embedCallback");let n=Ni(i);if(n instanceof HTMLIFrameElement&&Ee.has(n))return Ee.get(n);let o;n.nodeName!=="IFRAME"?o=Li(n,t):o=n,this.element=o,this.embedCallback=new we(this);let r=new Promise(s=>{let a=l=>{if(this.element.contentWindow!==l.source)return;this.origin==="*"&&(this.origin=l.origin);let c=ki(l.data);if(c.event==="ready"||c.method==="ping"){s();return}this.embedCallback.process(c)};window.addEventListener("message",a,!1),mn(this,"ping")});return Ee.set(this.element,this),fn.set(this.element,r),this}ready(){return fn.get(this.element)||Promise.resolve()}call(i,t={}){return new Promise((n,o)=>this.ready().then(()=>{this.embedCallback.pushCall(i,n,o),mn(this,i,t)}))}on(i,t){if(typeof i!="string")throw new TypeError("An event name (string) is required");if(typeof t!="function")throw new TypeError("An callback (function) is required");this.embedCallback.subscribeEvent(i,t)&&this.call("addEventListener",i).catch(()=>{})}off(i,t){if(typeof i!="string")throw new TypeError("An event name (string) is required");this.embedCallback.unsubscribeEvent(i,t)&&this.call("removeEventListener",i).catch(()=>{})}loadFlatScore(i){return typeof i=="string"&&(i={score:i}),this.call("loadFlatScore",i)}loadMusicXML(i){return this.call("loadMusicXML",i)}loadMIDI(i){return this.call("loadMIDI",i)}loadJSON(i){return this.call("loadJSON",i)}getJSON(){return this.call("getJSON")}getMusicXML(i){return new Promise((t,n)=>{if(i=i||{},typeof i!="object")return n(new TypeError("Options must be an object"));this.call("getMusicXML",i).then(o=>t(typeof o=="string"?o:new Uint8Array(o))).catch(n)})}getPNG(i){return new Promise((t,n)=>{if(i=i||{},typeof i!="object")return n(new TypeError("Options must be an object"));this.call("getPNG",i).then(o=>{if(typeof o=="string")return t(o);t(new Uint8Array(o))}).catch(n)})}getMIDI(){return this.call("getMIDI").then(i=>new Uint8Array(i))}getFlatScoreMetadata(){return this.call("getFlatScoreMetadata")}getEmbedConfig(){return this.call("getEmbedConfig")}setEditorConfig(i){return this.call("setEditorConfig",i)}fullscreen(i){return this.call("fullscreen",i)}play(){return this.call("play")}pause(){return this.call("pause")}stop(){return this.call("stop")}mute(){return this.call("mute")}getMasterVolume(){return this.call("getMasterVolume")}setMasterVolume(i){return this.call("setMasterVolume",i)}getPartVolume(i){return this.call("getPartVolume",i)}setPartVolume(i){return this.call("setPartVolume",i)}mutePart(i){return this.call("mutePart",i)}unmutePart(i){return this.call("unmutePart",i)}setPartSoloMode(i){return this.call("setPartSoloMode",i)}unsetPartSoloMode(i){return this.call("unsetPartSoloMode",i)}getPartSoloMode(i){return this.call("getPartSoloMode",i)}getPartReverb(i){return this.call("getPartReverb",i)}setPartReverb(i){return this.call("setPartReverb",i)}setTrack(i){return this.call("setTrack",i)}useTrack(i){return this.call("useTrack",i)}seekTrackTo(i){return this.call("seekTrackTo",i)}print(){return this.call("print")}getZoom(){return this.call("getZoom")}setZoom(i){return this.call("setZoom",i)}getAutoZoom(){return this.call("getAutoZoom")}setAutoZoom(i){return this.call("setAutoZoom",i)}focusScore(){return this.call("focusScore")}getCursorPosition(){return this.call("getCursorPosition")}setCursorPosition(i){return this.call("setCursorPosition",i)}getParts(){return this.call("getParts")}getDisplayedParts(){return this.call("getDisplayedParts")}setDisplayedParts(i){return this.call("setDisplayedParts",i)}getNbMeasures(){return this.call("getNbMeasures")}getMeasuresUuids(){return this.call("getMeasuresUuids")}getMeasureDetails(){return this.call("getMeasureDetails")}getNbParts(){return this.call("getNbParts")}getPartsUuids(){return this.call("getPartsUuids")}getMeasureVoicesUuids(i){return this.call("getMeasureVoicesUuids",i)}getMeasureNbNotes(i){return this.call("getMeasureNbNotes",i)}getNoteData(i){return this.call("getNoteData",i)}playbackPositionToNoteIdx(i){return this.call("playbackPositionToNoteIdx",i)}getNoteDetails(){return this.call("getNoteDetails")}goLeft(i=!1){return this.call("goLeft",{mute:i})}goRight(i=!1){return this.call("goRight",{mute:i})}getMetronomeMode(){return this.call("getMetronomeMode")}setMetronomeMode(i){return this.call("setMetronomeMode",{mode:i})}getPlaybackSpeed(){return this.call("getPlaybackSpeed")}setPlaybackSpeed(i){return this.call("setPlaybackSpeed",{speed:i})}scrollToCursor(){return this.call("scrollToCursor")}};var bn=class e{_lessonService=m(hn);embed;playCallbacks=new Set;pauseCallbacks=new Set;stopCallbacks=new Set;cursorPositionCallbacks=new Set;rangeSelectionCallbacks=new Set;_isReady=w(!1);_currentMeasureIdx=w(0);_isPlaying=w(!1);_isInitialized=w(!1);isReady=this._isReady.asReadonly();currentMeasureIdx=this._currentMeasureIdx.asReadonly();isPlaying=this._isPlaying.asReadonly();lessonJson=pt(()=>this._lessonService.lessonJson());diapoType=pt(()=>this._lessonService.diapoType());originalSyncPoints=pt(()=>this._lessonService.syncPoints());syncPoints=w([]);totalTime=w(0);measuresUuids=w([]);nbMeasures=w(0);measurePoints=w([]);measureDetails=w(null);measureNotesCache=new Map;loopMode=w(!1);loopStart=w(null);loopEnd=w(null);_currentSpeed=w(1);currentSpeed=this._currentSpeed.asReadonly();initEmbed(n){return v(this,arguments,function*(i,t={}){this.embed&&this.destroyEmbed();let o=window.innerWidth;this.embed=new re(i,{embedParams:{appId:pn.FLAT_APP_ID,controlsDisplay:!1,playbackMetronome:"inactive",themeControlsBackground:"#afc638",themeSelection:"transparent",controlsPlay:!1,branding:!1,playbackVolumeMaster:0,noAudio:!0,layout:"responsive",zoom:o>800?"auto":1,displayFirstLinePartsNames:!1,hideTempo:!0,controlsPrint:!0}}),console.log("[FlatService]:initEmbed => init",this.diapoType()),this.diapoType()==="xml"&&(console.log("[FlatService]:initEmbed => init xml",this.diapoType()),this.initSyncPoints())})}initSyncPoints(){let i=this.originalSyncPoints();!i||i.length===0||(this.syncPoints.set(i),this.totalTime.set(i[i.length-1].time))}setTrack(){return v(this,null,function*(){console.log("[FlatService]:setTrack => init",this.syncPoints()),yield this.embed?.setTrack({id:"external-1",type:"external",synchronizationPoints:this.syncPoints(),totalTime:this.totalTime()}),console.log("[FlatService]:setTrack => finish",this.syncPoints())})}useTrack(){return v(this,null,function*(){console.log("[FlatService]:useTrack => init"),yield this.embed?.useTrack({id:"external-1"}),console.log("[FlatService]:useTrack => finish")})}loadMusicXML(i){return v(this,null,function*(){if(!this.embed)throw new Error("Embed not initialized. Call initEmbed first.");yield this.embed.loadMusicXML(i).then(()=>{this._isReady.set(!0)})})}destroyEmbed(){this.embed&&(this.embed=void 0,this._isReady.set(!1),this._isPlaying.set(!1),this._isInitialized.set(!1),this._currentMeasureIdx.set(0),this._currentSpeed.set(1),this.playCallbacks.clear(),this.pauseCallbacks.clear(),this.stopCallbacks.clear(),this.cursorPositionCallbacks.clear(),this.rangeSelectionCallbacks.clear(),this.measuresUuids.set([]),this.nbMeasures.set(0),this.measurePoints.set([]),this.measureDetails.set(null),this.measureNotesCache.clear(),this.loopStart.set(null),this.loopEnd.set(null))}goToMeasure(i){return v(this,null,function*(){yield this.embed?.goToMeasure?.(i),this._currentMeasureIdx.set(i)})}play(){return v(this,null,function*(){this.isPlaying()&&(yield this.embed?.pause()),yield this.embed?.play()})}pause(){return v(this,null,function*(){yield this.embed?.pause()})}stop(){return v(this,null,function*(){yield this.embed?.stop()})}setPlaybackSpeed(i){return v(this,null,function*(){yield this.embed?.setPlaybackSpeed(i)})}setMasterVolume(i){return v(this,null,function*(){yield this.embed?.setMasterVolume({volume:i})})}setPartVolume(i,t){return v(this,null,function*(){yield this.embed?.setPartVolume({partUuid:i,volume:t})})}getPartVolume(i){return v(this,null,function*(){return yield this.embed?.getPartVolume({partUuid:i})})}setMetronomeMode(i){return v(this,null,function*(){yield this.embed?.setMetronomeMode(i)})}seekTrackTo(i){return v(this,null,function*(){this._isPlaying()||(yield this.play()),yield this.embed?.seekTrackTo({time:i}).catch(t=>{console.error("[FlatService]:seekTrackTo => catch error",t)}),this.pause()})}getNbMeasures(){return v(this,null,function*(){return yield this.embed?.getNbMeasures()})}getMeasureDetails(){return v(this,null,function*(){return yield this.embed?.getMeasureDetails()})}getParts(){return v(this,null,function*(){return yield this.embed?.getParts()})}onPlay(i){return this.playCallbacks.add(i),()=>this.playCallbacks.delete(i)}onPause(i){return this.pauseCallbacks.add(i),()=>this.pauseCallbacks.delete(i)}onStop(i){return this.stopCallbacks.add(i),()=>this.stopCallbacks.delete(i)}onCursorPosition(i){return this.cursorPositionCallbacks.add(i),()=>this.cursorPositionCallbacks.delete(i)}onRangeSelection(i){return this.rangeSelectionCallbacks.add(i),()=>this.rangeSelectionCallbacks.delete(i)}on(i,t){this.embed?.on(i,t)}getEmbed(){return this.embed}setupEventListeners(){this.embed&&(this.embed.on("play",()=>{this._isPlaying()||this.isReady()&&(this.loopMode()&&this.embed?.seekTrackTo({time:this.loopStart()}),this._isPlaying.set(!0),this.playCallbacks.forEach(i=>i()))}),this.embed.on("pause",()=>{this._isPlaying()&&(this._isPlaying.set(!1),this.pauseCallbacks.forEach(i=>i()))}),this.embed.on("stop",()=>{this._isPlaying.set(!1),this.stopCallbacks.forEach(i=>i())}),this.embed.on("ready",()=>{this._isReady.set(!0)}),this.embed.on("cursorPosition",(i=>v(this,null,function*(){if(!this._isInitialized()){this._isInitialized.set(!0);return}this.loopMode()&&this.loopMode.set(!1),this.embed?.pause(),this.cursorPositionCallbacks.forEach(t=>t(i))}))),this.embed.on("rangeSelection",(i=>v(this,null,function*(){if(!i){this.loopMode.set(!1),this.loopStart.set(null),this.loopEnd.set(null),this.rangeSelectionCallbacks.forEach(o=>o(null));return}this.loopMode.set(!0);let t=yield this.findTimeByMeasure(i.left,!1),n=yield this.findTimeByMeasure(i.right,!0);this.loopStart.set(t),this.loopEnd.set(n),this.rangeSelectionCallbacks.forEach(o=>o(i)),this.isPlaying()&&this.embed?.pause()}))))}initializeMeasureData(){return v(this,null,function*(){if(this.embed)try{let i=yield this.embed.getMeasuresUuids();this.measuresUuids.set(i),this.nbMeasures.set(i.length-1);let t=yield this.embed.getMeasureDetails();this.measureDetails.set(t),this.calculateMeasurePoints(),console.log("[FlatService]:initializeMeasureData => completed",{nbMeasures:this.nbMeasures(),measurePoints:this.measurePoints().length})}catch(i){console.error("[FlatService]:initializeMeasureData => error",i)}})}calculateMeasurePoints(){let i=[],t=this.syncPoints();if(t.length<2){this.measurePoints.set(i);return}let n=t[t.length-1].time;for(let o=0;o<t.length-1;o++){let r=t[o],s=t[o+1],a=r.time,l,c;s.type==="end"?(l=this.nbMeasures()-r.location.measureIdx,c=(n-r.time)/l):(l=s.location.measureIdx-r.location.measureIdx,c=(s.time-r.time)/l);for(let d=0;d<l;d++)i.push(c*d+a)}this.measurePoints.set(i),console.log("[FlatService]:calculateMeasurePoints =>",i.length,"points")}findTimeByMeasure(i,t=!1){return v(this,null,function*(){let{measureUuid:n,noteIdx:o,voiceUuid:r,partUuid:s}=i,a=this.measuresUuids().findIndex(d=>d===n);if(a===-1)return console.warn("[FlatService]:findTimeByMeasure => measure not found"),null;let l=this.measurePoints();if(l.length===0)return null;let c=yield this.getNotesForMeasure(n,r,s);if(c.length>0){if(o===0&&!t)return l[a];let d=l[a],p=a<l.length-1?l[a+1]:l[a],u=c.length,h=(p-d)/u,b=(t?o+1:o)*h;return d+b}return l[a]})}getNotesForMeasure(i,t,n){return v(this,null,function*(){let o=`${i}-${t}-${n}`;if(this.measureNotesCache.has(o))return this.measureNotesCache.get(o);let r=[],s=0,a=50;for(;s<a;)try{let l=yield this.embed?.getNoteData({measureUuid:i,noteIdx:s,voiceUuid:t,partUuid:n});if(!l)break;r.push(l),s++}catch{break}return this.measureNotesCache.set(o,r),r})}reinitializeTrackWithSpeed(i){return v(this,null,function*(){if(!this.embed)throw new Error("Embed not initialized");let t=this.originalSyncPoints();if(!t||t.length===0)throw new Error("No original sync points available");yield this.embed.stop();let n=t[t.length-1].time,o=n/i,r=t.map(a=>Ve(_({},a),{time:a.time/i}));console.log("[FlatService]:reinitializeTrackWithSpeed =>",{speed:i,originalTotal:n,newTotalTime:o}),this.syncPoints.set(r),this.totalTime.set(o),this._currentSpeed.set(i);let s=`external-speed-${i}`;yield this.embed.setTrack({id:s,type:"external",totalTime:o,synchronizationPoints:r}),yield this.embed.useTrack({id:s}),yield this.embed.setPlaybackSpeed(i),this.calculateMeasurePoints(),console.log("[FlatService]:reinitializeTrackWithSpeed => completed")})}handleRangeSelection(i){return v(this,null,function*(){let t=yield this.findTimeByMeasure(i.left,!1),n=yield this.findTimeByMeasure(i.right,!0);if(t===null||n===null||t===n)return{start:null,end:null};let o=t>n?{start:n,end:t}:{start:t,end:n};return this.loopStart.set(o.start),this.loopEnd.set(o.end),o})}clearLoop(){this.loopStart.set(null),this.loopEnd.set(null)}toggleLoopMode(){let i=!this.loopMode();return this.loopMode.set(i),i}clearNotesCache(){this.measureNotesCache.clear()}getLoopBounds(){return{start:this.loopStart(),end:this.loopEnd()}}static \u0275fac=function(t){return new(t||e)};static \u0275prov=E({token:e,factory:e.\u0275fac,providedIn:"root"})};function bt(...e){if(e){let i=[];for(let t=0;t<e.length;t++){let n=e[t];if(!n)continue;let o=typeof n;if(o==="string"||o==="number")i.push(n);else if(o==="object"){let r=Array.isArray(n)?[bt(...n)]:Object.entries(n).map(([s,a])=>a?s:void 0);i=r.length?i.concat(r.filter(s=>!!s)):i}}return i.join(" ").trim()}}function yn(e,i){return e?e.classList?e.classList.contains(i):new RegExp("(^| )"+i+"( |$)","gi").test(e.className):!1}function J(e,i){if(e&&i){let t=n=>{yn(e,n)||(e.classList?e.classList.add(n):e.className+=" "+n)};[i].flat().filter(Boolean).forEach(n=>n.split(" ").forEach(t))}}function Mi(){return window.innerWidth-document.documentElement.offsetWidth}function vn(e){typeof e=="string"?J(document.body,e||"p-overflow-hidden"):(e!=null&&e.variableName&&document.body.style.setProperty(e.variableName,Mi()+"px"),J(document.body,e?.className||"p-overflow-hidden"))}function ot(e,i){if(e&&i){let t=n=>{e.classList?e.classList.remove(n):e.className=e.className.replace(new RegExp("(^|\\b)"+n.split(" ").join("|")+"(\\b|$)","gi")," ")};[i].flat().filter(Boolean).forEach(n=>n.split(" ").forEach(t))}}function Sn(e){typeof e=="string"?ot(document.body,e||"p-overflow-hidden"):(e!=null&&e.variableName&&document.body.style.removeProperty(e.variableName),ot(document.body,e?.className||"p-overflow-hidden"))}function Pt(e){for(let i of document?.styleSheets)try{for(let t of i?.cssRules)for(let n of t?.style)if(e.test(n))return{name:n,value:t.style.getPropertyValue(n).trim()}}catch{}return null}function Cn(e){let i={width:0,height:0};if(e){let[t,n]=[e.style.visibility,e.style.display];e.style.visibility="hidden",e.style.display="block",i.width=e.offsetWidth,i.height=e.offsetHeight,e.style.display=n,e.style.visibility=t}return i}function xe(){let e=window,i=document,t=i.documentElement,n=i.getElementsByTagName("body")[0],o=e.innerWidth||t.clientWidth||n.clientWidth,r=e.innerHeight||t.clientHeight||n.clientHeight;return{width:o,height:r}}function _e(e){return e?Math.abs(e.scrollLeft):0}function Ri(){let e=document.documentElement;return(window.pageXOffset||_e(e))-(e.clientLeft||0)}function Di(){let e=document.documentElement;return(window.pageYOffset||e.scrollTop)-(e.clientTop||0)}function Fi(e){return e?getComputedStyle(e).direction==="rtl":!1}function qo(e,i,t=!0){var n,o,r,s;if(e){let a=e.offsetParent?{width:e.offsetWidth,height:e.offsetHeight}:Cn(e),l=a.height,c=a.width,d=i.offsetHeight,p=i.offsetWidth,u=i.getBoundingClientRect(),h=Di(),f=Ri(),b=xe(),g,T,I="top";u.top+d+l>b.height?(g=u.top+h-l,I="bottom",g<0&&(g=h)):g=d+u.top+h,u.left+c>b.width?T=Math.max(0,u.left+f+p-c):T=u.left+f,Fi(e)?e.style.insetInlineEnd=T+"px":e.style.insetInlineStart=T+"px",e.style.top=g+"px",e.style.transformOrigin=I,t&&(e.style.marginTop=I==="bottom"?`calc(${(o=(n=Pt(/-anchor-gutter$/))==null?void 0:n.value)!=null?o:"2px"} * -1)`:(s=(r=Pt(/-anchor-gutter$/))==null?void 0:r.value)!=null?s:"")}}function Bi(e,i){e&&(typeof i=="string"?e.style.cssText=i:Object.entries(i||{}).forEach(([t,n])=>e.style[t]=n))}function Ie(e,i){if(e instanceof HTMLElement){let t=e.offsetWidth;if(i){let n=getComputedStyle(e);t+=parseFloat(n.marginLeft)+parseFloat(n.marginRight)}return t}return 0}function Yo(e,i,t=!0,n=void 0){var o;if(e){let r=e.offsetParent?{width:e.offsetWidth,height:e.offsetHeight}:Cn(e),s=i.offsetHeight,a=i.getBoundingClientRect(),l=xe(),c,d,p=n??"top";if(!n&&a.top+s+r.height>l.height?(c=-1*r.height,p="bottom",a.top+c<0&&(c=-1*a.top)):c=s,r.width>l.width?d=a.left*-1:a.left+r.width>l.width?d=(a.left+r.width-l.width)*-1:d=0,e.style.top=c+"px",e.style.insetInlineStart=d+"px",e.style.transformOrigin=p,t){let u=(o=Pt(/-anchor-gutter$/))==null?void 0:o.value;e.style.marginTop=p==="bottom"?`calc(${u??"2px"} * -1)`:u??""}}}function $i(e){if(e){let i=e.parentNode;return i&&i instanceof ShadowRoot&&i.host&&(i=i.host),i}return null}function Hi(e){return!!(e!==null&&typeof e<"u"&&e.nodeName&&$i(e))}function kt(e){return typeof Element<"u"?e instanceof Element:e!==null&&typeof e=="object"&&e.nodeType===1&&typeof e.nodeName=="string"}function En(e){let i=e;return e&&typeof e=="object"&&(Object.hasOwn(e,"current")?i=e.current:Object.hasOwn(e,"el")&&(Object.hasOwn(e.el,"nativeElement")?i=e.el.nativeElement:i=e.el)),kt(i)?i:void 0}function Wi(e,i){var t,n,o;if(e)switch(e){case"document":return document;case"window":return window;case"body":return document.body;case"@next":return i?.nextElementSibling;case"@prev":return i?.previousElementSibling;case"@first":return i?.firstElementChild;case"@last":return i?.lastElementChild;case"@child":return(t=i?.children)==null?void 0:t[0];case"@parent":return i?.parentElement;case"@grandparent":return(n=i?.parentElement)==null?void 0:n.parentElement;default:{if(typeof e=="string"){let a=e.match(/^@child\[(\d+)]/);return a?((o=i?.children)==null?void 0:o[parseInt(a[1],10)])||null:document.querySelector(e)||null}let r=(a=>typeof a=="function"&&"call"in a&&"apply"in a)(e)?e():e,s=En(r);return Hi(s)?s:r?.nodeType===9?r:void 0}}}function Qo(e,i){let t=Wi(e,i);if(t)t.appendChild(i);else throw new Error("Cannot append "+i+" to "+e)}var Te;function gn(e){if(e){let i=getComputedStyle(e);return e.offsetWidth-e.clientWidth-parseFloat(i.borderLeftWidth)-parseFloat(i.borderRightWidth)}else{if(Te!=null)return Te;let i=document.createElement("div");Bi(i,{width:"100px",height:"100px",overflow:"scroll",position:"absolute",top:"-9999px"}),document.body.appendChild(i);let t=i.offsetWidth-i.clientWidth;return document.body.removeChild(i),Te=t,t}}function se(e,i={}){if(kt(e)){let t=(n,o)=>{var r,s;let a=(r=e?.$attrs)!=null&&r[n]?[(s=e?.$attrs)==null?void 0:s[n]]:[];return[o].flat().reduce((l,c)=>{if(c!=null){let d=typeof c;if(d==="string"||d==="number")l.push(c);else if(d==="object"){let p=Array.isArray(c)?t(n,c):Object.entries(c).map(([u,h])=>n==="style"&&(h||h===0)?`${u.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()}:${h}`:h?u:void 0);l=p.length?l.concat(p.filter(u=>!!u)):l}}return l},a)};Object.entries(i).forEach(([n,o])=>{if(o!=null){let r=n.match(/^on(.+)/);r?e.addEventListener(r[1].toLowerCase(),o):n==="p-bind"||n==="pBind"?se(e,o):(o=n==="class"?[...new Set(t("class",o))].join(" ").trim():n==="style"?t("style",o).join(";").trim():o,(e.$attrs=e.$attrs||{})&&(e.$attrs[n]=o),e.setAttribute(n,o))}})}}function Xo(e,i={},...t){if(e){let n=document.createElement(e);return se(n,i),n.append(...t),n}}function Zo(e,i){if(e){e.style.opacity="0";let t=+new Date,n="0",o=function(){n=`${+e.style.opacity+(new Date().getTime()-t)/i}`,e.style.opacity=n,t=+new Date,+n<1&&("requestAnimationFrame"in window?requestAnimationFrame(o):setTimeout(o,16))};o()}}function ji(e,i){return kt(e)?Array.from(e.querySelectorAll(i)):[]}function gt(e,i){return kt(e)?e.matches(i)?e:e.querySelector(i):null}function Jo(e,i){e&&document.activeElement!==e&&e.focus(i)}function wn(e,i=""){let t=ji(e,`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${i},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${i},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${i},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${i},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${i},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${i},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${i}`),n=[];for(let o of t)getComputedStyle(o).display!="none"&&getComputedStyle(o).visibility!="hidden"&&n.push(o);return n}function tr(e,i){let t=wn(e,i);return t.length>0?t[0]:null}function Oe(e){if(e){let i=e.offsetHeight,t=getComputedStyle(e);return i-=parseFloat(t.paddingTop)+parseFloat(t.paddingBottom)+parseFloat(t.borderTopWidth)+parseFloat(t.borderBottomWidth),i}return 0}function Ui(e){if(e){let[i,t]=[e.style.visibility,e.style.display];e.style.visibility="hidden",e.style.display="block";let n=e.offsetHeight;return e.style.display=t,e.style.visibility=i,n}return 0}function Vi(e){if(e){let[i,t]=[e.style.visibility,e.style.display];e.style.visibility="hidden",e.style.display="block";let n=e.offsetWidth;return e.style.display=t,e.style.visibility=i,n}return 0}function er(e,i){let t=wn(e,i);return t.length>0?t[t.length-1]:null}function Pe(e){if(e){let i=e.getBoundingClientRect();return{top:i.top+(window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0),left:i.left+(window.pageXOffset||_e(document.documentElement)||_e(document.body)||0)}}return{top:"auto",left:"auto"}}function ae(e,i){if(e){let t=e.offsetHeight;if(i){let n=getComputedStyle(e);t+=parseFloat(n.marginTop)+parseFloat(n.marginBottom)}return t}return 0}function ke(e){if(e){let i=e.offsetWidth,t=getComputedStyle(e);return i-=parseFloat(t.paddingLeft)+parseFloat(t.paddingRight)+parseFloat(t.borderLeftWidth)+parseFloat(t.borderRightWidth),i}return 0}function nr(e){return!!(e&&e.offsetParent!=null)}function ir(){return"ontouchstart"in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0}function or(e,i){var t,n;if(e){let o=e.parentElement,r=Pe(o),s=xe(),a=e.offsetParent?e.offsetWidth:Vi(e),l=e.offsetParent?e.offsetHeight:Ui(e),c=Ie((t=o?.children)==null?void 0:t[0]),d=ae((n=o?.children)==null?void 0:n[0]),p="",u="";r.left+c+a>s.width-gn()?r.left<a?i%2===1?p=r.left?"-"+r.left+"px":"100%":i%2===0&&(p=s.width-a-gn()+"px"):p="-100%":p="100%",e.getBoundingClientRect().top+d+l>s.height?u=`-${l-d}px`:u="0px",e.style.top=u,e.style.insetInlineStart=p}}function Tn(e){var i;e&&("remove"in Element.prototype?e.remove():(i=e.parentNode)==null||i.removeChild(e))}function rr(e,i){let t=En(e);if(t)t.removeChild(i);else throw new Error("Cannot remove "+i+" from "+e)}function sr(e,i){let t=getComputedStyle(e).getPropertyValue("borderTopWidth"),n=t?parseFloat(t):0,o=getComputedStyle(e).getPropertyValue("paddingTop"),r=o?parseFloat(o):0,s=e.getBoundingClientRect(),a=i.getBoundingClientRect().top+document.body.scrollTop-(s.top+document.body.scrollTop)-n-r,l=e.scrollTop,c=e.clientHeight,d=ae(i);a<0?e.scrollTop=l+a:a+d>c&&(e.scrollTop=l+a-c+d)}function _n(e,i="",t){kt(e)&&t!==null&&t!==void 0&&e.setAttribute(i,t)}function xn(){let e=new Map;return{on(i,t){let n=e.get(i);return n?n.push(t):n=[t],e.set(i,n),this},off(i,t){let n=e.get(i);return n&&n.splice(n.indexOf(t)>>>0,1),this},emit(i,t){let n=e.get(i);n&&n.forEach(o=>{o(t)})},clear(){e.clear()}}}var zi=Object.defineProperty,In=Object.getOwnPropertySymbols,Gi=Object.prototype.hasOwnProperty,Ki=Object.prototype.propertyIsEnumerable,On=(e,i,t)=>i in e?zi(e,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[i]=t,qi=(e,i)=>{for(var t in i||(i={}))Gi.call(i,t)&&On(e,t,i[t]);if(In)for(var t of In(i))Ki.call(i,t)&&On(e,t,i[t]);return e};function Y(e){return e==null||e===""||Array.isArray(e)&&e.length===0||!(e instanceof Date)&&typeof e=="object"&&Object.keys(e).length===0}function Ne(e,i,t=new WeakSet){if(e===i)return!0;if(!e||!i||typeof e!="object"||typeof i!="object"||t.has(e)||t.has(i))return!1;t.add(e).add(i);let n=Array.isArray(e),o=Array.isArray(i),r,s,a;if(n&&o){if(s=e.length,s!=i.length)return!1;for(r=s;r--!==0;)if(!Ne(e[r],i[r],t))return!1;return!0}if(n!=o)return!1;let l=e instanceof Date,c=i instanceof Date;if(l!=c)return!1;if(l&&c)return e.getTime()==i.getTime();let d=e instanceof RegExp,p=i instanceof RegExp;if(d!=p)return!1;if(d&&p)return e.toString()==i.toString();let u=Object.keys(e);if(s=u.length,s!==Object.keys(i).length)return!1;for(r=s;r--!==0;)if(!Object.prototype.hasOwnProperty.call(i,u[r]))return!1;for(r=s;r--!==0;)if(a=u[r],!Ne(e[a],i[a],t))return!1;return!0}function Yi(e,i){return Ne(e,i)}function kn(e){return typeof e=="function"&&"call"in e&&"apply"in e}function C(e){return!Y(e)}function le(e,i){if(!e||!i)return null;try{let t=e[i];if(C(t))return t}catch{}if(Object.keys(e).length){if(kn(i))return i(e);if(i.indexOf(".")===-1)return e[i];{let t=i.split("."),n=e;for(let o=0,r=t.length;o<r;++o){if(n==null)return null;n=n[t[o]]}return n}}return null}function Nn(e,i,t){return t?le(e,t)===le(i,t):Yi(e,i)}function V(e,i=!0){return e instanceof Object&&e.constructor===Object&&(i||Object.keys(e).length!==0)}function An(e={},i={}){let t=qi({},e);return Object.keys(i).forEach(n=>{let o=n;V(i[o])&&o in e&&V(e[o])?t[o]=An(e[o],i[o]):t[o]=i[o]}),t}function Ln(...e){return e.reduce((i,t,n)=>n===0?t:An(i,t),{})}function cr(e,i){let t=-1;if(C(e))try{t=e.findLastIndex(i)}catch{t=e.lastIndexOf([...e].reverse().find(i))}return t}function R(e,...i){return kn(e)?e(...i):e}function rt(e,i=!0){return typeof e=="string"&&(i||e!=="")}function Pn(e){return rt(e)?e.replace(/(-|_)/g,"").toLowerCase():e}function ce(e,i="",t={}){let n=Pn(i).split("."),o=n.shift();if(o){if(V(e)){let r=Object.keys(e).find(s=>Pn(s)===o)||"";return ce(R(e[r],t),n.join("."),t)}return}return R(e,t)}function Mn(e){return C(e)&&!isNaN(e)}function dr(e=""){return C(e)&&e.length===1&&!!e.match(/\S| /)}function z(e,i){if(i){let t=i.test(e);return i.lastIndex=0,t}return!1}function ht(e){return e&&e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g,"").replace(/ {2,}/g," ").replace(/ ([{:}]) /g,"$1").replace(/([;,]) /g,"$1").replace(/ !/g,"!").replace(/: /g,":").trim()}function B(e){if(e&&/[\xC0-\xFF\u0100-\u017E]/.test(e)){let i={A:/[\xC0-\xC5\u0100\u0102\u0104]/g,AE:/[\xC6]/g,C:/[\xC7\u0106\u0108\u010A\u010C]/g,D:/[\xD0\u010E\u0110]/g,E:/[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g,G:/[\u011C\u011E\u0120\u0122]/g,H:/[\u0124\u0126]/g,I:/[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g,IJ:/[\u0132]/g,J:/[\u0134]/g,K:/[\u0136]/g,L:/[\u0139\u013B\u013D\u013F\u0141]/g,N:/[\xD1\u0143\u0145\u0147\u014A]/g,O:/[\xD2-\xD6\xD8\u014C\u014E\u0150]/g,OE:/[\u0152]/g,R:/[\u0154\u0156\u0158]/g,S:/[\u015A\u015C\u015E\u0160]/g,T:/[\u0162\u0164\u0166]/g,U:/[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g,W:/[\u0174]/g,Y:/[\xDD\u0176\u0178]/g,Z:/[\u0179\u017B\u017D]/g,a:/[\xE0-\xE5\u0101\u0103\u0105]/g,ae:/[\xE6]/g,c:/[\xE7\u0107\u0109\u010B\u010D]/g,d:/[\u010F\u0111]/g,e:/[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g,g:/[\u011D\u011F\u0121\u0123]/g,i:/[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g,ij:/[\u0133]/g,j:/[\u0135]/g,k:/[\u0137,\u0138]/g,l:/[\u013A\u013C\u013E\u0140\u0142]/g,n:/[\xF1\u0144\u0146\u0148\u014B]/g,p:/[\xFE]/g,o:/[\xF2-\xF6\xF8\u014D\u014F\u0151]/g,oe:/[\u0153]/g,r:/[\u0155\u0157\u0159]/g,s:/[\u015B\u015D\u015F\u0161]/g,t:/[\u0163\u0165\u0167]/g,u:/[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g,w:/[\u0175]/g,y:/[\xFD\xFF\u0177]/g,z:/[\u017A\u017C\u017E]/g};for(let t in i)e=e.replace(i[t],t)}return e}function de(e){return rt(e)?e.replace(/(_)/g,"-").replace(/[A-Z]/g,(i,t)=>t===0?i:"-"+i.toLowerCase()).toLowerCase():e}var ue={};function Nt(e="pui_id_"){return Object.hasOwn(ue,e)||(ue[e]=0),ue[e]++,`${e}${ue[e]}`}var k=(()=>{class e{static STARTS_WITH="startsWith";static CONTAINS="contains";static NOT_CONTAINS="notContains";static ENDS_WITH="endsWith";static EQUALS="equals";static NOT_EQUALS="notEquals";static IN="in";static LESS_THAN="lt";static LESS_THAN_OR_EQUAL_TO="lte";static GREATER_THAN="gt";static GREATER_THAN_OR_EQUAL_TO="gte";static BETWEEN="between";static IS="is";static IS_NOT="isNot";static BEFORE="before";static AFTER="after";static DATE_IS="dateIs";static DATE_IS_NOT="dateIsNot";static DATE_BEFORE="dateBefore";static DATE_AFTER="dateAfter"}return e})();var br=(()=>{class e{filter(t,n,o,r,s){let a=[];if(t)for(let l of t)for(let c of n){let d=le(l,c);if(this.filters[r](d,o,s)){a.push(l);break}}return a}filters={startsWith:(t,n,o)=>{if(n==null||n.trim()==="")return!0;if(t==null)return!1;let r=B(n.toString()).toLocaleLowerCase(o);return B(t.toString()).toLocaleLowerCase(o).slice(0,r.length)===r},contains:(t,n,o)=>{if(n==null||typeof n=="string"&&n.trim()==="")return!0;if(t==null)return!1;let r=B(n.toString()).toLocaleLowerCase(o);return B(t.toString()).toLocaleLowerCase(o).indexOf(r)!==-1},notContains:(t,n,o)=>{if(n==null||typeof n=="string"&&n.trim()==="")return!0;if(t==null)return!1;let r=B(n.toString()).toLocaleLowerCase(o);return B(t.toString()).toLocaleLowerCase(o).indexOf(r)===-1},endsWith:(t,n,o)=>{if(n==null||n.trim()==="")return!0;if(t==null)return!1;let r=B(n.toString()).toLocaleLowerCase(o),s=B(t.toString()).toLocaleLowerCase(o);return s.indexOf(r,s.length-r.length)!==-1},equals:(t,n,o)=>n==null||typeof n=="string"&&n.trim()===""?!0:t==null?!1:t.getTime&&n.getTime?t.getTime()===n.getTime():t==n?!0:B(t.toString()).toLocaleLowerCase(o)==B(n.toString()).toLocaleLowerCase(o),notEquals:(t,n,o)=>n==null||typeof n=="string"&&n.trim()===""?!1:t==null?!0:t.getTime&&n.getTime?t.getTime()!==n.getTime():t==n?!1:B(t.toString()).toLocaleLowerCase(o)!=B(n.toString()).toLocaleLowerCase(o),in:(t,n)=>{if(n==null||n.length===0)return!0;for(let o=0;o<n.length;o++)if(Nn(t,n[o]))return!0;return!1},between:(t,n)=>n==null||n[0]==null||n[1]==null?!0:t==null?!1:t.getTime?n[0].getTime()<=t.getTime()&&t.getTime()<=n[1].getTime():n[0]<=t&&t<=n[1],lt:(t,n,o)=>n==null?!0:t==null?!1:t.getTime&&n.getTime?t.getTime()<n.getTime():t<n,lte:(t,n,o)=>n==null?!0:t==null?!1:t.getTime&&n.getTime?t.getTime()<=n.getTime():t<=n,gt:(t,n,o)=>n==null?!0:t==null?!1:t.getTime&&n.getTime?t.getTime()>n.getTime():t>n,gte:(t,n,o)=>n==null?!0:t==null?!1:t.getTime&&n.getTime?t.getTime()>=n.getTime():t>=n,is:(t,n,o)=>this.filters.equals(t,n,o),isNot:(t,n,o)=>this.filters.notEquals(t,n,o),before:(t,n,o)=>this.filters.lt(t,n,o),after:(t,n,o)=>this.filters.gt(t,n,o),dateIs:(t,n)=>n==null?!0:t==null?!1:t.toDateString()===n.toDateString(),dateIsNot:(t,n)=>n==null?!0:t==null?!1:t.toDateString()!==n.toDateString(),dateBefore:(t,n)=>n==null?!0:t==null?!1:t.getTime()<n.getTime(),dateAfter:(t,n)=>n==null?!0:t==null?!1:(t.setHours(0,0,0,0),t.getTime()>n.getTime())};register(t,n){this.filters[t]=n}static \u0275fac=function(n){return new(n||e)};static \u0275prov=E({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();var gr=(()=>{class e{clickSource=new Yt;clickObservable=this.clickSource.asObservable();add(t){t&&this.clickSource.next(t)}static \u0275fac=function(n){return new(n||e)};static \u0275prov=E({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();var Rn=(()=>{class e{template;type;name;constructor(t){this.template=t}getType(){return this.name}static \u0275fac=function(n){return new(n||e)(Qe(qe))};static \u0275dir=F({type:e,selectors:[["","pTemplate",""]],inputs:{type:"type",name:[0,"pTemplate","name"]}})}return e})(),st=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=X({type:e});static \u0275inj=Q({imports:[Z]})}return e})(),yr=(()=>{class e{static STARTS_WITH="startsWith";static CONTAINS="contains";static NOT_CONTAINS="notContains";static ENDS_WITH="endsWith";static EQUALS="equals";static NOT_EQUALS="notEquals";static NO_FILTER="noFilter";static LT="lt";static LTE="lte";static GT="gt";static GTE="gte";static IS="is";static IS_NOT="isNot";static BEFORE="before";static AFTER="after";static CLEAR="clear";static APPLY="apply";static MATCH_ALL="matchAll";static MATCH_ANY="matchAny";static ADD_RULE="addRule";static REMOVE_RULE="removeRule";static ACCEPT="accept";static REJECT="reject";static CHOOSE="choose";static UPLOAD="upload";static CANCEL="cancel";static PENDING="pending";static FILE_SIZE_TYPES="fileSizeTypes";static DAY_NAMES="dayNames";static DAY_NAMES_SHORT="dayNamesShort";static DAY_NAMES_MIN="dayNamesMin";static MONTH_NAMES="monthNames";static MONTH_NAMES_SHORT="monthNamesShort";static FIRST_DAY_OF_WEEK="firstDayOfWeek";static TODAY="today";static WEEK_HEADER="weekHeader";static WEAK="weak";static MEDIUM="medium";static STRONG="strong";static PASSWORD_PROMPT="passwordPrompt";static EMPTY_MESSAGE="emptyMessage";static EMPTY_FILTER_MESSAGE="emptyFilterMessage";static SHOW_FILTER_MENU="showFilterMenu";static HIDE_FILTER_MENU="hideFilterMenu";static SELECTION_MESSAGE="selectionMessage";static ARIA="aria";static SELECT_COLOR="selectColor";static BROWSE_FILES="browseFiles"}return e})();var Qi=Object.defineProperty,Xi=Object.defineProperties,Zi=Object.getOwnPropertyDescriptors,pe=Object.getOwnPropertySymbols,Bn=Object.prototype.hasOwnProperty,$n=Object.prototype.propertyIsEnumerable,Dn=(e,i,t)=>i in e?Qi(e,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[i]=t,K=(e,i)=>{for(var t in i||(i={}))Bn.call(i,t)&&Dn(e,t,i[t]);if(pe)for(var t of pe(i))$n.call(i,t)&&Dn(e,t,i[t]);return e},Ae=(e,i)=>Xi(e,Zi(i)),tt=(e,i)=>{var t={};for(var n in e)Bn.call(e,n)&&i.indexOf(n)<0&&(t[n]=e[n]);if(e!=null&&pe)for(var n of pe(e))i.indexOf(n)<0&&$n.call(e,n)&&(t[n]=e[n]);return t};function Er(...e){return Ln(...e)}var Ji=xn(),$=Ji,At=/{([^}]*)}/g,Hn=/(\d+\s+[\+\-\*\/]\s+\d+)/g,Wn=/var\([^)]+\)/g;function Fn(e){return rt(e)?e.replace(/[A-Z]/g,(i,t)=>t===0?i:"."+i.toLowerCase()).toLowerCase():e}function to(e){return V(e)&&e.hasOwnProperty("$value")&&e.hasOwnProperty("$type")?e.$value:e}function eo(e){return e.replaceAll(/ /g,"").replace(/[^\w]/g,"-")}function Le(e="",i=""){return eo(`${rt(e,!1)&&rt(i,!1)?`${e}-`:e}${i}`)}function jn(e="",i=""){return`--${Le(e,i)}`}function no(e=""){let i=(e.match(/{/g)||[]).length,t=(e.match(/}/g)||[]).length;return(i+t)%2!==0}function Un(e,i="",t="",n=[],o){if(rt(e)){let r=e.trim();if(no(r))return;if(z(r,At)){let s=r.replaceAll(At,a=>{let l=a.replace(/{|}/g,"").split(".").filter(c=>!n.some(d=>z(c,d)));return`var(${jn(t,de(l.join("-")))}${C(o)?`, ${o}`:""})`});return z(s.replace(Wn,"0"),Hn)?`calc(${s})`:s}return r}else if(Mn(e))return e}function io(e,i,t){rt(i,!1)&&e.push(`${i}:${t};`)}function yt(e,i){return e?`${e}{${i}}`:""}function Vn(e,i){if(e.indexOf("dt(")===-1)return e;function t(s,a){let l=[],c=0,d="",p=null,u=0;for(;c<=s.length;){let h=s[c];if((h==='"'||h==="'"||h==="`")&&s[c-1]!=="\\"&&(p=p===h?null:h),!p&&(h==="("&&u++,h===")"&&u--,(h===","||c===s.length)&&u===0)){let f=d.trim();f.startsWith("dt(")?l.push(Vn(f,a)):l.push(n(f)),d="",c++;continue}h!==void 0&&(d+=h),c++}return l}function n(s){let a=s[0];if((a==='"'||a==="'"||a==="`")&&s[s.length-1]===a)return s.slice(1,-1);let l=Number(s);return isNaN(l)?s:l}let o=[],r=[];for(let s=0;s<e.length;s++)if(e[s]==="d"&&e.slice(s,s+3)==="dt(")r.push(s),s+=2;else if(e[s]===")"&&r.length>0){let a=r.pop();r.length===0&&o.push([a,s])}if(!o.length)return e;for(let s=o.length-1;s>=0;s--){let[a,l]=o[s],c=e.slice(a+3,l),d=t(c,i),p=i(...d);e=e.slice(0,a)+p+e.slice(l+1)}return e}var Re=e=>{var i;let t=y.getTheme(),n=Me(t,e,void 0,"variable"),o=(i=n?.match(/--[\w-]+/g))==null?void 0:i[0],r=Me(t,e,void 0,"value");return{name:o,variable:n,value:r}},et=(...e)=>Me(y.getTheme(),...e),Me=(e={},i,t,n)=>{if(i){let{variable:o,options:r}=y.defaults||{},{prefix:s,transform:a}=e?.options||r||{},l=z(i,At)?i:`{${i}}`;return n==="value"||Y(n)&&a==="strict"?y.getTokenValue(i):Un(l,void 0,s,[o.excludedKeyRegex],t)}return""};function vt(e,...i){if(e instanceof Array){let t=e.reduce((n,o,r)=>{var s;return n+o+((s=R(i[r],{dt:et}))!=null?s:"")},"");return Vn(t,et)}return R(e,{dt:et})}function oo(e,i={}){let t=y.defaults.variable,{prefix:n=t.prefix,selector:o=t.selector,excludedKeyRegex:r=t.excludedKeyRegex}=i,s=[],a=[],l=[{node:e,path:n}];for(;l.length;){let{node:d,path:p}=l.pop();for(let u in d){let h=d[u],f=to(h),b=z(u,r)?Le(p):Le(p,de(u));if(V(f))l.push({node:f,path:b});else{let g=jn(b),T=Un(f,b,n,[r]);io(a,g,T);let I=b;n&&I.startsWith(n+"-")&&(I=I.slice(n.length+1)),s.push(I.replace(/-/g,"."))}}}let c=a.join("");return{value:a,tokens:s,declarations:c,css:yt(o,c)}}var G={regex:{rules:{class:{pattern:/^\.([a-zA-Z][\w-]*)$/,resolve(e){return{type:"class",selector:e,matched:this.pattern.test(e.trim())}}},attr:{pattern:/^\[(.*)\]$/,resolve(e){return{type:"attr",selector:`:root${e},:host${e}`,matched:this.pattern.test(e.trim())}}},media:{pattern:/^@media (.*)$/,resolve(e){return{type:"media",selector:e,matched:this.pattern.test(e.trim())}}},system:{pattern:/^system$/,resolve(e){return{type:"system",selector:"@media (prefers-color-scheme: dark)",matched:this.pattern.test(e.trim())}}},custom:{resolve(e){return{type:"custom",selector:e,matched:!0}}}},resolve(e){let i=Object.keys(this.rules).filter(t=>t!=="custom").map(t=>this.rules[t]);return[e].flat().map(t=>{var n;return(n=i.map(o=>o.resolve(t)).find(o=>o.matched))!=null?n:this.rules.custom.resolve(t)})}},_toVariables(e,i){return oo(e,{prefix:i?.prefix})},getCommon({name:e="",theme:i={},params:t,set:n,defaults:o}){var r,s,a,l,c,d,p;let{preset:u,options:h}=i,f,b,g,T,I,D,Lt;if(C(u)&&h.transform!=="strict"){let{primitive:Mt,semantic:Rt,extend:Dt}=u,Ct=Rt||{},{colorScheme:Ft}=Ct,Bt=tt(Ct,["colorScheme"]),$t=Dt||{},{colorScheme:Ht}=$t,Et=tt($t,["colorScheme"]),wt=Ft||{},{dark:Wt}=wt,jt=tt(wt,["dark"]),Ut=Ht||{},{dark:Vt}=Ut,zt=tt(Ut,["dark"]),Gt=C(Mt)?this._toVariables({primitive:Mt},h):{},Kt=C(Bt)?this._toVariables({semantic:Bt},h):{},qt=C(jt)?this._toVariables({light:jt},h):{},He=C(Wt)?this._toVariables({dark:Wt},h):{},We=C(Et)?this._toVariables({semantic:Et},h):{},je=C(zt)?this._toVariables({light:zt},h):{},Ue=C(Vt)?this._toVariables({dark:Vt},h):{},[di,ui]=[(r=Gt.declarations)!=null?r:"",Gt.tokens],[pi,hi]=[(s=Kt.declarations)!=null?s:"",Kt.tokens||[]],[mi,fi]=[(a=qt.declarations)!=null?a:"",qt.tokens||[]],[bi,gi]=[(l=He.declarations)!=null?l:"",He.tokens||[]],[yi,vi]=[(c=We.declarations)!=null?c:"",We.tokens||[]],[Si,Ci]=[(d=je.declarations)!=null?d:"",je.tokens||[]],[Ei,wi]=[(p=Ue.declarations)!=null?p:"",Ue.tokens||[]];f=this.transformCSS(e,di,"light","variable",h,n,o),b=ui;let Ti=this.transformCSS(e,`${pi}${mi}`,"light","variable",h,n,o),_i=this.transformCSS(e,`${bi}`,"dark","variable",h,n,o);g=`${Ti}${_i}`,T=[...new Set([...hi,...fi,...gi])];let xi=this.transformCSS(e,`${yi}${Si}color-scheme:light`,"light","variable",h,n,o),Ii=this.transformCSS(e,`${Ei}color-scheme:dark`,"dark","variable",h,n,o);I=`${xi}${Ii}`,D=[...new Set([...vi,...Ci,...wi])],Lt=R(u.css,{dt:et})}return{primitive:{css:f,tokens:b},semantic:{css:g,tokens:T},global:{css:I,tokens:D},style:Lt}},getPreset({name:e="",preset:i={},options:t,params:n,set:o,defaults:r,selector:s}){var a,l,c;let d,p,u;if(C(i)&&t.transform!=="strict"){let h=e.replace("-directive",""),f=i,{colorScheme:b,extend:g,css:T}=f,I=tt(f,["colorScheme","extend","css"]),D=g||{},{colorScheme:Lt}=D,Mt=tt(D,["colorScheme"]),Rt=b||{},{dark:Dt}=Rt,Ct=tt(Rt,["dark"]),Ft=Lt||{},{dark:Bt}=Ft,$t=tt(Ft,["dark"]),Ht=C(I)?this._toVariables({[h]:K(K({},I),Mt)},t):{},Et=C(Ct)?this._toVariables({[h]:K(K({},Ct),$t)},t):{},wt=C(Dt)?this._toVariables({[h]:K(K({},Dt),Bt)},t):{},[Wt,jt]=[(a=Ht.declarations)!=null?a:"",Ht.tokens||[]],[Ut,Vt]=[(l=Et.declarations)!=null?l:"",Et.tokens||[]],[zt,Gt]=[(c=wt.declarations)!=null?c:"",wt.tokens||[]],Kt=this.transformCSS(h,`${Wt}${Ut}`,"light","variable",t,o,r,s),qt=this.transformCSS(h,zt,"dark","variable",t,o,r,s);d=`${Kt}${qt}`,p=[...new Set([...jt,...Vt,...Gt])],u=R(T,{dt:et})}return{css:d,tokens:p,style:u}},getPresetC({name:e="",theme:i={},params:t,set:n,defaults:o}){var r;let{preset:s,options:a}=i,l=(r=s?.components)==null?void 0:r[e];return this.getPreset({name:e,preset:l,options:a,params:t,set:n,defaults:o})},getPresetD({name:e="",theme:i={},params:t,set:n,defaults:o}){var r,s;let a=e.replace("-directive",""),{preset:l,options:c}=i,d=((r=l?.components)==null?void 0:r[a])||((s=l?.directives)==null?void 0:s[a]);return this.getPreset({name:a,preset:d,options:c,params:t,set:n,defaults:o})},applyDarkColorScheme(e){return!(e.darkModeSelector==="none"||e.darkModeSelector===!1)},getColorSchemeOption(e,i){var t;return this.applyDarkColorScheme(e)?this.regex.resolve(e.darkModeSelector===!0?i.options.darkModeSelector:(t=e.darkModeSelector)!=null?t:i.options.darkModeSelector):[]},getLayerOrder(e,i={},t,n){let{cssLayer:o}=i;return o?`@layer ${R(o.order||o.name||"primeui",t)}`:""},getCommonStyleSheet({name:e="",theme:i={},params:t,props:n={},set:o,defaults:r}){let s=this.getCommon({name:e,theme:i,params:t,set:o,defaults:r}),a=Object.entries(n).reduce((l,[c,d])=>l.push(`${c}="${d}"`)&&l,[]).join(" ");return Object.entries(s||{}).reduce((l,[c,d])=>{if(V(d)&&Object.hasOwn(d,"css")){let p=ht(d.css),u=`${c}-variables`;l.push(`<style type="text/css" data-primevue-style-id="${u}" ${a}>${p}</style>`)}return l},[]).join("")},getStyleSheet({name:e="",theme:i={},params:t,props:n={},set:o,defaults:r}){var s;let a={name:e,theme:i,params:t,set:o,defaults:r},l=(s=e.includes("-directive")?this.getPresetD(a):this.getPresetC(a))==null?void 0:s.css,c=Object.entries(n).reduce((d,[p,u])=>d.push(`${p}="${u}"`)&&d,[]).join(" ");return l?`<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${ht(l)}</style>`:""},createTokens(e={},i,t="",n="",o={}){let r=function(a,l={},c=[]){if(c.includes(this.path))return console.warn(`Circular reference detected at ${this.path}`),{colorScheme:a,path:this.path,paths:l,value:void 0};c.push(this.path),l.name=this.path,l.binding||(l.binding={});let d=this.value;if(typeof this.value=="string"&&At.test(this.value)){let p=this.value.trim().replace(At,u=>{var h;let f=u.slice(1,-1),b=this.tokens[f];if(!b)return console.warn(`Token not found for path: ${f}`),"__UNRESOLVED__";let g=b.computed(a,l,c);return Array.isArray(g)&&g.length===2?`light-dark(${g[0].value},${g[1].value})`:(h=g?.value)!=null?h:"__UNRESOLVED__"});d=Hn.test(p.replace(Wn,"0"))?`calc(${p})`:p}return Y(l.binding)&&delete l.binding,c.pop(),{colorScheme:a,path:this.path,paths:l,value:d.includes("__UNRESOLVED__")?void 0:d}},s=(a,l,c)=>{Object.entries(a).forEach(([d,p])=>{let u=z(d,i.variable.excludedKeyRegex)?l:l?`${l}.${Fn(d)}`:Fn(d),h=c?`${c}.${d}`:d;V(p)?s(p,u,h):(o[u]||(o[u]={paths:[],computed:(f,b={},g=[])=>{if(o[u].paths.length===1)return o[u].paths[0].computed(o[u].paths[0].scheme,b.binding,g);if(f&&f!=="none")for(let T=0;T<o[u].paths.length;T++){let I=o[u].paths[T];if(I.scheme===f)return I.computed(f,b.binding,g)}return o[u].paths.map(T=>T.computed(T.scheme,b[T.scheme],g))}}),o[u].paths.push({path:h,value:p,scheme:h.includes("colorScheme.light")?"light":h.includes("colorScheme.dark")?"dark":"none",computed:r,tokens:o}))})};return s(e,t,n),o},getTokenValue(e,i,t){var n;let o=(a=>a.split(".").filter(l=>!z(l.toLowerCase(),t.variable.excludedKeyRegex)).join("."))(i),r=i.includes("colorScheme.light")?"light":i.includes("colorScheme.dark")?"dark":void 0,s=[(n=e[o])==null?void 0:n.computed(r)].flat().filter(a=>a);return s.length===1?s[0].value:s.reduce((a={},l)=>{let c=l,{colorScheme:d}=c,p=tt(c,["colorScheme"]);return a[d]=p,a},void 0)},getSelectorRule(e,i,t,n){return t==="class"||t==="attr"?yt(C(i)?`${e}${i},${e} ${i}`:e,n):yt(e,yt(i??":root,:host",n))},transformCSS(e,i,t,n,o={},r,s,a){if(C(i)){let{cssLayer:l}=o;if(n!=="style"){let c=this.getColorSchemeOption(o,s);i=t==="dark"?c.reduce((d,{type:p,selector:u})=>(C(u)&&(d+=u.includes("[CSS]")?u.replace("[CSS]",i):this.getSelectorRule(u,a,p,i)),d),""):yt(a??":root,:host",i)}if(l){let c={name:"primeui",order:"primeui"};V(l)&&(c.name=R(l.name,{name:e,type:n})),C(c.name)&&(i=yt(`@layer ${c.name}`,i),r?.layerNames(c.name))}return i}return""}},y={defaults:{variable:{prefix:"p",selector:":root,:host",excludedKeyRegex:/^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi},options:{prefix:"p",darkModeSelector:"system",cssLayer:!1}},_theme:void 0,_layerNames:new Set,_loadedStyleNames:new Set,_loadingStyles:new Set,_tokens:{},update(e={}){let{theme:i}=e;i&&(this._theme=Ae(K({},i),{options:K(K({},this.defaults.options),i.options)}),this._tokens=G.createTokens(this.preset,this.defaults),this.clearLoadedStyleNames())},get theme(){return this._theme},get preset(){var e;return((e=this.theme)==null?void 0:e.preset)||{}},get options(){var e;return((e=this.theme)==null?void 0:e.options)||{}},get tokens(){return this._tokens},getTheme(){return this.theme},setTheme(e){this.update({theme:e}),$.emit("theme:change",e)},getPreset(){return this.preset},setPreset(e){this._theme=Ae(K({},this.theme),{preset:e}),this._tokens=G.createTokens(e,this.defaults),this.clearLoadedStyleNames(),$.emit("preset:change",e),$.emit("theme:change",this.theme)},getOptions(){return this.options},setOptions(e){this._theme=Ae(K({},this.theme),{options:e}),this.clearLoadedStyleNames(),$.emit("options:change",e),$.emit("theme:change",this.theme)},getLayerNames(){return[...this._layerNames]},setLayerNames(e){this._layerNames.add(e)},getLoadedStyleNames(){return this._loadedStyleNames},isStyleNameLoaded(e){return this._loadedStyleNames.has(e)},setLoadedStyleName(e){this._loadedStyleNames.add(e)},deleteLoadedStyleName(e){this._loadedStyleNames.delete(e)},clearLoadedStyleNames(){this._loadedStyleNames.clear()},getTokenValue(e){return G.getTokenValue(this.tokens,e,this.defaults)},getCommon(e="",i){return G.getCommon({name:e,theme:this.theme,params:i,defaults:this.defaults,set:{layerNames:this.setLayerNames.bind(this)}})},getComponent(e="",i){let t={name:e,theme:this.theme,params:i,defaults:this.defaults,set:{layerNames:this.setLayerNames.bind(this)}};return G.getPresetC(t)},getDirective(e="",i){let t={name:e,theme:this.theme,params:i,defaults:this.defaults,set:{layerNames:this.setLayerNames.bind(this)}};return G.getPresetD(t)},getCustomPreset(e="",i,t,n){let o={name:e,preset:i,options:this.options,selector:t,params:n,defaults:this.defaults,set:{layerNames:this.setLayerNames.bind(this)}};return G.getPreset(o)},getLayerOrderCSS(e=""){return G.getLayerOrder(e,this.options,{names:this.getLayerNames()},this.defaults)},transformCSS(e="",i,t="style",n){return G.transformCSS(e,i,n,t,this.options,{layerNames:this.setLayerNames.bind(this)},this.defaults)},getCommonStyleSheet(e="",i,t={}){return G.getCommonStyleSheet({name:e,theme:this.theme,params:i,props:t,defaults:this.defaults,set:{layerNames:this.setLayerNames.bind(this)}})},getStyleSheet(e,i,t={}){return G.getStyleSheet({name:e,theme:this.theme,params:i,props:t,defaults:this.defaults,set:{layerNames:this.setLayerNames.bind(this)}})},onStyleMounted(e){this._loadingStyles.add(e)},onStyleUpdated(e){this._loadingStyles.add(e)},onStyleLoaded(e,{name:i}){this._loadingStyles.size&&(this._loadingStyles.delete(i),$.emit(`theme:${i}:load`,e),!this._loadingStyles.size&&$.emit("theme:load"))}};var zn=`
    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }

    /* Non vue overlay animations */
    .p-connected-overlay {
        opacity: 0;
        transform: scaleY(0.8);
        transition:
            transform 0.12s cubic-bezier(0, 0, 0.2, 1),
            opacity 0.12s cubic-bezier(0, 0, 0.2, 1);
    }

    .p-connected-overlay-visible {
        opacity: 1;
        transform: scaleY(1);
    }

    .p-connected-overlay-hidden {
        opacity: 0;
        transform: scaleY(1);
        transition: opacity 0.1s linear;
    }

    /* Vue based overlay animations */
    .p-connected-overlay-enter-from {
        opacity: 0;
        transform: scaleY(0.8);
    }

    .p-connected-overlay-leave-to {
        opacity: 0;
    }

    .p-connected-overlay-enter-active {
        transition:
            transform 0.12s cubic-bezier(0, 0, 0.2, 1),
            opacity 0.12s cubic-bezier(0, 0, 0.2, 1);
    }

    .p-connected-overlay-leave-active {
        transition: opacity 0.1s linear;
    }

    /* Toggleable Content */
    .p-toggleable-content-enter-from,
    .p-toggleable-content-leave-to {
        max-height: 0;
    }

    .p-toggleable-content-enter-to,
    .p-toggleable-content-leave-from {
        max-height: 1000px;
    }

    .p-toggleable-content-leave-active {
        overflow: hidden;
        transition: max-height 0.45s cubic-bezier(0, 1, 0, 1);
    }

    .p-toggleable-content-enter-active {
        overflow: hidden;
        transition: max-height 1s ease-in-out;
    }

    .p-disabled,
    .p-disabled * {
        cursor: default;
        pointer-events: none;
        user-select: none;
    }

    .p-disabled,
    .p-component:disabled {
        opacity: dt('disabled.opacity');
    }

    .pi {
        font-size: dt('icon.size');
    }

    .p-icon {
        width: dt('icon.size');
        height: dt('icon.size');
    }

    .p-overlay-mask {
        background: dt('mask.background');
        color: dt('mask.color');
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-overlay-mask-enter {
        animation: p-overlay-mask-enter-animation dt('mask.transition.duration') forwards;
    }

    .p-overlay-mask-leave {
        animation: p-overlay-mask-leave-animation dt('mask.transition.duration') forwards;
    }

    @keyframes p-overlay-mask-enter-animation {
        from {
            background: transparent;
        }
        to {
            background: dt('mask.background');
        }
    }
    @keyframes p-overlay-mask-leave-animation {
        from {
            background: dt('mask.background');
        }
        to {
            background: transparent;
        }
    }
`;var ro=0,Gn=(()=>{class e{document=m(nt);use(t,n={}){let o=!1,r=t,s=null,{immediate:a=!0,manual:l=!1,name:c=`style_${++ro}`,id:d=void 0,media:p=void 0,nonce:u=void 0,first:h=!1,props:f={}}=n;if(this.document){if(s=this.document.querySelector(`style[data-primeng-style-id="${c}"]`)||d&&this.document.getElementById(d)||this.document.createElement("style"),s){if(!s.isConnected){r=t;let b=this.document.head;_n(s,"nonce",u),h&&b.firstChild?b.insertBefore(s,b.firstChild):b.appendChild(s),se(s,{type:"text/css",media:p,nonce:u,"data-primeng-style-id":c})}s.textContent!==r&&(s.textContent=r)}return{id:d,name:c,el:s,css:r}}}static \u0275fac=function(n){return new(n||e)};static \u0275prov=E({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();var St={_loadedStyleNames:new Set,getLoadedStyleNames(){return this._loadedStyleNames},isStyleNameLoaded(e){return this._loadedStyleNames.has(e)},setLoadedStyleName(e){this._loadedStyleNames.add(e)},deleteLoadedStyleName(e){this._loadedStyleNames.delete(e)},clearLoadedStyleNames(){this._loadedStyleNames.clear()}},so=`
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.p-hidden-accessible input,
.p-hidden-accessible select {
    transform: scale(0);
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: dt('scrollbar.width');
}
`,N=(()=>{class e{name="base";useStyle=m(Gn);theme=void 0;css=void 0;classes={};inlineStyles={};load=(t,n={},o=r=>r)=>{let r=o(vt`${R(t,{dt:et})}`);return r?this.useStyle.use(ht(r),_({name:this.name},n)):{}};loadCSS=(t={})=>this.load(this.css,t);loadTheme=(t={},n="")=>this.load(this.theme,t,(o="")=>y.transformCSS(t.name||this.name,`${o}${vt`${n}`}`));loadGlobalCSS=(t={})=>this.load(so,t);loadGlobalTheme=(t={},n="")=>this.load(zn,t,(o="")=>y.transformCSS(t.name||this.name,`${o}${vt`${n}`}`));getCommonTheme=t=>y.getCommon(this.name,t);getComponentTheme=t=>y.getComponent(this.name,t);getDirectiveTheme=t=>y.getDirective(this.name,t);getPresetTheme=(t,n,o)=>y.getCustomPreset(this.name,t,n,o);getLayerOrderThemeCSS=()=>y.getLayerOrderCSS(this.name);getStyleSheet=(t="",n={})=>{if(this.css){let o=R(this.css,{dt:et}),r=ht(vt`${o}${t}`),s=Object.entries(n).reduce((a,[l,c])=>a.push(`${l}="${c}"`)&&a,[]).join(" ");return`<style type="text/css" data-primeng-style-id="${this.name}" ${s}>${r}</style>`}return""};getCommonThemeStyleSheet=(t,n={})=>y.getCommonStyleSheet(this.name,t,n);getThemeStyleSheet=(t,n={})=>{let o=[y.getStyleSheet(this.name,t,n)];if(this.theme){let r=this.name==="base"?"global-style":`${this.name}-style`,s=vt`${R(this.theme,{dt:et})}`,a=ht(y.transformCSS(r,s)),l=Object.entries(n).reduce((c,[d,p])=>c.push(`${d}="${p}"`)&&c,[]).join(" ");o.push(`<style type="text/css" data-primeng-style-id="${r}" ${l}>${a}</style>`)}return o.join("")};static \u0275fac=function(n){return new(n||e)};static \u0275prov=E({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();var ao=(()=>{class e{theme=w(void 0);csp=w({nonce:void 0});isThemeChanged=!1;document=m(nt);baseStyle=m(N);constructor(){Ot(()=>{$.on("theme:change",t=>{rn(()=>{this.isThemeChanged=!0,this.theme.set(t)})})}),Ot(()=>{let t=this.theme();this.document&&t&&(this.isThemeChanged||this.onThemeChange(t),this.isThemeChanged=!1)})}ngOnDestroy(){y.clearLoadedStyleNames(),$.clear()}onThemeChange(t){y.setTheme(t),this.document&&this.loadCommonTheme()}loadCommonTheme(){if(this.theme()!=="none"&&!y.isStyleNameLoaded("common")){let{primitive:t,semantic:n,global:o,style:r}=this.baseStyle.getCommonTheme?.()||{},s={nonce:this.csp?.()?.nonce};this.baseStyle.load(t?.css,_({name:"primitive-variables"},s)),this.baseStyle.load(n?.css,_({name:"semantic-variables"},s)),this.baseStyle.load(o?.css,_({name:"global-variables"},s)),this.baseStyle.loadGlobalTheme(_({name:"global-style"},s),r),y.setLoadedStyleName("common")}}setThemeConfig(t){let{theme:n,csp:o}=t||{};n&&this.theme.set(n),o&&this.csp.set(o)}static \u0275fac=function(n){return new(n||e)};static \u0275prov=E({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})(),De=(()=>{class e extends ao{ripple=w(!1);platformId=m(mt);inputStyle=w(null);inputVariant=w(null);overlayAppendTo=w("self");overlayOptions={};csp=w({nonce:void 0});filterMatchModeOptions={text:[k.STARTS_WITH,k.CONTAINS,k.NOT_CONTAINS,k.ENDS_WITH,k.EQUALS,k.NOT_EQUALS],numeric:[k.EQUALS,k.NOT_EQUALS,k.LESS_THAN,k.LESS_THAN_OR_EQUAL_TO,k.GREATER_THAN,k.GREATER_THAN_OR_EQUAL_TO],date:[k.DATE_IS,k.DATE_IS_NOT,k.DATE_BEFORE,k.DATE_AFTER]};translation={startsWith:"Starts with",contains:"Contains",notContains:"Not contains",endsWith:"Ends with",equals:"Equals",notEquals:"Not equals",noFilter:"No Filter",lt:"Less than",lte:"Less than or equal to",gt:"Greater than",gte:"Greater than or equal to",is:"Is",isNot:"Is not",before:"Before",after:"After",dateIs:"Date is",dateIsNot:"Date is not",dateBefore:"Date is before",dateAfter:"Date is after",clear:"Clear",apply:"Apply",matchAll:"Match All",matchAny:"Match Any",addRule:"Add Rule",removeRule:"Remove Rule",accept:"Yes",reject:"No",choose:"Choose",completed:"Completed",upload:"Upload",cancel:"Cancel",pending:"Pending",fileSizeTypes:["B","KB","MB","GB","TB","PB","EB","ZB","YB"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],chooseYear:"Choose Year",chooseMonth:"Choose Month",chooseDate:"Choose Date",prevDecade:"Previous Decade",nextDecade:"Next Decade",prevYear:"Previous Year",nextYear:"Next Year",prevMonth:"Previous Month",nextMonth:"Next Month",prevHour:"Previous Hour",nextHour:"Next Hour",prevMinute:"Previous Minute",nextMinute:"Next Minute",prevSecond:"Previous Second",nextSecond:"Next Second",am:"am",pm:"pm",dateFormat:"mm/dd/yy",firstDayOfWeek:0,today:"Today",weekHeader:"Wk",weak:"Weak",medium:"Medium",strong:"Strong",passwordPrompt:"Enter a password",emptyMessage:"No results found",searchMessage:"Search results are available",selectionMessage:"{0} items selected",emptySelectionMessage:"No selected item",emptySearchMessage:"No results found",emptyFilterMessage:"No results found",fileChosenMessage:"Files",noFileChosenMessage:"No file chosen",aria:{trueLabel:"True",falseLabel:"False",nullLabel:"Not Selected",star:"1 star",stars:"{star} stars",selectAll:"All items selected",unselectAll:"All items unselected",close:"Close",previous:"Previous",next:"Next",navigation:"Navigation",scrollTop:"Scroll Top",moveTop:"Move Top",moveUp:"Move Up",moveDown:"Move Down",moveBottom:"Move Bottom",moveToTarget:"Move to Target",moveToSource:"Move to Source",moveAllToTarget:"Move All to Target",moveAllToSource:"Move All to Source",pageLabel:"{page}",firstPageLabel:"First Page",lastPageLabel:"Last Page",nextPageLabel:"Next Page",prevPageLabel:"Previous Page",rowsPerPageLabel:"Rows per page",previousPageLabel:"Previous Page",jumpToPageDropdownLabel:"Jump to Page Dropdown",jumpToPageInputLabel:"Jump to Page Input",selectRow:"Row Selected",unselectRow:"Row Unselected",expandRow:"Row Expanded",collapseRow:"Row Collapsed",showFilterMenu:"Show Filter Menu",hideFilterMenu:"Hide Filter Menu",filterOperator:"Filter Operator",filterConstraint:"Filter Constraint",editRow:"Row Edit",saveEdit:"Save Edit",cancelEdit:"Cancel Edit",listView:"List View",gridView:"Grid View",slide:"Slide",slideNumber:"{slideNumber}",zoomImage:"Zoom Image",zoomIn:"Zoom In",zoomOut:"Zoom Out",rotateRight:"Rotate Right",rotateLeft:"Rotate Left",listLabel:"Option List",selectColor:"Select a color",removeLabel:"Remove",browseFiles:"Browse Files",maximizeLabel:"Maximize",minimizeLabel:"Minimize"}};zIndex={modal:1100,overlay:1e3,menu:1e3,tooltip:1100};translationSource=new Yt;translationObserver=this.translationSource.asObservable();getTranslation(t){return this.translation[t]}setTranslation(t){this.translation=_(_({},this.translation),t),this.translationSource.next(this.translation)}setConfig(t){let{csp:n,ripple:o,inputStyle:r,inputVariant:s,theme:a,overlayOptions:l,translation:c,filterMatchModeOptions:d,overlayAppendTo:p,zIndex:u}=t||{};n&&this.csp.set(n),p&&this.overlayAppendTo.set(p),o&&this.ripple.set(o),r&&this.inputStyle.set(r),s&&this.inputVariant.set(s),l&&(this.overlayOptions=l),c&&this.setTranslation(c),d&&(this.filterMatchModeOptions=d),u&&(this.zIndex=u),a&&this.setThemeConfig({theme:a,csp:n})}static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275prov=E({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})(),lo=new ze("PRIME_NG_CONFIG");function Xr(...e){let i=e?.map(n=>({provide:lo,useValue:n,multi:!1})),t=Ze(()=>{let n=m(De);e?.forEach(o=>n.setConfig(o))});return Ge([...i,t])}var Kn=(()=>{class e extends N{name="common";static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275prov=E({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})(),M=(()=>{class e{document=m(nt);platformId=m(mt);el=m(Xt);injector=m(Ke);cd=m(sn);renderer=m(Ye);config=m(De);baseComponentStyle=m(Kn);baseStyle=m(N);scopedStyleEl;rootEl;dt;get styleOptions(){return{nonce:this.config?.csp().nonce}}get _name(){return this.constructor.name.replace(/^_/,"").toLowerCase()}get componentStyle(){return this._componentStyle}attrSelector=Nt("pc");themeChangeListeners=[];_getHostInstance(t){if(t)return t?this.hostName?t.name===this.hostName?t:this._getHostInstance(t.parentInstance):t.parentInstance:void 0}_getOptionValue(t,n="",o={}){return ce(t,n,o)}ngOnInit(){this.document&&(this._loadCoreStyles(),this._loadStyles())}ngAfterViewInit(){this.rootEl=this.el?.nativeElement,this.rootEl&&this.rootEl?.setAttribute(this.attrSelector,"")}ngOnChanges(t){if(this.document&&!un(this.platformId)){let{dt:n}=t;n&&n.currentValue&&(this._loadScopedThemeStyles(n.currentValue),this._themeChangeListener(()=>this._loadScopedThemeStyles(n.currentValue)))}}ngOnDestroy(){this._unloadScopedThemeStyles(),this.themeChangeListeners.forEach(t=>$.off("theme:change",t))}_loadStyles(){let t=()=>{St.isStyleNameLoaded("base")||(this.baseStyle.loadGlobalCSS(this.styleOptions),St.setLoadedStyleName("base")),this._loadThemeStyles()};t(),this._themeChangeListener(()=>t())}_loadCoreStyles(){!St.isStyleNameLoaded("base")&&this.componentStyle?.name&&(this.baseComponentStyle.loadCSS(this.styleOptions),this.componentStyle&&this.componentStyle?.loadCSS(this.styleOptions),St.setLoadedStyleName(this.componentStyle?.name))}_loadThemeStyles(){if(!y.isStyleNameLoaded("common")){let{primitive:t,semantic:n,global:o,style:r}=this.componentStyle?.getCommonTheme?.()||{};this.baseStyle.load(t?.css,_({name:"primitive-variables"},this.styleOptions)),this.baseStyle.load(n?.css,_({name:"semantic-variables"},this.styleOptions)),this.baseStyle.load(o?.css,_({name:"global-variables"},this.styleOptions)),this.baseStyle.loadGlobalTheme(_({name:"global-style"},this.styleOptions),r),y.setLoadedStyleName("common")}if(!y.isStyleNameLoaded(this.componentStyle?.name)&&this.componentStyle?.name){let{css:t,style:n}=this.componentStyle?.getComponentTheme?.()||{};this.componentStyle?.load(t,_({name:`${this.componentStyle?.name}-variables`},this.styleOptions)),this.componentStyle?.loadTheme(_({name:`${this.componentStyle?.name}-style`},this.styleOptions),n),y.setLoadedStyleName(this.componentStyle?.name)}if(!y.isStyleNameLoaded("layer-order")){let t=this.componentStyle?.getLayerOrderThemeCSS?.();this.baseStyle.load(t,_({name:"layer-order",first:!0},this.styleOptions)),y.setLoadedStyleName("layer-order")}this.dt&&(this._loadScopedThemeStyles(this.dt),this._themeChangeListener(()=>this._loadScopedThemeStyles(this.dt)))}_loadScopedThemeStyles(t){let{css:n}=this.componentStyle?.getPresetTheme?.(t,`[${this.attrSelector}]`)||{},o=this.componentStyle?.load(n,_({name:`${this.attrSelector}-${this.componentStyle?.name}`},this.styleOptions));this.scopedStyleEl=o?.el}_unloadScopedThemeStyles(){this.scopedStyleEl?.remove()}_themeChangeListener(t=()=>{}){St.clearLoadedStyleNames(),$.on("theme:change",t),this.themeChangeListeners.push(t)}cx(t,n={}){return bt(this._getOptionValue(this.$style?.classes,t,_({instance:this},n)))}sx(t="",n=!0,o={}){if(n)return this._getOptionValue(this.$style?.inlineStyles,t,_({instance:this},o))}get parent(){return this.parentInstance}get $style(){return this.parent?this.parent.componentStyle:this.componentStyle}cn=bt;static \u0275fac=function(n){return new(n||e)};static \u0275dir=F({type:e,inputs:{dt:"dt"},features:[L([Kn,N]),he]})}return e})();var Fe=(()=>{class e{static zindex=1e3;static calculatedScrollbarWidth=null;static calculatedScrollbarHeight=null;static browser;static addClass(t,n){t&&n&&(t.classList?t.classList.add(n):t.className+=" "+n)}static addMultipleClasses(t,n){if(t&&n)if(t.classList){let o=n.trim().split(" ");for(let r=0;r<o.length;r++)t.classList.add(o[r])}else{let o=n.split(" ");for(let r=0;r<o.length;r++)t.className+=" "+o[r]}}static removeClass(t,n){t&&n&&(t.classList?t.classList.remove(n):t.className=t.className.replace(new RegExp("(^|\\b)"+n.split(" ").join("|")+"(\\b|$)","gi")," "))}static removeMultipleClasses(t,n){t&&n&&[n].flat().filter(Boolean).forEach(o=>o.split(" ").forEach(r=>this.removeClass(t,r)))}static hasClass(t,n){return t&&n?t.classList?t.classList.contains(n):new RegExp("(^| )"+n+"( |$)","gi").test(t.className):!1}static siblings(t){return Array.prototype.filter.call(t.parentNode.children,function(n){return n!==t})}static find(t,n){return Array.from(t.querySelectorAll(n))}static findSingle(t,n){return this.isElement(t)?t.querySelector(n):null}static index(t){let n=t.parentNode.childNodes,o=0;for(var r=0;r<n.length;r++){if(n[r]==t)return o;n[r].nodeType==1&&o++}return-1}static indexWithinGroup(t,n){let o=t.parentNode?t.parentNode.childNodes:[],r=0;for(var s=0;s<o.length;s++){if(o[s]==t)return r;o[s].attributes&&o[s].attributes[n]&&o[s].nodeType==1&&r++}return-1}static appendOverlay(t,n,o="self"){o!=="self"&&t&&n&&this.appendChild(t,n)}static alignOverlay(t,n,o="self",r=!0){t&&n&&(r&&(t.style.minWidth=`${e.getOuterWidth(n)}px`),o==="self"?this.relativePosition(t,n):this.absolutePosition(t,n))}static relativePosition(t,n,o=!0){let r=D=>{if(D)return getComputedStyle(D).getPropertyValue("position")==="relative"?D:r(D.parentElement)},s=t.offsetParent?{width:t.offsetWidth,height:t.offsetHeight}:this.getHiddenElementDimensions(t),a=n.offsetHeight,l=n.getBoundingClientRect(),c=this.getWindowScrollTop(),d=this.getWindowScrollLeft(),p=this.getViewport(),h=r(t)?.getBoundingClientRect()||{top:-1*c,left:-1*d},f,b,g="top";l.top+a+s.height>p.height?(f=l.top-h.top-s.height,g="bottom",l.top+f<0&&(f=-1*l.top)):(f=a+l.top-h.top,g="top");let T=l.left+s.width-p.width,I=l.left-h.left;if(s.width>p.width?b=(l.left-h.left)*-1:T>0?b=I-T:b=l.left-h.left,t.style.top=f+"px",t.style.left=b+"px",t.style.transformOrigin=g,o){let D=Pt(/-anchor-gutter$/)?.value;t.style.marginTop=g==="bottom"?`calc(${D??"2px"} * -1)`:D??""}}static absolutePosition(t,n,o=!0){let r=t.offsetParent?{width:t.offsetWidth,height:t.offsetHeight}:this.getHiddenElementDimensions(t),s=r.height,a=r.width,l=n.offsetHeight,c=n.offsetWidth,d=n.getBoundingClientRect(),p=this.getWindowScrollTop(),u=this.getWindowScrollLeft(),h=this.getViewport(),f,b;d.top+l+s>h.height?(f=d.top+p-s,t.style.transformOrigin="bottom",f<0&&(f=p)):(f=l+d.top+p,t.style.transformOrigin="top"),d.left+a>h.width?b=Math.max(0,d.left+u+c-a):b=d.left+u,t.style.top=f+"px",t.style.left=b+"px",o&&(t.style.marginTop=origin==="bottom"?"calc(var(--p-anchor-gutter) * -1)":"calc(var(--p-anchor-gutter))")}static getParents(t,n=[]){return t.parentNode===null?n:this.getParents(t.parentNode,n.concat([t.parentNode]))}static getScrollableParents(t){let n=[];if(t){let o=this.getParents(t),r=/(auto|scroll)/,s=a=>{let l=window.getComputedStyle(a,null);return r.test(l.getPropertyValue("overflow"))||r.test(l.getPropertyValue("overflowX"))||r.test(l.getPropertyValue("overflowY"))};for(let a of o){let l=a.nodeType===1&&a.dataset.scrollselectors;if(l){let c=l.split(",");for(let d of c){let p=this.findSingle(a,d);p&&s(p)&&n.push(p)}}a.nodeType!==9&&s(a)&&n.push(a)}}return n}static getHiddenElementOuterHeight(t){t.style.visibility="hidden",t.style.display="block";let n=t.offsetHeight;return t.style.display="none",t.style.visibility="visible",n}static getHiddenElementOuterWidth(t){t.style.visibility="hidden",t.style.display="block";let n=t.offsetWidth;return t.style.display="none",t.style.visibility="visible",n}static getHiddenElementDimensions(t){let n={};return t.style.visibility="hidden",t.style.display="block",n.width=t.offsetWidth,n.height=t.offsetHeight,t.style.display="none",t.style.visibility="visible",n}static scrollInView(t,n){let o=getComputedStyle(t).getPropertyValue("borderTopWidth"),r=o?parseFloat(o):0,s=getComputedStyle(t).getPropertyValue("paddingTop"),a=s?parseFloat(s):0,l=t.getBoundingClientRect(),d=n.getBoundingClientRect().top+document.body.scrollTop-(l.top+document.body.scrollTop)-r-a,p=t.scrollTop,u=t.clientHeight,h=this.getOuterHeight(n);d<0?t.scrollTop=p+d:d+h>u&&(t.scrollTop=p+d-u+h)}static fadeIn(t,n){t.style.opacity=0;let o=+new Date,r=0,s=function(){r=+t.style.opacity.replace(",",".")+(new Date().getTime()-o)/n,t.style.opacity=r,o=+new Date,+r<1&&(window.requestAnimationFrame?window.requestAnimationFrame(s):setTimeout(s,16))};s()}static fadeOut(t,n){var o=1,r=50,s=n,a=r/s;let l=setInterval(()=>{o=o-a,o<=0&&(o=0,clearInterval(l)),t.style.opacity=o},r)}static getWindowScrollTop(){let t=document.documentElement;return(window.pageYOffset||t.scrollTop)-(t.clientTop||0)}static getWindowScrollLeft(){let t=document.documentElement;return(window.pageXOffset||t.scrollLeft)-(t.clientLeft||0)}static matches(t,n){var o=Element.prototype,r=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.msMatchesSelector||function(s){return[].indexOf.call(document.querySelectorAll(s),this)!==-1};return r.call(t,n)}static getOuterWidth(t,n){let o=t.offsetWidth;if(n){let r=getComputedStyle(t);o+=parseFloat(r.marginLeft)+parseFloat(r.marginRight)}return o}static getHorizontalPadding(t){let n=getComputedStyle(t);return parseFloat(n.paddingLeft)+parseFloat(n.paddingRight)}static getHorizontalMargin(t){let n=getComputedStyle(t);return parseFloat(n.marginLeft)+parseFloat(n.marginRight)}static innerWidth(t){let n=t.offsetWidth,o=getComputedStyle(t);return n+=parseFloat(o.paddingLeft)+parseFloat(o.paddingRight),n}static width(t){let n=t.offsetWidth,o=getComputedStyle(t);return n-=parseFloat(o.paddingLeft)+parseFloat(o.paddingRight),n}static getInnerHeight(t){let n=t.offsetHeight,o=getComputedStyle(t);return n+=parseFloat(o.paddingTop)+parseFloat(o.paddingBottom),n}static getOuterHeight(t,n){let o=t.offsetHeight;if(n){let r=getComputedStyle(t);o+=parseFloat(r.marginTop)+parseFloat(r.marginBottom)}return o}static getHeight(t){let n=t.offsetHeight,o=getComputedStyle(t);return n-=parseFloat(o.paddingTop)+parseFloat(o.paddingBottom)+parseFloat(o.borderTopWidth)+parseFloat(o.borderBottomWidth),n}static getWidth(t){let n=t.offsetWidth,o=getComputedStyle(t);return n-=parseFloat(o.paddingLeft)+parseFloat(o.paddingRight)+parseFloat(o.borderLeftWidth)+parseFloat(o.borderRightWidth),n}static getViewport(){let t=window,n=document,o=n.documentElement,r=n.getElementsByTagName("body")[0],s=t.innerWidth||o.clientWidth||r.clientWidth,a=t.innerHeight||o.clientHeight||r.clientHeight;return{width:s,height:a}}static getOffset(t){var n=t.getBoundingClientRect();return{top:n.top+(window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0),left:n.left+(window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft||0)}}static replaceElementWith(t,n){let o=t.parentNode;if(!o)throw"Can't replace element";return o.replaceChild(n,t)}static getUserAgent(){if(navigator&&this.isClient())return navigator.userAgent}static isIE(){var t=window.navigator.userAgent,n=t.indexOf("MSIE ");if(n>0)return!0;var o=t.indexOf("Trident/");if(o>0){var r=t.indexOf("rv:");return!0}var s=t.indexOf("Edge/");return s>0}static isIOS(){return/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream}static isAndroid(){return/(android)/i.test(navigator.userAgent)}static isTouchDevice(){return"ontouchstart"in window||navigator.maxTouchPoints>0}static appendChild(t,n){if(this.isElement(n))n.appendChild(t);else if(n&&n.el&&n.el.nativeElement)n.el.nativeElement.appendChild(t);else throw"Cannot append "+n+" to "+t}static removeChild(t,n){if(this.isElement(n))n.removeChild(t);else if(n.el&&n.el.nativeElement)n.el.nativeElement.removeChild(t);else throw"Cannot remove "+t+" from "+n}static removeElement(t){"remove"in Element.prototype?t.remove():t.parentNode?.removeChild(t)}static isElement(t){return typeof HTMLElement=="object"?t instanceof HTMLElement:t&&typeof t=="object"&&t!==null&&t.nodeType===1&&typeof t.nodeName=="string"}static calculateScrollbarWidth(t){if(t){let n=getComputedStyle(t);return t.offsetWidth-t.clientWidth-parseFloat(n.borderLeftWidth)-parseFloat(n.borderRightWidth)}else{if(this.calculatedScrollbarWidth!==null)return this.calculatedScrollbarWidth;let n=document.createElement("div");n.className="p-scrollbar-measure",document.body.appendChild(n);let o=n.offsetWidth-n.clientWidth;return document.body.removeChild(n),this.calculatedScrollbarWidth=o,o}}static calculateScrollbarHeight(){if(this.calculatedScrollbarHeight!==null)return this.calculatedScrollbarHeight;let t=document.createElement("div");t.className="p-scrollbar-measure",document.body.appendChild(t);let n=t.offsetHeight-t.clientHeight;return document.body.removeChild(t),this.calculatedScrollbarWidth=n,n}static invokeElementMethod(t,n,o){t[n].apply(t,o)}static clearSelection(){if(window.getSelection&&window.getSelection())window.getSelection()?.empty?window.getSelection()?.empty():window.getSelection()?.removeAllRanges&&(window.getSelection()?.rangeCount||0)>0&&(window.getSelection()?.getRangeAt(0)?.getClientRects()?.length||0)>0&&window.getSelection()?.removeAllRanges();else if(document.selection&&document.selection.empty)try{document.selection.empty()}catch{}}static getBrowser(){if(!this.browser){let t=this.resolveUserAgent();this.browser={},t.browser&&(this.browser[t.browser]=!0,this.browser.version=t.version),this.browser.chrome?this.browser.webkit=!0:this.browser.webkit&&(this.browser.safari=!0)}return this.browser}static resolveUserAgent(){let t=navigator.userAgent.toLowerCase(),n=/(chrome)[ \/]([\w.]+)/.exec(t)||/(webkit)[ \/]([\w.]+)/.exec(t)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(t)||/(msie) ([\w.]+)/.exec(t)||t.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(t)||[];return{browser:n[1]||"",version:n[2]||"0"}}static isInteger(t){return Number.isInteger?Number.isInteger(t):typeof t=="number"&&isFinite(t)&&Math.floor(t)===t}static isHidden(t){return!t||t.offsetParent===null}static isVisible(t){return t&&t.offsetParent!=null}static isExist(t){return t!==null&&typeof t<"u"&&t.nodeName&&t.parentNode}static focus(t,n){t&&document.activeElement!==t&&t.focus(n)}static getFocusableSelectorString(t=""){return`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
        [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
        input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
        select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
        textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
        [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
        [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
        .p-inputtext:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
        .p-button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`}static getFocusableElements(t,n=""){let o=this.find(t,this.getFocusableSelectorString(n)),r=[];for(let s of o){let a=getComputedStyle(s);this.isVisible(s)&&a.display!="none"&&a.visibility!="hidden"&&r.push(s)}return r}static getFocusableElement(t,n=""){let o=this.findSingle(t,this.getFocusableSelectorString(n));if(o){let r=getComputedStyle(o);if(this.isVisible(o)&&r.display!="none"&&r.visibility!="hidden")return o}return null}static getFirstFocusableElement(t,n=""){let o=this.getFocusableElements(t,n);return o.length>0?o[0]:null}static getLastFocusableElement(t,n){let o=this.getFocusableElements(t,n);return o.length>0?o[o.length-1]:null}static getNextFocusableElement(t,n=!1){let o=e.getFocusableElements(t),r=0;if(o&&o.length>0){let s=o.indexOf(o[0].ownerDocument.activeElement);n?s==-1||s===0?r=o.length-1:r=s-1:s!=-1&&s!==o.length-1&&(r=s+1)}return o[r]}static generateZIndex(){return this.zindex=this.zindex||999,++this.zindex}static getSelection(){return window.getSelection?window.getSelection()?.toString():document.getSelection?document.getSelection()?.toString():document.selection?document.selection.createRange().text:null}static getTargetElement(t,n){if(!t)return null;switch(t){case"document":return document;case"window":return window;case"@next":return n?.nextElementSibling;case"@prev":return n?.previousElementSibling;case"@parent":return n?.parentElement;case"@grandparent":return n?.parentElement?.parentElement;default:let o=typeof t;if(o==="string")return document.querySelector(t);if(o==="object"&&t.hasOwnProperty("nativeElement"))return this.isExist(t.nativeElement)?t.nativeElement:void 0;let s=(a=>!!(a&&a.constructor&&a.call&&a.apply))(t)?t():t;return s&&s.nodeType===9||this.isExist(s)?s:null}}static isClient(){return!!(typeof window<"u"&&window.document&&window.document.createElement)}static getAttribute(t,n){if(t){let o=t.getAttribute(n);return isNaN(o)?o==="true"||o==="false"?o==="true":o:+o}}static calculateBodyScrollbarWidth(){return window.innerWidth-document.documentElement.offsetWidth}static blockBodyScroll(t="p-overflow-hidden"){document.body.style.setProperty("--scrollbar-width",this.calculateBodyScrollbarWidth()+"px"),this.addClass(document.body,t)}static unblockBodyScroll(t="p-overflow-hidden"){document.body.style.removeProperty("--scrollbar-width"),this.removeClass(document.body,t)}static createElement(t,n={},...o){if(t){let r=document.createElement(t);return this.setAttributes(r,n),r.append(...o),r}}static setAttribute(t,n="",o){this.isElement(t)&&o!==null&&o!==void 0&&t.setAttribute(n,o)}static setAttributes(t,n={}){if(this.isElement(t)){let o=(r,s)=>{let a=t?.$attrs?.[r]?[t?.$attrs?.[r]]:[];return[s].flat().reduce((l,c)=>{if(c!=null){let d=typeof c;if(d==="string"||d==="number")l.push(c);else if(d==="object"){let p=Array.isArray(c)?o(r,c):Object.entries(c).map(([u,h])=>r==="style"&&(h||h===0)?`${u.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()}:${h}`:h?u:void 0);l=p.length?l.concat(p.filter(u=>!!u)):l}}return l},a)};Object.entries(n).forEach(([r,s])=>{if(s!=null){let a=r.match(/^on(.+)/);a?t.addEventListener(a[1].toLowerCase(),s):r==="pBind"?this.setAttributes(t,s):(s=r==="class"?[...new Set(o("class",s))].join(" ").trim():r==="style"?o("style",s).join(";").trim():s,(t.$attrs=t.$attrs||{})&&(t.$attrs[r]=s),t.setAttribute(r,s))}})}}static isFocusableElement(t,n=""){return this.isElement(t)?t.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${n},
                [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${n},
                input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${n},
                select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${n},
                textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${n},
                [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${n},
                [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${n}`):!1}}return e})();function ms(){vn({variableName:Re("scrollbar.width").name})}function fs(){Sn({variableName:Re("scrollbar.width").name})}var qn=class{element;listener;scrollableParents;constructor(i,t=()=>{}){this.element=i,this.listener=t}bindScrollListener(){this.scrollableParents=Fe.getScrollableParents(this.element);for(let i=0;i<this.scrollableParents.length;i++)this.scrollableParents[i].addEventListener("scroll",this.listener)}unbindScrollListener(){if(this.scrollableParents)for(let i=0;i<this.scrollableParents.length;i++)this.scrollableParents[i].removeEventListener("scroll",this.listener)}destroy(){this.unbindScrollListener(),this.element=null,this.listener=null,this.scrollableParents=null}};var Yn=(()=>{class e extends M{autofocus=!1;focused=!1;platformId=m(mt);document=m(nt);host=m(Xt);ngAfterContentChecked(){this.autofocus===!1?this.host.nativeElement.removeAttribute("autofocus"):this.host.nativeElement.setAttribute("autofocus",!0),this.focused||this.autoFocus()}ngAfterViewChecked(){this.focused||this.autoFocus()}autoFocus(){oe(this.platformId)&&this.autofocus&&setTimeout(()=>{let t=Fe.getFocusableElements(this.host?.nativeElement);t.length===0&&this.host.nativeElement.focus(),t.length>0&&t[0].focus(),this.focused=!0})}static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275dir=F({type:e,selectors:[["","pAutoFocus",""]],inputs:{autofocus:[0,"pAutoFocus","autofocus"]},features:[O]})}return e})();var Qn=`
    .p-badge {
        display: inline-flex;
        border-radius: dt('badge.border.radius');
        align-items: center;
        justify-content: center;
        padding: dt('badge.padding');
        background: dt('badge.primary.background');
        color: dt('badge.primary.color');
        font-size: dt('badge.font.size');
        font-weight: dt('badge.font.weight');
        min-width: dt('badge.min.width');
        height: dt('badge.height');
    }

    .p-badge-dot {
        width: dt('badge.dot.size');
        min-width: dt('badge.dot.size');
        height: dt('badge.dot.size');
        border-radius: 50%;
        padding: 0;
    }

    .p-badge-circle {
        padding: 0;
        border-radius: 50%;
    }

    .p-badge-secondary {
        background: dt('badge.secondary.background');
        color: dt('badge.secondary.color');
    }

    .p-badge-success {
        background: dt('badge.success.background');
        color: dt('badge.success.color');
    }

    .p-badge-info {
        background: dt('badge.info.background');
        color: dt('badge.info.color');
    }

    .p-badge-warn {
        background: dt('badge.warn.background');
        color: dt('badge.warn.color');
    }

    .p-badge-danger {
        background: dt('badge.danger.background');
        color: dt('badge.danger.color');
    }

    .p-badge-contrast {
        background: dt('badge.contrast.background');
        color: dt('badge.contrast.color');
    }

    .p-badge-sm {
        font-size: dt('badge.sm.font.size');
        min-width: dt('badge.sm.min.width');
        height: dt('badge.sm.height');
    }

    .p-badge-lg {
        font-size: dt('badge.lg.font.size');
        min-width: dt('badge.lg.min.width');
        height: dt('badge.lg.height');
    }

    .p-badge-xl {
        font-size: dt('badge.xl.font.size');
        min-width: dt('badge.xl.min.width');
        height: dt('badge.xl.height');
    }
`;var co=`
    ${Qn}

    /* For PrimeNG (directive)*/
    .p-overlay-badge {
        position: relative;
    }

    .p-overlay-badge > .p-badge {
        position: absolute;
        top: 0;
        inset-inline-end: 0;
        transform: translate(50%, -50%);
        transform-origin: 100% 0;
        margin: 0;
    }
`,uo={root:({instance:e})=>["p-badge p-component",{"p-badge-circle":C(e.value())&&String(e.value()).length===1,"p-badge-dot":Y(e.value()),"p-badge-sm":e.size()==="small"||e.badgeSize()==="small","p-badge-lg":e.size()==="large"||e.badgeSize()==="large","p-badge-xl":e.size()==="xlarge"||e.badgeSize()==="xlarge","p-badge-info":e.severity()==="info","p-badge-success":e.severity()==="success","p-badge-warn":e.severity()==="warn","p-badge-danger":e.severity()==="danger","p-badge-secondary":e.severity()==="secondary","p-badge-contrast":e.severity()==="contrast"}]},Xn=(()=>{class e extends N{name="badge";theme=co;classes=uo;static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275prov=E({token:e,factory:e.\u0275fac})}return e})();var Be=(()=>{class e extends M{styleClass=q();badgeSize=q();size=q();severity=q();value=q();badgeDisabled=q(!1,{transform:x});_componentStyle=m(Xn);static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275cmp=j({type:e,selectors:[["p-badge"]],hostVars:4,hostBindings:function(n,o){n&2&&(H(o.cn(o.cx("root"),o.styleClass())),on("display",o.badgeDisabled()?"none":null))},inputs:{styleClass:[1,"styleClass"],badgeSize:[1,"badgeSize"],size:[1,"size"],severity:[1,"severity"],value:[1,"value"],badgeDisabled:[1,"badgeDisabled"]},features:[L([Xn]),O],decls:1,vars:1,template:function(n,o){n&1&&ne(0),n&2&&ie(o.value())},dependencies:[Z,st],encapsulation:2,changeDetection:0})}return e})(),Zn=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=X({type:e});static \u0275inj=Q({imports:[Be,st,st]})}return e})();var ho=["*"],mo={root:"p-fluid"},Jn=(()=>{class e extends N{name="fluid";classes=mo;static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275prov=E({token:e,factory:e.\u0275fac})}return e})();var $e=(()=>{class e extends M{_componentStyle=m(Jn);static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275cmp=j({type:e,selectors:[["p-fluid"]],hostVars:2,hostBindings:function(n,o){n&2&&H(o.cx("root"))},features:[L([Jn]),O],ngContentSelectors:ho,decls:1,vars:0,template:function(n,o){n&1&&(dt(),ut(0))},dependencies:[Z],encapsulation:2,changeDetection:0})}return e})();var fo=["*"],bo=`
.p-icon {
    display: inline-block;
    vertical-align: baseline;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`,ti=(()=>{class e extends N{name="baseicon";css=bo;static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275prov=E({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})();var ei=(()=>{class e extends M{spin=!1;_componentStyle=m(ti);getClassNames(){return bt("p-icon",{"p-icon-spin":this.spin})}static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275cmp=j({type:e,selectors:[["ng-component"]],hostAttrs:["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],hostVars:2,hostBindings:function(n,o){n&2&&H(o.getClassNames())},inputs:{spin:[2,"spin","spin",x]},features:[L([ti]),O],ngContentSelectors:fo,decls:1,vars:0,template:function(n,o){n&1&&(dt(),ut(0))},encapsulation:2,changeDetection:0})}return e})();var go=["data-p-icon","spinner"],ni=(()=>{class e extends ei{pathId;ngOnInit(){super.ngOnInit(),this.pathId="url(#"+Nt()+")"}static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275cmp=j({type:e,selectors:[["","data-p-icon","spinner"]],features:[O],attrs:go,decls:5,vars:2,consts:[["d","M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z","fill","currentColor"],[3,"id"],["width","14","height","14","fill","white"]],template:function(n,o){n&1&&(Qt(),be(0,"g"),ye(1,"path",0),ge(),be(2,"defs")(3,"clipPath",1),ye(4,"rect",2),ge()()),n&2&&(it("clip-path",o.pathId),A(3),tn("id",o.pathId))},encapsulation:2})}return e})();var ii=`
    .p-ink {
        display: block;
        position: absolute;
        background: dt('ripple.background');
        border-radius: 100%;
        transform: scale(0);
        pointer-events: none;
    }

    .p-ink-active {
        animation: ripple 0.4s linear;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`;var yo=`
    ${ii}
    /* For PrimeNG */
    .p-ripple {
        overflow: hidden;
        position: relative;
    }

    .p-ripple-disabled .p-ink {
        display: none !important;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`,vo={root:"p-ink"},oi=(()=>{class e extends N{name="ripple";theme=yo;classes=vo;static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275prov=E({token:e,factory:e.\u0275fac})}return e})();var ri=(()=>{class e extends M{zone=m(Xe);_componentStyle=m(oi);animationListener;mouseDownListener;timeout;constructor(){super(),Ot(()=>{oe(this.platformId)&&(this.config.ripple()?this.zone.runOutsideAngular(()=>{this.create(),this.mouseDownListener=this.renderer.listen(this.el.nativeElement,"mousedown",this.onMouseDown.bind(this))}):this.remove())})}ngAfterViewInit(){super.ngAfterViewInit()}onMouseDown(t){let n=this.getInk();if(!n||this.document.defaultView?.getComputedStyle(n,null).display==="none")return;if(ot(n,"p-ink-active"),!Oe(n)&&!ke(n)){let a=Math.max(Ie(this.el.nativeElement),ae(this.el.nativeElement));n.style.height=a+"px",n.style.width=a+"px"}let o=Pe(this.el.nativeElement),r=t.pageX-o.left+this.document.body.scrollTop-ke(n)/2,s=t.pageY-o.top+this.document.body.scrollLeft-Oe(n)/2;this.renderer.setStyle(n,"top",s+"px"),this.renderer.setStyle(n,"left",r+"px"),J(n,"p-ink-active"),this.timeout=setTimeout(()=>{let a=this.getInk();a&&ot(a,"p-ink-active")},401)}getInk(){let t=this.el.nativeElement.children;for(let n=0;n<t.length;n++)if(typeof t[n].className=="string"&&t[n].className.indexOf("p-ink")!==-1)return t[n];return null}resetInk(){let t=this.getInk();t&&ot(t,"p-ink-active")}onAnimationEnd(t){this.timeout&&clearTimeout(this.timeout),ot(t.currentTarget,"p-ink-active")}create(){let t=this.renderer.createElement("span");this.renderer.addClass(t,"p-ink"),this.renderer.appendChild(this.el.nativeElement,t),this.renderer.setAttribute(t,"aria-hidden","true"),this.renderer.setAttribute(t,"role","presentation"),this.animationListener||(this.animationListener=this.renderer.listen(t,"animationend",this.onAnimationEnd.bind(this)))}remove(){let t=this.getInk();t&&(this.mouseDownListener&&this.mouseDownListener(),this.animationListener&&this.animationListener(),this.mouseDownListener=null,this.animationListener=null,Tn(t))}ngOnDestroy(){this.config&&this.config.ripple()&&this.remove(),super.ngOnDestroy()}static \u0275fac=function(n){return new(n||e)};static \u0275dir=F({type:e,selectors:[["","pRipple",""]],hostAttrs:[1,"p-ripple"],features:[L([oi]),O]})}return e})();var si=`
    .p-button {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        color: dt('button.primary.color');
        background: dt('button.primary.background');
        border: 1px solid dt('button.primary.border.color');
        padding: dt('button.padding.y') dt('button.padding.x');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('button.transition.duration'),
            color dt('button.transition.duration'),
            border-color dt('button.transition.duration'),
            outline-color dt('button.transition.duration'),
            box-shadow dt('button.transition.duration');
        border-radius: dt('button.border.radius');
        outline-color: transparent;
        gap: dt('button.gap');
    }

    .p-button:disabled {
        cursor: default;
    }

    .p-button-icon-right {
        order: 1;
    }

    .p-button-icon-right:dir(rtl) {
        order: -1;
    }

    .p-button:not(.p-button-vertical) .p-button-icon:not(.p-button-icon-right):dir(rtl) {
        order: 1;
    }

    .p-button-icon-bottom {
        order: 2;
    }

    .p-button-icon-only {
        width: dt('button.icon.only.width');
        padding-inline-start: 0;
        padding-inline-end: 0;
        gap: 0;
    }

    .p-button-icon-only.p-button-rounded {
        border-radius: 50%;
        height: dt('button.icon.only.width');
    }

    .p-button-icon-only .p-button-label {
        visibility: hidden;
        width: 0;
    }

    .p-button-icon-only::after {
        content: "\0A0";
        visibility: hidden;
        width: 0;
    }

    .p-button-sm {
        font-size: dt('button.sm.font.size');
        padding: dt('button.sm.padding.y') dt('button.sm.padding.x');
    }

    .p-button-sm .p-button-icon {
        font-size: dt('button.sm.font.size');
    }

    .p-button-sm.p-button-icon-only {
        width: dt('button.sm.icon.only.width');
    }

    .p-button-sm.p-button-icon-only.p-button-rounded {
        height: dt('button.sm.icon.only.width');
    }

    .p-button-lg {
        font-size: dt('button.lg.font.size');
        padding: dt('button.lg.padding.y') dt('button.lg.padding.x');
    }

    .p-button-lg .p-button-icon {
        font-size: dt('button.lg.font.size');
    }

    .p-button-lg.p-button-icon-only {
        width: dt('button.lg.icon.only.width');
    }

    .p-button-lg.p-button-icon-only.p-button-rounded {
        height: dt('button.lg.icon.only.width');
    }

    .p-button-vertical {
        flex-direction: column;
    }

    .p-button-label {
        font-weight: dt('button.label.font.weight');
    }

    .p-button-fluid {
        width: 100%;
    }

    .p-button-fluid.p-button-icon-only {
        width: dt('button.icon.only.width');
    }

    .p-button:not(:disabled):hover {
        background: dt('button.primary.hover.background');
        border: 1px solid dt('button.primary.hover.border.color');
        color: dt('button.primary.hover.color');
    }

    .p-button:not(:disabled):active {
        background: dt('button.primary.active.background');
        border: 1px solid dt('button.primary.active.border.color');
        color: dt('button.primary.active.color');
    }

    .p-button:focus-visible {
        box-shadow: dt('button.primary.focus.ring.shadow');
        outline: dt('button.focus.ring.width') dt('button.focus.ring.style') dt('button.primary.focus.ring.color');
        outline-offset: dt('button.focus.ring.offset');
    }

    .p-button .p-badge {
        min-width: dt('button.badge.size');
        height: dt('button.badge.size');
        line-height: dt('button.badge.size');
    }

    .p-button-raised {
        box-shadow: dt('button.raised.shadow');
    }

    .p-button-rounded {
        border-radius: dt('button.rounded.border.radius');
    }

    .p-button-secondary {
        background: dt('button.secondary.background');
        border: 1px solid dt('button.secondary.border.color');
        color: dt('button.secondary.color');
    }

    .p-button-secondary:not(:disabled):hover {
        background: dt('button.secondary.hover.background');
        border: 1px solid dt('button.secondary.hover.border.color');
        color: dt('button.secondary.hover.color');
    }

    .p-button-secondary:not(:disabled):active {
        background: dt('button.secondary.active.background');
        border: 1px solid dt('button.secondary.active.border.color');
        color: dt('button.secondary.active.color');
    }

    .p-button-secondary:focus-visible {
        outline-color: dt('button.secondary.focus.ring.color');
        box-shadow: dt('button.secondary.focus.ring.shadow');
    }

    .p-button-success {
        background: dt('button.success.background');
        border: 1px solid dt('button.success.border.color');
        color: dt('button.success.color');
    }

    .p-button-success:not(:disabled):hover {
        background: dt('button.success.hover.background');
        border: 1px solid dt('button.success.hover.border.color');
        color: dt('button.success.hover.color');
    }

    .p-button-success:not(:disabled):active {
        background: dt('button.success.active.background');
        border: 1px solid dt('button.success.active.border.color');
        color: dt('button.success.active.color');
    }

    .p-button-success:focus-visible {
        outline-color: dt('button.success.focus.ring.color');
        box-shadow: dt('button.success.focus.ring.shadow');
    }

    .p-button-info {
        background: dt('button.info.background');
        border: 1px solid dt('button.info.border.color');
        color: dt('button.info.color');
    }

    .p-button-info:not(:disabled):hover {
        background: dt('button.info.hover.background');
        border: 1px solid dt('button.info.hover.border.color');
        color: dt('button.info.hover.color');
    }

    .p-button-info:not(:disabled):active {
        background: dt('button.info.active.background');
        border: 1px solid dt('button.info.active.border.color');
        color: dt('button.info.active.color');
    }

    .p-button-info:focus-visible {
        outline-color: dt('button.info.focus.ring.color');
        box-shadow: dt('button.info.focus.ring.shadow');
    }

    .p-button-warn {
        background: dt('button.warn.background');
        border: 1px solid dt('button.warn.border.color');
        color: dt('button.warn.color');
    }

    .p-button-warn:not(:disabled):hover {
        background: dt('button.warn.hover.background');
        border: 1px solid dt('button.warn.hover.border.color');
        color: dt('button.warn.hover.color');
    }

    .p-button-warn:not(:disabled):active {
        background: dt('button.warn.active.background');
        border: 1px solid dt('button.warn.active.border.color');
        color: dt('button.warn.active.color');
    }

    .p-button-warn:focus-visible {
        outline-color: dt('button.warn.focus.ring.color');
        box-shadow: dt('button.warn.focus.ring.shadow');
    }

    .p-button-help {
        background: dt('button.help.background');
        border: 1px solid dt('button.help.border.color');
        color: dt('button.help.color');
    }

    .p-button-help:not(:disabled):hover {
        background: dt('button.help.hover.background');
        border: 1px solid dt('button.help.hover.border.color');
        color: dt('button.help.hover.color');
    }

    .p-button-help:not(:disabled):active {
        background: dt('button.help.active.background');
        border: 1px solid dt('button.help.active.border.color');
        color: dt('button.help.active.color');
    }

    .p-button-help:focus-visible {
        outline-color: dt('button.help.focus.ring.color');
        box-shadow: dt('button.help.focus.ring.shadow');
    }

    .p-button-danger {
        background: dt('button.danger.background');
        border: 1px solid dt('button.danger.border.color');
        color: dt('button.danger.color');
    }

    .p-button-danger:not(:disabled):hover {
        background: dt('button.danger.hover.background');
        border: 1px solid dt('button.danger.hover.border.color');
        color: dt('button.danger.hover.color');
    }

    .p-button-danger:not(:disabled):active {
        background: dt('button.danger.active.background');
        border: 1px solid dt('button.danger.active.border.color');
        color: dt('button.danger.active.color');
    }

    .p-button-danger:focus-visible {
        outline-color: dt('button.danger.focus.ring.color');
        box-shadow: dt('button.danger.focus.ring.shadow');
    }

    .p-button-contrast {
        background: dt('button.contrast.background');
        border: 1px solid dt('button.contrast.border.color');
        color: dt('button.contrast.color');
    }

    .p-button-contrast:not(:disabled):hover {
        background: dt('button.contrast.hover.background');
        border: 1px solid dt('button.contrast.hover.border.color');
        color: dt('button.contrast.hover.color');
    }

    .p-button-contrast:not(:disabled):active {
        background: dt('button.contrast.active.background');
        border: 1px solid dt('button.contrast.active.border.color');
        color: dt('button.contrast.active.color');
    }

    .p-button-contrast:focus-visible {
        outline-color: dt('button.contrast.focus.ring.color');
        box-shadow: dt('button.contrast.focus.ring.shadow');
    }

    .p-button-outlined {
        background: transparent;
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):hover {
        background: dt('button.outlined.primary.hover.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):active {
        background: dt('button.outlined.primary.active.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined.p-button-secondary {
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):hover {
        background: dt('button.outlined.secondary.hover.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):active {
        background: dt('button.outlined.secondary.active.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-success {
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):hover {
        background: dt('button.outlined.success.hover.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):active {
        background: dt('button.outlined.success.active.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-info {
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):hover {
        background: dt('button.outlined.info.hover.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):active {
        background: dt('button.outlined.info.active.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-warn {
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):hover {
        background: dt('button.outlined.warn.hover.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):active {
        background: dt('button.outlined.warn.active.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-help {
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):hover {
        background: dt('button.outlined.help.hover.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):active {
        background: dt('button.outlined.help.active.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-danger {
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):hover {
        background: dt('button.outlined.danger.hover.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):active {
        background: dt('button.outlined.danger.active.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-contrast {
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):hover {
        background: dt('button.outlined.contrast.hover.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):active {
        background: dt('button.outlined.contrast.active.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-plain {
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):hover {
        background: dt('button.outlined.plain.hover.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):active {
        background: dt('button.outlined.plain.active.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-text {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):hover {
        background: dt('button.text.primary.hover.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):active {
        background: dt('button.text.primary.active.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text.p-button-secondary {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):hover {
        background: dt('button.text.secondary.hover.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):active {
        background: dt('button.text.secondary.active.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-success {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):hover {
        background: dt('button.text.success.hover.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):active {
        background: dt('button.text.success.active.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-info {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):hover {
        background: dt('button.text.info.hover.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):active {
        background: dt('button.text.info.active.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-warn {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):hover {
        background: dt('button.text.warn.hover.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):active {
        background: dt('button.text.warn.active.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-help {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):hover {
        background: dt('button.text.help.hover.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):active {
        background: dt('button.text.help.active.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-danger {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):hover {
        background: dt('button.text.danger.hover.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):active {
        background: dt('button.text.danger.active.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-contrast {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):hover {
        background: dt('button.text.contrast.hover.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):active {
        background: dt('button.text.contrast.active.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-plain {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):hover {
        background: dt('button.text.plain.hover.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):active {
        background: dt('button.text.plain.active.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-link {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.color');
    }

    .p-button-link:not(:disabled):hover {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.hover.color');
    }

    .p-button-link:not(:disabled):hover .p-button-label {
        text-decoration: underline;
    }

    .p-button-link:not(:disabled):active {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.active.color');
    }
`;var So=["content"],Co=["loadingicon"],Eo=["icon"],wo=["*"],ci=e=>({class:e});function To(e,i){e&1&&Je(0)}function _o(e,i){if(e&1&&Tt(0,"span"),e&2){let t=U(3);H(t.cn(t.cx("loadingIcon"),"pi-spin",t.loadingIcon)),it("aria-hidden",!0)("data-pc-section","loadingicon")}}function xo(e,i){if(e&1&&(Qt(),Tt(0,"svg",7)),e&2){let t=U(3);H(t.cn(t.cx("loadingIcon"),t.spinnerIconClass())),P("spin",!0),it("aria-hidden",!0)("data-pc-section","loadingicon")}}function Io(e,i){if(e&1&&(Jt(0),ct(1,_o,1,4,"span",3)(2,xo,1,5,"svg",6),te()),e&2){let t=U(2);A(),P("ngIf",t.loadingIcon),A(),P("ngIf",!t.loadingIcon)}}function Oo(e,i){}function Po(e,i){if(e&1&&ct(0,Oo,0,0,"ng-template",8),e&2){let t=U(2);P("ngIf",t.loadingIconTemplate||t._loadingIconTemplate)}}function ko(e,i){if(e&1&&(Jt(0),ct(1,Io,3,2,"ng-container",2)(2,Po,1,1,null,5),te()),e&2){let t=U();A(),P("ngIf",!t.loadingIconTemplate&&!t._loadingIconTemplate),A(),P("ngTemplateOutlet",t.loadingIconTemplate||t._loadingIconTemplate)("ngTemplateOutletContext",Se(3,ci,t.cx("loadingIcon")))}}function No(e,i){if(e&1&&Tt(0,"span"),e&2){let t=U(2);H(t.cn("icon",t.iconClass())),it("data-pc-section","icon")}}function Ao(e,i){}function Lo(e,i){if(e&1&&ct(0,Ao,0,0,"ng-template",8),e&2){let t=U(2);P("ngIf",!t.icon&&(t.iconTemplate||t._iconTemplate))}}function Mo(e,i){if(e&1&&(Jt(0),ct(1,No,1,3,"span",3)(2,Lo,1,1,null,5),te()),e&2){let t=U();A(),P("ngIf",t.icon&&!t.iconTemplate&&!t._iconTemplate),A(),P("ngTemplateOutlet",t.iconTemplate||t._iconTemplate)("ngTemplateOutletContext",Se(3,ci,t.cx("icon")))}}function Ro(e,i){if(e&1&&(me(0,"span"),ne(1),fe()),e&2){let t=U();H(t.cx("label")),it("aria-hidden",t.icon&&!t.label)("data-pc-section","label"),A(),ie(t.label)}}function Do(e,i){if(e&1&&Tt(0,"p-badge",9),e&2){let t=U();P("value",t.badge)("severity",t.badgeSeverity)}}var Fo={root:({instance:e})=>["p-button p-component",{"p-button-icon-only":(e.icon||e.buttonProps?.icon||e.iconTemplate||e._iconTemplate||e.loadingIcon||e.loadingIconTemplate||e._loadingIconTemplate)&&!e.label&&!e.buttonProps?.label,"p-button-vertical":(e.iconPos==="top"||e.iconPos==="bottom")&&e.label,"p-button-loading":e.loading||e.buttonProps?.loading,"p-button-link":e.link||e.buttonProps?.link,[`p-button-${e.severity||e.buttonProps?.severity}`]:e.severity||e.buttonProps?.severity,"p-button-raised":e.raised||e.buttonProps?.raised,"p-button-rounded":e.rounded||e.buttonProps?.rounded,"p-button-text":e.text||e.variant==="text"||e.buttonProps?.text||e.buttonProps?.variant==="text","p-button-outlined":e.outlined||e.variant==="outlined"||e.buttonProps?.outlined||e.buttonProps?.variant==="outlined","p-button-sm":e.size==="small"||e.buttonProps?.size==="small","p-button-lg":e.size==="large"||e.buttonProps?.size==="large","p-button-plain":e.plain||e.buttonProps?.plain,"p-button-fluid":e.hasFluid}],loadingIcon:"p-button-loading-icon",icon:({instance:e})=>["p-button-icon",{[`p-button-icon-${e.iconPos||e.buttonProps?.iconPos}`]:e.label||e.buttonProps?.label,"p-button-icon-left":(e.iconPos==="left"||e.buttonProps?.iconPos==="left")&&e.label||e.buttonProps?.label,"p-button-icon-right":(e.iconPos==="right"||e.buttonProps?.iconPos==="right")&&e.label||e.buttonProps?.label},e.icon,e.buttonProps?.icon],spinnerIcon:({instance:e})=>Object.entries(e.iconClass()).filter(([,i])=>!!i).reduce((i,[t])=>i+` ${t}`,"p-button-loading-icon"),label:"p-button-label"},lt=(()=>{class e extends N{name="button";theme=si;classes=Fo;static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275prov=E({token:e,factory:e.\u0275fac})}return e})();var at={button:"p-button",component:"p-component",iconOnly:"p-button-icon-only",disabled:"p-disabled",loading:"p-button-loading",labelOnly:"p-button-loading-label-only"},ai=(()=>{class e extends M{_componentStyle=m(lt);static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275dir=F({type:e,selectors:[["","pButtonLabel",""]],hostVars:2,hostBindings:function(n,o){n&2&&ee("p-button-label",!0)},features:[L([lt]),O]})}return e})(),li=(()=>{class e extends M{_componentStyle=m(lt);static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275dir=F({type:e,selectors:[["","pButtonIcon",""]],hostVars:2,hostBindings:function(n,o){n&2&&ee("p-button-icon",!0)},features:[L([lt]),O]})}return e})(),Va=(()=>{class e extends M{iconPos="left";loadingIcon;set label(t){this._label=t,this.initialized&&(this.updateLabel(),this.updateIcon(),this.setStyleClass())}set icon(t){this._icon=t,this.initialized&&(this.updateIcon(),this.setStyleClass())}get loading(){return this._loading}set loading(t){this._loading=t,this.initialized&&(this.updateIcon(),this.setStyleClass())}_buttonProps;iconSignal=Ce(li);labelSignal=Ce(ai);isIconOnly=pt(()=>!!(!this.labelSignal()&&this.iconSignal()));set buttonProps(t){this._buttonProps=t,t&&typeof t=="object"&&Object.entries(t).forEach(([n,o])=>this[`_${n}`]!==o&&(this[`_${n}`]=o))}_severity;get severity(){return this._severity}set severity(t){this._severity=t,this.initialized&&this.setStyleClass()}raised=!1;rounded=!1;text=!1;outlined=!1;size=null;plain=!1;fluid=q(void 0,{transform:x});_label;_icon;_loading=!1;initialized;get htmlElement(){return this.el.nativeElement}_internalClasses=Object.values(at);pcFluid=m($e,{optional:!0,host:!0,skipSelf:!0});isTextButton=pt(()=>!!(!this.iconSignal()&&this.labelSignal()&&this.text));get label(){return this._label}get icon(){return this._icon}get buttonProps(){return this._buttonProps}spinnerIcon=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="p-icon-spin">
        <g clip-path="url(#clip0_417_21408)">
            <path
                d="M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z"
                fill="currentColor"
            />
        </g>
        <defs>
            <clipPath id="clip0_417_21408">
                <rect width="14" height="14" fill="white" />
            </clipPath>
        </defs>
    </svg>`;_componentStyle=m(lt);ngAfterViewInit(){super.ngAfterViewInit(),J(this.htmlElement,this.getStyleClass().join(" ")),this.createIcon(),this.createLabel(),this.initialized=!0}getStyleClass(){let t=[at.button,at.component];return this.icon&&!this.label&&Y(this.htmlElement.textContent)&&t.push(at.iconOnly),this.loading&&(t.push(at.disabled,at.loading),!this.icon&&this.label&&t.push(at.labelOnly),this.icon&&!this.label&&!Y(this.htmlElement.textContent)&&t.push(at.iconOnly)),this.text&&t.push("p-button-text"),this.severity&&t.push(`p-button-${this.severity}`),this.plain&&t.push("p-button-plain"),this.raised&&t.push("p-button-raised"),this.size&&t.push(`p-button-${this.size}`),this.outlined&&t.push("p-button-outlined"),this.rounded&&t.push("p-button-rounded"),this.size==="small"&&t.push("p-button-sm"),this.size==="large"&&t.push("p-button-lg"),this.hasFluid&&t.push("p-button-fluid"),t}get hasFluid(){return this.fluid()??!!this.pcFluid}setStyleClass(){let t=this.getStyleClass();this.removeExistingSeverityClass(),this.htmlElement.classList.remove(...this._internalClasses),this.htmlElement.classList.add(...t)}removeExistingSeverityClass(){let t=["success","info","warn","danger","help","primary","secondary","contrast"],n=this.htmlElement.classList.value.split(" ").find(o=>t.some(r=>o===`p-button-${r}`));n&&this.htmlElement.classList.remove(n)}createLabel(){if(!gt(this.htmlElement,".p-button-label")&&this.label){let n=this.document.createElement("span");this.icon&&!this.label&&n.setAttribute("aria-hidden","true"),n.className="p-button-label",n.appendChild(this.document.createTextNode(this.label)),this.htmlElement.appendChild(n)}}createIcon(){if(!gt(this.htmlElement,".p-button-icon")&&(this.icon||this.loading)){let n=this.document.createElement("span");n.className="p-button-icon",n.setAttribute("aria-hidden","true");let o=this.label?"p-button-icon-"+this.iconPos:null;o&&J(n,o);let r=this.getIconClass();r&&J(n,r),!this.loadingIcon&&this.loading&&(n.innerHTML=this.spinnerIcon),this.htmlElement.insertBefore(n,this.htmlElement.firstChild)}}updateLabel(){let t=gt(this.htmlElement,".p-button-label");if(!this.label){t&&this.htmlElement.removeChild(t);return}t?t.textContent=this.label:this.createLabel()}updateIcon(){let t=gt(this.htmlElement,".p-button-icon"),n=gt(this.htmlElement,".p-button-label");this.loading&&!this.loadingIcon&&t?t.innerHTML=this.spinnerIcon:t?.innerHTML&&(t.innerHTML=""),t?this.iconPos?t.className="p-button-icon "+(n?"p-button-icon-"+this.iconPos:"")+" "+this.getIconClass():t.className="p-button-icon "+this.getIconClass():this.createIcon()}getIconClass(){return this.loading?"p-button-loading-icon "+(this.loadingIcon?this.loadingIcon:"p-icon"):this.icon||"p-hidden"}ngOnDestroy(){this.initialized=!1,super.ngOnDestroy()}static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275dir=F({type:e,selectors:[["","pButton",""]],contentQueries:function(n,o,r){n&1&&(ve(r,o.iconSignal,li,5),ve(r,o.labelSignal,ai,5)),n&2&&nn(2)},hostVars:4,hostBindings:function(n,o){n&2&&ee("p-button-icon-only",o.isIconOnly())("p-button-text",o.isTextButton())},inputs:{iconPos:"iconPos",loadingIcon:"loadingIcon",loading:"loading",severity:"severity",raised:[2,"raised","raised",x],rounded:[2,"rounded","rounded",x],text:[2,"text","text",x],outlined:[2,"outlined","outlined",x],size:"size",plain:[2,"plain","plain",x],fluid:[1,"fluid"],label:"label",icon:"icon",buttonProps:"buttonProps"},features:[L([lt]),O]})}return e})(),Bo=(()=>{class e extends M{type="button";iconPos="left";icon;badge;label;disabled;loading=!1;loadingIcon;raised=!1;rounded=!1;text=!1;plain=!1;severity;outlined=!1;link=!1;tabindex;size;variant;style;styleClass;badgeClass;badgeSeverity="secondary";ariaLabel;buttonProps;autofocus;fluid=q(void 0,{transform:x});onClick=new Zt;onFocus=new Zt;onBlur=new Zt;contentTemplate;loadingIconTemplate;iconTemplate;templates;pcFluid=m($e,{optional:!0,host:!0,skipSelf:!0});get hasFluid(){return this.fluid()??!!this.pcFluid}_componentStyle=m(lt);_contentTemplate;_iconTemplate;_loadingIconTemplate;ngAfterContentInit(){this.templates?.forEach(t=>{switch(t.getType()){case"content":this._contentTemplate=t.template;break;case"icon":this._iconTemplate=t.template;break;case"loadingicon":this._loadingIconTemplate=t.template;break;default:this._contentTemplate=t.template;break}})}spinnerIconClass(){return Object.entries(this.iconClass()).filter(([,t])=>!!t).reduce((t,[n])=>t+` ${n}`,"p-button-loading-icon")}iconClass(){return{[`p-button-loading-icon pi-spin ${this.loadingIcon??""}`]:this.loading,"p-button-icon":!0,[this.icon]:!0,"p-button-icon-left":this.iconPos==="left"&&this.label,"p-button-icon-right":this.iconPos==="right"&&this.label,"p-button-icon-top":this.iconPos==="top"&&this.label,"p-button-icon-bottom":this.iconPos==="bottom"&&this.label}}static \u0275fac=(()=>{let t;return function(o){return(t||(t=S(e)))(o||e)}})();static \u0275cmp=j({type:e,selectors:[["p-button"]],contentQueries:function(n,o,r){if(n&1&&(_t(r,So,5),_t(r,Co,5),_t(r,Eo,5),_t(r,Rn,4)),n&2){let s;xt(s=It())&&(o.contentTemplate=s.first),xt(s=It())&&(o.loadingIconTemplate=s.first),xt(s=It())&&(o.iconTemplate=s.first),xt(s=It())&&(o.templates=s)}},inputs:{type:"type",iconPos:"iconPos",icon:"icon",badge:"badge",label:"label",disabled:[2,"disabled","disabled",x],loading:[2,"loading","loading",x],loadingIcon:"loadingIcon",raised:[2,"raised","raised",x],rounded:[2,"rounded","rounded",x],text:[2,"text","text",x],plain:[2,"plain","plain",x],severity:"severity",outlined:[2,"outlined","outlined",x],link:[2,"link","link",x],tabindex:[2,"tabindex","tabindex",an],size:"size",variant:"variant",style:"style",styleClass:"styleClass",badgeClass:"badgeClass",badgeSeverity:"badgeSeverity",ariaLabel:"ariaLabel",buttonProps:"buttonProps",autofocus:[2,"autofocus","autofocus",x],fluid:[1,"fluid"]},outputs:{onClick:"onClick",onFocus:"onFocus",onBlur:"onBlur"},features:[L([lt]),O],ngContentSelectors:wo,decls:7,vars:15,consts:[["pRipple","",3,"click","focus","blur","ngStyle","disabled","pAutoFocus"],[4,"ngTemplateOutlet"],[4,"ngIf"],[3,"class",4,"ngIf"],[3,"value","severity",4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],["data-p-icon","spinner",3,"class","spin",4,"ngIf"],["data-p-icon","spinner",3,"spin"],[3,"ngIf"],[3,"value","severity"]],template:function(n,o){n&1&&(dt(),me(0,"button",0),en("click",function(s){return o.onClick.emit(s)})("focus",function(s){return o.onFocus.emit(s)})("blur",function(s){return o.onBlur.emit(s)}),ut(1),ct(2,To,1,0,"ng-container",1)(3,ko,3,5,"ng-container",2)(4,Mo,3,5,"ng-container",2)(5,Ro,2,5,"span",3)(6,Do,1,2,"p-badge",4),fe()),n&2&&(H(o.cn(o.cx("root"),o.styleClass,o.buttonProps==null?null:o.buttonProps.styleClass)),P("ngStyle",o.style||(o.buttonProps==null?null:o.buttonProps.style))("disabled",o.disabled||o.loading||(o.buttonProps==null?null:o.buttonProps.disabled))("pAutoFocus",o.autofocus||(o.buttonProps==null?null:o.buttonProps.autofocus)),it("type",o.type||(o.buttonProps==null?null:o.buttonProps.type))("aria-label",o.ariaLabel||(o.buttonProps==null?null:o.buttonProps.ariaLabel))("data-pc-name","button")("data-pc-section","root")("tabindex",o.tabindex||(o.buttonProps==null?null:o.buttonProps.tabindex)),A(2),P("ngTemplateOutlet",o.contentTemplate||o._contentTemplate),A(),P("ngIf",o.loading),A(),P("ngIf",!o.loading),A(),P("ngIf",!o.contentTemplate&&!o._contentTemplate&&o.label),A(),P("ngIf",!o.contentTemplate&&!o._contentTemplate&&o.badge))},dependencies:[Z,ln,dn,cn,ri,Yn,ni,Zn,Be,st],encapsulation:2,changeDetection:0})}return e})(),za=(()=>{class e{static \u0275fac=function(n){return new(n||e)};static \u0275mod=X({type:e});static \u0275inj=Q({imports:[Z,Bo,st,st]})}return e})();export{yn as a,J as b,ot as c,xe as d,Ri as e,Di as f,Fi as g,qo as h,Bi as i,Ie as j,Yo as k,Wi as l,Qo as m,Xo as n,Zo as o,ji as p,gt as q,Jo as r,wn as s,tr as t,Oe as u,er as v,ae as w,ke as x,nr as y,ir as z,or as A,rr as B,sr as C,_n as D,Y as E,Yi as F,C as G,le as H,Nn as I,cr as J,R as K,dr as L,Nt as M,br as N,gr as O,Rn as P,st as Q,yr as R,Er as S,Re as T,N as U,Xr as V,bn as W,M as X,Fe as Y,ms as Z,fs as _,qn as $,Yn as aa,Be as ba,Zn as ca,$e as da,ei as ea,ni as fa,ri as ga,Va as ha,Bo as ia,za as ja};
