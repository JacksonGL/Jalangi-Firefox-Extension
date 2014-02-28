// this file is not very useful
document.defaultView.addEventListener('message', function(event) {
  console.log('[[[[[[[[[[[[[[[[' + event.data);
  console.log('[[[[[[[[[[[[[[[[' + event.origin);
}, false);