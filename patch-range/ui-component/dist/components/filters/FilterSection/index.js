"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _rcTooltip = _interopRequireDefault(require("rc-tooltip"));
require("rc-tooltip/assets/bootstrap_white.css");
var _antd = require("antd");
require("antd/dist/antd.css");
var _reactSelectAsyncPaginate = require("react-select-async-paginate");
var _SingleSelectFilter = _interopRequireDefault(require("../SingleSelectFilter"));
var _Chip = _interopRequireDefault(require("../Chip"));
var _RangeFilter = _interopRequireDefault(require("../RangeFilter"));
require("./FilterSection.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var filterVisibleStatusObj = function filterVisibleStatusObj(optionList, inputText) {
  var res = {};
  optionList.forEach(function (o) {
    if (typeof inputText === 'undefined') {
      res[o.text] = true;
    } else {
      var matched = o.text.toLowerCase().indexOf(inputText.toLowerCase()) >= 0;
      res[o.text] = matched;
    }
  });
  return res;
};
var getNumValuesSelected = function getNumValuesSelected(filterStatus) {
  var numSelected = 0;
  if (Array.isArray(filterStatus)) {
    numSelected = 1;
    return numSelected;
  }
  var statuses = Object.values(filterStatus);
  statuses.forEach(function (status) {
    if (status === true || Array.isArray(status)) {
      numSelected += 1;
    }
  });
  return numSelected;
};
var FilterSection = /*#__PURE__*/function (_React$Component) {
  _inherits(FilterSection, _React$Component);
  var _super = _createSuper(FilterSection);
  function FilterSection(props) {
    var _this;
    _classCallCheck(this, FilterSection);
    _this = _super.call(this, props);
    var initialFilterStatus = _objectSpread({}, _this.props.filterStatus);
    _this.state = {
      isExpanded: _this.props.expanded,
      showingMore: false,
      // shape: { [fieldName]: true | false } | [number, number]
      filterStatus: initialFilterStatus,
      searchInputEmpty: true,
      showingSearch: false,
      showingAndOrToggle: false,
      combineMode: 'OR',
      // used for rerendering child components when reset button is clicked
      resetClickCounter: 0,
      // option visible status filtered by the search inputbox
      optionsVisibleStatus: filterVisibleStatusObj(_this.props.options)
    };
    _this.inputElem = /*#__PURE__*/_react["default"].createRef();
    _this.combineModeFieldName = '__combineMode';
    _this.handleSetCombineModeOption = _this.handleSetCombineModeOption.bind(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(FilterSection, [{
    key: "handleSetCombineModeOption",
    value: function handleSetCombineModeOption(combineModeIn) {
      // Combine mode: AND or OR
      this.setState({
        combineMode: combineModeIn
      });
      this.props.onCombineOptionToggle(this.combineModeFieldName, combineModeIn);
    }
  }, {
    key: "handleClearButtonClick",
    value: function handleClearButtonClick(ev) {
      // Prevent this click from triggering any onClick events in parent component
      ev.stopPropagation();
      // Clear the filters
      this.setState(function (prevState) {
        return {
          filterStatus: {},
          resetClickCounter: prevState.resetClickCounter + 1
        };
      });
      this.props.onClear();
    }
  }, {
    key: "handleSearchInputChange",
    value: function handleSearchInputChange() {
      var currentInput = this.inputElem.current.value;
      this.setState({
        searchInputEmpty: !currentInput || currentInput.length === 0
      });
      this.updateVisibleOptions(currentInput);
    }
  }, {
    key: "handleSelectSingleSelectFilter",
    value: function handleSelectSingleSelectFilter(label) {
      this.setState(function (prevState) {
        var newFilterStatus = _objectSpread({}, prevState.filterStatus);
        var oldSelected = newFilterStatus[label];
        var newSelected = typeof oldSelected === 'undefined' ? true : !oldSelected;
        newFilterStatus[label] = newSelected;
        return {
          filterStatus: newFilterStatus
        };
      });
      this.props.onSelect(label);
    }
  }, {
    key: "handleDragRangeFilter",
    value: function handleDragRangeFilter(lowerBound, upperBound, minValue, maxValue, rangeStep) {
      this.setState(function () {
        var newFilterStatus = [lowerBound, upperBound];
        return {
          filterStatus: newFilterStatus
        };
      });
      this.props.onAfterDrag(lowerBound, upperBound, minValue, maxValue, rangeStep);
    }
  }, {
    key: "getSearchInput",
    value: function getSearchInput() {
      var _this2 = this;
      var isHidden = !this.state.showingSearch || !this.state.isExpanded;
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__search-input ".concat(isHidden && 'g3-filter-section__hidden')
      }, /*#__PURE__*/_react["default"].createElement("input", {
        className: "g3-filter-section__search-input-box body",
        onChange: function onChange() {
          _this2.handleSearchInputChange();
        },
        ref: this.inputElem
      }), /*#__PURE__*/_react["default"].createElement("i", {
        className: "g3-icon g3-icon--".concat(this.state.searchInputEmpty ? 'search' : 'cross', " g3-filter-section__search-input-close"),
        onClick: function onClick() {
          return _this2.state.searchInputEmpty || _this2.clearSearchInput();
        },
        onKeyPress: function onKeyPress() {
          return _this2.state.searchInputEmpty || _this2.clearSearchInput();
        },
        role: "button",
        "aria-label": "clear search",
        tabIndex: 0
      }));
    }
  }, {
    key: "getAndOrToggle",
    value: function getAndOrToggle() {
      var _this3 = this;
      var isHidden = !this.state.showingAndOrToggle || !this.state.isExpanded;
      var tooltipText = 'This toggle selects the logical operator used to combine checked filter options. ' + 'If AND is set, records must match all checked filter options. ' + 'If OR is set, records must match at least one checked option.';
      return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__and-or-toggle ".concat(isHidden && 'g3-filter-section__hidden'),
        id: "g3-filter-section__and-or-toggle-".concat(this.props.index)
      }, /*#__PURE__*/_react["default"].createElement("span", {
        style: {
          marginRight: '5px'
        }
      }, "Combine with "), /*#__PURE__*/_react["default"].createElement(_antd.Radio.Group, {
        defaultValue: this.state.combineMode,
        buttonStyle: "solid"
      }, /*#__PURE__*/_react["default"].createElement(_antd.Radio.Button, {
        value: "AND",
        "data-toggle-value": "AND",
        onKeyPress: function onKeyPress(event) {
          /*
            Here, we manually pass the Enter keypress to the sibling label.
            Radio.Button splits into a label and an input,
            but only the non-event-bound input gains focus in the tab order.
            This pass-through code allows for accessible tab-navigation.
            The method is verbose due to:
            https://github.com/ant-design/ant-design/issues/8305
          */
          if (event.key === 'Enter') {
            var thisToggle = document.getElementById("g3-filter-section__and-or-toggle-".concat(_this3.props.index));
            var labels = thisToggle.getElementsByTagName('label');
            for (var i = 0; i < labels.length; i += 1) {
              if (labels[i].innerText === 'AND') {
                labels[i].click();
                break;
              }
            }
          }
        },
        onClick: function onClick() {
          return _this3.handleSetCombineModeOption('AND');
        },
        onChange: function onChange() {
          return _this3.handleSetCombineModeOption('AND');
        },
        tabIndex: "0",
        className: "g3-ring-on-focus"
      }, "AND"), /*#__PURE__*/_react["default"].createElement(_antd.Radio.Button, {
        value: "OR",
        "data-toggle-value": "OR",
        onKeyPress: function onKeyPress(event) {
          if (event.key === 'Enter') {
            var thisToggle = document.getElementById("g3-filter-section__and-or-toggle-".concat(_this3.props.index));
            var labels = thisToggle.getElementsByTagName('label');
            for (var i = 0; i < labels.length; i += 1) {
              if (labels[i].innerText === 'OR') {
                labels[i].click();
                break;
              }
            }
          }
        },
        onClick: function onClick() {
          return _this3.handleSetCombineModeOption('OR');
        },
        onChange: function onChange() {
          return _this3.handleSetCombineModeOption('OR');
        },
        tabIndex: "0",
        className: "g3-ring-on-focus"
      }, "OR")), /*#__PURE__*/_react["default"].createElement(_rcTooltip["default"], {
        placement: "right",
        overlay: tooltipText,
        overlayClassName: "g3-filter-section__and-or-toggle-helper-tooltip",
        arrowContent: /*#__PURE__*/_react["default"].createElement("div", {
          className: "rc-tooltip-arrow-inner"
        }),
        width: "300px",
        trigger: ['hover', 'focus']
      }, /*#__PURE__*/_react["default"].createElement("span", {
        className: "g3-helper-tooltip"
      }, /*#__PURE__*/_react["default"].createElement("i", {
        className: "g3-icon g3-icon--sm g3-icon--question-mark-bootstrap help-tooltip-icon"
      })))));
    }
  }, {
    key: "getSearchFilter",
    value: function getSearchFilter() {
      var _this4 = this;
      var selectedOptions = Object.entries(this.state.filterStatus).filter(function (kv) {
        return kv[1] === true;
      }).map(function (kv) {
        return {
          value: kv[0],
          label: kv[0]
        };
      });
      return /*#__PURE__*/_react["default"].createElement(_reactSelectAsyncPaginate.AsyncPaginate, {
        className: "".concat(this.state.isExpanded ? '' : 'g3-filter-section__search-filter--hidden'),
        cacheOptions: true,
        controlShouldRenderValue: false,
        defaultOptions: true,
        debounceTimeout: 250,
        value: selectedOptions,
        loadOptions: function loadOptions(input, loadedOptions) {
          return _this4.props.onSearchFilterLoadOptions(input, loadedOptions.length);
        },
        onChange: function onChange(option) {
          return _this4.handleSelectSingleSelectFilter(option.value);
        }
      });
    }
  }, {
    key: "getShowMoreButton",
    value: function getShowMoreButton() {
      var _this5 = this;
      if (this.state.isExpanded) {
        var totalCount = this.props.options.filter(function (o) {
          return o.count > 0 || !_this5.props.hideZero || o.count === -1;
        }).filter(function (o) {
          return _this5.state.optionsVisibleStatus[o.text];
        }).length;
        if (totalCount > this.props.initVisibleItemNumber) {
          if (this.state.showingMore) {
            return /*#__PURE__*/_react["default"].createElement("div", {
              className: "g3-filter-section__show-more",
              role: "button",
              onClick: function onClick() {
                return _this5.toggleShowMore();
              },
              onKeyPress: function onKeyPress() {
                return _this5.toggleShowMore();
              },
              tabIndex: 0
            }, "less");
          }
          var moreCount = totalCount - this.props.initVisibleItemNumber;
          return /*#__PURE__*/_react["default"].createElement("div", {
            className: "g3-filter-section__show-more",
            role: "button",
            onClick: function onClick() {
              return _this5.toggleShowMore();
            },
            onKeyPress: function onKeyPress() {
              return _this5.toggleShowMore();
            },
            tabIndex: 0
          }, moreCount.toLocaleString(), "\xA0more");
        }
        return null;
      }
      return null;
    }
  }, {
    key: "clearSearchInput",
    value: function clearSearchInput() {
      this.inputElem.current.value = '';
      this.setState({
        searchInputEmpty: true
      });
      this.updateVisibleOptions();
    }
  }, {
    key: "updateVisibleOptions",
    value: function updateVisibleOptions(inputText) {
      // if empty input, all should be visible
      if (typeof inputText === 'undefined' || inputText.trim() === '') {
        this.setState({
          optionsVisibleStatus: filterVisibleStatusObj(this.props.options)
        });
      }

      // if not empty, filter out those matched
      this.setState({
        optionsVisibleStatus: filterVisibleStatusObj(this.props.options, inputText)
      });
    }
  }, {
    key: "toggleSection",
    value: function toggleSection(open) {
      var targetStatus;
      if (typeof open === 'undefined') {
        targetStatus = !this.state.isExpanded;
      } else {
        targetStatus = open;
      }
      this.props.onToggle(targetStatus);
      this.setState({
        isExpanded: targetStatus
      });
    }
  }, {
    key: "toggleShowSearch",
    value: function toggleShowSearch() {
      // If and/or toggle is shown, hide it before showing the search input.
      this.setState(function (prevState) {
        return {
          showingSearch: !prevState.showingSearch,
          showingAndOrToggle: false
        };
      });
    }
  }, {
    key: "toggleShowAndOrToggle",
    value: function toggleShowAndOrToggle() {
      // If search input is shown, hide it before showing the and/or toggle.
      this.setState(function (prevState) {
        return {
          showingAndOrToggle: !prevState.showingAndOrToggle,
          showingSearch: false
        };
      });
    }
  }, {
    key: "toggleShowMore",
    value: function toggleShowMore() {
      this.setState(function (prevState) {
        return {
          showingMore: !prevState.showingMore
        };
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this6 = this;
      // Takes in parent component's filterStatus or self state's filterStatus
      var filterStatus = this.props.filterStatus ? this.props.filterStatus : this.state.filterStatus;
      var isSearchFilter = false;
      var isTextFilter = false;
      var isRangeFilter = false;
      if (this.props.isSearchFilter) {
        isSearchFilter = true;
      } else if (this.props.options.length > 0 && this.props.options[0].filterType === 'singleSelect') {
        isTextFilter = true;
      } else {
        isRangeFilter = true;
      }
      var numSelected = getNumValuesSelected(filterStatus);
      var sectionHeader = /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__header g3-ring-on-focus"
      }, /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__toggle-icon-container"
      }, /*#__PURE__*/_react["default"].createElement("i", {
        onClick: function onClick() {
          return _this6.toggleSection();
        },
        onKeyPress: function onKeyPress() {
          return _this6.toggleSection();
        },
        tabIndex: 0,
        role: "button",
        "aria-label": "toggle section",
        className: "g3-filter-section__toggle-icon g3-icon g3-icon-color__coal\n                g3-icon--sm g3-icon--chevron-".concat(this.state.isExpanded ? 'down' : 'right')
      })), /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__title-container",
        onClick: function onClick() {
          return _this6.toggleSection();
        },
        onKeyPress: function onKeyPress() {
          return _this6.toggleSection();
        },
        tabIndex: -1,
        role: "button",
        "aria-expanded": this.state.isExpanded
      }, /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__title ".concat(numSelected !== 0 ? 'g3-filter-section__title--active' : '')
      }, this.props.title), isRangeFilter && numSelected !== 0 && /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__selected-count-chip"
      }, /*#__PURE__*/_react["default"].createElement("div", {
        tabIndex: 0,
        role: "button",
        onClick: function onClick(ev) {
          return _this6.handleClearButtonClick(ev);
        },
        onKeyPress: function onKeyPress(ev) {
          return _this6.handleClearButtonClick(ev);
        },
        className: "g3-filter-section__range-filter-clear-btn"
      }, /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__range-filter-clear-btn-text"
      }, "reset"), /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__range-filter-clear-btn-icon"
      }, /*#__PURE__*/_react["default"].createElement("i", {
        className: "g3-icon g3-icon--sm g3-icon-color__lightgray g3-icon--sm g3-icon--undo"
      })))), (isTextFilter || isSearchFilter) && numSelected !== 0 && /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__selected-count-chip"
      }, /*#__PURE__*/_react["default"].createElement(_Chip["default"], {
        text: /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement("span", {
          className: "g3-filter-section__selected-count-chip-text-emphasis"
        }, numSelected), "\xA0selected"),
        onClearButtonClick: function onClearButtonClick(ev) {
          return _this6.handleClearButtonClick(ev);
        }
      }))), isTextFilter && this.props.isArrayField && /*#__PURE__*/_react["default"].createElement("div", {
        tabIndex: 0,
        role: "button",
        onClick: function onClick() {
          return _this6.toggleShowAndOrToggle();
        },
        onKeyPress: function onKeyPress() {
          return _this6.toggleShowAndOrToggle();
        },
        "aria-expanded": this.state.showingAndOrToggle
      }, /*#__PURE__*/_react["default"].createElement("i", {
        className: "g3-filter-section__toggle-icon g3-icon g3-icon--sm g3-icon--gear"
      })), isTextFilter && /*#__PURE__*/_react["default"].createElement("div", {
        tabIndex: 0,
        role: "button",
        onClick: function onClick() {
          return _this6.toggleShowSearch();
        },
        onKeyPress: function onKeyPress() {
          return _this6.toggleShowSearch();
        }
      }, /*#__PURE__*/_react["default"].createElement("i", {
        className: "g3-filter-section__search-icon g3-icon g3-icon--sm g3-icon--search"
      })));
      return /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section"
      }, this.props.tooltip ? /*#__PURE__*/_react["default"].createElement(_rcTooltip["default"], {
        placement: "topLeft",
        overlay: /*#__PURE__*/_react["default"].createElement("span", null, this.props.tooltip),
        arrowContent: /*#__PURE__*/_react["default"].createElement("div", {
          className: "rc-tooltip-arrow-inner"
        }),
        overlayClassName: "g3-filter-section__tooltip"
      }, sectionHeader) : sectionHeader, isTextFilter && this.getSearchInput(), this.props.isArrayField && this.getAndOrToggle(), isSearchFilter && this.getSearchFilter(Option), /*#__PURE__*/_react["default"].createElement("div", {
        className: "g3-filter-section__options"
      }, (isTextFilter || isSearchFilter) && this.state.isExpanded ? this.props.options.filter(function (option) {
        if (isSearchFilter) {
          // For searchFilters, options are treated differently -- the only
          // options passed are the already selected options, as opposed
          // to all available options in textfilters. So don't filter out
          // any options based on `optionsVisibleStatus`.
          return true;
        }
        return _this6.state.optionsVisibleStatus[option.text];
      }).map(function (option, index) {
        if (index >= _this6.props.initVisibleItemNumber && !_this6.state.showingMore) {
          return null;
        }
        return (
          /*#__PURE__*/
          // We use the 'key' prop to force the SingleSelectFilter
          // to rerender on filterStatus change.
          // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
          _react["default"].createElement(_SingleSelectFilter["default"], {
            key: "".concat(option.text, "-").concat(filterStatus[option.text] ? 'enabled' : 'disabled'),
            label: option.text,
            onSelect: function onSelect(label) {
              return _this6.handleSelectSingleSelectFilter(label);
            },
            selected: filterStatus[option.text],
            count: isSearchFilter ? null : option.count,
            hideZero: _this6.props.hideZero,
            accessible: option.accessible,
            tierAccessLimit: _this6.props.tierAccessLimit,
            disabled: option.disabled,
            lockedTooltipMessage: _this6.props.lockedTooltipMessage,
            disabledTooltipMessage: _this6.props.disabledTooltipMessage
          })
        );
      }) : null, isRangeFilter && this.state.isExpanded ? this.props.options.filter(function (option) {
        return _this6.state.optionsVisibleStatus[option.text];
      }).map(function (option, index) {
        if (index >= _this6.props.initVisibleItemNumber && !_this6.state.showingMore) {
          return null;
        }
        var lowerBound = typeof filterStatus === 'undefined' || filterStatus.length !== 2 ? undefined : filterStatus[0];
        var upperBound = typeof filterStatus === 'undefined' || filterStatus.length !== 2 ? undefined : filterStatus[1];
        // We use the 'key' prop to force the SingleSelectFilter
        // to rerender if the `reset` button is clicked.
        // Each reset button click increments the counter and changes the key.
        // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
        var key = "".concat(option.text, "-").concat(option.min, "-").concat(option.max, "-").concat(lowerBound, "-").concat(upperBound, "-").concat(_this6.state.resetClickCounter);
        // NOTE: We set hideValue={-1} here because Guppy returns a count of -1
        // when the count is hidden from the end user.
        var hideValue = -1;
        return /*#__PURE__*/_react["default"].createElement(_RangeFilter["default"], {
          key: key,
          label: option.text,
          min: option.min,
          max: option.max,
          // PATCH range-slider-decimal-fix: forward dynamically computed
          // rangeStep / decimalDigitsLen (added by @gen3/guppy patch) so the
          // rc-slider supports fractional data domains (e.g. 0.149 - 0.856).
          rangeStep: option.rangeStep,
          decimalDigitsLen: option.decimalDigitsLen,
          onAfterDrag: function onAfterDrag(lb, ub, min, max, step) {
            return _this6.handleDragRangeFilter(lb, ub, min, max, step);
          },
          lowerBound: lowerBound,
          upperBound: upperBound,
          inactive: lowerBound === undefined && upperBound === undefined,
          count: option.count,
          hideValue: hideValue
        });
      }) : null, isTextFilter && this.getShowMoreButton()));
    }
  }]);
  return FilterSection;
}(_react["default"].Component);
FilterSection.propTypes = {
  title: _propTypes["default"].string,
  tooltip: _propTypes["default"].string,
  options: _propTypes["default"].arrayOf(_propTypes["default"].shape({
    filterType: _propTypes["default"].oneOf(['singleSelect', 'range']).isRequired,
    text: _propTypes["default"].string,
    count: _propTypes["default"].number,
    // both filters need this for access control

    // for single select filter
    accessible: _propTypes["default"].bool,
    disabled: _propTypes["default"].bool,
    // for range filter
    min: _propTypes["default"].number,
    max: _propTypes["default"].number,
    rangeStep: _propTypes["default"].number // by default 1
  })),

  onSelect: _propTypes["default"].func.isRequired,
  onCombineOptionToggle: _propTypes["default"].func,
  onAfterDrag: _propTypes["default"].func.isRequired,
  onClear: _propTypes["default"].func,
  expanded: _propTypes["default"].bool,
  onToggle: _propTypes["default"].func,
  filterStatus: _propTypes["default"].oneOfType([_propTypes["default"].object, _propTypes["default"].arrayOf(_propTypes["default"].number)]),
  initVisibleItemNumber: _propTypes["default"].number,
  hideZero: _propTypes["default"].bool,
  tierAccessLimit: _propTypes["default"].number,
  lockedTooltipMessage: _propTypes["default"].string,
  disabledTooltipMessage: _propTypes["default"].string,
  isSearchFilter: _propTypes["default"].bool,
  onSearchFilterLoadOptions: _propTypes["default"].func,
  isArrayField: _propTypes["default"].bool,
  index: _propTypes["default"].number
};
FilterSection.defaultProps = {
  title: '',
  tooltip: null,
  options: [],
  expanded: true,
  onToggle: function onToggle() {},
  onClear: function onClear() {},
  onCombineOptionToggle: function onCombineOptionToggle() {},
  filterStatus: undefined,
  initVisibleItemNumber: 5,
  hideZero: true,
  tierAccessLimit: undefined,
  lockedTooltipMessage: '',
  disabledTooltipMessage: '',
  isSearchFilter: false,
  isArrayField: false,
  onSearchFilterLoadOptions: function onSearchFilterLoadOptions() {
    return null;
  },
  index: 0
};
var _default = FilterSection;
exports["default"] = _default;