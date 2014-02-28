
    var isWorker = false;
    if(((typeof window) == 'undefined')){
        window = {};
        if ((typeof navigator) != 'undefined') {
            isWorker = true
        }
    }

    if(((typeof console) == 'undefined')){
        console = {};
        console.log = function(str) {
            // do nothing
        };
    }

    if (typeof J$ === 'undefined') {
        self.J$ = {};
    }


try {
    J$.analyzer = {
        // F: function call
        // function called before F
        // modify retFunction will modify the concret return value
        pre_F: function (iid, f, isConstructor) {
            var stack = this.Utils.getStackTrace();
            try {
                var str = '\"' + stack[1].methodName + '\" -> \"' + stack[0].methodName + '\"';
                this.callGraphHashset.add(str);
                //console.log(str);
            } catch (e) {
                console.log(e);
            }
        },
        // F: function call
        // function called after F
        // modify retFunction will modify the concret return value
        post_F: function (iid, f, isConstructor, retFunction) {

        },
        // M: method call
        // function called before M
        pre_M: function (iid, base, offset, isConstructor) {
            var stack = this.Utils.getStackTrace();
            try {
                var str = '\"' + stack[1].methodName + '\" -> \"' + (typeof base) + '.' + stack[0].methodName + '\"';
                this.callGraphHashset.add(str);
                //console.log(str);
            } catch (e) {
                console.log(e);
            }
        },
        // M: method call
        // function called after M
        // modify retFunction will modify the concret return value
        post_M: function (iid, base, offset, isConstructor, retFunction) {

        },
        Fe: function (iid, val, dis) {

            //returnVal = undefined;
        },
        Fr: function (iid) {

        },
        Rt: function (iid, val) {
            //return returnVal = val;
        },
        Ra: function () {
            //var ret = returnVal;
            //returnVal = undefined;
            //return ret;
        },
        Se: function (iid, val) {

        },
        Sr: function (iid) {

        },
        I: function (val) {
            //return val;
        },
        T: function (iid, val, type) {


            //return val;
        },
        H: function (iid, val) {

            //return val;
        },
        // R: read
        // function called before R
        // val is the read value
        pre_R: function (iid, name, val) {
            //console.log('typeof name: ' + typeof name + ' | typeof val' + typeof val);
            if(val && typeof val != 'number') {
                shadowVal = this.Utils.getShadow(val);
                if (shadowVal) {
                    if (shadowVal instanceof this.Utils.ShadowWarning){
                        console.log('[iid: ' + iid + '] ' + shadowVal.show());
                    }
                }
            }
        },
        // R: read
        // function called after R
        // val is the read value
        // return value will be the new read value
        post_R: function (iid, name, val) {
            //console.log('typeof name: ' + typeof name + ' | typeof val' + typeof val);
            //if(name=='window'){
            if (val && typeof val == 'object') {
                /**/if (val.toString() == '[object Window]') {
                    //console.log('reading window');
                    //setShadow(val, 'window');
                } else if (val.toString() == '[object HTMLDocument]') {
                    //console.log('reading document');
                    //setShadow(val, 'document');
                    //val.write = undefined;
                } else if (val.toString() == '[object CSS2Properties]') {
                    this.Utils.setShadow(val, 'style');
                }
            }
            //}
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
        N: function (iid, name, val, isArgumentSync) {

            //return val;
        },
        A: function (iid, base, offset, op) {

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
            if (this.Utils.getShadow(base) == 'window') {
                if (offset == 'document') {
                    //setShadow(base, 'document');
                }
            } else if (this.Utils.getShadow(base) == 'document') {
                //console.log('document.' + offset);
                if (typeof val == 'function') {
                    //console.log('document.' + offset)
                    //console.log(val);
                }
            } else if (this.Utils.getShadow(base) == 'style') {
                console.log('style.' + offset);
            }
            //getElementsByClassName()
            //

            if(val && typeof val != 'number') {
                shadowVal = this.Utils.getShadow(val);
                if (shadowVal) {
                    if (shadowVal instanceof this.Utils.ShadowWarning){
                        console.log('[iid: ' + iid + '] ' + shadowVal.show());
                    }
                }
            }

            return val;
        },
        // P: put field
        // function called before P
        // base is the object to which the field will put
        // offset is either a number or a string indexing the field to get
        // val is the value puts to base.[offset]
        pre_P: function (iid, base, offset, val) {

            //return val;
        },
        // P: put field
        // function called after P
        // base is the object to which the field will put
        // offset is either a number or a string indexing the field to get
        // val is the value puts to base.[offset]
        // return value will affect the retrieved value in the instrumented code
        post_P: function (iid, base, offset, val) {

            return val;
        },
        B: function (iid, op, left, right) {
            //return result_c;
        },
        U: function (iid, op, left) {

            //return result_c;
        },
        C1: function (iid, left) {
            //var left_c;
            //return left_c;
        },
        C2: function (iid, left) {
            //var left_c, ret;
            //return left_c;
        },
        C: function (iid, left) {
            //var left_c, ret;
            //return left_c;
        }
    };
} catch (e) {
    console.log(e);
}

J$.analyzer.InputManagerUrl = 'https://raw.github.com/JacksonGL/Jalangi_ref/master/InputManager.js';
J$.analyzer.analysisUrl = 'https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js';
J$.analyzer.analyzerUrl = 'https://raw.github.com/JacksonGL/Jalangi_ref/master/analyzer.js';
J$.analyzer.local_file_list = [J$.analyzer.InputManagerUrl, J$.analyzer.analysisUrl, J$.analyzer.analyzerUrl];



J$.analyzer.Utils = {};

J$.analyzer.Utils.setShadow = function (obj, sValue) {
    if (obj && typeof obj != 'number') {
        obj['J$-shadow'] = sValue;
    }
}

J$.analyzer.Utils.getShadow = function (obj) {
    if (obj && typeof obj != 'number') {
        return obj['J$-shadow'];
    } else {
        return undefined;
    }
}

////////////////////////////////////////////////////////////////////////////////// hashset (begin) //////////////////////////////////////////////////////////////////////////////////
/**
 * Copyright 2013 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
J$.analyzer.Utils.HashSet = function (t, n) {
    var e = new J$.analyzer.Utils.Hashtable(t, n);
    this.add = function (t) {
        e.put(t, !0)
    }, this.addAll = function (t) {
        for (var n = 0, r = t.length; r > n; ++n)e.put(t[n], !0)
    }, this.values = function () {
        return e.keys()
    }, this.remove = function (t) {
        return e.remove(t) ? t : null
    }, this.contains = function (t) {
        return e.containsKey(t)
    }, this.clear = function () {
        e.clear()
    }, this.size = function () {
        return e.size()
    }, this.isEmpty = function () {
        return e.isEmpty()
    }, this.clone = function () {
        var r = new J$.analyzer.Utils.HashSet(t, n);
        return r.addAll(e.keys()), r
    }, this.intersection = function (r) {
        for (var i, u = new J$.analyzer.Utils.HashSet(t, n), o = r.values(), s = o.length; s--;)i = o[s], e.containsKey(i) && u.add(i);
        return u
    }, this.union = function (t) {
        for (var n, r = this.clone(), i = t.values(), u = i.length; u--;)n = i[u], e.containsKey(n) || r.add(n);
        return r
    }, this.isSubsetOf = function (t) {
        for (var n = e.keys(), r = n.length; r--;)if (!t.contains(n[r]))return!1;
        return!0
    }, this.complement = function (e) {
        for (var r, i = new J$.analyzer.Utils.HashSet(t, n), u = this.values(), o = u.length; o--;)r = u[o], e.contains(r) || i.add(r);
        return i
    }, this.elements = function () {
        return e.keys();
    }
}


/**
 * @license jahashtable, a JavaScript implementation of a hash table. It creates a single constructor function called
 * Hashtable in the global scope.
 *
 * http://www.timdown.co.uk/jshashtable/
 * Copyright 2013 Tim Down.
 * Version: 3.0
 * Build date: 17 July 2013
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
J$.analyzer.Utils.Hashtable = function (t) {
    function n(t) {
        return typeof t == p ? t : "" + t
    }

    function e(t) {
        var r;
        return typeof t == p ? t : typeof t.hashCode == y ? (r = t.hashCode(), typeof r == p ? r : e(r)) : n(t)
    }

    function r(t, n) {
        for (var e in n)n.hasOwnProperty(e) && (t[e] = n[e])
    }

    function i(t, n) {
        return t.equals(n)
    }

    function u(t, n) {
        return typeof n.equals == y ? n.equals(t) : t === n
    }

    function o(n) {
        return function (e) {
            if (null === e)throw new Error("null is not a valid " + n);
            if (e === t)throw new Error(n + " must not be undefined")
        }
    }

    function s(t, n, e, r) {
        this[0] = t, this.entries = [], this.addEntry(n, e), null !== r && (this.getEqualityFunction = function () {
            return r
        })
    }

    function a(t) {
        return function (n) {
            for (var e, r = this.entries.length, i = this.getEqualityFunction(n); r--;)if (e = this.entries[r], i(n, e[0]))switch (t) {
                case E:
                    return!0;
                case K:
                    return e;
                case q:
                    return[r, e[1]]
            }
            return!1
        }
    }

    function l(t) {
        return function (n) {
            for (var e = n.length, r = 0, i = this.entries, u = i.length; u > r; ++r)n[e + r] = i[r][t]
        }
    }

    function f(t, n) {
        for (var e, r = t.length; r--;)if (e = t[r], n === e[0])return r;
        return null
    }

    function h(t, n) {
        var e = t[n];
        return e && e instanceof s ? e : null
    }

    function c() {
        var n = [], i = {}, u = {replaceDuplicateKey: !0, hashCode: e, equals: null}, o = arguments[0], a = arguments[1];
        a !== t ? (u.hashCode = o, u.equals = a) : o !== t && r(u, o);
        var l = u.hashCode, c = u.equals;
        this.properties = u, this.put = function (t, e) {
            g(t), d(e);
            var r, o, a = l(t), f = null;
            return r = h(i, a), r ? (o = r.getEntryForKey(t), o ? (u.replaceDuplicateKey && (o[0] = t), f = o[1], o[1] = e) : r.addEntry(t, e)) : (r = new s(a, t, e, c), n.push(r), i[a] = r), f
        }, this.get = function (t) {
            g(t);
            var n = l(t), e = h(i, n);
            if (e) {
                var r = e.getEntryForKey(t);
                if (r)return r[1]
            }
            return null
        }, this.containsKey = function (t) {
            g(t);
            var n = l(t), e = h(i, n);
            return e ? e.containsKey(t) : !1
        }, this.containsValue = function (t) {
            d(t);
            for (var e = n.length; e--;)if (n[e].containsValue(t))return!0;
            return!1
        }, this.clear = function () {
            n.length = 0, i = {}
        }, this.isEmpty = function () {
            return!n.length
        };
        var y = function (t) {
            return function () {
                for (var e = [], r = n.length; r--;)n[r][t](e);
                return e
            }
        };
        this.keys = y("keys"), this.values = y("values"), this.entries = y("getEntries"), this.remove = function (t) {
            g(t);
            var e, r = l(t), u = null, o = h(i, r);
            return o && (u = o.removeEntryForKey(t), null !== u && 0 == o.entries.length && (e = f(n, r), n.splice(e, 1), delete i[r])), u
        }, this.size = function () {
            for (var t = 0, e = n.length; e--;)t += n[e].entries.length;
            return t
        }
    }

    var y = "function", p = "string", v = "undefined";
    if (typeof encodeURIComponent == v || Array.prototype.splice === t || Object.prototype.hasOwnProperty === t)return null;
    var g = o("key"), d = o("value"), E = 0, K = 1, q = 2;
    return s.prototype = {getEqualityFunction: function (t) {
        return typeof t.equals == y ? i : u
    }, getEntryForKey: a(K), getEntryAndIndexForKey: a(q), removeEntryForKey: function (t) {
        var n = this.getEntryAndIndexForKey(t);
        return n ? (this.entries.splice(n[0], 1), n[1]) : null
    }, addEntry: function (t, n) {
        this.entries.push([t, n])
    }, keys: l(0), values: l(1), getEntries: function (t) {
        for (var n = t.length, e = 0, r = this.entries, i = r.length; i > e; ++e)t[n + e] = r[e].slice(0)
    }, containsKey: a(E), containsValue: function (t) {
        for (var n = this.entries, e = n.length; e--;)if (t === n[e][1])return!0;
        return!1
    }}, c.prototype = {each: function (t) {
        for (var n, e = this.entries(), r = e.length; r--;)n = e[r], t(n[0], n[1])
    }, equals: function (t) {
        var n, e, r, i = this.size();
        if (i == t.size()) {
            for (n = this.keys(); i--;)if (e = n[i], r = t.get(e), null === r || r !== this.get(e))return!1;
            return!0
        }
        return!1
    }, putAll: function (t, n) {
        for (var e, r, i, u, o = t.entries(), s = o.length, a = typeof n == y; s--;)e = o[s], r = e[0], i = e[1], a && (u = this.get(r)) && (i = n(r, u, i)), this.put(r, i)
    }, clone: function () {
        var t = new c(this.properties);
        return t.putAll(this), t
    }}, c.prototype.toQueryString = function () {
        for (var t, e = this.entries(), r = e.length, i = []; r--;)t = e[r], i[r] = encodeURIComponent(n(t[0])) + "=" + encodeURIComponent(n(t[1]));
        return i.join("&")
    }, c
}();


////////////////////////////////////////////////////////////////////////////////// hashset (end) //////////////////////////////////////////////////////////////////////////////////






// a sample stack trace:
// stackTrace@https://raw.github.com/JacksonGL/Jalangi_ref/master/analyzer.js:23
// window.J$.analyzer.pre_F@https://raw.github.com/JacksonGL/Jalangi_ref/master/analyzer.js:34
// F@https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:375
// Go@http://www.lutanho.net/play/tetris.html:243
// @https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:340
J$.analyzer.Utils.getStackTrace = function() {
    var err = new Error();
    var str = err.stack;
    var stack = str.split('\n');

    var stack2 = [];
    outer:
        for (var i = 0; i < stack.length; i++) {
            for (var j = 0; j < this.local_file_list.length; j++) {
                if (stack[i].indexOf(this.local_file_list[j]) >= 0) {
                    continue outer;
                }
            }
            var stack_elem = {};
            stack_elem.methodName = stack[i].split('@')[0];
            if(stack_elem.methodName == ''){
                stack_elem.methodName = '[top-level]';
            }
            stack_elem.location = stack[i].split('@')[1];
            stack2.push(stack_elem);
        }
    return stack2;
}

J$.analyzer.callGraphHashset = new J$.analyzer.Utils.HashSet();

J$.analyzer.printCallGraphCode() {
    var elements = this.callGraphHashset.elements();
    var allstr = "";
    for(var i=0;i<elements.length;i++){
        allstr += elements[i] + "\r\n";
    }
    console.log(allstr);
}





J$.analyzer.Utils.ShadowWarning = function (message) {
    if (!(this instanceof ShadowWarning)) {
        return new ShadowWarning();
    }

    this.message = message;
}

J$.analyzer.Utils.ShadowWarning.prototype.show = function() {
    return '[J$ Warning]: ' + this.message;
}

console.log('analyzer loaded');

//setShadow(window, 'window');
//setShadow(document, 'document');

//setShadow(document.querySelector, new ShadowWarning('document.querySelector does not work in IE 5 or 6'));
//setShadow(document.getElementById, new ShadowWarning('document.getElementById does not work in C++ (testing)'));
//setShadow(document.getElementsByClassName, new ShadowWarning('document.getElementsByClassName() does not work in IE 5, 6, 7, or 8'));
//setShadow(document.querySelectorAll, new ShadowWarning('document.querySelectorAll() does not work in IE 5, 6, 7, or 8'));


console.log('configuration loaded')

// 1. instrumentation problem
// 2. execution error problem (Prof. Sen is working on that)
// frontend program analysis