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
    	   	    this.stack.push(this.func_name);
                if(this.stack.length==1){
                    console.log('[top level] -> ' + this.stack[this.stack.length-1]);
                } else {
                    console.log(this.stack[this.stack.length-2] + ' -> ' + this.stack[this.stack.length-1]);
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

    J$.analyzer.stack = [];