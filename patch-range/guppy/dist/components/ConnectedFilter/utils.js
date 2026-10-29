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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZmxhdCIsIl9pbnRlcm9wUmVxdWlyZURlZmF1bHQiLCJyZXF1aXJlIiwiX3F1ZXJpZXMiLCJlIiwiX19lc01vZHVsZSIsIl90eXBlb2YiLCJvIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJjb25zdHJ1Y3RvciIsInByb3RvdHlwZSIsIm93bktleXMiLCJyIiwidCIsIk9iamVjdCIsImtleXMiLCJnZXRPd25Qcm9wZXJ0eVN5bWJvbHMiLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzIiwiZGVmaW5lUHJvcGVydGllcyIsImRlZmluZVByb3BlcnR5IiwiX3RvUHJvcGVydHlLZXkiLCJ2YWx1ZSIsImNvbmZpZ3VyYWJsZSIsIndyaXRhYmxlIiwiaSIsIl90b1ByaW1pdGl2ZSIsInRvUHJpbWl0aXZlIiwiY2FsbCIsIlR5cGVFcnJvciIsIlN0cmluZyIsIk51bWJlciIsImdldFNpbmdsZUZpbHRlck9wdGlvbiIsImhpc3RvZ3JhbVJlc3VsdCIsImluaXRIaXN0b2dyYW1SZXMiLCJmaWx0ZXJWYWx1ZXNUb0hpZGUiLCJoaXN0b2dyYW0iLCJFcnJvciIsImNvbmNhdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJrZXkiLCJyYW5nZU9wdGlvbnMiLCJtYXAiLCJpdGVtIiwibWluVmFsdWUiLCJtYXhWYWx1ZSIsImZpbHRlclR5cGUiLCJtaW4iLCJNYXRoIiwiZmxvb3IiLCJtYXgiLCJjZWlsIiwibG93ZXJCb3VuZCIsInVwcGVyQm91bmQiLCJjb3VudCIsInJhd1RleHRPcHRpb25zIiwiaW5kZXhPZiIsInRleHRPcHRpb25zIiwidGV4dCIsImFjY2Vzc2libGUiLCJjYXBpdGFsaXplRmlyc3RMZXR0ZXIiLCJzdHIiLCJyZXMiLCJyZXBsYWNlIiwidHh0IiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzdWJzdHIiLCJ0b0xvd2VyQ2FzZSIsImNyZWF0ZVNlYXJjaEZpbHRlckxvYWRPcHRpb25zRm4iLCJmaWVsZCIsImd1cHB5Q29uZmlnIiwiY3NyZlRva2VuIiwic2VhcmNoU3RyaW5nIiwib2Zmc2V0IiwiTlVNX1NFQVJDSF9PUFRJT05TIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzZWFyY2giLCJrZXl3b3JkIiwiZmllbGRzIiwicXVlcnlHdXBweUZvclJhd0RhdGFBbmRUb3RhbENvdW50cyIsInBhdGgiLCJ0eXBlIiwidW5kZWZpbmVkIiwidGhlbiIsImRhdGEiLCJvcHRpb25zIiwiaGFzTW9yZSIsInJlc3VsdHMiLCJ0b3RhbENvdW50IiwiX2FnZ3JlZ2F0aW9uIiwiX3RvdGFsQ291bnQiLCJyZXN1bHQiLCJsYWJlbCIsImVyciIsImNoZWNrSXNBcnJheUZpZWxkIiwiZXhwb3J0cyIsImFycmF5RmllbGRzIiwiaXNBcnJheUZpZWxkIiwiaW5jbHVkZXMiLCJnZXRGaWx0ZXJTZWN0aW9ucyIsImFnZ0ZpZWxkcyIsInNlYXJjaEZpZWxkcyIsImZpZWxkTWFwcGluZyIsInRhYnNPcHRpb25zIiwiaW5pdGlhbFRhYnNPcHRpb25zIiwiYWRtaW5BcHBsaWVkUHJlRmlsdGVycyIsInNlYXJjaEZpZWxkU2VjdGlvbnMiLCJvdmVycmlkZU5hbWUiLCJmaW5kIiwiZW50cnkiLCJuYW1lIiwidGFic09wdGlvbnNGaWx0ZXJlZCIsIngiLCJzZWxlY3RlZFZhbHVlcyIsInNlbGVjdGVkT3B0aW9ucyIsInRpdGxlIiwiaXNTZWFyY2hGaWx0ZXIiLCJvblNlYXJjaEZpbHRlckxvYWRPcHRpb25zIiwic2VjdGlvbnMiLCJkZWZhdWx0T3B0aW9ucyIsImZpZWxkSXNBcnJheUZpZWxkIiwiZXhjbHVkZVNlbGZGaWx0ZXJGcm9tQWdnc0RhdGEiLCJyZWNlaXZlZEFnZ3NEYXRhIiwiZmlsdGVyUmVzdWx0cyIsInJlc3VsdEFnZ3NEYXRhIiwiZmxhdHRlbkFnZ3NEYXRhIiwiZmxhdCIsInNhZmUiLCJhY3R1YWxGaWVsZE5hbWUiLCJyZXN1bHRIaXN0b2dyYW0iLCJidWNrZXQiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9Db25uZWN0ZWRGaWx0ZXIvdXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZsYXQgZnJvbSAnZmxhdCc7XG5pbXBvcnQgeyBxdWVyeUd1cHB5Rm9yUmF3RGF0YUFuZFRvdGFsQ291bnRzIH0gZnJvbSAnLi4vVXRpbHMvcXVlcmllcyc7XG5cbmNvbnN0IGdldFNpbmdsZUZpbHRlck9wdGlvbiA9IChoaXN0b2dyYW1SZXN1bHQsIGluaXRIaXN0b2dyYW1SZXMsIGZpbHRlclZhbHVlc1RvSGlkZSkgPT4ge1xuICBpZiAoIWhpc3RvZ3JhbVJlc3VsdCB8fCAhaGlzdG9ncmFtUmVzdWx0Lmhpc3RvZ3JhbSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgcGFyc2luZyBmaWVsZCBvcHRpb25zICR7SlNPTi5zdHJpbmdpZnkoaGlzdG9ncmFtUmVzdWx0KX1gKTtcbiAgfVxuICAvLyBpZiB0aGlzIGlzIGZvciByYW5nZSBzbGlkZXJcbiAgaWYgKGhpc3RvZ3JhbVJlc3VsdC5oaXN0b2dyYW0ubGVuZ3RoID09PSAxICYmICh0eXBlb2YgaGlzdG9ncmFtUmVzdWx0Lmhpc3RvZ3JhbVswXS5rZXkpICE9PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IHJhbmdlT3B0aW9ucyA9IGhpc3RvZ3JhbVJlc3VsdC5oaXN0b2dyYW0ubWFwKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBtaW5WYWx1ZSA9IGluaXRIaXN0b2dyYW1SZXMgPyBpbml0SGlzdG9ncmFtUmVzLmhpc3RvZ3JhbVswXS5rZXlbMF0gOiBpdGVtLmtleVswXTtcbiAgICAgIGNvbnN0IG1heFZhbHVlID0gaW5pdEhpc3RvZ3JhbVJlcyA/IGluaXRIaXN0b2dyYW1SZXMuaGlzdG9ncmFtWzBdLmtleVsxXSA6IGl0ZW0ua2V5WzFdO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsdGVyVHlwZTogJ3JhbmdlJyxcbiAgICAgICAgbWluOiBNYXRoLmZsb29yKG1pblZhbHVlKSxcbiAgICAgICAgbWF4OiBNYXRoLmNlaWwobWF4VmFsdWUpLFxuICAgICAgICBsb3dlckJvdW5kOiBpdGVtLmtleVswXSxcbiAgICAgICAgdXBwZXJCb3VuZDogaXRlbS5rZXlbMV0sXG4gICAgICAgIGNvdW50OiBpdGVtLmNvdW50LFxuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmFuZ2VPcHRpb25zO1xuICB9XG4gIGxldCByYXdUZXh0T3B0aW9ucyA9IGhpc3RvZ3JhbVJlc3VsdC5oaXN0b2dyYW07XG4gIC8vIGhpZGUgZmlsdGVyVmFsdWVzVG9IaWRlIGZyb20gZmlsdGVyc1xuICAvLyBmaWx0ZXJWYWx1ZXNUb0hpZGUgYWRkZWQgdG8gZ3VwcHlDb25maWcgaW4gZGF0YS1wb3J0YWxcbiAgaWYgKGZpbHRlclZhbHVlc1RvSGlkZS5sZW5ndGggPiAwKSB7XG4gICAgcmF3VGV4dE9wdGlvbnMgPSBoaXN0b2dyYW1SZXN1bHQuaGlzdG9ncmFtXG4gICAgICAuZmlsdGVyKChpdGVtKSA9PiBmaWx0ZXJWYWx1ZXNUb0hpZGUuaW5kZXhPZihpdGVtLmtleSkgPCAwKTtcbiAgfVxuICBjb25zdCB0ZXh0T3B0aW9ucyA9IHJhd1RleHRPcHRpb25zLm1hcCgoaXRlbSkgPT4gKHtcbiAgICB0ZXh0OiBpdGVtLmtleSxcbiAgICBmaWx0ZXJUeXBlOiAnc2luZ2xlU2VsZWN0JyxcbiAgICBjb3VudDogaXRlbS5jb3VudCxcbiAgICBhY2Nlc3NpYmxlOiBpdGVtLmFjY2Vzc2libGUsXG4gIH0pKTtcbiAgcmV0dXJuIHRleHRPcHRpb25zO1xufTtcblxuY29uc3QgY2FwaXRhbGl6ZUZpcnN0TGV0dGVyID0gKHN0cikgPT4ge1xuICBjb25zdCByZXMgPSBzdHIucmVwbGFjZSgvX3xcXC4vZ2ksICcgJyk7XG4gIHJldHVybiByZXMucmVwbGFjZSgvXFx3XFxTKi9nLCAodHh0KSA9PiB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCkpO1xufTtcblxuLy8gY3JlYXRlU2VhcmNoRmlsdGVyTG9hZE9wdGlvbnNGbiBjcmVhdGVzIGEgaGFuZGxlciBmdW5jdGlvbiB0aGF0IGxvYWRzIHRoZSBzZWFyY2ggZmlsdGVyJ3Ncbi8vIGF1dG9zdWdnZXN0IG9wdGlvbnMgYXMgdGhlIHVzZXIgdHlwZXMgaW4gdGhlIHNlYXJjaCBmaWx0ZXIuXG5jb25zdCBjcmVhdGVTZWFyY2hGaWx0ZXJMb2FkT3B0aW9uc0ZuID0gKGZpZWxkLCBndXBweUNvbmZpZywgY3NyZlRva2VuKSA9PiAoc2VhcmNoU3RyaW5nLCBvZmZzZXQpID0+IHtcbiAgY29uc3QgTlVNX1NFQVJDSF9PUFRJT05TID0gMjA7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gSWYgc2VhcmNoU3RyaW5nIGlzIGVtcHR5IHJldHVybiBqdXN0IHRoZSBmaXJzdCBOVU1fU0VBUkNIX09QVElPTlMgb3B0aW9ucy5cbiAgICAvLyBUaGlzIGFsbG93cyB0aGUgY2xpZW50IHRvIHNob3cgZGVmYXVsdCBvcHRpb25zIGluIHRoZSBzZWFyY2ggZmlsdGVyIGJlZm9yZVxuICAgIC8vIHRoZSB1c2VyIGhhcyBzdGFydGVkIHNlYXJjaGluZy5cbiAgICBsZXQgZmlsdGVyID0ge307XG4gICAgaWYgKHNlYXJjaFN0cmluZykge1xuICAgICAgZmlsdGVyID0ge1xuICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICBrZXl3b3JkOiBzZWFyY2hTdHJpbmcsXG4gICAgICAgICAgZmllbGRzOiBbZmllbGRdLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG4gICAgcXVlcnlHdXBweUZvclJhd0RhdGFBbmRUb3RhbENvdW50cyhcbiAgICAgIGd1cHB5Q29uZmlnLnBhdGgsXG4gICAgICBndXBweUNvbmZpZy50eXBlLFxuICAgICAgW2ZpZWxkXSxcbiAgICAgIGZpbHRlcixcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIG9mZnNldCxcbiAgICAgIE5VTV9TRUFSQ0hfT1BUSU9OUyxcbiAgICAgICdhY2Nlc3NpYmxlJyxcbiAgICAgIGNzcmZUb2tlbixcbiAgICApXG4gICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGlmICghcmVzLmRhdGEgfHwgIXJlcy5kYXRhW2d1cHB5Q29uZmlnLnR5cGVdKSB7XG4gICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICBvcHRpb25zOiBbXSxcbiAgICAgICAgICAgIGhhc01vcmU6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXMuZGF0YVtndXBweUNvbmZpZy50eXBlXTtcbiAgICAgICAgICBjb25zdCB0b3RhbENvdW50ID0gcmVzLmRhdGEuX2FnZ3JlZ2F0aW9uW2d1cHB5Q29uZmlnLnR5cGVdLl90b3RhbENvdW50O1xuICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgb3B0aW9uczogcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4gKHsgdmFsdWU6IHJlc3VsdFtmaWVsZF0sIGxhYmVsOiByZXN1bHRbZmllbGRdIH0pKSxcbiAgICAgICAgICAgIGhhc01vcmU6IHRvdGFsQ291bnQgPiBvZmZzZXQgKyByZXN1bHRzLmxlbmd0aCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja0lzQXJyYXlGaWVsZCA9IChmaWVsZCwgYXJyYXlGaWVsZHMpID0+IHtcbiAgbGV0IGlzQXJyYXlGaWVsZCA9IGZhbHNlO1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYXJyYXlGaWVsZHMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAoYXJyYXlGaWVsZHNba2V5c1tpXV0uaW5jbHVkZXMoZmllbGQpKSB7XG4gICAgICBpc0FycmF5RmllbGQgPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXNBcnJheUZpZWxkO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEZpbHRlclNlY3Rpb25zID0gKFxuICBhZ2dGaWVsZHMsXG4gIHNlYXJjaEZpZWxkcyxcbiAgZmllbGRNYXBwaW5nLFxuICB0YWJzT3B0aW9ucyxcbiAgaW5pdGlhbFRhYnNPcHRpb25zLFxuICBhZG1pbkFwcGxpZWRQcmVGaWx0ZXJzLFxuICBndXBweUNvbmZpZyxcbiAgYXJyYXlGaWVsZHMsXG4gIGZpbHRlclZhbHVlc1RvSGlkZSxcbiAgY3NyZlRva2VuLFxuKSA9PiB7XG4gIGxldCBzZWFyY2hGaWVsZFNlY3Rpb25zID0gW107XG5cbiAgaWYgKHNlYXJjaEZpZWxkcykge1xuICAgIC8vIFByb2Nlc3Mgc2VhcmNoRmllbGRzIGZpcnN0IC0tIHNlYXJjaEZpZWxkcyBhcmUgc3BlY2lhbCBmaWx0ZXJzIHRoYXQgYWxsb3cgdGhlIHVzZXJcbiAgICAvLyB0byBzZWFyY2ggb3ZlciBhbGwgb3B0aW9ucywgaW5zdGVhZCBvZiBkaXNwbGF5aW5nIGFsbCBvcHRpb25zIGluIGEgbGlzdC4gVGhpcyBhbGxvd3NcbiAgICAvLyBndXBweS9wb3J0YWwgdG8gc3VwcG9ydCBmaWx0ZXJzIHRoYXQgaGF2ZSB0b28gbWFueSBvcHRpb25zIHRvIGJlIGRpc3BsYXllZCBpbiBhIGxpc3QuXG4gICAgc2VhcmNoRmllbGRTZWN0aW9ucyA9IHNlYXJjaEZpZWxkcy5tYXAoKGZpZWxkKSA9PiB7XG4gICAgICBjb25zdCBvdmVycmlkZU5hbWUgPSBmaWVsZE1hcHBpbmcuZmluZCgoZW50cnkpID0+IChlbnRyeS5maWVsZCA9PT0gZmllbGQpKTtcbiAgICAgIGNvbnN0IGxhYmVsID0gb3ZlcnJpZGVOYW1lID8gb3ZlcnJpZGVOYW1lLm5hbWUgOiBjYXBpdGFsaXplRmlyc3RMZXR0ZXIoZmllbGQpO1xuXG4gICAgICBjb25zdCB0YWJzT3B0aW9uc0ZpbHRlcmVkID0geyAuLi50YWJzT3B0aW9uc1tmaWVsZF0gfTtcbiAgICAgIGlmIChPYmplY3Qua2V5cyhhZG1pbkFwcGxpZWRQcmVGaWx0ZXJzKS5pbmNsdWRlcyhmaWVsZCkpIHtcbiAgICAgICAgdGFic09wdGlvbnNGaWx0ZXJlZC5oaXN0b2dyYW0gPSB0YWJzT3B0aW9uc0ZpbHRlcmVkLmhpc3RvZ3JhbS5maWx0ZXIoXG4gICAgICAgICAgKHgpID0+IGFkbWluQXBwbGllZFByZUZpbHRlcnNbZmllbGRdLnNlbGVjdGVkVmFsdWVzLmluY2x1ZGVzKHgua2V5KSxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIHNlYXJjaEZpZWxkcywgZG9uJ3QgcGFzcyBhbGwgb3B0aW9ucyB0byB0aGUgY29tcG9uZW50LCBvbmx5IHRoZSBzZWxlY3RlZCBvbmVzLlxuICAgICAgLy8gVGhpcyBhbGxvd3Mgc2VsZWN0ZWQgb3B0aW9ucyB0byBhcHBlYXIgYmVsb3cgdGhlIHNlYXJjaCBib3ggb25jZSB0aGV5IGFyZSBzZWxlY3RlZC5cbiAgICAgIGxldCBzZWxlY3RlZE9wdGlvbnMgPSBbXTtcbiAgICAgIGlmICh0YWJzT3B0aW9uc0ZpbHRlcmVkICYmIHRhYnNPcHRpb25zRmlsdGVyZWQuaGlzdG9ncmFtKSB7XG4gICAgICAgIHNlbGVjdGVkT3B0aW9ucyA9IGdldFNpbmdsZUZpbHRlck9wdGlvbihcbiAgICAgICAgICB0YWJzT3B0aW9uc0ZpbHRlcmVkLFxuICAgICAgICAgIGluaXRpYWxUYWJzT3B0aW9ucyA/IGluaXRpYWxUYWJzT3B0aW9uc1tmaWVsZF0gOiB1bmRlZmluZWQsXG4gICAgICAgICAgZmlsdGVyVmFsdWVzVG9IaWRlLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogbGFiZWwsXG4gICAgICAgIG9wdGlvbnM6IHNlbGVjdGVkT3B0aW9ucyxcbiAgICAgICAgaXNTZWFyY2hGaWx0ZXI6IHRydWUsXG4gICAgICAgIG9uU2VhcmNoRmlsdGVyTG9hZE9wdGlvbnM6IGNyZWF0ZVNlYXJjaEZpbHRlckxvYWRPcHRpb25zRm4oZmllbGQsIGd1cHB5Q29uZmlnLCBjc3JmVG9rZW4pLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IHNlY3Rpb25zID0gYWdnRmllbGRzLm1hcCgoZmllbGQpID0+IHtcbiAgICBjb25zdCBvdmVycmlkZU5hbWUgPSBmaWVsZE1hcHBpbmcuZmluZCgoZW50cnkpID0+IChlbnRyeS5maWVsZCA9PT0gZmllbGQpKTtcbiAgICBjb25zdCBsYWJlbCA9IG92ZXJyaWRlTmFtZSA/IG92ZXJyaWRlTmFtZS5uYW1lIDogY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGZpZWxkKTtcblxuICAgIGNvbnN0IHRhYnNPcHRpb25zRmlsdGVyZWQgPSB7IC4uLnRhYnNPcHRpb25zW2ZpZWxkXSB9O1xuICAgIGlmIChPYmplY3Qua2V5cyhhZG1pbkFwcGxpZWRQcmVGaWx0ZXJzKS5pbmNsdWRlcyhmaWVsZCkpIHtcbiAgICAgIHRhYnNPcHRpb25zRmlsdGVyZWQuaGlzdG9ncmFtID0gdGFic09wdGlvbnNGaWx0ZXJlZC5oaXN0b2dyYW0uZmlsdGVyKFxuICAgICAgICAoeCkgPT4gYWRtaW5BcHBsaWVkUHJlRmlsdGVyc1tmaWVsZF0uc2VsZWN0ZWRWYWx1ZXMuaW5jbHVkZXMoeC5rZXkpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IGdldFNpbmdsZUZpbHRlck9wdGlvbihcbiAgICAgIHRhYnNPcHRpb25zRmlsdGVyZWQsXG4gICAgICBpbml0aWFsVGFic09wdGlvbnMgPyBpbml0aWFsVGFic09wdGlvbnNbZmllbGRdIDogdW5kZWZpbmVkLFxuICAgICAgZmlsdGVyVmFsdWVzVG9IaWRlLFxuICAgICk7XG5cbiAgICBjb25zdCBmaWVsZElzQXJyYXlGaWVsZCA9IGNoZWNrSXNBcnJheUZpZWxkKGZpZWxkLCBhcnJheUZpZWxkcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGl0bGU6IGxhYmVsLFxuICAgICAgb3B0aW9uczogZGVmYXVsdE9wdGlvbnMsXG4gICAgICBpc0FycmF5RmllbGQ6IGZpZWxkSXNBcnJheUZpZWxkLFxuICAgIH07XG4gIH0pO1xuICByZXR1cm4gc2VhcmNoRmllbGRTZWN0aW9ucy5jb25jYXQoc2VjdGlvbnMpO1xufTtcblxuZXhwb3J0IGNvbnN0IGV4Y2x1ZGVTZWxmRmlsdGVyRnJvbUFnZ3NEYXRhID0gKHJlY2VpdmVkQWdnc0RhdGEsIGZpbHRlclJlc3VsdHMpID0+IHtcbiAgaWYgKCFmaWx0ZXJSZXN1bHRzKSByZXR1cm4gcmVjZWl2ZWRBZ2dzRGF0YTtcbiAgY29uc3QgcmVzdWx0QWdnc0RhdGEgPSB7fTtcbiAgY29uc3QgZmxhdHRlbkFnZ3NEYXRhID0gZmxhdChyZWNlaXZlZEFnZ3NEYXRhLCB7IHNhZmU6IHRydWUgfSk7XG4gIE9iamVjdC5rZXlzKGZsYXR0ZW5BZ2dzRGF0YSkuZm9yRWFjaCgoZmllbGQpID0+IHtcbiAgICBjb25zdCBhY3R1YWxGaWVsZE5hbWUgPSBmaWVsZC5yZXBsYWNlKCcuaGlzdG9ncmFtJywgJycpLnJlcGxhY2UoJy5hc1RleHRIaXN0b2dyYW0nLCAnJyk7XG4gICAgY29uc3QgaGlzdG9ncmFtID0gZmxhdHRlbkFnZ3NEYXRhW2Ake2ZpZWxkfWBdO1xuICAgIGlmICghaGlzdG9ncmFtKSByZXR1cm47XG4gICAgaWYgKGFjdHVhbEZpZWxkTmFtZSBpbiBmaWx0ZXJSZXN1bHRzKSB7XG4gICAgICBsZXQgcmVzdWx0SGlzdG9ncmFtID0gW107XG4gICAgICBpZiAodHlwZW9mIGZpbHRlclJlc3VsdHNbYCR7YWN0dWFsRmllbGROYW1lfWBdLnNlbGVjdGVkVmFsdWVzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zdCB7IHNlbGVjdGVkVmFsdWVzIH0gPSBmaWx0ZXJSZXN1bHRzW2Ake2FjdHVhbEZpZWxkTmFtZX1gXTtcbiAgICAgICAgcmVzdWx0SGlzdG9ncmFtID0gaGlzdG9ncmFtLmZpbHRlcigoYnVja2V0KSA9PiBzZWxlY3RlZFZhbHVlcy5pbmNsdWRlcyhidWNrZXQua2V5KSk7XG4gICAgICB9XG4gICAgICByZXN1bHRBZ2dzRGF0YVtgJHthY3R1YWxGaWVsZE5hbWV9YF0gPSB7IGhpc3RvZ3JhbTogcmVzdWx0SGlzdG9ncmFtIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdEFnZ3NEYXRhW2Ake2FjdHVhbEZpZWxkTmFtZX1gXSA9IHsgaGlzdG9ncmFtOiBmbGF0dGVuQWdnc0RhdGFbYCR7ZmllbGR9YF0gfTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0QWdnc0RhdGE7XG59O1xuIl0sIm1hcHBpbmdzIjoia0xBQUEsSUFBQUEsS0FBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBQ0EsSUFBQUMsUUFBQSxHQUFBRCxPQUFBLHFCQUFzRSxTQUFBRCx1QkFBQUcsQ0FBQSxVQUFBQSxDQUFBLElBQUFBLENBQUEsQ0FBQUMsVUFBQSxHQUFBRCxDQUFBLGdCQUFBQSxDQUFBLGFBQUFFLFFBQUFDLENBQUEsb0NBQUFELE9BQUEsd0JBQUFFLE1BQUEsdUJBQUFBLE1BQUEsQ0FBQUMsUUFBQSxhQUFBRixDQUFBLGlCQUFBQSxDQUFBLGVBQUFBLENBQUEsVUFBQUEsQ0FBQSx5QkFBQUMsTUFBQSxJQUFBRCxDQUFBLENBQUFHLFdBQUEsS0FBQUYsTUFBQSxJQUFBRCxDQUFBLEtBQUFDLE1BQUEsQ0FBQUcsU0FBQSxxQkFBQUosQ0FBQSxJQUFBRCxPQUFBLENBQUFDLENBQUEsWUFBQUssUUFBQVIsQ0FBQSxFQUFBUyxDQUFBLE9BQUFDLENBQUEsR0FBQUMsTUFBQSxDQUFBQyxJQUFBLENBQUFaLENBQUEsTUFBQVcsTUFBQSxDQUFBRSxxQkFBQSxPQUFBVixDQUFBLEdBQUFRLE1BQUEsQ0FBQUUscUJBQUEsQ0FBQWIsQ0FBQSxFQUFBUyxDQUFBLEtBQUFOLENBQUEsR0FBQUEsQ0FBQSxDQUFBVyxNQUFB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