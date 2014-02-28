// hack demo2
// http://ushiroad.com/jsviz/


J$.analysis = {}; 
J$.analysis.getField = function(iid, base, offset, val) {
	if(typeof val == 'string' && offset == 'name' && val.indexOf(offset) <0) {
		console.log(val + '->' + offset + ':' + val); 
		return offset + ':' + val;
	}
	return val;
};