// detecting migration issues
// according to testing result of:
// http://quirksmode.org/dom/core/
/*
	sandbox.analysis.installAxiom(c); 
	sandbox.analysis.invokeFun(iid, f, base, args, val, isConstructor); 
	sandbox.analysis.getFieldPre(iid, base, offset); 
	val = sandbox.analysis.getField(iid, base, offset, val); 
	val = sandbox.analysis.putFieldPre(iid, base, offset, val); 
	val = sandbox.analysis.putField(iid, base, offset, val); 
	ret = sandbox.analysis.functionExit(iid); 
	ret = sandbox.analysis.return_(ret); 
	val = sandbox.analysis.return_Rt(iid, val); 
	sandbox.analysis.scriptEnter(iid, val); 
	sandbox.analysis.scriptExit(iid); 
	sandbox.analysis.literalPre(iid, val); 
	val = sandbox.analysis.literal(iid, val); 
	sandbox.analysis.readPre(iid, name, val, isGlobal); 
	val = sandbox.analysis.read(iid, name, val, isGlobal); 
	sandbox.analysis.writePre(iid, name, val, lhs); 
	val = sandbox.analysis.write(iid, name, val, lhs); 
	sandbox.analysis.declare(iid, name, val, isArgumentSync); 
	sandbox.analysis.binaryPre(iid, op, left, right); 
	result_c = sandbox.analysis.binary(iid, op, left, right, result_c); 
	sandbox.analysis.unaryPre(iid, op, left); 
	result_c = sandbox.analysis.unary(iid, op, left, result_c); 
	sandbox.analysis.conditionalPre(iid, left); 
	sandbox.analysis.conditional(iid, left, ret); 
	sandbox.analysis.endExecution(); 
*/

// current check targets:
/*

	document.getElementsByClassName
	document.getElementsByTagName
	document.querySelector
	document.querySelectorAll
	x.childNodes[1]
	x.firstChild
	x.nextSibling
	x.previousSibling
	x.childElementCount
	x.children[1]
	x.firstElementChild
	x.lastElementChild
	x.nextElementSibling
	x.previousElementSibling
	x.remove()
	x.removeAttribute()

*/

