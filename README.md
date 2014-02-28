Jalangi
=======
### Introduction

Jalangi Firefox Extension is a framework for writing light-weight dynamic analyses for Front-end JavaScript. It allow you to do interesting dynamic analysis for any live webpage in your Firefox webbrowser.

Jalangi Firefox extension intercepts and transforms every piece of JavaScript code in the webpage and external files. The code transformation adds hooks that allows you to monitor almost every operation (e.g., variable read/write, unary/binary operation, function/method call, etc.) performed by the execution. Simply overriding the API exposed allows you to perform your own dynamic analysis. Your dynamic analysis code will be executed side-by-side with the target program's execution.

JavaScript is a loosely typed language which is often error-prune. Based on this framework, you can quickly build a analysis module to check different kinds of correctness bugs and performance bugs, doing various program analysis (e.g., debugging, Performance analysis, Monitoring dynamic behaviours, Record and replay, runtime call graph etc.)

Please check out our project website at http://www.eecs.berkeley.edu/~gongliang13/jalangi_ff/ for more information. 

### Jalangi in a Nutshell

Jalangi Firefox extension intercepts and transforms every piece of JavaScript loaded by the browser to expose hooks to facilitate program analysis.

The figure on the right-hand side shows the original code snippet and transformed code snippet. Function J$.W and J$.R are callback functions (i.e., hooks) for notifying the read and write operation of variables, the parameters of the callback function include the variable name and value. Similarly callback function. Those callback functions invoke specially designed dummy functions which will be exposed as API to facilitate user-defined dynamic analysis. Overriding those API functions will allow analysis code to be executed along the original execution. 

### Configure Development Environment

On Windows you need the following extra dependencies:

  * Install Microsoft Visual Studio 2010 (Free express version is fine).
  * If on 64bit also install Windows 7 64-bit SDK.

If you have a fresh installation of Ubuntu, you can install all the requirements by invoking the following commands from a terminal.

    sudo apt-get update
    sudo apt-get install python-software-properties python g++ make
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs
    sudo apt-get install git
    sudo apt-get install firefox

If you just want to install the packaged Firefox extension, go to our project website (http://www.eecs.berkeley.edu/~gongliang13/jalangi_ff/), click "Download" and drag and drop the XPI package into your Firefox web browser and have fun!! :)

### Configurating Development Environment:
Install the Firefox add-on sdk, for more information check out:
https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation

after installing the Firefox addon sdk, first activate the sdk:

On Mac OS X/ Linux:

    source bin/activate

On Windows:

    bash bin/activate

Then go to the Jalangi_FF directory and type the following command to start running the extension:

    cfx run

For more information related to this extension, please contact:

Liang Gong (gongliang13 (at) eecs.berkeley.edu)
Koushik Sen (ksen (at) cs.berkeley.edu)