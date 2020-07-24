"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writePsdBuffer = exports.writePsdUint8Array = exports.writePsd = exports.readPsd = exports.byteArrayToBase64 = void 0;
var psdWriter_1 = require("./psdWriter");
var psdReader_1 = require("./psdReader");
var helpers_1 = require("./helpers");
Object.defineProperty(exports, "Compression", { enumerable: true, get: function () { return helpers_1.Compression; } });
Object.defineProperty(exports, "initializeCanvas", { enumerable: true, get: function () { return helpers_1.initializeCanvas; } });
__exportStar(require("./psd"), exports);
var base64_js_1 = require("base64-js");
exports.byteArrayToBase64 = base64_js_1.fromByteArray;
function readPsd(buffer, options) {
    var reader = 'buffer' in buffer ?
        psdReader_1.createReader(buffer.buffer, buffer.byteOffset, buffer.byteLength) :
        psdReader_1.createReader(buffer);
    return psdReader_1.readPsd(reader, options);
}
exports.readPsd = readPsd;
function writePsd(psd, options) {
    var writer = psdWriter_1.createWriter();
    psdWriter_1.writePsd(writer, psd, options);
    return psdWriter_1.getWriterBuffer(writer);
}
exports.writePsd = writePsd;
function writePsdUint8Array(psd, options) {
    var writer = psdWriter_1.createWriter();
    psdWriter_1.writePsd(writer, psd, options);
    return psdWriter_1.getWriterBufferNoCopy(writer);
}
exports.writePsdUint8Array = writePsdUint8Array;
function writePsdBuffer(psd, options) {
    if (typeof Buffer === 'undefined') {
        throw new Error('Buffer not supported on this platform');
    }
    return Buffer.from(writePsdUint8Array(psd, options));
}
exports.writePsdBuffer = writePsdBuffer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFDQSx5Q0FBNEg7QUFDNUgseUNBQWtGO0FBQ2xGLHFDQUEwRDtBQUFqRCxzR0FBQSxXQUFXLE9BQUE7QUFBRSwyR0FBQSxnQkFBZ0IsT0FBQTtBQUN0Qyx3Q0FBc0I7QUFDdEIsdUNBQTBDO0FBUzdCLFFBQUEsaUJBQWlCLEdBQUcseUJBQWEsQ0FBQztBQUUvQyxTQUFnQixPQUFPLENBQUMsTUFBZ0MsRUFBRSxPQUFxQjtJQUM5RSxJQUFNLE1BQU0sR0FBRyxRQUFRLElBQUksTUFBTSxDQUFDLENBQUM7UUFDbEMsd0JBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbkUsd0JBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QixPQUFPLG1CQUFlLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFMRCwwQkFLQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxHQUFRLEVBQUUsT0FBc0I7SUFDeEQsSUFBTSxNQUFNLEdBQUcsd0JBQVksRUFBRSxDQUFDO0lBQzlCLG9CQUFnQixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkMsT0FBTywyQkFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFKRCw0QkFJQztBQUVELFNBQWdCLGtCQUFrQixDQUFDLEdBQVEsRUFBRSxPQUFzQjtJQUNsRSxJQUFNLE1BQU0sR0FBRyx3QkFBWSxFQUFFLENBQUM7SUFDOUIsb0JBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2QyxPQUFPLGlDQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFKRCxnREFJQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxHQUFRLEVBQUUsT0FBc0I7SUFDOUQsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7UUFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0tBQ3pEO0lBRUQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3RELENBQUM7QUFORCx3Q0FNQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBzZCwgUmVhZE9wdGlvbnMsIFdyaXRlT3B0aW9ucyB9IGZyb20gJy4vcHNkJztcbmltcG9ydCB7IFBzZFdyaXRlciwgd3JpdGVQc2QgYXMgd3JpdGVQc2RJbnRlcm5hbCwgZ2V0V3JpdGVyQnVmZmVyLCBjcmVhdGVXcml0ZXIsIGdldFdyaXRlckJ1ZmZlck5vQ29weSB9IGZyb20gJy4vcHNkV3JpdGVyJztcbmltcG9ydCB7IFBzZFJlYWRlciwgcmVhZFBzZCBhcyByZWFkUHNkSW50ZXJuYWwsIGNyZWF0ZVJlYWRlciB9IGZyb20gJy4vcHNkUmVhZGVyJztcbmV4cG9ydCB7IENvbXByZXNzaW9uLCBpbml0aWFsaXplQ2FudmFzIH0gZnJvbSAnLi9oZWxwZXJzJztcbmV4cG9ydCAqIGZyb20gJy4vcHNkJztcbmltcG9ydCB7IGZyb21CeXRlQXJyYXkgfSBmcm9tICdiYXNlNjQtanMnO1xuZXhwb3J0IHsgUHNkUmVhZGVyLCBQc2RXcml0ZXIgfTtcblxuaW50ZXJmYWNlIEJ1ZmZlckxpa2Uge1xuXHRidWZmZXI6IEFycmF5QnVmZmVyO1xuXHRieXRlT2Zmc2V0OiBudW1iZXI7XG5cdGJ5dGVMZW5ndGg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGJ5dGVBcnJheVRvQmFzZTY0ID0gZnJvbUJ5dGVBcnJheTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRQc2QoYnVmZmVyOiBBcnJheUJ1ZmZlciB8IEJ1ZmZlckxpa2UsIG9wdGlvbnM/OiBSZWFkT3B0aW9ucyk6IFBzZCB7XG5cdGNvbnN0IHJlYWRlciA9ICdidWZmZXInIGluIGJ1ZmZlciA/XG5cdFx0Y3JlYXRlUmVhZGVyKGJ1ZmZlci5idWZmZXIsIGJ1ZmZlci5ieXRlT2Zmc2V0LCBidWZmZXIuYnl0ZUxlbmd0aCkgOlxuXHRcdGNyZWF0ZVJlYWRlcihidWZmZXIpO1xuXHRyZXR1cm4gcmVhZFBzZEludGVybmFsKHJlYWRlciwgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZVBzZChwc2Q6IFBzZCwgb3B0aW9ucz86IFdyaXRlT3B0aW9ucyk6IEFycmF5QnVmZmVyIHtcblx0Y29uc3Qgd3JpdGVyID0gY3JlYXRlV3JpdGVyKCk7XG5cdHdyaXRlUHNkSW50ZXJuYWwod3JpdGVyLCBwc2QsIG9wdGlvbnMpO1xuXHRyZXR1cm4gZ2V0V3JpdGVyQnVmZmVyKHdyaXRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZVBzZFVpbnQ4QXJyYXkocHNkOiBQc2QsIG9wdGlvbnM/OiBXcml0ZU9wdGlvbnMpOiBVaW50OEFycmF5IHtcblx0Y29uc3Qgd3JpdGVyID0gY3JlYXRlV3JpdGVyKCk7XG5cdHdyaXRlUHNkSW50ZXJuYWwod3JpdGVyLCBwc2QsIG9wdGlvbnMpO1xuXHRyZXR1cm4gZ2V0V3JpdGVyQnVmZmVyTm9Db3B5KHdyaXRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZVBzZEJ1ZmZlcihwc2Q6IFBzZCwgb3B0aW9ucz86IFdyaXRlT3B0aW9ucyk6IEJ1ZmZlciB7XG5cdGlmICh0eXBlb2YgQnVmZmVyID09PSAndW5kZWZpbmVkJykge1xuXHRcdHRocm93IG5ldyBFcnJvcignQnVmZmVyIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBwbGF0Zm9ybScpO1xuXHR9XG5cblx0cmV0dXJuIEJ1ZmZlci5mcm9tKHdyaXRlUHNkVWludDhBcnJheShwc2QsIG9wdGlvbnMpKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiL1VzZXJzL2pvZXJhaWkvZGV2L2FnLXBzZC9zcmMifQ==
