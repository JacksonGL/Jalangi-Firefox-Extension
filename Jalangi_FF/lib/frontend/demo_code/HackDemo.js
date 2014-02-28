use together with:
http://www.digitalattackmap.com/#anim=1&color=0&country=ALL&time=15860.6&view=map

--------------------------------------------------
example: change "Russia" -> "Solvet Union"

    J$.counter = {};
    J$.counter.ObjectReference = [];
    J$.counter.count = 0;
    J$.analyzer = {
        // G: get field
        // function called after G
        // base is the object from which the field will get
        // offset is either a number or a string indexing the field to get
        // val is the value gets from base.[offset]
        // return value will affect the retrieved value in the instrumented code
        post_G: function (iid, base, offset, val, norr) {
    	    if(typeof val == 'string'){
        		if(val == 'Russia'){
        			//console.log(name + ":" + val);
        			val = 'Soviet Union';
        		} else if(val == 'United States'){
                    //console.log('iid: ' + iid + ', ' + base + '.' + offset);
                    //console.log(name + ":" + val);
                    val = 'USA';
                }
    	    }
            return val;
        }
    };


