function z(a,c,b){return(a=a.match(c))&&a[b]?a[b]:""}
f=parseInt(z(b,/\d+\.\d+\.(\d+)/,1),10);


z is a function returns the day of a date in format d+.d+.d+
for example z('2009.7.15',/\d+\.\d+\.(\d+)/,1), it z will return '15'

if the string does not have a matched string, or the matched string can not be parsed into a date,
the parseInt will return NaN

Also there is a bunch of strange binary operation in the jquery code (even in jquery home page (usnig jquery.1.9.1)):

[21:26:50.934] Unknown property 'box-sizing'.  Declaration dropped. @ http://jquery.com/
[21:26:51.205] "[strange binary operation: | iid: 254]:undefined"
[21:26:51.205]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2142
[21:26:51.205] "left: undefined[undefined]  op:+  right: [string]"
[21:26:51.206]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2167
[21:26:51.206] https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.info :: 2168
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.post_B :: 2144
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: B :: 837
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .type< :: 2449
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .isFunction< :: 2369
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: null :: 12528
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .getScript< :: 12912
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 98
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 110
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: c< :: 3173
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: p<.fireWith< :: 3423
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ready< :: 2348
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: H< :: 1916
[21:26:51.206] undefined
[21:26:51.225] "[strange binary operation: | iid: 254]:undefined"
[21:26:51.225]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2142
[21:26:51.225] "left: undefined[undefined]  op:+  right: [string]"
[21:26:51.226]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2167
[21:26:51.226] https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.info :: 2168
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.post_B :: 2144
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: B :: 837
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .type< :: 2449
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i/< :: 3215
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .each< :: 2738
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i :: 3228
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: p<.add< :: 3240
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ajax< :: 12858
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: null :: 12534
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .getScript< :: 12912
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 98
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 110
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: c< :: 3173
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: p<.fireWith< :: 3423
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ready< :: 2348
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: H< :: 1916
[21:26:51.227] undefined
[21:26:51.227] "[strange binary operation: | iid: 254]:undefined"
[21:26:51.228]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2142
[21:26:51.228] "left: undefined[undefined]  op:+  right: [string]"
[21:26:51.228]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2167
[21:26:51.228] https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.info :: 2168
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.post_B :: 2144
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: B :: 837
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .type< :: 2449
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i/< :: 3215
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .each< :: 2738
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i :: 3228
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: p<.add< :: 3240
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ajax< :: 12858
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: null :: 12534
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .getScript< :: 12912
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 98
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 110
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: c< :: 3173
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: p<.fireWith< :: 3423
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ready< :: 2348
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: H< :: 1916
[21:26:51.229] undefined
[21:26:51.230] "[strange binary operation: | iid: 254]:undefined"
[21:26:51.230]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2142
[21:26:51.230] "left: undefined[undefined]  op:+  right: [string]"
[21:26:51.231]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2167
[21:26:51.231] https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.info :: 2168
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.post_B :: 2144
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: B :: 837
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .type< :: 2449
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i/< :: 3215
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .each< :: 2738
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i :: 3228
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: p<.add< :: 3240
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ajax< :: 12858
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: null :: 12534
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .getScript< :: 12912
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 98
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 110
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: c< :: 3173
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: p<.fireWith< :: 3423
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ready< :: 2348
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: H< :: 1916
[21:26:51.232] undefined
[21:26:51.233] "[strange binary operation: | iid: 6778]:false"
[21:26:51.233]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2142
[21:26:51.233] "left: undefined[undefined]  op:>  right: 0[number]"
[21:26:51.233]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2167
[21:26:51.233] https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.info :: 2168
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.post_B :: 2144
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: B :: 837
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ajax< :: 12863
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: null :: 12534
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .getScript< :: 12912
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 98
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://jquery.com/jquery-wp-content/themes/jquery/js/main.js :: null :: 110
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: c< :: 3173
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: p<.fireWith< :: 3423
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ready< :: 2348
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: H< :: 1916
[21:26:51.234] undefined
[21:26:51.431] GET http://engine.adzerk.net/ados.js?_=1383888410119 [HTTP/1.1 200 OK 170ms]
[21:26:51.432] GET https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js [HTTP/1.1 200 OK 78ms]
[21:26:51.433] GET https://raw.github.com/JacksonGL/Jalangi_ref/master/InputManager.js [HTTP/1.1 200 OK 156ms]
[21:26:53.132] GET http://engine.adzerk.net/ados?t=1383888413040&request={%22Placements%22:[{%22A%22:5449,%22S%22:32018,%22D%22:%22broadcast%22,%22AT%22:1314}],%22Keywords%22:%22undefined%22,%22Referrer%22:%22%22,%22IsAsync%22:true} [HTTP/1.1 200 OK 84ms]
[21:26:53.135] GET https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js [HTTP/1.1 200 OK 11ms]
[21:26:53.137] GET https://raw.github.com/JacksonGL/Jalangi_ref/master/InputManager.js [HTTP/1.1 200 OK 6ms]
[21:26:53.063] "[strange binary operation: | iid: 254]:undefined"
[21:26:53.063]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2142
[21:26:53.064] "left: undefined[undefined]  op:+  right: [string]"
[21:26:53.064]  @ https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js:2167
[21:26:53.064] https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.info :: 2168
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: J$.analyzer.post_B :: 2144
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: B :: 837
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .type< :: 2449
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i/< :: 3215
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .each< :: 2738
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i :: 3228
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i/< :: 3216
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .each< :: 2738
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: i :: 3228
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: p<.add< :: 3240
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .Deferred</r<.always< :: 3543
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .ajax</N<.statusCode< :: 12808
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: M/ret :: 458
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: k :: 12650
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: invokeFun :: 400
https://raw.github.com/JacksonGL/Jalangi_ref/master/analysis.js :: F/ret :: 441
http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js :: .send</< :: 13020
[21:26:53.065] undefined




there are also lots of strange operations on youtube.com

also another intersting website:
http://www.jslint.com/

jslint checking our code, and our code is dynamically checking jslint code


https://twitter.com/
much better, only 1 strange operation