// check migration issues
    J$.analyzer = {
        // F: function call
        // function called before F
        // modify retFunction will modify the concret return value
        pre_F: function (iid, f, isConstructor) {
            if(f && f === document.getElementsByClassName) {
                console.warn('[iid: ' + iid + ']' + 'use of document.getElementsByClassName()');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            } else if (f && f === document.getElementsByTagName) {
                console.warn('[iid: ' + iid + ']' + 'use of document.getElementsByTagName()');
                this.groupInfo('Not supported by IE 5.5');
            } else if (f && f === document.querySelector) {
                console.warn('[iid: ' + iid + ']' + 'use of document.querySelector()');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            } else if (f && f === document.querySelectorAll) {
                console.warn('[iid: ' + iid + ']' + 'use of document.querySelectorAll()');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            }
        },
        // F: function call
        // function called after F
        // modify retFunction will modify the concret return value
        post_F: function (iid, f, isConstructor, retFunction) {

            return retFunction;
        },
        // M: method call
        // function called before M
        pre_M: function (iid, base, offset, isConstructor) {
            
        },
        // M: method call
        // function called after M
        // modify retFunction will modify the concret return value
        post_M: function (iid, base, offset, isConstructor, retFunction) {
            if(base && base[offset]){
                var f = base[offset];
                if(f && f === document.getElementsByClassName) {
                    console.warn('[iid: ' + iid + ']' + 'use of document.getElementsByClassName()');
                    this.groupInfo('Not supported by IE 5.5,6,7,8');
                } else if (f && f === document.getElementsByTagName) {
                    console.warn('[iid: ' + iid + ']' + 'use of document.getElementsByTagName()');
                    this.groupInfo('Not supported by IE 5.5');
                } else if (f && f === document.querySelector) {
                    console.warn('[iid: ' + iid + ']' + 'use of document.querySelector()');
                    this.groupInfo('Not supported by IE 5.5,6,7,8');
                } else if (f && f === document.querySelectorAll) {
                    console.warn('[iid: ' + iid + ']' + 'use of document.querySelectorAll()');
                    this.groupInfo('Not supported by IE 5.5,6,7,8');
                }
            }
            return retFunction;
        },
        // R: read
        // function called before R
        // val is the read value
        pre_R: function (iid, name, val) {

        },
        // R: read
        // function called after R
        // val is the read value
        // return value will be the new read value
        post_R: function (iid, name, val) {

            return val;

        },
        // W: write
        // function called before W
        // val is the value to write
        pre_W: function (iid, name, val, lhs) {

            //return val;
        },
        // W: write
        // function called after W
        // val is the value to write
        // return value will be the new written value
        post_W: function (iid, name, val, lhs) {

            return val;
        },
        // G: get field
        // function called before G
        // base is the object from which the field will get
        // offset is either a number or a string indexing the field to get
        pre_G: function (iid, base, offset, norr) {


        },
        // G: get field
        // function called after G
        // base is the object from which the field will get
        // offset is either a number or a string indexing the field to get
        // val is the value gets from base.[offset]
        // return value will affect the retrieved value in the instrumented code
        post_G: function (iid, base, offset, val, norr) {
             if(base && base !== document && offset=='querySelector' && typeof val == 'function') {
                console.warn('[iid: ' + iid + ']' + 'use of element.querySelector()');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            } else if (base && base !== document && offset=='querySelectorAll' && typeof val == 'function') {
                console.warn('[iid: ' + iid + ']' + 'use of element.querySelectorAll()');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            } else if (base && base.tagName && base.innerHTML && offset == 'childNodes') {
                console.warn('[iid: ' + iid + ']' + 'use of element.childNodes[]');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            } else if (base && base.tagName && base.innerHTML && offset == 'firstChild') {
                console.warn('[iid: ' + iid + ']' + 'use of element.firstChild');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            } else if (base && base.tagName && base.innerHTML && offset == 'lastChild') {
                console.warn('[iid: ' + iid + ']' + 'use of element.lastChild');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            } else if (base && base.tagName && base.innerHTML && offset == 'nextSibling') {
                console.warn('[iid: ' + iid + ']' + 'use of element.nextSibling');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            } else if (base && base.tagName && base.innerHTML && offset == 'previousSibling') {
                console.warn('[iid: ' + iid + ']' + 'use of element.previousSibling');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            } else if (base && base.tagName && base.innerHTML && offset == 'childElementCount') {
                console.warn('[iid: ' + iid + ']' + 'use of element.childElementCount');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            }  else if (base && base.tagName && base.innerHTML && offset == 'children') {
                console.warn('[iid: ' + iid + ']' + 'use of element.children[]');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            }  else if (base && base.tagName && base.innerHTML && offset == 'firstElementChild') {
                console.warn('[iid: ' + iid + ']' + 'use of element.firstElementChild');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            }  else if (base && base.tagName && base.innerHTML && offset == 'lastElementChild') {
                console.warn('[iid: ' + iid + ']' + 'use of element.lastElementChild');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            }  else if (base && base.tagName && base.innerHTML && offset == 'nextElementSibling') {
                console.warn('[iid: ' + iid + ']' + 'use of element.nextElementSibling');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            }  else if (base && base.tagName && base.innerHTML && offset == 'previousElementSibling') {
                console.warn('[iid: ' + iid + ']' + 'use of element.previousElementSibling');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            }  else if (base && base.tagName && base.innerHTML && offset == 'removeAttribute') {
                console.warn('[iid: ' + iid + ']' + 'use of element.removeAttribute()');
                this.groupInfo('Not supported by IE 5.5,6,7,8');
            }  else if (base && base.tagName && base.innerHTML && offset == 'remove') {
                console.warn('[iid: ' + iid + ']' + 'use of element.remove()');
                this.groupInfo('Not supported by IE, Safari and Opera (Win 12, Mac 12 and Linux 12)');
            }  else if (base && base.tagName && base.innerHTML && offset == 'appendData') {
                console.warn('[iid: ' + iid + ']' + 'use of element.appendData()');
                this.groupInfo('Not supported by IE 5.5');
            }  else if (base && base.tagName && base.innerHTML && offset == 'deleteData') {
                console.warn('[iid: ' + iid + ']' + 'use of element.deleteData()');
                this.groupInfo('Not supported by IE 5.5');
            }  else if (base && base.tagName && base.innerHTML && offset == 'insertData') {
                console.warn('[iid: ' + iid + ']' + 'use of element.insertData()');
                this.groupInfo('Not supported by IE 5.5');
            }  else if (base && base.tagName && base.innerHTML && offset == 'normalize') {
                console.warn('[iid: ' + iid + ']' + 'use of element.normalize()');
                this.groupInfo('Not supported by IE 5.5');
            }  else if (base && base.tagName && base.innerHTML && offset == 'replaceData') {
                console.warn('[iid: ' + iid + ']' + 'use of element.replaceData()');
                this.groupInfo('Not supported by IE 5.5');
            }  else if (base && base.tagName && base.innerHTML && offset == 'splitText') {
                console.warn('[iid: ' + iid + ']' + 'use of element.splitText()');
                this.groupInfo('Not supported by IE 5.5, 6, 7, 8, 9');
            }  else if (base && base.tagName && base.innerHTML && offset == 'substringData') {
                console.warn('[iid: ' + iid + ']' + 'use of element.substringData()');
                this.groupInfo('Not supported by IE 5.5');
            }  else if (base && base.tagName && base.innerHTML && offset == 'wholeText') {
                console.warn('[iid: ' + iid + ']' + 'use of element.wholeText()');
                this.groupInfo('Not supported by IE 5.5, 6, 7, 8');
            }  else if (base && base.tagName && base.innerHTML && offset == 'attributes') {
                console.warn('[iid: ' + iid + ']' + 'use of element.attributes[]');
                this.groupInfo('Not supported by IE and Firefox');
            }  else if (base && base.tagName && base.innerHTML && offset == 'createAttribute') {
                console.warn('[iid: ' + iid + ']' + 'use of element.createAttribute()');
                this.groupInfo('Not supported by IE 5.5');
            }  else if (base && base.tagName && base.innerHTML && offset == 'getAttribute') {
                console.warn('[iid: ' + iid + ']' + 'use of element.getAttribute()');
                this.groupInfo('Not supported by IE 5.5, 6, 7');
            }  else if (base && base.tagName && base.innerHTML && offset == 'getAttributeNode') {
                console.warn('[iid: ' + iid + ']' + 'use of element.getAttributeNode()');
                this.groupInfo('Not supported by IE 5.5, 6, 7');
            }  else if (base && base.tagName && base.innerHTML && offset == 'hasAttribute') {
                console.warn('[iid: ' + iid + ']' + 'use of element.hasAttribute()');
                this.groupInfo('Not supported by IE 5.5, 6, 7');
            }  else if (base && base.tagName && base.innerHTML && offset == 'name') {
                console.warn('[iid: ' + iid + ']' + 'use of element.name');
                this.groupInfo('Not supported by IE 5.5');
            }  else if (base && base.tagName && base.innerHTML && offset == 'compareDocumentPosition') {
                console.warn('[iid: ' + iid + ']' + 'use of element.compareDocumentPosition()');
                this.groupInfo('Not supported by IE 5.5, 6, 7');
            }  else if (base && base.tagName && base.innerHTML && offset == 'getElementsByName') {
                console.warn('[iid: ' + iid + ']' + 'use of element.getElementsByName()');
                this.groupInfo('Incorrect and Incomplete in IE 5.5, 6, 7, 8, 9');
            }  else if (base && base.tagName && base.innerHTML && offset == 'isEqualNode') {
                console.warn('[iid: ' + iid + ']' + 'use of element.isEqualNode()');
                this.groupInfo('Incorrect and Incomplete in IE 5.5, 6, 7, 8');
            }  else if (base && base.tagName && base.innerHTML && offset == 'ownerDocument') {
                console.warn('[iid: ' + iid + ']' + 'use of element.ownerDocument');
                this.groupInfo('Incorrect and Incomplete in IE 5.5');
            }
            return val;
        },
        // P: put field
        // function called before P
        // base is the object to which the field will put
        // offset is either a number or a string indexing the field to get
        // val is the value puts to base.[offset]
        pre_P: function (iid, base, offset, val) {
            if(typeof base != 'undefined' && base != null && (typeof val == 'number') && isNaN(val) == true){
                console.log('[NaN iid: ' + iid +'] ' + base + '.' + offset + ':' + val);
                this.info(base);
            }
            //return val;
        },
        // P: put field
        // function called after P
        // base is the object to which the field will put
        // offset is either a number or a string indexing the field to get
        // val is the value puts to base.[offset]
        // return value will affect the retrieved value in the instrumented code
        post_P: function (iid, base, offset, val) {
            if(typeof base != 'undefined' && base != null && (typeof val == 'number') && isNaN(val) == true){
                console.warn('[NaN iid: ' + iid +'] ' + base + '.' + offset + ':' + val);
                this.info(base);
            }
            return val;
        },
        info: function (obj) {
            console.groupCollapsed();
            console.info(console.trace());
            if(obj){
                //console.dir(obj);
            }
            console.groupEnd();
        },
        isMeaningless: function (val) {
            if(typeof val == 'undefined'){
                return true;
            } else if(typeof val == 'number' && isNaN(val)){
                return true;
            }
            return false;   
        },
        isDocument: function (doc) {
            //[18:10:00.673] "[object HTMLDocument]"
            if(doc && doc.toString && doc.toString() == '[object HTMLDocument]'){
                return true;
            } else {
                return false;
            }
        },
        groupInfo: function (message) {
            console.group();
            console.log(message);
            console.groupEnd();
        }
    };



