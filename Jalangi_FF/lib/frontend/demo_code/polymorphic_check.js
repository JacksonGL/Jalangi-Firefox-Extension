// check polymorphic code:
// a.f
// obj.func();
// for chrome debugging purpose

/*
    Currently all major browsers loop over the properties of an object in the order in which they were defined. Chrome does this as well, except for a couple cases. [...] This behavior is explicitly left undefined by the ECMAScript specification. In ECMA-262, section 12.6.4:
        The mechanics of enumerating the properties ... is implementation dependent.
    However, specification is quite different from implementation. All modern implementations of ECMAScript iterate through object properties in the order in which they were defined. Because of this the Chrome team has deemed this to be a bug and will be fixing it.
*/

J$.type_memo = [];
J$.analysis = {
	getField: function(iid, base, offset, val) {
		if(base){
			if(base.__proto__ && base.__proto__.constructor && base.__proto__.constructor.name && base.__proto__.constructor.name == 'Array'){
				return val;
			}

			if(typeof offset == 'number') {
				return val;
			}

			if(typeof base != 'object') {
				return val;
			}
			var iOffset;
			var shouldReturn = true;
			try{
				iOffset = parseInt(offset)
			} catch(e){
				shouldReturn = false;
			}

			if(shouldReturn===true && !isNaN(iOffset)){
				return val;
			}

			if(J$.type_memo){
				var signature  = '';
				for (var prop in base) {
					if (base.hasOwnProperty(prop)) {
					    signature += prop + '|';
					}
				}
				if(J$.type_memo[iid]){
					outter:{
						for(var i=0;i<J$.type_memo[iid].length;i++){
							if(J$.type_memo[iid][i] == signature){
								break outter;
							}
						}
						J$.type_memo[iid].push(signature);
					}
				} else {
					J$.type_memo[iid] = [];
					J$.type_memo[iid].push(signature);
				}
			} else {
				J$.type_memo = [];
			}
		}
		
		return val;
	}
};

J$.typeInfo = function() {
		if(J$.type_memo){
			for(var i=0;i<J$.type_memo.length;i++){
				if(J$.type_memo[i] && J$.type_memo[i].length > 1){
					console.log('iid: ' + i + ':');
					console.group();
					for(var j=0;j<J$.type_memo[i].length;j++){
						console.log('sig['+j+']:' + J$.type_memo[i][j]);
					}
					console.groupEnd();
				}
			}
		} else {
			J$.type_memo = [];
		}
	}
