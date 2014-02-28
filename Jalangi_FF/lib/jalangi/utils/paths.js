exports.sanitizePath = function(path) {
    if ((typeof process != 'undefined') && process.platform == "win32") {
		return path.split("\\").join("\\\\");
    }
    return path;
}
