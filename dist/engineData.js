"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeEngineData = exports.parseEngineData = void 0;
function isWhitespace(char) {
    // ' ', '\n', '\r', '\t'
    return char === 32 || char === 10 || char === 13 || char === 9;
}
function isNumber(char) {
    // 0123456789.-
    return (char >= 48 && char <= 57) || char === 46 || char === 45;
}
function parseEngineData(data) {
    var index = 0;
    function skipWhitespace() {
        while (index < data.length && isWhitespace(data[index])) {
            index++;
        }
    }
    function getTextByte() {
        var byte = data[index];
        index++;
        if (byte === 92) { // \
            byte = data[index];
            index++;
        }
        return byte;
    }
    function getText() {
        var result = '';
        if (data[index] === 41) { // )
            index++;
            return result;
        }
        // Strings start with utf-16 BOM
        if (data[index] !== 0xFE || data[index + 1] !== 0xFF) {
            throw new Error('Invalid utf-16 BOM');
        }
        index += 2;
        // ), ( and \ characters are escaped in ascii manner, remove the escapes before interpreting
        // the bytes as utf-16
        while (index < data.length && data[index] !== 41) { // )
            var high = getTextByte();
            var low = getTextByte();
            var char = (high << 8) | low;
            result += String.fromCharCode(char);
        }
        index++;
        return result;
    }
    var root = null;
    var stack = [];
    function pushContainer(value) {
        if (!stack.length) {
            stack.push(value);
            root = value;
        }
        else {
            pushValue(value);
            stack.push(value);
        }
    }
    function pushValue(value) {
        if (!stack.length)
            throw new Error('Invalid data');
        var top = stack[stack.length - 1];
        if (typeof top === 'string') {
            stack[stack.length - 2][top] = value;
            pop();
        }
        else if (Array.isArray(top)) {
            top.push(value);
        }
        else {
            throw new Error('Invalid data');
        }
    }
    function pushProperty(name) {
        if (!stack.length)
            pushContainer({});
        var top = stack[stack.length - 1];
        if (top && typeof top === 'string') {
            if (name === 'nil') {
                pushValue(null);
            }
            else {
                pushValue("/" + name);
            }
        }
        else if (top && typeof top === 'object') {
            stack.push(name);
        }
        else {
            throw new Error('Invalid data');
        }
    }
    function pop() {
        if (!stack.length)
            throw new Error('Invalid data');
        stack.pop();
    }
    skipWhitespace();
    while (index < data.length) {
        var i = index;
        var char = data[i];
        if (char === 60 && data[i + 1] === 60) { // <<
            index += 2;
            pushContainer({});
        }
        else if (char === 62 && data[i + 1] === 62) { // >>
            index += 2;
            pop();
        }
        else if (char === 47) { // /
            index += 1;
            var start = index;
            while (index < data.length && !isWhitespace(data[index])) {
                index++;
            }
            var name_1 = '';
            for (var i_1 = start; i_1 < index; i_1++) {
                name_1 += String.fromCharCode(data[i_1]);
            }
            pushProperty(name_1);
        }
        else if (char === 40) { // (
            index += 1;
            pushValue(getText());
        }
        else if (char === 91) { // [
            index += 1;
            pushContainer([]);
        }
        else if (char === 93) { // ]
            index += 1;
            pop();
        }
        else if (char === 110 && data[i + 1] === 117 && data[i + 2] === 108 && data[i + 3] === 108) { // null
            index += 4;
            pushValue(null);
        }
        else if (char === 116 && data[i + 1] === 114 && data[i + 2] === 117 && data[i + 3] === 101) { // true
            index += 4;
            pushValue(true);
        }
        else if (char === 102 && data[i + 1] === 97 && data[i + 2] === 108 && data[i + 3] === 115 && data[i + 4] === 101) { // false
            index += 5;
            pushValue(false);
        }
        else if (isNumber(char)) {
            var value = '';
            while (index < data.length && isNumber(data[index])) {
                value += String.fromCharCode(data[index]);
                index++;
            }
            pushValue(parseFloat(value));
        }
        else {
            index += 1;
            console.log("Invalid token " + String.fromCharCode(char) + " at " + index);
            // ` near ${String.fromCharCode.apply(null, data.slice(index - 10, index + 20) as any)}` +
            // `data [${Array.from(data.slice(index - 10, index + 20)).join(', ')}]`
        }
        skipWhitespace();
    }
    return root;
}
exports.parseEngineData = parseEngineData;
var floatKeys = [
    'Axis', 'XY', 'Zone', 'WordSpacing', 'FirstLineIndent', 'GlyphSpacing', 'StartIndent', 'EndIndent', 'SpaceBefore',
    'SpaceAfter', 'LetterSpacing', 'Values', 'GridSize', 'GridLeading', 'PointBase', 'BoxBounds', 'TransformPoint0', 'TransformPoint1',
    'TransformPoint2', 'FontSize', 'Leading', 'HorizontalScale', 'VerticalScale', 'BaselineShift', 'Tsume',
    'OutlineWidth',
];
var intArrays = ['RunLengthArray'];
// TODO: handle /nil
function serializeEngineData(data, condensed) {
    if (condensed === void 0) { condensed = false; }
    var buffer = new Uint8Array(1024);
    var offset = 0;
    var indent = 0;
    function write(value) {
        if (offset >= buffer.length) {
            var newBuffer = new Uint8Array(buffer.length * 2);
            newBuffer.set(buffer);
            buffer = newBuffer;
        }
        buffer[offset] = value;
        offset++;
    }
    function writeString(value) {
        for (var i = 0; i < value.length; i++) {
            write(value.charCodeAt(i));
        }
    }
    function writeIndent() {
        if (condensed) {
            writeString(' ');
        }
        else {
            for (var i = 0; i < indent; i++) {
                writeString('\t');
            }
        }
    }
    function writeProperty(key, value) {
        writeIndent();
        writeString("/" + key);
        writeValue(value, key, true);
        if (!condensed)
            writeString('\n');
    }
    function serializeInt(value) {
        return value.toString();
    }
    function serializeFloat(value) {
        return value.toFixed(5)
            .replace(/(\d)0+$/g, '$1')
            .replace(/^0+\.([1-9])/g, '.$1')
            .replace(/^-0+\.0(\d)/g, '-.0$1');
    }
    function serializeNumber(value, key) {
        var isFloat = (key && floatKeys.indexOf(key) !== -1) || (value | 0) !== value;
        return isFloat ? serializeFloat(value) : serializeInt(value);
    }
    function getKeys(value) {
        var keys = Object.keys(value);
        if (keys.indexOf('98') !== -1)
            keys.unshift.apply(keys, keys.splice(keys.indexOf('99'), 1));
        if (keys.indexOf('99') !== -1)
            keys.unshift.apply(keys, keys.splice(keys.indexOf('99'), 1));
        return keys;
    }
    function writeStringByte(value) {
        if (value === 40 || value === 41 || value === 92) { // ( ) \
            write(92); // \
        }
        write(value);
    }
    function writeValue(value, key, inProperty) {
        if (inProperty === void 0) { inProperty = false; }
        function writePrefix() {
            if (inProperty) {
                writeString(' ');
            }
            else {
                writeIndent();
            }
        }
        if (value === null) {
            writePrefix();
            writeString(condensed ? '/nil' : 'null');
        }
        else if (typeof value === 'number') {
            writePrefix();
            writeString(serializeNumber(value, key));
        }
        else if (typeof value === 'boolean') {
            writePrefix();
            writeString(value ? 'true' : 'false');
        }
        else if (typeof value === 'string') {
            writePrefix();
            if ((key === '99' || key === '98') && value.charAt(0) === '/') {
                writeString(value);
            }
            else {
                writeString('(');
                write(0xfe);
                write(0xff);
                for (var i = 0; i < value.length; i++) {
                    var code = value.charCodeAt(i);
                    writeStringByte((code >> 8) & 0xff);
                    writeStringByte(code & 0xff);
                }
                writeString(')');
            }
        }
        else if (Array.isArray(value)) {
            writePrefix();
            if (value.every(function (x) { return typeof x === 'number'; })) {
                writeString('[');
                var intArray = intArrays.indexOf(key) !== -1;
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var x = value_1[_i];
                    writeString(' ');
                    writeString(intArray ? serializeNumber(x) : serializeFloat(x));
                }
                writeString(' ]');
            }
            else {
                writeString('[');
                if (!condensed)
                    writeString('\n');
                for (var _a = 0, value_2 = value; _a < value_2.length; _a++) {
                    var x = value_2[_a];
                    writeValue(x, key);
                    if (!condensed)
                        writeString('\n');
                }
                writeIndent();
                writeString(']');
            }
        }
        else if (typeof value === 'object') {
            if (inProperty && !condensed)
                writeString('\n');
            writeIndent();
            writeString('<<');
            if (!condensed)
                writeString('\n');
            indent++;
            for (var _b = 0, _c = getKeys(value); _b < _c.length; _b++) {
                var key_1 = _c[_b];
                writeProperty(key_1, value[key_1]);
            }
            indent--;
            writeIndent();
            writeString('>>');
        }
        return undefined;
    }
    if (condensed) {
        if (typeof data === 'object') {
            for (var _i = 0, _a = getKeys(data); _i < _a.length; _i++) {
                var key = _a[_i];
                writeProperty(key, data[key]);
            }
        }
    }
    else {
        writeString('\n\n');
        writeValue(data);
    }
    return buffer.slice(0, offset);
}
exports.serializeEngineData = serializeEngineData;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QkFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbEMsTUFBTSxFQUFFLENBQUM7WUFFVCxLQUFrQixVQUFjLEVBQWQsS0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQWQsY0FBYyxFQUFkLElBQWMsRUFBRTtnQkFBN0IsSUFBTSxLQUFHLFNBQUE7Z0JBQ2IsYUFBYSxDQUFDLEtBQUcsRUFBRSxLQUFLLENBQUMsS0FBRyxDQUFDLENBQUMsQ0FBQzthQUMvQjtZQUVELE1BQU0sRUFBRSxDQUFDO1lBQ1QsV0FBVyxFQUFFLENBQUM7WUFDZCxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEI7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRUQsSUFBSSxTQUFTLEVBQUU7UUFDZCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUM3QixLQUFrQixVQUFhLEVBQWIsS0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQWIsY0FBYSxFQUFiLElBQWEsRUFBRTtnQkFBNUIsSUFBTSxHQUFHLFNBQUE7Z0JBQ2IsYUFBYSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUM5QjtTQUNEO0tBQ0Q7U0FBTTtRQUNOLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQixVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakI7SUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUEzS0Qsa0RBMktDIiwiZmlsZSI6ImVuZ2luZURhdGEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBpc1doaXRlc3BhY2UoY2hhcjogbnVtYmVyKSB7XHJcblx0Ly8gJyAnLCAnXFxuJywgJ1xccicsICdcXHQnXHJcblx0cmV0dXJuIGNoYXIgPT09IDMyIHx8IGNoYXIgPT09IDEwIHx8IGNoYXIgPT09IDEzIHx8IGNoYXIgPT09IDk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzTnVtYmVyKGNoYXI6IG51bWJlcikge1xyXG5cdC8vIDAxMjM0NTY3ODkuLVxyXG5cdHJldHVybiAoY2hhciA+PSA0OCAmJiBjaGFyIDw9IDU3KSB8fCBjaGFyID09PSA0NiB8fCBjaGFyID09PSA0NTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRW5naW5lRGF0YShkYXRhOiBudW1iZXJbXSB8IFVpbnQ4QXJyYXkpIHtcclxuXHRsZXQgaW5kZXggPSAwO1xyXG5cclxuXHRmdW5jdGlvbiBza2lwV2hpdGVzcGFjZSgpIHtcclxuXHRcdHdoaWxlIChpbmRleCA8IGRhdGEubGVuZ3RoICYmIGlzV2hpdGVzcGFjZShkYXRhW2luZGV4XSkpIHtcclxuXHRcdFx0aW5kZXgrKztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFRleHRCeXRlKCkge1xyXG5cdFx0bGV0IGJ5dGUgPSBkYXRhW2luZGV4XTtcclxuXHRcdGluZGV4Kys7XHJcblxyXG5cdFx0aWYgKGJ5dGUgPT09IDkyKSB7IC8vIFxcXHJcblx0XHRcdGJ5dGUgPSBkYXRhW2luZGV4XTtcclxuXHRcdFx0aW5kZXgrKztcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYnl0ZTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFRleHQoKSB7XHJcblx0XHRsZXQgcmVzdWx0ID0gJyc7XHJcblxyXG5cdFx0aWYgKGRhdGFbaW5kZXhdID09PSA0MSkgeyAvLyApXHJcblx0XHRcdGluZGV4Kys7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3RyaW5ncyBzdGFydCB3aXRoIHV0Zi0xNiBCT01cclxuXHRcdGlmIChkYXRhW2luZGV4XSAhPT0gMHhGRSB8fCBkYXRhW2luZGV4ICsgMV0gIT09IDB4RkYpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHV0Zi0xNiBCT00nKTtcclxuXHRcdH1cclxuXHJcblx0XHRpbmRleCArPSAyO1xyXG5cclxuXHRcdC8vICksICggYW5kIFxcIGNoYXJhY3RlcnMgYXJlIGVzY2FwZWQgaW4gYXNjaWkgbWFubmVyLCByZW1vdmUgdGhlIGVzY2FwZXMgYmVmb3JlIGludGVycHJldGluZ1xyXG5cdFx0Ly8gdGhlIGJ5dGVzIGFzIHV0Zi0xNlxyXG5cdFx0d2hpbGUgKGluZGV4IDwgZGF0YS5sZW5ndGggJiYgZGF0YVtpbmRleF0gIT09IDQxKSB7IC8vIClcclxuXHRcdFx0Y29uc3QgaGlnaCA9IGdldFRleHRCeXRlKCk7XHJcblx0XHRcdGNvbnN0IGxvdyA9IGdldFRleHRCeXRlKCk7XHJcblx0XHRcdGNvbnN0IGNoYXIgPSAoaGlnaCA8PCA4KSB8IGxvdztcclxuXHRcdFx0cmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcik7XHJcblx0XHR9XHJcblxyXG5cdFx0aW5kZXgrKztcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHRsZXQgcm9vdDogYW55ID0gbnVsbDtcclxuXHRjb25zdCBzdGFjazogYW55W10gPSBbXTtcclxuXHJcblx0ZnVuY3Rpb24gcHVzaENvbnRhaW5lcih2YWx1ZTogYW55KSB7XHJcblx0XHRpZiAoIXN0YWNrLmxlbmd0aCkge1xyXG5cdFx0XHRzdGFjay5wdXNoKHZhbHVlKTtcclxuXHRcdFx0cm9vdCA9IHZhbHVlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cHVzaFZhbHVlKHZhbHVlKTtcclxuXHRcdFx0c3RhY2sucHVzaCh2YWx1ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwdXNoVmFsdWUodmFsdWU6IGFueSkge1xyXG5cdFx0aWYgKCFzdGFjay5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkYXRhJyk7XHJcblxyXG5cdFx0Y29uc3QgdG9wID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XHJcblxyXG5cdFx0aWYgKHR5cGVvZiB0b3AgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdHN0YWNrW3N0YWNrLmxlbmd0aCAtIDJdW3RvcF0gPSB2YWx1ZTtcclxuXHRcdFx0cG9wKCk7XHJcblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodG9wKSkge1xyXG5cdFx0XHR0b3AucHVzaCh2YWx1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGF0YScpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcHVzaFByb3BlcnR5KG5hbWU6IHN0cmluZykge1xyXG5cdFx0aWYgKCFzdGFjay5sZW5ndGgpIHB1c2hDb250YWluZXIoe30pO1xyXG5cclxuXHRcdGNvbnN0IHRvcCA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xyXG5cclxuXHRcdGlmICh0b3AgJiYgdHlwZW9mIHRvcCA9PT0gJ3N0cmluZycpIHtcclxuXHRcdFx0aWYgKG5hbWUgPT09ICduaWwnKSB7XHJcblx0XHRcdFx0cHVzaFZhbHVlKG51bGwpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHB1c2hWYWx1ZShgLyR7bmFtZX1gKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICh0b3AgJiYgdHlwZW9mIHRvcCA9PT0gJ29iamVjdCcpIHtcclxuXHRcdFx0c3RhY2sucHVzaChuYW1lKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkYXRhJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBwb3AoKSB7XHJcblx0XHRpZiAoIXN0YWNrLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGEnKTtcclxuXHRcdHN0YWNrLnBvcCgpO1xyXG5cdH1cclxuXHJcblx0c2tpcFdoaXRlc3BhY2UoKTtcclxuXHJcblx0d2hpbGUgKGluZGV4IDwgZGF0YS5sZW5ndGgpIHtcclxuXHRcdGNvbnN0IGkgPSBpbmRleDtcclxuXHRcdGNvbnN0IGNoYXIgPSBkYXRhW2ldO1xyXG5cclxuXHRcdGlmIChjaGFyID09PSA2MCAmJiBkYXRhW2kgKyAxXSA9PT0gNjApIHsgLy8gPDxcclxuXHRcdFx0aW5kZXggKz0gMjtcclxuXHRcdFx0cHVzaENvbnRhaW5lcih7fSk7XHJcblx0XHR9IGVsc2UgaWYgKGNoYXIgPT09IDYyICYmIGRhdGFbaSArIDFdID09PSA2MikgeyAvLyA+PlxyXG5cdFx0XHRpbmRleCArPSAyO1xyXG5cdFx0XHRwb3AoKTtcclxuXHRcdH0gZWxzZSBpZiAoY2hhciA9PT0gNDcpIHsgLy8gL1xyXG5cdFx0XHRpbmRleCArPSAxO1xyXG5cdFx0XHRjb25zdCBzdGFydCA9IGluZGV4O1xyXG5cclxuXHRcdFx0d2hpbGUgKGluZGV4IDwgZGF0YS5sZW5ndGggJiYgIWlzV2hpdGVzcGFjZShkYXRhW2luZGV4XSkpIHtcclxuXHRcdFx0XHRpbmRleCsrO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgbmFtZSA9ICcnO1xyXG5cclxuXHRcdFx0Zm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgaW5kZXg7IGkrKykge1xyXG5cdFx0XHRcdG5hbWUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShkYXRhW2ldKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHVzaFByb3BlcnR5KG5hbWUpO1xyXG5cdFx0fSBlbHNlIGlmIChjaGFyID09PSA0MCkgeyAvLyAoXHJcblx0XHRcdGluZGV4ICs9IDE7XHJcblx0XHRcdHB1c2hWYWx1ZShnZXRUZXh0KCkpO1xyXG5cdFx0fSBlbHNlIGlmIChjaGFyID09PSA5MSkgeyAvLyBbXHJcblx0XHRcdGluZGV4ICs9IDE7XHJcblx0XHRcdHB1c2hDb250YWluZXIoW10pO1xyXG5cdFx0fSBlbHNlIGlmIChjaGFyID09PSA5MykgeyAvLyBdXHJcblx0XHRcdGluZGV4ICs9IDE7XHJcblx0XHRcdHBvcCgpO1xyXG5cdFx0fSBlbHNlIGlmIChjaGFyID09PSAxMTAgJiYgZGF0YVtpICsgMV0gPT09IDExNyAmJiBkYXRhW2kgKyAyXSA9PT0gMTA4ICYmIGRhdGFbaSArIDNdID09PSAxMDgpIHsgLy8gbnVsbFxyXG5cdFx0XHRpbmRleCArPSA0O1xyXG5cdFx0XHRwdXNoVmFsdWUobnVsbCk7XHJcblx0XHR9IGVsc2UgaWYgKGNoYXIgPT09IDExNiAmJiBkYXRhW2kgKyAxXSA9PT0gMTE0ICYmIGRhdGFbaSArIDJdID09PSAxMTcgJiYgZGF0YVtpICsgM10gPT09IDEwMSkgeyAvLyB0cnVlXHJcblx0XHRcdGluZGV4ICs9IDQ7XHJcblx0XHRcdHB1c2hWYWx1ZSh0cnVlKTtcclxuXHRcdH0gZWxzZSBpZiAoY2hhciA9PT0gMTAyICYmIGRhdGFbaSArIDFdID09PSA5NyAmJiBkYXRhW2kgKyAyXSA9PT0gMTA4ICYmIGRhdGFbaSArIDNdID09PSAxMTUgJiYgZGF0YVtpICsgNF0gPT09IDEwMSkgeyAvLyBmYWxzZVxyXG5cdFx0XHRpbmRleCArPSA1O1xyXG5cdFx0XHRwdXNoVmFsdWUoZmFsc2UpO1xyXG5cdFx0fSBlbHNlIGlmIChpc051bWJlcihjaGFyKSkge1xyXG5cdFx0XHRsZXQgdmFsdWUgPSAnJztcclxuXHJcblx0XHRcdHdoaWxlIChpbmRleCA8IGRhdGEubGVuZ3RoICYmIGlzTnVtYmVyKGRhdGFbaW5kZXhdKSkge1xyXG5cdFx0XHRcdHZhbHVlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoZGF0YVtpbmRleF0pO1xyXG5cdFx0XHRcdGluZGV4Kys7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHB1c2hWYWx1ZShwYXJzZUZsb2F0KHZhbHVlKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpbmRleCArPSAxO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhgSW52YWxpZCB0b2tlbiAke1N0cmluZy5mcm9tQ2hhckNvZGUoY2hhcil9IGF0ICR7aW5kZXh9YCk7XHJcblx0XHRcdC8vIGAgbmVhciAke1N0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgZGF0YS5zbGljZShpbmRleCAtIDEwLCBpbmRleCArIDIwKSBhcyBhbnkpfWAgK1xyXG5cdFx0XHQvLyBgZGF0YSBbJHtBcnJheS5mcm9tKGRhdGEuc2xpY2UoaW5kZXggLSAxMCwgaW5kZXggKyAyMCkpLmpvaW4oJywgJyl9XWBcclxuXHRcdH1cclxuXHJcblx0XHRza2lwV2hpdGVzcGFjZSgpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJvb3Q7XHJcbn1cclxuXHJcbmNvbnN0IGZsb2F0S2V5cyA9IFtcclxuXHQnQXhpcycsICdYWScsICdab25lJywgJ1dvcmRTcGFjaW5nJywgJ0ZpcnN0TGluZUluZGVudCcsICdHbHlwaFNwYWNpbmcnLCAnU3RhcnRJbmRlbnQnLCAnRW5kSW5kZW50JywgJ1NwYWNlQmVmb3JlJyxcclxuXHQnU3BhY2VBZnRlcicsICdMZXR0ZXJTcGFjaW5nJywgJ1ZhbHVlcycsICdHcmlkU2l6ZScsICdHcmlkTGVhZGluZycsICdQb2ludEJhc2UnLCAnQm94Qm91bmRzJywgJ1RyYW5zZm9ybVBvaW50MCcsICdUcmFuc2Zvcm1Qb2ludDEnLFxyXG5cdCdUcmFuc2Zvcm1Qb2ludDInLCAnRm9udFNpemUnLCAnTGVhZGluZycsICdIb3Jpem9udGFsU2NhbGUnLCAnVmVydGljYWxTY2FsZScsICdCYXNlbGluZVNoaWZ0JywgJ1RzdW1lJyxcclxuXHQnT3V0bGluZVdpZHRoJyxcclxuXTtcclxuXHJcbmNvbnN0IGludEFycmF5cyA9IFsnUnVuTGVuZ3RoQXJyYXknXTtcclxuXHJcbi8vIFRPRE86IGhhbmRsZSAvbmlsXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVFbmdpbmVEYXRhKGRhdGE6IGFueSwgY29uZGVuc2VkID0gZmFsc2UpIHtcclxuXHRsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoMTAyNCk7XHJcblx0bGV0IG9mZnNldCA9IDA7XHJcblx0bGV0IGluZGVudCA9IDA7XHJcblxyXG5cdGZ1bmN0aW9uIHdyaXRlKHZhbHVlOiBudW1iZXIpIHtcclxuXHRcdGlmIChvZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkge1xyXG5cdFx0XHRjb25zdCBuZXdCdWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIubGVuZ3RoICogMik7XHJcblx0XHRcdG5ld0J1ZmZlci5zZXQoYnVmZmVyKTtcclxuXHRcdFx0YnVmZmVyID0gbmV3QnVmZmVyO1xyXG5cdFx0fVxyXG5cclxuXHRcdGJ1ZmZlcltvZmZzZXRdID0gdmFsdWU7XHJcblx0XHRvZmZzZXQrKztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHdyaXRlU3RyaW5nKHZhbHVlOiBzdHJpbmcpIHtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0d3JpdGUodmFsdWUuY2hhckNvZGVBdChpKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB3cml0ZUluZGVudCgpIHtcclxuXHRcdGlmIChjb25kZW5zZWQpIHtcclxuXHRcdFx0d3JpdGVTdHJpbmcoJyAnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaW5kZW50OyBpKyspIHtcclxuXHRcdFx0XHR3cml0ZVN0cmluZygnXFx0Jyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHdyaXRlUHJvcGVydHkoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcclxuXHRcdHdyaXRlSW5kZW50KCk7XHJcblx0XHR3cml0ZVN0cmluZyhgLyR7a2V5fWApO1xyXG5cdFx0d3JpdGVWYWx1ZSh2YWx1ZSwga2V5LCB0cnVlKTtcclxuXHRcdGlmICghY29uZGVuc2VkKSB3cml0ZVN0cmluZygnXFxuJyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXJpYWxpemVJbnQodmFsdWU6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXJpYWxpemVGbG9hdCh2YWx1ZTogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4gdmFsdWUudG9GaXhlZCg1KVxyXG5cdFx0XHQucmVwbGFjZSgvKFxcZCkwKyQvZywgJyQxJylcclxuXHRcdFx0LnJlcGxhY2UoL14wK1xcLihbMS05XSkvZywgJy4kMScpXHJcblx0XHRcdC5yZXBsYWNlKC9eLTArXFwuMChcXGQpL2csICctLjAkMScpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2VyaWFsaXplTnVtYmVyKHZhbHVlOiBudW1iZXIsIGtleT86IHN0cmluZykge1xyXG5cdFx0Y29uc3QgaXNGbG9hdCA9IChrZXkgJiYgZmxvYXRLZXlzLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHx8ICh2YWx1ZSB8IDApICE9PSB2YWx1ZTtcclxuXHRcdHJldHVybiBpc0Zsb2F0ID8gc2VyaWFsaXplRmxvYXQodmFsdWUpIDogc2VyaWFsaXplSW50KHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldEtleXModmFsdWU6IGFueSkge1xyXG5cdFx0Y29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcclxuXHJcblx0XHRpZiAoa2V5cy5pbmRleE9mKCc5OCcpICE9PSAtMSlcclxuXHRcdFx0a2V5cy51bnNoaWZ0KC4uLmtleXMuc3BsaWNlKGtleXMuaW5kZXhPZignOTknKSwgMSkpO1xyXG5cclxuXHRcdGlmIChrZXlzLmluZGV4T2YoJzk5JykgIT09IC0xKVxyXG5cdFx0XHRrZXlzLnVuc2hpZnQoLi4ua2V5cy5zcGxpY2Uoa2V5cy5pbmRleE9mKCc5OScpLCAxKSk7XHJcblxyXG5cdFx0cmV0dXJuIGtleXM7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB3cml0ZVN0cmluZ0J5dGUodmFsdWU6IG51bWJlcikge1xyXG5cdFx0aWYgKHZhbHVlID09PSA0MCB8fCB2YWx1ZSA9PT0gNDEgfHwgdmFsdWUgPT09IDkyKSB7IC8vICggKSBcXFxyXG5cdFx0XHR3cml0ZSg5Mik7IC8vIFxcXHJcblx0XHR9XHJcblxyXG5cdFx0d3JpdGUodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gd3JpdGVWYWx1ZSh2YWx1ZTogYW55LCBrZXk/OiBzdHJpbmcsIGluUHJvcGVydHkgPSBmYWxzZSkge1xyXG5cdFx0ZnVuY3Rpb24gd3JpdGVQcmVmaXgoKSB7XHJcblx0XHRcdGlmIChpblByb3BlcnR5KSB7XHJcblx0XHRcdFx0d3JpdGVTdHJpbmcoJyAnKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR3cml0ZUluZGVudCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XHJcblx0XHRcdHdyaXRlUHJlZml4KCk7XHJcblx0XHRcdHdyaXRlU3RyaW5nKGNvbmRlbnNlZCA/ICcvbmlsJyA6ICdudWxsJyk7XHJcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcclxuXHRcdFx0d3JpdGVQcmVmaXgoKTtcclxuXHRcdFx0d3JpdGVTdHJpbmcoc2VyaWFsaXplTnVtYmVyKHZhbHVlLCBrZXkpKTtcclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcclxuXHRcdFx0d3JpdGVQcmVmaXgoKTtcclxuXHRcdFx0d3JpdGVTdHJpbmcodmFsdWUgPyAndHJ1ZScgOiAnZmFsc2UnKTtcclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHR3cml0ZVByZWZpeCgpO1xyXG5cclxuXHRcdFx0aWYgKChrZXkgPT09ICc5OScgfHwga2V5ID09PSAnOTgnKSAmJiB2YWx1ZS5jaGFyQXQoMCkgPT09ICcvJykge1xyXG5cdFx0XHRcdHdyaXRlU3RyaW5nKHZhbHVlKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR3cml0ZVN0cmluZygnKCcpO1xyXG5cdFx0XHRcdHdyaXRlKDB4ZmUpO1xyXG5cdFx0XHRcdHdyaXRlKDB4ZmYpO1xyXG5cclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBjb2RlID0gdmFsdWUuY2hhckNvZGVBdChpKTtcclxuXHRcdFx0XHRcdHdyaXRlU3RyaW5nQnl0ZSgoY29kZSA+PiA4KSAmIDB4ZmYpO1xyXG5cdFx0XHRcdFx0d3JpdGVTdHJpbmdCeXRlKGNvZGUgJiAweGZmKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHdyaXRlU3RyaW5nKCcpJyk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuXHRcdFx0d3JpdGVQcmVmaXgoKTtcclxuXHJcblx0XHRcdGlmICh2YWx1ZS5ldmVyeSh4ID0+IHR5cGVvZiB4ID09PSAnbnVtYmVyJykpIHtcclxuXHRcdFx0XHR3cml0ZVN0cmluZygnWycpO1xyXG5cclxuXHRcdFx0XHRjb25zdCBpbnRBcnJheSA9IGludEFycmF5cy5pbmRleE9mKGtleSEpICE9PSAtMTtcclxuXHJcblx0XHRcdFx0Zm9yIChjb25zdCB4IG9mIHZhbHVlKSB7XHJcblx0XHRcdFx0XHR3cml0ZVN0cmluZygnICcpO1xyXG5cdFx0XHRcdFx0d3JpdGVTdHJpbmcoaW50QXJyYXkgPyBzZXJpYWxpemVOdW1iZXIoeCkgOiBzZXJpYWxpemVGbG9hdCh4KSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR3cml0ZVN0cmluZygnIF0nKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR3cml0ZVN0cmluZygnWycpO1xyXG5cdFx0XHRcdGlmICghY29uZGVuc2VkKSB3cml0ZVN0cmluZygnXFxuJyk7XHJcblxyXG5cdFx0XHRcdGZvciAoY29uc3QgeCBvZiB2YWx1ZSkge1xyXG5cdFx0XHRcdFx0d3JpdGVWYWx1ZSh4LCBrZXkpO1xyXG5cdFx0XHRcdFx0aWYgKCFjb25kZW5zZWQpIHdyaXRlU3RyaW5nKCdcXG4nKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHdyaXRlSW5kZW50KCk7XHJcblx0XHRcdFx0d3JpdGVTdHJpbmcoJ10nKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdGlmIChpblByb3BlcnR5ICYmICFjb25kZW5zZWQpIHdyaXRlU3RyaW5nKCdcXG4nKTtcclxuXHJcblx0XHRcdHdyaXRlSW5kZW50KCk7XHJcblx0XHRcdHdyaXRlU3RyaW5nKCc8PCcpO1xyXG5cclxuXHRcdFx0aWYgKCFjb25kZW5zZWQpIHdyaXRlU3RyaW5nKCdcXG4nKTtcclxuXHJcblx0XHRcdGluZGVudCsrO1xyXG5cclxuXHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgZ2V0S2V5cyh2YWx1ZSkpIHtcclxuXHRcdFx0XHR3cml0ZVByb3BlcnR5KGtleSwgdmFsdWVba2V5XSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGluZGVudC0tO1xyXG5cdFx0XHR3cml0ZUluZGVudCgpO1xyXG5cdFx0XHR3cml0ZVN0cmluZygnPj4nKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0aWYgKGNvbmRlbnNlZCkge1xyXG5cdFx0aWYgKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0Jykge1xyXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBnZXRLZXlzKGRhdGEpKSB7XHJcblx0XHRcdFx0d3JpdGVQcm9wZXJ0eShrZXksIGRhdGFba2V5XSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9IGVsc2Uge1xyXG5cdFx0d3JpdGVTdHJpbmcoJ1xcblxcbicpO1xyXG5cdFx0d3JpdGVWYWx1ZShkYXRhKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBidWZmZXIuc2xpY2UoMCwgb2Zmc2V0KTtcclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9Vc2Vycy9qb2VyYWlpL2Rldi9hZy1wc2Qvc3JjIn0=
