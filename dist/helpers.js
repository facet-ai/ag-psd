"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCanvas = exports.createImageData = exports.createCanvasFromData = exports.createCanvas = exports.writeDataZipPrediction = exports.writeDataZip = exports.writeDataRLE = exports.writeDataRaw = exports.writeData = exports.decodeBitmap = exports.resetImageData = exports.hasAlpha = exports.clamp = exports.offsetForChannel = exports.Compression = exports.ChannelID = exports.MaskParams = exports.LayerMaskFlags = exports.ColorSpace = exports.createEnum = exports.revMap = exports.layerColors = exports.toBlendMode = exports.fromBlendMode = void 0;
var pako_1 = __importDefault(require("pako"));
var base64_js_1 = require("base64-js");
exports.fromBlendMode = {};
exports.toBlendMode = {
    'pass': 'pass through',
    'norm': 'normal',
    'diss': 'dissolve',
    'dark': 'darken',
    'mul ': 'multiply',
    'idiv': 'color burn',
    'lbrn': 'linear burn',
    'dkCl': 'darker color',
    'lite': 'lighten',
    'scrn': 'screen',
    'div ': 'color dodge',
    'lddg': 'linear dodge',
    'lgCl': 'lighter color',
    'over': 'overlay',
    'sLit': 'soft light',
    'hLit': 'hard light',
    'vLit': 'vivid light',
    'lLit': 'linear light',
    'pLit': 'pin light',
    'hMix': 'hard mix',
    'diff': 'difference',
    'smud': 'exclusion',
    'fsub': 'subtract',
    'fdiv': 'divide',
    'hue ': 'hue',
    'sat ': 'saturation',
    'colr': 'color',
    'lum ': 'luminosity',
};
Object.keys(exports.toBlendMode).forEach(function (key) { return exports.fromBlendMode[exports.toBlendMode[key]] = key; });
exports.layerColors = [
    'none', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray'
];
function revMap(map) {
    var result = {};
    Object.keys(map).forEach(function (key) { return result[map[key]] = key; });
    return result;
}
exports.revMap = revMap;
function createEnum(prefix, def, map) {
    var rev = revMap(map);
    var decode = function (val) { return rev[val.split('.')[1]] || def; };
    var encode = function (val) { return prefix + "." + (map[val] || map[def]); };
    return { decode: decode, encode: encode };
}
exports.createEnum = createEnum;
var ColorSpace;
(function (ColorSpace) {
    ColorSpace[ColorSpace["RGB"] = 0] = "RGB";
    ColorSpace[ColorSpace["HSB"] = 1] = "HSB";
    ColorSpace[ColorSpace["CMYK"] = 2] = "CMYK";
    ColorSpace[ColorSpace["Lab"] = 7] = "Lab";
    ColorSpace[ColorSpace["Grayscale"] = 8] = "Grayscale";
})(ColorSpace = exports.ColorSpace || (exports.ColorSpace = {}));
var LayerMaskFlags;
(function (LayerMaskFlags) {
    LayerMaskFlags[LayerMaskFlags["PositionRelativeToLayer"] = 1] = "PositionRelativeToLayer";
    LayerMaskFlags[LayerMaskFlags["LayerMaskDisabled"] = 2] = "LayerMaskDisabled";
    LayerMaskFlags[LayerMaskFlags["InvertLayerMaskWhenBlending"] = 4] = "InvertLayerMaskWhenBlending";
    LayerMaskFlags[LayerMaskFlags["LayerMaskFromRenderingOtherData"] = 8] = "LayerMaskFromRenderingOtherData";
    LayerMaskFlags[LayerMaskFlags["MaskHasParametersAppliedToIt"] = 16] = "MaskHasParametersAppliedToIt";
})(LayerMaskFlags = exports.LayerMaskFlags || (exports.LayerMaskFlags = {}));
var MaskParams;
(function (MaskParams) {
    MaskParams[MaskParams["UserMaskDensity"] = 1] = "UserMaskDensity";
    MaskParams[MaskParams["UserMaskFeather"] = 2] = "UserMaskFeather";
    MaskParams[MaskParams["VectorMaskDensity"] = 4] = "VectorMaskDensity";
    MaskParams[MaskParams["VectorMaskFeather"] = 8] = "VectorMaskFeather";
})(MaskParams = exports.MaskParams || (exports.MaskParams = {}));
var ChannelID;
(function (ChannelID) {
    ChannelID[ChannelID["Red"] = 0] = "Red";
    ChannelID[ChannelID["Green"] = 1] = "Green";
    ChannelID[ChannelID["Blue"] = 2] = "Blue";
    ChannelID[ChannelID["Transparency"] = -1] = "Transparency";
    ChannelID[ChannelID["UserMask"] = -2] = "UserMask";
    ChannelID[ChannelID["RealUserMask"] = -3] = "RealUserMask";
})(ChannelID = exports.ChannelID || (exports.ChannelID = {}));
var Compression;
(function (Compression) {
    Compression[Compression["RawData"] = 0] = "RawData";
    Compression[Compression["RleCompressed"] = 1] = "RleCompressed";
    Compression[Compression["ZipWithoutPrediction"] = 2] = "ZipWithoutPrediction";
    Compression[Compression["ZipWithPrediction"] = 3] = "ZipWithPrediction";
})(Compression = exports.Compression || (exports.Compression = {}));
function offsetForChannel(channelId) {
    switch (channelId) {
        case 0 /* Red */: return 0;
        case 1 /* Green */: return 1;
        case 2 /* Blue */: return 2;
        case -1 /* Transparency */: return 3;
        default: return channelId + 1;
    }
}
exports.offsetForChannel = offsetForChannel;
function clamp(value, min, max) {
    return value < min ? min : (value > max ? max : value);
}
exports.clamp = clamp;
function hasAlpha(data) {
    var size = data.width * data.height * 4;
    for (var i = 3; i < size; i += 4) {
        if (data.data[i] !== 255) {
            return true;
        }
    }
    return false;
}
exports.hasAlpha = hasAlpha;
function resetImageData(_a) {
    var width = _a.width, height = _a.height, data = _a.data;
    var size = (width * height) | 0;
    var buffer = new Uint32Array(data.buffer);
    for (var p = 0; p < size; p = (p + 1) | 0) {
        buffer[p] = 0xff000000;
    }
}
exports.resetImageData = resetImageData;
function decodeBitmap(input, output, width, height) {
    for (var y = 0, p = 0, o = 0; y < height; y++) {
        for (var x = 0; x < width;) {
            var b = input[o++];
            for (var i = 0; i < 8 && x < width; i++, x++) {
                var v = b & 0x80 ? 0 : 255;
                b = b << 1;
                output[p++] = v;
                output[p++] = v;
                output[p++] = v;
                output[p++] = 255;
            }
        }
    }
}
exports.decodeBitmap = decodeBitmap;
function writeData(buffer, data, width, height, offsets, compression) {
    switch (compression) {
        case 0 /* RawData */:
            return new Uint8Array(data.data);
        case 2 /* ZipWithoutPrediction */:
            return writeDataZip(buffer, data, width, height, offsets);
        case 3:
            return writeDataZipPrediction(buffer, data, width, height, offsets);
        case 1:
        default:
            return writeDataRLE(buffer, data, width, height, offsets);
    }
}
exports.writeData = writeData;
function writeDataRaw(data, offset, width, height) {
    if (!width || !height)
        return undefined;
    var array = new Uint8Array(width * height);
    for (var i = 0; i < array.length; i++) {
        array[i] = data.data[i * 4 + offset];
    }
    return array;
}
exports.writeDataRaw = writeDataRaw;
function writeDataRLE(buffer, _a, width, height, offsets) {
    var data = _a.data;
    if (!width || !height)
        return undefined;
    var stride = (4 * width) | 0;
    var ol = 0;
    var o = (offsets.length * 2 * height) | 0;
    for (var _i = 0, offsets_1 = offsets; _i < offsets_1.length; _i++) {
        var offset = offsets_1[_i];
        for (var y = 0, p = offset | 0; y < height; y++) {
            var strideStart = (y * stride) | 0;
            var strideEnd = (strideStart + stride) | 0;
            var lastIndex = (strideEnd + offset - 4) | 0;
            var lastIndex2 = (lastIndex - 4) | 0;
            var startOffset = o;
            for (p = (strideStart + offset) | 0; p < strideEnd; p = (p + 4) | 0) {
                if (p < lastIndex2) {
                    var value1 = data[p];
                    p = (p + 4) | 0;
                    var value2 = data[p];
                    p = (p + 4) | 0;
                    var value3 = data[p];
                    if (value1 === value2 && value1 === value3) {
                        var count = 3;
                        while (count < 128 && p < lastIndex && data[(p + 4) | 0] === value1) {
                            count = (count + 1) | 0;
                            p = (p + 4) | 0;
                        }
                        buffer[o++] = 1 - count;
                        buffer[o++] = value1;
                    }
                    else {
                        var countIndex = o;
                        var writeLast = true;
                        var count = 1;
                        buffer[o++] = 0;
                        buffer[o++] = value1;
                        while (p < lastIndex && count < 128) {
                            p = (p + 4) | 0;
                            value1 = value2;
                            value2 = value3;
                            value3 = data[p];
                            if (value1 === value2 && value1 === value3) {
                                p = (p - 12) | 0;
                                writeLast = false;
                                break;
                            }
                            else {
                                count++;
                                buffer[o++] = value1;
                            }
                        }
                        if (writeLast) {
                            if (count < 127) {
                                buffer[o++] = value2;
                                buffer[o++] = value3;
                                count += 2;
                            }
                            else if (count < 128) {
                                buffer[o++] = value2;
                                count++;
                                p = (p - 4) | 0;
                            }
                            else {
                                p = (p - 8) | 0;
                            }
                        }
                        buffer[countIndex] = count - 1;
                    }
                }
                else if (p === lastIndex) {
                    buffer[o++] = 0;
                    buffer[o++] = data[p];
                }
                else { // p === lastIndex2
                    buffer[o++] = 1;
                    buffer[o++] = data[p];
                    p = (p + 4) | 0;
                    buffer[o++] = data[p];
                }
            }
            var length_1 = o - startOffset;
            buffer[ol++] = (length_1 >> 8) & 0xff;
            buffer[ol++] = length_1 & 0xff;
        }
    }
    return buffer.slice(0, o);
}
exports.writeDataRLE = writeDataRLE;
/**
 * As per the Adobe file format, zlib compress each channel separately
 */
