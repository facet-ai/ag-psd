"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var helpers_1 = require("../helpers");
var psdReader_1 = require("../psdReader");
var common_1 = require("./common");
function toData(data) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        result.push(data[i], data[i], data[i], data[i]);
    }
    return new Uint8Array(result);
}
function fromData(data) {
    var result = [];
    for (var i = 0; i < data.length; i += 4) {
        result.push(data[i]);
    }
    return result;
}
describe('helpers', function () {
    describe('writeDataRaw()', function () {
        it('returns undefined for 0 size', function () {
            chai_1.expect(helpers_1.writeDataRaw({}, 0, 0, 0)).undefined;
            chai_1.expect(helpers_1.writeDataRaw({}, 0, 0, 100)).undefined;
            chai_1.expect(helpers_1.writeDataRaw({}, 0, 100, 0)).undefined;
        });
        it('writes data', function () {
            helpers_1.writeDataRaw({ data: new Uint8ClampedArray(16 * 16 * 4), width: 16, height: 16 }, 0, 16, 16);
        });
    });
    describe('writeDataRLE()', function () {
        it('returns undefined for 0 size', function () {
            chai_1.expect(helpers_1.writeDataRLE(new Uint8Array(1), {}, 0, 0, [0])).undefined;
            chai_1.expect(helpers_1.writeDataRLE(new Uint8Array(1), {}, 0, 100, [0])).undefined;
            chai_1.expect(helpers_1.writeDataRLE(new Uint8Array(1), {}, 100, 0, [0])).undefined;
        });
        var rleTests = [
            { name: '1', width: 1, height: 1, data: [1] },
            { name: '1 1', width: 2, height: 1, data: [1, 1] },
            { name: '1 2', width: 2, height: 1, data: [1, 2] },
            { name: '3 x 1', width: 3, height: 1, data: [1, 1, 1] },
            { name: '1 2 3', width: 3, height: 1, data: [1, 2, 3] },
            { name: '1 1 1 3 2 1', width: 6, height: 1, data: [1, 1, 1, 3, 2, 1] },
            { name: '1 2 3 1 1 1', width: 6, height: 1, data: [1, 2, 3, 1, 1, 1] },
            { name: '1 1 1 1 1 0', width: 6, height: 1, data: [1, 1, 1, 1, 1, 0] },
            { name: '3x2 1 1 1 3 2 1', width: 3, height: 2, data: [1, 1, 1, 3, 2, 1] },
            { name: '3x2 1 2 3 1 1 1', width: 3, height: 2, data: [1, 2, 3, 1, 1, 1] },
            { name: '3x3 1 1 1 1 2 2 2 1 1', width: 3, height: 3, data: [1, 1, 1, 1, 2, 2, 2, 1, 1] },
            { name: '3x3 upper range', width: 3, height: 3, data: [255, 255, 255, 254, 254, 254, 1, 1, 0] },
            { name: '128 x 1', width: 128, height: 1, data: common_1.repeat(128, 1) },
            { name: '130 x 1', width: 130, height: 1, data: common_1.repeat(130, 1) },
            { name: '130 x 1 2', width: 130, height: 1, data: common_1.repeat(130 / 2, 1, 2) },
            { name: '150 x 1', width: 150, height: 1, data: common_1.repeat(150, 1) },
            { name: '100 x 1', width: 200, height: 1, data: common_1.repeat(200, 1) },
            { name: '300 x 1', width: 300, height: 1, data: common_1.repeat(300, 1) },
            { name: '500 x 1', width: 500, height: 1, data: common_1.repeat(500, 1) },
            { name: '100x5 only 1', width: 100, height: 5, data: common_1.repeat(5 * 100, 1) },
            {
                name: 'large list of 1s with some random numbers in it', width: 100, height: 5,
                data: __spreadArrays(common_1.repeat(10, 1), [
                    3, 3, 3
                ], common_1.repeat(164, 1), [
                    3
                ], common_1.repeat(9, 1), [
                    5
                ], common_1.repeat(5, 1), [
                    3, 3, 3
                ], common_1.repeat(304, 1))
            },
            {
                name: 'smal batch in sea of 0s', width: 146, height: 1,
                data: __spreadArrays(common_1.repeat(50, 0), [
                    1, 13, 30, 42, 54, 64, 72, 77, 82, 86, 89, 90, 93, 94, 94, 95, 95, 95, 96, 96, 96, 96, 95, 95, 95, 94,
                    93, 92, 91, 89, 87, 84, 82, 80, 76, 72, 67, 62, 57, 49, 42, 34, 26, 19, 12, 5
                ], common_1.repeat(50, 0))
            },
            {
                name: 'from broken psd', width: 141, height: 1, data: [
                    237, 234, 233, 233, 233, 232, 233, 236, 238, 239, 239, 240, 241, 241, 238, 220, 217, 217, 215, 212,
                    205, 201, 203, 207, 208, 210, 218, 226, 234, 236, 236, 238, 240, 234, 228, 208, 180, 163, 178, 189,
                    205, 218, 219, 214, 214, 213, 205, 181, 171, 154, 132, 133, 163, 177, 179, 173, 76, 122, 168, 174,
                    143, 116, 117, 133, 181, 130, 172, 190, 159, 4, 0, 45, 179, 190, 177, 167, 18, 44, 110, 174, 212,
                    223, 229, 228, 213, 210, 170, 88, 200, 222, 210, 152, 152, 151, 190, 198, 210, 179, 183, 188, 189,
                    189, 187, 187, 186, 186, 184, 193, 213, 222, 229, 232, 231, 228, 229, 233, 237, 240, 240, 238, 236,
                    231, 226, 228, 230, 229, 222, 211, 201, 193, 189, 187, 186, 186, 186, 185, 184, 184, 186, 193, 198,
                ]
            },
            { name: '127 different + 3 repeated', width: 127 + 3, height: 1, data: __spreadArrays(common_1.range(0, 127), [1, 1, 1]) },
        ];
        rleTests.forEach(function (_a) {
            var width = _a.width, height = _a.height, data = _a.data, name = _a.name;
            it("correctly writes & reads RLE image (" + name + ")", function () {
                if ((width * height) !== data.length) {
                    throw new Error("Invalid image data size " + width * height + " !== " + data.length);
                }
                var array;
                var result;
                try {
                    var input = { width: width, height: height, data: toData(data) };
                    var output = { width: width, height: height, data: new Uint8Array(width * height * 4) };
                    var buffer = new Uint8Array(16 * 1024 * 1024);
                    array = helpers_1.writeDataRLE(buffer, input, width, height, [0]);
                    var reader = psdReader_1.createReader(array.buffer);
                    psdReader_1.readDataRLE(reader, output, width, height, 4, [0]);
                    result = fromData(output.data);
                }
                catch (e) {
                    throw new Error("Error for image: [" + array + "] " + e.stack);
                }
                chai_1.expect(result, "image: [" + array + "]").eql(data);
            });
        });
    });
    describe('offsetForChannel()', function () {
        it('returns offset for other channelId', function () {
            chai_1.expect(helpers_1.offsetForChannel(10)).equal(11);
        });
    });
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzdDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ2xELEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ2xELEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUN2RCxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDdkQsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ3RFLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUN0RSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDdEUsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDMUUsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDMUUsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDekYsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDL0YsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUNoRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ2hFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUN6RSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ2hFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDaEUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUNoRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ2hFLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ3pFO2dCQUNDLElBQUksRUFBRSxpREFBaUQsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDO2dCQUFFLElBQUksaUJBQ2hGLGVBQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzttQkFBSyxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFBRSxDQUFDO21CQUFLLGVBQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUFFLENBQUM7bUJBQUssZUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO21CQUFLLGVBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQ2hIO2FBQ0Q7WUFDRDtnQkFDQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQztnQkFBRSxJQUFJLGlCQUN4RCxlQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDaEIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7b0JBQ3JHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO21CQUMxRSxlQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUNoQjthQUNEO1lBQ0Q7Z0JBQ0MsSUFBSSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUU7b0JBQ3JELEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO29CQUNsRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztvQkFDbEcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7b0JBQ2pHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztvQkFD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LFVBQUssQ0FBQyxDQUFDLEtBQU8sQ0FBQyxDQUFDO2lCQUMxRDtnQkFFRCxhQUFNLENBQUMsTUFBTSxFQUFFLGFBQVcsS0FBSyxNQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0MsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLG9CQUFvQixFQUFFO1FBQzlCLEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRTtZQUN4QyxhQUFNLENBQUMsMEJBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InRlc3QvaGVscGVycy5zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQgeyB3cml0ZURhdGFSYXcsIG9mZnNldEZvckNoYW5uZWwsIFBpeGVsRGF0YSwgUGl4ZWxBcnJheSwgd3JpdGVEYXRhUkxFIH0gZnJvbSAnLi4vaGVscGVycyc7XG5pbXBvcnQgeyBjcmVhdGVSZWFkZXIsIHJlYWREYXRhUkxFIH0gZnJvbSAnLi4vcHNkUmVhZGVyJztcbmltcG9ydCB7IHJhbmdlLCByZXBlYXQgfSBmcm9tICcuL2NvbW1vbic7XG5cbmZ1bmN0aW9uIHRvRGF0YShkYXRhOiBudW1iZXJbXSkge1xuXHRjb25zdCByZXN1bHQ6IG51bWJlcltdID0gW107XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0cmVzdWx0LnB1c2goZGF0YVtpXSwgZGF0YVtpXSwgZGF0YVtpXSwgZGF0YVtpXSk7XG5cdH1cblxuXHRyZXR1cm4gbmV3IFVpbnQ4QXJyYXkocmVzdWx0KTtcbn1cblxuZnVuY3Rpb24gZnJvbURhdGEoZGF0YTogUGl4ZWxBcnJheSkge1xuXHRjb25zdCByZXN1bHQ6IG51bWJlcltdID0gW107XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSArPSA0KSB7XG5cdFx0cmVzdWx0LnB1c2goZGF0YVtpXSk7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5kZXNjcmliZSgnaGVscGVycycsICgpID0+IHtcblx0ZGVzY3JpYmUoJ3dyaXRlRGF0YVJhdygpJywgKCkgPT4ge1xuXHRcdGl0KCdyZXR1cm5zIHVuZGVmaW5lZCBmb3IgMCBzaXplJywgKCkgPT4ge1xuXHRcdFx0ZXhwZWN0KHdyaXRlRGF0YVJhdyh7fSBhcyBhbnksIDAsIDAsIDApKS51bmRlZmluZWQ7XG5cdFx0XHRleHBlY3Qod3JpdGVEYXRhUmF3KHt9IGFzIGFueSwgMCwgMCwgMTAwKSkudW5kZWZpbmVkO1xuXHRcdFx0ZXhwZWN0KHdyaXRlRGF0YVJhdyh7fSBhcyBhbnksIDAsIDEwMCwgMCkpLnVuZGVmaW5lZDtcblx0XHR9KTtcblxuXHRcdGl0KCd3cml0ZXMgZGF0YScsICgpID0+IHtcblx0XHRcdHdyaXRlRGF0YVJhdyh7IGRhdGE6IG5ldyBVaW50OENsYW1wZWRBcnJheSgxNiAqIDE2ICogNCksIHdpZHRoOiAxNiwgaGVpZ2h0OiAxNiB9LCAwLCAxNiwgMTYpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRkZXNjcmliZSgnd3JpdGVEYXRhUkxFKCknLCAoKSA9PiB7XG5cdFx0aXQoJ3JldHVybnMgdW5kZWZpbmVkIGZvciAwIHNpemUnLCAoKSA9PiB7XG5cdFx0XHRleHBlY3Qod3JpdGVEYXRhUkxFKG5ldyBVaW50OEFycmF5KDEpLCB7fSBhcyBhbnksIDAsIDAsIFswXSkpLnVuZGVmaW5lZDtcblx0XHRcdGV4cGVjdCh3cml0ZURhdGFSTEUobmV3IFVpbnQ4QXJyYXkoMSksIHt9IGFzIGFueSwgMCwgMTAwLCBbMF0pKS51bmRlZmluZWQ7XG5cdFx0XHRleHBlY3Qod3JpdGVEYXRhUkxFKG5ldyBVaW50OEFycmF5KDEpLCB7fSBhcyBhbnksIDEwMCwgMCwgWzBdKSkudW5kZWZpbmVkO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgcmxlVGVzdHM6IHsgbmFtZTogc3RyaW5nOyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlcjsgZGF0YTogbnVtYmVyW107IH1bXSA9IFtcblx0XHRcdHsgbmFtZTogJzEnLCB3aWR0aDogMSwgaGVpZ2h0OiAxLCBkYXRhOiBbMV0gfSxcblx0XHRcdHsgbmFtZTogJzEgMScsIHdpZHRoOiAyLCBoZWlnaHQ6IDEsIGRhdGE6IFsxLCAxXSB9LFxuXHRcdFx0eyBuYW1lOiAnMSAyJywgd2lkdGg6IDIsIGhlaWdodDogMSwgZGF0YTogWzEsIDJdIH0sXG5cdFx0XHR7IG5hbWU6ICczIHggMScsIHdpZHRoOiAzLCBoZWlnaHQ6IDEsIGRhdGE6IFsxLCAxLCAxXSB9LFxuXHRcdFx0eyBuYW1lOiAnMSAyIDMnLCB3aWR0aDogMywgaGVpZ2h0OiAxLCBkYXRhOiBbMSwgMiwgM10gfSxcblx0XHRcdHsgbmFtZTogJzEgMSAxIDMgMiAxJywgd2lkdGg6IDYsIGhlaWdodDogMSwgZGF0YTogWzEsIDEsIDEsIDMsIDIsIDFdIH0sXG5cdFx0XHR7IG5hbWU6ICcxIDIgMyAxIDEgMScsIHdpZHRoOiA2LCBoZWlnaHQ6IDEsIGRhdGE6IFsxLCAyLCAzLCAxLCAxLCAxXSB9LFxuXHRcdFx0eyBuYW1lOiAnMSAxIDEgMSAxIDAnLCB3aWR0aDogNiwgaGVpZ2h0OiAxLCBkYXRhOiBbMSwgMSwgMSwgMSwgMSwgMF0gfSxcblx0XHRcdHsgbmFtZTogJzN4MiAxIDEgMSAzIDIgMScsIHdpZHRoOiAzLCBoZWlnaHQ6IDIsIGRhdGE6IFsxLCAxLCAxLCAzLCAyLCAxXSB9LFxuXHRcdFx0eyBuYW1lOiAnM3gyIDEgMiAzIDEgMSAxJywgd2lkdGg6IDMsIGhlaWdodDogMiwgZGF0YTogWzEsIDIsIDMsIDEsIDEsIDFdIH0sXG5cdFx0XHR7IG5hbWU6ICczeDMgMSAxIDEgMSAyIDIgMiAxIDEnLCB3aWR0aDogMywgaGVpZ2h0OiAzLCBkYXRhOiBbMSwgMSwgMSwgMSwgMiwgMiwgMiwgMSwgMV0gfSxcblx0XHRcdHsgbmFtZTogJzN4MyB1cHBlciByYW5nZScsIHdpZHRoOiAzLCBoZWlnaHQ6IDMsIGRhdGE6IFsyNTUsIDI1NSwgMjU1LCAyNTQsIDI1NCwgMjU0LCAxLCAxLCAwXSB9LFxuXHRcdFx0eyBuYW1lOiAnMTI4IHggMScsIHdpZHRoOiAxMjgsIGhlaWdodDogMSwgZGF0YTogcmVwZWF0KDEyOCwgMSkgfSxcblx0XHRcdHsgbmFtZTogJzEzMCB4IDEnLCB3aWR0aDogMTMwLCBoZWlnaHQ6IDEsIGRhdGE6IHJlcGVhdCgxMzAsIDEpIH0sXG5cdFx0XHR7IG5hbWU6ICcxMzAgeCAxIDInLCB3aWR0aDogMTMwLCBoZWlnaHQ6IDEsIGRhdGE6IHJlcGVhdCgxMzAgLyAyLCAxLCAyKSB9LFxuXHRcdFx0eyBuYW1lOiAnMTUwIHggMScsIHdpZHRoOiAxNTAsIGhlaWdodDogMSwgZGF0YTogcmVwZWF0KDE1MCwgMSkgfSxcblx0XHRcdHsgbmFtZTogJzEwMCB4IDEnLCB3aWR0aDogMjAwLCBoZWlnaHQ6IDEsIGRhdGE6IHJlcGVhdCgyMDAsIDEpIH0sXG5cdFx0XHR7IG5hbWU6ICczMDAgeCAxJywgd2lkdGg6IDMwMCwgaGVpZ2h0OiAxLCBkYXRhOiByZXBlYXQoMzAwLCAxKSB9LFxuXHRcdFx0eyBuYW1lOiAnNTAwIHggMScsIHdpZHRoOiA1MDAsIGhlaWdodDogMSwgZGF0YTogcmVwZWF0KDUwMCwgMSkgfSxcblx0XHRcdHsgbmFtZTogJzEwMHg1IG9ubHkgMScsIHdpZHRoOiAxMDAsIGhlaWdodDogNSwgZGF0YTogcmVwZWF0KDUgKiAxMDAsIDEpIH0sXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdsYXJnZSBsaXN0IG9mIDFzIHdpdGggc29tZSByYW5kb20gbnVtYmVycyBpbiBpdCcsIHdpZHRoOiAxMDAsIGhlaWdodDogNSwgZGF0YTogW1xuXHRcdFx0XHRcdC4uLnJlcGVhdCgxMCwgMSksIDMsIDMsIDMsIC4uLnJlcGVhdCgxNjQsIDEpLCAzLCAuLi5yZXBlYXQoOSwgMSksIDUsIC4uLnJlcGVhdCg1LCAxKSwgMywgMywgMywgLi4ucmVwZWF0KDMwNCwgMSlcblx0XHRcdFx0XVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogJ3NtYWwgYmF0Y2ggaW4gc2VhIG9mIDBzJywgd2lkdGg6IDE0NiwgaGVpZ2h0OiAxLCBkYXRhOiBbXG5cdFx0XHRcdFx0Li4ucmVwZWF0KDUwLCAwKSxcblx0XHRcdFx0XHQxLCAxMywgMzAsIDQyLCA1NCwgNjQsIDcyLCA3NywgODIsIDg2LCA4OSwgOTAsIDkzLCA5NCwgOTQsIDk1LCA5NSwgOTUsIDk2LCA5NiwgOTYsIDk2LCA5NSwgOTUsIDk1LCA5NCxcblx0XHRcdFx0XHQ5MywgOTIsIDkxLCA4OSwgODcsIDg0LCA4MiwgODAsIDc2LCA3MiwgNjcsIDYyLCA1NywgNDksIDQyLCAzNCwgMjYsIDE5LCAxMiwgNSxcblx0XHRcdFx0XHQuLi5yZXBlYXQoNTAsIDApXG5cdFx0XHRcdF1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6ICdmcm9tIGJyb2tlbiBwc2QnLCB3aWR0aDogMTQxLCBoZWlnaHQ6IDEsIGRhdGE6IFtcblx0XHRcdFx0XHQyMzcsIDIzNCwgMjMzLCAyMzMsIDIzMywgMjMyLCAyMzMsIDIzNiwgMjM4LCAyMzksIDIzOSwgMjQwLCAyNDEsIDI0MSwgMjM4LCAyMjAsIDIxNywgMjE3LCAyMTUsIDIxMixcblx0XHRcdFx0XHQyMDUsIDIwMSwgMjAzLCAyMDcsIDIwOCwgMjEwLCAyMTgsIDIyNiwgMjM0LCAyMzYsIDIzNiwgMjM4LCAyNDAsIDIzNCwgMjI4LCAyMDgsIDE4MCwgMTYzLCAxNzgsIDE4OSxcblx0XHRcdFx0XHQyMDUsIDIxOCwgMjE5LCAyMTQsIDIxNCwgMjEzLCAyMDUsIDE4MSwgMTcxLCAxNTQsIDEzMiwgMTMzLCAxNjMsIDE3NywgMTc5LCAxNzMsIDc2LCAxMjIsIDE2OCwgMTc0LFxuXHRcdFx0XHRcdDE0MywgMTE2LCAxMTcsIDEzMywgMTgxLCAxMzAsIDE3MiwgMTkwLCAxNTksIDQsIDAsIDQ1LCAxNzksIDE5MCwgMTc3LCAxNjcsIDE4LCA0NCwgMTEwLCAxNzQsIDIxMixcblx0XHRcdFx0XHQyMjMsIDIyOSwgMjI4LCAyMTMsIDIxMCwgMTcwLCA4OCwgMjAwLCAyMjIsIDIxMCwgMTUyLCAxNTIsIDE1MSwgMTkwLCAxOTgsIDIxMCwgMTc5LCAxODMsIDE4OCwgMTg5LFxuXHRcdFx0XHRcdDE4OSwgMTg3LCAxODcsIDE4NiwgMTg2LCAxODQsIDE5MywgMjEzLCAyMjIsIDIyOSwgMjMyLCAyMzEsIDIyOCwgMjI5LCAyMzMsIDIzNywgMjQwLCAyNDAsIDIzOCwgMjM2LFxuXHRcdFx0XHRcdDIzMSwgMjI2LCAyMjgsIDIzMCwgMjI5LCAyMjIsIDIxMSwgMjAxLCAxOTMsIDE4OSwgMTg3LCAxODYsIDE4NiwgMTg2LCAxODUsIDE4NCwgMTg0LCAxODYsIDE5MywgMTk4LFxuXHRcdFx0XHRdXG5cdFx0XHR9LFxuXHRcdFx0eyBuYW1lOiAnMTI3IGRpZmZlcmVudCArIDMgcmVwZWF0ZWQnLCB3aWR0aDogMTI3ICsgMywgaGVpZ2h0OiAxLCBkYXRhOiBbLi4ucmFuZ2UoMCwgMTI3KSwgMSwgMSwgMV0gfSxcblx0XHRdO1xuXG5cdFx0cmxlVGVzdHMuZm9yRWFjaCgoeyB3aWR0aCwgaGVpZ2h0LCBkYXRhLCBuYW1lIH0pID0+IHtcblx0XHRcdGl0KGBjb3JyZWN0bHkgd3JpdGVzICYgcmVhZHMgUkxFIGltYWdlICgke25hbWV9KWAsICgpID0+IHtcblx0XHRcdFx0aWYgKCh3aWR0aCAqIGhlaWdodCkgIT09IGRhdGEubGVuZ3RoKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGltYWdlIGRhdGEgc2l6ZSAke3dpZHRoICogaGVpZ2h0fSAhPT0gJHtkYXRhLmxlbmd0aH1gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBhcnJheTogVWludDhBcnJheSB8IHVuZGVmaW5lZDtcblx0XHRcdFx0bGV0IHJlc3VsdDogbnVtYmVyW107XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBpbnB1dDogUGl4ZWxEYXRhID0geyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0LCBkYXRhOiB0b0RhdGEoZGF0YSkgfTtcblx0XHRcdFx0XHRjb25zdCBvdXRwdXQ6IFBpeGVsRGF0YSA9IHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCwgZGF0YTogbmV3IFVpbnQ4QXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KSB9O1xuXG5cdFx0XHRcdFx0Y29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoMTYgKiAxMDI0ICogMTAyNCk7XG5cdFx0XHRcdFx0YXJyYXkgPSB3cml0ZURhdGFSTEUoYnVmZmVyLCBpbnB1dCwgd2lkdGgsIGhlaWdodCwgWzBdKSE7XG5cblx0XHRcdFx0XHRjb25zdCByZWFkZXIgPSBjcmVhdGVSZWFkZXIoYXJyYXkhLmJ1ZmZlcik7XG5cdFx0XHRcdFx0cmVhZERhdGFSTEUocmVhZGVyLCBvdXRwdXQsIHdpZHRoLCBoZWlnaHQsIDQsIFswXSk7XG5cdFx0XHRcdFx0cmVzdWx0ID0gZnJvbURhdGEob3V0cHV0LmRhdGEpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBFcnJvciBmb3IgaW1hZ2U6IFske2FycmF5fV0gJHtlLnN0YWNrfWApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZXhwZWN0KHJlc3VsdCwgYGltYWdlOiBbJHthcnJheX1dYCkuZXFsKGRhdGEpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGRlc2NyaWJlKCdvZmZzZXRGb3JDaGFubmVsKCknLCAoKSA9PiB7XG5cdFx0aXQoJ3JldHVybnMgb2Zmc2V0IGZvciBvdGhlciBjaGFubmVsSWQnLCAoKSA9PiB7XG5cdFx0XHRleHBlY3Qob2Zmc2V0Rm9yQ2hhbm5lbCgxMCkpLmVxdWFsKDExKTtcblx0XHR9KTtcblx0fSk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL1VzZXJzL2pvZXJhaWkvZGV2L2FnLXBzZC9zcmMifQ==
