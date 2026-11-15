"use strict";
(self.webpackChunkopen_fda_gov = self.webpackChunkopen_fda_gov || []).push([
  [6053],
  {
    69833: function (e) {
      e.exports = JSON.parse(
        '{"documentTitle":"openFDA › Drugs › Recall enforcement reports API","label":"Drug recall enforcement reports","title":"Drug Recall Enforcement Reports","description":"Recalls are an appropriate alternative method for removing or correcting marketed consumer products, their labeling, and/or promotional literature that violate the laws administered by the Food and Drug Administration (FDA).","datasets":["RES"],"path":"/apis/drug/enforcement","api_path":"/drug/enforcement","start":20090101,"status":"drugenforcement","dateConstraintKey":"termination_date","type":"endpoint"}',
      );
    },
    81157: function (e, t, r) {
      (r.r(t),
        r.d(t, {
          default: function () {
            return v;
          },
        }));
      var a = r(96540),
        o = r(22033),
        n = r(91055),
        i = r(18671),
        l = r(30632),
        s = r(98444),
        c = JSON.parse(
          '{"globalDefs":{"startYear":2012,"api":"/drug/enforcement","apiName":"Reports","font":{"color":"#000000","fontFamily":"Merriweather,Georgia,serif"},"tooltip":{"fontSize":"11px","font":"Merriweather,Georgia,serif"},"pieChartConfig":{"fill":"#8884d8","colors":["#0088FE","#1ECFFF","#00C49F","#FFBB28","#d62728"]},"lineChartConfig":{"chartRow":{"height":200,"trackerInfoWidth":130},"chartContainer":{"width":700,"showGrid":true,"format":"year","timeAxisStyle":{"labels":{"labelColor":"black","labelWeight":150,"labelSize":13},"axis":{"axisColor":"grey","axisWidth":1}}},"yAxis":{"label":"Number of Drug Reports","min":0,"width":70,"type":"linear","labelOffset":0,"style":{"labelFont":"Merriweather,Georgia,serif","labels":{"labelColor":"#000000","labelWeight":150,"labelSize":11},"axis":{"axisColor":"#000000"}}},"lineChart":{"interpolation":"curveMonotoneX"},"colors":["#1f77b4","#00d899","#ff3300","#2ca02c","#ff7f0e","#006666","#990099","#9467bd","#c5b0d5","#ff33cc","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5","#00008B"],"eventMarker":{"infoTimeFormat":"%m-%Y","markerRadius":0,"markerStyle":{"fill":"black"},"infoWidth":175,"infoStyle":{"fill":"white","opacity":0.9,"stroke":"#0000","pointerEvents":"none"},"markerLabelStyle":{"fill":"#000000"}}}},"choices":[{"type":"PieChart","title":"<i><i class=\'datamap-infographic-header-text-bold\'>Drug Enforcement Report</i> by Classification</i>","subtitle":"Drug Enforcement Reports","yTitle":"Drugs","xTitle":"","selectionPostFix":" ","countBy":"classification.exact","dateField":"report_date","subfield":"state.exact","subfieldLabel":"State","pieChartCategoryName":"Classification","pieChartApiName":"Drug Enforcement Reports","lineLimiter":100,"defs":{"Class II":"Class II","Class I":"Class I","Class III":"Class III","Not Yet Classified":"Unclassified"},"dataFunction":"_getAllData","xLegendCoordinate":-30,"excludedTerms":[""],"pieChartConfig":{"default":{"id":"Class I","index":2},"radius":{"cx":305,"cy":200,"innerRadius":60,"outerRadius":80},"textLabel":["Percentage","by Class"],"width":450,"widthReset":365,"height":450,"viewBox":"90 100 540 510","margin":{"top":5,"right":5,"bottom":5,"left":0}}}]}',
        ),
        u = r(69833);
      function d(e) {
        return (
          (d =
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
          d(e)
        );
      }
      function f(e, t) {
        for (var r = 0; r < t.length; r++) {
          var a = t[r];
          ((a.enumerable = a.enumerable || !1),
            (a.configurable = !0),
            "value" in a && (a.writable = !0),
            Object.defineProperty(e, p(a.key), a));
        }
      }
      function p(e) {
        var t = (function (e, t) {
          if ("object" != d(e) || !e) return e;
          var r = e[Symbol.toPrimitive];
          if (void 0 !== r) {
            var a = r.call(e, t || "default");
            if ("object" != d(a)) return a;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === t ? String : Number)(e);
        })(e, "string");
        return "symbol" == d(t) ? t : t + "";
      }
      function m(e, t, r) {
        return (
          (t = b(t)),
          (function (e, t) {
            if (t && ("object" == d(t) || "function" == typeof t)) return t;
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
            h()
              ? Reflect.construct(t, r || [], b(e).constructor)
              : t.apply(e, r),
          )
        );
      }
      function h() {
        try {
          var e = !Boolean.prototype.valueOf.call(
            Reflect.construct(Boolean, [], function () {}),
          );
        } catch (e) {}
        return (h = function () {
          return !!e;
        })();
      }
      function b(e) {
        return (
          (b = Object.setPrototypeOf
            ? Object.getPrototypeOf.bind()
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              }),
          b(e)
        );
      }
      function y(e, t) {
        return (
          (y = Object.setPrototypeOf
            ? Object.setPrototypeOf.bind()
            : function (e, t) {
                return ((e.__proto__ = t), e);
              }),
          y(e, t)
        );
      }
      var g = (function (e) {
          function t() {
            return (
              (function (e, t) {
                if (!(e instanceof t))
                  throw new TypeError("Cannot call a class as a function");
              })(this, t),
              m(this, t, arguments)
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
                t && y(e, t));
            })(t, e),
            (r = t),
            (d = [
              {
                key: "render",
                value: function () {
                  return a.createElement(
                    "section",
                    { className: "doc-content" },
                    a.createElement("h2", null, "Drug Enforcement Overview"),
                    a.createElement(
                      "p",
                      null,
                      "The openFDA drug enforcement reports API returns data from the ",
                      a.createElement(
                        o.Ay,
                        { to: "/data/res/" },
                        "FDA Recall Enterprise System (RES)",
                      ),
                      ", a database that contains information on recall event information submitted to FDA. Currently, this data covers publicly releasable records from 2004-present. The data is updated weekly.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "The procedures followed to input recall information into RES when FDA learns of a recall event are outlined in ",
                      a.createElement(
                        "a",
                        {
                          href: "https://www.fda.gov/downloads/ICECI/ComplianceManuals/RegulatoryProceduresManual/UCM074312.pdf",
                        },
                        "Chapter 7 of FDA’s Regulatory Procedure Manual",
                      ),
                      " The Regulatory Procedures Manual is a reference manual for FDA personnel. It provides FDA personnel with information on internal procedures to be used in processing domestic and import regulatory and enforcement matters.",
                    ),
                    a.createElement(i.A, {
                      infographicDefinitions: c,
                      meta: u,
                    }),
                    a.createElement(n.A, {
                      noun_name: u.api_path.split("/")[1],
                      endpoint_name: u.api_path.split("/")[2],
                      harmonized: !0,
                      status: u.status,
                    }),
                    a.createElement("h3", null, "Fields Harmonization"),
                    a.createElement(
                      "p",
                      null,
                      "Different datasets use different unique identifiers, which can make it difficult to find the same drug in each dataset.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "openFDA features harmonization on specific identifiers to make it easier to both search for and understand the drug products returned by API queries. These additional fields are attached to records in all categories, if applicable.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "Review the chart below to better understand which fields are harmonized.",
                    ),
                    a.createElement(l.A, {
                      master_harmonization: s,
                      selected_noun: "drug",
                    }),
                    a.createElement(
                      "h3",
                      null,
                      "Additional Information About Drug Recall Enforcement Reports",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "When an FDA-regulated product is either defective or potentially harmful, recalling that product—removing it from the market or correcting the problem—is the most effective means for protecting the public.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "Recalls are almost always voluntary, meaning a company discovers a problem and recalls a product on its own. Other times a company recalls a product after FDA raises concerns. Only in rare cases will FDA request or order a recall. But in every case, FDA's role is to oversee a company's strategy, classify the recalled products according to the level of hazard involved, and assess the adequacy of the recall. Recall information is posted in the Enforcement Reports once the products are classified.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "Recalls are an appropriate alternative method for removing or correcting marketed consumer products, their labeling, and/or promotional literature that violate the laws administered by the Food and Drug Administration (FDA). Recalls afford equal consumer protection but generally are more efficient and timely than formal administrative or civil actions, especially when the product has been widely distributed.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "An enforcement report contains information on actions taken in connection with FDA regulatory activities. The data served by this API endpoint includes enforcement reports about drug product recalls.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "Whereas not all recalls are announced in the media or on FDA’s Recalls press release page, all recalls monitored by FDA are included in FDA’s weekly Enforcement Report once they are classified according to the level of hazard involved.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "Manufacturers and/or distributors may initiate a recall at any time to fulfill their responsibility to protect the public health from products that present a risk of injury or gross deception, or are otherwise defective. Firms may also initiate a recall following notification of a problem by FDA or a state agency, in response to a formal request by FDA, or as ordered by FDA.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "When necessary, the FDA will make corrections or changes to recall information previously disclosed in a past Enforcement Report for various reasons. For instance, the firm may discover that the initial recall should be expanded to include more batches or lots of the same recalled product than formerly reported.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "To read more about Drug Recall Enforcement Reporting, please visit:",
                    ),
                    a.createElement(
                      "ul",
                      null,
                      a.createElement(
                        "li",
                        null,
                        a.createElement(
                          "a",
                          {
                            href: "https://www.fda.gov/ForConsumers/ConsumerUpdates/ucm049070.htm",
                          },
                          "FDA 101: Product Recalls from First Alert to Effectiveness Checks",
                        ),
                      ),
                      a.createElement(
                        "li",
                        null,
                        a.createElement(
                          o.Ay,
                          { to: "/data/res/" },
                          "FDA’s RES database",
                        ),
                      ),
                      a.createElement(
                        "li",
                        null,
                        a.createElement(
                          "a",
                          {
                            href: "http://www.fda.gov/Safety/recalls/default.htm",
                          },
                          "FDA’s Recalls press release page",
                        ),
                      ),
                      a.createElement(
                        "li",
                        null,
                        a.createElement(
                          "a",
                          {
                            href: "https://www.fda.gov/Safety/recalls-market-withdrawals-safety-alerts/enforcement-reports",
                          },
                          "FDA’s weekly Enforcement Report",
                        ),
                      ),
                    ),
                    a.createElement("h3", null, "Responsible use of the data"),
                    a.createElement(
                      "p",
                      null,
                      "Do not rely on openFDA to make decisions regarding medical care. Always speak to your health provider about the risks and benefits of FDA-regulated products. We may limit or otherwise restrict your access to the API in line with our ",
                      a.createElement(
                        o.Ay,
                        { to: "/terms/" },
                        "Terms of Service",
                      ),
                    ),
                    a.createElement("h3", null, "Disclaimer"),
                    a.createElement(
                      "p",
                      null,
                      "This data should not be used as a method to collect data to issue alerts to the public, nor should it be used to track the lifecycle of a recall. FDA seeks publicity about a recall only when it believes the public needs to be alerted to a serious hazard. FDA works with industry and our state partners to publish press releases and other public notices about recalls that may potentially present a significant or serious risk to the consumer or user of the product.",
                    ),
                    a.createElement(
                      "p",
                      null,
                      "Further, FDA does not update the status of a recall after the recall has been classified according to its level of hazard. As such, the status of a recall (open, completed, or terminated) will remain unchanged after published in the Enforcement Reports.",
                    ),
                  );
                },
              },
            ]) && f(r.prototype, d),
            p && f(r, p),
            Object.defineProperty(r, "prototype", { writable: !1 }),
            r
          );
          var r, d, p;
        })(a.Component),
        v = g;
    },
  },
]);
//# sourceMappingURL=component---src-pages-apis-drug-enforcement-index-tsx-67060cbef7c5d70ae18b.js.map