// found a possible migration issue:
// http://www.studyisland.com/web/index/

[21:12:02.520]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2647
[21:12:02.520] "Not supported by IE 5.5,6,7,8"
[21:12:02.520] "[iid: 35725]use of element.nextSibling"

// https://s3.amazonaws.com/platodotcomcdn/announcement/announce_static.js
// f=c.nextSibling.firstChild.firstChild


/*  www.apple.com
    [18:36:33.789] "[iid: 52717]use of document.querySelectorAll()"
	[18:36:33.790]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
	[18:36:33.790] "Not supported by IE 5.5,6,7,8"
	[18:36:33.837] "[iid: 52717]use of document.querySelectorAll()"
	[18:36:33.837]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
	[18:36:33.837] "Not supported by IE 5.5,6,7,8"
	[18:36:33.879] "[iid: 52717]use of document.querySelectorAll()"
	[18:36:33.879]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
	[18:36:33.879] "Not supported by IE 5.5,6,7,8"
	[18:36:33.919] "[iid: 52717]use of document.querySelectorAll()"
	[18:36:33.919]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
	[18:36:33.919] "Not supported by IE 5.5,6,7,8"
	[18:36:33.956] "[iid: 52717]use of document.querySelectorAll()"
	[18:36:33.956]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
	[18:36:33.956] "Not supported by IE 5.5,6,7,8"
	[18:36:35.125] "[iid: 12573]use of document.querySelectorAll()"
	[18:36:35.126]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
	[18:36:35.126] "Not supported by IE 5.5,6,7,8"
	[18:36:46.149] "[iid: 337]use of element.previousSibling"
	[18:36:46.150]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
	[18:36:46.150] "Not supported by IE 5.5,6,7,8"
*/


