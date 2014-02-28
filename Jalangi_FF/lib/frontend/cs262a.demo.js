


------------------------------------------------------------------
dynamically observe and instrument newly added javascript code:

var script = document.createElement('script')
script.innerHTML = 'var div = document.getElementsByTagName("div")[0]; div.querySelectorAll; setTimeout(function(){var output = document.getElementsByTagName("head")[0].lastChild.innerHTML; console.log(output)},1000)'
var head = document.getElementsByTagName('head')[0]
head.appendChild(script)

var script = document.createElement('script')
script.innerHTML = 'setTimeout(function(){var a = "test"; a.test = 123; console.log("done")},1000)'
var head = document.getElementsByTagName('head')[0]
head.appendChild(script)

------------------------------------------------------------------

GUIMark test
http://www.craftymind.com/factory/guimark2/HTML5GamingTest.html
http://www.craftymind.com/factory/guimark2/HTML5AltChartingTest.html
http://www.craftymind.com/factory/guimark2/HTML5TextTest.html
http://www.craftymind.com/factory/guimark2/MobileHTML5ChartingTest.html
http://www.craftymind.com/factory/guimark2/MobileHTML5GamingTest.html

------------------------------------------------------------------
Sun Spider
http://www.webkit.org/perf/sunspider/versions.html

------------------------------------------------------------------
light weight js website:
http://www.lutanho.net/play/tetris.html
http://www.codecademy.com/
http://www.tinymce.com/tryit/full.php (slow)
http://gumbyframework.com/docs/javascript/#!/touch-support
http://bartaz.github.io/impress.js/#/overview
http://mobileawesomeness.com/?ref=tap

------------------------------------------------------------------
heavy weight real world website:

http://esprima.org/demo/parse.html
http://www.jslint.com/

kendoUI:
http://demos.telerik.com/kendo-ui/web/grid/index.html

jquery:
http://jqueryui.com/draggable/
http://taitems.github.io/Aristo-jQuery-UI-Theme/

dojo:
http://demos.dojotoolkit.org/demos/grid/demo.html

YUI:
http://yuilibrary.com/yui/docs/color/hsl-picker.html


J$.analysis = {
    putFieldPre: function(iid, base, offset, val) {
        if(val && val == '0') {
            if(base && (offset || typeof offset == 'number')){
                console.log(base + '.' + offset);
                val = 10000;
            } else {
                console.log(typeof base);
                console.log(typeof offset);
                console.log('base.offset cannot display');
            }
            
        }
        return val;
    }
}

http://yuilibrary.com/yui/docs/dd/groups-drag.html
http://yuilibrary.com/yui/docs/dd/photo-browser-example.html
http://yuilibrary.com/yui/docs/graphics/graphics-path-tool-example.html
http://yuilibrary.com/yui/docs/graphics/graphics-violin.html
http://yuilibrary.com/yui/docs/autocomplete/ac-yql.html

http://yuilibrary.com/yui/docs/dial/dial-interactive.html (needs debugging)

------------------------------------------------------------------
find a bug in a realworld website
www.kendoui.com

------------------------------------------------------------------
hacking the graph generation
http://ushiroad.com/jsviz/

// first find the reference to the value we want
J$.analysis = {};
J$.analysis.getField = function (iid, base, offset, val) {
    try{
        if(base && base[offset] && typeof base[offset]=='string' && base[offset]  == 'Mozilla'){
            //console.dir(base);
            console.log(offset);
        }
    }catch(e){
        console.log(e);
        console.dir(base);
        console.log(offset);
    }
    return val;
}

// then modify the value
J$.analysis = {}; 
J$.analysis.getField = function(iid, base, offset, val) {
    if(typeof val == 'string' && offset == 'name' && val.indexOf(offset) <0) {
        console.log(val + '->' + offset + ':' + val); 
        return offset + ':' + val;
    }
    return val;
};



------------------------------------------------------------------
hacking the digital map
http://www.digitalattackmap.com/#anim=1&color=0&country=ALL&time=16003&view=map
J$.analysis = {
        // G: get field
        // function called after G
        // base is the object from which the field will get
        // offset is either a number or a string indexing the field to get
        // val is the value gets from base.[offset]
        // return value will affect the retrieved value in the instrumented code
        getField: function (iid, base, offset, val) {
            if(typeof val == 'string'){
                if(val == 'China'){
                    //console.log(name + ":" + val);
                    val = 'Somewhere else';
                } else if(val == 'United States'){
                    //console.log('iid: ' + iid + ', ' + base + '.' + offset);
                    //console.log(name + ":" + val);
                    val = 'USA';
                }
            }
            return val;
        }
    };




------------------------------------------------------------------

Other interesting demos:
http://www.milanzivkovic.com/#about
http://web2.qq.com/webqq.html
http://demos.kendoui.com/web/listview/index.html
http://dev.sencha.com/deploy/ext-4.0.0/examples/desktop/desktop.html


cool demo using webGL:
http://images.businessweek.com/graphics/airbus-a350-3d-graphic/
http://madebyevan.com/webgl-water/

------------------------------------------------------------------
cc
http://www.adityaravishankar.com/projects/games/command-and-conquer/

needs debugging:

http://www.artgoeseverywhere.com/

www.google.com
www.facebook.com
www.youtube.com (problem when playing videos)

needs debugging:
http://dev.sencha.com/deploy/ext-4.0.0/examples/desktop/desktop.html   (when setting the instrudment code length limit to a larger value, it does not work, look into the problem shows that instrumenting classes.js gets wrong)         (works in original version, doesn't work in the new version)
http://www.apple.com/mac-pro/   (does not work in both)
http://demos.dojotoolkit.org/demos/mobileCharting/demo.html (does not work in new version, partially works in old version)

http://www.jshint.com/       (does not work in both)
http://demos.telerik.com/teampulse-demo/view  (does not work in old)

http://www.nihilogic.dk/labs/mario/mario_small_nomusic.htm (having trouble starts the game)
http://demos.dojotoolkit.org/demos/mobileCharting/demo.html (partially works in old version, completely does not work in new version)

http://www.anchormodeling.com/modeler/latest/?page_id=112 (does not work in new version)
https://webmaker.org/

http://www.apple.com/mac-pro/
https://www.inkling.com/read/javascript-definitive-guide-david-flanagan-6th/client-side-javascript-reference/workerglobalscope

to be tested:



