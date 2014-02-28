TracingListener.prototype =
{
	//Your implementation of this method must read exactly aCount bytes of data before returning.
	//    https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIStreamListener
    onDataAvailable: function(request, context, inputStream, offset, count) { 
    	console.log('data available');
    	//stores the data here
        //this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
        if(context.bufferData == null || context.bufferData == undefined){
        	context.bufferData = "";
        }
        context.bufferData += fileUtil.readInputStream(inputStream);
        console.log(context.bufferData);
    },
    onStartRequest: function(request, context) {
        this.originalListener.onStartRequest(request, context);
    },
    onStopRequest: function(request, context, statusCode) {
    	//when request is done, we instrument the code and return the inst code to the original listeners
    	//this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
    	//console.log('stop request');
    	var inst_code;
    	console.log(context.bufferData);
    	//var inputStream = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(Components.interfaces.nsIStringInputStream);
		//inputStream.setData(postData, postData.length);
		//this.originalListener.onDataAvailable(request, context, inputStream, 0, inst_code.length);

        this.originalListener.onStopRequest(request, context, statusCode);
    },
    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Cr.NS_NOINTERFACE;
    }
}



function TracingListener() {
    //this.receivedData = [];
}

TracingListener.prototype =
{
    originalListener: null,
    receivedData: null,   // array for incoming data.

    onDataAvailable: function(request, context, inputStream, offset, count)
    {
        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
        var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);

        var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1",
                "nsIBinaryOutputStream");

        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

        // Copy received data as they come.
        var data = binaryInputStream.readBytes(count);
        //var data = inputStream.readBytes(count);
        this.receivedData.push(data);

        binaryOutputStream.writeBytes(data, count);
        this.originalListener.onDataAvailable(request, context,storageStream.newInputStream(0), offset, count);
    },

    onStartRequest: function(request, context) {
        this.receivedData = [];
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode)
    {
        try 
        {
            request.QueryInterface(Ci.nsIHttpChannel);

            if (request.originalURI && piratequesting.baseURL == request.originalURI.prePath && request.originalURI.path.indexOf("/index.php?ajax=") == 0) 
            {

                var data = null;
                if (request.requestMethod.toLowerCase() == "post") 
                {
                    var postText = this.readPostTextFromRequest(request, context);
                    if (postText) 
                        data = ((String)(postText)).parseQuery();

                }
                var date = Date.parse(request.getResponseHeader("Date"));
                var responseSource = this.receivedData.join('');

                //fix leading spaces bug
                responseSource = responseSource.replace(/^\s+(\S[\s\S]+)/, "$1");

                piratequesting.ProcessRawResponse(request.originalURI.spec, responseSource, date, data);
            }
        } 
        catch (e) 
        {
            dumpError(e);
        }
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    },
    readPostTextFromRequest : function(request, context) {
        try
        {
            var is = request.QueryInterface(Ci.nsIUploadChannel).uploadStream;
            if (is)
            {
                var ss = is.QueryInterface(Ci.nsISeekableStream);
                var prevOffset;
                if (ss)
                {
                    prevOffset = ss.tell();
                    ss.seek(Ci.nsISeekableStream.NS_SEEK_SET, 0);
                }

                // Read data from the stream..
                var charset = "UTF-8";
                var text = this.readFromStream(is, charset, true);

                // Seek locks the file so, seek to the beginning only if necko hasn't read it yet,
                // since necko doesn't seek to 0 before reading (at lest not till 459384 is fixed).
                if (ss && prevOffset == 0) 
                    ss.seek(Ci.nsISeekableStream.NS_SEEK_SET, 0);

                return text;
            }
            else {
                dump("Failed to Query Interface for upload stream.\n");
            }
        }
        catch(exc)
        {
            dumpError(exc);
        }

        return null;
    },
    readFromStream : function(stream, charset, noClose) {

        var sis = CCSV("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
        sis.setInputStream(stream);

        var segments = [];
        for (var count = stream.available(); count; count = stream.available())
            segments.push(sis.readBytes(count));

        if (!noClose)
            sis.close();

        var text = segments.join("");
        return text;
    }

}


