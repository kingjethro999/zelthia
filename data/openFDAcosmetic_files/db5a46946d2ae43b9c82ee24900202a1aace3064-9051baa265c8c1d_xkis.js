(self.webpackChunkopen_fda_gov = self.webpackChunkopen_fda_gov || []).push([
  [5165],
  {
    12058: function (e, a, t) {
      var n;
      !(function () {
        "use strict";
        var i,
          o,
          s,
          r =
            ((i =
              /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g),
            (o =
              /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g),
            (s = /[^-+\dA-Z]/g),
            function (e, a, t, n) {
              if (
                (1 !== arguments.length ||
                  "string" !==
                    (null === (l = e)
                      ? "null"
                      : void 0 === l
                        ? "undefined"
                        : "object" != typeof l
                          ? typeof l
                          : Array.isArray(l)
                            ? "array"
                            : {}.toString.call(l).slice(8, -1).toLowerCase()) ||
                  /\d/.test(e) ||
                  ((a = e), (e = void 0)),
                (e = e || new Date()) instanceof Date || (e = new Date(e)),
                isNaN(e))
              )
                throw TypeError("Invalid date");
              var l,
                c = (a = String(r.masks[a] || a || r.masks.default)).slice(
                  0,
                  4,
                );
              ("UTC:" !== c && "GMT:" !== c) ||
                ((a = a.slice(4)), (t = !0), "GMT:" === c && (n = !0));
              var p = t ? "getUTC" : "get",
                u = e[p + "Date"](),
                m = e[p + "Day"](),
                h = e[p + "Month"](),
                g = e[p + "FullYear"](),
                f = e[p + "Hours"](),
                b = e[p + "Minutes"](),
                v = e[p + "Seconds"](),
                D = e[p + "Milliseconds"](),
                y = t ? 0 : e.getTimezoneOffset(),
                _ = (function (e) {
                  var a = new Date(e.getFullYear(), e.getMonth(), e.getDate());
                  a.setDate(a.getDate() - ((a.getDay() + 6) % 7) + 3);
                  var t = new Date(a.getFullYear(), 0, 4);
                  t.setDate(t.getDate() - ((t.getDay() + 6) % 7) + 3);
                  var n = a.getTimezoneOffset() - t.getTimezoneOffset();
                  a.setHours(a.getHours() - n);
                  var i = (a - t) / 6048e5;
                  return 1 + Math.floor(i);
                })(e),
                A = (function (e) {
                  var a = e.getDay();
                  return (0 === a && (a = 7), a);
                })(e),
                w = {
                  d: u,
                  dd: d(u),
                  ddd: r.i18n.dayNames[m],
                  dddd: r.i18n.dayNames[m + 7],
                  m: h + 1,
                  mm: d(h + 1),
                  mmm: r.i18n.monthNames[h],
                  mmmm: r.i18n.monthNames[h + 12],
                  yy: String(g).slice(2),
                  yyyy: g,
                  h: f % 12 || 12,
                  hh: d(f % 12 || 12),
                  H: f,
                  HH: d(f),
                  M: b,
                  MM: d(b),
                  s: v,
                  ss: d(v),
                  l: d(D, 3),
                  L: d(Math.round(D / 10)),
                  t: f < 12 ? r.i18n.timeNames[0] : r.i18n.timeNames[1],
                  tt: f < 12 ? r.i18n.timeNames[2] : r.i18n.timeNames[3],
                  T: f < 12 ? r.i18n.timeNames[4] : r.i18n.timeNames[5],
                  TT: f < 12 ? r.i18n.timeNames[6] : r.i18n.timeNames[7],
                  Z: n
                    ? "GMT"
                    : t
                      ? "UTC"
                      : (String(e).match(o) || [""]).pop().replace(s, ""),
                  o:
                    (y > 0 ? "-" : "+") +
                    d(
                      100 * Math.floor(Math.abs(y) / 60) + (Math.abs(y) % 60),
                      4,
                    ),
                  S: ["th", "st", "nd", "rd"][
                    u % 10 > 3 ? 0 : (((u % 100) - (u % 10) != 10) * u) % 10
                  ],
                  W: _,
                  N: A,
                };
              return a.replace(i, function (e) {
                return e in w ? w[e] : e.slice(1, e.length - 1);
              });
            });
        function d(e, a) {
          for (e = String(e), a = a || 2; e.length < a;) e = "0" + e;
          return e;
        }
        ((r.masks = {
          default: "ddd mmm dd yyyy HH:MM:ss",
          shortDate: "m/d/yy",
          mediumDate: "mmm d, yyyy",
          longDate: "mmmm d, yyyy",
          fullDate: "dddd, mmmm d, yyyy",
          shortTime: "h:MM TT",
          mediumTime: "h:MM:ss TT",
          longTime: "h:MM:ss TT Z",
          isoDate: "yyyy-mm-dd",
          isoTime: "HH:MM:ss",
          isoDateTime: "yyyy-mm-dd'T'HH:MM:sso",
          isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
          expiresHeaderFormat: "ddd, dd mmm yyyy HH:MM:ss Z",
        }),
          (r.i18n = {
            dayNames: [
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            monthNames: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ],
            timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"],
          }),
          void 0 ===
            (n = function () {
              return r;
            }.call(a, t, a, e)) || (e.exports = n));
      })();
    },
    88150: function (e, a, t) {
      "use strict";
      t.d(a, {
        A: function () {
          return _;
        },
      });
      var n = t(96540),
        i = t(12058),
        o = t.n(i),
        s = t(58156),
        r = t.n(s),
        d = t(22033),
        l = JSON.parse(
          '{"J":[{"title":"FDA\'s path forward for open data and Next Generation Sequencing","path":"/about/updates/2014_03_06_fda_path_forward_for_open_data_and_next_gen_sequencing/","date":"2014-03-06","desc":"FDA has established an Office of Informatics and Technology Innovation (OITI) under the Chief Health Informatics Officer..."},{"title":"Introducing openFDA","path":"/about/updates/2014_06_02_introducing_openfda/","date":"2014-06-02","desc":"Welcome to the new home of openFDA! We are incredibly excited to see so much interest in our work and hope that this sit..."},{"title":"openFDA: Innovative initiative opens door to wealth of FDA’s publicly available data","path":"/about/updates/2014_06_02_openfda_opens_door_to_fda_public_data/","date":"2014-06-02","desc":"Today, I am pleased to announce the launch of openFDA, a new initiative from our Office of Informatics and Technology In..."},{"title":"openFDA provides ready access to recall data","path":"/about/updates/2014_08_08_openfda_provides_ready_access_to_recall_data/","date":"2014-08-08","desc":"Every year, hundreds of human and animal foods, drugs, and medical devices are recalled from the market by manufacturers..."},{"title":"Providing easy public access to prescription drug, over-the-counter drug, and biological product labeling","path":"/about/updates/2014_08_18_drug_product_labeling/","date":"2014-08-18","desc":"Every prescription drug (including biological drug products) approved by FDA for human use comes with FDA-approved label..."},{"title":"Providing easy access to medical device reports submitted to FDA since the early 1990s","path":"/about/updates/2014_08_19_providing_easy_access_to_medical_device_reports/","date":"2014-08-19","desc":"In addition to food and drugs, FDA has regulatory oversight of tens of thousands of medical devices ranging from bandage..."},{"title":"Announcing the openFDA Developer Challenge - An open call to tap public data and improve public health","path":"/about/updates/2015_05_11_an_open_challenge_to_tap_public_data/","date":"2015-05-11","desc":"The FDA is launching its very first openFDA challenge to the developer community to take advantage of the following data..."},{"title":"openFDA: The First Year in Perspective","path":"/about/updates/2015_07_20_first_year_in_perspective/","date":"2015-07-20","desc":"On May 22, 2015, Dr. Taha Kass-Hout gave an update on the openFDA project at the Big Data in Biomedicine conference at S..."},{"title":"Mark your calendars: A new release coming soon from openFDA","path":"/about/updates/2015_08_06_new_release_coming_soon/","date":"2015-08-06","desc":"The FDA created openFDA to make their public information about food, drugs, and devices more accessible and useful to de..."},{"title":"openFDA Unveils Cache of Medical Device Data","path":"/about/updates/2015_08_31_medical_device/","date":"2015-08-31","desc":"openFDA is releasing information on medical devices that could spur innovation and advance scientific research..."},{"title":"openFDA Now Allows Direct Downloads of Data","path":"/about/updates/2015_12_23_direct_downloads/","date":"2015-12-23","desc":"Since its launch in June 2014, the impetus for openFDA has been to make it easier to get access to publicly available FD..."},{"title":"openFDA Public Workshop Announcement","path":"https://www.federalregister.gov/documents/2016/06/01/2016-12826/openfda-public-workshop","date":"2016-06-01","desc":"The Food and Drug Administration (FDA) is announcing a public workshop entitled: openFDA Public Workshop..."},{"title":"openFDA Community App webpage","path":"/community/","date":"2016-09-26","desc":"Community created apps can now be found directly on the openFDA website."},{"title":"New Dataset: Unique Device Identifier","path":"/apis/device/udi/","date":"2016-09-26","desc":"Read about the details of this newly available dataset and access the data through openFDA."},{"title":"openFDA API Statistics Graph","path":"/about/statistics/","date":"2016-10-24","desc":"Learn how others are using the openFDA data by exploring this graphical representation of openFDA data usage."},{"title":"Making Available Reports of Adverse Events for Foods and Cosmetics via openFDA","path":"https://blogs.fda.gov/fdavoice/index.php/2016/12/why-fda-is-making-data-extracted-from-reports-of-adverse-events-for-foods-and-cosmetics-available-to-the-public/?source=govdelivery&utm_medium=email&utm_source=govdelivery","date":"2016-12-06","desc":"Transparency in the actions we take as an agency, and our reasons for taking them, is an important value for FDA in its..."},{"title":"openFDA central download page","path":"/downloads","date":"2016-12-23","desc":"Downloading full datasets has never been easier! Visit our central download page to download any and all openFDA datasets."},{"title":"openFDA query result increased","path":"/about/updates/2017_08_30_openfda_limit_increased","date":"2017-08-30","desc":"Since its launch in June 2014, the impetus for openFDA has been to make it easier for an application, mobile device..."},{"title":"New openFDA Dataset -  NSDE","path":"/apis/other/nsde/","date":"2017-12-28","desc":"Medicare Part D Prescription Drug Event Editing & Coverage Gap Discount Program"},{"title":"UDI Dataset Updated","path":"/about/updates/2018_04_20_udi_dataset_updated","date":"2018-04-20","desc":"openFDA is committed to transparency and always providing the best data available. This includes modifying released..."},{"title":"New Look, Same Great API","path":"/about/updates/2018_06_22_new_look_same_great_api","date":"2018-06-22","desc":"openFDA is committed to transparency and always providing the best data available. This includes modifying released..."},{"title":"New openFDA Dataset -  NDC Directory","path":"/apis/drug/ndc/","date":"2018-11-29","desc":"The NDC Directory is now available via openFDA."},{"title":"Animal Drug Adverse Events Now Available","path":"/about/updates/2019_04_03_Animal_Drug_Adverse_Events_Now_Available","date":"2019-04-03","desc":"The first openFDA animal drug dataset \\"Animal Drug Adverse Event Reports\\" is available via openFDA."},{"title":"New openFDA Dataset - Substance Data","path":"/apis/other/substance/","date":"2019-12-10","desc":"The Substance Data endpoint is now available via openFDA."},{"title":"Harmonization Explained","path":"/apis/openfda-fields/","date":"2019-12-13","desc":"We\'ve expanded on our harmonization documentation, detailing which specific fields are harmonized."},{"title":"200 Million API Calls","path":"/about/statistics/","date":"2019-12-16","desc":"The openFDA team is proud to announce that openFDA has now surpassed an astounding milestone: 200 million API calls."},{"title":"Independent Evaluations of COVID-19 Serological Tests Now Available","path":"/about/updates/2020_06_04_COVID-19_Serological_Testing_Evaluations_Now_Available","date":"2020-06-05","desc":"The new dataset \\"Independent Evaluations of COVID-19 Serological Tests\\" is available via openFDA."},{"title":"New openFDA Dataset - Drugs@FDA","path":"/apis/drug/drugsfda/","date":"2020-08-26","desc":"Drugs@FDA is now available via openFDA."},{"title":"New openFDA Dataset - Tobacco Problem Reports","path":"/apis/tobacco/problem/","date":"2020-09-15","desc":"Tobacco Problem Reports is now available via openFDA."},{"title":"New feature - openFDA Data Dictionary","path":"/data/datadictionary/","date":"2020-10-10","desc":"The openFDA data dictionary is now available."},{"title":"System Architecture Upgrade","path":"/about/updates/2020_10_13_system_architecture_upgrade/","date":"2020-10-13","desc":"The openFDA system architecture has received a significant upgrade."},{"title":"New openFDA Dataset - UNII","path":"/apis/other/unii/","date":"2023-04-13","desc":"The dataset UNII is now available."},{"title":"Updates to the UDI Dataset","path":"/apis/device/udi/","date":"2023-08-15","desc":"The openFDA UDI API has been updated to include the Global Medical Device Nomenclature (GMDN) Code."},{"title":"New feature - Wildcard Search","path":"/apis/wildcard-search/","date":"2024-02-23","desc":"All openFDA API endpoints may be queried using a \\"wildcard search\\". Click this link for more details."},{"title":"New openFDA Dataset - Historical Documents","path":"/apis/other/historicaldocument/","date":"2024-03-20","desc":"The dataset Historical Documents is now available."},{"title":"New openFDA Dataset - Drug Shortages","path":"/apis/drug/drugshortages/","date":"2025-03-25","desc":"The dataset Drug Shortages is now available."},{"title":"Complete Response Letters released","path":"/apis/transparency/completeresponseletters/","date":"2025-09-05","desc":"Complete Response Letters (CRL) issued in response to new drug applications (NDAs) and biologics license applications (BLAs) have been released. Currently, the database includes CRLs issued to sponsors as recently as 2025."},{"title":"New openFDA Dataset - Cosmetic Adverse Events","path":"/apis/cosmetic/event/","date":"2025-09-13","desc":"The dataset Cosmetic Adverse Events is now available."},{"title":"New openFDA Dataset - Tobacco Prevention Ads Research","path":"/apis/tobacco/researchpreventionads/","date":"2026-02-17","desc":"The dataset Tobacco Prevention Ads Research is now available."},{"title":"New openFDA Dataset - Tobacco Digital Ads Research","path":"/apis/tobacco/researchdigitalads/","date":"2026-02-17","desc":"The dataset Tobacco Digital Ads Research is now available."},{"title":"New openFDA Dataset - Tobacco Smokefree Research","path":"/apis/tobacco/researchsmokefree/","date":"2026-03-11","desc":"The dataset Tobacco Smokefree Research is now available."},{"title":"New openFDA Dataset - Orange Book","path":"/apis/drug/orangebook/","date":"2026-06-30","desc":"The dataset Orange Book is now available."},{"title":"New openFDA Dataset - Covid miRNA and Proteomics Research","path":"/apis/research/covidmirnaandproteomics/","date":"2026-08-22","desc":"The dataset Covid miRNA and Proteomics Research is now available."}]}',
        ),
        c = t(5556),
        p = t.n(c),
        u = (function () {
          function e(e, a) {
            for (var t = 0; t < a.length; t++) {
              var n = a[t];
              ((n.enumerable = n.enumerable || !1),
                (n.configurable = !0),
                "value" in n && (n.writable = !0),
                Object.defineProperty(e, n.key, n));
            }
          }
          return function (a, t, n) {
            return (t && e(a.prototype, t), n && e(a, n), a);
          };
        })();
      var m = "none",
        h = "pending",
        g = "rejected",
        f = "resolved",
        b = (function (e) {
          function a(e) {
            !(function (e, a) {
              if (!(e instanceof a))
                throw new TypeError("Cannot call a class as a function");
            })(this, a);
            var t = (function (e, a) {
              if (!e)
                throw new ReferenceError(
                  "this hasn't been initialised - super() hasn't been called",
                );
              return !a || ("object" != typeof a && "function" != typeof a)
                ? e
                : a;
            })(this, (a.__proto__ || Object.getPrototypeOf(a)).call(this, e));
            return ((t.state = { status: m }), t);
          }
          return (
            (function (e, a) {
              if ("function" != typeof a && null !== a)
                throw new TypeError(
                  "Super expression must either be null or a function, not " +
                    typeof a,
                );
              ((e.prototype = Object.create(a && a.prototype, {
                constructor: {
                  value: e,
                  enumerable: !1,
                  writable: !0,
                  configurable: !0,
                },
              })),
                a &&
                  (Object.setPrototypeOf
                    ? Object.setPrototypeOf(e, a)
                    : (e.__proto__ = a)));
            })(a, e),
            u(a, [
              {
                key: "componentWillReceiveProps",
                value: function (e) {
                  e.promise !== this.props.promise &&
                    (this.setState({ status: m }),
                    this.handlePromise(e.promise));
                },
              },
              {
                key: "handlePromise",
                value: function (e) {
                  var a = this;
                  (this.setState({ status: h }),
                    e.then(
                      function (e) {
                        a.setState({ status: f, value: e });
                      },
                      function (e) {
                        a.setState({ status: g, value: e });
                      },
                    ));
                },
              },
              {
                key: "componentWillMount",
                value: function () {
                  this.props.promise && this.handlePromise(this.props.promise);
                },
              },
              {
                key: "render",
                value: function () {
                  var e = this.props,
                    a = this.state;
                  switch (a.status) {
                    case m:
                      if (e.before)
                        return e.before(this.handlePromise.bind(this));
                      break;
                    case h:
                      if (e.pending) return e.pending;
                      break;
                    case f:
                      if (e.then) return e.then(a.value);
                      break;
                    case g:
                      if (e.catch) return e.catch(a.value);
                  }
                  return null;
                },
              },
            ]),
            a
          );
        })(n.Component);
      b.propTypes = {
        before: p().func,
        then: p().func,
        catch: p().func,
        pending: p().node,
        promise: p().object,
      };
      var v = b,
        D = function (e) {
          var a = e.small,
            t = l.J.filter(function (e) {
              return e.date;
            })
              .sort(function (e, a) {
                return new Date(e.date).getTime() > new Date(a.date).getTime()
                  ? 1
                  : -1;
              })
              .reverse();
          return (
            !0 === a && (t = t.slice(0, 3)),
            n.createElement(
              "ul",
              {
                "aria-label": "openFDA updates",
                tabIndex: 0,
                className:
                  "blog-container " +
                  (!0 === a ? "overflow-hidden small-blog-container" : ""),
              },
              t.map(function (e, t) {
                var i = e.desc,
                  s = e.date,
                  l = new Promise(function (a, t) {
                    e.title.length > 40
                      ? a(r()(e, "title").substring(0, 40) + "...")
                      : a(e.title);
                  }),
                  c = "";
                s.length > 0 && (c = o()(s, "mmmm d, yyyy").toUpperCase());
                var p = !0;
                return (
                  -1 !== e.path.indexOf("http") && (p = !1),
                  n.createElement(
                    "li",
                    { key: t, className: "blog-item" },
                    1 == p &&
                      n.createElement(
                        d.Ay,
                        {
                          className:
                            "full-height btn-icon-right blog-text-item",
                          to: e.path,
                        },
                        n.createElement(
                          "div",
                          null,
                          n.createElement(v, {
                            promise: l,
                            then: function (e) {
                              return n.createElement(
                                "h2",
                                { className: "blog-header clr-primary-darker" },
                                e,
                              );
                            },
                          }),
                          n.createElement(
                            "div",
                            {
                              className:
                                "clr-gray-light marg-b-1 t-marg-t-05 time-stamp",
                            },
                            c,
                          ),
                          n.createElement(
                            "p",
                            {
                              className:
                                "smallest txt-overflow-ellipsis txt-overflow-ellipsis-wrap-4",
                            },
                            i,
                          ),
                          !1 === a &&
                            n.createElement(
                              "span",
                              {
                                className:
                                  "absolute pad-b-2 weight-700 clr-primary",
                              },
                              "READ MORE ",
                              n.createElement("i", {
                                className: "fa fa-angle-right",
                              }),
                            ),
                        ),
                        !0 === a &&
                          n.createElement("i", {
                            className: "fa fa-angle-right fa-2x",
                          }),
                      ),
                    !p &&
                      n.createElement(
                        "a",
                        {
                          className:
                            "full-height btn-icon-right blog-text-item",
                          href: e.path,
                        },
                        n.createElement(
                          "div",
                          null,
                          n.createElement(v, {
                            promise: l,
                            then: function (e) {
                              return n.createElement(
                                "h2",
                                { className: "blog-header clr-primary-darker" },
                                e,
                              );
                            },
                          }),
                          n.createElement(
                            "div",
                            {
                              className:
                                "clr-gray-light marg-b-1 t-marg-t-05 time-stamp",
                            },
                            c,
                          ),
                          n.createElement(
                            "p",
                            { className: "smallest txt-overflow-ellipsis" },
                            i,
                          ),
                          !1 === a &&
                            n.createElement(
                              "span",
                              {
                                className:
                                  "absolute pad-b-2 weight-700 clr-primary",
                              },
                              "READ MORE ",
                              n.createElement("i", {
                                className: "fa fa-angle-right",
                              }),
                            ),
                        ),
                        !0 === a &&
                          n.createElement("i", {
                            className: "fa fa-angle-right fa-2x",
                          }),
                      ),
                  )
                );
              }),
            )
          );
        },
        y = function (e) {
          var a = e.small;
          return n.createElement(
            "section",
            {
              className:
                "body-bg-offwhite " + (!0 === a ? "blog-list" : "blog-cards"),
            },
            n.createElement(
              "div",
              { className: "blog-header-container" },
              n.createElement(
                "h2",
                {
                  className:
                    !0 === a ? "clr-primary blog-header" : "center-heading",
                },
                n.createElement("span", null, "Latest News & Updates"),
              ),
              !0 === a &&
                n.createElement(
                  d.Ay,
                  {
                    className: "btn-icon-right weight-700",
                    to: "/about/updates/",
                  },
                  "VIEW ALL ",
                  n.createElement("i", { className: "fa fa-angle-right" }),
                ),
            ),
            n.createElement(D, e),
          );
        };
      y.displayName = "component/BlogRoll";
      var _ = y;
    },
  },
]);
//# sourceMappingURL=db5a46946d2ae43b9c82ee24900202a1aace3064-9051baa265c8c1df67a2.js.map
