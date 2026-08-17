window.__ModuleLoader__.load({ id: "@fakechris/dsh-track", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let react_jsx_runtime = require("react/jsx-runtime");
let react = require("react");
react = __toESM(react, 1);
let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
let react_dom_client = require("react-dom/client");
//#region lib/client/strip.js
/**
* TrackStrip: the composer-dock strip surfacing capture-wall state. Styles
* are inline (no CSS modules) so the client bundle needs no CSS pipeline.
*
* The count is fetched from the host API and re-polled while the app is
* open (same cadence as the right panel's auto-refresh), so the badge never
* lies — the previous version hardcoded `captures: 0` and always showed
* "暂无捕获 / No captures" (2026-08-13).
* @module @deepseek-ai/dsh-track/client/strip
*/
const style = {
	strip: {
		display: "inline-flex",
		alignItems: "center",
		gap: 8,
		padding: "2px 8px",
		border: "1px solid rgba(128, 128, 128, 0.3)",
		borderRadius: 6,
		background: "transparent",
		color: "inherit",
		fontSize: 12,
		cursor: "pointer"
	},
	label: { fontWeight: 600 },
	badge: {
		padding: "0 6px",
		borderRadius: 999,
		background: "#4c8dff",
		color: "#fff",
		fontSize: 11,
		lineHeight: "16px"
	},
	muted: { opacity: .7 },
	empty: {
		opacity: .55,
		fontStyle: "italic"
	}
};
const REFRESH_MS = 2e4;
/** Track strip component: label + live open capture count, click opens the panel. */
function TrackStrip({ captures: initial, onClick, t }) {
	const [captures, setCaptures] = (0, react.useState)(initial ?? 0);
	(0, react.useEffect)(() => {
		let alive = true;
		const load = () => {
			fetch("/api/track/captures").then((r) => r.json()).then((data) => {
				if (!alive) return;
				const open = (data.captures ?? []).filter((c) => c.status === "open").length;
				setCaptures(open);
			}).catch(() => {});
		};
		load();
		const id = window.setInterval(load, REFRESH_MS);
		window.addEventListener("focus", load);
		return () => {
			alive = false;
			window.clearInterval(id);
			window.removeEventListener("focus", load);
		};
	}, []);
	return (0, react_jsx_runtime.jsxs)("button", {
		type: "button",
		style: style.strip,
		"data-testid": "track-strip",
		onClick,
		title: t("strip.title"),
		children: [(0, react_jsx_runtime.jsx)("span", {
			style: style.label,
			children: t("strip.label")
		}), captures > 0 ? (0, react_jsx_runtime.jsx)("span", {
			style: style.badge,
			children: t(captures === 1 ? "strip.captures.one" : "strip.captures", { n: captures })
		}) : (0, react_jsx_runtime.jsx)("span", {
			style: style.empty,
			children: t("strip.empty")
		})]
	});
}
//#endregion
//#region lib/client/locales.js
/**
* Track strip copy — locale keys and zh/en dictionaries.
* @module @fakechris/dsh-track/client/locales
*/
/** Simplified Chinese dictionary (the key-set source of truth). */
const zh = {
	"strip.label": "Track",
	"strip.captures": "{n} 条捕获",
	"strip.captures.one": "{n} 条捕获",
	"strip.empty": "暂无捕获",
	"strip.title": "打开 Track 面板"
};
/** English dictionary, checked complete against the zh key set. */
const en = {
	"strip.label": "Track",
	"strip.captures": "{n} captures",
	"strip.captures.one": "{n} capture",
	"strip.empty": "No captures",
	"strip.title": "Open the Track panel"
};
/** Locale namespace registered on the client locale service. */
const NS = "track";
//#endregion
//#region node_modules/.pnpm/jerrypick@1.1.2/node_modules/jerrypick/dist/jerrypick.mjs
function _iterableToArrayLimit$4(arr, i) {
	var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
	if (null != _i) {
		var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1;
		try {
			if (_x = (_i = _i.call(arr)).next, 0 === i) {
				if (Object(_i) !== _i) return;
				_n = !1;
			} else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
		} catch (err) {
			_d = !0, _e = err;
		} finally {
			try {
				if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
			} finally {
				if (_d) throw _e;
			}
		}
		return _arr;
	}
}
function _defineProperty$2(obj, key, value) {
	key = _toPropertyKey$4(key);
	if (key in obj) Object.defineProperty(obj, key, {
		value,
		enumerable: true,
		configurable: true,
		writable: true
	});
	else obj[key] = value;
	return obj;
}
function _slicedToArray$4(arr, i) {
	return _arrayWithHoles$4(arr) || _iterableToArrayLimit$4(arr, i) || _unsupportedIterableToArray$5(arr, i) || _nonIterableRest$4();
}
function _toConsumableArray$3(arr) {
	return _arrayWithoutHoles$3(arr) || _iterableToArray$3(arr) || _unsupportedIterableToArray$5(arr) || _nonIterableSpread$3();
}
function _arrayWithoutHoles$3(arr) {
	if (Array.isArray(arr)) return _arrayLikeToArray$5(arr);
}
function _arrayWithHoles$4(arr) {
	if (Array.isArray(arr)) return arr;
}
function _iterableToArray$3(iter) {
	if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray$5(o, minLen) {
	if (!o) return;
	if (typeof o === "string") return _arrayLikeToArray$5(o, minLen);
	var n = Object.prototype.toString.call(o).slice(8, -1);
	if (n === "Object" && o.constructor) n = o.constructor.name;
	if (n === "Map" || n === "Set") return Array.from(o);
	if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$5(o, minLen);
}
function _arrayLikeToArray$5(arr, len) {
	if (len == null || len > arr.length) len = arr.length;
	for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
	return arr2;
}
function _nonIterableSpread$3() {
	throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableRest$4() {
	throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toPrimitive$4(input, hint) {
	if (typeof input !== "object" || input === null) return input;
	var prim = input[Symbol.toPrimitive];
	if (prim !== void 0) {
		var res = prim.call(input, hint || "default");
		if (typeof res !== "object") return res;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey$4(arg) {
	var key = _toPrimitive$4(arg, "string");
	return typeof key === "symbol" ? key : String(key);
}
var omit = function omit(obj, keys) {
	var keySet = new Set(keys);
	return Object.assign.apply(Object, [{}].concat(_toConsumableArray$3(Object.entries(obj).filter(function(_ref2) {
		var key = _slicedToArray$4(_ref2, 1)[0];
		return !keySet.has(key);
	}).map(function(_ref4) {
		var _ref5 = _slicedToArray$4(_ref4, 2), key = _ref5[0], val = _ref5[1];
		return _defineProperty$2({}, key, val);
	}))));
};
//#endregion
//#region node_modules/.pnpm/react-kapsule@2.6.0_react@19.2.8/node_modules/react-kapsule/dist/react-kapsule.mjs
function index$5(kapsuleComponent, { wrapperElementType = "div", nodeMapper = (node) => node, methodNames = [], initPropNames = [] } = {}) {
	return /*#__PURE__*/ (0, react.forwardRef)((props, ref) => {
		const domEl = (0, react.useRef)();
		const comp = (0, react.useMemo)(() => {
			return kapsuleComponent(Object.fromEntries(initPropNames.filter((p) => props.hasOwnProperty(p)).map((prop) => [prop, props[prop]])));
		}, []);
		useEffectOnce(() => {
			comp(nodeMapper(domEl.current));
		}, react.useLayoutEffect);
		useEffectOnce(() => {
			return comp._destructor instanceof Function ? comp._destructor : void 0;
		});
		const _call = (0, react.useCallback)((method, ...args) => comp[method] instanceof Function ? comp[method](...args) : void 0, [comp]);
		const prevPropsRef = (0, react.useRef)({});
		Object.keys(omit(props, [...methodNames, ...initPropNames])).filter((p) => prevPropsRef.current[p] !== props[p]).forEach((p) => _call(p, props[p]));
		prevPropsRef.current = props;
		(0, react.useImperativeHandle)(ref, () => Object.fromEntries(methodNames.map((method) => [method, (...args) => _call(method, ...args)])), [_call]);
		return /*#__PURE__*/ react.default.createElement(wrapperElementType, { ref: domEl });
	});
}
function useEffectOnce(effect, useEffectFn = react.useEffect) {
	const destroyFunc = (0, react.useRef)();
	const effectCalled = (0, react.useRef)(false);
	const renderAfterCalled = (0, react.useRef)(false);
	const [val, setVal] = (0, react.useState)(0);
	if (effectCalled.current) renderAfterCalled.current = true;
	useEffectFn(() => {
		if (!effectCalled.current) {
			destroyFunc.current = effect();
			effectCalled.current = true;
		}
		setVal((val) => val + 1);
		return () => {
			if (!renderAfterCalled.current) return;
			if (destroyFunc.current) destroyFunc.current();
			destroyFunc.current = void 0;
			effectCalled.current = false;
			renderAfterCalled.current = false;
		};
	}, []);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/matcher.js
function matcher_default(selector) {
	return function() {
		return this.matches(selector);
	};
}
function childMatcher(selector) {
	return function(node) {
		return node.matches(selector);
	};
}
var namespaces_default = {
	svg: "http://www.w3.org/2000/svg",
	xhtml: "http://www.w3.org/1999/xhtml",
	xlink: "http://www.w3.org/1999/xlink",
	xml: "http://www.w3.org/XML/1998/namespace",
	xmlns: "http://www.w3.org/2000/xmlns/"
};
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/namespace.js
function namespace_default(name) {
	var prefix = name += "", i = prefix.indexOf(":");
	if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
	return namespaces_default.hasOwnProperty(prefix) ? {
		space: namespaces_default[prefix],
		local: name
	} : name;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/sourceEvent.js
function sourceEvent_default(event) {
	let sourceEvent;
	while (sourceEvent = event.sourceEvent) event = sourceEvent;
	return event;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/pointer.js
function pointer_default(event, node) {
	event = sourceEvent_default(event);
	if (node === void 0) node = event.currentTarget;
	if (node) {
		var svg = node.ownerSVGElement || node;
		if (svg.createSVGPoint) {
			var point = svg.createSVGPoint();
			point.x = event.clientX, point.y = event.clientY;
			point = point.matrixTransform(node.getScreenCTM().inverse());
			return [point.x, point.y];
		}
		if (node.getBoundingClientRect) {
			var rect = node.getBoundingClientRect();
			return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
		}
	}
	return [event.pageX, event.pageY];
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selector.js
function none() {}
function selector_default(selector) {
	return selector == null ? none : function() {
		return this.querySelector(selector);
	};
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/select.js
function select_default$2(select) {
	if (typeof select !== "function") select = selector_default(select);
	for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
		if ("__data__" in node) subnode.__data__ = node.__data__;
		subgroup[i] = subnode;
	}
	return new Selection$1(subgroups, this._parents);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/array.js
function array(x) {
	return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selectorAll.js
function empty() {
	return [];
}
function selectorAll_default(selector) {
	return selector == null ? empty : function() {
		return this.querySelectorAll(selector);
	};
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/selectAll.js
function arrayAll(select) {
	return function() {
		return array(select.apply(this, arguments));
	};
}
function selectAll_default$1(select) {
	if (typeof select === "function") select = arrayAll(select);
	else select = selectorAll_default(select);
	for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) if (node = group[i]) {
		subgroups.push(select.call(node, node.__data__, i, group));
		parents.push(node);
	}
	return new Selection$1(subgroups, parents);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/selectChild.js
var find$1 = Array.prototype.find;
function childFind(match) {
	return function() {
		return find$1.call(this.children, match);
	};
}
function childFirst() {
	return this.firstElementChild;
}
function selectChild_default(match) {
	return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/selectChildren.js
var filter = Array.prototype.filter;
function children() {
	return Array.from(this.children);
}
function childrenFilter(match) {
	return function() {
		return filter.call(this.children, match);
	};
}
function selectChildren_default(match) {
	return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/filter.js
function filter_default$1(match) {
	if (typeof match !== "function") match = matcher_default(match);
	for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) if ((node = group[i]) && match.call(node, node.__data__, i, group)) subgroup.push(node);
	return new Selection$1(subgroups, this._parents);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/sparse.js
function sparse_default(update) {
	return new Array(update.length);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/enter.js
function enter_default() {
	return new Selection$1(this._enter || this._groups.map(sparse_default), this._parents);
}
function EnterNode(parent, datum) {
	this.ownerDocument = parent.ownerDocument;
	this.namespaceURI = parent.namespaceURI;
	this._next = null;
	this._parent = parent;
	this.__data__ = datum;
}
EnterNode.prototype = {
	constructor: EnterNode,
	appendChild: function(child) {
		return this._parent.insertBefore(child, this._next);
	},
	insertBefore: function(child, next) {
		return this._parent.insertBefore(child, next);
	},
	querySelector: function(selector) {
		return this._parent.querySelector(selector);
	},
	querySelectorAll: function(selector) {
		return this._parent.querySelectorAll(selector);
	}
};
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/constant.js
function constant_default$4(x) {
	return function() {
		return x;
	};
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/data.js
function bindIndex(parent, group, enter, update, exit, data) {
	var i = 0, node, groupLength = group.length, dataLength = data.length;
	for (; i < dataLength; ++i) if (node = group[i]) {
		node.__data__ = data[i];
		update[i] = node;
	} else enter[i] = new EnterNode(parent, data[i]);
	for (; i < groupLength; ++i) if (node = group[i]) exit[i] = node;
}
function bindKey(parent, group, enter, update, exit, data, key) {
	var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
	for (i = 0; i < groupLength; ++i) if (node = group[i]) {
		keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
		if (nodeByKeyValue.has(keyValue)) exit[i] = node;
		else nodeByKeyValue.set(keyValue, node);
	}
	for (i = 0; i < dataLength; ++i) {
		keyValue = key.call(parent, data[i], i, data) + "";
		if (node = nodeByKeyValue.get(keyValue)) {
			update[i] = node;
			node.__data__ = data[i];
			nodeByKeyValue.delete(keyValue);
		} else enter[i] = new EnterNode(parent, data[i]);
	}
	for (i = 0; i < groupLength; ++i) if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) exit[i] = node;
}
function datum(node) {
	return node.__data__;
}
function data_default$3(value, key) {
	if (!arguments.length) return Array.from(this, datum);
	var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
	if (typeof value !== "function") value = constant_default$4(value);
	for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
		var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength);
		bind(parent, group, enterGroup, updateGroup, exit[j] = new Array(groupLength), data, key);
		for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) if (previous = enterGroup[i0]) {
			if (i0 >= i1) i1 = i0 + 1;
			while (!(next = updateGroup[i1]) && ++i1 < dataLength);
			previous._next = next || null;
		}
	}
	update = new Selection$1(update, parents);
	update._enter = enter;
	update._exit = exit;
	return update;
}
function arraylike(data) {
	return typeof data === "object" && "length" in data ? data : Array.from(data);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/exit.js
function exit_default() {
	return new Selection$1(this._exit || this._groups.map(sparse_default), this._parents);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/join.js
function join_default(onenter, onupdate, onexit) {
	var enter = this.enter(), update = this, exit = this.exit();
	if (typeof onenter === "function") {
		enter = onenter(enter);
		if (enter) enter = enter.selection();
	} else enter = enter.append(onenter + "");
	if (onupdate != null) {
		update = onupdate(update);
		if (update) update = update.selection();
	}
	if (onexit == null) exit.remove();
	else onexit(exit);
	return enter && update ? enter.merge(update).order() : update;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/merge.js
function merge_default$1(context) {
	var selection = context.selection ? context.selection() : context;
	for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) if (node = group0[i] || group1[i]) merge[i] = node;
	for (; j < m0; ++j) merges[j] = groups0[j];
	return new Selection$1(merges, this._parents);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/order.js
function order_default() {
	for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) if (node = group[i]) {
		if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
		next = node;
	}
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/sort.js
function sort_default(compare) {
	if (!compare) compare = ascending;
	function compareNode(a, b) {
		return a && b ? compare(a.__data__, b.__data__) : !a - !b;
	}
	for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
		for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) if (node = group[i]) sortgroup[i] = node;
		sortgroup.sort(compareNode);
	}
	return new Selection$1(sortgroups, this._parents).order();
}
function ascending(a, b) {
	return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/call.js
function call_default() {
	var callback = arguments[0];
	arguments[0] = this;
	callback.apply(null, arguments);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/nodes.js
function nodes_default() {
	return Array.from(this);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/node.js
function node_default() {
	for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
		var node = group[i];
		if (node) return node;
	}
	return null;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/size.js
function size_default$3() {
	let size = 0;
	for (const node of this) ++size;
	return size;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/empty.js
function empty_default() {
	return !this.node();
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/each.js
function each_default(callback) {
	for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) if (node = group[i]) callback.call(node, node.__data__, i, group);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/attr.js
function attrRemove$1(name) {
	return function() {
		this.removeAttribute(name);
	};
}
function attrRemoveNS$1(fullname) {
	return function() {
		this.removeAttributeNS(fullname.space, fullname.local);
	};
}
function attrConstant$1(name, value) {
	return function() {
		this.setAttribute(name, value);
	};
}
function attrConstantNS$1(fullname, value) {
	return function() {
		this.setAttributeNS(fullname.space, fullname.local, value);
	};
}
function attrFunction$1(name, value) {
	return function() {
		var v = value.apply(this, arguments);
		if (v == null) this.removeAttribute(name);
		else this.setAttribute(name, v);
	};
}
function attrFunctionNS$1(fullname, value) {
	return function() {
		var v = value.apply(this, arguments);
		if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
		else this.setAttributeNS(fullname.space, fullname.local, v);
	};
}
function attr_default$1(name, value) {
	var fullname = namespace_default(name);
	if (arguments.length < 2) {
		var node = this.node();
		return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
	}
	return this.each((value == null ? fullname.local ? attrRemoveNS$1 : attrRemove$1 : typeof value === "function" ? fullname.local ? attrFunctionNS$1 : attrFunction$1 : fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, value));
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/window.js
function window_default(node) {
	return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/style.js
function styleRemove$1(name) {
	return function() {
		this.style.removeProperty(name);
	};
}
function styleConstant$1(name, value, priority) {
	return function() {
		this.style.setProperty(name, value, priority);
	};
}
function styleFunction$1(name, value, priority) {
	return function() {
		var v = value.apply(this, arguments);
		if (v == null) this.style.removeProperty(name);
		else this.style.setProperty(name, v, priority);
	};
}
function style_default$1(name, value, priority) {
	return arguments.length > 1 ? this.each((value == null ? styleRemove$1 : typeof value === "function" ? styleFunction$1 : styleConstant$1)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
	return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/property.js
function propertyRemove(name) {
	return function() {
		delete this[name];
	};
}
function propertyConstant(name, value) {
	return function() {
		this[name] = value;
	};
}
function propertyFunction(name, value) {
	return function() {
		var v = value.apply(this, arguments);
		if (v == null) delete this[name];
		else this[name] = v;
	};
}
function property_default(name, value) {
	return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/classed.js
function classArray(string) {
	return string.trim().split(/^|\s+/);
}
function classList(node) {
	return node.classList || new ClassList(node);
}
function ClassList(node) {
	this._node = node;
	this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
	add: function(name) {
		if (this._names.indexOf(name) < 0) {
			this._names.push(name);
			this._node.setAttribute("class", this._names.join(" "));
		}
	},
	remove: function(name) {
		var i = this._names.indexOf(name);
		if (i >= 0) {
			this._names.splice(i, 1);
			this._node.setAttribute("class", this._names.join(" "));
		}
	},
	contains: function(name) {
		return this._names.indexOf(name) >= 0;
	}
};
function classedAdd(node, names) {
	var list = classList(node), i = -1, n = names.length;
	while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
	var list = classList(node), i = -1, n = names.length;
	while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
	return function() {
		classedAdd(this, names);
	};
}
function classedFalse(names) {
	return function() {
		classedRemove(this, names);
	};
}
function classedFunction(names, value) {
	return function() {
		(value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
	};
}
function classed_default(name, value) {
	var names = classArray(name + "");
	if (arguments.length < 2) {
		var list = classList(this.node()), i = -1, n = names.length;
		while (++i < n) if (!list.contains(names[i])) return false;
		return true;
	}
	return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/text.js
function textRemove() {
	this.textContent = "";
}
function textConstant$1(value) {
	return function() {
		this.textContent = value;
	};
}
function textFunction$1(value) {
	return function() {
		var v = value.apply(this, arguments);
		this.textContent = v == null ? "" : v;
	};
}
function text_default$1(value) {
	return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction$1 : textConstant$1)(value)) : this.node().textContent;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/html.js
function htmlRemove() {
	this.innerHTML = "";
}
function htmlConstant(value) {
	return function() {
		this.innerHTML = value;
	};
}
function htmlFunction(value) {
	return function() {
		var v = value.apply(this, arguments);
		this.innerHTML = v == null ? "" : v;
	};
}
function html_default(value) {
	return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/raise.js
function raise() {
	if (this.nextSibling) this.parentNode.appendChild(this);
}
function raise_default() {
	return this.each(raise);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/lower.js
function lower() {
	if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function lower_default() {
	return this.each(lower);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/creator.js
function creatorInherit(name) {
	return function() {
		var document = this.ownerDocument, uri = this.namespaceURI;
		return uri === "http://www.w3.org/1999/xhtml" && document.documentElement.namespaceURI === "http://www.w3.org/1999/xhtml" ? document.createElement(name) : document.createElementNS(uri, name);
	};
}
function creatorFixed(fullname) {
	return function() {
		return this.ownerDocument.createElementNS(fullname.space, fullname.local);
	};
}
function creator_default(name) {
	var fullname = namespace_default(name);
	return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/append.js
function append_default(name) {
	var create = typeof name === "function" ? name : creator_default(name);
	return this.select(function() {
		return this.appendChild(create.apply(this, arguments));
	});
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/insert.js
function constantNull() {
	return null;
}
function insert_default(name, before) {
	var create = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
	return this.select(function() {
		return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
	});
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/remove.js
function remove$1() {
	var parent = this.parentNode;
	if (parent) parent.removeChild(this);
}
function remove_default$4() {
	return this.each(remove$1);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/clone.js
function selection_cloneShallow() {
	var clone = this.cloneNode(false), parent = this.parentNode;
	return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
	var clone = this.cloneNode(true), parent = this.parentNode;
	return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function clone_default(deep) {
	return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/datum.js
function datum_default(value) {
	return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/on.js
function contextListener(listener) {
	return function(event) {
		listener.call(this, event, this.__data__);
	};
}
function parseTypenames$1(typenames) {
	return typenames.trim().split(/^|\s+/).map(function(t) {
		var name = "", i = t.indexOf(".");
		if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
		return {
			type: t,
			name
		};
	});
}
function onRemove(typename) {
	return function() {
		var on = this.__on;
		if (!on) return;
		for (var j = 0, i = -1, m = on.length, o; j < m; ++j) if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) this.removeEventListener(o.type, o.listener, o.options);
		else on[++i] = o;
		if (++i) on.length = i;
		else delete this.__on;
	};
}
function onAdd(typename, value, options) {
	return function() {
		var on = this.__on, o, listener = contextListener(value);
		if (on) {
			for (var j = 0, m = on.length; j < m; ++j) if ((o = on[j]).type === typename.type && o.name === typename.name) {
				this.removeEventListener(o.type, o.listener, o.options);
				this.addEventListener(o.type, o.listener = listener, o.options = options);
				o.value = value;
				return;
			}
		}
		this.addEventListener(typename.type, listener, options);
		o = {
			type: typename.type,
			name: typename.name,
			value,
			listener,
			options
		};
		if (!on) this.__on = [o];
		else on.push(o);
	};
}
function on_default$1(typename, value, options) {
	var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;
	if (arguments.length < 2) {
		var on = this.node().__on;
		if (on) {
			for (var j = 0, m = on.length, o; j < m; ++j) for (i = 0, o = on[j]; i < n; ++i) if ((t = typenames[i]).type === o.type && t.name === o.name) return o.value;
		}
		return;
	}
	on = value ? onAdd : onRemove;
	for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/dispatch.js
function dispatchEvent(node, type, params) {
	var window = window_default(node), event = window.CustomEvent;
	if (typeof event === "function") event = new event(type, params);
	else {
		event = window.document.createEvent("Event");
		if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
		else event.initEvent(type, false, false);
	}
	node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
	return function() {
		return dispatchEvent(this, type, params);
	};
}
function dispatchFunction(type, params) {
	return function() {
		return dispatchEvent(this, type, params.apply(this, arguments));
	};
}
function dispatch_default(type, params) {
	return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/iterator.js
function* iterator_default() {
	for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) if (node = group[i]) yield node;
}
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/selection/index.js
var root$2 = [null];
function Selection$1(groups, parents) {
	this._groups = groups;
	this._parents = parents;
}
function selection() {
	return new Selection$1([[document.documentElement]], root$2);
}
function selection_selection() {
	return this;
}
Selection$1.prototype = selection.prototype = {
	constructor: Selection$1,
	select: select_default$2,
	selectAll: selectAll_default$1,
	selectChild: selectChild_default,
	selectChildren: selectChildren_default,
	filter: filter_default$1,
	data: data_default$3,
	enter: enter_default,
	exit: exit_default,
	join: join_default,
	merge: merge_default$1,
	selection: selection_selection,
	order: order_default,
	sort: sort_default,
	call: call_default,
	nodes: nodes_default,
	node: node_default,
	size: size_default$3,
	empty: empty_default,
	each: each_default,
	attr: attr_default$1,
	style: style_default$1,
	property: property_default,
	classed: classed_default,
	text: text_default$1,
	html: html_default,
	raise: raise_default,
	lower: lower_default,
	append: append_default,
	insert: insert_default,
	remove: remove_default$4,
	clone: clone_default,
	datum: datum_default,
	on: on_default$1,
	dispatch: dispatch_default,
	[Symbol.iterator]: iterator_default
};
//#endregion
//#region node_modules/.pnpm/d3-selection@3.0.0/node_modules/d3-selection/src/select.js
function select_default$1(selector) {
	return typeof selector === "string" ? new Selection$1([[document.querySelector(selector)]], [document.documentElement]) : new Selection$1([[selector]], root$2);
}
//#endregion
//#region node_modules/.pnpm/d3-dispatch@3.0.1/node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {} };
function dispatch() {
	for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
		if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
		_[t] = [];
	}
	return new Dispatch(_);
}
function Dispatch(_) {
	this._ = _;
}
function parseTypenames(typenames, types) {
	return typenames.trim().split(/^|\s+/).map(function(t) {
		var name = "", i = t.indexOf(".");
		if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
		if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
		return {
			type: t,
			name
		};
	});
}
Dispatch.prototype = dispatch.prototype = {
	constructor: Dispatch,
	on: function(typename, callback) {
		var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
		if (arguments.length < 2) {
			while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
			return;
		}
		if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
		while (++i < n) if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
		else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
		return this;
	},
	copy: function() {
		var copy = {}, _ = this._;
		for (var t in _) copy[t] = _[t].slice();
		return new Dispatch(copy);
	},
	call: function(type, that) {
		if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
		if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
		for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	},
	apply: function(type, that, args) {
		if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
		for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	}
};
function get$1(type, name) {
	for (var i = 0, n = type.length, c; i < n; ++i) if ((c = type[i]).name === name) return c.value;
}
function set$1(type, name, callback) {
	for (var i = 0, n = type.length; i < n; ++i) if (type[i].name === name) {
		type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
		break;
	}
	if (callback != null) type.push({
		name,
		value: callback
	});
	return type;
}
//#endregion
//#region node_modules/.pnpm/d3-drag@3.0.0/node_modules/d3-drag/src/noevent.js
const nonpassive = { passive: false };
const nonpassivecapture = {
	capture: true,
	passive: false
};
function nopropagation$1(event) {
	event.stopImmediatePropagation();
}
function noevent_default$1(event) {
	event.preventDefault();
	event.stopImmediatePropagation();
}
//#endregion
//#region node_modules/.pnpm/d3-drag@3.0.0/node_modules/d3-drag/src/nodrag.js
function nodrag_default(view) {
	var root = view.document.documentElement, selection = select_default$1(view).on("dragstart.drag", noevent_default$1, nonpassivecapture);
	if ("onselectstart" in root) selection.on("selectstart.drag", noevent_default$1, nonpassivecapture);
	else {
		root.__noselect = root.style.MozUserSelect;
		root.style.MozUserSelect = "none";
	}
}
function yesdrag(view, noclick) {
	var root = view.document.documentElement, selection = select_default$1(view).on("dragstart.drag", null);
	if (noclick) {
		selection.on("click.drag", noevent_default$1, nonpassivecapture);
		setTimeout(function() {
			selection.on("click.drag", null);
		}, 0);
	}
	if ("onselectstart" in root) selection.on("selectstart.drag", null);
	else {
		root.style.MozUserSelect = root.__noselect;
		delete root.__noselect;
	}
}
//#endregion
//#region node_modules/.pnpm/d3-drag@3.0.0/node_modules/d3-drag/src/constant.js
var constant_default$3 = (x) => () => x;
//#endregion
//#region node_modules/.pnpm/d3-drag@3.0.0/node_modules/d3-drag/src/event.js
function DragEvent(type, { sourceEvent, subject, target, identifier, active, x, y, dx, dy, dispatch }) {
	Object.defineProperties(this, {
		type: {
			value: type,
			enumerable: true,
			configurable: true
		},
		sourceEvent: {
			value: sourceEvent,
			enumerable: true,
			configurable: true
		},
		subject: {
			value: subject,
			enumerable: true,
			configurable: true
		},
		target: {
			value: target,
			enumerable: true,
			configurable: true
		},
		identifier: {
			value: identifier,
			enumerable: true,
			configurable: true
		},
		active: {
			value: active,
			enumerable: true,
			configurable: true
		},
		x: {
			value: x,
			enumerable: true,
			configurable: true
		},
		y: {
			value: y,
			enumerable: true,
			configurable: true
		},
		dx: {
			value: dx,
			enumerable: true,
			configurable: true
		},
		dy: {
			value: dy,
			enumerable: true,
			configurable: true
		},
		_: { value: dispatch }
	});
}
DragEvent.prototype.on = function() {
	var value = this._.on.apply(this._, arguments);
	return value === this._ ? this : value;
};
//#endregion
//#region node_modules/.pnpm/d3-drag@3.0.0/node_modules/d3-drag/src/drag.js
function defaultFilter$1(event) {
	return !event.ctrlKey && !event.button;
}
function defaultContainer() {
	return this.parentNode;
}
function defaultSubject(event, d) {
	return d == null ? {
		x: event.x,
		y: event.y
	} : d;
}
function defaultTouchable$1() {
	return navigator.maxTouchPoints || "ontouchstart" in this;
}
function drag_default() {
	var filter = defaultFilter$1, container = defaultContainer, subject = defaultSubject, touchable = defaultTouchable$1, gestures = {}, listeners = dispatch("start", "drag", "end"), active = 0, mousedownx, mousedowny, mousemoving, touchending, clickDistance2 = 0;
	function drag(selection) {
		selection.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved, nonpassive).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
	}
	function mousedowned(event, d) {
		if (touchending || !filter.call(this, event, d)) return;
		var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
		if (!gesture) return;
		select_default$1(event.view).on("mousemove.drag", mousemoved, nonpassivecapture).on("mouseup.drag", mouseupped, nonpassivecapture);
		nodrag_default(event.view);
		nopropagation$1(event);
		mousemoving = false;
		mousedownx = event.clientX;
		mousedowny = event.clientY;
		gesture("start", event);
	}
	function mousemoved(event) {
		noevent_default$1(event);
		if (!mousemoving) {
			var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
			mousemoving = dx * dx + dy * dy > clickDistance2;
		}
		gestures.mouse("drag", event);
	}
	function mouseupped(event) {
		select_default$1(event.view).on("mousemove.drag mouseup.drag", null);
		yesdrag(event.view, mousemoving);
		noevent_default$1(event);
		gestures.mouse("end", event);
	}
	function touchstarted(event, d) {
		if (!filter.call(this, event, d)) return;
		var touches = event.changedTouches, c = container.call(this, event, d), n = touches.length, i, gesture;
		for (i = 0; i < n; ++i) if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
			nopropagation$1(event);
			gesture("start", event, touches[i]);
		}
	}
	function touchmoved(event) {
		var touches = event.changedTouches, n = touches.length, i, gesture;
		for (i = 0; i < n; ++i) if (gesture = gestures[touches[i].identifier]) {
			noevent_default$1(event);
			gesture("drag", event, touches[i]);
		}
	}
	function touchended(event) {
		var touches = event.changedTouches, n = touches.length, i, gesture;
		if (touchending) clearTimeout(touchending);
		touchending = setTimeout(function() {
			touchending = null;
		}, 500);
		for (i = 0; i < n; ++i) if (gesture = gestures[touches[i].identifier]) {
			nopropagation$1(event);
			gesture("end", event, touches[i]);
		}
	}
	function beforestart(that, container, event, d, identifier, touch) {
		var dispatch = listeners.copy(), p = pointer_default(touch || event, container), dx, dy, s;
		if ((s = subject.call(that, new DragEvent("beforestart", {
			sourceEvent: event,
			target: drag,
			identifier,
			active,
			x: p[0],
			y: p[1],
			dx: 0,
			dy: 0,
			dispatch
		}), d)) == null) return;
		dx = s.x - p[0] || 0;
		dy = s.y - p[1] || 0;
		return function gesture(type, event, touch) {
			var p0 = p, n;
			switch (type) {
				case "start":
					gestures[identifier] = gesture, n = active++;
					break;
				case "end": delete gestures[identifier], --active;
				case "drag":
					p = pointer_default(touch || event, container), n = active;
					break;
			}
			dispatch.call(type, that, new DragEvent(type, {
				sourceEvent: event,
				subject: s,
				target: drag,
				identifier,
				active: n,
				x: p[0] + dx,
				y: p[1] + dy,
				dx: p[0] - p0[0],
				dy: p[1] - p0[1],
				dispatch
			}), d);
		};
	}
	drag.filter = function(_) {
		return arguments.length ? (filter = typeof _ === "function" ? _ : constant_default$3(!!_), drag) : filter;
	};
	drag.container = function(_) {
		return arguments.length ? (container = typeof _ === "function" ? _ : constant_default$3(_), drag) : container;
	};
	drag.subject = function(_) {
		return arguments.length ? (subject = typeof _ === "function" ? _ : constant_default$3(_), drag) : subject;
	};
	drag.touchable = function(_) {
		return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default$3(!!_), drag) : touchable;
	};
	drag.on = function() {
		var value = listeners.on.apply(listeners, arguments);
		return value === listeners ? drag : value;
	};
	drag.clickDistance = function(_) {
		return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
	};
	return drag;
}
//#endregion
//#region node_modules/.pnpm/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/number.js
function number_default(a, b) {
	return a = +a, b = +b, function(t) {
		return a * (1 - t) + b * t;
	};
}
//#endregion
//#region node_modules/.pnpm/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero(b) {
	return function() {
		return b;
	};
}
function one(b) {
	return function(t) {
		return b(t) + "";
	};
}
function string_default(a, b) {
	var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
	a = a + "", b = b + "";
	while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
		if ((bs = bm.index) > bi) {
			bs = b.slice(bi, bs);
			if (s[i]) s[i] += bs;
			else s[++i] = bs;
		}
		if ((am = am[0]) === (bm = bm[0])) if (s[i]) s[i] += bm;
		else s[++i] = bm;
		else {
			s[++i] = null;
			q.push({
				i,
				x: number_default(am, bm)
			});
		}
		bi = reB.lastIndex;
	}
	if (bi < b.length) {
		bs = b.slice(bi);
		if (s[i]) s[i] += bs;
		else s[++i] = bs;
	}
	return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
		for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
		return s.join("");
	});
}
//#endregion
//#region node_modules/.pnpm/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/transform/decompose.js
var degrees = 180 / Math.PI;
var identity$1 = {
	translateX: 0,
	translateY: 0,
	rotate: 0,
	skewX: 0,
	scaleX: 1,
	scaleY: 1
};
function decompose_default(a, b, c, d, e, f) {
	var scaleX, scaleY, skewX;
	if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
	if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
	if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
	if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
	return {
		translateX: e,
		translateY: f,
		rotate: Math.atan2(b, a) * degrees,
		skewX: Math.atan(skewX) * degrees,
		scaleX,
		scaleY
	};
}
//#endregion
//#region node_modules/.pnpm/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/transform/parse.js
var svgNode;
function parseCss(value) {
	const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
	return m.isIdentity ? identity$1 : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
	if (value == null) return identity$1;
	if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
	svgNode.setAttribute("transform", value);
	if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
	value = value.matrix;
	return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
}
//#endregion
//#region node_modules/.pnpm/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/transform/index.js
function interpolateTransform(parse, pxComma, pxParen, degParen) {
	function pop(s) {
		return s.length ? s.pop() + " " : "";
	}
	function translate(xa, ya, xb, yb, s, q) {
		if (xa !== xb || ya !== yb) {
			var i = s.push("translate(", null, pxComma, null, pxParen);
			q.push({
				i: i - 4,
				x: number_default(xa, xb)
			}, {
				i: i - 2,
				x: number_default(ya, yb)
			});
		} else if (xb || yb) s.push("translate(" + xb + pxComma + yb + pxParen);
	}
	function rotate(a, b, s, q) {
		if (a !== b) {
			if (a - b > 180) b += 360;
			else if (b - a > 180) a += 360;
			q.push({
				i: s.push(pop(s) + "rotate(", null, degParen) - 2,
				x: number_default(a, b)
			});
		} else if (b) s.push(pop(s) + "rotate(" + b + degParen);
	}
	function skewX(a, b, s, q) {
		if (a !== b) q.push({
			i: s.push(pop(s) + "skewX(", null, degParen) - 2,
			x: number_default(a, b)
		});
		else if (b) s.push(pop(s) + "skewX(" + b + degParen);
	}
	function scale(xa, ya, xb, yb, s, q) {
		if (xa !== xb || ya !== yb) {
			var i = s.push(pop(s) + "scale(", null, ",", null, ")");
			q.push({
				i: i - 4,
				x: number_default(xa, xb)
			}, {
				i: i - 2,
				x: number_default(ya, yb)
			});
		} else if (xb !== 1 || yb !== 1) s.push(pop(s) + "scale(" + xb + "," + yb + ")");
	}
	return function(a, b) {
		var s = [], q = [];
		a = parse(a), b = parse(b);
		translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
		rotate(a.rotate, b.rotate, s, q);
		skewX(a.skewX, b.skewX, s, q);
		scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
		a = b = null;
		return function(t) {
			var i = -1, n = q.length, o;
			while (++i < n) s[(o = q[i]).i] = o.x(t);
			return s.join("");
		};
	};
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
//#endregion
//#region node_modules/.pnpm/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/zoom.js
var epsilon2 = 1e-12;
function cosh(x) {
	return ((x = Math.exp(x)) + 1 / x) / 2;
}
function sinh(x) {
	return ((x = Math.exp(x)) - 1 / x) / 2;
}
function tanh(x) {
	return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}
var zoom_default$1 = (function zoomRho(rho, rho2, rho4) {
	function zoom(p0, p1) {
		var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
		if (d2 < epsilon2) {
			S = Math.log(w1 / w0) / rho;
			i = function(t) {
				return [
					ux0 + t * dx,
					uy0 + t * dy,
					w0 * Math.exp(rho * t * S)
				];
			};
		} else {
			var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
			S = (Math.log(Math.sqrt(b1 * b1 + 1) - b1) - r0) / rho;
			i = function(t) {
				var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
				return [
					ux0 + u * dx,
					uy0 + u * dy,
					w0 * coshr0 / cosh(rho * s + r0)
				];
			};
		}
		i.duration = S * 1e3 * rho / Math.SQRT2;
		return i;
	}
	zoom.rho = function(_) {
		var _1 = Math.max(.001, +_), _2 = _1 * _1;
		return zoomRho(_1, _2, _2 * _2);
	};
	return zoom;
})(Math.SQRT2, 2, 4);
//#endregion
//#region node_modules/.pnpm/d3-color@3.1.0/node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
	constructor.prototype = factory.prototype = prototype;
	prototype.constructor = constructor;
}
function extend(parent, definition) {
	var prototype = Object.create(parent.prototype);
	for (var key in definition) prototype[key] = definition[key];
	return prototype;
}
//#endregion
//#region node_modules/.pnpm/d3-color@3.1.0/node_modules/d3-color/src/color.js
function Color() {}
var darker = .7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
};
define_default(Color, color, {
	copy(channels) {
		return Object.assign(new this.constructor(), this, channels);
	},
	displayable() {
		return this.rgb().displayable();
	},
	hex: color_formatHex,
	formatHex: color_formatHex,
	formatHex8: color_formatHex8,
	formatHsl: color_formatHsl,
	formatRgb: color_formatRgb,
	toString: color_formatRgb
});
function color_formatHex() {
	return this.rgb().formatHex();
}
function color_formatHex8() {
	return this.rgb().formatHex8();
}
function color_formatHsl() {
	return hslConvert(this).formatHsl();
}
function color_formatRgb() {
	return this.rgb().formatRgb();
}
function color(format) {
	var m, l;
	format = (format + "").trim().toLowerCase();
	return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
	return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
	if (a <= 0) r = g = b = NaN;
	return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
	if (!(o instanceof Color)) o = color(o);
	if (!o) return new Rgb();
	o = o.rgb();
	return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
	return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
	this.r = +r;
	this.g = +g;
	this.b = +b;
	this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
	brighter(k) {
		k = k == null ? brighter : Math.pow(brighter, k);
		return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	},
	darker(k) {
		k = k == null ? darker : Math.pow(darker, k);
		return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	},
	rgb() {
		return this;
	},
	clamp() {
		return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
	},
	displayable() {
		return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
	},
	hex: rgb_formatHex,
	formatHex: rgb_formatHex,
	formatHex8: rgb_formatHex8,
	formatRgb: rgb_formatRgb,
	toString: rgb_formatRgb
}));
function rgb_formatHex() {
	return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
	return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
	const a = clampa(this.opacity);
	return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
	return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
	return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
	value = clampi(value);
	return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
	if (a <= 0) h = s = l = NaN;
	else if (l <= 0 || l >= 1) h = s = NaN;
	else if (s <= 0) h = NaN;
	return new Hsl(h, s, l, a);
}
function hslConvert(o) {
	if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
	if (!(o instanceof Color)) o = color(o);
	if (!o) return new Hsl();
	if (o instanceof Hsl) return o;
	o = o.rgb();
	var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
	if (s) {
		if (r === max) h = (g - b) / s + (g < b) * 6;
		else if (g === max) h = (b - r) / s + 2;
		else h = (r - g) / s + 4;
		s /= l < .5 ? max + min : 2 - max - min;
		h *= 60;
	} else s = l > 0 && l < 1 ? 0 : h;
	return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
	return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
	this.h = +h;
	this.s = +s;
	this.l = +l;
	this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
	brighter(k) {
		k = k == null ? brighter : Math.pow(brighter, k);
		return new Hsl(this.h, this.s, this.l * k, this.opacity);
	},
	darker(k) {
		k = k == null ? darker : Math.pow(darker, k);
		return new Hsl(this.h, this.s, this.l * k, this.opacity);
	},
	rgb() {
		var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < .5 ? l : 1 - l) * s, m1 = 2 * l - m2;
		return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
	},
	clamp() {
		return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
	},
	displayable() {
		return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
	},
	formatHsl() {
		const a = clampa(this.opacity);
		return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
	}
}));
function clamph(value) {
	value = (value || 0) % 360;
	return value < 0 ? value + 360 : value;
}
function clampt(value) {
	return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
	return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
//#endregion
//#region node_modules/.pnpm/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/constant.js
var constant_default$2 = (x) => () => x;
//#endregion
//#region node_modules/.pnpm/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/color.js
function linear(a, d) {
	return function(t) {
		return a + t * d;
	};
}
function exponential(a, b, y) {
	return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
		return Math.pow(a + t * b, y);
	};
}
function gamma(y) {
	return (y = +y) === 1 ? nogamma : function(a, b) {
		return b - a ? exponential(a, b, y) : constant_default$2(isNaN(a) ? b : a);
	};
}
function nogamma(a, b) {
	var d = b - a;
	return d ? linear(a, d) : constant_default$2(isNaN(a) ? b : a);
}
//#endregion
//#region node_modules/.pnpm/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/rgb.js
var rgb_default = (function rgbGamma(y) {
	var color = gamma(y);
	function rgb$1(start, end) {
		var r = color((start = rgb(start)).r, (end = rgb(end)).r), g = color(start.g, end.g), b = color(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
		return function(t) {
			start.r = r(t);
			start.g = g(t);
			start.b = b(t);
			start.opacity = opacity(t);
			return start + "";
		};
	}
	rgb$1.gamma = rgbGamma;
	return rgb$1;
})(1);
//#endregion
//#region node_modules/.pnpm/d3-timer@3.0.1/node_modules/d3-timer/src/timer.js
var frame = 0, timeout = 0, interval = 0, pokeDelay = 1e3, taskHead, taskTail, clockLast = 0, clockNow = 0, clockSkew = 0, clock = typeof performance === "object" && performance.now ? performance : Date, setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
	setTimeout(f, 17);
};
function now$2() {
	return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
	clockNow = 0;
}
function Timer() {
	this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
	constructor: Timer,
	restart: function(callback, delay, time) {
		if (typeof callback !== "function") throw new TypeError("callback is not a function");
		time = (time == null ? now$2() : +time) + (delay == null ? 0 : +delay);
		if (!this._next && taskTail !== this) {
			if (taskTail) taskTail._next = this;
			else taskHead = this;
			taskTail = this;
		}
		this._call = callback;
		this._time = time;
		sleep$1();
	},
	stop: function() {
		if (this._call) {
			this._call = null;
			this._time = Infinity;
			sleep$1();
		}
	}
};
function timer(callback, delay, time) {
	var t = new Timer();
	t.restart(callback, delay, time);
	return t;
}
function timerFlush() {
	now$2();
	++frame;
	var t = taskHead, e;
	while (t) {
		if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
		t = t._next;
	}
	--frame;
}
function wake() {
	clockNow = (clockLast = clock.now()) + clockSkew;
	frame = timeout = 0;
	try {
		timerFlush();
	} finally {
		frame = 0;
		nap();
		clockNow = 0;
	}
}
function poke() {
	var now = clock.now(), delay = now - clockLast;
	if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
}
function nap() {
	var t0, t1 = taskHead, t2, time = Infinity;
	while (t1) if (t1._call) {
		if (time > t1._time) time = t1._time;
		t0 = t1, t1 = t1._next;
	} else {
		t2 = t1._next, t1._next = null;
		t1 = t0 ? t0._next = t2 : taskHead = t2;
	}
	taskTail = t0;
	sleep$1(time);
}
function sleep$1(time) {
	if (frame) return;
	if (timeout) timeout = clearTimeout(timeout);
	if (time - clockNow > 24) {
		if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
		if (interval) interval = clearInterval(interval);
	} else {
		if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
		frame = 1, setFrame(wake);
	}
}
//#endregion
//#region node_modules/.pnpm/d3-timer@3.0.1/node_modules/d3-timer/src/timeout.js
function timeout_default(callback, delay, time) {
	var t = new Timer();
	delay = delay == null ? 0 : +delay;
	t.restart((elapsed) => {
		t.stop();
		callback(elapsed + delay);
	}, delay, time);
	return t;
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/schedule.js
var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];
function schedule_default(node, name, id, index, group, timing) {
	var schedules = node.__transition;
	if (!schedules) node.__transition = {};
	else if (id in schedules) return;
	create(node, id, {
		name,
		index,
		group,
		on: emptyOn,
		tween: emptyTween,
		time: timing.time,
		delay: timing.delay,
		duration: timing.duration,
		ease: timing.ease,
		timer: null,
		state: 0
	});
}
function init(node, id) {
	var schedule = get(node, id);
	if (schedule.state > 0) throw new Error("too late; already scheduled");
	return schedule;
}
function set(node, id) {
	var schedule = get(node, id);
	if (schedule.state > 3) throw new Error("too late; already running");
	return schedule;
}
function get(node, id) {
	var schedule = node.__transition;
	if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
	return schedule;
}
function create(node, id, self) {
	var schedules = node.__transition, tween;
	schedules[id] = self;
	self.timer = timer(schedule, 0, self.time);
	function schedule(elapsed) {
		self.state = 1;
		self.timer.restart(start, self.delay, self.time);
		if (self.delay <= elapsed) start(elapsed - self.delay);
	}
	function start(elapsed) {
		var i, j, n, o;
		if (self.state !== 1) return stop();
		for (i in schedules) {
			o = schedules[i];
			if (o.name !== self.name) continue;
			if (o.state === 3) return timeout_default(start);
			if (o.state === 4) {
				o.state = 6;
				o.timer.stop();
				o.on.call("interrupt", node, node.__data__, o.index, o.group);
				delete schedules[i];
			} else if (+i < id) {
				o.state = 6;
				o.timer.stop();
				o.on.call("cancel", node, node.__data__, o.index, o.group);
				delete schedules[i];
			}
		}
		timeout_default(function() {
			if (self.state === 3) {
				self.state = 4;
				self.timer.restart(tick, self.delay, self.time);
				tick(elapsed);
			}
		});
		self.state = 2;
		self.on.call("start", node, node.__data__, self.index, self.group);
		if (self.state !== 2) return;
		self.state = 3;
		tween = new Array(n = self.tween.length);
		for (i = 0, j = -1; i < n; ++i) if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) tween[++j] = o;
		tween.length = j + 1;
	}
	function tick(elapsed) {
		var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = 5, 1), i = -1, n = tween.length;
		while (++i < n) tween[i].call(node, t);
		if (self.state === 5) {
			self.on.call("end", node, node.__data__, self.index, self.group);
			stop();
		}
	}
	function stop() {
		self.state = 6;
		self.timer.stop();
		delete schedules[id];
		for (var i in schedules) return;
		delete node.__transition;
	}
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/interrupt.js
function interrupt_default$1(node, name) {
	var schedules = node.__transition, schedule, active, empty = true, i;
	if (!schedules) return;
	name = name == null ? null : name + "";
	for (i in schedules) {
		if ((schedule = schedules[i]).name !== name) {
			empty = false;
			continue;
		}
		active = schedule.state > 2 && schedule.state < 5;
		schedule.state = 6;
		schedule.timer.stop();
		schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
		delete schedules[i];
	}
	if (empty) delete node.__transition;
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/selection/interrupt.js
function interrupt_default(name) {
	return this.each(function() {
		interrupt_default$1(this, name);
	});
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/tween.js
function tweenRemove(id, name) {
	var tween0, tween1;
	return function() {
		var schedule = set(this, id), tween = schedule.tween;
		if (tween !== tween0) {
			tween1 = tween0 = tween;
			for (var i = 0, n = tween1.length; i < n; ++i) if (tween1[i].name === name) {
				tween1 = tween1.slice();
				tween1.splice(i, 1);
				break;
			}
		}
		schedule.tween = tween1;
	};
}
function tweenFunction(id, name, value) {
	var tween0, tween1;
	if (typeof value !== "function") throw new Error();
	return function() {
		var schedule = set(this, id), tween = schedule.tween;
		if (tween !== tween0) {
			tween1 = (tween0 = tween).slice();
			for (var t = {
				name,
				value
			}, i = 0, n = tween1.length; i < n; ++i) if (tween1[i].name === name) {
				tween1[i] = t;
				break;
			}
			if (i === n) tween1.push(t);
		}
		schedule.tween = tween1;
	};
}
function tween_default(name, value) {
	var id = this._id;
	name += "";
	if (arguments.length < 2) {
		var tween = get(this.node(), id).tween;
		for (var i = 0, n = tween.length, t; i < n; ++i) if ((t = tween[i]).name === name) return t.value;
		return null;
	}
	return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
}
function tweenValue(transition, name, value) {
	var id = transition._id;
	transition.each(function() {
		var schedule = set(this, id);
		(schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
	});
	return function(node) {
		return get(node, id).value[name];
	};
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/interpolate.js
function interpolate_default(a, b) {
	var c;
	return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/attr.js
function attrRemove(name) {
	return function() {
		this.removeAttribute(name);
	};
}
function attrRemoveNS(fullname) {
	return function() {
		this.removeAttributeNS(fullname.space, fullname.local);
	};
}
function attrConstant(name, interpolate, value1) {
	var string00, string1 = value1 + "", interpolate0;
	return function() {
		var string0 = this.getAttribute(name);
		return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
	};
}
function attrConstantNS(fullname, interpolate, value1) {
	var string00, string1 = value1 + "", interpolate0;
	return function() {
		var string0 = this.getAttributeNS(fullname.space, fullname.local);
		return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
	};
}
function attrFunction(name, interpolate, value) {
	var string00, string10, interpolate0;
	return function() {
		var string0, value1 = value(this), string1;
		if (value1 == null) return void this.removeAttribute(name);
		string0 = this.getAttribute(name);
		string1 = value1 + "";
		return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
	};
}
function attrFunctionNS(fullname, interpolate, value) {
	var string00, string10, interpolate0;
	return function() {
		var string0, value1 = value(this), string1;
		if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
		string0 = this.getAttributeNS(fullname.space, fullname.local);
		string1 = value1 + "";
		return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
	};
}
function attr_default(name, value) {
	var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
	return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/attrTween.js
function attrInterpolate(name, i) {
	return function(t) {
		this.setAttribute(name, i.call(this, t));
	};
}
function attrInterpolateNS(fullname, i) {
	return function(t) {
		this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
	};
}
function attrTweenNS(fullname, value) {
	var t0, i0;
	function tween() {
		var i = value.apply(this, arguments);
		if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
		return t0;
	}
	tween._value = value;
	return tween;
}
function attrTween(name, value) {
	var t0, i0;
	function tween() {
		var i = value.apply(this, arguments);
		if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
		return t0;
	}
	tween._value = value;
	return tween;
}
function attrTween_default(name, value) {
	var key = "attr." + name;
	if (arguments.length < 2) return (key = this.tween(key)) && key._value;
	if (value == null) return this.tween(key, null);
	if (typeof value !== "function") throw new Error();
	var fullname = namespace_default(name);
	return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/delay.js
function delayFunction(id, value) {
	return function() {
		init(this, id).delay = +value.apply(this, arguments);
	};
}
function delayConstant(id, value) {
	return value = +value, function() {
		init(this, id).delay = value;
	};
}
function delay_default(value) {
	var id = this._id;
	return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id, value)) : get(this.node(), id).delay;
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/duration.js
function durationFunction(id, value) {
	return function() {
		set(this, id).duration = +value.apply(this, arguments);
	};
}
function durationConstant(id, value) {
	return value = +value, function() {
		set(this, id).duration = value;
	};
}
function duration_default(value) {
	var id = this._id;
	return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id, value)) : get(this.node(), id).duration;
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/ease.js
function easeConstant(id, value) {
	if (typeof value !== "function") throw new Error();
	return function() {
		set(this, id).ease = value;
	};
}
function ease_default(value) {
	var id = this._id;
	return arguments.length ? this.each(easeConstant(id, value)) : get(this.node(), id).ease;
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/easeVarying.js
function easeVarying(id, value) {
	return function() {
		var v = value.apply(this, arguments);
		if (typeof v !== "function") throw new Error();
		set(this, id).ease = v;
	};
}
function easeVarying_default(value) {
	if (typeof value !== "function") throw new Error();
	return this.each(easeVarying(this._id, value));
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/filter.js
function filter_default(match) {
	if (typeof match !== "function") match = matcher_default(match);
	for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) if ((node = group[i]) && match.call(node, node.__data__, i, group)) subgroup.push(node);
	return new Transition(subgroups, this._parents, this._name, this._id);
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/merge.js
function merge_default(transition) {
	if (transition._id !== this._id) throw new Error();
	for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) if (node = group0[i] || group1[i]) merge[i] = node;
	for (; j < m0; ++j) merges[j] = groups0[j];
	return new Transition(merges, this._parents, this._name, this._id);
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/on.js
function start(name) {
	return (name + "").trim().split(/^|\s+/).every(function(t) {
		var i = t.indexOf(".");
		if (i >= 0) t = t.slice(0, i);
		return !t || t === "start";
	});
}
function onFunction(id, name, listener) {
	var on0, on1, sit = start(name) ? init : set;
	return function() {
		var schedule = sit(this, id), on = schedule.on;
		if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
		schedule.on = on1;
	};
}
function on_default(name, listener) {
	var id = this._id;
	return arguments.length < 2 ? get(this.node(), id).on.on(name) : this.each(onFunction(id, name, listener));
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/remove.js
function removeFunction(id) {
	return function() {
		var parent = this.parentNode;
		for (var i in this.__transition) if (+i !== id) return;
		if (parent) parent.removeChild(this);
	};
}
function remove_default$3() {
	return this.on("end.remove", removeFunction(this._id));
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/select.js
function select_default(select) {
	var name = this._name, id = this._id;
	if (typeof select !== "function") select = selector_default(select);
	for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
		if ("__data__" in node) subnode.__data__ = node.__data__;
		subgroup[i] = subnode;
		schedule_default(subgroup[i], name, id, i, subgroup, get(node, id));
	}
	return new Transition(subgroups, this._parents, name, id);
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/selectAll.js
function selectAll_default(select) {
	var name = this._name, id = this._id;
	if (typeof select !== "function") select = selectorAll_default(select);
	for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) if (node = group[i]) {
		for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) if (child = children[k]) schedule_default(child, name, id, k, children, inherit);
		subgroups.push(children);
		parents.push(node);
	}
	return new Transition(subgroups, parents, name, id);
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/selection.js
var Selection = selection.prototype.constructor;
function selection_default() {
	return new Selection(this._groups, this._parents);
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/style.js
function styleNull(name, interpolate) {
	var string00, string10, interpolate0;
	return function() {
		var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
		return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
	};
}
function styleRemove(name) {
	return function() {
		this.style.removeProperty(name);
	};
}
function styleConstant(name, interpolate, value1) {
	var string00, string1 = value1 + "", interpolate0;
	return function() {
		var string0 = styleValue(this, name);
		return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
	};
}
function styleFunction(name, interpolate, value) {
	var string00, string10, interpolate0;
	return function() {
		var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
		if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
		return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
	};
}
function styleMaybeRemove(id, name) {
	var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
	return function() {
		var schedule = set(this, id), on = schedule.on, listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : void 0;
		if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
		schedule.on = on1;
	};
}
function style_default(name, value, priority) {
	var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
	return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/styleTween.js
function styleInterpolate(name, i, priority) {
	return function(t) {
		this.style.setProperty(name, i.call(this, t), priority);
	};
}
function styleTween(name, value, priority) {
	var t, i0;
	function tween() {
		var i = value.apply(this, arguments);
		if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
		return t;
	}
	tween._value = value;
	return tween;
}
function styleTween_default(name, value, priority) {
	var key = "style." + (name += "");
	if (arguments.length < 2) return (key = this.tween(key)) && key._value;
	if (value == null) return this.tween(key, null);
	if (typeof value !== "function") throw new Error();
	return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/text.js
function textConstant(value) {
	return function() {
		this.textContent = value;
	};
}
function textFunction(value) {
	return function() {
		var value1 = value(this);
		this.textContent = value1 == null ? "" : value1;
	};
}
function text_default(value) {
	return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/textTween.js
function textInterpolate(i) {
	return function(t) {
		this.textContent = i.call(this, t);
	};
}
function textTween(value) {
	var t0, i0;
	function tween() {
		var i = value.apply(this, arguments);
		if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
		return t0;
	}
	tween._value = value;
	return tween;
}
function textTween_default(value) {
	var key = "text";
	if (arguments.length < 1) return (key = this.tween(key)) && key._value;
	if (value == null) return this.tween(key, null);
	if (typeof value !== "function") throw new Error();
	return this.tween(key, textTween(value));
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/transition.js
function transition_default$1() {
	var name = this._name, id0 = this._id, id1 = newId();
	for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) if (node = group[i]) {
		var inherit = get(node, id0);
		schedule_default(node, name, id1, i, group, {
			time: inherit.time + inherit.delay + inherit.duration,
			delay: 0,
			duration: inherit.duration,
			ease: inherit.ease
		});
	}
	return new Transition(groups, this._parents, name, id1);
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/end.js
function end_default() {
	var on0, on1, that = this, id = that._id, size = that.size();
	return new Promise(function(resolve, reject) {
		var cancel = { value: reject }, end = { value: function() {
			if (--size === 0) resolve();
		} };
		that.each(function() {
			var schedule = set(this, id), on = schedule.on;
			if (on !== on0) {
				on1 = (on0 = on).copy();
				on1._.cancel.push(cancel);
				on1._.interrupt.push(cancel);
				on1._.end.push(end);
			}
			schedule.on = on1;
		});
		if (size === 0) resolve();
	});
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/transition/index.js
var id = 0;
function Transition(groups, parents, name, id) {
	this._groups = groups;
	this._parents = parents;
	this._name = name;
	this._id = id;
}
function transition(name) {
	return selection().transition(name);
}
function newId() {
	return ++id;
}
var selection_prototype = selection.prototype;
Transition.prototype = transition.prototype = {
	constructor: Transition,
	select: select_default,
	selectAll: selectAll_default,
	selectChild: selection_prototype.selectChild,
	selectChildren: selection_prototype.selectChildren,
	filter: filter_default,
	merge: merge_default,
	selection: selection_default,
	transition: transition_default$1,
	call: selection_prototype.call,
	nodes: selection_prototype.nodes,
	node: selection_prototype.node,
	size: selection_prototype.size,
	empty: selection_prototype.empty,
	each: selection_prototype.each,
	on: on_default,
	attr: attr_default,
	attrTween: attrTween_default,
	style: style_default,
	styleTween: styleTween_default,
	text: text_default,
	textTween: textTween_default,
	remove: remove_default$3,
	tween: tween_default,
	delay: delay_default,
	duration: duration_default,
	ease: ease_default,
	easeVarying: easeVarying_default,
	end: end_default,
	[Symbol.iterator]: selection_prototype[Symbol.iterator]
};
//#endregion
//#region node_modules/.pnpm/d3-ease@3.0.1/node_modules/d3-ease/src/cubic.js
function cubicInOut(t) {
	return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/selection/transition.js
var defaultTiming = {
	time: null,
	delay: 0,
	duration: 250,
	ease: cubicInOut
};
function inherit(node, id) {
	var timing;
	while (!(timing = node.__transition) || !(timing = timing[id])) if (!(node = node.parentNode)) throw new Error(`transition ${id} not found`);
	return timing;
}
function transition_default(name) {
	var id, timing;
	if (name instanceof Transition) id = name._id, name = name._name;
	else id = newId(), (timing = defaultTiming).time = now$2(), name = name == null ? null : name + "";
	for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) if (node = group[i]) schedule_default(node, name, id, i, group, timing || inherit(node, id));
	return new Transition(groups, this._parents, name, id);
}
//#endregion
//#region node_modules/.pnpm/d3-transition@3.0.1_d3-selection@3.0.0/node_modules/d3-transition/src/selection/index.js
selection.prototype.interrupt = interrupt_default;
selection.prototype.transition = transition_default;
//#endregion
//#region node_modules/.pnpm/d3-zoom@3.0.0/node_modules/d3-zoom/src/constant.js
var constant_default$1 = (x) => () => x;
//#endregion
//#region node_modules/.pnpm/d3-zoom@3.0.0/node_modules/d3-zoom/src/event.js
function ZoomEvent(type, { sourceEvent, target, transform, dispatch }) {
	Object.defineProperties(this, {
		type: {
			value: type,
			enumerable: true,
			configurable: true
		},
		sourceEvent: {
			value: sourceEvent,
			enumerable: true,
			configurable: true
		},
		target: {
			value: target,
			enumerable: true,
			configurable: true
		},
		transform: {
			value: transform,
			enumerable: true,
			configurable: true
		},
		_: { value: dispatch }
	});
}
//#endregion
//#region node_modules/.pnpm/d3-zoom@3.0.0/node_modules/d3-zoom/src/transform.js
function Transform(k, x, y) {
	this.k = k;
	this.x = x;
	this.y = y;
}
Transform.prototype = {
	constructor: Transform,
	scale: function(k) {
		return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
	},
	translate: function(x, y) {
		return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
	},
	apply: function(point) {
		return [point[0] * this.k + this.x, point[1] * this.k + this.y];
	},
	applyX: function(x) {
		return x * this.k + this.x;
	},
	applyY: function(y) {
		return y * this.k + this.y;
	},
	invert: function(location) {
		return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
	},
	invertX: function(x) {
		return (x - this.x) / this.k;
	},
	invertY: function(y) {
		return (y - this.y) / this.k;
	},
	rescaleX: function(x) {
		return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
	},
	rescaleY: function(y) {
		return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
	},
	toString: function() {
		return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
	}
};
var identity = new Transform(1, 0, 0);
transform.prototype = Transform.prototype;
function transform(node) {
	while (!node.__zoom) if (!(node = node.parentNode)) return identity;
	return node.__zoom;
}
//#endregion
//#region node_modules/.pnpm/d3-zoom@3.0.0/node_modules/d3-zoom/src/noevent.js
function nopropagation(event) {
	event.stopImmediatePropagation();
}
function noevent_default(event) {
	event.preventDefault();
	event.stopImmediatePropagation();
}
//#endregion
//#region node_modules/.pnpm/d3-zoom@3.0.0/node_modules/d3-zoom/src/zoom.js
function defaultFilter(event) {
	return (!event.ctrlKey || event.type === "wheel") && !event.button;
}
function defaultExtent() {
	var e = this;
	if (e instanceof SVGElement) {
		e = e.ownerSVGElement || e;
		if (e.hasAttribute("viewBox")) {
			e = e.viewBox.baseVal;
			return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
		}
		return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
	}
	return [[0, 0], [e.clientWidth, e.clientHeight]];
}
function defaultTransform() {
	return this.__zoom || identity;
}
function defaultWheelDelta(event) {
	return -event.deltaY * (event.deltaMode === 1 ? .05 : event.deltaMode ? 1 : .002) * (event.ctrlKey ? 10 : 1);
}
function defaultTouchable() {
	return navigator.maxTouchPoints || "ontouchstart" in this;
}
function defaultConstrain(transform, extent, translateExtent) {
	var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
	return transform.translate(dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1), dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1));
}
function zoom_default() {
	var filter = defaultFilter, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate = zoom_default$1, listeners = dispatch("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
	function zoom(selection) {
		selection.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
	}
	zoom.transform = function(collection, transform, point, event) {
		var selection = collection.selection ? collection.selection() : collection;
		selection.property("__zoom", defaultTransform);
		if (collection !== selection) schedule(collection, transform, point, event);
		else selection.interrupt().each(function() {
			gesture(this, arguments).event(event).start().zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform).end();
		});
	};
	zoom.scaleBy = function(selection, k, p, event) {
		zoom.scaleTo(selection, function() {
			return this.__zoom.k * (typeof k === "function" ? k.apply(this, arguments) : k);
		}, p, event);
	};
	zoom.scaleTo = function(selection, k, p, event) {
		zoom.transform(selection, function() {
			var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
			return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
		}, p, event);
	};
	zoom.translateBy = function(selection, x, y, event) {
		zoom.transform(selection, function() {
			return constrain(this.__zoom.translate(typeof x === "function" ? x.apply(this, arguments) : x, typeof y === "function" ? y.apply(this, arguments) : y), extent.apply(this, arguments), translateExtent);
		}, null, event);
	};
	zoom.translateTo = function(selection, x, y, p, event) {
		zoom.transform(selection, function() {
			var e = extent.apply(this, arguments), t = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
			return constrain(identity.translate(p0[0], p0[1]).scale(t.k).translate(typeof x === "function" ? -x.apply(this, arguments) : -x, typeof y === "function" ? -y.apply(this, arguments) : -y), e, translateExtent);
		}, p, event);
	};
	function scale(transform, k) {
		k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
		return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
	}
	function translate(transform, p0, p1) {
		var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
		return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
	}
	function centroid(extent) {
		return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
	}
	function schedule(transition, transform, point, event) {
		transition.on("start.zoom", function() {
			gesture(this, arguments).event(event).start();
		}).on("interrupt.zoom end.zoom", function() {
			gesture(this, arguments).event(event).end();
		}).tween("zoom", function() {
			var that = this, args = arguments, g = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform === "function" ? transform.apply(that, args) : transform, i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
			return function(t) {
				if (t === 1) t = b;
				else {
					var l = i(t), k = w / l[2];
					t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
				}
				g.zoom(null, t);
			};
		});
	}
	function gesture(that, args, clean) {
		return !clean && that.__zooming || new Gesture(that, args);
	}
	function Gesture(that, args) {
		this.that = that;
		this.args = args;
		this.active = 0;
		this.sourceEvent = null;
		this.extent = extent.apply(that, args);
		this.taps = 0;
	}
	Gesture.prototype = {
		event: function(event) {
			if (event) this.sourceEvent = event;
			return this;
		},
		start: function() {
			if (++this.active === 1) {
				this.that.__zooming = this;
				this.emit("start");
			}
			return this;
		},
		zoom: function(key, transform) {
			if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
			if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
			if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
			this.that.__zoom = transform;
			this.emit("zoom");
			return this;
		},
		end: function() {
			if (--this.active === 0) {
				delete this.that.__zooming;
				this.emit("end");
			}
			return this;
		},
		emit: function(type) {
			var d = select_default$1(this.that).datum();
			listeners.call(type, this.that, new ZoomEvent(type, {
				sourceEvent: this.sourceEvent,
				target: zoom,
				type,
				transform: this.that.__zoom,
				dispatch: listeners
			}), d);
		}
	};
	function wheeled(event, ...args) {
		if (!filter.apply(this, arguments)) return;
		var g = gesture(this, args).event(event), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer_default(event);
		if (g.wheel) {
			if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) g.mouse[1] = t.invert(g.mouse[0] = p);
			clearTimeout(g.wheel);
		} else if (t.k === k) return;
		else {
			g.mouse = [p, t.invert(p)];
			interrupt_default$1(this);
			g.start();
		}
		noevent_default(event);
		g.wheel = setTimeout(wheelidled, wheelDelay);
		g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
		function wheelidled() {
			g.wheel = null;
			g.end();
		}
	}
	function mousedowned(event, ...args) {
		if (touchending || !filter.apply(this, arguments)) return;
		var currentTarget = event.currentTarget, g = gesture(this, args, true).event(event), v = select_default$1(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer_default(event, currentTarget), x0 = event.clientX, y0 = event.clientY;
		nodrag_default(event.view);
		nopropagation(event);
		g.mouse = [p, this.__zoom.invert(p)];
		interrupt_default$1(this);
		g.start();
		function mousemoved(event) {
			noevent_default(event);
			if (!g.moved) {
				var dx = event.clientX - x0, dy = event.clientY - y0;
				g.moved = dx * dx + dy * dy > clickDistance2;
			}
			g.event(event).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer_default(event, currentTarget), g.mouse[1]), g.extent, translateExtent));
		}
		function mouseupped(event) {
			v.on("mousemove.zoom mouseup.zoom", null);
			yesdrag(event.view, g.moved);
			noevent_default(event);
			g.event(event).end();
		}
	}
	function dblclicked(event, ...args) {
		if (!filter.apply(this, arguments)) return;
		var t0 = this.__zoom, p0 = pointer_default(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? .5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
		noevent_default(event);
		if (duration > 0) select_default$1(this).transition().duration(duration).call(schedule, t1, p0, event);
		else select_default$1(this).call(zoom.transform, t1, p0, event);
	}
	function touchstarted(event, ...args) {
		if (!filter.apply(this, arguments)) return;
		var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
		nopropagation(event);
		for (i = 0; i < n; ++i) {
			t = touches[i], p = pointer_default(t, this);
			p = [
				p,
				this.__zoom.invert(p),
				t.identifier
			];
			if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
			else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
		}
		if (touchstarting) touchstarting = clearTimeout(touchstarting);
		if (started) {
			if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
				touchstarting = null;
			}, touchDelay);
			interrupt_default$1(this);
			g.start();
		}
	}
	function touchmoved(event, ...args) {
		if (!this.__zooming) return;
		var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l;
		noevent_default(event);
		for (i = 0; i < n; ++i) {
			t = touches[i], p = pointer_default(t, this);
			if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
			else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
		}
		t = g.that.__zoom;
		if (g.touch1) {
			var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
			t = scale(t, Math.sqrt(dp / dl));
			p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
			l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
		} else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
		else return;
		g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
	}
	function touchended(event, ...args) {
		if (!this.__zooming) return;
		var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
		nopropagation(event);
		if (touchending) clearTimeout(touchending);
		touchending = setTimeout(function() {
			touchending = null;
		}, touchDelay);
		for (i = 0; i < n; ++i) {
			t = touches[i];
			if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
			else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
		}
		if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
		if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
		else {
			g.end();
			if (g.taps === 2) {
				t = pointer_default(t, this);
				if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
					var p = select_default$1(this).on("dblclick.zoom");
					if (p) p.apply(this, arguments);
				}
			}
		}
	}
	zoom.wheelDelta = function(_) {
		return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant_default$1(+_), zoom) : wheelDelta;
	};
	zoom.filter = function(_) {
		return arguments.length ? (filter = typeof _ === "function" ? _ : constant_default$1(!!_), zoom) : filter;
	};
	zoom.touchable = function(_) {
		return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default$1(!!_), zoom) : touchable;
	};
	zoom.extent = function(_) {
		return arguments.length ? (extent = typeof _ === "function" ? _ : constant_default$1([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
	};
	zoom.scaleExtent = function(_) {
		return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
	};
	zoom.translateExtent = function(_) {
		return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
	};
	zoom.constrain = function(_) {
		return arguments.length ? (constrain = _, zoom) : constrain;
	};
	zoom.duration = function(_) {
		return arguments.length ? (duration = +_, zoom) : duration;
	};
	zoom.interpolate = function(_) {
		return arguments.length ? (interpolate = _, zoom) : interpolate;
	};
	zoom.on = function() {
		var value = listeners.on.apply(listeners, arguments);
		return value === listeners ? zoom : value;
	};
	zoom.clickDistance = function(_) {
		return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
	};
	zoom.tapDistance = function(_) {
		return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
	};
	return zoom;
}
//#endregion
//#region node_modules/.pnpm/d3-array@3.2.4/node_modules/d3-array/src/max.js
function max$1(values, valueof) {
	let max;
	if (valueof === void 0) {
		for (const value of values) if (value != null && (max < value || max === void 0 && value >= value)) max = value;
	} else {
		let index = -1;
		for (let value of values) if ((value = valueof(value, ++index, values)) != null && (max < value || max === void 0 && value >= value)) max = value;
	}
	return max;
}
//#endregion
//#region node_modules/.pnpm/d3-array@3.2.4/node_modules/d3-array/src/min.js
function min$1(values, valueof) {
	let min;
	if (valueof === void 0) {
		for (const value of values) if (value != null && (min > value || min === void 0 && value >= value)) min = value;
	} else {
		let index = -1;
		for (let value of values) if ((value = valueof(value, ++index, values)) != null && (min > value || min === void 0 && value >= value)) min = value;
	}
	return min;
}
//#endregion
//#region node_modules/.pnpm/d3-array@3.2.4/node_modules/d3-array/src/sum.js
function sum(values, valueof) {
	let sum = 0;
	if (valueof === void 0) {
		for (let value of values) if (value = +value) sum += value;
	} else {
		let index = -1;
		for (let value of values) if (value = +valueof(value, ++index, values)) sum += value;
	}
	return sum;
}
//#endregion
//#region node_modules/.pnpm/internmap@2.0.3/node_modules/internmap/src/index.js
var InternMap = class extends Map {
	constructor(entries, key = keyof) {
		super();
		Object.defineProperties(this, {
			_intern: { value: /* @__PURE__ */ new Map() },
			_key: { value: key }
		});
		if (entries != null) for (const [key, value] of entries) this.set(key, value);
	}
	get(key) {
		return super.get(intern_get(this, key));
	}
	has(key) {
		return super.has(intern_get(this, key));
	}
	set(key, value) {
		return super.set(intern_set(this, key), value);
	}
	delete(key) {
		return super.delete(intern_delete(this, key));
	}
};
function intern_get({ _intern, _key }, value) {
	const key = _key(value);
	return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({ _intern, _key }, value) {
	const key = _key(value);
	if (_intern.has(key)) return _intern.get(key);
	_intern.set(key, value);
	return value;
}
function intern_delete({ _intern, _key }, value) {
	const key = _key(value);
	if (_intern.has(key)) {
		value = _intern.get(key);
		_intern.delete(key);
	}
	return value;
}
function keyof(value) {
	return value !== null && typeof value === "object" ? value.valueOf() : value;
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/isObject.js
/**
* Checks if `value` is the
* [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
* of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
*
* @static
* @memberOf _
* @since 0.1.0
* @category Lang
* @param {*} value The value to check.
* @returns {boolean} Returns `true` if `value` is an object, else `false`.
* @example
*
* _.isObject({});
* // => true
*
* _.isObject([1, 2, 3]);
* // => true
*
* _.isObject(_.noop);
* // => true
*
* _.isObject(null);
* // => false
*/
function isObject(value) {
	var type = typeof value;
	return value != null && (type == "object" || type == "function");
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/_freeGlobal.js
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/_root.js
/** Detect free variable `self`. */
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
/** Used as a reference to the global object. */
var root$1 = freeGlobal || freeSelf || Function("return this")();
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/now.js
/**
* Gets the timestamp of the number of milliseconds that have elapsed since
* the Unix epoch (1 January 1970 00:00:00 UTC).
*
* @static
* @memberOf _
* @since 2.4.0
* @category Date
* @returns {number} Returns the timestamp.
* @example
*
* _.defer(function(stamp) {
*   console.log(_.now() - stamp);
* }, _.now());
* // => Logs the number of milliseconds it took for the deferred invocation.
*/
var now$1 = function() {
	return root$1.Date.now();
};
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/_trimmedEndIndex.js
/** Used to match a single whitespace character. */
var reWhitespace = /\s/;
/**
* Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
* character of `string`.
*
* @private
* @param {string} string The string to inspect.
* @returns {number} Returns the index of the last non-whitespace character.
*/
function trimmedEndIndex(string) {
	var index = string.length;
	while (index-- && reWhitespace.test(string.charAt(index)));
	return index;
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/_baseTrim.js
/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;
/**
* The base implementation of `_.trim`.
*
* @private
* @param {string} string The string to trim.
* @returns {string} Returns the trimmed string.
*/
function baseTrim(string) {
	return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/_Symbol.js
/** Built-in value references. */
var Symbol$1 = root$1.Symbol;
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/_getRawTag.js
/** Used for built-in method references. */
var objectProto = Object.prototype;
/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;
/**
* Used to resolve the
* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
* of values.
*/
var nativeObjectToString$1 = objectProto.toString;
/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
/**
* A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
*
* @private
* @param {*} value The value to query.
* @returns {string} Returns the raw `toStringTag`.
*/
function getRawTag(value) {
	var isOwn = hasOwnProperty.call(value, symToStringTag$1), tag = value[symToStringTag$1];
	try {
		value[symToStringTag$1] = void 0;
		var unmasked = true;
	} catch (e) {}
	var result = nativeObjectToString$1.call(value);
	if (unmasked) if (isOwn) value[symToStringTag$1] = tag;
	else delete value[symToStringTag$1];
	return result;
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/_objectToString.js
/**
* Used to resolve the
* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
* of values.
*/
var nativeObjectToString = Object.prototype.toString;
/**
* Converts `value` to a string using `Object.prototype.toString`.
*
* @private
* @param {*} value The value to convert.
* @returns {string} Returns the converted string.
*/
function objectToString(value) {
	return nativeObjectToString.call(value);
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/_baseGetTag.js
/** `Object#toString` result references. */
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
/**
* The base implementation of `getTag` without fallbacks for buggy environments.
*
* @private
* @param {*} value The value to query.
* @returns {string} Returns the `toStringTag`.
*/
function baseGetTag(value) {
	if (value == null) return value === void 0 ? undefinedTag : nullTag;
	return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/isObjectLike.js
/**
* Checks if `value` is object-like. A value is object-like if it's not `null`
* and has a `typeof` result of "object".
*
* @static
* @memberOf _
* @since 4.0.0
* @category Lang
* @param {*} value The value to check.
* @returns {boolean} Returns `true` if `value` is object-like, else `false`.
* @example
*
* _.isObjectLike({});
* // => true
*
* _.isObjectLike([1, 2, 3]);
* // => true
*
* _.isObjectLike(_.noop);
* // => false
*
* _.isObjectLike(null);
* // => false
*/
function isObjectLike(value) {
	return value != null && typeof value == "object";
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/isSymbol.js
/** `Object#toString` result references. */
var symbolTag = "[object Symbol]";
/**
* Checks if `value` is classified as a `Symbol` primitive or object.
*
* @static
* @memberOf _
* @since 4.0.0
* @category Lang
* @param {*} value The value to check.
* @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
* @example
*
* _.isSymbol(Symbol.iterator);
* // => true
*
* _.isSymbol('abc');
* // => false
*/
function isSymbol(value) {
	return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/toNumber.js
/** Used as references for various `Number` constants. */
var NAN = NaN;
/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;
/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;
/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;
/**
* Converts `value` to a number.
*
* @static
* @memberOf _
* @since 4.0.0
* @category Lang
* @param {*} value The value to process.
* @returns {number} Returns the number.
* @example
*
* _.toNumber(3.2);
* // => 3.2
*
* _.toNumber(Number.MIN_VALUE);
* // => 5e-324
*
* _.toNumber(Infinity);
* // => Infinity
*
* _.toNumber('3.2');
* // => 3.2
*/
function toNumber(value) {
	if (typeof value == "number") return value;
	if (isSymbol(value)) return NAN;
	if (isObject(value)) {
		var other = typeof value.valueOf == "function" ? value.valueOf() : value;
		value = isObject(other) ? other + "" : other;
	}
	if (typeof value != "string") return value === 0 ? value : +value;
	value = baseTrim(value);
	var isBinary = reIsBinary.test(value);
	return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/debounce.js
/** Error message constants. */
var FUNC_ERROR_TEXT$1 = "Expected a function";
var nativeMax = Math.max, nativeMin = Math.min;
/**
* Creates a debounced function that delays invoking `func` until after `wait`
* milliseconds have elapsed since the last time the debounced function was
* invoked. The debounced function comes with a `cancel` method to cancel
* delayed `func` invocations and a `flush` method to immediately invoke them.
* Provide `options` to indicate whether `func` should be invoked on the
* leading and/or trailing edge of the `wait` timeout. The `func` is invoked
* with the last arguments provided to the debounced function. Subsequent
* calls to the debounced function return the result of the last `func`
* invocation.
*
* **Note:** If `leading` and `trailing` options are `true`, `func` is
* invoked on the trailing edge of the timeout only if the debounced function
* is invoked more than once during the `wait` timeout.
*
* If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
* until to the next tick, similar to `setTimeout` with a timeout of `0`.
*
* See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
* for details over the differences between `_.debounce` and `_.throttle`.
*
* @static
* @memberOf _
* @since 0.1.0
* @category Function
* @param {Function} func The function to debounce.
* @param {number} [wait=0] The number of milliseconds to delay.
* @param {Object} [options={}] The options object.
* @param {boolean} [options.leading=false]
*  Specify invoking on the leading edge of the timeout.
* @param {number} [options.maxWait]
*  The maximum time `func` is allowed to be delayed before it's invoked.
* @param {boolean} [options.trailing=true]
*  Specify invoking on the trailing edge of the timeout.
* @returns {Function} Returns the new debounced function.
* @example
*
* // Avoid costly calculations while the window size is in flux.
* jQuery(window).on('resize', _.debounce(calculateLayout, 150));
*
* // Invoke `sendMail` when clicked, debouncing subsequent calls.
* jQuery(element).on('click', _.debounce(sendMail, 300, {
*   'leading': true,
*   'trailing': false
* }));
*
* // Ensure `batchLog` is invoked once after 1 second of debounced calls.
* var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
* var source = new EventSource('/stream');
* jQuery(source).on('message', debounced);
*
* // Cancel the trailing debounced invocation.
* jQuery(window).on('popstate', debounced.cancel);
*/
function debounce(func, wait, options) {
	var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
	if (typeof func != "function") throw new TypeError(FUNC_ERROR_TEXT$1);
	wait = toNumber(wait) || 0;
	if (isObject(options)) {
		leading = !!options.leading;
		maxing = "maxWait" in options;
		maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
		trailing = "trailing" in options ? !!options.trailing : trailing;
	}
	function invokeFunc(time) {
		var args = lastArgs, thisArg = lastThis;
		lastArgs = lastThis = void 0;
		lastInvokeTime = time;
		result = func.apply(thisArg, args);
		return result;
	}
	function leadingEdge(time) {
		lastInvokeTime = time;
		timerId = setTimeout(timerExpired, wait);
		return leading ? invokeFunc(time) : result;
	}
	function remainingWait(time) {
		var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
		return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
	}
	function shouldInvoke(time) {
		var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
		return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
	}
	function timerExpired() {
		var time = now$1();
		if (shouldInvoke(time)) return trailingEdge(time);
		timerId = setTimeout(timerExpired, remainingWait(time));
	}
	function trailingEdge(time) {
		timerId = void 0;
		if (trailing && lastArgs) return invokeFunc(time);
		lastArgs = lastThis = void 0;
		return result;
	}
	function cancel() {
		if (timerId !== void 0) clearTimeout(timerId);
		lastInvokeTime = 0;
		lastArgs = lastCallTime = lastThis = timerId = void 0;
	}
	function flush() {
		return timerId === void 0 ? result : trailingEdge(now$1());
	}
	function debounced() {
		var time = now$1(), isInvoking = shouldInvoke(time);
		lastArgs = arguments;
		lastThis = this;
		lastCallTime = time;
		if (isInvoking) {
			if (timerId === void 0) return leadingEdge(lastCallTime);
			if (maxing) {
				clearTimeout(timerId);
				timerId = setTimeout(timerExpired, wait);
				return invokeFunc(lastCallTime);
			}
		}
		if (timerId === void 0) timerId = setTimeout(timerExpired, wait);
		return result;
	}
	debounced.cancel = cancel;
	debounced.flush = flush;
	return debounced;
}
//#endregion
//#region node_modules/.pnpm/lodash-es@4.18.1/node_modules/lodash-es/throttle.js
/** Error message constants. */
var FUNC_ERROR_TEXT = "Expected a function";
/**
* Creates a throttled function that only invokes `func` at most once per
* every `wait` milliseconds. The throttled function comes with a `cancel`
* method to cancel delayed `func` invocations and a `flush` method to
* immediately invoke them. Provide `options` to indicate whether `func`
* should be invoked on the leading and/or trailing edge of the `wait`
* timeout. The `func` is invoked with the last arguments provided to the
* throttled function. Subsequent calls to the throttled function return the
* result of the last `func` invocation.
*
* **Note:** If `leading` and `trailing` options are `true`, `func` is
* invoked on the trailing edge of the timeout only if the throttled function
* is invoked more than once during the `wait` timeout.
*
* If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
* until to the next tick, similar to `setTimeout` with a timeout of `0`.
*
* See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
* for details over the differences between `_.throttle` and `_.debounce`.
*
* @static
* @memberOf _
* @since 0.1.0
* @category Function
* @param {Function} func The function to throttle.
* @param {number} [wait=0] The number of milliseconds to throttle invocations to.
* @param {Object} [options={}] The options object.
* @param {boolean} [options.leading=true]
*  Specify invoking on the leading edge of the timeout.
* @param {boolean} [options.trailing=true]
*  Specify invoking on the trailing edge of the timeout.
* @returns {Function} Returns the new throttled function.
* @example
*
* // Avoid excessively updating the position while scrolling.
* jQuery(window).on('scroll', _.throttle(updatePosition, 100));
*
* // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
* var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
* jQuery(element).on('click', throttled);
*
* // Cancel the trailing throttled invocation.
* jQuery(window).on('popstate', throttled.cancel);
*/
function throttle(func, wait, options) {
	var leading = true, trailing = true;
	if (typeof func != "function") throw new TypeError(FUNC_ERROR_TEXT);
	if (isObject(options)) {
		leading = "leading" in options ? !!options.leading : leading;
		trailing = "trailing" in options ? !!options.trailing : trailing;
	}
	return debounce(func, wait, {
		"leading": leading,
		"maxWait": wait,
		"trailing": trailing
	});
}
//#endregion
//#region node_modules/.pnpm/@tweenjs+tween.js@25.0.0/node_modules/@tweenjs/tween.js/dist/tween.esm.js
/**
* The Ease class provides a collection of easing functions for use with tween.js.
*/
var Easing = Object.freeze({
	Linear: Object.freeze({
		None: function(amount) {
			return amount;
		},
		In: function(amount) {
			return amount;
		},
		Out: function(amount) {
			return amount;
		},
		InOut: function(amount) {
			return amount;
		}
	}),
	Quadratic: Object.freeze({
		In: function(amount) {
			return amount * amount;
		},
		Out: function(amount) {
			return amount * (2 - amount);
		},
		InOut: function(amount) {
			if ((amount *= 2) < 1) return .5 * amount * amount;
			return -.5 * (--amount * (amount - 2) - 1);
		}
	}),
	Cubic: Object.freeze({
		In: function(amount) {
			return amount * amount * amount;
		},
		Out: function(amount) {
			return --amount * amount * amount + 1;
		},
		InOut: function(amount) {
			if ((amount *= 2) < 1) return .5 * amount * amount * amount;
			return .5 * ((amount -= 2) * amount * amount + 2);
		}
	}),
	Quartic: Object.freeze({
		In: function(amount) {
			return amount * amount * amount * amount;
		},
		Out: function(amount) {
			return 1 - --amount * amount * amount * amount;
		},
		InOut: function(amount) {
			if ((amount *= 2) < 1) return .5 * amount * amount * amount * amount;
			return -.5 * ((amount -= 2) * amount * amount * amount - 2);
		}
	}),
	Quintic: Object.freeze({
		In: function(amount) {
			return amount * amount * amount * amount * amount;
		},
		Out: function(amount) {
			return --amount * amount * amount * amount * amount + 1;
		},
		InOut: function(amount) {
			if ((amount *= 2) < 1) return .5 * amount * amount * amount * amount * amount;
			return .5 * ((amount -= 2) * amount * amount * amount * amount + 2);
		}
	}),
	Sinusoidal: Object.freeze({
		In: function(amount) {
			return 1 - Math.sin((1 - amount) * Math.PI / 2);
		},
		Out: function(amount) {
			return Math.sin(amount * Math.PI / 2);
		},
		InOut: function(amount) {
			return .5 * (1 - Math.sin(Math.PI * (.5 - amount)));
		}
	}),
	Exponential: Object.freeze({
		In: function(amount) {
			return amount === 0 ? 0 : Math.pow(1024, amount - 1);
		},
		Out: function(amount) {
			return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
		},
		InOut: function(amount) {
			if (amount === 0) return 0;
			if (amount === 1) return 1;
			if ((amount *= 2) < 1) return .5 * Math.pow(1024, amount - 1);
			return .5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
		}
	}),
	Circular: Object.freeze({
		In: function(amount) {
			return 1 - Math.sqrt(1 - amount * amount);
		},
		Out: function(amount) {
			return Math.sqrt(1 - --amount * amount);
		},
		InOut: function(amount) {
			if ((amount *= 2) < 1) return -.5 * (Math.sqrt(1 - amount * amount) - 1);
			return .5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
		}
	}),
	Elastic: Object.freeze({
		In: function(amount) {
			if (amount === 0) return 0;
			if (amount === 1) return 1;
			return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
		},
		Out: function(amount) {
			if (amount === 0) return 0;
			if (amount === 1) return 1;
			return Math.pow(2, -10 * amount) * Math.sin((amount - .1) * 5 * Math.PI) + 1;
		},
		InOut: function(amount) {
			if (amount === 0) return 0;
			if (amount === 1) return 1;
			amount *= 2;
			if (amount < 1) return -.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
			return .5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
		}
	}),
	Back: Object.freeze({
		In: function(amount) {
			var s = 1.70158;
			return amount === 1 ? 1 : amount * amount * ((s + 1) * amount - s);
		},
		Out: function(amount) {
			var s = 1.70158;
			return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1;
		},
		InOut: function(amount) {
			var s = 1.70158 * 1.525;
			if ((amount *= 2) < 1) return .5 * (amount * amount * ((s + 1) * amount - s));
			return .5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
		}
	}),
	Bounce: Object.freeze({
		In: function(amount) {
			return 1 - Easing.Bounce.Out(1 - amount);
		},
		Out: function(amount) {
			if (amount < 1 / 2.75) return 7.5625 * amount * amount;
			else if (amount < 2 / 2.75) return 7.5625 * (amount -= 1.5 / 2.75) * amount + .75;
			else if (amount < 2.5 / 2.75) return 7.5625 * (amount -= 2.25 / 2.75) * amount + .9375;
			else return 7.5625 * (amount -= 2.625 / 2.75) * amount + .984375;
		},
		InOut: function(amount) {
			if (amount < .5) return Easing.Bounce.In(amount * 2) * .5;
			return Easing.Bounce.Out(amount * 2 - 1) * .5 + .5;
		}
	}),
	generatePow: function(power) {
		if (power === void 0) power = 4;
		power = power < Number.EPSILON ? Number.EPSILON : power;
		power = power > 1e4 ? 1e4 : power;
		return {
			In: function(amount) {
				return Math.pow(amount, power);
			},
			Out: function(amount) {
				return 1 - Math.pow(1 - amount, power);
			},
			InOut: function(amount) {
				if (amount < .5) return Math.pow(amount * 2, power) / 2;
				return (1 - Math.pow(2 - amount * 2, power)) / 2 + .5;
			}
		};
	}
});
var now = function() {
	return performance.now();
};
/**
* Controlling groups of tweens
*
* Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
* In these cases, you may want to create your own smaller groups of tween
*/
var Group = function() {
	function Group() {
		var tweens = [];
		for (var _i = 0; _i < arguments.length; _i++) tweens[_i] = arguments[_i];
		this._tweens = {};
		this._tweensAddedDuringUpdate = {};
		this.add.apply(this, tweens);
	}
	Group.prototype.getAll = function() {
		var _this = this;
		return Object.keys(this._tweens).map(function(tweenId) {
			return _this._tweens[tweenId];
		});
	};
	Group.prototype.removeAll = function() {
		this._tweens = {};
	};
	Group.prototype.add = function() {
		var _a;
		var tweens = [];
		for (var _i = 0; _i < arguments.length; _i++) tweens[_i] = arguments[_i];
		for (var _b = 0, tweens_1 = tweens; _b < tweens_1.length; _b++) {
			var tween = tweens_1[_b];
			(_a = tween._group) === null || _a === void 0 || _a.remove(tween);
			tween._group = this;
			this._tweens[tween.getId()] = tween;
			this._tweensAddedDuringUpdate[tween.getId()] = tween;
		}
	};
	Group.prototype.remove = function() {
		var tweens = [];
		for (var _i = 0; _i < arguments.length; _i++) tweens[_i] = arguments[_i];
		for (var _a = 0, tweens_2 = tweens; _a < tweens_2.length; _a++) {
			var tween = tweens_2[_a];
			tween._group = void 0;
			delete this._tweens[tween.getId()];
			delete this._tweensAddedDuringUpdate[tween.getId()];
		}
	};
	/** Return true if all tweens in the group are not paused or playing. */
	Group.prototype.allStopped = function() {
		return this.getAll().every(function(tween) {
			return !tween.isPlaying();
		});
	};
	Group.prototype.update = function(time, preserve) {
		if (time === void 0) time = now();
		if (preserve === void 0) preserve = true;
		var tweenIds = Object.keys(this._tweens);
		if (tweenIds.length === 0) return;
		while (tweenIds.length > 0) {
			this._tweensAddedDuringUpdate = {};
			for (var i = 0; i < tweenIds.length; i++) {
				var tween = this._tweens[tweenIds[i]];
				var autoStart = !preserve;
				if (tween && tween.update(time, autoStart) === false && !preserve) this.remove(tween);
			}
			tweenIds = Object.keys(this._tweensAddedDuringUpdate);
		}
	};
	return Group;
}();
/**
*
*/
var Interpolation = {
	Linear: function(v, k) {
		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = Interpolation.Utils.Linear;
		if (k < 0) return fn(v[0], v[1], f);
		if (k > 1) return fn(v[m], v[m - 1], m - f);
		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
	},
	Bezier: function(v, k) {
		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = Interpolation.Utils.Bernstein;
		for (var i = 0; i <= n; i++) b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		return b;
	},
	CatmullRom: function(v, k) {
		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = Interpolation.Utils.CatmullRom;
		if (v[0] === v[m]) {
			if (k < 0) i = Math.floor(f = m * (1 + k));
			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
		} else {
			if (k < 0) return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			if (k > 1) return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
		}
	},
	Utils: {
		Linear: function(p0, p1, t) {
			return (p1 - p0) * t + p0;
		},
		Bernstein: function(n, i) {
			var fc = Interpolation.Utils.Factorial;
			return fc(n) / fc(i) / fc(n - i);
		},
		Factorial: (function() {
			var a = [1];
			return function(n) {
				var s = 1;
				if (a[n]) return a[n];
				for (var i = n; i > 1; i--) s *= i;
				a[n] = s;
				return s;
			};
		})(),
		CatmullRom: function(p0, p1, p2, p3, t) {
			var v0 = (p2 - p0) * .5;
			var v1 = (p3 - p1) * .5;
			var t2 = t * t;
			var t3 = t * t2;
			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
		}
	}
};
/**
* Utils
*/
var Sequence = function() {
	function Sequence() {}
	Sequence.nextId = function() {
		return Sequence._nextId++;
	};
	Sequence._nextId = 0;
	return Sequence;
}();
var mainGroup = new Group();
/**
* Tween.js - Licensed under the MIT license
* https://github.com/tweenjs/tween.js
* ----------------------------------------------
*
* See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
* Thank you all, you're awesome!
*/
var Tween = function() {
	function Tween(object, group) {
		this._isPaused = false;
		this._pauseStart = 0;
		this._valuesStart = {};
		this._valuesEnd = {};
		this._valuesStartRepeat = {};
		this._duration = 1e3;
		this._isDynamic = false;
		this._initialRepeat = 0;
		this._repeat = 0;
		this._yoyo = false;
		this._isPlaying = false;
		this._reversed = false;
		this._delayTime = 0;
		this._startTime = 0;
		this._easingFunction = Easing.Linear.None;
		this._interpolationFunction = Interpolation.Linear;
		this._chainedTweens = [];
		this._onStartCallbackFired = false;
		this._onEveryStartCallbackFired = false;
		this._id = Sequence.nextId();
		this._isChainStopped = false;
		this._propertiesAreSetUp = false;
		this._goToEnd = false;
		this._object = object;
		if (typeof group === "object") {
			this._group = group;
			group.add(this);
		} else if (group === true) {
			this._group = mainGroup;
			mainGroup.add(this);
		}
	}
	Tween.prototype.getId = function() {
		return this._id;
	};
	Tween.prototype.isPlaying = function() {
		return this._isPlaying;
	};
	Tween.prototype.isPaused = function() {
		return this._isPaused;
	};
	Tween.prototype.getDuration = function() {
		return this._duration;
	};
	Tween.prototype.to = function(target, duration) {
		if (duration === void 0) duration = 1e3;
		if (this._isPlaying) throw new Error("Can not call Tween.to() while Tween is already started or paused. Stop the Tween first.");
		this._valuesEnd = target;
		this._propertiesAreSetUp = false;
		this._duration = duration < 0 ? 0 : duration;
		return this;
	};
	Tween.prototype.duration = function(duration) {
		if (duration === void 0) duration = 1e3;
		this._duration = duration < 0 ? 0 : duration;
		return this;
	};
	Tween.prototype.dynamic = function(dynamic) {
		if (dynamic === void 0) dynamic = false;
		this._isDynamic = dynamic;
		return this;
	};
	Tween.prototype.start = function(time, overrideStartingValues) {
		if (time === void 0) time = now();
		if (overrideStartingValues === void 0) overrideStartingValues = false;
		if (this._isPlaying) return this;
		this._repeat = this._initialRepeat;
		if (this._reversed) {
			this._reversed = false;
			for (var property in this._valuesStartRepeat) {
				this._swapEndStartRepeatValues(property);
				this._valuesStart[property] = this._valuesStartRepeat[property];
			}
		}
		this._isPlaying = true;
		this._isPaused = false;
		this._onStartCallbackFired = false;
		this._onEveryStartCallbackFired = false;
		this._isChainStopped = false;
		this._startTime = time;
		this._startTime += this._delayTime;
		if (!this._propertiesAreSetUp || overrideStartingValues) {
			this._propertiesAreSetUp = true;
			if (!this._isDynamic) {
				var tmp = {};
				for (var prop in this._valuesEnd) tmp[prop] = this._valuesEnd[prop];
				this._valuesEnd = tmp;
			}
			this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat, overrideStartingValues);
		}
		return this;
	};
	Tween.prototype.startFromCurrentValues = function(time) {
		return this.start(time, true);
	};
	Tween.prototype._setupProperties = function(_object, _valuesStart, _valuesEnd, _valuesStartRepeat, overrideStartingValues) {
		for (var property in _valuesEnd) {
			var startValue = _object[property];
			var startValueIsArray = Array.isArray(startValue);
			var propType = startValueIsArray ? "array" : typeof startValue;
			var isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);
			if (propType === "undefined" || propType === "function") continue;
			if (isInterpolationList) {
				var endValues = _valuesEnd[property];
				if (endValues.length === 0) continue;
				var temp = [startValue];
				for (var i = 0, l = endValues.length; i < l; i += 1) {
					var value = this._handleRelativeValue(startValue, endValues[i]);
					if (isNaN(value)) {
						isInterpolationList = false;
						console.warn("Found invalid interpolation list. Skipping.");
						break;
					}
					temp.push(value);
				}
				if (isInterpolationList) _valuesEnd[property] = temp;
			}
			if ((propType === "object" || startValueIsArray) && startValue && !isInterpolationList) {
				_valuesStart[property] = startValueIsArray ? [] : {};
				var nestedObject = startValue;
				for (var prop in nestedObject) _valuesStart[property][prop] = nestedObject[prop];
				_valuesStartRepeat[property] = startValueIsArray ? [] : {};
				var endValues = _valuesEnd[property];
				if (!this._isDynamic) {
					var tmp = {};
					for (var prop in endValues) tmp[prop] = endValues[prop];
					_valuesEnd[property] = endValues = tmp;
				}
				this._setupProperties(nestedObject, _valuesStart[property], endValues, _valuesStartRepeat[property], overrideStartingValues);
			} else {
				if (typeof _valuesStart[property] === "undefined" || overrideStartingValues) _valuesStart[property] = startValue;
				if (!startValueIsArray) _valuesStart[property] *= 1;
				if (isInterpolationList) _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
				else _valuesStartRepeat[property] = _valuesStart[property] || 0;
			}
		}
	};
	Tween.prototype.stop = function() {
		if (!this._isChainStopped) {
			this._isChainStopped = true;
			this.stopChainedTweens();
		}
		if (!this._isPlaying) return this;
		this._isPlaying = false;
		this._isPaused = false;
		if (this._onStopCallback) this._onStopCallback(this._object);
		return this;
	};
	Tween.prototype.end = function() {
		this._goToEnd = true;
		this.update(this._startTime + this._duration);
		return this;
	};
	Tween.prototype.pause = function(time) {
		if (time === void 0) time = now();
		if (this._isPaused || !this._isPlaying) return this;
		this._isPaused = true;
		this._pauseStart = time;
		return this;
	};
	Tween.prototype.resume = function(time) {
		if (time === void 0) time = now();
		if (!this._isPaused || !this._isPlaying) return this;
		this._isPaused = false;
		this._startTime += time - this._pauseStart;
		this._pauseStart = 0;
		return this;
	};
	Tween.prototype.stopChainedTweens = function() {
		for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) this._chainedTweens[i].stop();
		return this;
	};
	Tween.prototype.group = function(group) {
		if (!group) {
			console.warn("tween.group() without args has been removed, use group.add(tween) instead.");
			return this;
		}
		group.add(this);
		return this;
	};
	/**
	* Removes the tween from whichever group it is in.
	*/
	Tween.prototype.remove = function() {
		var _a;
		(_a = this._group) === null || _a === void 0 || _a.remove(this);
		return this;
	};
	Tween.prototype.delay = function(amount) {
		if (amount === void 0) amount = 0;
		this._delayTime = amount;
		return this;
	};
	Tween.prototype.repeat = function(times) {
		if (times === void 0) times = 0;
		this._initialRepeat = times;
		this._repeat = times;
		return this;
	};
	Tween.prototype.repeatDelay = function(amount) {
		this._repeatDelayTime = amount;
		return this;
	};
	Tween.prototype.yoyo = function(yoyo) {
		if (yoyo === void 0) yoyo = false;
		this._yoyo = yoyo;
		return this;
	};
	Tween.prototype.easing = function(easingFunction) {
		if (easingFunction === void 0) easingFunction = Easing.Linear.None;
		this._easingFunction = easingFunction;
		return this;
	};
	Tween.prototype.interpolation = function(interpolationFunction) {
		if (interpolationFunction === void 0) interpolationFunction = Interpolation.Linear;
		this._interpolationFunction = interpolationFunction;
		return this;
	};
	Tween.prototype.chain = function() {
		var tweens = [];
		for (var _i = 0; _i < arguments.length; _i++) tweens[_i] = arguments[_i];
		this._chainedTweens = tweens;
		return this;
	};
	Tween.prototype.onStart = function(callback) {
		this._onStartCallback = callback;
		return this;
	};
	Tween.prototype.onEveryStart = function(callback) {
		this._onEveryStartCallback = callback;
		return this;
	};
	Tween.prototype.onUpdate = function(callback) {
		this._onUpdateCallback = callback;
		return this;
	};
	Tween.prototype.onRepeat = function(callback) {
		this._onRepeatCallback = callback;
		return this;
	};
	Tween.prototype.onComplete = function(callback) {
		this._onCompleteCallback = callback;
		return this;
	};
	Tween.prototype.onStop = function(callback) {
		this._onStopCallback = callback;
		return this;
	};
	/**
	* @returns true if the tween is still playing after the update, false
	* otherwise (calling update on a paused tween still returns true because
	* it is still playing, just paused).
	*
	* @param autoStart - When true, calling update will implicitly call start()
	* as well. Note, if you stop() or end() the tween, but are still calling
	* update(), it will start again!
	*/
	Tween.prototype.update = function(time, autoStart) {
		var _this = this;
		var _a;
		if (time === void 0) time = now();
		if (autoStart === void 0) autoStart = Tween.autoStartOnUpdate;
		if (this._isPaused) return true;
		var property;
		if (!this._goToEnd && !this._isPlaying) if (autoStart) this.start(time, true);
		else return false;
		this._goToEnd = false;
		if (time < this._startTime) return true;
		if (this._onStartCallbackFired === false) {
			if (this._onStartCallback) this._onStartCallback(this._object);
			this._onStartCallbackFired = true;
		}
		if (this._onEveryStartCallbackFired === false) {
			if (this._onEveryStartCallback) this._onEveryStartCallback(this._object);
			this._onEveryStartCallbackFired = true;
		}
		var elapsedTime = time - this._startTime;
		var durationAndDelay = this._duration + ((_a = this._repeatDelayTime) !== null && _a !== void 0 ? _a : this._delayTime);
		var totalTime = this._duration + this._repeat * durationAndDelay;
		var calculateElapsedPortion = function() {
			if (_this._duration === 0) return 1;
			if (elapsedTime > totalTime) return 1;
			var timeIntoCurrentRepeat = elapsedTime - Math.trunc(elapsedTime / durationAndDelay) * durationAndDelay;
			var portion = Math.min(timeIntoCurrentRepeat / _this._duration, 1);
			if (portion === 0 && elapsedTime === _this._duration) return 1;
			return portion;
		};
		var elapsed = calculateElapsedPortion();
		var value = this._easingFunction(elapsed);
		this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);
		if (this._onUpdateCallback) this._onUpdateCallback(this._object, elapsed);
		if (this._duration === 0 || elapsedTime >= this._duration) if (this._repeat > 0) {
			var completeCount = Math.min(Math.trunc((elapsedTime - this._duration) / durationAndDelay) + 1, this._repeat);
			if (isFinite(this._repeat)) this._repeat -= completeCount;
			for (property in this._valuesStartRepeat) {
				if (!this._yoyo && typeof this._valuesEnd[property] === "string") this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
				if (this._yoyo) this._swapEndStartRepeatValues(property);
				this._valuesStart[property] = this._valuesStartRepeat[property];
			}
			if (this._yoyo) this._reversed = !this._reversed;
			this._startTime += durationAndDelay * completeCount;
			if (this._onRepeatCallback) this._onRepeatCallback(this._object);
			this._onEveryStartCallbackFired = false;
			return true;
		} else {
			if (this._onCompleteCallback) this._onCompleteCallback(this._object);
			for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) this._chainedTweens[i].start(this._startTime + this._duration, false);
			this._isPlaying = false;
			return false;
		}
		return true;
	};
	Tween.prototype._updateProperties = function(_object, _valuesStart, _valuesEnd, value) {
		for (var property in _valuesEnd) {
			if (_valuesStart[property] === void 0) continue;
			var start = _valuesStart[property] || 0;
			var end = _valuesEnd[property];
			if (!Array.isArray(_object[property]) && Array.isArray(end)) _object[property] = this._interpolationFunction(end, value);
			else if (typeof end === "object" && end) this._updateProperties(_object[property], start, end, value);
			else {
				end = this._handleRelativeValue(start, end);
				if (typeof end === "number") _object[property] = start + (end - start) * value;
			}
		}
	};
	Tween.prototype._handleRelativeValue = function(start, end) {
		if (typeof end !== "string") return end;
		if (end.charAt(0) === "+" || end.charAt(0) === "-") return start + parseFloat(end);
		return parseFloat(end);
	};
	Tween.prototype._swapEndStartRepeatValues = function(property) {
		var tmp = this._valuesStartRepeat[property];
		var endValue = this._valuesEnd[property];
		if (typeof endValue === "string") this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue);
		else this._valuesStartRepeat[property] = this._valuesEnd[property];
		this._valuesEnd[property] = tmp;
	};
	Tween.autoStartOnUpdate = false;
	return Tween;
}();
Sequence.nextId;
/**
* Controlling groups of tweens
*
* Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
* In these cases, you may want to create your own smaller groups of tweens.
*/
var TWEEN = mainGroup;
TWEEN.getAll.bind(TWEEN);
TWEEN.removeAll.bind(TWEEN);
TWEEN.add.bind(TWEEN);
TWEEN.remove.bind(TWEEN);
TWEEN.update.bind(TWEEN);
//#endregion
//#region node_modules/.pnpm/kapsule@1.16.3/node_modules/kapsule/dist/kapsule.mjs
function _arrayLikeToArray$4(r, a) {
	(null == a || a > r.length) && (a = r.length);
	for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	return n;
}
function _arrayWithHoles$3(r) {
	if (Array.isArray(r)) return r;
}
function _classCallCheck$1(a, n) {
	if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _createClass$1(e, r, t) {
	return Object.defineProperty(e, "prototype", { writable: false }), e;
}
function _iterableToArrayLimit$3(r, l) {
	var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	if (null != t) {
		var e, n, i, u, a = [], f = true, o = false;
		try {
			if (i = (t = t.call(r)).next, 0 === l);
			else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
		} catch (r) {
			o = true, n = r;
		} finally {
			try {
				if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
			} finally {
				if (o) throw n;
			}
		}
		return a;
	}
}
function _nonIterableRest$3() {
	throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray$3(r, e) {
	return _arrayWithHoles$3(r) || _iterableToArrayLimit$3(r, e) || _unsupportedIterableToArray$4(r, e) || _nonIterableRest$3();
}
function _unsupportedIterableToArray$4(r, a) {
	if (r) {
		if ("string" == typeof r) return _arrayLikeToArray$4(r, a);
		var t = {}.toString.call(r).slice(8, -1);
		return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$4(r, a) : void 0;
	}
}
var Prop = /*#__PURE__*/ _createClass$1(function Prop(name, _ref) {
	var _ref$default = _ref["default"], defaultVal = _ref$default === void 0 ? null : _ref$default, _ref$triggerUpdate = _ref.triggerUpdate, triggerUpdate = _ref$triggerUpdate === void 0 ? true : _ref$triggerUpdate, _ref$onChange = _ref.onChange, onChange = _ref$onChange === void 0 ? function(newVal, state) {} : _ref$onChange;
	_classCallCheck$1(this, Prop);
	this.name = name;
	this.defaultVal = defaultVal;
	this.triggerUpdate = triggerUpdate;
	this.onChange = onChange;
});
function index$4(_ref2) {
	var _ref2$stateInit = _ref2.stateInit, stateInit = _ref2$stateInit === void 0 ? function() {
		return {};
	} : _ref2$stateInit, _ref2$props = _ref2.props, rawProps = _ref2$props === void 0 ? {} : _ref2$props, _ref2$methods = _ref2.methods, methods = _ref2$methods === void 0 ? {} : _ref2$methods, _ref2$aliases = _ref2.aliases, aliases = _ref2$aliases === void 0 ? {} : _ref2$aliases, _ref2$init = _ref2.init, initFn = _ref2$init === void 0 ? function() {} : _ref2$init, _ref2$update = _ref2.update, updateFn = _ref2$update === void 0 ? function() {} : _ref2$update;
	var props = Object.keys(rawProps).map(function(propName) {
		return new Prop(propName, rawProps[propName]);
	});
	return function KapsuleComp() {
		for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
		var classMode = !!(this instanceof KapsuleComp ? this.constructor : void 0);
		var nodeElement = classMode ? args.shift() : void 0;
		var _args$ = args[0], options = _args$ === void 0 ? {} : _args$;
		var state = Object.assign({}, stateInit instanceof Function ? stateInit(options) : stateInit, { initialised: false });
		var changedProps = {};
		function comp(nodeElement) {
			initStatic(nodeElement, options);
			digest();
			return comp;
		}
		var initStatic = function initStatic(nodeElement, options) {
			initFn.call(comp, nodeElement, state, options);
			state.initialised = true;
		};
		var digest = debounce(function() {
			if (!state.initialised) return;
			updateFn.call(comp, state, changedProps);
			changedProps = {};
		}, 1);
		props.forEach(function(prop) {
			comp[prop.name] = getSetProp(prop);
			function getSetProp(_ref3) {
				var prop = _ref3.name, _ref3$triggerUpdate = _ref3.triggerUpdate, redigest = _ref3$triggerUpdate === void 0 ? false : _ref3$triggerUpdate, _ref3$onChange = _ref3.onChange, onChange = _ref3$onChange === void 0 ? function(newVal, state) {} : _ref3$onChange, _ref3$defaultVal = _ref3.defaultVal, defaultVal = _ref3$defaultVal === void 0 ? null : _ref3$defaultVal;
				return function(_) {
					var curVal = state[prop];
					if (!arguments.length) return curVal;
					var val = _ === void 0 ? defaultVal : _;
					state[prop] = val;
					onChange.call(comp, val, state, curVal);
					!changedProps.hasOwnProperty(prop) && (changedProps[prop] = curVal);
					if (redigest) digest();
					return comp;
				};
			}
		});
		Object.keys(methods).forEach(function(methodName) {
			comp[methodName] = function() {
				var _methods$methodName;
				for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
				return (_methods$methodName = methods[methodName]).call.apply(_methods$methodName, [comp, state].concat(args));
			};
		});
		Object.entries(aliases).forEach(function(_ref4) {
			var _ref5 = _slicedToArray$3(_ref4, 2), alias = _ref5[0];
			return comp[alias] = comp[_ref5[1]];
		});
		comp.resetProps = function() {
			props.forEach(function(prop) {
				comp[prop.name](prop.defaultVal);
			});
			return comp;
		};
		comp.resetProps();
		state._rerender = digest;
		classMode && nodeElement && comp(nodeElement);
		return comp;
	};
}
//#endregion
//#region node_modules/.pnpm/accessor-fn@1.5.3/node_modules/accessor-fn/dist/accessor-fn.mjs
var index$3 = (function(p) {
	return typeof p === "function" ? p : typeof p === "string" ? function(obj) {
		return obj[p];
	} : function(obj) {
		return p;
	};
});
//#endregion
//#region node_modules/.pnpm/tinycolor2@1.6.0/node_modules/tinycolor2/esm/tinycolor.js
function _typeof$2(obj) {
	"@babel/helpers - typeof";
	return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
		return typeof obj;
	} : function(obj) {
		return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	}, _typeof$2(obj);
}
var trimLeft = /^\s+/;
var trimRight = /\s+$/;
function tinycolor(color, opts) {
	color = color ? color : "";
	opts = opts || {};
	if (color instanceof tinycolor) return color;
	if (!(this instanceof tinycolor)) return new tinycolor(color, opts);
	var rgb = inputToRGB(color);
	this._originalInput = color, this._r = rgb.r, this._g = rgb.g, this._b = rgb.b, this._a = rgb.a, this._roundA = Math.round(100 * this._a) / 100, this._format = opts.format || rgb.format;
	this._gradientType = opts.gradientType;
	if (this._r < 1) this._r = Math.round(this._r);
	if (this._g < 1) this._g = Math.round(this._g);
	if (this._b < 1) this._b = Math.round(this._b);
	this._ok = rgb.ok;
}
tinycolor.prototype = {
	isDark: function isDark() {
		return this.getBrightness() < 128;
	},
	isLight: function isLight() {
		return !this.isDark();
	},
	isValid: function isValid() {
		return this._ok;
	},
	getOriginalInput: function getOriginalInput() {
		return this._originalInput;
	},
	getFormat: function getFormat() {
		return this._format;
	},
	getAlpha: function getAlpha() {
		return this._a;
	},
	getBrightness: function getBrightness() {
		var rgb = this.toRgb();
		return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1e3;
	},
	getLuminance: function getLuminance() {
		var rgb = this.toRgb();
		var RsRGB = rgb.r / 255, GsRGB = rgb.g / 255, BsRGB = rgb.b / 255, R, G, B;
		if (RsRGB <= .03928) R = RsRGB / 12.92;
		else R = Math.pow((RsRGB + .055) / 1.055, 2.4);
		if (GsRGB <= .03928) G = GsRGB / 12.92;
		else G = Math.pow((GsRGB + .055) / 1.055, 2.4);
		if (BsRGB <= .03928) B = BsRGB / 12.92;
		else B = Math.pow((BsRGB + .055) / 1.055, 2.4);
		return .2126 * R + .7152 * G + .0722 * B;
	},
	setAlpha: function setAlpha(value) {
		this._a = boundAlpha(value);
		this._roundA = Math.round(100 * this._a) / 100;
		return this;
	},
	toHsv: function toHsv() {
		var hsv = rgbToHsv(this._r, this._g, this._b);
		return {
			h: hsv.h * 360,
			s: hsv.s,
			v: hsv.v,
			a: this._a
		};
	},
	toHsvString: function toHsvString() {
		var hsv = rgbToHsv(this._r, this._g, this._b);
		var h = Math.round(hsv.h * 360), s = Math.round(hsv.s * 100), v = Math.round(hsv.v * 100);
		return this._a == 1 ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
	},
	toHsl: function toHsl() {
		var hsl = rgbToHsl(this._r, this._g, this._b);
		return {
			h: hsl.h * 360,
			s: hsl.s,
			l: hsl.l,
			a: this._a
		};
	},
	toHslString: function toHslString() {
		var hsl = rgbToHsl(this._r, this._g, this._b);
		var h = Math.round(hsl.h * 360), s = Math.round(hsl.s * 100), l = Math.round(hsl.l * 100);
		return this._a == 1 ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
	},
	toHex: function toHex(allow3Char) {
		return rgbToHex(this._r, this._g, this._b, allow3Char);
	},
	toHexString: function toHexString(allow3Char) {
		return "#" + this.toHex(allow3Char);
	},
	toHex8: function toHex8(allow4Char) {
		return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
	},
	toHex8String: function toHex8String(allow4Char) {
		return "#" + this.toHex8(allow4Char);
	},
	toRgb: function toRgb() {
		return {
			r: Math.round(this._r),
			g: Math.round(this._g),
			b: Math.round(this._b),
			a: this._a
		};
	},
	toRgbString: function toRgbString() {
		return this._a == 1 ? "rgb(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ")" : "rgba(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ", " + this._roundA + ")";
	},
	toPercentageRgb: function toPercentageRgb() {
		return {
			r: Math.round(bound01(this._r, 255) * 100) + "%",
			g: Math.round(bound01(this._g, 255) * 100) + "%",
			b: Math.round(bound01(this._b, 255) * 100) + "%",
			a: this._a
		};
	},
	toPercentageRgbString: function toPercentageRgbString() {
		return this._a == 1 ? "rgb(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%)" : "rgba(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
	},
	toName: function toName() {
		if (this._a === 0) return "transparent";
		if (this._a < 1) return false;
		return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
	},
	toFilter: function toFilter(secondColor) {
		var hex8String = "#" + rgbaToArgbHex(this._r, this._g, this._b, this._a);
		var secondHex8String = hex8String;
		var gradientType = this._gradientType ? "GradientType = 1, " : "";
		if (secondColor) {
			var s = tinycolor(secondColor);
			secondHex8String = "#" + rgbaToArgbHex(s._r, s._g, s._b, s._a);
		}
		return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=" + hex8String + ",endColorstr=" + secondHex8String + ")";
	},
	toString: function toString(format) {
		var formatSet = !!format;
		format = format || this._format;
		var formattedString = false;
		var hasAlpha = this._a < 1 && this._a >= 0;
		if (!formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name")) {
			if (format === "name" && this._a === 0) return this.toName();
			return this.toRgbString();
		}
		if (format === "rgb") formattedString = this.toRgbString();
		if (format === "prgb") formattedString = this.toPercentageRgbString();
		if (format === "hex" || format === "hex6") formattedString = this.toHexString();
		if (format === "hex3") formattedString = this.toHexString(true);
		if (format === "hex4") formattedString = this.toHex8String(true);
		if (format === "hex8") formattedString = this.toHex8String();
		if (format === "name") formattedString = this.toName();
		if (format === "hsl") formattedString = this.toHslString();
		if (format === "hsv") formattedString = this.toHsvString();
		return formattedString || this.toHexString();
	},
	clone: function clone() {
		return tinycolor(this.toString());
	},
	_applyModification: function _applyModification(fn, args) {
		var color = fn.apply(null, [this].concat([].slice.call(args)));
		this._r = color._r;
		this._g = color._g;
		this._b = color._b;
		this.setAlpha(color._a);
		return this;
	},
	lighten: function lighten() {
		return this._applyModification(_lighten, arguments);
	},
	brighten: function brighten() {
		return this._applyModification(_brighten, arguments);
	},
	darken: function darken() {
		return this._applyModification(_darken, arguments);
	},
	desaturate: function desaturate() {
		return this._applyModification(_desaturate, arguments);
	},
	saturate: function saturate() {
		return this._applyModification(_saturate, arguments);
	},
	greyscale: function greyscale() {
		return this._applyModification(_greyscale, arguments);
	},
	spin: function spin() {
		return this._applyModification(_spin, arguments);
	},
	_applyCombination: function _applyCombination(fn, args) {
		return fn.apply(null, [this].concat([].slice.call(args)));
	},
	analogous: function analogous() {
		return this._applyCombination(_analogous, arguments);
	},
	complement: function complement() {
		return this._applyCombination(_complement, arguments);
	},
	monochromatic: function monochromatic() {
		return this._applyCombination(_monochromatic, arguments);
	},
	splitcomplement: function splitcomplement() {
		return this._applyCombination(_splitcomplement, arguments);
	},
	triad: function triad() {
		return this._applyCombination(polyad, [3]);
	},
	tetrad: function tetrad() {
		return this._applyCombination(polyad, [4]);
	}
};
tinycolor.fromRatio = function(color, opts) {
	if (_typeof$2(color) == "object") {
		var newColor = {};
		for (var i in color) if (color.hasOwnProperty(i)) if (i === "a") newColor[i] = color[i];
		else newColor[i] = convertToPercentage(color[i]);
		color = newColor;
	}
	return tinycolor(color, opts);
};
function inputToRGB(color) {
	var rgb = {
		r: 0,
		g: 0,
		b: 0
	};
	var a = 1;
	var s = null;
	var v = null;
	var l = null;
	var ok = false;
	var format = false;
	if (typeof color == "string") color = stringInputToObject(color);
	if (_typeof$2(color) == "object") {
		if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
			rgb = rgbToRgb(color.r, color.g, color.b);
			ok = true;
			format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
		} else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
			s = convertToPercentage(color.s);
			v = convertToPercentage(color.v);
			rgb = hsvToRgb(color.h, s, v);
			ok = true;
			format = "hsv";
		} else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
			s = convertToPercentage(color.s);
			l = convertToPercentage(color.l);
			rgb = hslToRgb(color.h, s, l);
			ok = true;
			format = "hsl";
		}
		if (color.hasOwnProperty("a")) a = color.a;
	}
	a = boundAlpha(a);
	return {
		ok,
		format: color.format || format,
		r: Math.min(255, Math.max(rgb.r, 0)),
		g: Math.min(255, Math.max(rgb.g, 0)),
		b: Math.min(255, Math.max(rgb.b, 0)),
		a
	};
}
function rgbToRgb(r, g, b) {
	return {
		r: bound01(r, 255) * 255,
		g: bound01(g, 255) * 255,
		b: bound01(b, 255) * 255
	};
}
function rgbToHsl(r, g, b) {
	r = bound01(r, 255);
	g = bound01(g, 255);
	b = bound01(b, 255);
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;
	if (max == min) h = s = 0;
	else {
		var d = max - min;
		s = l > .5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return {
		h,
		s,
		l
	};
}
function hslToRgb(h, s, l) {
	var r, g, b;
	h = bound01(h, 360);
	s = bound01(s, 100);
	l = bound01(l, 100);
	function hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}
	if (s === 0) r = g = b = l;
	else {
		var q = l < .5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	return {
		r: r * 255,
		g: g * 255,
		b: b * 255
	};
}
function rgbToHsv(r, g, b) {
	r = bound01(r, 255);
	g = bound01(g, 255);
	b = bound01(b, 255);
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, v = max;
	var d = max - min;
	s = max === 0 ? 0 : d / max;
	if (max == min) h = 0;
	else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return {
		h,
		s,
		v
	};
}
function hsvToRgb(h, s, v) {
	h = bound01(h, 360) * 6;
	s = bound01(s, 100);
	v = bound01(v, 100);
	var i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), mod = i % 6, r = [
		v,
		q,
		p,
		p,
		t,
		v
	][mod], g = [
		t,
		v,
		v,
		q,
		p,
		p
	][mod], b = [
		p,
		p,
		t,
		v,
		v,
		q
	][mod];
	return {
		r: r * 255,
		g: g * 255,
		b: b * 255
	};
}
function rgbToHex(r, g, b, allow3Char) {
	var hex = [
		pad2(Math.round(r).toString(16)),
		pad2(Math.round(g).toString(16)),
		pad2(Math.round(b).toString(16))
	];
	if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
	return hex.join("");
}
function rgbaToHex(r, g, b, a, allow4Char) {
	var hex = [
		pad2(Math.round(r).toString(16)),
		pad2(Math.round(g).toString(16)),
		pad2(Math.round(b).toString(16)),
		pad2(convertDecimalToHex(a))
	];
	if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
	return hex.join("");
}
function rgbaToArgbHex(r, g, b, a) {
	return [
		pad2(convertDecimalToHex(a)),
		pad2(Math.round(r).toString(16)),
		pad2(Math.round(g).toString(16)),
		pad2(Math.round(b).toString(16))
	].join("");
}
tinycolor.equals = function(color1, color2) {
	if (!color1 || !color2) return false;
	return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
};
tinycolor.random = function() {
	return tinycolor.fromRatio({
		r: Math.random(),
		g: Math.random(),
		b: Math.random()
	});
};
function _desaturate(color, amount) {
	amount = amount === 0 ? 0 : amount || 10;
	var hsl = tinycolor(color).toHsl();
	hsl.s -= amount / 100;
	hsl.s = clamp01(hsl.s);
	return tinycolor(hsl);
}
function _saturate(color, amount) {
	amount = amount === 0 ? 0 : amount || 10;
	var hsl = tinycolor(color).toHsl();
	hsl.s += amount / 100;
	hsl.s = clamp01(hsl.s);
	return tinycolor(hsl);
}
function _greyscale(color) {
	return tinycolor(color).desaturate(100);
}
function _lighten(color, amount) {
	amount = amount === 0 ? 0 : amount || 10;
	var hsl = tinycolor(color).toHsl();
	hsl.l += amount / 100;
	hsl.l = clamp01(hsl.l);
	return tinycolor(hsl);
}
function _brighten(color, amount) {
	amount = amount === 0 ? 0 : amount || 10;
	var rgb = tinycolor(color).toRgb();
	rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))));
	rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))));
	rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))));
	return tinycolor(rgb);
}
function _darken(color, amount) {
	amount = amount === 0 ? 0 : amount || 10;
	var hsl = tinycolor(color).toHsl();
	hsl.l -= amount / 100;
	hsl.l = clamp01(hsl.l);
	return tinycolor(hsl);
}
function _spin(color, amount) {
	var hsl = tinycolor(color).toHsl();
	var hue = (hsl.h + amount) % 360;
	hsl.h = hue < 0 ? 360 + hue : hue;
	return tinycolor(hsl);
}
function _complement(color) {
	var hsl = tinycolor(color).toHsl();
	hsl.h = (hsl.h + 180) % 360;
	return tinycolor(hsl);
}
function polyad(color, number) {
	if (isNaN(number) || number <= 0) throw new Error("Argument to polyad must be a positive number");
	var hsl = tinycolor(color).toHsl();
	var result = [tinycolor(color)];
	var step = 360 / number;
	for (var i = 1; i < number; i++) result.push(tinycolor({
		h: (hsl.h + i * step) % 360,
		s: hsl.s,
		l: hsl.l
	}));
	return result;
}
function _splitcomplement(color) {
	var hsl = tinycolor(color).toHsl();
	var h = hsl.h;
	return [
		tinycolor(color),
		tinycolor({
			h: (h + 72) % 360,
			s: hsl.s,
			l: hsl.l
		}),
		tinycolor({
			h: (h + 216) % 360,
			s: hsl.s,
			l: hsl.l
		})
	];
}
function _analogous(color, results, slices) {
	results = results || 6;
	slices = slices || 30;
	var hsl = tinycolor(color).toHsl();
	var part = 360 / slices;
	var ret = [tinycolor(color)];
	for (hsl.h = (hsl.h - (part * results >> 1) + 720) % 360; --results;) {
		hsl.h = (hsl.h + part) % 360;
		ret.push(tinycolor(hsl));
	}
	return ret;
}
function _monochromatic(color, results) {
	results = results || 6;
	var hsv = tinycolor(color).toHsv();
	var h = hsv.h, s = hsv.s, v = hsv.v;
	var ret = [];
	var modification = 1 / results;
	while (results--) {
		ret.push(tinycolor({
			h,
			s,
			v
		}));
		v = (v + modification) % 1;
	}
	return ret;
}
tinycolor.mix = function(color1, color2, amount) {
	amount = amount === 0 ? 0 : amount || 50;
	var rgb1 = tinycolor(color1).toRgb();
	var rgb2 = tinycolor(color2).toRgb();
	var p = amount / 100;
	return tinycolor({
		r: (rgb2.r - rgb1.r) * p + rgb1.r,
		g: (rgb2.g - rgb1.g) * p + rgb1.g,
		b: (rgb2.b - rgb1.b) * p + rgb1.b,
		a: (rgb2.a - rgb1.a) * p + rgb1.a
	});
};
tinycolor.readability = function(color1, color2) {
	var c1 = tinycolor(color1);
	var c2 = tinycolor(color2);
	return (Math.max(c1.getLuminance(), c2.getLuminance()) + .05) / (Math.min(c1.getLuminance(), c2.getLuminance()) + .05);
};
tinycolor.isReadable = function(color1, color2, wcag2) {
	var readability = tinycolor.readability(color1, color2);
	var wcag2Parms, out = false;
	wcag2Parms = validateWCAG2Parms(wcag2);
	switch (wcag2Parms.level + wcag2Parms.size) {
		case "AAsmall":
		case "AAAlarge":
			out = readability >= 4.5;
			break;
		case "AAlarge":
			out = readability >= 3;
			break;
		case "AAAsmall":
			out = readability >= 7;
			break;
	}
	return out;
};
tinycolor.mostReadable = function(baseColor, colorList, args) {
	var bestColor = null;
	var bestScore = 0;
	var readability;
	var includeFallbackColors, level, size;
	args = args || {};
	includeFallbackColors = args.includeFallbackColors;
	level = args.level;
	size = args.size;
	for (var i = 0; i < colorList.length; i++) {
		readability = tinycolor.readability(baseColor, colorList[i]);
		if (readability > bestScore) {
			bestScore = readability;
			bestColor = tinycolor(colorList[i]);
		}
	}
	if (tinycolor.isReadable(baseColor, bestColor, {
		level,
		size
	}) || !includeFallbackColors) return bestColor;
	else {
		args.includeFallbackColors = false;
		return tinycolor.mostReadable(baseColor, ["#fff", "#000"], args);
	}
};
var names = tinycolor.names = {
	aliceblue: "f0f8ff",
	antiquewhite: "faebd7",
	aqua: "0ff",
	aquamarine: "7fffd4",
	azure: "f0ffff",
	beige: "f5f5dc",
	bisque: "ffe4c4",
	black: "000",
	blanchedalmond: "ffebcd",
	blue: "00f",
	blueviolet: "8a2be2",
	brown: "a52a2a",
	burlywood: "deb887",
	burntsienna: "ea7e5d",
	cadetblue: "5f9ea0",
	chartreuse: "7fff00",
	chocolate: "d2691e",
	coral: "ff7f50",
	cornflowerblue: "6495ed",
	cornsilk: "fff8dc",
	crimson: "dc143c",
	cyan: "0ff",
	darkblue: "00008b",
	darkcyan: "008b8b",
	darkgoldenrod: "b8860b",
	darkgray: "a9a9a9",
	darkgreen: "006400",
	darkgrey: "a9a9a9",
	darkkhaki: "bdb76b",
	darkmagenta: "8b008b",
	darkolivegreen: "556b2f",
	darkorange: "ff8c00",
	darkorchid: "9932cc",
	darkred: "8b0000",
	darksalmon: "e9967a",
	darkseagreen: "8fbc8f",
	darkslateblue: "483d8b",
	darkslategray: "2f4f4f",
	darkslategrey: "2f4f4f",
	darkturquoise: "00ced1",
	darkviolet: "9400d3",
	deeppink: "ff1493",
	deepskyblue: "00bfff",
	dimgray: "696969",
	dimgrey: "696969",
	dodgerblue: "1e90ff",
	firebrick: "b22222",
	floralwhite: "fffaf0",
	forestgreen: "228b22",
	fuchsia: "f0f",
	gainsboro: "dcdcdc",
	ghostwhite: "f8f8ff",
	gold: "ffd700",
	goldenrod: "daa520",
	gray: "808080",
	green: "008000",
	greenyellow: "adff2f",
	grey: "808080",
	honeydew: "f0fff0",
	hotpink: "ff69b4",
	indianred: "cd5c5c",
	indigo: "4b0082",
	ivory: "fffff0",
	khaki: "f0e68c",
	lavender: "e6e6fa",
	lavenderblush: "fff0f5",
	lawngreen: "7cfc00",
	lemonchiffon: "fffacd",
	lightblue: "add8e6",
	lightcoral: "f08080",
	lightcyan: "e0ffff",
	lightgoldenrodyellow: "fafad2",
	lightgray: "d3d3d3",
	lightgreen: "90ee90",
	lightgrey: "d3d3d3",
	lightpink: "ffb6c1",
	lightsalmon: "ffa07a",
	lightseagreen: "20b2aa",
	lightskyblue: "87cefa",
	lightslategray: "789",
	lightslategrey: "789",
	lightsteelblue: "b0c4de",
	lightyellow: "ffffe0",
	lime: "0f0",
	limegreen: "32cd32",
	linen: "faf0e6",
	magenta: "f0f",
	maroon: "800000",
	mediumaquamarine: "66cdaa",
	mediumblue: "0000cd",
	mediumorchid: "ba55d3",
	mediumpurple: "9370db",
	mediumseagreen: "3cb371",
	mediumslateblue: "7b68ee",
	mediumspringgreen: "00fa9a",
	mediumturquoise: "48d1cc",
	mediumvioletred: "c71585",
	midnightblue: "191970",
	mintcream: "f5fffa",
	mistyrose: "ffe4e1",
	moccasin: "ffe4b5",
	navajowhite: "ffdead",
	navy: "000080",
	oldlace: "fdf5e6",
	olive: "808000",
	olivedrab: "6b8e23",
	orange: "ffa500",
	orangered: "ff4500",
	orchid: "da70d6",
	palegoldenrod: "eee8aa",
	palegreen: "98fb98",
	paleturquoise: "afeeee",
	palevioletred: "db7093",
	papayawhip: "ffefd5",
	peachpuff: "ffdab9",
	peru: "cd853f",
	pink: "ffc0cb",
	plum: "dda0dd",
	powderblue: "b0e0e6",
	purple: "800080",
	rebeccapurple: "663399",
	red: "f00",
	rosybrown: "bc8f8f",
	royalblue: "4169e1",
	saddlebrown: "8b4513",
	salmon: "fa8072",
	sandybrown: "f4a460",
	seagreen: "2e8b57",
	seashell: "fff5ee",
	sienna: "a0522d",
	silver: "c0c0c0",
	skyblue: "87ceeb",
	slateblue: "6a5acd",
	slategray: "708090",
	slategrey: "708090",
	snow: "fffafa",
	springgreen: "00ff7f",
	steelblue: "4682b4",
	tan: "d2b48c",
	teal: "008080",
	thistle: "d8bfd8",
	tomato: "ff6347",
	turquoise: "40e0d0",
	violet: "ee82ee",
	wheat: "f5deb3",
	white: "fff",
	whitesmoke: "f5f5f5",
	yellow: "ff0",
	yellowgreen: "9acd32"
};
var hexNames = tinycolor.hexNames = flip(names);
function flip(o) {
	var flipped = {};
	for (var i in o) if (o.hasOwnProperty(i)) flipped[o[i]] = i;
	return flipped;
}
function boundAlpha(a) {
	a = parseFloat(a);
	if (isNaN(a) || a < 0 || a > 1) a = 1;
	return a;
}
function bound01(n, max) {
	if (isOnePointZero(n)) n = "100%";
	var processPercent = isPercentage(n);
	n = Math.min(max, Math.max(0, parseFloat(n)));
	if (processPercent) n = parseInt(n * max, 10) / 100;
	if (Math.abs(n - max) < 1e-6) return 1;
	return n % max / parseFloat(max);
}
function clamp01(val) {
	return Math.min(1, Math.max(0, val));
}
function parseIntFromHex(val) {
	return parseInt(val, 16);
}
function isOnePointZero(n) {
	return typeof n == "string" && n.indexOf(".") != -1 && parseFloat(n) === 1;
}
function isPercentage(n) {
	return typeof n === "string" && n.indexOf("%") != -1;
}
function pad2(c) {
	return c.length == 1 ? "0" + c : "" + c;
}
function convertToPercentage(n) {
	if (n <= 1) n = n * 100 + "%";
	return n;
}
function convertDecimalToHex(d) {
	return Math.round(parseFloat(d) * 255).toString(16);
}
function convertHexToDecimal(h) {
	return parseIntFromHex(h) / 255;
}
var matchers = function() {
	var CSS_UNIT = "(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)";
	var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
	var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
	return {
		CSS_UNIT: new RegExp(CSS_UNIT),
		rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
		rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
		hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
		hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
		hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
		hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
		hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
		hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
		hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
		hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
	};
}();
function isValidCSSUnit(color) {
	return !!matchers.CSS_UNIT.exec(color);
}
function stringInputToObject(color) {
	color = color.replace(trimLeft, "").replace(trimRight, "").toLowerCase();
	var named = false;
	if (names[color]) {
		color = names[color];
		named = true;
	} else if (color == "transparent") return {
		r: 0,
		g: 0,
		b: 0,
		a: 0,
		format: "name"
	};
	var match;
	if (match = matchers.rgb.exec(color)) return {
		r: match[1],
		g: match[2],
		b: match[3]
	};
	if (match = matchers.rgba.exec(color)) return {
		r: match[1],
		g: match[2],
		b: match[3],
		a: match[4]
	};
	if (match = matchers.hsl.exec(color)) return {
		h: match[1],
		s: match[2],
		l: match[3]
	};
	if (match = matchers.hsla.exec(color)) return {
		h: match[1],
		s: match[2],
		l: match[3],
		a: match[4]
	};
	if (match = matchers.hsv.exec(color)) return {
		h: match[1],
		s: match[2],
		v: match[3]
	};
	if (match = matchers.hsva.exec(color)) return {
		h: match[1],
		s: match[2],
		v: match[3],
		a: match[4]
	};
	if (match = matchers.hex8.exec(color)) return {
		r: parseIntFromHex(match[1]),
		g: parseIntFromHex(match[2]),
		b: parseIntFromHex(match[3]),
		a: convertHexToDecimal(match[4]),
		format: named ? "name" : "hex8"
	};
	if (match = matchers.hex6.exec(color)) return {
		r: parseIntFromHex(match[1]),
		g: parseIntFromHex(match[2]),
		b: parseIntFromHex(match[3]),
		format: named ? "name" : "hex"
	};
	if (match = matchers.hex4.exec(color)) return {
		r: parseIntFromHex(match[1] + "" + match[1]),
		g: parseIntFromHex(match[2] + "" + match[2]),
		b: parseIntFromHex(match[3] + "" + match[3]),
		a: convertHexToDecimal(match[4] + "" + match[4]),
		format: named ? "name" : "hex8"
	};
	if (match = matchers.hex3.exec(color)) return {
		r: parseIntFromHex(match[1] + "" + match[1]),
		g: parseIntFromHex(match[2] + "" + match[2]),
		b: parseIntFromHex(match[3] + "" + match[3]),
		format: named ? "name" : "hex"
	};
	return false;
}
function validateWCAG2Parms(parms) {
	var level, size;
	parms = parms || {
		level: "AA",
		size: "small"
	};
	level = (parms.level || "AA").toUpperCase();
	size = (parms.size || "small").toLowerCase();
	if (level !== "AA" && level !== "AAA") level = "AA";
	if (size !== "small" && size !== "large") size = "small";
	return {
		level,
		size
	};
}
//#endregion
//#region node_modules/.pnpm/canvas-color-tracker@1.3.2/node_modules/canvas-color-tracker/dist/canvas-color-tracker.mjs
function _arrayLikeToArray$3(r, a) {
	(null == a || a > r.length) && (a = r.length);
	for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	return n;
}
function _arrayWithoutHoles$2(r) {
	if (Array.isArray(r)) return _arrayLikeToArray$3(r);
}
function _assertClassBrand(e, t, n) {
	if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
	throw new TypeError("Private element is not present on this object");
}
function _checkPrivateRedeclaration(e, t) {
	if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
}
function _classCallCheck(a, n) {
	if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _classPrivateFieldGet2(s, a) {
	return s.get(_assertClassBrand(s, a));
}
function _classPrivateFieldInitSpec(e, t, a) {
	_checkPrivateRedeclaration(e, t), t.set(e, a);
}
function _classPrivateFieldSet2(s, a, r) {
	return s.set(_assertClassBrand(s, a), r), r;
}
function _defineProperties(e, r) {
	for (var t = 0; t < r.length; t++) {
		var o = r[t];
		o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$3(o.key), o);
	}
}
function _createClass(e, r, t) {
	return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", { writable: false }), e;
}
function _iterableToArray$2(r) {
	if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _nonIterableSpread$2() {
	throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toConsumableArray$2(r) {
	return _arrayWithoutHoles$2(r) || _iterableToArray$2(r) || _unsupportedIterableToArray$3(r) || _nonIterableSpread$2();
}
function _toPrimitive$3(t, r) {
	if ("object" != typeof t || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r);
		if ("object" != typeof i) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return String(t);
}
function _toPropertyKey$3(t) {
	var i = _toPrimitive$3(t, "string");
	return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray$3(r, a) {
	if (r) {
		if ("string" == typeof r) return _arrayLikeToArray$3(r, a);
		var t = {}.toString.call(r).slice(8, -1);
		return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$3(r, a) : void 0;
	}
}
var ENTROPY = 123;
var int2HexColor = function int2HexColor(num) {
	return "#".concat(Math.min(num, Math.pow(2, 24)).toString(16).padStart(6, "0"));
};
var rgb2Int = function rgb2Int(r, g, b) {
	return (r << 16) + (g << 8) + b;
};
var colorStr2Int = function colorStr2Int(str) {
	var _tinyColor$toRgb = tinycolor(str).toRgb(), r = _tinyColor$toRgb.r, g = _tinyColor$toRgb.g, b = _tinyColor$toRgb.b;
	return rgb2Int(r, g, b);
};
var checksum = function checksum(n, csBits) {
	return n * ENTROPY % Math.pow(2, csBits);
};
var _registry = /*#__PURE__*/ new WeakMap();
var _csBits = /*#__PURE__*/ new WeakMap();
var _default = /*#__PURE__*/ function() {
	function _default() {
		var csBits = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 6;
		_classCallCheck(this, _default);
		_classPrivateFieldInitSpec(this, _registry, void 0);
		_classPrivateFieldInitSpec(this, _csBits, void 0);
		_classPrivateFieldSet2(_csBits, this, csBits);
		this.reset();
	}
	return _createClass(_default, [
		{
			key: "reset",
			value: function reset() {
				_classPrivateFieldSet2(_registry, this, ["__reserved for background__"]);
			}
		},
		{
			key: "register",
			value: function register(obj) {
				if (_classPrivateFieldGet2(_registry, this).length >= Math.pow(2, 24 - _classPrivateFieldGet2(_csBits, this))) return null;
				var idx = _classPrivateFieldGet2(_registry, this).length;
				var color = int2HexColor(idx + (checksum(idx, _classPrivateFieldGet2(_csBits, this)) << 24 - _classPrivateFieldGet2(_csBits, this)));
				_classPrivateFieldGet2(_registry, this).push(obj);
				return color;
			}
		},
		{
			key: "lookup",
			value: function lookup(color) {
				if (!color) return null;
				var n = typeof color === "string" ? colorStr2Int(color) : rgb2Int.apply(void 0, _toConsumableArray$2(color));
				if (!n) return null;
				var idx = n & Math.pow(2, 24 - _classPrivateFieldGet2(_csBits, this)) - 1;
				var cs = n >> 24 - _classPrivateFieldGet2(_csBits, this) & Math.pow(2, _classPrivateFieldGet2(_csBits, this)) - 1;
				if (checksum(idx, _classPrivateFieldGet2(_csBits, this)) !== cs || idx >= _classPrivateFieldGet2(_registry, this).length) return null;
				return _classPrivateFieldGet2(_registry, this)[idx];
			}
		}
	]);
}(), n, l, u, t$1, i, r, o, e, f, c$1, a$1, s, h, p, v, d = {}, w = [], _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, g = Array.isArray;
function m$1(n, l) {
	for (var u in l) n[u] = l[u];
	return n;
}
function b(n) {
	n && n.parentNode && n.parentNode.removeChild(n);
}
function k(l, u, t) {
	var i, r, o, e = {};
	for (o in u) "key" == o ? i = u[o] : "ref" == o ? r = u[o] : e[o] = u[o];
	if (arguments.length > 2 && (e.children = arguments.length > 3 ? n.call(arguments, 2) : t), "function" == typeof l && null != l.defaultProps) for (o in l.defaultProps) void 0 === e[o] && (e[o] = l.defaultProps[o]);
	return x$1(l, e, i, r, null);
}
function x$1(n, t, i, r, o) {
	var e = {
		type: n,
		props: t,
		key: i,
		ref: r,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: void 0,
		__v: null == o ? ++u : o,
		__i: -1,
		__u: 0
	};
	return null == o && null != l.vnode && l.vnode(e), e;
}
function S(n) {
	return n.children;
}
function C(n, l) {
	this.props = n, this.context = l;
}
function $(n, l) {
	if (null == l) return n.__ ? $(n.__, n.__i + 1) : null;
	for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
	return "function" == typeof n.type ? $(n) : null;
}
function I(n) {
	if (n.__P && n.__d) {
		var u = n.__v, t = u.__e, i = [], r = [], o = m$1({}, u);
		o.__v = u.__v + 1, l.vnode && l.vnode(o), q(n.__P, o, u, n.__n, n.__P.namespaceURI, 32 & u.__u ? [t] : null, i, null == t ? $(u) : t, !!(32 & u.__u), r), o.__v = u.__v, o.__.__k[o.__i] = o, D(i, o, r), u.__e = u.__ = null, o.__e != t && P(o);
	}
}
function P(n) {
	if (null != (n = n.__) && null != n.__c) return n.__e = n.__c.base = null, n.__k.some(function(l) {
		if (null != l && null != l.__e) return n.__e = n.__c.base = l.__e;
	}), P(n);
}
function A(n) {
	(!n.__d && (n.__d = !0) && i.push(n) && !H.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(H);
}
function H() {
	try {
		for (var n, l = 1; i.length;) i.length > l && i.sort(e), n = i.shift(), l = i.length, I(n);
	} finally {
		i.length = H.__r = 0;
	}
}
function L(n, l, u, t, i, r, o, e, f, c, a) {
	var s, h, p, v, y, _, g = t && t.__k || w, m = l.length;
	for (f = T(u, l, g, f, m), s = 0; s < m; s++) null != (p = u.__k[s]) && (h = -1 != p.__i && g[p.__i] || d, p.__i = s, _ = q(n, p, h, i, r, o, e, f, c, a), v = p.__e, p.ref && h.ref != p.ref && (h.ref && J(h.ref, null, p), a.push(p.ref, p.__c || v, p)), null == y && null != v && (y = v), 4 & p.__u ? (f = j(p, f, n), h.__e && (h.__e = null)) : "function" == typeof p.type && void 0 !== _ ? f = _ : v && (f = v.nextSibling), p.__u &= -7);
	return u.__e = y, f;
}
function T(n, l, u, t, i) {
	var r, o, e, f, c, a = u.length, s = a, h = 0;
	for (n.__k = new Array(i), r = 0; r < i; r++) null != (o = l[r]) && "boolean" != typeof o && "function" != typeof o ? ("string" == typeof o || "number" == typeof o || "bigint" == typeof o || o.constructor == String ? o = n.__k[r] = x$1(null, o, null, null, null) : g(o) ? o = n.__k[r] = x$1(S, { children: o }, null, null, null) : void 0 === o.constructor && o.__b > 0 ? o = n.__k[r] = x$1(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : n.__k[r] = o, f = r + h, o.__ = n, o.__b = n.__b + 1, e = null, -1 != (c = o.__i = O(o, u, f, s)) && (s--, (e = u[c]) && (e.__u |= 2)), null == e || null == e.__v ? (-1 == c && (i > a ? h-- : i < a && h++), "function" != typeof o.type && (o.__u |= 4)) : c != f && (c == f - 1 ? h-- : c == f + 1 ? h++ : (c > f ? h-- : h++, o.__u |= 4))) : n.__k[r] = null;
	if (s) for (r = 0; r < a; r++) null != (e = u[r]) && 0 == (2 & e.__u) && (e.__e == t && (t = $(e)), K(e, e));
	return t;
}
function j(n, l, u) {
	var t, i;
	if ("function" == typeof n.type) {
		for (t = n.__k, i = 0; t && i < t.length; i++) t[i] && (t[i].__ = n, l = j(t[i], l, u));
		return l;
	}
	n.__e != l && (l && n.type && !l.parentNode && (l = $(n)), l = u.insertBefore(n.__e, l || null));
	do
		l = l && l.nextSibling;
	while (null != l && 8 == l.nodeType);
	return l;
}
function O(n, l, u, t) {
	var i, r, o, e = n.key, f = n.type, c = l[u], a = null != c && 0 == (2 & c.__u);
	if (null === c && null == e || a && e == c.key && f == c.type) return u;
	if (t > (a ? 1 : 0)) {
		for (i = u - 1, r = u + 1; i >= 0 || r < l.length;) if (null != (c = l[o = i >= 0 ? i-- : r++]) && 0 == (2 & c.__u) && e == c.key && f == c.type) return o;
	}
	return -1;
}
function z$1(n, l, u) {
	"-" == l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || _.test(l) ? u : u + "px";
}
function N(n, l, u, t, i) {
	var r, o;
	n: if ("style" == l) if ("string" == typeof u) n.style.cssText = u;
	else {
		if ("string" == typeof t && (n.style.cssText = t = ""), t) for (l in t) u && l in u || z$1(n.style, l, "");
		if (u) for (l in u) t && u[l] == t[l] || z$1(n.style, l, u[l]);
	}
	else if ("o" == l[0] && "n" == l[1]) r = l != (l = l.replace(s, "$1")), o = l.toLowerCase(), l = o in n || "onFocusOut" == l || "onFocusIn" == l ? o.slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + r] = u, u ? t ? u[a$1] = t[a$1] : (u[a$1] = h, n.addEventListener(l, r ? v : p, r)) : n.removeEventListener(l, r ? v : p, r);
	else {
		if ("http://www.w3.org/2000/svg" == i) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if ("width" != l && "height" != l && "href" != l && "list" != l && "form" != l && "tabIndex" != l && "download" != l && "rowSpan" != l && "colSpan" != l && "role" != l && "popover" != l && l in n) try {
			n[l] = null == u ? "" : u;
			break n;
		} catch (n) {}
		"function" == typeof u || (null == u || !1 === u && "-" != l[4] ? n.removeAttribute(l) : n.setAttribute(l, "popover" == l && 1 == u ? "" : u));
	}
}
function V(n) {
	return function(u) {
		if (this.l) {
			var t = this.l[u.type + n];
			if (null == u[c$1]) u[c$1] = h++;
			else if (u[c$1] < t[a$1]) return;
			return t(l.event ? l.event(u) : u);
		}
	};
}
function q(n, u, t, i, r, o, e, f, c, a) {
	var s, h, p, v, y, d, _, k, x, M, I, P, A, H, T, j, F = u.type;
	if (void 0 !== u.constructor) return null;
	128 & t.__u && (c = !!(32 & t.__u), o = [f = u.__e = t.__e]), (s = l.__b) && s(u);
	n: if ("function" == typeof F) {
		h = e.length;
		try {
			if (x = u.props, M = F.prototype && F.prototype.render, I = (s = F.contextType) && i[s.__c], P = s ? I ? I.props.value : s.__ : i, t.__c ? k = (p = u.__c = t.__c).__ = p.__E : (M ? u.__c = p = new F(x, P) : (u.__c = p = new C(x, P), p.constructor = F, p.render = Q), I && I.sub(p), p.state || (p.state = {}), p.__n = i, v = p.__d = !0, p.__h = [], p._sb = []), M && null == p.__s && (p.__s = p.state), M && null != F.getDerivedStateFromProps && (p.__s == p.state && (p.__s = m$1({}, p.__s)), m$1(p.__s, F.getDerivedStateFromProps(x, p.__s))), y = p.props, d = p.state, p.__v = u, v) M && null == F.getDerivedStateFromProps && null != p.componentWillMount && p.componentWillMount(), M && null != p.componentDidMount && p.__h.push(p.componentDidMount);
			else {
				if (M && null == F.getDerivedStateFromProps && x !== y && null != p.componentWillReceiveProps && p.componentWillReceiveProps(x, P), u.__v == t.__v || !p.__e && null != p.shouldComponentUpdate && !1 === p.shouldComponentUpdate(x, p.__s, P)) {
					u.__v != t.__v && (p.props = x, p.state = p.__s, p.__d = !1), u.__e = t.__e, u.__k = t.__k, u.__k.some(function(n) {
						n && (n.__ = u);
					}), w.push.apply(p.__h, p._sb), p._sb = [], p.__h.length && e.push(p), f = $(t);
					break n;
				}
				null != p.componentWillUpdate && p.componentWillUpdate(x, p.__s, P), M && null != p.componentDidUpdate && p.__h.push(function() {
					p.componentDidUpdate(y, d, _);
				});
			}
			if (p.context = P, p.props = x, p.__P = n, p.__e = !1, A = l.__r, H = 0, M) p.state = p.__s, p.__d = !1, A && A(u), s = p.render(p.props, p.state, p.context), w.push.apply(p.__h, p._sb), p._sb = [];
			else do
				p.__d = !1, A && A(u), s = p.render(p.props, p.state, p.context), p.state = p.__s;
			while (p.__d && ++H < 25);
			p.state = p.__s, null != p.getChildContext && (i = m$1(m$1({}, i), p.getChildContext())), M && !v && null != p.getSnapshotBeforeUpdate && (_ = p.getSnapshotBeforeUpdate(y, d)), T = null != s && s.type === S && null == s.key ? E(s.props.children) : s, f = L(n, g(T) ? T : [T], u, t, i, r, o, e, f, c, a), p.base = u.__e, u.__u &= -161, p.__h.length && e.push(p), k && (p.__E = p.__ = null);
		} catch (n) {
			if (e.length = h, u.__v = null, c || null != o) {
				if (n.then) {
					for (u.__u |= c ? 160 : 128; f && 8 == f.nodeType && f.nextSibling;) f = f.nextSibling;
					null != o && (o[o.indexOf(f)] = null), u.__e = f;
				} else if (null != o) for (j = o.length; j--;) b(o[j]);
			} else u.__e = t.__e;
			u.__k ??= t.__k || [], n.then || B(u), l.__e(n, u, t);
		}
	} else null == o && u.__v == t.__v ? (u.__k = t.__k, u.__e = t.__e) : f = u.__e = G(t.__e, u, t, i, r, o, e, c, a);
	return (s = l.diffed) && s(u), 128 & u.__u ? void 0 : f;
}
function B(n) {
	n && (n.__c && (n.__c.__e = !0), n.__k && n.__k.some(B));
}
function D(n, u, t) {
	for (var i = 0; i < t.length; i++) J(t[i], t[++i], t[++i]);
	l.__c && l.__c(u, n), n.some(function(u) {
		try {
			n = u.__h, u.__h = [], n.some(function(n) {
				n.call(u);
			});
		} catch (n) {
			l.__e(n, u.__v);
		}
	});
}
function E(n) {
	return "object" != typeof n || null == n || n.__b > 0 ? n : g(n) ? n.map(E) : void 0 !== n.constructor ? null : m$1({}, n);
}
function G(u, t, i, r, o, e, f, c, a) {
	var s, h, p, v, y, w, _, m = i.props || d, k = t.props, x = t.type;
	if ("svg" == x ? o = "http://www.w3.org/2000/svg" : "math" == x ? o = "http://www.w3.org/1998/Math/MathML" : o || (o = "http://www.w3.org/1999/xhtml"), null != e) {
		for (s = 0; s < e.length; s++) if ((y = e[s]) && "setAttribute" in y == !!x && (x ? y.localName == x : 3 == y.nodeType)) {
			u = y, e[s] = null;
			break;
		}
	}
	if (null == u) {
		if (null == x) return document.createTextNode(k);
		u = document.createElementNS(o, x, k.is && k), c && (l.__m && l.__m(t, e), c = !1), e = null;
	}
	if (null == x) m === k || c && u.data == k || (u.data = k);
	else {
		if (e = "textarea" == x && null != k.defaultValue ? null : e && n.call(u.childNodes), !c && null != e) for (m = {}, s = 0; s < u.attributes.length; s++) m[(y = u.attributes[s]).name] = y.value;
		for (s in m) y = m[s], "dangerouslySetInnerHTML" == s ? p = y : "children" == s || s in k || "value" == s && "defaultValue" in k || "checked" == s && "defaultChecked" in k || N(u, s, null, y, o);
		for (s in k) y = k[s], "children" == s ? v = y : "dangerouslySetInnerHTML" == s ? h = y : "value" == s ? w = y : "checked" == s ? _ = y : c && "function" != typeof y || m[s] === y || N(u, s, y, m[s], o);
		if (h) c || p && (h.__html == p.__html || h.__html == u.innerHTML) || (u.innerHTML = h.__html), t.__k = [];
		else if (p && (u.innerHTML = ""), L("template" == t.type ? u.content : u, g(v) ? v : [v], t, i, r, "foreignObject" == x ? "http://www.w3.org/1999/xhtml" : o, e, f, e ? e[0] : i.__k && $(i, 0), c, a), null != e) for (s = e.length; s--;) b(e[s]);
		c && "textarea" != x || (s = "value", "progress" == x && null == w ? u.removeAttribute("value") : null != w && (w !== u[s] || "progress" == x && !w || "option" == x && w != m[s]) && N(u, s, w, m[s], o), s = "checked", null != _ && _ != u[s] && N(u, s, _, m[s], o));
	}
	return u;
}
function J(n, u, t) {
	try {
		if ("function" == typeof n) {
			var i = "function" == typeof n.__u;
			i && n.__u(), i && null == u || (n.__u = n(u));
		} else n.current = u;
	} catch (n) {
		l.__e(n, t);
	}
}
function K(n, u, t) {
	var i, r;
	if (l.unmount && l.unmount(n), (i = n.ref) && (i.current && i.current != n.__e || J(i, null, u)), null != (i = n.__c)) {
		if (i.componentWillUnmount) try {
			i.componentWillUnmount();
		} catch (n) {
			l.__e(n, u);
		}
		i.base = i.__P = i.__n = null;
	}
	if (i = n.__k) for (r = 0; r < i.length; r++) i[r] && K(i[r], u, t || "function" != typeof n.type);
	t || b(n.__e), n.__c = n.__ = n.__e = void 0;
}
function Q(n, l, u) {
	return this.constructor(n, u);
}
function R(u, t, i) {
	var r, o, e, f;
	t == document && (t = document.documentElement), l.__ && l.__(u, t), o = (r = "function" == typeof i) ? null : i && i.__k || t.__k, e = [], f = [], q(t, u = (!r && i || t).__k = k(S, null, [u]), o || d, d, t.namespaceURI, !r && i ? [i] : o ? null : t.firstChild ? n.call(t.childNodes) : null, e, !r && i ? i : o ? o.__e : t.firstChild, r, f), D(e, u, f), u.props.children = null;
}
function W(l, u, t) {
	var i, r, o, e, f = m$1({}, l.props);
	for (o in l.type && l.type.defaultProps && (e = l.type.defaultProps), u) "key" == o ? i = u[o] : "ref" == o ? r = u[o] : f[o] = void 0 === u[o] && null != e ? e[o] : u[o];
	return arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : t), x$1(l.type, f, i || l.key, r || l.ref, null);
}
n = w.slice, l = { __e: function(n, l, u, t) {
	for (var i, r, o; l = l.__;) if ((i = l.__c) && !i.__) try {
		if ((r = i.constructor) && null != r.getDerivedStateFromError && (i.setState(r.getDerivedStateFromError(n)), o = i.__d), null != i.componentDidCatch && (i.componentDidCatch(n, t || {}), o = i.__d), o) return i.__E = i;
	} catch (l) {
		n = l;
	}
	throw n;
} }, u = 0, t$1 = function(n) {
	return null != n && void 0 === n.constructor;
}, C.prototype.setState = function(n, l) {
	var u = null != this.__s && this.__s != this.state ? this.__s : this.__s = m$1({}, this.state);
	"function" == typeof n && (n = n(m$1({}, u), this.props)), n && m$1(u, n), null != n && this.__v && (l && this._sb.push(l), A(this));
}, C.prototype.forceUpdate = function(n) {
	this.__v && (this.__e = !0, n && this.__h.push(n), A(this));
}, C.prototype.render = S, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n, l) {
	return n.__v.__b - l.__v.__b;
}, H.__r = 0, f = Math.random().toString(8), c$1 = "__d" + f, a$1 = "__a" + f, s = /(PointerCapture)$|Capture$/i, h = 0, p = V(!1), v = V(!0);
//#endregion
//#region node_modules/.pnpm/float-tooltip@1.7.5/node_modules/float-tooltip/dist/float-tooltip.mjs
function _arrayLikeToArray$2(r, a) {
	(null == a || a > r.length) && (a = r.length);
	for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	return n;
}
function _arrayWithHoles$2(r) {
	if (Array.isArray(r)) return r;
}
function _defineProperty$1(e, r, t) {
	return (r = _toPropertyKey$2(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: true,
		configurable: true,
		writable: true
	}) : e[r] = t, e;
}
function _iterableToArrayLimit$2(r, l) {
	var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	if (null != t) {
		var e, n, i, u, a = [], f = true, o = false;
		try {
			if (i = (t = t.call(r)).next, 0 === l);
			else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
		} catch (r) {
			o = true, n = r;
		} finally {
			try {
				if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
			} finally {
				if (o) throw n;
			}
		}
		return a;
	}
}
function _nonIterableRest$2() {
	throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys$1(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r) {
			return Object.getOwnPropertyDescriptor(e, r).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2$1(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys$1(Object(t), true).forEach(function(r) {
			_defineProperty$1(e, r, t[r]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r) {
			Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
		});
	}
	return e;
}
function _slicedToArray$2(r, e) {
	return _arrayWithHoles$2(r) || _iterableToArrayLimit$2(r, e) || _unsupportedIterableToArray$2(r, e) || _nonIterableRest$2();
}
function _toPrimitive$2(t, r) {
	if ("object" != typeof t || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r);
		if ("object" != typeof i) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
function _toPropertyKey$2(t) {
	var i = _toPrimitive$2(t, "string");
	return "symbol" == typeof i ? i : i + "";
}
function _typeof$1(o) {
	"@babel/helpers - typeof";
	return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof$1(o);
}
function _unsupportedIterableToArray$2(r, a) {
	if (r) {
		if ("string" == typeof r) return _arrayLikeToArray$2(r, a);
		var t = {}.toString.call(r).slice(8, -1);
		return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$2(r, a) : void 0;
	}
}
var _reactElement2VNode = function reactElement2VNode(el) {
	if (!(_typeof$1(el) === "object")) return el;
	var res = W(el);
	if (res.props) {
		var _res$props;
		res.props = _objectSpread2$1({}, res.props);
		if (res !== null && res !== void 0 && (_res$props = res.props) !== null && _res$props !== void 0 && _res$props.children) res.props.children = Array.isArray(res.props.children) ? res.props.children.map(_reactElement2VNode) : _reactElement2VNode(res.props.children);
	}
	return res;
};
var isReactRenderable = function isReactRenderable(o) {
	return t$1(W(o));
};
var render$1 = function render(jsx, domEl) {
	delete domEl.__k;
	R(_reactElement2VNode(jsx), domEl);
};
function styleInject$1(css, ref) {
	if (ref === void 0) ref = {};
	var insertAt = ref.insertAt;
	if (typeof document === "undefined") return;
	var head = document.head || document.getElementsByTagName("head")[0];
	var style = document.createElement("style");
	style.type = "text/css";
	if (insertAt === "top") if (head.firstChild) head.insertBefore(style, head.firstChild);
	else head.appendChild(style);
	else head.appendChild(style);
	if (style.styleSheet) style.styleSheet.cssText = css;
	else style.appendChild(document.createTextNode(css));
}
styleInject$1(".float-tooltip-kap {\n  position: absolute;\n  width: max-content; /* prevent shrinking near right edge */\n  max-width: max(50%, 150px);\n  padding: 3px 5px;\n  border-radius: 3px;\n  font: 12px sans-serif;\n  color: #eee;\n  background: rgba(0,0,0,0.6);\n  pointer-events: none;\n}\n");
var index$2 = index$4({
	props: {
		content: { "default": false },
		offsetX: { triggerUpdate: false },
		offsetY: { triggerUpdate: false }
	},
	init: function init(domNode, state) {
		var _ref$style = (arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}).style, style = _ref$style === void 0 ? {} : _ref$style;
		var el = select_default$1(!!domNode && _typeof$1(domNode) === "object" && !!domNode.node && typeof domNode.node === "function" ? domNode.node() : domNode);
		el.style("position") === "static" && el.style("position", "relative");
		state.tooltipEl = el.append("div").attr("class", "float-tooltip-kap");
		Object.entries(style).forEach(function(_ref2) {
			var _ref3 = _slicedToArray$2(_ref2, 2), k = _ref3[0], v = _ref3[1];
			return state.tooltipEl.style(k, v);
		});
		state.tooltipEl.style("left", "-10000px").style("display", "none");
		var evSuffix = "tooltip-".concat(Math.round(Math.random() * 0xe8d4a51000));
		state.mouseInside = false;
		el.on("mousemove.".concat(evSuffix), function(ev) {
			state.mouseInside = true;
			var mousePos = pointer_default(ev);
			var domNode = el.node();
			var canvasWidth = domNode.offsetWidth;
			var canvasHeight = domNode.offsetHeight;
			var translate = [state.offsetX === null || state.offsetX === void 0 ? "-".concat(mousePos[0] / canvasWidth * 100, "%") : typeof state.offsetX === "number" ? "calc(-50% + ".concat(state.offsetX, "px)") : state.offsetX, state.offsetY === null || state.offsetY === void 0 ? canvasHeight > 130 && canvasHeight - mousePos[1] < 100 ? "calc(-100% - 6px)" : "21px" : typeof state.offsetY === "number" ? state.offsetY < 0 ? "calc(-100% - ".concat(Math.abs(state.offsetY), "px)") : "".concat(state.offsetY, "px") : state.offsetY];
			state.tooltipEl.style("left", mousePos[0] + "px").style("top", mousePos[1] + "px").style("transform", "translate(".concat(translate.join(","), ")"));
			state.content && state.tooltipEl.style("display", "inline");
		});
		el.on("mouseover.".concat(evSuffix), function() {
			state.mouseInside = true;
			state.content && state.tooltipEl.style("display", "inline");
		});
		el.on("mouseout.".concat(evSuffix), function() {
			state.mouseInside = false;
			state.tooltipEl.style("display", "none");
		});
	},
	update: function update(state) {
		state.tooltipEl.style("display", !!state.content && state.mouseInside ? "inline" : "none");
		if (!state.content) state.tooltipEl.text("");
		else if (state.content instanceof HTMLElement) {
			state.tooltipEl.text("");
			state.tooltipEl.append(function() {
				return state.content;
			});
		} else if (typeof state.content === "string") state.tooltipEl.html(state.content);
		else if (isReactRenderable(state.content)) {
			state.tooltipEl.text("");
			render$1(state.content, state.tooltipEl.node());
		} else {
			state.tooltipEl.style("display", "none");
			console.warn("Tooltip content is invalid, skipping.", state.content, state.content.toString());
		}
	}
});
//#endregion
//#region node_modules/.pnpm/d3-force-3d@3.0.6/node_modules/d3-force-3d/src/center.js
function center_default(x, y, z) {
	var nodes, strength = 1;
	if (x == null) x = 0;
	if (y == null) y = 0;
	if (z == null) z = 0;
	function force() {
		var i, n = nodes.length, node, sx = 0, sy = 0, sz = 0;
		for (i = 0; i < n; ++i) node = nodes[i], sx += node.x || 0, sy += node.y || 0, sz += node.z || 0;
		for (sx = (sx / n - x) * strength, sy = (sy / n - y) * strength, sz = (sz / n - z) * strength, i = 0; i < n; ++i) {
			node = nodes[i];
			if (sx) node.x -= sx;
			if (sy) node.y -= sy;
			if (sz) node.z -= sz;
		}
	}
	force.initialize = function(_) {
		nodes = _;
	};
	force.x = function(_) {
		return arguments.length ? (x = +_, force) : x;
	};
	force.y = function(_) {
		return arguments.length ? (y = +_, force) : y;
	};
	force.z = function(_) {
		return arguments.length ? (z = +_, force) : z;
	};
	force.strength = function(_) {
		return arguments.length ? (strength = +_, force) : strength;
	};
	return force;
}
//#endregion
//#region node_modules/.pnpm/d3-force-3d@3.0.6/node_modules/d3-force-3d/src/constant.js
function constant_default(x) {
	return function() {
		return x;
	};
}
//#endregion
//#region node_modules/.pnpm/d3-force-3d@3.0.6/node_modules/d3-force-3d/src/jiggle.js
function jiggle_default(random) {
	return (random() - .5) * 1e-6;
}
//#endregion
//#region node_modules/.pnpm/d3-force-3d@3.0.6/node_modules/d3-force-3d/src/link.js
function index$1(d) {
	return d.index;
}
function find(nodeById, nodeId) {
	var node = nodeById.get(nodeId);
	if (!node) throw new Error("node not found: " + nodeId);
	return node;
}
function link_default(links) {
	var id = index$1, strength = defaultStrength, strengths, distance = constant_default(30), distances, nodes, nDim, count, bias, random, iterations = 1;
	if (links == null) links = [];
	function defaultStrength(link) {
		return 1 / Math.min(count[link.source.index], count[link.target.index]);
	}
	function force(alpha) {
		for (var k = 0, n = links.length; k < iterations; ++k) for (var i = 0, link, source, target, x = 0, y = 0, z = 0, l, b; i < n; ++i) {
			link = links[i], source = link.source, target = link.target;
			x = target.x + target.vx - source.x - source.vx || jiggle_default(random);
			if (nDim > 1) y = target.y + target.vy - source.y - source.vy || jiggle_default(random);
			if (nDim > 2) z = target.z + target.vz - source.z - source.vz || jiggle_default(random);
			l = Math.sqrt(x * x + y * y + z * z);
			l = (l - distances[i]) / l * alpha * strengths[i];
			x *= l, y *= l, z *= l;
			target.vx -= x * (b = bias[i]);
			if (nDim > 1) target.vy -= y * b;
			if (nDim > 2) target.vz -= z * b;
			source.vx += x * (b = 1 - b);
			if (nDim > 1) source.vy += y * b;
			if (nDim > 2) source.vz += z * b;
		}
	}
	function initialize() {
		if (!nodes) return;
		var i, n = nodes.length, m = links.length, nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d])), link;
		for (i = 0, count = new Array(n); i < m; ++i) {
			link = links[i], link.index = i;
			if (typeof link.source !== "object") link.source = find(nodeById, link.source);
			if (typeof link.target !== "object") link.target = find(nodeById, link.target);
			count[link.source.index] = (count[link.source.index] || 0) + 1;
			count[link.target.index] = (count[link.target.index] || 0) + 1;
		}
		for (i = 0, bias = new Array(m); i < m; ++i) link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
		strengths = new Array(m), initializeStrength();
		distances = new Array(m), initializeDistance();
	}
	function initializeStrength() {
		if (!nodes) return;
		for (var i = 0, n = links.length; i < n; ++i) strengths[i] = +strength(links[i], i, links);
	}
	function initializeDistance() {
		if (!nodes) return;
		for (var i = 0, n = links.length; i < n; ++i) distances[i] = +distance(links[i], i, links);
	}
	force.initialize = function(_nodes, ...args) {
		nodes = _nodes;
		random = args.find((arg) => typeof arg === "function") || Math.random;
		nDim = args.find((arg) => [
			1,
			2,
			3
		].includes(arg)) || 2;
		initialize();
	};
	force.links = function(_) {
		return arguments.length ? (links = _, initialize(), force) : links;
	};
	force.id = function(_) {
		return arguments.length ? (id = _, force) : id;
	};
	force.iterations = function(_) {
		return arguments.length ? (iterations = +_, force) : iterations;
	};
	force.strength = function(_) {
		return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initializeStrength(), force) : strength;
	};
	force.distance = function(_) {
		return arguments.length ? (distance = typeof _ === "function" ? _ : constant_default(+_), initializeDistance(), force) : distance;
	};
	return force;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/add.js
function add_default$2(d) {
	const x = +this._x.call(null, d);
	return add$2(this.cover(x), x, d);
}
function add$2(tree, x, d) {
	if (isNaN(x)) return tree;
	var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, x1 = tree._x1, xm, xp, right, i, j;
	if (!node) return tree._root = leaf, tree;
	while (node.length) {
		if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;
		else x1 = xm;
		if (parent = node, !(node = node[i = +right])) return parent[i] = leaf, tree;
	}
	xp = +tree._x.call(null, node.data);
	if (x === xp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
	do {
		parent = parent ? parent[i] = new Array(2) : tree._root = new Array(2);
		if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;
		else x1 = xm;
	} while ((i = +right) === (j = +(xp >= xm)));
	return parent[j] = node, parent[i] = leaf, tree;
}
function addAll$2(data) {
	if (!Array.isArray(data)) data = Array.from(data);
	const n = data.length;
	const xz = new Float64Array(n);
	let x0 = Infinity, x1 = -Infinity;
	for (let i = 0, x; i < n; ++i) {
		if (isNaN(x = +this._x.call(null, data[i]))) continue;
		xz[i] = x;
		if (x < x0) x0 = x;
		if (x > x1) x1 = x;
	}
	if (x0 > x1) return this;
	this.cover(x0).cover(x1);
	for (let i = 0; i < n; ++i) add$2(this, xz[i], data[i]);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/cover.js
function cover_default$2(x) {
	if (isNaN(x = +x)) return this;
	var x0 = this._x0, x1 = this._x1;
	if (isNaN(x0)) x1 = (x0 = Math.floor(x)) + 1;
	else {
		var z = x1 - x0 || 1, node = this._root, parent, i;
		while (x0 > x || x >= x1) {
			i = +(x < x0);
			parent = new Array(2), parent[i] = node, node = parent, z *= 2;
			switch (i) {
				case 0:
					x1 = x0 + z;
					break;
				case 1:
					x0 = x1 - z;
					break;
			}
		}
		if (this._root && this._root.length) this._root = node;
	}
	this._x0 = x0;
	this._x1 = x1;
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/data.js
function data_default$2() {
	var data = [];
	this.visit(function(node) {
		if (!node.length) do
			data.push(node.data);
		while (node = node.next);
	});
	return data;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/extent.js
function extent_default$2(_) {
	return arguments.length ? this.cover(+_[0][0]).cover(+_[1][0]) : isNaN(this._x0) ? void 0 : [[this._x0], [this._x1]];
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/half.js
function half_default(node, x0, x1) {
	this.node = node;
	this.x0 = x0;
	this.x1 = x1;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/find.js
function find_default$2(x, radius) {
	var data, x0 = this._x0, x1, x2, x3 = this._x1, halves = [], node = this._root, q, i;
	if (node) halves.push(new half_default(node, x0, x3));
	if (radius == null) radius = Infinity;
	else {
		x0 = x - radius;
		x3 = x + radius;
	}
	while (q = halves.pop()) {
		if (!(node = q.node) || (x1 = q.x0) > x3 || (x2 = q.x1) < x0) continue;
		if (node.length) {
			var xm = (x1 + x2) / 2;
			halves.push(new half_default(node[1], xm, x2), new half_default(node[0], x1, xm));
			if (i = +(x >= xm)) {
				q = halves[halves.length - 1];
				halves[halves.length - 1] = halves[halves.length - 1 - i];
				halves[halves.length - 1 - i] = q;
			}
		} else {
			var d = Math.abs(x - +this._x.call(null, node.data));
			if (d < radius) {
				radius = d;
				x0 = x - d;
				x3 = x + d;
				data = node.data;
			}
		}
	}
	return data;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/remove.js
function remove_default$2(d) {
	if (isNaN(x = +this._x.call(null, d))) return this;
	var parent, node = this._root, retainer, previous, next, x0 = this._x0, x1 = this._x1, x, xm, right, i, j;
	if (!node) return this;
	if (node.length) while (true) {
		if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;
		else x1 = xm;
		if (!(parent = node, node = node[i = +right])) return this;
		if (!node.length) break;
		if (parent[i + 1 & 1]) retainer = parent, j = i;
	}
	while (node.data !== d) if (!(previous = node, node = node.next)) return this;
	if (next = node.next) delete node.next;
	if (previous) return next ? previous.next = next : delete previous.next, this;
	if (!parent) return this._root = next, this;
	next ? parent[i] = next : delete parent[i];
	if ((node = parent[0] || parent[1]) && node === (parent[1] || parent[0]) && !node.length) if (retainer) retainer[j] = node;
	else this._root = node;
	return this;
}
function removeAll$2(data) {
	for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/root.js
function root_default$2() {
	return this._root;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/size.js
function size_default$2() {
	var size = 0;
	this.visit(function(node) {
		if (!node.length) do
			++size;
		while (node = node.next);
	});
	return size;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/visit.js
function visit_default$2(callback) {
	var halves = [], q, node = this._root, child, x0, x1;
	if (node) halves.push(new half_default(node, this._x0, this._x1));
	while (q = halves.pop()) if (!callback(node = q.node, x0 = q.x0, x1 = q.x1) && node.length) {
		var xm = (x0 + x1) / 2;
		if (child = node[1]) halves.push(new half_default(child, xm, x1));
		if (child = node[0]) halves.push(new half_default(child, x0, xm));
	}
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/visitAfter.js
function visitAfter_default$2(callback) {
	var halves = [], next = [], q;
	if (this._root) halves.push(new half_default(this._root, this._x0, this._x1));
	while (q = halves.pop()) {
		var node = q.node;
		if (node.length) {
			var child, x0 = q.x0, x1 = q.x1, xm = (x0 + x1) / 2;
			if (child = node[0]) halves.push(new half_default(child, x0, xm));
			if (child = node[1]) halves.push(new half_default(child, xm, x1));
		}
		next.push(q);
	}
	while (q = next.pop()) callback(q.node, q.x0, q.x1);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/x.js
function defaultX$2(d) {
	return d[0];
}
function x_default$2(_) {
	return arguments.length ? (this._x = _, this) : this._x;
}
//#endregion
//#region node_modules/.pnpm/d3-binarytree@1.0.2/node_modules/d3-binarytree/src/binarytree.js
function binarytree(nodes, x) {
	var tree = new Binarytree(x == null ? defaultX$2 : x, NaN, NaN);
	return nodes == null ? tree : tree.addAll(nodes);
}
function Binarytree(x, x0, x1) {
	this._x = x;
	this._x0 = x0;
	this._x1 = x1;
	this._root = void 0;
}
function leaf_copy$2(leaf) {
	var copy = { data: leaf.data }, next = copy;
	while (leaf = leaf.next) next = next.next = { data: leaf.data };
	return copy;
}
var treeProto$2 = binarytree.prototype = Binarytree.prototype;
treeProto$2.copy = function() {
	var copy = new Binarytree(this._x, this._x0, this._x1), node = this._root, nodes, child;
	if (!node) return copy;
	if (!node.length) return copy._root = leaf_copy$2(node), copy;
	nodes = [{
		source: node,
		target: copy._root = new Array(2)
	}];
	while (node = nodes.pop()) for (var i = 0; i < 2; ++i) if (child = node.source[i]) if (child.length) nodes.push({
		source: child,
		target: node.target[i] = new Array(2)
	});
	else node.target[i] = leaf_copy$2(child);
	return copy;
};
treeProto$2.add = add_default$2;
treeProto$2.addAll = addAll$2;
treeProto$2.cover = cover_default$2;
treeProto$2.data = data_default$2;
treeProto$2.extent = extent_default$2;
treeProto$2.find = find_default$2;
treeProto$2.remove = remove_default$2;
treeProto$2.removeAll = removeAll$2;
treeProto$2.root = root_default$2;
treeProto$2.size = size_default$2;
treeProto$2.visit = visit_default$2;
treeProto$2.visitAfter = visitAfter_default$2;
treeProto$2.x = x_default$2;
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/add.js
function add_default$1(d) {
	const x = +this._x.call(null, d), y = +this._y.call(null, d);
	return add$1(this.cover(x, y), x, y, d);
}
function add$1(tree, x, y, d) {
	if (isNaN(x) || isNaN(y)) return tree;
	var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, y0 = tree._y0, x1 = tree._x1, y1 = tree._y1, xm, ym, xp, yp, right, bottom, i, j;
	if (!node) return tree._root = leaf, tree;
	while (node.length) {
		if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;
		else x1 = xm;
		if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;
		else y1 = ym;
		if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
	}
	xp = +tree._x.call(null, node.data);
	yp = +tree._y.call(null, node.data);
	if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
	do {
		parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
		if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;
		else x1 = xm;
		if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;
		else y1 = ym;
	} while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | xp >= xm));
	return parent[j] = node, parent[i] = leaf, tree;
}
function addAll$1(data) {
	var d, i, n = data.length, x, y, xz = new Array(n), yz = new Array(n), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
	for (i = 0; i < n; ++i) {
		if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
		xz[i] = x;
		yz[i] = y;
		if (x < x0) x0 = x;
		if (x > x1) x1 = x;
		if (y < y0) y0 = y;
		if (y > y1) y1 = y;
	}
	if (x0 > x1 || y0 > y1) return this;
	this.cover(x0, y0).cover(x1, y1);
	for (i = 0; i < n; ++i) add$1(this, xz[i], yz[i], data[i]);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/cover.js
function cover_default$1(x, y) {
	if (isNaN(x = +x) || isNaN(y = +y)) return this;
	var x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1;
	if (isNaN(x0)) {
		x1 = (x0 = Math.floor(x)) + 1;
		y1 = (y0 = Math.floor(y)) + 1;
	} else {
		var z = x1 - x0 || 1, node = this._root, parent, i;
		while (x0 > x || x >= x1 || y0 > y || y >= y1) {
			i = (y < y0) << 1 | x < x0;
			parent = new Array(4), parent[i] = node, node = parent, z *= 2;
			switch (i) {
				case 0:
					x1 = x0 + z, y1 = y0 + z;
					break;
				case 1:
					x0 = x1 - z, y1 = y0 + z;
					break;
				case 2:
					x1 = x0 + z, y0 = y1 - z;
					break;
				case 3:
					x0 = x1 - z, y0 = y1 - z;
					break;
			}
		}
		if (this._root && this._root.length) this._root = node;
	}
	this._x0 = x0;
	this._y0 = y0;
	this._x1 = x1;
	this._y1 = y1;
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/data.js
function data_default$1() {
	var data = [];
	this.visit(function(node) {
		if (!node.length) do
			data.push(node.data);
		while (node = node.next);
	});
	return data;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/extent.js
function extent_default$1(_) {
	return arguments.length ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/quad.js
function quad_default(node, x0, y0, x1, y1) {
	this.node = node;
	this.x0 = x0;
	this.y0 = y0;
	this.x1 = x1;
	this.y1 = y1;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/find.js
function find_default$1(x, y, radius) {
	var data, x0 = this._x0, y0 = this._y0, x1, y1, x2, y2, x3 = this._x1, y3 = this._y1, quads = [], node = this._root, q, i;
	if (node) quads.push(new quad_default(node, x0, y0, x3, y3));
	if (radius == null) radius = Infinity;
	else {
		x0 = x - radius, y0 = y - radius;
		x3 = x + radius, y3 = y + radius;
		radius *= radius;
	}
	while (q = quads.pop()) {
		if (!(node = q.node) || (x1 = q.x0) > x3 || (y1 = q.y0) > y3 || (x2 = q.x1) < x0 || (y2 = q.y1) < y0) continue;
		if (node.length) {
			var xm = (x1 + x2) / 2, ym = (y1 + y2) / 2;
			quads.push(new quad_default(node[3], xm, ym, x2, y2), new quad_default(node[2], x1, ym, xm, y2), new quad_default(node[1], xm, y1, x2, ym), new quad_default(node[0], x1, y1, xm, ym));
			if (i = (y >= ym) << 1 | x >= xm) {
				q = quads[quads.length - 1];
				quads[quads.length - 1] = quads[quads.length - 1 - i];
				quads[quads.length - 1 - i] = q;
			}
		} else {
			var dx = x - +this._x.call(null, node.data), dy = y - +this._y.call(null, node.data), d2 = dx * dx + dy * dy;
			if (d2 < radius) {
				var d = Math.sqrt(radius = d2);
				x0 = x - d, y0 = y - d;
				x3 = x + d, y3 = y + d;
				data = node.data;
			}
		}
	}
	return data;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/remove.js
function remove_default$1(d) {
	if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this;
	var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1, x, y, xm, ym, right, bottom, i, j;
	if (!node) return this;
	if (node.length) while (true) {
		if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;
		else x1 = xm;
		if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;
		else y1 = ym;
		if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
		if (!node.length) break;
		if (parent[i + 1 & 3] || parent[i + 2 & 3] || parent[i + 3 & 3]) retainer = parent, j = i;
	}
	while (node.data !== d) if (!(previous = node, node = node.next)) return this;
	if (next = node.next) delete node.next;
	if (previous) return next ? previous.next = next : delete previous.next, this;
	if (!parent) return this._root = next, this;
	next ? parent[i] = next : delete parent[i];
	if ((node = parent[0] || parent[1] || parent[2] || parent[3]) && node === (parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) if (retainer) retainer[j] = node;
	else this._root = node;
	return this;
}
function removeAll$1(data) {
	for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/root.js
function root_default$1() {
	return this._root;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/size.js
function size_default$1() {
	var size = 0;
	this.visit(function(node) {
		if (!node.length) do
			++size;
		while (node = node.next);
	});
	return size;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/visit.js
function visit_default$1(callback) {
	var quads = [], q, node = this._root, child, x0, y0, x1, y1;
	if (node) quads.push(new quad_default(node, this._x0, this._y0, this._x1, this._y1));
	while (q = quads.pop()) if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
		var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
		if (child = node[3]) quads.push(new quad_default(child, xm, ym, x1, y1));
		if (child = node[2]) quads.push(new quad_default(child, x0, ym, xm, y1));
		if (child = node[1]) quads.push(new quad_default(child, xm, y0, x1, ym));
		if (child = node[0]) quads.push(new quad_default(child, x0, y0, xm, ym));
	}
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/visitAfter.js
function visitAfter_default$1(callback) {
	var quads = [], next = [], q;
	if (this._root) quads.push(new quad_default(this._root, this._x0, this._y0, this._x1, this._y1));
	while (q = quads.pop()) {
		var node = q.node;
		if (node.length) {
			var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
			if (child = node[0]) quads.push(new quad_default(child, x0, y0, xm, ym));
			if (child = node[1]) quads.push(new quad_default(child, xm, y0, x1, ym));
			if (child = node[2]) quads.push(new quad_default(child, x0, ym, xm, y1));
			if (child = node[3]) quads.push(new quad_default(child, xm, ym, x1, y1));
		}
		next.push(q);
	}
	while (q = next.pop()) callback(q.node, q.x0, q.y0, q.x1, q.y1);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/x.js
function defaultX$1(d) {
	return d[0];
}
function x_default$1(_) {
	return arguments.length ? (this._x = _, this) : this._x;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/y.js
function defaultY$1(d) {
	return d[1];
}
function y_default$1(_) {
	return arguments.length ? (this._y = _, this) : this._y;
}
//#endregion
//#region node_modules/.pnpm/d3-quadtree@3.0.1/node_modules/d3-quadtree/src/quadtree.js
function quadtree(nodes, x, y) {
	var tree = new Quadtree(x == null ? defaultX$1 : x, y == null ? defaultY$1 : y, NaN, NaN, NaN, NaN);
	return nodes == null ? tree : tree.addAll(nodes);
}
function Quadtree(x, y, x0, y0, x1, y1) {
	this._x = x;
	this._y = y;
	this._x0 = x0;
	this._y0 = y0;
	this._x1 = x1;
	this._y1 = y1;
	this._root = void 0;
}
function leaf_copy$1(leaf) {
	var copy = { data: leaf.data }, next = copy;
	while (leaf = leaf.next) next = next.next = { data: leaf.data };
	return copy;
}
var treeProto$1 = quadtree.prototype = Quadtree.prototype;
treeProto$1.copy = function() {
	var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1), node = this._root, nodes, child;
	if (!node) return copy;
	if (!node.length) return copy._root = leaf_copy$1(node), copy;
	nodes = [{
		source: node,
		target: copy._root = new Array(4)
	}];
	while (node = nodes.pop()) for (var i = 0; i < 4; ++i) if (child = node.source[i]) if (child.length) nodes.push({
		source: child,
		target: node.target[i] = new Array(4)
	});
	else node.target[i] = leaf_copy$1(child);
	return copy;
};
treeProto$1.add = add_default$1;
treeProto$1.addAll = addAll$1;
treeProto$1.cover = cover_default$1;
treeProto$1.data = data_default$1;
treeProto$1.extent = extent_default$1;
treeProto$1.find = find_default$1;
treeProto$1.remove = remove_default$1;
treeProto$1.removeAll = removeAll$1;
treeProto$1.root = root_default$1;
treeProto$1.size = size_default$1;
treeProto$1.visit = visit_default$1;
treeProto$1.visitAfter = visitAfter_default$1;
treeProto$1.x = x_default$1;
treeProto$1.y = y_default$1;
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/add.js
function add_default(d) {
	const x = +this._x.call(null, d), y = +this._y.call(null, d), z = +this._z.call(null, d);
	return add(this.cover(x, y, z), x, y, z, d);
}
function add(tree, x, y, z, d) {
	if (isNaN(x) || isNaN(y) || isNaN(z)) return tree;
	var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, y0 = tree._y0, z0 = tree._z0, x1 = tree._x1, y1 = tree._y1, z1 = tree._z1, xm, ym, zm, xp, yp, zp, right, bottom, deep, i, j;
	if (!node) return tree._root = leaf, tree;
	while (node.length) {
		if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;
		else x1 = xm;
		if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;
		else y1 = ym;
		if (deep = z >= (zm = (z0 + z1) / 2)) z0 = zm;
		else z1 = zm;
		if (parent = node, !(node = node[i = deep << 2 | bottom << 1 | right])) return parent[i] = leaf, tree;
	}
	xp = +tree._x.call(null, node.data);
	yp = +tree._y.call(null, node.data);
	zp = +tree._z.call(null, node.data);
	if (x === xp && y === yp && z === zp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
	do {
		parent = parent ? parent[i] = new Array(8) : tree._root = new Array(8);
		if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;
		else x1 = xm;
		if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;
		else y1 = ym;
		if (deep = z >= (zm = (z0 + z1) / 2)) z0 = zm;
		else z1 = zm;
	} while ((i = deep << 2 | bottom << 1 | right) === (j = (zp >= zm) << 2 | (yp >= ym) << 1 | xp >= xm));
	return parent[j] = node, parent[i] = leaf, tree;
}
function addAll(data) {
	if (!Array.isArray(data)) data = Array.from(data);
	const n = data.length;
	const xz = new Float64Array(n);
	const yz = new Float64Array(n);
	const zz = new Float64Array(n);
	let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
	for (let i = 0, d, x, y, z; i < n; ++i) {
		if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d)) || isNaN(z = +this._z.call(null, d))) continue;
		xz[i] = x;
		yz[i] = y;
		zz[i] = z;
		if (x < x0) x0 = x;
		if (x > x1) x1 = x;
		if (y < y0) y0 = y;
		if (y > y1) y1 = y;
		if (z < z0) z0 = z;
		if (z > z1) z1 = z;
	}
	if (x0 > x1 || y0 > y1 || z0 > z1) return this;
	this.cover(x0, y0, z0).cover(x1, y1, z1);
	for (let i = 0; i < n; ++i) add(this, xz[i], yz[i], zz[i], data[i]);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/cover.js
function cover_default(x, y, z) {
	if (isNaN(x = +x) || isNaN(y = +y) || isNaN(z = +z)) return this;
	var x0 = this._x0, y0 = this._y0, z0 = this._z0, x1 = this._x1, y1 = this._y1, z1 = this._z1;
	if (isNaN(x0)) {
		x1 = (x0 = Math.floor(x)) + 1;
		y1 = (y0 = Math.floor(y)) + 1;
		z1 = (z0 = Math.floor(z)) + 1;
	} else {
		var t = x1 - x0 || 1, node = this._root, parent, i;
		while (x0 > x || x >= x1 || y0 > y || y >= y1 || z0 > z || z >= z1) {
			i = (z < z0) << 2 | (y < y0) << 1 | x < x0;
			parent = new Array(8), parent[i] = node, node = parent, t *= 2;
			switch (i) {
				case 0:
					x1 = x0 + t, y1 = y0 + t, z1 = z0 + t;
					break;
				case 1:
					x0 = x1 - t, y1 = y0 + t, z1 = z0 + t;
					break;
				case 2:
					x1 = x0 + t, y0 = y1 - t, z1 = z0 + t;
					break;
				case 3:
					x0 = x1 - t, y0 = y1 - t, z1 = z0 + t;
					break;
				case 4:
					x1 = x0 + t, y1 = y0 + t, z0 = z1 - t;
					break;
				case 5:
					x0 = x1 - t, y1 = y0 + t, z0 = z1 - t;
					break;
				case 6:
					x1 = x0 + t, y0 = y1 - t, z0 = z1 - t;
					break;
				case 7:
					x0 = x1 - t, y0 = y1 - t, z0 = z1 - t;
					break;
			}
		}
		if (this._root && this._root.length) this._root = node;
	}
	this._x0 = x0;
	this._y0 = y0;
	this._z0 = z0;
	this._x1 = x1;
	this._y1 = y1;
	this._z1 = z1;
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/data.js
function data_default() {
	var data = [];
	this.visit(function(node) {
		if (!node.length) do
			data.push(node.data);
		while (node = node.next);
	});
	return data;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/extent.js
function extent_default(_) {
	return arguments.length ? this.cover(+_[0][0], +_[0][1], +_[0][2]).cover(+_[1][0], +_[1][1], +_[1][2]) : isNaN(this._x0) ? void 0 : [[
		this._x0,
		this._y0,
		this._z0
	], [
		this._x1,
		this._y1,
		this._z1
	]];
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/octant.js
function octant_default(node, x0, y0, z0, x1, y1, z1) {
	this.node = node;
	this.x0 = x0;
	this.y0 = y0;
	this.z0 = z0;
	this.x1 = x1;
	this.y1 = y1;
	this.z1 = z1;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/find.js
function find_default(x, y, z, radius) {
	var data, x0 = this._x0, y0 = this._y0, z0 = this._z0, x1, y1, z1, x2, y2, z2, x3 = this._x1, y3 = this._y1, z3 = this._z1, octs = [], node = this._root, q, i;
	if (node) octs.push(new octant_default(node, x0, y0, z0, x3, y3, z3));
	if (radius == null) radius = Infinity;
	else {
		x0 = x - radius, y0 = y - radius, z0 = z - radius;
		x3 = x + radius, y3 = y + radius, z3 = z + radius;
		radius *= radius;
	}
	while (q = octs.pop()) {
		if (!(node = q.node) || (x1 = q.x0) > x3 || (y1 = q.y0) > y3 || (z1 = q.z0) > z3 || (x2 = q.x1) < x0 || (y2 = q.y1) < y0 || (z2 = q.z1) < z0) continue;
		if (node.length) {
			var xm = (x1 + x2) / 2, ym = (y1 + y2) / 2, zm = (z1 + z2) / 2;
			octs.push(new octant_default(node[7], xm, ym, zm, x2, y2, z2), new octant_default(node[6], x1, ym, zm, xm, y2, z2), new octant_default(node[5], xm, y1, zm, x2, ym, z2), new octant_default(node[4], x1, y1, zm, xm, ym, z2), new octant_default(node[3], xm, ym, z1, x2, y2, zm), new octant_default(node[2], x1, ym, z1, xm, y2, zm), new octant_default(node[1], xm, y1, z1, x2, ym, zm), new octant_default(node[0], x1, y1, z1, xm, ym, zm));
			if (i = (z >= zm) << 2 | (y >= ym) << 1 | x >= xm) {
				q = octs[octs.length - 1];
				octs[octs.length - 1] = octs[octs.length - 1 - i];
				octs[octs.length - 1 - i] = q;
			}
		} else {
			var dx = x - +this._x.call(null, node.data), dy = y - +this._y.call(null, node.data), dz = z - +this._z.call(null, node.data), d2 = dx * dx + dy * dy + dz * dz;
			if (d2 < radius) {
				var d = Math.sqrt(radius = d2);
				x0 = x - d, y0 = y - d, z0 = z - d;
				x3 = x + d, y3 = y + d, z3 = z + d;
				data = node.data;
			}
		}
	}
	return data;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/findAll.js
const distance = (x1, y1, z1, x2, y2, z2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
function findAllWithinRadius(x, y, z, radius) {
	const result = [];
	const xMin = x - radius;
	const yMin = y - radius;
	const zMin = z - radius;
	const xMax = x + radius;
	const yMax = y + radius;
	const zMax = z + radius;
	this.visit((node, x1, y1, z1, x2, y2, z2) => {
		if (!node.length) do {
			const d = node.data;
			if (distance(x, y, z, this._x(d), this._y(d), this._z(d)) <= radius) result.push(d);
		} while (node = node.next);
		return x1 > xMax || y1 > yMax || z1 > zMax || x2 < xMin || y2 < yMin || z2 < zMin;
	});
	return result;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/remove.js
function remove_default(d) {
	if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d)) || isNaN(z = +this._z.call(null, d))) return this;
	var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, z0 = this._z0, x1 = this._x1, y1 = this._y1, z1 = this._z1, x, y, z, xm, ym, zm, right, bottom, deep, i, j;
	if (!node) return this;
	if (node.length) while (true) {
		if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm;
		else x1 = xm;
		if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym;
		else y1 = ym;
		if (deep = z >= (zm = (z0 + z1) / 2)) z0 = zm;
		else z1 = zm;
		if (!(parent = node, node = node[i = deep << 2 | bottom << 1 | right])) return this;
		if (!node.length) break;
		if (parent[i + 1 & 7] || parent[i + 2 & 7] || parent[i + 3 & 7] || parent[i + 4 & 7] || parent[i + 5 & 7] || parent[i + 6 & 7] || parent[i + 7 & 7]) retainer = parent, j = i;
	}
	while (node.data !== d) if (!(previous = node, node = node.next)) return this;
	if (next = node.next) delete node.next;
	if (previous) return next ? previous.next = next : delete previous.next, this;
	if (!parent) return this._root = next, this;
	next ? parent[i] = next : delete parent[i];
	if ((node = parent[0] || parent[1] || parent[2] || parent[3] || parent[4] || parent[5] || parent[6] || parent[7]) && node === (parent[7] || parent[6] || parent[5] || parent[4] || parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) if (retainer) retainer[j] = node;
	else this._root = node;
	return this;
}
function removeAll(data) {
	for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/root.js
function root_default() {
	return this._root;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/size.js
function size_default() {
	var size = 0;
	this.visit(function(node) {
		if (!node.length) do
			++size;
		while (node = node.next);
	});
	return size;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/visit.js
function visit_default(callback) {
	var octs = [], q, node = this._root, child, x0, y0, z0, x1, y1, z1;
	if (node) octs.push(new octant_default(node, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1));
	while (q = octs.pop()) if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, z0 = q.z0, x1 = q.x1, y1 = q.y1, z1 = q.z1) && node.length) {
		var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
		if (child = node[7]) octs.push(new octant_default(child, xm, ym, zm, x1, y1, z1));
		if (child = node[6]) octs.push(new octant_default(child, x0, ym, zm, xm, y1, z1));
		if (child = node[5]) octs.push(new octant_default(child, xm, y0, zm, x1, ym, z1));
		if (child = node[4]) octs.push(new octant_default(child, x0, y0, zm, xm, ym, z1));
		if (child = node[3]) octs.push(new octant_default(child, xm, ym, z0, x1, y1, zm));
		if (child = node[2]) octs.push(new octant_default(child, x0, ym, z0, xm, y1, zm));
		if (child = node[1]) octs.push(new octant_default(child, xm, y0, z0, x1, ym, zm));
		if (child = node[0]) octs.push(new octant_default(child, x0, y0, z0, xm, ym, zm));
	}
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/visitAfter.js
function visitAfter_default(callback) {
	var octs = [], next = [], q;
	if (this._root) octs.push(new octant_default(this._root, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1));
	while (q = octs.pop()) {
		var node = q.node;
		if (node.length) {
			var child, x0 = q.x0, y0 = q.y0, z0 = q.z0, x1 = q.x1, y1 = q.y1, z1 = q.z1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
			if (child = node[0]) octs.push(new octant_default(child, x0, y0, z0, xm, ym, zm));
			if (child = node[1]) octs.push(new octant_default(child, xm, y0, z0, x1, ym, zm));
			if (child = node[2]) octs.push(new octant_default(child, x0, ym, z0, xm, y1, zm));
			if (child = node[3]) octs.push(new octant_default(child, xm, ym, z0, x1, y1, zm));
			if (child = node[4]) octs.push(new octant_default(child, x0, y0, zm, xm, ym, z1));
			if (child = node[5]) octs.push(new octant_default(child, xm, y0, zm, x1, ym, z1));
			if (child = node[6]) octs.push(new octant_default(child, x0, ym, zm, xm, y1, z1));
			if (child = node[7]) octs.push(new octant_default(child, xm, ym, zm, x1, y1, z1));
		}
		next.push(q);
	}
	while (q = next.pop()) callback(q.node, q.x0, q.y0, q.z0, q.x1, q.y1, q.z1);
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/x.js
function defaultX(d) {
	return d[0];
}
function x_default(_) {
	return arguments.length ? (this._x = _, this) : this._x;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/y.js
function defaultY(d) {
	return d[1];
}
function y_default(_) {
	return arguments.length ? (this._y = _, this) : this._y;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/z.js
function defaultZ(d) {
	return d[2];
}
function z_default(_) {
	return arguments.length ? (this._z = _, this) : this._z;
}
//#endregion
//#region node_modules/.pnpm/d3-octree@1.1.0/node_modules/d3-octree/src/octree.js
function octree(nodes, x, y, z) {
	var tree = new Octree(x == null ? defaultX : x, y == null ? defaultY : y, z == null ? defaultZ : z, NaN, NaN, NaN, NaN, NaN, NaN);
	return nodes == null ? tree : tree.addAll(nodes);
}
function Octree(x, y, z, x0, y0, z0, x1, y1, z1) {
	this._x = x;
	this._y = y;
	this._z = z;
	this._x0 = x0;
	this._y0 = y0;
	this._z0 = z0;
	this._x1 = x1;
	this._y1 = y1;
	this._z1 = z1;
	this._root = void 0;
}
function leaf_copy(leaf) {
	var copy = { data: leaf.data }, next = copy;
	while (leaf = leaf.next) next = next.next = { data: leaf.data };
	return copy;
}
var treeProto = octree.prototype = Octree.prototype;
treeProto.copy = function() {
	var copy = new Octree(this._x, this._y, this._z, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1), node = this._root, nodes, child;
	if (!node) return copy;
	if (!node.length) return copy._root = leaf_copy(node), copy;
	nodes = [{
		source: node,
		target: copy._root = new Array(8)
	}];
	while (node = nodes.pop()) for (var i = 0; i < 8; ++i) if (child = node.source[i]) if (child.length) nodes.push({
		source: child,
		target: node.target[i] = new Array(8)
	});
	else node.target[i] = leaf_copy(child);
	return copy;
};
treeProto.add = add_default;
treeProto.addAll = addAll;
treeProto.cover = cover_default;
treeProto.data = data_default;
treeProto.extent = extent_default;
treeProto.find = find_default;
treeProto.findAllWithinRadius = findAllWithinRadius;
treeProto.remove = remove_default;
treeProto.removeAll = removeAll;
treeProto.root = root_default;
treeProto.size = size_default;
treeProto.visit = visit_default;
treeProto.visitAfter = visitAfter_default;
treeProto.x = x_default;
treeProto.y = y_default;
treeProto.z = z_default;
//#endregion
//#region node_modules/.pnpm/d3-force-3d@3.0.6/node_modules/d3-force-3d/src/lcg.js
const a = 1664525;
const c = 1013904223;
const m = 4294967296;
function lcg_default() {
	let s = 1;
	return () => (s = (a * s + c) % m) / m;
}
//#endregion
//#region node_modules/.pnpm/d3-force-3d@3.0.6/node_modules/d3-force-3d/src/simulation.js
var MAX_DIMENSIONS = 3;
function x(d) {
	return d.x;
}
function y(d) {
	return d.y;
}
function z(d) {
	return d.z;
}
var initialRadius = 10, initialAngleRoll = Math.PI * (3 - Math.sqrt(5)), initialAngleYaw = Math.PI * 20 / (9 + Math.sqrt(221));
function simulation_default(nodes, numDimensions) {
	numDimensions = numDimensions || 2;
	var nDim = Math.min(MAX_DIMENSIONS, Math.max(1, Math.round(numDimensions))), simulation, alpha = 1, alphaMin = .001, alphaDecay = 1 - Math.pow(alphaMin, 1 / 300), alphaTarget = 0, velocityDecay = .6, forces = /* @__PURE__ */ new Map(), stepper = timer(step), event = dispatch("tick", "end"), random = lcg_default();
	if (nodes == null) nodes = [];
	function step() {
		tick();
		event.call("tick", simulation);
		if (alpha < alphaMin) {
			stepper.stop();
			event.call("end", simulation);
		}
	}
	function tick(iterations) {
		var i, n = nodes.length, node;
		if (iterations === void 0) iterations = 1;
		for (var k = 0; k < iterations; ++k) {
			alpha += (alphaTarget - alpha) * alphaDecay;
			forces.forEach(function(force) {
				force(alpha);
			});
			for (i = 0; i < n; ++i) {
				node = nodes[i];
				if (node.fx == null) node.x += node.vx *= velocityDecay;
				else node.x = node.fx, node.vx = 0;
				if (nDim > 1) if (node.fy == null) node.y += node.vy *= velocityDecay;
				else node.y = node.fy, node.vy = 0;
				if (nDim > 2) if (node.fz == null) node.z += node.vz *= velocityDecay;
				else node.z = node.fz, node.vz = 0;
			}
		}
		return simulation;
	}
	function initializeNodes() {
		for (var i = 0, n = nodes.length, node; i < n; ++i) {
			node = nodes[i], node.index = i;
			if (node.fx != null) node.x = node.fx;
			if (node.fy != null) node.y = node.fy;
			if (node.fz != null) node.z = node.fz;
			if (isNaN(node.x) || nDim > 1 && isNaN(node.y) || nDim > 2 && isNaN(node.z)) {
				var radius = initialRadius * (nDim > 2 ? Math.cbrt(.5 + i) : nDim > 1 ? Math.sqrt(.5 + i) : i), rollAngle = i * initialAngleRoll, yawAngle = i * initialAngleYaw;
				if (nDim === 1) node.x = radius;
				else if (nDim === 2) {
					node.x = radius * Math.cos(rollAngle);
					node.y = radius * Math.sin(rollAngle);
				} else {
					node.x = radius * Math.sin(rollAngle) * Math.cos(yawAngle);
					node.y = radius * Math.cos(rollAngle);
					node.z = radius * Math.sin(rollAngle) * Math.sin(yawAngle);
				}
			}
			if (isNaN(node.vx) || nDim > 1 && isNaN(node.vy) || nDim > 2 && isNaN(node.vz)) {
				node.vx = 0;
				if (nDim > 1) node.vy = 0;
				if (nDim > 2) node.vz = 0;
			}
		}
	}
	function initializeForce(force) {
		if (force.initialize) force.initialize(nodes, random, nDim);
		return force;
	}
	initializeNodes();
	return simulation = {
		tick,
		restart: function() {
			return stepper.restart(step), simulation;
		},
		stop: function() {
			return stepper.stop(), simulation;
		},
		numDimensions: function(_) {
			return arguments.length ? (nDim = Math.min(MAX_DIMENSIONS, Math.max(1, Math.round(_))), forces.forEach(initializeForce), simulation) : nDim;
		},
		nodes: function(_) {
			return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
		},
		alpha: function(_) {
			return arguments.length ? (alpha = +_, simulation) : alpha;
		},
		alphaMin: function(_) {
			return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
		},
		alphaDecay: function(_) {
			return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
		},
		alphaTarget: function(_) {
			return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
		},
		velocityDecay: function(_) {
			return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
		},
		randomSource: function(_) {
			return arguments.length ? (random = _, forces.forEach(initializeForce), simulation) : random;
		},
		force: function(name, _) {
			return arguments.length > 1 ? (_ == null ? forces.delete(name) : forces.set(name, initializeForce(_)), simulation) : forces.get(name);
		},
		find: function() {
			var args = Array.prototype.slice.call(arguments);
			var x = args.shift() || 0, y = (nDim > 1 ? args.shift() : null) || 0, z = (nDim > 2 ? args.shift() : null) || 0, radius = args.shift() || Infinity;
			var i = 0, n = nodes.length, dx, dy, dz, d2, node, closest;
			radius *= radius;
			for (i = 0; i < n; ++i) {
				node = nodes[i];
				dx = x - node.x;
				dy = y - (node.y || 0);
				dz = z - (node.z || 0);
				d2 = dx * dx + dy * dy + dz * dz;
				if (d2 < radius) closest = node, radius = d2;
			}
			return closest;
		},
		on: function(name, _) {
			return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
		}
	};
}
//#endregion
//#region node_modules/.pnpm/d3-force-3d@3.0.6/node_modules/d3-force-3d/src/manyBody.js
function manyBody_default() {
	var nodes, nDim, node, random, alpha, strength = constant_default(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta2 = .81;
	function force(_) {
		var i, n = nodes.length, tree = (nDim === 1 ? binarytree(nodes, x) : nDim === 2 ? quadtree(nodes, x, y) : nDim === 3 ? octree(nodes, x, y, z) : null).visitAfter(accumulate);
		for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
	}
	function initialize() {
		if (!nodes) return;
		var i, n = nodes.length, node;
		strengths = new Array(n);
		for (i = 0; i < n; ++i) node = nodes[i], strengths[node.index] = +strength(node, i, nodes);
	}
	function accumulate(treeNode) {
		var strength = 0, q, c, weight = 0, x, y, z, i;
		var numChildren = treeNode.length;
		if (numChildren) {
			for (x = y = z = i = 0; i < numChildren; ++i) if ((q = treeNode[i]) && (c = Math.abs(q.value))) strength += q.value, weight += c, x += c * (q.x || 0), y += c * (q.y || 0), z += c * (q.z || 0);
			strength *= Math.sqrt(4 / numChildren);
			treeNode.x = x / weight;
			if (nDim > 1) treeNode.y = y / weight;
			if (nDim > 2) treeNode.z = z / weight;
		} else {
			q = treeNode;
			q.x = q.data.x;
			if (nDim > 1) q.y = q.data.y;
			if (nDim > 2) q.z = q.data.z;
			do
				strength += strengths[q.data.index];
			while (q = q.next);
		}
		treeNode.value = strength;
	}
	function apply(treeNode, x1, arg1, arg2, arg3) {
		if (!treeNode.value) return true;
		var x2 = [
			arg1,
			arg2,
			arg3
		][nDim - 1];
		var x = treeNode.x - node.x, y = nDim > 1 ? treeNode.y - node.y : 0, z = nDim > 2 ? treeNode.z - node.z : 0, w = x2 - x1, l = x * x + y * y + z * z;
		if (w * w / theta2 < l) {
			if (l < distanceMax2) {
				if (x === 0) x = jiggle_default(random), l += x * x;
				if (nDim > 1 && y === 0) y = jiggle_default(random), l += y * y;
				if (nDim > 2 && z === 0) z = jiggle_default(random), l += z * z;
				if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
				node.vx += x * treeNode.value * alpha / l;
				if (nDim > 1) node.vy += y * treeNode.value * alpha / l;
				if (nDim > 2) node.vz += z * treeNode.value * alpha / l;
			}
			return true;
		} else if (treeNode.length || l >= distanceMax2) return;
		if (treeNode.data !== node || treeNode.next) {
			if (x === 0) x = jiggle_default(random), l += x * x;
			if (nDim > 1 && y === 0) y = jiggle_default(random), l += y * y;
			if (nDim > 2 && z === 0) z = jiggle_default(random), l += z * z;
			if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
		}
		do
			if (treeNode.data !== node) {
				w = strengths[treeNode.data.index] * alpha / l;
				node.vx += x * w;
				if (nDim > 1) node.vy += y * w;
				if (nDim > 2) node.vz += z * w;
			}
		while (treeNode = treeNode.next);
	}
	force.initialize = function(_nodes, ...args) {
		nodes = _nodes;
		random = args.find((arg) => typeof arg === "function") || Math.random;
		nDim = args.find((arg) => [
			1,
			2,
			3
		].includes(arg)) || 2;
		initialize();
	};
	force.strength = function(_) {
		return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : strength;
	};
	force.distanceMin = function(_) {
		return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
	};
	force.distanceMax = function(_) {
		return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
	};
	force.theta = function(_) {
		return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
	};
	return force;
}
//#endregion
//#region node_modules/.pnpm/d3-force-3d@3.0.6/node_modules/d3-force-3d/src/radial.js
function radial_default(radius, x, y, z) {
	var nodes, nDim, strength = constant_default(.1), strengths, radiuses;
	if (typeof radius !== "function") radius = constant_default(+radius);
	if (x == null) x = 0;
	if (y == null) y = 0;
	if (z == null) z = 0;
	function force(alpha) {
		for (var i = 0, n = nodes.length; i < n; ++i) {
			var node = nodes[i], dx = node.x - x || 1e-6, dy = (node.y || 0) - y || 1e-6, dz = (node.z || 0) - z || 1e-6, r = Math.sqrt(dx * dx + dy * dy + dz * dz), k = (radiuses[i] - r) * strengths[i] * alpha / r;
			node.vx += dx * k;
			if (nDim > 1) node.vy += dy * k;
			if (nDim > 2) node.vz += dz * k;
		}
	}
	function initialize() {
		if (!nodes) return;
		var i, n = nodes.length;
		strengths = new Array(n);
		radiuses = new Array(n);
		for (i = 0; i < n; ++i) {
			radiuses[i] = +radius(nodes[i], i, nodes);
			strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
		}
	}
	force.initialize = function(initNodes, ...args) {
		nodes = initNodes;
		nDim = args.find((arg) => [
			1,
			2,
			3
		].includes(arg)) || 2;
		initialize();
	};
	force.strength = function(_) {
		return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : strength;
	};
	force.radius = function(_) {
		return arguments.length ? (radius = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : radius;
	};
	force.x = function(_) {
		return arguments.length ? (x = +_, force) : x;
	};
	force.y = function(_) {
		return arguments.length ? (y = +_, force) : y;
	};
	force.z = function(_) {
		return arguments.length ? (z = +_, force) : z;
	};
	return force;
}
//#endregion
//#region node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/utils.js
const { abs: abs$1, cos: cos$1, sin: sin$1, acos: acos$1, atan2, sqrt: sqrt$1, pow } = Math;
function crt(v) {
	return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
}
const pi$1 = Math.PI, tau = 2 * pi$1, quart = pi$1 / 2, epsilon = 1e-6, nMax = Number.MAX_SAFE_INTEGER || 9007199254740991, nMin = Number.MIN_SAFE_INTEGER || -9007199254740991, ZERO = {
	x: 0,
	y: 0,
	z: 0
};
const utils = {
	Tvalues: [
		-.06405689286260563,
		.06405689286260563,
		-.1911188674736163,
		.1911188674736163,
		-.3150426796961634,
		.3150426796961634,
		-.4337935076260451,
		.4337935076260451,
		-.5454214713888396,
		.5454214713888396,
		-.6480936519369755,
		.6480936519369755,
		-.7401241915785544,
		.7401241915785544,
		-.820001985973903,
		.820001985973903,
		-.8864155270044011,
		.8864155270044011,
		-.9382745520027328,
		.9382745520027328,
		-.9747285559713095,
		.9747285559713095,
		-.9951872199970213,
		.9951872199970213
	],
	Cvalues: [
		.12793819534675216,
		.12793819534675216,
		.1258374563468283,
		.1258374563468283,
		.12167047292780339,
		.12167047292780339,
		.1155056680537256,
		.1155056680537256,
		.10744427011596563,
		.10744427011596563,
		.09761865210411388,
		.09761865210411388,
		.08619016153195327,
		.08619016153195327,
		.0733464814110803,
		.0733464814110803,
		.05929858491543678,
		.05929858491543678,
		.04427743881741981,
		.04427743881741981,
		.028531388628933663,
		.028531388628933663,
		.0123412297999872,
		.0123412297999872
	],
	arcfn: function(t, derivativeFn) {
		const d = derivativeFn(t);
		let l = d.x * d.x + d.y * d.y;
		if (typeof d.z !== "undefined") l += d.z * d.z;
		return sqrt$1(l);
	},
	compute: function(t, points, _3d) {
		if (t === 0) {
			points[0].t = 0;
			return points[0];
		}
		const order = points.length - 1;
		if (t === 1) {
			points[order].t = 1;
			return points[order];
		}
		const mt = 1 - t;
		let p = points;
		if (order === 0) {
			points[0].t = t;
			return points[0];
		}
		if (order === 1) {
			const ret = {
				x: mt * p[0].x + t * p[1].x,
				y: mt * p[0].y + t * p[1].y,
				t
			};
			if (_3d) ret.z = mt * p[0].z + t * p[1].z;
			return ret;
		}
		if (order < 4) {
			let mt2 = mt * mt, t2 = t * t, a, b, c, d = 0;
			if (order === 2) {
				p = [
					p[0],
					p[1],
					p[2],
					ZERO
				];
				a = mt2;
				b = mt * t * 2;
				c = t2;
			} else if (order === 3) {
				a = mt2 * mt;
				b = mt2 * t * 3;
				c = mt * t2 * 3;
				d = t * t2;
			}
			const ret = {
				x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
				y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
				t
			};
			if (_3d) ret.z = a * p[0].z + b * p[1].z + c * p[2].z + d * p[3].z;
			return ret;
		}
		const dCpts = JSON.parse(JSON.stringify(points));
		while (dCpts.length > 1) {
			for (let i = 0; i < dCpts.length - 1; i++) {
				dCpts[i] = {
					x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t,
					y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t
				};
				if (typeof dCpts[i].z !== "undefined") dCpts[i].z = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t;
			}
			dCpts.splice(dCpts.length - 1, 1);
		}
		dCpts[0].t = t;
		return dCpts[0];
	},
	computeWithRatios: function(t, points, ratios, _3d) {
		const mt = 1 - t, r = ratios, p = points;
		let f1 = r[0], f2 = r[1], f3 = r[2], f4 = r[3], d;
		f1 *= mt;
		f2 *= t;
		if (p.length === 2) {
			d = f1 + f2;
			return {
				x: (f1 * p[0].x + f2 * p[1].x) / d,
				y: (f1 * p[0].y + f2 * p[1].y) / d,
				z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z) / d,
				t
			};
		}
		f1 *= mt;
		f2 *= 2 * mt;
		f3 *= t * t;
		if (p.length === 3) {
			d = f1 + f2 + f3;
			return {
				x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x) / d,
				y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y) / d,
				z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z) / d,
				t
			};
		}
		f1 *= mt;
		f2 *= 1.5 * mt;
		f3 *= 3 * mt;
		f4 *= t * t * t;
		if (p.length === 4) {
			d = f1 + f2 + f3 + f4;
			return {
				x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x + f4 * p[3].x) / d,
				y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y + f4 * p[3].y) / d,
				z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z + f4 * p[3].z) / d,
				t
			};
		}
	},
	derive: function(points, _3d) {
		const dpoints = [];
		for (let p = points, d = p.length, c = d - 1; d > 1; d--, c--) {
			const list = [];
			for (let j = 0, dpt; j < c; j++) {
				dpt = {
					x: c * (p[j + 1].x - p[j].x),
					y: c * (p[j + 1].y - p[j].y)
				};
				if (_3d) dpt.z = c * (p[j + 1].z - p[j].z);
				list.push(dpt);
			}
			dpoints.push(list);
			p = list;
		}
		return dpoints;
	},
	between: function(v, m, M) {
		return m <= v && v <= M || utils.approximately(v, m) || utils.approximately(v, M);
	},
	approximately: function(a, b, precision) {
		return abs$1(a - b) <= (precision || epsilon);
	},
	length: function(derivativeFn) {
		const z = .5, len = utils.Tvalues.length;
		let sum = 0;
		for (let i = 0, t; i < len; i++) {
			t = z * utils.Tvalues[i] + z;
			sum += utils.Cvalues[i] * utils.arcfn(t, derivativeFn);
		}
		return z * sum;
	},
	map: function(v, ds, de, ts, te) {
		const d1 = de - ds;
		return ts + (te - ts) * ((v - ds) / d1);
	},
	lerp: function(r, v1, v2) {
		const ret = {
			x: v1.x + r * (v2.x - v1.x),
			y: v1.y + r * (v2.y - v1.y)
		};
		if (v1.z !== void 0 && v2.z !== void 0) ret.z = v1.z + r * (v2.z - v1.z);
		return ret;
	},
	pointToString: function(p) {
		let s = p.x + "/" + p.y;
		if (typeof p.z !== "undefined") s += "/" + p.z;
		return s;
	},
	pointsToString: function(points) {
		return "[" + points.map(utils.pointToString).join(", ") + "]";
	},
	copy: function(obj) {
		return JSON.parse(JSON.stringify(obj));
	},
	angle: function(o, v1, v2) {
		const dx1 = v1.x - o.x, dy1 = v1.y - o.y, dx2 = v2.x - o.x, dy2 = v2.y - o.y;
		return atan2(dx1 * dy2 - dy1 * dx2, dx1 * dx2 + dy1 * dy2);
	},
	round: function(v, d) {
		const s = "" + v;
		const pos = s.indexOf(".");
		return parseFloat(s.substring(0, pos + 1 + d));
	},
	dist: function(p1, p2) {
		const dx = p1.x - p2.x, dy = p1.y - p2.y;
		return sqrt$1(dx * dx + dy * dy);
	},
	closest: function(LUT, point) {
		let mdist = pow(2, 63), mpos, d;
		LUT.forEach(function(p, idx) {
			d = utils.dist(point, p);
			if (d < mdist) {
				mdist = d;
				mpos = idx;
			}
		});
		return {
			mdist,
			mpos
		};
	},
	abcratio: function(t, n) {
		if (n !== 2 && n !== 3) return false;
		if (typeof t === "undefined") t = .5;
		else if (t === 0 || t === 1) return t;
		const bottom = pow(t, n) + pow(1 - t, n);
		return abs$1((bottom - 1) / bottom);
	},
	projectionratio: function(t, n) {
		if (n !== 2 && n !== 3) return false;
		if (typeof t === "undefined") t = .5;
		else if (t === 0 || t === 1) return t;
		const top = pow(1 - t, n);
		return top / (pow(t, n) + top);
	},
	lli8: function(x1, y1, x2, y2, x3, y3, x4, y4) {
		const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4), ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4), d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (d == 0) return false;
		return {
			x: nx / d,
			y: ny / d
		};
	},
	lli4: function(p1, p2, p3, p4) {
		const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
		return utils.lli8(x1, y1, x2, y2, x3, y3, x4, y4);
	},
	lli: function(v1, v2) {
		return utils.lli4(v1, v1.c, v2, v2.c);
	},
	makeline: function(p1, p2) {
		return new Bezier(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, p2.x, p2.y);
	},
	findbbox: function(sections) {
		let mx = nMax, my = nMax, MX = nMin, MY = nMin;
		sections.forEach(function(s) {
			const bbox = s.bbox();
			if (mx > bbox.x.min) mx = bbox.x.min;
			if (my > bbox.y.min) my = bbox.y.min;
			if (MX < bbox.x.max) MX = bbox.x.max;
			if (MY < bbox.y.max) MY = bbox.y.max;
		});
		return {
			x: {
				min: mx,
				mid: (mx + MX) / 2,
				max: MX,
				size: MX - mx
			},
			y: {
				min: my,
				mid: (my + MY) / 2,
				max: MY,
				size: MY - my
			}
		};
	},
	shapeintersections: function(s1, bbox1, s2, bbox2, curveIntersectionThreshold) {
		if (!utils.bboxoverlap(bbox1, bbox2)) return [];
		const intersections = [];
		const a1 = [
			s1.startcap,
			s1.forward,
			s1.back,
			s1.endcap
		];
		const a2 = [
			s2.startcap,
			s2.forward,
			s2.back,
			s2.endcap
		];
		a1.forEach(function(l1) {
			if (l1.virtual) return;
			a2.forEach(function(l2) {
				if (l2.virtual) return;
				const iss = l1.intersects(l2, curveIntersectionThreshold);
				if (iss.length > 0) {
					iss.c1 = l1;
					iss.c2 = l2;
					iss.s1 = s1;
					iss.s2 = s2;
					intersections.push(iss);
				}
			});
		});
		return intersections;
	},
	makeshape: function(forward, back, curveIntersectionThreshold) {
		const bpl = back.points.length;
		const fpl = forward.points.length;
		const start = utils.makeline(back.points[bpl - 1], forward.points[0]);
		const end = utils.makeline(forward.points[fpl - 1], back.points[0]);
		const shape = {
			startcap: start,
			forward,
			back,
			endcap: end,
			bbox: utils.findbbox([
				start,
				forward,
				back,
				end
			])
		};
		shape.intersections = function(s2) {
			return utils.shapeintersections(shape, shape.bbox, s2, s2.bbox, curveIntersectionThreshold);
		};
		return shape;
	},
	getminmax: function(curve, d, list) {
		if (!list) return {
			min: 0,
			max: 0
		};
		let min = nMax, max = nMin, t, c;
		if (list.indexOf(0) === -1) list = [0].concat(list);
		if (list.indexOf(1) === -1) list.push(1);
		for (let i = 0, len = list.length; i < len; i++) {
			t = list[i];
			c = curve.get(t);
			if (c[d] < min) min = c[d];
			if (c[d] > max) max = c[d];
		}
		return {
			min,
			mid: (min + max) / 2,
			max,
			size: max - min
		};
	},
	align: function(points, line) {
		const tx = line.p1.x, ty = line.p1.y, a = -atan2(line.p2.y - ty, line.p2.x - tx), d = function(v) {
			return {
				x: (v.x - tx) * cos$1(a) - (v.y - ty) * sin$1(a),
				y: (v.x - tx) * sin$1(a) + (v.y - ty) * cos$1(a)
			};
		};
		return points.map(d);
	},
	roots: function(points, line) {
		line = line || {
			p1: {
				x: 0,
				y: 0
			},
			p2: {
				x: 1,
				y: 0
			}
		};
		const order = points.length - 1;
		const aligned = utils.align(points, line);
		const reduce = function(t) {
			return 0 <= t && t <= 1;
		};
		if (order === 2) {
			const a = aligned[0].y, b = aligned[1].y, c = aligned[2].y, d = a - 2 * b + c;
			if (d !== 0) {
				const m1 = -sqrt$1(b * b - a * c), m2 = -a + b;
				return [-(m1 + m2) / d, -(-m1 + m2) / d].filter(reduce);
			} else if (b !== c && d === 0) return [(2 * b - c) / (2 * b - 2 * c)].filter(reduce);
			return [];
		}
		const pa = aligned[0].y, pb = aligned[1].y, pc = aligned[2].y, pd = aligned[3].y;
		let d = -pa + 3 * pb - 3 * pc + pd, a = 3 * pa - 6 * pb + 3 * pc, b = -3 * pa + 3 * pb, c = pa;
		if (utils.approximately(d, 0)) {
			if (utils.approximately(a, 0)) {
				if (utils.approximately(b, 0)) return [];
				return [-c / b].filter(reduce);
			}
			const q = sqrt$1(b * b - 4 * a * c), a2 = 2 * a;
			return [(q - b) / a2, (-b - q) / a2].filter(reduce);
		}
		a /= d;
		b /= d;
		c /= d;
		const p = (3 * b - a * a) / 3, p3 = p / 3, q = (2 * a * a * a - 9 * a * b + 27 * c) / 27, q2 = q / 2, discriminant = q2 * q2 + p3 * p3 * p3;
		let u1, v1, x1, x2, x3;
		if (discriminant < 0) {
			const mp3 = -p / 3, r = sqrt$1(mp3 * mp3 * mp3), t = -q / (2 * r), phi = acos$1(t < -1 ? -1 : t > 1 ? 1 : t), t1 = 2 * crt(r);
			x1 = t1 * cos$1(phi / 3) - a / 3;
			x2 = t1 * cos$1((phi + tau) / 3) - a / 3;
			x3 = t1 * cos$1((phi + 2 * tau) / 3) - a / 3;
			return [
				x1,
				x2,
				x3
			].filter(reduce);
		} else if (discriminant === 0) {
			u1 = q2 < 0 ? crt(-q2) : -crt(q2);
			x1 = 2 * u1 - a / 3;
			x2 = -u1 - a / 3;
			return [x1, x2].filter(reduce);
		} else {
			const sd = sqrt$1(discriminant);
			u1 = crt(-q2 + sd);
			v1 = crt(q2 + sd);
			return [u1 - v1 - a / 3].filter(reduce);
		}
	},
	droots: function(p) {
		if (p.length === 3) {
			const a = p[0], b = p[1], c = p[2], d = a - 2 * b + c;
			if (d !== 0) {
				const m1 = -sqrt$1(b * b - a * c), m2 = -a + b;
				return [-(m1 + m2) / d, -(-m1 + m2) / d];
			} else if (b !== c && d === 0) return [(2 * b - c) / (2 * (b - c))];
			return [];
		}
		if (p.length === 2) {
			const a = p[0], b = p[1];
			if (a !== b) return [a / (a - b)];
			return [];
		}
		return [];
	},
	curvature: function(t, d1, d2, _3d, kOnly) {
		let num, dnm, adk, dk, k = 0, r = 0;
		const d = utils.compute(t, d1);
		const dd = utils.compute(t, d2);
		const qdsum = d.x * d.x + d.y * d.y;
		if (_3d) {
			num = sqrt$1(pow(d.y * dd.z - dd.y * d.z, 2) + pow(d.z * dd.x - dd.z * d.x, 2) + pow(d.x * dd.y - dd.x * d.y, 2));
			dnm = pow(qdsum + d.z * d.z, 3 / 2);
		} else {
			num = d.x * dd.y - d.y * dd.x;
			dnm = pow(qdsum, 3 / 2);
		}
		if (num === 0 || dnm === 0) return {
			k: 0,
			r: 0
		};
		k = num / dnm;
		r = dnm / num;
		if (!kOnly) {
			const pk = utils.curvature(t - .001, d1, d2, _3d, true).k;
			const nk = utils.curvature(t + .001, d1, d2, _3d, true).k;
			dk = (nk - k + (k - pk)) / 2;
			adk = (abs$1(nk - k) + abs$1(k - pk)) / 2;
		}
		return {
			k,
			r,
			dk,
			adk
		};
	},
	inflections: function(points) {
		if (points.length < 4) return [];
		const p = utils.align(points, {
			p1: points[0],
			p2: points.slice(-1)[0]
		}), a = p[2].x * p[1].y, b = p[3].x * p[1].y, c = p[1].x * p[2].y, d = p[3].x * p[2].y, v1 = 18 * (-3 * a + 2 * b + 3 * c - d), v2 = 18 * (3 * a - b - 3 * c), v3 = 18 * (c - a);
		if (utils.approximately(v1, 0)) {
			if (!utils.approximately(v2, 0)) {
				let t = -v3 / v2;
				if (0 <= t && t <= 1) return [t];
			}
			return [];
		}
		const d2 = 2 * v1;
		if (utils.approximately(d2, 0)) return [];
		const trm = v2 * v2 - 4 * v1 * v3;
		if (trm < 0) return [];
		const sq = Math.sqrt(trm);
		return [(sq - v2) / d2, -(v2 + sq) / d2].filter(function(r) {
			return 0 <= r && r <= 1;
		});
	},
	bboxoverlap: function(b1, b2) {
		const dims = ["x", "y"], len = dims.length;
		for (let i = 0, dim, l, t, d; i < len; i++) {
			dim = dims[i];
			l = b1[dim].mid;
			t = b2[dim].mid;
			d = (b1[dim].size + b2[dim].size) / 2;
			if (abs$1(l - t) >= d) return false;
		}
		return true;
	},
	expandbox: function(bbox, _bbox) {
		if (_bbox.x.min < bbox.x.min) bbox.x.min = _bbox.x.min;
		if (_bbox.y.min < bbox.y.min) bbox.y.min = _bbox.y.min;
		if (_bbox.z && _bbox.z.min < bbox.z.min) bbox.z.min = _bbox.z.min;
		if (_bbox.x.max > bbox.x.max) bbox.x.max = _bbox.x.max;
		if (_bbox.y.max > bbox.y.max) bbox.y.max = _bbox.y.max;
		if (_bbox.z && _bbox.z.max > bbox.z.max) bbox.z.max = _bbox.z.max;
		bbox.x.mid = (bbox.x.min + bbox.x.max) / 2;
		bbox.y.mid = (bbox.y.min + bbox.y.max) / 2;
		if (bbox.z) bbox.z.mid = (bbox.z.min + bbox.z.max) / 2;
		bbox.x.size = bbox.x.max - bbox.x.min;
		bbox.y.size = bbox.y.max - bbox.y.min;
		if (bbox.z) bbox.z.size = bbox.z.max - bbox.z.min;
	},
	pairiteration: function(c1, c2, curveIntersectionThreshold) {
		const c1b = c1.bbox(), c2b = c2.bbox(), r = 1e5, threshold = curveIntersectionThreshold || .5;
		if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) return [(r * (c1._t1 + c1._t2) / 2 | 0) / r + "/" + (r * (c2._t1 + c2._t2) / 2 | 0) / r];
		let cc1 = c1.split(.5), cc2 = c2.split(.5), pairs = [
			{
				left: cc1.left,
				right: cc2.left
			},
			{
				left: cc1.left,
				right: cc2.right
			},
			{
				left: cc1.right,
				right: cc2.right
			},
			{
				left: cc1.right,
				right: cc2.left
			}
		];
		pairs = pairs.filter(function(pair) {
			return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
		});
		let results = [];
		if (pairs.length === 0) return results;
		pairs.forEach(function(pair) {
			results = results.concat(utils.pairiteration(pair.left, pair.right, threshold));
		});
		results = results.filter(function(v, i) {
			return results.indexOf(v) === i;
		});
		return results;
	},
	getccenter: function(p1, p2, p3) {
		const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y, dx2 = p3.x - p2.x, dy2 = p3.y - p2.y, dx1p = dx1 * cos$1(quart) - dy1 * sin$1(quart), dy1p = dx1 * sin$1(quart) + dy1 * cos$1(quart), dx2p = dx2 * cos$1(quart) - dy2 * sin$1(quart), dy2p = dx2 * sin$1(quart) + dy2 * cos$1(quart), mx1 = (p1.x + p2.x) / 2, my1 = (p1.y + p2.y) / 2, mx2 = (p2.x + p3.x) / 2, my2 = (p2.y + p3.y) / 2, mx1n = mx1 + dx1p, my1n = my1 + dy1p, mx2n = mx2 + dx2p, my2n = my2 + dy2p, arc = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n), r = utils.dist(arc, p1);
		let s = atan2(p1.y - arc.y, p1.x - arc.x), m = atan2(p2.y - arc.y, p2.x - arc.x), e = atan2(p3.y - arc.y, p3.x - arc.x), _;
		if (s < e) {
			if (s > m || m > e) s += tau;
			if (s > e) {
				_ = e;
				e = s;
				s = _;
			}
		} else if (e < m && m < s) {
			_ = e;
			e = s;
			s = _;
		} else e += tau;
		arc.s = s;
		arc.e = e;
		arc.r = r;
		return arc;
	},
	numberSort: function(a, b) {
		return a - b;
	}
};
//#endregion
//#region node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/poly-bezier.js
/**
* Poly Bezier
* @param {[type]} curves [description]
*/
var PolyBezier = class PolyBezier {
	constructor(curves) {
		this.curves = [];
		this._3d = false;
		if (!!curves) {
			this.curves = curves;
			this._3d = this.curves[0]._3d;
		}
	}
	valueOf() {
		return this.toString();
	}
	toString() {
		return "[" + this.curves.map(function(curve) {
			return utils.pointsToString(curve.points);
		}).join(", ") + "]";
	}
	addCurve(curve) {
		this.curves.push(curve);
		this._3d = this._3d || curve._3d;
	}
	length() {
		return this.curves.map(function(v) {
			return v.length();
		}).reduce(function(a, b) {
			return a + b;
		});
	}
	curve(idx) {
		return this.curves[idx];
	}
	bbox() {
		const c = this.curves;
		var bbox = c[0].bbox();
		for (var i = 1; i < c.length; i++) utils.expandbox(bbox, c[i].bbox());
		return bbox;
	}
	offset(d) {
		const offset = [];
		this.curves.forEach(function(v) {
			offset.push(...v.offset(d));
		});
		return new PolyBezier(offset);
	}
};
//#endregion
//#region node_modules/.pnpm/bezier-js@6.1.4/node_modules/bezier-js/src/bezier.js
/**
A javascript Bezier curve library by Pomax.

Based on http://pomax.github.io/bezierinfo

This code is MIT licensed.
**/
const { abs, min, max, cos, sin, acos, sqrt } = Math;
const pi = Math.PI;
/**
* Bezier curve constructor.
*
* ...docs pending...
*/
var Bezier = class Bezier {
	constructor(coords) {
		let args = coords && coords.forEach ? coords : Array.from(arguments).slice();
		let coordlen = false;
		if (typeof args[0] === "object") {
			coordlen = args.length;
			const newargs = [];
			args.forEach(function(point) {
				[
					"x",
					"y",
					"z"
				].forEach(function(d) {
					if (typeof point[d] !== "undefined") newargs.push(point[d]);
				});
			});
			args = newargs;
		}
		let higher = false;
		const len = args.length;
		if (coordlen) {
			if (coordlen > 4) {
				if (arguments.length !== 1) throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
				higher = true;
			}
		} else if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
			if (arguments.length !== 1) throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");
		}
		const _3d = this._3d = !higher && (len === 9 || len === 12) || coords && coords[0] && typeof coords[0].z !== "undefined";
		const points = this.points = [];
		for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
			var point = {
				x: args[idx],
				y: args[idx + 1]
			};
			if (_3d) point.z = args[idx + 2];
			points.push(point);
		}
		const order = this.order = points.length - 1;
		const dims = this.dims = ["x", "y"];
		if (_3d) dims.push("z");
		this.dimlen = dims.length;
		const aligned = utils.align(points, {
			p1: points[0],
			p2: points[order]
		});
		const baselength = utils.dist(points[0], points[order]);
		this._linear = aligned.reduce((t, p) => t + abs(p.y), 0) < baselength / 50;
		this._lut = [];
		this._t1 = 0;
		this._t2 = 1;
		this.update();
	}
	static quadraticFromPoints(p1, p2, p3, t) {
		if (typeof t === "undefined") t = .5;
		if (t === 0) return new Bezier(p2, p2, p3);
		if (t === 1) return new Bezier(p1, p2, p2);
		return new Bezier(p1, Bezier.getABC(2, p1, p2, p3, t).A, p3);
	}
	static cubicFromPoints(S, B, E, t, d1) {
		if (typeof t === "undefined") t = .5;
		const abc = Bezier.getABC(3, S, B, E, t);
		if (typeof d1 === "undefined") d1 = utils.dist(B, abc.C);
		const d2 = d1 * (1 - t) / t;
		const selen = utils.dist(S, E), lx = (E.x - S.x) / selen, ly = (E.y - S.y) / selen, bx1 = d1 * lx, by1 = d1 * ly, bx2 = d2 * lx, by2 = d2 * ly;
		const e1 = {
			x: B.x - bx1,
			y: B.y - by1
		}, e2 = {
			x: B.x + bx2,
			y: B.y + by2
		}, A = abc.A, v1 = {
			x: A.x + (e1.x - A.x) / (1 - t),
			y: A.y + (e1.y - A.y) / (1 - t)
		}, v2 = {
			x: A.x + (e2.x - A.x) / t,
			y: A.y + (e2.y - A.y) / t
		};
		return new Bezier(S, {
			x: S.x + (v1.x - S.x) / t,
			y: S.y + (v1.y - S.y) / t
		}, {
			x: E.x + (v2.x - E.x) / (1 - t),
			y: E.y + (v2.y - E.y) / (1 - t)
		}, E);
	}
	static getUtils() {
		return utils;
	}
	getUtils() {
		return Bezier.getUtils();
	}
	static get PolyBezier() {
		return PolyBezier;
	}
	valueOf() {
		return this.toString();
	}
	toString() {
		return utils.pointsToString(this.points);
	}
	toSVG() {
		if (this._3d) return false;
		const p = this.points, s = [
			"M",
			p[0].x,
			p[0].y,
			this.order === 2 ? "Q" : "C"
		];
		for (let i = 1, last = p.length; i < last; i++) {
			s.push(p[i].x);
			s.push(p[i].y);
		}
		return s.join(" ");
	}
	setRatios(ratios) {
		if (ratios.length !== this.points.length) throw new Error("incorrect number of ratio values");
		this.ratios = ratios;
		this._lut = [];
	}
	verify() {
		const print = this.coordDigest();
		if (print !== this._print) {
			this._print = print;
			this.update();
		}
	}
	coordDigest() {
		return this.points.map(function(c, pos) {
			return "" + pos + c.x + c.y + (c.z ? c.z : 0);
		}).join("");
	}
	update() {
		this._lut = [];
		this.dpoints = utils.derive(this.points, this._3d);
		this.computedirection();
	}
	computedirection() {
		const points = this.points;
		const angle = utils.angle(points[0], points[this.order], points[1]);
		this.clockwise = angle > 0;
	}
	length() {
		return utils.length(this.derivative.bind(this));
	}
	static getABC(order = 2, S, B, E, t = .5) {
		const u = utils.projectionratio(t, order), um = 1 - u, C = {
			x: u * S.x + um * E.x,
			y: u * S.y + um * E.y
		}, s = utils.abcratio(t, order);
		return {
			A: {
				x: B.x + (B.x - C.x) / s,
				y: B.y + (B.y - C.y) / s
			},
			B,
			C,
			S,
			E
		};
	}
	getABC(t, B) {
		B = B || this.get(t);
		let S = this.points[0];
		let E = this.points[this.order];
		return Bezier.getABC(this.order, S, B, E, t);
	}
	getLUT(steps) {
		this.verify();
		steps = steps || 100;
		if (this._lut.length === steps + 1) return this._lut;
		this._lut = [];
		steps++;
		this._lut = [];
		for (let i = 0, p, t; i < steps; i++) {
			t = i / (steps - 1);
			p = this.compute(t);
			p.t = t;
			this._lut.push(p);
		}
		return this._lut;
	}
	on(point, error) {
		error = error || 5;
		const lut = this.getLUT(), hits = [];
		for (let i = 0, c, t = 0; i < lut.length; i++) {
			c = lut[i];
			if (utils.dist(c, point) < error) {
				hits.push(c);
				t += i / lut.length;
			}
		}
		if (!hits.length) return false;
		return t /= hits.length;
	}
	project(point) {
		const LUT = this.getLUT(), l = LUT.length - 1, closest = utils.closest(LUT, point), mpos = closest.mpos, t1 = (mpos - 1) / l, t2 = (mpos + 1) / l, step = .1 / l;
		let mdist = closest.mdist, t = t1, ft = t, p;
		mdist += 1;
		for (let d; t < t2 + step; t += step) {
			p = this.compute(t);
			d = utils.dist(point, p);
			if (d < mdist) {
				mdist = d;
				ft = t;
			}
		}
		ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
		p = this.compute(ft);
		p.t = ft;
		p.d = mdist;
		return p;
	}
	get(t) {
		return this.compute(t);
	}
	point(idx) {
		return this.points[idx];
	}
	compute(t) {
		if (this.ratios) return utils.computeWithRatios(t, this.points, this.ratios, this._3d);
		return utils.compute(t, this.points, this._3d, this.ratios);
	}
	raise() {
		const p = this.points, np = [p[0]], k = p.length;
		for (let i = 1, pi, pim; i < k; i++) {
			pi = p[i];
			pim = p[i - 1];
			np[i] = {
				x: (k - i) / k * pi.x + i / k * pim.x,
				y: (k - i) / k * pi.y + i / k * pim.y
			};
		}
		np[k] = p[k - 1];
		return new Bezier(np);
	}
	derivative(t) {
		return utils.compute(t, this.dpoints[0], this._3d);
	}
	dderivative(t) {
		return utils.compute(t, this.dpoints[1], this._3d);
	}
	align() {
		let p = this.points;
		return new Bezier(utils.align(p, {
			p1: p[0],
			p2: p[p.length - 1]
		}));
	}
	curvature(t) {
		return utils.curvature(t, this.dpoints[0], this.dpoints[1], this._3d);
	}
	inflections() {
		return utils.inflections(this.points);
	}
	normal(t) {
		return this._3d ? this.__normal3(t) : this.__normal2(t);
	}
	__normal2(t) {
		const d = this.derivative(t);
		const q = sqrt(d.x * d.x + d.y * d.y);
		return {
			t,
			x: -d.y / q,
			y: d.x / q
		};
	}
	__normal3(t) {
		const r1 = this.derivative(t), r2 = this.derivative(t + .01), q1 = sqrt(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z), q2 = sqrt(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
		r1.x /= q1;
		r1.y /= q1;
		r1.z /= q1;
		r2.x /= q2;
		r2.y /= q2;
		r2.z /= q2;
		const c = {
			x: r2.y * r1.z - r2.z * r1.y,
			y: r2.z * r1.x - r2.x * r1.z,
			z: r2.x * r1.y - r2.y * r1.x
		};
		const m = sqrt(c.x * c.x + c.y * c.y + c.z * c.z);
		c.x /= m;
		c.y /= m;
		c.z /= m;
		const R = [
			c.x * c.x,
			c.x * c.y - c.z,
			c.x * c.z + c.y,
			c.x * c.y + c.z,
			c.y * c.y,
			c.y * c.z - c.x,
			c.x * c.z - c.y,
			c.y * c.z + c.x,
			c.z * c.z
		];
		return {
			t,
			x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
			y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
			z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
		};
	}
	hull(t) {
		let p = this.points, _p = [], q = [], idx = 0;
		q[idx++] = p[0];
		q[idx++] = p[1];
		q[idx++] = p[2];
		if (this.order === 3) q[idx++] = p[3];
		while (p.length > 1) {
			_p = [];
			for (let i = 0, pt, l = p.length - 1; i < l; i++) {
				pt = utils.lerp(t, p[i], p[i + 1]);
				q[idx++] = pt;
				_p.push(pt);
			}
			p = _p;
		}
		return q;
	}
	split(t1, t2) {
		if (t1 === 0 && !!t2) return this.split(t2).left;
		if (t2 === 1) return this.split(t1).right;
		const q = this.hull(t1);
		const result = {
			left: this.order === 2 ? new Bezier([
				q[0],
				q[3],
				q[5]
			]) : new Bezier([
				q[0],
				q[4],
				q[7],
				q[9]
			]),
			right: this.order === 2 ? new Bezier([
				q[5],
				q[4],
				q[2]
			]) : new Bezier([
				q[9],
				q[8],
				q[6],
				q[3]
			]),
			span: q
		};
		result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
		result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
		result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
		result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2);
		if (!t2) return result;
		t2 = utils.map(t2, t1, 1, 0, 1);
		return result.right.split(t2).left;
	}
	extrema() {
		const result = {};
		let roots = [];
		this.dims.forEach(function(dim) {
			let mfn = function(v) {
				return v[dim];
			};
			let p = this.dpoints[0].map(mfn);
			result[dim] = utils.droots(p);
			if (this.order === 3) {
				p = this.dpoints[1].map(mfn);
				result[dim] = result[dim].concat(utils.droots(p));
			}
			result[dim] = result[dim].filter(function(t) {
				return t >= 0 && t <= 1;
			});
			roots = roots.concat(result[dim].sort(utils.numberSort));
		}.bind(this));
		result.values = roots.sort(utils.numberSort).filter(function(v, idx) {
			return roots.indexOf(v) === idx;
		});
		return result;
	}
	bbox() {
		const extrema = this.extrema(), result = {};
		this.dims.forEach(function(d) {
			result[d] = utils.getminmax(this, d, extrema[d]);
		}.bind(this));
		return result;
	}
	overlaps(curve) {
		const lbbox = this.bbox(), tbbox = curve.bbox();
		return utils.bboxoverlap(lbbox, tbbox);
	}
	offset(t, d) {
		if (typeof d !== "undefined") {
			const c = this.get(t), n = this.normal(t);
			const ret = {
				c,
				n,
				x: c.x + n.x * d,
				y: c.y + n.y * d
			};
			if (this._3d) ret.z = c.z + n.z * d;
			return ret;
		}
		if (this._linear) {
			const nv = this.normal(0);
			return [new Bezier(this.points.map(function(p) {
				const ret = {
					x: p.x + t * nv.x,
					y: p.y + t * nv.y
				};
				if (p.z && nv.z) ret.z = p.z + t * nv.z;
				return ret;
			}))];
		}
		return this.reduce().map(function(s) {
			if (s._linear) return s.offset(t)[0];
			return s.scale(t);
		});
	}
	simple() {
		if (this.order === 3) {
			const a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
			const a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
			if (a1 > 0 && a2 < 0 || a1 < 0 && a2 > 0) return false;
		}
		const n1 = this.normal(0);
		const n2 = this.normal(1);
		let s = n1.x * n2.x + n1.y * n2.y;
		if (this._3d) s += n1.z * n2.z;
		return abs(acos(s)) < pi / 3;
	}
	reduce() {
		let i, t1 = 0, t2 = 0, step = .01, segment, pass1 = [], pass2 = [];
		let extrema = this.extrema().values;
		if (extrema.indexOf(0) === -1) extrema = [0].concat(extrema);
		if (extrema.indexOf(1) === -1) extrema.push(1);
		for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
			t2 = extrema[i];
			segment = this.split(t1, t2);
			segment._t1 = t1;
			segment._t2 = t2;
			pass1.push(segment);
			t1 = t2;
		}
		pass1.forEach(function(p1) {
			t1 = 0;
			t2 = 0;
			while (t2 <= 1) for (t2 = t1 + step; t2 <= 1.01; t2 += step) {
				segment = p1.split(t1, t2);
				if (!segment.simple()) {
					t2 -= step;
					if (abs(t1 - t2) < step) return [];
					segment = p1.split(t1, t2);
					segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
					segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
					pass2.push(segment);
					t1 = t2;
					break;
				}
			}
			if (t1 < 1) {
				segment = p1.split(t1, 1);
				segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
				segment._t2 = p1._t2;
				pass2.push(segment);
			}
		});
		return pass2;
	}
	translate(v, d1, d2) {
		d2 = typeof d2 === "number" ? d2 : d1;
		const o = this.order;
		let d = this.points.map((_, i) => (1 - i / o) * d1 + i / o * d2);
		return new Bezier(this.points.map((p, i) => ({
			x: p.x + v.x * d[i],
			y: p.y + v.y * d[i]
		})));
	}
	scale(d) {
		const order = this.order;
		let distanceFn = false;
		if (typeof d === "function") distanceFn = d;
		if (distanceFn && order === 2) return this.raise().scale(distanceFn);
		const clockwise = this.clockwise;
		const points = this.points;
		if (this._linear) return this.translate(this.normal(0), distanceFn ? distanceFn(0) : d, distanceFn ? distanceFn(1) : d);
		const r1 = distanceFn ? distanceFn(0) : d;
		const r2 = distanceFn ? distanceFn(1) : d;
		const v = [this.offset(0, 10), this.offset(1, 10)];
		const np = [];
		const o = utils.lli4(v[0], v[0].c, v[1], v[1].c);
		if (!o) throw new Error("cannot scale this curve. Try reducing it first.");
		[0, 1].forEach(function(t) {
			const p = np[t * order] = utils.copy(points[t * order]);
			p.x += (t ? r2 : r1) * v[t].n.x;
			p.y += (t ? r2 : r1) * v[t].n.y;
		});
		if (!distanceFn) {
			[0, 1].forEach((t) => {
				if (order === 2 && !!t) return;
				const p = np[t * order];
				const d = this.derivative(t);
				const p2 = {
					x: p.x + d.x,
					y: p.y + d.y
				};
				np[t + 1] = utils.lli4(p, p2, o, points[t + 1]);
			});
			return new Bezier(np);
		}
		[0, 1].forEach(function(t) {
			if (order === 2 && !!t) return;
			var p = points[t + 1];
			var ov = {
				x: p.x - o.x,
				y: p.y - o.y
			};
			var rc = distanceFn ? distanceFn((t + 1) / order) : d;
			if (distanceFn && !clockwise) rc = -rc;
			var m = sqrt(ov.x * ov.x + ov.y * ov.y);
			ov.x /= m;
			ov.y /= m;
			np[t + 1] = {
				x: p.x + rc * ov.x,
				y: p.y + rc * ov.y
			};
		});
		return new Bezier(np);
	}
	outline(d1, d2, d3, d4) {
		d2 = d2 === void 0 ? d1 : d2;
		if (this._linear) {
			const n = this.normal(0);
			const start = this.points[0];
			const end = this.points[this.points.length - 1];
			let s, mid, e;
			if (d3 === void 0) {
				d3 = d1;
				d4 = d2;
			}
			s = {
				x: start.x + n.x * d1,
				y: start.y + n.y * d1
			};
			e = {
				x: end.x + n.x * d3,
				y: end.y + n.y * d3
			};
			mid = {
				x: (s.x + e.x) / 2,
				y: (s.y + e.y) / 2
			};
			const fline = [
				s,
				mid,
				e
			];
			s = {
				x: start.x - n.x * d2,
				y: start.y - n.y * d2
			};
			e = {
				x: end.x - n.x * d4,
				y: end.y - n.y * d4
			};
			mid = {
				x: (s.x + e.x) / 2,
				y: (s.y + e.y) / 2
			};
			const bline = [
				e,
				mid,
				s
			];
			const ls = utils.makeline(bline[2], fline[0]);
			const le = utils.makeline(fline[2], bline[0]);
			return new PolyBezier([
				ls,
				new Bezier(fline),
				le,
				new Bezier(bline)
			]);
		}
		const reduced = this.reduce(), len = reduced.length, fcurves = [];
		let bcurves = [], p, alen = 0, tlen = this.length();
		const graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";
		function linearDistanceFunction(s, e, tlen, alen, slen) {
			return function(v) {
				const f1 = alen / tlen, f2 = (alen + slen) / tlen, d = e - s;
				return utils.map(v, 0, 1, s + f1 * d, s + f2 * d);
			};
		}
		reduced.forEach(function(segment) {
			const slen = segment.length();
			if (graduated) {
				fcurves.push(segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen)));
				bcurves.push(segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen)));
			} else {
				fcurves.push(segment.scale(d1));
				bcurves.push(segment.scale(-d2));
			}
			alen += slen;
		});
		bcurves = bcurves.map(function(s) {
			p = s.points;
			if (p[3]) s.points = [
				p[3],
				p[2],
				p[1],
				p[0]
			];
			else s.points = [
				p[2],
				p[1],
				p[0]
			];
			return s;
		}).reverse();
		const fs = fcurves[0].points[0], fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1], bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1], be = bcurves[0].points[0], ls = utils.makeline(bs, fs), le = utils.makeline(fe, be);
		return new PolyBezier([ls].concat(fcurves).concat([le]).concat(bcurves));
	}
	outlineshapes(d1, d2, curveIntersectionThreshold) {
		d2 = d2 || d1;
		const outline = this.outline(d1, d2).curves;
		const shapes = [];
		for (let i = 1, len = outline.length; i < len / 2; i++) {
			const shape = utils.makeshape(outline[i], outline[len - i], curveIntersectionThreshold);
			shape.startcap.virtual = i > 1;
			shape.endcap.virtual = i < len / 2 - 1;
			shapes.push(shape);
		}
		return shapes;
	}
	intersects(curve, curveIntersectionThreshold) {
		if (!curve) return this.selfintersects(curveIntersectionThreshold);
		if (curve.p1 && curve.p2) return this.lineIntersects(curve);
		if (curve instanceof Bezier) curve = curve.reduce();
		return this.curveintersects(this.reduce(), curve, curveIntersectionThreshold);
	}
	lineIntersects(line) {
		const mx = min(line.p1.x, line.p2.x), my = min(line.p1.y, line.p2.y), MX = max(line.p1.x, line.p2.x), MY = max(line.p1.y, line.p2.y);
		return utils.roots(this.points, line).filter((t) => {
			var p = this.get(t);
			return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
		});
	}
	selfintersects(curveIntersectionThreshold) {
		const reduced = this.reduce(), len = reduced.length - 2, results = [];
		for (let i = 0, result, left, right; i < len; i++) {
			left = reduced.slice(i, i + 1);
			right = reduced.slice(i + 2);
			result = this.curveintersects(left, right, curveIntersectionThreshold);
			results.push(...result);
		}
		return results;
	}
	curveintersects(c1, c2, curveIntersectionThreshold) {
		const pairs = [];
		c1.forEach(function(l) {
			c2.forEach(function(r) {
				if (l.overlaps(r)) pairs.push({
					left: l,
					right: r
				});
			});
		});
		let intersections = [];
		pairs.forEach(function(pair) {
			const result = utils.pairiteration(pair.left, pair.right, curveIntersectionThreshold);
			if (result.length > 0) intersections = intersections.concat(result);
		});
		return intersections;
	}
	arcs(errorThreshold) {
		errorThreshold = errorThreshold || .5;
		return this._iterate(errorThreshold, []);
	}
	_error(pc, np1, s, e) {
		const q = (e - s) / 4, c1 = this.get(s + q), c2 = this.get(e - q), ref = utils.dist(pc, np1), d1 = utils.dist(pc, c1), d2 = utils.dist(pc, c2);
		return abs(d1 - ref) + abs(d2 - ref);
	}
	_iterate(errorThreshold, circles) {
		let t_s = 0, t_e = 1, safety;
		do {
			safety = 0;
			t_e = 1;
			let np1 = this.get(t_s), np2, np3, arc, prev_arc;
			let curr_good = false, prev_good = false, done;
			let t_m = t_e, prev_e = 1, step = 0;
			do {
				prev_good = curr_good;
				prev_arc = arc;
				t_m = (t_s + t_e) / 2;
				step++;
				np2 = this.get(t_m);
				np3 = this.get(t_e);
				arc = utils.getccenter(np1, np2, np3);
				arc.interval = {
					start: t_s,
					end: t_e
				};
				curr_good = this._error(arc, np1, t_s, t_e) <= errorThreshold;
				done = prev_good && !curr_good;
				if (!done) prev_e = t_e;
				if (curr_good) {
					if (t_e >= 1) {
						arc.interval.end = prev_e = 1;
						prev_arc = arc;
						if (t_e > 1) {
							let d = {
								x: arc.x + arc.r * cos(arc.e),
								y: arc.y + arc.r * sin(arc.e)
							};
							arc.e += utils.angle({
								x: arc.x,
								y: arc.y
							}, d, this.get(1));
						}
						break;
					}
					t_e = t_e + (t_e - t_s) / 2;
				} else t_e = t_m;
			} while (!done && safety++ < 100);
			if (safety >= 100) break;
			prev_arc = prev_arc ? prev_arc : arc;
			circles.push(prev_arc);
			t_s = prev_e;
		} while (t_e < 1);
		return circles;
	}
};
//#endregion
//#region node_modules/.pnpm/index-array-by@1.4.2/node_modules/index-array-by/dist/index-array-by.mjs
function _arrayLikeToArray$1(r, a) {
	(null == a || a > r.length) && (a = r.length);
	for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	return n;
}
function _arrayWithHoles$1(r) {
	if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles$1(r) {
	if (Array.isArray(r)) return _arrayLikeToArray$1(r);
}
function _iterableToArray$1(r) {
	if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit$1(r, l) {
	var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	if (null != t) {
		var e, n, i, u, a = [], f = !0, o = !1;
		try {
			if (i = (t = t.call(r)).next, 0 === l);
			else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
		} catch (r) {
			o = !0, n = r;
		} finally {
			try {
				if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
			} finally {
				if (o) throw n;
			}
		}
		return a;
	}
}
function _nonIterableRest$1() {
	throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread$1() {
	throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _objectWithoutProperties(e, t) {
	if (null == e) return {};
	var o, r, i = _objectWithoutPropertiesLoose(e, t);
	if (Object.getOwnPropertySymbols) {
		var s = Object.getOwnPropertySymbols(e);
		for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
	}
	return i;
}
function _objectWithoutPropertiesLoose(r, e) {
	if (null == r) return {};
	var t = {};
	for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
		if (e.includes(n)) continue;
		t[n] = r[n];
	}
	return t;
}
function _slicedToArray$1(r, e) {
	return _arrayWithHoles$1(r) || _iterableToArrayLimit$1(r, e) || _unsupportedIterableToArray$1(r, e) || _nonIterableRest$1();
}
function _toConsumableArray$1(r) {
	return _arrayWithoutHoles$1(r) || _iterableToArray$1(r) || _unsupportedIterableToArray$1(r) || _nonIterableSpread$1();
}
function _toPrimitive$1(t, r) {
	if ("object" != typeof t || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r);
		if ("object" != typeof i) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return String(t);
}
function _toPropertyKey$1(t) {
	var i = _toPrimitive$1(t, "string");
	return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray$1(r, a) {
	if (r) {
		if ("string" == typeof r) return _arrayLikeToArray$1(r, a);
		var t = {}.toString.call(r).slice(8, -1);
		return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0;
	}
}
var index = (function() {
	var list = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
	var keyAccessors = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
	var multiItem = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
	var flattenKeys = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
	var keys = (keyAccessors instanceof Array ? keyAccessors.length ? keyAccessors : [void 0] : [keyAccessors]).map(function(key) {
		return {
			keyAccessor: key,
			isProp: !(key instanceof Function)
		};
	});
	var indexedResult = list.reduce(function(res, item) {
		var iterObj = res;
		var itemVal = item;
		keys.forEach(function(_ref, idx) {
			var keyAccessor = _ref.keyAccessor, isProp = _ref.isProp;
			var key;
			if (isProp) {
				var _itemVal = itemVal, propVal = _itemVal[keyAccessor], rest = _objectWithoutProperties(_itemVal, [keyAccessor].map(_toPropertyKey$1));
				key = propVal;
				itemVal = rest;
			} else key = keyAccessor(itemVal, idx);
			if (idx + 1 < keys.length) {
				if (!iterObj.hasOwnProperty(key)) iterObj[key] = {};
				iterObj = iterObj[key];
			} else if (multiItem) {
				if (!iterObj.hasOwnProperty(key)) iterObj[key] = [];
				iterObj[key].push(itemVal);
			} else iterObj[key] = itemVal;
		});
		return res;
	}, {});
	if (multiItem instanceof Function) (function reduce(node) {
		var level = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
		if (level === keys.length) Object.keys(node).forEach(function(k) {
			return node[k] = multiItem(node[k]);
		});
		else Object.values(node).forEach(function(child) {
			return reduce(child, level + 1);
		});
	})(indexedResult);
	var result = indexedResult;
	if (flattenKeys) {
		result = [];
		(function flatten(node) {
			var accKeys = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
			if (accKeys.length === keys.length) result.push({
				keys: accKeys,
				vals: node
			});
			else Object.entries(node).forEach(function(_ref2) {
				var _ref3 = _slicedToArray$1(_ref2, 2), key = _ref3[0], val = _ref3[1];
				return flatten(val, [].concat(_toConsumableArray$1(accKeys), [key]));
			});
		})(indexedResult);
		if (keyAccessors instanceof Array && keyAccessors.length === 0 && result.length === 1) result[0].keys = [];
	}
	return result;
});
//#endregion
//#region node_modules/.pnpm/d3-scale@4.0.2/node_modules/d3-scale/src/init.js
function initRange(domain, range) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			this.range(domain);
			break;
		default:
			this.range(range).domain(domain);
			break;
	}
	return this;
}
//#endregion
//#region node_modules/.pnpm/d3-scale@4.0.2/node_modules/d3-scale/src/ordinal.js
const implicit = Symbol("implicit");
function ordinal() {
	var index = new InternMap(), domain = [], range = [], unknown = implicit;
	function scale(d) {
		let i = index.get(d);
		if (i === void 0) {
			if (unknown !== implicit) return unknown;
			index.set(d, i = domain.push(d) - 1);
		}
		return range[i % range.length];
	}
	scale.domain = function(_) {
		if (!arguments.length) return domain.slice();
		domain = [], index = new InternMap();
		for (const value of _) {
			if (index.has(value)) continue;
			index.set(value, domain.push(value) - 1);
		}
		return scale;
	};
	scale.range = function(_) {
		return arguments.length ? (range = Array.from(_), scale) : range.slice();
	};
	scale.unknown = function(_) {
		return arguments.length ? (unknown = _, scale) : unknown;
	};
	scale.copy = function() {
		return ordinal(domain, range).unknown(unknown);
	};
	initRange.apply(scale, arguments);
	return scale;
}
//#endregion
//#region node_modules/.pnpm/d3-scale-chromatic@3.1.0/node_modules/d3-scale-chromatic/src/colors.js
function colors_default(specifier) {
	var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
	while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
	return colors;
}
//#endregion
//#region node_modules/.pnpm/d3-scale-chromatic@3.1.0/node_modules/d3-scale-chromatic/src/categorical/Paired.js
var Paired_default = colors_default("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");
//#endregion
//#region node_modules/.pnpm/force-graph@1.51.4/node_modules/force-graph/dist/force-graph.mjs
function styleInject(css, ref) {
	if (ref === void 0) ref = {};
	var insertAt = ref.insertAt;
	if (typeof document === "undefined") return;
	var head = document.head || document.getElementsByTagName("head")[0];
	var style = document.createElement("style");
	style.type = "text/css";
	if (insertAt === "top") if (head.firstChild) head.insertBefore(style, head.firstChild);
	else head.appendChild(style);
	else head.appendChild(style);
	if (style.styleSheet) style.styleSheet.cssText = css;
	else style.appendChild(document.createTextNode(css));
}
styleInject(".force-graph-container canvas {\n  display: block;\n  user-select: none;\n  outline: none;\n  -webkit-tap-highlight-color: transparent;\n}\n\n.force-graph-container .clickable {\n  cursor: pointer;\n}\n\n.force-graph-container .grabbable {\n  cursor: move;\n  cursor: grab;\n  cursor: -moz-grab;\n  cursor: -webkit-grab;\n}\n\n.force-graph-container .grabbable:active {\n  cursor: grabbing;\n  cursor: -moz-grabbing;\n  cursor: -webkit-grabbing;\n}\n");
function _arrayLikeToArray(r, a) {
	(null == a || a > r.length) && (a = r.length);
	for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	return n;
}
function _arrayWithHoles(r) {
	if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles(r) {
	if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _construct(t, e, r) {
	if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
	var o = [null];
	o.push.apply(o, e);
	return new (t.bind.apply(t, o))();
}
function _defineProperty(e, r, t) {
	return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: true,
		configurable: true,
		writable: true
	}) : e[r] = t, e;
}
function _isNativeReflectConstruct() {
	try {
		var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
	} catch (t) {}
	return (_isNativeReflectConstruct = function() {
		return !!t;
	})();
}
function _iterableToArray(r) {
	if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit(r, l) {
	var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	if (null != t) {
		var e, n, i, u, a = [], f = true, o = false;
		try {
			if (i = (t = t.call(r)).next, 0 === l);
			else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
		} catch (r) {
			o = true, n = r;
		} finally {
			try {
				if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
			} finally {
				if (o) throw n;
			}
		}
		return a;
	}
}
function _nonIterableRest() {
	throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread() {
	throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r) {
			return Object.getOwnPropertyDescriptor(e, r).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys(Object(t), true).forEach(function(r) {
			_defineProperty(e, r, t[r]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
			Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
		});
	}
	return e;
}
function _slicedToArray(r, e) {
	return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toConsumableArray(r) {
	return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _toPrimitive(t, r) {
	if ("object" != typeof t || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r);
		if ("object" != typeof i) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
	var i = _toPrimitive(t, "string");
	return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
	if (r) {
		if ("string" == typeof r) return _arrayLikeToArray(r, a);
		var t = {}.toString.call(r).slice(8, -1);
		return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
	}
}
var autoColorScale = ordinal(Paired_default);
function autoColorObjects(objects, colorByAccessor, colorField) {
	if (!colorByAccessor || typeof colorField !== "string") return;
	objects.filter(function(obj) {
		return !obj[colorField];
	}).forEach(function(obj) {
		obj[colorField] = autoColorScale(colorByAccessor(obj));
	});
}
function getDagDepths(_ref, idAccessor) {
	var nodes = _ref.nodes, links = _ref.links;
	var _ref2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, _ref2$nodeFilter = _ref2.nodeFilter, nodeFilter = _ref2$nodeFilter === void 0 ? function() {
		return true;
	} : _ref2$nodeFilter, _ref2$onLoopError = _ref2.onLoopError, onLoopError = _ref2$onLoopError === void 0 ? function(loopIds) {
		throw "Invalid DAG structure! Found cycle in node path: ".concat(loopIds.join(" -> "), ".");
	} : _ref2$onLoopError;
	var graph = {};
	nodes.forEach(function(node) {
		return graph[idAccessor(node)] = {
			data: node,
			out: [],
			depth: -1,
			skip: !nodeFilter(node)
		};
	});
	links.forEach(function(_ref3) {
		var source = _ref3.source, target = _ref3.target;
		var sourceId = getNodeId(source);
		var targetId = getNodeId(target);
		if (!graph.hasOwnProperty(sourceId)) throw "Missing source node with id: ".concat(sourceId);
		if (!graph.hasOwnProperty(targetId)) throw "Missing target node with id: ".concat(targetId);
		var sourceNode = graph[sourceId];
		var targetNode = graph[targetId];
		sourceNode.out.push(targetNode);
		function getNodeId(node) {
			return _typeof(node) === "object" ? idAccessor(node) : node;
		}
	});
	var foundLoops = [];
	traverse(Object.values(graph));
	return Object.assign.apply(Object, [{}].concat(_toConsumableArray(Object.entries(graph).filter(function(_ref4) {
		return !_slicedToArray(_ref4, 2)[1].skip;
	}).map(function(_ref6) {
		var _ref7 = _slicedToArray(_ref6, 2), id = _ref7[0], node = _ref7[1];
		return _defineProperty({}, id, node.depth);
	}))));
	function traverse(nodes) {
		var nodeStack = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
		var currentDepth = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
		var _loop = function _loop() {
			var node = nodes[i];
			if (nodeStack.indexOf(node) !== -1) {
				var loop = [].concat(_toConsumableArray(nodeStack.slice(nodeStack.indexOf(node))), [node]).map(function(d) {
					return idAccessor(d.data);
				});
				if (!foundLoops.some(function(foundLoop) {
					return foundLoop.length === loop.length && foundLoop.every(function(id, idx) {
						return id === loop[idx];
					});
				})) {
					foundLoops.push(loop);
					onLoopError(loop);
				}
				return 1;
			}
			if (currentDepth > node.depth) {
				node.depth = currentDepth;
				traverse(node.out, [].concat(_toConsumableArray(nodeStack), [node]), currentDepth + (node.skip ? 0 : 1));
			}
		};
		for (var i = 0, l = nodes.length; i < l; i++) if (_loop()) continue;
	}
}
var DAG_LEVEL_NODE_RATIO = 2;
var notifyRedraw = function notifyRedraw(_, state) {
	return state.onNeedsRedraw && state.onNeedsRedraw();
};
var updDataPhotons = function updDataPhotons(_, state) {
	if (!state.isShadow) {
		var linkParticlesAccessor = index$3(state.linkDirectionalParticles);
		state.graphData.links.forEach(function(link) {
			var numPhotons = Math.round(Math.abs(linkParticlesAccessor(link)));
			if (numPhotons) link.__photons = _toConsumableArray(Array(numPhotons)).map(function() {
				return {};
			});
			else delete link.__photons;
		});
	}
};
var CanvasForceGraph = index$4({
	props: {
		graphData: {
			"default": {
				nodes: [],
				links: []
			},
			onChange: function onChange(_, state) {
				state.engineRunning = false;
				updDataPhotons(_, state);
			}
		},
		dagMode: { onChange: function onChange(dagMode, state) {
			!dagMode && (state.graphData.nodes || []).forEach(function(n) {
				n.fx = n.fy = void 0;
			});
		} },
		dagLevelDistance: {},
		dagNodeFilter: { "default": function _default(node) {
			return true;
		} },
		onDagError: { triggerUpdate: false },
		nodeRelSize: {
			"default": 4,
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		nodeId: { "default": "id" },
		nodeVal: {
			"default": "val",
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		nodeColor: {
			"default": "color",
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		nodeAutoColorBy: {},
		nodeCanvasObject: {
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		nodeCanvasObjectMode: {
			"default": function _default() {
				return "replace";
			},
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		nodeVisibility: {
			"default": true,
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkSource: { "default": "source" },
		linkTarget: { "default": "target" },
		linkVisibility: {
			"default": true,
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkColor: {
			"default": "color",
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkAutoColorBy: {},
		linkLineDash: {
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkWidth: {
			"default": 1,
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkCurvature: {
			"default": 0,
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkCanvasObject: {
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkCanvasObjectMode: {
			"default": function _default() {
				return "replace";
			},
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkDirectionalArrowLength: {
			"default": 0,
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkDirectionalArrowColor: {
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkDirectionalArrowRelPos: {
			"default": .5,
			triggerUpdate: false,
			onChange: notifyRedraw
		},
		linkDirectionalParticles: {
			"default": 0,
			triggerUpdate: false,
			onChange: updDataPhotons
		},
		linkDirectionalParticleSpeed: {
			"default": .01,
			triggerUpdate: false
		},
		linkDirectionalParticleOffset: {
			"default": 0,
			triggerUpdate: false
		},
		linkDirectionalParticleWidth: {
			"default": 4,
			triggerUpdate: false
		},
		linkDirectionalParticleColor: { triggerUpdate: false },
		linkDirectionalParticleCanvasObject: { triggerUpdate: false },
		globalScale: {
			"default": 1,
			triggerUpdate: false
		},
		d3AlphaMin: {
			"default": 0,
			triggerUpdate: false
		},
		d3AlphaDecay: {
			"default": .0228,
			triggerUpdate: false,
			onChange: function onChange(alphaDecay, state) {
				state.forceLayout.alphaDecay(alphaDecay);
			}
		},
		d3AlphaTarget: {
			"default": 0,
			triggerUpdate: false,
			onChange: function onChange(alphaTarget, state) {
				state.forceLayout.alphaTarget(alphaTarget);
			}
		},
		d3VelocityDecay: {
			"default": .4,
			triggerUpdate: false,
			onChange: function onChange(velocityDecay, state) {
				state.forceLayout.velocityDecay(velocityDecay);
			}
		},
		warmupTicks: {
			"default": 0,
			triggerUpdate: false
		},
		cooldownTicks: {
			"default": Infinity,
			triggerUpdate: false
		},
		cooldownTime: {
			"default": 15e3,
			triggerUpdate: false
		},
		onUpdate: {
			"default": function _default() {},
			triggerUpdate: false
		},
		onFinishUpdate: {
			"default": function _default() {},
			triggerUpdate: false
		},
		onEngineTick: {
			"default": function _default() {},
			triggerUpdate: false
		},
		onEngineStop: {
			"default": function _default() {},
			triggerUpdate: false
		},
		onNeedsRedraw: { triggerUpdate: false },
		isShadow: {
			"default": false,
			triggerUpdate: false
		}
	},
	methods: {
		d3Force: function d3Force(state, forceName, forceFn) {
			if (forceFn === void 0) return state.forceLayout.force(forceName);
			state.forceLayout.force(forceName, forceFn);
			return this;
		},
		d3ReheatSimulation: function d3ReheatSimulation(state) {
			state.forceLayout.alpha(1);
			this.resetCountdown();
			return this;
		},
		resetCountdown: function resetCountdown(state) {
			state.cntTicks = 0;
			state.startTickTime = /* @__PURE__ */ new Date();
			state.engineRunning = true;
			return this;
		},
		isEngineRunning: function isEngineRunning(state) {
			return !!state.engineRunning;
		},
		tickFrame: function tickFrame(state) {
			!state.isShadow && layoutTick();
			paintLinks();
			!state.isShadow && paintArrows();
			!state.isShadow && paintPhotons();
			paintNodes();
			return this;
			function layoutTick() {
				if (state.engineRunning) if (++state.cntTicks > state.cooldownTicks || /* @__PURE__ */ new Date() - state.startTickTime > state.cooldownTime || state.d3AlphaMin > 0 && state.forceLayout.alpha() < state.d3AlphaMin) {
					state.engineRunning = false;
					state.onEngineStop();
				} else {
					state.forceLayout.tick();
					state.onEngineTick();
				}
			}
			function paintNodes() {
				var getVisibility = index$3(state.nodeVisibility);
				var getVal = index$3(state.nodeVal);
				var getColor = index$3(state.nodeColor);
				var getNodeCanvasObjectMode = index$3(state.nodeCanvasObjectMode);
				var ctx = state.ctx;
				var padAmount = state.isShadow / state.globalScale;
				var visibleNodes = state.graphData.nodes.filter(getVisibility);
				ctx.save();
				visibleNodes.forEach(function(node) {
					var nodeCanvasObjectMode = getNodeCanvasObjectMode(node);
					if (state.nodeCanvasObject && (nodeCanvasObjectMode === "before" || nodeCanvasObjectMode === "replace")) {
						state.nodeCanvasObject(node, ctx, state.globalScale);
						if (nodeCanvasObjectMode === "replace") {
							ctx.restore();
							return;
						}
					}
					var r = Math.sqrt(Math.max(0, getVal(node) || 1)) * state.nodeRelSize + padAmount;
					ctx.beginPath();
					ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
					ctx.fillStyle = getColor(node) || "rgba(31, 120, 180, 0.92)";
					ctx.fill();
					if (state.nodeCanvasObject && nodeCanvasObjectMode === "after") state.nodeCanvasObject(node, state.ctx, state.globalScale);
				});
				ctx.restore();
			}
			function paintLinks() {
				var getVisibility = index$3(state.linkVisibility);
				var getColor = index$3(state.linkColor);
				var getWidth = index$3(state.linkWidth);
				var getLineDash = index$3(state.linkLineDash);
				var getCurvature = index$3(state.linkCurvature);
				var getLinkCanvasObjectMode = index$3(state.linkCanvasObjectMode);
				var ctx = state.ctx;
				var padAmount = state.isShadow * 2;
				var visibleLinks = state.graphData.links.filter(getVisibility);
				visibleLinks.forEach(calcLinkControlPoints);
				var beforeCustomLinks = [], afterCustomLinks = [], defaultPaintLinks = visibleLinks;
				if (state.linkCanvasObject) {
					var replaceCustomLinks = [], otherCustomLinks = [];
					visibleLinks.forEach(function(d) {
						return ({
							before: beforeCustomLinks,
							after: afterCustomLinks,
							replace: replaceCustomLinks
						}[getLinkCanvasObjectMode(d)] || otherCustomLinks).push(d);
					});
					defaultPaintLinks = [].concat(_toConsumableArray(beforeCustomLinks), afterCustomLinks, otherCustomLinks);
					beforeCustomLinks = beforeCustomLinks.concat(replaceCustomLinks);
				}
				ctx.save();
				beforeCustomLinks.forEach(function(link) {
					return state.linkCanvasObject(link, ctx, state.globalScale);
				});
				ctx.restore();
				var linksPerColor = index(defaultPaintLinks, [
					getColor,
					getWidth,
					getLineDash
				]);
				ctx.save();
				Object.entries(linksPerColor).forEach(function(_ref) {
					var _ref2 = _slicedToArray(_ref, 2), color = _ref2[0], linksPerWidth = _ref2[1];
					var lineColor = !color || color === "undefined" ? "rgba(0,0,0,0.15)" : color;
					Object.entries(linksPerWidth).forEach(function(_ref3) {
						var _ref4 = _slicedToArray(_ref3, 2), width = _ref4[0], linesPerLineDash = _ref4[1];
						var lineWidth = (width || 1) / state.globalScale + padAmount;
						Object.entries(linesPerLineDash).forEach(function(_ref5) {
							var _ref6 = _slicedToArray(_ref5, 2);
							_ref6[0];
							var links = _ref6[1];
							var lineDashSegments = getLineDash(links[0]);
							ctx.beginPath();
							links.forEach(function(link) {
								var start = link.source;
								var end = link.target;
								if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
								ctx.moveTo(start.x, start.y);
								var controlPoints = link.__controlPoints;
								if (!controlPoints) ctx.lineTo(end.x, end.y);
								else ctx[controlPoints.length === 2 ? "quadraticCurveTo" : "bezierCurveTo"].apply(ctx, _toConsumableArray(controlPoints).concat([end.x, end.y]));
							});
							ctx.strokeStyle = lineColor;
							ctx.lineWidth = lineWidth;
							ctx.setLineDash(lineDashSegments || []);
							ctx.stroke();
						});
					});
				});
				ctx.restore();
				ctx.save();
				afterCustomLinks.forEach(function(link) {
					return state.linkCanvasObject(link, ctx, state.globalScale);
				});
				ctx.restore();
				function calcLinkControlPoints(link) {
					var curvature = getCurvature(link);
					if (!curvature) {
						link.__controlPoints = null;
						return;
					}
					var start = link.source;
					var end = link.target;
					if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
					var l = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
					if (l > 0) {
						var a = Math.atan2(end.y - start.y, end.x - start.x);
						var d = l * curvature;
						var cp = {
							x: (start.x + end.x) / 2 + d * Math.cos(a - Math.PI / 2),
							y: (start.y + end.y) / 2 + d * Math.sin(a - Math.PI / 2)
						};
						link.__controlPoints = [cp.x, cp.y];
					} else {
						var _d = curvature * 70;
						link.__controlPoints = [
							end.x,
							end.y - _d,
							end.x + _d,
							end.y
						];
					}
				}
			}
			function paintArrows() {
				var ARROW_WH_RATIO = 1.6;
				var ARROW_VLEN_RATIO = .2;
				var getLength = index$3(state.linkDirectionalArrowLength);
				var getRelPos = index$3(state.linkDirectionalArrowRelPos);
				var getVisibility = index$3(state.linkVisibility);
				var getColor = index$3(state.linkDirectionalArrowColor || state.linkColor);
				var getNodeVal = index$3(state.nodeVal);
				var ctx = state.ctx;
				ctx.save();
				state.graphData.links.filter(getVisibility).forEach(function(link) {
					var arrowLength = getLength(link);
					if (!arrowLength || arrowLength < 0) return;
					var start = link.source;
					var end = link.target;
					if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
					var startR = Math.sqrt(Math.max(0, getNodeVal(start) || 1)) * state.nodeRelSize;
					var endR = Math.sqrt(Math.max(0, getNodeVal(end) || 1)) * state.nodeRelSize;
					var arrowRelPos = Math.min(1, Math.max(0, getRelPos(link)));
					var arrowColor = getColor(link) || "rgba(0,0,0,0.28)";
					var arrowHalfWidth = arrowLength / ARROW_WH_RATIO / 2;
					var bzLine = link.__controlPoints && _construct(Bezier, [start.x, start.y].concat(_toConsumableArray(link.__controlPoints), [end.x, end.y]));
					var getCoordsAlongLine = bzLine ? function(t) {
						return bzLine.get(t);
					} : function(t) {
						return {
							x: start.x + (end.x - start.x) * t || 0,
							y: start.y + (end.y - start.y) * t || 0
						};
					};
					var lineLen = bzLine ? bzLine.length() : Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
					var posAlongLine = startR + arrowLength + (lineLen - startR - endR - arrowLength) * arrowRelPos;
					var arrowHead = getCoordsAlongLine(posAlongLine / lineLen);
					var arrowTail = getCoordsAlongLine((posAlongLine - arrowLength) / lineLen);
					var arrowTailVertex = getCoordsAlongLine((posAlongLine - arrowLength * (1 - ARROW_VLEN_RATIO)) / lineLen);
					var arrowTailAngle = Math.atan2(arrowHead.y - arrowTail.y, arrowHead.x - arrowTail.x) - Math.PI / 2;
					ctx.beginPath();
					ctx.moveTo(arrowHead.x, arrowHead.y);
					ctx.lineTo(arrowTail.x + arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y + arrowHalfWidth * Math.sin(arrowTailAngle));
					ctx.lineTo(arrowTailVertex.x, arrowTailVertex.y);
					ctx.lineTo(arrowTail.x - arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y - arrowHalfWidth * Math.sin(arrowTailAngle));
					ctx.fillStyle = arrowColor;
					ctx.fill();
				});
				ctx.restore();
			}
			function paintPhotons() {
				var getNumPhotons = index$3(state.linkDirectionalParticles);
				var getSpeed = index$3(state.linkDirectionalParticleSpeed);
				var getOffset = index$3(state.linkDirectionalParticleOffset);
				var getDiameter = index$3(state.linkDirectionalParticleWidth);
				var getVisibility = index$3(state.linkVisibility);
				var getColor = index$3(state.linkDirectionalParticleColor || state.linkColor);
				var ctx = state.ctx;
				ctx.save();
				state.graphData.links.filter(getVisibility).forEach(function(link) {
					var numCyclePhotons = getNumPhotons(link);
					if (!link.hasOwnProperty("__photons") || !link.__photons.length) return;
					var start = link.source;
					var end = link.target;
					if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
					var particleSpeed = getSpeed(link);
					var particleOffset = Math.abs(getOffset(link));
					var photons = link.__photons || [];
					var photonR = Math.max(0, getDiameter(link) / 2) / Math.sqrt(state.globalScale);
					ctx.fillStyle = getColor(link) || "rgba(0,0,0,0.28)";
					var bzLine = link.__controlPoints ? _construct(Bezier, [start.x, start.y].concat(_toConsumableArray(link.__controlPoints), [end.x, end.y])) : null;
					var cyclePhotonIdx = 0;
					var needsCleanup = false;
					photons.forEach(function(photon) {
						var singleHop = !!photon.__singleHop;
						if (!photon.hasOwnProperty("__progressRatio")) photon.__progressRatio = singleHop ? particleSpeed < 0 ? 1 : 0 : (cyclePhotonIdx + particleOffset) / numCyclePhotons;
						!singleHop && cyclePhotonIdx++;
						photon.__progressRatio += particleSpeed;
						if (photon.__progressRatio >= 1 || photon.__progressRatio < 0) if (!singleHop) {
							photon.__progressRatio = photon.__progressRatio % 1;
							photon.__progressRatio < 0 && photon.__progressRatio++;
						} else {
							needsCleanup = true;
							return;
						}
						var photonPosRatio = photon.__progressRatio;
						var coords = bzLine ? bzLine.get(photonPosRatio) : {
							x: start.x + (end.x - start.x) * photonPosRatio || 0,
							y: start.y + (end.y - start.y) * photonPosRatio || 0
						};
						if (state.linkDirectionalParticleCanvasObject) state.linkDirectionalParticleCanvasObject(coords.x, coords.y, link, ctx, state.globalScale);
						else {
							ctx.beginPath();
							ctx.arc(coords.x, coords.y, photonR, 0, 2 * Math.PI, false);
							ctx.fill();
						}
					});
					if (needsCleanup) link.__photons = link.__photons.filter(function(photon) {
						return !photon.__singleHop || photon.__progressRatio <= 1 && photon.__progressRatio >= 0;
					});
				});
				ctx.restore();
			}
		},
		emitParticle: function emitParticle(state, link) {
			if (link) {
				!link.__photons && (link.__photons = []);
				link.__photons.push({ __singleHop: true });
			}
			return this;
		}
	},
	stateInit: function stateInit() {
		return {
			forceLayout: simulation_default().force("link", link_default()).force("charge", manyBody_default()).force("center", center_default()).force("dagRadial", null).stop(),
			engineRunning: false
		};
	},
	init: function init(canvasCtx, state) {
		state.ctx = canvasCtx;
	},
	update: function update(state, changedProps) {
		state.engineRunning = false;
		state.onUpdate();
		if (state.nodeAutoColorBy !== null) autoColorObjects(state.graphData.nodes, index$3(state.nodeAutoColorBy), state.nodeColor);
		if (state.linkAutoColorBy !== null) autoColorObjects(state.graphData.links, index$3(state.linkAutoColorBy), state.linkColor);
		state.graphData.links.forEach(function(link) {
			link.source = link[state.linkSource];
			link.target = link[state.linkTarget];
		});
		state.forceLayout.stop().alpha(1).nodes(state.graphData.nodes);
		var linkForce = state.forceLayout.force("link");
		if (linkForce) linkForce.id(function(d) {
			return d[state.nodeId];
		}).links(state.graphData.links);
		var nodeDepths = state.dagMode && getDagDepths(state.graphData, function(node) {
			return node[state.nodeId];
		}, {
			nodeFilter: state.dagNodeFilter,
			onLoopError: state.onDagError || void 0
		});
		var maxDepth = Math.max.apply(Math, _toConsumableArray(Object.values(nodeDepths || [])));
		var dagLevelDistance = state.dagLevelDistance || state.graphData.nodes.length / (maxDepth || 1) * DAG_LEVEL_NODE_RATIO * (["radialin", "radialout"].indexOf(state.dagMode) !== -1 ? .7 : 1);
		if ([
			"lr",
			"rl",
			"td",
			"bu"
		].includes(changedProps.dagMode)) {
			var resetProp = ["lr", "rl"].includes(changedProps.dagMode) ? "fx" : "fy";
			state.graphData.nodes.filter(state.dagNodeFilter).forEach(function(node) {
				return delete node[resetProp];
			});
		}
		if ([
			"lr",
			"rl",
			"td",
			"bu"
		].includes(state.dagMode)) {
			var invert = ["rl", "bu"].includes(state.dagMode);
			var fixFn = function fixFn(node) {
				return (nodeDepths[node[state.nodeId]] - maxDepth / 2) * dagLevelDistance * (invert ? -1 : 1);
			};
			var _resetProp = ["lr", "rl"].includes(state.dagMode) ? "fx" : "fy";
			state.graphData.nodes.filter(state.dagNodeFilter).forEach(function(node) {
				return node[_resetProp] = fixFn(node);
			});
		}
		state.forceLayout.force("dagRadial", ["radialin", "radialout"].indexOf(state.dagMode) !== -1 ? radial_default(function(node) {
			var nodeDepth = nodeDepths[node[state.nodeId]] || -1;
			return (state.dagMode === "radialin" ? maxDepth - nodeDepth : nodeDepth) * dagLevelDistance;
		}).strength(function(node) {
			return state.dagNodeFilter(node) ? 1 : 0;
		}) : null);
		for (var i = 0; i < state.warmupTicks && !(state.d3AlphaMin > 0 && state.forceLayout.alpha() < state.d3AlphaMin); i++) state.forceLayout.tick();
		this.resetCountdown();
		state.onFinishUpdate();
	}
});
function linkKapsule(kapsulePropNames, kapsuleType) {
	var propNames = kapsulePropNames instanceof Array ? kapsulePropNames : [kapsulePropNames];
	var dummyK = new kapsuleType();
	dummyK._destructor && dummyK._destructor();
	return {
		linkProp: function linkProp(prop) {
			return {
				"default": dummyK[prop](),
				onChange: function onChange(v, state) {
					propNames.forEach(function(propName) {
						return state[propName][prop](v);
					});
				},
				triggerUpdate: false
			};
		},
		linkMethod: function linkMethod(method) {
			return function(state) {
				for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) args[_key - 1] = arguments[_key];
				var returnVals = [];
				propNames.forEach(function(propName) {
					var kapsuleInstance = state[propName];
					var returnVal = kapsuleInstance[method].apply(kapsuleInstance, args);
					if (returnVal !== kapsuleInstance) returnVals.push(returnVal);
				});
				return returnVals.length ? returnVals[0] : this;
			};
		}
	};
}
var HOVER_CANVAS_THROTTLE_DELAY = 800;
var ZOOM2NODES_FACTOR = 4;
var DRAG_CLICK_TOLERANCE_PX = 5;
var bindFG = linkKapsule("forceGraph", CanvasForceGraph);
var bindBoth = linkKapsule(["forceGraph", "shadowGraph"], CanvasForceGraph);
var linkedProps = Object.assign.apply(Object, _toConsumableArray([
	"nodeColor",
	"nodeAutoColorBy",
	"nodeCanvasObject",
	"nodeCanvasObjectMode",
	"linkColor",
	"linkAutoColorBy",
	"linkLineDash",
	"linkWidth",
	"linkCanvasObject",
	"linkCanvasObjectMode",
	"linkDirectionalArrowLength",
	"linkDirectionalArrowColor",
	"linkDirectionalArrowRelPos",
	"linkDirectionalParticles",
	"linkDirectionalParticleSpeed",
	"linkDirectionalParticleOffset",
	"linkDirectionalParticleWidth",
	"linkDirectionalParticleColor",
	"linkDirectionalParticleCanvasObject",
	"dagMode",
	"dagLevelDistance",
	"dagNodeFilter",
	"onDagError",
	"d3AlphaMin",
	"d3AlphaDecay",
	"d3VelocityDecay",
	"warmupTicks",
	"cooldownTicks",
	"cooldownTime",
	"onEngineTick",
	"onEngineStop"
].map(function(p) {
	return _defineProperty({}, p, bindFG.linkProp(p));
})).concat(_toConsumableArray([
	"nodeRelSize",
	"nodeId",
	"nodeVal",
	"nodeVisibility",
	"linkSource",
	"linkTarget",
	"linkVisibility",
	"linkCurvature"
].map(function(p) {
	return _defineProperty({}, p, bindBoth.linkProp(p));
}))));
var linkedMethods = Object.assign.apply(Object, _toConsumableArray([
	"d3Force",
	"d3ReheatSimulation",
	"emitParticle"
].map(function(p) {
	return _defineProperty({}, p, bindFG.linkMethod(p));
})));
function adjustCanvasSize(state) {
	if (state.canvas) {
		var curWidth = state.canvas.width;
		var curHeight = state.canvas.height;
		if (curWidth === 300 && curHeight === 150) curWidth = curHeight = 0;
		var pxScale = window.devicePixelRatio;
		curWidth /= pxScale;
		curHeight /= pxScale;
		[state.canvas, state.shadowCanvas].forEach(function(canvas) {
			canvas.style.width = "".concat(state.width, "px");
			canvas.style.height = "".concat(state.height, "px");
			canvas.width = state.width * pxScale;
			canvas.height = state.height * pxScale;
			if (!curWidth && !curHeight) canvas.getContext("2d").scale(pxScale, pxScale);
		});
		var k = transform(state.canvas).k;
		state.zoom.translateBy(state.zoom.__baseElem, (state.width - curWidth) / 2 / k, (state.height - curHeight) / 2 / k);
		state.needsRedraw = true;
	}
}
function resetTransform(ctx) {
	var pxRatio = window.devicePixelRatio;
	ctx.setTransform(pxRatio, 0, 0, pxRatio, 0, 0);
}
function clearCanvas(ctx, width, height) {
	ctx.save();
	resetTransform(ctx);
	ctx.clearRect(0, 0, width, height);
	ctx.restore();
}
var forceGraph = index$4({
	props: _objectSpread2({
		width: {
			"default": window.innerWidth,
			onChange: function onChange(_, state) {
				return adjustCanvasSize(state);
			},
			triggerUpdate: false
		},
		height: {
			"default": window.innerHeight,
			onChange: function onChange(_, state) {
				return adjustCanvasSize(state);
			},
			triggerUpdate: false
		},
		graphData: {
			"default": {
				nodes: [],
				links: []
			},
			onChange: function onChange(d, state) {
				[d.nodes, d.links].every(function(arr) {
					return (arr || []).every(function(d) {
						return !d.hasOwnProperty("__indexColor");
					});
				}) && state.colorTracker.reset();
				[{
					type: "Node",
					objs: d.nodes
				}, {
					type: "Link",
					objs: d.links
				}].forEach(hexIndex);
				state.forceGraph.graphData(d);
				state.shadowGraph.graphData(d);
				function hexIndex(_ref4) {
					var type = _ref4.type;
					_ref4.objs.filter(function(d) {
						if (!d.hasOwnProperty("__indexColor")) return true;
						var cur = state.colorTracker.lookup(d.__indexColor);
						return !cur || !cur.hasOwnProperty("d") || cur.d !== d;
					}).forEach(function(d) {
						d.__indexColor = state.colorTracker.register({
							type,
							d
						});
					});
				}
			},
			triggerUpdate: false
		},
		backgroundColor: {
			onChange: function onChange(color, state) {
				state.canvas && color && (state.canvas.style.background = color);
			},
			triggerUpdate: false
		},
		nodeLabel: {
			"default": "name",
			triggerUpdate: false
		},
		nodePointerAreaPaint: {
			onChange: function onChange(paintFn, state) {
				state.shadowGraph.nodeCanvasObject(!paintFn ? null : function(node, ctx, globalScale) {
					return paintFn(node, node.__indexColor, ctx, globalScale);
				});
				state.flushShadowCanvas && state.flushShadowCanvas();
			},
			triggerUpdate: false
		},
		linkPointerAreaPaint: {
			onChange: function onChange(paintFn, state) {
				state.shadowGraph.linkCanvasObject(!paintFn ? null : function(link, ctx, globalScale) {
					return paintFn(link, link.__indexColor, ctx, globalScale);
				});
				state.flushShadowCanvas && state.flushShadowCanvas();
			},
			triggerUpdate: false
		},
		linkLabel: {
			"default": "name",
			triggerUpdate: false
		},
		linkHoverPrecision: {
			"default": 4,
			triggerUpdate: false
		},
		minZoom: {
			"default": .01,
			onChange: function onChange(minZoom, state) {
				state.zoom.scaleExtent([minZoom, state.zoom.scaleExtent()[1]]);
			},
			triggerUpdate: false
		},
		maxZoom: {
			"default": 1e3,
			onChange: function onChange(maxZoom, state) {
				state.zoom.scaleExtent([state.zoom.scaleExtent()[0], maxZoom]);
			},
			triggerUpdate: false
		},
		enableNodeDrag: {
			"default": true,
			triggerUpdate: false
		},
		enableZoomInteraction: {
			"default": true,
			triggerUpdate: false
		},
		enablePanInteraction: {
			"default": true,
			triggerUpdate: false
		},
		enableZoomPanInteraction: {
			"default": true,
			triggerUpdate: false
		},
		enablePointerInteraction: {
			"default": true,
			onChange: function onChange(_, state) {
				state.hoverObj = null;
			},
			triggerUpdate: false
		},
		autoPauseRedraw: {
			"default": true,
			triggerUpdate: false
		},
		onNodeDrag: {
			"default": function _default() {},
			triggerUpdate: false
		},
		onNodeDragEnd: {
			"default": function _default() {},
			triggerUpdate: false
		},
		onNodeClick: { triggerUpdate: false },
		onNodeRightClick: { triggerUpdate: false },
		onNodeHover: { triggerUpdate: false },
		onLinkClick: { triggerUpdate: false },
		onLinkRightClick: { triggerUpdate: false },
		onLinkHover: { triggerUpdate: false },
		onBackgroundClick: { triggerUpdate: false },
		onBackgroundRightClick: { triggerUpdate: false },
		showPointerCursor: {
			"default": true,
			triggerUpdate: false
		},
		onZoom: { triggerUpdate: false },
		onZoomEnd: { triggerUpdate: false },
		onRenderFramePre: { triggerUpdate: false },
		onRenderFramePost: { triggerUpdate: false }
	}, linkedProps),
	aliases: { stopAnimation: "pauseAnimation" },
	methods: _objectSpread2({
		graph2ScreenCoords: function graph2ScreenCoords(state, x, y) {
			var t = transform(state.canvas);
			return {
				x: x * t.k + t.x,
				y: y * t.k + t.y
			};
		},
		screen2GraphCoords: function screen2GraphCoords(state, x, y) {
			var t = transform(state.canvas);
			return {
				x: (x - t.x) / t.k,
				y: (y - t.y) / t.k
			};
		},
		centerAt: function centerAt(state, x, y, transitionDuration) {
			if (!state.canvas) return null;
			if (x !== void 0 || y !== void 0) {
				var finalPos = Object.assign({}, x !== void 0 ? { x } : {}, y !== void 0 ? { y } : {});
				if (!transitionDuration) setCenter(finalPos);
				else state.tweenGroup.add(new Tween(getCenter()).to(finalPos, transitionDuration).easing(Easing.Quadratic.Out).onUpdate(setCenter).onComplete(function() {
					state.tweenGroup.remove(this);
				}).start());
				return this;
			}
			return getCenter();
			function getCenter() {
				var t = transform(state.canvas);
				return {
					x: (state.width / 2 - t.x) / t.k,
					y: (state.height / 2 - t.y) / t.k
				};
			}
			function setCenter(_ref5) {
				var x = _ref5.x, y = _ref5.y;
				state.zoom.translateTo(state.zoom.__baseElem, x === void 0 ? getCenter().x : x, y === void 0 ? getCenter().y : y);
				state.needsRedraw = true;
			}
		},
		zoom: function zoom(state, k, transitionDuration) {
			if (!state.canvas) return null;
			if (k !== void 0) {
				if (!transitionDuration) setZoom(k);
				else state.tweenGroup.add(new Tween({ k: getZoom() }).to({ k }, transitionDuration).easing(Easing.Quadratic.Out).onUpdate(function(_ref6) {
					var k = _ref6.k;
					return setZoom(k);
				}).onComplete(function() {
					state.tweenGroup.remove(this);
				}).start());
				return this;
			}
			return getZoom();
			function getZoom() {
				return transform(state.canvas).k;
			}
			function setZoom(k) {
				state.zoom.scaleTo(state.zoom.__baseElem, k);
				state.needsRedraw = true;
			}
		},
		zoomToFit: function zoomToFit(state) {
			var transitionDuration = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
			var padding = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10;
			for (var _len = arguments.length, bboxArgs = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) bboxArgs[_key - 3] = arguments[_key];
			var bbox = this.getGraphBbox.apply(this, bboxArgs);
			if (bbox) {
				var center = {
					x: (bbox.x[0] + bbox.x[1]) / 2,
					y: (bbox.y[0] + bbox.y[1]) / 2
				};
				var zoomK = Math.max(1e-12, Math.min(0xe8d4a51000, (state.width - padding * 2) / (bbox.x[1] - bbox.x[0]), (state.height - padding * 2) / (bbox.y[1] - bbox.y[0])));
				this.centerAt(center.x, center.y, transitionDuration);
				this.zoom(zoomK, transitionDuration);
			}
			return this;
		},
		getGraphBbox: function getGraphBbox(state) {
			var nodeFilter = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
				return true;
			};
			var getVal = index$3(state.nodeVal);
			var getR = function getR(node) {
				return Math.sqrt(Math.max(0, getVal(node) || 1)) * state.nodeRelSize;
			};
			var nodesPos = state.graphData.nodes.filter(nodeFilter).map(function(node) {
				return {
					x: node.x,
					y: node.y,
					r: getR(node)
				};
			});
			return !nodesPos.length ? null : {
				x: [min$1(nodesPos, function(node) {
					return node.x - node.r;
				}), max$1(nodesPos, function(node) {
					return node.x + node.r;
				})],
				y: [min$1(nodesPos, function(node) {
					return node.y - node.r;
				}), max$1(nodesPos, function(node) {
					return node.y + node.r;
				})]
			};
		},
		pauseAnimation: function pauseAnimation(state) {
			if (state.animationFrameRequestId) {
				cancelAnimationFrame(state.animationFrameRequestId);
				state.animationFrameRequestId = null;
			}
			return this;
		},
		resumeAnimation: function resumeAnimation(state) {
			if (!state.animationFrameRequestId) this._animationCycle();
			return this;
		},
		_destructor: function _destructor() {
			this.pauseAnimation();
			this.graphData({
				nodes: [],
				links: []
			});
		}
	}, linkedMethods),
	stateInit: function stateInit() {
		return {
			lastSetZoom: 1,
			zoom: zoom_default(),
			forceGraph: new CanvasForceGraph(),
			shadowGraph: new CanvasForceGraph().cooldownTicks(0).nodeColor("__indexColor").linkColor("__indexColor").isShadow(true),
			colorTracker: new _default(),
			tweenGroup: new Group()
		};
	},
	init: function init(domNode, state) {
		var _this = this;
		domNode.innerHTML = "";
		var container = document.createElement("div");
		container.classList.add("force-graph-container");
		container.style.position = "relative";
		domNode.appendChild(container);
		state.canvas = document.createElement("canvas");
		if (state.backgroundColor) state.canvas.style.background = state.backgroundColor;
		container.appendChild(state.canvas);
		state.shadowCanvas = document.createElement("canvas");
		var ctx = state.canvas.getContext("2d");
		var shadowCtx = state.shadowCanvas.getContext("2d", { willReadFrequently: true });
		var pointerPos = {
			x: -0xe8d4a51000,
			y: -0xe8d4a51000
		};
		var getObjUnderPointer = function getObjUnderPointer() {
			var obj = null;
			var pxScale = window.devicePixelRatio;
			var px = pointerPos.x > 0 && pointerPos.y > 0 ? shadowCtx.getImageData(pointerPos.x * pxScale, pointerPos.y * pxScale, 1, 1) : null;
			px && (obj = state.colorTracker.lookup(px.data));
			return obj;
		};
		select_default$1(state.canvas).call(drag_default().subject(function() {
			if (!state.enableNodeDrag) return null;
			var obj = getObjUnderPointer();
			return obj && obj.type === "Node" ? obj.d : null;
		}).on("start", function(ev) {
			var obj = ev.subject;
			obj.__initialDragPos = {
				x: obj.x,
				y: obj.y,
				fx: obj.fx,
				fy: obj.fy
			};
			if (!ev.active) {
				obj.fx = obj.x;
				obj.fy = obj.y;
			}
			state.canvas.classList.add("grabbable");
		}).on("drag", function(ev) {
			var obj = ev.subject;
			var initPos = obj.__initialDragPos;
			var dragPos = ev;
			var k = transform(state.canvas).k;
			var translate = {
				x: initPos.x + (dragPos.x - initPos.x) / k - obj.x,
				y: initPos.y + (dragPos.y - initPos.y) / k - obj.y
			};
			["x", "y"].forEach(function(c) {
				return obj["f".concat(c)] = obj[c] = initPos[c] + (dragPos[c] - initPos[c]) / k;
			});
			if (!obj.__dragged && DRAG_CLICK_TOLERANCE_PX >= Math.sqrt(sum(["x", "y"].map(function(k) {
				return Math.pow(ev[k] - initPos[k], 2);
			})))) return;
			state.forceGraph.d3AlphaTarget(.3).resetCountdown();
			state.isPointerDragging = true;
			obj.__dragged = true;
			state.onNodeDrag(obj, translate);
		}).on("end", function(ev) {
			var obj = ev.subject;
			var initPos = obj.__initialDragPos;
			var translate = {
				x: obj.x - initPos.x,
				y: obj.y - initPos.y
			};
			if (initPos.fx === void 0) obj.fx = void 0;
			if (initPos.fy === void 0) obj.fy = void 0;
			delete obj.__initialDragPos;
			if (state.forceGraph.d3AlphaTarget()) state.forceGraph.d3AlphaTarget(0).resetCountdown();
			state.canvas.classList.remove("grabbable");
			state.isPointerDragging = false;
			if (obj.__dragged) {
				delete obj.__dragged;
				state.onNodeDragEnd(obj, translate);
			}
		}));
		state.zoom(state.zoom.__baseElem = select_default$1(state.canvas));
		state.zoom.__baseElem.on("dblclick.zoom", null);
		state.zoom.filter(function(ev) {
			return !ev.button && state.enableZoomPanInteraction && (ev.type !== "wheel" || index$3(state.enableZoomInteraction)(ev)) && (ev.type === "wheel" || index$3(state.enablePanInteraction)(ev));
		}).on("zoom", function(ev) {
			var t = ev.transform;
			[ctx, shadowCtx].forEach(function(c) {
				resetTransform(c);
				c.translate(t.x, t.y);
				c.scale(t.k, t.k);
			});
			state.isPointerDragging = true;
			state.onZoom && state.onZoom(_objectSpread2(_objectSpread2({}, t), _this.centerAt()));
			state.needsRedraw = true;
		}).on("end", function(ev) {
			state.isPointerDragging = false;
			state.onZoomEnd && state.onZoomEnd(_objectSpread2(_objectSpread2({}, ev.transform), _this.centerAt()));
		});
		adjustCanvasSize(state);
		state.forceGraph.onNeedsRedraw(function() {
			return state.needsRedraw = true;
		}).onFinishUpdate(function() {
			if (transform(state.canvas).k === state.lastSetZoom && state.graphData.nodes.length) {
				state.zoom.scaleTo(state.zoom.__baseElem, state.lastSetZoom = ZOOM2NODES_FACTOR / Math.cbrt(state.graphData.nodes.length));
				state.needsRedraw = true;
			}
		});
		state.tooltip = new index$2(container);
		["pointermove", "pointerdown"].forEach(function(evType) {
			return container.addEventListener(evType, function(ev) {
				if (evType === "pointerdown") {
					state.isPointerPressed = true;
					state.pointerDownEvent = ev;
				}
				!state.isPointerDragging && ev.type === "pointermove" && state.onBackgroundClick && (ev.pressure > 0 || state.isPointerPressed) && (ev.pointerType === "mouse" || ev.movementX === void 0 || [ev.movementX, ev.movementY].some(function(m) {
					return Math.abs(m) > 1;
				})) && (state.isPointerDragging = true);
				var offset = getOffset(container);
				pointerPos.x = ev.pageX - offset.left;
				pointerPos.y = ev.pageY - offset.top;
				function getOffset(el) {
					var rect = el.getBoundingClientRect(), scrollLeft = window.pageXOffset || document.documentElement.scrollLeft, scrollTop = window.pageYOffset || document.documentElement.scrollTop;
					return {
						top: rect.top + scrollTop,
						left: rect.left + scrollLeft
					};
				}
			}, { passive: true });
		});
		container.addEventListener("pointerup", function(ev) {
			if (!state.isPointerPressed) return;
			state.isPointerPressed = false;
			if (state.isPointerDragging) {
				state.isPointerDragging = false;
				return;
			}
			var cbEvents = [ev, state.pointerDownEvent];
			requestAnimationFrame(function() {
				if (ev.button === 0) if (state.hoverObj) {
					var fn = state["on".concat(state.hoverObj.type, "Click")];
					fn && fn.apply(void 0, [state.hoverObj.d].concat(cbEvents));
				} else state.onBackgroundClick && state.onBackgroundClick.apply(state, cbEvents);
				if (ev.button === 2) if (state.hoverObj) {
					var _fn = state["on".concat(state.hoverObj.type, "RightClick")];
					_fn && _fn.apply(void 0, [state.hoverObj.d].concat(cbEvents));
				} else state.onBackgroundRightClick && state.onBackgroundRightClick.apply(state, cbEvents);
			});
		}, { passive: true });
		container.addEventListener("contextmenu", function(ev) {
			if (!state.onBackgroundRightClick && !state.onNodeRightClick && !state.onLinkRightClick) return true;
			ev.preventDefault();
			return false;
		});
		state.forceGraph(ctx);
		state.shadowGraph(shadowCtx);
		var refreshShadowCanvas = throttle(function() {
			clearCanvas(shadowCtx, state.width, state.height);
			state.shadowGraph.linkWidth(function(l) {
				return index$3(state.linkWidth)(l) + state.linkHoverPrecision;
			});
			var t = transform(state.canvas);
			state.shadowGraph.globalScale(t.k).tickFrame();
		}, HOVER_CANVAS_THROTTLE_DELAY);
		state.flushShadowCanvas = refreshShadowCanvas.flush;
		(this._animationCycle = function animate() {
			var doRedraw = !state.autoPauseRedraw || !!state.needsRedraw || state.forceGraph.isEngineRunning() || state.graphData.links.some(function(d) {
				return d.__photons && d.__photons.length;
			});
			state.needsRedraw = false;
			if (state.enablePointerInteraction) {
				var obj = !state.isPointerDragging ? getObjUnderPointer() : null;
				if (obj !== state.hoverObj) {
					var prevObj = state.hoverObj;
					var prevObjType = prevObj ? prevObj.type : null;
					var objType = obj ? obj.type : null;
					if (prevObjType && prevObjType !== objType) {
						var fn = state["on".concat(prevObjType, "Hover")];
						fn && fn(null, prevObj.d);
					}
					if (objType) {
						var _fn2 = state["on".concat(objType, "Hover")];
						_fn2 && _fn2(obj.d, prevObjType === objType ? prevObj.d : null);
					}
					state.tooltip.content(obj ? index$3(state["".concat(obj.type.toLowerCase(), "Label")])(obj.d) || null : null);
					state.canvas.classList[(obj && state["on".concat(objType, "Click")] || !obj && state.onBackgroundClick) && index$3(state.showPointerCursor)(obj === null || obj === void 0 ? void 0 : obj.d) ? "add" : "remove"]("clickable");
					state.hoverObj = obj;
				}
				doRedraw && refreshShadowCanvas();
			}
			if (doRedraw) {
				clearCanvas(ctx, state.width, state.height);
				var globalScale = transform(state.canvas).k;
				state.onRenderFramePre && state.onRenderFramePre(ctx, globalScale);
				state.forceGraph.globalScale(globalScale).tickFrame();
				state.onRenderFramePost && state.onRenderFramePost(ctx, globalScale);
			}
			state.tweenGroup.update();
			state.animationFrameRequestId = requestAnimationFrame(animate);
		})();
	},
	update: function updateFn(state) {}
});
//#endregion
//#region node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/lib/ReactPropTypesSecret.js
/**
* Copyright (c) 2013-present, Facebook, Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_ReactPropTypesSecret = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
}));
//#endregion
//#region node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/factoryWithThrowingShims.js
/**
* Copyright (c) 2013-present, Facebook, Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_factoryWithThrowingShims = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ReactPropTypesSecret = require_ReactPropTypesSecret();
	function emptyFunction() {}
	function emptyFunctionWithReset() {}
	emptyFunctionWithReset.resetWarningCache = emptyFunction;
	module.exports = function() {
		function shim(props, propName, componentName, location, propFullName, secret) {
			if (secret === ReactPropTypesSecret) return;
			var err = /* @__PURE__ */ new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");
			err.name = "Invariant Violation";
			throw err;
		}
		shim.isRequired = shim;
		function getShim() {
			return shim;
		}
		var ReactPropTypes = {
			array: shim,
			bigint: shim,
			bool: shim,
			func: shim,
			number: shim,
			object: shim,
			string: shim,
			symbol: shim,
			any: shim,
			arrayOf: getShim,
			element: shim,
			elementType: shim,
			instanceOf: getShim,
			node: shim,
			objectOf: getShim,
			oneOf: getShim,
			oneOfType: getShim,
			shape: getShim,
			exact: getShim,
			checkPropTypes: emptyFunctionWithReset,
			resetWarningCache: emptyFunction
		};
		ReactPropTypes.PropTypes = ReactPropTypes;
		return ReactPropTypes;
	};
}));
//#endregion
//#region node_modules/.pnpm/react-force-graph-2d@1.29.1_react@19.2.8/node_modules/react-force-graph-2d/dist/react-force-graph-2d.mjs
var import_prop_types = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_factoryWithThrowingShims()();
})))(), 1);
const commonPropTypes = {
	width: import_prop_types.default.number,
	height: import_prop_types.default.number,
	graphData: import_prop_types.default.shape({
		nodes: import_prop_types.default.arrayOf(import_prop_types.default.object).isRequired,
		links: import_prop_types.default.arrayOf(import_prop_types.default.object).isRequired
	}),
	backgroundColor: import_prop_types.default.string,
	nodeRelSize: import_prop_types.default.number,
	nodeId: import_prop_types.default.string,
	nodeLabel: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	nodeVal: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	nodeVisibility: import_prop_types.default.oneOfType([
		import_prop_types.default.bool,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	nodeColor: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	nodeAutoColorBy: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	onNodeHover: import_prop_types.default.func,
	onNodeClick: import_prop_types.default.func,
	linkSource: import_prop_types.default.string,
	linkTarget: import_prop_types.default.string,
	linkLabel: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	linkVisibility: import_prop_types.default.oneOfType([
		import_prop_types.default.bool,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkColor: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	linkAutoColorBy: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	linkWidth: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkCurvature: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkDirectionalArrowLength: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkDirectionalArrowColor: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	linkDirectionalArrowRelPos: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkDirectionalParticles: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkDirectionalParticleSpeed: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkDirectionalParticleOffset: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkDirectionalParticleWidth: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkDirectionalParticleColor: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	onLinkHover: import_prop_types.default.func,
	onLinkClick: import_prop_types.default.func,
	dagMode: import_prop_types.default.oneOf([
		"td",
		"bu",
		"lr",
		"rl",
		"zin",
		"zout",
		"radialin",
		"radialout"
	]),
	dagLevelDistance: import_prop_types.default.number,
	dagNodeFilter: import_prop_types.default.func,
	onDagError: import_prop_types.default.func,
	d3AlphaMin: import_prop_types.default.number,
	d3AlphaDecay: import_prop_types.default.number,
	d3VelocityDecay: import_prop_types.default.number,
	warmupTicks: import_prop_types.default.number,
	cooldownTicks: import_prop_types.default.number,
	cooldownTime: import_prop_types.default.number,
	onEngineTick: import_prop_types.default.func,
	onEngineStop: import_prop_types.default.func,
	getGraphBbox: import_prop_types.default.func
};
const pointerBasedPropTypes = {
	zoomToFit: import_prop_types.default.func,
	onNodeRightClick: import_prop_types.default.func,
	onNodeDrag: import_prop_types.default.func,
	onNodeDragEnd: import_prop_types.default.func,
	onLinkRightClick: import_prop_types.default.func,
	linkHoverPrecision: import_prop_types.default.number,
	onBackgroundClick: import_prop_types.default.func,
	onBackgroundRightClick: import_prop_types.default.func,
	showPointerCursor: import_prop_types.default.oneOfType([import_prop_types.default.bool, import_prop_types.default.func]),
	enablePointerInteraction: import_prop_types.default.bool,
	enableNodeDrag: import_prop_types.default.bool
};
const threeBasedPropTypes = {
	showNavInfo: import_prop_types.default.bool,
	nodeOpacity: import_prop_types.default.number,
	nodeResolution: import_prop_types.default.number,
	nodeThreeObject: import_prop_types.default.oneOfType([
		import_prop_types.default.object,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	nodeThreeObjectExtend: import_prop_types.default.oneOfType([
		import_prop_types.default.bool,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	nodePositionUpdate: import_prop_types.default.func,
	linkOpacity: import_prop_types.default.number,
	linkResolution: import_prop_types.default.number,
	linkCurveRotation: import_prop_types.default.oneOfType([
		import_prop_types.default.number,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkMaterial: import_prop_types.default.oneOfType([
		import_prop_types.default.object,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkThreeObject: import_prop_types.default.oneOfType([
		import_prop_types.default.object,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkThreeObjectExtend: import_prop_types.default.oneOfType([
		import_prop_types.default.bool,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	linkPositionUpdate: import_prop_types.default.func,
	linkDirectionalArrowResolution: import_prop_types.default.number,
	linkDirectionalParticleResolution: import_prop_types.default.number,
	linkDirectionalParticleThreeObject: import_prop_types.default.oneOfType([
		import_prop_types.default.object,
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	forceEngine: import_prop_types.default.oneOf(["d3", "ngraph"]),
	ngraphPhysics: import_prop_types.default.object,
	numDimensions: import_prop_types.default.oneOf([
		1,
		2,
		3
	])
};
const ForceGraph2DPropTypes = Object.assign({}, commonPropTypes, pointerBasedPropTypes, {
	linkLineDash: import_prop_types.default.oneOfType([
		import_prop_types.default.arrayOf(import_prop_types.default.number),
		import_prop_types.default.string,
		import_prop_types.default.func
	]),
	nodeCanvasObjectMode: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	nodeCanvasObject: import_prop_types.default.func,
	nodePointerAreaPaint: import_prop_types.default.func,
	linkCanvasObjectMode: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	linkCanvasObject: import_prop_types.default.func,
	linkPointerAreaPaint: import_prop_types.default.func,
	linkDirectionalParticleCanvasObject: import_prop_types.default.func,
	autoPauseRedraw: import_prop_types.default.bool,
	minZoom: import_prop_types.default.number,
	maxZoom: import_prop_types.default.number,
	enableZoomInteraction: import_prop_types.default.oneOfType([import_prop_types.default.bool, import_prop_types.default.func]),
	enablePanInteraction: import_prop_types.default.oneOfType([import_prop_types.default.bool, import_prop_types.default.func]),
	onZoom: import_prop_types.default.func,
	onZoomEnd: import_prop_types.default.func,
	onRenderFramePre: import_prop_types.default.func,
	onRenderFramePost: import_prop_types.default.func
});
Object.assign({}, commonPropTypes, pointerBasedPropTypes, threeBasedPropTypes, {
	enableNavigationControls: import_prop_types.default.bool,
	controlType: import_prop_types.default.oneOf([
		"trackball",
		"orbit",
		"fly"
	]),
	rendererConfig: import_prop_types.default.object,
	extraRenderers: import_prop_types.default.arrayOf(import_prop_types.default.shape({ render: import_prop_types.default.func.isRequired }))
});
Object.assign({}, commonPropTypes, threeBasedPropTypes, {
	nodeDesc: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func]),
	linkDesc: import_prop_types.default.oneOfType([import_prop_types.default.string, import_prop_types.default.func])
});
Object.assign({}, commonPropTypes, threeBasedPropTypes, {
	markerAttrs: import_prop_types.default.object,
	yOffset: import_prop_types.default.number,
	glScale: import_prop_types.default.number
});
const ForceGraph2D = index$5(forceGraph, { methodNames: [
	"emitParticle",
	"d3Force",
	"d3ReheatSimulation",
	"stopAnimation",
	"pauseAnimation",
	"resumeAnimation",
	"centerAt",
	"zoom",
	"zoomToFit",
	"getGraphBbox",
	"screen2GraphCoords",
	"graph2ScreenCoords"
] });
ForceGraph2D.displayName = "ForceGraph2D";
ForceGraph2D.propTypes = ForceGraph2DPropTypes;
//#endregion
//#region lib/client/graph-force.js
/**
* Interactive project graph for the 会话结构图 tab — react-force-graph-2d
* (the same library obsidian-vault-pipeline uses): real pan / zoom / node
* drag / hover / click-to-jump, replacing the static force SVG.
* @module @fakechris/dsh-track/client/graph-force
*/
const NODE_COLOR = {
	session: "#4c8dff",
	issue: "#1a7f37",
	commit: "#8a8f98",
	decision: "#e8853c"
};
const EDGE_COLOR = {
	"forked-from": "#4c8dff",
	"executed-in": "#2f9e44",
	landed: "#adb5bd",
	implements: "#40c057",
	"raised-in": "#e8853c"
};
function GraphForceView(props) {
	return (0, react_jsx_runtime.jsx)(ForceGraph2D, {
		graphData: (0, react.useMemo)(() => ({
			nodes: props.data.nodes.map((n) => ({
				...n,
				color: NODE_COLOR[n.kind] ?? "#999"
			})),
			links: props.data.edges.map((e) => ({
				source: e.from,
				target: e.to,
				color: EDGE_COLOR[e.kind] ?? "#bbb"
			}))
		}), [props.data]),
		nodeLabel: (n) => n.label ?? "",
		nodeColor: (n) => n.color ?? "#999",
		linkColor: (l) => l.color ?? "#bbb",
		linkDirectionalArrowLength: 4,
		linkDirectionalArrowRelPos: 1,
		nodeRelSize: 5,
		cooldownTicks: 150,
		onNodeClick: (n) => {
			const node = n;
			props.onNodeClick(node);
		},
		onNodeHover: (n) => {
			const canvas = document.querySelector(".inv-graph canvas");
			if (canvas !== null) canvas.style.cursor = n ? "pointer" : "default";
		}
	});
}
let root = null;
/** Mount (or re-mount) the interactive force graph into a container. */
function mountGraphForce(container, data, onNodeClick) {
	if (root === null) root = (0, react_dom_client.createRoot)(container);
	root.render((0, react_jsx_runtime.jsx)(GraphForceView, {
		data,
		onNodeClick
	}));
}
//#endregion
//#region lib/client/right-panel.js
/**
* Track right-side panel mounting — the lazyfish/side-panel pattern:
* locate the conversation container, take over its grid as
* `grid-template-columns: minmax(0,2fr) minmax(0,1fr)` (conversation 2/3 +
* panel 1/3, draggable), and mount the Track panel at grid-column 2.
* A floating toggle button (FAB) shows when the panel is closed.
*
* This is the right-side sidebar the user asked for — not a full-screen
* overlay (which the previous implementation wrongly did).
* @module @fakechris/dsh-track/client/right-panel
*/
/** Stable ids for the injected panel and toggle. */
const PANEL_ID = "dsh-track-panel";
const FAB_ID = "dsh-track-fab";
const OPEN_KEY = "dsh.track.open";
const WIDTH_KEY = "dsh.track.width";
/**
* ---- jump back to the source conversation ----
* Each card's "↩ 对话" link opens the entry's source session in the left
* conversation and scrolls to the user prompt that motivated it (when the
* message id is known). Mechanics:
*  - `ctx.sessions.open(id)` selects the session (public ISessions face).
*  - `ctx.sessions.binding(id)?.session` is the `SessionFace`: its
*    `getSnapshot()` exposes `chat.nodes` (node keys) and `hasMore`, and
*    `loadOlder()` pages the history window backwards — so a jump reaches
*    messages older than the initially loaded window.
*  - Chat rows render with `data-chat-flow-key` = `conversationContextKey(
*    'input-message', messageId)` (the exported runtime key format), which
*    is how the row is located after the session opens.
*/
let clientCtx = null;
/** Bounded "deep history" pages to walk before giving up on an old prompt. */
const MAX_PAGES = 40;
const POLL_MS = 120;
const TIMEOUT_MS = 1e4;
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
/** Poll `fn()` until truthy or the timeout elapses. */
async function pollUntil(fn, timeoutMs = TIMEOUT_MS) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (fn()) return true;
		await sleep(POLL_MS);
	}
	return fn();
}
/** Poll `fn()` until it returns a defined value, or the timeout elapses. */
async function pollValue(fn, timeoutMs = TIMEOUT_MS) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		const value = fn();
		if (value !== void 0) return value;
		await sleep(POLL_MS);
	}
	return fn();
}
/** Find a chat row by its stable flow key (dataset compare — no selector escaping). */
function findRowByKey(scroll, key) {
	for (const el of scroll.querySelectorAll("[data-chat-flow-key]")) if (el.dataset.chatFlowKey === key) return el;
	return null;
}
/** Briefly flash a chat row so the jump target is obvious. */
function flashRow(el) {
	el.classList.add("inv-jump-flash");
	window.setTimeout(() => el.classList.remove("inv-jump-flash"), 2600);
}
/**
* Open `sessionId` in the left conversation and scroll to `messageId`'s user
* prompt row. Falls back to the first user message in the loaded window,
* then to the bottom, when the message cannot be located.
*/
async function jumpToConversation(opts) {
	const { sessionId, messageId } = opts;
	if (!sessionId || clientCtx === null) return;
	let sessions;
	try {
		sessions = clientCtx.sessions;
	} catch {
		return;
	}
	try {
		sessions.open(sessionId);
	} catch {
		return;
	}
	const session = await pollValue(() => sessions.binding(sessionId)?.session);
	if (session === void 0) return;
	await pollUntil(() => session.getSnapshot().openState === "open");
	const key = messageId !== void 0 && messageId !== "" ? (0, _deepseek_ai_dsh_client_runtime_client.conversationContextKey)("input-message", messageId) : void 0;
	if (key !== void 0) for (let i = 0; i < MAX_PAGES; i++) {
		const snap = session.getSnapshot();
		if (snap.chat.nodes.get(key) !== void 0) break;
		if (!snap.hasMore) break;
		await session.loadOlder().catch(() => {});
		await pollUntil(() => !session.getSnapshot().loadingOlder);
	}
	const scroll = document.querySelector("[data-conversation-scroll]");
	let row = null;
	if (key !== void 0 && scroll !== null) {
		row = findRowByKey(scroll, key);
		if (row === null) {
			const start = Date.now();
			while (Date.now() - start < TIMEOUT_MS) {
				await sleep(POLL_MS);
				row = findRowByKey(scroll, key);
				if (row !== null) break;
			}
		}
	}
	if (row !== null) {
		flashRow(row);
		jumpScrollIntoView(row);
		return;
	}
	const first = scroll?.querySelector("[data-chat-flow-kind=\"user\"]");
	if (first !== null && first !== void 0) {
		flashRow(first);
		jumpScrollIntoView(first);
		return;
	}
	if (scroll !== null) scroll.scrollTop = scroll.scrollHeight;
}
/**
* Scroll the target row into view, re-applying a few times: a jump into a
* RUNNING session fights the ChatView's bottom-follow (every streamed flow
* update re-pins to the bottom while the reader is at the bottom). Re-applying
* moves the viewport off the bottom, which flips the follow state off, so the
* jump sticks. Instant (`auto`) scrolling is used — smooth over very long
* distances stalls in Chrome. Re-applies are no-ops once the row is in view.
*/
function jumpScrollIntoView(row) {
	const apply = () => {
		row.scrollIntoView({
			block: "center",
			behavior: "auto"
		});
	};
	apply();
	for (let i = 1; i <= 4; i++) window.setTimeout(apply, i * 300);
}
async function fetchSnapshot() {
	const [c, i] = await Promise.all([fetch("/api/track/captures").then((r) => r.json()).catch(() => ({ captures: [] })), fetch("/api/track/issues").then((r) => r.json()).catch(() => ({ issues: [] }))]);
	return {
		captures: c.captures ?? [],
		issues: i.issues ?? []
	};
}
/** ---- panel HTML (plain DOM — the lazyfish pattern keeps it React-free) ---- */
function buildPanelHtml() {
	return `
  <div class="inv-head">
    <span class="inv-title">Track</span>
    <button class="inv-refresh" title="刷新">⟳</button>
    <button class="inv-settings" title="设置">⚙</button>
    <button class="inv-close" title="收起">×</button>
  </div>
  <div class="inv-body">
    <div class="inv-settings-panel" hidden>
      <div class="inv-section-title">自动维护设置</div>
      <label class="inv-set-row">取消确认宽限（天，0=不自动取消）
        <input class="inv-set" data-set="autoCancelPendingDays" type="number" min="0" step="1"/></label>
      <label class="inv-set-row">定时 sync 间隔（天，0=关闭）
        <input class="inv-set" data-set="syncIntervalDays" type="number" min="0" step="1"/></label>
      <label class="inv-set-row">每次 sync 会话上限
        <input class="inv-set" data-set="syncMaxSessions" type="number" min="1" step="1"/></label>
      <label class="inv-set-row">sync 引擎
        <select class="inv-set" data-set="syncEngine"><option value="v1">v1（零 LLM）</option><option value="v2">v2（LLM）</option></select></label>
      <label class="inv-set-row">重复归并相似度阈值（0-1）
        <input class="inv-set" data-set="nearDupThreshold" type="number" min="0" max="1" step="0.05"/></label>
      <div class="inv-actions"><button class="inv-act inv-save-config">保存</button></div>
    </div>
    <div class="inv-section">
      <div class="inv-section-title">捕获想法</div>
      <div class="inv-input-row">
        <input class="inv-input" placeholder="记录一个念头…" />
        <button class="inv-capture" type="button">捕获</button>
      </div>
      <div class="inv-captures"></div>
      <div class="inv-pager"></div>
    </div>
    <div class="inv-section">
      <div class="inv-section-title">待确认 <span class="inv-pending-count"></span></div>
      <div class="inv-pending"></div>
    </div>
    <div class="inv-section">
      <div class="inv-section-title">任务 <span class="inv-issue-count"></span>
        <button class="inv-act inv-batch-toggle" data-batch-toggle title="批量标记完成/取消">批量</button>
      </div>
      <div class="inv-batch-bar" data-batch-bar hidden>
        <span class="inv-batch-info">已选 <span data-batch-count>0</span></span>
        <button class="inv-act inv-confirm" data-batch-done>完成</button>
        <button class="inv-act" data-batch-cancel>取消</button>
        <button class="inv-act" data-batch-clear>清空</button>
      </div>
      <div class="inv-issues"></div>
      <div class="inv-issue-pager"></div>
    </div>
  </div>
  <div class="inv-width-resizer" title="拖动调整面板宽度"></div>
  `;
}
const PANEL_CSS = `
#${FAB_ID} {
  position: fixed;
  right: 14px;
  bottom: 110px;
  z-index: 10000;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 12px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  background: var(--dsw-alias-bg-layer-2, #f7f7f8);
  color: var(--dsw-alias-label-primary, #171719);
  box-shadow: 0 4px 14px rgba(0,0,0,.2);
}
#${FAB_ID}[hidden] { display: none; }
.inv-host {
  display: grid !important;
  grid-template-rows: auto minmax(0, 1fr) !important;
}
.inv-host-header {
  grid-column: 1 / -1 !important;
  grid-row: 1 !important;
}
.inv-host-scroll {
  grid-column: 1 !important;
  grid-row: 2 !important;
  min-width: 0 !important;
  overflow-y: auto;
}
#${PANEL_ID} {
  position: relative;
  z-index: 1;
  grid-column: 2 !important;
  grid-row: 2 !important;
  min-width: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--dsw-alias-bg-base, #fff);
  color: var(--dsw-alias-label-primary, #171719);
  border-left: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.1));
  font: 13px/1.5 ui-sans-serif, system-ui, sans-serif;
}
#${PANEL_ID}[hidden] { display: none; }
#${PANEL_ID} .inv-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  height: 36px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.06));
  flex: none;
}
#${PANEL_ID} .inv-title { flex: 1; font-weight: 600; }
#${PANEL_ID} .inv-settings {
  width: 24px; height: 24px; border: 0; border-radius: 6px;
  background: transparent; color: var(--dsw-alias-label-secondary, #555);
  font-size: 14px; cursor: pointer;
}
#${PANEL_ID} .inv-settings-panel {
  display: flex; flex-direction: column; gap: 6px; padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, rgba(0,0,0,.02));
}
#${PANEL_ID} .inv-settings-panel[hidden] { display: none; }
#${PANEL_ID} .inv-set-row {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  font-size: 11.5px; opacity: .85;
}
#${PANEL_ID} .inv-set {
  width: 90px; padding: 3px 6px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.15));
  border-radius: 5px; background: transparent; color: inherit; font-size: 12px;
}
#${PANEL_ID} .inv-refresh, #${PANEL_ID} .inv-close {
  width: 24px; height: 24px; border: 0; border-radius: 6px;
  background: transparent; color: var(--dsw-alias-label-secondary, #555);
  font-size: 14px; cursor: pointer;
}
#${PANEL_ID} .inv-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
#${PANEL_ID} .inv-section { display: flex; flex-direction: column; gap: 6px; }
#${PANEL_ID} .inv-section-title {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  opacity: .65;
}
#${PANEL_ID} .inv-input-row { display: flex; gap: 6px; }
#${PANEL_ID} .inv-input {
  flex: 1; padding: 5px 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.15));
  border-radius: 6px; background: transparent; color: inherit; font-size: 13px;
}
#${PANEL_ID} .inv-capture {
  padding: 5px 10px; border: 0; border-radius: 6px;
  background: #4c8dff; color: #fff; font-size: 13px; cursor: pointer;
}
#${PANEL_ID} .inv-card {
  padding: 7px 9px; border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.12));
  border-radius: 6px; font-size: 12.5px;
}
#${PANEL_ID} .inv-actions {
  display: flex; align-items: center; gap: 6px; margin-top: 5px; flex-wrap: wrap;
}
#${PANEL_ID} .inv-act {
  padding: 2px 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.15));
  border-radius: 5px; background: transparent; color: var(--dsw-alias-label-secondary, #555);
  font-size: 11.5px; cursor: pointer;
}
#${PANEL_ID} .inv-act:hover { background: var(--dsw-alias-bg-layer-1, rgba(0,0,0,.05)); }
#${PANEL_ID} .inv-act.inv-jump {
  color: #2f6fd0; border-color: rgba(47,111,208,.35);
}
#${PANEL_ID} .inv-act.inv-jump:hover { background: rgba(47,111,208,.08); }
#${PANEL_ID} .inv-jump-flash {
  animation: inv-jump-flash 2.4s ease-out;
  border-radius: 8px;
}
@keyframes inv-jump-flash {
  0% { box-shadow: 0 0 0 3px rgba(76,141,255,.85); background: rgba(76,141,255,.16); }
  100% { box-shadow: 0 0 0 3px rgba(76,141,255,0); background: rgba(76,141,255,0); }
}
#${PANEL_ID} .inv-act.inv-danger {
  border-color: #e5484d; background: #e5484d; color: #fff;
}
#${PANEL_ID} .inv-act.inv-danger-ghost { border-color: rgba(229,72,77,.45); color: #e5484d; }
#${PANEL_ID} .inv-act.inv-danger-ghost:hover { background: rgba(229,72,77,.08); }
#${PANEL_ID} .inv-confirm-hint { font-size: 11.5px; color: #e5484d; }
#${PANEL_ID} .inv-pager {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px;
  margin-top: 6px; min-height: 18px;
}
#${PANEL_ID} .inv-page {
  width: 22px; height: 22px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.15));
  border-radius: 5px; background: transparent; color: var(--dsw-alias-label-secondary, #555);
  font-size: 13px; line-height: 1; cursor: pointer;
}
#${PANEL_ID} .inv-page:disabled { opacity: .35; cursor: default; }
#${PANEL_ID} .inv-page-info { font-size: 11px; opacity: .7; }
#${PANEL_ID} .inv-page-input {
  width: 30px; height: 22px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.15));
  border-radius: 5px; background: transparent; color: inherit; font-size: 12px;
  text-align: center; padding: 0;
}
#${PANEL_ID} .inv-page-input:focus { outline: 1px solid #4c8dff; }
#${PANEL_ID} .inv-meta { font-size: 11px; opacity: .6; margin-top: 3px; }
#${PANEL_ID} .inv-issue-count { font-weight: 400; }
#${PANEL_ID} .inv-state-group {
  font-size: 11px; font-weight: 600; opacity: .55; text-transform: uppercase;
  margin: 8px 0 2px; letter-spacing: .03em;
}
#${PANEL_ID} .inv-state-group:first-child { margin-top: 0; }
#${PANEL_ID} .inv-issue-card { padding: 0; overflow: hidden; }
#${PANEL_ID} .inv-issue-header {
  display: flex; align-items: center; gap: 6px; padding: 7px 9px;
  cursor: pointer; user-select: none;
}
#${PANEL_ID} .inv-issue-header:hover { background: var(--dsw-alias-bg-layer-1, rgba(0,0,0,.04)); }
#${PANEL_ID} .inv-issue-id {
  flex: none; font-weight: 600; font-size: 11px; opacity: .7;
}
#${PANEL_ID} .inv-issue-title { flex: 1; min-width: 0; }
#${PANEL_ID} .inv-chevron { flex: none; opacity: .5; font-size: 10px; }
#${PANEL_ID} .inv-state {
  flex: none; padding: 1px 6px; border-radius: 999px; font-size: 10px;
  font-weight: 600; text-transform: uppercase; line-height: 16px;
}
#${PANEL_ID} .inv-state-todo { background: rgba(128,128,128,.18); color: inherit; }
#${PANEL_ID} .inv-state-in_progress { background: rgba(76,141,255,.2); color: #2f6fd0; }
#${PANEL_ID} .inv-state-done { background: rgba(46,160,67,.2); color: #1a7f37; }
#${PANEL_ID} .inv-state-canceled { background: rgba(229,72,77,.15); color: #c33; }
#${PANEL_ID} .inv-state-pending { background: rgba(255,165,0,.22); color: #b26a00; }
#${PANEL_ID} .inv-pending-card { border-color: rgba(255,165,0,.45); }
#${PANEL_ID} .inv-pending-reason {
  font-size: 11.5px; opacity: .75; padding: 0 9px 2px; white-space: pre-wrap; word-break: break-word;
}
#${PANEL_ID} .inv-act.inv-confirm {
  border-color: rgba(46,160,67,.5); background: rgba(46,160,67,.12); color: #1a7f37;
}
#${PANEL_ID} .inv-act.inv-confirm:hover { background: rgba(46,160,67,.2); }
#${PANEL_ID} .inv-issue-detail {
  border-top: 1px dashed var(--dsw-alias-border-l1, rgba(0,0,0,.1));
  padding: 6px 9px 2px; background: var(--dsw-alias-bg-layer-1, rgba(0,0,0,.02));
  display: flex; flex-direction: column; gap: 4px;
}
#${PANEL_ID} .inv-detail-row { display: flex; gap: 8px; font-size: 12px; }
#${PANEL_ID} .inv-detail-label {
  flex: none; width: 42px; font-size: 11px; opacity: .55;
  padding-top: 1px; text-transform: uppercase;
}
#${PANEL_ID} .inv-detail-text {
  white-space: pre-wrap; word-break: break-word; min-width: 0;
  max-height: 180px; overflow-y: auto;
}
#${PANEL_ID} .inv-issue-card .inv-actions { padding: 0 9px 7px; margin-top: 0; }
#${PANEL_ID} .inv-batch-toggle { margin-left: auto; padding: 1px 7px; font-size: 11px; }
#${PANEL_ID} .inv-batch-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 8px; border: 1px dashed var(--dsw-alias-border-l2, rgba(0,0,0,.2));
  border-radius: 6px; background: var(--dsw-alias-bg-layer-1, rgba(0,0,0,.03));
  font-size: 11.5px;
}
#${PANEL_ID} .inv-batch-bar[hidden] { display: none; }
#${PANEL_ID} .inv-batch-info { flex: 1; opacity: .75; }
#${PANEL_ID} .inv-sel {
  flex: none; width: 14px; height: 14px; margin: 0 6px 0 0; accent-color: #4c8dff;
  cursor: pointer; vertical-align: -2px;
}
#${PANEL_ID} .inv-act.inv-done { color: #1a7f37; border-color: rgba(46,160,67,.4); }
#${PANEL_ID} .inv-act.inv-done:hover { background: rgba(46,160,67,.1); }
#${PANEL_ID} .inv-empty { opacity: .5; font-size: 12px; font-style: italic; }
#${PANEL_ID} .inv-lineage { border-top: 1px dashed var(--dsw-alias-border-l1, rgba(0,0,0,.1)); padding: 6px 9px; display: flex; flex-direction: column; gap: 3px; font-size: 12px; }
#${PANEL_ID} .inv-lineage[hidden] { display: none; }
#${PANEL_ID} .inv-lg-title { font-weight: 600; margin-bottom: 2px; }
#${PANEL_ID} .inv-lg-group { font-size: 10.5px; font-weight: 600; text-transform: uppercase; opacity: .55; margin-top: 5px; }
#${PANEL_ID} .inv-lg-row { display: flex; align-items: baseline; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${PANEL_ID} .inv-lg-msg { padding-left: 12px; color: var(--dsw-alias-label-secondary, #555); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${PANEL_ID} .inv-graphview { position: relative; z-index: 1; grid-column: 1 / -1 !important; grid-row: 1 / -1 !important; width: 100%; height: 100%; display: flex; flex-direction: column; background: var(--dsw-alias-bg-base, #fff); overflow: hidden; }
#${PANEL_ID} .inv-graphview[hidden] { display: none; }
#${PANEL_ID} .inv-graphview-head { display: flex; align-items: center; gap: 8px; padding: 0 10px; height: 36px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.06)); flex: none; }
#${PANEL_ID} .inv-graphview .inv-graph { flex: 1; min-height: 0; position: relative; overflow: hidden; padding: 0; }
#${PANEL_ID} .inv-related { border-top: 1px dashed var(--dsw-alias-border-l1, rgba(0,0,0,.1)); padding: 6px 10px; font-size: 12px; }
#${PANEL_ID} .gv-svg { display: block; }
#${PANEL_ID} .gv-edge { stroke: rgba(0,0,0,.15); stroke-width: 1; }
#${PANEL_ID} .gv-executed-in { stroke: rgba(26,127,55,.35); }
#${PANEL_ID} .gv-landed-in { stroke: rgba(138,143,152,.5); stroke-dasharray: 3 2; }
#${PANEL_ID} .gv-implements { stroke: rgba(26,127,55,.6); }
#${PANEL_ID} .gv-forked-from { stroke: rgba(76,141,255,.5); }
#${PANEL_ID} .gv-raised-in { stroke: rgba(232,133,60,.4); }
#${PANEL_ID} .gv-node { cursor: default; }
#${PANEL_ID} .gv-node.gv-click { cursor: pointer; }
#${PANEL_ID} .gv-node.gv-click:hover circle { stroke: #333; stroke-width: 2; }
#${PANEL_ID} .gv-label { font-size: 10px; fill: var(--dsw-alias-label-secondary, #555); }
#${PANEL_ID} .gv-legend-bar { display: flex; gap: 12px; flex-wrap: wrap; padding: 6px 10px; font-size: 11px; opacity: .7; }
#${PANEL_ID} .gv-legend { display: inline-flex; align-items: center; gap: 4px; }
#${PANEL_ID} .gv-legend i { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
#${PANEL_ID} .gv-hint { position: absolute; top: 40px; right: 14px; font-size: 11px; opacity: .5; }
#${PANEL_ID} .inv-graph { display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
#${PANEL_ID} .inv-groot { padding: 6px 8px; border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.12)); border-radius: 6px; font-weight: 600; }
#${PANEL_ID} .inv-gmeta { font-size: 10.5px; opacity: .6; font-weight: 400; }
#${PANEL_ID} .inv-gturn { margin: 2px 0 0 6px; padding-left: 8px; border-left: 2px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); }
#${PANEL_ID} .inv-gturn summary { cursor: pointer; padding: 2px 0; opacity: .9; }
#${PANEL_ID} .inv-gnode { padding: 1px 0 1px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${PANEL_ID} .inv-gtool { padding: 1px 0 1px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${PANEL_ID} .inv-gtool.inv-gerr { color: #e5484d; }
#${PANEL_ID} .inv-gseq { opacity: .45; font-size: 10.5px; margin-left: 4px; }
#${PANEL_ID} .inv-guser { padding: 1px 0 1px 10px; display: flex; gap: 6px; align-items: baseline; }
#${PANEL_ID} .inv-guser-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
#${PANEL_ID} .inv-gfork { margin-left: 8px; }
#${PANEL_ID} .inv-width-resizer {
  position: absolute; left: -3px; top: 0; bottom: 0; width: 6px;
  cursor: col-resize; z-index: 2;
}

/* Full-area graph view (direct child of the conversation root — takes Chat's slot). */
#dsh-track-graphview {
  grid-column: 1 !important;
  grid-row: 2 !important;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: var(--dsw-alias-bg-base, #fff);
  color: var(--dsw-alias-label-primary, #171719);
  position: relative; z-index: 10;
}
#dsh-track-graphview[hidden] { display: none; }
#dsh-track-graphview .inv-graphview-head {
  display: flex; align-items: center; gap: 8px; padding: 0 12px;
  height: 38px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.06)); flex: none;
}
#dsh-track-graphview .inv-title { flex: 1; font-weight: 600; font-size: 13px; }
#dsh-track-graphview .inv-act {
  padding: 2px 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.15));
  border-radius: 5px; background: transparent; color: var(--dsw-alias-label-secondary, #555);
  font-size: 11.5px; cursor: pointer;
}
#dsh-track-graphview .inv-graph { flex: 1; min-height: 0; position: relative; overflow: hidden; }
`;
let panel = null;
let fab = null;
let host = null;
let prior = {};
let panelOpen = false;
let panelWidthPx = null;
function readStoredNumber(key) {
	try {
		const v = Number(localStorage.getItem(key));
		return Number.isFinite(v) && v > 0 ? v : null;
	} catch {
		return null;
	}
}
function readOpenState() {
	try {
		return localStorage.getItem(OPEN_KEY) === "1";
	} catch {
		return false;
	}
}
function syncGrid() {
	if (host === null || !panelOpen) return;
	host.candidate.style.gridTemplateColumns = panelWidthPx !== null ? `minmax(0, 1fr) ${panelWidthPx}px` : "minmax(0, 2fr) minmax(0, 1fr)";
}
/**
* Pager controls: first («) / prev (‹) / direct page-number input / next (›) /
* last (»). `kind` selects the data-attr family the delegation handlers read.
*/
function renderPager(page, totalPages, kind) {
	const d = kind === "capture" ? "data-page" : "data-issue-page";
	const cls = kind === "capture" ? "inv-page" : "inv-page inv-issue-page";
	const input = kind === "capture" ? "data-page-input=\"capture\"" : "data-page-input=\"issue\"";
	if (totalPages <= 1) return "";
	return `<button class="${cls}" ${d}="0" ${page === 0 ? "disabled" : ""} title="第一页">«</button><button class="${cls}" ${d}="${page - 1}" ${page === 0 ? "disabled" : ""} title="上一页">‹</button><input class="inv-page-input" ${input} value="${page + 1}" inputmode="numeric" title="跳到第几页（回车）"><span class="inv-page-info">/ ${totalPages}</span><button class="${cls}" ${d}="${page + 1}" ${page >= totalPages - 1 ? "disabled" : ""} title="下一页">›</button><button class="${cls}" ${d}="${totalPages - 1}" ${page >= totalPages - 1 ? "disabled" : ""} title="最后一页">»</button>`;
}
/** The pager currently being paged — its viewport position anchors the scroll
*  across the re-render so clicking a page button no longer makes the panel
*  jump (user feedback 2026-08-14: "点翻页之后页面晃，找不到按钮了"). */
let pagerAnchorTarget = null;
/** Viewport-relative top of one pager inside the panel body scrollport. */
function pagerRelTop(body, target) {
	const pager = body.querySelector(target === "captures" ? ".inv-pager" : ".inv-issue-pager");
	if (pager === null) return null;
	return pager.getBoundingClientRect().top - body.getBoundingClientRect().top;
}
function render(snapshot) {
	if (panel === null) return;
	const q = (sel) => panel.querySelector(sel);
	const body = q(".inv-body");
	const anchor = body !== null && pagerAnchorTarget !== null ? {
		target: pagerAnchorTarget,
		relTop: pagerRelTop(body, pagerAnchorTarget)
	} : null;
	const pendingEl = q(".inv-pending");
	if (pendingEl !== null) {
		const pending = snapshot.issues.filter((i) => i.pendingConfirm !== void 0);
		const pendingCount = q(".inv-pending-count");
		if (pendingCount !== null) pendingCount.textContent = pending.length > 0 ? `(${pending.length})` : "";
		pendingEl.innerHTML = pending.length === 0 ? "<div class=\"inv-empty\">无待确认变更</div>" : pending.map((i) => renderPendingCard(i)).join("");
	}
	const openCaptures = snapshot.captures.filter((c) => c.status === "open").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || (a.id < b.id ? 1 : -1));
	const capEl = q(".inv-captures");
	if (capEl !== null) {
		const totalPages = Math.max(1, Math.ceil(openCaptures.length / CAPTURES_PER_PAGE));
		if (capturePage >= totalPages) capturePage = totalPages - 1;
		const pageCaps = openCaptures.slice(capturePage * CAPTURES_PER_PAGE, (capturePage + 1) * CAPTURES_PER_PAGE);
		capEl.innerHTML = pageCaps.length === 0 ? "<div class=\"inv-empty\">暂无捕获</div>" : pageCaps.map((c) => renderCaptureCard(c)).join("");
		const pager = q(".inv-pager");
		if (pager !== null) pager.innerHTML = renderPager(capturePage, totalPages, "capture");
	}
	const issEl = q(".inv-issues");
	const issCount = q(".inv-issue-count");
	if (issEl !== null) {
		if (issCount !== null) issCount.textContent = snapshot.issues.length > 0 ? `(${snapshot.issues.length})` : "";
		const batchBar = q(".inv-batch-bar");
		const batchCount = q("[data-batch-count]");
		if (batchBar !== null) {
			batchBar.hidden = !batchMode;
			for (const id of [...batchSelected]) {
				const issue = snapshot.issues.find((x) => x.id === id);
				if (issue === void 0 || issue.state === "done" || issue.state === "canceled") batchSelected.delete(id);
			}
			if (batchCount !== null) batchCount.textContent = String(batchSelected.size);
			batchBar.innerHTML = batchConfirmTo !== null ? `<span class="inv-confirm-hint">确认将 ${batchSelected.size} 条标记${batchConfirmTo === "done" ? "完成" : "取消"}？</span><button class="inv-act ${batchConfirmTo === "done" ? "inv-done" : "inv-danger-ghost"}" data-batch-commit>确认</button><button class="inv-act" data-batch-clear>返回</button>` : `<span class="inv-batch-info">已选 <span data-batch-count>${batchSelected.size}</span></span><button class="inv-act inv-done" data-batch-done>完成</button><button class="inv-act inv-danger-ghost" data-batch-cancel>取消</button><button class="inv-act" data-batch-clear>清空</button>`;
		}
		const ordered = [...snapshot.issues].sort((a, b) => {
			const ga = STATE_ORDER[a.state] ?? 9;
			const gb = STATE_ORDER[b.state] ?? 9;
			if (ga !== gb) return ga - gb;
			return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || (a.id < b.id ? 1 : -1);
		});
		const totalPages = Math.max(1, Math.ceil(ordered.length / ISSUES_PER_PAGE));
		if (issuePage >= totalPages) issuePage = totalPages - 1;
		const pageIssues = ordered.slice(issuePage * ISSUES_PER_PAGE, (issuePage + 1) * ISSUES_PER_PAGE);
		const cards = [];
		let prevState = null;
		for (const issue of pageIssues) {
			if (issue.state !== prevState) {
				cards.push(`<div class="inv-state-group">${STATE_LABEL[issue.state] ?? issue.state} (${snapshot.issues.filter((x) => x.state === issue.state).length})</div>`);
				prevState = issue.state;
			}
			cards.push(renderIssueCard(issue));
		}
		issEl.innerHTML = pageIssues.length === 0 ? "<div class=\"inv-empty\">暂无任务</div>" : cards.join("");
		const pager = q(".inv-issue-pager");
		if (pager !== null) pager.innerHTML = renderPager(issuePage, totalPages, "issue");
	}
	if (anchor !== null && anchor.relTop !== null && body !== null) {
		const after = pagerRelTop(body, anchor.target);
		if (after !== null) body.scrollTop = Math.max(0, body.scrollTop + anchor.relTop - after);
	}
	pagerAnchorTarget = null;
}
/** One pending-confirmation card: the machine proposed done/canceled/review; the
*  user confirms (state commit) or dismisses (marker cleared, may re-propose).
*  review = machine cannot tell done from abandoned — asks which way to go. */
function renderPendingCard(i) {
	const pc = i.pendingConfirm;
	const isReview = pc.to === "review";
	const toLabel = pc.to === "done" ? "确认完成" : pc.to === "canceled" ? "确认取消" : "确认完成";
	const reason = `${pc.to === "done" ? "证据显示已完成" : pc.to === "canceled" ? "长期无进展" : "请人工判定状态"}：${escapeHtml(pc.reason)} · ${new Date(pc.at).toLocaleString()}`;
	const actions = isReview ? `<button class="inv-act inv-confirm" data-confirm="${i.id}" data-to="done">确认完成</button><button class="inv-act" data-confirm="${i.id}" data-to="canceled">确认取消</button><button class="inv-act" data-dismiss="${i.id}">还在做</button>` : `<button class="inv-act inv-confirm" data-confirm="${i.id}" data-to="${pc.to}">${toLabel}</button><button class="inv-act" data-dismiss="${i.id}">驳回</button>`;
	return `<div class="inv-card inv-pending-card" data-id="${i.id}"><div class="inv-issue-header"><span class="inv-issue-id">${escapeHtml(i.identifier)}</span><span class="inv-issue-title">${escapeHtml(i.title)}</span></div><div class="inv-pending-reason">${reason}</div><div class="inv-actions">${actions}</div></div>`;
}
/** One capture card with delete (two-step confirm) + promote actions. */
function renderCaptureCard(c) {
	const meta = `${c.tags.map(escapeHtml).join(" · ")}${c.tags.length ? " · " : ""}${new Date(c.createdAt).toLocaleString()}`;
	const isConfirming = confirmCaptureDeleteId === c.id;
	const jump = c.sourceSessionId ? `<button class="inv-act inv-jump" data-jump-session="${escapeHtml(c.sourceSessionId)}" data-jump-message="${escapeHtml(c.sourceMessageId ?? "")}" title="跳回对话中的这条 prompt">↩ 对话</button>` : "";
	const actions = isConfirming ? `<span class="inv-confirm-hint">确认删除？</span><button class="inv-act inv-danger" data-capture-del="${c.id}">确认</button><button class="inv-act" data-capture-cancel="1">取消</button>` : `${jump}<button class="inv-act" data-capture-promote="${c.id}" title="转为任务">转任务</button><button class="inv-act inv-danger-ghost" data-capture-del-ask="${c.id}">删除</button>`;
	return `<div class="inv-card">${escapeHtml(c.content)}<div class="inv-meta">${meta}</div><div class="inv-actions">${actions}</div></div>`;
}
/** One issue card: header row (badge + title + expand) + optional detail body. */
function renderIssueCard(i) {
	const expanded = expandedIssueId === i.id;
	const isConfirmingDelete = confirmIssueDeleteId === i.id;
	const sessionId = i.attachSessionId ?? i.linkedSessionIds[0];
	const jump = sessionId ? `<button class="inv-act inv-jump" data-jump-session="${escapeHtml(sessionId)}" data-jump-message="${escapeHtml(i.promptMessageId ?? "")}" title="跳回对话中的这条 prompt">↩ 对话</button>` : "";
	const terminal = i.state === "done" || i.state === "canceled";
	const sel = batchMode && !terminal ? `<input class="inv-sel" type="checkbox" data-issue-sel="${i.id}" ${batchSelected.has(i.id) ? "checked" : ""} title="选择此任务（批量）">` : "";
	const actionConfirm = confirmIssueAction !== null && confirmIssueAction.id === i.id;
	const actionButtons = terminal || batchMode ? "" : actionConfirm ? `<span class="inv-confirm-hint">确认${confirmIssueAction.to === "done" ? "完成" : "取消"}？</span><button class="inv-act ${confirmIssueAction.to === "done" ? "inv-done" : "inv-danger-ghost"}" data-issue-action-yes="${i.id}" data-to="${confirmIssueAction.to}">确认</button><button class="inv-act" data-issue-cancel="1">返回</button>` : `<button class="inv-act inv-done" data-issue-done-ask="${i.id}" title="标记为已完成">完成</button><button class="inv-act inv-danger-ghost" data-issue-cancel-ask="${i.id}" title="标记为已取消">取消</button>`;
	const actions = isConfirmingDelete ? `<span class="inv-confirm-hint">确认删除任务？</span><button class="inv-act inv-danger" data-issue-del="${i.id}">确认</button><button class="inv-act" data-issue-cancel="1">取消</button>` : `${jump}<button class="inv-act inv-jump" data-lineage="${i.id}" title="查看需求谱系：为什么存在 / 来自哪几句原话 / 被谁取代 / 落在哪个 commit">谱系</button>${actionButtons}<button class="inv-act" data-issue-del-ask="${i.id}">删除</button>`;
	const detail = expanded ? `<div class="inv-issue-detail">${renderIssueDetail(i)}</div>` : "";
	const lineageBox = "<div class=\"inv-lineage\" data-lineage-box=\"" + i.id + "\" hidden></div>";
	return `<div class="inv-card inv-issue-card${expanded ? " inv-expanded" : ""}" data-id="${i.id}"><div class="inv-issue-header" data-issue-toggle="${i.id}"><span class="inv-issue-id">${sel}${escapeHtml(i.identifier)}</span><span class="inv-state inv-state-${i.state}">${i.state}</span>${i.pendingConfirm ? `<span class="inv-state inv-state-pending">待确认</span>` : ""}<span class="inv-issue-title">${escapeHtml(i.title)}</span><span class="inv-chevron">${expanded ? "▾" : "▸"}</span></div>` + detail + lineageBox + `<div class="inv-actions">${actions}</div></div>`;
}
/** Full detail body for one issue (shown when expanded). */
function renderIssueDetail(i) {
	const parts = [];
	if (i.description) parts.push(`<div class="inv-detail-row"><span class="inv-detail-label">描述</span><div class="inv-detail-text">${escapeHtml(i.description)}</div></div>`);
	if (i.acceptanceCriteria) parts.push(`<div class="inv-detail-row"><span class="inv-detail-label">验收</span><div class="inv-detail-text">${escapeHtml(i.acceptanceCriteria)}</div></div>`);
	parts.push(`<div class="inv-detail-row"><span class="inv-detail-label">优先级</span><span>${PRIORITY_LABEL[i.priority] ?? String(i.priority)}</span></div>`);
	if (i.labels.length > 0) parts.push(`<div class="inv-detail-row"><span class="inv-detail-label">标签</span><span>${i.labels.map(escapeHtml).join(", ")}</span></div>`);
	if (i.assignee) parts.push(`<div class="inv-detail-row"><span class="inv-detail-label">负责人</span><span>${escapeHtml(i.assignee)}</span></div>`);
	if (i.parentId) parts.push(`<div class="inv-detail-row"><span class="inv-detail-label">父任务</span><span>${escapeHtml(i.parentId)}</span></div>`);
	parts.push(`<div class="inv-detail-row"><span class="inv-detail-label">创建</span><span>${new Date(i.createdAt).toLocaleString()}</span></div>`);
	parts.push(`<div class="inv-detail-row"><span class="inv-detail-label">更新</span><span>${new Date(i.updatedAt).toLocaleString()}</span></div>`);
	if (i.linkedSessionIds.length > 0) parts.push(`<div class="inv-detail-row"><span class="inv-detail-label">会话</span><span>${i.linkedSessionIds.map(escapeHtml).join(", ")}</span></div>`);
	return parts.join("");
}
function renderLineageHtml(view, issueId) {
	const parts = [];
	const head = view.target.origin ? " (" + ({
		user_explicit: "用户原话",
		user_confirmed: "用户确认",
		agent_proposed: "agent 提议",
		system_inferred: "系统推断"
	}[view.target.origin] ?? view.target.origin) + ")" : "";
	parts.push("<div class=\"inv-lg-title\">谱系 · " + escapeHtml(view.target.title) + head + "</div>");
	if (view.evidence.length > 0) {
		parts.push("<div class=\"inv-lg-group\">证据链（来自原始会话）</div>");
		for (const ev of view.evidence) {
			const jump = ev.promptMessageId ? "<button class=\"inv-act inv-jump\" data-jump-session=\"" + escapeHtml(ev.sessionId) + "\" data-jump-message=\"" + escapeHtml(ev.promptMessageId) + "\" title=\"跳回引发这条需求的 prompt\">↩</button>" : "";
			parts.push("<div class=\"inv-lg-row\">会话 " + escapeHtml(ev.sessionId.slice(0, 18)) + "… seq " + ev.seqStart + "-" + ev.seqEnd + " " + jump + "</div>");
			for (const m of ev.userMessages) {
				const mj = m.messageId ? "<button class=\"inv-act inv-jump\" data-jump-session=\"" + escapeHtml(ev.sessionId) + "\" data-jump-message=\"" + escapeHtml(m.messageId) + "\">↩</button>" : "";
				parts.push("<div class=\"inv-lg-msg\">💬 " + escapeHtml(m.title.slice(0, 80)) + " " + mj + "</div>");
			}
		}
	}
	const evoEdges = view.edges.filter((e) => e.kind === "supersedes" || e.kind === "derives" || e.kind === "spawned-by");
	if (evoEdges.length > 0) {
		parts.push("<div class=\"inv-lg-group\">演化</div>");
		for (const e of evoEdges) {
			const otherId = e.direction === "out" ? e.toId : e.fromId;
			const n = view.neighbors[otherId];
			const label = e.kind === "supersedes" ? e.direction === "out" ? "取代了" : "被取代" : e.kind === "derives" ? e.direction === "out" ? "派生出" : "派生自" : "由";
			parts.push("<div class=\"inv-lg-row\">" + label + " " + (n ? escapeHtml(n.title.slice(0, 60)) : escapeHtml(otherId.slice(0, 24))) + "</div>");
		}
	}
	const sessions = view.edges.filter((e) => e.kind === "executed-in");
	if (sessions.length > 0) parts.push("<div class=\"inv-lg-group\">执行会话（" + sessions.length + "）</div>");
	if (view.commits.length > 0) {
		parts.push("<div class=\"inv-lg-group\">代码落地（commit）</div>");
		for (const c of view.commits) parts.push("<div class=\"inv-lg-row\">" + escapeHtml(c.sha.slice(0, 10)) + " · " + escapeHtml(c.subject.slice(0, 60)) + " · " + new Date(c.authorAt).toLocaleDateString() + "</div>");
	}
	if (parts.length === 1) parts.push("<div class=\"inv-empty\">暂无谱系数据</div>");
	return parts.join("");
}
const CAPTURES_PER_PAGE = 8;
const ISSUES_PER_PAGE = 8;
const PRIORITY_LABEL = {
	0: "urgent",
	1: "high",
	2: "medium",
	3: "low",
	4: "none"
};
/** Issue group order: active work first, then backlog, then finished. */
const STATE_ORDER = {
	in_progress: 0,
	todo: 1,
	done: 2,
	canceled: 3
};
/** Issue group display labels (zh, matching the panel language). */
const STATE_LABEL = {
	in_progress: "进行中",
	todo: "待办",
	done: "已完成",
	canceled: "已取消"
};
let capturePage = 0;
let issuePage = 0;
let expandedIssueId = null;
let confirmCaptureDeleteId = null;
let confirmIssueDeleteId = null;
/** Two-step confirm on a regular card: marking this issue done/canceled. */
let confirmIssueAction = null;
/** Batch mode: checkboxes on issue cards + the batch bar. */
let batchMode = false;
let batchSelected = /* @__PURE__ */ new Set();
/** Batch confirm in flight: commit all selected to this state. */
let batchConfirmTo = null;
function escapeHtml(s) {
	return s.replace(/[&<>"']/g, (ch) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	})[ch]);
}
function refresh(target) {
	if (target !== void 0) pagerAnchorTarget = target;
	fetchSnapshot().then(render);
}
/** Current session id from the sessions service list snapshot. */
function activeSessionId() {
	if (clientCtx === null) return void 0;
	try {
		return clientCtx.sessions.list.getSnapshot().current;
	} catch {
		return;
	}
}
/** Fetch + render the PROJECT graph (multi-session visual graph) into the tab. */
async function renderGraph() {
	if (panel === null) return;
	const el = document.querySelector("#dsh-track-graphview .inv-graph");
	const title = document.querySelector(".inv-graph-session");
	if (el === null) return;
	const sessionId = activeSessionId();
	if (sessionId === void 0 || sessionId === "") {
		el.innerHTML = "<div class=\"inv-empty\">无当前会话 — 打开一个会话后显示项目级会话/需求/代码图谱</div>";
		if (title !== null) title.textContent = "";
		return;
	}
	if (title !== null) title.textContent = "项目图谱";
	let cwd = "";
	try {
		cwd = (await fetch("/api/track/graph?sessionId=" + encodeURIComponent(sessionId)).then((r) => r.json())).doc?.header?.cwd ?? "";
	} catch {
		cwd = "";
	}
	let view = {
		nodes: [],
		edges: []
	};
	try {
		const q = cwd !== "" ? "cwd=" + encodeURIComponent(cwd) : "projectId=";
		view = (await fetch("/api/track/graph/view?" + q).then((r) => r.json())).view ?? view;
	} catch {}
	if (view.nodes.length === 0) {
		el.innerHTML = "<div class=\"inv-empty\">暂无图谱数据 — 点「构建」生成会话图后重试</div>";
		return;
	}
	mountGraphForce(el, view, (n) => {
		if (n.kind === "session" && n.sessionId) jumpToConversation({ sessionId: n.sessionId });
		else if (n.kind === "issue" && n.sessionId) jumpToConversation({
			sessionId: n.sessionId,
			messageId: n.messageId
		});
	});
}
/** Build the current session's graph (POST) then re-render. */
async function buildCurrentGraph() {
	const sessionId = activeSessionId();
	if (sessionId === void 0 || sessionId === "") return;
	try {
		await fetch("/api/track/graph", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ sessionId })
		});
	} catch {}
	await renderGraph();
}
/** Batch build the workspace of the current session (POST build-all). */
async function buildAllGraphs() {
	const sessionId = activeSessionId();
	if (sessionId === void 0 || sessionId === "") return;
	let cwd = "";
	try {
		cwd = (await fetch("/api/track/graph?sessionId=" + encodeURIComponent(sessionId)).then((r) => r.json())).doc?.header?.cwd ?? "";
	} catch {
		cwd = "";
	}
	if (cwd === "") return;
	try {
		await fetch("/api/track/graph/build-all", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				cwd,
				max_sessions: 200
			})
		});
	} catch {}
	await renderGraph();
}
function restoreLayout() {
	graphTab?.remove();
	graphTab = null;
	document.getElementById("dsh-track-graphview")?.remove();
	if (host === null) return;
	host.candidate.classList.remove("inv-host");
	if (host.header !== null) host.header.classList.remove("inv-host-header");
	if (host.headerWrapper !== null) host.headerWrapper.classList.remove("inv-host-header");
	if (host.scrollBody !== null) host.scrollBody.classList.remove("inv-host-scroll");
	if (prior.display !== void 0) host.candidate.style.display = prior.display;
	if (prior.gridColumns !== void 0) host.candidate.style.gridTemplateColumns = prior.gridColumns;
	if (prior.gridRows !== void 0) host.candidate.style.gridTemplateRows = prior.gridRows;
}
let graphMode = false;
let graphTab = null;
/** Full-width graph view: hide the sidebar body, take the whole conversation
*  area (same size as the Chat Trajectory tab). */
function setGraphMode(open) {
	graphMode = open;
	let gv = document.getElementById("dsh-track-graphview");
	if (open && gv === null && host !== null) {
		gv = document.createElement("div");
		gv.id = "dsh-track-graphview";
		gv.innerHTML = "<div class=\"inv-graphview-head\"><span class=\"inv-title\">会话结构图 <span class=\"inv-graph-session\"></span></span><button class=\"inv-act inv-graph-build\" title=\"构建当前会话的执行树\">构建</button><button class=\"inv-act inv-graph-buildall\" title=\"批量构建本工作区所有会话的图\">全构建</button></div><div class=\"inv-graph\"></div>";
		host.candidate.append(gv);
	}
	if (host !== null) {
		if (host.scrollBody !== null) host.scrollBody.style.display = open ? "none" : "";
	}
	if (gv !== null) gv.hidden = !open;
	if (graphTab !== null) graphTab.setAttribute("aria-selected", String(open));
	if (open) renderGraph();
}
function setPanelOpen(open) {
	panelOpen = open;
	if (panel !== null) panel.hidden = !open;
	if (fab !== null) fab.hidden = open;
	if (!open) setGraphMode(false);
	if (graphTab !== null) graphTab.setAttribute("aria-selected", String(open && graphMode));
	try {
		localStorage.setItem(OPEN_KEY, open ? "1" : "0");
	} catch {}
	if (open) syncGrid();
	else if (host !== null) restoreLayout();
}
/** Programmatic entry for the composer-dock strip: ensure the host is
*  mounted (fresh pages may not have attached yet) and open the panel. */
function openTrackPanel() {
	if (host === null) tryMount();
	setPanelOpen(true);
}
function attach(candidate, header, tablist) {
	if (host?.candidate === candidate) return;
	restoreLayout();
	const scrollBody = candidate.querySelector("[data-conversation-scroll]");
	const headerWrapper = header !== null && header.parentElement !== candidate ? header.parentElement : null;
	host = {
		candidate,
		header,
		headerWrapper,
		scrollBody,
		tablist
	};
	prior = {
		display: candidate.style.display,
		gridColumns: candidate.style.gridTemplateColumns,
		gridRows: candidate.style.gridTemplateRows,
		flexDirection: candidate.style.flexDirection,
		headerColumn: header?.style.gridColumn,
		headerRow: header?.style.gridRow,
		scrollColumn: scrollBody?.style.gridColumn,
		scrollRow: scrollBody?.style.gridRow,
		scrollFlex: scrollBody?.style.flex,
		scrollMinWidth: scrollBody?.style.minWidth
	};
	candidate.classList.add("inv-host");
	candidate.style.gridTemplateColumns = "minmax(0, 2fr) minmax(0, 1fr)";
	if (header !== null) header.classList.add("inv-host-header");
	if (headerWrapper !== null) headerWrapper.classList.add("inv-host-header");
	if (scrollBody !== null) scrollBody.classList.add("inv-host-scroll");
	if (panel !== null) {
		if (panel.isConnected) panel.remove();
		candidate.append(panel);
	}
	mountTab();
	syncGrid();
}
/** Append an Track tab to the conversation tab strip (side-panel pattern). */
function mountTab() {
	if (host === null) return;
	let tl = host.tablist;
	if (tl === null || !tl.isConnected) {
		tl = host.candidate.querySelector("[role=\"tablist\"]");
		if (tl !== null) host.tablist = tl;
	}
	if (tl === null || tl === void 0) return;
	if (tl.querySelector(".inv-tab") !== null) return;
	const reference = tl.querySelector(":scope > button[role=\"tab\"][aria-selected=\"false\"]") ?? tl.querySelector(":scope > button[role=\"tab\"]");
	if (reference === null) return;
	const makeTab = (text) => {
		const t = document.createElement("button");
		t.type = "button";
		t.role = "tab";
		t.className = reference.className + " inv-tab";
		const l = document.createElement("span");
		l.textContent = text;
		t.append(l);
		tl.append(t);
		return t;
	};
	const gtab = makeTab("会话结构图");
	gtab.setAttribute("aria-selected", String(false));
	gtab.addEventListener("click", () => {
		setGraphMode(true);
	});
	graphTab = gtab;
	tl.addEventListener("click", (ev) => {
		const t = ev.target.closest("button[role=\"tab\"]");
		if (t === null || t.classList.contains("inv-tab")) return;
		if (graphMode) setGraphMode(false);
	}, true);
}
/**
* Resolve the conversation root hosting the session tab strip.
*
* The side-panel pattern: find the tablist that contains the session tabs
* (Trajectory / 轨迹), climb to its header, then take over the CONVERSATION
* ROOT — the ancestor that actually contains `[data-conversation-scroll]`.
* Older DSH: `header.parentElement` IS the root. The formal release wraps
* the `conversation.session.header` slot in a header-only div, so
* `header.parentElement` is a 76px wrapper with no scroll body — taking it
* over put the panel in a 0px grid row (the 2026-08-13 "click Track does
* nothing" bug). Climbing to the scroll-body ancestor fixes it.
*/
function locateHost() {
	const sessionTablist = [...document.querySelectorAll("[role=\"tablist\"]")].find((tl) => [...tl.querySelectorAll(":scope > button[role=\"tab\"]")].some((tab) => {
		const text = tab.textContent?.trim();
		return text === "Trajectory" || text === "轨迹";
	}));
	const tablists = document.querySelectorAll("[role=\"tablist\"]");
	const tablist = sessionTablist ?? tablists[0] ?? null;
	if (tablist !== null) {
		const header = tablist.closest("header");
		if (header instanceof HTMLElement && header.parentElement instanceof HTMLElement) {
			let candidate = header.parentElement;
			for (let depth = 0; candidate !== null && depth < 6; depth++) {
				const scrollBody = candidate.querySelector("[data-conversation-scroll]");
				if (scrollBody !== null) return {
					candidate,
					header,
					headerWrapper: header.parentElement !== candidate ? header.parentElement : null,
					scrollBody,
					tablist
				};
				candidate = candidate.parentElement;
			}
			return {
				candidate: header.parentElement,
				header,
				headerWrapper: null,
				scrollBody: header.parentElement.querySelector("[data-conversation-scroll]"),
				tablist
			};
		}
	}
	const scroll = document.querySelector("[data-conversation-scroll]");
	if (scroll instanceof HTMLElement && scroll.parentElement instanceof HTMLElement) {
		const root = scroll.parentElement;
		return {
			candidate: root,
			header: root.querySelector("header"),
			headerWrapper: null,
			scrollBody: scroll,
			tablist: root.querySelector("[role=\"tablist\"]")
		};
	}
	return null;
}
function tryMount() {
	if (host !== null && host.candidate.isConnected) {
		if (panel !== null && panel.parentElement !== host.candidate) host.candidate.append(panel);
		const liveTablist = host.candidate.querySelector("[role=\"tablist\"]");
		if (liveTablist !== null) host.tablist = liveTablist;
		host.candidate.classList.add("inv-host");
		if (host.header !== null) host.header.classList.add("inv-host-header");
		if (host.headerWrapper !== null) host.headerWrapper.classList.add("inv-host-header");
		if (host.scrollBody !== null) host.scrollBody.classList.add("inv-host-scroll");
		mountTab();
		syncGrid();
		return;
	}
	restoreLayout();
	host = null;
	const h = locateHost();
	if (h !== null) {
		attach(h.candidate, h.header, h.tablist);
		setPanelOpen(readOpenState());
	}
}
/** Build the panel DOM, FAB, and wire events. Returns a disposer.
*  @param ctx - client root context (needed for the jump-back links:
*  `ctx.sessions.open` / `binding` resolve the source conversation). */
function mountRightPanel(ctx) {
	clientCtx = ctx;
	const style = document.createElement("style");
	style.textContent = PANEL_CSS;
	document.head.appendChild(style);
	panel = document.createElement("aside");
	panel.id = PANEL_ID;
	panel.hidden = true;
	panel.innerHTML = buildPanelHtml();
	fab = document.createElement("button");
	fab.id = FAB_ID;
	fab.type = "button";
	fab.title = "Track";
	fab.textContent = "◆";
	fab.hidden = false;
	document.body.appendChild(fab);
	panel.querySelector(".inv-close")?.addEventListener("click", () => setPanelOpen(false));
	panel.querySelector(".inv-refresh")?.addEventListener("click", () => refresh());
	const settingsPanel = panel.querySelector(".inv-settings-panel");
	const loadConfig = (cfg) => {
		settingsPanel?.querySelectorAll(".inv-set").forEach((el) => {
			const key = el.dataset.set;
			if (key && cfg[key] !== void 0) el.value = String(cfg[key]);
		});
	};
	panel.querySelector(".inv-settings")?.addEventListener("click", () => {
		if (settingsPanel === null) return;
		settingsPanel.hidden = !settingsPanel.hidden;
		if (!settingsPanel.hidden) fetch("/api/track/config").then((r) => r.json()).then((d) => loadConfig(d.config ?? {}));
	});
	panel.querySelector(".inv-save-config")?.addEventListener("click", () => {
		const patch = {};
		settingsPanel?.querySelectorAll(".inv-set").forEach((el) => {
			const key = el.dataset.set;
			if (!key) return;
			const v = el.type === "number" ? Number(el.value) : el.value;
			if (el.type === "number" ? Number.isFinite(v) : v !== "") patch[key] = v;
		});
		fetch("/api/track/config", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(patch)
		}).then((r) => r.json()).then((d) => {
			if (d.ok && d.config) loadConfig(d.config);
		});
	});
	const captureBtn = panel.querySelector(".inv-capture");
	const inputEl = panel.querySelector(".inv-input");
	const doCapture = () => {
		const content = inputEl?.value.trim();
		if (!content) return;
		fetch("/api/track/captures", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				content,
				tags: []
			})
		}).then(() => {
			if (inputEl) inputEl.value = "";
			refresh();
		});
	};
	captureBtn?.addEventListener("click", doCapture);
	inputEl?.addEventListener("keydown", (e) => {
		if (e.key === "Enter") doCapture();
	});
	const onAction = (e) => {
		if (panel === null) return;
		const target = e.target;
		const issuePageBtn = target.closest(".inv-issue-page");
		if (issuePageBtn !== null && !issuePageBtn.disabled) {
			const page = Number(issuePageBtn.dataset.issuePage);
			if (Number.isInteger(page) && page >= 0) {
				issuePage = page;
				expandedIssueId = null;
				refresh("issues");
			}
			return;
		}
		const pageBtn = target.closest(".inv-page");
		if (pageBtn !== null && !pageBtn.disabled) {
			const page = Number(pageBtn.dataset.page);
			if (Number.isInteger(page) && page >= 0) {
				capturePage = page;
				refresh("captures");
			}
			return;
		}
		const selBox = target.closest("[data-issue-sel]");
		if (selBox !== null) {
			const id = selBox.getAttribute("data-issue-sel");
			if (id) {
				if (batchSelected.has(id)) batchSelected.delete(id);
				else batchSelected.add(id);
				batchConfirmTo = null;
				refresh();
			}
			return;
		}
		if (target.closest("[data-batch-toggle]") !== null) {
			batchMode = !batchMode;
			batchSelected.clear();
			batchConfirmTo = null;
			confirmIssueAction = null;
			refresh();
			return;
		}
		if (target.closest("[data-batch-done]") !== null) {
			batchConfirmTo = "done";
			refresh();
			return;
		}
		if (target.closest("[data-batch-cancel]") !== null) {
			batchConfirmTo = "canceled";
			refresh();
			return;
		}
		if (target.closest("[data-batch-commit]") !== null) {
			const to = batchConfirmTo;
			const ids = [...batchSelected];
			batchConfirmTo = null;
			batchSelected.clear();
			if (to !== null && ids.length > 0) fetch("/api/track/issues/batch", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					ids,
					to
				})
			}).catch(() => void 0).then(() => refresh());
			else refresh();
			return;
		}
		if (target.closest("[data-batch-clear]") !== null) {
			batchSelected.clear();
			batchConfirmTo = null;
			refresh();
			return;
		}
		const issueDoneAsk = target.closest("[data-issue-done-ask]");
		if (issueDoneAsk !== null) {
			const id = issueDoneAsk.getAttribute("data-issue-done-ask");
			if (id) confirmIssueAction = {
				id,
				to: "done"
			};
			refresh();
			return;
		}
		const issueCancelAsk = target.closest("[data-issue-cancel-ask]");
		if (issueCancelAsk !== null) {
			const id = issueCancelAsk.getAttribute("data-issue-cancel-ask");
			if (id) confirmIssueAction = {
				id,
				to: "canceled"
			};
			refresh();
			return;
		}
		const issueActionYes = target.closest("[data-issue-action-yes]");
		if (issueActionYes !== null) {
			const id = issueActionYes.getAttribute("data-issue-action-yes");
			const to = issueActionYes.getAttribute("data-to");
			const action = confirmIssueAction;
			confirmIssueAction = null;
			if (id && (to === "done" || to === "canceled") && action !== null && action.id === id) fetch(`/api/track/issues/${encodeURIComponent(id)}/confirm`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ to })
			}).then(() => refresh());
			else refresh();
			return;
		}
		const toggle = target.closest("[data-issue-toggle]");
		if (toggle !== null) {
			const id = toggle.getAttribute("data-issue-toggle");
			if (id) {
				expandedIssueId = expandedIssueId === id ? null : id;
				refresh();
			}
			return;
		}
		const jump = target.closest("[data-jump-session]");
		if (jump !== null) {
			jumpToConversation({
				sessionId: jump.getAttribute("data-jump-session") ?? void 0,
				messageId: jump.getAttribute("data-jump-message") || void 0
			});
			return;
		}
		const delAsk = target.closest("[data-capture-del-ask]");
		if (delAsk !== null) {
			confirmCaptureDeleteId = delAsk.getAttribute("data-capture-del-ask");
			refresh();
			return;
		}
		const delYes = target.closest("[data-capture-del]");
		if (delYes !== null) {
			const id = delYes.getAttribute("data-capture-del");
			confirmCaptureDeleteId = null;
			if (id) fetch(`/api/track/captures/${encodeURIComponent(id)}`, { method: "DELETE" }).then(() => refresh());
			else refresh();
			return;
		}
		const promote = target.closest("[data-capture-promote]");
		if (promote !== null) {
			const id = promote.getAttribute("data-capture-promote");
			if (id) fetch(`/api/track/captures/${encodeURIComponent(id)}/promote`, { method: "POST" }).then(() => refresh());
			return;
		}
		const confirmBtn = target.closest("[data-confirm]");
		if (confirmBtn !== null) {
			const id = confirmBtn.getAttribute("data-confirm");
			const to = confirmBtn.getAttribute("data-to");
			if (id && (to === "done" || to === "canceled")) fetch(`/api/track/issues/${encodeURIComponent(id)}/confirm`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ to })
			}).then(() => refresh());
			return;
		}
		const dismissBtn = target.closest("[data-dismiss]");
		if (dismissBtn !== null) {
			const id = dismissBtn.getAttribute("data-dismiss");
			if (id) fetch(`/api/track/issues/${encodeURIComponent(id)}/dismiss`, { method: "POST" }).then(() => refresh());
			return;
		}
		const issueDelAsk = target.closest("[data-issue-del-ask]");
		if (issueDelAsk !== null) {
			confirmIssueDeleteId = issueDelAsk.getAttribute("data-issue-del-ask");
			refresh();
			return;
		}
		const issueDelYes = target.closest("[data-issue-del]");
		if (issueDelYes !== null) {
			const id = issueDelYes.getAttribute("data-issue-del");
			confirmIssueDeleteId = null;
			if (id) fetch(`/api/track/issues/${encodeURIComponent(id)}`, { method: "DELETE" }).then(() => refresh());
			else refresh();
			return;
		}
		if (target.closest(".inv-graph-build") !== null) {
			buildCurrentGraph();
			return;
		}
		if (target.closest(".inv-graph-buildall") !== null) {
			buildAllGraphs();
			return;
		}
		const lineageBtn = target.closest("[data-lineage]");
		if (lineageBtn !== null) {
			const id = lineageBtn.getAttribute("data-lineage");
			if (id) {
				const box = panel?.querySelector("[data-lineage-box=\"" + id + "\"]");
				if (box !== null) {
					if (!box.hidden) {
						box.hidden = true;
						return;
					}
					box.hidden = false;
					box.innerHTML = "<div class=\"inv-empty\">加载中…</div>";
					fetch("/api/track/lineage?entity=" + encodeURIComponent(id)).then((r) => r.json()).then((d) => {
						if (d.view) box.innerHTML = renderLineageHtml(d.view, id);
						else box.innerHTML = "<div class=\"inv-empty\">暂无谱系数据</div>";
					}).catch(() => {
						box.innerHTML = "<div class=\"inv-empty\">加载失败</div>";
					});
				}
			}
			return;
		}
		if (target.closest("[data-capture-cancel], [data-issue-cancel]") !== null) {
			confirmCaptureDeleteId = null;
			confirmIssueDeleteId = null;
			confirmIssueAction = null;
			batchConfirmTo = null;
			refresh();
		}
	};
	panel.addEventListener("click", onAction);
	panel.addEventListener("keydown", (e) => {
		if (e.key !== "Enter") return;
		const input = e.target.closest("[data-page-input]");
		if (input === null) return;
		const kind = input.getAttribute("data-page-input");
		const page = Number(input.value);
		if (!Number.isInteger(page) || page < 1) return;
		if (kind === "capture") {
			capturePage = page - 1;
			refresh("captures");
		} else if (kind === "issue") {
			issuePage = page - 1;
			expandedIssueId = null;
			refresh("issues");
		}
	});
	const resizer = panel.querySelector(".inv-width-resizer");
	let dragStartX = 0;
	let dragStartWidth = 0;
	const widthMove = (e) => {
		const w = dragStartWidth + dragStartX - e.clientX;
		if (w < 220) return;
		panelWidthPx = w;
		syncGrid();
	};
	const widthUp = () => {
		window.removeEventListener("pointermove", widthMove);
		window.removeEventListener("pointerup", widthUp);
		if (panelWidthPx !== null) try {
			localStorage.setItem(WIDTH_KEY, String(panelWidthPx));
		} catch {}
	};
	resizer?.addEventListener("pointerdown", (e) => {
		e.preventDefault();
		dragStartX = e.clientX;
		dragStartWidth = panelWidthPx ?? 360;
		window.addEventListener("pointermove", widthMove);
		window.addEventListener("pointerup", widthUp);
	});
	fab.addEventListener("click", () => {
		setPanelOpen(!panelOpen);
	});
	panelWidthPx = readStoredNumber(WIDTH_KEY);
	const observer = new MutationObserver(tryMount);
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	tryMount();
	refresh();
	renderGraph();
	const mountRetries = [
		500,
		1500,
		3e3
	].map((ms) => window.setTimeout(tryMount, ms));
	const autoRefresh = window.setInterval(() => {
		tryMount();
		if (panelOpen && !document.hidden) {
			refresh();
			renderGraph();
		}
	}, 2e4);
	const onFocus = () => {
		tryMount();
		refresh();
		renderGraph();
	};
	let unsubSessions;
	try {
		unsubSessions = clientCtx.sessions.list.subscribe(() => {
			if (panelOpen) renderGraph();
		});
	} catch {
		unsubSessions = void 0;
	}
	window.addEventListener("focus", onFocus);
	return () => {
		if (unsubSessions !== void 0) unsubSessions();
		observer.disconnect();
		mountRetries.forEach((id) => window.clearTimeout(id));
		window.clearInterval(autoRefresh);
		window.removeEventListener("focus", onFocus);
		restoreLayout();
		panel?.remove();
		fab?.remove();
		style.remove();
		panel = null;
		fab = null;
		host = null;
		clientCtx = null;
	};
}
//#endregion
//#region lib/client/index.js
/**
* Track Bridge client plugin — browser half.
*
* Visible surfaces:
* 1. A sidebar entry row ("Track") injected below New Session — the
*    primary entry point (sidebar slots are single-occupant; DOM injection
*    is the task-board precedent).
* 2. A center-column panel (capture wall + pending decisions + issues)
*    toggled by the entry, fed by the host HTTP API (/api/track/*).
* 3. A composer-dock strip showing pending counts.
* @module @fakechris/dsh-track/client
*/
/** Required services: slot registration, locale dictionaries, and the
*  sessions face (the right-panel jump-back links call ctx.sessions.open /
*  binding — cordis property access requires the service declared). */
const inject = [
	"slots",
	"locale",
	"sessions"
];
/**
* Client plugin body: sidebar entry + center panel + composer strip.
* @param ctx - client root context.
*/
function apply(ctx) {
	console.log("[dsh-track] client apply called");
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en
	}), "dsh-track: dictionaries");
	const panelDisposer = mountRightPanel(ctx);
	ctx.effect(() => panelDisposer, "dsh-track: right panel");
	const injectActions = () => ({
		captures: 0,
		onClick: openTrackPanel
	});
	ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
		name: "conversation.composer.dock",
		id: "track",
		order: 20,
		locale: NS,
		inject: injectActions
	}, TrackStrip));
}
//#endregion
exports.apply = apply;
exports.inject = inject;

return module.exports; } });