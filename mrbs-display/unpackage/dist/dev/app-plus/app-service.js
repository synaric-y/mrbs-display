if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue, shared) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return shared.isString(component) ? easycom : component;
  }
  const isObject$2 = (val) => val !== null && typeof val === "object";
  const defaultDelimiters = ["{", "}"];
  class BaseFormatter {
    constructor() {
      this._caches = /* @__PURE__ */ Object.create(null);
    }
    interpolate(message, values, delimiters = defaultDelimiters) {
      if (!values) {
        return [message];
      }
      let tokens = this._caches[message];
      if (!tokens) {
        tokens = parse$1(message, delimiters);
        this._caches[message] = tokens;
      }
      return compile(tokens, values);
    }
  }
  const RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
  const RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;
  function parse$1(format2, [startDelimiter, endDelimiter]) {
    const tokens = [];
    let position = 0;
    let text = "";
    while (position < format2.length) {
      let char = format2[position++];
      if (char === startDelimiter) {
        if (text) {
          tokens.push({ type: "text", value: text });
        }
        text = "";
        let sub = "";
        char = format2[position++];
        while (char !== void 0 && char !== endDelimiter) {
          sub += char;
          char = format2[position++];
        }
        const isClosed = char === endDelimiter;
        const type = RE_TOKEN_LIST_VALUE.test(sub) ? "list" : isClosed && RE_TOKEN_NAMED_VALUE.test(sub) ? "named" : "unknown";
        tokens.push({ value: sub, type });
      } else {
        text += char;
      }
    }
    text && tokens.push({ type: "text", value: text });
    return tokens;
  }
  function compile(tokens, values) {
    const compiled = [];
    let index = 0;
    const mode = Array.isArray(values) ? "list" : isObject$2(values) ? "named" : "unknown";
    if (mode === "unknown") {
      return compiled;
    }
    while (index < tokens.length) {
      const token = tokens[index];
      switch (token.type) {
        case "text":
          compiled.push(token.value);
          break;
        case "list":
          compiled.push(values[parseInt(token.value, 10)]);
          break;
        case "named":
          if (mode === "named") {
            compiled.push(values[token.value]);
          } else {
            {
              console.warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`);
            }
          }
          break;
        case "unknown":
          {
            console.warn(`Detect 'unknown' type of token!`);
          }
          break;
      }
      index++;
    }
    return compiled;
  }
  const LOCALE_ZH_HANS = "zh-Hans";
  const LOCALE_ZH_HANT = "zh-Hant";
  const LOCALE_EN = "en";
  const LOCALE_FR = "fr";
  const LOCALE_ES = "es";
  const hasOwnProperty$2 = Object.prototype.hasOwnProperty;
  const hasOwn$2 = (val, key) => hasOwnProperty$2.call(val, key);
  const defaultFormatter = new BaseFormatter();
  function include(str, parts) {
    return !!parts.find((part) => str.indexOf(part) !== -1);
  }
  function startsWith(str, parts) {
    return parts.find((part) => str.indexOf(part) === 0);
  }
  function normalizeLocale(locale, messages2) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages2 && messages2[locale]) {
      return locale;
    }
    locale = locale.toLowerCase();
    if (locale === "chinese") {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("zh") === 0) {
      if (locale.indexOf("-hans") > -1) {
        return LOCALE_ZH_HANS;
      }
      if (locale.indexOf("-hant") > -1) {
        return LOCALE_ZH_HANT;
      }
      if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
        return LOCALE_ZH_HANT;
      }
      return LOCALE_ZH_HANS;
    }
    let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
    if (messages2 && Object.keys(messages2).length > 0) {
      locales = Object.keys(messages2);
    }
    const lang = startsWith(locale, locales);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages: messages2, watcher, formater }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater || defaultFormatter;
      this.messages = messages2 || {};
      this.setLocale(locale || LOCALE_EN);
      if (watcher) {
        this.watchLocale(watcher);
      }
    }
    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = normalizeLocale(locale, this.messages) || this.fallbackLocale;
      if (!this.messages[this.locale]) {
        this.messages[this.locale] = {};
      }
      this.message = this.messages[this.locale];
      if (oldLocale !== this.locale) {
        this.watchers.forEach((watcher) => {
          watcher(this.locale, oldLocale);
        });
      }
    }
    getLocale() {
      return this.locale;
    }
    watchLocale(fn) {
      const index = this.watchers.push(fn) - 1;
      return () => {
        this.watchers.splice(index, 1);
      };
    }
    add(locale, message, override = true) {
      const curMessages = this.messages[locale];
      if (curMessages) {
        if (override) {
          Object.assign(curMessages, message);
        } else {
          Object.keys(message).forEach((key) => {
            if (!hasOwn$2(curMessages, key)) {
              curMessages[key] = message[key];
            }
          });
        }
      } else {
        this.messages[locale] = message;
      }
    }
    f(message, values, delimiters) {
      return this.formater.interpolate(message, values, delimiters).join("");
    }
    t(key, locale, values) {
      let message = this.message;
      if (typeof locale === "string") {
        locale = normalizeLocale(locale, this.messages);
        locale && (message = this.messages[locale]);
      } else {
        values = locale;
      }
      if (!hasOwn$2(message, key)) {
        console.warn(`Cannot translate the value of keypath ${key}. Use the value of keypath as default.`);
        return key;
      }
      return this.formater.interpolate(message[key], values).join("");
    }
  }
  function watchAppLocale(appVm, i18n2) {
    if (appVm.$watchLocale) {
      appVm.$watchLocale((newLocale) => {
        i18n2.setLocale(newLocale);
      });
    } else {
      appVm.$watch(() => appVm.$locale, (newLocale) => {
        i18n2.setLocale(newLocale);
      });
    }
  }
  function getDefaultLocale() {
    if (typeof uni !== "undefined" && uni.getLocale) {
      return uni.getLocale();
    }
    if (typeof global !== "undefined" && global.getLocale) {
      return global.getLocale();
    }
    return LOCALE_EN;
  }
  function initVueI18n(locale, messages2 = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      [locale, messages2] = [
        messages2,
        locale
      ];
    }
    if (typeof locale !== "string") {
      locale = getDefaultLocale();
    }
    if (typeof fallbackLocale !== "string") {
      fallbackLocale = typeof __uniConfig !== "undefined" && __uniConfig.fallbackLocale || LOCALE_EN;
    }
    const i18n2 = new I18n({
      locale,
      fallbackLocale,
      messages: messages2,
      watcher
    });
    let t2 = (key, values) => {
      if (typeof getApp !== "function") {
        t2 = function(key2, values2) {
          return i18n2.t(key2, values2);
        };
      } else {
        let isWatchedAppLocale = false;
        t2 = function(key2, values2) {
          const appVm = getApp().$vm;
          if (appVm) {
            appVm.$locale;
            if (!isWatchedAppLocale) {
              isWatchedAppLocale = true;
              watchAppLocale(appVm, i18n2);
            }
          }
          return i18n2.t(key2, values2);
        };
      }
      return t2(key, values);
    };
    return {
      i18n: i18n2,
      f(message, values, delimiters) {
        return i18n2.f(message, values, delimiters);
      },
      t(key, values) {
        return t2(key, values);
      },
      add(locale2, message, override = true) {
        return i18n2.add(locale2, message, override);
      },
      watch(fn) {
        return i18n2.watchLocale(fn);
      },
      getLocale() {
        return i18n2.getLocale();
      },
      setLocale(newLocale) {
        return i18n2.setLocale(newLocale);
      }
    };
  }
  const pages = [
    {
      path: "pages/index/index",
      style: {
        navigationBarTitleText: "uni-app"
      }
    }
  ];
  const globalStyle = {
    navigationStyle: "custom",
    rpxCalcMaxDeviceWidth: 2e3
  };
  const uniIdRouter = {};
  const t = {
    pages,
    globalStyle,
    uniIdRouter
  };
  function n(e) {
    return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
  }
  function s(e, t2, n2) {
    return e(n2 = { path: t2, exports: {}, require: function(e2, t3) {
      return function() {
        throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
      }(null == t3 && n2.path);
    } }, n2.exports), n2.exports;
  }
  var r = s(function(e, t2) {
    var n2;
    e.exports = (n2 = n2 || function(e2, t3) {
      var n3 = Object.create || function() {
        function e3() {
        }
        return function(t4) {
          var n4;
          return e3.prototype = t4, n4 = new e3(), e3.prototype = null, n4;
        };
      }(), s2 = {}, r2 = s2.lib = {}, i2 = r2.Base = { extend: function(e3) {
        var t4 = n3(this);
        return e3 && t4.mixIn(e3), t4.hasOwnProperty("init") && this.init !== t4.init || (t4.init = function() {
          t4.$super.init.apply(this, arguments);
        }), t4.init.prototype = t4, t4.$super = this, t4;
      }, create: function() {
        var e3 = this.extend();
        return e3.init.apply(e3, arguments), e3;
      }, init: function() {
      }, mixIn: function(e3) {
        for (var t4 in e3)
          e3.hasOwnProperty(t4) && (this[t4] = e3[t4]);
        e3.hasOwnProperty("toString") && (this.toString = e3.toString);
      }, clone: function() {
        return this.init.prototype.extend(this);
      } }, o2 = r2.WordArray = i2.extend({ init: function(e3, n4) {
        e3 = this.words = e3 || [], this.sigBytes = n4 != t3 ? n4 : 4 * e3.length;
      }, toString: function(e3) {
        return (e3 || c2).stringify(this);
      }, concat: function(e3) {
        var t4 = this.words, n4 = e3.words, s3 = this.sigBytes, r3 = e3.sigBytes;
        if (this.clamp(), s3 % 4)
          for (var i3 = 0; i3 < r3; i3++) {
            var o3 = n4[i3 >>> 2] >>> 24 - i3 % 4 * 8 & 255;
            t4[s3 + i3 >>> 2] |= o3 << 24 - (s3 + i3) % 4 * 8;
          }
        else
          for (i3 = 0; i3 < r3; i3 += 4)
            t4[s3 + i3 >>> 2] = n4[i3 >>> 2];
        return this.sigBytes += r3, this;
      }, clamp: function() {
        var t4 = this.words, n4 = this.sigBytes;
        t4[n4 >>> 2] &= 4294967295 << 32 - n4 % 4 * 8, t4.length = e2.ceil(n4 / 4);
      }, clone: function() {
        var e3 = i2.clone.call(this);
        return e3.words = this.words.slice(0), e3;
      }, random: function(t4) {
        for (var n4, s3 = [], r3 = function(t5) {
          t5 = t5;
          var n5 = 987654321, s4 = 4294967295;
          return function() {
            var r4 = ((n5 = 36969 * (65535 & n5) + (n5 >> 16) & s4) << 16) + (t5 = 18e3 * (65535 & t5) + (t5 >> 16) & s4) & s4;
            return r4 /= 4294967296, (r4 += 0.5) * (e2.random() > 0.5 ? 1 : -1);
          };
        }, i3 = 0; i3 < t4; i3 += 4) {
          var a3 = r3(4294967296 * (n4 || e2.random()));
          n4 = 987654071 * a3(), s3.push(4294967296 * a3() | 0);
        }
        return new o2.init(s3, t4);
      } }), a2 = s2.enc = {}, c2 = a2.Hex = { stringify: function(e3) {
        for (var t4 = e3.words, n4 = e3.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push((i3 >>> 4).toString(16)), s3.push((15 & i3).toString(16));
        }
        return s3.join("");
      }, parse: function(e3) {
        for (var t4 = e3.length, n4 = [], s3 = 0; s3 < t4; s3 += 2)
          n4[s3 >>> 3] |= parseInt(e3.substr(s3, 2), 16) << 24 - s3 % 8 * 4;
        return new o2.init(n4, t4 / 2);
      } }, u2 = a2.Latin1 = { stringify: function(e3) {
        for (var t4 = e3.words, n4 = e3.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push(String.fromCharCode(i3));
        }
        return s3.join("");
      }, parse: function(e3) {
        for (var t4 = e3.length, n4 = [], s3 = 0; s3 < t4; s3++)
          n4[s3 >>> 2] |= (255 & e3.charCodeAt(s3)) << 24 - s3 % 4 * 8;
        return new o2.init(n4, t4);
      } }, h2 = a2.Utf8 = { stringify: function(e3) {
        try {
          return decodeURIComponent(escape(u2.stringify(e3)));
        } catch (e4) {
          throw new Error("Malformed UTF-8 data");
        }
      }, parse: function(e3) {
        return u2.parse(unescape(encodeURIComponent(e3)));
      } }, l2 = r2.BufferedBlockAlgorithm = i2.extend({ reset: function() {
        this._data = new o2.init(), this._nDataBytes = 0;
      }, _append: function(e3) {
        "string" == typeof e3 && (e3 = h2.parse(e3)), this._data.concat(e3), this._nDataBytes += e3.sigBytes;
      }, _process: function(t4) {
        var n4 = this._data, s3 = n4.words, r3 = n4.sigBytes, i3 = this.blockSize, a3 = r3 / (4 * i3), c3 = (a3 = t4 ? e2.ceil(a3) : e2.max((0 | a3) - this._minBufferSize, 0)) * i3, u3 = e2.min(4 * c3, r3);
        if (c3) {
          for (var h3 = 0; h3 < c3; h3 += i3)
            this._doProcessBlock(s3, h3);
          var l3 = s3.splice(0, c3);
          n4.sigBytes -= u3;
        }
        return new o2.init(l3, u3);
      }, clone: function() {
        var e3 = i2.clone.call(this);
        return e3._data = this._data.clone(), e3;
      }, _minBufferSize: 0 });
      r2.Hasher = l2.extend({ cfg: i2.extend(), init: function(e3) {
        this.cfg = this.cfg.extend(e3), this.reset();
      }, reset: function() {
        l2.reset.call(this), this._doReset();
      }, update: function(e3) {
        return this._append(e3), this._process(), this;
      }, finalize: function(e3) {
        return e3 && this._append(e3), this._doFinalize();
      }, blockSize: 16, _createHelper: function(e3) {
        return function(t4, n4) {
          return new e3.init(n4).finalize(t4);
        };
      }, _createHmacHelper: function(e3) {
        return function(t4, n4) {
          return new d2.HMAC.init(e3, n4).finalize(t4);
        };
      } });
      var d2 = s2.algo = {};
      return s2;
    }(Math), n2);
  }), i = r, o = (s(function(e, t2) {
    var n2;
    e.exports = (n2 = i, function(e2) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [];
      !function() {
        for (var t4 = 0; t4 < 64; t4++)
          a2[t4] = 4294967296 * e2.abs(e2.sin(t4 + 1)) | 0;
      }();
      var c2 = o2.MD5 = i2.extend({ _doReset: function() {
        this._hash = new r2.init([1732584193, 4023233417, 2562383102, 271733878]);
      }, _doProcessBlock: function(e3, t4) {
        for (var n3 = 0; n3 < 16; n3++) {
          var s3 = t4 + n3, r3 = e3[s3];
          e3[s3] = 16711935 & (r3 << 8 | r3 >>> 24) | 4278255360 & (r3 << 24 | r3 >>> 8);
        }
        var i3 = this._hash.words, o3 = e3[t4 + 0], c3 = e3[t4 + 1], p2 = e3[t4 + 2], f2 = e3[t4 + 3], g2 = e3[t4 + 4], m2 = e3[t4 + 5], y2 = e3[t4 + 6], _2 = e3[t4 + 7], w2 = e3[t4 + 8], v2 = e3[t4 + 9], I2 = e3[t4 + 10], S2 = e3[t4 + 11], b2 = e3[t4 + 12], k2 = e3[t4 + 13], C = e3[t4 + 14], T2 = e3[t4 + 15], P2 = i3[0], A2 = i3[1], E2 = i3[2], O = i3[3];
        P2 = u2(P2, A2, E2, O, o3, 7, a2[0]), O = u2(O, P2, A2, E2, c3, 12, a2[1]), E2 = u2(E2, O, P2, A2, p2, 17, a2[2]), A2 = u2(A2, E2, O, P2, f2, 22, a2[3]), P2 = u2(P2, A2, E2, O, g2, 7, a2[4]), O = u2(O, P2, A2, E2, m2, 12, a2[5]), E2 = u2(E2, O, P2, A2, y2, 17, a2[6]), A2 = u2(A2, E2, O, P2, _2, 22, a2[7]), P2 = u2(P2, A2, E2, O, w2, 7, a2[8]), O = u2(O, P2, A2, E2, v2, 12, a2[9]), E2 = u2(E2, O, P2, A2, I2, 17, a2[10]), A2 = u2(A2, E2, O, P2, S2, 22, a2[11]), P2 = u2(P2, A2, E2, O, b2, 7, a2[12]), O = u2(O, P2, A2, E2, k2, 12, a2[13]), E2 = u2(E2, O, P2, A2, C, 17, a2[14]), P2 = h2(P2, A2 = u2(A2, E2, O, P2, T2, 22, a2[15]), E2, O, c3, 5, a2[16]), O = h2(O, P2, A2, E2, y2, 9, a2[17]), E2 = h2(E2, O, P2, A2, S2, 14, a2[18]), A2 = h2(A2, E2, O, P2, o3, 20, a2[19]), P2 = h2(P2, A2, E2, O, m2, 5, a2[20]), O = h2(O, P2, A2, E2, I2, 9, a2[21]), E2 = h2(E2, O, P2, A2, T2, 14, a2[22]), A2 = h2(A2, E2, O, P2, g2, 20, a2[23]), P2 = h2(P2, A2, E2, O, v2, 5, a2[24]), O = h2(O, P2, A2, E2, C, 9, a2[25]), E2 = h2(E2, O, P2, A2, f2, 14, a2[26]), A2 = h2(A2, E2, O, P2, w2, 20, a2[27]), P2 = h2(P2, A2, E2, O, k2, 5, a2[28]), O = h2(O, P2, A2, E2, p2, 9, a2[29]), E2 = h2(E2, O, P2, A2, _2, 14, a2[30]), P2 = l2(P2, A2 = h2(A2, E2, O, P2, b2, 20, a2[31]), E2, O, m2, 4, a2[32]), O = l2(O, P2, A2, E2, w2, 11, a2[33]), E2 = l2(E2, O, P2, A2, S2, 16, a2[34]), A2 = l2(A2, E2, O, P2, C, 23, a2[35]), P2 = l2(P2, A2, E2, O, c3, 4, a2[36]), O = l2(O, P2, A2, E2, g2, 11, a2[37]), E2 = l2(E2, O, P2, A2, _2, 16, a2[38]), A2 = l2(A2, E2, O, P2, I2, 23, a2[39]), P2 = l2(P2, A2, E2, O, k2, 4, a2[40]), O = l2(O, P2, A2, E2, o3, 11, a2[41]), E2 = l2(E2, O, P2, A2, f2, 16, a2[42]), A2 = l2(A2, E2, O, P2, y2, 23, a2[43]), P2 = l2(P2, A2, E2, O, v2, 4, a2[44]), O = l2(O, P2, A2, E2, b2, 11, a2[45]), E2 = l2(E2, O, P2, A2, T2, 16, a2[46]), P2 = d2(P2, A2 = l2(A2, E2, O, P2, p2, 23, a2[47]), E2, O, o3, 6, a2[48]), O = d2(O, P2, A2, E2, _2, 10, a2[49]), E2 = d2(E2, O, P2, A2, C, 15, a2[50]), A2 = d2(A2, E2, O, P2, m2, 21, a2[51]), P2 = d2(P2, A2, E2, O, b2, 6, a2[52]), O = d2(O, P2, A2, E2, f2, 10, a2[53]), E2 = d2(E2, O, P2, A2, I2, 15, a2[54]), A2 = d2(A2, E2, O, P2, c3, 21, a2[55]), P2 = d2(P2, A2, E2, O, w2, 6, a2[56]), O = d2(O, P2, A2, E2, T2, 10, a2[57]), E2 = d2(E2, O, P2, A2, y2, 15, a2[58]), A2 = d2(A2, E2, O, P2, k2, 21, a2[59]), P2 = d2(P2, A2, E2, O, g2, 6, a2[60]), O = d2(O, P2, A2, E2, S2, 10, a2[61]), E2 = d2(E2, O, P2, A2, p2, 15, a2[62]), A2 = d2(A2, E2, O, P2, v2, 21, a2[63]), i3[0] = i3[0] + P2 | 0, i3[1] = i3[1] + A2 | 0, i3[2] = i3[2] + E2 | 0, i3[3] = i3[3] + O | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        n3[r3 >>> 5] |= 128 << 24 - r3 % 32;
        var i3 = e2.floor(s3 / 4294967296), o3 = s3;
        n3[15 + (r3 + 64 >>> 9 << 4)] = 16711935 & (i3 << 8 | i3 >>> 24) | 4278255360 & (i3 << 24 | i3 >>> 8), n3[14 + (r3 + 64 >>> 9 << 4)] = 16711935 & (o3 << 8 | o3 >>> 24) | 4278255360 & (o3 << 24 | o3 >>> 8), t4.sigBytes = 4 * (n3.length + 1), this._process();
        for (var a3 = this._hash, c3 = a3.words, u3 = 0; u3 < 4; u3++) {
          var h3 = c3[u3];
          c3[u3] = 16711935 & (h3 << 8 | h3 >>> 24) | 4278255360 & (h3 << 24 | h3 >>> 8);
        }
        return a3;
      }, clone: function() {
        var e3 = i2.clone.call(this);
        return e3._hash = this._hash.clone(), e3;
      } });
      function u2(e3, t4, n3, s3, r3, i3, o3) {
        var a3 = e3 + (t4 & n3 | ~t4 & s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function h2(e3, t4, n3, s3, r3, i3, o3) {
        var a3 = e3 + (t4 & s3 | n3 & ~s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function l2(e3, t4, n3, s3, r3, i3, o3) {
        var a3 = e3 + (t4 ^ n3 ^ s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function d2(e3, t4, n3, s3, r3, i3, o3) {
        var a3 = e3 + (n3 ^ (t4 | ~s3)) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      t3.MD5 = i2._createHelper(c2), t3.HmacMD5 = i2._createHmacHelper(c2);
    }(Math), n2.MD5);
  }), s(function(e, t2) {
    var n2;
    e.exports = (n2 = i, void function() {
      var e2 = n2, t3 = e2.lib.Base, s2 = e2.enc.Utf8;
      e2.algo.HMAC = t3.extend({ init: function(e3, t4) {
        e3 = this._hasher = new e3.init(), "string" == typeof t4 && (t4 = s2.parse(t4));
        var n3 = e3.blockSize, r2 = 4 * n3;
        t4.sigBytes > r2 && (t4 = e3.finalize(t4)), t4.clamp();
        for (var i2 = this._oKey = t4.clone(), o2 = this._iKey = t4.clone(), a2 = i2.words, c2 = o2.words, u2 = 0; u2 < n3; u2++)
          a2[u2] ^= 1549556828, c2[u2] ^= 909522486;
        i2.sigBytes = o2.sigBytes = r2, this.reset();
      }, reset: function() {
        var e3 = this._hasher;
        e3.reset(), e3.update(this._iKey);
      }, update: function(e3) {
        return this._hasher.update(e3), this;
      }, finalize: function(e3) {
        var t4 = this._hasher, n3 = t4.finalize(e3);
        return t4.reset(), t4.finalize(this._oKey.clone().concat(n3));
      } });
    }());
  }), s(function(e, t2) {
    e.exports = i.HmacMD5;
  })), a = s(function(e, t2) {
    e.exports = i.enc.Utf8;
  }), c = s(function(e, t2) {
    var n2;
    e.exports = (n2 = i, function() {
      var e2 = n2, t3 = e2.lib.WordArray;
      function s2(e3, n3, s3) {
        for (var r2 = [], i2 = 0, o2 = 0; o2 < n3; o2++)
          if (o2 % 4) {
            var a2 = s3[e3.charCodeAt(o2 - 1)] << o2 % 4 * 2, c2 = s3[e3.charCodeAt(o2)] >>> 6 - o2 % 4 * 2;
            r2[i2 >>> 2] |= (a2 | c2) << 24 - i2 % 4 * 8, i2++;
          }
        return t3.create(r2, i2);
      }
      e2.enc.Base64 = { stringify: function(e3) {
        var t4 = e3.words, n3 = e3.sigBytes, s3 = this._map;
        e3.clamp();
        for (var r2 = [], i2 = 0; i2 < n3; i2 += 3)
          for (var o2 = (t4[i2 >>> 2] >>> 24 - i2 % 4 * 8 & 255) << 16 | (t4[i2 + 1 >>> 2] >>> 24 - (i2 + 1) % 4 * 8 & 255) << 8 | t4[i2 + 2 >>> 2] >>> 24 - (i2 + 2) % 4 * 8 & 255, a2 = 0; a2 < 4 && i2 + 0.75 * a2 < n3; a2++)
            r2.push(s3.charAt(o2 >>> 6 * (3 - a2) & 63));
        var c2 = s3.charAt(64);
        if (c2)
          for (; r2.length % 4; )
            r2.push(c2);
        return r2.join("");
      }, parse: function(e3) {
        var t4 = e3.length, n3 = this._map, r2 = this._reverseMap;
        if (!r2) {
          r2 = this._reverseMap = [];
          for (var i2 = 0; i2 < n3.length; i2++)
            r2[n3.charCodeAt(i2)] = i2;
        }
        var o2 = n3.charAt(64);
        if (o2) {
          var a2 = e3.indexOf(o2);
          -1 !== a2 && (t4 = a2);
        }
        return s2(e3, t4, r2);
      }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
    }(), n2.enc.Base64);
  });
  const u = "FUNCTION", h = "OBJECT", l = "CLIENT_DB", d = "pending", p = "fullfilled", f = "rejected";
  function g(e) {
    return Object.prototype.toString.call(e).slice(8, -1).toLowerCase();
  }
  function m(e) {
    return "object" === g(e);
  }
  function y(e) {
    return "function" == typeof e;
  }
  function _(e) {
    return function() {
      try {
        return e.apply(e, arguments);
      } catch (e2) {
        console.error(e2);
      }
    };
  }
  const w = "REJECTED", v = "NOT_PENDING";
  class I {
    constructor({ createPromise: e, retryRule: t2 = w } = {}) {
      this.createPromise = e, this.status = null, this.promise = null, this.retryRule = t2;
    }
    get needRetry() {
      if (!this.status)
        return true;
      switch (this.retryRule) {
        case w:
          return this.status === f;
        case v:
          return this.status !== d;
      }
    }
    exec() {
      return this.needRetry ? (this.status = d, this.promise = this.createPromise().then((e) => (this.status = p, Promise.resolve(e)), (e) => (this.status = f, Promise.reject(e))), this.promise) : this.promise;
    }
  }
  function S(e) {
    return e && "string" == typeof e ? JSON.parse(e) : e;
  }
  const b = true, k = "app", T = S([]), P = k, A = S(""), E = S("[]") || [];
  let x = "";
  try {
    x = "__UNI__7ABBC61";
  } catch (e) {
  }
  let R = {};
  function U(e, t2 = {}) {
    var n2, s2;
    return n2 = R, s2 = e, Object.prototype.hasOwnProperty.call(n2, s2) || (R[e] = t2), R[e];
  }
  R = uni._globalUniCloudObj ? uni._globalUniCloudObj : uni._globalUniCloudObj = {};
  const L = ["invoke", "success", "fail", "complete"], N = U("_globalUniCloudInterceptor");
  function D(e, t2) {
    N[e] || (N[e] = {}), m(t2) && Object.keys(t2).forEach((n2) => {
      L.indexOf(n2) > -1 && function(e2, t3, n3) {
        let s2 = N[e2][t3];
        s2 || (s2 = N[e2][t3] = []), -1 === s2.indexOf(n3) && y(n3) && s2.push(n3);
      }(e, n2, t2[n2]);
    });
  }
  function F(e, t2) {
    N[e] || (N[e] = {}), m(t2) ? Object.keys(t2).forEach((n2) => {
      L.indexOf(n2) > -1 && function(e2, t3, n3) {
        const s2 = N[e2][t3];
        if (!s2)
          return;
        const r2 = s2.indexOf(n3);
        r2 > -1 && s2.splice(r2, 1);
      }(e, n2, t2[n2]);
    }) : delete N[e];
  }
  function q(e, t2) {
    return e && 0 !== e.length ? e.reduce((e2, n2) => e2.then(() => n2(t2)), Promise.resolve()) : Promise.resolve();
  }
  function M(e, t2) {
    return N[e] && N[e][t2] || [];
  }
  function K(e) {
    D("callObject", e);
  }
  const j = U("_globalUniCloudListener"), B = "response", $ = "needLogin", W = "refreshToken", z = "clientdb", J = "cloudfunction", H = "cloudobject";
  function G(e) {
    return j[e] || (j[e] = []), j[e];
  }
  function V(e, t2) {
    const n2 = G(e);
    n2.includes(t2) || n2.push(t2);
  }
  function Q(e, t2) {
    const n2 = G(e), s2 = n2.indexOf(t2);
    -1 !== s2 && n2.splice(s2, 1);
  }
  function Y(e, t2) {
    const n2 = G(e);
    for (let e2 = 0; e2 < n2.length; e2++) {
      (0, n2[e2])(t2);
    }
  }
  let X, Z = false;
  function ee() {
    return X || (X = new Promise((e) => {
      Z && e(), function t2() {
        if ("function" == typeof getCurrentPages) {
          const t3 = getCurrentPages();
          t3 && t3[0] && (Z = true, e());
        }
        Z || setTimeout(() => {
          t2();
        }, 30);
      }();
    }), X);
  }
  function te(e) {
    const t2 = {};
    for (const n2 in e) {
      const s2 = e[n2];
      y(s2) && (t2[n2] = _(s2));
    }
    return t2;
  }
  class ne extends Error {
    constructor(e) {
      super(e.message), this.errMsg = e.message || e.errMsg || "unknown system error", this.code = this.errCode = e.code || e.errCode || "SYSTEM_ERROR", this.errSubject = this.subject = e.subject || e.errSubject, this.cause = e.cause, this.requestId = e.requestId;
    }
    toJson(e = 0) {
      if (!(e >= 10))
        return e++, { errCode: this.errCode, errMsg: this.errMsg, errSubject: this.errSubject, cause: this.cause && this.cause.toJson ? this.cause.toJson(e) : this.cause };
    }
  }
  var se = { request: (e) => uni.request(e), uploadFile: (e) => uni.uploadFile(e), setStorageSync: (e, t2) => uni.setStorageSync(e, t2), getStorageSync: (e) => uni.getStorageSync(e), removeStorageSync: (e) => uni.removeStorageSync(e), clearStorageSync: () => uni.clearStorageSync() };
  function re(e) {
    return e && re(e.__v_raw) || e;
  }
  function ie() {
    return { token: se.getStorageSync("uni_id_token") || se.getStorageSync("uniIdToken"), tokenExpired: se.getStorageSync("uni_id_token_expired") };
  }
  function oe({ token: e, tokenExpired: t2 } = {}) {
    e && se.setStorageSync("uni_id_token", e), t2 && se.setStorageSync("uni_id_token_expired", t2);
  }
  let ae, ce;
  function ue() {
    return ae || (ae = uni.getSystemInfoSync()), ae;
  }
  function he() {
    let e, t2;
    try {
      if (uni.getLaunchOptionsSync) {
        if (uni.getLaunchOptionsSync.toString().indexOf("not yet implemented") > -1)
          return;
        const { scene: n2, channel: s2 } = uni.getLaunchOptionsSync();
        e = s2, t2 = n2;
      }
    } catch (e2) {
    }
    return { channel: e, scene: t2 };
  }
  function le() {
    const e = uni.getLocale && uni.getLocale() || "en";
    if (ce)
      return { ...ce, locale: e, LOCALE: e };
    const t2 = ue(), { deviceId: n2, osName: s2, uniPlatform: r2, appId: i2 } = t2, o2 = ["pixelRatio", "brand", "model", "system", "language", "version", "platform", "host", "SDKVersion", "swanNativeVersion", "app", "AppPlatform", "fontSizeSetting"];
    for (let e2 = 0; e2 < o2.length; e2++) {
      delete t2[o2[e2]];
    }
    return ce = { PLATFORM: r2, OS: s2, APPID: i2, DEVICEID: n2, ...he(), ...t2 }, { ...ce, locale: e, LOCALE: e };
  }
  var de = { sign: function(e, t2) {
    let n2 = "";
    return Object.keys(e).sort().forEach(function(t3) {
      e[t3] && (n2 = n2 + "&" + t3 + "=" + e[t3]);
    }), n2 = n2.slice(1), o(n2, t2).toString();
  }, wrappedRequest: function(e, t2) {
    return new Promise((n2, s2) => {
      t2(Object.assign(e, { complete(e2) {
        e2 || (e2 = {});
        const t3 = e2.data && e2.data.header && e2.data.header["x-serverless-request-id"] || e2.header && e2.header["request-id"];
        if (!e2.statusCode || e2.statusCode >= 400)
          return s2(new ne({ code: "SYS_ERR", message: e2.errMsg || "request:fail", requestId: t3 }));
        const r2 = e2.data;
        if (r2.error)
          return s2(new ne({ code: r2.error.code, message: r2.error.message, requestId: t3 }));
        r2.result = r2.data, r2.requestId = t3, delete r2.data, n2(r2);
      } }));
    });
  }, toBase64: function(e) {
    return c.stringify(a.parse(e));
  } }, pe = { "uniCloud.init.paramRequired": "{param} required", "uniCloud.uploadFile.fileError": "filePath should be instance of File" };
  const { t: fe } = initVueI18n({ "zh-Hans": { "uniCloud.init.paramRequired": "缺少参数：{param}", "uniCloud.uploadFile.fileError": "filePath应为File对象" }, "zh-Hant": { "uniCloud.init.paramRequired": "缺少参数：{param}", "uniCloud.uploadFile.fileError": "filePath应为File对象" }, en: pe, fr: { "uniCloud.init.paramRequired": "{param} required", "uniCloud.uploadFile.fileError": "filePath should be instance of File" }, es: { "uniCloud.init.paramRequired": "{param} required", "uniCloud.uploadFile.fileError": "filePath should be instance of File" }, ja: pe }, "zh-Hans");
  var ge = class {
    constructor(e) {
      ["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e, t2))
          throw new Error(fe("uniCloud.init.paramRequired", { param: t2 }));
      }), this.config = Object.assign({}, { endpoint: 0 === e.spaceId.indexOf("mp-") ? "https://api.next.bspapp.com" : "https://api.bspapp.com" }, e), this.config.provider = "aliyun", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.config.accessTokenKey = "access_token_" + this.config.spaceId, this.adapter = se, this._getAccessTokenPromiseHub = new I({ createPromise: () => this.requestAuth(this.setupRequest({ method: "serverless.auth.user.anonymousAuthorize", params: "{}" }, "auth")).then((e2) => {
        if (!e2.result || !e2.result.accessToken)
          throw new ne({ code: "AUTH_FAILED", message: "获取accessToken失败" });
        this.setAccessToken(e2.result.accessToken);
      }), retryRule: v });
    }
    get hasAccessToken() {
      return !!this.accessToken;
    }
    setAccessToken(e) {
      this.accessToken = e;
    }
    requestWrapped(e) {
      return de.wrappedRequest(e, this.adapter.request);
    }
    requestAuth(e) {
      return this.requestWrapped(e);
    }
    request(e, t2) {
      return Promise.resolve().then(() => this.hasAccessToken ? t2 ? this.requestWrapped(e) : this.requestWrapped(e).catch((t3) => new Promise((e2, n2) => {
        !t3 || "GATEWAY_INVALID_TOKEN" !== t3.code && "InvalidParameter.InvalidToken" !== t3.code ? n2(t3) : e2();
      }).then(() => this.getAccessToken()).then(() => {
        const t4 = this.rebuildRequest(e);
        return this.request(t4, true);
      })) : this.getAccessToken().then(() => {
        const t3 = this.rebuildRequest(e);
        return this.request(t3, true);
      }));
    }
    rebuildRequest(e) {
      const t2 = Object.assign({}, e);
      return t2.data.token = this.accessToken, t2.header["x-basement-token"] = this.accessToken, t2.header["x-serverless-sign"] = de.sign(t2.data, this.config.clientSecret), t2;
    }
    setupRequest(e, t2) {
      const n2 = Object.assign({}, e, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
      return "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = de.sign(n2, this.config.clientSecret), { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: s2 };
    }
    getAccessToken() {
      return this._getAccessTokenPromiseHub.exec();
    }
    async authorize() {
      await this.getAccessToken();
    }
    callFunction(e) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e.name, functionArgs: e.data || {} }) };
      return this.request(this.setupRequest(t2));
    }
    getOSSUploadOptionsFromPath(e) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e) };
      return this.request(this.setupRequest(t2));
    }
    uploadFileToOSS({ url: e, formData: t2, name: n2, filePath: s2, fileType: r2, onUploadProgress: i2 }) {
      return new Promise((o2, a2) => {
        const c2 = this.adapter.uploadFile({ url: e, formData: t2, name: n2, filePath: s2, fileType: r2, header: { "X-OSS-server-side-encrpytion": "AES256" }, success(e2) {
          e2 && e2.statusCode < 400 ? o2(e2) : a2(new ne({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e2) {
          a2(new ne({ code: e2.code || "UPLOAD_FAILED", message: e2.message || e2.errMsg || "文件上传失败" }));
        } });
        "function" == typeof i2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e2) => {
          i2({ loaded: e2.totalBytesSent, total: e2.totalBytesExpectedToSend });
        });
      });
    }
    reportOSSUpload(e) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e) };
      return this.request(this.setupRequest(t2));
    }
    async uploadFile({ filePath: e, cloudPath: t2, fileType: n2 = "image", onUploadProgress: s2, config: r2 }) {
      if ("string" !== g(t2))
        throw new ne({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new ne({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new ne({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const i2 = r2 && r2.envType || this.config.envType, o2 = (await this.getOSSUploadOptionsFromPath({ env: i2, filename: t2 })).result, a2 = "https://" + o2.cdnDomain + "/" + o2.ossPath, { securityToken: c2, accessKeyId: u2, signature: h2, host: l2, ossPath: d2, id: p2, policy: f2, ossCallbackUrl: m2 } = o2, y2 = { "Cache-Control": "max-age=2592000", "Content-Disposition": "attachment", OSSAccessKeyId: u2, Signature: h2, host: l2, id: p2, key: d2, policy: f2, success_action_status: 200 };
      if (c2 && (y2["x-oss-security-token"] = c2), m2) {
        const e2 = JSON.stringify({ callbackUrl: m2, callbackBody: JSON.stringify({ fileId: p2, spaceId: this.config.spaceId }), callbackBodyType: "application/json" });
        y2.callback = de.toBase64(e2);
      }
      const _2 = { url: "https://" + o2.host, formData: y2, fileName: "file", name: "file", filePath: e, fileType: n2 };
      if (await this.uploadFileToOSS(Object.assign({}, _2, { onUploadProgress: s2 })), m2)
        return { success: true, filePath: e, fileID: a2 };
      if ((await this.reportOSSUpload({ id: p2 })).success)
        return { success: true, filePath: e, fileID: a2 };
      throw new ne({ code: "UPLOAD_FAILED", message: "文件上传失败" });
    }
    getTempFileURL({ fileList: e } = {}) {
      return new Promise((t2, n2) => {
        Array.isArray(e) && 0 !== e.length || n2(new ne({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" })), t2({ fileList: e.map((e2) => ({ fileID: e2, tempFileURL: e2 })) });
      });
    }
    async getFileInfo({ fileList: e } = {}) {
      if (!Array.isArray(e) || 0 === e.length)
        throw new ne({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const t2 = { method: "serverless.file.resource.info", params: JSON.stringify({ id: e.map((e2) => e2.split("?")[0]).join(",") }) };
      return { fileList: (await this.request(this.setupRequest(t2))).result };
    }
  };
  var me = { init(e) {
    const t2 = new ge(e), n2 = { signInAnonymously: function() {
      return t2.authorize();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } };
  const ye = "undefined" != typeof location && "http:" === location.protocol ? "http:" : "https:";
  var _e;
  !function(e) {
    e.local = "local", e.none = "none", e.session = "session";
  }(_e || (_e = {}));
  var we = function() {
  };
  const ve = () => {
    let e;
    if (!Promise) {
      e = () => {
      }, e.promise = {};
      const t3 = () => {
        throw new ne({ message: 'Your Node runtime does support ES6 Promises. Set "global.Promise" to your preferred implementation of promises.' });
      };
      return Object.defineProperty(e.promise, "then", { get: t3 }), Object.defineProperty(e.promise, "catch", { get: t3 }), e;
    }
    const t2 = new Promise((t3, n2) => {
      e = (e2, s2) => e2 ? n2(e2) : t3(s2);
    });
    return e.promise = t2, e;
  };
  function Ie(e) {
    return void 0 === e;
  }
  function Se(e) {
    return "[object Null]" === Object.prototype.toString.call(e);
  }
  var be;
  function ke(e) {
    const t2 = (n2 = e, "[object Array]" === Object.prototype.toString.call(n2) ? e : [e]);
    var n2;
    for (const e2 of t2) {
      const { isMatch: t3, genAdapter: n3, runtime: s2 } = e2;
      if (t3())
        return { adapter: n3(), runtime: s2 };
    }
  }
  !function(e) {
    e.WEB = "web", e.WX_MP = "wx_mp";
  }(be || (be = {}));
  const Ce = { adapter: null, runtime: void 0 }, Te = ["anonymousUuidKey"];
  class Pe extends we {
    constructor() {
      super(), Ce.adapter.root.tcbObject || (Ce.adapter.root.tcbObject = {});
    }
    setItem(e, t2) {
      Ce.adapter.root.tcbObject[e] = t2;
    }
    getItem(e) {
      return Ce.adapter.root.tcbObject[e];
    }
    removeItem(e) {
      delete Ce.adapter.root.tcbObject[e];
    }
    clear() {
      delete Ce.adapter.root.tcbObject;
    }
  }
  function Ae(e, t2) {
    switch (e) {
      case "local":
        return t2.localStorage || new Pe();
      case "none":
        return new Pe();
      default:
        return t2.sessionStorage || new Pe();
    }
  }
  class Ee {
    constructor(e) {
      if (!this._storage) {
        this._persistence = Ce.adapter.primaryStorage || e.persistence, this._storage = Ae(this._persistence, Ce.adapter);
        const t2 = `access_token_${e.env}`, n2 = `access_token_expire_${e.env}`, s2 = `refresh_token_${e.env}`, r2 = `anonymous_uuid_${e.env}`, i2 = `login_type_${e.env}`, o2 = `user_info_${e.env}`;
        this.keys = { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2, anonymousUuidKey: r2, loginTypeKey: i2, userInfoKey: o2 };
      }
    }
    updatePersistence(e) {
      if (e === this._persistence)
        return;
      const t2 = "local" === this._persistence;
      this._persistence = e;
      const n2 = Ae(e, Ce.adapter);
      for (const e2 in this.keys) {
        const s2 = this.keys[e2];
        if (t2 && Te.includes(e2))
          continue;
        const r2 = this._storage.getItem(s2);
        Ie(r2) || Se(r2) || (n2.setItem(s2, r2), this._storage.removeItem(s2));
      }
      this._storage = n2;
    }
    setStore(e, t2, n2) {
      if (!this._storage)
        return;
      const s2 = { version: n2 || "localCachev1", content: t2 }, r2 = JSON.stringify(s2);
      try {
        this._storage.setItem(e, r2);
      } catch (e2) {
        throw e2;
      }
    }
    getStore(e, t2) {
      try {
        if (!this._storage)
          return;
      } catch (e2) {
        return "";
      }
      t2 = t2 || "localCachev1";
      const n2 = this._storage.getItem(e);
      if (!n2)
        return "";
      if (n2.indexOf(t2) >= 0) {
        return JSON.parse(n2).content;
      }
      return "";
    }
    removeStore(e) {
      this._storage.removeItem(e);
    }
  }
  const Oe = {}, xe = {};
  function Re(e) {
    return Oe[e];
  }
  class Ue {
    constructor(e, t2) {
      this.data = t2 || null, this.name = e;
    }
  }
  class Le extends Ue {
    constructor(e, t2) {
      super("error", { error: e, data: t2 }), this.error = e;
    }
  }
  const Ne = new class {
    constructor() {
      this._listeners = {};
    }
    on(e, t2) {
      return function(e2, t3, n2) {
        n2[e2] = n2[e2] || [], n2[e2].push(t3);
      }(e, t2, this._listeners), this;
    }
    off(e, t2) {
      return function(e2, t3, n2) {
        if (n2 && n2[e2]) {
          const s2 = n2[e2].indexOf(t3);
          -1 !== s2 && n2[e2].splice(s2, 1);
        }
      }(e, t2, this._listeners), this;
    }
    fire(e, t2) {
      if (e instanceof Le)
        return console.error(e.error), this;
      const n2 = "string" == typeof e ? new Ue(e, t2 || {}) : e;
      const s2 = n2.name;
      if (this._listens(s2)) {
        n2.target = this;
        const e2 = this._listeners[s2] ? [...this._listeners[s2]] : [];
        for (const t3 of e2)
          t3.call(this, n2);
      }
      return this;
    }
    _listens(e) {
      return this._listeners[e] && this._listeners[e].length > 0;
    }
  }();
  function De(e, t2) {
    Ne.on(e, t2);
  }
  function Fe(e, t2 = {}) {
    Ne.fire(e, t2);
  }
  function qe(e, t2) {
    Ne.off(e, t2);
  }
  const Me = "loginStateChanged", Ke = "loginStateExpire", je = "loginTypeChanged", Be = "anonymousConverted", $e = "refreshAccessToken";
  var We;
  !function(e) {
    e.ANONYMOUS = "ANONYMOUS", e.WECHAT = "WECHAT", e.WECHAT_PUBLIC = "WECHAT-PUBLIC", e.WECHAT_OPEN = "WECHAT-OPEN", e.CUSTOM = "CUSTOM", e.EMAIL = "EMAIL", e.USERNAME = "USERNAME", e.NULL = "NULL";
  }(We || (We = {}));
  const ze = ["auth.getJwt", "auth.logout", "auth.signInWithTicket", "auth.signInAnonymously", "auth.signIn", "auth.fetchAccessTokenWithRefreshToken", "auth.signUpWithEmailAndPassword", "auth.activateEndUserMail", "auth.sendPasswordResetEmail", "auth.resetPasswordWithToken", "auth.isUsernameRegistered"], Je = { "X-SDK-Version": "1.3.5" };
  function He(e, t2, n2) {
    const s2 = e[t2];
    e[t2] = function(t3) {
      const r2 = {}, i2 = {};
      n2.forEach((n3) => {
        const { data: s3, headers: o3 } = n3.call(e, t3);
        Object.assign(r2, s3), Object.assign(i2, o3);
      });
      const o2 = t3.data;
      return o2 && (() => {
        var e2;
        if (e2 = o2, "[object FormData]" !== Object.prototype.toString.call(e2))
          t3.data = { ...o2, ...r2 };
        else
          for (const e3 in r2)
            o2.append(e3, r2[e3]);
      })(), t3.headers = { ...t3.headers || {}, ...i2 }, s2.call(e, t3);
    };
  }
  function Ge() {
    const e = Math.random().toString(16).slice(2);
    return { data: { seqId: e }, headers: { ...Je, "x-seqid": e } };
  }
  class Ve {
    constructor(e = {}) {
      var t2;
      this.config = e, this._reqClass = new Ce.adapter.reqClass({ timeout: this.config.timeout, timeoutMsg: `请求在${this.config.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] }), this._cache = Re(this.config.env), this._localCache = (t2 = this.config.env, xe[t2]), He(this._reqClass, "post", [Ge]), He(this._reqClass, "upload", [Ge]), He(this._reqClass, "download", [Ge]);
    }
    async post(e) {
      return await this._reqClass.post(e);
    }
    async upload(e) {
      return await this._reqClass.upload(e);
    }
    async download(e) {
      return await this._reqClass.download(e);
    }
    async refreshAccessToken() {
      let e, t2;
      this._refreshAccessTokenPromise || (this._refreshAccessTokenPromise = this._refreshAccessToken());
      try {
        e = await this._refreshAccessTokenPromise;
      } catch (e2) {
        t2 = e2;
      }
      if (this._refreshAccessTokenPromise = null, this._shouldRefreshAccessTokenHook = null, t2)
        throw t2;
      return e;
    }
    async _refreshAccessToken() {
      const { accessTokenKey: e, accessTokenExpireKey: t2, refreshTokenKey: n2, loginTypeKey: s2, anonymousUuidKey: r2 } = this._cache.keys;
      this._cache.removeStore(e), this._cache.removeStore(t2);
      let i2 = this._cache.getStore(n2);
      if (!i2)
        throw new ne({ message: "未登录CloudBase" });
      const o2 = { refresh_token: i2 }, a2 = await this.request("auth.fetchAccessTokenWithRefreshToken", o2);
      if (a2.data.code) {
        const { code: e2 } = a2.data;
        if ("SIGN_PARAM_INVALID" === e2 || "REFRESH_TOKEN_EXPIRED" === e2 || "INVALID_REFRESH_TOKEN" === e2) {
          if (this._cache.getStore(s2) === We.ANONYMOUS && "INVALID_REFRESH_TOKEN" === e2) {
            const e3 = this._cache.getStore(r2), t3 = this._cache.getStore(n2), s3 = await this.send("auth.signInAnonymously", { anonymous_uuid: e3, refresh_token: t3 });
            return this.setRefreshToken(s3.refresh_token), this._refreshAccessToken();
          }
          Fe(Ke), this._cache.removeStore(n2);
        }
        throw new ne({ code: a2.data.code, message: `刷新access token失败：${a2.data.code}` });
      }
      if (a2.data.access_token)
        return Fe($e), this._cache.setStore(e, a2.data.access_token), this._cache.setStore(t2, a2.data.access_token_expire + Date.now()), { accessToken: a2.data.access_token, accessTokenExpire: a2.data.access_token_expire };
      a2.data.refresh_token && (this._cache.removeStore(n2), this._cache.setStore(n2, a2.data.refresh_token), this._refreshAccessToken());
    }
    async getAccessToken() {
      const { accessTokenKey: e, accessTokenExpireKey: t2, refreshTokenKey: n2 } = this._cache.keys;
      if (!this._cache.getStore(n2))
        throw new ne({ message: "refresh token不存在，登录状态异常" });
      let s2 = this._cache.getStore(e), r2 = this._cache.getStore(t2), i2 = true;
      return this._shouldRefreshAccessTokenHook && !await this._shouldRefreshAccessTokenHook(s2, r2) && (i2 = false), (!s2 || !r2 || r2 < Date.now()) && i2 ? this.refreshAccessToken() : { accessToken: s2, accessTokenExpire: r2 };
    }
    async request(e, t2, n2) {
      const s2 = `x-tcb-trace_${this.config.env}`;
      let r2 = "application/x-www-form-urlencoded";
      const i2 = { action: e, env: this.config.env, dataVersion: "2019-08-16", ...t2 };
      if (-1 === ze.indexOf(e)) {
        const { refreshTokenKey: e2 } = this._cache.keys;
        this._cache.getStore(e2) && (i2.access_token = (await this.getAccessToken()).accessToken);
      }
      let o2;
      if ("storage.uploadFile" === e) {
        o2 = new FormData();
        for (let e2 in o2)
          o2.hasOwnProperty(e2) && void 0 !== o2[e2] && o2.append(e2, i2[e2]);
        r2 = "multipart/form-data";
      } else {
        r2 = "application/json", o2 = {};
        for (let e2 in i2)
          void 0 !== i2[e2] && (o2[e2] = i2[e2]);
      }
      let a2 = { headers: { "content-type": r2 } };
      n2 && n2.onUploadProgress && (a2.onUploadProgress = n2.onUploadProgress);
      const c2 = this._localCache.getStore(s2);
      c2 && (a2.headers["X-TCB-Trace"] = c2);
      const { parse: u2, inQuery: h2, search: l2 } = t2;
      let d2 = { env: this.config.env };
      u2 && (d2.parse = true), h2 && (d2 = { ...h2, ...d2 });
      let p2 = function(e2, t3, n3 = {}) {
        const s3 = /\?/.test(t3);
        let r3 = "";
        for (let e3 in n3)
          "" === r3 ? !s3 && (t3 += "?") : r3 += "&", r3 += `${e3}=${encodeURIComponent(n3[e3])}`;
        return /^http(s)?\:\/\//.test(t3 += r3) ? t3 : `${e2}${t3}`;
      }(ye, "//tcb-api.tencentcloudapi.com/web", d2);
      l2 && (p2 += l2);
      const f2 = await this.post({ url: p2, data: o2, ...a2 }), g2 = f2.header && f2.header["x-tcb-trace"];
      if (g2 && this._localCache.setStore(s2, g2), 200 !== Number(f2.status) && 200 !== Number(f2.statusCode) || !f2.data)
        throw new ne({ code: "NETWORK_ERROR", message: "network request error" });
      return f2;
    }
    async send(e, t2 = {}) {
      const n2 = await this.request(e, t2, { onUploadProgress: t2.onUploadProgress });
      if ("ACCESS_TOKEN_EXPIRED" === n2.data.code && -1 === ze.indexOf(e)) {
        await this.refreshAccessToken();
        const n3 = await this.request(e, t2, { onUploadProgress: t2.onUploadProgress });
        if (n3.data.code)
          throw new ne({ code: n3.data.code, message: n3.data.message });
        return n3.data;
      }
      if (n2.data.code)
        throw new ne({ code: n2.data.code, message: n2.data.message });
      return n2.data;
    }
    setRefreshToken(e) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e);
    }
  }
  const Qe = {};
  function Ye(e) {
    return Qe[e];
  }
  class Xe {
    constructor(e) {
      this.config = e, this._cache = Re(e.env), this._request = Ye(e.env);
    }
    setRefreshToken(e) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e);
    }
    setAccessToken(e, t2) {
      const { accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys;
      this._cache.setStore(n2, e), this._cache.setStore(s2, t2);
    }
    async refreshUserInfo() {
      const { data: e } = await this._request.send("auth.getUserInfo", {});
      return this.setLocalUserInfo(e), e;
    }
    setLocalUserInfo(e) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e);
    }
  }
  class Ze {
    constructor(e) {
      if (!e)
        throw new ne({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._envId = e, this._cache = Re(this._envId), this._request = Ye(this._envId), this.setUserInfo();
    }
    linkWithTicket(e) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "ticket must be string" });
      return this._request.send("auth.linkWithTicket", { ticket: e });
    }
    linkWithRedirect(e) {
      e.signInWithRedirect();
    }
    updatePassword(e, t2) {
      return this._request.send("auth.updatePassword", { oldPassword: t2, newPassword: e });
    }
    updateEmail(e) {
      return this._request.send("auth.updateEmail", { newEmail: e });
    }
    updateUsername(e) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "username must be a string" });
      return this._request.send("auth.updateUsername", { username: e });
    }
    async getLinkedUidList() {
      const { data: e } = await this._request.send("auth.getLinkedUidList", {});
      let t2 = false;
      const { users: n2 } = e;
      return n2.forEach((e2) => {
        e2.wxOpenId && e2.wxPublicId && (t2 = true);
      }), { users: n2, hasPrimaryUid: t2 };
    }
    setPrimaryUid(e) {
      return this._request.send("auth.setPrimaryUid", { uid: e });
    }
    unlink(e) {
      return this._request.send("auth.unlink", { platform: e });
    }
    async update(e) {
      const { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 } = e, { data: a2 } = await this._request.send("auth.updateUserInfo", { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 });
      this.setLocalUserInfo(a2);
    }
    async refresh() {
      const { data: e } = await this._request.send("auth.getUserInfo", {});
      return this.setLocalUserInfo(e), e;
    }
    setUserInfo() {
      const { userInfoKey: e } = this._cache.keys, t2 = this._cache.getStore(e);
      ["uid", "loginType", "openid", "wxOpenId", "wxPublicId", "unionId", "qqMiniOpenId", "email", "hasPassword", "customUserId", "nickName", "gender", "avatarUrl"].forEach((e2) => {
        this[e2] = t2[e2];
      }), this.location = { country: t2.country, province: t2.province, city: t2.city };
    }
    setLocalUserInfo(e) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e), this.setUserInfo();
    }
  }
  class et {
    constructor(e) {
      if (!e)
        throw new ne({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._cache = Re(e);
      const { refreshTokenKey: t2, accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys, r2 = this._cache.getStore(t2), i2 = this._cache.getStore(n2), o2 = this._cache.getStore(s2);
      this.credential = { refreshToken: r2, accessToken: i2, accessTokenExpire: o2 }, this.user = new Ze(e);
    }
    get isAnonymousAuth() {
      return this.loginType === We.ANONYMOUS;
    }
    get isCustomAuth() {
      return this.loginType === We.CUSTOM;
    }
    get isWeixinAuth() {
      return this.loginType === We.WECHAT || this.loginType === We.WECHAT_OPEN || this.loginType === We.WECHAT_PUBLIC;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
  }
  class tt extends Xe {
    async signIn() {
      this._cache.updatePersistence("local");
      const { anonymousUuidKey: e, refreshTokenKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e) || void 0, s2 = this._cache.getStore(t2) || void 0, r2 = await this._request.send("auth.signInAnonymously", { anonymous_uuid: n2, refresh_token: s2 });
      if (r2.uuid && r2.refresh_token) {
        this._setAnonymousUUID(r2.uuid), this.setRefreshToken(r2.refresh_token), await this._request.refreshAccessToken(), Fe(Me), Fe(je, { env: this.config.env, loginType: We.ANONYMOUS, persistence: "local" });
        const e2 = new et(this.config.env);
        return await e2.user.refresh(), e2;
      }
      throw new ne({ message: "匿名登录失败" });
    }
    async linkAndRetrieveDataWithTicket(e) {
      const { anonymousUuidKey: t2, refreshTokenKey: n2 } = this._cache.keys, s2 = this._cache.getStore(t2), r2 = this._cache.getStore(n2), i2 = await this._request.send("auth.linkAndRetrieveDataWithTicket", { anonymous_uuid: s2, refresh_token: r2, ticket: e });
      if (i2.refresh_token)
        return this._clearAnonymousUUID(), this.setRefreshToken(i2.refresh_token), await this._request.refreshAccessToken(), Fe(Be, { env: this.config.env }), Fe(je, { loginType: We.CUSTOM, persistence: "local" }), { credential: { refreshToken: i2.refresh_token } };
      throw new ne({ message: "匿名转化失败" });
    }
    _setAnonymousUUID(e) {
      const { anonymousUuidKey: t2, loginTypeKey: n2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.setStore(t2, e), this._cache.setStore(n2, We.ANONYMOUS);
    }
    _clearAnonymousUUID() {
      this._cache.removeStore(this._cache.keys.anonymousUuidKey);
    }
  }
  class nt extends Xe {
    async signIn(e) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "ticket must be a string" });
      const { refreshTokenKey: t2 } = this._cache.keys, n2 = await this._request.send("auth.signInWithTicket", { ticket: e, refresh_token: this._cache.getStore(t2) || "" });
      if (n2.refresh_token)
        return this.setRefreshToken(n2.refresh_token), await this._request.refreshAccessToken(), Fe(Me), Fe(je, { env: this.config.env, loginType: We.CUSTOM, persistence: this.config.persistence }), await this.refreshUserInfo(), new et(this.config.env);
      throw new ne({ message: "自定义登录失败" });
    }
  }
  class st extends Xe {
    async signIn(e, t2) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "email must be a string" });
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: "EMAIL", email: e, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token: i2, access_token_expire: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), i2 && o2 ? this.setAccessToken(i2, o2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Fe(Me), Fe(je, { env: this.config.env, loginType: We.EMAIL, persistence: this.config.persistence }), new et(this.config.env);
      throw s2.code ? new ne({ code: s2.code, message: `邮箱登录失败: ${s2.message}` }) : new ne({ message: "邮箱登录失败" });
    }
    async activate(e) {
      return this._request.send("auth.activateEndUserMail", { token: e });
    }
    async resetPasswordWithToken(e, t2) {
      return this._request.send("auth.resetPasswordWithToken", { token: e, newPassword: t2 });
    }
  }
  class rt extends Xe {
    async signIn(e, t2) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "username must be a string" });
      "string" != typeof t2 && (t2 = "", console.warn("password is empty"));
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: We.USERNAME, username: e, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token_expire: i2, access_token: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), o2 && i2 ? this.setAccessToken(o2, i2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Fe(Me), Fe(je, { env: this.config.env, loginType: We.USERNAME, persistence: this.config.persistence }), new et(this.config.env);
      throw s2.code ? new ne({ code: s2.code, message: `用户名密码登录失败: ${s2.message}` }) : new ne({ message: "用户名密码登录失败" });
    }
  }
  class it {
    constructor(e) {
      this.config = e, this._cache = Re(e.env), this._request = Ye(e.env), this._onAnonymousConverted = this._onAnonymousConverted.bind(this), this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this), De(je, this._onLoginTypeChanged);
    }
    get currentUser() {
      const e = this.hasLoginState();
      return e && e.user || null;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
    anonymousAuthProvider() {
      return new tt(this.config);
    }
    customAuthProvider() {
      return new nt(this.config);
    }
    emailAuthProvider() {
      return new st(this.config);
    }
    usernameAuthProvider() {
      return new rt(this.config);
    }
    async signInAnonymously() {
      return new tt(this.config).signIn();
    }
    async signInWithEmailAndPassword(e, t2) {
      return new st(this.config).signIn(e, t2);
    }
    signInWithUsernameAndPassword(e, t2) {
      return new rt(this.config).signIn(e, t2);
    }
    async linkAndRetrieveDataWithTicket(e) {
      this._anonymousAuthProvider || (this._anonymousAuthProvider = new tt(this.config)), De(Be, this._onAnonymousConverted);
      return await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(e);
    }
    async signOut() {
      if (this.loginType === We.ANONYMOUS)
        throw new ne({ message: "匿名用户不支持登出操作" });
      const { refreshTokenKey: e, accessTokenKey: t2, accessTokenExpireKey: n2 } = this._cache.keys, s2 = this._cache.getStore(e);
      if (!s2)
        return;
      const r2 = await this._request.send("auth.logout", { refresh_token: s2 });
      return this._cache.removeStore(e), this._cache.removeStore(t2), this._cache.removeStore(n2), Fe(Me), Fe(je, { env: this.config.env, loginType: We.NULL, persistence: this.config.persistence }), r2;
    }
    async signUpWithEmailAndPassword(e, t2) {
      return this._request.send("auth.signUpWithEmailAndPassword", { email: e, password: t2 });
    }
    async sendPasswordResetEmail(e) {
      return this._request.send("auth.sendPasswordResetEmail", { email: e });
    }
    onLoginStateChanged(e) {
      De(Me, () => {
        const t3 = this.hasLoginState();
        e.call(this, t3);
      });
      const t2 = this.hasLoginState();
      e.call(this, t2);
    }
    onLoginStateExpired(e) {
      De(Ke, e.bind(this));
    }
    onAccessTokenRefreshed(e) {
      De($e, e.bind(this));
    }
    onAnonymousConverted(e) {
      De(Be, e.bind(this));
    }
    onLoginTypeChanged(e) {
      De(je, () => {
        const t2 = this.hasLoginState();
        e.call(this, t2);
      });
    }
    async getAccessToken() {
      return { accessToken: (await this._request.getAccessToken()).accessToken, env: this.config.env };
    }
    hasLoginState() {
      const { refreshTokenKey: e } = this._cache.keys;
      return this._cache.getStore(e) ? new et(this.config.env) : null;
    }
    async isUsernameRegistered(e) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "username must be a string" });
      const { data: t2 } = await this._request.send("auth.isUsernameRegistered", { username: e });
      return t2 && t2.isRegistered;
    }
    getLoginState() {
      return Promise.resolve(this.hasLoginState());
    }
    async signInWithTicket(e) {
      return new nt(this.config).signIn(e);
    }
    shouldRefreshAccessToken(e) {
      this._request._shouldRefreshAccessTokenHook = e.bind(this);
    }
    getUserInfo() {
      return this._request.send("auth.getUserInfo", {}).then((e) => e.code ? e : { ...e.data, requestId: e.seqId });
    }
    getAuthHeader() {
      const { refreshTokenKey: e, accessTokenKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e);
      return { "x-cloudbase-credentials": this._cache.getStore(t2) + "/@@/" + n2 };
    }
    _onAnonymousConverted(e) {
      const { env: t2 } = e.data;
      t2 === this.config.env && this._cache.updatePersistence(this.config.persistence);
    }
    _onLoginTypeChanged(e) {
      const { loginType: t2, persistence: n2, env: s2 } = e.data;
      s2 === this.config.env && (this._cache.updatePersistence(n2), this._cache.setStore(this._cache.keys.loginTypeKey, t2));
    }
  }
  const ot = function(e, t2) {
    t2 = t2 || ve();
    const n2 = Ye(this.config.env), { cloudPath: s2, filePath: r2, onUploadProgress: i2, fileType: o2 = "image" } = e;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e2) => {
      const { data: { url: a2, authorization: c2, token: u2, fileId: h2, cosFileId: l2 }, requestId: d2 } = e2, p2 = { key: s2, signature: c2, "x-cos-meta-fileid": l2, success_action_status: "201", "x-cos-security-token": u2 };
      n2.upload({ url: a2, data: p2, file: r2, name: s2, fileType: o2, onUploadProgress: i2 }).then((e3) => {
        201 === e3.statusCode ? t2(null, { fileID: h2, requestId: d2 }) : t2(new ne({ code: "STORAGE_REQUEST_FAIL", message: `STORAGE_REQUEST_FAIL: ${e3.data}` }));
      }).catch((e3) => {
        t2(e3);
      });
    }).catch((e2) => {
      t2(e2);
    }), t2.promise;
  }, at = function(e, t2) {
    t2 = t2 || ve();
    const n2 = Ye(this.config.env), { cloudPath: s2 } = e;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e2) => {
      t2(null, e2);
    }).catch((e2) => {
      t2(e2);
    }), t2.promise;
  }, ct = function({ fileList: e }, t2) {
    if (t2 = t2 || ve(), !e || !Array.isArray(e))
      return { code: "INVALID_PARAM", message: "fileList必须是非空的数组" };
    for (let t3 of e)
      if (!t3 || "string" != typeof t3)
        return { code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" };
    const n2 = { fileid_list: e };
    return Ye(this.config.env).send("storage.batchDeleteFile", n2).then((e2) => {
      e2.code ? t2(null, e2) : t2(null, { fileList: e2.data.delete_list, requestId: e2.requestId });
    }).catch((e2) => {
      t2(e2);
    }), t2.promise;
  }, ut = function({ fileList: e }, t2) {
    t2 = t2 || ve(), e && Array.isArray(e) || t2(null, { code: "INVALID_PARAM", message: "fileList必须是非空的数组" });
    let n2 = [];
    for (let s3 of e)
      "object" == typeof s3 ? (s3.hasOwnProperty("fileID") && s3.hasOwnProperty("maxAge") || t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是包含fileID和maxAge的对象" }), n2.push({ fileid: s3.fileID, max_age: s3.maxAge })) : "string" == typeof s3 ? n2.push({ fileid: s3 }) : t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是字符串" });
    const s2 = { file_list: n2 };
    return Ye(this.config.env).send("storage.batchGetDownloadUrl", s2).then((e2) => {
      e2.code ? t2(null, e2) : t2(null, { fileList: e2.data.download_list, requestId: e2.requestId });
    }).catch((e2) => {
      t2(e2);
    }), t2.promise;
  }, ht = async function({ fileID: e }, t2) {
    const n2 = (await ut.call(this, { fileList: [{ fileID: e, maxAge: 600 }] })).fileList[0];
    if ("SUCCESS" !== n2.code)
      return t2 ? t2(n2) : new Promise((e2) => {
        e2(n2);
      });
    const s2 = Ye(this.config.env);
    let r2 = n2.download_url;
    if (r2 = encodeURI(r2), !t2)
      return s2.download({ url: r2 });
    t2(await s2.download({ url: r2 }));
  }, lt = function({ name: e, data: t2, query: n2, parse: s2, search: r2 }, i2) {
    const o2 = i2 || ve();
    let a2;
    try {
      a2 = t2 ? JSON.stringify(t2) : "";
    } catch (e2) {
      return Promise.reject(e2);
    }
    if (!e)
      return Promise.reject(new ne({ code: "PARAM_ERROR", message: "函数名不能为空" }));
    const c2 = { inQuery: n2, parse: s2, search: r2, function_name: e, request_data: a2 };
    return Ye(this.config.env).send("functions.invokeFunction", c2).then((e2) => {
      if (e2.code)
        o2(null, e2);
      else {
        let t3 = e2.data.response_data;
        if (s2)
          o2(null, { result: t3, requestId: e2.requestId });
        else
          try {
            t3 = JSON.parse(e2.data.response_data), o2(null, { result: t3, requestId: e2.requestId });
          } catch (e3) {
            o2(new ne({ message: "response data must be json" }));
          }
      }
      return o2.promise;
    }).catch((e2) => {
      o2(e2);
    }), o2.promise;
  }, dt = { timeout: 15e3, persistence: "session" }, pt = {};
  class ft {
    constructor(e) {
      this.config = e || this.config, this.authObj = void 0;
    }
    init(e) {
      switch (Ce.adapter || (this.requestClient = new Ce.adapter.reqClass({ timeout: e.timeout || 5e3, timeoutMsg: `请求在${(e.timeout || 5e3) / 1e3}s内未完成，已中断` })), this.config = { ...dt, ...e }, true) {
        case this.config.timeout > 6e5:
          console.warn("timeout大于可配置上限[10分钟]，已重置为上限数值"), this.config.timeout = 6e5;
          break;
        case this.config.timeout < 100:
          console.warn("timeout小于可配置下限[100ms]，已重置为下限数值"), this.config.timeout = 100;
      }
      return new ft(this.config);
    }
    auth({ persistence: e } = {}) {
      if (this.authObj)
        return this.authObj;
      const t2 = e || Ce.adapter.primaryStorage || dt.persistence;
      var n2;
      return t2 !== this.config.persistence && (this.config.persistence = t2), function(e2) {
        const { env: t3 } = e2;
        Oe[t3] = new Ee(e2), xe[t3] = new Ee({ ...e2, persistence: "local" });
      }(this.config), n2 = this.config, Qe[n2.env] = new Ve(n2), this.authObj = new it(this.config), this.authObj;
    }
    on(e, t2) {
      return De.apply(this, [e, t2]);
    }
    off(e, t2) {
      return qe.apply(this, [e, t2]);
    }
    callFunction(e, t2) {
      return lt.apply(this, [e, t2]);
    }
    deleteFile(e, t2) {
      return ct.apply(this, [e, t2]);
    }
    getTempFileURL(e, t2) {
      return ut.apply(this, [e, t2]);
    }
    downloadFile(e, t2) {
      return ht.apply(this, [e, t2]);
    }
    uploadFile(e, t2) {
      return ot.apply(this, [e, t2]);
    }
    getUploadMetadata(e, t2) {
      return at.apply(this, [e, t2]);
    }
    registerExtension(e) {
      pt[e.name] = e;
    }
    async invokeExtension(e, t2) {
      const n2 = pt[e];
      if (!n2)
        throw new ne({ message: `扩展${e} 必须先注册` });
      return await n2.invoke(t2, this);
    }
    useAdapters(e) {
      const { adapter: t2, runtime: n2 } = ke(e) || {};
      t2 && (Ce.adapter = t2), n2 && (Ce.runtime = n2);
    }
  }
  var gt = new ft();
  function mt(e, t2, n2) {
    void 0 === n2 && (n2 = {});
    var s2 = /\?/.test(t2), r2 = "";
    for (var i2 in n2)
      "" === r2 ? !s2 && (t2 += "?") : r2 += "&", r2 += i2 + "=" + encodeURIComponent(n2[i2]);
    return /^http(s)?:\/\//.test(t2 += r2) ? t2 : "" + e + t2;
  }
  class yt {
    post(e) {
      const { url: t2, data: n2, headers: s2 } = e;
      return new Promise((e2, r2) => {
        se.request({ url: mt("https:", t2), data: n2, method: "POST", header: s2, success(t3) {
          e2(t3);
        }, fail(e3) {
          r2(e3);
        } });
      });
    }
    upload(e) {
      return new Promise((t2, n2) => {
        const { url: s2, file: r2, data: i2, headers: o2, fileType: a2 } = e, c2 = se.uploadFile({ url: mt("https:", s2), name: "file", formData: Object.assign({}, i2), filePath: r2, fileType: a2, header: o2, success(e2) {
          const n3 = { statusCode: e2.statusCode, data: e2.data || {} };
          200 === e2.statusCode && i2.success_action_status && (n3.statusCode = parseInt(i2.success_action_status, 10)), t2(n3);
        }, fail(e2) {
          n2(new Error(e2.errMsg || "uploadFile:fail"));
        } });
        "function" == typeof e.onUploadProgress && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((t3) => {
          e.onUploadProgress({ loaded: t3.totalBytesSent, total: t3.totalBytesExpectedToSend });
        });
      });
    }
  }
  const _t = { setItem(e, t2) {
    se.setStorageSync(e, t2);
  }, getItem: (e) => se.getStorageSync(e), removeItem(e) {
    se.removeStorageSync(e);
  }, clear() {
    se.clearStorageSync();
  } };
  var wt = { genAdapter: function() {
    return { root: {}, reqClass: yt, localStorage: _t, primaryStorage: "local" };
  }, isMatch: function() {
    return true;
  }, runtime: "uni_app" };
  gt.useAdapters(wt);
  const vt = gt, It = vt.init;
  vt.init = function(e) {
    e.env = e.spaceId;
    const t2 = It.call(this, e);
    t2.config.provider = "tencent", t2.config.spaceId = e.spaceId;
    const n2 = t2.auth;
    return t2.auth = function(e2) {
      const t3 = n2.call(this, e2);
      return ["linkAndRetrieveDataWithTicket", "signInAnonymously", "signOut", "getAccessToken", "getLoginState", "signInWithTicket", "getUserInfo"].forEach((e3) => {
        var n3;
        t3[e3] = (n3 = t3[e3], function(e4) {
          e4 = e4 || {};
          const { success: t4, fail: s2, complete: r2 } = te(e4);
          if (!(t4 || s2 || r2))
            return n3.call(this, e4);
          n3.call(this, e4).then((e5) => {
            t4 && t4(e5), r2 && r2(e5);
          }, (e5) => {
            s2 && s2(e5), r2 && r2(e5);
          });
        }).bind(t3);
      }), t3;
    }, t2.customAuth = t2.auth, t2;
  };
  var St = vt;
  var bt = class extends ge {
    getAccessToken() {
      return new Promise((e, t2) => {
        const n2 = "Anonymous_Access_token";
        this.setAccessToken(n2), e(n2);
      });
    }
    setupRequest(e, t2) {
      const n2 = Object.assign({}, e, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
      "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = de.sign(n2, this.config.clientSecret);
      const r2 = le();
      s2["x-client-info"] = encodeURIComponent(JSON.stringify(r2));
      const { token: i2 } = ie();
      return s2["x-client-token"] = i2, { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: JSON.parse(JSON.stringify(s2)) };
    }
    uploadFileToOSS({ url: e, formData: t2, name: n2, filePath: s2, fileType: r2, onUploadProgress: i2 }) {
      return new Promise((o2, a2) => {
        const c2 = this.adapter.uploadFile({ url: e, formData: t2, name: n2, filePath: s2, fileType: r2, success(e2) {
          e2 && e2.statusCode < 400 ? o2(e2) : a2(new ne({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e2) {
          a2(new ne({ code: e2.code || "UPLOAD_FAILED", message: e2.message || e2.errMsg || "文件上传失败" }));
        } });
        "function" == typeof i2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e2) => {
          i2({ loaded: e2.totalBytesSent, total: e2.totalBytesExpectedToSend });
        });
      });
    }
    uploadFile({ filePath: e, cloudPath: t2, fileType: n2 = "image", onUploadProgress: s2 }) {
      if (!t2)
        throw new ne({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
      let r2;
      return this.getOSSUploadOptionsFromPath({ cloudPath: t2 }).then((t3) => {
        const { url: i2, formData: o2, name: a2 } = t3.result;
        r2 = t3.result.fileUrl;
        const c2 = { url: i2, formData: o2, name: a2, filePath: e, fileType: n2 };
        return this.uploadFileToOSS(Object.assign({}, c2, { onUploadProgress: s2 }));
      }).then(() => this.reportOSSUpload({ cloudPath: t2 })).then((t3) => new Promise((n3, s3) => {
        t3.success ? n3({ success: true, filePath: e, fileID: r2 }) : s3(new ne({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
      }));
    }
    deleteFile({ fileList: e }) {
      const t2 = { method: "serverless.file.resource.delete", params: JSON.stringify({ fileList: e }) };
      return this.request(this.setupRequest(t2)).then((e2) => {
        if (e2.success)
          return e2.result;
        throw new ne({ code: "DELETE_FILE_FAILED", message: "删除文件失败" });
      });
    }
    getTempFileURL({ fileList: e } = {}) {
      if (!Array.isArray(e) || 0 === e.length)
        throw new ne({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const t2 = { method: "serverless.file.resource.getTempFileURL", params: JSON.stringify({ fileList: e }) };
      return this.request(this.setupRequest(t2)).then((e2) => {
        if (e2.success)
          return { fileList: e2.result.fileList.map((e3) => ({ fileID: e3.fileID, tempFileURL: e3.tempFileURL })) };
        throw new ne({ code: "GET_TEMP_FILE_URL_FAILED", message: "获取临时文件链接失败" });
      });
    }
  };
  var kt = { init(e) {
    const t2 = new bt(e), n2 = { signInAnonymously: function() {
      return t2.authorize();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } };
  function Ct({ data: e }) {
    let t2;
    t2 = le();
    const n2 = JSON.parse(JSON.stringify(e || {}));
    if (Object.assign(n2, { clientInfo: t2 }), !n2.uniIdToken) {
      const { token: e2 } = ie();
      e2 && (n2.uniIdToken = e2);
    }
    return n2;
  }
  async function Tt({ name: e, data: t2 } = {}) {
    await this.__dev__.initLocalNetwork();
    const { localAddress: n2, localPort: s2 } = this.__dev__, r2 = { aliyun: "aliyun", tencent: "tcb" }[this.config.provider], i2 = this.config.spaceId, o2 = `http://${n2}:${s2}/system/check-function`, a2 = `http://${n2}:${s2}/cloudfunctions/${e}`;
    return new Promise((t3, n3) => {
      se.request({ method: "POST", url: o2, data: { name: e, platform: P, provider: r2, spaceId: i2 }, timeout: 3e3, success(e2) {
        t3(e2);
      }, fail() {
        t3({ data: { code: "NETWORK_ERROR", message: "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下，自动切换为已部署的云函数。" } });
      } });
    }).then(({ data: e2 } = {}) => {
      const { code: t3, message: n3 } = e2 || {};
      return { code: 0 === t3 ? 0 : t3 || "SYS_ERR", message: n3 || "SYS_ERR" };
    }).then(({ code: n3, message: s3 }) => {
      if (0 !== n3) {
        switch (n3) {
          case "MODULE_ENCRYPTED":
            console.error(`此云函数（${e}）依赖加密公共模块不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "FUNCTION_ENCRYPTED":
            console.error(`此云函数（${e}）已加密不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "ACTION_ENCRYPTED":
            console.error(s3 || "需要访问加密的uni-clientDB-action，自动切换为云端环境");
            break;
          case "NETWORK_ERROR": {
            const e2 = "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下";
            throw console.error(e2), new Error(e2);
          }
          case "SWITCH_TO_CLOUD":
            break;
          default: {
            const e2 = `检测本地调试服务出现错误：${s3}，请检查网络环境或重启客户端再试`;
            throw console.error(e2), new Error(e2);
          }
        }
        return this._callCloudFunction({ name: e, data: t2 });
      }
      return new Promise((e2, n4) => {
        const s4 = Ct.call(this, { data: t2 });
        se.request({ method: "POST", url: a2, data: { provider: r2, platform: P, param: s4 }, success: ({ statusCode: t3, data: s5 } = {}) => !t3 || t3 >= 400 ? n4(new ne({ code: s5.code || "SYS_ERR", message: s5.message || "request:fail" })) : e2({ result: s5 }), fail(e3) {
          n4(new ne({ code: e3.code || e3.errCode || "SYS_ERR", message: e3.message || e3.errMsg || "request:fail" }));
        } });
      });
    });
  }
  const Pt = [{ rule: /fc_function_not_found|FUNCTION_NOT_FOUND/, content: "，云函数[{functionName}]在云端不存在，请检查此云函数名称是否正确以及该云函数是否已上传到服务空间", mode: "append" }];
  var At = /[\\^$.*+?()[\]{}|]/g, Et = RegExp(At.source);
  function Ot(e, t2, n2) {
    return e.replace(new RegExp((s2 = t2) && Et.test(s2) ? s2.replace(At, "\\$&") : s2, "g"), n2);
    var s2;
  }
  const Rt = "request", Ut = "response", Lt = "both";
  const yn = { code: 2e4, message: "System error" }, _n = { code: 20101, message: "Invalid client" };
  function In(e) {
    const { errSubject: t2, subject: n2, errCode: s2, errMsg: r2, code: i2, message: o2, cause: a2 } = e || {};
    return new ne({ subject: t2 || n2 || "uni-secure-network", code: s2 || i2 || yn.code, message: r2 || o2, cause: a2 });
  }
  let bn;
  function An({ secretType: e } = {}) {
    return e === Rt || e === Ut || e === Lt;
  }
  function En({ name: e, data: t2 = {} } = {}) {
    return "DCloud-clientDB" === e && "encryption" === t2.redirectTo && "getAppClientKey" === t2.action;
  }
  function On({ provider: e, spaceId: t2, functionName: n2 } = {}) {
    const { appId: s2, uniPlatform: r2, osName: i2 } = ue();
    let o2 = r2;
    "app" === r2 && (o2 = i2);
    const a2 = function({ provider: e2, spaceId: t3 } = {}) {
      const n3 = T;
      if (!n3)
        return {};
      e2 = function(e3) {
        return "tencent" === e3 ? "tcb" : e3;
      }(e2);
      const s3 = n3.find((n4) => n4.provider === e2 && n4.spaceId === t3);
      return s3 && s3.config;
    }({ provider: e, spaceId: t2 });
    if (!a2 || !a2.accessControl || !a2.accessControl.enable)
      return false;
    const c2 = a2.accessControl.function || {}, u2 = Object.keys(c2);
    if (0 === u2.length)
      return true;
    const h2 = function(e2, t3) {
      let n3, s3, r3;
      for (let i3 = 0; i3 < e2.length; i3++) {
        const o3 = e2[i3];
        o3 !== t3 ? "*" !== o3 ? o3.split(",").map((e3) => e3.trim()).indexOf(t3) > -1 && (s3 = o3) : r3 = o3 : n3 = o3;
      }
      return n3 || s3 || r3;
    }(u2, n2);
    if (!h2)
      return false;
    if ((c2[h2] || []).find((e2 = {}) => e2.appId === s2 && (e2.platform || "").toLowerCase() === o2.toLowerCase()))
      return true;
    throw console.error(`此应用[appId: ${s2}, platform: ${o2}]不在云端配置的允许访问的应用列表内，参考：https://uniapp.dcloud.net.cn/uniCloud/secure-network.html#verify-client`), In(_n);
  }
  function xn({ functionName: e, result: t2, logPvd: n2 }) {
    if (this.__dev__.debugLog && t2 && t2.requestId) {
      const s2 = JSON.stringify({ spaceId: this.config.spaceId, functionName: e, requestId: t2.requestId });
      console.log(`[${n2}-request]${s2}[/${n2}-request]`);
    }
  }
  function Rn(e) {
    const t2 = e.callFunction, n2 = function(n3) {
      const s2 = n3.name;
      n3.data = Ct.call(e, { data: n3.data });
      const r2 = { aliyun: "aliyun", tencent: "tcb", tcb: "tcb" }[this.config.provider], i2 = An(n3), o2 = En(n3), a2 = i2 || o2;
      return t2.call(this, n3).then((e2) => (e2.errCode = 0, !a2 && xn.call(this, { functionName: s2, result: e2, logPvd: r2 }), Promise.resolve(e2)), (e2) => (!a2 && xn.call(this, { functionName: s2, result: e2, logPvd: r2 }), e2 && e2.message && (e2.message = function({ message: e3 = "", extraInfo: t3 = {}, formatter: n4 = [] } = {}) {
        for (let s3 = 0; s3 < n4.length; s3++) {
          const { rule: r3, content: i3, mode: o3 } = n4[s3], a3 = e3.match(r3);
          if (!a3)
            continue;
          let c2 = i3;
          for (let e4 = 1; e4 < a3.length; e4++)
            c2 = Ot(c2, `{$${e4}}`, a3[e4]);
          for (const e4 in t3)
            c2 = Ot(c2, `{${e4}}`, t3[e4]);
          return "replace" === o3 ? c2 : e3 + c2;
        }
        return e3;
      }({ message: `[${n3.name}]: ${e2.message}`, formatter: Pt, extraInfo: { functionName: s2 } })), Promise.reject(e2)));
    };
    e.callFunction = function(t3) {
      const { provider: s2, spaceId: r2 } = e.config, i2 = t3.name;
      let o2, a2;
      if (t3.data = t3.data || {}, e.__dev__.debugInfo && !e.__dev__.debugInfo.forceRemote && E ? (e._callCloudFunction || (e._callCloudFunction = n2, e._callLocalFunction = Tt), o2 = Tt) : o2 = n2, o2 = o2.bind(e), En(t3))
        a2 = n2.call(e, t3);
      else if (An(t3)) {
        a2 = new bn({ secretType: t3.secretType, uniCloudIns: e }).wrapEncryptDataCallFunction(n2.bind(e))(t3);
      } else if (On({ provider: s2, spaceId: r2, functionName: i2 })) {
        a2 = new bn({ secretType: t3.secretType, uniCloudIns: e }).wrapVerifyClientCallFunction(n2.bind(e))(t3);
      } else
        a2 = o2(t3);
      return Object.defineProperty(a2, "result", { get: () => (console.warn("当前返回结果为Promise类型，不可直接访问其result属性，详情请参考：https://uniapp.dcloud.net.cn/uniCloud/faq?id=promise"), {}) }), a2;
    };
  }
  bn = class {
    constructor() {
      throw In({ message: `Platform ${P} is not enabled, please check whether secure network module is enabled in your manifest.json` });
    }
  };
  const Un = Symbol("CLIENT_DB_INTERNAL");
  function Ln(e, t2) {
    return e.then = "DoNotReturnProxyWithAFunctionNamedThen", e._internalType = Un, e.inspect = null, e.__v_raw = void 0, new Proxy(e, { get(e2, n2, s2) {
      if ("_uniClient" === n2)
        return null;
      if ("symbol" == typeof n2)
        return e2[n2];
      if (n2 in e2 || "string" != typeof n2) {
        const t3 = e2[n2];
        return "function" == typeof t3 ? t3.bind(e2) : t3;
      }
      return t2.get(e2, n2, s2);
    } });
  }
  function Nn(e) {
    return { on: (t2, n2) => {
      e[t2] = e[t2] || [], e[t2].indexOf(n2) > -1 || e[t2].push(n2);
    }, off: (t2, n2) => {
      e[t2] = e[t2] || [];
      const s2 = e[t2].indexOf(n2);
      -1 !== s2 && e[t2].splice(s2, 1);
    } };
  }
  const Dn = ["db.Geo", "db.command", "command.aggregate"];
  function Fn(e, t2) {
    return Dn.indexOf(`${e}.${t2}`) > -1;
  }
  function qn(e) {
    switch (g(e = re(e))) {
      case "array":
        return e.map((e2) => qn(e2));
      case "object":
        return e._internalType === Un || Object.keys(e).forEach((t2) => {
          e[t2] = qn(e[t2]);
        }), e;
      case "regexp":
        return { $regexp: { source: e.source, flags: e.flags } };
      case "date":
        return { $date: e.toISOString() };
      default:
        return e;
    }
  }
  function Mn(e) {
    return e && e.content && e.content.$method;
  }
  class Kn {
    constructor(e, t2, n2) {
      this.content = e, this.prevStage = t2 || null, this.udb = null, this._database = n2;
    }
    toJSON() {
      let e = this;
      const t2 = [e.content];
      for (; e.prevStage; )
        e = e.prevStage, t2.push(e.content);
      return { $db: t2.reverse().map((e2) => ({ $method: e2.$method, $param: qn(e2.$param) })) };
    }
    toString() {
      return JSON.stringify(this.toJSON());
    }
    getAction() {
      const e = this.toJSON().$db.find((e2) => "action" === e2.$method);
      return e && e.$param && e.$param[0];
    }
    getCommand() {
      return { $db: this.toJSON().$db.filter((e) => "action" !== e.$method) };
    }
    get isAggregate() {
      let e = this;
      for (; e; ) {
        const t2 = Mn(e), n2 = Mn(e.prevStage);
        if ("aggregate" === t2 && "collection" === n2 || "pipeline" === t2)
          return true;
        e = e.prevStage;
      }
      return false;
    }
    get isCommand() {
      let e = this;
      for (; e; ) {
        if ("command" === Mn(e))
          return true;
        e = e.prevStage;
      }
      return false;
    }
    get isAggregateCommand() {
      let e = this;
      for (; e; ) {
        const t2 = Mn(e), n2 = Mn(e.prevStage);
        if ("aggregate" === t2 && "command" === n2)
          return true;
        e = e.prevStage;
      }
      return false;
    }
    getNextStageFn(e) {
      const t2 = this;
      return function() {
        return jn({ $method: e, $param: qn(Array.from(arguments)) }, t2, t2._database);
      };
    }
    get count() {
      return this.isAggregate ? this.getNextStageFn("count") : function() {
        return this._send("count", Array.from(arguments));
      };
    }
    get remove() {
      return this.isCommand ? this.getNextStageFn("remove") : function() {
        return this._send("remove", Array.from(arguments));
      };
    }
    get() {
      return this._send("get", Array.from(arguments));
    }
    get add() {
      return this.isCommand ? this.getNextStageFn("add") : function() {
        return this._send("add", Array.from(arguments));
      };
    }
    update() {
      return this._send("update", Array.from(arguments));
    }
    end() {
      return this._send("end", Array.from(arguments));
    }
    get set() {
      return this.isCommand ? this.getNextStageFn("set") : function() {
        throw new Error("JQL禁止使用set方法");
      };
    }
    _send(e, t2) {
      const n2 = this.getAction(), s2 = this.getCommand();
      if (s2.$db.push({ $method: e, $param: qn(t2) }), b) {
        const e2 = s2.$db.find((e3) => "collection" === e3.$method), t3 = e2 && e2.$param;
        t3 && 1 === t3.length && "string" == typeof e2.$param[0] && e2.$param[0].indexOf(",") > -1 && console.warn("检测到使用JQL语法联表查询时，未使用getTemp先过滤主表数据，在主表数据量大的情况下可能会查询缓慢。\n- 如何优化请参考此文档：https://uniapp.dcloud.net.cn/uniCloud/jql?id=lookup-with-temp \n- 如果主表数据量很小请忽略此信息，项目发行时不会出现此提示。");
      }
      return this._database._callCloudFunction({ action: n2, command: s2 });
    }
  }
  function jn(e, t2, n2) {
    return Ln(new Kn(e, t2, n2), { get(e2, t3) {
      let s2 = "db";
      return e2 && e2.content && (s2 = e2.content.$method), Fn(s2, t3) ? jn({ $method: t3 }, e2, n2) : function() {
        return jn({ $method: t3, $param: qn(Array.from(arguments)) }, e2, n2);
      };
    } });
  }
  function Bn({ path: e, method: t2 }) {
    return class {
      constructor() {
        this.param = Array.from(arguments);
      }
      toJSON() {
        return { $newDb: [...e.map((e2) => ({ $method: e2 })), { $method: t2, $param: this.param }] };
      }
      toString() {
        return JSON.stringify(this.toJSON());
      }
    };
  }
  function $n(e, t2 = {}) {
    return Ln(new e(t2), { get: (e2, t3) => Fn("db", t3) ? jn({ $method: t3 }, null, e2) : function() {
      return jn({ $method: t3, $param: qn(Array.from(arguments)) }, null, e2);
    } });
  }
  class Wn extends class {
    constructor({ uniClient: e = {}, isJQL: t2 = false } = {}) {
      this._uniClient = e, this._authCallBacks = {}, this._dbCallBacks = {}, e._isDefault && (this._dbCallBacks = U("_globalUniCloudDatabaseCallback")), t2 || (this.auth = Nn(this._authCallBacks)), this._isJQL = t2, Object.assign(this, Nn(this._dbCallBacks)), this.env = Ln({}, { get: (e2, t3) => ({ $env: t3 }) }), this.Geo = Ln({}, { get: (e2, t3) => Bn({ path: ["Geo"], method: t3 }) }), this.serverDate = Bn({ path: [], method: "serverDate" }), this.RegExp = Bn({ path: [], method: "RegExp" });
    }
    getCloudEnv(e) {
      if ("string" != typeof e || !e.trim())
        throw new Error("getCloudEnv参数错误");
      return { $env: e.replace("$cloudEnv_", "") };
    }
    _callback(e, t2) {
      const n2 = this._dbCallBacks;
      n2[e] && n2[e].forEach((e2) => {
        e2(...t2);
      });
    }
    _callbackAuth(e, t2) {
      const n2 = this._authCallBacks;
      n2[e] && n2[e].forEach((e2) => {
        e2(...t2);
      });
    }
    multiSend() {
      const e = Array.from(arguments), t2 = e.map((e2) => {
        const t3 = e2.getAction(), n2 = e2.getCommand();
        if ("getTemp" !== n2.$db[n2.$db.length - 1].$method)
          throw new Error("multiSend只支持子命令内使用getTemp");
        return { action: t3, command: n2 };
      });
      return this._callCloudFunction({ multiCommand: t2, queryList: e });
    }
  } {
    _parseResult(e) {
      return this._isJQL ? e.result : e;
    }
    _callCloudFunction({ action: e, command: t2, multiCommand: n2, queryList: s2 }) {
      function r2(e2, t3) {
        if (n2 && s2)
          for (let n3 = 0; n3 < s2.length; n3++) {
            const r3 = s2[n3];
            r3.udb && "function" == typeof r3.udb.setResult && (t3 ? r3.udb.setResult(t3) : r3.udb.setResult(e2.result.dataList[n3]));
          }
      }
      const i2 = this, o2 = this._isJQL ? "databaseForJQL" : "database";
      function a2(e2) {
        return i2._callback("error", [e2]), q(M(o2, "fail"), e2).then(() => q(M(o2, "complete"), e2)).then(() => (r2(null, e2), Y(B, { type: z, content: e2 }), Promise.reject(e2)));
      }
      const c2 = q(M(o2, "invoke")), u2 = this._uniClient;
      return c2.then(() => u2.callFunction({ name: "DCloud-clientDB", type: l, data: { action: e, command: t2, multiCommand: n2 } })).then((e2) => {
        const { code: t3, message: n3, token: s3, tokenExpired: c3, systemInfo: u3 = [] } = e2.result;
        if (u3)
          for (let e3 = 0; e3 < u3.length; e3++) {
            const { level: t4, message: n4, detail: s4 } = u3[e3], r3 = console["warn" === t4 ? "error" : t4] || console.log;
            let i3 = "[System Info]" + n4;
            s4 && (i3 = `${i3}
详细信息：${s4}`), r3(i3);
          }
        if (t3) {
          return a2(new ne({ code: t3, message: n3, requestId: e2.requestId }));
        }
        e2.result.errCode = e2.result.errCode || e2.result.code, e2.result.errMsg = e2.result.errMsg || e2.result.message, s3 && c3 && (oe({ token: s3, tokenExpired: c3 }), this._callbackAuth("refreshToken", [{ token: s3, tokenExpired: c3 }]), this._callback("refreshToken", [{ token: s3, tokenExpired: c3 }]), Y(W, { token: s3, tokenExpired: c3 }));
        const h2 = [{ prop: "affectedDocs", tips: "affectedDocs不再推荐使用，请使用inserted/deleted/updated/data.length替代" }, { prop: "code", tips: "code不再推荐使用，请使用errCode替代" }, { prop: "message", tips: "message不再推荐使用，请使用errMsg替代" }];
        for (let t4 = 0; t4 < h2.length; t4++) {
          const { prop: n4, tips: s4 } = h2[t4];
          if (n4 in e2.result) {
            const t5 = e2.result[n4];
            Object.defineProperty(e2.result, n4, { get: () => (console.warn(s4), t5) });
          }
        }
        return function(e3) {
          return q(M(o2, "success"), e3).then(() => q(M(o2, "complete"), e3)).then(() => {
            r2(e3, null);
            const t4 = i2._parseResult(e3);
            return Y(B, { type: z, content: t4 }), Promise.resolve(t4);
          });
        }(e2);
      }, (e2) => {
        /fc_function_not_found|FUNCTION_NOT_FOUND/g.test(e2.message) && console.warn("clientDB未初始化，请在web控制台保存一次schema以开启clientDB");
        return a2(new ne({ code: e2.code || "SYSTEM_ERROR", message: e2.message, requestId: e2.requestId }));
      });
    }
  }
  const zn = "token无效，跳转登录页面", Jn = "token过期，跳转登录页面", Hn = { TOKEN_INVALID_TOKEN_EXPIRED: Jn, TOKEN_INVALID_INVALID_CLIENTID: zn, TOKEN_INVALID: zn, TOKEN_INVALID_WRONG_TOKEN: zn, TOKEN_INVALID_ANONYMOUS_USER: zn }, Gn = { "uni-id-token-expired": Jn, "uni-id-check-token-failed": zn, "uni-id-token-not-exist": zn, "uni-id-check-device-feature-failed": zn };
  function Vn(e, t2) {
    let n2 = "";
    return n2 = e ? `${e}/${t2}` : t2, n2.replace(/^\//, "");
  }
  function Qn(e = [], t2 = "") {
    const n2 = [], s2 = [];
    return e.forEach((e2) => {
      true === e2.needLogin ? n2.push(Vn(t2, e2.path)) : false === e2.needLogin && s2.push(Vn(t2, e2.path));
    }), { needLoginPage: n2, notNeedLoginPage: s2 };
  }
  function Yn(e) {
    return e.split("?")[0].replace(/^\//, "");
  }
  function Xn() {
    return function(e) {
      let t2 = e && e.$page && e.$page.fullPath || "";
      return t2 ? ("/" !== t2.charAt(0) && (t2 = "/" + t2), t2) : t2;
    }(function() {
      const e = getCurrentPages();
      return e[e.length - 1];
    }());
  }
  function Zn() {
    return Yn(Xn());
  }
  function es(e = "", t2 = {}) {
    if (!e)
      return false;
    if (!(t2 && t2.list && t2.list.length))
      return false;
    const n2 = t2.list, s2 = Yn(e);
    return n2.some((e2) => e2.pagePath === s2);
  }
  const ts = !!t.uniIdRouter;
  const { loginPage: ns, routerNeedLogin: ss, resToLogin: rs, needLoginPage: is, notNeedLoginPage: os, loginPageInTabBar: as } = function({ pages: e = [], subPackages: n2 = [], uniIdRouter: s2 = {}, tabBar: r2 = {} } = t) {
    const { loginPage: i2, needLogin: o2 = [], resToLogin: a2 = true } = s2, { needLoginPage: c2, notNeedLoginPage: u2 } = Qn(e), { needLoginPage: h2, notNeedLoginPage: l2 } = function(e2 = []) {
      const t2 = [], n3 = [];
      return e2.forEach((e3) => {
        const { root: s3, pages: r3 = [] } = e3, { needLoginPage: i3, notNeedLoginPage: o3 } = Qn(r3, s3);
        t2.push(...i3), n3.push(...o3);
      }), { needLoginPage: t2, notNeedLoginPage: n3 };
    }(n2);
    return { loginPage: i2, routerNeedLogin: o2, resToLogin: a2, needLoginPage: [...c2, ...h2], notNeedLoginPage: [...u2, ...l2], loginPageInTabBar: es(i2, r2) };
  }();
  if (is.indexOf(ns) > -1)
    throw new Error(`Login page [${ns}] should not be "needLogin", please check your pages.json`);
  function cs(e) {
    const t2 = Zn();
    if ("/" === e.charAt(0))
      return e;
    const [n2, s2] = e.split("?"), r2 = n2.replace(/^\//, "").split("/"), i2 = t2.split("/");
    i2.pop();
    for (let e2 = 0; e2 < r2.length; e2++) {
      const t3 = r2[e2];
      ".." === t3 ? i2.pop() : "." !== t3 && i2.push(t3);
    }
    return "" === i2[0] && i2.shift(), "/" + i2.join("/") + (s2 ? "?" + s2 : "");
  }
  function us(e) {
    const t2 = Yn(cs(e));
    return !(os.indexOf(t2) > -1) && (is.indexOf(t2) > -1 || ss.some((t3) => function(e2, t4) {
      return new RegExp(t4).test(e2);
    }(e, t3)));
  }
  function hs({ redirect: e }) {
    const t2 = Yn(e), n2 = Yn(ns);
    return Zn() !== n2 && t2 !== n2;
  }
  function ls({ api: e, redirect: t2 } = {}) {
    if (!t2 || !hs({ redirect: t2 }))
      return;
    const n2 = function(e2, t3) {
      return "/" !== e2.charAt(0) && (e2 = "/" + e2), t3 ? e2.indexOf("?") > -1 ? e2 + `&uniIdRedirectUrl=${encodeURIComponent(t3)}` : e2 + `?uniIdRedirectUrl=${encodeURIComponent(t3)}` : e2;
    }(ns, t2);
    as ? "navigateTo" !== e && "redirectTo" !== e || (e = "switchTab") : "switchTab" === e && (e = "navigateTo");
    const s2 = { navigateTo: uni.navigateTo, redirectTo: uni.redirectTo, switchTab: uni.switchTab, reLaunch: uni.reLaunch };
    setTimeout(() => {
      s2[e]({ url: n2 });
    });
  }
  function ds({ url: e } = {}) {
    const t2 = { abortLoginPageJump: false, autoToLoginPage: false }, n2 = function() {
      const { token: e2, tokenExpired: t3 } = ie();
      let n3;
      if (e2) {
        if (t3 < Date.now()) {
          const e3 = "uni-id-token-expired";
          n3 = { errCode: e3, errMsg: Gn[e3] };
        }
      } else {
        const e3 = "uni-id-check-token-failed";
        n3 = { errCode: e3, errMsg: Gn[e3] };
      }
      return n3;
    }();
    if (us(e) && n2) {
      n2.uniIdRedirectUrl = e;
      if (G($).length > 0)
        return setTimeout(() => {
          Y($, n2);
        }, 0), t2.abortLoginPageJump = true, t2;
      t2.autoToLoginPage = true;
    }
    return t2;
  }
  function ps() {
    !function() {
      const e2 = Xn(), { abortLoginPageJump: t2, autoToLoginPage: n2 } = ds({ url: e2 });
      t2 || n2 && ls({ api: "redirectTo", redirect: e2 });
    }();
    const e = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];
    for (let t2 = 0; t2 < e.length; t2++) {
      const n2 = e[t2];
      uni.addInterceptor(n2, { invoke(e2) {
        const { abortLoginPageJump: t3, autoToLoginPage: s2 } = ds({ url: e2.url });
        return t3 ? e2 : s2 ? (ls({ api: n2, redirect: cs(e2.url) }), false) : e2;
      } });
    }
  }
  function fs() {
    this.onResponse((e) => {
      const { type: t2, content: n2 } = e;
      let s2 = false;
      switch (t2) {
        case "cloudobject":
          s2 = function(e2) {
            if ("object" != typeof e2)
              return false;
            const { errCode: t3 } = e2 || {};
            return t3 in Gn;
          }(n2);
          break;
        case "clientdb":
          s2 = function(e2) {
            if ("object" != typeof e2)
              return false;
            const { errCode: t3 } = e2 || {};
            return t3 in Hn;
          }(n2);
      }
      s2 && function(e2 = {}) {
        const t3 = G($);
        ee().then(() => {
          const n3 = Xn();
          if (n3 && hs({ redirect: n3 }))
            return t3.length > 0 ? Y($, Object.assign({ uniIdRedirectUrl: n3 }, e2)) : void (ns && ls({ api: "navigateTo", redirect: n3 }));
        });
      }(n2);
    });
  }
  function gs(e) {
    !function(e2) {
      e2.onResponse = function(e3) {
        V(B, e3);
      }, e2.offResponse = function(e3) {
        Q(B, e3);
      };
    }(e), function(e2) {
      e2.onNeedLogin = function(e3) {
        V($, e3);
      }, e2.offNeedLogin = function(e3) {
        Q($, e3);
      }, ts && (U("_globalUniCloudStatus").needLoginInit || (U("_globalUniCloudStatus").needLoginInit = true, ee().then(() => {
        ps.call(e2);
      }), rs && fs.call(e2)));
    }(e), function(e2) {
      e2.onRefreshToken = function(e3) {
        V(W, e3);
      }, e2.offRefreshToken = function(e3) {
        Q(W, e3);
      };
    }(e);
  }
  let ms;
  const ys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", _s = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
  function ws() {
    const e = ie().token || "", t2 = e.split(".");
    if (!e || 3 !== t2.length)
      return { uid: null, role: [], permission: [], tokenExpired: 0 };
    let n2;
    try {
      n2 = JSON.parse((s2 = t2[1], decodeURIComponent(ms(s2).split("").map(function(e2) {
        return "%" + ("00" + e2.charCodeAt(0).toString(16)).slice(-2);
      }).join(""))));
    } catch (e2) {
      throw new Error("获取当前用户信息出错，详细错误信息为：" + e2.message);
    }
    var s2;
    return n2.tokenExpired = 1e3 * n2.exp, delete n2.exp, delete n2.iat, n2;
  }
  ms = "function" != typeof atob ? function(e) {
    if (e = String(e).replace(/[\t\n\f\r ]+/g, ""), !_s.test(e))
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    var t2;
    e += "==".slice(2 - (3 & e.length));
    for (var n2, s2, r2 = "", i2 = 0; i2 < e.length; )
      t2 = ys.indexOf(e.charAt(i2++)) << 18 | ys.indexOf(e.charAt(i2++)) << 12 | (n2 = ys.indexOf(e.charAt(i2++))) << 6 | (s2 = ys.indexOf(e.charAt(i2++))), r2 += 64 === n2 ? String.fromCharCode(t2 >> 16 & 255) : 64 === s2 ? String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255) : String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2);
    return r2;
  } : atob;
  var vs = s(function(e, t2) {
    Object.defineProperty(t2, "__esModule", { value: true });
    const n2 = "chooseAndUploadFile:ok", s2 = "chooseAndUploadFile:fail";
    function r2(e2, t3) {
      return e2.tempFiles.forEach((e3, n3) => {
        e3.name || (e3.name = e3.path.substring(e3.path.lastIndexOf("/") + 1)), t3 && (e3.fileType = t3), e3.cloudPath = Date.now() + "_" + n3 + e3.name.substring(e3.name.lastIndexOf("."));
      }), e2.tempFilePaths || (e2.tempFilePaths = e2.tempFiles.map((e3) => e3.path)), e2;
    }
    function i2(e2, t3, { onChooseFile: s3, onUploadProgress: r3 }) {
      return t3.then((e3) => {
        if (s3) {
          const t4 = s3(e3);
          if (void 0 !== t4)
            return Promise.resolve(t4).then((t5) => void 0 === t5 ? e3 : t5);
        }
        return e3;
      }).then((t4) => false === t4 ? { errMsg: n2, tempFilePaths: [], tempFiles: [] } : function(e3, t5, s4 = 5, r4) {
        (t5 = Object.assign({}, t5)).errMsg = n2;
        const i3 = t5.tempFiles, o2 = i3.length;
        let a2 = 0;
        return new Promise((n3) => {
          for (; a2 < s4; )
            c2();
          function c2() {
            const s5 = a2++;
            if (s5 >= o2)
              return void (!i3.find((e4) => !e4.url && !e4.errMsg) && n3(t5));
            const u2 = i3[s5];
            e3.uploadFile({ filePath: u2.path, cloudPath: u2.cloudPath, fileType: u2.fileType, onUploadProgress(e4) {
              e4.index = s5, e4.tempFile = u2, e4.tempFilePath = u2.path, r4 && r4(e4);
            } }).then((e4) => {
              u2.url = e4.fileID, s5 < o2 && c2();
            }).catch((e4) => {
              u2.errMsg = e4.errMsg || e4.message, s5 < o2 && c2();
            });
          }
        });
      }(e2, t4, 5, r3));
    }
    t2.initChooseAndUploadFile = function(e2) {
      return function(t3 = { type: "all" }) {
        return "image" === t3.type ? i2(e2, function(e3) {
          const { count: t4, sizeType: n3, sourceType: i3 = ["album", "camera"], extension: o2 } = e3;
          return new Promise((e4, a2) => {
            uni.chooseImage({ count: t4, sizeType: n3, sourceType: i3, extension: o2, success(t5) {
              e4(r2(t5, "image"));
            }, fail(e5) {
              a2({ errMsg: e5.errMsg.replace("chooseImage:fail", s2) });
            } });
          });
        }(t3), t3) : "video" === t3.type ? i2(e2, function(e3) {
          const { camera: t4, compressed: n3, maxDuration: i3, sourceType: o2 = ["album", "camera"], extension: a2 } = e3;
          return new Promise((e4, c2) => {
            uni.chooseVideo({ camera: t4, compressed: n3, maxDuration: i3, sourceType: o2, extension: a2, success(t5) {
              const { tempFilePath: n4, duration: s3, size: i4, height: o3, width: a3 } = t5;
              e4(r2({ errMsg: "chooseVideo:ok", tempFilePaths: [n4], tempFiles: [{ name: t5.tempFile && t5.tempFile.name || "", path: n4, size: i4, type: t5.tempFile && t5.tempFile.type || "", width: a3, height: o3, duration: s3, fileType: "video", cloudPath: "" }] }, "video"));
            }, fail(e5) {
              c2({ errMsg: e5.errMsg.replace("chooseVideo:fail", s2) });
            } });
          });
        }(t3), t3) : i2(e2, function(e3) {
          const { count: t4, extension: n3 } = e3;
          return new Promise((e4, i3) => {
            let o2 = uni.chooseFile;
            if ("undefined" != typeof wx && "function" == typeof wx.chooseMessageFile && (o2 = wx.chooseMessageFile), "function" != typeof o2)
              return i3({ errMsg: s2 + " 请指定 type 类型，该平台仅支持选择 image 或 video。" });
            o2({ type: "all", count: t4, extension: n3, success(t5) {
              e4(r2(t5));
            }, fail(e5) {
              i3({ errMsg: e5.errMsg.replace("chooseFile:fail", s2) });
            } });
          });
        }(t3), t3);
      };
    };
  }), Is = n(vs);
  const Ss = "manual";
  function bs(e) {
    return { props: { localdata: { type: Array, default: () => [] }, options: { type: [Object, Array], default: () => ({}) }, spaceInfo: { type: Object, default: () => ({}) }, collection: { type: [String, Array], default: "" }, action: { type: String, default: "" }, field: { type: String, default: "" }, orderby: { type: String, default: "" }, where: { type: [String, Object], default: "" }, pageData: { type: String, default: "add" }, pageCurrent: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 }, getcount: { type: [Boolean, String], default: false }, gettree: { type: [Boolean, String], default: false }, gettreepath: { type: [Boolean, String], default: false }, startwith: { type: String, default: "" }, limitlevel: { type: Number, default: 10 }, groupby: { type: String, default: "" }, groupField: { type: String, default: "" }, distinct: { type: [Boolean, String], default: false }, foreignKey: { type: String, default: "" }, loadtime: { type: String, default: "auto" }, manual: { type: Boolean, default: false } }, data: () => ({ mixinDatacomLoading: false, mixinDatacomHasMore: false, mixinDatacomResData: [], mixinDatacomErrorMessage: "", mixinDatacomPage: {} }), created() {
      this.mixinDatacomPage = { current: this.pageCurrent, size: this.pageSize, count: 0 }, this.$watch(() => {
        var e2 = [];
        return ["pageCurrent", "pageSize", "localdata", "collection", "action", "field", "orderby", "where", "getont", "getcount", "gettree", "groupby", "groupField", "distinct"].forEach((t2) => {
          e2.push(this[t2]);
        }), e2;
      }, (e2, t2) => {
        if (this.loadtime === Ss)
          return;
        let n2 = false;
        const s2 = [];
        for (let r2 = 2; r2 < e2.length; r2++)
          e2[r2] !== t2[r2] && (s2.push(e2[r2]), n2 = true);
        e2[0] !== t2[0] && (this.mixinDatacomPage.current = this.pageCurrent), this.mixinDatacomPage.size = this.pageSize, this.onMixinDatacomPropsChange(n2, s2);
      });
    }, methods: { onMixinDatacomPropsChange(e2, t2) {
    }, mixinDatacomEasyGet({ getone: e2 = false, success: t2, fail: n2 } = {}) {
      this.mixinDatacomLoading || (this.mixinDatacomLoading = true, this.mixinDatacomErrorMessage = "", this.mixinDatacomGet().then((n3) => {
        this.mixinDatacomLoading = false;
        const { data: s2, count: r2 } = n3.result;
        this.getcount && (this.mixinDatacomPage.count = r2), this.mixinDatacomHasMore = s2.length < this.pageSize;
        const i2 = e2 ? s2.length ? s2[0] : void 0 : s2;
        this.mixinDatacomResData = i2, t2 && t2(i2);
      }).catch((e3) => {
        this.mixinDatacomLoading = false, this.mixinDatacomErrorMessage = e3, n2 && n2(e3);
      }));
    }, mixinDatacomGet(t2 = {}) {
      let n2 = e.database(this.spaceInfo);
      const s2 = t2.action || this.action;
      s2 && (n2 = n2.action(s2));
      const r2 = t2.collection || this.collection;
      n2 = Array.isArray(r2) ? n2.collection(...r2) : n2.collection(r2);
      const i2 = t2.where || this.where;
      i2 && Object.keys(i2).length && (n2 = n2.where(i2));
      const o2 = t2.field || this.field;
      o2 && (n2 = n2.field(o2));
      const a2 = t2.foreignKey || this.foreignKey;
      a2 && (n2 = n2.foreignKey(a2));
      const c2 = t2.groupby || this.groupby;
      c2 && (n2 = n2.groupBy(c2));
      const u2 = t2.groupField || this.groupField;
      u2 && (n2 = n2.groupField(u2));
      true === (void 0 !== t2.distinct ? t2.distinct : this.distinct) && (n2 = n2.distinct());
      const h2 = t2.orderby || this.orderby;
      h2 && (n2 = n2.orderBy(h2));
      const l2 = void 0 !== t2.pageCurrent ? t2.pageCurrent : this.mixinDatacomPage.current, d2 = void 0 !== t2.pageSize ? t2.pageSize : this.mixinDatacomPage.size, p2 = void 0 !== t2.getcount ? t2.getcount : this.getcount, f2 = void 0 !== t2.gettree ? t2.gettree : this.gettree, g2 = void 0 !== t2.gettreepath ? t2.gettreepath : this.gettreepath, m2 = { getCount: p2 }, y2 = { limitLevel: void 0 !== t2.limitlevel ? t2.limitlevel : this.limitlevel, startWith: void 0 !== t2.startwith ? t2.startwith : this.startwith };
      return f2 && (m2.getTree = y2), g2 && (m2.getTreePath = y2), n2 = n2.skip(d2 * (l2 - 1)).limit(d2).get(m2), n2;
    } } };
  }
  function ks(e) {
    return function(t2, n2 = {}) {
      n2 = function(e2, t3 = {}) {
        return e2.customUI = t3.customUI || e2.customUI, e2.parseSystemError = t3.parseSystemError || e2.parseSystemError, Object.assign(e2.loadingOptions, t3.loadingOptions), Object.assign(e2.errorOptions, t3.errorOptions), "object" == typeof t3.secretMethods && (e2.secretMethods = t3.secretMethods), e2;
      }({ customUI: false, loadingOptions: { title: "加载中...", mask: true }, errorOptions: { type: "modal", retry: false } }, n2);
      const { customUI: s2, loadingOptions: r2, errorOptions: i2, parseSystemError: o2 } = n2, a2 = !s2;
      return new Proxy({}, { get: (s3, c2) => function({ fn: e2, interceptorName: t3, getCallbackArgs: n3 } = {}) {
        return async function(...s4) {
          const r3 = n3 ? n3({ params: s4 }) : {};
          let i3, o3;
          try {
            return await q(M(t3, "invoke"), { ...r3 }), i3 = await e2(...s4), await q(M(t3, "success"), { ...r3, result: i3 }), i3;
          } catch (e3) {
            throw o3 = e3, await q(M(t3, "fail"), { ...r3, error: o3 }), o3;
          } finally {
            await q(M(t3, "complete"), o3 ? { ...r3, error: o3 } : { ...r3, result: i3 });
          }
        };
      }({ fn: async function s4(...u2) {
        let l2;
        a2 && uni.showLoading({ title: r2.title, mask: r2.mask });
        const d2 = { name: t2, type: h, data: { method: c2, params: u2 } };
        "object" == typeof n2.secretMethods && function(e2, t3) {
          const n3 = t3.data.method, s5 = e2.secretMethods || {}, r3 = s5[n3] || s5["*"];
          r3 && (t3.secretType = r3);
        }(n2, d2);
        let p2 = false;
        try {
          l2 = await e.callFunction(d2);
        } catch (e2) {
          p2 = true, l2 = { result: new ne(e2) };
        }
        const { errSubject: f2, errCode: g2, errMsg: m2, newToken: y2 } = l2.result || {};
        if (a2 && uni.hideLoading(), y2 && y2.token && y2.tokenExpired && (oe(y2), Y(W, { ...y2 })), g2) {
          let e2 = m2;
          if (p2 && o2) {
            e2 = (await o2({ objectName: t2, methodName: c2, params: u2, errSubject: f2, errCode: g2, errMsg: m2 })).errMsg || m2;
          }
          if (a2)
            if ("toast" === i2.type)
              uni.showToast({ title: e2, icon: "none" });
            else {
              if ("modal" !== i2.type)
                throw new Error(`Invalid errorOptions.type: ${i2.type}`);
              {
                const { confirm: t3 } = await async function({ title: e3, content: t4, showCancel: n4, cancelText: s5, confirmText: r3 } = {}) {
                  return new Promise((i3, o3) => {
                    uni.showModal({ title: e3, content: t4, showCancel: n4, cancelText: s5, confirmText: r3, success(e4) {
                      i3(e4);
                    }, fail() {
                      i3({ confirm: false, cancel: true });
                    } });
                  });
                }({ title: "提示", content: e2, showCancel: i2.retry, cancelText: "取消", confirmText: i2.retry ? "重试" : "确定" });
                if (i2.retry && t3)
                  return s4(...u2);
              }
            }
          const n3 = new ne({ subject: f2, code: g2, message: m2, requestId: l2.requestId });
          throw n3.detail = l2.result, Y(B, { type: H, content: n3 }), n3;
        }
        return Y(B, { type: H, content: l2.result }), l2.result;
      }, interceptorName: "callObject", getCallbackArgs: function({ params: e2 } = {}) {
        return { objectName: t2, methodName: c2, params: e2 };
      } }) });
    };
  }
  function Cs(e) {
    return U("_globalUniCloudSecureNetworkCache__{spaceId}".replace("{spaceId}", e.config.spaceId));
  }
  async function Ts({ openid: e, callLoginByWeixin: t2 = false } = {}) {
    Cs(this);
    throw new Error(`[SecureNetwork] API \`initSecureNetworkByWeixin\` is not supported on platform \`${P}\``);
  }
  async function Ps(e) {
    const t2 = Cs(this);
    return t2.initPromise || (t2.initPromise = Ts.call(this, e)), t2.initPromise;
  }
  function As(e) {
    return function({ openid: t2, callLoginByWeixin: n2 = false } = {}) {
      return Ps.call(e, { openid: t2, callLoginByWeixin: n2 });
    };
  }
  function Es(e) {
    const t2 = { getSystemInfo: uni.getSystemInfo, getPushClientId: uni.getPushClientId };
    return function(n2) {
      return new Promise((s2, r2) => {
        t2[e]({ ...n2, success(e2) {
          s2(e2);
        }, fail(e2) {
          r2(e2);
        } });
      });
    };
  }
  class Os extends class {
    constructor() {
      this._callback = {};
    }
    addListener(e, t2) {
      this._callback[e] || (this._callback[e] = []), this._callback[e].push(t2);
    }
    on(e, t2) {
      return this.addListener(e, t2);
    }
    removeListener(e, t2) {
      if (!t2)
        throw new Error('The "listener" argument must be of type function. Received undefined');
      const n2 = this._callback[e];
      if (!n2)
        return;
      const s2 = function(e2, t3) {
        for (let n3 = e2.length - 1; n3 >= 0; n3--)
          if (e2[n3] === t3)
            return n3;
        return -1;
      }(n2, t2);
      n2.splice(s2, 1);
    }
    off(e, t2) {
      return this.removeListener(e, t2);
    }
    removeAllListener(e) {
      delete this._callback[e];
    }
    emit(e, ...t2) {
      const n2 = this._callback[e];
      if (n2)
        for (let e2 = 0; e2 < n2.length; e2++)
          n2[e2](...t2);
    }
  } {
    constructor() {
      super(), this._uniPushMessageCallback = this._receivePushMessage.bind(this), this._currentMessageId = -1, this._payloadQueue = [];
    }
    init() {
      return Promise.all([Es("getSystemInfo")(), Es("getPushClientId")()]).then(([{ appId: e } = {}, { cid: t2 } = {}] = []) => {
        if (!e)
          throw new Error("Invalid appId, please check the manifest.json file");
        if (!t2)
          throw new Error("Invalid push client id");
        this._appId = e, this._pushClientId = t2, this._seqId = Date.now() + "-" + Math.floor(9e5 * Math.random() + 1e5), this.emit("open"), this._initMessageListener();
      }, (e) => {
        throw this.emit("error", e), this.close(), e;
      });
    }
    async open() {
      return this.init();
    }
    _isUniCloudSSE(e) {
      if ("receive" !== e.type)
        return false;
      const t2 = e && e.data && e.data.payload;
      return !(!t2 || "UNI_CLOUD_SSE" !== t2.channel || t2.seqId !== this._seqId);
    }
    _receivePushMessage(e) {
      if (!this._isUniCloudSSE(e))
        return;
      const t2 = e && e.data && e.data.payload, { action: n2, messageId: s2, message: r2 } = t2;
      this._payloadQueue.push({ action: n2, messageId: s2, message: r2 }), this._consumMessage();
    }
    _consumMessage() {
      for (; ; ) {
        const e = this._payloadQueue.find((e2) => e2.messageId === this._currentMessageId + 1);
        if (!e)
          break;
        this._currentMessageId++, this._parseMessagePayload(e);
      }
    }
    _parseMessagePayload(e) {
      const { action: t2, messageId: n2, message: s2 } = e;
      "end" === t2 ? this._end({ messageId: n2, message: s2 }) : "message" === t2 && this._appendMessage({ messageId: n2, message: s2 });
    }
    _appendMessage({ messageId: e, message: t2 } = {}) {
      this.emit("message", t2);
    }
    _end({ messageId: e, message: t2 } = {}) {
      this.emit("end", t2), this.close();
    }
    _initMessageListener() {
      uni.onPushMessage(this._uniPushMessageCallback);
    }
    _destroy() {
      uni.offPushMessage(this._uniPushMessageCallback);
    }
    toJSON() {
      return { appId: this._appId, pushClientId: this._pushClientId, seqId: this._seqId };
    }
    close() {
      this._destroy(), this.emit("close");
    }
  }
  async function xs(e, t2) {
    const n2 = `http://${e}:${t2}/system/ping`;
    try {
      const e2 = await (s2 = { url: n2, timeout: 500 }, new Promise((e3, t3) => {
        se.request({ ...s2, success(t4) {
          e3(t4);
        }, fail(e4) {
          t3(e4);
        } });
      }));
      return !(!e2.data || 0 !== e2.data.code);
    } catch (e2) {
      return false;
    }
    var s2;
  }
  async function Rs(e) {
    {
      const { osName: e2, osVersion: t3 } = ue();
      "ios" === e2 && function(e3) {
        if (!e3 || "string" != typeof e3)
          return 0;
        const t4 = e3.match(/^(\d+)./);
        return t4 && t4[1] ? parseInt(t4[1]) : 0;
      }(t3) >= 14 && console.warn("iOS 14及以上版本连接uniCloud本地调试服务需要允许客户端查找并连接到本地网络上的设备（仅开发模式生效，发行模式会连接uniCloud云端服务）");
    }
    const t2 = e.__dev__;
    if (!t2.debugInfo)
      return;
    const { address: n2, servePort: s2 } = t2.debugInfo, { address: r2 } = await async function(e2, t3) {
      let n3;
      for (let s3 = 0; s3 < e2.length; s3++) {
        const r3 = e2[s3];
        if (await xs(r3, t3)) {
          n3 = r3;
          break;
        }
      }
      return { address: n3, port: t3 };
    }(n2, s2);
    if (r2)
      return t2.localAddress = r2, void (t2.localPort = s2);
    const i2 = console["error"];
    let o2 = "";
    if ("remote" === t2.debugInfo.initialLaunchType ? (t2.debugInfo.forceRemote = true, o2 = "当前客户端和HBuilderX不在同一局域网下（或其他网络原因无法连接HBuilderX），uniCloud本地调试服务不对当前客户端生效。\n- 如果不使用uniCloud本地调试服务，请直接忽略此信息。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。") : o2 = "无法连接uniCloud本地调试服务，请检查当前客户端是否与主机在同一局域网下。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。", o2 += "\n- 如果在HBuilderX开启的状态下切换过网络环境，请重启HBuilderX后再试\n- 检查系统防火墙是否拦截了HBuilderX自带的nodejs\n- 检查是否错误的使用拦截器修改uni.request方法的参数", 0 === P.indexOf("mp-") && (o2 += "\n- 小程序中如何使用uniCloud，请参考：https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"), !t2.debugInfo.forceRemote)
      throw new Error(o2);
    i2(o2);
  }
  function Us(e) {
    e._initPromiseHub || (e._initPromiseHub = new I({ createPromise: function() {
      let t2 = Promise.resolve();
      var n2;
      n2 = 1, t2 = new Promise((e2) => {
        setTimeout(() => {
          e2();
        }, n2);
      });
      const s2 = e.auth();
      return t2.then(() => s2.getLoginState()).then((e2) => e2 ? Promise.resolve() : s2.signInAnonymously());
    } }));
  }
  const Ls = { tcb: St, tencent: St, aliyun: me, private: kt };
  let Ns = new class {
    init(e) {
      let t2 = {};
      const n2 = Ls[e.provider];
      if (!n2)
        throw new Error("未提供正确的provider参数");
      t2 = n2.init(e), function(e2) {
        const t3 = {};
        e2.__dev__ = t3, t3.debugLog = "app" === P;
        const n3 = A;
        n3 && !n3.code && (t3.debugInfo = n3);
        const s2 = new I({ createPromise: function() {
          return Rs(e2);
        } });
        t3.initLocalNetwork = function() {
          return s2.exec();
        };
      }(t2), Us(t2), Rn(t2), function(e2) {
        const t3 = e2.uploadFile;
        e2.uploadFile = function(e3) {
          return t3.call(this, e3);
        };
      }(t2), function(e2) {
        e2.database = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e2.init(t3).database();
          if (this._database)
            return this._database;
          const n3 = $n(Wn, { uniClient: e2 });
          return this._database = n3, n3;
        }, e2.databaseForJQL = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e2.init(t3).databaseForJQL();
          if (this._databaseForJQL)
            return this._databaseForJQL;
          const n3 = $n(Wn, { uniClient: e2, isJQL: true });
          return this._databaseForJQL = n3, n3;
        };
      }(t2), function(e2) {
        e2.getCurrentUserInfo = ws, e2.chooseAndUploadFile = Is.initChooseAndUploadFile(e2), Object.assign(e2, { get mixinDatacom() {
          return bs(e2);
        } }), e2.SSEChannel = Os, e2.initSecureNetworkByWeixin = As(e2), e2.importObject = ks(e2);
      }(t2);
      return ["callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "chooseAndUploadFile"].forEach((e2) => {
        if (!t2[e2])
          return;
        const n3 = t2[e2];
        t2[e2] = function() {
          return n3.apply(t2, Array.from(arguments));
        }, t2[e2] = function(e3, t3) {
          return function(n4) {
            let s2 = false;
            if ("callFunction" === t3) {
              const e4 = n4 && n4.type || u;
              s2 = e4 !== u;
            }
            const r2 = "callFunction" === t3 && !s2, i2 = this._initPromiseHub.exec();
            n4 = n4 || {};
            const { success: o2, fail: a2, complete: c2 } = te(n4), h2 = i2.then(() => s2 ? Promise.resolve() : q(M(t3, "invoke"), n4)).then(() => e3.call(this, n4)).then((e4) => s2 ? Promise.resolve(e4) : q(M(t3, "success"), e4).then(() => q(M(t3, "complete"), e4)).then(() => (r2 && Y(B, { type: J, content: e4 }), Promise.resolve(e4))), (e4) => s2 ? Promise.reject(e4) : q(M(t3, "fail"), e4).then(() => q(M(t3, "complete"), e4)).then(() => (Y(B, { type: J, content: e4 }), Promise.reject(e4))));
            if (!(o2 || a2 || c2))
              return h2;
            h2.then((e4) => {
              o2 && o2(e4), c2 && c2(e4), r2 && Y(B, { type: J, content: e4 });
            }, (e4) => {
              a2 && a2(e4), c2 && c2(e4), r2 && Y(B, { type: J, content: e4 });
            });
          };
        }(t2[e2], e2).bind(t2);
      }), t2.init = this.init, t2;
    }
  }();
  (() => {
    const e = E;
    let t2 = {};
    if (e && 1 === e.length)
      t2 = e[0], Ns = Ns.init(t2), Ns._isDefault = true;
    else {
      const t3 = ["auth", "callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "database", "getCurrentUSerInfo", "importObject"];
      let n2;
      n2 = e && e.length > 0 ? "应用有多个服务空间，请通过uniCloud.init方法指定要使用的服务空间" : "应用未关联服务空间，请在uniCloud目录右键关联服务空间", t3.forEach((e2) => {
        Ns[e2] = function() {
          return console.error(n2), Promise.reject(new ne({ code: "SYS_ERR", message: n2 }));
        };
      });
    }
    Object.assign(Ns, { get mixinDatacom() {
      return bs(Ns);
    } }), gs(Ns), Ns.addInterceptor = D, Ns.removeInterceptor = F, Ns.interceptObject = K;
  })();
  var Ds = Ns;
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$2 = {
    name: "uni-data-select",
    mixins: [Ds.mixinDatacom || {}],
    props: {
      localdata: {
        type: Array,
        default() {
          return [];
        }
      },
      value: {
        type: [String, Number],
        default: ""
      },
      modelValue: {
        type: [String, Number],
        default: ""
      },
      label: {
        type: String,
        default: ""
      },
      placeholder: {
        type: String,
        default: "请选择"
      },
      emptyTips: {
        type: String,
        default: "无选项"
      },
      clear: {
        type: Boolean,
        default: true
      },
      defItem: {
        type: Number,
        default: 0
      },
      disabled: {
        type: Boolean,
        default: false
      },
      // 格式化输出 用法 field="_id as value, version as text, uni_platform as label" format="{label} - {text}"
      format: {
        type: String,
        default: ""
      },
      placement: {
        type: String,
        default: "bottom"
      }
    },
    data() {
      return {
        showSelector: false,
        current: "",
        mixinDatacomResData: [],
        apps: [],
        channels: [],
        cacheKey: "uni-data-select-lastSelectedValue"
      };
    },
    created() {
      this.debounceGet = this.debounce(() => {
        this.query();
      }, 300);
      if (this.collection && !this.localdata.length) {
        this.debounceGet();
      }
    },
    computed: {
      typePlaceholder() {
        const text = {
          "opendb-stat-app-versions": "版本",
          "opendb-app-channels": "渠道",
          "opendb-app-list": "应用"
        };
        const common = this.placeholder;
        const placeholder = text[this.collection];
        return placeholder ? common + placeholder : common;
      },
      valueCom() {
        return this.modelValue;
      },
      textShow() {
        let text = this.current;
        if (text.length > 10) {
          return text.slice(0, 25) + "...";
        }
        return text;
      },
      getOffsetByPlacement() {
        switch (this.placement) {
          case "top":
            return "bottom:calc(100% + 12px);";
          case "bottom":
            return "top:calc(100% + 12px);";
        }
      }
    },
    watch: {
      localdata: {
        immediate: true,
        handler(val, old) {
          if (Array.isArray(val) && old !== val) {
            this.mixinDatacomResData = val;
          }
        }
      },
      valueCom(val, old) {
        this.initDefVal();
      },
      mixinDatacomResData: {
        immediate: true,
        handler(val) {
          if (val.length) {
            this.initDefVal();
          }
        }
      }
    },
    methods: {
      debounce(fn, time = 100) {
        let timer = null;
        return function(...args) {
          if (timer)
            clearTimeout(timer);
          timer = setTimeout(() => {
            fn.apply(this, args);
          }, time);
        };
      },
      // 执行数据库查询
      query() {
        this.mixinDatacomEasyGet();
      },
      // 监听查询条件变更事件
      onMixinDatacomPropsChange() {
        if (this.collection) {
          this.debounceGet();
        }
      },
      initDefVal() {
        let defValue = "";
        if ((this.valueCom || this.valueCom === 0) && !this.isDisabled(this.valueCom)) {
          defValue = this.valueCom;
        } else {
          let strogeValue;
          if (this.collection) {
            strogeValue = this.getCache();
          }
          if (strogeValue || strogeValue === 0) {
            defValue = strogeValue;
          } else {
            let defItem = "";
            if (this.defItem > 0 && this.defItem <= this.mixinDatacomResData.length) {
              defItem = this.mixinDatacomResData[this.defItem - 1].value;
            }
            defValue = defItem;
          }
          if (defValue || defValue === 0) {
            this.emit(defValue);
          }
        }
        const def = this.mixinDatacomResData.find((item) => item.value === defValue);
        this.current = def ? this.formatItemName(def) : "";
      },
      /**
       * @param {[String, Number]} value
       * 判断用户给的 value 是否同时为禁用状态
       */
      isDisabled(value) {
        let isDisabled = false;
        this.mixinDatacomResData.forEach((item) => {
          if (item.value === value) {
            isDisabled = item.disable;
          }
        });
        return isDisabled;
      },
      clearVal() {
        this.emit("");
        if (this.collection) {
          this.removeCache();
        }
      },
      change(item) {
        if (!item.disable) {
          this.showSelector = false;
          this.current = this.formatItemName(item);
          this.emit(item.value);
        }
      },
      emit(val) {
        this.$emit("input", val);
        this.$emit("update:modelValue", val);
        this.$emit("change", val);
        if (this.collection) {
          this.setCache(val);
        }
      },
      toggleSelector() {
        if (this.disabled) {
          return;
        }
        this.showSelector = !this.showSelector;
      },
      formatItemName(item) {
        let {
          text,
          value,
          channel_code
        } = item;
        channel_code = channel_code ? `(${channel_code})` : "";
        if (this.format) {
          let str = "";
          str = this.format;
          for (let key in item) {
            str = str.replace(new RegExp(`{${key}}`, "g"), item[key]);
          }
          return str;
        } else {
          return this.collection.indexOf("app-list") > 0 ? `${text}(${value})` : text ? text : `未命名${channel_code}`;
        }
      },
      // 获取当前加载的数据
      getLoadData() {
        return this.mixinDatacomResData;
      },
      // 获取当前缓存key
      getCurrentCacheKey() {
        return this.collection;
      },
      // 获取缓存
      getCache(name = this.getCurrentCacheKey()) {
        let cacheData = uni.getStorageSync(this.cacheKey) || {};
        return cacheData[name];
      },
      // 设置缓存
      setCache(value, name = this.getCurrentCacheKey()) {
        let cacheData = uni.getStorageSync(this.cacheKey) || {};
        cacheData[name] = value;
        uni.setStorageSync(this.cacheKey, cacheData);
      },
      // 删除缓存
      removeCache(name = this.getCurrentCacheKey()) {
        let cacheData = uni.getStorageSync(this.cacheKey) || {};
        delete cacheData[name];
        uni.setStorageSync(this.cacheKey, cacheData);
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = vue.resolveComponent("uni-icons");
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-stat__select" }, [
      $props.label ? (vue.openBlock(), vue.createElementBlock(
        "span",
        {
          key: 0,
          class: "uni-label-text hide-on-phone"
        },
        vue.toDisplayString($props.label + "："),
        1
        /* TEXT */
      )) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["uni-stat-box", { "uni-stat__actived": $data.current }])
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["uni-select", { "uni-select--disabled": $props.disabled }])
            },
            [
              vue.createElementVNode("view", {
                class: "uni-select__input-box",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.toggleSelector && $options.toggleSelector(...args))
              }, [
                $data.current ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "uni-select__input-text"
                  },
                  vue.toDisplayString($options.textShow),
                  1
                  /* TEXT */
                )) : (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 1,
                    class: "uni-select__input-text uni-select__input-placeholder"
                  },
                  vue.toDisplayString($options.typePlaceholder),
                  1
                  /* TEXT */
                )),
                $data.current && $props.clear && !$props.disabled ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 2,
                  onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.clearVal && $options.clearVal(...args), ["stop"]))
                }, [
                  vue.createVNode(_component_uni_icons, {
                    type: "clear",
                    color: "#c0c4cc",
                    size: "24"
                  })
                ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 3 }, [
                  vue.createVNode(_component_uni_icons, {
                    type: $data.showSelector ? "top" : "bottom",
                    size: "14",
                    color: "#999"
                  }, null, 8, ["type"])
                ]))
              ]),
              $data.showSelector ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uni-select--mask",
                onClick: _cache[2] || (_cache[2] = (...args) => $options.toggleSelector && $options.toggleSelector(...args))
              })) : vue.createCommentVNode("v-if", true),
              $data.showSelector ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 1,
                  class: "uni-select__selector",
                  style: vue.normalizeStyle($options.getOffsetByPlacement)
                },
                [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass($props.placement == "bottom" ? "uni-popper__arrow_bottom" : "uni-popper__arrow_top")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  vue.createElementVNode("scroll-view", {
                    "scroll-y": "true",
                    class: "uni-select__selector-scroll"
                  }, [
                    $data.mixinDatacomResData.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "uni-select__selector-empty"
                    }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString($props.emptyTips),
                        1
                        /* TEXT */
                      )
                    ])) : (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      { key: 1 },
                      vue.renderList($data.mixinDatacomResData, (item, index) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: "uni-select__selector-item",
                          key: index,
                          onClick: ($event) => $options.change(item)
                        }, [
                          vue.createElementVNode(
                            "text",
                            {
                              class: vue.normalizeClass({ "uni-select__selector__disabled": item.disable })
                            },
                            vue.toDisplayString($options.formatItemName(item)),
                            3
                            /* TEXT, CLASS */
                          )
                        ], 8, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ],
                4
                /* STYLE */
              )) : vue.createCommentVNode("v-if", true)
            ],
            2
            /* CLASS */
          )
        ],
        2
        /* CLASS */
      )
    ]);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-ddf9e0a2"], ["__file", "/Users/joy.cheng/Downloads/mrbs-display/uni_modules/uni-data-select/components/uni-data-select/uni-data-select.vue"]]);
  const HOST = "http://172.16.89.91";
  const _sfc_main$1 = {
    interval: null,
    name: "App",
    data() {
      return {
        lineStartTime: 8,
        lineEndTime: 21,
        spanList: [],
        timelineInterval: 30 * 60,
        // 会议安排时间线的最小单位30分钟
        timelineColorList: [],
        syncData: {},
        foundNextEntry: {},
        showSetting: false,
        _roomId: 2,
        roomId: 2,
        value: 0,
        isEnglish: false,
        datasource: [{ value: 0, text: "中文", key: "zh" }, { value: 1, text: "English", key: "en" }, { value: 2, text: "한국인", key: "ko" }]
      };
    },
    onLoad() {
      let roomId = uni.getStorageSync("ROOM_ID");
      if (roomId) {
        this.roomId = Number(roomId);
        this._roomId = Number(roomId);
      }
      this.startSync();
    },
    methods: {
      startSync() {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        this.syncRoom();
        this.interval = setInterval(() => {
          this.syncRoom();
        }, 5e3);
      },
      onSetting() {
        this.showSetting = true;
      },
      onSetRoomId() {
        formatAppLog("log", "at pages/index/index.vue:129", "set room", this._roomId);
        if (isNaN(this._roomId)) {
          uni.showToast({
            title: this.$t("message.alert_error_code")
          });
          return;
        }
        this.roomId = this._roomId;
        this.showSetting = false;
        uni.setStorageSync("ROOM_ID", this.roomId);
        this.startSync();
      },
      syncRoom() {
        uni.request({
          url: `${HOST}/web/appapi/api.php?act=sync_room`,
          method: "POST",
          header: {
            "Content-type": "application/x-www-form-urlencoded",
            "Accept-Language": "zh-CN,zh;q=0.9"
            //根据要求来配置
          },
          data: {
            room_id: this.roomId
          },
          success: (res) => {
            let data = res.data.data;
            formatAppLog("log", "at pages/index/index.vue:155", "返回数据", data);
            data.now_ap = data.now_time.slice(-2);
            data.now_time = data.now_time.slice(0, -2);
            if (data.entries) {
              for (let e of data.entries) {
                e.start_end = this.formatTime(e["start_time"]) + "-" + this.formatTime(e["end_time"]);
              }
            }
            if (data.now_entry) {
              data.now_entry.start_end = this.formatTime(data.now_entry["start_time"]) + "-" + this.formatTime(data.now_entry["end_time"]);
            }
            this.initTimeLine(data);
          },
          fail: (e) => {
            formatAppLog("error", "at pages/index/index.vue:171", e);
          }
        });
      },
      initTimeLine(data) {
        let tempTime = this.lineStartTime;
        let spanList = [];
        let isFirst = true;
        while (tempTime <= this.lineEndTime) {
          if (!isFirst) {
            spanList.push({
              text: "·",
              type: 1
            });
          }
          let span = tempTime.toString().padStart(2, "0") + ":00";
          spanList.push({
            text: span,
            type: 0
          });
          isFirst = false;
          tempTime += 1;
        }
        this.spanList = spanList;
        let foundNextEntry = false;
        let entryList = data.entries;
        let nowTime = data.now_timestamp || (/* @__PURE__ */ new Date()).getTime() / 1e3;
        for (let entry of entryList) {
          if (nowTime < entry["start_time"]) {
            foundNextEntry = entry;
            break;
          }
        }
        if (foundNextEntry) {
          this.foundNextEntry = foundNextEntry;
        }
        let todayStart = this.getTimestampOfTodayStart();
        let timelineColorList = [];
        let totalWidth = 750 - 37 - 37;
        let totalSeconds = (this.lineEndTime - this.lineStartTime + 1) * 60 * 60;
        tempTime = this.lineStartTime * 60 * 60 + todayStart;
        let idleStartTime = 0;
        while (tempTime <= (this.lineEndTime + 1) * 60 * 60 + todayStart) {
          let found = false;
          for (let entry of entryList) {
            if (tempTime >= entry["start_time"] && tempTime <= entry["end_time"]) {
              if (idleStartTime != 0) {
                let w2 = (tempTime - idleStartTime) / totalSeconds * totalWidth;
                if (w2 > 0) {
                  if (tempTime > nowTime) {
                    formatAppLog("log", "at pages/index/index.vue:230", "case 1");
                    timelineColorList.push({
                      text: this.hideTimelineText(tempTime - idleStartTime, "可预订"),
                      textColor: "white",
                      bg: "#08D50A",
                      width: (tempTime - idleStartTime) / totalSeconds * totalWidth
                    });
                  } else {
                    formatAppLog("log", "at pages/index/index.vue:238", "case 2");
                    timelineColorList.push({
                      text: "",
                      textColor: "black",
                      bg: "#9A9A9A",
                      width: (tempTime - idleStartTime) / totalSeconds * totalWidth
                    });
                  }
                }
                idleStartTime = 0;
              }
              let text = this.$t("message.booked");
              let bg = "#FF0000";
              let textColor = "white";
              if (nowTime >= entry["start_time"] && nowTime <= entry["end_time"]) {
                text = this.$t("message.small_in_meeting");
                bg = "#FFFF00";
                textColor = "black";
                data.current = entry;
              } else if (nowTime > entry["end_time"]) {
                text = this.$t("message.over_meeting");
                bg = "#585757";
                textColor = "white";
              }
              timelineColorList.push({
                text: this.hideTimelineText(entry["end_time"] - entry["start_time"], text),
                bg,
                name: entry["name"],
                textColor,
                width: (entry["end_time"] - entry["start_time"]) / totalSeconds * totalWidth
              });
              found = true;
              tempTime = entry["end_time"];
              idleStartTime = entry["end_time"];
              break;
            }
          }
          if (!found) {
            if (idleStartTime == 0) {
              idleStartTime = tempTime;
            } else {
              if (idleStartTime < nowTime && tempTime < nowTime && tempTime + this.timelineInterval > nowTime) {
                timelineColorList.push({
                  text: "",
                  textColor: "black",
                  bg: "#9A9A9A",
                  width: (tempTime - idleStartTime) / totalSeconds * totalWidth
                });
                idleStartTime = tempTime;
              }
            }
            tempTime += this.timelineInterval;
          } else {
            entryList.shift();
          }
        }
        if (idleStartTime != 0) {
          if (tempTime < nowTime) {
            timelineColorList.push({
              text: "",
              textColor: "black",
              bg: "#9A9A9A",
              width: (tempTime - idleStartTime) / totalSeconds * totalWidth
            });
          } else {
            timelineColorList.push({
              text: this.hideTimelineText(tempTime - idleStartTime - this.timelineInterval, "可预订"),
              bg: "#08D50A",
              textColor: "white",
              width: (tempTime - idleStartTime - this.timelineInterval) / totalSeconds * totalWidth
            });
          }
        }
        formatAppLog("log", "at pages/index/index.vue:317", timelineColorList);
        this.timelineColorList = timelineColorList;
        this.syncData = data;
      },
      getTimestampOfTodayStart() {
        let today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        return today.getTime() / 1e3;
      },
      hideTimelineText(width, text) {
        return width <= this.timelineInterval ? "" : text;
      },
      formatTime(timestamp) {
        var date = new Date(timestamp * 1e3);
        var hours = date.getHours().toString().padStart(2, "0");
        var minutes = date.getMinutes().toString().padStart(2, "0");
        return hours + ":" + minutes;
      },
      changeLang(index) {
        formatAppLog("log", "at pages/index/index.vue:341", "lang index", index);
        formatAppLog("log", "at pages/index/index.vue:342", "lang selected item", this.datasource[index]);
        var lang = this.datasource[index].key;
        if (lang == "en") {
          this.isEnglish = true;
        } else {
          this.isEnglish = false;
        }
        formatAppLog("log", "at pages/index/index.vue:349", "lang selected lang", lang);
        this.$i18n.locale = lang;
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_data_select = resolveEasycom(vue.resolveDynamicComponent("uni-data-select"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "container",
      id: "app"
    }, [
      vue.createElementVNode("image", {
        class: "bg",
        src: "/static/home_bg.png"
      }),
      vue.createElementVNode("view", { class: "container-inner" }, [
        vue.createElementVNode("text", { class: "now-time" }, [
          vue.createTextVNode(
            vue.toDisplayString($data.syncData.now_time) + " ",
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "now-time-tail" },
            vue.toDisplayString($data.syncData.now_ap),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode(
          "text",
          { class: "now-date" },
          vue.toDisplayString($data.syncData.display_day),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "divider-one" }),
        vue.createCommentVNode(` <select v-model="selected" class="language" @change="changeLang">\r
				<option value='en'>English</option>\r
				<option value='zh' selected>中文</option>\r
				<option value='ko'>korean</option>\r
			</select> `),
        vue.createVNode(_component_uni_data_select, {
          style: { "width": "60rpx" },
          class: "select-language",
          modelValue: $data.value,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.value = $event),
          localdata: $data.datasource,
          onChange: $options.changeLang
        }, null, 8, ["modelValue", "localdata", "onChange"]),
        vue.createCommentVNode(' <image class="room-icon-cir" src="/static/room_circle.png"></image> '),
        $data.syncData.room ? (vue.openBlock(), vue.createElementBlock("image", {
          key: 0,
          class: "room-icon",
          src: $data.syncData.room.icon
        }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "text",
          {
            class: "room-tail",
            onLongpress: _cache[1] || (_cache[1] = (...args) => $options.onSetting && $options.onSetting(...args))
          },
          vue.toDisplayString(_ctx.$t("message.meeting")),
          33
          /* TEXT, HYDRATE_EVENTS */
        ),
        $data.syncData && $data.syncData.current ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "content-container"
        }, [
          vue.createElementVNode("view", { class: "room-space" }),
          vue.createElementVNode("view", { class: "room-content-container" }, [
            vue.createElementVNode("text", { class: "room-name" }, [
              vue.createTextVNode(
                vue.toDisplayString(_ctx.$t("message.meeting_theme")) + "：",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { style: { "font-size": "26rpx" } },
                vue.toDisplayString($data.syncData.current.name),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode(
              "text",
              { class: "room-entry-duration" },
              vue.toDisplayString($data.syncData.current.start_end),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "room-booker" },
              vue.toDisplayString(_ctx.$t("message.booker")) + "：" + vue.toDisplayString($data.syncData.current.book_by),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "view",
            { class: "room-status room-status-using" },
            vue.toDisplayString(_ctx.$t("message.in_meeting")),
            1
            /* TEXT */
          )
        ])) : $data.foundNextEntry ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "content-container"
        }, [
          vue.createElementVNode("view", { class: "room-space" }),
          vue.createElementVNode(
            "view",
            { class: "room-status room-status-idle" },
            vue.toDisplayString(_ctx.$t("message.no_meeting")),
            1
            /* TEXT */
          ),
          $data.foundNextEntry && $data.foundNextEntry.name ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "room-content-container"
          }, [
            vue.createElementVNode("text", { class: "room-name" }, [
              vue.createTextVNode(
                vue.toDisplayString(_ctx.$t("message.upcoming_meetings")) + "：",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { style: { "font-size": "26rpx" } },
                vue.toDisplayString($data.foundNextEntry.name),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode(
              "text",
              { class: "room-entry-duration" },
              vue.toDisplayString($data.foundNextEntry.start_end),
              1
              /* TEXT */
            ),
            vue.createCommentVNode(` <text class="room-booker">{{ $t(' hello') }}：{{foundNextEntry.book_by}}</text> `),
            vue.createElementVNode(
              "text",
              { class: "room-booker" },
              vue.toDisplayString(_ctx.$t("message.booker")) + "：" + vue.toDisplayString($data.foundNextEntry.book_by),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "content-container"
        })),
        vue.createElementVNode("view", { class: "divider-two" }),
        vue.createElementVNode("view", { class: "timeline-container" }, [
          vue.createElementVNode("view", { class: "time-span-container" }, [
            vue.createElementVNode("view", { style: { "width": "7rpx" } }),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.spanList, (item, index) => {
                return vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    class: vue.normalizeClass([item.type == 0 ? "time-span-text" : "time-span-dot"]),
                    key: index
                  },
                  vue.toDisplayString(item.text),
                  3
                  /* TEXT, CLASS */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            vue.createElementVNode("view", { style: { "width": "7rpx" } })
          ]),
          vue.createElementVNode("view", { class: "timeline-line-container" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.timelineColorList, (item, index) => {
                return vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    class: "timeline-line-item",
                    key: index,
                    style: vue.normalizeStyle({ background: item.bg, width: item.width + "rpx", height: "100%", color: item.textColor })
                  },
                  vue.toDisplayString(item.text),
                  5
                  /* TEXT, STYLE */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", {
            class: "timeline-line-container",
            style: { "margin-top": "5rpx" }
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.timelineColorList, (item, index) => {
                return vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    class: "timeline-line-entry",
                    style: vue.normalizeStyle({ width: item.width + "rpx", height: "100%" }),
                    key: index
                  },
                  [
                    vue.createElementVNode(
                      "text",
                      { class: "timeline-line-item tl-item-ec" },
                      vue.toDisplayString(item.name),
                      1
                      /* TEXT */
                    )
                  ],
                  4
                  /* STYLE */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "logo-container" }, [
            vue.createElementVNode("image", {
              class: "logo",
              src: "/static/logo.png"
            })
          ])
        ])
      ]),
      $data.showSetting ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "popup-setting"
      }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "popup-input",
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data._roomId = $event),
            placeholder: '{{$t("message.alert_code")}}'
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data._roomId]
        ]),
        vue.createElementVNode(
          "view",
          {
            class: "popup-sure",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.onSetRoomId && $options.onSetRoomId(...args))
          },
          vue.toDisplayString(_ctx.$t("message.sure")),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "/Users/joy.cheng/Downloads/mrbs-display/pages/index/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
      plus.screen.lockOrientation("landscape-primary");
      plus.navigator.setFullscreen(true);
      var ac = plus.android.runtimeMainActivity();
      var win = plus.android.invoke(ac, "getWindow");
      plus.android.invoke(win, "setNavigationBarColor", 0);
      var dv = plus.android.invoke(win, "getDecorView");
      plus.android.invoke(dv, "setSystemUiVisibility", 256 | 1024 | 512);
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:24", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:27", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/joy.cheng/Downloads/mrbs-display/App.vue"]]);
  /*!
    * @intlify/shared v9.1.9
    * (c) 2021 kazuya kawaguchi
    * Released under the MIT License.
    */
  const inBrowser = typeof window !== "undefined";
  let mark;
  let measure;
  {
    const perf = inBrowser && window.performance;
    if (perf && perf.mark && perf.measure && perf.clearMarks && perf.clearMeasures) {
      mark = (tag) => perf.mark(tag);
      measure = (name, startTag, endTag) => {
        perf.measure(name, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
      };
    }
  }
  const RE_ARGS = /\{([0-9a-zA-Z]+)\}/g;
  function format(message, ...args) {
    if (args.length === 1 && isObject$1(args[0])) {
      args = args[0];
    }
    if (!args || !args.hasOwnProperty) {
      args = {};
    }
    return message.replace(RE_ARGS, (match, identifier) => {
      return args.hasOwnProperty(identifier) ? args[identifier] : "";
    });
  }
  const hasSymbol = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol";
  const makeSymbol = (name) => hasSymbol ? Symbol(name) : name;
  const generateFormatCacheKey = (locale, key, source) => friendlyJSONstringify({ l: locale, k: key, s: source });
  const friendlyJSONstringify = (json) => JSON.stringify(json).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/\u0027/g, "\\u0027");
  const isNumber = (val) => typeof val === "number" && isFinite(val);
  const isDate = (val) => toTypeString(val) === "[object Date]";
  const isRegExp = (val) => toTypeString(val) === "[object RegExp]";
  const isEmptyObject = (val) => isPlainObject(val) && Object.keys(val).length === 0;
  function warn(msg, err) {
    if (typeof console !== "undefined") {
      console.warn(`[intlify] ` + msg);
      if (err) {
        console.warn(err.stack);
      }
    }
  }
  const assign = Object.assign;
  let _globalThis;
  const getGlobalThis = () => {
    return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
  };
  function escapeHtml(rawText) {
    return rawText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  function hasOwn$1(obj, key) {
    return hasOwnProperty$1.call(obj, key);
  }
  const isArray = Array.isArray;
  const isFunction = (val) => typeof val === "function";
  const isString = (val) => typeof val === "string";
  const isBoolean = (val) => typeof val === "boolean";
  const isObject$1 = (val) => (
    // eslint-disable-line
    val !== null && typeof val === "object"
  );
  const objectToString = Object.prototype.toString;
  const toTypeString = (value) => objectToString.call(value);
  const isPlainObject = (val) => toTypeString(val) === "[object Object]";
  const toDisplayString = (val) => {
    return val == null ? "" : isArray(val) || isPlainObject(val) && val.toString === objectToString ? JSON.stringify(val, null, 2) : String(val);
  };
  const RANGE = 2;
  function generateCodeFrame(source, start = 0, end = source.length) {
    const lines = source.split(/\r?\n/);
    let count = 0;
    const res = [];
    for (let i2 = 0; i2 < lines.length; i2++) {
      count += lines[i2].length + 1;
      if (count >= start) {
        for (let j2 = i2 - RANGE; j2 <= i2 + RANGE || end > count; j2++) {
          if (j2 < 0 || j2 >= lines.length)
            continue;
          const line = j2 + 1;
          res.push(`${line}${" ".repeat(3 - String(line).length)}|  ${lines[j2]}`);
          const lineLength = lines[j2].length;
          if (j2 === i2) {
            const pad = start - (count - lineLength) + 1;
            const length = Math.max(1, end > count ? lineLength - pad : end - start);
            res.push(`   |  ` + " ".repeat(pad) + "^".repeat(length));
          } else if (j2 > i2) {
            if (end > count) {
              const length = Math.max(Math.min(end - count, lineLength), 1);
              res.push(`   |  ` + "^".repeat(length));
            }
            count += lineLength + 1;
          }
        }
        break;
      }
    }
    return res.join("\n");
  }
  function createEmitter() {
    const events = /* @__PURE__ */ new Map();
    const emitter = {
      events,
      on(event, handler) {
        const handlers = events.get(event);
        const added = handlers && handlers.push(handler);
        if (!added) {
          events.set(event, [handler]);
        }
      },
      off(event, handler) {
        const handlers = events.get(event);
        if (handlers) {
          handlers.splice(handlers.indexOf(handler) >>> 0, 1);
        }
      },
      emit(event, payload) {
        (events.get(event) || []).slice().map((handler) => handler(payload));
        (events.get("*") || []).slice().map((handler) => handler(event, payload));
      }
    };
    return emitter;
  }
  /*!
    * @intlify/message-resolver v9.1.9
    * (c) 2021 kazuya kawaguchi
    * Released under the MIT License.
    */
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
  }
  const isObject = (val) => (
    // eslint-disable-line
    val !== null && typeof val === "object"
  );
  const pathStateMachine = [];
  pathStateMachine[
    0
    /* BEFORE_PATH */
  ] = {
    [
      "w"
      /* WORKSPACE */
    ]: [
      0
      /* BEFORE_PATH */
    ],
    [
      "i"
      /* IDENT */
    ]: [
      3,
      0
      /* APPEND */
    ],
    [
      "["
      /* LEFT_BRACKET */
    ]: [
      4
      /* IN_SUB_PATH */
    ],
    [
      "o"
      /* END_OF_FAIL */
    ]: [
      7
      /* AFTER_PATH */
    ]
  };
  pathStateMachine[
    1
    /* IN_PATH */
  ] = {
    [
      "w"
      /* WORKSPACE */
    ]: [
      1
      /* IN_PATH */
    ],
    [
      "."
      /* DOT */
    ]: [
      2
      /* BEFORE_IDENT */
    ],
    [
      "["
      /* LEFT_BRACKET */
    ]: [
      4
      /* IN_SUB_PATH */
    ],
    [
      "o"
      /* END_OF_FAIL */
    ]: [
      7
      /* AFTER_PATH */
    ]
  };
  pathStateMachine[
    2
    /* BEFORE_IDENT */
  ] = {
    [
      "w"
      /* WORKSPACE */
    ]: [
      2
      /* BEFORE_IDENT */
    ],
    [
      "i"
      /* IDENT */
    ]: [
      3,
      0
      /* APPEND */
    ],
    [
      "0"
      /* ZERO */
    ]: [
      3,
      0
      /* APPEND */
    ]
  };
  pathStateMachine[
    3
    /* IN_IDENT */
  ] = {
    [
      "i"
      /* IDENT */
    ]: [
      3,
      0
      /* APPEND */
    ],
    [
      "0"
      /* ZERO */
    ]: [
      3,
      0
      /* APPEND */
    ],
    [
      "w"
      /* WORKSPACE */
    ]: [
      1,
      1
      /* PUSH */
    ],
    [
      "."
      /* DOT */
    ]: [
      2,
      1
      /* PUSH */
    ],
    [
      "["
      /* LEFT_BRACKET */
    ]: [
      4,
      1
      /* PUSH */
    ],
    [
      "o"
      /* END_OF_FAIL */
    ]: [
      7,
      1
      /* PUSH */
    ]
  };
  pathStateMachine[
    4
    /* IN_SUB_PATH */
  ] = {
    [
      "'"
      /* SINGLE_QUOTE */
    ]: [
      5,
      0
      /* APPEND */
    ],
    [
      '"'
      /* DOUBLE_QUOTE */
    ]: [
      6,
      0
      /* APPEND */
    ],
    [
      "["
      /* LEFT_BRACKET */
    ]: [
      4,
      2
      /* INC_SUB_PATH_DEPTH */
    ],
    [
      "]"
      /* RIGHT_BRACKET */
    ]: [
      1,
      3
      /* PUSH_SUB_PATH */
    ],
    [
      "o"
      /* END_OF_FAIL */
    ]: 8,
    [
      "l"
      /* ELSE */
    ]: [
      4,
      0
      /* APPEND */
    ]
  };
  pathStateMachine[
    5
    /* IN_SINGLE_QUOTE */
  ] = {
    [
      "'"
      /* SINGLE_QUOTE */
    ]: [
      4,
      0
      /* APPEND */
    ],
    [
      "o"
      /* END_OF_FAIL */
    ]: 8,
    [
      "l"
      /* ELSE */
    ]: [
      5,
      0
      /* APPEND */
    ]
  };
  pathStateMachine[
    6
    /* IN_DOUBLE_QUOTE */
  ] = {
    [
      '"'
      /* DOUBLE_QUOTE */
    ]: [
      4,
      0
      /* APPEND */
    ],
    [
      "o"
      /* END_OF_FAIL */
    ]: 8,
    [
      "l"
      /* ELSE */
    ]: [
      6,
      0
      /* APPEND */
    ]
  };
  const literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
  function isLiteral(exp) {
    return literalValueRE.test(exp);
  }
  function stripQuotes(str) {
    const a2 = str.charCodeAt(0);
    const b2 = str.charCodeAt(str.length - 1);
    return a2 === b2 && (a2 === 34 || a2 === 39) ? str.slice(1, -1) : str;
  }
  function getPathCharType(ch) {
    if (ch === void 0 || ch === null) {
      return "o";
    }
    const code = ch.charCodeAt(0);
    switch (code) {
      case 91:
      case 93:
      case 46:
      case 34:
      case 39:
        return ch;
      case 95:
      case 36:
      case 45:
        return "i";
      case 9:
      case 10:
      case 13:
      case 160:
      case 65279:
      case 8232:
      case 8233:
        return "w";
    }
    return "i";
  }
  function formatSubPath(path) {
    const trimmed = path.trim();
    if (path.charAt(0) === "0" && isNaN(parseInt(path))) {
      return false;
    }
    return isLiteral(trimmed) ? stripQuotes(trimmed) : "*" + trimmed;
  }
  function parse(path) {
    const keys = [];
    let index = -1;
    let mode = 0;
    let subPathDepth = 0;
    let c2;
    let key;
    let newChar;
    let type;
    let transition;
    let action;
    let typeMap;
    const actions = [];
    actions[
      0
      /* APPEND */
    ] = () => {
      if (key === void 0) {
        key = newChar;
      } else {
        key += newChar;
      }
    };
    actions[
      1
      /* PUSH */
    ] = () => {
      if (key !== void 0) {
        keys.push(key);
        key = void 0;
      }
    };
    actions[
      2
      /* INC_SUB_PATH_DEPTH */
    ] = () => {
      actions[
        0
        /* APPEND */
      ]();
      subPathDepth++;
    };
    actions[
      3
      /* PUSH_SUB_PATH */
    ] = () => {
      if (subPathDepth > 0) {
        subPathDepth--;
        mode = 4;
        actions[
          0
          /* APPEND */
        ]();
      } else {
        subPathDepth = 0;
        if (key === void 0) {
          return false;
        }
        key = formatSubPath(key);
        if (key === false) {
          return false;
        } else {
          actions[
            1
            /* PUSH */
          ]();
        }
      }
    };
    function maybeUnescapeQuote() {
      const nextChar = path[index + 1];
      if (mode === 5 && nextChar === "'" || mode === 6 && nextChar === '"') {
        index++;
        newChar = "\\" + nextChar;
        actions[
          0
          /* APPEND */
        ]();
        return true;
      }
    }
    while (mode !== null) {
      index++;
      c2 = path[index];
      if (c2 === "\\" && maybeUnescapeQuote()) {
        continue;
      }
      type = getPathCharType(c2);
      typeMap = pathStateMachine[mode];
      transition = typeMap[type] || typeMap[
        "l"
        /* ELSE */
      ] || 8;
      if (transition === 8) {
        return;
      }
      mode = transition[0];
      if (transition[1] !== void 0) {
        action = actions[transition[1]];
        if (action) {
          newChar = c2;
          if (action() === false) {
            return;
          }
        }
      }
      if (mode === 7) {
        return keys;
      }
    }
  }
  const cache = /* @__PURE__ */ new Map();
  function resolveValue(obj, path) {
    if (!isObject(obj)) {
      return null;
    }
    let hit = cache.get(path);
    if (!hit) {
      hit = parse(path);
      if (hit) {
        cache.set(path, hit);
      }
    }
    if (!hit) {
      return null;
    }
    const len = hit.length;
    let last = obj;
    let i2 = 0;
    while (i2 < len) {
      const val = last[hit[i2]];
      if (val === void 0) {
        return null;
      }
      last = val;
      i2++;
    }
    return last;
  }
  function handleFlatJson(obj) {
    if (!isObject(obj)) {
      return obj;
    }
    for (const key in obj) {
      if (!hasOwn(obj, key)) {
        continue;
      }
      if (!key.includes(
        "."
        /* DOT */
      )) {
        if (isObject(obj[key])) {
          handleFlatJson(obj[key]);
        }
      } else {
        const subKeys = key.split(
          "."
          /* DOT */
        );
        const lastIndex = subKeys.length - 1;
        let currentObj = obj;
        for (let i2 = 0; i2 < lastIndex; i2++) {
          if (!(subKeys[i2] in currentObj)) {
            currentObj[subKeys[i2]] = {};
          }
          currentObj = currentObj[subKeys[i2]];
        }
        currentObj[subKeys[lastIndex]] = obj[key];
        delete obj[key];
        if (isObject(currentObj[subKeys[lastIndex]])) {
          handleFlatJson(currentObj[subKeys[lastIndex]]);
        }
      }
    }
    return obj;
  }
  /*!
    * @intlify/runtime v9.1.9
    * (c) 2021 kazuya kawaguchi
    * Released under the MIT License.
    */
  const DEFAULT_MODIFIER = (str) => str;
  const DEFAULT_MESSAGE = (ctx) => "";
  const DEFAULT_MESSAGE_DATA_TYPE = "text";
  const DEFAULT_NORMALIZE = (values) => values.length === 0 ? "" : values.join("");
  const DEFAULT_INTERPOLATE = toDisplayString;
  function pluralDefault(choice, choicesLength) {
    choice = Math.abs(choice);
    if (choicesLength === 2) {
      return choice ? choice > 1 ? 1 : 0 : 1;
    }
    return choice ? Math.min(choice, 2) : 0;
  }
  function getPluralIndex(options) {
    const index = isNumber(options.pluralIndex) ? options.pluralIndex : -1;
    return options.named && (isNumber(options.named.count) || isNumber(options.named.n)) ? isNumber(options.named.count) ? options.named.count : isNumber(options.named.n) ? options.named.n : index : index;
  }
  function normalizeNamed(pluralIndex, props) {
    if (!props.count) {
      props.count = pluralIndex;
    }
    if (!props.n) {
      props.n = pluralIndex;
    }
  }
  function createMessageContext(options = {}) {
    const locale = options.locale;
    const pluralIndex = getPluralIndex(options);
    const pluralRule = isObject$1(options.pluralRules) && isString(locale) && isFunction(options.pluralRules[locale]) ? options.pluralRules[locale] : pluralDefault;
    const orgPluralRule = isObject$1(options.pluralRules) && isString(locale) && isFunction(options.pluralRules[locale]) ? pluralDefault : void 0;
    const plural = (messages2) => messages2[pluralRule(pluralIndex, messages2.length, orgPluralRule)];
    const _list = options.list || [];
    const list = (index) => _list[index];
    const _named = options.named || {};
    isNumber(options.pluralIndex) && normalizeNamed(pluralIndex, _named);
    const named = (key) => _named[key];
    function message(key) {
      const msg = isFunction(options.messages) ? options.messages(key) : isObject$1(options.messages) ? options.messages[key] : false;
      return !msg ? options.parent ? options.parent.message(key) : DEFAULT_MESSAGE : msg;
    }
    const _modifier = (name) => options.modifiers ? options.modifiers[name] : DEFAULT_MODIFIER;
    const normalize = isPlainObject(options.processor) && isFunction(options.processor.normalize) ? options.processor.normalize : DEFAULT_NORMALIZE;
    const interpolate = isPlainObject(options.processor) && isFunction(options.processor.interpolate) ? options.processor.interpolate : DEFAULT_INTERPOLATE;
    const type = isPlainObject(options.processor) && isString(options.processor.type) ? options.processor.type : DEFAULT_MESSAGE_DATA_TYPE;
    const ctx = {
      [
        "list"
        /* LIST */
      ]: list,
      [
        "named"
        /* NAMED */
      ]: named,
      [
        "plural"
        /* PLURAL */
      ]: plural,
      [
        "linked"
        /* LINKED */
      ]: (key, modifier) => {
        const msg = message(key)(ctx);
        return isString(modifier) ? _modifier(modifier)(msg) : msg;
      },
      [
        "message"
        /* MESSAGE */
      ]: message,
      [
        "type"
        /* TYPE */
      ]: type,
      [
        "interpolate"
        /* INTERPOLATE */
      ]: interpolate,
      [
        "normalize"
        /* NORMALIZE */
      ]: normalize
    };
    return ctx;
  }
  /*!
    * @intlify/message-compiler v9.1.9
    * (c) 2021 kazuya kawaguchi
    * Released under the MIT License.
    */
  const errorMessages$2 = {
    // tokenizer error messages
    [
      0
      /* EXPECTED_TOKEN */
    ]: `Expected token: '{0}'`,
    [
      1
      /* INVALID_TOKEN_IN_PLACEHOLDER */
    ]: `Invalid token in placeholder: '{0}'`,
    [
      2
      /* UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER */
    ]: `Unterminated single quote in placeholder`,
    [
      3
      /* UNKNOWN_ESCAPE_SEQUENCE */
    ]: `Unknown escape sequence: \\{0}`,
    [
      4
      /* INVALID_UNICODE_ESCAPE_SEQUENCE */
    ]: `Invalid unicode escape sequence: {0}`,
    [
      5
      /* UNBALANCED_CLOSING_BRACE */
    ]: `Unbalanced closing brace`,
    [
      6
      /* UNTERMINATED_CLOSING_BRACE */
    ]: `Unterminated closing brace`,
    [
      7
      /* EMPTY_PLACEHOLDER */
    ]: `Empty placeholder`,
    [
      8
      /* NOT_ALLOW_NEST_PLACEHOLDER */
    ]: `Not allowed nest placeholder`,
    [
      9
      /* INVALID_LINKED_FORMAT */
    ]: `Invalid linked format`,
    // parser error messages
    [
      10
      /* MUST_HAVE_MESSAGES_IN_PLURAL */
    ]: `Plural must have messages`,
    [
      11
      /* UNEXPECTED_EMPTY_LINKED_MODIFIER */
    ]: `Unexpected empty linked modifier`,
    [
      12
      /* UNEXPECTED_EMPTY_LINKED_KEY */
    ]: `Unexpected empty linked key`,
    [
      13
      /* UNEXPECTED_LEXICAL_ANALYSIS */
    ]: `Unexpected lexical analysis in token: '{0}'`
  };
  function createCompileError(code, loc, options = {}) {
    const { domain, messages: messages2, args } = options;
    const msg = format((messages2 || errorMessages$2)[code] || "", ...args || []);
    const error = new SyntaxError(String(msg));
    error.code = code;
    if (loc) {
      error.location = loc;
    }
    error.domain = domain;
    return error;
  }
  /*!
    * @intlify/devtools-if v9.1.9
    * (c) 2021 kazuya kawaguchi
    * Released under the MIT License.
    */
  const IntlifyDevToolsHooks = {
    I18nInit: "i18n:init",
    FunctionTranslate: "function:translate"
  };
  /*!
    * @intlify/core-base v9.1.9
    * (c) 2021 kazuya kawaguchi
    * Released under the MIT License.
    */
  let devtools = null;
  function setDevToolsHook(hook) {
    devtools = hook;
  }
  function initI18nDevTools(i18n2, version, meta) {
    devtools && devtools.emit(IntlifyDevToolsHooks.I18nInit, {
      timestamp: Date.now(),
      i18n: i18n2,
      version,
      meta
    });
  }
  const translateDevTools = /* @__PURE__ */ createDevToolsHook(IntlifyDevToolsHooks.FunctionTranslate);
  function createDevToolsHook(hook) {
    return (payloads) => devtools && devtools.emit(hook, payloads);
  }
  const warnMessages$1 = {
    [
      0
      /* NOT_FOUND_KEY */
    ]: `Not found '{key}' key in '{locale}' locale messages.`,
    [
      1
      /* FALLBACK_TO_TRANSLATE */
    ]: `Fall back to translate '{key}' key with '{target}' locale.`,
    [
      2
      /* CANNOT_FORMAT_NUMBER */
    ]: `Cannot format a number value due to not supported Intl.NumberFormat.`,
    [
      3
      /* FALLBACK_TO_NUMBER_FORMAT */
    ]: `Fall back to number format '{key}' key with '{target}' locale.`,
    [
      4
      /* CANNOT_FORMAT_DATE */
    ]: `Cannot format a date value due to not supported Intl.DateTimeFormat.`,
    [
      5
      /* FALLBACK_TO_DATE_FORMAT */
    ]: `Fall back to datetime format '{key}' key with '{target}' locale.`
  };
  function getWarnMessage$1(code, ...args) {
    return format(warnMessages$1[code], ...args);
  }
  const VERSION$1 = "9.1.9";
  const NOT_REOSLVED = -1;
  const MISSING_RESOLVE_VALUE = "";
  function getDefaultLinkedModifiers() {
    return {
      upper: (val) => isString(val) ? val.toUpperCase() : val,
      lower: (val) => isString(val) ? val.toLowerCase() : val,
      // prettier-ignore
      capitalize: (val) => isString(val) ? `${val.charAt(0).toLocaleUpperCase()}${val.substr(1)}` : val
    };
  }
  let _compiler;
  let _additionalMeta = null;
  const setAdditionalMeta = (meta) => {
    _additionalMeta = meta;
  };
  const getAdditionalMeta = () => _additionalMeta;
  let _cid = 0;
  function createCoreContext(options = {}) {
    const version = isString(options.version) ? options.version : VERSION$1;
    const locale = isString(options.locale) ? options.locale : "en-US";
    const fallbackLocale = isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || isString(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : locale;
    const messages2 = isPlainObject(options.messages) ? options.messages : { [locale]: {} };
    const datetimeFormats = isPlainObject(options.datetimeFormats) ? options.datetimeFormats : { [locale]: {} };
    const numberFormats = isPlainObject(options.numberFormats) ? options.numberFormats : { [locale]: {} };
    const modifiers = assign({}, options.modifiers || {}, getDefaultLinkedModifiers());
    const pluralRules = options.pluralRules || {};
    const missing = isFunction(options.missing) ? options.missing : null;
    const missingWarn = isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
    const fallbackWarn = isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
    const fallbackFormat = !!options.fallbackFormat;
    const unresolving = !!options.unresolving;
    const postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
    const processor = isPlainObject(options.processor) ? options.processor : null;
    const warnHtmlMessage = isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
    const escapeParameter = !!options.escapeParameter;
    const messageCompiler = isFunction(options.messageCompiler) ? options.messageCompiler : _compiler;
    const onWarn = isFunction(options.onWarn) ? options.onWarn : warn;
    const internalOptions = options;
    const __datetimeFormatters = isObject$1(internalOptions.__datetimeFormatters) ? internalOptions.__datetimeFormatters : /* @__PURE__ */ new Map();
    const __numberFormatters = isObject$1(internalOptions.__numberFormatters) ? internalOptions.__numberFormatters : /* @__PURE__ */ new Map();
    const __meta = isObject$1(internalOptions.__meta) ? internalOptions.__meta : {};
    _cid++;
    const context = {
      version,
      cid: _cid,
      locale,
      fallbackLocale,
      messages: messages2,
      datetimeFormats,
      numberFormats,
      modifiers,
      pluralRules,
      missing,
      missingWarn,
      fallbackWarn,
      fallbackFormat,
      unresolving,
      postTranslation,
      processor,
      warnHtmlMessage,
      escapeParameter,
      messageCompiler,
      onWarn,
      __datetimeFormatters,
      __numberFormatters,
      __meta
    };
    {
      context.__v_emitter = internalOptions.__v_emitter != null ? internalOptions.__v_emitter : void 0;
    }
    {
      initI18nDevTools(context, version, __meta);
    }
    return context;
  }
  function isTranslateFallbackWarn(fallback, key) {
    return fallback instanceof RegExp ? fallback.test(key) : fallback;
  }
  function isTranslateMissingWarn(missing, key) {
    return missing instanceof RegExp ? missing.test(key) : missing;
  }
  function handleMissing(context, key, locale, missingWarn, type) {
    const { missing, onWarn } = context;
    {
      const emitter = context.__v_emitter;
      if (emitter) {
        emitter.emit("missing", {
          locale,
          key,
          type,
          groupId: `${type}:${key}`
        });
      }
    }
    if (missing !== null) {
      const ret = missing(context, locale, key, type);
      return isString(ret) ? ret : key;
    } else {
      if (isTranslateMissingWarn(missingWarn, key)) {
        onWarn(getWarnMessage$1(0, { key, locale }));
      }
      return key;
    }
  }
  function getLocaleChain(ctx, fallback, start) {
    const context = ctx;
    if (!context.__localeChainCache) {
      context.__localeChainCache = /* @__PURE__ */ new Map();
    }
    let chain = context.__localeChainCache.get(start);
    if (!chain) {
      chain = [];
      let block = [start];
      while (isArray(block)) {
        block = appendBlockToChain(chain, block, fallback);
      }
      const defaults = isArray(fallback) ? fallback : isPlainObject(fallback) ? fallback["default"] ? fallback["default"] : null : fallback;
      block = isString(defaults) ? [defaults] : defaults;
      if (isArray(block)) {
        appendBlockToChain(chain, block, false);
      }
      context.__localeChainCache.set(start, chain);
    }
    return chain;
  }
  function appendBlockToChain(chain, block, blocks) {
    let follow = true;
    for (let i2 = 0; i2 < block.length && isBoolean(follow); i2++) {
      const locale = block[i2];
      if (isString(locale)) {
        follow = appendLocaleToChain(chain, block[i2], blocks);
      }
    }
    return follow;
  }
  function appendLocaleToChain(chain, locale, blocks) {
    let follow;
    const tokens = locale.split("-");
    do {
      const target = tokens.join("-");
      follow = appendItemToChain(chain, target, blocks);
      tokens.splice(-1, 1);
    } while (tokens.length && follow === true);
    return follow;
  }
  function appendItemToChain(chain, target, blocks) {
    let follow = false;
    if (!chain.includes(target)) {
      follow = true;
      if (target) {
        follow = target[target.length - 1] !== "!";
        const locale = target.replace(/!/g, "");
        chain.push(locale);
        if ((isArray(blocks) || isPlainObject(blocks)) && blocks[locale]) {
          follow = blocks[locale];
        }
      }
    }
    return follow;
  }
  function updateFallbackLocale(ctx, locale, fallback) {
    const context = ctx;
    context.__localeChainCache = /* @__PURE__ */ new Map();
    getLocaleChain(ctx, fallback, locale);
  }
  function createCoreError(code) {
    return createCompileError(code, null, { messages: errorMessages$1 });
  }
  const errorMessages$1 = {
    [
      14
      /* INVALID_ARGUMENT */
    ]: "Invalid arguments",
    [
      15
      /* INVALID_DATE_ARGUMENT */
    ]: "The date provided is an invalid Date object.Make sure your Date represents a valid date.",
    [
      16
      /* INVALID_ISO_DATE_ARGUMENT */
    ]: "The argument provided is not a valid ISO date string"
  };
  const NOOP_MESSAGE_FUNCTION = () => "";
  const isMessageFunction = (val) => isFunction(val);
  function translate(context, ...args) {
    const { fallbackFormat, postTranslation, unresolving, fallbackLocale, messages: messages2 } = context;
    const [key, options] = parseTranslateArgs(...args);
    const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
    const fallbackWarn = isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
    const escapeParameter = isBoolean(options.escapeParameter) ? options.escapeParameter : context.escapeParameter;
    const resolvedMessage = !!options.resolvedMessage;
    const defaultMsgOrKey = isString(options.default) || isBoolean(options.default) ? !isBoolean(options.default) ? options.default : key : fallbackFormat ? key : "";
    const enableDefaultMsg = fallbackFormat || defaultMsgOrKey !== "";
    const locale = isString(options.locale) ? options.locale : context.locale;
    escapeParameter && escapeParams(options);
    let [format2, targetLocale, message] = !resolvedMessage ? resolveMessageFormat(context, key, locale, fallbackLocale, fallbackWarn, missingWarn) : [
      key,
      locale,
      messages2[locale] || {}
    ];
    let cacheBaseKey = key;
    if (!resolvedMessage && !(isString(format2) || isMessageFunction(format2))) {
      if (enableDefaultMsg) {
        format2 = defaultMsgOrKey;
        cacheBaseKey = format2;
      }
    }
    if (!resolvedMessage && (!(isString(format2) || isMessageFunction(format2)) || !isString(targetLocale))) {
      return unresolving ? NOT_REOSLVED : key;
    }
    if (isString(format2) && context.messageCompiler == null) {
      warn(`The message format compilation is not supported in this build. Because message compiler isn't included. You need to pre-compilation all message format. So translate function return '${key}'.`);
      return key;
    }
    let occurred = false;
    const errorDetector = () => {
      occurred = true;
    };
    const msg = !isMessageFunction(format2) ? compileMessageFormat(context, key, targetLocale, format2, cacheBaseKey, errorDetector) : format2;
    if (occurred) {
      return format2;
    }
    const ctxOptions = getMessageContextOptions(context, targetLocale, message, options);
    const msgContext = createMessageContext(ctxOptions);
    const messaged = evaluateMessage(context, msg, msgContext);
    const ret = postTranslation ? postTranslation(messaged) : messaged;
    {
      const payloads = {
        timestamp: Date.now(),
        key: isString(key) ? key : isMessageFunction(format2) ? format2.key : "",
        locale: targetLocale || (isMessageFunction(format2) ? format2.locale : ""),
        format: isString(format2) ? format2 : isMessageFunction(format2) ? format2.source : "",
        message: ret
      };
      payloads.meta = assign({}, context.__meta, getAdditionalMeta() || {});
      translateDevTools(payloads);
    }
    return ret;
  }
  function escapeParams(options) {
    if (isArray(options.list)) {
      options.list = options.list.map((item) => isString(item) ? escapeHtml(item) : item);
    } else if (isObject$1(options.named)) {
      Object.keys(options.named).forEach((key) => {
        if (isString(options.named[key])) {
          options.named[key] = escapeHtml(options.named[key]);
        }
      });
    }
  }
  function resolveMessageFormat(context, key, locale, fallbackLocale, fallbackWarn, missingWarn) {
    const { messages: messages2, onWarn } = context;
    const locales = getLocaleChain(context, fallbackLocale, locale);
    let message = {};
    let targetLocale;
    let format2 = null;
    let from = locale;
    let to = null;
    const type = "translate";
    for (let i2 = 0; i2 < locales.length; i2++) {
      targetLocale = to = locales[i2];
      if (locale !== targetLocale && isTranslateFallbackWarn(fallbackWarn, key)) {
        onWarn(getWarnMessage$1(1, {
          key,
          target: targetLocale
        }));
      }
      if (locale !== targetLocale) {
        const emitter = context.__v_emitter;
        if (emitter) {
          emitter.emit("fallback", {
            type,
            key,
            from,
            to,
            groupId: `${type}:${key}`
          });
        }
      }
      message = messages2[targetLocale] || {};
      let start = null;
      let startTag;
      let endTag;
      if (inBrowser) {
        start = window.performance.now();
        startTag = "intlify-message-resolve-start";
        endTag = "intlify-message-resolve-end";
        mark && mark(startTag);
      }
      if ((format2 = resolveValue(message, key)) === null) {
        format2 = message[key];
      }
      if (inBrowser) {
        const end = window.performance.now();
        const emitter = context.__v_emitter;
        if (emitter && start && format2) {
          emitter.emit("message-resolve", {
            type: "message-resolve",
            key,
            message: format2,
            time: end - start,
            groupId: `${type}:${key}`
          });
        }
        if (startTag && endTag && mark && measure) {
          mark(endTag);
          measure("intlify message resolve", startTag, endTag);
        }
      }
      if (isString(format2) || isFunction(format2))
        break;
      const missingRet = handleMissing(context, key, targetLocale, missingWarn, type);
      if (missingRet !== key) {
        format2 = missingRet;
      }
      from = to;
    }
    return [format2, targetLocale, message];
  }
  function compileMessageFormat(context, key, targetLocale, format2, cacheBaseKey, errorDetector) {
    const { messageCompiler, warnHtmlMessage } = context;
    if (isMessageFunction(format2)) {
      const msg2 = format2;
      msg2.locale = msg2.locale || targetLocale;
      msg2.key = msg2.key || key;
      return msg2;
    }
    let start = null;
    let startTag;
    let endTag;
    if (inBrowser) {
      start = window.performance.now();
      startTag = "intlify-message-compilation-start";
      endTag = "intlify-message-compilation-end";
      mark && mark(startTag);
    }
    const msg = messageCompiler(format2, getCompileOptions(context, targetLocale, cacheBaseKey, format2, warnHtmlMessage, errorDetector));
    if (inBrowser) {
      const end = window.performance.now();
      const emitter = context.__v_emitter;
      if (emitter && start) {
        emitter.emit("message-compilation", {
          type: "message-compilation",
          message: format2,
          time: end - start,
          groupId: `${"translate"}:${key}`
        });
      }
      if (startTag && endTag && mark && measure) {
        mark(endTag);
        measure("intlify message compilation", startTag, endTag);
      }
    }
    msg.locale = targetLocale;
    msg.key = key;
    msg.source = format2;
    return msg;
  }
  function evaluateMessage(context, msg, msgCtx) {
    let start = null;
    let startTag;
    let endTag;
    if (inBrowser) {
      start = window.performance.now();
      startTag = "intlify-message-evaluation-start";
      endTag = "intlify-message-evaluation-end";
      mark && mark(startTag);
    }
    const messaged = msg(msgCtx);
    if (inBrowser) {
      const end = window.performance.now();
      const emitter = context.__v_emitter;
      if (emitter && start) {
        emitter.emit("message-evaluation", {
          type: "message-evaluation",
          value: messaged,
          time: end - start,
          groupId: `${"translate"}:${msg.key}`
        });
      }
      if (startTag && endTag && mark && measure) {
        mark(endTag);
        measure("intlify message evaluation", startTag, endTag);
      }
    }
    return messaged;
  }
  function parseTranslateArgs(...args) {
    const [arg1, arg2, arg3] = args;
    const options = {};
    if (!isString(arg1) && !isNumber(arg1) && !isMessageFunction(arg1)) {
      throw createCoreError(
        14
        /* INVALID_ARGUMENT */
      );
    }
    const key = isNumber(arg1) ? String(arg1) : isMessageFunction(arg1) ? arg1 : arg1;
    if (isNumber(arg2)) {
      options.plural = arg2;
    } else if (isString(arg2)) {
      options.default = arg2;
    } else if (isPlainObject(arg2) && !isEmptyObject(arg2)) {
      options.named = arg2;
    } else if (isArray(arg2)) {
      options.list = arg2;
    }
    if (isNumber(arg3)) {
      options.plural = arg3;
    } else if (isString(arg3)) {
      options.default = arg3;
    } else if (isPlainObject(arg3)) {
      assign(options, arg3);
    }
    return [key, options];
  }
  function getCompileOptions(context, locale, key, source, warnHtmlMessage, errorDetector) {
    return {
      warnHtmlMessage,
      onError: (err) => {
        errorDetector && errorDetector(err);
        {
          const message = `Message compilation error: ${err.message}`;
          const codeFrame = err.location && generateCodeFrame(source, err.location.start.offset, err.location.end.offset);
          const emitter = context.__v_emitter;
          if (emitter) {
            emitter.emit("compile-error", {
              message: source,
              error: err.message,
              start: err.location && err.location.start.offset,
              end: err.location && err.location.end.offset,
              groupId: `${"translate"}:${key}`
            });
          }
          console.error(codeFrame ? `${message}
${codeFrame}` : message);
        }
      },
      onCacheKey: (source2) => generateFormatCacheKey(locale, key, source2)
    };
  }
  function getMessageContextOptions(context, locale, message, options) {
    const { modifiers, pluralRules } = context;
    const resolveMessage = (key) => {
      const val = resolveValue(message, key);
      if (isString(val)) {
        let occurred = false;
        const errorDetector = () => {
          occurred = true;
        };
        const msg = compileMessageFormat(context, key, locale, val, key, errorDetector);
        return !occurred ? msg : NOOP_MESSAGE_FUNCTION;
      } else if (isMessageFunction(val)) {
        return val;
      } else {
        return NOOP_MESSAGE_FUNCTION;
      }
    };
    const ctxOptions = {
      locale,
      modifiers,
      pluralRules,
      messages: resolveMessage
    };
    if (context.processor) {
      ctxOptions.processor = context.processor;
    }
    if (options.list) {
      ctxOptions.list = options.list;
    }
    if (options.named) {
      ctxOptions.named = options.named;
    }
    if (isNumber(options.plural)) {
      ctxOptions.pluralIndex = options.plural;
    }
    return ctxOptions;
  }
  const intlDefined = typeof Intl !== "undefined";
  const Availabilities = {
    dateTimeFormat: intlDefined && typeof Intl.DateTimeFormat !== "undefined",
    numberFormat: intlDefined && typeof Intl.NumberFormat !== "undefined"
  };
  function datetime(context, ...args) {
    const { datetimeFormats, unresolving, fallbackLocale, onWarn } = context;
    const { __datetimeFormatters } = context;
    if (!Availabilities.dateTimeFormat) {
      onWarn(getWarnMessage$1(
        4
        /* CANNOT_FORMAT_DATE */
      ));
      return MISSING_RESOLVE_VALUE;
    }
    const [key, value, options, overrides] = parseDateTimeArgs(...args);
    const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
    const fallbackWarn = isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
    const part = !!options.part;
    const locale = isString(options.locale) ? options.locale : context.locale;
    const locales = getLocaleChain(context, fallbackLocale, locale);
    if (!isString(key) || key === "") {
      return new Intl.DateTimeFormat(locale).format(value);
    }
    let datetimeFormat = {};
    let targetLocale;
    let format2 = null;
    let from = locale;
    let to = null;
    const type = "datetime format";
    for (let i2 = 0; i2 < locales.length; i2++) {
      targetLocale = to = locales[i2];
      if (locale !== targetLocale && isTranslateFallbackWarn(fallbackWarn, key)) {
        onWarn(getWarnMessage$1(5, {
          key,
          target: targetLocale
        }));
      }
      if (locale !== targetLocale) {
        const emitter = context.__v_emitter;
        if (emitter) {
          emitter.emit("fallback", {
            type,
            key,
            from,
            to,
            groupId: `${type}:${key}`
          });
        }
      }
      datetimeFormat = datetimeFormats[targetLocale] || {};
      format2 = datetimeFormat[key];
      if (isPlainObject(format2))
        break;
      handleMissing(context, key, targetLocale, missingWarn, type);
      from = to;
    }
    if (!isPlainObject(format2) || !isString(targetLocale)) {
      return unresolving ? NOT_REOSLVED : key;
    }
    let id = `${targetLocale}__${key}`;
    if (!isEmptyObject(overrides)) {
      id = `${id}__${JSON.stringify(overrides)}`;
    }
    let formatter = __datetimeFormatters.get(id);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(targetLocale, assign({}, format2, overrides));
      __datetimeFormatters.set(id, formatter);
    }
    return !part ? formatter.format(value) : formatter.formatToParts(value);
  }
  function parseDateTimeArgs(...args) {
    const [arg1, arg2, arg3, arg4] = args;
    let options = {};
    let overrides = {};
    let value;
    if (isString(arg1)) {
      if (!/\d{4}-\d{2}-\d{2}(T.*)?/.test(arg1)) {
        throw createCoreError(
          16
          /* INVALID_ISO_DATE_ARGUMENT */
        );
      }
      value = new Date(arg1);
      try {
        value.toISOString();
      } catch (e) {
        throw createCoreError(
          16
          /* INVALID_ISO_DATE_ARGUMENT */
        );
      }
    } else if (isDate(arg1)) {
      if (isNaN(arg1.getTime())) {
        throw createCoreError(
          15
          /* INVALID_DATE_ARGUMENT */
        );
      }
      value = arg1;
    } else if (isNumber(arg1)) {
      value = arg1;
    } else {
      throw createCoreError(
        14
        /* INVALID_ARGUMENT */
      );
    }
    if (isString(arg2)) {
      options.key = arg2;
    } else if (isPlainObject(arg2)) {
      options = arg2;
    }
    if (isString(arg3)) {
      options.locale = arg3;
    } else if (isPlainObject(arg3)) {
      overrides = arg3;
    }
    if (isPlainObject(arg4)) {
      overrides = arg4;
    }
    return [options.key || "", value, options, overrides];
  }
  function clearDateTimeFormat(ctx, locale, format2) {
    const context = ctx;
    for (const key in format2) {
      const id = `${locale}__${key}`;
      if (!context.__datetimeFormatters.has(id)) {
        continue;
      }
      context.__datetimeFormatters.delete(id);
    }
  }
  function number(context, ...args) {
    const { numberFormats, unresolving, fallbackLocale, onWarn } = context;
    const { __numberFormatters } = context;
    if (!Availabilities.numberFormat) {
      onWarn(getWarnMessage$1(
        2
        /* CANNOT_FORMAT_NUMBER */
      ));
      return MISSING_RESOLVE_VALUE;
    }
    const [key, value, options, overrides] = parseNumberArgs(...args);
    const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
    const fallbackWarn = isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
    const part = !!options.part;
    const locale = isString(options.locale) ? options.locale : context.locale;
    const locales = getLocaleChain(context, fallbackLocale, locale);
    if (!isString(key) || key === "") {
      return new Intl.NumberFormat(locale).format(value);
    }
    let numberFormat = {};
    let targetLocale;
    let format2 = null;
    let from = locale;
    let to = null;
    const type = "number format";
    for (let i2 = 0; i2 < locales.length; i2++) {
      targetLocale = to = locales[i2];
      if (locale !== targetLocale && isTranslateFallbackWarn(fallbackWarn, key)) {
        onWarn(getWarnMessage$1(3, {
          key,
          target: targetLocale
        }));
      }
      if (locale !== targetLocale) {
        const emitter = context.__v_emitter;
        if (emitter) {
          emitter.emit("fallback", {
            type,
            key,
            from,
            to,
            groupId: `${type}:${key}`
          });
        }
      }
      numberFormat = numberFormats[targetLocale] || {};
      format2 = numberFormat[key];
      if (isPlainObject(format2))
        break;
      handleMissing(context, key, targetLocale, missingWarn, type);
      from = to;
    }
    if (!isPlainObject(format2) || !isString(targetLocale)) {
      return unresolving ? NOT_REOSLVED : key;
    }
    let id = `${targetLocale}__${key}`;
    if (!isEmptyObject(overrides)) {
      id = `${id}__${JSON.stringify(overrides)}`;
    }
    let formatter = __numberFormatters.get(id);
    if (!formatter) {
      formatter = new Intl.NumberFormat(targetLocale, assign({}, format2, overrides));
      __numberFormatters.set(id, formatter);
    }
    return !part ? formatter.format(value) : formatter.formatToParts(value);
  }
  function parseNumberArgs(...args) {
    const [arg1, arg2, arg3, arg4] = args;
    let options = {};
    let overrides = {};
    if (!isNumber(arg1)) {
      throw createCoreError(
        14
        /* INVALID_ARGUMENT */
      );
    }
    const value = arg1;
    if (isString(arg2)) {
      options.key = arg2;
    } else if (isPlainObject(arg2)) {
      options = arg2;
    }
    if (isString(arg3)) {
      options.locale = arg3;
    } else if (isPlainObject(arg3)) {
      overrides = arg3;
    }
    if (isPlainObject(arg4)) {
      overrides = arg4;
    }
    return [options.key || "", value, options, overrides];
  }
  function clearNumberFormat(ctx, locale, format2) {
    const context = ctx;
    for (const key in format2) {
      const id = `${locale}__${key}`;
      if (!context.__numberFormatters.has(id)) {
        continue;
      }
      context.__numberFormatters.delete(id);
    }
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = { ...defaultSettings };
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        }
      };
      hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
        if (pluginId === this.plugin.id) {
          this.fallbacks.setSettings(value);
        }
      });
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && pluginDescriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(pluginDescriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
    * @intlify/vue-devtools v9.1.9
    * (c) 2021 kazuya kawaguchi
    * Released under the MIT License.
    */
  const VueDevToolsLabels = {
    [
      "vue-devtools-plugin-vue-i18n"
      /* PLUGIN */
    ]: "Vue I18n devtools",
    [
      "vue-i18n-resource-inspector"
      /* CUSTOM_INSPECTOR */
    ]: "I18n Resources",
    [
      "vue-i18n-timeline"
      /* TIMELINE */
    ]: "Vue I18n"
  };
  const VueDevToolsPlaceholders = {
    [
      "vue-i18n-resource-inspector"
      /* CUSTOM_INSPECTOR */
    ]: "Search for scopes ..."
  };
  const VueDevToolsTimelineColors = {
    [
      "vue-i18n-timeline"
      /* TIMELINE */
    ]: 16764185
  };
  /*!
    * vue-i18n v9.1.9
    * (c) 2022 kazuya kawaguchi
    * Released under the MIT License.
    */
  const VERSION = "9.1.9";
  function initFeatureFlags() {
    let needWarn = false;
    {
      needWarn = true;
    }
    if (needWarn) {
      console.warn(`You are running the esm-bundler build of vue-i18n. It is recommended to configure your bundler to explicitly replace feature flag globals with boolean literals to get proper tree-shaking in the final bundle.`);
    }
  }
  const warnMessages = {
    [
      6
      /* FALLBACK_TO_ROOT */
    ]: `Fall back to {type} '{key}' with root locale.`,
    [
      7
      /* NOT_SUPPORTED_PRESERVE */
    ]: `Not supported 'preserve'.`,
    [
      8
      /* NOT_SUPPORTED_FORMATTER */
    ]: `Not supported 'formatter'.`,
    [
      9
      /* NOT_SUPPORTED_PRESERVE_DIRECTIVE */
    ]: `Not supported 'preserveDirectiveContent'.`,
    [
      10
      /* NOT_SUPPORTED_GET_CHOICE_INDEX */
    ]: `Not supported 'getChoiceIndex'.`,
    [
      11
      /* COMPONENT_NAME_LEGACY_COMPATIBLE */
    ]: `Component name legacy compatible: '{name}' -> 'i18n'`,
    [
      12
      /* NOT_FOUND_PARENT_SCOPE */
    ]: `Not found parent scope. use the global scope.`
  };
  function getWarnMessage(code, ...args) {
    return format(warnMessages[code], ...args);
  }
  function createI18nError(code, ...args) {
    return createCompileError(code, null, { messages: errorMessages, args });
  }
  const errorMessages = {
    [
      14
      /* UNEXPECTED_RETURN_TYPE */
    ]: "Unexpected return type in composer",
    [
      15
      /* INVALID_ARGUMENT */
    ]: "Invalid argument",
    [
      16
      /* MUST_BE_CALL_SETUP_TOP */
    ]: "Must be called at the top of a `setup` function",
    [
      17
      /* NOT_INSLALLED */
    ]: "Need to install with `app.use` function",
    [
      22
      /* UNEXPECTED_ERROR */
    ]: "Unexpected error",
    [
      18
      /* NOT_AVAILABLE_IN_LEGACY_MODE */
    ]: "Not available in legacy mode",
    [
      19
      /* REQUIRED_VALUE */
    ]: `Required in value: {0}`,
    [
      20
      /* INVALID_VALUE */
    ]: `Invalid value`,
    [
      21
      /* CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN */
    ]: `Cannot setup vue-devtools plugin`
  };
  const DEVTOOLS_META = "__INTLIFY_META__";
  const TransrateVNodeSymbol = makeSymbol("__transrateVNode");
  const DatetimePartsSymbol = makeSymbol("__datetimeParts");
  const NumberPartsSymbol = makeSymbol("__numberParts");
  const EnableEmitter = makeSymbol("__enableEmitter");
  const DisableEmitter = makeSymbol("__disableEmitter");
  const SetPluralRulesSymbol = makeSymbol("__setPluralRules");
  makeSymbol("__intlifyMeta");
  const InejctWithOption = makeSymbol("__injectWithOption");
  let composerID = 0;
  function defineCoreMissingHandler(missing) {
    return (ctx, locale, key, type) => {
      return missing(locale, key, vue.getCurrentInstance() || void 0, type);
    };
  }
  function getLocaleMessages(locale, options) {
    const { messages: messages2, __i18n } = options;
    const ret = isPlainObject(messages2) ? messages2 : isArray(__i18n) ? {} : { [locale]: {} };
    if (isArray(__i18n)) {
      __i18n.forEach(({ locale: locale2, resource }) => {
        if (locale2) {
          ret[locale2] = ret[locale2] || {};
          deepCopy(resource, ret[locale2]);
        } else {
          deepCopy(resource, ret);
        }
      });
    }
    if (options.flatJson) {
      for (const key in ret) {
        if (hasOwn$1(ret, key)) {
          handleFlatJson(ret[key]);
        }
      }
    }
    return ret;
  }
  const isNotObjectOrIsArray = (val) => !isObject$1(val) || isArray(val);
  function deepCopy(src, des) {
    if (isNotObjectOrIsArray(src) || isNotObjectOrIsArray(des)) {
      throw createI18nError(
        20
        /* INVALID_VALUE */
      );
    }
    for (const key in src) {
      if (hasOwn$1(src, key)) {
        if (isNotObjectOrIsArray(src[key]) || isNotObjectOrIsArray(des[key])) {
          des[key] = src[key];
        } else {
          deepCopy(src[key], des[key]);
        }
      }
    }
  }
  const getMetaInfo = () => {
    const instance = vue.getCurrentInstance();
    return instance && instance.type[DEVTOOLS_META] ? { [DEVTOOLS_META]: instance.type[DEVTOOLS_META] } : null;
  };
  function createComposer(options = {}) {
    const { __root } = options;
    const _isGlobal = __root === void 0;
    let _inheritLocale = isBoolean(options.inheritLocale) ? options.inheritLocale : true;
    const _locale = vue.ref(
      // prettier-ignore
      __root && _inheritLocale ? __root.locale.value : isString(options.locale) ? options.locale : "en-US"
    );
    const _fallbackLocale = vue.ref(
      // prettier-ignore
      __root && _inheritLocale ? __root.fallbackLocale.value : isString(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale.value
    );
    const _messages = vue.ref(getLocaleMessages(_locale.value, options));
    const _datetimeFormats = vue.ref(isPlainObject(options.datetimeFormats) ? options.datetimeFormats : { [_locale.value]: {} });
    const _numberFormats = vue.ref(isPlainObject(options.numberFormats) ? options.numberFormats : { [_locale.value]: {} });
    let _missingWarn = __root ? __root.missingWarn : isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
    let _fallbackWarn = __root ? __root.fallbackWarn : isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
    let _fallbackRoot = __root ? __root.fallbackRoot : isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
    let _fallbackFormat = !!options.fallbackFormat;
    let _missing = isFunction(options.missing) ? options.missing : null;
    let _runtimeMissing = isFunction(options.missing) ? defineCoreMissingHandler(options.missing) : null;
    let _postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
    let _warnHtmlMessage = isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
    let _escapeParameter = !!options.escapeParameter;
    const _modifiers = __root ? __root.modifiers : isPlainObject(options.modifiers) ? options.modifiers : {};
    let _pluralRules = options.pluralRules || __root && __root.pluralRules;
    let _context;
    function getCoreContext() {
      return createCoreContext({
        version: VERSION,
        locale: _locale.value,
        fallbackLocale: _fallbackLocale.value,
        messages: _messages.value,
        messageCompiler: function compileToFunction(source) {
          return (ctx) => {
            return ctx.normalize([source]);
          };
        },
        datetimeFormats: _datetimeFormats.value,
        numberFormats: _numberFormats.value,
        modifiers: _modifiers,
        pluralRules: _pluralRules,
        missing: _runtimeMissing === null ? void 0 : _runtimeMissing,
        missingWarn: _missingWarn,
        fallbackWarn: _fallbackWarn,
        fallbackFormat: _fallbackFormat,
        unresolving: true,
        postTranslation: _postTranslation === null ? void 0 : _postTranslation,
        warnHtmlMessage: _warnHtmlMessage,
        escapeParameter: _escapeParameter,
        __datetimeFormatters: isPlainObject(_context) ? _context.__datetimeFormatters : void 0,
        __numberFormatters: isPlainObject(_context) ? _context.__numberFormatters : void 0,
        __v_emitter: isPlainObject(_context) ? _context.__v_emitter : void 0,
        __meta: { framework: "vue" }
      });
    }
    _context = getCoreContext();
    updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
    function trackReactivityValues() {
      return [
        _locale.value,
        _fallbackLocale.value,
        _messages.value,
        _datetimeFormats.value,
        _numberFormats.value
      ];
    }
    const locale = vue.computed({
      get: () => _locale.value,
      set: (val) => {
        _locale.value = val;
        _context.locale = _locale.value;
      }
    });
    const fallbackLocale = vue.computed({
      get: () => _fallbackLocale.value,
      set: (val) => {
        _fallbackLocale.value = val;
        _context.fallbackLocale = _fallbackLocale.value;
        updateFallbackLocale(_context, _locale.value, val);
      }
    });
    const messages2 = vue.computed(() => _messages.value);
    const datetimeFormats = vue.computed(() => _datetimeFormats.value);
    const numberFormats = vue.computed(() => _numberFormats.value);
    function getPostTranslationHandler() {
      return isFunction(_postTranslation) ? _postTranslation : null;
    }
    function setPostTranslationHandler(handler) {
      _postTranslation = handler;
      _context.postTranslation = handler;
    }
    function getMissingHandler() {
      return _missing;
    }
    function setMissingHandler(handler) {
      if (handler !== null) {
        _runtimeMissing = defineCoreMissingHandler(handler);
      }
      _missing = handler;
      _context.missing = _runtimeMissing;
    }
    function isResolvedTranslateMessage(type, arg) {
      return type !== "translate" || !!arg.resolvedMessage === false;
    }
    function wrapWithDeps(fn, argumentParser, warnType, fallbackSuccess, fallbackFail, successCondition) {
      trackReactivityValues();
      let ret;
      {
        try {
          setAdditionalMeta(getMetaInfo());
          ret = fn(_context);
        } finally {
          setAdditionalMeta(null);
        }
      }
      if (isNumber(ret) && ret === NOT_REOSLVED) {
        const [key, arg2] = argumentParser();
        if (__root && isString(key) && isResolvedTranslateMessage(warnType, arg2)) {
          if (_fallbackRoot && (isTranslateFallbackWarn(_fallbackWarn, key) || isTranslateMissingWarn(_missingWarn, key))) {
            warn(getWarnMessage(6, {
              key,
              type: warnType
            }));
          }
          {
            const { __v_emitter: emitter } = _context;
            if (emitter && _fallbackRoot) {
              emitter.emit("fallback", {
                type: warnType,
                key,
                to: "global",
                groupId: `${warnType}:${key}`
              });
            }
          }
        }
        return __root && _fallbackRoot ? fallbackSuccess(__root) : fallbackFail(key);
      } else if (successCondition(ret)) {
        return ret;
      } else {
        throw createI18nError(
          14
          /* UNEXPECTED_RETURN_TYPE */
        );
      }
    }
    function t2(...args) {
      return wrapWithDeps((context) => translate(context, ...args), () => parseTranslateArgs(...args), "translate", (root) => root.t(...args), (key) => key, (val) => isString(val));
    }
    function rt2(...args) {
      const [arg1, arg2, arg3] = args;
      if (arg3 && !isObject$1(arg3)) {
        throw createI18nError(
          15
          /* INVALID_ARGUMENT */
        );
      }
      return t2(...[arg1, arg2, assign({ resolvedMessage: true }, arg3 || {})]);
    }
    function d2(...args) {
      return wrapWithDeps((context) => datetime(context, ...args), () => parseDateTimeArgs(...args), "datetime format", (root) => root.d(...args), () => MISSING_RESOLVE_VALUE, (val) => isString(val));
    }
    function n2(...args) {
      return wrapWithDeps((context) => number(context, ...args), () => parseNumberArgs(...args), "number format", (root) => root.n(...args), () => MISSING_RESOLVE_VALUE, (val) => isString(val));
    }
    function normalize(values) {
      return values.map((val) => isString(val) ? vue.createVNode(vue.Text, null, val, 0) : val);
    }
    const interpolate = (val) => val;
    const processor = {
      normalize,
      interpolate,
      type: "vnode"
    };
    function transrateVNode(...args) {
      return wrapWithDeps(
        (context) => {
          let ret;
          const _context2 = context;
          try {
            _context2.processor = processor;
            ret = translate(_context2, ...args);
          } finally {
            _context2.processor = null;
          }
          return ret;
        },
        () => parseTranslateArgs(...args),
        "translate",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (root) => root[TransrateVNodeSymbol](...args),
        (key) => [vue.createVNode(vue.Text, null, key, 0)],
        (val) => isArray(val)
      );
    }
    function numberParts(...args) {
      return wrapWithDeps(
        (context) => number(context, ...args),
        () => parseNumberArgs(...args),
        "number format",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (root) => root[NumberPartsSymbol](...args),
        () => [],
        (val) => isString(val) || isArray(val)
      );
    }
    function datetimeParts(...args) {
      return wrapWithDeps(
        (context) => datetime(context, ...args),
        () => parseDateTimeArgs(...args),
        "datetime format",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (root) => root[DatetimePartsSymbol](...args),
        () => [],
        (val) => isString(val) || isArray(val)
      );
    }
    function setPluralRules(rules) {
      _pluralRules = rules;
      _context.pluralRules = _pluralRules;
    }
    function te2(key, locale2) {
      const targetLocale = isString(locale2) ? locale2 : _locale.value;
      const message = getLocaleMessage(targetLocale);
      return resolveValue(message, key) !== null;
    }
    function resolveMessages(key) {
      let messages3 = null;
      const locales = getLocaleChain(_context, _fallbackLocale.value, _locale.value);
      for (let i2 = 0; i2 < locales.length; i2++) {
        const targetLocaleMessages = _messages.value[locales[i2]] || {};
        const messageValue = resolveValue(targetLocaleMessages, key);
        if (messageValue != null) {
          messages3 = messageValue;
          break;
        }
      }
      return messages3;
    }
    function tm(key) {
      const messages3 = resolveMessages(key);
      return messages3 != null ? messages3 : __root ? __root.tm(key) || {} : {};
    }
    function getLocaleMessage(locale2) {
      return _messages.value[locale2] || {};
    }
    function setLocaleMessage(locale2, message) {
      _messages.value[locale2] = message;
      _context.messages = _messages.value;
    }
    function mergeLocaleMessage(locale2, message) {
      _messages.value[locale2] = _messages.value[locale2] || {};
      deepCopy(message, _messages.value[locale2]);
      _context.messages = _messages.value;
    }
    function getDateTimeFormat(locale2) {
      return _datetimeFormats.value[locale2] || {};
    }
    function setDateTimeFormat(locale2, format2) {
      _datetimeFormats.value[locale2] = format2;
      _context.datetimeFormats = _datetimeFormats.value;
      clearDateTimeFormat(_context, locale2, format2);
    }
    function mergeDateTimeFormat(locale2, format2) {
      _datetimeFormats.value[locale2] = assign(_datetimeFormats.value[locale2] || {}, format2);
      _context.datetimeFormats = _datetimeFormats.value;
      clearDateTimeFormat(_context, locale2, format2);
    }
    function getNumberFormat(locale2) {
      return _numberFormats.value[locale2] || {};
    }
    function setNumberFormat(locale2, format2) {
      _numberFormats.value[locale2] = format2;
      _context.numberFormats = _numberFormats.value;
      clearNumberFormat(_context, locale2, format2);
    }
    function mergeNumberFormat(locale2, format2) {
      _numberFormats.value[locale2] = assign(_numberFormats.value[locale2] || {}, format2);
      _context.numberFormats = _numberFormats.value;
      clearNumberFormat(_context, locale2, format2);
    }
    composerID++;
    if (__root) {
      vue.watch(__root.locale, (val) => {
        if (_inheritLocale) {
          _locale.value = val;
          _context.locale = val;
          updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
        }
      });
      vue.watch(__root.fallbackLocale, (val) => {
        if (_inheritLocale) {
          _fallbackLocale.value = val;
          _context.fallbackLocale = val;
          updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
        }
      });
    }
    const composer = {
      id: composerID,
      locale,
      fallbackLocale,
      get inheritLocale() {
        return _inheritLocale;
      },
      set inheritLocale(val) {
        _inheritLocale = val;
        if (val && __root) {
          _locale.value = __root.locale.value;
          _fallbackLocale.value = __root.fallbackLocale.value;
          updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
        }
      },
      get availableLocales() {
        return Object.keys(_messages.value).sort();
      },
      messages: messages2,
      datetimeFormats,
      numberFormats,
      get modifiers() {
        return _modifiers;
      },
      get pluralRules() {
        return _pluralRules || {};
      },
      get isGlobal() {
        return _isGlobal;
      },
      get missingWarn() {
        return _missingWarn;
      },
      set missingWarn(val) {
        _missingWarn = val;
        _context.missingWarn = _missingWarn;
      },
      get fallbackWarn() {
        return _fallbackWarn;
      },
      set fallbackWarn(val) {
        _fallbackWarn = val;
        _context.fallbackWarn = _fallbackWarn;
      },
      get fallbackRoot() {
        return _fallbackRoot;
      },
      set fallbackRoot(val) {
        _fallbackRoot = val;
      },
      get fallbackFormat() {
        return _fallbackFormat;
      },
      set fallbackFormat(val) {
        _fallbackFormat = val;
        _context.fallbackFormat = _fallbackFormat;
      },
      get warnHtmlMessage() {
        return _warnHtmlMessage;
      },
      set warnHtmlMessage(val) {
        _warnHtmlMessage = val;
        _context.warnHtmlMessage = val;
      },
      get escapeParameter() {
        return _escapeParameter;
      },
      set escapeParameter(val) {
        _escapeParameter = val;
        _context.escapeParameter = val;
      },
      t: t2,
      rt: rt2,
      d: d2,
      n: n2,
      te: te2,
      tm,
      getLocaleMessage,
      setLocaleMessage,
      mergeLocaleMessage,
      getDateTimeFormat,
      setDateTimeFormat,
      mergeDateTimeFormat,
      getNumberFormat,
      setNumberFormat,
      mergeNumberFormat,
      getPostTranslationHandler,
      setPostTranslationHandler,
      getMissingHandler,
      setMissingHandler,
      [TransrateVNodeSymbol]: transrateVNode,
      [NumberPartsSymbol]: numberParts,
      [DatetimePartsSymbol]: datetimeParts,
      [SetPluralRulesSymbol]: setPluralRules,
      [InejctWithOption]: options.__injectWithOption
      // eslint-disable-line @typescript-eslint/no-explicit-any
    };
    {
      composer[EnableEmitter] = (emitter) => {
        _context.__v_emitter = emitter;
      };
      composer[DisableEmitter] = () => {
        _context.__v_emitter = void 0;
      };
    }
    return composer;
  }
  function convertComposerOptions(options) {
    const locale = isString(options.locale) ? options.locale : "en-US";
    const fallbackLocale = isString(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : locale;
    const missing = isFunction(options.missing) ? options.missing : void 0;
    const missingWarn = isBoolean(options.silentTranslationWarn) || isRegExp(options.silentTranslationWarn) ? !options.silentTranslationWarn : true;
    const fallbackWarn = isBoolean(options.silentFallbackWarn) || isRegExp(options.silentFallbackWarn) ? !options.silentFallbackWarn : true;
    const fallbackRoot = isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
    const fallbackFormat = !!options.formatFallbackMessages;
    const modifiers = isPlainObject(options.modifiers) ? options.modifiers : {};
    const pluralizationRules = options.pluralizationRules;
    const postTranslation = isFunction(options.postTranslation) ? options.postTranslation : void 0;
    const warnHtmlMessage = isString(options.warnHtmlInMessage) ? options.warnHtmlInMessage !== "off" : true;
    const escapeParameter = !!options.escapeParameterHtml;
    const inheritLocale = isBoolean(options.sync) ? options.sync : true;
    if (options.formatter) {
      warn(getWarnMessage(
        8
        /* NOT_SUPPORTED_FORMATTER */
      ));
    }
    if (options.preserveDirectiveContent) {
      warn(getWarnMessage(
        9
        /* NOT_SUPPORTED_PRESERVE_DIRECTIVE */
      ));
    }
    let messages2 = options.messages;
    if (isPlainObject(options.sharedMessages)) {
      const sharedMessages = options.sharedMessages;
      const locales = Object.keys(sharedMessages);
      messages2 = locales.reduce((messages3, locale2) => {
        const message = messages3[locale2] || (messages3[locale2] = {});
        assign(message, sharedMessages[locale2]);
        return messages3;
      }, messages2 || {});
    }
    const { __i18n, __root, __injectWithOption } = options;
    const datetimeFormats = options.datetimeFormats;
    const numberFormats = options.numberFormats;
    const flatJson = options.flatJson;
    return {
      locale,
      fallbackLocale,
      messages: messages2,
      flatJson,
      datetimeFormats,
      numberFormats,
      missing,
      missingWarn,
      fallbackWarn,
      fallbackRoot,
      fallbackFormat,
      modifiers,
      pluralRules: pluralizationRules,
      postTranslation,
      warnHtmlMessage,
      escapeParameter,
      inheritLocale,
      __i18n,
      __root,
      __injectWithOption
    };
  }
  function createVueI18n(options = {}) {
    const composer = createComposer(convertComposerOptions(options));
    const vueI18n = {
      // id
      id: composer.id,
      // locale
      get locale() {
        return composer.locale.value;
      },
      set locale(val) {
        composer.locale.value = val;
      },
      // fallbackLocale
      get fallbackLocale() {
        return composer.fallbackLocale.value;
      },
      set fallbackLocale(val) {
        composer.fallbackLocale.value = val;
      },
      // messages
      get messages() {
        return composer.messages.value;
      },
      // datetimeFormats
      get datetimeFormats() {
        return composer.datetimeFormats.value;
      },
      // numberFormats
      get numberFormats() {
        return composer.numberFormats.value;
      },
      // availableLocales
      get availableLocales() {
        return composer.availableLocales;
      },
      // formatter
      get formatter() {
        warn(getWarnMessage(
          8
          /* NOT_SUPPORTED_FORMATTER */
        ));
        return {
          interpolate() {
            return [];
          }
        };
      },
      set formatter(val) {
        warn(getWarnMessage(
          8
          /* NOT_SUPPORTED_FORMATTER */
        ));
      },
      // missing
      get missing() {
        return composer.getMissingHandler();
      },
      set missing(handler) {
        composer.setMissingHandler(handler);
      },
      // silentTranslationWarn
      get silentTranslationWarn() {
        return isBoolean(composer.missingWarn) ? !composer.missingWarn : composer.missingWarn;
      },
      set silentTranslationWarn(val) {
        composer.missingWarn = isBoolean(val) ? !val : val;
      },
      // silentFallbackWarn
      get silentFallbackWarn() {
        return isBoolean(composer.fallbackWarn) ? !composer.fallbackWarn : composer.fallbackWarn;
      },
      set silentFallbackWarn(val) {
        composer.fallbackWarn = isBoolean(val) ? !val : val;
      },
      // modifiers
      get modifiers() {
        return composer.modifiers;
      },
      // formatFallbackMessages
      get formatFallbackMessages() {
        return composer.fallbackFormat;
      },
      set formatFallbackMessages(val) {
        composer.fallbackFormat = val;
      },
      // postTranslation
      get postTranslation() {
        return composer.getPostTranslationHandler();
      },
      set postTranslation(handler) {
        composer.setPostTranslationHandler(handler);
      },
      // sync
      get sync() {
        return composer.inheritLocale;
      },
      set sync(val) {
        composer.inheritLocale = val;
      },
      // warnInHtmlMessage
      get warnHtmlInMessage() {
        return composer.warnHtmlMessage ? "warn" : "off";
      },
      set warnHtmlInMessage(val) {
        composer.warnHtmlMessage = val !== "off";
      },
      // escapeParameterHtml
      get escapeParameterHtml() {
        return composer.escapeParameter;
      },
      set escapeParameterHtml(val) {
        composer.escapeParameter = val;
      },
      // preserveDirectiveContent
      get preserveDirectiveContent() {
        warn(getWarnMessage(
          9
          /* NOT_SUPPORTED_PRESERVE_DIRECTIVE */
        ));
        return true;
      },
      set preserveDirectiveContent(val) {
        warn(getWarnMessage(
          9
          /* NOT_SUPPORTED_PRESERVE_DIRECTIVE */
        ));
      },
      // pluralizationRules
      get pluralizationRules() {
        return composer.pluralRules || {};
      },
      // for internal
      __composer: composer,
      // t
      t(...args) {
        const [arg1, arg2, arg3] = args;
        const options2 = {};
        let list = null;
        let named = null;
        if (!isString(arg1)) {
          throw createI18nError(
            15
            /* INVALID_ARGUMENT */
          );
        }
        const key = arg1;
        if (isString(arg2)) {
          options2.locale = arg2;
        } else if (isArray(arg2)) {
          list = arg2;
        } else if (isPlainObject(arg2)) {
          named = arg2;
        }
        if (isArray(arg3)) {
          list = arg3;
        } else if (isPlainObject(arg3)) {
          named = arg3;
        }
        return composer.t(key, list || named || {}, options2);
      },
      rt(...args) {
        return composer.rt(...args);
      },
      // tc
      tc(...args) {
        const [arg1, arg2, arg3] = args;
        const options2 = { plural: 1 };
        let list = null;
        let named = null;
        if (!isString(arg1)) {
          throw createI18nError(
            15
            /* INVALID_ARGUMENT */
          );
        }
        const key = arg1;
        if (isString(arg2)) {
          options2.locale = arg2;
        } else if (isNumber(arg2)) {
          options2.plural = arg2;
        } else if (isArray(arg2)) {
          list = arg2;
        } else if (isPlainObject(arg2)) {
          named = arg2;
        }
        if (isString(arg3)) {
          options2.locale = arg3;
        } else if (isArray(arg3)) {
          list = arg3;
        } else if (isPlainObject(arg3)) {
          named = arg3;
        }
        return composer.t(key, list || named || {}, options2);
      },
      // te
      te(key, locale) {
        return composer.te(key, locale);
      },
      // tm
      tm(key) {
        return composer.tm(key);
      },
      // getLocaleMessage
      getLocaleMessage(locale) {
        return composer.getLocaleMessage(locale);
      },
      // setLocaleMessage
      setLocaleMessage(locale, message) {
        composer.setLocaleMessage(locale, message);
      },
      // mergeLocaleMessage
      mergeLocaleMessage(locale, message) {
        composer.mergeLocaleMessage(locale, message);
      },
      // d
      d(...args) {
        return composer.d(...args);
      },
      // getDateTimeFormat
      getDateTimeFormat(locale) {
        return composer.getDateTimeFormat(locale);
      },
      // setDateTimeFormat
      setDateTimeFormat(locale, format2) {
        composer.setDateTimeFormat(locale, format2);
      },
      // mergeDateTimeFormat
      mergeDateTimeFormat(locale, format2) {
        composer.mergeDateTimeFormat(locale, format2);
      },
      // n
      n(...args) {
        return composer.n(...args);
      },
      // getNumberFormat
      getNumberFormat(locale) {
        return composer.getNumberFormat(locale);
      },
      // setNumberFormat
      setNumberFormat(locale, format2) {
        composer.setNumberFormat(locale, format2);
      },
      // mergeNumberFormat
      mergeNumberFormat(locale, format2) {
        composer.mergeNumberFormat(locale, format2);
      },
      // getChoiceIndex
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getChoiceIndex(choice, choicesLength) {
        warn(getWarnMessage(
          10
          /* NOT_SUPPORTED_GET_CHOICE_INDEX */
        ));
        return -1;
      },
      // for internal
      __onComponentInstanceCreated(target) {
        const { componentInstanceCreatedListener } = options;
        if (componentInstanceCreatedListener) {
          componentInstanceCreatedListener(target, vueI18n);
        }
      }
    };
    {
      vueI18n.__enableEmitter = (emitter) => {
        const __composer = composer;
        __composer[EnableEmitter] && __composer[EnableEmitter](emitter);
      };
      vueI18n.__disableEmitter = () => {
        const __composer = composer;
        __composer[DisableEmitter] && __composer[DisableEmitter]();
      };
    }
    return vueI18n;
  }
  const baseFormatProps = {
    tag: {
      type: [String, Object]
    },
    locale: {
      type: String
    },
    scope: {
      type: String,
      validator: (val) => val === "parent" || val === "global",
      default: "parent"
    },
    i18n: {
      type: Object
    }
  };
  const Translation = {
    /* eslint-disable */
    name: "i18n-t",
    props: assign({
      keypath: {
        type: String,
        required: true
      },
      plural: {
        type: [Number, String],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validator: (val) => isNumber(val) || !isNaN(val)
      }
    }, baseFormatProps),
    /* eslint-enable */
    setup(props, context) {
      const { slots, attrs } = context;
      const i18n2 = props.i18n || useI18n({
        useScope: props.scope,
        __useComponent: true
      });
      const keys = Object.keys(slots).filter((key) => key !== "_");
      return () => {
        const options = {};
        if (props.locale) {
          options.locale = props.locale;
        }
        if (props.plural !== void 0) {
          options.plural = isString(props.plural) ? +props.plural : props.plural;
        }
        const arg = getInterpolateArg(context, keys);
        const children = i18n2[TransrateVNodeSymbol](props.keypath, arg, options);
        const assignedAttrs = assign({}, attrs);
        return isString(props.tag) ? vue.h(props.tag, assignedAttrs, children) : isObject$1(props.tag) ? vue.h(props.tag, assignedAttrs, children) : vue.h(vue.Fragment, assignedAttrs, children);
      };
    }
  };
  function getInterpolateArg({ slots }, keys) {
    if (keys.length === 1 && keys[0] === "default") {
      return slots.default ? slots.default() : [];
    } else {
      return keys.reduce((arg, key) => {
        const slot = slots[key];
        if (slot) {
          arg[key] = slot();
        }
        return arg;
      }, {});
    }
  }
  function renderFormatter(props, context, slotKeys, partFormatter) {
    const { slots, attrs } = context;
    return () => {
      const options = { part: true };
      let overrides = {};
      if (props.locale) {
        options.locale = props.locale;
      }
      if (isString(props.format)) {
        options.key = props.format;
      } else if (isObject$1(props.format)) {
        if (isString(props.format.key)) {
          options.key = props.format.key;
        }
        overrides = Object.keys(props.format).reduce((options2, prop) => {
          return slotKeys.includes(prop) ? assign({}, options2, { [prop]: props.format[prop] }) : options2;
        }, {});
      }
      const parts = partFormatter(...[props.value, options, overrides]);
      let children = [options.key];
      if (isArray(parts)) {
        children = parts.map((part, index) => {
          const slot = slots[part.type];
          return slot ? slot({ [part.type]: part.value, index, parts }) : [part.value];
        });
      } else if (isString(parts)) {
        children = [parts];
      }
      const assignedAttrs = assign({}, attrs);
      return isString(props.tag) ? vue.h(props.tag, assignedAttrs, children) : isObject$1(props.tag) ? vue.h(props.tag, assignedAttrs, children) : vue.h(vue.Fragment, assignedAttrs, children);
    };
  }
  const NUMBER_FORMAT_KEYS = [
    "localeMatcher",
    "style",
    "unit",
    "unitDisplay",
    "currency",
    "currencyDisplay",
    "useGrouping",
    "numberingSystem",
    "minimumIntegerDigits",
    "minimumFractionDigits",
    "maximumFractionDigits",
    "minimumSignificantDigits",
    "maximumSignificantDigits",
    "notation",
    "formatMatcher"
  ];
  const NumberFormat = {
    /* eslint-disable */
    name: "i18n-n",
    props: assign({
      value: {
        type: Number,
        required: true
      },
      format: {
        type: [String, Object]
      }
    }, baseFormatProps),
    /* eslint-enable */
    setup(props, context) {
      const i18n2 = props.i18n || useI18n({ useScope: "parent", __useComponent: true });
      return renderFormatter(props, context, NUMBER_FORMAT_KEYS, (...args) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18n2[NumberPartsSymbol](...args)
      ));
    }
  };
  const DATETIME_FORMAT_KEYS = [
    "dateStyle",
    "timeStyle",
    "fractionalSecondDigits",
    "calendar",
    "dayPeriod",
    "numberingSystem",
    "localeMatcher",
    "timeZone",
    "hour12",
    "hourCycle",
    "formatMatcher",
    "weekday",
    "era",
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
    "timeZoneName"
  ];
  const DatetimeFormat = {
    /* eslint-disable */
    name: "i18n-d",
    props: assign({
      value: {
        type: [Number, Date],
        required: true
      },
      format: {
        type: [String, Object]
      }
    }, baseFormatProps),
    /* eslint-enable */
    setup(props, context) {
      const i18n2 = props.i18n || useI18n({ useScope: "parent", __useComponent: true });
      return renderFormatter(props, context, DATETIME_FORMAT_KEYS, (...args) => (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18n2[DatetimePartsSymbol](...args)
      ));
    }
  };
  function getComposer$2(i18n2, instance) {
    const i18nInternal = i18n2;
    if (i18n2.mode === "composition") {
      return i18nInternal.__getInstance(instance) || i18n2.global;
    } else {
      const vueI18n = i18nInternal.__getInstance(instance);
      return vueI18n != null ? vueI18n.__composer : i18n2.global.__composer;
    }
  }
  function vTDirective(i18n2) {
    const bind = (el, { instance, value, modifiers }) => {
      if (!instance || !instance.$) {
        throw createI18nError(
          22
          /* UNEXPECTED_ERROR */
        );
      }
      const composer = getComposer$2(i18n2, instance.$);
      if (modifiers.preserve) {
        warn(getWarnMessage(
          7
          /* NOT_SUPPORTED_PRESERVE */
        ));
      }
      const parsedValue = parseValue(value);
      el.textContent = composer.t(...makeParams(parsedValue));
    };
    return {
      beforeMount: bind,
      beforeUpdate: bind
    };
  }
  function parseValue(value) {
    if (isString(value)) {
      return { path: value };
    } else if (isPlainObject(value)) {
      if (!("path" in value)) {
        throw createI18nError(19, "path");
      }
      return value;
    } else {
      throw createI18nError(
        20
        /* INVALID_VALUE */
      );
    }
  }
  function makeParams(value) {
    const { path, locale, args, choice, plural } = value;
    const options = {};
    const named = args || {};
    if (isString(locale)) {
      options.locale = locale;
    }
    if (isNumber(choice)) {
      options.plural = choice;
    }
    if (isNumber(plural)) {
      options.plural = plural;
    }
    return [path, named, options];
  }
  function apply(app, i18n2, ...options) {
    const pluginOptions = isPlainObject(options[0]) ? options[0] : {};
    const useI18nComponentName = !!pluginOptions.useI18nComponentName;
    const globalInstall = isBoolean(pluginOptions.globalInstall) ? pluginOptions.globalInstall : true;
    if (globalInstall && useI18nComponentName) {
      warn(getWarnMessage(11, {
        name: Translation.name
      }));
    }
    if (globalInstall) {
      app.component(!useI18nComponentName ? Translation.name : "i18n", Translation);
      app.component(NumberFormat.name, NumberFormat);
      app.component(DatetimeFormat.name, DatetimeFormat);
    }
    app.directive("t", vTDirective(i18n2));
  }
  const VUE_I18N_COMPONENT_TYPES = "vue-i18n: composer properties";
  let devtoolsApi;
  async function enableDevTools(app, i18n2) {
    return new Promise((resolve, reject) => {
      try {
        setupDevtoolsPlugin({
          id: "vue-devtools-plugin-vue-i18n",
          label: VueDevToolsLabels[
            "vue-devtools-plugin-vue-i18n"
            /* PLUGIN */
          ],
          packageName: "vue-i18n",
          homepage: "https://vue-i18n.intlify.dev",
          logo: "https://vue-i18n.intlify.dev/vue-i18n-devtools-logo.png",
          componentStateTypes: [VUE_I18N_COMPONENT_TYPES],
          app
        }, (api) => {
          devtoolsApi = api;
          api.on.visitComponentTree(({ componentInstance, treeNode }) => {
            updateComponentTreeTags(componentInstance, treeNode, i18n2);
          });
          api.on.inspectComponent(({ componentInstance, instanceData }) => {
            if (componentInstance.vnode.el.__VUE_I18N__ && instanceData) {
              if (i18n2.mode === "legacy") {
                if (componentInstance.vnode.el.__VUE_I18N__ !== i18n2.global.__composer) {
                  inspectComposer(instanceData, componentInstance.vnode.el.__VUE_I18N__);
                }
              } else {
                inspectComposer(instanceData, componentInstance.vnode.el.__VUE_I18N__);
              }
            }
          });
          api.addInspector({
            id: "vue-i18n-resource-inspector",
            label: VueDevToolsLabels[
              "vue-i18n-resource-inspector"
              /* CUSTOM_INSPECTOR */
            ],
            icon: "language",
            treeFilterPlaceholder: VueDevToolsPlaceholders[
              "vue-i18n-resource-inspector"
              /* CUSTOM_INSPECTOR */
            ]
          });
          api.on.getInspectorTree((payload) => {
            if (payload.app === app && payload.inspectorId === "vue-i18n-resource-inspector") {
              registerScope(payload, i18n2);
            }
          });
          api.on.getInspectorState((payload) => {
            if (payload.app === app && payload.inspectorId === "vue-i18n-resource-inspector") {
              inspectScope(payload, i18n2);
            }
          });
          api.on.editInspectorState((payload) => {
            if (payload.app === app && payload.inspectorId === "vue-i18n-resource-inspector") {
              editScope(payload, i18n2);
            }
          });
          api.addTimelineLayer({
            id: "vue-i18n-timeline",
            label: VueDevToolsLabels[
              "vue-i18n-timeline"
              /* TIMELINE */
            ],
            color: VueDevToolsTimelineColors[
              "vue-i18n-timeline"
              /* TIMELINE */
            ]
          });
          resolve(true);
        });
      } catch (e) {
        console.error(e);
        reject(false);
      }
    });
  }
  function updateComponentTreeTags(instance, treeNode, i18n2) {
    const global2 = i18n2.mode === "composition" ? i18n2.global : i18n2.global.__composer;
    if (instance && instance.vnode.el.__VUE_I18N__) {
      if (instance.vnode.el.__VUE_I18N__ !== global2) {
        const label = instance.type.name || instance.type.displayName || instance.type.__file;
        const tag = {
          label: `i18n (${label} Scope)`,
          textColor: 0,
          backgroundColor: 16764185
        };
        treeNode.tags.push(tag);
      }
    }
  }
  function inspectComposer(instanceData, composer) {
    const type = VUE_I18N_COMPONENT_TYPES;
    instanceData.state.push({
      type,
      key: "locale",
      editable: true,
      value: composer.locale.value
    });
    instanceData.state.push({
      type,
      key: "availableLocales",
      editable: false,
      value: composer.availableLocales
    });
    instanceData.state.push({
      type,
      key: "fallbackLocale",
      editable: true,
      value: composer.fallbackLocale.value
    });
    instanceData.state.push({
      type,
      key: "inheritLocale",
      editable: true,
      value: composer.inheritLocale
    });
    instanceData.state.push({
      type,
      key: "messages",
      editable: false,
      value: getLocaleMessageValue(composer.messages.value)
    });
    instanceData.state.push({
      type,
      key: "datetimeFormats",
      editable: false,
      value: composer.datetimeFormats.value
    });
    instanceData.state.push({
      type,
      key: "numberFormats",
      editable: false,
      value: composer.numberFormats.value
    });
  }
  function getLocaleMessageValue(messages2) {
    const value = {};
    Object.keys(messages2).forEach((key) => {
      const v2 = messages2[key];
      if (isFunction(v2) && "source" in v2) {
        value[key] = getMessageFunctionDetails(v2);
      } else if (isObject$1(v2)) {
        value[key] = getLocaleMessageValue(v2);
      } else {
        value[key] = v2;
      }
    });
    return value;
  }
  const ESC = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "&": "&amp;"
  };
  function escape$1(s2) {
    return s2.replace(/[<>"&]/g, escapeChar);
  }
  function escapeChar(a2) {
    return ESC[a2] || a2;
  }
  function getMessageFunctionDetails(func) {
    const argString = func.source ? `("${escape$1(func.source)}")` : `(?)`;
    return {
      _custom: {
        type: "function",
        display: `<span>ƒ</span> ${argString}`
      }
    };
  }
  function registerScope(payload, i18n2) {
    payload.rootNodes.push({
      id: "global",
      label: "Global Scope"
    });
    const global2 = i18n2.mode === "composition" ? i18n2.global : i18n2.global.__composer;
    for (const [keyInstance, instance] of i18n2.__instances) {
      const composer = i18n2.mode === "composition" ? instance : instance.__composer;
      if (global2 === composer) {
        continue;
      }
      const label = keyInstance.type.name || keyInstance.type.displayName || keyInstance.type.__file;
      payload.rootNodes.push({
        id: composer.id.toString(),
        label: `${label} Scope`
      });
    }
  }
  function getComposer$1(nodeId, i18n2) {
    if (nodeId === "global") {
      return i18n2.mode === "composition" ? i18n2.global : i18n2.global.__composer;
    } else {
      const instance = Array.from(i18n2.__instances.values()).find((item) => item.id.toString() === nodeId);
      if (instance) {
        return i18n2.mode === "composition" ? instance : instance.__composer;
      } else {
        return null;
      }
    }
  }
  function inspectScope(payload, i18n2) {
    const composer = getComposer$1(payload.nodeId, i18n2);
    if (composer) {
      payload.state = makeScopeInspectState(composer);
    }
  }
  function makeScopeInspectState(composer) {
    const state = {};
    const localeType = "Locale related info";
    const localeStates = [
      {
        type: localeType,
        key: "locale",
        editable: true,
        value: composer.locale.value
      },
      {
        type: localeType,
        key: "fallbackLocale",
        editable: true,
        value: composer.fallbackLocale.value
      },
      {
        type: localeType,
        key: "availableLocales",
        editable: false,
        value: composer.availableLocales
      },
      {
        type: localeType,
        key: "inheritLocale",
        editable: true,
        value: composer.inheritLocale
      }
    ];
    state[localeType] = localeStates;
    const localeMessagesType = "Locale messages info";
    const localeMessagesStates = [
      {
        type: localeMessagesType,
        key: "messages",
        editable: false,
        value: getLocaleMessageValue(composer.messages.value)
      }
    ];
    state[localeMessagesType] = localeMessagesStates;
    const datetimeFormatsType = "Datetime formats info";
    const datetimeFormatsStates = [
      {
        type: datetimeFormatsType,
        key: "datetimeFormats",
        editable: false,
        value: composer.datetimeFormats.value
      }
    ];
    state[datetimeFormatsType] = datetimeFormatsStates;
    const numberFormatsType = "Datetime formats info";
    const numberFormatsStates = [
      {
        type: numberFormatsType,
        key: "numberFormats",
        editable: false,
        value: composer.numberFormats.value
      }
    ];
    state[numberFormatsType] = numberFormatsStates;
    return state;
  }
  function addTimelineEvent(event, payload) {
    if (devtoolsApi) {
      let groupId;
      if (payload && "groupId" in payload) {
        groupId = payload.groupId;
        delete payload.groupId;
      }
      devtoolsApi.addTimelineEvent({
        layerId: "vue-i18n-timeline",
        event: {
          title: event,
          groupId,
          time: Date.now(),
          meta: {},
          data: payload || {},
          logType: event === "compile-error" ? "error" : event === "fallback" || event === "missing" ? "warning" : "default"
        }
      });
    }
  }
  function editScope(payload, i18n2) {
    const composer = getComposer$1(payload.nodeId, i18n2);
    if (composer) {
      const [field] = payload.path;
      if (field === "locale" && isString(payload.state.value)) {
        composer.locale.value = payload.state.value;
      } else if (field === "fallbackLocale" && (isString(payload.state.value) || isArray(payload.state.value) || isObject$1(payload.state.value))) {
        composer.fallbackLocale.value = payload.state.value;
      } else if (field === "inheritLocale" && isBoolean(payload.state.value)) {
        composer.inheritLocale = payload.state.value;
      }
    }
  }
  function defineMixin(vuei18n, composer, i18n2) {
    return {
      beforeCreate() {
        const instance = vue.getCurrentInstance();
        if (!instance) {
          throw createI18nError(
            22
            /* UNEXPECTED_ERROR */
          );
        }
        const options = this.$options;
        if (options.i18n) {
          const optionsI18n = options.i18n;
          if (options.__i18n) {
            optionsI18n.__i18n = options.__i18n;
          }
          optionsI18n.__root = composer;
          if (this === this.$root) {
            this.$i18n = mergeToRoot(vuei18n, optionsI18n);
          } else {
            optionsI18n.__injectWithOption = true;
            this.$i18n = createVueI18n(optionsI18n);
          }
        } else if (options.__i18n) {
          if (this === this.$root) {
            this.$i18n = mergeToRoot(vuei18n, options);
          } else {
            this.$i18n = createVueI18n({
              __i18n: options.__i18n,
              __injectWithOption: true,
              __root: composer
            });
          }
        } else {
          this.$i18n = vuei18n;
        }
        vuei18n.__onComponentInstanceCreated(this.$i18n);
        i18n2.__setInstance(instance, this.$i18n);
        this.$t = (...args) => this.$i18n.t(...args);
        this.$rt = (...args) => this.$i18n.rt(...args);
        this.$tc = (...args) => this.$i18n.tc(...args);
        this.$te = (key, locale) => this.$i18n.te(key, locale);
        this.$d = (...args) => this.$i18n.d(...args);
        this.$n = (...args) => this.$i18n.n(...args);
        this.$tm = (key) => this.$i18n.tm(key);
      },
      mounted() {
        {
          this.$el.__VUE_I18N__ = this.$i18n.__composer;
          const emitter = this.__v_emitter = createEmitter();
          const _vueI18n = this.$i18n;
          _vueI18n.__enableEmitter && _vueI18n.__enableEmitter(emitter);
          emitter.on("*", addTimelineEvent);
        }
      },
      beforeUnmount() {
        const instance = vue.getCurrentInstance();
        if (!instance) {
          throw createI18nError(
            22
            /* UNEXPECTED_ERROR */
          );
        }
        {
          if (this.__v_emitter) {
            this.__v_emitter.off("*", addTimelineEvent);
            delete this.__v_emitter;
          }
          const _vueI18n = this.$i18n;
          _vueI18n.__disableEmitter && _vueI18n.__disableEmitter();
          delete this.$el.__VUE_I18N__;
        }
        delete this.$t;
        delete this.$rt;
        delete this.$tc;
        delete this.$te;
        delete this.$d;
        delete this.$n;
        delete this.$tm;
        i18n2.__deleteInstance(instance);
        delete this.$i18n;
      }
    };
  }
  function mergeToRoot(root, options) {
    root.locale = options.locale || root.locale;
    root.fallbackLocale = options.fallbackLocale || root.fallbackLocale;
    root.missing = options.missing || root.missing;
    root.silentTranslationWarn = options.silentTranslationWarn || root.silentFallbackWarn;
    root.silentFallbackWarn = options.silentFallbackWarn || root.silentFallbackWarn;
    root.formatFallbackMessages = options.formatFallbackMessages || root.formatFallbackMessages;
    root.postTranslation = options.postTranslation || root.postTranslation;
    root.warnHtmlInMessage = options.warnHtmlInMessage || root.warnHtmlInMessage;
    root.escapeParameterHtml = options.escapeParameterHtml || root.escapeParameterHtml;
    root.sync = options.sync || root.sync;
    root.__composer[SetPluralRulesSymbol](options.pluralizationRules || root.pluralizationRules);
    const messages2 = getLocaleMessages(root.locale, {
      messages: options.messages,
      __i18n: options.__i18n
    });
    Object.keys(messages2).forEach((locale) => root.mergeLocaleMessage(locale, messages2[locale]));
    if (options.datetimeFormats) {
      Object.keys(options.datetimeFormats).forEach((locale) => root.mergeDateTimeFormat(locale, options.datetimeFormats[locale]));
    }
    if (options.numberFormats) {
      Object.keys(options.numberFormats).forEach((locale) => root.mergeNumberFormat(locale, options.numberFormats[locale]));
    }
    return root;
  }
  function createI18n(options = {}) {
    const __legacyMode = isBoolean(options.legacy) ? options.legacy : true;
    const __globalInjection = !!options.globalInjection;
    const __instances = /* @__PURE__ */ new Map();
    const __global = __legacyMode ? createVueI18n(options) : createComposer(options);
    const symbol = makeSymbol("vue-i18n");
    const i18n2 = {
      // mode
      get mode() {
        return __legacyMode ? "legacy" : "composition";
      },
      // install plugin
      async install(app, ...options2) {
        {
          app.__VUE_I18N__ = i18n2;
        }
        app.__VUE_I18N_SYMBOL__ = symbol;
        app.provide(app.__VUE_I18N_SYMBOL__, i18n2);
        if (!__legacyMode && __globalInjection) {
          injectGlobalFields(app, i18n2.global);
        }
        {
          apply(app, i18n2, ...options2);
        }
        if (__legacyMode) {
          app.mixin(defineMixin(__global, __global.__composer, i18n2));
        }
        {
          const ret = await enableDevTools(app, i18n2);
          if (!ret) {
            throw createI18nError(
              21
              /* CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN */
            );
          }
          const emitter = createEmitter();
          if (__legacyMode) {
            const _vueI18n = __global;
            _vueI18n.__enableEmitter && _vueI18n.__enableEmitter(emitter);
          } else {
            const _composer = __global;
            _composer[EnableEmitter] && _composer[EnableEmitter](emitter);
          }
          emitter.on("*", addTimelineEvent);
        }
      },
      // global accessor
      get global() {
        return __global;
      },
      // @internal
      __instances,
      // @internal
      __getInstance(component) {
        return __instances.get(component) || null;
      },
      // @internal
      __setInstance(component, instance) {
        __instances.set(component, instance);
      },
      // @internal
      __deleteInstance(component) {
        __instances.delete(component);
      }
    };
    return i18n2;
  }
  function useI18n(options = {}) {
    const instance = vue.getCurrentInstance();
    if (instance == null) {
      throw createI18nError(
        16
        /* MUST_BE_CALL_SETUP_TOP */
      );
    }
    if (!instance.appContext.app.__VUE_I18N_SYMBOL__) {
      throw createI18nError(
        17
        /* NOT_INSLALLED */
      );
    }
    const i18n2 = vue.inject(instance.appContext.app.__VUE_I18N_SYMBOL__);
    if (!i18n2) {
      throw createI18nError(
        22
        /* UNEXPECTED_ERROR */
      );
    }
    const global2 = i18n2.mode === "composition" ? i18n2.global : i18n2.global.__composer;
    const scope = isEmptyObject(options) ? "__i18n" in instance.type ? "local" : "global" : !options.useScope ? "local" : options.useScope;
    if (scope === "global") {
      let messages2 = isObject$1(options.messages) ? options.messages : {};
      if ("__i18nGlobal" in instance.type) {
        messages2 = getLocaleMessages(global2.locale.value, {
          messages: messages2,
          __i18n: instance.type.__i18nGlobal
        });
      }
      const locales = Object.keys(messages2);
      if (locales.length) {
        locales.forEach((locale) => {
          global2.mergeLocaleMessage(locale, messages2[locale]);
        });
      }
      if (isObject$1(options.datetimeFormats)) {
        const locales2 = Object.keys(options.datetimeFormats);
        if (locales2.length) {
          locales2.forEach((locale) => {
            global2.mergeDateTimeFormat(locale, options.datetimeFormats[locale]);
          });
        }
      }
      if (isObject$1(options.numberFormats)) {
        const locales2 = Object.keys(options.numberFormats);
        if (locales2.length) {
          locales2.forEach((locale) => {
            global2.mergeNumberFormat(locale, options.numberFormats[locale]);
          });
        }
      }
      return global2;
    }
    if (scope === "parent") {
      let composer2 = getComposer(i18n2, instance, options.__useComponent);
      if (composer2 == null) {
        {
          warn(getWarnMessage(
            12
            /* NOT_FOUND_PARENT_SCOPE */
          ));
        }
        composer2 = global2;
      }
      return composer2;
    }
    if (i18n2.mode === "legacy") {
      throw createI18nError(
        18
        /* NOT_AVAILABLE_IN_LEGACY_MODE */
      );
    }
    const i18nInternal = i18n2;
    let composer = i18nInternal.__getInstance(instance);
    if (composer == null) {
      const type = instance.type;
      const composerOptions = assign({}, options);
      if (type.__i18n) {
        composerOptions.__i18n = type.__i18n;
      }
      if (global2) {
        composerOptions.__root = global2;
      }
      composer = createComposer(composerOptions);
      setupLifeCycle(i18nInternal, instance, composer);
      i18nInternal.__setInstance(instance, composer);
    }
    return composer;
  }
  function getComposer(i18n2, target, useComponent = false) {
    let composer = null;
    const root = target.root;
    let current = target.parent;
    while (current != null) {
      const i18nInternal = i18n2;
      if (i18n2.mode === "composition") {
        composer = i18nInternal.__getInstance(current);
      } else {
        const vueI18n = i18nInternal.__getInstance(current);
        if (vueI18n != null) {
          composer = vueI18n.__composer;
        }
        if (useComponent && composer && !composer[InejctWithOption]) {
          composer = null;
        }
      }
      if (composer != null) {
        break;
      }
      if (root === current) {
        break;
      }
      current = current.parent;
    }
    return composer;
  }
  function setupLifeCycle(i18n2, target, composer) {
    let emitter = null;
    vue.onMounted(() => {
      if (target.vnode.el) {
        target.vnode.el.__VUE_I18N__ = composer;
        emitter = createEmitter();
        const _composer = composer;
        _composer[EnableEmitter] && _composer[EnableEmitter](emitter);
        emitter.on("*", addTimelineEvent);
      }
    }, target);
    vue.onUnmounted(() => {
      if (target.vnode.el && target.vnode.el.__VUE_I18N__) {
        emitter && emitter.off("*", addTimelineEvent);
        const _composer = composer;
        _composer[DisableEmitter] && _composer[DisableEmitter]();
        delete target.vnode.el.__VUE_I18N__;
      }
      i18n2.__deleteInstance(target);
    }, target);
  }
  const globalExportProps = [
    "locale",
    "fallbackLocale",
    "availableLocales"
  ];
  const globalExportMethods = ["t", "rt", "d", "n", "tm"];
  function injectGlobalFields(app, composer) {
    const i18n2 = /* @__PURE__ */ Object.create(null);
    globalExportProps.forEach((prop) => {
      const desc = Object.getOwnPropertyDescriptor(composer, prop);
      if (!desc) {
        throw createI18nError(
          22
          /* UNEXPECTED_ERROR */
        );
      }
      const wrap = vue.isRef(desc.value) ? {
        get() {
          return desc.value.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(val) {
          desc.value.value = val;
        }
      } : {
        get() {
          return desc.get && desc.get();
        }
      };
      Object.defineProperty(i18n2, prop, wrap);
    });
    app.config.globalProperties.$i18n = i18n2;
    globalExportMethods.forEach((method) => {
      const desc = Object.getOwnPropertyDescriptor(composer, method);
      if (!desc || !desc.value) {
        throw createI18nError(
          22
          /* UNEXPECTED_ERROR */
        );
      }
      Object.defineProperty(app.config.globalProperties, `$${method}`, desc);
    });
  }
  {
    initFeatureFlags();
  }
  {
    const target = getGlobalThis();
    target.__INTLIFY__ = true;
    setDevToolsHook(target.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__);
  }
  const messages = {
    "zh": {
      "message": {
        "meeting": "会议室",
        "meeting_theme": "会议主题",
        "booker": "预定人",
        "in_meeting": "会 议 中",
        "no_meeting": "空 闲 中",
        "upcoming_meetings": "即将开始",
        "alert_code": "请输入内置码",
        "sure": "确定",
        "booked": "已预定",
        "over_meeting": "已结束",
        "small_in_meeting": "会议中",
        "alert_error_code": "请输入正确的内置码"
      }
    },
    "en": {
      "message": {
        "meeting": "Room",
        "meeting_theme": "Conference Theme",
        "booker": "Booker",
        "in_meeting": "Meeting",
        "no_meeting": "IDLE",
        "upcoming_meetings": "Upcoming Meetings",
        "alert_code": "Please enter the built-in code",
        "sure": "Sure",
        "booked": "Booked",
        "over_meeting": "Over",
        "small_in_meeting": "Meeting",
        "alert_error_code": "Please enter the correct built-in code"
      }
    },
    "ko": {
      "message": {
        "meeting": "회의실",
        "meeting_theme": "컨퍼런스 주제",
        "booker": "부커",
        "in_meeting": "회 의 중",
        "no_meeting": "게 으 른",
        "upcoming_meetings": "곧 시작됩니다",
        "alert_code": "내장코드를 입력해주세요",
        "sure": "확신하는",
        "booked": "이미 예약됨",
        "over_meeting": "~ 위에",
        "small_in_meeting": "회의 중",
        "alert_error_code": "올바른 내장 코드를 입력하세요."
      }
    }
  };
  const i18n = createI18n({
    locale: "zh",
    // fallbackLocale: 'zh',
    messages
  });
  function createApp() {
    const app = vue.createVueApp(App);
    app.use(i18n);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue, uni.VueShared);
