import { applyFilterFunction } from "./apply-filters-action";
import { assert } from "chai";
import { attributeFilterCondition } from "../../../types";

function doApplyFilter(condition: attributeFilterCondition, argument: any, search: any) {
  return applyFilterFunction({ id: { value: argument } }, null, { condition, filterKey: "id", value: search });
}

function testEmptiness(condition: attributeFilterCondition, assertTrue: boolean) {
  describe(`пустые аргумент и значение должны вернуть ${assertTrue ? "true" : "false"}`, function () {
    if (assertTrue) {
      it("undefined", function () {
        assert.isTrue(doApplyFilter(condition, undefined, undefined));
      });
      it("null", function () {
        assert.isTrue(doApplyFilter(condition, null, null));
      });
      it("пустая строка", function () {
        assert.isTrue(doApplyFilter(condition, "", ""));
      });
    } else {
      it("undefined", function () {
        assert.isFalse(doApplyFilter(condition, undefined, undefined));
      });
      it("null", function () {
        assert.isFalse(doApplyFilter(condition, null, null));
      });
      it("пустая строка", function () {
        assert.isFalse(doApplyFilter(condition, "", ""));
      });
    }
  });
}

describe("applyFilterFunction", function () {
  describe("str-eq", function () {
    describe("атрибут - строка", function () {
      it("одинаковые строки должны дать true", function () {
        assert.isTrue(doApplyFilter("str-eq", "Hello World", "Hello World"));
      });
      it("одинаковые строки, независимо от регистра, должны дать true", function () {
        assert.isTrue(doApplyFilter("str-eq", "Hello World", "hello world"));
      });
      it("неодинаковые строки должны дать false", function () {
        assert.isFalse(doApplyFilter("str-eq", "Hello World", "Hllo Wrld"));
      });
    });
    describe("атрибут - число", function () {
      it("одинаковые значения должны дать true", function () {
        assert.isTrue(doApplyFilter("str-eq", 100, "100"));
      });
      it("неодинаковые значения должны дать false", function () {
        assert.isFalse(doApplyFilter("str-eq", 100, "10"));
      });
    });
    testEmptiness("str-eq", true);
  });

  describe("str-include", function () {
    describe("атрибут - строка", function () {
      describe("должно быть true", function () {
        it("искомое значение в начале строки", function () {
          assert.isTrue(doApplyFilter("str-include", "Hello world", "He"));
        });
        it("искомое значение не в начале строки", function () {
          assert.isTrue(doApplyFilter("str-include", "Hello world", "worl"));
        });
        it("искомое значение в начале строки, регистр должен быть проигнорирован", function () {
          assert.isTrue(doApplyFilter("str-include", "реГистР", "регистр"));
        });
        it("искомое значение не в начале строки, регистр должен быть проигнорирован", function () {
          assert.isTrue(doApplyFilter("str-include", "реГистР", "гИст"));
        });
        it("поиск состоящий из пробела должен быть включен", function () {
          assert.isTrue(doApplyFilter("str-include", "содержится пробел", " "));
        });
      });
      describe("должно быть false", function () {
        it("искомое значение отсутствует в строке", function () {
          assert.isFalse(doApplyFilter("str-include", "Hello world", "kekvs"));
        });
      });
    });
    describe("атрибут - число", function () {
      describe("должно быть true", function () {
        it("искомое значение не в начале строки", function () {
          assert.isTrue(doApplyFilter("str-include", 100500, "5"));
        });
        it("искомое значение в начале строки", function () {
          assert.isTrue(doApplyFilter("str-include", 100500, "1"));
        });
      });
      describe("должно быть false", function () {
        it("искомое значение отсутствует", function () {
          assert.isFalse(doApplyFilter("str-include", 100500, "7"));
          assert.isFalse(doApplyFilter("str-include", 100500, "kekvs"));
        });
      });
    });
    testEmptiness("str-include", true);
  });

  describe("str-not-include", function () {
    describe("атрибут - строка", function () {
      it("искомое значение отсутствует в строке - должно дать true", function () {
        assert.isTrue(doApplyFilter("str-not-include", "Hello world", "Kekvs"));
      });
      it("искомое значение есть в строке - должно дать false", function () {
        assert.isFalse(doApplyFilter("str-not-include", "Hello world", "worl"));
      });
      it("искомое значение есть в строке (вне зависимости от регистра) - должно дать false", function () {
        assert.isFalse(doApplyFilter("str-not-include", "Hello world", "wOrl"));
      });
    });
    describe("атрибут - число", function () {
      it("искомое значение отсутствует в строке - должно дать true", function () {
        assert.isTrue(doApplyFilter("str-not-include", 100500, "7"));
      });
      it("искомое значение есть в строке - должно дать false", function () {
        assert.isFalse(doApplyFilter("str-not-include", 100500, "5"));
      });
    });
    testEmptiness("str-not-include", false);
  });

  describe("num-eq", function () {
    it("одинаковые значения должны дать true", function () {
      assert.isTrue(doApplyFilter("num-eq", "100500", "100500"));
      assert.isTrue(doApplyFilter("num-eq", 100500, "100500"));
      assert.isTrue(doApplyFilter("num-eq", "100500", 100500));
      assert.isTrue(doApplyFilter("num-eq", 100500, 100500));
    });
    it("неодинаковые значения должны дать true", function () {
      assert.isFalse(doApplyFilter("num-eq", "100500", "10050"));
      assert.isFalse(doApplyFilter("num-eq", 100500, "10050"));
      assert.isFalse(doApplyFilter("num-eq", "100500", 10050));
      assert.isFalse(doApplyFilter("num-eq", 100500, 10050));
    });
    it("атрибут и поиск равны, значение больше чем MAX_SAFE_INTEGER, должны дать true", function () {
      assert.isTrue(
        doApplyFilter(
          "num-eq",
          `${Number.MAX_SAFE_INTEGER.toString()}${Number.MAX_SAFE_INTEGER.toString()}`,
          `${Number.MAX_SAFE_INTEGER.toString()}${Number.MAX_SAFE_INTEGER.toString()}`
        )
      );
    });
    it("атрибут и поиск не равны, значение больше чем MAX_SAFE_INTEGER, должны дать false", function () {
      assert.isFalse(doApplyFilter("num-eq", `${Number.MAX_SAFE_INTEGER.toString()}${Number.MAX_SAFE_INTEGER.toString()}`, `${Number.MAX_SAFE_INTEGER.toString()}1`));
    });

    it("атрибут / поиск - не число, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-eq", "не число", "100500"));
      assert.isFalse(doApplyFilter("num-eq", "не число", 100500));
      assert.isFalse(doApplyFilter("num-eq", "100500", "не число"));
      assert.isFalse(doApplyFilter("num-eq", 100500, "не число"));
    });
    testEmptiness("num-eq", false);
  });

  describe("num-gt", function () {
    it("поиск больше атрибута, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-gt", "5", "100500"));
      assert.isFalse(doApplyFilter("num-gt", 5, 100500));
      assert.isFalse(doApplyFilter("num-gt", 5, "100500"));
      assert.isFalse(doApplyFilter("num-gt", "5", 100500));
    });
    it("поиск равен атрибуту, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-gt", "5", "5"));
      assert.isFalse(doApplyFilter("num-gt", 5, 5));
      assert.isFalse(doApplyFilter("num-gt", 5, "5"));
      assert.isFalse(doApplyFilter("num-gt", "5", 5));
    });
    it("поиск меньше атрибута, должно дать true", function () {
      assert.isTrue(doApplyFilter("num-gt", "5", "4"));
      assert.isTrue(doApplyFilter("num-gt", 5, 4));
      assert.isTrue(doApplyFilter("num-gt", 5, "4"));
      assert.isTrue(doApplyFilter("num-gt", "5", 4));
    });
    it("атрибут / поиск - не число, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-gt", "не число", "100500"));
      assert.isFalse(doApplyFilter("num-gt", "не число", 100500));
      assert.isFalse(doApplyFilter("num-gt", "100500", "не число"));
      assert.isFalse(doApplyFilter("num-gt", 100500, "не число"));
    });
    testEmptiness("num-gt", false);
  });

  describe("num-gte", function () {
    it("поиск больше атрибута, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-gte", "5", "100500"));
      assert.isFalse(doApplyFilter("num-gte", 5, 100500));
      assert.isFalse(doApplyFilter("num-gte", 5, "100500"));
      assert.isFalse(doApplyFilter("num-gte", "5", 100500));
    });
    it("поиск равен атрибуту, должно дать true", function () {
      assert.isTrue(doApplyFilter("num-gte", "5", "5"));
      assert.isTrue(doApplyFilter("num-gte", 5, 5));
      assert.isTrue(doApplyFilter("num-gte", 5, "5"));
      assert.isTrue(doApplyFilter("num-gte", "5", 5));
    });
    it("поиск меньше атрибута, должно дать true", function () {
      assert.isTrue(doApplyFilter("num-gte", "5", "4"));
      assert.isTrue(doApplyFilter("num-gte", 5, 4));
      assert.isTrue(doApplyFilter("num-gte", 5, "4"));
      assert.isTrue(doApplyFilter("num-gte", "5", 4));
    });
    it("атрибут / поиск - не число, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-gte", "не число", "100500"));
      assert.isFalse(doApplyFilter("num-gte", "не число", 100500));
      assert.isFalse(doApplyFilter("num-gte", "100500", "не число"));
      assert.isFalse(doApplyFilter("num-gte", 100500, "не число"));
    });
    testEmptiness("num-gte", false);
  });
  describe("num-lt", function () {
    it("поиск больше атрибута, должно дать true", function () {
      assert.isTrue(doApplyFilter("num-lt", "5", "100500"));
      assert.isTrue(doApplyFilter("num-lt", 5, 100500));
      assert.isTrue(doApplyFilter("num-lt", 5, "100500"));
      assert.isTrue(doApplyFilter("num-lt", "5", 100500));
    });
    it("поиск равен атрибуту, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-lt", "5", "5"));
      assert.isFalse(doApplyFilter("num-lt", 5, 5));
      assert.isFalse(doApplyFilter("num-lt", 5, "5"));
      assert.isFalse(doApplyFilter("num-lt", "5", 5));
    });
    it("поиск меньше атрибута, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-lt", "5", "4"));
      assert.isFalse(doApplyFilter("num-lt", 5, 4));
      assert.isFalse(doApplyFilter("num-lt", 5, "4"));
      assert.isFalse(doApplyFilter("num-lt", "5", 4));
    });
    it("атрибут / поиск - не число, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-lt", "не число", "100500"));
      assert.isFalse(doApplyFilter("num-lt", "не число", 100500));
      assert.isFalse(doApplyFilter("num-lt", "100500", "не число"));
      assert.isFalse(doApplyFilter("num-lt", 100500, "не число"));
    });
    testEmptiness("num-lt", false);
  });
  describe("num-lte", function () {
    it("поиск больше атрибута, должно дать false", function () {
      assert.isTrue(doApplyFilter("num-lte", "5", "100500"));
      assert.isTrue(doApplyFilter("num-lte", 5, 100500));
      assert.isTrue(doApplyFilter("num-lte", 5, "100500"));
      assert.isTrue(doApplyFilter("num-lte", "5", 100500));
    });
    it("поиск равен атрибуту, должно дать true", function () {
      assert.isTrue(doApplyFilter("num-lte", "5", "5"));
      assert.isTrue(doApplyFilter("num-lte", 5, 5));
      assert.isTrue(doApplyFilter("num-lte", 5, "5"));
      assert.isTrue(doApplyFilter("num-lte", "5", 5));
    });
    it("поиск меньше атрибута, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-lte", "5", "4"));
      assert.isFalse(doApplyFilter("num-lte", 5, 4));
      assert.isFalse(doApplyFilter("num-lte", 5, "4"));
      assert.isFalse(doApplyFilter("num-lte", "5", 4));
    });
    it("атрибут / поиск - не число, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-lte", "не число", "100500"));
      assert.isFalse(doApplyFilter("num-lte", "не число", 100500));
      assert.isFalse(doApplyFilter("num-lte", "100500", "не число"));
      assert.isFalse(doApplyFilter("num-lte", 100500, "не число"));
    });
    testEmptiness("num-lte", false);
  });
  describe("num-neq", function () {
    it("поиск равен атрибуту, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-neq", "5", "5"));
      assert.isFalse(doApplyFilter("num-neq", 5, 5));
      assert.isFalse(doApplyFilter("num-neq", 5, "5"));
      assert.isFalse(doApplyFilter("num-neq", "5", 5));
    });
    it("поиск не равен атрибуту, должно дать false", function () {
      assert.isTrue(doApplyFilter("num-neq", "5", "4"));
      assert.isTrue(doApplyFilter("num-neq", 5, 4));
      assert.isTrue(doApplyFilter("num-neq", 5, "4"));
      assert.isTrue(doApplyFilter("num-neq", "5", 4));
    });
    it("атрибут / поиск - не число, должно дать false", function () {
      assert.isFalse(doApplyFilter("num-neq", "не число", "100500"));
      assert.isFalse(doApplyFilter("num-neq", "не число", 100500));
      assert.isFalse(doApplyFilter("num-neq", "100500", "не число"));
      assert.isFalse(doApplyFilter("num-neq", 100500, "не число"));
    });
    testEmptiness("num-neq", false);
  });
  describe("str-fuzzy", function () {
    it("'Hello world' ~ 'hll wrld', threshold = 0.5, true", function () {
      assert.isTrue(applyFilterFunction({ id: { value: "Hello world" } }, null, { condition: "str-fuzzy", filterKey: "id", value: "hll wrld", fuzzyValue: "0.5" }));
    });
    it("'Hello world' ~ 'hd', threshold = 0.1, true", function () {
      assert.isTrue(applyFilterFunction({ id: { value: "Hello world" } }, null, { condition: "str-fuzzy", filterKey: "id", value: "hd", fuzzyValue: "0.1" }));
    });
    it("'Hello world' ~ 'hll wrld', threshold = 1, false", function () {
      assert.isFalse(applyFilterFunction({ id: { value: "Hello world" } }, null, { condition: "str-fuzzy", filterKey: "id", value: "hll wrld", fuzzyValue: "1" }));
    });

    testEmptiness("num-neq", false);
  });
});

export {};