hRO = {

    observe: function(request, aTopic, aData){
        try {
            if (typeof Cc == "undefined") {
                var Cc = Components.classes;
            }
            if (typeof Ci == "undefined") {
                var Ci = Components.interfaces;
            }
            if (aTopic == "http-on-examine-response") {
                request.QueryInterface(Ci.nsIHttpChannel);

                //if (request.originalURI && piratequesting.baseURL == request.originalURI.prePath) {
                   // var newListener = new TracingListener();
                    //request.QueryInterface(Ci.nsITraceableChannel);
                    //newListener.originalListener = request.setNewListener(newListener);
                //} GOOGLE FAILS TO LOAD IF I UNCOMMENT THIS
            } 
        } catch (e) {
            dump("\nhRO error: \n\tMessage: " + e.message + "\n\tFile: " + e.fileName + "  line: " + e.lineNumber + "\n");
        }
    },

    QueryInterface: function(aIID){
        if (typeof Cc == "undefined") {
            var Cc = Components.classes;
        }
        if (typeof Ci == "undefined") {
            var Ci = Components.interfaces;
        }
        if (aIID.equals(Ci.nsIObserver) ||
        aIID.equals(Ci.nsISupports)) {
            return this;
        }

        throw Components.results.NS_NOINTERFACE;

    },
};


var observerService = Cc["@mozilla.org/observer-service;1"]
    .getService(Ci.nsIObserverService);

observerService.addObserver(hRO,
    "http-on-examine-response", false);






console.log('offset: ' + offset);
        //buffer the content
            var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1",
                "nsIBinaryInputStream");
            //var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
            //var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1",
            //        "nsIBinaryOutputStream");

            binaryInputStream.setInputStream(inputStream);
            //storageStream.init(128*128*2, count, null);
            //binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

            // Copy received data as they come.
            if(offset>0){
                binaryInputStream.readBytes(offset);
            }
            var data = binaryInputStream.readBytes(count);
            this.receivedData.push(data);
            //binaryOutputStream.writeBytes(data, count);



            onStopRequest: function(request, context, statusCode)
    {
        // Get entire response
        var data = this.receivedData.join();
        //console.log(data);
        //Jalangi_FF.sync_writing_file(tmp_js_code_dir + "intercept_" + (tmp++) + ".txt", data);

        try{
            data = intercepter.transformScript(data, request.name);
            data = "//Jalangi transformed \r\n" + data;
        }catch(e){
            console.log('!!!!!!!!!!' + e);
        }
        //dispatch the transformed content into the next chain element
        var inputStream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
        inputStream.setData(data, data.length);
        this.originalListener.onDataAvailable(request, context, inputStream, 0, data.length);

        this.originalListener.onStopRequest(request, context, statusCode);
    },







    observer.add( 'document-element-inserted', function( document ) {
  var window = document.defaultView;
  var mainWindow = window.QueryInterface( Ci.nsIInterfaceRequestor )
                     .getInterface( Ci.nsIWebNavigation )
                     .QueryInterface( Ci.nsIDocShellTreeItem )
                     .rootTreeItem
                     .QueryInterface( Ci.nsIInterfaceRequestor )
                     .getInterface( Ci.nsIDOMWindow );

  var notificationBox = mainWindow.gBrowser.getNotificationBox();

  notificationBox.appendNotification(
    'This is my message', 
    'myNotifyId', 
    'chrome://global/skin/icons/information-16.png', 
    notificationBox.PRIORITY_INFO_LOW
  );
});



    var window = aSubject.defaultView;
                var mainWindow = window.QueryInterface( Ci.nsIInterfaceRequestor )
                     .getInterface( Ci.nsIWebNavigation )
                     .QueryInterface( Ci.nsIDocShellTreeItem )
                     .rootTreeItem
                     .QueryInterface( Ci.nsIInterfaceRequestor )
                     .getInterface( Ci.nsIDOMWindow );