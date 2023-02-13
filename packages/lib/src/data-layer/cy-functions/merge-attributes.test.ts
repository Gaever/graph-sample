import { assert } from "chai";
import { mergeAttributes } from "./cy-node-merge";

describe.only("merge-attributes", function () {
  describe("full-merge", function () {
    it("дубликат в первом узле, во втором узле есть уникальный атрибут", function () {
      const newAttributes = mergeAttributes(
        [{ key: "id", label: "id", value: "1" }],
        [
          { key: "id", label: "id", value: "2" },
          { key: "attr1", label: "attr1", value: "attr2" },
        ],
        "full-merge"
      );
      assert.sameDeepMembers(newAttributes, [
        { key: "id", label: "id", value: "2" },
        { key: "attr1", label: "attr1", value: "attr2" },
        { key: "_merged_id", label: "_merged_id", value: "1" },
      ]);
    });

    it("дубликат в первом узле, во первом узле есть уникальный атрибут", function () {
      const newAttributes = mergeAttributes(
        [
          { key: "id", label: "id", value: "1" },
          { key: "attr1", label: "attr1", value: "attr2" },
        ],
        [{ key: "id", label: "id", value: "2" }],
        "full-merge"
      );
      assert.sameDeepMembers(newAttributes, [
        { key: "id", label: "id", value: "2" },
        { key: "attr1", label: "attr1", value: "attr2" },
        { key: "_merged_id", label: "_merged_id", value: "1" },
      ]);
    });
  });

  it("right-merge", function () {
    const newAttributes = mergeAttributes(
      [{ key: "id", label: "id", value: "1" }],
      [
        { key: "id", label: "id", value: "2" },
        { key: "attr1", label: "attr1", value: "attr2" },
      ],
      "right-merge"
    );
    assert.sameDeepMembers(newAttributes, [
      { key: "id", label: "id", value: "1" },
      { key: "attr1", label: "attr1", value: "attr2" },
    ]);
  });

  it("left-merge", function () {
    const newAttributes = mergeAttributes(
      [{ key: "id", label: "id", value: "1" }],
      [
        { key: "id", label: "id", value: "2" },
        { key: "attr1", label: "attr1", value: "attr2" },
      ],
      "left-merge"
    );
    assert.sameDeepMembers(newAttributes, [
      { key: "id", label: "id", value: "2" },
      { key: "attr1", label: "attr1", value: "attr2" },
    ]);
  });
});

export {};
