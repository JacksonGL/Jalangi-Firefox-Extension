Find a bug in Kendou UI:


Find a Bug in www.kendoui.com

actually the bug is in jQuery 1.8.3
//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js


first of all open the www.kendoui.com (with Jalangi Firefox Extension),
in the web console, plugin the following detection code, which checks NaN on the fly,

Then we can get some warning in the web console
[18:39:52.413] "[NaN iid: 306533] [object Object].now:NaN"
[18:39:52.413] "[NaN iid: 306533] [object Object].now:NaN"
[18:39:52.427] "[NaN iid: 306533] [object Object].now:NaN"
[18:39:52.427] "[NaN iid: 306533] [object Object].now:NaN"

according to the iid and sourcemap, we can trace the code snippet that trigger the warning:

this.now=(this.end-this.start)*t+this.start

further dynamic analysis shows that sometimes this.end could return a string value (e.g., '30% 0'),
as a result (this.end-this.start)*t becomes NaN (type is undefined, this is strange), and this.now finally gets NaN

How to confirm that? modify the above code as follows:

(this.now=(this.end-this.start)*t+this.start || (console.log('!!!! ' + this.now + '|' + (typeof this.now) + ' end: ' + this.end + ' type: ' + (typeof this.end) + '  start:' + this.start + ' type: ' + (typeof this.start) + ' t:' + t + ' type: ' + (typeof t))))

open the www.kendoui.com webpage in Firefox (with Jalangi Firefox Extension disabled)
paste the modified jquery.js script into the web console so that it will override the original jquery.js script.

and observe the warning in the web console, we get a lot of warning:

[18:47:00.324] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.9764896707586094 type: number"
[18:47:00.324] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.9764896707586094 type: number"
[18:47:00.342] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.9815812833988291 type: number"
[18:47:00.342] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.9815812833988291 type: number"
[18:47:00.354] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.9850632982450529 type: number"
[18:47:00.354] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.9850632982450529 type: number"
[18:47:00.362] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.9870275120854054 type: number"
[18:47:00.362] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.9870275120854054 type: number"
[18:47:00.391] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.9929980185352525 type: number"
[18:47:00.391] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.9929980185352525 type: number"
[18:47:00.401] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.9946361664814942 type: number"
[18:47:00.401] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.9946361664814942 type: number"
[18:47:00.408] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.9956538155347532 type: number"
[18:47:00.409] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.9956538155347532 type: number"
[18:47:00.431] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.9982464296247522 type: number"
[18:47:00.432] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.9982464296247522 type: number"
[18:47:00.441] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.9990133642141358 type: number"
[18:47:00.442] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.9990133642141358 type: number"
[18:47:00.445] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:0.99925886621271 type: number"
[18:47:00.446] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:0.99925886621271 type: number"
[18:47:00.473] "!!!! undefined|undefined end: 0% 0 type: string  start:40 type: number t:1 type: number"
[18:47:00.473] "!!!! undefined|undefined end: 30% 0 type: string  start:70 type: number t:1 type: number"

plugin code:

// check NaN
    J$.analyzer = {
        // R: read
        // function called after R
        // val is the read value
        // return value will be the new read value
        post_R: function (iid, name, val) {
            if(typeof val == 'number' && isNaN(val) == true){
                console.log('[NaN iid: ' + iid +'] ' + name + ":" + val);
            }
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
            if(typeof val == 'number' && isNaN(val) == true){
                console.log('[NaN iid: ' + iid +'] ' + name + ":" + val);
            }
            return val;
        },
        N: function (iid, name, val, isArgumentSync) {
            if(typeof val == 'number' && isNaN(val) == true){
                console.log('[NaN iid: ' + iid +'] ' + name + ":" + val);
            }
            //return val;
        },
        A: function (iid, base, offset, op) {
            if(typeof base != 'undefined' && base != null && (typeof base[offset] == 'number') && isNaN(base[offset]) == true){
                console.log('[NaN iid: ' + iid +'] ' + base + '.' + offset + ':' + val);
            }
        },
        // G: get field
        // function called before G
        // base is the object from which the field will get
        // offset is either a number or a string indexing the field to get
        pre_G: function (iid, base, offset, norr) {
            if((iid == 306509 || iid == 306517)  && (isNaN(base[offset]))) {
                console.log('pre get [iid: ' + iid +']:' + base[offset] + ':' + (typeof base[offset]));
            }
            try{
                if(typeof base != 'undefined' && base != null && (typeof val == 'number') && isNaN(val) == true){
                    console.log('pre get: [NaN iid: ' + iid +'] ' + base + '.' + offset + ':' + val);
                }
            }catch(e){
                console.log(e);
            }
        },
        // G: get field
        // function called after G
        // base is the object from which the field will get
        // offset is either a number or a string indexing the field to get
        // val is the value gets from base.[offset]
        // return value will affect the retrieved value in the instrumented code
        post_G: function (iid, base, offset, val, norr) {
            //if((iid == 306509 || iid == 306517)  && (isNaN(val))) {
            //    console.log('[iid: ' + iid +']:' + val + ':' + (typeof val));
            //}
            try{
            if(typeof base != 'undefined' && base != null && (typeof val == 'number') && isNaN(val) == true){
                console.log('[NaN iid: ' + iid +'] ' + base + '.' + offset + ':' + val);
            }
            }catch(e){
                console.log(e);
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
                console.log('[NaN iid: ' + iid +'] ' + base + '.' + offset + ':' + val);
            }
            return val;
        },
        pre_B: function (iid, op, left, right) {
            //return result_c;
        },
        post_B: function (iid, op, left, right, val) {
            //if((iid==28094 || iid==28090 || iid== 28086) && isNaN(val) == true){
            //    console.log('[NaN B iid: ' + iid +']:' + val);
            //}
            
            //if((typeof val == 'number') && isNaN(val) == true){
            //    console.log('[NaN B iid: ' + iid +']:' + val);
            //    console.log('left: ' + left + ' | right: ' + right);
            //}
            return val;
            //return result_c;
        }
    };