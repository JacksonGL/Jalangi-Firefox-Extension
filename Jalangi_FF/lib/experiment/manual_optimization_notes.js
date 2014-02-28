

Q: What do the scores mean?

A: In a nutshell: bigger is better. Octane measures the time a test takes to complete and then assigns a score that is inversely proportional to the run time (historically, Firefox 2 produced a score of 100 on an old benchmark rig the V8 team used).

-----------------------------------------------------------------------------------------------------

after running the JIT-friendly analysis module on the octane benchmark deltablue.js

the analysis module output the following lines of warning:

23:07:06.824 "iid: 30002917: times: 452660"
23:07:06.824  analysis.js:2317
23:07:06.824 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.824 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319

which means the transformed operation with IID 30002917 is a polymorphic statement, which get a field from an object with two different object layouts, and this statement is executed 452660 times.

mapping back to the transformed code, we located the the following transformed code.

J$.P(30002961, J$.G(30002909, J$.R(30002905, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'output', J$.T(30002957, function () {
                    jalangiLabel40:
                        while (true) {
                            try {
                                J$.Fe(30002949, arguments.callee, this);
                                arguments = J$.N(30002953, 'arguments', arguments, true);
                                return J$.Rt(30002945, J$.C(124, J$.B(30000130, '==', J$.G(30002917, J$.R(30002913, 'this', this, false), 'direction'), J$.G(30002925, J$.R(30002921, 'Direction', Direction, false), 'FORWARD'))) ? J$.G(30002933, J$.R(30002929, 'this', this, false), 'v2') : J$.G(30002941, J$.R(30002937, 'this', this, false), 'v1'));
                            } catch (J$e) {
                                J$.Ex(30007441, J$e);
                            } finally {
                                if (J$.Fr(30007445))
                                    continue jalangiLabel40;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));

mapping back to the original code, it is the following lines of code:


/**
 * Returns the current output variable
 */
BinaryConstraint.prototype.output = function () {
  return (this.direction == Direction.FORWARD) ? this.v2 : this.v1;
}

ScaleConstraint.inheritsFrom(BinaryConstraint);
EqualityConstraint.inheritsFrom(BinaryConstraint);

in the above code, BinaryConstraint is a function acted as a super class. ScaleConstraint and EqualityConstraint are subclasses that inherits from BinaryConstraint. the inheritsFrom function simply makes subclass.prototype = superclass.prototype. Suppose sc is an instance of ScaleConstraint, and ec is an instance of EqualityConstraint. Executing sc.output and ec.output makes this.direction operation in BinaryConstraint.prototype.output trying to get a field from different object layouts in different times, this is a polymorphic statement,

So to optimize this code, we make a separate copy of output function for each subclass as follows. In this way, each time we call sc.output and ec.output, the get field operation: this.direction, this.v2 or this.v1 is a polymorphic statement and thus make the code less dynamic and consequently easy for JIT-compiler to optimize.


// added function to make polymorphic statement become monomorphic statement
ScaleConstraint.prototype.output = function () {
  return (this.direction == Direction.FORWARD) ? this.v2 : this.v1;
}

// added function to make polymorphic statement become monomorphic statement
EqualityConstraint.prototype.output = function () {
  return (this.direction == Direction.FORWARD) ? this.v2 : this.v1;
}


the result shows that after refactor this sinlge polymophic statement, we speedup the benchmark by more than 10%

but this definitely sacrifice the dynamic behaviour of javascript and thus lose the resusability. but we believe this can be used as a technique to refactor and uglify the code before releasing.

http://localhost:8081/octane/octane_modified.html

29528
29409
29449
28841
29224
29456


http://localhost:8081/octane/octane.html
26460
26467
26341
25568
26143
26170

but there is no improvement observed on Firefox spidermonkey engine.

====================================================================


====================================================================

attacking richards.js

http://localhost:8081/octane/octane_modified.html
26498
25082
26565
26484
26575
25710

26844

http://localhost:8081/octane/octane.html


27472
27165
27394
27521
27405
27119


on richard.js, found the following polymorphic statement:

"iid: 120002249: times: 216908"            analysis.js:2316
"sig[0]:scheduler|v1|v2|"            analysis.js:2319
"sig[1]:scheduler|v1|"                analysis.js:2319
"sig[2]:scheduler|v1|count|"

spot the "return this.task.run(packet);" statement
as there are different types of Tasks:
IdleTask, DeviceTask, WorkerTask, HandleTask

TaskControlBlock.prototype.run = function () {
  var packet;
  if (this.state == STATE_SUSPENDED_RUNNABLE) {
    packet = this.queue;
    this.queue = packet.link;
    if (this.queue == null) {
      this.state = STATE_RUNNING;
    } else {
      this.state = STATE_RUNNABLE;
    }
  } else {
    packet = null;
  }
  return this.task.run(packet);
};

so to optimize the code, add taskType field in the TaskControlBlock
and invoke according to different taskType:

/*
  switch(this.taskType) {
    case 1: return this.task.run(packet);
    case 2: return this.task.run(packet);
    case 3: return this.task.run(packet);
    case 4: return this.task.run(packet);
    default: return this.task.run(packet);
  }*/


===============================================================================================================================================

attacking deltablue.js

/**
 * Returns the current output variable
 */
BinaryConstraint.prototype.output = function () {
  return (this.direction == Direction.FORWARD) ? this.v2 : this.v1;
}


=============================================================================

23:07:06.817 "iid: 30002317: times: 6599" analysis.js:2316
23:07:06.818  analysis.js:2317
23:07:06.818 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.818 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.818 "iid: 30002365: times: 13232" analysis.js:2316
23:07:06.818  analysis.js:2317
23:07:06.818 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.818 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.818 "iid: 30002449: times: 13232" analysis.js:2316
23:07:06.818  analysis.js:2317
23:07:06.818 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.818 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.819 "iid: 30002469: times: 3332" analysis.js:2316
23:07:06.819  analysis.js:2317
23:07:06.819 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.819 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.819 "iid: 30002489: times: 3332" analysis.js:2316
23:07:06.819  analysis.js:2317
23:07:06.819 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.819 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.819 "iid: 30002497: times: 3332" analysis.js:2316
23:07:06.819  analysis.js:2317
23:07:06.819 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.819 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.819 "iid: 30002537: times: 13232" analysis.js:2316
23:07:06.820  analysis.js:2317
23:07:06.820 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.820 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.820 "iid: 30002549: times: 13232" analysis.js:2316
23:07:06.820  analysis.js:2317
23:07:06.820 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.820 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.820 "iid: 30002573: times: 3332" analysis.js:2316
23:07:06.820  analysis.js:2317
23:07:06.820 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.820 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.820 "iid: 30002581: times: 3332" analysis.js:2316
23:07:06.821  analysis.js:2317
23:07:06.821 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.821 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.821 "iid: 30002625: times: 9899" analysis.js:2316
23:07:06.821  analysis.js:2317
23:07:06.821 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.821 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.821 "iid: 30002633: times: 9899" analysis.js:2316
23:07:06.821  analysis.js:2317
23:07:06.821 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.821 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.821 "iid: 30002697: times: 6599" analysis.js:2316
23:07:06.821  analysis.js:2317
23:07:06.822 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.822 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.822 "iid: 30002713: times: 6599" analysis.js:2316
23:07:06.822  analysis.js:2317
23:07:06.822 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.822 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.822 "iid: 30002769: times: 56462" analysis.js:2316
23:07:06.822  analysis.js:2317
23:07:06.822 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.822 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.822 "iid: 30002813: times: 13232" analysis.js:2316
23:07:06.822  analysis.js:2317
23:07:06.823 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.823 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.823 "iid: 30002857: times: 386330" analysis.js:2316
23:07:06.823  analysis.js:2317
23:07:06.823 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.823 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.823 "iid: 30002873: times: 376100" analysis.js:2316
23:07:06.823  analysis.js:2317
23:07:06.823 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.823 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.823 "iid: 30002881: times: 10229" analysis.js:2316
23:07:06.823  analysis.js:2317
23:07:06.824 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.824 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.824 "iid: 30002917: times: 452660" analysis.js:2316
23:07:06.824  analysis.js:2317
23:07:06.824 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.824 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.824 "iid: 30002933: times: 435335" analysis.js:2316
23:07:06.824  analysis.js:2317
23:07:06.824 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.824 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.824 "iid: 30002941: times: 17324" analysis.js:2316
23:07:06.824  analysis.js:2317
23:07:06.825 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.825 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.825 "iid: 30003137: times: 9965" analysis.js:2316
23:07:06.825  analysis.js:2317
23:07:06.825 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.825 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.826 "iid: 30004341: times: 10097" analysis.js:2316
23:07:06.826  analysis.js:2317
23:07:06.826 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.826 "sig[1]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.826 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.826 "iid: 30004365: times: 6698" analysis.js:2316
23:07:06.826  analysis.js:2317
23:07:06.826 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.826 "sig[1]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.826 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.826 "iid: 30004705: times: 10130" analysis.js:2316
23:07:06.827  analysis.js:2317
23:07:06.827 "sig[0]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.827 "sig[1]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.827 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.827 "iid: 30004725: times: 10130" analysis.js:2316
23:07:06.827  analysis.js:2317
23:07:06.827 "sig[0]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.827 "sig[1]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.827 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.827 "iid: 30004745: times: 10130" analysis.js:2316
23:07:06.827  analysis.js:2317
23:07:06.827 "sig[0]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.827 "sig[1]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.827 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.828 "iid: 30004765: times: 10130" analysis.js:2316
23:07:06.828  analysis.js:2317
23:07:06.828 "sig[0]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.828 "sig[1]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.828 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.828 "iid: 30005029: times: 23363" analysis.js:2316
23:07:06.828  analysis.js:2317
23:07:06.828 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.828 "sig[1]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.828 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.828 "iid: 30005065: times: 23363" analysis.js:2316
23:07:06.829  analysis.js:2317
23:07:06.829 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.829 "sig[1]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.829 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.829 "iid: 30005077: times: 23363" analysis.js:2316
23:07:06.829  analysis.js:2317
23:07:06.829 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.829 "sig[1]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.829 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.829 "iid: 30005301: times: 13463" analysis.js:2316
23:07:06.829  analysis.js:2317
23:07:06.829 "sig[0]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.830 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.830 "iid: 30005393: times: 6797" analysis.js:2316
23:07:06.830  analysis.js:2317
23:07:06.830 "sig[0]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.830 "sig[1]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.830 "iid: 30005565: times: 23561" analysis.js:2316
23:07:06.830  analysis.js:2317
23:07:06.830 "sig[0]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.830 "sig[1]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.830 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:06.831 "iid: 30005837: times: 401279" analysis.js:2316
23:07:06.831  analysis.js:2317
23:07:06.831 "sig[0]:strength|myOutput|satisfied|" analysis.js:2319
23:07:06.831 "sig[1]:strength|v1|v2|direction|" analysis.js:2319
23:07:06.831 "sig[2]:direction|scale|offset|strength|v1|v2|" analysis.js:2319
23:07:13.834 "Number of polymorphic statements spotted: 63"



=============================================================================



 try{ if( ((typeof window) == 'undefined') && ((typeof self) != 'undefined') && ((typeof importScripts) != 'undefined') && ((typeof J$) == 'undefined') ){ importScripts('https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js'); 
 importScripts('https://raw.github.com/JacksonGL/Jalangi_ref/master/InputManager.js');} 
 }catch(e){throw e;} 
/*[J$ Transformed]*/
try{ J$.console.log('[ext-js-inst]: http://localhost:8081/octane/octane_files/deltablue.js'); } catch(e) { } 
/*code intercepted from: http://localhost:8081/octane/octane_files/deltablue.js  */ if (typeof window === 'undefined') {
    require('/home/jacksongl/JacksonGL_Ubuntu_Workspace/research/jalangi/jalangi-multiPaper/src/js/analysis.js');
    require('/home/jacksongl/JacksonGL_Ubuntu_Workspace/research/jalangi/jalangi-multiPaper/src/js/InputManager.js');
    require('/home/jacksongl/JacksonGL_Ubuntu_Workspace/research/jalangi/jalangi-multiPaper/src/js/instrument/esnstrument.js');
    require(process.cwd() + '/inputs.js');
}
{
    jalangiLabel74:
        while (true) {
            try {
                J$.Se(30006977, '/home/jacksongl/JacksonGL_Ubuntu_Workspace/Codebase/Jalangi_FF_extension/Firefox Extension/Firefox_Addon_SDK/addon-sdk-1.14/Jalangi_FF/data/record/script_1_jalangi_.js');
                function OrderedCollection() {
                    jalangiLabel2:
                        while (true) {
                            try {
                                J$.Fe(30000189, arguments.callee, this);
                                arguments = J$.N(30000193, 'arguments', arguments, true);
                                J$.P(30000185, J$.R(30000169, 'this', this, false), 'elms', J$.T(30000181, J$.F(30000177, J$.I(typeof Array === 'undefined' ? Array = J$.R(30000173, 'Array', undefined, true) : Array = J$.R(30000173, 'Array', Array, true)), true)(), 11));
                            } catch (J$e) {
                                J$.Ex(30007137, J$e);
                            } finally {
                                if (J$.Fr(30007141))
                                    continue jalangiLabel2;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function Strength(strengthValue, name) {
                    jalangiLabel8:
                        while (true) {
                            try {
                                J$.Fe(30000585, arguments.callee, this);
                                arguments = J$.N(30000589, 'arguments', arguments, true);
                                strengthValue = J$.N(30000593, 'strengthValue', strengthValue, true);
                                name = J$.N(30000597, 'name', name, true);
                                J$.P(30000569, J$.R(30000561, 'this', this, false), 'strengthValue', J$.R(30000565, 'strengthValue', strengthValue, false));
                                J$.P(30000581, J$.R(30000573, 'this', this, false), 'name', J$.R(30000577, 'name', name, false));
                            } catch (J$e) {
                                J$.Ex(30007185, J$e);
                            } finally {
                                if (J$.Fr(30007189))
                                    continue jalangiLabel8;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function Constraint(strength) {
                    jalangiLabel14:
                        while (true) {
                            try {
                                J$.Fe(30001145, arguments.callee, this);
                                arguments = J$.N(30001149, 'arguments', arguments, true);
                                strength = J$.N(30001153, 'strength', strength, true);
                                J$.P(30001141, J$.R(30001133, 'this', this, false), 'strength', J$.R(30001137, 'strength', strength, false));
                            } catch (J$e) {
                                J$.Ex(30007233, J$e);
                            } finally {
                                if (J$.Fr(30007237))
                                    continue jalangiLabel14;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function UnaryConstraint(v, strength) {
                    jalangiLabel19:
                        while (true) {
                            try {
                                J$.Fe(30001541, arguments.callee, this);
                                arguments = J$.N(30001545, 'arguments', arguments, true);
                                v = J$.N(30001549, 'v', v, true);
                                strength = J$.N(30001553, 'strength', strength, true);
                                J$.M(30001505, J$.G(30001493, J$.R(30001489, 'UnaryConstraint', UnaryConstraint, false), 'superConstructor'), 'call', false)(J$.R(30001497, 'this', this, false), J$.R(30001501, 'strength', strength, false));
                                J$.P(30001517, J$.R(30001509, 'this', this, false), 'myOutput', J$.R(30001513, 'v', v, false));
                                J$.P(30001529, J$.R(30001521, 'this', this, false), 'satisfied', J$.T(30001525, false, 23));
                                J$.M(30001537, J$.R(30001533, 'this', this, false), 'addConstraint', false)();
                            } catch (J$e) {
                                J$.Ex(30007273, J$e);
                            } finally {
                                if (J$.Fr(30007277))
                                    continue jalangiLabel19;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function StayConstraint(v, str) {
                    jalangiLabel29:
                        while (true) {
                            try {
                                J$.Fe(30002041, arguments.callee, this);
                                arguments = J$.N(30002045, 'arguments', arguments, true);
                                v = J$.N(30002049, 'v', v, true);
                                str = J$.N(30002053, 'str', str, true);
                                J$.M(30002037, J$.G(30002021, J$.R(30002017, 'StayConstraint', StayConstraint, false), 'superConstructor'), 'call', false)(J$.R(30002025, 'this', this, false), J$.R(30002029, 'v', v, false), J$.R(30002033, 'str', str, false));
                            } catch (J$e) {
                                J$.Ex(30007353, J$e);
                            } finally {
                                if (J$.Fr(30007357))
                                    continue jalangiLabel29;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function EditConstraint(v, str) {
                    jalangiLabel31:
                        while (true) {
                            try {
                                J$.Fe(30002117, arguments.callee, this);
                                arguments = J$.N(30002121, 'arguments', arguments, true);
                                v = J$.N(30002125, 'v', v, true);
                                str = J$.N(30002129, 'str', str, true);
                                J$.M(30002113, J$.G(30002097, J$.R(30002093, 'EditConstraint', EditConstraint, false), 'superConstructor'), 'call', false)(J$.R(30002101, 'this', this, false), J$.R(30002105, 'v', v, false), J$.R(30002109, 'str', str, false));
                            } catch (J$e) {
                                J$.Ex(30007369, J$e);
                            } finally {
                                if (J$.Fr(30007373))
                                    continue jalangiLabel31;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function BinaryConstraint(var1, var2, strength) {
                    jalangiLabel34:
                        while (true) {
                            try {
                                J$.Fe(30002321, arguments.callee, this);
                                arguments = J$.N(30002325, 'arguments', arguments, true);
                                var1 = J$.N(30002329, 'var1', var1, true);
                                var2 = J$.N(30002333, 'var2', var2, true);
                                strength = J$.N(30002337, 'strength', strength, true);
                                J$.M(30002269, J$.G(30002257, J$.R(30002253, 'BinaryConstraint', BinaryConstraint, false), 'superConstructor'), 'call', false)(J$.R(30002261, 'this', this, false), J$.R(30002265, 'strength', strength, false));
                                J$.P(30002281, J$.R(30002273, 'this', this, false), 'v1', J$.R(30002277, 'var1', var1, false));
                                J$.P(30002293, J$.R(30002285, 'this', this, false), 'v2', J$.R(30002289, 'var2', var2, false));
                                J$.P(30002309, J$.R(30002297, 'this', this, false), 'direction', J$.G(30002305, J$.R(30002301, 'Direction', Direction, false), 'NONE'));
                                J$.M(30002317, J$.R(30002313, 'this', this, false), 'addConstraint', false)();
                            } catch (J$e) {
                                J$.Ex(30007393, J$e);
                            } finally {
                                if (J$.Fr(30007397))
                                    continue jalangiLabel34;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function ScaleConstraint(src, scale, offset, dest, strength) {
                    jalangiLabel45:
                        while (true) {
                            try {
                                J$.Fe(30003369, arguments.callee, this);
                                arguments = J$.N(30003373, 'arguments', arguments, true);
                                src = J$.N(30003377, 'src', src, true);
                                scale = J$.N(30003381, 'scale', scale, true);
                                offset = J$.N(30003385, 'offset', offset, true);
                                dest = J$.N(30003389, 'dest', dest, true);
                                strength = J$.N(30003393, 'strength', strength, true);
                                J$.P(30003313, J$.R(30003301, 'this', this, false), 'direction', J$.G(30003309, J$.R(30003305, 'Direction', Direction, false), 'NONE'));
                                J$.P(30003325, J$.R(30003317, 'this', this, false), 'scale', J$.R(30003321, 'scale', scale, false));
                                J$.P(30003337, J$.R(30003329, 'this', this, false), 'offset', J$.R(30003333, 'offset', offset, false));
                                J$.M(30003365, J$.G(30003345, J$.R(30003341, 'ScaleConstraint', ScaleConstraint, false), 'superConstructor'), 'call', false)(J$.R(30003349, 'this', this, false), J$.R(30003353, 'src', src, false), J$.R(30003357, 'dest', dest, false), J$.R(30003361, 'strength', strength, false));
                            } catch (J$e) {
                                J$.Ex(30007481, J$e);
                            } finally {
                                if (J$.Fr(30007485))
                                    continue jalangiLabel45;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function EqualityConstraint(var1, var2, strength) {
                    jalangiLabel51:
                        while (true) {
                            try {
                                J$.Fe(30003985, arguments.callee, this);
                                arguments = J$.N(30003989, 'arguments', arguments, true);
                                var1 = J$.N(30003993, 'var1', var1, true);
                                var2 = J$.N(30003997, 'var2', var2, true);
                                strength = J$.N(30004001, 'strength', strength, true);
                                J$.M(30003981, J$.G(30003961, J$.R(30003957, 'EqualityConstraint', EqualityConstraint, false), 'superConstructor'), 'call', false)(J$.R(30003965, 'this', this, false), J$.R(30003969, 'var1', var1, false), J$.R(30003973, 'var2', var2, false), J$.R(30003977, 'strength', strength, false));
                            } catch (J$e) {
                                J$.Ex(30007529, J$e);
                            } finally {
                                if (J$.Fr(30007533))
                                    continue jalangiLabel51;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function Variable(name, initialValue) {
                    jalangiLabel53:
                        while (true) {
                            try {
                                J$.Fe(30004165, arguments.callee, this);
                                arguments = J$.N(30004169, 'arguments', arguments, true);
                                name = J$.N(30004173, 'name', name, true);
                                initialValue = J$.N(30004177, 'initialValue', initialValue, true);
                                J$.P(30004077, J$.R(30004065, 'this', this, false), 'value', J$.C(172, J$.R(30004069, 'initialValue', initialValue, false)) ? J$._() : J$.T(30004073, 0, 22));
                                J$.P(30004097, J$.R(30004081, 'this', this, false), 'constraints', J$.T(30004093, J$.F(30004089, J$.R(30004085, 'OrderedCollection', OrderedCollection, false), true)(), 11));
                                J$.P(30004109, J$.R(30004101, 'this', this, false), 'determinedBy', J$.T(30004105, null, 25));
                                J$.P(30004121, J$.R(30004113, 'this', this, false), 'mark', J$.T(30004117, 0, 22));
                                J$.P(30004137, J$.R(30004125, 'this', this, false), 'walkStrength', J$.G(30004133, J$.R(30004129, 'Strength', Strength, false), 'WEAKEST'));
                                J$.P(30004149, J$.R(30004141, 'this', this, false), 'stay', J$.T(30004145, true, 23));
                                J$.P(30004161, J$.R(30004153, 'this', this, false), 'name', J$.R(30004157, 'name', name, false));
                            } catch (J$e) {
                                J$.Ex(30007545, J$e);
                            } finally {
                                if (J$.Fr(30007549))
                                    continue jalangiLabel53;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function Planner() {
                    jalangiLabel56:
                        while (true) {
                            try {
                                J$.Fe(30004305, arguments.callee, this);
                                arguments = J$.N(30004309, 'arguments', arguments, true);
                                J$.P(30004301, J$.R(30004293, 'this', this, false), 'currentMark', J$.T(30004297, 0, 22));
                            } catch (J$e) {
                                J$.Ex(30007569, J$e);
                            } finally {
                                if (J$.Fr(30007573))
                                    continue jalangiLabel56;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function Plan() {
                    jalangiLabel65:
                        while (true) {
                            try {
                                J$.Fe(30005641, arguments.callee, this);
                                arguments = J$.N(30005645, 'arguments', arguments, true);
                                J$.P(30005637, J$.R(30005621, 'this', this, false), 'v', J$.T(30005633, J$.F(30005629, J$.R(30005625, 'OrderedCollection', OrderedCollection, false), true)(), 11));
                            } catch (J$e) {
                                J$.Ex(30007641, J$e);
                            } finally {
                                if (J$.Fr(30007645))
                                    continue jalangiLabel65;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function chainTest(n) {
                    jalangiLabel70:
                        while (true) {
                            try {
                                J$.Fe(30006201, arguments.callee, this);
                                arguments = J$.N(30006205, 'arguments', arguments, true);
                                n = J$.N(30006209, 'n', n, true);
                                J$.N(30006213, 'prev', prev, false);
                                J$.N(30006217, 'first', first, false);
                                J$.N(30006221, 'last', last, false);
                                J$.N(30006225, 'i', i, false);
                                J$.N(30006229, 'name', name, false);
                                J$.N(30006233, 'v', v, false);
                                J$.N(30006237, 'edit', edit, false);
                                J$.N(30006241, 'edits', edits, false);
                                J$.N(30006245, 'plan', plan, false);
                                planner = J$.W(30005877, 'planner', J$.T(30005873, J$.F(30005869, J$.R(30005865, 'Planner', Planner, false), true)(), 11), planner);
                                var prev = J$.W(30005893, 'prev', J$.T(30005881, null, 25), prev), first = J$.W(30005897, 'first', J$.T(30005885, null, 25), first), last = J$.W(30005901, 'last', J$.T(30005889, null, 25), last);
                                for (var i = J$.W(30005909, 'i', J$.T(30005905, 0, 22), i); J$.C(280, J$.B(30000322, '<=', J$.R(30005913, 'i', i, false), J$.R(30005917, 'n', n, false))); J$.B(30000334, '-', i = J$.W(30005925, 'i', J$.B(30000330, '+', J$.U(30000326, '+', J$.R(30005921, 'i', i, false)), 1), i), 1)) {
                                    var name = J$.W(30005937, 'name', J$.B(30000338, '+', J$.T(30005929, 'v', 21), J$.R(30005933, 'i', i, false)), name);
                                    var v = J$.W(30005957, 'v', J$.T(30005953, J$.F(30005949, J$.R(30005941, 'Variable', Variable, false), true)(J$.R(30005945, 'name', name, false)), 11), v);
                                    if (J$.C(268, J$.B(30000342, '!=', J$.R(30005961, 'prev', prev, false), J$.T(30005965, null, 25))))
                                        J$.T(30005993, J$.F(30005989, J$.R(30005969, 'EqualityConstraint', EqualityConstraint, false), true)(J$.R(30005973, 'prev', prev, false), J$.R(30005977, 'v', v, false), J$.G(30005985, J$.R(30005981, 'Strength', Strength, false), 'REQUIRED')), 11);
                                    if (J$.C(272, J$.B(30000346, '==', J$.R(30005997, 'i', i, false), J$.T(30006001, 0, 22))))
                                        first = J$.W(30006009, 'first', J$.R(30006005, 'v', v, false), first);
                                    if (J$.C(276, J$.B(30000350, '==', J$.R(30006013, 'i', i, false), J$.R(30006017, 'n', n, false))))
                                        last = J$.W(30006025, 'last', J$.R(30006021, 'v', v, false), last);
                                    prev = J$.W(30006033, 'prev', J$.R(30006029, 'v', v, false), prev);
                                }
                                J$.T(30006057, J$.F(30006053, J$.R(30006037, 'StayConstraint', StayConstraint, false), true)(J$.R(30006041, 'last', last, false), J$.G(30006049, J$.R(30006045, 'Strength', Strength, false), 'STRONG_DEFAULT')), 11);
                                var edit = J$.W(30006085, 'edit', J$.T(30006081, J$.F(30006077, J$.R(30006061, 'EditConstraint', EditConstraint, false), true)(J$.R(30006065, 'first', first, false), J$.G(30006073, J$.R(30006069, 'Strength', Strength, false), 'PREFERRED')), 11), edit);
                                var edits = J$.W(30006101, 'edits', J$.T(30006097, J$.F(30006093, J$.R(30006089, 'OrderedCollection', OrderedCollection, false), true)(), 11), edits);
                                J$.M(30006113, J$.R(30006105, 'edits', edits, false), 'add', false)(J$.R(30006109, 'edit', edit, false));
                                var plan = J$.W(30006129, 'plan', J$.M(30006125, J$.R(30006117, 'planner', planner, false), 'extractPlanFromConstraints', false)(J$.R(30006121, 'edits', edits, false)), plan);
                                for (var i = J$.W(30006137, 'i', J$.T(30006133, 0, 22), i); J$.C(288, J$.B(30000354, '<', J$.R(30006141, 'i', i, false), J$.T(30006145, 100, 22))); J$.B(30000366, '-', i = J$.W(30006153, 'i', J$.B(30000362, '+', J$.U(30000358, '+', J$.R(30006149, 'i', i, false)), 1), i), 1)) {
                                    J$.P(30006165, J$.R(30006157, 'first', first, false), 'value', J$.R(30006161, 'i', i, false));
                                    J$.M(30006173, J$.R(30006169, 'plan', plan, false), 'execute', false)();
                                    if (J$.C(284, J$.B(30000370, '!=', J$.G(30006181, J$.R(30006177, 'last', last, false), 'value'), J$.R(30006185, 'i', i, false))))
                                        J$.F(30006197, J$.I(typeof alert === 'undefined' ? alert = J$.R(30006189, 'alert', undefined, true) : alert = J$.R(30006189, 'alert', alert, true)), false)(J$.T(30006193, 'Chain test failed.', 21));
                                }
                            } catch (J$e) {
                                J$.Ex(30007681, J$e);
                            } finally {
                                if (J$.Fr(30007685))
                                    continue jalangiLabel70;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function projectionTest(n) {
                    jalangiLabel71:
                        while (true) {
                            try {
                                J$.Fe(30006745, arguments.callee, this);
                                arguments = J$.N(30006749, 'arguments', arguments, true);
                                n = J$.N(30006753, 'n', n, true);
                                J$.N(30006757, 'scale', scale, false);
                                J$.N(30006761, 'offset', offset, false);
                                J$.N(30006765, 'src', src, false);
                                J$.N(30006769, 'dst', dst, false);
                                J$.N(30006773, 'dests', dests, false);
                                J$.N(30006777, 'i', i, false);
                                planner = J$.W(30006261, 'planner', J$.T(30006257, J$.F(30006253, J$.R(30006249, 'Planner', Planner, false), true)(), 11), planner);
                                var scale = J$.W(30006285, 'scale', J$.T(30006281, J$.F(30006277, J$.R(30006265, 'Variable', Variable, false), true)(J$.T(30006269, 'scale', 21), J$.T(30006273, 10, 22)), 11), scale);
                                var offset = J$.W(30006309, 'offset', J$.T(30006305, J$.F(30006301, J$.R(30006289, 'Variable', Variable, false), true)(J$.T(30006293, 'offset', 21), J$.T(30006297, 1000, 22)), 11), offset);
                                var src = J$.W(30006321, 'src', J$.T(30006313, null, 25), src), dst = J$.W(30006325, 'dst', J$.T(30006317, null, 25), dst);
                                var dests = J$.W(30006341, 'dests', J$.T(30006337, J$.F(30006333, J$.R(30006329, 'OrderedCollection', OrderedCollection, false), true)(), 11), dests);
                                for (var i = J$.W(30006349, 'i', J$.T(30006345, 0, 22), i); J$.C(292, J$.B(30000374, '<', J$.R(30006353, 'i', i, false), J$.R(30006357, 'n', n, false))); J$.B(30000386, '-', i = J$.W(30006365, 'i', J$.B(30000382, '+', J$.U(30000378, '+', J$.R(30006361, 'i', i, false)), 1), i), 1)) {
                                    src = J$.W(30006393, 'src', J$.T(30006389, J$.F(30006385, J$.R(30006369, 'Variable', Variable, false), true)(J$.B(30000390, '+', J$.T(30006373, 'src', 21), J$.R(30006377, 'i', i, false)), J$.R(30006381, 'i', i, false)), 11), src);
                                    dst = J$.W(30006421, 'dst', J$.T(30006417, J$.F(30006413, J$.R(30006397, 'Variable', Variable, false), true)(J$.B(30000394, '+', J$.T(30006401, 'dst', 21), J$.R(30006405, 'i', i, false)), J$.R(30006409, 'i', i, false)), 11), dst);
                                    J$.M(30006433, J$.R(30006425, 'dests', dests, false), 'add', false)(J$.R(30006429, 'dst', dst, false));
                                    J$.T(30006457, J$.F(30006453, J$.R(30006437, 'StayConstraint', StayConstraint, false), true)(J$.R(30006441, 'src', src, false), J$.G(30006449, J$.R(30006445, 'Strength', Strength, false), 'NORMAL')), 11);
                                    J$.T(30006493, J$.F(30006489, J$.R(30006461, 'ScaleConstraint', ScaleConstraint, false), true)(J$.R(30006465, 'src', src, false), J$.R(30006469, 'scale', scale, false), J$.R(30006473, 'offset', offset, false), J$.R(30006477, 'dst', dst, false), J$.G(30006485, J$.R(30006481, 'Strength', Strength, false), 'REQUIRED')), 11);
                                }
                                J$.F(30006509, J$.R(30006497, 'change', change, false), false)(J$.R(30006501, 'src', src, false), J$.T(30006505, 17, 22));
                                if (J$.C(296, J$.B(30000398, '!=', J$.G(30006517, J$.R(30006513, 'dst', dst, false), 'value'), J$.T(30006521, 1170, 22))))
                                    J$.F(30006533, J$.I(typeof alert === 'undefined' ? alert = J$.R(30006525, 'alert', undefined, true) : alert = J$.R(30006525, 'alert', alert, true)), false)(J$.T(30006529, 'Projection 1 failed', 21));
                                J$.F(30006549, J$.R(30006537, 'change', change, false), false)(J$.R(30006541, 'dst', dst, false), J$.T(30006545, 1050, 22));
                                if (J$.C(300, J$.B(30000402, '!=', J$.G(30006557, J$.R(30006553, 'src', src, false), 'value'), J$.T(30006561, 5, 22))))
                                    J$.F(30006573, J$.I(typeof alert === 'undefined' ? alert = J$.R(30006565, 'alert', undefined, true) : alert = J$.R(30006565, 'alert', alert, true)), false)(J$.T(30006569, 'Projection 2 failed', 21));
                                J$.F(30006589, J$.R(30006577, 'change', change, false), false)(J$.R(30006581, 'scale', scale, false), J$.T(30006585, 5, 22));
                                for (var i = J$.W(30006597, 'i', J$.T(30006593, 0, 22), i); J$.C(308, J$.B(30000410, '<', J$.R(30006601, 'i', i, false), J$.B(30000406, '-', J$.R(30006605, 'n', n, false), J$.T(30006609, 1, 22)))); J$.B(30000422, '-', i = J$.W(30006617, 'i', J$.B(30000418, '+', J$.U(30000414, '+', J$.R(30006613, 'i', i, false)), 1), i), 1)) {
                                    if (J$.C(304, J$.B(30000434, '!=', J$.G(30006633, J$.M(30006629, J$.R(30006621, 'dests', dests, false), 'at', false)(J$.R(30006625, 'i', i, false)), 'value'), J$.B(30000430, '+', J$.B(30000426, '*', J$.R(30006637, 'i', i, false), J$.T(30006641, 5, 22)), J$.T(30006645, 1000, 22)))))
                                        J$.F(30006657, J$.I(typeof alert === 'undefined' ? alert = J$.R(30006649, 'alert', undefined, true) : alert = J$.R(30006649, 'alert', alert, true)), false)(J$.T(30006653, 'Projection 3 failed', 21));
                                }
                                J$.F(30006673, J$.R(30006661, 'change', change, false), false)(J$.R(30006665, 'offset', offset, false), J$.T(30006669, 2000, 22));
                                for (var i = J$.W(30006681, 'i', J$.T(30006677, 0, 22), i); J$.C(316, J$.B(30000442, '<', J$.R(30006685, 'i', i, false), J$.B(30000438, '-', J$.R(30006689, 'n', n, false), J$.T(30006693, 1, 22)))); J$.B(30000454, '-', i = J$.W(30006701, 'i', J$.B(30000450, '+', J$.U(30000446, '+', J$.R(30006697, 'i', i, false)), 1), i), 1)) {
                                    if (J$.C(312, J$.B(30000466, '!=', J$.G(30006717, J$.M(30006713, J$.R(30006705, 'dests', dests, false), 'at', false)(J$.R(30006709, 'i', i, false)), 'value'), J$.B(30000462, '+', J$.B(30000458, '*', J$.R(30006721, 'i', i, false), J$.T(30006725, 5, 22)), J$.T(30006729, 2000, 22)))))
                                        J$.F(30006741, J$.I(typeof alert === 'undefined' ? alert = J$.R(30006733, 'alert', undefined, true) : alert = J$.R(30006733, 'alert', alert, true)), false)(J$.T(30006737, 'Projection 4 failed', 21));
                                }
                            } catch (J$e) {
                                J$.Ex(30007689, J$e);
                            } finally {
                                if (J$.Fr(30007693))
                                    continue jalangiLabel71;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function change(v, newValue) {
                    jalangiLabel72:
                        while (true) {
                            try {
                                J$.Fe(30006905, arguments.callee, this);
                                arguments = J$.N(30006909, 'arguments', arguments, true);
                                v = J$.N(30006913, 'v', v, true);
                                newValue = J$.N(30006917, 'newValue', newValue, true);
                                J$.N(30006921, 'edit', edit, false);
                                J$.N(30006925, 'edits', edits, false);
                                J$.N(30006929, 'plan', plan, false);
                                J$.N(30006933, 'i', i, false);
                                var edit = J$.W(30006805, 'edit', J$.T(30006801, J$.F(30006797, J$.R(30006781, 'EditConstraint', EditConstraint, false), true)(J$.R(30006785, 'v', v, false), J$.G(30006793, J$.R(30006789, 'Strength', Strength, false), 'PREFERRED')), 11), edit);
                                var edits = J$.W(30006821, 'edits', J$.T(30006817, J$.F(30006813, J$.R(30006809, 'OrderedCollection', OrderedCollection, false), true)(), 11), edits);
                                J$.M(30006833, J$.R(30006825, 'edits', edits, false), 'add', false)(J$.R(30006829, 'edit', edit, false));
                                var plan = J$.W(30006849, 'plan', J$.M(30006845, J$.R(30006837, 'planner', planner, false), 'extractPlanFromConstraints', false)(J$.R(30006841, 'edits', edits, false)), plan);
                                for (var i = J$.W(30006857, 'i', J$.T(30006853, 0, 22), i); J$.C(320, J$.B(30000470, '<', J$.R(30006861, 'i', i, false), J$.T(30006865, 10, 22))); J$.B(30000482, '-', i = J$.W(30006873, 'i', J$.B(30000478, '+', J$.U(30000474, '+', J$.R(30006869, 'i', i, false)), 1), i), 1)) {
                                    J$.P(30006885, J$.R(30006877, 'v', v, false), 'value', J$.R(30006881, 'newValue', newValue, false));
                                    J$.M(30006893, J$.R(30006889, 'plan', plan, false), 'execute', false)();
                                }
                                J$.M(30006901, J$.R(30006897, 'edit', edit, false), 'destroyConstraint', false)();
                            } catch (J$e) {
                                J$.Ex(30007697, J$e);
                            } finally {
                                if (J$.Fr(30007701))
                                    continue jalangiLabel72;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                function deltaBlue() {
                    jalangiLabel73:
                        while (true) {
                            try {
                                J$.Fe(30006969, arguments.callee, this);
                                arguments = J$.N(30006973, 'arguments', arguments, true);
                                J$.F(30006953, J$.R(30006945, 'chainTest', chainTest, false), false)(J$.T(30006949, 100, 22));
                                J$.F(30006965, J$.R(30006957, 'projectionTest', projectionTest, false), false)(J$.T(30006961, 100, 22));
                            } catch (J$e) {
                                J$.Ex(30007705, J$e);
                            } finally {
                                if (J$.Fr(30007709))
                                    continue jalangiLabel73;
                                else
                                    return J$.Ra();
                            }
                        }
                }
                J$.N(30006981, 'DeltaBlue', DeltaBlue, false);
                J$.N(30006989, 'OrderedCollection', J$.T(30006985, OrderedCollection, 12), false);
                J$.N(30006997, 'Strength', J$.T(30006993, Strength, 12), false);
                J$.N(30007005, 'Constraint', J$.T(30007001, Constraint, 12), false);
                J$.N(30007013, 'UnaryConstraint', J$.T(30007009, UnaryConstraint, 12), false);
                J$.N(30007021, 'StayConstraint', J$.T(30007017, StayConstraint, 12), false);
                J$.N(30007029, 'EditConstraint', J$.T(30007025, EditConstraint, 12), false);
                J$.N(30007033, 'Direction', Direction, false);
                J$.N(30007041, 'BinaryConstraint', J$.T(30007037, BinaryConstraint, 12), false);
                J$.N(30007049, 'ScaleConstraint', J$.T(30007045, ScaleConstraint, 12), false);
                J$.N(30007057, 'EqualityConstraint', J$.T(30007053, EqualityConstraint, 12), false);
                J$.N(30007065, 'Variable', J$.T(30007061, Variable, 12), false);
                J$.N(30007073, 'Planner', J$.T(30007069, Planner, 12), false);
                J$.N(30007081, 'Plan', J$.T(30007077, Plan, 12), false);
                J$.N(30007089, 'chainTest', J$.T(30007085, chainTest, 12), false);
                J$.N(30007097, 'projectionTest', J$.T(30007093, projectionTest, 12), false);
                J$.N(30007105, 'change', J$.T(30007101, change, 12), false);
                J$.N(30007109, 'planner', planner, false);
                J$.N(30007117, 'deltaBlue', J$.T(30007113, deltaBlue, 12), false);
                var DeltaBlue = J$.W(30000061, 'DeltaBlue', J$.T(30000057, J$.F(30000053, J$.I(typeof BenchmarkSuite === 'undefined' ? BenchmarkSuite = J$.R(30000005, 'BenchmarkSuite', undefined, true) : BenchmarkSuite = J$.R(30000005, 'BenchmarkSuite', BenchmarkSuite, true)), true)(J$.T(30000009, 'DeltaBlue', 21), J$.T(30000017, [J$.T(30000013, 66118, 22)], 10), J$.T(30000049, [J$.T(30000045, J$.F(30000041, J$.I(typeof Benchmark === 'undefined' ? Benchmark = J$.R(30000021, 'Benchmark', undefined, true) : Benchmark = J$.R(30000021, 'Benchmark', Benchmark, true)), true)(J$.T(30000025, 'DeltaBlue', 21), J$.T(30000029, true, 23), J$.T(30000033, false, 23), J$.R(30000037, 'deltaBlue', deltaBlue, false)), 11)], 10)), 11), DeltaBlue);
                J$.M(30000165, J$.I(typeof Object === 'undefined' ? Object = J$.R(30000065, 'Object', undefined, true) : Object = J$.R(30000065, 'Object', Object, true)), 'defineProperty', false)(J$.G(30000073, J$.I(typeof Object === 'undefined' ? Object = J$.R(30000069, 'Object', undefined, true) : Object = J$.R(30000069, 'Object', Object, true)), 'prototype'), J$.T(30000077, 'inheritsFrom', 21), J$.T(30000161, {
                    value: J$.T(30000157, function (shuper) {
                        jalangiLabel1:
                            while (true) {
                                try {
                                    J$.Fe(30000137, arguments.callee, this);
                                    function Inheriter() {
                                        jalangiLabel0:
                                            while (true) {
                                                try {
                                                    J$.Fe(30000081, arguments.callee, this);
                                                    arguments = J$.N(30000085, 'arguments', arguments, true);
                                                } catch (J$e) {
                                                    J$.Ex(30007121, J$e);
                                                } finally {
                                                    if (J$.Fr(30007125))
                                                        continue jalangiLabel0;
                                                    else
                                                        return J$.Ra();
                                                }
                                            }
                                    }
                                    arguments = J$.N(30000141, 'arguments', arguments, true);
                                    shuper = J$.N(30000145, 'shuper', shuper, true);
                                    J$.N(30000153, 'Inheriter', J$.T(30000149, Inheriter, 12), false);
                                    J$.P(30000101, J$.R(30000089, 'Inheriter', Inheriter, false), 'prototype', J$.G(30000097, J$.R(30000093, 'shuper', shuper, false), 'prototype'));
                                    J$.P(30000121, J$.R(30000105, 'this', this, false), 'prototype', J$.T(30000117, J$.F(30000113, J$.R(30000109, 'Inheriter', Inheriter, false), true)(), 11));
                                    J$.P(30000133, J$.R(30000125, 'this', this, false), 'superConstructor', J$.R(30000129, 'shuper', shuper, false));
                                } catch (J$e) {
                                    J$.Ex(30007129, J$e);
                                } finally {
                                    if (J$.Fr(30007133))
                                        continue jalangiLabel1;
                                    else
                                        return J$.Ra();
                                }
                            }
                    }, 12)
                }, 11));
                J$.P(30000237, J$.G(30000201, J$.R(30000197, 'OrderedCollection', OrderedCollection, false), 'prototype'), 'add', J$.T(30000233, function (elm) {
                    jalangiLabel3:
                        while (true) {
                            try {
                                J$.Fe(30000221, arguments.callee, this);
                                arguments = J$.N(30000225, 'arguments', arguments, true);
                                elm = J$.N(30000229, 'elm', elm, true);
                                J$.M(30000217, J$.G(30000209, J$.R(30000205, 'this', this, false), 'elms'), 'push', false)(J$.R(30000213, 'elm', elm, false));
                            } catch (J$e) {
                                J$.Ex(30007145, J$e);
                            } finally {
                                if (J$.Fr(30007149))
                                    continue jalangiLabel3;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000285, J$.G(30000245, J$.R(30000241, 'OrderedCollection', OrderedCollection, false), 'prototype'), 'at', J$.T(30000281, function (index) {
                    jalangiLabel4:
                        while (true) {
                            try {
                                J$.Fe(30000269, arguments.callee, this);
                                arguments = J$.N(30000273, 'arguments', arguments, true);
                                index = J$.N(30000277, 'index', index, true);
                                return J$.Rt(30000265, J$.G(30000261, J$.G(30000253, J$.R(30000249, 'this', this, false), 'elms'), J$.R(30000257, 'index', index, false)));
                            } catch (J$e) {
                                J$.Ex(30007153, J$e);
                            } finally {
                                if (J$.Fr(30007157))
                                    continue jalangiLabel4;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000325, J$.G(30000293, J$.R(30000289, 'OrderedCollection', OrderedCollection, false), 'prototype'), 'size', J$.T(30000321, function () {
                    jalangiLabel5:
                        while (true) {
                            try {
                                J$.Fe(30000313, arguments.callee, this);
                                arguments = J$.N(30000317, 'arguments', arguments, true);
                                return J$.Rt(30000309, J$.G(30000305, J$.G(30000301, J$.R(30000297, 'this', this, false), 'elms'), 'length'));
                            } catch (J$e) {
                                J$.Ex(30007161, J$e);
                            } finally {
                                if (J$.Fr(30007165))
                                    continue jalangiLabel5;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000365, J$.G(30000333, J$.R(30000329, 'OrderedCollection', OrderedCollection, false), 'prototype'), 'removeFirst', J$.T(30000361, function () {
                    jalangiLabel6:
                        while (true) {
                            try {
                                J$.Fe(30000353, arguments.callee, this);
                                arguments = J$.N(30000357, 'arguments', arguments, true);
                                return J$.Rt(30000349, J$.M(30000345, J$.G(30000341, J$.R(30000337, 'this', this, false), 'elms'), 'pop', false)());
                            } catch (J$e) {
                                J$.Ex(30007169, J$e);
                            } finally {
                                if (J$.Fr(30007173))
                                    continue jalangiLabel6;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000557, J$.G(30000373, J$.R(30000369, 'OrderedCollection', OrderedCollection, false), 'prototype'), 'remove', J$.T(30000553, function (elm) {
                    jalangiLabel7:
                        while (true) {
                            try {
                                J$.Fe(30000525, arguments.callee, this);
                                arguments = J$.N(30000529, 'arguments', arguments, true);
                                elm = J$.N(30000533, 'elm', elm, true);
                                J$.N(30000537, 'index', index, false);
                                J$.N(30000541, 'skipped', skipped, false);
                                J$.N(30000545, 'i', i, false);
                                J$.N(30000549, 'value', value, false);
                                var index = J$.W(30000385, 'index', J$.T(30000377, 0, 22), index), skipped = J$.W(30000389, 'skipped', J$.T(30000381, 0, 22), skipped);
                                for (var i = J$.W(30000397, 'i', J$.T(30000393, 0, 22), i); J$.C(8, J$.B(30000006, '<', J$.R(30000401, 'i', i, false), J$.G(30000413, J$.G(30000409, J$.R(30000405, 'this', this, false), 'elms'), 'length'))); J$.B(30000018, '-', i = J$.W(30000421, 'i', J$.B(30000014, '+', J$.U(30000010, '+', J$.R(30000417, 'i', i, false)), 1), i), 1)) {
                                    var value = J$.W(30000441, 'value', J$.G(30000437, J$.G(30000429, J$.R(30000425, 'this', this, false), 'elms'), J$.R(30000433, 'i', i, false)), value);
                                    if (J$.C(4, J$.B(30000022, '!=', J$.R(30000445, 'value', value, false), J$.R(30000449, 'elm', elm, false)))) {
                                        J$.P(30000469, J$.G(30000457, J$.R(30000453, 'this', this, false), 'elms'), J$.R(30000461, 'index', index, false), J$.R(30000465, 'value', value, false));
                                        J$.B(30000034, '-', index = J$.W(30000477, 'index', J$.B(30000030, '+', J$.U(30000026, '+', J$.R(30000473, 'index', index, false)), 1), index), 1);
                                    } else {
                                        J$.B(30000046, '-', skipped = J$.W(30000485, 'skipped', J$.B(30000042, '+', J$.U(30000038, '+', J$.R(30000481, 'skipped', skipped, false)), 1), skipped), 1);
                                    }
                                }
                                for (var i = J$.W(30000493, 'i', J$.T(30000489, 0, 22), i); J$.C(12, J$.B(30000050, '<', J$.R(30000497, 'i', i, false), J$.R(30000501, 'skipped', skipped, false))); J$.B(30000062, '-', i = J$.W(30000509, 'i', J$.B(30000058, '+', J$.U(30000054, '+', J$.R(30000505, 'i', i, false)), 1), i), 1))
                                    J$.M(30000521, J$.G(30000517, J$.R(30000513, 'this', this, false), 'elms'), 'pop', false)();
                            } catch (J$e) {
                                J$.Ex(30007177, J$e);
                            } finally {
                                if (J$.Fr(30007181))
                                    continue jalangiLabel7;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000645, J$.R(30000601, 'Strength', Strength, false), 'stronger', J$.T(30000641, function (s1, s2) {
                    jalangiLabel9:
                        while (true) {
                            try {
                                J$.Fe(30000625, arguments.callee, this);
                                arguments = J$.N(30000629, 'arguments', arguments, true);
                                s1 = J$.N(30000633, 's1', s1, true);
                                s2 = J$.N(30000637, 's2', s2, true);
                                return J$.Rt(30000621, J$.B(30000066, '<', J$.G(30000609, J$.R(30000605, 's1', s1, false), 'strengthValue'), J$.G(30000617, J$.R(30000613, 's2', s2, false), 'strengthValue')));
                            } catch (J$e) {
                                J$.Ex(30007193, J$e);
                            } finally {
                                if (J$.Fr(30007197))
                                    continue jalangiLabel9;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000693, J$.R(30000649, 'Strength', Strength, false), 'weaker', J$.T(30000689, function (s1, s2) {
                    jalangiLabel10:
                        while (true) {
                            try {
                                J$.Fe(30000673, arguments.callee, this);
                                arguments = J$.N(30000677, 'arguments', arguments, true);
                                s1 = J$.N(30000681, 's1', s1, true);
                                s2 = J$.N(30000685, 's2', s2, true);
                                return J$.Rt(30000669, J$.B(30000070, '>', J$.G(30000657, J$.R(30000653, 's1', s1, false), 'strengthValue'), J$.G(30000665, J$.R(30000661, 's2', s2, false), 'strengthValue')));
                            } catch (J$e) {
                                J$.Ex(30007201, J$e);
                            } finally {
                                if (J$.Fr(30007205))
                                    continue jalangiLabel10;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000749, J$.R(30000697, 'Strength', Strength, false), 'weakestOf', J$.T(30000745, function (s1, s2) {
                    jalangiLabel11:
                        while (true) {
                            try {
                                J$.Fe(30000729, arguments.callee, this);
                                arguments = J$.N(30000733, 'arguments', arguments, true);
                                s1 = J$.N(30000737, 's1', s1, true);
                                s2 = J$.N(30000741, 's2', s2, true);
                                return J$.Rt(30000725, J$.C(16, J$.M(30000713, J$.R(30000701, 'this', this, false), 'weaker', false)(J$.R(30000705, 's1', s1, false), J$.R(30000709, 's2', s2, false))) ? J$.R(30000717, 's1', s1, false) : J$.R(30000721, 's2', s2, false));
                            } catch (J$e) {
                                J$.Ex(30007209, J$e);
                            } finally {
                                if (J$.Fr(30007213))
                                    continue jalangiLabel11;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000805, J$.R(30000753, 'Strength', Strength, false), 'strongest', J$.T(30000801, function (s1, s2) {
                    jalangiLabel12:
                        while (true) {
                            try {
                                J$.Fe(30000785, arguments.callee, this);
                                arguments = J$.N(30000789, 'arguments', arguments, true);
                                s1 = J$.N(30000793, 's1', s1, true);
                                s2 = J$.N(30000797, 's2', s2, true);
                                return J$.Rt(30000781, J$.C(20, J$.M(30000769, J$.R(30000757, 'this', this, false), 'stronger', false)(J$.R(30000761, 's1', s1, false), J$.R(30000765, 's2', s2, false))) ? J$.R(30000773, 's1', s1, false) : J$.R(30000777, 's2', s2, false));
                            } catch (J$e) {
                                J$.Ex(30007217, J$e);
                            } finally {
                                if (J$.Fr(30007221))
                                    continue jalangiLabel12;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000933, J$.G(30000813, J$.R(30000809, 'Strength', Strength, false), 'prototype'), 'nextWeaker', J$.T(30000929, function () {
                    jalangiLabel13:
                        while (true) {
                            try {
                                J$.Fe(30000921, arguments.callee, this);
                                arguments = J$.N(30000925, 'arguments', arguments, true);
                                switch (J$.C1(24, J$.G(30000821, J$.R(30000817, 'this', this, false), 'strengthValue'))) {
                                case J$.C2(28, J$.T(30000825, 0, 22)):
                                    return J$.Rt(30000837, J$.G(30000833, J$.R(30000829, 'Strength', Strength, false), 'WEAKEST'));
                                case J$.C2(32, J$.T(30000841, 1, 22)):
                                    return J$.Rt(30000853, J$.G(30000849, J$.R(30000845, 'Strength', Strength, false), 'WEAK_DEFAULT'));
                                case J$.C2(36, J$.T(30000857, 2, 22)):
                                    return J$.Rt(30000869, J$.G(30000865, J$.R(30000861, 'Strength', Strength, false), 'NORMAL'));
                                case J$.C2(40, J$.T(30000873, 3, 22)):
                                    return J$.Rt(30000885, J$.G(30000881, J$.R(30000877, 'Strength', Strength, false), 'STRONG_DEFAULT'));
                                case J$.C2(44, J$.T(30000889, 4, 22)):
                                    return J$.Rt(30000901, J$.G(30000897, J$.R(30000893, 'Strength', Strength, false), 'PREFERRED'));
                                case J$.C2(48, J$.T(30000905, 5, 22)):
                                    return J$.Rt(30000917, J$.G(30000913, J$.R(30000909, 'Strength', Strength, false), 'REQUIRED'));
                                }
                            } catch (J$e) {
                                J$.Ex(30007225, J$e);
                            } finally {
                                if (J$.Fr(30007229))
                                    continue jalangiLabel13;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30000961, J$.R(30000937, 'Strength', Strength, false), 'REQUIRED', J$.T(30000957, J$.F(30000953, J$.R(30000941, 'Strength', Strength, false), true)(J$.T(30000945, 0, 22), J$.T(30000949, 'required', 21)), 11));
                J$.P(30000989, J$.R(30000965, 'Strength', Strength, false), 'STONG_PREFERRED', J$.T(30000985, J$.F(30000981, J$.R(30000969, 'Strength', Strength, false), true)(J$.T(30000973, 1, 22), J$.T(30000977, 'strongPreferred', 21)), 11));
                J$.P(30001017, J$.R(30000993, 'Strength', Strength, false), 'PREFERRED', J$.T(30001013, J$.F(30001009, J$.R(30000997, 'Strength', Strength, false), true)(J$.T(30001001, 2, 22), J$.T(30001005, 'preferred', 21)), 11));
                J$.P(30001045, J$.R(30001021, 'Strength', Strength, false), 'STRONG_DEFAULT', J$.T(30001041, J$.F(30001037, J$.R(30001025, 'Strength', Strength, false), true)(J$.T(30001029, 3, 22), J$.T(30001033, 'strongDefault', 21)), 11));
                J$.P(30001073, J$.R(30001049, 'Strength', Strength, false), 'NORMAL', J$.T(30001069, J$.F(30001065, J$.R(30001053, 'Strength', Strength, false), true)(J$.T(30001057, 4, 22), J$.T(30001061, 'normal', 21)), 11));
                J$.P(30001101, J$.R(30001077, 'Strength', Strength, false), 'WEAK_DEFAULT', J$.T(30001097, J$.F(30001093, J$.R(30001081, 'Strength', Strength, false), true)(J$.T(30001085, 5, 22), J$.T(30001089, 'weakDefault', 21)), 11));
                J$.P(30001129, J$.R(30001105, 'Strength', Strength, false), 'WEAKEST', J$.T(30001125, J$.F(30001121, J$.R(30001109, 'Strength', Strength, false), true)(J$.T(30001113, 6, 22), J$.T(30001117, 'weakest', 21)), 11));
                J$.P(30001197, J$.G(30001161, J$.R(30001157, 'Constraint', Constraint, false), 'prototype'), 'addConstraint', J$.T(30001193, function () {
                    jalangiLabel15:
                        while (true) {
                            try {
                                J$.Fe(30001185, arguments.callee, this);
                                arguments = J$.N(30001189, 'arguments', arguments, true);
                                J$.M(30001169, J$.R(30001165, 'this', this, false), 'addToGraph', false)();
                                J$.M(30001181, J$.R(30001173, 'planner', planner, false), 'incrementalAdd', false)(J$.R(30001177, 'this', this, false));
                            } catch (J$e) {
                                J$.Ex(30007241, J$e);
                            } finally {
                                if (J$.Fr(30007245))
                                    continue jalangiLabel15;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001401, J$.G(30001205, J$.R(30001201, 'Constraint', Constraint, false), 'prototype'), 'satisfy', J$.T(30001397, function (mark) {
                    jalangiLabel16:
                        while (true) {
                            try {
                                J$.Fe(30001377, arguments.callee, this);
                                arguments = J$.N(30001381, 'arguments', arguments, true);
                                mark = J$.N(30001385, 'mark', mark, true);
                                J$.N(30001389, 'out', out, false);
                                J$.N(30001393, 'overridden', overridden, false);
                                J$.M(30001217, J$.R(30001209, 'this', this, false), 'chooseMethod', false)(J$.R(30001213, 'mark', mark, false));
                                if (J$.C(56, J$.U(30000074, '!', J$.M(30001225, J$.R(30001221, 'this', this, false), 'isSatisfied', false)()))) {
                                    if (J$.C(52, J$.B(30000078, '==', J$.G(30001233, J$.R(30001229, 'this', this, false), 'strength'), J$.G(30001241, J$.R(30001237, 'Strength', Strength, false), 'REQUIRED'))))
                                        J$.F(30001253, J$.I(typeof alert === 'undefined' ? alert = J$.R(30001245, 'alert', undefined, true) : alert = J$.R(30001245, 'alert', alert, true)), false)(J$.T(30001249, 'Could not satisfy a required constraint!', 21));
                                    return J$.Rt(30001261, J$.T(30001257, null, 25));
                                }
                                J$.M(30001273, J$.R(30001265, 'this', this, false), 'markInputs', false)(J$.R(30001269, 'mark', mark, false));
                                var out = J$.W(30001285, 'out', J$.M(30001281, J$.R(30001277, 'this', this, false), 'output', false)(), out);
                                var overridden = J$.W(30001297, 'overridden', J$.G(30001293, J$.R(30001289, 'out', out, false), 'determinedBy'), overridden);
                                if (J$.C(60, J$.B(30000082, '!=', J$.R(30001301, 'overridden', overridden, false), J$.T(30001305, null, 25))))
                                    J$.M(30001313, J$.R(30001309, 'overridden', overridden, false), 'markUnsatisfied', false)();
                                J$.P(30001325, J$.R(30001317, 'out', out, false), 'determinedBy', J$.R(30001321, 'this', this, false));
                                if (J$.C(64, J$.U(30000086, '!', J$.M(30001341, J$.R(30001329, 'planner', planner, false), 'addPropagate', false)(J$.R(30001333, 'this', this, false), J$.R(30001337, 'mark', mark, false)))))
                                    J$.F(30001353, J$.I(typeof alert === 'undefined' ? alert = J$.R(30001345, 'alert', undefined, true) : alert = J$.R(30001345, 'alert', alert, true)), false)(J$.T(30001349, 'Cycle encountered', 21));
                                J$.P(30001365, J$.R(30001357, 'out', out, false), 'mark', J$.R(30001361, 'mark', mark, false));
                                return J$.Rt(30001373, J$.R(30001369, 'overridden', overridden, false));
                            } catch (J$e) {
                                J$.Ex(30007249, J$e);
                            } finally {
                                if (J$.Fr(30007253))
                                    continue jalangiLabel16;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001453, J$.G(30001409, J$.R(30001405, 'Constraint', Constraint, false), 'prototype'), 'destroyConstraint', J$.T(30001449, function () {
                    jalangiLabel17:
                        while (true) {
                            try {
                                J$.Fe(30001441, arguments.callee, this);
                                arguments = J$.N(30001445, 'arguments', arguments, true);
                                if (J$.C(68, J$.M(30001417, J$.R(30001413, 'this', this, false), 'isSatisfied', false)()))
                                    J$.M(30001429, J$.R(30001421, 'planner', planner, false), 'incrementalRemove', false)(J$.R(30001425, 'this', this, false));
                                else
                                    J$.M(30001437, J$.R(30001433, 'this', this, false), 'removeFromGraph', false)();
                            } catch (J$e) {
                                J$.Ex(30007257, J$e);
                            } finally {
                                if (J$.Fr(30007261))
                                    continue jalangiLabel17;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001485, J$.G(30001461, J$.R(30001457, 'Constraint', Constraint, false), 'prototype'), 'isInput', J$.T(30001481, function () {
                    jalangiLabel18:
                        while (true) {
                            try {
                                J$.Fe(30001473, arguments.callee, this);
                                arguments = J$.N(30001477, 'arguments', arguments, true);
                                return J$.Rt(30001469, J$.T(30001465, false, 23));
                            } catch (J$e) {
                                J$.Ex(30007265, J$e);
                            } finally {
                                if (J$.Fr(30007269))
                                    continue jalangiLabel18;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.M(30001565, J$.R(30001557, 'UnaryConstraint', UnaryConstraint, false), 'inheritsFrom', false)(J$.R(30001561, 'Constraint', Constraint, false));
                J$.P(30001617, J$.G(30001573, J$.R(30001569, 'UnaryConstraint', UnaryConstraint, false), 'prototype'), 'addToGraph', J$.T(30001613, function () {
                    jalangiLabel20:
                        while (true) {
                            try {
                                J$.Fe(30001605, arguments.callee, this);
                                arguments = J$.N(30001609, 'arguments', arguments, true);
                                J$.M(30001589, J$.G(30001581, J$.R(30001577, 'this', this, false), 'myOutput'), 'addConstraint', false)(J$.R(30001585, 'this', this, false));
                                J$.P(30001601, J$.R(30001593, 'this', this, false), 'satisfied', J$.T(30001597, false, 23));
                            } catch (J$e) {
                                J$.Ex(30007281, J$e);
                            } finally {
                                if (J$.Fr(30007285))
                                    continue jalangiLabel20;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001697, J$.G(30001625, J$.R(30001621, 'UnaryConstraint', UnaryConstraint, false), 'prototype'), 'chooseMethod', J$.T(30001693, function (mark) {
                    jalangiLabel21:
                        while (true) {
                            try {
                                J$.Fe(30001681, arguments.callee, this);
                                arguments = J$.N(30001685, 'arguments', arguments, true);
                                mark = J$.N(30001689, 'mark', mark, true);
                                J$.P(30001677, J$.R(30001629, 'this', this, false), 'satisfied', J$.C(72, J$.B(30000090, '!=', J$.G(30001641, J$.G(30001637, J$.R(30001633, 'this', this, false), 'myOutput'), 'mark'), J$.R(30001645, 'mark', mark, false))) ? J$.M(30001673, J$.R(30001649, 'Strength', Strength, false), 'stronger', false)(J$.G(30001657, J$.R(30001653, 'this', this, false), 'strength'), J$.G(30001669, J$.G(30001665, J$.R(30001661, 'this', this, false), 'myOutput'), 'walkStrength')) : J$._());
                            } catch (J$e) {
                                J$.Ex(30007289, J$e);
                            } finally {
                                if (J$.Fr(30007293))
                                    continue jalangiLabel21;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001733, J$.G(30001705, J$.R(30001701, 'UnaryConstraint', UnaryConstraint, false), 'prototype'), 'isSatisfied', J$.T(30001729, function () {
                    jalangiLabel22:
                        while (true) {
                            try {
                                J$.Fe(30001721, arguments.callee, this);
                                arguments = J$.N(30001725, 'arguments', arguments, true);
                                return J$.Rt(30001717, J$.G(30001713, J$.R(30001709, 'this', this, false), 'satisfied'));
                            } catch (J$e) {
                                J$.Ex(30007297, J$e);
                            } finally {
                                if (J$.Fr(30007301))
                                    continue jalangiLabel22;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001761, J$.G(30001741, J$.R(30001737, 'UnaryConstraint', UnaryConstraint, false), 'prototype'), 'markInputs', J$.T(30001757, function (mark) {
                    jalangiLabel23:
                        while (true) {
                            try {
                                J$.Fe(30001745, arguments.callee, this);
                                arguments = J$.N(30001749, 'arguments', arguments, true);
                                mark = J$.N(30001753, 'mark', mark, true);
                            } catch (J$e) {
                                J$.Ex(30007305, J$e);
                            } finally {
                                if (J$.Fr(30007309))
                                    continue jalangiLabel23;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001797, J$.G(30001769, J$.R(30001765, 'UnaryConstraint', UnaryConstraint, false), 'prototype'), 'output', J$.T(30001793, function () {
                    jalangiLabel24:
                        while (true) {
                            try {
                                J$.Fe(30001785, arguments.callee, this);
                                arguments = J$.N(30001789, 'arguments', arguments, true);
                                return J$.Rt(30001781, J$.G(30001777, J$.R(30001773, 'this', this, false), 'myOutput'));
                            } catch (J$e) {
                                J$.Ex(30007313, J$e);
                            } finally {
                                if (J$.Fr(30007317))
                                    continue jalangiLabel24;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001881, J$.G(30001805, J$.R(30001801, 'UnaryConstraint', UnaryConstraint, false), 'prototype'), 'recalculate', J$.T(30001877, function () {
                    jalangiLabel25:
                        while (true) {
                            try {
                                J$.Fe(30001869, arguments.callee, this);
                                arguments = J$.N(30001873, 'arguments', arguments, true);
                                J$.P(30001825, J$.G(30001813, J$.R(30001809, 'this', this, false), 'myOutput'), 'walkStrength', J$.G(30001821, J$.R(30001817, 'this', this, false), 'strength'));
                                J$.P(30001845, J$.G(30001833, J$.R(30001829, 'this', this, false), 'myOutput'), 'stay', J$.U(30000094, '!', J$.M(30001841, J$.R(30001837, 'this', this, false), 'isInput', false)()));
                                if (J$.C(76, J$.G(30001857, J$.G(30001853, J$.R(30001849, 'this', this, false), 'myOutput'), 'stay')))
                                    J$.M(30001865, J$.R(30001861, 'this', this, false), 'execute', false)();
                            } catch (J$e) {
                                J$.Ex(30007321, J$e);
                            } finally {
                                if (J$.Fr(30007325))
                                    continue jalangiLabel25;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001917, J$.G(30001889, J$.R(30001885, 'UnaryConstraint', UnaryConstraint, false), 'prototype'), 'markUnsatisfied', J$.T(30001913, function () {
                    jalangiLabel26:
                        while (true) {
                            try {
                                J$.Fe(30001905, arguments.callee, this);
                                arguments = J$.N(30001909, 'arguments', arguments, true);
                                J$.P(30001901, J$.R(30001893, 'this', this, false), 'satisfied', J$.T(30001897, false, 23));
                            } catch (J$e) {
                                J$.Ex(30007329, J$e);
                            } finally {
                                if (J$.Fr(30007333))
                                    continue jalangiLabel26;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30001949, J$.G(30001925, J$.R(30001921, 'UnaryConstraint', UnaryConstraint, false), 'prototype'), 'inputsKnown', J$.T(30001945, function () {
                    jalangiLabel27:
                        while (true) {
                            try {
                                J$.Fe(30001937, arguments.callee, this);
                                arguments = J$.N(30001941, 'arguments', arguments, true);
                                return J$.Rt(30001933, J$.T(30001929, true, 23));
                            } catch (J$e) {
                                J$.Ex(30007337, J$e);
                            } finally {
                                if (J$.Fr(30007341))
                                    continue jalangiLabel27;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30002013, J$.G(30001957, J$.R(30001953, 'UnaryConstraint', UnaryConstraint, false), 'prototype'), 'removeFromGraph', J$.T(30002009, function () {
                    jalangiLabel28:
                        while (true) {
                            try {
                                J$.Fe(30002001, arguments.callee, this);
                                arguments = J$.N(30002005, 'arguments', arguments, true);
                                if (J$.C(80, J$.B(30000098, '!=', J$.G(30001965, J$.R(30001961, 'this', this, false), 'myOutput'), J$.T(30001969, null, 25))))
                                    J$.M(30001985, J$.G(30001977, J$.R(30001973, 'this', this, false), 'myOutput'), 'removeConstraint', false)(J$.R(30001981, 'this', this, false));
                                J$.P(30001997, J$.R(30001989, 'this', this, false), 'satisfied', J$.T(30001993, false, 23));
                            } catch (J$e) {
                                J$.Ex(30007345, J$e);
                            } finally {
                                if (J$.Fr(30007349))
                                    continue jalangiLabel28;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.M(30002065, J$.R(30002057, 'StayConstraint', StayConstraint, false), 'inheritsFrom', false)(J$.R(30002061, 'UnaryConstraint', UnaryConstraint, false));
                J$.P(30002089, J$.G(30002073, J$.R(30002069, 'StayConstraint', StayConstraint, false), 'prototype'), 'execute', J$.T(30002085, function () {
                    jalangiLabel30:
                        while (true) {
                            try {
                                J$.Fe(30002077, arguments.callee, this);
                                arguments = J$.N(30002081, 'arguments', arguments, true);
                            } catch (J$e) {
                                J$.Ex(30007361, J$e);
                            } finally {
                                if (J$.Fr(30007365))
                                    continue jalangiLabel30;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.M(30002141, J$.R(30002133, 'EditConstraint', EditConstraint, false), 'inheritsFrom', false)(J$.R(30002137, 'UnaryConstraint', UnaryConstraint, false));
                J$.P(30002173, J$.G(30002149, J$.R(30002145, 'EditConstraint', EditConstraint, false), 'prototype'), 'isInput', J$.T(30002169, function () {
                    jalangiLabel32:
                        while (true) {
                            try {
                                J$.Fe(30002161, arguments.callee, this);
                                arguments = J$.N(30002165, 'arguments', arguments, true);
                                return J$.Rt(30002157, J$.T(30002153, true, 23));
                            } catch (J$e) {
                                J$.Ex(30007377, J$e);
                            } finally {
                                if (J$.Fr(30007381))
                                    continue jalangiLabel32;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30002197, J$.G(30002181, J$.R(30002177, 'EditConstraint', EditConstraint, false), 'prototype'), 'execute', J$.T(30002193, function () {
                    jalangiLabel33:
                        while (true) {
                            try {
                                J$.Fe(30002185, arguments.callee, this);
                                arguments = J$.N(30002189, 'arguments', arguments, true);
                            } catch (J$e) {
                                J$.Ex(30007385, J$e);
                            } finally {
                                if (J$.Fr(30007389))
                                    continue jalangiLabel33;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                var Direction = J$.W(30002213, 'Direction', J$.T(30002209, J$.F(30002205, J$.I(typeof Object === 'undefined' ? Object = J$.R(30002201, 'Object', undefined, true) : Object = J$.R(30002201, 'Object', Object, true)), true)(), 11), Direction);
                J$.P(30002225, J$.R(30002217, 'Direction', Direction, false), 'NONE', J$.T(30002221, 0, 22));
                J$.P(30002237, J$.R(30002229, 'Direction', Direction, false), 'FORWARD', J$.T(30002233, 1, 22));
                J$.P(30002249, J$.R(30002241, 'Direction', Direction, false), 'BACKWARD', J$.U(30000102, '-', J$.T(30002245, 1, 22)));
                J$.M(30002349, J$.R(30002341, 'BinaryConstraint', BinaryConstraint, false), 'inheritsFrom', false)(J$.R(30002345, 'Constraint', Constraint, false));
                J$.P(30002681, J$.G(30002357, J$.R(30002353, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'chooseMethod', J$.T(30002677, function (mark) {
                    jalangiLabel35:
                        while (true) {
                            try {
                                J$.Fe(30002665, arguments.callee, this);
                                arguments = J$.N(30002669, 'arguments', arguments, true);
                                mark = J$.N(30002673, 'mark', mark, true);
                                if (J$.C(92, J$.B(30000106, '==', J$.G(30002369, J$.G(30002365, J$.R(30002361, 'this', this, false), 'v1'), 'mark'), J$.R(30002373, 'mark', mark, false)))) {
                                    J$.P(30002441, J$.R(30002377, 'this', this, false), 'direction', J$.C(88, J$.C(84, J$.B(30000110, '!=', J$.G(30002389, J$.G(30002385, J$.R(30002381, 'this', this, false), 'v2'), 'mark'), J$.R(30002393, 'mark', mark, false))) ? J$.M(30002421, J$.R(30002397, 'Strength', Strength, false), 'stronger', false)(J$.G(30002405, J$.R(30002401, 'this', this, false), 'strength'), J$.G(30002417, J$.G(30002413, J$.R(30002409, 'this', this, false), 'v2'), 'walkStrength')) : J$._()) ? J$.G(30002429, J$.R(30002425, 'Direction', Direction, false), 'FORWARD') : J$.G(30002437, J$.R(30002433, 'Direction', Direction, false), 'NONE'));
                                }
                                if (J$.C(104, J$.B(30000114, '==', J$.G(30002453, J$.G(30002449, J$.R(30002445, 'this', this, false), 'v2'), 'mark'), J$.R(30002457, 'mark', mark, false)))) {
                                    J$.P(30002525, J$.R(30002461, 'this', this, false), 'direction', J$.C(100, J$.C(96, J$.B(30000118, '!=', J$.G(30002473, J$.G(30002469, J$.R(30002465, 'this', this, false), 'v1'), 'mark'), J$.R(30002477, 'mark', mark, false))) ? J$.M(30002505, J$.R(30002481, 'Strength', Strength, false), 'stronger', false)(J$.G(30002489, J$.R(30002485, 'this', this, false), 'strength'), J$.G(30002501, J$.G(30002497, J$.R(30002493, 'this', this, false), 'v1'), 'walkStrength')) : J$._()) ? J$.G(30002513, J$.R(30002509, 'Direction', Direction, false), 'BACKWARD') : J$.G(30002521, J$.R(30002517, 'Direction', Direction, false), 'NONE'));
                                }
                                if (J$.C(116, J$.M(30002557, J$.R(30002529, 'Strength', Strength, false), 'weaker', false)(J$.G(30002541, J$.G(30002537, J$.R(30002533, 'this', this, false), 'v1'), 'walkStrength'), J$.G(30002553, J$.G(30002549, J$.R(30002545, 'this', this, false), 'v2'), 'walkStrength')))) {
                                    J$.P(30002609, J$.R(30002561, 'this', this, false), 'direction', J$.C(108, J$.M(30002589, J$.R(30002565, 'Strength', Strength, false), 'stronger', false)(J$.G(30002573, J$.R(30002569, 'this', this, false), 'strength'), J$.G(30002585, J$.G(30002581, J$.R(30002577, 'this', this, false), 'v1'), 'walkStrength'))) ? J$.G(30002597, J$.R(30002593, 'Direction', Direction, false), 'BACKWARD') : J$.G(30002605, J$.R(30002601, 'Direction', Direction, false), 'NONE'));
                                } else {
                                    J$.P(30002661, J$.R(30002613, 'this', this, false), 'direction', J$.C(112, J$.M(30002641, J$.R(30002617, 'Strength', Strength, false), 'stronger', false)(J$.G(30002625, J$.R(30002621, 'this', this, false), 'strength'), J$.G(30002637, J$.G(30002633, J$.R(30002629, 'this', this, false), 'v2'), 'walkStrength'))) ? J$.G(30002649, J$.R(30002645, 'Direction', Direction, false), 'FORWARD') : J$.G(30002657, J$.R(30002653, 'Direction', Direction, false), 'BACKWARD'));
                                }
                            } catch (J$e) {
                                J$.Ex(30007401, J$e);
                            } finally {
                                if (J$.Fr(30007405))
                                    continue jalangiLabel35;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30002753, J$.G(30002689, J$.R(30002685, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'addToGraph', J$.T(30002749, function () {
                    jalangiLabel36:
                        while (true) {
                            try {
                                J$.Fe(30002741, arguments.callee, this);
                                arguments = J$.N(30002745, 'arguments', arguments, true);
                                J$.M(30002705, J$.G(30002697, J$.R(30002693, 'this', this, false), 'v1'), 'addConstraint', false)(J$.R(30002701, 'this', this, false));
                                J$.M(30002721, J$.G(30002713, J$.R(30002709, 'this', this, false), 'v2'), 'addConstraint', false)(J$.R(30002717, 'this', this, false));
                                J$.P(30002737, J$.R(30002725, 'this', this, false), 'direction', J$.G(30002733, J$.R(30002729, 'Direction', Direction, false), 'NONE'));
                            } catch (J$e) {
                                J$.Ex(30007409, J$e);
                            } finally {
                                if (J$.Fr(30007413))
                                    continue jalangiLabel36;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30002797, J$.G(30002761, J$.R(30002757, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'isSatisfied', J$.T(30002793, function () {
                    jalangiLabel37:
                        while (true) {
                            try {
                                J$.Fe(30002785, arguments.callee, this);
                                arguments = J$.N(30002789, 'arguments', arguments, true);
                                return J$.Rt(30002781, J$.B(30000122, '!=', J$.G(30002769, J$.R(30002765, 'this', this, false), 'direction'), J$.G(30002777, J$.R(30002773, 'Direction', Direction, false), 'NONE')));
                            } catch (J$e) {
                                J$.Ex(30007417, J$e);
                            } finally {
                                if (J$.Fr(30007421))
                                    continue jalangiLabel37;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30002841, J$.G(30002805, J$.R(30002801, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'markInputs', J$.T(30002837, function (mark) {
                    jalangiLabel38:
                        while (true) {
                            try {
                                J$.Fe(30002825, arguments.callee, this);
                                arguments = J$.N(30002829, 'arguments', arguments, true);
                                mark = J$.N(30002833, 'mark', mark, true);
                                J$.P(30002821, J$.M(30002813, J$.R(30002809, 'this', this, false), 'input', false)(), 'mark', J$.R(30002817, 'mark', mark, false));
                            } catch (J$e) {
                                J$.Ex(30007425, J$e);
                            } finally {
                                if (J$.Fr(30007429))
                                    continue jalangiLabel38;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30002901, J$.G(30002849, J$.R(30002845, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'input', J$.T(30002897, function () {
                    jalangiLabel39:
                        while (true) {
                            try {
                                J$.Fe(30002889, arguments.callee, this);
                                arguments = J$.N(30002893, 'arguments', arguments, true);
                                return J$.Rt(30002885, J$.C(120, J$.B(30000126, '==', J$.G(30002857, J$.R(30002853, 'this', this, false), 'direction'), J$.G(30002865, J$.R(30002861, 'Direction', Direction, false), 'FORWARD'))) ? J$.G(30002873, J$.R(30002869, 'this', this, false), 'v1') : J$.G(30002881, J$.R(30002877, 'this', this, false), 'v2'));
                            } catch (J$e) {
                                J$.Ex(30007433, J$e);
                            } finally {
                                if (J$.Fr(30007437))
                                    continue jalangiLabel39;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30002961, J$.G(30002909, J$.R(30002905, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'output', J$.T(30002957, function () {
                    jalangiLabel40:
                        while (true) {
                            try {
                                J$.Fe(30002949, arguments.callee, this);
                                arguments = J$.N(30002953, 'arguments', arguments, true);
                                return J$.Rt(30002945, J$.C(124, J$.B(30000130, '==', J$.G(30002917, J$.R(30002913, 'this', this, false), 'direction'), J$.G(30002925, J$.R(30002921, 'Direction', Direction, false), 'FORWARD'))) ? J$.G(30002933, J$.R(30002929, 'this', this, false), 'v2') : J$.G(30002941, J$.R(30002937, 'this', this, false), 'v1'));
                            } catch (J$e) {
                                J$.Ex(30007441, J$e);
                            } finally {
                                if (J$.Fr(30007445))
                                    continue jalangiLabel40;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30003081, J$.G(30002969, J$.R(30002965, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'recalculate', J$.T(30003077, function () {
                    jalangiLabel41:
                        while (true) {
                            try {
                                J$.Fe(30003061, arguments.callee, this);
                                arguments = J$.N(30003065, 'arguments', arguments, true);
                                J$.N(30003069, 'ihn', ihn, false);
                                J$.N(30003073, 'out', out, false);
                                var ihn = J$.W(30002989, 'ihn', J$.M(30002977, J$.R(30002973, 'this', this, false), 'input', false)(), ihn), out = J$.W(30002993, 'out', J$.M(30002985, J$.R(30002981, 'this', this, false), 'output', false)(), out);
                                J$.P(30003025, J$.R(30002997, 'out', out, false), 'walkStrength', J$.M(30003021, J$.R(30003001, 'Strength', Strength, false), 'weakestOf', false)(J$.G(30003009, J$.R(30003005, 'this', this, false), 'strength'), J$.G(30003017, J$.R(30003013, 'ihn', ihn, false), 'walkStrength')));
                                J$.P(30003041, J$.R(30003029, 'out', out, false), 'stay', J$.G(30003037, J$.R(30003033, 'ihn', ihn, false), 'stay'));
                                if (J$.C(128, J$.G(30003049, J$.R(30003045, 'out', out, false), 'stay')))
                                    J$.M(30003057, J$.R(30003053, 'this', this, false), 'execute', false)();
                            } catch (J$e) {
                                J$.Ex(30007449, J$e);
                            } finally {
                                if (J$.Fr(30007453))
                                    continue jalangiLabel41;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30003121, J$.G(30003089, J$.R(30003085, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'markUnsatisfied', J$.T(30003117, function () {
                    jalangiLabel42:
                        while (true) {
                            try {
                                J$.Fe(30003109, arguments.callee, this);
                                arguments = J$.N(30003113, 'arguments', arguments, true);
                                J$.P(30003105, J$.R(30003093, 'this', this, false), 'direction', J$.G(30003101, J$.R(30003097, 'Direction', Direction, false), 'NONE'));
                            } catch (J$e) {
                                J$.Ex(30007457, J$e);
                            } finally {
                                if (J$.Fr(30007461))
                                    continue jalangiLabel42;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30003201, J$.G(30003129, J$.R(30003125, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'inputsKnown', J$.T(30003197, function (mark) {
                    jalangiLabel43:
                        while (true) {
                            try {
                                J$.Fe(30003181, arguments.callee, this);
                                arguments = J$.N(30003185, 'arguments', arguments, true);
                                mark = J$.N(30003189, 'mark', mark, true);
                                J$.N(30003193, 'i', i, false);
                                var i = J$.W(30003141, 'i', J$.M(30003137, J$.R(30003133, 'this', this, false), 'input', false)(), i);
                                return J$.Rt(30003177, J$.C(136, J$.C(132, J$.B(30000134, '==', J$.G(30003149, J$.R(30003145, 'i', i, false), 'mark'), J$.R(30003153, 'mark', mark, false))) ? J$._() : J$.G(30003161, J$.R(30003157, 'i', i, false), 'stay')) ? J$._() : J$.B(30000138, '==', J$.G(30003169, J$.R(30003165, 'i', i, false), 'determinedBy'), J$.T(30003173, null, 25)));
                            } catch (J$e) {
                                J$.Ex(30007465, J$e);
                            } finally {
                                if (J$.Fr(30007469))
                                    continue jalangiLabel43;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30003297, J$.G(30003209, J$.R(30003205, 'BinaryConstraint', BinaryConstraint, false), 'prototype'), 'removeFromGraph', J$.T(30003293, function () {
                    jalangiLabel44:
                        while (true) {
                            try {
                                J$.Fe(30003285, arguments.callee, this);
                                arguments = J$.N(30003289, 'arguments', arguments, true);
                                if (J$.C(140, J$.B(30000142, '!=', J$.G(30003217, J$.R(30003213, 'this', this, false), 'v1'), J$.T(30003221, null, 25))))
                                    J$.M(30003237, J$.G(30003229, J$.R(30003225, 'this', this, false), 'v1'), 'removeConstraint', false)(J$.R(30003233, 'this', this, false));
                                if (J$.C(144, J$.B(30000146, '!=', J$.G(30003245, J$.R(30003241, 'this', this, false), 'v2'), J$.T(30003249, null, 25))))
                                    J$.M(30003265, J$.G(30003257, J$.R(30003253, 'this', this, false), 'v2'), 'removeConstraint', false)(J$.R(30003261, 'this', this, false));
                                J$.P(30003281, J$.R(30003269, 'this', this, false), 'direction', J$.G(30003277, J$.R(30003273, 'Direction', Direction, false), 'NONE'));
                            } catch (J$e) {
                                J$.Ex(30007473, J$e);
                            } finally {
                                if (J$.Fr(30007477))
                                    continue jalangiLabel44;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.M(30003405, J$.R(30003397, 'ScaleConstraint', ScaleConstraint, false), 'inheritsFrom', false)(J$.R(30003401, 'BinaryConstraint', BinaryConstraint, false));
                J$.P(30003485, J$.G(30003413, J$.R(30003409, 'ScaleConstraint', ScaleConstraint, false), 'prototype'), 'addToGraph', J$.T(30003481, function () {
                    jalangiLabel46:
                        while (true) {
                            try {
                                J$.Fe(30003473, arguments.callee, this);
                                arguments = J$.N(30003477, 'arguments', arguments, true);
                                J$.M(30003437, J$.G(30003429, J$.G(30003425, J$.G(30003421, J$.R(30003417, 'ScaleConstraint', ScaleConstraint, false), 'superConstructor'), 'prototype'), 'addToGraph'), 'call', false)(J$.R(30003433, 'this', this, false));
                                J$.M(30003453, J$.G(30003445, J$.R(30003441, 'this', this, false), 'scale'), 'addConstraint', false)(J$.R(30003449, 'this', this, false));
                                J$.M(30003469, J$.G(30003461, J$.R(30003457, 'this', this, false), 'offset'), 'addConstraint', false)(J$.R(30003465, 'this', this, false));
                            } catch (J$e) {
                                J$.Ex(30007489, J$e);
                            } finally {
                                if (J$.Fr(30007493))
                                    continue jalangiLabel46;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30003589, J$.G(30003493, J$.R(30003489, 'ScaleConstraint', ScaleConstraint, false), 'prototype'), 'removeFromGraph', J$.T(30003585, function () {
                    jalangiLabel47:
                        while (true) {
                            try {
                                J$.Fe(30003577, arguments.callee, this);
                                arguments = J$.N(30003581, 'arguments', arguments, true);
                                J$.M(30003517, J$.G(30003509, J$.G(30003505, J$.G(30003501, J$.R(30003497, 'ScaleConstraint', ScaleConstraint, false), 'superConstructor'), 'prototype'), 'removeFromGraph'), 'call', false)(J$.R(30003513, 'this', this, false));
                                if (J$.C(148, J$.B(30000150, '!=', J$.G(30003525, J$.R(30003521, 'this', this, false), 'scale'), J$.T(30003529, null, 25))))
                                    J$.M(30003545, J$.G(30003537, J$.R(30003533, 'this', this, false), 'scale'), 'removeConstraint', false)(J$.R(30003541, 'this', this, false));
                                if (J$.C(152, J$.B(30000154, '!=', J$.G(30003553, J$.R(30003549, 'this', this, false), 'offset'), J$.T(30003557, null, 25))))
                                    J$.M(30003573, J$.G(30003565, J$.R(30003561, 'this', this, false), 'offset'), 'removeConstraint', false)(J$.R(30003569, 'this', this, false));
                            } catch (J$e) {
                                J$.Ex(30007497, J$e);
                            } finally {
                                if (J$.Fr(30007501))
                                    continue jalangiLabel47;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30003673, J$.G(30003597, J$.R(30003593, 'ScaleConstraint', ScaleConstraint, false), 'prototype'), 'markInputs', J$.T(30003669, function (mark) {
                    jalangiLabel48:
                        while (true) {
                            try {
                                J$.Fe(30003657, arguments.callee, this);
                                arguments = J$.N(30003661, 'arguments', arguments, true);
                                mark = J$.N(30003665, 'mark', mark, true);
                                J$.M(30003625, J$.G(30003613, J$.G(30003609, J$.G(30003605, J$.R(30003601, 'ScaleConstraint', ScaleConstraint, false), 'superConstructor'), 'prototype'), 'markInputs'), 'call', false)(J$.R(30003617, 'this', this, false), J$.R(30003621, 'mark', mark, false));
                                J$.P(30003653, J$.G(30003633, J$.R(30003629, 'this', this, false), 'scale'), 'mark', J$.P(30003649, J$.G(30003641, J$.R(30003637, 'this', this, false), 'offset'), 'mark', J$.R(30003645, 'mark', mark, false)));
                            } catch (J$e) {
                                J$.Ex(30007505, J$e);
                            } finally {
                                if (J$.Fr(30007509))
                                    continue jalangiLabel48;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30003809, J$.G(30003681, J$.R(30003677, 'ScaleConstraint', ScaleConstraint, false), 'prototype'), 'execute', J$.T(30003805, function () {
                    jalangiLabel49:
                        while (true) {
                            try {
                                J$.Fe(30003797, arguments.callee, this);
                                arguments = J$.N(30003801, 'arguments', arguments, true);
                                if (J$.C(156, J$.B(30000158, '==', J$.G(30003689, J$.R(30003685, 'this', this, false), 'direction'), J$.G(30003697, J$.R(30003693, 'Direction', Direction, false), 'FORWARD')))) {
                                    J$.P(30003745, J$.G(30003705, J$.R(30003701, 'this', this, false), 'v2'), 'value', J$.B(30000166, '+', J$.B(30000162, '*', J$.G(30003717, J$.G(30003713, J$.R(30003709, 'this', this, false), 'v1'), 'value'), J$.G(30003729, J$.G(30003725, J$.R(30003721, 'this', this, false), 'scale'), 'value')), J$.G(30003741, J$.G(30003737, J$.R(30003733, 'this', this, false), 'offset'), 'value')));
                                } else {
                                    J$.P(30003793, J$.G(30003753, J$.R(30003749, 'this', this, false), 'v1'), 'value', J$.B(30000174, '/', J$.B(30000170, '-', J$.G(30003765, J$.G(30003761, J$.R(30003757, 'this', this, false), 'v2'), 'value'), J$.G(30003777, J$.G(30003773, J$.R(30003769, 'this', this, false), 'offset'), 'value')), J$.G(30003789, J$.G(30003785, J$.R(30003781, 'this', this, false), 'scale'), 'value')));
                                }
                            } catch (J$e) {
                                J$.Ex(30007513, J$e);
                            } finally {
                                if (J$.Fr(30007517))
                                    continue jalangiLabel49;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30003953, J$.G(30003817, J$.R(30003813, 'ScaleConstraint', ScaleConstraint, false), 'prototype'), 'recalculate', J$.T(30003949, function () {
                    jalangiLabel50:
                        while (true) {
                            try {
                                J$.Fe(30003933, arguments.callee, this);
                                arguments = J$.N(30003937, 'arguments', arguments, true);
                                J$.N(30003941, 'ihn', ihn, false);
                                J$.N(30003945, 'out', out, false);
                                var ihn = J$.W(30003837, 'ihn', J$.M(30003825, J$.R(30003821, 'this', this, false), 'input', false)(), ihn), out = J$.W(30003841, 'out', J$.M(30003833, J$.R(30003829, 'this', this, false), 'output', false)(), out);
                                J$.P(30003873, J$.R(30003845, 'out', out, false), 'walkStrength', J$.M(30003869, J$.R(30003849, 'Strength', Strength, false), 'weakestOf', false)(J$.G(30003857, J$.R(30003853, 'this', this, false), 'strength'), J$.G(30003865, J$.R(30003861, 'ihn', ihn, false), 'walkStrength')));
                                J$.P(30003913, J$.R(30003877, 'out', out, false), 'stay', J$.C(164, J$.C(160, J$.G(30003885, J$.R(30003881, 'ihn', ihn, false), 'stay')) ? J$.G(30003897, J$.G(30003893, J$.R(30003889, 'this', this, false), 'scale'), 'stay') : J$._()) ? J$.G(30003909, J$.G(30003905, J$.R(30003901, 'this', this, false), 'offset'), 'stay') : J$._());
                                if (J$.C(168, J$.G(30003921, J$.R(30003917, 'out', out, false), 'stay')))
                                    J$.M(30003929, J$.R(30003925, 'this', this, false), 'execute', false)();
                            } catch (J$e) {
                                J$.Ex(30007521, J$e);
                            } finally {
                                if (J$.Fr(30007525))
                                    continue jalangiLabel50;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.M(30004013, J$.R(30004005, 'EqualityConstraint', EqualityConstraint, false), 'inheritsFrom', false)(J$.R(30004009, 'BinaryConstraint', BinaryConstraint, false));
                J$.P(30004061, J$.G(30004021, J$.R(30004017, 'EqualityConstraint', EqualityConstraint, false), 'prototype'), 'execute', J$.T(30004057, function () {
                    jalangiLabel52:
                        while (true) {
                            try {
                                J$.Fe(30004049, arguments.callee, this);
                                arguments = J$.N(30004053, 'arguments', arguments, true);
                                J$.P(30004045, J$.M(30004029, J$.R(30004025, 'this', this, false), 'output', false)(), 'value', J$.G(30004041, J$.M(30004037, J$.R(30004033, 'this', this, false), 'input', false)(), 'value'));
                            } catch (J$e) {
                                J$.Ex(30007537, J$e);
                            } finally {
                                if (J$.Fr(30007541))
                                    continue jalangiLabel52;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30004221, J$.G(30004185, J$.R(30004181, 'Variable', Variable, false), 'prototype'), 'addConstraint', J$.T(30004217, function (c) {
                    jalangiLabel54:
                        while (true) {
                            try {
                                J$.Fe(30004205, arguments.callee, this);
                                arguments = J$.N(30004209, 'arguments', arguments, true);
                                c = J$.N(30004213, 'c', c, true);
                                J$.M(30004201, J$.G(30004193, J$.R(30004189, 'this', this, false), 'constraints'), 'add', false)(J$.R(30004197, 'c', c, false));
                            } catch (J$e) {
                                J$.Ex(30007553, J$e);
                            } finally {
                                if (J$.Fr(30007557))
                                    continue jalangiLabel54;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30004289, J$.G(30004229, J$.R(30004225, 'Variable', Variable, false), 'prototype'), 'removeConstraint', J$.T(30004285, function (c) {
                    jalangiLabel55:
                        while (true) {
                            try {
                                J$.Fe(30004273, arguments.callee, this);
                                arguments = J$.N(30004277, 'arguments', arguments, true);
                                c = J$.N(30004281, 'c', c, true);
                                J$.M(30004245, J$.G(30004237, J$.R(30004233, 'this', this, false), 'constraints'), 'remove', false)(J$.R(30004241, 'c', c, false));
                                if (J$.C(176, J$.B(30000178, '==', J$.G(30004253, J$.R(30004249, 'this', this, false), 'determinedBy'), J$.R(30004257, 'c', c, false))))
                                    J$.P(30004269, J$.R(30004261, 'this', this, false), 'determinedBy', J$.T(30004265, null, 25));
                            } catch (J$e) {
                                J$.Ex(30007561, J$e);
                            } finally {
                                if (J$.Fr(30007565))
                                    continue jalangiLabel55;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30004397, J$.G(30004317, J$.R(30004313, 'Planner', Planner, false), 'prototype'), 'incrementalAdd', J$.T(30004393, function (c) {
                    jalangiLabel57:
                        while (true) {
                            try {
                                J$.Fe(30004373, arguments.callee, this);
                                arguments = J$.N(30004377, 'arguments', arguments, true);
                                c = J$.N(30004381, 'c', c, true);
                                J$.N(30004385, 'mark', mark, false);
                                J$.N(30004389, 'overridden', overridden, false);
                                var mark = J$.W(30004329, 'mark', J$.M(30004325, J$.R(30004321, 'this', this, false), 'newMark', false)(), mark);
                                var overridden = J$.W(30004345, 'overridden', J$.M(30004341, J$.R(30004333, 'c', c, false), 'satisfy', false)(J$.R(30004337, 'mark', mark, false)), overridden);
                                while (J$.C(180, J$.B(30000182, '!=', J$.R(30004349, 'overridden', overridden, false), J$.T(30004353, null, 25))))
                                    overridden = J$.W(30004369, 'overridden', J$.M(30004365, J$.R(30004357, 'overridden', overridden, false), 'satisfy', false)(J$.R(30004361, 'mark', mark, false)), overridden);
                            } catch (J$e) {
                                J$.Ex(30007577, J$e);
                            } finally {
                                if (J$.Fr(30007581))
                                    continue jalangiLabel57;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30004593, J$.G(30004405, J$.R(30004401, 'Planner', Planner, false), 'prototype'), 'incrementalRemove', J$.T(30004589, function (c) {
                    jalangiLabel58:
                        while (true) {
                            try {
                                J$.Fe(30004557, arguments.callee, this);
                                arguments = J$.N(30004561, 'arguments', arguments, true);
                                c = J$.N(30004565, 'c', c, true);
                                J$.N(30004569, 'out', out, false);
                                J$.N(30004573, 'unsatisfied', unsatisfied, false);
                                J$.N(30004577, 'strength', strength, false);
                                J$.N(30004581, 'i', i, false);
                                J$.N(30004585, 'u', u, false);
                                var out = J$.W(30004417, 'out', J$.M(30004413, J$.R(30004409, 'c', c, false), 'output', false)(), out);
                                J$.M(30004425, J$.R(30004421, 'c', c, false), 'markUnsatisfied', false)();
                                J$.M(30004433, J$.R(30004429, 'c', c, false), 'removeFromGraph', false)();
                                var unsatisfied = J$.W(30004449, 'unsatisfied', J$.M(30004445, J$.R(30004437, 'this', this, false), 'removePropagateFrom', false)(J$.R(30004441, 'out', out, false)), unsatisfied);
                                var strength = J$.W(30004461, 'strength', J$.G(30004457, J$.R(30004453, 'Strength', Strength, false), 'REQUIRED'), strength);
                                do {
                                    for (var i = J$.W(30004469, 'i', J$.T(30004465, 0, 22), i); J$.C(188, J$.B(30000186, '<', J$.R(30004473, 'i', i, false), J$.M(30004481, J$.R(30004477, 'unsatisfied', unsatisfied, false), 'size', false)())); J$.B(30000198, '-', i = J$.W(30004489, 'i', J$.B(30000194, '+', J$.U(30000190, '+', J$.R(30004485, 'i', i, false)), 1), i), 1)) {
                                        var u = J$.W(30004505, 'u', J$.M(30004501, J$.R(30004493, 'unsatisfied', unsatisfied, false), 'at', false)(J$.R(30004497, 'i', i, false)), u);
                                        if (J$.C(184, J$.B(30000202, '==', J$.G(30004513, J$.R(30004509, 'u', u, false), 'strength'), J$.R(30004517, 'strength', strength, false))))
                                            J$.M(30004529, J$.R(30004521, 'this', this, false), 'incrementalAdd', false)(J$.R(30004525, 'u', u, false));
                                    }
                                    strength = J$.W(30004541, 'strength', J$.M(30004537, J$.R(30004533, 'strength', strength, false), 'nextWeaker', false)(), strength);
                                } while (J$.C(192, J$.B(30000206, '!=', J$.R(30004545, 'strength', strength, false), J$.G(30004553, J$.R(30004549, 'Strength', Strength, false), 'WEAKEST'))));
                            } catch (J$e) {
                                J$.Ex(30007585, J$e);
                            } finally {
                                if (J$.Fr(30007589))
                                    continue jalangiLabel58;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30004629, J$.G(30004601, J$.R(30004597, 'Planner', Planner, false), 'prototype'), 'newMark', J$.T(30004625, function () {
                    jalangiLabel59:
                        while (true) {
                            try {
                                J$.Fe(30004617, arguments.callee, this);
                                arguments = J$.N(30004621, 'arguments', arguments, true);
                                return J$.Rt(30004613, J$.A(30004609, J$.R(30004605, 'this', this, false), 'currentMark', '+')(1));
                            } catch (J$e) {
                                J$.Ex(30007593, J$e);
                            } finally {
                                if (J$.Fr(30007597))
                                    continue jalangiLabel59;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30004817, J$.G(30004637, J$.R(30004633, 'Planner', Planner, false), 'prototype'), 'makePlan', J$.T(30004813, function (sources) {
                    jalangiLabel60:
                        while (true) {
                            try {
                                J$.Fe(30004785, arguments.callee, this);
                                arguments = J$.N(30004789, 'arguments', arguments, true);
                                sources = J$.N(30004793, 'sources', sources, true);
                                J$.N(30004797, 'mark', mark, false);
                                J$.N(30004801, 'plan', plan, false);
                                J$.N(30004805, 'todo', todo, false);
                                J$.N(30004809, 'c', c, false);
                                var mark = J$.W(30004649, 'mark', J$.M(30004645, J$.R(30004641, 'this', this, false), 'newMark', false)(), mark);
                                var plan = J$.W(30004665, 'plan', J$.T(30004661, J$.F(30004657, J$.R(30004653, 'Plan', Plan, false), true)(), 11), plan);
                                var todo = J$.W(30004673, 'todo', J$.R(30004669, 'sources', sources, false), todo);
                                while (J$.C(204, J$.B(30000210, '>', J$.M(30004681, J$.R(30004677, 'todo', todo, false), 'size', false)(), J$.T(30004685, 0, 22)))) {
                                    var c = J$.W(30004697, 'c', J$.M(30004693, J$.R(30004689, 'todo', todo, false), 'removeFirst', false)(), c);
                                    if (J$.C(200, J$.C(196, J$.B(30000214, '!=', J$.G(30004709, J$.M(30004705, J$.R(30004701, 'c', c, false), 'output', false)(), 'mark'), J$.R(30004713, 'mark', mark, false))) ? J$.M(30004725, J$.R(30004717, 'c', c, false), 'inputsKnown', false)(J$.R(30004721, 'mark', mark, false)) : J$._())) {
                                        J$.M(30004737, J$.R(30004729, 'plan', plan, false), 'addConstraint', false)(J$.R(30004733, 'c', c, false));
                                        J$.P(30004753, J$.M(30004745, J$.R(30004741, 'c', c, false), 'output', false)(), 'mark', J$.R(30004749, 'mark', mark, false));
                                        J$.M(30004773, J$.R(30004757, 'this', this, false), 'addConstraintsConsumingTo', false)(J$.M(30004765, J$.R(30004761, 'c', c, false), 'output', false)(), J$.R(30004769, 'todo', todo, false));
                                    }
                                }
                                return J$.Rt(30004781, J$.R(30004777, 'plan', plan, false));
                            } catch (J$e) {
                                J$.Ex(30007601, J$e);
                            } finally {
                                if (J$.Fr(30007605))
                                    continue jalangiLabel60;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30004961, J$.G(30004825, J$.R(30004821, 'Planner', Planner, false), 'prototype'), 'extractPlanFromConstraints', J$.T(30004957, function (constraints) {
                    jalangiLabel61:
                        while (true) {
                            try {
                                J$.Fe(30004933, arguments.callee, this);
                                arguments = J$.N(30004937, 'arguments', arguments, true);
                                constraints = J$.N(30004941, 'constraints', constraints, true);
                                J$.N(30004945, 'sources', sources, false);
                                J$.N(30004949, 'i', i, false);
                                J$.N(30004953, 'c', c, false);
                                var sources = J$.W(30004841, 'sources', J$.T(30004837, J$.F(30004833, J$.R(30004829, 'OrderedCollection', OrderedCollection, false), true)(), 11), sources);
                                for (var i = J$.W(30004849, 'i', J$.T(30004845, 0, 22), i); J$.C(216, J$.B(30000218, '<', J$.R(30004853, 'i', i, false), J$.M(30004861, J$.R(30004857, 'constraints', constraints, false), 'size', false)())); J$.B(30000230, '-', i = J$.W(30004869, 'i', J$.B(30000226, '+', J$.U(30000222, '+', J$.R(30004865, 'i', i, false)), 1), i), 1)) {
                                    var c = J$.W(30004885, 'c', J$.M(30004881, J$.R(30004873, 'constraints', constraints, false), 'at', false)(J$.R(30004877, 'i', i, false)), c);
                                    if (J$.C(212, J$.C(208, J$.M(30004893, J$.R(30004889, 'c', c, false), 'isInput', false)()) ? J$.M(30004901, J$.R(30004897, 'c', c, false), 'isSatisfied', false)() : J$._()))
                                        J$.M(30004913, J$.R(30004905, 'sources', sources, false), 'add', false)(J$.R(30004909, 'c', c, false));
                                }
                                return J$.Rt(30004929, J$.M(30004925, J$.R(30004917, 'this', this, false), 'makePlan', false)(J$.R(30004921, 'sources', sources, false)));
                            } catch (J$e) {
                                J$.Ex(30007609, J$e);
                            } finally {
                                if (J$.Fr(30007613))
                                    continue jalangiLabel61;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30005125, J$.G(30004969, J$.R(30004965, 'Planner', Planner, false), 'prototype'), 'addPropagate', J$.T(30005121, function (c, mark) {
                    jalangiLabel62:
                        while (true) {
                            try {
                                J$.Fe(30005097, arguments.callee, this);
                                arguments = J$.N(30005101, 'arguments', arguments, true);
                                c = J$.N(30005105, 'c', c, true);
                                mark = J$.N(30005109, 'mark', mark, true);
                                J$.N(30005113, 'todo', todo, false);
                                J$.N(30005117, 'd', d, false);
                                var todo = J$.W(30004985, 'todo', J$.T(30004981, J$.F(30004977, J$.R(30004973, 'OrderedCollection', OrderedCollection, false), true)(), 11), todo);
                                J$.M(30004997, J$.R(30004989, 'todo', todo, false), 'add', false)(J$.R(30004993, 'c', c, false));
                                while (J$.C(224, J$.B(30000234, '>', J$.M(30005005, J$.R(30005001, 'todo', todo, false), 'size', false)(), J$.T(30005009, 0, 22)))) {
                                    var d = J$.W(30005021, 'd', J$.M(30005017, J$.R(30005013, 'todo', todo, false), 'removeFirst', false)(), d);
                                    if (J$.C(220, J$.B(30000238, '==', J$.G(30005033, J$.M(30005029, J$.R(30005025, 'd', d, false), 'output', false)(), 'mark'), J$.R(30005037, 'mark', mark, false)))) {
                                        J$.M(30005049, J$.R(30005041, 'this', this, false), 'incrementalRemove', false)(J$.R(30005045, 'c', c, false));
                                        return J$.Rt(30005057, J$.T(30005053, false, 23));
                                    }
                                    J$.M(30005065, J$.R(30005061, 'd', d, false), 'recalculate', false)();
                                    J$.M(30005085, J$.R(30005069, 'this', this, false), 'addConstraintsConsumingTo', false)(J$.M(30005077, J$.R(30005073, 'd', d, false), 'output', false)(), J$.R(30005081, 'todo', todo, false));
                                }
                                return J$.Rt(30005093, J$.T(30005089, true, 23));
                            } catch (J$e) {
                                J$.Ex(30007617, J$e);
                            } finally {
                                if (J$.Fr(30007621))
                                    continue jalangiLabel62;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30005473, J$.G(30005133, J$.R(30005129, 'Planner', Planner, false), 'prototype'), 'removePropagateFrom', J$.T(30005469, function (out) {
                    jalangiLabel63:
                        while (true) {
                            try {
                                J$.Fe(30005429, arguments.callee, this);
                                arguments = J$.N(30005433, 'arguments', arguments, true);
                                out = J$.N(30005437, 'out', out, true);
                                J$.N(30005441, 'unsatisfied', unsatisfied, false);
                                J$.N(30005445, 'todo', todo, false);
                                J$.N(30005449, 'v', v, false);
                                J$.N(30005453, 'i', i, false);
                                J$.N(30005457, 'c', c, false);
                                J$.N(30005461, 'determining', determining, false);
                                J$.N(30005465, 'next', next, false);
                                J$.P(30005145, J$.R(30005137, 'out', out, false), 'determinedBy', J$.T(30005141, null, 25));
                                J$.P(30005161, J$.R(30005149, 'out', out, false), 'walkStrength', J$.G(30005157, J$.R(30005153, 'Strength', Strength, false), 'WEAKEST'));
                                J$.P(30005173, J$.R(30005165, 'out', out, false), 'stay', J$.T(30005169, true, 23));
                                var unsatisfied = J$.W(30005189, 'unsatisfied', J$.T(30005185, J$.F(30005181, J$.R(30005177, 'OrderedCollection', OrderedCollection, false), true)(), 11), unsatisfied);
                                var todo = J$.W(30005205, 'todo', J$.T(30005201, J$.F(30005197, J$.R(30005193, 'OrderedCollection', OrderedCollection, false), true)(), 11), todo);
                                J$.M(30005217, J$.R(30005209, 'todo', todo, false), 'add', false)(J$.R(30005213, 'out', out, false));
                                while (J$.C(248, J$.B(30000242, '>', J$.M(30005225, J$.R(30005221, 'todo', todo, false), 'size', false)(), J$.T(30005229, 0, 22)))) {
                                    var v = J$.W(30005241, 'v', J$.M(30005237, J$.R(30005233, 'todo', todo, false), 'removeFirst', false)(), v);
                                    for (var i = J$.W(30005249, 'i', J$.T(30005245, 0, 22), i); J$.C(232, J$.B(30000246, '<', J$.R(30005253, 'i', i, false), J$.M(30005265, J$.G(30005261, J$.R(30005257, 'v', v, false), 'constraints'), 'size', false)())); J$.B(30000258, '-', i = J$.W(30005273, 'i', J$.B(30000254, '+', J$.U(30000250, '+', J$.R(30005269, 'i', i, false)), 1), i), 1)) {
                                        var c = J$.W(30005293, 'c', J$.M(30005289, J$.G(30005281, J$.R(30005277, 'v', v, false), 'constraints'), 'at', false)(J$.R(30005285, 'i', i, false)), c);
                                        if (J$.C(228, J$.U(30000262, '!', J$.M(30005301, J$.R(30005297, 'c', c, false), 'isSatisfied', false)())))
                                            J$.M(30005313, J$.R(30005305, 'unsatisfied', unsatisfied, false), 'add', false)(J$.R(30005309, 'c', c, false));
                                    }
                                    var determining = J$.W(30005325, 'determining', J$.G(30005321, J$.R(30005317, 'v', v, false), 'determinedBy'), determining);
                                    for (var i = J$.W(30005333, 'i', J$.T(30005329, 0, 22), i); J$.C(244, J$.B(30000266, '<', J$.R(30005337, 'i', i, false), J$.M(30005349, J$.G(30005345, J$.R(30005341, 'v', v, false), 'constraints'), 'size', false)())); J$.B(30000278, '-', i = J$.W(30005357, 'i', J$.B(30000274, '+', J$.U(30000270, '+', J$.R(30005353, 'i', i, false)), 1), i), 1)) {
                                        var next = J$.W(30005377, 'next', J$.M(30005373, J$.G(30005365, J$.R(30005361, 'v', v, false), 'constraints'), 'at', false)(J$.R(30005369, 'i', i, false)), next);
                                        if (J$.C(240, J$.C(236, J$.B(30000282, '!=', J$.R(30005381, 'next', next, false), J$.R(30005385, 'determining', determining, false))) ? J$.M(30005393, J$.R(30005389, 'next', next, false), 'isSatisfied', false)() : J$._())) {
                                            J$.M(30005401, J$.R(30005397, 'next', next, false), 'recalculate', false)();
                                            J$.M(30005417, J$.R(30005405, 'todo', todo, false), 'add', false)(J$.M(30005413, J$.R(30005409, 'next', next, false), 'output', false)());
                                        }
                                    }
                                }
                                return J$.Rt(30005425, J$.R(30005421, 'unsatisfied', unsatisfied, false));
                            } catch (J$e) {
                                J$.Ex(30007625, J$e);
                            } finally {
                                if (J$.Fr(30007629))
                                    continue jalangiLabel63;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30005617, J$.G(30005481, J$.R(30005477, 'Planner', Planner, false), 'prototype'), 'addConstraintsConsumingTo', J$.T(30005613, function (v, coll) {
                    jalangiLabel64:
                        while (true) {
                            try {
                                J$.Fe(30005581, arguments.callee, this);
                                arguments = J$.N(30005585, 'arguments', arguments, true);
                                v = J$.N(30005589, 'v', v, true);
                                coll = J$.N(30005593, 'coll', coll, true);
                                J$.N(30005597, 'determining', determining, false);
                                J$.N(30005601, 'cc', cc, false);
                                J$.N(30005605, 'i', i, false);
                                J$.N(30005609, 'c', c, false);
                                var determining = J$.W(30005493, 'determining', J$.G(30005489, J$.R(30005485, 'v', v, false), 'determinedBy'), determining);
                                var cc = J$.W(30005505, 'cc', J$.G(30005501, J$.R(30005497, 'v', v, false), 'constraints'), cc);
                                for (var i = J$.W(30005513, 'i', J$.T(30005509, 0, 22), i); J$.C(260, J$.B(30000286, '<', J$.R(30005517, 'i', i, false), J$.M(30005525, J$.R(30005521, 'cc', cc, false), 'size', false)())); J$.B(30000298, '-', i = J$.W(30005533, 'i', J$.B(30000294, '+', J$.U(30000290, '+', J$.R(30005529, 'i', i, false)), 1), i), 1)) {
                                    var c = J$.W(30005549, 'c', J$.M(30005545, J$.R(30005537, 'cc', cc, false), 'at', false)(J$.R(30005541, 'i', i, false)), c);
                                    if (J$.C(256, J$.C(252, J$.B(30000302, '!=', J$.R(30005553, 'c', c, false), J$.R(30005557, 'determining', determining, false))) ? J$.M(30005565, J$.R(30005561, 'c', c, false), 'isSatisfied', false)() : J$._()))
                                        J$.M(30005577, J$.R(30005569, 'coll', coll, false), 'add', false)(J$.R(30005573, 'c', c, false));
                                }
                            } catch (J$e) {
                                J$.Ex(30007633, J$e);
                            } finally {
                                if (J$.Fr(30007637))
                                    continue jalangiLabel64;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30005689, J$.G(30005653, J$.R(30005649, 'Plan', Plan, false), 'prototype'), 'addConstraint', J$.T(30005685, function (c) {
                    jalangiLabel66:
                        while (true) {
                            try {
                                J$.Fe(30005673, arguments.callee, this);
                                arguments = J$.N(30005677, 'arguments', arguments, true);
                                c = J$.N(30005681, 'c', c, true);
                                J$.M(30005669, J$.G(30005661, J$.R(30005657, 'this', this, false), 'v'), 'add', false)(J$.R(30005665, 'c', c, false));
                            } catch (J$e) {
                                J$.Ex(30007649, J$e);
                            } finally {
                                if (J$.Fr(30007653))
                                    continue jalangiLabel66;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30005729, J$.G(30005697, J$.R(30005693, 'Plan', Plan, false), 'prototype'), 'size', J$.T(30005725, function () {
                    jalangiLabel67:
                        while (true) {
                            try {
                                J$.Fe(30005717, arguments.callee, this);
                                arguments = J$.N(30005721, 'arguments', arguments, true);
                                return J$.Rt(30005713, J$.M(30005709, J$.G(30005705, J$.R(30005701, 'this', this, false), 'v'), 'size', false)());
                            } catch (J$e) {
                                J$.Ex(30007657, J$e);
                            } finally {
                                if (J$.Fr(30007661))
                                    continue jalangiLabel67;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30005777, J$.G(30005737, J$.R(30005733, 'Plan', Plan, false), 'prototype'), 'constraintAt', J$.T(30005773, function (index) {
                    jalangiLabel68:
                        while (true) {
                            try {
                                J$.Fe(30005761, arguments.callee, this);
                                arguments = J$.N(30005765, 'arguments', arguments, true);
                                index = J$.N(30005769, 'index', index, true);
                                return J$.Rt(30005757, J$.M(30005753, J$.G(30005745, J$.R(30005741, 'this', this, false), 'v'), 'at', false)(J$.R(30005749, 'index', index, false)));
                            } catch (J$e) {
                                J$.Ex(30007665, J$e);
                            } finally {
                                if (J$.Fr(30007669))
                                    continue jalangiLabel68;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                J$.P(30005861, J$.G(30005785, J$.R(30005781, 'Plan', Plan, false), 'prototype'), 'execute', J$.T(30005857, function () {
                    jalangiLabel69:
                        while (true) {
                            try {
                                J$.Fe(30005841, arguments.callee, this);
                                arguments = J$.N(30005845, 'arguments', arguments, true);
                                J$.N(30005849, 'i', i, false);
                                J$.N(30005853, 'c', c, false);
                                for (var i = J$.W(30005793, 'i', J$.T(30005789, 0, 22), i); J$.C(264, J$.B(30000306, '<', J$.R(30005797, 'i', i, false), J$.M(30005805, J$.R(30005801, 'this', this, false), 'size', false)())); J$.B(30000318, '-', i = J$.W(30005813, 'i', J$.B(30000314, '+', J$.U(30000310, '+', J$.R(30005809, 'i', i, false)), 1), i), 1)) {
                                    var c = J$.W(30005829, 'c', J$.M(30005825, J$.R(30005817, 'this', this, false), 'constraintAt', false)(J$.R(30005821, 'i', i, false)), c);
                                    J$.M(30005837, J$.R(30005833, 'c', c, false), 'execute', false)();
                                }
                            } catch (J$e) {
                                J$.Ex(30007673, J$e);
                            } finally {
                                if (J$.Fr(30007677))
                                    continue jalangiLabel69;
                                else
                                    return J$.Ra();
                            }
                        }
                }, 12));
                var planner = J$.W(30006941, 'planner', J$.T(30006937, null, 25), planner);
            } catch (J$e) {
                J$.Ex(30007713, J$e);
            } finally {
                if (J$.Sr(30007717))
                    continue jalangiLabel74;
                else
                    break jalangiLabel74;
            }
        }
}