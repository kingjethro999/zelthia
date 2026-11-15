"use strict";
(self.webpackChunkopen_fda_gov = self.webpackChunkopen_fda_gov || []).push([
  [9190],
  {
    3256: function (e) {
      e.exports = JSON.parse(
        '{"properties":{"application_number":{"pattern":"^[BLA|ANDA|NDA]{3,4}[0-9]{6}$","description":"This corresponds to the NDA, ANDA, or BLA number reported by the labeler for products which have the corresponding Marketing Category designated. If the designated Marketing Category is OTC Monograph Final or OTC Monograph Not Final, then the application number will be the CFR citation corresponding to the appropriate Monograph (e.g. “part 341”). For unapproved drugs, this field will be null.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"openfda":{"type":"object","properties":{"application_number":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[BLA|ANDA|NDA]{3,4}[0-9]{6}$","description":"This corresponds to the NDA, ANDA, or BLA number reported by the labeler for products which have the corresponding Marketing Category designated. If the designated Marketing Category is OTC Monograph Final or OTC Monograph Not Final, then the application number will be the CFR citation corresponding to the appropriate Monograph (e.g. “part 341”). For unapproved drugs, this field will be null.","possible_values":null}},"brand_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Brand or trade name of the drug product.","possible_values":null}},"generic_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Generic name(s) of the drug product.","possible_values":null}},"manufacturer_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Name of manufacturer or company that makes this drug product, corresponding to the labeler code segment of the NDC.","possible_values":null}},"nui":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[N][0-9]{10}$","description":"Unique identifier applied to a drug concept within the National Drug File Reference Terminology (NDF-RT).","possible_values":{"type":"reference","value":{"name":"NDF-RT","link":"https://www.nlm.nih.gov/research/umls/sourcereleasedocs/current/NDFRT/"}}}},"package_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}-[0-9]{1,2}$","description":"This number, known as the NDC, identifies the labeler, product, and trade package size. The first segment, the labeler code, is assigned by the FDA. A labeler is any firm that manufactures (including repackers or relabelers), or distributes (under its own name) the drug.","possible_values":null}},"pharm_class_cs":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Chemical structure classification of the drug product’s pharmacologic class. Takes the form of the classification, followed by `[Chemical/Ingredient]` (such as `Thiazides [Chemical/Ingredient]` or `Antibodies, Monoclonal [Chemical/Ingredient].","possible_values":null}},"pharm_class_epc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Established pharmacologic class associated with an approved indication of an active moiety (generic drug) that the FDA has determined to be scientifically valid and clinically meaningful. Takes the form of the pharmacologic class, followed by `[EPC]` (such as `Thiazide Diuretic [EPC]` or `Tumor Necrosis Factor Blocker [EPC]`.","possible_values":null}},"pharm_class_pe":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Physiologic effect or pharmacodynamic effect—tissue, organ, or organ system level functional activity—of the drug’s established pharmacologic class. Takes the form of the effect, followed by `[PE]` (such as `Increased Diuresis [PE]` or `Decreased Cytokine Activity [PE]`.","possible_values":null}},"pharm_class_moa":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Mechanism of action of the drug—molecular, subcellular, or cellular functional activity—of the drug’s established pharmacologic class. Takes the form of the mechanism of action, followed by `[MoA]` (such as `Calcium Channel Antagonists [MoA]` or `Tumor Necrosis Factor Receptor Blocking Activity [MoA]`.","possible_values":null}},"product_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}$","description":"The labeler manufacturer code and product code segments of the NDC number, separated by a hyphen.","possible_values":null}},"route":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"The route of administation of the drug product.","possible_values":{"type":"reference","value":{"name":"Route of administration","link":"http://www.fda.gov/ForIndustry/DataStandards/StructuredProductLabeling/ucm162034.htm"}}}},"rxcui":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{6}$","description":"The RxNorm Concept Unique Identifier. RxCUI is a unique number that describes a semantic concept about the drug product, including its ingredients, strength, and dose forms.","possible_values":{"type":"reference","value":{"name":"RxNorm and RxCUI documentation","link":"https://www.nlm.nih.gov/research/umls/rxnorm/docs/2012/rxnorm_doco_full_2012-3.html"}}}},"spl_id":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for a particular version of a Structured Product Label for a product. Also referred to as the document ID.","possible_values":null}},"spl_set_id":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for the Structured Product Label for a product, which is stable across versions of the label. Also referred to as the set ID.","possible_values":null}},"substance_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"The list of active ingredients of a drug product.","possible_values":null}},"unii":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[A-Z0-9]{10}$","description":"Unique Ingredient Identifier, which is a non-proprietary, free, unique, unambiguous, non-semantic, alphanumeric identifier based on a substance’s molecular structure and/or descriptive information.","possible_values":{"type":"reference","value":{"name":"Unique Ingredient Identifiers","link":"http://fdasis.nlm.nih.gov/srs/srs.jsp"}}}}}},"products":{"type":"object","description":"Information about the drug products.","properties":{"active_ingredients":{"type":"object","properties":{"name":{"description":"The names of the active, medicinal ingredients in the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"strength":{"description":"The strength of the active, medicinal ingredients in the drug product.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"brand_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Brand or trade name of the drug product.","possible_values":null}},"dosage_form":{"description":"The drug’s dosage form. There is no standard, but values may include terms like `tablet` or `solution for injection`.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"marketing_status":{"description":"Indicates how a drug product is sold in the United States.","format":null,"is_exact":false,"type":"string","possible_values":{"type":"one_of","value":{"1":"Prescription","2":"Discontinued","3":"None (Tentative Approval)","4":"Over-the-counter"}}},"product_number":{"description":"A product number is assigned to each drug product associated with an NDA (New Drug Application), ANDA (Abbreviated New Drug Application) and Biologic License Application (BLA) .  If a drug product is available in multiple strengths, there are multiple product numbers.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"reference_drug":{"description":"Indicates whether the drug product is a reference drug.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"reference_standard":{"description":"Indicates whether the drug product is a reference standard.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"route":{"description":"The route of administation of the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"te_code":{"description":"The coding system for therapeutic equivalence evaluations allows users to determine whether FDA has evaluated a particular approved product as therapeutically equivalent to other pharmaceutically equivalent products (first letter) and to provide additional information on the basis of FDA\'s evaluations (second letter).","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"sponsor_name":{"description":"The company that submitted an application to FDA for approval to market the drug product in the United States.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"submissions":{"type":"object","description":"Submissions are used to group supporting documents relative to an application. A submission belongs to only one specific application. There must be at least one submission for each application.","properties":{"submission_property_type":{"type":"array","items":{"code":{"description":"The code indicating the submission property type.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"application_docs":{"type":"array","items":{"id":{"description":"The id of the applications document.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"date":{"description":"The date of publication of the applications document.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"title":{"description":"The title of the applications document.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":{"description":"The type of the applications document.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"url":{"description":"The url to access the applications document.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"review_priority":{"description":"Pending.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_class_code":{"description":"The Submission Classification Code, previously known as the Chemistry Classification Code, is assigned as a “Type” code.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_class_code_description":{"description":"The Submission Classification Code, previously known as the Chemistry Classification Code, is assigned as a “Type” code. This is a full description of the classification code.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_number":{"description":"A unique identifier for each submission under that application.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_public_notes":{"description":"Publicly available notes regarding the submission.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_status":{"description":"The current status of this submission.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_status_date":{"description":"The date the status was applied to the submission.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"submission_type":{"description":"The type of the individual submission. Used in combination with submission_number.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}}},"type":"object"}',
      );
    },
    4557: function (e, t, i) {
      i.r(t);
      var r = i(96540),
        s = i(41359),
        n = i(31381),
        a = i(3256);
      function o(e) {
        return (
          (o =
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
          o(e)
        );
      }
      function l(e, t) {
        for (var i = 0; i < t.length; i++) {
          var r = t[i];
          ((r.enumerable = r.enumerable || !1),
            (r.configurable = !0),
            "value" in r && (r.writable = !0),
            Object.defineProperty(e, u(r.key), r));
        }
      }
      function u(e) {
        var t = (function (e, t) {
          if ("object" != o(e) || !e) return e;
          var i = e[Symbol.toPrimitive];
          if (void 0 !== i) {
            var r = i.call(e, t || "default");
            if ("object" != o(r)) return r;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === t ? String : Number)(e);
        })(e, "string");
        return "symbol" == o(t) ? t : t + "";
      }
      function c(e, t, i) {
        return (
          (t = d(t)),
          (function (e, t) {
            if (t && ("object" == o(t) || "function" == typeof t)) return t;
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
            p()
              ? Reflect.construct(t, i || [], d(e).constructor)
              : t.apply(e, i),
          )
        );
      }
      function p() {
        try {
          var e = !Boolean.prototype.valueOf.call(
            Reflect.construct(Boolean, [], function () {}),
          );
        } catch (e) {}
        return (p = function () {
          return !!e;
        })();
      }
      function d(e) {
        return (
          (d = Object.setPrototypeOf
            ? Object.getPrototypeOf.bind()
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              }),
          d(e)
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
            c(this, t, arguments)
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
          (i = t),
          (o = [
            {
              key: "render",
              value: function () {
                return r.createElement(
                  "section",
                  { className: "doc-content" },
                  r.createElement("h2", null, "Searchable Fields"),
                  r.createElement(
                    "p",
                    null,
                    "Use the fields explorer below to find detailed explanations of every field in the dataset.",
                  ),
                  r.createElement(s.A, { fields: a, meta: n }),
                );
              },
            },
          ]) && l(i.prototype, o),
          u && l(i, u),
          Object.defineProperty(i, "prototype", { writable: !1 }),
          i
        );
        var i, o, u;
      })(r.Component);
      t.default = m;
    },
    31381: function (e) {
      e.exports = JSON.parse(
        '{"documentTitle":"openFDA › Drugs › Drugs@FDA","label":"Drugs@FDA","title":"Drugs@FDA","description":"Drugs@FDA includes most of the drug products approved since 1939. The majority of patient information, labels, approval letters, reviews, and other information are available for drug products approved since 1998.","datasets":["drugsfda"],"path":"/apis/drug/drugsfda","api_path":"/drug/drugsfda","start":19390101,"status":"drugsfda","dateConstraintKey":"submission_status_date","type":"endpoint"}',
      );
    },
  },
]);
//# sourceMappingURL=component---src-pages-apis-drug-drugsfda-searchable-fields-index-tsx-937a1b41bded1f92a116.js.map
