!(function () {
  "use strict";
  var e,
    a,
    s,
    n,
    c,
    t = {},
    d = {};
  function o(e) {
    var a = d[e];
    if (void 0 !== a) return a.exports;
    var s = (d[e] = { id: e, loaded: !1, exports: {} });
    return (t[e].call(s.exports, s, s.exports, o), (s.loaded = !0), s.exports);
  }
  ((o.m = t),
    (o.amdD = function () {
      throw new Error("define cannot be used indirect");
    }),
    (o.amdO = {}),
    (e = []),
    (o.O = function (a, s, n, c) {
      if (!s) {
        var t = 1 / 0;
        for (r = 0; r < e.length; r++) {
          ((s = e[r][0]), (n = e[r][1]), (c = e[r][2]));
          for (var d = !0, i = 0; i < s.length; i++)
            (!1 & c || t >= c) &&
            Object.keys(o.O).every(function (e) {
              return o.O[e](s[i]);
            })
              ? s.splice(i--, 1)
              : ((d = !1), c < t && (t = c));
          if (d) {
            e.splice(r--, 1);
            var p = n();
            void 0 !== p && (a = p);
          }
        }
        return a;
      }
      c = c || 0;
      for (var r = e.length; r > 0 && e[r - 1][2] > c; r--) e[r] = e[r - 1];
      e[r] = [s, n, c];
    }),
    (o.n = function (e) {
      var a =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return (o.d(a, { a: a }), a);
    }),
    (s = Object.getPrototypeOf
      ? function (e) {
          return Object.getPrototypeOf(e);
        }
      : function (e) {
          return e.__proto__;
        }),
    (o.t = function (e, n) {
      if ((1 & n && (e = this(e)), 8 & n)) return e;
      if ("object" == typeof e && e) {
        if (4 & n && e.__esModule) return e;
        if (16 & n && "function" == typeof e.then) return e;
      }
      var c = Object.create(null);
      o.r(c);
      var t = {};
      a = a || [null, s({}), s([]), s(s)];
      for (var d = 2 & n && e; "object" == typeof d && !~a.indexOf(d); d = s(d))
        Object.getOwnPropertyNames(d).forEach(function (a) {
          t[a] = function () {
            return e[a];
          };
        });
      return (
        (t.default = function () {
          return e;
        }),
        o.d(c, t),
        c
      );
    }),
    (o.d = function (e, a) {
      for (var s in a)
        o.o(a, s) &&
          !o.o(e, s) &&
          Object.defineProperty(e, s, { enumerable: !0, get: a[s] });
    }),
    (o.f = {}),
    (o.e = function (e) {
      return Promise.all(
        Object.keys(o.f).reduce(function (a, s) {
          return (o.f[s](e, a), a);
        }, []),
      );
    }),
    (o.u = function (e) {
      return (
        {
          42: "component---src-pages-apis-other-substance-download-index-tsx",
          51: "component---src-pages-apis-research-tobaccosmokefree-searchable-fields-index-tsx",
          62: "component---src-pages-apis-device-registrationlisting-explore-the-api-with-an-interactive-chart-index-tsx",
          81: "component---src-pages-apis-device-pma-explore-the-api-with-an-interactive-chart-index-tsx",
          98: "dff27125",
          119: "component---src-pages-apis-tobacco-problem-index-tsx",
          183: "component---src-pages-apis-device-udi-index-tsx",
          235: "component---src-pages-apis-tobacco-problem-explore-the-api-with-an-interactive-chart-index-tsx",
          238: "component---src-pages-apis-food-enforcement-how-to-use-the-endpoint-index-tsx",
          240: "component---src-pages-apis-animalandveterinary-event-understanding-the-api-results-index-tsx",
          336: "component---src-pages-apis-animalandveterinary-event-download-index-tsx",
          371: "component---src-pages-data-caers-index-tsx",
          375: "component---src-pages-apis-cosmetic-index-tsx",
          396: "component---src-pages-apis-device-510-k-how-to-use-the-endpoint-index-tsx",
          397: "component---src-pages-apis-cosmetic-event-searchable-fields-index-tsx",
          440: "component---src-pages-apis-device-510-k-searchable-fields-index-tsx",
          485: "component---src-pages-apis-animalandveterinary-event-explore-the-api-with-an-interactive-chart-index-tsx",
          585: "component---src-pages-apis-research-covidmirnaandproteomics-how-to-use-the-endpoint-index-tsx",
          596: "component---src-pages-apis-transparency-completeresponseletters-index-tsx",
          620: "component---src-pages-about-updates-2014-08-19-providing-easy-access-to-medical-device-reports-index-tsx",
          623: "component---src-pages-apis-other-unii-example-api-queries-index-tsx",
          624: "component---src-pages-apis-research-tobaccodigitalads-searchable-fields-index-tsx",
          643: "562978b84ee957668a03a74c9ca3789dc39a6d87",
          667: "component---src-pages-about-updates-2018-06-22-new-look-same-great-api-index-tsx",
          669: "component---src-pages-apis-openfda-fields-index-tsx",
          671: "component---src-pages-apis-drug-enforcement-understanding-the-api-results-index-tsx",
          731: "3a211d6c40237212eb80ee2156fbc8dd06e28070",
          778: "component---src-pages-apis-device-event-searchable-fields-index-tsx",
          800: "component---src-pages-data-unii-index-tsx",
          827: "component---src-pages-data-drugsfda-index-tsx",
          855: "component---src-pages-apis-research-tobaccosmokefree-example-api-queries-index-tsx",
          878: "9f88540f5b11d89305203322c37a9342b9643feb",
          899: "component---src-pages-apis-research-tobaccoharmmenthol-download-index-tsx",
          943: "component---src-pages-apis-device-registrationlisting-understanding-the-api-results-index-tsx",
          971: "component---src-pages-apis-device-event-explore-the-api-with-an-interactive-chart-index-tsx",
          997: "component---src-pages-apis-transparency-completeresponseletters-searchable-fields-index-tsx",
          1014: "component---src-pages-apis-timeseries-index-tsx",
          1019: "component---src-pages-apis-anatomy-of-a-response-index-tsx",
          1046: "component---src-pages-apis-drug-drugsfda-understanding-the-api-results-index-tsx",
          1056: "component---src-pages-apis-drug-label-how-to-use-the-endpoint-index-tsx",
          1066: "component---src-pages-apis-device-classification-how-to-use-the-endpoint-index-tsx",
          1089: "4a3ea9cd",
          1148: "component---src-pages-apis-drug-enforcement-download-index-tsx",
          1152: "90a0249f7d576265e99ab0a5035683238e8fa046",
          1153: "component---src-pages-apis-research-index-tsx",
          1156: "component---src-pages-apis-research-tobaccopreventionads-how-to-use-the-endpoint-index-tsx",
          1170: "component---src-pages-apis-drug-event-example-api-queries-index-tsx",
          1196: "component---src-pages-apis-device-510-k-download-index-tsx",
          1207: "component---src-pages-apis-wildcard-search-index-tsx",
          1283: "component---src-pages-apis-index-tsx",
          1320: "component---src-pages-apis-cosmetic-event-explore-the-api-with-an-interactive-chart-index-tsx",
          1342: "component---src-pages-apis-device-event-example-api-queries-index-tsx",
          1363: "component---src-pages-apis-transparency-completeresponseletters-example-api-queries-index-jsx",
          1429: "component---src-pages-apis-drug-ndc-download-index-tsx",
          1453: "component---src-pages-404-tsx",
          1485: "component---src-pages-apis-research-tobaccopreventionads-index-tsx",
          1515: "component---src-pages-apis-device-covid-19-serology-how-to-use-the-endpoint-index-tsx",
          1535: "component---src-pages-apis-food-enforcement-explore-the-api-with-an-interactive-chart-index-tsx",
          1564: "component---src-pages-about-updates-index-tsx",
          1577: "component---src-pages-apis-cosmetic-event-how-to-use-the-endpoint-index-tsx",
          1582: "component---src-pages-apis-food-enforcement-understanding-the-api-results-index-tsx",
          1584: "component---src-pages-data-historicaldocument-index-tsx",
          1591: "component---src-pages-apis-other-substance-index-tsx",
          1593: "component---src-pages-apis-missing-values-index-tsx",
          1622: "component---src-pages-apis-drug-event-searchable-fields-index-tsx",
          1687: "component---src-pages-apis-device-recall-download-index-tsx",
          1690: "component---src-pages-apis-device-event-download-index-tsx",
          1746: "component---src-pages-apis-other-index-tsx",
          1755: "component---src-pages-apis-drug-event-index-tsx",
          1766: "87d98f1f94f2032201c9379c13e2abfc786fc231",
          1812: "component---src-pages-apis-research-tobaccopreventionads-download-index-tsx",
          1818: "component---src-pages-apis-tobacco-problem-searchable-fields-index-tsx",
          1821: "component---src-pages-about-statistics-index-tsx",
          1851: "component---src-pages-apis-device-udi-explore-the-api-with-an-interactive-chart-index-tsx",
          1866: "component---src-pages-apis-drug-drugshortages-understanding-the-api-results-index-tsx",
          1898: "component---src-pages-apis-drug-drugshortages-download-index-tsx",
          1907: "component---src-pages-data-datadictionary-index-tsx",
          1953: "component---src-pages-apis-research-tobaccoharmmenthol-how-to-use-the-endpoint-index-tsx",
          1985: "component---src-pages-apis-animalandveterinary-event-index-tsx",
          2083: "component---src-pages-apis-food-enforcement-index-tsx",
          2140: "component---src-pages-apis-device-pma-understanding-the-api-results-index-tsx",
          2178: "component---src-pages-apis-drug-ndc-index-tsx",
          2257: "component---src-pages-apis-device-enforcement-index-tsx",
          2324: "component---src-pages-apis-research-tobaccodigitalads-understanding-the-api-results-index-tsx",
          2346: "component---src-pages-apis-device-event-how-to-use-the-endpoint-index-tsx",
          2347: "component---src-pages-apis-device-registrationlisting-searchable-fields-index-tsx",
          2411: "component---src-pages-apis-other-historicaldocument-searchable-fields-index-tsx",
          2417: "component---src-pages-about-updates-2015-12-23-direct-downloads-index-tsx",
          2430: "577fc0b71de84359459d0ed233094e897b098ce7",
          2437: "component---src-pages-apis-research-tobaccoharmmenthol-searchable-fields-index-tsx",
          2460: "component---src-pages-apis-device-pma-download-index-tsx",
          2527: "component---src-pages-apis-device-covid-19-serology-example-api-queries-index-tsx",
          2540: "component---src-pages-apis-other-nsde-example-api-queries-index-tsx",
          2628: "component---src-pages-apis-research-tobaccodigitalads-download-index-tsx",
          2704: "component---src-pages-apis-other-nsde-searchable-fields-index-tsx",
          2737: "component---src-pages-data-science-index-tsx",
          2763: "component---src-pages-apis-other-historicaldocument-how-to-use-the-endpoint-index-tsx",
          2780: "component---src-pages-apis-research-tobaccopreventionads-example-api-queries-index-tsx",
          2798: "component---src-pages-apis-food-enforcement-download-index-tsx",
          2829: "11e891c9c63555517b539a9af27746b428976e1e",
          2834: "component---src-pages-apis-drug-orangebook-index-tsx",
          2845: "component---src-pages-about-updates-2014-06-02-introducing-openfda-index-tsx",
          2883: "component---src-pages-apis-research-tobaccosmokefree-how-to-use-the-endpoint-index-tsx",
          2912: "component---src-pages-apis-device-recall-index-tsx",
          2953: "component---src-pages-apis-food-event-index-tsx",
          3034: "component---src-pages-apis-device-udi-download-index-tsx",
          3036: "component---src-pages-apis-research-tobaccodigitalads-example-api-queries-index-tsx",
          3052: "1e77632d",
          3071: "component---src-pages-apis-other-historicaldocument-understanding-the-api-results-index-tsx",
          3095: "component---src-pages-apis-drug-event-explore-the-api-with-an-interactive-chart-index-tsx",
          3118: "component---src-pages-apis-drug-drugshortages-example-api-queries-index-tsx",
          3123: "component---src-pages-apis-drug-ndc-searchable-fields-index-tsx",
          3139: "878c7825bc22a42df7d45777359355eaa7b125eb",
          3155: "3d6febfbbc9c72647125c1af2dc88f39627e76ca",
          3171: "component---src-pages-apis-transparency-completeresponseletters-how-to-use-the-endpoint-index-jsx",
          3253: "component---src-pages-about-updates-2020-10-13-system-architecture-upgrade-index-tsx",
          3291: "component---src-pages-apis-download-api-fields-index-tsx",
          3363: "component---src-pages-apis-drug-orangebook-searchable-fields-index-tsx",
          3396: "d0132e926b5cac8ed0689b72390c899de055e911",
          3454: "component---src-pages-apis-other-historicaldocument-explore-the-api-with-an-interactive-chart-index-tsx",
          3461: "b637e9a5",
          3470: "component---src-pages-data-510-k-index-tsx",
          3510: "component---src-pages-apis-animalandveterinary-index-tsx",
          3514: "75816a9f8201f79838892fe84739b478c9f42044",
          3517: "component---src-pages-apis-food-event-explore-the-api-with-an-interactive-chart-index-tsx",
          3523: "component---src-pages-apis-drug-ndc-how-to-use-the-endpoint-index-tsx",
          3536: "component---src-pages-apis-drug-label-understanding-the-api-results-index-tsx",
          3602: "component---src-pages-apis-try-the-api-index-tsx",
          3609: "component---src-pages-apis-device-recall-searchable-fields-index-tsx",
          3662: "component---src-pages-apis-other-substance-example-api-queries-index-tsx",
          3676: "component---src-pages-about-updates-2019-04-03-animal-drug-adverse-events-now-available-index-tsx",
          3700: "component---src-pages-apis-drug-enforcement-example-api-queries-index-tsx",
          3703: "component---src-pages-apis-drug-drugsfda-explore-the-api-with-an-interactive-chart-index-tsx",
          3728: "component---src-pages-apis-animalandveterinary-event-how-to-use-the-endpoint-index-tsx",
          3789: "component---src-pages-about-updates-2014-03-06-fda-path-forward-for-open-data-and-next-gen-sequencing-index-tsx",
          3832: "3acb85d5a9555c6f58eb449cdfa46d34355b10a1",
          3964: "component---src-pages-apis-cosmetic-event-index-tsx",
          3994: "component---src-pages-apis-device-registrationlisting-index-tsx",
          4109: "component---src-pages-apis-research-covidmirnaandproteomics-searchable-fields-index-tsx",
          4132: "component---src-pages-apis-research-tobaccodigitalads-how-to-use-the-endpoint-index-tsx",
          4150: "component---src-pages-data-registrationlisting-index-tsx",
          4178: "component---src-pages-data-ndc-index-tsx",
          4222: "component---src-pages-apis-tobacco-problem-example-api-queries-index-tsx",
          4251: "component---src-pages-apis-cosmetic-event-download-index-tsx",
          4274: "component---src-pages-about-updates-2014-06-02-openfda-opens-door-to-fda-public-data-index-tsx",
          4278: "component---src-pages-apis-drug-event-download-index-tsx",
          4311: "component---src-pages-data-drugshortages-index-tsx",
          4424: "06a518ffcd65dfe2905f3c98401b623fb1533f44",
          4436: "component---src-pages-apis-device-510-k-example-api-queries-index-tsx",
          4481: "component---src-pages-apis-drug-enforcement-explore-the-api-with-an-interactive-chart-index-tsx",
          4490: "component---src-pages-apis-drug-drugshortages-how-to-use-the-endpoint-index-tsx",
          4521: "component---src-pages-apis-device-recall-understanding-the-api-results-index-tsx",
          4555: "component---src-pages-apis-device-registrationlisting-how-to-use-the-endpoint-index-tsx",
          4612: "component---src-pages-apis-research-tobaccoharmmenthol-index-tsx",
          4613: "component---src-pages-apis-research-tobaccoharmmenthol-understanding-the-api-results-index-tsx",
          4639: "component---src-pages-apis-device-covid-19-serology-understanding-the-api-results-index-tsx",
          4661: "component---src-pages-apis-drug-orangebook-download-index-tsx",
          4672: "component---src-pages-apis-drug-label-download-index-tsx",
          4680: "component---src-pages-data-transparencytools-index-tsx",
          4736: "component---src-pages-apis-device-enforcement-how-to-use-the-endpoint-index-tsx",
          4791: "component---src-pages-apis-drug-ndc-example-api-queries-index-tsx",
          4795: "component---src-pages-apis-device-classification-explore-the-api-with-an-interactive-chart-index-tsx",
          4816: "component---src-pages-apis-device-enforcement-example-api-queries-index-tsx",
          4837: "component---src-pages-apis-device-recall-how-to-use-the-endpoint-index-tsx",
          4894: "component---src-pages-data-faers-index-tsx",
          4911: "component---src-pages-about-updates-2014-08-18-drug-product-labeling-index-tsx",
          4922: "component---src-pages-about-status-index-tsx",
          4941: "component---src-pages-about-updates-2020-06-04-covid-19-serological-testing-evaluations-now-available-index-tsx",
          5045: "1052f93c124354da8efa5d6d23da8221da126d4e",
          5097: "component---src-pages-apis-other-nsde-explore-the-api-with-an-interactive-chart-index-tsx",
          5110: "component---src-pages-about-updates-2015-08-06-new-release-coming-soon-index-tsx",
          5114: "component---src-pages-apis-tobacco-problem-understanding-the-api-results-index-tsx",
          5120: "b58a825a6612fac80a5db32847e611a8f7ba302e",
          5128: "component---src-pages-data-index-tsx",
          5158: "component---src-pages-apis-drug-event-how-to-use-the-endpoint-index-tsx",
          5165: "db5a46946d2ae43b9c82ee24900202a1aace3064",
          5231: "component---src-pages-data-nsde-index-tsx",
          5322: "component---src-pages-apis-device-udi-how-to-use-the-endpoint-index-tsx",
          5352: "component---src-pages-apis-food-event-example-api-queries-index-tsx",
          5387: "component---src-pages-apis-device-covid-19-serology-searchable-fields-index-tsx",
          5452: "component---src-pages-apis-other-unii-understanding-the-api-results-index-tsx",
          5514: "component---src-pages-apis-device-classification-understanding-the-api-results-index-tsx",
          5524: "component---src-pages-apis-other-nsde-download-index-tsx",
          5533: "component---src-pages-apis-api-endpoints-index-tsx",
          5550: "32f499a75d4d48164ad9839b4d70e78c1c6d8f17",
          5588: "component---src-pages-apis-other-nsde-how-to-use-the-endpoint-index-tsx",
          5646: "5bb223cc4718d426c21e7a21a0e7633c88de07dc",
          5670: "component---src-pages-apis-drug-drugsfda-download-index-tsx",
          5688: "component---src-pages-apis-food-event-how-to-use-the-endpoint-index-tsx",
          5708: "component---src-pages-apis-device-pma-how-to-use-the-endpoint-index-tsx",
          5716: "component---src-pages-apis-device-recall-explore-the-api-with-an-interactive-chart-index-tsx",
          5735: "component---src-pages-apis-drug-ndc-understanding-the-api-results-index-tsx",
          5829: "component---src-pages-apis-drug-label-explore-the-api-with-an-interactive-chart-index-tsx",
          5845: "component---src-pages-apis-device-510-k-index-tsx",
          5880: "component---src-pages-apis-drug-index-tsx",
          5888: "component---src-pages-apis-drug-label-example-api-queries-index-tsx",
          5909: "component---src-pages-apis-other-historicaldocument-example-api-queries-index-tsx",
          5955: "component---src-pages-apis-drug-orangebook-how-to-use-the-endpoint-index-tsx",
          6053: "component---src-pages-apis-drug-enforcement-index-tsx",
          6056: "component---src-pages-about-updates-2015-08-31-medical-device-index-tsx",
          6090: "component---src-pages-apis-device-classification-searchable-fields-index-tsx",
          6138: "component---src-pages-apis-drug-drugshortages-searchable-fields-index-tsx",
          6172: "component---src-pages-apis-research-covidmirnaandproteomics-index-tsx",
          6194: "f10e284a",
          6208: "component---src-pages-apis-animalandveterinary-event-example-api-queries-index-tsx",
          6232: "component---src-pages-apis-food-event-download-index-tsx",
          6295: "component---src-pages-apis-drug-drugshortages-index-tsx",
          6384: "component---src-pages-apis-research-tobaccopreventionads-searchable-fields-index-tsx",
          6417: "component---src-pages-apis-transparency-completeresponseletters-download-index-jsx",
          6441: "component---src-pages-data-pma-index-tsx",
          6444: "component---src-pages-apis-device-510-k-understanding-the-api-results-index-tsx",
          6529: "component---src-pages-data-maude-index-tsx",
          6589: "component---src-pages-apis-research-tobaccodigitalads-index-tsx",
          6638: "4f420d75665ee921e95d454b3f17798e5435aee4",
          6648: "component---src-pages-about-updates-2015-07-20-first-year-in-perspective-index-tsx",
          6746: "component---src-pages-apis-other-substance-understanding-the-api-results-index-tsx",
          6882: "component---src-pages-apis-drug-drugsfda-example-api-queries-index-tsx",
          6906: "component---src-pages-apis-device-udi-understanding-the-api-results-index-tsx",
          6948: "component---src-pages-apis-food-event-searchable-fields-index-tsx",
          6954: "component---src-pages-apis-device-covid-19-serology-index-tsx",
          6970: "component---src-pages-apis-other-historicaldocument-index-tsx",
          6998: "component---src-pages-apis-drug-ndc-explore-the-api-with-an-interactive-chart-index-tsx",
          7034: "component---src-pages-apis-tobacco-problem-download-index-tsx",
          7085: "component---src-pages-apis-research-covidmirnaandproteomics-understanding-the-api-results-index-tsx",
          7103: "85e38892",
          7114: "component---src-pages-apis-other-substance-searchable-fields-index-tsx",
          7147: "component---src-pages-apis-research-covidmirnaandproteomics-download-index-tsx",
          7158: "component---src-pages-apis-authentication-index-tsx",
          7207: "component---src-pages-about-updates-2014-08-08-openfda-provides-ready-access-to-recall-data-index-tsx",
          7228: "component---src-pages-apis-device-enforcement-searchable-fields-index-tsx",
          7273: "component---src-pages-apis-drug-event-understanding-the-api-results-index-tsx",
          7282: "component---src-pages-data-orangebook-index-tsx",
          7291: "component---src-pages-about-updates-2017-08-30-openfda-limit-increased-index-tsx",
          7296: "component---src-pages-apis-transparency-index-tsx",
          7354: "component---src-pages-apis-tobacco-problem-how-to-use-the-endpoint-index-tsx",
          7386: "component---src-pages-apis-other-substance-how-to-use-the-endpoint-index-tsx",
          7399: "component---src-pages-apis-drug-orangebook-example-api-queries-index-tsx",
          7401: "component---src-pages-about-index-tsx",
          7450: "7350e8dc44eaa81a94715d719e0e797db0a367e1",
          7503: "component---src-pages-apis-device-registrationlisting-example-api-queries-index-tsx",
          7532: "component---src-pages-apis-animalandveterinary-event-searchable-fields-index-tsx",
          7582: "component---src-pages-apis-food-enforcement-searchable-fields-index-tsx",
          7645: "component---src-pages-apis-cosmetic-event-understanding-the-api-results-index-tsx",
          7760: "component---src-pages-apis-device-enforcement-understanding-the-api-results-index-tsx",
          7773: "component---src-pages-apis-other-historicaldocument-download-index-tsx",
          7786: "component---src-pages-apis-device-classification-download-index-tsx",
          7831: "component---src-pages-apis-device-classification-index-tsx",
          7837: "component---src-pages-apis-device-covid-19-serology-download-index-tsx",
          7854: "component---src-pages-data-adae-index-tsx",
          7908: "component---src-pages-apis-other-nsde-understanding-the-api-results-index-tsx",
          7956: "component---src-pages-apis-device-index-tsx",
          7998: "component---src-pages-apis-food-index-tsx",
          8005: "f62f68d49d0cf54a11236f1d7787a77059f2ee64",
          8021: "component---src-pages-apis-device-pma-index-tsx",
          8131: "79f1d5d424f9bfaba04a28650991782532d03b40",
          8136: "component---src-pages-about-updates-2015-05-11-an-open-challenge-to-tap-public-data-index-tsx",
          8138: "component---src-pages-apis-device-event-understanding-the-api-results-index-tsx",
          8203: "component---src-pages-apis-drug-drugsfda-index-tsx",
          8231: "component---src-pages-apis-device-event-index-tsx",
          8247: "component---src-pages-apis-research-tobaccosmokefree-understanding-the-api-results-index-tsx",
          8254: "component---src-pages-apis-device-covid-19-serology-explore-the-api-with-an-interactive-chart-index-tsx",
          8265: "a360f681af74c1a11e9aa4ba042e3cfe0ba894a0",
          8273: "component---src-pages-apis-research-tobaccoharmmenthol-example-api-queries-index-tsx",
          8280: "component---src-pages-apis-device-pma-searchable-fields-index-tsx",
          8308: "component---src-pages-apis-device-pma-example-api-queries-index-tsx",
          8384: "component---src-pages-apis-device-enforcement-download-index-tsx",
          8392: "component---src-pages-apis-food-event-understanding-the-api-results-index-tsx",
          8418: "44e53aed574d484a06742e803b116e7cdda3ac7d",
          8438: "component---src-pages-apis-drug-orangebook-explore-the-api-with-an-interactive-chart-index-tsx",
          8528: "component---src-pages-data-downloads-index-tsx",
          8578: "component---src-pages-apis-research-tobaccosmokefree-index-tsx",
          8676: "component---src-pages-apis-research-tobaccopreventionads-understanding-the-api-results-index-tsx",
          8689: "component---src-pages-apis-device-510-k-explore-the-api-with-an-interactive-chart-index-tsx",
          8737: "component---src-pages-apis-drug-label-index-tsx",
          8746: "component---src-pages-apis-device-udi-searchable-fields-index-tsx",
          8753: "component---src-templates-docs-markdown-tsx",
          8759: "component---src-pages-apis-drug-orangebook-understanding-the-api-results-index-tsx",
          8882: "component---src-pages-apis-query-syntax-index-tsx",
          8957: "8c4cdcb92032a4753779f5b6e406bb971707fa22",
          8974: "component---src-pages-apis-device-classification-example-api-queries-index-tsx",
          9021: "component---src-pages-apis-other-unii-download-index-tsx",
          9045: "component---src-pages-apis-research-tobaccosmokefree-download-index-tsx",
          9053: "component---src-pages-apis-device-recall-example-api-queries-index-tsx",
          9066: "component---src-pages-apis-other-unii-index-tsx",
          9093: "component---src-pages-apis-device-enforcement-explore-the-api-with-an-interactive-chart-index-tsx",
          9190: "component---src-pages-apis-drug-drugsfda-searchable-fields-index-tsx",
          9237: "component---src-pages-apis-transparency-completeresponseletters-understanding-the-api-results-index-tsx",
          9245: "component---src-pages-index-tsx",
          9264: "component---src-pages-about-updates-2018-04-20-udi-dataset-updated-index-tsx",
          9309: "component---src-pages-apis-other-nsde-index-tsx",
          9363: "component---src-pages-data-device-recall-index-tsx",
          9365: "component---src-pages-data-product-classification-index-tsx",
          9372: "component---src-pages-apis-drug-label-searchable-fields-index-tsx",
          9403: "component---src-pages-data-scientificdatasets-index-tsx",
          9528: "component---src-pages-apis-drug-enforcement-searchable-fields-index-tsx",
          9531: "component---src-pages-apis-other-substance-explore-the-api-with-an-interactive-chart-index-tsx",
          9541: "component---src-pages-data-res-index-tsx",
          9548: "component---src-pages-apis-drug-enforcement-how-to-use-the-endpoint-index-tsx",
          9549: "component---src-pages-apis-device-registrationlisting-download-index-tsx",
          9568: "4322cd96",
          9579: "component---src-pages-apis-other-unii-how-to-use-the-endpoint-index-tsx",
          9587: "efaf85659cef2730a5653d85dbde72571277f933",
          9654: "component---src-pages-apis-drug-drugsfda-how-to-use-the-endpoint-index-tsx",
          9725: "component---src-pages-community-index-tsx",
          9769: "component---src-pages-apis-cosmetic-event-example-api-queries-index-tsx",
          9771: "component---src-pages-apis-drug-drugshortages-explore-the-api-with-an-interactive-chart-index-tsx",
          9813: "component---src-pages-apis-tobacco-index-tsx",
          9838: "component---src-pages-apis-device-udi-example-api-queries-index-tsx",
          9860: "component---src-pages-data-spl-index-tsx",
          9930: "component---src-pages-apis-food-enforcement-example-api-queries-index-tsx",
          9947: "component---src-pages-apis-other-unii-searchable-fields-index-tsx",
          9977: "component---src-pages-apis-research-covidmirnaandproteomics-example-api-queries-index-tsx",
        }[e] +
        "-" +
        {
          42: "0224a379fcd0f7b42ba1",
          51: "3ab624f95f91594f5448",
          62: "152de40faee34f014c3a",
          81: "ee470437e8a6c80f7afb",
          98: "b84823c4df0050e1f6c5",
          119: "efffcad56e5bd4b88b13",
          183: "1daead3cc50201afc33d",
          235: "51917a94a00a14666037",
          238: "33fad6d89fb0b5106cdc",
          240: "0fa15ba0528ef90e0e45",
          336: "46d41ad898a73eee97f0",
          371: "e26c407ad34d4895c5e0",
          375: "5d7e698293375fe2a354",
          396: "3ee53b746330bd8f0233",
          397: "58717cfd0e40b2a984ea",
          440: "055526bedb71a290257a",
          485: "0aef09db25317e287de5",
          585: "6a9f76604415be439fdf",
          596: "fdaa2917e49a9587e743",
          620: "a4e86896056b1657f51b",
          623: "713bee74a72cefc317a4",
          624: "0e384a094cf7b46effa3",
          643: "1cec0eb936ce8c8ddfcd",
          667: "39003165b008ba368e24",
          669: "8902a54f5627a5048d5d",
          671: "7ebb7a0de3289b220f41",
          731: "54f09ea3f3f5471fba97",
          778: "a01eaf878e479c1d58e3",
          800: "9e7aad33ccedf96dc0bd",
          827: "26b3b659c8d75f573461",
          855: "9b1fb89d38805566496f",
          878: "b65838bebab4be2148f6",
          899: "69bddc89602db9b46c84",
          943: "076618119aee33a07fa7",
          971: "7a65cca2f9c7bcb29323",
          997: "46c4b7c0df583f28577e",
          1014: "6c5f258e34eb74d2de4c",
          1019: "73737f97aceb471b5c08",
          1046: "e7b0e19df8bac3f18778",
          1056: "11ad9bdf3ab08fbb8cc4",
          1066: "9b5b847634c6e0f838d9",
          1089: "75da13a7355f89522a40",
          1148: "cf36212f4f95d83e9aa2",
          1152: "c126a4b6542a3e26104c",
          1153: "6923ee212db794bd1c42",
          1156: "46e44f1bdbc7eb021516",
          1170: "7f07e3eeb234ce74ec22",
          1196: "24844ad863f7f063117d",
          1207: "96372d1c8640c2d96c68",
          1283: "c86e0898d1d0975da69f",
          1320: "17b9250d911c8589b316",
          1342: "322444ec62d92bc30db0",
          1363: "7d73607057f8f131c355",
          1429: "2c9ec616ab904c3935ef",
          1453: "7aa601683bab64b68a82",
          1485: "b6de793565ab05a1e911",
          1515: "c3ff0d189e88fae32ae2",
          1535: "10fd85f0bb76fab2db09",
          1564: "77bccfb80288036be545",
          1577: "f85cf00754c35ad3e210",
          1582: "7ce1be15a44b880e9080",
          1584: "e66bc008db66f71b7f67",
          1591: "bde222d75bef67f63971",
          1593: "c45adf5321c0d4ad87af",
          1622: "c1c037b8d6d4b259b518",
          1687: "d8412f39877f6736d457",
          1690: "59acdbd50f115171bd52",
          1746: "9018d75d65d3d01ed2a6",
          1755: "36401e525a52903be101",
          1766: "e195008057b49818074f",
          1812: "8898c27c86cd30208da4",
          1818: "ba6ba89907232358a700",
          1821: "c9e941f7e3fc56be63e4",
          1851: "3e4c423c86b9bc9372a0",
          1866: "8502a622f79f72aa280b",
          1898: "96e40197c591a39f31eb",
          1907: "7a16ebfe847746bd1ffe",
          1953: "8534d9f167d9b1c12dc8",
          1985: "a8e5cdb1f4d354b63126",
          2083: "97d6bb0350a1d984d3b9",
          2140: "5124e2662705bdcdd33a",
          2178: "58a812abd73fd44c184d",
          2257: "935a77a9633ecfbae559",
          2324: "44f7d806bd4e78afc406",
          2346: "b9e8608fa91d15ca77a1",
          2347: "18caea479e8637e1f3cd",
          2411: "709542976333339166d5",
          2417: "7ffb54e53d99abe7aaf4",
          2430: "f6ab6a4af5a23cccad4a",
          2437: "3db18855544e1e4e1bb4",
          2460: "411d5f07ce4ab8ee2aaf",
          2527: "1eadb19b1c94099b961a",
          2540: "97163c6d0da7ec277792",
          2628: "f12484fc182b15e4d202",
          2704: "ce8073604de2e3b1caf6",
          2737: "44b1a02c4f705a96bcbc",
          2763: "65edffe4a46afe34d436",
          2780: "68f98f3cf3e7598afbf7",
          2798: "9d111400e0aabb40ed86",
          2829: "a123cb84991d3fe74370",
          2834: "b04cbfb77eb4a7e451a5",
          2845: "96d446a4b1f431f52339",
          2883: "7c259c0f62d1453e36b5",
          2912: "b246b7953c29949f1ac9",
          2953: "a57dbe0c74f808bb7ebb",
          3034: "ca3b4384dff637872cf8",
          3036: "09a78c1862ccfd020fbf",
          3052: "edf8bc64f7328f1faacd",
          3071: "1c5ef28158884205ed09",
          3095: "a37007c8ad75b3473bf6",
          3118: "a345688a44ad7df8deed",
          3123: "b02e3ca9e861b4f90c5d",
          3139: "8050ac999dc4b51b82cd",
          3155: "4152a67629d28912bc36",
          3171: "5e60c203f7c66467798a",
          3253: "8d9fc3a8c150c022ebb2",
          3291: "47c4bbe995882468c23f",
          3363: "1e0a48e1958efe5b6fa7",
          3396: "d68165e921a96c5064f0",
          3454: "49ca4934b534a986cd45",
          3461: "60068efe5530568a5449",
          3470: "054a3f2b95a44aefa4ba",
          3510: "d27e162a6d9541ee750c",
          3514: "acf5052477dd08ce4ee0",
          3517: "a65e1f002ad30b95be64",
          3523: "2a09546ac3b2d9aaec2f",
          3536: "9182f3d52245ad185daf",
          3602: "e72a5a2a1c3ea69a0477",
          3609: "91191e1a735640362a4d",
          3662: "2b183ea20b6b7c1b587c",
          3676: "ffd1c4fee44902ae4b38",
          3700: "98a227a46fc5df081da1",
          3703: "843a5f9d8a596dffc709",
          3728: "0d8c238d81e7e670ae0c",
          3789: "81242e7da87aaea8be35",
          3832: "0056d1931267959a333a",
          3964: "ebc99d7cda8dc74539f2",
          3994: "20eafd1db3336e7a3a02",
          4109: "dc78ee1ed52ccf93ca5b",
          4132: "3c67d87e73ed1afafc55",
          4150: "b1a38d3207c9c4547f02",
          4178: "82608b15f5aad1dba25a",
          4222: "4911cbb2b0b88439145c",
          4251: "51ac712f6e45afdc3e9f",
          4274: "d30383614b4c55f24dea",
          4278: "0f001e863b6a1f2cb721",
          4311: "858390308a67ec40357e",
          4424: "693b2c6e77d5c5942e73",
          4436: "a3445e78c15fc6b82078",
          4481: "2c2d8ef7ddaa55d8c739",
          4490: "bc50d8357f02c8b101fc",
          4521: "c9fe638662b46b938ba9",
          4555: "5a7f932209874cc192b9",
          4612: "9627244b5be544fc66d1",
          4613: "1dd9f40f77a5add62775",
          4639: "6cd94ee43be13c8388f3",
          4661: "034b60cac95cba5bebd0",
          4672: "7cfc91f7b019841d4d92",
          4680: "d0e722bc3d196d35ca30",
          4736: "0c6e3e26f50d092cece3",
          4791: "8863f265d1273f41c01a",
          4795: "2f325701cc9b7b2e6c98",
          4816: "d90f060a27b8762e3e0c",
          4837: "df72b3571b5ae8c28445",
          4894: "669f8f93acc2a57ef761",
          4911: "3bddda96859866f3cce9",
          4922: "41a5d989067ffe9e3e11",
          4941: "33676bfd54d18ed9188b",
          5045: "db865fac5becbe8edeaf",
          5097: "59fcd6fa46d6a301e8d1",
          5110: "130f9f5f5c8c6db418c2",
          5114: "6c7cbedd0252cf7e56ed",
          5120: "0b8b0ca01f251b5c999c",
          5128: "4a580432bf7f2701db9b",
          5158: "46b136108233ac425bd2",
          5165: "9051baa265c8c1df67a2",
          5231: "df7094b13aadd7d6237f",
          5322: "59d7fd271db60b84c1b6",
          5352: "37922c8cdb190cadbe6a",
          5387: "de2bd957553139c5b772",
          5452: "a0e65f4b0e834234bba3",
          5514: "c2783d2dcb9b788467ce",
          5524: "bc019b9c66bcfb9248db",
          5533: "60d426c5ce020e6cda5e",
          5550: "a0df2c105acfedfdedd3",
          5588: "a4058ca53440e2486963",
          5646: "288bd18578481a0a417f",
          5670: "d1ff894236aa6a511dba",
          5688: "a7b9eed6e82c84292fb0",
          5708: "d6030f725a0dca0c017b",
          5716: "3770de293ecd324c2180",
          5735: "5b88e3a285b9db699254",
          5829: "436b072424c9626cc7ed",
          5845: "95e580291aafb4e0927b",
          5880: "25c5d781b57a4b975113",
          5888: "3dd30eb4360689c8210e",
          5909: "9b97d40a4b062fde1cad",
          5955: "9540aa4df7e964bad783",
          6053: "67060cbef7c5d70ae18b",
          6056: "32c194e6bf32d3fe7703",
          6090: "2bf36cb7979f0292b964",
          6138: "a8fcd16e3a9cf211035d",
          6172: "ffa7d82c0b7ced23c439",
          6194: "5d92b04e34cd7f1247b0",
          6208: "5ec3fa6ed989a15d03c5",
          6232: "1cf8d46fdb7fac80bbdd",
          6295: "02f8446f1b49cb436306",
          6384: "cadbc642311de21c9e26",
          6417: "076a4b23f26b6b4b8e7e",
          6441: "d8abdd7408721f993d48",
          6444: "4fd300dc6174450f9690",
          6529: "df7996b481768e92c525",
          6589: "f2790e82ec380855b62d",
          6638: "589c262e0f47ea298b32",
          6648: "630177ca5adf227e3bf9",
          6746: "6bc0fb510e4f130b795e",
          6882: "31cb15aef72e0269237a",
          6906: "4df25f25d0c032253710",
          6948: "1d45325f3fdcbdcb35d1",
          6954: "3763e89c6dbddf6db880",
          6970: "6460ad3b6fc9053acbee",
          6998: "cb08540e4832524951b2",
          7034: "842c774d65e57540ebdc",
          7085: "763d3ffd394a4fb3331f",
          7103: "ba9f5fae0b4c51695ca1",
          7114: "59088cba57adeb551a35",
          7147: "2ff8539b1d3b5811eef6",
          7158: "2da08934c307a4ee57fe",
          7207: "774f1d8a20c950fa1342",
          7228: "48afbc5d3f5411b9ff20",
          7273: "b3575dced6c1b11604c2",
          7282: "70a88c95329fce0c580d",
          7291: "df1a5e1989ce69c9ab24",
          7296: "6a0caf6d3e5fb4e86ec3",
          7354: "1b9873649e2312957a43",
          7386: "ea2d234e539e3f0e7e0e",
          7399: "57738627495c6403a655",
          7401: "d9dbf544833a7febfae3",
          7450: "b32a477afcd01aed9205",
          7503: "0f866c7476d62cc6daa9",
          7532: "ff02ab19f1ccfbe5b53b",
          7582: "9951171db288c5f311f6",
          7645: "d1b7525aff1ba6deca77",
          7760: "ec5c564e37d026290809",
          7773: "bb2ed4720138d97a7565",
          7786: "41bfdeeb4124d72b6c1a",
          7831: "bf8208a5d9f647dd4f3c",
          7837: "909ac528b2630470dfae",
          7854: "f7d147298028089513c6",
          7908: "67650c7773f7769b3e5a",
          7956: "6f5d9e1b2b18fd2f6a92",
          7998: "1b9710abb7a9c0a094b1",
          8005: "93e32193a2ddf697b952",
          8021: "2c58eb38ba4c7324f9c1",
          8131: "674962067b3312fd06d0",
          8136: "86e2369c4963d668d632",
          8138: "321cd701e45586a2b235",
          8203: "f7e751163082fe736b98",
          8231: "e438fee5cb9c73b585cf",
          8247: "2eda0aad37210e2cb32c",
          8254: "44aed2c932ba80937859",
          8265: "d211511f2a509c11cd30",
          8273: "69e1247c40b05e730843",
          8280: "eaeebb7c37244151cc87",
          8308: "3e272f61a59160224a9e",
          8384: "c19f25921857625988f8",
          8392: "80f0c0c4ad5dc22ab912",
          8418: "5ab9c7baeafa327aba49",
          8438: "7f09ca47182d0089755a",
          8528: "9b15370a341cb904f970",
          8578: "61ad49f10d7da93cbd4e",
          8676: "58f23cff29d975b81209",
          8689: "d9c4e2af2f11593ac292",
          8737: "2ceff9e821835b0be8b2",
          8746: "8f505829e54835fef89f",
          8753: "409e3d6eae4ff9f46c9b",
          8759: "f9278e32f309f16700ee",
          8882: "d4f37e19be55a43b93cf",
          8957: "f5f6f730a8f23d0a71d3",
          8974: "ffa08a8e92a54fa05029",
          9021: "18885626c2c910064b3d",
          9045: "5244d4c8a5a156e2d161",
          9053: "933fc0690b12ba722796",
          9066: "63b323ed18b342f84a36",
          9093: "c55a6686c2231a598c84",
          9190: "937a1b41bded1f92a116",
          9237: "1f72b5405e7c893405e1",
          9245: "fa6bf49f7563670f3125",
          9264: "2e4e007658cbf86f6bfe",
          9309: "bca5af4d2f0dcb4942b0",
          9363: "210932896ddbc1b88d69",
          9365: "931e6bc9a9482728b3fd",
          9372: "1abc2a75ec7384c73dec",
          9403: "4828012452f46ca999d6",
          9528: "78130cafe541c2ab57fa",
          9531: "7618cf5bfb919401e753",
          9541: "7bc88d807bc9dee94523",
          9548: "12b66ee2dcfe7c7ece5e",
          9549: "266dab1a4821ac2d0f79",
          9568: "a845c288f435f3f2ef39",
          9579: "dc4881dc41351df57170",
          9587: "0d934ee29a99d8523612",
          9654: "70a18a9cfeae52ca0b2f",
          9725: "6d5b3b7881928ba0b8a3",
          9769: "fce5d64731428d7026a5",
          9771: "78777b3f3673d22ce586",
          9813: "1bd8ca5c02c4abfdd7b9",
          9838: "6e66d03e75a67f0f9824",
          9860: "041405284d87f20c5888",
          9930: "d6e2983e9f5150216570",
          9947: "b07cc24850634afd82a5",
          9977: "b769ca30d6e80f7ef2e8",
        }[e] +
        ".js"
      );
    }),
    (o.miniCssF = function (e) {
      return "styles.b6dea51e86868c77fd0e.css";
    }),
    (o.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" == typeof window) return window;
      }
    })()),
    (o.hmd = function (e) {
      return (
        (e = Object.create(e)).children || (e.children = []),
        Object.defineProperty(e, "exports", {
          enumerable: !0,
          set: function () {
            throw new Error(
              "ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: " +
                e.id,
            );
          },
        }),
        e
      );
    }),
    (o.o = function (e, a) {
      return Object.prototype.hasOwnProperty.call(e, a);
    }),
    (n = {}),
    (c = "open-fda-gov:"),
    (o.l = function (e, a, s, t) {
      if (n[e]) n[e].push(a);
      else {
        var d, i;
        if (void 0 !== s)
          for (
            var p = document.getElementsByTagName("script"), r = 0;
            r < p.length;
            r++
          ) {
            var f = p[r];
            if (
              f.getAttribute("src") == e ||
              f.getAttribute("data-webpack") == c + s
            ) {
              d = f;
              break;
            }
          }
        (d ||
          ((i = !0),
          ((d = document.createElement("script")).charset = "utf-8"),
          (d.timeout = 120),
          o.nc && d.setAttribute("nonce", o.nc),
          d.setAttribute("data-webpack", c + s),
          (d.src = e)),
          (n[e] = [a]));
        var x = function (a, s) {
            ((d.onerror = d.onload = null), clearTimeout(b));
            var c = n[e];
            if (
              (delete n[e],
              d.parentNode && d.parentNode.removeChild(d),
              c &&
                c.forEach(function (e) {
                  return e(s);
                }),
              a)
            )
              return a(s);
          },
          b = setTimeout(
            x.bind(null, void 0, { type: "timeout", target: d }),
            12e4,
          );
        ((d.onerror = x.bind(null, d.onerror)),
          (d.onload = x.bind(null, d.onload)),
          i && document.head.appendChild(d));
      }
    }),
    (o.r = function (e) {
      ("undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 }));
    }),
    (o.nmd = function (e) {
      return ((e.paths = []), e.children || (e.children = []), e);
    }),
    (o.p = "/"),
    (function () {
      var e = { 7311: 0, 1869: 0 };
      ((o.f.j = function (a, s) {
        var n = o.o(e, a) ? e[a] : void 0;
        if (0 !== n)
          if (n) s.push(n[2]);
          else if (/^(1869|7311)$/.test(a)) e[a] = 0;
          else {
            var c = new Promise(function (s, c) {
              n = e[a] = [s, c];
            });
            s.push((n[2] = c));
            var t = o.p + o.u(a),
              d = new Error();
            o.l(
              t,
              function (s) {
                if (o.o(e, a) && (0 !== (n = e[a]) && (e[a] = void 0), n)) {
                  var c = s && ("load" === s.type ? "missing" : s.type),
                    t = s && s.target && s.target.src;
                  ((d.message =
                    "Loading chunk " + a + " failed.\n(" + c + ": " + t + ")"),
                    (d.name = "ChunkLoadError"),
                    (d.type = c),
                    (d.request = t),
                    n[1](d));
                }
              },
              "chunk-" + a,
              a,
            );
          }
      }),
        (o.O.j = function (a) {
          return 0 === e[a];
        }));
      var a = function (a, s) {
          var n,
            c,
            t = s[0],
            d = s[1],
            i = s[2],
            p = 0;
          if (
            t.some(function (a) {
              return 0 !== e[a];
            })
          ) {
            for (n in d) o.o(d, n) && (o.m[n] = d[n]);
            if (i) var r = i(o);
          }
          for (a && a(s); p < t.length; p++)
            ((c = t[p]), o.o(e, c) && e[c] && e[c][0](), (e[c] = 0));
          return o.O(r);
        },
        s = (self.webpackChunkopen_fda_gov =
          self.webpackChunkopen_fda_gov || []);
      (s.forEach(a.bind(null, 0)), (s.push = a.bind(null, s.push.bind(s))));
    })(),
    (o.nc = void 0));
})();
//# sourceMappingURL=webpack-runtime-096e3806956326510c83.js.map
