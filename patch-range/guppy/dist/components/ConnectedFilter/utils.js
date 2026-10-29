"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.getFilterSections = exports.excludeSelfFilterFromAggsData = exports.checkIsArrayField = void 0;var _flat = _interopRequireDefault(require("flat"));
var _queries = require("../Utils/queries");function _interopRequireDefault(e) {return e && e.__esModule ? e : { "default": e };}function _typeof(o) {"@babel/helpers - typeof";return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {return typeof o;} : function (o) {return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;}, _typeof(o);}function ownKeys(e, r) {var t = Object.keys(e);if (Object.getOwnPropertySymbols) {var o = Object.getOwnPropertySymbols(e);r && (o = o.filter(function (r) {return Object.getOwnPropertyDescriptor(e, r).enumerable;})), t.push.apply(t, o);}return t;}function _objectSpread(e) {for (var r = 1; r < arguments.length; r++) {var t = null != arguments[r] ? arguments[r] : {};r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {_defineProperty(e, r, t[r]);}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));});}return e;}function _defineProperty(e, r, t) {return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;}function _toPropertyKey(t) {var i = _toPrimitive(t, "string");return "symbol" == _typeof(i) ? i : i + "";}function _toPrimitive(t, r) {if ("object" != _typeof(t) || !t) return t;var e = t[Symbol.toPrimitive];if (void 0 !== e) {var i = e.call(t, r || "default");if ("object" != _typeof(i)) return i;throw new TypeError("@@toPrimitive must return a primitive value.");}return ("string" === r ? String : Number)(t);}

var getSingleFilterOption = function getSingleFilterOption(histogramResult, initHistogramRes, filterValuesToHide) {
  if (!histogramResult || !histogramResult.histogram) {
    throw new Error("Error parsing field options ".concat(JSON.stringify(histogramResult)));
  }
  // if this is for range slider
  if (histogramResult.histogram.length === 1 && typeof histogramResult.histogram[0].key !== 'string') {
    var rangeOptions = histogramResult.histogram.map(function (item) {
      var minValue = initHistogramRes ? initHistogramRes.histogram[0].key[0] : item.key[0];
      var maxValue = initHistogramRes ? initHistogramRes.histogram[0].key[1] : item.key[1];
      // PATCH range-slider-decimal-fix: use the actual (possibly fractional)
      // data domain for min/max instead of Math.floor/Math.ceil, and derive a
      // fractional rangeStep + decimalDigitsLen so rc-slider offers usable
      // tick marks for float fields (e.g. 0.149 - 0.856 pg/mL).
      var span = maxValue - minValue;
      var rangeStep = 1;
      var decimalDigitsLen = 2;
      if (isFinite(span) && span > 0) {
        // ~100 ticks, snapped down to a power of ten so values look clean
        rangeStep = Math.pow(10, Math.floor(Math.log10(span / 100)));
        if (!isFinite(rangeStep) || rangeStep <= 0) {
          rangeStep = span / 100;
        }
        if (!isFinite(rangeStep) || rangeStep <= 0) {
          rangeStep = 1;
        }
        decimalDigitsLen = Math.max(2, Math.ceil(-Math.log10(rangeStep)));
        if (!isFinite(decimalDigitsLen)) {
          decimalDigitsLen = 2;
        }
      }
      // PATCH range-slider-decimal-fix part2: ES float (32-bit) aggregations
      // widen min/max to doubles with precision artifacts
      // (e.g. 7.34 becomes 7.340000152587891). Round bounds to
      // decimalDigitsLen so the UI never shows the raw widened values.
      var roundToDigits = function roundToDigits(value) {
        var parsed = Number.parseFloat(value);
        return isFinite(parsed) ? Number.parseFloat(parsed.toFixed(decimalDigitsLen)) : value;
      };
      return {
        filterType: 'range',
        min: roundToDigits(minValue),
        max: roundToDigits(maxValue),
        lowerBound: roundToDigits(item.key[0]),
        upperBound: roundToDigits(item.key[1]),
        count: item.count,
        rangeStep: rangeStep,
        decimalDigitsLen: decimalDigitsLen
      };
    });
    return rangeOptions;
  }
  var rawTextOptions = histogramResult.histogram;
  // hide filterValuesToHide from filters
  // filterValuesToHide added to guppyConfig in data-portal
  if (filterValuesToHide.length > 0) {
    rawTextOptions = histogramResult.histogram.
    filter(function (item) {return filterValuesToHide.indexOf(item.key) < 0;});
  }
  var textOptions = rawTextOptions.map(function (item) {return {
      text: item.key,
      filterType: 'singleSelect',
      count: item.count,
      accessible: item.accessible
    };});
  return textOptions;
};

