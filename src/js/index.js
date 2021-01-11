"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_dom_1 = __importDefault(require("react-dom"));
var react_1 = __importStar(require("react"));
var react_three_fiber_1 = require("react-three-fiber");
var Box = function (props) {
    var mesh = react_1.useRef();
    var _a = react_1.useState(false), hovered = _a[0], setHover = _a[1];
    var _b = react_1.useState(false), active = _b[0], setActive = _b[1];
    react_three_fiber_1.useFrame(function () {
        if (mesh.current)
            mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
    });
    return (react_1.default.createElement("mesh", __assign({}, props, { ref: mesh, scale: active ? [1.5, 1.5, 1.5] : [1, 1, 1], onClick: function (event) { return setActive(!active); }, onPointerOver: function (event) { return setHover(true); }, onPointerOut: function (event) { return setHover(false); } }),
        react_1.default.createElement("boxBufferGeometry", { args: [1, 1, 1] }),
        react_1.default.createElement("meshStandardMaterial", { color: hovered ? 'hotpink' : 'orange' })));
};
react_dom_1.default.render(react_1.default.createElement(react_three_fiber_1.Canvas, null,
    react_1.default.createElement("ambientLight", null),
    react_1.default.createElement("pointLight", { position: [10, 10, 10] }),
    react_1.default.createElement(Box, { position: [-1.2, 0, 0] }),
    react_1.default.createElement(Box, { position: [1.2, 0, 0] })), document.getElementById('root'));
//# sourceMappingURL=index.js.map