"use strict";
(self.webpackChunkopen_fda_gov = self.webpackChunkopen_fda_gov || []).push([
  [2834],
  {
    20482: function (e) {
      e.exports = JSON.parse(
        '{"documentTitle":"openFDA › Drugs › Orange Book","label":"Orange Book","title":"Orange Book","description":"The publication Approved Drug Products with Therapeutic Equivalence Evaluations (commonly known as the Orange Book) identifies drug products approved on the basis of safety and effectiveness by the Food and Drug Administration (FDA) under the Federal Food, Drug, and Cosmetic Act (the Act) and related patent and exclusivity information.","datasets":["Orange Book"],"path":"/apis/drug/orangebook","api_path":"/drug/orangebook","start":20000101,"status":"drugorangebook","dateConstraintKey":"approval_date","type":"endpoint"}',
      );
    },
    29651: function (e, t, n) {
      n.r(t);
      var o = n(96540),
        r = n(22033),
        a = n(91055),
        i = n(20482);
      function s(e) {
        return (
          (s =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          s(e)
        );
      }
      function c(e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n];
          ((o.enumerable = o.enumerable || !1),
            (o.configurable = !0),
            "value" in o && (o.writable = !0),
            Object.defineProperty(e, l(o.key), o));
        }
      }
      function l(e) {
        var t = (function (e, t) {
          if ("object" != s(e) || !e) return e;
          var n = e[Symbol.toPrimitive];
          if (void 0 !== n) {
            var o = n.call(e, t || "default");
            if ("object" != s(o)) return o;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === t ? String : Number)(e);
        })(e, "string");
        return "symbol" == s(t) ? t : t + "";
      }
      function u(e, t, n) {
        return (
          (t = p(t)),
          (function (e, t) {
            if (t && ("object" == s(t) || "function" == typeof t)) return t;
            if (void 0 !== t)
              throw new TypeError(
                "Derived constructors may only return object or undefined",
              );
            return (function (e) {
              if (void 0 === e)
                throw new ReferenceError(
                  "this hasn't been initialised - super() hasn't been called",
                );
              return e;
            })(e);
          })(
            e,
            d()
              ? Reflect.construct(t, n || [], p(e).constructor)
              : t.apply(e, n),
          )
        );
      }
      function d() {
        try {
          var e = !Boolean.prototype.valueOf.call(
            Reflect.construct(Boolean, [], function () {}),
          );
        } catch (e) {}
        return (d = function () {
          return !!e;
        })();
      }
      function p(e) {
        return (
          (p = Object.setPrototypeOf
            ? Object.getPrototypeOf.bind()
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              }),
          p(e)
        );
      }
      function f(e, t) {
        return (
          (f = Object.setPrototypeOf
            ? Object.setPrototypeOf.bind()
            : function (e, t) {
                return ((e.__proto__ = t), e);
              }),
          f(e, t)
        );
      }
      var m = (function (e) {
        function t() {
          return (
            (function (e, t) {
              if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function");
            })(this, t),
            u(this, t, arguments)
          );
        }
        return (
          (function (e, t) {
            if ("function" != typeof t && null !== t)
              throw new TypeError(
                "Super expression must either be null or a function",
              );
            ((e.prototype = Object.create(t && t.prototype, {
              constructor: { value: e, writable: !0, configurable: !0 },
            })),
              Object.defineProperty(e, "prototype", { writable: !1 }),
              t && f(e, t));
          })(t, e),
          (n = t),
          (s = [
            {
              key: "render",
              value: function () {
                return o.createElement(
                  "section",
                  { className: "doc-content" },
                  o.createElement("h2", null, "Drug Orange Book Overview"),
                  o.createElement(
                    "p",
                    null,
                    "The publication Approved Drug Products with Therapeutic Equivalence Evaluations (commonly known as the Orange Book) identifies drug products approved on the basis of safety and effectiveness by the Food and Drug Administration (FDA) under the Federal Food, Drug, and Cosmetic Act (the Act) and related patent and exclusivity information.",
                  ),
                  o.createElement(
                    "p",
                    null,
                    "The main criterion for the inclusion of any product is that the product is the subject of an application with an approval that has not been withdrawn for safety or efficacy reasons.",
                  ),
                  o.createElement(
                    "p",
                    null,
                    "Inclusion of products in the Orange Book is independent of any current regulatory action through administrative or judicial means against a drug product.  In addition, the Orange Book contains therapeutic equivalence evaluations for approved multisource prescription drug products.",
                  ),
                  o.createElement(a.A, {
                    noun_name: i.api_path.split("/")[1],
                    endpoint_name: i.api_path.split("/")[2],
                    status: i.status,
                  }),
                  o.createElement(
                    "h3",
                    null,
                    "Additional Information About Orange book",
                  ),
                  o.createElement(
                    "p",
                    null,
                    "To read more about Orange Book, please visit:",
                  ),
                  o.createElement(
                    "ul",
                    null,
                    o.createElement(
                      "li",
                      null,
                      o.createElement(
                        "a",
                        {
                          href: "https://www.fda.gov/drugs/drug-approvals-and-databases/approved-drug-products-therapeutic-equivalence-evaluations-orange-book",
                        },
                        "Orange Book",
                      ),
                    ),
                  ),
                  o.createElement("h3", null, "Responsible use of the data"),
                  o.createElement(
                    "p",
                    null,
                    "Do not rely on openFDA to make decisions regarding medical care. Always speak to your health provider about the risks and benefits of FDA-regulated products. We may limit or otherwise restrict your access to the Application Programming Interface in line with our ",
                    o.createElement(
                      r.Ay,
                      { to: "/terms/" },
                      "Terms of Service",
                    ),
                  ),
                );
              },
            },
          ]) && c(n.prototype, s),
          l && c(n, l),
          Object.defineProperty(n, "prototype", { writable: !1 }),
          n
        );
        var n, s, l;
      })(o.Component);
      t.default = m;
    },
    49583: function (e, t) {
      t.A = function (e, t) {
        var n = new XMLHttpRequest();
        (n.open("GET", e, !0),
          (n.onload = function () {
            return (
              n.status > 400 && console.error("bad request: ", n.status),
              t(JSON.parse(n.responseText))
            );
          }),
          n.send());
      };
    },
    79649: function (e, t, n) {
      n.d(t, {
        FZ: function () {
          return r;
        },
        Oi: function () {
          return o;
        },
      });
      var o = "https://api.fda.gov",
        r = "api.fda.gov";
    },
    91055: function (e, t, n) {
      var o = n(96540),
        r = n(22033),
        a = n(49583),
        i = n(79649);
      function s(e) {
        return (
          (s =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          s(e)
        );
      }
      function c(e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n];
          ((o.enumerable = o.enumerable || !1),
            (o.configurable = !0),
            "value" in o && (o.writable = !0),
            Object.defineProperty(e, l(o.key), o));
        }
      }
      function l(e) {
        var t = (function (e, t) {
          if ("object" != s(e) || !e) return e;
          var n = e[Symbol.toPrimitive];
          if (void 0 !== n) {
            var o = n.call(e, t || "default");
            if ("object" != s(o)) return o;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === t ? String : Number)(e);
        })(e, "string");
        return "symbol" == s(t) ? t : t + "";
      }
      function u(e, t, n) {
        return (
          (t = p(t)),
          (function (e, t) {
            if (t && ("object" == s(t) || "function" == typeof t)) return t;
            if (void 0 !== t)
              throw new TypeError(
                "Derived constructors may only return object or undefined",
              );
            return (function (e) {
              if (void 0 === e)
                throw new ReferenceError(
                  "this hasn't been initialised - super() hasn't been called",
                );
              return e;
            })(e);
          })(
            e,
            d()
              ? Reflect.construct(t, n || [], p(e).constructor)
              : t.apply(e, n),
          )
        );
      }
      function d() {
        try {
          var e = !Boolean.prototype.valueOf.call(
            Reflect.construct(Boolean, [], function () {}),
          );
        } catch (e) {}
        return (d = function () {
          return !!e;
        })();
      }
      function p(e) {
        return (
          (p = Object.setPrototypeOf
            ? Object.getPrototypeOf.bind()
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              }),
          p(e)
        );
      }
      function f(e, t) {
        return (
          (f = Object.setPrototypeOf
            ? Object.setPrototypeOf.bind()
            : function (e, t) {
                return ((e.__proto__ = t), e);
              }),
          f(e, t)
        );
      }
      var m = {
          animalandveterinary: { event: "Animal Drug Adverse Events (ADAE)" },
          food: {
            enforcement: "FDA Recall Enterprise System (RES)",
            event:
              "Center for Food Safety and Applied Nutrition Adverse Event Reporting System (CAERS)",
          },
          cosmetic: { event: "Cosmetic Adverse Events" },
          device: {
            event: "Manufacturer and User Facility Device Experience (MAUDE)",
            classification: "Product Classification Database",
            "510k": "510(k) Clearances",
            pma: "Premarket Approval (PMA) decisions",
            registrationlisting: "Registration and Listing",
            recall: "Medical Device Recalls",
            enforcement: "FDA Recall Enterprise System (RES)",
            udi: "Global Unique Device Identification Database (GUDID)",
            covid19serology:
              "Independent testing by US Government Laboratories",
          },
          drug: {
            event: "FDA Adverse Event Reporting System (FAERS)",
            label: "FDA SPL files",
            ndc: "NDC Directory",
            enforcement: "FDA Recall Enterprise System (RES)",
            orangebook:
              "Approved Drug Products with Therapeutic Equivalence Evaluations (Orange Book)",
            drugsfda: "Drugs@FDA",
            shortages: "Drug Shortages",
          },
          other: {
            historicaldocument: "Historic FDA Press Releases",
            nsde: "NDC SPL Data Elements",
            substance: "Substance Data Reports",
            unii: "Unique Ingredient Identifiers",
          },
          tobacco: { problem: "Tobacco Problem Reports" },
          transparency: { crl: "Complete Response Letters" },
        },
        y = {
          animalandveterinary: { event: "/data/adae/" },
          food: { enforcement: "/data/res/", event: "/data/caers/" },
          cosmetic: {},
          device: {
            event: "/data/maude/",
            classification: "/data/product-classification/",
            "510k": "/data/510k/",
            pma: "/data/pma/",
            registrationlisting: "/data/registrationlisting/",
            recall: "/data/device-recall/",
            enforcement: "/data/res/",
          },
          drug: {
            event: "/data/faers/",
            label: "/data/spl/",
            ndc: "/data/ndc/",
            enforcement: "/data/res/",
            orangebook: "/data/orangebook/",
            drugsfda: "/data/drugsfda/",
            shortages: "/data/drugshortages",
          },
          other: {
            historicaldocument: "/data/historicaldocument/",
            nsde: "/apis/other/nsde/",
            substance: "/apis/other/substance/",
            unii: "/data/unii/",
          },
          tobacco: { problem: "/data/tobaccoproblem/" },
          transparency: {},
        },
        h = {
          animalandveterinary: { event: "1987 to" },
          food: { enforcement: "2004 to", event: "2004 to" },
          cosmetic: { event: "2001 to" },
          device: {
            event: "2009 to",
            classification: "1976 to",
            "510k": "1976 to",
            pma: "1976 to",
            registrationlisting: "2007 to",
            recall: "2002 to",
            enforcement: "2004 to",
            udi: "2013 to",
            covid19serology: "2020 to",
          },
          drug: {
            event:
              "Currently, this API includes publically releasable records submitted to the FDA through FAERS from 2004 to",
            label:
              "The bulk of the data is from June 2009 (when labeling was first posted publicly in the SPL format) to the present. However, there are a small number of records from earlier than mid-2009. The last update was on",
            ndc: "Last updated on",
            enforcement: "2004 to",
            orangebook: "Content current as of:",
            drugsfda: "1939 to",
            shortages: "2012 to",
          },
          other: {
            historicaldocument: "1913 to",
            nsde: "2009 to",
            substance: "Last updated",
            unii: "2006 to",
          },
          tobacco: { problem: "2017 to" },
          transparency: { crl: "2020-2024" },
        },
        v = {
          animalandveterinary: { event: "Quarterly" },
          food: { enforcement: "Weekly", event: "Quarterly" },
          cosmetic: { event: "Infrequently" },
          device: {
            event: "Weekly",
            classification: "Monthly",
            "510k": "Monthly",
            pma: "Monthly",
            registrationlisting: "Monthly",
            recall: "Weekly",
            enforcement: "Weekly",
            udi: "Weekly",
            covid19serology: "Monthly",
          },
          drug: {
            event:
              "Quarterly. However, please be advised that the data in this API may lag by 3 months or more at any given time, depending on when the quarterly FAERS data is released.",
            label: "Weekly",
            ndc: "Daily",
            enforcement: "Weekly",
            orangebook: "Monthly",
            drugsfda: "Daily (Monday-Friday)",
            shortages: "Daily",
          },
          other: {
            historicaldocument: "Infrequently",
            nsde: "Daily",
            substance: "Every few months",
            unii: "Daily",
          },
          tobacco: { problem: "Quarterly" },
          transparency: { crl: "Infrequently" },
        },
        b = (function (e) {
          function t(e) {
            var n;
            return (
              (function (e, t) {
                if (!(e instanceof t))
                  throw new TypeError("Cannot call a class as a function");
              })(this, t),
              ((n = u(this, t, [e])).state = { lastUpdated: null }),
              n
            );
          }
          return (
            (function (e, t) {
              if ("function" != typeof t && null !== t)
                throw new TypeError(
                  "Super expression must either be null or a function",
                );
              ((e.prototype = Object.create(t && t.prototype, {
                constructor: { value: e, writable: !0, configurable: !0 },
              })),
                Object.defineProperty(e, "prototype", { writable: !1 }),
                t && f(e, t));
            })(t, e),
            (n = t),
            (s = [
              {
                key: "componentDidMount",
                value: function () {
                  this._getStatus();
                },
              },
              {
                key: "_getStatus",
                value: function () {
                  var e = this;
                  (0, a.A)(i.Oi + "/status", function (t) {
                    var n = t.find(function (t) {
                      return t.endpoint === e.props.status;
                    }).last_updated;
                    (console.log(n), e.setState({ lastUpdated: n }));
                  });
                },
              },
              {
                key: "render",
                value: function () {
                  var e;
                  return o.createElement(
                    "section",
                    { className: "key-facts" },
                    o.createElement("h3", null, "Key Facts"),
                    o.createElement(
                      "ul",
                      null,
                      o.createElement(
                        "li",
                        null,
                        o.createElement("i", { className: "fa fa-database" }),
                        o.createElement(
                          "div",
                          { className: "label" },
                          "Source of the data:",
                        ),
                        o.createElement(
                          "div",
                          { className: "value" },
                          (null === (e = y[this.props.noun_name]) ||
                          void 0 === e
                            ? void 0
                            : e.hasOwnProperty(this.props.endpoint_name)) &&
                            o.createElement(
                              r.Ay,
                              {
                                to: y[this.props.noun_name][
                                  this.props.endpoint_name
                                ],
                              },
                              m[this.props.noun_name][this.props.endpoint_name],
                            ),
                          !y[this.props.noun_name].hasOwnProperty(
                            this.props.endpoint_name,
                          ) &&
                            m[this.props.noun_name][this.props.endpoint_name],
                        ),
                      ),
                      o.createElement(
                        "li",
                        null,
                        o.createElement("i", { className: "fa fa-edit" }),
                        o.createElement(
                          "div",
                          { className: "label" },
                          "Changes to the source data:",
                        ),
                        this.props.harmonized
                          ? o.createElement(
                              "div",
                              { className: "value" },
                              "openFDA annotates the original records with ",
                              o.createElement(
                                r.Ay,
                                {
                                  to: "/apis/"
                                    .concat(this.props.noun_name, "/")
                                    .concat(
                                      this.props.endpoint_name,
                                      "/searchable-fields/",
                                    ),
                                },
                                "special fields ",
                              ),
                              "and converts the data into JSON, which is a widely used machine readable format.",
                            )
                          : o.createElement(
                              "div",
                              { className: "value" },
                              "openFDA may change some ",
                              o.createElement(
                                r.Ay,
                                {
                                  to: "/apis/"
                                    .concat(this.props.noun_name, "/")
                                    .concat(
                                      this.props.endpoint_name,
                                      "/searchable-fields/",
                                    ),
                                },
                                "field names ",
                              ),
                              "and converts the data into JSON, which is a widely used machine readable format.",
                            ),
                      ),
                      o.createElement(
                        "li",
                        null,
                        o.createElement("i", { className: "fa fa-calendar" }),
                        o.createElement(
                          "div",
                          { className: "label" },
                          "Time period covered in this API:",
                        ),
                        o.createElement(
                          "div",
                          { className: "value" },
                          h[this.props.noun_name][this.props.endpoint_name] +
                            " " +
                            this.state.lastUpdated,
                        ),
                      ),
                      o.createElement(
                        "li",
                        null,
                        o.createElement("i", { className: "fa fa-refresh" }),
                        o.createElement(
                          "div",
                          { className: "label" },
                          "Frequency of API updates:",
                        ),
                        o.createElement(
                          "div",
                          { className: "value" },
                          v[this.props.noun_name][this.props.endpoint_name],
                        ),
                      ),
                    ),
                  );
                },
              },
            ]) && c(n.prototype, s),
            l && c(n, l),
            Object.defineProperty(n, "prototype", { writable: !1 }),
            n
          );
          var n, s, l;
        })(o.Component);
      ((b.displayName = "components/KeyFacts"), (t.A = b));
    },
  },
]);
//# sourceMappingURL=component---src-pages-apis-drug-orangebook-index-tsx-b04cbfb77eb4a7e451a5.js.map