var capitalizeFirstLetter = function capitalizeFirstLetter(str) {
  var res = str.replace(/_|\./gi, ' ');
  return res.replace(/\w\S*/g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// createSearchFilterLoadOptionsFn creates a handler function that loads the search filter's
// autosuggest options as the user types in the search filter.
var createSearchFilterLoadOptionsFn = function createSearchFilterLoadOptionsFn(field, guppyConfig, csrfToken) {return function (searchString, offset) {
    var NUM_SEARCH_OPTIONS = 20;
    return new Promise(function (resolve, reject) {
      // If searchString is empty return just the first NUM_SEARCH_OPTIONS options.
      // This allows the client to show default options in the search filter before
      // the user has started searching.
      var filter = {};
      if (searchString) {
        filter = {
          search: {
            keyword: searchString,
            fields: [field]
          }
        };
      }
      (0, _queries.queryGuppyForRawDataAndTotalCounts)(
        guppyConfig.path,
        guppyConfig.type,
        [field],
        filter,
        undefined,
        undefined,
        offset,
        NUM_SEARCH_OPTIONS,
        'accessible',
        csrfToken
      ).
      then(function (res) {
        if (!res.data || !res.data[guppyConfig.type]) {
          resolve({
            options: [],
            hasMore: false
          });
        } else {
          var results = res.data[guppyConfig.type];
          var totalCount = res.data._aggregation[guppyConfig.type]._totalCount;
          resolve({
            options: results.map(function (result) {return { value: result[field], label: result[field] };}),
            hasMore: totalCount > offset + results.length
          });
        }
      })["catch"](function (err) {
        reject(err);
      });
    });
  };};

var checkIsArrayField = exports.checkIsArrayField = function checkIsArrayField(field, arrayFields) {
  var isArrayField = false;
  var keys = Object.keys(arrayFields);
  for (var i = 0; i < keys.length; i += 1) {
    if (arrayFields[keys[i]].includes(field)) {
      isArrayField = true;
    }
  }
  return isArrayField;
};

var getFilterSections = exports.getFilterSections = function getFilterSections(
aggFields,
searchFields,
fieldMapping,
tabsOptions,
initialTabsOptions,
adminAppliedPreFilters,
guppyConfig,
arrayFields,
filterValuesToHide,
csrfToken)
{
  var searchFieldSections = [];

  if (searchFields) {
    // Process searchFields first -- searchFields are special filters that allow the user
    // to search over all options, instead of displaying all options in a list. This allows
    // guppy/portal to support filters that have too many options to be displayed in a list.
    searchFieldSections = searchFields.map(function (field) {
      var overrideName = fieldMapping.find(function (entry) {return entry.field === field;});
      var label = overrideName ? overrideName.name : capitalizeFirstLetter(field);

      var tabsOptionsFiltered = _objectSpread({}, tabsOptions[field]);
      if (Object.keys(adminAppliedPreFilters).includes(field)) {
        tabsOptionsFiltered.histogram = tabsOptionsFiltered.histogram.filter(
          function (x) {return adminAppliedPreFilters[field].selectedValues.includes(x.key);}
        );
      }

      // For searchFields, don't pass all options to the component, only the selected ones.
      // This allows selected options to appear below the search box once they are selected.
      var selectedOptions = [];
      if (tabsOptionsFiltered && tabsOptionsFiltered.histogram) {
        selectedOptions = getSingleFilterOption(
          tabsOptionsFiltered,
          initialTabsOptions ? initialTabsOptions[field] : undefined,
          filterValuesToHide
        );
      }

      return {
        title: label,
        options: selectedOptions,
        isSearchFilter: true,
        onSearchFilterLoadOptions: createSearchFilterLoadOptionsFn(field, guppyConfig, csrfToken)
      };
    });
  }

  var sections = aggFields.map(function (field) {
    var overrideName = fieldMapping.find(function (entry) {return entry.field === field;});
    var label = overrideName ? overrideName.name : capitalizeFirstLetter(field);

    var tabsOptionsFiltered = _objectSpread({}, tabsOptions[field]);
    if (Object.keys(adminAppliedPreFilters).includes(field)) {
      tabsOptionsFiltered.histogram = tabsOptionsFiltered.histogram.filter(
        function (x) {return adminAppliedPreFilters[field].selectedValues.includes(x.key);}
      );
    }

    var defaultOptions = getSingleFilterOption(
      tabsOptionsFiltered,
      initialTabsOptions ? initialTabsOptions[field] : undefined,
      filterValuesToHide
    );

    var fieldIsArrayField = checkIsArrayField(field, arrayFields);

    return {
      title: label,
      options: defaultOptions,
      isArrayField: fieldIsArrayField
    };
  });
  return searchFieldSections.concat(sections);
};

var excludeSelfFilterFromAggsData = exports.excludeSelfFilterFromAggsData = function excludeSelfFilterFromAggsData(receivedAggsData, filterResults) {
  if (!filterResults) return receivedAggsData;
  var resultAggsData = {};
  var flattenAggsData = (0, _flat["default"])(receivedAggsData, { safe: true });
  Object.keys(flattenAggsData).forEach(function (field) {
    var actualFieldName = field.replace('.histogram', '').replace('.asTextHistogram', '');
    var histogram = flattenAggsData["".concat(field)];
    if (!histogram) return;
    if (actualFieldName in filterResults) {
      var resultHistogram = [];
      if (typeof filterResults["".concat(actualFieldName)].selectedValues !== 'undefined') {
        var selectedValues = filterResults["".concat(actualFieldName)].selectedValues;
        resultHistogram = histogram.filter(function (bucket) {return selectedValues.includes(bucket.key);});
      }
      resultAggsData["".concat(actualFieldName)] = { histogram: resultHistogram };
    } else {
      resultAggsData["".concat(actualFieldName)] = { histogram: flattenAggsData["".concat(field)] };
    }
  });
  return resultAggsData;
};