/* www.google.com
[18:42:57.873] "[iid: 101897]use of element.querySelectorAll()"
[18:42:57.873]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.873] "Not supported by IE 5.5,6,7,8"
[18:42:57.873] "[iid: 101905]use of element.querySelector()"
[18:42:57.874]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.874] "Not supported by IE 5.5,6,7,8"
[18:42:57.874] "[iid: 101921]use of element.querySelector()"
[18:42:57.874]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.874] "Not supported by IE 5.5,6,7,8"
[18:42:57.886] "[iid: 101897]use of element.querySelectorAll()"
[18:42:57.886]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.886] "Not supported by IE 5.5,6,7,8"
[18:42:57.887] "[iid: 101905]use of element.querySelector()"
[18:42:57.887]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.887] "Not supported by IE 5.5,6,7,8"
[18:42:57.887] "[iid: 101921]use of element.querySelector()"
[18:42:57.887]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.888] "Not supported by IE 5.5,6,7,8"
[18:42:57.888] "[iid: 101897]use of element.querySelectorAll()"
[18:42:57.888]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.888] "Not supported by IE 5.5,6,7,8"
[18:42:57.889] "[iid: 101905]use of element.querySelector()"
[18:42:57.889]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.889] "Not supported by IE 5.5,6,7,8"
[18:42:57.889] "[iid: 101921]use of element.querySelector()"
[18:42:57.889]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.889] "Not supported by IE 5.5,6,7,8"
[18:42:57.890] "[iid: 101897]use of element.querySelectorAll()"
[18:42:57.890]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.890] "Not supported by IE 5.5,6,7,8"
[18:42:57.891] "[iid: 101905]use of element.querySelector()"
[18:42:57.891]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.891] "Not supported by IE 5.5,6,7,8"
[18:42:57.891] "[iid: 101921]use of element.querySelector()"
[18:42:57.891]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.891] "Not supported by IE 5.5,6,7,8"
[18:42:57.892] "[iid: 101897]use of element.querySelectorAll()"
[18:42:57.892]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.892] "Not supported by IE 5.5,6,7,8"
[18:42:57.892] "[iid: 101905]use of element.querySelector()"
[18:42:57.892]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.893] "Not supported by IE 5.5,6,7,8"
[18:42:57.893] "[iid: 101921]use of element.querySelector()"
[18:42:57.893]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.893] "Not supported by IE 5.5,6,7,8"
[18:42:57.894] "[iid: 101897]use of element.querySelectorAll()"
[18:42:57.894]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.894] "Not supported by IE 5.5,6,7,8"
[18:42:57.894] "[iid: 101905]use of element.querySelector()"
[18:42:57.894]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.894] "Not supported by IE 5.5,6,7,8"
[18:42:57.895] "[iid: 101921]use of element.querySelector()"
[18:42:57.895]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.895] "Not supported by IE 5.5,6,7,8"
[18:42:57.895] "[iid: 101897]use of element.querySelectorAll()"
[18:42:57.895]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.896] "Not supported by IE 5.5,6,7,8"
[18:42:57.896] "[iid: 101905]use of element.querySelector()"
[18:42:57.896]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.896] "Not supported by IE 5.5,6,7,8"
[18:42:57.896] "[iid: 101921]use of element.querySelector()"
[18:42:57.896]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.897] "Not supported by IE 5.5,6,7,8"
[18:42:57.897] "[iid: 101897]use of element.querySelectorAll()"
[18:42:57.897]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.897] "Not supported by IE 5.5,6,7,8"
[18:42:57.898] "[iid: 101905]use of element.querySelector()"
[18:42:57.898]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.898] "Not supported by IE 5.5,6,7,8"
[18:42:57.898] "[iid: 101921]use of element.querySelector()"
[18:42:57.898]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.898] "Not supported by IE 5.5,6,7,8"
[18:42:57.899] "[iid: 101897]use of element.querySelectorAll()"
[18:42:57.899]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.899] "Not supported by IE 5.5,6,7,8"
[18:42:57.899] "[iid: 101905]use of element.querySelector()"
[18:42:57.899]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.899] "Not supported by IE 5.5,6,7,8"
[18:42:57.900] "[iid: 101921]use of element.querySelector()"
[18:42:57.900]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2595
[18:42:57.900] "Not supported by IE 5.5,6,7,8"
*/