function writeDataZip(buffer, pd, width, height, offsets) {
    if (!width || !height)
        return undefined;
    var data = pd.data;
    var size = width * height;
    // TODO(jsr): this doesn't work if more than one offest is passed
    if (offsets.length > 1) {
        throw new Error('Zipping multiple channels is not supported');
    }
    // NOTE this fixes the packing order, so if you passed offsets = [1,0,2,3] it will flip channels
    for (var plane = 0; plane < offsets.length; plane++) {
        for (var i = 0; i < size; i++) {
            buffer[i + plane * size] = data[i * 4 + offsets[plane]];
        }
    }
    return pako_1.default.deflate(buffer.slice(0, size * offsets.length));
}
exports.writeDataZip = writeDataZip;
function writeDataZipPrediction(buffer, _a, width, height, offsets) {
    var data = _a.data;
    if (!width || !height)
        return undefined;
    console.log(buffer, data, offsets);
    throw new Error('Zip with prediction compression not yet implemented');
}
exports.writeDataZipPrediction = writeDataZipPrediction;
/* istanbul ignore next */
exports.createCanvas = function () {
    throw new Error('Canvas not initialized, use initializeCanvas method to set up createCanvas method');
};
/* istanbul ignore next */
exports.createCanvasFromData = function () {
    throw new Error('Canvas not initialized, use initializeCanvas method to set up createCanvasFromData method');
};
var tempCanvas = undefined;
exports.createImageData = function (width, height) {
    if (!tempCanvas)
        tempCanvas = exports.createCanvas(1, 1);
    return tempCanvas.getContext('2d').createImageData(width, height);
};
/* istanbul ignore if */
if (typeof document !== 'undefined') {
    exports.createCanvas = function (width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };
    exports.createCanvasFromData = function (data) {
        var image = new Image();
        image.src = 'data:image/jpeg;base64,' + base64_js_1.fromByteArray(data);
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas;
    };
}
function initializeCanvas(createCanvasMethod, createCanvasFromDataMethod, createImageDataMethod) {
    exports.createCanvas = createCanvasMethod;
    exports.createCanvasFromData = createCanvasFromDataMethod || exports.createCanvasFromData;
    exports.createImageData = createImageDataMethod || exports.createImageData;
}
exports.initializeCanvas = initializeCanvas;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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b0IsQ0FBQztJQUMxRSx1QkFBZSxHQUFHLHFCQUFxQixJQUFJLHVCQUFlLENBQUM7QUFDNUQsQ0FBQztBQVJELDRDQVFDIiwiZmlsZSI6ImhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGFrbyBmcm9tICdwYWtvJztcbmltcG9ydCB7IGZyb21CeXRlQXJyYXkgfSBmcm9tICdiYXNlNjQtanMnO1xuaW1wb3J0IHsgTGF5ZXIsIEJsZW5kTW9kZSwgTGF5ZXJDb2xvciB9IGZyb20gJy4vcHNkJztcblxuZXhwb3J0IGNvbnN0IGZyb21CbGVuZE1vZGU6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbmV4cG9ydCBjb25zdCB0b0JsZW5kTW9kZTogeyBba2V5OiBzdHJpbmddOiBCbGVuZE1vZGUgfSA9IHtcblx0J3Bhc3MnOiAncGFzcyB0aHJvdWdoJyxcblx0J25vcm0nOiAnbm9ybWFsJyxcblx0J2Rpc3MnOiAnZGlzc29sdmUnLFxuXHQnZGFyayc6ICdkYXJrZW4nLFxuXHQnbXVsICc6ICdtdWx0aXBseScsXG5cdCdpZGl2JzogJ2NvbG9yIGJ1cm4nLFxuXHQnbGJybic6ICdsaW5lYXIgYnVybicsXG5cdCdka0NsJzogJ2RhcmtlciBjb2xvcicsXG5cdCdsaXRlJzogJ2xpZ2h0ZW4nLFxuXHQnc2Nybic6ICdzY3JlZW4nLFxuXHQnZGl2ICc6ICdjb2xvciBkb2RnZScsXG5cdCdsZGRnJzogJ2xpbmVhciBkb2RnZScsXG5cdCdsZ0NsJzogJ2xpZ2h0ZXIgY29sb3InLFxuXHQnb3Zlcic6ICdvdmVybGF5Jyxcblx0J3NMaXQnOiAnc29mdCBsaWdodCcsXG5cdCdoTGl0JzogJ2hhcmQgbGlnaHQnLFxuXHQndkxpdCc6ICd2aXZpZCBsaWdodCcsXG5cdCdsTGl0JzogJ2xpbmVhciBsaWdodCcsXG5cdCdwTGl0JzogJ3BpbiBsaWdodCcsXG5cdCdoTWl4JzogJ2hhcmQgbWl4Jyxcblx0J2RpZmYnOiAnZGlmZmVyZW5jZScsXG5cdCdzbXVkJzogJ2V4Y2x1c2lvbicsXG5cdCdmc3ViJzogJ3N1YnRyYWN0Jyxcblx0J2ZkaXYnOiAnZGl2aWRlJyxcblx0J2h1ZSAnOiAnaHVlJyxcblx0J3NhdCAnOiAnc2F0dXJhdGlvbicsXG5cdCdjb2xyJzogJ2NvbG9yJyxcblx0J2x1bSAnOiAnbHVtaW5vc2l0eScsXG59O1xuXG5PYmplY3Qua2V5cyh0b0JsZW5kTW9kZSkuZm9yRWFjaChrZXkgPT4gZnJvbUJsZW5kTW9kZVt0b0JsZW5kTW9kZVtrZXldXSA9IGtleSk7XG5cbmV4cG9ydCBjb25zdCBsYXllckNvbG9yczogTGF5ZXJDb2xvcltdID0gW1xuXHQnbm9uZScsICdyZWQnLCAnb3JhbmdlJywgJ3llbGxvdycsICdncmVlbicsICdibHVlJywgJ3Zpb2xldCcsICdncmF5J1xuXTtcblxuZXhwb3J0IGludGVyZmFjZSBEaWN0IHtcblx0W2tleTogc3RyaW5nXTogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2TWFwKG1hcDogRGljdCkge1xuXHRjb25zdCByZXN1bHQ6IERpY3QgPSB7fTtcblx0T2JqZWN0LmtleXMobWFwKS5mb3JFYWNoKGtleSA9PiByZXN1bHRbbWFwW2tleV1dID0ga2V5KTtcblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVudW08VD4ocHJlZml4OiBzdHJpbmcsIGRlZjogc3RyaW5nLCBtYXA6IERpY3QpIHtcblx0Y29uc3QgcmV2ID0gcmV2TWFwKG1hcCk7XG5cdGNvbnN0IGRlY29kZSA9ICh2YWw6IHN0cmluZyk6IFQgPT4gKHJldlt2YWwuc3BsaXQoJy4nKVsxXV0gYXMgYW55KSB8fCBkZWY7XG5cdGNvbnN0IGVuY29kZSA9ICh2YWw6IFQgfCB1bmRlZmluZWQpOiBzdHJpbmcgPT4gYCR7cHJlZml4fS4ke21hcFt2YWwgYXMgYW55XSB8fCBtYXBbZGVmXX1gO1xuXHRyZXR1cm4geyBkZWNvZGUsIGVuY29kZSB9O1xufVxuXG5leHBvcnQgY29uc3QgZW51bSBDb2xvclNwYWNlIHtcblx0UkdCID0gMCxcblx0SFNCID0gMSxcblx0Q01ZSyA9IDIsXG5cdExhYiA9IDcsXG5cdEdyYXlzY2FsZSA9IDgsXG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIExheWVyTWFza0ZsYWdzIHtcblx0UG9zaXRpb25SZWxhdGl2ZVRvTGF5ZXIgPSAxLFxuXHRMYXllck1hc2tEaXNhYmxlZCA9IDIsXG5cdEludmVydExheWVyTWFza1doZW5CbGVuZGluZyA9IDQsIC8vIG9ic29sZXRlXG5cdExheWVyTWFza0Zyb21SZW5kZXJpbmdPdGhlckRhdGEgPSA4LFxuXHRNYXNrSGFzUGFyYW1ldGVyc0FwcGxpZWRUb0l0ID0gMTYsXG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIE1hc2tQYXJhbXMge1xuXHRVc2VyTWFza0RlbnNpdHkgPSAxLFxuXHRVc2VyTWFza0ZlYXRoZXIgPSAyLFxuXHRWZWN0b3JNYXNrRGVuc2l0eSA9IDQsXG5cdFZlY3Rvck1hc2tGZWF0aGVyID0gOCxcbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gQ2hhbm5lbElEIHtcblx0UmVkID0gMCxcblx0R3JlZW4gPSAxLFxuXHRCbHVlID0gMixcblx0VHJhbnNwYXJlbmN5ID0gLTEsXG5cdFVzZXJNYXNrID0gLTIsXG5cdFJlYWxVc2VyTWFzayA9IC0zLFxufVxuXG5leHBvcnQgY29uc3QgZW51bSBDb21wcmVzc2lvbiB7XG5cdFJhd0RhdGEgPSAwLFxuXHRSbGVDb21wcmVzc2VkID0gMSxcblx0WmlwV2l0aG91dFByZWRpY3Rpb24gPSAyLFxuXHRaaXBXaXRoUHJlZGljdGlvbiA9IDMsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhbm5lbERhdGEge1xuXHRjaGFubmVsSWQ6IENoYW5uZWxJRDtcblx0Y29tcHJlc3Npb246IENvbXByZXNzaW9uO1xuXHRidWZmZXI6IFVpbnQ4QXJyYXkgfCB1bmRlZmluZWQ7XG5cdGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJvdW5kcyB7XG5cdHRvcDogbnVtYmVyO1xuXHRsZWZ0OiBudW1iZXI7XG5cdHJpZ2h0OiBudW1iZXI7XG5cdGJvdHRvbTogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExheWVyQ2hhbm5lbERhdGEge1xuXHRsYXllcjogTGF5ZXI7XG5cdGNoYW5uZWxzOiBDaGFubmVsRGF0YVtdO1xuXHR0b3A6IG51bWJlcjtcblx0bGVmdDogbnVtYmVyO1xuXHRyaWdodDogbnVtYmVyO1xuXHRib3R0b206IG51bWJlcjtcblx0bWFzaz86IEJvdW5kcztcbn1cblxuZXhwb3J0IHR5cGUgUGl4ZWxBcnJheSA9IFVpbnQ4Q2xhbXBlZEFycmF5IHwgVWludDhBcnJheTtcblxuZXhwb3J0IGludGVyZmFjZSBQaXhlbERhdGEge1xuXHRkYXRhOiBQaXhlbEFycmF5O1xuXHR3aWR0aDogbnVtYmVyO1xuXHRoZWlnaHQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9mZnNldEZvckNoYW5uZWwoY2hhbm5lbElkOiBDaGFubmVsSUQpIHtcblx0c3dpdGNoIChjaGFubmVsSWQpIHtcblx0XHRjYXNlIENoYW5uZWxJRC5SZWQ6IHJldHVybiAwO1xuXHRcdGNhc2UgQ2hhbm5lbElELkdyZWVuOiByZXR1cm4gMTtcblx0XHRjYXNlIENoYW5uZWxJRC5CbHVlOiByZXR1cm4gMjtcblx0XHRjYXNlIENoYW5uZWxJRC5UcmFuc3BhcmVuY3k6IHJldHVybiAzO1xuXHRcdGRlZmF1bHQ6IHJldHVybiBjaGFubmVsSWQgKyAxO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcCh2YWx1ZTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcblx0cmV0dXJuIHZhbHVlIDwgbWluID8gbWluIDogKHZhbHVlID4gbWF4ID8gbWF4IDogdmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQWxwaGEoZGF0YTogUGl4ZWxEYXRhKSB7XG5cdGNvbnN0IHNpemUgPSBkYXRhLndpZHRoICogZGF0YS5oZWlnaHQgKiA0O1xuXG5cdGZvciAobGV0IGkgPSAzOyBpIDwgc2l6ZTsgaSArPSA0KSB7XG5cdFx0aWYgKGRhdGEuZGF0YVtpXSAhPT0gMjU1KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldEltYWdlRGF0YSh7IHdpZHRoLCBoZWlnaHQsIGRhdGEgfTogUGl4ZWxEYXRhKSB7XG5cdGNvbnN0IHNpemUgPSAod2lkdGggKiBoZWlnaHQpIHwgMDtcblx0Y29uc3QgYnVmZmVyID0gbmV3IFVpbnQzMkFycmF5KGRhdGEuYnVmZmVyKTtcblxuXHRmb3IgKGxldCBwID0gMDsgcCA8IHNpemU7IHAgPSAocCArIDEpIHwgMCkge1xuXHRcdGJ1ZmZlcltwXSA9IDB4ZmYwMDAwMDA7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZUJpdG1hcChpbnB1dDogUGl4ZWxBcnJheSwgb3V0cHV0OiBQaXhlbEFycmF5LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuXHRmb3IgKGxldCB5ID0gMCwgcCA9IDAsIG8gPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcblx0XHRmb3IgKGxldCB4ID0gMDsgeCA8IHdpZHRoOykge1xuXHRcdFx0bGV0IGIgPSBpbnB1dFtvKytdO1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IDggJiYgeCA8IHdpZHRoOyBpKyssIHgrKykge1xuXHRcdFx0XHRjb25zdCB2ID0gYiAmIDB4ODAgPyAwIDogMjU1O1xuXHRcdFx0XHRiID0gYiA8PCAxO1xuXHRcdFx0XHRvdXRwdXRbcCsrXSA9IHY7XG5cdFx0XHRcdG91dHB1dFtwKytdID0gdjtcblx0XHRcdFx0b3V0cHV0W3ArK10gPSB2O1xuXHRcdFx0XHRvdXRwdXRbcCsrXSA9IDI1NTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlRGF0YShidWZmZXI6IFVpbnQ4QXJyYXksIGRhdGE6IFBpeGVsRGF0YSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG9mZnNldHM6IG51bWJlcltdLCBjb21wcmVzc2lvbj86IENvbXByZXNzaW9uKSB7XG5cdHN3aXRjaCAoY29tcHJlc3Npb24pIHtcblx0XHRjYXNlIENvbXByZXNzaW9uLlJhd0RhdGE6XG5cdFx0XHRyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YS5kYXRhKTtcblx0XHRjYXNlIENvbXByZXNzaW9uLlppcFdpdGhvdXRQcmVkaWN0aW9uOlxuXHRcdFx0cmV0dXJuIHdyaXRlRGF0YVppcChidWZmZXIsIGRhdGEsIHdpZHRoLCBoZWlnaHQsIG9mZnNldHMpO1xuXHRcdGNhc2UgMzpcblx0XHRcdHJldHVybiB3cml0ZURhdGFaaXBQcmVkaWN0aW9uKGJ1ZmZlciwgZGF0YSwgd2lkdGgsIGhlaWdodCwgb2Zmc2V0cyk7XG5cdFx0Y2FzZSAxOlxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gd3JpdGVEYXRhUkxFKGJ1ZmZlciwgZGF0YSwgd2lkdGgsIGhlaWdodCwgb2Zmc2V0cyk7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlRGF0YVJhdyhkYXRhOiBQaXhlbERhdGEsIG9mZnNldDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuXHRpZiAoIXdpZHRoIHx8ICFoZWlnaHQpXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblxuXHRjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KHdpZHRoICogaGVpZ2h0KTtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0YXJyYXlbaV0gPSBkYXRhLmRhdGFbaSAqIDQgKyBvZmZzZXRdO1xuXHR9XG5cblx0cmV0dXJuIGFycmF5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVEYXRhUkxFKGJ1ZmZlcjogVWludDhBcnJheSwgeyBkYXRhIH06IFBpeGVsRGF0YSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG9mZnNldHM6IG51bWJlcltdKSB7XG5cdGlmICghd2lkdGggfHwgIWhlaWdodClcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXG5cdGNvbnN0IHN0cmlkZSA9ICg0ICogd2lkdGgpIHwgMDtcblxuXHRsZXQgb2wgPSAwO1xuXHRsZXQgbyA9IChvZmZzZXRzLmxlbmd0aCAqIDIgKiBoZWlnaHQpIHwgMDtcblxuXHRmb3IgKGNvbnN0IG9mZnNldCBvZiBvZmZzZXRzKSB7XG5cdFx0Zm9yIChsZXQgeSA9IDAsIHAgPSBvZmZzZXQgfCAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcblx0XHRcdGNvbnN0IHN0cmlkZVN0YXJ0ID0gKHkgKiBzdHJpZGUpIHwgMDtcblx0XHRcdGNvbnN0IHN0cmlkZUVuZCA9IChzdHJpZGVTdGFydCArIHN0cmlkZSkgfCAwO1xuXHRcdFx0Y29uc3QgbGFzdEluZGV4ID0gKHN0cmlkZUVuZCArIG9mZnNldCAtIDQpIHwgMDtcblx0XHRcdGNvbnN0IGxhc3RJbmRleDIgPSAobGFzdEluZGV4IC0gNCkgfCAwO1xuXHRcdFx0Y29uc3Qgc3RhcnRPZmZzZXQgPSBvO1xuXG5cdFx0XHRmb3IgKHAgPSAoc3RyaWRlU3RhcnQgKyBvZmZzZXQpIHwgMDsgcCA8IHN0cmlkZUVuZDsgcCA9IChwICsgNCkgfCAwKSB7XG5cdFx0XHRcdGlmIChwIDwgbGFzdEluZGV4Mikge1xuXHRcdFx0XHRcdGxldCB2YWx1ZTEgPSBkYXRhW3BdO1xuXHRcdFx0XHRcdHAgPSAocCArIDQpIHwgMDtcblx0XHRcdFx0XHRsZXQgdmFsdWUyID0gZGF0YVtwXTtcblx0XHRcdFx0XHRwID0gKHAgKyA0KSB8IDA7XG5cdFx0XHRcdFx0bGV0IHZhbHVlMyA9IGRhdGFbcF07XG5cblx0XHRcdFx0XHRpZiAodmFsdWUxID09PSB2YWx1ZTIgJiYgdmFsdWUxID09PSB2YWx1ZTMpIHtcblx0XHRcdFx0XHRcdGxldCBjb3VudCA9IDM7XG5cblx0XHRcdFx0XHRcdHdoaWxlIChjb3VudCA8IDEyOCAmJiBwIDwgbGFzdEluZGV4ICYmIGRhdGFbKHAgKyA0KSB8IDBdID09PSB2YWx1ZTEpIHtcblx0XHRcdFx0XHRcdFx0Y291bnQgPSAoY291bnQgKyAxKSB8IDA7XG5cdFx0XHRcdFx0XHRcdHAgPSAocCArIDQpIHwgMDtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0YnVmZmVyW28rK10gPSAxIC0gY291bnQ7XG5cdFx0XHRcdFx0XHRidWZmZXJbbysrXSA9IHZhbHVlMTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgY291bnRJbmRleCA9IG87XG5cdFx0XHRcdFx0XHRsZXQgd3JpdGVMYXN0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGxldCBjb3VudCA9IDE7XG5cdFx0XHRcdFx0XHRidWZmZXJbbysrXSA9IDA7XG5cdFx0XHRcdFx0XHRidWZmZXJbbysrXSA9IHZhbHVlMTtcblxuXHRcdFx0XHRcdFx0d2hpbGUgKHAgPCBsYXN0SW5kZXggJiYgY291bnQgPCAxMjgpIHtcblx0XHRcdFx0XHRcdFx0cCA9IChwICsgNCkgfCAwO1xuXHRcdFx0XHRcdFx0XHR2YWx1ZTEgPSB2YWx1ZTI7XG5cdFx0XHRcdFx0XHRcdHZhbHVlMiA9IHZhbHVlMztcblx0XHRcdFx0XHRcdFx0dmFsdWUzID0gZGF0YVtwXTtcblxuXHRcdFx0XHRcdFx0XHRpZiAodmFsdWUxID09PSB2YWx1ZTIgJiYgdmFsdWUxID09PSB2YWx1ZTMpIHtcblx0XHRcdFx0XHRcdFx0XHRwID0gKHAgLSAxMikgfCAwO1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlTGFzdCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGNvdW50Kys7XG5cdFx0XHRcdFx0XHRcdFx0YnVmZmVyW28rK10gPSB2YWx1ZTE7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKHdyaXRlTGFzdCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoY291bnQgPCAxMjcpIHtcblx0XHRcdFx0XHRcdFx0XHRidWZmZXJbbysrXSA9IHZhbHVlMjtcblx0XHRcdFx0XHRcdFx0XHRidWZmZXJbbysrXSA9IHZhbHVlMztcblx0XHRcdFx0XHRcdFx0XHRjb3VudCArPSAyO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGNvdW50IDwgMTI4KSB7XG5cdFx0XHRcdFx0XHRcdFx0YnVmZmVyW28rK10gPSB2YWx1ZTI7XG5cdFx0XHRcdFx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0XHRcdFx0XHRwID0gKHAgLSA0KSB8IDA7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0cCA9IChwIC0gOCkgfCAwO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGJ1ZmZlcltjb3VudEluZGV4XSA9IGNvdW50IC0gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAocCA9PT0gbGFzdEluZGV4KSB7XG5cdFx0XHRcdFx0YnVmZmVyW28rK10gPSAwO1xuXHRcdFx0XHRcdGJ1ZmZlcltvKytdID0gZGF0YVtwXTtcblx0XHRcdFx0fSBlbHNlIHsgLy8gcCA9PT0gbGFzdEluZGV4MlxuXHRcdFx0XHRcdGJ1ZmZlcltvKytdID0gMTtcblx0XHRcdFx0XHRidWZmZXJbbysrXSA9IGRhdGFbcF07XG5cdFx0XHRcdFx0cCA9IChwICsgNCkgfCAwO1xuXHRcdFx0XHRcdGJ1ZmZlcltvKytdID0gZGF0YVtwXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBsZW5ndGggPSBvIC0gc3RhcnRPZmZzZXQ7XG5cdFx0XHRidWZmZXJbb2wrK10gPSAobGVuZ3RoID4+IDgpICYgMHhmZjtcblx0XHRcdGJ1ZmZlcltvbCsrXSA9IGxlbmd0aCAmIDB4ZmY7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGJ1ZmZlci5zbGljZSgwLCBvKTtcbn1cblxuXG4vKipcbiAqIEFzIHBlciB0aGUgQWRvYmUgZmlsZSBmb3JtYXQsIHpsaWIgY29tcHJlc3MgZWFjaCBjaGFubmVsIHNlcGFyYXRlbHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlRGF0YVppcChidWZmZXI6IFVpbnQ4QXJyYXksIHBkOiBQaXhlbERhdGEsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBvZmZzZXRzOiBudW1iZXJbXSkge1xuXHRpZiAoIXdpZHRoIHx8ICFoZWlnaHQpXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblxuXHRjb25zdCB7IGRhdGEgfSA9IHBkO1xuXHRjb25zdCBzaXplID0gd2lkdGggKiBoZWlnaHQ7XG5cblx0Ly8gVE9ETyhqc3IpOiB0aGlzIGRvZXNuJ3Qgd29yayBpZiBtb3JlIHRoYW4gb25lIG9mZmVzdCBpcyBwYXNzZWRcblx0aWYgKG9mZnNldHMubGVuZ3RoID4gMSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignWmlwcGluZyBtdWx0aXBsZSBjaGFubmVscyBpcyBub3Qgc3VwcG9ydGVkJyk7XG5cdH1cblxuXHQvLyBOT1RFIHRoaXMgZml4ZXMgdGhlIHBhY2tpbmcgb3JkZXIsIHNvIGlmIHlvdSBwYXNzZWQgb2Zmc2V0cyA9IFsxLDAsMiwzXSBpdCB3aWxsIGZsaXAgY2hhbm5lbHNcblx0Zm9yIChsZXQgcGxhbmUgPSAwOyBwbGFuZSA8IG9mZnNldHMubGVuZ3RoOyBwbGFuZSsrKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcblx0XHRcdGJ1ZmZlcltpICsgcGxhbmUgKiBzaXplXSA9IGRhdGFbaSAqIDQgKyBvZmZzZXRzW3BsYW5lXV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHBha28uZGVmbGF0ZShidWZmZXIuc2xpY2UoMCwgc2l6ZSAqIG9mZnNldHMubGVuZ3RoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZURhdGFaaXBQcmVkaWN0aW9uKGJ1ZmZlcjogVWludDhBcnJheSwgeyBkYXRhIH06IFBpeGVsRGF0YSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG9mZnNldHM6IG51bWJlcltdKSB7XG5cdGlmICghd2lkdGggfHwgIWhlaWdodClcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXG5cdGNvbnNvbGUubG9nKGJ1ZmZlciwgZGF0YSwgb2Zmc2V0cyk7XG5cblx0dGhyb3cgbmV3IEVycm9yKCdaaXAgd2l0aCBwcmVkaWN0aW9uIGNvbXByZXNzaW9uIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBsZXQgY3JlYXRlQ2FudmFzOiAod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpID0+IEhUTUxDYW52YXNFbGVtZW50ID0gKCkgPT4ge1xuXHR0aHJvdyBuZXcgRXJyb3IoJ0NhbnZhcyBub3QgaW5pdGlhbGl6ZWQsIHVzZSBpbml0aWFsaXplQ2FudmFzIG1ldGhvZCB0byBzZXQgdXAgY3JlYXRlQ2FudmFzIG1ldGhvZCcpO1xufTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBsZXQgY3JlYXRlQ2FudmFzRnJvbURhdGE6IChkYXRhOiBVaW50OEFycmF5KSA9PiBIVE1MQ2FudmFzRWxlbWVudCA9ICgpID0+IHtcblx0dGhyb3cgbmV3IEVycm9yKCdDYW52YXMgbm90IGluaXRpYWxpemVkLCB1c2UgaW5pdGlhbGl6ZUNhbnZhcyBtZXRob2QgdG8gc2V0IHVwIGNyZWF0ZUNhbnZhc0Zyb21EYXRhIG1ldGhvZCcpO1xufTtcblxubGV0IHRlbXBDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG5leHBvcnQgbGV0IGNyZWF0ZUltYWdlRGF0YTogKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSA9PiBJbWFnZURhdGEgPSAod2lkdGgsIGhlaWdodCkgPT4ge1xuXHRpZiAoIXRlbXBDYW52YXMpIHRlbXBDYW52YXMgPSBjcmVhdGVDYW52YXMoMSwgMSk7XG5cdHJldHVybiB0ZW1wQ2FudmFzLmdldENvbnRleHQoJzJkJykhLmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbn07XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0Y3JlYXRlQ2FudmFzID0gKHdpZHRoLCBoZWlnaHQpID0+IHtcblx0XHRjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0XHRjYW52YXMud2lkdGggPSB3aWR0aDtcblx0XHRjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXHRcdHJldHVybiBjYW52YXM7XG5cdH07XG5cblx0Y3JlYXRlQ2FudmFzRnJvbURhdGEgPSAoZGF0YSkgPT4ge1xuXHRcdGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XG5cdFx0aW1hZ2Uuc3JjID0gJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJyArIGZyb21CeXRlQXJyYXkoZGF0YSk7XG5cdFx0Y29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdFx0Y2FudmFzLndpZHRoID0gaW1hZ2Uud2lkdGg7XG5cdFx0Y2FudmFzLmhlaWdodCA9IGltYWdlLmhlaWdodDtcblx0XHRjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSEuZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcblx0XHRyZXR1cm4gY2FudmFzO1xuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZUNhbnZhcyhcblx0Y3JlYXRlQ2FudmFzTWV0aG9kOiAod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpID0+IEhUTUxDYW52YXNFbGVtZW50LFxuXHRjcmVhdGVDYW52YXNGcm9tRGF0YU1ldGhvZD86IChkYXRhOiBVaW50OEFycmF5KSA9PiBIVE1MQ2FudmFzRWxlbWVudCxcblx0Y3JlYXRlSW1hZ2VEYXRhTWV0aG9kPzogKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSA9PiBJbWFnZURhdGFcbikge1xuXHRjcmVhdGVDYW52YXMgPSBjcmVhdGVDYW52YXNNZXRob2Q7XG5cdGNyZWF0ZUNhbnZhc0Zyb21EYXRhID0gY3JlYXRlQ2FudmFzRnJvbURhdGFNZXRob2QgfHwgY3JlYXRlQ2FudmFzRnJvbURhdGE7XG5cdGNyZWF0ZUltYWdlRGF0YSA9IGNyZWF0ZUltYWdlRGF0YU1ldGhvZCB8fCBjcmVhdGVJbWFnZURhdGE7XG59XG4iXSwic291cmNlUm9vdCI6Ii9Vc2Vycy9qb2VyYWlpL2Rldi9hZy1wc2Qvc3JjIn0=
