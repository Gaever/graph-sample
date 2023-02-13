import { applyFilterConditions, mapFilterData } from "./apply-filters-action";
import { attributeFilter, CyNode, filters, mappedFilterData } from "../../../types";
import { assert } from "chai";

describe("applyFilterConditions", function () {
  function doFilter(filters: filters, items: CyNode["data"][]) {
    const mappedFilterData = mapFilterData(filters);
    return items.filter((item) => applyFilterConditions(mappedFilterData, item));
  }

  describe("Фильтр по иконкам", function () {
    const items: CyNode["data"][] = [{ payload: { icon: "icon1" } }, { payload: { icon: "icon2" } }];

    it("искомая иконка есть в одном элементе", function () {
      const result = doFilter(
        {
          icons: ["icon1"],
          attributes: [],
          systemIds: [],
          isHideFiltered: false,
        },
        items
      );

      assert.sameDeepMembers(result, [{ payload: { icon: "icon1" } }]);
    });

    it("искомая иконка отсутствует среди элементов", function () {
      const result = doFilter(
        {
          icons: ["icon3"],
          attributes: [],
          systemIds: [],
          isHideFiltered: false,
        },
        items
      );

      assert.sameDeepMembers(result, []);
    });
  });

  describe("Фильтр по system_id", function () {
    const items: CyNode["data"][] = [{ payload: { system_id: "id1" } }, { payload: { system_id: "id2" } }];

    it("искомый system_id есть в одном элементе", function () {
      const result = doFilter(
        {
          icons: [],
          attributes: [],
          systemIds: ["id2"],
          isHideFiltered: false,
        },
        items
      );

      assert.sameDeepMembers(result, [{ payload: { system_id: "id2" } }]);
    });

    it("искомый system_id отсутствует среди элементов", function () {
      const result = doFilter(
        {
          icons: [],
          attributes: [],
          systemIds: ["id3"],
          isHideFiltered: false,
        },
        items
      );

      assert.sameDeepMembers(result, []);
    });
  });

  describe("Фильтр по одному атрибуту", function () {
    const items: CyNode["data"][] = [{ payload: { data: [{ key: "id", label: "айди", value: "1" }] } }, { payload: { data: [{ key: "id", label: "айди", value: "2" }] } }];

    it("искомое значение атрибуте есть в одном элементе", function () {
      const result = doFilter(
        {
          icons: [],
          attributes: [
            {
              filterKey: "id",
              condition: "str-eq",
              value: "1",
            },
          ],
          systemIds: [],
          isHideFiltered: false,
        },
        items
      );

      assert.sameDeepMembers(result, [items[0]]);
    });

    it("искомое значение атрибуте отсутствует среди элементов", function () {
      const result = doFilter(
        {
          icons: [],
          attributes: [
            {
              filterKey: "id",
              condition: "str-eq",
              value: "3",
            },
          ],
          systemIds: [],
          isHideFiltered: false,
        },
        items
      );

      assert.sameDeepMembers(result, []);
    });
  });

  describe("Фильтр по нескольким атрибутам", function () {
    const items: CyNode["data"][] = [
      {
        payload: {
          data: [
            { key: "id", label: "айди", value: "1" },
            { key: "attr1", label: "attr1", value: "1" },
            { key: "attr2", label: "attr2", value: "1" },
          ],
        },
      },
      {
        payload: {
          data: [
            { key: "id", label: "айди", value: "2" },
            { key: "attr1", label: "attr1", value: "2" },
            { key: "attr2", label: "attr2", value: "2" },
          ],
        },
      },
      {
        payload: {
          data: [
            { key: "id", label: "айди", value: "3" },
            { key: "attr1", label: "attr1", value: "2" },
            { key: "attr2", label: "attr2", value: "2" },
            { key: "attr3", label: "attr3", value: "2" },
          ],
        },
      },
    ];

    it("искомое значение атрибуте есть в одном элементе", function () {
      const result = doFilter(
        {
          icons: [],
          attributes: [
            {
              filterKey: "attr1",
              condition: "str-eq",
              value: "2",
            },
            {
              filterKey: "attr2",
              condition: "str-eq",
              value: "2",
            },
          ],
          systemIds: [],
          isHideFiltered: false,
        },
        items
      );

      assert.sameDeepMembers(result, [items[1], items[2]]);
    });
  });

  describe("Фильтр иконке, system_id и трем атрибутам с разными условиями", function () {
    const items: CyNode["data"][] = [
      {
        label: "Подпись 1",
        payload: {
          icon: "icon1",
          system_id: "1",
          data: [
            { key: "id", label: "айди", value: "1" },
            { key: "attr1", label: "attr1", value: "1" },
            { key: "attr2", label: "attr2", value: "1" },
          ],
        },
      },
      {
        label: "Подпись 2",
        payload: {
          icon: "icon2",
          system_id: "2",
          data: [
            { key: "id", label: "айди", value: "2" },
            { key: "attr1", label: "attr1", value: "2" },
            { key: "attr2", label: "attr2", value: "2" },
          ],
        },
      },
      {
        label: "Подпись 3",
        payload: {
          icon: "icon2",
          system_id: "3",
          data: [
            { key: "id", label: "айди", value: "3" },
            { key: "attr1", label: "attr1", value: "3" },
            { key: "attr2", label: "attr2", value: "3" },
            { key: "attr3", label: "attr3", value: "3" },
          ],
        },
      },
      {
        label: "Подпись 43",
        payload: {
          icon: "icon2",
          system_id: "3",
          data: [
            { key: "id", label: "айди", value: "3" },
            { key: "attr1", label: "attr1", value: "3" },
            { key: "attr2", label: "attr2", value: "3" },
            { key: "attr3", label: "attr3", value: "3" },
          ],
        },
      },
    ];

    it("искомое значение есть в одном элементе", function () {
      const result = doFilter(
        {
          icons: ["icon2"],
          attributes: [
            {
              filterKey: "attr1",
              condition: "num-gte",
              value: "1",
            },
            {
              filterKey: "attr2",
              condition: "str-eq",
              value: "3",
            },
            {
              filterKey: "Подпись",
              condition: "str-include",
              value: "3",
            },
          ],
          systemIds: ["3"],
          isHideFiltered: false,
        },
        items
      );

      assert.sameDeepMembers(result, [items[2], items[3]]);
    });
  });
});
