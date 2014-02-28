
output maxIndex:

var max = 0; var maxIndex = -1; for(prop in J$.counter) {if(J$.counter.hasOwnProperty(prop) && prop != 'count'){ if(J$.counter[prop] > max){max = J$.counter[prop]; maxIndex = prop;}}}

============================================================
definition code:

    J$.counter = {};
    J$.counter.ObjectReference = [];
    J$.counter.count = 0;
    J$.analyzer = {
        // F: function call
        // function called before F
        // modify retFunction will modify the concret return value
        pre_F: function (iid, f, origArguments, isConstructor) {

        },
        // F: function call
        // function called after F
        // modify retFunction will modify the concret return value
        post_F: function (iid, f, origArguments, isConstructor, retFunction) {
    		J$.counter.count++;
    		
    		if(J$.counter.ObjectReference.indexOf(f)<0) {
    			J$.counter.ObjectReference.push(f);
    			J$.counter['ref_' + (J$.counter.ObjectReference.length-1)] = 1;
    		}else{
    			J$.counter['ref_' + (J$.counter.ObjectReference.length-1)]++;
    		}
    		return retFunction;
        },
        // M: method call
        // function called before M
        pre_M: function (iid, base, offset, origArguments, isConstructor) {
	     
        },
        // M: method call
        // function called after M
        // modify retFunction will modify the concret return value
        post_M: function (iid, base, offset, origArguments, isConstructor, retFunction) {
		return retFunction;
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