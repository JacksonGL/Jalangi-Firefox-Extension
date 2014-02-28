

// runtime function call graph
// check NaN
    J$.analyzer = {
        // returns the stack trace of a function
        getStackTrace: function () {
            try {
                throw new Error('dummy error');
            } catch(e){
                return this.convertStackTrace(e.stack);
            }
        },
        convertStackTrace: function (str){
            var arr = str.split('\n');
            var narr = [];
            for (var i=0;i<arr.length;i++) {
                var item = arr[i];
                if(item == ''){
                    continue;
                }
                var split_arr = item.split('@');
                var tmp = {};
                tmp.name = split_arr[0];
                tmp.loc = split_arr[1];
                narr.push(tmp);
            }
            narr.shift(); // remove the first element
            return narr;
        },
        getCallPair: function () {
            var pair = {'caller': null, 'callee': null, 'toString': function(){return this.caller + '->' + this.callee;}};
            var stack = this.getStackTrace();
            for(var i=0;i<stack.length;i++){
                if(stack[i].loc.indexOf('analysis.js') >= 0) {
                    continue;
                }
                if (pair.callee == null) {
                    pair.callee = stack[i].name;
                } else if(pair.caller == null) {
                    pair.caller = stack[i].name;
                } else {
                    break;
                }
            }

            if(pair.callee == null) {
                pair.callee = '[unknown]';
            }

            if(pair.caller == null) {
                pair.caller = '[unknown]';
            }
            return pair;
        },
        // val here is the 'arguments.callee'
        // dis is the 'this' context
        Fe: function (iid, val, dis) {
            if(this.func_name) {
                if(this.func_name.indexOf('{')>=0 || this.func_name.indexOf('*')>=0 || this.func_name.indexOf('\\')>=0 || this.func_name.indexOf('/')>=0) {
                    var oldSize = J$.functionSet.size();
                    J$.functionSet.add(this.func_name);
                    if(J$.functionSet.size() > oldSize){
                        var newName = '[literal function - '+ (J$.literal_func_index++) +']';
                        J$.functionTable.put(this.func_name, newName);
                        this.func_name = newName;
                    } else {
                        this.func_name = J$.functionTable.get(this.func_name);
                    }
                }
                this.stack.push(this.func_name);
                var result = '';
                if(this.stack.length==1){
                    result = '\"[top level]\" -> \"' + this.stack[this.stack.length-1] + '\"';
                } else {
                    result = '\"' + this.stack[this.stack.length-2] + '\" -> \"' + this.stack[this.stack.length-1] + '\"';
                }

                var oldSize2 = J$.resultSet.size();
                J$.resultSet.add(result);
                if(J$.resultSet.size() > oldSize2){
                    J$.resultList.push(result);
                }
            } else {
                console.log('!!!!!!!!!!!!!! Fe');
            }
        },
        pre_InvokeFun: function (iid, f, base, args, isConstructor) {
            if(f && f['*J$*']) {
                if(f['*J$*'].func_name){
                    this.func_name = f['*J$*'].func_name;
                } else {
                    this.func_name = '[unknown]';
                }
            } else {
                console.log('f does not have name');
                this.func_name = undefined;
            }
        },
        Ra: function () {
            if(this.stack.length==0){
                console.log('!!!!!!!!!!!!!! Ra');
            } else {
                this.stack.pop();
            }
        },
        post_R: function (iid, name, val) {
            if(typeof val == 'function'){
                if(!val['*J$*']){
                    val['*J$*'] = {};
                }
                val['*J$*'].func_name = name;
            }
            return val;
        },
        post_G: function (iid, base, offset, val, norr) {
            if(typeof val == 'function'){
                if(!val['*J$*']){
                    val['*J$*'] = {};
                }
                val['*J$*'].func_name = base + '.' + offset;
            }
            return val;
        }
    };

 J$.HashSet = function (t, n) {
        var e = new J$.Hashtable(t, n);
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
            var r = new J$.HashSet(t, n);
            return r.addAll(e.keys()), r
        }, this.intersection = function (r) {
            for (var i, u = new J$.HashSet(t, n), o = r.values(), s = o.length; s--;)i = o[s], e.containsKey(i) && u.add(i);
            return u
        }, this.union = function (t) {
            for (var n, r = this.clone(), i = t.values(), u = i.length; u--;)n = i[u], e.containsKey(n) || r.add(n);
            return r
        }, this.isSubsetOf = function (t) {
            for (var n = e.keys(), r = n.length; r--;)if (!t.contains(n[r]))return!1;
            return!0
        }, this.complement = function (e) {
            for (var r, i = new J$.HashSet(t, n), u = this.values(), o = u.length; o--;)r = u[o], e.contains(r) || i.add(r);
            return i
        }, this.elements = function () {
            return e.keys();
        }
    }

    J$.Hashtable = function (t) {
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

    J$.analyzer.stack = [];
    J$.functionSet = new J$.HashSet();
    J$.functionTable = new J$.Hashtable();
    J$.literal_func_index = 1;
    J$.resultSet = new J$.HashSet();
    J$.resultList = [];