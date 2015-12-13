/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

var expect = require("chai").expect;

var Transform = require("../index.js");

// For floating point tests
var TOLERANCE = 0.001;

describe("Transform", function () {
  it("should give the right matrix for translate", function () {
    expect(Transform.translate(1, 2)).to.deep.equal([1, 0, 0, 1, 1, 2]);
  });

  it("should give the right matrix for rotate", function () {
    var m = Transform.rotate(2 * Math.PI / 3);
    var rt3 = Math.sqrt(3);
    expect(m[0]).to.be.closeTo(-0.5, TOLERANCE);
    expect(m[1]).to.be.closeTo(rt3/2, TOLERANCE);
    expect(m[2]).to.be.closeTo(-rt3/2, TOLERANCE);
    expect(m[3]).to.be.closeTo(-0.5, TOLERANCE);
  });

  it("should give the right matrix for scale", function () {
    expect(Transform.scale(2, 3)).to.deep.equal([2, 0, 0, 3, 0, 0]);
  });

  it("should give the right matrix for transform", function () {
    expect(Transform.transform(1, 2, 3, 4, 5, 6))
      .to.deep.equal([1, 2, 3, 4, 5, 6]);
  });

  it("should multiply matrices correctly", function () {
    var m1 = [1, 2, 3, 4, 5, 6];
    var m2 = [1, 2, 4, 8, 16, 32];
    var expected = [7, 10, 28, 40, 117, 166];
    expect(Transform.multiply(m1, m2)).to.deep.equal(expected);
  });

  describe("process", function () {
    var m;

    beforeEach(function () {
      m = [1, 2, 3, 4, 5, 6];
    });

    it("should handle resetTransform properly", function () {
      expect(Transform.process(m, "resetTransform"))
        .to.deep.equal([1, 0, 0, 1, 0, 0]);
    });

    it("should handle setTransform properly", function () {
      expect(Transform.process(m, "setTransform", [7, 8, 9, 10, 11, 12]))
        .to.deep.equal([7, 8, 9, 10, 11, 12]);
    });

    it("should handle translate properly", function () {
      var expected = Transform.multiply(m, Transform.translate(4, 8));
      expect(Transform.process(m, "translate", [4, 8])).to.deep.equal(expected);
    });

    it("should handle rotate properly", function () {
      var expected = Transform.multiply(m, Transform.rotate(10));
      expect(Transform.process(m, "rotate", [10])).to.deep.equal(expected);
    });

    it("should handle scale properly", function () {
      var expected = Transform.multiply(m, Transform.scale(3, 2));
      expect(Transform.process(m, "scale", [3, 2])).to.deep.equal(expected);
    });

    it("should handle transform properly", function () {
      var expected = Transform.multiply(
        m, Transform.transform(7, 8, 9, 10, 11, 12)
      );
      expect(Transform.process(m, "transform", [7, 8, 9, 10, 11, 12]))
        .to.deep.equal(expected);
    });
  });

  describe("augmentContext", function () {
    // Will be an array of {name, args} objects describing all calls made to
    // the fakeContext object.
    var contextCommands;

    var makeSpyMethod = function (name) {
      return function () {
        var argsArray = Array.prototype.slice.call(arguments);
        contextCommands.push({name: name, args: argsArray});
      };
    };
    var fakeContext;

    // Note that beforeEach runs augmentContext (the method under test).
    beforeEach(function () {
      contextCommands = [];
      fakeContext = {
        canvas: {},
        save: makeSpyMethod("save"),
        restore: makeSpyMethod("restore"),
        translate: makeSpyMethod("translate"),
        scale: makeSpyMethod("scale"),
        rotate: makeSpyMethod("rotate"),
        transform: makeSpyMethod("transform"),
        setTransform: makeSpyMethod("setTransform"),
        resetTransform: makeSpyMethod("resetTransform"),
      };
      Transform.augmentContext(fakeContext);
    });

    it("should throw when passed a non-context", function () {
      expect(function () {
        Transform.augmentContext(null);
      }, "null").to.throw(Error);
      expect(function () {
        Transform.augmentContext({});
      }, "{}").to.throw(Error);
    });

    it("should do nothing when the context has getTransform", function () {
      var fakeGetTransform = function () {};
      var anotherFakeContext = {
        canvas: {},
        getTransform: fakeGetTransform,
      };
      Transform.augmentContext(anotherFakeContext);
      expect(anotherFakeContext.getTransform).to.equal(fakeGetTransform);
      expect(anotherFakeContext.save).to.not.exist;
    });

    it("should add a getTransform method returning a matrix", function () {
      expect(fakeContext.getTransform()).to.deep.equal([1, 0, 0, 1, 0, 0]);
    });

    it("should pass through calls to transformation methods", function () {
      fakeContext.save(1, 2);
      fakeContext.restore(3, 4);
      fakeContext.translate(5, 6);
      fakeContext.scale(7, 8);
      fakeContext.rotate(9, 10);
      fakeContext.transform(11, 12);
      fakeContext.setTransform(13, 14);
      fakeContext.resetTransform(15, 16);
      expect(contextCommands).to.deep.equal([
        {name: "save", args: [1, 2]},
        {name: "restore", args: [3, 4]},
        {name: "translate", args: [5, 6]},
        {name: "scale", args: [7, 8]},
        {name: "rotate", args: [9, 10]},
        {name: "transform", args: [11, 12]},
        {name: "setTransform", args: [13, 14]},
        {name: "resetTransform", args: [15, 16]},
      ]);
    });

    it("should return the right values for getTransform", function () {
      fakeContext.translate(1, 2);
      expect(fakeContext.getTransform(), "translate")
        .to.deep.equal([1, 0, 0, 1, 1, 2]);

      fakeContext.scale(2, 2);
      expect(fakeContext.getTransform(), "scale")
        .to.deep.equal([2, 0, 0, 2, 1, 2]);

      fakeContext.save();
      expect(fakeContext.getTransform(), "save")
        .to.deep.equal([2, 0, 0, 2, 1, 2]);

      fakeContext.rotate(Math.PI / 2);
      (function () {
        var m = fakeContext.getTransform();
        expect(m[0], "rotate a").to.be.closeTo(0, TOLERANCE);
        expect(m[1], "rotate b").to.be.closeTo(2, TOLERANCE);
        expect(m[2], "rotate c").to.be.closeTo(-2, TOLERANCE);
        expect(m[3], "rotate d").to.be.closeTo(0, TOLERANCE);
        expect(m[4], "rotate e").to.be.closeTo(1, TOLERANCE);
        expect(m[5], "rotate f").to.be.closeTo(2, TOLERANCE);
      }());

      fakeContext.restore();
      expect(fakeContext.getTransform(), "restore")
        .to.deep.equal([2, 0, 0, 2, 1, 2]);

      fakeContext.transform(0, 1, 1, 0, 0, 0); // Transpose
      expect(fakeContext.getTransform(), "restore")
        .to.deep.equal([0, 2, 2, 0, 1, 2]);

      fakeContext.setTransform(1, 2, 3, 4, 5, 6);
      expect(fakeContext.getTransform(), "setTransform")
        .to.deep.equal([1, 2, 3, 4, 5, 6]);

      fakeContext.resetTransform();
      expect(fakeContext.getTransform(), "resetTransform")
        .to.deep.equal([1, 0, 0, 1, 0, 0]);
    });
  });
});
