// find misuse of checking NaN
// checking Nan should be either of the following forms:
// x !== x // true if and only if x is NaN
// or typeof x =='number' && isNaN(x)

// try to find x === NaN or x == NaN operation
J$.analysis = {
	binary: function (iid, op, left, right, result_c) {
        if(op === '==' || op == '===') {
            if(left !== left || right !== right) {
                console.warn('[iid: ' + iid + ']' + left + ' [type: ' + typeof left + ']'  + op + right + ' [type: ' + typeof right + ']');
            }
        }

        if(typeof left !== typeof right && typeof left !== typeof result_c &&  typeof right !== typeof result_c && op !== 'in' && op !== 'instanceof' && op !== '!=' && op !== '==' && op !== '===' && op !== '!==' && op !== '!===' && op.indexOf('<')<0  && op.indexOf('>')<0) {
            console.warn('hidden conversion: [iid: ' + iid + ']' + left + ' [type: ' + typeof left + ']'  + op + right + ' [type: ' + typeof right + '] -> ' + result_c + ' [type: ' + typeof result_c + ']');
        }

        if(op==='-' || op==='*' || op==='/'  || op==='%') {
            if(typeof left != typeof right){
                console.warn('hidden conversion: [iid: ' + iid + ']' + left + ' [type: ' + typeof left + ']'  + op + right + ' [type: ' + typeof right + '] -> ' + result_c + ' [type: ' + typeof result_c + ']');
            }
        }

        return result_c;
    },
	literalPre: function (iid, val) {
		if(val !== val) {
			console.warn('[iid: ' + iid + ']' + 'use of literal NaN');
		}
	}
};



/*
Found many interesting conversions in jQuery
http://taitems.github.io/Aristo-jQuery-UI-Theme/
	[18:17:55.537] "hidden conversion: [iid: 4174]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:55.539] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:55.586] "hidden conversion: [iid: 4174]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:55.587] "hidden conversion: [iid: 4174]undefined [type: undefined]^ [type: string] -> 0 [type: number]"
	[18:17:55.677] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:55.705] "hidden conversion: [iid: 4174]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.138] "hidden conversion: [iid: 4174]undefined [type: undefined]^ [type: string] -> 0 [type: number]"
	[18:17:56.138] "hidden conversion: [iid: 4174]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:56.138] "hidden conversion: [iid: 4174]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.139] "hidden conversion: [iid: 4174]undefined [type: undefined]^ [type: string] -> 0 [type: number]"
	[18:17:56.178] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.179] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:56.259] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.259] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:56.308] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.308] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:56.468] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.468] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:56.620] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.620] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:56.660] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.660] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:56.697] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.697] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:56.726] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:56.726] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:57.066] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:57.074] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:57.077] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:57.086] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:57.165] "hidden conversion: [iid: 3914]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:57.168] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:57.222] "hidden conversion: [iid: 4174]undefined [type: undefined]^false [type: boolean] -> 0 [type: number]"
	[18:17:57.275] "hidden conversion: [iid: 3914]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:57.301] "hidden conversion: [iid: 4174]undefined [type: undefined]^true [type: boolean] -> 1 [type: number]"
	[18:17:57.301] "hidden conversion: [iid: 4174]undefined [type: undefined]^ [type: string] -> 0 [type: number]"

*/